import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 湖（v2）：浣熊花生站在一大片平平靜靜的湖邊打水漂——每次撿起小石頭、身體往後一仰「咻」地甩出去，
// 石頭在湖面上「咚、咚、咚」地跳，每跳一下就漾開一圈漣漪，一次比一次多下、一次比一次遠：
// 跳一下就「噗」沉下去（氵從漣漪裡飛出來）→ 跳三下（古）→ 先停一拍：他托著下巴瞄半天、往後仰到底用力一甩——
// 咚咚咚咚咚咚咚咚，跳過整個湖面、飛出畫面（月）。
// 語詞那一刻：他走進湖裡，水淹到腿，捧起湖水往上一潑：「湖水」。
// 回馬槍（第四次）：他得意極了，回頭把岸邊那顆大石頭整個舉起來（東西永遠抱太多），用力一甩——
// 一下都沒跳，「噗通！」直接沉下去，濺起最大的一根水柱，整片水嘩地倒在他頭上，他濕答答地傻眼、頭上一直滴水。
// 最後湖縮回去、畫面暗下來只剩「湖」，花生走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「湖！」，然後退場只留字。
// 刻意不跟「海」（大浪湧上沙灘、海豚）、「蛙」（青蛙舌頭）、「岩」（敲石頭）撞，也不演大浪、小島（留給「浪」「島」）：
// 湖一直是畫面中間那一池被岸圍起來、平平的藍色水面，只有漣漪一圈一圈地漾開。
// 湖、湖、湖水、這是什麼字？、湖

/** 浣熊花生（hero:raccoon；圖朝左，前三次都站在左岸、面向右邊的湖） */
const RS = 36
const RY = 77 - 0.42 * RS
/** 每次丟石頭都站在同一個地方 */
const SHORE = 26
/** 岸邊那顆大石頭（回馬槍才舉起來） */
const BS = 20
const BX = 14
const BY = 77 - 0.42 * BS

// ---- 湖：一排一排的藍色粗線疊成一個橢圓的湖面（掛在看不見的錨點上，錨點在 0,0，dx／dy 就是舞台座標） ----

/** 湖的中心與半徑（橢圓、從側面看過去扁扁的） */
const CX = 97
const CY = 81
const RX = 56
const RYL = 7.5
/** 岸（湖外面一圈泥土色的邊） */
const RIM_X = RX + 3.5
const RIM_Y = RYL + 1.2
const ROW = 1.5
const ROW_W = 1.9

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
const clamp01 = (p: number) => Math.max(0, Math.min(1, p))
const easeOut = (p: number) => 1 - (1 - p) * (1 - p)
const ease = (p: number) => p * p * (3 - 2 * p)

/** 遠的（上面）淺、近的（下面）深 */
const waterColor = (y: number) => mix('#86D3F7', '#2A7FD4', clamp01((y - (CY - RYL)) / (2 * RYL)))
const RIM = '#B99A62'

/** 某一刻在湖面上的點：在水裡（中心起算的比例 ≤ k） */
const inside = (p: Vec, k = 0.97) => ((p.x - CX) / RX) ** 2 + ((p.y - CY) / RYL) ** 2 <= k * k

/** 漣漪：at 那一刻在 (x, y) 漾開，半徑長到 R，life 秒後散掉 */
type Ripple = { at: number; x: number; y: number; R: number; life: number }

type Seg = { a: Vec; b: Vec; color: string; width: number; layer: number }

/** 水柱：回馬槍的大石頭「噗通」那一下，從落水的地方往上噴、再往左倒在花生頭上 */
type Column = { at: number; x: number; y: number }

/** 湖在 t 的大小（1 整個在，0 收掉）：問他之前縮回去 */
function lakeScale(t: number) {
  return 1 - ease(clamp01((t - SHRINK) / 0.32))
}

