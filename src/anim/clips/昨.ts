import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 昨（v2）：浣熊花生種了一棵小芽，等不及它長大。他每次跑到大日曆前「唰」地撕掉一頁——過了一天，撕下來的那一頁就是「昨天」，飄走了——
// 一轉身，昨天還小小的芽「啵」地長大一截，一次比一次大、他一次比一次驚喜：小芽→小樹（他嚇一跳）→ 比他高的樹（跳起來）→
// 先停一拍：他捏著日曆角、看看樹、冒汗……「唰」！長成大樹，他嚇得一屁股跌坐、抬頭看。每撕一頁，那張紙飄走時掉出一組筆畫：日 → 乍的撇橫 → 乍的豎與兩橫。
// 語詞那一刻：風把剛撕掉的那一頁吹回來，飄在畫面中間，上面還畫著小小的芽——他指著它：「昨天」（昨天還這麼小！），再把它丟掉。
// 回馬槍（第四次）：他再「唰」地撕一頁，這次樹沒有長高，而是「啵」地結滿蘋果。他流著口水跑到樹下伸手——最大的一顆「咚」地掉在他頭上，把他砸扁。
// 最後樹縮回土裡、日曆收走，畫面暗下來只剩「昨」，他轉向國字問「這是什麼字？」，手放耳邊等他回答，再指著字說「昨！」，然後退場只留字。
// 刻意不跟「今」（太陽彈出來把人轟上天）、「老」（太陽月亮轉一圈）、「森」（澆水長樹把人頂飛）、「果」（伸手蘋果就長大壓人）、「菜」（種菜被偷吃）撞：
// 這支不澆水、沒有太陽月亮，讓樹長大的只有「撕一頁日曆＝過了一天」，樹從不碰他（只在第四次掉一顆蘋果）。
// 昨、昨、昨天、這是什麼字？、昨

