import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 接：馬戲團之夜，海豹拋接三顆球，帥氣地全部疊在鼻子上。企鵝丟來魚、再丟大西瓜，都穩穩接住疊高高，
// 最後企鵝吹來一根輕飄飄的羽毛——整座塔垮了，球、魚、西瓜飛成「接」。企鵝乾脆自己飛撲過來，海豹一把接住牠。接、接、接住
const L = { x: 26, y: 62 }, R = { x: 40, y: 62 }

/** 三顆球輪流拋：左手往右手高高拋過去，右手再低低傳回左手。 */
function juggle(actor: string, start: number, end: number): Move[] {
  const out: Move[] = []
  for (let t = start; t + 0.65 <= end; t += 0.65) {
    out.push({ at: t, actor, do: 'moveTo', to: R, dur: 0.45, arc: 16 })
    out.push({ at: t + 0.45, actor, do: 'moveTo', to: L, dur: 0.2 })
  }
  return out
}

const tower = ['b1', 'b2', 'b3', 'fish', 'melon']

const clip: Clip = {
  char: '接',
  meta: { theme: '馬戲團雜耍', cast: '海豹＋企鵝', gags: ['拋接帥氣疊高', '越丟越大', '最輕的羽毛壓垮', '把企鵝接住'] },
  duration: 10,
  bg: { top: '#1C2A4D', bottom: '#33406E', floor: '#6E4C8C', scenery: 'night' },
  actors: [
    { id: 'seal', emoji: '🦭', x: 32, y: 70.3, size: 16, hidden: true, flip: true },
    { id: 'b1', emoji: '⚽', x: 26, y: 62, size: 6, hidden: true, float: true },
    { id: 'b2', emoji: '🏀', x: 26, y: 62, size: 6, hidden: true, float: true },
    { id: 'b3', emoji: '🎾', x: 26, y: 62, size: 6, hidden: true, float: true },
    { id: 'fish', emoji: '🐟', x: 136, y: 64, size: 7, hidden: true, float: true },
    { id: 'melon', emoji: '🍉', x: 136, y: 64, size: 8, hidden: true, float: true },
    { id: 'feather', emoji: '🪶', x: 134, y: 60, size: 6, hidden: true, float: true },
    { id: 'peng', emoji: '🐧', x: 140, y: 72, size: 12, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'seal', do: 'pop' },
    { at: 0.1, actor: 'peng', do: 'pop' },
    { at: 0.2, actor: 'b1', do: 'pop', dur: 0.2 }, { at: 0.2, actor: 'b2', do: 'pop', dur: 0.2 }, { at: 0.2, actor: 'b3', do: 'pop', dur: 0.2 },
    ...juggle('b1', 0.4, 2.4), ...juggle('b2', 0.62, 2.6), ...juggle('b3', 0.84, 2.8),
    // 啪啪啪，全部疊到鼻子上
    { at: 2.45, actor: 'b1', do: 'moveTo', to: { x: 37, y: 59 }, dur: 0.25 },
    { at: 2.55, actor: 'b2', do: 'moveTo', to: { x: 37, y: 53 }, dur: 0.25, arc: 4 },
    { at: 2.65, actor: 'b3', do: 'moveTo', to: { x: 37, y: 47 }, dur: 0.25, arc: 4 },
    // 企鵝丟魚
    { at: 3.0, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 3.05, actor: 'fish', do: 'pop', dur: 0.1 },
    { at: 3.1, actor: 'fish', do: 'moveTo', to: { x: 37, y: 40.5 }, dur: 0.6, arc: 20 },
    { at: 3.1, actor: 'fish', do: 'spin', dur: 0.6, times: 2 },
    { at: 3.7, actor: 'seal', do: 'squash', amount: 0.12, dur: 0.25 },
    ...pressStack(3.7, 0.25, 0.12, 16, ['b1', 'b2', 'b3', 'fish']),
    // 再丟大西瓜
    { at: 3.8, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 3.85, actor: 'melon', do: 'pop', dur: 0.1 },
    { at: 3.9, actor: 'melon', do: 'moveTo', to: { x: 37, y: 33 }, dur: 0.6, arc: 18 },
    { at: 3.9, actor: 'melon', do: 'spin', dur: 0.6 },
    { at: 4.5, actor: 'seal', do: 'squash', amount: 0.18, dur: 0.3 },
    ...pressStack(4.5, 0.3, 0.18, 16, tower),
    ...tower.map((actor) => ({ at: 4.8, actor, do: 'shake' as const, dur: 0.6, amount: 1.2 })),
    // 一根羽毛輕輕飄來……
    { at: 4.9, actor: 'feather', do: 'pop', dur: 0.2 },
    { at: 5.0, actor: 'feather', do: 'moveTo', to: { x: 37, y: 27 }, dur: 0.85, arc: 6 },
    ...tower.map((actor, i) => ({ at: 5.85, actor, do: 'tilt' as const, amount: 10 + i * 4, dur: 0.3 })),
    // 垮了！
    { at: 6.0, actor: 'b2', do: 'moveTo', to: { x: 14, y: 40 }, dur: 0.3 },
    { at: 6.0, actor: 'b3', do: 'moveTo', to: { x: 22, y: 28 }, dur: 0.3 },
    { at: 6.25, actor: 'b2', do: 'vanish', dur: 0.2 },
    { at: 6.25, actor: 'b3', do: 'vanish', dur: 0.2 },
    { at: 6.0, actor: 'b1', do: 'vanish', dur: 0.3 },
    { at: 6.25, actor: 'fish', do: 'vanish', dur: 0.3 },
    { at: 6.65, actor: 'melon', do: 'vanish', dur: 0.3 },
    { at: 6.0, actor: 'feather', do: 'moveTo', to: { x: 18, y: 72 }, dur: 1.6, arc: -4 },
    { at: 6.0, actor: 'seal', do: 'shake', dur: 0.5, amount: 1 },
    // 企鵝飛撲過來，被接住
    { at: 7.7, actor: 'peng', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 8.0, actor: 'peng', do: 'moveTo', to: { x: 37, y: 57 }, dur: 0.6, arc: 60 },
    { at: 8.0, actor: 'peng', do: 'spin', dur: 0.6, times: 2 },
    { at: 8.6, actor: 'seal', do: 'squash', amount: 0.2, dur: 0.3 },
    ...pressStack(8.6, 0.3, 0.2, 16, ['peng']),
    { at: 9.1, actor: 'seal', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 9.1, actor: 'peng', do: 'tilt', amount: 12, dur: 0.5 },
  ],
  builds: [
    // 垮下來的球 → 扌；魚 → 立；西瓜 → 女
    { at: 6.0, dur: 0.4, strokes: [0, 1, 2], from: 'b1', color: '#FF6B6B' },
    { at: 6.25, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: 'fish', color: '#FFD93D' },
    { at: 6.65, dur: 0.45, strokes: [8, 9, 10], from: 'melon', color: '#6BCB77' },
  ],
  glyph: [{ at: 7.1, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'peng', emoji: '👀', dur: 0.6, dx: -18 },
    { at: 2.8, kind: 'pop', actor: 'seal', emoji: '😎', dur: 0.5, dx: -12 },
    { at: 2.9, kind: 'burst', x: 140, y: 52, emoji: '👏', n: 5, dur: 0.6 },
    { at: 3.7, kind: 'burst', actor: 'fish', emoji: '✨', n: 5, dur: 0.4 },
    { at: 4.6, kind: 'sweat', actor: 'seal', dx: -12 },
    { at: 5.0, kind: 'pop', actor: 'peng', emoji: '😏', dur: 0.6, dx: -12 },
    { at: 5.85, kind: 'pop', actor: 'seal', emoji: '😨', dur: 0.4, dx: -14 },
    { at: 6.0, kind: 'burst', actor: 'seal', n: 1, dur: 0.4, dy: -14 },
    { at: 6.4, kind: 'dizzy', actor: 'seal', dur: 0.9 },
    { at: 7.6, kind: 'pop', actor: 'peng', emoji: '😤', dur: 0.4, dx: -12 },
    { at: 8.6, kind: 'burst', actor: 'peng', emoji: '✨', n: 6, dur: 0.5 },
    { at: 9.0, kind: 'burst', x: 140, y: 52, emoji: '👏', n: 6, dur: 0.7 },
  ],
  camera: [
    { at: 5.6, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 37, y: 40 } },
    { at: 6.0, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.85, sfx: 'tap' }, { at: 1.07, sfx: 'tap' }, { at: 1.29, sfx: 'tap' },
    { at: 1.5, say: '接' },
    { at: 2.45, sfx: 'tap' }, { at: 2.55, sfx: 'tap' }, { at: 2.65, sfx: 'tap' },
    { at: 2.9, sfx: 'cheer' },
    { at: 3.1, sfx: 'whoosh' },
    { at: 3.7, sfx: 'clink' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.5, sfx: 'plop' },
    { at: 5.85, sfx: 'crack' },
    { at: 6.0, sfx: 'bonk' },
    { at: 7.2, say: '接' },
    { at: 8.0, sfx: 'whoosh' },
    { at: 8.6, sfx: 'clink' },
    { at: 8.65, say: '接住' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
