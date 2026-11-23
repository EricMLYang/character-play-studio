import { scene } from '../scene'
import { castScale, type Actor, type Clip, type Fx, type Move } from '../../anim/clip'
import type { Scenes } from './index'

// 消防車來了：草地上一棵大樹，樹頂冒煙，一顆小火苗冒出來左看右看、長大分成三顆、壞壞地跳舞，樹上的鳥嚇得飛走。
// 消防車鳴笛衝進來、急煞車鼻子差一點撞到樹，倒車停好，消防員（斑點狗）從車門跳出來擺英雄姿勢。
// 用什麼打火：木——他很有自信地把一根木頭丟進火裡，火眼睛發亮一口吞掉、脹成兩倍、打一個嗝噴出火星，燒到他的帽子，
// 他頂著火繞著車跳；茶——他把一小杯茶頂在頭上、扛梯子爬到火旁邊，倒下去只「滋」一滴，火捧腹大笑還吐舌頭，他滑下梯子；
// 水——水管從車上拉出來鼓一包傳過去，一道大水柱把兩邊的火澆熄，中間那顆變成小火苗跳下樹逃跑，被最後一噴澆成一縷煙，樹滴水、冒彩虹。
// 他噴上癮了：對天空試噴兩下、越噴越開心，左看右看找火。噴什麼（三個都要選、順序他決定）：
// 小龍噴一口火給他看，被水柱正中嘴巴，再噴只噗出一小朵煙、再噴只滴出一滴水，哭著跑掉；
// 爸爸在烤肉（上一本被肉叫醒的那個爸爸），哼歌翻肉，烤肉的火連肉帶爸爸一起被沖，爸爸冷得發抖、舉著濕肉瞪他、走掉；
// 太陽又紅又熱：地上噴一次、爬上車頂噴一次、車頂架梯子踮腳噴一次，水柱一次比一次高，最後在太陽前面停一拍、整坨淋回他頭上，太陽戴上墨鏡得意。
// 最後小龍、爸爸濕答答地回來，拿水桶一起往他頭上倒，他轉圈暈倒，爬上車頂，消防車搖搖晃晃滴著水開回家，留下一道彩虹。
//
// 主角 firefighter（消防員，size 24 站在地上 y = 66.9，引擎放大成 28.5）；小龍 dino 一樣 size 24；爸爸 eric size 36（大一號，34 以上不放大）。
// 姿勢圖都朝左；消防員看右邊的樹要 flip。共用的站位：樹 x 132（火在樹頂），消防車 x 36（車頭朝右、flip），車頂有一顆警示燈。
// W1（等他選「用＿打火」）：消防員 x 80 idle 面向樹，三顆火 f1／f2／f3 在樹頂（中間 f2 有一張壞壞的臉 😈）。
// W2（水的結尾、more 的開頭）：火沒了，消防員 x 80 拿著水管（hose），水管從車上接到他手上。
// W3（等他選「他噴＿」）：消防員 x 64 拿著水管面向右邊，右半邊（x 90～130）留空給要被噴的東西。
type Cue = Clip['cues'][number]
const BG = { top: '#8FCBF5', bottom: '#DDF1FC', floor: '#9CD27A', scenery: 'hills' as const }
const S = 24
const G = 77 - 0.42 * S
/** 引擎把 size 24 放大成這個倍率 */
const K = castScale(S)
/** 畫出來的消防員身高（腳底在 77） */
const H = 0.91 * S * K

