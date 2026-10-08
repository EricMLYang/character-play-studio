import type { Clip } from '../clip'

// 矮：街上有舞龍遊行，矮矮的刺蝟被大象和長頸鹿擋住：跳一下看不到、跳高一點也看不到、站上小矮凳還是看不到。
// 牠縮成刺球彈上天，終於看到了，刺一根根飛出去像箭一樣。最後來了螞蟻樂隊小遊行——這次只有矮矮的刺蝟看得到，高的怎麼找都找不到。矮、矮、矮凳
const clip: Clip = {
  char: '矮',
  meta: { theme: '街頭看遊行', cast: '刺蝟＋大象＋長頸鹿＋舞龍＋螞蟻樂隊', gags: ['怎麼跳都看不到（漸強）', '小矮凳也太矮', '彈上天刺飛出去', '小遊行只有矮的看得到（反轉）'] },
  duration: 10,
  bg: { top: '#FFE9F2', bottom: '#FFD0E2', floor: '#9AA3B5', scenery: 'city' },
  actors: [
    { id: 'stool', emoji: '🪑', x: 12, y: 73.6, size: 8, hidden: true },
    { id: 'hog', emoji: '🦔', x: 12, y: 73.2, size: 9, hidden: true, flip: true },
    { id: 'ele', emoji: '🐘', x: 28, y: 67.8, size: 22, hidden: true, flip: true },
    { id: 'gir', emoji: '🦒', x: 42, y: 65.2, size: 28, hidden: true },
    { id: 'drum', emoji: '🥁', x: 148, y: 72.8, size: 10, hidden: true },
    { id: 'horn', emoji: '🎺', x: 146, y: 46, size: 8, hidden: true, float: true },
    { id: 'dragon', emoji: '🐉', x: 128, y: 54, size: 20, hidden: true, float: true },
    { id: 'ant1', emoji: '🐜', x: 66, y: 74.9, size: 5, hidden: true },
    { id: 'ant2', emoji: '🐜', x: 76, y: 74.9, size: 5, hidden: true },
    { id: 'ant3', emoji: '🐜', x: 86, y: 74.9, size: 5, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'ele', do: 'pop' },
    { at: 0.1, actor: 'gir', do: 'pop' },
    { at: 0.1, actor: 'hog', do: 'enter', from: { x: -10, y: 73.2 }, dur: 0.5 },
    { at: 0.5, actor: 'drum', do: 'enter', from: { x: 178, y: 72.8 }, dur: 0.6 },
    { at: 0.9, actor: 'ele', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 0.9, actor: 'gir', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 跳一下：看不到
    { at: 1.05, actor: 'hog', do: 'hop', amount: 6, dur: 0.35 },
    { at: 1.4, actor: 'hog', do: 'squash', amount: 0.25, dur: 0.25 },
    // 舞龍來了
    { at: 1.6, actor: 'dragon', do: 'enter', from: { x: 185, y: 54 }, dur: 0.8 },
    { at: 1.8, actor: 'horn', do: 'enter', from: { x: 180, y: 46 }, dur: 0.7 },
    { at: 2.4, actor: 'dragon', do: 'bounce', amount: 3, times: 3, dur: 1.5 },
    { at: 2.5, actor: 'drum', do: 'bounce', amount: 2, times: 4, dur: 1.4 },
    // 跳高一點：還是看不到
    { at: 2.1, actor: 'hog', do: 'hop', amount: 14, dur: 0.45 },
    // 站上小矮凳：還是看不到
    { at: 2.9, actor: 'stool', do: 'pop' },
    { at: 3.0, actor: 'hog', do: 'moveTo', to: { x: 12, y: 69.6 }, arc: 6, dur: 0.35 },
    { at: 3.4, actor: 'hog', do: 'squash', amount: -0.2, dur: 0.4 },
    // 縮成刺球，彈上天
    { at: 4.0, actor: 'hog', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.3, actor: 'hog', do: 'moveTo', to: { x: 60, y: 22 }, dur: 0.5 },
    { at: 4.3, actor: 'hog', do: 'spin', times: 3, dur: 0.5 },
    { at: 5.0, actor: 'dragon', do: 'spin', dur: 0.5 },
    { at: 5.0, actor: 'horn', do: 'hop', amount: 6, dur: 0.4 },
    { at: 5.1, actor: 'hog', do: 'moveTo', to: { x: 12, y: 69.6 }, dur: 0.6 },
    { at: 5.7, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 小矮凳
    { at: 7.0, actor: 'stool', do: 'flash', dur: 0.6 },
    { at: 7.05, actor: 'stool', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 7.05, actor: 'hog', do: 'hop', amount: -1.5, dur: 0.3 },
    // 螞蟻樂隊小遊行：只有矮的看得到
    { at: 8.0, actor: 'ant1', do: 'enter', from: { x: 172, y: 74.9 }, dur: 1.3 },
    { at: 8.1, actor: 'ant2', do: 'enter', from: { x: 180, y: 74.9 }, dur: 1.3 },
    { at: 8.2, actor: 'ant3', do: 'enter', from: { x: 188, y: 74.9 }, dur: 1.3 },
    { at: 8.4, actor: 'hog', do: 'moveTo', to: { x: 12, y: 73.2 }, arc: 4, dur: 0.3 },
    { at: 8.8, actor: 'gir', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 8.9, actor: 'ele', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 9.1, actor: 'hog', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
  ],
  builds: [
    // 飛出去的刺（像箭一樣）→ 矢；舞龍嚇得噴出彩帶 → 委
    { at: 4.85, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'hog', color: '#7A4E2D' },
    { at: 5.15, dur: 0.9, strokes: [5, 6, 7, 8, 9, 10, 11, 12], from: 'dragon', color: '#E0408A' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'hog', emoji: '🎉', dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'hog', emoji: '❓', dur: 0.5 },
    { at: 2.25, kind: 'pop', actor: 'hog', emoji: '😩', dur: 0.4, dy: 14 },
    { at: 3.4, kind: 'bubble', actor: 'hog', emoji: '😑', dur: 0.6 },
    { at: 3.6, kind: 'pop', actor: 'gir', emoji: '😆', dur: 0.5, dx: -6, dy: 6 },
    { at: 3.9, kind: 'pop', actor: 'hog', emoji: '💡', dur: 0.4 },
    { at: 4.8, kind: 'pop', actor: 'hog', emoji: '😍', dur: 0.4 },
    { at: 4.85, kind: 'burst', actor: 'hog', n: 6, dur: 0.5 },
    { at: 5.05, kind: 'pop', actor: 'dragon', emoji: '❗', dur: 0.5, dx: -10 },
    { at: 5.7, kind: 'dizzy', actor: 'hog', dur: 0.8 },
    { at: 7.1, kind: 'bubble', actor: 'hog', emoji: '😤', dur: 0.6 },
    { at: 8.9, kind: 'zzz', actor: 'ant2', emoji: '🎵', dur: 1.0 },
    { at: 8.9, kind: 'pop', actor: 'gir', emoji: '❓', dur: 0.7, dx: -6, dy: 6 },
    { at: 9.0, kind: 'pop', actor: 'hog', emoji: '😍', dur: 0.8 },
  ],
  camera: [
    { at: 4.6, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 60, y: 30 } },
  ],
  cues: [
    { at: 0.8, sfx: 'tap' },
    { at: 1.4, say: '矮' },
    { at: 2.5, sfx: 'tap' }, { at: 2.85, sfx: 'tap' }, { at: 3.2, sfx: 'tap' },
    { at: 4.3, sfx: 'boing' },
    { at: 4.85, sfx: 'whoosh' },
    { at: 5.7, sfx: 'plop' },
    { at: 6.1, say: '矮' },
    { at: 7.1, say: '矮凳' },
    { at: 8.3, sfx: 'tap' }, { at: 8.7, sfx: 'tap' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
