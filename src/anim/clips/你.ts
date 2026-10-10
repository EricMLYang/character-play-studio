import type { Clip } from '../clip'

// 你：小外星人搭飛碟降落，指著小狗：「你！」小狗嚇得躲到樹後面。外星人想送牠一根骨頭——骨頭被飛碟的光束吸走了；
// 再送一顆球——球也被吸走！外星人氣得踢飛碟一腳，飛碟「噗」吐出骨頭和球，掉成「你」。小狗跑出來咬住骨頭，舔了外星人一下。你、你、謝謝你
const clip: Clip = {
  char: '你',
  meta: { theme: '外星人來了', cast: '小外星人＋小狗＋飛碟', gags: ['禮物被吸走', '踢一腳全吐出來', '終於做朋友'] },
  duration: 10,
  bg: { top: '#1C2752', bottom: '#3A4D8F', floor: '#4A5A7A', scenery: 'night' },
  actors: [
    { id: 'ufo', emoji: '🛸', x: 26, y: 26, size: 26, hidden: true, float: true },
    { id: 'alien', emoji: '👽', x: 26, y: 69.5, size: 17, hidden: true },
    { id: 'tree', emoji: '🌳', x: 146, y: 60, size: 32, hidden: true },
    { id: 'dog', emoji: '🐶', x: 122, y: 69.5, size: 17, hidden: true },
    { id: 'bone', emoji: '🦴', x: 40, y: 66, size: 10, hidden: true, float: true },
    { id: 'ball', emoji: '⚽', x: 40, y: 66, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.1, actor: 'dog', do: 'pop' },
    { at: 0.1, actor: 'ufo', do: 'enter', from: { x: -20, y: 6 }, dur: 0.7 },
    { at: 0.8, actor: 'alien', do: 'pop', dur: 0.3 },
    // 你！——小狗嚇得躲到樹後
    { at: 1.2, actor: 'alien', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 1.6, actor: 'dog', do: 'hop', amount: 6, dur: 0.3 },
    { at: 1.9, actor: 'dog', do: 'moveTo', to: { x: 150, y: 69.5 }, dur: 0.3 },
    // 送骨頭——被飛碟吸走
    { at: 2.6, actor: 'bone', do: 'pop', dur: 0.2 },
    { at: 3.0, actor: 'bone', do: 'moveTo', to: { x: 26, y: 30 }, dur: 0.5 },
    { at: 3.0, actor: 'bone', do: 'spin', dur: 0.5 },
    { at: 3.5, actor: 'bone', do: 'vanish', dur: 0.1 },
    // 送球——也被吸走
    { at: 3.9, actor: 'ball', do: 'pop', dur: 0.2 },
    { at: 4.3, actor: 'ball', do: 'moveTo', to: { x: 26, y: 30 }, dur: 0.5 },
    { at: 4.8, actor: 'ball', do: 'vanish', dur: 0.1 },
    // 氣得踢飛碟——吐出骨頭和球
    { at: 5.2, actor: 'alien', do: 'hop', amount: 14, dur: 0.4 },
    { at: 5.5, actor: 'ufo', do: 'shake', amount: 2, dur: 0.5 },
    { at: 5.5, actor: 'ufo', do: 'squash', amount: -0.3, dur: 0.3 },
    // 小狗跑出來咬住骨頭，舔外星人一下
    { at: 7.6, actor: 'bone', do: 'moveTo', to: { x: 46, y: 72 }, dur: 0.01 },
    { at: 7.62, actor: 'bone', do: 'pop', dur: 0.2 },
    { at: 7.7, actor: 'dog', do: 'moveTo', to: { x: 50, y: 69.5 }, dur: 0.6 },
    { at: 8.6, actor: 'bone', do: 'vanish', dur: 0.1 },
    { at: 8.7, actor: 'dog', do: 'tilt', amount: -15, dur: 0.3 },
    { at: 9.0, actor: 'alien', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 飛碟吐出來的東西：骨頭 → 亻；球 → 尔
    { at: 5.7, dur: 0.5, strokes: [0, 1], from: 'ufo', color: '#7CF29A' },
    { at: 6.0, dur: 0.8, strokes: [2, 3, 4, 5, 6], from: 'ufo', color: '#FFD25A' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'beam', actor: 'ufo', n: 16, dur: 0.5 },
    { at: 1.25, kind: 'pop', actor: 'alien', emoji: '👉', dur: 0.6 },
    { at: 1.7, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.5 },
    { at: 2.9, kind: 'beam', actor: 'ufo', n: 18, dur: 0.6 },
    { at: 4.2, kind: 'beam', actor: 'ufo', n: 18, dur: 0.6 },
    { at: 4.8, kind: 'pop', actor: 'alien', emoji: '💢', dur: 0.5 },
    { at: 5.5, kind: 'burst', actor: 'ufo', emoji: '💥', n: 1, dur: 0.4 },
    { at: 8.7, kind: 'pop', actor: 'alien', emoji: '😆', dur: 0.8 },
    { at: 8.8, kind: 'burst', x: 38, y: 58, emoji: '💕', n: 5, dur: 0.6 },
  ],
  camera: [
    { at: 5.5, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 0.2, sfx: 'whoosh' },
    { at: 1.3, say: '你' },
    { at: 1.9, sfx: 'boing' },
    { at: 3.0, sfx: 'laser' },
    { at: 4.3, sfx: 'laser' },
    { at: 5.5, sfx: 'bonk' },
    { at: 5.7, sfx: 'poof' },
    { at: 6.9, say: '你' },
    { at: 7.85, say: '謝謝你' },
    { at: 8.6, sfx: 'gulp' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
