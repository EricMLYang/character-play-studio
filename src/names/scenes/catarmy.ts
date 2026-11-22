// 演的是字面意思：野貓＋軍團——三隻戴頭盔的貓咪排成一隊齊步走，可是貓就是貓，東西一經過就忍不住撲出去（不演偷魚、被罰、排排跪著道歉）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：貓咪軍團「一二一二」齊步走，可是有東西從面前經過，就有貓忍不住撲出去——一次比一次多隻。
// 同一個經過（從右邊進來、從隊伍前面過去）、同一個「頭一起跟著轉」、同一個「咻——碰！」，只有撲出去的貓越來越多：
// 蝴蝶飛過 → 最後一隻撲出去、撲空趴扁；毛線球滾過 → 兩隻一起撲、在半空撞在一起。隊長每次都拿大聲公吼回來排好。
// 第三次前停一拍：一顆超大毛線球慢慢滾到隊長背後停住，兩個小兵抖成一團硬忍住——反轉：轉頭看到的隊長自己撲上去了，
// 小兵看隊長都撲了，也跟著撲上去，三隻抱著大毛線球亮相：「野貓軍團」。
const S = { a: 28, b: 28, c: 36 } as const // a 黑貓小兵（最後面）、b 白貓小兵、c 橘貓隊長（最前面、最大）
type Id = keyof typeof S
const HS = { a: 12, b: 12, c: 16 } // 頭盔的 size
const gy = (size: number) => 77 - 0.42 * size // 站在地上的 y
const Y = { a: gy(S.a), b: gy(S.b), c: gy(S.c) }
const X = { a: 42, b: 72, c: 106 } // 隊伍站位
const HXR = 0.19 // 頭盔在頭上：往臉那一側偏 size 的幾成
const HYR = 0.39 // 頭盔比貓的 y 高 size 的幾成
/** 貓在 (x, y)、朝 f（1 朝右、-1 朝左）時，頭盔的位置 */
const hp = (id: Id, x: number, y: number, f: 1 | -1) => ({ x: x + f * HXR * S[id], y: y - HYR * S[id] })
const h = (id: Id) => `h${id}`
const HG = (id: Id) => gy(HS[id]) // 頭盔掉在地上的 y
/** 撲空趴扁停多久 */
const HOLD = 0.45

/** 貓走／跳到 (x, y)，頭盔跟著 */
function go(at: number, id: Id, x: number, y: number, f: 1 | -1, dur: number, o: Partial<Move> = {}): Move[] {
  return [
    { at, dur, actor: id, do: 'moveTo', to: { x, y }, ...o },
    { at, dur, actor: h(id), do: 'moveTo', to: hp(id, x, y, f), ...o },
  ]
}
/** 轉頭（整隻翻面，頭盔換到另一邊） */
function turn(at: number, id: Id, x: number, y: number, f: 1 | -1): Move[] {
  return [
    { at, actor: id, do: 'flip' },
    { at, actor: h(id), do: 'flip' },
    { at, dur: 0.1, actor: h(id), do: 'moveTo', to: hp(id, x, y, f), ease: 'out' },
  ]
}
/** 貓跟頭盔一起做（hop、shake） */
function both(at: number, id: Id, d: 'hop' | 'shake', amount: number, dur: number): Move[] {
  return [{ at, dur, actor: id, do: d, amount }, { at, dur, actor: h(id), do: d, amount }]
}
/** 壓扁／拉長，頭盔跟著沉／浮 */
function squash(at: number, id: Id, amount: number, dur: number): Move[] {
  return [{ at, dur, actor: id, do: 'squash', amount }, { at, dur, actor: h(id), do: 'hop', amount: -S[id] * 0.6 * amount }]
}

/** 齊步走「一二一二」：全隊原地踏步，同一拍一起顛 */
function march(at: number, steps: number) {
  const moves: Move[] = []
  const cues: Cue[] = []
  for (let k = 0; k < steps; k++) {
    const t = at + k * 0.3
    for (const id of ['a', 'b', 'c'] as Id[]) moves.push(...both(t, id, 'hop', 2.2, 0.26))
    cues.push({ at: t, sfx: 'tap' })
  }
  return { moves, cues }
}

