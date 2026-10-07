import type { Clip } from '../clip'

// 推：無尾熊想推那台推車，可是前面擋著一排書。輕輕推，不動；用力推，還是不動；後退衝刺一撞——書骨牌一路倒，
// 最後一本撞飛推車。推車又從右邊衝回來，把無尾熊鏟走。回來之後牠再推推車一下……又推不動了。推、推、推車
const clip: Clip = {
  char: '推',
  meta: { theme: '骨牌連鎖', cast: '無尾熊＋推車', gags: ['推不動', '骨牌連鎖', '被自己推的東西載走', '又推不動'] },
  duration: 10,
  bg: { top: '#F2F8E6', bottom: '#DCEAC6', floor: '#C9A784', scenery: 'room' },
  actors: [
    { id: 'b1', emoji: '📕', x: 38, y: 73.2, size: 9, hidden: true },
    { id: 'b2', emoji: '📗', x: 50, y: 73.2, size: 9, hidden: true },
    { id: 'b3', emoji: '📘', x: 62, y: 73.2, size: 9, hidden: true },
    { id: 'b4', emoji: '📙', x: 74, y: 73.2, size: 9, hidden: true },
    { id: 'b5', emoji: '📕', x: 86, y: 73.2, size: 9, hidden: true },
    { id: 'b6', emoji: '📗', x: 98, y: 73.2, size: 9, hidden: true },
    { id: 'cart', emoji: '🛒', x: 116, y: 72.4, size: 11, hidden: true },
    { id: 'koala', emoji: '🐨', x: 24, y: 72, size: 12, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'b1', do: 'pop' }, { at: 0.06, actor: 'b2', do: 'pop' }, { at: 0.12, actor: 'b3', do: 'pop' },
    { at: 0.18, actor: 'b4', do: 'pop' }, { at: 0.24, actor: 'b5', do: 'pop' }, { at: 0.3, actor: 'b6', do: 'pop' },
    { at: 0.3, actor: 'cart', do: 'pop' },
    { at: 0, actor: 'koala', do: 'enter', dur: 0.6 },
    // 輕輕推：不動
    { at: 1.4, actor: 'koala', do: 'moveTo', to: { x: 30, y: 72 }, dur: 0.15 },
    { at: 1.55, actor: 'koala', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.55, actor: 'b1', do: 'tilt', amount: 4, dur: 0.25 },
    // 用力推：還是不動
    { at: 2.3, actor: 'koala', do: 'squash', amount: 0.4, dur: 0.6 },
    { at: 2.3, actor: 'koala', do: 'shake', dur: 0.6, amount: 0.6 },
    { at: 2.3, actor: 'b1', do: 'shake', dur: 0.6, amount: 0.4 },
    // 後退、衝刺、撞！
    { at: 3.1, actor: 'koala', do: 'moveTo', to: { x: 14, y: 72 }, dur: 0.3 },
    { at: 3.4, actor: 'koala', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 3.55, actor: 'koala', do: 'moveTo', to: { x: 31, y: 72 }, dur: 0.15 },
    { at: 3.7, actor: 'koala', do: 'squash', amount: 0.4, dur: 0.2 },
    { at: 3.7, actor: 'b1', do: 'rotateTo', amount: 80, dur: 0.18 },
    { at: 3.82, actor: 'b2', do: 'rotateTo', amount: 80, dur: 0.18 },
    { at: 3.94, actor: 'b3', do: 'rotateTo', amount: 80, dur: 0.18 },
    { at: 4.06, actor: 'b4', do: 'rotateTo', amount: 80, dur: 0.18 },
    { at: 4.18, actor: 'b5', do: 'rotateTo', amount: 80, dur: 0.18 },
    { at: 4.3, actor: 'b6', do: 'rotateTo', amount: 80, dur: 0.18 },
    { at: 4.45, actor: 'cart', do: 'moveTo', to: { x: 185, y: 72.4 }, dur: 0.5 },
    { at: 4.6, actor: 'b1', do: 'vanish' }, { at: 4.65, actor: 'b2', do: 'vanish' }, { at: 4.7, actor: 'b3', do: 'vanish' },
    { at: 4.75, actor: 'b4', do: 'vanish' }, { at: 4.8, actor: 'b5', do: 'vanish' }, { at: 4.85, actor: 'b6', do: 'vanish' },
    { at: 4.7, actor: 'koala', do: 'moveTo', to: { x: 20, y: 72 }, dur: 0.3 },
    // 推車又衝回來，把無尾熊鏟走
    { at: 6.12, actor: 'cart', do: 'moveTo', to: { x: 22, y: 72.4 }, dur: 0.35 },
    { at: 6.47, actor: 'koala', do: 'moveTo', to: { x: 22, y: 64 }, dur: 0.15 },
    { at: 6.47, actor: 'cart', do: 'moveTo', to: { x: -20, y: 72.4 }, dur: 0.4 },
    { at: 6.62, actor: 'koala', do: 'moveTo', to: { x: -20, y: 64 }, dur: 0.25 },
    { at: 6.62, actor: 'koala', do: 'spin', dur: 0.25 },
    // 回來了，再推一下……推不動
    { at: 8.0, actor: 'cart', do: 'moveTo', to: { x: 36, y: 72.4 }, dur: 0.5 },
    { at: 8.0, actor: 'koala', do: 'moveTo', to: { x: 22, y: 72 }, dur: 0.5 },
    { at: 8.7, actor: 'koala', do: 'moveTo', to: { x: 27, y: 72 }, dur: 0.12 },
    { at: 8.82, actor: 'koala', do: 'squash', amount: 0.35, dur: 0.4 },
    { at: 8.82, actor: 'cart', do: 'shake', dur: 0.4, amount: 0.4 },
  ],
  builds: [
    // 倒下的書 → 右邊的隹；無尾熊推的那隻手 → 扌
    { at: 4.6, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8, 9, 10], from: { x: 70, y: 71 }, color: '#3B7DD8' },
    { at: 5.2, dur: 0.5, strokes: [0, 1, 2], from: 'koala', color: '#E2742C' },
  ],
  glyph: [{ at: 5.8, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'koala', emoji: '🛒', dur: 0.7 },
    { at: 2.9, kind: 'sweat', actor: 'koala' },
    { at: 3.55, kind: 'puff', actor: 'koala' },
    { at: 4.45, kind: 'burst', x: 112, y: 68, dur: 0.4 },
    { at: 5.2, kind: 'bubble', actor: 'koala', emoji: '😮', dur: 0.5 },
    { at: 6.47, kind: 'pop', actor: 'koala', emoji: '❗', dur: 0.3 },
    { at: 9.2, kind: 'bubble', actor: 'koala', emoji: '😑', dur: 0.8 },
  ],
  camera: [
    { at: 3.7, dur: 0.9, do: 'punch', amount: 0.15, to: { x: 64, y: 66 } },
  ],
  cues: [
    { at: 1.55, say: '推' },
    { at: 2.3, sfx: 'deflate' },
    { at: 3.55, sfx: 'whoosh' },
    { at: 3.7, sfx: 'tap' }, { at: 3.94, sfx: 'tap' }, { at: 4.18, sfx: 'tap' },
    { at: 4.45, sfx: 'bonk' },
    { at: 5.75, say: '推' },
    { at: 6.12, sfx: 'whoosh' },
    { at: 6.7, say: '推車' },
    { at: 8.82, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
