import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蟲（v2）：豬探長肚子好餓，每次張大嘴要咬下去——「啵！」一隻毛毛蟲從食物裡探出頭跟他打招呼，他嚇一跳，一次比一次誇張：
// 蘋果（愣住，一個「虫」從毛毛蟲身上飛上去，字框最上面）→ 蛋糕（往後跳開，左下的虫）→ 先停一拍：他拿放大鏡把大西瓜仔細看一遍，確定沒有蟲才張嘴——
// 大西瓜（嚇得往後跳、一屁股跌坐，右下的虫）。字拼好後毛毛蟲從西瓜裡跳到畫面正中間，豬探長指著牠（毛毛蟲）；
// 回馬槍：毛毛蟲鑽回西瓜、西瓜滾走了，他不吃了、滿頭大汗搧風休息——「啵！」毛毛蟲從他自己的帽子裡探出頭，他嚇得跳出畫面。
// 最後畫面暗下來只剩「蟲」，豬探長掉回前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「蟲！」，然後退場只留字。
// 蟲、蟲、毛毛蟲、這是什麼字？、蟲
const PIG = 34
/** 豬探長站在地上的 y */
const P = 77 - 0.42 * PIG
/** 豬探長平常站的地方（面向右邊的食物） */
const STAND = 50
/** 食物放在畫面中間偏右（國字讓位在上方正中，毛毛蟲從食物頂上冒出來不擋字） */
const FX = 104
/** 毛毛蟲（prop:caterpillar，朝左＝面向豬探長）；size 寫最大那一次，其他次用 scaleTo（以腳底縮放） */
const BUG = 36
/** 腳底在 feet 時毛毛蟲的 y */
const bugY = (feet: number) => feet - 0.42 * BUG

type Food = { id: string; top: number; near: number }
/** 三樣食物：頂端的 y、豬探長湊過去要站的 x（一次比一次大） */
const APPLE: Food = { id: 'apple', top: 63, near: 82 }
const CAKE: Food = { id: 'cake', top: 57.3, near: 79 }
const MELON: Food = { id: 'melon', top: 51, near: 77 }
/** 毛毛蟲每次的大小（一次比一次大）：蘋果、蛋糕、西瓜、語詞那一刻、帽子 */
const SIZES = [24, 30, 36, 40, 28]
/** 毛毛蟲從食物頂上探出來時腳底在哪：下半身藏在食物後面 */
const bugFeet = (f: Food, size: number) => f.top + 2.5 - 0.04 * size
/** 冒出來以後傻眼停多久 */
const HOLD = 0.45

/**
 * 「啵！」：豬探長走過去、張大嘴湊向食物（eat，看得到的預備）→ 毛毛蟲從 (x, feet) 彈出來（pop＋往上一冒）、
 * 扭一扭跟他打招呼；他同一刻傻眼往後一縮，鏡頭推近毛毛蟲＋震＋同一個「啵」音效（一次比一次多疊一個音）。
 * at 是冒出來那一刻、k 是第幾次。之後怎麼嚇到寫在劇本裡；這裡只管那一下長得一樣。
 */
