import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 紅（v2）：紅燈停！最愛跑的兔子女孩站在起跑線，路邊一盞大大的號誌燈。綠燈一亮她就「咻」地全速衝出去——
// 燈「噹！」地亮起大紅燈（整顆大紅、一圈紅光），她得「吱！」立刻定住不動，一次比一次難停、定住的樣子一次比一次好笑：
// 單腳跑到一半定住、搖搖晃晃（糸的上半從紅燈噴出來）；跳到半空中整個人定格、停一拍才「咚」掉下來趴扁（糸的下半）；
// 先停一拍：她蹲著盯著燈，燈故意紅兩下逗她，她衝最快——紅燈一亮，腳定住了、身體往前拉長，「啵ㄧㄛ」彈回起跑線一屁股跌坐（工）。
// 回馬槍：這次她學乖了，紅燈一亮就閉眼站好、乖乖定住——結果燈變綠了她還閉著眼定在原地，
// 後面的忍者小老鼠「咻」地超過她，一路撞上燈柱，把號誌燈撞飛出畫面；她睜開眼睛：燈呢？
// 最後畫面暗下來只剩「紅」，兔子女孩轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「紅！」，然後退場只留字。
// 紅、紅、紅燈、這是什麼字？、紅
const SB = 36 // 兔子女孩
const B = 77 - 0.42 * SB // 她站在地上的 y
const SM = 22 // 小老鼠
const M = 77 - 0.42 * SM
/** 起跑線：她每次從這裡出發 */
const HOME = 28
/** 前兩次、第三次都在同一個地方被紅燈定住 */
const SPOT = 64
/** 號誌燈：燈柱的 x、紅燈與綠燈的中心 y（燈箱是一根粗粗的圓角管子，燈柱插在地上） */
const LX = 128
const RY = 24
const GY = 46
/** 燈箱底、燈柱 */
const BOX_W = 26
const LENS = 19
/** 燈的顏色：亮的紅、亮的綠、熄掉的紅、熄掉的綠 */
const RED = '#FF2414'
const GREEN = '#1FD65C'
const RED_OFF = '#5A2A30'
const GREEN_OFF = '#22402E'
/** 字框：一開始就停在左上角（背後是素色的天空） */
const FRAME = { x: 27, y: 21 }
const FRAME_K = 0.5
/** 號誌燈被撞飛的那一刻（燈的效果畫到這裡為止） */
const FLY = 10.15
const GONE = FLY + 0.67

/** 紅燈亮著的時段（[開始, 結束]）；最後一段一直亮到被撞飛前 */
const REDS: [number, number][] = [[0, 1.3], [2.0, 3.1], [3.95, 5.2], [6.6, 7.25], [8.9, 9.75]]
/** 紅燈「逗她」閃一下（沒有光暈） */
const BLINKS: [number, number][] = [[5.6, 5.75], [5.95, 6.1]]
/** 綠燈亮著的時段 */
const GREENS: [number, number][] = [[1.3, 1.97], [3.1, 3.92], [5.2, 5.58], [5.75, 5.93], [6.1, 6.57], [7.25, 8.87], [9.8, GONE]]

/** 一顆燈的鏡片：一根長度幾乎是 0 的粗管子＝有描邊、有反光點的圓 */
const lens = (at: number, end: number, id: string, color: string): Fx =>
  ({ at, dur: end - at, kind: 'tube', actor: id, dy: 0.01, target: id, color, width: LENS, n: 99 })
/** 紅燈的光暈：一條長度 0 的粗線（引擎自己會在外面畫一圈 2.6 倍大的淡光） */
const glow = (at: number, end: number): Fx =>
  ({ at, dur: end - at, kind: 'line', actor: 'Lr', dy: 0.01, target: 'Lr', color: RED, width: 18 })

