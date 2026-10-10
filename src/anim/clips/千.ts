import type { Clip } from '../clip'

// 千：螞蟻隊長吹哨子：「集合！」來了一隻、兩隻、十隻……一百隻、一千隻！螞蟻排成好長好長的隊伍，從畫面一邊排到另一邊，
// 還從天上一排掉下來，排成「千」。隊長點名點到一半——打了一個大哈欠，倒頭就睡，全部螞蟻也跟著一起睡。千、千、一千
const clip: Clip = {
  char: '千',
  meta: { theme: '螞蟻集合', cast: '螞蟻隊長＋一千隻螞蟻', gags: ['越來越多（失控）', '排到天上去', '點名點到睡著'] },
  duration: 10,
  bg: { top: '#E7F6E2', bottom: '#F7FCF2', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'chief', emoji: '🐜', x: 18, y: 71, size: 15, hidden: true, flip: true, tint: 'sepia(1) saturate(4) hue-rotate(-30deg)' },
    { id: 'whistle', emoji: '📯', x: 28, y: 62, size: 8, hidden: true, float: true },
    ...Array.from({ length: 14 }, (_, i) => ({ id: `a${i}`, emoji: '🐜', x: 36 + i * 9, y: 72.6, size: 9, hidden: true, flip: true })),
  ],
  moves: [
    { at: 0, actor: 'chief', do: 'pop' },
    { at: 0.4, actor: 'whistle', do: 'pop' },
    { at: 0.8, actor: 'whistle', do: 'shake', amount: 1, dur: 0.5 },
    // 一隻、兩隻……越來越多
    ...Array.from({ length: 14 }, (_, i) => ({ at: 1.6 + i * 0.28 - i * i * 0.009, actor: `a${i}`, do: 'enter' as const, from: { x: 180, y: 72.6 }, dur: 0.5 })),
    { at: 5.3, actor: 'whistle', do: 'vanish', dur: 0.2 },
    // 隊長點名點到一半——哈欠、睡著
    ...[0, 1, 2, 3].map((i) => ({ at: 6.6 + i * 0.35, actor: `a${i}`, do: 'hop' as const, amount: 3, dur: 0.25 })),
    { at: 8.0, actor: 'chief', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 8.5, actor: 'chief', do: 'rotateTo', amount: -80, dur: 0.3 },
    { at: 8.5, actor: 'chief', do: 'moveTo', to: { x: 18, y: 74 }, dur: 0.3 },
    ...Array.from({ length: 14 }, (_, i) => ({ at: 8.7 + i * 0.03, actor: `a${i}`, do: 'squash' as const, amount: 0.3, dur: 1.2 })),
  ],
  builds: [
    // 一長排螞蟻 → 中間那一橫；天上掉下來的一排 → 上面的撇和中間一豎
    { at: 5.0, dur: 0.5, strokes: [1], from: { x: 150, y: 70 }, color: '#5A3B1F' },
    { at: 5.4, dur: 0.6, strokes: [0, 2], style: 'drop', from: { x: 80, y: 0 }, color: '#8A5A3B' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'burst', actor: 'whistle', emoji: '🎵', n: 4, dur: 0.5 },
    { at: 1.8, kind: 'burst', x: 80, y: 30, emoji: '1️⃣', dur: 0.5 },
    { at: 2.6, kind: 'burst', x: 80, y: 30, emoji: '🔟', dur: 0.5 },
    { at: 3.4, kind: 'burst', x: 80, y: 30, emoji: '💯', dur: 0.5 },
    { at: 4.3, kind: 'pop', actor: 'chief', emoji: '😳', dur: 0.7 },
    { at: 6.6, kind: 'pop', actor: 'chief', emoji: '☝️', dur: 0.5 },
    { at: 8.0, kind: 'pop', actor: 'chief', emoji: '🥱', dur: 0.5 },
    { at: 8.8, kind: 'zzz', actor: 'chief', dur: 1.2 },
    { at: 9.0, kind: 'zzz', actor: 'a7', dur: 1.0 },
  ],
  camera: [
    { at: 3.6, dur: 1.4, do: 'punch', amount: 0.15, to: { x: 90, y: 66 } },
  ],
  cues: [
    { at: 0.8, sfx: 'blip' },
    { at: 1.2, say: '千' },
    ...Array.from({ length: 14 }, (_, i) => ({ at: 1.8 + i * 0.28 - i * i * 0.009, sfx: 'tap' as const })),
    { at: 6.1, say: '千' },
    { at: 7.1, say: '一千' },
    { at: 8.0, sfx: 'deflate' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
