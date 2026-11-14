import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 捷（v2）：楊捷睿要搭捷運——每次他跑到車門口、手一伸，捷運就「咻」地開走，那陣風把他捲得一次比一次遠：
// 原地轉一圈（扌從他伸出去的手飛出來）、滾到畫面邊、先停一拍再被捲上天（右邊從捷運剛停的地方飛起來）。
// 回馬槍：捷運再進站，這次他搶先跳上車頂比 ✌️——捷運「咻」地從他腳底下開走，他懸在半空傻眼，才掉下來。
// 最後畫面暗下來只剩「捷」，他轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「捷！」，然後退場只留字。
// 捷、捷、捷運、這是什麼字？、捷
const P = 66.9 // 楊捷睿（size 24）站在地上的 y
/** 捷運：三節車廂的自製道具圖（車頭朝右，往右開走）。size 是車身全長，比人高一點、橫跨大半個畫面 */
const TS = 112
const T = 77 - 0.42 * TS
/** 捷運停的地方（畫面正中間） */
const TX = 96
/** 前三次都跑到同一個地方：捷運最左邊的車門口 */
const DOOR = 68
/** 他每次出發的地方 */
const HOME = 30
/** 第四次：捷運停的地方、他站在車頂的位置與高度 */
const TX4 = 70
const ROOF_X = 60
const ROOF_Y = 45.5 // 他站在車頂的 y（引擎放大角色時離地的高度也跟著放大，實際腳底剛好踩在車頂）
/** 捷運開走以後傻眼停多久，才被風捲走 */
const HOLD = 0.45
/** 捷運先抖一下（預備）到開走之間多久 */
const WIND = 0.3

/**
 * 「咻」：捷運先抖一下、往後縮（預備）→ 咻地往右開走 → 同一刻 💨 捲到他身上＋鏡頭推近＋震＋同一個音效，
 * 他手還伸著、傻眼停 HOLD 秒（看得見臉）才被捲走。k 是第幾次（越後面越大），x、y 是他當下的位置。
 */
function zip(at: number, k: number, x = DOOR, y = P, tx = TX) {
  const moves: Move[] = [
    { at: at - WIND, actor: 'train', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.22 },
    { at: at - 0.1, actor: 'train', do: 'moveTo', to: { x: 240, y: T }, dur: 0.3, anticipate: 4, ease: 'in' },
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at, actor: 'yang', do: 'squash', amount: 0.2 + 0.08 * k, dur: 0.25 },
  ]
  const fx: Fx[] = [
    // 💨 每次都捲在他身上同一個位置，一次比一次大
    { at, kind: 'burst', x: x + 6, y: y + (k >= 3 ? 4 : -6), emoji: '💨', n: 4 + k, dur: 0.5, scale: 1.8 + 0.4 * k },
    { at, kind: 'puff', x: tx, y: 70, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x, y: k >= 3 ? 40 : y - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - WIND, sfx: 'rumble' }, { at: at - 0.05, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'slide' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues }
}

/** 捷運「繞一圈」從左邊開回來，停在站上 */
const back = (at: number, x = TX): Move[] => [
  { at: at - 0.02, actor: 'train', do: 'moveTo', to: { x, y: T }, dur: 0.01 },
  { at, actor: 'train', do: 'enter', from: { x: -70, y: T }, dur: 0.5, ease: 'back' },
]

const H1 = 1.6, H2 = 3.55, H3 = 6.0, H4 = 10.2
const z1 = zip(H1, 0)
const z2 = zip(H2, 1)
const z3 = zip(H3, 2)
const z4 = zip(H4, 3, ROOF_X, ROOF_Y, TX4)

