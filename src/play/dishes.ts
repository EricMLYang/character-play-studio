import type { Progress } from '../types'
import { partsOf } from './parts'
import { ALIKE } from './alike'

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
 *
 * want 是「他為了哪個字來的」：字卡上點「🍽️ 自己認出來 → 去」進來時，第一題就考那個字
 * （他想要的是那一顆星星，進來卻考別的字，那顆星星就等於拿不到）。
 */
export function pickDishes(pool: string[], progress: Progress, today: string, random = Math.random, n = DISHES, want?: string): string[] {
  const rec = progress.recall || {}
  const seen = (c: string) => progress.watched[c]?.count || 0
  const due = pool.filter((c) => rec[c] && rec[c].due <= today).sort((a, b) => rec[a].box - rec[b].box)
  const fresh = pool.filter((c) => !rec[c]).sort((a, b) => seen(b) - seen(a))
  const rest = shuffle(pool.filter((c) => rec[c] && rec[c].due > today), random)
  const picked = [...new Set([...due.slice(0, 2), ...fresh.slice(0, n), ...due.slice(2), ...rest])].slice(0, n)
  // 到期要複習的字可能已經忘了，不算有把握
  const confidence = (c: string) => (rec[c] && rec[c].due > today ? rec[c].box * 10 : 0) + seen(c)
  const easiest = picked.reduce((best, c) => (confidence(c) > confidence(best) ? c : best), picked[0])
  if (easiest === undefined) return []
  const order = [easiest, ...shuffle(picked.filter((c) => c !== easiest), random)]
  // 他指名要考的字排第一（沒看過的字大怪獸不吃，照原本的順序）
  return want && pool.includes(want) ? [want, ...order.filter((c) => c !== want)].slice(0, n) : order
}

/**
 * 兩個字長得像不像。兩種來源：
 * 1. 拆字表（data/parts.json）：其中一個藏在另一個裡面，或有共同的部件（口 跟 日、目 跟 田）
 * 2. 筆順比對（alike.ts，npm run alike 產生）：前幾筆幾乎一樣，也就是共用一個偏旁（蜂 跟 蝶、河 跟 湯）
 *    拆字表只記得到「部件本身也在字庫裡」的關係，「虫」「氵」不在字庫，就只能靠這張表
 */
export function looksAlike(a: string, b: string) {
  const pa = partsOf(a).map((p) => p.char), pb = partsOf(b).map((p) => p.char)
  return pa.includes(b) || pb.includes(a) || pa.some((c) => pb.includes(c)) ||
    ALIKE.has(a < b ? a + b : b + a)
}

/** 另一張卡：長得不像目標字的字，優先挑他也看過的（認得的話，用刪去法也算會）。 */
export function pickDecoy(target: string, known: string[], everyone: string[], random = Math.random) {
  const ok = (c: string) => c !== target && !looksAlike(c, target)
  const pool = known.filter(ok)
  const from = pool.length ? pool : everyone.filter(ok)
  return from[Math.floor(random() * from.length)]
}

/**
 * 點錯的字這一輪再上一次：隔兩道菜再考（後面菜不夠就排最後），他剛看過答案、隔一下再自己找一次才記得住。
 * 至少要隔一道：馬上再考只是照著剛剛的答案點。最後一道點錯、或一個字已經上過兩次，就留給下一輪（記住程度已經排今天再考）。
 */
export function requeue(queue: string[], at: number, char: string, gap = 2) {
  if (queue.filter((c) => c === char).length >= 2 || at + 1 >= queue.length) return queue
  const i = Math.min(at + 1 + gap, queue.length)
  return [...queue.slice(0, i), char, ...queue.slice(i)]
}

/** 這一輪的結算：自己找對過的字（有一次沒點錯就算），跟每次都要提示才吃到、該回去再看看的字。 */
export function recap(served: { char: string; ok: boolean }[]) {
  const good = [...new Set(served.filter((s) => s.ok).map((s) => s.char))]
  const again = [...new Set(served.filter((s) => !s.ok && !good.includes(s.char)).map((s) => s.char))]
  return { good, again }
}

/**
 * 他現在認字認得怎麼樣（詞語拼圖有自己的 puzzleLevel）。
 * 看的是「餵過的字裡，自己找到的比例」——答錯會讓 wrong 增加，所以這個比例會跟著他動。
 * 考過的字不到 8 個先當 normal，不然前幾次的運氣會決定難度。
 *
 * 餵大怪獸用它決定盤子上放幾張卡：常找錯就整輪都兩張，認得順就第二道開始三張。
 */
export type RecallLevel = 'easy' | 'normal' | 'hard'
export function recallLevel(progress: Progress): RecallLevel {
  const all = Object.values(progress.recall || {})
  const tries = all.reduce((n, r) => n + r.right + r.wrong, 0)
  if (tries < 8) return 'normal'
  const rate = all.reduce((n, r) => n + r.right, 0) / tries
  return rate < 0.5 ? 'easy' : rate >= 0.8 ? 'hard' : 'normal'
}

/** 自己找到幾個字會把肚子撐爆 */
export const BURST = 3

/**
 * 肚子：自己找到的字一個一個塞進去，越塞越大，塞滿 BURST 個就「砰！」炸開，縮回原本大小再繼續吃。
 * 靠提示才吃到的字照樣吃，但不算進肚子：不會變大，也不會縮回去（找錯不是錯，只是這道不算）。
 */
export function fillBelly(belly: number, ok: boolean, burst = BURST) {
  if (!ok) return { belly, boom: false }
  return belly + 1 >= burst ? { belly: 0, boom: true } : { belly: belly + 1, boom: false }
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

/**
 * 前面幾道只放兩張卡暖身，後面才三張。幾道算暖身跟著他走（recallLevel）：
 * 認得順就第二道開始三張，常找錯就整輪都只放兩張——難度要跟著他，不是跟著道數。
 */
export const WARMUP = 2
export const warmupFor = (level: RecallLevel, n = DISHES) => (level === 'easy' ? n : level === 'hard' ? 1 : WARMUP)

/** 幾張不是答案的卡。挑不到就少放一張，寧可兩張也不要重複的字。 */
export function decoys(target: string, known: string[], everyone: string[], count: number, random = Math.random) {
  const out: string[] = []
  let pool = known
  for (let i = 0; i < count; i++) {
    const pick = pickDecoy(target, pool, everyone.filter((c) => !out.includes(c)), random)
    if (!pick || out.includes(pick)) break
    out.push(pick)
    pool = pool.filter((c) => c !== pick)
  }
  return out
}

/** 第 i 道菜盤子上的卡（含答案、已洗好） */
export function plateFor(target: string, i: number, known: string[], everyone: string[], level: RecallLevel, random = Math.random) {
  return shuffle([target, ...decoys(target, known, everyone, i < warmupFor(level) ? 1 : 2, random)], random)
}

/**
 * 神秘料理（原本的小偵探）：這一輪有一道怪獸不說字，盤子上一筆一筆把字畫出來，他看字形認。
 * 放在第三道：第一道是暖身，最後一道留給結尾的節奏。不到三道就沒有。
 */
export const MYSTERY_AT = 2
export const mysteryIndex = (n: number) => (n > MYSTERY_AT ? MYSTERY_AT : -1)
