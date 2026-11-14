// 演的是字面意思：皮＝一顆皮球、卡＝卡車、丘＝山丘：皮球坐卡車上山丘，山頂一道閃電把球嚇得彈起來（沒有黃色老鼠、閃電尾巴、紅臉頰）。
import { scene } from '../../story/scene'
import { ride } from '../../anim/helpers'
import type { Move } from '../../anim/clip'

// 卡車載著一顆皮球開進來，看到山丘想開上去：第一次開到一半溜下來，皮球被甩到地上自己彈回車上。
// 卡車蓄力一衝，開上山頂！正得意，一朵烏雲飄過來……停一拍，轟！閃電打在皮球上，皮球嚇得彈上天、轉了三圈掉回車上，
// 全身亮晶晶：「皮卡丘」。烏雲不好意思地散了，彩虹出來。
const T = 67.8 // 卡車（size 22）在地上的 y
const UP = -10 // 皮球坐在車斗上（比卡車的腳底高多少）
// 山丘（⛰️ size 90、x 95）的坡：從 (52, 74) 斜到山頂 (100.5, 41)，斜率 0.68（用紅點量過）。卡車 size 22 的 y 比腳底高 6.2
const TOP = { x: 100, y: 35.8 } // 山頂

const truck: Move[] = [
  // 開進來
  { at: 0, actor: 'truck', do: 'enter', from: { x: -24, y: T }, dur: 0.9, ease: 'out' },
  // 第一次：開到半山腰，溜下來
  { at: 1.5, actor: 'truck', do: 'rotateTo', amount: -34, dur: 0.25 },
  { at: 1.5, actor: 'truck', do: 'moveTo', to: { x: 72, y: 54.2 }, dur: 0.8, ease: 'out' },
  { at: 2.5, actor: 'truck', do: 'moveTo', to: { x: 40, y: T }, dur: 0.45, ease: 'in' },
  { at: 2.95, actor: 'truck', do: 'rotateTo', amount: 34, dur: 0.15 },
  // 第二次：衝上去
  { at: 3.9, actor: 'truck', do: 'rotateTo', amount: -34, dur: 0.15 },
  { at: 3.9, actor: 'truck', do: 'moveTo', to: { x: 86, y: 44.7 }, dur: 0.45, anticipate: 4, ease: 'in' },
  { at: 4.35, actor: 'truck', do: 'moveTo', to: TOP, dur: 0.25, ease: 'out' },
  { at: 4.4, actor: 'truck', do: 'rotateTo', amount: 34, dur: 0.2 },
]

