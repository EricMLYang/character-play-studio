// 演的是字面意思：名（有名）＋偵探——一隻太有名的貓頭鷹偵探，粉絲一直圍上來要簽名，他忙著簽名沒空辦案，小偷還混進排隊的隊伍裡（沒有戴大眼鏡的小孩、蝴蝶結、手錶、麻醉針）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 傍晚的街上：戴高帽的貓頭鷹偵探神氣地走過來，彎腰用放大鏡看地上的腳印。
// 三隻小雞粉絲尖叫衝過來，擋在放大鏡前面、啪啪啪拍照（閃光一直閃），他推開，她們又擠回來——只好一張一張簽名。
// 一隻抱著鑽石的刺蝟小偷偷偷排到隊伍最後面，也拿一張紙要簽名。偵探簽、簽、簽……簽到他……停一拍……
// 放大鏡往下一照：腳印就在刺蝟腳下！偵探撲過去，鑽石彈上天，掉在偵探手上，小雞們拍照拍不停：「名偵探柯南」。
const O = 20 // 貓頭鷹
const G = 77 - 0.42 * O
const HAT = { dx: 0, dy: -21 }
const GLASS = { dx: 10, dy: -6 }
const OX = 58
const CH = 9 // 小雞
const CG = 77 - 0.42 * CH
const QUEUE = [80, 92, 104] // 排隊的位置
const HG = 77 - 0.42 * 11 // 刺蝟（size 11）
const THIEF = 117

/** 貓頭鷹的動作，帽子、放大鏡照抄 */
const owl = (moves: Move[]): Move[] => moves.flatMap((m) => {
  if (!['moveTo', 'enter', 'hop', 'bounce', 'shake'].includes(m.do)) return [m]
  const off = (d: { dx: number; dy: number }) => (v?: Move['to']) => v && { x: v.x + d.dx, y: v.y + d.dy }
  return [m,
    { ...m, actor: 'hat', to: off(HAT)(m.to), from: off(HAT)(m.from) },
    { ...m, actor: 'glass', to: off(GLASS)(m.to), from: off(GLASS)(m.from) }]
})

