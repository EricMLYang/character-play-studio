import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 胖（v2）：忍者小老鼠肚子餓扁扁的。天上每掉下一塊起司，他就伸手接住、「啊嗚」一口吞下去——「咕嘟」，肚子咕嚕一抖，
// 「啵！」整個人往兩邊撐圓一圈（不是只有肚子，是整隻老鼠變寬），一次比一次圓：
// 圓一點點，他還得意地摸摸肚子（⺼）→ 圓到站不穩，左搖右晃、冒汗（半的上面）→
// 先停一拍：他托著下巴看看自己的肚子⋯⋯起司又掉下來了，還是吞了——「啵！」圓成一顆大皮球，「咚、咚」地彈出畫面（半的下面）。
// 語詞那一刻：他「咚、咚」彈回來，一屁股坐在中間，摸著圓滾滾的肚子，肚子抖兩下：「胖嘟嘟」。
// 回馬槍（第四次）：他學乖了，起司掉下來時伸手擋「不要了！」——起司打在手上彈起來，他得意地哈哈大笑，嘴一張開，起司剛好掉進嘴裡——
// 「咕嘟」，「啵！！」最大的一次，圓到快要塞滿畫面，「咚、咚、咚」彈出畫面。
// 最後畫面暗下來只剩「胖」，小老鼠（還是圓圓的）走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「胖！」，然後退場只留字。
// 刻意不跟「喝」（喝水肚子鼓、滾走、打嗝洩氣飛走）、「肉」（咬肉肚子脹）、「肚」（肚子當彈簧床）、「太」（太大爆掉）撞：
// 這支的主角是「整個人變寬變圓」——每一口都是同一個「啵」，結果是他自己的身材，彈走而不是滾走，從頭到尾不洩氣、不變瘦。
// 胖、胖、胖嘟嘟、這是什麼字？、胖

/** 小老鼠（hero:mouse；圖朝左，flip 朝右） */
const MS = 38
const MY = 77 - 0.42 * MS
/** 每次都站在同一個地方吃（畫面中間偏右；字框讓到左上，他變多寬都不會疊到字） */
const MX = 96
/** 一次比一次寬（累乘後的總寬度倍率）；高度只多一點點，所以是「變寬變圓」，不是變大 */
const WIDE = [1.45, 1.95, 2.5, 3.1]
const TALL = [1.0, 1.03, 1.06, 1.1]
/** 問他的時候（從畫面外走回來）還是圓圓的 */
const ASK_WIDE = 2.2
const ASK_TALL = 1.03
/** 起司：天上掉下來，接在他胸前 */
const CS = 16
const CATCH: Vec = { x: MX + 3, y: 50 }
const SKY: Vec = { x: 150, y: -14 }
/** 肚子（筆畫從這裡彈出來） */
const BELLY: Vec = { x: MX, y: MY + 6 }
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 36, y: 22 }
/** 傻眼停多久 */
const HOLD = 0.42

