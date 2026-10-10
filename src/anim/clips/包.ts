import type { Clip } from '../clip'

// 包：雪地裡小狗收到一個超大禮物，拆開——裡面是小一點的禮物，再拆又一個更小的，越拆越小，小到要拿放大鏡看。
// 最小的盒子「碰」一聲炸開，包裝紙和緞帶變成「包」，裡面是一塊麵包！小狗正要咬，麵包竟然也是一個禮物盒，小狗昏倒。包、包、麵包
const clip: Clip = {
  char: '包',
  meta: { theme: '拆禮物', cast: '小狗＋看熱鬧的貓', gags: ['盒中盒越拆越小', '放大鏡', '旁觀者偷笑', '麵包也是禮物'] },
  duration: 10,
  bg: { top: '#EAF1FF', bottom: '#D3E2F8', floor: '#FFFFFF', scenery: 'snow' },
  actors: [
    { id: 'gift', emoji: '🎁', x: 40, y: 66.9, size: 24, hidden: true },
    { id: 'bread', emoji: '🍞', x: 40, y: 72.3, size: 11.2, hidden: true },
    { id: 'dog', emoji: '🐶', x: 20, y: 70.2, size: 16.2, hidden: true },
    { id: 'glass', emoji: '🔍', x: 36, y: 64, size: 8.8, hidden: true, float: true },
    { id: 'cat', emoji: '🐱', x: 142, y: 70.7, size: 15, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'enter', dur: 0.6 },
    { at: 0.2, actor: 'gift', do: 'pop', dur: 0.4 },
    { at: 0.2, actor: 'gift', do: 'flash', dur: 0.6 },
    { at: 0.4, actor: 'cat', do: 'pop' },
    { at: 0.6, actor: 'dog', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 第一層
    { at: 1.31, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 1.53, actor: 'gift', do: 'shake', dur: 0.3, amount: 1.2 },
    { at: 1.63, actor: 'gift', do: 'scaleTo', amount: 0.7, dur: 0.25 },
    // 第二層
    { at: 2.5, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 2.66, actor: 'gift', do: 'shake', dur: 0.3, amount: 1.2 },
    { at: 2.72, actor: 'gift', do: 'scaleTo', amount: 0.65, dur: 0.25 },
    // 第三層
    { at: 3.42, actor: 'gift', do: 'shake', dur: 0.25, amount: 1 },
    { at: 3.59, actor: 'gift', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    // 第四層：小到看不見
    { at: 4.07, actor: 'gift', do: 'shake', dur: 0.2, amount: 0.6 },
    { at: 4.24, actor: 'gift', do: 'scaleTo', amount: 0.45, dur: 0.2 },
    { at: 4.45, actor: 'dog', do: 'moveTo', to: { x: 28, y: 70.2 }, dur: 0.2 },
    { at: 4.56, actor: 'glass', do: 'pop', dur: 0.25 },
    { at: 4.62, actor: 'gift', do: 'flash', dur: 0.3 },
    // 碰！
    { at: 4.89, actor: 'dog', do: 'moveTo', to: { x: 18, y: 70.2 }, dur: 0.3, arc: 6 },
    { at: 4.89, actor: 'glass', do: 'vanish', dur: 0.2 },
    { at: 5, actor: 'gift', do: 'vanish', dur: 0.15 },
    { at: 5.25, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.25 },
    // 麵包
    { at: 6.6, actor: 'bread', do: 'pop' },
    { at: 7.05, actor: 'bread', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
    { at: 7.05, actor: 'dog', do: 'hop', dur: 0.4, amount: 4 },
    // 正要咬……麵包也是禮物
    { at: 7.82, actor: 'dog', do: 'moveTo', to: { x: 30, y: 70.2 }, dur: 0.25 },
    { at: 8.1, actor: 'bread', do: 'shake', dur: 0.4, amount: 1 },
    { at: 8.37, actor: 'bread', do: 'swap', emoji: '🎁' },
    { at: 8.37, actor: 'bread', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 8.73, actor: 'dog', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 8.73, actor: 'dog', do: 'moveTo', to: { x: 22, y: 70.2 }, dur: 0.3 },
    { at: 9, actor: 'cat', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
  ],
  builds: [
    // 包裝紙 → 勹；緞帶 → 巳
    { at: 5.05, dur: 0.5, strokes: [0, 1], from: 'gift', color: '#E0457B' },
    { at: 5.4, dur: 0.55, strokes: [2, 3, 4], from: 'gift', color: '#1F9A8A' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'dog', emoji: '😍', dur: 0.7 },
    { at: 1.63, kind: 'burst', actor: 'gift', emoji: '🎉', n: 6, dur: 0.5 },
    { at: 2.07, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.5 },
    { at: 2.72, kind: 'burst', actor: 'gift', emoji: '✨', n: 6, dur: 0.5 },
    { at: 3.1, kind: 'pop', actor: 'dog', emoji: '😑', dur: 0.5 },
    { at: 3.15, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.6, dx: -10 },
    { at: 3.59, kind: 'burst', actor: 'gift', emoji: '✨', n: 5, dur: 0.4 },
    { at: 3.8, kind: 'sweat', actor: 'dog' },
    { at: 4.89, kind: 'burst', actor: 'gift', emoji: '🎊', n: 8, dur: 0.6, dy: -4 },
    { at: 4.89, kind: 'burst', actor: 'gift', dur: 0.4 },
    { at: 5.25, kind: 'dizzy', actor: 'dog', dur: 0.8 },
    { at: 6.6, kind: 'burst', actor: 'bread', emoji: '✨', n: 6, dur: 0.5 },
    { at: 6.9, kind: 'pop', actor: 'dog', emoji: '🤤', dur: 0.6 },
    { at: 8.37, kind: 'burst', actor: 'bread', emoji: '✨', n: 6, dur: 0.5 },
    { at: 8.46, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.4 },
    { at: 9.05, kind: 'dizzy', actor: 'dog', dur: 1.0, dx: -6, dy: 7 },
    { at: 9, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.8, dx: -10 },
  ],
  camera: [
    { at: 4.56, dur: 0.3, do: 'punch', amount: 0.3, to: { x: 36, y: 68 } },
    { at: 4.89, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.63, sfx: 'poof' },
    { at: 1.74, say: '包' },
    { at: 2.72, sfx: 'poof' },
    { at: 3.59, sfx: 'poof' },
    { at: 4.24, sfx: 'poof' },
    { at: 4.89, sfx: 'boing' },
    { at: 6.05, say: '包' },
    { at: 6.6, sfx: 'blip' },
    { at: 7.1, say: '麵包' },
    { at: 8.37, sfx: 'poof' },
    { at: 8.96, sfx: 'bonk' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
