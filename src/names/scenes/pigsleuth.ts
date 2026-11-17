// 演的是字面意思：豬＋探長——一隻小豬當探長，拿放大鏡沿著腳印找犯人，犯人（小老鼠）其實一直躲在他背後。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：豬探長每次猛一回頭，躲在他背後的小老鼠就「咻」地繞到他另一邊——永遠躲在他背後。
// 同一個回頭、同一聲「咻」、同一個繞到背後，三次只有結果越來越大：第一次小老鼠貼地一溜就到 →
// 第二次從他頭頂翻一個大跟斗跳過去 → 停一拍（兩個一起踮腳走、一起停）第三次他連轉三次頭，小老鼠來回繞三趟，
// 揚起一大團煙，兩個都轉昏坐在地上。反轉是第四次：豬探長站起來再回頭——小老鼠想溜卻昏到腳軟，
// 一屁股坐在他放大鏡正前方，被抓個正著。豬探長拿放大鏡湊近亮相：「豬探長」。
const S = 34 // 豬探長的 size
const G = 77 - 0.42 * S // 豬探長站在地上的 y
const M = 22 // 小老鼠的 size
const MG = 77 - 0.42 * M // 小老鼠站在地上的 y
const PX = 82 // 豬探長回頭的地方（前兩次在這裡；停一拍時踮腳往前走到 P3）
const L = PX - 17 // 小老鼠躲在他左邊（豬探長面向右的背後）
const R = PX + 17 // 小老鼠躲在他右邊（豬探長面向左的背後）
/** 回頭找不到人、抱胸斜眼停多久 */
const HOLD = 0.55

/**
 * 豬探長猛一回頭（每一次都一模一樣）：縮一下蓄力 → 翻過去、拿放大鏡往前一照、小跳一下。at 是翻過去那一刻。
 * k 越大跳越高、鏡頭推越近。
 */
function turn(at: number, k: number, x = PX) {
  const moves: Move[] = [
    { at: at - 0.15, actor: 'pig', do: 'squash', amount: -0.12 - 0.04 * k, dur: 0.15 },
    { at, actor: 'pig', do: 'flip' },
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at, actor: 'pig', do: 'hop', amount: 2 + 1.5 * k, dur: 0.22 },
  ]
  const camera: Camera[] = [{ at, dur: 0.35, do: 'punch', amount: 0.06 + 0.03 * k, to: { x, y: G - 6 } }]
  const cues: Cue[] = [{ at, sfx: 'whoosh' }]
  return { moves, camera, cues }
}

/**
 * 小老鼠「咻」地繞到他另一邊（從他身體後面過，被他擋住）。to 是要去的那一邊；
 * high＝從他頭頂翻跟斗跳過去。落地那一下揚塵，小老鼠轉過來面向他的背、摀嘴偷笑。
 */
function zip(at: number, to: number, opts: { high?: boolean; dur?: number; giggle?: boolean } = {}) {
  const dur = opts.dur ?? 0.2
  const moves: Move[] = [
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at, actor: 'mouse', do: 'moveTo', to: { x: to, y: MG }, dur, ease: opts.high ? 'inOut' : 'in', arc: opts.high ? 28 : 0 },
    { at: at + dur, actor: 'mouse', do: 'flip' },
  ]
  if (opts.high) moves.push({ at, actor: 'mouse', do: 'spin', times: to > PX + 3 ? 1 : -1, dur, pivot: 'center' })
  if (opts.giggle !== false) moves.push({ at: at + dur, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' })
  const fx: Fx[] = [{ at: at + dur, kind: 'puff', x: to, y: 76, n: opts.high ? 7 : 3, dur: 0.45 }]
  const cues: Cue[] = [{ at: at + 0.02, sfx: 'slide' }]
  return { moves, fx, cues }
}

/** 回頭沒人：抱胸斜眼（傻眼的姿勢停住），背後的小老鼠偷笑抖肩膀 */
function nobody(at: number, k: number): Move[] {
  return [
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: at + 0.05, actor: 'pig', do: 'tilt', amount: 6 + 3 * k, dur: HOLD },
    { at: at + 0.1, actor: 'mouse', do: 'bounce', amount: 1 + k, times: 3, dur: HOLD },
  ]
}

