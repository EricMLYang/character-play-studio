import type { Clip } from '../clip'

// 糕：小豬生日吹蠟燭，吹熄了——又自己點起來；鼓起臉再吹，又點起來！氣到鼓成一顆大氣球用力一吹，
// 米粒、奶油、火苗全飛起來變成「糕」，小豬像洩氣的氣球滿天亂飛。落地後一看，蠟燭又點起來了。糕、糕、蛋糕
const clip: Clip = {
  char: '糕',
  meta: { theme: '生日派對', cast: '小豬＋魔術蠟燭蛋糕＋章魚', gags: ['吹熄又點起來', '越鼓越大', '洩氣滿天飛'] },
  duration: 10,
  bg: { top: '#FFE8F1', bottom: '#FFF5F9', floor: '#C98E6B', scenery: 'room' },
  actors: [
    { id: 'cake', emoji: '🎂', x: 84, y: 66, size: 24 },
    { id: 'f1', emoji: '🔥', x: 78, y: 52, size: 5, float: true, hidden: true },
    { id: 'f2', emoji: '🔥', x: 84, y: 51, size: 5, float: true, hidden: true },
    { id: 'f3', emoji: '🔥', x: 90, y: 52, size: 5, float: true, hidden: true },
    { id: 'octopus', emoji: '🐙', x: 140, y: 69.5, size: 17, hidden: true },
    { id: 'pig', emoji: '🐷', x: 32, y: 69, size: 18, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'pig', do: 'enter', from: { x: -12, y: 69 }, dur: 0.6 },
    { at: 0.2, actor: 'f1', do: 'pop', dur: 0.2 }, { at: 0.3, actor: 'f2', do: 'pop', dur: 0.2 }, { at: 0.4, actor: 'f3', do: 'pop', dur: 0.2 },
    { at: 0.3, actor: 'octopus', do: 'pop' },
    { at: 0.8, actor: 'octopus', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 第一次吹：熄了……又點起來
    { at: 1.4, actor: 'pig', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 1.8, actor: 'f1', do: 'vanish', dur: 0.15 }, { at: 1.8, actor: 'f2', do: 'vanish', dur: 0.15 }, { at: 1.8, actor: 'f3', do: 'vanish', dur: 0.15 },
    { at: 2.4, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: 2.9, actor: 'f1', do: 'pop', dur: 0.2 }, { at: 3.0, actor: 'f2', do: 'pop', dur: 0.2 }, { at: 3.1, actor: 'f3', do: 'pop', dur: 0.2 },
    // 第二次：鼓起臉吹——又點起來
    { at: 3.5, actor: 'pig', do: 'scaleTo', amount: 1.2, dur: 0.3 },
    { at: 3.85, actor: 'pig', do: 'scaleTo', amount: 0.833, dur: 0.2 },
    { at: 3.9, actor: 'f1', do: 'vanish', dur: 0.12 }, { at: 3.9, actor: 'f2', do: 'vanish', dur: 0.12 }, { at: 3.9, actor: 'f3', do: 'vanish', dur: 0.12 },
    { at: 4.4, actor: 'f1', do: 'pop', dur: 0.15 }, { at: 4.45, actor: 'f2', do: 'pop', dur: 0.15 }, { at: 4.5, actor: 'f3', do: 'pop', dur: 0.15 },
    { at: 4.6, actor: 'pig', do: 'shake', amount: 1.2, dur: 0.4 },
    // 氣到鼓成大氣球——用力一吹
    { at: 5.1, actor: 'pig', do: 'scaleTo', amount: 1.7, dur: 0.5 },
    { at: 5.1, actor: 'pig', do: 'flash', dur: 0.5 },
    { at: 5.7, actor: 'pig', do: 'scaleTo', amount: 0.59, dur: 0.25 },
    { at: 5.7, actor: 'f1', do: 'vanish', dur: 0.1 }, { at: 5.7, actor: 'f2', do: 'vanish', dur: 0.1 }, { at: 5.7, actor: 'f3', do: 'vanish', dur: 0.1 },
    { at: 5.7, actor: 'cake', do: 'shake', amount: 2, dur: 0.4 },
    // 洩氣的小豬滿天亂飛
    { at: 5.75, actor: 'pig', do: 'moveTo', to: { x: 20, y: 22 }, dur: 0.4 },
    { at: 6.15, actor: 'pig', do: 'moveTo', to: { x: 50, y: 12 }, dur: 0.35 },
    { at: 6.5, actor: 'pig', do: 'moveTo', to: { x: 18, y: 69 }, dur: 0.45 },
    { at: 5.75, actor: 'pig', do: 'spin', times: 3, dur: 1.2 },
    { at: 6.95, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.3 },
    // 蛋糕被吹到右邊；蠟燭又點起來了
    { at: 5.75, actor: 'cake', do: 'moveTo', to: { x: 128, y: 66 }, dur: 0.5, arc: 10 },
    { at: 6.3, actor: 'octopus', do: 'moveTo', to: { x: 150, y: 69.5 }, dur: 0.3 },
    { at: 8.6, actor: 'f1', do: 'moveTo', to: { x: 122, y: 52 }, dur: 0 }, { at: 8.6, actor: 'f2', do: 'moveTo', to: { x: 128, y: 51 }, dur: 0 }, { at: 8.6, actor: 'f3', do: 'moveTo', to: { x: 134, y: 52 }, dur: 0 },
    { at: 8.7, actor: 'f1', do: 'pop', dur: 0.2 }, { at: 8.8, actor: 'f2', do: 'pop', dur: 0.2 }, { at: 8.9, actor: 'f3', do: 'pop', dur: 0.2 },
    { at: 9.2, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.2, actor: 'octopus', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 蛋糕上的米粒 → 米；奶油 → 羊；火苗 → 灬
    { at: 5.8, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'cake', color: '#E8A33D' },
    { at: 6.15, dur: 0.8, strokes: [6, 7, 8, 9, 10, 11], from: 'cake', color: '#F06292' },
    { at: 6.7, dur: 0.5, strokes: [12, 13, 14, 15], from: 'cake', color: '#E8461E' },
  ],
  glyph: [{ at: 7.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'pig', emoji: '🎂', dur: 0.8 },
    { at: 1.8, kind: 'burst', actor: 'f2', emoji: '💨', n: 4, dur: 0.4 },
    { at: 2.95, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.6 },
    { at: 3.9, kind: 'burst', actor: 'f2', emoji: '💨', n: 4, dur: 0.4 },
    { at: 4.5, kind: 'pop', actor: 'pig', emoji: '💢', dur: 0.6 },
    { at: 4.5, kind: 'pop', actor: 'octopus', emoji: '😆', dur: 0.6 },
    { at: 5.7, kind: 'burst', actor: 'cake', emoji: '💨', n: 7, dur: 0.6 },
    { at: 7.0, kind: 'dizzy', actor: 'pig', dur: 1.4 },
    { at: 9.0, kind: 'pop', actor: 'pig', emoji: '😱', dur: 0.8 },
  ],
  camera: [
    { at: 5.1, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 50, y: 60 } },
    { at: 5.7, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.9, say: '糕' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 2.9, sfx: 'blip' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.4, sfx: 'blip' },
    { at: 5.1, sfx: 'gulp' },
    { at: 5.7, sfx: 'whoosh' },
    { at: 5.8, sfx: 'deflate' },
    { at: 6.95, sfx: 'bonk' },
    { at: 7.3, say: '糕' },
    { at: 8.3, say: '蛋糕' },
    { at: 8.7, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
