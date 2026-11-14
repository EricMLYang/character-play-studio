// 演的是字面意思：鋼鐵＋人——一個全身鋼鐵做的機器人，重得不得了：小松鼠拿一顆氣球就飄起來，他拿一大把才勉強飛起來，線一斷「鏘」地砸出一個坑，爬起來一點事都沒有（沒有紅金盔甲、胸口發光的圓、手掌光束）。
import { scene } from '../../story/scene'
import type { Fx, Move } from '../../anim/clip'

// 公園：小松鼠拉著一顆氣球，輕輕飄起來。機器人走過來，敲敲胸口——鏘鏘，全身都是鋼鐵。他也拿一顆：動也不動（停一拍）。
// 松鼠再給三顆：腳跟抬了一下，又咚地踩回地上。松鼠抱來一大把——機器人終於慢慢升空了！
// 可是太重了，線一條一條斷掉，氣球全飛走……鏘！他砸進地上，塵土飛揚。松鼠湊過來看（停一拍）——
// 機器人一彈站起來，一點事都沒有，松鼠的氣球飄到他旁邊：「鋼鐵人」。
const on = (surface: number, size: number) => surface + 3 - 0.42 * size
const R = 15 // 機器人 size
const GR = on(74, R)
const X = 92 // 機器人站的地方
const HAND = { dx: -7, dy: -6 } // 拿氣球的手（相對機器人）
// 每顆氣球在機器人上面的位置
const BAL = [
  { dx: -9, dy: -24 }, { dx: -16, dy: -28 }, { dx: -3, dy: -29 },
  { dx: -11, dy: -34 }, { dx: -20, dy: -36 }, { dx: 1, dy: -37 },
]
const B = on(74, 13) // 松鼠（size 13）站在地上的 y
const UP = 22 // 升空多高
const SNAP = [5.6, 5.75, 5.9, 6.0, 6.1, 6.2] // 每顆氣球的線斷掉的時間
const DUR = 9.5

/** 機器人移動，手上的氣球跟著 */
const fly = (at: number, dur: number, x: number, y: number, ease: Move['ease'], ids: number[]): Move[] => [
  { at, dur, actor: 'bot', do: 'moveTo', to: { x, y }, ease },
  ...ids.map((i): Move => ({ at, dur, actor: `b${i}`, do: 'moveTo', to: { x: x + BAL[i].dx, y: y + BAL[i].dy }, ease })),
]
/** 氣球交到機器人手上：出現、拉一條線 */
const give = (at: number, i: number): [Move, Fx] => [
  { at, actor: `b${i}`, do: 'pop', dur: 0.2 },
  { at, kind: 'line', actor: 'bot', dx: HAND.dx, dy: HAND.dy, target: `b${i}`, dur: SNAP[i] - at, color: '#ffffff', width: 0.35 },
]
const gifts = [give(1.5, 0), give(2.75, 1), give(2.85, 2), give(2.95, 3), give(4.0, 4), give(4.15, 5)]

