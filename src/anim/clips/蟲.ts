import type { Clip } from '../clip'

// 蟲：小雞要抓蟲，毛毛蟲「碰」一聲變成一株小草裝沒事，可是小草趁小雞不注意偷偷走路，被抓包。小雞啄下去——
// 小草底下其實疊了三隻蟲！三隻蟲跳起來變成三個「虫」拼成「蟲」。又來一隻毛毛蟲也變小草，這次小雞自己變成向日葵，兩株「植物」大眼瞪小眼。蟲、蟲、毛毛蟲
const clip: Clip = {
  char: '蟲',
  meta: { theme: '小雞抓蟲', cast: '小雞＋毛毛蟲們', gags: ['變裝露餡', '小草會走路', '底下疊了三隻', '小雞也變裝'] },
  duration: 10,
  bg: { top: '#FFF8DC', bottom: '#FDEBB0', floor: '#8CC56B', scenery: 'hills' },
  actors: [
    { id: 'worm', emoji: '🐛', x: 118, y: 73.6, size: 8, hidden: true },
    { id: 'w2', emoji: '🐛', x: 134, y: 67, size: 8, hidden: true, float: true },
    { id: 'w3', emoji: '🐛', x: 134, y: 60.4, size: 8, hidden: true, float: true },
    { id: 'w4', emoji: '🐛', x: 30, y: 73.6, size: 8, hidden: true },
    { id: 'chick', emoji: '🐤', x: 28, y: 72, size: 12, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'chick', do: 'enter', from: { x: -12, y: 72 }, dur: 0.6 },
    { at: 0.3, actor: 'worm', do: 'pop' },
    // 啄啄地上……看到了！
    { at: 1.0, actor: 'chick', do: 'tilt', amount: 25, dur: 0.25 },
    { at: 1.3, actor: 'chick', do: 'tilt', amount: 25, dur: 0.25 },
    { at: 1.6, actor: 'chick', do: 'hop', amount: 4, dur: 0.3 },
    // 毛毛蟲變成小草
    { at: 1.9, actor: 'worm', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.2, actor: 'worm', do: 'swap', emoji: '🌱' },
    { at: 2.4, actor: 'chick', do: 'moveTo', to: { x: 96, y: 72 }, dur: 0.4 },
    { at: 2.9, actor: 'chick', do: 'tilt', amount: 15, dur: 0.4 },
    // 小草偷偷走路
    { at: 3.3, actor: 'worm', do: 'moveTo', to: { x: 126, y: 73.6 }, dur: 0.5 },
    { at: 3.3, actor: 'worm', do: 'bounce', amount: 1.5, times: 3, dur: 0.5 },
    { at: 3.85, actor: 'worm', do: 'moveTo', to: { x: 134, y: 73.6 }, dur: 0.35 },
    { at: 3.85, actor: 'worm', do: 'bounce', amount: 1.5, times: 2, dur: 0.35 },
    // 啄下去——底下疊了三隻！
    { at: 4.2, actor: 'chick', do: 'moveTo', to: { x: 122, y: 72 }, dur: 0.2 },
    { at: 4.35, actor: 'chick', do: 'tilt', amount: 30, dur: 0.25 },
    { at: 4.5, actor: 'worm', do: 'swap', emoji: '🐛' },
    { at: 4.5, actor: 'w2', do: 'pop', dur: 0.25 },
    { at: 4.6, actor: 'w3', do: 'pop', dur: 0.25 },
    { at: 4.7, actor: 'chick', do: 'hop', amount: 6, dur: 0.35 },
    // 三隻蟲跳起來變成三個「虫」
    { at: 4.85, actor: 'w3', do: 'hop', amount: 6, dur: 0.2 },
    { at: 5.0, actor: 'w3', do: 'vanish', dur: 0.15 },
    { at: 5.25, actor: 'w2', do: 'hop', amount: 6, dur: 0.2 },
    { at: 5.4, actor: 'w2', do: 'vanish', dur: 0.15 },
    { at: 5.65, actor: 'worm', do: 'hop', amount: 6, dur: 0.2 },
    { at: 5.8, actor: 'worm', do: 'vanish', dur: 0.15 },
    // 又一隻毛毛蟲
    { at: 6.9, actor: 'chick', do: 'flip' },
    { at: 7.0, actor: 'w4', do: 'enter', from: { x: -10, y: 73.6 }, dur: 0.7 },
    { at: 7.0, actor: 'w4', do: 'bounce', amount: 1, times: 4, dur: 0.7 },
    { at: 7.9, actor: 'w4', do: 'swap', emoji: '🌱' },
    // 小雞也變裝：向日葵
    { at: 8.7, actor: 'chick', do: 'swap', emoji: '🌻' },
    { at: 9.0, actor: 'chick', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 9.1, actor: 'w4', do: 'tilt', amount: 10, dur: 0.5 },
  ],
  builds: [
    // 最上面那隻 → 上面的虫；中間那隻 → 左下；最底下那隻 → 右下
    { at: 4.95, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'w3', color: '#4E9F3D' },
    { at: 5.35, dur: 0.6, strokes: [6, 7, 8, 9, 10, 11], from: 'w2', color: '#E8913A' },
    { at: 5.75, dur: 0.6, strokes: [12, 13, 14, 15, 16, 17], from: 'worm', color: '#4E9F3D' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'chick', emoji: '🐛', dur: 0.6 },
    { at: 1.6, kind: 'pop', actor: 'chick', emoji: '❗', dur: 0.5 },
    { at: 1.8, kind: 'pop', actor: 'worm', emoji: '😱', dur: 0.4 },
    { at: 2.15, kind: 'burst', actor: 'worm', emoji: '💨', n: 6, dur: 0.4 },
    { at: 2.4, kind: 'puff', actor: 'chick' },
    { at: 2.9, kind: 'bubble', actor: 'chick', emoji: '❓', dur: 0.5 },
    { at: 4.0, kind: 'pop', actor: 'chick', emoji: '👀', dur: 0.3 },
    { at: 4.45, kind: 'burst', actor: 'worm', dur: 0.35 },
    { at: 4.7, kind: 'pop', actor: 'chick', emoji: '😲', dur: 0.6 },
    { at: 5.6, kind: 'dizzy', actor: 'chick', dur: 1.0 },
    { at: 7.7, kind: 'pop', actor: 'chick', emoji: '❗', dur: 0.4 },
    { at: 7.85, kind: 'burst', actor: 'w4', emoji: '💨', n: 6, dur: 0.4 },
    { at: 8.3, kind: 'bubble', actor: 'chick', emoji: '💡', dur: 0.4 },
    { at: 8.65, kind: 'burst', actor: 'chick', emoji: '💨', n: 6, dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'w4', emoji: '😳', dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'chick', emoji: '😏', dur: 0.6 },
  ],
  camera: [
    { at: 4.45, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 130, y: 64 } },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' }, { at: 1.3, sfx: 'tap' },
    { at: 1.6, say: '蟲' },
    { at: 2.2, sfx: 'poof' },
    { at: 3.3, sfx: 'tap' }, { at: 3.85, sfx: 'tap' },
    { at: 4.45, sfx: 'bonk' },
    { at: 4.55, sfx: 'boing' },
    { at: 6.4, say: '蟲' },
    { at: 7.4, say: '毛毛蟲' },
    { at: 7.9, sfx: 'poof' },
    { at: 8.7, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
