import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蝦（v2）：忍者小老鼠要抓大蝦——每次他飛撲過去，大蝦尾巴「咻」地一彈、往後跳開，他撲空「碰」地趴扁在地上，一次比一次彈得高：
// 彈回原地（虫從蝦身上蹦出來）、彈到畫面邊（叚的左半）、先停一拍再撲，彈上天（叚的右半）。
// 回馬槍：他學聰明了，先繞到大蝦後面等牠跳過來——大蝦一彈往後跳，正好一屁股坐扁他。
// 最後畫面暗下來只剩「蝦」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「蝦！」，然後退場只留字。
// 蝦、蝦、蝦子、這是什麼字？、蝦
const P = 66.9 // 小老鼠（size 24）站在地上的 y
const S = 61.9 // 大蝦（size 36）
/** 大蝦平常待的地方（畫面中間偏右） */
const SX = 104
/** 大蝦尾巴一彈，往後跳到這裡 */
const BACK = 130
/** 小老鼠每次出發的地方 */
const HOME = 40
/** 前三次都撲到同一個地方：大蝦剛剛在的位置 */
const LAND = 100
/** 第四次：他躲在大蝦後面（大蝦每次跳到的地方） */
const HIDE = 110
/** 語詞那一刻大蝦到正中間、變大 */
const MID = 84
const BIG = 1.15
/** 撲空以後傻眼停多久，才彈走 */
const HOLD = 0.45
/** 蝦尾巴的顏色（跟 3D 的蝦同色） */
const TAIL = '#F2662E'

/**
 * 「咻—碰」：大蝦觸鬚一抖（預備）→ 小老鼠衝刺飛撲 → 大蝦尾巴一甩（橘色弧線＋咻），往後一個後空翻跳開 →
 * 小老鼠撲在空地上那一刻趴扁＋💥＋鏡頭推近＋震＋同一個音效，再撐起來傻眼停 HOLD 秒。
 * k 是第幾次（越後面越大）；第 4 次（dash: false）他沒有撲，是躲在 to 等，大蝦往後跳正好坐在他身上。
 */
