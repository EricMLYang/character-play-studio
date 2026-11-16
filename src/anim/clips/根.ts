import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { easeBy } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 根（v2）：拔不起來。畫面下半是土的剖面（上緣是地面線），地上長著植物，地下看得到咖啡色的根。
// 愛現的忍者小老鼠每次站在同一個地方、抓住地上的植物往上一拔——「啵」！底下拖出來的根一次比一次長、一次比一次難拔：
// 一株小芽，根短短的，一拔就起來，他得意地看它飛走（木）→ 一棵小樹苗，根好長，拔出來他往後一屁股跌坐（艮的上半）→
// 先停一拍：地底「轟隆隆」長出一棵小樹，地下的根又粗又多、抓得緊緊的；他托下巴冒汗，再拔——拔到發抖，樹一動也不動，
// 手一滑整個人往後飛出去摔扁（艮的下半從抓緊的根裡震出來）。字拼好放大時，地面整片往下讓位、小樹退到右邊。
// 語詞那一刻：國字讓回左上，地下的根扭一扭，小老鼠蹲下來看：「樹根」。
// 回馬槍（第四次）：他跺腳、用盡全力再拔一次——樹還是不動，反而是一條根從土裡鑽出來捲住他的腳，「咻」地把他拉進土裡，
// 只露出一顆頭，像一株剛種下去的小芽。他「啵」地自己拔出來跳開，小樹被根拉回土裡、土也退掉。
// 最後畫面暗下來只剩「根」，小老鼠問「這是什麼字？」，手放耳邊等他回答，再指著字說「根！」，然後退場只留字。
// 刻意不跟「拉」（拉繩子拉出越來越大的動物、反被拉出畫面）、「長」（拉蛇尾巴）、「菜」（種菜被偷吃）、「昨」（芽長成樹）、
// 「草」（剪草又長）、「樹」（敲樹幹住戶探頭）撞；也不演樹枝（之後有「枝」）：這支只演「往上拔、底下的根一次比一次大」。
// 根、根、樹根、這是什麼字？、根

// ---- 站位 ----
/** 地面線（土的剖面從這裡往下） */
const GY = 58
/** 植物長在同一個地方 */
const XP = 100
/** 忍者小老鼠（hero:mouse；圖朝左，flip 才面向右邊的植物），每次都站在同一個地方 */
const MS = 36
const XM = 84
const my = (g: number) => g - 0.42 * MS
/** 第二次跌坐的地方、第三次摔扁的地方（左邊，國字回中央時不擋字） */
const SIT = XM - 17
const FLAT = 24
/** 語詞那一刻蹲著看的地方 */
const PEEK = 66
/** 小芽／小樹苗共用一個角色（底子 size 寫大的那個：小樹苗），小芽縮小 */
const PS = 28
const SPROUT_K = 18 / PS
/** 小樹 */
const TS = 46
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 27, y: 19 }
const PARK_K = 0.46

// ---- 時間表 ----
const G1 = 1.05
const POP1 = G1 + 0.55
const GROW2 = POP1 + 0.8
const G2 = GROW2 + 0.5
const POP2 = G2 + 0.6
const GROW3 = POP2 + 0.8
/** 第三次前停一拍：爬起來、托下巴冒汗 */
const PAUSE = GROW3 + 0.6
const G3 = PAUSE + 0.5
/** 拔到發抖、手一滑 */
const SNAP = G3 + 1.0
const FLY = 0.45
/** 字框填滿、國字到正中央（地面往下讓位、小樹退到右邊） */
const HOME = SNAP + FLY + 0.05
const PARK = HOME + 0.8
/** 語詞 */
const WORD = PARK + 0.25
/** 回馬槍 */
const R4 = WORD + 0.65
const STOMP = R4 + 0.25
const G4 = STOMP + 0.2
const GRAB = G4 + 0.5
const YANK = GRAB + 0.25
/** 他「啵」地自己拔出來；小樹被根拉回土裡、土退掉 */
const OUT = YANK + 0.45
const ASK = OUT + 0.5
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: 124, y: 74 - 0.42 * MS + 3 }
/** 被拉進土裡沉多深（只露出一顆頭） */
const SINK = 10

const clamp01 = (p: number) => Math.max(0, Math.min(1, p))
const ease = easeBy('inOut')
const easeOut = (p: number) => 1 - (1 - p) * (1 - p)
const easeIn = (p: number) => p * p
const q = (v: number) => Math.round(v * 20) / 20

