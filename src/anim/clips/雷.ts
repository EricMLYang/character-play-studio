import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 雷（v2）：陰陰的傍晚，一朵大烏雲飄到小機器人頭上。雲裡先「滋…滋…」閃兩下光（他抬頭看，天線尖冒小火花）——
// 「轟隆！」一道粗粗的黃色閃電從烏雲直直打中他的天線，他全身抖抖抖、整個人亮起來：被充電了！充到電的他精神變好一級。
// 同一個動作四次，烏雲、閃電、天線每次都在畫面正中間連成一直線，閃電一次比一次粗：
// 小閃電（他嚇一跳，然後開心地原地跳；雨的外框從烏雲飛出來）→ 大閃電（他張開手迎接，充完電快得原地來回衝；四點雨滴從烏雲飛出來）→
// 先停一拍：他對著雲招手「再來再來」、踮腳把天線舉高，雲鼓得特別大——超級閃電（多兩道分岔），他亮得像一顆太陽，
// 在畫面上咻咻咻衝來衝去（田從閃電打中天線的地方飛出來）。語詞那一刻烏雲在中間最大、閃電亮著，他在下面舉著天線：「打雷」。
// 回馬槍（第四次）：他還要！雲「滋…」一下就「噗」地縮成小小一朵白雲——沒電了，只擠出一滴雨「答」滴在他頭上，他愣住。
// 換他了：他天線「滋滋」兩下，「轟隆！」同一道閃電反過來從天線往上打中小白雲——雲亮成金色、又鼓回來，開心地彈。
// 最後畫面暗下來只剩「雷」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「雷！」，然後和雲一起退場，只留字。
// 刻意不跟「怕」（被嚇到跳起來）、「雲」（雲跟著他、雨只下在他身上）、「腿」（機器人當機垮下來）撞：這支是開心版，打雷＝充飽電，不演害怕、不演壞掉。
// 雷、雷、打雷、這是什麼字？、雷

/** 小機器人：圖朝左，整支 flip 朝右（面向飄過來的烏雲） */
const S = 40
const PR = 77 - 0.42 * S
/** 天線的黃球在圖上的位置（flip 以後）：被打中時固定用 surprised，舉高天線用 know */
const ANT_DX = -3.4
const ANT_KNOW_DX = -5.6
/** 每次都站在同一個地方：surprised 的天線剛好在畫面正中間 x 80 */
const BX = 80 - ANT_DX
/** 天線尖（閃電打中的那一點） */
const ANT: Vec = { x: 80, y: PR - 0.41 * S - 1 }
const ANT_KNOW: Vec = { x: BX + ANT_KNOW_DX, y: PR - 0.4 * S - 1 }

/** 烏雲（prop:smoke 調成深灰、拉寬壓扁一點）：這個字講的東西，比他大 */
const CS = 44
const CW = 1.3
const CY = 10
/** 雲停在他正上方的位置；兩次中間飄到旁邊 */
const C0: Vec = { x: 80, y: CY }
const AWAY: Vec = { x: 121, y: CY + 1 }
/** 閃電從雲肚子裡出來的那一點 */
const BELLY: Vec = { x: 80, y: CY + 11 }
const DARK = 'brightness(.42) saturate(.5)'
const GOLD = 'sepia(.7) saturate(2.4) brightness(1.08) drop-shadow(0 0 5px #FFE21A)'

/** 被打中那一下的亮度（一次比一次亮）與充到電以後留著的光（一級一級亮） */
const GLOW = [
  'brightness(1.3) saturate(1.2) drop-shadow(0 0 3px #FFE21A)',
  'brightness(1.5) saturate(1.3) drop-shadow(0 0 5px #FFE21A)',
  'brightness(1.8) saturate(1.4) drop-shadow(0 0 5px #FFF27A) drop-shadow(0 0 9px #FFD400)',
]
const CHARGED = [
  '',
  'brightness(1.06) drop-shadow(0 0 2px #FFE21A)',
  'brightness(1.13) drop-shadow(0 0 3.5px #FFE21A)',
  'brightness(1.22) drop-shadow(0 0 5px #FFE21A)',
]

/** 字框：左上角（烏雲和閃電在畫面中間、太陽在右上），背後是素色的天空 */
const FRAME = { x: 21, y: 20 }
const FRAME_K = 0.42

