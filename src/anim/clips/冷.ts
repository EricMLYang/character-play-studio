import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 冷（v2）：大熱天，浣熊花生熱到冒汗——每次跑去抱大冰塊，冰塊一抖，他就「喀」地被凍成一塊冰，一次比一次大塊：
// 剛好包住他（裂開，冰的兩點 冫 噴出來）、大一號連人帶冰滑到畫面邊（令的上半）、先停一拍再凍成超大一塊、裂開把他炸上天（令的下半）。
// 回馬槍：他學乖了，站得遠遠的不碰，只吹冷氣機吹過來的冷氣（冷氣）——冰塊一抖，冷風一吹，他還是被凍成最大的一塊，連冰塊一起碎掉。
// 最後畫面暗下來只剩「冷」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「冷！」，然後退場只留字。
// 冷、冷、冷氣、這是什麼字？、冷
const P = 66.9 // 花生（size 24）站在地上的 y
const I = 62.7 // 大冰塊（size 34）
const S = 64.4 // 冰殼（size 30）
/** 大冰塊在右邊 */
const IX = 130
/** 花生每次出發的地方 */
const HOME = 56
/** 前三次都跑到同一個地方：抱住冰塊的左邊 */
const REACH = 106
/** 第四次：站得遠遠的（畫面中間偏左），只吹冷氣 */
const FAR = 70
/** 凍住以後傻眼停多久，才裂開 */
const HOLD = 0.5
/** 冰殼每一次多大（倍率）：一次比一次大塊 */
const SHELL = [1, 1.3, 1.65, 2.1]
/** 凍成冰：藍藍的 */
const COLD = 'sepia(1) saturate(4) hue-rotate(165deg) brightness(1.02)'
/** 冰殼：半透明，看得見裡面傻眼的臉 */
const GLASS = 'opacity(.6)'

/**
 * 「喀」凍住：冰塊抖一下（預備）、花生張開手靠過去 → 凍住那一刻冰殼「喀」地長出來包住他＋❄️ 一圈＋白光＋鏡頭推近＋震＋同一個音效，
 * 他變藍、傻眼停 HOLD 秒（看得見臉、旁邊 🥶）。k 是第幾次（冰殼越後面越大），x 是他站的地方。
 * 第 4 次（hug: false）他沒有靠過去：冰塊一抖，吹一大口冷風過來。
 */
