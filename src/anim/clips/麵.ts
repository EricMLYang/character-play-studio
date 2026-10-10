import type { Clip } from '../clip'

// 麵：老虎在拉麵店吸麵，吸啊吸，麵條怎麼都吸不完——原來另一頭在對面小狗的嘴裡！兩個一起用力吸，越吸越靠近，
// 鼻子「咚」撞在一起，麵條斷掉變成「麵」。廚師端出新的一碗拉起麵條，小狗一口氣吸光，連廚師的帽子都吸走了。麵、麵、麵條
const clip: Clip = {
  char: '麵',
  meta: { theme: '拉麵店', cast: '老虎＋小狗＋廚師', gags: ['吸不完', '另一頭在別人嘴裡', '越吸越近撞鼻子', '連帽子都吸走'] },
  duration: 10,
  bg: { top: '#FFF4D6', bottom: '#FFE0A6', floor: '#B5835A', scenery: 'room' },
  actors: [
    { id: 'bowlA', emoji: '🍜', x: 42, y: 72.3, size: 11.2, hidden: true },
    { id: 'bowlB', emoji: '🍜', x: 114, y: 72.3, size: 11.2, hidden: true },
    { id: 'tiger', emoji: '🐯', x: 26, y: 69.6, size: 17.5, hidden: true },
    { id: 'dog', emoji: '🐶', x: 128, y: 69.6, size: 17.5, hidden: true },
    { id: 'chef', emoji: '👨‍🍳', x: 149, y: 70.2, size: 16.2, hidden: true },
    { id: 'chefBowl', emoji: '🍜', x: 141, y: 60, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tiger', do: 'pop' },
    { at: 0.1, actor: 'bowlA', do: 'pop' },
    { at: 0.3, actor: 'dog', do: 'pop' },
    { at: 0.4, actor: 'bowlB', do: 'pop' },
    { at: 0.5, actor: 'chef', do: 'pop' },
    // 吸啊吸
    { at: 1.1, actor: 'tiger', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 1.53, actor: 'tiger', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 1.96, actor: 'tiger', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 2.39, actor: 'bowlA', do: 'shake', amount: 1, dur: 0.4 },
    // 另一頭在小狗嘴裡：拔河
    { at: 3.37, actor: 'tiger', do: 'moveTo', to: { x: 46, y: 69.6 }, dur: 0.4 },
    { at: 3.37, actor: 'dog', do: 'moveTo', to: { x: 112, y: 69.6 }, dur: 0.4 },
    { at: 3.37, actor: 'tiger', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 3.37, actor: 'dog', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 3.97, actor: 'tiger', do: 'moveTo', to: { x: 64, y: 69.6 }, dur: 0.4 },
    { at: 3.97, actor: 'dog', do: 'moveTo', to: { x: 96, y: 69.6 }, dur: 0.4 },
    { at: 3.97, actor: 'tiger', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 3.97, actor: 'dog', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 4.56, actor: 'tiger', do: 'moveTo', to: { x: 74, y: 69.6 }, dur: 0.3 },
    { at: 4.56, actor: 'dog', do: 'moveTo', to: { x: 86, y: 69.6 }, dur: 0.3 },
    // 咚！鼻子撞在一起，彈回去
    { at: 4.94, actor: 'tiger', do: 'moveTo', to: { x: 26, y: 69.6 }, dur: 0.5, arc: 10 },
    { at: 4.94, actor: 'dog', do: 'moveTo', to: { x: 128, y: 69.6 }, dur: 0.5, arc: 10 },
    { at: 4.94, actor: 'tiger', do: 'spin', dur: 0.5 },
    { at: 4.94, actor: 'dog', do: 'spin', dur: 0.5 },
    // 廚師端出新的一碗
    { at: 7.2, actor: 'chefBowl', do: 'pop' },
    { at: 7.5, actor: 'chef', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 7.87, actor: 'tiger', do: 'hop', amount: 3, dur: 0.3 },
    // 小狗一口吸光，連帽子都吸走
    { at: 8.49, actor: 'dog', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 8.8, actor: 'dog', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 9.07, actor: 'chefBowl', do: 'vanish', dur: 0.15 },
    { at: 9.16, actor: 'chef', do: 'swap', emoji: '👨‍🦲' },
    { at: 9.16, actor: 'chef', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.2, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.3 },
  ],
  builds: [
    // 斷掉的麵條 → 麥；灑下來的麵條 → 面
    { at: 5.05, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], from: { x: 80, y: 62 }, color: '#E9A21F' },
    { at: 5.7, dur: 0.9, strokes: [11, 12, 13, 14, 15, 16, 17, 18, 19], from: { x: 80, y: 62 }, style: 'drop', color: '#D9572B' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'tiger', emoji: '🤤', dur: 0.6 },
    { at: 1, kind: 'line', actor: 'tiger', target: 'bowlA', dy: 1, color: '#F5C542', width: 1.1, dur: 1.9 },
    { at: 2.5, kind: 'sweat', actor: 'tiger' },
    { at: 2.83, kind: 'line', actor: 'tiger', target: 'dog', dy: 1, color: '#F5C542', width: 1.1, dur: 1.95 },
    { at: 2.94, kind: 'pop', actor: 'tiger', emoji: '❗', dur: 0.4 },
    { at: 2.94, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
    { at: 4.89, kind: 'burst', x: 80, y: 62, dur: 0.4 },
    { at: 5.5, kind: 'dizzy', actor: 'tiger', dur: 0.9 },
    { at: 5.5, kind: 'dizzy', actor: 'dog', dur: 0.9 },
    { at: 7.2, kind: 'zzz', actor: 'chefBowl', emoji: '♨️', dur: 1.2 },
    { at: 7.3, kind: 'line', actor: 'chefBowl', to: { x: 141, y: 40 }, color: '#F5C542', width: 1.1, dur: 1.2 },
    { at: 7.87, kind: 'pop', actor: 'tiger', emoji: '🤤', dur: 0.5 },
    { at: 8.49, kind: 'line', actor: 'dog', target: 'chefBowl', dy: 1, color: '#F5C542', width: 1.1, dur: 0.7 },
    { at: 9.16, kind: 'burst', actor: 'chef', emoji: '💨', n: 5, dur: 0.4, dx: -10 },
    { at: 9.24, kind: 'pop', actor: 'chef', emoji: '😳', dur: 0.6, dx: -10 },
    { at: 9.29, kind: 'bubble', actor: 'tiger', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.89, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 80, y: 62 } },
    { at: 4.94, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.1, sfx: 'slide' },
    { at: 1.53, say: '麵' },
    { at: 1.96, sfx: 'slide' },
    { at: 3.37, sfx: 'slide' }, { at: 3.97, sfx: 'slide' },
    { at: 4.94, sfx: 'boing' },
    { at: 5.05, sfx: 'crack' },
    { at: 6.65, say: '麵' },
    { at: 7.6, say: '麵條' },
    { at: 8.49, sfx: 'slide' },
    { at: 9.07, sfx: 'gulp' },
    { at: 9.16, sfx: 'poof' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
