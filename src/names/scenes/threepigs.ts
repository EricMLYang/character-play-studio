// 演的是字面意思：三隻＋小豬——三隻小豬一隻一隻疊羅漢，搆磚牆上的大蛋糕（老童話裡的三隻小豬，不照任何一部動畫的造型）。
import { castScale, type Camera, type Cue, type Fx, type Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：三隻小豬一隻一隻跳上去疊羅漢搆蛋糕——每多跳上一隻，下面的就被壓得更扁，塔怎麼疊都差一點點。
// 同一個跳法、同一聲「啵—咚」，三次只有結果越來越大：大豬自己跳上去伸脖子（差好多）→ 二豬跳上去、大豬被壓扁一點（差一截）→
// 先停一拍（小豬抬頭看著搖搖晃晃的塔、蹲低蓄力），跳上去：下面兩隻被壓成大餅、還是差一點點。
// 反轉：被壓扁的兩隻「啵嘿」一起彈回來，像彈簧把小豬射上天，一口叼走牆上的蛋糕，落回塔頂。三隻疊著頂蛋糕亮相：「三隻小豬」。
// 小豬三隻都用 3D 的 🐖（大、中、小三種大小，一眼數得出 1、2、3）；豬探長戴偵探帽，三隻都用它會變成三個豬探長，所以不用。

/** 三隻小豬：大、中、小（劇本的 size；畫出來引擎會放大，下面用放大後的大小算疊的位置） */
const SIZE = { a: 30, b: 22, c: 16 } as const
type Pig = keyof typeof SIZE
const REAL = { a: SIZE.a * castScale(SIZE.a), b: SIZE.b * castScale(SIZE.b), c: SIZE.c * castScale(SIZE.c) }
/** 🐖 圖：腳底在中心下面 0.43 個 size、背在腳底上面 0.617 個 size、耳朵尖 0.648 */
const FEET = 0.43
const BACK = 0.617
/** 疊的位置（每隻站的 x） */
const X = { a: 92, b: 93, c: 95 } as const
/** 進場走到這裡，再跳上塔 */
const EX = 62
/** 大豬站在地上（不是 float，引擎以腳底為準放大） */
const YA = 77 - 0.42 * SIZE.a
/** 每次壓扁以後：大豬、二豬的寬扁倍率 */
const W = [
  { a: 1, b: 1 },
  { a: 1.25, b: 1 },
  { a: 1.6, b: 1.35 },
]
const backA = (wa: number) => 77 - (BACK * REAL.a) / wa
const yB = (wa: number) => backA(wa) - FEET * REAL.b
const backB = (wa: number, wb: number) => backA(wa) - (BACK * REAL.b) / wb
const yC = (wa: number, wb: number) => backB(wa, wb) - FEET * REAL.c
/** 在地上（float 的圖以中心放大，自己算腳底） */
const ground = (p: Pig) => (p === 'a' ? YA : 77 - FEET * REAL[p])
/** 跳上去落在哪裡（還沒壓扁下面的時候） */
const landY = (p: Pig, k: number) => (p === 'a' ? YA : p === 'b' ? yB(W[k - 1].a) : yC(W[k - 1].a, W[k - 1].b))

/** 蛋糕放在磚牆頂上 */
const WALL = { x: 139.5, y: 46, size: 68 }
const WALL_TOP = 38.7
const CAKE_S = 12
const CAKE_R = CAKE_S * castScale(CAKE_S)
const CAKE_UP = (493 / 512 - 0.5) * CAKE_R // 蛋糕圖的底在中心下面多少
const CAKE = { x: 120, y: WALL_TOP - CAKE_UP }
/** 蛋糕頂在小豬背上：中心在小豬中心上面多少 */
const ON_C = (0.5 - 80 / 256) * REAL.c + CAKE_UP

const PIGS: Pig[] = ['a', 'b', 'c']
const NUM = ['1️⃣', '2️⃣', '3️⃣']

/**
 * 主軸笑點：第 k 隻小豬走進來 → 數一聲 → 抬頭看蛋糕 → 蹲低「啵」跳上塔頂 →「咚」下面的被壓扁 → 伸長脖子搆，搆不到，整座塔晃。
 * T 是走進來的時間；wait 是跳之前多看幾秒（第三次停一拍）。回傳 land＝落下那一刻、end＝搆完的時間。
 */
function climb(k: number, T: number, wait = 0) {
  const p = PIGS[k]
  const below = PIGS.slice(0, k)
  const look = T + 0.8
  const prep = look + 0.25 + wait
  const jump = prep + 0.2
  const land = jump + 0.35
  const reach = land + 0.3
  const shakeAmt = [0.3, 0.7, 1.3][k]
  const moves: Move[] = [
    { at: T, actor: p, do: 'pop', dur: 0.01 },
    { at: T, actor: p, do: 'enter', from: { x: -20, y: ground(p) }, dur: 0.7, ease: 'out' },
    // 抬頭看牆上的蛋糕
    { at: look, actor: p, do: 'tilt', amount: -5, dur: 0.5 + wait },
    // 蹲低蓄力（第三次蹲更久、更低）→ 跳上去
    { at: prep, actor: p, do: 'squash', amount: k >= 2 ? 0.35 : 0.22, dur: 0.22 },
    { at: jump, actor: p, do: 'moveTo', to: { x: X[p], y: landY(p, k) }, arc: 8 + 2 * k, dur: 0.35, ease: 'out' },
  ]
  // 咚！下面的被壓扁（留下結果），上面的跟著往下沉
  if (k >= 1) {
    const prev = W[k - 1], now = W[k]
    if (now.a !== prev.a) moves.push({ at: land, actor: 'a', do: 'stretchTo', amount: now.a / prev.a, dur: 0.15, ease: 'out' })
    if (now.b !== prev.b) moves.push({ at: land, actor: 'b', do: 'stretchTo', amount: now.b / prev.b, dur: 0.15, ease: 'out' })
    if (k >= 2) moves.push({ at: land, actor: 'b', do: 'moveTo', to: { x: X.b, y: yB(now.a) }, dur: 0.15, ease: 'out' })
    moves.push({ at: land, actor: p, do: 'moveTo', to: { x: X[p], y: k === 1 ? yB(now.a) : yC(now.a, now.b) }, dur: 0.15, ease: 'out' })
  }
  // 伸長脖子搆蛋糕（拉長＋鼻子往上），搆不到；整座塔一起晃，一次比一次晃
  moves.push(
    { at: reach, actor: p, do: 'squash', amount: -0.22, dur: 0.5 },
    { at: reach, actor: p, do: 'tilt', amount: -6, dur: 0.5 },
    ...[...below, p].map((q): Move => ({ at: reach + 0.1, actor: q, do: 'shake', amount: shakeAmt, dur: 0.5 + 0.15 * k })),
  )
  const fx: Fx[] = [
    { at: T + 0.65, kind: 'pop', actor: p, emoji: NUM[k], dur: 0.7, scale: 2.2 },
    { at: land, kind: 'burst', x: X.a, y: 74, emoji: '💥', n: 1, dur: 0.35, scale: 0.9 + 0.35 * k },
    { at: land + 0.05, kind: 'puff', x: X.a, y: 75, n: 4 + 3 * k, dur: 0.5 },
  ]
  if (k >= 1) fx.push({ at: reach + 0.2, kind: 'sweat', actor: 'a' })
  const camera: Camera[] = [
    { at: land, dur: 0.4, do: 'punch', amount: 0.05 + 0.04 * k, to: { x: X.a, y: 55 } },
    { at: land, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.5 + 0.5 * k },
  ]
  // 同一組音效（數一聲—啵—咚），一次比一次多疊一個
  const cues: Cue[] = [{ at: T + 0.65, sfx: 'blip' }, { at: jump, sfx: 'boing' }, { at: land, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: land + 0.05, sfx: 'deflate' })
  if (k >= 2) cues.push({ at: land + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues, land, end: reach + 0.6 }
}

const c1 = climb(0, 0.3)
const c2 = climb(1, c1.end - 0.6)
const c3 = climb(2, c2.end - 0.4, 0.55)
// 反轉：被壓扁的兩隻彈回來，把小豬射上去叼蛋糕
const SPRING = c3.end + 0.15
const TOP = { x: 107, y: 29 } // 小豬飛到的最高點（牆邊、蛋糕旁）
const GRAB = SPRING + 0.4
const LAND = GRAB + 0.45
const yTop = yC(1, 1)

export default scene({
  duration: LAND + 1.75,
  bg: { top: '#8FD3F5', bottom: '#DDF3FF', floor: '#9BCB6A', scenery: 'hills' },
  actors: [
    { id: 'bush', emoji: 'prop:bush', x: 16, y: 77 - 0.42 * 22, size: 22 },
    { id: 'flower', emoji: '🌻', x: 36, y: 77 - 0.42 * 12, size: 12 },
    { id: 'wall', emoji: 'prop:brick-wall', x: WALL.x, y: WALL.y, size: WALL.size },
    { id: 'cake', emoji: 'prop:cake', x: CAKE.x, y: CAKE.y, size: CAKE_S, float: true },
    { id: 'a', emoji: '🐖', x: EX, y: YA, size: SIZE.a, flip: true, hidden: true },
    { id: 'b', emoji: '🐖', x: EX, y: ground('b'), size: SIZE.b, flip: true, float: true, hidden: true },
    { id: 'c', emoji: '🐖', x: EX, y: ground('c'), size: SIZE.c, flip: true, float: true, hidden: true, pivot: 'center' },
  ],
  moves: [
    ...c1.moves,
    ...c2.moves,
    // 第三次前停一拍：下面兩隻抖著
    { at: c3.land - 1.0, actor: 'a', do: 'shake', amount: 0.4, dur: 0.8 },
    { at: c3.land - 1.0, actor: 'b', do: 'shake', amount: 0.4, dur: 0.8 },
    ...c3.moves,
    // 小豬垂頭（搆不到）；下面兩塊大餅抖啊抖（要彈了）
    { at: c3.end - 0.1, actor: 'c', do: 'tilt', amount: 4, dur: 0.3 },
    { at: SPRING - 0.25, actor: 'a', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: SPRING - 0.25, actor: 'b', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: SPRING - 0.25, actor: 'c', do: 'shake', amount: 0.6, dur: 0.25 },
    // 反轉：大餅「啵嘿」彈回原樣，小豬被射上去
    { at: SPRING, actor: 'a', do: 'stretchTo', amount: 1 / W[2].a, dur: 0.25, ease: 'back' },
    { at: SPRING, actor: 'b', do: 'stretchTo', amount: 1 / W[2].b, dur: 0.25, ease: 'back' },
    { at: SPRING, actor: 'b', do: 'moveTo', to: { x: X.b, y: yB(1) }, dur: 0.25, ease: 'back' },
    { at: SPRING, actor: 'c', do: 'moveTo', to: TOP, arc: 4, dur: 0.4, ease: 'out' },
    { at: SPRING, actor: 'c', do: 'spin', times: 1, dur: 0.4 },
    // 一口叼走蛋糕，頂在背上落回塔頂
    { at: GRAB - 0.05, actor: 'cake', do: 'moveTo', to: { x: TOP.x + 1, y: TOP.y - ON_C }, dur: 0.1, ease: 'out' },
    { at: GRAB + 0.05, actor: 'c', do: 'moveTo', to: { x: X.c, y: yTop }, arc: 3, dur: 0.4, ease: 'in' },
    { at: GRAB + 0.05, actor: 'cake', do: 'moveTo', to: { x: X.c + 1, y: yTop - ON_C }, arc: 3, dur: 0.4, ease: 'in' },
    // 亮相：整座塔一起跳兩下
    ...['a', 'b', 'c', 'cake'].flatMap((id): Move[] => [
      { at: LAND + 0.15, actor: id, do: 'hop', amount: 3, dur: 0.35 },
      { at: LAND + 0.6, actor: id, do: 'hop', amount: 2, dur: 0.3 },
    ]),
  ],
  fx: [
    { at: 0.15, kind: 'burst', actor: 'cake', emoji: '✨', n: 5, dur: 0.6 },
    ...c1.fx,
    ...c2.fx,
    { at: c3.land - 1.0, kind: 'sweat', actor: 'b', dur: 0.8 },
    ...c3.fx,
    // 彈回來
    { at: SPRING, kind: 'burst', x: X.a, y: 66, emoji: '💥', n: 1, dur: 0.4, scale: 1.8 },
    { at: SPRING + 0.05, kind: 'burst', x: X.a, y: 60, emoji: '⭐', n: 6, dur: 0.6, scale: 1.3 },
    { at: GRAB, kind: 'burst', actor: 'cake', emoji: '✨', n: 6, dur: 0.5, scale: 1.2 },
    { at: LAND, kind: 'puff', x: X.a, y: 75, n: 8, dur: 0.6 },
    { at: LAND + 0.1, kind: 'burst', actor: 'cake', emoji: '🎉', n: 9, dur: 1.0, scale: 1.4 },
    { at: LAND + 0.4, kind: 'burst', actor: 'a', emoji: '✨', n: 8, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.35, to: { x: 86, y: 50 } },
    ...c1.camera,
    ...c2.camera,
    // 停一拍：慢慢推近
    { at: c3.land - 1.2, dur: 0.8, do: 'zoom', amount: 1.45, to: { x: 88, y: 50 } },
    ...c3.camera,
    // 射上去：退一點看得到整座塔和牆頂
    { at: SPRING - 0.1, dur: 0.35, do: 'zoom', amount: 1.15, to: { x: 98, y: 45 } },
    { at: SPRING, dur: 0.35, do: 'shake', amount: 1.4 },
    // 亮相
    { at: LAND, dur: 0.3, do: 'shake', amount: 1 },
    { at: LAND, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 95, y: 44 } },
  ],
  lights: [
    { at: SPRING, dur: 0.05, level: -0.3 },
    { at: SPRING + 0.05, dur: 0.3, level: 0 },
    { at: LAND, dur: 0.05, level: -0.3 },
    { at: LAND + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.15, sfx: 'blip' },
    ...c1.cues,
    ...c2.cues,
    ...c3.cues,
    { at: SPRING, sfx: 'boing' },
    { at: SPRING + 0.05, sfx: 'boing' },
    { at: SPRING + 0.1, sfx: 'whoosh' },
    { at: GRAB, sfx: 'gulp' },
    { at: LAND, sfx: 'bonk' },
    { at: LAND + 0.2, say: '三隻小豬' },
    { at: LAND + 0.5, sfx: 'cheer' },
  ],
})
