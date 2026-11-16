import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 草（v2）：狗狗警長拿大剪刀剪草——一整排綠綠的草，他從這頭「喀嚓喀嚓喀嚓」一路剪到那頭，剪得平平的，閉眼得意擦汗——
// 背後的草「咻」地一下又長出來，而且一次比一次高：到他的小腿（艹從草尖飛出來）→ 到他的腰（日）→
// 先停一拍：他看著到腰的草、托著下巴冒汗，再剪一次……「咻」！草長得比他還高，整個人淹在草裡，撥開草找路，
// 氣得跳起來在半空中一剪，整排草被剪得一根不剩（他自己彈上去變成十）。
// 語詞那一刻：剪光的地上冒出一排短短的小草，他走到中間彎腰伸手：「小草」。
// 回馬槍（第四次）：他放棄了，把剪刀往後一丟，躺在草上睡覺——「咻」！草又長了，這次長成一張軟軟的草床，把他托得高高的，他睡得好香。
// 最後畫面暗下來只剩「草」，警長走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「草！」，然後退場只留字。
// 刻意不跟「葉」（掃落葉）、「菜」（種菜被偷吃）、「昨」（芽長成樹）、「羊」（山羊）、「長」「林」撞：這支只演「草剪了又長、一次比一次高」，長的是草不是樹、沒有動物來吃。
// 草、草、小草、這是什麼字？、草

/** 狗狗警長（hero:sheriff；圖朝左） */
const SS = 36
const SY = 77 - 0.42 * SS
/** 剪草的兩頭：左邊在草的邊上（字框下面），右邊在草裡面（第三次才會被淹在草裡） */
const START = 34
const END = 124
/** 第三次跳出來落地的地方（右邊，國字回中央時不擋字） */
const LAND = 140
/** 語詞、回馬槍站的地方 */
const MID = 84
/** 國字讓位的地方（左上，背後是素色的天空；草只長在 x 46 以右，長再高也碰不到） */
const PARK_AT: Vec = { x: 28, y: 19 }
const PARK_K = 0.48

// ---- 草：一根一根尖尖的綠線，掛在看不見的錨點上（錨點在 0,0，dx／dy 就是舞台座標） ----

const GROUND = 74.6
const N = 29
const BX = Array.from({ length: N }, (_, i) => 46 + i * 3.5)
/** 每根草的高矮（不要排得像柵欄） */
const JIT = BX.map((_, i) => [1, 0.84, 0.95, 0.78, 1.06, 0.88, 0.97][i % 7])
/** 每根草往左右歪一點 */
const LEAN = BX.map((_, i) => ((((i * 37) % 7) - 3) / 3) * 0.9)
const DARK = '#1F7A2A'
const LIGHT = '#3FA338'
/** 剪平的高度 */
const CUT_H = 2.2

const clamp01 = (p: number) => Math.max(0, Math.min(1, p))
const easeOut = (p: number) => 1 - (1 - p) * (1 - p)
const easeBack = (p: number) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2)

type GrassEvent =
  /** 剪：t0～t1 之間從 x0 剪到 x1，剪過的草變成 h */
  | { kind: 'cut'; t0: number; t1: number; x0: number; x1: number; h: number }
  /** 長：at 開始、dur 內長到 h(x)（乘上每根草自己的高矮） */
  | { kind: 'grow'; at: number; dur: number; h: (x: number) => number; ease: (p: number) => number }
  /** 撥開：at～at+dur 之間，cx 左右 w 以內的草尖往兩邊倒 push */
  | { kind: 'part'; at: number; dur: number; cx: number; w: number; push: number }

function heightAt(events: GrassEvent[], i: number, t: number, h0: number) {
  let h = h0 * JIT[i]
  for (const e of events) {
    if (e.kind === 'cut') {
      const lo = Math.min(e.x0, e.x1), hi = Math.max(e.x0, e.x1)
      if (BX[i] < lo || BX[i] > hi) continue
      const tc = e.t0 + ((BX[i] - e.x0) / (e.x1 - e.x0)) * (e.t1 - e.t0)
      if (t >= tc) h = Math.min(h, e.h * (0.9 + 0.2 * ((i * 5) % 3) / 2))
    } else if (e.kind === 'grow') {
      if (t < e.at) continue
      const target = e.h(BX[i]) * JIT[i]
      h = h + (target - h) * e.ease(clamp01((t - e.at) / e.dur))
    }
  }
  return h
}

