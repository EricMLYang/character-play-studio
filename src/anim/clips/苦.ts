import type { Clip } from '../clip'

// 苦：貓頭鷹醫生給熊一顆藥，熊聞了一下臉皺成一團。偷偷丟進果汁——醫生衝過來把藥撈出來；偷偷埋進盆栽——醫生從盆栽裡冒出來！
// 只好一口吞下，苦到全身發抖、毛都豎起來變成「苦」。醫生拿出獎品，熊開心咬下去——是苦瓜，又苦一次。苦、苦、苦瓜
const clip: Clip = {
  char: '苦',
  meta: { theme: '吃藥大作戰', cast: '熊＋貓頭鷹醫生＋藥丸', gags: ['藏藥被抓包', '醫生從盆栽冒出來', '苦到毛豎起來', '獎品是苦瓜'] },
  duration: 10,
  bg: { top: '#F1F7E8', bottom: '#DCEBC8', floor: '#B98B5E', scenery: 'room' },
  actors: [
    { id: 'juice', emoji: '🧃', x: 41, y: 73.6, size: 8, hidden: true },
    { id: 'owl', emoji: '🦉', x: 136, y: 71.5, size: 13, hidden: true },
    { id: 'pot', emoji: '🪴', x: 8, y: 72.4, size: 11, hidden: true },
    { id: 'bear', emoji: '🐻', x: 25, y: 70.7, size: 15, hidden: true },
    { id: 'pill', emoji: '💊', x: 33, y: 63, size: 5, hidden: true, float: true },
    { id: 'melon', emoji: '🥒', x: 122, y: 60, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'pop' },
    { at: 0.1, actor: 'juice', do: 'pop' },
    { at: 0.2, actor: 'pot', do: 'pop' },
    { at: 0.2, actor: 'owl', do: 'enter', from: { x: 176, y: 71.5 }, dur: 0.6 },
    // 醫生把藥丟過來
    { at: 0.8, actor: 'pill', do: 'enter', from: { x: 130, y: 62 }, arc: 14, dur: 0.5 },
    { at: 1.4, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.4 },
    // 偷偷丟進果汁
    { at: 2.1, actor: 'pill', do: 'moveTo', to: { x: 41, y: 70 }, arc: 4, dur: 0.3 },
    { at: 2.4, actor: 'pill', do: 'vanish', dur: 0.1 },
    // 醫生衝過來把藥撈出來
    { at: 2.85, actor: 'owl', do: 'moveTo', to: { x: 54, y: 71.5 }, dur: 0.3 },
    { at: 3.15, actor: 'juice', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 3.2, actor: 'pill', do: 'moveTo', to: { x: 33, y: 63 }, dur: 0.01 },
    { at: 3.25, actor: 'pill', do: 'pop' },
    { at: 3.45, actor: 'owl', do: 'moveTo', to: { x: 136, y: 71.5 }, dur: 0.3 },
    // 偷偷埋進盆栽
    { at: 3.85, actor: 'pill', do: 'moveTo', to: { x: 8, y: 66 }, arc: 6, dur: 0.3 },
    { at: 4.15, actor: 'pill', do: 'vanish', dur: 0.1 },
    // 醫生從盆栽裡冒出來！
    { at: 4.2, actor: 'owl', do: 'vanish', dur: 0.15 },
    { at: 4.35, actor: 'owl', do: 'moveTo', to: { x: 8, y: 63 }, dur: 0.01 },
    { at: 4.4, actor: 'owl', do: 'pop' },
    { at: 4.4, actor: 'pot', do: 'shake', amount: 1, dur: 0.3 },
    { at: 4.5, actor: 'pill', do: 'moveTo', to: { x: 15, y: 58 }, dur: 0.01 },
    { at: 4.55, actor: 'pill', do: 'pop' },
    { at: 4.5, actor: 'bear', do: 'hop', amount: 6, dur: 0.3 },
    // 只好吞下去：苦到發抖
    { at: 4.95, actor: 'pill', do: 'moveTo', to: { x: 25, y: 66 }, arc: 4, dur: 0.2 },
    { at: 5.15, actor: 'pill', do: 'vanish', dur: 0.05 },
    { at: 5.2, actor: 'bear', do: 'shake', amount: 3, dur: 0.9 },
    { at: 5.25, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.4 },
    // 醫生跳回原位
    { at: 6.0, actor: 'owl', do: 'moveTo', to: { x: 136, y: 71.5 }, arc: 18, dur: 0.55 },
    // 獎品！
    { at: 7.3, actor: 'melon', do: 'pop' },
    { at: 7.4, actor: 'owl', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 7.6, actor: 'bear', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 熊開心咬下去——又苦一次
    { at: 8.1, actor: 'melon', do: 'moveTo', to: { x: 32, y: 64 }, arc: 46, dur: 0.5 },
    { at: 8.1, actor: 'melon', do: 'spin', dur: 0.5 },
    { at: 8.6, actor: 'melon', do: 'vanish', dur: 0.1 },
    { at: 8.7, actor: 'bear', do: 'hop', amount: 12, dur: 0.5 },
    { at: 8.7, actor: 'bear', do: 'spin', dur: 0.5 },
    { at: 9.2, actor: 'bear', do: 'shake', amount: 3, dur: 0.6 },
  ],
  builds: [
    // 苦到毛都豎起來 → 草字頭；嘴巴扭成一團 → 古
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2], from: 'bear', color: '#5E9A2B' },
    { at: 5.9, dur: 0.75, strokes: [3, 4, 5, 6, 7], from: 'bear', style: 'drop', color: '#7B4B94' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.4, kind: 'pop', actor: 'bear', emoji: '😖', dur: 0.6 },
    { at: 1.9, kind: 'bubble', actor: 'owl', emoji: '📋', dur: 0.8 },
    { at: 2.5, kind: 'bubble', actor: 'bear', emoji: '😏', dur: 0.4 },
    { at: 2.8, kind: 'pop', actor: 'owl', emoji: '❗', dur: 0.35 },
    { at: 3.3, kind: 'sweat', actor: 'bear' },
    { at: 4.2, kind: 'bubble', actor: 'bear', emoji: '😎', dur: 0.35 },
    { at: 4.45, kind: 'pop', actor: 'owl', emoji: '👀', dx: 6, dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.4 },
    { at: 5.2, kind: 'stink', actor: 'bear', dur: 1.4 },
    { at: 5.25, kind: 'pop', actor: 'bear', emoji: '😖', dur: 0.8 },
    { at: 7.4, kind: 'burst', actor: 'melon', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.5, kind: 'bubble', actor: 'bear', emoji: '😍', dur: 0.5 },
    { at: 8.7, kind: 'stink', actor: 'bear', dur: 1.3 },
    { at: 9.2, kind: 'pop', actor: 'bear', emoji: '😖', dur: 0.6 },
    { at: 9.2, kind: 'bubble', actor: 'owl', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.4, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 14, y: 62 } },
    { at: 5.2, dur: 0.5, do: 'shake', amount: 1.5 },
    { at: 8.75, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 26, y: 64 } },
  ],
  cues: [
    { at: 1.25, sfx: 'plop' },
    { at: 1.5, say: '苦' },
    { at: 2.4, sfx: 'plop' },
    { at: 2.85, sfx: 'whoosh' },
    { at: 3.25, sfx: 'boing' },
    { at: 4.15, sfx: 'tap' },
    { at: 4.4, sfx: 'poof' },
    { at: 5.15, sfx: 'gulp' },
    { at: 5.25, sfx: 'rumble' },
    { at: 6.7, say: '苦' },
    { at: 7.7, say: '苦瓜' },
    { at: 8.6, sfx: 'gulp' },
    { at: 8.75, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