/** 照引擎 castUp 的算法：劇本寫 y0，畫出來腳底在哪裡（離地 25 以上漸漸改成以中心放大） */
function castFeet(y0: number, size: number) {
  const k = castScale(size)
  const h = 77 - (y0 + 0.42 * size)
  const fall = 1 - Math.min(1, Math.max(0, (h - 25) / 20))
  const feet = 77 - h * (1 + (k - 1) * fall)
  const y = y0 + (feet - 0.42 * size * k - y0) * fall
  return y + 0.42 * size * k
}
/** 不在地上的角色要站在 F 這個高度（腳底）時 y 要寫多少 */
function on(F: number, size = S) {
  let lo = -80, hi = 77
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (castFeet(mid, size) < F) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

const r2 = (n: number) => +n.toFixed(2)

/** 樹：右邊一棵大樹，樹頂約 y 26 */
const TREE_X = 128
const tree: Actor = { id: 'tree', emoji: 'prop:tree', x: TREE_X, y: 77 - 0.42 * 56, size: 56 }
/** 三顆火：中間大的 f2 在樹頂，f1／f3 在兩邊樹肩上；f2 臉在火的下半 */
const F1 = { x: 114, y: 38 }
const F2 = { x: 128, y: 30 }
const F3 = { x: 142, y: 38 }
const FACE = { x: F2.x, y: F2.y + 1.5 }
const flames: Actor[] = [
  { id: 'f1', emoji: '🔥', ...F1, size: 11, float: true },
  { id: 'f3', emoji: '🔥', ...F3, size: 11, float: true },
  { id: 'f2', emoji: '🔥', ...F2, size: 15, float: true },
  { id: 'face', emoji: '😈', ...FACE, size: 6, float: true },
]

/** 消防車（車頭朝右）與車頂的警示燈 */
const TRUCK_X = 36
const TRUCK_S = 44
const TY = 77 - 0.42 * TRUCK_S
const truck: Actor = { id: 'truck', emoji: '🚒', x: TRUCK_X, y: TY, size: TRUCK_S, flip: true }
/** 警示燈在車頭（右邊）的車頂上 */
const SIREN_D = { x: 12, y: -14 }
const siren: Actor = { id: 'siren', emoji: '🚨', x: TRUCK_X + SIREN_D.x, y: TY + SIREN_D.y, size: 9, float: true }
/** 警示燈的紅光：一顆糊掉的紅圓，閃的時候一亮一暗 */
const GLOW_ON = 'blur(1.5px) opacity(.7)'
const GLOW_OFF = 'blur(2px) opacity(0)'
const glow: Actor = { id: 'glow', emoji: '🔴', x: TRUCK_X + SIREN_D.x, y: TY + SIREN_D.y, size: 12, float: true, tint: GLOW_OFF }
/** 消防車在 W 時的樣子（車、紅光、警示燈） */
const parked = [truck, glow, siren]
/** 車頂的高度（消防員站上去的腳底） */
const ROOF = 46

/** 消防員 */
const W1_X = 80
const W3_X = 64
const dogAt = (pose: string, x: number, flip = true): Actor => ({ id: 'dog', emoji: `hero:firefighter/${pose}`, x, y: G, size: S, flip })
/** 消防員拿水管（hose 圖朝右時）噴口在身體中心的哪裡（actorsAt 的 y 是放大後的） */
const NOZ = { dx: 12, dy: -7 }
const DOG_Y = 77 - 0.42 * S * K
const nozzle = (x: number, y = DOG_Y) => ({ x: x + NOZ.dx, y: y + NOZ.dy })

/** 水管：從車子側邊接到他背後（手上那一截在圖裡）。整段一直在 */
const hose = (at: number, dur: number, to: { x: number; y: number }): Fx =>
  ({ at, dur, kind: 'tube', actor: 'truck', dx: 14, dy: 8, to, color: '#D8452F', width: 1.8, n: 99 })
const hoseTo = (x: number) => ({ x: x - 7, y: 70 })

/** 水柱：從噴口拉一道粗粗的水線到 to，沿路一串 💦，打到的地方一直濺水花 */
function jet(at: number, dur: number, to: { x: number; y: number } | string, from = nozzle(W1_X), power = 1): Fx[] {
  const end = typeof to === 'string' ? undefined : to
  const fx: Fx[] = [
    { at, dur, kind: 'line', actor: 'dog', dx: NOZ.dx, dy: NOZ.dy, ...(end ? { to: end } : { target: to as string }), color: '#8FD6FF', width: 3.4 * power },
  ]
  if (end) {
    for (let t = at; t < at + dur - 0.1; t += 0.3) {
      fx.push({ at: r2(t), kind: 'blow', x: from.x, y: from.y, to: end, emoji: '💦', n: 3, scale: power, dur: 0.4 })
      fx.push({ at: r2(t + 0.1), kind: 'burst', x: end.x, y: end.y, emoji: '💦', n: 5, scale: 0.8 * power, dur: 0.35 })
    }
  }
  return fx
}

/** 跳舞：三顆火輪流跳、左右擺（臉跟著 f2） */
function dance(from: number, to: number, size = 1): Move[] {
  const out: Move[] = []
  let i = 0
  for (let t = from; t < to - 0.3; t += 0.4, i++) {
    const s = i % 2 ? -1 : 1
    out.push({ at: r2(t), actor: 'f2', do: 'hop', amount: 1.6 * size, dur: 0.35 })
    out.push({ at: r2(t), actor: 'face', do: 'hop', amount: 1.6 * size, dur: 0.35 })
    out.push({ at: r2(t), actor: 'f2', do: 'tilt', amount: 8 * s, dur: 0.38 })
    out.push({ at: r2(t + 0.13), actor: 'f1', do: 'hop', amount: 1.4 * size, dur: 0.3 })
    out.push({ at: r2(t + 0.13), actor: 'f1', do: 'tilt', amount: -10 * s, dur: 0.35 })
    out.push({ at: r2(t + 0.26), actor: 'f3', do: 'hop', amount: 1.4 * size, dur: 0.3 })
    out.push({ at: r2(t + 0.26), actor: 'f3', do: 'tilt', amount: 10 * s, dur: 0.35 })
  }
  return out
}
/** 樹頂一直冒一點煙 */
const smoke = (from: number, to: number): Fx[] => {
  const out: Fx[] = []
  for (let t = from; t < to - 0.4; t += 1.5) out.push({ at: r2(t), kind: 'zzz', x: F2.x - 4, y: F2.y - 4, emoji: '💨', scale: 0.9, dur: Math.min(1.5, to - t) })
  return out
}

/** 消防車開到 x（警示燈跟著） */
function drive(at: number, x: number, dur: number, ease: Move['ease'] = 'inOut'): Move[] {
  return [
    { at, actor: 'truck', do: 'moveTo', to: { x, y: TY }, dur, ease },
    { at, actor: 'siren', do: 'moveTo', to: { x: x + SIREN_D.x, y: TY + SIREN_D.y }, dur, ease },
    { at, actor: 'glow', do: 'moveTo', to: { x: x + SIREN_D.x, y: TY + SIREN_D.y }, dur, ease },
  ]
}
/** 警示燈一閃一閃 */
const blink = (from: number, to: number): Move[] => {
  const out: Move[] = []
  for (let t = from; t < to - 0.1; t += 0.3) out.push(
    { at: r2(t), actor: 'glow', do: 'tint', filter: GLOW_ON },
    { at: r2(t + 0.15), actor: 'glow', do: 'tint', filter: GLOW_OFF },
    { at: r2(t), actor: 'siren', do: 'hop', amount: 0.8, dur: 0.15 },
  )
  return out
}

/**
 * 鏡頭：每一段開頭、結尾都是全景（等他選的畫面看得到車、他、樹頂的火），中間交給自動取景。
 * 第一格要是全景，定全景的鏡頭得在 0 秒以前就開始。
 */
const holdWide = (at: number, dur = 0.5) => ({ at, dur, do: 'zoom' as const, amount: 1.02, to: { x: 80, y: 45 } })
const release = (at: number, dur = 0.6) => ({ at, dur, do: 'zoom' as const, amount: 1 })
const START = holdWide(-0.3, 0.01)

/** 一串水滴沿著弧線飛：從 from 飛到最高點 top 再掉到 land（ids 是場上那幾顆 💧） */
function arcDrops(ids: string[], at: number, from: { x: number; y: number }, top: { x: number; y: number }, land: { x: number; y: number }, up = 0.35, down = 0.35, gap = 0.06): Move[] {
  return ids.flatMap((id, i): Move[] => {
    const t = r2(at + i * gap)
    return [
      { at: r2(t - 0.02), actor: id, do: 'moveTo', to: from, dur: 0.01 },
      { at: t, actor: id, do: 'pop', dur: 0.06 },
      { at: t, actor: id, do: 'moveTo', to: top, dur: up, ease: 'out' },
      { at: r2(t + up), actor: id, do: 'moveTo', to: land, dur: down, ease: 'in' },
      { at: r2(t + up + down), actor: id, do: 'vanish', dur: 0.05 },
    ]
  })
}
const DROPS = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7']
const drops: Actor[] = DROPS.map((id) => ({ id, emoji: '💧', x: 80, y: 60, size: 6, hidden: true, float: true }))

const merge = (...parts: { moves?: Move[]; fx?: Fx[]; cues?: Cue[] }[]) => ({
  moves: parts.flatMap((p) => p.moves ?? []),
  fx: parts.flatMap((p) => p.fx ?? []),
  cues: parts.flatMap((p) => p.cues ?? []),
})

/** 爸爸（大一號） */
const DAD_S = 36
const DG = 77 - 0.42 * DAD_S
const DAD_X = 125

/**
 * 火的臉跟著 f2：float 的角色放大是從腳底往上長，f2 放大 k 倍時臉要跟著放大、往上移，才會一直貼在火的下半。
 * F2_FEET 是 f2 的腳底（畫出來的大小算），faceAt(k) 是臉要寫的位置。
 */
const F2_SZ = 15 * castScale(15)
const F2_FEET = F2.y + 0.42 * F2_SZ
const FACE_SZ = 6 * castScale(6)
const FACE_UP = F2_FEET - FACE.y
const faceAt = (k: number, x: number = F2.x, feet = F2_FEET) => ({ x, y: r2(feet - FACE_UP * k - 0.42 * FACE_SZ * (1 - k)) })
/** f2 的腳底要在 feet 時 y 寫多少（跟放大倍率無關） */
const f2At = (x: number, feet: number) => ({ x, y: r2(feet - 0.42 * F2_SZ) })
/** f2 與臉一起做同一個動作 */
const both = (m: Omit<Move, 'actor'>): Move[] => [{ ...m, actor: 'f2' } as Move, { ...m, actor: 'face' } as Move]

/** 消防員頭頂（帽子上面）的高度 */
const HAT = 77 - H
/** 水管從車子拉到他手上，他移動時一段一段跟過去 */
function hoseMove(at: number, dur: number, from: { x: number; y: number }, to: { x: number; y: number }, step = 0.08): Fx[] {
  const out: Fx[] = []
  const n = Math.max(1, Math.round(dur / step))
  for (let i = 0; i < n; i++) {
    const k = (i + 0.5) / n
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
    out.push(hose(r2(at + i * (dur / n)), r2(dur / n + 0.01), { x: r2(from.x + (to.x - from.x) * e), y: r2(from.y + (to.y - from.y) * e) }))
  }
  return out
}
/** 水管鼓一包，從車子傳到他手上 */
function bulge(at: number, to: { x: number; y: number }, dur = 0.5): Fx[] {
  const out: Fx[] = []
  const a = { x: TRUCK_X + 14, y: TY + 8 }
  const n = 7
  for (let i = 0; i < n; i++) {
    const k0 = i / n, k1 = (i + 1.2) / n
    out.push({ at: r2(at + i * (dur / n)), dur: r2(dur / n + 0.02), kind: 'tube', actor: 'truck', dx: r2(14 + (to.x - a.x) * k0), dy: r2(8 + (to.y - a.y) * k0),
      to: { x: r2(a.x + (to.x - a.x) * k1), y: r2(a.y + (to.y - a.y) * k1) }, color: '#D8452F', width: 3.8, n: 99 })
  }
  return out
}

const scenes: Scenes = {
  // 不好了！樹上有火！——鳥在樹上唱歌，樹頂冒煙；一顆小火苗冒出來左看右看，長大、分成三顆，中間那顆露出壞壞的臉，鳥嚇得飛走，火開始跳舞
  burn: scene({
    duration: 5.6,
    bg: BG,
    actors: [
      tree,
      { ...flames[0], ...F2, hidden: true },
      { ...flames[1], ...F2, hidden: true },
      { ...flames[2], hidden: true },
      { ...flames[3], ...faceAt(0.5), hidden: true },
      { id: 'bird', emoji: '🐦', x: 108, y: 44, size: 10, float: true },
    ],
    moves: [
      { at: 0.3, actor: 'bird', do: 'hop', amount: 2, dur: 0.25 },
      { at: 0.65, actor: 'bird', do: 'hop', amount: 2, dur: 0.25 },
      // 小火苗冒出來，左看右看
      { at: 0.9, actor: 'f2', do: 'pop', dur: 0.3 },
      { at: 0.91, actor: 'f2', do: 'scaleTo', amount: 0.5, dur: 0.01 },
      { at: 1.05, actor: 'face', do: 'pop', dur: 0.2 },
      { at: 1.06, actor: 'face', do: 'scaleTo', amount: 0.5, dur: 0.01 },
      ...both({ at: 1.3, do: 'tilt', amount: -18, dur: 0.35 }),
      ...both({ at: 1.7, do: 'tilt', amount: 18, dur: 0.35 }),
      { at: 1.55, actor: 'bird', do: 'hop', amount: 3, dur: 0.25 },
      // 蓄力、長大、分成三顆
      { at: 2.0, actor: 'f2', do: 'squash', amount: -0.3, dur: 0.25 },
      { at: 2.2, actor: 'f2', do: 'scaleTo', amount: 2, dur: 0.35, ease: 'back' },
      { at: 2.2, actor: 'face', do: 'scaleTo', amount: 2, dur: 0.35, ease: 'back' },
      { at: 2.2, actor: 'face', do: 'moveTo', to: FACE, dur: 0.35, ease: 'back' },
      { at: 2.45, actor: 'f1', do: 'pop', dur: 0.2 },
      { at: 2.45, actor: 'f3', do: 'pop', dur: 0.2 },
      { at: 2.45, actor: 'f1', do: 'moveTo', to: F1, arc: 5, dur: 0.35 },
      { at: 2.45, actor: 'f3', do: 'moveTo', to: F3, arc: 5, dur: 0.35 },
      // 鳥嚇得飛走
      { at: 2.3, actor: 'bird', do: 'hop', amount: 4, dur: 0.25 },
      { at: 2.6, actor: 'bird', do: 'moveTo', to: { x: -14, y: 6 }, arc: 6, dur: 0.9, ease: 'in' },
      { at: 3.5, actor: 'bird', do: 'vanish', dur: 0.05 },
      ...dance(3.0, 5.6),
    ],
    fx: [
      { at: 0.2, kind: 'zzz', actor: 'bird', emoji: '🎵', dur: 1.2 },
      ...smoke(0.2, 5.6),
      { at: 1.6, kind: 'pop', actor: 'bird', emoji: '❓', dur: 0.6 },
      { at: 2.25, kind: 'burst', x: F2.x, y: F2.y, emoji: '✨', n: 6, dur: 0.5 },
      { at: 2.3, kind: 'pop', actor: 'bird', emoji: '❗', dur: 0.4 },
      { at: 2.65, kind: 'sweat', actor: 'bird' },
    ],
    // 一翻開先看到整棵樹，推近樹頂看火冒出來；最後退回全景（消防車要從左邊衝進來）
    camera: [START, { at: 0.5, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 160, y: 34 } }, holdWide(4.5, 0.8)],
    cues: [
      { at: 0.9, sfx: 'poof' },
      { at: 1.25, say: '不好了！樹上有火！' },
      { at: 2.2, sfx: 'boing' },
      { at: 2.6, sfx: 'whoosh' },
    ],
  }),

  // 消防車來了！——警示燈閃，消防車從左邊衝進來，急煞車，車頭往前栽、輪胎冒煙，差一點撞到樹（樹一晃、火都跳起來）；
  // 車子冒汗倒車停好，車門一開消防員跳出來落地、擺英雄姿勢。結尾 W1：他看著樹頂的火想辦法
  truck: scene({
    duration: 5.8,
    bg: BG,
    actors: [
      tree,
      ...flames,
      { ...truck, x: -40, hidden: true },
      { ...glow, x: -40 + SIREN_D.x, hidden: true },
      { ...siren, x: -40 + SIREN_D.x, hidden: true },
      { ...dogAt('happy', TRUCK_X + 12), y: on(56), hidden: true },
    ],
    moves: [
      ...dance(0, 1.0),
      { at: 0.2, actor: 'truck', do: 'pop', dur: 0.01 },
      { at: 0.2, actor: 'siren', do: 'pop', dur: 0.01 },
      { at: 0.2, actor: 'glow', do: 'pop', dur: 0.01 },
      ...drive(0.25, 86, 0.65, 'linear'),
      // 急煞車：滑一段、車頭往前栽
      ...drive(0.9, 96, 0.35, 'out'),
      { at: 0.9, actor: 'truck', do: 'tilt', amount: 9, dur: 0.5 },
      { at: 0.9, actor: 'siren', do: 'tilt', amount: 9, dur: 0.5 },
      { at: 0.9, actor: 'glow', do: 'tilt', amount: 9, dur: 0.5 },
      { at: 1.2, actor: 'tree', do: 'shake', amount: 1, dur: 0.3 },
      { at: 1.2, actor: 'f1', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.2, actor: 'f2', do: 'hop', amount: 6, dur: 0.35 },
      { at: 1.2, actor: 'face', do: 'hop', amount: 6, dur: 0.35 },
      { at: 1.2, actor: 'f3', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.2, actor: 'face', do: 'swap', emoji: '😳' },
      // 倒車停好
      ...drive(1.75, TRUCK_X, 0.7),
      ...blink(0.2, 2.6),
      { at: 2.3, actor: 'face', do: 'swap', emoji: '😈' },
      ...dance(2.4, 5.8),
      // 車門彈開，跳出來
      { at: 2.6, actor: 'dog', do: 'pop', dur: 0.15 },
      { at: 2.7, actor: 'dog', do: 'moveTo', to: { x: W1_X, y: G }, arc: 12, dur: 0.55 },
      { at: 3.3, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.9, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/idle' },
      { at: 4.5, actor: 'dog', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 5.2, actor: 'dog', do: 'tilt', amount: -8, dur: 0.5 },
    ],
    fx: [
      ...smoke(0, 5.8),
      { at: 0.95, kind: 'puff', actor: 'truck', scale: 1.4, dur: 0.5 },
      { at: 1.0, kind: 'blow', x: 82, y: 70, to: { x: 62, y: 66 }, n: 4, dur: 0.5 },
      { at: 1.25, kind: 'burst', x: 112, y: 52, n: 1, scale: 0.7, dur: 0.3 },
      { at: 1.4, kind: 'sweat', actor: 'truck', dx: 6, dy: 6 },
      { at: 2.6, kind: 'puff', x: TRUCK_X + 12, y: 60, dur: 0.4 },
      { at: 3.25, kind: 'burst', actor: 'dog', emoji: '✨', n: 7, dur: 0.7 },
      { at: 4.0, kind: 'bubble', actor: 'dog', emoji: '❓', dur: 1.0 },
    ],
    camera: [START, { at: 1.2, dur: 0.3, do: 'shake', amount: 1.4 }, { at: 3.25, dur: 0.5, do: 'punch', amount: 0.2, to: { x: W1_X, y: 55 } }, holdWide(4.6, 0.6)],
    cues: [
      { at: 0.2, sfx: 'whoosh' },
      { at: 0.5, say: '消防車來了！' },
      { at: 0.95, sfx: 'slide' },
      { at: 1.2, sfx: 'bonk' },
      { at: 1.85, sfx: 'blip' },
      { at: 2.15, sfx: 'blip' },
      { at: 2.6, sfx: 'boing' },
      { at: 3.25, sfx: 'cheer' },
    ],
  }),

  // 不能給火吃木！火大了！——一根木頭從車上彈到他懷裡，他很有自信地丟進火裡；火愣一下、眼睛發亮、一口吞掉，脹成兩倍大，
  // 打一個大嗝噴出一圈火星，一顆落在他帽子上；他頂著火繞著車跳，甩頭把火甩熄。火消回原來大小。回到 W1
  'put:木': scene({
    duration: 6.8,
    bg: BG,
    ...(() => {
      const HOLD = { x: W1_X + 6, y: 64 }
      const EMBER_Y = HAT - 2.5
      return {
        actors: [
          tree, ...flames, ...parked,
          { id: 'log', emoji: '🪵', x: TRUCK_X + 16, y: 60, size: 12, hidden: true, float: true, pivot: 'center' as const },
          dogAt('idle', W1_X),
          { id: 'ember', emoji: '🔥', ...F2, size: 7, hidden: true, float: true },
        ],
        moves: [
          ...dance(0, 1.6),
          // 木頭從車上彈出來，落到他懷裡
          { at: 0.1, actor: 'log', do: 'pop', dur: 0.15 },
          { at: 0.15, actor: 'log', do: 'moveTo', to: HOLD, arc: 10, dur: 0.45 },
          { at: 0.15, actor: 'log', do: 'spin', times: 1, dur: 0.45 },
          { at: 0.6, actor: 'dog', do: 'squash', amount: 0.15, dur: 0.25 },
          { at: 0.6, actor: 'log', do: 'hop', amount: -1, dur: 0.25 },
          // 很有自信：抬頭挺胸，蓄力，丟！
          { at: 0.85, actor: 'dog', do: 'squash', amount: -0.15, dur: 0.25 },
          { at: 1.05, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/happy' },
          { at: 1.05, actor: 'dog', do: 'hop', amount: 4, dur: 0.35 },
          { at: 1.05, actor: 'log', do: 'moveTo', to: { x: F2.x, y: F2.y - 8 }, arc: 16, dur: 0.6, ease: 'out' },
          { at: 1.05, actor: 'log', do: 'spin', times: 2, dur: 0.6 },
          // 落在火上：火愣住、眼睛發亮
          { at: 1.65, actor: 'log', do: 'hop', amount: 1.5, dur: 0.2 },
          { at: 1.75, actor: 'face', do: 'swap', emoji: '🤩' },
          ...both({ at: 1.75, do: 'squash', amount: -0.12, dur: 0.35 }),
          { at: 1.9, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/idle' },
          // 一口吞掉
          { at: 2.15, actor: 'log', do: 'moveTo', to: { x: F2.x, y: F2.y + 2 }, dur: 0.15, ease: 'in' },
          { at: 2.15, actor: 'log', do: 'scaleTo', amount: 0.3, dur: 0.15 },
          { at: 2.3, actor: 'log', do: 'vanish', dur: 0.05 },
          ...both({ at: 2.3, do: 'squash', amount: 0.3, dur: 0.3 }),
          { at: 2.3, actor: 'face', do: 'swap', emoji: '😋' },
          // 脹成兩倍大
          { at: 2.7, actor: 'f2', do: 'scaleTo', amount: 2, dur: 0.45, ease: 'back' },
          { at: 2.7, actor: 'face', do: 'scaleTo', amount: 2, dur: 0.45, ease: 'back' },
          { at: 2.7, actor: 'face', do: 'moveTo', to: faceAt(2), dur: 0.45, ease: 'back' },
          { at: 2.75, actor: 'f1', do: 'scaleTo', amount: 1.5, dur: 0.4, ease: 'back' },
          { at: 2.8, actor: 'f3', do: 'scaleTo', amount: 1.5, dur: 0.4, ease: 'back' },
          { at: 2.75, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
          { at: 2.75, actor: 'dog', do: 'hop', amount: 4, dur: 0.3 },
          { at: 2.75, actor: 'tree', do: 'shake', amount: 0.6, dur: 0.4 },
          // 打嗝：吸一口氣、嗝！噴出一圈火星，一顆飛到他帽子上
          ...both({ at: 3.3, do: 'squash', amount: -0.15, dur: 0.3 }),
          ...both({ at: 3.6, do: 'squash', amount: 0.3, dur: 0.3 }),
          { at: 3.6, actor: 'ember', do: 'pop', dur: 0.1 },
          { at: 3.62, actor: 'ember', do: 'moveTo', to: { x: W1_X, y: EMBER_Y }, arc: 10, dur: 0.5, ease: 'in' },
          // 嗝完消下去
          { at: 3.85, actor: 'f2', do: 'scaleTo', amount: 0.5, dur: 0.5 },
          { at: 3.85, actor: 'face', do: 'scaleTo', amount: 0.5, dur: 0.5 },
          { at: 3.85, actor: 'face', do: 'moveTo', to: FACE, dur: 0.5 },
          { at: 3.85, actor: 'f1', do: 'scaleTo', amount: 1 / 1.5, dur: 0.5 },
          { at: 3.85, actor: 'f3', do: 'scaleTo', amount: 1 / 1.5, dur: 0.5 },
          { at: 4.2, actor: 'face', do: 'swap', emoji: '😆' },
          ...dance(4.4, 6.8),
          // 帽子著火：跳起來，繞著車跳
          { at: 4.12, actor: 'dog', do: 'hop', amount: 8, dur: 0.4 },
          { at: 4.12, actor: 'ember', do: 'hop', amount: 8, dur: 0.4 },
          { at: 4.55, actor: 'dog', do: 'flip' },
          { at: 4.6, actor: 'dog', do: 'moveTo', to: { x: 14, y: G }, dur: 0.6, ease: 'in' },
          { at: 4.6, actor: 'ember', do: 'moveTo', to: { x: 14, y: EMBER_Y }, dur: 0.6, ease: 'in' },
          ...[4.65, 4.95].flatMap((t): Move[] => [
            { at: t, actor: 'dog', do: 'hop', amount: 4, dur: 0.28 },
            { at: t, actor: 'ember', do: 'hop', amount: 4, dur: 0.28 },
          ]),
          { at: 5.2, actor: 'dog', do: 'flip' },
          { at: 5.25, actor: 'dog', do: 'moveTo', to: { x: W1_X, y: G }, dur: 0.6, ease: 'out' },
          { at: 5.25, actor: 'ember', do: 'moveTo', to: { x: W1_X, y: EMBER_Y }, dur: 0.6, ease: 'out' },
          ...[5.3, 5.6].flatMap((t): Move[] => [
            { at: t, actor: 'dog', do: 'hop', amount: 4, dur: 0.28 },
            { at: t, actor: 'ember', do: 'hop', amount: 4, dur: 0.28 },
          ]),
          // 甩頭甩熄
          { at: 5.9, actor: 'dog', do: 'shake', amount: 2, dur: 0.4 },
          { at: 5.95, actor: 'ember', do: 'vanish', dur: 0.15 },
          { at: 6.3, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/idle' },
          { at: 6.35, actor: 'dog', do: 'squash', amount: 0.15, dur: 0.35 },
          { at: 6.3, actor: 'face', do: 'swap', emoji: '😈' },
        ],
        fx: [
          ...smoke(0, 6.8),
          { at: 1.75, kind: 'burst', actor: 'face', emoji: '✨', n: 6, dur: 0.5 },
          { at: 2.3, kind: 'burst', x: F2.x, y: F2.y - 4, emoji: '💨', n: 4, scale: 0.7, dur: 0.4 },
          { at: 3.6, kind: 'burst', x: F2.x, y: F2.y - 6, emoji: '🔥', n: 9, scale: 1.3, dur: 0.55 },
          { at: 3.0, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.5 },
          { at: 4.15, kind: 'sweat', actor: 'dog' },
          { at: 4.6, kind: 'puff', actor: 'dog', dur: 0.4 },
          { at: 5.25, kind: 'puff', actor: 'dog', dur: 0.4 },
          { at: 5.95, kind: 'burst', x: W1_X, y: EMBER_Y, emoji: '💨', n: 5, dur: 0.5 },
          { at: 6.4, kind: 'sweat', actor: 'dog' },
        ],
        camera: [START, release(0.4), { at: 3.6, dur: 0.3, do: 'shake', amount: 1.2 }, holdWide(4.4, 0.6)],
        cues: [
          { at: 0.1, sfx: 'boing' },
          { at: 1.05, sfx: 'whoosh' },
          { at: 1.6, say: '不能給火吃木！火大了！' },
          { at: 2.3, sfx: 'gulp' },
          { at: 2.7, sfx: 'rumble' },
          { at: 3.6, sfx: 'hic' },
          { at: 4.12, sfx: 'boing' },
          { at: 5.95, sfx: 'poof' },
        ] as Cue[],
      }
    })(),
  }),

  // 茶太少了！火在笑！——他端出一小杯茶，頂在帽子上、扛著梯子走到樹下，一步一步爬上去，把那一小杯倒下去：只滴一滴、冒一絲煙，
  // 火愣一下，接著三顆一起捧腹大笑，中間那顆還吐舌頭；他垮下來、滑下梯子，扛著梯子走回來。回到 W1
  'put:茶': scene({
    duration: 7.4,
    bg: BG,
    ...(() => {
      const LX = 104
      const ladder = { id: 'ladder', emoji: 'prop:ladder', x: LX + 2, y: 77 - 0.42 * 40, size: 40, hidden: true }
      /** 爬梯子：第 k 階的腳底與 x */
      const STEP = [0, 1, 2, 3, 4].map((k) => ({ x: LX - 2 + k * 1.6, y: on(77 - k * 7) }))
      const top = STEP[4]
      const teaOn = (x: number, y: number) => ({ x, y: r2(castFeet(y, S) - H - 2.5) })
      const CUP = { x: F2.x - 4, y: F2.y - 13 }
      const steps: Move[] = []
      STEP.slice(1).forEach((p, i) => {
        const t = r2(1.7 + i * 0.38)
        steps.push({ at: t, actor: 'dog', do: 'moveTo', to: p, dur: 0.24, ease: 'out' })
        steps.push({ at: t, actor: 'tea', do: 'moveTo', to: teaOn(p.x, p.y), dur: 0.24, ease: 'out' })
        steps.push({ at: r2(t + 0.24), actor: 'tea', do: 'tilt', amount: i % 2 ? -12 : 12, dur: 0.14 })
      })
      return {
        actors: [
          tree, ladder, ...flames, ...parked,
          dogAt('idle', W1_X),
          { id: 'tea', emoji: '🍵', x: W1_X + 7, y: 63, size: 7, hidden: true, float: true, pivot: 'center' as const },
          { id: 'drip', emoji: '💧', ...CUP, size: 5, hidden: true, float: true },
        ],
        moves: [
          ...dance(0, 3.4),
          // 端出一小杯茶，得意地亮一下
          { at: 0.1, actor: 'tea', do: 'pop', dur: 0.25 },
          { at: 0.2, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
          { at: 0.5, actor: 'tea', do: 'hop', amount: 2, dur: 0.25 },
          // 頂在帽子上，扛起梯子走到樹下
          { at: 0.8, actor: 'tea', do: 'moveTo', to: teaOn(W1_X, G), arc: 5, dur: 0.3 },
          // 梯子從車上彈出來，靠到樹上
          { at: 0, actor: 'ladder', do: 'moveTo', to: { x: TRUCK_X + 8, y: ladder.y }, dur: 0.01 },
          { at: 0.95, actor: 'ladder', do: 'pop', dur: 0.2 },
          { at: 1.0, actor: 'ladder', do: 'moveTo', to: { x: ladder.x, y: ladder.y }, arc: 14, dur: 0.55 },
          { at: 1.0, actor: 'ladder', do: 'rotateTo', amount: 10, dur: 0.55 },
          { at: 1.05, actor: 'dog', do: 'moveTo', to: { x: LX - 2, y: G }, dur: 0.5 },
          { at: 1.05, actor: 'tea', do: 'moveTo', to: teaOn(LX - 2, G), dur: 0.5 },
          // 一步一步，很小心
          ...steps,
          // 拿下來，伸到火上面，倒！
          { at: 3.3, actor: 'tea', do: 'moveTo', to: CUP, arc: 4, dur: 0.35 },
          { at: 3.7, actor: 'tea', do: 'rotateTo', amount: 110, dur: 0.3 },
          { at: 4.0, actor: 'drip', do: 'pop', dur: 0.05 },
          { at: 4.0, actor: 'drip', do: 'moveTo', to: { x: F2.x - 2, y: F2.y - 4 }, dur: 0.25, ease: 'in' },
          { at: 4.25, actor: 'drip', do: 'vanish', dur: 0.05 },
          ...both({ at: 4.25, do: 'squash', amount: 0.06, dur: 0.2 }),
          // 愣一下……捧腹大笑
          { at: 4.35, actor: 'face', do: 'swap', emoji: '😳' },
          { at: 4.75, actor: 'face', do: 'swap', emoji: '😆' },
          ...[4.75, 4.97, 5.19, 5.41, 5.63].flatMap((t, i): Move[] => [
            ...both({ at: t, do: 'hop', amount: 2.6, dur: 0.2 }),
            { at: r2(t + 0.05), actor: 'f1', do: 'hop', amount: 2, dur: 0.2 },
            { at: r2(t + 0.1), actor: 'f3', do: 'hop', amount: 2, dur: 0.2 },
            ...both({ at: t, do: 'tilt', amount: i % 2 ? -10 : 10, dur: 0.2 }),
          ]),
          // 吐舌頭
          { at: 5.85, actor: 'face', do: 'swap', emoji: '😝' },
          ...both({ at: 5.85, do: 'tilt', amount: -14, dur: 0.5 }),
          ...dance(6.4, 7.4),
          { at: 6.6, actor: 'face', do: 'swap', emoji: '😈' },
          // 他垮下來，滑下梯子
          { at: 4.75, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
          { at: 5.3, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.5 },
          { at: 5.3, actor: 'tea', do: 'rotateTo', amount: -110, dur: 0.3 },
          { at: 5.3, actor: 'tea', do: 'moveTo', to: teaOn(top.x, top.y), dur: 0.3 },
          { at: 5.8, actor: 'dog', do: 'moveTo', to: { x: LX - 2, y: G }, dur: 0.4, ease: 'in' },
          { at: 5.8, actor: 'tea', do: 'moveTo', to: teaOn(LX - 2, G), dur: 0.4, ease: 'in' },
          // 梯子飛回車上，茶也收走，他垂頭走回來
          { at: 6.25, actor: 'ladder', do: 'rotateTo', amount: -10, dur: 0.45 },
          { at: 6.25, actor: 'ladder', do: 'moveTo', to: { x: TRUCK_X + 8, y: ladder.y }, arc: 12, dur: 0.45 },
          { at: 6.7, actor: 'ladder', do: 'vanish', dur: 0.1 },
          { at: 6.25, actor: 'tea', do: 'vanish', dur: 0.15 },
          { at: 6.25, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/idle' },
          { at: 6.25, actor: 'dog', do: 'flip' },
          { at: 6.3, actor: 'dog', do: 'moveTo', to: { x: W1_X, y: G }, dur: 0.45 },
          { at: 6.8, actor: 'dog', do: 'flip' },
          { at: 7.0, actor: 'dog', do: 'squash', amount: 0.15, dur: 0.35 },
        ],
        fx: [
          ...smoke(0, 7.4),
          { at: 0.15, kind: 'burst', actor: 'tea', emoji: '✨', n: 5, scale: 0.7, dur: 0.5 },
          { at: 2.1, kind: 'sweat', actor: 'dog' },
          { at: 4.25, kind: 'zzz', x: F2.x - 2, y: F2.y - 6, emoji: '💨', scale: 0.45, dur: 0.8 },
          { at: 4.4, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.5 },
          { at: 5.35, kind: 'sweat', actor: 'dog' },
          { at: 6.95, kind: 'sweat', actor: 'dog' },
        ],
        camera: [START, release(0.5), holdWide(6.2, 0.6)],
        cues: [
          { at: 0.1, sfx: 'blip' },
          { at: 1.55, sfx: 'clink' },
          { at: 1.7, sfx: 'tap' },
          { at: 2.08, sfx: 'tap' },
          { at: 2.46, sfx: 'tap' },
          { at: 2.84, sfx: 'tap' },
          { at: 4.25, sfx: 'deflate' },
          { at: 3.75, say: '茶太少了！火在笑！' },
          { at: 5.8, sfx: 'slide' },
        ] as Cue[],
      }
    })(),
  }),

  // 水來了！火沒了！——他拉出水管，水管鼓一包從車上傳到他手上，蓄力，一道大水柱沖上樹：兩邊的火先熄，中間那顆縮小、掙扎，
  // 變成小火苗跳下樹逃跑，被最後一噴澆成一縷煙。樹抖一抖滴水，冒出一道小彩虹。結尾 W2：他拿著水管得意
  'put:水': scene({
    duration: 6.6,
    bg: BG,
    ...(() => {
      const N = nozzle(W1_X)
      const RUN0 = f2At(114, 75)
      const RUN1 = f2At(103, 75)
      return {
        actors: [
          tree, ...flames, ...parked,
          dogAt('idle', W1_X),
          { id: 'puff', emoji: 'prop:smoke', x: RUN1.x, y: 68, size: 9, hidden: true, float: true },
          { id: 'rainbow', emoji: '🌈', x: TREE_X - 2, y: 15, size: 18, hidden: true, float: true },
        ],
        moves: [
          ...dance(0, 1.3),
          { at: 0.1, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
          // 蓄力
          { at: 0.85, actor: 'dog', do: 'squash', amount: -0.15, dur: 0.3 },
          { at: 0.9, actor: 'dog', do: 'shake', amount: 0.6, dur: 0.3 },
          // 噴！兩邊的火先熄
          { at: 1.2, actor: 'dog', do: 'squash', amount: 0.15, dur: 0.25 },
          { at: 1.35, actor: 'f1', do: 'shake', amount: 1, dur: 0.25 },
          { at: 1.5, actor: 'f1', do: 'scaleTo', amount: 0.2, dur: 0.15 },
          { at: 1.65, actor: 'f1', do: 'vanish', dur: 0.05 },
          { at: 1.75, actor: 'f3', do: 'shake', amount: 1, dur: 0.25 },
          { at: 1.9, actor: 'f3', do: 'scaleTo', amount: 0.2, dur: 0.15 },
          { at: 2.05, actor: 'f3', do: 'vanish', dur: 0.05 },
          // 中間那顆縮小、掙扎
          { at: 2.1, actor: 'face', do: 'swap', emoji: '😬' },
          { at: 2.1, actor: 'f2', do: 'scaleTo', amount: 0.6, dur: 0.35 },
          { at: 2.1, actor: 'face', do: 'scaleTo', amount: 0.6, dur: 0.35 },
          { at: 2.1, actor: 'face', do: 'moveTo', to: faceAt(0.6), dur: 0.35 },
          ...both({ at: 2.3, do: 'shake', amount: 1.2, dur: 0.4 }),
          // 跳下樹逃跑
          { at: 2.7, actor: 'face', do: 'swap', emoji: '😱' },
          { at: 2.7, actor: 'f2', do: 'moveTo', to: RUN0, arc: 8, dur: 0.4, ease: 'in' },
          { at: 2.7, actor: 'face', do: 'moveTo', to: faceAt(0.6, RUN0.x, 75), arc: 8, dur: 0.4, ease: 'in' },
          { at: 3.1, actor: 'f2', do: 'moveTo', to: RUN1, dur: 0.3 },
          { at: 3.1, actor: 'face', do: 'moveTo', to: faceAt(0.6, RUN1.x, 75), dur: 0.3 },
          ...both({ at: 3.1, do: 'hop', amount: 2, dur: 0.15 }),
          ...both({ at: 3.25, do: 'hop', amount: 2, dur: 0.15 }),
          // 最後一噴：變成一縷煙
          { at: 3.45, actor: 'f2', do: 'vanish', dur: 0.1 },
          { at: 3.45, actor: 'face', do: 'vanish', dur: 0.1 },
          { at: 3.45, actor: 'puff', do: 'pop', dur: 0.2 },
          { at: 3.6, actor: 'puff', do: 'moveTo', to: { x: RUN1.x + 2, y: 44 }, dur: 1.4, ease: 'out' },
          { at: 3.6, actor: 'puff', do: 'scaleTo', amount: 1.6, dur: 1.4 },
          { at: 4.9, actor: 'puff', do: 'vanish', dur: 0.3 },
          // 樹抖一抖滴水，冒彩虹
          { at: 3.7, actor: 'tree', do: 'shake', amount: 0.8, dur: 0.5 },
          { at: 4.1, actor: 'rainbow', do: 'pop', dur: 0.4 },
          { at: 5.0, actor: 'rainbow', do: 'hop', amount: 1, dur: 0.4 },
          { at: 5.9, actor: 'rainbow', do: 'vanish', dur: 0.4 },
          // 他好得意
          { at: 3.6, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/happy' },
          { at: 3.65, actor: 'dog', do: 'hop', amount: 5, dur: 0.35 },
          { at: 4.1, actor: 'dog', do: 'hop', amount: 4, dur: 0.35 },
          { at: 4.7, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
          { at: 5.0, actor: 'dog', do: 'tilt', amount: -8, dur: 0.5 },
          { at: 5.55, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
          { at: 6.1, actor: 'dog', do: 'squash', amount: -0.1, dur: 0.35 },
          { at: 5.4, actor: 'tree', do: 'shake', amount: 0.5, dur: 0.4 },
        ],
        fx: [
          ...smoke(0, 1.4),
          hose(0.1, 6.5, hoseTo(W1_X)),
          ...bulge(0.35, hoseTo(W1_X)),
          ...jet(1.2, 0.45, F1, N),
          { at: 1.6, kind: 'zzz', x: F1.x, y: F1.y, emoji: '💨', dur: 0.9 },
          ...jet(1.65, 0.45, F3, N),
          { at: 2.0, kind: 'zzz', x: F3.x, y: F3.y, emoji: '💨', dur: 0.9 },
          ...jet(2.1, 0.6, { x: F2.x, y: F2.y + 3 }, N),
          { at: 2.75, dur: 0.75, kind: 'line', actor: 'dog', dx: NOZ.dx, dy: NOZ.dy, target: 'f2', color: '#7CC8FF', width: 2.6 },
          { at: 3.45, kind: 'burst', x: RUN1.x, y: 72, emoji: '💦', n: 7, dur: 0.5 },
          { at: 3.8, kind: 'rain', x: TREE_X - 8, y: 50, n: 6, dur: 1.2 },
          { at: 4.2, kind: 'rain', x: TREE_X + 10, y: 50, n: 6, dur: 1.2 },
          { at: 5.4, kind: 'rain', x: TREE_X, y: 50, n: 6, dur: 1.0 },
          { at: 4.1, kind: 'burst', x: TREE_X - 2, y: 18, emoji: '✨', n: 6, dur: 0.7 },
          { at: 3.7, kind: 'burst', actor: 'dog', emoji: '⭐', n: 6, dur: 0.7 },
        ],
        // 小火苗逃跑：鏡頭推過去看清楚它被澆熄；之後退回全景
        camera: [START, release(0.5), { at: 2.55, dur: 0.35, do: 'zoom', amount: 1.4, to: { x: 108, y: 66 } }, holdWide(3.9, 0.6)],
        cues: [
          { at: 0.1, sfx: 'slide' },
          { at: 1.2, sfx: 'splash' },
          { at: 1.65, sfx: 'splash' },
          { at: 2.0, say: '水來了！火沒了！' },
          { at: 2.7, sfx: 'boing' },
          { at: 3.45, sfx: 'poof' },
          { at: 3.65, sfx: 'cheer' },
        ] as Cue[],
      }
    })(),
  }),

  // 火沒了。他想再噴水！——他看著手上的水管，眼睛發亮，對天空試噴一下、再噴一下更高，越噴越開心；轉頭找「火」：
  // 往左看、往右看（鏡頭跟著他），走到中間偏左躍躍欲試。結尾 W3
  more: scene({
    duration: 6.0,
    bg: BG,
    actors: [tree, ...parked, dogAt('hose', W1_X)],
    moves: [
      { at: 0.2, actor: 'dog', do: 'tilt', amount: 14, dur: 0.6 },
      { at: 0.9, actor: 'dog', do: 'hop', amount: 2, dur: 0.25 },
      // 試噴兩下，一次比一次高
      { at: 1.2, actor: 'dog', do: 'squash', amount: 0.12, dur: 0.25 },
      { at: 1.65, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/happy' },
      { at: 1.7, actor: 'dog', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.05, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
      { at: 2.15, actor: 'dog', do: 'squash', amount: 0.18, dur: 0.25 },
      { at: 2.75, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/happy' },
      { at: 2.8, actor: 'dog', do: 'hop', amount: 7, dur: 0.4 },
      // 火呢？往左看
      { at: 3.25, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
      { at: 3.25, actor: 'dog', do: 'flip' },
      { at: 3.3, actor: 'dog', do: 'moveTo', to: { x: 70, y: G }, dur: 0.45 },
      { at: 3.85, actor: 'dog', do: 'tilt', amount: -8, dur: 0.35 },
      // 往右看
      { at: 4.25, actor: 'dog', do: 'flip' },
      { at: 4.3, actor: 'dog', do: 'moveTo', to: { x: W3_X, y: G }, dur: 0.3 },
      { at: 4.65, actor: 'dog', do: 'tilt', amount: 8, dur: 0.35 },
      // 躍躍欲試
      { at: 5.05, actor: 'dog', do: 'squash', amount: -0.12, dur: 0.25 },
      { at: 5.3, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
      { at: 5.65, actor: 'dog', do: 'hop', amount: 2, dur: 0.25 },
    ],
    fx: [
      hose(0, 3.3, hoseTo(W1_X)),
      ...hoseMove(3.3, 0.45, hoseTo(W1_X), hoseTo(70)),
      hose(3.75, 0.55, hoseTo(70)),
      ...hoseMove(4.3, 0.3, hoseTo(70), hoseTo(W3_X)),
      hose(4.6, 1.4, hoseTo(W3_X)),
      { at: 0.4, kind: 'pop', actor: 'dog', emoji: '🤩', dur: 0.8 },
      { at: 0.45, kind: 'burst', x: nozzle(W1_X).x, y: nozzle(W1_X).y, emoji: '✨', n: 5, scale: 0.7, dur: 0.5 },
      { at: 1.2, dur: 0.35, kind: 'line', actor: 'dog', dx: NOZ.dx, dy: NOZ.dy, to: { x: 100, y: 38 }, color: '#7CC8FF', width: 2.2 },
      { at: 1.4, kind: 'rain', x: 100, y: 38, n: 5, dur: 0.7 },
      { at: 2.15, dur: 0.5, kind: 'line', actor: 'dog', dx: NOZ.dx, dy: NOZ.dy, to: { x: 112, y: 14 }, color: '#7CC8FF', width: 3 },
      { at: 2.45, kind: 'burst', x: 112, y: 14, emoji: '💦', n: 7, dur: 0.5 },
      { at: 2.55, kind: 'rain', x: 112, y: 16, n: 8, dur: 0.9 },
      { at: 2.8, kind: 'burst', actor: 'dog', emoji: '💕', n: 6, dur: 0.7 },
      { at: 3.4, kind: 'pop', actor: 'dog', emoji: '❓', dx: -14, dur: 0.7 },
      { at: 4.35, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.7 },
    ],
    // 試噴時定在全景（看得到水噴多高）；左看右看：鏡頭跟著往左、往右；最後退回全景等他選
    camera: [
      START,
      { at: 3.25, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 46, y: 50 } },
      { at: 4.25, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 112, y: 50 } },
      holdWide(4.95, 0.5),
    ],
    cues: [
      { at: 0.4, say: '火沒了。他想再噴水！' },
      { at: 1.2, sfx: 'splash' },
      { at: 2.15, sfx: 'splash' },
      { at: 2.8, sfx: 'cheer' },
    ],
  }),

  // 小龍不能噴火了！他哭了。——小龍走進來，開心地噴一小口火給他看；他嚇一跳（那是火！），一道水柱正中小龍的嘴。
  // 小龍再噴：只噗出一小朵煙；更用力再噴：只滴出一滴水。小龍大哭（眼淚噴出來）跑掉。開頭結尾都是 W3
  'spray:龍': scene({
    duration: 7.0,
    bg: BG,
    ...(() => {
      const DX = 100
      const MOUTH = { x: DX - 9, y: 59 }
      return {
        actors: [
          tree, ...parked,
          { id: 'dino', emoji: 'hero:dino/idle', x: DX, y: G, size: S, hidden: true },
          dogAt('hose', W3_X),
          { id: 'breath', emoji: '🔥', ...MOUTH, size: 8, hidden: true, float: true },
          { id: 'tear', emoji: '💧', ...MOUTH, size: 5, hidden: true, float: true },
          { id: 'cloud', emoji: 'prop:smoke', x: MOUTH.x + 2, y: MOUTH.y, size: 8, hidden: true, float: true },
        ],
        moves: [
          { at: 0.1, actor: 'dino', do: 'enter', from: { x: 180, y: G }, dur: 0.8, ease: 'out' },
          // 開心，噴一小口火給他看
          { at: 0.95, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
          { at: 0.95, actor: 'dino', do: 'flip' },
          { at: 1.0, actor: 'dino', do: 'hop', amount: 3, dur: 0.3 },
          { at: 1.3, actor: 'dino', do: 'squash', amount: -0.15, dur: 0.2 },
          { at: 1.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
          { at: 1.45, actor: 'dino', do: 'flip' },
          { at: 1.5, actor: 'breath', do: 'pop', dur: 0.15 },
          { at: 1.5, actor: 'breath', do: 'moveTo', to: { x: MOUTH.x - 8, y: MOUTH.y - 1 }, dur: 0.4, ease: 'out' },
          { at: 1.5, actor: 'breath', do: 'scaleTo', amount: 1.4, dur: 0.4 },
          // 那是火！噴！
          { at: 1.6, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
          { at: 1.95, actor: 'breath', do: 'vanish', dur: 0.1 },
          { at: 1.95, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
          { at: 1.95, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.3 },
          { at: 1.95, actor: 'dino', do: 'moveTo', to: { x: DX + 4, y: G }, dur: 0.3, ease: 'out' },
          { at: 2.2, actor: 'dino', do: 'shake', amount: 1, dur: 0.4 },
          { at: 1.85, actor: 'dog', do: 'squash', amount: 0.12, dur: 0.25 },
          // 再噴：只噗出一小朵煙
          { at: 2.9, actor: 'dino', do: 'squash', amount: -0.18, dur: 0.3 },
          { at: 3.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
          { at: 3.2, actor: 'dino', do: 'squash', amount: 0.12, dur: 0.2 },
          { at: 3.22, actor: 'cloud', do: 'pop', dur: 0.2 },
          { at: 3.3, actor: 'cloud', do: 'moveTo', to: { x: MOUTH.x - 4, y: MOUTH.y - 8 }, dur: 0.6, ease: 'out' },
          { at: 3.75, actor: 'cloud', do: 'vanish', dur: 0.2 },
          { at: 3.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
          // 更用力：只滴出一滴水
          { at: 3.9, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.4 },
          { at: 3.9, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.4 },
          { at: 4.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
          { at: 4.3, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.25 },
          { at: 4.35, actor: 'tear', do: 'moveTo', to: { x: DX + 4 - 9, y: 59 }, dur: 0.01 },
          { at: 4.36, actor: 'tear', do: 'pop', dur: 0.1 },
          { at: 4.45, actor: 'tear', do: 'moveTo', to: { x: DX - 5, y: 74 }, dur: 0.35, ease: 'in' },
          { at: 4.8, actor: 'tear', do: 'squash', amount: 0.4, dur: 0.2 },
          { at: 5.0, actor: 'tear', do: 'vanish', dur: 0.1 },
          // 大哭，跑掉
          { at: 4.85, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
          { at: 4.85, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.6 },
          { at: 5.5, actor: 'dino', do: 'flip' },
          { at: 5.55, actor: 'dino', do: 'moveTo', to: { x: 185, y: G }, dur: 0.8, ease: 'in' },
          { at: 6.4, actor: 'dino', do: 'vanish', dur: 0.05 },
          // 他：糟糕
          { at: 4.9, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
          { at: 4.9, actor: 'dog', do: 'hop', amount: 2, dur: 0.25 },
          { at: 6.0, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
          { at: 6.25, actor: 'dog', do: 'tilt', amount: 8, dur: 0.35 },
          { at: 6.55, actor: 'dog', do: 'squash', amount: -0.1, dur: 0.2 },
          { at: 6.7, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
        ],
        fx: [
          hose(0, 7.0, hoseTo(W3_X)),
          { at: 1.6, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.6 },
          ...jet(1.85, 0.55, MOUTH, nozzle(W3_X)),
          { at: 2.0, kind: 'burst', ...MOUTH, emoji: '💨', n: 4, scale: 0.7, dur: 0.4 },
          { at: 2.5, kind: 'rain', actor: 'dino', dy: 6, n: 5, dur: 1.0 },
          { at: 3.65, kind: 'pop', actor: 'dino', emoji: '❓', dur: 0.6 },
          { at: 4.9, kind: 'fountain', actor: 'dino', dy: 8, n: 8, dur: 1.3 },
          { at: 5.0, kind: 'pop', actor: 'dino', emoji: '😭', dx: -14, dy: 6, dur: 0.8 },
          { at: 5.55, kind: 'puff', actor: 'dino', dur: 0.4 },
          { at: 5.0, kind: 'sweat', actor: 'dog' },
        ],
        // 小龍再噴兩次：鏡頭推到他嘴巴，看得到只有一朵煙、一滴水
        camera: [START, release(0.6), { at: 2.7, dur: 0.4, do: 'zoom', amount: 1.45, to: { x: DX - 8, y: 54 } }, holdWide(5.35, 0.5)],
        cues: [
          { at: 1.5, sfx: 'poof' },
          { at: 1.85, sfx: 'splash' },
          { at: 2.8, say: '小龍不能噴火了！他哭了。' },
          { at: 3.2, sfx: 'deflate' },
          { at: 4.8, sfx: 'plop' },
          { at: 5.55, sfx: 'whoosh' },
        ] as Cue[],
      }
    })(),
  }),

  // 爸爸的肉都是水了！——爸爸走到小火堆旁烤肉，眼睛發亮、哼著歌翻肉、冒香味；他看到烤肉的火（那是火！），
  // 水柱把火、肉、爸爸一路沖過去：火熄了、肉滴滴答答，爸爸從頭濕到腳冷得發抖，舉著濕肉瞪他，氣呼呼地走掉（肉一路滴水）。開頭結尾都是 W3
  'spray:爸': scene({
    duration: 7.4,
    bg: BG,
    ...(() => {
      // 爸爸站在樹幹左邊（深色衣服貼著樹幹會糊在一起）
      const GX = 88
      const DX = 108
      const MEAT = { x: GX, y: 60 }
      const FACE_D = { x: DX - 6, y: 48 }
      return {
        actors: [
          tree, ...parked,
          { id: 'bbq', emoji: '🔥', x: GX, y: 77 - 0.42 * 10, size: 10, hidden: true },
          { id: 'dad', emoji: 'hero:eric/walk', x: DX, y: DG, size: DAD_S, hidden: true },
          { id: 'meat', emoji: 'prop:meat', ...MEAT, size: 15, hidden: true, float: true, pivot: 'center' as const },
          dogAt('hose', W3_X),
        ],
        moves: [
          { at: 0.1, actor: 'dad', do: 'enter', from: { x: 185, y: DG }, dur: 0.8, ease: 'out' },
          { at: 0.15, actor: 'bbq', do: 'pop', dur: 0.25 },
          { at: 0.35, actor: 'meat', do: 'drop', dur: 0.4 },
          { at: 0.95, actor: 'dad', do: 'swap', emoji: 'hero:eric/drool' },
          // 哼著歌翻肉
          { at: 1.05, actor: 'meat', do: 'hop', amount: 5, dur: 0.35 },
          { at: 1.2, actor: 'meat', do: 'flip' },
          { at: 1.6, actor: 'meat', do: 'hop', amount: 5, dur: 0.35 },
          { at: 1.75, actor: 'meat', do: 'flip' },
          { at: 1.3, actor: 'dad', do: 'tilt', amount: -6, dur: 0.4 },
          { at: 1.8, actor: 'dad', do: 'tilt', amount: 6, dur: 0.4 },
          // 那是火！噴！
          { at: 1.75, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
          { at: 2.0, actor: 'dog', do: 'squash', amount: 0.12, dur: 0.25 },
          { at: 2.3, actor: 'bbq', do: 'scaleTo', amount: 0.2, dur: 0.15 },
          { at: 2.45, actor: 'bbq', do: 'vanish', dur: 0.05 },
          { at: 2.5, actor: 'meat', do: 'shake', amount: 1, dur: 0.3 },
          { at: 2.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
          { at: 2.8, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.3 },
          { at: 2.8, actor: 'dad', do: 'moveTo', to: { x: DX + 4, y: DG }, dur: 0.3, ease: 'out' },
          // 從頭濕到腳，冷得發抖
          { at: 3.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/cold' },
          { at: 3.3, actor: 'dad', do: 'shake', amount: 1, dur: 0.8 },
          { at: 3.3, actor: 'meat', do: 'tilt', amount: 15, dur: 0.6 },
          // 舉著濕肉瞪他
          { at: 4.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/lift' },
          { at: 4.2, actor: 'meat', do: 'moveTo', to: { x: DX + 4, y: 34 }, arc: 4, dur: 0.3 },
          { at: 4.55, actor: 'meat', do: 'shake', amount: 0.8, dur: 0.4 },
          { at: 4.55, actor: 'dad', do: 'hop', amount: 2, dur: 0.25 },
          // 氣呼呼地走掉，肉一路滴水
          { at: 5.25, actor: 'dad', do: 'flip' },
          { at: 5.25, actor: 'dad', do: 'swap', emoji: 'hero:eric/walk' },
          { at: 5.3, actor: 'dad', do: 'moveTo', to: { x: 190, y: DG }, dur: 0.9, ease: 'in' },
          { at: 5.3, actor: 'meat', do: 'moveTo', to: { x: 196, y: 40 }, dur: 0.9, ease: 'in' },
          { at: 6.25, actor: 'dad', do: 'vanish', dur: 0.05 },
          { at: 6.25, actor: 'meat', do: 'vanish', dur: 0.05 },
          // 他：糟糕
          { at: 3.4, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
          { at: 3.4, actor: 'dog', do: 'hop', amount: 2, dur: 0.25 },
          { at: 5.9, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
          { at: 6.3, actor: 'dog', do: 'tilt', amount: 8, dur: 0.35 },
          { at: 6.7, actor: 'dog', do: 'squash', amount: -0.1, dur: 0.2 },
          { at: 6.85, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
        ],
        fx: [
          hose(0, 7.4, hoseTo(W3_X)),
          { at: 1.0, kind: 'zzz', actor: 'dad', emoji: '🎵', dx: 4, dur: 1.5 },
          { at: 1.0, kind: 'zzz', x: MEAT.x - 4, y: MEAT.y - 4, emoji: '♨️', dur: 1.4 },
          { at: 1.75, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.6 },
          ...jet(2.0, 0.45, { x: GX, y: 70 }, nozzle(W3_X)),
          { at: 2.4, kind: 'burst', x: GX, y: 70, emoji: '💨', n: 4, dur: 0.5 },
          ...jet(2.45, 0.35, MEAT, nozzle(W3_X)),
          ...jet(2.8, 0.55, FACE_D, nozzle(W3_X), 1.2),
          { at: 3.2, kind: 'rain', actor: 'dad', dy: 6, n: 7, dur: 1.0 },
          { at: 3.0, kind: 'rain', x: MEAT.x, y: MEAT.y, n: 4, dur: 1.2 },
          { at: 4.2, kind: 'rain', actor: 'dad', dy: 8, n: 6, dur: 1.0 },
          { at: 4.5, kind: 'rain', actor: 'meat', n: 4, dur: 0.9 },
          { at: 4.6, kind: 'pop', actor: 'dad', emoji: '💢', dx: -16, dy: 10, dur: 0.7 },
          { at: 5.3, kind: 'rain', actor: 'meat', n: 4, dur: 0.9 },
          { at: 3.5, kind: 'sweat', actor: 'dog' },
        ],
        camera: [START, release(0.6), { at: 2.85, dur: 0.3, do: 'shake', amount: 1 }, holdWide(5.6, 0.6)],
        cues: [
          { at: 0.15, sfx: 'poof' },
          { at: 1.05, sfx: 'tap' },
          { at: 1.6, sfx: 'tap' },
          { at: 2.0, sfx: 'splash' },
          { at: 2.8, sfx: 'splash' },
          { at: 3.0, say: '爸爸的肉都是水了！' },
          { at: 5.3, sfx: 'whoosh' },
        ] as Cue[],
      }
    })(),
  }),

  // 太陽太高了！噴不到！——太陽又紅又熱，他抬頭一看：噴！地上噴，水飛到一半掉下來；爬上車頂噴，高一點還是掉下來；
  // 車頂再架梯子踮腳噴：水柱飛到太陽前面停一拍、聚成一大坨，太陽呼一口氣，整坨掉回來淋在他頭上，他從梯子上摔下來，
  // 太陽戴上墨鏡得意地笑、飄走。他甩甩身上的水，回到 W3
  'spray:陽': scene({
    duration: 8.0,
    bg: BG,
    ...(() => {
      const SUN = { x: 108, y: 13 }
      const RED = 'saturate(2.6) hue-rotate(-28deg) brightness(1.05)'
      const roofY = on(ROOF)
      const LAD_F = ROOF - 12
      const ladY = on(LAD_F)
      const ROOF_X = 44
      const LAD_X = 42
      const n1 = nozzle(W3_X)
      const n2 = nozzle(ROOF_X, ROOF - 0.42 * S * K)
      const n3 = nozzle(LAD_X, LAD_F - 0.42 * S * K)
      const APEX = { x: 86, y: 15 }
      // 第三次：一顆一顆飛到最高點停住，聚成一大坨
      const third: Move[] = DROPS.flatMap((id, i): Move[] => {
        const t = r2(4.6 + i * 0.05)
        return [
          { at: r2(t - 0.02), actor: id, do: 'moveTo', to: n3, dur: 0.01 },
          { at: t, actor: id, do: 'pop', dur: 0.06 },
          { at: t, actor: id, do: 'moveTo', to: { x: APEX.x - 2 + (i % 3) * 2, y: APEX.y + (i % 2) * 2 }, dur: 0.5, ease: 'out' },
          { at: r2(t + 0.5), actor: id, do: 'vanish', dur: 0.08 },
        ]
      })
      return {
        actors: [
          { id: 'sun', emoji: '🌞', x: SUN.x, y: SUN.y + 16, size: 16, hidden: true, float: true },
          { id: 'shades', emoji: '🕶️', x: SUN.x, y: -14, size: 12, hidden: true, float: true },
          tree, ...parked,
          { id: 'ladder', emoji: 'prop:ladder', x: LAD_X, y: on(ROOF, 12), size: 12, hidden: true },
          dogAt('hose', W3_X),
          ...drops,
          { id: 'blob', emoji: '💦', ...APEX, size: 12, hidden: true, float: true },
        ],
        moves: [
          // 太陽升起來，又紅又熱
          { at: 0.1, actor: 'sun', do: 'pop', dur: 0.2 },
          { at: 0.1, actor: 'sun', do: 'moveTo', to: SUN, dur: 0.5, ease: 'out' },
          { at: 0.4, actor: 'sun', do: 'tint', filter: RED },
          { at: 0.55, actor: 'sun', do: 'squash', amount: -0.12, dur: 0.3 },
          { at: 0.45, actor: 'dog', do: 'tilt', amount: -12, dur: 0.4 },
          // 第一次：地上噴，飛到一半掉下來
          { at: 0.95, actor: 'dog', do: 'squash', amount: 0.12, dur: 0.25 },
          ...arcDrops(DROPS, 0.95, n1, { x: 90, y: 36 }, { x: 98, y: 74 }, 0.3, 0.3, 0.05),
          { at: 1.95, actor: 'dog', do: 'tilt', amount: -8, dur: 0.3 },
          // 爬上車頂
          { at: 2.1, actor: 'dog', do: 'moveTo', to: { x: ROOF_X, y: roofY }, arc: 10, dur: 0.4 },
          // 第二次：高一點，還是掉下來
          { at: 2.55, actor: 'dog', do: 'squash', amount: 0.14, dur: 0.25 },
          ...arcDrops(DROPS, 2.55, n2, { x: 80, y: 20 }, { x: 92, y: 74 }, 0.4, 0.4, 0.05),
          { at: 3.7, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
          { at: 3.95, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
          // 車頂架梯子，爬上去，踮腳
          { at: 4.05, actor: 'ladder', do: 'pop', dur: 0.2 },
          { at: 4.2, actor: 'dog', do: 'moveTo', to: { x: LAD_X, y: ladY }, arc: 4, dur: 0.3 },
          { at: 4.5, actor: 'dog', do: 'stretchTo', amount: 0.88, dur: 0.2 },
          // 第三次：飛到太陽前面停住，聚成一大坨
          ...third,
          { at: 4.6, actor: 'dog', do: 'squash', amount: 0.1, dur: 0.2 },
          { at: 5.1, actor: 'blob', do: 'pop', dur: 0.2 },
          { at: 5.15, actor: 'blob', do: 'scaleTo', amount: 1.5, dur: 0.4, ease: 'back' },
          { at: 5.5, actor: 'blob', do: 'shake', amount: 0.8, dur: 0.35 },
          { at: 5.5, actor: 'dog', do: 'stretchTo', amount: 1 / 0.88, dur: 0.2 },
          // 太陽呼一口氣：整坨掉回來
          { at: 5.5, actor: 'sun', do: 'squash', amount: -0.15, dur: 0.3 },
          { at: 5.85, actor: 'blob', do: 'moveTo', to: { x: LAD_X + 2, y: 6 }, arc: 5, dur: 0.35, ease: 'in' },
          { at: 6.2, actor: 'blob', do: 'vanish', dur: 0.08 },
          { at: 6.2, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
          { at: 6.2, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
          // 從梯子上摔下來
          { at: 6.5, actor: 'dog', do: 'moveTo', to: { x: W3_X, y: G }, arc: 4, dur: 0.45, ease: 'in' },
          { at: 6.5, actor: 'ladder', do: 'tilt', amount: -25, dur: 0.4 },
          { at: 6.8, actor: 'ladder', do: 'vanish', dur: 0.2 },
          { at: 6.95, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/dizzy' },
          // 甩甩身上的水
          { at: 7.35, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
          { at: 7.35, actor: 'dog', do: 'shake', amount: 2, dur: 0.4 },
          // 太陽戴上墨鏡、得意地笑、飄走
          { at: 6.3, actor: 'shades', do: 'pop', dur: 0.05 },
          { at: 6.3, actor: 'shades', do: 'moveTo', to: { x: SUN.x, y: SUN.y - 1 }, dur: 0.3, ease: 'bounce' },
          { at: 6.65, actor: 'sun', do: 'hop', amount: 2, dur: 0.25 },
          { at: 6.65, actor: 'shades', do: 'hop', amount: 2, dur: 0.25 },
          { at: 6.95, actor: 'sun', do: 'hop', amount: 2, dur: 0.25 },
          { at: 6.95, actor: 'shades', do: 'hop', amount: 2, dur: 0.25 },
          { at: 7.25, actor: 'sun', do: 'moveTo', to: { x: SUN.x + 8, y: -24 }, dur: 0.55, ease: 'in' },
          { at: 7.25, actor: 'shades', do: 'moveTo', to: { x: SUN.x + 8, y: -25 }, dur: 0.55, ease: 'in' },
          { at: 7.8, actor: 'sun', do: 'vanish', dur: 0.05 },
          { at: 7.8, actor: 'shades', do: 'vanish', dur: 0.05 },
        ],
        fx: [
          hose(0, 2.1, hoseTo(W3_X)),
          ...hoseMove(2.1, 0.4, hoseTo(W3_X), { x: ROOF_X - 7, y: ROOF - 4 }),
          hose(2.5, 1.7, { x: ROOF_X - 7, y: ROOF - 4 }),
          ...hoseMove(4.2, 0.3, { x: ROOF_X - 7, y: ROOF - 4 }, { x: LAD_X - 7, y: LAD_F - 4 }),
          hose(4.5, 2.0, { x: LAD_X - 7, y: LAD_F - 4 }),
          ...hoseMove(6.5, 0.45, { x: LAD_X - 7, y: LAD_F - 4 }, hoseTo(W3_X)),
          hose(6.95, 1.05, hoseTo(W3_X)),
          { at: 0.4, kind: 'zzz', x: SUN.x - 14, y: SUN.y + 8, emoji: '♨️', dur: 1.6 },
          { at: 0.65, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.5 },
          { at: 1.0, kind: 'sweat', actor: 'dog' },
          { at: 1.6, kind: 'burst', x: 98, y: 72, emoji: '💦', n: 5, dur: 0.4 },
          { at: 3.3, kind: 'burst', x: 92, y: 72, emoji: '💦', n: 6, dur: 0.4 },
          { at: 3.75, kind: 'pop', actor: 'dog', emoji: '😤', dur: 0.6 },
          
          { at: 5.5, kind: 'blow', x: SUN.x - 6, y: SUN.y + 2, to: { x: APEX.x - 10, y: APEX.y + 2 }, n: 3, scale: 1.2, dur: 0.45 },
          { at: 6.2, kind: 'burst', x: LAD_X, y: 10, emoji: '💦', n: 10, scale: 1.3, dur: 0.6 },
          { at: 6.25, kind: 'rain', actor: 'dog', n: 6, dur: 0.8 },
          { at: 7.0, kind: 'dizzy', actor: 'dog', dur: 0.4 },
          { at: 7.35, kind: 'burst', actor: 'dog', emoji: '💦', n: 8, dy: 8, dur: 0.5 },
        ],
        camera: [START, { at: 6.2, dur: 0.3, do: 'shake', amount: 1.2 }],
        cues: [
          { at: 0.95, sfx: 'splash' },
          { at: 2.1, sfx: 'boing' },
          { at: 2.4, say: '太陽太高了！噴不到！' },
          { at: 2.55, sfx: 'splash' },
          { at: 4.05, sfx: 'clink' },
          { at: 4.6, sfx: 'splash' },
          { at: 5.65, sfx: 'whoosh' },
          { at: 6.2, sfx: 'splash' },
          { at: 6.95, sfx: 'bonk' },
        ] as Cue[],
      }
    })(),
  }),

  // 大家都是水！消防車回家了。——小龍、爸爸濕答答地回來瞪他，車也在滴水；兩個舉起水桶走過來，一起往他頭上倒，
  // 他轉圈暈倒；他跳上車頂，消防車掉頭、搖搖晃晃開走，一路滴水，後面冒出一道彩虹，小龍、爸爸笑著揮手
  wet: scene({
    duration: 7.8,
    bg: BG,
    ...(() => {
      const DINO_X = 104
      const roofY = on(ROOF)
      const RIDE = 4
      /** 車子、警示燈、紅光、車頂的他一起往左開到 x，一路搖 */
      const away: Move[] = [
        { at: 4.3, actor: 'truck', do: 'moveTo', to: { x: -50, y: TY }, dur: 1.6, ease: 'in' },
        { at: 4.3, actor: 'siren', do: 'moveTo', to: { x: -50 - SIREN_D.x, y: TY + SIREN_D.y }, dur: 1.6, ease: 'in' },
        { at: 4.3, actor: 'glow', do: 'moveTo', to: { x: -50 - SIREN_D.x, y: TY + SIREN_D.y }, dur: 1.6, ease: 'in' },
        { at: 4.3, actor: 'dog', do: 'moveTo', to: { x: -50 + RIDE, y: roofY }, dur: 1.6, ease: 'in' },
        ...[4.3, 4.6, 4.9, 5.2, 5.5].flatMap((t, i): Move[] => ['truck', 'siren', 'glow', 'dog'].map((id) => ({ at: t, actor: id, do: 'tilt', amount: i % 2 ? -6 : 6, dur: 0.3 }) as Move)),
      ]
      return {
        actors: [
          { id: 'rainbow', emoji: '🌈', x: 46, y: 30, size: 40, hidden: true, float: true },
          tree, ...parked,
          { id: 'dino', emoji: 'hero:dino/idle', x: DINO_X, y: G, size: S, hidden: true },
          { id: 'dad', emoji: 'hero:eric/walk', x: DAD_X, y: DG, size: DAD_S, hidden: true },
          dogAt('hose', W3_X),
          { id: 'b1', emoji: 'prop:bucket', x: DINO_X, y: 50, size: 14, hidden: true, float: true, pivot: 'center' as const },
          { id: 'b2', emoji: 'prop:bucket', x: DAD_X, y: 41, size: 16, hidden: true, float: true, pivot: 'center' as const },
        ],
        moves: [
          { at: 0.1, actor: 'dino', do: 'enter', from: { x: 180, y: G }, dur: 0.8, ease: 'out' },
          { at: 0.2, actor: 'dad', do: 'enter', from: { x: 190, y: DG }, dur: 0.85, ease: 'out' },
          { at: 1.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/angry' },
          { at: 1.0, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.4 },
          { at: 1.0, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
          // 舉起水桶
          { at: 1.5, actor: 'b1', do: 'pop', dur: 0.2 },
          { at: 1.5, actor: 'b2', do: 'pop', dur: 0.2 },
          { at: 1.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
          { at: 1.5, actor: 'dino', do: 'flip' },
          { at: 1.5, actor: 'dad', do: 'swap', emoji: 'hero:eric/lift' },
          // 走過來
          { at: 1.85, actor: 'dino', do: 'moveTo', to: { x: 86, y: G }, dur: 0.4 },
          { at: 1.85, actor: 'b1', do: 'moveTo', to: { x: 86, y: 50 }, dur: 0.4 },
          { at: 1.85, actor: 'dad', do: 'moveTo', to: { x: 108, y: DG }, dur: 0.45 },
          { at: 1.85, actor: 'b2', do: 'moveTo', to: { x: 108, y: 41 }, dur: 0.45 },
          // 倒！
          { at: 2.35, actor: 'b1', do: 'moveTo', to: { x: W3_X + 8, y: 42 }, dur: 0.2 },
          { at: 2.35, actor: 'b1', do: 'rotateTo', amount: -110, dur: 0.2 },
          { at: 2.45, actor: 'b2', do: 'moveTo', to: { x: W3_X + 14, y: 36 }, dur: 0.2 },
          { at: 2.45, actor: 'b2', do: 'rotateTo', amount: -110, dur: 0.2 },
          { at: 2.5, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
          // 轉圈暈倒
          ...[2.8, 2.95, 3.1, 3.25].map((t): Move => ({ at: t, actor: 'dog', do: 'flip' })),
          { at: 2.8, actor: 'dog', do: 'hop', amount: 2, dur: 0.6 },
          { at: 3.4, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/dizzy' },
          // 放下水桶，看他笑
          { at: 3.05, actor: 'b1', do: 'vanish', dur: 0.2 },
          { at: 3.05, actor: 'b2', do: 'vanish', dur: 0.2 },
          { at: 3.1, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
          { at: 3.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
          { at: 3.5, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
          // 爬上車頂，掉頭，回家
          { at: 3.75, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/happy' },
          { at: 3.8, actor: 'dog', do: 'moveTo', to: { x: TRUCK_X + RIDE, y: roofY }, arc: 8, dur: 0.4 },
          { at: 4.2, actor: 'dog', do: 'flip' },
          { at: 4.2, actor: 'truck', do: 'flip' },
          { at: 4.2, actor: 'siren', do: 'moveTo', to: { x: TRUCK_X - SIREN_D.x, y: TY + SIREN_D.y }, dur: 0.01 },
          { at: 4.2, actor: 'glow', do: 'moveTo', to: { x: TRUCK_X - SIREN_D.x, y: TY + SIREN_D.y }, dur: 0.01 },
          ...away,
          ...blink(4.2, 6.0),
          { at: 6.0, actor: 'truck', do: 'vanish', dur: 0.05 },
          { at: 6.0, actor: 'siren', do: 'vanish', dur: 0.05 },
          { at: 6.0, actor: 'glow', do: 'vanish', dur: 0.05 },
          { at: 6.0, actor: 'dog', do: 'vanish', dur: 0.05 },
          // 彩虹，大家揮手
          { at: 4.9, actor: 'rainbow', do: 'pop', dur: 0.5 },
          { at: 4.5, actor: 'dad', do: 'swap', emoji: 'hero:eric/wave' },
          ...[4.7, 5.3, 5.9, 6.5, 7.1].map((t): Move => ({ at: t, actor: 'dino', do: 'hop', amount: 4, dur: 0.35 })),
          ...[5.0, 5.8, 6.6, 7.3].map((t, i): Move => ({ at: t, actor: 'dad', do: 'tilt', amount: i % 2 ? -6 : 6, dur: 0.45 })),
        ],
        fx: [
          hose(0, 3.75, hoseTo(W3_X)),
          { at: 0.3, kind: 'rain', actor: 'dino', dy: 6, n: 5, dur: 1.2 },
          { at: 0.4, kind: 'rain', actor: 'dad', dy: 6, n: 6, dur: 1.2 },
          { at: 0.2, kind: 'rain', actor: 'truck', dy: 18, n: 6, dur: 1.4 },
          { at: 1.1, kind: 'pop', actor: 'dino', emoji: '💢', dur: 0.7 },
          { at: 1.15, kind: 'pop', actor: 'dad', emoji: '💢', dx: -16, dy: 10, dur: 0.7 },
          { at: 1.2, kind: 'sweat', actor: 'dog' },
          { at: 1.7, kind: 'rain', actor: 'dad', dy: 6, n: 6, dur: 1.0 },
          { at: 2.4, kind: 'rain', x: W3_X, y: 44, emoji: '💦', n: 10, dur: 0.7 },
          { at: 2.5, kind: 'burst', actor: 'dog', emoji: '💦', n: 10, dur: 0.6 },
          { at: 3.45, kind: 'dizzy', actor: 'dog', dur: 0.35 },
          { at: 3.0, kind: 'rain', actor: 'truck', dy: 18, n: 6, dur: 1.2 },
          { at: 4.3, kind: 'rain', actor: 'truck', dy: 18, n: 6, dur: 1.6 },
          { at: 4.9, kind: 'burst', x: 46, y: 26, emoji: '✨', n: 8, dur: 0.8 },
          { at: 5.2, kind: 'pop', actor: 'dino', emoji: '😆', dur: 1.0 },
          { at: 6.3, kind: 'burst', x: 46, y: 26, emoji: '✨', n: 6, dur: 0.8 },
        ],
        camera: [START, release(0.6), { at: 2.45, dur: 0.3, do: 'shake', amount: 1 }, holdWide(3.7, 0.5)],
        cues: [
          { at: 2.35, sfx: 'splash' },
          { at: 2.8, sfx: 'boing' },
          { at: 3.0, say: '大家都是水！消防車回家了。' },
          { at: 3.8, sfx: 'boing' },
          { at: 4.3, sfx: 'whoosh' },
          { at: 4.9, sfx: 'cheer' },
        ] as Cue[],
      }
    })(),
  }),
}

export default scenes
