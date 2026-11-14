import type { Clip } from '../clip'

// 黑（重做）：大怪獸偷偷走到橡膠恐龍背後「吼」——恐龍笑他好可愛；再用力吼一次，恐龍打呵欠。牠想到辦法：一頭跳進墨水桶，
// 墨水噴上天落成「黑」的上半部，爬出來全身黑漆漆，像小狗一樣甩出四滴墨變成四點。國字讓到上方，黑漆漆的牠在中間舉手大吼，恐龍嚇到彈上天（黑熊）。
// 回馬槍：牠笑到往後倒，一屁股栽回墨水桶，墨水噴了恐龍一身——全黑的恐龍反過來大吼，把牠嚇得從桶子裡跳出來。黑、黑、黑熊
const G = 66.9 // 大怪獸（size 24）站在地上的 y
const D = 67.8 // 恐龍（size 22）
const T = 67 // 墨水桶（size 24）
const IN = 63 // 怪獸縮小躲在桶子裡的 y
const TOP = 48 // 怪獸站在桶子邊上的 y
const X = 24 // 墨水桶的 x
const INK = 'brightness(.32) contrast(1.3)'

const clip: Clip = {
  char: '黑',
  meta: { theme: '嚇人要先變黑', cast: '大怪獸＋橡膠恐龍＋墨水桶', gags: ['吼人被笑可愛', '用力吼對方打呵欠', '跳進墨水桶噴成字', '甩墨像小狗甩水', '笑到栽回桶子墨水噴得對方全黑反被吼'] },
  duration: 10,
  bg: { top: '#E6F0FF', bottom: '#F6FAFF', floor: '#D9CBB0', scenery: 'room' },
  actors: [
    { id: 'dino', emoji: 'hero:dino/happy', x: 128, y: D, size: 22 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 52, y: G, size: 24, hidden: true, flip: true },
    { id: 'tub', emoji: '🪣', x: X, y: T, size: 24, tint: 'brightness(.35) contrast(1.4)' },
    ...[0, 1, 2].map((i) => ({ id: `ink${i}`, emoji: '⚫', x: X, y: 56, size: 9, hidden: true, float: true })),
  ],
  moves: [
    // 怪獸跑進來，看到恐龍背對著牠在哼歌：嘿嘿，嚇牠一下
    { at: 0, actor: 'mon', do: 'enter', from: { x: -20, y: G }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'dino', do: 'bounce', amount: 1.5, times: 2, dur: 0.8 },
    { at: 0.65, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 0.8, actor: 'mon', do: 'moveTo', to: { x: 96, y: G }, dur: 0.6, ease: 'inOut' },
    // 第一吼：恐龍轉過來，笑牠好可愛
    { at: 1.4, actor: 'mon', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 1.6, actor: 'mon', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 1.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 1.75, actor: 'dino', do: 'flip' },
    { at: 1.85, actor: 'dino', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 2.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    // 第二吼：退一步、深吸一口氣、整隻鼓起來——恐龍打呵欠
    { at: 2.45, actor: 'mon', do: 'moveTo', to: { x: 86, y: G }, dur: 0.3, ease: 'out' },
    { at: 2.6, actor: 'mon', do: 'squash', amount: -0.45, dur: 0.35 },
    { at: 2.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 2.95, actor: 'mon', do: 'scaleTo', amount: 1.18, dur: 0.15, ease: 'back' },
    { at: 2.95, actor: 'mon', do: 'shake', amount: 1.6, dur: 0.45 },
    { at: 3.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 3.1, actor: 'dino', do: 'flip' },
    { at: 3.15, actor: 'dino', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 3.45, actor: 'mon', do: 'scaleTo', amount: 1 / 1.18, dur: 0.3, ease: 'out' },
    { at: 3.45, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    // 💡 看到墨水桶：變黑就可怕了！轉身衝過去
    { at: 3.75, actor: 'mon', do: 'flip' },
    { at: 3.8, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 3.85, actor: 'mon', do: 'moveTo', to: { x: 50, y: G }, dur: 0.3, anticipate: 3, ease: 'in' },
    { at: 4.15, actor: 'mon', do: 'squash', amount: -0.4, dur: 0.15 },
    // 一頭跳進桶子
    { at: 4.25, actor: 'mon', do: 'moveTo', to: { x: X, y: 60 }, arc: 22, dur: 0.35, ease: 'in' },
    { at: 4.25, actor: 'mon', do: 'spin', times: 1, dur: 0.35 },
    { at: 4.4, actor: 'mon', do: 'scaleTo', amount: 0.5, dur: 0.2, ease: 'in' },
    { at: 4.6, actor: 'mon', do: 'moveTo', to: { x: X, y: IN }, dur: 0.08, ease: 'in' },
    { at: 4.6, actor: 'tub', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: 4.6, actor: 'tub', do: 'shake', amount: 1, dur: 0.4 },
    { at: 4.65, actor: 'mon', do: 'tint', filter: INK },
    { at: 4.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 4.7, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
    // 爬出來站在桶子邊上：全身黑漆漆，像小狗一樣甩甩甩
    { at: 5.15, actor: 'mon', do: 'moveTo', to: { x: X, y: TOP }, dur: 0.3, ease: 'back' },
    { at: 5.15, actor: 'mon', do: 'scaleTo', amount: 2, dur: 0.3, ease: 'back' },
    { at: 5.5, actor: 'mon', do: 'shake', amount: 2.2, dur: 0.6 },
    { at: 6.15, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 6.2, actor: 'mon', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 6.5, actor: 'mon', do: 'tilt', amount: 10, dur: 0.4 },
    // 國字讓位：黑漆漆的怪獸踮腳走到中間
    { at: 6.9, actor: 'mon', do: 'flip' },
    { at: 6.95, actor: 'mon', do: 'moveTo', to: { x: 80, y: G }, arc: 8, dur: 0.55, ease: 'inOut' },
    // 舉起雙手、整隻變大：吼——黑熊！
    { at: 7.5, actor: 'mon', do: 'squash', amount: -0.4, dur: 0.2 },
    { at: 7.7, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 7.7, actor: 'mon', do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'back' },
    { at: 7.7, actor: 'mon', do: 'shake', amount: 1.4, dur: 0.4 },
    { at: 7.72, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 7.72, actor: 'dino', do: 'hop', amount: 16, dur: 0.5 },
    { at: 8.22, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.5 },
    // 笑到往後倒……
    { at: 8.15, actor: 'mon', do: 'scaleTo', amount: 1 / 1.3, dur: 0.2, ease: 'out' },
    { at: 8.15, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 8.15, actor: 'mon', do: 'bounce', amount: 2, times: 2, dur: 0.35 },
    { at: 8.4, actor: 'mon', do: 'moveTo', to: { x: 42, y: G }, dur: 0.35, ease: 'out' },
    { at: 8.4, actor: 'mon', do: 'rotateTo', amount: -25, dur: 0.35 },
    // ……一屁股栽回墨水桶
    { at: 8.75, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 8.75, actor: 'mon', do: 'moveTo', to: { x: X, y: IN }, dur: 0.18, ease: 'in' },
    { at: 8.75, actor: 'mon', do: 'scaleTo', amount: 0.5, dur: 0.18, ease: 'in' },
    { at: 8.75, actor: 'mon', do: 'rotateTo', amount: 25, dur: 0.18 },
    { at: 8.93, actor: 'tub', do: 'squash', amount: 0.4, dur: 0.35 },
    // 墨水噴過整個房間，打中恐龍
    ...[0, 1, 2].flatMap((i) => [
      { at: 8.93, actor: `ink${i}`, do: 'pop' as const, dur: 0.08 },
      { at: 8.93, actor: `ink${i}`, do: 'moveTo' as const, to: { x: 122 + i * 4, y: 58 + i * 4 }, arc: 18 + i * 5, dur: 0.32, ease: 'linear' as const },
      { at: 9.25, actor: `ink${i}`, do: 'vanish' as const, dur: 0.05 },
    ]),
    { at: 9.25, actor: 'dino', do: 'tint', filter: INK },
    { at: 9.25, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.25 },
    // 全黑的恐龍反過來大吼——怪獸嚇得從桶子裡跳出來
    { at: 9.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 9.4, actor: 'dino', do: 'scaleTo', amount: 1.2, dur: 0.2, ease: 'back' },
    { at: 9.4, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 9.45, actor: 'mon', do: 'moveTo', to: { x: X, y: TOP }, arc: 14, dur: 0.35, ease: 'out' },
    { at: 9.45, actor: 'mon', do: 'scaleTo', amount: 2, dur: 0.2, ease: 'back' },
    { at: 9.8, actor: 'mon', do: 'shake', amount: 1.2, dur: 0.2 },
  ],
  builds: [
    // 跳進桶子噴上天的墨水 → 上半部；甩掉的四滴墨 → 四點
    { at: 4.6, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'tub', color: '#22222E' },
    { at: 5.5, dur: 0.25, strokes: [8], from: 'mon', color: '#343A40' },
    { at: 5.62, dur: 0.25, strokes: [9], from: 'mon', color: '#343A40' },
    { at: 5.74, dur: 0.25, strokes: [10], from: 'mon', color: '#343A40' },
    { at: 5.86, dur: 0.25, strokes: [11], from: 'mon', color: '#343A40' },
  ],
  glyph: [
    { at: 6.12, dur: 0.4, do: 'wobble' },
    { at: 6.95, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'dino', emoji: '🎵', dur: 1.4 },
    { at: 0.6, kind: 'pop', actor: 'mon', emoji: '😈', dur: 0.5 },
    { at: 1.6, kind: 'pop', actor: 'mon', emoji: '❗', dx: 6, dur: 0.35 },
    { at: 1.85, kind: 'pop', actor: 'dino', emoji: '😆', dur: 0.6 },
    { at: 2.2, kind: 'sweat', actor: 'mon' },
    { at: 2.6, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 3.2, kind: 'pop', actor: 'dino', emoji: '🥱', dur: 0.6 },
    { at: 3.5, kind: 'sweat', actor: 'mon' },
    { at: 3.7, kind: 'pop', actor: 'mon', emoji: '💡', dur: 0.4 },
    { at: 4.6, kind: 'fountain', actor: 'tub', emoji: '⚫', n: 9, dur: 0.7 },
    { at: 4.75, kind: 'pop', actor: 'dino', emoji: '😲', dur: 0.5 },
    { at: 5.35, kind: 'pop', actor: 'mon', emoji: '👀', dur: 0.35 },
    { at: 6.4, kind: 'pop', actor: 'dino', emoji: '❓', dur: 0.5 },
    { at: 6.5, kind: 'pop', actor: 'mon', emoji: '😏', dur: 0.45 },
    { at: 7.75, kind: 'bubble', actor: 'dino', emoji: '🐻', dur: 0.8, dx: -6 },
    { at: 7.7, kind: 'pop', actor: 'mon', emoji: '🐻', dx: -26, dy: 8, dur: 0.5 },
    { at: 8.25, kind: 'sweat', actor: 'dino' },
    { at: 8.2, kind: 'pop', actor: 'mon', emoji: '😆', dx: -20, dur: 0.45 },
    { at: 8.93, kind: 'fountain', actor: 'tub', emoji: '⚫', n: 10, dur: 0.6 },
    { at: 9.4, kind: 'pop', actor: 'dino', emoji: '💢', dx: -8, dur: 0.5 },
    { at: 9.5, kind: 'pop', actor: 'mon', emoji: '😱', dx: 14, dy: 6, dur: 0.5 },
  ],
  camera: [
    { at: 2.95, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 4.6, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 7.7, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 80, y: 52 } },
    { at: 8.93, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 跳進墨水桶：白光一閃
    { at: 4.6, dur: 0.04, level: -0.35 },
    { at: 4.64, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.8, sfx: 'tap' },
    { at: 1.6, say: '黑' },
    { at: 2.95, sfx: 'rumble' },
    { at: 3.7, sfx: 'blip' },
    { at: 3.85, sfx: 'whoosh' },
    { at: 4.6, sfx: 'splash' },
    { at: 5.15, sfx: 'plop' },
    { at: 6.12, say: '黑' },
    { at: 7.7, say: '黑熊' },
    { at: 8.75, sfx: 'slide' },
    { at: 8.93, sfx: 'splash' },
    { at: 9.4, sfx: 'rumble' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
