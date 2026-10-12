import type { Clip } from '../clip'

// 楊：小貓卡在高高的楊樹上，超級英雄飛來救牠——先擺帥氣姿勢，擺了一次又一次，小貓等到翻白眼。終於起飛，衝太快「碰」撞上樹，
// 樹葉掉下來變成「木」，太陽和英雄的披風拼成右邊，「楊」站好了。結果小貓自己輕輕一跳就下來了。楊、楊、楊樹
const clip: Clip = {
  char: '楊',
  meta: { theme: '超級英雄救貓咪', cast: '超級英雄＋小貓＋楊樹＋太陽', gags: ['擺帥姿勢擺太久', '飛太快撞樹', '小貓自己跳下來'] },
  duration: 10,
  bg: { top: '#9FD8FF', bottom: '#E6F6FF', floor: '#9CD67E', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 20, y: 15, size: 14, hidden: true, float: true },
    { id: 'tree', emoji: '🌳', x: 140, y: 62, size: 36, hidden: true },
    { id: 'cat', emoji: '🐱', x: 140, y: 40, size: 10, hidden: true, float: true },
    { id: 'hero', emoji: '🦸', x: 26, y: 68, size: 21, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'pop' },
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.15, actor: 'cat', do: 'pop' },
    { at: 0.5, actor: 'cat', do: 'shake', amount: 1, dur: 0.5 },
    { at: 0.6, actor: 'hero', do: 'enter', from: { x: -15, y: 30 }, arc: 6, dur: 0.5 },
    // 擺帥氣姿勢——一次、兩次、三次
    { at: 1.1, actor: 'hero', do: 'squash', amount: -0.2, dur: 0.35 },
    { at: 1.6, actor: 'hero', do: 'tilt', amount: -12, dur: 0.45 },
    { at: 2.1, actor: 'hero', do: 'tilt', amount: 12, dur: 0.45 },
    // 蓄力起飛，衝太快撞上樹
    { at: 2.9, actor: 'hero', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 3.2, actor: 'hero', do: 'moveTo', to: { x: 128, y: 44 }, arc: 10, dur: 0.4 },
    { at: 3.6, actor: 'tree', do: 'shake', amount: 2, dur: 0.6 },
    { at: 3.6, actor: 'cat', do: 'hop', amount: 4, dur: 0.3 },
    { at: 3.8, actor: 'hero', do: 'moveTo', to: { x: 125, y: 68 }, dur: 0.45 },
    { at: 3.8, actor: 'hero', do: 'spin', dur: 0.45 },
    { at: 4.25, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.25 },
    // 甩甩頭，披風一揮
    { at: 5.4, actor: 'hero', do: 'hop', amount: 8, dur: 0.4 },
    // 楊樹
    { at: 7.2, actor: 'tree', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 小貓自己輕輕一跳就下來了
    { at: 8.0, actor: 'cat', do: 'moveTo', to: { x: 145, y: 72 }, arc: 8, dur: 0.5 },
    { at: 8.5, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.8, actor: 'hero', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.1, actor: 'cat', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 撞下來的樹葉 → 木；太陽 → 日；披風一揮 → 下面那幾筆
    { at: 4.4, dur: 0.6, strokes: [0, 1, 2, 3], from: 'tree', style: 'drop', color: '#2F9E44' },
    { at: 5.0, dur: 0.5, strokes: [4, 5, 6, 7], from: 'sun', color: '#FF9F1C' },
    { at: 5.5, dur: 0.6, strokes: [8, 9, 10, 11, 12], from: 'hero', color: '#E03131' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'pop', actor: 'cat', emoji: '😿', dur: 0.6 },
    { at: 1.1, kind: 'burst', actor: 'hero', emoji: '✨', n: 5, dur: 0.5 },
    { at: 1.6, kind: 'bubble', actor: 'hero', emoji: '😎', dur: 0.9 },
    { at: 2.3, kind: 'pop', actor: 'cat', emoji: '😑', dur: 0.6 },
    { at: 2.9, kind: 'puff', actor: 'hero', dur: 0.5 },
    { at: 3.6, kind: 'burst', x: 130, y: 40, emoji: '💥', n: 1, dur: 0.4 },
    { at: 3.7, kind: 'burst', x: 140, y: 42, emoji: '🍃', n: 6, dur: 0.6 },
    { at: 4.3, kind: 'dizzy', actor: 'hero', dur: 0.9 },
    { at: 7.2, kind: 'burst', x: 140, y: 38, emoji: '🍃', n: 5, dur: 0.6 },
    { at: 8.7, kind: 'pop', actor: 'hero', emoji: '😳', dur: 0.7 },
    { at: 9.1, kind: 'pop', actor: 'cat', emoji: '😼', dur: 0.7 },
  ],
  camera: [
    { at: 3.6, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 7.1, dur: 0.8, do: 'punch', amount: 0.12, to: { x: 140, y: 50 } },
  ],
  cues: [
    { at: 0.6, sfx: 'whoosh' },
    { at: 1.2, say: '楊' },
    { at: 3.2, sfx: 'whoosh' },
    { at: 3.6, sfx: 'bonk' },
    { at: 4.25, sfx: 'boing' },
    { at: 6.2, say: '楊' },
    { at: 7.25, say: '楊樹' },
    { at: 8.5, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