/** 某一刻整個湖的樣子（一組線段，每段有自己的名字，前後格一樣就合併成一段） */
function lakeFrame(t: number, ripples: Ripple[], col: Column): Map<string, Seg> {
  const out = new Map<string, Seg>()
  const s = lakeScale(t)
  if (s <= 0.02) return out
  const row = (key: string, y: number, rx: number, ry: number, color: string, layer: number) => {
    const q = (y - CY) / (ry * s)
    if (Math.abs(q) >= 1) return
    const w = rx * s * Math.sqrt(1 - q * q)
    if (w < 0.6) return
    out.set(key, { a: { x: CX - w, y }, b: { x: CX + w, y }, color, width: ROW_W, layer })
  }
  // 岸：比水大一圈的泥土色
  for (let i = 0; CY - RIM_Y + 0.8 + i * ROW <= CY + RIM_Y; i++) {
    const y = CY - RIM_Y + 0.8 + i * ROW
    row(`k${i}`, y, RIM_X, RIM_Y, RIM, 0)
  }
  // 水面：上面淺、下面深
  for (let i = 0; CY - RYL + 0.75 + i * ROW <= CY + RYL; i++) {
    const y = CY - RYL + 0.75 + i * ROW
    row(`w${i}`, y, RX, RYL, waterColor(y), 1)
  }
  if (s < 0.999) return out
  // 平平靜靜的幾道白色水紋（慢慢地左右漂一點點）
  const drift = Math.sin(Math.floor(t * 4) / 4 * 1.3) * 1.2
  const DASH: [number, number, number][] = [[70, 75.6, 7], [112, 75.2, 9], [92, 78.6, 6], [130, 80.8, 7], [62, 83.4, 8], [106, 85.3, 9]]
  DASH.forEach(([x, y, len], i) => {
    const d = i % 2 ? drift : -drift
    out.set(`d${i}`, { a: { x: x + d, y }, b: { x: x + d + len, y }, color: '#EAF8FF', width: 0.7, layer: 2 })
  })
  // 遠的岸邊一抹亮光
  out.set('hl', { a: { x: CX - 30, y: CY - RYL + 1.1 }, b: { x: CX + 30, y: CY - RYL + 1.1 }, color: '#C9EEFF', width: 0.8, layer: 2 })
  // 兩片荷葉（浮在水上、扁扁的圓）
  for (const [i, [x, y]] of ([[126, 84.5], [141, 77.2]] as [number, number][]).entries()) {
    out.set(`p${i}`, { a: { x: x - 2.6, y }, b: { x: x + 2.6, y }, color: '#3E9B3A', width: 2.3, layer: 2 })
    out.set(`pn${i}`, { a: { x: x + 0.4, y: y - 0.1 }, b: { x: x + 2.4, y: y - 0.5 }, color: '#76C95A', width: 0.6, layer: 2 })
  }
  // 岸邊的蘆葦（只有湖有，海沒有）：綠色的莖＋咖啡色的穗
  const REEDS: [number, number, number][] = [[42, 76, 11], [45, 75, 13], [48.5, 74.5, 9.5], [150, 75, 12], [153.5, 76, 10], [146.5, 74.2, 8.5]]
  REEDS.forEach(([x, y, h], i) => {
    const lean = (i % 2 ? 0.7 : -0.7) + Math.sin(Math.floor(t * 4) / 4 * 2 + i) * 0.35
    out.set(`r${i}`, { a: { x, y }, b: { x: x + lean, y: y - h }, color: '#4D8F2E', width: 0.75, layer: 3 })
    out.set(`rt${i}`, { a: { x: x + lean * 0.86, y: y - h * 0.86 }, b: { x: x + lean * 1.02, y: y - h * 1.02 + 0.4 }, color: '#7A4B23', width: 1.5, layer: 3 })
  })
  // 漣漪：一圈白色的扁圓，漾開、外面再跟一圈
  ripples.forEach((r, j) => {
    const a = (t - r.at) / r.life
    if (a < 0 || a > 1) return
    for (const [m, lag] of [[0, 0], [1, 0.22]] as [number, number][]) {
      const q = (a - lag) / (1 - lag)
      if (q <= 0) continue
      const rad = r.R * (0.3 + 0.7 * easeOut(q)) * (m ? 0.62 : 1)
      const N = 18
      for (let i = 0; i < N; i++) {
        const p0 = { x: r.x + Math.cos((i / N) * Math.PI * 2) * rad, y: r.y + Math.sin((i / N) * Math.PI * 2) * rad * 0.3 }
        const p1 = { x: r.x + Math.cos(((i + 1) / N) * Math.PI * 2) * rad, y: r.y + Math.sin(((i + 1) / N) * Math.PI * 2) * rad * 0.3 }
        if (!inside(p0) || !inside(p1)) continue
        // 快散掉的時候變細
        const w = (q > 0.75 ? 0.4 : 0.6) * (m ? 0.8 : 1)
        out.set(`z${j}-${m}-${i}`, { a: p0, b: p1, color: '#FFFFFF', width: w, layer: 4 })
      }
    }
  })
  // 水柱：先往上噴（白藍兩色），再一片一片往左倒到花生頭上
  const c = t - col.at
  if (c >= 0 && c < 0.75) {
    const up = easeOut(clamp01(c / 0.22))
    const fall = clamp01((c - 0.45) / 0.3)
    const H = 26 * up * (1 - 0.7 * fall)
    for (const [i, dx] of [-4.5, -1.5, 1.5, 4.5].entries()) {
      if (H < 1) break
      const h = H * (i === 1 || i === 2 ? 1 : 0.72)
      out.set(`c${i}`, { a: { x: col.x + dx * 0.6, y: col.y }, b: { x: col.x + dx, y: col.y - h }, color: i % 2 ? '#3D9BEA' : '#9FDBFF', width: 3.2, layer: 5 })
    }
  }
  return out
}

