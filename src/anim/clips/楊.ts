import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 楊（v2）：楊捷睿想摘楊桃樹上最大的那顆楊桃——每次他跳起來搆，樹一搖，掉下來的楊桃就「咚」地砸在他頭上，一次比一次多：
// 一顆（木從樹上飛出來）、一串把他砸得跌坐（昜的上半從楊桃飛出來）、先停一拍再跳，整棵樹下楊桃雨把他壓扁（昜的下半）。
// 回馬槍：他戴好安全帽再跳一次——什麼都沒掉，正得意，他要的那顆最大的楊桃掉下來、變成超大一顆把他連人帶安全帽壓扁。
// 最後畫面暗下來只剩「楊」，他轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「楊！」，然後退場只留字。
// 楊、楊、楊桃、這是什麼字？、楊
const P = 66.9 // 楊捷睿（size 24）站在地上的 y
/** 楊桃樹（size 56）：畫面上最大的東西，站在右邊——國字拼好放大到正中央時才不會被樹擋住 */
const TX = 130
const TS = 56
const TY = 77 - 0.42 * TS
/** 他每次都站在同一個地方：樹冠左下、他要的那顆楊桃底下 */
const X = 116
/** 他要的那顆（最大的）楊桃，掛在樹冠左邊，跳起來還差一點點搆不到 */
const GOAL = { x: 110, y: 36 }
/** 掉下來的楊桃從樹冠頂端冒出來、砸到他頭上的位置 */
const TOP = { x: 120, y: 30 }
const HEAD = { x: X, y: 51 }
/** 第四次那顆變超大，砸下來的位置與倍率 */
const BIG = 3.4
const HEAD_BIG = { x: X, y: 50 }
/** 砸到以後傻眼停多久 */
const HOLD = 0.45
/** 楊桃：自製道具圖（emoji 沒有楊桃，以前用 ⭐ 會讓他以為楊桃＝星星） */
const FRUIT = 'prop:starfruit'
/** 語詞那一刻：楊桃到正中間變大 */
const MID = { x: 86, y: 55 }
const WORD_BIG = 2.4

/**
 * 「跳—搖—咚」：他蹲一下、跳起來搆楊桃（預備）→ 碰到樹枝、整棵樹一搖（同一個音）→ 樹冠上掉下楊桃，「咚」砸在他頭上那一刻
 * 傻眼（第三次起直接壓扁）＋💥＋鏡頭推近＋震＋同一個音效，一次比一次多疊一個音。k 是第幾次（越後面越大）。
 * 第 4 次（goal）：他戴著安全帽跳，樹搖了卻什麼都沒掉——等了一拍，他要的那顆才掉下來、一邊掉一邊變超大。
 */
