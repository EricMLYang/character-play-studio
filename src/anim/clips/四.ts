import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 四（v2）：楊捷睿坐著握方向盤要開車，可是輪子不夠。每次一個輪子咕嚕咕嚕滾進來、「喀」裝到他屁股底下，他喊「出發！噗噗——」，
// 車頭就往沒有輪子的那邊一栽、「咚」把他摔出去，一次比一次遠：一個輪子，原地栽個跟斗趴扁 → 兩個，翻一圈飛出去跌坐 → 三個，冒汗想一想還是出發，飛最遠趴扁頭暈。
// 每摔一次掉出一組筆畫：框的左上、裡面的儿（從翹起來的兩條腿）、框底下封口。第四個輪子滾進來，四個輪子排成四方形（語詞「四方形」），
// 他坐上去再喊出發——這次車頭沒栽，四個輪子自己「咻」地排成一排開走了，他一屁股摔在原地。
// 四、四、四方形、這是什麼字？、四
const YS = 40
const P = 77 - 0.42 * YS // 楊捷睿（size 40）坐在地上的 y
/** 坐在輪子上的 y（屁股在輪子上半） */
const SEAT = 49
/** 車子停的地方（偏右：國字放大到正中央時不擋字） */
const KX = 127
/** 輪子（size 16）在地上的 y */
const WS = 13
const WY = 77 - 0.42 * WS
/** 一排輪子的位置：從車尾（右）往車頭（左）一個一個裝，中間留縫，一眼數得出幾個 */
const SLOT = [142, 127, 112]
/** 只有後面有輪子，車頭就往下垂：裝了幾個輪子時身體歪幾度 */
const TILT = [-8, -5, -3]
/** 四方形：兩排兩個，互不重疊 */
const SQ = { x: 80, back: WY - 16 }
const SQ_POS: Record<string, { x: number; y: number }> = {
  w1: { x: SQ.x + 9.5, y: SQ.back },
  w2: { x: SQ.x - 9.5, y: SQ.back },
  w3: { x: SQ.x - 9.5, y: WY },
  w4: { x: SQ.x + 9.5, y: WY },
}
/** 回馬槍：四個輪子從四方形跳回一排，排在右邊（他坐上去頭不碰到上面的國字） */
const ROW4 = [145, 130, 115, 100]
const KX4 = 123
const WHEELS = ['w1', 'w2', 'w3', 'w4']

/** 一個輪子從右邊咕嚕咕嚕滾進來、「喀」地裝到他屁股底下。at 是裝好那一刻 */
function roll(at: number, k: number): { moves: Move[]; cues: Cue[]; fx: Fx[] } {
  const w = WHEELS[k]
  const from = 185
  const dist = from - SLOT[k]
  return {
    moves: [
      { at: at - 0.5, actor: w, do: 'moveTo', to: { x: SLOT[k], y: WY }, dur: 0.45, ease: 'out' },
      { at: at - 0.5, actor: w, do: 'rotateTo', amount: -(dist / (Math.PI * 12)) * 360, dur: 0.45, ease: 'out' },
      // 裝好：他被抬起來一點，車頭往下垂（後面才有輪子）
      { at, actor: 'yang', do: 'moveTo', to: { x: KX, y: SEAT }, dur: 0.12, ease: 'out' },
      { at, actor: 'yang', do: 'rotateTo', amount: TILT[k], dur: 0.15 },
      // 新裝上的那一個彈一下、亮一下：現在有 k+1 個
      { at, actor: w, do: 'hop', amount: 3, dur: 0.22 },
      { at, actor: w, do: 'flash', dur: 0.35 },
    ],
    cues: [{ at: at - 0.5, sfx: 'slide' }, { at, sfx: 'clink' }],
    fx: [],
  }
}

/**
 * 「出發！」：蹲一下、屁股後面噗一團煙、引擎轟轟——車子往前一衝，車頭往沒有輪子的那邊一栽，「咚」把他摔出去。
 * 同一個預備、同一團煙、同一組音效，只有摔得越來越遠。at 是車頭栽到地上那一刻（k 0～2）。
 * k 3（回馬槍）：預備一模一樣，這次車頭沒栽——四個輪子自己咻地開走，他停在半空一拍，一屁股摔下來；at 是輪子開走那一刻。
 */