/** 水柱倒下來那一片：從水柱頂上往左畫一道道弧線，一段一段長過去，落在花生頭上 */
function sheet(at: number, from: Vec, head: Vec): Fx[] {
  const fx: Fx[] = []
  const arcs = [
    { apex: 50, land: { x: head.x + 2, y: head.y }, w: 4.4 },
    { apex: 53, land: { x: head.x - 6, y: head.y + 4 }, w: 3.6 },
    { apex: 55, land: { x: head.x + 9, y: head.y + 5 }, w: 3.0 },
  ]
  const N = 10
  for (const [j, a] of arcs.entries()) {
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const s = i / N
      const x = from.x + (a.land.x - from.x) * s
      const y = from.y + (a.land.y - from.y) * s - 4 * (from.y - a.apex) * s * (1 - s)
      return { x, y }
    })
    for (let i = 0; i < N; i++) {
      const t = at + j * 0.03 + i * 0.022
      fx.push({ at: t, dur: at + 0.5 - t, kind: 'line', actor: 'water', dx: pts[i].x, dy: pts[i].y, to: pts[i + 1], color: '#3D9BEA', width: a.w })
      if (i % 2 === 0) fx.push({ at: t, dur: at + 0.5 - t, kind: 'line', actor: 'water', dx: pts[i].x, dy: pts[i].y, to: pts[i + 1], color: '#D8F1FF', width: a.w * 0.35 })
    }
  }
  return fx
}

/** 把整支的湖每 0.05 秒取一格，前後格一樣的線段合成一段，變成一串 line 效果（照圖層排：岸、水、水紋、漣漪、水柱） */
function lakeFx(end: number, ripples: Ripple[], col: Column): Fx[] {
  const fx: (Fx & { layer: number })[] = []
  const open = new Map<string, { seg: Seg; at: number }>()
  const same = (p: Seg, q: Seg) => Math.abs(p.a.x - q.a.x) < 0.05 && Math.abs(p.a.y - q.a.y) < 0.05 && Math.abs(p.b.x - q.b.x) < 0.05 && Math.abs(p.b.y - q.b.y) < 0.05 && p.color === q.color && p.width === q.width
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    // 多留 0.12 秒跟下一段疊在一起，換段的時候不會閃
    fx.push({ at: o.at, dur: t - o.at + (last ? 0 : 0.12), kind: 'line', actor: 'water', dx: o.seg.a.x, dy: o.seg.a.y, to: o.seg.b, color: o.seg.color, width: o.seg.width, layer: o.seg.layer })
    open.delete(key)
  }
  const STEP = 0.05
  for (let n = 0; n * STEP < end - 1e-6; n++) {
    const t = +(n * STEP).toFixed(3)
    const frame = lakeFrame(t, ripples, col)
    for (const key of [...open.keys()]) {
      const now = frame.get(key)
      if (!now || !same(now, open.get(key)!.seg)) close(key, t, false)
    }
    for (const [key, seg] of frame) if (!open.has(key)) open.set(key, { seg, at: t })
  }
  for (const key of [...open.keys()]) close(key, end, true)
  // 第一格就要看得到整個湖：一開始就在的線提早 0.15 秒出來（線要 0.12 秒才長完）
  for (const f of fx) if (f.at === 0) { f.at = -0.15; f.dur = (f.dur ?? 0) + 0.15 }
  // 效果照陣列順序畫：照圖層排好，漣漪才會在水面上面
  return fx.sort((p, q) => p.layer - q.layer).map(({ layer: _l, ...f }) => f)
}

