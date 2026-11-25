import { scene } from '../scene'
import type { Actor, Camera, Clip, Fx, Move, Vec } from '../../anim/clip'
import type { Scenes } from './index'

// 豬八戒吃瓜：豬八戒在河的這一邊（左岸）好餓，肚子咕嚕咕嚕叫；河的對面（右岸）有一堆大西瓜。
// 過河：游——噗通仰躺下水，圓肚子像游泳圈浮在水上，嘴巴噴水柱，啪搭啪搭漂到對岸；
// 跳——退後、助跑、大跳，在河中間掉下去，水花噴得到處都是，頂著一條魚濕答答爬回來；
// 走——盯著西瓜大搖大擺走進河裡，越走越矮，只剩一串泡泡，最後從岸邊「嘩」冒出來、鼻子被魚咬著。
// 到了對岸一顆接一顆吃，肚子越吃越大，最後一片瓜皮往河裡一丟，整個人往後一躺。肚子太大，滾不下水、起不來。
// 坐什麼回去：瓜——剛剛丟進河裡的瓜皮當小船，跳進去一路漂回家；龜——小烏龜爬上岸要載他，一坐上去被壓成一片烏龜餅，
// 彈回來瞪他一眼游走；蝶——小蝴蝶抓著他的肚子拚命拉，拉三次只拉起來一點點，第三次被肚子彈飛、累倒、歪歪斜斜飛走。
// 到家肚子「咻」地消下去，馬上又咕嚕叫；回頭看到對面還剩一顆瓜，又跳進瓜皮船，往對面划回去（定格）。
//
// 河是自己搭的（引擎沒有河的背景）：
// - 前面那一塊水：一個拉寬的 🟦（river），畫在所有角色的「前面」，水面在 y 76；角色走進河裡、浮在水上，
//   水面以下那一截自然被水蓋住（不用 half／cut）。水裡幾道白色水紋（line）一閃一閃地流。
// - 遠處的河：十八條扁扁的 🟦 長條（far），畫在角色「後面」，越遠越窄越淡、彎彎地流進山坡裡，一看就是一條河。
// - 兩岸的邊：岸邊各一顆石頭、一叢草，蓋住水塊的圓角。左岸 x 0～50 是家，河 x 50～104，右岸 x 104～160 有一堆西瓜。
//
// 豬八戒的圖（prop:bajie*）沒翻是朝右；size 40（S），站在地上 y = 60.2（G）。他是道具圖，引擎不會幫他踩步伐、
// 閒著也不會動，所以走路的顛步（walk）、等著時的呼吸（breathe）、浮在水上的晃（bob）都自己寫。
// 鏡頭：zoom 的定點會被夾在背景裡，推到 1.3 倍時畫面最右只看得到 x 150 左右、最左 x 9 左右，
// 所以西瓜堆收在 x 150 以內，推近右岸、左岸的鏡頭都用 1.2～1.3 倍。
// W1（等他選「豬八戒＿過河」）：bajie-drool 站在左岸水邊 x 36，望著對面的西瓜，全景。
// 游過去的結尾＝吃瓜的開頭：prop:bajie 站在右岸 x 110。
// 吃完的結尾＝肚子太大的開頭：bajie-full 往左翻（頭在左、望著左岸）躺在右岸 x 122，放大 1.2 倍；瓜皮浮在右岸邊的水上 x 84。
// W2（等他選「他坐＿過河」）：同上，但肚子再鼓到 1.3 倍；西瓜堆只剩最右邊一顆 p3。全景。
// 瓜皮船的結尾＝到家的開頭：bajie-full（1.3 倍）躺在左岸 x 30，瓜皮船停在左岸邊 x 58。

type Cue = Clip['cues'][number]
const r2 = (n: number) => Math.round(n * 100) / 100

const S = 40
const G = 77 - 0.42 * S
const BG = { top: '#7CC8F2', bottom: '#DDF3FF', floor: '#93CF6B', scenery: 'hills' as const }

// ---- 河 ----
const RIVER_X = 77
/** 前面那塊水的 y（拉寬以後水面在 76） */
const RIVER_Y = 90.4
/** 水面 */
const SURF = 76
const TINT = 'hue-rotate(-12deg) saturate(1.15) brightness(1.12)'
/** 遠處的河：一條一條扁扁的藍色長條，越遠越窄、越淡，彎彎地流進山坡裡 */
const FAR_N = 18
const farStrip = (i: number) => {
  const q = i / (FAR_N - 1)
  const w = 53 - 45 * q ** 0.8, h = 1.8, bottom = 76.6 - 0.8 * i
  return { w, h, bottom, x: RIVER_X + 6 * Math.sin(q * 3.4), k: Math.sqrt(w * h) / 29.9, a: Math.sqrt(w / h) }
}
const far: Actor[] = Array.from({ length: FAR_N }, (_, i) => {
  const f = farStrip(i)
  return { id: `far${i}`, emoji: '🟦', x: r2(f.x), y: r2(f.bottom - 0.42 * 34), size: 34, float: true,
    tint: `hue-rotate(-14deg) saturate(${r2(1 - 0.45 * i / FAR_N)}) brightness(${r2(1.2 + 0.3 * i / FAR_N)})` }
})
/** 前面的水（畫在角色前面）與兩岸的石頭、草 */
const front: Actor[] = [
  { id: 'river', emoji: '🟦', x: RIVER_X, y: RIVER_Y, size: 46, float: true, tint: TINT },
  { id: 'bank0', emoji: '🪨', x: 48, y: 80, size: 9, tint: 'brightness(.85) sepia(.35)' },
  { id: 'bank1', emoji: '🌿', x: 51, y: 85, size: 10 },
  { id: 'bank2', emoji: '🪨', x: 106, y: 81, size: 10, flip: true, tint: 'brightness(.85) sepia(.35)' },
  { id: 'bank3', emoji: '🌿', x: 103, y: 86.5, size: 9, flip: true },
]
/** 河一開始就要是拉好的樣子（0 秒、0 長度的 scaleTo／stretchTo） */
const riverSet: Move[] = [
  { at: 0, actor: 'river', do: 'stretchTo', amount: 1.2, dur: 0 },
  ...Array.from({ length: FAR_N }, (_, i): Move[] => {
    const f = farStrip(i)
    return [{ at: 0, actor: `far${i}`, do: 'scaleTo', amount: r2(f.k), dur: 0 }, { at: 0, actor: `far${i}`, do: 'stretchTo', amount: r2(f.a), dur: 0 }]
  }).flat(),
]
/** 水紋：固定的幾道一直在（等他選的時候也在），另外幾道一閃一閃地往右流 */
const dash = (at: number, dur: number, x: number, y: number, l: number): Fx =>
  ({ at, dur, kind: 'line', actor: 'river', dx: r2(x - RIVER_X), dy: r2(y - RIVER_Y), to: { x: r2(x + l), y }, color: '#FFFFFF', width: 0.8 })
function riverFx(end: number): Fx[] {
  const out: Fx[] = [dash(0, 99, 57, 81, 6), dash(0, 99, 78, 83.5, 8), dash(0, 99, 64, 87.5, 7), dash(0, 99, 90, 86, 6)]
  const flow: [number, number, number][] = [[68, 79.5, 5], [92, 80.5, 4], [56, 85, 5], [84, 88.5, 6], [72, 85.5, 4]]
  let k = 0
  for (let t = 0.2; t < end - 0.3; t += 0.45, k++) {
    const [x, y, l] = flow[k % flow.length]
    out.push(dash(r2(t), 0.7, x + (k % 3), y, l))
  }
  return out
}

// ---- 西瓜堆（右岸）：下面三顆、中間兩顆、最上面一顆；size 18 以下引擎會放大三成，位置照放大後量好 ----
const pile: Actor[] = [
  { id: 'p1', emoji: 'prop:watermelon', x: 117, y: r2(77 - 0.42 * 14), size: 14 },
  { id: 'p2', emoji: 'prop:watermelon', x: 130, y: r2(77 - 0.42 * 17), size: 17 },
  { id: 'p3', emoji: 'prop:watermelon', x: 139.5, y: r2(77 - 0.42 * 12), size: 12 },
  { id: 'p4', emoji: 'prop:watermelon', x: 123.5, y: 59.7, size: 12 },
  { id: 'p5', emoji: 'prop:watermelon', x: 135, y: 58.9, size: 12 },
  { id: 'p6', emoji: 'prop:watermelon', x: 129, y: 42, size: 11, float: true },
]
const EATEN = ['p6', 'p4', 'p5', 'p1', 'p2']
const pileAfter = pile.map((a) => (EATEN.includes(a.id) ? { ...a, hidden: true } : a))

// ---- 瓜皮（最後一顆瓜吃剩的皮）：一片西瓜只畫最下面那截白綠色的皮，浮在水上就是一條小船 ----
const RIND_CUT = 0.77
const RIND_S = 40
const RIND_Y = 59.3
const RIND_W2 = { x: 86, y: RIND_Y }
/** 瓜皮船回到家停的地方 */
const BOAT_X = 64
const rindAt = (p: Vec, hidden = false): Actor =>
  ({ id: 'rind', emoji: 'prop:watermelon-slice', x: p.x, y: p.y, size: RIND_S, half: 'bottom', cut: RIND_CUT, hidden, tint: 'saturate(1.2) drop-shadow(0 0 1px #FFFFFF)' })