function leanAt(events: GrassEvent[], i: number, t: number, h: number) {
  let l = LEAN[i] * h * 0.16
  for (const e of events) {
    if (e.kind !== 'part' || t < e.at || t > e.at + e.dur) continue
    const d = BX[i] - e.cx
    if (Math.abs(d) > e.w) continue
    const env = Math.sin(Math.PI * clamp01((t - e.at) / e.dur))
    l += Math.sign(d || 1) * e.push * env * (1 - Math.abs(d) / e.w * 0.5)
  }
  return l
}

type Seg = { a: Vec; b: Vec; color: string; width: number }
const q = (v: number) => Math.round(v * 20) / 20

/** 某一刻整排草的樣子：每根草三段，越上面越細（下面深綠、上面亮綠），尖尖的 */
function grassFrame(t: number, events: GrassEvent[], h0: number): Map<string, Seg> {
  const out = new Map<string, Seg>()
  BX.forEach((x, i) => {
    const h = heightAt(events, i, t, h0)
    if (h < 0.4) return
    const l = leanAt(events, i, t, h)
    const mid = { x: q(x + l * 0.2), y: q(GROUND - h * 0.45) }
    const up = { x: q(x + l * 0.6), y: q(GROUND - h * 0.8) }
    const tip = { x: q(x + l), y: q(GROUND - h) }
    out.set(`a${i}`, { a: { x, y: GROUND }, b: mid, color: DARK, width: 2.0 })
    out.set(`b${i}`, { a: mid, b: up, color: LIGHT, width: 1.3 })
    out.set(`c${i}`, { a: up, b: tip, color: LIGHT, width: 0.6 })
  })
  return out
}

/** 把整支的草每 0.05 秒取一格，前後格一樣的線段合成一段，變成一串 line 效果（做法跟「海」一樣） */
function grassFx(end: number, events: GrassEvent[], h0: number): Fx[] {
  const fx: Fx[] = []
  const open = new Map<string, { seg: Seg; at: number }>()
  const same = (p: Seg, s: Seg) => p.a.x === s.a.x && p.a.y === s.a.y && p.b.x === s.b.x && p.b.y === s.b.y
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    fx.push({ at: o.at, dur: t - o.at + (last ? 0 : 0.12), kind: 'line', actor: 'lawn', dx: o.seg.a.x, dy: o.seg.a.y, to: o.seg.b, color: o.seg.color, width: o.seg.width })
    open.delete(key)
  }
  const STEP = 0.05
  for (let n = 0; n * STEP < end - 1e-6; n++) {
    const t = +(n * STEP).toFixed(3)
    const frame = grassFrame(t, events, h0)
    for (const key of [...open.keys()]) {
      const now = frame.get(key)
      if (!now || !same(now, open.get(key)!.seg)) close(key, t, false)
    }
    for (const [key, seg] of frame) if (!open.has(key)) open.set(key, { seg, at: t })
  }
  for (const key of [...open.keys()]) close(key, end, true)
  return fx
}

// ---- 時間表 ----
/** 一路剪過去要多久 */
const WALK = 0.6
const C1 = 1.1
const G1 = C1 + 1.0
const C2 = G1 + 0.55
const G2 = C2 + 1.0
/** 第三次前停一拍：他看著到腰的草、托下巴冒汗 */
const PAUSE = G2 + 0.55
const C3 = PAUSE + 0.5
const G3 = C3 + 1.0
/** 淹在草裡撥開草，再跳起來在半空中一剪 */
const PEEK = G3 + 0.3
const JUMP = G3 + 0.7
const APEX = JUMP + 0.3
const LANDED = JUMP + 0.6
/** 字框填滿、國字到正中央 */
const HOME = LANDED + 0.15
const PARK = HOME + 0.85
/** 語詞：剪平的地上冒出一排小草 */
const WORD = PARK + 0.05
/** 回馬槍：放棄了，丟掉剪刀躺下來 */
const R4 = WORD + 0.95
const LIE = R4 + 0.4
const G4 = LIE + 0.4
const SINK = G4 + 0.65
/** 問他 */
const ASK = SINK + 0.4
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: 122, y: SY + 3 }

/** 草床：他躺的地方高高隆起、兩邊慢慢低下去 */
const BED_H = 24
const bed = (x: number) => {
  const d = Math.abs(x - MID)
  if (d < 17) return BED_H
  if (d > 32) return 9
  const p = (d - 17) / 15
  return 9 + (BED_H - 9) * (1 - p * p * (3 - 2 * p))
}

