import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 筆（v2）：神奇的鉛筆，畫什麼就變出什麼。兔子女孩抱著一枝大鉛筆在空中「唰唰唰」畫，黑色的線稿一筆一筆長出來——
// 「叮！」線稿變成真的東西，一次比一次大、一次比一次不受控制：一顆蘋果（咻地飛進她嘴裡，她咬一大口，竹字頭的左半從蘋果上飛出來）→
// 一隻青蛙（呱地撲到她臉上，把她撲倒，竹字頭的右半）→ 先停一拍：她托著下巴想，畫一個大大的圓、兩個耳朵、額頭三條紋……
// 「叮！」一隻大老虎張嘴大吼！她嚇得抱緊鉛筆，再把鉛筆倒過來，用筆尾的橡皮擦「擦擦擦」把老虎從頭擦到腳（擦掉的地方變成聿飛上去）。
// 語詞那一刻她把鉛筆舉在頭上、鉛筆變得最大——鉛筆。回馬槍（第四次）：她畫一扇窗，「叮！」窗戶變成真的，她伸手打開——
// 剛剛被擦掉的老虎從窗戶裡撲出來，比剛才還大，一吼把她吹倒；她跳起來用橡皮擦一揮，老虎和窗戶一起擦掉。
// 最後畫面暗下來只剩「筆」，她問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「筆！」，然後退場只留字。
// 筆、筆、鉛筆、這是什麼字？、筆

/** 兔子女孩（圖朝左，整支 flip 朝右：面向右邊的畫） */
const S = 38
const P = 77 - 0.42 * S
/**
 * 大鉛筆 prop:pencil：水平、筆尖朝右、粉紅橡皮擦在左；圖上筆身在 u 0.039～0.957、v 0.846～0.961。
 * float（不抬支點、不畫影子）時 rotateTo／scaleTo 都繞 (x, y + 0.42 × size)，剛好是筆身的正中間，
 * 所以「筆的中點」M 在哪裡，角色就擺在 (M.x, M.y − 0.42 × size)。
 */
const L = 48
const PS = L / 0.918
/** 畫出來的東西共用一個角色換圖：底子 size 寫最大的老虎，蘋果、青蛙出場後再 scaleTo 縮小 */
const BIG = 64
/** 共用角色站在地上的 y（以腳底縮放，縮多小腳底都在地上） */
const TY = 77 - 0.42 * BIG
/** 共用角色縮成 s 倍時，要讓圖的中心在 cy，角色的 y 要寫多少 */
const thingY = (cy: number, s: number) => cy - 0.42 * BIG * (1 - s)
/** 線稿的墨色與粗細 */
const INK = '#262626'
const INK_W = 1.35
/** 字框在左上角（hills 的左上是素色天空）；畫畫都在右邊，不經過字框 */
const FRAME = { x: 28, y: 20 }

/** 每個姿勢握鉛筆的那隻手在圖上的位置（翻成朝右以後的 u、v） */
const HAND = {
  walk: [0.78, 0.58], idle: [0.68, 0.75], happy: [0.82, 0.45], reach: [0.82, 0.45], push: [0.85, 0.53],
  eat: [0.6, 0.74], smug: [0.62, 0.7], scared: [0.55, 0.6], flat: [0.78, 0.93], ponder: [0.72, 0.7],
  lift: [0.5, 0.1], dash: [0.82, 0.68], surprised: [0.82, 0.74],
} as const
type Pose = keyof typeof HAND
const hand = (x: number, p: Pose): Vec => ({ x: x + (HAND[p][0] - 0.5) * S, y: P + (HAND[p][1] - 0.5) * S })

/**
 * 鉛筆怎麼拿：a 是往上翹幾度（0 水平、90 直立），g 是手握在離後端多遠（0 握在最後面、0.5 握在正中間），
 * flip 是倒過來拿（橡皮擦朝前），s 是放大倍率。前端（筆尖，倒過來時是橡皮擦）＝ 手 + (1 − g) × L × s 往 a 的方向。
 */
