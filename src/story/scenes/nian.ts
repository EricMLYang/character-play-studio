import { scene } from '../scene'
import type { Actor, Clip, Fx, Move, Vec } from '../../anim/clip'
import type { Scenes } from './index'

// 年獸來了：過年的夜晚，門口掛著紅燈籠，楊捷睿開心地跳；年獸從右邊踮腳偷偷摸進來，站直、咧嘴一笑。
// 年獸吸一口氣小吼一聲，楊捷睿只是叉腰；他鼓起來再吼一聲大的，風把楊捷睿吹得往後仰——楊捷睿哈哈笑，年獸愣住，楊捷睿托下巴想辦法。
// 年獸怕什麼：紅——一條發亮的紅圍巾一揮，年獸四腳離地、噴淚逃到右邊角落縮成一團；
// 粉——一朵粉紅的花，年獸湊過來聞、冒愛心，花戴在頭上扭來扭去越扭越陶醉，最後把花一口吃掉、打一個噴花瓣的嗝，甩甩頭又兇起來；
// 黑——一頂黑帽子丟過去正好罩住眼睛，他看不見、左晃右晃差點撞到楊捷睿，倒退撞上樹，帽子飛走，頭暈坐地，甩甩頭又兇起來。
// 年獸縮在角落哭，肚子咕嚕叫、想著雞腿；楊捷睿走過去，明白了。
// 給他吃什麼：餃——一盤餃子，他抱著吃、冒愛心；糖——大棒棒糖一口咬下去，嘴巴黏住打不開，掰、用力到發抖，
// 楊捷睿幫他拔，「啵」一聲兩個都往後倒；燈——一口吞下紅燈籠，燈光暗下來、肚子從裡面發光，打嗝一下亮一下，最後「嗝」地把燈籠噴上天。
// 吃飽了，楊捷睿拿出紅圍巾，他先縮一下，圍上去以後發現沒事，站起來跳舞；爸爸媽媽也來了，放煙火、放鞭炮，大家一起跳。
//
// 年獸是 prop:nian 那一套（size 48，四周留白多，比楊捷睿大很多；48 以上引擎不放大、size × 倍率 < 50 還會被自動取景框進去）；
// 圖都朝左（頭在左邊），站在右邊剛好面向楊捷睿。楊捷睿 yang（size 24），在左邊 flip 面向右。
// 每一頁都有：左邊的房子、屋簷下與天上的紅燈籠（發亮）、右邊的樹。
// W1（等他選「年獸怕什麼」）：楊捷睿 x 54 托下巴想（ponder）；年獸 x 110 站著咧嘴笑（prop:nian）。
// W2（等他選「給他吃什麼」）：楊捷睿 x 90 舉手「我知道」（know）；年獸 x 130 縮成一團摀耳朵（nian-ears）。
// 紅的結尾＝哭的開頭：楊捷睿 x 54 叉腰（smug），年獸 x 130 縮成一團。餃的結尾＝不怕紅的開頭：楊捷睿 x 90 開心，年獸 x 130 抱著餃子吃。
// 不怕紅的結尾＝一起過年的開頭：楊捷睿 x 96，年獸 x 130 圍著紅圍巾跳舞（nian-dance 圖裡有圍巾，只在圍上以後用）。
type Cue = Clip['cues'][number]
const BG = { top: '#2E2C78', bottom: '#8C6CC0', floor: '#5D6F8E', scenery: 'night' as const }

const K = 24
const KG = 77 - 0.42 * K
const KX = 54
const KX2 = 90
const S = 48
const NG = 77 - 0.42 * S
const NX = 110
const NC = 130

/** 年獸圖上的一點（u、v 是圖的幾分之幾）在舞台上的位置：站在 x、朝左 */
const pt = (x: number, u: number, v: number): Vec => ({ x: +(x + (u - 0.5) * S).toFixed(1), y: +(NG + (v - 0.5) * S).toFixed(1) })
/** 各姿勢的嘴巴（照圖量的） */
const mouthGrin = (x: number) => pt(x, 0.35, 0.46)
const mouthRoar = (x: number) => pt(x, 0.36, 0.66)
const mouthEars = (x: number) => pt(x, 0.38, 0.6)

// 紅色的東西在夜色裡要亮：金色描邊＋光暈
const GLOW = 'saturate(1.2) drop-shadow(0 0 1px #FFF6C8) drop-shadow(0 0 3px #FFC83A)'
/** 紅圍巾：3D 圖是桃紅、流蘇亮粉紅，跟「粉」的花分不開。先 sepia 變成單色，再把色相推到正紅、壓暗加對比，
 *  跟 nian-dance 圖裡那條圍巾一樣的正紅；外面只加金黃色的光 */
const SCARF = 'sepia(1) saturate(6) hue-rotate(-45deg) brightness(.75) contrast(1.4) drop-shadow(0 0 1px #FFF6C8) drop-shadow(0 0 3px #FFC83A)'
/** 燈籠一律是金黃色（他怕紅，紅燈籠說不通）：sepia 變單色再推成暖黃、提亮，光也是暖黃 */
const GOLD = 'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.2)'
const LAN_ON = `${GOLD} drop-shadow(0 0 2px #FFE08A) drop-shadow(0 0 5px #FFB52E)`
const PINK = 'brightness(1.1) drop-shadow(0 0 1px #FFFFFF) drop-shadow(0 0 4px #FF9AD5)'
/** 黑帽子：3D 圖是深紫灰、帽帶亮粉紅，整頂去色壓成真的黑，外面一圈淺色描邊才看得到輪廓 */
const HAT = 'grayscale(1) contrast(1.2) brightness(.3) drop-shadow(0 0 1px #FFFFFF) drop-shadow(0 0 2px #E8E8F0)'
const RING = '#FFD23A'

/** 每一頁都在的背景：房子、屋簷下與天上的紅燈籠、右邊的樹 */
const decor: Actor[] = [
  { id: 'house', emoji: '🏠', x: 14, y: 77 - 0.42 * 32, size: 32, tint: 'brightness(.85)' },
  { id: 'tree', emoji: '🌲', x: 156, y: 77 - 0.42 * 34, size: 34, tint: 'brightness(.7)' },
  { id: 'lan0', emoji: '🏮', x: 33, y: 49, size: 9, float: true, tint: LAN_ON },
  { id: 'lan1', emoji: '🏮', x: 50, y: 13, size: 8, float: true, tint: LAN_ON },
  { id: 'lan2', emoji: '🏮', x: 88, y: 11, size: 8, float: true, tint: LAN_ON },
  { id: 'lan3', emoji: '🏮', x: 152, y: 20, size: 8, float: true, tint: LAN_ON },
]

const N = (pose: string) => (pose === 'nian' ? 'prop:nian' : `prop:nian-${pose}`)
const kid = (pose: string, x = KX, more: Partial<Actor> = {}): Actor => ({ id: 'yang', emoji: `hero:yang/${pose}`, x, y: KG, size: K, flip: true, ...more })
const nian = (pose: string, x = NX, more: Partial<Actor> = {}): Actor => ({ id: 'nian', emoji: N(pose), x, y: NG, size: S, ...more })
const ks = (at: number, pose: string): Move => ({ at, actor: 'yang', do: 'swap', emoji: `hero:yang/${pose}` })
const ns = (at: number, pose: string): Move => ({ at, actor: 'nian', do: 'swap', emoji: N(pose) })

/** 吼的聲波：以嘴巴為中心、一圈一圈往左的「(」弧 */
function rings(at: number, c: Vec, radii: number[], width: number, dur: number): Fx[] {
  return radii.flatMap((r, i) => [false, true].map((low): Fx => ({
    at: at + i * 0.06, dur, kind: 'swoosh', x: c.x, y: c.y, to: { x: c.x - 200, y: c.y }, n: r, sweep: -25, low,
    width: width * (1 - 0.3 * (i / Math.max(1, radii.length - 1))), color: RING,
  })))
}

