import type { Clip, Move } from '../clip'

// 桌（花生搬走戰士的餐桌）：玩具戰士正要開動，花生頂著一大疊雜物衝進來，停下來敬禮——那一疊往後一歪，把餐桌和便當一起鏟走了。
// 戰士揮劍追，揮太大力自己轉三圈；再追又絆到盾牌滾成輪子；最後飛撲撞上那一疊，餐桌、便當盒和泡棉劍嘩啦落下疊成「桌」。
// 另一張小餐桌滑進來，兩個坐下一起吃；回馬槍：花生又習慣性敬禮，把麵碗打翻扣在戰士頭上。桌、桌、餐桌
const PILE = ['pc', 'o1', 'o2', 'table', 'lunch'] as const
const DY = { pc: 0, o1: -11, o2: -18.5, table: -27, lunch: -34 }
/** 花生和頭上那疊東西一起跑（還沒鏟到餐桌之前只帶 pc、o1、o2） */
const run = (at: number, dur: number, x: number, ids: readonly (typeof PILE[number])[] = PILE, extra: Partial<Move> = {}): Move[] =>
  ids.map((actor) => ({ at, dur, actor, do: 'moveTo' as const, to: { x, y: 71.1 + DY[actor] }, ...extra }))

const clip: Clip = {
  char: '桌',
  meta: { theme: '花生搬走餐桌', cast: '浣熊花生＋玩具戰士＋餐桌便當', gags: ['敬禮害雜物塔鏟走餐桌', '揮劍自己轉圈絆盾牌滾輪子', '飛撲撞倒整疊'] },
  duration: 10,
  bg: { top: '#FFF5D1', bottom: '#FFEDB8', floor: '#EBD9B4', scenery: 'room' },
  actors: [
    { id: 'table2', emoji: '🍽️', x: 138, y: 72.8, size: 10, hidden: true },
    { id: 'bowl', emoji: '🍜', x: 138, y: 66.5, size: 7, hidden: true, float: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 26, y: 71.1, size: 14, flip: true },
    { id: 'table', emoji: '🍽️', x: 44, y: 72.8, size: 10 },
    { id: 'lunch', emoji: '🍱', x: 44, y: 66.5, size: 7, float: true },
    { id: 'sword', emoji: '🗡️', x: 132, y: 50, size: 8, hidden: true, float: true },
    { id: 'pc', emoji: 'hero:raccoon/carry', x: 58, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'o1', emoji: '📦', x: 58, y: 60.1, size: 8, hidden: true },
    { id: 'o2', emoji: '🧸', x: 58, y: 52.6, size: 8, hidden: true },
  ],
  moves: [
    // 戰士舉起叉子準備開動
    { at: 0.1, actor: 'warrior', do: 'hop', amount: 2, dur: 0.3 },
    // 花生頂著雜物塔衝進來——停下來敬禮
    ...(['pc', 'o1', 'o2'] as const).map((actor) => ({ at: 0.2, dur: 0.45, actor, do: 'enter' as const, from: { x: 175, y: 71.1 + DY[actor] }, ease: 'back' as const })),
    { at: 0.75, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 那一疊往後一歪，把餐桌和便當鏟到最上面
    { at: 0.85, actor: 'o2', do: 'tilt', amount: -25, dur: 0.4 },
    { at: 0.85, actor: 'o1', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 0.9, actor: 'table', do: 'moveTo', to: { x: 58, y: 44.1 }, arc: 8, dur: 0.35, ease: 'back' },
    { at: 0.95, actor: 'lunch', do: 'moveTo', to: { x: 58, y: 37.1 }, arc: 10, dur: 0.35, ease: 'back' },
    { at: 1.3, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 1.25, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 1.25, actor: 'warrior', do: 'hop', amount: 4, dur: 0.3 },
    // 聳聳肩，往右跑掉
    ...run(1.45, 0.5, 136, PILE, { ease: 'in' }),
    // 戰士揮劍追，揮太大力自己轉三圈、倒退一步
    { at: 1.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 1.7, actor: 'warrior', do: 'moveTo', to: { x: 62, y: 71.1 }, dur: 0.3, ease: 'in' },
    { at: 2.0, actor: 'warrior', do: 'spin', times: 3, dur: 0.6 },
    { at: 2.6, actor: 'warrior', do: 'moveTo', to: { x: 54, y: 71.1 }, dur: 0.2 },
    { at: 2.6, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    // 再追——絆到自己的盾牌，滾成輪子
    { at: 2.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/shield' },
    { at: 2.9, actor: 'warrior', do: 'moveTo', to: { x: 92, y: 71.1 }, dur: 0.25, ease: 'in' },
    { at: 3.15, actor: 'warrior', do: 'moveTo', to: { x: 116, y: 71.1 }, dur: 0.45, ease: 'out' },
    { at: 3.15, actor: 'warrior', do: 'spin', times: 2, dur: 0.45 },
    { at: 3.6, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 3.6, actor: 'warrior', do: 'hop', amount: 3, dur: 0.25 },
    // 雜物塔晃啊晃
    { at: 2.0, actor: 'lunch', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 2.0, actor: 'table', do: 'tilt', amount: 10, dur: 0.6 },
    { at: 2.8, actor: 'lunch', do: 'tilt', amount: -18, dur: 0.6 },
    { at: 2.8, actor: 'table', do: 'tilt', amount: -10, dur: 0.6 },
    // 蹲低、扭一扭——飛撲！
    { at: 3.9, actor: 'warrior', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 3.9, actor: 'warrior', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 4.2, actor: 'warrior', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 4.2, actor: 'warrior', do: 'moveTo', to: { x: 128, y: 64 }, arc: 8, dur: 0.25, ease: 'in' },
    { at: 4.45, actor: 'pc', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.45, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.5, actor: 'pc', do: 'moveTo', to: { x: 146, y: 71.1 }, dur: 0.3, ease: 'out' },
    // 整疊飛上天
    { at: 4.45, actor: 'table', do: 'moveTo', to: { x: 116, y: 26 }, dur: 0.3, ease: 'out' },
    { at: 4.45, actor: 'lunch', do: 'moveTo', to: { x: 130, y: 16 }, dur: 0.3, ease: 'out' },
    { at: 4.45, actor: 'o1', do: 'moveTo', to: { x: 175, y: 30 }, arc: 10, dur: 0.5 },
    { at: 4.45, actor: 'o2', do: 'moveTo', to: { x: 165, y: -15 }, dur: 0.5 },
    { at: 4.45, actor: 'sword', do: 'pop', dur: 0.2 },
    { at: 4.5, actor: 'sword', do: 'moveTo', to: { x: 120, y: 10 }, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'sword', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.45, actor: 'table', do: 'spin', dur: 0.3 }, { at: 4.45, actor: 'lunch', do: 'spin', dur: 0.3 },
    { at: 4.85, actor: 'table', do: 'vanish', dur: 0.15 },
    { at: 5.2, actor: 'lunch', do: 'vanish', dur: 0.15 },
    { at: 5.5, actor: 'sword', do: 'vanish', dur: 0.15 },
    { at: 4.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    // 另一張小餐桌滑進來，兩個噗通坐下
    { at: 6.2, actor: 'warrior', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 6.2, actor: 'warrior', do: 'moveTo', to: { x: 151, y: 71.1 }, arc: 8, dur: 0.4 },
    { at: 6.2, actor: 'pc', do: 'moveTo', to: { x: 124, y: 71.1 }, arc: 8, dur: 0.4 },
    { at: 6.25, actor: 'table2', do: 'enter', from: { x: 190, y: 72.8 }, dur: 0.45, ease: 'out' },
    { at: 6.25, actor: 'bowl', do: 'enter', from: { x: 190, y: 66.5 }, dur: 0.45, ease: 'out' },
    { at: 6.6, actor: 'warrior', do: 'flip' },
    { at: 6.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.7, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.7, actor: 'pc', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 6.7, actor: 'warrior', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 7.2, actor: 'warrior', do: 'bounce', amount: 1.5, times: 3, dur: 0.7 },
    // 回馬槍：花生又敬禮——手一揮，麵碗飛起來扣在戰士頭上
    { at: 8.1, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.2, actor: 'bowl', do: 'moveTo', to: { x: 151, y: 60 }, arc: 14, dur: 0.45 },
    { at: 8.2, actor: 'bowl', do: 'rotateTo', amount: 180, dur: 0.45 },
    { at: 8.65, actor: 'warrior', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.65, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 9.0, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 9.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 9.3, actor: 'warrior', do: 'hop', amount: 3, dur: 0.3 },
    { at: 9.3, actor: 'bowl', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 由下往上落定：餐桌 → 木；便當盒 → 日；泡棉劍＋櫻桃 → 卜
    { at: 4.85, dur: 0.6, strokes: [6, 7, 8, 9], from: 'table', color: '#C92A2A' },
    { at: 5.2, dur: 0.5, strokes: [2, 3, 4, 5], from: 'lunch', color: '#C92A2A' },
    { at: 5.5, dur: 0.4, strokes: [0, 1], from: 'sword', color: '#E03131' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.15, kind: 'bubble', actor: 'warrior', emoji: '🍱', dur: 0.6 },
    { at: 0.85, kind: 'sweat', actor: 'pc' },
    { at: 1.25, kind: 'pop', actor: 'warrior', emoji: '❗', dur: 0.6 },
    { at: 1.45, kind: 'puff', actor: 'pc', dur: 0.4 },
    { at: 2.6, kind: 'dizzy', actor: 'warrior', dur: 0.5 },
    { at: 3.6, kind: 'pop', actor: 'warrior', emoji: '😁', dur: 0.4 },
    { at: 4.45, kind: 'burst', actor: 'pc', emoji: '💥', dur: 0.45 },
    { at: 4.5, kind: 'burst', actor: 'pc', emoji: '⭐', n: 6, dx: -6, dur: 0.6 },
    { at: 4.9, kind: 'dizzy', actor: 'warrior', dur: 1.2 },
    { at: 5.0, kind: 'dizzy', actor: 'pc', dx: -4, dur: 1.1 },
    { at: 6.7, kind: 'stink', actor: 'bowl', emoji: '♨️', dy: -2, dur: 1.2 },
    { at: 6.8, kind: 'pop', actor: 'pc', emoji: '🥄', dur: 0.7 },
    { at: 8.65, kind: 'burst', actor: 'warrior', emoji: '💦', n: 5, dx: -14, dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'pc', emoji: '😅', dur: 0.5 },
  ],
  camera: [
    // 飛撲那一下推近，撞完退回
    { at: 3.9, dur: 0.3, do: 'zoom', amount: 1.3, to: { x: 128, y: 56 } },
    { at: 4.5, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 4.45, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  cues: [
    { at: 0.2, sfx: 'whoosh' },
    { at: 0.9, sfx: 'slide' },
    { at: 1.3, say: '桌' },
    { at: 1.45, sfx: 'whoosh' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 3.15, sfx: 'slide' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 4.45, sfx: 'bonk' },
    { at: 5.95, say: '桌' },
    { at: 6.25, sfx: 'slide' },
    { at: 6.7, say: '餐桌' },
    { at: 8.65, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
