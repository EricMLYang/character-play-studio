import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 森（重做）：布忍者躲在比自己小很多的花盆後面，抱著花盆偷偷靠近吃橡果的小松鼠——被發現，一顆橡果砸頭；丟煙霧彈變身，只變出一片小葉子，又被連砸兩顆。
// 氣得把大煙霧彈丟到地上的三顆橡果中間，「碰」地長成三棵小樹排成「森」。國字讓到上方，他在中間再丟一顆，變出一整片森林躲進去（森林）；回馬槍：小松鼠找不到他，把超大橡果丟過來砸扁他，樹全被震飛。森、森、森林
const N = 67.8 // 布忍者（size 22）站在地上的 y
const S = 69.4 // 小松鼠（size 18）
const A = 74.1 // 小橡果（size 7）落在地上
const T = 66.9 // 前排的樹（size 24）
const U = 66.0 // 後排的樹（size 22，往後站一點）

// 小松鼠丟一顆小橡果砸忍者的頭，彈到地上
const throwNut = (id: string, at: number, from: number, head: { x: number; y: number }, land: number): Move[] => [
  { at, actor: 'sq', do: 'squash', amount: -0.25, dur: 0.15 },
  { at: at + 0.1, actor: id, do: 'pop', dur: 0.1 },
  { at: at + 0.1, actor: id, do: 'moveTo', from: { x: from, y: 62 }, to: head, arc: 8, dur: 0.25, ease: 'linear' },
  { at: at + 0.1, actor: id, do: 'spin', times: 1, dur: 0.25 },
  { at: at + 0.35, actor: id, do: 'moveTo', to: { x: land, y: A }, arc: 8, dur: 0.4, ease: 'out' },
  { at: at + 0.35, actor: id, do: 'spin', times: 1, dur: 0.4 },
]

