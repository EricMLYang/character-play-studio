import type { Clip } from '../clip'

// 草：割草機一發動就失控，割了一叢草就開始轉圈、跳起來，把旁邊的小花割掉了；山羊跳過割草機，一口一叢把草吃光，
// 割草機自己冒煙爆掉，割下來的草屑和山羊打的飽嗝變成「草」。地上冒出一株小草，山羊想吃，小草一下子長成大樹——山羊照樣啃光。草、草、小草
const clip: Clip = {
  char: '草',
  meta: { theme: '割草機失控', cast: '割草機＋山羊', gags: ['機器失控', '割錯東西', '山羊比機器厲害', '打飽嗝', '小草變大樹照樣啃'] },
  duration: 10,
  bg: { top: '#E3F4FF', bottom: '#C4E5F7', floor: '#6DB548', scenery: 'city' },
  actors: [
    { id: 'g1', emoji: '🌿', x: 62, y: 73.2, size: 9, hidden: true },
    { id: 'g2', emoji: '🌿', x: 82, y: 73.2, size: 9, hidden: true },
    { id: 'g3', emoji: '🌿', x: 100, y: 73.2, size: 9, hidden: true },
    { id: 'flower', emoji: '🌷', x: 120, y: 73.6, size: 8, hidden: true },
    { id: 'sprout', emoji: '🌱', x: 38, y: 74, size: 7, hidden: true },
    { id: 'mower', emoji: '🚜', x: 20, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'goat', emoji: '🐐', x: 142, y: 71.5, size: 13, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'mower', do: 'pop' },
    { at: 0.1, actor: 'g1', do: 'pop' }, { at: 0.2, actor: 'g2', do: 'pop' }, { at: 0.3, actor: 'g3', do: 'pop' },
    { at: 0.4, actor: 'flower', do: 'pop' },
    { at: 0.3, actor: 'goat', do: 'enter', from: { x: 175, y: 71.5 }, dur: 0.6 },
    // 發動……衝出去割第一叢
    { at: 0.8, actor: 'mower', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.2, actor: 'mower', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 1.3, actor: 'mower', do: 'moveTo', to: { x: 62, y: 71.1 }, dur: 0.35 },
    { at: 1.6, actor: 'g1', do: 'vanish', dur: 0.15 },
    // 失控：轉圈、跳起來，割到小花
    { at: 2.0, actor: 'mower', do: 'spin', times: 1, dur: 0.4 },
    { at: 2.4, actor: 'mower', do: 'moveTo', to: { x: 124, y: 71.1 }, arc: 14, dur: 0.5 },
    { at: 2.9, actor: 'mower', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.9, actor: 'flower', do: 'vanish', dur: 0.15 },
    // 山羊跳過割草機，開始吃草
    { at: 2.95, actor: 'goat', do: 'moveTo', to: { x: 108, y: 71.5 }, arc: 16, dur: 0.5 },
    { at: 3.45, actor: 'goat', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 3.5, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 }, { at: 3.7, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 3.5, actor: 'g3', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    { at: 3.75, actor: 'g3', do: 'vanish', dur: 0.15 },
    { at: 3.9, actor: 'goat', do: 'moveTo', to: { x: 91, y: 71.5 }, dur: 0.2 },
    { at: 4.1, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 }, { at: 4.3, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 4.1, actor: 'g2', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    { at: 4.35, actor: 'g2', do: 'vanish', dur: 0.15 },
    { at: 4.5, actor: 'goat', do: 'moveTo', to: { x: 24, y: 71.5 }, dur: 0.6 },
    { at: 4.5, actor: 'goat', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    // 割草機還在轉，衝到旁邊爆掉
    { at: 3.4, actor: 'mower', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.0, actor: 'mower', do: 'moveTo', to: { x: 142, y: 71.1 }, dur: 0.25 },
    { at: 4.3, actor: 'mower', do: 'shake', amount: 1.5, dur: 0.5 },
    // 山羊打飽嗝
    { at: 5.2, actor: 'goat', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 5.4, actor: 'goat', do: 'hop', amount: 3, dur: 0.25 },
    // 小草冒出來
    { at: 6.6, actor: 'goat', do: 'flip' },
    { at: 7.0, actor: 'sprout', do: 'pop' },
    // 想吃——長成大樹
    { at: 8.0, actor: 'goat', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 8.15, actor: 'sprout', do: 'swap', emoji: '🌳' },
    { at: 8.15, actor: 'sprout', do: 'scaleTo', amount: 2.6, dur: 0.4 },
    { at: 8.35, actor: 'goat', do: 'moveTo', to: { x: 17, y: 71.5 }, dur: 0.25 },
    { at: 8.35, actor: 'goat', do: 'hop', amount: 5, dur: 0.25 },
    // 照樣啃光
    { at: 8.9, actor: 'goat', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.2 },
    { at: 9.0, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 9.2, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 9.4, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: 9.0, actor: 'sprout', do: 'scaleTo', amount: 0.35, dur: 0.6 },
  ],
  builds: [
    // 割草機噴出的草屑 → 早；山羊的飽嗝 → 艹
    { at: 4.5, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8], from: 'mower', color: '#C27A2C' },
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2], from: 'goat', color: '#2E9E4F' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'puff', actor: 'mower' },
    { at: 1.3, kind: 'puff', actor: 'mower' },
    { at: 1.6, kind: 'burst', actor: 'g1', emoji: '🍃', n: 6, dur: 0.5 },
    { at: 2.0, kind: 'sweat', actor: 'mower' },
    { at: 2.5, kind: 'pop', actor: 'goat', emoji: '😱', dur: 0.4 },
    { at: 2.9, kind: 'burst', actor: 'flower', emoji: '🌸', n: 6, dur: 0.5 },
    { at: 3.5, kind: 'pop', actor: 'goat', emoji: '😋', dur: 0.4 },
    { at: 4.3, kind: 'burst', actor: 'mower', dur: 0.4 },
    { at: 4.5, kind: 'stink', actor: 'mower', dur: 2.5, dy: -4 },
    { at: 5.4, kind: 'burst', actor: 'goat', emoji: '🌿', n: 5, dur: 0.5 },
    { at: 7.4, kind: 'bubble', actor: 'goat', emoji: '😋', dur: 0.5 },
    { at: 8.4, kind: 'pop', actor: 'goat', emoji: '😱', dur: 0.4 },
    { at: 9.0, kind: 'burst', actor: 'sprout', emoji: '🍃', n: 6, dur: 0.6 },
    { at: 9.5, kind: 'pop', actor: 'goat', emoji: '😋', dur: 0.5 },
    { at: 8.8, kind: 'dizzy', actor: 'mower', dur: 1.2 },
  ],
  camera: [
    { at: 2.9, dur: 0.5, do: 'shake', amount: 1.5 },
    { at: 8.15, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 30, y: 62 } },
  ],
  cues: [
    { at: 0.8, sfx: 'rumble' },
    { at: 1.3, sfx: 'whoosh' },
    { at: 1.7, say: '草' },
    { at: 2.4, sfx: 'boing' },
    { at: 2.9, sfx: 'crack' },
    { at: 3.5, sfx: 'gulp' },
    { at: 4.1, sfx: 'gulp' },
    { at: 4.3, sfx: 'bonk' },
    { at: 5.4, sfx: 'hic' },
    { at: 6.05, say: '草' },
    { at: 7.0, sfx: 'plop' },
    { at: 7.05, say: '小草' },
    { at: 8.15, sfx: 'boing' },
    { at: 9.0, sfx: 'gulp' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
