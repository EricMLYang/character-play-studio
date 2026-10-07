/**
 * 動畫短片：一份劇本（Clip）＋ 一個「給時間 t 算出畫面」的純函式。
 * 不靠 CSS 動畫或計時器，畫面完全由 t 決定，所以可以拖曳、定格、截圖驗證，
 * 劇本之後也能交給 AI 寫（就是一份 JSON），不必再生影片。
 *
 * 舞台座標：160 × 90（16:9），地板大約在 y = 74。國字固定置中，高 63（約七成畫面）。
 */

export type Vec = { x: number; y: number }

export type Actor = {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  /** 一開始看不到，要等 enter／pop／drop 才出場 */
  hidden?: boolean
  /** 左右翻面（emoji 預設大多朝左） */
  flip?: boolean
  /** 飄在空中的東西（雲、閃電）：地上不畫影子 */
  float?: boolean
  /** 畫在關燈的黑幕上面（黑暗中發亮的眼睛） */
  top?: boolean
  /** CSS filter，例如把熊染黑：brightness(.45) */
  tint?: string
}

/** 會留下結果的動作（位置、大小、角度、出場、退場、換造型）。 */
type Lasting = 'enter' | 'pop' | 'drop' | 'vanish' | 'moveTo' | 'scaleTo' | 'rotateTo' | 'swap' | 'flip'
/** 做完就回原狀的動作。 */
type Passing = 'hop' | 'bounce' | 'squash' | 'shake' | 'spin' | 'tilt' | 'flash'

export type Move = {
  at: number
  dur?: number
  actor: string
  do: Lasting | Passing
  /** moveTo 的終點 */
  to?: Vec
  /** enter 的起點（預設從左邊外面進來） */
  from?: Vec
  /** moveTo／enter 中途往上拋多高 */
  arc?: number
  /** hop／bounce 的高度、shake 的幅度、tilt／rotateTo 的角度、scaleTo 的倍率、squash 的力道（負的是拉長） */
  amount?: number
  /** bounce／spin 的次數 */
  times?: number
  /** swap 換成的 emoji */
  emoji?: string
}

/** 一組筆畫組合出來：從某個角色（或某個點）飛過去，或從上面掉下來。 */
export type Build = {
  at: number
  dur: number
  strokes: number[]
  from: string | Vec
  style?: 'fly' | 'drop'
  color: string
}

export type Cue =
  | { at: number; say: string }
  | { at: number; sfx: 'crack' | 'boing' | 'clink' | 'gulp' | 'rumble' | 'bubble' | 'poof' | 'plop' | 'cheer' | 'tap'
      | 'bonk' | 'whoosh' | 'slide' | 'deflate' | 'splash' | 'hic' | 'blip' }

export type GlyphFx = { at: number; dur: number; do: 'wobble' | 'pulse' | 'shake' }

/**
 * 漫畫效果：跟著角色的頭（或指定的點）走。
 * burst 爆開一圈、dizzy 頭上轉星星、bubble 想法泡泡、sweat 冒汗、puff 腳邊揚塵、
 * zzz 睡著、pop 頭上冒一個符號（❗❓💡❤️）、rain 往下灑、zap 從 actor 劈一道閃電到 target、fountain 從頭頂噴泉、
 * stink 綠色臭味線往上飄（錨點在角色中心）。
 */
export type Fx = {
  at: number
  dur?: number
  kind: 'burst' | 'dizzy' | 'bubble' | 'sweat' | 'puff' | 'zzz' | 'pop' | 'rain' | 'zap' | 'fountain' | 'stink'
  actor?: string
  /** zap 劈到誰 */
  target?: string
  /** 錨點再偏移一點（例如雲在畫面頂端，符號要放旁邊才不會被切掉） */
  dx?: number
  dy?: number
  x?: number
  y?: number
  emoji?: string
  n?: number
}

/** 鏡頭：punch 往某一點推近再退回（笑點用），shake 震一下（撞到、打雷）。 */
export type Camera = { at: number; dur: number; do: 'punch' | 'shake'; amount?: number; to?: Vec }

/** 燈光：level 0 全亮、1 全黑，在 dur 內漸變過去。 */
export type Light = { at: number; dur: number; level: number }

