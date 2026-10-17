import { recordPlay, ApiError } from './api'
import { applyEvent, eventKind, type PlayEvent } from '../../shared/play-events.mjs'

/**
 * 孩子端的紀錄先排進瀏覽器的佇列、畫面先動，再依序送給伺服器；離線時留著，連上線再補送。
 * 紀錄有哪幾種、怎麼套用，在 shared/play-events.mjs（伺服器用同一張表）。
 */
export { applyEvent, type PlayEvent }

// 沿用舊的 key：升級前還沒送出的觀看紀錄（沒有 kind）照樣當觀看送出
const KEY = 'character-play-pending-watches'

let memory: PlayEvent[] | undefined
export function pendingEvents(): PlayEvent[] {
  if (memory) return memory
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (Array.isArray(saved)) return saved
  } catch { /* Restricted storage must not interrupt playback. */ }
  return []
}
function save(events: PlayEvent[]) {
  memory = events
  try { localStorage.setItem(KEY, JSON.stringify(events)); memory = undefined } catch { /* Keep in memory and retry the API. */ }
}
export function queueEvent(event: PlayEvent) {
  const events = pendingEvents()
  if (!events.some((e) => e.id === event.id)) save([...events, event])
}
let flushing: Promise<void> | undefined
export function flushEvents(): Promise<void> {
  if (flushing) return flushing
  flushing = (async () => {
    while (pendingEvents().length) {
      const event = pendingEvents()[0]
      const { kind: _kind, ...body } = event
      try {
        await recordPlay(eventKind(event), body)
      } catch (error) {
        // 422：伺服器永遠不會收這筆（例如字已經被家長刪掉），留著只會擋住後面的紀錄
        if (!(error instanceof ApiError && error.status === 422)) throw error
        console.warn('丟掉伺服器不收的紀錄', body, error.message)
      }
      save(pendingEvents().filter((e) => e.id !== body.id))
    }
  })().finally(() => { flushing = undefined })
  return flushing
}
