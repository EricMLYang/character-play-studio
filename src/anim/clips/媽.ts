import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 媽（v2）：媽媽的抱抱最厲害。楊捷睿每次出一點慘事，就哭喪著臉跑向媽媽——媽媽蹲低張開雙手，一把抱住「啾！」，愛心冒出來，
// 「叮！」他立刻好了，而且比原來還有精神。同一個「跑過去→張開手→抱住＋愛心→叮，好了」，一次比一次慘、抱完一次比一次有精神：
// 踢到石頭跌倒、哭（女從抱抱的愛心裡飛出來）→ 好了，蹦蹦跳 →
// 一朵壞壞的烏雲只下在他頭上，淋成落湯雞、縮成一團發抖（馬的上半從愛心裡飛出來）→ 好了，原地轉一圈 →
// 先停一拍：烏雲鼓起來「轟隆隆」，他抬頭看雲、再看媽媽，媽媽已經先蹲好張開手了——「轟！」閃電打在他旁邊，
// 嚇得整個人變白、發抖（四點從愛心裡飛出來）→ 抱完「叮」，整個人發光、跳好高，把烏雲嚇跑。
// 回馬槍（第四次）：發光的他在媽媽身邊蹦來蹦去，媽媽擦汗、累得一屁股坐在地上。他喊「媽媽！」跑過去，這次換他抱媽媽——
// 「啾！」愛心冒出來，「叮！」媽媽一下子站起來、滿血復活，把他舉起來轉圈圈。她揮揮手回去煮飯，他揮手說掰掰。
// 最後畫面暗下來只剩「媽」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「媽！」，然後退場只留字。
// 刻意不跟「姑」（姑姑衝過來親、他想躲）、「爸」（舉高高）、「哭」（越逗越哭）、「怕」（嚇白跳起來）、「雷」（被雷打到充電）撞：
// 這支的主軸是「抱一下就好了」，慘事只是讓他跑向媽媽的原因；嚇白只是第三次的慘事，被抱一下就好。
// 媽、媽、媽媽、這是什麼字？、媽

/** 楊捷睿：站在左邊、面向右邊的媽媽（flip） */
const S = 34
const P = 77 - 0.42 * S
/** 每次出事的地方（都在同一個地方） */
const LX = 36
/** 媽媽（道具圖 prop:mom*，朝左）：畫面正中偏右、最大 */
const MS = 54
const MY = 77 - 0.42 * MS
const MX = 94
/** 抱住那一格他站的地方：貼在媽媽身前 */
const HX = MX - 15
/** 愛心冒出來的地方：兩個人的頭中間、媽媽臉的左邊（不蓋臉） */
const HEART = { x: MX - 27, y: 40 }
/** 石頭（第一次踢到的、第三次被閃電打飛的） */
const RS = 10
const RX = LX + 12
const RY = 77 - 0.42 * RS
/** 烏雲：停在出事的地方正上方 */
const CS = 30
const CLOUD = { x: LX, y: 17 }
/** 字框：右上角（烏雲在左上、媽媽在中間），背後是素色的天空 */
const FRAME = { x: 137, y: 19 }
const FRAME_K = 0.47

/** 淋濕：藍藍的、暗一點 */
const WET = 'saturate(.55) brightness(.92) sepia(.25) hue-rotate(175deg)'
/** 嚇白 */
const PALE = 'grayscale(.85) brightness(1.3)'
/** 抱完「叮」：發光 */
const GLOW = 'brightness(1.2) saturate(1.2) drop-shadow(0 0 3px #FFE21A) drop-shadow(0 0 6px #FFD400)'

const RAIN = '#1D4FC4'
const RAIN_HI = '#8FC0F5'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 抱住以後停多久才「叮」 */
const HOLD = 0.55
/** 跑過去要多久 */
const RUN = 0.35

