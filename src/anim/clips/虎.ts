import type { Clip } from '../clip'

// 虎：馬戲團的老虎要跳火圈（呼拉圈）。第一次跳太高，整隻飛過圈圈；第二次卡在圈圈裡轉圈圈，
// 圈圈甩飛出去變成「虎」。最後猴子團長舉起甜甜圈當圈圈——老虎跳過去一口吃掉。虎、虎、老虎
const clip: Clip = {
  char: '虎',
  meta: { theme: '馬戲團', cast: '老虎＋猴子團長＋圈圈', gags: ['跳太高飛過頭', '卡在圈圈裡轉', '把圈圈吃掉'] },
  duration: 10,
  bg: { top: '#1E2246', bottom: '#3B2E6B', floor: '#B8423A', scenery: 'night' },
  actors: [
    { id: 'tiger', emoji: '🐅', x: 22, y: 68, size: 22, hidden: true, flip: true },
    { id: 'hoop', emoji: '⭕', x: 90, y: 44, size: 20, hidden: true, float: true },
    { id: 'monkey', emoji: '🐒', x: 150, y: 70.5, size: 15, hidden: true },
    { id: 'donut', emoji: '🍩', x: 136, y: 50, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tiger', do: 'enter', from: { x: -18, y: 68 }, dur: 0.7 },
    { at: 0.2, actor: 'monkey', do: 'pop' },
    { at: 0.4, actor: 'hoop', do: 'pop' },
    { at: 0.7, actor: 'monkey', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 1.1, actor: 'tiger', do: 'flash', dur: 0.5 },
    // 第一次：跳太高，整隻飛過去
    { at: 1.8, actor: 'tiger', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 2.15, actor: 'tiger', do: 'moveTo', to: { x: 128, y: 68 }, dur: 0.9, arc: 50 },
    { at: 3.05, actor: 'tiger', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.9, actor: 'tiger', do: 'flip' },
    // 第二次：卡在圈圈裡轉圈圈
    { at: 4.2, actor: 'tiger', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.5, actor: 'tiger', do: 'moveTo', to: { x: 90, y: 46 }, dur: 0.4, arc: 8 },
    { at: 4.9, actor: 'tiger', do: 'shake', dur: 0.4, amount: 1.5 },
    { at: 4.9, actor: 'hoop', do: 'shake', dur: 0.4, amount: 1.5 },
    { at: 5.3, actor: 'tiger', do: 'spin', dur: 0.7, times: 2 },
    // 圈圈甩飛 → 虍；老虎摔下來 → 几
    { at: 6.0, actor: 'hoop', do: 'vanish', dur: 0.2 },
    { at: 6.0, actor: 'tiger', do: 'moveTo', to: { x: 90, y: 68 }, dur: 0.3 },
    { at: 6.3, actor: 'tiger', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 6.6, actor: 'tiger', do: 'moveTo', to: { x: 124, y: 68 }, dur: 0.5 },
    // 老虎！
    { at: 7.9, actor: 'tiger', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 7.9, actor: 'tiger', do: 'flash', dur: 0.5 },
    // 回馬槍：猴子舉甜甜圈當圈圈，老虎跳過去一口吃掉
    { at: 8.5, actor: 'donut', do: 'pop' },
    { at: 8.8, actor: 'tiger', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 9.05, actor: 'tiger', do: 'moveTo', to: { x: 134, y: 68 }, dur: 0.5, arc: 24 },
    { at: 9.3, actor: 'donut', do: 'vanish', dur: 0.1 },
    { at: 9.55, actor: 'tiger', do: 'squash', amount: 0.3, dur: 0.2 },
  ],
  builds: [
    { at: 6.0, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'hoop', color: '#FFB13B' },
    { at: 6.4, dur: 0.5, strokes: [6, 7], from: 'tiger', color: '#FF6B8B' },
  ],
  glyph: [{ at: 6.95, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'tiger' },
    { at: 0.8, kind: 'bubble', actor: 'tiger', emoji: '⭕', dur: 0.9 },
    { at: 2.15, kind: 'puff', actor: 'tiger' },
    { at: 3.1, kind: 'puff', actor: 'tiger' },
    { at: 3.2, kind: 'bubble', actor: 'tiger', emoji: '😅', dur: 0.8 },
    { at: 3.3, kind: 'pop', actor: 'monkey', emoji: '😑', dur: 0.7 },
    { at: 4.9, kind: 'burst', actor: 'hoop', emoji: '⭐', n: 6, dur: 0.5 },
    { at: 6.3, kind: 'puff', actor: 'tiger' },
    { at: 6.35, kind: 'dizzy', actor: 'tiger', dur: 0.9 },
    { at: 7.95, kind: 'burst', actor: 'tiger', emoji: '✨', n: 6, dur: 0.6 },
    { at: 9.55, kind: 'puff', actor: 'tiger' },
    { at: 9.55, kind: 'bubble', actor: 'tiger', emoji: '😋', dur: 0.45 },
  ],
  camera: [
    { at: 4.9, dur: 1.0, do: 'punch', amount: 0.3, to: { x: 90, y: 48 } },
    { at: 6.3, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.15, say: '虎' },
    { at: 2.15, sfx: 'boing' },
    { at: 3.05, sfx: 'plop' },
    { at: 4.5, sfx: 'boing' },
    { at: 4.9, sfx: 'bonk' },
    { at: 6.0, sfx: 'whoosh' },
    { at: 6.3, sfx: 'plop' },
    { at: 7.0, say: '虎' },
    { at: 8.0, say: '老虎' },
    { at: 9.05, sfx: 'boing' },
    { at: 9.3, sfx: 'gulp' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
