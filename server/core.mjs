import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DATA = path.join(ROOT, 'data')
export const MEDIA = path.join(ROOT, 'media')

const readJSON = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback }
}
const writeJSON = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n', 'utf8')

export const loadCharacters = () => readJSON(path.join(DATA, 'characters.json'), { version: 1, characters: [] })
export const saveCharacters = (d) => writeJSON(path.join(DATA, 'characters.json'), d)
export const loadTemplate = () => readJSON(path.join(DATA, 'prompt-template.json'), null)
export const loadProgress = () => readJSON(path.join(DATA, 'progress.json'), { watched: {}, days: {} })
export const saveProgress = (d) => writeJSON(path.join(DATA, 'progress.json'), d)

/**
 * 把三層（constraints / styleRules / 這個字的 concept）組裝成最終英文 prompt。
 * 純函式、可重現 —— 同樣的資料永遠產出同樣的字串。
 */
export function buildPrompt(entry, tpl = loadTemplate()) {
  const { char, meaning, concept } = entry
  const rules = (tpl.styleRules || []).filter((r) => r.enabled !== false)

  const promptEn = [
    `Create an 8-second 3D animated clip that teaches ONE Traditional Chinese character to a 6-year-old child.`,
    ``,
    `HERO SUBJECT: the Traditional Chinese character "${char}" (meaning: ${meaning}).`,
    ``,
    `BEAT 1 (0-2s): ${concept.object} enters the empty frame with bouncy squash-and-stretch toy physics and settles dead-center.`,
    `BEAT 2 (2-5s): ${concept.morph}. The transformation is smooth, readable, and unmistakable - the child can see exactly which part becomes which stroke.`,
    `BEAT 3 (5-8s): the finished character "${char}" holds dead-center, perfectly formed, with a gentle breathing pulse.`,
    ``,
    `RULES:`,
    ...tpl.constraints.map((c) => `- ${c}`),
    ...rules.map((r) => `- ${r.text}`),
    ``,
    tpl.audio,
  ].join('\n')

  return {
    char,
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
export function todaysQueue(limit = 3) {
  const { characters } = loadCharacters()
  const byPriority = (a, b) => a.priority - b.priority
  const redo = characters.filter((c) => c.needsRedo).sort(byPriority)
  const pending = characters.filter((c) => c.status === 'prompted' && !c.needsRedo).sort(byPriority)
  const fresh = characters.filter((c) => c.status === 'seed').sort(byPriority)
  return [...redo, ...pending, ...fresh].slice(0, limit)
}
