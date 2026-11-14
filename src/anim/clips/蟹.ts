import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蟹（v2）：豬探長拿放大鏡湊近要查大螃蟹——每次他把臉湊過去，螃蟹就「喀喀」敲兩下大螯、橫著一滑衝過來，「喀」地夾住他的鼻子，
// 一次比一次甩得遠：甩回原地（解的左半 角 從螯上彈出來）、甩到畫面邊（解的右半 刀牛）、先停一拍（他抱胸斜眼、螃蟹慢慢敲一下）再湊過去，被甩上天（虫）。
// 回馬槍：他學聰明了，螃蟹一衝過來他就蹲下抱頭——大螯「喀」地夾空！他得意地站起來轉身……螃蟹橫著一滑，「喀」！夾住屁股，把他彈得最高。
// 最後畫面暗下來只剩「蟹」，豬探長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「蟹！」，然後退場只留字。
// 蟹、蟹、螃蟹、這是什麼字？、蟹
const P = 66.9 // 豬探長（size 24）站在地上的 y
/** 大螃蟹：畫面上最大的東西 */
const CRAB = 44
const K = 77 - 0.42 * CRAB
/** 大螃蟹平常待的地方（畫面中間偏右） */
const SX = 106
/** 第 3 次以後退到右邊：國字 home 到正中央時不擋字 */
const FAR = 127
/** 豬探長出發的地方、每次湊過去看的地方 */
const HOME = 34
const LOOK = 62
/** 螃蟹橫著一滑，停在這裡：左邊的大螯剛好夾到他的鼻子 */
const PINCH = LOOK + 31
/** 語詞那一刻螃蟹到畫面中間、變大（國字讓到左上） */
const MID = 100
const BIG = 1.12
/** 第四次：他站的地方（螃蟹在 MID） */
const LOOK4 = 60
/** 夾住以後傻眼停多久，才被甩走 */
const HOLD = 0.45
/** 夾的那一下螃蟹整隻往他那邊歪幾度（大螯在頭頂兩側，歪下來才碰得到他的臉） */
const LEAN = 26

/** 橫著走：一邊滑、一邊腳一顛一顛（螃蟹不會自動踩步伐） */
function scuttle(at: number, dur: number, x: number, scale = 1): Move[] {
  const n = Math.max(2, Math.round(dur / 0.11))
  return [
    { at, actor: 'crab', do: 'moveTo', to: { x, y: K + (scale - 1) * -0.42 * CRAB }, dur, ease: 'linear' },
    ...Array.from({ length: n }, (_, i): Move => ({ at: at + (i * dur) / n, actor: 'crab', do: 'hop', amount: 1.6, dur: dur / n })),
  ]
}

/**
 * 「喀」：螃蟹敲兩下大螯（預備，喀喀）→ 橫著一滑衝過去 → 大螯一揮（桃紅色弧線）「喀」地夾住 →
 * 那一刻 💥＋鏡頭推近＋震＋同一個音效，他傻眼、兩個一起抖 HOLD 秒（夾著不放）。k 是第幾次（越後面越大）。
 * hit 是夾到的地方（鼻子或屁股），to 是螃蟹滑到的地方。
 */
