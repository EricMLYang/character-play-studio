// 演的是字面意思：豬＋探長——一隻小豬當探長，拿放大鏡追查誰吃了蛋糕，查到最後犯人是他自己（嘴邊沾著奶油）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 下午的廚房：豬探長走進來，盤子空了！他拿出放大鏡，彎腰沿著地上的腳印一步一步找，
// 腳印通到牆角的小老鼠——「就是你！」小老鼠嚇一跳，抱著起司搖搖頭，指指豬探長。
// 豬探長拿大放大鏡照自己……停一拍……嘴邊那一小塊蛋糕放大成好大一塊！他臉紅冒汗，偷偷舔掉，
// 若無其事地擺好姿勢：「豬探長」。小老鼠翻了一個白眼。
const P = 15 // 豬探長
const G = 77 - 0.42 * P
const CRUMB = { dx: 3.5, dy: -3 } // 嘴邊的蛋糕屑
const M = 10 // 小老鼠
const MG = 77 - 0.42 * M

/** 豬探長的動作，嘴邊的蛋糕屑照抄一份 */
const pig = (moves: Move[]): Move[] => moves.flatMap((m) => {
  if (m.do !== 'moveTo' && m.do !== 'enter' && m.do !== 'hop' && m.do !== 'shake') return [m]
  const at = (v?: Move['to']) => v && { x: v.x + CRUMB.dx, y: v.y + CRUMB.dy }
  return [m, { ...m, actor: 'crumb', to: at(m.to), from: at(m.from) }]
})

