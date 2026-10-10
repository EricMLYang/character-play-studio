import type { Clip } from '../clip'

// 蟲：小雞要抓蟲，毛毛蟲「碰」一聲變成一株小草裝沒事，可是小草趁小雞不注意偷偷走路，被抓包。小雞啄下去——
// 小草底下其實疊了三隻蟲！三隻蟲跳起來變成三個「虫」拼成「蟲」。又來一隻毛毛蟲也變小草，這次小雞自己變成向日葵，兩株「植物」大眼瞪小眼。蟲、蟲、毛毛蟲
const clip: Clip = {
  char: '蟲',
  meta: { theme: '小雞抓蟲', cast: '小雞＋毛毛蟲們', gags: ['變裝露餡', '小草會走路', '底下疊了三隻', '小雞也變裝'] },
  duration: 10,
  bg: { top: '#FFF8DC', bottom: '#FDEBB0', floor: '#8CC56B', scenery: 'hills' },
  actors: [
    { id: 'worm', emoji: '🐛', x: 118, y: 72.8, size: 10, hidden: true },
    { id: 'w2', emoji: '🐛', x: 134, y: 67, size: 10, hidden: true, float: true },
    { id: 'w3', emoji: '🐛', x: 134, y: 60.4, size: 10, hidden: true, float: true },
    { id: 'w4', emoji: '🐛', x: 30, y: 72.8, size: 10, hidden: true },
    { id: 'chick', emoji: '🐤', x: 28, y: 70.7, size: 15, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'chick', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.6 },
    { at: 0.3, actor: 'worm', do: 'pop' },
    // 啄啄地上……看到了！
    { at: 1, actor: 'chick', do: 'tilt', amount: 25, dur: 0.25 },
    { at: 1.31, actor: 'chick', do: 'tilt', amount: 25, dur: 0.25 },
    { at: 1.63, actor: 'chick', do: 'hop', amount: 4, dur: 0.3 },
    // 毛毛蟲變成小草
    { at: 1.96, actor: 'worm', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.28, actor: 'worm', do: 'swap', emoji: '🌱' },
    { at: 2.5, actor: 'chick', do: 'moveTo', to: { x: 96, y: 70.7 }, dur: 0.4 },
    { at: 3.04, actor: 'chick', do: 'tilt', amount: 15, dur: 0.4 },
    // 小草偷偷走路
    { at: 3.47, actor: 'worm', do: 'moveTo', to: { x: 126, y: 72.8 }, dur: 0.5 },
    { at: 3.47, actor: 'worm', do: 'bounce', amount: 1.5, times: 3, dur: 0.5 },
    { at: 4.06, actor: 'worm', do: 'moveTo', to: { x: 134, y: 72.8 }, dur: 0.35 },
    { at: 4.06, actor: 'worm', do: 'bounce', amount: 1.5, times: 2, dur: 0.35 },
    // 啄下去——底下疊了三隻！
    { at: 4.44, actor: 'chick', do: 'moveTo', to: { x: 122, y: 70.7 }, dur: 0.2 },
    { at: 4.6, actor: 'chick', do: 'tilt', amount: 30, dur: 0.25 },
    { at: 4.76, actor: 'worm', do: 'swap', emoji: '🐛' },
    { at: 4.76, actor: 'w2', do: 'pop', dur: 0.25 },
    { at: 4.87, actor: 'w3', do: 'pop', dur: 0.25 },
    { at: 4.98, actor: 'chick', do: 'hop', amount: 6, dur: 0.35 },
    // 三隻蟲跳起來變成三個「虫」
    { at: 5.14, actor: 'w3', do: 'hop', amount: 6, dur: 0.2 },
    { at: 5.3, actor: 'w3', do: 'vanish', dur: 0.15 },
    { at: 5.55, actor: 'w2', do: 'hop', amount: 6, dur: 0.2 },
    { at: 5.7, actor: 'w2', do: 'vanish', dur: 0.15 },
    { at: 5.95, actor: 'worm', do: 'hop', amount: 6, dur: 0.2 },
    { at: 6.1, actor: 'worm', do: 'vanish', dur: 0.15 },
    // 又一隻毛毛蟲
    { at: 7.2, actor: 'chick', do: 'flip' },
    { at: 7.3, actor: 'w4', do: 'enter', from: { x: -10, y: 72.8 }, dur: 0.7 },
    { at: 7.3, actor: 'w4', do: 'bounce', amount: 1, times: 4, dur: 0.7 },
    { at: 8.14, actor: 'w4', do: 'swap', emoji: '🌱' },
    // 小雞也變裝：向日葵
    { at: 8.85, actor: 'chick', do: 'swap', emoji: '🌻' },
    { at: 9.12, actor: 'chick', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 9.2, actor: 'w4', do: 'tilt', amount: 10, dur: 0.5 },
  ],
  builds: [
    // 最上面那隻 → 上面的虫；中間那隻 → 左下；最底下那隻 → 右下
    { at: 5.25, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'w3', color: '#4E9F3D' },
    { at: 5.65, dur: 0.6, strokes: [6, 7, 8, 9, 10, 11], from: 'w2', color: '#E8913A' },
    { at: 6.05, dur: 0.6, strokes: [12, 13, 14, 15, 16, 17], from: 'worm', color: '#4E9F3D' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'chick', emoji: '🐛', dur: 0.6 },
    { at: 1.63, kind: 'pop', actor: 'chick', emoji: '❗', dur: 0.5 },
    { at: 1.85, kind: 'pop', actor: 'worm', emoji: '😱', dur: 0.4 },
    { at: 2.23, kind: 'burst', actor: 'worm', emoji: '💨', n: 6, dur: 0.4 },
    { at: 2.5, kind: 'puff', actor: 'chick' },
    { at: 3.04, kind: 'bubble', actor: 'chick', emoji: '❓', dur: 0.5 },
    { at: 4.22, kind: 'pop', actor: 'chick', emoji: '👀', dur: 0.3 },
    { at: 4.71, kind: 'burst', actor: 'worm', dur: 0.35 },
    { at: 4.98, kind: 'pop', actor: 'chick', emoji: '😲', dur: 0.6 },
    { at: 5.9, kind: 'dizzy', actor: 'chick', dur: 1.0 },
    { at: 7.97, kind: 'pop', actor: 'chick', emoji: '❗', dur: 0.4 },
    { at: 8.1, kind: 'burst', actor: 'w4', emoji: '💨', n: 6, dur: 0.4 },
    { at: 8.5, kind: 'bubble', actor: 'chick', emoji: '💡', dur: 0.4 },
    { at: 8.81, kind: 'burst', actor: 'chick', emoji: '💨', n: 6, dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'w4', emoji: '😳', dur: 0.6 },
    { at: 9.29, kind: 'pop', actor: 'chick', emoji: '😏', dur: 0.6 },
  ],
  camera: [
    { at: 4.71, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 130, y: 64 } },
  ],
  cues: [
    { at: 1, sfx: 'tap' }, { at: 1.31, sfx: 'tap' },
    { at: 1.63, say: '蟲' },
    { at: 2.28, sfx: 'poof' },
    { at: 3.47, sfx: 'tap' }, { at: 4.06, sfx: 'tap' },
    { at: 4.71, sfx: 'bonk' },
    { at: 4.82, sfx: 'boing' },
    { at: 6.7, say: '蟲' },
    { at: 7.7, say: '毛毛蟲' },
    { at: 8.14, sfx: 'poof' },
    { at: 8.85, sfx: 'poof' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
