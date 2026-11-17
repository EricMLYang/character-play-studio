// 演的是字面意思：小＋紅＋帽——兔子女孩戴著一頂小小的紅帽子，秋天的風把帽子吹走，她一路追（老童話，沒有人物、沒有外婆和野狼）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：每次她跳起來快抓到紅帽子，「呼——」一陣風又把帽子吹到更高的地方。
// 同一個跳、同一陣風（落葉從左邊掃過來、樹被吹歪）、同一聲「咻」，三次只有結果越來越大：
// 熊的頭上 → 樹枝上（她落地傻眼）→ 大樹頂（她跌坐在地）→ 先停一拍（她蹲低蓄力、帽子在樹頂抖）——全力一跳，
// 風把帽子吹上天，她摔成一片。反轉：她氣得叉腰不追了，風停了，帽子自己慢慢飄下來，剛好戴回她頭上：「小紅帽」。
const S = 34 // 兔子女孩
const R = 77 - 0.42 * S
const START = 34 // 她一開始站的地方
const HAT_S = 15 // 紅帽子
/** 帽子戴在她頭上（她朝右、flip）的位置偏移 */
const ON_HEAD = { dx: 1, dy: -10.2 }
// 熊站著當「別人的頭」
const BEAR = 74
const BS = 30
const BR = 77 - 0.42 * BS
const BEAR_HEAD = { x: BEAR - 1, y: 48.5 }
// 秋天的大樹（右邊）
const TREE = 132
const TS = 66
const TR = 77 - 0.42 * TS
const BRANCH = { x: 104, y: 44 } // 樹枝上（矮的那一叢）
const TOP = { x: 127, y: 18 } // 大樹頂
const SKY = { x: 102, y: 21 } // 吹上天
// 每一跳她站哪裡
const JUMP_X = [53, 92, 108]
const RED = 'hue-rotate(148deg) saturate(3) brightness(0.8)' // 🧢 本來是藍的
const AUTUMN = 'hue-rotate(-40deg) saturate(1.2)'

const B = (pose: string) => `hero:bunny/${pose}`
const head = (x: number, y = R) => ({ x: x + ON_HEAD.dx, y: y + ON_HEAD.dy })

/** 一陣風：落葉從左邊一串掃過去、樹被吹歪、「咻」。k 越大葉子越多越大 */
function gust(at: number, k: number) {
  const fx: Fx[] = [
    { at, kind: 'blow', x: -6, y: 34, to: { x: 168, y: 22 }, emoji: '🍂', n: 4 + 2 * k, dur: 0.8, scale: 1.2 + 0.2 * k },
    { at: at + 0.08, kind: 'blow', x: -6, y: 56, to: { x: 168, y: 40 }, emoji: '🍃', n: 3 + 2 * k, dur: 0.8, scale: 1.1 + 0.2 * k },
  ]
  if (k >= 2) fx.push({ at: at + 0.04, kind: 'blow', x: -6, y: 18, to: { x: 168, y: 8 }, emoji: '🍁', n: 5, dur: 0.75, scale: 1.5 })
  const moves: Move[] = [
    { at, actor: 'tree', do: 'tilt', amount: 6 + 4 * k, dur: 0.8 },
    { at, actor: 'bush', do: 'tilt', amount: 8 + 4 * k, dur: 0.7 },
  ]
  const cues: Cue[] = [{ at, sfx: 'whoosh' }]
  return { fx, moves, cues }
}

/**
 * 主軸笑點：她蹲一下、跳起來伸手（jump）——快碰到的那一刻一陣風，帽子飛到 to；她落地的樣子一次比一次慘。
 * at 起跳、k 第幾次（0、1、2）。回傳 end＝傻眼停完的時間。
 */