/** 燈籠輕輕晃（背景一直有一點點動） */
const sway = (t0: number, dur: number): Move[] =>
  ['lan0', 'lan1', 'lan2', 'lan3'].flatMap((id, i) => {
    const out: Move[] = []
    for (let t = t0 + 0.3 * i; t < t0 + dur - 0.8; t += 1.6) out.push({ at: +t.toFixed(2), actor: id, do: 'hop', amount: 1, dur: 0.8 })
    return out
  })

/** 黑帽子罩在年獸（prop:nian，站在 x、從腳底歪 deg 度）頭上、蓋住眼睛的位置：從腳底 (x, 77) 往上 30、往左 6，跟著身體一起轉 */
const hatOn = (x: number, deg = 0): Vec => {
  const r = (deg * Math.PI) / 180, dx = -6, dy = -30.2
  return { x: +(x + dx * Math.cos(r) - dy * Math.sin(r)).toFixed(1), y: +(77 + dx * Math.sin(r) + dy * Math.cos(r)).toFixed(1) }
}
/** 戴著帽子看不見、東倒西歪地走：身體從腳底歪來歪去，帽子跟著頭一起走、一起歪（[時間, 走到 x, 歪幾度]） */
const wobble = (steps: [number, number, number][], dur = 0.45): Move[] => {
  let prev = 0
  return steps.flatMap(([at, x, deg]): Move[] => {
    const d = deg - prev
    prev = deg
    return [
      { at, actor: 'nian', do: 'moveTo', to: { x, y: NG }, arc: 1, dur },
      { at, actor: 'nian', do: 'rotateTo', amount: d, dur },
      { at, actor: 'hat', do: 'moveTo', to: hatOn(x, deg), arc: 1, dur },
      { at, actor: 'hat', do: 'rotateTo', amount: d, dur },
    ]
  })
}
/** 大棒棒糖（size 24、flip：糖在右上、棍子往左下）。lollyAt：糖的中心（圖上 0.62、0.37）在 m */
const LOLLY = 24
const lollyAt = (m: Vec): Vec => ({ x: +(m.x - 0.12 * LOLLY).toFixed(1), y: +(m.y + 0.13 * LOLLY).toFixed(1) })
/** 咬住以後黏在嘴上的那支（另一個角色，size 9，引擎會放大成 11 左右）：彩色的糖剛好蓋住嘴巴、棍子朝楊捷睿那邊斜下來 */
const STUCK = 9
const stuckAt = (m: Vec): Vec => ({ x: +(m.x - 0.12 * STUCK).toFixed(1), y: +(m.y + 0.13 * STUCK + 3).toFixed(1) })
const mouthShock = (x: number) => pt(x, 0.37, 0.6)
/** 拔河：楊捷睿拉著棍子，年獸跟糖往反方向拉；dx 正的是年獸贏（往右、把楊捷睿拖過去），負的是楊捷睿贏 */
const tug = (steps: [number, number][]): Move[] => steps.flatMap(([at, dx]): Move[] => [
  { at, actor: 'nian', do: 'moveTo', to: { x: NC + dx, y: NG }, dur: 0.28 },
  { at, actor: 'stuck', do: 'moveTo', to: { x: stuckAt(mouthGrin(NC)).x + dx, y: stuckAt(mouthGrin(NC)).y }, dur: 0.28 },
  { at, actor: 'yang', do: 'moveTo', to: { x: 104 + dx, y: KG }, dur: 0.28 },
  { at, actor: 'yang', do: 'shake', amount: 0.5, dur: 0.28 },
])
/** 吞下燈籠以後肚子發光的地方（prop:nian 站在角落） */
const BELLY = pt(NC, 0.47, 0.74)
/** 打嗝：整隻跳一下，肚子裡的光跟著跳、亮一下、光暈變大 */
const hic = (at: number, h: number, k: number): Move[] => [
  { at, actor: 'nian', do: 'hop', amount: h, dur: 0.3 },
  { at, actor: 'halo', do: 'hop', amount: h, dur: 0.3 },
  { at, actor: 'glow', do: 'hop', amount: h, dur: 0.3 },
  { at, actor: 'glow', do: 'flash', dur: 0.35 },
  { at, actor: 'halo', do: 'scaleTo', amount: k, dur: 0.12 },
  { at: at + 0.15, actor: 'halo', do: 'scaleTo', amount: 1 / k, dur: 0.3 },
]

/** 換頁時鏡頭不跳：每一段開頭、結尾都定在（幾乎）全景，中間交給自動取景 */
type Cam = NonNullable<Clip['camera']>[number]
const holdWide = (at: number, dur = 0.5): Cam => ({ at, dur, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } })
const release = (at: number, dur = 0.6): Cam => ({ at, dur, do: 'zoom', amount: 1 })
const START = holdWide(-0.3, 0.01)
const frame = (duration: number, rel = 0.5): Cam[] => [START, release(rel), holdWide(duration - 0.8, 0.5)]