export default scene({
  duration: DUR,
  bg: { top: '#8ED1FC', bottom: '#E6F7FF', floor: '#95D47A', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 16, y: on(74, 34), size: 34 },
    { id: 'slide', emoji: '🛝', x: 146, y: on(74, 30), size: 30 },
    { id: 'hole', emoji: '🕳️', x: X, y: 74.5, size: 22, hidden: true },
    { id: 'bb', emoji: '🎈', x: 30, y: B - 22, size: 8, float: true },
    { id: 'bun', emoji: '🐿️', x: 30, y: B, size: 13, float: true, flip: true },
    ...BAL.map((b, i) => ({ id: `b${i}`, emoji: '🎈', x: X + b.dx, y: GR + b.dy, size: 8, hidden: true, float: true })),
    { id: 'bot', emoji: 'hero:robot/idle', x: 176, y: GR, size: R },
  ],
  moves: [
    // 松鼠拉著氣球，輕輕飄起來
    { at: 0.05, actor: 'bun', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.4, actor: 'bun', do: 'moveTo', to: { x: 40, y: 40 }, dur: 1.0, ease: 'inOut' },
    { at: 0.4, actor: 'bb', do: 'moveTo', to: { x: 40, y: 18 }, dur: 1.0, ease: 'inOut' },
    // 機器人走進來，敲敲胸口：鏘鏘
    { at: 0.1, actor: 'bot', do: 'moveTo', to: { x: X, y: GR }, dur: 0.8, ease: 'out' },
    { at: 1.0, actor: 'bot', do: 'tilt', amount: -8, dur: 0.15 },
    { at: 1.2, actor: 'bot', do: 'tilt', amount: -8, dur: 0.15 },
    // 拿一顆，用力想飄……動也不動
    ...gifts.map(([m]) => m),
    { at: 1.8, actor: 'bot', do: 'squash', amount: -0.15, dur: 0.4 },
    // 松鼠飄下來再給三顆
    { at: 2.3, actor: 'bun', do: 'moveTo', to: { x: 66, y: 46 }, dur: 0.45, ease: 'out' },
    { at: 2.3, actor: 'bb', do: 'moveTo', to: { x: 66, y: 24 }, dur: 0.45, ease: 'out' },
    // 腳跟抬一下，又咚地踩回地上
    ...fly(3.2, 0.25, X, GR - 3, 'out', [0, 1, 2, 3]),
    ...fly(3.45, 0.12, X, GR, 'in', [0, 1, 2, 3]),
    // 松鼠再抱來一大把，機器人慢慢升空！
    { at: 3.7, actor: 'bun', do: 'moveTo', to: { x: 66, y: 34 }, dur: 0.4, ease: 'out' },
    { at: 3.7, actor: 'bb', do: 'moveTo', to: { x: 66, y: 12 }, dur: 0.4, ease: 'out' },
    ...fly(4.5, 1.0, X, GR - UP, 'inOut', [0, 1, 2, 3, 4, 5]),
    { at: 4.5, actor: 'bot', do: 'swap', emoji: 'hero:robot/happy' },
    // 線一條一條斷掉，氣球飛走
    ...SNAP.map((t, i): Move => ({ at: t, actor: `b${i}`, do: 'moveTo', to: { x: X + BAL[i].dx * 2, y: -20 }, dur: 0.7, ease: 'in' })),
    { at: 5.65, actor: 'bot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 5.7, actor: 'bot', do: 'shake', amount: 0.6, dur: 0.4 },
    // 鏘！砸進地上
    { at: 6.25, actor: 'bot', do: 'moveTo', to: { x: X, y: GR + 4 }, dur: 0.3, ease: 'in' },
    { at: 6.55, actor: 'hole', do: 'pop', dur: 0.15 },
    { at: 6.55, actor: 'bot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 松鼠湊過來看
    { at: 6.8, actor: 'bun', do: 'moveTo', to: { x: 66, y: B }, dur: 0.4, ease: 'out' },
    { at: 6.8, actor: 'bb', do: 'moveTo', to: { x: 66, y: B - 22 }, dur: 0.4, ease: 'out' },
    { at: 7.25, actor: 'bun', do: 'tilt', amount: 12, dur: 0.3 },
    // 一彈站起來，一點事都沒有
    { at: 7.5, actor: 'bot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 7.5, actor: 'bot', do: 'moveTo', to: { x: X + 8, y: GR }, arc: 10, dur: 0.4, anticipate: 2, ease: 'out' },
    { at: 7.5, actor: 'bot', do: 'scaleTo', amount: 2.3, dur: 0.4, ease: 'back' },
    { at: 7.5, actor: 'bun', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.4, actor: 'bot', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 0.4, kind: 'line', actor: 'bun', dx: 0, dy: -5, target: 'bb', dur: DUR - 0.4, color: '#ffffff', width: 0.35 },
    { at: 0.6, kind: 'pop', actor: 'bun', emoji: '😆', dx: 6, dur: 0.5 },
    { at: 1.0, kind: 'pop', actor: 'bot', emoji: '🔩', dx: 7, dur: 0.6 },
    { at: 1.05, kind: 'burst', actor: 'bot', emoji: '✨', n: 3, dur: 0.4 },
    ...gifts.map(([, f]) => f),
    { at: 2.25, kind: 'pop', actor: 'bot', emoji: '😑', dx: 7, dur: 0.6 },
    { at: 3.57, kind: 'puff', actor: 'bot', n: 6, dur: 0.4 },
    { at: 3.6, kind: 'sweat', actor: 'bot' },
    { at: 5.0, kind: 'burst', actor: 'bun', emoji: '🎉', n: 5, dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'bot', emoji: '😱', dx: 8, dur: 0.6 },
    { at: 6.55, kind: 'puff', actor: 'bot', n: 12, dur: 0.7 },
    { at: 6.6, kind: 'burst', actor: 'hole', emoji: '🪨', n: 5, dur: 0.6 },
    { at: 6.7, kind: 'dizzy', actor: 'bot', dur: 0.6 },
    { at: 7.2, kind: 'pop', actor: 'bun', emoji: '❓', dx: 5, dur: 0.5 },
    { at: 7.9, kind: 'burst', actor: 'bot', emoji: '✨', n: 8, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'bot', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 4.6, dur: 0.9, do: 'zoom', amount: 1.2, to: { x: 84, y: 36 } },
    { at: 6.2, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 6.55, dur: 0.45, do: 'shake', amount: 1.8 },
    { at: 6.55, dur: 0.3, do: 'punch', amount: 0.12, to: { x: X, y: 66 } },
    { at: 7.6, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 94, y: 44 } },
  ],
  lights: [
    { at: 6.55, dur: 0.05, level: -0.35 },
    { at: 6.6, dur: 0.3, level: 0.15 },
    { at: 7.5, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'boing' },
    { at: 1.0, sfx: 'clink' },
    { at: 1.2, sfx: 'clink' },
    { at: 1.5, sfx: 'blip' },
    { at: 2.75, sfx: 'blip' },
    { at: 3.45, sfx: 'bonk' },
    { at: 4.0, sfx: 'bubble' },
    { at: 4.5, sfx: 'whoosh' },
    { at: 5.6, sfx: 'poof' },
    { at: 5.9, sfx: 'poof' },
    { at: 6.55, sfx: 'crack' },
    { at: 7.5, sfx: 'boing' },
    { at: 7.8, say: '鋼鐵人' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
