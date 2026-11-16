import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 島（v2）：小骷髏被困在一大片海中間的無人小島上——島＝四面都是水的一小塊地。海水每次慢慢「嘩——」地漲上來一圈，
// 島就被淹掉一圈、小一圈，他能待的地方一次比一次少，只好往高處擠：
// 還能躺著曬太陽，水淹到腳（鳥的頭從水花裡飛出來）→ 只能站著發抖（鳥的身體）→
// 先停一拍：他單腳站在剩下的一點點沙上，低頭看水、冒汗……水又漲了，他跳上椰子樹抱著發抖（島變成一座小山：山）。
// 國字回中央時整個畫面往下沉一點（水面降到國字下面），他和椰子樹在右邊。
// 回馬槍（第四次）：水又漲，這次整座島都淹掉了，只剩椰子樹——停一拍——「轟隆！」島自己升起來：
// 原來小島是一隻大烏龜的背！烏龜載著他和椰子樹游到畫面中間：「小島」，再轉身游走。
// 最後海退掉、畫面暗下來只剩「島」，小骷髏走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「島！」，然後退場只留字。
// 刻意不跟「海」（大浪沖上沙灘、海豚）、「湖」（打水漂）、「浪」（衝浪、大浪）、「龜」（縮進殼裡）撞：
// 這支的水是「整片慢慢漲上來」，沒有浪打過來；烏龜只在回馬槍出現一次。
// 島、島、小島、這是什麼字？、島

/** 小骷髏（hero:jerry；圖朝左，前三次都在椰子樹右邊、面向椰子樹） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 腳底的高度 → 角色的 y */
const feet = (y: number) => y - 0.42 * JS
/** 椰子樹（🌴 3D 圖：size 28 時樹幹底在 y + 13.3） */
const PS = 28
const palmY = (base: number) => base - 13.3
/** 島的中心（偏右：國字回中央那一秒，椰子樹和他都在國字右邊） */
const IX = 120
const PX = IX + 1
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 30, y: 20 }
const PARK_K = 0.5

// ---- 海與島：一排一排的粗線疊出來（掛在看不見的錨點 sea 上，錨點在 0,0，dx／dy 就是舞台座標） ----

/** 島露出水面的樣子：半個橢圓，寬 W（半寬）、高 h，底在水面 L 上 */
type Isle = { W: number; h: number; L: number }
/** 四個階段：大島（還能躺）→ 只能站 → 只剩單腳 → 只剩椰子樹底下一點點 */
const S: Isle[] = [
  { W: 34, h: 8, L: 72 },
  { W: 23, h: 6.5, L: 67 },
  { W: 13, h: 5.5, L: 62.5 },
  { W: 6.5, h: 4.5, L: 58.5 },
]
const top = (s: Isle) => s.L - s.h
/** 島面在 dx 處的高度 */
const surf = (s: Isle, dx: number) => s.L - s.h * Math.sqrt(Math.max(0, 1 - (dx / s.W) ** 2))

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
const clamp01 = (p: number) => Math.max(0, Math.min(1, p))
const ease = (p: number) => p * p * (3 - 2 * p)
/** 引擎 moveTo 預設的緩動（inOut）：整片海跟椰子樹、他一起沉下去時要對得上 */
const easeQuad = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)

/** 照時間的關鍵格內插（慢起慢停） */
function keyAt(keys: [number, number][], t: number, e = ease) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]
      return v0 + (v1 - v0) * e((t - t0) / (t1 - t0))
    }
  }
  return keys[keys.length - 1][1]
}

/** 上面淺、下面深的藍 */
const waterColor = (y: number, L: number) => mix('#5CB9F4', '#1A64C8', clamp01((y - L) / 30))
/** 沙：上面亮、下面深 */
const sandColor = (k: number) => mix('#F8DE9C', '#D9A957', clamp01(k))

type Seg = { a: Vec; b: Vec; color: string; width: number }

/** 島（半個橢圓）的每一排沙：底在 L、往上到 L − h */
function isleRows(out: Map<string, Seg>, key: string, cx: number, s: Isle) {
  if (s.W < 0.6 || s.h < 0.6) return
  const n = Math.max(2, Math.ceil(s.h / 1.3))
  for (let j = 0; j < n; j++) {
    const y = s.L - 0.4 - j * (s.h - 1.0) / (n - 1)
    const q = (s.L - y) / s.h
    const w = s.W * Math.sqrt(Math.max(0, 1 - q * q)) - 0.8
    if (w < 0.3) continue
    out.set(`${key}${j}`, { a: { x: cx - w, y }, b: { x: cx + w, y }, color: sandColor(1 - q), width: 2.1 })
  }
}

