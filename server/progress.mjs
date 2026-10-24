import path from 'node:path'
import { taiwanDay } from '../shared/domain.mjs'
import { recordEvent, pruneCompleted, KEEP_EVENT_DAYS } from '../shared/play-events.mjs'
import { checkExport, mergeExport } from '../shared/progress-export.mjs'
import { DATA, readJSON, writeJSON, characterSet } from './core.mjs'
import { fail } from './http.mjs'

/**
 * 孩子的進度：data/progress.json。
 *
 * version 2：
 * - completedEvents 記「哪個事件編號已經算過」，防離線重送重複算。以前只記字、永遠留著，
 *   檔案會跟著玩的次數一直長大；現在多記收到的日期，超過 KEEP_EVENT_DAYS 天就清掉
 *   （孩子端的佇列不會離線那麼久）。
 * - 拿掉舊版遊戲化（貼紙、每日字表）留下、早就沒人讀的 days／stickers。
 */
export const PROGRESS_VERSION = 2
export { pruneCompleted, KEEP_EVENT_DAYS }

const FILE = () => path.join(DATA, 'progress.json')

/** 舊格式 → 新格式。已經是新格式就原樣回傳；舊的事件編號當作今天收到的，60 天後自然清掉。 */
export function migrateProgress(raw, today = taiwanDay()) {
  if (raw.version === PROGRESS_VERSION) return raw
  const { days, stickers, ...progress } = raw
  const completed = {}
  for (const [id, value] of Object.entries(progress.completedEvents || {})) {
    completed[id] = typeof value === 'string' ? { char: value, day: today } : value
  }
  return { ...progress, version: PROGRESS_VERSION, watched: progress.watched || {}, completedEvents: completed }
}

export const loadProgress = () => migrateProgress(readJSON(FILE(), { version: PROGRESS_VERSION, watched: {} }))
export const saveProgress = (progress) => writeJSON(FILE(), progress)

/**
 * 存一筆孩子端的紀錄。內容本身不收（字已刪除、格式不對、編號被別的字用過）回 422：
 * 孩子端看到 422 就丟掉這筆，不然它會永遠卡在佇列最前面，後面的紀錄全送不出去。
 */
export function recordPlayEvent(kind, body) {
  // 只要知道字在不在：讀主字庫檔就好，不必把每個字的 prompt 版本都讀進來
  const known = characterSet()
  const result = recordEvent(loadProgress(), kind, body, (c) => known.has(c))
  if (result.error) fail(422, result.error)
  if (result.added) saveProgress(result.progress)
  return result.progress
}

/**
 * 匯入 iPad 單機版匯出的紀錄檔：只補那台裝置上還沒收過的事件（data/device-imports.json 記每台收到第幾筆），
 * 規則跟平常收紀錄同一套。同一份檔匯入兩次不會重複算。
 */
const IMPORTS = () => path.join(DATA, 'device-imports.json')

export function importDeviceExport(data) {
  const error = checkExport(data)
  if (error) fail(422, error)
  const imports = readJSON(IMPORTS(), {})
  const lastSeq = imports[data.deviceId]?.seq || 0
  const known = characterSet()
  const result = mergeExport(loadProgress(), data, lastSeq, (c) => known.has(c))
  if (result.added) saveProgress(result.progress)
  if (result.lastSeq > lastSeq) {
    writeJSON(IMPORTS(), { ...imports, [data.deviceId]: { seq: result.lastSeq, at: new Date().toISOString(), exportedAt: data.exportedAt } })
  }
  return { added: result.added, skipped: result.skipped, already: data.events.filter((e) => e.seq <= lastSeq).length }
}