const scenes: Scenes = {
  // 過年的夜晚，年獸來了！——楊捷睿在燈籠下開心地跳；年獸踮腳偷偷摸進來，站直、咧嘴一笑，楊捷睿嚇一跳
  night: scene({
    duration: 4.4,
    bg: BG,
    actors: [...decor, kid('happy'), nian('sneak', 182)],
    moves: [
      ...sway(0, 4.4),
      { at: 0.1, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
      { at: 0.55, actor: 'yang', do: 'hop', amount: 5, dur: 0.4 },
      // 踮腳：一步一小跳
      { at: 0.4, actor: 'nian', do: 'moveTo', to: { x: 116, y: NG }, dur: 1.6, ease: 'linear' },
      ...[0, 1, 2, 3, 4, 5].map((i): Move => ({ at: +(0.42 + 0.265 * i).toFixed(2), actor: 'nian', do: 'hop', amount: 2.2, dur: 0.24 })),
      ks(1.1, 'idle'),
      { at: 1.15, actor: 'yang', do: 'tilt', amount: -6, dur: 0.6 },
      // 停一下……站直、往前一步：嘿嘿
      { at: 2.0, actor: 'nian', do: 'squash', amount: 0.15, dur: 0.3 },
      ns(2.3, 'nian'),
      { at: 2.3, actor: 'nian', do: 'moveTo', to: { x: NX, y: NG }, dur: 0.35, ease: 'back', anticipate: 3 },
      { at: 2.3, actor: 'nian', do: 'squash', amount: -0.18, dur: 0.4 },
      ks(2.45, 'surprised'),
      { at: 2.45, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 3.1, actor: 'nian', do: 'tilt', amount: -6, dur: 0.35 },
      { at: 3.45, actor: 'nian', do: 'tilt', amount: 6, dur: 0.35 },
      { at: 3.9, actor: 'nian', do: 'hop', amount: 2, dur: 0.3 },
    ],
    fx: [
      { at: 0.15, kind: 'burst', actor: 'yang', emoji: '✨', n: 6, dur: 0.8, scale: 0.8 },
      { at: 2.45, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.8 },
      { at: 3.1, kind: 'pop', actor: 'nian', emoji: '😈', dur: 1.0 },
    ],
    camera: [...frame(4.4), { at: 2.3, dur: 0.35, do: 'punch', amount: 0.05, to: { x: 104, y: 52 } }],
    cues: [
      { at: 0.1, sfx: 'cheer' },
      ...[0, 2, 4].map((i): Cue => ({ at: +(0.42 + 0.265 * i).toFixed(2), sfx: 'tap' })),
      { at: 0.9, say: '過年的夜晚，年獸來了！' },
      { at: 2.3, sfx: 'boing' },
    ],
  }),

  // 年獸大叫！楊捷睿不怕！——小吼一聲，楊捷睿叉腰；鼓起來大吼，楊捷睿被吹得往後仰，卻哈哈笑；年獸愣住，楊捷睿托下巴想（W1）
  roar: scene({
    duration: 4.9,
    bg: BG,
    actors: [...decor, kid('surprised'), nian('nian')],
    moves: [
      ...sway(0.5, 4.4),
      { at: 0.15, actor: 'nian', do: 'squash', amount: -0.15, dur: 0.35 },
      ns(0.5, 'roar'),
      { at: 0.5, actor: 'nian', do: 'squash', amount: 0.15, dur: 0.22 },
      { at: 0.55, actor: 'nian', do: 'shake', amount: 0.5, dur: 0.5 },
      ks(0.7, 'smug'),
      { at: 0.6, actor: 'yang', do: 'tilt', amount: -5, dur: 0.4 },
      ns(1.15, 'nian'),
      // 不怕？再一次，大的
      { at: 1.3, actor: 'nian', do: 'scaleTo', amount: 1.1, dur: 0.5 },
      { at: 1.3, actor: 'nian', do: 'squash', amount: -0.25, dur: 0.5 },
      ns(1.8, 'roar'),
      { at: 1.8, actor: 'nian', do: 'scaleTo', amount: 1 / 1.1, dur: 0.3 },
      { at: 1.8, actor: 'nian', do: 'squash', amount: 0.22, dur: 0.25 },
      { at: 1.85, actor: 'nian', do: 'shake', amount: 1.1, dur: 0.85 },
      // 風把他吹得往後仰，腳還站得穩穩的
      { at: 1.85, actor: 'yang', do: 'tilt', amount: -16, dur: 0.9 },
      { at: 1.9, actor: 'yang', do: 'shake', amount: 0.6, dur: 0.8 },
      ns(2.75, 'nian'),
      ks(2.8, 'laugh'),
      { at: 2.85, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.2, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      // 年獸愣住
      { at: 3.1, actor: 'nian', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 3.75, actor: 'nian', do: 'squash', amount: 0.1, dur: 0.3 },
      ks(4.1, 'ponder'),
    ],
    fx: [
      ...rings(0.52, mouthRoar(NX), [6, 11, 16], 2, 0.45),
      ...rings(1.82, mouthRoar(NX), [7, 14, 21, 28, 35], 3.2, 0.6),
      ...rings(2.25, mouthRoar(NX), [7, 14, 21, 28, 35], 2.6, 0.5),
      { at: 1.85, kind: 'blow', actor: 'nian', dx: -10, dy: 14, target: 'yang', n: 5, dur: 0.9 },
      { at: 2.85, kind: 'pop', actor: 'yang', emoji: '😆', dur: 1.0 },
      { at: 3.15, kind: 'pop', actor: 'nian', emoji: '❓', dur: 0.9 },
      { at: 3.4, kind: 'sweat', actor: 'nian', dur: 0.7 },
    ],
    camera: [
      ...frame(4.9, 0.3),
      { at: 0.52, dur: 0.35, do: 'shake', amount: 0.4 },
      { at: 1.82, dur: 0.35, do: 'punch', amount: 0.06, to: { x: 100, y: 56 } },
      { at: 1.82, dur: 0.8, do: 'shake', amount: 1.1 },
    ],
    cues: [
      { at: 0.5, sfx: 'rumble' },
      { at: 1.3, sfx: 'bubble' },
      { at: 1.8, sfx: 'rumble' },
      { at: 1.8, say: '年獸大叫！楊捷睿不怕！' },
      { at: 3.15, sfx: 'blip' },
    ],
  }),

  // 年獸好怕紅的！他跑了！——楊捷睿舉起發亮的紅圍巾一揮；年獸四腳離地、抖、噴淚往右逃，縮在角落摀耳朵發抖
  'scare:紅': scene({
    duration: 4.9,
    bg: BG,
    actors: [...decor, kid('ponder'), nian('nian'), { id: 'scarf', emoji: '🧣', x: 67, y: 44, size: 16, hidden: true, float: true, tint: SCARF, pivot: 'center' }],
    moves: [
      ...sway(0, 4.9),
      ks(0.05, 'know'),
      { at: 0.1, actor: 'scarf', do: 'pop', dur: 0.3 },
      // 揮兩下
      ks(0.55, 'throw'),
      { at: 0.55, actor: 'scarf', do: 'tilt', amount: 28, dur: 0.3 },
      { at: 0.85, actor: 'scarf', do: 'tilt', amount: -28, dur: 0.3 },
      { at: 1.15, actor: 'scarf', do: 'tilt', amount: 28, dur: 0.3 },
      // 嚇到四腳離地
      ns(0.9, 'shock'),
      { at: 0.9, actor: 'nian', do: 'hop', amount: 12, dur: 0.55 },
      { at: 0.95, actor: 'nian', do: 'shake', amount: 1, dur: 0.5 },
      { at: 1.5, actor: 'nian', do: 'shake', amount: 1.3, dur: 0.45 },
      // 逃到右邊角落
      ns(2.0, 'flee'),
      { at: 2.0, actor: 'nian', do: 'flip' },
      { at: 2.0, actor: 'nian', do: 'moveTo', to: { x: NC, y: NG }, dur: 0.55, ease: 'in', anticipate: 3 },
      ns(2.6, 'ears'),
      { at: 2.6, actor: 'nian', do: 'flip' },
      { at: 2.6, actor: 'nian', do: 'squash', amount: 0.2, dur: 0.25 },
      { at: 2.85, actor: 'nian', do: 'shake', amount: 0.8, dur: 0.8 },
      { at: 3.9, actor: 'nian', do: 'shake', amount: 0.6, dur: 0.7 },
      // 他跑了：再揮一下，圍巾收起來，哈哈笑
      { at: 2.2, actor: 'scarf', do: 'tilt', amount: 28, dur: 0.3 },
      { at: 2.75, actor: 'scarf', do: 'moveTo', to: { x: 56, y: 64 }, dur: 0.3 },
      { at: 2.75, actor: 'scarf', do: 'scaleTo', amount: 0.4, dur: 0.3 },
      { at: 3.05, actor: 'scarf', do: 'vanish', dur: 0.12 },
      ks(3.05, 'laugh'),
      { at: 3.1, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.5, actor: 'yang', do: 'hop', amount: 2, dur: 0.25 },
      ks(4.0, 'smug'),
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'scarf', emoji: '✨', n: 6, dur: 0.6, scale: 0.8 },
      { at: 0.55, kind: 'swoosh', actor: 'scarf', dy: 10, to: { x: 120, y: 45 }, n: 12, color: '#FF4A4A', width: 2.2, dur: 0.3 },
      { at: 0.85, kind: 'swoosh', actor: 'scarf', dy: 10, to: { x: 120, y: 45 }, n: 14, color: '#FF4A4A', width: 2.6, dur: 0.3 },
      { at: 1.15, kind: 'swoosh', actor: 'scarf', dy: 10, to: { x: 120, y: 45 }, n: 16, color: '#FF4A4A', width: 3, dur: 0.3 },
      { at: 0.95, kind: 'pop', actor: 'nian', emoji: '❗', dx: -8, dur: 0.8 },
      { at: 1.0, kind: 'sweat', actor: 'nian', dur: 0.9 },
      { at: 2.0, kind: 'burst', actor: 'nian', emoji: '💧', n: 5, dx: -6, dy: 6, dur: 0.6, scale: 0.8 },
      { at: 2.65, kind: 'puff', actor: 'nian', n: 5, dur: 0.45 },
      { at: 2.9, kind: 'sweat', actor: 'nian', dur: 0.8 },
      { at: 3.1, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.9 },
    ],
    camera: [...frame(4.9, 0.3), { at: 0.9, dur: 0.4, do: 'shake', amount: 0.8 }, { at: 2.6, dur: 0.25, do: 'shake', amount: 0.6 }],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 0.55, sfx: 'whoosh' },
      { at: 0.9, sfx: 'boing' },
      { at: 1.0, say: '年獸好怕紅的！他跑了！' },
      { at: 2.0, sfx: 'whoosh' },
      { at: 2.6, sfx: 'bonk' },
    ],
  }),

  // 不怕粉的！他愛粉的花！——湊過來聞，冒愛心；花戴在頭上扭來扭去越扭越陶醉；最後把花一口吃掉、打一個噴花瓣的嗝，甩甩頭又兇起來（回到 W1）
  'scare:粉': scene({
    duration: 6.8,
    bg: BG,
    actors: [...decor, kid('ponder'), nian('nian'), { id: 'flower', emoji: '🌸', x: 69, y: 45, size: 13, hidden: true, float: true, tint: PINK, pivot: 'center' }],
    moves: [
      ...sway(0, 6.8),
      ks(0.05, 'know'),
      { at: 0.1, actor: 'flower', do: 'pop', dur: 0.3 },
      ks(0.5, 'reach'),
      { at: 0.5, actor: 'flower', do: 'moveTo', to: { x: 68, y: 57 }, dur: 0.3 },
      // 湊過來聞
      ns(0.5, 'sneak'),
      { at: 0.5, actor: 'nian', do: 'moveTo', to: { x: 94, y: NG }, dur: 0.6 },
      { at: 1.15, actor: 'nian', do: 'squash', amount: -0.08, dur: 0.2 },
      { at: 1.4, actor: 'nian', do: 'squash', amount: -0.1, dur: 0.2 },
      // 好香！站起來冒愛心
      ns(1.7, 'nian'),
      { at: 1.7, actor: 'nian', do: 'hop', amount: 4, dur: 0.35 },
      // 花戴到頭上
      ks(2.05, 'happy'),
      { at: 2.05, actor: 'flower', do: 'moveTo', to: { x: 84, y: 39 }, arc: 8, dur: 0.4 },
      { at: 2.05, actor: 'flower', do: 'spin', times: 1, dur: 0.4 },
      // 扭來扭去，一次比一次大
      ...[0, 1, 2, 3].flatMap((i): Move[] => {
        const at = +(2.55 + 0.4 * i).toFixed(2)
        const dx = (i % 2 ? 1 : -1) * (1.5 + i)
        const h = 2.5 + 1.8 * i
        return [
          { at, actor: 'nian', do: 'moveTo', to: { x: 94 + dx, y: NG }, dur: 0.35 },
          { at, actor: 'flower', do: 'moveTo', to: { x: 84 + dx, y: 39 }, dur: 0.35 },
          { at, actor: 'nian', do: 'hop', amount: h, dur: 0.35 },
          { at, actor: 'flower', do: 'hop', amount: h, dur: 0.35 },
        ]
      }),
      { at: 4.15, actor: 'nian', do: 'moveTo', to: { x: 94, y: NG }, dur: 0.2 },
      { at: 4.15, actor: 'flower', do: 'moveTo', to: { x: 84, y: 39 }, dur: 0.2 },
      // 花掉到嘴前面——啊嗚，吃掉了
      { at: 4.35, actor: 'flower', do: 'moveTo', to: { x: mouthRoar(94).x - 3, y: mouthRoar(94).y - 4 }, dur: 0.22, ease: 'in' },
      { at: 4.35, actor: 'flower', do: 'spin', times: 1, dur: 0.22 },
      ns(4.55, 'roar'),
      { at: 4.85, actor: 'flower', do: 'vanish', dur: 0.08 },
      ns(4.85, 'nian'),
      { at: 4.85, actor: 'nian', do: 'squash', amount: 0.25, dur: 0.3 },
      ks(4.9, 'surprised'),
      { at: 5.2, actor: 'nian', do: 'hop', amount: 3, dur: 0.25 },
      // 甩甩頭，又兇起來，走回原位
      { at: 5.5, actor: 'nian', do: 'tilt', amount: 10, dur: 0.18 },
      { at: 5.68, actor: 'nian', do: 'tilt', amount: -10, dur: 0.18 },
      { at: 5.9, actor: 'nian', do: 'moveTo', to: { x: NX, y: NG }, dur: 0.4 },
      { at: 5.9, actor: 'nian', do: 'squash', amount: -0.12, dur: 0.4 },
      ks(6.0, 'ponder'),
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'flower', emoji: '✨', n: 6, dur: 0.6, scale: 0.7 },
      { at: 1.15, kind: 'burst', actor: 'flower', emoji: '💕', n: 3, dy: 4, dur: 0.5, scale: 0.6 },
      { at: 1.75, kind: 'burst', actor: 'nian', emoji: '💕', n: 8, dur: 0.9, scale: 1.1 },
      { at: 1.8, kind: 'pop', actor: 'nian', emoji: '😍', dx: -10, dur: 1.0 },
      { at: 2.55, kind: 'zzz', actor: 'nian', emoji: '🎵', dx: 4, dur: 1.7 },
      { at: 3.4, kind: 'burst', actor: 'nian', emoji: '💖', n: 6, dur: 0.8 },
      { at: 5.2, kind: 'burst', x: mouthGrin(94).x - 2, y: mouthGrin(94).y, emoji: '🌸', n: 7, dur: 0.8, scale: 1.1 },
      { at: 4.95, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.7 },
      { at: 6.0, kind: 'pop', actor: 'nian', emoji: '😤', dx: -10, dur: 0.6 },
    ],
    camera: [...frame(6.8, 0.3)],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 1.15, sfx: 'tap' },
      { at: 1.4, sfx: 'tap' },
      { at: 1.2, say: '不怕粉的！他愛粉的花！' },
      { at: 2.05, sfx: 'whoosh' },
      { at: 4.85, sfx: 'gulp' },
      { at: 5.2, sfx: 'hic' },
      { at: 5.9, sfx: 'rumble' },
    ],
  }),

  // 不怕黑的！可是他看不見了！——黑帽子飛過去罩住眼睛；左晃右晃差點撞到楊捷睿，倒退撞上樹，帽子飛走，頭暈坐地，甩甩頭又兇起來（回到 W1）
  'scare:黑': scene({
    duration: 6.4,
    bg: BG,
    actors: [...decor, kid('ponder'), nian('nian'), { id: 'hat', emoji: '🎩', x: 71, y: 40, size: 24, hidden: true, float: true, tint: HAT, pivot: 'center' }],
    moves: [
      ...sway(0, 6.4),
      ks(0.05, 'throw'),
      { at: 0.1, actor: 'hat', do: 'pop', dur: 0.2 },
      { at: 0.35, actor: 'hat', do: 'moveTo', to: hatOn(NX), arc: 14, dur: 0.4 },
      { at: 0.35, actor: 'hat', do: 'spin', times: 1, dur: 0.4 },
      { at: 0.75, actor: 'hat', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 0.75, actor: 'nian', do: 'squash', amount: 0.15, dur: 0.25 },
      ks(0.8, 'idle'),
      // 看不見：左晃右晃（帽子跟著頭）
      ...wobble([[1.3, 96, -12], [1.85, 122, 12], [2.4, 100, -15]]),
      // 差點撞到他：往後一跳躲開
      ks(1.4, 'surprised'),
      { at: 1.45, actor: 'yang', do: 'moveTo', to: { x: 44, y: KG }, arc: 4, dur: 0.3 },
      ks(2.0, 'giggle'),
      // 倒退——咚！撞上樹
      { at: 2.95, actor: 'nian', do: 'moveTo', to: { x: 132, y: NG }, arc: 1, dur: 0.4, ease: 'in' },
      { at: 2.95, actor: 'nian', do: 'rotateTo', amount: 15, dur: 0.3 },
      { at: 2.95, actor: 'hat', do: 'moveTo', to: hatOn(132), arc: 1, dur: 0.4, ease: 'in' },
      { at: 2.95, actor: 'hat', do: 'rotateTo', amount: 15, dur: 0.3 },
      ns(3.35, 'shock'),
      { at: 3.35, actor: 'nian', do: 'moveTo', to: { x: 124, y: NG }, arc: 8, dur: 0.45, ease: 'out' },
      { at: 3.35, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 3.35, actor: 'tree', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 3.35, actor: 'hat', do: 'moveTo', to: { x: 176, y: -12 }, arc: 10, dur: 0.6, ease: 'out' },
      { at: 3.35, actor: 'hat', do: 'spin', times: 2, dur: 0.6 },
      { at: 3.95, actor: 'hat', do: 'vanish', dur: 0.05 },
      ns(3.8, 'dizzy'),
      ks(3.6, 'laugh'),
      { at: 3.7, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      // 甩甩頭，又兇起來，走回原位
      { at: 4.7, actor: 'nian', do: 'tilt', amount: 10, dur: 0.2 },
      { at: 4.9, actor: 'nian', do: 'tilt', amount: -10, dur: 0.2 },
      ns(5.15, 'nian'),
      { at: 5.15, actor: 'nian', do: 'moveTo', to: { x: NX, y: NG }, dur: 0.45 },
      { at: 5.15, actor: 'nian', do: 'squash', amount: -0.12, dur: 0.4 },
      ks(5.0, 'walk'),
      { at: 5.0, actor: 'yang', do: 'moveTo', to: { x: KX, y: KG }, dur: 0.45 },
      ks(5.5, 'ponder'),
    ],
    fx: [
      { at: 0.75, kind: 'burst', actor: 'hat', emoji: '💫', n: 4, dur: 0.5, scale: 0.7 },
      { at: 1.0, kind: 'pop', actor: 'nian', emoji: '❓', dx: -8, dy: -4, dur: 1.0 },
      { at: 1.5, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.6 },
      { at: 2.05, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.9 },
      { at: 3.35, kind: 'burst', x: 146, y: 56, emoji: '💥', n: 1, dur: 0.4, scale: 1.3 },
      { at: 3.4, kind: 'burst', actor: 'tree', emoji: '⭐', n: 6, dur: 0.7, scale: 0.9 },
      { at: 3.85, kind: 'dizzy', actor: 'nian', dur: 0.9 },
      { at: 5.4, kind: 'pop', actor: 'nian', emoji: '😤', dx: -10, dur: 0.6 },
    ],
    camera: [...frame(6.4, 0.3), { at: 0.75, dur: 0.25, do: 'shake', amount: 0.4 }, { at: 3.35, dur: 0.4, do: 'shake', amount: 1.4 }],
    cues: [
      { at: 0.35, sfx: 'whoosh' },
      { at: 0.75, sfx: 'plop' },
      { at: 0.9, say: '不怕黑的！可是他看不見了！' },
      { at: 1.3, sfx: 'tap' },
      { at: 1.85, sfx: 'tap' },
      { at: 2.4, sfx: 'tap' },
      { at: 3.35, sfx: 'bonk' },
      { at: 3.8, sfx: 'plop' },
      { at: 5.15, sfx: 'rumble' },
    ],
  }),

  // 年獸哭了。他只是好餓。——縮在角落哭，肚子咕嚕叫、想著吃的；楊捷睿走過去，明白了（W2）
  cry: scene({
    duration: 4.9,
    bg: BG,
    actors: [...decor, kid('smug'), nian('ears', NC)],
    moves: [
      ...sway(0, 4.9),
      { at: 0.05, actor: 'nian', do: 'shake', amount: 0.6, dur: 0.6 },
      { at: 0.75, actor: 'nian', do: 'squash', amount: 0.1, dur: 0.25 },
      { at: 1.05, actor: 'nian', do: 'squash', amount: 0.1, dur: 0.25 },
      ks(0.35, 'surprised'),
      { at: 0.4, actor: 'yang', do: 'hop', amount: 2, dur: 0.25 },
      // 咕嚕——
      { at: 1.6, actor: 'nian', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: 1.6, actor: 'nian', do: 'shake', amount: 1.1, dur: 0.45 },
      ks(2.0, 'walk'),
      { at: 2.0, actor: 'yang', do: 'moveTo', to: { x: KX2, y: KG }, dur: 0.8 },
      ks(2.85, 'know'),
      { at: 2.85, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      // 咕嚕嚕——更大聲
      { at: 3.4, actor: 'nian', do: 'squash', amount: 0.32, dur: 0.35 },
      { at: 3.4, actor: 'nian', do: 'shake', amount: 1.5, dur: 0.5 },
      { at: 4.1, actor: 'nian', do: 'shake', amount: 0.5, dur: 0.7 },
    ],
    fx: [
      ...[0.05, 0.95, 3.4].flatMap((at): Fx[] => [
        { at, kind: 'fountain', actor: 'nian', emoji: '💧', n: 7, dur: 0.9, scale: 1.2, dx: -12, dy: 10 },
        { at: at + 0.1, kind: 'fountain', actor: 'nian', emoji: '💧', n: 7, dur: 0.9, scale: 1.2, dx: 2, dy: 10 },
      ]),
      { at: 0.45, kind: 'pop', actor: 'yang', emoji: '❓', dur: 0.8 },
      { at: 1.6, kind: 'burst', x: NC + 2, y: 66, emoji: '💢', n: 1, dur: 0.4, scale: 0.6 },
      { at: 1.7, kind: 'bubble', actor: 'nian', emoji: '🍗', dx: -24, dy: 7, dur: 2.9, scale: 1.5 },
      { at: 2.9, kind: 'pop', actor: 'yang', emoji: '💡', dur: 1.0 },
      { at: 3.4, kind: 'burst', x: NC + 2, y: 66, emoji: '💢', n: 1, dur: 0.45, scale: 0.8 },
      { at: 2.3, kind: 'sweat', actor: 'nian', dur: 0.8 },
    ],
    camera: [...frame(4.9, 0.3), { at: 1.6, dur: 0.3, do: 'shake', amount: 0.4 }, { at: 3.4, dur: 0.35, do: 'shake', amount: 0.7 }],
    cues: [
      { at: 0.5, say: '年獸哭了。他只是好餓。' },
      { at: 1.6, sfx: 'rumble' },
      { at: 2.85, sfx: 'blip' },
      { at: 3.4, sfx: 'rumble' },
    ],
  }),

  // 好吃的餃子！年獸笑了！——一盤熱騰騰的餃子端到面前，他抱著一口一口吃，冒愛心、笑
  'feed:餃': scene({
    duration: 4.6,
    bg: BG,
    actors: [...decor, kid('know', KX2), nian('ears', NC), { id: 'plate', emoji: 'prop:dumpling-plate', x: 102, y: 67, size: 14, hidden: true, float: true }],
    moves: [
      ...sway(0, 4.6),
      ks(0.05, 'reach'),
      { at: 0.1, actor: 'plate', do: 'pop', dur: 0.3 },
      { at: 0.45, actor: 'nian', do: 'hop', amount: 2, dur: 0.25 },
      { at: 0.55, actor: 'plate', do: 'moveTo', to: { x: 120, y: 66 }, dur: 0.4, ease: 'out' },
      { at: 0.95, actor: 'plate', do: 'vanish', dur: 0.05 },
      ns(0.95, 'eat'),
      ...[1.3, 1.65, 2.0, 2.9, 3.3, 3.7].map((at): Move => ({ at, actor: 'nian', do: 'squash', amount: 0.1, dur: 0.22 })),
      { at: 2.3, actor: 'nian', do: 'hop', amount: 4, dur: 0.35 },
      ks(1.3, 'giggle'),
      ks(2.4, 'happy'),
      { at: 2.45, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
      { at: 2.95, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'plate', emoji: '✨', n: 6, dur: 0.6, scale: 0.7 },
      { at: 0.45, kind: 'pop', actor: 'nian', emoji: '❗', dx: -8, dur: 0.5 },
      { at: 1.0, kind: 'burst', actor: 'nian', emoji: '💕', n: 5, dur: 0.7, scale: 0.8 },
      { at: 2.3, kind: 'burst', actor: 'nian', emoji: '💖', n: 9, dur: 1.0, scale: 1.2 },
      { at: 2.4, kind: 'pop', actor: 'nian', emoji: '😋', dx: -12, dur: 1.4 },
      { at: 3.3, kind: 'burst', actor: 'nian', emoji: '💕', n: 6, dur: 0.8 },
    ],
    camera: [...frame(4.6, 0.3)],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 0.95, sfx: 'gulp' },
      { at: 1.65, sfx: 'gulp' },
      { at: 1.0, say: '好吃的餃子！年獸笑了！' },
      { at: 2.3, sfx: 'cheer' },
      { at: 3.3, sfx: 'gulp' },
    ],
  }),

  // 好甜的糖！他的嘴打不開了！——一口咬下大棒棒糖，彩色的糖黏在嘴上、棍子伸出來：
  // 甩頭（糖跟著甩）→ 嚇得跳起來、糖被拉得長長的又彈回來 → 楊捷睿抓住棍子拔河，「啵」兩個都往後倒、坐在地上停一下（回到 W2）
  'feed:糖': scene({
    duration: 7.4,
    bg: BG,
    actors: [
      ...decor, kid('know', KX2), nian('ears', NC),
      { id: 'lolly', emoji: '🍭', x: 106, y: 61, size: LOLLY, hidden: true, float: true, flip: true, tint: GLOW },
      { id: 'stuck', emoji: '🍭', ...stuckAt(mouthGrin(NC)), size: STUCK, hidden: true, float: true, flip: true, tint: GLOW, pivot: 'center' },
    ],
    moves: [
      ...sway(0, 7.4),
      ks(0.05, 'reach'),
      { at: 0.1, actor: 'lolly', do: 'pop', dur: 0.3 },
      ns(0.45, 'nian'),
      { at: 0.45, actor: 'nian', do: 'hop', amount: 3, dur: 0.3 },
      { at: 0.8, actor: 'lolly', do: 'moveTo', to: { x: 110, y: 60 }, dur: 0.3 },
      // 啊嗚——咬下去：糖黏在嘴上
      ns(1.05, 'roar'),
      { at: 1.05, actor: 'lolly', do: 'moveTo', to: lollyAt(mouthRoar(NC)), dur: 0.15 },
      { at: 1.22, actor: 'lolly', do: 'vanish', dur: 0.03 },
      ns(1.25, 'nian'),
      { at: 1.25, actor: 'stuck', do: 'pop', dur: 0.1 },
      { at: 1.25, actor: 'nian', do: 'squash', amount: 0.2, dur: 0.25 },
      { at: 1.6, actor: 'nian', do: 'hop', amount: 2, dur: 0.25 },
      { at: 1.6, actor: 'stuck', do: 'hop', amount: 2, dur: 0.25 },
      ks(1.3, 'giggle'),
      // 第一次：甩頭（糖跟著甩）
      { at: 2.2, actor: 'nian', do: 'shake', amount: 2.2, dur: 0.55 },
      { at: 2.2, actor: 'stuck', do: 'shake', amount: 2.2, dur: 0.55 },
      { at: 2.2, actor: 'stuck', do: 'spin', times: 1, dur: 0.55 },
      ks(2.3, 'surprised'),
      // 第二次：嚇得整隻跳起來往後拉——糖被拉得長長的，又「嗡」地彈回來
      ns(2.95, 'shock'),
      { at: 2.95, actor: 'stuck', do: 'moveTo', to: stuckAt(mouthShock(NC)), dur: 0.05 },
      { at: 2.95, actor: 'nian', do: 'hop', amount: 7, dur: 0.5 },
      { at: 2.95, actor: 'stuck', do: 'hop', amount: 7, dur: 0.5 },
      { at: 2.95, actor: 'stuck', do: 'stretchTo', amount: 1.8, dur: 0.25 },
      { at: 3.2, actor: 'stuck', do: 'stretchTo', amount: 1 / 1.8, dur: 0.4, ease: 'elastic' },
      { at: 3.45, actor: 'nian', do: 'shake', amount: 1.2, dur: 0.4 },
      { at: 3.45, actor: 'stuck', do: 'shake', amount: 1.2, dur: 0.4 },
      ns(3.9, 'nian'),
      { at: 3.9, actor: 'stuck', do: 'moveTo', to: stuckAt(mouthGrin(NC)), dur: 0.05 },
      // 第三次：楊捷睿抓住棍子，兩個拔河
      ks(3.95, 'walk'),
      { at: 3.95, actor: 'yang', do: 'moveTo', to: { x: 104, y: KG }, dur: 0.45 },
      ks(4.45, 'pull'),
      ...tug([[4.5, -3], [4.85, 4], [5.15, -2]]),
      // 啵！糖飛走，兩個都往後倒，坐在地上愣一下
      { at: 5.45, actor: 'stuck', do: 'moveTo', to: { x: 40, y: -14 }, arc: 12, dur: 0.6, ease: 'out' },
      { at: 5.45, actor: 'stuck', do: 'spin', times: -3, dur: 0.6 },
      { at: 6.05, actor: 'stuck', do: 'vanish', dur: 0.05 },
      ks(5.45, 'fall'),
      { at: 5.45, actor: 'yang', do: 'moveTo', to: { x: KX2, y: KG }, dur: 0.35, ease: 'out' },
      ns(5.45, 'dizzy'),
      { at: 5.45, actor: 'nian', do: 'moveTo', to: { x: NC + 3, y: NG }, dur: 0.3, ease: 'out' },
      ks(6.6, 'know'),
      { at: 6.6, actor: 'yang', do: 'hop', amount: 2, dur: 0.25 },
      ns(6.65, 'ears'),
      { at: 6.65, actor: 'nian', do: 'moveTo', to: { x: NC, y: NG }, dur: 0.2 },
      { at: 6.75, actor: 'nian', do: 'shake', amount: 0.5, dur: 0.5 },
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'lolly', emoji: '✨', n: 6, dur: 0.6, scale: 0.7 },
      { at: 0.5, kind: 'pop', actor: 'nian', emoji: '🤤', dx: -10, dur: 0.6 },
      { at: 1.6, kind: 'burst', actor: 'nian', emoji: '💕', n: 5, dur: 0.6, scale: 0.8 },
      { at: 2.25, kind: 'pop', actor: 'nian', emoji: '😖', dx: -10, dur: 0.7 },
      { at: 2.25, kind: 'sweat', actor: 'nian', dur: 0.6 },
      { at: 3.0, kind: 'burst', actor: 'nian', emoji: '💦', n: 5, dur: 0.6, scale: 0.8 },
      { at: 4.5, kind: 'pop', actor: 'nian', emoji: '💢', dx: -10, dur: 0.9 },
      { at: 4.6, kind: 'sweat', actor: 'yang', dur: 0.7 },
      { at: 5.45, kind: 'burst', x: mouthGrin(NC).x - 2, y: mouthGrin(NC).y, emoji: '✨', n: 8, dur: 0.6, scale: 1.0 },
      { at: 5.75, kind: 'dizzy', actor: 'nian', dur: 0.85 },
      { at: 5.8, kind: 'dizzy', actor: 'yang', dur: 0.8 },
    ],
    camera: [START, release(0.3), { at: 2.95, dur: 0.3, do: 'shake', amount: 0.6 }, holdWide(5.1, 0.35), { at: 5.45, dur: 0.35, do: 'shake', amount: 1.0 }],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 1.25, sfx: 'clink' },
      { at: 1.3, say: '好甜的糖！他的嘴打不開了！' },
      { at: 2.2, sfx: 'rumble' },
      { at: 2.95, sfx: 'boing' },
      { at: 4.5, sfx: 'slide' },
      { at: 5.45, sfx: 'plop' },
      { at: 5.5, sfx: 'boing' },
    ],
  }),

  // 他吃了燈！肚子裡有光！——一口吞下紅燈籠，燈光暗下來、肚子從裡面發光；打嗝一下亮一下，最後「嗝」地把燈籠噴上天（回到 W2）
  'feed:燈': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      ...decor, kid('know', KX2), nian('ears', NC),
      { id: 'lamp', emoji: '🏮', x: 99, y: 57, size: 14, hidden: true, float: true, tint: LAN_ON, pivot: 'center' },
      // 肚子裡的光：畫在黑幕上面
      { id: 'halo', emoji: '🟡', ...BELLY, size: 15, hidden: true, float: true, top: true, tint: 'blur(2.5px) brightness(1.2) opacity(.6)' },
      { id: 'glow', emoji: '🏮', ...BELLY, size: 8, hidden: true, float: true, top: true, tint: `${GOLD} blur(.6px) brightness(1.3) drop-shadow(0 0 3px #FFD24A) drop-shadow(0 0 7px #FFB52E)` },
    ],
    moves: [
      ...sway(0, 6.6),
      ks(0.05, 'reach'),
      { at: 0.1, actor: 'lamp', do: 'pop', dur: 0.3 },
      ns(0.45, 'nian'),
      { at: 0.45, actor: 'nian', do: 'hop', amount: 3, dur: 0.3 },
      { at: 0.8, actor: 'lamp', do: 'moveTo', to: { x: 112, y: 58 }, dur: 0.3 },
      // 啊嗚——整個吞下去
      ns(1.05, 'roar'),
      { at: 1.05, actor: 'lamp', do: 'moveTo', to: mouthRoar(NC), dur: 0.18 },
      { at: 1.05, actor: 'lamp', do: 'scaleTo', amount: 0.6, dur: 0.18 },
      { at: 1.23, actor: 'lamp', do: 'vanish', dur: 0.05 },
      ns(1.25, 'nian'),
      { at: 1.25, actor: 'nian', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: 1.5, actor: 'halo', do: 'pop', dur: 0.4 },
      { at: 1.5, actor: 'glow', do: 'pop', dur: 0.4 },
      { at: 1.9, actor: 'glow', do: 'flash', dur: 0.6 },
      ks(1.6, 'surprised'),
      ks(2.6, 'point'),
      // 嗝（亮一下）——嗝（更亮）
      ...hic(2.9, 3, 1.3),
      ...hic(3.7, 5, 1.6),
      // 吸一大口氣……
      { at: 4.4, actor: 'nian', do: 'squash', amount: -0.2, dur: 0.4 },
      { at: 4.4, actor: 'glow', do: 'flash', dur: 0.4 },
      // 嗝！燈籠噴上天
      ns(4.8, 'roar'),
      { at: 4.8, actor: 'nian', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: 4.8, actor: 'halo', do: 'vanish', dur: 0.1 },
      { at: 4.8, actor: 'glow', do: 'vanish', dur: 0.1 },
      { at: 4.8, actor: 'lamp', do: 'pop', dur: 0.1 },
      { at: 4.85, actor: 'lamp', do: 'moveTo', to: { x: 70, y: -16 }, arc: 10, dur: 0.6, ease: 'out' },
      { at: 4.85, actor: 'lamp', do: 'spin', times: -2, dur: 0.6 },
      { at: 5.45, actor: 'lamp', do: 'vanish', dur: 0.05 },
      ks(4.9, 'laugh'),
      { at: 5.0, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      ns(5.5, 'ears'),
      { at: 5.55, actor: 'nian', do: 'shake', amount: 0.5, dur: 0.6 },
      ks(5.9, 'know'),
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'lamp', emoji: '✨', n: 6, dur: 0.6, scale: 0.7 },
      { at: 0.5, kind: 'pop', actor: 'nian', emoji: '🤤', dx: -10, dur: 0.6 },
      { at: 1.6, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.7 },
      { at: 2.0, kind: 'pop', actor: 'nian', emoji: '❓', dx: -10, dur: 0.8 },
      { at: 4.8, kind: 'blow', actor: 'nian', dx: -12, dy: 14, to: { x: 80, y: 40 }, n: 4, dur: 0.6 },
      { at: 4.85, kind: 'burst', x: mouthRoar(NC).x, y: mouthRoar(NC).y, emoji: '✨', n: 7, dur: 0.6, scale: 0.9 },
      { at: 5.05, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.8 },
    ],
    lights: [
      { at: 1.4, dur: 0.5, level: 0.55 },
      { at: 4.85, dur: 0.4, level: 0 },
    ],
    camera: [START, release(0.3), holdWide(4.4, 0.4), { at: 4.8, dur: 0.35, do: 'shake', amount: 1.0 }],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 1.25, sfx: 'gulp' },
      { at: 1.5, sfx: 'blip' },
      { at: 1.6, say: '他吃了燈！肚子裡有光！' },
      { at: 2.9, sfx: 'hic' },
      { at: 3.7, sfx: 'hic' },
      { at: 4.8, sfx: 'boing' },
      { at: 4.85, sfx: 'whoosh' },
    ],
  }),

  // 年獸不怕紅的了！——吃飽了；楊捷睿拿出紅圍巾，年獸先縮一下，圍上去以後發現沒事，站起來跳舞
  red: scene({
    duration: 5.3,
    bg: BG,
    actors: [
      ...decor, kid('happy', KX2), nian('eat', NC),
      { id: 'scarf', emoji: '🧣', x: 101, y: 64, size: 14, hidden: true, float: true, tint: SCARF, pivot: 'center' },
    ],
    moves: [
      ...sway(0, 5.3),
      { at: 0.1, actor: 'nian', do: 'squash', amount: 0.1, dur: 0.22 },
      { at: 0.4, actor: 'nian', do: 'squash', amount: 0.1, dur: 0.22 },
      ns(0.7, 'nian'),
      ks(0.95, 'know'),
      { at: 1.0, actor: 'scarf', do: 'pop', dur: 0.3 },
      // 看到紅色：先縮一下
      ns(1.3, 'ears'),
      { at: 1.3, actor: 'nian', do: 'shake', amount: 0.9, dur: 1.2 },
      // 圍巾拿在兩人中間：看得到年獸縮起來發抖的臉
      ks(1.6, 'walk'),
      { at: 1.6, actor: 'yang', do: 'moveTo', to: { x: 96, y: KG }, dur: 0.45 },
      { at: 1.6, actor: 'scarf', do: 'moveTo', to: { x: 106, y: 63 }, dur: 0.45 },
      ks(2.05, 'reach'),
      { at: 2.1, actor: 'scarf', do: 'tilt', amount: 12, dur: 0.3 },
      // 幫他圍上
      { at: 2.55, actor: 'scarf', do: 'moveTo', to: pt(NC, 0.42, 0.76), arc: 5, dur: 0.3 },
      // ……咦？沒事。圍巾縮進脖子，同一刻換成圍著圍巾的 nian-dance
      { at: 2.95, actor: 'nian', do: 'tilt', amount: -6, dur: 0.3 },
      { at: 3.0, actor: 'scarf', do: 'scaleTo', amount: 0.6, dur: 0.2 },
      { at: 3.18, actor: 'scarf', do: 'vanish', dur: 0.05 },
      // 好漂亮！站起來跳舞
      ns(3.25, 'dance'),
      { at: 3.25, actor: 'nian', do: 'hop', amount: 7, dur: 0.4 },
      ...[0, 1, 2].map((i): Move => ({ at: +(3.7 + 0.4 * i).toFixed(2), actor: 'nian', do: 'tilt', amount: i % 2 ? -9 : 9, dur: 0.38 })),
      { at: 3.85, actor: 'nian', do: 'hop', amount: 3, dur: 0.3 },
      { at: 4.25, actor: 'nian', do: 'hop', amount: 3, dur: 0.3 },
      ks(3.3, 'happy'),
      { at: 3.4, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
      { at: 3.95, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      { at: 0.75, kind: 'pop', actor: 'nian', emoji: '😋', dx: -10, dur: 0.7 },
      { at: 1.0, kind: 'burst', actor: 'scarf', emoji: '✨', n: 6, dur: 0.6, scale: 0.7 },
      { at: 1.35, kind: 'sweat', actor: 'nian', dur: 0.8 },
      { at: 2.85, kind: 'pop', actor: 'nian', emoji: '❓', dx: -10, dur: 0.5 },
      { at: 3.25, kind: 'burst', actor: 'nian', emoji: '✨', n: 9, dur: 0.9, scale: 1.2 },
      { at: 3.5, kind: 'zzz', actor: 'nian', emoji: '🎵', dx: 4, dur: 1.5 },
    ],
    lights: [
      { at: 3.25, dur: 0.05, level: -0.25 },
      { at: 3.3, dur: 0.35, level: 0 },
    ],
    camera: [...frame(5.3, 0.3)],
    cues: [
      { at: 0.1, sfx: 'gulp' },
      { at: 0.7, sfx: 'hic' },
      { at: 1.0, sfx: 'poof' },
      { at: 1.3, sfx: 'boing' },
      { at: 2.55, sfx: 'whoosh' },
      { at: 3.25, sfx: 'cheer' },
      { at: 3.3, say: '年獸不怕紅的了！' },
    ],
  }),

  // 大家一起過年！——爸爸媽媽也來了，大家一起跳；天上放煙火，腳邊一串鞭炮劈哩啪啦，年獸嚇一小跳又笑出來；最後一起跳起來定格
  party: scene({
    duration: 5.4,
    bg: BG,
    actors: [
      ...decor, kid('happy', 96), nian('dance', NC),
      { id: 'mom', emoji: 'hero:three/happy', x: 30, y: 77 - 0.42 * 34, size: 34, flip: true, hidden: true },
      { id: 'dad', emoji: 'hero:eric/happy', x: 62, y: 77 - 0.42 * 36, size: 36, flip: true, hidden: true },
      { id: 'fc', emoji: '🧨', x: 100, y: 55, size: 12, hidden: true, float: true, tint: GLOW, pivot: 'center' },
    ],
    moves: [
      ...sway(0, 5.4),
      { at: 0.1, actor: 'dad', do: 'enter', from: { x: -24, y: 77 - 0.42 * 36 }, dur: 0.8, ease: 'out' },
      // 讓個位置給爸爸媽媽：開心地往後跳一步
      { at: 0.3, actor: 'yang', do: 'moveTo', to: { x: 93, y: KG }, arc: 4, dur: 0.4 },
      { at: 0.25, actor: 'mom', do: 'enter', from: { x: -24, y: 77 - 0.42 * 34 }, dur: 0.8, ease: 'out' },
      // 大家一起跳（輪流）
      ...[1.0, 1.5, 2.0, 2.5].flatMap((at, i): Move[] => [
        { at, actor: 'dad', do: 'hop', amount: 4, dur: 0.35 },
        { at: at + 0.12, actor: 'mom', do: 'hop', amount: 4, dur: 0.35 },
        { at: at + 0.24, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
        { at: at + 0.06, actor: 'nian', do: 'tilt', amount: i % 2 ? -9 : 9, dur: 0.4 },
      ]),
      // 鞭炮劈哩啪啦：年獸嚇一小跳，又笑出來
      ks(2.75, 'throw'),
      { at: 2.75, actor: 'fc', do: 'pop', dur: 0.12 },
      { at: 2.9, actor: 'fc', do: 'moveTo', to: { x: 117, y: 71 }, arc: 8, dur: 0.35, ease: 'in' },
      { at: 2.9, actor: 'fc', do: 'rotateTo', amount: 70, dur: 0.35 },
      ks(3.3, 'happy'),
      ...[0, 1, 2, 3, 4, 5].map((i): Move => ({ at: +(3.25 + 0.09 * i).toFixed(2), actor: 'fc', do: 'hop', amount: 2 + (i % 3), dur: 0.08 })),
      { at: 3.8, actor: 'fc', do: 'vanish', dur: 0.15 },
      { at: 3.3, actor: 'nian', do: 'hop', amount: 9, dur: 0.45 },
      { at: 3.3, actor: 'nian', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 3.85, actor: 'nian', do: 'squash', amount: 0.15, dur: 0.25 },
      // 定格：大家一起跳起來
      ...(['dad', 'mom', 'yang', 'nian'] as const).map((actor): Move => ({ at: 4.3, actor, do: 'hop', amount: actor === 'nian' ? 6 : 5, dur: 0.45 })),
      { at: 4.9, actor: 'nian', do: 'tilt', amount: 6, dur: 0.4 },
      { at: 4.95, actor: 'yang', do: 'hop', amount: 2, dur: 0.3 },
    ],
    fx: [
      // 煙火
      { at: 1.1, kind: 'burst', x: 36, y: 20, emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
      { at: 1.7, kind: 'burst', x: 118, y: 16, emoji: '🌟', n: 9, dur: 0.9, scale: 1.3 },
      { at: 2.3, kind: 'burst', x: 78, y: 14, emoji: '✨', n: 11, dur: 0.9, scale: 1.5 },
      ...[0, 1, 2, 3, 4, 5].map((i): Fx => ({ at: +(3.25 + 0.09 * i).toFixed(2), kind: 'burst', x: 116 + [-6, 5, -2, 7, -8, 2][i], y: 70 - (i % 3), emoji: '💥', n: 1, dur: 0.25, scale: 0.8 + 0.15 * (i % 3) })),
      { at: 3.35, kind: 'pop', actor: 'nian', emoji: '❗', dx: -10, dur: 0.5 },
      { at: 3.9, kind: 'pop', actor: 'nian', emoji: '😆', dx: -10, dur: 0.9 },
      { at: 3.4, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.8 },
      { at: 4.3, kind: 'burst', x: 80, y: 18, emoji: '🎉', n: 10, dur: 1.1, scale: 1.5 },
      { at: 4.4, kind: 'burst', x: 40, y: 22, emoji: '✨', n: 9, dur: 1.0, scale: 1.3 },
      { at: 4.5, kind: 'burst', x: 124, y: 20, emoji: '🌟', n: 9, dur: 0.9, scale: 1.3 },
      { at: 4.4, kind: 'zzz', actor: 'nian', emoji: '🎶', dx: 4, dur: 1.0 },
    ],
    lights: [
      ...[1.1, 1.7, 2.3, 4.3].flatMap((at) => [{ at, dur: 0.05, level: -0.22 }, { at: at + 0.05, dur: 0.35, level: 0 }]),
    ],
    camera: [START, release(0.3), { at: 3.25, dur: 0.4, do: 'shake', amount: 0.8 }, holdWide(4.2, 0.4)],
    cues: [
      { at: 0.1, sfx: 'cheer' },
      { at: 0.9, say: '大家一起過年！' },
      { at: 1.1, sfx: 'crack' },
      { at: 1.7, sfx: 'crack' },
      { at: 2.3, sfx: 'crack' },
      ...[0, 2, 4].map((i): Cue => ({ at: +(3.25 + 0.09 * i).toFixed(2), sfx: 'crack' })),
      { at: 3.3, sfx: 'boing' },
      { at: 4.3, sfx: 'cheer' },
    ],
  }),
}

export default scenes