const clip: Clip = {
  char: '森',
  meta: { theme: '忍者躲松鼠變森林', cast: '布忍者＋小松鼠＋花盆＋橡果＋超大橡果＋煙霧彈', gags: ['躲在比自己小的花盆後面', '變身只變出一片葉子', '煙霧彈把橡果炸成樹', '躲進森林被超大橡果砸扁'] },
  duration: 10,
  bg: { top: '#DDF2C8', bottom: '#F5FBEA', floor: '#9C7A54', scenery: 'forest' },
  actors: [
    { id: 'big', emoji: '🌰', x: 130, y: 68.6, size: 20, pivot: 'center' },
    { id: 'sq', emoji: '🐿️', x: 108, y: S, size: 18, flip: true },
    { id: 'a1', emoji: '🌰', x: 104, y: 62, size: 7, hidden: true, pivot: 'center' },
    { id: 'a2', emoji: '🌰', x: 104, y: 62, size: 7, hidden: true, pivot: 'center' },
    { id: 'a3', emoji: '🌰', x: 104, y: 62, size: 7, hidden: true, pivot: 'center' },
    { id: 't5', emoji: '🌲', x: 70, y: U, size: 22, hidden: true },
    { id: 't6', emoji: '🌲', x: 90, y: U, size: 22, hidden: true },
    { id: 't1', emoji: '🌲', x: 46, y: T, size: 24, hidden: true },
    { id: 't2', emoji: '🌳', x: 60, y: T, size: 24, hidden: true },
    { id: 't3', emoji: '🌳', x: 100, y: T, size: 24, hidden: true },
    { id: 't4', emoji: '🌲', x: 114, y: T, size: 24, hidden: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 28, y: N, size: 22, flip: true },
    { id: 'pot', emoji: '🪴', x: 33, y: 72.8, size: 10, pivot: 'center' },
    { id: 'bomb', emoji: '💣', x: 40, y: 58, size: 9, hidden: true, pivot: 'center' },
    { id: 'bomb2', emoji: '💣', x: 86, y: 58, size: 9, hidden: true, pivot: 'center' },
  ],
  moves: [
    // 小松鼠背對著，抱著大橡果啃；布忍者從小花盆後面探頭
    { at: 0, actor: 'sq', do: 'shake', amount: 0.6, dur: 0.8 },
    { at: 0.2, actor: 'ninja', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 0.9, actor: 'ninja', do: 'hop', amount: 3, dur: 0.3 },
    // 抱起花盆擋在前面，踮腳偷溜過去
    { at: 1.3, actor: 'pot', do: 'moveTo', to: { x: 33, y: 63 }, dur: 0.15, ease: 'out' },
    { at: 1.45, actor: 'ninja', do: 'moveTo', to: { x: 58, y: N }, dur: 0.75, ease: 'linear' },
    { at: 1.45, actor: 'pot', do: 'moveTo', to: { x: 63, y: 63 }, dur: 0.75, ease: 'linear' },
    ...[1.45, 1.64, 1.83, 2.02].flatMap((at) => [
      { at, actor: 'ninja', do: 'hop' as const, amount: 1.6, dur: 0.18 },
      { at, actor: 'pot', do: 'hop' as const, amount: 1.6, dur: 0.18 },
    ]),
    // 小松鼠一回頭——他定住不動
    { at: 2.2, actor: 'sq', do: 'flip' },
    { at: 2.25, actor: 'ninja', do: 'squash', amount: 0.15, dur: 0.2 },
    // 第一顆橡果：砸頭
    ...throwNut('a1', 2.6, 104, { x: 58, y: 54 }, 70),
    { at: 2.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 2.95, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 2.95, actor: 'pot', do: 'moveTo', to: { x: 44, y: 72.8 }, dur: 0.3, ease: 'bounce' },
    // 丟煙霧彈變身……只變出一片小葉子
    { at: 3.35, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 3.35, actor: 'ninja', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 3.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 3.75, actor: 'sq', do: 'hop', amount: 3, dur: 0.25 },
    // 小松鼠笑他，連丟兩顆
    ...throwNut('a2', 4.0, 104, { x: 58, y: 54 }, 82),
    ...throwNut('a3', 4.2, 104, { x: 58, y: 54 }, 94),
    { at: 4.35, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 4.55, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.55, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.3 },
    // 氣炸了：退到旁邊，丟出大煙霧彈
    { at: 4.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 4.95, actor: 'ninja', do: 'moveTo', to: { x: 28, y: N }, dur: 0.3, ease: 'out' },
    { at: 5.25, actor: 'ninja', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 5.35, actor: 'bomb', do: 'pop', dur: 0.08 },
    { at: 5.35, actor: 'bomb', do: 'moveTo', from: { x: 38, y: 56 }, to: { x: 82, y: 70 }, arc: 14, dur: 0.3, ease: 'linear' },
    { at: 5.35, actor: 'bomb', do: 'spin', times: 1.5, dur: 0.3 },
    // 碰！三顆橡果長成三棵樹；小松鼠被炸飛到大橡果後面、花盆滾開
    { at: 5.65, actor: 'bomb', do: 'vanish', dur: 0.08 },
    { at: 5.65, actor: 'a1', do: 'vanish', dur: 0.15 },
    { at: 5.65, actor: 'a2', do: 'vanish', dur: 0.15 },
    { at: 5.65, actor: 'a3', do: 'vanish', dur: 0.15 },
    { at: 5.65, actor: 'sq', do: 'moveTo', to: { x: 146, y: S }, arc: 18, dur: 0.5, ease: 'out' },
    { at: 5.65, actor: 'sq', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    { at: 5.65, actor: 'pot', do: 'moveTo', to: { x: 12, y: 72.8 }, dur: 0.45, ease: 'out' },
    { at: 5.65, actor: 'pot', do: 'rotateTo', amount: -300, dur: 0.45, ease: 'out' },
    { at: 5.65, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 5.65, actor: 'ninja', do: 'moveTo', to: { x: 22, y: N }, dur: 0.3, ease: 'out' },
    { at: 6.25, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 6.25, actor: 'ninja', do: 'hop', amount: 5, dur: 0.35 },
    // 國字讓位：他跑到中間，再丟一顆煙霧彈——變出一整片森林
    { at: 7.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 7.1, actor: 'ninja', do: 'moveTo', to: { x: 80, y: N }, dur: 0.4, ease: 'inOut' },
    { at: 7.45, actor: 'bomb2', do: 'pop', dur: 0.06 },
    { at: 7.45, actor: 'bomb2', do: 'moveTo', from: { x: 86, y: 56 }, to: { x: 84, y: 72 }, dur: 0.15, ease: 'in' },
    { at: 7.6, actor: 'bomb2', do: 'vanish', dur: 0.06 },
    { at: 7.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 7.62, actor: 't2', do: 'pop', dur: 0.25 },
    { at: 7.66, actor: 't3', do: 'pop', dur: 0.25 },
    { at: 7.7, actor: 't1', do: 'pop', dur: 0.25 },
    { at: 7.74, actor: 't4', do: 'pop', dur: 0.25 },
    { at: 7.64, actor: 't5', do: 'pop', dur: 0.25 },
    { at: 7.68, actor: 't6', do: 'pop', dur: 0.25 },
    // 小松鼠回來找：咦？人呢
    { at: 7.85, actor: 'sq', do: 'moveTo', to: { x: 140, y: S }, arc: 8, dur: 0.3, ease: 'out' },
    { at: 8.05, actor: 'sq', do: 'tilt', amount: 14, dur: 0.3 },
    // 回馬槍：抱起超大橡果，丟過去
    { at: 8.3, actor: 'big', do: 'moveTo', to: { x: 140, y: 51 }, dur: 0.15, ease: 'out' },
    { at: 8.3, actor: 'sq', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 8.45, actor: 'big', do: 'moveTo', to: { x: 80, y: 53 }, arc: 10, dur: 0.3, ease: 'linear' },
    { at: 8.45, actor: 'big', do: 'rotateTo', amount: -360, dur: 0.3, ease: 'linear' },
    // 咚！砸扁他，樹全被震飛
    { at: 8.75, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 8.75, actor: 'ninja', do: 'squash', amount: 0.55, dur: 0.4 },
    ...pressStack(8.75, 0.4, 0.55, 22, ['big']),
    { at: 8.75, actor: 't1', do: 'moveTo', to: { x: -20, y: 30 }, dur: 0.45, ease: 'out' },
    { at: 8.75, actor: 't1', do: 'spin', times: -2, dur: 0.45, pivot: 'center' },
    { at: 8.75, actor: 't2', do: 'moveTo', to: { x: -15, y: 10 }, dur: 0.5, ease: 'out' },
    { at: 8.75, actor: 't2', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    { at: 8.75, actor: 't3', do: 'moveTo', to: { x: 175, y: 10 }, dur: 0.5, ease: 'out' },
    { at: 8.75, actor: 't3', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: 8.75, actor: 't4', do: 'moveTo', to: { x: 180, y: 30 }, dur: 0.45, ease: 'out' },
    { at: 8.75, actor: 't4', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    { at: 8.75, actor: 't5', do: 'moveTo', to: { x: -15, y: -10 }, dur: 0.5, ease: 'out' },
    { at: 8.75, actor: 't5', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    { at: 8.75, actor: 't6', do: 'moveTo', to: { x: 175, y: -10 }, dur: 0.5, ease: 'out' },
    { at: 8.75, actor: 't6', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    // 頂著大橡果，暈暈地晃到旁邊
    { at: 9.15, actor: 'ninja', do: 'moveTo', to: { x: 34, y: N }, dur: 0.3, ease: 'inOut' },
    { at: 9.15, actor: 'big', do: 'moveTo', to: { x: 34, y: 55 }, dur: 0.3, ease: 'inOut' },
    { at: 9.4, actor: 'sq', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 大煙霧彈炸開：中間那顆長成上面的木，兩邊兩顆長成下面的兩個木
    { at: 5.65, dur: 0.5, strokes: [0, 1, 2, 3], from: 'a2', color: '#2F9E44' },
    { at: 5.7, dur: 0.5, strokes: [4, 5, 6, 7], from: 'a1', color: '#37B24D' },
    { at: 5.75, dur: 0.5, strokes: [8, 9, 10, 11], from: 'a3', color: '#2B8A3E' },
  ],
  glyph: [
    { at: 6.25, dur: 0.4, do: 'wobble' },
    { at: 7.08, dur: 0.45, do: 'park' },
    { at: 9.3, dur: 0.38, do: 'home' },
    { at: 9.7, dur: 0.3, do: 'pulse' },
  ],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'ninja', emoji: '👀', dur: 0.5 },
    { at: 0.2, kind: 'zzz', actor: 'sq', emoji: '🎵', dur: 1.6 },
    { at: 2.2, kind: 'pop', actor: 'sq', emoji: '❗', dur: 0.4 },
    { at: 2.3, kind: 'sweat', actor: 'ninja' },
    { at: 2.95, kind: 'burst', actor: 'ninja', n: 1, dur: 0.3 },
    { at: 3.55, kind: 'burst', actor: 'ninja', emoji: '💨', n: 9, dy: 8, dur: 0.5 },
    { at: 3.55, kind: 'puff', actor: 'ninja', dur: 0.5 },
    { at: 3.8, kind: 'pop', actor: 'sq', emoji: '😆', dur: 0.5 },
    { at: 4.35, kind: 'burst', actor: 'ninja', n: 1, dur: 0.2 },
    { at: 4.55, kind: 'burst', actor: 'ninja', n: 1, dur: 0.25 },
    { at: 4.6, kind: 'dizzy', actor: 'ninja', dur: 0.4 },
    { at: 5.0, kind: 'pop', actor: 'ninja', emoji: '😤', dur: 0.35 },
    { at: 5.65, kind: 'burst', x: 82, y: 62, emoji: '💨', n: 10, dur: 0.6 },
    { at: 5.65, kind: 'burst', x: 82, y: 64, n: 1, dur: 0.3 },
    { at: 6.25, kind: 'burst', actor: 'ninja', emoji: '✨', n: 5, dur: 0.45 },
    { at: 6.45, kind: 'pop', actor: 'ninja', emoji: '💡', dx: -10, dur: 0.4 },
    { at: 7.6, kind: 'burst', x: 80, y: 62, emoji: '💨', n: 10, dur: 0.6 },
    { at: 8.0, kind: 'pop', actor: 'sq', emoji: '❓', dx: 6, dur: 0.4 },
    { at: 8.0, kind: 'pop', actor: 'ninja', emoji: '🤫', dx: -16, dy: 6, dur: 0.4 },
    { at: 8.75, kind: 'burst', x: 80, y: 46, n: 1, dur: 0.3 },
    { at: 8.85, kind: 'dizzy', actor: 'ninja', dx: 14, dur: 0.8 },
    { at: 9.4, kind: 'pop', actor: 'sq', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    { at: 5.65, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 8.75, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  lights: [
    { at: 5.65, dur: 0.04, level: -0.5 },
    { at: 5.69, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.9, say: '森' },
    { at: 1.45, sfx: 'tap' },
    { at: 2.2, sfx: 'blip' },
    { at: 2.95, sfx: 'bonk' },
    { at: 3.55, sfx: 'poof' },
    { at: 4.35, sfx: 'bonk' },
    { at: 4.55, sfx: 'bonk' },
    { at: 5.35, sfx: 'whoosh' },
    { at: 5.65, sfx: 'poof' },
    { at: 6.25, say: '森' },
    { at: 7.6, say: '森林' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 8.75, sfx: 'bonk' },
    { at: 9.7, sfx: 'cheer' },
  ],
}

export default clip
