import type { Clip, Move } from '../clip'

// 蜂：大怪獸想吃掛在高處的蜂巢，伸手搆不到，就把六角積木一塊塊疊成高塔；尾巴一甩撞掉一塊，放回去更歪；
// 最後放上一塊方糖那麼小的積木——停一拍——整座塔嘩啦倒下，碎塊堆成「蜂」，把怪獸埋到只剩眼睛。
// 唸「蜜蜂」時一隻小蜜蜂從堆裡嗡嗡飛出來停在牠的角上；最後蜂巢自己掉下來，剛好落在怪獸頭上。蜂、蜂、蜜蜂
const B = (id: string, y: number, size = 8) => ({ id, emoji: '🟨', x: 104, y, size, hidden: true, tint: 'saturate(1.4) hue-rotate(-8deg)' })
const lean = (at: number, dx: number): Move[] =>
  ['k2', 'k3', 'k4', 'k5', 'k6'].map((actor, i) => ({ at, dur: 0.35, actor, do: 'moveTo' as const, to: { x: 104 + dx * (i + 1), y: [65.6, 57.6, 49.6, 41.6, 35.8][i] } }))
const clip: Clip = {
  char: '蜂',
  meta: { theme: '怪獸疊積木吃蜂蜜', cast: '大怪獸＋六角積木＋蜂巢＋小蜜蜂', gags: ['搆不到', '疊疊樂越疊越歪', '尾巴撞掉一塊', '最後一小塊壓垮', '被埋只剩眼睛', '蜂巢掉頭上'] },
  duration: 10,
  bg: { top: '#FFF9DB', bottom: '#FFF3BF', floor: '#E9FAC8', scenery: 'forest' },
  actors: [
    { id: 'branch', emoji: '🌿', x: 136, y: 8, size: 12, float: true },
    { id: 'honey', emoji: '🍯', x: 128, y: 15, size: 10, float: true },
    { id: 'mon', emoji: 'hero:monster/idle', x: 126, y: 69.4, size: 18, hidden: true },
    B('k1', 73.6), B('k2', 65.6), B('k3', 57.6), B('k4', 49.6), B('k5', 41.6), B('k6', 35.8, 4),
    { id: 'm1', emoji: '🟨', x: 116, y: 73.2, size: 9, hidden: true },
    { id: 'm2', emoji: '🟨', x: 126, y: 72.6, size: 10, hidden: true },
    { id: 'm3', emoji: '🟨', x: 136, y: 73.2, size: 9, hidden: true },
    { id: 'bee', emoji: '🐝', x: 128, y: 68, size: 6, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'mon', do: 'enter', from: { x: 180, y: 69.4 }, dur: 0.5, ease: 'out' },
    // 盯著蜂巢舔舔嘴，伸手——搆不到
    { at: 0.8, actor: 'mon', do: 'squash', amount: -0.3, dur: 0.45 },
    { at: 0.8, actor: 'mon', do: 'hop', amount: 4, dur: 0.45 },
    // 碰！第一塊積木
    { at: 1.15, actor: 'k1', do: 'drop', dur: 0.4 },
    { at: 1.3, actor: 'mon', do: 'squash', amount: 0.15, dur: 0.2 },
    // 越疊越快
    { at: 1.7, actor: 'k2', do: 'drop', dur: 0.35 },
    { at: 2.0, actor: 'k3', do: 'drop', dur: 0.35 },
    { at: 2.3, actor: 'k4', do: 'drop', dur: 0.35 },
    ...[1.75, 2.05, 2.35].map((at) => ({ at, actor: 'mon', do: 'hop' as const, amount: 2, dur: 0.2 })),
    // 轉身——尾巴一甩撞掉最上面那塊
    { at: 2.65, actor: 'mon', do: 'flip' },
    { at: 2.7, actor: 'k4', do: 'moveTo', to: { x: 146, y: 73.6 }, arc: 8, dur: 0.35 },
    { at: 2.7, actor: 'k4', do: 'spin', times: 1, dur: 0.35 },
    { at: 2.95, actor: 'mon', do: 'flip' },
    { at: 2.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    // 放回去，更歪了
    { at: 3.2, actor: 'k4', do: 'moveTo', to: { x: 106, y: 49.6 }, arc: 12, dur: 0.35 },
    { at: 3.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 3.5, actor: 'k5', do: 'drop', dur: 0.35 },
    ...lean(3.5, -0.8),
    // 踮腳放上方糖那麼小的最後一塊——停一拍
    { at: 3.75, actor: 'mon', do: 'moveTo', to: { x: 122, y: 66 }, dur: 0.3 },
    { at: 3.8, actor: 'k6', do: 'drop', dur: 0.45 },
    ...lean(3.95, 1.3),
    { at: 4.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    // 嘩啦——全倒，把怪獸埋起來
    ...lean(4.3, 3.5),
    { at: 4.45, actor: 'k1', do: 'vanish', dur: 0.15 },
    { at: 4.45, actor: 'k2', do: 'vanish', dur: 0.15 },
    { at: 4.45, actor: 'k3', do: 'vanish', dur: 0.15 },
    { at: 4.6, actor: 'k4', do: 'vanish', dur: 0.15 },
    { at: 4.5, actor: 'k5', do: 'moveTo', to: { x: 120, y: 66 }, arc: 6, dur: 0.3 },
    { at: 4.5, actor: 'k6', do: 'moveTo', to: { x: 132, y: 68 }, arc: 6, dur: 0.3 },
    { at: 4.8, actor: 'k5', do: 'vanish', dur: 0.15 },
    { at: 4.8, actor: 'k6', do: 'vanish', dur: 0.15 },
    { at: 4.4, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 4.45, actor: 'mon', do: 'moveTo', to: { x: 126, y: 74 }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'm1', do: 'pop', dur: 0.2 },
    { at: 4.65, actor: 'm2', do: 'pop', dur: 0.2 },
    { at: 4.7, actor: 'm3', do: 'pop', dur: 0.2 },
    { at: 4.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    // 「蜜蜂」：小蜜蜂從堆裡飛出來，繞一圈停在角上
    { at: 6.2, actor: 'bee', do: 'pop', dur: 0.2 },
    { at: 6.3, actor: 'bee', do: 'moveTo', to: { x: 146, y: 46 }, arc: 6, dur: 0.4 },
    { at: 6.7, actor: 'bee', do: 'moveTo', to: { x: 126, y: 58 }, arc: 8, dur: 0.45 },
    { at: 7.2, actor: 'bee', do: 'bounce', times: 3, amount: 1.5, dur: 0.9 },
    { at: 7.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 7.4, actor: 'mon', do: 'shake', amount: 0.6, dur: 0.4 },
    // 回馬槍：蜂巢終於自己掉下來——落在怪獸頭上
    { at: 8.3, actor: 'honey', do: 'shake', amount: 1, dur: 0.3 },
    { at: 8.3, actor: 'bee', do: 'moveTo', to: { x: 146, y: 40 }, arc: 4, dur: 0.3 },
    { at: 8.6, actor: 'honey', do: 'moveTo', to: { x: 126, y: 61 }, dur: 0.5, ease: 'bounce' },
    { at: 8.85, actor: 'mon', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 9.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
  ],
  builds: [
    // 倒下的積木：左邊 → 虫；右邊 → 夆
    { at: 4.45, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'k2', color: '#E8590C' },
    { at: 4.6, dur: 0.85, strokes: [6, 7, 8, 9, 10, 11, 12], from: 'k4', color: '#E8590C' },
  ],
  glyph: [{ at: 5.5, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'mon', emoji: '🍯', dur: 0.8 },
    { at: 1.0, kind: 'sweat', actor: 'mon' },
    { at: 2.95, kind: 'pop', actor: 'mon', emoji: '😳', dur: 0.4 },
    { at: 4.0, kind: 'sweat', actor: 'mon' },
    { at: 4.45, kind: 'burst', actor: 'mon', emoji: '🟨', n: 6, dur: 0.6 },
    { at: 5.0, kind: 'dizzy', actor: 'mon', dy: 4, dur: 1.0 },
    { at: 7.5, kind: 'pop', actor: 'mon', emoji: '👋', dx: -10, dy: 8, dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'mon', emoji: '😋', dx: -8, dur: 0.6 },
  ],
  camera: [
    // 放最後一小塊時慢慢推近，倒下前退回全景再震
    { at: 3.6, dur: 0.7, do: 'zoom', amount: 1.3, to: { x: 108, y: 45 } },
    { at: 4.25, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 4.45, dur: 0.4, do: 'shake', amount: 1.3 },
  ],
  cues: [
    { at: 1.32, say: '蜂' },
    { at: 1.3, sfx: 'tap' },
    { at: 1.83, sfx: 'tap' },
    { at: 2.13, sfx: 'tap' },
    { at: 2.43, sfx: 'tap' },
    { at: 2.7, sfx: 'bonk' },
    { at: 3.93, sfx: 'clink' },
    { at: 4.4, sfx: 'rumble' },
    { at: 5.5, say: '蜂' },
    { at: 6.3, sfx: 'blip' },
    { at: 6.4, say: '蜜蜂' },
    { at: 8.85, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
