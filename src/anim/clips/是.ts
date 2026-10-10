import type { Clip } from '../clip'

// 是：蛋糕被偷吃了一口！小豬偵探拿放大鏡找犯人：是你嗎？小狗搖頭；是你嗎？小貓搖頭。
// 放大鏡一照——地上的奶油腳印……一路通到偵探自己腳下！牠嘴邊還有奶油。大家嚇一跳，放大鏡和腳印變成「是」。小豬害羞地舉手：「是我。」是、是、就是
const clip: Clip = {
  char: '是',
  meta: { theme: '偵探辦案', cast: '小豬偵探＋小狗＋小貓＋蛋糕', gags: ['問每個人', '其實就是自己'] },
  duration: 10,
  bg: { top: '#FFF1DB', bottom: '#FFF9F0', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'cake', emoji: '🍰', x: 80, y: 70, size: 15, hidden: true },
    { id: 'dog', emoji: '🐶', x: 118, y: 69.5, size: 17, hidden: true },
    { id: 'cat', emoji: '🐱', x: 142, y: 69.5, size: 17, hidden: true },
    { id: 'pig', emoji: '🐷', x: 34, y: 69.5, size: 19, hidden: true, flip: true },
    { id: 'glass', emoji: '🔍', x: 46, y: 60, size: 11, hidden: true, float: true },
    { id: 'steps', emoji: '👣', x: 60, y: 76, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cake', do: 'pop' },
    { at: 0.1, actor: 'dog', do: 'pop' },
    { at: 0.2, actor: 'cat', do: 'pop' },
    { at: 0.4, actor: 'pig', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    { at: 0.6, actor: 'glass', do: 'pop' },
    // 是你嗎？小狗搖頭
    { at: 1.6, actor: 'pig', do: 'moveTo', to: { x: 96, y: 69.5 }, dur: 0.5 },
    { at: 1.6, actor: 'glass', do: 'moveTo', to: { x: 108, y: 60 }, dur: 0.5 },
    { at: 2.3, actor: 'dog', do: 'shake', amount: 1.5, dur: 0.5 },
    // 是你嗎？小貓搖頭
    { at: 3.0, actor: 'glass', do: 'moveTo', to: { x: 134, y: 60 }, dur: 0.4 },
    { at: 3.5, actor: 'cat', do: 'shake', amount: 1.5, dur: 0.5 },
    // 放大鏡往地上一照——腳印通到自己腳下
    { at: 4.3, actor: 'glass', do: 'moveTo', to: { x: 70, y: 72 }, dur: 0.5 },
    { at: 4.5, actor: 'steps', do: 'pop', dur: 0.3 },
    { at: 4.9, actor: 'steps', do: 'moveTo', to: { x: 90, y: 76 }, dur: 0.5 },
    { at: 4.9, actor: 'glass', do: 'moveTo', to: { x: 96, y: 72 }, dur: 0.5 },
    // 大家嚇一跳——嘴邊有奶油
    { at: 5.6, actor: 'dog', do: 'hop', amount: 6, dur: 0.3 },
    { at: 5.6, actor: 'cat', do: 'hop', amount: 6, dur: 0.3 },
    { at: 5.6, actor: 'pig', do: 'hop', amount: 8, dur: 0.35 },
    { at: 5.9, actor: 'glass', do: 'vanish', dur: 0.15 },
    { at: 5.9, actor: 'steps', do: 'vanish', dur: 0.15 },
    { at: 6.1, actor: 'pig', do: 'moveTo', to: { x: 28, y: 69.5 }, dur: 0.4 },
    { at: 6.1, actor: 'cake', do: 'moveTo', to: { x: 42, y: 70 }, dur: 0.4 },
    // 害羞地舉手：是我
    { at: 8.3, actor: 'pig', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 8.9, actor: 'pig', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 放大鏡 → 日；腳印 → 下面
    { at: 5.95, dur: 0.5, strokes: [0, 1, 2, 3], from: 'glass', color: '#3D7DD8' },
    { at: 6.3, dur: 0.7, strokes: [4, 5, 6, 7, 8], from: 'steps', color: '#8A5A3B' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'cake', emoji: '❗', dur: 0.7 },
    { at: 1.1, kind: 'bubble', actor: 'pig', emoji: '🕵️', dur: 0.6 },
    { at: 2.2, kind: 'bubble', actor: 'pig', emoji: '❓', dur: 0.6 },
    { at: 2.4, kind: 'pop', actor: 'dog', emoji: '🙅', dur: 0.5 },
    { at: 3.6, kind: 'pop', actor: 'cat', emoji: '🙅', dur: 0.5 },
    { at: 5.6, kind: 'pop', actor: 'dog', emoji: '😮', dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'cat', emoji: '😮', dur: 0.6 },
    { at: 5.7, kind: 'pop', actor: 'pig', emoji: '😳', dur: 0.7 },
    { at: 8.4, kind: 'pop', actor: 'pig', emoji: '😅', dur: 0.9 },
    { at: 8.6, kind: 'sweat', actor: 'pig' },
  ],
  camera: [
    { at: 4.9, dur: 1.0, do: 'punch', amount: 0.25, to: { x: 94, y: 66 } },
  ],
  cues: [
    { at: 1.2, say: '是' },
    { at: 2.3, sfx: 'tap' },
    { at: 3.5, sfx: 'tap' },
    { at: 4.5, sfx: 'blip' },
    { at: 5.6, sfx: 'boing' },
    { at: 7.1, say: '是' },
    { at: 8.0, say: '就是' },
    { at: 8.4, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
