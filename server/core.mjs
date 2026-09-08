import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { taiwanDay, revisionTags } from '../shared/domain.mjs'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DATA = path.join(process.env.CPS_STORAGE_ROOT || ROOT, 'data')
export const MEDIA = path.join(process.env.CPS_STORAGE_ROOT || ROOT, 'media')

const readJSON = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}
const writeJSON = (p, v) => {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  const temporary = `${p}.tmp`
  fs.writeFileSync(temporary, JSON.stringify(v, null, 2) + '\n', 'utf8')
  fs.renameSync(temporary, p)
}

export const loadCharacters = () => readJSON(path.join(DATA, 'characters.json'), { version: 1, characters: [] })
export const saveCharacters = (d) => writeJSON(path.join(DATA, 'characters.json'), d)
export const loadTemplate = () => readJSON(path.join(ROOT, 'data/prompt-template.json'), null)
export const loadProgress = () => readJSON(path.join(DATA, 'progress.json'), { watched: {} })
export const saveProgress = (d) => writeJSON(path.join(DATA, 'progress.json'), d)

export function contextHash(entry, template = loadTemplate()) {
  return createHash('sha256').update(JSON.stringify({ char: entry.char, meaning: entry.meaning, zhuyin: entry.zhuyin,
    concept: entry.concept, feedback: entry.feedback, template })).digest('hex')
}

export function currentPrompt(entry) {
  const selected = entry.promptVersions?.find((p) => p.id === entry.activePromptId)
  if (!selected) return { ...buildPrompt(entry), provider: 'template', stale: false }
  return { ...selected, stale: selected.contextHash !== contextHash(entry) }
}

/**
 * 把三層（constraints / styleRules / 這個字的 concept）組裝成最終英文 prompt。
 * 純函式、可重現 —— 同樣的資料永遠產出同樣的字串。
 */
export function buildPrompt(entry, tpl = loadTemplate()) {
  const { char, meaning, concept } = entry
  const rules = (tpl.styleRules || []).filter((r) => r.enabled !== false)
  const appliedFeedback = revisionTags(entry)
  const slow = appliedFeedback.includes('fast')
  const beats = slow ? ['0-1s', '1-4s', '4-8s'] : ['0-2s', '2-5s', '5-8s']
  const feedbackRules = {
    unclear: 'Use matte solid-color strokes with generous open gaps; no glare, bevels, or shadows that merge separate strokes.',
    noisy: 'Only the teaching subject moves. No decorative particles, sound effects, music, or additional props. Keep the voice clear and calm.',
    confusing: `Transform one component at a time along a short, direct path into its final stroke in "${char}". Preserve the spatial relationship between object parts; no spins, cuts, or unrelated strokes popping in.`,
    fast: 'Shorten the entrance to 1 second. Morph during seconds 1-4, then hold the completed glyph still for 4 full seconds (4-8s). No bouncing during the hold.',
  }

  const promptEn = [
    `Create a playful 8-second 3D animated clip that teaches ONE Traditional Chinese character.`,
    tpl.scenePolicy || '',
    ``,
    `HERO SUBJECT: the Traditional Chinese character "${char}" (meaning: ${meaning}).`,
    ``,
    `BEAT 1 (${beats[0]}): ${concept.object} enters the empty frame with gentle toy motion and settles dead-center.`,
    `BEAT 2 (${beats[1]}): ${concept.morph}. The transformation is smooth, readable, and unmistakable - the child can see exactly which part becomes which stroke.`,
    `BEAT 3 (${beats[2]}): the finished character "${char}" holds dead-center, perfectly formed, ${slow ? 'completely still' : 'with a gentle breathing pulse'}.`,
    ``,
    `RULES:`,
    ...tpl.constraints.map((c) => `- ${appliedFeedback.includes('unclear') ? c.replace('glossy chunky toy materials', 'matte chunky toy materials') : c}`),
    ...rules.map((r) => `- ${r.text}`),
    ...appliedFeedback.map((tag) => `- ${feedbackRules[tag]}`),
    ``,
    tpl.audio.replaceAll('{char}', char),
  ].join('\n')

  return {
    char,
    templateVersion: tpl.version,
    appliedFeedback,
    feedbackCount: (entry.feedback || []).length,
    hash: createHash('sha256').update(promptEn).digest('hex'),
    conceptZh: concept.hook,
    promptEn,
    formatted: tpl.outputTemplate
      .replace('{char}', char)
      .replace('{concept}', concept.hook)
      .replace('{prompt}', promptEn),
  }
}

export const findChar = (c) => loadCharacters().characters.find((e) => e.char === c)

/**
 * 今天該生成的字。判斷依據是「還沒有影片」而不是「還沒出過 prompt」——
 * 看過 prompt 但還沒餵 AI 的字必須留在清單上，不然中斷後就接不回來了。
 * 順序：回饋不好要重做 → 已出 prompt 待餵 → 全新的字。
 */
export function productionDay(db, date = taiwanDay()) {
  db.production ||= { days: {} }
  if (!db.production.days[date]) {
    const pending = Object.values(db.production.days).flatMap((d) => d.attempts).filter((a) => !a.mediaFile && !a.failedAt)
    const rank = (c) => (c.needsRedo ? 0 : c.status === 'prompted' ? 1 : 2)
    const candidates = db.characters.filter((c) =>
      !pending.some((a) => a.char === c.char) &&
      !(c.media || []).some((m) => m.kind === 'video' && m.review === 'draft' &&
        (!c.needsRedo || (m.feedbackCount ?? 0) >= (c.feedback || []).length)) &&
      (c.needsRedo || !(c.media || []).some((m) => m.kind === 'video')))
      .sort((a, b) => rank(a) - rank(b) || a.priority - b.priority)
    db.production.days[date] = { queue: candidates.slice(0, 3).map((c) => c.char), attempts: [] }
  }
  return { date, limit: 3, ...db.production.days[date] }
}

export function recordSubmission(db, { char, id, hash }, date = taiwanDay()) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(id)) throw new Error('製作紀錄編號不正確')
  const day = productionDay(db, date)
  const existing = Object.values(db.production.days).flatMap((d) => d.attempts).find((a) => a.id === id)
  if (existing) {
    if (existing.char !== char || existing.prompt.hash !== hash) throw new Error('製作紀錄編號已使用')
    return existing
  }
  if (day.attempts.length >= day.limit) throw new Error('今天已記錄 3 支影片，明天再繼續；匯入已有檔案不受限制')
  const entry = db.characters.find((c) => c.char === char)
  if (!entry) throw new Error('找不到這個字')
  const prompt = currentPrompt(entry)
  if (prompt.stale) throw new Error('生成規則、回饋或字義已更新，請重新生成 prompt 後再記錄送出')
  if (prompt.hash !== hash) throw new Error('Prompt 已有更新，請重新複製後再記錄')
  const attempt = { id, char, at: new Date().toISOString(), prompt,
    template: loadTemplate(), concept: structuredClone(prompt.object ? { object: prompt.object, morph: prompt.morph, hook: prompt.conceptZh } : entry.concept) }
  day.attempts.push(attempt)
  return attempt
}

export function todaysQueue(limit = 3) {
  const db = loadCharacters()
  const day = productionDay(db)
  saveCharacters(db)
  return day.queue.slice(0, limit).map((char) => db.characters.find((c) => c.char === char)).filter(Boolean)
}