const H0 = 10
const GRASS: GrassEvent[] = [
  // 第 1 次：剪平 → 長到他的小腿
  { kind: 'cut', t0: C1, t1: C1 + WALK, x0: 44, x1: 147, h: CUT_H },
  { kind: 'grow', at: G1, dur: 0.22, h: () => 14, ease: easeBack },
  // 第 2 次：從右邊剪回左邊 → 長到他的腰
  { kind: 'cut', t0: C2, t1: C2 + WALK, x0: 147, x1: 44, h: CUT_H },
  { kind: 'grow', at: G2, dur: 0.24, h: () => 24, ease: easeBack },
  // 第 3 次：剪平 → 長得比他還高，整個人淹在草裡
  { kind: 'cut', t0: C3, t1: C3 + WALK, x0: 44, x1: 147, h: CUT_H },
  { kind: 'grow', at: G3, dur: 0.28, h: () => 48, ease: easeBack },
  { kind: 'part', at: PEEK, dur: 0.4, cx: END, w: 9, push: 5 },
  // 跳起來在半空中一剪：整排從右到左剪到一根不剩（國字回中央時底下乾乾淨淨）
  // 他腳邊（國字右邊）留一點點草根，看得出這裡是一片剪過的草
  { kind: 'cut', t0: APEX - 0.05, t1: APEX + 0.034, x0: 147, x1: 118.5, h: 1.2 },
  { kind: 'cut', t0: APEX + 0.034, t1: APEX + 0.25, x0: 118.5, x1: 44, h: 0 },
  // 語詞：光禿禿的地上冒出一排短短的小草
  { kind: 'grow', at: WORD, dur: 0.45, h: () => 9, ease: easeOut },
  // 回馬槍：長成一張草床把他托起來
  { kind: 'grow', at: G4, dur: 0.3, h: bed, ease: easeBack },
  // 問他之前縮回地底下（只留他和國字）
  { kind: 'grow', at: SINK, dur: 0.35, h: () => 0, ease: easeOut },
]

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 剪刀拿在手上的位置：朝右在右手邊、朝左在左手邊 */
const hand = (x: number, dir: number, y = SY + 3): Vec => ({ x: x + dir * 11, y })

/**
 * 同一個笑點：從 from 一路「喀嚓喀嚓喀嚓」剪到 to（dir 是往哪邊走），閉眼得意擦汗，
 * 背後的草「咻」地長回來（G），他轉身嚇一跳。k 是第幾次（0、1、2），一次比一次誇張。
 */
