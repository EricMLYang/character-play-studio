import { taiwanDay } from './domain.mjs'
import { recordEvent, validEventId } from './play-events.mjs'

/**
 * iPad 單機版匯出的紀錄檔：整份進度（iPad 換 App、誤刪時整份還原）＋安裝以來的每一筆事件
 * （Mac 匯入時只補還沒收過的那幾筆，規則跟伺服器收紀錄同一套）。
 *
 * 事件帶 seq：同一台裝置上從 1 一直往上加。Mac 記得每台裝置收到第幾筆，
 * 同一份檔匯入兩次、或下次匯出的檔包含上次那些，都不會重複算。
 */
export const EXPORT_TYPE = 'cps-progress'
export const EXPORT_VERSION = 1

export const validDeviceId = (id) => typeof id === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(id)

/** 檔案像不像一份匯出的紀錄；不像就回錯誤訊息（給家長看的） */
export function checkExport(data) {
  if (!data || typeof data !== 'object' || data.type !== EXPORT_TYPE) return '這不是字字樂園匯出的紀錄檔'
  if (data.version !== EXPORT_VERSION) return '紀錄檔的版本不認得，請先更新'
  if (!validDeviceId(data.deviceId)) return '紀錄檔缺少裝置編號'
  if (!data.progress || typeof data.progress !== 'object' || typeof data.progress.watched !== 'object') return '紀錄檔裡沒有進度'
  if (!Array.isArray(data.events) || !data.events.every((e) => Number.isInteger(e?.seq) && e.seq > 0 && validEventId(e.id))) return '紀錄檔裡的事件格式不對'
  return ''
}

/**
 * 把匯出檔裡 seq 大於 lastSeq 的事件依序存進 progress（Mac 匯入用）。
 * 字已經不在字庫、格式不收的那幾筆略過（skipped），跟伺服器回 422 丟掉是同一件事。
 */
export function mergeExport(progress, data, lastSeq = 0, isKnown, today = taiwanDay(), now = Date.now()) {
  let next = progress
  let added = 0
  let skipped = 0
  let seq = lastSeq
  for (const event of [...data.events].sort((a, b) => a.seq - b.seq)) {
    if (event.seq <= lastSeq) continue
    const { seq: eventSeq, kind, ...body } = event
    const result = recordEvent(next, kind || 'watch', body, isKnown, today, now)
    if (result.error) skipped++
    else {
      next = result.progress
      if (result.added) added++
    }
    seq = Math.max(seq, eventSeq)
  }
  return { progress: next, lastSeq: seq, added, skipped }
}
