// 演的是字面意思：蜘蛛＋人——一隻蜘蛛在樹邊織了一張漂亮的網，一個海盜也想學，拿毛線跑來跑去，結果把自己纏成一顆毛線球（沒有緊身衣、手腕噴絲、盪大樓、倒吊）。
import { scene } from '../../story/scene'
import type { Fx, Move } from '../../anim/clip'

// 黃昏的樹林：小蜘蛛咻咻咻在樹旁織好一張網，得意地坐在中間。海盜走過來看呆了，撿起一顆毛線：我也會！
// 他繞著樹跑、拉線、再繞——線全纏到自己身上，轉啊轉，變成一顆毛線球，咕嚕咕嚕滾到網前面。
// 蜘蛛爬過來幫忙，拉線頭：拉不動（停一拍）。用力一扯——毛線球飛快地轉開，海盜被甩上天，落地站好，
// 蜘蛛跳到他的帽子上，兩個一起亮相：「蜘蛛人」。
const on = (surface: number, size: number) => surface + 3 - 0.42 * size
const G = on(74, 15) // 海盜（size 15）
const D = 5 // 網要演到結束
// 網的釘點（露珠）：左邊大樹的樹幹到草叢之間
const PTS: Record<string, { x: number; y: number }> = {
  hub: { x: 46, y: 44 },
  n: { x: 46, y: 26 }, ne: { x: 60, y: 32 }, e: { x: 62, y: 46 }, se: { x: 58, y: 60 },
  s: { x: 46, y: 64 }, sw: { x: 34, y: 58 }, w: { x: 32, y: 44 }, nw: { x: 34, y: 30 },
}
const RING = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const ANCHOR = { x: 132, y: 50 } // 海盜綁線的右邊大樹
const DUR = 9.4

// 蜘蛛織網：中心 → 每個點來回一趟拉出輻線，最後繞一圈
const weave: Move[] = RING.flatMap((k, i): Move[] => [
  { at: 0.25 + i * 0.16, actor: 'spi', do: 'moveTo', to: PTS[k], dur: 0.08, ease: 'linear' },
  { at: 0.33 + i * 0.16, actor: 'spi', do: 'moveTo', to: PTS.hub, dur: 0.08, ease: 'linear' },
])
const webFx: Fx[] = [
  ...RING.map((k, i): Fx => ({ at: 0.33 + i * 0.16, kind: 'line', actor: 'hub', target: k, dur: DUR - 0.33 - i * 0.16, color: '#ffffff', width: 0.45 })),
  ...RING.map((k, i): Fx => ({ at: 1.65 + i * 0.03, kind: 'line', actor: k, target: RING[(i + 1) % 8], dur: DUR - 1.65 - i * 0.03, color: '#ffffff', width: 0.4 })),
]

