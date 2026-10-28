/**
 * 自己寫字的特效：每寫對一筆，順著他手指畫的那一條線演一下（忍者砍一刀、噴火、閃電…）。
 * 2026-10-28 他說寫字想要「像忍者砍一刀」那樣，做了十種：一次寫字用同一種，下一次換下一種；
 * 他自己點右下那顆特效鈕換過的話，這次打開 App 都用他選的那一種。
 *
 * 這裡只放資料與純函式（好測），畫面在 StrokeFx.tsx，音效在 src/lib/sfx.ts。
 */
export type Point = { x: number; y: number }

/** 線怎麼畫：每一種對應 strokes.css 的 .fx-trail-<trail> 與 .fx-bit-<trail> */
export type Trail = 'blade' | 'fire' | 'bolt' | 'rainbow' | 'sparkle' | 'bubble' | 'bloom' | 'steps' | 'frost' | 'rocket'

export type StrokeTheme = {
  id: Trail
  /** 特效鈕上的圖 */
  icon: string
  /** 給爸媽看的名字（特效鈕的 aria-label） */
  name: string
  /** 沿著那一筆冒出來的小東西 */
  bits: string[]
  /** 一筆上放幾個 */
  count: number
  /** 有沒有那一條線（星星、泡泡、花、腳印只有一顆顆的東西） */
  line: boolean
}

export const STROKE_THEMES: StrokeTheme[] = [
  { id: 'blade', icon: '🥷', name: '忍者刀', bits: ['✦', '✧', '✦'], count: 5, line: true },
  { id: 'fire', icon: '🔥', name: '噴火', bits: ['🔥'], count: 6, line: true },
  { id: 'bolt', icon: '⚡', name: '閃電', bits: ['⚡'], count: 2, line: true },
  { id: 'rainbow', icon: '🌈', name: '彩虹', bits: ['☁️'], count: 2, line: true },
  { id: 'sparkle', icon: '⭐', name: '星星', bits: ['⭐', '✨', '🌟'], count: 7, line: false },
  { id: 'bubble', icon: '🫧', name: '泡泡', bits: ['🫧'], count: 6, line: false },  // 🫧 在淺色格子上太淡，泡泡本身用 CSS 畫
  { id: 'bloom', icon: '🌸', name: '開花', bits: ['🌸', '🌼', '🌷', '🌺'], count: 6, line: false },
  { id: 'steps', icon: '🦖', name: '恐龍腳印', bits: ['🐾'], count: 5, line: false },
  { id: 'frost', icon: '❄️', name: '結冰', bits: ['❄️'], count: 5, line: true },
  { id: 'rocket', icon: '🚀', name: '火箭', bits: ['💨'], count: 5, line: false },
]

/** 這次寫字用哪一種：他自己選過就用他選的，不然一次換一種 */
export function themeFor(round: number, chosen?: Trail | null) {
  if (chosen) return STROKE_THEMES.find((t) => t.id === chosen) ?? STROKE_THEMES[0]
  const n = STROKE_THEMES.length
  return STROKE_THEMES[((round % n) + n) % n]
}

/** 特效鈕按一下：換下一種 */
export function nextTheme(id: Trail) {
  const i = STROKE_THEMES.findIndex((t) => t.id === id)
  return STROKE_THEMES[(i + 1) % STROKE_THEMES.length]
}

/** 一條線有多長 */
export function lengthOf(points: Point[]) {
  let total = 0
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  return total
}

/**
 * 沿著線平均放 n 個點（頭尾都放），每個點帶著那裡的方向（度數，腳印、火箭要轉向）。
 * 只有一個點或線長是 0（點一下）時，全部放在同一個地方。
 */
export function along(points: Point[], n: number): (Point & { angle: number })[] {
  if (!points.length || n <= 0) return []
  const total = lengthOf(points)
  if (points.length === 1 || total === 0) return Array.from({ length: n }, () => ({ ...points[0], angle: 0 }))
  const out: (Point & { angle: number })[] = []
  let seg = 1
  let walked = 0
  for (let k = 0; k < n; k++) {
    const want = n === 1 ? total / 2 : (total * k) / (n - 1)
    // 往前走到包含 want 的那一段
    while (seg < points.length - 1 && walked + Math.hypot(points[seg].x - points[seg - 1].x, points[seg].y - points[seg - 1].y) < want) {
      walked += Math.hypot(points[seg].x - points[seg - 1].x, points[seg].y - points[seg - 1].y)
      seg++
    }
    const a = points[seg - 1], b = points[seg]
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const t = Math.min(1, Math.max(0, (want - walked) / len))
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI })
  }
  return out
}

/** 閃電：把線切成幾段，每一段左右甩一下（甩的方向交錯，看起來才是之字形） */
export function zigzag(points: Point[], amp: number, pieces = 7): Point[] {
  const spots = along(points, pieces + 1)
  return spots.map((p, i) => {
    if (i === 0 || i === spots.length - 1) return { x: p.x, y: p.y }
    const side = i % 2 ? 1 : -1
    const r = ((p.angle + 90) * Math.PI) / 180
    return { x: p.x + Math.cos(r) * amp * side, y: p.y + Math.sin(r) * amp * side }
  })
}

/** 點連成 SVG 的 path */
export const pathOf = (points: Point[]) =>
  points.map((p, i) => `${i ? 'L' : 'M'}${Math.round(p.x * 10) / 10} ${Math.round(p.y * 10) / 10}`).join(' ')