export type Clip = {
  char: string
  /**
   * 這支用了什麼卡司、主題、笑點套路。寫成一行，scripts/anim-candidates.mjs 會列出來，
   * 新劇本要避開最近用過的組合，不要每支都長一樣。
   */
  meta?: { theme: string; cast: string; gags: string[] }
  duration: number
  bg: { top: string; bottom: string; floor: string }
  actors: Actor[]
  moves: Move[]
  builds: Build[]
  cues: Cue[]
  glyph?: GlyphFx[]
  fx?: Fx[]
  camera?: Camera[]
  lights?: Light[]
}

export type ActorState = {
  id: string; emoji: string; size: number; flip: boolean; float: boolean; top: boolean; tint?: string
  x: number; y: number; s: number; sx: number; sy: number; r: number; o: number
  visible: boolean; glow: number
}

// ---------- 緩動 ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, e: number) => a + (b - a) * e
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)
export const backOut = (p: number) => { const c = 1.9; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2 }
export const bounceOut = (p: number) => {
  const n = 7.5625, d = 2.75
  if (p < 1 / d) return n * p * p
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375
  return n * (p -= 2.625 / d) * p + 0.984375
}

const DEFAULT_DUR: Record<Move['do'], number> = {
  enter: 0.6, pop: 0.35, drop: 0.6, vanish: 0.25, moveTo: 0.5, scaleTo: 0.4, rotateTo: 0.25, swap: 0,
  flip: 0,
  hop: 0.4, bounce: 0.8, squash: 0.25, shake: 0.5, spin: 0.5, tilt: 0.35, flash: 0.6,
}
export const durOf = (m: Move) => m.dur ?? DEFAULT_DUR[m.do]

/** 時間 t 時每個角色長什麼樣。動作依開始時間套用，後面的動作接著前面的結果。 */
export function actorsAt(clip: Clip, t: number): ActorState[] {
  const moves = [...clip.moves].sort((a, b) => a.at - b.at)
  return clip.actors.map((a) => {
    const st: ActorState = {
      id: a.id, emoji: a.emoji, size: a.size, flip: !!a.flip, float: !!a.float, top: !!a.top, tint: a.tint,
      x: a.x, y: a.y, s: 1, sx: 1, sy: 1, r: 0, o: 1, visible: !a.hidden, glow: 0,
    }
    for (const m of moves) {
      if (m.actor !== a.id || t < m.at) continue
      const d = durOf(m)
      const p = d > 0 ? clamp((t - m.at) / d) : 1
      const live = t <= m.at + d
      const e = easeInOut(p)
      const arcUp = (m.arc ?? 0) * Math.sin(Math.PI * p)
      switch (m.do) {
        case 'enter': {
          const from = m.from ?? { x: -15, y: st.y }
          st.visible = true
          st.x = lerp(from.x, st.x, e); st.y = lerp(from.y, st.y, e) - arcUp
          break
        }
        case 'pop': st.visible = true; st.s *= backOut(p); break
        case 'drop': st.visible = true; st.y = lerp(-20, st.y, bounceOut(p)); break
        case 'vanish':
          st.s *= 1 - e; st.o *= 1 - e
          if (p >= 1) st.visible = false
          break
        case 'moveTo':
          if (m.to) { st.x = lerp(st.x, m.to.x, e); st.y = lerp(st.y, m.to.y, e) - arcUp }
          break
        case 'scaleTo': st.s *= lerp(1, m.amount ?? 1, e); break
        case 'rotateTo': st.r += lerp(0, m.amount ?? 0, e); break
        case 'swap': if (m.emoji) st.emoji = m.emoji; break
        case 'flip': st.flip = !st.flip; break
        default: {
          if (!live) break
          const amt = m.amount
          if (m.do === 'hop') st.y -= (amt ?? 8) * Math.sin(Math.PI * p)
          if (m.do === 'bounce') st.y -= (amt ?? 5) * Math.abs(Math.sin(Math.PI * (m.times ?? 2) * p)) * (1 - p * 0.5)
          if (m.do === 'squash') { const k = Math.sin(Math.PI * p) * (amt ?? 0.35); st.sx *= 1 + k; st.sy *= 1 - k * 0.86 }
          if (m.do === 'shake') st.x += (amt ?? 1.5) * Math.sin(p * Math.PI * 12) * (1 - p)
          if (m.do === 'spin') st.r += 360 * (m.times ?? 1) * e
          if (m.do === 'tilt') st.r += (amt ?? 15) * Math.sin(Math.PI * p)
          if (m.do === 'flash') st.glow = Math.max(st.glow, Math.abs(Math.sin(Math.PI * 3 * p)))
        }
      }
    }
    return st
  })
}