/** 從 (w0, h0) 撐到 (w1, h1)：stretchTo（寬 ×a、高 ÷a）＋ scaleTo（寬高 ×s） */
function grow(at: number, dur: number, w0: number, h0: number, w1: number, h1: number, ease: Move['ease'] = 'back'): Move[] {
  const rw = w1 / w0, rh = h1 / h0
  return [
    { at, actor: 'mouse', do: 'stretchTo', amount: Math.sqrt(rw / rh), dur, ease },
    { at, actor: 'mouse', do: 'scaleTo', amount: Math.sqrt(rw * rh), dur, ease },
  ]
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 起司從天上掉下來（at 是接到的那一刻）：先在畫面外擺好，再「咻」地落到 to */
function cheeseFall(at: number, to: Vec, dur = 0.42): Move[] {
  return [
    { at: at - dur - 0.03, actor: 'cheese', do: 'moveTo', to, dur: 0.01 },
    { at: at - dur, actor: 'cheese', do: 'enter', from: SKY, dur, ease: 'in' },
  ]
}

/**
 * 同一個笑點「啵！」：一口吞下起司（eat、咕嘟）→ 肚子咕嚕抖一下（預備）→ 「啵！」整個人往兩邊撐圓一圈，
 * 傻眼停住（surprised），兩側各爆一個 💥（一次比一次大、一次比一次遠）＋地上揚塵＋鏡頭推一下＋震＋同一個音效（一次多疊一個音）。
 * at 是「啵」那一刻，k 是第幾次（0～3）。
 */
function pop(at: number, k: number): Gag {
  const w0 = k ? WIDE[k - 1] : 1, h0 = k ? TALL[k - 1] : 1
  const half = 0.33 * MS * WIDE[k]
  const moves: Move[] = [
    { at: at - 0.32, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
    { at: at - 0.32, actor: 'mouse', do: 'squash', amount: 0.1, dur: 0.18 },
    // 肚子咕嚕一抖（預備）
    { at: at - 0.14, actor: 'mouse', do: 'shake', amount: 0.6 + 0.2 * k, dur: 0.14 },
    // 啵！
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    ...grow(at, 0.24, w0, h0, WIDE[k], TALL[k]),
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', x: MX - half - 3, y: MY + 2, n: 1, dur: 0.4, scale: 1.1 + 0.3 * k },
    { at, kind: 'burst', x: MX + half + 3, y: MY + 2, n: 1, dur: 0.4, scale: 1.1 + 0.3 * k },
    { at, kind: 'puff', actor: 'mouse', dy: 12 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: MX, y: MY - 4 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at: at - 0.22, sfx: 'gulp' }, { at, sfx: 'boing' }, { at: at + 0.03, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'plop' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'bonk' })
  if (k >= 3) cues.push({ at: at + 0.12, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 伸手接住天上掉下來的起司（at 是接到的那一刻），抱著起司（cheese） */
function catchCheese(at: number): Move[] {
  return [
    { at: at - 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/hug' },
    ...cheeseFall(at, CATCH),
    { at, actor: 'cheese', do: 'vanish', dur: 0.04 },
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cheese' },
  ]
}

/** 圓成一顆球，「咚、咚」地往右彈出畫面（n 下） */
function bounceOut(at: number, n: number, dur: number, amount: number): Move[] {
  return [
    { at, actor: 'mouse', do: 'moveTo', to: { x: 215, y: MY }, dur, ease: 'linear' },
    { at, actor: 'mouse', do: 'bounce', amount, times: n, dur },
  ]
}

// 第 1 次
const P1 = 1.95
const g1 = pop(P1, 0)
// 第 2 次
const P2 = P1 + 1.45
const g2 = pop(P2, 1)
// 第 3 次前停一拍：托著下巴看自己的肚子
const PONDER = P2 + 0.9
const P3 = PONDER + 1.2
const g3 = pop(P3, 2)
/** 圓成皮球，彈出畫面 */
const OUT3 = P3 + HOLD
/** 字框填滿、國字到正中央（他已經彈出畫面） */
const HOME = OUT3 + 0.6
const PARK = HOME + 0.92
/** 語詞那一刻：彈回來、一屁股坐下 */
const BACK = PARK + 0.02
const WORD = BACK + 0.5
// 回馬槍（第 4 次）
const STAND = WORD + 0.6
/** 起司打在伸出去擋的手上 */
const BLOCK = STAND + 0.45
/** 起司彈起來、掉進大笑的嘴巴 */
const GULP4 = BLOCK + 0.38
const P4 = GULP4 + 0.34
const g4 = pop(P4, 3)
const OUT4 = P4 + HOLD
/** 問他 */
const ASK = OUT4 + 0.6
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 120, y: MY + 3 }
/** 回馬槍：伸手擋的那隻手、大笑的嘴 */
const HAND: Vec = { x: MX + 0.36 * MS * WIDE[2], y: 52 }
const MOUTH: Vec = { x: MX + 4, y: 55 }

const builds: Build[] = [
  // 啵！從撐開的肚子彈出來：⺼
  { at: P1 + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: BELLY, color: partColor('⺼') },
  // 半的上面（丷＋第一橫）
  { at: P2 + 0.05, dur: 0.5, strokes: [4, 5, 6], from: BELLY, color: partColor('半') },
  // 半的下面（第二橫＋中間一豎）
  { at: P3 + 0.05, dur: 0.45, strokes: [7, 8], from: BELLY, color: partColor('半') },
]

const clip: Clip = {
  format: 2,
  char: '胖',
  meta: { theme: '吃起司變胖', cast: '小老鼠＋起司', gags: ['忍者小老鼠每接住一塊天上掉下來的起司、一口吞下去，就「啵！」地整個人往兩邊撐圓一圈，一次比一次圓（得意摸肚子→圓到左搖右晃→先停一拍，還是吞了，圓成皮球彈出畫面）；回馬槍是他學乖了伸手擋「不要了」，起司彈起來掉進他得意大笑的嘴裡，最大的一次「啵」，圓到快塞滿畫面彈走'] },
  duration: 15,
  bg: { top: '#BFE6FF', bottom: '#EAF7FF', floor: '#B9DB8A', scenery: 'hills' },
  actors: [
    { id: 'cheese', emoji: '🧀', x: CATCH.x, y: CATCH.y, size: CS, hidden: true, float: true },
    { id: 'mouse', emoji: 'hero:mouse/walk', x: MX, y: MY, size: MS, flip: true },
  ],
  moves: [
    // 開場：走進來，抬頭指著字框「胖」，再摸摸扁扁的肚子（好餓）
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -20, y: MY }, dur: 0.5 },
    // 字框在左上：轉過去朝左指著它
    { at: 0.5, actor: 'mouse', do: 'flip' },
    { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 0.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/hungry' },
    // 第 1 次：接住、吞下去、啵！圓一點點，得意地摸摸肚子
    ...catchCheese(P1 - 0.45),
    ...g1.moves,
    { at: P1 + HOLD + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    { at: P1 + HOLD + 0.1, actor: 'mouse', do: 'tilt', amount: -6, dur: 0.35 },
    // 第 2 次：圓到站不穩，左搖右晃
    ...catchCheese(P2 - 0.45),
    ...g2.moves,
    { at: P2 + HOLD, actor: 'mouse', do: 'tilt', amount: 13, dur: 0.24 },
    { at: P2 + HOLD + 0.24, actor: 'mouse', do: 'tilt', amount: -13, dur: 0.24 },
    // 第 3 次前停一拍：托著下巴看自己的肚子⋯⋯
    { at: PONDER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: PONDER + 0.1, actor: 'mouse', do: 'tilt', amount: 8, dur: 0.35 },
    // 起司又掉下來了，還是接
    ...catchCheese(P3 - 0.45),
    ...g3.moves,
    // 圓成一顆大皮球：咚、咚地彈出畫面
    ...bounceOut(OUT3, 2, 0.6, 9),
    // 語詞：咚、咚地彈回來，一屁股坐在中間摸肚子，肚子抖兩下
    { at: BACK, actor: 'mouse', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.45, ease: 'linear' },
    { at: BACK, actor: 'mouse', do: 'bounce', amount: 8, times: 2, dur: 0.45 },
    { at: WORD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/full' },
    { at: WORD, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: WORD + 0.25, actor: 'mouse', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: WORD + 0.4, actor: 'mouse', do: 'squash', amount: 0.15, dur: 0.15 },
    // 回馬槍：站起來、轉向右邊；起司又掉下來——他伸手擋「不要了！」
    { at: STAND, actor: 'mouse', do: 'flip' },
    { at: STAND, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/wait' },
    ...cheeseFall(BLOCK, HAND),
    // 起司打在手上彈起來，他得意地哈哈大笑——嘴一張，起司剛好掉進去
    { at: BLOCK, actor: 'cheese', do: 'moveTo', to: MOUTH, arc: 12, dur: GULP4 - BLOCK, ease: 'linear' },
    { at: BLOCK + 0.06, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    { at: GULP4, actor: 'cheese', do: 'vanish', dur: 0.04 },
    ...g4.moves,
    // 最大的一次，彈得最高、最多下
    ...bounceOut(OUT4, 3, 0.62, 7),
    // 問他：從右邊走回來（還是圓圓的）、轉向國字、變大
    { at: ASK + 0.02, actor: 'mouse', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.05, actor: 'mouse', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: ASK + 0.08, actor: 'mouse', do: 'flip' },
    { at: ASK + 0.1, actor: 'mouse', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    ...grow(ASK + 0.11, 0.01, 1, 1, ASK_WIDE, ASK_TALL, 'linear'),
    { at: ASK + 0.12, actor: 'mouse', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: ASK_SAY + 1.0, actor: 'mouse', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'mouse', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, actor: 'mouse', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: ANSWER + 0.27, actor: 'mouse', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'mouse', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.28, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（他在右邊變寬，不會疊到字）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT },
    // 問他：國字稍微偏左、縮一點，右前方讓給圓圓的小老鼠
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['mouse'], to: { x: 56, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: P2 + HOLD, kind: 'sweat', actor: 'mouse', dx: -10 },
    { at: PONDER + 0.1, kind: 'sweat', actor: 'mouse', dx: -12 },
    ...g3.fx,
    // 語詞：肚子圓滾滾、亮晶晶
    { at: WORD, kind: 'burst', x: MX, y: MY + 12, emoji: '✨', n: 7, dur: 0.5, scale: 2.4 },
    // 回馬槍：起司打在手上
    { at: BLOCK, kind: 'burst', x: HAND.x, y: HAND.y, n: 1, dur: 0.25, scale: 0.8 },
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 56, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把變寬的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.1, to: { x: MX, y: 55 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '胖' },
    { at: P1 - 0.45, sfx: 'tap' },
    ...g1.cues,
    { at: P2 - 0.45, sfx: 'tap' },
    ...g2.cues,
    { at: P3 - 0.45, sfx: 'tap' },
    ...g3.cues,
    { at: HOME + 0.2, say: '胖' },
    { at: BACK, sfx: 'boing' },
    { at: WORD, say: '胖嘟嘟' },
    { at: BLOCK, sfx: 'tap' },
    ...g4.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '胖' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
