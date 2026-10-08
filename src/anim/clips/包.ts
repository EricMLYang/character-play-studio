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
    { id: 'bread', emoji: '🍞', x: 40, y: 73.2, size: 9, hidden: true },
    { id: 'dog', emoji: '🐶', x: 20, y: 71.5, size: 13, hidden: true },
    { id: 'glass', emoji: '🔍', x: 36, y: 64, size: 7, hidden: true, float: true },
    { id: 'cat', emoji: '🐱', x: 142, y: 72, size: 12, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'enter', dur: 0.6 },
    { at: 0.2, actor: 'gift', do: 'pop', dur: 0.4 },
    { at: 0.2, actor: 'gift', do: 'flash', dur: 0.6 },
    { at: 0.4, actor: 'cat', do: 'pop' },
    { at: 0.6, actor: 'dog', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 第一層
    { at: 1.3, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 1.5, actor: 'gift', do: 'shake', dur: 0.3, amount: 1.2 },
    { at: 1.6, actor: 'gift', do: 'scaleTo', amount: 0.7, dur: 0.25 },
    // 第二層
    { at: 2.4, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 2.55, actor: 'gift', do: 'shake', dur: 0.3, amount: 1.2 },
    { at: 2.6, actor: 'gift', do: 'scaleTo', amount: 0.65, dur: 0.25 },
    // 第三層
    { at: 3.25, actor: 'gift', do: 'shake', dur: 0.25, amount: 1 },
    { at: 3.4, actor: 'gift', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    // 第四層：小到看不見
    { at: 3.85, actor: 'gift', do: 'shake', dur: 0.2, amount: 0.6 },
    { at: 4.0, actor: 'gift', do: 'scaleTo', amount: 0.45, dur: 0.2 },
    { at: 4.2, actor: 'dog', do: 'moveTo', to: { x: 28, y: 71.5 }, dur: 0.2 },
    { at: 4.3, actor: 'glass', do: 'pop', dur: 0.25 },
    { at: 4.35, actor: 'gift', do: 'flash', dur: 0.3 },
    // 碰！
    { at: 4.6, actor: 'dog', do: 'moveTo', to: { x: 18, y: 71.5 }, dur: 0.3, arc: 6 },
    { at: 4.6, actor: 'glass', do: 'vanish', dur: 0.2 },
    { at: 4.7, actor: 'gift', do: 'vanish', dur: 0.15 },
    { at: 4.95, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.25 },
    // 麵包
    { at: 6.3, actor: 'bread', do: 'pop' },
    { at: 6.75, actor: 'bread', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
    { at: 6.75, actor: 'dog', do: 'hop', dur: 0.4, amount: 4 },
    // 正要咬……麵包也是禮物
    { at: 7.6, actor: 'dog', do: 'moveTo', to: { x: 30, y: 71.5 }, dur: 0.25 },
    { at: 7.9, actor: 'bread', do: 'shake', dur: 0.4, amount: 1 },
    { at: 8.2, actor: 'bread', do: 'swap', emoji: '🎁' },
    { at: 8.2, actor: 'bread', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 8.6, actor: 'dog', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 8.6, actor: 'dog', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.3 },
    { at: 8.9, actor: 'cat', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
  ],
  builds: [
    // 包裝紙 → 勹；緞帶 → 巳
    { at: 4.75, dur: 0.5, strokes: [0, 1], from: 'gift', color: '#E0457B' },
    { at: 5.1, dur: 0.55, strokes: [2, 3, 4], from: 'gift', color: '#1F9A8A' },
  ],
  glyph: [{ at: 5.65, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'dog', emoji: '😍', dur: 0.7 },
    { at: 1.6, kind: 'burst', actor: 'gift', emoji: '🎉', n: 6, dur: 0.5 },
    { at: 2.0, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.5 },
    { at: 2.6, kind: 'burst', actor: 'gift', emoji: '✨', n: 6, dur: 0.5 },
    { at: 2.95, kind: 'pop', actor: 'dog', emoji: '😑', dur: 0.5 },
    { at: 3.0, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.6, dx: -10 },
    { at: 3.4, kind: 'burst', actor: 'gift', emoji: '✨', n: 5, dur: 0.4 },
    { at: 3.6, kind: 'sweat', actor: 'dog' },
    { at: 4.6, kind: 'burst', actor: 'gift', emoji: '🎊', n: 8, dur: 0.6, dy: -4 },
    { at: 4.6, kind: 'burst', actor: 'gift', dur: 0.4 },
    { at: 4.95, kind: 'dizzy', actor: 'dog', dur: 0.8 },
    { at: 6.3, kind: 'burst', actor: 'bread', emoji: '✨', n: 6, dur: 0.5 },
    { at: 6.6, kind: 'pop', actor: 'dog', emoji: '🤤', dur: 0.6 },
    { at: 8.2, kind: 'burst', actor: 'bread', emoji: '✨', n: 6, dur: 0.5 },
    { at: 8.3, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.4 },
    { at: 8.95, kind: 'dizzy', actor: 'dog', dur: 1.0, dx: -6, dy: 7 },
    { at: 8.9, kind: 'pop', actor: 'cat', emoji: '😆', dur: 0.8, dx: -10 },
  ],
  camera: [
    { at: 4.3, dur: 0.3, do: 'punch', amount: 0.3, to: { x: 36, y: 68 } },
    { at: 4.6, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.6, sfx: 'poof' },
    { at: 1.7, say: '包' },
    { at: 2.6, sfx: 'poof' },
    { at: 3.4, sfx: 'poof' },
    { at: 4.0, sfx: 'poof' },
    { at: 4.6, sfx: 'boing' },
    { at: 5.75, say: '包' },
    { at: 6.3, sfx: 'blip' },
    { at: 6.8, say: '麵包' },
    { at: 8.2, sfx: 'poof' },
    { at: 8.85, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
