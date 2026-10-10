import type { Clip } from '../clip'

// 根：倉鼠在公園野餐，大樹的樹根偷偷從地底鑽過來，先偷飯糰、再偷草莓，倉鼠一回頭什麼都不見了。第三次被抓包，
// 倉鼠跟樹根拔河搶籃子，結果連人帶籃被拖到樹下，大樹抖成「根」。大樹丟一顆蘋果賠罪——樹根又把蘋果偷走了。根、根、樹根
const clip: Clip = {
  char: '根',
  meta: { theme: '公園野餐', cast: '倉鼠＋偷吃的樹根＋大樹', gags: ['一回頭東西就不見', '跟樹根拔河', '被拖到樹下', '賠罪的蘋果又被偷'] },
  duration: 10,
  bg: { top: '#E8F4FF', bottom: '#CFE6FA', floor: '#9CCB6B', scenery: 'city' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 18, y: 66, size: 26 },
    { id: 'root', emoji: '🫚', x: 108, y: 74.5, size: 10, float: true, hidden: true },
    { id: 'basket', emoji: '🧺', x: 124, y: 72.3, size: 11.2, hidden: true },
    { id: 'rice', emoji: '🍙', x: 112, y: 73.2, size: 8.8, hidden: true },
    { id: 'berry', emoji: '🍓', x: 100, y: 73.9, size: 7.5, hidden: true },
    { id: 'apple', emoji: '🍎', x: 22, y: 56, size: 7.5, hidden: true, float: true },
    { id: 'ham', emoji: '🐹', x: 138, y: 70.2, size: 16.2, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'ham', do: 'pop' },
    { at: 0.1, actor: 'basket', do: 'pop' },
    { at: 0.21, actor: 'rice', do: 'pop' },
    { at: 0.31, actor: 'berry', do: 'pop' },
    // 第一次：偷飯糰
    { at: 1.04, actor: 'root', do: 'enter', from: { x: 28, y: 77 }, dur: 0.5 },
    { at: 1.56, actor: 'rice', do: 'hop', amount: 3, dur: 0.2 },
    { at: 1.77, actor: 'root', do: 'moveTo', to: { x: 28, y: 77 }, dur: 0.45 },
    { at: 1.77, actor: 'rice', do: 'moveTo', to: { x: 28, y: 75 }, dur: 0.45 },
    { at: 2.24, actor: 'root', do: 'vanish', dur: 0.15 },
    { at: 2.24, actor: 'rice', do: 'vanish', dur: 0.15 },
    { at: 2.39, actor: 'ham', do: 'shake', amount: 1, dur: 0.4 },
    // 第二次：偷草莓
    { at: 2.7, actor: 'root', do: 'moveTo', to: { x: 96, y: 73.9 }, dur: 0.01 },
    { at: 2.72, actor: 'root', do: 'enter', from: { x: 28, y: 77 }, dur: 0.43 },
    { at: 3.17, actor: 'berry', do: 'hop', amount: 3, dur: 0.2 },
    { at: 3.28, actor: 'root', do: 'moveTo', to: { x: 28, y: 77 }, dur: 0.45 },
    { at: 3.28, actor: 'berry', do: 'moveTo', to: { x: 28, y: 75 }, dur: 0.45 },
    { at: 3.74, actor: 'root', do: 'vanish', dur: 0.15 },
    { at: 3.74, actor: 'berry', do: 'vanish', dur: 0.15 },
    // 第三次：搶籃子，拔河
    { at: 3.95, actor: 'root', do: 'moveTo', to: { x: 116, y: 73.9 }, dur: 0.01 },
    { at: 3.97, actor: 'root', do: 'enter', from: { x: 28, y: 77 }, dur: 0.38 },
    { at: 4.37, actor: 'basket', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.37, actor: 'ham', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 4.37, actor: 'root', do: 'shake', amount: 1, dur: 0.4 },
    // 一拉：連人帶籃拖到樹下
    { at: 4.78, actor: 'root', do: 'moveTo', to: { x: 30, y: 73.9 }, dur: 0.4 },
    { at: 4.78, actor: 'basket', do: 'moveTo', to: { x: 30, y: 62 }, dur: 0.45, arc: 18 },
    { at: 4.78, actor: 'ham', do: 'moveTo', to: { x: 42, y: 70.2 }, dur: 0.55, arc: 24 },
    { at: 4.78, actor: 'ham', do: 'spin', dur: 0.55 },
    { at: 5.2, actor: 'tree', do: 'shake', amount: 2, dur: 0.6 },
    { at: 5.25, actor: 'basket', do: 'vanish', dur: 0.15 },
    { at: 5.35, actor: 'ham', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.6, actor: 'root', do: 'vanish', dur: 0.2 },
    // 樹根探出頭揮手
    { at: 6.85, actor: 'root', do: 'pop' },
    { at: 6.85, actor: 'root', do: 'hop', amount: 4, dur: 0.4 },
    { at: 7.29, actor: 'root', do: 'tilt', amount: 20, dur: 0.4 },
    // 大樹丟蘋果賠罪
    { at: 7.94, actor: 'tree', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 7.94, actor: 'apple', do: 'pop' },
    { at: 8.03, actor: 'apple', do: 'moveTo', to: { x: 50, y: 73 }, dur: 0.45, arc: 8 },
    { at: 8.48, actor: 'ham', do: 'hop', amount: 4, dur: 0.35 },
    // 又被偷走
    { at: 8.74, actor: 'root', do: 'moveTo', to: { x: 47, y: 73.9 }, dur: 0.25 },
    { at: 9.01, actor: 'root', do: 'moveTo', to: { x: 26, y: 77 }, dur: 0.3 },
    { at: 9.01, actor: 'apple', do: 'moveTo', to: { x: 26, y: 75 }, dur: 0.3 },
    { at: 9.28, actor: 'root', do: 'vanish', dur: 0.15 },
    { at: 9.28, actor: 'apple', do: 'vanish', dur: 0.15 },
    { at: 9.28, actor: 'tree', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
  ],
  builds: [
    // 大樹一抖 → 木；縮回去的樹根 → 艮
    { at: 5.2, dur: 0.7, strokes: [0, 1, 2, 3], from: 'tree', color: '#3F9B4A' },
    { at: 5.55, dur: 0.7, strokes: [4, 5, 6, 7, 8, 9], from: 'root', color: '#9A6232' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.52, kind: 'bubble', actor: 'ham', emoji: '😋', dur: 0.6 },
    { at: 2.39, kind: 'pop', actor: 'ham', emoji: '❓', dur: 0.5 },
    { at: 3.43, kind: 'pop', actor: 'ham', emoji: '❗', dur: 0.4 },
    { at: 3.74, kind: 'bubble', actor: 'ham', emoji: '😠', dur: 0.5 },
    { at: 4.42, kind: 'sweat', actor: 'ham' },
    { at: 5.2, kind: 'burst', actor: 'tree', emoji: '🍃', n: 6, dur: 0.6 },
    { at: 5.5, kind: 'dizzy', actor: 'ham', dur: 1.0 },
    { at: 7.24, kind: 'pop', actor: 'root', emoji: '👋', dur: 0.7 },
    { at: 7.49, kind: 'pop', actor: 'ham', emoji: '❗', dur: 0.4 },
    { at: 8.43, kind: 'pop', actor: 'ham', emoji: '💕', dur: 0.5 },
    { at: 9.33, kind: 'bubble', actor: 'ham', emoji: '😑', dur: 0.75 },
  ],
  camera: [
    { at: 4.37, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 120, y: 66 } },
    { at: 5.2, dur: 0.4, do: 'shake', amount: 1.8 },
  ],
  cues: [
    { at: 1.04, sfx: 'slide' },
    { at: 1.61, say: '根' },
    { at: 2.7, sfx: 'slide' },
    { at: 3.43, sfx: 'blip' },
    { at: 4.37, sfx: 'rumble' },
    { at: 4.78, sfx: 'whoosh' },
    { at: 5.35, sfx: 'plop' },
    { at: 6.3, say: '根' },
    { at: 6.85, sfx: 'poof' },
    { at: 7.4, say: '樹根' },
    { at: 8.03, sfx: 'whoosh' },
    { at: 9.01, sfx: 'slide' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
