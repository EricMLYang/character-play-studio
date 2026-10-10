import type { Clip } from '../clip'

// 喜：小狗想讓小貓開心，叼來一根骨頭——小貓扭頭；拖來一顆大球——小貓還是扭頭；推來一個好大的禮物箱！
// 小貓眼睛一亮……跳進空箱子裡，開心到冒出愛心，變成「喜」。小狗把禮物拿出來，小貓根本不看，只喜歡箱子。喜、喜、喜歡
const clip: Clip = {
  char: '喜',
  meta: { theme: '送禮物', cast: '小狗＋小貓＋箱子', gags: ['越送越大', '對方都不理', '只喜歡箱子'] },
  duration: 10,
  bg: { top: '#FFE9F0', bottom: '#FFF7FA', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'cat', emoji: '🐈', x: 140, y: 69.5, size: 18, hidden: true },
    { id: 'box', emoji: '📦', x: 126, y: 68, size: 20, hidden: true },
    { id: 'dog', emoji: '🐶', x: 28, y: 69.5, size: 18, hidden: true },
    { id: 'bone', emoji: '🦴', x: 40, y: 70, size: 10, hidden: true, float: true },
    { id: 'ball', emoji: '⚽', x: 40, y: 70, size: 13, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'cat', do: 'pop' },
    { at: 0.2, actor: 'dog', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 叼來骨頭——小貓扭頭
    { at: 1.0, actor: 'bone', do: 'pop' },
    { at: 1.3, actor: 'dog', do: 'moveTo', to: { x: 112, y: 69.5 }, dur: 0.5 },
    { at: 1.3, actor: 'bone', do: 'moveTo', to: { x: 124, y: 70 }, dur: 0.5 },
    { at: 2.0, actor: 'cat', do: 'flip' },
    { at: 2.6, actor: 'bone', do: 'vanish', dur: 0.2 },
    { at: 2.6, actor: 'dog', do: 'moveTo', to: { x: 28, y: 69.5 }, dur: 0.5 },
    { at: 2.8, actor: 'cat', do: 'flip' },
    // 拖來大球——還是扭頭
    { at: 3.2, actor: 'ball', do: 'pop' },
    { at: 3.4, actor: 'dog', do: 'moveTo', to: { x: 112, y: 69.5 }, dur: 0.5 },
    { at: 3.4, actor: 'ball', do: 'moveTo', to: { x: 126, y: 70 }, dur: 0.5 },
    { at: 4.0, actor: 'cat', do: 'flip' },
    { at: 4.6, actor: 'ball', do: 'vanish', dur: 0.2 },
    { at: 4.6, actor: 'dog', do: 'moveTo', to: { x: 28, y: 69.5 }, dur: 0.5 },
    { at: 4.8, actor: 'cat', do: 'flip' },
    // 推來好大的禮物箱——小貓眼睛一亮，跳進箱子
    { at: 5.1, actor: 'box', do: 'enter', from: { x: 20, y: 68 }, dur: 0.6 },
    { at: 5.1, actor: 'dog', do: 'moveTo', to: { x: 104, y: 69.5 }, dur: 0.6 },
    { at: 7.0, actor: 'dog', do: 'moveTo', to: { x: 26, y: 69.5 }, dur: 0.5 },
    { at: 5.9, actor: 'cat', do: 'flash', dur: 0.5 },
    { at: 6.3, actor: 'cat', do: 'moveTo', to: { x: 126, y: 61.5 }, dur: 0.45, arc: 14 },
    { at: 6.75, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.3 },
    // 小狗把禮物拿出來給牠看——小貓只喜歡箱子
    { at: 8.4, actor: 'bone', do: 'moveTo', to: { x: 36, y: 58 }, dur: 0.01 },
    { at: 8.42, actor: 'bone', do: 'pop', dur: 0.3 },
    { at: 8.5, actor: 'dog', do: 'hop', amount: 4, dur: 0.35 },
    { at: 9.0, actor: 'cat', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 小貓開心到冒出來的愛心：上面的士、豆、口
    { at: 6.8, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: 'cat', color: '#F06292' },
    { at: 7.3, dur: 0.5, strokes: [9, 10, 11], from: 'box', color: '#E3A23A' },
  ],
  glyph: [{ at: 7.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'dog', emoji: '🐱', dur: 0.8 },
    { at: 2.1, kind: 'pop', actor: 'cat', emoji: '😒', dur: 0.6 },
    { at: 2.3, kind: 'sweat', actor: 'dog' },
    { at: 4.1, kind: 'pop', actor: 'cat', emoji: '😒', dur: 0.6 },
    { at: 4.3, kind: 'pop', actor: 'dog', emoji: '😢', dur: 0.5 },
    { at: 5.9, kind: 'pop', actor: 'cat', emoji: '😻', dur: 0.6 },
    { at: 6.75, kind: 'burst', actor: 'cat', emoji: '💕', n: 7, dur: 0.7 },
    { at: 8.6, kind: 'bubble', actor: 'dog', emoji: '❓', dur: 0.8 },
  ],
  camera: [
    { at: 5.9, dur: 1.0, do: 'punch', amount: 0.25, to: { x: 126, y: 58 } },
  ],
  cues: [
    { at: 0.8, say: '喜' },
    { at: 1.3, sfx: 'slide' },
    { at: 2.0, sfx: 'tap' },
    { at: 3.4, sfx: 'slide' },
    { at: 4.0, sfx: 'tap' },
    { at: 5.1, sfx: 'slide' },
    { at: 5.9, sfx: 'blip' },
    { at: 6.75, sfx: 'plop' },
    { at: 7.9, say: '喜' },
    { at: 8.8, say: '喜歡' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
