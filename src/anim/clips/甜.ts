import type { Clip } from '../clip'

// 甜：小熊想吃天上的粉紅棉花糖雲，跳一下搆不到，用力跳——雲還會閃開。三隻小蜜蜂把小熊抬上天，一口咬下去，雲碎成「甜」。
// 蜜蜂抬不動把牠放回地上，螞蟻扛著蛋糕來了；小熊已經吃飽，打了一個嗝，嗝出一朵小小的粉紅雲，蜜蜂又追上去了。甜、甜、甜點
const PINK = 'sepia(1) saturate(3) hue-rotate(285deg) brightness(1.15)'

const clip: Clip = {
  char: '甜',
  meta: { theme: '棉花糖雲', cast: '小熊＋三隻蜜蜂＋螞蟻', gags: ['跳不到漸強', '雲會閃開', '小蜜蜂抬大熊', '打嗝打出一朵雲'] },
  duration: 10,
  bg: { top: '#FFE3F1', bottom: '#FFF4D9', floor: '#8FCB72', scenery: 'hills' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 34, y: 22, size: 20, float: true, tint: PINK },
    { id: 'bear', emoji: '🐻', x: 30, y: 70.7, size: 15, hidden: true },
    { id: 'b1', emoji: '🐝', x: 21, y: 63, size: 6, hidden: true, float: true },
    { id: 'b2', emoji: '🐝', x: 39, y: 63, size: 6, hidden: true, float: true },
    { id: 'b3', emoji: '🐝', x: 30, y: 58, size: 6, hidden: true, float: true },
    { id: 'cake', emoji: '🍰', x: 135, y: 68, size: 8, hidden: true, float: true },
    { id: 'a1', emoji: '🐜', x: 130, y: 74.5, size: 6, hidden: true },
    { id: 'a2', emoji: '🐜', x: 140, y: 74.5, size: 6, hidden: true },
    { id: 'burp', emoji: '☁️', x: 32, y: 58, size: 8, hidden: true, float: true, tint: PINK },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.6 },
    // 第一跳：差一大截
    { at: 1.0, actor: 'bear', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.2, actor: 'bear', do: 'hop', amount: 12, dur: 0.5 },
    { at: 1.7, actor: 'bear', do: 'squash', amount: 0.25, dur: 0.2 },
    // 用力跳：雲閃開
    { at: 2.3, actor: 'bear', do: 'squash', amount: -0.4, dur: 0.25 },
    { at: 2.55, actor: 'bear', do: 'hop', amount: 26, dur: 0.7 },
    { at: 2.65, actor: 'cloud', do: 'moveTo', to: { x: 18, y: 20 }, dur: 0.3 },
    { at: 3.25, actor: 'bear', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.4, actor: 'cloud', do: 'moveTo', to: { x: 30, y: 22 }, dur: 0.6 },
    // 三隻蜜蜂來幫忙
    { at: 3.4, actor: 'b1', do: 'enter', from: { x: 175, y: 30 }, dur: 0.5 },
    { at: 3.5, actor: 'b2', do: 'enter', from: { x: 175, y: 40 }, dur: 0.5 },
    { at: 3.6, actor: 'b3', do: 'enter', from: { x: 175, y: 20 }, dur: 0.5 },
    // 抬上天
    { at: 4.2, actor: 'bear', do: 'moveTo', to: { x: 30, y: 40 }, dur: 0.6 },
    { at: 4.2, actor: 'b1', do: 'moveTo', to: { x: 21, y: 33 }, dur: 0.6 },
    { at: 4.2, actor: 'b2', do: 'moveTo', to: { x: 39, y: 33 }, dur: 0.6 },
    { at: 4.2, actor: 'b3', do: 'moveTo', to: { x: 30, y: 28 }, dur: 0.6 },
    { at: 4.2, actor: 'b1', do: 'shake', amount: 1, dur: 0.6 },
    { at: 4.2, actor: 'b2', do: 'shake', amount: 1, dur: 0.6 },
    // 一大口
    { at: 4.85, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 5.0, actor: 'cloud', do: 'vanish', dur: 0.2 },
    // 蜜蜂抬不動，放回地上
    { at: 5.7, actor: 'bear', do: 'moveTo', to: { x: 30, y: 70.7 }, dur: 0.45 },
    { at: 5.7, actor: 'b1', do: 'moveTo', to: { x: 21, y: 63 }, dur: 0.45 },
    { at: 5.7, actor: 'b2', do: 'moveTo', to: { x: 39, y: 63 }, dur: 0.45 },
    { at: 5.7, actor: 'b3', do: 'moveTo', to: { x: 30, y: 58 }, dur: 0.45 },
    { at: 6.15, actor: 'bear', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 6.4, actor: 'b1', do: 'moveTo', to: { x: 8, y: 40 }, dur: 0.4 },
    { at: 6.4, actor: 'b2', do: 'moveTo', to: { x: 14, y: 30 }, dur: 0.4 },
    { at: 6.4, actor: 'b3', do: 'moveTo', to: { x: 6, y: 22 }, dur: 0.4 },
    // 螞蟻扛著甜點進場
    { at: 6.5, actor: 'a1', do: 'enter', from: { x: 172, y: 74.5 }, dur: 0.7 },
    { at: 6.5, actor: 'a2', do: 'enter', from: { x: 182, y: 74.5 }, dur: 0.7 },
    { at: 6.5, actor: 'cake', do: 'enter', from: { x: 177, y: 68 }, dur: 0.7 },
    { at: 7.3, actor: 'cake', do: 'hop', amount: 5, dur: 0.4 },
    { at: 7.3, actor: 'a1', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 7.3, actor: 'a2', do: 'squash', amount: 0.3, dur: 0.4 },
    // 小熊吃飽了：打嗝，嗝出一朵小雲
    { at: 8.0, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 8.3, actor: 'burp', do: 'pop', dur: 0.3 },
    { at: 8.4, actor: 'burp', do: 'moveTo', to: { x: 38, y: 24 }, dur: 1.3 },
    // 蜜蜂又追上去
    { at: 8.7, actor: 'b1', do: 'moveTo', to: { x: 30, y: 26 }, dur: 0.8 },
    { at: 8.8, actor: 'b2', do: 'moveTo', to: { x: 44, y: 20 }, dur: 0.8 },
    { at: 8.9, actor: 'b3', do: 'moveTo', to: { x: 34, y: 16 }, dur: 0.8 },
  ],
  builds: [
    // 咬碎的棉花糖雲 → 舌、甘
    { at: 5.0, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5], from: 'cloud', color: '#E8559A' },
    { at: 5.6, dur: 0.7, strokes: [6, 7, 8, 9, 10], from: 'cloud', color: '#8A4FD6' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'bear', emoji: '🤤', dur: 0.8 },
    { at: 1.8, kind: 'pop', actor: 'bear', emoji: '😑', dur: 0.5 },
    { at: 3.25, kind: 'puff', actor: 'bear' },
    { at: 3.4, kind: 'sweat', actor: 'bear' },
    { at: 3.5, kind: 'bubble', actor: 'cloud', emoji: '😝', dur: 0.6, dx: 4, dy: 12 },
    { at: 4.3, kind: 'sweat', actor: 'b2' },
    { at: 5.0, kind: 'burst', actor: 'bear', emoji: '💕', n: 6, dur: 0.6, dy: -4 },
    { at: 5.4, kind: 'sweat', actor: 'b1' },
    { at: 5.45, kind: 'sweat', actor: 'b3' },
    { at: 6.15, kind: 'puff', actor: 'bear' },
    { at: 7.3, kind: 'pop', actor: 'a2', emoji: '✨', dur: 0.6 },
    { at: 7.5, kind: 'bubble', actor: 'bear', emoji: '😵', dur: 0.5 },
    { at: 8.3, kind: 'burst', actor: 'bear', emoji: '💨', n: 5, dur: 0.4 },
    { at: 8.5, kind: 'pop', actor: 'a1', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 4.8, dur: 0.7, do: 'punch', amount: 0.28, to: { x: 30, y: 32 } },
  ],
  cues: [
    { at: 1.2, sfx: 'boing' },
    { at: 1.45, say: '甜' },
    { at: 2.55, sfx: 'boing' },
    { at: 2.65, sfx: 'whoosh' },
    { at: 3.4, sfx: 'whoosh' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 4.95, sfx: 'gulp' },
    { at: 5.0, sfx: 'poof' },
    { at: 6.15, sfx: 'plop' },
    { at: 6.4, say: '甜' },
    { at: 7.35, say: '甜點' },
    { at: 8.3, sfx: 'hic' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
