// 演的是字面意思：湯（一大鍋湯）＋小火車——一台小火車車頂載著一大鍋湯開進站，一煞車湯就潑出來，潑得月台上等湯的小怪獸一身（沒有臉、沒有藍色車頭、沒有編號）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'
import { pressStack } from '../../anim/helpers'

// 主軸笑點（一句話）：小火車載著一大鍋湯進站，每一煞車，湯就「嘩」潑到月台上等湯的小怪獸身上。
// 同一個進站、同一個急煞、同一聲「嘰——嘩啦」，三次只有潑得越來越多：幾滴潑在碗邊 → 一大潑淋滿臉、一屁股坐倒、頭上黏一根紅蘿蔔 →
// 停一拍（火車退到後面蓄力、小怪獸發抖）——反轉：小怪獸把碗一丟、嘴巴張到最大，整鍋湯潑過來全喝進肚子，肚子圓滾滾。
// 火車得意地跳一下：「湯瑪士小火車」。
const T = 50 // 小火車（3D 🚂 車頭朝左，從右邊開進來不用翻）
const G = 77 - 0.42 * T
const TX = 104 // 火車每次停的地方（月台中間偏右）
const BACK = 142 // 火車退到這裡再開進來（一半在畫面外）
const PX = 12 // 湯鍋在駕駛室車頂：比火車的 x 偏多少
const PY = -17 // 湯鍋比火車的 y 高多少
const PS = 17 // 湯鍋 size
const M = 30 // 小怪獸
const MY = 77 - 0.42 * M
const MX = 44
const MOUTH = { x: MX + 1, y: MY - 6 }
/** 傻眼停多久 */
const HOLD = 0.5

/** 鍋子跟著火車動：火車的移動照抄一份給湯鍋（往右上偏 PX／PY），火車壓扁時鍋子一起沉 */
function carry(moves: Move[]): Move[] {
  const at = (v?: Move['to']) => v && { x: v.x + PX, y: v.y + PY }
  return moves.flatMap((m): Move[] => m.do === 'squash'
    ? [m, ...pressStack(m.at, m.dur ?? 0.3, m.amount ?? 0.2, T, ['pot'])]
    : m.do === 'moveTo' || m.do === 'enter' || m.do === 'hop'
      ? [m, { ...m, actor: 'pot', to: at(m.to), from: at(m.from) }]
      : [m])
}

/**
 * 主軸笑點：火車從後面開進站、急煞 → 鍋子往前滑、一歪 → 湯潑出去。每一次都一模一樣，k 越大鍋子歪越多、湯越多、震越大。
 * hit 是煞住的那一刻；潑出去的湯 0.3 秒後到 to（k=0 碗邊、k=1 臉、k=2 張大的嘴）。
 */