/** 坐在瓜皮船裡：他的腳底比瓜皮上緣低一點（瓜皮畫在他前面） */
const inBoat = (x: number) => ({ x, y: 56.2 })

// ---- 豬八戒 ----
const W1X = 36
const E1X = 108
const W2X = 122
const HOME_X = 34
/** 吃完躺下時的肚子 */
const FULL = 1.2
/** W2 的肚子：躺著放大這麼多倍 */
const BIG = 1.3
/** 仰躺浮在水上：圓肚子露出水面 */
const FLOAT_Y = 66
const bj = (emoji: string, x: number, y = G, flip = false): Actor => ({ id: 'bj', emoji: `prop:${emoji}`, x, y, size: S, flip })

/** 走路：自己寫顛步、左右擺（道具圖引擎不會幫他踩步伐） */
function walk(t: number, x: number, dur: number, y = G, amp = 1.5, id = 'bj'): Move[] {
  const n = Math.max(2, Math.round(dur / 0.2))
  const step = dur / n
  return [
    { at: r2(t), actor: id, do: 'moveTo', to: { x, y }, dur: r2(dur), ease: 'linear' },
    ...Array.from({ length: n }, (_, i): Move => ({ at: r2(t + i * step), actor: id, do: 'hop', amount: amp, dur: r2(step * 0.95) })),
    ...Array.from({ length: n }, (_, i): Move => ({ at: r2(t + i * step), actor: id, do: 'tilt', amount: i % 2 ? -4 : 4, dur: r2(step * 0.95) })),
  ]
}
/** 等著的時候：肚子一起一伏（每 0.7 秒） */
function breathe(t0: number, t1: number, amt = 0.04, id = 'bj'): Move[] {
  const out: Move[] = []
  for (let t = t0, i = 0; t < t1 - 0.3; t += 0.7, i++) out.push({ at: r2(t), actor: id, do: 'squash', amount: i % 2 ? -amt : amt, dur: 0.6 })
  return out
}
/** 浮在水上：上下載浮載沉、左右晃 */
function bob(t0: number, t1: number, id = 'bj', amp = 1.2): Move[] {
  const out: Move[] = []
  for (let t = t0, i = 0; t < t1 - 0.2; t += 0.4, i++) {
    out.push({ at: r2(t), actor: id, do: 'hop', amount: r2(i % 2 ? -amp * 0.6 : amp), dur: 0.38 })
    out.push({ at: r2(t), actor: id, do: 'tilt', amount: i % 2 ? -3 : 3, dur: 0.38 })
  }
  return out
}
/** 噗通：水花、水柱、聲音 */
function splash(at: number, x: number, k = 1): { fx: Fx[]; cues: Cue[] } {
  return {
    fx: [
      { at, kind: 'burst', x, y: SURF - 4, emoji: '💦', n: Math.round(6 + 4 * k), dur: r2(0.5 + 0.2 * k), scale: r2(0.7 + 0.5 * k) },
      { at, kind: 'fountain', x, y: SURF - 2, emoji: '💧', n: Math.round(6 + 4 * k), dur: r2(0.8 + 0.2 * k), scale: r2(0.8 + 0.5 * k) },
    ],
    cues: [{ at, sfx: k >= 1 ? 'splash' : 'plop' }],
  }
}
/** 肚子咕嚕叫：肚子那裡噴一圈 💢（k 越大越猛） */
function rumble(at: number, x: number, k: number, belly = G + 4): { moves: Move[]; fx: Fx[]; cues: Cue[] } {
  return {
    moves: [
      { at, actor: 'bj', do: 'squash', amount: r2(0.08 + 0.06 * k), dur: 0.3 },
      { at: r2(at + 0.05), actor: 'bj', do: 'shake', amount: r2(0.4 + 0.4 * k), dur: 0.5 },
    ],
    fx: [{ at, kind: 'burst', x, y: belly, emoji: '💢', n: 3 + k, dur: 0.7, scale: r2(0.8 + 0.25 * k) }],
    cues: [{ at, sfx: 'rumble' }],
  }
}

// ---- 鏡頭 ----
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡（引擎會再把定點夾在背景裡） */
const aim = (c: Vec, z: number): Vec => ({ x: r2((z * c.x - MID.x) / (z - 1)), y: r2((z * c.y - MID.y) / (z - 1)) })
const shot = (at: number, c: Vec, z: number, dur = 0.6): Camera => ({ at, dur, do: 'zoom', amount: z, to: aim(c, z) })
/** 全景：兩岸、河、西瓜都看得到（1.02 倍才擋得住自動取景） */
const wide = (at: number, dur = 0.6): Camera => ({ at, dur, do: 'zoom', amount: 1.02, to: MID })
/** 左岸、右岸（推到底也只看得到 x 9～150，見檔頭） */
const left = (at: number, dur = 0.6) => shot(at, { x: 40, y: 52 }, 1.25, dur)
const right = (at: number, dur = 0.6) => shot(at, { x: 124, y: 50 }, 1.3, dur)
/** 開場：推近左岸的他（右邊的西瓜堆先不讓他看到） */
const close = (at: number, dur = 0.6) => shot(at, { x: 40, y: 52 }, 1.6, dur)
/** 吃完躺下來、肚子太大：框右岸躺著的他 */
const lying = (at: number, dur = 0.6) => shot(at, { x: 118, y: 50 }, 1.2, dur)

const merge = (...parts: { moves?: Move[]; fx?: Fx[]; cues?: Cue[] }[]) => ({
  moves: parts.flatMap((p) => p.moves ?? []),
  fx: parts.flatMap((p) => p.fx ?? []),
  cues: parts.flatMap((p) => p.cues ?? []),
})

/** 每一段都一樣的舞台：遠處的河 → 西瓜堆、瓜皮、角色 → 前面的水 → 飛在水上的東西 */
function stage(mid: Actor[], top: Actor[] = []): Actor[] {
  return [...far, ...mid, ...front, ...top]
}

