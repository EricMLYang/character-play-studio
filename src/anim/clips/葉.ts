import type { Clip } from '../clip'

// 葉：狐狸掃落葉，大樹一直掉新的葉子，越掃越多。狐狸換成扇子用力搧——搧出一個龍捲風，把葉子和狐狸自己都捲上天，
// 龍捲風吐出「葉」，大樹笑到抖出木。最後一片樹葉飄到狐狸頭上，牠輕輕搧一下……又被小龍捲風捲走。葉、葉、樹葉
const clip: Clip = {
  char: '葉',
  meta: { theme: '掃落葉', cast: '狐狸＋大樹＋扇子', gags: ['越掃越多', '扇子搧出龍捲風', '把自己捲上天', '輕輕搧又被捲走'] },
  duration: 10,
  bg: { top: '#FFF4DC', bottom: '#FFE1AE', floor: '#C99A5B', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 140, y: 63.6, size: 32 },
    { id: 'lf1', emoji: '🍂', x: 60, y: 74.5, size: 6 },
    { id: 'lf2', emoji: '🍁', x: 74, y: 74.5, size: 6 },
    { id: 'lf3', emoji: '🍂', x: 88, y: 74.5, size: 6 },
    { id: 'lf4', emoji: '🍁', x: 132, y: 52, size: 6, hidden: true, float: true },
    { id: 'lf5', emoji: '🍂', x: 138, y: 48, size: 6, hidden: true, float: true },
    { id: 'tornado', emoji: '🌪️', x: 80, y: 54, size: 30, hidden: true, float: true },
    { id: 'fox', emoji: '🦊', x: 40, y: 71.5, size: 13, hidden: true },
    { id: 'broom', emoji: '🧹', x: 49, y: 70.5, size: 9, hidden: true },
    { id: 'leaf', emoji: '🍃', x: 130, y: 46, size: 7, hidden: true, float: true },
    { id: 'twister', emoji: '🌪️', x: 30, y: 60, size: 18, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'fox', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.6 },
    { at: 0, actor: 'broom', do: 'enter', from: { x: -3, y: 70.5 }, dur: 0.6 },
    // 掃一掃
    { at: 0.7, actor: 'broom', do: 'shake', amount: 2, dur: 0.6 },
    { at: 0.8, actor: 'lf1', do: 'moveTo', to: { x: 64, y: 74.5 }, dur: 0.3 },
    // 大樹又掉葉子，越掃越多
    { at: 1.1, actor: 'lf4', do: 'pop', dur: 0.1 },
    { at: 1.15, actor: 'lf4', do: 'moveTo', to: { x: 100, y: 74.5 }, dur: 0.7 },
    { at: 1.15, actor: 'lf4', do: 'tilt', amount: 40, dur: 0.7 },
    { at: 1.6, actor: 'tree', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.6, actor: 'lf5', do: 'pop', dur: 0.1 },
    { at: 1.65, actor: 'lf5', do: 'moveTo', to: { x: 108, y: 74.5 }, dur: 0.7 },
    { at: 1.65, actor: 'lf5', do: 'tilt', amount: -40, dur: 0.7 },
    // 換扇子
    { at: 2.5, actor: 'broom', do: 'swap', emoji: '🪭' },
    { at: 2.5, actor: 'broom', do: 'moveTo', to: { x: 49, y: 64 }, dur: 0.2 },
    { at: 2.8, actor: 'broom', do: 'shake', amount: 2, dur: 0.5 },
    { at: 2.9, actor: 'lf1', do: 'moveTo', to: { x: 70, y: 74.5 }, arc: 5, dur: 0.3 },
    { at: 2.9, actor: 'lf2', do: 'moveTo', to: { x: 82, y: 74.5 }, arc: 5, dur: 0.3 },
    { at: 2.9, actor: 'lf3', do: 'moveTo', to: { x: 95, y: 74.5 }, arc: 5, dur: 0.3 },
    // 用力搧——龍捲風！
    { at: 3.3, actor: 'broom', do: 'shake', amount: 3, dur: 0.7 },
    { at: 3.4, actor: 'tornado', do: 'pop', dur: 0.4 },
    { at: 3.5, actor: 'tornado', do: 'shake', amount: 1.5, dur: 2.0 },
    ...(['lf1', 'lf2', 'lf3', 'lf4', 'lf5'] as const).flatMap((id) => [
      { at: 3.5, actor: id, do: 'moveTo' as const, to: { x: 80, y: 54 }, dur: 0.4 },
      { at: 3.5, actor: id, do: 'spin' as const, times: 2, dur: 0.4 },
      { at: 3.9, actor: id, do: 'vanish' as const, dur: 0.1 },
    ]),
    // 狐狸和扇子也被捲進去
    { at: 4.0, actor: 'fox', do: 'moveTo', to: { x: 80, y: 40 }, dur: 0.4 },
    { at: 4.0, actor: 'fox', do: 'spin', times: 4, dur: 1.2 },
    { at: 4.0, actor: 'broom', do: 'moveTo', to: { x: 90, y: 32 }, dur: 0.4 },
    { at: 4.0, actor: 'broom', do: 'spin', times: 4, dur: 1.2 },
    // 吐出來
    { at: 5.4, actor: 'fox', do: 'moveTo', to: { x: 26, y: 71.5 }, arc: 14, dur: 0.5 },
    { at: 5.4, actor: 'broom', do: 'moveTo', to: { x: 38, y: 70 }, arc: 10, dur: 0.5 },
    { at: 5.9, actor: 'fox', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 5.8, actor: 'tornado', do: 'vanish', dur: 0.3 },
    { at: 5.8, actor: 'tree', do: 'shake', amount: 1.5, dur: 0.6 },
    // 一片樹葉慢慢飄下來，停在狐狸頭上
    { at: 7.4, actor: 'leaf', do: 'pop', dur: 0.2 },
    { at: 7.55, actor: 'leaf', do: 'moveTo', to: { x: 26, y: 62.5 }, arc: 50, dur: 0.9 },
    { at: 7.55, actor: 'leaf', do: 'spin', times: 2, dur: 0.9 },
    // 輕輕搧一下……又被捲走
    { at: 8.6, actor: 'broom', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 8.95, actor: 'twister', do: 'pop', dur: 0.25 },
    ...(['twister', 'fox', 'leaf', 'broom'] as const).map((id) => ({ at: 9.2, actor: id, do: 'moveTo' as const, to: { x: -24, y: 8 }, dur: 0.6 })),
    { at: 9.2, actor: 'fox', do: 'spin', times: 3, dur: 0.6 },
  ],
  builds: [
    // 龍捲風把葉子吐出來 → 艹、世；大樹笑到抖 → 木
    { at: 4.8, dur: 0.6, strokes: [0, 1, 2, 3], from: 'tornado', color: '#5DAA3A' },
    { at: 5.2, dur: 0.7, strokes: [4, 5, 6, 7, 8], from: 'tornado', color: '#E0702A' },
    { at: 5.8, dur: 0.7, strokes: [9, 10, 11, 12], from: 'tree', color: '#8A5A2E' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'broom' },
    { at: 1.9, kind: 'bubble', actor: 'fox', emoji: '😑', dur: 0.6 },
    { at: 2.3, kind: 'pop', actor: 'fox', emoji: '💡', dur: 0.4 },
    { at: 2.8, kind: 'burst', actor: 'broom', emoji: '💨', n: 4, dur: 0.5 },
    { at: 3.3, kind: 'burst', actor: 'broom', emoji: '💨', n: 6, dur: 0.6 },
    { at: 3.5, kind: 'pop', actor: 'fox', emoji: '❗', dur: 0.5 },
    { at: 4.4, kind: 'sweat', actor: 'fox' },
    { at: 6.0, kind: 'dizzy', actor: 'fox', dur: 1.0 },
    { at: 6.3, kind: 'pop', actor: 'tree', emoji: '😆', dur: 0.6, dx: -8, dy: 6 },
    { at: 8.4, kind: 'bubble', actor: 'fox', emoji: '😌', dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'fox', emoji: '❗', dur: 0.3 },
    { at: 9.3, kind: 'pop', actor: 'tree', emoji: '😆', dur: 0.6, dx: -8, dy: 6 },
  ],
  camera: [
    { at: 4.0, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 80, y: 46 } },
    { at: 5.9, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.7, sfx: 'tap' },
    { at: 1.3, say: '葉' },
    { at: 2.5, sfx: 'poof' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.4, sfx: 'whoosh' },
    { at: 3.5, sfx: 'rumble' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 5.9, sfx: 'plop' },
    { at: 6.5, say: '葉' },
    { at: 7.5, say: '樹葉' },
    { at: 9.0, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
