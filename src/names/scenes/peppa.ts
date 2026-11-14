// 演的是字面意思：佩（佩戴、戴在身上）＋佩＋豬——一隻跑第一名的小豬，被公雞一樣一樣「佩」戴上獎牌、皇冠、蝴蝶結、獎盃，重到走不動，最後一隻蝴蝶停上來就整個垮掉（不是側臉粉紅豬、沒穿裙子、沒有泥巴坑）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 運動會：小豬衝過終點旗，第一名！裁判公雞把獎牌丟過來，掛在脖子上；再丟皇冠、蝴蝶結、大獎盃……小豬越來越沉。
// 想走上頒獎台：腳抬不起來。公雞再插一朵小花在最上面——小豬抖了抖……撐住了（停一拍，鬆一口氣）。
// 一隻小蝴蝶輕輕停上去——垮！小豬整個趴平，東西噴滿地。小豬一彈起來，輕輕鬆鬆跳上頒獎台，獎牌和皇冠飛回身上，閃光燈一閃：「佩佩豬」。
const on = (surface: number, size: number) => surface + 3 - 0.42 * size // 站在某個面上的 y
const P = on(74, 20) // 小豬（size 20）站在地上的 y
const START = 52
const BOX = { x: 112, y: on(74, 20) } // 頒獎台（📦 size 20）
const TOP = 58.5 // 頒獎台頂面
// 戴在身上的東西：相對小豬的位置（小豬朝右，頭在右邊）
const WEAR: Record<string, { dx: number; dy: number }> = {
  medal: { dx: 7, dy: -2 },
  crown: { dx: 5, dy: -11 },
  bow: { dx: -9, dy: -8 },
  cup: { dx: -1, dy: -12.5 },
  flower: { dx: -1, dy: -23.5 },
  fly: { dx: 0, dy: -29.5 },
}
const at = (id: string, x: number, y: number, k = 1) => ({ x: x + WEAR[id].dx * k, y: y + WEAR[id].dy * k })

/** 小豬的移動，身上的東西照抄 */
const wear = (moves: Move[], ids: string[]): Move[] => moves.flatMap((m) => {
  if (m.do !== 'moveTo') return [m]
  return [m, ...ids.map((id): Move => ({ ...m, actor: id, to: at(id, m.to!.x, m.to!.y) }))]
})
/** 從公雞丟到小豬身上 */
const toss = (t: number, id: string, x = START): Move[] => [
  { at: t, actor: id, do: 'pop', dur: 0.1 },
  { at: t, actor: id, do: 'moveTo', to: at(id, x, P), arc: 12, dur: 0.4, ease: 'out' },
  { at: t, actor: id, do: 'spin', times: 1, dur: 0.4 },
]
const ROO = { x: 134, y: on(74, 18) }

