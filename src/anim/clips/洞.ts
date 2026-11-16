import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { easeBy } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 洞（v2）：越挖越深。畫面下半是土的剖面（上緣是地面線），洞是土裡一條黑黑的直井，看得出有多深。
// 小恐龍拿著十字鎬站在同一個地方，舉高高「嘿咻」往下一鑿——土一鏟一鏟從洞口噴出來，洞一次比一次深、旁邊的土堆一次比一次高：
// 挖到膝蓋，他閉眼得意（冂）→ 挖到只露出一顆頭，他在洞裡舉手歡呼（一口）→
// 先停一拍：他托下巴冒汗、看看自己，「咻」地縮進洞裡——整個人不見了，只看到十字鎬的尖尖從洞口冒出來、土一直噴，
// 最後洞底「噗」地噴出一串水滴（挖到水了：氵）。字拼好放大時，地面整片往下讓位。
// 語詞那一刻：國字讓回左上，他從洞裡跳出來，站在洞旁邊得意地看著自己的大洞：「洞穴」。
// 回馬槍（第四次）：他跳回洞裡、挖得更快更用力——洞一路往下挖穿畫面底部⋯⋯土不噴了、安靜一拍——
// 「咻——」他從畫面上方的天空掉下來，「咚」地摔扁在洞旁邊：挖穿了。
// 最後畫面暗下來只剩「洞」，小恐龍問「這是什麼字？」，手放耳邊等他回答，再指著字說「洞！」，然後退場只留字。
// 刻意不跟「九」（九個洞打地鼠）、「根」（土的剖面拔樹根、被拉進土裡只露出頭）、「摸」（神秘箱）、「樹」（樹洞探頭）撞：
// 這支只演「往下挖、洞一次比一次深」，回馬槍是挖穿了從天上掉下來。
// 洞、洞、洞穴、這是什麼字？、洞

// ---- 站位 ----
/** 地面線（土的剖面從這裡往下） */
const GY = 44
/** 洞的中心、半寬 */
const XH = 90
const HW = 12
/** 小恐龍（hero:rex；圖朝左），每次都站在洞的正上方往下挖 */
const S = 36
const ry = (feet: number) => feet - 0.42 * S
/** 他在洞裡腳底離地面多深：站在地上、挖到膝蓋、只露出頭、整個人不見 */
const SINK = [0, 9, 21, 31]
/** 洞有多深：挖到膝蓋、只露出頭、整個人不見、挖穿畫面底部 */
const DEPTH = [12, 24, 34, 70]
/** 土堆（洞的左邊）有多高 */
const MOUND = [4, 8, 12, 14]
const MX = XH - 28
const MHW = 14
/** 語詞那一刻站在洞的右邊；回馬槍從天上掉下來的地方 */
const XR = 124
const XF = 128
/** 十字鎬（⛏️ 原圖鎬頭在左上、柄在右下） */
const PK = 17
const A_UP = -45
const A_DN = 60
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 27, y: 19 }
const PARK_K = 0.46

// ---- 時間表 ----
const SW = 0.32
const D1 = 0.9
const D2 = 2.15
/** 第三次前停一拍：托下巴冒汗、縮進洞裡 */
const PAUSE = 3.35
const DUCK = 3.85
const D3 = 4.0
/** 洞底噴水 */
const WET = D3 + 2 * SW + 0.22 + 0.14
/** 字框填滿、國字到正中央（地面往下讓位） */
const HOME = 5.6
const PARK = HOME + 0.8
/** 國字讓回左上之後，地面才升回來 */
const BACK = PARK + 0.15
/** 從洞裡跳出來 */
const OUT1 = BACK + 0.25
const WORD = OUT1 + 0.45
/** 回馬槍：跳回洞裡，挖得更快 */
const R4 = WORD + 0.6
const D4 = R4 + 0.4
const SW4 = 0.24
const QUIET = D4 + 3 * SW4 + 0.22 + 0.12
/** 從天上掉下來 */
const FALL = QUIET + 0.25
const LAND = FALL + 0.5
/** 地面退掉、問他 */
const OUT = LAND + 0.38
const ASK = OUT + 0.4
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: XR, y: 74 - 0.42 * S + 3 }

const clamp01 = (p: number) => Math.max(0, Math.min(1, p))
const ease = easeBy('inOut')
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

