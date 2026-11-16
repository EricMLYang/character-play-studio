import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 乖（v2）：乖＝站得直挺挺、手放好、乖乖等。小恐龍面前每次「啵」地冒出一樣好吃的，要乖乖等、不能吃——
// 他眼睛發亮流口水、身體往前傾，一次比一次忍得辛苦，最後一秒「唰」地站直、手放好，頭上就「叮」冒出一顆乖寶寶星星，一次比一次大：
// 一顆糖（流口水、往前歪）→ 一個大蛋糕（手都伸出去、腳往前一步，趕快縮回來）→ 先停一拍：一整盤包子（咬牙全身發抖、口水滴成一灘）。
// 語詞那一刻：他頂著大星星走到中間，挺胸站好：「乖乖」。
// 回馬槍（第四次）：最大的誘惑——一隻超大的雞腿。這次他一點都不掙扎：站得直挺挺、乖到站著睡著了（💤），
// 最大最大的星星「叮」一聲把他叫醒——終於可以吃了，他「啊嗚」一口把雞腿整隻吞掉。
// 最後畫面暗下來只剩「乖」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「乖！」，然後退場只留字。
// 刻意不跟「甜」（忍住不吃、櫻桃自己彈進嘴裡）、「要」（丟掉手上的去拿更大的）、「紅」（紅燈定住不動）、「胖」（吞起司變胖）撞：
// 這支的抓手是「站直手放好＝頭上叮一顆星星」，誘惑越來越大、星星越來越大；第四次的反轉是他乖到睡著。
// 乖、乖、乖乖、這是什麼字？、乖

/** 小恐龍（hero:rex；圖朝左，不用 flip 就看著左邊的食物） */
const RS = 36
const RY = 77 - 0.42 * RS
/** 每次都站在同一個地方（右邊，字框在左上；右上有太陽） */
const RX = 98
/** 乖寶寶星星：長在他頭頂上。底子 size 寫最大的（第 4 次），其他用 scaleTo 縮（寫在 pop 之後）；以腳底縮放，所以星星永遠從頭頂長上去 */
const SB = 32
const STARS = [13, 18, 24, SB]
/** 星星的腳底（貼在頭頂上）；x 是相對他的位置（他朝左，頭在左邊一點） */
const STAR_FOOT = 45
const STAR_DX = -3
const starAt = (rx: number, lift = 0): Vec => ({ x: rx + STAR_DX, y: STAR_FOOT - lift - 0.42 * SB })
/** 好吃的東西：共用一個角色換圖，底子 size 寫最大的（雞腿），其他用 scaleTo 縮（寫在 pop 之後） */
const FB = 48
const FY = 77 - 0.42 * FB
const FX = 44
const FOODS = [
  { emoji: '🍬', size: 20 },
  { emoji: 'prop:cake', size: 30 },
  { emoji: 'prop:bao-plate', size: 38 },
  { emoji: 'prop:meat', size: FB },
]
/** 國字讓位的地方（左上，背後是素色的天空；右上有太陽，不能放） */
const PARK_AT: Vec = { x: 36, y: 22 }
const PARK_AMT = 0.5

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 他和頭上的星星一起移動 */
function walkTo(at: number, x: number, dur: number, ease: Move['ease'] = 'inOut', lift = 0): Move[] {
  return [
    { at, actor: 'rex', do: 'moveTo', to: { x, y: RY }, dur, ease },
    { at, actor: 'star', do: 'moveTo', to: starAt(x, lift), dur, ease },
  ]
}

/** 「啵」：好吃的東西冒出來（第一次 pop，之後原地「噗」一聲換成更大的）。at 是冒出來那一刻 */
function serve(at: number, k: number): { moves: Move[]; fx: Fx[]; cues: Cue[] } {
  const f = FOODS[k]
  const moves: Move[] = k === 0
    ? [
        { at, actor: 'food', do: 'pop', dur: 0.3 },
        { at: at + 0.001, actor: 'food', do: 'scaleTo', amount: f.size / FB, dur: 0.01 },
      ]
    : [
        { at, actor: 'food', do: 'swap', emoji: f.emoji },
        { at, actor: 'food', do: 'scaleTo', amount: f.size / FOODS[k - 1].size, dur: 0.3, ease: 'back' },
      ]
  moves.push({ at: at + 0.32, actor: 'food', do: 'bounce', amount: 2 + k, times: 1, dur: 0.3 })
  return {
    moves,
    fx: [
      ...(k > 0 ? [{ at, kind: 'puff', actor: 'food', dur: 0.4 } as Fx] : []),
      // 好香！閃一圈
      { at: at + 0.1, kind: 'burst', actor: 'food', emoji: '✨', n: 5 + k, dur: 0.5, dy: 4, scale: 1 + 0.15 * k },
    ],
    cues: [{ at, sfx: k === 0 ? 'plop' : 'poof' }],
  }
}