// ---- 時間表 ----
/** 三次打水漂（出手的那一刻） */
const T1 = 1.35
const T2 = 2.75
/** 第三次前停一拍：托著下巴瞄半天 */
const AIM = 3.95
const T3 = 4.8
/** 字框填滿、國字到正中央 */
const HOME = 6.6
const PARK = HOME + 0.85
/** 語詞：走進湖裡捧起湖水 */
const WORD = PARK + 0.05
const SCOOP = WORD + 0.3
/** 回馬槍：回頭舉起岸邊的大石頭 */
const R4 = 8.65
const T4 = 9.45
/** 大石頭「噗通」落水 */
const S4 = T4 + 0.42
/** 湖縮回去 */
const SHRINK = S4 + 0.62
/** 問他 */
const ASK = 10.85
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: 122, y: RY + 3 }

/** 石頭每一次碰到水面：[秒, x]；最後一個是沉下去的地方（第三次沒有沉，飛出畫面） */
type Throw = { T: number; hits: [number, number][]; sink: boolean }
const WATER_Y = CY - 0.5
const THROWS: Throw[] = [
  // 第 1 次：跳一下就沉
  { T: T1, hits: [[T1 + 0.27, 60], [T1 + 0.45, 67]], sink: true },
  // 第 2 次：跳三下
  { T: T2, hits: [[T2 + 0.25, 58], [T2 + 0.45, 74], [T2 + 0.62, 87], [T2 + 0.77, 96]], sink: true },
  // 第 3 次：跳過整個湖面，飛出畫面
  { T: T3, hits: [[T3 + 0.23, 57], [T3 + 0.41, 71], [T3 + 0.56, 84], [T3 + 0.69, 96], [T3 + 0.8, 107], [T3 + 0.9, 117], [T3 + 0.99, 126], [T3 + 1.07, 134], [T3 + 1.14, 141]], sink: false },
]
/** 第三次飛出畫面 */
const FLY_OUT = T3 + 1.14 + 0.65

/** 出手時手的位置（面向右、往後仰的時候） */
const HAND_UP: Vec = { x: SHORE + 13, y: RY - 8 }
const HAND_BACK: Vec = { x: SHORE + 8, y: RY - 10 }

const ripples: Ripple[] = []
THROWS.forEach((th, k) => th.hits.forEach(([at, x], i) => {
  const last = i === th.hits.length - 1
  ripples.push({ at, x, y: WATER_Y + (i % 2 ? 0.6 : -0.4), R: last && th.sink ? 15 + 1.2 * k : 9, life: 0.95 })
}))
// 回馬槍：大石頭落水，最大的一圈（兩圈接著漾開）
const SPLASH_AT: Vec = { x: 70, y: WATER_Y + 1 }
ripples.push({ at: S4, x: SPLASH_AT.x, y: SPLASH_AT.y, R: 34, life: 1.1 }, { at: S4 + 0.2, x: SPLASH_AT.x, y: SPLASH_AT.y, R: 24, life: 0.9 })
// 語詞：他在湖裡捧水，腳邊一圈
const WADE: Vec = { x: 70, y: RY + 7 }
ripples.push({ at: WORD + 0.3, x: WADE.x + 2, y: WATER_Y - 1.5, R: 14, life: 1.0 })

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 打水漂：往後仰（預備）→「咻」甩出去 → 每碰到水面一下「咚」＋水花＋一圈漣漪（漣漪在 lakeFrame 畫）。
 * k 越大，往後仰得越多、鏡頭震得越大。
 */
