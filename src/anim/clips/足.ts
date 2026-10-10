import type { Clip } from '../clip'

// 足：猴子用力一踢——完全沒踢到，自己轉一圈跌倒。脫掉鞋子露出腳丫，臭味飄上去，飛過的小鳥直接昏倒掉下來。
// 光腳一踢，球飛進球門又彈回來砸到自己頭；小鳥醒來又飛過腳上面……又昏倒了。足、足、足球
const clip: Clip = {
  char: '足',
  meta: { theme: '運動', cast: '猴子＋小鳥', gags: ['踢空跌倒', '臭腳丫', '昏倒兩次', '球彈回砸頭'] },
  duration: 10,
  bg: { top: '#E6F7E0', bottom: '#D2EFC8', floor: '#9ED37F', scenery: 'hills' },
  actors: [
    { id: 'goal', emoji: '🥅', x: 138, y: 64, size: 22, hidden: true },
    { id: 'monkey', emoji: '🐵', x: 22, y: 69.7, size: 16.2, hidden: true },
    { id: 'ball', emoji: '⚽', x: 44, y: 71.2, size: 8.8, hidden: true },
    { id: 'shoe', emoji: '👟', x: 30, y: 71.2, size: 8.8, hidden: true },
    { id: 'foot', emoji: '🦶', x: 36, y: 71.2, size: 8.8, hidden: true },
    { id: 'bird', emoji: '🐦', x: 175, y: 30, size: 10, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'goal', do: 'pop', dur: 0.4 },
    { at: 0, actor: 'monkey', do: 'enter', dur: 0.6 },
    { at: 0, actor: 'monkey', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 0.3, actor: 'ball', do: 'drop', dur: 0.6 },
    // 蓄力……踢空，轉一圈跌倒
    { at: 0.9, actor: 'monkey', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 1.2, actor: 'monkey', do: 'moveTo', to: { x: 27, y: 69.7 }, dur: 0.12 },
    { at: 1.25, actor: 'monkey', do: 'spin', dur: 0.5 },
    { at: 1.79, actor: 'monkey', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 1.31, actor: 'ball', do: 'shake', dur: 0.3, amount: 0.4 },
    { at: 2.81, actor: 'monkey', do: 'rotateTo', amount: -90, dur: 0.3 },
    // 一定是鞋子的問題：脫掉！
    { at: 3.24, actor: 'shoe', do: 'pop', dur: 0.15 },
    { at: 3.3, actor: 'shoe', do: 'moveTo', to: { x: -10, y: 10 }, dur: 0.5, arc: 10 },
    { at: 3.3, actor: 'shoe', do: 'spin', dur: 0.5, times: 2 },
    { at: 3.35, actor: 'foot', do: 'pop' },
    { at: 3.57, actor: 'foot', do: 'shake', dur: 0.4, amount: 0.5 },
    // 小鳥飛過——昏倒掉下來
    { at: 3.78, actor: 'bird', do: 'enter', from: { x: 175, y: 30 }, dur: 0 },
    { at: 3.78, actor: 'bird', do: 'moveTo', to: { x: 40, y: 34 }, dur: 0.8 },
    { at: 3.78, actor: 'bird', do: 'bounce', dur: 0.8, times: 4, amount: 2 },
    { at: 4.64, actor: 'bird', do: 'rotateTo', amount: 180, dur: 0.15 },
    { at: 4.8, actor: 'bird', do: 'moveTo', to: { x: 46, y: 71.2 }, dur: 0.45 },
    // 光腳一踢！
    { at: 5.29, actor: 'monkey', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 5.39, actor: 'foot', do: 'moveTo', to: { x: 41, y: 69.7 }, dur: 0.1 },
    { at: 5.45, actor: 'ball', do: 'moveTo', to: { x: 136, y: 62 }, dur: 0.45, arc: 14 },
    { at: 5.45, actor: 'ball', do: 'spin', dur: 0.45, times: 3 },
    { at: 5.9, actor: 'goal', do: 'shake', dur: 0.5, amount: 2 },
    { at: 5.6, actor: 'foot', do: 'moveTo', to: { x: 36, y: 71.2 }, dur: 0.2 },
    // 彈回來砸自己
    { at: 6.7, actor: 'ball', do: 'moveTo', to: { x: 22, y: 62 }, dur: 0.45, arc: 22 },
    { at: 6.7, actor: 'ball', do: 'spin', dur: 0.45, times: 2 },
    { at: 7.15, actor: 'monkey', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 7.2, actor: 'ball', do: 'moveTo', to: { x: 12, y: 71.2 }, dur: 0.35, arc: 6 },
    // 小鳥醒來，又飛過腳上面……
    { at: 7.84, actor: 'bird', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 8.02, actor: 'bird', do: 'moveTo', to: { x: 36, y: 38 }, dur: 0.6 },
    { at: 8.02, actor: 'bird', do: 'bounce', dur: 0.6, times: 3, amount: 2 },
    { at: 8.65, actor: 'bird', do: 'rotateTo', amount: 180, dur: 0.15 },
    { at: 8.79, actor: 'bird', do: 'moveTo', to: { x: 44, y: 71.2 }, dur: 0.45 },
    { at: 9.28, actor: 'monkey', do: 'tilt', amount: -15, dur: 0.5 },
  ],
  builds: [
    { at: 5.5, dur: 0.6, strokes: [0, 1, 2], from: 'ball', color: '#2D8CD9' },
    { at: 5.8, dur: 0.8, strokes: [3, 4, 5, 6], from: 'foot', color: '#F08A24' },
  ],
  glyph: [{ at: 6.7, dur: 0.5, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.2, kind: 'puff', actor: 'monkey' },
    { at: 2.01, kind: 'dizzy', actor: 'monkey', dur: 0.8 },
    { at: 2.92, kind: 'bubble', actor: 'monkey', emoji: '👟', dur: 0.4 },
    { at: 3.46, kind: 'stink', actor: 'foot', dur: 2.0 },
    { at: 4.64, kind: 'pop', actor: 'bird', emoji: '😵', dur: 0.5 },
    { at: 5.29, kind: 'dizzy', actor: 'bird', dur: 2.6 },
    { at: 5.39, kind: 'puff', actor: 'monkey' },
    { at: 5.9, kind: 'burst', actor: 'goal', emoji: '🎉', n: 6, dur: 0.7 },
    { at: 7.15, kind: 'burst', actor: 'monkey' },
    { at: 8.11, kind: 'stink', actor: 'foot', dur: 1.2 },
    { at: 8.65, kind: 'pop', actor: 'bird', emoji: '😵', dur: 0.5 },
    { at: 9.19, kind: 'dizzy', actor: 'bird', dur: 0.9 },
    { at: 9.28, kind: 'bubble', actor: 'monkey', emoji: '😅', dur: 0.8 },
  ],
  camera: [
    { at: 4.69, dur: 0.9, do: 'punch', amount: 0.3, to: { x: 42, y: 50 } },
    { at: 7.15, dur: 0.7, do: 'punch', amount: 0.3, to: { x: 22, y: 62 } },
  ],
  cues: [
    { at: 1.2, sfx: 'whoosh' },
    { at: 1.9, sfx: 'bonk' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 1.25, say: '足' },
    { at: 4.64, sfx: 'deflate' },
    { at: 5.29, sfx: 'bonk' },
    { at: 5.45, sfx: 'whoosh' },
    { at: 5.9, sfx: 'cheer' },
    { at: 6.4, say: '足' },
    { at: 7.15, sfx: 'bonk' },
    { at: 7.35, say: '足球' },
    { at: 8.65, sfx: 'deflate' },
    { at: 9.19, sfx: 'bonk' },
  ],
}

export default clip