/** 照關鍵格內插（inOut） */
function keyed(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]
      return v0 + (v1 - v0) * ease(clamp01((t - t0) / (t1 - t0)))
    }
  }
  return keys[keys.length - 1][1]
}

// ---- 地面：國字放大時整片往下讓位（像鏡頭往上看），問他之前整片退到畫面下面 ----
const DROP = 23
const HOME_IN = HOME - 0.15
const PARK_OUT = PARK
const GROUND: [number, number][] = [
  [HOME_IN, 0], [HOME_IN + 0.4, DROP], [PARK_OUT, DROP], [PARK_OUT + 0.4, 0], [OUT + 0.1, 0], [OUT + 0.45, 40],
]
const groundAt = (t: number) => GY + keyed(GROUND, t)

// ---- 小樹：國字放大時退到右邊、縮一點；回馬槍後被根拉回土裡 ----
const TREE_SIDE = { x: 139, k: 0.85 }
const TREE_X: [number, number][] = [[HOME_IN, XP], [HOME_IN + 0.4, TREE_SIDE.x], [PARK_OUT, TREE_SIDE.x], [PARK_OUT + 0.4, XP]]
const TREE_K: [number, number][] = [[HOME_IN, 1], [HOME_IN + 0.4, TREE_SIDE.k], [PARK_OUT, TREE_SIDE.k], [PARK_OUT + 0.4, 1]]
/** 回馬槍後被根拉回土裡：往下沉多少 */
const TREE_SINK: [number, number][] = [[OUT, 0], [OUT + 0.3, 50]]
function treeAt(t: number) {
  return { x: keyed(TREE_X, t), y: t > OUT ? GY + keyed(TREE_SINK, t) : groundAt(t), k: keyed(TREE_K, t) }
}

// ---- 根：一條一條的折線（以植物的根部為原點，y 往下），用 tube 畫成咖啡色、深色描邊的粗根 ----
type Root = { pts: [number, number][]; w0: number; w1: number; s?: number }
const ROOT_COLOR = '#7A4521'

/** 小芽：根短短的 */
const R1: Root[] = [
  { pts: [[0, 0], [-1.4, 3.4], [-3.2, 6.2], [-4, 8.4]], w0: 1.9, w1: 1.0 },
  { pts: [[0, 0], [1.6, 3.2], [3.4, 5.8], [4.4, 7.8]], w0: 1.9, w1: 1.0 },
  { pts: [[0, 0], [0.3, 4.4], [-0.4, 9.4]], w0: 1.9, w1: 1.0 },
]
/** 小樹苗：根好長 */
const R2: Root[] = [
  { pts: [[0, 0], [1.2, 6], [-1, 12], [1.2, 18], [0, 24.5]], w0: 2.7, w1: 1.2 },
  { pts: [[0.4, 3], [5.5, 5.5], [10, 9]], w0: 1.9, w1: 1.0, s: 0.15 },
  { pts: [[1.2, 6], [-4.5, 10], [-9, 15]], w0: 1.9, w1: 1.0, s: 0.25 },
  { pts: [[-1, 12], [4.5, 16], [8, 21]], w0: 1.8, w1: 1.0, s: 0.45 },
  { pts: [[1.2, 18], [-3.5, 21], [-6, 24.5]], w0: 1.7, w1: 1.0, s: 0.65 },
]
/** 小樹：根又粗又多 */
const R3: Root[] = [
  { pts: [[0, 0], [1.5, 9], [-1, 19], [0.5, 29]], w0: 4.6, w1: 1.8 },
  { pts: [[-2, 0], [-11, 5], [-21, 10], [-31, 17], [-38, 23]], w0: 4.4, w1: 1.6 },
  { pts: [[2, 0], [11, 5], [21, 10], [31, 16], [39, 22]], w0: 4.4, w1: 1.6 },
  { pts: [[-1, 1], [-7, 10], [-13, 19], [-17, 28]], w0: 4.0, w1: 1.6 },
  { pts: [[1, 1], [7, 10], [12, 19], [16, 28]], w0: 4.0, w1: 1.6 },
  { pts: [[-21, 10], [-23, 17], [-26, 22]], w0: 2.4, w1: 1.1, s: 0.5 },
  { pts: [[21, 10], [24, 16], [26, 21]], w0: 2.4, w1: 1.1, s: 0.5 },
  { pts: [[-31, 17], [-35, 13.5], [-41, 13.5]], w0: 2.2, w1: 1.0, s: 0.7 },
  { pts: [[31, 16], [36, 12.5], [42, 12.5]], w0: 2.2, w1: 1.0, s: 0.7 },
  { pts: [[-13, 19], [-8, 25], [-6, 30]], w0: 2.2, w1: 1.0, s: 0.6 },
  { pts: [[12, 19], [7, 24], [6, 30]], w0: 2.2, w1: 1.0, s: 0.6 },
  { pts: [[1.5, 9], [6, 14]], w0: 2.0, w1: 1.0, s: 0.4 },
]

