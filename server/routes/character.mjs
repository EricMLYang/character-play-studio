import { fail } from '../http.mjs'
import { isGenerating } from '../prompt-generation.mjs'
import { suggestCharacterMetadata, validateCharacterFields } from '../character-metadata.mjs'
import { loadCharacters, saveCharacters } from '../core.mjs'

const findEntry = (db, char, message = '找不到這個字') => db.characters.find((c) => c.char === char) || fail(404, message)

/** 字卡：新增、AI 補齊、編輯、刪除／還原、開放給孩子。 */
export const characterRoutes = {
  'POST /character': ({ body: raw }) => {
    const body = validateCharacterFields(raw)
    const db = loadCharacters()
    if (db.deletedCharacters?.some((c) => c.char === body.char)) fail(409, `「${body.char}」在已刪除清單中，請先還原再編輯。`)
    if (db.characters.some((c) => c.char === body.char)) fail(409, `「${body.char}」已經在字庫裡了，可以直接在左邊清單選它繼續編輯。`)
    db.characters.push({
      char: body.char, zhuyin: body.zhuyin || '', meaning: body.meaning || '',
      emoji: body.emoji || '✨', words: body.words,
      concept: { object: body.object || '', morph: body.morph || '', hook: body.hook || '' },
      status: 'seed', priority: db.characters.length + 1, media: [], feedback: [],
      // 新字先不進孩子端：注音、意思與素材都還沒備齊，要由家長決定何時開放
      hidden: true,
    })
    saveCharacters(db)
    return { ok: true }
  },

  'POST /character/suggest': ({ body, signal }) => suggestCharacterMetadata({ ...body, signal }),

  'POST /character/update': ({ body: raw }) => {
    const body = validateCharacterFields(raw)
    const db = loadCharacters()
    const entry = findEntry(db, body.char, '找不到這個字，可能已刪除')
    Object.assign(entry, { zhuyin: body.zhuyin, meaning: body.meaning, emoji: body.emoji || '✨',
      words: body.words, concept: { object: body.object, morph: body.morph, hook: body.hook } })
    saveCharacters(db)
    return { ok: true, entry }
  },

  'POST /character/delete': ({ body }) => {
    const { char } = validateCharacterFields(body)
    if (isGenerating()) fail(409, '請等目前的影片 prompt 生成完成，再刪除或還原字卡')
    const db = loadCharacters()
    const entry = findEntry(db, char)
    db.deletedCharacters = [...(db.deletedCharacters || []), { ...entry, deletedAt: new Date().toISOString() }]
    db.characters = db.characters.filter((c) => c.char !== char)
    // Keep attempts and their quota history; only remove the deleted card from recommendations.
    for (const day of Object.values(db.production?.days || {})) day.queue = day.queue.filter((c) => c !== char)
    saveCharacters(db)
    return { ok: true }
  },

  'POST /character/restore': ({ body }) => {
    const { char } = validateCharacterFields(body)
    if (isGenerating()) fail(409, '請等目前的影片 prompt 生成完成，再刪除或還原字卡')
    const db = loadCharacters()
    const entry = (db.deletedCharacters || []).find((c) => c.char === char) || fail(404, '找不到已刪除的字')
    if (db.characters.some((c) => c.char === char)) fail(409, '字庫已經有這個字')
    delete entry.deletedAt
    entry.hidden = true
    db.characters.push(entry)
    db.deletedCharacters = db.deletedCharacters.filter((c) => c.char !== char)
    saveCharacters(db)
    return { ok: true }
  },

  // ---- 這個字要不要出現在孩子端 ----
  'POST /character/visibility': ({ body: { char, hidden } }) => {
    if (typeof hidden !== 'boolean') fail(400, '請指定要開放或隱藏')
    const db = loadCharacters()
    const entry = findEntry(db, char)
    if (hidden) entry.hidden = true
    else delete entry.hidden
    saveCharacters(db)
    return { ok: true, entry }
  },
}