export default scene({
  duration: DUR,
  bg: { top: '#F7A86B', bottom: '#FFE2B8', floor: '#7FB069', scenery: 'forest' },
  actors: [
    { id: 'tree1', emoji: '🌳', x: 26, y: on(74, 46), size: 46 },
    { id: 'tree2', emoji: '🌳', x: 140, y: on(74, 46), size: 46 },
    { id: 'mush', emoji: '🍄', x: 70, y: on(74, 10), size: 10 },
    ...Object.entries(PTS).map(([id, p]) => ({ id, emoji: '💧', x: p.x, y: p.y + 1, size: 1.6, float: true })),
    { id: 'spi', emoji: '🕷️', x: 46, y: 10, size: 9, float: true },
    { id: 'yarn', emoji: '🧶', x: 112, y: on(74, 8), size: 8, pivot: 'center' },
    { id: 'pir', emoji: 'hero:pirate/idle', x: 176, y: G, size: 15 },
    { id: 'ball', emoji: '🧶', x: 100, y: on(74, 22), size: 22, hidden: true, pivot: 'center' },
  ],
  moves: [
    // 蜘蛛垂下來，咻咻咻織網
    { at: 0.0, actor: 'spi', do: 'moveTo', to: PTS.hub, dur: 0.25, ease: 'out' },
    ...weave,
    { at: 1.65, actor: 'spi', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
    // 海盜走過來，看呆了；撿起毛線
    { at: 1.4, actor: 'pir', do: 'moveTo', to: { x: 100, y: G }, dur: 0.7, ease: 'out' },
    { at: 2.1, actor: 'pir', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 2.55, actor: 'pir', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 2.6, actor: 'yarn', do: 'moveTo', to: { x: 96, y: G - 6 }, arc: 4, dur: 0.2 },
    // 繞著右邊的大樹跑、拉線
    { at: 2.85, actor: 'pir', do: 'moveTo', to: { x: 126, y: G }, dur: 0.3, ease: 'linear' },
    { at: 2.85, actor: 'yarn', do: 'moveTo', to: { x: 122, y: G - 6 }, dur: 0.3, ease: 'linear' },
    { at: 3.15, actor: 'pir', do: 'moveTo', to: { x: 92, y: G }, dur: 0.35, ease: 'linear' },
    { at: 3.15, actor: 'yarn', do: 'moveTo', to: { x: 88, y: G - 6 }, dur: 0.35, ease: 'linear' },
    { at: 3.5, actor: 'pir', do: 'moveTo', to: { x: 118, y: G }, dur: 0.3, ease: 'linear' },
    { at: 3.5, actor: 'yarn', do: 'moveTo', to: { x: 114, y: G - 6 }, dur: 0.3, ease: 'linear' },
    { at: 3.8, actor: 'pir', do: 'moveTo', to: { x: 100, y: G }, dur: 0.2, ease: 'out' },
    { at: 3.8, actor: 'yarn', do: 'moveTo', to: { x: 96, y: G - 6 }, dur: 0.2, ease: 'out' },
    // 轉啊轉，纏成一顆毛線球
    { at: 4.0, actor: 'pir', do: 'spin', times: 3, dur: 0.5, pivot: 'center' },
    { at: 4.0, actor: 'yarn', do: 'vanish', dur: 0.1 },
    { at: 4.4, actor: 'ball', do: 'pop', dur: 0.2 },
    { at: 4.4, actor: 'pir', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 4.4, actor: 'pir', do: 'moveTo', to: { x: 100, y: G - 8 }, dur: 0.1 },
    // 咕嚕咕嚕滾到網前面
    { at: 4.7, actor: 'ball', do: 'moveTo', to: { x: 74, y: on(74, 22) }, dur: 0.55, ease: 'out' },
    { at: 4.7, actor: 'ball', do: 'rotateTo', amount: -400, dur: 0.55, ease: 'out' },
    { at: 4.7, actor: 'pir', do: 'moveTo', to: { x: 74, y: G - 8 }, dur: 0.55, ease: 'out' },
    { at: 4.7, actor: 'pir', do: 'rotateTo', amount: -400, dur: 0.55, ease: 'out', pivot: 'center' },
    { at: 5.25, actor: 'mush', do: 'squash', amount: 0.3, dur: 0.3 },
    // 蜘蛛爬過來拉線頭：拉不動
    { at: 5.4, actor: 'spi', do: 'moveTo', to: { x: 58, y: on(74, 9) }, dur: 0.4, ease: 'out' },
    { at: 5.9, actor: 'spi', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 6.25, actor: 'spi', do: 'squash', amount: -0.25, dur: 0.25 },
    // 用力一扯！毛線球轉開，海盜被甩上天
    { at: 6.6, actor: 'spi', do: 'moveTo', to: { x: 44, y: on(74, 9) }, dur: 0.2, anticipate: 2, ease: 'out' },
    { at: 6.6, actor: 'ball', do: 'rotateTo', amount: 1080, dur: 0.35 },
    { at: 6.85, actor: 'ball', do: 'vanish', dur: 0.15 },
    { at: 6.85, actor: 'pir', do: 'moveTo', to: { x: 90, y: 18 }, dur: 0.3, ease: 'out' },
    { at: 6.85, actor: 'pir', do: 'rotateTo', amount: 400, dur: 0.5, pivot: 'center' },
    { at: 7.15, actor: 'pir', do: 'moveTo', to: { x: 90, y: G }, dur: 0.3, ease: 'in' },
    // 落地站好，蜘蛛跳到帽子上
    { at: 7.45, actor: 'pir', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 7.45, actor: 'pir', do: 'scaleTo', amount: 2.0, dur: 0.35, ease: 'back' },
    { at: 7.5, actor: 'spi', do: 'moveTo', to: { x: 90, y: 51 }, arc: 14, dur: 0.4, ease: 'out' },
    { at: 7.5, actor: 'spi', do: 'scaleTo', amount: 1.4, dur: 0.4 },
    { at: 8.2, actor: 'spi', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    ...webFx,
    { at: 2.0, kind: 'burst', actor: 'hub', emoji: '✨', n: 6, dur: 0.6 },
    { at: 2.15, kind: 'pop', actor: 'pir', emoji: '❗', dur: 0.4 },
    { at: 2.55, kind: 'pop', actor: 'pir', emoji: '💡', dur: 0.5 },
    // 拉出去的毛線：從樹上連到毛線團
    { at: 2.85, kind: 'line', actor: 'yarn', to: ANCHOR, dur: 1.15, color: '#3E7BD9', width: 0.8 },
    { at: 3.2, kind: 'line', actor: 'yarn', to: { x: 134, y: 62 }, dur: 0.8, color: '#3E7BD9', width: 0.8 },
    { at: 3.55, kind: 'line', actor: 'yarn', to: { x: 128, y: 40 }, dur: 0.45, color: '#3E7BD9', width: 0.8 },
    { at: 4.0, kind: 'burst', actor: 'pir', emoji: '🌀', n: 5, dur: 0.6 },
    { at: 4.5, kind: 'pop', actor: 'ball', emoji: '😱', dx: 8, dur: 0.6 },
    { at: 5.25, kind: 'dizzy', actor: 'ball', dur: 0.8 },
    { at: 5.4, kind: 'pop', actor: 'spi', emoji: '😆', dx: -5, dur: 0.5 },
    { at: 5.85, kind: 'line', actor: 'spi', target: 'ball', dur: 1.0, color: '#3E7BD9', width: 0.8 },
    { at: 6.25, kind: 'sweat', actor: 'spi' },
    { at: 6.85, kind: 'burst', actor: 'pir', emoji: '🧶', n: 6, dur: 0.6 },
    { at: 7.45, kind: 'puff', actor: 'pir', n: 6, dur: 0.5 },
    { at: 7.7, kind: 'burst', actor: 'pir', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 7.8, kind: 'burst', actor: 'spi', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 4.0, dur: 0.4, do: 'punch', amount: 0.15, to: { x: 100, y: 58 } },
    { at: 5.25, dur: 0.3, do: 'shake', amount: 1.0 },
    { at: 6.6, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 7.5, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 84, y: 52 } },
  ],
  lights: [
    { at: 0, dur: 4, level: 0.25 },
    { at: 7.5, dur: 0.05, level: -0.3 },
    { at: 7.55, dur: 0.4, level: 0.1 },
  ],
  cues: [
    { at: 0.05, sfx: 'whoosh' },
    { at: 0.6, sfx: 'blip' },
    { at: 1.65, sfx: 'clink' },
    { at: 2.15, sfx: 'blip' },
    { at: 2.85, sfx: 'whoosh' },
    { at: 4.0, sfx: 'slide' },
    { at: 4.7, sfx: 'rumble' },
    { at: 5.25, sfx: 'bonk' },
    { at: 6.6, sfx: 'whoosh' },
    { at: 7.4, sfx: 'boing' },
    { at: 7.7, say: '蜘蛛人' },
    { at: 7.8, sfx: 'cheer' },
  ],
})
