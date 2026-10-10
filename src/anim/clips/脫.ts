import type { Clip } from '../clip'

// 脫：小蛇好癢，扭一扭「咻」地脫下一層皮溜走了。老鼠、青蛙、大象一個個經過，都被那條空空的蛇皮嚇得跳起來逃跑。
// 小蛇回來又脫了一次皮，轉頭看到自己的蛇皮——連牠自己都嚇跑了；大象正在笑，空蛇皮動了一下，大象又嚇一跳。脫、脫、脫皮
const clip: Clip = {
  char: '脫',
  meta: { theme: '沙漠蛇脫皮', cast: '小蛇＋空蛇皮＋老鼠＋青蛙＋大象', gags: ['空殼嚇人', '一個比一個大隻都被嚇跑', '連自己都被嚇到', '空皮又動了一下'] },
  duration: 10,
  bg: { top: '#FFF3D9', bottom: '#FFD9A0', floor: '#E3B26B', scenery: 'desert' },
  actors: [
    { id: 'skin', emoji: '🐍', x: 30, y: 69.6, size: 17.5, hidden: true, tint: 'grayscale(1) brightness(1.55) opacity(.7)' },
    { id: 'skin2', emoji: '🐍', x: 22, y: 69.6, size: 17.5, hidden: true, tint: 'grayscale(1) brightness(1.55) opacity(.7)' },
    { id: 'snake', emoji: '🐍', x: 30, y: 69.6, size: 17.5, hidden: true },
    { id: 'mouse', emoji: '🐁', x: 70, y: 72.8, size: 10, hidden: true },
    { id: 'frog', emoji: '🐸', x: 82, y: 71.2, size: 13.8, hidden: true },
    { id: 'ele', emoji: '🐘', x: 140, y: 67.8, size: 22, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'snake', do: 'pop' },
    { at: 0.4, actor: 'snake', do: 'shake', amount: 1.5, dur: 0.6 },
    // 扭一扭，咻！脫下一層皮
    { at: 1, actor: 'snake', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.31, actor: 'skin', do: 'pop', dur: 0.05 },
    { at: 1.31, actor: 'snake', do: 'moveTo', to: { x: 14, y: 69.6 }, dur: 0.3 },
    { at: 1.36, actor: 'snake', do: 'flash', dur: 0.6 },
    { at: 2.01, actor: 'snake', do: 'moveTo', to: { x: -15, y: 69.6 }, dur: 0.45 },
    // 老鼠嚇跑
    { at: 2.38, actor: 'mouse', do: 'enter', from: { x: 175, y: 72.8 }, dur: 0.5 },
    { at: 3.03, actor: 'mouse', do: 'hop', amount: 10, dur: 0.4 },
    { at: 3.46, actor: 'mouse', do: 'flip' },
    { at: 3.46, actor: 'mouse', do: 'moveTo', to: { x: 180, y: 72.8 }, dur: 0.35 },
    // 青蛙嚇跑
    { at: 3.35, actor: 'frog', do: 'enter', from: { x: 178, y: 71.2 }, dur: 0.5 },
    { at: 4, actor: 'frog', do: 'hop', amount: 18, dur: 0.45 },
    { at: 4, actor: 'frog', do: 'spin', dur: 0.45 },
    { at: 4.54, actor: 'frog', do: 'moveTo', to: { x: 182, y: 71.2 }, dur: 0.35 },
    // 大象也嚇到跳起來，落地咚！
    { at: 4.22, actor: 'ele', do: 'enter', from: { x: 185, y: 67.8 }, dur: 0.5 },
    { at: 4.86, actor: 'ele', do: 'hop', amount: 12, dur: 0.45 },
    { at: 5.35, actor: 'ele', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.4, actor: 'skin', do: 'hop', amount: 12, dur: 0.3 },
    { at: 5.45, actor: 'skin', do: 'vanish', dur: 0.25 },
    // 小蛇回來，又脫一次皮
    { at: 6.7, actor: 'snake', do: 'moveTo', to: { x: 22, y: 69.6 }, dur: 0.5 },
    { at: 7.3, actor: 'snake', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 7.55, actor: 'skin2', do: 'pop', dur: 0.05 },
    { at: 7.55, actor: 'snake', do: 'moveTo', to: { x: 38, y: 69.6 }, dur: 0.3 },
    { at: 7.6, actor: 'snake', do: 'flash', dur: 0.6 },
    // 回頭看到自己的皮：嚇得跳過蛇皮逃走
    { at: 8.22, actor: 'snake', do: 'flip' },
    { at: 8.49, actor: 'snake', do: 'hop', amount: 12, dur: 0.4 },
    { at: 8.89, actor: 'snake', do: 'moveTo', to: { x: -20, y: 69.6 }, arc: 18, dur: 0.5 },
    { at: 8.89, actor: 'snake', do: 'spin', dur: 0.5 },
    // 大象在笑……空皮動了一下
    { at: 9.29, actor: 'skin2', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.51, actor: 'ele', do: 'hop', amount: 8, dur: 0.35 },
    { at: 9.51, actor: 'ele', do: 'shake', amount: 1.5, dur: 0.5 },
  ],
  builds: [
    // 被震飛的蛇皮 → 月；大象一跺腳，沙子掉下來 → 兌
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2, 3], from: 'skin', color: '#4E9A3A' },
    { at: 5.65, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9, 10], from: { x: 110, y: 20 }, style: 'drop', color: '#C2410C' },
  ],
  glyph: [{ at: 6.55, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'snake', emoji: '😣', dur: 0.6 },
    { at: 1.52, kind: 'burst', actor: 'snake', emoji: '✨', n: 5, dur: 0.4, dx: 8 },
    { at: 1.74, kind: 'pop', actor: 'snake', emoji: '😏', dur: 0.4 },
    { at: 2.98, kind: 'pop', actor: 'mouse', emoji: '😱', dur: 0.5 },
    { at: 3.95, kind: 'pop', actor: 'frog', emoji: '😱', dur: 0.5 },
    { at: 4.81, kind: 'pop', actor: 'ele', emoji: '😱', dur: 0.6 },
    { at: 5.35, kind: 'puff', actor: 'ele' },
    { at: 7.2, kind: 'pop', actor: 'ele', emoji: '❓', dur: 0.4 },
    { at: 7.73, kind: 'burst', actor: 'snake', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.36, kind: 'pop', actor: 'snake', emoji: '😱', dur: 0.5 },
    { at: 8.58, kind: 'bubble', actor: 'ele', emoji: '😆', dur: 0.7 },
    { at: 9.47, kind: 'pop', actor: 'ele', emoji: '😱', dur: 0.6 },
  ],
  camera: [
    { at: 5.35, dur: 0.35, do: 'shake', amount: 2 },
    { at: 8.31, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 30, y: 64 } },
  ],
  cues: [
    { at: 1.31, sfx: 'slide' },
    { at: 1.42, say: '脫' },
    { at: 3.03, sfx: 'boing' },
    { at: 4, sfx: 'boing' },
    { at: 4.86, sfx: 'boing' },
    { at: 5.35, sfx: 'rumble' },
    { at: 6.6, say: '脫' },
    { at: 7.55, sfx: 'slide' },
    { at: 7.6, say: '脫皮' },
    { at: 8.49, sfx: 'boing' },
    { at: 8.89, sfx: 'whoosh' },
    { at: 9.51, sfx: 'boing' },
    { at: 9.73, sfx: 'cheer' },
  ],
}

export default clip
