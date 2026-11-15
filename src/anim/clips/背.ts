import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 背（v2）：一本正經的狗狗警長站崗，調皮的猴子偷偷貼在他背後學他、壞笑。警長覺得背後怪怪的，猛然轉身——
// 猴子同一刻「咻」地從他頭上翻到另一邊，永遠貼在他背後，他只看到空氣、傻眼。同一個笑點四次，只有轉得越來越誇張：
// 轉一次（北的左半從警長背上飛出來）→ 連轉三次轉到頭暈坐地（北的右半從猴子背上飛出來）→ 先停一拍：他假裝吹哨子沒事、眼睛偷瞄後面……
// 跳起來在空中連轉五次，猴子還是黏在背後，摔扁（月＝身體，從他摔扁的身體飛出來）。
// 字拼好放大時，警長和猴子在字旁邊背對背站好（北本來就是兩個人背對背），左邊的人對北的左半、右邊的人對右半各亮一下。
// 語詞：警長在正中間背對我們回頭看，猴子從他背後探出頭（背後）。
// 回馬槍：他想到辦法拿出鏡子往前一照——鏡子裡就是背後的猴子！這次他真的看到了，嚇得跳最高、飛出畫面，鏡子也翻倒。
// 最後畫面暗下來只剩「背」，警長從天上掉到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「背！」，然後退場只留字。
// 背、背、背後、這是什麼字？、背
const SS = 30
const P = 77 - 0.42 * SS // 警長站在地上的 y
const MS = 27
const MY = 77 - 0.42 * MS // 猴子
/** 前三次都站在同一個地方（字框左下方，跳起來也不擋字框） */
const SX = 50
/** 猴子貼在背後：離警長這麼遠（畫在警長後面，被他的背蓋住一點點） */
const BK = 13
/** 猴子在哪裡：警長朝右（right）時背在左邊 */
const behind = (right: boolean, x = SX) => (right ? x - BK : x + BK)
/** 轉身以後傻眼停多久 */
const HOLD = 0.45
/** 第 3 次跳起來：從 JUMP0 起跳、JUMP_D 秒落地、最高 JUMP_H（猴子用 moveTo 跟著同一條拋物線） */
const JUMP0 = 5.9, JUMP_D = 0.9, JUMP_H = 24
const jumpAt = (t: number) => { const p = Math.min(1, Math.max(0, (t - JUMP0) / JUMP_D)); return 4 * JUMP_H * p * (1 - p) }
/** 國字在正中央時，北的左半、右半的中心（hanzi-writer 座標換算） */
const G_L = { x: 65.7, y: 29.5 }
const G_R = { x: 91, y: 27 }
/** 字放大時兩個人背對背站在字的右邊：警長朝左（左邊那個人）、猴子朝右（右邊那個人） */
const PAIR_S = 124
const PAIR_M = 141
/** 鏡子（prop:mirror）與鏡子裡的猴子 */
const MIR = { x: 30, size: 38 }
const MIR_Y = 77 - 0.42 * MIR.size
const SX4 = 52

/**
 * 「猛然轉身」：預備（身體往後縮）→ 轉身 n 次（flip），每轉一次猴子就同一刻「咻」地從他頭上翻到另一邊、跟著轉向，永遠在他背後；
 * 轉完他面前只有空氣：傻眼停 HOLD 秒，頭上一個大 ❓，鏡頭推近＋震，同一個音效（咻）＋一次比一次多疊一個音。
 * right 是轉之前他朝不朝右；回傳轉完以後的朝向。air 是第 3 次在空中轉（猴子不用跳，跟著他一起在空中）。
 */