export default scene({
  duration: 9.3,
  bg: { top: '#A8D8FF', bottom: '#EAF6FF', floor: '#E9926B', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: 30, y: on(74, 22), size: 22 },
    { id: 'box', emoji: '📦', x: BOX.x, y: BOX.y, size: 20 },
    { id: 'pig', emoji: '🐖', x: START, y: P, size: 20, flip: true },
    { id: 'bow', emoji: '🎀', x: ROO.x, y: ROO.y - 6, size: 8, hidden: true, pivot: 'center' },
    { id: 'medal', emoji: '🥇', x: ROO.x, y: ROO.y - 6, size: 8, hidden: true, pivot: 'center' },
    { id: 'cup', emoji: '🏆', x: ROO.x, y: ROO.y - 6, size: 12, hidden: true, pivot: 'center' },
    { id: 'crown', emoji: '👑', x: ROO.x, y: ROO.y - 6, size: 8, hidden: true, pivot: 'center' },
    { id: 'flower', emoji: '🌼', x: ROO.x, y: ROO.y - 6, size: 8, hidden: true, pivot: 'center' },
    { id: 'fly', emoji: '🦋', x: 170, y: 20, size: 7, float: true },
    { id: 'roo', emoji: '🐓', x: ROO.x, y: ROO.y, size: 18 },
  ],
  moves: [
    // 衝過終點，第一名！
    { at: 0.05, actor: 'pig', do: 'enter', from: { x: -14, y: P }, dur: 0.7, anticipate: 3, ease: 'back' },
    { at: 0.8, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.8, actor: 'roo', do: 'hop', amount: 3, dur: 0.3 },
    // 公雞一樣一樣丟過來
    ...toss(1.0, 'medal'),
    { at: 1.45, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
    { at: 1.45, actor: 'medal', do: 'hop', amount: 2, dur: 0.25 },
    ...toss(1.7, 'crown'),
    ...toss(2.3, 'bow'),
    ...toss(2.9, 'cup'),
    { at: 3.3, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.35 },
    // 想走上頒獎台：腳抬不起來
    ...wear([{ at: 3.75, actor: 'pig', do: 'moveTo', to: { x: START + 4, y: P }, dur: 0.5, ease: 'out' }], ['medal', 'crown', 'bow', 'cup']),
    { at: 3.75, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.5 },
    // 公雞走過來，在最上面插一朵小花
    { at: 4.2, actor: 'roo', do: 'moveTo', to: { x: START + 36, y: ROO.y }, dur: 0.4, ease: 'out' },
    { at: 4.65, actor: 'flower', do: 'pop', dur: 0.1 },
    { at: 4.65, actor: 'flower', do: 'moveTo', to: at('flower', START + 4, P), arc: 4, dur: 0.3, ease: 'out' },
    { at: 4.95, actor: 'pig', do: 'shake', amount: 0.4, dur: 0.3 },
    // 撐住了……一隻小蝴蝶飄下來
    { at: 5.3, actor: 'fly', do: 'moveTo', to: at('fly', START + 4, P), dur: 0.7, ease: 'out' },
    // 垮！
    { at: 6.1, actor: 'pig', do: 'squash', amount: 0.5, dur: 0.5 },
    { at: 6.1, actor: 'medal', do: 'moveTo', to: { x: 30, y: on(74, 8) }, arc: 10, dur: 0.5, ease: 'out' },
    { at: 6.1, actor: 'crown', do: 'moveTo', to: { x: 84, y: on(74, 8) }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 6.1, actor: 'bow', do: 'moveTo', to: { x: 20, y: on(74, 8) }, arc: 8, dur: 0.5, ease: 'out' },
    { at: 6.1, actor: 'cup', do: 'moveTo', to: { x: 44, y: on(74, 12) }, arc: 12, dur: 0.5, ease: 'out' },
    { at: 6.1, actor: 'flower', do: 'moveTo', to: { x: 72, y: on(74, 8) }, arc: 16, dur: 0.5, ease: 'out' },
    ...['medal', 'crown', 'bow', 'cup', 'flower'].map((id, i): Move => ({ at: 6.1, actor: id, do: 'spin', times: i % 2 ? 2 : -2, dur: 0.5 })),
    { at: 6.1, actor: 'fly', do: 'moveTo', to: { x: 70, y: 22 }, dur: 0.6, ease: 'out' },
    { at: 6.1, actor: 'roo', do: 'hop', amount: 5, dur: 0.35 },
    // 一彈起來，輕輕鬆鬆跳上頒獎台，獎牌、皇冠飛回來
    { at: 6.8, actor: 'pig', do: 'moveTo', to: { x: BOX.x, y: on(TOP, 20) }, arc: 12, dur: 0.45, anticipate: 3, ease: 'out' },
    { at: 7.25, actor: 'pig', do: 'scaleTo', amount: 1.5, dur: 0.35, ease: 'back' },
    { at: 7.3, actor: 'medal', do: 'moveTo', to: at('medal', BOX.x, on(TOP, 20), 1.5), arc: 10, dur: 0.35, ease: 'out' },
    { at: 7.3, actor: 'medal', do: 'scaleTo', amount: 1.5, dur: 0.35 },
    { at: 7.4, actor: 'crown', do: 'moveTo', to: at('crown', BOX.x, on(TOP, 20), 1.5), arc: 10, dur: 0.35, ease: 'out' },
    { at: 7.4, actor: 'crown', do: 'scaleTo', amount: 1.5, dur: 0.35 },
    { at: 7.4, actor: 'fly', do: 'moveTo', to: { x: BOX.x - 22, y: 30 }, dur: 0.5 },
    { at: 7.9, actor: 'roo', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 0.75, kind: 'puff', actor: 'pig', n: 6, dur: 0.5 },
    { at: 0.8, kind: 'burst', actor: 'flag', emoji: '⭐', n: 5, dur: 0.6 },
    { at: 1.45, kind: 'burst', actor: 'medal', emoji: '✨', n: 4, dur: 0.5 },
    { at: 3.35, kind: 'sweat', actor: 'pig' },
    { at: 3.9, kind: 'pop', actor: 'pig', emoji: '😣', dx: 10, dur: 0.6 },
    { at: 5.3, kind: 'pop', actor: 'pig', emoji: '😅', dx: 12, dur: 0.6 },
    { at: 6.1, kind: 'puff', actor: 'pig', n: 10, dur: 0.6 },
    { at: 6.15, kind: 'burst', actor: 'pig', emoji: '💥', n: 1, dur: 0.4 },
    { at: 6.3, kind: 'dizzy', actor: 'pig', dur: 0.5 },
    { at: 6.3, kind: 'pop', actor: 'roo', emoji: '😱', dx: -6, dur: 0.5 },
    { at: 7.4, kind: 'burst', actor: 'pig', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 7.55, kind: 'burst', actor: 'pig', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 4.6, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 66, y: 54 } },
    { at: 6.1, dur: 0.4, do: 'shake', amount: 1.5 },
    { at: 6.2, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 106, y: 46 } },
  ],
  lights: [
    { at: 7.6, dur: 0.05, level: -0.4 },
    { at: 7.65, dur: 0.3, level: 0 },
    { at: 8.0, dur: 0.05, level: -0.3 },
    { at: 8.05, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.8, sfx: 'cheer' },
    { at: 1.4, sfx: 'clink' },
    { at: 2.1, sfx: 'clink' },
    { at: 2.7, sfx: 'clink' },
    { at: 3.3, sfx: 'bonk' },
    { at: 3.75, sfx: 'rumble' },
    { at: 4.95, sfx: 'tap' },
    { at: 6.1, sfx: 'crack' },
    { at: 6.8, sfx: 'boing' },
    { at: 7.6, say: '佩佩豬' },
    { at: 7.65, sfx: 'clink' },
  ],
})
