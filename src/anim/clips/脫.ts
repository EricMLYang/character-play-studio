import type { Clip } from '../clip'

// 脫：小蛇好癢，扭一扭「咻」地脫下一層皮溜走了。老鼠、青蛙、大象一個個經過，都被那條空空的蛇皮嚇得跳起來逃跑。
// 小蛇回來又脫了一次皮，轉頭看到自己的蛇皮——連牠自己都嚇跑了；大象正在笑，空蛇皮動了一下，大象又嚇一跳。脫、脫、脫皮
const clip: Clip = {
  char: '脫',
  meta: { theme: '沙漠蛇脫皮', cast: '小蛇＋空蛇皮＋老鼠＋青蛙＋大象', gags: ['空殼嚇人', '一個比一個大隻都被嚇跑', '連自己都被嚇到', '空皮又動了一下'] },
  duration: 10,
  bg: { top: '#FFF3D9', bottom: '#FFD9A0', floor: '#E3B26B', scenery: 'desert' },
  actors: [
    { id: 'skin', emoji: '🐍', x: 30, y: 71.1, size: 14, hidden: true, tint: 'grayscale(1) brightness(1.55) opacity(.7)' },
    { id: 'skin2', emoji: '🐍', x: 22, y: 71.1, size: 14, hidden: true, tint: 'grayscale(1) brightness(1.55) opacity(.7)' },
    { id: 'snake', emoji: '🐍', x: 30, y: 71.1, size: 14, hidden: true },
    { id: 'mouse', emoji: '🐁', x: 70, y: 73.6, size: 8, hidden: true },
    { id: 'frog', emoji: '🐸', x: 82, y: 72.4, size: 11, hidden: true },
    { id: 'ele', emoji: '🐘', x: 140, y: 67.8, size: 22, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'snake', do: 'pop' },
    { at: 0.4, actor: 'snake', do: 'shake', amount: 1.5, dur: 0.6 },
    // 扭一扭，咻！脫下一層皮
    { at: 1.0, actor: 'snake', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.3, actor: 'skin', do: 'pop', dur: 0.05 },
    { at: 1.3, actor: 'snake', do: 'moveTo', to: { x: 14, y: 71.1 }, dur: 0.3 },
    { at: 1.35, actor: 'snake', do: 'flash', dur: 0.6 },
    { at: 1.95, actor: 'snake', do: 'moveTo', to: { x: -15, y: 71.1 }, dur: 0.45 },
    // 老鼠嚇跑
    { at: 2.3, actor: 'mouse', do: 'enter', from: { x: 175, y: 73.6 }, dur: 0.5 },
    { at: 2.9, actor: 'mouse', do: 'hop', amount: 10, dur: 0.4 },
    { at: 3.3, actor: 'mouse', do: 'flip' },
    { at: 3.3, actor: 'mouse', do: 'moveTo', to: { x: 180, y: 73.6 }, dur: 0.35 },
    // 青蛙嚇跑
    { at: 3.2, actor: 'frog', do: 'enter', from: { x: 178, y: 72.4 }, dur: 0.5 },
    { at: 3.8, actor: 'frog', do: 'hop', amount: 18, dur: 0.45 },
    { at: 3.8, actor: 'frog', do: 'spin', dur: 0.45 },
    { at: 4.3, actor: 'frog', do: 'moveTo', to: { x: 182, y: 72.4 }, dur: 0.35 },
    // 大象也嚇到跳起來，落地咚！
    { at: 4.0, actor: 'ele', do: 'enter', from: { x: 185, y: 67.8 }, dur: 0.5 },
    { at: 4.6, actor: 'ele', do: 'hop', amount: 12, dur: 0.45 },
    { at: 5.05, actor: 'ele', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.1, actor: 'skin', do: 'hop', amount: 12, dur: 0.3 },
    { at: 5.15, actor: 'skin', do: 'vanish', dur: 0.25 },
    // 小蛇回來，又脫一次皮
    { at: 6.4, actor: 'snake', do: 'moveTo', to: { x: 22, y: 71.1 }, dur: 0.5 },
    { at: 7.0, actor: 'snake', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 7.25, actor: 'skin2', do: 'pop', dur: 0.05 },
    { at: 7.25, actor: 'snake', do: 'moveTo', to: { x: 38, y: 71.1 }, dur: 0.3 },
    { at: 7.3, actor: 'snake', do: 'flash', dur: 0.6 },
    // 回頭看到自己的皮：嚇得跳過蛇皮逃走
    { at: 8.0, actor: 'snake', do: 'flip' },
    { at: 8.3, actor: 'snake', do: 'hop', amount: 12, dur: 0.4 },
    { at: 8.75, actor: 'snake', do: 'moveTo', to: { x: -20, y: 71.1 }, arc: 18, dur: 0.5 },
    { at: 8.75, actor: 'snake', do: 'spin', dur: 0.5 },
    // 大象在笑……空皮動了一下
    { at: 9.2, actor: 'skin2', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.45, actor: 'ele', do: 'hop', amount: 8, dur: 0.35 },
    { at: 9.45, actor: 'ele', do: 'shake', amount: 1.5, dur: 0.5 },
  ],
  builds: [
    // 被震飛的蛇皮 → 月；大象一跺腳，沙子掉下來 → 兌
    { at: 5.1, dur: 0.6, strokes: [0, 1, 2, 3], from: 'skin', color: '#4E9A3A' },
    { at: 5.35, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9, 10], from: { x: 110, y: 20 }, style: 'drop', color: '#C2410C' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'snake', emoji: '😣', dur: 0.6 },
    { at: 1.5, kind: 'burst', actor: 'snake', emoji: '✨', n: 5, dur: 0.4, dx: 8 },
    { at: 1.7, kind: 'pop', actor: 'snake', emoji: '😏', dur: 0.4 },
    { at: 2.85, kind: 'pop', actor: 'mouse', emoji: '😱', dur: 0.5 },
    { at: 3.75, kind: 'pop', actor: 'frog', emoji: '😱', dur: 0.5 },
    { at: 4.55, kind: 'pop', actor: 'ele', emoji: '😱', dur: 0.6 },
    { at: 5.05, kind: 'puff', actor: 'ele' },
    { at: 6.9, kind: 'pop', actor: 'ele', emoji: '❓', dur: 0.4 },
    { at: 7.45, kind: 'burst', actor: 'snake', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.15, kind: 'pop', actor: 'snake', emoji: '😱', dur: 0.5 },
    { at: 8.4, kind: 'bubble', actor: 'ele', emoji: '😆', dur: 0.7 },
    { at: 9.4, kind: 'pop', actor: 'ele', emoji: '😱', dur: 0.6 },
  ],
  camera: [
    { at: 5.05, dur: 0.35, do: 'shake', amount: 2 },
    { at: 8.1, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 30, y: 64 } },
  ],
  cues: [
    { at: 1.3, sfx: 'slide' },
    { at: 1.4, say: '脫' },
    { at: 2.9, sfx: 'boing' },
    { at: 3.8, sfx: 'boing' },
    { at: 4.6, sfx: 'boing' },
    { at: 5.05, sfx: 'rumble' },
    { at: 6.3, say: '脫' },
    { at: 7.25, sfx: 'slide' },
    { at: 7.3, say: '脫皮' },
    { at: 8.3, sfx: 'boing' },
    { at: 8.75, sfx: 'whoosh' },
    { at: 9.45, sfx: 'boing' },
    { at: 9.7, sfx: 'cheer' },
  ],
}

export default clip