/** 某一刻整片海＋島的樣子（一組線段，每段有自己的名字，前後格一樣就合併成一段） */
function seaFrame(t: number, Lk: [number, number][], Wk: [number, number][], Hk: [number, number][], Ok: [number, number][]): Map<string, Seg> {
  const out = new Map<string, Seg>()
  // 錨點不能動（line 的終點是舞台座標），整片往下沉／退掉都算進水面高度
  const L = keyAt(Lk, t) + keyAt(Ok, t, easeQuad), W = keyAt(Wk, t), h = keyAt(Hk, t)
  // 島的中心：國字回中央那一秒整座島連樹往右滑開
  const cx = IX + keyAt(XK, t, easeQuad)
  // 島（先畫，水蓋在它下緣上面）
  isleRows(out, 'i', cx, { W, h, L })
  // 海面：從水面一排一排往下鋪到畫面底下
  for (let i = 0; L + 0.9 + i * 2.3 < 94; i++) {
    const y = L + 0.9 + i * 2.3
    out.set(`r${i}`, { a: { x: -8, y }, b: { x: 168, y }, color: waterColor(y, L), width: 3.1 })
  }
  // 水面一條白光（水漲到哪裡一眼看得到）、島邊一圈白浪花
  out.set('hz', { a: { x: -8, y: L - 0.2 }, b: { x: 168, y: L - 0.2 }, color: '#E8F7FF', width: 0.9 })
  if (W > 1) out.set('foam', { a: { x: cx - W - 2.5, y: L + 0.2 }, b: { x: cx + W + 2.5, y: L + 0.2 }, color: '#FFFFFF', width: 1.7 })
  // 海面上幾道慢慢漂的白色小浪
  for (let i = 0; i < 10; i++) {
    const y = L + 0.9 + 2.3 * (1 + ((i * 3) % 9))
    const x = ((i * 37 + Math.floor(t * 10) * 0.7) % 176) - 8
    const onIsle = Math.abs(x + 2 - cx) < W + 4 && y < L + 3
    if (!onIsle && y < 92) out.set(`d${i}`, { a: { x, y: y - 0.6 }, b: { x: x + 4.5, y: y - 0.6 }, color: '#D8F1FF', width: 0.8 })
  }
  return out
}

/** 把整支的海每 0.05 秒取一格，前後格一樣的線段合成一段，變成一串掛在 anchor 上的 line 效果 */
function segFx(end: number, frameAt: (t: number) => Map<string, Seg>, anchor: string, start = 0): Fx[] {
  const fx: Fx[] = []
  const open = new Map<string, { seg: Seg; at: number }>()
  const same = (p: Seg, q: Seg) => Math.abs(p.a.x - q.a.x) < 0.05 && Math.abs(p.a.y - q.a.y) < 0.05 && Math.abs(p.b.x - q.b.x) < 0.05 && Math.abs(p.b.y - q.b.y) < 0.05 && p.color === q.color && p.width === q.width
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    // 多留 0.12 秒跟下一段疊在一起，換段的時候不會閃
    // 線剛出現的 0.12 秒會從起點長出來：每一段都提早 0.12 秒開始（第一格的提早到開場前），換段時才不會看到一半新一半舊的接縫
    const at = o.at <= 0 ? -0.15 : o.at - 0.12
    fx.push({ at, dur: t - at + (last ? 0 : 0.06), kind: 'line', actor: anchor, dx: o.seg.a.x, dy: o.seg.a.y, to: o.seg.b, color: o.seg.color, width: o.seg.width })
    open.delete(key)
  }
  const STEP = 0.05
  for (let n = 0; start + n * STEP < end - 1e-6; n++) {
    const t = +(start + n * STEP).toFixed(3)
    const frame = frameAt(t)
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
/** 三次漲水：水碰到他的那一刻（水從前 0.6 秒開始慢慢漲） */
const F = [2.0, 3.5, 5.4]
const RISE = 0.6
/** 第三次前停一拍：他低頭看水、冒汗 */
const LOOK = F[1] + 0.75
/** 字框填滿 → 整個畫面往下沉（水面降到國字下面）→ 國字到正中央 */
const SINK = F[2] + 0.55
const D = 15.5
const HOME = SINK + 0.2
const PARK = HOME + 0.9
/** 回馬槍：水又漲，整座島都淹掉 */
const F4 = PARK + 1.0
/** 停一拍，「轟隆！」烏龜升起來 */
const RUMBLE = F4 + 0.3
const UP = RUMBLE + 0.05
/** 游到畫面中間（語詞），再轉身游走 */
const SWIM = UP + 0.6
const WORD = SWIM + 0.35
const TURN = SWIM + 0.85
const AWAY = TURN + 0.05
/** 海退掉 */
const DRAIN = AWAY + 0.15
/** 問他 */
const ASK = DRAIN + 0.5
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: 122, y: JY + 3 }