type Seg = { a: Vec; b: Vec; w: number }

/**
 * 一組根在某一刻的樣子：base 是根部、k 縮放、sx 左右收攏（拔出來吊著時往中間收）、
 * g 長到哪裡（0～1，分岔晚一點長）、wig 根尖扭動的幅度（抓緊、語詞那一刻）。
 */
function drawRoots(out: Map<string, Seg>, id: string, roots: Root[], base: Vec, o: { k?: number; sx?: number; g?: number; wig?: number; t: number }) {
  const k = o.k ?? 1, sx = o.sx ?? 1, g = o.g ?? 1, wig = o.wig ?? 0
  roots.forEach((r, ri) => {
    const s = r.s ?? 0
    const gr = clamp01((g - s) / (1 - s))
    if (gr <= 0) return
    const n = r.pts.length - 1
    const shown = gr * n
    for (let i = 0; i < n && i < shown; i++) {
      const f = Math.min(1, shown - i)
      const p0 = r.pts[i], p1 = r.pts[i + 1]
      const e0 = [p0[0], p0[1]], e1 = [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f]
      const sway = (j: number) => wig * (j / n) * Math.sin(o.t * 22 + ri * 1.7 + j)
      const A = { x: q(base.x + (e0[0] * sx + sway(i)) * k), y: q(base.y + e0[1] * k) }
      const B = { x: q(base.x + (e1[0] * sx + sway(i + f)) * k), y: q(base.y + e1[1] * k) }
      const w = (r.w0 + (r.w1 - r.w0) * ((i + 0.5) / n)) * k
      out.set(`${id}-${ri}-${i}`, { a: A, b: B, w: Math.round(w * 20) / 20 })
    }
  })
}

// ---- 拔出來的植物往上飛：先往上衝（根從土裡拖出來）、在半空停一下（看清楚根多長）、再往右上飛出畫面 ----
function flight(t: number, pop: number, depth: number): { dx: number; dy: number; sx: number } {
  const u = t - pop
  const top = depth + 7
  if (u <= 0) return { dx: 0, dy: 0, sx: 1 }
  if (u < 0.2) return { dx: 0, dy: -top * easeOut(u / 0.2), sx: 1 - 0.4 * easeOut(u / 0.2) }
  if (u < 0.42) return { dx: 0, dy: -top - 3 * easeOut((u - 0.2) / 0.22), sx: 0.6 }
  const v = easeIn(clamp01((u - 0.42) / 0.33))
  return { dx: 70 * v, dy: -top - 3 - 60 * v, sx: 0.6 }
}
const FLIGHT_END = 0.75
/** 拔的時候植物被往上扯、抖一抖（還沒出來） */
const tug = (t: number, from: number, to: number, amt: number) => (t > from && t < to ? -amt * (0.6 + 0.4 * Math.sin((t - from) * 40)) : 0)

/** 小芽／小樹苗的根部在哪裡（看不到時 null） */
function plantBase(t: number): { base: Vec; sx: number; roots: Root[]; g: number } | null {
  if (t < GROW2 - 0.05) {
    if (t > POP1 + FLIGHT_END) return null
    const f = flight(t, POP1, 9.4)
    return { base: { x: XP + f.dx, y: GY + f.dy + tug(t, G1 + 0.2, POP1, 0.8) }, sx: f.sx, roots: R1, g: 1 }
  }
  if (t > POP2 + FLIGHT_END) return null
  const f = flight(t, POP2, 24.5)
  return { base: { x: XP + f.dx, y: GY + f.dy + tug(t, G2 + 0.2, POP2, 1.2) }, sx: f.sx, roots: R2, g: clamp01((t - GROW2) / 0.5) }
}