/** 撲出去：壓低身體蓄力 → 咻地跳出去、身體往前撲（頭盔跟著）。p 是起跳那一刻 */
function leap(p: number, id: Id, x: number, y: number, f: 1 | -1, arc: number, dur: number): Move[] {
  return [
    ...squash(p - 0.2, id, 0.22, 0.2),
    ...go(p, id, x, y, f, dur, { arc, ease: 'out' }),
    { at: p, dur, actor: id, do: 'tilt', amount: -f * 22, pivot: 'center' },
  ]
}

/** 撲空趴扁：身體壓成一片、頭盔彈掉滾到地上。at 是落地那一刻 */
function splat(at: number, id: Id, hx: number, r: number): Move[] {
  return [
    { at, dur: 0.08, actor: id, do: 'stretchTo', amount: 1.4, ease: 'out' },
    { at, dur: 0.4, actor: h(id), do: 'moveTo', to: { x: hx, y: HG(id) }, arc: 10, ease: 'out' },
    { at, dur: 0.4, actor: h(id), do: 'rotateTo', amount: r },
  ]
}
/** 爬起來、跳回隊伍、頭盔飛回頭上 */
function back(at: number, id: Id, f: 1 | -1, r: number): Move[] {
  return [
    { at, dur: 0.12, actor: id, do: 'stretchTo', amount: 1 / 1.4, ease: 'back' },
    { at: at + 0.1, dur: 0.3, actor: id, do: 'moveTo', to: { x: X[id], y: Y[id] }, arc: 6, ease: 'out' },
    { at: at + 0.05, dur: 0.35, actor: h(id), do: 'moveTo', to: hp(id, X[id], Y[id], f), arc: 12, ease: 'out' },
    { at: at + 0.05, dur: 0.35, actor: h(id), do: 'rotateTo', amount: -r },
  ]
}

/** 撲的那一下：咻——碰！（每次一樣，第二次多疊一聲、震更大） */
function hit(at: number, k: number, x: number, y: number) {
  const fx: Fx[] = [{ at, kind: 'burst', x, y, n: 1, dur: 0.45, scale: [1.3, 1.8, 2.3][k] }]
  if (k >= 1) fx.push({ at: at + 0.05, kind: 'burst', x, y, emoji: '⭐', n: 3 + 2 * k, dur: 0.6, scale: 1.3 })
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.06 + 0.04 * k, to: { x, y } },
    { at, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { fx, camera, cues }
}

// 隊長的大聲公：朝左時拿在嘴前（喇叭口朝左）
const MEGA = { x: 89, y: 55 }
/** 隊長拿大聲公吼：跳起來、大聲公冒出來、吹兩三聲。k 越大吼越兇 */
function scold(at: number, k: number) {
  const moves: Move[] = [
    { at, actor: 'mega', do: 'pop', dur: 0.15 },
    ...both(at, 'c', 'hop', 3 + 2 * k, 0.3),
    { at, dur: 0.3, actor: 'mega', do: 'hop', amount: 3 + 2 * k },
    { at: at + 0.3, dur: 0.4, actor: 'c', do: 'shake', amount: 0.5 + 0.4 * k },
    { at: at + 0.3, dur: 0.4, actor: 'mega', do: 'shake', amount: 0.5 + 0.4 * k },
  ]
  const fx: Fx[] = [{ at: at + 0.15, kind: 'blow', actor: 'mega', to: { x: 48, y: 54 }, dur: 0.6, scale: 1 + 0.3 * k }]
  const cues: Cue[] = [{ at: at + 0.05, sfx: 'blip' }, { at: at + 0.3, sfx: 'blip' }]
  if (k >= 1) cues.push({ at: at + 0.55, sfx: 'blip' })
  return { moves, fx, cues }
}

