import type { Clip } from '../clip'
import { ride } from '../helpers'

// 甲：浣熊花生抱著一疊搖搖晃晃的積木，要衝向一根巨大的玩具大拇指。第一次衝，積木往後一仰，他只能原地跑；退後蓄力再衝——「碰」一頭撞扁在大拇指上，
// 積木飛上天、一塊一塊掉下來排成框框和中間一橫，最長那根從中間滑下來，變成「甲」。花生舉起爪子，指尖冒出一片亮晶晶的指甲；大拇指也比個讚，把他彈得轉一圈。甲、甲、指甲
const clip: Clip = {
  char: '甲',
  meta: { theme: '衝向大拇指', cast: '浣熊花生＋一疊積木＋巨大大拇指', gags: ['原地跑不動', '一頭撞扁在大拇指上', '積木飛上天掉成字', '大拇指按讚把他彈飛'] },
  duration: 10,
  bg: { top: '#FFF0B3', bottom: '#FFF9E3', floor: '#F6D98B', scenery: 'room' },
  actors: [
    { id: 'thumb', emoji: '👍', x: 140, y: 64, size: 28, flip: true },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 30, y: 71, size: 14, hidden: true, flip: true },
    { id: 'bricks', emoji: '🧱', x: 30, y: 58, size: 10, hidden: true },
    { id: 'nail', emoji: '💅', x: 31, y: 56, size: 8, hidden: true, float: true },
  ],
  moves: [
    ...ride([
      { at: 0, actor: 'raccoon', do: 'enter', from: { x: -15, y: 71 }, dur: 0.7, ease: 'out' },
      // 衝第一次：積木往後仰，他原地跑
      { at: 1.6, actor: 'raccoon', do: 'shake', amount: 2, dur: 0.8 },
      // 退到最左邊再蓄力
      { at: 2.4, actor: 'raccoon', do: 'moveTo', to: { x: 16, y: 71 }, dur: 0.3, ease: 'out' },
      { at: 2.75, actor: 'raccoon', do: 'squash', amount: -0.35, dur: 0.3 },
    ], 'bricks', -13, 14),
    { at: 0, actor: 'raccoon', do: 'bounce', amount: 1.5, times: 3, dur: 0.7 },
    { at: 0, actor: 'bricks', do: 'tilt', amount: 15, dur: 0.7 },
    // 指著大拇指，往後仰蓄力
    { at: 0.8, actor: 'raccoon', do: 'tilt', amount: -12, dur: 0.6 },
    { at: 1.6, actor: 'bricks', do: 'tilt', amount: -25, dur: 0.8 },
    { at: 2.9, actor: 'bricks', do: 'tilt', amount: -10, dur: 0.3 },
    // 咻——衝出去
    { at: 3.05, actor: 'raccoon', do: 'moveTo', to: { x: 118, y: 71 }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 3.05, actor: 'bricks', do: 'moveTo', to: { x: 116, y: 58 }, dur: 0.4, anticipate: 4, ease: 'in' },
    // 碰！撞扁在大拇指上，積木飛上天
    { at: 3.45, actor: 'thumb', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: 3.45, actor: 'raccoon', do: 'squash', amount: -0.45, dur: 0.4 },
    { at: 3.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 3.45, actor: 'bricks', do: 'moveTo', to: { x: 80, y: 10 }, dur: 0.4, arc: 10, ease: 'out' },
    { at: 3.45, actor: 'bricks', do: 'spin', times: 2, dur: 0.4 },
    { at: 3.85, actor: 'bricks', do: 'vanish', dur: 0.15 },
    // 被彈回來，翻過字的上面落到左下角
    { at: 3.9, actor: 'raccoon', do: 'moveTo', to: { x: 28, y: 71 }, dur: 0.7, arc: 52, ease: 'out' },
    { at: 3.9, actor: 'raccoon', do: 'spin', times: 1, dur: 0.7 },
    { at: 4.6, actor: 'raccoon', do: 'squash', amount: 0.35, dur: 0.3 },
    // 站起來，舉起爪子——冒出亮晶晶的指甲
    { at: 5.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 5.8, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.0, actor: 'nail', do: 'pop', dur: 0.3 },
    { at: 6.1, actor: 'thumb', do: 'flash', dur: 0.6 },
    // 用錯手敬禮，差點跌倒
    { at: 7.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.0, actor: 'nail', do: 'vanish', dur: 0.2 },
    { at: 7.3, actor: 'raccoon', do: 'tilt', amount: 18, dur: 0.6 },
    // 回馬槍：大拇指也按個讚——彎下來輕輕一彈，花生又轉了一圈
    { at: 8.1, actor: 'thumb', do: 'tilt', amount: -20, dur: 0.5 },
    { at: 8.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 8.35, actor: 'raccoon', do: 'hop', amount: 10, dur: 0.5 },
    { at: 8.35, actor: 'raccoon', do: 'spin', times: 1, dur: 0.5 },
    { at: 8.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 8.9, actor: 'raccoon', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.2, actor: 'raccoon', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 四塊積木落成框框、一塊落成中間一橫、最長那根從中間滑下來
    { at: 3.95, dur: 0.55, strokes: [0, 1, 3], from: 'bricks', style: 'drop', color: '#1C4FD8' },
    { at: 4.5, dur: 0.2, strokes: [2], from: 'bricks', style: 'drop', color: '#1C4FD8' },
    { at: 4.75, dur: 0.3, strokes: [4], from: { x: 80, y: -5 }, color: '#1864AB' },
  ],
  glyph: [{ at: 5.2, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'raccoon', emoji: '👍', dy: -6, dur: 0.7 },
    { at: 1.6, kind: 'puff', actor: 'raccoon', dur: 0.8 },
    { at: 1.7, kind: 'pop', actor: 'bricks', emoji: '🫡', dy: -2, dur: 0.5 },
    { at: 2.4, kind: 'sweat', actor: 'raccoon' },
    { at: 3.05, kind: 'puff', actor: 'raccoon', dur: 0.4 },
    { at: 3.45, kind: 'burst', actor: 'raccoon', n: 1, dx: 4, dur: 0.35 },
    { at: 4.65, kind: 'dizzy', actor: 'raccoon', dur: 1.0 },
    { at: 6.05, kind: 'burst', actor: 'nail', emoji: '✨', n: 5, dur: 0.6 },
    { at: 6.2, kind: 'pop', actor: 'thumb', emoji: '✨', dy: 2, dur: 0.6 },
    { at: 7.4, kind: 'sweat', actor: 'raccoon' },
    { at: 8.9, kind: 'pop', actor: 'raccoon', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 3.05, dur: 0.2, do: 'follow', actor: 'raccoon', amount: 1.3 },
    { at: 3.45, dur: 0.3, do: 'shake', amount: 0.9 },
    { at: 3.5, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.0, say: '甲' },
    { at: 1.6, sfx: 'slide' },
    { at: 3.05, sfx: 'whoosh' },
    { at: 3.45, sfx: 'bonk' },
    { at: 3.95, sfx: 'plop' },
    { at: 4.75, sfx: 'slide' },
    { at: 5.2, say: '甲' },
    { at: 6.05, say: '指甲' },
    { at: 8.35, sfx: 'boing' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
