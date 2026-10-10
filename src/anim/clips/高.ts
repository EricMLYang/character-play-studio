import type { Clip } from '../clip'

// 高：小雞的氣球卡在好高好高的地方，蜘蛛英雄來救。第一次射絲太短，第二次黏到飛過的小鳥被拖走；
// 第三次用絲一條一條織出一座塔，就是「高」，爬上去拿到氣球——結果被氣球帶著飛過高山，最後掛在蜘蛛絲上彈回來，把氣球交給小雞。高、高、高山
const clip: Clip = {
  char: '高',
  meta: { theme: '蜘蛛英雄', cast: '蜘蛛英雄＋小雞＋小鳥', gags: ['漸強失敗', '被拖走', '織出一座塔', '高空彈跳'] },
  duration: 10,
  bg: { top: '#DCEFFF', bottom: '#C2E0F8', floor: '#C8C8D6', scenery: 'city' },
  actors: [
    { id: 'mountain', emoji: '⛰️', x: 149, y: 61, size: 28, hidden: true, float: true },
    { id: 'chick', emoji: '🐥', x: 132, y: 72.7, size: 10, hidden: true },
    { id: 'balloon', emoji: '🎈', x: 80, y: 7, size: 11.2, hidden: true, float: true },
    { id: 'bird', emoji: '🐦', x: 175, y: 22, size: 10, hidden: true, float: true },
    { id: 'spider', emoji: '🕷️', x: 30, y: 71.3, size: 13.8, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'chick', do: 'pop' },
    { at: 0.1, actor: 'balloon', do: 'pop' },
    { at: 0.1, actor: 'balloon', do: 'bounce', dur: 4, times: 5, amount: 1 },
    { at: 0.4, actor: 'spider', do: 'enter', dur: 0.6 },
    { at: 1, actor: 'spider', do: 'hop', dur: 0.35, amount: 6 },
    // 第一次：絲太短
    { at: 1.85, actor: 'spider', do: 'squash', amount: -0.2, dur: 0.25 },
    // 第二次：黏到飛過的小鳥，被拖走
    { at: 2.39, actor: 'bird', do: 'enter', from: { x: 175, y: 22 }, dur: 0 },
    { at: 2.39, actor: 'bird', do: 'moveTo', to: { x: -25, y: 16 }, dur: 1.4 },
    { at: 2.39, actor: 'bird', do: 'bounce', dur: 1.4, times: 6, amount: 1.5 },
    { at: 2.71, actor: 'spider', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 3.14, actor: 'spider', do: 'moveTo', to: { x: -14, y: 26 }, dur: 0.7, arc: 6 },
    { at: 3.14, actor: 'spider', do: 'spin', dur: 0.7, times: 2 },
    { at: 4.06, actor: 'spider', do: 'moveTo', to: { x: 30, y: 71.3 }, dur: 0.4 },
    { at: 4.49, actor: 'spider', do: 'squash', amount: 0.5, dur: 0.3 },
    // 第三次：咻咻咻織出一座塔
    { at: 5.08, actor: 'spider', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 5.3, actor: 'spider', do: 'shake', dur: 1.2, amount: 0.6 },
    // 爬上去拿氣球……被帶著飛走
    { at: 6.7, actor: 'spider', do: 'moveTo', to: { x: 48, y: 40 }, dur: 0.3 },
    { at: 7, actor: 'spider', do: 'moveTo', to: { x: 74, y: 12 }, dur: 0.3 },
    { at: 7.35, actor: 'balloon', do: 'moveTo', to: { x: 150, y: -6 }, dur: 1.0 },
    { at: 7.35, actor: 'spider', do: 'moveTo', to: { x: 150, y: 4 }, dur: 1.0 },
    { at: 7.5, actor: 'mountain', do: 'pop', dur: 0.4 },
    // 掛在蜘蛛絲上彈回來
    { at: 8.41, actor: 'spider', do: 'moveTo', to: { x: 122, y: 52 }, dur: 0.35 },
    { at: 8.41, actor: 'balloon', do: 'moveTo', to: { x: 122, y: 44 }, dur: 0.35 },
    { at: 8.72, actor: 'spider', do: 'bounce', dur: 0.9, times: 3, amount: 8 },
    { at: 8.72, actor: 'balloon', do: 'bounce', dur: 0.9, times: 3, amount: 8 },
    { at: 9.25, actor: 'balloon', do: 'moveTo', to: { x: 132, y: 60 }, dur: 0.3 },
    { at: 9.47, actor: 'chick', do: 'hop', dur: 0.4, amount: 4 },
  ],
  builds: [
    // 蜘蛛絲一條一條織：外框、兩個口、最上面
    { at: 5.3, dur: 0.5, strokes: [5, 6], from: 'spider', color: '#D8323A' },
    { at: 5.65, dur: 0.45, strokes: [2, 3, 4], from: 'spider', color: '#2F5EC8' },
    { at: 5.95, dur: 0.45, strokes: [7, 8, 9], from: 'spider', color: '#2F5EC8' },
    { at: 6.25, dur: 0.35, strokes: [0, 1], from: 'spider', color: '#D8323A' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'chick', emoji: '😢', dur: 1.4 },
    { at: 1, kind: 'pop', actor: 'spider', emoji: '✨', dur: 0.4 },
    { at: 1.31, kind: 'bubble', actor: 'spider', emoji: '🎈', dur: 0.6 },
    { at: 2.12, kind: 'line', actor: 'spider', to: { x: 52, y: 40 }, color: '#FFFFFF', width: 0.6, dur: 0.35 },
    { at: 2.49, kind: 'bubble', actor: 'spider', emoji: '😅', dur: 0.4 },
    { at: 2.93, kind: 'line', actor: 'spider', target: 'bird', color: '#FFFFFF', width: 0.6, dur: 1.0 },
    { at: 3.09, kind: 'pop', actor: 'spider', emoji: '❗', dur: 0.35 },
    { at: 4.49, kind: 'puff', actor: 'spider' },
    { at: 4.54, kind: 'dizzy', actor: 'spider', dur: 0.6 },
    { at: 5.3, kind: 'line', actor: 'spider', to: { x: 58, y: 56 }, color: '#FFFFFF', width: 0.6, dur: 0.3 },
    { at: 5.65, kind: 'line', actor: 'spider', to: { x: 80, y: 38 }, color: '#FFFFFF', width: 0.6, dur: 0.3 },
    { at: 5.95, kind: 'line', actor: 'spider', to: { x: 80, y: 60 }, color: '#FFFFFF', width: 0.6, dur: 0.3 },
    { at: 6.25, kind: 'line', actor: 'spider', to: { x: 80, y: 18 }, color: '#FFFFFF', width: 0.6, dur: 0.3 },
    { at: 7.35, kind: 'pop', actor: 'spider', emoji: '😮', dur: 0.5, dy: 16 },
    { at: 8.41, kind: 'line', actor: 'spider', to: { x: 122, y: -10 }, color: '#FFFFFF', width: 0.5, dur: 1.4 },
    { at: 9.51, kind: 'burst', actor: 'chick', emoji: '💕', n: 5, dur: 0.6 },
  ],
  camera: [
    { at: 3.14, dur: 0.6, do: 'shake', amount: 0.8 },
    { at: 4.49, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 1, sfx: 'blip' },
    { at: 1.42, say: '高' },
    { at: 2.12, sfx: 'whoosh' }, { at: 2.49, sfx: 'deflate' },
    { at: 2.93, sfx: 'whoosh' }, { at: 3.14, sfx: 'slide' },
    { at: 4.49, sfx: 'bonk' },
    { at: 5.3, sfx: 'whoosh' }, { at: 5.65, sfx: 'whoosh' }, { at: 5.95, sfx: 'whoosh' }, { at: 6.25, sfx: 'whoosh' },
    { at: 6.65, say: '高' },
    { at: 7.7, say: '高山' },
    { at: 8.72, sfx: 'boing' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