// ---- 地面：國字放大時整片往下讓位（連土堆一起退到國字下面），問他之前整片退到畫面下面 ----
const DROP = 60
const HOME_IN = HOME - 0.35
const GROUND: [number, number][] = [
  [HOME_IN, 0], [HOME_IN + 0.4, DROP], [BACK, DROP], [BACK + 0.4, 0], [OUT, 0], [OUT + 0.35, DROP],
]
const groundAt = (t: number) => GY + keyed(GROUND, t)

/** 每一鑿打下去的時間（第 k 次挖的第 i 下） */
const hitAt = (d: number, i: number, sw = SW) => d + i * sw + 0.22
const HITS: [number, number][][] = [
  [0, 1].map((i) => hitAt(D1, i)).map((t, i) => [t, [5, DEPTH[0]][i]]),
  [0, 1].map((i) => hitAt(D2, i)).map((t, i) => [t, [18, DEPTH[1]][i]]),
  [0, 1, 2].map((i) => hitAt(D3, i)).map((t, i) => [t, [28, 31, DEPTH[2]][i]]),
  [0, 1, 2, 3].map((i) => hitAt(D4, i, SW4)).map((t, i) => [t, [44, 54, 62, DEPTH[3]][i]]),
]
/** 洞的深度：每一鑿打下去那一刻往下深一截（在 0.08 秒裡長出來） */
const DIGS = HITS.flat()
function depthAt(t: number) {
  let d = 0
  DIGS.forEach(([h, v], i) => {
    if (t < h) return
    const prev = i > 0 ? DIGS[i - 1][1] : 0
    d = prev + (v - prev) * clamp01((t - h) / 0.08)
  })
  return d
}
/** 土堆的高度：每次挖完那一刻堆高一截 */
const MOUND_KEYS: [number, number][] = [
  [hitAt(D1, 0), 0], [hitAt(D1, 1) + 0.2, MOUND[0]],
  [hitAt(D2, 0), MOUND[0]], [hitAt(D2, 1) + 0.2, MOUND[1]],
  [hitAt(D3, 0), MOUND[1]], [hitAt(D3, 2) + 0.2, MOUND[2]],
  [hitAt(D4, 0, SW4), MOUND[2]], [hitAt(D4, 3, SW4) + 0.2, MOUND[3]],
]
const moundAt = (t: number) => keyed(MOUND_KEYS, t)

// ---- 土的剖面、洞、土堆：一排一排的粗線疊起來（掛在看不見的錨點上，錨點在 0,0，dx／dy 就是舞台座標） ----
type Line = { a: Vec; b: Vec; color: string; width: number }
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
const ROW = 2.3
const ROW_W = 3.1
/** 每排的高度釘在固定的格子上：地面往下讓位時，上面幾排直接收掉、不跟著移動（線效果換格會從左邊長出來，看起來會拖影） */
const rowYs = (from: number, to: number) => {
  const ys: [number, number][] = []
  for (let i = 0; GY + 1.55 + i * ROW < 92.5; i++) {
    const y = q(GY + 1.55 + i * ROW)
    if (y > from && y <= to) ys.push([i, y])
  }
  return ys
}
/** 土裡的小石頭（x、離地面多深） */
const PEBBLES: [number, number][] = [[14, 9], [36, 22], [52, 12], [150, 8], [128, 27], [8, 30], [60, 33], [146, 38], [118, 14]]

