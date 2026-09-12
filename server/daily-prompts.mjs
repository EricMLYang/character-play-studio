import { loadCharacters, saveCharacters, productionDay, currentPrompt } from './core.mjs'
import { generatePrompt, isGenerating } from './prompt-generation.mjs'

/**
 * 今天建議清單的狀態：哪些字已經有可用的 prompt、哪些還要生成。
 * 「可用」＝有 AI 版本且沒有因為規則／字義／回饋更新而過期。
 */
export function dailyTargets() {
  const db = loadCharacters()
  const day = productionDay(db)
  saveCharacters(db)
  const ready = [], pending = []
  for (const char of day.queue) {
    const entry = db.characters.find((c) => c.char === char)
    if (!entry) continue
    const prompt = currentPrompt(entry)
    ;(prompt.id && !prompt.stale ? ready : pending).push(char)
  }
  return { date: day.date, queue: day.queue, ready, pending }
}

let job = null
let controller = null
let finished = Promise.resolve()

/** 給前端輪詢的狀態；job 只放可序列化的欄位。 */
export const dailyBatch = () => ({ ...dailyTargets(), job })
/** 測試用：等背景批次跑完。 */
export const whenDailyBatchIdle = () => finished

/**
 * 依序把今天缺的 prompt 補齊。一次只跑一個字（CLI 本來就是互斥的），
 * 單一個字失敗不會中斷其他字，錯誤留在結果裡讓家長看得到。
 */
export function startDailyBatch({ provider = 'codex', model = '' } = {}, runner) {
  if (job?.active) return dailyBatch()
  if (isGenerating()) throw new Error('正在生成另一份 prompt，請等它完成再開始今天的批次')
  const { date, pending } = dailyTargets()
  if (!pending.length) throw new Error('今天建議的字都已經有最新的 prompt 了')
  controller = new AbortController()
  const { signal } = controller
  job = { active: true, date, provider, total: pending.length, done: 0, current: pending[0],
    startedAt: new Date().toISOString(), results: [] }
  finished = (async () => {
    for (const char of pending) {
      if (signal.aborted) break
      job.current = char
      try {
        const prompt = await generatePrompt({ char, provider, model, signal }, runner)
        job.results.push({ char, ok: true, conceptZh: prompt.conceptZh || '' })
      } catch (error) {
        if (signal.aborted) break
        job.results.push({ char, ok: false, error: error.message })
      }
      job.done += 1
    }
    job = { ...job, active: false, current: null, cancelled: signal.aborted, finishedAt: new Date().toISOString() }
  })()
  return dailyBatch()
}

export function cancelDailyBatch() {
  controller?.abort()
  return dailyBatch()
}
