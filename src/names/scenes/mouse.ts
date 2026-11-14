// 演的是字面意思：米＋老鼠——半夜一隻小老鼠拖著一袋米偷偷溜回家，袋子破了一路漏米，一隻貓沿著米粒一路吃過來（老鼠是自家的棕色小老鼠，沒有黑色圓耳朵、紅褲子、白手套）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 月亮底下：小老鼠踮著腳、拖著一袋米溜進來，袋子破了個洞，後面一路掉米粒。一隻貓跟著米粒一顆一顆吃過來。
// 老鼠覺得怪怪的，一回頭——貓馬上停住、假裝看月亮（停一拍）。老鼠轉回去繼續走，貓又跟上。
// 到了老鼠洞，打開袋子：空的！只滾出一顆小飯糰。再回頭——貓就在眼前，好大一張臉！……貓打了一個嗝，吃太飽，咚地睡著了。
// 老鼠舉起最後的小飯糰，站上貓肚子亮相：「米老鼠」。
const on = (surface: number, size: number) => surface + 3 - 0.42 * size
const M = on(74, 15) // 老鼠（size 15）
const C = on(74, 24) // 貓（size 24）
const BAG = { dx: -11, y: on(74, 11) } // 米袋拖在老鼠後面
const RICE = on(74, 3.5)
const GRAINS = [6, 18, 30, 42, 56, 70, 84]

/** 老鼠走，米袋跟著 */
const drag = (at: number, dur: number, x: number, ease: Move['ease'] = 'linear'): Move[] => [
  { at, dur, actor: 'rat', do: 'moveTo', to: { x, y: M }, ease },
  { at, dur, actor: 'bag', do: 'moveTo', to: { x: x + BAG.dx, y: BAG.y }, ease },
]