function skip(th: Throw, k: number, windup: number): Gag {
  const { T, hits } = th
  const moves: Move[] = [
    // 預備：身體往後仰，石頭跟著手往後
    { at: T - windup, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/throw' },
    { at: T - windup, actor: 'raccoon', do: 'rotateTo', amount: -(10 + 4 * k), dur: windup * 0.8 },
    { at: T - windup, actor: 'stone', do: 'moveTo', to: HAND_UP, dur: 0.01 },
    { at: T - windup + 0.02, actor: 'stone', do: 'moveTo', to: HAND_BACK, dur: windup * 0.8 },
    // 甩出去
    { at: T, actor: 'raccoon', do: 'rotateTo', amount: 10 + 4 * k, dur: 0.14, ease: 'out' },
    { at: T, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.2 },
    { at: T, actor: 'stone', do: 'moveTo', to: { x: hits[0][1], y: WATER_Y }, arc: 4, dur: hits[0][0] - T, ease: 'linear' },
  ]
  // 一下一下地跳：越跳越低
  for (let i = 1; i < hits.length; i++) {
    const [t0, x0] = hits[i - 1], [t1, x1] = hits[i]
    moves.push({ at: t0, actor: 'stone', do: 'moveTo', to: { x: x1, y: WATER_Y }, arc: Math.max(2.5, (x1 - x0) * 0.5), dur: t1 - t0, ease: 'linear' })
  }
  const [tl, xl] = hits[hits.length - 1]
  const end = th.sink ? tl + 0.12 : FLY_OUT
  if (th.sink) moves.push({ at: tl, actor: 'stone', do: 'moveTo', to: { x: xl + 2, y: WATER_Y + 2 }, dur: 0.12 })
  // 第三次：最後一下彈起來、飛過對岸、飛出畫面
  else moves.push({ at: tl, actor: 'stone', do: 'moveTo', to: { x: 172, y: 40 }, arc: 8, dur: FLY_OUT - tl, ease: 'linear' })

  const fx: Fx[] = [
    // 石頭：一顆扁扁的灰色小石片（掛在看不見的 stone 身上，畫在湖面上面）
    { at: T - windup, dur: end - (T - windup), kind: 'line', actor: 'stone', target: 'stone', dx: -3, dy: 0.5, color: '#565C68', width: 2.8 },
    { at: T - windup, dur: end - (T - windup), kind: 'line', actor: 'stone', target: 'stone', dx: -2.2, dy: -0.2, color: '#AEB5C0', width: 0.9 },
  ]
  // 第三次飛出畫面那一段：後面拖一條白白的速度線，看得出往右上飛走了
  if (!th.sink) fx.push({ at: tl + 0.04, dur: FLY_OUT - tl - 0.04, kind: 'line', actor: 'stone', target: 'stone', dx: -9, dy: 4, color: '#FFFFFF', width: 0.9 })
  const cues: Cue[] = [{ at: T, sfx: 'whoosh' }]
  const camera: Camera[] = []
  hits.forEach(([at, x], i) => {
    const last = i === hits.length - 1
    fx.push({ at, kind: 'burst', x, y: WATER_Y - 2, emoji: '💦', n: last && th.sink ? 6 : 3, dur: 0.4, scale: last && th.sink ? 1.3 : 0.9 })
    cues.push({ at, sfx: last && th.sink ? 'plop' : 'tap' })
  })
  // 最後那一下：鏡頭震一下（一次比一次大）
  camera.push({ at: tl, dur: 0.3, do: 'shake', amount: 0.6 + 0.4 * k })
  return { moves, fx, camera, cues }
}

// 第 1 次：跳一下就沉——他傻眼
const g1 = skip(THROWS[0], 0, 0.4)
const sink1 = THROWS[0].hits[1][0]
g1.moves.push(
  { at: sink1 + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
)
g1.fx.push({ at: sink1 + 0.2, kind: 'sweat', actor: 'raccoon', dx: 6 })
// 第 2 次：跳三下——他開心得跳起來
const g2 = skip(THROWS[1], 1, 0.4)
const sink2 = THROWS[1].hits[3][0]
g2.moves.push(
  { at: sink2 + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
  { at: sink2 + 0.05, actor: 'raccoon', do: 'hop', amount: 5, dur: 0.3 },
)
// 停一拍：托著下巴瞄半天（眼睛跟著湖面看過去），再往後仰到底、抖著蓄力
const pause: Move[] = [
  { at: AIM, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
  { at: AIM + 0.05, actor: 'raccoon', do: 'tilt', amount: 6, dur: 0.4 },
]
const g3 = skip(THROWS[2], 2, 0.5)
g3.moves.push(
  { at: T3 - 0.45, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.4 },
  // 飛出畫面了！嘴巴張好大，然後開心跳起來
  { at: T3 + 1.18, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  { at: T3 + 1.62, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
  { at: T3 + 1.62, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.35 },
)
g3.fx.push({ at: AIM + 0.1, kind: 'pop', actor: 'raccoon', emoji: '🎯', dx: 4 })
g3.cues.push({ at: FLY_OUT - 0.25, sfx: 'whoosh' }, { at: FLY_OUT - 0.05, sfx: 'boing' })

/** 第 4 次：最大的石頭，一下都沒跳，「噗通」 */
const HEAD4: Vec = { x: SHORE, y: RY - 14 }
const g4: Gag = { moves: [], fx: [], camera: [], cues: [] }
g4.moves.push(
  // 回頭看到岸邊的大石頭，舉起來（好重，抖抖抖）
  { at: R4, actor: 'raccoon', do: 'flip' },
  { at: R4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
  { at: R4 + 0.2, actor: 'raccoon', do: 'flip' },
  { at: R4 + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/lift' },
  { at: R4 + 0.2, actor: 'boulder', do: 'moveTo', to: { x: SHORE, y: RY - 19 }, arc: 6, dur: 0.3, ease: 'out' },
  { at: R4 + 0.5, actor: 'raccoon', do: 'squash', amount: 0.12, dur: 0.3 },
  { at: R4 + 0.5, actor: 'raccoon', do: 'shake', amount: 0.9, dur: 0.3 },
  { at: R4 + 0.5, actor: 'boulder', do: 'shake', amount: 0.9, dur: 0.3 },
  // 用力一甩
  { at: T4 - 0.02, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/throw' },
  { at: T4, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.2 },
  { at: T4, actor: 'boulder', do: 'moveTo', to: { x: SPLASH_AT.x, y: SPLASH_AT.y + 6 }, arc: 10, dur: S4 - T4, ease: 'in' },
  { at: T4, actor: 'boulder', do: 'rotateTo', amount: 150, dur: S4 - T4 },
  { at: S4 + 0.12, actor: 'boulder', do: 'vanish', dur: 0.01 },
  // 水柱噴起來：傻眼；整片水倒在他頭上：被壓扁一下、濕答答
  { at: S4 + 0.06, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  { at: S4 + 0.38, actor: 'raccoon', do: 'squash', amount: 0.3, dur: 0.3 },
)
g4.fx.push(
  { at: R4 + 0.5, kind: 'sweat', actor: 'raccoon', dx: 8, dy: -4 },
  { at: S4, kind: 'burst', x: SPLASH_AT.x, y: SPLASH_AT.y - 4, emoji: '💦', n: 9, dur: 0.5, scale: 1.7 },
  ...sheet(S4 + 0.2, { x: SPLASH_AT.x - 1, y: SPLASH_AT.y - 24 }, HEAD4),
  { at: S4 + 0.38, kind: 'rain', actor: 'raccoon', emoji: '💧', n: 9, dur: 0.6, dy: -2 },
)
g4.camera.push(
  { at: S4, dur: 0.45, do: 'punch', amount: 0.05, to: { x: 60, y: 62 } },
  { at: S4, dur: 0.4, do: 'shake', amount: 2.2 },
)
g4.cues.push({ at: T4, sfx: 'whoosh' }, { at: S4, sfx: 'splash' }, { at: S4 + 0.05, sfx: 'plop' }, { at: S4 + 0.1, sfx: 'rumble' }, { at: S4 + 0.4, sfx: 'splash' })

const builds: Build[] = [
  // 漣漪裡濺起來的水：氵 → 古（十＋口）→ 月
  { at: sink1 + 0.05, dur: 0.5, strokes: [0, 1, 2], from: { x: 67, y: WATER_Y - 3 }, color: partColor('氵') },
  { at: sink2 + 0.05, dur: 0.5, strokes: [3, 4], from: { x: 96, y: WATER_Y - 3 }, color: partColor('十') },
  { at: sink2 + 0.1, dur: 0.5, strokes: [5, 6, 7], from: { x: 96, y: WATER_Y - 3 }, color: partColor('口') },
  { at: T3 + 1.15, dur: 0.5, strokes: [8, 9, 10, 11], from: { x: 141, y: WATER_Y - 3 }, color: partColor('月') },
]

const clip: Clip = {
  format: 2,
  char: '湖',
  meta: { theme: '湖邊打水漂', cast: '浣熊花生＋大石頭', gags: ['浣熊花生在平平靜靜的湖邊打水漂，每次往後一仰把小石頭甩出去，石頭在湖面咚咚咚地跳、每跳一下漾開一圈漣漪，一次比一次多下、一次比一次遠：跳一下就沉→跳三下→停一拍，他瞄半天用力一甩，跳過整個湖面飛出畫面；回馬槍是他得意地舉起岸邊最大的石頭一甩，一下都沒跳就噗通沉下去，濺起最大的水柱整個倒在他頭上'] },
  duration: 15,
  // 淡藍的天、綠油油的草地：中間一池藍色的湖跳得出來
  bg: { top: '#CDEBFF', bottom: '#F2FAFF', floor: '#A6D98A', scenery: 'hills' },
  actors: [
    // 看不見的錨點：湖面、漣漪、水柱的線都掛在 water 身上（在 0,0，不會動）；stone 是打水漂的小石片
    { id: 'water', emoji: '🟦', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'stone', emoji: '🟦', x: HAND_UP.x, y: HAND_UP.y, size: 1, hidden: true, float: true },
    { id: 'boulder', emoji: 'prop:rock', x: BX, y: BY, size: BS, pivot: 'center' },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: SHORE, y: RY, size: RS, flip: true },
  ],
  moves: [
    // 開場：走到湖邊，抬頭指著字框「湖」
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -14, y: RY }, dur: 0.45 },
    { at: 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    ...g1.moves,
    ...g2.moves,
    ...pause,
    ...g3.moves,
    // 語詞：走進湖裡（水淹到腿），捧起湖水往上一潑
    { at: WORD, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: WORD, actor: 'raccoon', do: 'moveTo', to: WADE, dur: 0.3, ease: 'out' },
    { at: SCOOP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: SCOOP, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    // 走回岸上
    { at: R4 - 0.32, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: R4 - 0.32, actor: 'raccoon', do: 'moveTo', to: { x: SHORE, y: RY }, dur: 0.3 },
    ...g4.moves,
    // 問他：從右邊走回來，轉向國字、變大
    { at: ASK + 0.02, actor: 'raccoon', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.05, actor: 'raccoon', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: ASK + 0.06, actor: 'raccoon', do: 'flip' },
    { at: ASK + 0.1, actor: 'raccoon', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.12, actor: 'raccoon', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: ASK_SAY + 1.0, actor: 'raccoon', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.16, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'raccoon', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就在上方正中（湖在下面、他在左岸）
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給花生
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 58, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...lakeFx(ASK, ripples, { at: S4, x: SPLASH_AT.x, y: SPLASH_AT.y }),
    ...g1.fx,
    ...g2.fx,
    ...g3.fx,
    // 語詞：捧起來的湖水往上一潑
    { at: SCOOP, kind: 'burst', x: WADE.x + 6, y: WATER_Y - 8, emoji: '💦', n: 7, dur: 0.55, scale: 1.4 },
    { at: SCOOP + 0.05, kind: 'fountain', x: WADE.x + 8, y: WATER_Y - 4, emoji: '💧', n: 7, dur: 0.6 },
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個全景的 zoom，蓋掉自動取景（推近會把湖切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '湖' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '湖' },
    { at: SCOOP, sfx: 'splash' },
    { at: SCOOP + 0.02, say: '湖水' },
    ...g4.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '湖' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