const BOLT = '#FFE21A'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 一道鋸齒：外圈白、內圈亮黃的粗線，從 from 一節一節接到 to（錨在 anchor 這個角色上，pos 是他當下的位置） */
function zigzag(at: number, dur: number, from: Vec, to: Vec, w: number, amp: number, anchor: { id: string; pos: Vec }, segs = 4): Fx[] {
  const pts: Vec[] = []
  for (let i = 0; i <= segs; i++) {
    const k = i / segs
    const side = i === 0 || i === segs ? 0 : i % 2 ? amp : -amp
    pts.push({ x: from.x + (to.x - from.x) * k + side, y: from.y + (to.y - from.y) * k })
  }
  const layer = (color: string, width: number): Fx[] => pts.slice(0, -1).map((p, i) => ({
    at: at + i * 0.015, dur: dur - i * 0.015, kind: 'line', actor: anchor.id,
    dx: p.x - anchor.pos.x, dy: p.y - anchor.pos.y, to: pts[i + 1], color, width,
  } as Fx))
  return [...layer('#FFFFFF', w * 1.9), ...layer(BOLT, w)]
}

/**
 * 同一個笑點「轟隆」：雲已經停在他正上方 → 雲一鼓、肚子裡「滋…滋…」閃兩下光，他抬頭（lead 姿勢）、天線尖冒小火花（預備）→
 * 轟隆！全畫面淡淡閃白一下＋鏡頭推近＋震＋同一個雷聲，一道粗黃閃電從雲肚子直直打到天線 → 他全身抖、發亮、身邊冒電火花，停 hold 秒。
 * at 是轟隆的那一刻，k 是第幾次（0～2 越來越粗、越來越亮）。
 * up：回馬槍——換他放電，預備是他的天線在閃，同一道閃電從天線往上打中雲，發亮的是雲。
 */
