import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 甜（v2）：一本正經的狗狗警長來「檢查」一個大蛋糕——每次只舔一小口，就甜到「咕嚕」一聲跳起來、滿身愛心飄上去，一次比一次飄得高：
// 飄一下就落地（舌的上半從舌頭彈出來）、飄到半空轉一圈（舌的下半）、先停一拍再舔，甜到直接飛出畫面（甘從蛋糕噴出來）。
// 回馬槍：他學乖了，伸手比「不吃！」——蛋糕上的櫻桃自己一彈飛進他嘴裡，甜到連整個蛋糕都跟他一起飄走。
// 最後畫面暗下來只剩「甜」，警長掉回來、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「甜！」，然後退場只留字。
// 甜、甜、甜點、這是什麼字？、甜
const P = 66.9 // 警長（size 24）站在地上的 y
const C = 62.7 // 大蛋糕（size 34）
/** 大蛋糕平常在的地方（畫面中間） */
const CX = 88
/** 警長每次出發的地方 */
const HOME = 36
/** 前三次都走到同一個地方：蛋糕的左邊，彎腰就舔得到 */
const REACH = 64
/** 舔到以後傻眼停多久，才飄起來 */
const HOLD = 0.45
/** 每一次飄多高（腳離地多少）；第三次飄出畫面，另外寫 */
const RISE = [9, 24]
/** 甜到臉紅：粉粉的 */
const PINK = 'sepia(.45) saturate(2.4) hue-rotate(-38deg) brightness(1.04)'
/** 語詞那一刻：蛋糕到正中間變大、警長也變大 */
const MID = 86
const CAKE_BIG = 1.3
const BIG = 1.25
/** 第四次他站的地方（蛋糕左邊） */
const STAND = 54

/**
 * 「咕嚕—咻」：蛋糕閃一下、彈一下（預備：好香）→ 警長眼睛發亮流口水、彎腰舔一口 → 舔到那一刻傻眼＋臉紅＋💕 一圈＋白光＋鏡頭推近＋震＋同一個音效，
 * 傻眼停 HOLD 秒（看得見臉），才滿身愛心飄起來。k 是第幾次（越後面越大），x 是他站的地方。
 * 第 4 次（lick: false）他沒有舔：伸手比「不吃」，櫻桃自己飛進他嘴裡。
 */
