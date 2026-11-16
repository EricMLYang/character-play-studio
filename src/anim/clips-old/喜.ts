import type { Clip, Move } from '../clip'

// 喜（浣熊花生偷餅乾）：花生抱著一疊搖搖晃晃的紅餅乾罐，踮腳偷拿積木哨兵守著的大餅乾。手指差一點就碰到——他忽然習慣性敬禮，
// 罐子一歪敲醒哨兵。兩個面對面尖叫、撞成一團，罐子和積木彈起來排成「喜」，大餅乾掉進花生懷裡。
// 回馬槍：他得意再敬一次禮，餅乾掉了滾回哨兵腳邊；哨兵撿起來，丟回給他。喜、喜、喜歡
const STACK = ['pc', 't1', 't2', 't3'] as const
const STACK_Y = { pc: 71.1, t1: 60, t2: 53, t3: 46 }
/** 花生和頭上那疊罐子一起走 */
const walk = (at: number, dur: number, x: number, extra: Partial<Move> = {}): Move[] =>
  STACK.map((actor) => ({ at, dur, actor, do: 'moveTo' as const, to: { x, y: STACK_Y[actor] }, ...extra }))

const clip: Clip = {
  char: '喜',
  meta: { theme: '浣熊偷餅乾', cast: '浣熊花生＋積木哨兵＋餅乾罐', gags: ['踮腳偷溜最後一步敬禮', '面對面尖叫撞成一團', '再敬禮餅乾又掉了'] },
  duration: 10,
  bg: { top: '#FFF4DC', bottom: '#FCE9C6', floor: '#F3E3C8', scenery: 'room' },
  actors: [
    { id: 'stand', emoji: '🪵', x: 132, y: 73.6, size: 8 },
    { id: 'cookie', emoji: '🍪', x: 132, y: 66.5, size: 8, float: true },
    { id: 'guard', emoji: 'hero:brick/idle', x: 148, y: 71.5, size: 13 },
    { id: 'pc', emoji: 'hero:raccoon/carry', x: 18, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 't1', emoji: '🥫', x: 18, y: 60, size: 7, hidden: true },
    { id: 't2', emoji: '🥫', x: 18, y: 53, size: 7, hidden: true },
    { id: 't3', emoji: '🥫', x: 18, y: 46, size: 7, hidden: true },
  ],
  moves: [
    // 從左邊探頭進來，看到大餅乾，舔舔嘴
    ...STACK.map((actor) => ({ at: 0, dur: 0.6, actor, do: 'enter' as const, from: { x: -14, y: STACK_Y[actor] } })),
    { at: 0.7, actor: 't3', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 0.7, actor: 't2', do: 'tilt', amount: 6, dur: 0.5 },
    // 抬腳——開始踮腳偷溜，每一步罐子都更歪
    { at: 1.2, actor: 'pc', do: 'squash', amount: -0.15, dur: 0.3 },
    ...walk(1.5, 0.4, 40, { arc: 3 }),
    { at: 1.6, actor: 't3', do: 'tilt', amount: 14, dur: 0.4 },
    ...walk(2.0, 0.4, 64, { arc: 3 }),
    { at: 2.1, actor: 't3', do: 'tilt', amount: -18, dur: 0.4 },
    { at: 2.1, actor: 't2', do: 'tilt', amount: -10, dur: 0.4 },
    ...walk(2.5, 0.4, 90, { arc: 3 }),
    { at: 2.6, actor: 't3', do: 'tilt', amount: 22, dur: 0.4 },
    { at: 2.6, actor: 't2', do: 'tilt', amount: 14, dur: 0.4 },
    { at: 2.6, actor: 't1', do: 'tilt', amount: 8, dur: 0.4 },
    ...walk(3.0, 0.3, 118),
    // 指尖差一點就碰到……忍不住敬禮！罐子一歪敲到哨兵
    { at: 3.35, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 3.4, actor: 't3', do: 'moveTo', to: { x: 140, y: 60 }, arc: 4, dur: 0.25 },
    { at: 3.4, actor: 't3', do: 'rotateTo', amount: 60, dur: 0.25 },
    { at: 3.4, actor: 't2', do: 'moveTo', to: { x: 126, y: 56 }, dur: 0.25 },
    { at: 3.4, actor: 't2', do: 'rotateTo', amount: 30, dur: 0.25 },
    { at: 3.65, actor: 'guard', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 3.65, actor: 'guard', do: 'hop', amount: 2, dur: 0.2 },
    // 定格半拍——面對面尖叫——撞成一團
    { at: 4.0, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 4.0, actor: 'pc', do: 'hop', amount: 4, dur: 0.25 },
    { at: 4.0, actor: 'guard', do: 'hop', amount: 4, dur: 0.25 },
    { at: 4.3, actor: 'guard', do: 'moveTo', to: { x: 130, y: 71.5 }, dur: 0.2, ease: 'in' },
    { at: 4.3, actor: 'guard', do: 'rotateTo', amount: -70, dur: 0.2, ease: 'in' },
    { at: 4.3, actor: 'pc', do: 'moveTo', to: { x: 110, y: 71.1 }, dur: 0.2 },
    { at: 4.5, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.5, actor: 'pc', do: 'moveTo', to: { x: 36, y: 71.1 }, arc: 16, dur: 0.7, ease: 'out' },
    { at: 4.5, actor: 'pc', do: 'spin', times: 1, dur: 0.7 },
    { at: 4.5, actor: 'guard', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.5, actor: 'guard', do: 'moveTo', to: { x: 140, y: 71.5 }, dur: 0.3, ease: 'out' },
    // 罐子彈到半空
    { at: 4.5, actor: 't1', do: 'moveTo', to: { x: 100, y: 30 }, dur: 0.3, ease: 'out' },
    { at: 4.5, actor: 't2', do: 'moveTo', to: { x: 120, y: 24 }, dur: 0.3, ease: 'out' },
    { at: 4.5, actor: 't3', do: 'moveTo', to: { x: 86, y: 14 }, dur: 0.3, ease: 'out' },
    { at: 4.5, actor: 't1', do: 'spin', dur: 0.3 }, { at: 4.5, actor: 't2', do: 'spin', dur: 0.3 }, { at: 4.5, actor: 't3', do: 'spin', dur: 0.3 },
    { at: 4.6, actor: 't3', do: 'vanish', dur: 0.2 },
    { at: 5.1, actor: 't2', do: 'vanish', dur: 0.2 },
    { at: 5.35, actor: 't1', do: 'vanish', dur: 0.2 },
    // 大餅乾掉進花生懷裡
    { at: 6.3, actor: 'cookie', do: 'moveTo', to: { x: 39, y: 64 }, arc: 54, dur: 0.55 },
    { at: 6.85, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.85, actor: 'pc', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.2, actor: 'pc', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    { at: 7.2, actor: 'cookie', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    { at: 7.0, actor: 'guard', do: 'rotateTo', amount: 70, dur: 0.3, ease: 'back' },
    { at: 7.0, actor: 'guard', do: 'swap', emoji: 'hero:brick/happy' },
    // 回馬槍：得意再敬禮——餅乾掉了，一路滾回哨兵腳邊
    { at: 8.0, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.05, actor: 'cookie', do: 'moveTo', to: { x: 50, y: 73 }, dur: 0.25, ease: 'bounce' },
    { at: 8.3, actor: 'cookie', do: 'moveTo', to: { x: 133, y: 73 }, dur: 0.55, ease: 'out' },
    { at: 8.3, actor: 'cookie', do: 'spin', times: 3, dur: 0.55 },
    { at: 8.4, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 8.9, actor: 'guard', do: 'hop', amount: 3, dur: 0.3 },
    // 哨兵把它丟回來
    { at: 9.15, actor: 'cookie', do: 'moveTo', to: { x: 39, y: 64 }, arc: 54, dur: 0.5 },
    { at: 9.65, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 9.65, actor: 'pc', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 三個罐子 → 士；積木 → 上面的口；罐子和積木 → 丷＋長橫；最後的積木 → 下面的口
    { at: 4.6, dur: 0.5, strokes: [0, 1, 2], from: 't3', color: '#E03131' },
    { at: 4.85, dur: 0.5, strokes: [3, 4, 5], from: 'guard', color: '#E03131' },
    { at: 5.1, dur: 0.5, strokes: [6, 7, 8], from: 't2', color: '#E03131' },
    { at: 5.35, dur: 0.5, strokes: [9, 10, 11], from: 'guard', color: '#E03131' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'guard', dur: 3.4 },
    { at: 0.7, kind: 'bubble', actor: 'pc', emoji: '🍪', dy: -14, dur: 0.8 },
    { at: 1.0, kind: 'pop', actor: 'pc', emoji: '😋', dy: -14, dur: 0.5 },
    { at: 3.0, kind: 'sweat', actor: 'pc', dy: -14 },
    { at: 3.65, kind: 'pop', actor: 'guard', emoji: '👁️', dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'pc', emoji: '😱', dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'guard', emoji: '😱', dx: -14, dur: 0.4 },
    { at: 4.45, kind: 'burst', actor: 'pc', emoji: '💥', dx: 8, dur: 0.4 },
    { at: 4.5, kind: 'puff', actor: 'guard', dur: 0.5 },
    { at: 5.2, kind: 'dizzy', actor: 'pc', dur: 1.2 },
    { at: 6.9, kind: 'burst', actor: 'pc', emoji: '💕', n: 5, dur: 0.8 },
    { at: 8.4, kind: 'pop', actor: 'pc', emoji: '😱', dur: 0.5 },
    { at: 9.65, kind: 'pop', actor: 'pc', emoji: '💕', dur: 0.35 },
  ],
  camera: [
    // 手指差一點碰到餅乾、面對面那半拍推近，撞之前退回
    { at: 3.1, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 128, y: 60 } },
    { at: 4.25, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.45, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  cues: [
    { at: 1.2, say: '喜' },
    { at: 1.6, sfx: 'tap' },
    { at: 2.1, sfx: 'tap' },
    { at: 2.6, sfx: 'tap' },
    { at: 3.4, sfx: 'clink' },
    { at: 4.0, sfx: 'boing' },
    { at: 4.45, sfx: 'bonk' },
    { at: 5.9, say: '喜' },
    { at: 6.85, say: '喜歡' },
    { at: 8.05, sfx: 'plop' },
    { at: 8.3, sfx: 'slide' },
    { at: 9.2, sfx: 'whoosh' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
