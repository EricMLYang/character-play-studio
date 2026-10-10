import type { Clip } from '../clip'

// 飯：熊貓挑戰用筷子夾一粒米。夾起來——滑掉；用力夾——米粒被彈飛到畫面外；旁邊的小老鼠卻夾得超優雅。熊貓氣到用力一戳，
// 整碗飯噴上天變成「飯」。最後熊貓乾脆捧碗大口吃飯，鼻子上黏了一粒米，牠鬥雞眼想夾，小老鼠跳上來先夾走了。飯、飯、吃飯
const clip: Clip = {
  char: '飯',
  meta: { theme: '筷子挑戰', cast: '熊貓＋小老鼠＋一粒米', gags: ['夾不起來漸強', '小的比大的厲害', '一戳噴上天', '最後一粒被搶走'] },
  duration: 10,
  bg: { top: '#EAF7E0', bottom: '#C6E6B2', floor: '#8DB36B', scenery: 'forest' },
  actors: [
    { id: 'mouse', emoji: '🐭', x: 14, y: 73.2, size: 8.8, hidden: true },
    { id: 'panda', emoji: '🐼', x: 36, y: 69.6, size: 17.5, hidden: true },
    { id: 'bowl', emoji: '🍚', x: 58, y: 72.3, size: 11.2, hidden: true },
    { id: 'grain', emoji: '⚪', x: 58, y: 66, size: 3.2, hidden: true, float: true },
    { id: 'sticks', emoji: '🥢', x: 48, y: 62, size: 11.2, hidden: true, float: true },
    { id: 'nose', emoji: '⚪', x: 36, y: 63, size: 3.2, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'panda', do: 'enter', from: { x: -12, y: 69.6 }, dur: 0.6 },
    { at: 0.3, actor: 'bowl', do: 'pop' },
    { at: 0.5, actor: 'mouse', do: 'pop' },
    { at: 0.6, actor: 'sticks', do: 'pop' },
    // 第一次：夾起來……滑掉
    { at: 1.2, actor: 'sticks', do: 'moveTo', to: { x: 58, y: 64 }, dur: 0.3 },
    { at: 1.52, actor: 'grain', do: 'pop', dur: 0.1 },
    { at: 1.52, actor: 'grain', do: 'moveTo', to: { x: 51, y: 57 }, dur: 0.4 },
    { at: 1.52, actor: 'sticks', do: 'moveTo', to: { x: 51, y: 55 }, dur: 0.4 },
    { at: 2.01, actor: 'grain', do: 'moveTo', to: { x: 62, y: 72 }, dur: 0.35, arc: 4 },
    { at: 2.01, actor: 'sticks', do: 'shake', amount: 0.8, dur: 0.3 },
    // 第二次：用力夾，米粒彈飛
    { at: 2.71, actor: 'sticks', do: 'moveTo', to: { x: 61, y: 64 }, dur: 0.2 },
    { at: 2.71, actor: 'panda', do: 'squash', amount: -0.2, dur: 0.5 },
    { at: 2.98, actor: 'sticks', do: 'shake', amount: 2, dur: 0.4 },
    { at: 3.41, actor: 'grain', do: 'moveTo', to: { x: -10, y: 30 }, dur: 0.6, arc: 20 },
    { at: 3.41, actor: 'grain', do: 'spin', dur: 0.6, times: 3 },
    { at: 3.47, actor: 'sticks', do: 'moveTo', to: { x: 48, y: 60 }, dur: 0.3 },
    // 小老鼠夾得好優雅
    { at: 4.01, actor: 'mouse', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 第三次：氣到用力一戳，整碗飯噴上天
    { at: 4.66, actor: 'sticks', do: 'scaleTo', amount: 1.6, dur: 0.3 },
    { at: 4.66, actor: 'panda', do: 'flash', dur: 0.4 },
    { at: 5.03, actor: 'sticks', do: 'moveTo', to: { x: 58, y: 66 }, dur: 0.12 },
    { at: 5.16, actor: 'bowl', do: 'hop', amount: 14, dur: 0.5 },
    { at: 5.16, actor: 'bowl', do: 'spin', dur: 0.5 },
    { at: 5.8, actor: 'sticks', do: 'vanish', dur: 0.2 },
    // 乾脆捧碗大口吃
    { at: 6.9, actor: 'bowl', do: 'moveTo', to: { x: 46, y: 64 }, dur: 0.35, arc: 4 },
    { at: 7.3, actor: 'bowl', do: 'tilt', amount: -30, dur: 0.6 },
    { at: 7.3, actor: 'panda', do: 'shake', amount: 1, dur: 0.6 },
    { at: 7.95, actor: 'bowl', do: 'moveTo', to: { x: 48, y: 72.3 }, dur: 0.3 },
    // 鼻子上黏一粒米，小老鼠先夾走
    { at: 8.39, actor: 'nose', do: 'pop', dur: 0.15 },
    { at: 8.57, actor: 'panda', do: 'tilt', amount: 8, dur: 0.5 },
    { at: 8.97, actor: 'mouse', do: 'moveTo', to: { x: 33, y: 60 }, dur: 0.3, arc: 8 },
    { at: 9.24, actor: 'nose', do: 'vanish', dur: 0.1 },
    { at: 9.29, actor: 'mouse', do: 'moveTo', to: { x: 14, y: 72.3 }, dur: 0.3, arc: 6 },
  ],
  builds: [
    // 噴上天的飯 → 食；被戳飛的筷子 → 反
    { at: 5.25, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'bowl', color: '#E8A33D' },
    { at: 5.85, dur: 0.6, strokes: [8, 9, 10, 11], from: 'sticks', color: '#C0392B' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'panda', emoji: '🤤', dur: 0.6 },
    { at: 2.39, kind: 'pop', actor: 'panda', emoji: '😑', dur: 0.4 },
    { at: 3.68, kind: 'sweat', actor: 'panda' },
    { at: 4.01, kind: 'burst', actor: 'mouse', emoji: '✨', n: 5, dur: 0.5, dx: 6 },
    { at: 4.12, kind: 'bubble', actor: 'mouse', emoji: '🥢', dur: 0.6 },
    { at: 4.55, kind: 'pop', actor: 'panda', emoji: '😤', dur: 0.4 },
    { at: 5.16, kind: 'fountain', actor: 'bowl', emoji: '⚪', n: 10, dur: 0.8 },
    { at: 5.16, kind: 'burst', actor: 'bowl', dur: 0.4 },
    { at: 7.4, kind: 'burst', actor: 'panda', emoji: '⚪', n: 6, dur: 0.5 },
    { at: 8.04, kind: 'bubble', actor: 'panda', emoji: '😋', dur: 0.5 },
    { at: 8.48, kind: 'pop', actor: 'panda', emoji: '👀', dur: 0.5, dx: 4 },
    { at: 9.46, kind: 'bubble', actor: 'mouse', emoji: '😋', dur: 0.6 },
    { at: 9.46, kind: 'pop', actor: 'panda', emoji: '😑', dur: 0.6 },
  ],
  camera: [
    { at: 5.16, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.2, sfx: 'tap' },
    { at: 1.58, say: '飯' },
    { at: 2.01, sfx: 'plop' },
    { at: 2.98, sfx: 'tap' }, { at: 3.14, sfx: 'tap' },
    { at: 3.41, sfx: 'boing' },
    { at: 4.01, sfx: 'blip' },
    { at: 5.16, sfx: 'poof' },
    { at: 6.5, say: '飯' },
    { at: 7.5, say: '吃飯' },
    { at: 7.86, sfx: 'gulp' },
    { at: 8.97, sfx: 'whoosh' },
    { at: 9.24, sfx: 'clink' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
