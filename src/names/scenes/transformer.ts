// 演的是字面意思：變形（一拍黏土就變出一個形狀）＋金剛（大猩猩）——一隻大猩猩表演拍黏土變東西給小猴子看，一次比一次大，最後變出一隻跟他一樣大的黏土大猩猩，學他一拍，把他拍扁變形（沒有車子變機器人、沒有標誌、不變成交通工具）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：大猩猩一拍黏土，黏土就「噗」地變成一隻動物——一次比一次大。
// 同一個動作（舉高、往前啪地拍下去）、同一聲「啪＋噗」，三次只有變出來的東西越來越大：
// 小老鼠 → 小豬 → 停一拍（他蓄力蓄好久、小猴子縮起來）→ 一隻跟他一樣大的黏土大猩猩。
// 反轉：黏土大猩猩學他舉高、啪地拍下去——這次被拍扁、變形的是他自己。他「蹦」地彈回來，兩隻一起拍胸脯：「變形金剛」。
const S = 36 // 大猩猩的 size
const G = 77 - 0.42 * S
const KX = 50 // 大猩猩站的地方
const HIT = 62 // 拍下去時往前跨到這裡
const CX = 90 // 黏土（變出來的東西都站在這裡）
const C = 14 // 黏土團的 size
const CG = 77 - 0.42 * C
const M = 22 // 小猴子
const MX = 128
const MG = 77 - 0.42 * M
/** 染成陶土的橘咖啡色：先去色、再照原圖的深淺補亮度，變出來的東西才都同一個色 */
const clay = (b: number) => `grayscale(1) brightness(${b}) contrast(1.2) sepia(1) saturate(3) hue-rotate(-18deg)`
const LUMP_TINT = clay(0.95)
/** 變出來的東西多大（黏土團的幾倍）：小老鼠 20、小豬 28（第三次的黏土大猩猩是另一個角色，跟他一樣 size 36） */
const GROW = [20 / C, 28 / C]
const MAKE = ['🐁', '🐖']
const MAKE_TINT = [clay(0.6), clay(0.62)]
/** 被拍扁：寬 1.9 倍、高 1／1.9 */
const FLAT = 1.9
/** 黏土團壓成寬寬的一團 */
const LUMP = 1.3

/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/**
 * 拍一下（每一次長得一樣）：舉高（往上拉長、往後仰）→ 往前啪地拍下去。T＝拍到的那一刻。
 * who 是誰拍、dir 是往哪邊拍（1 往右、-1 往左）、wind 是蓄力多久（第三次故意拖長）。
 */
function slap(who: string, T: number, dir: 1 | -1, wind = 0.45): Move[] {
  return [
    { at: T - wind, actor: who, do: 'squash', amount: -0.22, dur: wind },
    { at: T - wind, actor: who, do: 'tilt', amount: -12 * dir, dur: wind },
    { at: T - 0.12, actor: who, do: 'tilt', amount: 26 * dir, dur: 0.36 },
    { at: T, actor: who, do: 'squash', amount: 0.18, dur: 0.22 },
  ]
}

/**
 * 主軸：大猩猩往前跨、啪地拍黏土 →「噗」一團煙 → 黏土變成 MAKE[k]，一次比一次大。k 是第幾次（0、1、2）。
 * 回傳 end＝看完變出來的東西、可以接下一拍的時間。
 */
function make(T: number, k: number, wind = 0.45) {
  const moves: Move[] = [
    { at: T - wind - 0.1, actor: 'kong', do: 'moveTo', to: { x: HIT, y: G }, dur: 0.3, ease: 'out' },
    ...slap('kong', T, 1, wind),
    { at: T + 0.45, actor: 'kong', do: 'moveTo', to: { x: KX, y: G }, dur: 0.35, ease: 'out' },
    // 黏土被拍扁，噗——變形，長大
    { at: T, actor: 'clay', do: 'squash', amount: 0.55, dur: 0.18 },
  ]
  if (k < 2) {
    moves.push(
      { at: T + 0.16, actor: 'clay', do: 'swap', emoji: MAKE[k] },
      { at: T + 0.16, actor: 'clay', do: 'tint', filter: MAKE_TINT[k] },
      { at: T + 0.16, actor: 'clay', do: 'scaleTo', amount: GROW[k], dur: 0.3 + 0.1 * k, ease: 'back' },
      { at: T + 0.16, actor: 'clay', do: 'stretchTo', amount: 1 / LUMP, dur: 0.2 },
    )
  } else {
    // 第三次：黏土團一縮，原地長出一隻跟他一樣大的黏土大猩猩（小東西引擎會自動放大，所以另外一個 size 36 的角色）
    moves.push(
      { at: T + 0.12, actor: 'clay', do: 'vanish', dur: 0.15 },
      { at: T + 0.16, actor: 'golem', do: 'pop', dur: 0.5 },
    )
  }
  const fx: Fx[] = [
    { at: T, kind: 'burst', x: CX - 4, y: CG - 2, n: 1, dur: 0.35, scale: 1.2 + 0.3 * k },
    { at: T + 0.1, kind: 'puff', actor: 'clay', n: 8 + 5 * k, dur: 0.6 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at: T, dur: 0.35, do: 'punch', amount: 0.05 + 0.04 * k, to: { x: CX - 6, y: 60 } },
    { at: T, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.5 + 0.5 * k },
  ]
  // 同一聲「啪＋噗」，一次比一次多疊一個
  const cues: Cue[] = [{ at: T, sfx: 'plop' }, { at: T + 0.16, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: T + 0.2, sfx: 'boing' })
  if (k >= 2) cues.push({ at: T + 0.25, sfx: 'rumble' })
  return { moves, fx, camera, cues, end: T + 0.8 }
}

