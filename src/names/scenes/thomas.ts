// 演的是字面意思：湯（一大鍋湯）＋小火車——一台小火車車頂載著一大鍋熱湯，要送給月台上等著的海豹，一緊張湯全潑出來（沒有藍色車頭、沒有臉、沒有編號）。
import { scene } from '../../story/scene'
import { ride } from '../../anim/helpers'
import type { Move } from '../../anim/clip'

// 下雪的傍晚：小火車車頂頂著一大鍋冒煙的熱湯，叮叮咚咚開進來，海豹在站牌下捧著碗等。
// 火車開太快，猛一煞車——湯鍋往前滑到車頭邊邊、晃啊晃……停一拍……穩住了，海豹鬆一口氣。
// 火車慢慢開到海豹面前，鍋子歪一點點：只滴下一滴湯（海豹翻白眼）。海豹敲敲車廂，火車嚇一跳往上一彈——
// 湯鍋飛上天翻過來，嘩啦！熱湯淋了海豹一身，鍋子倒扣在他頭上當帽子，碗卻剛好裝滿。海豹舔一口：好好喝！
// 火車得意地冒蒸氣：「湯瑪士小火車」。
const T = 30 // 火車
const G = 77 - 0.42 * T
const UP = -13 // 湯鍋在車頂（比火車的 y 高多少）
const SX = 124 // 海豹
const S = 14
const SG = 77 - 0.42 * S
const TX = 82 // 火車停的地方
const HAT = { x: SX, y: SG - 11 } // 鍋子倒扣在海豹頭上

const train: Move[] = [
  // ① 開進來，開太快
  { at: 0, actor: 'train', do: 'enter', from: { x: -30, y: G }, dur: 1.2, ease: 'linear' },
  // ② 猛一煞車
  { at: 1.2, actor: 'train', do: 'moveTo', to: { x: 62, y: G }, dur: 0.35, ease: 'out' },
  // ③ 慢慢開到海豹面前
  { at: 3.1, actor: 'train', do: 'moveTo', to: { x: TX, y: G }, dur: 0.8, ease: 'inOut' },
]