function boo(at: number, k: number, x: number, feet: number, size: number, near?: number) {
  const moves: Move[] = [
    // 要吃了：走過去、張大嘴往前湊（第 4 次他沒有要吃，只有毛毛蟲那一半）
    ...(near !== undefined ? [
      { at: at - 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
      { at: at - 0.6, actor: 'pig', do: 'moveTo', to: { x: near, y: P }, dur: 0.25 },
      { at: at - 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
      { at: at - 0.35, actor: 'pig', do: 'rotateTo', amount: 12, dur: 0.25 },
      { at, actor: 'pig', do: 'rotateTo', amount: -12, dur: 0.1 },
      { at, actor: 'pig', do: 'moveTo', to: { x: near - 5, y: P }, dur: 0.1, ease: 'out' },
    ] as Move[] : []),
    // 啵！毛毛蟲從下面冒上來
    { at: at - 0.03, actor: 'bug', do: 'moveTo', to: { x, y: bugY(feet + 5) }, dur: 0.01 },
    { at, actor: 'bug', do: 'pop', dur: 0.22 },
    // pop 重新出場時大小從頭算，所以這一次的大小在 pop 之後才縮放
    ...(size !== BUG ? [{ at: at + 0.005, actor: 'bug', do: 'scaleTo', amount: size / BUG, dur: 0.01 } as Move] : []),
    { at, actor: 'bug', do: 'moveTo', to: { x, y: bugY(feet) }, dur: 0.15, ease: 'back' },
    // 扭一扭打招呼
    { at: at + 0.2, actor: 'bug', do: 'tilt', amount: -10, dur: 0.25 },
    { at: at + 0.45, actor: 'bug', do: 'tilt', amount: -10, dur: 0.25 },
    // 傻眼
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at, actor: 'pig', do: 'squash', amount: Math.min(0.3, 0.22 + 0.04 * k), dur: 0.22 },
    { at: at + 0.12, actor: 'pig', do: 'shake', amount: 0.6 + 0.2 * k, dur: HOLD - 0.12 },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', actor: 'bug', dy: 4, emoji: '⭐', n: 5 + Math.min(k, 2), dur: 0.4, scale: 1 + 0.1 * Math.min(k, 2) },
    { at: at + 0.03, kind: 'pop', actor: 'pig', emoji: '❗', dx: -8, dur: HOLD, scale: 1.3 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: x - 6, y: feet - 6 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 毛毛蟲鑽回食物裡（往下一縮就不見） */
const duck = (at: number, x: number, feet: number): Move[] => [
  { at, actor: 'bug', do: 'moveTo', to: { x, y: bugY(feet + 6) }, dur: 0.15, ease: 'in' },
  { at, actor: 'bug', do: 'vanish', dur: 0.15 },
]
/** 食物載著裡面的毛毛蟲跳兩下跳出右邊 */
const hopAway = (at: number, id: string, y: number): Move[] => [
  { at, actor: id, do: 'moveTo', to: { x: FX + 16, y }, arc: 5, dur: 0.18 },
  { at: at + 0.18, actor: id, do: 'moveTo', to: { x: 195, y }, arc: 7, dur: 0.3, ease: 'in' },
]

const H1 = 1.8, H2 = 3.8, H3 = 6.6, H4 = 10.1
const b1 = boo(H1, 0, FX, bugFeet(APPLE, SIZES[0]), SIZES[0], APPLE.near)
const b2 = boo(H2, 1, FX, bugFeet(CAKE, SIZES[1]), SIZES[1], CAKE.near)
const b3 = boo(H3, 2, FX, bugFeet(MELON, SIZES[2]), SIZES[2], MELON.near)
/** 回馬槍：從他自己的帽子裡探出頭（hot 姿勢的帽子在 x − 3、頂端 y ≈ 47.8） */
const HAT_X = 46
const HAT = { x: HAT_X - 3, feet: 47.8 + 5 - 0.04 * SIZES[4] }
const b4 = boo(H4, 3, HAT.x, HAT.feet, SIZES[4])
/** 國字拼好、放大到正中央 */
const HOME = 7.6
const PARK = 8.45
/** 語詞那一刻：毛毛蟲跳到正中間的地上 */
const WORD = 8.75
const MID = 86
/** 西瓜滾到右邊讓位 */
const SIDE = 140
const MELON_FEET = bugFeet(MELON, SIZES[2])
/** 問他 */
const ASK = 10.9
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '蟲',
  meta: { theme: '豬探長要吃東西，毛毛蟲一直冒出來', cast: '豬探長＋毛毛蟲＋蘋果／蛋糕／大西瓜', gags: ['豬探長肚子餓，每次張大嘴要咬下去，「啵！」一隻毛毛蟲就從食物裡探出頭跟他打招呼，他嚇一跳，一次比一次誇張（蘋果愣住→蛋糕往後跳→仔細檢查過的大西瓜跌坐）；回馬槍是西瓜滾走了，他不吃了、擦汗休息，「啵！」毛毛蟲從他自己的帽子裡探出頭'] },
  duration: 15,
  bg: { top: '#E4F3FF', bottom: '#FFF9EC', floor: '#C6E09A', scenery: 'hills' },
  actors: [
    // 毛毛蟲畫在最後面：從食物、帽子後面冒出來，下半身被擋住＝從裡面探出頭
    { id: 'bug', emoji: 'prop:caterpillar', x: FX, y: bugY(bugFeet(APPLE, SIZES[0])), size: BUG, hidden: true },
    { id: 'apple', emoji: '🍎', x: FX, y: 77 - 0.42 * 16, size: 16 },
    { id: 'cake', emoji: 'prop:cake', x: FX, y: 77 - 0.42 * 24, size: 24, hidden: true },
    { id: 'melon', emoji: 'prop:watermelon', x: FX, y: 77 - 0.42 * 30, size: 30, hidden: true, pivot: 'center' },
    // 新的豬探長圖朝左，翻過來朝右：面向食物
    { id: 'pig', emoji: 'hero:pig/walk', x: STAND, y: P, size: PIG, hidden: true, flip: true },
  ],
  moves: [
    // 豬探長走進來，抬頭指著字框：蟲！看到蘋果，流口水
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 0.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
    // 第 1 次：蘋果——啵！愣住
    ...b1.moves,
    { at: H1 + HOLD + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: H1 + HOLD + 0.2, actor: 'pig', do: 'moveTo', to: { x: STAND, y: P }, dur: 0.3 },
    ...duck(H1 + 0.65, FX, bugFeet(APPLE, SIZES[0])),
    ...hopAway(H1 + 0.8, 'apple', 77 - 0.42 * 16),
    { at: 2.85, actor: 'cake', do: 'drop', dur: 0.4 },
    { at: 2.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
    // 第 2 次：蛋糕——啵！往後跳開
    ...b2.moves,
    { at: H2 + HOLD, actor: 'pig', do: 'swap', emoji: 'hero:pig/scared' },
    { at: H2 + HOLD, actor: 'pig', do: 'moveTo', to: { x: 36, y: P }, arc: 10, dur: 0.35, ease: 'out' },
    ...duck(H2 + 0.65, FX, bugFeet(CAKE, SIZES[1])),
    ...hopAway(H2 + 0.8, 'cake', 77 - 0.42 * 24),
    { at: 4.85, actor: 'melon', do: 'drop', dur: 0.4 },
    // 第 3 次前停一拍：拿放大鏡把大西瓜仔細看一遍……沒有蟲！得意地點頭
    { at: 5.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 5.15, actor: 'pig', do: 'moveTo', to: { x: MELON.near, y: P }, dur: 0.3 },
    { at: 5.5, actor: 'pig', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 5.5, actor: 'pig', do: 'hop', amount: -1.5, dur: 0.3 },
    { at: 5.82, actor: 'pig', do: 'tilt', amount: 6, dur: 0.25 },
    { at: 6.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: 6.05, actor: 'pig', do: 'hop', amount: 2.5, dur: 0.2 },
    // 啵！嚇得往後跳、一屁股跌坐
    ...b3.moves,
    { at: H3 + HOLD, actor: 'pig', do: 'swap', emoji: 'hero:pig/scared' },
    { at: H3 + HOLD, actor: 'pig', do: 'moveTo', to: { x: 28, y: P }, arc: 16, dur: 0.42, ease: 'out' },
    { at: H3 + HOLD + 0.42, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
    // 毛毛蟲鑽回西瓜，西瓜滾到右邊（國字到正中央）
    ...duck(H3 + 0.65, FX, MELON_FEET),
    { at: H3 + 0.75, actor: 'melon', do: 'moveTo', to: { x: SIDE, y: 77 - 0.42 * 30 }, dur: 0.4, ease: 'out' },
    { at: H3 + 0.75, actor: 'melon', do: 'rotateTo', amount: 140, dur: 0.4, ease: 'out' },
    // 語詞那一刻：毛毛蟲從西瓜裡探出頭，跳到畫面正中間變最大；豬探長爬起來指著牠——毛毛蟲
    { at: PARK, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: PARK, actor: 'pig', do: 'moveTo', to: { x: 40, y: P }, dur: 0.3 },
    { at: PARK - 0.03, actor: 'bug', do: 'moveTo', to: { x: SIDE, y: bugY(MELON_FEET + 5) }, dur: 0.01 },
    { at: PARK, actor: 'bug', do: 'pop', dur: 0.22 },
    { at: PARK, actor: 'bug', do: 'moveTo', to: { x: SIDE, y: bugY(MELON_FEET) }, dur: 0.15, ease: 'back' },
    { at: PARK + 0.25, actor: 'bug', do: 'moveTo', to: { x: MID, y: bugY(77) }, arc: 10, dur: 0.35, ease: 'out' },
    { at: PARK + 0.25, actor: 'bug', do: 'scaleTo', amount: SIZES[3] / SIZES[2], dur: 0.35, ease: 'back' },
    { at: WORD, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: WORD, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: WORD + 0.15, actor: 'bug', do: 'tilt', amount: -10, dur: 0.3 },
    { at: WORD + 0.45, actor: 'bug', do: 'tilt', amount: -10, dur: 0.3 },
    // 回馬槍（第 4 次）：毛毛蟲跳回西瓜、西瓜滾走了；他不吃了，滿頭大汗搧風休息……
    { at: 9.3, actor: 'bug', do: 'moveTo', to: { x: SIDE, y: bugY(MELON_FEET) }, arc: 10, dur: 0.3, ease: 'inOut' },
    { at: 9.3, actor: 'bug', do: 'scaleTo', amount: SIZES[2] / SIZES[3], dur: 0.3 },
    ...duck(9.6, SIDE, MELON_FEET),
    { at: 9.65, actor: 'melon', do: 'moveTo', to: { x: 200, y: 77 - 0.42 * 30 }, dur: 0.35, ease: 'in' },
    { at: 9.65, actor: 'melon', do: 'rotateTo', amount: 200, dur: 0.35, ease: 'in' },
    { at: 9.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/hot' },
    { at: 9.7, actor: 'pig', do: 'moveTo', to: { x: HAT_X, y: P }, dur: 0.2 },
    // 啵！從他自己的帽子裡探出頭
    ...b4.moves,
    // 嚇得跳出畫面（毛毛蟲坐在帽子上一起飛走）
    { at: H4 + HOLD, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: H4 + HOLD, actor: 'pig', do: 'moveTo', to: { x: HAT_X, y: P - 110 }, dur: 0.3, ease: 'in' },
    { at: H4 + HOLD, actor: 'bug', do: 'moveTo', to: { x: HAT.x, y: bugY(HAT.feet) - 110 }, dur: 0.3, ease: 'in' },
    { at: ASK, actor: 'bug', do: 'vanish', dur: 0.01 },
    // 問他：豬探長從天上掉到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK + 0.05, actor: 'pig', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: ASK + 0.05, actor: 'pig', do: 'scaleTo', amount: 1.2, dur: 0.01 },
    { at: ASK + 0.1, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 3 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.0, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 8, dur: 0.2 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: ANSWER + 0.2, actor: 'pig', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 3 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 每冒出一隻毛毛蟲，就有一個「虫」從牠身上飛進字框：上面一個、左下、右下
    { at: H1 + 0.3, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'bug', color: partColor('虫') },
    { at: H2 + 0.3, dur: 0.6, strokes: [6, 7, 8, 9, 10, 11], from: 'bug', color: partColor('虫') },
    { at: H3 + 0.3, dur: 0.6, strokes: [12, 13, 14, 15, 16, 17], from: 'bug', color: partColor('虫') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['pig'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    { at: H1 + 0.35, kind: 'sweat', actor: 'pig' },
    ...b2.fx,
    // 第 3 次前停一拍：仔細檢查
    { at: 5.5, kind: 'pop', actor: 'pig', emoji: '❓', dx: 6, dur: 0.5, scale: 1.4 },
    ...b3.fx,
    { at: H3 + HOLD + 0.45, kind: 'dizzy', actor: 'pig', dur: 0.5 },
    { at: PARK + 0.6, kind: 'burst', actor: 'bug', dy: 4, emoji: '⭐', n: 8, dur: 0.45 },
    { at: 9.75, kind: 'sweat', actor: 'pig' },
    ...b4.fx,
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：要同時看得到豬探長和冒出來的毛毛蟲
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: 7.3, dur: 0.3, do: 'zoom', amount: 1 },
    ...b4.camera,
  ],
  lights: [
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.15 - 0.05 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '蟲' },
    ...b1.cues,
    { at: H1 + 0.8, sfx: 'boing' },
    { at: 3.05, sfx: 'plop' },
    ...b2.cues,
    { at: H2 + 0.8, sfx: 'boing' },
    { at: 5.05, sfx: 'bonk' },
    ...b3.cues,
    { at: H3 + HOLD + 0.42, sfx: 'plop' },
    { at: H3 + 0.75, sfx: 'slide' },
    { at: HOME + 0.1, say: '蟲' },
    { at: WORD, say: '毛毛蟲' },
    { at: 9.65, sfx: 'slide' },
    ...b4.cues,
    { at: H4 + HOLD, sfx: 'whoosh' },
    { at: ASK + 0.2, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '蟲' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