function trim(c: number, k: number, from: number, to: number): Gag {
  const dir = to > from ? 1 : -1
  const G = c + 1.0
  const moves: Move[] = [
    { at: c - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: c, actor: 'sheriff', do: 'moveTo', to: { x: to, y: SY }, dur: WALK, ease: 'linear' },
    { at: c, actor: 'scissors', do: 'moveTo', to: hand(to, dir), dur: WALK, ease: 'linear' },
    // 喀嚓、喀嚓、喀嚓
    ...[0, 0.2, 0.4].map((dt): Move => ({ at: c + dt, actor: 'scissors', do: 'squash', amount: 0.35, dur: 0.14 })),
    // 剪完：閉眼得意（背對著剛剪好的草）
    { at: c + WALK + 0.03, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    // 咻！轉身嚇一跳
    { at: G + 0.06, actor: 'sheriff', do: 'flip' },
    { at: G + 0.06, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: G + 0.06, actor: 'scissors', do: 'moveTo', to: hand(to, -dir), dur: 0.01 },
    { at: G + 0.06, actor: 'scissors', do: 'rotateTo', amount: 180, dur: 0.01 },
  ]
  if (k < 2) {
    moves.push(
      { at: G + 0.06, actor: 'sheriff', do: 'hop', amount: 5 + 5 * k, dur: 0.4 },
      { at: G + 0.06, actor: 'scissors', do: 'hop', amount: 5 + 5 * k, dur: 0.4 },
      { at: G + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
      { at: G + 0.5, actor: 'sheriff', do: 'shake', amount: 1.2, dur: 0.25 },
    )
  } else {
    moves.push({ at: G + 0.06, actor: 'sheriff', do: 'shake', amount: 1.4, dur: 0.3 })
  }
  // 剪下來的草屑一路噴出來
  const fx: Fx[] = [0.08, 0.28, 0.48].map((dt): Fx => {
    const x = from + dir * 11 + (to - from) * (dt / WALK)
    return { at: c + dt, kind: 'burst', x: x + dir * 3, y: 66, emoji: '🌿', n: 3, dur: 0.35, scale: 0.9 }
  })
  fx.push(
    { at: c + WALK + 0.08, kind: 'sweat', actor: 'sheriff', dx: dir * 6, dur: 0.4 },
    { at: G + 0.06, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: -dir * 10, dy: 1, scale: 1.4 + 0.25 * k },
  )
  const mid = (from + to) / 2
  const camera: Camera[] = [
    { at: G, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: mid + 10, y: 58 } },
    { at: G, dur: 0.32, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [
    { at: c, sfx: 'tap' }, { at: c + 0.2, sfx: 'tap' }, { at: c + 0.4, sfx: 'tap' },
    { at: G - 0.08, sfx: 'whoosh' }, { at: G + 0.02, sfx: 'boing' },
  ]
  // 同一個音效，一次比一次多疊一個音
  if (k >= 1) cues.push({ at: G + 0.06, sfx: 'poof' })
  if (k >= 2) cues.push({ at: G + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

const g1 = trim(C1, 0, START, END)
const g2 = trim(C2, 1, END, START)
// 停一拍：看著到腰的草，托下巴冒汗
const pause: Move[] = [
  { at: PAUSE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
  { at: PAUSE + 0.1, actor: 'sheriff', do: 'tilt', amount: 6, dur: 0.35 },
]
const g3 = trim(C3, 2, START, END)
g3.moves.push(
  // 淹在草裡，撥開草找路
  { at: PEEK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' },
  { at: PEEK + 0.05, actor: 'sheriff', do: 'shake', amount: 1, dur: 0.3 },
  // 氣得跳起來，在半空中一剪
  { at: JUMP, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
  { at: JUMP, actor: 'sheriff', do: 'moveTo', to: { x: LAND, y: SY }, arc: 30, dur: LANDED - JUMP, ease: 'linear' },
  { at: JUMP, actor: 'scissors', do: 'moveTo', to: { x: LAND + 9, y: 70 }, arc: 30, dur: LANDED - JUMP, ease: 'linear' },
  { at: APEX - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
  { at: APEX - 0.05, actor: 'scissors', do: 'rotateTo', amount: -90, dur: 0.3 },
  // 落地：累得喘氣，剪刀掉在背後（不貼著回中央的國字）
  { at: LANDED, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/tired' },
)
g3.fx.push(
  { at: PEEK, kind: 'sweat', actor: 'sheriff', dx: 8, dur: 0.4 },
  { at: APEX - 0.05, dur: 0.35, kind: 'swoosh', actor: 'sheriff', to: { x: 60, y: 70 }, n: 16, sweep: 150, color: '#FFFFFF', width: 2.4, scale: 1.4 },
  ...[0, 0.1, 0.2].map((dt): Fx => ({ at: APEX + dt, kind: 'burst', x: 132 - dt * 320, y: 68, emoji: '🌿', n: 5, dur: 0.4, scale: 1.2 })),
  { at: LANDED + 0.05, kind: 'sweat', actor: 'sheriff', dx: -8, dur: 0.5 },
)
g3.camera.push({ at: APEX + 0.05, dur: 0.3, do: 'shake', amount: 1.4 })
g3.cues.push({ at: JUMP, sfx: 'boing' }, { at: APEX, sfx: 'whoosh' }, { at: APEX + 0.05, sfx: 'tap' }, { at: APEX + 0.15, sfx: 'tap' })

/** 第 4 次：草又「咻」地長——這次長成草床把他托起來 */
const g4: Gag = {
  moves: [
    { at: G4 + 0.14, actor: 'sheriff', do: 'moveTo', to: { x: MID, y: SY - BED_H + 1 }, dur: 0.32, ease: 'out' },
    { at: G4 + 0.45, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
  ],
  fx: [
    { at: G4 + 0.2, dur: 0.6, kind: 'zzz', actor: 'sheriff', dx: -14, dy: 6, scale: 1.2 },
    { at: G4 + 0.05, kind: 'burst', x: MID, y: 50, emoji: '🌿', n: 6, dur: 0.4, scale: 1.2 },
  ],
  camera: [
    { at: G4, dur: 0.45, do: 'punch', amount: 0.11, to: { x: MID, y: 52 } },
    { at: G4, dur: 0.32, do: 'shake', amount: 2.2 },
  ],
  cues: [{ at: G4 - 0.08, sfx: 'whoosh' }, { at: G4 + 0.02, sfx: 'boing' }, { at: G4 + 0.1, sfx: 'rumble' }],
}

const builds: Build[] = [
  // 長出來的草尖噴出：艹 → 日 → 他跳起來變成十
  { at: G1 + 0.05, dur: 0.5, strokes: [0, 1, 2], from: { x: 96, y: 60 }, color: partColor('艹') },
  { at: G2 + 0.05, dur: 0.5, strokes: [3, 4, 5, 6], from: { x: 90, y: 52 }, color: partColor('日') },
  { at: APEX - 0.1, dur: 0.45, strokes: [7, 8], from: 'sheriff', color: partColor('十') },
]

const clip: Clip = {
  format: 2,
  char: '草',
  meta: { theme: '剪草剪不完', cast: '狗狗警長＋大剪刀', gags: ['狗狗警長拿大剪刀把一整排草「喀嚓喀嚓」剪平，閉眼得意擦汗，背後的草「咻」地又長出來，一次比一次高：到小腿→到腰→停一拍，他托下巴冒汗再剪一次，草長得比他還高，整個人淹在草裡撥開草找路，氣得跳起來在半空中一剪把整排剪平；回馬槍是他放棄了，丟掉剪刀躺在草上睡覺，草又「咻」地長出來，這次長成一張草床把他托得高高的，他睡得好香'] },
  duration: 15,
  // 淺藍的天、淺沙色的地：深綠的草跳得出來
  bg: { top: '#C4E6FF', bottom: '#F1F9FF', floor: '#EBDDB0', scenery: 'hills' },
  actors: [
    // 看不見的錨點：草的線都掛在它身上（在 0,0，不會動）
    { id: 'lawn', emoji: '🟩', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: START, y: SY, size: SS, flip: true },
    { id: 'scissors', emoji: '✂️', x: START + 11, y: SY + 3, size: 13, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：走進來，抬頭指著字框「草」，再轉向那排草、舉起剪刀
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -14, y: SY }, dur: 0.45 },
    { at: 0, actor: 'scissors', do: 'enter', from: { x: -3, y: SY + 3 }, dur: 0.45 },
    { at: 0, actor: 'scissors', do: 'rotateTo', amount: -90, dur: 0.01 },
    { at: 0.45, actor: 'sheriff', do: 'flip' },
    { at: 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 0.95, actor: 'sheriff', do: 'flip' },
    { at: 0.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 0.95, actor: 'scissors', do: 'squash', amount: 0.35, dur: 0.14 },
    ...g1.moves,
    ...g2.moves,
    ...pause,
    ...g3.moves,
    // 語詞：撿起剪刀走到中間，彎腰伸手看冒出來的小草
    { at: WORD + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: WORD + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: MID, y: SY }, dur: 0.35 },
    { at: WORD + 0.05, actor: 'scissors', do: 'moveTo', to: hand(MID, -1), dur: 0.35 },
    { at: WORD + 0.05, actor: 'scissors', do: 'rotateTo', amount: 180, dur: 0.35 },
    { at: WORD + 0.42, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    // 回馬槍：放棄了，轉身把剪刀往後一丟，躺下來睡覺
    { at: R4, actor: 'sheriff', do: 'flip' },
    { at: R4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
    { at: R4, actor: 'scissors', do: 'moveTo', to: { x: 176, y: 34 }, arc: 14, dur: 0.5, ease: 'linear' },
    { at: R4, actor: 'scissors', do: 'rotateTo', amount: 540, dur: 0.5 },
    { at: R4 + 0.5, actor: 'scissors', do: 'vanish', dur: 0.01 },
    { at: LIE, actor: 'sheriff', do: 'flip' },
    { at: LIE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/sleep' },
    ...g4.moves,
    // 草縮回地底下，他輕輕落回地上
    { at: SINK, actor: 'sheriff', do: 'moveTo', to: { x: MID, y: SY }, dur: 0.35, ease: 'out' },
    // 問他：從右邊走回來，轉向國字、變大
    { at: ASK + 0.02, actor: 'sheriff', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: ASK + 0.1, actor: 'sheriff', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.12, actor: 'sheriff', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: ANSWER + 0.16, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'sheriff', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（草在右邊、他在中間）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給警長
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 58, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...grassFx(ASK, GRASS, H0),
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'sheriff', dx: 8, dur: 0.45 },
    ...g3.fx,
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把整排草切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD + 0.1, dur: 0.6, do: 'punch', amount: 0.06, to: { x: MID, y: 60 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '草' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '草' },
    { at: WORD, sfx: 'plop' },
    { at: WORD + 0.15, say: '小草' },
    { at: R4 + 0.05, sfx: 'whoosh' },
    ...g4.cues,
    { at: SINK, sfx: 'deflate' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '草' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
