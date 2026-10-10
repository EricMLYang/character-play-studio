import type { Clip } from '../clip'

// 六：小熊的生日蛋糕要插六根蠟燭。插一根、兩根……插到第六根，熊太用力，整個蛋糕「噗」地翻過來扣在自己臉上！
// 熊頂著蛋糕走來走去，六根蠟燭的火光變成「六」。熊把蛋糕拿下來——整張臉都是奶油。六、六、六個
const clip: Clip = {
  char: '六',
  meta: { theme: '生日蠟燭', cast: '小熊＋生日蛋糕', gags: ['越插越用力', '蛋糕扣在臉上', '滿臉奶油'] },
  duration: 10,
  bg: { top: '#FFE7EE', bottom: '#FFF6F8', floor: '#C9A88A', scenery: 'room' },
  actors: [
    ...Array.from({ length: 6 }, (_, i) => ({ id: `c${i}`, emoji: '🕯️', x: 107 + i * 3.6, y: 56, size: 6, hidden: true, float: true })),
    { id: 'bear', emoji: '🐻', x: 84, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'cake', emoji: '🍰', x: 116, y: 68, size: 22, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'cake', do: 'pop' },
    { at: 0.2, actor: 'bear', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.7 },
    // 一根、兩根……
    ...Array.from({ length: 6 }, (_, i) => ({ at: 1.2 + i * 0.5, actor: `c${i}`, do: 'pop' as const, dur: 0.2 })),
    ...Array.from({ length: 6 }, (_, i) => ({ at: 1.2 + i * 0.5, actor: 'bear', do: 'tilt' as const, amount: 10 + i * 3, dur: 0.3 })),
    // 第六根太用力——蛋糕翻過來扣在臉上
    { at: 4.0, actor: 'cake', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 4.3, actor: 'cake', do: 'moveTo', to: { x: 84, y: 60 }, dur: 0.4, arc: 14 },
    { at: 4.3, actor: 'cake', do: 'rotateTo', amount: 180, dur: 0.4 },
    { at: 4.3, actor: 'cake', do: 'scaleTo', amount: 0.75, dur: 0.4 },
    ...Array.from({ length: 6 }, (_, i) => ({ at: 4.3, actor: `c${i}`, do: 'vanish' as const, dur: 0.2 })),
    // 頂著蛋糕走來走去
    { at: 4.9, actor: 'bear', do: 'moveTo', to: { x: 28, y: 68.6 }, dur: 1.0 },
    { at: 4.9, actor: 'cake', do: 'moveTo', to: { x: 28, y: 60 }, dur: 1.0 },
    // 把蛋糕拿下來——滿臉奶油
    { at: 8.2, actor: 'cake', do: 'moveTo', to: { x: 14, y: 72 }, dur: 0.4, arc: 8 },
    { at: 8.2, actor: 'cake', do: 'rotateTo', amount: -180, dur: 0.4 },
    { at: 8.6, actor: 'bear', do: 'tint', filter: 'sepia(.5) brightness(1.15)' },
    { at: 8.6, actor: 'bear', do: 'flash', dur: 0.5 },
    { at: 9.0, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 六根蠟燭的火光
    { at: 4.4, dur: 0.9, strokes: [0, 1, 2, 3], from: { x: 116, y: 46 }, color: '#F5A623' },
  ],
  glyph: [{ at: 5.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'bear', emoji: '🎂', dur: 0.6 },
    ...Array.from({ length: 6 }, (_, i) => ({ at: 1.3 + i * 0.5, kind: 'burst' as const, x: 80, y: 30, emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'][i], dur: 0.45 })),
    { at: 4.0, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.4 },
    { at: 4.7, kind: 'burst', actor: 'cake', emoji: '💥', n: 1, dur: 0.4 },
    { at: 5.0, kind: 'sweat', actor: 'bear' },
    { at: 8.8, kind: 'pop', actor: 'bear', emoji: '😋', dur: 0.9 },
  ],
  camera: [
    { at: 4.3, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 84, y: 58 } },
  ],
  cues: [
    { at: 1.3, say: '六' },
    ...Array.from({ length: 6 }, (_, i) => ({ at: 1.25 + i * 0.5, sfx: 'tap' as const })),
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.7, sfx: 'plop' },
    { at: 5.5, say: '六' },
    { at: 6.4, say: '六個' },
    { at: 8.6, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
