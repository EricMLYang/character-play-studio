import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蟹（v2）：豬探長拿放大鏡湊近要查大螃蟹——每次他把臉湊過去，螃蟹就「喀喀」把大螯伸出來空夾兩下、橫著一滑衝過來，伸長的左螯「喀」地夾住他的鼻子，
// 把他的臉拉過去一下，他傻眼，再被甩出去，一次比一次遠：甩回原地（解的左半 角 從螃蟹身上彈出來）、甩到畫面邊（解的右半 刀牛）、
// 先停一拍（他抱胸斜眼、螃蟹慢慢空夾一下）再湊過去，被甩上天（虫）。
// 回馬槍：他學聰明了，螃蟹一衝過來他就跳起來——大螯「喀」地從他腳底下夾空！他得意地轉身、走開兩步鞠躬……螃蟹橫著一滑，「喀」！夾住翹起來的屁股，把他彈得最高。
// 最後畫面暗下來只剩「蟹」，豬探長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「蟹！」，然後退場只留字。
// 蟹、蟹、螃蟹、這是什麼字？、蟹
const P = 66.9 // 豬探長（size 24）站在地上的 y
/** 大螃蟹（prop:crab 三張同一個比例）：畫面上最大的東西 */
const CRAB = 56
const K = 77 - 0.42 * CRAB
/** prop:crab-pinch 的左螯伸出去，身體在圖裡往右偏：swap 成它時 x 要往左移這麼多，身體才不動（assets/prop-sheets/README.md） */
const SHIFT = 0.074 * CRAB
/** 夾緊的左螯尖端在螃蟹（crab 的 x）左邊多遠；高度是 K + 0.14 × CRAB（約 61.3） */
const REACH = 0.52 * CRAB
/** 豬探長（放大後約 28.5）翻過來面向右邊時，傻眼（surprised）的鼻子在他 x 右邊多遠、y 約 62 */
const NOSE = 2.6
/** 鞠躬（bow，沒翻、面向左）時翹起來的屁股在他 x 右邊多遠、y 約 65 */
const BUTT = 8.5
/** 大螃蟹平常待的地方（畫面中間偏右） */
const SX = 106
/** 第 3 次以後退到右邊：國字 home 到正中央時不擋字 */
const FAR = 127
/** 豬探長出發的地方、每次湊過去看的地方 */
const HOME = 34
const LOOK = 62
/** 螃蟹橫著一滑，停在這裡：伸長的左螯尖端剛好在他的鼻子上 */
const PINCH = LOOK + NOSE + REACH
/** 語詞那一刻螃蟹到畫面中間（國字讓到左上） */
const MID = 100
/** 第四次：他湊過去看的地方、跳起來躲過以後走到這裡鞠躬 */
const LOOK4 = 60
const BOW = 48
/** 夾住以後傻眼停多久，才被甩走 */
const HOLD = 0.45
/** 夾住時把他的臉（屁股）往螃蟹那邊拉多遠 */
const PULL = 3

const crabPose = (at: number, pose: 'crab' | 'crab-pinch' | 'crab-walk', x: number): Move[] => [
  { at, actor: 'crab', do: 'swap', emoji: `prop:${pose}` },
  { at, actor: 'crab', do: 'moveTo', to: { x: pose === 'crab-pinch' ? x - SHIFT : x, y: K }, dur: 0.01 },
]
/** 空夾一下：伸出大螯夾一下再縮回來（螃蟹站在 x） */
const snap = (at: number, x: number, dur = 0.14): Move[] => [...crabPose(at, 'crab-pinch', x), ...crabPose(at + dur, 'crab', x)]

/** 橫著走：換成橫著走的樣子，一邊滑、一邊腳一顛一顛（劇本自己寫 hop，引擎就不再加步伐） */
function scuttle(at: number, dur: number, from: number, x: number, stop = true): Move[] {
  const n = Math.max(2, Math.round(dur / 0.11))
  return [
    ...crabPose(at, 'crab-walk', from),
    { at: at + 0.01, actor: 'crab', do: 'moveTo', to: { x, y: K }, dur: dur - 0.01, ease: 'linear' },
    ...Array.from({ length: n }, (_, i): Move => ({ at: at + (i * dur) / n, actor: 'crab', do: 'hop', amount: 1.6, dur: dur / n })),
    ...(stop ? crabPose(at + dur, 'crab', x) : []),
  ]
}

