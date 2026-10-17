import { completeWatch, addTrace, discover, validStrokes, saveWord, validWord } from './domain.mjs'

/**
 * 孩子端的每一種紀錄：觀看、描字搬進小鎮、魔法鍋發現、字火車組的詞。
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
  trace: { error: '描字紀錄不正確', valid: (e) => validStrokes(e.strokes),
    apply: (p, e) => addTrace(p, e.char, e.strokes, e.at) },
  discover: { error: '發現紀錄不正確', apply: (p, e) => discover(p, e.char, e.at) },
  // char 是整個詞，每個字都要在字庫裡
  word: { error: '組詞紀錄不正確', valid: (e) => validWord(e.char), chars: (e) => [...e.char],
    apply: (p, e) => saveWord(p, e.char, e.at, e.remove === true) },
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