/** 變出來的東西縮回一團黏土（下一次之前） */
function squish(at: number, k: number): Move[] {
  return [
    { at, actor: 'clay', do: 'squash', amount: 0.5, dur: 0.2 },
    { at: at + 0.15, actor: 'clay', do: 'swap', emoji: '🟤' },
    { at: at + 0.15, actor: 'clay', do: 'tint', filter: LUMP_TINT },
    { at: at + 0.15, actor: 'clay', do: 'scaleTo', amount: 1 / GROW[k], dur: 0.2, ease: 'out' },
    { at: at + 0.15, actor: 'clay', do: 'stretchTo', amount: LUMP, dur: 0.2 },
  ]
}

const T1 = 1.25
const m1 = make(T1, 0)
const T2 = 3.15
const m2 = make(T2, 1)
// 停一拍：第三次蓄力拖好久
const W3 = 0.95
const T3 = 5.6
const m3 = make(T3, 2, W3)
// 反轉：黏土大猩猩學他，往左啪地拍下去
const T4 = 7.35
const UP = 8.25 // 彈回來
const POSE = UP + 0.35

export default scene({
  duration: 10.4,
  bg: { top: '#FFE27A', bottom: '#FFF5CF', floor: '#D99B5E', scenery: 'room' },
  actors: [
    { id: 'plant', emoji: '🪴', x: 13, y: 77 - 0.42 * 20, size: 20 },
    { id: 'paint', emoji: '🎨', x: 152, y: 77 - 0.42 * 12, size: 12 },
    { id: 'kong', emoji: '🦍', x: KX, y: G, size: S, flip: true },
    { id: 'clay', emoji: '🟤', x: CX, y: CG, size: C, tint: LUMP_TINT },
    { id: 'golem', emoji: '🦍', x: CX, y: G, size: S, tint: clay(0.95), hidden: true },
    { id: 'monkey', emoji: '🐒', x: MX, y: MG, size: M },
  ],
  moves: [
    // 開場：黏土團在地上彈一下，大猩猩搓搓手（壓一下、點頭），小猴子湊過來看
    { at: 0, actor: 'clay', do: 'stretchTo', amount: LUMP, dur: 0.01 },
    { at: 0.15, actor: 'clay', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.2, actor: 'kong', do: 'squash', amount: -0.12, dur: 0.25 },
    { at: 0.45, actor: 'kong', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.3, actor: 'monkey', do: 'moveTo', to: { x: MX - 6, y: MG }, dur: 0.4, ease: 'out' },
    // 第一次：小老鼠（吱吱跳一下）
    ...m1.moves,
    { at: T1 + 0.55, actor: 'clay', do: 'hop', amount: 3, dur: 0.25 },
    { at: T1 + 0.45, actor: 'monkey', do: 'hop', amount: 3, dur: 0.3 },
    { at: m1.end + 0.1, actor: 'kong', do: 'hop', amount: 3, dur: 0.3 },
    ...squish(2.35, 0),
    // 第二次：小豬（小猴子跳起來）
    ...m2.moves,
    { at: T2 + 0.6, actor: 'clay', do: 'hop', amount: 4, dur: 0.3 },
    { at: T2 + 0.45, actor: 'monkey', do: 'hop', amount: 6, dur: 0.35 },
    { at: m2.end + 0.1, actor: 'kong', do: 'hop', amount: 4, dur: 0.3 },
    ...squish(4.25, 1),
    // 停一拍：小猴子往後縮，大猩猩蓄力蓄好久
    { at: 4.45, actor: 'monkey', do: 'moveTo', to: { x: MX + 1, y: MG }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'monkey', do: 'squash', amount: 0.15, dur: 0.6 },
    { at: T3 - W3 - 0.1, actor: 'kong', do: 'shake', amount: 0.4, dur: W3 },
    // 第三次：一隻跟他一樣大的黏土大猩猩！他嚇得往後跳
    ...m3.moves,
    { at: T3 + 0.55, actor: 'kong', do: 'hop', amount: 5, dur: 0.3 },
    { at: T3 + 0.85, actor: 'kong', do: 'shake', amount: 0.6, dur: 0.45 },
    // 反轉：黏土大猩猩學他——舉高、往左啪地拍下去
    ...slap('golem', T4, -1, 0.5),
    { at: T4 - 0.6, actor: 'golem', do: 'moveTo', to: { x: CX - 12, y: G }, dur: 0.3, ease: 'out' },
    // 被拍扁、變形
    { at: T4, actor: 'kong', do: 'stretchTo', amount: FLAT, dur: 0.12, ease: 'out' },
    { at: T4 + 0.15, actor: 'kong', do: 'shake', amount: 0.5, dur: 0.6 },
    { at: T4 + 0.3, actor: 'golem', do: 'moveTo', to: { x: CX, y: G }, dur: 0.35, ease: 'out' },
    // 小猴子笑到跳起來
    { at: T4 + 0.2, actor: 'monkey', do: 'hop', amount: 5, dur: 0.3 },
    { at: T4 + 0.55, actor: 'monkey', do: 'hop', amount: 4, dur: 0.3 },
    // 蹦！彈回來，變得更大，拍胸脯
    { at: UP, actor: 'kong', do: 'stretchTo', amount: 1 / FLAT, dur: 0.35, ease: 'elastic' },
    { at: UP, actor: 'kong', do: 'hop', amount: 7, dur: 0.4 },
    { at: UP + 0.1, actor: 'kong', do: 'scaleTo', amount: 1.12, dur: 0.35, ease: 'back' },
    { at: POSE + 0.15, actor: 'kong', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: POSE + 0.5, actor: 'golem', do: 'shake', amount: 0.6, dur: 0.4 },
    // 小猴子跳上黏土大猩猩的背
    { at: UP + 0.05, actor: 'monkey', do: 'moveTo', to: { x: CX + 14, y: MG - 19 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: POSE + 0.6, actor: 'monkey', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    ...m1.fx,
    ...m2.fx,
    { at: 4.7, kind: 'sweat', actor: 'kong', dur: 0.8 },
    ...m3.fx,
    { at: T3 + 0.15, kind: 'burst', actor: 'golem', emoji: '✨', n: 6, dur: 0.6, scale: 1.3, dy: -6 },
    // 反轉：同一個「啪」，這次打在他身上
    { at: T4, kind: 'burst', x: KX + 4, y: 60, n: 1, dur: 0.4, scale: 2 },
    { at: T4 + 0.05, kind: 'puff', actor: 'kong', n: 14, dur: 0.8 },
    { at: T4 + 0.35, kind: 'dizzy', actor: 'kong', dur: 0.55 },
    { at: POSE, kind: 'burst', actor: 'kong', emoji: '✨', n: 10, dur: 0.9, scale: 1.4, dy: -12 },
    { at: POSE + 0.35, kind: 'burst', actor: 'kong', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4, dy: -16 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.35, to: look(90, 50, 1.35) },
    ...m1.camera,
    ...m2.camera,
    // 停一拍：慢慢推近大猩猩和黏土
    { at: T3 - W3, dur: W3, do: 'zoom', amount: 1.38, to: look(84, 52, 1.38) },
    ...m3.camera,
    // 兩隻一樣大面對面：退一點，兩隻都在畫面裡
    { at: T3 + 0.4, dur: 0.4, do: 'zoom', amount: 1.3, to: look(82, 50, 1.3) },
    // 被拍扁：讓位，扁扁的他整個在畫面裡
    { at: T4 - 0.2, dur: 0.3, do: 'zoom', amount: 1.2, to: look(80, 50, 1.2) },
    { at: T4, dur: 0.4, do: 'punch', amount: 0.1, to: { x: KX, y: 66 } },
    { at: T4, dur: 0.5, do: 'shake', amount: 1.6 },
    // 亮相
    { at: UP, dur: 0.5, do: 'zoom', amount: 1.4, to: look(78, 49, 1.4) },
  ],
  lights: [
    { at: T4, dur: 0.05, level: -0.25 },
    { at: T4 + 0.05, dur: 0.3, level: 0 },
    { at: POSE, dur: 0.05, level: -0.2 },
    { at: POSE + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.15, sfx: 'boing' },
    ...m1.cues,
    { at: 2.35, sfx: 'slide' },
    ...m2.cues,
    { at: 4.25, sfx: 'slide' },
    { at: T3 - W3, sfx: 'whoosh' },
    ...m3.cues,
    { at: T4 - 0.5, sfx: 'whoosh' },
    { at: T4, sfx: 'plop' },
    { at: T4 + 0.03, sfx: 'bonk' },
    { at: T4 + 0.06, sfx: 'deflate' },
    { at: UP, sfx: 'boing' },
    { at: POSE, say: '變形金剛' },
    { at: POSE + 0.35, sfx: 'cheer' },
  ],
})
