import { recordPlay, ApiError } from './api'
import { completeWatch, addTrace, discover } from '../../shared/domain.mjs'
import type { Progress } from '../types'

// 沿用舊的 key：升級前還沒送出的觀看紀錄（沒有 kind）照樣當觀看送出
const KEY = 'character-play-pending-watches'
export type PlayEvent =
  | { kind?: 'watch'; char: string; id: string; at: string }
  | { kind: 'trace'; char: string; id: string; at: string; strokes: number[][] }
  | { kind: 'discover'; char: string; id: string; at: string }

/** 伺服器與畫面用同一套規則套用事件，離線時畫面先動、之後再補送。 */
export function applyEvent(progress: Progress, event: PlayEvent): Progress {
  if (event.kind === 'trace') return addTrace(progress, event.char, event.strokes, event.at)
  if (event.kind === 'discover') return discover(progress, event.char, event.at)
  return completeWatch(progress, event.char, event.at)
}

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
      const { kind = 'watch', ...body } = pendingEvents()[0]
      try {
        await recordPlay(kind, body)
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
