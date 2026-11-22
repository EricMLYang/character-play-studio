// 演的是字面意思：屁屁＋偵探——拿大放大鏡找線索的兔子偵探，一彎腰屁屁就「噗」一聲（臉不是屁股形狀，屁從屁屁出來）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：兔子偵探一彎腰用放大鏡找線索，屁屁就「噗」一聲，把背後的落葉堆吹掉一層。
// 開場小忍者抱著偷來的紅蘿蔔，一溜煙鑽進她背後的落葉堆，只露出紅頭巾。
// 同一個彎腰、同一團黃綠色的屁、同一聲「噗」，三次只有結果變大：吹掉幾片葉子、露出頭巾 → 吹掉半堆、忍者拿一片葉子擋臉
// → 先停一拍（她彎最低、屁屁抖最兇，忍者探頭一看嚇到），第三次噗——整堆落葉吹光，忍者被燻得頭昏坐在地上、蘿蔔掉出來。
// 反轉：她根本不知道是自己破的案，一回頭看到小偷，指著他得意：「屁屁偵探」。
const S = 36 // 兔子偵探的 size
const G = 77 - 0.42 * S // 站在地上的 y
const BX = 58 // 她每次都站在這裡找（面向左邊，屁屁朝右邊的落葉堆）
const BUTT = { x: BX + 11, y: G + 3 } // 彎腰時屁屁（尾巴）的位置
const PILE = { x: 96, size: 40 }
const PY = 77 - 0.42 * PILE.size
const NS = 26 // 忍者
const NY = 77 - 0.42 * NS
const NX = 97
const HIDE = NY + 4 // 躲在落葉堆裡：只露出頭巾
/** 屁的顏色：白雲圖染成黃綠色 */
const FART = 'brightness(0.9) sepia(1) saturate(3) hue-rotate(35deg)'
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 放大鏡跟著手：站著拿在胸前、彎腰時鏡片朝地上 */
const GLASS = {
  stand: { x: BX - 11, y: G + 4, r: -15 },
  bend: { x: BX - 13, y: G + 10, r: -80 },
}
let glassR = 0
function glass(at: number, to: { x: number; y: number; r: number }, dur = 0.2): Move[] {
  const d = to.r - glassR
  glassR = to.r
  const moves: Move[] = [{ at, actor: 'glass', do: 'moveTo', to: { x: to.x, y: to.y }, dur, ease: 'out' }]
  if (d) moves.push({ at, actor: 'glass', do: 'rotateTo', amount: d, dur })
  return moves
}

/**
 * 噗（每一次都一樣）：彎腰把放大鏡湊到地上 → 屁屁翹起來抖一抖 →「噗」一團黃綠色的屁往右噴，背後的落葉堆被吹掉一層 → 她嚇一跳彈起來。
 * k 是第幾次（0、1、2），越後面屁越大、葉子飛越多、落葉堆越小、音效多疊一個。p 是噗的那一刻；bend 是彎下去的那一刻。
 */
