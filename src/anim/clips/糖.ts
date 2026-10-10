import type { Clip } from '../clip'

// 糖：小螞蟻找到一顆大糖果，推不動；叫來兩個朋友，還是推不動；吹號角叫來整支螞蟻大軍，終於扛起來走回家——
// 結果糖果比洞口大，塞到「喀」一聲碎成「糖」。隊長又推來一根更大的棒棒糖，大家當場昏倒。糖、糖、糖果
const clip: Clip = {
  char: '糖',
  meta: { theme: '螞蟻大軍', cast: '螞蟻隊長＋螞蟻大軍＋糖果', gags: ['推不動', '叫越來越多人', '比洞口大塞不進去', '更大的來了全昏倒'] },
  duration: 10,
  bg: { top: '#E6F6FF', bottom: '#F6FBEF', floor: '#A9CF7E', scenery: 'hills' },
  actors: [
    { id: 'hole', emoji: '🕳️', x: 140, y: 75, size: 16, float: true },
    { id: 'candy', emoji: '🍬', x: 60, y: 69.5, size: 16, hidden: true },
    { id: 'a1', emoji: '🐜', x: 46, y: 72, size: 9, hidden: true, flip: true },
    { id: 'a2', emoji: '🐜', x: 38, y: 72, size: 9, hidden: true, flip: true },
    { id: 'a3', emoji: '🐜', x: 30, y: 72, size: 9, hidden: true, flip: true },
    { id: 'a4', emoji: '🐜', x: 22, y: 72, size: 9, hidden: true, flip: true },
    { id: 'a5', emoji: '🐜', x: 14, y: 72, size: 9, hidden: true, flip: true },
    { id: 'horn', emoji: '📯', x: 40, y: 62, size: 8, hidden: true, float: true },
    { id: 'lolly', emoji: '🍭', x: 30, y: 62, size: 28, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'candy', do: 'pop' },
    { at: 0.2, actor: 'a1', do: 'enter', from: { x: -10, y: 72 }, dur: 0.7 },
    // 推不動
    { at: 1.1, actor: 'a1', do: 'squash', amount: 0.25, dur: 0.6 },
    { at: 1.1, actor: 'candy', do: 'shake', amount: 0.5, dur: 0.6 },
    // 叫來兩個朋友——還是推不動
    { at: 2.0, actor: 'a2', do: 'enter', from: { x: -10, y: 72 }, dur: 0.5 },
    { at: 2.1, actor: 'a3', do: 'enter', from: { x: -10, y: 72 }, dur: 0.5 },
    { at: 2.8, actor: 'a1', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 2.8, actor: 'a2', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 2.8, actor: 'a3', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 2.8, actor: 'candy', do: 'shake', amount: 0.6, dur: 0.6 },
    // 吹號角：大軍來了，扛起來走
    { at: 3.7, actor: 'horn', do: 'pop' },
    { at: 3.8, actor: 'horn', do: 'shake', amount: 1, dur: 0.5 },
    { at: 4.3, actor: 'horn', do: 'vanish', dur: 0.15 },
    { at: 4.2, actor: 'a4', do: 'enter', from: { x: -10, y: 72 }, dur: 0.4 },
    { at: 4.3, actor: 'a5', do: 'enter', from: { x: -10, y: 72 }, dur: 0.4 },
    { at: 4.8, actor: 'candy', do: 'moveTo', to: { x: 60, y: 58 }, dur: 0.3 },
    ...['a1', 'a2', 'a3', 'a4', 'a5'].map((actor, i) => ({ at: 5.1, actor, do: 'moveTo' as const, to: { x: 116 - i * 8, y: 72 }, dur: 0.8 })),
    ...['a1', 'a2', 'a3', 'a4', 'a5'].map((actor) => ({ at: 5.1, actor, do: 'bounce' as const, dur: 0.8, times: 4, amount: 1.2 })),
    { at: 5.1, actor: 'candy', do: 'moveTo', to: { x: 126, y: 64 }, dur: 0.8 },
    // 塞不進洞口——喀！碎掉
    { at: 5.9, actor: 'candy', do: 'moveTo', to: { x: 138, y: 70 }, dur: 0.25 },
    { at: 6.15, actor: 'candy', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 6.45, actor: 'candy', do: 'vanish', dur: 0.15 },
    // 大家退到洞口旁邊
    ...['a1', 'a2', 'a3', 'a4', 'a5'].map((actor, i) => ({ at: 6.6, actor, do: 'moveTo' as const, to: { x: 152 - i * 7, y: 72 }, dur: 0.5 })),
    // 隊長推來一根更大的棒棒糖——大家昏倒
    { at: 8.2, actor: 'lolly', do: 'enter', from: { x: -20, y: 62 }, dur: 0.6 },
    ...['a1', 'a2', 'a3', 'a4', 'a5'].map((actor, i) => ({ at: 8.9 + i * 0.06, actor, do: 'rotateTo' as const, amount: 180, dur: 0.25 })),
  ],
  builds: [
    // 糖果碎片：米、唐
    { at: 6.45, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'candy', color: '#E64A8B' },
    { at: 6.8, dur: 0.9, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'candy', color: '#3D9CDB' },
  ],
  glyph: [{ at: 7.7, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'a1', emoji: '🍬', dur: 0.9 },
    { at: 1.7, kind: 'sweat', actor: 'a1' },
    { at: 3.4, kind: 'sweat', actor: 'a2' },
    { at: 3.8, kind: 'burst', actor: 'horn', emoji: '🎵', n: 4, dur: 0.5 },
    { at: 6.15, kind: 'pop', actor: 'a1', emoji: '😳', dur: 0.4 },
    { at: 6.45, kind: 'burst', actor: 'hole', emoji: '✨', n: 7, dur: 0.6 },
    { at: 8.8, kind: 'pop', actor: 'a3', emoji: '😵', dur: 0.8 },
  ],
  camera: [
    { at: 5.9, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 132, y: 66 } },
    { at: 6.45, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.0, say: '糖' },
    { at: 1.1, sfx: 'slide' },
    { at: 2.8, sfx: 'slide' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 5.1, sfx: 'tap' },
    { at: 6.15, sfx: 'bonk' },
    { at: 6.45, sfx: 'crack' },
    { at: 7.75, say: '糖' },
    { at: 8.6, say: '糖果' },
    { at: 8.95, sfx: 'deflate' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
