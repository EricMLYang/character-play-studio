import type { Clip } from '../clip'

// 蜂：熊指揮家帶三隻蜜蜂開音樂會，慢慢揮好好聽；越揮越快，蜜蜂開始亂飛，指揮棒還甩飛了——蜜蜂全部掉頭追著熊跑！
// 牠們嗡嗡嗡飛過的路線變成「蜂」。最後小瓢蟲撿起指揮棒輕輕一揮，蜜蜂就乖乖排好。蜂、蜂、蜜蜂
const clip: Clip = {
  char: '蜂',
  meta: { theme: '蜜蜂音樂會', cast: '熊指揮家＋三隻蜜蜂＋瓢蟲', gags: ['越揮越快失控', '被樂團追著跑', '小瓢蟲指揮得比較好'] },
  duration: 10,
  bg: { top: '#1E2352', bottom: '#433F86', floor: '#3E5E3A', scenery: 'night' },
  actors: [
    { id: 'bear', emoji: '🐻', x: 36, y: 68, size: 22, hidden: true, flip: true },
    { id: 'baton', emoji: '🪄', x: 48, y: 58, size: 9, hidden: true, float: true },
    { id: 'b1', emoji: '🐝', x: 92, y: 46, size: 10, hidden: true, float: true },
    { id: 'b2', emoji: '🐝', x: 108, y: 40, size: 10, hidden: true, float: true },
    { id: 'b3', emoji: '🐝', x: 124, y: 46, size: 10, hidden: true, float: true },
    { id: 'bug', emoji: '🐞', x: 150, y: 72, size: 10, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -15, y: 68 }, dur: 0.6 },
    { at: 0.3, actor: 'baton', do: 'pop' },
    { at: 0.4, actor: 'b1', do: 'pop' }, { at: 0.5, actor: 'b2', do: 'pop' }, { at: 0.6, actor: 'b3', do: 'pop' },
    // 慢慢揮，蜜蜂跟著輕輕上下
    { at: 1.0, actor: 'baton', do: 'tilt', amount: 30, dur: 0.7 },
    { at: 1.7, actor: 'baton', do: 'tilt', amount: -30, dur: 0.7 },
    ...['b1', 'b2', 'b3'].map((actor, i) => ({ at: 1.0 + i * 0.1, actor, do: 'bounce' as const, dur: 1.4, times: 2, amount: 2 })),
    // 越揮越快——蜜蜂開始亂飛
    { at: 2.8, actor: 'baton', do: 'shake', amount: 3, dur: 1.0 },
    { at: 2.8, actor: 'bear', do: 'bounce', amount: 2, times: 4, dur: 1.0 },
    { at: 3.0, actor: 'b1', do: 'moveTo', to: { x: 120, y: 24 }, dur: 0.5, arc: 6 },
    { at: 3.1, actor: 'b2', do: 'moveTo', to: { x: 86, y: 30 }, dur: 0.5, arc: 6 },
    { at: 3.2, actor: 'b3', do: 'moveTo', to: { x: 140, y: 34 }, dur: 0.5, arc: 6 },
    { at: 3.0, actor: 'b1', do: 'spin', dur: 0.8, times: 2 },
    { at: 3.2, actor: 'b3', do: 'spin', dur: 0.8, times: 2 },
    // 指揮棒甩飛
    { at: 3.9, actor: 'baton', do: 'moveTo', to: { x: 150, y: 68 }, dur: 0.6, arc: 30 },
    { at: 3.9, actor: 'baton', do: 'spin', dur: 0.6, times: 3 },
    // 蜜蜂全部轉頭，盯著熊——熊跑！
    { at: 4.7, actor: 'b1', do: 'moveTo', to: { x: 110, y: 52 }, dur: 0.3 },
    { at: 4.7, actor: 'b2', do: 'moveTo', to: { x: 96, y: 46 }, dur: 0.3 },
    { at: 4.7, actor: 'b3', do: 'moveTo', to: { x: 124, y: 56 }, dur: 0.3 },
    { at: 5.2, actor: 'bear', do: 'flip' },
    { at: 5.3, actor: 'bear', do: 'moveTo', to: { x: -20, y: 68 }, dur: 0.5 },
    { at: 5.45, actor: 'b2', do: 'moveTo', to: { x: -20, y: 56 }, dur: 0.6 },
    { at: 5.5, actor: 'b1', do: 'moveTo', to: { x: -20, y: 50 }, dur: 0.6 },
    { at: 5.55, actor: 'b3', do: 'moveTo', to: { x: -20, y: 62 }, dur: 0.6 },
    // 小瓢蟲撿起指揮棒，輕輕一揮，蜜蜂乖乖排好
    { at: 7.4, actor: 'bug', do: 'enter', from: { x: 175, y: 72 }, dur: 0.5 },
    { at: 7.4, actor: 'baton', do: 'moveTo', to: { x: 142, y: 62 }, dur: 0.01 },
    { at: 8.1, actor: 'baton', do: 'tilt', amount: 25, dur: 0.6 },
    { at: 8.2, actor: 'b1', do: 'moveTo', to: { x: 130, y: 40 }, dur: 0.01 },
    { at: 8.2, actor: 'b2', do: 'moveTo', to: { x: 140, y: 34 }, dur: 0.01 },
    { at: 8.2, actor: 'b3', do: 'moveTo', to: { x: 150, y: 40 }, dur: 0.01 },
    { at: 8.25, actor: 'b1', do: 'enter', from: { x: 175, y: 30 }, dur: 0.5 },
    { at: 8.35, actor: 'b2', do: 'enter', from: { x: 175, y: 24 }, dur: 0.5 },
    { at: 8.45, actor: 'b3', do: 'enter', from: { x: 175, y: 30 }, dur: 0.5 },
    ...['b1', 'b2', 'b3'].map((actor, i) => ({ at: 9.0 + i * 0.1, actor, do: 'bounce' as const, dur: 0.8, times: 2, amount: 1.5 })),
  ],
  builds: [
    // 蜜蜂嗡嗡飛過的路線：虫、夆
    { at: 5.5, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: { x: 110, y: 52 }, color: '#F2B91F' },
    { at: 5.9, dur: 0.9, strokes: [6, 7, 8, 9, 10, 11, 12], from: { x: 110, y: 52 }, color: '#5A3B1F' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'zzz', actor: 'b2', emoji: '🎵', dur: 1.6 },
    { at: 2.8, kind: 'zzz', actor: 'b2', emoji: '🎵', dur: 0.8 },
    { at: 3.3, kind: 'pop', actor: 'bear', emoji: '😅', dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'b2', emoji: '💢', dur: 0.6 },
    { at: 4.9, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.5 },
    { at: 8.15, kind: 'burst', actor: 'baton', emoji: '✨', n: 5, dur: 0.5 },
    { at: 9.0, kind: 'zzz', actor: 'b2', emoji: '🎵', dur: 1.0 },
  ],
  camera: [
    { at: 4.7, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 80, y: 54 } },
  ],
  cues: [
    { at: 0.9, say: '蜂' },
    { at: 1.0, sfx: 'blip' },
    { at: 2.8, sfx: 'bubble' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.7, sfx: 'blip' },
    { at: 5.3, sfx: 'whoosh' },
    { at: 6.9, say: '蜂' },
    { at: 8.1, sfx: 'blip' },
    { at: 8.8, say: '蜜蜂' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
