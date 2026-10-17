import type { Progress } from '../types'
import { partsOf } from './parts'

/**
 * 餵大怪獸：怪獸唸一個字，孩子從兩張「只有字、沒有圖」的卡片裡找出來餵牠。
 * 只考他看過的字；刻意不難：永遠二選一，另一張挑長得很不一樣的字。
 */

export const DISHES = 5

/**
 * 這一輪要考哪幾個字。
 * - 該複習的（記住程度到期了）先上，但一輪最多兩個，不要整輪都是他還不熟的
 * - 再來是還沒考過、他看最多次的字（最可能認得，一開始就答對才好玩）
 * - 還不夠就從其他看過的字隨便補
 * 第一題放最有把握的字暖身。
 */
export function pickDishes(pool: string[], progress: Progress, today: string, random = Math.random, n = DISHES): string[] {
  const rec = progress.recall || {}
  const seen = (c: string) => progress.watched[c]?.count || 0
  const due = pool.filter((c) => rec[c] && rec[c].due <= today).sort((a, b) => rec[a].box - rec[b].box)
  const fresh = pool.filter((c) => !rec[c]).sort((a, b) => seen(b) - seen(a))
  const rest = shuffle(pool.filter((c) => rec[c] && rec[c].due > today), random)
  const picked = [...new Set([...due.slice(0, 2), ...fresh.slice(0, n), ...due.slice(2), ...rest])].slice(0, n)
  // 到期要複習的字可能已經忘了，不算有把握
  const confidence = (c: string) => (rec[c] && rec[c].due > today ? rec[c].box * 10 : 0) + seen(c)
  const easiest = picked.reduce((best, c) => (confidence(c) > confidence(best) ? c : best), picked[0])
  return easiest === undefined ? [] : [easiest, ...shuffle(picked.filter((c) => c !== easiest), random)]
}

/** 兩個字長得像不像：其中一個藏在另一個裡面，或有共同的部件（口 跟 日、目 跟 田）。 */
export function looksAlike(a: string, b: string) {
  const pa = partsOf(a).map((p) => p.char), pb = partsOf(b).map((p) => p.char)
  return pa.includes(b) || pb.includes(a) || pa.some((c) => pb.includes(c))
}

/** 另一張卡：長得不像目標字的字，優先挑他也看過的（認得的話，用刪去法也算會）。 */
export function pickDecoy(target: string, known: string[], everyone: string[], random = Math.random) {
  const ok = (c: string) => c !== target && !looksAlike(c, target)
  const pool = known.filter(ok)
  const from = pool.length ? pool : everyone.filter(ok)
  return from[Math.floor(random() * from.length)]
}

/** 認得幾個字：至少有一次第一次就找對、而且還沒退回原點的字。 */
export const knownCount = (progress: Progress) => Object.values(progress.recall || {}).filter((r) => r.box > 0).length

function shuffle<T>(list: T[], random: () => number) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
