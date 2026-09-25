import { generateWithCli } from './ai-cli.mjs'
import { SCENES } from '../shared/domain.mjs'

/** 存好的語詞變回輸入框看得懂的一行字。 */
export const formatWords = (words) => (words || []).map((w) => w.text + (w.emoji || '')).join('、')

/**
 * 語詞給孩子端用來把字放回熟悉的語境（日 → 生日🎂、日出🌅）。
 * 寫法是「詞＋一個 emoji」，emoji 可以省略。
 * 詞一定要含目標字，否則畫面上看不出關聯，等於白給。
 */
export function parseWords(value, char) {
  const tokens = [...new Set(String(value || '').split(/[、,，\s/／]+/).map((w) => w.trim()).filter(Boolean))]
  if (tokens.length > 4) throw new Error('語詞最多四個')
  return tokens.map((token) => {
    const [, text = '', emoji = ''] = token.match(/^(\p{Script=Han}+)(.*)$/u) || []
    if (text.length < 2 || text.length > 4) throw new Error(`語詞「${token}」請用二到四個國字`)
    if (!text.includes(char)) throw new Error(`語詞「${text}」裡面沒有「${char}」，孩子看不出關聯`)
    if (emoji && (emoji.length > 12 || /[\p{Script=Han}\p{L}\p{N}]/u.test(emoji))) {
      throw new Error(`語詞「${text}」後面請只接一個圖示，例如 ${text}🎂`)
    }
    return emoji ? { text, emoji } : { text }
  })
}

export function validateCharacterFields(body) {
  const fields = {}
  for (const [key, limit] of Object.entries({ char: 2, zhuyin: 80, meaning: 300, emoji: 32, object: 3000, morph: 3000, hook: 3000, words: 200 })) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > limit)) {
      throw new Error(`欄位 ${key} 格式不正確或過長`)
    }
    fields[key] = (body[key] || '').trim()
  }
  if (!/^\p{Script=Han}$/u.test(fields.char)) throw new Error('請輸入一個國字')
  if (fields.zhuyin && !/^[\u3105-\u3129ˊˇˋ˙\s／/、]+$/u.test(fields.zhuyin)) throw new Error('注音請使用注音符號與聲調')
  fields.words = parseWords(fields.words, fields.char)
  if (body.scene !== undefined && body.scene !== '' && !SCENES.includes(body.scene)) throw new Error('場景分類不正確')
  // sparkle 就是沒分類的預設值，存成空的，才不會有兩種寫法代表同一件事
  fields.scene = body.scene === 'sparkle' ? '' : body.scene || ''
  return fields
}

/** Suggestions are previews only. Saving remains a separate parent action. */
export async function suggestCharacterMetadata({ char, provider, model = '', signal }, runner = generateWithCli) {
  const fields = validateCharacterFields({ char })
  const result = await runner({ char: fields.char, provider, model, signal, metadataOnly: true,
    brief: `You help a parent prepare Traditional Chinese flashcards for Taiwanese children.
This is a text-only task. Do not use tools, browse, run commands or inspect files.
Return JSON with char, zhuyin, meaning, emoji, words and scene. Give the usual Taiwanese Mandarin Bopomofo reading with correct tone marks (first tone unmarked), a concise English meaning, and one concrete emoji that reminds a child of that meaning. For a polyphonic character choose one common reading and its matching meaning. For abstract meanings choose an understandable visual association.
For "words" give two or three everyday Traditional Chinese words separated by "、", each word followed immediately by one emoji that pictures it, like 生日🎂、日出🌅. Every word must be two to four characters, must contain the target character, must keep the same reading you gave in zhuyin, and must be something a six-year-old in Taiwan already says out loud. The target character may sit anywhere in the word. Pick a different emoji for each word so the child can tell them apart. For "scene" pick the one background animation that best matches the meaning, which also decides what happens when a child mixes this character with another in a magic pot: rain (water, weather, drinking), fire (fire, heat, electricity, dark), glow (light, sun, stars, seeing, shiny, happy), grow (plants, earth, food, big things, places), fly (birds, flying, speed, going up, small floating things), bounce (animals, people, body parts, walking, jumping, playing), zap (force, hitting, weapons, machines, hands doing things), sparkle (anything else).
Do not generate a video prompt.
Target character: ${fields.char}`,
  })
  if (signal?.aborted) throw new Error('已取消補齊')
  // 先確認是不是同一個字：字不對的話，語詞驗證會先炸出一個讓人摸不著頭緒的訊息
  const incomplete = new Error('AI 回傳的字卡資料不完整或國字不符，請重試')
  if (typeof result?.char !== 'string' || result.char.trim() !== fields.char) throw incomplete
  // 場景猜錯不值得整個重來：不在清單上就留空，家長自己選
  const suggested = validateCharacterFields({ ...result, scene: SCENES.includes(result.scene) ? result.scene : '' })
  if (!suggested.zhuyin || !suggested.meaning || !suggested.emoji) throw incomplete
  return { char: suggested.char, zhuyin: suggested.zhuyin, meaning: suggested.meaning, emoji: suggested.emoji,
    words: formatWords(suggested.words), scene: suggested.scene }
}
