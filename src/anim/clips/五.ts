import type { Clip } from '../clip'

// 五：猴子幫一顆大蛋貼五官：眼睛貼在下面、嘴巴貼在上面、鼻子貼在旁邊、耳朵貼在頭頂——好奇怪的臉！
// 大蛋自己一抖，五官全部飛起來，變成「五」，再「啪啪啪」貼回正確的位置。大蛋對猴子做鬼臉，猴子嚇得跳起來。五、五、五官
const clip: Clip = {
  char: '五',
  meta: { theme: '貼五官', cast: '猴子＋大蛋', gags: ['全部貼錯位置', '大蛋自己修好', '做鬼臉嚇人'] },
  duration: 10,
  bg: { top: '#FFE8CC', bottom: '#FFF6EA', floor: '#C9A06A', scenery: 'hills' },
  actors: [
    { id: 'pump', emoji: '🥚', x: 126, y: 61, size: 34, hidden: true, tint: 'sepia(.35) saturate(1.6) hue-rotate(-10deg)' },
    { id: 'eyes', emoji: '👀', x: 126, y: 70, size: 9, hidden: true, float: true },
    { id: 'mouth', emoji: '👄', x: 126, y: 52, size: 8, hidden: true, float: true },
    { id: 'nose', emoji: '👃', x: 140, y: 62, size: 7, hidden: true, float: true },
    { id: 'ear', emoji: '👂', x: 126, y: 45, size: 8, hidden: true, float: true },
    { id: 'monkey', emoji: '🐒', x: 30, y: 69.5, size: 18, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'pump', do: 'pop' },
    { at: 0.2, actor: 'monkey', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 一個一個貼錯
    { at: 1.4, actor: 'monkey', do: 'moveTo', to: { x: 100, y: 69.5 }, dur: 0.5 },
    { at: 1.9, actor: 'eyes', do: 'pop', dur: 0.2 },
    { at: 2.5, actor: 'mouth', do: 'pop', dur: 0.2 },
    { at: 3.1, actor: 'nose', do: 'pop', dur: 0.2 },
    { at: 3.7, actor: 'ear', do: 'pop', dur: 0.2 },
    { at: 4.2, actor: 'monkey', do: 'moveTo', to: { x: 30, y: 69.5 }, dur: 0.5 },
    { at: 4.8, actor: 'monkey', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 南瓜一抖——五官全部飛起來
    { at: 5.4, actor: 'pump', do: 'shake', amount: 2, dur: 0.5 },
    { at: 5.9, actor: 'eyes', do: 'moveTo', to: { x: 80, y: 18 }, dur: 0.4 },
    { at: 5.9, actor: 'mouth', do: 'moveTo', to: { x: 92, y: 22 }, dur: 0.4 },
    { at: 5.9, actor: 'nose', do: 'moveTo', to: { x: 68, y: 22 }, dur: 0.4 },
    { at: 5.9, actor: 'ear', do: 'moveTo', to: { x: 104, y: 18 }, dur: 0.4 },
    // 啪啪啪貼回正確位置
    { at: 6.9, actor: 'eyes', do: 'moveTo', to: { x: 126, y: 58 }, dur: 0.3 },
    { at: 7.1, actor: 'nose', do: 'moveTo', to: { x: 126, y: 64 }, dur: 0.3 },
    { at: 7.3, actor: 'mouth', do: 'moveTo', to: { x: 126, y: 70 }, dur: 0.3 },
    { at: 7.5, actor: 'ear', do: 'moveTo', to: { x: 143, y: 60 }, dur: 0.3 },
    // 做鬼臉——猴子嚇得跳起來
    { at: 8.6, actor: 'pump', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 8.6, actor: 'mouth', do: 'scaleTo', amount: 1.6, dur: 0.3 },
    { at: 8.8, actor: 'monkey', do: 'hop', amount: 14, dur: 0.5 },
  ],
  builds: [
    // 飛起來的五官
    { at: 6.0, dur: 0.8, strokes: [0, 1, 2, 3], from: { x: 86, y: 20 }, color: '#E86A33' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'monkey', emoji: '🥚', dur: 0.6 },
    { at: 4.4, kind: 'pop', actor: 'monkey', emoji: '😆', dur: 0.6 },
    { at: 5.4, kind: 'pop', actor: 'pump', emoji: '😠', dur: 0.5, dy: 4 },
    { at: 7.7, kind: 'burst', actor: 'pump', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.8, kind: 'pop', actor: 'monkey', emoji: '😱', dur: 0.7 },
  ],
  camera: [
    { at: 3.7, dur: 1.0, do: 'punch', amount: 0.25, to: { x: 120, y: 58 } },
  ],
  cues: [
    { at: 1.0, say: '五' },
    { at: 1.9, sfx: 'tap' }, { at: 2.5, sfx: 'tap' }, { at: 3.1, sfx: 'tap' }, { at: 3.7, sfx: 'tap' },
    { at: 5.4, sfx: 'rumble' },
    { at: 5.9, sfx: 'whoosh' },
    { at: 6.9, sfx: 'tap' }, { at: 7.1, sfx: 'tap' }, { at: 7.3, sfx: 'tap' }, { at: 7.5, sfx: 'tap' },
    { at: 6.9, say: '五' },
    { at: 8.0, say: '五官' },
    { at: 8.8, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