function grab(at: number, k: number, to: { x: number; y: number }) {
  const x = JUMP_X[k]
  const up = [11, 13, 30][k]
  const air = [0.6, 0.65, 0.85][k]
  const apex = at + air * 0.45
  const land = at + air
  const g = gust(apex - 0.05, k)
  const moves: Move[] = [
    { at: at - 0.25, actor: 'bunny', do: 'squash', amount: -0.18 - 0.08 * k, dur: 0.25 },
    { at, actor: 'bunny', do: 'swap', emoji: B(k >= 2 ? 'leap' : 'jump') },
    { at, actor: 'bunny', do: 'hop', amount: up, dur: air },
    ...g.moves,
    // 被風吹走：先抖一下、再翻著飛走
    { at: apex - 0.05, actor: 'hat', do: 'shake', amount: 1, dur: 0.12 },
    { at: apex + 0.05, actor: 'hat', do: 'moveTo', to, arc: k >= 2 ? 2 : 10, dur: 0.55, ease: 'out' },
    { at: apex + 0.05, actor: 'hat', do: 'spin', times: 1 + k, dur: 0.55 },
    // 落地：傻眼 → 跌坐 → 摔扁
    { at: land, actor: 'bunny', do: 'swap', emoji: B(['surprised', 'fall', 'flat'][k]) },
    { at: land + 0.05, actor: 'bunny', do: 'shake', amount: 0.4 + 0.3 * k, dur: 0.35 },
  ]
  const fx: Fx[] = [
    { at: land, kind: 'burst', x: x + 2, y: R - 14 + 6 * k, emoji: '💥', n: 1, dur: 0.4, scale: 1 + 0.4 * k },
    ...g.fx,
  ]
  if (k >= 1) fx.push({ at: land + 0.1, kind: 'burst', actor: 'bunny', emoji: '⭐', n: 3 + 2 * k, dur: 0.6, scale: 1.2 + 0.2 * k })
  const camera: Camera[] = [
    { at: land, dur: 0.35, do: 'punch', amount: 0.05 + 0.04 * k, to: { x, y: R - 6 * k } },
    { at: land, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.5 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'boing' }, ...g.cues, { at: land, sfx: k >= 2 ? 'bonk' : 'plop' }]
  if (k >= 1) cues.push({ at: land + 0.08, sfx: 'tap' })
  return { moves, fx, camera, cues, end: land + 0.5 }
}

/** 追過去：衝刺姿勢跑到 x */
const dash = (at: number, x: number, dur: number): Move[] => [
  { at, actor: 'bunny', do: 'swap', emoji: B('dash') },
  { at, actor: 'bunny', do: 'moveTo', to: { x, y: R }, dur, ease: 'in', anticipate: 3 },
]

const G0 = 0.85 // 第一陣風：帽子從頭上吹走
const g0 = gust(G0, 0)
const T1 = 2.05, T2 = 3.65
const j1 = grab(T1, 0, BRANCH)
const j2 = grab(T2, 1, TOP)
const WAIT = j2.end + 0.45 // 停一拍：蹲低蓄力
const T3 = WAIT + 0.85
const j3 = grab(T3, 2, SKY)
const MAD = j3.end + 0.1 // 不追了，叉腰生氣
const DOWN = MAD + 0.3 // 帽子開始飄下來
const ON = DOWN + 1.2 // 剛好戴回頭上
const X3 = JUMP_X[2]

