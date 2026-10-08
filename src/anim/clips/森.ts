import type { Clip, Move } from '../clip'

// 森：小熊拿著指南針在森林裡找路回家，走出畫面右邊、又從左邊走回來，每次都經過同一棵有貓頭鷹的樹，貓頭鷹揮手揮到不耐煩。
// 第三次小熊氣得跺腳，三棵樹嚇得跳起來變成三個「木」拼成「森」。最後小熊轉頭一看——家其實一開始就在後面。森、森、森林
const walk = (at: number, dur: number, x: number): Move[] => [
  { at, dur, actor: 'bear', do: 'moveTo', to: { x, y: 71.5 } },
  { at, dur, actor: 'compass', do: 'moveTo', to: { x: x + 6, y: 69 } },
  ...(dur > 0.1 ? [{ at, dur, actor: 'bear', do: 'bounce' as const, amount: 1.5, times: Math.round(dur * 5) }] : []),
]

const clip: Clip = {
  char: '森',
  meta: { theme: '森林迷路', cast: '小熊＋貓頭鷹＋樹', gags: ['一直經過同一棵樹', '貓頭鷹揮手揮到煩', '跺腳嚇跳樹', '家其實一直在後面'] },
  duration: 10,
  bg: { top: '#E4F3E1', bottom: '#C6E3C0', floor: '#7A9F55', scenery: 'forest' },
  actors: [
    { id: 'house', emoji: '🏠', x: 9, y: 71.1, size: 14, hidden: true },
    { id: 'owlTree', emoji: '🌲', x: 27, y: 69.4, size: 18, hidden: true },
    { id: 'owl', emoji: '🦉', x: 28, y: 58.5, size: 7, hidden: true, float: true },
    { id: 'tB', emoji: '🌳', x: 62, y: 70.3, size: 16, hidden: true },
    { id: 'tC', emoji: '🌲', x: 94, y: 70.3, size: 16, hidden: true },
    { id: 'tD', emoji: '🌳', x: 128, y: 70.3, size: 16, hidden: true },
    { id: 'e1', emoji: '🌲', x: 140, y: 72.8, size: 10, hidden: true },
    { id: 'e2', emoji: '🌳', x: 152, y: 72.8, size: 10, hidden: true },
    { id: 'bear', emoji: '🐻', x: -15, y: 71.5, size: 13 },
    { id: 'compass', emoji: '🧭', x: -9, y: 69, size: 5, float: true },
  ],
  moves: [
    { at: 0, actor: 'house', do: 'pop' },
    { at: 0, actor: 'owlTree', do: 'pop' },
    { at: 0.1, actor: 'tB', do: 'pop' }, { at: 0.15, actor: 'tC', do: 'pop' }, { at: 0.2, actor: 'tD', do: 'pop' },
    { at: 0.25, actor: 'owl', do: 'pop' },
    // 第一圈：看指南針，往右走
    ...walk(0.1, 1.1, 70),
    { at: 1.3, actor: 'compass', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.3, actor: 'compass', do: 'flash', dur: 0.4 },
    ...walk(1.7, 0.6, 175),
    // 第二圈：咦？這棵樹好眼熟
    ...walk(2.35, 0.01, -15),
    ...walk(2.4, 0.5, 40),
    { at: 2.75, actor: 'owl', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 3.0, actor: 'bear', do: 'tilt', amount: -12, dur: 0.4 },
    ...walk(3.4, 0.55, 175),
    // 第三圈：又是你！
    ...walk(4.0, 0.01, -15),
    ...walk(4.05, 0.4, 42),
    { at: 4.6, actor: 'compass', do: 'spin', times: 4, dur: 0.6 },
    // 氣得跺腳——樹嚇得跳起來
    { at: 4.95, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.15 },
    { at: 5.1, actor: 'bear', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 5.1, actor: 'owl', do: 'hop', amount: 6, dur: 0.35 },
    { at: 5.1, actor: 'tB', do: 'hop', amount: 5, dur: 0.15 },
    { at: 5.2, actor: 'tB', do: 'vanish', dur: 0.15 },
    { at: 5.45, actor: 'tC', do: 'hop', amount: 5, dur: 0.15 },
    { at: 5.6, actor: 'tC', do: 'vanish', dur: 0.15 },
    { at: 5.85, actor: 'tD', do: 'hop', amount: 5, dur: 0.15 },
    { at: 6.0, actor: 'tD', do: 'vanish', dur: 0.15 },
    // 森林長出來
    { at: 7.3, actor: 'e1', do: 'pop' },
    { at: 7.4, actor: 'e2', do: 'pop' },
    // 轉頭一看：家就在後面
    { at: 8.2, actor: 'bear', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 8.6, actor: 'bear', do: 'hop', amount: 6, dur: 0.35 },
    ...walk(9.0, 0.4, 13),
    { at: 9.4, actor: 'bear', do: 'vanish', dur: 0.2 },
    { at: 9.4, actor: 'compass', do: 'vanish', dur: 0.2 },
    { at: 9.55, actor: 'house', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
  ],
  builds: [
    // 三棵嚇跳的樹 → 三個木
    { at: 5.2, dur: 0.5, strokes: [4, 5, 6, 7], from: 'tB', color: '#2F8A4C' },
    { at: 5.6, dur: 0.5, strokes: [0, 1, 2, 3], from: 'tC', color: '#7A5230' },
    { at: 6.0, dur: 0.5, strokes: [8, 9, 10, 11], from: 'tD', color: '#2F8A4C' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.45, kind: 'pop', actor: 'owl', emoji: '👋', dur: 0.5 },
    { at: 1.25, kind: 'bubble', actor: 'bear', emoji: '🏠', dur: 0.5 },
    { at: 2.7, kind: 'pop', actor: 'owl', emoji: '👋', dur: 0.5 },
    { at: 3.0, kind: 'bubble', actor: 'bear', emoji: '❓', dur: 0.4 },
    { at: 3.1, kind: 'sweat', actor: 'bear' },
    { at: 4.3, kind: 'bubble', actor: 'owl', emoji: '😑', dur: 0.7, dx: 4 },
    { at: 4.45, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.5 },
    { at: 5.1, kind: 'puff', actor: 'bear' },
    { at: 5.1, kind: 'burst', actor: 'bear', emoji: '💢', n: 1, dur: 0.4 },
    { at: 5.6, kind: 'dizzy', actor: 'compass', dur: 1.0 },
    { at: 7.6, kind: 'zzz', actor: 'owl', emoji: '🎵', dur: 0.8 },
    { at: 8.5, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.4 },
    { at: 8.7, kind: 'sweat', actor: 'bear' },
    { at: 8.9, kind: 'bubble', actor: 'owl', emoji: '🙄', dur: 0.6, dx: 4 },
  ],
  camera: [
    { at: 4.45, dur: 0.7, do: 'punch', amount: 0.3, to: { x: 36, y: 62 } },
    { at: 5.1, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.3, sfx: 'blip' },
    { at: 1.5, say: '森' },
    { at: 2.7, sfx: 'tap' },
    { at: 4.45, sfx: 'boing' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 5.1, sfx: 'bonk' },
    { at: 6.55, say: '森' },
    { at: 7.3, sfx: 'plop' },
    { at: 7.5, say: '森林' },
    { at: 8.5, sfx: 'blip' },
    { at: 9.4, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
