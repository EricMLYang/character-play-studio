// 演的是字面意思：小＋紅＋帽——一隻小兔子戴著一頂小小的紅帽子，風把帽子吹到樹上，他怎麼跳都搆不到（老童話，沒有人物、沒有外婆和野狼）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 早上的樹林：小兔子戴著紅帽子一蹦一蹦跳進來。一陣風——帽子飛走，卡在大樹頂上，樹上的小鳥看熱鬧。
// 小兔子跳一下，差好遠；再用力跳，還是差一點（小鳥偷笑）。他退後、衝刺、一頭撞上樹幹！……什麼都沒掉下來，只飄下一片葉子（停一拍）。
// 然後咚！一顆蘋果先敲到他頭，帽子才慢慢掉下來，剛好戴回頭上。他挺胸變大：「小紅帽」。
const G = 70.3 // 小兔子（size 16）站在地上的 y
const HAT = { dx: 3.5, dy: -7.5 } // 紅帽子戴在兔子頭上（兔子朝右）
const TOP = { x: 116, y: 22 } // 帽子卡在樹頂
const RED = 'hue-rotate(130deg) saturate(1.6)' // 🧢 本來是藍的

/** 兔子的動作，帽子照抄一份（位置加上 HAT） */
const withHat = (moves: Move[]): Move[] => moves.flatMap((m) => [
  m,
  { ...m, actor: 'hat', to: m.to && { x: m.to.x + HAT.dx, y: m.to.y + HAT.dy }, from: m.from && { x: m.from.x + HAT.dx, y: m.from.y + HAT.dy } },
])

