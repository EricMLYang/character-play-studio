import type { Clip } from '../clip'

// 有：大怪獸想要書排最右邊頂端那顆紅蘋果，躡手躡腳走過去，回頭叫背後偷跟的發條鯊魚「噓」——一轉身尾巴掃到第一本書，
// 整排紅書像骨牌一本推一本倒下，倒成「有」；最後一本把蘋果翹上天，正好掉進怪獸手裡。鯊魚咬錯東西轉到頭昏，怪獸笑說「有趣」；
// 回馬槍：鯊魚又撲上來搶蘋果，怪獸一轉身，尾巴又把牠掃飛。有、有、有趣
const clip: Clip = {
  char: '有',
  meta: { theme: '怪獸尾巴骨牌', cast: '大怪獸＋發條鯊魚＋一排紅書＋蘋果', gags: ['轉身尾巴掃倒骨牌', '骨牌把蘋果翹上天', '尾巴又把鯊魚掃飛'] },
  duration: 10,
  bg: { top: '#FFF0B0', bottom: '#FFFAE6', floor: '#D9C08C', scenery: 'room' },
  actors: [
    { id: 'b1', emoji: '📕', x: 60, y: 71.5, size: 12 },
    { id: 'b2', emoji: '📕', x: 74, y: 71.5, size: 12 },
    { id: 'b3', emoji: '📕', x: 88, y: 71.5, size: 12 },
    { id: 'b4', emoji: '📕', x: 102, y: 71.5, size: 12 },
    { id: 'b5', emoji: '📕', x: 116, y: 71.5, size: 12 },
    { id: 'b6', emoji: '📕', x: 130, y: 71.5, size: 12 },
    { id: 'apple', emoji: '🍎', x: 130, y: 61, size: 8 },
    { id: 'shark', emoji: 'hero:shark/idle', x: 10, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'mon', emoji: 'hero:monster/idle', x: 24, y: 70.5, size: 15, flip: true },
  ],
  moves: [
    // 盯著蘋果，開心踏腳
    { at: 0.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 0.4, actor: 'mon', do: 'bounce', amount: 2.5, times: 3, dur: 0.9 },
    // 鯊魚從背後跟進來，對空氣咬一口
    { at: 1.0, actor: 'shark', do: 'enter', from: { x: -15, y: 71.5 }, dur: 0.5 },
    { at: 1.5, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.5, actor: 'shark', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.8, actor: 'shark', do: 'swap', emoji: 'hero:shark/idle' },
    // 躡手躡腳走過去
    { at: 1.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 1.6, actor: 'mon', do: 'moveTo', to: { x: 46, y: 70.5 }, dur: 1.0, ease: 'linear' },
    { at: 1.6, actor: 'mon', do: 'bounce', amount: 1.2, times: 5, dur: 1.0 },
    { at: 1.9, actor: 'shark', do: 'moveTo', to: { x: 26, y: 71.5 }, dur: 0.8, ease: 'linear' },
    // 回頭「噓」——尾巴掃到第一本書
    { at: 2.7, actor: 'mon', do: 'flip' },
    { at: 2.75, actor: 'b1', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 3.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    // 鯊魚撲上來，咬到怪獸尾巴彈回去
    { at: 3.05, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 3.05, actor: 'shark', do: 'moveTo', to: { x: 36, y: 71.5 }, dur: 0.2, anticipate: 3, ease: 'in' },
    { at: 3.3, actor: 'shark', do: 'moveTo', to: { x: 14, y: 71.5 }, dur: 0.35, ease: 'out' },
    { at: 3.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 骨牌！一本推一本，越倒越快
    { at: 3.5, actor: 'b1', do: 'rotateTo', amount: 70, dur: 0.3, ease: 'in' },
    { at: 3.75, actor: 'b2', do: 'rotateTo', amount: 70, dur: 0.28, ease: 'in' },
    { at: 3.98, actor: 'b3', do: 'rotateTo', amount: 70, dur: 0.26, ease: 'in' },
    { at: 4.18, actor: 'b4', do: 'rotateTo', amount: 70, dur: 0.24, ease: 'in' },
    { at: 4.36, actor: 'b5', do: 'rotateTo', amount: 70, dur: 0.22, ease: 'in' },
    { at: 4.52, actor: 'b6', do: 'rotateTo', amount: 70, dur: 0.2, ease: 'in' },
    { at: 3.75, actor: 'b1', do: 'vanish', dur: 0.2 },
    { at: 3.98, actor: 'b2', do: 'vanish', dur: 0.2 },
    { at: 4.18, actor: 'b3', do: 'vanish', dur: 0.2 },
    { at: 4.36, actor: 'b4', do: 'vanish', dur: 0.2 },
    { at: 4.52, actor: 'b5', do: 'vanish', dur: 0.2 },
    { at: 4.72, actor: 'b6', do: 'vanish', dur: 0.2 },
    { at: 3.5, actor: 'mon', do: 'moveTo', to: { x: 36, y: 70.5 }, dur: 0.4, ease: 'out' },
    // 最後一本把蘋果翹上天，掉進怪獸手裡
    { at: 4.7, actor: 'apple', do: 'moveTo', to: { x: 44, y: 62 }, arc: 34, dur: 0.95, ease: 'inOut' },
    { at: 4.7, actor: 'apple', do: 'spin', times: 2, dur: 0.95 },
    { at: 5.5, actor: 'mon', do: 'flip' },
    { at: 5.65, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 5.65, actor: 'mon', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.65, actor: 'apple', do: 'moveTo', to: { x: 41, y: 66 }, dur: 0.15 },
    // 鯊魚咬錯東西，轉到頭昏
    { at: 6.1, actor: 'shark', do: 'flip' },
    { at: 6.35, actor: 'shark', do: 'flip' },
    { at: 6.6, actor: 'shark', do: 'flip' },
    { at: 6.85, actor: 'shark', do: 'flip' },
    { at: 6.1, actor: 'shark', do: 'shake', amount: 1, dur: 1.0 },
    // 怪獸轉頭看鯊魚，笑出來
    { at: 6.4, actor: 'mon', do: 'flip' },
    { at: 6.4, actor: 'apple', do: 'moveTo', to: { x: 31, y: 66 }, dur: 0.15 },
    { at: 6.7, actor: 'mon', do: 'bounce', amount: 2, times: 3, dur: 0.8 },
    { at: 6.7, actor: 'apple', do: 'bounce', amount: 2, times: 3, dur: 0.8 },
    // 回馬槍：鯊魚又撲上來搶蘋果——怪獸一轉身，尾巴又把牠掃飛
    { at: 7.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 8.1, actor: 'shark', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.25, anticipate: 3, ease: 'in' },
    { at: 8.25, actor: 'mon', do: 'flip' },
    { at: 8.25, actor: 'apple', do: 'moveTo', to: { x: 41, y: 66 }, dur: 0.15 },
    { at: 8.4, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 8.4, actor: 'shark', do: 'moveTo', to: { x: -20, y: 40 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: 8.4, actor: 'shark', do: 'spin', times: 2, dur: 0.6 },
    { at: 9.0, actor: 'mon', do: 'hop', amount: 4, dur: 0.35 },
    { at: 9.0, actor: 'apple', do: 'hop', amount: 4, dur: 0.35 },
  ],
  builds: [
    // 一本倒一本：橫 → 撇 → 月的左邊 → 右邊帶鉤 → 裡面兩橫
    { at: 3.75, dur: 0.3, strokes: [0], from: 'b1', color: '#C92A2A' },
    { at: 3.98, dur: 0.3, strokes: [1], from: 'b2', color: '#C92A2A' },
    { at: 4.18, dur: 0.3, strokes: [2], from: 'b3', color: '#C92A2A' },
    { at: 4.36, dur: 0.3, strokes: [3], from: 'b4', color: '#C92A2A' },
    { at: 4.52, dur: 0.3, strokes: [4], from: 'b5', color: '#C92A2A' },
    { at: 4.72, dur: 0.3, strokes: [5], from: 'b6', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'mon', emoji: '🍎', dur: 0.9, dx: 6 },
    { at: 1.6, kind: 'pop', actor: 'shark', emoji: '🍎', dur: 0.5 },
    { at: 2.75, kind: 'pop', actor: 'mon', emoji: '🤫', dur: 0.5 },
    { at: 3.05, kind: 'pop', actor: 'mon', emoji: '❗', dur: 0.5, dx: 5 },
    { at: 3.3, kind: 'burst', actor: 'shark', dur: 0.35 },
    { at: 4.7, kind: 'burst', x: 130, y: 64, emoji: '✨', n: 5, dur: 0.5 },
    { at: 5.65, kind: 'burst', actor: 'mon', emoji: '💕', n: 5, dur: 0.6 },
    { at: 6.1, kind: 'dizzy', actor: 'shark', dur: 1.5 },
    { at: 6.7, kind: 'pop', actor: 'mon', emoji: '😆', dur: 0.8 },
    { at: 8.4, kind: 'burst', x: 20, y: 64, dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'mon', emoji: '😏', dur: 0.7 },
  ],
  camera: [
    { at: 3.0, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 46, y: 62 } },
    { at: 8.4, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.4, sfx: 'boing' },
    { at: 1.0, say: '有' },
    { at: 1.5, sfx: 'clink' },
    { at: 2.75, sfx: 'tap' },
    { at: 3.3, sfx: 'bonk' },
    { at: 3.75, sfx: 'tap' },
    { at: 4.7, sfx: 'boing' },
    { at: 5.1, say: '有' },
    { at: 5.65, sfx: 'plop' },
    { at: 6.7, say: '有趣' },
    { at: 8.4, sfx: 'bonk' },
    { at: 8.5, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
