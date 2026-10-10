import type { Clip } from '../clip'

// 草：割草機一發動就失控，割了一叢草就開始轉圈、跳起來，把旁邊的小花割掉了；山羊跳過割草機，一口一叢把草吃光，
// 割草機自己冒煙爆掉，割下來的草屑和山羊打的飽嗝變成「草」。地上冒出一株小草，山羊想吃，小草一下子長成大樹——山羊照樣啃光。草、草、小草
const clip: Clip = {
  char: '草',
  meta: { theme: '割草機失控', cast: '割草機＋山羊', gags: ['機器失控', '割錯東西', '山羊比機器厲害', '打飽嗝', '小草變大樹照樣啃'] },
  duration: 10,
  bg: { top: '#E3F4FF', bottom: '#C4E5F7', floor: '#6DB548', scenery: 'city' },
  actors: [
    { id: 'g1', emoji: '🌿', x: 62, y: 72.3, size: 11.2, hidden: true },
    { id: 'g2', emoji: '🌿', x: 82, y: 72.3, size: 11.2, hidden: true },
    { id: 'g3', emoji: '🌿', x: 100, y: 72.3, size: 11.2, hidden: true },
    { id: 'flower', emoji: '🌷', x: 120, y: 72.8, size: 10, hidden: true },
    { id: 'sprout', emoji: '🌱', x: 38, y: 73.2, size: 8.8, hidden: true },
    { id: 'mower', emoji: '🚜', x: 20, y: 69.6, size: 17.5, hidden: true, flip: true },
    { id: 'goat', emoji: '🐐', x: 142, y: 70.2, size: 16.2, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'mower', do: 'pop' },
    { at: 0.09, actor: 'g1', do: 'pop' }, { at: 0.18, actor: 'g2', do: 'pop' }, { at: 0.26, actor: 'g3', do: 'pop' },
    { at: 0.35, actor: 'flower', do: 'pop' },
    { at: 0.26, actor: 'goat', do: 'enter', from: { x: 175, y: 70.2 }, dur: 0.6 },
    // 發動……衝出去割第一叢
    { at: 0.71, actor: 'mower', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.06, actor: 'mower', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 1.15, actor: 'mower', do: 'moveTo', to: { x: 62, y: 69.6 }, dur: 0.35 },
    { at: 1.41, actor: 'g1', do: 'vanish', dur: 0.15 },
    // 失控：轉圈、跳起來，割到小花
    { at: 1.85, actor: 'mower', do: 'spin', times: 1, dur: 0.4 },
    { at: 2.33, actor: 'mower', do: 'moveTo', to: { x: 124, y: 69.6 }, arc: 14, dur: 0.5 },
    { at: 2.91, actor: 'mower', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.91, actor: 'flower', do: 'vanish', dur: 0.15 },
    // 山羊跳過割草機，開始吃草
    { at: 2.97, actor: 'goat', do: 'moveTo', to: { x: 108, y: 70.2 }, arc: 16, dur: 0.5 },
    { at: 3.56, actor: 'goat', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 3.62, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 }, { at: 3.86, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 3.62, actor: 'g3', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    { at: 3.92, actor: 'g3', do: 'vanish', dur: 0.15 },
    { at: 4.09, actor: 'goat', do: 'moveTo', to: { x: 91, y: 70.2 }, dur: 0.2 },
    { at: 4.33, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 }, { at: 4.56, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 4.33, actor: 'g2', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    { at: 4.62, actor: 'g2', do: 'vanish', dur: 0.15 },
    { at: 4.8, actor: 'goat', do: 'moveTo', to: { x: 24, y: 70.2 }, dur: 0.6 },
    { at: 4.8, actor: 'goat', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    // 割草機還在轉，衝到旁邊爆掉
    { at: 3.5, actor: 'mower', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.21, actor: 'mower', do: 'moveTo', to: { x: 142, y: 69.6 }, dur: 0.25 },
    { at: 4.56, actor: 'mower', do: 'shake', amount: 1.5, dur: 0.5 },
    // 山羊打飽嗝
    { at: 5.5, actor: 'goat', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 5.7, actor: 'goat', do: 'hop', amount: 3, dur: 0.25 },
    // 小草冒出來
    { at: 6.93, actor: 'goat', do: 'flip' },
    { at: 7.35, actor: 'sprout', do: 'pop' },
    // 想吃——長成大樹
    { at: 8.24, actor: 'goat', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 8.37, actor: 'sprout', do: 'swap', emoji: '🌳' },
    { at: 8.37, actor: 'sprout', do: 'scaleTo', amount: 2.6, dur: 0.4 },
    { at: 8.55, actor: 'goat', do: 'moveTo', to: { x: 17, y: 70.2 }, dur: 0.25 },
    { at: 8.55, actor: 'goat', do: 'hop', amount: 5, dur: 0.25 },
    // 照樣啃光
    { at: 9.03, actor: 'goat', do: 'moveTo', to: { x: 22, y: 70.2 }, dur: 0.2 },
    { at: 9.12, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 9.29, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 9.47, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 9.12, actor: 'sprout', do: 'scaleTo', amount: 0.35, dur: 0.6 },
  ],
  builds: [
    // 割草機噴出的草屑 → 早；山羊的飽嗝 → 艹
    { at: 4.8, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'mower', color: '#C27A2C' },
    { at: 5.7, dur: 0.6, strokes: [0, 1, 2], from: 'goat', color: '#2E9E4F' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.71, kind: 'puff', actor: 'mower' },
    { at: 1.15, kind: 'puff', actor: 'mower' },
    { at: 1.41, kind: 'burst', actor: 'g1', emoji: '🍃', n: 6, dur: 0.5 },
    { at: 1.85, kind: 'sweat', actor: 'mower' },
    { at: 2.44, kind: 'pop', actor: 'goat', emoji: '😱', dur: 0.4 },
    { at: 2.91, kind: 'burst', actor: 'flower', emoji: '🌸', n: 6, dur: 0.5 },
    { at: 3.62, kind: 'pop', actor: 'goat', emoji: '😋', dur: 0.4 },
    { at: 4.56, kind: 'burst', actor: 'mower', dur: 0.4 },
    { at: 4.8, kind: 'stink', actor: 'mower', dur: 2.5, dy: -4 },
    { at: 5.7, kind: 'burst', actor: 'goat', emoji: '🌿', n: 5, dur: 0.5 },
    { at: 7.71, kind: 'bubble', actor: 'goat', emoji: '😋', dur: 0.5 },
    { at: 8.59, kind: 'pop', actor: 'goat', emoji: '😱', dur: 0.4 },
    { at: 9.12, kind: 'burst', actor: 'sprout', emoji: '🍃', n: 6, dur: 0.6 },
    { at: 9.56, kind: 'pop', actor: 'goat', emoji: '😋', dur: 0.5 },
    { at: 8.94, kind: 'dizzy', actor: 'mower', dur: 1.2 },
  ],
  camera: [
    { at: 2.91, dur: 0.5, do: 'shake', amount: 1.5 },
    { at: 8.37, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 30, y: 62 } },
  ],
  cues: [
    { at: 0.71, sfx: 'rumble' },
    { at: 1.15, sfx: 'whoosh' },
    { at: 1.5, say: '草' },
    { at: 2.33, sfx: 'boing' },
    { at: 2.91, sfx: 'crack' },
    { at: 3.62, sfx: 'gulp' },
    { at: 4.33, sfx: 'gulp' },
    { at: 4.56, sfx: 'bonk' },
    { at: 5.7, sfx: 'hic' },
    { at: 6.35, say: '草' },
    { at: 7.35, sfx: 'plop' },
    { at: 7.4, say: '小草' },
    { at: 8.37, sfx: 'boing' },
    { at: 9.12, sfx: 'gulp' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