type Pen = { a: number; g: number; flip: boolean; s: number }
const penAt = (h: Vec, q: Pen): Vec => {
  const r = (q.a * Math.PI) / 180, k = (0.5 - q.g) * L * q.s
  return { x: h.x + k * Math.cos(r), y: h.y - k * Math.sin(r) - 0.42 * PS }
}

// ── 兔子女孩和鉛筆一起動：每一步都把鉛筆擺回她的手上 ──
const moves: Move[] = []
const fx: Fx[] = []
const camera: Camera[] = []
const lights: Light[] = []
const cues: Cue[] = []
const START_X = 40
const START_PEN: Pen = { a: 72, g: 0.42, flip: false, s: 1 }
let bx = START_X
let pose: Pose = 'walk'
let pen: Pen = { ...START_PEN }
let rot = -START_PEN.a
type Go = { x?: number; pose?: Pose; a?: number; g?: number; flip?: boolean; s?: number; ease?: Move['ease']; arc?: number }
function go(at: number, dur: number, o: Go) {
  const p2 = o.pose ?? pose, x2 = o.x ?? bx
  const q: Pen = { a: o.a ?? pen.a, g: o.g ?? pen.g, flip: o.flip ?? pen.flip, s: o.s ?? pen.s }
  const ease = o.ease
  if (p2 !== pose) moves.push({ at, actor: 'bunny', do: 'swap', emoji: `hero:bunny/${p2}` })
  if (Math.abs(x2 - bx) > 0.01) moves.push({ at, dur, actor: 'bunny', do: 'moveTo', to: { x: x2, y: P }, ease, ...(o.arc ? { arc: o.arc } : {}) })
  if (q.flip !== pen.flip) moves.push({ at, actor: 'pen', do: 'flip' })
  if (q.s !== pen.s) moves.push({ at, dur, actor: 'pen', do: 'scaleTo', amount: q.s / pen.s, ease })
  if (Math.abs(-q.a - rot) > 0.01) moves.push({ at, dur, actor: 'pen', do: 'rotateTo', amount: -q.a - rot, ease })
  moves.push({ at, dur, actor: 'pen', do: 'moveTo', to: penAt(hand(x2, p2), q), ease, ...(o.arc ? { arc: o.arc } : {}) })
  bx = x2; pose = p2; pen = q; rot = -q.a
}

/**
 * 把鉛筆前端對到 T：先試著站著不動、只轉鉛筆和滑手；握的位置超出範圍才走過去。
 * 回傳她要站的 x、鉛筆翹的角度、握的位置。
 */
function aim(T: Vec, p: Pose): { x: number; a: number; g: number } {
  const GMIN = 0.04, GMAX = 0.5
  const ox = (HAND[p][0] - 0.5) * S, hy = P + (HAND[p][1] - 0.5) * S
  let hx = bx + ox
  const dy = hy - T.y
  let g = 1 - Math.hypot(T.x - hx, dy) / L
  if (g < GMIN || g > GMAX || T.x - hx < 6) {
    const D = (1 - Math.min(GMAX, Math.max(GMIN, g))) * L
    hx = T.x - Math.sqrt(Math.max(D * D - dy * dy, 36))
    g = 1 - Math.hypot(T.x - hx, dy) / L
  }
  return { x: hx - ox, a: (Math.atan2(dy, T.x - hx) * 180) / Math.PI, g }
}

/** 一圈（或一段弧）的點：從 a0 度轉到 a1 度（0 是右邊、-90 是正上方），n 段 */
const arc = (c: Vec, rx: number, ry: number, a0: number, a1: number, n: number): Vec[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const r = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180
    return { x: c.x + rx * Math.cos(r), y: c.y + ry * Math.sin(r) }
  })

