import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { isPublished } from '../shared/domain.mjs'
import { MEDIA, loadCharacters, saveCharacters } from './core.mjs'

export function deleteInactiveMedia({ char, file }, persist = saveCharacters) {
  if (typeof file !== 'string' || !file || path.basename(file) !== file || file.includes('\\') || file.startsWith('.')) {
    throw new Error('素材檔名不正確')
  }
  const db = loadCharacters()
  const entry = db.characters.find((c) => c.char === char)
  const media = entry?.media.find((m) => m.file === file)
  if (!media) throw new Error('找不到這個素材版本，請重新整理')
  if (isPublished(media)) throw new Error('使用中的素材不能刪除，請先暫停使用')
  if ([...db.characters, ...(db.deletedCharacters || [])].some((c) => c !== entry && c.media?.some((m) => m.file === file))) {
    throw new Error('其他字卡仍使用這個檔案，無法刪除')
  }
  const original = structuredClone(db)
  const source = path.join(MEDIA, file)
  const staged = path.join(MEDIA, `.deleting-${randomUUID()}`)
  let moved = false, saved = false
  try {
    // Stage first so a failed metadata write can put the file back. Missing files can still be removed from the list.
    try { fs.renameSync(source, staged); moved = true } catch (error) { if (error.code !== 'ENOENT') throw error }
    entry.media = entry.media.filter((m) => m.file !== file)
    entry.deletedMedia = [...(entry.deletedMedia || []), { ...media, deletedAt: new Date().toISOString() }]
    entry.status = entry.media.some(isPublished) ? 'live' : entry.promptedAt ? 'prompted' : 'seed'
    persist(db); saved = true
    if (moved) fs.unlinkSync(staged)
    return entry
  } catch (error) {
    if (moved) fs.renameSync(staged, source)
    if (saved) persist(original)
    throw error
  }
}