/**
 * 「跑過去→張開手→抱住＋愛心→叮」：他哭喪著臉衝向媽媽，媽媽蹲低張開雙手（mom-open），
 * 一把抱住（mom-hug，他貼在她身前）「啾！」愛心冒出來＋鏡頭推近，停 HOLD 秒；「叮！」他好了（換 happy、拿掉 tint、✨）。
 * k 是第幾次（越後面愛心越多越大）。回傳「叮」的那一刻。
 */
function hug(T: number, k: number, opened = T - RUN - 0.08): Gag {
  const D = T + HOLD
  const g: Gag = { moves: [], fx: [], camera: [], cues: [] }
  g.moves.push(
    { at: opened, actor: 'mom', do: 'swap', emoji: 'prop:mom-open' },
    { at: T - RUN, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: T - RUN, dur: RUN, actor: 'yang', do: 'moveTo', to: { x: HX, y: P }, ease: 'in' },
    // 抱住
    { at: T, actor: 'mom', do: 'swap', emoji: 'prop:mom-hug' },
    { at: T, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: T, dur: 0.3, actor: 'mom', do: 'squash', amount: 0.08 + 0.03 * k },
    { at: T + 0.1, dur: HOLD - 0.15, actor: 'mom', do: 'tilt', amount: -5 },
    // 叮！好了
    { at: D, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: D, actor: 'yang', do: 'tint', filter: k >= 2 ? GLOW : '' },
    { at: D, actor: 'mom', do: 'swap', emoji: 'prop:mom' },
  )
  g.fx.push(
    // 愛心：一顆大的＋一圈小的，一次比一次多、比一次大
    { at: T, dur: HOLD, kind: 'pop', x: HEART.x, y: HEART.y, emoji: '❤️', scale: 2.4 + 0.4 * k },
    { at: T + 0.05, dur: HOLD, kind: 'burst', x: HEART.x + 4, y: HEART.y + 4, emoji: '💕', n: 4 + 2 * k, scale: 1.3 + 0.25 * k },
    // 叮：他身上亮晶晶
    { at: D, dur: 0.45, kind: 'burst', actor: 'yang', dy: 4, emoji: '✨', n: 6 + 2 * k, scale: 1.2 + 0.3 * k },
  )
  g.camera.push(
    { at: T, dur: HOLD, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: MX - 12, y: 46 } },
    { at: T, dur: 0.25, do: 'shake', amount: 0.4 + 0.2 * k },
  )
  // 同一個「啾」：一次比一次多疊一個音；叮
  g.cues.push({ at: T, sfx: 'plop' }, { at: T + 0.05, sfx: 'blip' })
  if (k >= 1) g.cues.push({ at: T + 0.12, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: T + 0.2, sfx: 'blip' })
  g.cues.push({ at: D, sfx: 'clink' })
  return g
}

/** 一陣雨：一條一條藍色的雨線從雲底落到他身上（照「雲」的寫法，每 0.07 秒換一批位置） */
function rain(at: number, dur: number): Fx[] {
  const out: Fx[] = []
  const step = 0.07
  const len = 9
  const cols = [-11, -7, -3, 1, 5, 9, 13].map((o) => ({ src: { x: CLOUD.x + o, y: CLOUD.y + 8 }, dst: { x: CLOUD.x + o - 2, y: 74 } }))
  for (let s = 0; at + s * step < at + dur - 0.04; s++) {
    cols.forEach(({ src, dst }, i) => {
      const L = Math.hypot(dst.x - src.x, dst.y - src.y)
      const ph = (s * 0.37 + i * 0.29) % 1
      const a = Math.max(0, ph * L - len * 0.3), b = Math.min(L, a + len)
      const p0: Vec = { x: src.x + ((dst.x - src.x) * a) / L, y: src.y + ((dst.y - src.y) * a) / L }
      const p1: Vec = { x: src.x + ((dst.x - src.x) * b) / L, y: src.y + ((dst.y - src.y) * b) / L }
      const t = at + s * step
      out.push({ at: t, dur: 0.2, kind: 'line', actor: 'cloud', dx: p0.x - CLOUD.x, dy: p0.y - CLOUD.y, to: p1, color: RAIN, width: 1.4 })
      out.push({ at: t, dur: 0.2, kind: 'line', actor: 'cloud', dx: p0.x - CLOUD.x, dy: p0.y - CLOUD.y, to: p1, color: RAIN_HI, width: 0.5 })
    })
  }
  return out
}

