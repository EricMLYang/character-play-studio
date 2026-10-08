import type { Clip } from '../clip'

// 穿：企鵝自己穿衣服：上衣套到腳上、襪子套在翅膀上、褲子戴在頭上，得意地走兩步就被腳上的上衣絆倒，衣服全飛出去。
// 最後總算把鞋子穿對了——結果北極熊走進來，頭上也戴著褲子，企鵝馬上把褲子戴回頭上：原來這是流行！穿、穿、穿鞋
const clip: Clip = {
  char: '穿',
  meta: { theme: '自己穿衣服', cast: '企鵝＋北極熊＋一籃衣服', gags: ['全部穿錯地方', '得意走路被絆倒', '旁人也穿錯（模仿）'] },
  duration: 10,
  bg: { top: '#E6F2FF', bottom: '#C9E2F8', floor: '#F2F8FF', scenery: 'snow' },
  actors: [
    { id: 'basket', emoji: '🧺', x: 12, y: 72.8, size: 10, hidden: true },
    { id: 'peng', emoji: '🐧', x: 30, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'shirt', emoji: '👕', x: 12, y: 68, size: 7, hidden: true, float: true },
    { id: 'sockL', emoji: '🧦', x: 12, y: 68, size: 5, hidden: true, float: true },
    { id: 'sockR', emoji: '🧦', x: 12, y: 68, size: 5, hidden: true, float: true, flip: true },
    { id: 'pants', emoji: '👖', x: 12, y: 68, size: 8, hidden: true, float: true },
    { id: 'shoe1', emoji: '👟', x: 12, y: 68, size: 5.5, hidden: true, float: true, flip: true },
    { id: 'shoe2', emoji: '👟', x: 12, y: 68, size: 5.5, hidden: true, float: true, flip: true },
    { id: 'bear', emoji: '🐻‍❄️', x: 136, y: 70.7, size: 15, hidden: true },
    { id: 'bearPants', emoji: '👖', x: 136, y: 60.5, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'basket', do: 'pop' },
    { at: 0.15, actor: 'peng', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.6 },
    // 上衣套到腳上
    { at: 1.0, actor: 'shirt', do: 'pop', dur: 0.15 },
    { at: 1.05, actor: 'shirt', do: 'moveTo', to: { x: 30, y: 74 }, arc: 14, dur: 0.4 },
    { at: 1.45, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.25 },
    // 襪子套在翅膀上
    { at: 2.3, actor: 'sockL', do: 'pop', dur: 0.15 },
    { at: 2.3, actor: 'sockL', do: 'moveTo', to: { x: 23, y: 69 }, arc: 12, dur: 0.4 },
    { at: 2.4, actor: 'sockR', do: 'pop', dur: 0.15 },
    { at: 2.4, actor: 'sockR', do: 'moveTo', to: { x: 37, y: 69 }, arc: 16, dur: 0.45 },
    { at: 2.95, actor: 'peng', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 2.95, actor: 'sockL', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 2.95, actor: 'sockR', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 2.95, actor: 'shirt', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 褲子戴在頭上
    { at: 3.3, actor: 'pants', do: 'pop', dur: 0.15 },
    { at: 3.3, actor: 'pants', do: 'moveTo', to: { x: 30, y: 60 }, arc: 14, dur: 0.45 },
    // 得意走兩步……被腳上的上衣絆倒
    { at: 3.9, actor: 'peng', do: 'moveTo', to: { x: 40, y: 70.7 }, dur: 0.4 },
    { at: 3.9, actor: 'shirt', do: 'moveTo', to: { x: 40, y: 74 }, dur: 0.4 },
    { at: 3.9, actor: 'sockL', do: 'moveTo', to: { x: 33, y: 69 }, dur: 0.4 },
    { at: 3.9, actor: 'sockR', do: 'moveTo', to: { x: 47, y: 69 }, dur: 0.4 },
    { at: 3.9, actor: 'pants', do: 'moveTo', to: { x: 40, y: 60 }, dur: 0.4 },
    { at: 4.3, actor: 'peng', do: 'rotateTo', amount: 85, dur: 0.3 },
    { at: 4.35, actor: 'shirt', do: 'vanish', dur: 0.2 },
    { at: 4.35, actor: 'sockL', do: 'vanish', dur: 0.2 },
    { at: 4.35, actor: 'sockR', do: 'vanish', dur: 0.2 },
    { at: 4.35, actor: 'pants', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'basket', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 5.1, actor: 'peng', do: 'rotateTo', amount: -85, dur: 0.3 },
    { at: 5.4, actor: 'peng', do: 'moveTo', to: { x: 30, y: 70.7 }, dur: 0.4 },
    // 鞋子總算穿對了
    { at: 6.5, actor: 'shoe1', do: 'pop', dur: 0.15 },
    { at: 6.5, actor: 'shoe1', do: 'moveTo', to: { x: 26, y: 75.2 }, arc: 12, dur: 0.45 },
    { at: 6.6, actor: 'shoe2', do: 'pop', dur: 0.15 },
    { at: 6.6, actor: 'shoe2', do: 'moveTo', to: { x: 34, y: 75.2 }, arc: 14, dur: 0.45 },
    { at: 7.1, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.25 },
    // 北極熊也把褲子戴頭上
    { at: 8.0, actor: 'bear', do: 'enter', from: { x: 178, y: 70.7 }, dur: 0.7 },
    { at: 8.0, actor: 'bearPants', do: 'enter', from: { x: 178, y: 60.5 }, dur: 0.7 },
    { at: 8.75, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.75, actor: 'bearPants', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 9.0, actor: 'pants', do: 'moveTo', to: { x: 30, y: 60 }, dur: 0.01 },
    { at: 9.05, actor: 'pants', do: 'pop', dur: 0.3 },
    { at: 9.35, actor: 'peng', do: 'squash', amount: 0.15, dur: 0.25 },
  ],
  builds: [
    // 飛出去的衣服 → 穴；籃子裡剩下的衣服 → 牙
    { at: 4.4, dur: 0.8, strokes: [0, 1, 2, 3, 4], from: 'peng', color: '#E0533D' },
    { at: 5.05, dur: 0.9, strokes: [5, 6, 7, 8], from: 'basket', color: '#2E6FD8' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'peng', emoji: '👕', dur: 0.5 },
    { at: 1.8, kind: 'pop', actor: 'peng', emoji: '❓', dur: 0.5 },
    { at: 3.75, kind: 'bubble', actor: 'peng', emoji: '😎', dur: 0.5, dy: -6 },
    { at: 4.35, kind: 'burst', actor: 'peng', emoji: '👕', n: 5, dur: 0.6 },
    { at: 4.6, kind: 'puff', actor: 'peng' },
    { at: 4.7, kind: 'dizzy', actor: 'peng', dur: 0.6 },
    { at: 7.2, kind: 'bubble', actor: 'peng', emoji: '🥳', dur: 0.7 },
    { at: 8.5, kind: 'pop', actor: 'peng', emoji: '❗', dur: 0.5 },
    { at: 9.3, kind: 'bubble', actor: 'peng', emoji: '😎', dur: 0.6, dy: -6 },
  ],
  camera: [
    { at: 4.3, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 40, y: 64 } },
    { at: 4.5, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.0, sfx: 'whoosh' },
    { at: 1.45, say: '穿' },
    { at: 2.3, sfx: 'whoosh' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 4.3, sfx: 'slide' },
    { at: 4.55, sfx: 'bonk' },
    { at: 6.0, say: '穿' },
    { at: 6.5, sfx: 'whoosh' },
    { at: 7.1, say: '穿鞋' },
    { at: 9.05, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