/**
 * 唰唰唰畫線稿：筆尖沿著每一筆走，走過的地方長出黑線（線掛在看不見的 ink 上，dx／dy 就是舞台座標）。
 * 線一直留到「叮」（ding）那一刻剛好淡掉。回傳畫完的時間。
 */
function draw(t0: number, step: number, strokes: Vec[][], ding: number, p: Pose = 'reach', flip = false): number {
  let t = t0
  for (const s of strokes) {
    const a0 = aim(s[0], p)
    go(t, step * 1.5, { x: a0.x, pose: p, a: a0.a, g: a0.g, flip })
    t += step * 1.5
    for (let i = 1; i < s.length; i++) {
      const q = aim(s[i], p)
      if (ding > 0) fx.push({ at: t, dur: ding + 0.08 - t, kind: 'line', actor: 'ink', dx: s[i - 1].x, dy: s[i - 1].y, to: s[i], color: INK, width: INK_W })
      go(t, step, { x: q.x, a: q.a, g: q.g, ease: 'linear' })
      t += step
    }
  }
  return t
}

/**
 * 「叮！」線稿變成真的：同一個亮光、同一個「叮」，一次比一次多疊一個音、鏡頭推近一點、震大一點。
 * c 是畫的中心，k 是第幾次（0 起算）。
 */
function ding(at: number, k: number, c: Vec) {
  fx.push({ at, kind: 'burst', x: c.x, y: c.y, emoji: '✨', n: 6 + 2 * k, dur: 0.4, scale: 1.1 + 0.25 * k })
  camera.push(
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: c },
    { at, dur: 0.3, do: 'shake', amount: 0.6 + 0.5 * k },
  )
  lights.push({ at, dur: 0.04, level: -0.1 - 0.05 * k }, { at: at + 0.04, dur: 0.25, level: 0 })
  cues.push({ at, sfx: 'clink' }, { at: at + 0.03, sfx: 'poof' })
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
}

/** 共用角色換成新的東西、在 (x, y) 冒出來、縮成 s 倍（放大縮小要寫在 pop 之後，寫在前面會被重設） */
function appear(at: number, emoji: string, x: number, y: number, s: number, extra: Partial<Move> = {}) {
  moves.push(
    { at: at - 0.02, actor: 'thing', do: 'moveTo', to: { x, y }, dur: 0.01 },
    { at: at - 0.01, actor: 'thing', do: 'swap', emoji, ...extra } as Move,
    { at, actor: 'thing', do: 'pop', dur: 0.14 },
  )
  if (s !== 1) moves.push({ at: at + 0.005, actor: 'thing', do: 'scaleTo', amount: s, dur: 0.01 })
}

const save = () => ({ bx, pose, pen: { ...pen }, rot, n: moves.length })
const restore = (s: ReturnType<typeof save>) => { bx = s.bx; pose = s.pose; pen = s.pen; rot = s.rot; moves.length = s.n }
/** 先試算畫完要多久（不畫線、狀態還原），再照算好的「叮」真的畫一次；回傳「叮」的時間 */
function drawTimed(t0: number, step: number, strokes: Vec[][]): number {
  const snap = save()
  const end = draw(t0, step, strokes, 0)
  restore(snap)
  const at = end + 0.05
  cues.push({ at: t0, sfx: 'slide' })
  draw(t0, step, strokes, at)
  return at
}

// ── 開場：她抱著大鉛筆走進來，抬頭看左上的字框——筆！ ──
moves.push({ at: 0, actor: 'bunny', do: 'enter', from: { x: START_X - 60, y: P }, dur: 0.45, ease: 'out' })
moves.push({ at: 0, actor: 'pen', do: 'enter', from: { x: penAt(hand(START_X - 60, 'walk'), START_PEN).x, y: penAt(hand(START_X, 'walk'), START_PEN).y }, dur: 0.45, ease: 'out' })
go(0.45, 0.15, { pose: 'happy', a: 76, g: 0.12 })
moves.push({ at: 0.45, actor: 'bunny', do: 'hop', amount: 3, dur: 0.25 }, { at: 0.45, actor: 'pen', do: 'hop', amount: 3, dur: 0.25 })
cues.push({ at: 0.45, say: '筆' })

