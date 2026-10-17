import type { Clip, Move } from '../clip'

// 根（積木小隊抓小老鼠）：調皮小老鼠坐在大樹上吐舌頭。積木小隊先疊成高塔想搆他——塔一晃整個倒下；
// 再排成一長條衝撞隊，往後蓄力、全速撞上樹幹——砰！積木噴上天落成「根」，樹底下的樹根也彈出地面，小老鼠騎著樹根像衝浪。
// 回馬槍：小老鼠把橡實一丟，正中扁掉的積木隊長。根、根、樹根
const BRICKS = ['b1', 'b2', 'b3', 'b4'] as const
const tower = (at: number): Move[] => BRICKS.map((actor, i) => (
  { at: at + i * 0.15, actor, do: 'moveTo' as const, to: { x: 112, y: 73.2 - i * 8 }, arc: 8 + i * 3, dur: 0.3, ease: 'back' as const }))

const clip: Clip = {
  char: '根',
  meta: { theme: '積木小隊抓小老鼠', cast: '積木小隊＋調皮小老鼠＋大樹', gags: ['疊高塔一晃就倒', '排成衝撞隊撞樹幹', '橡實回馬槍砸隊長'] },
  duration: 10,
  bg: { top: '#FFF8E8', bottom: '#F6EEDA', floor: '#D9C7A7', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 142, y: 64.4, size: 30 },
    { id: 'r1', emoji: '🫚', x: 128, y: 73.5, size: 8, hidden: true },
    { id: 'r2', emoji: '🫚', x: 152, y: 73.5, size: 8, hidden: true, flip: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 142, y: 44, size: 11 },
    { id: 'acorn', emoji: '🌰', x: 136, y: 42, size: 5, float: true },
    { id: 'b1', emoji: '🧱', x: 14, y: 73.2, size: 9, hidden: true },
    { id: 'b2', emoji: '🧱', x: 23, y: 73.2, size: 9, hidden: true },
    { id: 'b3', emoji: '🧱', x: 32, y: 73.2, size: 9, hidden: true },
    { id: 'b4', emoji: '🧱', x: 41, y: 73.2, size: 9, hidden: true },
    { id: 'cap', emoji: 'hero:brick/march', x: 52, y: 71.5, size: 13, hidden: true, flip: true },
  ],
  moves: [
    // 喀喀喀踏步進場
    { at: 0, actor: 'cap', do: 'enter', from: { x: -10, y: 71.5 }, dur: 0.8 },
    { at: 0, actor: 'cap', do: 'bounce', amount: 1.2, times: 4, dur: 0.8 },
    ...BRICKS.map((actor, i) => ({ at: 0.1 + i * 0.06, actor, do: 'enter' as const, from: { x: -14 - i * 9, y: 73.2 }, dur: 0.75 })),
    { at: 0.9, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 1.0, actor: 'acorn', do: 'spin', times: 2, dur: 0.6 },
    { at: 1.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 第一次：疊成高塔去搆
    { at: 1.5, actor: 'cap', do: 'swap', emoji: 'hero:brick/stack' },
    ...tower(1.5),
    { at: 2.15, actor: 'cap', do: 'moveTo', to: { x: 112, y: 37.5 }, arc: 10, dur: 0.35, ease: 'back' },
    { at: 2.5, actor: 'cap', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 2.5, actor: 'b4', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 2.5, actor: 'b3', do: 'shake', amount: 1, dur: 0.4 },
    // 一晃——整座倒下
    ...BRICKS.map((actor, i): Move => ({ at: 2.9, actor, do: 'moveTo', to: { x: 104 - i * 10, y: 73.2 }, arc: 4, dur: 0.35, ease: 'bounce' })),
    ...BRICKS.map((actor, i): Move => ({ at: 2.9, actor, do: 'rotateTo', amount: -90 + i * 20, dur: 0.3 })),
    { at: 2.9, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 2.9, actor: 'cap', do: 'moveTo', to: { x: 66, y: 71.5 }, arc: 6, dur: 0.4, ease: 'bounce' },
    { at: 3.0, actor: 'mouse', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 排成一長條衝撞隊，往後蓄力
    ...BRICKS.map((actor, i): Move => ({ at: 3.4, actor, do: 'rotateTo', amount: 90 - (-90 + i * 20) - 90, dur: 0.2 })),
    ...BRICKS.map((actor, i): Move => ({ at: 3.4, actor, do: 'moveTo', to: { x: 24 + i * 9, y: 73.2 }, arc: 5, dur: 0.35 })),
    { at: 3.4, actor: 'cap', do: 'swap', emoji: 'hero:brick/march' },
    { at: 3.4, actor: 'cap', do: 'moveTo', to: { x: 66, y: 71.5 }, dur: 0.35 },
    ...[...BRICKS, 'cap'].map((actor): Move => ({ at: 3.8, actor, do: 'squash', amount: -0.2, dur: 0.3 })),
    // 全速衝！砰！
    ...BRICKS.map((actor, i): Move => ({ at: 4.1, actor, do: 'moveTo', to: { x: 88 + i * 9, y: 73.2 }, dur: 0.3, anticipate: 5, ease: 'in' })),
    { at: 4.1, actor: 'cap', do: 'moveTo', to: { x: 128, y: 71.5 }, dur: 0.3, anticipate: 5, ease: 'in' },
    { at: 4.4, actor: 'cap', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.4, actor: 'tree', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 4.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 4.4, actor: 'mouse', do: 'hop', amount: 10, dur: 0.45 },
    { at: 4.4, actor: 'acorn', do: 'hop', amount: 10, dur: 0.45 },
    { at: 4.45, actor: 'b4', do: 'vanish', dur: 0.15 }, { at: 4.5, actor: 'b3', do: 'vanish', dur: 0.15 },
    { at: 4.85, actor: 'b2', do: 'vanish', dur: 0.15 }, { at: 4.9, actor: 'b1', do: 'vanish', dur: 0.15 },
    // 隊長被彈回左下角，扁扁的
    { at: 4.5, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.5, actor: 'cap', do: 'moveTo', to: { x: 26, y: 71.5 }, arc: 46, dur: 0.8 },
    { at: 4.5, actor: 'cap', do: 'spin', times: 2, dur: 0.8 },
    { at: 5.3, actor: 'cap', do: 'squash', amount: 0.5, dur: 0.4 },
    // 樹根彈出地面，小老鼠騎著樹根衝浪
    { at: 6.4, actor: 'r1', do: 'pop', dur: 0.3 },
    { at: 6.5, actor: 'r2', do: 'pop', dur: 0.3 },
    { at: 6.45, actor: 'tree', do: 'hop', amount: 2, dur: 0.3 },
    { at: 6.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 6.5, actor: 'mouse', do: 'moveTo', to: { x: 128, y: 64.4 }, arc: 6, dur: 0.4, ease: 'bounce' },
    { at: 6.5, actor: 'acorn', do: 'moveTo', to: { x: 122, y: 62 }, arc: 6, dur: 0.4, ease: 'bounce' },
    { at: 6.95, actor: 'r1', do: 'tilt', amount: 15, dur: 0.5 },
    { at: 6.95, actor: 'mouse', do: 'tilt', amount: 15, dur: 0.5 },
    { at: 7.45, actor: 'r1', do: 'tilt', amount: -15, dur: 0.5 },
    { at: 7.45, actor: 'mouse', do: 'tilt', amount: -15, dur: 0.5 },
    { at: 7.4, actor: 'cap', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 7.4, actor: 'cap', do: 'tilt', amount: -12, dur: 0.5 },
    // 回馬槍：小老鼠一丟橡實——正中隊長的頭
    { at: 8.1, actor: 'mouse', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 8.3, actor: 'acorn', do: 'moveTo', to: { x: 26, y: 64 }, arc: 52, dur: 0.6 },
    { at: 8.3, actor: 'acorn', do: 'spin', times: 3, dur: 0.6 },
    { at: 8.9, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 8.9, actor: 'cap', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 8.9, actor: 'acorn', do: 'moveTo', to: { x: 34, y: 73.5 }, arc: 4, dur: 0.35, ease: 'bounce' },
    { at: 9.2, actor: 'mouse', do: 'bounce', amount: 2.5, times: 2, dur: 0.5 },
  ],
  builds: [
    // 撞散的積木噴上天：木（左）先，艮（右）後
    { at: 4.45, dur: 0.6, strokes: [0, 1, 2, 3], from: 'b4', color: '#A0522D' },
    { at: 4.85, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9], from: 'b2', color: '#8B4513' },
  ],
  glyph: [{ at: 5.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'cap', emoji: '❗', dur: 0.6 },
    { at: 1.1, kind: 'pop', actor: 'mouse', emoji: '😜', dx: -14, dur: 0.7 },
    { at: 2.9, kind: 'puff', actor: 'b2', dur: 0.5 },
    { at: 3.05, kind: 'pop', actor: 'mouse', emoji: '😆', dx: -14, dur: 0.6 },
    { at: 3.8, kind: 'puff', actor: 'b1', dur: 0.4 },
    { at: 4.4, kind: 'burst', actor: 'cap', emoji: '💥', dur: 0.45 },
    { at: 4.45, kind: 'fountain', actor: 'b3', emoji: '🟫', n: 7, dur: 0.6 },
    { at: 5.4, kind: 'dizzy', actor: 'cap', dur: 1.6 },
    { at: 6.4, kind: 'puff', actor: 'r1', dur: 0.5 },
    { at: 8.9, kind: 'burst', actor: 'cap', emoji: '💥', dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'mouse', emoji: '😆', dx: -14, dur: 0.6 },
  ],
  camera: [
    // 衝撞那一下跟拍，撞完退回全景
    { at: 4.1, dur: 0.2, do: 'follow', actor: 'cap', amount: 1.3 },
    { at: 4.45, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.4, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.6, say: '根' },
    { at: 1.6, sfx: 'clink' },
    { at: 2.95, sfx: 'crack' },
    { at: 3.45, sfx: 'clink' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.4, sfx: 'bonk' },
    { at: 5.8, say: '根' },
    { at: 6.45, sfx: 'rumble' },
    { at: 6.5, say: '樹根' },
    { at: 8.3, sfx: 'whoosh' },
    { at: 8.9, sfx: 'bonk' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
