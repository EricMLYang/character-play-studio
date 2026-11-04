/**
 * 連對幾題（從最後一題往回數，第一下就對的才算）。答對的音效（sfx.ts 的 ladder）照這個往上爬，
 * 連對越多越高——他聽得出「我一直對」，錯一次就回到最低。
 */
export function streakOf(results: { ok: boolean }[]) {
  let n = 0
  for (let i = results.length - 1; i >= 0 && results[i].ok; i--) n++
  return n
}