// ── 第 1 次：一顆蘋果 ──
const APPLE = { x: 97, y: 43 }
const H1 = drawTimed(0.7, 0.04, [
  arc(APPLE, 6.5, 6.5, -80, 280, 8),
  [{ x: 97.5, y: 36.5 }, { x: 98.5, y: 32 }],
  [{ x: 98.5, y: 34 }, { x: 103, y: 31.5 }, { x: 100, y: 35.5 }],
])
ding(H1, 0, APPLE)
appear(H1, '🍎', APPLE.x, thingY(APPLE.y, 0.25), 0.25)
// 咻地飛進她嘴裡，她「啊嗚」咬一大口（竹字頭的左半從蘋果上飛出來），吞下去、閉眼得意
const mouth = (x: number) => ({ x: x + 0.13 * S, y: P - 0.08 * S })
go(H1 + 0.3, 0.12, { pose: 'eat', a: 12, g: 0.5 })
moves.push({ at: H1 + 0.3, actor: 'thing', do: 'moveTo', to: { x: mouth(bx).x, y: thingY(mouth(bx).y, 0.25) }, arc: 5, dur: 0.22, ease: 'in' })
const BITE1 = H1 + 0.5
moves.push(
  { at: BITE1, actor: 'thing', do: 'scaleTo', amount: 0.7, dur: 0.12 },
  { at: BITE1, actor: 'bunny', do: 'squash', amount: 0.15, dur: 0.2 },
  { at: BITE1 + 0.35, actor: 'thing', do: 'scaleTo', amount: 0.2, dur: 0.12, ease: 'in' },
  { at: BITE1 + 0.47, actor: 'thing', do: 'vanish', dur: 0.01 },
)
cues.push({ at: BITE1, sfx: 'crack' }, { at: BITE1 + 0.35, sfx: 'gulp' })
fx.push({ at: BITE1, kind: 'burst', actor: 'thing', emoji: '💥', n: 1, dur: 0.3, scale: 0.9 })
go(BITE1 + 0.5, 0.1, { pose: 'smug', a: 12, g: 0.5 })

// ── 第 2 次：一隻青蛙 ──
const FROG = { x: 106, y: 62 }
const FROG_S = 40 / BIG
const START2 = BITE1 + 0.6
const frogLines = [
  arc({ x: 106, y: 76 }, 13, 18, 180, 360, 8),
  arc({ x: 99.5, y: 57 }, 3.8, 3.8, -90, 270, 5),
  arc({ x: 112.5, y: 57 }, 3.8, 3.8, -90, 270, 5),
  [{ x: 101, y: 66 }, { x: 106, y: 69.5 }, { x: 111, y: 66 }],
]
const H2 = drawTimed(START2, 0.028, frogLines)
ding(H2, 1, FROG)
appear(H2, 'prop:frog', FROG.x, TY, FROG_S)
go(H2 + 0.12, 0.1, { pose: 'happy', a: 76, g: 0.12 })
// 呱！青蛙撲到她臉上，把她撲倒（竹字頭的右半從青蛙身上飛出來）
const LEAP2 = H2 + 0.45
const HIT2 = LEAP2 + 0.18
const face = { x: bx + 0.12 * S, y: P - 0.22 * S }
moves.push(
  { at: LEAP2 - 0.12, actor: 'thing', do: 'squash', amount: 0.2, dur: 0.12 },
  { at: LEAP2, actor: 'thing', do: 'swap', emoji: 'prop:frog-jump' },
  { at: LEAP2, actor: 'thing', do: 'moveTo', to: { x: face.x + 6, y: thingY(face.y, FROG_S) }, arc: 8, dur: 0.18, ease: 'in' },
)
cues.push({ at: LEAP2, sfx: 'boing' }, { at: HIT2, sfx: 'bonk' })
go(HIT2, 0.15, { pose: 'flat', a: 4, g: 0.3, ease: 'out' })
fx.push({ at: HIT2, kind: 'burst', x: face.x + 2, y: face.y, emoji: '💥', n: 1, dur: 0.35, scale: 1.6 })
camera.push({ at: HIT2, dur: 0.4, do: 'punch', amount: 0.12, to: { x: bx + 10, y: 62 } }, { at: HIT2, dur: 0.3, do: 'shake', amount: 1.3 })
// 青蛙從她身上彈起來，轉身跳出畫面右邊
moves.push(
  { at: HIT2 + 0.12, actor: 'thing', do: 'flip' },
  { at: HIT2 + 0.12, actor: 'thing', do: 'moveTo', to: { x: 128, y: TY }, arc: 12, dur: 0.3, ease: 'out' },
  { at: HIT2 + 0.45, actor: 'thing', do: 'moveTo', to: { x: 200, y: TY }, arc: 10, dur: 0.3, ease: 'in' },
  { at: HIT2 + 0.8, actor: 'thing', do: 'vanish', dur: 0.01 },
  { at: HIT2 + 0.85, actor: 'thing', do: 'flip' },
)
fx.push({ at: HIT2 + 0.2, kind: 'dizzy', actor: 'bunny', dur: 0.5 })

