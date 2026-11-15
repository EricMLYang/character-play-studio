import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 分（v2）：愛現的忍者小老鼠，每次「嘿！」舉起手、跳起來一記手刀劈下去，畫面中間的東西就「喀」地分成兩半、往左右彈開，他落在兩半中間：
// 草莓蛋糕（一撇從左邊那一半飛出來）→ 大西瓜（一捺從右邊那一半飛出來，八＝分開的兩半）→ 停一拍，掉下來一顆大石頭，他傻眼、托下巴、舉手抖一抖……劈開了（刀從他的手刀飛出來）。
// 語詞那一刻他站在兩半石頭中間張開雙手：分開！回馬槍：沒東西可劈了，他往上一跳順手一劈——劈到國字「分」自己，八往兩邊分開、刀掉下來，愣住，字又「啪」地合回去。
// 最後畫面暗下來只剩「分」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「分！」，然後退場只留字。
// 分、分、分開、這是什麼字？、分
const P = 77 - 0.42 * 24 // 小老鼠（size 24）站在地上的 y
/** 小老鼠每次出發的地方（左邊） */
const MX = 36
/** 被劈的東西每次都在畫面正中間（兩個「半邊」角色疊在一起就是整個） */
const X = 82
const BASE = 30
const Y = 77 - 0.42 * BASE
/** 每一個東西多大（size）、劈開後兩半各往外分開多遠、他跳多高才搆得到頂 */
const ITEMS = [
  { whole: 'prop:cake', halves: 'prop:cake-halves', crop: true, size: 30, d: 17 },
  { whole: 'prop:watermelon', halves: 'prop:watermelon-half', crop: false, size: 38, d: 22 },
  { whole: 'prop:rock', halves: 'prop:rock', crop: true, size: 50, d: 46 },
] as const
/** 東西的頂端（舞台 y）：照道具圖量的內容範圍 */
const TOP = [77 - 0.42 * 30 - 15 + 0.098 * 30, 77 - 0.42 * 38 - 19 + 0.055 * 38, 77 - 0.42 * 50 - 25 + 0.217 * 50]
/** 刀光：白色、粗 */
const BLADE = '#FFFFFF'
/** 傻眼／得意停多久 */
const HOLD = 0.45

/**
 * 「嘿！喀！」：舉起手（throw 姿勢、身體拉長，預備）→ 跳到東西正上方 → 手刀劈下去（stance 姿勢、身體往前傾）那一刻：
 * 一道白色刀光從上到下劈過東西正中間＋手臂甩一道白弧＋鏡頭推近＋震＋同一個音效 → 東西換成切開的樣子、兩半往左右彈開、往外倒，
 * 他落在兩半中間。k 是第幾次（東西越來越大、分得越來越開、震得越大、音效疊越多）。
 */