// ── 時間表 ──
const m1 = march(0.05, 3)
// 第一次：蝴蝶飛過，最後一隻（黑貓）撲出去
const L1 = 2.2, H1 = L1 + 0.3
const h1 = hit(H1, 0, 36, 60)
const s1 = scold(H1 + HOLD, 0)
const B1 = H1 + HOLD + 0.25 // 爬起來
const m2 = march(3.7, 2)
// 第二次：毛線球滾過，兩隻一起撲、半空撞在一起
const YARN0 = 3.75, YARN1 = 5.75 // 從 x 182 滾到 x -20
const L2 = 4.85, H2 = L2 + 0.25
const h2 = hit(H2, 1, 57, 56)
const s2 = scold(H2 + HOLD + 0.1, 1)
const B2 = H2 + HOLD + 0.4
// 第三次：大毛線球慢慢滾到隊長背後，小兵硬忍——隊長自己撲上去
const BIG0 = 6.4
const BIGX = 130
const SEE = 7.6 // 隊長轉頭看到
const L3 = 8.1, H3 = L3 + 0.35
const h3 = hit(H3, 2, 112, 66)
const ROLL = H3 + 0.1 // 球載著隊長滾回中間
const BALLX = 90
const RIDE = gy(S.c) - 14 // 隊長趴在球上
const L4 = 8.65 // 小兵跟著撲
const POSE = 9.15

