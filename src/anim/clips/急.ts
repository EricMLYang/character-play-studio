import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 急（重做）：花生頂著一疊響個不停的鬧鐘急著趕路，積木小隊跳起來疊成積木巨人擋路。花生衝過去被肚子彈回來；退到最後面全力一撞——整隻被彈飛，
// 鬧鐘飛上天，巨人正在笑，鬧鐘一個一個「咚咚咚」砸在他頭上，巨人像大樹一樣倒下，積木碎片和鬧鐘飛成「急」。國字讓到上方，救護車鳴笛衝到中間，花生跳上車頂敬禮（急救）。
// 回馬槍：巨人爬起來也跳上車頂，一屁股把車子和花生壓成扁扁的，車子「啵」一聲彈回來，把兩個彈飛到左右兩邊。急、急、急救
const P = 68.6 // 花生（size 20）站在地上的 y
const G = 63.6 // 積木巨人（size 32）
const A = 66.5 // 救護車（size 25）
const R = 51 // 花生站在救護車頂的 y
const STACK = ['pc', 'c1', 'c2', 'c3'] as const
const DY: Record<string, number> = { pc: 0, c1: -14, c2: -21, c3: -28 }
/** 花生和頭上那疊鬧鐘一起動 */
const go = (at: number, dur: number, x: number, extra: Partial<Move> = {}): Move[] =>
  STACK.map((actor) => ({ at, dur, actor, do: 'moveTo' as const, to: { x, y: P + DY[actor] }, ...extra }))

