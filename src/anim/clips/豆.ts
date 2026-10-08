import type { Clip } from '../clip'

// 豆：小豬種下一顆豆子，澆水、等待、氣得跳上去踩——都沒動靜。乳牛慢慢走過來一屁股坐上去，豆子瞬間長成通天豆莖，把乳牛送上雲端，
// 搖下來的豆子變成「豆」。小豬撿到一顆發光的魔豆，自己站上去種——結果只長出一棵小芽，把牠撐高一點點。豆、豆、魔豆
const clip: Clip = {
  char: '豆',
  meta: { theme: '傑克與魔豆（農場）', cast: '小豬＋乳牛＋豆莖', gags: ['怎麼等都不長', '別人一坐就暴長', '被送上雲端', '自己種只長一點點'] },
  duration: 10,
  bg: { top: '#CDEBFF', bottom: '#EEF8FF', floor: '#8CC56A', scenery: 'hills' },
  actors: [
    { id: 'bean', emoji: '🫘', x: 26, y: 73, size: 5, hidden: true },
    { id: 's1', emoji: '🌿', x: 26, y: 67, size: 12, hidden: true },
    { id: 's2', emoji: '🌿', x: 27, y: 57, size: 12, hidden: true, float: true },
    { id: 's3', emoji: '🌿', x: 25, y: 47, size: 12, hidden: true, float: true },
    { id: 's4', emoji: '🌿', x: 27, y: 37, size: 12, hidden: true, float: true },
    { id: 's5', emoji: '🌿', x: 25, y: 27, size: 12, hidden: true, float: true },
    { id: 's6', emoji: '🌿', x: 26, y: 17, size: 12, hidden: true, float: true },
    { id: 'cloud1', emoji: '☁️', x: 11, y: 14, size: 12, hidden: true, float: true },
    { id: 'cloud2', emoji: '☁️', x: 42, y: 11, size: 12, hidden: true, float: true },
    { id: 'cow', emoji: '🐄', x: 18, y: 72.4, size: 11, hidden: true, flip: true },
    { id: 'sprout', emoji: '🌱', x: 44, y: 73.5, size: 6, hidden: true },
    { id: 'pig', emoji: '🐖', x: 38, y: 72, size: 12, hidden: true },
    { id: 'magic', emoji: '🫘', x: 38, y: 58, size: 6, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'pig', do: 'enter', from: { x: 175, y: 72 }, dur: 0.7 },
    // 種豆子
    { at: 0.8, actor: 'bean', do: 'enter', from: { x: 34, y: 66 }, arc: 5, dur: 0.3 },
    { at: 1.2, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 澆水……沒動靜
    { at: 2.0, actor: 'pig', do: 'tilt', amount: -15, dur: 0.6 },
    // 氣得跳上去踩
    { at: 3.0, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 3.2, actor: 'pig', do: 'moveTo', to: { x: 27, y: 72 }, arc: 8, dur: 0.3 },
    { at: 3.5, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 3.5, actor: 'bean', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 3.8, actor: 'pig', do: 'moveTo', to: { x: 40, y: 72 }, arc: 4, dur: 0.3 },
    // 乳牛慢慢走過來，一屁股坐上去
    { at: 3.6, actor: 'cow', do: 'enter', from: { x: -14, y: 72.4 }, dur: 0.6 },
    { at: 4.25, actor: 'cow', do: 'moveTo', to: { x: 26, y: 72.4 }, dur: 0.2 },
    { at: 4.45, actor: 'cow', do: 'squash', amount: 0.3, dur: 0.2 },
    // 轟！通天豆莖，把乳牛送上雲端
    { at: 4.65, actor: 'bean', do: 'vanish', dur: 0.1 },
    { at: 4.65, actor: 's1', do: 'pop', dur: 0.2 },
    { at: 4.8, actor: 's2', do: 'pop', dur: 0.2 },
    { at: 4.95, actor: 's3', do: 'pop', dur: 0.2 },
    { at: 5.1, actor: 's4', do: 'pop', dur: 0.2 },
    { at: 5.25, actor: 's5', do: 'pop', dur: 0.2 },
    { at: 5.4, actor: 's6', do: 'pop', dur: 0.2 },
    { at: 4.65, actor: 'cow', do: 'moveTo', to: { x: 26, y: 8 }, dur: 0.95 },
    { at: 4.7, actor: 'pig', do: 'hop', amount: 6, dur: 0.35 },
    { at: 5.55, actor: 'cloud1', do: 'pop' },
    { at: 5.65, actor: 'cloud2', do: 'pop' },
    { at: 5.7, actor: 'cow', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 6.0, actor: 's6', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 6.0, actor: 's5', do: 'shake', amount: 1, dur: 0.5 },
    // 小豬撿到發光的魔豆
    { at: 7.3, actor: 'magic', do: 'drop', dur: 0.5 },
    { at: 7.8, actor: 'magic', do: 'flash', dur: 0.6 },
    { at: 7.85, actor: 'pig', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 自己種、自己站上去——只長出一棵小芽
    { at: 8.4, actor: 'magic', do: 'moveTo', to: { x: 44, y: 73.5 }, arc: 4, dur: 0.3 },
    { at: 8.4, actor: 'pig', do: 'moveTo', to: { x: 44, y: 72 }, arc: 6, dur: 0.3 },
    { at: 8.95, actor: 'magic', do: 'vanish', dur: 0.1 },
    { at: 9.0, actor: 'sprout', do: 'pop', dur: 0.3 },
    { at: 9.0, actor: 'pig', do: 'moveTo', to: { x: 44, y: 68.5 }, dur: 0.3 },
  ],
  builds: [
    // 豆莖頂端搖下來的豆莢 → 上面的一口；紅豆一顆顆掉下來 → 下面
    { at: 6.0, dur: 0.75, strokes: [0, 1, 2, 3], from: 'cow', color: '#6B8E23' },
    { at: 6.5, dur: 0.6, strokes: [4, 5, 6], from: 'cow', style: 'drop', color: '#C0392B' },
  ],
  glyph: [{ at: 7.1, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.6, kind: 'bubble', actor: 'pig', emoji: '🌳', dur: 0.6 },
    { at: 2.1, kind: 'rain', actor: 'bean', dy: -14, n: 6, dur: 0.7 },
    { at: 2.7, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.4 },
    { at: 3.5, kind: 'puff', actor: 'pig' },
    { at: 4.0, kind: 'bubble', actor: 'pig', emoji: '😤', dur: 0.5 },
    { at: 4.45, kind: 'puff', actor: 'cow' },
    { at: 4.65, kind: 'burst', actor: 's1', emoji: '✨', n: 6, dur: 0.5 },
    { at: 4.8, kind: 'pop', actor: 'pig', emoji: '😱', dur: 0.6 },
    { at: 5.75, kind: 'pop', actor: 'cow', emoji: '😎', dx: 8, dy: 14, dur: 0.7 },
    { at: 7.8, kind: 'burst', actor: 'magic', emoji: '✨', n: 6, dur: 0.6 },
    { at: 7.9, kind: 'pop', actor: 'pig', emoji: '🤩', dur: 0.5 },
    { at: 9.0, kind: 'burst', actor: 'sprout', emoji: '✨', n: 5, dur: 0.4 },
    { at: 9.35, kind: 'pop', actor: 'pig', emoji: '😑', dur: 0.6 },
    { at: 9.3, kind: 'pop', actor: 'cow', emoji: '😆', dx: 8, dy: 14, dur: 0.6 },
  ],
  camera: [
    { at: 4.65, dur: 0.6, do: 'shake', amount: 2 },
    { at: 9.05, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 44, y: 66 } },
  ],
  cues: [
    { at: 1.1, sfx: 'plop' },
    { at: 1.4, say: '豆' },
    { at: 2.1, sfx: 'splash' },
    { at: 3.5, sfx: 'bonk' },
    { at: 4.45, sfx: 'plop' },
    { at: 4.65, sfx: 'rumble' },
    { at: 4.7, sfx: 'whoosh' },
    { at: 6.0, sfx: 'tap' },
    { at: 7.15, say: '豆' },
    { at: 8.1, say: '魔豆' },
    { at: 9.0, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