export default scene({
  duration: 9.4,
  bg: { top: '#8FD3FF', bottom: '#E3F6FF', floor: '#9BD77A', scenery: 'hills' },
  actors: [
    { id: 'cloud1', emoji: '☁️', x: 30, y: 18, size: 16, float: true },
    { id: 'tree', emoji: '🌳', x: 12, y: 61.2, size: 30 },
    { id: 'hill', emoji: '⛰️', x: 95, y: 76, size: 90 },
    { id: 'flower', emoji: '🌼', x: 146, y: 72.8, size: 10 },
    { id: 'rainbow', emoji: '🌈', x: 103, y: 50, size: 36, float: true, hidden: true },
    { id: 'storm', emoji: '🌩️', x: 190, y: 12, size: 18, float: true },
    { id: 'truck', emoji: '🚚', x: 40, y: T, size: 22, flip: true },
    { id: 'ball', emoji: '⚽', x: 40, y: T + UP, size: 11, pivot: 'center' },
  ],
  moves: [
    ...ride(truck.filter((m) => m.do !== 'rotateTo'), 'ball', UP, 22),
    ...truck.filter((m) => m.do === 'rotateTo'),
    // 開到了：卡車壓一下、皮球彈一下
    { at: 0.9, actor: 'truck', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 1.0, actor: 'ball', do: 'hop', amount: 3, dur: 0.3 },
    // 溜下來時皮球被甩出去，彈兩下自己跳回車上
    { at: 2.55, actor: 'ball', do: 'moveTo', to: { x: 20, y: 71.5 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 2.55, actor: 'ball', do: 'spin', times: -2, dur: 0.45 },
    { at: 3.0, actor: 'ball', do: 'bounce', amount: 4, times: 2, dur: 0.5 },
    { at: 3.5, actor: 'ball', do: 'moveTo', to: { x: 40, y: T + UP }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 3.5, actor: 'ball', do: 'spin', times: 1, dur: 0.35 },
    // 蓄力
    { at: 3.55, actor: 'truck', do: 'shake', amount: 1, dur: 0.35 },
    // 山頂得意
    { at: 4.7, actor: 'truck', do: 'hop', amount: 3, dur: 0.3 },
    { at: 4.7, actor: 'ball', do: 'hop', amount: 5, dur: 0.35 },
    // 烏雲飄過來，停在正上方
    { at: 5.1, actor: 'storm', do: 'moveTo', to: { x: 100, y: 12 }, dur: 0.6, ease: 'out' },
    { at: 5.9, actor: 'storm', do: 'shake', amount: 1, dur: 0.3 },
    // 轟！皮球彈上天，轉三圈，掉回車上
    { at: 6.25, actor: 'ball', do: 'moveTo', to: { x: 126, y: 18 }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 6.25, actor: 'ball', do: 'spin', times: 3, dur: 0.75 },
    { at: 6.6, actor: 'ball', do: 'moveTo', to: { x: TOP.x, y: TOP.y + UP }, dur: 0.4, ease: 'bounce' },
    { at: 6.25, actor: 'truck', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 7.0, actor: 'truck', do: 'squash', amount: 0.25, dur: 0.3 },
    // 皮球放大亮晶晶，烏雲變成小白雲，彩虹出來
    { at: 7.0, actor: 'ball', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 7.0, actor: 'ball', do: 'tint', filter: 'brightness(1.15) saturate(1.3)' },
    { at: 7.6, actor: 'storm', do: 'swap', emoji: '☁️' },
    { at: 7.7, actor: 'storm', do: 'moveTo', to: { x: 190, y: 12 }, dur: 0.8, ease: 'in' },
    { at: 7.7, actor: 'rainbow', do: 'pop', dur: 0.5 },
    { at: 8.0, actor: 'ball', do: 'hop', amount: 4, dur: 0.35 },
    { at: 8.0, actor: 'truck', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.85, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 1.15, kind: 'pop', actor: 'truck', emoji: '💪', dx: 10, dur: 0.6 },
    { at: 2.2, kind: 'sweat', actor: 'truck' },
    { at: 3.05, kind: 'dizzy', actor: 'ball', dur: 0.5 },
    { at: 3.55, kind: 'puff', actor: 'truck', n: 8, dur: 0.6 },
    { at: 4.6, kind: 'burst', actor: 'truck', emoji: '⭐', n: 6, dur: 0.7 },
    { at: 5.6, kind: 'pop', actor: 'ball', emoji: '❓', dx: -8, dur: 0.5 },
    { at: 5.85, kind: 'sweat', actor: 'ball' },
    { at: 6.2, kind: 'zap', actor: 'storm', target: 'ball', dur: 0.3 },
    { at: 6.25, kind: 'burst', actor: 'ball', emoji: '⚡', n: 6, dur: 0.6 },
    { at: 6.3, kind: 'pop', actor: 'ball', emoji: '😱', dx: 12, dur: 0.6 },
    { at: 7.0, kind: 'burst', actor: 'ball', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.0, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 8.0, kind: 'burst', actor: 'ball', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 4.5, dur: 0.5, do: 'zoom', amount: 1.15, to: { x: 100, y: 42 } },
    { at: 6.2, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 7.0, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 100, y: 30 } },
    { at: 7.5, dur: 0.5, do: 'zoom', amount: 1.55, to: { x: 99, y: 35 } },
  ],
  lights: [
    { at: 5.1, dur: 0.6, level: 0.35 },
    { at: 6.2, dur: 0.05, level: -0.45 },
    { at: 6.25, dur: 0.3, level: 0.3 },
    { at: 7.6, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 1.5, sfx: 'rumble' },
    { at: 2.5, sfx: 'slide' },
    { at: 3.0, sfx: 'boing' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.7, sfx: 'cheer' },
    { at: 5.1, sfx: 'rumble' },
    { at: 6.2, sfx: 'crack' },
    { at: 6.25, sfx: 'laser' },
    { at: 7.0, sfx: 'boing' },
    { at: 7.15, say: '皮卡丘' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
