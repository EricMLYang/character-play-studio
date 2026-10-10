import type { Clip } from '../clip'

// 苦：貓頭鷹醫生給熊一顆藥，熊聞了一下臉皺成一團。偷偷丟進果汁——醫生衝過來把藥撈出來；偷偷埋進盆栽——醫生從盆栽裡冒出來！
// 只好一口吞下，苦到全身發抖、毛都豎起來變成「苦」。醫生拿出獎品，熊開心咬下去——是苦瓜，又苦一次。苦、苦、苦瓜
const clip: Clip = {
  char: '苦',
  meta: { theme: '吃藥大作戰', cast: '熊＋貓頭鷹醫生＋藥丸', gags: ['藏藥被抓包', '醫生從盆栽冒出來', '苦到毛豎起來', '獎品是苦瓜'] },
  duration: 10,
  bg: { top: '#F1F7E8', bottom: '#DCEBC8', floor: '#B98B5E', scenery: 'room' },
  actors: [
    { id: 'juice', emoji: '🧃', x: 41, y: 72.8, size: 10, hidden: true },
    { id: 'owl', emoji: '🦉', x: 136, y: 70.2, size: 16.2, hidden: true },
    { id: 'pot', emoji: '🪴', x: 8, y: 71.2, size: 13.8, hidden: true },
    { id: 'bear', emoji: '🐻', x: 25, y: 69.1, size: 18.8, hidden: true },
    { id: 'pill', emoji: '💊', x: 33, y: 63, size: 6.2, hidden: true, float: true },
    { id: 'melon', emoji: '🥒', x: 122, y: 60, size: 11.2, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'pop' },
    { at: 0.1, actor: 'juice', do: 'pop' },
    { at: 0.2, actor: 'pot', do: 'pop' },
    { at: 0.2, actor: 'owl', do: 'enter', from: { x: 176, y: 70.2 }, dur: 0.6 },
    // 醫生把藥丟過來
    { at: 0.8, actor: 'pill', do: 'enter', from: { x: 130, y: 62 }, arc: 14, dur: 0.5 },
    { at: 1.41, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.4 },
    // 偷偷丟進果汁
    { at: 2.16, actor: 'pill', do: 'moveTo', to: { x: 41, y: 70 }, arc: 4, dur: 0.3 },
    { at: 2.49, actor: 'pill', do: 'vanish', dur: 0.1 },
    // 醫生衝過來把藥撈出來
    { at: 2.97, actor: 'owl', do: 'moveTo', to: { x: 54, y: 70.2 }, dur: 0.3 },
    { at: 3.29, actor: 'juice', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 3.34, actor: 'pill', do: 'moveTo', to: { x: 33, y: 63 }, dur: 0.01 },
    { at: 3.4, actor: 'pill', do: 'pop' },
    { at: 3.61, actor: 'owl', do: 'moveTo', to: { x: 136, y: 70.2 }, dur: 0.3 },
    // 偷偷埋進盆栽
    { at: 4.04, actor: 'pill', do: 'moveTo', to: { x: 8, y: 66 }, arc: 6, dur: 0.3 },
    { at: 4.36, actor: 'pill', do: 'vanish', dur: 0.1 },
    // 醫生從盆栽裡冒出來！
    { at: 4.41, actor: 'owl', do: 'vanish', dur: 0.15 },
    { at: 4.57, actor: 'owl', do: 'moveTo', to: { x: 8, y: 63 }, dur: 0.01 },
    { at: 4.63, actor: 'owl', do: 'pop' },
    { at: 4.63, actor: 'pot', do: 'shake', amount: 1, dur: 0.3 },
    { at: 4.74, actor: 'pill', do: 'moveTo', to: { x: 15, y: 58 }, dur: 0.01 },
    { at: 4.79, actor: 'pill', do: 'pop' },
    { at: 4.74, actor: 'bear', do: 'hop', amount: 6, dur: 0.3 },
    // 只好吞下去：苦到發抖
    { at: 5.22, actor: 'pill', do: 'moveTo', to: { x: 25, y: 66 }, arc: 4, dur: 0.2 },
    { at: 5.43, actor: 'pill', do: 'vanish', dur: 0.05 },
    { at: 5.49, actor: 'bear', do: 'shake', amount: 3, dur: 0.9 },
    { at: 5.54, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.4 },
    // 醫生跳回原位
    { at: 6.3, actor: 'owl', do: 'moveTo', to: { x: 136, y: 70.2 }, arc: 18, dur: 0.55 },
    // 獎品！
    { at: 7.6, actor: 'melon', do: 'pop' },
    { at: 7.7, actor: 'owl', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 7.9, actor: 'bear', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 熊開心咬下去——又苦一次
    { at: 8.35, actor: 'melon', do: 'moveTo', to: { x: 32, y: 64 }, arc: 46, dur: 0.5 },
    { at: 8.35, actor: 'melon', do: 'spin', dur: 0.5 },
    { at: 8.78, actor: 'melon', do: 'vanish', dur: 0.1 },
    { at: 8.87, actor: 'bear', do: 'hop', amount: 12, dur: 0.5 },
    { at: 8.87, actor: 'bear', do: 'spin', dur: 0.5 },
    { at: 9.3, actor: 'bear', do: 'shake', amount: 3, dur: 0.6 },
  ],
  builds: [
    // 苦到毛都豎起來 → 草字頭；嘴巴扭成一團 → 古
    { at: 5.7, dur: 0.6, strokes: [0, 1, 2], from: 'bear', color: '#5E9A2B' },
    { at: 6.2, dur: 0.75, strokes: [3, 4, 5, 6, 7], from: 'bear', style: 'drop', color: '#7B4B94' },
  ],
  glyph: [{ at: 6.95, dur: 0.4, do: 'wobble' }, { at: 9.57, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.41, kind: 'pop', actor: 'bear', emoji: '😖', dur: 0.6 },
    { at: 1.95, kind: 'bubble', actor: 'owl', emoji: '📋', dur: 0.8 },
    { at: 2.59, kind: 'bubble', actor: 'bear', emoji: '😏', dur: 0.4 },
    { at: 2.91, kind: 'pop', actor: 'owl', emoji: '❗', dur: 0.35 },
    { at: 3.45, kind: 'sweat', actor: 'bear' },
    { at: 4.41, kind: 'bubble', actor: 'bear', emoji: '😎', dur: 0.35 },
    { at: 4.68, kind: 'pop', actor: 'owl', emoji: '👀', dx: 6, dur: 0.6 },
    { at: 4.84, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.4 },
    { at: 5.49, kind: 'stink', actor: 'bear', dur: 1.4 },
    { at: 5.54, kind: 'pop', actor: 'bear', emoji: '😖', dur: 0.8 },
    { at: 7.7, kind: 'burst', actor: 'melon', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.8, kind: 'bubble', actor: 'bear', emoji: '😍', dur: 0.5 },
    { at: 8.87, kind: 'stink', actor: 'bear', dur: 1.3 },
    { at: 9.3, kind: 'pop', actor: 'bear', emoji: '😖', dur: 0.6 },
    { at: 9.3, kind: 'bubble', actor: 'owl', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.63, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 14, y: 62 } },
    { at: 5.49, dur: 0.5, do: 'shake', amount: 1.5 },
    { at: 8.91, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 26, y: 64 } },
  ],
  cues: [
    { at: 1.25, sfx: 'plop' },
    { at: 1.52, say: '苦' },
    { at: 2.49, sfx: 'plop' },
    { at: 2.97, sfx: 'whoosh' },
    { at: 3.4, sfx: 'boing' },
    { at: 4.36, sfx: 'tap' },
    { at: 4.63, sfx: 'poof' },
    { at: 5.43, sfx: 'gulp' },
    { at: 5.54, sfx: 'rumble' },
    { at: 7, say: '苦' },
    { at: 8, say: '苦瓜' },
    { at: 8.78, sfx: 'gulp' },
    { at: 8.91, sfx: 'boing' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
