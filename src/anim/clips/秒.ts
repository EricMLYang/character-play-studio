import type { Clip, Move } from '../clip'

// 秒：橡膠恐龍想按碼錶上的小紅鈕，小短手怎麼伸都搆不到；牠退到最左邊像短跑選手一樣助跑、肚子先飛撲——飛過按鈕，撞翻一疊藍色橡膠長條。
// 長條掉下來排成「秒」，恐龍冒著煙滑回來，小心翼翼用大腳趾一點，秒針就滴答滴答轉起來。秒、秒、秒針
const TICKS = [6.95, 7.45, 7.95, 8.45, 8.95, 9.45]
const ticking: Move[] = TICKS.map((at) => ({ at, actor: 'needle', do: 'rotateTo', amount: 60, dur: 0.12, ease: 'back' }))

const clip: Clip = {
  char: '秒',
  meta: { theme: '按碼錶', cast: '橡膠恐龍＋碼錶＋藍色長條', gags: ['小短手搆不到', '助跑飛撲飛過頭撞翻', '大腳趾輕輕一點'] },
  duration: 10,
  bg: { top: '#FFF0A8', bottom: '#FFF9DC', floor: '#EFD98E', scenery: 'track' },
  actors: [
    { id: 'rods1', emoji: '🥢', x: 146, y: 62, size: 18, tint: 'hue-rotate(185deg) saturate(3) brightness(1.05)' },
    { id: 'rods2', emoji: '🥢', x: 152, y: 62, size: 18, flip: true, tint: 'hue-rotate(185deg) saturate(3) brightness(1.05)' },
    { id: 'watch', emoji: '⏱️', x: 104, y: 70, size: 12 },
    { id: 'needle', emoji: '📍', x: 104, y: 68.5, size: 5, hidden: true, float: true },
    { id: 'dino', emoji: 'hero:dino/reach', x: 92, y: 71, size: 14, flip: true },
  ],
  moves: [
    // 小短手拚命伸，差好遠
    { at: 0.2, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 0.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    // 退到最左邊，挖地蓄力
    { at: 1.1, actor: 'dino', do: 'moveTo', to: { x: 16, y: 71 }, dur: 0.6 },
    { at: 1.75, actor: 'dino', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 1.75, actor: 'dino', do: 'shake', amount: 1, dur: 0.4 },
    // 衝！肚子先飛撲——飛過按鈕
    { at: 2.15, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 2.15, actor: 'dino', do: 'moveTo', to: { x: 142, y: 60 }, dur: 0.75, arc: 16, anticipate: 4, ease: 'in' },
    { at: 2.5, actor: 'dino', do: 'rotateTo', amount: 70, dur: 0.3 },
    // 撞翻長條
    { at: 2.9, actor: 'dino', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 2.9, actor: 'rods1', do: 'moveTo', to: { x: 120, y: -25 }, dur: 0.5, ease: 'out' },
    { at: 2.9, actor: 'rods1', do: 'spin', times: 2, dur: 0.5 },
    { at: 2.9, actor: 'rods2', do: 'moveTo', to: { x: 140, y: -25 }, dur: 0.5, ease: 'out' },
    { at: 2.9, actor: 'rods2', do: 'spin', times: 2, dur: 0.5 },
    { at: 3.4, actor: 'rods1', do: 'vanish', dur: 0.05 },
    { at: 3.4, actor: 'rods2', do: 'vanish', dur: 0.05 },
    // 碼錶被彈到右下角
    { at: 2.95, actor: 'watch', do: 'moveTo', to: { x: 146, y: 70 }, dur: 0.6, arc: 14, ease: 'out' },
    { at: 2.95, actor: 'watch', do: 'spin', dur: 0.6 },
    { at: 2.95, actor: 'needle', do: 'moveTo', to: { x: 146, y: 68.5 }, dur: 0.01 },
    // 冒著煙倒滑回來，暈暈的
    { at: 3.25, actor: 'dino', do: 'rotateTo', amount: -70, dur: 0.25 },
    { at: 3.25, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 3.25, actor: 'dino', do: 'moveTo', to: { x: 126, y: 71 }, dur: 0.5, ease: 'back' },
    // 踮腳走到碼錶旁，大腳趾輕輕一點
    { at: 6.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 6.1, actor: 'dino', do: 'hop', amount: 2, dur: 0.25 },
    { at: 6.4, actor: 'dino', do: 'moveTo', to: { x: 132, y: 71 }, dur: 0.3, arc: 2 },
    { at: 6.75, actor: 'dino', do: 'tilt', amount: 12, dur: 0.3 },
    { at: 6.85, actor: 'watch', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 6.85, actor: 'needle', do: 'pop', dur: 0.1 },
    ...ticking,
    // 回馬槍：碼錶滴滴響，恐龍嚇一跳，然後得意地跺腳跳舞
    { at: 8.2, actor: 'watch', do: 'shake', amount: 1, dur: 0.5 },
    { at: 8.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 8.2, actor: 'dino', do: 'hop', amount: 8, dur: 0.4 },
    { at: 8.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 8.75, actor: 'dino', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
    { at: 9.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
  ],
  builds: [
    // 長條像下雨一樣掉下來：左邊五根是禾，右邊四根是少
    { at: 3.75, dur: 0.95, strokes: [0, 1, 2, 3, 4], from: { x: 70, y: -10 }, style: 'drop', color: '#1C4FD8' },
    { at: 4.65, dur: 0.8, strokes: [5, 6, 7, 8], from: { x: 95, y: -10 }, style: 'drop', color: '#1971C2' },
  ],
  glyph: [{ at: 5.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'dino', emoji: '🔴', dur: 0.7 },
    { at: 0.6, kind: 'sweat', actor: 'dino' },
    { at: 1.75, kind: 'puff', actor: 'dino' },
    { at: 1.8, kind: 'pop', actor: 'dino', emoji: '😤', dur: 0.4 },
    { at: 2.15, kind: 'puff', actor: 'dino' },
    { at: 2.9, kind: 'burst', x: 146, y: 56, emoji: '💥', dur: 0.4 },
    { at: 3.3, kind: 'puff', actor: 'dino' },
    { at: 3.4, kind: 'stink', actor: 'dino', dy: 6, dur: 0.9 },
    { at: 3.8, kind: 'dizzy', actor: 'dino', dur: 1.6 },
    { at: 6.95, kind: 'pop', actor: 'watch', emoji: '✨', dx: -10, dur: 0.5 },
    { at: 8.2, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.5 },
    { at: 8.75, kind: 'puff', actor: 'dino' },
  ],
  camera: [
    // 助跑飛撲跟拍，撞到之後退回全景
    { at: 2.15, dur: 0.3, do: 'follow', actor: 'dino', amount: 1.3 },
    { at: 3.0, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 2.9, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.75, sfx: 'rumble' },
    { at: 2.15, say: '秒' },
    { at: 2.25, sfx: 'whoosh' },
    { at: 2.9, sfx: 'bonk' },
    { at: 3.25, sfx: 'slide' },
    { at: 5.5, say: '秒' },
    { at: 6.4, sfx: 'tap' },
    { at: 6.85, sfx: 'blip' },
    { at: 6.95, say: '秒針' },
    { at: 7.95, sfx: 'tap' },
    { at: 8.2, sfx: 'blip' },
    { at: 8.95, sfx: 'tap' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