function pinch(at: number, k: number, opt: { to?: number; hit?: { x: number; y: number }; scale?: number; prep?: boolean } = {}) {
  const { to = PINCH, hit = { x: LOOK + 9, y: P - 9 }, scale = 1, prep = true } = opt
  const moves: Move[] = [
    // 預備：喀喀敲兩下大螯（抖兩下）；第 4 次剛剛夾空時已經敲過了
    ...(prep ? [at - 0.62, at - 0.45].map((t): Move => ({ at: t, actor: 'crab', do: 'shake', amount: 1 + 0.3 * k, dur: 0.12 })) : []),
    // 橫著一滑衝過去
    ...scuttle(at - 0.25, 0.25, to, scale),
    // 喀！整隻往他那邊一歪，左邊的大螯壓下來夾住；甩出去那一刻再歪回來
    { at: at - 0.08, actor: 'crab', do: 'rotateTo', amount: -LEAN, dur: 0.08, ease: 'in' },
    { at: at + HOLD, actor: 'crab', do: 'rotateTo', amount: LEAN, dur: 0.18, ease: 'back' },
    { at, actor: 'crab', do: 'shake', amount: 0.8 + 0.3 * k, dur: HOLD },
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at, actor: 'pig', do: 'shake', amount: 1 + 0.4 * k, dur: HOLD },
  ]
  const fx: Fx[] = [
    // 💥 在夾到的地方，一次比一次大
    { at, kind: 'burst', x: hit.x, y: hit.y, n: 1, dur: 0.35, scale: Math.min(1.6 + 0.45 * k, 2.5) },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: hit.x, y: hit.y } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效：滑過去（slide）＋喀（crack），一次比一次多疊一個
  const cues: Cue[] = [
    ...(prep ? [at - 0.62, at - 0.45].map((t): Cue => ({ at: t, sfx: 'tap' })) : []),
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
/** 回馬槍：他蹲下、大螯夾空（MISS），站起來得意地轉身，螃蟹再滑一小步夾住屁股（H4） */
const MISS = 9.55, H4 = 9.95
const p4 = pinch(H4, 3, { to: MID - 4, hit: { x: LOOK4 + 14, y: P - 2 }, scale: BIG, prep: false })
/** 夾住傻眼完，被甩走的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD, R4 = H4 + 0.3
const ASK = 10.6

const clip: Clip = {
  format: 2,
  char: '蟹',
  meta: { theme: '豬探長查大螃蟹', cast: '豬探長＋大螃蟹', gags: ['豬探長每次拿放大鏡湊近看大螃蟹，螃蟹就橫著一滑、大螯喀地夾住他的鼻子把他甩出去，一次比一次甩得遠；回馬槍是他蹲下躲過、大螯夾空，他得意地轉身，螃蟹再橫著一滑喀地夾住他的屁股，彈得最高'] },
  duration: 15,
  bg: { top: '#9ED8F0', bottom: '#E6F6FB', floor: '#F2DDB0', scenery: 'ocean' },
  actors: [
    // 姿勢圖朝左，翻過來面向右邊的螃蟹（問他時也面向右邊的字）
    { id: 'pig', emoji: 'hero:pig/walk', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 螃蟹畫在他前面：大螯夾住他的鼻子
    { id: 'crab', emoji: '🦀', x: 190, y: K, size: CRAB },
  ],
  moves: [
    // 螃蟹橫著走進來；豬探長大步走進來，指著上面的字框
    ...scuttle(0, 0.6, SX),
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 第 1 次：拿放大鏡湊過去——喀喀、唰、喀！夾鼻子，甩回原地
    ...look(0.85),
    ...p1.moves,
    { at: R1, actor: 'pig', do: 'moveTo', to: { x: HOME, y: P }, arc: 8, dur: 0.35, ease: 'out' },
    { at: R1, actor: 'pig', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    ...scuttle(R1 + 0.05, 0.3, SX),
    { at: R1 + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/angry' },
    // 第 2 次：再湊過去——喀！甩得更遠，滾到畫面邊
    ...look(2.6),
    ...p2.moves,
    { at: R2, actor: 'pig', do: 'moveTo', to: { x: 14, y: P }, arc: 16, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'pig', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    ...scuttle(R2 + 0.05, 0.3, SX),
    { at: R2 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 第 3 次：走回同一個地方——先停一拍：他抱胸斜眼看螃蟹、螃蟹慢慢敲一下大螯……他還是湊過去
    { at: 4.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: 4.7, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: P }, dur: 0.4 },
    { at: 5.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: 5.25, actor: 'crab', do: 'tilt', amount: 6, dur: 0.25 },
    { at: 5.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 5.45, actor: 'pig', do: 'tilt', amount: 10, dur: 0.35 },
    ...p3.moves,
    // 喀！夾著鼻子把他甩上天（往左上飛出畫面），過一會兒才掉回來
    { at: R3, actor: 'pig', do: 'moveTo', to: { x: -30, y: -50 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'pig', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 螃蟹橫著退到右邊（國字拼好到正中央時不擋字）
    ...scuttle(R3 + 0.05, 0.4, FAR),
    { at: 6.95, actor: 'pig', do: 'moveTo', to: { x: 28, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'pig', do: 'moveTo', to: { x: 28, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓到左上，螃蟹橫著走到中間、變大，左右滑來滑去
    { at: 8.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.0, actor: 'pig', do: 'moveTo', to: { x: 46, y: P }, dur: 0.35 },
    { at: 8.05, actor: 'crab', do: 'scaleTo', amount: BIG, dur: 0.35, ease: 'back' },
    ...scuttle(8.05, 0.35, MID + 10, BIG),
    ...scuttle(8.45, 0.25, MID - 6, BIG),
    ...scuttle(8.7, 0.25, MID + 6, BIG),
    ...scuttle(8.95, 0.2, MID, BIG),
    { at: 8.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 回馬槍（第 4 次）：他又拿放大鏡湊過去，螃蟹喀喀敲大螯——他學聰明了，蹲下抱頭！大螯「喀」地夾空
    ...look(9.0, LOOK4),
    ...[9.0, 9.15].map((at): Move => ({ at, actor: 'crab', do: 'shake', amount: 1.6, dur: 0.12 })),
    { at: 9.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    ...scuttle(9.33, 0.22, MID - 4, BIG),
    { at: MISS - 0.08, actor: 'crab', do: 'rotateTo', amount: -LEAN, dur: 0.08, ease: 'in' },
    { at: MISS + 0.1, actor: 'crab', do: 'rotateTo', amount: LEAN, dur: 0.15 },
    // 夾空了！他得意地站起來、轉身背對螃蟹……
    { at: 9.68, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: 9.68, actor: 'pig', do: 'flip' },
    ...scuttle(9.6, 0.1, MID + 8, BIG),
    // ……螃蟹再橫著一滑，喀！夾住屁股，把他彈得最高
    ...p4.moves,
    { at: R4, actor: 'pig', do: 'moveTo', to: { x: LOOK4 + 10, y: 22 }, dur: 0.25, ease: 'out' },
    { at: R4, actor: 'pig', do: 'spin', times: 1, dur: 0.45, pivot: 'center' },
    { at: R4 + 0.25, actor: 'pig', do: 'moveTo', to: { x: LOOK4 + 4, y: P }, dur: 0.2, ease: 'in' },
    { at: R4 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    // 螃蟹橫著走掉（問他的時候畫面上只剩他和字）
    ...scuttle(R4 + 0.2, 0.5, 200, BIG),
    // 問他：豬探長爬起來、走到左前方、變大，轉向觀眾
    { at: 10.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.95, actor: 'pig', do: 'flip' },
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
    { at: H3, kind: 'burst', x: LOOK + 9, y: P - 9, emoji: '⭐', n: 6, dur: 0.35 },
    { at: 7.3, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    // 大螯夾空
    { at: MISS, kind: 'pop', actor: 'crab', emoji: '❓', dx: 6, dur: 0.4, scale: 1.4 },
    ...p4.fx,
    { at: H4, kind: 'burst', x: LOOK4 + 14, y: P - 2, emoji: '⭐', n: 8, dur: 0.45 },
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
    { at: 5.25, sfx: 'tap' },
    ...p3.cues,
    { at: R3, sfx: 'whoosh' },
    { at: 7.3, sfx: 'plop' },
    { at: 7.4, say: '蟹' },
    { at: 8.4, say: '螃蟹' },
    { at: 9.0, sfx: 'tap' },
    { at: 9.15, sfx: 'tap' },
    { at: 9.33, sfx: 'slide' },
    { at: MISS, sfx: 'crack' },
    ...p4.cues,
    { at: R4, sfx: 'boing' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '蟹' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