const clip: Clip = {
  char: '急',
  meta: { theme: '花生趕路撞積木巨人', cast: '浣熊花生＋積木小隊巨人＋鬧鐘＋救護車', gags: ['衝過去被肚子彈回來', '全力一撞自己彈飛', '偷笑的巨人被鬧鐘咚咚咚砸倒', '救護車頂被一屁股壓扁彈飛兩個'] },
  duration: 10,
  bg: { top: '#FFE8B8', bottom: '#FFF6DD', floor: '#E9D3A6', scenery: 'city' },
  actors: [
    { id: 'b1', emoji: '🧱', x: 112, y: 70, size: 10, hidden: true },
    { id: 'b2', emoji: '🧱', x: 124, y: 70, size: 10, hidden: true },
    { id: 'b3', emoji: '🧱', x: 136, y: 70, size: 10, hidden: true },
    { id: 'giant', emoji: 'hero:brick/idle', x: 120, y: G, size: 32, hidden: true },
    { id: 'amb', emoji: '🚑', x: 80, y: A, size: 25, hidden: true, flip: true },
    { id: 'box', emoji: '📦', x: 98, y: 62, size: 9, hidden: true },
    { id: 'pc', emoji: 'hero:raccoon/carry', x: 34, y: P, size: 20, hidden: true, flip: true },
    { id: 'c1', emoji: '⏰', x: 34, y: P - 14, size: 8, hidden: true },
    { id: 'c2', emoji: '⏰', x: 34, y: P - 21, size: 8, hidden: true },
    { id: 'c3', emoji: '⏰', x: 34, y: P - 28, size: 8, hidden: true },
  ],
  moves: [
    // 頂著鬧鐘急急忙忙跑進來
    ...STACK.map((actor) => ({ at: 0, dur: 0.45, actor, do: 'enter' as const, from: { x: 8, y: P + DY[actor] }, ease: 'out' as const })),
    { at: 0.65, actor: 'c1', do: 'shake', amount: 1, dur: 0.6 },
    { at: 0.65, actor: 'c2', do: 'shake', amount: 1, dur: 0.6 },
    { at: 0.65, actor: 'c3', do: 'shake', amount: 1, dur: 0.6 },
        // 積木小隊跳進來，喀喀疊成積木巨人
    { at: 0.2, actor: 'b1', do: 'enter', from: { x: 172, y: 70 }, dur: 0.45 },
    { at: 0.3, actor: 'b2', do: 'enter', from: { x: 184, y: 70 }, dur: 0.45 },
    { at: 0.4, actor: 'b3', do: 'enter', from: { x: 196, y: 70 }, dur: 0.45 },
    { at: 0.95, actor: 'b1', do: 'moveTo', to: { x: 118, y: 58 }, arc: 10, dur: 0.3 },
    { at: 0.95, actor: 'b2', do: 'moveTo', to: { x: 118, y: 58 }, arc: 16, dur: 0.3 },
    { at: 0.95, actor: 'b3', do: 'moveTo', to: { x: 118, y: 58 }, arc: 10, dur: 0.3 },
    { at: 1.25, actor: 'b1', do: 'vanish', dur: 0.08 }, { at: 1.25, actor: 'b2', do: 'vanish', dur: 0.08 }, { at: 1.25, actor: 'b3', do: 'vanish', dur: 0.08 },
    { at: 1.25, actor: 'giant', do: 'pop', dur: 0.3 },
    { at: 1.55, actor: 'giant', do: 'squash', amount: 0.12, dur: 0.25 },
    // 第一次：衝過去——被肚子彈回來
        ...go(1.75, 0.35, 98, { ease: 'in' }),
    { at: 2.1, actor: 'giant', do: 'squash', amount: 0.15, dur: 0.25 },
        ...go(2.1, 0.35, 64, { ease: 'out' }),
    { at: 2.1, actor: 'c3', do: 'tilt', amount: 20, dur: 0.45 },
    { at: 2.1, actor: 'c2', do: 'tilt', amount: -12, dur: 0.45 },
    { at: 2.5, actor: 'giant', do: 'swap', emoji: 'hero:brick/happy' },
    // 第二次：退到最後面，蓄力
        ...go(2.55, 0.4, 26),
    ...pressStack(3.0, 0.3, -0.3, 20, ['c1', 'c2', 'c3']),
    { at: 3.0, actor: 'pc', do: 'squash', amount: -0.3, dur: 0.3 },
    // 全力衝過去——咚！整隻彈飛，鬧鐘飛上天
    ...go(3.3, 0.22, 98, { ease: 'in', anticipate: 5 }),
    { at: 3.52, actor: 'giant', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 3.52, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 3.52, actor: 'pc', do: 'moveTo', to: { x: 22, y: P }, arc: 22, dur: 0.6, ease: 'out' },
    { at: 3.52, actor: 'pc', do: 'spin', times: -1, dur: 0.6 },
    // 抱著的箱子也飛出去
    { at: 3.52, actor: 'box', do: 'pop' },
    { at: 3.52, actor: 'box', do: 'moveTo', to: { x: -14, y: 40 }, arc: 10, dur: 0.6, ease: 'linear' },
    { at: 3.52, actor: 'box', do: 'spin', times: -2, dur: 0.55 },
    { at: 3.52, actor: 'c1', do: 'moveTo', to: { x: 116, y: 46 }, arc: 30, dur: 0.9, ease: 'linear' },
    { at: 3.52, actor: 'c2', do: 'moveTo', to: { x: 120, y: 46 }, arc: 34, dur: 1.1, ease: 'linear' },
    { at: 3.52, actor: 'c3', do: 'moveTo', to: { x: 124, y: 46 }, arc: 38, dur: 1.3, ease: 'linear' },
    { at: 3.52, actor: 'c1', do: 'spin', times: 2, dur: 0.9 },
    { at: 3.52, actor: 'c2', do: 'spin', times: -2, dur: 1.1 },
    { at: 3.52, actor: 'c3', do: 'spin', times: 3, dur: 1.3 },
    // 巨人拍肚子偷笑
    { at: 3.85, actor: 'giant', do: 'shake', amount: 1, dur: 0.5 },
    // 鬧鐘一個一個砸在他頭上：咚、咚、咚！每砸一個就彈成一筆「心」
    { at: 4.42, actor: 'giant', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.42, actor: 'giant', do: 'squash', amount: 0.14, dur: 0.18 },
    { at: 4.42, actor: 'c1', do: 'vanish', dur: 0.08 },
    { at: 4.62, actor: 'giant', do: 'squash', amount: 0.18, dur: 0.18 },
    { at: 4.62, actor: 'c2', do: 'vanish', dur: 0.08 },
    { at: 4.82, actor: 'giant', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.82, actor: 'giant', do: 'squash', amount: 0.28, dur: 0.22 },
    { at: 4.82, actor: 'c3', do: 'vanish', dur: 0.08 },
    // 搖兩下，像大樹一樣往後倒——轟！
    { at: 5.0, actor: 'giant', do: 'tilt', amount: -8, dur: 0.25 },
    { at: 5.2, actor: 'giant', do: 'rotateTo', amount: 90, dur: 0.3, ease: 'in' },
    { at: 5.2, actor: 'giant', do: 'moveTo', to: { x: 120, y: G + 8 }, dur: 0.3, ease: 'in' },
    // 花生坐起來，看呆了
    { at: 4.45, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 6.0, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.0, actor: 'pc', do: 'hop', amount: 4, dur: 0.3 },
    // 國字讓位：救護車鳴笛衝到中間
    { at: 6.85, actor: 'amb', do: 'enter', from: { x: -20, y: A }, dur: 0.5, ease: 'back' },
    { at: 7.0, actor: 'pc', do: 'tilt', amount: 15, dur: 0.3 },
    // 花生跳上車頂敬禮
    { at: 7.4, actor: 'pc', do: 'moveTo', to: { x: 76, y: R }, arc: 14, dur: 0.35, ease: 'out' },
    { at: 7.75, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.75, actor: 'amb', do: 'squash', amount: 0.15, dur: 0.25 },
    ...pressStack(7.75, 0.25, 0.15, 20, ['pc']),
    // 回馬槍：巨人爬起來，也要坐救護車
    { at: 7.8, actor: 'giant', do: 'rotateTo', amount: -90, dur: 0.3, ease: 'out' },
    { at: 7.8, actor: 'giant', do: 'moveTo', to: { x: 120, y: G }, dur: 0.3, ease: 'out' },
    { at: 8.1, actor: 'giant', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 8.1, actor: 'giant', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 8.25, actor: 'giant', do: 'moveTo', to: { x: 88, y: 50 }, arc: 14, dur: 0.3, ease: 'in' },
    // 一屁股坐下去：車子和花生都被壓成扁扁的
    { at: 8.55, actor: 'amb', do: 'squash', amount: 0.55, dur: 0.4 },
    ...pressStack(8.55, 0.4, 0.55, 20, ['pc', 'giant']),
    { at: 8.55, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 8.55, actor: 'pc', do: 'squash', amount: 0.4, dur: 0.4 },
    // 啵！彈回來，兩個彈飛到左右兩邊；救護車鳴笛開走
    { at: 8.95, actor: 'amb', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 8.95, actor: 'pc', do: 'moveTo', to: { x: 22, y: P }, arc: 26, dur: 0.5, ease: 'out' },
    { at: 8.95, actor: 'pc', do: 'spin', times: -2, dur: 0.5 },
    { at: 8.95, actor: 'giant', do: 'moveTo', to: { x: 132, y: G }, arc: 26, dur: 0.5, ease: 'out' },
    { at: 8.95, actor: 'giant', do: 'spin', times: 2, dur: 0.5 },
    { at: 8.95, actor: 'giant', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 8.98, actor: 'amb', do: 'moveTo', to: { x: 190, y: A }, dur: 0.3, ease: 'in' },
    { at: 9.5, actor: 'giant', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 9.6, actor: 'pc', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 9.8, actor: 'giant', do: 'swap', emoji: 'hero:brick/happy' },
  ],
  builds: [
    // 巨人倒地震飛的積木碎片 → 上面的 ⺈ 和三橫；空中的三個鬧鐘 → 心
    { at: 4.42, dur: 0.4, strokes: [5, 6], from: 'c1', color: '#F59F00' },
    { at: 4.62, dur: 0.35, strokes: [7], from: 'c2', color: '#F59F00' },
    { at: 4.82, dur: 0.35, strokes: [8], from: 'c3', color: '#F59F00' },
    { at: 5.5, dur: 0.45, strokes: [0, 1, 2, 3, 4], from: 'giant', color: '#E03131' },
  ],
  glyph: [
    { at: 6.0, dur: 0.4, do: 'wobble' },
    { at: 6.8, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.7, kind: 'burst', actor: 'c2', emoji: '🔔', n: 5, dur: 0.6 },
    { at: 0.9, kind: 'sweat', actor: 'pc' },
    { at: 1.3, kind: 'burst', actor: 'giant', emoji: '✨', n: 6, dur: 0.5 },
    { at: 1.6, kind: 'pop', actor: 'giant', emoji: '💪', dur: 0.45 },
    { at: 2.1, kind: 'burst', x: 100, y: 58, n: 1, dur: 0.3 },
    { at: 2.5, kind: 'pop', actor: 'giant', emoji: '😝', dur: 0.4 },
    { at: 2.5, kind: 'sweat', actor: 'pc' },
    { at: 3.0, kind: 'pop', actor: 'pc', emoji: '😤', dur: 0.35 },
    { at: 3.3, kind: 'puff', actor: 'pc', dur: 0.4 },
    { at: 3.52, kind: 'burst', x: 100, y: 56, n: 1, dur: 0.35 },
    { at: 3.9, kind: 'pop', actor: 'giant', emoji: '😆', dur: 0.5 },
    { at: 4.1, kind: 'dizzy', actor: 'pc', dur: 0.4 },
    { at: 4.42, kind: 'burst', actor: 'giant', n: 1, dy: 2, dur: 0.2 },
    { at: 4.62, kind: 'burst', actor: 'giant', n: 1, dy: 2, dur: 0.2 },
    { at: 4.82, kind: 'burst', actor: 'giant', n: 1, dy: 2, dur: 0.25 },
    { at: 4.9, kind: 'dizzy', actor: 'giant', dur: 0.5 },
    { at: 5.5, kind: 'puff', actor: 'giant', dur: 0.5 },
    { at: 4.5, kind: 'pop', actor: 'pc', emoji: '😲', dur: 0.4 },
    { at: 6.9, kind: 'pop', actor: 'amb', emoji: '🚨', dy: 2, dur: 0.6 },
    { at: 7.75, kind: 'burst', actor: 'amb', emoji: '🚨', n: 6, dur: 0.6 },
    { at: 8.1, kind: 'pop', actor: 'pc', emoji: '❗', dx: -10, dy: 10, dur: 0.4 },
    { at: 8.55, kind: 'puff', actor: 'amb', dur: 0.4 },
    { at: 8.6, kind: 'sweat', actor: 'pc' },
    { at: 9.45, kind: 'dizzy', actor: 'giant', dur: 0.5 },
  ],
  camera: [
    { at: 3.52, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: 5.5, dur: 0.4, do: 'shake', amount: 2.2 },
    { at: 7.75, dur: 0.45, do: 'punch', amount: 0.1, to: { x: 78, y: 52 } },
    { at: 8.55, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: 5.5, dur: 0.04, level: -0.7 },
    { at: 5.54, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.7, sfx: 'clink' },
    { at: 0.95, say: '急' },
    { at: 1.25, sfx: 'clink' },
    { at: 2.1, sfx: 'boing' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.52, sfx: 'boing' },
    { at: 4.42, sfx: 'bonk' },
    { at: 4.62, sfx: 'bonk' },
    { at: 4.82, sfx: 'bonk' },
    { at: 5.5, sfx: 'rumble' },
    { at: 6.05, say: '急' },
    { at: 6.85, sfx: 'whoosh' },
    { at: 7.75, say: '急救' },
    { at: 8.55, sfx: 'deflate' },
    { at: 8.95, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