// ---------- 國字 ----------
export const GLYPH = { size: 63, x: 80 - 63 / 2, y: 45 - 63 / 2 }
const K = GLYPH.size / 1024

/** hanzi-writer 座標（y 朝上、-124～900）換成舞台座標。 */
export const toStage = (px: number, py: number): Vec => ({ x: GLYPH.x + px * K, y: GLYPH.y + (900 - py) * K })
export const GLYPH_TRANSFORM = `translate(${GLYPH.x} ${GLYPH.y + 900 * K}) scale(${K} ${-K})`

export type StrokeState = { index: number; color: string; o: number; dx: number; dy: number; s: number; r: number; cx: number; cy: number }

/** 每一筆在 t 時的位置；還沒輪到的筆畫不在清單裡。centers 是每一筆中心點（舞台座標）。 */
export function strokesAt(clip: Clip, t: number, centers: Vec[]): StrokeState[] {
  const out: StrokeState[] = []
  for (const b of clip.builds) {
    const timing = buildTiming(b)
    const src = typeof b.from === 'string'
      ? (() => { const a = actorsAt(clip, b.at).find((x) => x.id === b.from); return a ? { x: a.x, y: a.y } : { x: 80, y: 45 } })()
      : b.from
    b.strokes.forEach((index, i) => {
      const start = b.at + timing.stagger * i
      if (t < start) return
      const p = clamp((t - start) / timing.each)
      const c = centers[index] ?? { x: 80, y: 45 }
      if (b.style === 'drop') {
        const e = bounceOut(p)
        out.push({ index, color: b.color, o: clamp(p * 4), dx: 0, dy: -70 * (1 - e), s: 1, r: 0, cx: c.x, cy: c.y })
      } else {
        const e = backOut(p)
        out.push({
          index, color: b.color, o: clamp(p * 3),
          dx: (src.x - c.x) * (1 - e), dy: (src.y - c.y) * (1 - e) - 14 * Math.sin(Math.PI * clamp(p)),
          s: lerp(0.15, 1, e), r: lerp(-140, 0, e), cx: c.x, cy: c.y,
        })
      }
    })
  }
  return out
}

export function buildTiming(b: Build) {
  const n = b.strokes.length
  const each = Math.min(0.45, b.dur * 0.6)
  const stagger = n > 1 ? (b.dur - each) / (n - 1) : 0
  return { each, stagger }
}

/** 每一筆落定的時間，播放器用來放「喀」的音效。 */
export function landings(clip: Clip): { at: number; i: number; n: number }[] {
  const total = clip.builds.reduce((s, b) => s + b.strokes.length, 0)
  let k = 0
  return clip.builds.flatMap((b) => {
    const { each, stagger } = buildTiming(b)
    return b.strokes.map((_, i) => ({ at: b.at + stagger * i + each * 0.8, i: k++, n: total }))
  })
}

export function glyphAt(clip: Clip, t: number) {
  let dx = 0, s = 1, r = 0
  for (const fx of clip.glyph ?? []) {
    if (t < fx.at || t > fx.at + fx.dur) continue
    const p = (t - fx.at) / fx.dur
    const k = Math.sin(Math.PI * p)
    if (fx.do === 'pulse') s *= 1 + 0.06 * k
    if (fx.do === 'wobble') r += 4 * Math.sin(p * Math.PI * 4) * (1 - p)
    if (fx.do === 'shake') dx += 1.2 * Math.sin(p * Math.PI * 14) * (1 - p)
  }
  return { dx, s, r }
}

// ---------- 漫畫效果 ----------
export const FLOOR = 74

export type FxItem = { key: string; emoji?: string; bubble?: boolean; bolt?: Vec[]; wave?: boolean; x: number; y: number; size: number; o: number; s: number; r: number }

