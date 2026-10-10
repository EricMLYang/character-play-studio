import type { Clip } from '../clip'

// 給：松鼠把橡實「給你！」丟給兔子；兔子把紅蘿蔔「給你！」丟給熊；熊把蜂蜜罐「給你！」丟回給松鼠——
// 好重！松鼠被蜂蜜罐壓扁。大家趕快跑過來扶，蜂蜜、紅蘿蔔、橡實撒成「給」。最後大家一人一口分著吃。給、給、給你
const clip: Clip = {
  char: '給',
  meta: { theme: '傳禮物', cast: '松鼠＋兔子＋熊', gags: ['禮物傳一圈', '傳回來的太重', '一起分著吃'] },
  duration: 10,
  bg: { top: '#E7F4E2', bottom: '#FFF8EC', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'sq', emoji: '🐿️', x: 22, y: 70, size: 15, hidden: true, flip: true },
    { id: 'bunny', emoji: '🐰', x: 80, y: 70, size: 15, hidden: true },
    { id: 'bear', emoji: '🐻', x: 138, y: 68.6, size: 20, hidden: true },
    { id: 'acorn', emoji: '🌰', x: 30, y: 64, size: 7, hidden: true, float: true },
    { id: 'carrot', emoji: '🥕', x: 86, y: 64, size: 8, hidden: true, float: true },
    { id: 'honey', emoji: '🍯', x: 132, y: 60, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'sq', do: 'pop' }, { at: 0.1, actor: 'bunny', do: 'pop' }, { at: 0.2, actor: 'bear', do: 'pop' },
    // 松鼠→兔子
    { at: 0.8, actor: 'acorn', do: 'pop', dur: 0.2 },
    { at: 1.1, actor: 'acorn', do: 'moveTo', to: { x: 76, y: 62 }, dur: 0.6, arc: 14 },
    { at: 1.7, actor: 'bunny', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.8, actor: 'acorn', do: 'vanish', dur: 0.15 },
    // 兔子→熊
    { at: 2.3, actor: 'carrot', do: 'pop', dur: 0.2 },
    { at: 2.6, actor: 'carrot', do: 'moveTo', to: { x: 134, y: 60 }, dur: 0.6, arc: 14 },
    { at: 2.6, actor: 'carrot', do: 'spin', dur: 0.6 },
    { at: 3.2, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    { at: 3.3, actor: 'carrot', do: 'vanish', dur: 0.15 },
    // 熊→松鼠：好重！壓扁
    { at: 3.9, actor: 'honey', do: 'pop', dur: 0.2 },
    { at: 4.2, actor: 'honey', do: 'moveTo', to: { x: 22, y: 60 }, dur: 0.9, arc: 22 },
    { at: 4.2, actor: 'honey', do: 'scaleTo', amount: 1.8, dur: 0.9 },
    { at: 5.1, actor: 'sq', do: 'squash', amount: 0.5, dur: 0.6 },
    { at: 5.1, actor: 'honey', do: 'moveTo', to: { x: 22, y: 66 }, dur: 0.2 },
    // 大家跑過來扶
    { at: 5.6, actor: 'bunny', do: 'moveTo', to: { x: 40, y: 70 }, dur: 0.4 },
    { at: 5.7, actor: 'bear', do: 'moveTo', to: { x: 52, y: 68.6 }, dur: 0.5 },
    { at: 6.1, actor: 'honey', do: 'moveTo', to: { x: 30, y: 72 }, dur: 0.3 },
    { at: 6.1, actor: 'honey', do: 'scaleTo', amount: 0.56, dur: 0.3 },
    // 三個坐在一起分著吃
    { at: 6.6, actor: 'bunny', do: 'moveTo', to: { x: 120, y: 70 }, dur: 0.7 },
    { at: 6.6, actor: 'bear', do: 'moveTo', to: { x: 142, y: 68.6 }, dur: 0.7 },
    { at: 8.4, actor: 'sq', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.5, actor: 'bunny', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.6, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 撒出來的橡實、紅蘿蔔 → 糸；蜂蜜 → 合
    { at: 6.1, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'sq', color: '#8A5A3B' },
    { at: 6.5, dur: 0.7, strokes: [6, 7, 8, 9, 10, 11], from: 'honey', color: '#E3A23A' },
  ],
  glyph: [{ at: 7.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'sq', emoji: '🎁', dur: 0.5 },
    { at: 2.3, kind: 'pop', actor: 'bunny', emoji: '🎁', dur: 0.5 },
    { at: 3.9, kind: 'pop', actor: 'bear', emoji: '🎁', dur: 0.5 },
    { at: 4.8, kind: 'pop', actor: 'sq', emoji: '😱', dur: 0.4 },
    { at: 5.1, kind: 'burst', actor: 'sq', dur: 0.4 },
    { at: 5.6, kind: 'dizzy', actor: 'sq', dur: 1.0 },
    { at: 8.4, kind: 'pop', actor: 'sq', emoji: '😋', dur: 0.8 },
    { at: 8.5, kind: 'pop', actor: 'bear', emoji: '😋', dur: 0.8 },
    { at: 8.6, kind: 'pop', actor: 'bunny', emoji: '😋', dur: 0.8 },
  ],
  camera: [
    { at: 4.6, dur: 1.0, do: 'punch', amount: 0.25, to: { x: 26, y: 62 } },
    { at: 5.1, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.0, say: '給' },
    { at: 1.1, sfx: 'whoosh' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 5.1, sfx: 'bonk' },
    { at: 7.3, say: '給' },
    { at: 8.3, say: '給你' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