/** 回馬槍：從小樹左邊那條根鑽出土、捲住他的腳的那條根 */
function grabRoot(out: Map<string, Seg>, t: number) {
  if (t < GRAB || t > OUT + 0.15) return
  const g = t < OUT ? clamp01((t - GRAB) / 0.15) : 1 - clamp01((t - OUT) / 0.15)
  const foot = { x: XM + 3, y: GY + (t > YANK ? SINK * easeIn(clamp01((t - YANK) / 0.12)) : 0) - 2.2 }
  const tr = treeAt(t)
  const p0 = { x: tr.x - 11, y: GY + 5 }
  const pts: Vec[] = [p0, { x: p0.x - 5, y: Math.min(GY + 2, foot.y + 6) }, foot, { x: foot.x + 3.2, y: foot.y - 1.6 }, { x: foot.x + 4.2, y: foot.y + 1.2 }]
  const n = pts.length - 1
  for (let i = 0; i < n && i < g * n; i++) {
    const f = Math.min(1, g * n - i)
    const a = pts[i], b = { x: a.x + (pts[i + 1].x - a.x) * f, y: a.y + (pts[i + 1].y - a.y) * f }
    out.set(`grab-${i}`, { a: { x: q(a.x), y: q(a.y) }, b: { x: q(b.x), y: q(b.y) }, w: i < 2 ? 2.8 : 2.2 })
  }
}

/** 某一刻所有的根 */
function rootsFrame(t: number): Map<string, Seg> {
  const out = new Map<string, Seg>()
  const p = plantBase(t)
  if (p) drawRoots(out, 'p', p.roots, p.base, { sx: p.sx, g: p.g, t })
  if (t >= GROW3 && t < OUT + 0.35) {
    const tr = treeAt(t)
    // 抓緊：第三次、回馬槍拔的時候根尖扭動；語詞那一刻也扭一扭
    const wig = (t > G3 + 0.2 && t < SNAP) || (t > G4 + 0.15 && t < YANK) ? 1.4 : t > WORD && t < WORD + 0.6 ? 2.2 : 0
    drawRoots(out, 't', R3, { x: tr.x, y: tr.y }, { k: tr.k, g: clamp01((t - GROW3) / 0.6), wig, t })
  }
  grabRoot(out, t)
  return out
}

// ---- 土的剖面：一排一排的土色粗線疊起來（掛在看不見的錨點上，錨點在 0,0，dx／dy 就是舞台座標） ----
type Line = { a: Vec; b: Vec; color: string; width: number; tube?: boolean }
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
const ROW = 2.3
const ROW_W = 3.1
/** 土裡的小石頭（x、離地面多深） */
const PEBBLES: [number, number][] = [[14, 7], [36, 19], [52, 9], [150, 8], [128, 27], [8, 26], [62, 29], [148, 24]]

function soilFrame(t: number): Map<string, Line> {
  const out = new Map<string, Line>()
  const g = q(groundAt(t))
  if (g > 91) return out
  // 每排的高度釘在固定的格子上：地面往下讓位時，上面幾排直接收掉、不跟著移動（線效果換格會從左邊長出來，看起來會拖影）；
  // 只有最上面那一排跟著地面走。每排切成短短幾段，重新長出來時看不出來
  const rows: [string, number][] = []
  for (let i = 0; GY + 1.55 + i * ROW < 92.5; i++) {
    const y = q(GY + 1.55 + i * ROW)
    if (y > g + 2.2) rows.push([`r${i}`, y])
  }
  for (const [id, y] of rows) {
    const color = mix('#E0BC86', '#B98B57', clamp01((y - GY) / 30))
    for (let j = 0; j < 18; j++) out.set(`${id}-${j}`, { a: { x: -10 + j * 10, y }, b: { x: j * 10, y }, color, width: ROW_W })
  }
  PEBBLES.forEach(([x, d], i) => {
    if (g + d < 91) out.set(`s${i}`, { a: { x, y: q(g + d) }, b: { x: x + 1.4, y: q(g + d - 0.3) }, color: '#9C8C7C', width: 1.8 })
  })
  // 地面線：一條綠綠的草皮，下面一條深一點的土邊
  // 跟著地面走的最上面一排土、草皮：用 tube（不會長出來也不會淡掉，移動時不拖影；深色描邊剛好是土的上緣）
  out.set('top', { a: { x: -12, y: q(g + 1.9) }, b: { x: 172, y: q(g + 1.9) }, color: '#E0BC86', width: 3.2, tube: true })
  out.set('grass', { a: { x: -12, y: q(g) }, b: { x: 172, y: q(g) }, color: '#5BAA3C', width: 1.8, tube: true })
  return out
}

