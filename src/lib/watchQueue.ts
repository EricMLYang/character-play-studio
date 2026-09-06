import { recordWatch } from './api'

const KEY = 'character-play-pending-watches'
export type WatchEvent = { char: string; id: string; at: string }
let memory: WatchEvent[] | undefined
export function pendingWatches(): WatchEvent[] {
  if (memory) return memory
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (Array.isArray(saved)) return saved
  } catch { /* Restricted storage must not interrupt playback. */ }
  return []
}
function save(events: WatchEvent[]) {
  memory = events
  try { localStorage.setItem(KEY, JSON.stringify(events)); memory = undefined } catch { /* Keep in memory and retry the API. */ }
}
export function queueWatch(event: WatchEvent) {
  const events = pendingWatches()
  if (!events.some((e) => e.id === event.id)) save([...events, event])
}
let flushing: Promise<void> | undefined
export function flushWatches(): Promise<void> {
  if (flushing) return flushing
  flushing = (async () => {
    while (pendingWatches().length) {
      const event = pendingWatches()[0]
      await recordWatch(event.char, event.id, event.at)
      save(pendingWatches().filter((e) => e.id !== event.id))
    }
  })().finally(() => { flushing = undefined })
  return flushing
}