function freeze(at: number, k: number, x: number, hug = true) {
  const size = 30 * SHELL[k]
  const moves: Move[] = [
    { at: at - 0.4, actor: 'ice', do: 'shake', amount: 1 + 0.3 * k, dur: 0.25 },
    // 冰殼先搬到他身上（還看不到），凍住那一刻長出來
    { at: at - 0.05, actor: 'shell', do: 'moveTo', to: { x, y: S }, dur: 0.01 },
    { at, actor: 'shell', do: 'pop', dur: 0.12 },
    { at, actor: 'shell', do: 'scaleTo', amount: SHELL[k], dur: 0.18, ease: 'back' },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/cold' },
    { at, actor: 'raccoon', do: 'tint', filter: COLD },
    { at, actor: 'raccoon', do: 'squash', amount: 0.15, dur: 0.2 },
    { at, actor: 'ice', do: 'squash', amount: 0.12, dur: 0.2 },
  ]
  if (hug) moves.push(
    // 張開雙手撲過去抱（D 表的 hug）
    { at: at - 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: at - 0.3, actor: 'raccoon', do: 'squash', amount: -0.18, dur: 0.25 },
    { at: at - 0.3, actor: 'raccoon', do: 'tilt', amount: 10, dur: 0.3 },
  )
  const fx: Fx[] = [
    { at, kind: 'burst', x, y: 74 - size * 0.55, emoji: '❄️', n: 8, dur: 0.45, scale: 1.3 + 0.3 * k },
    // 🥶 停在冰殼旁邊（傻眼的那 HOLD 秒），一次比一次大
    { at: at + 0.08, kind: 'pop', x: k >= 3 ? x - size * 0.42 - 4 : x + size * 0.42 + 4, y: k >= 3 ? 46 : 74 - size * 0.8, emoji: '🥶', dur: HOLD, scale: 1.8 + 0.25 * k },
  ]
  if (!hug) fx.unshift({ at: at - 0.3, kind: 'blow', actor: 'ice', to: { x, y: P - 6 }, emoji: '❄️', n: 7, dur: 0.35, scale: 1.8 })
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: k >= 3 ? 0.12 : 0.1 + 0.06 * k, to: k >= 3 ? { x: 100, y: 36 } : { x, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'crack' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'clink' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 冰殼裂開：碎冰噴出來 */
function crack(at: number, k: number, x: number, y = 74 - 30 * SHELL[k] * 0.55) {
  const moves: Move[] = [{ at, actor: 'shell', do: 'vanish', dur: 0.15 }]
  const fx: Fx[] = [{ at, kind: 'burst', x, y, emoji: '🧊', n: 6 + 2 * k, dur: 0.45, scale: 1 + 0.25 * k }]
  const cues: Cue[] = [{ at, sfx: 'poof' }]
  return { moves, fx, cues }
}

const H1 = 1.45, H2 = 3.2, H3 = 5.9, H4 = 9.75
const f1 = freeze(H1, 0, REACH)
const f2 = freeze(H2, 1, REACH)
const f3 = freeze(H3, 2, REACH)
const f4 = freeze(H4, 3, FAR, false)
/** 第 2 次連人帶冰滑到左邊這裡才裂開 */
const EDGE = 26
const C1 = H1 + HOLD, C2 = H2 + HOLD + 0.45, C3 = H3 + HOLD, C4 = H4 + HOLD + 0.05
const k1 = crack(C1, 0, REACH)
const k2 = crack(C2, 1, EDGE)
const k3 = crack(C3, 2, REACH)
/** 語詞「冷氣」那一刻：冷氣機（自製道具圖）掛在他右上方，往他吹冷風 */
const AC = { x: 95, y: 30 }
/** 語詞那一刻他放大多少 */
const BIG = 1.45

const clip: Clip = {
  format: 2,
  char: '冷',
  meta: { theme: '大熱天抱冰塊', cast: '浣熊花生＋大冰塊', gags: ['花生熱到冒汗，每次抱大冰塊就喀地被凍成一塊冰，一次比一次大塊；回馬槍是他學乖了站得遠遠的只吹冷氣，冰塊一抖冷風吹過來，還是被凍成最大的一塊'] },
  duration: 15,
  bg: { top: '#FFD39A', bottom: '#FFF2DC', floor: '#EDC98A', scenery: 'desert' },
  actors: [
    { id: 'ice', emoji: 'prop:ice', x: IX, y: I, size: 34 },
    { id: 'ac', emoji: 'prop:aircon', x: AC.x, y: AC.y, size: 36, hidden: true, float: true },
    // 姿勢圖朝左，翻過來面向右邊的大冰塊（問他時也面向右邊的字）
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 包住花生的冰殼（畫在他前面、半透明）
    { id: 'shell', emoji: '🧊', x: REACH, y: S, size: 30, hidden: true, tint: GLASS },
  ],
  moves: [
    // 花生熱到冒汗登場：看到大冰塊，跑過去抱
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.7, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 0.7, actor: 'raccoon', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.4, ease: 'in' },
    // 第 1 次：抱上去——喀！凍住，傻眼；裂開，抖著跳回去
    ...f1.moves,
    ...k1.moves,
    { at: C1, actor: 'raccoon', do: 'shake', amount: 1.4, dur: 0.5 },
    { at: C1 + 0.1, actor: 'raccoon', do: 'moveTo', to: { x: HOME, y: P }, arc: 5, dur: 0.35, ease: 'out' },
    // 退冰，又熱起來了
    { at: 2.5, actor: 'raccoon', do: 'tint', filter: '' },
    { at: 2.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 第 2 次：再跑過去抱——喀！大一號，連人帶冰滑到畫面邊，才裂開
    { at: 2.45, actor: 'raccoon', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.4, ease: 'in' },
    ...f2.moves,
    { at: H2 + HOLD, actor: 'raccoon', do: 'moveTo', to: { x: EDGE, y: P }, arc: 0.5, dur: 0.45, ease: 'out' },
    { at: H2 + HOLD, actor: 'shell', do: 'moveTo', to: { x: EDGE, y: S }, arc: 0.5, dur: 0.45, ease: 'out' },
    ...k2.moves,
    { at: C2, actor: 'raccoon', do: 'shake', amount: 1.6, dur: 0.6 },
    { at: C2 + 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 第 3 次：退冰，走回同一個地方——先停一拍：張開手、看一眼冰塊、冰塊抖一下……抱！
    { at: 4.45, actor: 'raccoon', do: 'tint', filter: '' },
    { at: 4.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 4.5, actor: 'raccoon', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.6 },
    { at: 5.15, actor: 'raccoon', do: 'tilt', amount: -6, dur: 0.4 },
    { at: 5.2, actor: 'ice', do: 'shake', amount: 0.6, dur: 0.25 },
    ...f3.moves,
    // 裂開「碰」地把他炸上天
    ...k3.moves,
    { at: C3, actor: 'raccoon', do: 'moveTo', to: { x: 140, y: -45 }, dur: 0.35, ease: 'out' },
    { at: C3, actor: 'raccoon', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    // 國字拼好（home 到正中央）、讓到右上方；他從天上掉回中間，變大
    { at: 8.0, actor: 'raccoon', do: 'tint', filter: '' },
    { at: 8.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 8.0, actor: 'raccoon', do: 'moveTo', to: { x: FAR, y: -45 }, dur: 0.01 },
    { at: 8.0, actor: 'raccoon', do: 'scaleTo', amount: BIG, dur: 0.01 },
    { at: 8.05, actor: 'raccoon', do: 'moveTo', to: { x: FAR, y: P }, dur: 0.3, ease: 'in' },
    // 語詞那一刻：他不敢再碰了，站得遠遠的；冷氣機冒出來，吹冷氣過來，好涼～
    { at: 8.65, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 8.55, actor: 'ac', do: 'pop', dur: 0.2 },
    { at: 8.7, actor: 'ac', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: 9.3, actor: 'ac', do: 'vanish', dur: 0.15 },
    { at: 8.85, actor: 'raccoon', do: 'tilt', amount: -8, dur: 0.6 },
    // 回馬槍（第 4 次）：冰塊又抖了——這次不用抱，冷風一吹，喀！凍成最大的一塊
    ...f4.moves,
    // 碰！冰殼裂開，連大冰塊一起碎掉
    { at: C4, actor: 'shell', do: 'vanish', dur: 0.15 },
    { at: C4, actor: 'ice', do: 'vanish', dur: 0.15 },
    { at: C4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: C4, actor: 'raccoon', do: 'shake', amount: 1.8, dur: 0.5 },
    // 問他：他退冰、走到左前方、變大，轉向觀眾
    { at: 10.65, actor: 'raccoon', do: 'tint', filter: '' },
    { at: 10.65, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 10.65, actor: 'raccoon', do: 'scaleTo', amount: 1.5 / BIG, dur: 0.3, ease: 'back' },
    { at: 10.65, actor: 'raccoon', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.8, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.35, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.85, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.3, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.3, actor: 'raccoon', do: 'hop', amount: 6, dur: 0.25 },
    // 退場，畫面只留下字
    { at: 13.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.6, actor: 'raccoon', do: 'flip' },
    { at: 13.62, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：冰殼裂開，冰的兩點（冫）噴出來
    { at: C1 + 0.03, dur: 0.55, strokes: [0, 1], from: 'shell', color: partColor('冫') },
    // 第 2 次：令的上半
    { at: C2 + 0.03, dur: 0.55, strokes: [2, 3, 4], from: 'shell', color: partColor('令') },
    // 第 3 次：令的下半
    { at: C3 + 0.03, dur: 0.55, strokes: [5, 6], from: 'shell', color: partColor('令') },
  ],
  glyph: [
    { at: 6.95, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到右上方（大冰塊上面），中間給花生
    { at: 7.85, dur: 0.45, do: 'park', to: { x: IX, y: 18 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: 10.6, dur: 3.3, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.65, dur: 0.4, do: 'home' },
    { at: 13.3, dur: 0.35, do: 'pulse' },
    { at: 14.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 好熱
    { at: 0.15, kind: 'sweat', actor: 'raccoon' },
    { at: 0.4, kind: 'pop', actor: 'raccoon', emoji: '🥵', dx: -14, dur: 0.4, scale: 1.5 },
    ...f1.fx,
    ...k1.fx,
    { at: 2.3, kind: 'sweat', actor: 'raccoon' },
    ...f2.fx,
    ...k2.fx,
    { at: C2 + 0.1, kind: 'dizzy', actor: 'raccoon', dur: 0.4 },
    { at: 4.4, kind: 'sweat', actor: 'raccoon' },
    // 第 3 次前停一拍：他看一眼冰塊
    { at: 5.15, kind: 'pop', actor: 'raccoon', emoji: '👀', dx: -12, dur: 0.6, scale: 1.9 },
    ...f3.fx,
    ...k3.fx,
    { at: 8.4, kind: 'sweat', actor: 'raccoon' },
    // 冷氣：冷氣機吹一陣涼涼的風過來（從出風口吹向他）
    { at: 8.7, kind: 'blow', actor: 'ac', dx: -6, dy: 16, to: { x: FAR + 6, y: P - 8 }, emoji: '❄️', n: 5, dur: 0.6, scale: 1.4 },
    { at: 9.0, kind: 'pop', actor: 'raccoon', emoji: '😌', dx: -16, dur: 0.4, scale: 1.5 },
    ...f4.fx,
    { at: C4, kind: 'burst', x: 96, y: 45, emoji: '🧊', n: 12, dur: 0.55, scale: 1.8 },
    { at: C4, kind: 'burst', x: 96, y: 45, n: 1, dur: 0.4, scale: 3 },
    { at: 13.3, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...f1.camera,
    ...f2.camera,
    { at: C2 - 0.05, dur: 0.3, do: 'shake', amount: 1.2 },
    ...f3.camera,
    { at: C3, dur: 0.35, do: 'shake', amount: 2 },
    ...f4.camera,
    { at: C4, dur: 0.4, do: 'shake', amount: 2.4 },
  ],
  lights: [
    // 每次凍住白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 6.95, dur: 0.05, level: -0.35 },
    { at: 7.0, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, sfx: 'whoosh' },
    ...f1.cues,
    { at: H1 + 0.05, say: '冷' },
    ...k1.cues,
    { at: 2.45, sfx: 'whoosh' },
    ...f2.cues,
    { at: H2 + HOLD, sfx: 'slide' },
    ...k2.cues,
    ...f3.cues,
    ...k3.cues,
    { at: C3 + 0.05, sfx: 'whoosh' },
    { at: 7.05, say: '冷' },
    { at: 8.35, sfx: 'plop' },
    { at: 8.75, say: '冷氣' },
    ...f4.cues,
    { at: C4, sfx: 'poof' },
    { at: 10.75, say: FIXED_LINES.clipAsk },
    { at: 13.3, say: '冷' },
    { at: 13.35, sfx: 'cheer' },
  ],
}

export default clip