function snap(at: number, k: number, opt: { from?: number; to?: number; land?: number; dash?: boolean; sy?: number; face?: number } = {}) {
  const { from = SX, to = BACK, land = LAND, dash = true, sy = S, face = 0.25 } = opt
  const moves: Move[] = [
    // 預備：大蝦抖一下
    { at: at - 0.55, actor: 'shrimp', do: 'shake', amount: 1 + 0.3 * k, dur: 0.22 },
    // 尾巴一彈：先縮一下，後空翻往後跳
    { at: at - 0.25, actor: 'shrimp', do: 'squash', amount: 0.3, dur: 0.1 },
    { at: at - 0.17, actor: 'shrimp', do: 'moveTo', to: { x: to, y: sy }, arc: 10, dur: 0.17 + (dash ? 0.2 : 0), ease: dash ? 'out' : 'in' },
    { at: at - 0.17, actor: 'shrimp', do: 'spin', times: 1, dur: 0.17 + (dash ? 0.2 : 0), pivot: 'center' },
    // 碰！趴扁
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
    { at, actor: 'mouse', do: 'squash', amount: 0.3 + 0.1 * k, dur: 0.3 },
    // 撐起來傻眼
    { at: at + face, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
  ]
  if (dash) moves.push(
    { at: at - 0.42, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: at - 0.42, actor: 'mouse', do: 'moveTo', to: { x: land, y: P }, arc: 10, dur: 0.42, anticipate: 4, ease: 'in' },
  )
  else moves.push({ at, actor: 'shrimp', do: 'squash', amount: 0.2, dur: 0.3 })
  const fx: Fx[] = [
    // 尾巴甩一道橘色的弧（從尾巴那一側往前甩）
    { at: at - 0.3, kind: 'swoosh', actor: 'shrimp', to: { x: from - 30, y: S }, dx: 12, dy: 12, n: 15, sweep: 120, windup: 0.1, dur: 0.3,
      scale: 1 + 0.12 * k, color: TAIL, width: 4.2 },
    // 💥 每次都在他趴下去的同一個位置，一次比一次大
    { at, kind: 'burst', x: k >= 3 ? land - 12 : land - 4, y: k >= 3 ? P - 14 : P - 16, n: 1, dur: 0.32, scale: 2 + 0.4 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: land, y: k >= 3 ? 36 : 58 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.22, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/** 大蝦跳回原位 */
const home = (at: number, x = SX): Move[] => [
  { at, actor: 'shrimp', do: 'moveTo', to: { x, y: S }, arc: 5, dur: 0.35 },
]

const H1 = 1.6, H2 = 3.45, H3 = 5.95, H4 = 9.95
const s1 = snap(H1, 0)
const s2 = snap(H2, 1)
const s3 = snap(H3, 2)
const s4 = snap(H4, 3, { from: MID, to: HIDE + 16, land: HIDE, dash: false, sy: S - 7, face: 0.45 })
/** 撲空傻眼完，彈走的時刻 */
const R1 = H1 + 0.25 + HOLD, R2 = H2 + 0.25 + HOLD, R3 = H3 + 0.25 + HOLD

const clip: Clip = {
  format: 2,
  char: '蝦',
  meta: { theme: '忍者小老鼠抓大蝦', cast: '小老鼠＋大蝦', gags: ['小老鼠每次飛撲抓大蝦，大蝦尾巴咻地一彈往後跳開，他撲空碰地趴扁、一次比一次彈得高；回馬槍是他先躲到大蝦後面等，大蝦一彈往後跳，正好一屁股坐扁他'] },
  duration: 15,
  bg: { top: '#BFE6F5', bottom: '#EAF7FB', floor: '#EBD9A8', scenery: 'ocean' },
  actors: [
    // 姿勢圖朝左，翻過來面向右邊的大蝦（問他時也面向右邊的字）
    { id: 'mouse', emoji: 'hero:mouse/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 大蝦朝左（看著小老鼠），畫在他前面：第四次坐在他身上
    { id: 'shrimp', emoji: '🦐', x: SX, y: S, size: 36 },
  ],
  moves: [
    // 小老鼠衝進來，擺忍者架式：看我抓到牠！
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'back' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: 0.7, actor: 'shrimp', do: 'tilt', amount: 8, dur: 0.4 },
    // 第 1 次：飛撲——咻，蝦跳開，碰！趴扁，傻眼，彈回原地
    ...s1.moves,
    { at: R1, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: P }, arc: 8, dur: 0.35, ease: 'out' },
    { at: R1, actor: 'mouse', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    ...home(R1 + 0.05),
    { at: R1 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 第 2 次：再撲——咻，碰！彈得更高，滾到畫面邊
    ...s2.moves,
    { at: R2, actor: 'mouse', do: 'moveTo', to: { x: 14, y: P }, arc: 18, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'mouse', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    ...home(R2 + 0.05),
    { at: R2 + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 第 3 次：走回同一個地方——先停一拍：托下巴看大蝦、大蝦觸鬚抖一抖……架式、撲！
    { at: 4.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 4.85, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.35 },
    { at: 5.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: 5.2, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 5.25, actor: 'shrimp', do: 'tilt', amount: 6, dur: 0.25 },
    { at: 5.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    ...s3.moves,
    // 碰！彈上天（往右上飛出畫面），過一會兒才掉回來
    { at: R3, actor: 'mouse', do: 'moveTo', to: { x: 150, y: -45 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'mouse', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    { at: 6.95, actor: 'mouse', do: 'moveTo', to: { x: 30, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'mouse', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，大蝦跳到正中間、變大
    { at: 8.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 8.3, actor: 'mouse', do: 'moveTo', to: { x: 50, y: P }, dur: 0.35 },
    ...home(8.35, MID),
    { at: 8.35, actor: 'shrimp', do: 'scaleTo', amount: BIG, dur: 0.35, ease: 'back' },
    { at: 8.75, actor: 'shrimp', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 8.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 回馬槍（第 4 次）：他學聰明了，踮腳繞到大蝦後面（大蝦每次跳到的地方），轉身得意地等……
    { at: 9.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 9.05, actor: 'mouse', do: 'moveTo', to: { x: HIDE, y: P }, dur: 0.45 },
    { at: 9.5, actor: 'mouse', do: 'flip' },
    { at: 9.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    // ……大蝦尾巴一彈往後跳，正好一屁股坐扁他
    ...s4.moves,
    // 大蝦從他身上一彈，跳出畫面；他扁扁地撐起來傻眼
    { at: H4 + 0.38, actor: 'shrimp', do: 'moveTo', to: { x: 200, y: S }, arc: 14, dur: 0.35, ease: 'in' },
    { at: H4 + 0.38, actor: 'shrimp', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
    // 問他：小老鼠走到左前方、變大，轉向觀眾
    { at: 10.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 10.85, actor: 'mouse', do: 'flip' },
    { at: 10.85, actor: 'mouse', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    { at: 10.85, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3 },
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
    // 第 1 次：虫從大蝦身上蹦出來
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'shrimp', color: partColor('虫') },
    // 第 2、3 次：尾巴一彈，叚甩出來
    { at: H2 + 0.05, dur: 0.6, strokes: [6, 7, 8, 9, 10], from: 'shrimp', color: partColor('叚') },
    { at: H3 + 0.05, dur: 0.6, strokes: [11, 12, 13, 14], from: 'shrimp', color: partColor('叚') },
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
    { at: H1 + 0.3, kind: 'sweat', actor: 'mouse' },
    ...s2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'mouse', dur: 0.45 },
    ...s3.fx,
    { at: H3, kind: 'burst', x: LAND - 4, y: P - 16, emoji: '⭐', n: 6, dur: 0.32 },
    { at: 7.3, kind: 'dizzy', actor: 'mouse', dur: 0.6 },
    ...s4.fx,
    { at: H4, kind: 'burst', x: HIDE - 12, y: P - 14, emoji: '⭐', n: 8, dur: 0.45 },
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
    { at: 7.45, dur: 0.05, level: -0.35 },
    { at: 7.5, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '蝦' },
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    { at: 7.3, sfx: 'plop' },
    { at: 7.55, say: '蝦' },
    { at: 8.75, say: '蝦子' },
    ...s4.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '蝦' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
