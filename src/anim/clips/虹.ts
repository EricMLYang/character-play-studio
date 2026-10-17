import type { Clip } from '../clip'

// 虹：馬達太強的玩具機器人想按雲朵灑水器上的小紅鈕，長手臂越甩越快、蓄力——一衝出去直接衝過頭，橫越整個畫面撞進深紫長條堆，
// 長條嘩啦落成「虹」，最後一小根掉成那一點。它冒著煙滑回來，輕輕一按，彩虹就從雲朵彎出來；結尾又興奮得按太大力，被灑了一頭水、短路冒煙，頭上冒出一道小彩虹。虹、虹、彩虹
const BARS = [71, 64, 57, 50, 43, 36]
const FLY = [{ x: 60, y: 10 }, { x: 72, y: 4 }, { x: 86, y: 6 }, { x: 98, y: 12 }, { x: 112, y: 8 }, { x: 128, y: 14 }]

const clip: Clip = {
  char: '虹',
  meta: { theme: '彩虹按鈕', cast: '機器人＋雲朵灑水器＋紫色長條＋彩虹', gags: ['甩手臂蓄力', '衝過頭撞進長條堆', '小心翼翼輕輕一按', '按太大力被灑水短路'] },
  duration: 10,
  bg: { top: '#D6EEFF', bottom: '#EEF8FF', floor: '#C6DDEE', scenery: 'hills' },
  actors: [
    ...BARS.map((y, i) => ({ id: `b${i}`, emoji: '🟪', x: 150, y, size: 7 })),
    { id: 'rainbow', emoji: '🌈', x: 24, y: 40, size: 30, float: true, hidden: true },
    { id: 'mini', emoji: '🌈', x: 30, y: 52, size: 9, float: true, hidden: true },
    { id: 'cloud', emoji: '☁️', x: 47, y: 70, size: 9 },
    { id: 'button', emoji: '🔴', x: 47, y: 74.5, size: 3.5 },
    { id: 'robot', emoji: 'hero:robot/idle', x: 20, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 踩著重重的腳步進來，看到小紅鈕
    { at: 0, actor: 'robot', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.5 },
    { at: 0, actor: 'robot', do: 'bounce', amount: 1.5, times: 3, dur: 0.5 },
    { at: 0.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 1.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    // 長手臂越甩越快，馬達狂轉
    { at: 1.0, actor: 'robot', do: 'tilt', amount: -10, dur: 0.25 },
    { at: 1.25, actor: 'robot', do: 'tilt', amount: 10, dur: 0.2 },
    { at: 1.45, actor: 'robot', do: 'tilt', amount: -10, dur: 0.15 },
    { at: 1.6, actor: 'robot', do: 'tilt', amount: 10, dur: 0.12 },
    { at: 1.0, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.85 },
    // 衝出去——直接衝過按鈕，橫越整個畫面
    { at: 1.85, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 1.85, actor: 'robot', do: 'moveTo', to: { x: 140, y: 71.1 }, dur: 0.4, anticipate: 3, ease: 'in' },
    // 咚！撞進長條堆，壓扁再拉長
    { at: 2.25, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 2.25, actor: 'robot', do: 'squash', amount: 0.5, dur: 0.25 },
    { at: 2.5, actor: 'robot', do: 'squash', amount: -0.35, dur: 0.25 },
    ...BARS.map((_, i) => ({ at: 2.28, actor: `b${i}`, do: 'moveTo' as const, to: FLY[i], arc: 6, dur: 0.4, ease: 'out' as const })),
    ...BARS.map((_, i) => ({ at: 2.28, actor: `b${i}`, do: 'spin' as const, times: i % 2 ? 1 : -1, dur: 0.4 })),
    ...BARS.map((_, i) => ({ at: [2.75, 2.75, 2.75, 3.3, 3.3, 3.75][i], actor: `b${i}`, do: 'vanish' as const, dur: 0.15 })),
    // 腳底冒煙，滑回按鈕旁邊（從字前面滑過去，字還沒拼好）
    { at: 2.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 2.8, actor: 'robot', do: 'flip' },
    { at: 2.85, actor: 'robot', do: 'moveTo', to: { x: 36, y: 71.1 }, dur: 0.75, ease: 'out' },
    { at: 3.65, actor: 'robot', do: 'flip' },
    { at: 3.7, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.3 },
    // 小心翼翼，伸短手輕輕一按
    { at: 4.2, actor: 'robot', do: 'moveTo', to: { x: 39, y: 71.1 }, dur: 0.4, ease: 'linear' },
    { at: 4.6, actor: 'button', do: 'squash', amount: 0.5, dur: 0.2 },
    { at: 4.62, actor: 'cloud', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 4.75, actor: 'rainbow', do: 'pop', dur: 0.6 },
    { at: 5.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    // 得意地踏步跳舞，長手臂對彩虹揮
    { at: 5.6, actor: 'robot', do: 'moveTo', to: { x: 33, y: 71.1 }, dur: 0.3 },
    { at: 5.9, actor: 'robot', do: 'bounce', amount: 2, times: 4, dur: 1.6 },
    { at: 6.0, actor: 'robot', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 6.6, actor: 'robot', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 6.0, actor: 'rainbow', do: 'bounce', amount: 0.6, times: 2, dur: 2 },
    // 回馬槍：太興奮，又按太大力——雲朵被壓扁噴他一頭水，短路冒煙，頭上冒出小彩虹
    { at: 7.9, actor: 'robot', do: 'moveTo', to: { x: 40, y: 71.1 }, dur: 0.2, ease: 'in' },
    { at: 8.1, actor: 'button', do: 'squash', amount: 0.6, dur: 0.3 },
    { at: 8.1, actor: 'cloud', do: 'squash', amount: 0.5, dur: 0.4 },
    { at: 8.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    { at: 8.3, actor: 'robot', do: 'shake', amount: 1, dur: 0.6 },
    { at: 8.3, actor: 'robot', do: 'moveTo', to: { x: 30, y: 71.1 }, dur: 0.4, ease: 'out' },
    { at: 9.0, actor: 'mini', do: 'pop', dur: 0.4 },
    { at: 9.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
  ],
  builds: [
    // 長條嘩啦落下：左邊的虫、右邊的工，最後一小根掉成虫的那一點
    { at: 2.75, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'b1', style: 'drop', color: '#4C2AA5' },
    { at: 3.3, dur: 0.45, strokes: [6, 7, 8], from: 'b4', color: '#5F3DC4' },
    { at: 3.75, dur: 0.3, strokes: [5], from: 'b5', color: '#4C2AA5' },
  ],
  glyph: [{ at: 4.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.5 },
    { at: 1.0, kind: 'bubble', actor: 'robot', emoji: '🔴', dur: 0.8 },
    { at: 1.85, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 2.25, kind: 'burst', actor: 'robot', dur: 0.4 },
    { at: 2.85, dur: 0.9, kind: 'stink', actor: 'robot', dy: 6 },
    { at: 2.9, kind: 'dizzy', actor: 'robot', dur: 0.8 },
    { at: 4.2, kind: 'sweat', actor: 'robot', dur: 0.5 },
    { at: 4.65, kind: 'rain', actor: 'cloud', emoji: '💧', dur: 0.6 },
    { at: 4.8, kind: 'burst', actor: 'rainbow', emoji: '✨', n: 5, dur: 0.6 },
    { at: 6.0, dur: 1.4, kind: 'zzz', actor: 'robot', emoji: '🎵' },
    { at: 8.15, kind: 'fountain', actor: 'cloud', emoji: '💧', n: 7, dur: 0.9 },
    { at: 8.3, kind: 'burst', actor: 'robot', emoji: '⚡', n: 5, dur: 0.5 },
    { at: 8.4, dur: 1.0, kind: 'stink', actor: 'robot', dy: -2 },
  ],
  camera: [
    // 衝出去時跟拍，撞上前回全景；撞上震
    { at: 1.85, dur: 0.2, do: 'follow', actor: 'robot', amount: 1.3 },
    { at: 2.1, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 2.25, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0, sfx: 'tap' },
    { at: 1.2, say: '虹' },
    { at: 1.0, sfx: 'rumble' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 2.25, sfx: 'bonk' },
    { at: 2.85, sfx: 'slide' },
    { at: 4.1, say: '虹' },
    { at: 4.6, sfx: 'tap' },
    { at: 4.8, say: '彩虹' },
    { at: 8.1, sfx: 'splash' },
    { at: 8.3, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