/**
 * 「叮」：站直、手放好，頭上的星星冒出來／變大一圈＋一圈 ✨＋星星閃一下＋鏡頭推近星星＋同一個音效（一次多疊一個音）。
 * at 是叮那一刻，rx 是他站的地方。
 */
function ding(at: number, k: number, rx: number): Gag {
  const prev = k === 0 ? 0 : STARS[k - 1]
  const moves: Move[] = prev === 0
    ? [
        { at, actor: 'star', do: 'pop', dur: 0.3 },
        { at: at + 0.001, actor: 'star', do: 'scaleTo', amount: STARS[0] / SB, dur: 0.01 },
      ]
    : [{ at, actor: 'star', do: 'scaleTo', amount: STARS[k] / prev, dur: 0.3, ease: 'back' }]
  moves.push({ at: at + 0.3, actor: 'star', do: 'flash', dur: 0.2 })
  const c: Vec = { x: rx + STAR_DX, y: STAR_FOOT - 0.5 * STARS[k] }
  const fx: Fx[] = [
    { at, kind: 'burst', x: c.x, y: c.y, emoji: '✨', n: 6 + 2 * k, dur: 0.55, scale: 1 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: c.x - 12, y: 48 } },
    { at, dur: 0.25, do: 'shake', amount: 0.5 + 0.3 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'blip' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'clink' })
  return { moves, fx, camera, cues }
}

/**
 * 同一個笑點（第 1～3 次）：好吃的冒出來 → 他眼睛發亮流口水、往前傾（一次比一次忍得辛苦）→
 * 最後一秒「唰」地站直、手放好 → 頭上「叮」一顆更大的星星。at 是叮那一刻，pause 是第三次前停的那一拍。
 */