function chop(at: number, k: number, prep = 0.55) {
  const it = ITEMS[k]
  const peak = TOP[k] - 1 - 0.42 * 24
  const moves: Move[] = [
    // 預備：舉起手，身體往上拉長
    { at: at - prep, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/throw' },
    { at: at - prep, actor: 'mouse', do: 'squash', amount: -0.15, dur: prep - 0.2 },
    // 嘿！跳到東西正上方
    { at: at - 0.28, actor: 'mouse', do: 'moveTo', to: { x: X - 7, y: peak }, arc: 4, dur: 0.28, ease: 'out' },
    // 劈！
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at, actor: 'mouse', do: 'tilt', amount: 14, dur: 0.35 },
    { at: at + 0.02, actor: 'mouse', do: 'moveTo', to: { x: X, y: P }, dur: 0.22, ease: 'in' },
    // 東西換成切開的樣子，兩半往左右彈開、往外倒
    { at, actor: 'L', do: 'swap', emoji: it.halves, half: it.crop ? 'left' : 'whole' },
    { at, actor: 'R', do: 'swap', emoji: it.halves, half: it.crop ? 'right' : 'whole' },
    { at: at + 0.02, actor: 'L', do: 'moveTo', to: { x: X - it.d, y: Y }, arc: 4 + k, dur: 0.3, ease: 'out' },
    { at: at + 0.02, actor: 'R', do: 'moveTo', to: { x: X + it.d, y: Y }, arc: 4 + k, dur: 0.3, ease: 'out' },
    { at: at + 0.02, actor: 'L', do: 'rotateTo', amount: -10, dur: 0.3, ease: 'back' },
    { at: at + 0.02, actor: 'R', do: 'rotateTo', amount: 10, dur: 0.3, ease: 'back' },
    // 落地：得意（小老鼠愛現）
    { at: at + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
  ]
  const fx: Fx[] = [
    // 手臂甩一道白弧（手刀）
    { at: at - 0.06, kind: 'swoosh', actor: 'mouse', to: { x: X + 20, y: TOP[k] }, dx: 2, dy: 6, n: 12, sweep: 150, dur: 0.3, scale: 1 + 0.1 * k, color: BLADE, width: 3.2 },
    // 刀光：從東西上面直直劈到底
    { at, kind: 'line', actor: 'cut', dx: 0, dy: TOP[k] - 6 - Y, to: { x: X, y: 77 }, color: BLADE, width: 2.4 + 0.4 * k, dur: 0.35 },
    // 切口噴一圈星光，一次比一次多
    { at: at + 0.05, kind: 'burst', x: X, y: TOP[k] + 4, emoji: '✨', n: 5 + 2 * k, dur: 0.4, scale: 1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: X, y: TOP[k] + 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（咻—喀），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.25, sfx: 'whoosh' }, { at, sfx: 'crack' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 兩半往兩邊滑出畫面；小老鼠後空翻回到左邊；下一個東西從天上掉下來（兩半合起來就是整個） */
function next(at: number, k: number): Move[] {
  const it = ITEMS[k], prev = ITEMS[k - 1]
  return [
    { at, actor: 'L', do: 'moveTo', to: { x: -40, y: Y }, dur: 0.35, ease: 'in' },
    { at, actor: 'R', do: 'moveTo', to: { x: 200, y: Y }, dur: 0.35, ease: 'in' },
    // 他往上後空翻，左邊那一半從他腳下滑過去
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at, actor: 'mouse', do: 'moveTo', to: { x: MX, y: P }, arc: 16, dur: 0.4, ease: 'out' },
    { at, actor: 'mouse', do: 'spin', times: -1, dur: 0.4, pivot: 'center' },
    // 換成下一個東西，回到正中間、從天上掉下來
    { at: at + 0.4, actor: 'L', do: 'rotateTo', amount: 10, dur: 0.01 },
    { at: at + 0.4, actor: 'R', do: 'rotateTo', amount: -10, dur: 0.01 },
    { at: at + 0.4, actor: 'L', do: 'swap', emoji: it.whole, half: 'left' },
    { at: at + 0.4, actor: 'R', do: 'swap', emoji: it.whole, half: 'right' },
    { at: at + 0.4, actor: 'L', do: 'scaleTo', amount: it.size / prev.size, dur: 0.01 },
    { at: at + 0.4, actor: 'R', do: 'scaleTo', amount: it.size / prev.size, dur: 0.01 },
    { at: at + 0.4, actor: 'L', do: 'moveTo', to: { x: X, y: Y }, dur: 0.01 },
    { at: at + 0.4, actor: 'R', do: 'moveTo', to: { x: X, y: Y }, dur: 0.01 },
    { at: at + 0.42, actor: 'L', do: 'drop', dur: 0.4 },
    { at: at + 0.42, actor: 'R', do: 'drop', dur: 0.4 },
    { at: at + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
  ]
}

const H1 = 1.75, H2 = 4.1, H3 = 6.6, H4 = 9.5
const c1 = chop(H1, 0)
const c2 = chop(H2, 1)
const c3 = chop(H3, 2, 0.5)
/** 國字拼好（刀從手刀飛上去）、home、park */
const DONE = H3 + 0.05 + 0.6
const HOME = DONE + 0.05, PARK = HOME + 0.85
/** 語詞那一刻 */
const WORD = PARK + 0.3

const clip: Clip = {
  format: 2,
  char: '分',
  meta: { theme: '忍者小老鼠手刀劈東西', cast: '小老鼠＋蛋糕、西瓜、大石頭', gags: ['忍者小老鼠每次舉手、跳起來嘿地一記手刀劈下去，畫面中間的東西就喀地分成兩半、往左右彈開，一次比一次大（草莓蛋糕、大西瓜、停一拍掉下來一顆大石頭）；回馬槍是沒東西可劈了，他往上順手一劈，劈到國字「分」自己，八往兩邊分開、刀掉下來，愣住，字又啪地合回去'] },
  duration: 15,
  bg: { top: '#FFE3C2', bottom: '#FFF4E3', floor: '#C9A27A', scenery: 'hills' },
  actors: [
    // 被劈的東西：兩個「半邊」疊在同一個位置就是整個；劈開時各自往兩邊
    { id: 'L', emoji: 'prop:cake', x: X, y: Y, size: BASE, half: 'left' },
    { id: 'R', emoji: 'prop:cake', x: X, y: Y, size: BASE, half: 'right' },
    // 刀光的起點（看不到）：每次都劈在正中間
    { id: 'cut', emoji: '⭐', x: X, y: Y, size: 40, hidden: true, float: true },
    // 姿勢圖朝左，翻過來面向右邊（問他時也面向右邊的字）
    { id: 'mouse', emoji: 'hero:mouse/idle', x: MX, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 小老鼠衝進來，擺忍者架式看著蛋糕
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'back' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 第 1 次：蛋糕
    ...c1.moves,
    ...next(H1 + 1.0, 1),
    // 第 2 次：大西瓜
    ...c2.moves,
    { at: H2 + 0.3 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: H2 + 0.3 + HOLD, actor: 'mouse', do: 'hop', amount: 3, dur: 0.25 },
    ...next(H2 + 1.0, 2),
    // 第 3 次前停一拍：掉下來的是一顆大石頭！傻眼、托下巴想……舉手抖一抖
    { at: H2 + 1.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: H2 + 1.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: H2 + 1.85, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.3 },
    { at: H3 - 0.4, actor: 'mouse', do: 'shake', amount: 0.8, dur: 0.3 },
    ...c3.moves,
    // 石頭兩半停在兩邊；國字 home 到正中央時他退到左邊
    { at: H3 + 0.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: H3 + 0.75, actor: 'mouse', do: 'moveTo', to: { x: 22, y: P }, arc: 6, dur: 0.35 },
    { at: HOME + 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    // 語詞那一刻：國字讓位，他走回兩半石頭中間、張開雙手——分開！
    { at: PARK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: PARK, actor: 'mouse', do: 'moveTo', to: { x: X - 2, y: P }, dur: 0.3 },
    { at: PARK + 0.05, actor: 'L', do: 'moveTo', to: { x: X - 28, y: Y }, dur: 0.3 },
    { at: PARK + 0.05, actor: 'R', do: 'moveTo', to: { x: X + 28, y: Y }, dur: 0.3 },
    { at: WORD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/hug' },
    { at: WORD, actor: 'mouse', do: 'scaleTo', amount: 1.35, dur: 0.25, ease: 'back' },
    { at: H4 - 0.65, actor: 'mouse', do: 'scaleTo', amount: 1 / 1.35, dur: 0.2 },
    { at: WORD, actor: 'mouse', do: 'hop', amount: 3, dur: 0.25 },
    { at: WORD + 0.05, actor: 'L', do: 'tilt', amount: -6, dur: 0.3 },
    { at: WORD + 0.05, actor: 'R', do: 'tilt', amount: 6, dur: 0.3 },
    // 回馬槍（第 4 次）：沒東西可劈了……抬頭看國字，舉手——嘿！往上一劈
    { at: H4 - 0.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: H4 - 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/throw' },
    { at: H4 - 0.4, actor: 'mouse', do: 'squash', amount: -0.15, dur: 0.25 },
    { at: H4 - 0.12, actor: 'mouse', do: 'moveTo', to: { x: X - 2, y: P - 8 }, dur: 0.12, ease: 'out' },
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: H4, actor: 'mouse', do: 'tilt', amount: -14, dur: 0.3 },
    { at: H4 + 0.05, actor: 'mouse', do: 'moveTo', to: { x: X - 2, y: P }, dur: 0.2, ease: 'in' },
    // 國字分開了！傻眼停住
    { at: H4 + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: H4 + 0.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    // 石頭兩半滑出畫面
    { at: H4 + 0.6, actor: 'L', do: 'moveTo', to: { x: -40, y: Y }, dur: 0.4, ease: 'in' },
    { at: H4 + 0.6, actor: 'R', do: 'moveTo', to: { x: 200, y: Y }, dur: 0.4, ease: 'in' },
    // 問他：小老鼠走到左前方、變大，轉向觀眾
    { at: 10.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: 10.6, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3 },
    { at: 10.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 10.9, actor: 'mouse', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 11.95, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 13.45, actor: 'mouse', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（衝刺），畫面只留下字
    { at: 13.72, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 13.72, actor: 'mouse', do: 'flip' },
    { at: 13.75, actor: 'mouse', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 刀光的起點搬到國字上面（回馬槍劈國字）
    { at: H4 - 0.2, actor: 'cut', do: 'moveTo', to: { x: 80, y: 0 }, dur: 0.01 },
  ],
  builds: [
    // 第 1 次：八的一撇從左邊那一半飛出來；第 2 次：八的一捺從右邊那一半飛出來
    { at: H1 + 0.1, dur: 0.6, strokes: [0], from: 'L', color: partColor('八') },
    { at: H2 + 0.1, dur: 0.6, strokes: [1], from: 'R', color: partColor('八') },
    // 第 3 次：刀從他劈下去的手刀飛出來
    { at: H3 + 0.05, dur: 0.6, strokes: [2, 3], from: 'mouse', color: partColor('刀') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 回馬槍：劈到國字自己——八往兩邊分開、刀掉下來，停住，再合回去
    { at: H4, dur: 0.9, do: 'split', parts: [
      { strokes: [0], to: { x: -9, y: -1 }, r: -14 },
      { strokes: [1], to: { x: 9, y: -1 }, r: 14 },
      { strokes: [2, 3], to: { x: 0, y: 9 }, r: 10 },
    ] },
    { at: H4 + 0.9, dur: 0.3, do: 'wobble' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.55, dur: 3.4, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.6, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...c1.fx,
    ...c2.fx,
    { at: H2 + 1.5, kind: 'pop', actor: 'mouse', emoji: '❗', dx: -6 },
    { at: H2 + 1.95, kind: 'sweat', actor: 'mouse' },
    ...c3.fx,
    // 回馬槍：手刀往上一甩、刀光從國字上面劈下來
    { at: H4 - 0.06, kind: 'swoosh', actor: 'mouse', to: { x: X + 20, y: 20 }, dx: 2, dy: 6, n: 12, sweep: 150, dur: 0.3, scale: 1.3, color: BLADE, width: 3.2 },
    { at: H4, kind: 'line', actor: 'cut', dx: 0, dy: 2, to: { x: 80, y: 44 }, color: BLADE, width: 3.6, dur: 0.35 },
    { at: H4 + 0.05, kind: 'burst', x: 80, y: 30, emoji: '✨', n: 7, dur: 0.4, scale: 1.2 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...c1.camera,
    ...c2.camera,
    // 石頭掉下來「咚」
    { at: H2 + 1.82, dur: 0.3, do: 'shake', amount: 1.4 },
    ...c3.camera,
    // 語詞與回馬槍：全景
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    { at: H4, dur: 0.4, do: 'shake', amount: 2.2 },
    { at: 10.4, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '分' },
    ...c1.cues,
    { at: H1 + 1.82, sfx: 'plop' },
    ...c2.cues,
    { at: H2 + 1.82, sfx: 'bonk' },
    ...c3.cues,
    { at: HOME + 0.1, say: '分' },
    { at: WORD, say: '分開' },
    { at: H4 - 0.25, sfx: 'whoosh' },
    { at: H4, sfx: 'crack' },
    { at: H4 + 0.06, sfx: 'boing' },
    { at: H4 + 0.1, sfx: 'rumble' },
    { at: H4 + 0.9, sfx: 'clink' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '分' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
