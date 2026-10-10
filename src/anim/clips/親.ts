import type { Clip } from '../clip'

// 親：小貓把臉貼在魚缸上看金魚，金魚游過來「啾」地親一下玻璃——小貓嚇得往後跳。小貓再靠過去，金魚又親一下，
// 小貓又嚇一跳！第三次金魚直接跳出魚缸，在小貓鼻子上親一下——愛心冒出來變成「親」，小貓整隻融化倒下。親、親、親一下
const clip: Clip = {
  char: '親',
  meta: { theme: '魚缸', cast: '小貓＋金魚', gags: ['隔著玻璃嚇一跳', '越靠越近', '真的親到了融化'] },
  duration: 10,
  bg: { top: '#E3F4FF', bottom: '#F7FBFF', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'table', emoji: '🪑', x: 140, y: 69, size: 18, hidden: true },
    { id: 'bowl', emoji: '🫙', x: 140, y: 54, size: 18, hidden: true, float: true, tint: 'brightness(1.05) saturate(.6)' },
    { id: 'fish', emoji: '🐠', x: 140, y: 54, size: 9, hidden: true, float: true },
    { id: 'cat', emoji: '🐱', x: 70, y: 69.5, size: 18, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'table', do: 'pop' },
    { at: 0.1, actor: 'bowl', do: 'pop' },
    { at: 0.2, actor: 'fish', do: 'pop' },
    { at: 0.3, actor: 'fish', do: 'bounce', amount: 1.5, times: 3, dur: 1.2 },
    { at: 0.2, actor: 'cat', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.7 },
    // 小貓跳上來貼著魚缸看
    { at: 1.2, actor: 'cat', do: 'moveTo', to: { x: 124, y: 56 }, dur: 0.5, arc: 10 },
    // 金魚游過來親一下玻璃——小貓往後跳
    { at: 2.1, actor: 'fish', do: 'moveTo', to: { x: 134, y: 55 }, dur: 0.3 },
    { at: 2.4, actor: 'fish', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.55, actor: 'cat', do: 'moveTo', to: { x: 112, y: 56 }, dur: 0.3, arc: 6 },
    { at: 2.85, actor: 'fish', do: 'moveTo', to: { x: 142, y: 54 }, dur: 0.4 },
    // 再靠過去，金魚又親一下——又嚇一跳
    { at: 3.6, actor: 'cat', do: 'moveTo', to: { x: 124, y: 56 }, dur: 0.4 },
    { at: 4.0, actor: 'fish', do: 'moveTo', to: { x: 134, y: 55 }, dur: 0.25 },
    { at: 4.25, actor: 'fish', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.4, actor: 'cat', do: 'hop', amount: 10, dur: 0.4 },
    // 第三次：金魚跳出魚缸，在小貓鼻子上親一下
    { at: 5.2, actor: 'fish', do: 'moveTo', to: { x: 127, y: 54 }, dur: 0.5, arc: 14 },
    { at: 5.2, actor: 'fish', do: 'spin', dur: 0.5 },
    { at: 5.7, actor: 'fish', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.95, actor: 'fish', do: 'moveTo', to: { x: 140, y: 54 }, dur: 0.5, arc: 12 },
    // 小貓整隻融化倒下
    { at: 6.1, actor: 'cat', do: 'flash', dur: 0.5 },
    { at: 6.6, actor: 'cat', do: 'moveTo', to: { x: 114, y: 69.5 }, dur: 0.4, arc: 4 },
    { at: 7.0, actor: 'cat', do: 'squash', amount: 0.4, dur: 0.5 },
    { at: 7.5, actor: 'cat', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 7.5, actor: 'cat', do: 'moveTo', to: { x: 120, y: 67 }, dur: 0.3 },
    { at: 9.0, actor: 'fish', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 親下去冒出來的愛心：左邊的亲、右邊的見
    { at: 5.8, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: 'cat', color: '#F06292' },
    { at: 6.3, dur: 0.7, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'fish', color: '#EF6C00' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.7, kind: 'bubble', actor: 'cat', emoji: '🐠', dur: 0.6 },
    { at: 2.4, kind: 'pop', actor: 'fish', emoji: '💋', dur: 0.5, dx: -8 },
    { at: 2.6, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.5 },
    { at: 4.25, kind: 'pop', actor: 'fish', emoji: '💋', dur: 0.5, dx: -8 },
    { at: 4.45, kind: 'pop', actor: 'cat', emoji: '😳', dur: 0.6 },
    { at: 5.75, kind: 'burst', actor: 'cat', emoji: '💕', n: 7, dur: 0.7 },
    { at: 7.6, kind: 'zzz', actor: 'cat', emoji: '💕', dur: 2.2 },
  ],
  camera: [
    { at: 5.5, dur: 1.0, do: 'punch', amount: 0.3, to: { x: 128, y: 54 } },
  ],
  cues: [
    { at: 1.3, say: '親' },
    { at: 2.4, sfx: 'blip' },
    { at: 2.55, sfx: 'boing' },
    { at: 4.25, sfx: 'blip' },
    { at: 4.4, sfx: 'boing' },
    { at: 5.2, sfx: 'splash' },
    { at: 5.7, sfx: 'blip' },
    { at: 7.1, say: '親' },
    { at: 8.0, say: '親一下' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
