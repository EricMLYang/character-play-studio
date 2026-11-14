import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蝶（v2）：最快的忍者小老鼠拿捕蟲網抓大蝴蝶——每次他「咻」地衝過去一撈，蝴蝶早就輕飄飄地往上飄開，他煞不住、一頭撞上大樹，
// 網子翻過來罩住自己的頭，一次比一次慘：滑坐回原地（虫從蝴蝶身上飄出來）、滑到畫面邊（世從撞落的葉子來）、
// 蝴蝶停在他鼻子上、他瞪著它停一拍，再衝，被撞上天（木從撞斷的樹枝來）。蝴蝶每次都輕輕停在他身上最想不到的地方。
// 回馬槍：他不抓了、舉著網子站著不動，蝴蝶自己飄進網子——他得意地「咻」地跑一圈炫耀，蝴蝶又輕輕飄走，他撞得最慘、整棵樹的葉子掉光。
// 最後畫面暗下來只剩「蝶」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「蝶！」，然後退場只留字。
// 蝶、蝶、蝴蝶、這是什麼字？、蝶
const P = 66.9 // 小老鼠（size 24）站在地上的 y
/** 大樹（🌳 size 58）：在右邊，一半在畫面外 */
const TREE = 58
const TX = 146
const TY = 77 - 0.42 * TREE
/** 大蝴蝶（prop:butterfly）平常飄著的地方：畫面中間偏右、字框下面 */
const BX = 102, BY = 49
const BFLY = 30
/** 蝴蝶被他一撈、往上飄開到的地方（字框右邊） */
const UP = { x: 118, y: 31 }
/** 小老鼠每次出發的地方 */
const HOME = 36
/** 每次都衝到同一個地方：一頭撞上大樹 */
const CRASH = 118
/** 撞到以後傻眼停多久，才被彈走 */
const HOLD = 0.45
/** 捕蟲網（prop:net）的大小：網框跟他的頭差不多大 */
const NET = 24

// ---------- 捕蟲網跟著小老鼠 ----------
// 網子圖：網框在右上、木柄往左下；以自己中心轉（pivot: 'center'）。
// 「舉著」：手握木柄、網框在他前上方；「罩頭」：轉 135°（網框朝下套在頭上、木柄直直朝上）。
type NetPose = 'hold' | 'head'
const NET_AT: Record<NetPose, { dx: number; dy: number; r: number }> = {
  hold: { dx: 12, dy: -6, r: 0 },
  head: { dx: 0, dy: -19, r: 135 },
}
/** 網子現在轉了幾度（rotateTo 會累加，照時間順序呼叫） */
let netR = 0
/** 網子換到某個樣子（跟著小老鼠在 (mx, my)）；dir 是往哪邊轉（-1 逆時針：網框從頭上翻過來） */
function net(at: number, dur: number, pose: NetPose, mx: number, my: number, dir: 1 | -1 = 1): Move[] {
  const n = NET_AT[pose]
  let target = n.r
  while (dir > 0 ? target < netR : target > netR) target += dir * 360
  if (Math.abs(target - netR) >= 360) target -= dir * 360
  const turn = target - netR
  netR = target
  const ms: Move[] = [{ at, actor: 'net', do: 'moveTo', to: { x: mx + n.dx, y: my + n.dy }, dur }]
  if (turn) ms.push({ at, actor: 'net', do: 'rotateTo', amount: turn, dur })
  return ms
}
/** 小老鼠跟網子一起移動（網子保持現在的樣子） */
let netPose: NetPose = 'hold'
function both(at: number, dur: number, x: number, y: number, more: Partial<Move> = {}): Move[] {
  const n = NET_AT[netPose]
  return [
    { at, actor: 'mouse', do: 'moveTo', to: { x, y }, dur, ...more },
    { at, actor: 'net', do: 'moveTo', to: { x: x + n.dx, y: y + n.dy }, dur, ...more },
  ]
}

/** 蝴蝶從字框下面繞過去（不從字框前面飄過）：先往下飄到 via，再飄到 to */
function glide(at: number, dur: number, to: { x: number; y: number }, via = { x: 80, y: 54 }): Move[] {
  return [
    { at, actor: 'bfly', do: 'moveTo', to: via, dur: dur / 2, ease: 'in' },
    { at: at + dur / 2, actor: 'bfly', do: 'moveTo', to, dur: dur / 2, ease: 'out' },
  ]
}