const STEP = 0.04
/** 每 STEP 取一格（取那一格中間的時間），前後格一樣的合成一段 */
function sampled<S>(end: number, frame: (t: number) => Map<string, S>, same: (p: S, s: S) => boolean, emit: (s: S, at: number, dur: number, last: boolean) => Fx, start = 0): Fx[] {
  const fx: Fx[] = []
  const open = new Map<string, { seg: S; at: number }>()
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    fx.push(emit(o.seg, o.at, t - o.at, last))
    open.delete(key)
  }
  for (let n = 0; start + n * STEP < end - 1e-6; n++) {
    const t = +(start + n * STEP).toFixed(3)
    const frame0 = frame(t + STEP / 2)
    for (const key of [...open.keys()]) {
      const now = frame0.get(key)
      if (!now || !same(now, open.get(key)!.seg)) close(key, t, false)
    }
    for (const [key, seg] of frame0) if (!open.has(key)) open.set(key, { seg, at: t })
  }
  for (const key of [...open.keys()]) close(key, end, true)
  return fx
}
const sameV = (a: Vec, b: Vec) => a.x === b.x && a.y === b.y

const soilFx = sampled(ASK, soilFrame, (p, s) => sameV(p.a, s.a) && sameV(p.b, s.b) && p.width === s.width,
  (s, at, dur, last) => s.tube ? { at, dur: dur + 0.002, kind: 'tube', actor: 'soil', dx: s.a.x, dy: s.a.y, to: s.b, color: s.color, width: s.width, n: 999 } : ({
    // 一開場就在（線效果前 0.12 秒會從左邊長出來，提早開始）；換格時跟下一段疊 0.12 秒，不會閃
    at: at === 0 ? -0.15 : at, dur: dur + (at === 0 ? 0.15 : 0) + (last ? 0 : 0.12),
    kind: 'line', actor: 'soil', dx: s.a.x, dy: s.a.y, to: s.b, color: s.color, width: s.width,
  }))
const rootFx = sampled(ASK, rootsFrame, (p, s) => sameV(p.a, s.a) && sameV(p.b, s.b) && p.w === s.w,
  (s, at, dur) => ({ at, dur: dur + 0.002, kind: 'tube', actor: 'soil', dx: s.a.x, dy: s.a.y, to: s.b, color: ROOT_COLOR, width: s.w, n: 999 }))