export default scene({
  duration: 9.8,
  bg: { top: '#7E8FC9', bottom: '#E4E9FA', floor: '#F4F7FF', scenery: 'snow' },
  actors: [
    { id: 'tree', emoji: '🌲', x: 14, y: 77 - 0.42 * 26, size: 26 },
    { id: 'stop', emoji: '🚏', x: 146, y: 77 - 0.42 * 22, size: 22 },
    { id: 'train', emoji: '🚃', x: 50, y: G, size: T },
    { id: 'pot', emoji: '🍲', x: 50, y: G + UP, size: 14, float: true, pivot: 'center' },
    { id: 'seal', emoji: '🦭', x: SX, y: SG, size: S },
    { id: 'bowl', emoji: '🥣', x: SX - 7, y: SG - 1, size: 6, float: true },
  ],
  moves: [
    ...ride(train, 'pot', UP, T),
    // 煞車：車身往前一點頭，鍋子滑到車頭、晃啊晃
    { at: 1.5, actor: 'train', do: 'tilt', amount: 6, dur: 0.35 },
    { at: 1.55, actor: 'pot', do: 'moveTo', to: { x: 62 + 11, y: G + UP + 1 }, dur: 0.3, ease: 'out' },
    { at: 1.85, actor: 'pot', do: 'tilt', amount: 22, dur: 0.35 },
    { at: 2.2, actor: 'pot', do: 'tilt', amount: -16, dur: 0.35 },
    { at: 2.55, actor: 'pot', do: 'tilt', amount: 10, dur: 0.3 },
    // 停一拍……穩住了，滑回中間
    { at: 2.7, actor: 'seal', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 2.85, actor: 'pot', do: 'moveTo', to: { x: 62, y: G + UP }, dur: 0.25 },
    // 到了：鍋子歪一點點，只滴一滴
    { at: 3.9, actor: 'train', do: 'squash', amount: 0.1, dur: 0.25 },
    { at: 4.1, actor: 'pot', do: 'rotateTo', amount: 25, dur: 0.3 },
    { at: 4.1, actor: 'bowl', do: 'moveTo', to: { x: TX + 16, y: SG - 4 }, dur: 0.3, ease: 'out' },
    { at: 4.1, actor: 'seal', do: 'moveTo', to: { x: TX + 23, y: SG }, dur: 0.3, ease: 'out' },
    { at: 4.6, actor: 'pot', do: 'rotateTo', amount: -25, dur: 0.25 },
    { at: 4.9, actor: 'seal', do: 'shake', amount: 0.4, dur: 0.3 },
    // 海豹敲敲車廂
    { at: 5.3, actor: 'seal', do: 'tilt', amount: -14, dur: 0.18 },
    { at: 5.5, actor: 'seal', do: 'tilt', amount: -14, dur: 0.18 },
    // ④ 火車嚇一跳往上彈，鍋子飛上天翻過來
    { at: 5.75, actor: 'train', do: 'hop', amount: 7, dur: 0.4 },
    { at: 5.8, actor: 'pot', do: 'moveTo', to: { x: SX - 6, y: 16 }, arc: 4, dur: 0.45, ease: 'out' },
    { at: 5.8, actor: 'pot', do: 'rotateTo', amount: 540, dur: 0.75 },
    { at: 6.25, actor: 'pot', do: 'moveTo', to: HAT, dur: 0.3, ease: 'in' },
    { at: 5.9, actor: 'seal', do: 'moveTo', to: { x: SX, y: SG }, dur: 0.3, ease: 'out' },
    { at: 5.9, actor: 'bowl', do: 'moveTo', to: { x: SX - 7, y: SG - 1 }, dur: 0.3, ease: 'out' },
    { at: 6.55, actor: 'seal', do: 'squash', amount: 0.35, dur: 0.35 },
    // 停一拍……舔一口，好好喝
    { at: 7.1, actor: 'seal', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.1, actor: 'pot', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.1, actor: 'bowl', do: 'hop', amount: 3, dur: 0.3 },
    // ⑤ 火車得意變大
    { at: 7.3, actor: 'train', do: 'scaleTo', amount: 1.2, dur: 0.35, ease: 'back' },
    { at: 7.3, actor: 'train', do: 'tint', filter: 'brightness(1.1) saturate(1.25)' },
    { at: 8.4, actor: 'train', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'pot', emoji: '♨️', dur: 1.6 },
    { at: 0.4, kind: 'pop', actor: 'seal', emoji: '😋', dur: 0.7 },
    { at: 1.25, kind: 'puff', actor: 'train', n: 14, dur: 0.6 },
    { at: 1.6, kind: 'sweat', actor: 'seal' },
    { at: 1.9, kind: 'pop', actor: 'train', emoji: '😱', dx: -12, dur: 0.6 },
    { at: 3.0, kind: 'pop', actor: 'seal', emoji: '😅', dur: 0.5 },
    { at: 4.2, kind: 'rain', actor: 'bowl', emoji: '💧', n: 1, dy: -8, dur: 0.5 },
    { at: 4.8, kind: 'pop', actor: 'seal', emoji: '🙄', dur: 0.6 },
    { at: 5.75, kind: 'pop', actor: 'train', emoji: '❗', dx: -12, dur: 0.4 },
    { at: 5.8, kind: 'puff', actor: 'train', n: 12, dur: 0.6 },
    { at: 6.1, kind: 'rain', actor: 'seal', emoji: '💧', n: 12, dy: -14, dur: 0.7 },
    { at: 6.55, kind: 'fountain', actor: 'seal', dur: 0.6 },
    { at: 7.2, kind: 'pop', actor: 'seal', emoji: '😋', dx: 9, dur: 0.8 },
    { at: 7.3, kind: 'burst', actor: 'train', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.6, kind: 'zzz', actor: 'train', emoji: '♨️', dur: 2.0 },
    { at: 8.4, kind: 'burst', actor: 'train', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 1.5, dur: 0.3, do: 'shake', amount: 1 },
    { at: 1.8, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 70, y: 52 } },
    { at: 3.0, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 6.5, dur: 0.35, do: 'shake', amount: 1.3 },
    { at: 7.3, dur: 0.4, do: 'punch', amount: 0.1, to: { x: 96, y: 56 } },
    { at: 7.6, dur: 0.6, do: 'zoom', amount: 1.4, to: { x: 123, y: 58 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.15 },
    { at: 6.5, dur: 0.05, level: -0.3 },
    { at: 6.55, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'rumble' },
    { at: 1.2, sfx: 'slide' },
    { at: 1.9, sfx: 'clink' },
    { at: 2.25, sfx: 'clink' },
    { at: 4.25, sfx: 'plop' },
    { at: 5.3, sfx: 'tap' },
    { at: 5.5, sfx: 'tap' },
    { at: 5.75, sfx: 'boing' },
    { at: 6.4, sfx: 'splash' },
    { at: 6.55, sfx: 'bonk' },
    { at: 7.0, sfx: 'gulp' },
    { at: 7.35, say: '湯瑪士小火車' },
    { at: 8.4, sfx: 'cheer' },
  ],
})