const lightFx: Fx[] = [
  // 燈柱、燈箱、兩顆熄掉的燈
  { at: 0, dur: GONE, kind: 'tube', actor: 'Lg', dy: 12, target: 'Lp', color: '#5C6170', width: 4.5, n: 99 },
  { at: 0, dur: GONE, kind: 'tube', actor: 'Lr', target: 'Lg', color: '#2E2F3A', width: BOX_W, n: 99 },
  lens(0, GONE, 'Lr', RED_OFF),
  lens(0, GONE, 'Lg', GREEN_OFF),
  // 亮的燈蓋在上面
  ...REDS.flatMap(([a, b]) => [glow(a, b), lens(a, b, 'Lr', RED)]),
  ...BLINKS.map(([a, b]) => lens(a, b, 'Lr', RED)),
  ...GREENS.map(([a, b]) => lens(a, b, 'Lg', GREEN)),
]

/**
 * 「噹！」紅燈亮起來（那一刻要的東西都在這裡，四次一模一樣）：同一個音效（噹＋吱），鏡頭推近＋震，一次比一次大。
 * 她怎麼定住由呼叫的地方各自寫。
 */
function red(at: number, k: number, to = { x: 92, y: 46 }) {
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.04 * k, to },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'clink' }, { at: at + 0.03, sfx: 'slide' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'tap' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'bonk' })
  const fx: Fx[] = [
    // 紅燈旁邊冒一圈小紅光點（從燈上噴出來），一次比一次大
    { at, kind: 'burst', x: LX, y: RY, emoji: '🔴', n: 6, dur: 0.4, scale: 0.7 + 0.15 * k },
  ]
  return { camera, cues, fx }
}

/** 綠燈「叮」：她蹲低預備 */
const go = (at: number): Cue => ({ at, sfx: 'blip' })

const H1 = 2.0, H2 = 3.95, H3 = 6.6, H4 = 8.9
const r1 = red(H1, 0)
const r2 = red(H2, 1, { x: 88, y: 36 })
const r3 = red(H3, 2)
const r4 = red(H4, 0, { x: 110, y: 44 })
/** 回馬槍：小老鼠撞上燈柱 */
const BONK = FLY

