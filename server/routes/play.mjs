import { fail } from '../http.mjs'
import { completeWatch, addTrace, discover, validStrokes } from '../../shared/domain.mjs'
import { loadCharacters, loadProgress, saveProgress } from '../core.mjs'

/**
 * 孩子端的紀錄：觀看、描字搬進小鎮、魔法鍋發現。
 * 都帶事件編號，離線重送不會重複算；新的紀錄種類在這張表加一行就好。
 * 內容本身不收（字已刪除、格式不對、編號被別的字用過）回 422：孩子端看到 422 就丟掉這筆，
 * 不然它會永遠卡在佇列最前面，後面的紀錄全送不出去。其他錯誤照舊，孩子端會留著重送。
 */
const EVENTS = {
  '/watch': { error: '觀看紀錄不正確', apply: (p, body) => completeWatch(p, body.char, body.at) },
  '/trace': { error: '描字紀錄不正確', valid: (body) => validStrokes(body.strokes),
    apply: (p, body) => addTrace(p, body.char, body.strokes, body.at) },
  '/discover': { error: '發現紀錄不正確', apply: (p, body) => discover(p, body.char, body.at) },
}

const recordEvent = (event) => ({ body }) => {
  const { char, id, at } = body
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(id) ||
    typeof at !== 'string' || !Number.isFinite(Date.parse(at)) || Date.parse(at) > Date.now() + 60000 ||
    (event.valid && !event.valid(body)) ||
    !loadCharacters().characters.some((c) => c.char === char)) fail(422, event.error)
  const current = loadProgress()
  if (current.completedEvents?.[id]) {
    if (current.completedEvents[id] !== char) fail(422, '紀錄編號已使用')
    return current
  }
  const next = event.apply(current, body)
  next.completedEvents = { ...current.completedEvents, [id]: char }
  saveProgress(next)
  return next
}

export const playRoutes = Object.fromEntries(Object.entries(EVENTS).map(([route, event]) => [`POST ${route}`, recordEvent(event)]))
