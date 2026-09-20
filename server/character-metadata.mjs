import { generateWithCli } from './ai-cli.mjs'

/**
 * 語詞給孩子端用來把字放回熟悉的語境（日 → 生日、日出）。
 * 一定要含目標字，否則畫面上看不出關聯，等於白給。
 */
export function parseWords(value, char) {
  const words = [...new Set(String(value || '').split(/[、,，\s/／]+/).map((w) => w.trim()).filter(Boolean))]
  if (words.length > 4) throw new Error('語詞最多四個')
  for (const word of words) {
    if (!/^\p{Script=Han}{2,4}$/u.test(word)) throw new Error(`語詞「${word}」請用二到四個國字`)
    if (!word.includes(char)) throw new Error(`語詞「${word}」裡面沒有「${char}」，孩子看不出關聯`)
  }
  return words
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
  return fields
}

/** Suggestions are previews only. Saving remains a separate parent action. */
export async function suggestCharacterMetadata({ char, provider, model = '', signal }, runner = generateWithCli) {
  const fields = validateCharacterFields({ char })
  const result = await runner({ char: fields.char, provider, model, signal, metadataOnly: true,
    brief: `You help a parent prepare Traditional Chinese flashcards for Taiwanese children.
This is a text-only task. Do not use tools, browse, run commands or inspect files.
Return JSON with char, zhuyin, meaning, emoji and words. Give the usual Taiwanese Mandarin Bopomofo reading with correct tone marks (first tone unmarked), a concise English meaning, and one concrete emoji that reminds a child of that meaning. For a polyphonic character choose one common reading and its matching meaning. For abstract meanings choose an understandable visual association.
For "words" give two or three everyday Traditional Chinese words separated by "、". Every word must be two to four characters, must contain the target character, must keep the same reading you gave in zhuyin, and must be something a six-year-old in Taiwan already says out loud. The target character may sit anywhere in the word. Do not generate a video prompt.
Target character: ${fields.char}`,
  })
  if (signal?.aborted) throw new Error('已取消補齊')
  // 先確認是不是同一個字：字不對的話，語詞驗證會先炸出一個讓人摸不著頭緒的訊息
  const incomplete = new Error('AI 回傳的字卡資料不完整或國字不符，請重試')
  if (typeof result?.char !== 'string' || result.char.trim() !== fields.char) throw incomplete
  const suggested = validateCharacterFields(result)
  if (!suggested.zhuyin || !suggested.meaning || !suggested.emoji) throw incomplete
  return { char: suggested.char, zhuyin: suggested.zhuyin, meaning: suggested.meaning, emoji: suggested.emoji,
    words: suggested.words.join('、') }
}
