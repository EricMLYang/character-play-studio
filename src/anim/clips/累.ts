import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 累：樹懶自稱搬家大力士，舉起一個箱子就開始發抖；小螞蟻咻一下扛三個箱子跑過去，第二趟連沙發都扛走。
// 樹懶越壓越扁，箱子掉下來摔成「田」，牠直接躺平睡著；螞蟻丟來毛線球變成「糸」。最後卡車開走了，樹懶醒來用超慢速度追。累、累、很累
const clip: Clip = {
  char: '累',
  meta: { theme: '搬家大力士', cast: '樹懶＋小螞蟻＋卡車', gags: ['自稱大力士舉一箱就抖', '小螞蟻扛沙發（大小對比）', '越壓越扁直接躺平', '慢吞吞追卡車'] },
  duration: 10,
  bg: { top: '#E3F0FF', bottom: '#F3F7FF', floor: '#A9A39A', scenery: 'city' },
  actors: [
    { id: 'truck', emoji: '🚚', x: 146, y: 67.8, size: 22, hidden: true, flip: true },
    { id: 'sloth', emoji: '🦥', x: 28, y: 69.1, size: 18.8, hidden: true },
    { id: 'box', emoji: '📦', x: 40, y: 72.8, size: 10, hidden: true },
    { id: 'ant', emoji: '🐜', x: 128, y: 73.9, size: 7.5, hidden: true, flip: true },
    { id: 's1', emoji: '📦', x: 128, y: 69.5, size: 8.8, hidden: true, float: true },
    { id: 's2', emoji: '📦', x: 128, y: 63.9, size: 8.8, hidden: true, float: true },
    { id: 's3', emoji: '📦', x: 128, y: 58.3, size: 8.8, hidden: true, float: true },
    { id: 'couch', emoji: '🛋️', x: 128, y: 65.5, size: 17.5, hidden: true, float: true },
    { id: 'yarn', emoji: '🧶', x: 124, y: 64, size: 8.8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'sloth', do: 'pop' },
    { at: 0.15, actor: 'box', do: 'pop' },
    { at: 0.2, actor: 'truck', do: 'enter', from: { x: 190, y: 67.8 }, dur: 0.8 },
    // 大力士舉箱子：好慢、發抖
    { at: 1, actor: 'sloth', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1, actor: 'box', do: 'moveTo', to: { x: 28, y: 58.5 }, dur: 0.7 },
    { at: 1.74, actor: 'sloth', do: 'shake', amount: 1, dur: 0.6 },
    { at: 1.74, actor: 'box', do: 'shake', amount: 1, dur: 0.6 },
    // 小螞蟻扛三箱咻過去
    { at: 1.85, actor: 'ant', do: 'enter', from: { x: -10, y: 73.9 }, dur: 0.6 },
    { at: 1.85, actor: 's1', do: 'enter', from: { x: -10, y: 69.5 }, dur: 0.6 },
    { at: 1.85, actor: 's2', do: 'enter', from: { x: -10, y: 63.9 }, dur: 0.6 },
    { at: 1.85, actor: 's3', do: 'enter', from: { x: -10, y: 58.3 }, dur: 0.6 },
    { at: 2.55, actor: 's1', do: 'vanish', dur: 0.2 },
    { at: 2.61, actor: 's2', do: 'vanish', dur: 0.2 },
    { at: 2.66, actor: 's3', do: 'vanish', dur: 0.2 },
    { at: 2.77, actor: 'ant', do: 'flip' },
    { at: 2.77, actor: 'ant', do: 'moveTo', to: { x: -12, y: 73.9 }, dur: 0.45 },
    // 樹懶一步一步慢慢走
    { at: 3.15, actor: 'sloth', do: 'moveTo', to: { x: 31, y: 69.1 }, dur: 1.0 },
    { at: 3.15, actor: 'box', do: 'moveTo', to: { x: 31, y: 58.5 }, dur: 1.0 },
    // 第二趟：連沙發都扛走
    { at: 3.36, actor: 'ant', do: 'flip' },
    { at: 3.42, actor: 'ant', do: 'moveTo', to: { x: 128, y: 73.9 }, dur: 0.7 },
    { at: 3.42, actor: 'couch', do: 'enter', from: { x: -12, y: 65.5 }, dur: 0.7 },
    { at: 4.34, actor: 'couch', do: 'vanish', dur: 0.25 },
    // 越壓越扁
    { at: 3.8, actor: 'sloth', do: 'squash', amount: 0.3, dur: 0.6 },
    ...pressStack(3.6, 0.6, 0.3, 15, ['box']),
    { at: 4.45, actor: 'sloth', do: 'squash', amount: 0.5, dur: 0.45 },
    ...pressStack(4.2, 0.45, 0.5, 15, ['box']),
    // 箱子掉下來，樹懶躺平
    { at: 4.88, actor: 'box', do: 'moveTo', to: { x: 44, y: 72.8 }, arc: 4, dur: 0.25 },
    { at: 4.99, actor: 'sloth', do: 'squash', amount: 0.35, dur: 0.5 },
    { at: 4.99, actor: 'sloth', do: 'moveTo', to: { x: 24, y: 69.1 }, dur: 0.4 },
    { at: 5.15, actor: 'box', do: 'vanish', dur: 0.15 },
    // 螞蟻丟來毛線球
    { at: 5.55, actor: 'yarn', do: 'pop' },
    { at: 5.9, actor: 'yarn', do: 'vanish', dur: 0.15 },
    { at: 5.6, actor: 'ant', do: 'hop', amount: 4, dur: 0.3 },
    // 很累：打哈欠
    { at: 7.6, actor: 'sloth', do: 'squash', amount: -0.15, dur: 0.5 },
    // 螞蟻跳上卡車，卡車開走
    { at: 8.32, actor: 'ant', do: 'moveTo', to: { x: 146, y: 55 }, arc: 8, dur: 0.4 },
    { at: 8.68, actor: 'truck', do: 'moveTo', to: { x: 200, y: 67.8 }, dur: 0.8 },
    { at: 8.68, actor: 'ant', do: 'moveTo', to: { x: 200, y: 55 }, dur: 0.8 },
    // 樹懶醒來，用超慢速度追
    { at: 8.9, actor: 'sloth', do: 'hop', amount: 5, dur: 0.3 },
    { at: 9.21, actor: 'sloth', do: 'moveTo', to: { x: 33, y: 69.1 }, dur: 0.9 },
  ],
  builds: [
    // 摔破的箱子 → 田；毛線球 → 糸
    { at: 5.15, dur: 0.8, strokes: [0, 1, 2, 3, 4], from: 'box', color: '#B5651D' },
    { at: 5.9, dur: 0.8, strokes: [5, 6, 7, 8, 9, 10], from: 'yarn', color: '#D64570' },
  ],
  glyph: [{ at: 6.7, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'sloth', emoji: '💪', dur: 0.7 },
    { at: 1.8, kind: 'sweat', actor: 'sloth', dy: 8 },
    { at: 2.07, kind: 'puff', actor: 'ant' },
    { at: 2.55, kind: 'pop', actor: 'sloth', emoji: '😳', dur: 0.6, dy: 8 },
    { at: 3.85, kind: 'puff', actor: 'ant' },
    { at: 4.01, kind: 'sweat', actor: 'sloth', dy: 6 },
    { at: 5.15, kind: 'burst', actor: 'box', emoji: '💥', dur: 0.4 },
    { at: 5.4, kind: 'zzz', actor: 'sloth', dur: 3.0, dx: 4 },
    { at: 5.55, kind: 'pop', actor: 'ant', emoji: '😎', dur: 0.6 },
    { at: 7.5, kind: 'bubble', actor: 'sloth', emoji: '🥱', dur: 0.9 },
    { at: 8.59, kind: 'pop', actor: 'ant', emoji: '👋', dur: 0.45, dx: -10 },
    { at: 8.9, kind: 'pop', actor: 'sloth', emoji: '❗', dur: 0.5 },
    { at: 9.29, kind: 'sweat', actor: 'sloth' },
  ],
  camera: [
    { at: 4.55, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 30, y: 62 } },
  ],
  cues: [
    { at: 1, sfx: 'slide' },
    { at: 1.8, say: '累' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 3.42, sfx: 'whoosh' },
    { at: 4.45, sfx: 'deflate' },
    { at: 5.15, sfx: 'crack' },
    { at: 5.9, sfx: 'whoosh' },
    { at: 6.75, say: '累' },
    { at: 7.75, say: '很累' },
    { at: 8.68, sfx: 'whoosh' },
    { at: 8.9, sfx: 'boing' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
