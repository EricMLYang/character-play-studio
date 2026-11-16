import type { Clip, Build, Move } from '../clip'

// 海：迴力賽車想衝去撞右邊那個小藍水桶，往後拉、放手——衝過頭一頭撞倒第一塊藍色骨牌，骨牌一塊接一塊越倒越快，排成「海」；
// 旁邊剩下的一塊骨牌像跳板一樣把賽車彈飛，翻著跟斗栽進水桶。定格……水桶一倒，倒出一整片大海！賽車在浪上翻過來比讚，又忍不住衝出去。海、海、大海
// 骨牌：左邊三塊小的 → 氵，右邊七塊高的 → 每；越倒越快
const TILES = [
  { x: 46, size: 7, at: 1.6 }, { x: 52, size: 7, at: 1.82 }, { x: 58, size: 7, at: 2.02 },
  { x: 65, size: 9, at: 2.2 }, { x: 72, size: 9, at: 2.35 }, { x: 79, size: 9, at: 2.48 }, { x: 86, size: 9, at: 2.6 },
  { x: 93, size: 9, at: 2.7 }, { x: 100, size: 9, at: 2.8 }, { x: 107, size: 9, at: 2.9 },
]
const fall: Move[] = TILES.flatMap((t, i): Move[] => [
  { at: t.at, actor: `d${i}`, do: 'rotateTo', amount: 80, dur: 0.15, ease: 'in' },
  { at: t.at + 0.15, actor: `d${i}`, do: 'vanish', dur: 0.12 },
])
const builds: Build[] = TILES.map((t, i) => ({ at: t.at + 0.15, dur: 0.3, strokes: [i], from: `d${i}`, color: i < 3 ? '#1971C2' : '#1864AB' }))
const WAVES = [138, 124, 110, 96, 82, 68, 54, 40, 26, 12]