export default scene({
  duration: 9.3,
  bg: { top: '#9FDcF5', bottom: '#EFFFF0', floor: '#7CC765', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 120, y: 54, size: 54 },
    { id: 'bird', emoji: '🐦', x: 132, y: 30, size: 9, float: true },
    { id: 'shroom', emoji: '🍄', x: 22, y: 72.8, size: 10 },
    { id: 'basket', emoji: '🧺', x: 60, y: 71.1, size: 14 },
    { id: 'leaf', emoji: '🍃', x: 112, y: 30, size: 6, hidden: true, float: true, pivot: 'center' },
    { id: 'apple', emoji: '🍎', x: 104, y: 26, size: 8, hidden: true, pivot: 'center' },
    { id: 'bunny', emoji: '🐇', x: 40, y: G, size: 16, flip: true },
    { id: 'hat', emoji: '🧢', x: 40 + HAT.dx, y: G + HAT.dy, size: 9, flip: true, tint: RED, pivot: 'center' },
    { id: 'wind', emoji: '💨', x: 175, y: 52, size: 16, hidden: true, float: true },
  ],
  moves: [
    // 一蹦一蹦跳進來
    ...withHat([
      { at: 0, actor: 'bunny', do: 'enter', from: { x: -14, y: G }, dur: 1.0, ease: 'out' },
      { at: 0, actor: 'bunny', do: 'hop', amount: 4, dur: 0.33 },
      { at: 0.33, actor: 'bunny', do: 'hop', amount: 4, dur: 0.33 },
      { at: 0.66, actor: 'bunny', do: 'hop', amount: 3, dur: 0.33 },
      { at: 1.05, actor: 'bunny', do: 'hop', amount: 2, dur: 0.25 },
    ]),
    // 一陣風，帽子飛到樹頂卡住
    { at: 1.4, actor: 'wind', do: 'pop', dur: 0.1 },
    { at: 1.4, actor: 'wind', do: 'moveTo', to: { x: 10, y: 50 }, dur: 0.6, ease: 'linear' },
    { at: 2.0, actor: 'wind', do: 'vanish', dur: 0.1 },
    { at: 1.6, actor: 'hat', do: 'moveTo', to: TOP, arc: 16, dur: 0.7, ease: 'out' },
    { at: 1.6, actor: 'hat', do: 'spin', times: 2, dur: 0.7 },
    { at: 2.35, actor: 'hat', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 1.65, actor: 'bunny', do: 'tilt', amount: -10, dur: 0.4 },
    // 追到樹下
    { at: 2.2, actor: 'bunny', do: 'moveTo', to: { x: 104, y: G }, dur: 0.6, ease: 'in' },
    // 跳一下：差好遠
    { at: 2.95, actor: 'bunny', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 3.15, actor: 'bunny', do: 'hop', amount: 9, dur: 0.5 },
    // 再用力：還是差一點
    { at: 3.95, actor: 'bunny', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.25, actor: 'bunny', do: 'hop', amount: 17, dur: 0.65 },
    { at: 3.7, actor: 'bird', do: 'hop', amount: 2, dur: 0.25 },
    { at: 4.9, actor: 'bird', do: 'hop', amount: 2, dur: 0.25 },
    // 退後、衝刺、撞樹
    { at: 5.0, actor: 'bunny', do: 'moveTo', to: { x: 76, y: G }, dur: 0.4, ease: 'out' },
    { at: 5.5, actor: 'bunny', do: 'moveTo', to: { x: 104, y: G }, dur: 0.25, anticipate: 4, ease: 'in' },
    { at: 5.75, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 5.75, actor: 'bunny', do: 'moveTo', to: { x: 96, y: G }, dur: 0.3, ease: 'out' },
    { at: 5.75, actor: 'bunny', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.75, actor: 'bird', do: 'hop', amount: 5, dur: 0.4 },
    // ……什麼都沒掉，只飄下一片葉子
    { at: 6.0, actor: 'leaf', do: 'pop', dur: 0.1 },
    { at: 6.0, actor: 'leaf', do: 'moveTo', to: { x: 98, y: 52 }, dur: 0.75, ease: 'linear' },
    { at: 6.0, actor: 'leaf', do: 'tilt', amount: 30, dur: 0.75 },
    { at: 6.75, actor: 'leaf', do: 'vanish', dur: 0.15 },
    // 咚！蘋果先敲到頭，彈進籃子
    { at: 6.75, actor: 'apple', do: 'pop', dur: 0.05 },
    { at: 6.75, actor: 'apple', do: 'moveTo', to: { x: 98, y: 52 }, dur: 0.25, ease: 'in' },
    { at: 7.0, actor: 'apple', do: 'moveTo', to: { x: 60, y: 66 }, arc: 12, dur: 0.5, ease: 'out' },
    { at: 7.0, actor: 'apple', do: 'spin', times: -2, dur: 0.5 },
    { at: 7.0, actor: 'bunny', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 7.5, actor: 'basket', do: 'squash', amount: 0.2, dur: 0.2 },
    // 帽子慢慢掉下來，剛好戴回頭上，他挺胸變大
    { at: 7.0, actor: 'hat', do: 'moveTo', to: { x: 96 + HAT.dx, y: G + HAT.dy }, dur: 0.45, ease: 'bounce' },
    { at: 7.6, actor: 'bunny', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'hat', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'hat', do: 'moveTo', to: { x: 96 + HAT.dx * 1.6, y: G + HAT.dy * 1.6 }, dur: 0.35, ease: 'back' },
    { at: 8.1, actor: 'bird', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 1.05, kind: 'pop', actor: 'bunny', emoji: '🎵', dx: -8, dur: 0.5 },
    { at: 1.45, kind: 'burst', actor: 'tree', emoji: '🍃', n: 6, dur: 0.7 },
    { at: 1.7, kind: 'pop', actor: 'bunny', emoji: '😱', dx: -10, dur: 0.6 },
    { at: 3.6, kind: 'pop', actor: 'bunny', emoji: '😅', dx: -10, dur: 0.5 },
    { at: 3.75, kind: 'pop', actor: 'bird', emoji: '😆', dx: 6, dur: 0.6 },
    { at: 4.6, kind: 'sweat', actor: 'bunny' },
    { at: 5.5, kind: 'puff', actor: 'bunny', dur: 0.3 },
    { at: 5.75, kind: 'burst', actor: 'bunny', n: 1, dur: 0.4 },
    { at: 5.9, kind: 'dizzy', actor: 'bunny', dur: 0.8 },
    { at: 6.35, kind: 'pop', actor: 'bunny', emoji: '😑', dx: -10, dur: 0.5 },
    { at: 7.0, kind: 'burst', actor: 'bunny', emoji: '⭐', n: 5, dur: 0.6 },
    { at: 7.6, kind: 'burst', actor: 'hat', emoji: '✨', n: 9, dur: 0.9 },
    { at: 7.9, kind: 'burst', actor: 'bunny', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 8.1, kind: 'pop', actor: 'bird', emoji: '💕', dx: 6, dur: 0.6 },
  ],
  camera: [
    { at: 4.2, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 110, y: 42 } },
    { at: 4.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.75, dur: 0.4, do: 'shake', amount: 1.4 },
    { at: 7.0, dur: 0.3, do: 'punch', amount: 0.1, to: { x: 98, y: 55 } },
    { at: 7.6, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 100, y: 60 } },
  ],
  lights: [
    { at: 1.4, dur: 0.3, level: 0.15 },
    { at: 2.0, dur: 0.4, level: 0 },
    { at: 7.55, dur: 0.05, level: -0.35 },
    { at: 7.6, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'boing' },
    { at: 1.4, sfx: 'whoosh' },
    { at: 2.35, sfx: 'tap' },
    { at: 3.15, sfx: 'boing' },
    { at: 3.75, sfx: 'blip' },
    { at: 4.25, sfx: 'boing' },
    { at: 5.5, sfx: 'slide' },
    { at: 5.75, sfx: 'bonk' },
    { at: 7.0, sfx: 'bonk' },
    { at: 7.45, sfx: 'plop' },
    { at: 7.75, say: '小紅帽' },
    { at: 8.1, sfx: 'cheer' },
  ],
})