export default scene({
  duration: 11.2,
  bg: { top: '#86CFF2', bottom: '#FFF3C8', floor: '#E1B64E', scenery: 'hills' },
  actors: [
    // 金黃色稻田
    { id: 'rice1', emoji: '🌾', x: 10, y: gy(22), size: 22 },
    { id: 'rice2', emoji: '🌾', x: 150, y: gy(24), size: 24 },
    { id: 'rice3', emoji: '🌾', x: 136, y: gy(16), size: 16 },
    { id: 'big', emoji: '🧶', x: 196, y: gy(34), size: 34, pivot: 'center' },
    { id: 'a', emoji: '🐈‍⬛', x: X.a, y: Y.a, size: S.a, flip: true },
    { id: 'b', emoji: '🐈', x: X.b, y: Y.b, size: S.b, flip: true, tint: 'grayscale(1) brightness(1.18) contrast(1.05)' },
    { id: 'c', emoji: '🐈', x: X.c, y: Y.c, size: S.c, flip: true },
    { id: 'yarn', emoji: '🧶', x: 182, y: gy(22), size: 22, pivot: 'center' },
    { id: 'fly', emoji: 'prop:butterfly', x: 180, y: 34, size: 18, float: true },
    { id: 'mega', emoji: '📣', x: MEGA.x, y: MEGA.y, size: 14, flip: true, float: true, hidden: true },
    ...(['a', 'b', 'c'] as Id[]).map((id) => ({ id: h(id), emoji: '🪖', x: hp(id, X[id], Y[id], 1).x, y: hp(id, X[id], Y[id], 1).y, size: HS[id], float: true, pivot: 'center' as const })),
  ],
  moves: [
    // ① 齊步走「一二一二」
    ...m1.moves,
    // 蝴蝶從右邊飛過來，從隊伍前面一路飛到最後面
    { at: 0.6, dur: 0.55, actor: 'fly', do: 'moveTo', to: { x: 132, y: 42 } },
    { at: 1.15, dur: 0.45, actor: 'fly', do: 'moveTo', to: { x: 94, y: 36 } },
    { at: 1.6, dur: 0.5, actor: 'fly', do: 'moveTo', to: { x: 30, y: 44 } },
    ...[0.6, 0.85, 1.1, 1.35, 1.6, 1.85, 2.1].map((at): Move => ({ at, dur: 0.25, actor: 'fly', do: 'hop', amount: 2.5 })),
    // 頭一隻一隻跟著轉
    ...turn(1.25, 'c', X.c, Y.c, -1),
    ...turn(1.65, 'b', X.b, Y.b, -1),
    ...turn(1.95, 'a', X.a, Y.a, -1),
    // 黑貓撲出去——蝴蝶往上一閃
    ...leap(L1, 'a', 36, Y.a, -1, 16, 0.3),
    { at: L1 + 0.05, dur: 0.3, actor: 'fly', do: 'moveTo', to: { x: 20, y: 10 }, ease: 'out' },
    { at: L1 + 0.35, dur: 0.15, actor: 'fly', do: 'moveTo', to: { x: -14, y: -6 }, ease: 'in' },
    { at: L1 + 0.5, actor: 'fly', do: 'vanish', dur: 0.05 },
    ...splat(H1, 'a', 22, -40),
    // 隊長吼回來
    ...s1.moves,
    ...back(B1, 'a', 1, -40),
    ...turn(B1 + 0.45, 'a', X.a, Y.a, 1),
    ...turn(B1 + 0.45, 'b', X.b, Y.b, 1),
    ...turn(B1 + 0.5, 'c', X.c, Y.c, 1),
    { at: B1 + 0.5, actor: 'mega', do: 'vanish', dur: 0.15 },
    // 再走
    ...m2.moves,
    // ② 毛線球從右邊滾過來
    { at: YARN0, dur: YARN1 - YARN0, actor: 'yarn', do: 'moveTo', to: { x: -20, y: gy(22) }, ease: 'linear' },
    { at: YARN0, dur: YARN1 - YARN0, actor: 'yarn', do: 'rotateTo', amount: -1000, ease: 'linear' },
    ...turn(4.45, 'c', X.c, Y.c, -1),
    ...turn(4.72, 'b', X.b, Y.b, -1),
    // 兩隻一起撲——在半空撞在一起
    ...leap(L2, 'a', 51, Y.a, 1, 12, 0.25),
    ...leap(L2, 'b', 63, Y.b, -1, 12, 0.25),
    { at: H2, dur: 0.3, actor: 'a', do: 'moveTo', to: { x: 36, y: Y.a }, arc: 6, ease: 'out' },
    { at: H2, dur: 0.3, actor: 'b', do: 'moveTo', to: { x: 80, y: Y.b }, arc: 6, ease: 'out' },
    ...splat(H2 + 0.3, 'a', 22, -40).map((m) => (m.actor === 'a' ? m : { ...m, at: H2 })),
    ...splat(H2 + 0.3, 'b', 96, 40).map((m) => (m.actor === 'b' ? m : { ...m, at: H2 })),
    { at: H2, dur: 0.5, actor: 'ha', do: 'spin', times: -2 },
    { at: H2, dur: 0.5, actor: 'hb', do: 'spin', times: 2 },
    // 隊長吼得更兇
    ...s2.moves,
    ...back(B2, 'a', 1, -40),
    ...back(B2, 'b', -1, 40),
    ...turn(B2 + 0.45, 'b', X.b, Y.b, 1),
    // ③ 停一拍：隊長盯著小兵（大聲公還拿著），大毛線球從他背後慢慢滾過來停住
    { at: BIG0, dur: 1.0, actor: 'big', do: 'moveTo', to: { x: BIGX, y: gy(34) }, ease: 'out' },
    { at: BIG0, dur: 1.0, actor: 'big', do: 'rotateTo', amount: -210, ease: 'out' },
    // 兩個小兵看到了，抖成一團硬忍住
    ...squash(6.7, 'a', 0.12, 0.25),
    ...squash(6.7, 'b', 0.12, 0.25),
    ...both(6.9, 'a', 'shake', 0.4, 0.5),
    ...both(6.9, 'b', 'shake', 0.4, 0.5),
    ...both(7.4, 'a', 'shake', 0.8, 0.6),
    ...both(7.4, 'b', 'shake', 0.8, 0.6),
    // 隊長得意點頭——轉頭一看
    ...both(7.1, 'c', 'hop', 2, 0.25),
    ...turn(SEE, 'c', X.c, Y.c, 1),
    { at: SEE + 0.05, dur: 0.3, actor: 'mega', do: 'moveTo', to: { x: MEGA.x + 3, y: 71 }, ease: 'in' },
    { at: SEE + 0.05, dur: 0.3, actor: 'mega', do: 'rotateTo', amount: -70 },
    { at: L4, actor: 'mega', do: 'vanish', dur: 0.15 },
    ...both(SEE + 0.15, 'c', 'shake', 0.6, 0.3),
    // 反轉：隊長自己撲上去
    ...leap(L3, 'c', 122, RIDE, 1, 8, 0.35),
    { at: H3, dur: 0.25, actor: 'big', do: 'squash', amount: 0.2 },
    { at: H3, dur: 0.3, actor: 'hc', do: 'rotateTo', amount: 20 },
    // 大球載著隊長滾回中間
    { at: ROLL, dur: 0.5, actor: 'big', do: 'moveTo', to: { x: BALLX, y: gy(34) }, ease: 'out' },
    { at: ROLL, dur: 0.5, actor: 'big', do: 'rotateTo', amount: -150, ease: 'out' },
    ...go(ROLL, 'c', BALLX + 4, RIDE, 1, 0.5, { ease: 'out' }),
    // 小兵：隊長都撲了！也撲上去（白貓跳過大球到另一邊）
    ...leap(L4, 'b', 118, Y.b, 1, 18, 0.4),
    ...turn(L4 + 0.4, 'b', 118, Y.b, -1),
    ...leap(L4 + 0.05, 'a', 62, Y.a, 1, 10, 0.35),
    // ⑤ 亮相：三隻抱著大毛線球
    ...squash(POSE, 'a', 0.15, 0.25),
    ...squash(POSE, 'b', 0.15, 0.25),
    ...both(POSE + 0.5, 'a', 'hop', 3, 0.35),
    ...both(POSE + 0.6, 'b', 'hop', 3, 0.35),
    ...both(POSE + 0.55, 'c', 'hop', 3, 0.35),
    { at: POSE + 0.55, dur: 0.35, actor: 'big', do: 'hop', amount: 3 },
  ],
  fx: [
    ...h1.fx,
    { at: H1 + 0.1, kind: 'puff', actor: 'a', n: 6, dur: 0.5 },
    ...s1.fx,
    ...h2.fx,
    { at: H2 + 0.35, kind: 'dizzy', actor: 'a', dur: 0.7 },
    { at: H2 + 0.35, kind: 'dizzy', actor: 'b', dur: 0.7 },
    ...s2.fx,
    // 硬忍：滿頭汗
    { at: 6.85, kind: 'sweat', actor: 'a', dur: 1.0 },
    { at: 6.95, kind: 'sweat', actor: 'b', dur: 1.0 },
    ...h3.fx,
    { at: H3 + 0.1, kind: 'puff', actor: 'big', n: 10, dur: 0.6 },
    { at: L4 + 0.4, kind: 'puff', actor: 'a', n: 6, dur: 0.5 },
    { at: POSE, kind: 'burst', actor: 'c', emoji: '✨', n: 10, dy: -8, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.45, kind: 'burst', actor: 'c', emoji: '🎉', n: 7, dy: -8, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.25, to: { x: 78, y: 50 } },
    { at: 1.8, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 66, y: 52 } },
    ...h1.camera,
    { at: H1 + HOLD, dur: 0.4, do: 'zoom', amount: 1.25, to: { x: 78, y: 50 } },
    { at: 4.5, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 68, y: 52 } },
    ...h2.camera,
    // 停一拍：鏡頭讓出右邊，看得到大球跟兩個發抖的小兵
    { at: 6.4, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 86, y: 50 } },
    { at: 7.0, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 86, y: 50 } },
    ...h3.camera,
    // 亮相
    { at: POSE - 0.1, dur: 0.5, do: 'zoom', amount: 1.42, to: { x: 90, y: 50 } },
  ],
  lights: [
    { at: POSE, dur: 0.05, level: -0.25 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    ...m1.cues,
    { at: 0.6, sfx: 'whoosh' },
    { at: L1, sfx: 'whoosh' },
    ...h1.cues,
    ...s1.cues,
    ...m2.cues,
    { at: L2, sfx: 'whoosh' },
    ...h2.cues,
    ...s2.cues,
    { at: BIG0, sfx: 'rumble' },
    { at: SEE, sfx: 'blip' },
    { at: L3, sfx: 'whoosh' },
    ...h3.cues,
    { at: H3 + 0.1, sfx: 'boing' },
    { at: L4, sfx: 'whoosh' },
    { at: POSE, sfx: 'boing' },
    { at: POSE + 0.15, say: '野貓軍團' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