/** 水面、島的半寬、島的高：每次漲水在 [F − RISE, F + 0.1] 之間換到下一階段；回馬槍整座島淹掉，烏龜升起來時水退回一點 */
const LK: [number, number][] = [[0, S[0].L]]
const WK: [number, number][] = [[0, S[0].W]]
const HK: [number, number][] = [[0, S[0].h]]
F.forEach((f, k) => {
  const a = k === 2 ? f - RISE - 0.05 : f - RISE
  LK.push([a, S[k].L], [f + 0.1, S[k + 1].L])
  WK.push([a, S[k].W], [f + 0.1, S[k + 1].W])
  HK.push([a, S[k].h], [f + 0.1, S[k + 1].h])
})
LK.push([F4 - RISE, S[3].L], [F4 + 0.1, 53], [UP, 53], [UP + 0.4, 62])
WK.push([F4 - RISE, S[3].W], [F4 + 0.1, 0])
HK.push([F4 - RISE, S[3].h], [F4 + 0.1, 3])
/** 整片海往下沉（國字回中央那一秒）、浮回來、最後退掉 */
const OK: [number, number][] = [[0, 0], [SINK, 0], [SINK + 0.35, D], [PARK, D], [PARK + 0.35, 0], [DRAIN, 0], [DRAIN + 0.4, 45]]
/** 同一段時間整座島連樹、他一起往右滑 DX（國字放大時右邊留白，樹葉左緣離國字的框 x 113 有 8 以上），讓位後滑回來 */
const DX = 13
const XK: [number, number][] = [[0, 0], [SINK, 0], [SINK + 0.35, DX], [PARK, DX], [PARK + 0.35, 0]]

