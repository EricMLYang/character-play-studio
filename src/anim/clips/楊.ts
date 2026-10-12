import type { Clip } from '../clip'

// 楊（楊捷睿賽車手 第一集）：小賽車在楊樹下睡覺，鬧鐘一響要出發——第一次發動「噗」熄火，第二次催太猛「碰」撞上楊樹，彈回車庫。
// 樹葉掉下來變成「木」，太陽變成「日」，排氣管的煙拼成右下，「楊」站好了。這時獵豹跑來下戰帖，兩個「咻」地衝出畫面（接第二集）。楊、楊、楊樹
const clip: Clip = {
  char: '楊',
  meta: { theme: '楊捷睿賽車手①出發', cast: '賽車＋楊樹＋太陽＋獵豹', gags: ['發動熄火', '催太猛撞樹彈回來', '獵豹下戰帖'] },
  duration: 10,
  bg: { top: '#9FD8FF', bottom: '#E6F6FF', floor: '#9CD67E', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 20, y: 15, size: 14, hidden: true, float: true },
    { id: 'tree', emoji: '🌳', x: 140, y: 62, size: 36, hidden: true },
    { id: 'car', emoji: '🏎️', x: 26, y: 70, size: 19, hidden: true, flip: true },
    { id: 'cheetah', emoji: '🐆', x: 148, y: 66, size: 20, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'pop' },
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.1, actor: 'car', do: 'pop' },
    // 鬧鐘響，跳起來
    { at: 1.0, actor: 'car', do: 'hop', amount: 6, dur: 0.3 },
    // 第一次發動：抖一抖——噗，熄火
    { at: 1.6, actor: 'car', do: 'shake', amount: 1, dur: 0.5 },
    { at: 2.1, actor: 'car', do: 'squash', amount: 0.25, dur: 0.3 },
    // 第二次催太猛，衝出去撞上楊樹
    { at: 2.9, actor: 'car', do: 'shake', amount: 2, dur: 0.4 },
    { at: 3.3, actor: 'car', do: 'moveTo', to: { x: 124, y: 70 }, dur: 0.25 },
    { at: 3.55, actor: 'tree', do: 'shake', amount: 2, dur: 0.6 },
    // 彈回車庫
    { at: 3.7, actor: 'car', do: 'moveTo', to: { x: 26, y: 70 }, dur: 0.6 },
    { at: 3.7, actor: 'car', do: 'hop', amount: 5, dur: 0.4 },
    { at: 4.3, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    // 楊樹
    { at: 7.2, actor: 'tree', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 獵豹跑來下戰帖
    { at: 8.0, actor: 'cheetah', do: 'enter', from: { x: 190, y: 66 }, dur: 0.4 },
    { at: 8.6, actor: 'car', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 8.9, actor: 'cheetah', do: 'flip' },
    { at: 9.0, actor: 'cheetah', do: 'moveTo', to: { x: 195, y: 66 }, dur: 0.35 },
    { at: 9.05, actor: 'car', do: 'moveTo', to: { x: 195, y: 70 }, dur: 0.35 },
  ],
  builds: [
    // 撞下來的樹葉 → 木；太陽 → 日；排氣管的煙 → 右下那幾筆
    { at: 4.4, dur: 0.6, strokes: [0, 1, 2, 3], from: 'tree', style: 'drop', color: '#2F9E44' },
    { at: 5.0, dur: 0.5, strokes: [4, 5, 6, 7], from: 'sun', color: '#FF9F1C' },
    { at: 5.5, dur: 0.6, strokes: [8, 9, 10, 11, 12], from: 'car', color: '#E03131' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'car', dur: 0.8 },
    { at: 1.0, kind: 'pop', actor: 'car', emoji: '⏰', dur: 0.6 },
    { at: 1.6, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 2.2, kind: 'pop', actor: 'car', emoji: '💨', dur: 0.5 },
    { at: 2.6, kind: 'sweat', actor: 'car' },
    { at: 2.9, kind: 'burst', actor: 'car', emoji: '🔥', n: 4, dur: 0.4 },
    { at: 3.55, kind: 'burst', x: 128, y: 58, emoji: '💥', n: 1, dur: 0.4 },
    { at: 3.6, kind: 'burst', x: 140, y: 42, emoji: '🍃', n: 6, dur: 0.6 },
    { at: 4.3, kind: 'dizzy', actor: 'car', dur: 0.9 },
    { at: 7.2, kind: 'burst', x: 140, y: 38, emoji: '🍃', n: 5, dur: 0.6 },
    { at: 8.3, kind: 'bubble', actor: 'cheetah', emoji: '🏁', dx: -14, dur: 0.8 },
    { at: 8.6, kind: 'pop', actor: 'car', emoji: '💢', dur: 0.4 },
  ],
  camera: [
    { at: 3.55, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 7.1, dur: 0.8, do: 'punch', amount: 0.12, to: { x: 140, y: 50 } },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 1.2, say: '楊' },
    { at: 1.6, sfx: 'rumble' },
    { at: 2.1, sfx: 'deflate' },
    { at: 2.9, sfx: 'rumble' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.55, sfx: 'bonk' },
    { at: 4.3, sfx: 'boing' },
    { at: 6.2, say: '楊' },
    { at: 7.25, say: '楊樹' },
    { at: 8.0, sfx: 'whoosh' },
    { at: 9.0, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