function go(at: number, k: number) {
  const moves: Move[] = [
    { at: at - 0.5, actor: 'yang', do: 'squash', amount: -0.12, dur: 0.2 },
  ]
  const fx: Fx[] = [
    { at: at - 0.45, kind: 'puff', actor: 'yang', dx: 16, dy: 14, dur: 0.4, scale: 1.2 + 0.2 * Math.min(k, 2) },
  ]
  const cues: Cue[] = [{ at: at - 0.5, sfx: 'rumble' }]
  const camera: Camera[] = []
  if (k < 3) {
    const wheels = WHEELS.slice(0, k + 1)
    moves.push(
      // 往前一衝
      { at: at - 0.3, actor: 'yang', do: 'moveTo', to: { x: KX - 3 - 2 * k, y: SEAT }, dur: 0.18, ease: 'in' },
      ...wheels.map((w): Move => ({ at: at - 0.3, actor: w, do: 'shake', amount: 1.2, dur: 0.25 })),
      // 車頭一栽
      { at: at - 0.12, actor: 'yang', do: 'rotateTo', amount: -40 - TILT[k], dur: 0.12, ease: 'in' },
      { at: at + 0.04, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    )
    // 摔出去，一次比一次遠：原地栽跟斗趴扁 → 翻一圈飛出去跌坐 → 飛最遠趴扁
    const land = [{ x: KX - 28, arc: 4, dur: 0.26 }, { x: 70, arc: 10, dur: 0.4 }, { x: 30, arc: 13, dur: 0.5 }][k]
    moves.push(
      { at: at + 0.05, actor: 'yang', do: 'moveTo', to: { x: land.x, y: P }, arc: land.arc, dur: land.dur, ease: 'out' },
      { at: at + 0.05, actor: 'yang', do: 'rotateTo', amount: 40, dur: k === 0 ? land.dur : 0.1 },
      { at: at + 0.05 + land.dur, actor: 'yang', do: 'swap', emoji: k === 1 ? 'hero:yang/fall' : 'hero:yang/flat' },
    )
    if (k >= 1) moves.push({ at: at + 0.12, actor: 'yang', do: 'spin', pivot: 'center', times: -(k), dur: land.dur - 0.1 })
    fx.push(
      { at, kind: 'burst', x: KX - 20, y: 70, n: 1, dur: 0.4, scale: 1.3 + 0.35 * k },
    )
    camera.push(
      { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: KX - 14, y: 62 } },
      { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
    )
    cues.push({ at, sfx: 'bonk' }, { at: at + 0.05, sfx: 'crack' })
    if (k >= 1) cues.push({ at: at + 0.1, sfx: 'boing' })
    if (k >= 2) cues.push({ at: at + 0.15, sfx: 'whoosh' })
  } else {
    // 回馬槍：車子穩穩的（他閉眼得意一下）……四個輪子自己咻地排成一排開走
    WHEELS.forEach((w, i) => {
      const p = { x: ROW4[i] }
      moves.push(
        { at: at - 0.3, actor: w, do: 'shake', amount: 1.2, dur: 0.25 },
        { at: at + 0.04 * i, actor: w, do: 'moveTo', to: { x: -25 - 13 * i, y: WY }, dur: 0.5, ease: 'in', anticipate: 2 },
        { at: at + 0.04 * i, actor: w, do: 'rotateTo', amount: -((p.x + 25 + 13 * i) / (Math.PI * 12)) * 360, dur: 0.5, ease: 'in' },
      )
    })
    moves.push(
      // 停在半空傻眼一拍，然後「咚」一屁股摔下去
      { at: at + 0.06, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: at + 0.4, actor: 'yang', do: 'moveTo', to: { x: KX4, y: P }, dur: 0.14, ease: 'in' },
      { at: at + 0.54, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
      { at: at + 0.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    )
    fx.push(
      { at: at + 0.05, kind: 'pop', actor: 'yang', emoji: '❗', dx: -12, dur: 0.4, scale: 1.4 },
      { at: at + 0.54, kind: 'burst', x: KX4, y: 72, n: 1, dur: 0.4, scale: 2.4 },
      { at: at + 0.6, kind: 'dizzy', actor: 'yang', dur: 0.5 },
    )
    camera.push(
      { at: at + 0.54, dur: 0.45, do: 'punch', amount: 0.3, to: { x: KX4, y: 62 } },
      { at: at + 0.54, dur: 0.3, do: 'shake', amount: 2.2 },
    )
    cues.push({ at, sfx: 'whoosh' }, { at: at + 0.54, sfx: 'bonk' }, { at: at + 0.59, sfx: 'crack' }, { at: at + 0.64, sfx: 'boing' }, { at: at + 0.69, sfx: 'whoosh' })
  }
  return { moves, fx, camera, cues }
}

/** 摔完走回車子那裡（往右走要轉身，到了再轉回來朝左）、爬上去坐好。at 是開始走的那一刻 */
function back(at: number, fromX: number): Move[] {
  const d = Math.max(0.3, (KX - fromX) / 120)
  return [
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at, actor: 'yang', do: 'flip' },
    { at, actor: 'yang', do: 'moveTo', to: { x: KX + 2, y: P }, dur: d },
    { at: at + d, actor: 'yang', do: 'flip' },
    { at: at + d, actor: 'yang', do: 'moveTo', to: { x: KX, y: SEAT }, arc: 5, dur: 0.2, ease: 'out' },
    { at: at + d + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/drive' },
  ]
}

const H1 = 2.3, H2 = 4.4, H3 = 6.9
const g1 = go(H1, 0), g2 = go(H2, 1), g3 = go(H3, 2)
const r1 = roll(1.75, 0), r2 = roll(3.8, 1), r3 = roll(6.05, 2)
const FULL = H3 + 0.15 + 0.6 // 國字填滿
// 語詞那一刻：第四個輪子滾進來，四個排成四方形
const SQUARE = 8.75
const WORD = 9.25
const HOPON = 9.65
const REV = 10.15 // 回馬槍：輪子自己開走
const g4 = go(REV, 3)
const ASK = 11.0
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '四',
  meta: { theme: '輪子不夠的小車', cast: '楊捷睿＋四個輪子', gags: ['楊捷睿坐著握方向盤要開車，每滾來一個輪子裝到屁股底下，他喊出發，車頭就往沒輪子的那邊一栽把他摔出去，一次比一次遠（一個輪子→兩個→三個）；回馬槍是四個輪子排成四方形、他坐上去再喊出發，車頭沒栽，四個輪子自己開走，他一屁股摔在原地'] },
  duration: 15,
  bg: { top: '#DDF1FF', bottom: '#F4FBFF', floor: '#BFD9A0', scenery: 'hills' },
  actors: [
    // 他畫在最後面：輪子一個一個排在他屁股底下，都看得到
    { id: 'yang', emoji: 'hero:yang/walk', x: KX, y: P, size: YS, hidden: true },
    { id: 'w1', emoji: '🛞', x: 185, y: WY, size: WS, pivot: 'center' },
    { id: 'w2', emoji: '🛞', x: 185, y: WY, size: WS, pivot: 'center' },
    { id: 'w3', emoji: '🛞', x: 185, y: WY, size: WS, pivot: 'center' },
    { id: 'w4', emoji: '🛞', x: 185, y: WY, size: WS, pivot: 'center' },
  ],
  moves: [
    // 開場：楊捷睿走進來，指著字框「四！」，坐下來握方向盤「噗噗」——沒有輪子，動也不動
    { at: 0, actor: 'yang', do: 'enter', from: { x: 185, y: P }, dur: 0.55, ease: 'out' },
    { at: 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 1.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/drive' },
    { at: 1.1, actor: 'yang', do: 'shake', amount: 1, dur: 0.25 },
    // 第 1 次
    ...r1.moves,
    ...g1.moves,
    { at: H1 + 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...back(H1 + 0.95, KX - 28),
    // 第 2 次
    ...r2.moves,
    ...g2.moves,
    { at: H2 + 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...back(H2 + 1.0, 70),
    // 第 3 次前停一拍：坐好了……冒汗、吞口水、輪子抖一抖……出發！
    ...r3.moves,
    { at: H3 - 0.75, actor: 'yang', do: 'tilt', amount: 4, dur: 0.3 },
    { at: H3 - 0.75, actor: 'w1', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: H3 - 0.75, actor: 'w2', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: H3 - 0.75, actor: 'w3', do: 'shake', amount: 0.8, dur: 0.3 },
    ...g3.moves,
    // 第四個輪子滾進來，四個輪子排成四方形；他爬起來走過去指著——四方形！
    { at: FULL + 0.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: FULL + 0.85, actor: 'yang', do: 'flip' },
    { at: FULL + 0.9, actor: 'yang', do: 'moveTo', to: { x: 44, y: P }, dur: 0.4 },
    { at: SQUARE - 0.1, actor: 'w4', do: 'moveTo', to: SQ_POS.w4, dur: 0.5, ease: 'out' },
    { at: SQUARE - 0.1, actor: 'w4', do: 'rotateTo', amount: -((185 - SQ_POS.w4.x) / (Math.PI * 12)) * 360, dur: 0.5, ease: 'out' },
    ...['w1', 'w2', 'w3'].map((w, i): Move => ({ at: SQUARE + 0.05 * i, actor: w, do: 'moveTo', to: SQ_POS[w], arc: 8, dur: 0.35, ease: 'out' })),
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    // 坐上去（轉回來朝左），閉眼得意……出發！
    { at: HOPON, actor: 'yang', do: 'flip' },
    { at: HOPON, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    ...WHEELS.map((w, i): Move => ({ at: HOPON - 0.1, actor: w, do: 'moveTo', to: { x: ROW4[i], y: WY }, arc: 6, dur: 0.3, ease: 'out' })),
    { at: HOPON, actor: 'yang', do: 'moveTo', to: { x: KX4, y: SEAT }, arc: 4, dur: 0.25, ease: 'out' },
    { at: HOPON + 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/drive' },
    ...g4.moves,
    // 問他：他留在右前方、變大，面向左邊的國字
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 128, y: P + 3 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.12, dur: 0.3 },
    { at: ASK + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 安靜等他回答：手放耳邊、身體前傾聽，點兩下頭
    { at: 12.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.2, actor: 'yang', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: 12.75, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：畫面只留下字
    { at: ANSWER + 0.08, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.08, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.1, actor: 'yang', do: 'moveTo', to: { x: 205, y: P + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 每摔一次掉出一組：框的左上（第一個輪子）、裡面的儿（翹起來的兩條腿）、框底下封口（第三個輪子）
    { at: H1 + 0.15, dur: 0.6, strokes: [0, 1], from: 'w1', color: partColor('囗') },
    { at: H2 + 0.15, dur: 0.6, strokes: [2, 3], from: 'yang', color: partColor('儿') },
    { at: H3 + 0.15, dur: 0.6, strokes: [4], from: 'w3', color: partColor('囗') },
  ],
  glyph: [
    { at: H1 + 0.1, dur: 0.4, do: 'wobble' },
    { at: H2 + 0.1, dur: 0.4, do: 'wobble' },
    { at: FULL + 0.1, dur: 0.45, do: 'home', ease: 'back' },
    { at: FULL + 0.95, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的楊捷睿
    { at: ASK, dur: 3.0, do: 'ask', keep: ['yang'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 1.1, kind: 'puff', actor: 'yang', dx: 16, dy: 14, dur: 0.35 },
    { at: 1.2, kind: 'pop', actor: 'yang', emoji: '❓', dx: -10, dur: 0.45, scale: 1.3 },
    ...g1.fx,
    ...g2.fx,
    // 第 3 次前停一拍
    { at: H3 - 0.8, kind: 'sweat', actor: 'yang', dur: 0.55 },
    ...g3.fx,
    { at: H3 + 0.65, kind: 'dizzy', actor: 'yang', dur: 0.6 },
    // 四方形：四個輪子一起閃一下
    { at: WORD, kind: 'burst', x: SQ.x, y: WY - 4, emoji: '✨', n: 8, dur: 0.5, scale: 1.3 },
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    ...g4.camera,
  ],
  lights: [
    { at: FULL + 0.1, dur: 0.05, level: -0.35 },
    { at: FULL + 0.15, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '四' },
    { at: 1.1, sfx: 'rumble' },
    ...r1.cues,
    ...g1.cues,
    ...r2.cues,
    ...g2.cues,
    ...r3.cues,
    { at: H3 - 0.75, sfx: 'gulp' },
    ...g3.cues,
    { at: FULL + 0.2, say: '四' },
    { at: SQUARE + 0.4, sfx: 'clink' },
    { at: WORD, say: '四方形' },
    ...g4.cues,
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '四' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