export default scene({
  duration: 9.4,
  bg: { top: '#1F2B5C', bottom: '#4A5B9A', floor: '#5E6B8E', scenery: 'night' },
  actors: [
    { id: 'hole', emoji: '🕳️', x: 128, y: on(74, 18) + 4, size: 18 },
    { id: 'wheat', emoji: '🌾', x: 148, y: on(74, 26), size: 26 },
    ...GRAINS.map((x, i) => ({ id: `g${i}`, emoji: '⚪', x, y: RICE, size: 3.5, hidden: true, float: true })),
    { id: 'cat', emoji: '🐈', x: -24, y: C, size: 24, flip: true },
    { id: 'bag', emoji: '🛍️', x: -8 + BAG.dx, y: BAG.y, size: 11, pivot: 'center' },
    { id: 'rat', emoji: 'hero:mouse/sneak', x: -8, y: M, size: 15 },
    { id: 'last', emoji: '🍙', x: 113, y: on(74, 7), size: 7, hidden: true },
  ],
  moves: [
    // 拖著米袋踮腳溜進來，一路漏米
    ...drag(0.05, 2.2, 70),
    { at: 0.05, actor: 'bag', do: 'tilt', amount: 10, dur: 2.2 },
    ...GRAINS.map((x, i): Move => ({ at: x <= 59 ? 0.05 + ((x + 19) / 78) * 2.2 : 4.55 + (x - 59) / 42, actor: `g${i}`, do: 'pop', dur: 0.15 })),
    // 貓沿著米粒吃過來
    { at: 1.9, actor: 'cat', do: 'moveTo', to: { x: 30, y: C }, dur: 1.4, ease: 'linear' },
    ...GRAINS.slice(0, 3).map((_, i): Move => ({ at: 2.1 + i * 0.45, actor: `g${i}`, do: 'vanish', dur: 0.1 })),
    // 老鼠覺得怪怪的，回頭——貓停住，假裝看月亮
    { at: 3.4, actor: 'rat', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 3.5, actor: 'rat', do: 'flip' },
    { at: 3.4, actor: 'cat', do: 'tilt', amount: -18, dur: 1.0 },
    { at: 4.35, actor: 'rat', do: 'flip' },
    { at: 4.35, actor: 'rat', do: 'swap', emoji: 'hero:mouse/sneak' },
    // 繼續走，貓又跟上
    ...drag(4.55, 1.0, 112),
    { at: 4.6, actor: 'cat', do: 'moveTo', to: { x: 80, y: C }, dur: 1.1, ease: 'linear' },
    ...GRAINS.slice(3).map((x, i): Move => ({ at: Math.max(4.6, 4.6 + ((x - 40) / 50) * 1.1), actor: `g${i + 3}`, do: 'vanish', dur: 0.1 })),
    // 到了洞口：打開袋子，空的！只掉出一粒米
    { at: 5.7, actor: 'bag', do: 'rotateTo', amount: 150, dur: 0.25 },
    { at: 5.95, actor: 'bag', do: 'shake', amount: 1, dur: 0.3 },
    { at: 6.05, actor: 'last', do: 'pop', dur: 0.15 },
    // 再回頭——貓就在眼前！
    { at: 6.5, actor: 'rat', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 6.5, actor: 'rat', do: 'flip' },
    { at: 6.5, actor: 'cat', do: 'moveTo', to: { x: 92, y: C }, dur: 0.2, ease: 'out' },
    { at: 6.55, actor: 'cat', do: 'scaleTo', amount: 1.25, dur: 0.25, ease: 'back' },
    // ……貓打了一個嗝，吃太飽，睡著了
    { at: 7.0, actor: 'cat', do: 'hop', amount: 2, dur: 0.2 },
    { at: 7.3, actor: 'cat', do: 'rotateTo', amount: -90, dur: 0.35, ease: 'bounce' },
    // 老鼠舉起最後一粒米，站上貓肚子
    { at: 7.6, actor: 'rat', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 7.6, actor: 'rat', do: 'moveTo', to: { x: 96, y: M - 10 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 7.6, actor: 'rat', do: 'scaleTo', amount: 1.7, dur: 0.35, ease: 'back' },
    { at: 7.6, actor: 'last', do: 'moveTo', to: { x: 112, y: M - 13 }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 7.6, actor: 'last', do: 'scaleTo', amount: 1.5, dur: 0.35 },
    { at: 8.3, actor: 'rat', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.3, actor: 'last', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'bag', n: 3, dur: 0.4 },
    { at: 0.9, kind: 'bubble', actor: 'rat', emoji: '🍚', dur: 1.0 },
    { at: 3.3, kind: 'pop', actor: 'rat', emoji: '❗', dur: 0.4 },
    { at: 3.6, kind: 'zzz', actor: 'cat', emoji: '🎵', dur: 0.9 },
    { at: 3.8, kind: 'pop', actor: 'rat', emoji: '😑', dx: 6, dur: 0.5 },
    { at: 6.0, kind: 'pop', actor: 'rat', emoji: '❓', dur: 0.5 },
    { at: 6.55, kind: 'pop', actor: 'rat', emoji: '😱', dx: 8, dur: 0.5 },
    { at: 6.6, kind: 'sweat', actor: 'rat' },
    { at: 7.0, kind: 'burst', actor: 'cat', emoji: '💨', n: 1, dur: 0.3 },
    { at: 7.4, kind: 'zzz', actor: 'cat', dx: -16, dur: 1.8 },
    { at: 7.4, kind: 'puff', actor: 'cat', n: 8, dur: 0.5 },
    { at: 7.9, kind: 'burst', actor: 'rat', emoji: '✨', n: 8, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'last', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 3.4, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 52, y: 58 } },
    { at: 4.4, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 6.5, dur: 0.3, do: 'punch', amount: 0.2, to: { x: 96, y: 56 } },
    { at: 7.3, dur: 0.3, do: 'shake', amount: 1.0 },
    { at: 7.7, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 98, y: 52 } },
  ],
  lights: [
    { at: 0, dur: 0.5, level: 0.2 },
    { at: 6.5, dur: 0.15, level: 0.45 },
    { at: 7.3, dur: 0.5, level: 0.15 },
    { at: 7.85, dur: 0.05, level: -0.3 },
    { at: 7.9, dur: 0.4, level: 0.1 },
  ],
  cues: [
    { at: 0.1, sfx: 'slide' },
    { at: 1.0, sfx: 'tap' },
    { at: 2.1, sfx: 'gulp' },
    { at: 3.3, sfx: 'blip' },
    { at: 4.8, sfx: 'gulp' },
    { at: 5.7, sfx: 'whoosh' },
    { at: 6.05, sfx: 'plop' },
    { at: 6.5, sfx: 'crack' },
    { at: 7.0, sfx: 'hic' },
    { at: 7.3, sfx: 'bonk' },
    { at: 7.8, say: '米老鼠' },
    { at: 7.95, sfx: 'cheer' },
  ],
})
