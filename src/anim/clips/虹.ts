import type { Clip } from '../clip'

// 虹：松鼠被雨雲淋濕，雨停了出現一道大彩虹——當溜滑梯！爬上去太滑溜回來；助跑衝到頂，帥氣擺姿勢，
// 結果溜下去太快被彈飛，「噗通」掉進水坑，彩虹被震散變成「虹」。水花裡冒出一道迷你彩虹，可是雨雲又飄回來淋他。虹、虹、彩虹
const clip: Clip = {
  char: '虹',
  meta: { theme: '雨後彩虹', cast: '松鼠＋雨雲＋彩虹', gags: ['爬上去滑下來', '溜太快彈飛', '水花迷你彩虹', '甩不掉的雨雲'] },
  duration: 10,
  bg: { top: '#DCE8F0', bottom: '#C4D8E6', floor: '#8FC48A', scenery: 'forest' },
  actors: [
    { id: 'bow', emoji: '🌈', x: 80, y: 52, size: 48, hidden: true, float: true },
    { id: 'sq', emoji: '🐿️', x: 24, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'mini', emoji: '🌈', x: 140, y: 54, size: 17.5, hidden: true, float: true },
    { id: 'cloud', emoji: '🌧️', x: 24, y: 20, size: 20, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cloud', do: 'pop' },
    { at: 0, actor: 'sq', do: 'pop' },
    { at: 0.3, actor: 'sq', do: 'shake', dur: 0.6, amount: 0.8 },
    // 雨雲飄走，大彩虹出現
    { at: 1.1, actor: 'cloud', do: 'moveTo', to: { x: -20, y: 10 }, dur: 0.6 },
    { at: 1.31, actor: 'bow', do: 'pop', dur: 0.4 },
    { at: 1.31, actor: 'bow', do: 'flash', dur: 0.6 },
    { at: 1.52, actor: 'sq', do: 'hop', dur: 0.35, amount: 5 },
    // 第一次：爬上去，滑回來
    { at: 1.95, actor: 'sq', do: 'moveTo', to: { x: 52, y: 70.7 }, dur: 0.35 },
    { at: 2.32, actor: 'sq', do: 'moveTo', to: { x: 63, y: 55 }, dur: 0.45 },
    { at: 2.8, actor: 'sq', do: 'rotateTo', amount: -35, dur: 0.1 },
    { at: 2.8, actor: 'sq', do: 'moveTo', to: { x: 42, y: 70.7 }, dur: 0.3 },
    { at: 3.13, actor: 'sq', do: 'rotateTo', amount: 35, dur: 0.2 },
    // 第二次：助跑衝到頂
    { at: 3.45, actor: 'sq', do: 'moveTo', to: { x: 22, y: 70.7 }, dur: 0.3 },
    { at: 3.82, actor: 'sq', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 4.09, actor: 'sq', do: 'moveTo', to: { x: 80, y: 25 }, dur: 0.45, arc: 8 },
    { at: 4.57, actor: 'sq', do: 'bounce', dur: 0.4, times: 2, amount: 1.5 },
    // 溜下去太快，彈飛，掉進水坑
    { at: 5, actor: 'sq', do: 'rotateTo', amount: 35, dur: 0.15 },
    { at: 5, actor: 'sq', do: 'moveTo', to: { x: 106, y: 66 }, dur: 0.3 },
    { at: 5.32, actor: 'sq', do: 'rotateTo', amount: -35, dur: 0.2 },
    { at: 5.32, actor: 'sq', do: 'moveTo', to: { x: 140, y: 70.7 }, dur: 0.4, arc: 20 },
    { at: 5.32, actor: 'sq', do: 'spin', dur: 0.4 },
    { at: 5.75, actor: 'sq', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 5.75, actor: 'bow', do: 'shake', dur: 0.3, amount: 1.5 },
    { at: 5.85, actor: 'bow', do: 'vanish', dur: 0.5 },
    // 水花裡的迷你彩虹
    { at: 7.6, actor: 'mini', do: 'pop', dur: 0.4 },
    { at: 7.6, actor: 'sq', do: 'hop', dur: 0.4, amount: 4 },
    // 雨雲又回來了
    { at: 8.5, actor: 'cloud', do: 'moveTo', to: { x: 140, y: 18 }, dur: 0.5 },
    { at: 9.07, actor: 'mini', do: 'vanish', dur: 0.4 },
    { at: 9.12, actor: 'sq', do: 'shake', dur: 0.6, amount: 0.8 },
  ],
  builds: [
    // 彩虹被震散，一條一條顏色飛成字
    { at: 5.8, dur: 0.4, strokes: [0, 1, 2], from: 'bow', color: '#E5484D' },
    { at: 6, dur: 0.4, strokes: [3, 4, 5], from: 'bow', color: '#F08C00' },
    { at: 6.2, dur: 0.35, strokes: [6, 7], from: 'bow', color: '#2F9E44' },
    { at: 6.4, dur: 0.3, strokes: [8], from: 'bow', color: '#3B6FD8' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'rain', actor: 'cloud', dy: 18, n: 6, dur: 1.1 },
    { at: 0.4, kind: 'bubble', actor: 'sq', emoji: '☀️', dur: 0.7 },
    { at: 1.41, kind: 'burst', actor: 'bow', emoji: '✨', n: 6, dur: 0.6, dy: 10 },
    { at: 1.52, kind: 'pop', actor: 'sq', emoji: '❗', dur: 0.4 },
    { at: 3.18, kind: 'pop', actor: 'sq', emoji: '😤', dur: 0.4 },
    { at: 4.09, kind: 'puff', actor: 'sq' },
    { at: 4.57, kind: 'pop', actor: 'sq', emoji: '😎', dur: 0.4 },
    { at: 5.75, kind: 'burst', actor: 'sq', emoji: '💦', n: 6, dur: 0.5 },
    { at: 6.05, kind: 'dizzy', actor: 'sq', dur: 0.8 },
    { at: 7.65, kind: 'burst', actor: 'mini', emoji: '✨', n: 5, dur: 0.5, dy: 4 },
    { at: 7.7, kind: 'pop', actor: 'sq', emoji: '😍', dur: 0.6, dx: -14 },
    { at: 8.94, kind: 'rain', actor: 'cloud', dy: 18, n: 6, dur: 1.0 },
    { at: 9.29, kind: 'pop', actor: 'sq', emoji: '😑', dur: 0.8, dx: -14 },
  ],
  lights: [
    { at: 0, dur: 0, level: 0.3 },
    { at: 1.1, dur: 0.4, level: 0 },
    { at: 8.58, dur: 0.4, level: 0.2 },
    { at: 9.47, dur: 0.3, level: 0 },
  ],
  camera: [
    { at: 4.57, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 80, y: 30 } },
    { at: 5.75, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.31, sfx: 'blip' },
    { at: 1.52, say: '虹' },
    { at: 2.8, sfx: 'slide' },
    { at: 4.09, sfx: 'whoosh' },
    { at: 5, sfx: 'slide' },
    { at: 5.75, sfx: 'splash' },
    { at: 6.7, say: '虹' },
    { at: 7.6, sfx: 'blip' },
    { at: 7.7, say: '彩虹' },
    { at: 8.5, sfx: 'rumble' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
