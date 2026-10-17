import path from 'node:path'
import { taiwanDay } from '../shared/domain.mjs'
import { PLAY_EVENTS, acceptEvent } from '../shared/play-events.mjs'
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
export const KEEP_EVENT_DAYS = 60

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

/** 收到日期早於 today 往前 KEEP_EVENT_DAYS 天的事件編號丟掉。 */
export function pruneCompleted(completed = {}, today = taiwanDay()) {
  const cutoff = Date.parse(today) - KEEP_EVENT_DAYS * 864e5
  return Object.fromEntries(Object.entries(completed).filter(([, v]) => Date.parse(v.day) >= cutoff))
}

export const loadProgress = () => migrateProgress(readJSON(FILE(), { version: PROGRESS_VERSION, watched: {} }))
export const saveProgress = (progress) => writeJSON(FILE(), progress)

/**
 * 存一筆孩子端的紀錄。內容本身不收（字已刪除、格式不對、編號被別的字用過）回 422：
 * 孩子端看到 422 就丟掉這筆，不然它會永遠卡在佇列最前面，後面的紀錄全送不出去。
 */
export function recordPlayEvent(kind, body) {
  const rule = PLAY_EVENTS[kind]
  // 只要知道字在不在：讀主字庫檔就好，不必把每個字的 prompt 版本都讀進來
  const known = characterSet()
  if (!acceptEvent(kind, body, (c) => known.has(c))) fail(422, rule?.error || '紀錄不正確')
  const current = loadProgress()
  const seen = current.completedEvents?.[body.id]
  if (seen) {
    if (seen.char !== body.char) fail(422, '紀錄編號已使用')
    return current
  }
  const today = taiwanDay()
  const next = rule.apply(current, body)
  next.completedEvents = { ...pruneCompleted(current.completedEvents, today), [body.id]: { char: body.char, day: today } }
  saveProgress(next)
  return next
}