function soilFrame(t: number): Map<string, Line> {
  const out = new Map<string, Line>()
  const g = q(groundAt(t))
  for (const [i, y] of rowYs(g + 2.2, 92.5)) {
    const color = mix('#E0BC86', '#B98B57', clamp01((y - GY) / 34))
    for (let j = 0; j < 18; j++) out.set(`r${i}-${j}`, { a: { x: -10 + j * 10, y }, b: { x: j * 10, y }, color, width: ROW_W })
  }
  return out
}
function pebbleFrame(t: number): Map<string, Line> {
  const out = new Map<string, Line>()
  const g = q(groundAt(t))
  PEBBLES.forEach(([x, d], i) => {
    if (g + d < 91) out.set(`s${i}`, { a: { x, y: q(g + d) }, b: { x: x + 1.6, y: q(g + d - 0.3) }, color: '#9C8C7C', width: 2 })
  })
  return out
}
/** 洞：黑黑的直井，底部圓圓的；一排一排的黑線疊起來 */
function holeFrame(t: number): Map<string, Line> {
  const out = new Map<string, Line>()
  const g = q(groundAt(t))
  const D = depthAt(t)
  if (D <= 0) return out
  const R = Math.min(HW, D)
  for (let i = 0; GY + 1.2 + i * 1.15 < 92.5; i++) {
    const y = q(GY + 1.2 + i * 1.15)
    if (y <= g + 0.5 || y > g + D) continue
    const d = y - g
    const u = d > D - R ? (d - (D - R)) / R : 0
    const hw = q(HW * Math.sqrt(Math.max(0, 1 - u * u)) - 1)
    if (hw < 1) continue
    out.set(`h${i}`, { a: { x: XH - hw, y }, b: { x: XH + hw, y }, color: '#1B120C', width: 2.2 })
  }
  return out
}
/** 土堆：洞的左邊，一排一排越上面越窄 */
function moundFrame(t: number): Map<string, Line> {
  const out = new Map<string, Line>()
  const g = q(groundAt(t))
  const h = moundAt(t)
  if (h < 0.5) return out
  for (let i = 0; i < 8; i++) {
    const up = 0.6 + i * 2
    if (up > h) break
    const hw = q(MHW * Math.sqrt(Math.max(0, 1 - (up / (h + 1)) ** 2)))
    const y = q(g - up)
    if (y > 91 || hw < 1.5) continue
    out.set(`m${i}`, { a: { x: MX - hw, y }, b: { x: MX + hw, y }, color: mix('#B98B57', '#9A6B3C', i / 6), width: ROW_W })
  }
  return out
}
/** 地面線：最上面一排土＋一條綠綠的草皮（用 tube：不會長出來也不會淡掉，移動時不拖影）；洞口那一段斷開 */
function grassFrame(t: number, part: 'top' | 'grass'): Map<string, Line> {
  const out = new Map<string, Line>()
  const g = q(groundAt(t))
  if (g > 91) return out
  const open = depthAt(t) > 0
  const spans: [number, number][] = open ? [[-12, XH - HW], [XH + HW, 172]] : [[-12, 172]]
  spans.forEach(([a, b], i) => {
    if (part === 'top') out.set(`top${i}`, { a: { x: a, y: q(g + 1.9) }, b: { x: b, y: q(g + 1.9) }, color: '#E0BC86', width: 3.2 })
    else out.set(`grass${i}`, { a: { x: a, y: q(g) }, b: { x: b, y: q(g) }, color: '#5BAA3C', width: 1.8 })
  })
  return out
}