// ======================================================================
// 1. 豬八戒好餓。他的肚子在叫。——走到河邊，肚子咕嚕叫一次比一次大，想到西瓜，餓到跺腳
const hungry = (() => {
  const D = 5.4
  const BX = W1X - 2
  const r = merge(rumble(1.1, BX, 1), rumble(2.1, BX, 2), rumble(3.6, BX, 4))
  return scene({
    duration: D,
    bg: BG,
    actors: stage([...pile, bj('bajie', 10)]),
    moves: [
      ...riverSet,
      ...walk(0, W1X - 4, 0.9),
      ...r.moves,
      { at: 1.15, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
      { at: 2.1, actor: 'bj', do: 'hop', amount: 4, dur: 0.3 },
      // 想到西瓜：咂咂嘴
      { at: 2.7, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
      { at: 2.9, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.2 },
      { at: 3.15, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.2 },
      // 第三次最大聲：餓到跺腳
      { at: 3.6, actor: 'bj', do: 'swap', emoji: 'prop:bajie-angry' },
      { at: 3.7, actor: 'bj', do: 'hop', amount: 4, dur: 0.25 },
      { at: 4.05, actor: 'bj', do: 'hop', amount: 4, dur: 0.25 },
      // 鼻子一抬：聞到什麼了（下一頁轉頭看對面）
      { at: 4.6, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
      { at: 4.65, actor: 'bj', do: 'moveTo', to: { x: BX, y: G }, dur: 0.3 },
      { at: 4.7, actor: 'bj', do: 'tilt', amount: -8, dur: 0.35 },
      { at: 5.05, actor: 'bj', do: 'tilt', amount: -6, dur: 0.3 },
    ],
    fx: [
      ...riverFx(D),
      ...r.fx,
      { at: 1.2, kind: 'pop', actor: 'bj', emoji: '❓', dur: 0.7 },
      { at: 2.6, kind: 'bubble', actor: 'bj', dx: 10, emoji: '🍉', dur: 1.1, scale: 1.3 },
      { at: 3.7, kind: 'puff', actor: 'bj', n: 4, dur: 0.35 },
      { at: 4.05, kind: 'puff', actor: 'bj', n: 4, dur: 0.35 },
    ],
    camera: [close(-0.3, 0.01), { at: 3.6, dur: 0.3, do: 'shake', amount: 1 }],
    cues: [...r.cues, { at: 1.3, say: '豬八戒好餓。他的肚子在叫。' }, { at: 3.7, sfx: 'tap' }, { at: 4.05, sfx: 'tap' }],
  })
})()

// 2. 看！河的對面有好多瓜！——鼻子一抬聞到了，鏡頭帶到對岸那一堆大西瓜（閃閃發亮），回到全景：他星星眼流口水，走到水邊
const river = (() => {
  const D = 5.6
  const sparkle = pile.map((p, i): Move => ({ at: r2(0.9 + 0.1 * i), actor: p.id, do: 'hop', amount: 2.5, dur: 0.3 }))
  return scene({
    duration: D,
    bg: BG,
    actors: stage([...pile, bj('bajie', W1X - 2), { id: 'fish', emoji: '🐠', x: 60, y: 84, size: 12, hidden: true, float: true }]),
    moves: [
      ...riverSet,
      { at: 0.1, actor: 'bj', do: 'tilt', amount: -8, dur: 0.3 },
      { at: 0.4, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
      { at: 0.4, actor: 'bj', do: 'hop', amount: 4, dur: 0.3 },
      ...sparkle,
      { at: 1.6, actor: 'p2', do: 'hop', amount: 3, dur: 0.3 },
      // 回到全景：星星眼流口水
      { at: 2.2, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
      { at: 2.2, actor: 'bj', do: 'hop', amount: 5, dur: 0.35 },
      { at: 2.65, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
      ...walk(3.0, W1X, 0.4),
      // 河裡跳出一條魚：真的是一條河
      { at: 3.5, actor: 'fish', do: 'pop', dur: 0.05 },
      { at: 3.5, actor: 'fish', do: 'moveTo', to: { x: 86, y: 84 }, arc: 24, dur: 0.7, ease: 'linear' },
      { at: 3.5, actor: 'fish', do: 'rotateTo', amount: -40, dur: 0.35, pivot: 'center' },
      { at: 3.85, actor: 'fish', do: 'rotateTo', amount: 80, dur: 0.35, pivot: 'center' },
      { at: 4.25, actor: 'fish', do: 'vanish', dur: 0.05 },
      { at: 3.6, actor: 'bj', do: 'tilt', amount: 6, dur: 0.5 },
      ...breathe(4.2, D, 0.05),
      { at: 4.5, actor: 'bj', do: 'hop', amount: 2.5, dur: 0.25 },
      { at: 5.0, actor: 'bj', do: 'hop', amount: 2.5, dur: 0.25 },
    ],
    fx: [
      ...riverFx(D),
      { at: 0.4, kind: 'pop', actor: 'bj', emoji: '❗', dur: 0.6 },
      { at: 0.9, kind: 'burst', x: 130, y: 54, emoji: '✨', n: 8, dur: 0.8, scale: 1.2 },
      { at: 1.6, kind: 'burst', x: 130, y: 58, emoji: '✨', n: 6, dur: 0.6, scale: 1 },
      { at: 2.25, kind: 'burst', actor: 'bj', dy: -6, emoji: '💖', n: 6, dur: 0.7, scale: 0.9 },
      ...splash(3.5, 60, 0.3).fx,
      ...splash(4.2, 86, 0.3).fx,
    ],
    camera: [close(-0.3, 0.01), shot(0.5, { x: 122, y: 52 }, 1.7, 0.7), wide(1.9, 0.7)],
    cues: [
      { at: 0.4, sfx: 'blip' },
      { at: 1.0, say: '看！河的對面有好多瓜！' },
      { at: 2.2, sfx: 'boing' },
      ...splash(3.5, 60, 0.3).cues,
      ...splash(4.2, 86, 0.3).cues,
    ],
  })
})()

/** W1：站在左岸水邊、星星眼流口水望著對面 */
const w1Actors = (extra: Actor[] = [], top: Actor[] = []) => stage([...pile, bj('bajie-drool', W1X), ...extra], top)

// 3a. 游（往下走）：噗通仰躺下水，圓肚子像游泳圈浮著，嘴巴噴水，啪搭啪搭漂到對岸、爬上岸甩水
const crossSwim = (() => {
  const D = 7.2
  const IN = 0.35
  const LAND = 0.85
  const X0 = 60, X1 = 92
  const OUT = 4.7
  const s1 = splash(LAND, X0, 1)
  const kicks: Fx[] = []
  for (let t = 1.2; t < OUT - 0.2; t += 0.55) kicks.push({ at: r2(t), kind: 'burst', x: r2(X0 + (X1 - X0) * (t - 1) / (OUT - 1) - 14), y: SURF - 2, emoji: '💦', n: 3, dur: 0.4, scale: 0.7 })
  return scene({
    duration: D,
    bg: BG,
    actors: w1Actors(),
    moves: [
      ...riverSet,
      { at: 0, actor: 'bj', do: 'squash', amount: 0.22, dur: IN },
      // 噗通：仰躺著跳下去
      { at: IN, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
      { at: IN, actor: 'bj', do: 'moveTo', to: { x: X0, y: FLOAT_Y }, arc: 14, dur: LAND - IN, ease: 'linear' },
      { at: LAND, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
      // 漂過去：肚子像游泳圈，一路晃
      { at: 1.0, actor: 'bj', do: 'moveTo', to: { x: X1, y: FLOAT_Y }, dur: OUT - 1.0, ease: 'inOut' },
      ...bob(1.15, OUT),
      { at: 2.3, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.3 },
      { at: 3.4, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.3 },
      // 上岸、甩水
      { at: OUT, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
      { at: OUT, actor: 'bj', do: 'moveTo', to: { x: E1X, y: G }, arc: 10, dur: 0.45, ease: 'linear' },
      { at: OUT + 0.6, actor: 'bj', do: 'shake', amount: 1.4, dur: 0.6 },
      { at: OUT + 1.4, actor: 'bj', do: 'hop', amount: 4, dur: 0.35 },
      ...breathe(OUT + 1.8, D),
    ],
    fx: [
      ...riverFx(D),
      ...s1.fx,
      ...kicks,
      // 嘴巴噴水柱
      { at: 1.5, kind: 'fountain', actor: 'bj', dx: 12, dy: 6, emoji: '💧', n: 6, dur: 0.8 },
      { at: 2.9, kind: 'fountain', actor: 'bj', dx: 12, dy: 6, emoji: '💧', n: 7, dur: 0.8, scale: 1.2 },
      { at: 1.9, kind: 'bubble', actor: 'bj', dx: -6, emoji: '🛟', dur: 1.4, scale: 1.4 },
      { at: OUT + 0.6, kind: 'burst', actor: 'bj', dy: 14, emoji: '💦', n: 8, dur: 0.6, scale: 1.1 },
      { at: OUT + 1.45, kind: 'pop', actor: 'bj', emoji: '😋', dur: 1 },
    ],
    camera: [wide(-0.3, 0.01), { at: LAND, dur: 0.3, do: 'shake', amount: 1 }, shot(1.0, { x: 76, y: 58 }, 1.15, 0.8), right(OUT - 0.3, 0.8)],
    cues: [...s1.cues, { at: 1.6, say: '肚子大大的，游過去了！' }, { at: 1.5, sfx: 'bubble' }, { at: OUT, sfx: 'boing' }, { at: OUT + 1.4, sfx: 'cheer' }],
  })
})()

// 3b. 跳：退後、助跑、大跳——在河中間掉下去，水花噴得到處都是；冒出來頭上頂著一條魚，游回左岸、甩水、魚彈回河裡
const crossJump = (() => {
  // 又流口水那一下之後就結束，不留不動的尾巴
  const D = 6.95
  const BACK = 0.1
  const RUN = 1.0
  const UP = 1.3
  const TOP = 1.62
  const SPLASH = 1.95
  const MX = 72
  const POP = 2.85
  const OUT = 4.9
  const s = splash(SPLASH, MX, 2.2)
  const HEAD = (x: number, y: number) => ({ x: x - 1, y: r2(y - 22) })
  const rain: Fx[] = [30, 58, 90, 120, 146].map((x, i) => ({ at: r2(SPLASH + 0.15 + 0.05 * i), kind: 'rain', x, y: 8, emoji: '💧', n: 6, dur: 1.1 }))
  return scene({
    duration: D,
    bg: BG,
    actors: w1Actors([{ id: 'fish', emoji: '🐟', x: MX, y: 50, size: 10, hidden: true, flip: true, float: true }]),
    moves: [
      ...riverSet,
      // 退後
      { at: BACK, actor: 'bj', do: 'swap', emoji: 'prop:bajie-angry' },
      ...walk(BACK + 0.1, 16, 0.6),
      { at: 0.75, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.25 },
      // 助跑、大跳：飛得高高的
      { at: RUN, actor: 'bj', do: 'moveTo', to: { x: 44, y: G }, dur: UP - RUN, ease: 'in' },
      { at: UP, actor: 'bj', do: 'squash', amount: -0.25, dur: 0.15 },
      { at: UP, actor: 'bj', do: 'moveTo', to: { x: 60, y: 34 }, dur: TOP - UP, ease: 'out' },
      // 跳到最高發現不夠遠——直直掉下去
      { at: TOP, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
      { at: TOP, actor: 'bj', do: 'shake', amount: 1, dur: 0.3 },
      { at: TOP, actor: 'bj', do: 'moveTo', to: { x: MX, y: 98 }, dur: SPLASH - TOP, ease: 'in' },
      // 冒出來：頭上頂著一條魚
      { at: POP, actor: 'bj', do: 'moveTo', to: { x: MX, y: 74 }, dur: 0.25, ease: 'out' },
      { at: POP, actor: 'fish', do: 'pop', dur: 0.2 },
      { at: POP, actor: 'fish', do: 'moveTo', to: HEAD(MX, 74), dur: 0.25, ease: 'out' },
      { at: POP + 0.3, actor: 'fish', do: 'shake', amount: 0.8, dur: 0.4 },
      // 游回左岸
      { at: 3.7, actor: 'bj', do: 'moveTo', to: { x: 56, y: 76 }, dur: OUT - 3.7 },
      { at: 3.7, actor: 'fish', do: 'moveTo', to: HEAD(56, 76), dur: OUT - 3.7 },
      ...bob(3.7, OUT, 'bj', 0.8),
      ...bob(3.7, OUT, 'fish', 0.8),
      // 爬上岸
      { at: OUT, actor: 'bj', do: 'moveTo', to: { x: W1X, y: G }, arc: 6, dur: 0.4 },
      { at: OUT, actor: 'fish', do: 'moveTo', to: HEAD(W1X, G), arc: 6, dur: 0.4 },
      // 像小狗一樣甩水：魚被甩回河裡
      { at: 5.45, actor: 'bj', do: 'shake', amount: 1.8, dur: 0.6 },
      { at: 5.6, actor: 'fish', do: 'moveTo', to: { x: 70, y: 90 }, arc: 16, dur: 0.6, ease: 'linear' },
      { at: 5.6, actor: 'fish', do: 'spin', times: 2, dur: 0.6, pivot: 'center' },
      { at: 6.2, actor: 'fish', do: 'vanish', dur: 0.05 },
      // 又望著對面流口水（回到 W1）
      { at: 6.3, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
      { at: 6.35, actor: 'bj', do: 'hop', amount: 2.5, dur: 0.3 },
      { at: 6.65, actor: 'bj', do: 'squash', amount: 0.05, dur: 0.3 },
    ],
    fx: [
      ...riverFx(D),
      { at: BACK, kind: 'pop', actor: 'bj', emoji: '💪', dur: 0.7 },
      { at: RUN, kind: 'puff', actor: 'bj', n: 4, dur: 0.35 },
      { at: TOP, kind: 'pop', actor: 'bj', emoji: '❗', dur: 0.4 },
      ...s.fx,
      ...rain,
      { at: SPLASH + 0.1, kind: 'burst', x: 36, y: 62, emoji: '💦', n: 5, dur: 0.6 },
      { at: SPLASH + 0.15, kind: 'burst', x: 134, y: 58, emoji: '💦', n: 5, dur: 0.6 },
      { at: POP + 0.1, kind: 'fountain', actor: 'bj', dy: 6, emoji: '💧', n: 6, dur: 0.6 },
      { at: POP + 0.3, kind: 'pop', actor: 'fish', dx: 8, emoji: '❓', dur: 0.8 },
      { at: OUT + 0.4, kind: 'rain', actor: 'bj', dy: 6, emoji: '💧', n: 6, dur: 1 },
      { at: 5.45, kind: 'burst', actor: 'bj', dy: 14, emoji: '💦', n: 10, dur: 0.6, scale: 1.2 },
      ...splash(6.2, 70, 0.3).fx,
    ],
    camera: [wide(-0.3, 0.01), { at: SPLASH, dur: 0.45, do: 'shake', amount: 2.2 }, { at: SPLASH, dur: 0.4, do: 'punch', amount: 0.08, to: { x: MX, y: 70 } }],
    cues: [
      { at: RUN, sfx: 'whoosh' },
      { at: TOP, sfx: 'blip' },
      ...s.cues,
      { at: SPLASH + 0.05, sfx: 'rumble' },
      { at: 2.1, say: '跳不過去！好多水！' },
      { at: POP, sfx: 'bubble' },
      { at: 5.45, sfx: 'whoosh' },
      ...splash(6.2, 70, 0.3).cues,
    ],
  })
})()

// 3c. 走：盯著西瓜大搖大擺走進河裡，越走越矮，最後只剩黑帽子（和頭頂）露在水面上；帽子在水底一路往右走到河中間，
// 停住、魚游過來看、轉身往回走，一串一串大泡泡跟著冒；沉下去，從左岸水邊「嘩」冒出來，鼻子被魚咬著
const crossWalk = (() => {
  const D = 7.8
  /** 只剩帽子和一雙星星眼露出水面：圖的最上面三成在水面上 */
  const HAT_Y = 85.6
  const path: [number, number, number][] = [[48, G + 2, 0.5], [58, G + 11, 0.5], [66, G + 20, 0.45], [72, G + 26, 0.4], [76, HAT_Y, 0.35]]
  const steps: Move[] = []
  let t = 0.2
  for (const [x, y, d] of path) { steps.push(...walk(t, x, d, y, 1.4)); t += d }
  const HAT = r2(t) // 只剩帽子
  const MIDX = 92
  const STOP = r2(HAT + 0.85) // 走到河中間停住
  const TURN = r2(STOP + 0.4) // 轉身往回走
  const SINK = r2(TURN + 0.75) // 沉下去
  const UP = r2(SINK + 0.2)
  const UX = 54
  /** bajie-shock 的鼻子右邊：魚從右邊咬住鼻子 */
  const NOSE = (x: number, y: number) => ({ x: x + 6, y: r2(y - 7) })
  /** 帽子在哪（泡泡跟著冒） */
  const hatX = (tt: number) => (tt < STOP ? 76 + (MIDX - 76) * (tt - HAT) / (STOP - HAT) : tt < TURN ? MIDX : MIDX + (60 - MIDX) * (tt - TURN) / (SINK - TURN))
  const bubbles: Fx[] = []
  for (let b = HAT - 0.4, i = 0; b < SINK + 0.1; b += 0.3, i++) bubbles.push({ at: r2(b), kind: 'burst', x: r2(hatX(Math.max(b, HAT)) + (i % 2 ? 4 : -4)), y: SURF - 3, emoji: '🫧', n: 4, dur: 0.6, scale: 1.5 })
  const s = splash(UP, UX, 1.4)
  return scene({
    duration: D,
    bg: BG,
    // 游過來看的魚畫在水的前面（看得到牠在水裡游）；咬鼻子的魚從水裡跟著他冒出來，畫在水後面
    actors: w1Actors([{ id: 'fish2', emoji: '🐟', x: UX + 8, y: 84, size: 10, hidden: true, float: true }],
      [{ id: 'fish', emoji: '🐠', x: 104, y: 79, size: 12, hidden: true, float: true }]),
    moves: [
      ...riverSet,
      ...steps,
      // 只剩帽子：在水底一路往右走到河中間（帽子一顛一顛）
      ...walk(HAT, MIDX, STOP - HAT, HAT_Y, 1.2),
      // 停住：左看右看
      { at: STOP + 0.05, actor: 'bj', do: 'tilt', amount: 10, dur: 0.3 },
      // 轉身往回走
      { at: TURN, actor: 'bj', do: 'flip' },
      ...walk(TURN, 60, SINK - TURN, HAT_Y, 1.2),
      // 沉下去（換到左岸水邊）
      { at: SINK, actor: 'bj', do: 'moveTo', to: { x: 58, y: 104 }, dur: 0.15, ease: 'in' },
      { at: SINK + 0.15, actor: 'bj', do: 'flip' },
      // 魚游過來看帽子：咦？
      { at: HAT, actor: 'fish', do: 'pop', dur: 0.2 },
      { at: HAT, actor: 'fish', do: 'moveTo', to: { x: 102, y: 79 }, dur: 0.6, ease: 'out' },
      ...bob(HAT + 0.6, TURN + 0.3, 'fish', 0.6),
      { at: TURN + 0.3, actor: 'fish', do: 'moveTo', to: { x: 108, y: 86 }, dur: 0.5, ease: 'in' },
      { at: TURN + 0.8, actor: 'fish', do: 'vanish', dur: 0.05 },
      // 嘩！從左岸水邊冒出來，鼻子被魚咬著
      { at: UP - 0.05, actor: 'bj', do: 'moveTo', to: { x: UX, y: 100 }, dur: 0.01 },
      { at: UP - 0.05, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
      { at: UP, actor: 'bj', do: 'moveTo', to: { x: UX, y: G + 4 }, dur: 0.25, ease: 'out' },
      { at: UP, actor: 'fish2', do: 'pop', dur: 0.05 },
      { at: UP, actor: 'fish2', do: 'moveTo', to: NOSE(UX, G + 4), dur: 0.25, ease: 'out' },
      { at: UP + 0.4, actor: 'bj', do: 'shake', amount: 1.6, dur: 0.6 },
      { at: UP + 0.4, actor: 'fish2', do: 'shake', amount: 1.6, dur: 0.6 },
      // 用力一甩：魚飛回河裡
      { at: UP + 1.1, actor: 'bj', do: 'tilt', amount: -12, dur: 0.3 },
      { at: UP + 1.15, actor: 'fish2', do: 'moveTo', to: { x: 86, y: 90 }, arc: 18, dur: 0.6, ease: 'linear' },
      { at: UP + 1.15, actor: 'fish2', do: 'spin', times: 2, dur: 0.6, pivot: 'center' },
      { at: UP + 1.75, actor: 'fish2', do: 'vanish', dur: 0.05 },
      // 爬上岸，又望著對面流口水（回到 W1）
      { at: UP + 1.5, actor: 'bj', do: 'moveTo', to: { x: W1X, y: G }, arc: 6, dur: 0.45 },
      { at: UP + 2.05, actor: 'bj', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: UP + 2.6, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
      { at: UP + 2.65, actor: 'bj', do: 'hop', amount: 2.5, dur: 0.3 },
      ...breathe(UP + 3.0, D),
    ],
    fx: [
      ...riverFx(D),
      ...bubbles,
      { at: STOP, kind: 'pop', actor: 'fish', emoji: '❓', dur: 0.9 },
      ...s.fx,
      { at: UP + 0.4, kind: 'sweat', actor: 'bj', dur: 0.6 },
      ...splash(UP + 1.75, 86, 0.3).fx,
      { at: UP + 2.05, kind: 'burst', actor: 'bj', dy: 14, emoji: '💦', n: 8, dur: 0.5 },
    ],
    camera: [wide(-0.3, 0.01), shot(0.3, { x: 74, y: 60 }, 1.15, 0.8), { at: UP, dur: 0.35, do: 'shake', amount: 1.4 }],
    cues: [
      { at: 0.7, sfx: 'bubble' },
      { at: HAT, sfx: 'bubble' },
      { at: 2.5, say: '走到水裡了！他不見了！' },
      { at: TURN, sfx: 'blip' },
      { at: SINK, sfx: 'bubble' },
      ...s.cues,
      { at: UP + 0.4, sfx: 'boing' },
      ...splash(UP + 1.75, 86, 0.3).cues,
    ],
  })
})()

// 4. 到了！豬八戒吃瓜，吃了好多！——西瓜一顆一顆飛進他手裡，啃一顆、肚子大一圈，一次比一次快；
// 最後一顆啃完，瓜皮往河裡一丟，打一個大飽嗝，整個人往後一躺（結尾＝下一頁的開頭）
const EAT_K = [1.06, 1.06, 1.06, 1.05, 1.05]
const EAT_TOTAL = EAT_K.reduce((a, b) => a * b, 1)
const eat = (() => {
  // 躺下來以後拍兩下肚子、再打一個小嗝就換頁，不留不動的尾巴
  const D = 6.25
  const MOUTH = { x: E1X + 1, y: 52 }
  const moves: Move[] = []
  const fx: Fx[] = []
  const cues: Cue[] = []
  let t = 0.5
  const gaps = [1.0, 0.85, 0.75, 0.65, 0.95]
  EATEN.forEach((id, i) => {
    const fly = 0.3
    moves.push(
      { at: r2(t), actor: id, do: 'moveTo', to: MOUTH, arc: 8, dur: fly, ease: 'in' },
      { at: r2(t + fly), actor: id, do: 'vanish', dur: 0.05 },
      { at: r2(t + fly), actor: 'bj', do: 'swap', emoji: 'prop:bajie-melon' },
      { at: r2(t + fly), actor: 'bj', do: 'scaleTo', amount: EAT_K[i], dur: 0.3, ease: 'back' },
    )
    for (let k = 0; k < 3; k++) {
      moves.push({ at: r2(t + fly + 0.05 + k * 0.15), actor: 'bj', do: 'squash', amount: r2(0.08 + 0.02 * i), dur: 0.13 })
      cues.push({ at: r2(t + fly + 0.05 + k * 0.15), sfx: 'gulp' })
    }
    fx.push({ at: r2(t + fly), kind: 'burst', actor: 'bj', dy: 10, emoji: '🟥', n: 4 + i, dur: 0.45, scale: r2(0.6 + 0.1 * i) })
    t += gaps[i]
  })
  const TOSS = r2(t - 0.3)
  const FALL = r2(TOSS + 0.55)
  moves.push(
    // 最後一片瓜皮往河裡一丟
    { at: TOSS, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
    { at: TOSS, actor: 'rind', do: 'pop', dur: 0.05 },
    { at: TOSS, actor: 'rind', do: 'moveTo', to: RIND_W2, arc: 16, dur: 0.5, ease: 'linear' },
    { at: TOSS, actor: 'rind', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    // 打一個大飽嗝，往後一躺
    { at: FALL, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
    { at: FALL, actor: 'bj', do: 'flip' },
    { at: FALL, actor: 'bj', do: 'moveTo', to: { x: W2X, y: G }, dur: 0.2, ease: 'out' },
    { at: FALL, actor: 'bj', do: 'scaleTo', amount: r2(FULL / EAT_TOTAL), dur: 0.2 },
    { at: r2(FALL + 0.2), actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
    ...bob(r2(TOSS + 0.5), D, 'rind', 0.5),
    // 拍拍肚子、再打一個小嗝
    { at: r2(FALL + 0.55), actor: 'bj', do: 'squash', amount: 0.1, dur: 0.18 },
    { at: r2(FALL + 0.8), actor: 'bj', do: 'squash', amount: 0.1, dur: 0.18 },
    { at: r2(FALL + 1.0), actor: 'bj', do: 'hop', amount: 2.5, dur: 0.25 },
    { at: r2(FALL + 1.25), actor: 'bj', do: 'squash', amount: 0.06, dur: 0.4 },
  )
  fx.push(
    { at: 0.15, kind: 'pop', actor: 'bj', emoji: '😋', dur: 0.8 },
    ...splash(r2(TOSS + 0.5), RIND_W2.x, 0.4).fx,
    { at: FALL, kind: 'blow', actor: 'bj', dx: -6, dy: 8, to: { x: 96, y: 40 }, n: 3, dur: 0.6 },
    { at: r2(FALL + 0.2), kind: 'puff', actor: 'bj', n: 6, dur: 0.45 },
    { at: r2(FALL + 1.0), kind: 'blow', actor: 'bj', dx: -6, dy: 8, to: { x: 98, y: 44 }, n: 2, dur: 0.45 },
  )
  cues.push(...splash(r2(TOSS + 0.5), RIND_W2.x, 0.4).cues, { at: FALL, sfx: 'hic' }, { at: r2(FALL + 0.2), sfx: 'bonk' }, { at: r2(FALL + 0.55), sfx: 'tap' }, { at: r2(FALL + 0.8), sfx: 'tap' }, { at: r2(FALL + 1.0), sfx: 'hic' }, { at: 1.3, say: '到了！豬八戒吃瓜，吃了好多！' })
  return scene({
    duration: D,
    bg: BG,
    actors: stage([...pile, rindAt({ x: E1X + 4, y: 50 }, true), bj('bajie', E1X)]),
    moves: [...riverSet, ...moves],
    fx: [...riverFx(D), ...fx],
    camera: [right(-0.3, 0.01), lying(FALL - 0.4, 0.6)],
    cues,
  })
})()

// 5. 肚子太大了！他游不回去了！——肚子又鼓一圈；第一次往水邊滾一大段，肚子頂到水面「咚」彈回來；
// 第二次滾得更用力，肚子一碰就把整個人彈到半空、翻一圈、「碰」落回原位；然後四腳朝天亂踢，想家
const big = (() => {
  const D = 5.8
  const HIT1 = 1.15
  const HIT2 = 2.4
  const LAND2 = 3.15
  return scene({
    duration: D,
    bg: BG,
    actors: stage([...pileAfter, rindAt(RIND_W2), bj('bajie-full', W2X, G, true)]),
    moves: [
      ...riverSet,
      // 承接上一頁：已經放大到 FULL 倍
      { at: 0, actor: 'bj', do: 'scaleTo', amount: FULL, dur: 0 },
      { at: 0.2, actor: 'bj', do: 'scaleTo', amount: r2(BIG / FULL), dur: 0.5, ease: 'elastic' },
      // 第一次：往水邊滾一大段，肚子頂到水面「咚」彈回來
      { at: 0.75, actor: 'bj', do: 'rotateTo', amount: -30, dur: HIT1 - 0.75, ease: 'in', pivot: 'center' },
      { at: 0.75, actor: 'bj', do: 'moveTo', to: { x: W2X - 22, y: G }, dur: HIT1 - 0.75, ease: 'in' },
      { at: HIT1, actor: 'bj', do: 'squash', amount: 0.22, dur: 0.2 },
      { at: HIT1, actor: 'rind', do: 'shake', amount: 1, dur: 0.4 },
      { at: HIT1 + 0.05, actor: 'bj', do: 'rotateTo', amount: 30, dur: 0.5, ease: 'back', pivot: 'center' },
      { at: HIT1 + 0.05, actor: 'bj', do: 'moveTo', to: { x: W2X, y: G }, arc: 4, dur: 0.5, ease: 'back' },
      // 蓄力：鼓一下
      { at: 1.75, actor: 'bj', do: 'squash', amount: 0.15, dur: 0.3 },
      // 第二次：滾得更用力，肚子一碰就整個人彈上半空翻一圈
      { at: 2.05, actor: 'bj', do: 'rotateTo', amount: -45, dur: HIT2 - 2.05, ease: 'in', pivot: 'center' },
      { at: 2.05, actor: 'bj', do: 'moveTo', to: { x: W2X - 26, y: G }, dur: HIT2 - 2.05, ease: 'in' },
      { at: HIT2, actor: 'bj', do: 'squash', amount: 0.3, dur: 0.15 },
      { at: HIT2 + 0.05, actor: 'bj', do: 'moveTo', to: { x: W2X - 10, y: G - 26 }, dur: 0.35, ease: 'out' },
      { at: HIT2 + 0.05, actor: 'bj', do: 'rotateTo', amount: 405, dur: LAND2 - HIT2 - 0.05, pivot: 'center' },
      { at: HIT2 + 0.4, actor: 'bj', do: 'moveTo', to: { x: W2X, y: G }, dur: LAND2 - HIT2 - 0.4, ease: 'in' },
      { at: LAND2, actor: 'bj', do: 'squash', amount: 0.3, dur: 0.3 },
      // 四腳朝天亂踢
      { at: 3.45, actor: 'bj', do: 'shake', amount: 1.3, dur: 1.1 },
      ...[0, 1, 2, 3].map((i): Move => ({ at: r2(3.45 + 0.28 * i), actor: 'bj', do: 'tilt', amount: (i % 2 ? -1 : 1) * (10 + 3 * i), dur: 0.27, pivot: 'center' })),
      ...[0, 1, 2, 3].map((i): Move => ({ at: r2(3.45 + 0.28 * i), actor: 'bj', do: 'hop', amount: 2, dur: 0.25 })),
      ...breathe(4.6, D, 0.07),
      ...bob(0, D, 'rind', 0.5),
    ],
    fx: [
      ...riverFx(D),
      { at: 0.25, kind: 'burst', actor: 'bj', dy: 18, emoji: '✨', n: 6, dur: 0.6, scale: 1.2 },
      ...splash(HIT1, W2X - 28, 0.6).fx,
      { at: HIT1 + 0.1, kind: 'sweat', actor: 'bj', dur: 0.6 },
      { at: HIT2, kind: 'burst', x: W2X - 30, y: 70, emoji: '💥', n: 1, dur: 0.35, scale: 1.2 },
      { at: LAND2, kind: 'puff', actor: 'bj', n: 8, dur: 0.5 },
      { at: LAND2 + 0.05, kind: 'dizzy', actor: 'bj', dx: -12, dur: 0.8 },
      { at: 3.45, kind: 'sweat', actor: 'bj', dur: 1.1 },
      { at: 4.5, kind: 'bubble', actor: 'bj', dx: -18, dy: 8, emoji: '🏠', dur: 1.5, scale: 1.3 },
    ],
    camera: [lying(-0.3, 0.01), { at: HIT1, dur: 0.25, do: 'shake', amount: 0.8 }, wide(2.15, 0.35), { at: LAND2, dur: 0.4, do: 'shake', amount: 1.8 }],
    cues: [
      { at: 0.2, sfx: 'boing' },
      ...splash(HIT1, W2X - 28, 0.6).cues,
      { at: HIT1 + 0.05, sfx: 'boing' },
      { at: 1.3, say: '肚子太大了！他游不回去了！' },
      { at: HIT2, sfx: 'boing' },
      { at: LAND2, sfx: 'bonk' },
      { at: 3.45, sfx: 'tap' },
    ],
  })
})()

/** W2：右岸躺著、肚子超大，瓜皮浮在水邊，只剩一顆瓜。after 是畫在他前面的 */
const w2Moves = (D: number): Move[] => [...riverSet, { at: 0, actor: 'bj', do: 'scaleTo', amount: BIG, dur: 0 }, ...bob(0, D, 'rind', 0.5)]
const w2Actors = (after: Actor[] = [], top: Actor[] = []) => stage([...pileAfter, rindAt(RIND_W2), bj('bajie-full', W2X, G, true), ...after], top)

// 6a. 瓜（往下走）：瓜皮一閃，他想到了，肚子一彈跳進瓜皮裡，瓜皮變成小船，一路漂回家，靠岸滾上岸
const backMelon = (() => {
  // 上岸後拍拍肚子、笑一下就換頁
  const D = 6.25
  const IN = 0.75
  const SIT = 1.3
  const ARRIVE = 4.4
  const paddles: Fx[] = []
  for (let t = 1.7; t < ARRIVE - 0.2; t += 0.6) paddles.push({ at: r2(t), kind: 'burst', x: r2(RIND_W2.x - (RIND_W2.x - BOAT_X) * (t - SIT) / (ARRIVE - SIT) + 18), y: SURF - 2, emoji: '💦', n: 3, dur: 0.4, scale: 0.7 })
  return scene({
    duration: D,
    bg: BG,
    // 坐進瓜皮裡：瓜皮畫在他前面
    actors: stage([...pileAfter, bj('bajie-full', W2X, G, true), rindAt(RIND_W2)]),
    moves: [
      ...riverSet,
      { at: 0, actor: 'bj', do: 'scaleTo', amount: BIG, dur: 0 },
      { at: 0.15, actor: 'rind', do: 'hop', amount: 3, dur: 0.3 },
      { at: 0.4, actor: 'bj', do: 'hop', amount: 2, dur: 0.25 },
      // 肚子一彈，跳進瓜皮裡
      { at: IN - 0.2, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.2 },
      { at: IN, actor: 'bj', do: 'moveTo', to: inBoat(RIND_W2.x), arc: 14, dur: SIT - IN, ease: 'linear' },
      { at: IN, actor: 'bj', do: 'tilt', amount: -15, dur: SIT - IN, pivot: 'center' },
      { at: SIT, actor: 'rind', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: SIT, actor: 'rind', do: 'hop', amount: -3, dur: 0.35 },
      { at: SIT, actor: 'bj', do: 'hop', amount: -3, dur: 0.35 },
      // 一路漂回家
      { at: SIT + 0.35, actor: 'bj', do: 'moveTo', to: inBoat(BOAT_X), dur: ARRIVE - SIT - 0.35 },
      { at: SIT + 0.35, actor: 'rind', do: 'moveTo', to: { x: BOAT_X, y: RIND_Y }, dur: ARRIVE - SIT - 0.35 },
      ...bob(SIT + 0.4, ARRIVE, 'bj', 0.9),
      ...bob(SIT + 0.4, ARRIVE, 'rind', 0.9),
      // 靠岸：咚一下，滾上岸
      { at: ARRIVE, actor: 'rind', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: ARRIVE + 0.25, actor: 'bj', do: 'moveTo', to: { x: HOME_X, y: G }, arc: 12, dur: 0.5, ease: 'linear' },
      { at: ARRIVE + 0.25, actor: 'bj', do: 'tilt', amount: -20, dur: 0.5, pivot: 'center' },
      { at: ARRIVE + 0.75, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
      ...bob(ARRIVE + 0.4, D, 'rind', 0.5),
      { at: ARRIVE + 1.1, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.18 },
      { at: ARRIVE + 1.35, actor: 'bj', do: 'squash', amount: 0.1, dur: 0.18 },
      { at: ARRIVE + 1.6, actor: 'bj', do: 'tilt', amount: -6, dur: 0.4, pivot: 'center' },
    ],
    fx: [
      ...riverFx(D),
      { at: 0.15, kind: 'burst', actor: 'rind', dy: 4, emoji: '✨', n: 6, dur: 0.6 },
      { at: 0.4, kind: 'pop', actor: 'bj', dx: -14, emoji: '💡', dur: 0.8 },
      ...splash(SIT, RIND_W2.x, 0.6).fx,
      ...paddles,
      { at: 2.2, kind: 'zzz', actor: 'bj', dx: -10, emoji: '🎵', dur: 1.6 },
      { at: ARRIVE + 0.8, kind: 'puff', actor: 'bj', n: 6, dur: 0.45 },
      { at: ARRIVE + 1.1, kind: 'pop', actor: 'bj', emoji: '😊', dur: 0.9 },
    ],
    camera: [wide(-0.3, 0.01), left(ARRIVE - 0.4, 0.8)],
    cues: [
      { at: 0.15, sfx: 'blip' },
      { at: IN, sfx: 'boing' },
      ...splash(SIT, RIND_W2.x, 0.6).cues,
      { at: 1.6, say: '坐在瓜皮上，過河了！' },
      { at: ARRIVE, sfx: 'tap' },
      { at: ARRIVE + 0.75, sfx: 'bonk' },
    ],
  })
})()

// 6b. 龜：小烏龜從水裡冒出來（水花把瓜皮推開），爬上岸拍拍龜殼要載他；他一坐上去，烏龜被壓成一片烏龜餅，
// 頭和四隻腳從他身體下面露出來亂划、冒汗、😵；他滾開以後，扁扁的烏龜餅自己留在地上（鏡頭推近）——
// 「啵」彈回原狀、瞪他一眼、氣呼呼地游走，瓜皮漂回原位（回到 W2）。烏龜畫在他前面，壓扁的樣子才看得到
const backTurtle = (() => {
  const D = 6.8
  const TX = 98
  const TS = 22
  const TG = r2(77 - 0.42 * TS)
  const SIT = 1.4
  const OFF = 2.75
  const POP = 3.75
  /** 瓜皮被水花推開的地方（跟烏龜錯開） */
  const RIND_AWAY = { x: 52, y: RIND_Y }
  const turtle: Actor = { id: 'turtle', emoji: 'prop:turtle', x: 92, y: 88, size: TS, flip: true, hidden: true }
  return scene({
    duration: D,
    bg: BG,
    actors: w2Actors([turtle]),
    moves: [
      ...w2Moves(D),
      // 從水裡冒出來，瓜皮被推開；爬上岸，拍拍龜殼：坐我！
      { at: 0.2, actor: 'turtle', do: 'pop', dur: 0.1 },
      { at: 0.2, actor: 'turtle', do: 'moveTo', to: { x: 92, y: 73 }, dur: 0.3, ease: 'out' },
      { at: 0.25, actor: 'rind', do: 'moveTo', to: RIND_AWAY, dur: 0.6, ease: 'out' },
      { at: 0.55, actor: 'turtle', do: 'moveTo', to: { x: TX, y: TG }, arc: 5, dur: 0.35 },
      // 轉身背對他、拍拍龜殼（頭朝左，等一下壓扁時頭露在他身體外面）
      { at: 0.9, actor: 'turtle', do: 'flip' },
      { at: 0.95, actor: 'turtle', do: 'hop', amount: 3, dur: 0.2 },
      // 他滾上去：坐在龜殼上
      { at: 1.05, actor: 'bj', do: 'moveTo', to: { x: TX + 10, y: G - 7 }, arc: 5, dur: SIT - 1.05 },
      // 壓扁：烏龜餅，頭和四隻腳從他身體下面露出來亂划
      { at: SIT, actor: 'turtle', do: 'stretchTo', amount: 2.0, dur: 0.12, ease: 'out' },
      { at: SIT, actor: 'bj', do: 'moveTo', to: { x: TX + 10, y: G - 3 }, dur: 0.12, ease: 'in' },
      { at: SIT + 0.12, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.3 },
      { at: SIT + 0.3, actor: 'turtle', do: 'shake', amount: 1.2, dur: OFF - SIT - 0.3 },
      { at: 1.9, actor: 'bj', do: 'tilt', amount: 6, dur: 0.35, pivot: 'center' },
      { at: 2.3, actor: 'bj', do: 'tilt', amount: -6, dur: 0.35, pivot: 'center' },
      // 他滾開：烏龜餅自己留在地上
      { at: OFF, actor: 'bj', do: 'moveTo', to: { x: W2X, y: G }, arc: 6, dur: 0.4 },
      { at: OFF + 0.5, actor: 'turtle', do: 'shake', amount: 0.3, dur: 0.6 },
      // 啵！彈回原狀
      { at: POP, actor: 'turtle', do: 'stretchTo', amount: 0.5, dur: 0.5, ease: 'elastic' },
      { at: POP, actor: 'turtle', do: 'hop', amount: 5, dur: 0.35 },
      // 轉過來瞪他一眼
      { at: 4.3, actor: 'turtle', do: 'flip' },
      { at: 4.4, actor: 'turtle', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 4.4, actor: 'turtle', do: 'hop', amount: 2, dur: 0.2 },
      { at: 4.75, actor: 'turtle', do: 'hop', amount: 2, dur: 0.2 },
      // 轉身游走，瓜皮漂回原位
      { at: 5.0, actor: 'turtle', do: 'flip' },
      { at: 5.05, actor: 'turtle', do: 'moveTo', to: { x: 90, y: 76 }, arc: 4, dur: 0.35 },
      { at: 5.4, actor: 'turtle', do: 'moveTo', to: { x: 78, y: 94 }, dur: 0.7, ease: 'in' },
      { at: 6.1, actor: 'turtle', do: 'vanish', dur: 0.05 },
      { at: 5.2, actor: 'rind', do: 'moveTo', to: RIND_W2, dur: 1.2 },
      ...breathe(OFF + 0.5, D, 0.05),
    ],
    fx: [
      ...riverFx(D),
      ...splash(0.2, 100, 0.5).fx,
      { at: 0.95, kind: 'pop', actor: 'turtle', emoji: '💪', dur: 0.6 },
      { at: SIT, kind: 'burst', x: TX, y: 66, emoji: '💥', n: 1, dur: 0.4, scale: 1.3 },
      { at: SIT + 0.05, kind: 'puff', x: TX, y: 74, n: 6, dur: 0.45 },
      { at: SIT + 0.3, kind: 'burst', x: TX - 20, y: 70, emoji: '💦', n: 4, dur: 0.5, scale: 0.7 },
      { at: SIT + 0.35, kind: 'pop', x: TX - 21, y: 62, emoji: '😵', dur: 1.0 },
      { at: 2.0, kind: 'burst', x: TX - 16, y: 72, emoji: '💦', n: 4, dur: 0.5, scale: 0.7 },
      { at: 1.9, kind: 'sweat', actor: 'bj', dur: 0.7 },
      { at: OFF + 0.4, kind: 'dizzy', x: TX - 14, y: 64, dur: 0.95 },
      { at: POP, kind: 'burst', actor: 'turtle', emoji: '✨', n: 6, dur: 0.5 },
      { at: 4.4, kind: 'pop', actor: 'turtle', emoji: '💢', dur: 0.8 },
      ...splash(5.4, 84, 0.4).fx,
      { at: 6.0, kind: 'burst', x: 78, y: SURF - 3, emoji: '🫧', n: 4, dur: 0.6, scale: 1.3 },
    ],
    camera: [wide(-0.3, 0.01), shot(0.5, { x: 104, y: 50 }, 1.2, 0.6), { at: SIT, dur: 0.35, do: 'shake', amount: 1.6 },
      shot(OFF + 0.2, { x: 98, y: 60 }, 1.5, 0.5), wide(4.9, 0.8)],
    cues: [
      ...splash(0.2, 100, 0.5).cues,
      { at: SIT, sfx: 'deflate' },
      { at: SIT + 0.02, sfx: 'bonk' },
      { at: 1.8, say: '龜太小了！龜起不來！' },
      { at: POP, sfx: 'boing' },
      { at: 4.4, sfx: 'tap' },
      ...splash(5.4, 84, 0.4).cues,
    ],
  })
})()

// 6c. 蝶：小蝴蝶飛來抓住他的肚子拚命拉，一次比一次用力：第一次屁股抬起一點點就掉下來（小震）；
// 第二次整個人被拉高一截、撐半秒，蝴蝶抖到冒汗，啪地掉下來（大震、灰塵）；第三次被圓肚子一彈飛上天、轉圈頭暈，
// 掉在他肚子上趴著喘，最後歪歪斜斜飛走（回到 W2）
const backFly = (() => {
  const D = 7.4
  /** 躺著的肚子頂（往左翻、放大 BIG 倍） */
  const BELLY = { x: W2X + 14, y: 50 }
  const fly: Actor = { id: 'fly', emoji: 'prop:butterfly', x: 40, y: 14, size: 18, hidden: true, float: true }
  /** 拍翅膀：快速一扁一長 */
  const flap = (t0: number, t1: number, k = 0.25, gap = 0.12): Move[] => {
    const out: Move[] = []
    for (let t = t0, i = 0; t < t1 - 0.05; t += gap, i++) out.push({ at: r2(t), actor: 'fly', do: 'squash', amount: i % 2 ? -k : k, dur: r2(gap * 0.95) })
    return out
  }
  /** 拉一次：蝴蝶先往上拉（使勁），再連豬八戒一起往上 lift、撐 hold 秒，一起掉下來 */
  const pull = (t: number, lift: number, up: number, hold = 0): Move[] => [
    { at: t, actor: 'fly', do: 'moveTo', to: { x: BELLY.x, y: r2(BELLY.y - 3) }, dur: 0.2, ease: 'out' },
    { at: r2(t + 0.2), actor: 'bj', do: 'moveTo', to: { x: W2X, y: r2(G - lift) }, dur: up, ease: 'out' },
    { at: r2(t + 0.2), actor: 'fly', do: 'moveTo', to: { x: BELLY.x, y: r2(BELLY.y - 3 - lift) }, dur: up, ease: 'out' },
    { at: r2(t + 0.2 + up + hold), actor: 'bj', do: 'moveTo', to: { x: W2X, y: G }, dur: 0.15, ease: 'in' },
    { at: r2(t + 0.2 + up + hold), actor: 'fly', do: 'moveTo', to: BELLY, dur: 0.15, ease: 'in' },
    { at: r2(t + 0.35 + up + hold), actor: 'bj', do: 'squash', amount: r2(0.12 + lift * 0.025), dur: 0.25 },
  ]
  const P1 = 1.1, P2 = 1.95, P3 = 3.45, FLING = 3.95
  const T2 = r2(P2 + 0.2 + 0.4) // 第二次拉到最高
  const DROP2 = r2(T2 + 0.5)
  const LIE = 4.85 // 掉在肚子上
  const AWAY = 5.85 // 飛走
  return scene({
    duration: D,
    bg: BG,
    actors: w2Actors([], [fly]),
    moves: [
      ...w2Moves(D),
      // 飛進來：一上一下
      { at: 0.1, actor: 'fly', do: 'pop', dur: 0.1 },
      { at: 0.1, actor: 'fly', do: 'moveTo', to: { x: 84, y: 24 }, dur: 0.45 },
      { at: 0.55, actor: 'fly', do: 'moveTo', to: BELLY, arc: 6, dur: 0.45 },
      ...flap(0.1, 1.0, 0.2, 0.15),
      // 第一次：屁股抬起一點點就掉
      ...flap(P1 - 0.1, P1 + 0.7, 0.3, 0.08),
      ...pull(P1, 2, 0.3),
      // 第二次：整個人被拉高一截、身體拉長，撐半秒，蝴蝶抖到冒汗
      ...flap(P2 - 0.1, DROP2, 0.4, 0.05),
      { at: P2 + 0.2, actor: 'bj', do: 'stretchTo', amount: 0.88, dur: 0.4, ease: 'out' },
      { at: T2, actor: 'fly', do: 'shake', amount: 1, dur: 0.5 },
      { at: T2, actor: 'bj', do: 'shake', amount: 0.5, dur: 0.5 },
      { at: DROP2, actor: 'bj', do: 'stretchTo', amount: r2(1 / 0.88), dur: 0.15 },
      ...pull(P2, 8, 0.4, 0.5),
      // 第三次：抬一點點——肚子一彈，蝴蝶飛上天
      ...flap(P3 - 0.15, FLING, 0.4, 0.05),
      { at: P3 - 0.15, actor: 'fly', do: 'tint', filter: 'hue-rotate(-25deg) saturate(1.6)' },
      ...pull(P3, 1.5, 0.2),
      { at: FLING, actor: 'fly', do: 'tint', filter: '' },
      { at: FLING, actor: 'bj', do: 'squash', amount: -0.12, dur: 0.25 },
      { at: FLING, actor: 'fly', do: 'moveTo', to: { x: BELLY.x - 12, y: 20 }, dur: 0.4, ease: 'out' },
      { at: FLING, actor: 'fly', do: 'spin', times: 2, dur: 0.6, pivot: 'center' },
      // 掉在肚子上趴著喘
      { at: 4.4, actor: 'fly', do: 'moveTo', to: { x: BELLY.x - 4, y: BELLY.y + 1 }, dur: LIE - 4.4, ease: 'in' },
      { at: LIE, actor: 'fly', do: 'rotateTo', amount: 70, dur: 0.2, pivot: 'center' },
      { at: LIE, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.2 },
      ...[0, 1, 2].map((i): Move => ({ at: r2(LIE + 0.25 + 0.25 * i), actor: 'fly', do: 'squash', amount: 0.2, dur: 0.2 })),
      // 歪歪斜斜飛走
      { at: AWAY, actor: 'fly', do: 'rotateTo', amount: -70, dur: 0.2, pivot: 'center' },
      { at: AWAY + 0.1, actor: 'fly', do: 'moveTo', to: { x: 98, y: 30 }, dur: 0.6 },
      { at: AWAY + 0.7, actor: 'fly', do: 'moveTo', to: { x: 56, y: -18 }, dur: 0.75, ease: 'in' },
      ...[0, 1, 2, 3, 4].map((i): Move => ({ at: r2(AWAY + 0.1 + 0.25 * i), actor: 'fly', do: 'tilt', amount: i % 2 ? -25 : 25, dur: 0.24, pivot: 'center' })),
      ...flap(AWAY + 0.1, D - 0.1, 0.15, 0.2),
      ...breathe(LIE + 0.3, D, 0.05),
    ],
    fx: [
      ...riverFx(D),
      { at: P1 + 0.55, kind: 'puff', actor: 'bj', n: 3, dur: 0.3 },
      { at: P2 + 0.3, kind: 'sweat', actor: 'fly', dur: 1.0 },
      { at: T2, kind: 'pop', actor: 'bj', dx: -16, emoji: '😅', dur: 0.8 },
      { at: r2(DROP2 + 0.15), kind: 'puff', actor: 'bj', n: 9, dur: 0.5 },
      { at: r2(DROP2 + 0.15), kind: 'burst', x: W2X - 6, y: 74, emoji: '💥', n: 1, dur: 0.35, scale: 1.1 },
      { at: P3, kind: 'sweat', actor: 'fly', dur: 0.5 },
      { at: FLING, kind: 'burst', x: BELLY.x, y: BELLY.y, emoji: '💥', n: 1, dur: 0.3, scale: 0.8 },
      { at: 4.4, kind: 'dizzy', actor: 'fly', dur: 0.8 },
      { at: LIE + 0.1, kind: 'pop', actor: 'fly', dx: 8, emoji: '😮‍💨', dur: 0.9 },
      { at: LIE + 0.2, kind: 'zzz', actor: 'fly', emoji: '💦', dur: 0.8 },
    ],
    camera: [wide(-0.3, 0.01), shot(0.8, { x: 118, y: 44 }, 1.25, 0.5),
      { at: P1 + 0.55, dur: 0.25, do: 'shake', amount: 0.6 }, { at: r2(DROP2 + 0.15), dur: 0.4, do: 'shake', amount: 1.8 }, wide(AWAY, 0.8)],
    cues: [
      { at: 0.3, sfx: 'blip' },
      { at: P1 + 0.55, sfx: 'tap' },
      { at: 1.9, say: '蝶拉不起來！蝶累了！' },
      { at: r2(DROP2 + 0.15), sfx: 'bonk' },
      { at: FLING, sfx: 'boing' },
      { at: LIE, sfx: 'tap' },
      { at: AWAY + 0.1, sfx: 'whoosh' },
    ],
  })
})()

// 7. 到家了。肚子叫了。他想再吃！——肚子「咻」地消下去，馬上又咕嚕叫；回頭看到對面還剩一顆瓜，
// 星星眼，一跳跳進瓜皮船，往對面划回去、嘴巴噴水（定格：他又要去吃了）
const home = (() => {
  const D = 7.8
  const R = rumble(1.7, HOME_X + 2, 3)
  const JUMP = 3.9
  const LAND = 4.4
  const GO = 4.75
  /** 划到這裡停下來定格（全書最後一格） */
  const STOP = 7.05
  const END_X = 90
  const paddles: Fx[] = []
  for (let t = GO + 0.1; t < STOP - 0.1; t += 0.35) paddles.push({ at: r2(t), kind: 'burst', x: r2(BOAT_X + (END_X - BOAT_X) * (t - GO) / (STOP - GO) - 20), y: SURF - 2, emoji: '💦', n: 4, dur: 0.4, scale: 0.9 })
  return scene({
    duration: D,
    bg: BG,
    actors: stage([...pileAfter, bj('bajie-full', HOME_X, G, true), rindAt({ x: BOAT_X, y: RIND_Y })]),
    moves: [
      ...riverSet,
      { at: 0, actor: 'bj', do: 'scaleTo', amount: BIG, dur: 0 },
      ...bob(0, GO, 'rind', 0.4),
      // 肚子咻地消下去，站起來
      { at: 0.3, actor: 'bj', do: 'shake', amount: 0.8, dur: 0.6 },
      { at: 0.3, actor: 'bj', do: 'scaleTo', amount: r2(1 / BIG), dur: 0.6, ease: 'out' },
      { at: 0.95, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
      { at: 0.95, actor: 'bj', do: 'flip' },
      { at: 0.95, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
      ...R.moves,
      { at: 1.75, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
      // 回頭看到對面還剩一顆瓜
      { at: 2.6, actor: 'p3', do: 'hop', amount: 3, dur: 0.3 },
      { at: 2.9, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
      { at: 2.9, actor: 'bj', do: 'hop', amount: 5, dur: 0.35 },
      { at: 3.4, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
      // 一跳跳進瓜皮船
      { at: 3.6, actor: 'bj', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: JUMP, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
      { at: JUMP, actor: 'bj', do: 'moveTo', to: inBoat(BOAT_X), arc: 18, dur: LAND - JUMP, ease: 'linear' },
      { at: LAND, actor: 'rind', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: LAND, actor: 'rind', do: 'hop', amount: -3, dur: 0.35 },
      { at: LAND, actor: 'bj', do: 'hop', amount: -3, dur: 0.35 },
      // 往對面划回去
      { at: GO, actor: 'bj', do: 'moveTo', to: inBoat(END_X), dur: STOP - GO, ease: 'out' },
      { at: GO, actor: 'rind', do: 'moveTo', to: { x: END_X, y: RIND_Y }, dur: STOP - GO, ease: 'out' },
      ...bob(GO, STOP, 'bj', 1.1),
      ...bob(GO, STOP, 'rind', 1.1),
      // 等不及：在船上往前一蹦一蹦
      { at: 5.1, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
      { at: 5.9, actor: 'bj', do: 'hop', amount: 3, dur: 0.3 },
      // 定格前最後輕輕晃一下
      ...bob(STOP, D + 0.15, 'bj', 0.4),
      ...bob(STOP, D + 0.15, 'rind', 0.4),
    ],
    fx: [
      ...riverFx(D),
      { at: 0.3, kind: 'blow', actor: 'bj', dx: -14, dy: 10, to: { x: 4, y: 40 }, n: 5, dur: 0.6, scale: 1.3 },
      ...R.fx,
      { at: 2.6, kind: 'burst', actor: 'p3', emoji: '✨', n: 6, dur: 0.6 },
      { at: 2.95, kind: 'burst', actor: 'bj', dy: -6, emoji: '💖', n: 6, dur: 0.6, scale: 0.9 },
      ...splash(LAND, BOAT_X, 0.6).fx,
      ...paddles,
      // 往前指：衝啊！
      { at: 5.0, kind: 'pop', actor: 'bj', dx: 18, dy: 10, emoji: '👉', dur: 1.6, scale: 1.3 },
      { at: 6.2, kind: 'fountain', actor: 'bj', dx: 12, dy: 6, emoji: '💧', n: 7, dur: 0.8, scale: 1.2 },
      { at: 5.6, kind: 'bubble', actor: 'bj', dx: 4, emoji: '🍉', dur: 4, scale: 1.4 },
    ],
    camera: [left(-0.3, 0.01), wide(2.4, 0.7)],
    cues: [
      { at: 0.3, sfx: 'deflate' },
      { at: 0.5, say: '到家了。肚子叫了。他想再吃！' },
      ...R.cues,
      { at: 2.9, sfx: 'blip' },
      { at: JUMP, sfx: 'boing' },
      ...splash(LAND, BOAT_X, 0.6).cues,
      { at: GO, sfx: 'whoosh' },
      { at: 6.2, sfx: 'bubble' },
    ],
  })
})()

const scenes: Scenes = {
  hungry,
  river,
  'cross:游': crossSwim,
  'cross:跳': crossJump,
  'cross:走': crossWalk,
  eat,
  big,
  'back:瓜': backMelon,
  'back:龜': backTurtle,
  'back:蝶': backFly,
  home,
}

export default scenes