const clip: Clip = {
  char: '海',
  meta: { theme: '骨牌與小水桶', cast: '迴力賽車＋藍色骨牌＋小水桶＋大海', gags: ['衝過頭撞倒骨牌', '骨牌越倒越快', '跳板彈飛栽進水桶', '小水桶倒出大海'] },
  duration: 10,
  bg: { top: '#FFF5E1', bottom: '#FBEBCB', floor: '#EBD5A4', scenery: 'desert' },
  actors: [
    ...TILES.map((t, i) => ({ id: `d${i}`, emoji: '📘', x: t.x, y: 77 - 0.42 * t.size, size: t.size })),
    { id: 'spring', emoji: '📘', x: 47, y: 74, size: 8, hidden: true },
    ...WAVES.map((x, i) => ({ id: `w${i}`, emoji: '🌊', x, y: 76, size: 13, hidden: true })),
    { id: 'car', emoji: 'hero:car/idle', x: 22, y: 68.6, size: 20, flip: true },
    { id: 'bucket', emoji: '🪣', x: 136, y: 72, size: 11 },
  ],
  moves: [
    // 盯著水桶，往後拉、車身壓低
    { at: 0.5, actor: 'car', do: 'moveTo', to: { x: 12, y: 68.6 }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'car', do: 'squash', amount: 0.25, dur: 0.7 },
    { at: 0.5, actor: 'car', do: 'shake', amount: 0.5, dur: 0.7 },
    // 放手——衝過頭，一頭撞上第一塊骨牌
    { at: 1.2, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 1.2, actor: 'car', do: 'moveTo', to: { x: 36, y: 68.6 }, dur: 0.35, ease: 'in' },
    { at: 1.55, actor: 'car', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 1.55, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    ...fall,
    // 第一塊倒下時彈出來的一塊骨牌躺在車子前面
    { at: 1.6, actor: 'spring', do: 'pop', dur: 0.2 },
    { at: 1.6, actor: 'spring', do: 'rotateTo', amount: 90, dur: 0.01 },
    // 跳板一翹，把賽車彈飛，翻著跟斗飛過字的上面
    { at: 3.9, actor: 'spring', do: 'rotateTo', amount: -60, dur: 0.12, ease: 'out' },
    { at: 4.0, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 4.0, actor: 'car', do: 'moveTo', to: { x: 136, y: 62 }, arc: 74, dur: 0.75, ease: 'linear' },
    { at: 4.0, actor: 'car', do: 'spin', times: 2, dur: 0.75 },
    { at: 4.2, actor: 'spring', do: 'vanish', dur: 0.2 },
    // 一頭栽進水桶
    { at: 4.75, actor: 'car', do: 'rotateTo', amount: 90, dur: 0.1 },
    { at: 4.8, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    // 定格……水桶一歪，倒出一整片大海
    { at: 5.25, actor: 'bucket', do: 'rotateTo', amount: -70, dur: 0.25 },
    ...WAVES.map((_, i) => ({ at: 5.35 + i * 0.05, actor: `w${i}`, do: 'pop' as const, dur: 0.3 })),
    ...WAVES.map((_, i) => ({ at: 5.9, actor: `w${i}`, do: 'bounce' as const, amount: 1, times: 4, dur: 3.5 })),
    // 賽車被浪沖出來，倒栽蔥在浪上漂
    { at: 5.4, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 5.4, actor: 'car', do: 'moveTo', to: { x: 124, y: 62 }, dur: 0.5, ease: 'out' },
    { at: 5.4, actor: 'car', do: 'rotateTo', amount: 90, dur: 0.5 },
    { at: 5.9, actor: 'car', do: 'bounce', amount: 1.2, times: 3, dur: 1.6 },
    // 翻回來，比個讚
    { at: 7.6, actor: 'car', do: 'rotateTo', amount: -180, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'car', do: 'moveTo', to: { x: 124, y: 67 }, arc: 5, dur: 0.35 },
    { at: 7.95, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    // 回馬槍：迴力還沒放完，又衝出去
    { at: 8.5, actor: 'car', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 8.9, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 8.9, actor: 'car', do: 'moveTo', to: { x: 190, y: 67 }, dur: 0.3, ease: 'in' },
    { at: 9.4, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 9.4, actor: 'car', do: 'flip' },
    { at: 9.4, actor: 'car', do: 'moveTo', to: { x: 130, y: 67 }, dur: 0.4, ease: 'back' },
  ],
  builds,
  glyph: [{ at: 3.3, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'bubble', actor: 'car', emoji: '🪣', dur: 0.8 },
    { at: 0.5, kind: 'puff', actor: 'car', dur: 0.7 },
    { at: 1.55, kind: 'burst', actor: 'car', dx: 8, dur: 0.35 },
    { at: 1.7, kind: 'dizzy', actor: 'car', dur: 2.0 },
    { at: 4.8, kind: 'burst', actor: 'bucket', emoji: '💦', n: 6, dur: 0.5 },
    { at: 5.4, kind: 'fountain', actor: 'bucket', emoji: '💧', n: 6, dx: -6, dur: 1.0 },
    { at: 7.95, kind: 'pop', actor: 'car', emoji: '👍', dur: 0.8 },
    { at: 9.15, kind: 'burst', x: 140, y: 64, emoji: '💦', n: 6, dur: 0.5 },
    { at: 9.6, kind: 'sweat', actor: 'car', dur: 0.4 },
  ],
  camera: [
    // 骨牌連鎖時跟著倒下的方向走一點，拼好前回全景；栽進水桶那一下推近
    { at: 1.6, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 60, y: 60 } },
    { at: 2.3, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 104, y: 60 } },
    { at: 2.95, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.8, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 132, y: 64 } },
  ],
  cues: [
    { at: 0.5, sfx: 'rumble' },
    { at: 1.2, say: '海' },
    { at: 1.55, sfx: 'bonk' },
    { at: 3.5, say: '海' },
    { at: 3.9, sfx: 'boing' },
    { at: 4.8, sfx: 'plop' },
    { at: 5.35, sfx: 'splash' },
    { at: 5.5, say: '大海' },
    { at: 8.9, sfx: 'whoosh' },
    { at: 9.15, sfx: 'splash' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
