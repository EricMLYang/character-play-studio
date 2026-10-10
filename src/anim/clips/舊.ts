import type { Clip } from '../clip'

// 舊：貓頭鷹找到一本好舊好舊的書，吹一口氣——灰塵噴得滿臉，哈啾！書自己打開，鑽出一隻打哈欠的老書蟲。
// 貓頭鷹湊過去看，書蟲也打了個大噴嚏，書頁全飛出來變成「舊」。書蟲「喀滋」咬了書一口，貓頭鷹嚇一跳。舊、舊、舊書
const clip: Clip = {
  char: '舊',
  meta: { theme: '圖書館', cast: '貓頭鷹＋書蟲＋舊書', gags: ['灰塵噴滿臉', '噴嚏互相傳', '書蟲咬書'] },
  duration: 10,
  bg: { top: '#F3E6D2', bottom: '#FBF4EA', floor: '#9C7552', scenery: 'room' },
  actors: [
    { id: 'book', emoji: '📕', x: 42, y: 70.3, size: 16, hidden: true, tint: 'sepia(.7) brightness(.85)' },
    { id: 'owl', emoji: '🦉', x: 18, y: 68.6, size: 20, hidden: true },
    { id: 'dust', emoji: '💨', x: 30, y: 60, size: 18, hidden: true, float: true, flip: true, tint: 'grayscale(1) brightness(.8)' },
    { id: 'worm', emoji: '🐛', x: 42, y: 62, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'book', do: 'pop' },
    { at: 0.2, actor: 'owl', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    // 吹一口氣——灰塵噴得滿臉
    { at: 1.1, actor: 'owl', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 1.4, actor: 'dust', do: 'pop', dur: 0.3 },
    { at: 1.5, actor: 'dust', do: 'moveTo', to: { x: 20, y: 62 }, dur: 0.4 },
    { at: 2.1, actor: 'owl', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 2.5, actor: 'owl', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 2.5, actor: 'dust', do: 'moveTo', to: { x: -10, y: 50 }, dur: 0.4 },
    { at: 2.9, actor: 'dust', do: 'vanish', dur: 0.1 },
    // 書自己打開，鑽出打哈欠的老書蟲
    { at: 3.3, actor: 'book', do: 'shake', amount: 1, dur: 0.3 },
    { at: 3.6, actor: 'book', do: 'swap', emoji: '📖' },
    { at: 3.7, actor: 'worm', do: 'pop', dur: 0.3 },
    // 貓頭鷹湊過去看——書蟲也打了個大噴嚏
    { at: 4.6, actor: 'owl', do: 'moveTo', to: { x: 26, y: 68.6 }, dur: 0.4 },
    { at: 5.1, actor: 'worm', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 5.45, actor: 'worm', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.5, actor: 'owl', do: 'moveTo', to: { x: 14, y: 68.6 }, dur: 0.4, arc: 10 },
    { at: 5.5, actor: 'owl', do: 'spin', dur: 0.4 },
    { at: 5.5, actor: 'book', do: 'shake', amount: 2, dur: 0.5 },
    // 書蟲咬書一口
    { at: 8.5, actor: 'worm', do: 'moveTo', to: { x: 42, y: 66 }, dur: 0.2 },
    { at: 8.7, actor: 'book', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 8.9, actor: 'owl', do: 'hop', amount: 8, dur: 0.4 },
  ],
  builds: [
    // 噴飛的書頁 → 上面；書蟲 → 下面的臼
    { at: 5.55, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], from: 'book', color: '#A0522D' },
    { at: 6.2, dur: 0.6, strokes: [12, 13, 14, 15, 16, 17], from: 'worm', color: '#4CAF50' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'owl', emoji: '📕', dur: 0.7 },
    { at: 1.6, kind: 'pop', actor: 'owl', emoji: '😖', dur: 0.6 },
    { at: 2.5, kind: 'burst', actor: 'owl', emoji: '💦', n: 6, dur: 0.5 },
    { at: 4.0, kind: 'zzz', actor: 'worm', emoji: '💤', dur: 1.0 },
    { at: 4.4, kind: 'pop', actor: 'worm', emoji: '🥱', dur: 0.6 },
    { at: 5.45, kind: 'burst', actor: 'worm', emoji: '📄', n: 7, dur: 0.6 },
    { at: 5.95, kind: 'dizzy', actor: 'owl', dur: 1.2 },
    { at: 8.7, kind: 'burst', actor: 'book', emoji: '✨', n: 4, dur: 0.4 },
    { at: 8.9, kind: 'pop', actor: 'owl', emoji: '😱', dur: 0.8 },
  ],
  camera: [
    { at: 2.1, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 24, y: 60 } },
    { at: 5.45, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.2, say: '舊' },
    { at: 1.4, sfx: 'poof' },
    { at: 2.5, sfx: 'achoo' },
    { at: 3.6, sfx: 'slide' },
    { at: 3.7, sfx: 'blip' },
    { at: 5.45, sfx: 'achoo' },
    { at: 6.9, say: '舊' },
    { at: 7.85, say: '舊書' },
    { at: 8.7, sfx: 'crack' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
