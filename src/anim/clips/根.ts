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
    { id: 'root', emoji: '🫚', x: 108, y: 74.5, size: 8, float: true, hidden: true },
    { id: 'basket', emoji: '🧺', x: 124, y: 73.2, size: 9, hidden: true },
    { id: 'rice', emoji: '🍙', x: 112, y: 74, size: 7, hidden: true },
    { id: 'berry', emoji: '🍓', x: 100, y: 74.5, size: 6, hidden: true },
    { id: 'apple', emoji: '🍎', x: 22, y: 56, size: 6, hidden: true, float: true },
    { id: 'ham', emoji: '🐹', x: 138, y: 71.5, size: 13, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'ham', do: 'pop' },
    { at: 0.1, actor: 'basket', do: 'pop' },
    { at: 0.2, actor: 'rice', do: 'pop' },
    { at: 0.3, actor: 'berry', do: 'pop' },
    // 第一次：偷飯糰
    { at: 1.0, actor: 'root', do: 'enter', from: { x: 28, y: 77 }, dur: 0.5 },
    { at: 1.5, actor: 'rice', do: 'hop', amount: 3, dur: 0.2 },
    { at: 1.7, actor: 'root', do: 'moveTo', to: { x: 28, y: 77 }, dur: 0.45 },
    { at: 1.7, actor: 'rice', do: 'moveTo', to: { x: 28, y: 75 }, dur: 0.45 },
    { at: 2.15, actor: 'root', do: 'vanish', dur: 0.15 },
    { at: 2.15, actor: 'rice', do: 'vanish', dur: 0.15 },
    { at: 2.3, actor: 'ham', do: 'shake', amount: 1, dur: 0.4 },
    // 第二次：偷草莓
    { at: 2.6, actor: 'root', do: 'moveTo', to: { x: 96, y: 74.5 }, dur: 0.01 },
    { at: 2.62, actor: 'root', do: 'enter', from: { x: 28, y: 77 }, dur: 0.43 },
    { at: 3.05, actor: 'berry', do: 'hop', amount: 3, dur: 0.2 },
    { at: 3.15, actor: 'root', do: 'moveTo', to: { x: 28, y: 77 }, dur: 0.45 },
    { at: 3.15, actor: 'berry', do: 'moveTo', to: { x: 28, y: 75 }, dur: 0.45 },
    { at: 3.6, actor: 'root', do: 'vanish', dur: 0.15 },
    { at: 3.6, actor: 'berry', do: 'vanish', dur: 0.15 },
    // 第三次：搶籃子，拔河
    { at: 3.8, actor: 'root', do: 'moveTo', to: { x: 116, y: 74.5 }, dur: 0.01 },
    { at: 3.82, actor: 'root', do: 'enter', from: { x: 28, y: 77 }, dur: 0.38 },
    { at: 4.2, actor: 'basket', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.2, actor: 'ham', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 4.2, actor: 'root', do: 'shake', amount: 1, dur: 0.4 },
    // 一拉：連人帶籃拖到樹下
    { at: 4.6, actor: 'root', do: 'moveTo', to: { x: 30, y: 74.5 }, dur: 0.4 },
    { at: 4.6, actor: 'basket', do: 'moveTo', to: { x: 30, y: 62 }, dur: 0.45, arc: 18 },
    { at: 4.6, actor: 'ham', do: 'moveTo', to: { x: 42, y: 71.5 }, dur: 0.55, arc: 24 },
    { at: 4.6, actor: 'ham', do: 'spin', dur: 0.55 },
    { at: 5.0, actor: 'tree', do: 'shake', amount: 2, dur: 0.6 },
    { at: 5.05, actor: 'basket', do: 'vanish', dur: 0.15 },
    { at: 5.15, actor: 'ham', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.4, actor: 'root', do: 'vanish', dur: 0.2 },
    // 樹根探出頭揮手
    { at: 6.6, actor: 'root', do: 'pop' },
    { at: 6.6, actor: 'root', do: 'hop', amount: 4, dur: 0.4 },
    { at: 7.0, actor: 'root', do: 'tilt', amount: 20, dur: 0.4 },
    // 大樹丟蘋果賠罪
    { at: 7.7, actor: 'tree', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 7.7, actor: 'apple', do: 'pop' },
    { at: 7.8, actor: 'apple', do: 'moveTo', to: { x: 50, y: 73 }, dur: 0.45, arc: 8 },
    { at: 8.3, actor: 'ham', do: 'hop', amount: 4, dur: 0.35 },
    // 又被偷走
    { at: 8.6, actor: 'root', do: 'moveTo', to: { x: 47, y: 74.5 }, dur: 0.25 },
    { at: 8.9, actor: 'root', do: 'moveTo', to: { x: 26, y: 77 }, dur: 0.3 },
    { at: 8.9, actor: 'apple', do: 'moveTo', to: { x: 26, y: 75 }, dur: 0.3 },
    { at: 9.2, actor: 'root', do: 'vanish', dur: 0.15 },
    { at: 9.2, actor: 'apple', do: 'vanish', dur: 0.15 },
    { at: 9.2, actor: 'tree', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
  ],
  builds: [
    // 大樹一抖 → 木；縮回去的樹根 → 艮
    { at: 5.0, dur: 0.7, strokes: [0, 1, 2, 3], from: 'tree', color: '#3F9B4A' },
    { at: 5.35, dur: 0.7, strokes: [4, 5, 6, 7, 8, 9], from: 'root', color: '#9A6232' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'ham', emoji: '😋', dur: 0.6 },
    { at: 2.3, kind: 'pop', actor: 'ham', emoji: '❓', dur: 0.5 },
    { at: 3.3, kind: 'pop', actor: 'ham', emoji: '❗', dur: 0.4 },
    { at: 3.6, kind: 'bubble', actor: 'ham', emoji: '😠', dur: 0.5 },
    { at: 4.25, kind: 'sweat', actor: 'ham' },
    { at: 5.0, kind: 'burst', actor: 'tree', emoji: '🍃', n: 6, dur: 0.6 },
    { at: 5.3, kind: 'dizzy', actor: 'ham', dur: 1.0 },
    { at: 6.95, kind: 'pop', actor: 'root', emoji: '👋', dur: 0.7 },
    { at: 7.2, kind: 'pop', actor: 'ham', emoji: '❗', dur: 0.4 },
    { at: 8.25, kind: 'pop', actor: 'ham', emoji: '💕', dur: 0.5 },
    { at: 9.25, kind: 'bubble', actor: 'ham', emoji: '😑', dur: 0.75 },
  ],
  camera: [
    { at: 4.2, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 120, y: 66 } },
    { at: 5.0, dur: 0.4, do: 'shake', amount: 1.8 },
  ],
  cues: [
    { at: 1.0, sfx: 'slide' },
    { at: 1.55, say: '根' },
    { at: 2.6, sfx: 'slide' },
    { at: 3.3, sfx: 'blip' },
    { at: 4.2, sfx: 'rumble' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 5.15, sfx: 'plop' },
    { at: 6.1, say: '根' },
    { at: 6.6, sfx: 'poof' },
    { at: 7.1, say: '樹根' },
    { at: 7.8, sfx: 'whoosh' },
    { at: 8.9, sfx: 'slide' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
