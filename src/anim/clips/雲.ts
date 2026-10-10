import type { Clip } from '../clip'

// 雲：小飛機想穿過一朵大雲，結果雲軟得像彈簧床——「咚」被彈回來；加速再衝，被彈到畫面外。第三次衝進去，雲咕嚕咕嚕把它吞了，
// 「砰」炸開變成「雲」。天上冒出好多小雲朵，飛機開心去碰一朵最小的——又被彈飛，企鵝笑到打滾。雲、雲、雲朵
const clip: Clip = {
  char: '雲',
  meta: { theme: '飛機穿雲', cast: '小飛機＋彈簧雲＋企鵝', gags: ['被彈回來', '越衝越遠', '雲把飛機吞掉', '小雲也一樣彈'] },
  duration: 10,
  bg: { top: '#9FD3FF', bottom: '#E4F3FF', floor: '#F6FAFF', scenery: 'snow' },
  actors: [
    { id: 'plane', emoji: '✈️', x: 30, y: 40, size: 15, hidden: true, float: true },
    { id: 'cloud', emoji: '☁️', x: 108, y: 36, size: 32, hidden: true, float: true },
    { id: 'c1', emoji: '☁️', x: 20, y: 22, size: 12.5, hidden: true, float: true },
    { id: 'c2', emoji: '☁️', x: 144, y: 50, size: 12.5, hidden: true, float: true },
    { id: 'c3', emoji: '☁️', x: 40, y: 10, size: 11.2, hidden: true, float: true },
    { id: 'peng', emoji: '🐧', x: 144, y: 71.2, size: 13.8, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'plane', do: 'rotateTo', amount: 45, dur: 0 },
    { at: 0, actor: 'plane', do: 'enter', from: { x: -15, y: 40 }, dur: 0.8 },
    { at: 0.1, actor: 'cloud', do: 'pop', dur: 0.4 },
    { at: 0.3, actor: 'peng', do: 'pop' },
    // 第一次：咚，彈回來
    { at: 1.31, actor: 'plane', do: 'moveTo', to: { x: 90, y: 38 }, dur: 0.4 },
    { at: 1.73, actor: 'cloud', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 1.79, actor: 'plane', do: 'moveTo', to: { x: 26, y: 44 }, dur: 0.5 },
    { at: 1.79, actor: 'plane', do: 'spin', dur: 0.5 },
    // 第二次：加速，彈到畫面外
    { at: 2.8, actor: 'plane', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 2.8, actor: 'plane', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.12, actor: 'plane', do: 'moveTo', to: { x: 94, y: 38 }, dur: 0.22 },
    { at: 3.35, actor: 'cloud', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 3.44, actor: 'plane', do: 'moveTo', to: { x: -20, y: 24 }, dur: 0.45 },
    { at: 3.44, actor: 'plane', do: 'spin', dur: 0.45, times: 2 },
    { at: 3.97, actor: 'plane', do: 'moveTo', to: { x: 24, y: 46 }, dur: 0.4 },
    { at: 3.76, actor: 'peng', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
    // 第三次：衝進去，被吞掉
    { at: 4.82, actor: 'plane', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 4.82, actor: 'plane', do: 'flash', dur: 0.35 },
    { at: 5.2, actor: 'plane', do: 'moveTo', to: { x: 108, y: 38 }, dur: 0.3 },
    { at: 5.57, actor: 'cloud', do: 'shake', amount: 2, dur: 0.45 },
    { at: 5.57, actor: 'cloud', do: 'squash', amount: 0.15, dur: 0.45 },
    { at: 6.05, actor: 'cloud', do: 'vanish', dur: 0.15 },
    { at: 6.1, actor: 'plane', do: 'moveTo', to: { x: 136, y: 24 }, dur: 0.4 },
    { at: 6.1, actor: 'plane', do: 'spin', dur: 0.4 },
    { at: 6.5, actor: 'plane', do: 'shake', amount: 1.5, dur: 0.5 },
    // 好多小雲朵
    { at: 7.85, actor: 'c1', do: 'pop' },
    { at: 8, actor: 'c2', do: 'pop' },
    { at: 8.14, actor: 'c3', do: 'pop' },
    { at: 8.18, actor: 'peng', do: 'hop', amount: 4, dur: 0.3 },
    // 去碰最小的那朵——一樣被彈飛
    { at: 8.61, actor: 'plane', do: 'moveTo', to: { x: 140, y: 44 }, dur: 0.3 },
    { at: 8.87, actor: 'c2', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 8.89, actor: 'plane', do: 'moveTo', to: { x: 128, y: 14 }, dur: 0.4 },
    { at: 8.89, actor: 'plane', do: 'spin', dur: 0.4, times: 2 },
    { at: 9.13, actor: 'peng', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
  ],
  builds: [
    // 炸開的雲 → 雨；飛機抖掉身上的雲 → 云
    { at: 6.05, dur: 0.75, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'cloud', color: '#3E8EDE' },
    { at: 6.5, dur: 0.55, strokes: [8, 9, 10, 11], from: 'plane', color: '#8A5CD0' },
  ],
  glyph: [{ at: 7.1, dur: 0.4, do: 'wobble' }, { at: 9.57, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'plane', emoji: '☁️', dur: 0.6 },
    { at: 1.73, kind: 'burst', actor: 'plane', emoji: '💫', n: 1, dur: 0.4, dx: 4 },
    { at: 2.37, kind: 'sweat', actor: 'plane' },
    { at: 2.48, kind: 'bubble', actor: 'peng', emoji: '😆', dur: 0.7, dx: -12 },
    { at: 3.86, kind: 'bubble', actor: 'peng', emoji: '🤣', dur: 0.8, dx: -12 },
    { at: 4.4, kind: 'dizzy', actor: 'plane', dur: 0.4 },
    { at: 4.82, kind: 'pop', actor: 'plane', emoji: '😤', dur: 0.35 },
    { at: 5.68, kind: 'pop', actor: 'peng', emoji: '😮', dur: 0.4 },
    { at: 6.05, kind: 'burst', actor: 'cloud', dur: 0.4 },
    { at: 6.05, kind: 'burst', actor: 'cloud', emoji: '☁️', n: 6, dur: 0.6 },
    { at: 7.9, kind: 'burst', actor: 'peng', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.87, kind: 'burst', actor: 'c2', emoji: '💫', n: 1, dur: 0.4 },
    { at: 9.22, kind: 'dizzy', actor: 'plane', dur: 0.8 },
    { at: 9.22, kind: 'bubble', actor: 'peng', emoji: '🤣', dur: 0.8, dx: -12 },
  ],
  camera: [
    { at: 5.57, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 108, y: 38 } },
    { at: 6.05, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.73, sfx: 'boing' },
    { at: 1.79, say: '雲' },
    { at: 3.12, sfx: 'whoosh' },
    { at: 3.39, sfx: 'boing' },
    { at: 5.2, sfx: 'whoosh' },
    { at: 5.57, sfx: 'gulp' },
    { at: 6.05, sfx: 'poof' },
    { at: 7.05, say: '雲' },
    { at: 8.05, say: '雲朵' },
    { at: 8.87, sfx: 'boing' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