function toot(p: number, k: number, bend = p - 0.7) {
  const cloud = `fart${k + 1}`
  const moves: Move[] = [
    { at: bend, actor: 'det', do: 'swap', emoji: 'hero:bunny/bow' },
    ...glass(bend, GLASS.bend),
    // 屁屁翹起來、抖一抖
    { at: p - 0.4, actor: 'det', do: 'squash', amount: -0.1, dur: 0.25 },
    { at: p - 0.3, actor: 'det', do: 'shake', amount: 0.4 + 0.3 * k, dur: 0.28 },
    // 噗！
    { at: p, actor: 'det', do: 'squash', amount: 0.2 + 0.05 * k, dur: 0.2 },
    { at: p, actor: cloud, do: 'pop', dur: 0.12 },
    { at: p, actor: cloud, do: 'scaleTo', amount: [1.8, 2.2, 2.6][k], dur: 0.45, ease: 'out' },
    { at: p, actor: cloud, do: 'moveTo', to: { x: BUTT.x + 9 + 3 * k, y: BUTT.y - 3 - 2 * k }, dur: 0.5, ease: 'out' },
    { at: p + 0.55, actor: cloud, do: 'vanish', dur: 0.3 },
    // 落葉堆被吹掉一層
    { at: p + 0.08, actor: 'pile', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.3 },
    // 嚇一跳彈起來（傻眼停住）
    { at: p + 0.1, actor: 'det', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: p + 0.1, actor: 'det', do: 'hop', amount: 4 + k, dur: 0.3 },
    ...glass(p + 0.1, GLASS.stand, 0.15),
    { at: p + 0.1, actor: 'glass', do: 'hop', amount: 4 + k, dur: 0.3 },
  ]
  const fx: Fx[] = [
    { at: p, kind: 'blow', x: BUTT.x + 2, y: BUTT.y, to: { x: PILE.x - 4, y: PY - 2 }, n: 3 + k, dur: 0.45 },
    { at: p + 0.05, kind: 'stink', actor: cloud, dur: 1.0 },
    { at: p + 0.1, kind: 'blow', actor: 'pile', dy: 4, emoji: '🍂', to: { x: PILE.x + 34 + 6 * k, y: 30 - 4 * k }, n: 2 + 3 * k, dur: 0.7, scale: 1.3 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: p, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: BUTT.x + 6, y: BUTT.y } },
    { at: p, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一個音效（噗＋洩氣），一次比一次多疊一個
  const cues: Cue[] = [{ at: p, sfx: 'poof' }, { at: p + 0.03, sfx: 'deflate' }]
  if (k >= 1) cues.push({ at: p + 0.08, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: p + 0.12, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

const P1 = 1.9, P2 = 3.8, P3 = 6.5
const t1 = toot(P1, 0)
const t2 = toot(P2, 1)
const t3 = toot(P3, 2, P3 - 1.3) // 第三次彎最久
const TURN = P3 + 1.0 // 她回頭
const POSE = TURN + 0.45 // 指著小偷亮相

export default scene({
  duration: 10.4,
  bg: { top: '#9FD3F0', bottom: '#FFF1CC', floor: '#D9A55B', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 140, y: 77 - 0.42 * 56, size: 56 },
    { id: 'maple', emoji: 'prop:maple-leaf', x: 22, y: 72.5, size: 9, float: true },
    // 三團屁（同一張雲染黃綠色）：畫在忍者與落葉堆後面，吹開時看得到誰被吹到
    { id: 'fart1', emoji: 'prop:smoke', x: BUTT.x + 2, y: BUTT.y, size: 9, hidden: true, float: true, tint: FART },
    { id: 'fart2', emoji: 'prop:smoke', x: BUTT.x + 2, y: BUTT.y, size: 10, hidden: true, float: true, tint: FART },
    { id: 'fart3', emoji: 'prop:smoke', x: BUTT.x + 2, y: BUTT.y, size: 11, hidden: true, float: true, tint: FART },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 160, y: NY, size: NS },
    { id: 'carrot', emoji: '🥕', x: 151, y: NY + 4, size: 11, pivot: 'center' },
    { id: 'pile', emoji: 'prop:leaf-pile', x: PILE.x, y: PY, size: PILE.size },
    { id: 'det', emoji: 'hero:bunny/idle', x: BX, y: G, size: S },
    { id: 'glass', emoji: '🔍', x: GLASS.stand.x, y: GLASS.stand.y, size: 12, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：小忍者抱著偷來的紅蘿蔔衝進來，一跳鑽進落葉堆（偵探面向另一邊，正拿放大鏡看）
    { at: 0, actor: 'ninja', do: 'moveTo', to: { x: NX + 8, y: NY }, dur: 0.6, ease: 'out' },
    { at: 0, actor: 'carrot', do: 'moveTo', to: { x: NX - 1, y: NY + 4 }, dur: 0.6, ease: 'out' },
    { at: 0.65, actor: 'ninja', do: 'moveTo', to: { x: NX, y: HIDE }, arc: 6, dur: 0.35, ease: 'in' },
    { at: 0.65, actor: 'carrot', do: 'moveTo', to: { x: NX - 6, y: HIDE + 4 }, arc: 6, dur: 0.35, ease: 'in' },
    { at: 1.0, actor: 'pile', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 0.2, actor: 'glass', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 0.3, actor: 'det', do: 'tilt', amount: -5, dur: 0.6 },

    // 第一次：吹掉幾片葉子，頭巾露出來
    ...t1.moves,
    { at: P1 + 0.1, actor: 'pile', do: 'scaleTo', amount: 0.82, dur: 0.3, ease: 'out' },
    { at: P1 + 0.15, actor: 'ninja', do: 'moveTo', to: { x: NX, y: HIDE - 1.5 }, dur: 0.2 },
    { at: P1 + 0.7, actor: 'det', do: 'swap', emoji: 'hero:bunny/idle' },

    // 第二次：吹掉半堆，忍者拿一片葉子擋臉
    ...t2.moves,
    { at: P2 + 0.1, actor: 'pile', do: 'scaleTo', amount: 0.72, dur: 0.3, ease: 'out' },
    { at: P2 + 0.15, actor: 'ninja', do: 'moveTo', to: { x: NX, y: NY + 1 }, dur: 0.2 },
    { at: P2 + 0.35, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: P2 + 0.35, actor: 'ninja', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: P2 + 0.7, actor: 'det', do: 'swap', emoji: 'hero:bunny/idle' },

    // 停一拍：她彎最低、屁屁抖最兇；忍者放下葉子探頭一看——嚇到
    ...t3.moves,
    { at: P3 - 0.9, actor: 'det', do: 'shake', amount: 0.5, dur: 0.5 },
    { at: P3 - 0.75, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: P3 - 0.75, actor: 'ninja', do: 'hop', amount: 2, dur: 0.25 },
    // 第三次：整堆落葉吹光，忍者被燻得頭昏、蘿蔔掉出來
    { at: P3 + 0.08, actor: 'pile', do: 'moveTo', to: { x: PILE.x + 34, y: PY - 3 }, dur: 0.55, ease: 'linear' },
    { at: P3 + 0.08, actor: 'pile', do: 'rotateTo', amount: 50, dur: 0.55 },
    { at: P3 + 0.08, actor: 'pile', do: 'scaleTo', amount: 0.5, dur: 0.55 },
    { at: P3 + 0.6, actor: 'pile', do: 'vanish', dur: 0.2 },
    { at: P3 + 0.1, actor: 'ninja', do: 'moveTo', to: { x: NX + 6, y: NY }, dur: 0.3, ease: 'out' },
    { at: P3 + 0.1, actor: 'ninja', do: 'tilt', amount: 10, dur: 0.5 },
    { at: P3 + 0.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: P3 + 0.12, actor: 'carrot', do: 'moveTo', to: { x: 84, y: 71.5 }, arc: 12, dur: 0.6, ease: 'out' },
    { at: P3 + 0.12, actor: 'carrot', do: 'spin', times: 2, dur: 0.6 },

    // 反轉：她回頭，看到小偷——指著他得意亮相
    { at: TURN, actor: 'det', do: 'flip' },
    { at: TURN, actor: 'det', do: 'swap', emoji: 'hero:bunny/surprised' },
    ...glass(TURN, { x: BX - 9, y: G + 5, r: 15 }, 0.1),
    { at: POSE, actor: 'det', do: 'swap', emoji: 'hero:bunny/point' },
    { at: POSE, actor: 'det', do: 'scaleTo', amount: 1.1, dur: 0.35, ease: 'back' },
    ...glass(POSE, { x: BX - 8, y: G + 4, r: -10 }, 0.2),
    // 定格裡還有一點動：忍者頭昏晃一晃、她得意地跳一下
    { at: POSE + 1.0, actor: 'ninja', do: 'tilt', amount: -8, dur: 0.6 },
    { at: POSE + 1.3, actor: 'det', do: 'hop', amount: 3, dur: 0.3 },
    { at: POSE + 1.3, actor: 'glass', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 0.95, kind: 'burst', actor: 'pile', emoji: '🍂', n: 5, dur: 0.6 },
    ...t1.fx,
    ...t2.fx,
    { at: P3 - 0.9, kind: 'sweat', actor: 'ninja', dur: 0.6 },
    ...t3.fx,
    { at: P3 + 0.3, kind: 'stink', actor: 'ninja', dur: 1.8 },
    { at: P3 + 0.7, kind: 'dizzy', actor: 'ninja', dur: 2.5 },
    { at: POSE, kind: 'burst', actor: 'det', emoji: '✨', n: 10, dy: -12, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.45, kind: 'burst', actor: 'det', emoji: '🎉', n: 7, dy: -12, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.45, to: look(78, 54, 1.45) },
    ...t1.camera,
    ...t2.camera,
    // 停一拍：慢慢推近屁屁和落葉堆
    { at: P3 - 1.1, dur: 0.9, do: 'zoom', amount: 1.6, to: look(80, 58, 1.6) },
    ...t3.camera,
    { at: P3 + 0.2, dur: 0.4, do: 'zoom', amount: 1.45, to: look(80, 54, 1.45) },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.5, to: look(78, 55, 1.5) },
  ],
  lights: [
    { at: P3, dur: 0.05, level: -0.25 },
    { at: P3 + 0.05, dur: 0.35, level: 0 },
    { at: POSE, dur: 0.05, level: -0.2 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 1.0, sfx: 'slide' },
    ...t1.cues,
    ...t2.cues,
    { at: P3 - 0.75, sfx: 'blip' },
    ...t3.cues,
    { at: P3 + 0.7, sfx: 'plop' },
    { at: TURN, sfx: 'boing' },
    { at: POSE, sfx: 'clink' },
    { at: POSE + 0.2, say: '屁屁偵探' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