/** 浣熊花生（hero:raccoon；圖朝左＝看著日曆，flip 以後看著右邊的樹） */
const RS = 34
const RY = 77 - 0.42 * RS
/** 他看樹時站的地方（每次都一樣） */
const RX = 64
/** 他撕日曆時站的地方（每次都一樣） */
const TEAR_X = 44
/** 第三次嚇得跌坐的地方（國字回中央放大時讓到左邊） */
const FALL_X = 34
/** 大日曆：每次都在同一個位置（左邊） */
const CAL: Vec = { x: 24, y: 77 - 0.42 * 34 }
const CAL_SIZE = 34
/** 撕下來的那一頁（📅 看起來就是一張日曆紙）：底子 size 寫最大的（語詞那一刻），撕的時候縮小 */
const PB = 30
const PAGE_TEAR = 0.7
/** 樹：共用一個角色換圖，底子 size 寫最大的（大樹），其他用 scaleTo 縮（寫在 pop 之後） */
const TB = 44
const TREE: Vec = { x: 132, y: 77 - 0.42 * TB }
/** 小芽 → 小樹 → 跟他一樣高的樹 → 大樹（size 44：國字回中央放大時樹的左緣在 x 113 外面） */
const SIZES = [14, 24, 34, 44]
/** 語詞那一刻紙上的小芽、回馬槍的蘋果（同一個角色換圖，底子 size 寫大的那個：蘋果） */
const AB = 18
const SPROUT_ON_PAGE = 12
/** 國字讓位的地方（上方偏左，背後是素色的天空；右邊留給大樹） */
const PARK_AT: Vec = { x: 70, y: 21 }
const PARK_AMT = 0.55
/** 語詞那一刻那一頁停的地方（畫面中間） */
const WORD_AT: Vec = { x: 90, y: 58 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點：走到日曆前伸手 →「唰」撕一頁（日曆抖一下）→ 那一頁轉著飄到左上角、飛出畫面（昨天走了）→
 * 他轉身回原位看樹 →「啵」！樹長大一截（彈一下＋葉子噴出來＋鏡頭推近＋震）→ 他傻眼，一次比一次大。
 * at 是「唰」那一刻，k 是第幾次；pause 是第三次前停的那一拍；turn 為 false 時他已經面向日曆（不用再轉）。
 * 回傳的 grow 是「啵」那一刻。
 */
function tear(at: number, k: number, pause = 0, turn = true): Gag & { grow: number } {
  const go = at - 0.42 - pause
  const grow = at + 0.6
  const moves: Move[] = [
    ...(turn ? [{ at: go, actor: 'raccoon', do: 'flip' } as Move] : []),
    { at: go, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: go, actor: 'raccoon', do: 'moveTo', to: { x: TEAR_X, y: RY }, dur: 0.22, ease: 'out' },
  ]
  if (pause) {
    // 先停一拍：捏著日曆角、托著下巴想一下（冒汗）
    moves.push(
      { at: go + 0.24, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
      { at: go + 0.26, actor: 'raccoon', do: 'tilt', amount: 6, dur: 0.3 },
      { at: at - 0.14, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    )
  }
  moves.push(
    // 唰！往後一扯
    { at: at - 0.12, actor: 'cal', do: 'squash', amount: -0.08, dur: 0.12 },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/pull' },
    { at, actor: 'raccoon', do: 'moveTo', to: { x: TEAR_X + 4, y: RY }, dur: 0.12, ease: 'out' },
    { at, actor: 'cal', do: 'shake', amount: 1.2, dur: 0.25 },
    // 撕下來的那一頁：從日曆上跳出來，轉著飄到左上角、飛出畫面
    { at: at - 0.01, actor: 'page', do: 'moveTo', to: { x: CAL.x + 2, y: CAL.y - 4 }, dur: 0.01 },
    { at, actor: 'page', do: 'pop', dur: 0.1 },
    { at: at + 0.001, actor: 'page', do: 'scaleTo', amount: PAGE_TEAR, dur: 0.01 },
    { at: at + 0.08, actor: 'page', do: 'moveTo', to: { x: -16, y: -6 }, arc: 6, dur: 1.1, ease: 'inOut' },
    { at: at + 0.08, actor: 'page', do: 'spin', times: -2, dur: 1.1 },
    { at: at + 1.2, actor: 'page', do: 'vanish', dur: 0.01 },
    // 轉身回原位看樹
    { at: at + 0.32, actor: 'raccoon', do: 'flip' },
    { at: at + 0.32, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: at + 0.32, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.2, ease: 'out' },
    // 地面先抖一下（預備）
    { at: grow - 0.22, actor: 'plant', do: 'shake', amount: 0.8, dur: 0.2 },
  )
  if (k <= 2) {
    // 啵！長大一截
    if (k === 0) moves.push({ at: grow, actor: 'plant', do: 'swap', emoji: 'prop:tree' })
    moves.push({ at: grow, actor: 'plant', do: 'scaleTo', amount: SIZES[k + 1] / SIZES[k], dur: 0.26, ease: 'back' })
    // 傻眼，一次比一次大：嚇一跳 → 跳起來 → 一屁股跌坐
    moves.push({ at: grow + 0.03, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' })
    if (k < 2) moves.push({ at: grow + 0.03, actor: 'raccoon', do: 'hop', amount: 2 + 3 * k, dur: 0.3 })
    else {
      moves.push(
        { at: grow + 0.03, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.3 },
        { at: grow + 0.3, actor: 'raccoon', do: 'moveTo', to: { x: FALL_X, y: RY }, arc: 5, dur: 0.28, ease: 'out' },
        { at: grow + 0.58, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/fall' },
      )
    }
  } else {
    // 第四次：沒有長高，而是「啵」地結滿蘋果
    moves.push(
      { at: grow, actor: 'plant', do: 'swap', emoji: 'prop:apple-tree' },
      { at: grow, actor: 'plant', do: 'squash', amount: -0.12, dur: 0.26 },
    )
  }
  const c = { x: TREE.x - 12, y: 77 - 0.6 * SIZES[Math.min(k + 1, 3)] }
  const fx: Fx[] = [
    { at, kind: 'burst', x: CAL.x + 4, y: CAL.y - 6, emoji: '💨', n: 3, dur: 0.35, scale: 1.2 },
    { at: grow, kind: 'burst', x: c.x, y: c.y, emoji: k <= 2 ? '🍃' : '✨', n: 6 + 2 * Math.min(k, 2), dur: 0.5, scale: 1 + 0.25 * Math.min(k, 2) },
    { at: grow, kind: 'puff', x: TREE.x, y: 73, dur: 0.4 },
  ]
  if (k >= 1 && k <= 2) fx.push({ at: grow + 0.15, kind: 'sweat', actor: 'raccoon', dx: -6 })
  const camera: Camera[] = [
    // 不推近（左邊的日曆、右邊的樹都貼著畫面邊，推近會切掉），重量靠震動、葉子與他的反應
    { at: grow, dur: 0.35, do: 'shake', amount: 0.8 + 0.5 * Math.min(k, 2) },
  ]
  // 同一個音效：唰（紙）＋啵（長大），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'slide' }, { at: grow, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: grow + 0.04, sfx: 'poof' })
  if (k >= 2) cues.push({ at: grow + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, grow }
}

// 第 1～3 次
const T1 = 1.75
const g1 = tear(T1, 0)
const T2 = T1 + 1.55
const g2 = tear(T2, 1)
const PAUSE = 0.4
const T3 = T2 + 1.55 + PAUSE
const g3 = tear(T3, 2, PAUSE)
/** 字框填滿、國字到正中央（他跌坐在左邊、樹在右邊，都讓開） */
const HOME = T3 + 1.1
const PARK = HOME + 0.9
/** 語詞那一刻：風把剛撕掉的那一頁吹回來，上面畫著小小的芽 */
const WORD = PARK + 0.05
const WORD_SAY = WORD + 0.45
/** 他把那一頁丟掉（往左上） */
const TOSS = WORD_SAY + 0.55
// 回馬槍（第 4 次）：他已經面向日曆
const T4 = TOSS + 0.5
const g4 = tear(T4, 3, 0, false)
/** 流著口水跑到樹下、跳起來伸手 */
const RUN = g4.grow + 0.25
const UNDER = 103
const APPLE_POP = RUN + 0.25
/** 咚！蘋果砸在他頭上 */
const BONK = APPLE_POP + 0.45
/** 樹縮回土裡、日曆收走（ask 之前退場） */
const CLEAR = BONK + 0.35
const ASK = CLEAR + 0.2
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
/** 問他時他站的地方（左前方，國字讓到右邊） */
const ASK_AT: Vec = { x: 34, y: RY + 3 }

const builds: Build[] = [
  // 撕下來的那一頁（昨天）飄走時，掉出一組筆畫：日 → 乍的撇橫 → 乍的豎與兩橫
  { at: T1 + 0.25, dur: 0.5, strokes: [0, 1, 2, 3], from: 'page', color: partColor('日') },
  { at: T2 + 0.25, dur: 0.45, strokes: [4, 5], from: 'page', color: partColor('乍') },
  { at: T3 + 0.25, dur: 0.5, strokes: [6, 7, 8], from: 'page', color: partColor('乍') },
]

const clip: Clip = {
  format: 2,
  char: '昨',
  meta: { theme: '撕日曆讓樹快長大', cast: '浣熊花生＋大日曆＋撕下來的那一頁＋樹＋蘋果', gags: ['浣熊花生等不及種的小芽長大，每次「唰」地撕掉一頁日曆（過了一天，撕下來的那一頁＝昨天，飄走），一轉身樹就「啵」地長大一截，他一次比一次驚喜（小樹→比他高→先停一拍，長成大樹嚇得跌坐）；回馬槍是再撕一頁，樹沒長高而是結滿蘋果，他流口水跑去樹下，最大的一顆「咚」地砸在他頭上'] },
  duration: 15,
  bg: { top: '#BFE3FA', bottom: '#F2FAFF', floor: '#B5D88A', scenery: 'hills' },
  actors: [
    { id: 'cal', emoji: '📆', x: CAL.x, y: CAL.y, size: CAL_SIZE },
    { id: 'plant', emoji: '🌱', x: TREE.x, y: TREE.y, size: TB, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: RX, y: RY, size: RS },
    { id: 'page', emoji: '📅', x: CAL.x, y: CAL.y, size: PB, hidden: true, float: true, pivot: 'center' },
    { id: 'apple', emoji: '🌱', x: WORD_AT.x, y: WORD_AT.y, size: AB, hidden: true, float: true },
  ],
  moves: [
    // 開場：小芽已經種在右邊；他從右邊走進來，抬頭指著字框「昨」，再轉身瞪著小小的芽、等不及地跺腳
    { at: 0.05, actor: 'plant', do: 'pop', dur: 0.2 },
    { at: 0.051, actor: 'plant', do: 'scaleTo', amount: SIZES[0] / TB, dur: 0.01 },
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: 185, y: RY }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 0.95, actor: 'raccoon', do: 'flip' },
    { at: 0.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/stomp' },
    { at: 1.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.15 },
    { at: 1.17, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.15 },
    // 第 1～3 次
    ...g1.moves,
    ...g2.moves,
    ...g3.moves,
    // 語詞：他爬起來；風把剛撕掉的那一頁吹回來，飄到畫面中間，上面畫著小小的芽（昨天還這麼小）
    { at: WORD + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: WORD + 0.25, actor: 'raccoon', do: 'moveTo', to: { x: 54, y: RY }, dur: 0.2, ease: 'out' },
    { at: WORD - 0.02, actor: 'page', do: 'moveTo', to: { x: -16, y: 52 }, dur: 0.01 },
    { at: WORD - 0.02, actor: 'apple', do: 'moveTo', to: { x: -16, y: 55 }, dur: 0.01 },
    { at: WORD, actor: 'page', do: 'pop', dur: 0.1 },
    { at: WORD, actor: 'apple', do: 'pop', dur: 0.1 },
    { at: WORD + 0.001, actor: 'apple', do: 'scaleTo', amount: SPROUT_ON_PAGE / AB, dur: 0.01 },
    { at: WORD + 0.02, actor: 'page', do: 'moveTo', to: WORD_AT, arc: -6, dur: 0.3, ease: 'out' },
    { at: WORD + 0.02, actor: 'apple', do: 'moveTo', to: { x: WORD_AT.x, y: WORD_AT.y + 3 }, arc: -6, dur: 0.3, ease: 'out' },
    { at: WORD_SAY, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: WORD_SAY, actor: 'raccoon', do: 'hop', amount: 2.5, dur: 0.25 },
    { at: WORD_SAY, actor: 'page', do: 'hop', amount: 2, dur: 0.3 },
    { at: WORD_SAY, actor: 'apple', do: 'hop', amount: 2, dur: 0.3 },
    // 丟掉：轉身往左邊一丟（他就面向日曆了）
    { at: TOSS, actor: 'raccoon', do: 'flip' },
    { at: TOSS, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/throw' },
    { at: TOSS + 0.05, actor: 'page', do: 'moveTo', to: { x: -18, y: 48 }, arc: 8, dur: 0.45, ease: 'in' },
    { at: TOSS + 0.05, actor: 'apple', do: 'moveTo', to: { x: -18, y: 51 }, arc: 8, dur: 0.45, ease: 'in' },
    { at: TOSS + 0.52, actor: 'page', do: 'vanish', dur: 0.01 },
    { at: TOSS + 0.52, actor: 'apple', do: 'vanish', dur: 0.01 },
    // 回馬槍（第 4 次）
    ...g4.moves,
    // 結滿蘋果！流口水
    { at: g4.grow + 0.03, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/drool' },
    { at: g4.grow + 0.03, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.25 },
    // 跑到樹下、跳起來伸手
    { at: RUN, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: RUN, actor: 'raccoon', do: 'moveTo', to: { x: UNDER, y: RY }, dur: 0.3, ease: 'out' },
    { at: RUN + 0.32, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/jump' },
    { at: RUN + 0.34, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    // 最大的一顆蘋果在他頭上的樹枝「啵」地冒出來、晃一晃……咚！
    { at: APPLE_POP - 0.02, actor: 'apple', do: 'swap', emoji: '🍎' },
    { at: APPLE_POP - 0.02, actor: 'apple', do: 'moveTo', to: { x: UNDER + 14, y: 42 }, dur: 0.01 },
    { at: APPLE_POP, actor: 'apple', do: 'pop', dur: 0.18 },
    { at: APPLE_POP + 0.2, actor: 'apple', do: 'shake', amount: 1, dur: 0.2 },
    { at: BONK - 0.12, actor: 'apple', do: 'moveTo', to: { x: UNDER + 2, y: 47 }, dur: 0.12, ease: 'in' },
    { at: BONK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    { at: BONK, actor: 'raccoon', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: BONK, actor: 'apple', do: 'moveTo', to: { x: UNDER - 22, y: 77 - 0.42 * AB }, arc: 10, dur: 0.4, ease: 'out' },
    { at: BONK, actor: 'apple', do: 'spin', times: -1, dur: 0.4 },
    // 樹縮回土裡、日曆收走、蘋果滾走（ask 之前全部退場）
    { at: CLEAR - 0.1, actor: 'plant', do: 'scaleTo', amount: 0.05, dur: 0.3, ease: 'in' },
    { at: CLEAR + 0.2, actor: 'plant', do: 'vanish', dur: 0.01 },
    { at: CLEAR - 0.1, actor: 'cal', do: 'moveTo', to: { x: -30, y: CAL.y }, dur: 0.3, ease: 'in' },
    { at: CLEAR - 0.1, actor: 'apple', do: 'moveTo', to: { x: 190, y: 77 - 0.42 * AB }, dur: 0.3, ease: 'in' },
    { at: CLEAR - 0.1, actor: 'apple', do: 'spin', times: 2, dur: 0.3 },
    { at: CLEAR + 0.2, actor: 'apple', do: 'vanish', dur: 0.01 },
    // 問他：爬起來，走到左前方、變大，面向國字
    { at: ASK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK, actor: 'raccoon', do: 'moveTo', to: ASK_AT, dur: 0.35, ease: 'out' },
    { at: ASK + 0.05, actor: 'raccoon', do: 'scaleTo', amount: 1.15, dur: 0.25 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: ASK_SAY + 1.0, actor: 'raccoon', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.15, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.16, actor: 'raccoon', do: 'moveTo', to: { x: -40, y: ASK_AT.y }, dur: 0.15, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到上方偏左（右邊給大樹）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_AMT },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_AMT },
    // 問他：國字稍微偏右、縮一點，左前方讓給他
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: T3 - PAUSE - 0.1, kind: 'sweat', actor: 'raccoon', dx: 6 },
    ...g3.fx,
    ...g4.fx,
    { at: BONK, kind: 'burst', x: UNDER, y: 50, n: 1, dur: 0.4, scale: 2.4 },
    { at: BONK + 0.05, kind: 'burst', x: UNDER, y: 52, emoji: '⭐', n: 8, dur: 0.45, scale: 1.3 },
    { at: CLEAR - 0.1, kind: 'puff', x: TREE.x, y: 73, dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到左邊的日曆和右邊的大樹）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    ...g4.camera,
    { at: BONK, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '昨' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.15, say: '昨' },
    { at: WORD + 0.05, sfx: 'whoosh' },
    { at: WORD_SAY, say: '昨天' },
    { at: TOSS + 0.05, sfx: 'whoosh' },
    ...g4.cues,
    { at: APPLE_POP, sfx: 'plop' },
    { at: BONK, sfx: 'bonk' },
    { at: BONK + 0.04, sfx: 'boing' },
    { at: CLEAR - 0.1, sfx: 'slide' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '昨' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