export default scene({
  duration: ON + 2.0,
  bg: { top: '#8EC6E8', bottom: '#FBE7C6', floor: '#C98A4B', scenery: 'hills' },
  actors: [
    { id: 'bush', emoji: 'prop:bush', x: 14, y: 77 - 0.42 * 18, size: 18, tint: AUTUMN },
    { id: 'tree', emoji: 'prop:tree', x: TREE, y: TR, size: TS },
    { id: 'pile', emoji: 'prop:leaf-pile', x: 150, y: 77 - 0.42 * 12, size: 12 },
    { id: 'bear', emoji: 'prop:bear', x: BEAR, y: BR, size: BS },
    { id: 'bunny', emoji: B('idle'), x: START, y: R, size: S, flip: true },
    { id: 'hat', emoji: '🧢', ...head(START), size: HAT_S, flip: true, tint: RED, pivot: 'center', float: true },
  ],
  moves: [
    // 開場：她戴著紅帽子開心跳一下
    { at: 0.05, actor: 'bunny', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: 0.2, actor: 'bunny', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.2, actor: 'hat', do: 'hop', amount: 4, dur: 0.35 },
    // 第一陣風：帽子從頭上吹走，落到熊的頭上
    ...g0.moves,
    { at: G0 + 0.05, actor: 'hat', do: 'shake', amount: 1, dur: 0.12 },
    { at: G0 + 0.15, actor: 'hat', do: 'moveTo', to: BEAR_HEAD, arc: 12, dur: 0.6, ease: 'out' },
    { at: G0 + 0.15, actor: 'hat', do: 'spin', times: 1, dur: 0.6 },
    { at: G0 + 0.15, actor: 'bunny', do: 'swap', emoji: B('surprised') },
    { at: G0 + 0.75, actor: 'bear', do: 'squash', amount: 0.15, dur: 0.2 },
    // 追到熊旁邊，跳起來抓——風又把帽子吹到樹枝上
    ...dash(1.35, JUMP_X[0], 0.4),
    { at: 1.8, actor: 'bunny', do: 'swap', emoji: B('reach') },
    ...j1.moves,
    { at: j1.end - 0.4, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    // 追到樹下，再跳——風把帽子吹到大樹頂
    ...dash(j1.end, JUMP_X[1], 0.35),
    { at: j1.end + 0.4, actor: 'bunny', do: 'swap', emoji: B('reach') },
    ...j2.moves,
    // 停一拍：爬起來走到樹頂下面，蹲低蓄力；帽子在樹頂抖
    { at: j2.end, actor: 'bunny', do: 'swap', emoji: B('walk') },
    { at: j2.end, actor: 'bunny', do: 'moveTo', to: { x: X3, y: R }, dur: 0.4 },
    { at: WAIT, actor: 'bunny', do: 'swap', emoji: B('ready') },
    { at: WAIT + 0.1, actor: 'bunny', do: 'squash', amount: 0.12, dur: 0.6 },
    { at: WAIT + 0.15, actor: 'hat', do: 'tilt', amount: 12, dur: 0.6 },
    ...j3.moves,
    // 反轉：她氣得叉腰不追了。風停了，帽子自己左右飄、慢慢落下來
    { at: MAD, actor: 'bunny', do: 'swap', emoji: B('angry') },
    { at: MAD + 0.05, actor: 'bunny', do: 'hop', amount: 2, dur: 0.2 },
    { at: DOWN, actor: 'hat', do: 'moveTo', to: { x: X3 + 10, y: 26 }, dur: 0.4, ease: 'inOut' },
    { at: DOWN + 0.4, actor: 'hat', do: 'moveTo', to: { x: X3 - 6, y: 36 }, dur: 0.4, ease: 'inOut' },
    { at: DOWN + 0.8, actor: 'hat', do: 'moveTo', to: head(X3), dur: 0.4, ease: 'in' },
    { at: DOWN, actor: 'hat', do: 'tilt', amount: -18, dur: 0.4 },
    { at: DOWN + 0.4, actor: 'hat', do: 'tilt', amount: 18, dur: 0.4 },
    // 噗，戴回頭上：她愣一下，開心跳起來變大
    { at: ON, actor: 'hat', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: ON, actor: 'bunny', do: 'swap', emoji: B('surprised') },
    { at: ON + 0.35, actor: 'bunny', do: 'swap', emoji: B('happy') },
    { at: ON + 0.35, actor: 'bunny', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: ON + 0.35, actor: 'hat', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: ON + 0.35, actor: 'hat', do: 'moveTo', to: { x: X3 + 2, y: 47.3 }, dur: 0.3, ease: 'back' },
    { at: ON + 0.45, actor: 'bear', do: 'hop', amount: 4, dur: 0.35 },
  ],
  fx: [
    ...g0.fx,
    ...j1.fx,
    ...j2.fx,
    { at: WAIT + 0.2, kind: 'sweat', actor: 'bunny', dur: 0.6 },
    ...j3.fx,
    { at: MAD + 0.1, kind: 'puff', actor: 'bunny', n: 4, dur: 0.4 },
    { at: ON, kind: 'burst', actor: 'hat', emoji: '✨', n: 6, dur: 0.6, scale: 1.2 },
    { at: ON + 0.35, kind: 'burst', actor: 'bunny', emoji: '🎉', n: 9, dur: 1.0, scale: 1.4 },
  ],
  camera: [
    // 開場先近一點看她戴著紅帽子，風來之前拉開成全景：熊、大樹、樹頂的帽子都在畫面裡
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.5, to: { x: START + 8, y: 54 } },
    { at: 0.6, dur: 0.45, do: 'zoom', amount: 1.05, to: { x: 82, y: 46 } },
    ...j1.camera,
    ...j2.camera,
    // 停一拍：慢慢推近，看得到她和樹頂
    { at: WAIT, dur: 0.7, do: 'zoom', amount: 1.22, to: { x: 106, y: 41 } },
    ...j3.camera,
    { at: j3.end - 0.2, dur: 0.4, do: 'zoom', amount: 1.15, to: { x: 104, y: 45 } },
    // 亮相
    { at: ON + 0.35, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: X3 - 4, y: 54 } },
  ],
  lights: [
    { at: j3.end - 0.5, dur: 0.05, level: -0.2 },
    { at: j3.end - 0.45, dur: 0.3, level: 0 },
    { at: ON + 0.35, dur: 0.05, level: -0.2 },
    { at: ON + 0.4, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.2, sfx: 'boing' },
    ...g0.cues,
    { at: G0 + 0.75, sfx: 'plop' },
    { at: 1.35, sfx: 'slide' },
    ...j1.cues,
    { at: j1.end, sfx: 'slide' },
    ...j2.cues,
    { at: WAIT + 0.1, sfx: 'blip' },
    { at: WAIT + 0.5, sfx: 'blip' },
    ...j3.cues,
    { at: MAD, sfx: 'tap' },
    { at: ON, sfx: 'plop' },
    { at: ON + 0.5, say: '小紅帽' },
    { at: ON + 0.7, sfx: 'cheer' },
  ],
})