// ---- 植物跟著根部走：每 STEP 一段直線 moveTo（跟根同一套時間） ----
function track(actor: string, from: number, to: number, pos: (t: number) => Vec): Move[] {
  const out: Move[] = []
  for (let t = from; t < to - 1e-6; t += STEP) {
    const t1 = Math.min(to, t + STEP)
    out.push({ at: +t.toFixed(3), actor, do: 'moveTo', to: pos(t1), dur: +(t1 - t).toFixed(3), ease: 'linear' })
  }
  return out
}
const plantPos = (size: number) => (t: number): Vec => {
  const p = plantBase(t)!
  return { x: q(p.base.x), y: q(p.base.y - 0.42 * size) }
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點：他伸手（reach）抓住植物 → 雙手往後拉、身體後倒（pull）抖 → 「啵」！
 * k 是第幾次：0 一拔就起來、1 拔出來往後跌坐、2 拔不動（沒有啵）手一滑往後飛出去摔扁。
 */
function yank(g: number, k: number, pop: number): Gag {
  const pull = g + 0.2
  const moves: Move[] = [
    { at: g, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: pull, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/pull' },
    { at: pull + 0.02, actor: 'mouse', do: 'shake', amount: 0.5 + 0.4 * k, dur: pop - pull },
  ]
  const fx: Fx[] = [
    { at: pull + 0.05, kind: 'sweat', actor: 'mouse', dx: -8, dur: pop - pull },
  ]
  const camera: Camera[] = []
  const cues: Cue[] = [{ at: pull, sfx: 'slide' }]
  if (k < 2) {
    // 啵！土塊噴起來，根從土裡拖出來
    fx.push(
      { at: pop, kind: 'burst', x: XP, y: GY - 2, emoji: '💥', dur: 0.4, scale: 1 + 0.35 * k },
      { at: pop, kind: 'fountain', x: XP, y: GY, emoji: '🟤', n: 5 + 2 * k, dur: 0.55 },
    )
    camera.push({ at: pop, dur: 0.4, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: XP - 6, y: 48 } }, { at: pop, dur: 0.3, do: 'shake', amount: 0.9 + 0.6 * k })
    cues.push({ at: pop, sfx: 'plop' }, { at: pop + 0.05, sfx: 'whoosh' })
  }
  if (k === 0) {
    // 一拔就起來：往後小退一步，舉手得意地看它飛走
    moves.push(
      { at: pop, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
      { at: pop, actor: 'mouse', do: 'moveTo', to: { x: XM - 4, y: my(GY) }, dur: 0.2, ease: 'out' },
      { at: pop, actor: 'mouse', do: 'hop', amount: 4, dur: 0.35 },
      { at: pop + 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    )
  } else if (k === 1) {
    // 根好長：拔出來那一下往後飛，一屁股跌坐
    moves.push(
      { at: pop, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: pop, actor: 'mouse', do: 'moveTo', to: { x: SIT, y: my(GY) }, arc: 9, dur: 0.32, ease: 'out' },
      { at: pop + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    )
    cues.push({ at: pop + 0.32, sfx: 'bonk' })
  }
  return { moves, fx, camera, cues }
}

const g1 = yank(G1, 0, POP1)
const g2 = yank(G2, 1, POP2)
const g3 = yank(G3, 2, SNAP)
// 第三次：拔到發抖，樹一動也不動、根抓得緊緊的；手一滑整個人往後飛出去摔扁
g3.moves.push(
  { at: G3 + 0.2, actor: 'tree', do: 'shake', amount: 0.5, dur: SNAP - G3 - 0.2 },
  { at: SNAP, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
  { at: SNAP, actor: 'mouse', do: 'moveTo', to: { x: FLAT, y: my(GY) }, arc: 4, dur: FLY, ease: 'out' },
  // 飛到一半就摔成扁扁的（壓低身子，不碰到左上的字框）
  { at: SNAP + 0.08, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
)
g3.fx.push(
  { at: G3 + 0.55, kind: 'pop', actor: 'mouse', emoji: '💢', dx: 4, scale: 1.3 },
  { at: SNAP, kind: 'burst', x: XP - 6, y: GY - 14, emoji: '💥', dur: 0.4, scale: 1.7 },
  { at: SNAP + FLY, kind: 'puff', actor: 'mouse', dur: 0.4 },
)
g3.camera.push(
  { at: G3 + 0.2, dur: SNAP - G3 - 0.2, do: 'shake', amount: 0.5 },
  { at: SNAP, dur: 0.35, do: 'shake', amount: 2.2 },
)
g3.cues.push({ at: G3 + 0.25, sfx: 'rumble' }, { at: SNAP, sfx: 'boing' }, { at: SNAP + FLY, sfx: 'bonk' })

const builds: Build[] = [
  // 小芽「啵」地拔出來：木；小樹苗長長的根：艮的上半；小樹抓緊的根被扯到震出來：艮的下半
  { at: POP1 + 0.08, dur: 0.5, strokes: [0, 1, 2, 3], from: 'plant', color: partColor('木') },
  { at: POP2 + 0.15, dur: 0.5, strokes: [4, 5, 6], from: { x: XP, y: GY - 18 }, color: partColor('艮') },
  { at: SNAP, dur: 0.45, strokes: [7, 8, 9], from: { x: XP, y: GY + 14 }, color: partColor('艮') },
]

const clip: Clip = {
  format: 2,
  char: '根',
  meta: { theme: '拔不起來', cast: '忍者小老鼠＋地上的植物（小芽、小樹苗、小樹）', gags: ['忍者小老鼠每次抓住地上的植物往上一拔「啵」，土的剖面裡看得到根，拖出來的根一次比一次長、一次比一次難拔：小芽的根短短的一拔就起來，他得意地看它飛走→小樹苗的根好長，拔出來他往後一屁股跌坐→停一拍，地底長出一棵小樹，根又粗又多抓得緊緊的，他拔到發抖拔不動、手一滑摔扁；回馬槍是他跺腳用盡全力再拔，樹還是不動，反而是一條根鑽出來捲住他的腳，「咻」地把他拉進土裡只露出一顆頭，像剛種下去的小芽'] },
  duration: 15,
  // 淺藍的天、草綠的地；土是淺淺的土黃色，咖啡色的根跳得出來
  bg: { top: '#BFE3FF', bottom: '#EEF8FF', floor: '#A9D47A', scenery: 'hills' },
  actors: [
    // 看不見的錨點：土和根的線都掛在它身上（在 0,0，不會動）
    { id: 'soil', emoji: '🟫', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'plant', emoji: '🌱', x: XP, y: GY - 0.42 * PS, size: PS, float: true },
    { id: 'tree', emoji: 'prop:tree', x: XP, y: GY - 0.42 * TS, size: TS, float: true, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/dash', x: XM, y: my(GY), size: MS, flip: true },
  ],
  moves: [
    { at: 0, actor: 'plant', do: 'scaleTo', amount: SPROUT_K, dur: 0.01 },
    // 開場：衝進來，轉頭指著字框「根」，再轉回來看地上的小芽
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -20, y: my(GY) }, dur: 0.4, ease: 'out' },
    { at: 0.42, actor: 'mouse', do: 'flip' },
    { at: 0.42, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 0.9, actor: 'mouse', do: 'flip' },
    { at: 0.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 第 1 次：小芽
    ...g1.moves,
    ...track('plant', G1 + 0.2, POP1 + FLIGHT_END, plantPos(PS)),
    { at: POP1 + FLIGHT_END, actor: 'plant', do: 'vanish', dur: 0.01 },
    // 第 2 次：同一個地方「啵」地冒出一棵小樹苗，根往下長得好長
    { at: GROW2 - 0.05, actor: 'plant', do: 'moveTo', to: { x: XP, y: GY - 0.42 * PS }, dur: 0.01 },
    { at: GROW2 - 0.04, actor: 'plant', do: 'swap', emoji: 'prop:tall-tree' },
    { at: GROW2, actor: 'plant', do: 'pop', dur: 0.3 },
    { at: GROW2 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: GROW2 + 0.05, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    ...g2.moves,
    ...track('plant', G2 + 0.2, POP2 + FLIGHT_END, plantPos(PS)),
    { at: POP2 + FLIGHT_END, actor: 'plant', do: 'vanish', dur: 0.01 },
    // 第 3 次：地底「轟隆隆」長出一棵小樹，根又粗又多
    { at: GROW3, actor: 'tree', do: 'pop', dur: 0.35 },
    { at: GROW3 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    { at: GROW3 + 0.05, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    // 停一拍：爬起來走回原位，托下巴冒汗
    { at: PAUSE, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: PAUSE, actor: 'mouse', do: 'moveTo', to: { x: XM, y: my(GY) }, dur: 0.25 },
    { at: PAUSE + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: PAUSE + 0.3, actor: 'mouse', do: 'tilt', amount: 6, dur: 0.3 },
    ...g3.moves,
    // 國字放大：地面整片往下讓位，小樹退到右邊縮一點，他跟著地面往下
    { at: HOME_IN, actor: 'tree', do: 'moveTo', to: { x: TREE_SIDE.x, y: GY + DROP - 0.42 * TS }, dur: 0.4 },
    { at: HOME_IN, actor: 'tree', do: 'scaleTo', amount: TREE_SIDE.k, dur: 0.4 },
    { at: HOME_IN, actor: 'mouse', do: 'moveTo', to: { x: FLAT, y: my(GY + DROP) }, dur: 0.4 },
    { at: PARK_OUT, actor: 'tree', do: 'moveTo', to: { x: XP, y: GY - 0.42 * TS }, dur: 0.4 },
    { at: PARK_OUT, actor: 'tree', do: 'scaleTo', amount: 1 / TREE_SIDE.k, dur: 0.4 },
    // 語詞：爬起來走到樹旁邊蹲下來看地下的根
    // 字框還在往左上飛：先趴著滑出來，離開字框底下才站起來
    { at: PARK_OUT + 0.05, actor: 'mouse', do: 'moveTo', to: { x: PEEK, y: my(GY) }, dur: 0.45 },
    { at: PARK_OUT + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: PARK_OUT + 0.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/peek' },
    // 回馬槍：走回原位、跺腳、用盡全力再拔一次
    { at: R4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: R4, actor: 'mouse', do: 'moveTo', to: { x: XM, y: my(GY) }, dur: 0.25 },
    { at: STOMP, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stomp' },
    { at: STOMP, actor: 'mouse', do: 'hop', amount: 2.5, dur: 0.2 },
    { at: G4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: G4 + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/pull' },
    { at: G4 + 0.17, actor: 'mouse', do: 'shake', amount: 1.6, dur: YANK - G4 - 0.17 },
    // 一條根鑽出來捲住他的腳——「咻」！拉進土裡只露出一顆頭
    { at: YANK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: YANK, actor: 'mouse', do: 'moveTo', to: { x: XM, y: my(GY) + SINK }, dur: 0.12, ease: 'in' },
    { at: YANK + 0.3, actor: 'mouse', do: 'shake', amount: 0.8, dur: 0.15 },
    // 「啵」地自己拔出來跳開；小樹被根拉回土裡、土退掉
    { at: OUT, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
    { at: OUT, actor: 'mouse', do: 'moveTo', to: { x: ASK_AT.x, y: 74 - 0.42 * MS }, arc: 22, dur: 0.45, ease: 'linear' },
    { at: OUT, actor: 'tree', do: 'moveTo', to: { x: XP, y: GY + 50 - 0.42 * TS }, dur: 0.3 },
    { at: OUT + 0.3, actor: 'tree', do: 'vanish', dur: 0.01 },
    { at: OUT + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 問他：轉向國字、變大
    { at: ASK + 0.05, actor: 'mouse', do: 'flip' },
    { at: ASK + 0.05, actor: 'mouse', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.05, actor: 'mouse', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: ASK_SAY + 1.0, actor: 'mouse', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'mouse', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, actor: 'mouse', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: ANSWER + 0.16, actor: 'mouse', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'mouse', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（素色的天空）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給小老鼠
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['mouse'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...soilFx,
    ...rootFx,
    ...g1.fx,
    ...g2.fx,
    { at: GROW2, kind: 'fountain', x: XP, y: GY, emoji: '🟤', n: 4, dur: 0.45 },
    { at: GROW3, kind: 'fountain', x: XP, y: GY, emoji: '🟤', n: 8, dur: 0.55 },
    { at: PAUSE + 0.3, kind: 'sweat', actor: 'mouse', dx: -8, dur: 0.45 },
    ...g3.fx,
    // 語詞：地下的根亮一圈
    { at: WORD + 0.05, kind: 'burst', x: XP, y: GY + 15, emoji: '✨', n: 8, dur: 0.6, scale: 1.6 },
    // 回馬槍
    { at: G4 + 0.3, kind: 'sweat', actor: 'mouse', dx: -8, dur: 0.4 },
    { at: YANK, kind: 'fountain', x: XM, y: GY, emoji: '🟤', n: 8, dur: 0.5 },
    { at: YANK + 0.12, kind: 'pop', x: XM - 16, y: GY - 2, emoji: '❗', scale: 1.6, dur: 0.5 },
    { at: OUT, kind: 'fountain', x: XM, y: GY, emoji: '🟤', n: 6, dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把土裡的根切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    { at: GROW3, dur: 0.5, do: 'shake', amount: 1.2 },
    ...g3.camera,
    { at: WORD + 0.05, dur: 0.6, do: 'punch', amount: 0.06, to: { x: XP - 10, y: 62 } },
    { at: G4 + 0.17, dur: YANK - G4 - 0.17, do: 'shake', amount: 0.6 },
    { at: YANK, dur: 0.45, do: 'punch', amount: 0.1, to: { x: XM, y: GY - 6 } },
    { at: YANK, dur: 0.35, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '根' },
    ...g1.cues,
    { at: GROW2, sfx: 'boing' },
    ...g2.cues,
    { at: GROW3, sfx: 'rumble' },
    ...g3.cues,
    { at: HOME + 0.15, say: '根' },
    { at: WORD, say: '樹根' },
    { at: STOMP, sfx: 'tap' },
    { at: G4 + 0.17, sfx: 'slide' },
    { at: GRAB, sfx: 'bubble' },
    { at: YANK, sfx: 'whoosh' },
    { at: YANK + 0.1, sfx: 'bonk' },
    { at: OUT, sfx: 'plop' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '根' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