const STEP = 0.04
/** 每 STEP 取一格（取那一格中間的時間），前後格一樣的合成一段 */
function sampled<S>(end: number, frame: (t: number) => Map<string, S>, same: (p: S, s: S) => boolean, emit: (s: S, at: number, dur: number, last: boolean) => Fx): Fx[] {
  const fx: Fx[] = []
  const open = new Map<string, { seg: S; at: number }>()
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    fx.push(emit(o.seg, o.at, t - o.at, last))
    open.delete(key)
  }
  for (let n = 0; n * STEP < end - 1e-6; n++) {
    const t = +(n * STEP).toFixed(3)
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
const sameL = (p: Line, s: Line) => sameV(p.a, s.a) && sameV(p.b, s.b) && p.width === s.width && p.color === s.color
const lineFx = (s: Line, at: number, dur: number, last: boolean): Fx => ({
  // 一開場就在（線效果前 0.12 秒會從左邊長出來，提早開始）；換格時跟下一段疊 0.12 秒，不會閃
  at: at === 0 ? -0.15 : at, dur: dur + (at === 0 ? 0.15 : 0) + (last ? 0 : 0.12),
  kind: 'line', actor: 'soil', dx: s.a.x, dy: s.a.y, to: s.b, color: s.color, width: s.width,
})
const tubeFx = (s: Line, at: number, dur: number): Fx => ({ at, dur: dur + 0.002, kind: 'tube', actor: 'soil', dx: s.a.x, dy: s.a.y, to: s.b, color: s.color, width: s.width, n: 999 })

// 畫的順序：土 → 小石頭 → 洞 → 土堆 → 最上面一排土 → 草皮
const groundFx: Fx[] = [
  ...sampled(ASK, soilFrame, sameL, lineFx),
  ...sampled(ASK, pebbleFrame, sameL, lineFx),
  ...sampled(ASK, holeFrame, sameL, lineFx),
  ...sampled(ASK, moundFrame, sameL, lineFx),
  ...sampled(ASK, (t) => grassFrame(t, 'top'), sameL, tubeFx),
  ...sampled(ASK, (t) => grassFrame(t, 'grass'), sameL, tubeFx),
]

// ---- 十字鎬：舉高時立在頭頂上（柄朝下），鑿下去時鎬頭打進洞裡 ----
/** 舉高的位置：頭頂上；人整個在洞裡時，鎬尖從洞口冒出來 */
const upAt = (sink: number): Vec => ({ x: XH + 1, y: Math.min(GY + sink - 0.92 * S - 1, GY - 6) })
const DOWN: Vec = { x: XH - 4, y: GY + 7 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點：舉高十字鎬（lift）→「嘿咻」鑿下去（push）→ 土從洞口噴出來，洞深一截；最後一鑿他往下沉、土堆堆高。
 * k 是第幾次：0 挖到膝蓋、1 只露出頭、2 整個人不見（只看到鎬尖）、3 回馬槍（更快、挖穿畫面底部）。
 */
function dig(d: number, k: number, sink: number): Gag {
  const n = HITS[k].length
  const sw = k === 3 ? SW4 : SW
  const up = upAt(sink)
  const moves: Move[] = []
  const fx: Fx[] = []
  const camera: Camera[] = []
  const cues: Cue[] = []
  for (let i = 0; i < n; i++) {
    const s = d + i * sw
    const h = s + 0.22
    moves.push(
      { at: s, actor: 'rex', do: 'swap', emoji: 'hero:rex/lift' },
      { at: s + 0.14, actor: 'rex', do: 'swap', emoji: 'hero:rex/push' },
      { at: s + 0.14, actor: 'pick', do: 'moveTo', to: DOWN, dur: 0.08, ease: 'in' },
      { at: s + 0.14, actor: 'pick', do: 'rotateTo', amount: A_DN - A_UP, dur: 0.08, ease: 'in' },
    )
    if (i < n - 1) moves.push(
      { at: h + 0.02, actor: 'pick', do: 'moveTo', to: up, dur: sw - 0.24, ease: 'out' },
      { at: h + 0.02, actor: 'pick', do: 'rotateTo', amount: A_UP - A_DN, dur: sw - 0.24, ease: 'out' },
    )
    const last = i === n - 1
    // 土從洞口一鏟一鏟噴出來；最後一鑿最大
    fx.push({ at: h, kind: 'fountain', x: XH - 13, y: GY - 1, emoji: '🟤', n: last ? 7 + k : 4, dur: 0.5, scale: last ? 1.25 + 0.15 * k : 1 })
    cues.push({ at: h, sfx: last ? 'crack' : 'tap' })
    camera.push({ at: h, dur: 0.2, do: 'shake', amount: last ? 1 + 0.4 * k : 0.5 })
  }
  // 第一下：十字鎬出現在頭頂上（上一次挖完停在鑿下去的角度，先轉回來）
  moves.unshift(
    { at: d - 0.02, actor: 'pick', do: 'moveTo', to: up, dur: 0.01 },
    { at: d - 0.02, actor: 'pick', do: 'rotateTo', amount: A_UP - A_DN, dur: 0.01 },
    { at: d, actor: 'pick', do: 'pop', dur: 0.2 },
  )
  const hl = hitAt(d, n - 1, sw)
  if (k < 3) {
    fx.push({ at: hl, kind: 'burst', x: XH, y: GY - 3, emoji: '💥', dur: 0.4, scale: 1 + 0.3 * k })
    camera.push({ at: hl, dur: 0.4, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: XH, y: GY + 4 } })
    cues.push({ at: hl + 0.05, sfx: 'plop' })
  }
  return { moves, fx, camera, cues }
}

const g1 = dig(D1, 0, SINK[0])
const g2 = dig(D2, 1, SINK[1])
const g3 = dig(D3, 2, SINK[3])
const g4 = dig(D4, 3, SINK[3])

const rexAt = (sink: number, x = XH): Vec => ({ x, y: ry(GY + sink) })

const clip: Clip = {
  format: 2,
  char: '洞',
  meta: { theme: '越挖越深', cast: '小恐龍＋十字鎬（土的剖面裡一條黑黑的洞）', gags: ['小恐龍拿十字鎬站在同一個地方往下挖，每次舉高高「嘿咻」鑿下去、土從洞口一鏟一鏟噴出來，洞一次比一次深、土堆一次比一次高：挖到膝蓋，他閉眼得意→挖到只露出一顆頭，他舉手歡呼→停一拍，他縮進洞裡整個人不見，只看到鎬尖冒出來、土一直噴，洞底噴出水來；回馬槍是他跳回洞裡挖得更快更用力，洞一路挖穿畫面底部，安靜一拍——他從天上掉下來「咚」地摔扁在洞旁邊：挖穿了'] },
  duration: 15,
  // 淺藍的天；土是淺淺的土黃色，黑黑的洞跳得出來
  bg: { top: '#BFE3FF', bottom: '#EEF8FF', floor: '#A9D47A', scenery: 'hills' },
  actors: [
    // 看不見的錨點：土、洞、土堆的線都掛在它身上（在 0,0，不會動）
    { id: 'soil', emoji: '🟫', x: 0, y: 0, size: 1, hidden: true, float: true },
    // 十字鎬畫在他後面：舉高時柄藏在頭後面
    { id: 'pick', emoji: '⛏️', x: XH, y: GY - 30, size: PK, hidden: true, float: true, pivot: 'center' },
    { id: 'rex', emoji: 'hero:rex/walk', x: XH, y: ry(GY), size: S },
  ],
  moves: [
    { at: 0, actor: 'pick', do: 'rotateTo', amount: A_DN, dur: 0.01 },
    // 開場：走進來，指著字框「洞」
    { at: 0, actor: 'rex', do: 'enter', from: { x: 180, y: ry(GY) }, dur: 0.42, ease: 'out' },
    { at: 0.42, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    // 第 1 次：挖到膝蓋，閉眼得意
    ...g1.moves,
    { at: hitAt(D1, 1), actor: 'rex', do: 'moveTo', to: rexAt(SINK[1]), dur: 0.15, ease: 'out' },
    { at: hitAt(D1, 1) + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: hitAt(D1, 1) + 0.3, actor: 'pick', do: 'vanish', dur: 0.1 },
    { at: hitAt(D1, 1) + 0.45, actor: 'rex', do: 'tilt', amount: 5, dur: 0.35 },
    // 第 2 次：只露出一顆頭，舉手歡呼
    ...g2.moves,
    { at: hitAt(D2, 1), actor: 'rex', do: 'moveTo', to: rexAt(SINK[2]), dur: 0.18, ease: 'out' },
    { at: hitAt(D2, 1) + 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: hitAt(D2, 1) + 0.25, actor: 'pick', do: 'vanish', dur: 0.1 },
    { at: hitAt(D2, 1) + 0.3, actor: 'rex', do: 'hop', amount: 2, dur: 0.25 },
    // 停一拍：托下巴、冒汗，「咻」地縮進洞裡
    { at: PAUSE, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
    { at: PAUSE + 0.1, actor: 'rex', do: 'tilt', amount: -6, dur: 0.35 },
    { at: DUCK, actor: 'rex', do: 'moveTo', to: rexAt(SINK[3]), dur: 0.12, ease: 'in' },
    // 第 3 次：整個人不見了，只看到鎬尖從洞口冒出來
    ...g3.moves,
    { at: WET - 0.1, actor: 'pick', do: 'moveTo', to: { x: XH, y: GY + 20 }, dur: 0.1, ease: 'in' },
    { at: WET, actor: 'pick', do: 'vanish', dur: 0.05 },
    // 國字放大：他在洞裡跟著地面往下（看不到）
    { at: HOME_IN, actor: 'rex', do: 'moveTo', to: rexAt(SINK[3] + DROP), dur: 0.4 },
    { at: BACK, actor: 'rex', do: 'moveTo', to: rexAt(SINK[3]), dur: 0.4 },
    // 語詞：從洞裡跳出來，站在洞旁邊看著自己的大洞
    { at: OUT1, actor: 'rex', do: 'swap', emoji: 'hero:rex/jump' },
    { at: OUT1, actor: 'rex', do: 'moveTo', to: rexAt(0, XR), arc: 16, dur: 0.4, ease: 'linear' },
    { at: OUT1 + 0.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: WORD + 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: WORD + 0.25, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：跳回洞裡，挖得更快更用力
    { at: R4, actor: 'rex', do: 'swap', emoji: 'hero:rex/jump' },
    { at: R4, actor: 'rex', do: 'moveTo', to: rexAt(SINK[3]), arc: 12, dur: 0.35, ease: 'in' },
    ...g4.moves,
    { at: D4 + 3 * SW4, actor: 'rex', do: 'moveTo', to: rexAt(60), dur: 0.3, ease: 'in' },
    { at: QUIET - 0.1, actor: 'pick', do: 'moveTo', to: { x: XH, y: GY + 30 }, dur: 0.1, ease: 'in' },
    { at: QUIET, actor: 'pick', do: 'vanish', dur: 0.05 },
    // 安靜一拍——「咻」！從天上掉下來
    { at: FALL - 0.05, actor: 'rex', do: 'moveTo', to: { x: XF, y: -14 }, dur: 0.01 },
    { at: FALL - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: FALL, actor: 'rex', do: 'moveTo', to: rexAt(0, XF), dur: LAND - FALL, ease: 'linear' },
    { at: FALL, actor: 'rex', do: 'spin', pivot: 'center', times: 1, dur: LAND - FALL },
    { at: LAND, actor: 'rex', do: 'swap', emoji: 'hero:rex/flat' },
    // 地面退掉：他爬起來跳下來，站到前面
    { at: OUT, actor: 'rex', do: 'swap', emoji: 'hero:rex/dizzy' },
    { at: OUT, actor: 'rex', do: 'moveTo', to: { x: XR, y: 74 - 0.42 * S }, dur: 0.35, ease: 'in' },
    // 問他：變大、面向左邊的國字
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK + 0.05, actor: 'rex', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.05, actor: 'rex', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: ASK_SAY + 1.0, actor: 'rex', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, actor: 'rex', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: ANSWER + 0.16, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'rex', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds: [
    // 挖到膝蓋那一鑿：冂；只露出頭那一鑿：一口；洞底噴出來的水：氵
    { at: hitAt(D1, 1) + 0.05, dur: 0.5, strokes: [3, 4], from: { x: XH, y: GY - 4 }, color: partColor('冂') },
    { at: hitAt(D2, 1) + 0.05, dur: 0.5, strokes: [5], from: { x: XH, y: GY - 4 }, color: partColor('一') },
    { at: hitAt(D2, 1) + 0.1, dur: 0.5, strokes: [6, 7, 8], from: { x: XH, y: GY - 4 }, color: partColor('口') },
    { at: WET + 0.05, dur: 0.5, strokes: [0, 1, 2], from: { x: XH, y: GY - 6 }, color: partColor('氵') },
  ],
  glyph: [
    // 空字框一開始就讓到左上（素色的天空）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給小恐龍
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['rex'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...groundFx,
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.15, kind: 'sweat', actor: 'rex', dx: -9, dur: 0.6 },
    ...g3.fx,
    // 洞底「噗」地噴出水來
    { at: WET, kind: 'fountain', x: XH, y: GY - 2, emoji: '💧', n: 9, dur: 0.6, scale: 1.6 },
    // 語詞：洞裡亮一圈
    { at: WORD + 0.05, kind: 'burst', x: XH, y: GY + 16, emoji: '✨', n: 8, dur: 0.6, scale: 1.6 },
    // 回馬槍
    { at: R4 + 0.35, kind: 'fountain', x: XH, y: GY - 2, emoji: '🟤', n: 6, dur: 0.45 },
    ...g4.fx,
    { at: LAND, kind: 'burst', x: XF - 16, y: GY - 3, emoji: '💥', dur: 0.45, scale: 2 },
    { at: LAND + 0.05, kind: 'puff', actor: 'rex', dur: 0.4 },
    { at: OUT, kind: 'dizzy', actor: 'rex', dur: 0.6 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把土裡的洞切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD + 0.05, dur: 0.6, do: 'punch', amount: 0.06, to: { x: XH + 10, y: 50 } },
    ...g4.camera,
    { at: D4, dur: QUIET - D4, do: 'shake', amount: 0.7 },
    { at: LAND, dur: 0.45, do: 'punch', amount: 0.1, to: { x: XF - 10, y: GY - 6 } },
    { at: LAND, dur: 0.35, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.45, say: '洞' },
    ...g1.cues,
    ...g2.cues,
    { at: DUCK, sfx: 'whoosh' },
    ...g3.cues,
    { at: WET, sfx: 'splash' },
    { at: HOME + 0.15, say: '洞' },
    { at: OUT1, sfx: 'boing' },
    { at: WORD, say: '洞穴' },
    { at: R4 + 0.3, sfx: 'plop' },
    { at: D4, sfx: 'rumble' },
    ...g4.cues,
    { at: FALL - 0.05, sfx: 'whoosh' },
    { at: LAND, sfx: 'bonk' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '洞' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