function wait(at: number, k: number, pause = 0): Gag {
  const pop = at - 1.2 - pause
  const s = serve(pop, k)
  const d = ding(at, k, RX)
  const moves: Move[] = [
    ...s.moves,
    // 好想吃：眼睛發亮流口水
    { at: pop + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
  ]
  const fx: Fx[] = [...s.fx, ...d.fx]
  const tempt = at - 0.8
  if (k === 0) {
    // 往前歪過去……
    moves.push({ at: tempt, actor: 'rex', do: 'tilt', amount: -18, dur: 0.6 })
  } else if (k === 1) {
    // 手都伸出去了、腳往前一步……
    moves.push(
      { at: tempt, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
      ...walkTo(tempt, RX - 12, 0.35, 'out'),
      { at: tempt + 0.35, actor: 'rex', do: 'tilt', amount: -6, dur: 0.25 },
    )
  } else {
    // 咬牙、全身發抖，口水滴成一灘
    moves.push(
      { at: tempt, actor: 'rex', do: 'swap', emoji: 'hero:rex/hold' },
      ...walkTo(tempt, RX - 8, 0.25, 'out'),
      { at: tempt + 0.05, actor: 'rex', do: 'shake', amount: 2.4, dur: 0.6 },
      { at: tempt + 0.05, actor: 'star', do: 'shake', amount: 2.4, dur: 0.6 },
    )
    fx.push(
      { at: tempt + 0.1, kind: 'burst', x: RX - 18, y: 72, emoji: '💧', n: 5, dur: 0.6, scale: 1.3 },
      { at: tempt + 0.05, kind: 'sweat', actor: 'rex', dx: 8 },
    )
  }
  if (k >= 1) {
    // 不行！趕快退回原位
    moves.push(...walkTo(at - 0.2, RX, 0.16, 'out'))
  }
  moves.push(
    // 唰！站直、手放好
    { at: at - 0.12, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: at - 0.12, actor: 'rex', do: 'squash', amount: -0.14, dur: 0.2 },
    ...d.moves,
  )
  return { moves, fx, camera: d.camera, cues: [...s.cues, ...d.cues] }
}

// 第 1 次：一顆糖
const S1 = 2.0
const g1 = wait(S1, 0)
// 第 2 次：一個大蛋糕
const S2 = S1 + 1.75
const g2 = wait(S2, 1)
// 第 3 次前停一拍：一整盤包子冒出來，他看看包子、冒汗、吞口水……
const PAUSE = 0.4
const S3 = S2 + 1.75 + PAUSE
const g3 = wait(S3, 2, PAUSE)
const GULP = S3 - 1.2 + 0.35
/** 字框填滿、國字到正中央（他退到右邊、包子推到左邊，都讓開） */
const HOME = S3 + 0.75
const PARK = HOME + 0.85
/** 讓位的時候他退到右邊、食物推到左邊 */
const SIDE_REX = 138
const SIDE_FOOD = 22
/** 語詞那一刻：頂著大星星走到中間、挺胸站好 */
const WORD = PARK + 0.05
const WORD_X = 88
const WORD_SAY = WORD + 0.35
// 回馬槍（第 4 次）：超大雞腿。他一點都不掙扎，乖到站著睡著
const MEAT = WORD_SAY + 0.75
const s4 = serve(MEAT, 3)
const DOZE = MEAT + 0.45
/** 最大的星星「叮」 */
const S4 = DOZE + 0.7
const g4 = ding(S4, 3, WORD_X)
/** 被叮醒：嚇一跳 → 終於可以吃了，一口吞掉 */
const WAKE = S4 + 0.3
const CHOMP = WAKE + 0.4
/** 問他 */
const ASK = CHOMP + 0.5
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 122, y: RY + 2 }

const builds: Build[] = [
  // 叮！從頭上的星星飛出去：千（一撇＋十）→ 北的左半 → 北的右半
  { at: S1 + 0.12, dur: 0.5, strokes: [0], from: 'star', color: partColor('丿') },
  { at: S1 + 0.18, dur: 0.5, strokes: [1, 2], from: 'star', color: partColor('十') },
  { at: S2 + 0.12, dur: 0.5, strokes: [3, 4, 5], from: 'star', color: partColor('北') },
  { at: S3 + 0.12, dur: 0.5, strokes: [6, 7], from: 'star', color: partColor('北') },
]

const clip: Clip = {
  format: 2,
  char: '乖',
  meta: { theme: '乖乖等開動', cast: '小恐龍＋乖寶寶星星＋好吃的東西', gags: ['小恐龍面前每次冒出一樣好吃的，要乖乖等不能吃——他流口水、往前傾，一次比一次忍得辛苦（一顆糖歪過去→大蛋糕手伸出去、腳往前一步→先停一拍，一整盤包子咬牙全身發抖、口水滴成一灘），最後一秒唰地站直手放好，頭上就叮一顆乖寶寶星星，一次比一次大；回馬槍是超大雞腿，他一點都不掙扎、乖到站著睡著，最大的星星叮一聲把他叫醒，終於一口吞掉雞腿'] },
  duration: 15,
  bg: { top: '#CFE8F7', bottom: '#F6FAF2', floor: '#BFD99A', scenery: 'hills' },
  actors: [
    { id: 'food', emoji: FOODS[0].emoji, x: FX, y: FY, size: FB, hidden: true },
    { id: 'rex', emoji: 'hero:rex/walk', x: RX, y: RY, size: RS },
    { id: 'star', emoji: '⭐', ...starAt(RX), size: SB, hidden: true, float: true },
  ],
  moves: [
    // 開場：從右邊走進來，「唰」地站直、手放好，抬頭看左上的字框
    { at: 0, actor: 'rex', do: 'enter', from: { x: 190, y: RY }, dur: 0.5, ease: 'out' },
    { at: 0.52, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: 0.52, actor: 'rex', do: 'squash', amount: -0.14, dur: 0.22 },
    // 第 1 次：一顆糖
    ...g1.moves,
    // 第 2 次：大蛋糕
    ...g2.moves,
    // 第 3 次：一整盤包子。先停一拍：看著包子、冒汗、吞口水
    { at: GULP, actor: 'rex', do: 'squash', amount: 0.1, dur: 0.2 },
    ...g3.moves,
    // 字框填滿：他退到右邊、包子推到左邊，國字到正中央
    ...walkTo(HOME - 0.2, SIDE_REX, 0.3, 'out'),
    { at: HOME - 0.2, actor: 'food', do: 'moveTo', to: { x: SIDE_FOOD, y: FY }, dur: 0.3, ease: 'out' },
    // 語詞：頂著大星星走到中間、挺胸站好
    ...walkTo(WORD, WORD_X, 0.35, 'out'),
    { at: WORD, actor: 'food', do: 'moveTo', to: { x: FX, y: FY }, dur: 0.35, ease: 'out' },
    { at: WORD_SAY, actor: 'rex', do: 'squash', amount: -0.16, dur: 0.25 },
    { at: WORD_SAY, actor: 'star', do: 'bounce', amount: 2.5, times: 1, dur: 0.3 },
    // 回馬槍：超大雞腿！他一點都不掙扎……乖到站著睡著
    ...s4.moves,
    { at: DOZE, actor: 'rex', do: 'swap', emoji: 'hero:rex/doze' },
    { at: DOZE + 0.3, actor: 'rex', do: 'tilt', amount: 5, dur: 0.6 },
    // 最大的星星「叮」！
    ...g4.moves,
    // 被叮醒，嚇一跳
    { at: WAKE, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: WAKE, actor: 'rex', do: 'hop', amount: 4, dur: 0.25 },
    { at: WAKE, actor: 'star', do: 'hop', amount: 4, dur: 0.25 },
    // 可以吃了！啊嗚一口吞掉
    { at: CHOMP - 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/eat' },
    { at: CHOMP - 0.22, actor: 'food', do: 'moveTo', to: { x: WORD_X - 12, y: FY - 10 }, dur: 0.25, ease: 'in' },
    { at: CHOMP - 0.22, actor: 'food', do: 'scaleTo', amount: 0.5, dur: 0.25, ease: 'in' },
    { at: CHOMP + 0.03, actor: 'food', do: 'vanish', dur: 0.06 },
    { at: CHOMP + 0.03, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.25 },
    // 星星「啵」地收起來（問他的時候只剩他和國字）
    { at: ASK - 0.15, actor: 'star', do: 'vanish', dur: 0.15 },
    // 問他：走到左前方，轉向國字、變大
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK, actor: 'rex', do: 'moveTo', to: ASK_AT, dur: 0.35, ease: 'out' },
    { at: ASK + 0.05, actor: 'rex', do: 'scaleTo', amount: 1.18, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: ASK_SAY + 1.0, actor: 'rex', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'rex', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, actor: 'rex', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: ANSWER + 0.16, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'rex', do: 'moveTo', to: { x: 220, y: ASK_AT.y }, dur: 0.22, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到右上（他在右邊、食物在左下）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_AMT },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_AMT },
    // 問他：國字稍微偏左、縮一點，右前方讓給他
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['rex'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: GULP, kind: 'sweat', actor: 'rex', dx: 8 },
    ...g3.fx,
    ...s4.fx,
    { at: DOZE + 0.15, kind: 'zzz', actor: 'rex', emoji: '💤', dur: S4 - DOZE + 0.1, dx: 12, dy: 4, scale: 1.6 },
    ...g4.fx,
    { at: WAKE, kind: 'pop', actor: 'rex', emoji: '❗', dx: 12, dur: 0.4 },
    { at: CHOMP + 0.03, kind: 'burst', x: WORD_X - 10, y: 50, emoji: '😋', n: 1, dur: 0.4, scale: 1.4 },
    { at: ASK - 0.15, kind: 'burst', actor: 'star', emoji: '✨', n: 6, dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.32 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到頭上的星星和右邊的食物）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD_SAY, dur: 0.5, do: 'punch', amount: 0.05, to: { x: WORD_X - 8, y: 50 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '乖' },
    ...g1.cues,
    ...g2.cues,
    { at: GULP, sfx: 'gulp' },
    ...g3.cues,
    { at: HOME + 0.2, say: '乖' },
    { at: WORD_SAY, say: '乖乖' },
    ...s4.cues,
    ...g4.cues,
    { at: CHOMP, sfx: 'gulp' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '乖' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
