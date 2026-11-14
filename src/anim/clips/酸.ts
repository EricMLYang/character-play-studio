import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 酸（v2）：愛現的忍者小老鼠要表演「一口吃掉大檸檬」——每次他飛撲上去咬一大口，檸檬汁「噗」地噴他一臉，他酸到整個人縮成一團、變成青綠色發抖，
// 再「咻」地彈出去，一次比一次遠：彈回原地（酉從檸檬噴出來）、滾到畫面邊（夋的上半）、先停一拍再咬，彈上天（夋的下半）。
// 回馬槍：他不敢再咬檸檬了，改喝一杯看起來很好喝的酸梅湯，得意地喝一口——沒事！……然後慢半拍酸到最大的一次，連杯子、檸檬一起炸飛。
// 最後畫面暗下來只剩「酸」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「酸！」，然後退場只留字。
// 酸、酸、酸梅湯、這是什麼字？、酸
const P = 66.9 // 小老鼠（size 24）站在地上的 y
const L = 61.0 // 大檸檬（size 38）
const C = 62.7 // 酸梅湯（size 34）
/** 大檸檬平常待的地方（畫面中間偏右） */
const LX = 104
/** 小老鼠每次出發的地方 */
const HOME = 40
/** 每次都撲到同一個地方：檸檬的左邊，一口咬下去 */
const BITE = 84
/** 第 3 次檸檬被震到右邊；語詞那一刻酸梅湯放在檸檬原本的位置 */
const ASIDE = 132
const CUP = 102
/** 酸到縮成一團以後停多久，才彈走 */
const HOLD = 0.5
/** 酸到變色：青綠色 */
const SOUR = 'sepia(.55) saturate(1.8) hue-rotate(35deg) brightness(1.05)'

/**
 * 「啊嗚—噗」：檸檬抖一下（預備）→ 小老鼠飛撲、張大嘴咬下去 → 那一刻檸檬一縮、酸汁 💦 噴他一臉＋💥＋白光＋鏡頭推近＋震＋同一個音效，
 * 他酸到縮成一團（cold）、變青綠色、抖著停 HOLD 秒。k 是第幾次（越後面越大）。
 * 第 4 次（lunge: false）他沒有撲：站在原地喝酸梅湯，酸是慢半拍才來的（at 是酸到的那一刻）。
 */
