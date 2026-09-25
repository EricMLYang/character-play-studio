import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fail } from '../http.mjs'
import { addFeedback, publishMedia, isPublished } from '../../shared/domain.mjs'
import { deleteInactiveMedia } from '../media-deletion.mjs'
import { MEDIA, loadCharacters, saveCharacters } from '../core.mjs'

/** 素材：拖曳匯入、審看上架／停用／刪除，以及家長對素材的回饋。 */
export const mediaRoutes = {
  'POST /import': ({ url, buffer }) => {
    const char = url.searchParams.get('char')
    const ext = (url.searchParams.get('ext') || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!['mp4', 'webm', 'mov', 'png', 'jpg', 'jpeg', 'webp'].includes(ext)) fail(400, '請匯入 MP4、WebM、MOV、PNG、JPG 或 WebP')
    if (!buffer.length) fail(400, '檔案是空的')
    const db = loadCharacters()
    const entry = db.characters.find((c) => c.char === char)
    if (!entry) fail(404, '找不到這個字')
    const attemptId = url.searchParams.get('attemptId')
    const attempt = Object.values(db.production?.days || {}).flatMap((d) => d.attempts)
      .find((a) => a.id === attemptId && a.char === char)
    if (attemptId && (!attempt || attempt.mediaFile || attempt.failedAt)) fail(400, '製作紀錄不存在、已結束或已匯入')
    const kind = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image'
    if (attemptId && kind !== 'video') fail(400, '影片製作紀錄只能連結影片')
    fs.mkdirSync(MEDIA, { recursive: true })
    const name = `${char}-${randomUUID()}.${ext}`
    fs.writeFileSync(path.join(MEDIA, name), buffer)
    entry.media = [{ file: name, kind, addedAt: new Date().toISOString(), review: 'draft',
      audioMode: kind === 'video' ? 'original' : 'narration', volume: 0.7,
      feedbackCount: attempt?.prompt.feedbackCount ?? (entry.feedback || []).length,
      ...(attempt ? { attemptId, prompt: attempt.prompt } : {}),
    }, ...(entry.media || [])]
    if (attempt) attempt.mediaFile = name
    saveCharacters(db)
    return { ok: true, file: name, entry }
  },

  'POST /media-review': ({ body }) => {
    if (body.action === 'delete') return deleteInactiveMedia(body)
    const db = loadCharacters()
    const entry = db.characters.find((c) => c.char === body.char)
    if (!entry) fail(404, '找不到這個字')
    if (body.action === 'publish') {
      publishMedia(entry, body.file, body.audioMode, body.volume, body.checks)
    } else if (body.action === 'pause') {
      const media = entry.media.find((m) => m.file === body.file)
      if (!media) fail(404, '找不到這個版本')
      media.review = 'paused'
      if (!entry.media.some(isPublished)) entry.status = entry.promptedAt ? 'prompted' : 'seed'
    } else fail(400, '不支援的操作')
    saveCharacters(db)
    return entry
  },

  // ---- 回饋：一鍵標籤，之後會長成規則庫 ----
  'POST /feedback': ({ body: { char, tags, mediaFile } }) => {
    const db = loadCharacters()
    const entry = db.characters.find((c) => c.char === char)
    if (!entry) fail(404, '找不到這個字')
    if (mediaFile && !entry.media.some((m) => m.file === mediaFile)) fail(400, '找不到回饋版本')
    addFeedback(entry, tags, new Date().toISOString(), mediaFile)
    saveCharacters(db)
    return { ok: true, entry }
  },
}