const FX_DUR: Record<Fx['kind'], number> = { burst: 0.6, dizzy: 1.2, bubble: 1, sweat: 0.7, puff: 0.5, zzz: 1.6, pop: 0.8, rain: 0.8, zap: 0.35, fountain: 1, stink: 1.6 }

export function fxAt(clip: Clip, t: number): FxItem[] {
  const out: FxItem[] = []
  const actors = new Map(actorsAt(clip, t).map((a) => [a.id, a]))
  ;(clip.fx ?? []).forEach((f, fi) => {
    const d = f.dur ?? FX_DUR[f.kind]
    if (t < f.at || t > f.at + d) return
    const p = (t - f.at) / d
    const a = f.actor ? actors.get(f.actor) : undefined
    // 錨點：角色頭頂；腳底給 puff 用
    const head = a ? { x: a.x + (f.dx ?? 0), y: a.y - a.size * 0.45 * a.s * a.sy + (f.dy ?? 0) } : { x: f.x ?? 80, y: f.y ?? 45 }
    const feet = a ? { x: a.x, y: a.y + a.size * 0.42 } : head
    const fade = clamp(Math.min(p / 0.12, (1 - p) / 0.2))
    const n = f.n ?? 0
    const key = (i: number) => `${fi}-${i}`
    switch (f.kind) {
      case 'burst': {
        if ((n || 1) === 1) {
          out.push({ key: key(0), emoji: f.emoji ?? '💥', x: head.x + (f.actor ? 0 : 0), y: head.y, size: 11, o: clamp((1 - p) / 0.4), s: backOut(clamp(p / 0.35)), r: -10 + 20 * p })
          break
        }
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + 0.4
          const dist = 3 + 15 * (1 - (1 - p) ** 2)
          out.push({ key: key(i), emoji: f.emoji ?? '✨', x: head.x + Math.cos(ang) * dist, y: head.y + Math.sin(ang) * dist * 0.8 + 6 * p * p,
            size: 5, o: 1 - p * p, s: 1 - 0.3 * p, r: 0 })
        }
        break
      }
      case 'dizzy':
        for (let i = 0; i < 3; i++) {
          const ang = (t - f.at) * Math.PI * 3 + (i * Math.PI * 2) / 3
          out.push({ key: key(i), emoji: f.emoji ?? '💫', x: head.x + Math.cos(ang) * 7, y: head.y - 2 + Math.sin(ang) * 2,
            size: 5.5, o: fade, s: 0.85 + 0.25 * Math.sin(ang), r: 0 })
        }
        break
      case 'bubble': {
        const pin = clamp(p * d / 0.25), pout = clamp((1 - p) * d / 0.15)
        out.push({ key: key(0), bubble: true, emoji: f.emoji ?? '❓', x: head.x + 9, y: head.y - 9, size: 6, o: 1, s: backOut(pin) * pout, r: 0 })
        break
      }
      case 'sweat':
        for (let i = 0; i < 2; i++) {
          const q = clamp(p * 1.6 - i * 0.5)
          if (q <= 0) continue
          out.push({ key: key(i), emoji: '💦', x: head.x + 5 + 5 * q, y: head.y - 1 - 4 * Math.sin(Math.PI * q) + 3 * q, size: 4, o: 1 - q, s: 1, r: 20 * q })
        }
        break
      case 'puff':
        for (const side of [-1, 1]) {
          out.push({ key: key(side), emoji: '💨', x: feet.x + side * (4 + 9 * p), y: feet.y - 2 - 2 * p, size: 5 + 3 * p, o: 1 - p, s: 1, r: 0 })
        }
        break
      case 'zzz':
        for (let i = 0; i < 3; i++) {
          const q = ((t - f.at) / 1.2 + i / 3) % 1
          out.push({ key: key(i), emoji: f.emoji ?? '💤', x: head.x + 4 + 6 * q, y: head.y - 2 - 12 * q, size: 3.5 + 3 * q, o: Math.sin(Math.PI * q) * fade, s: 1, r: 0 })
        }
        break
      case 'pop':
        out.push({ key: key(0), emoji: f.emoji ?? '❗', x: head.x + 6, y: head.y - 6 - 2 * Math.sin(Math.PI * p * 2), size: 7, o: fade, s: backOut(clamp(p * d / 0.2)), r: 0 })
        break
      case 'zap': {
        const b = f.target ? actors.get(f.target) : undefined
        if (!a || !b) break
        // 從雲底劈到頭頂，鋸齒每一幀換一點，看起來在閃
        const from = { x: a.x, y: a.y + a.size * 0.25 }, to = { x: b.x, y: b.y - b.size * 0.2 }
        const seed = Math.floor(t * 20)
        const pts: Vec[] = [from]
        for (let i = 1; i < 7; i++) {
          const k = i / 7
          const jitter = 4 + Math.abs((Math.sin(seed * 12.9 + i * 78.2) * 43758.5) % 1) * 6
          // 往垂直於閃電方向的那邊抖，不管閃電斜向哪裡都是鋸齒
          const len = Math.hypot(to.x - from.x, to.y - from.y) || 1
          const nx = -(to.y - from.y) / len, ny = (to.x - from.x) / len
          const side = i % 2 ? jitter : -jitter
          pts.push({ x: lerp(from.x, to.x, k) + nx * side, y: lerp(from.y, to.y, k) + ny * side })
        }
        pts.push(to)
        out.push({ key: key(0), bolt: pts, x: 0, y: 0, size: 0, o: seed % 2 ? 1 : 0.65, s: 1, r: 0 })
        break
      }
      case 'stink': {
        const c = a ? { x: a.x + (f.dx ?? 0), y: a.y + (f.dy ?? 0) } : head
        for (let i = 0; i < 3; i++) {
          const q = ((t - f.at) / 1.1 + i / 3) % 1
          out.push({ key: key(i), wave: true, x: c.x - 4 + i * 4, y: c.y - 3 - 14 * q, size: 1, o: Math.sin(Math.PI * q) * fade, s: 0.7 + 0.5 * q, r: 0 })
        }
        break
      }
      case 'fountain': {
        // 往上噴、散開、被重力拉回來
        const m = n || 8
        const tau = p * d
        for (let i = 0; i < m; i++) {
          const ang = (-0.5 + i / (m - 1)) * 1.2
          const v = 34 + (i % 3) * 6
          const x = head.x + Math.sin(ang) * v * tau
          const y = head.y - Math.cos(ang) * v * tau + 55 * tau * tau
          out.push({ key: key(i), emoji: f.emoji ?? '💧', x, y, size: 4.5, o: clamp((1 - p) / 0.3), s: 1, r: ang * 40 })
        }
        break
      }
      case 'rain':
        for (let i = 0; i < (n || 6); i++) {
          const q = clamp(p * 1.5 - (i / (n || 6)) * 0.5)
          if (q <= 0 || q >= 1) continue
          out.push({ key: key(i), emoji: f.emoji ?? '💧', x: head.x - 10 + (i * 37 % 20), y: head.y + 4 + 30 * q * q, size: 4, o: 1 - q * 0.5, s: 1, r: 0 })
        }
        break
    }
  })
  return out
}

export function cameraAt(clip: Clip, t: number) {
  let z = 1, cx = 80, cy = 45, dx = 0, dy = 0
  for (const c of clip.camera ?? []) {
    if (t < c.at || t > c.at + c.dur) continue
    const p = (t - c.at) / c.dur
    if (c.do === 'punch') {
      // 快速推近、停住、慢慢退回
      const k = p < 0.15 ? backOut(p / 0.15) : p > 0.7 ? 1 - easeInOut((p - 0.7) / 0.3) : 1
      z *= 1 + (c.amount ?? 0.25) * k
      if (c.to) { cx = c.to.x; cy = c.to.y }
    } else {
      const k = (c.amount ?? 1.5) * (1 - p)
      dx += Math.sin(p * 61) * k
      dy += Math.cos(p * 47) * k * 0.7
    }
  }
  return { z, cx, cy, dx, dy }
}

export function lightAt(clip: Clip, t: number) {
  let level = 0
  for (const l of [...(clip.lights ?? [])].sort((a, b) => a.at - b.at)) {
    if (t < l.at) break
    level = lerp(level, l.level, l.dur > 0 ? clamp((t - l.at) / l.dur) : 1)
  }
  return level
}
