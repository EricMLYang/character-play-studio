import type { Clip } from '../clip'

// 拉：兔子拔蘿蔔，拉不動；豬和大象排成一串一起拉，還是不動。一隻小老鼠走過來搔搔葉子——巨大紅蘿蔔自己笑著蹦出來，
// 大家往後倒成一串，土和葉子變成「拉」。大家爬起來手拉手跳舞，回頭一看：小老鼠一個人輕輕鬆鬆把大蘿蔔拖走了。拉、拉、手拉手
const clip: Clip = {
  char: '拉',
  meta: { theme: '拔蘿蔔', cast: '兔子＋豬＋大象＋小老鼠', gags: ['越多人越拉不動', '小老鼠一搔就出來', '往後倒成一串', '大小對比拖走'] },
  duration: 10,
  bg: { top: '#FFF7DA', bottom: '#FDEBB5', floor: '#B9895A', scenery: 'hills' },
  actors: [
    { id: 'ele', emoji: '🐘', x: 8, y: 70.3, size: 16, hidden: true, flip: true },
    { id: 'pig', emoji: '🐖', x: 20, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'rab', emoji: '🐇', x: 32, y: 72, size: 12, hidden: true, flip: true },
    { id: 'leaf', emoji: '🌿', x: 43, y: 72.8, size: 10, hidden: true },
    { id: 'carrot', emoji: '🥕', x: 43, y: 66.9, size: 24, hidden: true },
    { id: 'mouse', emoji: '🐁', x: 48, y: 74.5, size: 6, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'leaf', do: 'pop' },
    { at: 0, actor: 'rab', do: 'enter', from: { x: -12, y: 72 }, dur: 0.6 },
    // 兔子自己拉
    { at: 1.1, actor: 'rab', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.35, actor: 'rab', do: 'tilt', amount: -20, dur: 0.8 },
    { at: 1.35, actor: 'rab', do: 'shake', dur: 0.8, amount: 0.6 },
    { at: 1.35, actor: 'leaf', do: 'shake', dur: 0.8, amount: 0.8 },
    // 豬和大象來幫忙
    { at: 2.1, actor: 'pig', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.4 },
    { at: 2.4, actor: 'ele', do: 'enter', from: { x: -15, y: 70.3 }, dur: 0.4 },
    ...['rab', 'pig', 'ele'].flatMap((actor) => [
      { at: 2.9, actor, do: 'tilt' as const, amount: -22, dur: 0.9 },
      { at: 2.9, actor, do: 'shake' as const, dur: 0.9, amount: 0.8 },
    ]),
    { at: 2.9, actor: 'leaf', do: 'shake', dur: 0.9, amount: 1 },
    // 小老鼠來搔葉子
    { at: 3.9, actor: 'mouse', do: 'enter', from: { x: 175, y: 74.5 }, dur: 0.5 },
    { at: 4.45, actor: 'mouse', do: 'bounce', dur: 0.3, times: 3, amount: 1.5 },
    { at: 4.45, actor: 'leaf', do: 'shake', dur: 0.3, amount: 1.2 },
    // 蹦！大蘿蔔飛出去，大家往後倒
    { at: 4.75, actor: 'leaf', do: 'vanish', dur: 0.1 },
    { at: 4.75, actor: 'carrot', do: 'pop', dur: 0.15 },
    { at: 4.8, actor: 'carrot', do: 'moveTo', to: { x: 138, y: 66.9 }, dur: 0.8, arc: 28 },
    { at: 4.8, actor: 'carrot', do: 'spin', dur: 0.8 },
    { at: 5.6, actor: 'carrot', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 4.75, actor: 'rab', do: 'moveTo', to: { x: 30, y: 72 }, dur: 0.2 },
    ...['rab', 'pig', 'ele'].map((actor, i) => ({ at: 4.78 + i * 0.08, actor, do: 'rotateTo' as const, amount: -85, dur: 0.25 })),
    // 爬起來手拉手跳舞
    ...['ele', 'pig', 'rab'].map((actor, i) => ({ at: 6.2 + i * 0.08, actor, do: 'rotateTo' as const, amount: 85, dur: 0.3 })),
    ...['ele', 'pig', 'rab'].map((actor, i) => ({ at: 6.9 + i * 0.1, actor, do: 'bounce' as const, dur: 0.8, times: 2, amount: 3 })),
    // 小老鼠一個人把大蘿蔔拖走
    { at: 7.9, actor: 'mouse', do: 'moveTo', to: { x: 154, y: 74.5 }, dur: 0.45 },
    { at: 8.4, actor: 'mouse', do: 'flip' },
    { at: 8.5, actor: 'mouse', do: 'moveTo', to: { x: 185, y: 74.5 }, dur: 1.1 },
    { at: 8.5, actor: 'carrot', do: 'moveTo', to: { x: 170, y: 66.9 }, dur: 1.1 },
    { at: 8.5, actor: 'carrot', do: 'shake', dur: 1.1, amount: 0.5 },
    ...['ele', 'pig', 'rab'].map((actor) => ({ at: 8.9, actor, do: 'hop' as const, dur: 0.3, amount: 4 })),
  ],
  builds: [
    // 洞裡噴出來的土 → 扌；蘿蔔葉 → 立
    { at: 4.85, dur: 0.6, strokes: [0, 1, 2], from: { x: 43, y: 72 }, color: '#8A5523' },
    { at: 5.2, dur: 0.8, strokes: [3, 4, 5, 6, 7], from: 'leaf', color: '#2F9446' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'rab', emoji: '🥕', dur: 0.7 },
    { at: 1.9, kind: 'sweat', actor: 'rab' },
    { at: 3.0, kind: 'pop', actor: 'ele', emoji: '💢', dur: 0.6 },
    { at: 3.7, kind: 'sweat', actor: 'pig' },
    { at: 3.75, kind: 'pop', actor: 'rab', emoji: '😩', dur: 0.5 },
    { at: 4.4, kind: 'pop', actor: 'mouse', emoji: '👋', dur: 0.4 },
    { at: 4.75, kind: 'burst', x: 43, y: 70, emoji: '🟤', n: 6, dur: 0.5 },
    { at: 4.8, kind: 'puff', actor: 'rab' },
    { at: 5.6, kind: 'puff', actor: 'carrot' },
    { at: 5.15, kind: 'dizzy', actor: 'pig', dur: 0.9, dx: -6, dy: 6 },
    { at: 6.9, kind: 'pop', x: 26, y: 58, emoji: '🤝', dur: 0.9 },
    { at: 7.0, kind: 'zzz', actor: 'pig', emoji: '🎵', dur: 0.9 },
    { at: 8.6, kind: 'pop', actor: 'rab', emoji: '😮', dur: 0.8 },
    { at: 8.7, kind: 'pop', actor: 'ele', emoji: '😮', dur: 0.8 },
  ],
  camera: [
    { at: 4.45, dur: 0.4, do: 'punch', amount: 0.3, to: { x: 44, y: 70 } },
    { at: 4.85, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.35, sfx: 'rumble' },
    { at: 1.5, say: '拉' },
    { at: 2.9, sfx: 'rumble' },
    { at: 4.45, sfx: 'blip' },
    { at: 4.75, sfx: 'boing' },
    { at: 4.85, sfx: 'bonk' },
    { at: 5.6, sfx: 'plop' },
    { at: 6.1, say: '拉' },
    { at: 7.2, say: '手拉手' },
    { at: 8.5, sfx: 'slide' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
