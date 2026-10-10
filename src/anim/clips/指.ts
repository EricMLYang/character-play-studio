import type { Clip } from '../clip'

// 指：晚上的手指偶劇場，一隻大手從下面升上來，指尖套著青蛙和兔子。鞠躬、唱歌，然後兩個玩偶吵架互撞，乾脆跳下手指自己跑掉！
// 大手追左邊、青蛙跳過去；追右邊、兔子跳過去；兩個一起跳起來在空中撞成一團變成「指」。最後青蛙伸舌頭舔手指，被舌頭拉回指尖上。指、指、手指
const clip: Clip = {
  char: '指',
  meta: { theme: '手指偶劇場', cast: '大手＋青蛙指偶＋兔子指偶', gags: ['玩偶吵架', '跳下手指逃跑', '追不到跳過頭', '舔手指被拉回去'] },
  duration: 10,
  bg: { top: '#1A1446', bottom: '#2E2366', floor: '#5A4189', scenery: 'night' },
  actors: [
    { id: 'hand', emoji: '🖐️', x: 80, y: 68, size: 22, hidden: true },
    { id: 'frog', emoji: '🐸', x: 72, y: 50, size: 11.2, hidden: true, float: true },
    { id: 'bunny', emoji: '🐰', x: 88, y: 50, size: 11.2, hidden: true, float: true },
  ],
  moves: [
    // 大手帶著指偶升上舞台
    { at: 0, actor: 'hand', do: 'enter', from: { x: 80, y: 100 }, dur: 0.6 },
    { at: 0, actor: 'frog', do: 'enter', from: { x: 72, y: 82 }, dur: 0.6 },
    { at: 0, actor: 'bunny', do: 'enter', from: { x: 88, y: 82 }, dur: 0.6 },
    // 鞠躬、唱歌
    { at: 0.8, actor: 'frog', do: 'tilt', amount: -20, dur: 0.35 },
    { at: 0.8, actor: 'bunny', do: 'tilt', amount: 20, dur: 0.35 },
    { at: 1.25, actor: 'hand', do: 'shake', amount: 1, dur: 0.5 },
    { at: 1.25, actor: 'frog', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.42, actor: 'bunny', do: 'hop', amount: 3, dur: 0.3 },
    // 吵架互撞
    { at: 2.06, actor: 'bunny', do: 'tilt', amount: -30, dur: 0.3 },
    { at: 2.49, actor: 'frog', do: 'tilt', amount: 30, dur: 0.3 },
    // 跳下手指逃跑
    { at: 2.92, actor: 'frog', do: 'moveTo', to: { x: 30, y: 73.2 }, arc: 16, dur: 0.5 },
    { at: 2.92, actor: 'bunny', do: 'moveTo', to: { x: 130, y: 73.2 }, arc: 16, dur: 0.5 },
    { at: 3.25, actor: 'hand', do: 'shake', amount: 2, dur: 0.3 },
    // 追左邊：青蛙跳過去
    { at: 3.57, actor: 'hand', do: 'moveTo', to: { x: 44, y: 68 }, dur: 0.4 },
    { at: 3.78, actor: 'frog', do: 'moveTo', to: { x: 66, y: 73.2 }, arc: 24, dur: 0.45 },
    // 追右邊：兔子跳過去
    { at: 4.22, actor: 'hand', do: 'moveTo', to: { x: 110, y: 68 }, dur: 0.4 },
    { at: 4.43, actor: 'bunny', do: 'moveTo', to: { x: 94, y: 73.2 }, arc: 24, dur: 0.45 },
    // 兩個一起跳起來，空中撞成一團
    { at: 4.97, actor: 'frog', do: 'moveTo', to: { x: 77, y: 40 }, arc: 8, dur: 0.35 },
    { at: 4.97, actor: 'bunny', do: 'moveTo', to: { x: 83, y: 40 }, arc: 8, dur: 0.35 },
    { at: 5.4, actor: 'frog', do: 'moveTo', to: { x: 20, y: 73.2 }, arc: 8, dur: 0.5 },
    { at: 5.4, actor: 'bunny', do: 'moveTo', to: { x: 36, y: 73.2 }, arc: 8, dur: 0.5 },
    { at: 5.4, actor: 'frog', do: 'spin', dur: 0.5 },
    { at: 5.4, actor: 'bunny', do: 'spin', dur: 0.5 },
    { at: 5.8, actor: 'hand', do: 'moveTo', to: { x: 130, y: 68 }, dur: 0.4 },
    // 手指
    { at: 7.3, actor: 'hand', do: 'swap', emoji: '👆' },
    { at: 7.3, actor: 'hand', do: 'flash', dur: 0.6 },
    { at: 7.6, actor: 'hand', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 青蛙伸舌頭舔手指，被舌頭拉回指尖
    { at: 8.37, actor: 'hand', do: 'shake', amount: 2, dur: 0.4 },
    { at: 8.41, actor: 'hand', do: 'swap', emoji: '🖐️' },
    { at: 8.59, actor: 'frog', do: 'moveTo', to: { x: 126, y: 52 }, arc: 50, dur: 0.5 },
    { at: 8.59, actor: 'frog', do: 'spin', dur: 0.5 },
    { at: 9.03, actor: 'hand', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 9.21, actor: 'bunny', do: 'hop', amount: 4, dur: 0.35 },
  ],
  builds: [
    // 撞成一團：青蛙 → 匕；兔子 → 日；大手（手！）→ 提手旁
    { at: 5.4, dur: 0.5, strokes: [3, 4], from: 'frog', color: '#3CCB7F' },
    { at: 5.7, dur: 0.7, strokes: [5, 6, 7, 8], from: 'bunny', color: '#FF8FB1' },
    { at: 6.2, dur: 0.5, strokes: [0, 1, 2], from: 'hand', color: '#FFD166' },
  ],
  glyph: [{ at: 6.7, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.2, kind: 'zzz', actor: 'frog', emoji: '🎵', dur: 0.9 },
    { at: 2.22, kind: 'pop', actor: 'frog', emoji: '😠', dur: 0.4 },
    { at: 2.65, kind: 'pop', actor: 'bunny', emoji: '😠', dur: 0.4 },
    { at: 3.3, kind: 'pop', actor: 'hand', emoji: '❗', dur: 0.4 },
    { at: 4, kind: 'pop', actor: 'hand', emoji: '❓', dur: 0.35 },
    { at: 4.7, kind: 'pop', actor: 'bunny', emoji: '😝', dur: 0.4 },
    { at: 5.35, kind: 'burst', x: 80, y: 38, dur: 0.45 },
    { at: 5.35, kind: 'burst', x: 80, y: 38, emoji: '⭐', n: 6, dur: 0.5 },
    { at: 5.9, kind: 'dizzy', actor: 'frog', dur: 1.0 },
    { at: 5.9, kind: 'dizzy', actor: 'bunny', dur: 1.0 },
    { at: 7.4, kind: 'burst', actor: 'hand', emoji: '✨', n: 6, dur: 0.5 },
    { at: 8.24, kind: 'line', actor: 'frog', target: 'hand', dy: 1, color: '#FF6F91', width: 1.3, dur: 0.4 },
    { at: 8.46, kind: 'pop', actor: 'hand', emoji: '💦', dur: 0.5 },
    { at: 8.59, kind: 'line', actor: 'frog', target: 'hand', color: '#FF6F91', width: 1.3, dur: 0.5 },
    { at: 9.07, kind: 'pop', actor: 'frog', emoji: '😳', dur: 0.6 },
    { at: 9.25, kind: 'pop', actor: 'bunny', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 5.29, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 80, y: 40 } },
    { at: 5.35, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.8, sfx: 'tap' },
    { at: 1.52, say: '指' },
    { at: 2.06, sfx: 'tap' }, { at: 2.49, sfx: 'tap' },
    { at: 2.92, sfx: 'boing' },
    { at: 3.78, sfx: 'boing' },
    { at: 4.43, sfx: 'boing' },
    { at: 5.35, sfx: 'bonk' },
    { at: 6.75, say: '指' },
    { at: 7.75, say: '手指' },
    { at: 8.24, sfx: 'slide' },
    { at: 8.59, sfx: 'whoosh' },
    { at: 9.03, sfx: 'plop' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
