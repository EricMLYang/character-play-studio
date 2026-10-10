import type { Clip } from '../clip'

// 去：小狗叼著牽繩想出去玩。打開門——外面在下雨，關門；再打開——外面下大雪，趕快關門！第三次打開——出太陽了！
// 小狗開心衝出去，跑過的腳印變成「去」……結果被門口的貓搶先一步溜出去。去、去、出去
const clip: Clip = {
  char: '去',
  meta: { theme: '出門散步', cast: '小狗＋門＋貓', gags: ['開門天氣一直變', '關門關超快', '被搶先一步'] },
  duration: 10,
  bg: { top: '#E3F0FF', bottom: '#F8FBFF', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'door', emoji: '🚪', x: 138, y: 64, size: 30, hidden: true },
    { id: 'weather', emoji: '🌧️', x: 138, y: 56, size: 16, hidden: true, float: true },
    { id: 'dog', emoji: '🐕', x: 34, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'cat', emoji: '🐈', x: 118, y: 70, size: 15, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'door', do: 'pop' },
    { at: 0.2, actor: 'dog', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    { at: 0.9, actor: 'dog', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 打開門——下雨，關門
    { at: 1.6, actor: 'dog', do: 'moveTo', to: { x: 116, y: 69.5 }, dur: 0.5 },
    { at: 2.1, actor: 'door', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 2.2, actor: 'weather', do: 'pop', dur: 0.2 },
    { at: 2.9, actor: 'weather', do: 'vanish', dur: 0.1 },
    { at: 2.9, actor: 'door', do: 'shake', amount: 1, dur: 0.3 },
    // 再打開——大雪！趕快關門
    { at: 3.6, actor: 'weather', do: 'swap', emoji: '🌨️' },
    { at: 3.6, actor: 'door', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 3.7, actor: 'weather', do: 'pop', dur: 0.2 },
    { at: 4.0, actor: 'dog', do: 'moveTo', to: { x: 104, y: 69.5 }, dur: 0.3, arc: 6 },
    { at: 4.3, actor: 'weather', do: 'vanish', dur: 0.1 },
    { at: 4.3, actor: 'door', do: 'shake', amount: 1.5, dur: 0.3 },
    // 第三次——出太陽了！
    { at: 5.0, actor: 'weather', do: 'swap', emoji: '☀️' },
    { at: 5.0, actor: 'door', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 5.1, actor: 'weather', do: 'pop', dur: 0.3 },
    { at: 5.5, actor: 'dog', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 小狗開心衝出去
    { at: 6.1, actor: 'dog', do: 'moveTo', to: { x: 138, y: 69.5 }, dur: 0.3 },
    { at: 6.35, actor: 'dog', do: 'vanish', dur: 0.15 },
    // 結果貓搶先一步溜出去
    { at: 7.6, actor: 'cat', do: 'pop' },
    { at: 8.2, actor: 'cat', do: 'moveTo', to: { x: 138, y: 70 }, dur: 0.4 },
    { at: 8.6, actor: 'cat', do: 'vanish', dur: 0.15 },
    { at: 8.9, actor: 'dog', do: 'moveTo', to: { x: 124, y: 69.5 }, dur: 0.01 },
    { at: 8.92, actor: 'dog', do: 'pop', dur: 0.2 },
    { at: 9.0, actor: 'door', do: 'shake', amount: 1, dur: 0.3 },
  ],
  builds: [
    // 小狗衝出去的腳印
    { at: 6.2, dur: 0.6, strokes: [0, 1, 2], from: 'dog', color: '#8A5A3B' },
    { at: 6.6, dur: 0.5, strokes: [3, 4], from: 'dog', color: '#E86A33' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'dog', emoji: '🌳', dur: 0.7 },
    { at: 2.3, kind: 'rain', actor: 'weather', n: 6, dur: 0.6, dy: 6 },
    { at: 2.5, kind: 'pop', actor: 'dog', emoji: '😑', dur: 0.5 },
    { at: 3.8, kind: 'rain', actor: 'weather', emoji: '❄️', n: 6, dur: 0.5, dy: 6 },
    { at: 4.0, kind: 'pop', actor: 'dog', emoji: '🥶', dur: 0.5 },
    { at: 5.2, kind: 'burst', actor: 'weather', emoji: '✨', n: 6, dur: 0.6 },
    { at: 5.5, kind: 'pop', actor: 'dog', emoji: '😆', dur: 0.6 },
    { at: 6.1, kind: 'puff', actor: 'dog' },
    { at: 7.7, kind: 'pop', actor: 'cat', emoji: '😼', dur: 0.6 },
    { at: 9.1, kind: 'pop', actor: 'dog', emoji: '😳', dur: 0.8 },
  ],
  camera: [
    { at: 4.2, dur: 0.4, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.9, say: '去' },
    { at: 2.1, sfx: 'tap' },
    { at: 2.2, sfx: 'splash' },
    { at: 2.9, sfx: 'bonk' },
    { at: 3.6, sfx: 'tap' },
    { at: 4.3, sfx: 'bonk' },
    { at: 5.0, sfx: 'tap' },
    { at: 5.1, sfx: 'blip' },
    { at: 6.1, sfx: 'whoosh' },
    { at: 7.2, say: '去' },
    { at: 8.2, say: '出去' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
