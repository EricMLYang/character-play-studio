import type { Clip } from '../clip'

// 午：中午，熊躺在床上準備睡午覺，一隻蒼蠅嗡嗡嗡繞著牠飛。熊揮手——沒打到；蒼蠅停在牠鼻子上，熊用力一拍——打到自己的臉！
// 蒼蠅嗡嗡飛走，飛過的路線變成「午」。蒼蠅又飛回來，停在熊鼻子上一起睡……熊打了一個超大的呼，把蒼蠅吹飛了。午、午、午睡
const clip: Clip = {
  char: '午',
  meta: { theme: '睡午覺', cast: '熊＋蒼蠅', gags: ['打不到', '打到自己', '打呼把對方吹飛'] },
  duration: 10,
  bg: { top: '#FFF0C9', bottom: '#FFF8E8', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'bed', emoji: '🛏️', x: 32, y: 64, size: 34, hidden: true },
    { id: 'bear', emoji: '🐻', x: 24, y: 57, size: 17, hidden: true },
    { id: 'fly', emoji: '🪰', x: 120, y: 30, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'bed', do: 'pop' },
    { at: 0.2, actor: 'bear', do: 'drop', dur: 0.6 },
    // 蒼蠅嗡嗡嗡飛進來，繞著熊轉
    { at: 1.8, actor: 'fly', do: 'pop', dur: 0.2 },
    { at: 2.0, actor: 'fly', do: 'moveTo', to: { x: 44, y: 46 }, dur: 0.6, arc: 8 },
    { at: 2.6, actor: 'fly', do: 'moveTo', to: { x: 16, y: 44 }, dur: 0.4, arc: 6 },
    // 揮手——沒打到
    { at: 3.0, actor: 'bear', do: 'tilt', amount: -25, dur: 0.3 },
    { at: 3.05, actor: 'fly', do: 'moveTo', to: { x: 40, y: 38 }, dur: 0.3, arc: 6 },
    // 停在鼻子上——用力一拍，打到自己的臉
    { at: 3.8, actor: 'fly', do: 'moveTo', to: { x: 25, y: 56 }, dur: 0.4 },
    { at: 4.5, actor: 'bear', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 4.8, actor: 'bear', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 4.75, actor: 'fly', do: 'moveTo', to: { x: 46, y: 40 }, dur: 0.25 },
    // 嗡嗡飛走
    { at: 5.2, actor: 'fly', do: 'moveTo', to: { x: 128, y: 30 }, dur: 0.7, arc: 10 },
    // 又飛回來，停在鼻子上一起睡
    { at: 7.0, actor: 'fly', do: 'moveTo', to: { x: 25, y: 56 }, dur: 0.8, arc: 16 },
    // 熊打一個超大的呼——把蒼蠅吹飛
    { at: 8.7, actor: 'bear', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 9.05, actor: 'bear', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 9.05, actor: 'fly', do: 'moveTo', to: { x: 8, y: 6 }, dur: 0.5 },
    { at: 9.05, actor: 'fly', do: 'spin', times: 3, dur: 0.5 },
  ],
  builds: [
    // 蒼蠅嗡嗡飛過的路線
    { at: 5.25, dur: 0.6, strokes: [0, 1], from: 'fly', color: '#3D7DD8' },
    { at: 5.7, dur: 0.6, strokes: [2, 3], from: 'fly', color: '#E86A33' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'zzz', actor: 'bear', dur: 1.2 },
    { at: 2.1, kind: 'pop', actor: 'bear', emoji: '😑', dur: 0.7 },
    { at: 3.4, kind: 'sweat', actor: 'bear' },
    { at: 4.3, kind: 'pop', actor: 'bear', emoji: '😵', dur: 0.4, dx: -12 },
    { at: 4.8, kind: 'burst', actor: 'bear', dur: 0.45 },
    { at: 5.1, kind: 'dizzy', actor: 'bear', dur: 1.2 },
    { at: 7.9, kind: 'zzz', actor: 'bear', dur: 1.0 },
    { at: 8.0, kind: 'zzz', actor: 'fly', dur: 0.9, dx: 4 },
    { at: 9.05, kind: 'burst', actor: 'bear', emoji: '💨', n: 5, dur: 0.5, dx: 8 },
  ],
  camera: [
    { at: 4.4, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 28, y: 56 } },
    { at: 4.8, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 0.8, sfx: 'plop' },
    { at: 1.2, say: '午' },
    { at: 2.0, sfx: 'bubble' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 4.8, sfx: 'bonk' },
    { at: 5.2, sfx: 'bubble' },
    { at: 6.4, say: '午' },
    { at: 7.0, sfx: 'bubble' },
    { at: 8.1, say: '午睡' },
    { at: 9.05, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