const clip: Clip = {
  format: 2,
  char: '捷',
  meta: { theme: '楊捷睿趕捷運', cast: '楊捷睿＋捷運', gags: ['楊捷睿每次跑到車門口要上車，捷運就咻地開走、風把他捲得一次比一次遠；回馬槍是他搶先跳上車頂，捷運咻地從他腳底下開走'] },
  duration: 15,
  bg: { top: '#CFE8FF', bottom: '#F2F8FF', floor: '#B9C0C8', scenery: 'city' },
  actors: [
    { id: 'train', emoji: 'prop:metro', x: TX, y: T, size: TS },
    // 姿勢圖朝左，翻過來面向右邊的捷運（問他時也面向右邊的字）
    { id: 'yang', emoji: 'hero:yang/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 楊捷睿登場，抬頭看字框，看到捷運：要坐！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 第 1 次：跑到車門口、手一伸——咻，傻眼，原地轉一圈退回去
    { at: 1.0, actor: 'yang', do: 'moveTo', to: { x: DOOR, y: P }, dur: 0.4 },
    { at: 1.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 1.35, actor: 'yang', do: 'tilt', amount: -12, dur: 0.3 },
    ...z1.moves,
    { at: H1 + HOLD, actor: 'yang', do: 'moveTo', to: { x: HOME, y: P }, arc: 6, dur: 0.35, ease: 'out' },
    { at: H1 + HOLD, actor: 'yang', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    ...back(2.45),
    // 第 2 次：再跑過去——咻，傻眼，整個人滾到畫面邊
    { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 2.95, actor: 'yang', do: 'moveTo', to: { x: DOOR, y: P }, dur: 0.4, ease: 'in' },
    { at: 3.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 3.3, actor: 'yang', do: 'tilt', amount: -12, dur: 0.3 },
    ...z2.moves,
    { at: H2 + HOLD, actor: 'yang', do: 'moveTo', to: { x: 14, y: P }, dur: 0.45, ease: 'out' },
    { at: H2 + HOLD, actor: 'yang', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: 4.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    ...back(4.45),
    // 第 3 次：走回車門口——先停一拍：看一眼捷運、捷運抖一下……咻！傻眼，被捲上天，過一會兒才掉回來
    { at: 4.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 4.95, actor: 'yang', do: 'moveTo', to: { x: DOOR, y: P }, dur: 0.5 },
    { at: 5.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/think' },
    { at: 5.5, actor: 'yang', do: 'tilt', amount: -8, dur: 0.4 },
    { at: H3 - 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 5.4, actor: 'train', do: 'shake', amount: 0.5, dur: 0.2 },
    ...z3.moves,
    { at: H3 + HOLD, actor: 'yang', do: 'moveTo', to: { x: 200, y: 30 }, dur: 0.4, ease: 'in' },
    { at: H3 + HOLD, actor: 'yang', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    // 在天上（畫面外）飄回左邊，掉下來
    { at: 6.95, actor: 'yang', do: 'moveTo', to: { x: 36, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'yang', do: 'moveTo', to: { x: 36, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，捷運又進站
    { at: 8.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...back(8.95, TX4),
    // 回馬槍（第 4 次）：這次他搶先跳上車頂，比 ✌️——捷運咻地從他腳底下開走，他懸在半空傻眼，才掉下來
    { at: 9.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 9.55, actor: 'yang', do: 'moveTo', to: { x: ROOF_X, y: ROOF_Y }, arc: 10, dur: 0.4, ease: 'out' },
    ...z4.moves,
    { at: H4 + 0.55, actor: 'yang', do: 'moveTo', to: { x: ROOF_X, y: P }, dur: 0.25, ease: 'in' },
    { at: H4 + 0.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    // 問他：他變大、走到左前方，轉向觀眾
    { at: 11.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 11.15, actor: 'yang', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    { at: 11.15, actor: 'yang', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：身體往字那邊傾、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.15, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.65, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.15, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來
    { at: 13.6, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.6, actor: 'yang', do: 'hop', amount: 6, dur: 0.2 },
    // 退場，畫面只留下字
    { at: 13.78, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.78, actor: 'yang', do: 'flip' },
    { at: 13.78, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 第 1 次：扌從他伸出去的手飛出來
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2], from: 'yang', color: partColor('扌') },
    // 第 2、3 次：捷運咻地開走，右邊從它剛剛停的地方飛起來
    { at: H2 + 0.05, dur: 0.55, strokes: [3, 4, 5, 6], from: { x: TX, y: 58 }, color: partColor('疌') },
    { at: H3 + 0.05, dur: 0.6, strokes: [7, 8, 9, 10], from: { x: TX, y: 58 }, color: partColor('疌') },
  ],
  glyph: [
    { at: 7.85, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到右上方，中間給捷運和車頂上的他
    { at: 8.65, dur: 0.45, do: 'park', to: { x: 118, y: 19.5 } },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: 11.1, dur: 2.88, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 11.15, dur: 0.4, do: 'home' },
    { at: 13.6, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.45, kind: 'pop', actor: 'yang', emoji: '❗', dx: -2, dur: 0.5, scale: 1.4 },
    ...z1.fx,
    { at: H1 + 0.25, kind: 'sweat', actor: 'yang' },
    ...z2.fx,
    { at: 4.15, kind: 'dizzy', actor: 'yang', dur: 0.5 },
    // 第 3 次前停一拍：他看一眼捷運
    { at: 5.45, kind: 'pop', actor: 'yang', emoji: '👀', dx: -10, dur: 0.5, scale: 1.3 },
    ...z3.fx,
    { at: 7.3, kind: 'dizzy', actor: 'yang', dur: 0.6 },
    { at: 9.4, kind: 'burst', actor: 'train', emoji: '✨', n: 6, dur: 0.5 },
    { at: 9.95, kind: 'pop', actor: 'yang', emoji: '✌️', dx: 13, dy: 9, dur: 0.35, scale: 1.2 },
    ...z4.fx,
    { at: H4 + 0.1, kind: 'pop', actor: 'yang', emoji: '❗', dx: 13, dy: 9, dur: 0.45, scale: 1.3 },
    { at: 13.6, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...z1.camera,
    ...z2.camera,
    ...z3.camera,
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    ...z4.camera,
    { at: H4 + 0.8, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  lights: [
    { at: 7.85, dur: 0.05, level: -0.35 },
    { at: 7.9, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '捷' },
    ...z1.cues,
    ...z2.cues,
    ...z3.cues,
    { at: 7.3, sfx: 'plop' },
    { at: 7.95, say: '捷' },
    { at: 9.4, say: '捷運' },
    { at: 9.55, sfx: 'boing' },
    ...z4.cues,
    { at: H4 + 0.8, sfx: 'plop' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: 13.6, say: '捷' },
    { at: 13.65, sfx: 'cheer' },
  ],
}

export default clip