// ── 第 3 次前停一拍：她爬起來、托著下巴想（要畫什麼呢？）——小孩看得到她要畫大的了 ──
go(HIT2 + 0.6, 0.12, { pose: 'idle', a: 82, g: 0.42 })
go(HIT2 + 0.85, 0.1, { pose: 'ponder', a: 68, g: 0.1 })
fx.push({ at: HIT2 + 0.9, kind: 'pop', actor: 'bunny', emoji: '❓', dx: 3, dur: 0.45, scale: 1.3 })

// ── 第 3 次：大大的圓、兩個耳朵、額頭三條紋……老虎！ ──
const TIGER = { x: 102, y: 46 }
const START3 = HIT2 + 1.0
const tigerLines = [
  arc(TIGER, 12.5, 12.5, -90, 270, 10),
  [{ x: 92.5, y: 39 }, { x: 90.5, y: 31 }, { x: 97.5, y: 34.5 }],
  [{ x: 106.5, y: 34.5 }, { x: 113.5, y: 31 }, { x: 111.5, y: 39 }],
  [{ x: 98, y: 38.5 }, { x: 106, y: 38.5 }],
  [{ x: 97, y: 42 }, { x: 107, y: 42 }],
  [{ x: 98, y: 45.5 }, { x: 106, y: 45.5 }],
]
const H3 = drawTimed(START3, 0.031, tigerLines)
ding(H3, 2, TIGER)
const TX = 110
appear(H3, 'prop:tiger-roar', TX, TY, 1)
// 吼！她嚇得往後跳、抱緊鉛筆發抖
go(H3, 0.22, { pose: 'scared', a: 86, g: 0.45, x: bx - 8, arc: 5, ease: 'out' })
moves.push({ at: H3 + 0.22, actor: 'bunny', do: 'shake', amount: 1.2, dur: 0.3 })
moves.push({ at: H3 + 0.05, actor: 'thing', do: 'shake', amount: 0.8, dur: 0.35 })
fx.push({ at: H3 + 0.05, kind: 'pop', actor: 'bunny', emoji: '❗', dx: 3, dur: 0.45, scale: 1.7 })
// 她把鉛筆倒過來、橡皮擦朝前，衝過去「擦擦擦」從頭擦到腳；老虎看到橡皮擦也嚇到了。擦掉的地方變成聿飛上去
const ERASE = H3 + 0.55
const top = TY - 0.5 * BIG
// 嚇到的老虎 tiger-scared 蹲低：圖上內容從 v 0.326 開始（y ≈ 39），從那裡一排一排往下擦
const rows = [43, 50, 57, 63, 69, 75]
go(ERASE - 0.1, 0.1, { pose: 'push', flip: true, a: 20, g: 0.25 })
moves.push({ at: ERASE, actor: 'thing', do: 'swap', emoji: 'prop:tiger-scared', half: 'bottom', cut: 0.05 })
cues.push({ at: ERASE, sfx: 'slide' }, { at: ERASE + 0.25, sfx: 'slide' })
{
  let t = ERASE
  rows.forEach((y, i) => {
    const pts = i % 2 ? [{ x: 116, y }, { x: 90, y }] : [{ x: 90, y }, { x: 116, y }]
    for (const T of pts) {
      const q = aim(T, 'push')
      go(t, 0.04, { x: q.x, a: q.a, g: q.g, ease: 'linear' })
      t += 0.04
    }
    moves.push({ at: t, actor: 'thing', do: 'swap', emoji: 'prop:tiger-scared', cut: Math.min(0.97, (y + 2 - top) / BIG) })
    fx.push({ at: t, kind: 'burst', x: 103, y, emoji: '💨', n: 3, dur: 0.25, scale: 0.8 })
  })
  moves.push({ at: t + 0.02, actor: 'thing', do: 'vanish', dur: 0.01 })
}
const ERASED = ERASE + rows.length * 0.08 + 0.03
// 擦完了！她倒回鉛筆、擦擦汗，退到左邊讓國字放大
go(ERASED + 0.02, 0.1, { pose: 'idle', flip: false, a: 82, g: 0.42 })
const SIDE = 16
go(ERASED + 0.08, 0.2, { x: SIDE, ease: 'out' })

