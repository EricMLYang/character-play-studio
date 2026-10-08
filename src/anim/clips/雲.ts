import type { Clip } from '../clip'

// 雲：小飛機想穿過一朵大雲，結果雲軟得像彈簧床——「咚」被彈回來；加速再衝，被彈到畫面外。第三次衝進去，雲咕嚕咕嚕把它吞了，
// 「砰」炸開變成「雲」。天上冒出好多小雲朵，飛機開心去碰一朵最小的——又被彈飛，企鵝笑到打滾。雲、雲、雲朵
const clip: Clip = {
  char: '雲',
  meta: { theme: '飛機穿雲', cast: '小飛機＋彈簧雲＋企鵝', gags: ['被彈回來', '越衝越遠', '雲把飛機吞掉', '小雲也一樣彈'] },
  duration: 10,
  bg: { top: '#9FD3FF', bottom: '#E4F3FF', floor: '#F6FAFF', scenery: 'snow' },
  actors: [
    { id: 'plane', emoji: '✈️', x: 30, y: 40, size: 12, hidden: true, float: true },
    { id: 'cloud', emoji: '☁️', x: 108, y: 36, size: 32, hidden: true, float: true },
    { id: 'c1', emoji: '☁️', x: 20, y: 22, size: 10, hidden: true, float: true },
    { id: 'c2', emoji: '☁️', x: 144, y: 50, size: 10, hidden: true, float: true },
    { id: 'c3', emoji: '☁️', x: 40, y: 10, size: 9, hidden: true, float: true },
    { id: 'peng', emoji: '🐧', x: 144, y: 72.4, size: 11, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'plane', do: 'rotateTo', amount: 45, dur: 0 },
    { at: 0, actor: 'plane', do: 'enter', from: { x: -15, y: 40 }, dur: 0.8 },
    { at: 0.1, actor: 'cloud', do: 'pop', dur: 0.4 },
    { at: 0.3, actor: 'peng', do: 'pop' },
    // 第一次：咚，彈回來
    { at: 1.3, actor: 'plane', do: 'moveTo', to: { x: 90, y: 38 }, dur: 0.4 },
    { at: 1.7, actor: 'cloud', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 1.75, actor: 'plane', do: 'moveTo', to: { x: 26, y: 44 }, dur: 0.5 },
    { at: 1.75, actor: 'plane', do: 'spin', dur: 0.5 },
    // 第二次：加速，彈到畫面外
    { at: 2.7, actor: 'plane', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 2.7, actor: 'plane', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.0, actor: 'plane', do: 'moveTo', to: { x: 94, y: 38 }, dur: 0.22 },
    { at: 3.22, actor: 'cloud', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 3.3, actor: 'plane', do: 'moveTo', to: { x: -20, y: 24 }, dur: 0.45 },
    { at: 3.3, actor: 'plane', do: 'spin', dur: 0.45, times: 2 },
    { at: 3.8, actor: 'plane', do: 'moveTo', to: { x: 24, y: 46 }, dur: 0.4 },
    { at: 3.6, actor: 'peng', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
    // 第三次：衝進去，被吞掉
    { at: 4.6, actor: 'plane', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 4.6, actor: 'plane', do: 'flash', dur: 0.35 },
    { at: 4.95, actor: 'plane', do: 'moveTo', to: { x: 108, y: 38 }, dur: 0.3 },
    { at: 5.3, actor: 'cloud', do: 'shake', amount: 2, dur: 0.45 },
    { at: 5.3, actor: 'cloud', do: 'squash', amount: 0.15, dur: 0.45 },
    { at: 5.75, actor: 'cloud', do: 'vanish', dur: 0.15 },
    { at: 5.8, actor: 'plane', do: 'moveTo', to: { x: 136, y: 24 }, dur: 0.4 },
    { at: 5.8, actor: 'plane', do: 'spin', dur: 0.4 },
    { at: 6.2, actor: 'plane', do: 'shake', amount: 1.5, dur: 0.5 },
    // 好多小雲朵
    { at: 7.55, actor: 'c1', do: 'pop' },
    { at: 7.7, actor: 'c2', do: 'pop' },
    { at: 7.85, actor: 'c3', do: 'pop' },
    { at: 7.9, actor: 'peng', do: 'hop', amount: 4, dur: 0.3 },
    // 去碰最小的那朵——一樣被彈飛
    { at: 8.4, actor: 'plane', do: 'moveTo', to: { x: 140, y: 44 }, dur: 0.3 },
    { at: 8.7, actor: 'c2', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 8.72, actor: 'plane', do: 'moveTo', to: { x: 128, y: 14 }, dur: 0.4 },
    { at: 8.72, actor: 'plane', do: 'spin', dur: 0.4, times: 2 },
    { at: 9.0, actor: 'peng', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
  ],
  builds: [
    // 炸開的雲 → 雨；飛機抖掉身上的雲 → 云
    { at: 5.75, dur: 0.75, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'cloud', color: '#3E8EDE' },
    { at: 6.2, dur: 0.55, strokes: [8, 9, 10, 11], from: 'plane', color: '#8A5CD0' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'plane', emoji: '☁️', dur: 0.6 },
    { at: 1.7, kind: 'burst', actor: 'plane', emoji: '💫', n: 1, dur: 0.4, dx: 4 },
    { at: 2.3, kind: 'sweat', actor: 'plane' },
    { at: 2.4, kind: 'bubble', actor: 'peng', emoji: '😆', dur: 0.7, dx: -12 },
    { at: 3.7, kind: 'bubble', actor: 'peng', emoji: '🤣', dur: 0.8, dx: -12 },
    { at: 4.2, kind: 'dizzy', actor: 'plane', dur: 0.4 },
    { at: 4.6, kind: 'pop', actor: 'plane', emoji: '😤', dur: 0.35 },
    { at: 5.4, kind: 'pop', actor: 'peng', emoji: '😮', dur: 0.4 },
    { at: 5.75, kind: 'burst', actor: 'cloud', dur: 0.4 },
    { at: 5.75, kind: 'burst', actor: 'cloud', emoji: '☁️', n: 6, dur: 0.6 },
    { at: 7.6, kind: 'burst', actor: 'peng', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.7, kind: 'burst', actor: 'c2', emoji: '💫', n: 1, dur: 0.4 },
    { at: 9.1, kind: 'dizzy', actor: 'plane', dur: 0.8 },
    { at: 9.1, kind: 'bubble', actor: 'peng', emoji: '🤣', dur: 0.8, dx: -12 },
  ],
  camera: [
    { at: 5.3, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 108, y: 38 } },
    { at: 5.75, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.7, sfx: 'boing' },
    { at: 1.75, say: '雲' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 3.25, sfx: 'boing' },
    { at: 4.95, sfx: 'whoosh' },
    { at: 5.3, sfx: 'gulp' },
    { at: 5.75, sfx: 'poof' },
    { at: 6.75, say: '雲' },
    { at: 7.75, say: '雲朵' },
    { at: 8.7, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
