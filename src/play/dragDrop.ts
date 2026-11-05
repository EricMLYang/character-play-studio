/**
 * 拖放手感：把「點一下」換成「拿起來、放進去」。
 *
 * 好的幼兒 App（Endless Alphabet 把字母怪獸拖進拼字格、Khan Kids 把東西拖進籃子）
 * 都讓孩子「拿著東西走過去放進去」：手在動，就是在做一件事，比點一下更記得住、也更好玩。
 * 但六歲有時候只會點，所以這裡**點一下照樣算**，拖只是多一種玩法，不會讓他卡住。
 *
 * 這個檔只放判斷用的純函式，跟著手指走的那一段在 useDrag.ts。
 */

/** 手指移動超過幾 px 才算「拿起來」（少於這個是點一下，手抖不會變成拖） */
export const DRAG_START = 10

export const isDragStart = (dx: number, dy: number) => dx * dx + dy * dy > DRAG_START * DRAG_START

export type Box = { left: number; top: number; right: number; bottom: number }

/**
 * 手指是不是在目標上面。目標四邊各放寬 slop px：六歲放的時候常常差一點點，
 * 差一點點也要收（他明明是要放進去）。
 */
export function insideTarget(x: number, y: number, box: Box | null, slop = 36) {
  if (!box) return false
  return x >= box.left - slop && x <= box.right + slop && y >= box.top - slop && y <= box.bottom + slop
}

/** 拿著走的時候卡片往移動方向斜一點，最多 12 度——像真的拿著一張紙 */
export const tiltFor = (vx: number) => Math.max(-12, Math.min(12, vx * 0.6))