function brake(hit: number, k: number, to: { x: number; y: number }) {
  const run = 0.45
  const moves: Move[] = carry([
    { at: hit - run, actor: 'train', do: 'moveTo', to: { x: TX, y: G }, dur: run, ease: 'in' },
  ])
  moves.push(
    // 急煞：車頭往前一栽
    { at: hit, actor: 'train', do: 'tilt', amount: -(4 + 2 * k), dur: 0.3 },
    // 鍋子往前滑、往前歪，湯潑出去；停一下再滑回車頂
    { at: hit, actor: 'pot', do: 'moveTo', to: { x: TX + PX - 6 - 2 * k, y: G + PY + 1 }, dur: 0.15, ease: 'out' },
    { at: hit, actor: 'pot', do: 'rotateTo', amount: -(25 + 20 * k), dur: 0.15, ease: 'out' },
    { at: hit + 0.55, actor: 'pot', do: 'rotateTo', amount: 25 + 20 * k, dur: 0.3, ease: 'back' },
    { at: hit + 0.55, actor: 'pot', do: 'moveTo', to: { x: TX + PX, y: G + PY }, dur: 0.3 },
  )
  // 湯：一串橘色的湯從鍋子飛過去，一次比一次多、一次比一次大。
  // scale 是以鍋口為中心放大整串，終點要先縮回去，放大後才剛好落在 to
  const sc = [1.2, 1.5, 1.9][k]
  const lip = { x: TX + PX - 6 - 2 * k, y: G + PY - PS * 0.45 }
  const end = { x: lip.x + (to.x - lip.x) / sc, y: lip.y + (to.y - lip.y) / sc }
  const fx: Fx[] = [
    { at: hit - 0.05, kind: 'puff', actor: 'train', n: 6, dur: 0.5 },
    { at: hit + 0.02, kind: 'blow', actor: 'pot', to: end, emoji: '🟠', n: [5, 8, 13][k], dur: 0.45 + 0.1 * k, scale: sc },
    { at: hit + 0.02, kind: 'fountain', actor: 'pot', emoji: '🟠', n: [4, 7, 10][k], dur: 0.6, scale: 0.8 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.35, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  // 同一聲「嘰——嘩啦」，一次比一次多疊一個
  const cues: Cue[] = [{ at: hit - 0.1, sfx: 'slide' }, { at: hit + 0.05, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: hit + 0.3, sfx: 'plop' })
  return { moves, fx, camera, cues, land: hit + 0.3 }
}

/** 火車退回後面（鍋子跟著） */
const backUp = (at: number): Move[] => carry([{ at, actor: 'train', do: 'moveTo', to: { x: BACK, y: G }, dur: 0.5, ease: 'inOut' }])

const H1 = 1.1, H2 = 3.0, H3 = 6.1
const b1 = brake(H1, 0, { x: MX + 10, y: MY + 2 })
const b2 = brake(H2, 1, { x: MX, y: MY - 8 })
const b3 = brake(H3, 2, MOUTH)
const GULP = b3.land + 0.25
const POSE = GULP + 0.5

export default scene({
  duration: POSE + 2.1,
  bg: { top: '#8FD3F0', bottom: '#FFF3D9', floor: '#BDB6AA', scenery: 'hills' },
  actors: [
    { id: 'sign', emoji: '🚏', x: 21, y: 77 - 0.42 * 22, size: 22 },
    { id: 'flower', emoji: '🌼', x: 145, y: 77 - 0.42 * 9, size: 9 },
    { id: 'mon', emoji: 'hero:monster/idle', x: MX, y: MY, size: M, flip: true },
    { id: 'bowl', emoji: '🥣', x: MX + 10, y: MY + 4, size: 10, float: true },
    { id: 'carrot', emoji: '🥕', x: MX - 2, y: MY - 15, size: 9, float: true, hidden: true },
    { id: 'train', emoji: '🚂', x: 178, y: G, size: T },
    { id: 'pot', emoji: '🍲', x: 178 + PX, y: G + PY, size: PS, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：火車從右邊開過來；小怪獸捧著碗跳一下「湯來了！」
    ...carry([{ at: 0, actor: 'train', do: 'moveTo', to: { x: BACK, y: G }, dur: H1 - 0.45, ease: 'linear' }]),
    { at: 0.15, actor: 'mon', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: 0.3, actor: 'mon', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.3, actor: 'bowl', do: 'hop', amount: 4, dur: 0.35 },
    // 第 1 次：幾滴潑在碗邊，傻眼
    ...b1.moves,
    { at: b1.land, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: b1.land, actor: 'mon', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: b1.land + HOLD, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    ...backUp(H1 + 0.9),
    // 第 2 次：一大潑淋滿臉，一屁股坐倒，頭上黏一根紅蘿蔔
    ...b2.moves,
    { at: b2.land, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: b2.land, actor: 'mon', do: 'moveTo', to: { x: MX - 4, y: MY }, dur: 0.2, ease: 'out' },
    { at: b2.land, actor: 'bowl', do: 'moveTo', to: { x: MX + 7, y: MY + 7 }, dur: 0.2, ease: 'out' },
    { at: b2.land + 0.05, actor: 'carrot', do: 'pop', dur: 0.2 },
    { at: b2.land, actor: 'mon', do: 'shake', amount: 0.6, dur: 0.4 },
    ...backUp(H2 + 1.0),
    // 爬起來
    { at: 4.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 4.3, actor: 'mon', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.2 },
    { at: 4.3, actor: 'bowl', do: 'moveTo', to: { x: MX + 10, y: MY + 4 }, dur: 0.2 },
    // 停一拍：火車在後面蓄力（壓兩下）；小怪獸發抖……把碗一丟，嘴巴張到最大
    ...carry([
      { at: 4.6, actor: 'train', do: 'squash', amount: 0.08, dur: 0.25 },
      { at: 4.95, actor: 'train', do: 'squash', amount: 0.08, dur: 0.25 },
    ]),
    { at: 4.6, actor: 'mon', do: 'shake', amount: 0.5, dur: 0.5 },
    { at: 5.15, actor: 'bowl', do: 'moveTo', to: { x: 4, y: 72 }, arc: 14, dur: 0.45, ease: 'out' },
    { at: 5.15, actor: 'bowl', do: 'rotateTo', amount: -300, dur: 0.45 },
    { at: 5.2, actor: 'mon', do: 'squash', amount: -0.12, dur: 0.15 },
    { at: 5.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    // 第 3 次：整鍋湯潑過來——全進嘴巴
    ...b3.moves,
    { at: b3.land, actor: 'mon', do: 'squash', amount: -0.1, dur: 0.3 },
    { at: GULP, actor: 'mon', do: 'swap', emoji: 'hero:monster/stuffed' },
    { at: GULP, actor: 'mon', do: 'scaleTo', amount: 1.2, dur: 0.3, ease: 'back' },
    { at: GULP, actor: 'carrot', do: 'moveTo', to: { x: MX - 2, y: MY - 19 }, dur: 0.3, ease: 'back' },
    // 亮相：火車得意地跳一下，小怪獸摸肚子
    { at: POSE, actor: 'train', do: 'hop', amount: 4, dur: 0.35 },
    { at: POSE, actor: 'pot', do: 'hop', amount: 4, dur: 0.35 },
    { at: POSE + 0.1, actor: 'mon', do: 'hop', amount: 2, dur: 0.3 },
    { at: POSE + 0.1, actor: 'carrot', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    ...b1.fx,
    { at: b1.land, kind: 'rain', actor: 'mon', emoji: '🟠', n: 3, dur: 0.7, scale: 1.3 },
    ...b2.fx,
    { at: b2.land, kind: 'burst', actor: 'mon', emoji: '🫛', n: 5, dur: 0.6, scale: 1.4 },
    { at: b2.land + 0.1, kind: 'rain', actor: 'mon', emoji: '🟠', n: 6, dur: 1.0, scale: 1.5 },
    { at: 4.6, kind: 'puff', actor: 'train', n: 6, dur: 0.4 },
    { at: 4.95, kind: 'puff', actor: 'train', n: 6, dur: 0.4 },
    { at: 4.6, kind: 'sweat', actor: 'mon', dur: 0.6 },
    ...b3.fx,
    { at: POSE, kind: 'burst', actor: 'train', emoji: '🎉', n: 8, dur: 0.9, scale: 1.5 },
    { at: POSE + 0.15, kind: 'burst', actor: 'mon', emoji: '✨', n: 8, dur: 0.8, scale: 1.3 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.15, to: { x: 78, y: 50 } },
    ...b1.camera,
    { at: b1.land, dur: 0.4, do: 'punch', amount: 0.1, to: { x: MX + 8, y: MY } },
    ...b2.camera,
    { at: b2.land, dur: 0.45, do: 'punch', amount: 0.16, to: { x: MX, y: MY - 4 } },
    // 停一拍：慢慢推近小怪獸
    { at: 4.5, dur: 0.8, do: 'zoom', amount: 1.3, to: { x: 88, y: 52 } },
    ...b3.camera,
    { at: GULP, dur: 0.45, do: 'punch', amount: 0.1, to: { x: 72, y: 52 } },
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.25, to: { x: 80, y: 50 } },
  ],
  lights: [
    { at: GULP, dur: 0.05, level: -0.35 },
    { at: GULP + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'rumble' },
    { at: 0.3, sfx: 'boing' },
    ...b1.cues,
    ...b2.cues,
    { at: 4.6, sfx: 'rumble' },
    { at: 5.15, sfx: 'whoosh' },
    { at: 5.3, sfx: 'boing' },
    ...b3.cues,
    { at: GULP, sfx: 'gulp' },
    { at: POSE, say: '湯瑪士小火車' },
    { at: POSE + 0.6, sfx: 'cheer' },
  ],
})
