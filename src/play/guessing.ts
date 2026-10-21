import type { CharEntry, Progress } from '../types'
import { pickDishes, pickDecoy, recallLevel, type RecallLevel } from './dishes'
import { taiwanDay } from '../../shared/domain.mjs'

/**
 * 小偵探：一筆一筆把字畫出來，猜猜我是誰。
 *
 * 其他玩法考的是「聽到字找出來」（餵大怪獸、跳石頭過河）跟「讀懂詞」（詞語拼圖），
 * 沒有一個在練**看字形認字**。這裡只有線條，沒有聲音提示，他得從形狀認出來——
 * 而且越早認出來越厲害，那個「我知道了！」的搶答感就是這個遊戲的全部。
 *
 * 出題與挑干擾的字跟餵大怪獸共用（dishes.ts），紀錄也是 recall：
 * 同一個字的記住程度只有一份，在哪個遊戲認出來都算數。
 */

/** 一輪猜幾個字 */
export const ROUNDS = 5
/**
 * 前面幾題只放兩張卡暖身。幾題算暖身跟著他走（dishes.ts 的 recallLevel）：
 * 認得順就第二題開始三張，常找錯就整輪都只放兩張。
 */
export const WARMUP = 2
export const warmupFor = (level: RecallLevel) => (level === 'easy' ? ROUNDS : level === 'hard' ? 1 : WARMUP)

export type GuessRound = {
  /** 要猜的字 */
  char: string
  /** 卡片上的字，已經洗好（含答案） */
  options: string[]
}

export function pickRounds(library: CharEntry[], progress: Progress, random = Math.random, today = taiwanDay()): GuessRound[] {
  const pool = library.filter((c) => progress.watched[c.char]).map((c) => c.char)
  const everyone = library.map((c) => c.char)
  const warmup = warmupFor(recallLevel(progress))
  return pickDishes(pool, progress, today, random, ROUNDS).map((char, i) => ({
    char,
    options: shuffle([char, ...decoys(char, pool, everyone, i < warmup ? 1 : 2, random)], random),
  }))
}

/** 幾張不是答案的卡。挑不到就少放一張，寧可兩張也不要重複的字。 */
function decoys(target: string, known: string[], everyone: string[], count: number, random: () => number) {
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

/**
 * 看了幾筆才猜到。說「第幾筆」比說分數具體：他記得住「我兩筆就猜到了」。
 * 門檻跟著字的筆畫數走，筆畫多的字本來就要多看幾筆。
 */
export type Speed = { id: 'flash' | 'sharp' | 'ok'; icon: string; text: string }
export function howFast(used: number, total: number): Speed {
  if (used <= 2) return { id: 'flash', icon: '⚡', text: `只看了 ${used} 筆就猜到！` }
  if (used <= Math.max(3, Math.ceil(total / 2))) return { id: 'sharp', icon: '👀', text: `看了 ${used} 筆就猜到，好眼力！` }
  return { id: 'ok', icon: '✅', text: '猜對了！' }
}

/** 這一輪的結算：自己猜到的字，跟要等到全部畫完才知道、該回去再看看的字。 */
export function rounds(done: { char: string; ok: boolean }[]) {
  const good = [...new Set(done.filter((d) => d.ok).map((d) => d.char))]
  const again = [...new Set(done.filter((d) => !d.ok).map((d) => d.char))].filter((c) => !good.includes(c))
  return { good, again }
}

function shuffle<T>(list: T[], random: () => number) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