/**
 * 「喀」：螃蟹空夾兩下（預備，喀喀）→ 橫著一滑衝過去 → 換成伸長的左螯「喀」地夾住（螯尖剛好在 hit 上）→
 * 那一刻 💥＋鏡頭推近＋震＋同一個音效；夾著往後一拉（他的臉被拉過去），兩個一起抖 hold 秒，最後螯鬆開縮回來。k 是第幾次（越後面越大）。
 * from 是螃蟹出發的地方，to 是滑到的地方（crab 的 x），pig 是他那時候站的 x。
 */
function pinch(at: number, k: number, opt: { from?: number; to?: number; pig?: number; hit?: { x: number; y: number }; prep?: boolean; hold?: number; react?: boolean } = {}) {
  const { from = SX, to = PINCH, pig = LOOK, hit = { x: LOOK + NOSE, y: K + 0.14 * CRAB }, prep = true, hold = HOLD, react = true } = opt
  const moves: Move[] = [
    // 預備：喀喀空夾兩下；第 4 次剛剛夾空時已經夾過了
    ...(prep ? [at - 0.72, at - 0.47].flatMap((t) => snap(t, from)) : []),
    // 橫著一滑衝過去
    ...scuttle(at - 0.25, 0.25, from, to, false),
    // 喀！伸長的左螯夾住；夾著往後一拉，他被拉過去
    ...crabPose(at, 'crab-pinch', to),
    { at: at + 0.06, actor: 'crab', do: 'moveTo', to: { x: to - SHIFT + PULL, y: K }, dur: 0.18, ease: 'out' },
    { at: at + 0.06, actor: 'pig', do: 'moveTo', to: { x: pig + PULL, y: P }, dur: 0.18, ease: 'out' },
    { at: at + 0.24, actor: 'crab', do: 'shake', amount: 0.5 + 0.2 * k, dur: hold - 0.24 },
    // 傻眼（第 4 次夾屁股：那一刻還彎著腰，回頭嚇一跳另外寫）
    ...(react ? [{ at, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' } as Move] : []),
    { at: at + 0.24, actor: 'pig', do: 'shake', amount: 0.8 + 0.3 * k, dur: hold - 0.24 },
    // 甩出去那一刻鬆開，螯縮回來
    ...crabPose(at + hold, 'crab', to + PULL),
  ]
  const fx: Fx[] = [
    // 💥 在夾到的地方右上方（不蓋住螯尖和他的臉），一次比一次大
    { at, kind: 'burst', x: hit.x + 5, y: hit.y - 12, n: 1, dur: 0.3, scale: Math.min(1 + 0.3 * k, 1.9) },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: hit.x, y: hit.y } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效：滑過去（slide）＋喀（crack），一次比一次多疊一個
  const cues: Cue[] = [
    ...(prep ? [at - 0.72, at - 0.47].map((t): Cue => ({ at: t, sfx: 'tap' })) : []),
    { at: at - 0.25, sfx: 'slide' }, { at, sfx: 'crack' },
  ]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues }
}

/** 他走到同一個地方、拿出放大鏡湊過去看 */
const look = (at: number, x = LOOK): Move[] => [
  { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
  { at, actor: 'pig', do: 'moveTo', to: { x, y: P }, dur: 0.35 },
  { at: at + 0.4, actor: 'pig', do: 'tilt', amount: 10, dur: 0.35 },
]

const H1 = 1.65, H2 = 3.5, H3 = 6.0
const p1 = pinch(H1, 0)
const p2 = pinch(H2, 1)
const p3 = pinch(H3, 2)
/** 回馬槍：他跳起來、大螯從腳底下夾空（MISS），落地得意地轉身走開、鞠躬，螃蟹再滑一小步夾住翹起來的屁股（H4） */
const MISS = 9.45, H4 = 10.0
/** 夾空時螃蟹站的地方（螯尖在他原本鼻子的位置）、夾屁股時站的地方 */
const MISS_X = LOOK4 + NOSE + REACH
const BUTT_X = BOW + BUTT + REACH
const p4 = pinch(H4, 3, { from: MISS_X, to: BUTT_X, pig: BOW, hit: { x: BOW + BUTT, y: K + 0.14 * CRAB }, prep: false, hold: 0.3, react: false })
/** 夾住傻眼完，被甩走的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD, R4 = H4 + 0.3
const ASK = 10.6

const clip: Clip = {
  format: 2,
  char: '蟹',
  meta: { theme: '豬探長查大螃蟹', cast: '豬探長＋大螃蟹', gags: ['豬探長每次拿放大鏡湊近看大螃蟹，螃蟹就橫著一滑、伸長的大螯喀地夾住他的鼻子把他甩出去，一次比一次甩得遠；回馬槍是他跳起來躲過、大螯從腳底下夾空，他得意地轉身鞠躬，螃蟹再橫著一滑喀地夾住翹起來的屁股，彈得最高'] },
  duration: 15,
  bg: { top: '#9ED8F0', bottom: '#E6F6FB', floor: '#F2DDB0', scenery: 'ocean' },
  actors: [
    // 姿勢圖朝左，翻過來面向右邊的螃蟹（問他時也面向右邊的字）
    { id: 'pig', emoji: 'hero:pig/walk', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 螃蟹畫在他前面：大螯夾住他的鼻子
    { id: 'crab', emoji: 'prop:crab-walk', x: 190, y: K, size: CRAB },
  ],
  moves: [
    // 螃蟹橫著走進來；豬探長大步走進來，指著上面的字框
    ...scuttle(0, 0.6, 190, SX),
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 第 1 次：拿放大鏡湊過去——喀喀、唰、喀！夾鼻子，甩回原地
    ...look(0.85),
    ...p1.moves,
    { at: R1, actor: 'pig', do: 'moveTo', to: { x: HOME, y: P }, arc: 8, dur: 0.35, ease: 'out' },
    { at: R1, actor: 'pig', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    ...scuttle(R1 + 0.05, 0.3, PINCH + PULL, SX),
    { at: R1 + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/angry' },
    // 第 2 次：再湊過去——喀！甩得更遠，滾到畫面邊
    ...look(2.6),
    ...p2.moves,
    { at: R2, actor: 'pig', do: 'moveTo', to: { x: 14, y: P }, arc: 16, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'pig', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    ...scuttle(R2 + 0.05, 0.3, PINCH + PULL, SX),
    { at: R2 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 第 3 次：走回同一個地方——先停一拍：螃蟹慢慢空夾一下，他抱胸斜眼看螃蟹……他還是湊過去
    { at: 4.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: 4.7, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: P }, dur: 0.4 },
    ...snap(4.85, SX, 0.3),
    { at: 5.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: 5.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 5.45, actor: 'pig', do: 'tilt', amount: 10, dur: 0.35 },
    ...p3.moves,
    // 喀！夾著鼻子把他甩上天（往左上飛出畫面），過一會兒才掉回來
    { at: R3, actor: 'pig', do: 'moveTo', to: { x: -30, y: -50 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'pig', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 螃蟹橫著退到右邊（國字拼好到正中央時不擋字）
    ...scuttle(R3 + 0.05, 0.4, PINCH + PULL, FAR),
    { at: 6.95, actor: 'pig', do: 'moveTo', to: { x: 28, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'pig', do: 'moveTo', to: { x: 28, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓到左上，螃蟹橫著走到中間，左右滑來滑去
    { at: 8.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.0, actor: 'pig', do: 'moveTo', to: { x: 46, y: P }, dur: 0.35 },
    ...scuttle(8.05, 0.35, FAR, MID + 10, false),
    { at: 8.45, actor: 'crab', do: 'moveTo', to: { x: MID - 6, y: K }, dur: 0.25, ease: 'linear' },
    { at: 8.7, actor: 'crab', do: 'moveTo', to: { x: MID + 6, y: K }, dur: 0.25, ease: 'linear' },
    ...[8.45, 8.58, 8.7, 8.83].map((at): Move => ({ at, actor: 'crab', do: 'hop', amount: 1.6, dur: 0.12 })),
    ...scuttle(8.95, 0.2, MID + 6, MID),
    { at: 8.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 回馬槍（第 4 次）：他又拿放大鏡湊過去，螃蟹喀喀空夾兩下——他學聰明了，跳起來！大螯「喀」地從他腳底下夾空
    ...look(8.95, LOOK4),
    ...snap(9.0, MID, 0.1),
    ...snap(9.12, MID, 0.1),
    { at: 9.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: 9.2, actor: 'pig', do: 'hop', amount: 18, dur: 0.5 },
    ...scuttle(9.25, 0.2, MID, MISS_X, false),
    ...crabPose(MISS, 'crab-pinch', MISS_X),
    ...crabPose(MISS + 0.13, 'crab', MISS_X),
    // 夾空了！他落地，得意地轉身背對螃蟹、走開兩步鞠躬（屁股翹起來）……
    { at: 9.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: 9.7, actor: 'pig', do: 'flip' },
    { at: 9.7, actor: 'pig', do: 'moveTo', to: { x: BOW, y: P }, dur: 0.18 },
    { at: 9.87, actor: 'pig', do: 'swap', emoji: 'hero:pig/bow' },
    // ……螃蟹再橫著一滑，喀！夾住屁股，他回頭嚇一跳，把他彈得最高
    ...p4.moves,
    { at: H4 + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/flee' },
    { at: H4 + 0.12, actor: 'pig', do: 'flip' },
    // 往上彈（國字在左上，往右上一點彈，不擋字）
    { at: R4, actor: 'pig', do: 'moveTo', to: { x: 72, y: 26 }, dur: 0.25, ease: 'out' },
    { at: R4, actor: 'pig', do: 'spin', times: -1, dur: 0.45, pivot: 'center' },
    { at: R4 + 0.25, actor: 'pig', do: 'moveTo', to: { x: 60, y: P }, dur: 0.2, ease: 'in' },
    { at: R4 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    // 螃蟹橫著走掉（問他的時候畫面上只剩他和字）
    ...scuttle(R4 + 0.15, 0.5, BUTT_X + PULL, 200, false),
    // 問他：豬探長爬起來、走到左前方、變大，面向右邊的字
    { at: 10.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.95, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    { at: 10.95, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 11.95, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.5, actor: 'pig', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（衝刺），畫面只留下字
    { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: 13.72, actor: 'pig', do: 'flip' },
    { at: 13.74, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：大螯喀地一夾，從螯上彈出來——解（左半 角、右半 刀牛）
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'crab', color: partColor('解') },
    { at: H2 + 0.05, dur: 0.6, strokes: [7, 8, 9, 10, 11, 12], from: 'crab', color: partColor('解') },
    // 第 3 次：虫從螃蟹身上蹦出來
    { at: H3 + 0.05, dur: 0.6, strokes: [13, 14, 15, 16, 17, 18], from: 'crab', color: partColor('虫') },
  ],
  glyph: [
    { at: 7.2, dur: 0.45, do: 'home', ease: 'back' },
    // 國字讓到左上：中間留給橫著走的大螃蟹
    { at: 8.0, dur: 0.45, do: 'park', to: { x: 34, y: 21.5 } },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: ASK, dur: 3.4, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: ASK + 0.1, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...p1.fx,
    { at: R1 + 0.4, kind: 'sweat', actor: 'pig' },
    ...p2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'pig', dur: 0.45 },
    ...p3.fx,
    { at: H3, kind: 'burst', x: LOOK + NOSE, y: K + 0.14 * CRAB - 4, emoji: '⭐', n: 6, dur: 0.35 },
    { at: 7.3, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    // 大螯夾空
    { at: MISS + 0.05, kind: 'pop', actor: 'crab', emoji: '❓', dx: 8, dur: 0.4, scale: 1.4 },
    ...p4.fx,
    { at: H4, kind: 'burst', x: BOW + BUTT, y: K + 0.14 * CRAB - 4, emoji: '⭐', n: 8, dur: 0.45 },
    { at: 13.5, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 自動取景會推近到他、切掉右邊的大螃蟹：劇本自己「推近」一點點（幾乎是全景），自動取景就讓出來，整隻螃蟹都在；他被甩上天時鏡頭也不跟上去
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...p1.camera,
    ...p2.camera,
    ...p3.camera,
    { at: 6.8, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    // 語詞與回馬槍：一樣幾乎全景，整隻橫著走的螃蟹都在
    { at: 8.0, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...p4.camera,
    { at: ASK - 0.2, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次夾住白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.06 * Math.min(k, 2) }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.2, dur: 0.05, level: -0.35 },
    { at: 7.25, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'slide' },
    { at: 0.6, say: '蟹' },
    ...p1.cues,
    ...[R1, R2].map((at): Cue => ({ at, sfx: 'whoosh' })),
    ...p2.cues,
    { at: 4.85, sfx: 'tap' },
    ...p3.cues,
    { at: R3, sfx: 'whoosh' },
    { at: 7.3, sfx: 'plop' },
    { at: 7.4, say: '蟹' },
    { at: 8.4, say: '螃蟹' },
    { at: 9.0, sfx: 'tap' },
    { at: 9.12, sfx: 'tap' },
    { at: 9.2, sfx: 'boing' },
    { at: 9.25, sfx: 'slide' },
    { at: MISS, sfx: 'crack' },
    ...p4.cues,
    { at: R4, sfx: 'boing' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '蟹' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