function sweet(at: number, k: number, x: number, lick = true) {
  const moves: Move[] = [
    // 預備：蛋糕彈一下（好香～）
    { at: at - 0.6, actor: 'cake', do: 'bounce', amount: 1.6 + 0.3 * k, times: 1, dur: 0.3 },
    // 舔到！傻眼、臉紅
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'tint', filter: PINK },
    { at, actor: 'sheriff', do: 'squash', amount: 0.18, dur: 0.22 },
    { at, actor: 'cake', do: 'squash', amount: 0.1, dur: 0.2 },
    // 甜到飄起來
    { at: at + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
  ]
  if (lick) moves.push(
    // 好想吃（眼睛發亮、流口水）、彎腰舔一小口
    { at: at - 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    { at: at - 0.4, actor: 'sheriff', do: 'tilt', amount: 10, dur: 0.4 },
    { at: at - 0.18, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/eat' },
    { at: at - 0.18, actor: 'sheriff', do: 'squash', amount: -0.12, dur: 0.18 },
  )
  const fx: Fx[] = [
    // 好香：蛋糕閃一下
    { at: at - 0.6, kind: 'burst', actor: 'cake', emoji: '✨', n: 5, dur: 0.45, dy: 4 },
    // 甜到爆：💕 一圈，一次比一次大
    { at, kind: 'burst', actor: 'sheriff', emoji: '💕', n: 8, dur: 0.5, scale: 1.3 + 0.3 * k, dy: -6 },
    // 飄起來的時候頭上一直冒愛心
    { at: at + HOLD, kind: 'zzz', actor: 'sheriff', emoji: '💗', dur: k >= 2 ? 0.3 : 0.9 + 0.1 * k, scale: 1.5 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x, y: k >= 3 ? 40 : P - 12 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'gulp' }, { at: at + HOLD, sfx: 'bubble' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'blip' })
  return { moves, fx, camera, cues }
}

const H1 = 1.75, H2 = 3.6, H3 = 6.05, H4 = 9.85
const s1 = sweet(H1, 0, REACH)
const s2 = sweet(H2, 1, REACH)
const s3 = sweet(H3, 2, REACH)
const s4 = sweet(H4, 3, STAND, false)
/** 飄起來的時刻 */
const F1 = H1 + HOLD, F2 = H2 + HOLD, F3 = H3 + HOLD, F4 = H4 + HOLD

const clip: Clip = {
  format: 2,
  char: '甜',
  meta: { theme: '警長檢查大蛋糕', cast: '狗狗警長＋大蛋糕', gags: ['一本正經的警長每次只舔一小口蛋糕「檢查」，就甜到臉紅、滿身愛心飄起來，一次比一次飄得高；回馬槍是他伸手比不吃，櫻桃自己飛進他嘴裡，甜到連整個蛋糕一起飄走'] },
  duration: 15,
  bg: { top: '#FFD9E8', bottom: '#FFF4F8', floor: '#F3C6D6', scenery: 'room' },
  actors: [
    { id: 'cake', emoji: '🎂', x: CX, y: C, size: 34 },
    // 姿勢圖朝左，翻過來面向右邊的蛋糕（問他時也面向右邊的字）
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 蛋糕頂上的櫻桃（第四次自己飛進他嘴裡）
    { id: 'cherry', emoji: '🍒', x: MID, y: 36, size: 10, hidden: true, float: true },
  ],
  moves: [
    // 警長吹著哨子登場：指著上面的字框，敬禮——我來檢查！
    { at: 0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 0.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    { at: 1.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 1.1, actor: 'sheriff', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.3 },
    // 第 1 次：舔一小口——咕嚕！傻眼，飄起來一點點，再落地
    ...s1.moves,
    { at: F1, actor: 'sheriff', do: 'moveTo', to: { x: REACH - 8, y: P - RISE[0] }, dur: 0.45, ease: 'out' },
    { at: F1 + 0.55, actor: 'sheriff', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.35, ease: 'in' },
    { at: F1 + 0.9, actor: 'sheriff', do: 'tint', filter: '' },
    { at: F1 + 0.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    // 第 2 次：再走過去，正經地再舔一口——咕嚕！飄到半空轉一圈
    { at: 3.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 3.05, actor: 'sheriff', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.3 },
    ...s2.moves,
    { at: F2, actor: 'sheriff', do: 'moveTo', to: { x: REACH - 18, y: P - RISE[1] }, dur: 0.6, ease: 'out' },
    { at: F2 + 0.1, actor: 'sheriff', do: 'spin', times: -1, dur: 0.6, pivot: 'center' },
    { at: F2 + 0.75, actor: 'sheriff', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.35, ease: 'in' },
    { at: F2 + 1.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    // 第 3 次：退紅，走回同一個地方——先停一拍：托下巴看蛋糕、蛋糕閃一閃……舔！
    { at: 5.1, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 5.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 5.1, actor: 'sheriff', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.3 },
    { at: 5.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: 5.4, actor: 'sheriff', do: 'tilt', amount: -6, dur: 0.3 },
    ...s3.moves,
    // 甜到直接飛出畫面（往左上），過一會兒才掉回來
    { at: F3, actor: 'sheriff', do: 'moveTo', to: { x: 22, y: -45 }, dur: 0.45, ease: 'in' },
    { at: F3, actor: 'sheriff', do: 'spin', times: -2, dur: 0.45, pivot: 'center' },
    { at: 7.05, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 7.05, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: -45 }, dur: 0.01 },
    { at: 7.1, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    // 他摔下來「碰」一聲，蛋糕嚇得跳到右邊（讓出中間給國字）
    { at: 7.4, actor: 'cake', do: 'moveTo', to: { x: 132, y: C }, arc: 6, dur: 0.3, ease: 'out' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓到右上方，蛋糕到正中間、變大，警長也走過來
    { at: 8.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 8.3, actor: 'sheriff', do: 'moveTo', to: { x: STAND, y: P }, dur: 0.35 },
    { at: 8.3, actor: 'sheriff', do: 'scaleTo', amount: BIG, dur: 0.35, ease: 'back' },
    { at: 8.35, actor: 'cake', do: 'moveTo', to: { x: MID, y: C }, arc: 6, dur: 0.35 },
    { at: 8.35, actor: 'cake', do: 'scaleTo', amount: CAKE_BIG, dur: 0.35, ease: 'back' },
    { at: 8.7, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    // 回馬槍（第 4 次）：他學乖了，伸手比「不吃！」，得意地閉眼……
    { at: 9.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wait' },
    { at: 9.05, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.2 },
    { at: 9.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    // ……蛋糕一彈，櫻桃自己飛進他嘴裡
    { at: H4 - 0.38, actor: 'cherry', do: 'pop', dur: 0.08 },
    { at: H4 - 0.32, actor: 'cherry', do: 'moveTo', to: { x: STAND + 4, y: P - 20 }, arc: 10, dur: 0.32, ease: 'in' },
    { at: H4, actor: 'cherry', do: 'vanish', dur: 0.05 },
    ...s4.moves,
    // 甜到連整個蛋糕都跟他一起飄走（往上飛出畫面）
    { at: F4, actor: 'sheriff', do: 'moveTo', to: { x: 40, y: -50 }, dur: 0.42, ease: 'in' },
    { at: F4, actor: 'sheriff', do: 'spin', times: -2, dur: 0.42, pivot: 'center' },
    { at: F4, actor: 'cake', do: 'moveTo', to: { x: MID + 6, y: -60 }, dur: 0.42, ease: 'in' },
    { at: F4, actor: 'cake', do: 'tilt', amount: 10, dur: 0.42 },
    // 問他：警長從天上掉回左前方、變大，轉向觀眾
    { at: 10.75, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 10.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 10.75, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: -45 }, dur: 0.01 },
    { at: 10.75, actor: 'sheriff', do: 'scaleTo', amount: 1.55 / BIG, dur: 0.01 },
    { at: 10.8, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.0, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 13.5, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（敬個禮，跑走），畫面只留下字
    { at: 13.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: 13.75, actor: 'sheriff', do: 'flip' },
    { at: 13.78, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：舔的那一口，舌從他的舌頭彈出來（上半、下半）
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2], from: 'sheriff', color: partColor('舌') },
    { at: H2 + 0.05, dur: 0.55, strokes: [3, 4, 5], from: 'sheriff', color: partColor('舌') },
    // 第 3 次：甜到爆，甘從蛋糕噴出來
    { at: H3 + 0.05, dur: 0.6, strokes: [6, 7, 8, 9, 10], from: 'cake', color: partColor('甘') },
  ],
  glyph: [
    { at: 7.45, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到右上方，中間給蛋糕和警長
    { at: 8.3, dur: 0.45, do: 'park', to: { x: 128, y: 20 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: 10.75, dur: 3.15, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.8, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    ...s2.fx,
    { at: F2 + 1.1, kind: 'dizzy', actor: 'sheriff', dur: 0.45 },
    // 第 3 次前停一拍：他盯著蛋糕、冒汗
    { at: 5.45, kind: 'sweat', actor: 'sheriff' },
    ...s3.fx,
    { at: H3, kind: 'burst', actor: 'cake', emoji: '🍬', n: 8, dur: 0.5, scale: 1.4 },
    { at: 7.4, kind: 'dizzy', actor: 'sheriff', dur: 0.6 },
    ...s4.fx,
    { at: H4 + 0.1, kind: 'burst', x: STAND + 2, y: 32, emoji: '💗', n: 12, dur: 0.6, scale: 1.8 },
    { at: 13.5, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 7.4, dur: 0.35, do: 'shake', amount: 1.5 },
    ...s4.camera,
  ],
  lights: [
    // 每次舔到白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.45, dur: 0.05, level: -0.35 },
    { at: 7.5, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'blip' },
    { at: 0.6, say: '甜' },
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    { at: F3, sfx: 'whoosh' },
    { at: 7.4, sfx: 'plop' },
    { at: 7.55, say: '甜' },
    { at: 8.75, say: '甜點' },
    { at: H4 - 0.3, sfx: 'boing' },
    ...s4.cues,
    { at: F4, sfx: 'whoosh' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '甜' },
    { at: 13.55, sfx: 'cheer' },
  ],
}

export default clip
