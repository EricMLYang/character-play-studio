import { taiwanDay, completeWatch, addTrace, discover, validStrokes, saveWord, validWord, recall, validPuzzle, solvePuzzle, validRadical, findFamily, validBook, readBook } from './domain.mjs'

/**
 * 孩子端的每一種紀錄：觀看、描字搬進小鎮、魔法鍋發現、字火車組的詞、餵怪獸、詞語拼圖。
 * 孩子端（離線時畫面先動）跟伺服器（真的存檔）都從這張表套用，規則只寫一次。
 *
 * 新遊戲要記東西：在這裡加一種，規則本身寫在 domain.mjs（純函式、好測）。
 * - error：內容不收時回給孩子端的訊息（422，孩子端會丟掉這筆）
 * - valid：額外的格式檢查（char、id、at 已經統一檢查過）
 * - chars：這筆紀錄牽涉到哪些字，每個都要在字庫裡；沒寫就是 [char]
 * - apply：(progress, event) → 新的 progress，不能改到傳進來的物件
 */
export const PLAY_EVENTS = {
  watch: { error: '觀看紀錄不正確', apply: (p, e) => completeWatch(p, e.char, e.at) },
  // blind＝遮起來憑記憶寫的（沒有這個欄位就是照著描）
  trace: { error: '描字紀錄不正確', valid: (e) => validStrokes(e.strokes) && (e.blind === undefined || typeof e.blind === 'boolean'),
    apply: (p, e) => addTrace(p, e.char, e.strokes, e.at, e.blind === true) },
  discover: { error: '發現紀錄不正確', apply: (p, e) => discover(p, e.char, e.at) },
  // char 是整個詞，每個字都要在字庫裡
  word: { error: '組詞紀錄不正確', valid: (e) => validWord(e.char), chars: (e) => [...e.char],
    apply: (p, e) => saveWord(p, e.char, e.at, e.remove === true) },
  // 餵大怪獸：這個字第一次就找對了沒有
  recall: { error: '餵怪獸紀錄不正確', valid: (e) => typeof e.ok === 'boolean', apply: (p, e) => recall(p, e.char, e.ok, e.at) },
  // 詞語拼圖：char 是他補上的字（要在字庫裡），word 是整個詞（其他字不一定在字庫裡）
  puzzle: { error: '拼圖紀錄不正確', valid: validPuzzle, apply: (p, e) => solvePuzzle(p, e.word, e.char, e.ok, e.at) },
  // 部首家族：在 family 這一家找到 char（ok 是第一下就找對）
  // 字的家族：family 是部首家、聲音家或 word-<字> 的詞家族；詞家族多帶 word（找到的那個詞）
  radical: { error: '家族紀錄不正確', valid: validRadical, apply: (p, e) => findFamily(p, e.family, e.char, e.at, e.word) },
  // 指讀小書：text 是整句，char 是他指出來的字；mine 是最後一頁自己接的
  book: { error: '小書紀錄不正確', valid: validBook, apply: (p, e) => readBook(p, e.text, e.char, e.ok, e.at, e.mine === true) },
}

/** 升級前排進佇列的觀看紀錄沒有 kind，照樣當觀看。 */
export const eventKind = (event) => event.kind || 'watch'

export const validEventId = (id) => typeof id === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(id)

/**
 * 伺服器收不收這筆紀錄。isKnown(char) 回答這個字在不在字庫。
 * 時間不能比現在晚超過一分鐘（裝置時鐘稍微不準可以）。
 */
export function acceptEvent(kind, event, isKnown, now = Date.now()) {
  const rule = PLAY_EVENTS[kind]
  if (!rule) return false
  const at = typeof event.at === 'string' ? Date.parse(event.at) : NaN
  return validEventId(event.id) && typeof event.char === 'string' &&
    Number.isFinite(at) && at <= now + 60000 &&
    (!rule.valid || rule.valid(event)) &&
    (rule.chars ? rule.chars(event) : [event.char]).every(isKnown)
}

/** 套用一筆紀錄。不認得的種類原樣不動（舊版孩子端送來的未知紀錄不該弄壞進度）。 */
export function applyEvent(progress, event) {
  const rule = PLAY_EVENTS[eventKind(event)]
  return rule ? rule.apply(progress, event) : progress
}

/** completedEvents 留多久：孩子端的佇列不會離線那麼久，再久的編號不會再被送來。 */
export const KEEP_EVENT_DAYS = 60

/** 收到日期早於 today 往前 KEEP_EVENT_DAYS 天的事件編號丟掉。 */
export function pruneCompleted(completed = {}, today = taiwanDay()) {
  const cutoff = Date.parse(today) - KEEP_EVENT_DAYS * 864e5
  return Object.fromEntries(Object.entries(completed).filter(([, v]) => Date.parse(v.day) >= cutoff))
}

/**
 * 把一筆紀錄存進進度：Mac 上的伺服器跟 iPad 單機版都走這裡。
 * 回 { progress, added }；內容不收回 { error }（呼叫端當 422 處理）。
 * 同一個編號已經算過就原樣回傳（added: false），編號被別的字用過算不收。
 */
export function recordEvent(progress, kind, event, isKnown, today = taiwanDay(), now = Date.now()) {
  const rule = PLAY_EVENTS[kind]
  if (!acceptEvent(kind, event, isKnown, now)) return { error: rule?.error || '紀錄不正確' }
  const seen = progress.completedEvents?.[event.id]
  if (seen) return seen.char === event.char ? { progress, added: false } : { error: '紀錄編號已使用' }
  const next = rule.apply(progress, event)
  next.completedEvents = { ...pruneCompleted(progress.completedEvents, today), [event.id]: { char: event.char, day: today } }
  return { progress: next, added: true }
}