function turn(at: number, k: number, n: number, right: boolean, gap = 0.14, air = false) {
  const moves: Move[] = [
    // 預備：身體往後縮一下
    { at: at - 0.25, actor: 'sheriff', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: at - 0.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
  ]
  const fx: Fx[] = []
  const cues: Cue[] = []
  let r = right
  for (let i = 0; i < n; i++) {
    const t = at + i * gap
    r = !r
    moves.push(
      { at: t, actor: 'sheriff', do: 'flip' },
      { at: t, actor: 'monkey', do: 'flip' },
      { at: t, actor: 'monkey', do: 'moveTo', to: { x: behind(r), y: MY - (air ? jumpAt(t + gap * 0.9) : 0) }, ...(air ? {} : { arc: 9 }), dur: Math.min(0.18, gap * 0.9), ease: air ? 'linear' : 'inOut' },
    )
    fx.push({ at: t, kind: 'swoosh', actor: 'sheriff', target: 'monkey', dy: 4, n: 12, sweep: 200, dur: 0.22, width: 1.8, scale: 1 + 0.1 * k })
    cues.push({ at: t, sfx: 'whoosh' })
  }
  const te = at + (n - 1) * gap + 0.06
  // 他面前（朝向那一側）只有空氣
  const front = r ? SX + 15 : SX - 15
  moves.push(
    { at: te, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: te, actor: 'sheriff', do: 'squash', amount: 0.2 + 0.08 * k, dur: 0.25 },
    // 猴子在背後偷笑
    { at: te + 0.15, actor: 'monkey', do: 'hop', amount: 2.5, dur: 0.2 },
    { at: te + 0.4, actor: 'monkey', do: 'hop', amount: 2.5, dur: 0.2 },
  )
  fx.push(
    { at: te, kind: 'pop', actor: 'sheriff', emoji: '❓', dx: r ? 6 : -6, dur: HOLD + 0.25, scale: 1.4 + 0.3 * k },
    { at: te, kind: 'puff', x: front, y: P - 4, dur: 0.4, scale: 1.2 + 0.2 * k },
  )
  const camera: Camera[] = [
    { at: te, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: SX, y: P - 10 } },
    { at: te, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  ]
  cues.push({ at: te, sfx: 'boing' })
  if (k >= 1) cues.push({ at: te + 0.04, sfx: 'tap' })
  if (k >= 2) cues.push({ at: te + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues, te, right: r }
}

const H1 = 2.0, H2 = 3.8, H3 = 6.0
const s1 = turn(H1, 0, 1, true)
const s2 = turn(H2, 1, 3, s1.right, 0.15)
const s3 = turn(H3, 2, 5, s2.right, 0.12, true)
/** 第 3 次在空中轉完摔下來 */
const LAND3 = 6.85
const HOME = 7.5
const PARK = 8.5
const WORD = 8.9
/** 回馬槍：鏡子裡看到猴子那一刻 */
const H4 = 10.0
const ASK = 10.75
const ANSWER = 13.5

const clip: Clip = {
  format: 2,
  char: '背',
  meta: { theme: '猴子貼在警長背後', cast: '狗狗警長＋猴子＋鏡子', gags: ['猴子貼在警長背後，警長每次猛然轉身，猴子就跟著翻到另一邊、永遠在他背後，他只看到空氣，一次轉得比一次多（轉一次→轉三次轉到頭暈→跳起來在空中轉五次摔扁）；回馬槍是他拿鏡子往前一照，終於看到背後的猴子，嚇得跳最高飛出畫面'] },
  duration: 15,
  bg: { top: '#FFE9C7', bottom: '#FFF8EA', floor: '#D8C08C', scenery: 'desert' },
  actors: [
    { id: 'mirror', emoji: 'prop:mirror', x: MIR.x, y: MIR_Y, size: MIR.size, hidden: true },
    // 鏡子裡的猴子（畫在鏡子上面）
    { id: 'refl', emoji: 'prop:monkey', x: MIR.x + 1, y: MIR_Y - 5, size: 14, hidden: true, flip: true, float: true },
    // 猴子畫在警長後面：躲在他的背後
    { id: 'monkey', emoji: 'prop:monkey', x: behind(true), y: MY, size: MS, hidden: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: P, size: SS, hidden: true, flip: true },
  ],
  moves: [
    // 警長巡邏走進來，抬頭指著字框：背！
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.55, ease: 'out' },
    { at: 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    // 猴子踮腳跟進來，貼在他背後
    { at: 0.45, actor: 'monkey', do: 'enter', from: { x: -30, y: MY }, dur: 0.6, ease: 'out' },
    ...[0.5, 0.68, 0.86].map((at): Move => ({ at, actor: 'monkey', do: 'hop', amount: 1.5, dur: 0.15 })),
    // 猴子在他背後學他、扭來扭去；他覺得背後怪怪的
    { at: 1.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: 1.3, actor: 'monkey', do: 'tilt', amount: 12, dur: 0.35 },
    { at: 1.35, actor: 'monkey', do: 'hop', amount: 3, dur: 0.2 },
    // 第 1 次：猛然轉身——猴子翻到另一邊，他只看到空氣
    ...s1.moves,
    { at: s1.te + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: s1.te + HOLD + 0.1, actor: 'sheriff', do: 'tilt', amount: -6, dur: 0.4 },
    // 第 2 次：越想越怪，氣得跺腳——連轉三次，轉到頭暈坐地
    { at: 3.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/stomp' },
    { at: 3.05, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.18 },
    { at: 3.3, actor: 'monkey', do: 'tilt', amount: -12, dur: 0.35 },
    ...s2.moves,
    { at: s2.te + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: s2.te + HOLD, actor: 'monkey', do: 'tilt', amount: 10, dur: 0.5 },
    // 第 3 次前停一拍：站起來假裝吹哨子沒事，眼睛偷偷瞄後面；猴子在背後扭屁股
    { at: 5.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 5.15, actor: 'monkey', do: 'tilt', amount: 14, dur: 0.3 },
    { at: 5.45, actor: 'monkey', do: 'tilt', amount: -14, dur: 0.3 },
    { at: 5.5, actor: 'sheriff', do: 'tilt', amount: -5, dur: 0.3 },
    // ……跳起來在空中連轉五次，猴子也跟著跳、一直黏在背後
    { at: JUMP0, actor: 'sheriff', do: 'hop', amount: JUMP_H, dur: JUMP_D },
    // 猴子也跟著跳（起跳時一起往上，最後一轉以後跟著落地）
    { at: JUMP0, actor: 'monkey', do: 'moveTo', to: { x: behind(true), y: MY - jumpAt(H3) }, dur: H3 - JUMP0, ease: 'linear' },
    { at: H3 + 4 * 0.12 + 0.11, actor: 'monkey', do: 'moveTo', to: { x: behind(false), y: MY }, dur: JUMP0 + JUMP_D - (H3 + 4 * 0.12 + 0.11), ease: 'in' },
    ...s3.moves.filter((m) => !(m.actor === 'sheriff' && m.do === 'squash' && m.at > H3)),
    { at: JUMP0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    // 摔扁（月＝身體，從他身上飛出來）
    { at: LAND3 - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 爬起來，兩個人走到字的右邊、背對背站好（警長朝左、猴子朝右）
    { at: 7.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 7.1, actor: 'sheriff', do: 'moveTo', to: { x: PAIR_S, y: P }, dur: 0.38 },
    { at: 7.1, actor: 'monkey', do: 'moveTo', to: { x: PAIR_M, y: MY }, dur: 0.38 },
    { at: 7.1, actor: 'monkey', do: 'flip' },
    { at: 7.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 背碰背「咚」一下
    { at: 7.6, actor: 'sheriff', do: 'moveTo', to: { x: PAIR_S + 1.5, y: P }, dur: 0.1 },
    { at: 7.6, actor: 'monkey', do: 'moveTo', to: { x: PAIR_M - 1.5, y: MY }, dur: 0.1 },
    // 國字放大：左邊的人對北的左半、右邊的人對右半，各亮一下
    { at: 7.95, actor: 'sheriff', do: 'flash', dur: 0.4 },
    { at: 8.2, actor: 'monkey', do: 'flash', dur: 0.4 },
    // 語詞那一刻：警長走到正中間背對我們回頭看，猴子從他背後探出頭
    { at: PARK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: PARK, actor: 'sheriff', do: 'moveTo', to: { x: 74, y: P }, dur: 0.35 },
    { at: PARK, actor: 'monkey', do: 'flip' },
    { at: PARK, actor: 'monkey', do: 'moveTo', to: { x: 74 + BK * 1.25, y: MY }, dur: 0.35 },
    { at: PARK, actor: 'sheriff', do: 'scaleTo', amount: 1.25, dur: 0.35 },
    { at: PARK, actor: 'monkey', do: 'scaleTo', amount: 1.2, dur: 0.35 },
    { at: WORD - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/back' },
    { at: WORD - 0.05, actor: 'sheriff', do: 'flip' },
    { at: WORD + 0.05, actor: 'monkey', do: 'hop', amount: 4, dur: 0.25 },
    { at: WORD + 0.05, actor: 'monkey', do: 'tilt', amount: -10, dur: 0.4 },
    // 回馬槍（第 4 次）：想到辦法！拿出鏡子往前一照
    { at: 9.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/know' },
    { at: 9.35, actor: 'sheriff', do: 'flip' },
    { at: 9.4, actor: 'mirror', do: 'enter', from: { x: -20, y: MIR_Y }, dur: 0.3, ease: 'out' },
    { at: 9.45, actor: 'sheriff', do: 'moveTo', to: { x: SX4, y: P }, dur: 0.3 },
    { at: 9.45, actor: 'sheriff', do: 'scaleTo', amount: 1 / 1.25, dur: 0.3 },
    { at: 9.45, actor: 'monkey', do: 'scaleTo', amount: 1 / 1.2, dur: 0.3 },
    { at: 9.45, actor: 'monkey', do: 'moveTo', to: { x: SX4 + BK, y: MY }, dur: 0.3 },
    { at: 9.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    // 鏡子裡：就是背後的猴子！
    { at: H4 - 0.1, actor: 'refl', do: 'pop', dur: 0.15 },
    { at: H4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: H4, actor: 'sheriff', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: H4, actor: 'monkey', do: 'hop', amount: 3, dur: 0.2 },
    // 這次真的看到了：嚇得跳最高、飛出畫面；鏡子翻倒
    { at: H4 + 0.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: H4 + 0.35, actor: 'sheriff', do: 'moveTo', to: { x: SX4 - 6, y: -60 }, dur: 0.3, ease: 'out' },
    { at: H4 + 0.35, actor: 'sheriff', do: 'spin', times: -3, dur: 0.3, pivot: 'center' },
    { at: H4 + 0.35, actor: 'refl', do: 'vanish', dur: 0.05 },
    { at: H4 + 0.35, actor: 'mirror', do: 'rotateTo', amount: -90, dur: 0.25, ease: 'in' },
    { at: H4 + 0.6, actor: 'mirror', do: 'moveTo', to: { x: -40, y: MIR_Y }, dur: 0.3, ease: 'in' },
    // 猴子笑翻、跳出右邊
    { at: H4 + 0.45, actor: 'monkey', do: 'flip' },
    { at: H4 + 0.45, actor: 'monkey', do: 'moveTo', to: { x: 200, y: MY }, arc: 8, dur: 0.35, ease: 'in' },
    // 問他：警長從天上掉到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'flip' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: ASK + 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.5, dur: 0.01 },
    { at: ASK + 0.1, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.0, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 8, dur: 0.2 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 第 1 次：北的左半（朝左的那個人）從警長背上飛出來
    { at: s1.te + 0.1, dur: 0.5, strokes: [0, 1, 2], from: 'sheriff', color: partColor('北') },
    // 第 2 次：北的右半（朝右的那個人）從猴子背上飛出來
    { at: s2.te + 0.1, dur: 0.45, strokes: [3, 4], from: 'monkey', color: partColor('北') },
    // 第 3 次：月（肉月＝身體）從摔扁的警長身上飛出來
    { at: LAND3, dur: 0.5, strokes: [5, 6, 7, 8], from: 'sheriff', color: partColor('⺼') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 覺得背後怪怪的
    { at: 1.3, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: -8, dur: 0.55, scale: 1.4 },
    ...s1.fx,
    ...s2.fx,
    { at: s2.te + HOLD + 0.05, kind: 'dizzy', actor: 'sheriff', dur: 0.6 },
    // 第 3 次前停一拍：吹哨子假裝沒事，眼睛偷瞄、冒汗
    { at: 5.4, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: 8, dur: 0.5, scale: 1.5 },
    { at: 5.55, kind: 'sweat', actor: 'sheriff' },
    ...s3.fx,
    { at: LAND3, kind: 'burst', x: SX, y: P - 6, n: 1, dur: 0.4, scale: 2 },
    { at: LAND3 + 0.1, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    // 兩個人背對背＝北：一對一對亮一下
    { at: 7.95, kind: 'burst', ...G_L, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    { at: 7.95, kind: 'burst', actor: 'sheriff', emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    { at: 8.2, kind: 'burst', ...G_R, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    { at: 8.2, kind: 'burst', actor: 'monkey', emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    // 背後：他背對我們，猴子從背後探出頭
    { at: WORD, kind: 'burst', x: 79, y: P - 6, emoji: '✨', n: 6, dur: 0.5 },
    // 回馬槍：想到辦法、鏡子裡看到猴子
    { at: 9.35, kind: 'pop', actor: 'sheriff', emoji: '💡', dx: 6, dur: 0.45, scale: 1.3 },
    { at: H4, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: 10, dy: 5, dur: 0.33, scale: 1.8 },
    { at: H4, kind: 'burst', x: MIR.x + 1, y: MIR_Y - 8, emoji: '✨', n: 5, dur: 0.4 },
    { at: H4 + 0.35, kind: 'burst', x: SX4, y: P - 14, n: 1, dur: 0.45, scale: 2.6 },
    { at: H4 + 0.35, kind: 'burst', x: SX4, y: P - 14, emoji: '⭐', n: 8, dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    // 第 3 次跳起來在空中轉：鏡頭留全景
    { at: 5.6, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s3.camera,
    { at: LAND3, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 7.2, dur: 0.3, do: 'zoom', amount: 1 },
    { at: H4 + 0.35, dur: 0.45, do: 'punch', amount: 0.25, to: { x: SX4, y: P - 14 } },
    { at: H4 + 0.35, dur: 0.4, do: 'shake', amount: 2.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: H4 + 0.35, dur: 0.04, level: -0.5 },
    { at: H4 + 0.39, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 0.8, say: '背' },
    { at: 0.5, sfx: 'tap' },
    ...s1.cues,
    { at: 3.05, sfx: 'tap' },
    ...s2.cues,
    { at: 5.0, sfx: 'blip' },
    ...s3.cues,
    { at: LAND3, sfx: 'plop' },
    { at: 7.6, sfx: 'bonk' },
    { at: HOME + 0.1, say: '背' },
    { at: WORD, say: '背後' },
    { at: 9.4, sfx: 'slide' },
    { at: H4, sfx: 'boing' },
    { at: H4 + 0.35, sfx: 'whoosh' },
    { at: H4 + 0.39, sfx: 'tap' },
    { at: H4 + 0.43, sfx: 'bonk' },
    { at: ASK + 0.2, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '背' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