function sour(at: number, k: number, opt: { lunge?: boolean; src?: string } = {}) {
  const { lunge = true, src = 'lemon' } = opt
  const moves: Move[] = [
    // 酸到：縮成一團、變色、發抖
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cold' },
    { at, actor: 'mouse', do: 'tint', filter: SOUR },
    { at, actor: 'mouse', do: 'squash', amount: 0.3 + 0.08 * k, dur: 0.3 },
    { at: at + 0.12, actor: 'mouse', do: 'shake', amount: 1.2 + 0.4 * k, dur: HOLD - 0.12 },
    { at, actor: src, do: 'squash', amount: 0.22, dur: 0.25 },
  ]
  if (lunge) moves.push(
    // 預備：檸檬抖一下
    { at: at - 0.6, actor: 'lemon', do: 'shake', amount: 1 + 0.3 * k, dur: 0.22 },
    // 飛撲上去，張大嘴
    { at: at - 0.42, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: at - 0.42, actor: 'mouse', do: 'moveTo', to: { x: BITE, y: P }, arc: 8, dur: 0.34, anticipate: 4, ease: 'in' },
    { at: at - 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
  )
  const fx: Fx[] = [
    // 酸汁噴他一臉，一次比一次多
    { at, kind: 'burst', x: BITE + 10, y: P - 14, emoji: '💦', n: 5 + 2 * k, dur: 0.4, scale: 1 + 0.2 * k },
    { at, kind: 'burst', x: BITE + 12, y: P - 20, n: 1, dur: 0.25, scale: 1.4 + 0.35 * k },
    // 😖 停在他左上方（縮成一團的那 HOLD 秒），一次比一次大
    { at: at + 0.08, kind: 'pop', x: BITE - 19, y: P - 9, emoji: '😖', dur: HOLD - 0.05, scale: 1.5 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: BITE + 6, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'crack' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'hic' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 酸完「咻」地彈出去：恢復原色（落地時） */
const unsour = (at: number): Move[] => [{ at, actor: 'mouse', do: 'tint', filter: '' }]

const H1 = 1.6, H2 = 3.45, H3 = 5.95, H4 = 9.6
const s1 = sour(H1, 0)
const s2 = sour(H2, 1)
const s3 = sour(H3, 2)
const s4 = sour(H4, 3, { lunge: false, src: 'cup' })
/** 縮完彈走的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD, R4 = H4 + HOLD
/** 第 4 次：喝一口、得意的時刻（酸還沒來） */
const SIP = 8.85

const clip: Clip = {
  format: 2,
  char: '酸',
  meta: { theme: '忍者小老鼠表演一口吃掉大檸檬', cast: '小老鼠＋大檸檬＋酸梅湯', gags: ['愛現的小老鼠每次飛撲咬大檸檬一口，就酸到縮成一團變青綠色、咻地彈出去，一次比一次遠；回馬槍是他改喝酸梅湯，得意地喝一口沒事，慢半拍才酸到最大的一次，連杯子檸檬一起炸飛'] },
  duration: 15,
  bg: { top: '#FFF0A8', bottom: '#FFFAE0', floor: '#E6CF8A', scenery: 'room' },
  actors: [
    { id: 'lemon', emoji: '🍋', x: LX, y: L, size: 38 },
    { id: 'cup', emoji: '🥤', x: CUP, y: C, size: 34, hidden: true },
    // 姿勢圖朝左，翻過來面向右邊的檸檬（問他時也面向右邊的字）
    { id: 'mouse', emoji: 'hero:mouse/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 小老鼠衝進來，擺忍者架式：看我一口吃掉它！
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'back' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: 0.6, actor: 'lemon', do: 'tilt', amount: 6, dur: 0.4 },
    // 第 1 次：咬！——噗，縮成一團，彈回原地
    ...s1.moves,
    { at: R1, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: P }, arc: 8, dur: 0.35, ease: 'out' },
    { at: R1, actor: 'mouse', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    ...unsour(R1 + 0.35),
    { at: R1 + 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: R1 + 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 第 2 次：再咬一大口——噗！彈得更遠，滾到畫面邊
    ...s2.moves,
    { at: R2, actor: 'mouse', do: 'moveTo', to: { x: 14, y: P }, arc: 18, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'mouse', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    ...unsour(R2 + 0.45),
    { at: R2 + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 第 3 次：走回同一個地方——先停一拍：托下巴看檸檬，檸檬晃一晃……架式、咬！
    { at: 4.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 4.85, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.35 },
    { at: 5.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: 5.2, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 5.25, actor: 'lemon', do: 'tilt', amount: 6, dur: 0.25 },
    { at: 5.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    ...s3.moves,
    // 噗！彈上天（往右上飛出畫面），過一會兒才掉回來
    { at: R3, actor: 'mouse', do: 'moveTo', to: { x: 150, y: -45 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'mouse', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    // 檸檬也被這一下震得滾到右邊
    { at: R3, actor: 'lemon', do: 'moveTo', to: { x: ASIDE, y: L }, dur: 0.45, ease: 'out' },
    { at: R3, actor: 'lemon', do: 'rotateTo', amount: 30, dur: 0.45 },
    ...unsour(6.95),
    { at: 6.95, actor: 'mouse', do: 'moveTo', to: { x: 30, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'mouse', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，他走回老地方，檸檬的位置換成一杯酸梅湯
    { at: 8.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 8.3, actor: 'mouse', do: 'moveTo', to: { x: BITE, y: P }, dur: 0.3 },
    { at: 8.45, actor: 'cup', do: 'pop', dur: 0.25 },
    { at: 8.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 8.65, actor: 'cup', do: 'tilt', amount: 6, dur: 0.2 },
    // 回馬槍（第 4 次）：喝一口——沒事！得意……慢半拍，酸到最大的一次
    { at: SIP, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
    { at: SIP, actor: 'cup', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: SIP + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    ...s4.moves,
    // 炸開：他彈上天，杯子、檸檬一起被炸出畫面
    { at: R4, actor: 'mouse', do: 'moveTo', to: { x: 40, y: -50 }, dur: 0.45 },
    { at: R4, actor: 'mouse', do: 'spin', times: 3, dur: 0.45, pivot: 'center' },
    { at: R4, actor: 'cup', do: 'moveTo', to: { x: 200, y: 10 }, dur: 0.5 },
    { at: R4, actor: 'cup', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: R4 + 0.05, actor: 'lemon', do: 'moveTo', to: { x: 215, y: 30 }, dur: 0.45 },
    { at: R4 + 0.05, actor: 'lemon', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    // 問他：小老鼠掉回左前方、變大，轉向觀眾
    ...unsour(10.6),
    { at: 10.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 10.6, actor: 'mouse', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: 10.6, actor: 'mouse', do: 'flip' },
    { at: 10.62, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
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
  ],
  builds: [
    // 第 1 次：酸汁從檸檬噴出來——酉（釀酸東西的罈子）
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'lemon', color: partColor('酉') },
    // 第 2、3 次：酸到縮成一團、彈出去時甩出來——夋
    { at: H2 + 0.05, dur: 0.6, strokes: [7, 8, 9, 10], from: 'mouse', color: partColor('夋') },
    { at: H3 + 0.05, dur: 0.6, strokes: [11, 12, 13], from: 'mouse', color: partColor('夋') },
  ],
  glyph: [
    { at: 7.45, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.3, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.5, dur: 3.45, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.6, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    { at: R1 + 0.4, kind: 'sweat', actor: 'mouse' },
    ...s2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'mouse', dur: 0.45 },
    ...s3.fx,
    { at: 7.3, kind: 'dizzy', actor: 'mouse', dur: 0.6 },
    // 酸梅湯端出來，閃一下
    { at: 8.45, kind: 'burst', actor: 'cup', emoji: '✨', n: 6, dy: 6, dur: 0.5 },
    ...s4.fx,
    { at: R4, kind: 'burst', x: BITE + 8, y: P - 10, emoji: '⭐', n: 8, dur: 0.45, scale: 1.3 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    ...s4.camera,
  ],
  lights: [
    // 每次酸到白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.45, dur: 0.05, level: -0.35 },
    { at: 7.5, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '酸' },
    ...[H1, H2, H3].map((at): Cue => ({ at: at - 0.42, sfx: 'whoosh' })),
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    ...[R1, R2, R3].map((at): Cue => ({ at, sfx: 'boing' })),
    { at: 7.3, sfx: 'plop' },
    { at: 7.55, say: '酸' },
    { at: 8.55, say: '酸梅湯' },
    { at: SIP, sfx: 'gulp' },
    ...s4.cues,
    { at: R4, sfx: 'boing' },
    { at: R4 + 0.02, sfx: 'poof' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '酸' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
