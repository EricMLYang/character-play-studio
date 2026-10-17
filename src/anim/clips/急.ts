import type { Clip, Move } from '../clip'

// 急（花生戳倒積木巨人）：花生抱著一疊響個不停的鬧鐘急急忙忙趕路，積木小隊跳起來疊成三倍高的積木巨人擋路，拍胸口衝過來。
// 花生只往旁邊跳一步、伸出小爪子輕輕一戳——巨人像大樹一樣「咚」地倒下，積木散開排成「急」。花生跳上滾過來的圓積木，手忙腳亂接住掉下來的鬧鐘。
// 回馬槍：鬧鐘又全部一起響，他嚇得原地狂跑，一溜煙衝出畫面，又探頭回來敬禮。急、急、急忙
const STACK = ['pc', 'c1', 'c2', 'c3'] as const
const DY = { pc: 0, c1: -10, c2: -15.5, c3: -21 }
/** 花生和頭上那疊鬧鐘一起動 */
const go = (at: number, dur: number, x: number, y: number, extra: Partial<Move> = {}): Move[] =>
  STACK.map((actor) => ({ at, dur, actor, do: 'moveTo' as const, to: { x, y: y + DY[actor] }, ...extra }))

const clip: Clip = {
  char: '急',
  meta: { theme: '花生戳倒積木巨人', cast: '浣熊花生＋積木小隊巨人＋鬧鐘', gags: ['巨人拍胸衝過來被一戳就倒', '手忙腳亂接鬧鐘', '鬧鐘齊響狂跑出畫面'] },
  duration: 10,
  bg: { top: '#FFF3C2', bottom: '#FFE9A3', floor: '#F6E2B3', scenery: 'hills' },
  actors: [
    { id: 'b1', emoji: '🧱', x: 124, y: 73.2, size: 9, hidden: true },
    { id: 'b2', emoji: '🧱', x: 136, y: 73.2, size: 9, hidden: true },
    { id: 'b3', emoji: '🧱', x: 148, y: 73.2, size: 9, hidden: true },
    { id: 'giant', emoji: 'hero:brick/march', x: 136, y: 71.5, size: 13, hidden: true },
    { id: 'ball', emoji: '🟠', x: 24, y: 73.5, size: 7, hidden: true },
    { id: 'pc', emoji: 'hero:raccoon/carry', x: 50, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'c1', emoji: '⏰', x: 50, y: 61.1, size: 6, hidden: true },
    { id: 'c2', emoji: '⏰', x: 50, y: 55.6, size: 6, hidden: true },
    { id: 'c3', emoji: '⏰', x: 50, y: 50.1, size: 6, hidden: true },
  ],
  moves: [
    // 小短腿飛快跑進來，看一眼鬧鐘，煞車
    ...STACK.map((actor) => ({ at: 0, dur: 0.9, actor, do: 'enter' as const, from: { x: -14, y: 71.1 + DY[actor] }, ease: 'back' as const })),
    { at: 0, actor: 'pc', do: 'bounce', amount: 1.5, times: 6, dur: 0.9 },
    { at: 0.95, actor: 'c3', do: 'tilt', amount: 18, dur: 0.5 },
    { at: 0.95, actor: 'c2', do: 'tilt', amount: -10, dur: 0.5 },
    // 積木小隊踏步進場，跳起來喀喀疊成巨人
    { at: 1.4, actor: 'b1', do: 'enter', from: { x: 172, y: 73.2 }, dur: 0.4 },
    { at: 1.45, actor: 'b2', do: 'enter', from: { x: 184, y: 73.2 }, dur: 0.4 },
    { at: 1.5, actor: 'b3', do: 'enter', from: { x: 196, y: 73.2 }, dur: 0.4 },
    { at: 2.0, actor: 'b1', do: 'moveTo', to: { x: 136, y: 52 }, arc: 8, dur: 0.3 },
    { at: 2.0, actor: 'b3', do: 'moveTo', to: { x: 136, y: 52 }, arc: 8, dur: 0.3 },
    { at: 2.0, actor: 'b2', do: 'moveTo', to: { x: 136, y: 52 }, arc: 14, dur: 0.3 },
    { at: 2.3, actor: 'b1', do: 'vanish', dur: 0.1 }, { at: 2.3, actor: 'b2', do: 'vanish', dur: 0.1 }, { at: 2.3, actor: 'b3', do: 'vanish', dur: 0.1 },
    { at: 2.3, actor: 'giant', do: 'pop', dur: 0.3 },
    { at: 2.3, actor: 'giant', do: 'scaleTo', amount: 2.4, dur: 0.3, ease: 'back' },
    // 拍胸口、跺腳，地板都跳了
    { at: 2.7, actor: 'giant', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 2.95, actor: 'giant', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 2.7, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 2.75, actor: 'c3', do: 'tilt', amount: -25, dur: 0.5 },
    { at: 2.75, actor: 'c2', do: 'tilt', amount: 15, dur: 0.5 },
    // 低頭衝過來！
    { at: 3.25, actor: 'giant', do: 'moveTo', to: { x: 58, y: 71.5 }, dur: 0.55, anticipate: 5, ease: 'in' },
    { at: 3.3, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 定格半拍……往旁邊一跳，輕輕一戳
    ...go(3.6, 0.2, 30, 71.1, { arc: 5 }),
    { at: 3.95, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 3.95, actor: 'pc', do: 'moveTo', to: { x: 34, y: 71.1 }, dur: 0.1 },
    { at: 4.05, actor: 'pc', do: 'moveTo', to: { x: 30, y: 71.1 }, dur: 0.15 },
    { at: 3.8, actor: 'giant', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.05, actor: 'giant', do: 'shake', amount: 1.2, dur: 0.4 },
    // 像大樹一樣倒下——咚！
    { at: 4.45, actor: 'giant', do: 'rotateTo', amount: 90, dur: 0.4, ease: 'in' },
    { at: 4.85, actor: 'giant', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 4.85, actor: 'giant', do: 'swap', emoji: 'hero:brick/dizzy' },
    // 鬧鐘被震飛
    { at: 4.85, actor: 'c1', do: 'moveTo', to: { x: 20, y: -15 }, dur: 0.35, ease: 'out' },
    { at: 4.9, actor: 'c2', do: 'moveTo', to: { x: 30, y: -15 }, dur: 0.35, ease: 'out' },
    { at: 4.95, actor: 'c3', do: 'moveTo', to: { x: 40, y: -15 }, dur: 0.35, ease: 'out' },
    // 巨人散成一塊頭昏的小積木，滾到右邊
    { at: 5.3, actor: 'giant', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 5.3, actor: 'giant', do: 'scaleTo', amount: 1 / 2.4, dur: 0.3 },
    { at: 5.3, actor: 'giant', do: 'moveTo', to: { x: 134, y: 71.5 }, arc: 10, dur: 0.4 },
    // 一顆圓積木滾過來，花生跳上去，手忙腳亂接鬧鐘
    { at: 5.6, actor: 'ball', do: 'enter', from: { x: -8, y: 73.5 }, dur: 0.4, ease: 'out' },
    { at: 5.6, actor: 'ball', do: 'spin', times: 2, dur: 0.4 },
    { at: 6.05, actor: 'pc', do: 'moveTo', to: { x: 24, y: 64 }, arc: 6, dur: 0.3 },
    { at: 6.35, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 6.3, actor: 'c1', do: 'moveTo', to: { x: 24, y: 54 }, dur: 0.3, ease: 'in' },
    { at: 6.6, actor: 'c1', do: 'moveTo', to: { x: 16, y: 44 }, dur: 0.3, ease: 'out' },
    { at: 6.5, actor: 'c2', do: 'moveTo', to: { x: 30, y: 52 }, dur: 0.3, ease: 'in' },
    { at: 6.8, actor: 'c2', do: 'moveTo', to: { x: 34, y: 42 }, dur: 0.3, ease: 'out' },
    { at: 6.7, actor: 'c3', do: 'moveTo', to: { x: 22, y: 53 }, dur: 0.3, ease: 'in' },
    { at: 6.9, actor: 'pc', do: 'shake', amount: 1.6, dur: 0.9 },
    { at: 6.9, actor: 'ball', do: 'spin', times: 3, dur: 0.9 },
    ...go(7.2, 0.35, 24, 64),
    { at: 7.9, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 回馬槍：鬧鐘一起響！嚇得狂跑出畫面，再探頭回來敬禮
    { at: 8.4, actor: 'c1', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 8.4, actor: 'c2', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 8.4, actor: 'c3', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 8.45, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 8.45, actor: 'pc', do: 'shake', amount: 2, dur: 0.4 },
    ...go(8.85, 0.25, -20, 64, { ease: 'in' }),
    { at: 8.85, actor: 'ball', do: 'spin', times: 2, dur: 0.4 },
    { at: 9.3, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    ...go(9.3, 0.3, 10, 71.1, { ease: 'back' }),
    { at: 9.6, actor: 'giant', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 巨人散開的積木：上面的 ⺈、中間三橫、下面的心
    { at: 4.9, dur: 0.4, strokes: [0, 1], from: 'giant', color: '#F76707' },
    { at: 5.15, dur: 0.5, strokes: [2, 3, 4], from: 'giant', color: '#F76707' },
    { at: 5.5, dur: 0.6, strokes: [5, 6, 7, 8], from: { x: 80, y: 76 }, color: '#E8590C' },
  ],
  glyph: [{ at: 6.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.95, kind: 'pop', actor: 'pc', emoji: '⏰', dy: -18, dur: 0.6 },
    { at: 1.2, kind: 'sweat', actor: 'pc' },
    { at: 2.3, kind: 'burst', actor: 'giant', emoji: '✨', n: 6, dur: 0.5 },
    { at: 2.7, kind: 'puff', actor: 'giant', dur: 0.4 },
    { at: 2.95, kind: 'puff', actor: 'giant', dur: 0.4 },
    { at: 3.3, kind: 'pop', actor: 'pc', emoji: '❗', dy: -16, dur: 0.5 },
    { at: 3.95, kind: 'pop', actor: 'pc', emoji: '👉', dx: 8, dy: 6, dur: 0.4 },
    { at: 4.85, kind: 'puff', actor: 'giant', dur: 0.6 },
    { at: 5.6, kind: 'dizzy', actor: 'giant', dur: 1.6 },
    { at: 6.9, kind: 'sweat', actor: 'pc' },
    { at: 8.4, kind: 'burst', actor: 'c2', emoji: '🔔', n: 5, dur: 0.6 },
  ],
  camera: [
    // 巨人衝過來那半拍推近花生，倒下前回到全景
    { at: 3.4, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 46, y: 56 } },
    { at: 4.2, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.85, dur: 0.5, do: 'shake', amount: 2.2 },
  ],
  cues: [
    { at: 0.95, say: '急' },
    { at: 1.0, sfx: 'slide' },
    { at: 2.3, sfx: 'clink' },
    { at: 2.7, sfx: 'rumble' },
    { at: 3.25, sfx: 'whoosh' },
    { at: 3.95, sfx: 'tap' },
    { at: 4.85, sfx: 'bonk' },
    { at: 6.15, say: '急' },
    { at: 6.95, say: '急忙' },
    { at: 8.4, sfx: 'clink' },
    { at: 8.85, sfx: 'whoosh' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