// 第一次：貼地一溜
const T1 = 1.55
const a1 = turn(T1, 0)
const z1 = zip(T1 - 0.04, R)
// 第二次：從頭頂翻跟斗跳過去
const T2 = 3.15
const a2 = turn(T2, 1)
const z2 = zip(T2 - 0.06, L, { high: true, dur: 0.45 })
// 停一拍：兩個一起踮腳往前走、一起停
const CREEP = 4.35
const P3 = PX + 6 // 第三、四次豬探長站的地方
const L3 = P3 - 17
const R3 = P3 + 17
// 第三次：連轉三次頭，小老鼠來回繞三趟
const T3 = 5.75
const GAP = 0.3
const a3 = [turn(T3, 2, P3), turn(T3 + GAP, 2, P3), turn(T3 + 2 * GAP, 2, P3)]
const z3 = [zip(T3 - 0.03, R3, { dur: 0.14, giggle: false }), zip(T3 + GAP - 0.03, L3, { dur: 0.14, giggle: false }), zip(T3 + 2 * GAP - 0.03, R3, { dur: 0.14, giggle: false })]
const DIZZY = T3 + 2 * GAP + 0.4 // 煙散了，兩個都轉昏坐在地上
// 反轉（第四次）：同一個回頭，小老鼠想溜卻腳軟
const T4 = 8.0
const a4 = turn(T4, 2, P3)
const SHOW = T4 + 1.1 // 亮相

