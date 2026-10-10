import type { Clip } from '../clip'

// 粉：小豬做麵包，要把一袋麵粉倒進碗裡。拍一拍袋子——沒倒出來；用力一甩，整袋麵粉「噗」地蓋在自己頭上！
// 小豬全身白白的像個鬼，嚇得小貓跳起來。小豬抖一抖，麵粉飛成「粉」。小貓好奇地聞一下……哈啾！也變成白白的。粉、粉、麵粉
const clip: Clip = {
  char: '粉',
  meta: { theme: '做麵包', cast: '小豬＋麵粉袋＋小貓', gags: ['倒不出來', '整袋蓋在頭上', '白白的像鬼', '噴嚏也變白'] },
  duration: 10,
  bg: { top: '#FFEFD9', bottom: '#FFF8EE', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'bowl', emoji: '🥣', x: 46, y: 72, size: 12, hidden: true },
    { id: 'pig', emoji: '🐷', x: 30, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'ghost', emoji: '🐷', x: 30, y: 69.5, size: 18, hidden: true, flip: true, tint: 'grayscale(1) brightness(1.6)' },
    { id: 'bag', emoji: '🛍️', x: 40, y: 56, size: 12, hidden: true, float: true, tint: 'grayscale(1) brightness(1.3)' },
    { id: 'cat', emoji: '🐱', x: 128, y: 69.5, size: 17, hidden: true },
    { id: 'whiteCat', emoji: '🐱', x: 128, y: 69.5, size: 17, hidden: true, tint: 'grayscale(1) brightness(1.6)' },
  ],
  moves: [
    { at: 0, actor: 'bowl', do: 'pop' },
    { at: 0.1, actor: 'pig', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    { at: 0.4, actor: 'cat', do: 'enter', from: { x: 178, y: 69.5 }, dur: 0.7 },
    { at: 0.9, actor: 'bag', do: 'pop' },
    // 拍一拍袋子——沒倒出來
    { at: 1.8, actor: 'bag', do: 'moveTo', to: { x: 44, y: 54 }, dur: 0.3 },
    { at: 2.1, actor: 'bag', do: 'tilt', amount: 120, dur: 0.6 },
    { at: 2.4, actor: 'bag', do: 'shake', amount: 1, dur: 0.4 },
    // 用力一甩——整袋蓋在自己頭上
    { at: 3.3, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 3.6, actor: 'bag', do: 'moveTo', to: { x: 30, y: 30 }, dur: 0.35, arc: 6 },
    { at: 3.6, actor: 'bag', do: 'spin', dur: 0.35 },
    { at: 3.95, actor: 'bag', do: 'moveTo', to: { x: 30, y: 60 }, dur: 0.2 },
    { at: 4.15, actor: 'pig', do: 'vanish', dur: 0.1 },
    { at: 4.15, actor: 'ghost', do: 'pop', dur: 0.15 },
    { at: 4.15, actor: 'bag', do: 'vanish', dur: 0.2 },
    // 白白的像鬼——小貓嚇得跳起來
    { at: 4.9, actor: 'ghost', do: 'moveTo', to: { x: 40, y: 69.5 }, dur: 0.5 },
    { at: 5.2, actor: 'cat', do: 'hop', amount: 18, dur: 0.5 },
    // 小豬抖一抖
    { at: 5.9, actor: 'ghost', do: 'shake', amount: 2, dur: 0.6 },
    { at: 6.5, actor: 'ghost', do: 'vanish', dur: 0.1 },
    { at: 6.5, actor: 'pig', do: 'moveTo', to: { x: 26, y: 69.5 }, dur: 0.01 },
    { at: 6.52, actor: 'pig', do: 'pop', dur: 0.15 },
    // 小貓好奇地聞一下……哈啾！
    { at: 8.0, actor: 'cat', do: 'moveTo', to: { x: 120, y: 69.5 }, dur: 0.3 },
    { at: 8.4, actor: 'cat', do: 'squash', amount: -0.25, dur: 0.35 },
    { at: 8.75, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.8, actor: 'cat', do: 'vanish', dur: 0.05 },
    { at: 8.8, actor: 'whiteCat', do: 'moveTo', to: { x: 120, y: 69.5 }, dur: 0.01 },
    { at: 8.82, actor: 'whiteCat', do: 'pop', dur: 0.1 },
  ],
  builds: [
    // 抖下來的麵粉：米、分
    { at: 6.0, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'ghost', color: '#E3A23A' },
    { at: 6.4, dur: 0.6, strokes: [6, 7, 8, 9], from: 'ghost', color: '#8A5A3B' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'pig', emoji: '🍞', dur: 0.8 },
    { at: 2.7, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.6 },
    { at: 4.15, kind: 'burst', actor: 'ghost', emoji: '☁️', n: 8, dur: 0.7 },
    { at: 4.5, kind: 'pop', actor: 'ghost', emoji: '😳', dur: 0.6 },
    { at: 5.2, kind: 'pop', actor: 'cat', emoji: '😱', dur: 0.7 },
    { at: 5.9, kind: 'burst', actor: 'ghost', emoji: '☁️', n: 6, dur: 0.6 },
    { at: 7.2, kind: 'pop', actor: 'pig', emoji: '😅', dur: 0.8 },
    { at: 8.75, kind: 'burst', actor: 'whiteCat', emoji: '☁️', n: 6, dur: 0.5 },
  ],
  camera: [
    { at: 4.1, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 32, y: 60 } },
  ],
  cues: [
    { at: 1.0, say: '粉' },
    { at: 2.4, sfx: 'tap' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 4.15, sfx: 'poof' },
    { at: 5.2, sfx: 'boing' },
    { at: 5.9, sfx: 'poof' },
    { at: 7.1, say: '粉' },
    { at: 8.0, say: '麵粉' },
    { at: 8.75, sfx: 'achoo' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
