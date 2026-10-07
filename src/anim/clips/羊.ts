import type { Clip } from '../clip'

// 羊：豬偵探拿放大鏡循著腳印找走失的羊，羊其實一直躲在他背後學他走路；他一回頭羊就躲到他身後。
// 終於面對面，兩個都嚇飛。羊一甩把毛甩光變成「羊」，自己冷到發抖。最後偵探一回頭——背後又多了一隻。羊、羊、羊毛
const clip: Clip = {
  char: '羊',
  meta: { theme: '偵探辦案', cast: '豬偵探＋羊', gags: ['其實一直在你後面', '模仿', '甩毛變光溜溜', '回馬槍多一隻'] },
  duration: 10,
  bg: { top: '#E8F0FF', bottom: '#D4E1F9', floor: '#C6E5B2', scenery: 'hills' },
  actors: [
    { id: 'p1', emoji: '👣', x: 98, y: 75.5, size: 4, hidden: true, float: true },
    { id: 'p2', emoji: '👣', x: 110, y: 75.5, size: 4, hidden: true, float: true },
    { id: 'p3', emoji: '👣', x: 122, y: 75.5, size: 4, hidden: true, float: true },
    { id: 'sheep', emoji: '🐑', x: 46, y: 72, size: 12, hidden: true },
    { id: 'sheep2', emoji: '🐑', x: 146, y: 72, size: 12, hidden: true },
    { id: 'pig', emoji: '🐷', x: 64, y: 71, size: 13, hidden: true },
    { id: 'glass', emoji: '🔍', x: 72, y: 68, size: 6, hidden: true, float: true },
    { id: 'wool', emoji: '🧶', x: 40, y: 72, size: 7, hidden: true },
  ],
  moves: [
    { at: 0.15, actor: 'p1', do: 'pop' }, { at: 0.3, actor: 'p2', do: 'pop' }, { at: 0.45, actor: 'p3', do: 'pop' },
    // 躡手躡腳辦案中
    { at: 0, actor: 'pig', do: 'enter', from: { x: -14, y: 71 }, dur: 0.8 },
    { at: 0, actor: 'pig', do: 'bounce', dur: 0.8, times: 4, amount: 1.5 },
    { at: 0, actor: 'glass', do: 'enter', from: { x: -6, y: 68 }, dur: 0.8 },
    { at: 1.0, actor: 'glass', do: 'shake', dur: 0.6, amount: 1.2 },
    // 羊偷偷跟在後面
    { at: 1.5, actor: 'sheep', do: 'enter', from: { x: -12, y: 72 }, dur: 0.6 },
    { at: 1.5, actor: 'sheep', do: 'bounce', dur: 0.6, times: 3, amount: 1 },
    { at: 2.2, actor: 'pig', do: 'moveTo', to: { x: 80, y: 71 }, dur: 0.6 },
    { at: 2.2, actor: 'pig', do: 'bounce', dur: 0.6, times: 3, amount: 1.5 },
    { at: 2.2, actor: 'glass', do: 'moveTo', to: { x: 88, y: 68 }, dur: 0.6 },
    { at: 2.25, actor: 'sheep', do: 'moveTo', to: { x: 62, y: 72 }, dur: 0.6 },
    { at: 2.25, actor: 'sheep', do: 'bounce', dur: 0.6, times: 3, amount: 1.5 },
    // 偵探回頭——羊秒躲到他身後
    { at: 3.1, actor: 'glass', do: 'moveTo', to: { x: 72, y: 68 }, dur: 0.12 },
    { at: 3.1, actor: 'pig', do: 'hop', dur: 0.2, amount: 2 },
    { at: 3.1, actor: 'sheep', do: 'moveTo', to: { x: 87, y: 72 }, dur: 0.12 },
    { at: 3.9, actor: 'glass', do: 'moveTo', to: { x: 88, y: 68 }, dur: 0.12 },
    { at: 3.9, actor: 'pig', do: 'hop', dur: 0.2, amount: 2 },
    { at: 3.95, actor: 'sheep', do: 'moveTo', to: { x: 62, y: 72 }, dur: 0.2 },
    { at: 4.15, actor: 'sheep', do: 'bounce', dur: 0.4, times: 3, amount: 1 },
    // 突然整個轉過來：面對面！
    { at: 4.55, actor: 'glass', do: 'moveTo', to: { x: 72, y: 68 }, dur: 0.08 },
    { at: 4.6, actor: 'pig', do: 'hop', dur: 0.3, amount: 10 },
    { at: 4.6, actor: 'sheep', do: 'hop', dur: 0.3, amount: 10 },
    { at: 4.9, actor: 'pig', do: 'moveTo', to: { x: 132, y: 71 }, dur: 0.45, arc: 16 },
    { at: 4.9, actor: 'pig', do: 'spin', dur: 0.45 },
    { at: 4.9, actor: 'glass', do: 'moveTo', to: { x: 123, y: 68 }, dur: 0.45, arc: 16 },
    { at: 4.9, actor: 'sheep', do: 'moveTo', to: { x: 26, y: 72 }, dur: 0.45, arc: 16 },
    { at: 4.9, actor: 'sheep', do: 'spin', dur: 0.45 },
    { at: 4.9, actor: 'p1', do: 'vanish' }, { at: 4.95, actor: 'p2', do: 'vanish' }, { at: 5.0, actor: 'p3', do: 'vanish' },
    // 一甩，毛全甩光
    { at: 5.4, actor: 'sheep', do: 'shake', dur: 0.5, amount: 1.8 },
    { at: 5.75, actor: 'sheep', do: 'swap', emoji: '🐐' },
    { at: 6.2, actor: 'sheep', do: 'shake', dur: 1.0, amount: 0.6 },
    // 毛線球滾出來，偵探用放大鏡看：破案！
    { at: 7.1, actor: 'wool', do: 'enter', from: { x: 26, y: 72 }, dur: 0.5 },
    { at: 7.1, actor: 'wool', do: 'spin', dur: 0.5 },
    { at: 7.6, actor: 'glass', do: 'tilt', amount: 15, dur: 0.4 },
    // 偵探再回頭——背後又多了一隻
    { at: 8.5, actor: 'sheep2', do: 'enter', from: { x: 175, y: 72 }, dur: 0.4 },
    { at: 8.5, actor: 'sheep2', do: 'bounce', dur: 0.4, times: 3, amount: 1 },
    { at: 8.95, actor: 'glass', do: 'moveTo', to: { x: 141, y: 68 }, dur: 0.1 },
    { at: 9.1, actor: 'pig', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 9.1, actor: 'glass', do: 'moveTo', to: { x: 126, y: 74 }, dur: 0.25 },
    { at: 9.3, actor: 'sheep2', do: 'bounce', dur: 0.5, times: 3, amount: 1.5 },
  ],
  builds: [
    // 兩支羊角 → 上面兩點；甩飛的毛 → 三橫一豎
    { at: 5.5, dur: 0.4, strokes: [0, 1], from: 'sheep', color: '#C47F2C' },
    { at: 5.75, dur: 0.8, strokes: [2, 3, 4, 5], from: 'sheep', color: '#6A7BD6' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'pig', emoji: '🐑', dur: 1.0 },
    { at: 3.3, kind: 'bubble', actor: 'pig', emoji: '❓', dur: 0.6 },
    { at: 4.15, kind: 'pop', actor: 'sheep', emoji: '😆', dur: 0.4 },
    { at: 4.6, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.4 },
    { at: 4.6, kind: 'pop', actor: 'sheep', emoji: '❗', dur: 0.4 },
    { at: 5.45, kind: 'burst', actor: 'sheep', emoji: '☁️', n: 6, dur: 0.6 },
    { at: 6.2, kind: 'bubble', actor: 'sheep', emoji: '🥶', dur: 0.9 },
    { at: 7.8, kind: 'pop', actor: 'pig', emoji: '💡', dur: 0.5 },
    { at: 8.95, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.3 },
    { at: 9.3, kind: 'pop', actor: 'sheep2', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 4.55, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 72, y: 64 } },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.1, say: '羊' },
    { at: 3.1, sfx: 'whoosh' }, { at: 3.9, sfx: 'whoosh' },
    { at: 4.6, sfx: 'slide' },
    { at: 5.4, sfx: 'bubble' },
    { at: 6.55, say: '羊' },
    { at: 7.5, say: '羊毛' },
    { at: 7.8, sfx: 'blip' },
    { at: 9.1, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