// 第 1 次：踢到石頭跌倒
const TRIP = 1.25
const H1 = 2.05
const g1 = hug(H1, 0)
const D1 = H1 + HOLD
// 第 2 次：烏雲只下在他頭上
const RAIN1 = 3.05
const H2 = 4.0
const g2 = hug(H2, 1)
const D2 = H2 + HOLD
// 第 3 次前停一拍：烏雲鼓起來，他看雲、看媽媽，媽媽先蹲好張開手
const BEAT = 4.95
const ZAP = 5.6
const H3 = 6.4
const g3 = hug(H3, 2, BEAT + 0.35)
const D3 = H3 + HOLD
/** 國字放大到中間：兩個人讓到兩邊 */
const HOME = D3 + 0.4
const PARK = HOME + 0.75
// 回馬槍：媽媽累倒，換他抱媽媽
const TIRED = PARK + 0.62
const WORD = TIRED + 0.25
const H4 = WORD + 0.35
const D4 = H4 + HOLD
const LIFT = D4 + 0.12
const DOWN = LIFT + 0.5
const BYE = DOWN + 0.05
const ASK = 11.08
const Q = 11.12
const ANSWER = 13.6
/** 問他的時候他放大一點 */
const ASK_S = 1.15
/** 國字回中央時兩個人站的地方 */
const SIDE_Y = 16, SIDE_M = 143
/** 舉起來時他坐在媽媽伸出去的雙手上（mom-open 的雙手在圖的 u 0.16～0.35、v 0.4～0.5） */
const HANDS_L = { x: MX - 21, y: MY - 0.47 * S + 2 }
const HANDS_R = { x: MX + 21, y: HANDS_L.y }

