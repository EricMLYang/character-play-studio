import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { boing, boom, burp, inflate, liftoff, magic, snore, yawn } from '../lib/sfx'

/**
 * 餵大怪獸：肚子撐滿之後會發生什麼事。每次抽一種，四種都輪過一遍才會重複，保持新鮮。
 * 每種都是三拍：撐（swell）→ 大事發生（climax）→ 回來繼續吃（back）。
 * 台詞放 FIXED_LINES 預先做音檔；畫面效果在 feed.css 的 .finale-<id>。
 */
export type FinaleId = 'boom' | 'sleep' | 'rocket' | 'rainbow'
type Later = (fn: () => void, ms: number) => void
export type Finale = {
  swell: string; climax: string; back: string
  /** 三拍各用哪個表情（public/hero/monster/<pose>.png） */
  pose: { swell: string; climax: string; back: string }
  /** 大事發生那一拍多長 */
  climaxMs: number
  /** 撐、大事發生時的音效 */
  swellSfx: () => void
  climaxSfx: (later: Later) => void
}

export const FINALES: Record<FinaleId, Finale> = {
  // 砰！炸成星星和剛吃的東西，暈暈地縮回來
  boom: {
    swell: FIXED_LINES.feedSwell, climax: FIXED_LINES.feedBoom, back: FIXED_LINES.feedAgain,
    pose: { swell: 'stuffed', climax: 'surprised', back: 'dizzy' }, climaxMs: 1300,
    swellSfx: inflate, climaxSfx: () => boom(),
  },
  // 吃太飽睡著：天黑了、冒 Z、打呼，肚子慢慢消下去，醒來還要吃
  sleep: {
    swell: FIXED_LINES.feedSleepy, climax: FIXED_LINES.feedSnore, back: FIXED_LINES.feedWake,
    pose: { swell: 'stuffed', climax: 'sleep', back: 'surprised' }, climaxMs: 3600,
    swellSfx: yawn, climaxSfx: (later) => { snore(); later(snore, 1500); later(boing, 3300) },
  },
  // 打一個超大的嗝，把自己噴上天，再掉回來
  rocket: {
    swell: FIXED_LINES.feedBloat, climax: FIXED_LINES.feedBurp, back: FIXED_LINES.feedFly,
    pose: { swell: 'stuffed', climax: 'happy', back: 'dizzy' }, climaxMs: 2400,
    swellSfx: inflate, climaxSfx: (later) => { burp(); later(liftoff, 250); later(boing, 1900) },
  },
  // 肚子熱熱的，轉一圈變成彩虹怪獸
  rainbow: {
    swell: FIXED_LINES.feedWarm, climax: FIXED_LINES.feedMagic, back: FIXED_LINES.feedRainbow,
    pose: { swell: 'stuffed', climax: 'happy', back: 'happy' }, climaxMs: 2600,
    swellSfx: inflate, climaxSfx: () => magic(),
  },
}

export const FINALE_IDS = Object.keys(FINALES) as FinaleId[]

/**
 * 抽下一種結局：從袋子裡抽，抽完重新裝滿；剛演過的那個不會馬上又來（新袋子的第一個避開它）。
 * 回傳抽到的與剩下的袋子。
 */
export function pickFinale(bag: FinaleId[], last: FinaleId | null, random = Math.random): { id: FinaleId; bag: FinaleId[] } {
  let pool = bag.length ? bag : FINALE_IDS.filter((id) => id !== last)
  if (!pool.length) pool = FINALE_IDS
  const id = pool[Math.floor(random() * pool.length)]
  const rest = bag.length ? bag.filter((x) => x !== id) : FINALE_IDS.filter((x) => x !== id && x !== last).concat(last && last !== id ? [last] : [])
  return { id, bag: rest }
}