function bonk(at: number, k: number) {
  const giant = k >= 3
  const j = at - (giant ? 1.35 : 0.85)
  const moves: Move[] = [
    // 蹲一下、跳起來搆
    { at: j, actor: 'yang', do: 'squash', amount: -0.25, dur: 0.15 },
    { at: j + 0.12, actor: 'yang', do: 'hop', amount: 12, dur: 0.38 },
    // 碰到樹枝：整棵樹一搖，他要的那顆晃一晃（就是不掉）
    { at: j + 0.3, actor: 'tree', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.5 },
    { at: j + 0.3, actor: 'goal', do: 'shake', amount: 1.4, dur: 0.5 },
    // 咚！
    { at, actor: 'yang', do: 'swap', emoji: k >= 2 ? 'hero:yang/flat' : 'hero:yang/surprised' },
    { at, actor: 'yang', do: 'squash', amount: 0.3 + 0.1 * k, dur: 0.3 },
  ]
  if (!giant) moves.push(
    // 跳起來雙手往上搆（D 表的 jump），落地前換回伸手、等著被砸
    { at: j + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: j + 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    // 樹冠頂端冒出一顆楊桃，直直掉到他頭上
    { at: at - 0.38, actor: 'nut', do: 'moveTo', to: TOP, dur: 0.01 },
    { at: at - 0.37, actor: 'nut', do: 'pop', dur: 0.08 },
    { at: at - 0.3, actor: 'nut', do: 'moveTo', to: HEAD, dur: 0.3, ease: 'in' },
  )
  else moves.push(
    // 等了一拍：他要的那顆先抖一下，掉下來、一邊掉一邊變超大
    { at: at - 0.6, actor: 'goal', do: 'shake', amount: 1.6, dur: 0.22 },
    { at: at - 0.38, actor: 'goal', do: 'moveTo', to: HEAD_BIG, dur: 0.38, ease: 'in' },
    { at: at - 0.38, actor: 'goal', do: 'scaleTo', amount: BIG, dur: 0.38, ease: 'in' },
    { at, actor: 'goal', do: 'squash', amount: 0.25, dur: 0.3 },
  )
  const fx: Fx[] = [
    // 樹一搖：葉子沙沙
    { at: j + 0.3, kind: 'burst', x: TX - 6, y: TY - 14, emoji: '🍃', n: 4 + 2 * k, dur: 0.5, scale: 1 + 0.2 * k },
    // 💥 每次都在他頭上同一個位置，一次比一次大
    { at, kind: 'burst', x: X - 2, y: k >= 2 ? P - 10 : P - 15, n: 1, dur: 0.35, scale: 1.6 + 0.4 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: k === 2 ? 0.08 : 0.08 + 0.04 * k, to: { x: X - 6, y: k >= 2 ? 70 : 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: j + 0.3, sfx: 'rumble' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/** 楊桃從他頭上彈開，飛出畫面右邊（之後收起來，下一次再從樹冠冒出來） */
const away = (at: number): Move[] => [
  { at, actor: 'nut', do: 'moveTo', to: { x: 178, y: 58 }, arc: 12, dur: 0.45, ease: 'out' },
  { at, actor: 'nut', do: 'spin', times: 1, dur: 0.45, pivot: 'center' },
  { at: at + 0.5, actor: 'nut', do: 'vanish', dur: 0.01 },
]

const H1 = 2.2, H2 = 3.95, H3 = 6.45, H4 = 10.6
const b1 = bonk(H1, 0)
const b2 = bonk(H2, 1)
const b3 = bonk(H3, 2)
const b4 = bonk(H4, 3)

const clip: Clip = {
  format: 2,
  char: '楊',
  meta: { theme: '楊捷睿摘楊桃', cast: '楊捷睿＋楊桃樹＋楊桃', gags: ['楊捷睿每次跳起來搆樹上的楊桃，樹一搖，掉下來的楊桃就咚地砸在他頭上、一次比一次多（一顆、一串、整棵樹下楊桃雨）；回馬槍是他戴好安全帽再跳，什麼都沒掉，正得意，他要的那顆變成超大一顆掉下來把他壓扁'] },
  duration: 15,
  bg: { top: '#BEE6FF', bottom: '#F4FBFF', floor: '#A3D97E', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:starfruit-tree', x: TX, y: TY, size: TS },
    // 他要的那顆最大的楊桃
    { id: 'goal', emoji: FRUIT, x: GOAL.x, y: GOAL.y, size: 11, float: true, pivot: 'center' },
    // 每次從樹上掉下來砸他的那顆
    { id: 'nut', emoji: FRUIT, x: TOP.x, y: TOP.y, size: 11, float: true, hidden: true, pivot: 'center' },
    // 姿勢圖朝左；登場時翻過來面向右邊，走到樹下再轉回來面向他要的那顆
    { id: 'yang', emoji: 'hero:yang/idle', x: 80, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 楊捷睿登場，抬頭看字框
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.5, ease: 'out' },
    // 看到樹上那顆大楊桃：就是它！
    { at: 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 0.75, actor: 'goal', do: 'bounce', amount: 1.5, times: 1, dur: 0.3 },
    { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 1.0, actor: 'yang', do: 'moveTo', to: { x: X, y: P }, dur: 0.3 },
    { at: 1.3, actor: 'yang', do: 'flip' },
    // 第 1 次：跳起來搆——樹一搖，一顆楊桃咚！傻眼
    ...b1.moves,
    ...away(H1 + 0.05),
    { at: H1 + HOLD + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 2 次：再跳——一串楊桃咚咚咚！被砸得跌坐、滑到旁邊
    ...b2.moves,
    ...away(H2 + 0.05),
    { at: H2 + HOLD, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: H2 + HOLD, actor: 'yang', do: 'moveTo', to: { x: X - 12, y: P }, dur: 0.3, ease: 'out' },
    { at: 4.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 4.9, actor: 'yang', do: 'moveTo', to: { x: X, y: P }, dur: 0.25 },
    // 第 3 次前停一拍：托下巴抬頭看那顆、樹抖一抖……跳！
    { at: 5.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: 5.15, actor: 'yang', do: 'tilt', amount: 8, dur: 0.35 },
    { at: 5.3, actor: 'tree', do: 'shake', amount: 0.5, dur: 0.25 },
    // 整棵樹下楊桃雨：壓扁
    ...b3.moves,
    // 最後那顆彈到樹下，躺著
    { at: H3 + 0.05, actor: 'nut', do: 'moveTo', to: { x: 142, y: 72.4 }, arc: 8, dur: 0.35, ease: 'out' },
    { at: H3 + 0.05, actor: 'nut', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，他爬起來，楊桃跳到正中間、變大
    { at: 7.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 7.85, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 8.05, actor: 'yang', do: 'moveTo', to: { x: 62, y: P }, dur: 0.4 },
    { at: 8.3, actor: 'nut', do: 'moveTo', to: MID, arc: 12, dur: 0.35, ease: 'out' },
    { at: 8.3, actor: 'nut', do: 'scaleTo', amount: WORD_BIG, dur: 0.35, ease: 'back' },
    { at: 8.45, actor: 'yang', do: 'flip' },
    { at: 8.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 8.45, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.5, actor: 'nut', do: 'tilt', amount: 10, dur: 0.4 },
    // 切開：橫切面是星星（楊桃的樣子），他一口吃掉
    { at: 8.8, actor: 'nut', do: 'swap', emoji: 'prop:starfruit-slice' },
    // 一口吃掉
    { at: 9.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: 9.0, actor: 'nut', do: 'moveTo', to: { x: 70, y: 56 }, dur: 0.15, ease: 'in' },
    { at: 9.0, actor: 'nut', do: 'scaleTo', amount: 1 / WORD_BIG, dur: 0.15, ease: 'in' },
    { at: 9.15, actor: 'nut', do: 'vanish', dur: 0.06 },
    { at: 9.1, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.2 },
    // 回馬槍（第 4 次）：戴好安全帽、比讚，走回樹下再跳一次
    { at: 9.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/helmet' },
    { at: 9.3, actor: 'yang', do: 'moveTo', to: { x: X, y: P }, dur: 0.35 },
    { at: 9.65, actor: 'yang', do: 'flip' },
    ...b4.moves,
    // 超大楊桃從他身上彈開，滾出畫面右邊
    { at: H4 + 0.35, actor: 'goal', do: 'moveTo', to: { x: 200, y: 56 }, arc: 10, dur: 0.4, ease: 'in' },
    { at: H4 + 0.35, actor: 'goal', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
    // 問他：他爬起來、變大，站在右前方面向字；樹在暗處收起來
    { at: 11.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 11.1, actor: 'yang', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    { at: 11.1, actor: 'yang', do: 'moveTo', to: { x: 124, y: P + 4 }, dur: 0.3 },
    { at: 11.4, actor: 'tree', do: 'vanish', dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.15, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: 12.65, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.15, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.65, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: 13.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.65, actor: 'yang', do: 'hop', amount: 6, dur: 0.2 },
    // 退場，畫面只留下字
    { at: 13.82, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.82, actor: 'yang', do: 'flip' },
    { at: 13.82, actor: 'yang', do: 'moveTo', to: { x: 205, y: P + 4 }, dur: 0.18, ease: 'in' },
  ],
  builds: [
    // 第 1 次：木從樹上飛出來
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2, 3], from: 'tree', color: partColor('木') },
    // 第 2、3 次：昜從砸下來的楊桃飛出來
    { at: H2 + 0.05, dur: 0.55, strokes: [4, 5, 6, 7], from: 'nut', color: partColor('昜') },
    { at: H3 + 0.05, dur: 0.6, strokes: [8, 9, 10, 11, 12], from: { x: X, y: 58 }, color: partColor('昜') },
  ],
  glyph: [
    { at: 7.15, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.95, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的楊捷睿
    { at: 11.05, dur: 2.93, do: 'ask', keep: ['yang'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: 11.1, dur: 0.4, do: 'home' },
    { at: 13.65, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.75, kind: 'pop', actor: 'yang', emoji: '❗', dx: 4, dur: 0.5, scale: 1.4 },
    ...b1.fx,
    { at: H1 + 0.3, kind: 'sweat', actor: 'yang' },
    ...b2.fx,
    // 一串：旁邊還掉下好幾顆
    { at: H2 - 0.3, kind: 'rain', x: X + 4, y: 26, emoji: FRUIT, n: 5, scale: 1.6, dur: 0.65 },
    { at: H2 + HOLD + 0.1, kind: 'dizzy', actor: 'yang', dur: 0.45 },
    // 第 3 次前停一拍
    { at: 5.15, kind: 'pop', actor: 'yang', emoji: '❓', dx: -8, dur: 0.5, scale: 1.3 },
    ...b3.fx,
    // 整棵樹下楊桃雨
    { at: H3 - 0.35, kind: 'rain', x: TX, y: 18, emoji: FRUIT, n: 18, scale: 2.6, dur: 1.0 },
    { at: H3, kind: 'burst', x: X - 2, y: P - 6, emoji: FRUIT, n: 8, dur: 0.5, scale: 1.4 },
    { at: H3 + 0.5, kind: 'dizzy', actor: 'yang', dur: 0.7 },
    // 語詞那一刻：楊桃閃亮
    { at: 8.6, kind: 'burst', x: MID.x, y: MID.y, emoji: '✨', n: 6, dur: 0.5, scale: 1.4 },
    { at: 9.12, kind: 'pop', actor: 'yang', emoji: '😋', dx: 10, dur: 0.4 },
    // 戴好安全帽：這次不怕了
    { at: 9.35, kind: 'pop', actor: 'yang', emoji: '👍', dx: -10, dy: 8, dur: 0.4 },
    // 樹搖了……什麼都沒掉？
    { at: H4 - 0.8, kind: 'pop', actor: 'yang', emoji: '❓', dx: -8, dur: 0.4 },
    ...b4.fx,
    // 安全帽被砸飛
    { at: H4 + 0.05, kind: 'pop', actor: 'yang', emoji: '⛑️', dx: -16, dy: -2, dur: 0.6, scale: 2 },
    { at: 13.65, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.32 },
  ],
  camera: [
    // 前三次同一個鏡位：樹和他都在畫面裡（自動取景會跟著搖動的大樹往上推，把壓扁的他切掉）。
    // 只推一點點（1.04）：國字在上方要整個留著，鏡頭能推的空間有限，留給每次砸頭的 punch
    { at: 1.1, dur: 0.4, do: 'zoom', amount: 1.04, to: { x: 100, y: 52 } },
    { at: 6.75, dur: 0.4, do: 'zoom', amount: 1 },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    ...b4.camera,
  ],
  lights: [
    { at: 7.15, dur: 0.05, level: -0.35 },
    { at: 7.2, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '楊' },
    { at: 0.75, sfx: 'blip' },
    ...b1.cues,
    ...b2.cues,
    ...b3.cues,
    { at: 7.25, say: '楊' },
    { at: 8.3, sfx: 'boing' },
    { at: 8.5, say: '楊桃' },
    { at: 9.1, sfx: 'gulp' },
    { at: 9.35, sfx: 'clink' },
    ...b4.cues,
    { at: 11.15, say: FIXED_LINES.clipAsk },
    { at: 13.65, say: '楊' },
    { at: 13.7, sfx: 'cheer' },
  ],
}

export default clip
