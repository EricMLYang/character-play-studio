import type { Clip } from '../clip'

// 蛇：運動會跳繩沒有繩子，小兔子抓小蛇來當跳繩。第一下慢慢甩、第二下越甩越快，第三下甩到小蛇頭昏、打結變成蝴蝶餅；
// 小蛇解開的時候甩出「蛇」。大蛇媽媽來了也想玩，自己轉圈圈——結果也打結成一個超大蝴蝶餅。蛇、蛇、大蛇
const clip: Clip = {
  char: '蛇',
  meta: { theme: '運動會跳繩', cast: '兔子＋小蛇＋大蛇', gags: ['把蛇當跳繩', '越甩越快', '打結變蝴蝶餅', '大蛇也打結'] },
  duration: 10,
  bg: { top: '#E6F4FF', bottom: '#CFE8FB', floor: '#D97A5B', scenery: 'track' },
  actors: [
    { id: 'big', emoji: '🐍', x: 138, y: 66.9, size: 24, hidden: true },
    { id: 'rabbit', emoji: '🐇', x: 80, y: 70.2, size: 16.2, hidden: true },
    { id: 'snake', emoji: '🐍', x: 68, y: 72.3, size: 11.2, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'rabbit', do: 'enter', from: { x: -12, y: 70.2 }, dur: 0.7 },
    { at: 0.9, actor: 'snake', do: 'enter', from: { x: -10, y: 72.3 }, dur: 0.5 },
    { at: 1.36, actor: 'rabbit', do: 'hop', amount: 5, dur: 0.3 },
    // 第一下：慢慢甩過頭、從腳底下回來
    { at: 1.95, actor: 'snake', do: 'moveTo', to: { x: 92, y: 72.3 }, arc: 28, dur: 0.45 },
    { at: 1.95, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.45 },
    { at: 2.43, actor: 'snake', do: 'moveTo', to: { x: 68, y: 72.3 }, dur: 0.3 },
    { at: 2.43, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 2.38, actor: 'rabbit', do: 'hop', amount: 12, dur: 0.4 },
    // 第二下：越甩越快
    { at: 2.92, actor: 'snake', do: 'moveTo', to: { x: 92, y: 72.3 }, arc: 28, dur: 0.25 },
    { at: 2.92, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.25 },
    { at: 3.19, actor: 'snake', do: 'moveTo', to: { x: 68, y: 72.3 }, dur: 0.2 },
    { at: 3.19, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 3.13, actor: 'rabbit', do: 'hop', amount: 12, dur: 0.3 },
    { at: 3.4, actor: 'snake', do: 'moveTo', to: { x: 92, y: 72.3 }, arc: 28, dur: 0.2 },
    { at: 3.4, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 3.61, actor: 'snake', do: 'moveTo', to: { x: 68, y: 72.3 }, dur: 0.15 },
    { at: 3.61, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.15 },
    { at: 3.56, actor: 'rabbit', do: 'hop', amount: 12, dur: 0.3 },
    // 第三下：在頭頂轉成螺旋槳，兔子自己空跳
    { at: 3.83, actor: 'snake', do: 'moveTo', to: { x: 80, y: 44 }, dur: 0.2 },
    { at: 4.1, actor: 'snake', do: 'spin', times: 6, dur: 0.6 },
    { at: 3.99, actor: 'rabbit', do: 'bounce', amount: 10, times: 3, dur: 0.9 },
    // 打結了！變成蝴蝶餅掉下來
    { at: 4.74, actor: 'snake', do: 'swap', emoji: '🥨' },
    { at: 4.74, actor: 'snake', do: 'moveTo', to: { x: 66, y: 72 }, dur: 0.3 },
    { at: 5.28, actor: 'rabbit', do: 'moveTo', to: { x: 24, y: 70.2 }, arc: 8, dur: 0.5 },
    // 解開：一邊轉一邊甩出筆畫
    { at: 5.6, actor: 'snake', do: 'swap', emoji: '🐍' },
    { at: 5.6, actor: 'snake', do: 'spin', times: 3, dur: 0.6 },
    { at: 5.6, actor: 'snake', do: 'moveTo', to: { x: 40, y: 72.3 }, dur: 0.6 },
    // 大蛇媽媽來了
    { at: 7.2, actor: 'big', do: 'enter', from: { x: 185, y: 66.9 }, dur: 0.8 },
    { at: 7.8, actor: 'rabbit', do: 'hop', amount: 8, dur: 0.35 },
    { at: 7.8, actor: 'snake', do: 'hop', amount: 6, dur: 0.35 },
    // 大蛇也想玩：自己轉圈圈——也打結
    { at: 8.59, actor: 'big', do: 'spin', times: 3, dur: 0.6 },
    { at: 9.12, actor: 'big', do: 'swap', emoji: '🥨' },
    { at: 9.12, actor: 'big', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.3, actor: 'snake', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 9.3, actor: 'rabbit', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    { at: 5.6, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5], from: 'snake', color: '#2E9E57' },
    { at: 6.1, dur: 0.7, strokes: [6, 7, 8, 9, 10], from: 'snake', color: '#EE7A2B' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'rabbit', emoji: '🪢', dur: 0.8 },
    { at: 1.36, kind: 'pop', actor: 'rabbit', emoji: '💡', dur: 0.5 },
    { at: 1.63, kind: 'bubble', actor: 'snake', emoji: '😳', dur: 0.5 },
    { at: 2.86, kind: 'burst', actor: 'rabbit', emoji: '✨', n: 5, dur: 0.5 },
    { at: 3.67, kind: 'sweat', actor: 'snake' },
    { at: 4.42, kind: 'pop', actor: 'rabbit', emoji: '❓', dur: 0.5 },
    { at: 5.06, kind: 'dizzy', actor: 'snake', dur: 0.7 },
    { at: 5.6, kind: 'burst', actor: 'snake', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.8, kind: 'pop', actor: 'rabbit', emoji: '❗', dur: 0.5 },
    { at: 8.15, kind: 'bubble', actor: 'big', emoji: '🪢', dur: 0.6 },
    { at: 9.21, kind: 'dizzy', actor: 'big', dur: 0.9 },
    { at: 9.3, kind: 'pop', actor: 'rabbit', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 5.01, dur: 0.7, do: 'punch', amount: 0.3, to: { x: 68, y: 66 } },
    { at: 7.89, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.36, sfx: 'blip' },
    { at: 1.41, say: '蛇' },
    { at: 1.95, sfx: 'whoosh' },
    { at: 2.92, sfx: 'whoosh' },
    { at: 3.4, sfx: 'whoosh' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.42, sfx: 'whoosh' },
    { at: 5.06, sfx: 'plop' },
    { at: 5.6, sfx: 'boing' },
    { at: 6.8, say: '蛇' },
    { at: 7.2, sfx: 'rumble' },
    { at: 7.8, say: '大蛇' },
    { at: 8.59, sfx: 'whoosh' },
    { at: 9.12, sfx: 'plop' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