/** 蝴蝶輕輕搧翅膀：翅膀一收一張（拉長＝翅膀收起來），順便上下飄 */
function flutter(from: number, to: number, k = 1): Move[] {
  const ms: Move[] = []
  for (let at = from, i = 0; at < to - 0.05; at += 0.32, i++) {
    ms.push({ at, actor: 'bfly', do: 'squash', amount: -0.28 * k, dur: 0.22 })
    ms.push({ at, actor: 'bfly', do: 'hop', amount: 1.4 * k, dur: 0.32 })
  }
  return ms
}

/**
 * 「咻—碰」：他蹲一下（預備）→ 衝刺舉網一撈 → 蝴蝶早一步輕輕往上飄開 → 他煞不住一頭撞上大樹：
 * 那一刻網子翻過來罩住自己的頭＋樹震＋葉子掉＋💥＋鏡頭推近＋震＋同一個音效，他傻眼停 HOLD 秒。k 是第幾次（越後面越大）。
 */
function crash(at: number, k: number) {
  netPose = 'hold'
  const moves: Move[] = [
    { at: at - 0.62, actor: 'mouse', do: 'squash', amount: -0.25, dur: 0.18 },
    { at: at - 0.42, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    ...both(at - 0.42, 0.42, CRASH, P, { anticipate: 4, ease: 'in' }),
    // 蝴蝶早一步、輕輕地往上飄開
    { at: at - 0.2, actor: 'bfly', do: 'moveTo', to: UP, dur: 0.45, ease: 'out' },
    // 碰！網子翻過來罩住自己的頭
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at, actor: 'mouse', do: 'squash', amount: 0.24 + 0.08 * k, dur: 0.28 },
    ...net(at, 0.14, 'head', CRASH, P, -1),
    { at, actor: 'tree', do: 'shake', amount: 1.2 + 0.6 * k, dur: 0.4 },
  ]
  netPose = 'head'
  const fx: Fx[] = [
    { at, kind: 'burst', x: CRASH + 10, y: P - 12, n: 1, dur: 0.38, scale: 1.6 + 0.4 * k },
    // 樹上的葉子被撞下來，一次比一次多
    { at: at + 0.05, kind: 'burst', x: TX - 20, y: 42, emoji: '🍃', n: 3 + 3 * k, dur: 0.55, scale: 1 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: CRASH + 4, y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.42, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

const H1 = 1.7, H2 = 3.65, H3 = 6.7, H4 = 10.25
const c1 = crash(H1, 0)
const R1 = H1 + 0.5
// 第 1 次：滑坐回原地，蝴蝶輕輕停在網子的木柄頂上
const after1: Move[] = [
  { at: R1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
  ...both(R1, 0.4, HOME, P, { ease: 'out' }),
  ...glide(R1 + 0.05, 0.65, { x: HOME, y: 23 }),
  // 他抬頭看，拿下網子；蝴蝶又飄回原地
  { at: R1 + 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
  ...net(R1 + 0.8, 0.2, 'hold', HOME, P, 1),
  ...glide(R1 + 0.8, 0.55, { x: BX, y: BY }, { x: 66, y: 56 }),
]
const c2 = crash(H2, 1)
const R2 = H2 + 0.5
// 第 2 次：滑得更遠，滑到畫面邊，頭暈；蝴蝶又停在木柄頂上
const after2: Move[] = [
  { at: R2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
  ...both(R2, 0.5, 14, P, { ease: 'out' }),
  { at: R2 + 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
  ...glide(R2 + 0.05, 0.75, { x: 14, y: 23 }),
]
// 第 3 次前停一拍：他拿下網子走回老地方，蝴蝶輕輕停在他鼻子上——他瞪著它（傻眼）……蝴蝶又飄回去，他蹲下、衝！
const PAUSE = 5.15
/** 他鼻尖的位置（站在 HOME、面向右） */
const NOSE = { x: HOME + 10, y: P - 12 }
const before3: Move[] = [
  { at: PAUSE - 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
  ...net(PAUSE - 0.3, 0.2, 'hold', 14, P, 1),
  ...((): Move[] => { netPose = 'hold'; return both(PAUSE - 0.1, 0.4, HOME, P) })(),
  // 停在他鼻尖上（縮小一點，臉還看得到）
  { at: PAUSE - 0.25, actor: 'bfly', do: 'moveTo', to: NOSE, dur: 0.75, ease: 'inOut' },
  { at: PAUSE - 0.25, actor: 'bfly', do: 'scaleTo', amount: 0.5, dur: 0.75 },
  { at: PAUSE + 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
  { at: PAUSE + 0.5, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.2 },
  { at: PAUSE + 1.0, actor: 'bfly', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.45, ease: 'inOut' },
  { at: PAUSE + 1.0, actor: 'bfly', do: 'scaleTo', amount: 1 / 0.5, dur: 0.45 },
  { at: PAUSE + 1.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
]
const c3 = crash(H3, 2)
const R3 = H3 + 0.5
// 第 3 次：撞得樹枝都斷了，他被彈上天（往左上飛出畫面），過一會兒才掉回來
const after3: Move[] = [
  ...both(R3, 0.4, 126, -50, { ease: 'out' }),
  // 字框填滿、國字到正中央時，蝴蝶讓到右邊的樹前面
  { at: R3 + 0.1, actor: 'bfly', do: 'moveTo', to: { x: 134, y: 44 }, dur: 0.5, ease: 'inOut' },
  // 掉回來（左邊），網子還罩在頭上，頭暈
  ...both(7.55, 0.01, 34, -50),
  ...both(7.6, 0.3, 34, P, { ease: 'in' }),
  { at: 7.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
]
/** 語詞那一刻他站的地方、蝴蝶在正中間放大 */
const MX = 50
const MID = { x: 90, y: 62 }
const BIG = 1.5
/** 回馬槍：他舉著網子站著不動，蝴蝶自己飄進網框 */
const word: Move[] = [
  { at: 8.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
  ...net(8.45, 0.2, 'hold', 34, P, 1),
  ...((): Move[] => { netPose = 'hold'; return both(8.5, 0.35, MX, P) })(),
  { at: 8.4, actor: 'bfly', do: 'moveTo', to: MID, dur: 0.45, ease: 'inOut' },
  { at: 8.4, actor: 'bfly', do: 'scaleTo', amount: BIG, dur: 0.45, ease: 'out' },
  // 他不抓了：閉上眼睛，舉著網子站著不動
  { at: 9.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
  // 蝴蝶自己輕輕飄下來，停進網框
  { at: 9.25, actor: 'bfly', do: 'moveTo', to: { x: MX + 18, y: P - 18 }, dur: 0.45, ease: 'inOut' },
  { at: 9.25, actor: 'bfly', do: 'scaleTo', amount: 0.75 / BIG, dur: 0.45 },
  // 抓到了！得意地跳起來……咻地衝出去炫耀
  { at: 9.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
  { at: 9.7, actor: 'mouse', do: 'hop', amount: 4, dur: 0.22 },
  { at: 9.7, actor: 'net', do: 'hop', amount: 4, dur: 0.22 },
  { at: 9.7, actor: 'bfly', do: 'hop', amount: 4, dur: 0.22 },
  { at: 9.95, actor: 'bfly', do: 'scaleTo', amount: 1 / 0.75, dur: 0.4 },
]
// 回馬槍（第 4 次）：蝴蝶又輕輕飄出網子，他煞不住撞得最慘——趴扁在樹下，網子罩著頭，葉子掉光
const c4 = crash(H4, 3)
const after4: Move[] = [
  { at: H4 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
  ...net(H4 + 0.4, 0.15, 'head', CRASH, P + 8, 1),
  // 蝴蝶輕輕停在網子的木柄頂上
  { at: H4 + 0.35, actor: 'bfly', do: 'moveTo', to: { x: CRASH, y: P - 22 }, dur: 0.4, ease: 'inOut' },
]
// 問他：網子被他甩掉、蝴蝶飄走，他跳到左前方、變大，面向右邊的字
const ASK = 10.85
const askMoves: Move[] = [
  { at: ASK, actor: 'net', do: 'moveTo', to: { x: 190, y: -20 }, dur: 0.45, ease: 'in' },
  { at: ASK, actor: 'net', do: 'spin', times: 2, dur: 0.45 },
  { at: ASK, actor: 'bfly', do: 'moveTo', to: { x: 175, y: 5 }, dur: 0.6, ease: 'in' },
  { at: ASK + 0.15, actor: 'tree', do: 'vanish', dur: 0.3 },
  { at: ASK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
  { at: ASK, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, arc: 10, dur: 0.35 },
  { at: ASK + 0.3, actor: 'mouse', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
  // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
  { at: 12.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
  { at: 12.1, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
  { at: 12.65, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
  { at: 13.1, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
  // 回答：跳起來指著字
  { at: 13.55, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
  { at: 13.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
  { at: 13.55, actor: 'mouse', do: 'hop', amount: 6, dur: 0.25 },
  // 退場（衝刺），畫面只留下字
  { at: 13.72, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
  { at: 13.72, actor: 'mouse', do: 'flip' },
  { at: 13.75, actor: 'mouse', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.22, ease: 'in' },
]

const clip: Clip = {
  format: 2,
  char: '蝶',
  meta: { theme: '忍者小老鼠拿捕蟲網抓大蝴蝶', cast: '小老鼠＋大蝴蝶＋捕蟲網＋大樹', gags: ['最快的小老鼠每次拿捕蟲網咻地衝過去撈蝴蝶，蝴蝶早一步輕飄飄地飄開，他煞不住撞上大樹、網子罩住自己的頭，一次比一次慘，蝴蝶還輕輕停在他身上；回馬槍是他不抓了，蝴蝶自己飄進網子，他得意地跑一圈炫耀，蝴蝶又飄走，他撞得最慘'] },
  duration: 15,
  bg: { top: '#D6F0FF', bottom: '#F4FBEF', floor: '#C9E3A8', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: '🌳', x: TX, y: TY, size: TREE },
    // 姿勢圖朝左，翻過來面向右邊的蝴蝶與大樹（問他時也面向右邊的字）
    { id: 'mouse', emoji: 'hero:mouse/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    { id: 'net', emoji: 'prop:net', x: HOME + NET_AT.hold.dx, y: P + NET_AT.hold.dy, size: NET, hidden: true, pivot: 'center', float: true },
    { id: 'bfly', emoji: 'prop:butterfly', x: BX, y: BY, size: BFLY, float: true },
  ],
  moves: [
    ...flutter(0, 15),
    // 小老鼠舉著捕蟲網衝進來，擺忍者架式：看我抓到牠！
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'back' },
    { at: 0, actor: 'net', do: 'enter', from: { x: -25 + NET_AT.hold.dx, y: P + NET_AT.hold.dy }, dur: 0.4, ease: 'back' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 第 1 次
    ...c1.moves,
    ...after1,
    // 第 2 次
    ...c2.moves,
    ...after2,
    ...before3,
    // 第 3 次
    ...c3.moves,
    ...after3,
    // 語詞那一刻＋回馬槍
    ...word,
    ...c4.moves,
    ...after4,
    ...askMoves,
  ],
  builds: [
    // 第 1 次：蝴蝶（牠是蟲）輕輕飄開時，從牠身上飄出來——虫
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'bfly', color: partColor('虫') },
    // 第 2 次：撞得樹上的葉子嘩地掉下來——世（枼是樹上長滿葉子）
    { at: H2 + 0.05, dur: 0.6, strokes: [6, 7, 8, 9, 10], from: 'tree', color: partColor('世') },
    // 第 3 次：撞斷了樹枝——木
    { at: H3 + 0.05, dur: 0.6, strokes: [11, 12, 13, 14], from: 'tree', color: partColor('木') },
  ],
  glyph: [
    { at: 7.55, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.4, dur: 0.45, do: 'park' },
    { at: 10.85, dur: 3.1, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.95, dur: 0.4, do: 'home' },
    { at: 13.55, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...c1.fx,
    ...c2.fx,
    ...c3.fx,
    { at: 7.9, kind: 'dizzy', actor: 'mouse', dur: 0.5 },
    { at: 9.7, kind: 'burst', x: MX + 18, y: P - 22, emoji: '✨', n: 6, dur: 0.4 },
    ...c4.fx,
    { at: H4, kind: 'burst', x: TX - 14, y: 34, emoji: '🍂', n: 10, dur: 0.6, scale: 1.4 },
    { at: 13.55, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...c1.camera,
    ...c2.camera,
    ...c3.camera,
    ...c4.camera,
  ],
  lights: [
    // 每次撞上大樹白光一閃，一次比一次亮
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.55, dur: 0.05, level: -0.35 },
    { at: 7.6, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '蝶' },
    ...c1.cues,
    ...c2.cues,
    ...c3.cues,
    { at: 7.65, say: '蝶' },
    { at: 7.9, sfx: 'plop' },
    { at: 8.9, say: '蝴蝶' },
    { at: 9.7, sfx: 'blip' },
    ...c4.cues,
    { at: 11.05, say: FIXED_LINES.clipAsk },
    { at: 13.55, say: '蝶' },
    { at: 13.6, sfx: 'cheer' },
  ],
}

export default clip
