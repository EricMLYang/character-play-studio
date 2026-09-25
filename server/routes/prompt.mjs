import { fail } from '../http.mjs'
import { generatePrompt } from '../prompt-generation.mjs'
import { dailyBatch, startDailyBatch, cancelDailyBatch } from '../daily-prompts.mjs'
import { loadCharacters, saveCharacters, currentPrompt, recordSubmission } from '../core.mjs'

/** 影片 prompt：生成、選版本、今天三支的背景批次，以及送出 AI 的製作紀錄。 */
export const promptRoutes = {
  'GET /prompt': ({ url }) => {
    const entry = loadCharacters().characters.find((c) => c.char === url.searchParams.get('char'))
    if (!entry) fail(404, '找不到這個字')
    return currentPrompt(entry)
  },

  'POST /prompt/generate': ({ body, signal }) => generatePrompt({ ...body, signal }),

  'POST /prompt/select': ({ body: { char, id } }) => {
    const db = loadCharacters(), entry = db.characters.find((c) => c.char === char)
    if (!entry?.promptVersions?.some((p) => p.id === id)) fail(404, '找不到這份 prompt')
    entry.activePromptId = id
    saveCharacters(db)
    return currentPrompt(entry)
  },

  // ---- 今天三支：一次把建議清單缺的 prompt 補齊，背景跑 ----
  'GET /prompt/today': () => dailyBatch(),
  'POST /prompt/today': ({ body: { provider, model } }) => startDailyBatch({ provider, model }),
  'POST /prompt/today/cancel': () => cancelDailyBatch(),

  'POST /submission': ({ body }) => {
    const db = loadCharacters()
    const attempt = recordSubmission(db, body)
    saveCharacters(db)
    return attempt
  },

  'POST /submission-failed': ({ body: { id } }) => {
    const db = loadCharacters()
    const attempt = Object.values(db.production?.days || {}).flatMap((d) => d.attempts).find((a) => a.id === id)
    if (!attempt || attempt.mediaFile) fail(400, '找不到待匯入的製作紀錄')
    attempt.failedAt ||= new Date().toISOString()
    const entry = db.characters.find((c) => c.char === attempt.char)
    if (entry) entry.needsRedo = true
    saveCharacters(db)
    return { ok: true }
  },
}