export default scene({
  duration: 10.7,
  bg: { top: '#BFE0DA', bottom: '#F1F8EE', floor: '#C08A58', scenery: 'room' },
  actors: [
    { id: 'lamp', emoji: 'prop:lamp', x: 136, y: 77 - 0.42 * 33, size: 33 },
    { id: 'plant', emoji: '🪴', x: 28, y: 77 - 0.42 * 18, size: 18 },
    // 地上一排大腳印（線索）
    ...[34, 50, 66, 82, 98, 114, 130].map((x, i) => ({ id: `f${i}`, emoji: '🐾', x, y: 76.5 - (i % 2) * 1.5, size: 8, float: true })),
    // 小老鼠畫在豬探長前面一層之前：繞過去時從他身體後面過、被他擋住
    { id: 'mouse', emoji: 'hero:mouse/sneak', x: 46, y: MG, size: M, flip: true },
    { id: 'pig', emoji: 'hero:pig/think', x: 64, y: G, size: S, flip: true },
  ],
  moves: [
    // 開場：豬探長拿放大鏡彎腰沿著腳印往前找，小老鼠踮腳跟在他屁股後面，一步一步同步
    { at: 0.05, actor: 'pig', do: 'squash', amount: -0.1, dur: 0.15 },
    { at: 0.2, actor: 'pig', do: 'moveTo', to: { x: PX, y: G }, dur: 1.0 },
    { at: 0.2, actor: 'mouse', do: 'moveTo', to: { x: L, y: MG }, dur: 1.0 },
    { at: 0.3, actor: 'pig', do: 'tilt', amount: -8, dur: 0.9 },
    ...[0, 1, 2, 3].map((i): Move => ({ at: 0.25 + 0.25 * i, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.2 })),
    { at: 0.4, actor: 'f2', do: 'flash', dur: 0.35 },
    { at: 0.8, actor: 'f3', do: 'flash', dur: 0.35 },
    { at: 1.15, actor: 'f4', do: 'flash', dur: 0.35 },
    // 第一次：猛回頭——小老鼠貼地一溜，繞到他背後
    ...a1.moves,
    ...z1.moves,
    ...nobody(T1 + 0.3, 0),
    // 換個方向繼續找（小老鼠還在他背後）
    { at: 2.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 2.55, actor: 'pig', do: 'tilt', amount: -6, dur: 0.5 },
    // 第二次：更用力回頭——小老鼠從他頭頂翻一個大跟斗跳過去
    ...a2.moves,
    ...z2.moves,
    ...nobody(T2 + 0.55, 1),
    // 停一拍：兩個一起踮腳往前走兩步、一起停（小老鼠差點撞上他屁股），豬探長慢慢瞇眼……
    { at: CREEP, actor: 'pig', do: 'swap', emoji: 'hero:pig/sneak' },
    { at: CREEP, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    ...[0, 0.35].flatMap((d, i): Move[] => [
      { at: CREEP + 0.1 + d, actor: 'pig', do: 'moveTo', to: { x: PX + 3 * (i + 1), y: G }, dur: 0.3 },
      { at: CREEP + 0.1 + d, actor: 'pig', do: 'hop', amount: 2.5, dur: 0.3 },
      { at: CREEP + 0.1 + d, actor: 'mouse', do: 'moveTo', to: { x: L + 3 * (i + 1) + (i ? 1.5 : 0), y: MG }, dur: 0.3 },
      { at: CREEP + 0.1 + d, actor: 'mouse', do: 'hop', amount: 2.5, dur: 0.3 },
    ]),
    { at: CREEP + 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    { at: CREEP + 0.8, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.5 },
    { at: CREEP + 0.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    // 第三次：連轉三次頭——小老鼠來回繞三趟，煙越揚越大
    ...a3.flatMap((a) => a.moves),
    ...z3.flatMap((z) => z.moves),
    // 兩個都轉昏，一屁股坐在地上（豬探長面向左，小老鼠在他右邊背後）
    { at: DIZZY, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: DIZZY, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: DIZZY, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: DIZZY, actor: 'mouse', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: DIZZY + 0.3, actor: 'pig', do: 'tilt', amount: 8, dur: 0.9 },
    { at: DIZZY + 0.3, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.9 },
    // 反轉：豬探長站起來，同一個回頭——小老鼠想溜，昏到腳軟，一屁股坐在他放大鏡正前方
    { at: T4 - 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    ...a4.moves,
    // 小老鼠想爬起來溜：腳一軟，跑兩步就一屁股坐回原地
    { at: T4 - 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: T4 - 0.1, actor: 'mouse', do: 'moveTo', to: { x: R3 + 6, y: MG }, dur: 0.2, ease: 'out' },
    { at: T4 + 0.1, actor: 'mouse', do: 'tilt', amount: -25, dur: 0.2 },
    { at: T4 + 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: T4 + 0.2, actor: 'mouse', do: 'moveTo', to: { x: R3, y: MG }, arc: 3, dur: 0.18, ease: 'in' },
    { at: T4 + 0.38, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: T4 + 0.3, actor: 'pig', do: 'tilt', amount: 10, dur: 0.6 },
    { at: T4 + 0.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: T4 + 0.55, actor: 'mouse', do: 'hop', amount: 5, dur: 0.3 },
    // 亮相：豬探長拿放大鏡湊近，抓到了；小老鼠鞠躬認錯
    { at: SHOW, actor: 'pig', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: SHOW, actor: 'pig', do: 'moveTo', to: { x: P3 - 4, y: G }, dur: 0.3 },
    { at: SHOW + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/bow' },
  ],
  fx: [
    ...z1.fx,
    ...z2.fx,
    { at: T2 + 0.6, kind: 'sweat', actor: 'pig' },
    { at: CREEP + 0.85, kind: 'sweat', actor: 'mouse', dur: 0.6 },
    ...z3.flatMap((z) => z.fx),
    // 煙越揚越大，把兩個都吞掉
    { at: T3 + 0.1, kind: 'burst', x: P3, y: 74, emoji: 'prop:smoke', n: 1, dur: 0.4, scale: 1.1 },
    { at: T3 + GAP + 0.1, kind: 'burst', x: P3, y: 73, emoji: 'prop:smoke', n: 1, dur: 0.4, scale: 1.7 },
    { at: T3 + 2 * GAP + 0.1, kind: 'burst', x: P3, y: 62, emoji: 'prop:smoke', n: 1, dur: 0.6, scale: 3.6 },
    { at: DIZZY, kind: 'dizzy', actor: 'pig', dur: 1.2 },
    { at: DIZZY, kind: 'dizzy', actor: 'mouse', dur: 1.5 },
    // 抓到了
    { at: T4 + 0.55, kind: 'burst', actor: 'mouse', n: 1, dur: 0.4, scale: 1.6 },
    { at: T4 + 0.38, kind: 'puff', actor: 'mouse', n: 4, dur: 0.4 },
    { at: SHOW, kind: 'burst', actor: 'pig', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: SHOW + 0.4, kind: 'burst', actor: 'pig', emoji: '🎉', n: 7, dy: -5, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：兩個都在畫面中間、夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.4, to: { x: 82, y: 51 } },
    ...a1.camera,
    ...a2.camera,
    // 停一拍時慢慢推近
    { at: CREEP + 0.2, dur: 1.0, do: 'zoom', amount: 1.55, to: { x: 86, y: 54 } },
    ...a3.flatMap((a) => a.camera),
    { at: T3 + 2 * GAP + 0.1, dur: 0.5, do: 'shake', amount: 1.6 },
    ...a4.camera,
    { at: T4 + 0.55, dur: 0.3, do: 'shake', amount: 1 },
    // 亮相
    { at: SHOW, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: 88, y: 52 } },
  ],
  lights: [
    { at: SHOW, dur: 0.05, level: -0.35 },
    { at: SHOW + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.2, sfx: 'tap' },
    ...a1.cues,
    ...z1.cues,
    ...a2.cues,
    ...z2.cues,
    { at: T2 + 0.4, sfx: 'boing' },
    { at: CREEP + 0.1, sfx: 'tap' },
    { at: CREEP + 0.45, sfx: 'tap' },
    ...a3.flatMap((a) => a.cues),
    ...z3.flatMap((z) => z.cues),
    { at: T3 + 2 * GAP + 0.1, sfx: 'poof' },
    { at: DIZZY, sfx: 'bonk' },
    ...a4.cues,
    { at: T4 + 0.38, sfx: 'plop' },
    { at: T4 + 0.55, sfx: 'boing' },
    { at: SHOW, sfx: 'clink' },
    { at: SHOW + 0.2, say: '豬探長' },
    { at: SHOW + 0.6, sfx: 'cheer' },
  ],
})
