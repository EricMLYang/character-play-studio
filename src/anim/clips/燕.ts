import type { Clip } from '../clip'

// 燕：燕子在沙漠找不到樹，乾脆把巢蓋在睡覺的駱駝駝峰上。駱駝一打呼，巢就歪掉；駱駝醒來一甩頭，巢飛上天散成「燕」，
// 燕子的羽毛也被甩成四個點。燕子不死心，最後把新巢蓋在「燕」字的頭頂上，駱駝翻白眼。燕、燕、燕子
const clip: Clip = {
  char: '燕',
  meta: { theme: '沙漠築巢', cast: '燕子＋駱駝', gags: ['把巢蓋在怪地方', '打呼震歪', '一甩全散掉', '巢蓋在國字頭上'] },
  duration: 10,
  bg: { top: '#FFE9C7', bottom: '#FFD08A', floor: '#E2B36B', scenery: 'desert' },
  actors: [
    { id: 'camel', emoji: '🐫', x: 130, y: 67.8, size: 22 },
    { id: 'nest', emoji: '🪹', x: 132, y: 57, size: 9, float: true, hidden: true },
    { id: 'nest2', emoji: '🪹', x: 80, y: 10, size: 7, float: true, hidden: true },
    { id: 'bird', emoji: '🐦', x: 40, y: 34, size: 7, float: true, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'bird', do: 'enter', from: { x: -10, y: 26 }, dur: 0.7, arc: 6 },
    // 飛到駝峰上，蓋巢
    { at: 1.1, actor: 'bird', do: 'moveTo', to: { x: 132, y: 52 }, dur: 0.5, arc: 8 },
    { at: 1.6, actor: 'bird', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.8, actor: 'nest', do: 'pop' },
    { at: 2.0, actor: 'bird', do: 'hop', amount: 3, dur: 0.3 },
    // 打呼：巢被震歪
    { at: 2.5, actor: 'camel', do: 'squash', amount: -0.12, dur: 0.4 },
    { at: 2.9, actor: 'camel', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 2.9, actor: 'nest', do: 'hop', amount: 8, dur: 0.4 },
    { at: 2.9, actor: 'nest', do: 'rotateTo', amount: 25, dur: 0.4 },
    { at: 2.9, actor: 'bird', do: 'hop', amount: 14, dur: 0.5 },
    { at: 3.4, actor: 'nest', do: 'rotateTo', amount: -25, dur: 0.3 },
    { at: 3.4, actor: 'bird', do: 'shake', amount: 1, dur: 0.3 },
    // 駱駝醒了，一甩頭：巢飛上天、燕子被甩飛
    { at: 4.0, actor: 'camel', do: 'shake', amount: 2.5, dur: 0.5 },
    { at: 4.0, actor: 'camel', do: 'hop', amount: 5, dur: 0.35 },
    { at: 4.0, actor: 'nest', do: 'moveTo', to: { x: 90, y: 32 }, dur: 0.45, arc: 14 },
    { at: 4.0, actor: 'nest', do: 'spin', times: 2, dur: 0.45 },
    { at: 4.0, actor: 'bird', do: 'moveTo', to: { x: 150, y: 22 }, dur: 0.45, arc: 10 },
    { at: 4.0, actor: 'bird', do: 'spin', times: 2, dur: 0.45 },
    { at: 4.5, actor: 'nest', do: 'vanish', dur: 0.15 },
    // 回神，飛一圈耍帥
    { at: 6.1, actor: 'bird', do: 'moveTo', to: { x: 146, y: 32 }, dur: 0.5, arc: 4 },
    { at: 6.8, actor: 'bird', do: 'spin', dur: 0.5 },
    // 新的巢：蓋在國字頭頂上
    { at: 7.75, actor: 'bird', do: 'flip' },
    { at: 7.8, actor: 'bird', do: 'moveTo', to: { x: 80, y: 5.5 }, dur: 0.6, arc: 6 },
    { at: 8.4, actor: 'nest2', do: 'pop' },
    { at: 8.5, actor: 'bird', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.8, actor: 'camel', do: 'tilt', amount: -8, dur: 0.5 },
  ],
  builds: [
    // 散掉的巢 → 廿＋口＋北；甩掉的羽毛 → 灬
    { at: 4.5, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], from: 'nest', color: '#B5783A' },
    { at: 5.1, dur: 0.6, strokes: [12, 13, 14, 15], from: 'bird', color: '#2F4A8A' },
  ],
  glyph: [{ at: 5.7, dur: 0.4, do: 'wobble' }, { at: 8.45, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'camel', dur: 3.8, dx: -8 },
    { at: 0.7, kind: 'bubble', actor: 'bird', emoji: '🪹', dur: 0.6 },
    { at: 1.8, kind: 'burst', actor: 'nest', emoji: '🌾', n: 5, dur: 0.5 },
    { at: 2.2, kind: 'pop', actor: 'bird', emoji: '💕', dur: 0.5 },
    { at: 3.05, kind: 'pop', actor: 'bird', emoji: '❗', dur: 0.4 },
    { at: 3.5, kind: 'sweat', actor: 'bird' },
    { at: 3.85, kind: 'pop', actor: 'camel', emoji: '❗', dur: 0.4, dx: -10 },
    { at: 4.0, kind: 'puff', actor: 'camel' },
    { at: 4.45, kind: 'burst', actor: 'bird', emoji: '🪶', n: 5, dur: 0.5, dx: -10, dy: 6 },
    { at: 4.5, kind: 'burst', actor: 'nest', dur: 0.35 },
    { at: 4.9, kind: 'dizzy', actor: 'bird', dur: 1.0 },
    { at: 6.8, kind: 'burst', actor: 'bird', emoji: '✨', n: 6, dur: 0.5, dx: -6 },
    { at: 7.4, kind: 'pop', actor: 'bird', emoji: '💡', dur: 0.4 },
    { at: 8.4, kind: 'burst', actor: 'nest2', emoji: '🌾', n: 5, dur: 0.5, dy: 6 },
    { at: 8.9, kind: 'bubble', actor: 'camel', emoji: '😑', dur: 0.9, dx: -14 },
  ],
  camera: [
    { at: 4.0, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 120, y: 50 } },
  ],
  cues: [
    { at: 1.6, say: '燕' },
    { at: 1.8, sfx: 'poof' },
    { at: 2.9, sfx: 'boing' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.5, sfx: 'crack' },
    { at: 5.8, say: '燕' },
    { at: 6.85, say: '燕子' },
    { at: 8.4, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
