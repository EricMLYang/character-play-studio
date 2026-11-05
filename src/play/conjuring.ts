import type { Act } from '../../shared/spells.mjs'

/**
 * 變身（Conjure.tsx）的資料與純函式：他寫的筆跡怎麼畫、每一段演多久、每一種動作配什麼聲音。
 * 內容（哪個字怎麼動、夥伴說什麼）在 shared/spells.mjs。
 */

/** 一段一段的時間（毫秒）：筆跡發光 → 收攏成一點 → 「啵」變出東西 → 照意思動 → 結束 */
export const CONJURE_MS = { glow: 520, gather: 560, pop: 520, act: 2600 }
/** 象形字多一段：收攏之後先一筆一筆畫出古時候的樣子（origins.ts），再變成東西 */
export const ORIGIN_MS = 1100
export const conjureTotal = (origin = false) => Object.values(CONJURE_MS).reduce((a, b) => a + b, 0) + (origin ? ORIGIN_MS : 0)

/** 一筆是 [x0, y0, x1, y1, …]（hanzi-writer 的字座標：1024 格、y 朝上）→ SVG 的 path */
export function inkPath(stroke: number[]): string {
  if (stroke.length < 2) return ''
  const pts: string[] = []
  for (let i = 0; i + 1 < stroke.length; i += 2) pts.push(`${stroke[i]} ${stroke[i + 1]}`)
  // 只有一點（他點一下就過的那一筆）畫成一個小點，不然看不到
  if (pts.length === 1) pts.push(pts[0])
  return `M${pts.join('L')}`
}

/** 他寫的字的重心（字座標），筆跡往這裡收攏；沒有筆跡就是格子正中間 */
export function inkCenter(strokes: number[][]): { x: number; y: number } {
  let sx = 0, sy = 0, n = 0
  for (const s of strokes) for (let i = 0; i + 1 < s.length; i += 2) { sx += s[i]; sy += s[i + 1]; n++ }
  return n ? { x: sx / n, y: sy / n } : { x: 512, y: 388 }
}

/** 有些動作是「很多個」：下雨是一整片雨滴，不是一顆 */
export const MANY: Partial<Record<Act, number>> = { fall: 9 }

/** 每一種動作要的音效名字（Conjure.tsx 對到 sfx.ts 的函式）；沒列的只有「啵」 */
export const ACT_SOUND: Record<Act, string> = {
  swim: 'bubble', fly: 'whoosh', fall: 'splash', grow: 'slide', bounce: 'boing', burn: 'flame', shine: 'twinkle',
  drive: 'toot', run: 'whoosh', hop: 'boing', stomp: 'rumble', slither: 'slide', crawl: 'blip', float: 'whoosh',
  splash: 'splash', yum: 'gulp',
}

/**
 * 往右移動的動作。3D 圖（Fluent Emoji）的側面幾乎都朝左（魚、車、鳥、象…，2026-11-06 逐張看過），
 * 往右游、往右開就變成倒退——這些動作要把圖左右翻過來。
 */
export const MOVES_RIGHT = new Set<Act>(['swim', 'fly', 'drive', 'run', 'hop', 'stomp', 'slither', 'crawl'])
/** 3D 圖本來就朝右的（不用翻）：飛機機頭朝右上 */
export const FACES_RIGHT = new Set(['✈️', '✈'])
/** 這個東西演這個動作要不要翻過來 */
export const flipFor = (emoji: string, act: Act) => MOVES_RIGHT.has(act) && !FACES_RIGHT.has(emoji)