export default scene({
  duration: 9.0,
  bg: { top: '#FFE7B3', bottom: '#FFF6DE', floor: '#D9A46C', scenery: 'room' },
  actors: [
    { id: 'pic', emoji: '🖼️', x: 80, y: 26, size: 12, float: true },
    { id: 'plant', emoji: '🪴', x: 148, y: 77 - 0.42 * 14, size: 14 },
    { id: 'chair', emoji: '🪑', x: 24, y: 77 - 0.42 * 18, size: 18 },
    { id: 'plate', emoji: '🍽️', x: 24, y: 58, size: 10, float: true },
    { id: 'p1', emoji: '🐾', x: 48, y: 75, size: 4, float: true },
    { id: 'p2', emoji: '🐾', x: 66, y: 75.5, size: 4, float: true },
    { id: 'p3', emoji: '🐾', x: 84, y: 75, size: 4, float: true },
    { id: 'p4', emoji: '🐾', x: 102, y: 75.5, size: 4, float: true },
    { id: 'mouse', emoji: '🐁', x: 128, y: MG, size: M },
    { id: 'cheese', emoji: '🧀', x: 120, y: 77 - 0.42 * 6, size: 6 },
    { id: 'pig', emoji: 'hero:pig/idle', x: 40, y: G, size: P, flip: true },
    { id: 'lens', emoji: '🔍', x: 60, y: 60, size: 14, hidden: true, float: true },
    { id: 'crumb', emoji: '🍰', x: 40 + CRUMB.dx, y: G + CRUMB.dy, size: 3, float: true, pivot: 'center' },
  ],
  moves: [
    // ① 走進來，盤子空了！
    ...pig([{ at: 0, actor: 'pig', do: 'enter', from: { x: -16, y: G }, dur: 0.8, ease: 'out' }]),
    { at: 0.9, actor: 'pig', do: 'flip' },
    { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 1.0, actor: 'plate', do: 'shake', amount: 0.6, dur: 0.3 },
    // ② 拿出放大鏡，沿著腳印找
    { at: 1.5, actor: 'pig', do: 'flip' },
    { at: 1.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    ...pig([
      { at: 1.7, actor: 'pig', do: 'moveTo', to: { x: 62, y: G }, dur: 0.6 },
      { at: 2.45, actor: 'pig', do: 'moveTo', to: { x: 84, y: G }, dur: 0.6 },
      { at: 3.2, actor: 'pig', do: 'moveTo', to: { x: 100, y: G }, dur: 0.45 },
    ]),
    { at: 1.7, actor: 'p1', do: 'flash', dur: 0.4 },
    { at: 2.1, actor: 'p2', do: 'flash', dur: 0.4 },
    { at: 2.6, actor: 'p3', do: 'flash', dur: 0.4 },
    { at: 3.0, actor: 'p4', do: 'flash', dur: 0.4 },
    { at: 1.8, actor: 'pig', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 2.55, actor: 'pig', do: 'tilt', amount: 10, dur: 0.5 },
    // 小老鼠正在啃起司
    { at: 1.2, actor: 'mouse', do: 'bounce', amount: 0.8, times: 4, dur: 1.4 },
    // ③ 就是你！
    { at: 3.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    ...pig([{ at: 3.7, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 }]),
    { at: 3.75, actor: 'mouse', do: 'hop', amount: 5, dur: 0.35 },
    // 小老鼠搖搖頭，指指豬探長
    { at: 4.2, actor: 'mouse', do: 'shake', amount: 1, dur: 0.4 },
    // 拿大放大鏡照自己……停一拍
    { at: 5.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 5.0, actor: 'lens', do: 'moveTo', to: { x: 107, y: G - 1 }, dur: 0.01 },
    { at: 5.05, actor: 'lens', do: 'pop', dur: 0.25 },
    { at: 5.2, actor: 'pig', do: 'tilt', amount: -8, dur: 0.5 },
    // 好大一塊蛋糕！
    { at: 5.75, actor: 'crumb', do: 'scaleTo', amount: 3.4, dur: 0.2, ease: 'back' },
    { at: 5.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 5.8, actor: 'pig', do: 'tint', filter: 'saturate(1.6) hue-rotate(-12deg)' },
    ...pig([{ at: 5.85, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.4 }]),
    { at: 5.9, actor: 'mouse', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    // 偷偷舔掉
    { at: 6.4, actor: 'lens', do: 'vanish', dur: 0.15 },
    { at: 6.5, actor: 'crumb', do: 'vanish', dur: 0.15 },
    { at: 6.5, actor: 'pig', do: 'squash', amount: 0.15, dur: 0.2 },
    // ⑤ 若無其事地亮相
    { at: 6.9, actor: 'pig', do: 'tint', filter: '' },
    { at: 6.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 6.9, actor: 'pig', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 6.9, actor: 'pig', do: 'moveTo', to: { x: 92, y: G }, dur: 0.35 },
    { at: 7.9, actor: 'mouse', do: 'tilt', amount: -12, dur: 0.6 },
  ],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 1.05, kind: 'burst', actor: 'plate', emoji: '❓', n: 3, dur: 0.5 },
    { at: 1.1, kind: 'bubble', actor: 'pig', emoji: '🍰', dur: 0.5 },
    { at: 2.0, kind: 'puff', actor: 'pig', n: 3, dur: 0.4 },
    { at: 3.75, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.5 },
    { at: 3.8, kind: 'sweat', actor: 'mouse' },
    { at: 4.35, kind: 'pop', actor: 'mouse', emoji: '👈', dx: -9, dy: 2, dur: 0.8 },
    { at: 4.6, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5 },
    { at: 5.8, kind: 'pop', actor: 'pig', emoji: '😳', dx: -9, dur: 0.7 },
    { at: 5.85, kind: 'sweat', actor: 'pig' },
    { at: 5.95, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.7 },
    { at: 6.55, kind: 'pop', actor: 'pig', emoji: '😋', dx: -9, dur: 0.5 },
    { at: 7.0, kind: 'burst', actor: 'pig', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.6, kind: 'burst', actor: 'pig', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 7.9, kind: 'pop', actor: 'mouse', emoji: '😑', dur: 0.9 },
  ],
  camera: [
    { at: 3.7, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 120, y: 66 } },
    { at: 5.75, dur: 0.5, do: 'punch', amount: 0.25, to: { x: 104, y: 62 } },
    { at: 5.8, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 6.9, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 100, y: 52 } },
  ],
  lights: [
    { at: 5.2, dur: 0.4, level: 0.4 },
    { at: 6.4, dur: 0.3, level: 0 },
    { at: 6.9, dur: 0.05, level: -0.35 },
    { at: 6.95, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.0, sfx: 'blip' },
    { at: 1.7, sfx: 'tap' },
    { at: 2.45, sfx: 'tap' },
    { at: 3.7, sfx: 'whoosh' },
    { at: 3.75, sfx: 'boing' },
    { at: 5.05, sfx: 'plop' },
    { at: 5.75, sfx: 'crack' },
    { at: 6.5, sfx: 'gulp' },
    { at: 7.0, sfx: 'clink' },
    { at: 7.15, say: '豬探長' },
    { at: 7.7, sfx: 'cheer' },
  ],
})