function strike(at: number, k: number, o: { hold: number; pre?: number; lead?: string; cloud?: Vec; up?: boolean; ant?: Vec }): Gag {
  const pre = o.pre ?? 0.5, cloud = o.cloud ?? C0, ant = o.ant ?? ANT
  const belly = { x: cloud.x, y: cloud.y + (BELLY.y - C0.y) }
  const w = 2 + 1.15 * k, amp = 3 + 1.4 * k
  const moves: Move[] = []
  const fx: Fx[] = []
  const pulses = k >= 2 ? 3 : 2
  const cues: Cue[] = Array.from({ length: pulses }, (_, i) => ({ at: at - pre + 0.04 + (i * (pre - 0.12)) / pulses, sfx: 'blip' } as Cue))
  if (o.up) {
    moves.push(
      { at: at - pre, dur: pre, actor: 'bot', do: 'flash' },
      { at: at - pre, dur: pre, actor: 'bot', do: 'squash', amount: -0.12 },
      { at, actor: 'cloud', do: 'tint', filter: GOLD },
      { at, dur: o.hold, actor: 'cloud', do: 'flash' },
    )
    fx.push(
      ...zigzag(at, o.hold, ant, belly, w, amp, { id: 'bot', pos: { x: BX, y: PR } }),
      { at: at + 0.02, dur: o.hold, kind: 'burst', x: cloud.x, y: cloud.y + 8, emoji: '⚡', n: 4 + 2 * k, scale: 1 + 0.35 * k },
    )
  } else {
    if (o.lead) moves.push({ at: at - pre, actor: 'bot', do: 'swap', emoji: `hero:bot/${o.lead}` })
    moves.push(
      // 雲一鼓、肚子裡閃光
      { at: at - pre, dur: 0.3, actor: 'cloud', do: 'squash', amount: -0.1 - 0.03 * k },
      { at: at - pre, dur: pre, actor: 'cloud', do: 'flash' },
      // 打中：抖、亮起來
      { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
      { at, actor: 'bot', do: 'tint', filter: GLOW[k] },
      { at, dur: o.hold, actor: 'bot', do: 'shake', amount: 1 + 0.55 * k },
      { at: at + 0.1, dur: o.hold - 0.1, actor: 'bot', do: 'flash' },
      { at: at + o.hold, actor: 'bot', do: 'tint', filter: CHARGED[k + 1] },
    )
    fx.push(
      ...zigzag(at, o.hold, belly, ant, w, amp, { id: 'cloud', pos: cloud }),
      // 身邊冒電火花（一次比一次多、比一次大）
      { at: at + 0.02, dur: o.hold, kind: 'burst', x: 80, y: PR + 2, emoji: '⚡', n: 4 + 2 * k, scale: 1 + 0.35 * k },
    )
  }
  // 預備：天線尖冒小火花
  fx.push({ at: at - pre + 0.08, dur: pre - 0.1, kind: 'burst', x: ant.x, y: ant.y - 1, n: 1, emoji: '✨', scale: 0.6 })
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: 80, y: 45 } },
    { at, dur: 0.35, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  // 全畫面閃白：淡、短
  const lights: Light[] = [{ at, dur: 0.03, level: -0.1 - 0.06 * k }, { at: at + 0.03, dur: 0.12, level: 0 }]
  // 同一個雷聲，一次比一次多疊一個
  cues.push({ at, sfx: 'crack' }, { at: at + 0.04, sfx: 'rumble' })
  if (k >= 1) cues.push({ at: at + 0.1, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.2, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights }
}

// ---- 時間表 ----
/** 第 1 次：小閃電 */
const H1 = 1.4
/** 第 2 次：大閃電 */
const H2 = 3.2
/** 第 3 次：超級閃電（前面停一拍） */
const H3 = 5.5
const HOME = 6.75
const PARK = 7.55
/** 語詞那一刻：烏雲最大、閃電亮著、他舉著天線 */
const WORD = 8.15
/** 回馬槍：雲「噗」沒電了 → 一滴雨「答」→ 換他放電 */
const DRAIN = 9.05
const DRIP = 9.55
const H4 = 10.35
const ASK = 10.9
const AX = 38
const ASK_S = 1.3
const ANSWER = ASK + 2.55
const END = ANSWER + 1.37

/** 第 3 次、語詞那一刻雲鼓大的倍率；沒電時縮成的大小 */
const BIG = 1.25
const TINY = 0.42
/** 縮小的白雲往下垂一點 */
const SMALL: Vec = { x: 80, y: CY + 8 }

const g1 = strike(H1, 0, { hold: 0.45 })
const g2 = strike(H2, 1, { hold: 0.5, lead: 'hug' })
const g3 = strike(H3, 2, { hold: 0.55, pre: 0.6 })
const g4 = strike(H4, 2, { hold: 0.45, pre: 0.35, up: true, cloud: SMALL, ant: ANT_KNOW })
const all = [g1, g2, g3, g4]

/** 超級閃電多的兩道分岔（打到他左右兩邊的地上） */
const forks: Fx[] = [
  ...zigzag(H3, 0.45, { x: 70, y: CY + 12 }, { x: 50, y: 72 }, 1.6, 3.2, { id: 'cloud', pos: C0 }, 5),
  ...zigzag(H3, 0.45, { x: 90, y: CY + 12 }, { x: 110, y: 72 }, 1.6, 3.2, { id: 'cloud', pos: C0 }, 5),
]

const clip: Clip = {
  format: 2,
  char: '雷',
  meta: { theme: '陰天打雷，閃電打中小機器人的天線幫他充飽電', cast: '小機器人＋大烏雲', gags: ['一朵大烏雲飄到小機器人頭上，雲裡「滋滋」閃兩下，「轟隆！」一道粗黃閃電直直打中他的天線，他全身抖抖抖、整個人亮起來像被充了電，一次比一次強（小閃電：嚇一跳然後開心原地跳→大閃電：張開手迎接，充完電快得原地來回衝→停一拍：他招手「再來再來」、踮腳舉高天線，雲鼓得特別大，超級閃電把他充得亮得像太陽、在畫面上咻咻咻衝來衝去）；回馬槍是他還要，雲卻「噗」地縮成一小朵白雲沒電了、只擠出一滴雨滴在他頭上，換他用天線把同一道閃電往上打回去，把小雲充成金色、又鼓回來'] },
  duration: END,
  // 陰陰的傍晚：灰藍的天空，深灰的烏雲（白描邊）、黃白的閃電、橘色發亮的他都跳得出來
  bg: { top: '#6F7FA3', bottom: '#B4BED2', floor: '#8FB07A', scenery: 'hills' },
  actors: [
    { id: 'bot', emoji: 'hero:bot/walk', x: BX, y: PR, size: S, flip: true, hidden: true },
    // 烏雲畫在他前面（閃電是效果，畫在最上面）
    { id: 'cloud', emoji: 'prop:smoke', x: 205, y: CY, size: CS, float: true, tint: DARK },
    { id: 'drop', emoji: '💧', x: 80, y: SMALL.y + 9, size: 8, float: true, hidden: true },
  ],
  moves: [
    { at: 0, dur: 0.01, actor: 'cloud', do: 'stretchTo', amount: CW },
    // 他走進來；一朵大烏雲從右邊飄過來，停在他正上方——他指著它
    { at: 0, dur: 0.5, actor: 'bot', do: 'enter', from: { x: -30, y: PR }, ease: 'out' },
    { at: 0.15, dur: 0.75, actor: 'cloud', do: 'moveTo', to: C0, ease: 'out' },
    { at: 0.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 0.62, dur: 0.25, actor: 'bot', do: 'hop', amount: 2 },
    // 第 1 次：小閃電——嚇一跳，然後開心地原地跳
    ...g1.moves,
    { at: H1 + 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: H1 + 0.5, dur: 0.25, actor: 'bot', do: 'hop', amount: 3.5 },
    { at: H1 + 0.8, dur: 0.25, actor: 'bot', do: 'hop', amount: 3.5 },
    // 雲飄到旁邊，再飄回他正上方
    { at: H1 + 0.55, dur: 0.3, actor: 'cloud', do: 'moveTo', to: AWAY, ease: 'inOut' },
    { at: H2 - 0.85, dur: 0.33, actor: 'cloud', do: 'moveTo', to: C0, ease: 'back' },
    // 第 2 次：大閃電——他張開手迎接；充完電快得原地來回衝
    ...g2.moves,
    { at: H2 + 0.5, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: H2 + 0.52, dur: 0.14, actor: 'bot', do: 'moveTo', to: { x: 108, y: PR }, ease: 'out' },
    { at: H2 + 0.66, actor: 'bot', do: 'flip' },
    { at: H2 + 0.66, dur: 0.17, actor: 'bot', do: 'moveTo', to: { x: 58, y: PR }, ease: 'inOut' },
    { at: H2 + 0.83, actor: 'bot', do: 'flip' },
    { at: H2 + 0.83, dur: 0.14, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR }, ease: 'out' },
    { at: H2 + 0.55, dur: 0.3, actor: 'cloud', do: 'moveTo', to: AWAY, ease: 'inOut' },
    // 第 3 次前停一拍：他對著雲招手「再來再來」，雲飄回來、鼓得特別大；他踮腳把天線舉高
    { at: H2 + 1.0, actor: 'bot', do: 'swap', emoji: 'hero:bot/wave' },
    { at: H2 + 1.05, dur: 0.22, actor: 'bot', do: 'hop', amount: 2.5 },
    { at: H2 + 1.3, dur: 0.22, actor: 'bot', do: 'hop', amount: 2.5 },
    { at: H2 + 1.15, dur: 0.35, actor: 'cloud', do: 'moveTo', to: C0, ease: 'out' },
    { at: H2 + 1.4, dur: 0.35, actor: 'cloud', do: 'scaleTo', amount: BIG, ease: 'back' },
    { at: H3 - 0.68, actor: 'bot', do: 'swap', emoji: 'hero:bot/know' },
    { at: H3 - 0.6, dur: 0.6, actor: 'bot', do: 'squash', amount: -0.14 },
    ...g3.moves,
    // 亮得像一顆太陽，在畫面上咻咻咻衝來衝去，最後停在右邊
    { at: H3 + 0.55, actor: 'bot', do: 'tint', filter: GLOW[2] },
    { at: H3 + 0.55, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: H3 + 0.56, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: 140, y: PR }, ease: 'in' },
    { at: H3 + 0.71, actor: 'bot', do: 'flip' },
    { at: H3 + 0.71, dur: 0.17, actor: 'bot', do: 'moveTo', to: { x: 24, y: PR }, ease: 'linear' },
    { at: H3 + 0.88, actor: 'bot', do: 'flip' },
    { at: H3 + 0.88, dur: 0.17, actor: 'bot', do: 'moveTo', to: { x: 134, y: PR }, ease: 'out' },
    { at: H3 + 1.07, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: H3 + 1.07, actor: 'bot', do: 'flip' },
    { at: H3 + 1.07, actor: 'bot', do: 'tint', filter: CHARGED[3] },
    // 雲縮回來、讓到右上，國字要到正中央
    { at: H3 + 0.6, dur: 0.3, actor: 'cloud', do: 'scaleTo', amount: 1 / BIG },
    { at: H3 + 0.8, dur: 0.4, actor: 'cloud', do: 'moveTo', to: { x: 142, y: CY - 2 }, ease: 'inOut' },
    { at: HOME + 0.1, dur: 0.3, actor: 'bot', do: 'hop', amount: 4 },
    // 語詞那一刻：他走回中間、舉高天線；烏雲回到正上方、鼓到最大，閃電亮著
    { at: PARK, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: PARK + 0.02, dur: 0.33, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR } },
    { at: PARK + 0.37, actor: 'bot', do: 'flip' },
    { at: PARK + 0.37, actor: 'bot', do: 'swap', emoji: 'hero:bot/know' },
    // 等國字讓到左上角再回來，不從字前面飄過
    { at: PARK + 0.2, dur: 0.3, actor: 'cloud', do: 'moveTo', to: C0, ease: 'out' },
    { at: PARK + 0.35, dur: 0.25, actor: 'cloud', do: 'scaleTo', amount: BIG, ease: 'back' },
    { at: WORD - 0.05, actor: 'bot', do: 'tint', filter: GLOW[1] },
    { at: WORD - 0.05, dur: 0.65, actor: 'bot', do: 'shake', amount: 0.9 },
    { at: WORD + 0.6, actor: 'bot', do: 'tint', filter: CHARGED[3] },
    // 回馬槍：他還要！雲「滋…」一下——「噗」地縮成小小一朵白雲，沒電了
    { at: WORD + 0.65, dur: 0.22, actor: 'bot', do: 'hop', amount: 3 },
    { at: DRAIN - 0.25, dur: 0.22, actor: 'cloud', do: 'shake', amount: 1 },
    { at: DRAIN, actor: 'cloud', do: 'tint', filter: '' },
    { at: DRAIN, dur: 0.22, actor: 'cloud', do: 'scaleTo', amount: TINY / BIG, ease: 'in' },
    { at: DRAIN, dur: 0.3, actor: 'cloud', do: 'moveTo', to: SMALL, ease: 'out' },
    { at: DRAIN + 0.12, actor: 'bot', do: 'swap', emoji: 'hero:bot/ponder' },
    // 只擠出一滴雨，「答」滴在他頭上——他愣住
    { at: DRIP - 0.32, dur: 0.15, actor: 'cloud', do: 'squash', amount: 0.25 },
    { at: DRIP - 0.25, dur: 0.08, actor: 'drop', do: 'pop' },
    { at: DRIP - 0.2, dur: 0.2, actor: 'drop', do: 'moveTo', to: { x: 81, y: PR - 0.4 * S + 1 }, ease: 'in' },
    { at: DRIP, dur: 0.04, actor: 'drop', do: 'vanish' },
    { at: DRIP, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    // 換他了：舉高天線，天線「滋滋」——轟隆！閃電往上打中小白雲，雲亮成金色、鼓回來，開心地彈
    { at: H4 - 0.35, actor: 'bot', do: 'swap', emoji: 'hero:bot/know' },
    ...g4.moves,
    { at: H4 + 0.03, dur: 0.3, actor: 'cloud', do: 'scaleTo', amount: 1 / TINY, ease: 'back' },
    { at: H4 + 0.03, dur: 0.3, actor: 'cloud', do: 'moveTo', to: C0, ease: 'out' },
    { at: H4 + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: H4 + 0.3, dur: 0.25, actor: 'bot', do: 'hop', amount: 3 },
    // 問他：他走到左前方、變大；金色的小雲跟著他，停在他頭上
    { at: ASK, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: ASK, actor: 'bot', do: 'flip' },
    { at: ASK, dur: 0.35, actor: 'bot', do: 'moveTo', to: { x: AX, y: PR - 1 }, ease: 'out' },
    // 小雲等國字離開左上角的字框才跟過去
    { at: ASK + 0.3, dur: 0.35, actor: 'cloud', do: 'moveTo', to: { x: AX - 2, y: 6 }, ease: 'out' },
    { at: ASK, dur: 0.35, actor: 'cloud', do: 'scaleTo', amount: 0.55 },
    { at: ASK + 0.35, actor: 'bot', do: 'flip' },
    { at: ASK + 0.35, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: ASK + 0.35, dur: 0.3, actor: 'bot', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: ASK + 1.65, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
    { at: ASK + 2.15, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ANSWER, dur: 0.3, actor: 'bot', do: 'hop', amount: 7 },
    { at: ANSWER, dur: 0.3, actor: 'cloud', do: 'hop', amount: 2 },
    // 退場：他往左跑出去，小雲跟著他，畫面只留下字
    { at: ANSWER + 0.15, actor: 'bot', do: 'flip' },
    { at: ANSWER + 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ANSWER + 0.15, dur: 0.2, actor: 'bot', do: 'moveTo', to: { x: -45, y: PR - 1 }, ease: 'in' },
    { at: ANSWER + 0.15, dur: 0.2, actor: 'cloud', do: 'moveTo', to: { x: -45, y: 6 }, ease: 'in' },
  ],
  builds: [
    // 小閃電：雨的外框從烏雲飛出來
    { at: H1 + 0.1, dur: 0.5, strokes: [0, 1, 2, 3], from: 'cloud', color: partColor('雨') },
    // 大閃電：四點雨滴從烏雲飛出來
    { at: H2 + 0.1, dur: 0.5, strokes: [4, 5, 6, 7], from: 'cloud', color: partColor('雨') },
    // 超級閃電：田從閃電打中天線的地方飛出來
    { at: H3 + 0.1, dur: 0.5, strokes: [8, 9, 10, 11, 12], from: ANT, color: partColor('田') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bot', 'cloud'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.85, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    ...forks,
    // 語詞那一刻：閃電亮著
    ...zigzag(WORD - 0.05, 0.65, BELLY, ANT_KNOW, 4.3, 5.8, { id: 'cloud', pos: C0 }),
    { at: WORD, dur: 0.55, kind: 'burst', x: 80, y: PR + 2, emoji: '⚡', n: 8, scale: 1.5 },
    // 雲「噗」地洩氣
    { at: DRAIN, dur: 0.4, kind: 'burst', x: 80, y: CY + 14, emoji: '💨', n: 6, scale: 1.3 },
    // 「答」
    { at: DRIP, dur: 0.4, kind: 'burst', x: 81, y: PR - 0.4 * S, emoji: '💦', n: 4, scale: 0.9 },
    // 雲充到電：亮晶晶
    { at: H4 + 0.25, dur: 0.5, kind: 'burst', x: 80, y: CY + 8, emoji: '✨', n: 8, scale: 1.5 },
  ],
  camera: [
    // 鏡頭鎖全景（烏雲、閃電、天線整條都要在畫面裡），只有轟隆的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: WORD - 0.05, dur: 0.3, do: 'shake', amount: 1 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: WORD - 0.05, dur: 0.03, level: -0.2 },
    { at: WORD - 0.02, dur: 0.2, level: 0 },
  ],
  cues: [
    { at: 0.2, sfx: 'whoosh' },
    { at: 0.75, say: '雷' },
    ...all.flatMap((g) => g.cues),
    { at: H1 + 0.5, sfx: 'boing' },
    { at: H2 + 0.52, sfx: 'whoosh' },
    { at: H2 + 0.66, sfx: 'whoosh' },
    { at: H3 + 0.56, sfx: 'whoosh' },
    { at: H3 + 0.71, sfx: 'whoosh' },
    { at: H3 + 0.88, sfx: 'whoosh' },
    { at: HOME + 0.05, say: '雷' },
    { at: WORD - 0.05, sfx: 'crack' },
    { at: WORD, sfx: 'rumble' },
    { at: WORD + 0.05, say: '打雷' },
    { at: DRAIN - 0.25, sfx: 'blip' },
    { at: DRAIN, sfx: 'deflate' },
    { at: DRIP, sfx: 'plop' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '雷' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