// ── 國字拼好：回到正中央放大，唸第二聲 ──
const HOME = ERASED + 0.32
const PARK = HOME + 0.82
cues.push({ at: HOME + 0.1, say: '筆' })

// ── 語詞那一刻：她走到畫面中間，把鉛筆高高舉在頭上，鉛筆變得最大——鉛筆 ──
const MID = 80
const WORD = PARK + 0.42
go(PARK + 0.2, 0.22, { x: MID, pose: 'walk' })
go(WORD, 0.25, { pose: 'lift', a: 0, g: 0.5, s: 1.35, ease: 'back' })
moves.push({ at: WORD, actor: 'bunny', do: 'hop', amount: 3, dur: 0.25 }, { at: WORD, actor: 'pen', do: 'hop', amount: 3, dur: 0.25 })
fx.push({ at: WORD + 0.05, kind: 'burst', x: MID, y: 44, emoji: '✨', n: 8, dur: 0.45, scale: 1.3 })
cues.push({ at: WORD, say: '鉛筆' })

// ── 回馬槍（第 4 次）：她畫一扇窗——叮！變成真的窗戶，她伸手打開…… ──
const START4 = WORD + 0.55
go(START4 - 0.15, 0.15, { pose: 'reach', a: 30, g: 0.3, s: 1, x: 50 })
const WIN = { x: 106, y: 44 }
const winLines = [
  [{ x: 89, y: 28 }, { x: 123, y: 28 }, { x: 123, y: 60 }, { x: 89, y: 60 }, { x: 89, y: 28 }],
  [{ x: 106, y: 28 }, { x: 106, y: 60 }],
  [{ x: 89, y: 44 }, { x: 123, y: 44 }],
]
const H4 = drawTimed(START4, 0.045, winLines)
ding(H4, 0, WIN)
const WIN_SIZE = 40
const WIN_Y = WIN.y - (0.5575 - 0.5) * WIN_SIZE
moves.push({ at: H4, actor: 'win', do: 'pop', dur: 0.22 })
// 她伸手把窗戶打開
const OPEN = H4 + 0.27
moves.push({ at: OPEN, actor: 'win', do: 'swap', emoji: 'prop:window-open' })
cues.push({ at: OPEN, sfx: 'tap' })
// 吼！剛剛擦掉的老虎從窗戶裡撲出來，越撲越大，比剛才還大
const OUT = OPEN + 0.2
const LAND = OUT + 0.25
const BIGGER = 1.2
appear(OUT, 'prop:tiger-roar', WIN.x, thingY(WIN.y + 2, 0.3), 0.3, { half: 'whole' })
moves.push(
  { at: OUT + 0.02, actor: 'thing', do: 'scaleTo', amount: BIGGER / 0.3, dur: 0.25, ease: 'out' },
  { at: OUT + 0.02, actor: 'thing', do: 'moveTo', to: { x: 98, y: TY }, arc: 6, dur: 0.23, ease: 'in' },
  { at: LAND + 0.05, actor: 'thing', do: 'shake', amount: 1, dur: 0.4 },
)
fx.push(
  { at: OUT, kind: 'burst', x: WIN.x, y: WIN.y, emoji: '✨', n: 10, dur: 0.4, scale: 1.8 },
  { at: LAND, kind: 'blow', actor: 'thing', target: 'bunny', dx: -14, dy: 8, n: 5, scale: 1.4 },
)
camera.push({ at: LAND, dur: 0.45, do: 'punch', amount: 0.2, to: { x: 70, y: 55 } }, { at: LAND, dur: 0.45, do: 'shake', amount: 2.4 })
lights.push({ at: LAND, dur: 0.04, level: -0.25 }, { at: LAND + 0.04, dur: 0.3, level: 0 })
cues.push({ at: OUT, sfx: 'whoosh' }, { at: LAND, sfx: 'rumble' }, { at: LAND + 0.05, sfx: 'boing' }, { at: LAND + 0.1, sfx: 'bonk' })
// 一吼把她吹倒、滑到左邊
go(LAND + 0.03, 0.3, { pose: 'flat', a: 4, g: 0.3, x: 30, ease: 'out' })
// 她跳起來，倒過鉛筆用橡皮擦一揮：老虎和窗戶一起擦掉
const SWIPE = LAND + 0.45
go(SWIPE - 0.15, 0.12, { pose: 'push', flip: true, a: 55, g: 0.2, x: 46, ease: 'out' })
go(SWIPE, 0.22, { a: -15, g: 0.15, ease: 'in' })
moves.push(
  { at: SWIPE + 0.12, actor: 'thing', do: 'vanish', dur: 0.08 },
  { at: SWIPE + 0.16, actor: 'win', do: 'vanish', dur: 0.08 },
)
fx.push(
  { at: SWIPE, kind: 'swoosh', actor: 'pen', target: 'thing', dx: 0, dy: 10, n: 26, sweep: 90, color: '#F28B8B', width: 3.2, dur: 0.3 },
  { at: SWIPE + 0.12, kind: 'burst', x: 98, y: 50, emoji: 'prop:smoke', n: 1, dur: 0.35, scale: 4 },
)
cues.push({ at: SWIPE, sfx: 'whoosh' }, { at: SWIPE + 0.12, sfx: 'poof' })

