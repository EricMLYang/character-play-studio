import type { Clip } from '../clip'

// 叔：章魚叔叔會表演！八隻手拋球：一顆、兩顆、三顆……小魚們一直丟東西給他：海星、貝殼、螃蟹！
// 叔叔接得手忙腳亂，最後一隻河豚丟過來「噗」地鼓起來，所有東西掉下來變成「叔」。叔叔頭上頂著螃蟹，還在拋球。叔、叔、叔叔
const clip: Clip = {
  char: '叔',
  meta: { theme: '拋球表演', cast: '章魚叔叔＋小魚們', gags: ['越拋越多（失控）', '什麼都丟過來', '頂著螃蟹還在拋'] },
  duration: 10,
  bg: { top: '#BFEBFF', bottom: '#8FD3EA', floor: '#E9D6A6', scenery: 'ocean' },
  actors: [
    { id: 'octo', emoji: '🐙', x: 36, y: 64, size: 24, hidden: true },
    { id: 'fish', emoji: '🐠', x: 140, y: 50, size: 12, hidden: true, float: true },
    ...['⚽', '🏀', '⭐', '🐚', '🦀', '🐡'].map((emoji, i) => ({ id: `j${i}`, emoji, x: 36, y: 40, size: 10, hidden: true, float: true })),
  ],
  moves: [
    { at: 0, actor: 'octo', do: 'pop' },
    { at: 0.2, actor: 'fish', do: 'enter', from: { x: 180, y: 50 }, dur: 0.6 },
    // 一顆、兩顆……拋球
    { at: 0.8, actor: 'j0', do: 'pop', dur: 0.2 },
    { at: 1.0, actor: 'j0', do: 'bounce', amount: 12, times: 8, dur: 4.6 },
    { at: 1.5, actor: 'j1', do: 'pop', dur: 0.2 },
    { at: 1.5, actor: 'j1', do: 'moveTo', to: { x: 28, y: 42 }, dur: 0.01 },
    { at: 1.7, actor: 'j1', do: 'bounce', amount: 12, times: 7, dur: 3.9 },
    // 小魚丟東西過來：海星、貝殼、螃蟹
    ...[2, 3, 4].map((i, k) => ({ at: 2.4 + k * 0.8, actor: `j${i}`, do: 'enter' as const, from: { x: 140, y: 50 }, dur: 0.5 })),
    ...[2, 3, 4].map((i, k) => ({ at: 2.4 + k * 0.8, actor: `j${i}`, do: 'moveTo' as const, to: { x: 26 + k * 8, y: 34 - k * 4 }, dur: 0.01 })),
    ...[2, 3, 4].map((i, k) => ({ at: 2.95 + k * 0.8, actor: `j${i}`, do: 'bounce' as const, amount: 10, times: 5 - k, dur: 2.6 - k * 0.8 })),
    { at: 3.2, actor: 'octo', do: 'shake', amount: 1, dur: 2.2 },
    // 河豚丟過來——噗！鼓起來
    { at: 5.0, actor: 'j5', do: 'enter', from: { x: 140, y: 50 }, dur: 0.5 },
    { at: 5.0, actor: 'j5', do: 'moveTo', to: { x: 36, y: 30 }, dur: 0.01 },
    { at: 5.5, actor: 'j5', do: 'scaleTo', amount: 2.5, dur: 0.3 },
    { at: 5.8, actor: 'j5', do: 'vanish', dur: 0.2 },
    ...[0, 1, 2, 3].map((i) => ({ at: 5.8, actor: `j${i}`, do: 'vanish' as const, dur: 0.2 })),
    // 頂著螃蟹還在拋
    { at: 5.8, actor: 'j4', do: 'moveTo', to: { x: 36, y: 50 }, dur: 0.3 },
    { at: 6.1, actor: 'octo', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 7.6, actor: 'j0', do: 'moveTo', to: { x: 50, y: 40 }, dur: 0.01 },
    { at: 7.62, actor: 'j0', do: 'pop', dur: 0.2 },
    { at: 7.8, actor: 'j0', do: 'bounce', amount: 10, times: 3, dur: 1.8 },
    { at: 8.6, actor: 'fish', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 掉下來的東西
    { at: 5.85, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: { x: 36, y: 40 }, color: '#E86A33' },
    { at: 6.3, dur: 0.5, strokes: [6, 7], from: { x: 36, y: 40 }, color: '#7A5CC9' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'octo', emoji: '😎', dur: 0.6 },
    { at: 2.4, kind: 'pop', actor: 'fish', emoji: '😆', dur: 0.5 },
    { at: 3.8, kind: 'sweat', actor: 'octo', dur: 0.8 },
    { at: 4.6, kind: 'pop', actor: 'octo', emoji: '😵', dur: 0.4 },
    { at: 5.5, kind: 'burst', actor: 'j5', emoji: '💥', n: 1, dur: 0.4 },
    { at: 6.2, kind: 'dizzy', actor: 'octo', dur: 1.0, dy: -6 },
    { at: 8.6, kind: 'pop', actor: 'fish', emoji: '👏', dur: 0.7 },
  ],
  camera: [
    { at: 5.4, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 36, y: 40 } },
  ],
  cues: [
    { at: 0.8, sfx: 'boing' },
    { at: 1.1, say: '叔' },
    { at: 1.5, sfx: 'boing' },
    { at: 2.4, sfx: 'whoosh' }, { at: 3.2, sfx: 'whoosh' }, { at: 4.0, sfx: 'whoosh' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 5.5, sfx: 'poof' },
    { at: 6.9, say: '叔' },
    { at: 7.9, say: '叔叔' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