const clip: Clip = {
  format: 2,
  char: '媽',
  meta: { theme: '媽媽的抱抱', cast: '楊捷睿＋媽媽＋石頭＋烏雲', gags: ['楊捷睿每次出事就哭著跑向媽媽，媽媽張開雙手一把抱住「啾」、愛心冒出來，「叮」他立刻好了、比原來還有精神，一次比一次慘、抱完一次比一次有精神（跌倒→蹦蹦跳；被烏雲淋成落湯雞→原地轉一圈；先停一拍，被閃電嚇白→發光跳好高把烏雲嚇跑）；回馬槍是第四次換媽媽累得坐在地上，他跑過去抱媽媽，「叮」媽媽滿血復活、把他舉起來轉圈'] },
  duration: 15,
  // 樹林邊的草地（太陽在左上、被烏雲擋住；右上角的天空是素的）：紅外套的他、綠圍裙的媽媽在淡藍天空上都跳得出來
  bg: { top: '#D6ECFF', bottom: '#F4FAFF', floor: '#BFE3A0', scenery: 'forest' },
  actors: [
    { id: 'rock', emoji: 'prop:rock', x: RX, y: RY, size: RS },
    { id: 'mom', emoji: 'prop:mom', x: MX, y: MY, size: MS },
    { id: 'yang', emoji: 'hero:yang/walk', x: LX - 10, y: P, size: S, hidden: true, flip: true },
    { id: 'cloud', emoji: 'prop:cloud-dark', x: -30, y: CLOUD.y, size: CS, float: true },
  ],
  moves: [
    // 開場：他從左邊走進來，看到媽媽揮手——媽！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -22, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    { at: 0.75, dur: 0.3, actor: 'mom', do: 'hop', amount: 2 },
    // 第 1 次：蹦蹦跳跳往前，踢到石頭——跌倒，膝蓋痛，哇——
    { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: 1.0, dur: TRIP - 1.0, actor: 'yang', do: 'moveTo', to: { x: RX - 8, y: P } },
    { at: TRIP, actor: 'yang', do: 'swap', emoji: 'hero:yang/slip' },
    { at: TRIP, dur: 0.18, actor: 'rock', do: 'shake', amount: 1 },
    { at: TRIP, dur: 0.22, actor: 'yang', do: 'moveTo', to: { x: RX + 4, y: P }, arc: 5 },
    { at: TRIP + 0.22, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: TRIP + 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/cry' },
    { at: TRIP + 0.5, dur: 0.25, actor: 'yang', do: 'shake', amount: 0.8 },
    ...g1.moves,
    // 好了！蹦蹦跳跳回到原來的地方
    { at: D1 + 0.1, dur: 0.22, actor: 'yang', do: 'hop', amount: 5 },
    { at: D1 + 0.35, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: LX, y: P }, arc: 7 },
    { at: D1 + 0.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 2 次：烏雲飄過來停在他頭上，嘩——只下在他身上，縮成一團發抖
    { at: RAIN1 - 0.45, dur: 0.4, actor: 'cloud', do: 'moveTo', to: CLOUD, ease: 'out' },
    { at: RAIN1 - 0.1, dur: 0.15, actor: 'cloud', do: 'squash', amount: -0.15 },
    { at: RAIN1 + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/cold' },
    { at: RAIN1 + 0.15, actor: 'yang', do: 'tint', filter: WET },
    { at: RAIN1 + 0.2, dur: 0.4, actor: 'yang', do: 'shake', amount: 0.8 },
    { at: H2 - RUN - 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/cry' },
    ...g2.moves,
    // 好了！原地轉一圈，回到原來的地方
    { at: D2 + 0.05, dur: 0.4, actor: 'yang', do: 'spin', amount: 360, pivot: 'center' },
    { at: D2 + 0.05, dur: 0.4, actor: 'yang', do: 'hop', amount: 7 },
    { at: D2 + 0.5, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: LX, y: P }, arc: 6 },
    { at: D2 + 0.92, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 停一拍：烏雲鼓起來、轟隆隆；他抬頭看雲、轉頭看媽媽——媽媽已經蹲好張開手了
    { at: BEAT, dur: 0.5, actor: 'cloud', do: 'scaleTo', amount: 1.3, ease: 'back' },
    { at: BEAT + 0.1, dur: 0.5, actor: 'cloud', do: 'shake', amount: 0.8 },
    { at: BEAT + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: BEAT + 0.3, dur: 0.01, actor: 'yang', do: 'flip' },
    { at: BEAT + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/back' },
    { at: BEAT + 0.4, dur: 0.25, actor: 'mom', do: 'hop', amount: 1.5 },
    { at: ZAP - 0.05, dur: 0.01, actor: 'yang', do: 'flip' },
    // 轟！閃電打在他旁邊的石頭上：嚇得整個人變白、發抖
    { at: ZAP, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
    { at: ZAP, actor: 'yang', do: 'tint', filter: PALE },
    { at: ZAP, dur: 0.15, actor: 'yang', do: 'hop', amount: 6 },
    { at: ZAP + 0.12, dur: 0.4, actor: 'yang', do: 'shake', amount: 1.3 },
    { at: ZAP + 0.3, dur: 0.3, actor: 'rock', do: 'moveTo', to: { x: RX + 6, y: -20 }, ease: 'out' },
    { at: ZAP + 0.3, dur: 0.3, actor: 'rock', do: 'spin', amount: 540, pivot: 'center' },
    { at: ZAP + 0.6, dur: 0.01, actor: 'rock', do: 'vanish' },
    { at: H3 - RUN - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/cry' },
    ...g3.moves,
    // 好了！整個人發光、跳好高轉一圈，落在左邊；烏雲嚇得縮小逃走
    { at: D3 + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: D3 + 0.02, dur: 0.38, actor: 'yang', do: 'moveTo', to: { x: SIDE_Y, y: P }, arc: 22 },
    { at: D3 + 0.02, dur: 0.38, actor: 'yang', do: 'spin', amount: -360, pivot: 'center' },
    { at: D3 + 0.42, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: D3 + 0.1, dur: 0.3, actor: 'cloud', do: 'scaleTo', amount: 0.6 },
    { at: D3 + 0.1, dur: 0.4, actor: 'cloud', do: 'moveTo', to: { x: -40, y: 8 }, ease: 'in' },
    // 國字放大到中間：媽媽退到右邊
    { at: D3, dur: 0.32, actor: 'mom', do: 'moveTo', to: { x: SIDE_M, y: MY } },
    // 回馬槍：媽媽回到中間；發光的他在她身邊蹦來蹦去，媽媽擦汗，累得一屁股坐在地上
    { at: PARK + 0.3, dur: 0.3, actor: 'mom', do: 'moveTo', to: { x: MX, y: MY } },
    { at: PARK + 0.05, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: 50, y: P }, arc: 10 },
    { at: PARK + 0.38, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: 40, y: P }, arc: 8 },
    { at: TIRED, actor: 'mom', do: 'swap', emoji: 'prop:mom-tired' },
    { at: TIRED, dur: 0.3, actor: 'mom', do: 'squash', amount: 0.2 },
    { at: TIRED + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 媽媽！跑過去，這次換他抱媽媽
    { at: WORD + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: WORD + 0.05, dur: H4 - WORD - 0.05, actor: 'yang', do: 'moveTo', to: { x: HX - 2, y: P }, ease: 'in' },
    { at: H4, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: H4, dur: 0.3, actor: 'yang', do: 'squash', amount: 0.12 },
    { at: H4 + 0.1, dur: HOLD - 0.15, actor: 'yang', do: 'tilt', amount: 6 },
    // 叮！媽媽一下子站起來、滿血復活
    { at: D4, actor: 'mom', do: 'swap', emoji: 'prop:mom' },
    { at: D4, actor: 'mom', do: 'tint', filter: GLOW },
    { at: D4, dur: 0.2, actor: 'mom', do: 'hop', amount: 4 },
    { at: D4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: D4, actor: 'yang', do: 'tint', filter: '' },
    // 把他舉起來轉圈圈：他坐在媽媽伸出去的雙手上，媽媽一轉身，他就到另一邊
    { at: LIFT, actor: 'mom', do: 'swap', emoji: 'prop:mom-open' },
    { at: LIFT, dur: 0.15, actor: 'yang', do: 'moveTo', to: HANDS_L, ease: 'out' },
    { at: LIFT + 0.18, dur: 0.01, actor: 'mom', do: 'flip' },
    { at: LIFT + 0.18, dur: 0.01, actor: 'yang', do: 'moveTo', to: HANDS_R },
    { at: LIFT + 0.18, dur: 0.01, actor: 'yang', do: 'flip' },
    { at: LIFT + 0.36, dur: 0.01, actor: 'mom', do: 'flip' },
    { at: LIFT + 0.36, dur: 0.01, actor: 'yang', do: 'moveTo', to: HANDS_L },
    { at: LIFT + 0.36, dur: 0.01, actor: 'yang', do: 'flip' },
    { at: LIFT + 0.36, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    // 放下來；媽媽揮揮手、轉身走回右邊，他揮手說掰掰
    { at: DOWN, dur: 0.28, actor: 'yang', do: 'moveTo', to: { x: 40, y: P }, arc: 8 },
    { at: DOWN, actor: 'mom', do: 'swap', emoji: 'prop:mom' },
    { at: DOWN, actor: 'mom', do: 'tint', filter: '' },
    { at: BYE + 0.05, dur: 0.01, actor: 'mom', do: 'flip' },
    { at: BYE + 0.07, dur: ASK - BYE - 0.15, actor: 'mom', do: 'moveTo', to: { x: 190, y: MY }, ease: 'linear' },
    { at: BYE + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    // 問他：他跳到左前方、放大
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.18, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.18, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 3 }, ease: 'in' },
  ],
  builds: [
    // 三次都從抱抱冒出來的愛心飛上去：女、馬的上半、馬的四點（四條腿）
    { at: H1 + 0.15, dur: 0.35, strokes: [0, 1, 2], from: HEART, color: partColor('女') },
    { at: H2 + 0.15, dur: 0.38, strokes: [3, 4, 5, 6, 7, 8], from: HEART, color: partColor('馬') },
    { at: H3 + 0.15, dur: 0.35, strokes: [9, 10, 11, 12], from: HEART, color: partColor('馬') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 跌倒：碰到石頭那一下（在石頭上，不蓋臉）
    { at: TRIP, dur: 0.3, kind: 'burst', x: RX + 7, y: RY - 2, n: 1, scale: 1.2 },
    ...g1.fx,
    // 下雨（只下在他身上）
    ...rain(RAIN1, H2 - RUN - RAIN1 + 0.1),
    { at: RAIN1 + 0.2, dur: 0.5, kind: 'burst', x: LX, y: 70, emoji: '💦', n: 6, scale: 1.2 },
    ...g2.fx,
    // 停一拍：他看雲、看媽媽（媽媽冒汗：又來了）
    { at: BEAT + 0.05, dur: 0.5, kind: 'pop', actor: 'yang', emoji: '❗', dx: -8, scale: 1.4 },
    // 轟！閃電打在石頭上
    { at: ZAP - 0.08, dur: 0.4, kind: 'zap', actor: 'cloud', target: 'rock', scale: 1.3 },
    { at: ZAP, dur: 0.4, kind: 'burst', x: RX + 2, y: 66, n: 1, scale: 2.2 },
    { at: ZAP + 0.02, dur: 0.45, kind: 'burst', x: CLOUD.x, y: CLOUD.y + 10, emoji: '⚡', n: 6, scale: 1.4 },
    ...g3.fx,
    // 語詞前：媽媽擦汗、好累
    { at: PARK + 0.3, dur: 0.6, kind: 'sweat', actor: 'mom', dx: 10 },
    // 換他抱媽媽：愛心最大
    { at: H4, dur: HOLD, kind: 'pop', x: MX - 22, y: 44, emoji: '❤️', scale: 3.2 },
    { at: H4 + 0.05, dur: HOLD, kind: 'burst', x: MX - 16, y: 42, emoji: '💕', n: 10, scale: 2 },
    // 叮！媽媽滿血復活
    { at: D4, dur: 0.5, kind: 'burst', actor: 'mom', dy: 10, emoji: '✨', n: 12, scale: 2.2 },
    { at: LIFT + 0.15, dur: 0.5, kind: 'burst', x: MX, y: 26, emoji: '💕', n: 6, scale: 1.3 },
    { at: BYE + 0.05, dur: 0.4, kind: 'pop', x: MX - 16, y: 34, emoji: '👋', scale: 1.4 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看切到人），只有抱住那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: ZAP, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: H4, dur: HOLD, do: 'punch', amount: 0.12, to: { x: MX - 12, y: 46 } },
    { at: D4, dur: 0.3, do: 'shake', amount: 0.8 },
  ],
  lights: [
    // 閃電：小小閃一下（不刷白整個畫面）
    { at: ZAP - 0.02, dur: 0.04, level: -0.25 },
    { at: ZAP + 0.02, dur: 0.2, level: 0 },
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '媽' },
    { at: TRIP, sfx: 'bonk' },
    { at: TRIP + 0.25, sfx: 'plop' },
    ...g1.cues,
    { at: RAIN1, sfx: 'splash' },
    ...g2.cues,
    { at: BEAT, sfx: 'rumble' },
    { at: ZAP - 0.05, sfx: 'crack' },
    ...g3.cues,
    { at: D3 + 0.05, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '媽' },
    { at: TIRED, sfx: 'deflate' },
    { at: WORD, say: '媽媽' },
    { at: H4, sfx: 'plop' },
    { at: H4 + 0.05, sfx: 'blip' },
    { at: H4 + 0.12, sfx: 'boing' },
    { at: D4, sfx: 'clink' },
    { at: D4 + 0.05, sfx: 'cheer' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '媽' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