export default scene({
  duration: 9.6,
  bg: { top: '#3D4E8C', bottom: '#F2B38A', floor: '#9C96A8', scenery: 'city' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 150, y: 77 - 0.42 * 24, size: 24 },
    { id: 'foot', emoji: '👣', x: 98, y: 73.5, size: 9, float: true },
    { id: 'owl', emoji: '🦉', x: OX, y: G, size: O },
    { id: 'hat', emoji: '🎩', x: OX + HAT.dx, y: G + HAT.dy, size: 9, float: true },
    { id: 'glass', emoji: '🔍', x: OX + GLASS.dx, y: G + GLASS.dy, size: 8, float: true, pivot: 'center' },
    { id: 'c1', emoji: '🐥', x: 190, y: CG, size: CH },
    { id: 'c2', emoji: '🐥', x: 200, y: CG, size: CH },
    { id: 'c3', emoji: '🐤', x: 210, y: CG, size: CH },
    { id: 'thief', emoji: '🦔', x: 190, y: HG, size: 11 },
    { id: 'gem', emoji: '💎', x: 186, y: HG - 7, size: 6, float: true, pivot: 'center' },
    { id: 'medal', emoji: '🥇', x: OX + 1, y: -10, size: 7, float: true, hidden: true },
  ],
  moves: [
    // ① 神氣地走過來，彎腰看腳印
    ...owl([{ at: 0, actor: 'owl', do: 'enter', from: { x: -16, y: G }, dur: 0.9, ease: 'out' }]),
    ...owl([{ at: 1.0, actor: 'owl', do: 'hop', amount: -2, dur: 0.6 }]),
    { at: 1.0, actor: 'glass', do: 'moveTo', to: { x: 92, y: 70 }, dur: 0.35, ease: 'out' },
    // ② 小雞粉絲衝過來，擠在放大鏡前面
    { at: 1.4, actor: 'c1', do: 'moveTo', to: { x: 76, y: CG }, dur: 0.45, ease: 'out' },
    { at: 1.5, actor: 'c2', do: 'moveTo', to: { x: 86, y: CG }, dur: 0.45, ease: 'out' },
    { at: 1.6, actor: 'c3', do: 'moveTo', to: { x: 96, y: CG }, dur: 0.45, ease: 'out' },
    { at: 2.1, actor: 'c1', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 2.15, actor: 'c2', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 2.2, actor: 'c3', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 他推開，她們又擠回來
    { at: 2.7, actor: 'glass', do: 'moveTo', to: { x: OX + GLASS.dx, y: G + GLASS.dy }, dur: 0.2 },
    ...owl([{ at: 2.75, actor: 'owl', do: 'shake', amount: 1, dur: 0.3 }]),
    { at: 2.8, actor: 'c1', do: 'moveTo', to: { x: 96, y: CG }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 2.8, actor: 'c2', do: 'moveTo', to: { x: 106, y: CG }, arc: 8, dur: 0.3, ease: 'out' },
    { at: 2.8, actor: 'c3', do: 'moveTo', to: { x: 116, y: CG }, arc: 10, dur: 0.3, ease: 'out' },
    { at: 3.15, actor: 'c1', do: 'moveTo', to: { x: QUEUE[0], y: CG }, dur: 0.25, ease: 'in' },
    { at: 3.2, actor: 'c2', do: 'moveTo', to: { x: QUEUE[1], y: CG }, dur: 0.25, ease: 'in' },
    { at: 3.25, actor: 'c3', do: 'moveTo', to: { x: QUEUE[2], y: CG }, dur: 0.25, ease: 'in' },
    // 只好一張一張簽名
    { at: 3.6, actor: 'glass', do: 'swap', emoji: '📝' },
    { at: 3.7, actor: 'glass', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 3.95, actor: 'c1', do: 'moveTo', to: { x: 72, y: CG }, arc: 6, dur: 0.3, ease: 'out' },
    // 刺蝟小偷抱著鑽石偷偷排到最後面
    { at: 3.4, actor: 'thief', do: 'moveTo', to: { x: THIEF, y: HG }, dur: 0.8, ease: 'out' },
    { at: 3.4, actor: 'gem', do: 'moveTo', to: { x: THIEF - 4, y: HG - 7 }, dur: 0.8, ease: 'out' },
    { at: 4.2, actor: 'glass', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 4.45, actor: 'c2', do: 'moveTo', to: { x: 66, y: CG }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 4.65, actor: 'glass', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 4.9, actor: 'c3', do: 'moveTo', to: { x: 76, y: CG }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 4.9, actor: 'thief', do: 'moveTo', to: { x: 84, y: HG }, dur: 0.4 },
    { at: 4.9, actor: 'gem', do: 'moveTo', to: { x: 80, y: HG - 7 }, dur: 0.4 },
    { at: 4.9, actor: 'foot', do: 'moveTo', to: { x: 86, y: 73.5 }, dur: 0.4 },
    { at: 5.35, actor: 'glass', do: 'shake', amount: 0.8, dur: 0.25 },
    // 停一拍……放大鏡往下一照
    { at: 5.85, actor: 'glass', do: 'swap', emoji: '🔍' },
    { at: 5.85, actor: 'glass', do: 'moveTo', to: { x: 90, y: 62 }, dur: 0.25, ease: 'out' },
    { at: 5.85, actor: 'glass', do: 'scaleTo', amount: 1.4, dur: 0.25, ease: 'back' },
    { at: 6.1, actor: 'thief', do: 'shake', amount: 0.8, dur: 0.3 },
    // ③ 撲過去！鑽石彈上天
    { at: 6.4, actor: 'glass', do: 'scaleTo', amount: 1 / 1.4, dur: 0.15 },
    { at: 6.4, actor: 'glass', do: 'moveTo', to: { x: OX + GLASS.dx, y: G + GLASS.dy }, dur: 0.2 },
    { at: 6.4, actor: 'thief', do: 'moveTo', to: { x: 122, y: HG }, dur: 0.3, ease: 'out' },
    ...owl([{ at: 6.45, actor: 'owl', do: 'moveTo', to: { x: 98, y: G }, arc: 10, dur: 0.3, ease: 'in' }]),
    { at: 6.75, actor: 'thief', do: 'squash', amount: 0.5, dur: 0.5 },
    { at: 6.75, actor: 'gem', do: 'moveTo', to: { x: 98 + GLASS.dx - 20, y: 18 }, dur: 0.35, ease: 'out' },
    { at: 6.75, actor: 'gem', do: 'spin', times: 3, dur: 0.7 },
    { at: 7.1, actor: 'gem', do: 'moveTo', to: { x: 98 - 11, y: G - 6 }, dur: 0.35, ease: 'bounce' },
    // ④ 亮相：變大、獎牌掉下來掛好
    { at: 7.1, actor: 'owl', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 7.1, actor: 'hat', do: 'moveTo', to: { x: 98 + HAT.dx, y: G + HAT.dy * 1.3 }, dur: 0.3, ease: 'back' },
    { at: 7.1, actor: 'hat', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 7.1, actor: 'glass', do: 'moveTo', to: { x: 98 + GLASS.dx * 1.3, y: G + GLASS.dy * 1.3 }, dur: 0.3, ease: 'back' },
    { at: 7.1, actor: 'medal', do: 'moveTo', to: { x: 98, y: G - 8 }, dur: 0.01 },
    { at: 7.15, actor: 'medal', do: 'drop', dur: 0.4 },
    // 小雞們圍過來拍照
    { at: 7.2, actor: 'c1', do: 'moveTo', to: { x: 62, y: CG }, dur: 0.4, ease: 'out' },
    { at: 7.2, actor: 'c2', do: 'moveTo', to: { x: 72, y: CG }, dur: 0.4, ease: 'out' },
    { at: 7.2, actor: 'c3', do: 'moveTo', to: { x: 126, y: CG }, dur: 0.4, ease: 'out' },
    { at: 7.8, actor: 'c1', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.0, actor: 'c3', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.2, actor: 'c2', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 1.1, kind: 'pop', actor: 'owl', emoji: '🤔', dx: -8, dur: 0.6 },
    { at: 1.5, kind: 'pop', actor: 'c1', emoji: '😍', dur: 0.6 },
    { at: 1.7, kind: 'pop', actor: 'c3', emoji: '💕', dur: 0.6 },
    { at: 2.2, kind: 'pop', actor: 'c2', emoji: '📷', dur: 0.5 },
    { at: 2.8, kind: 'pop', actor: 'owl', emoji: '💢', dx: -8, dur: 0.4 },
    { at: 3.3, kind: 'sweat', actor: 'owl' },
    { at: 3.7, kind: 'burst', actor: 'glass', emoji: '✨', n: 4, dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'c1', emoji: '💕', dur: 0.5 },
    { at: 4.2, kind: 'burst', actor: 'glass', emoji: '✨', n: 4, dur: 0.4 },
    { at: 4.65, kind: 'burst', actor: 'glass', emoji: '✨', n: 4, dur: 0.4 },
    { at: 5.35, kind: 'burst', actor: 'glass', emoji: '✨', n: 4, dur: 0.4 },
    { at: 5.4, kind: 'pop', actor: 'thief', emoji: '😆', dx: 6, dur: 0.5 },
    { at: 6.05, kind: 'pop', actor: 'owl', emoji: '❗', dx: -8, dur: 0.5 },
    { at: 6.1, kind: 'sweat', actor: 'thief' },
    { at: 6.75, kind: 'puff', actor: 'thief', n: 14, dur: 0.7 },
    { at: 6.85, kind: 'dizzy', actor: 'thief', dur: 1.6 },
    { at: 7.2, kind: 'burst', actor: 'owl', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.6, kind: 'pop', actor: 'c1', emoji: '📷', dur: 0.4 },
    { at: 7.9, kind: 'pop', actor: 'c3', emoji: '📷', dur: 0.4 },
    { at: 8.3, kind: 'burst', actor: 'owl', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 5.6, dur: 0.4, do: 'zoom', amount: 1.5, to: { x: 86, y: 62 } },
    { at: 6.4, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 6.75, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 7.2, dur: 0.6, do: 'zoom', amount: 1.45, to: { x: 96, y: 62 } },
  ],
  lights: [
    { at: 2.2, dur: 0.05, level: -0.3 },
    { at: 2.25, dur: 0.15, level: 0 },
    { at: 2.45, dur: 0.05, level: -0.3 },
    { at: 2.5, dur: 0.15, level: 0 },
    { at: 7.6, dur: 0.05, level: -0.4 },
    { at: 7.65, dur: 0.2, level: 0 },
    { at: 7.9, dur: 0.05, level: -0.35 },
    { at: 7.95, dur: 0.2, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.4, sfx: 'cheer' },
    { at: 2.2, sfx: 'blip' },
    { at: 2.45, sfx: 'blip' },
    { at: 2.75, sfx: 'whoosh' },
    { at: 3.7, sfx: 'tap' },
    { at: 4.2, sfx: 'tap' },
    { at: 4.65, sfx: 'tap' },
    { at: 5.85, sfx: 'boing' },
    { at: 6.45, sfx: 'whoosh' },
    { at: 6.75, sfx: 'bonk' },
    { at: 7.25, say: '名偵探柯南' },
    { at: 7.6, sfx: 'blip' },
    { at: 7.9, sfx: 'blip' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
