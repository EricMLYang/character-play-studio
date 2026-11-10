import type { Clip } from '../clip'

// 猴：豬探長舉著超大放大鏡，發現一條捲捲的猴子尾巴在鼻子前面晃——追！尾巴怎麼追都在他前面，繞圈滑倒、放大鏡砸到自己的頭，
// 滑痕捲成「犭」；他飛撲肚子著地「啪」，震散的碎片疊成「侯」。拿放大鏡順著尾巴往上看——小猴子一直坐在他的帽子上！最後尾巴又在鼻子前晃，他忍不住原地追著轉圈圈。猴、猴、猴子
const clip: Clip = {
  char: '猴',
  meta: { theme: '偵探追尾巴', cast: '豬探長＋小猴子＋猴子尾巴＋放大鏡', gags: ['怎麼追都在前面', '放大鏡砸頭', '飛撲肚子著地', '犯人一直在帽子上', '原地追著轉圈'] },
  duration: 10,
  bg: { top: '#DDF0D0', bottom: '#F6FBEF', floor: '#C9B48A', scenery: 'forest' },
  actors: [
    { id: 'pig', emoji: 'hero:pig/think', x: 26, y: 71, size: 14, flip: true },
    { id: 'monkey', emoji: '🐒', x: 26, y: 61, size: 6, hidden: true },
    { id: 'tail', emoji: '➰', x: 36, y: 64, size: 5, float: true, tint: 'sepia(1) saturate(3) brightness(.7)' },
  ],
  moves: [
    // 放大鏡裡出現一條捲捲的尾巴
    { at: 0.3, actor: 'tail', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 0.9, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 追！尾巴咻地往右溜
    { at: 1.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 1.3, actor: 'tail', do: 'moveTo', to: { x: 66, y: 64 }, dur: 0.35, ease: 'out' },
    { at: 1.35, actor: 'pig', do: 'moveTo', to: { x: 56, y: 71 }, dur: 0.4, anticipate: 3, ease: 'in' },
    // 繞一個大圈回來
    { at: 1.75, actor: 'pig', do: 'flip' },
    { at: 1.75, actor: 'tail', do: 'moveTo', to: { x: 18, y: 62 }, arc: 10, dur: 0.45 },
    { at: 1.8, actor: 'pig', do: 'moveTo', to: { x: 28, y: 71 }, arc: 8, dur: 0.45 },
    // 再轉回來——腳打結，放大鏡砸到自己的頭
    { at: 2.3, actor: 'pig', do: 'flip' },
    { at: 2.3, actor: 'tail', do: 'moveTo', to: { x: 46, y: 64 }, dur: 0.3 },
    { at: 2.35, actor: 'pig', do: 'moveTo', to: { x: 38, y: 71 }, dur: 0.3 },
    { at: 2.65, actor: 'pig', do: 'spin', times: 1, dur: 0.4 },
    { at: 3.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 3.05, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.2 },
    // 尾巴從他腳中間鑽過去
    { at: 3.2, actor: 'tail', do: 'moveTo', to: { x: 38, y: 72 }, dur: 0.15 },
    { at: 3.35, actor: 'tail', do: 'moveTo', to: { x: 48, y: 64 }, dur: 0.2 },
    // 停格、扭扭屁股、蓄力——飛撲！
    { at: 3.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 3.7, actor: 'pig', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 4.0, actor: 'pig', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 4.35, actor: 'pig', do: 'moveTo', to: { x: 94, y: 71 }, arc: 24, dur: 0.5, ease: 'in' },
    { at: 4.35, actor: 'tail', do: 'moveTo', to: { x: 104, y: 64 }, arc: 24, dur: 0.5, ease: 'in' },
    { at: 4.85, actor: 'pig', do: 'squash', amount: 0.55, dur: 0.35 },
    { at: 4.85, actor: 'tail', do: 'hop', amount: -5, dur: 0.35 },
    // 暈暈地爬起來，退到右邊
    { at: 5.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 5.2, actor: 'pig', do: 'moveTo', to: { x: 132, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 5.2, actor: 'tail', do: 'moveTo', to: { x: 140, y: 64 }, dur: 0.5, ease: 'out' },
    // 拿放大鏡順著尾巴往上看——猴子一直在帽子上！
    { at: 6.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 6.4, actor: 'tail', do: 'moveTo', to: { x: 137, y: 60 }, dur: 0.3 },
    { at: 6.7, actor: 'monkey', do: 'moveTo', to: { x: 132, y: 60 }, dur: 0.01 },
    { at: 6.75, actor: 'monkey', do: 'pop', dur: 0.3 },
    { at: 6.75, actor: 'tail', do: 'moveTo', to: { x: 136, y: 63 }, dur: 0.2 },
    { at: 6.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 6.85, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.85, actor: 'monkey', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.85, actor: 'tail', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.3, actor: 'monkey', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 7.6, actor: 'monkey', do: 'tilt', amount: -20, dur: 0.3 },
    // 回馬槍：尾巴又在鼻子前晃——忍不住原地追著轉圈圈
    { at: 8.0, actor: 'tail', do: 'moveTo', to: { x: 141, y: 66 }, dur: 0.2 },
    { at: 8.1, actor: 'tail', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 8.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 8.6, actor: 'pig', do: 'spin', times: 2, dur: 0.7 },
    { at: 8.6, actor: 'monkey', do: 'hop', amount: 8, dur: 0.7 },
    { at: 8.6, actor: 'tail', do: 'hop', amount: 8, dur: 0.7 },
    { at: 9.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
  ],
  builds: [
    // 繞圈的滑痕捲成「犭」；飛撲震散的碎片疊成「侯」
    { at: 1.8, dur: 0.7, strokes: [0, 1, 2], from: 'pig', color: '#1C7ED6' },
    { at: 4.9, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: 'pig', color: '#1971C2' },
  ],
  glyph: [{ at: 5.8, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'bubble', actor: 'pig', emoji: '🔍', dur: 0.9 },
    { at: 0.95, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 1.4, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 2.0, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 3.0, kind: 'burst', actor: 'pig', emoji: '🔍', n: 1, dur: 0.4 },
    { at: 3.1, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    { at: 4.85, kind: 'burst', actor: 'pig', emoji: '⭐', n: 6, dur: 0.6 },
    { at: 4.9, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 7.0, kind: 'pop', actor: 'monkey', emoji: '👋', dx: 6, dur: 0.6 },
    { at: 8.15, kind: 'pop', actor: 'pig', emoji: '❗', dx: -8, dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'monkey', emoji: '😆', dx: 6, dur: 0.6 },
    { at: 9.3, kind: 'dizzy', actor: 'pig', dur: 0.7 },
  ],
  camera: [
    { at: 0.1, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 32, y: 60 } },
    { at: 1.3, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.85, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 94, y: 66 } },
  ],
  cues: [
    { at: 0.95, say: '猴' },
    { at: 1.35, sfx: 'whoosh' },
    { at: 1.8, sfx: 'slide' },
    { at: 3.0, sfx: 'boing' },
    { at: 4.35, sfx: 'whoosh' },
    { at: 4.85, sfx: 'splash' },
    { at: 5.8, say: '猴' },
    { at: 6.8, say: '猴子' },
    { at: 8.6, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