const clip: Clip = {
  format: 2,
  char: '紅',
  meta: { theme: '紅燈停', cast: '兔子女孩＋號誌燈（＋忍者小老鼠）', gags: ['兔子女孩每次全速衝出去，號誌燈就噹地亮大紅燈，她得吱地立刻定住，一次比一次難停（單腳搖晃→半空中定格掉下來→身體往前拉長彈回去）；回馬槍是她學乖了閉眼先定住，燈變綠了她還不動，小老鼠咻地超過她把燈撞飛'] },
  duration: 15,
  bg: { top: '#BFE3FF', bottom: '#EEF8FF', floor: '#C8CDD4', scenery: 'hills' },
  actors: [
    // 號誌燈的錨點（看不見）：紅燈中心、綠燈中心、燈柱底
    { id: 'Lr', emoji: '⭐', x: LX, y: RY, size: 4, hidden: true },
    { id: 'Lg', emoji: '⭐', x: LX, y: GY, size: 4, hidden: true },
    { id: 'Lp', emoji: '⭐', x: LX, y: 74.5, size: 4, hidden: true },
    // 姿勢圖朝左，翻過來面向右邊的號誌燈
    { id: 'bunny', emoji: 'hero:bunny/idle', x: HOME, y: B, size: SB, hidden: true, flip: true },
    { id: 'mouse', emoji: 'hero:mouse/dash', x: -20, y: M, size: SM, hidden: true, flip: true },
  ],
  moves: [
    // 登場：跑到起跑線，抬頭看紅燈
    { at: 0, actor: 'bunny', do: 'enter', from: { x: -25, y: B }, dur: 0.45, ease: 'out' },
    { at: 1.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    // 第 1 次：綠燈！衝——噹！紅燈，跑到一半單腳定住，搖搖晃晃
    { at: 1.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: 1.55, actor: 'bunny', do: 'moveTo', to: { x: SPOT, y: B }, dur: H1 - 1.55, ease: 'linear' },
    { at: H1 + 0.1, actor: 'bunny', do: 'tilt', amount: 9, dur: 0.25 },
    { at: H1 + 0.35, actor: 'bunny', do: 'tilt', amount: -8, dur: 0.25 },
    // 撐不住，氣得跺腳、跳回起跑線
    { at: H1 + 0.65, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/stomp' },
    { at: H1 + 0.65, actor: 'bunny', do: 'hop', amount: 2, dur: 0.2 },
    { at: H1 + 0.8, actor: 'bunny', do: 'moveTo', to: { x: HOME, y: B }, arc: 6, dur: 0.3 },
    { at: 3.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    // 第 2 次：衝、跳——噹！整個人在半空中定格
    { at: 3.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: 3.3, actor: 'bunny', do: 'moveTo', to: { x: 48, y: B }, dur: 0.3, ease: 'in' },
    { at: 3.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: 3.6, actor: 'bunny', do: 'moveTo', to: { x: SPOT, y: 40 }, dur: H2 - 3.6, ease: 'out' },
    { at: H2 + 0.15, actor: 'bunny', do: 'shake', amount: 0.6, dur: 0.4 },
    // 停一拍——「咚」掉下來趴扁
    { at: H2 + 0.6, actor: 'bunny', do: 'moveTo', to: { x: SPOT, y: B }, dur: 0.18, ease: 'in' },
    { at: H2 + 0.78, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    { at: H2 + 1.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/angry' },
    { at: H2 + 1.15, actor: 'bunny', do: 'moveTo', to: { x: HOME, y: B }, arc: 6, dur: 0.3 },
    // 第 3 次：先停一拍——蹲著盯著燈，燈紅兩下逗她，她嚇得抖一下
    { at: 5.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: 5.6, actor: 'bunny', do: 'hop', amount: 2.2, dur: 0.15 },
    { at: 5.95, actor: 'bunny', do: 'hop', amount: 2.2, dur: 0.15 },
    // 衝最快——噹！腳定住了，身體往前拉得長長的，「啵ㄧㄛ」彈回起跑線一屁股跌坐
    { at: 6.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: 6.25, actor: 'bunny', do: 'moveTo', to: { x: SPOT, y: B }, dur: H3 - 6.25, ease: 'linear' },
    { at: H3, actor: 'bunny', do: 'rotateTo', amount: 38, dur: 0.12, ease: 'out' },
    { at: H3, actor: 'bunny', do: 'stretchTo', amount: 0.62, dur: 0.12, ease: 'out' },
    { at: H3 + 0.38, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/slip' },
    { at: H3 + 0.38, actor: 'bunny', do: 'rotateTo', amount: -38, dur: 0.15 },
    { at: H3 + 0.38, actor: 'bunny', do: 'stretchTo', amount: 1 / 0.62, dur: 0.25, ease: 'elastic' },
    { at: H3 + 0.4, actor: 'bunny', do: 'moveTo', to: { x: HOME - 4, y: B }, arc: 12, dur: 0.4, ease: 'out' },
    { at: H3 + 0.8, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' },
    // 國字拼好、回到上方；她爬起來走到燈前面——噹！這次她馬上定住，指著它：紅燈！
    { at: 8.5, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: 8.55, actor: 'bunny', do: 'moveTo', to: { x: 88, y: B }, dur: 0.35 },
    { at: H4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: H4, actor: 'bunny', do: 'squash', amount: -0.12, dur: 0.25 },
    // 回馬槍：她學乖了，閉眼站好先定住——燈變綠了她還不動
    { at: 9.5, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    // 後面的小老鼠「咻」地超過她，一路撞上燈柱
    { at: 9.8, actor: 'mouse', do: 'pop', dur: 0.05 },
    { at: 9.85, actor: 'mouse', do: 'moveTo', to: { x: LX - 8, y: M }, dur: BONK - 9.85, ease: 'linear' },
    { at: BONK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: BONK, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.2 },
    // 號誌燈被撞飛出畫面（三個錨點一起飛，燈箱、燈柱跟著走）
    ...(['Lr', 'Lg', 'Lp'] as const).map((id): Move => {
      const y0 = id === 'Lr' ? RY : id === 'Lg' ? GY : 74.5
      return { at: BONK + 0.02, actor: id, do: 'moveTo', to: { x: LX + 30, y: y0 - 105 }, arc: 8, dur: 0.65, ease: 'in' }
    }),
    // 小老鼠暈頭轉向地跑走
    { at: BONK + 0.3, actor: 'mouse', do: 'moveTo', to: { x: 190, y: M }, dur: 0.3, ease: 'in' },
    // 她睜開眼睛：燈呢？
    { at: 10.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: 10.4, actor: 'bunny', do: 'hop', amount: 3, dur: 0.25 },
    // 問他：她走到右前方、變大，轉向左邊的字
    { at: 10.9, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: 10.9, actor: 'bunny', do: 'flip' },
    { at: 10.9, actor: 'bunny', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 10.9, actor: 'bunny', do: 'moveTo', to: { x: 120, y: B + 2 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.0, actor: 'bunny', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: 12.6, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.25 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'bunny', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: 13.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 13.45, actor: 'bunny', do: 'hop', amount: 6, dur: 0.25 },
    // 退場，畫面只留下字
    { at: 13.7, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: 13.7, actor: 'bunny', do: 'flip' },
    { at: 13.72, actor: 'bunny', do: 'moveTo', to: { x: 200, y: B + 2 }, dur: 0.24, ease: 'in' },
  ],
  builds: [
    // 每次紅燈「噹」地亮，筆畫從紅燈上噴出來：糸的上半、糸的下半、工
    { at: H1 + 0.45, dur: 0.55, strokes: [0, 1, 2], from: 'Lr', color: partColor('糸') },
    { at: H2 + 0.6, dur: 0.55, strokes: [3, 4, 5], from: 'Lr', color: partColor('糸') },
    { at: H3 + 0.3, dur: 0.55, strokes: [6, 7, 8], from: 'Lr', color: partColor('工') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: 7.4, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.35, dur: 0.4, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點（從左上角過來，不經過她），右前方讓給變大的兔子女孩
    { at: 10.85, dur: 3.15, do: 'ask', keep: ['bunny'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: 10.9, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...lightFx,
    ...r1.fx,
    { at: H1 + 0.15, kind: 'sweat', actor: 'bunny' },
    ...r2.fx,
    { at: H2 + 0.15, kind: 'sweat', actor: 'bunny' },
    ...r3.fx,
    { at: H3 + 0.85, kind: 'dizzy', actor: 'bunny', dur: 0.6 },
    ...r4.fx,
    // 撞上燈柱
    { at: BONK, kind: 'burst', x: LX - 2, y: 56, n: 1, dur: 0.35, scale: 1.6 },
    { at: 13.45, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 整支用手寫的取景（自動取景會只推近她、把號誌燈切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.04, to: { x: 82, y: 45 } },
    ...r1.camera,
    ...r2.camera,
    ...r3.camera,
    { at: H3 + 0.8, dur: 0.3, do: 'shake', amount: 1.2 },
    // 國字回中央放大時退回全景（號誌燈整個留在字的右邊）
    { at: 7.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    // 語詞那一刻：推近她和紅燈
    { at: 8.6, dur: 0.4, do: 'zoom', amount: 1.12, to: { x: 110, y: 46 } },
    ...r4.camera,
    { at: 9.75, dur: 0.3, do: 'zoom', amount: 1.04, to: { x: 82, y: 45 } },
    { at: BONK, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [],
  cues: [
    { at: 0.05, sfx: 'whoosh' },
    { at: 0.7, say: '紅' },
    go(1.3),
    { at: 1.55, sfx: 'whoosh' },
    ...r1.cues,
    { at: H1 + 0.8, sfx: 'boing' },
    go(3.1),
    { at: 3.3, sfx: 'whoosh' },
    ...r2.cues,
    { at: H2 + 0.78, sfx: 'plop' },
    go(5.2),
    { at: 5.6, sfx: 'tap' },
    { at: 5.95, sfx: 'tap' },
    { at: 6.25, sfx: 'whoosh' },
    ...r3.cues,
    { at: H3 + 0.38, sfx: 'boing' },
    { at: 7.55, say: '紅' },
    ...r4.cues,
    { at: 9.05, say: '紅燈' },
    go(9.8),
    { at: 9.85, sfx: 'whoosh' },
    { at: BONK, sfx: 'bonk' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '紅' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
