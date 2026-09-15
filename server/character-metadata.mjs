import { generateWithCli } from './ai-cli.mjs'

export function validateCharacterFields(body) {
  const fields = {}
  for (const [key, limit] of Object.entries({ char: 2, zhuyin: 80, meaning: 300, emoji: 32, object: 3000, morph: 3000, hook: 3000 })) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > limit)) {
      throw new Error(`欄位 ${key} 格式不正確或過長`)
    }
    fields[key] = (body[key] || '').trim()
  }
  if (!/^\p{Script=Han}$/u.test(fields.char)) throw new Error('請輸入一個國字')
  if (fields.zhuyin && !/^[\u3105-\u3129ˊˇˋ˙\s／/、]+$/u.test(fields.zhuyin)) throw new Error('注音請使用注音符號與聲調')
  return fields
}

/** Suggestions are previews only. Saving remains a separate parent action. */
export async function suggestCharacterMetadata({ char, provider, model = '', signal }, runner = generateWithCli) {
  const fields = validateCharacterFields({ char })
  const result = await runner({ char: fields.char, provider, model, signal, metadataOnly: true,
    brief: `You help a parent prepare Traditional Chinese flashcards for Taiwanese children.
This is a text-only task. Do not use tools, browse, run commands or inspect files.
Return JSON with char, zhuyin, meaning and emoji. Give the usual Taiwanese Mandarin Bopomofo reading with correct tone marks (first tone unmarked), a concise English meaning, and one concrete emoji that reminds a child of that meaning. For a polyphonic character choose one common reading and its matching meaning. For abstract meanings choose an understandable visual association. Do not generate a video prompt.
Target character: ${fields.char}`,
  })
  if (signal?.aborted) throw new Error('已取消補齊')
  const suggested = validateCharacterFields(result)
  if (suggested.char !== fields.char || !suggested.zhuyin || !suggested.meaning || !suggested.emoji) {
    throw new Error('AI 回傳的字卡資料不完整或國字不符，請重試')
  }
  return { char: suggested.char, zhuyin: suggested.zhuyin, meaning: suggested.meaning, emoji: suggested.emoji }
}
