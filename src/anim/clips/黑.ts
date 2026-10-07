import type { Clip } from '../clip'

// 黑：兔子哼著歌，燈突然啪一聲全黑，只看得到牠的眼睛。旁邊又冒出一雙大眼睛……燈一亮，是一隻黑熊！
// 兩個一起嚇到跳起來往反方向逃，結果黑熊揮手打招呼。燈又黑了，這次中間多了一雙小小的眼睛——是老鼠，兩個都嚇昏。黑、黑、黑熊
const clip: Clip = {
  char: '黑',
  meta: { theme: '關燈驚喜', cast: '兔子＋黑熊＋老鼠', gags: ['黑暗中的眼睛', '互相嚇到', '原來很友善', '驚喜小角色'] },
  duration: 10,
  bg: { top: '#FFF3D6', bottom: '#FFE6B8', floor: '#E9C9A0' },
  actors: [
    { id: 'bunny', emoji: '🐰', x: 30, y: 71, size: 13, hidden: true },
    { id: 'bear', emoji: '🐻', x: 46, y: 65, size: 22, hidden: true, tint: 'brightness(.42) contrast(1.15)' },
    { id: 'mouse', emoji: '🐭', x: 120, y: 72, size: 7, hidden: true },
    { id: 'eyes1', emoji: '👀', x: 30, y: 70, size: 6, hidden: true, top: true, float: true },
    { id: 'eyes2', emoji: '👀', x: 46, y: 62, size: 9, hidden: true, top: true, float: true },
    { id: 'eyes3', emoji: '👀', x: 120, y: 71, size: 3.5, hidden: true, top: true, float: true },
    { id: 'eyes4', emoji: '👀', x: 26, y: 70, size: 6, hidden: true, top: true, float: true },
    { id: 'eyes5', emoji: '👀', x: 132, y: 62, size: 9, hidden: true, top: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'bunny', do: 'enter', dur: 0.6 },
    { at: 0.6, actor: 'bunny', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 黑暗中的眼睛
    { at: 1.6, actor: 'eyes1', do: 'pop', dur: 0.2 },
    { at: 2.2, actor: 'eyes1', do: 'flip' },
    { at: 2.6, actor: 'eyes1', do: 'flip' },
    { at: 2.7, actor: 'eyes2', do: 'pop', dur: 0.3 },
    { at: 3.0, actor: 'eyes1', do: 'shake', dur: 0.6, amount: 0.8 },
    { at: 3.2, actor: 'eyes2', do: 'squash', amount: 0.9, dur: 0.18 },
    { at: 3.6, actor: 'eyes1', do: 'vanish', dur: 0.05 },
    { at: 3.6, actor: 'eyes2', do: 'vanish', dur: 0.05 },
    // 燈亮：黑熊就在旁邊！兩個都嚇到跳起來
    { at: 3.6, actor: 'bear', do: 'pop', dur: 0.05 },
    { at: 3.7, actor: 'bunny', do: 'hop', dur: 0.6, amount: 22 },
    { at: 3.7, actor: 'bunny', do: 'spin', dur: 0.6 },
    { at: 3.75, actor: 'bear', do: 'hop', dur: 0.45, amount: 8 },
    { at: 4.35, actor: 'bunny', do: 'moveTo', to: { x: 14, y: 71 }, dur: 0.3 },
    { at: 4.25, actor: 'bear', do: 'flip' },
    { at: 4.3, actor: 'bear', do: 'moveTo', to: { x: 134, y: 65 }, dur: 0.45 },
    { at: 4.3, actor: 'bear', do: 'bounce', dur: 0.45, times: 3, amount: 2 },
    { at: 4.75, actor: 'bunny', do: 'shake', dur: 0.8, amount: 0.8 },
    // 原來黑熊很友善
    { at: 6.2, actor: 'bear', do: 'flip' },
    { at: 6.4, actor: 'bear', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 7.0, actor: 'bunny', do: 'moveTo', to: { x: 26, y: 71 }, dur: 0.4 },
    { at: 7.0, actor: 'bunny', do: 'bounce', dur: 0.4, times: 2, amount: 2 },
    // 又黑了：多了一雙小眼睛
    { at: 7.75, actor: 'eyes4', do: 'pop', dur: 0.15 },
    { at: 7.75, actor: 'eyes5', do: 'pop', dur: 0.15 },
    { at: 8.15, actor: 'eyes3', do: 'pop', dur: 0.25 },
    { at: 8.4, actor: 'eyes3', do: 'hop', dur: 0.25, amount: 2 },
    { at: 8.5, actor: 'eyes4', do: 'shake', dur: 0.4, amount: 0.8 },
    { at: 8.5, actor: 'eyes5', do: 'shake', dur: 0.4, amount: 0.8 },
    { at: 8.9, actor: 'eyes3', do: 'vanish', dur: 0.05 },
    { at: 8.9, actor: 'eyes4', do: 'vanish', dur: 0.05 },
    { at: 8.9, actor: 'eyes5', do: 'vanish', dur: 0.05 },
    { at: 8.9, actor: 'mouse', do: 'pop', dur: 0.05 },
    { at: 9.0, actor: 'mouse', do: 'hop', dur: 0.3, amount: 3 },
    // 兩個都嚇昏
    { at: 9.05, actor: 'bunny', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 9.05, actor: 'bear', do: 'rotateTo', amount: 90, dur: 0.3 },
  ],
  builds: [
    // 燈亮的那一刻，黑暗收成「黑」的上半；四個點一個一個掉下來
    { at: 4.6, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: { x: 80, y: -10 }, color: '#2B2B3A' },
    { at: 5.5, dur: 0.7, strokes: [8, 9, 10, 11], from: { x: 80, y: 0 }, style: 'drop', color: '#2B2B3A' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'zzz', actor: 'bunny', emoji: '🎵', dur: 1.0 },
    { at: 3.0, kind: 'sweat', actor: 'eyes1' },
    { at: 3.7, kind: 'pop', actor: 'bunny', emoji: '❗', dur: 0.6 },
    { at: 3.75, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.6 },
    { at: 4.75, kind: 'sweat', actor: 'bunny' },
    { at: 6.4, kind: 'pop', actor: 'bear', emoji: '👋', dur: 0.9, dx: -14, dy: 6 },
    { at: 7.0, kind: 'burst', actor: 'bunny', emoji: '💕', n: 4, dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'mouse', emoji: '👋', dur: 0.9 },
    { at: 9.3, kind: 'dizzy', actor: 'bunny', dur: 0.7 },
  ],
  camera: [
    { at: 3.6, dur: 0.9, do: 'punch', amount: 0.3, to: { x: 38, y: 62 } },
    { at: 8.9, dur: 0.9, do: 'punch', amount: 0.12, to: { x: 110, y: 66 } },
  ],
  lights: [
    { at: 1.3, dur: 0.05, level: 0.6 },
    { at: 1.38, dur: 0.05, level: 0 },
    { at: 1.48, dur: 0.06, level: 1 },
    { at: 3.6, dur: 0.06, level: 0 },
    { at: 7.6, dur: 0.06, level: 1 },
    { at: 8.9, dur: 0.06, level: 0 },
  ],
  cues: [
    { at: 1.3, sfx: 'tap' }, { at: 1.48, sfx: 'tap' },
    { at: 1.75, say: '黑' },
    { at: 2.7, sfx: 'blip' },
    { at: 3.6, sfx: 'tap' },
    { at: 3.7, sfx: 'slide' },
    { at: 5.6, say: '黑' },
    { at: 6.5, say: '黑熊' },
    { at: 7.6, sfx: 'tap' },
    { at: 8.15, sfx: 'blip' },
    { at: 8.9, sfx: 'tap' },
    { at: 9.05, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
