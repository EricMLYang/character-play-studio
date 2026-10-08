import type { Clip } from '../clip'

// 虎：馬戲團的老虎要跳火圈（呼拉圈）。第一次太矮，直接從圈圈底下跑過去；第二次跳太高，整隻飛過圈圈；第三次卡在圈圈裡轉圈圈，
// 圈圈甩飛出去變成「虎」。最後猴子團長舉起甜甜圈當圈圈——老虎跳過去一口吃掉。虎、虎、老虎
const clip: Clip = {
  char: '虎',
  meta: { theme: '馬戲團', cast: '老虎＋猴子團長＋圈圈', gags: ['跳太低從底下跑過', '跳太高飛過頭', '卡在圈圈裡轉', '把圈圈吃掉'] },
  duration: 10,
  bg: { top: '#1E2246', bottom: '#3B2E6B', floor: '#B8423A', scenery: 'night' },
  actors: [
    { id: 'tiger', emoji: '🐅', x: 22, y: 69.4, size: 18, hidden: true, flip: true },
    { id: 'hoop', emoji: '⭕', x: 90, y: 46, size: 16, hidden: true, float: true },
    { id: 'monkey', emoji: '🐒', x: 148, y: 72, size: 12, hidden: true },
    { id: 'donut', emoji: '🍩', x: 130, y: 44, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tiger', do: 'enter', from: { x: -15, y: 69.4 }, dur: 0.6 },
    { at: 0.2, actor: 'monkey', do: 'pop' },
    { at: 0.4, actor: 'hoop', do: 'pop' },
    { at: 0.7, actor: 'monkey', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
    // 第一次：太矮，從圈圈底下跑過去
    { at: 1.2, actor: 'tiger', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.5, actor: 'tiger', do: 'moveTo', to: { x: 114, y: 69.4 }, dur: 0.7, arc: 3 },
    { at: 2.25, actor: 'tiger', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.6, actor: 'tiger', do: 'flip' },
    // 第二次：太高，整隻飛過去
    { at: 3.0, actor: 'tiger', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 3.35, actor: 'tiger', do: 'moveTo', to: { x: 30, y: 69.4 }, dur: 0.75, arc: 48 },
    { at: 4.1, actor: 'tiger', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 4.4, actor: 'tiger', do: 'flip' },
    // 第三次：卡在圈圈裡轉圈圈
    { at: 4.6, actor: 'tiger', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.9, actor: 'tiger', do: 'moveTo', to: { x: 90, y: 48 }, dur: 0.35, arc: 8 },
    { at: 5.25, actor: 'tiger', do: 'shake', dur: 0.3, amount: 1.5 },
    { at: 5.25, actor: 'hoop', do: 'shake', dur: 0.3, amount: 1.5 },
    { at: 5.4, actor: 'tiger', do: 'spin', dur: 0.6, times: 2 },
    // 圈圈甩飛 → 虍；老虎摔下來 → 几
    { at: 6.0, actor: 'hoop', do: 'vanish', dur: 0.2 },
    { at: 6.0, actor: 'tiger', do: 'moveTo', to: { x: 90, y: 69.4 }, dur: 0.3 },
    { at: 6.3, actor: 'tiger', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 6.5, actor: 'tiger', do: 'moveTo', to: { x: 126, y: 69.4 }, dur: 0.4 },
    // 老虎！
    { at: 7.8, actor: 'tiger', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 7.8, actor: 'tiger', do: 'flash', dur: 0.5 },
    { at: 7.9, actor: 'monkey', do: 'bounce', dur: 0.6, times: 2, amount: 3 },
    // 回馬槍：猴子舉甜甜圈當圈圈，老虎跳過去一口吃掉
    { at: 8.4, actor: 'donut', do: 'pop' },
    { at: 8.7, actor: 'tiger', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 8.95, actor: 'tiger', do: 'moveTo', to: { x: 132, y: 69.4 }, dur: 0.5, arc: 26 },
    { at: 9.2, actor: 'donut', do: 'vanish', dur: 0.1 },
    { at: 9.45, actor: 'tiger', do: 'squash', amount: 0.3, dur: 0.2 },
  ],
  builds: [
    { at: 6.0, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'hoop', color: '#FFB13B' },
    { at: 6.4, dur: 0.5, strokes: [6, 7], from: 'tiger', color: '#FF6B8B' },
  ],
  glyph: [{ at: 6.9, dur: 0.4, do: 'wobble' }, { at: 9.6, dur: 0.4, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'tiger' },
    { at: 0.85, kind: 'bubble', actor: 'tiger', emoji: '⭕', dur: 0.6 },
    { at: 1.5, kind: 'puff', actor: 'tiger' },
    { at: 2.4, kind: 'pop', actor: 'tiger', emoji: '❓', dur: 0.6 },
    { at: 2.5, kind: 'pop', actor: 'monkey', emoji: '😑', dur: 0.6 },
    { at: 4.1, kind: 'puff', actor: 'tiger' },
    { at: 4.2, kind: 'bubble', actor: 'tiger', emoji: '😅', dur: 0.5 },
    { at: 5.25, kind: 'burst', actor: 'hoop', emoji: '⭐', n: 6, dur: 0.5 },
    { at: 6.3, kind: 'puff', actor: 'tiger' },
    { at: 6.35, kind: 'dizzy', actor: 'tiger', dur: 0.6 },
    { at: 7.9, kind: 'burst', actor: 'tiger', emoji: '✨', n: 6, dur: 0.6 },
    { at: 9.45, kind: 'puff', actor: 'tiger' },
    { at: 9.5, kind: 'bubble', actor: 'tiger', emoji: '😋', dur: 0.5 },
    { at: 9.5, kind: 'pop', actor: 'monkey', emoji: '😑', dur: 0.5 },
  ],
  camera: [
    { at: 5.25, dur: 0.75, do: 'punch', amount: 0.3, to: { x: 90, y: 50 } },
    { at: 6.3, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.3, say: '虎' },
    { at: 1.5, sfx: 'whoosh' },
    { at: 2.25, sfx: 'slide' },
    { at: 3.35, sfx: 'boing' },
    { at: 4.1, sfx: 'plop' },
    { at: 4.9, sfx: 'boing' },
    { at: 5.25, sfx: 'bonk' },
    { at: 6.0, sfx: 'whoosh' },
    { at: 6.3, sfx: 'plop' },
    { at: 6.9, say: '虎' },
    { at: 7.9, say: '老虎' },
    { at: 8.95, sfx: 'boing' },
    { at: 9.2, sfx: 'gulp' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
