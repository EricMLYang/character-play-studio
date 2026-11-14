import type { Clip } from '../clip'

// 熊（重做）：花生想偷吃比他還高的大蜂蜜罐（觀眾早就看到罐子裡探出一對熊耳朵）。跳起來搆不到、滑下來屁股著地；退到最後面一衝，頭下腳上栽進罐子卡住、腳亂踢。
// 罐子越抖越鼓「碰」地炸開，蜂蜜噴成「能」，他被炸飛、甩掉身上的四滴蜂蜜落成「灬」。國字讓到上方，小熊抱著小蜜罐跳到中間（小熊），回馬槍：熊媽媽來了，花生嚇得把頭塞進小蜜罐，頂著罐子瞎跑撞樹。熊、熊、小熊
const C = 68.6 // 花生（size 20）站在地上的 y
const K = 70.3 // 小熊（size 16）
const M = 64.4 // 熊媽媽（size 30）

const clip: Clip = {
  char: '熊',
  meta: { theme: '偷吃大蜂蜜罐', cast: '浣熊花生＋超大蜂蜜罐＋躲在罐裡的小熊＋熊媽媽＋小蜜罐', gags: ['罐子裡探出熊耳朵他沒看到', '跳起來搆不到滑下來', '頭下腳上栽進罐子卡住', '罐子炸開蜂蜜變成字', '嚇得把頭塞進小蜜罐瞎跑撞樹'] },
  duration: 10,
  bg: { top: '#E6F4D9', bottom: '#F6FBEF', floor: '#C9DDA8', scenery: 'forest' },
  actors: [
    { id: 'cub', emoji: '🐻', x: 104, y: 64, size: 16 },
    { id: 'coon', emoji: 'hero:raccoon/idle', x: 30, y: C, size: 20, flip: true, hidden: true },
    { id: 'pot', emoji: '🍯', x: 104, y: 66.1, size: 26 },
    { id: 'jar', emoji: '🍯', x: 104, y: 66, size: 9, hidden: true },
    { id: 'mama', emoji: '🐻', x: 182, y: M, size: 30 },
  ],
  moves: [
    // 花生走進來，看到大蜂蜜罐
    { at: 0, actor: 'coon', do: 'enter', from: { x: -15, y: C }, dur: 0.6, ease: 'out' },
    { at: 0.7, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 觀眾看到：罐子裡探出熊耳朵，他一轉頭又縮回去
    { at: 1.1, actor: 'cub', do: 'moveTo', to: { x: 104, y: 57 }, dur: 0.25, ease: 'out' },
    { at: 1.45, actor: 'cub', do: 'tilt', amount: 12, dur: 0.3 },
    { at: 1.8, actor: 'cub', do: 'moveTo', to: { x: 104, y: 64 }, dur: 0.15, ease: 'in' },
    // 第一次：走過去跳起來搆罐口——搆不到，滑下來屁股著地
    { at: 1.4, actor: 'coon', do: 'moveTo', to: { x: 80, y: C }, dur: 0.5, ease: 'out' },
    { at: 2.0, actor: 'coon', do: 'squash', amount: 0.25, dur: 0.15 },
    { at: 2.15, actor: 'coon', do: 'hop', amount: 8, dur: 0.45 },
    { at: 2.6, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 2.6, actor: 'coon', do: 'squash', amount: 0.4, dur: 0.35 },
    // 第二次：退到最後面，蹲低蓄力
    { at: 3.0, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 3.0, actor: 'coon', do: 'moveTo', to: { x: 26, y: C }, dur: 0.45, ease: 'inOut' },
    { at: 3.5, actor: 'coon', do: 'squash', amount: 0.35, dur: 0.35 },
    // 一衝飛上去，頭下腳上栽進罐子
    { at: 3.85, actor: 'coon', do: 'moveTo', to: { x: 104, y: 40 }, arc: 18, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 3.85, actor: 'coon', do: 'rotateTo', amount: 180, dur: 0.4 },
    { at: 4.25, actor: 'pot', do: 'squash', amount: 0.15, dur: 0.25 },
    // 卡住了：腳亂踢，罐子越抖越鼓
    { at: 4.3, actor: 'coon', do: 'shake', amount: 1.6, dur: 0.75 },
    { at: 4.3, actor: 'pot', do: 'shake', amount: 1.2, dur: 0.75 },
    { at: 4.5, actor: 'pot', do: 'scaleTo', amount: 1.18, dur: 0.55, ease: 'in' },
    // 碰！罐子炸開
    { at: 5.05, actor: 'pot', do: 'vanish', dur: 0.08 },
    { at: 5.05, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 5.05, actor: 'coon', do: 'rotateTo', amount: -180, dur: 0.45 },
    { at: 5.05, actor: 'coon', do: 'moveTo', to: { x: 24, y: C }, arc: 26, dur: 0.55, ease: 'out' },
    { at: 5.05, actor: 'cub', do: 'moveTo', to: { x: 136, y: K }, arc: 28, dur: 0.6, ease: 'out' },
    { at: 5.05, actor: 'cub', do: 'spin', times: 1, dur: 0.6 },
    { at: 5.05, actor: 'jar', do: 'pop' },
    { at: 5.05, actor: 'jar', do: 'moveTo', to: { x: 126, y: 72 }, arc: 22, dur: 0.6, ease: 'out' },
    // 甩掉身上的蜂蜜
    { at: 5.7, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 5.7, actor: 'coon', do: 'shake', amount: 1.4, dur: 0.4 },
    // 小熊坐在旁邊偷舔小蜜罐
    { at: 6.45, actor: 'cub', do: 'tilt', amount: -14, dur: 0.4 },
    // 國字讓位：小熊撿起小蜜罐，跳到中間
    { at: 6.85, actor: 'cub', do: 'moveTo', to: { x: 126, y: K }, dur: 0.25, ease: 'out' },
    { at: 7.1, actor: 'cub', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 7.2, actor: 'cub', do: 'moveTo', to: { x: 86, y: K }, arc: 16, dur: 0.4, ease: 'out' },
    { at: 7.2, actor: 'jar', do: 'moveTo', to: { x: 76, y: 72 }, arc: 16, dur: 0.4, ease: 'out' },
    { at: 7.2, actor: 'cub', do: 'scaleTo', amount: 1.25, dur: 0.4, ease: 'back' },
    { at: 7.65, actor: 'cub', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 7.0, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 7.5, actor: 'coon', do: 'moveTo', to: { x: 52, y: C }, dur: 0.4, ease: 'out' },
    // 小熊把小蜜罐推給他
    { at: 8.0, actor: 'jar', do: 'moveTo', to: { x: 64, y: 72 }, dur: 0.3, ease: 'out' },
    { at: 8.0, actor: 'cub', do: 'tilt', amount: -12, dur: 0.3 },
    { at: 8.15, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 回馬槍：轟轟轟——熊媽媽來了
    { at: 8.1, actor: 'mama', do: 'moveTo', to: { x: 142, y: M }, dur: 0.45, ease: 'out' },
    { at: 8.6, actor: 'mama', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 8.6, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 8.6, actor: 'coon', do: 'hop', amount: 6, dur: 0.25 },
    // 嚇得把頭塞進小蜜罐
    { at: 8.85, actor: 'jar', do: 'moveTo', to: { x: 53, y: 66 }, dur: 0.12, ease: 'out' },
    { at: 8.85, actor: 'jar', do: 'scaleTo', amount: 1.5, dur: 0.12 },
    { at: 8.97, actor: 'coon', do: 'squash', amount: 0.2, dur: 0.15 },
    // 頂著罐子瞎跑，撞樹
    { at: 9.05, actor: 'coon', do: 'moveTo', to: { x: 16, y: C }, dur: 0.35, ease: 'in' },
    { at: 9.05, actor: 'jar', do: 'moveTo', to: { x: 17, y: 66 }, dur: 0.35, ease: 'in' },
    { at: 9.4, actor: 'coon', do: 'tilt', amount: -20, dur: 0.4 },
    { at: 9.4, actor: 'jar', do: 'tilt', amount: -20, dur: 0.4 },
    // 小熊跳回媽媽旁邊
    { at: 8.7, actor: 'cub', do: 'scaleTo', amount: 0.8, dur: 0.3 },
    { at: 8.7, actor: 'cub', do: 'moveTo', to: { x: 116, y: K }, arc: 10, dur: 0.35, ease: 'out' },
  ],
  builds: [
    // 炸開的蜂蜜 → 能；甩掉的四滴蜂蜜 → 灬
    { at: 5.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], from: 'pot', color: '#E8890C' },
    { at: 5.75, dur: 0.45, strokes: [10, 11, 12, 13], from: 'coon', color: '#B45309' },
  ],
  glyph: [
    { at: 6.2, dur: 0.4, do: 'wobble' },
    { at: 7.0, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'coon', emoji: '🍯', dur: 0.7 },
    { at: 1.4, kind: 'pop', actor: 'cub', emoji: '👀', dy: -2, dur: 0.4 },
    { at: 2.6, kind: 'puff', actor: 'coon', dur: 0.4 },
    { at: 2.7, kind: 'pop', actor: 'coon', emoji: '😑', dur: 0.4 },
    { at: 3.5, kind: 'sweat', actor: 'coon' },
    { at: 3.55, kind: 'puff', actor: 'coon', dx: -8, dy: 12, dur: 0.4 },
    { at: 4.3, kind: 'pop', actor: 'pot', emoji: '💢', dx: 10, dy: 2, dur: 0.4 },
    { at: 4.7, kind: 'sweat', actor: 'pot' },
    { at: 5.05, kind: 'burst', actor: 'pot', emoji: '🍯', n: 8, dur: 0.6 },
    { at: 5.6, kind: 'dizzy', actor: 'coon', dur: 0.9 },
    { at: 6.45, kind: 'pop', actor: 'cub', emoji: '😋', dx: -4, dur: 0.45 },
    { at: 7.0, kind: 'pop', actor: 'coon', emoji: '❗', dur: 0.4 },
    { at: 7.6, kind: 'burst', actor: 'cub', emoji: '✨', n: 6, dur: 0.5 },
    { at: 8.15, kind: 'pop', actor: 'cub', emoji: '🎁', dx: -10, dy: 6, dur: 0.4 },
    { at: 8.6, kind: 'pop', actor: 'mama', emoji: '💢', dx: -10, dy: 2, dur: 0.45 },
    { at: 8.65, kind: 'pop', actor: 'coon', emoji: '😱', dx: -10, dy: 6, dur: 0.35 },
    { at: 9.4, kind: 'burst', x: 10, y: 56, n: 1, dur: 0.3 },
    { at: 9.5, kind: 'dizzy', actor: 'coon', dur: 0.5 },
  ],
  camera: [
    { at: 5.05, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 8.6, dur: 0.3, do: 'shake', amount: 1.0 },
  ],
  lights: [
    { at: 5.05, dur: 0.04, level: -0.7 },
    { at: 5.09, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 1.1, say: '熊' },
    { at: 2.15, sfx: 'boing' },
    { at: 2.6, sfx: 'plop' },
    { at: 3.85, sfx: 'whoosh' },
    { at: 4.25, sfx: 'bonk' },
    { at: 4.5, sfx: 'rumble' },
    { at: 5.05, sfx: 'poof' },
    { at: 5.75, sfx: 'splash' },
    { at: 6.2, say: '熊' },
    { at: 7.6, say: '小熊' },
    { at: 8.1, sfx: 'rumble' },
    { at: 8.85, sfx: 'clink' },
    { at: 9.4, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
