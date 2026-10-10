import type { Clip } from '../clip'

// 矮：街上有舞龍遊行，矮矮的刺蝟被大象和長頸鹿擋住：跳一下看不到、跳高一點也看不到、站上小矮凳還是看不到。
// 牠縮成刺球彈上天，終於看到了，刺一根根飛出去像箭一樣。最後來了螞蟻樂隊小遊行——這次只有矮矮的刺蝟看得到，高的怎麼找都找不到。矮、矮、矮凳
const clip: Clip = {
  char: '矮',
  meta: { theme: '街頭看遊行', cast: '刺蝟＋大象＋長頸鹿＋舞龍＋螞蟻樂隊', gags: ['怎麼跳都看不到（漸強）', '小矮凳也太矮', '彈上天刺飛出去', '小遊行只有矮的看得到（反轉）'] },
  duration: 10,
  bg: { top: '#FFE9F2', bottom: '#FFD0E2', floor: '#9AA3B5', scenery: 'city' },
  actors: [
    { id: 'stool', emoji: '🪑', x: 12, y: 72.8, size: 10, hidden: true },
    { id: 'hog', emoji: '🦔', x: 12, y: 72.3, size: 11.2, hidden: true, flip: true },
    { id: 'ele', emoji: '🐘', x: 24, y: 67.8, size: 21, hidden: true, flip: true },
    { id: 'gir', emoji: '🦒', x: 38, y: 65.2, size: 26, hidden: true },
    { id: 'drum', emoji: '🥁', x: 148, y: 71.8, size: 12.5, hidden: true },
    { id: 'horn', emoji: '🎺', x: 146, y: 46, size: 10, hidden: true, float: true },
    { id: 'dragon', emoji: '🐉', x: 128, y: 54, size: 20, hidden: true, float: true },
    { id: 'ant1', emoji: '🐜', x: 66, y: 74.4, size: 6.2, hidden: true },
    { id: 'ant2', emoji: '🐜', x: 76, y: 74.4, size: 6.2, hidden: true },
    { id: 'ant3', emoji: '🐜', x: 86, y: 74.4, size: 6.2, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'ele', do: 'pop' },
    { at: 0.1, actor: 'gir', do: 'pop' },
    { at: 0.1, actor: 'hog', do: 'enter', from: { x: -10, y: 72.3 }, dur: 0.5 },
    { at: 0.5, actor: 'drum', do: 'enter', from: { x: 178, y: 71.8 }, dur: 0.6 },
    { at: 0.9, actor: 'ele', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 0.9, actor: 'gir', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 跳一下：看不到
    { at: 1.05, actor: 'hog', do: 'hop', amount: 6, dur: 0.35 },
    { at: 1.42, actor: 'hog', do: 'squash', amount: 0.25, dur: 0.25 },
    // 舞龍來了
    { at: 1.63, actor: 'dragon', do: 'enter', from: { x: 185, y: 54 }, dur: 0.8 },
    { at: 1.85, actor: 'horn', do: 'enter', from: { x: 180, y: 46 }, dur: 0.7 },
    { at: 2.5, actor: 'dragon', do: 'bounce', amount: 3, times: 3, dur: 1.5 },
    { at: 2.61, actor: 'drum', do: 'bounce', amount: 2, times: 4, dur: 1.4 },
    // 跳高一點：還是看不到
    { at: 2.17, actor: 'hog', do: 'hop', amount: 14, dur: 0.45 },
    // 站上小矮凳：還是看不到
    { at: 3.04, actor: 'stool', do: 'pop' },
    { at: 3.15, actor: 'hog', do: 'moveTo', to: { x: 12, y: 69.6 }, arc: 6, dur: 0.35 },
    { at: 3.58, actor: 'hog', do: 'squash', amount: -0.2, dur: 0.4 },
    // 縮成刺球，彈上天
    { at: 4.23, actor: 'hog', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.55, actor: 'hog', do: 'moveTo', to: { x: 60, y: 22 }, dur: 0.5 },
    { at: 4.55, actor: 'hog', do: 'spin', times: 3, dur: 0.5 },
    { at: 5.3, actor: 'dragon', do: 'spin', dur: 0.5 },
    { at: 5.3, actor: 'horn', do: 'hop', amount: 6, dur: 0.4 },
    { at: 5.4, actor: 'hog', do: 'moveTo', to: { x: 12, y: 69.6 }, dur: 0.6 },
    { at: 6, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 小矮凳
    { at: 7.3, actor: 'stool', do: 'flash', dur: 0.6 },
    { at: 7.35, actor: 'stool', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 7.35, actor: 'hog', do: 'hop', amount: -1.5, dur: 0.3 },
    // 螞蟻樂隊小遊行：只有矮的看得到
    { at: 8.21, actor: 'ant1', do: 'enter', from: { x: 172, y: 74.4 }, dur: 1.3 },
    { at: 8.3, actor: 'ant2', do: 'enter', from: { x: 180, y: 74.4 }, dur: 1.3 },
    { at: 8.39, actor: 'ant3', do: 'enter', from: { x: 188, y: 74.4 }, dur: 1.3 },
    { at: 8.57, actor: 'hog', do: 'moveTo', to: { x: 12, y: 72.3 }, arc: 4, dur: 0.3 },
    { at: 8.92, actor: 'gir', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 9.01, actor: 'ele', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 9.19, actor: 'hog', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
  ],
  builds: [
    // 飛出去的刺（像箭一樣）→ 矢；舞龍嚇得噴出彩帶 → 委
    { at: 5.15, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'hog', color: '#7A4E2D' },
    { at: 5.45, dur: 0.9, strokes: [5, 6, 7, 8, 9, 10, 11, 12], from: 'dragon', color: '#E0408A' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'hog', emoji: '🎉', dur: 0.5 },
    { at: 1.42, kind: 'pop', actor: 'hog', emoji: '❓', dur: 0.5 },
    { at: 2.34, kind: 'pop', actor: 'hog', emoji: '😩', dur: 0.4, dy: 14 },
    { at: 3.58, kind: 'bubble', actor: 'hog', emoji: '😑', dur: 0.6 },
    { at: 3.8, kind: 'pop', actor: 'gir', emoji: '😆', dur: 0.5, dx: -6, dy: 6 },
    { at: 4.12, kind: 'pop', actor: 'hog', emoji: '💡', dur: 0.4 },
    { at: 5.1, kind: 'pop', actor: 'hog', emoji: '😍', dur: 0.4 },
    { at: 5.15, kind: 'burst', actor: 'hog', n: 6, dur: 0.5 },
    { at: 5.35, kind: 'pop', actor: 'dragon', emoji: '❗', dur: 0.5, dx: -10 },
    { at: 6, kind: 'dizzy', actor: 'hog', dur: 0.8 },
    { at: 7.4, kind: 'bubble', actor: 'hog', emoji: '😤', dur: 0.6 },
    { at: 9.01, kind: 'zzz', actor: 'ant2', emoji: '🎵', dur: 1.0 },
    { at: 9.01, kind: 'pop', actor: 'gir', emoji: '❓', dur: 0.7, dx: -6, dy: 6 },
    { at: 9.1, kind: 'pop', actor: 'hog', emoji: '😍', dur: 0.8 },
  ],
  camera: [
    { at: 4.88, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 60, y: 30 } },
  ],
  cues: [
    { at: 0.8, sfx: 'tap' },
    { at: 1.42, say: '矮' },
    { at: 2.61, sfx: 'tap' }, { at: 2.99, sfx: 'tap' }, { at: 3.36, sfx: 'tap' },
    { at: 4.55, sfx: 'boing' },
    { at: 5.15, sfx: 'whoosh' },
    { at: 6, sfx: 'plop' },
    { at: 6.4, say: '矮' },
    { at: 7.4, say: '矮凳' },
    { at: 8.48, sfx: 'tap' }, { at: 8.83, sfx: 'tap' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
