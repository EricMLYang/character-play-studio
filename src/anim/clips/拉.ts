import type { Clip } from '../clip'

// 拉：兔子拔蘿蔔，拉不動；豬和大象排成一串一起拉，還是不動。一隻小老鼠走過來搔搔葉子——巨大紅蘿蔔自己笑著蹦出來，
// 大家往後倒成一串，土和葉子變成「拉」。大家爬起來手拉手跳舞，回頭一看：小老鼠一個人輕輕鬆鬆把大蘿蔔拖走了。拉、拉、手拉手
const clip: Clip = {
  char: '拉',
  meta: { theme: '拔蘿蔔', cast: '兔子＋豬＋大象＋小老鼠', gags: ['越多人越拉不動', '小老鼠一搔就出來', '往後倒成一串', '大小對比拖走'] },
  duration: 10,
  bg: { top: '#FFF7DA', bottom: '#FDEBB5', floor: '#B9895A', scenery: 'hills' },
  actors: [
    { id: 'ele', emoji: '🐘', x: 8, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'pig', emoji: '🐖', x: 20, y: 70.2, size: 16.2, hidden: true, flip: true },
    { id: 'rab', emoji: '🐇', x: 32, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'leaf', emoji: '🌿', x: 43, y: 71.8, size: 12.5, hidden: true },
    { id: 'carrot', emoji: '🥕', x: 43, y: 66.9, size: 24, hidden: true },
    { id: 'mouse', emoji: '🐁', x: 48, y: 73.9, size: 7.5, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'leaf', do: 'pop' },
    { at: 0, actor: 'rab', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.6 },
    // 兔子自己拉
    { at: 1.1, actor: 'rab', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.36, actor: 'rab', do: 'tilt', amount: -20, dur: 0.8 },
    { at: 1.36, actor: 'rab', do: 'shake', dur: 0.8, amount: 0.6 },
    { at: 1.36, actor: 'leaf', do: 'shake', dur: 0.8, amount: 0.8 },
    // 豬和大象來幫忙
    { at: 2.17, actor: 'pig', do: 'enter', from: { x: -12, y: 70.2 }, dur: 0.4 },
    { at: 2.5, actor: 'ele', do: 'enter', from: { x: -15, y: 68.6 }, dur: 0.4 },
    ...['rab', 'pig', 'ele'].flatMap((actor) => [
      { at: 3.04, actor, do: 'tilt' as const, amount: -22, dur: 0.9 },
      { at: 3.04, actor, do: 'shake' as const, dur: 0.9, amount: 0.8 },
    ]),
    { at: 3.04, actor: 'leaf', do: 'shake', dur: 0.9, amount: 1 },
    // 小老鼠來搔葉子
    { at: 4.12, actor: 'mouse', do: 'enter', from: { x: 175, y: 73.9 }, dur: 0.5 },
    { at: 4.72, actor: 'mouse', do: 'bounce', dur: 0.3, times: 3, amount: 1.5 },
    { at: 4.72, actor: 'leaf', do: 'shake', dur: 0.3, amount: 1.2 },
    // 蹦！大蘿蔔飛出去，大家往後倒
    { at: 5.04, actor: 'leaf', do: 'vanish', dur: 0.1 },
    { at: 5.04, actor: 'carrot', do: 'pop', dur: 0.15 },
    { at: 5.1, actor: 'carrot', do: 'moveTo', to: { x: 138, y: 66.9 }, dur: 0.8, arc: 28 },
    { at: 5.1, actor: 'carrot', do: 'spin', dur: 0.8 },
    { at: 5.9, actor: 'carrot', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 5.04, actor: 'rab', do: 'moveTo', to: { x: 30, y: 70.7 }, dur: 0.2 },
    ...['rab', 'pig', 'ele'].map((actor, i) => ({ at: 5.07 + i * 0.08, actor, do: 'rotateTo' as const, amount: -85, dur: 0.25 })),
    // 爬起來手拉手跳舞
    ...['ele', 'pig', 'rab'].map((actor, i) => ({ at: 6.5 + i * 0.08, actor, do: 'rotateTo' as const, amount: 85, dur: 0.3 })),
    ...['ele', 'pig', 'rab'].map((actor, i) => ({ at: 7.2 + i * 0.1, actor, do: 'bounce' as const, dur: 0.8, times: 2, amount: 3 })),
    // 小老鼠一個人把大蘿蔔拖走
    { at: 8.12, actor: 'mouse', do: 'moveTo', to: { x: 154, y: 73.9 }, dur: 0.45 },
    { at: 8.57, actor: 'mouse', do: 'flip' },
    { at: 8.66, actor: 'mouse', do: 'moveTo', to: { x: 185, y: 73.9 }, dur: 1.1 },
    { at: 8.66, actor: 'carrot', do: 'moveTo', to: { x: 170, y: 66.9 }, dur: 1.1 },
    { at: 8.66, actor: 'carrot', do: 'shake', dur: 1.1, amount: 0.5 },
    ...['ele', 'pig', 'rab'].map((actor) => ({ at: 9.02, actor, do: 'hop' as const, dur: 0.3, amount: 4 })),
  ],
  builds: [
    // 洞裡噴出來的土 → 扌；蘿蔔葉 → 立
    { at: 5.15, dur: 0.6, strokes: [0, 1, 2], from: { x: 43, y: 70.7 }, color: '#8A5523' },
    { at: 5.5, dur: 0.8, strokes: [3, 4, 5, 6, 7], from: 'leaf', color: '#2F9446' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'rab', emoji: '🥕', dur: 0.7 },
    { at: 1.96, kind: 'sweat', actor: 'rab' },
    { at: 3.15, kind: 'pop', actor: 'ele', emoji: '💢', dur: 0.6 },
    { at: 3.91, kind: 'sweat', actor: 'pig' },
    { at: 3.96, kind: 'pop', actor: 'rab', emoji: '😩', dur: 0.5 },
    { at: 4.66, kind: 'pop', actor: 'mouse', emoji: '👋', dur: 0.4 },
    { at: 5.04, kind: 'burst', x: 43, y: 70, emoji: '🟤', n: 6, dur: 0.5 },
    { at: 5.1, kind: 'puff', actor: 'rab' },
    { at: 5.9, kind: 'puff', actor: 'carrot' },
    { at: 5.45, kind: 'dizzy', actor: 'pig', dur: 0.9, dx: -6, dy: 6 },
    { at: 7.2, kind: 'pop', x: 26, y: 58, emoji: '🤝', dur: 0.9 },
    { at: 7.3, kind: 'zzz', actor: 'pig', emoji: '🎵', dur: 0.9 },
    { at: 8.75, kind: 'pop', actor: 'rab', emoji: '😮', dur: 0.8 },
    { at: 8.84, kind: 'pop', actor: 'ele', emoji: '😮', dur: 0.8 },
  ],
  camera: [
    { at: 4.72, dur: 0.4, do: 'punch', amount: 0.3, to: { x: 44, y: 70 } },
    { at: 5.15, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.36, sfx: 'rumble' },
    { at: 1.52, say: '拉' },
    { at: 3.04, sfx: 'rumble' },
    { at: 4.72, sfx: 'blip' },
    { at: 5.04, sfx: 'boing' },
    { at: 5.15, sfx: 'bonk' },
    { at: 5.9, sfx: 'plop' },
    { at: 6.4, say: '拉' },
    { at: 7.5, say: '手拉手' },
    { at: 8.66, sfx: 'slide' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
