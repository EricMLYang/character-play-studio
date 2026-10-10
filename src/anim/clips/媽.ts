import type { Clip } from '../clip'

// 媽：袋鼠媽媽的口袋好神奇！小袋鼠跳出去玩——媽媽從口袋拿出蘋果；小袋鼠跌倒——媽媽拿出 OK 繃；
// 下雨了——媽媽拿出一把傘！小袋鼠跳回口袋，口袋裡的東西全掉出來，變成「媽」。小袋鼠在口袋裡睡著了。媽、媽、媽媽
const clip: Clip = {
  char: '媽',
  meta: { theme: '袋鼠媽媽', cast: '袋鼠媽媽＋小袋鼠', gags: ['口袋什麼都有', '東西全掉出來', '在口袋裡睡著'] },
  duration: 10,
  bg: { top: '#FFE7C8', bottom: '#FFF6EA', floor: '#E6C590', scenery: 'desert' },
  actors: [
    { id: 'mom', emoji: '🦘', x: 34, y: 64, size: 30, hidden: true, flip: true },
    { id: 'baby', emoji: '🦘', x: 40, y: 64, size: 12, hidden: true, flip: true },
    { id: 'item', emoji: '🍎', x: 42, y: 60, size: 9, hidden: true, float: true },
    { id: 'cloud', emoji: '🌧️', x: 120, y: 26, size: 18, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'mom', do: 'pop' },
    { at: 0.3, actor: 'baby', do: 'pop' },
    // 小袋鼠跳出去玩
    { at: 0.9, actor: 'baby', do: 'moveTo', to: { x: 120, y: 72 }, dur: 0.7, arc: 20 },
    { at: 1.6, actor: 'baby', do: 'bounce', amount: 4, times: 2, dur: 0.6 },
    // 媽媽拿出蘋果
    { at: 2.3, actor: 'item', do: 'pop', dur: 0.2 },
    { at: 2.5, actor: 'item', do: 'moveTo', to: { x: 116, y: 64 }, dur: 0.5, arc: 14 },
    { at: 3.0, actor: 'item', do: 'vanish', dur: 0.15 },
    // 小袋鼠跌倒——媽媽拿出 OK 繃
    { at: 3.4, actor: 'baby', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 3.9, actor: 'item', do: 'swap', emoji: '🩹' },
    { at: 3.9, actor: 'item', do: 'moveTo', to: { x: 42, y: 60 }, dur: 0.01 },
    { at: 3.92, actor: 'item', do: 'pop', dur: 0.2 },
    { at: 4.1, actor: 'item', do: 'moveTo', to: { x: 120, y: 66 }, dur: 0.5, arc: 14 },
    { at: 4.6, actor: 'item', do: 'vanish', dur: 0.15 },
    { at: 4.7, actor: 'baby', do: 'rotateTo', amount: -90, dur: 0.2 },
    // 下雨了——媽媽拿出一把傘
    { at: 5.0, actor: 'cloud', do: 'pop', dur: 0.3 },
    { at: 5.4, actor: 'item', do: 'swap', emoji: '☂️' },
    { at: 5.4, actor: 'item', do: 'moveTo', to: { x: 42, y: 60 }, dur: 0.01 },
    { at: 5.42, actor: 'item', do: 'pop', dur: 0.2 },
    { at: 5.6, actor: 'item', do: 'moveTo', to: { x: 120, y: 54 }, dur: 0.5, arc: 14 },
    { at: 5.6, actor: 'item', do: 'scaleTo', amount: 1.6, dur: 0.5 },
    // 小袋鼠跳回口袋
    { at: 6.3, actor: 'baby', do: 'moveTo', to: { x: 40, y: 64 }, dur: 0.7, arc: 20 },
    { at: 6.3, actor: 'item', do: 'vanish', dur: 0.2 },
    { at: 6.3, actor: 'cloud', do: 'vanish', dur: 0.4 },
    { at: 7.0, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.4 },
    { at: 8.6, actor: 'mom', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.6, actor: 'baby', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 口袋裡的東西全掉出來：女、馬
    { at: 7.0, dur: 0.5, strokes: [0, 1, 2], from: 'mom', color: '#E8508A' },
    { at: 7.2, dur: 0.8, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], from: 'mom', color: '#C68642' },
  ],
  glyph: [{ at: 8.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'baby', emoji: '😆', dur: 0.5 },
    { at: 3.0, kind: 'pop', actor: 'baby', emoji: '😋', dur: 0.4 },
    { at: 3.5, kind: 'pop', actor: 'baby', emoji: '😢', dur: 0.4 },
    { at: 5.1, kind: 'rain', actor: 'cloud', n: 6, dur: 1.0, dy: 6 },
    { at: 7.0, kind: 'burst', actor: 'mom', emoji: '🍎', n: 5, dur: 0.6 },
    { at: 7.6, kind: 'zzz', actor: 'baby', dur: 2.2 },
  ],
  camera: [
    { at: 6.6, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 38, y: 58 } },
  ],
  cues: [
    { at: 0.9, sfx: 'boing' },
    { at: 1.2, say: '媽' },
    { at: 2.5, sfx: 'whoosh' },
    { at: 3.4, sfx: 'plop' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 5.0, sfx: 'splash' },
    { at: 5.6, sfx: 'whoosh' },
    { at: 6.3, sfx: 'boing' },
    { at: 7.0, sfx: 'poof' },
    { at: 8.1, say: '媽' },
    { at: 9.2, say: '媽媽' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
