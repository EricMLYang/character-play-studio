import type { Clip } from '../clip'

// 獅：獅子到理髮店，得意地甩甩蓬蓬的鬃毛。螃蟹理髮師用大鉗子當剪刀，喀嚓、喀嚓……剪到停不下來，
// 鬃毛剪光光，獅子變成一隻小貓臉。剪下來的毛變成「獅」。想吼一聲只發出「喵」，一用力鬃毛「碰」地長回來超大一圈，把螃蟹吼飛；螃蟹拿著剪刀又回來，獅子嚇到縮小。獅、獅、獅子
const clip: Clip = {
  char: '獅',
  meta: { theme: '理髮店', cast: '獅子＋螃蟹理髮師', gags: ['剪到停不下來', '剪光變小貓', '吼不出來', '鬃毛爆長'] },
  duration: 10,
  bg: { top: '#E3F6F0', bottom: '#C8ECE0', floor: '#CDB89A', scenery: 'city' },
  actors: [
    { id: 'pole', emoji: '💈', x: 9, y: 69.6, size: 17.5, hidden: true },
    { id: 'lion', emoji: '🦁', x: 28, y: 68.6, size: 20, hidden: true },
    { id: 'crab', emoji: '🦀', x: 44, y: 71.8, size: 12.5, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'pole', do: 'pop' },
    { at: 0.1, actor: 'lion', do: 'pop' },
    { at: 0.2, actor: 'crab', do: 'enter', from: { x: 175, y: 71.8 }, dur: 0.6 },
    // 得意甩鬃毛
    { at: 1.36, actor: 'lion', do: 'shake', dur: 0.5, amount: 1.5 },
    { at: 1.36, actor: 'lion', do: 'flash', dur: 0.5 },
    // 喀嚓、喀嚓
    { at: 2.07, actor: 'crab', do: 'hop', dur: 0.25, amount: 3 },
    { at: 2.61, actor: 'crab', do: 'hop', dur: 0.25, amount: 3 },
    // 剪到停不下來：跳到頭上狂剪
    { at: 3.37, actor: 'crab', do: 'moveTo', to: { x: 29, y: 57 }, dur: 0.3, arc: 8 },
    { at: 3.7, actor: 'crab', do: 'shake', dur: 0.6, amount: 2.5 },
    { at: 3.7, actor: 'lion', do: 'shake', dur: 0.6, amount: 0.8 },
    { at: 4.35, actor: 'crab', do: 'moveTo', to: { x: 44, y: 71.8 }, dur: 0.3, arc: 8 },
    { at: 4.35, actor: 'lion', do: 'swap', emoji: '🐱' },
    { at: 4.35, actor: 'lion', do: 'scaleTo', amount: 0.75, dur: 0.2 },
    // 想吼……只會喵
    { at: 6.7, actor: 'lion', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 7.2, actor: 'crab', do: 'bounce', dur: 0.6, times: 3, amount: 1.5 },
    // 用力——鬃毛長回來超大一圈，螃蟹被吼飛
    { at: 7.6, actor: 'lion', do: 'flash', dur: 0.5 },
    { at: 7.6, actor: 'lion', do: 'shake', dur: 0.5, amount: 1 },
    { at: 8.1, actor: 'lion', do: 'swap', emoji: '🦁' },
    { at: 8.1, actor: 'lion', do: 'scaleTo', amount: 2.4, dur: 0.3 },
    { at: 8.2, actor: 'crab', do: 'moveTo', to: { x: -15, y: 10 }, dur: 0.6, arc: 10 },
    { at: 8.2, actor: 'crab', do: 'spin', dur: 0.6, times: 2 },
    { at: 8.2, actor: 'pole', do: 'tilt', amount: -20, dur: 0.5 },
    // 螃蟹拿剪刀又回來
    { at: 9.14, actor: 'crab', do: 'moveTo', to: { x: 6, y: 71.8 }, dur: 0.3 },
    { at: 9.44, actor: 'lion', do: 'scaleTo', amount: 0.55, dur: 0.2 },
    { at: 9.44, actor: 'lion', do: 'shake', dur: 0.5, amount: 1 },
  ],
  builds: [
    // 地上剪下來的毛飛起來
    { at: 5, dur: 0.5, strokes: [0, 1, 2], from: { x: 30, y: 73 }, color: '#D98A00' },
    { at: 5.3, dur: 0.6, strokes: [3, 4, 5, 6, 7, 8], from: { x: 26, y: 73 }, color: '#A9481A' },
    { at: 5.75, dur: 0.5, strokes: [9, 10, 11, 12], from: { x: 34, y: 73 }, color: '#A9481A' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.57, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'lion', emoji: '✂️', dur: 0.7 },
    { at: 1.42, kind: 'burst', actor: 'lion', emoji: '✨', n: 5, dur: 0.5 },
    { at: 2.07, kind: 'burst', actor: 'lion', emoji: '🌾', n: 3, dur: 0.4, dy: 4 },
    { at: 2.61, kind: 'burst', actor: 'lion', emoji: '🌾', n: 3, dur: 0.4, dy: 4 },
    { at: 2.99, kind: 'pop', actor: 'lion', emoji: '😟', dur: 0.4 },
    { at: 3.59, kind: 'burst', actor: 'lion', emoji: '🌾', n: 8, dur: 0.5, dy: 4 },
    { at: 3.97, kind: 'burst', actor: 'lion', emoji: '🌾', n: 8, dur: 0.5, dy: 4 },
    { at: 4.67, kind: 'pop', actor: 'lion', emoji: '❓', dur: 0.6 },
    { at: 4.78, kind: 'sweat', actor: 'crab' },
    { at: 7, kind: 'pop', actor: 'lion', emoji: '🎵', dur: 0.5 },
    { at: 7.2, kind: 'pop', actor: 'crab', emoji: '😆', dur: 0.6 },
    { at: 8.1, kind: 'burst', actor: 'lion', emoji: '🌾', n: 8, dur: 0.5, dy: 6 },
    { at: 8.71, kind: 'pop', actor: 'lion', emoji: '😎', dur: 0.6, dx: 4, dy: 4 },
    { at: 9.31, kind: 'pop', actor: 'crab', emoji: '✂️', dur: 0.7 },
    { at: 9.49, kind: 'pop', actor: 'lion', emoji: '😱', dur: 0.6 },
  ],
  camera: [
    { at: 4.35, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 28, y: 62 } },
    { at: 8.1, dur: 0.5, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.36, sfx: 'boing' },
    { at: 1.53, say: '獅' },
    { at: 2.07, sfx: 'tap' },
    { at: 2.61, sfx: 'tap' },
    { at: 3.59, sfx: 'tap' }, { at: 3.75, sfx: 'tap' }, { at: 3.91, sfx: 'tap' }, { at: 4.08, sfx: 'tap' },
    { at: 4.35, sfx: 'poof' },
    { at: 6.35, say: '獅' },
    { at: 7, sfx: 'blip' },
    { at: 8.1, sfx: 'rumble' },
    { at: 8.2, say: '獅子' },
    { at: 8.24, sfx: 'whoosh' },
    { at: 9.31, sfx: 'clink' },
    { at: 9.66, sfx: 'cheer' },
  ],
}

export default clip
