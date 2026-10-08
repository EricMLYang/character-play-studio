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
    { id: 'rabbit', emoji: '🐇', x: 80, y: 71.5, size: 13, hidden: true },
    { id: 'snake', emoji: '🐍', x: 68, y: 73.2, size: 9, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'rabbit', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.7 },
    { at: 0.9, actor: 'snake', do: 'enter', from: { x: -10, y: 73.2 }, dur: 0.5 },
    { at: 1.35, actor: 'rabbit', do: 'hop', amount: 5, dur: 0.3 },
    // 第一下：慢慢甩過頭、從腳底下回來
    { at: 1.9, actor: 'snake', do: 'moveTo', to: { x: 92, y: 73.2 }, arc: 28, dur: 0.45 },
    { at: 1.9, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.45 },
    { at: 2.35, actor: 'snake', do: 'moveTo', to: { x: 68, y: 73.2 }, dur: 0.3 },
    { at: 2.35, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 2.3, actor: 'rabbit', do: 'hop', amount: 12, dur: 0.4 },
    // 第二下：越甩越快
    { at: 2.8, actor: 'snake', do: 'moveTo', to: { x: 92, y: 73.2 }, arc: 28, dur: 0.25 },
    { at: 2.8, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.25 },
    { at: 3.05, actor: 'snake', do: 'moveTo', to: { x: 68, y: 73.2 }, dur: 0.2 },
    { at: 3.05, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 3.0, actor: 'rabbit', do: 'hop', amount: 12, dur: 0.3 },
    { at: 3.25, actor: 'snake', do: 'moveTo', to: { x: 92, y: 73.2 }, arc: 28, dur: 0.2 },
    { at: 3.25, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 3.45, actor: 'snake', do: 'moveTo', to: { x: 68, y: 73.2 }, dur: 0.15 },
    { at: 3.45, actor: 'snake', do: 'rotateTo', amount: 180, dur: 0.15 },
    { at: 3.4, actor: 'rabbit', do: 'hop', amount: 12, dur: 0.3 },
    // 第三下：在頭頂轉成螺旋槳，兔子自己空跳
    { at: 3.65, actor: 'snake', do: 'moveTo', to: { x: 80, y: 44 }, dur: 0.2 },
    { at: 3.9, actor: 'snake', do: 'spin', times: 6, dur: 0.6 },
    { at: 3.8, actor: 'rabbit', do: 'bounce', amount: 10, times: 3, dur: 0.9 },
    // 打結了！變成蝴蝶餅掉下來
    { at: 4.5, actor: 'snake', do: 'swap', emoji: '🥨' },
    { at: 4.5, actor: 'snake', do: 'moveTo', to: { x: 66, y: 72 }, dur: 0.3 },
    { at: 5.0, actor: 'rabbit', do: 'moveTo', to: { x: 24, y: 71.5 }, arc: 8, dur: 0.5 },
    // 解開：一邊轉一邊甩出筆畫
    { at: 5.3, actor: 'snake', do: 'swap', emoji: '🐍' },
    { at: 5.3, actor: 'snake', do: 'spin', times: 3, dur: 0.6 },
    { at: 5.3, actor: 'snake', do: 'moveTo', to: { x: 40, y: 73.2 }, dur: 0.6 },
    // 大蛇媽媽來了
    { at: 6.9, actor: 'big', do: 'enter', from: { x: 185, y: 66.9 }, dur: 0.8 },
    { at: 7.5, actor: 'rabbit', do: 'hop', amount: 8, dur: 0.35 },
    { at: 7.5, actor: 'snake', do: 'hop', amount: 6, dur: 0.35 },
    // 大蛇也想玩：自己轉圈圈——也打結
    { at: 8.4, actor: 'big', do: 'spin', times: 3, dur: 0.6 },
    { at: 9.0, actor: 'big', do: 'swap', emoji: '🥨' },
    { at: 9.0, actor: 'big', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.2, actor: 'snake', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 9.2, actor: 'rabbit', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    { at: 5.3, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5], from: 'snake', color: '#2E9E57' },
    { at: 5.8, dur: 0.7, strokes: [6, 7, 8, 9, 10], from: 'snake', color: '#EE7A2B' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'rabbit', emoji: '🪢', dur: 0.8 },
    { at: 1.35, kind: 'pop', actor: 'rabbit', emoji: '💡', dur: 0.5 },
    { at: 1.6, kind: 'bubble', actor: 'snake', emoji: '😳', dur: 0.5 },
    { at: 2.75, kind: 'burst', actor: 'rabbit', emoji: '✨', n: 5, dur: 0.5 },
    { at: 3.5, kind: 'sweat', actor: 'snake' },
    { at: 4.2, kind: 'pop', actor: 'rabbit', emoji: '❓', dur: 0.5 },
    { at: 4.8, kind: 'dizzy', actor: 'snake', dur: 0.7 },
    { at: 5.3, kind: 'burst', actor: 'snake', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.5, kind: 'pop', actor: 'rabbit', emoji: '❗', dur: 0.5 },
    { at: 7.9, kind: 'bubble', actor: 'big', emoji: '🪢', dur: 0.6 },
    { at: 9.1, kind: 'dizzy', actor: 'big', dur: 0.9 },
    { at: 9.2, kind: 'pop', actor: 'rabbit', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.75, dur: 0.7, do: 'punch', amount: 0.3, to: { x: 68, y: 66 } },
    { at: 7.6, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.35, sfx: 'blip' },
    { at: 1.4, say: '蛇' },
    { at: 1.9, sfx: 'whoosh' },
    { at: 2.8, sfx: 'whoosh' },
    { at: 3.25, sfx: 'whoosh' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 4.8, sfx: 'plop' },
    { at: 5.3, sfx: 'boing' },
    { at: 6.5, say: '蛇' },
    { at: 6.9, sfx: 'rumble' },
    { at: 7.5, say: '大蛇' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 9.0, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
