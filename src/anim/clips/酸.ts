import type { Clip } from '../clip'

// 酸：吃檸檬大賽。青蛙舔一口就皺成一團，小豬咬一口酸到轉圈圈，無尾熊冠軍一口吞下整顆檸檬還在耍帥——
// 過了好久才「酸」到發抖、噴出檸檬汁變成「酸」。拿酸梅湯來解酸，結果更酸，連旁邊兩隻都跟著皺臉。酸、酸、酸梅湯
const clip: Clip = {
  char: '酸',
  meta: { theme: '吃檸檬大賽', cast: '青蛙＋小豬＋無尾熊冠軍', gags: ['一個比一個酸（漸強）', '耍帥慢半拍才發作', '解酸的飲料更酸', '旁觀者跟著皺臉'] },
  duration: 10,
  bg: { top: '#F6FFD6', bottom: '#E4F7A8', floor: '#9CC75A', scenery: 'track' },
  actors: [
    { id: 'frog', emoji: '🐸', x: 18, y: 72, size: 12, hidden: true },
    { id: 'pig', emoji: '🐷', x: 36, y: 71.5, size: 13, hidden: true },
    { id: 'koala', emoji: '🐨', x: 128, y: 70.3, size: 16, hidden: true },
    { id: 'l1', emoji: '🍋', x: 24, y: 64, size: 6, hidden: true, float: true },
    { id: 'l2', emoji: '🍋', x: 43, y: 63, size: 6, hidden: true, float: true },
    { id: 'l3', emoji: '🍋', x: 116, y: 60, size: 10, hidden: true, float: true },
    { id: 'cup', emoji: '🥤', x: 146, y: 73.6, size: 8, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'frog', do: 'pop' },
    { at: 0.15, actor: 'pig', do: 'pop' },
    { at: 0.3, actor: 'koala', do: 'pop' },
    // 青蛙：舔一小口
    { at: 0.9, actor: 'l1', do: 'pop' },
    { at: 1.2, actor: 'l1', do: 'moveTo', to: { x: 19, y: 68 }, dur: 0.2 },
    { at: 1.4, actor: 'l1', do: 'vanish', dur: 0.15 },
    { at: 1.45, actor: 'frog', do: 'squash', amount: 0.5, dur: 0.7 },
    { at: 1.45, actor: 'frog', do: 'shake', amount: 1.2, dur: 0.7 },
    // 小豬：咬一大口，酸到轉圈
    { at: 2.2, actor: 'l2', do: 'pop' },
    { at: 2.5, actor: 'l2', do: 'moveTo', to: { x: 37, y: 67 }, dur: 0.2 },
    { at: 2.7, actor: 'l2', do: 'vanish', dur: 0.15 },
    { at: 2.75, actor: 'pig', do: 'squash', amount: 0.6, dur: 0.5 },
    { at: 3.0, actor: 'pig', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.0, actor: 'pig', do: 'hop', amount: 6, dur: 0.6 },
    // 無尾熊冠軍：整顆吞下去，還在耍帥……
    { at: 3.5, actor: 'l3', do: 'pop' },
    { at: 3.8, actor: 'l3', do: 'moveTo', to: { x: 127, y: 66 }, dur: 0.2 },
    { at: 4.0, actor: 'l3', do: 'vanish', dur: 0.15 },
    { at: 4.0, actor: 'koala', do: 'squash', amount: 0.2, dur: 0.25 },
    // 慢半拍：發抖、拉長、噴出檸檬汁
    { at: 4.7, actor: 'koala', do: 'shake', amount: 2.5, dur: 0.5 },
    { at: 4.9, actor: 'koala', do: 'squash', amount: -0.45, dur: 0.4 },
    { at: 5.2, actor: 'koala', do: 'hop', amount: 18, dur: 0.6 },
    { at: 5.8, actor: 'koala', do: 'squash', amount: 0.4, dur: 0.3 },
    // 酸梅湯從天而降：喝一口更酸
    { at: 6.8, actor: 'cup', do: 'drop', dur: 0.5 },
    { at: 7.35, actor: 'cup', do: 'moveTo', to: { x: 136, y: 69 }, dur: 0.25 },
    { at: 7.7, actor: 'koala', do: 'squash', amount: 0.7, dur: 0.8 },
    { at: 7.7, actor: 'koala', do: 'shake', amount: 3, dur: 0.8 },
    // 旁邊兩隻看了也跟著皺臉
    { at: 8.4, actor: 'frog', do: 'squash', amount: 0.55, dur: 0.6 },
    { at: 8.5, actor: 'pig', do: 'squash', amount: 0.55, dur: 0.6 },
    { at: 8.4, actor: 'frog', do: 'shake', amount: 1, dur: 0.6 },
    { at: 8.5, actor: 'pig', do: 'shake', amount: 1, dur: 0.6 },
  ],
  builds: [
    // 噴出來的檸檬汁 → 酉；灑下來的汁 → 夋
    { at: 5.25, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'koala', color: '#5E9E1A' },
    { at: 5.8, dur: 0.7, strokes: [7, 8, 9, 10, 11, 12, 13], from: { x: 128, y: 40 }, style: 'drop', color: '#E09A00' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'pop', actor: 'koala', emoji: '😎', dur: 0.8 },
    { at: 1.5, kind: 'pop', actor: 'frog', emoji: '😖', dur: 0.8 },
    { at: 2.85, kind: 'pop', actor: 'pig', emoji: '😵', dur: 0.9 },
    { at: 3.2, kind: 'sweat', actor: 'pig' },
    { at: 4.05, kind: 'bubble', actor: 'koala', emoji: '😎', dur: 0.6, dx: 4 },
    { at: 4.7, kind: 'pop', actor: 'koala', emoji: '❗', dur: 0.4 },
    { at: 5.2, kind: 'fountain', actor: 'koala', emoji: '💦', n: 8, dur: 0.7 },
    { at: 6.1, kind: 'dizzy', actor: 'koala', dur: 0.8 },
    { at: 6.9, kind: 'bubble', actor: 'koala', emoji: '🥤', dur: 0.6 },
    { at: 7.75, kind: 'pop', actor: 'koala', emoji: '😖', dur: 0.8 },
    { at: 7.8, kind: 'sweat', actor: 'koala' },
    { at: 8.45, kind: 'pop', actor: 'frog', emoji: '😖', dur: 0.7 },
    { at: 8.55, kind: 'pop', actor: 'pig', emoji: '😖', dur: 0.7 },
    { at: 9.2, kind: 'sweat', actor: 'frog' },
    { at: 9.25, kind: 'sweat', actor: 'pig' },
  ],
  camera: [
    { at: 4.6, dur: 0.9, do: 'punch', amount: 0.3, to: { x: 128, y: 62 } },
    { at: 7.7, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.4, sfx: 'gulp' },
    { at: 1.6, say: '酸' },
    { at: 2.7, sfx: 'gulp' },
    { at: 3.0, sfx: 'boing' },
    { at: 4.0, sfx: 'gulp' },
    { at: 4.7, sfx: 'rumble' },
    { at: 5.2, sfx: 'splash' },
    { at: 6.5, say: '酸' },
    { at: 6.9, sfx: 'plop' },
    { at: 7.5, say: '酸梅湯' },
    { at: 7.7, sfx: 'gulp' },
    { at: 8.4, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