// ---- 烏龜（prop:turtle 圖朝左；size 64 時殼頂在 y − 7、殼的中心在 x + 9） ----
const TS = 64
/** 升起來以後：殼的中心對到原本島的中心 */
const T_UP: Vec = { x: IX - 9, y: 49 }
/** 一開始躲在水底下 */
const T_DOWN: Vec = { x: T_UP.x, y: T_UP.y + 26 }
/** 游到畫面中間 */
const MID = -40
/** 椰子樹種在殼頂上 */
const shellPalm = (ty: number) => palmY(ty - 6)
/** 他站在殼上（椰子樹右邊） */
const RIDE_DX = 20
const rideFeet = (ty: number) => ty - 2

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 「嘩——」水碰到他那一下：水花＋鏡頭推一下＋震＋同一個音效（一次比一次多疊一個音）；他傻眼跳起來，往高處擠 */
function flood(at: number, k: number, c: Vec, to: Vec, pose: string): Gag {
  const moves: Move[] = [
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at, actor: 'jerry', do: 'moveTo', to, arc: 9, dur: 0.45, ease: 'out' },
    { at: at + 0.5, actor: 'jerry', do: 'swap', emoji: `hero:jerry/${pose}` },
    { at: at + 0.55, actor: 'jerry', do: 'shake', amount: 0.6 + 0.3 * k, dur: 0.4 },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', x: c.x, y: c.y, emoji: '💦', n: 6 + 2 * k, dur: 0.5, scale: 1.2 + 0.25 * k },
    { at: at + 0.55, kind: 'sweat', actor: 'jerry', dx: 9, dur: 0.5 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: c.x, y: c.y - 6 } },
    { at, dur: 0.32, do: 'shake', amount: 0.8 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at: at - RISE + 0.05, sfx: 'bubble' }, { at, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 椰子樹跟著露出來的島頂往上（島一次比一次小，樹一直站在最上面） */
const palmUp = (k: number): Move => ({ at: F[k] - RISE, actor: 'palm', do: 'moveTo', to: { x: PX, y: palmY(top(S[k + 1])) }, dur: RISE + 0.1 })

// 第 1 次：躺著曬太陽，水淹到腳——跳起來，只能站著
const J1: Vec = { x: IX + 13, y: feet(surf(S[1], 13)) }
const g1 = flood(F[0], 0, { x: IX + 18, y: S[0].L - 4 }, J1, 'cold')
g1.moves.unshift({ at: F[0], actor: 'jerry', do: 'rotateTo', amount: -6, dur: 0.12 })
// 第 2 次：站的地方也淹了——跳起來，只剩單腳站得下
const J2: Vec = { x: IX + 8, y: feet(surf(S[2], 7)) }
const g2 = flood(F[1], 1, { x: J1.x, y: S[1].L - 3 }, J2, 'kick')
// 停一拍：低頭看水、冒汗——水又開始漲，❗
const pause: Move[] = [
  { at: LOOK, actor: 'jerry', do: 'tilt', amount: -8, dur: 0.4 },
  { at: LOOK + 0.45, actor: 'jerry', do: 'shake', amount: 0.5, dur: 0.3 },
]
// 第 3 次：只剩椰子樹底下一點點——跳上椰子樹抱著發抖
const J3: Vec = { x: PX + 6, y: feet(47) }
const g3 = flood(F[2], 2, { x: J2.x - 8, y: S[2].L - 3 }, J3, 'scared')
g3.fx.push({ at: F[2] - RISE, kind: 'pop', actor: 'jerry', emoji: '❗', dx: 10, dy: 2 })

// 回馬槍：水又漲，整座島淹掉，只剩椰子樹——他抱得更高
const J4: Vec = { x: PX + 6, y: feet(43.5) }
const g4 = flood(F4, 3, { x: PX - 8, y: 55 }, J4, 'scared')
g4.moves.push(
  // 「轟隆！」烏龜帶著殼上的沙、椰子樹、他一起升起來
  { at: RUMBLE, actor: 'turtle', do: 'pop', dur: 0.05 },
  { at: UP, actor: 'turtle', do: 'moveTo', to: T_UP, dur: 0.45, ease: 'out' },
  { at: UP, actor: 'palm', do: 'moveTo', to: { x: T_UP.x + 9, y: shellPalm(T_UP.y) }, dur: 0.45, ease: 'out' },
  { at: UP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
  { at: UP, actor: 'jerry', do: 'moveTo', to: { x: T_UP.x + RIDE_DX, y: feet(rideFeet(T_UP.y)) }, dur: 0.45, ease: 'out' },
  { at: UP + 0.6, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
  { at: UP + 0.6, actor: 'turtle', do: 'hop', amount: 1.5, dur: 0.3 },
  // 游到畫面中間（語詞那一刻），他揮手
  { at: SWIM, actor: 'turtle', do: 'moveTo', to: { x: T_UP.x + MID, y: T_UP.y }, dur: 0.5 },
  { at: SWIM, actor: 'palm', do: 'moveTo', to: { x: T_UP.x + 9 + MID, y: shellPalm(T_UP.y) }, dur: 0.5 },
  { at: SWIM, actor: 'jerry', do: 'moveTo', to: { x: T_UP.x + RIDE_DX + MID, y: feet(rideFeet(T_UP.y)) }, dur: 0.5 },
  { at: WORD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/wave' },
  { at: WORD + 0.05, actor: 'turtle', do: 'hop', amount: 1.5, dur: 0.3 },
  // 轉身（殼的中心不動）游走
  { at: TURN, actor: 'turtle', do: 'flip' },
  { at: TURN, actor: 'turtle', do: 'moveTo', to: { x: T_UP.x + MID + 18, y: T_UP.y }, dur: 0.01 },
  { at: TURN, actor: 'jerry', do: 'flip' },
  { at: TURN, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
  { at: AWAY, actor: 'turtle', do: 'moveTo', to: { x: 250, y: T_UP.y }, dur: 0.5, ease: 'in' },
  { at: AWAY, actor: 'palm', do: 'moveTo', to: { x: 250 - 9, y: shellPalm(T_UP.y) }, dur: 0.5, ease: 'in' },
  { at: AWAY, actor: 'jerry', do: 'moveTo', to: { x: 250 + RIDE_DX - 18, y: feet(rideFeet(T_UP.y)) }, dur: 0.5, ease: 'in' },
)
g4.fx.push(
  // 烏龜升起來那一下：一大圈水花
  { at: UP + 0.1, kind: 'burst', x: IX - 12, y: 60, emoji: '💦', n: 12, dur: 0.55, scale: 1.8 },
)
g4.camera.push(
  { at: UP, dur: 0.5, do: 'shake', amount: 2.4 },
  { at: UP + 0.05, dur: 0.5, do: 'punch', amount: 0.08, to: { x: IX - 6, y: 48 } },
  { at: WORD, dur: 0.6, do: 'punch', amount: 0.06, to: { x: 80, y: 46 } },
)
g4.cues.push({ at: RUMBLE, sfx: 'rumble' }, { at: UP + 0.05, sfx: 'splash' }, { at: UP + 0.6, sfx: 'boing' })

const builds: Build[] = [
  // 水花濺起來：鳥的頭 → 鳥的身體；第三次島被淹成一座小山：山
  { at: F[0] + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: { x: IX + 24, y: 62 }, color: partColor('鳥') },
  { at: F[1] + 0.05, dur: 0.5, strokes: [4, 5, 6], from: { x: J1.x, y: 58 }, color: partColor('鳥') },
  { at: F[2] + 0.05, dur: 0.5, strokes: [7, 8, 9], from: { x: IX, y: 55 }, color: partColor('山') },
]

const clip: Clip = {
  format: 2,
  char: '島',
  meta: { theme: '無人小島越來越小', cast: '小骷髏＋大烏龜＋椰子樹', gags: ['小骷髏被困在海中間的無人小島上，海水每次慢慢「嘩」地漲上來，島就被淹掉一圈、小一圈，他能待的地方一次比一次少、只好往高處擠：還能躺著→只能站著→停一拍，只剩單腳站得下，水又漲，他跳上椰子樹抱著發抖；回馬槍是水又漲、整座島都淹掉了，「轟隆」島自己升起來——原來是一隻大烏龜的背，載著他游到中間再游走'] },
  duration: 14.7,
  // 淺藍的天：一身黑的小骷髏站在天空前面看得清楚
  bg: { top: '#BFE6FF', bottom: '#EEF9FF', floor: '#CDE9F5', scenery: 'sea' },
  actors: [
    // 看不見的錨點：海面、島的線都掛在它身上（在 0,0，不會動）
    { id: 'sea', emoji: '🟦', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'turtle', emoji: 'prop:turtle', x: T_DOWN.x, y: T_DOWN.y, size: TS, hidden: true, float: true },
    { id: 'palm', emoji: '🌴', x: PX, y: palmY(top(S[0])), size: PS, float: true },
    { id: 'jerry', emoji: 'hero:jerry/idle', x: IX + 17, y: feet(surf(S[0], 17)), size: JS },
  ],
  moves: [
    // 開場：站在大大的島上，指著字框「島」，躺下來曬太陽
    { at: 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/sleep' },
    { at: 1.0, actor: 'jerry', do: 'rotateTo', amount: 6, dur: 0.15 },
    palmUp(0),
    ...g1.moves,
    palmUp(1),
    ...g2.moves,
    ...pause,
    palmUp(2),
    ...g3.moves,
    // 整個畫面往下沉一點、島往右滑開：水面降到國字下面、樹和他離開國字右邊；國字讓位後再回來
    { at: SINK, actor: 'palm', do: 'moveTo', to: { x: PX + DX, y: palmY(top(S[3])) + D }, dur: 0.35 },
    { at: SINK, actor: 'jerry', do: 'moveTo', to: { x: J3.x + DX, y: J3.y + D }, dur: 0.35 },
    { at: PARK, actor: 'palm', do: 'moveTo', to: { x: PX, y: palmY(top(S[3])) }, dur: 0.35 },
    { at: PARK, actor: 'jerry', do: 'moveTo', to: J3, dur: 0.35 },
    ...g4.moves,
    // 問他：從右邊走回來，變大
    { at: ASK + 0.02, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.04, actor: 'jerry', do: 'flip' },
    { at: ASK + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: ASK + 0.1, actor: 'jerry', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.12, actor: 'jerry', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.16, actor: 'jerry', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'jerry', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（島在右邊、左邊是一大片海）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給小骷髏
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['jerry'], to: { x: 58, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.0, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...segFx(ASK, (t) => seaFrame(t, LK, WK, HK, OK), 'sea'),
    ...g1.fx,
    ...g2.fx,
    { at: LOOK + 0.05, kind: 'sweat', actor: 'jerry', dx: 9, dur: 0.6 },
    ...g3.fx,
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把右邊的島切掉）
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
    { at: 0.45, say: '島' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '島' },
    ...g4.cues,
    { at: WORD, say: '小島' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '島' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