// ── 問他：鉛筆收到背後，她走到左前方、變大，轉向觀眾 ──
const ASK = SWIPE + 0.37
go(ASK - 0.12, 0.1, { pose: 'idle', flip: false, a: 82, g: 0.42, x: 32 })
moves.push(
  { at: ASK - 0.02, actor: 'pen', do: 'moveTo', to: penAt(hand(32, 'idle'), { a: 82, g: 0.8, flip: false, s: 1 }), dur: 0.1 },
  { at: ASK + 0.08, actor: 'pen', do: 'vanish', dur: 0.01 },
)
cues.push({ at: ASK + 0.1, sfx: 'tap' })
moves.push({ at: ASK + 0.2, actor: 'bunny', do: 'scaleTo', amount: 1.2, dur: 0.3, ease: 'out' })
const LISTEN = ASK + 1.15
const ANSWER = ASK + 2.65
moves.push(
  { at: LISTEN, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
  { at: LISTEN, actor: 'bunny', do: 'rotateTo', amount: 10, dur: 0.3 },
  { at: LISTEN + 0.55, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
  { at: LISTEN + 1.05, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
  // 回答：跳起來指著字
  { at: ANSWER, actor: 'bunny', do: 'rotateTo', amount: -10, dur: 0.12 },
  { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
  { at: ANSWER, actor: 'bunny', do: 'hop', amount: 8, dur: 0.2 },
  // 退場：她咻地衝出左邊，畫面只留下字
  { at: ANSWER + 0.2, actor: 'bunny', do: 'flip' },
  { at: ANSWER + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
  { at: ANSWER + 0.2, actor: 'bunny', do: 'moveTo', to: { x: -45, y: P }, dur: 0.15, ease: 'in' },
)
fx.push({ at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 })
cues.push({ at: ASK + 0.15, say: FIXED_LINES.clipAsk }, { at: ANSWER, say: '筆' }, { at: ANSWER + 0.05, sfx: 'cheer' })

const pen0 = penAt(hand(START_X, 'walk'), START_PEN)

const clip: Clip = {
  format: 2,
  char: '筆',
  meta: { theme: '神奇的鉛筆，畫什麼就變出什麼', cast: '兔子女孩＋大鉛筆＋蘋果／青蛙／老虎／窗戶', gags: ['兔子女孩抱著神奇大鉛筆在空中唰唰唰畫，黑色線稿一筆一筆長出來，「叮！」就變成真的，一次比一次大、一次比一次不受控制（蘋果飛進嘴裡→青蛙撲到她臉上把她撲倒→畫了大圓加兩個耳朵，變成大吼的老虎，她嚇得倒過鉛筆用橡皮擦把老虎擦掉）；回馬槍是她畫一扇窗，打開窗，剛剛擦掉的老虎從窗裡撲出來、比剛才還大，一吼把她吹倒'] },
  duration: 15,
  bg: { top: '#E3F2FF', bottom: '#FFF9EC', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    // 看不見的錨：線稿的每一段都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'ink', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    { id: 'win', emoji: 'prop:window', x: WIN.x, y: WIN_Y, size: WIN_SIZE, float: true, hidden: true },
    { id: 'bunny', emoji: 'hero:bunny/walk', x: START_X, y: P, size: S, flip: true },
    // 畫出來的東西：蘋果、青蛙、老虎輪流用同一個角色（底子是最大的老虎）
    { id: 'thing', emoji: 'prop:tiger-roar', x: TX, y: TY, size: BIG, hidden: true },
    { id: 'pen', emoji: 'prop:pencil', x: pen0.x, y: pen0.y, size: PS, float: true },
  ],
  moves: [
    { at: 0, actor: 'pen', do: 'rotateTo', amount: -START_PEN.a, dur: 0.01 },
    ...moves,
  ],
  builds: [
    // 每變出一樣東西，就有一組筆畫從它身上飛進字框：竹字頭的左半（蘋果）、右半（青蛙）、聿（被擦掉的老虎）
    { at: BITE1, dur: 0.5, strokes: [0, 1, 2], from: 'thing', color: partColor('竹') },
    { at: HIT2 + 0.05, dur: 0.5, strokes: [3, 4, 5], from: 'thing', color: partColor('竹') },
    { at: ERASE + 0.1, dur: 0.55, strokes: [6, 7, 8, 9, 10, 11], from: 'thing', color: partColor('聿') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的兔子女孩
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['bunny'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx,
  camera: [
    // 字拼好之前鏡頭固定在全景：要同時看得到她、鉛筆和整張畫
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...camera.filter((c) => c.at < HOME),
    { at: HOME - 0.3, dur: 0.3, do: 'zoom', amount: 1 },
    ...camera.filter((c) => c.at >= HOME),
  ],
  lights: [
    ...lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ].sort((p, q) => p.at - q.at),
  cues: cues.sort((p, q) => p.at - q.at),
}

export default clip
