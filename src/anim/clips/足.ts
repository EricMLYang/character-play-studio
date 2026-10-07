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
    { id: 'monkey', emoji: '🐵', x: 22, y: 71, size: 13, hidden: true },
    { id: 'ball', emoji: '⚽', x: 44, y: 72, size: 7, hidden: true },
    { id: 'shoe', emoji: '👟', x: 30, y: 72, size: 7, hidden: true },
    { id: 'foot', emoji: '🦶', x: 36, y: 72, size: 7, hidden: true },
    { id: 'bird', emoji: '🐦', x: 175, y: 30, size: 8, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'goal', do: 'pop', dur: 0.4 },
    { at: 0, actor: 'monkey', do: 'enter', dur: 0.6 },
    { at: 0, actor: 'monkey', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 0.3, actor: 'ball', do: 'drop', dur: 0.6 },
    // 蓄力……踢空，轉一圈跌倒
    { at: 0.9, actor: 'monkey', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 1.2, actor: 'monkey', do: 'moveTo', to: { x: 27, y: 71 }, dur: 0.12 },
    { at: 1.25, actor: 'monkey', do: 'spin', dur: 0.5 },
    { at: 1.75, actor: 'monkey', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 1.3, actor: 'ball', do: 'shake', dur: 0.3, amount: 0.4 },
    { at: 2.7, actor: 'monkey', do: 'rotateTo', amount: -90, dur: 0.3 },
    // 一定是鞋子的問題：脫掉！
    { at: 3.1, actor: 'shoe', do: 'pop', dur: 0.15 },
    { at: 3.15, actor: 'shoe', do: 'moveTo', to: { x: -10, y: 10 }, dur: 0.5, arc: 10 },
    { at: 3.15, actor: 'shoe', do: 'spin', dur: 0.5, times: 2 },
    { at: 3.2, actor: 'foot', do: 'pop' },
    { at: 3.4, actor: 'foot', do: 'shake', dur: 0.4, amount: 0.5 },
    // 小鳥飛過——昏倒掉下來
    { at: 3.6, actor: 'bird', do: 'enter', from: { x: 175, y: 30 }, dur: 0 },
    { at: 3.6, actor: 'bird', do: 'moveTo', to: { x: 40, y: 34 }, dur: 0.8 },
    { at: 3.6, actor: 'bird', do: 'bounce', dur: 0.8, times: 4, amount: 2 },
    { at: 4.4, actor: 'bird', do: 'rotateTo', amount: 180, dur: 0.15 },
    { at: 4.55, actor: 'bird', do: 'moveTo', to: { x: 46, y: 72 }, dur: 0.45 },
    // 光腳一踢！
    { at: 5.0, actor: 'monkey', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 5.1, actor: 'foot', do: 'moveTo', to: { x: 41, y: 71 }, dur: 0.1 },
    { at: 5.15, actor: 'ball', do: 'moveTo', to: { x: 136, y: 62 }, dur: 0.45, arc: 14 },
    { at: 5.15, actor: 'ball', do: 'spin', dur: 0.45, times: 3 },
    { at: 5.6, actor: 'goal', do: 'shake', dur: 0.5, amount: 2 },
    { at: 5.3, actor: 'foot', do: 'moveTo', to: { x: 36, y: 72 }, dur: 0.2 },
    // 彈回來砸自己
    { at: 6.4, actor: 'ball', do: 'moveTo', to: { x: 22, y: 62 }, dur: 0.45, arc: 22 },
    { at: 6.4, actor: 'ball', do: 'spin', dur: 0.45, times: 2 },
    { at: 6.85, actor: 'monkey', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 6.9, actor: 'ball', do: 'moveTo', to: { x: 12, y: 72 }, dur: 0.35, arc: 6 },
    // 小鳥醒來，又飛過腳上面……
    { at: 7.6, actor: 'bird', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 7.8, actor: 'bird', do: 'moveTo', to: { x: 36, y: 38 }, dur: 0.6 },
    { at: 7.8, actor: 'bird', do: 'bounce', dur: 0.6, times: 3, amount: 2 },
    { at: 8.5, actor: 'bird', do: 'rotateTo', amount: 180, dur: 0.15 },
    { at: 8.65, actor: 'bird', do: 'moveTo', to: { x: 44, y: 72 }, dur: 0.45 },
    { at: 9.2, actor: 'monkey', do: 'tilt', amount: -15, dur: 0.5 },
  ],
  builds: [
    { at: 5.2, dur: 0.6, strokes: [0, 1, 2], from: 'ball', color: '#2D8CD9' },
    { at: 5.5, dur: 0.8, strokes: [3, 4, 5, 6], from: 'foot', color: '#F08A24' },
  ],
  glyph: [{ at: 6.4, dur: 0.5, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.2, kind: 'puff', actor: 'monkey' },
    { at: 1.95, kind: 'dizzy', actor: 'monkey', dur: 0.8 },
    { at: 2.8, kind: 'bubble', actor: 'monkey', emoji: '👟', dur: 0.4 },
    { at: 3.3, kind: 'stink', actor: 'foot', dur: 2.0 },
    { at: 4.4, kind: 'pop', actor: 'bird', emoji: '😵', dur: 0.5 },
    { at: 5.0, kind: 'dizzy', actor: 'bird', dur: 2.6 },
    { at: 5.1, kind: 'puff', actor: 'monkey' },
    { at: 5.6, kind: 'burst', actor: 'goal', emoji: '🎉', n: 6, dur: 0.7 },
    { at: 6.85, kind: 'burst', actor: 'monkey' },
    { at: 7.9, kind: 'stink', actor: 'foot', dur: 1.2 },
    { at: 8.5, kind: 'pop', actor: 'bird', emoji: '😵', dur: 0.5 },
    { at: 9.1, kind: 'dizzy', actor: 'bird', dur: 0.9 },
    { at: 9.2, kind: 'bubble', actor: 'monkey', emoji: '😅', dur: 0.8 },
  ],
  camera: [
    { at: 4.45, dur: 0.9, do: 'punch', amount: 0.3, to: { x: 42, y: 50 } },
    { at: 6.85, dur: 0.7, do: 'punch', amount: 0.3, to: { x: 22, y: 62 } },
  ],
  cues: [
    { at: 1.2, sfx: 'whoosh' },
    { at: 1.85, sfx: 'bonk' },
    { at: 3.15, sfx: 'whoosh' },
    { at: 3.25, say: '足' },
    { at: 4.4, sfx: 'deflate' },
    { at: 5.0, sfx: 'bonk' },
    { at: 5.15, sfx: 'whoosh' },
    { at: 5.6, sfx: 'cheer' },
    { at: 6.1, say: '足' },
    { at: 6.85, sfx: 'bonk' },
    { at: 7.05, say: '足球' },
    { at: 8.5, sfx: 'deflate' },
    { at: 9.1, sfx: 'bonk' },
  ],
}

export default clip
