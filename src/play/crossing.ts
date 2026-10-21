import type { CharEntry, Progress } from '../types'
import { pickDishes, pickDecoy } from './dishes'
import { taiwanDay } from '../../shared/domain.mjs'

/**
 * 跳石頭過河：主角站在這一岸，對岸有牠想要的東西。每一步聽「跳到『火』！」，
 * 踩對的石頭就跳過去，踩錯噗通一聲掉進水裡，看清楚那是什麼字，再跳一次。
 *
 * 考的能力跟餵大怪獸一樣（聽到字自己把它認出來），所以出題、挑干擾字、記紀錄
 * 全部共用那一套（dishes.ts 的 pickDishes／pickDecoy、recall 事件）：
 * 同一個字的記住程度不會因為換個遊戲就重算，間隔複習照樣排得準。
 * 不一樣的是感覺——這裡看得到自己一步一步往前，而且有終點。
 */

/** 一次過河跳幾顆石頭 */
export const STEPS = 5
/** 前面幾步只放兩顆石頭暖身，後面才三顆 */
export const WARMUP = 2

export type Step = {
  /** 這一步要跳到的字 */
  char: string
  /** 這一排石頭上的字，已經洗好（含答案） */
  stones: string[]
}

/** 過河的主角跟牠在對岸等的東西。一次一位，輪著來，不會每次都是同一隻。 */
export const CROSSERS = [
  { id: 'mouse', name: '小老鼠', goal: '🧀', want: '起司' },
  { id: 'pirate', name: '海盜', goal: '💰', want: '寶藏' },
  { id: 'dino', name: '恐龍', goal: '🍖', want: '大骨頭' },
  { id: 'monster', name: '大怪獸', goal: '🍰', want: '蛋糕' },
  { id: 'raccoon', name: '浣熊', goal: '🍉', want: '西瓜' },
  { id: 'robot', name: '機器人', goal: '🔋', want: '電池' },
  { id: 'pig', name: '小豬', goal: '🍎', want: '蘋果' },
  { id: 'astronaut', name: '太空人', goal: '🚀', want: '火箭' },
]

/** 這次換誰過河：照他過河的次數輪，玩愈多看到愈多角色。 */
export const crosserFor = (trips: number) => CROSSERS[trips % CROSSERS.length]

/**
 * 這一次要跳哪五個字、每一步擺哪幾顆石頭。
 * 字的順序交給餵大怪獸那套（該複習的先上、第一步放最有把握的字暖身），
 * 干擾的字一律挑長得不像的（不會拿「目」配「日」），踩錯要是因為沒認出來，不是被騙。
 */
export function pickCrossing(library: CharEntry[], progress: Progress, random = Math.random, today = taiwanDay()): Step[] {
  const pool = library.filter((c) => progress.watched[c.char]).map((c) => c.char)
  const everyone = library.map((c) => c.char)
  return pickDishes(pool, progress, today, random, STEPS).map((char, i) => ({
    char,
    stones: shuffle([char, ...decoys(char, pool, everyone, i < WARMUP ? 1 : 2, random)], random),
  }))
}

/** 幾顆不是答案的石頭。挑不到就少放一顆，寧可兩顆也不要重複的字。 */
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

/** 這一趟的結算：自己跳對的字，跟踩到水裡、該回去再看看的字。 */
export function trip(steps: { char: string; ok: boolean }[]) {
  const good = [...new Set(steps.filter((s) => s.ok).map((s) => s.char))]
  const again = [...new Set(steps.filter((s) => !s.ok).map((s) => s.char))].filter((c) => !good.includes(c))
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
