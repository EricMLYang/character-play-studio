import { scene } from '../scene'
import type { Scenes } from './index'
import type { Move } from '../../anim/clip'

// 機器人不走：機器人沒電，灰灰的冒煙、小鳥敲他也沒反應。給他電就通電跳起來；給他水就短路冒火花轉圈倒下；
// 給他飯嘴巴打不開，飯碗倒扣在頭上被小鳥吃光。充飽電以後停不下來：給他慢，跟著蝸牛一小步一小步走；
// 給他快就噴火飛上天變成星星再摔下來；給他跳就跳到雲上、把雲踩破掉下來。最後走到鏡頭前面送你一朵花。
// 主角 robot（size 24 站在地上 y = 66.9），一直站在正中間 x 80；沒電的時候整隻染灰（DEAD）。
const G = 66.9
const X = 80
const BG = { top: '#C9B8F0', bottom: '#F3EEFF', floor: '#B9B4C7', scenery: 'city' as const }
/** 沒電：灰灰暗暗的 */
const DEAD = 'grayscale(.75) brightness(.85)'
/** 沒電、等著的樣子（need 的結尾、水／飯演完回來的樣子） */
const deadBot = { id: 'robot', emoji: 'hero:robot/broken', x: X, y: G, size: 24, tint: DEAD }
/** 衝太快、停不下來的樣子（zoom 的結尾、快／跳演完回來的樣子） */
const wildBot = { id: 'robot', emoji: 'hero:robot/surprised', x: X, y: G, size: 24 }
/** 停不下來、在原地狂踩：每 0.2 秒踩一下，左右歪來歪去 */
const stomp = (from: number, to: number): Move[] => {
  const out: Move[] = []
  for (let i = 0; from + i * 0.2 <= to - 0.18; i++) {
    const at = Math.round((from + i * 0.2) * 100) / 100
    out.push({ at, actor: 'robot', do: 'hop', amount: 2.5, dur: 0.16 }, { at, actor: 'robot', do: 'tilt', amount: i % 2 ? 6 : -6, dur: 0.18 })
  }
  return out
}

const scenes: Scenes = {
  // 機器人不走，也不叫。——灰灰的機器人冒煙，小鳥飛來站在頭上敲敲敲，一點反應都沒有，小鳥聳聳肩飛走
  stuck: scene({
    duration: 4.6,
    bg: BG,
    actors: [
      deadBot,
      { id: 'bird', emoji: '🐦', x: 82, y: 49, size: 10, hidden: true, flip: true, float: true },
    ],
    moves: [
      { at: 0.3, actor: 'robot', do: 'squash', amount: 0.12, dur: 0.4 },
      { at: 0.6, actor: 'bird', do: 'enter', from: { x: -10, y: 20 }, arc: 8, dur: 0.8, ease: 'out' },
      // 敲敲敲
      { at: 1.6, actor: 'bird', do: 'tilt', amount: 25, dur: 0.15 },
      { at: 1.85, actor: 'bird', do: 'tilt', amount: 25, dur: 0.15 },
      { at: 2.1, actor: 'bird', do: 'tilt', amount: 25, dur: 0.15 },
      // 沒反應。用力一點
      { at: 2.9, actor: 'bird', do: 'hop', amount: 5, dur: 0.3 },
      { at: 3.2, actor: 'robot', do: 'shake', amount: 0.6, dur: 0.25 },
      { at: 3.75, actor: 'bird', do: 'moveTo', to: { x: 175, y: 15 }, arc: 6, dur: 0.7, ease: 'in' },
    ],
    fx: [
      { at: 0.2, kind: 'puff', actor: 'robot', dur: 0.8 },
      { at: 1.6, kind: 'pop', actor: 'bird', emoji: '❓', dur: 0.9 },
      { at: 2.6, kind: 'zzz', actor: 'robot', emoji: '💨', dx: -10, dur: 1.4 },
      { at: 3.2, kind: 'burst', actor: 'robot', n: 1, dy: -12, dur: 0.4 },
      { at: 3.4, kind: 'sweat', actor: 'bird' },
    ],
    cues: [
      { at: 0.5, say: '機器人不走了，也不說話了。' },
      { at: 1.6, sfx: 'tap' },
      { at: 1.85, sfx: 'tap' },
      { at: 2.1, sfx: 'tap' },
      { at: 3.2, sfx: 'bonk' },
      { at: 3.75, sfx: 'whoosh' },
    ],
  }),

  // 他沒有電了！——頭上冒出電池的泡泡，眼睛一閃一閃，又暗下去垮掉
  need: scene({
    duration: 3.6,
    bg: BG,
    actors: [deadBot],
    moves: [
      { at: 0.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
      { at: 0.9, actor: 'robot', do: 'tint', filter: '' },
      { at: 1.05, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
      { at: 1.05, actor: 'robot', do: 'tint', filter: DEAD },
      { at: 1.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
      { at: 1.3, actor: 'robot', do: 'tint', filter: '' },
      { at: 1.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
      { at: 1.4, actor: 'robot', do: 'tint', filter: DEAD },
      // 垮下去
      { at: 1.9, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.7 },
      { at: 1.9, actor: 'robot', do: 'tilt', amount: -8, dur: 0.9 },
    ],
    fx: [
      { at: 0.3, kind: 'bubble', actor: 'robot', emoji: '🔋', dur: 2.2 },
      { at: 2.0, kind: 'puff', actor: 'robot', dur: 0.6 },
    ],
    cues: [
      { at: 0.6, say: '他沒有電了！' },
      { at: 0.9, sfx: 'blip' },
      { at: 1.3, sfx: 'blip' },
      { at: 1.9, sfx: 'deflate' },
    ],
  }),

  // 有電！——一道大閃電從天上劈下來，機器人一亮、彈起來空中轉一圈，笑著跳
  'charge:電': scene({
    duration: 4.6,
    bg: BG,
    actors: [
      deadBot,
      { id: 'bolt', emoji: '⚡', x: X, y: 14, size: 18, hidden: true, float: true },
    ],
    moves: [
      { at: 0.2, actor: 'bolt', do: 'pop', dur: 0.25 },
      { at: 0.45, actor: 'bolt', do: 'shake', amount: 1, dur: 0.3 },
      { at: 0.75, actor: 'bolt', do: 'moveTo', to: { x: X, y: 48 }, dur: 0.18, ease: 'in' },
      { at: 0.93, actor: 'bolt', do: 'vanish', dur: 0.08 },
      { at: 0.93, actor: 'robot', do: 'tint', filter: '' },
      { at: 0.93, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
      { at: 0.93, actor: 'robot', do: 'shake', amount: 2, dur: 0.4 },
      { at: 1.35, actor: 'robot', do: 'hop', amount: 12, dur: 0.6 },
      { at: 1.35, actor: 'robot', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
      { at: 1.95, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
      { at: 2.8, actor: 'robot', do: 'hop', amount: 5, dur: 0.35 },
      { at: 3.3, actor: 'robot', do: 'hop', amount: 5, dur: 0.35 },
    ],
    fx: [
      { at: 0.93, kind: 'burst', actor: 'robot', emoji: '⚡', n: 8, dur: 0.8 },
      { at: 2.0, kind: 'pop', actor: 'robot', emoji: '😆', dur: 1.4 },
      { at: 2.8, kind: 'burst', actor: 'robot', emoji: '✨', n: 8, dur: 0.9 },
    ],
    camera: [{ at: 0.93, dur: 0.35, do: 'shake', amount: 1.6 }],
    lights: [
      { at: 0.93, dur: 0.06, level: -0.5 },
      { at: 0.99, dur: 0.3, level: 0 },
    ],
    cues: [
      { at: 0.2, sfx: 'poof' },
      { at: 0.93, sfx: 'crack' },
      { at: 1.95, say: '有電了！機器人笑了。' },
      { at: 3.3, sfx: 'cheer' },
    ],
  }),

  // 不可給水！——水桶倒下來淋一身，劈哩啪啦冒火花、轉圈圈、側躺倒下冒煙，再爬起來變回沒電
  'charge:水': scene({
    duration: 5.0,
    bg: BG,
    actors: [
      deadBot,
      { id: 'pail', emoji: '🪣', x: X + 4, y: 26, size: 15, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.15, actor: 'pail', do: 'pop', dur: 0.25 },
      { at: 0.5, actor: 'pail', do: 'rotateTo', amount: -140, dur: 0.25 },
      { at: 1.1, actor: 'pail', do: 'moveTo', to: { x: 175, y: -10 }, dur: 0.5, ease: 'in' },
      // 通電了一下（眼睛亮），然後短路
      { at: 1.05, actor: 'robot', do: 'tint', filter: '' },
      { at: 1.05, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
      { at: 1.05, actor: 'robot', do: 'shake', amount: 2.6, dur: 0.9 },
      { at: 1.05, actor: 'robot', do: 'flash', dur: 0.9 },
      { at: 2.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
      { at: 2.0, actor: 'robot', do: 'hop', amount: 7, dur: 0.6 },
      { at: 2.0, actor: 'robot', do: 'spin', times: 2, dur: 0.6, pivot: 'center' },
      // 側躺倒下
      { at: 2.75, actor: 'robot', do: 'rotateTo', amount: 90, dur: 0.3, ease: 'in' },
      { at: 2.75, actor: 'robot', do: 'tint', filter: DEAD },
      // 躺著還在抽一下、冒一點火花
      { at: 3.7, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.3 },
      // 爬起來，回到沒電
      { at: 4.3, actor: 'robot', do: 'rotateTo', amount: -90, dur: 0.35 },
      { at: 4.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    ],
    fx: [
      { at: 0.6, kind: 'rain', x: X, y: 34, emoji: '💧', n: 10, dur: 0.8 },
      { at: 0.85, kind: 'burst', actor: 'robot', emoji: '💦', n: 8, dy: 6, dur: 0.6 },
      { at: 1.05, kind: 'burst', actor: 'robot', emoji: '⚡', n: 6, dur: 0.5 },
      { at: 1.45, kind: 'burst', actor: 'robot', emoji: '✨', n: 8, dur: 0.5 },
      { at: 1.05, kind: 'pop', actor: 'robot', emoji: '😱', dx: 12, dur: 0.9 },
      { at: 3.05, kind: 'burst', actor: 'robot', n: 1, dur: 0.4 },
      { at: 3.1, kind: 'zzz', actor: 'robot', emoji: '💨', dur: 1.4 },
      { at: 3.1, kind: 'dizzy', actor: 'robot', dur: 1.2 },
      { at: 4.6, kind: 'puff', actor: 'robot', dur: 0.4 },
      { at: 3.7, kind: 'burst', actor: 'robot', emoji: '⚡', n: 4, dur: 0.4 },
    ],
    camera: [
      { at: 1.05, dur: 0.8, do: 'shake', amount: 1.4 },
      { at: 3.05, dur: 0.3, do: 'shake', amount: 1.6 },
    ],
    lights: [
      { at: 1.05, dur: 0.05, level: -0.45 },
      { at: 1.1, dur: 0.15, level: 0 },
      { at: 1.4, dur: 0.05, level: -0.45 },
      { at: 1.45, dur: 0.15, level: 0 },
    ],
    cues: [
      { at: 0.6, sfx: 'splash' },
      { at: 1.05, sfx: 'laser' },
      { at: 1.3, say: '不能給他水！' },
      { at: 3.05, sfx: 'bonk' },
      { at: 3.7, sfx: 'blip' },
      { at: 4.3, sfx: 'deflate' },
      { at: 4.6, sfx: 'poof' },
    ],
  }),

  // 機器人不吃飯！——一碗飯飛到嘴巴前面，嘴巴打不開、碰一聲，飯碗倒扣在頭上；小鳥飛來把飯吃光、叼著碗飛走
  'charge:飯': scene({
    duration: 5.8,
    bg: BG,
    actors: [
      deadBot,
      { id: 'rice', emoji: '🍚', x: 60, y: 69, size: 12, hidden: true, float: true, pivot: 'center' },
      { id: 'bird', emoji: '🐦', x: 82, y: 37, size: 10, hidden: true, flip: true, float: true },
    ],
    moves: [
      { at: 0.2, actor: 'rice', do: 'drop', dur: 0.45 },
      // 飯自己飄到嘴巴前面：餵他
      { at: 0.9, actor: 'rice', do: 'moveTo', to: { x: 70, y: 58 }, dur: 0.4 },
      { at: 1.35, actor: 'rice', do: 'moveTo', to: { x: 74, y: 58 }, dur: 0.12, ease: 'in' },
      { at: 1.47, actor: 'rice', do: 'moveTo', to: { x: 68, y: 58 }, dur: 0.15, ease: 'out' },
      { at: 1.47, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 1.75, actor: 'rice', do: 'moveTo', to: { x: 74, y: 58 }, dur: 0.12, ease: 'in' },
      { at: 1.87, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.3 },
      // 彈起來，倒扣在頭上
      { at: 1.87, actor: 'rice', do: 'moveTo', to: { x: X, y: 48 }, arc: 12, dur: 0.5, ease: 'in' },
      { at: 1.87, actor: 'rice', do: 'rotateTo', amount: 180, dur: 0.5 },
      { at: 2.37, actor: 'robot', do: 'squash', amount: 0.2, dur: 0.3 },
      // 小鳥來吃
      { at: 3.0, actor: 'bird', do: 'enter', from: { x: -10, y: 15 }, arc: 6, dur: 0.6, ease: 'out' },
      { at: 3.7, actor: 'bird', do: 'tilt', amount: 30, dur: 0.15 },
      { at: 3.9, actor: 'bird', do: 'tilt', amount: 30, dur: 0.15 },
      { at: 4.1, actor: 'bird', do: 'tilt', amount: 30, dur: 0.15 },
      { at: 4.3, actor: 'bird', do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'back' },
      { at: 3.7, actor: 'robot', do: 'shake', amount: 0.5, dur: 0.6 },
      { at: 4.3, actor: 'robot', do: 'squash', amount: 0.15, dur: 0.3 },
      // 吃飽了，連碗一起叼走
      { at: 4.7, actor: 'bird', do: 'moveTo', to: { x: 180, y: 0 }, dur: 0.8, ease: 'in' },
      { at: 4.7, actor: 'rice', do: 'moveTo', to: { x: 180, y: 9 }, dur: 0.8, ease: 'in' },
      { at: 5.25, actor: 'robot', do: 'shake', amount: 0.6, dur: 0.3 },
    ],
    fx: [
      { at: 1.47, kind: 'pop', actor: 'robot', emoji: '❌', dx: -12, dur: 0.8 },
      { at: 1.87, kind: 'burst', actor: 'robot', emoji: '⚪', n: 8, dy: 4, dur: 0.6 },
      { at: 2.5, kind: 'sweat', actor: 'robot' },
      { at: 3.7, kind: 'burst', actor: 'bird', emoji: '⚪', n: 4, dur: 0.4 },
      { at: 4.3, kind: 'pop', actor: 'bird', emoji: '😋', dx: -8, dur: 0.8 },
    ],
    cues: [
      { at: 0.6, sfx: 'plop' },
      { at: 1.47, sfx: 'bonk' },
      { at: 1.87, sfx: 'bonk' },
      { at: 2.0, say: '機器人不吃飯！' },
      { at: 3.7, sfx: 'tap' },
      { at: 3.9, sfx: 'tap' },
      { at: 4.1, sfx: 'gulp' },
      { at: 4.7, sfx: 'whoosh' },
    ],
  }),

  // 機器人快跑！太快！太快！——充飽電停不下來，左右咻咻咻來回衝，撞翻垃圾桶彈回來，在原地狂踩冒煙
  zoom: scene({
    duration: 6.0,
    bg: BG,
    actors: [
      { id: 'robot', emoji: 'hero:robot/happy', x: X, y: G, size: 24 },
      { id: 'can', emoji: '🗑️', x: 130, y: 67.5, size: 16, hidden: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.1, actor: 'can', do: 'pop', dur: 0.3 },
      { at: 0.2, actor: 'robot', do: 'shake', amount: 1, dur: 0.4 },
      { at: 0.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
      { at: 0.7, actor: 'robot', do: 'moveTo', to: { x: 112, y: G }, dur: 0.35, anticipate: 4, ease: 'in' },
      { at: 1.05, actor: 'robot', do: 'moveTo', to: { x: 36, y: G }, dur: 0.45, ease: 'linear' },
      { at: 1.5, actor: 'robot', do: 'moveTo', to: { x: 112, y: G }, dur: 0.4, ease: 'linear' },
      { at: 1.9, actor: 'robot', do: 'moveTo', to: { x: 36, y: G }, dur: 0.38, ease: 'linear' },
      // 撞垃圾桶
      { at: 2.28, actor: 'robot', do: 'moveTo', to: { x: 120, y: G }, dur: 0.4, ease: 'in' },
      { at: 2.68, actor: 'can', do: 'moveTo', to: { x: 185, y: 10 }, arc: 10, dur: 0.6, ease: 'out' },
      { at: 2.68, actor: 'can', do: 'spin', times: 3, dur: 0.6 },
      { at: 2.68, actor: 'robot', do: 'moveTo', to: { x: X, y: G }, arc: 12, dur: 0.55, ease: 'out' },
      { at: 2.68, actor: 'robot', do: 'spin', times: -1, dur: 0.55, pivot: 'center' },
      // 在原地停不下來：狂踩
      ...stomp(3.3, 5.9),
      { at: 3.3, actor: 'robot', do: 'shake', amount: 1.2, dur: 2.6 },
    ],
    fx: [
      { at: 0.1, kind: 'puff', actor: 'can', dur: 0.5 },
      { at: 2.68, kind: 'burst', actor: 'robot', n: 1, dx: 10, dur: 0.4 },
      { at: 3.3, kind: 'puff', actor: 'robot', dur: 0.5 },
      { at: 3.9, kind: 'puff', actor: 'robot', dur: 0.5 },
      { at: 4.5, kind: 'puff', actor: 'robot', dur: 0.5 },
      { at: 5.1, kind: 'puff', actor: 'robot', dur: 0.5 },
      { at: 3.4, kind: 'zzz', actor: 'robot', emoji: '💨', dur: 2.4 },
      { at: 4.0, kind: 'sweat', actor: 'robot', dur: 1.2 },
      { at: 4.9, kind: 'pop', actor: 'robot', emoji: '😵', dx: 12, dur: 1.0 },
    ],
    camera: [{ at: 2.68, dur: 0.35, do: 'shake', amount: 1.8 }],
    cues: [
      { at: 0.7, sfx: 'whoosh' },
      { at: 1.05, say: '機器人快跑！太快了！太快了！' },
      { at: 1.5, sfx: 'whoosh' },
      { at: 2.68, sfx: 'bonk' },
      { at: 3.3, sfx: 'rumble' },
    ],
  }),

  // 慢慢走，真乖。——一隻蝸牛從右邊慢慢爬進來，機器人看傻了停下來，跟在蝸牛後面一小步一小步走
  'slow:慢': scene({
    duration: 5.6,
    bg: BG,
    actors: [
      wildBot,
      { id: 'snail', emoji: '🐌', x: 118, y: 70, size: 12, hidden: true, flip: true },
    ],
    moves: [
      { at: 0, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.6 },
      { at: 0.1, actor: 'snail', do: 'enter', from: { x: 150, y: 70 }, dur: 0.8, ease: 'out' },
      { at: 0.75, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
      { at: 0.8, actor: 'robot', do: 'tilt', amount: 10, dur: 0.7 },
      // 蝸牛轉頭往右爬，機器人一小步一小步跟在後面
      { at: 1.5, actor: 'snail', do: 'flip' },
      { at: 1.7, actor: 'snail', do: 'moveTo', to: { x: 136, y: 70 }, dur: 3.4, ease: 'linear' },
      { at: 1.9, actor: 'robot', do: 'moveTo', to: { x: 85, y: G }, dur: 0.4 },
      { at: 2.6, actor: 'robot', do: 'moveTo', to: { x: 90, y: G }, dur: 0.4 },
      { at: 3.3, actor: 'robot', do: 'moveTo', to: { x: 95, y: G }, dur: 0.4 },
      { at: 3.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
      { at: 4.0, actor: 'robot', do: 'moveTo', to: { x: 100, y: G }, dur: 0.4 },
      { at: 4.8, actor: 'snail', do: 'hop', amount: 2, dur: 0.3 },
    ],
    fx: [
      { at: 0.75, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.6 },
      { at: 1.0, kind: 'pop', actor: 'snail', emoji: '👋', dur: 0.8 },
      { at: 4.0, kind: 'pop', actor: 'snail', emoji: '😊', dur: 1.4 },
      { at: 4.4, kind: 'burst', actor: 'robot', emoji: '✨', n: 6, dur: 0.8 },
    ],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 2.0, say: '慢慢走，真乖。' },
    ],
  }),

  // 太快！他飛上天！——腳底噴火，咻一聲衝出畫面上面，天上亮一顆星星；再掉下來砸在地上，又在原地狂踩
  'slow:快': scene({
    duration: 5.6,
    bg: BG,
    actors: [
      wildBot,
      { id: 'star', emoji: '⭐', x: X, y: 18, size: 14, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0, actor: 'robot', do: 'shake', amount: 2, dur: 0.5 },
      { at: 0.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
      { at: 0.3, actor: 'robot', do: 'shake', amount: 2.5, dur: 0.35 },
      { at: 0.65, actor: 'robot', do: 'moveTo', to: { x: X, y: -40 }, dur: 0.45, ease: 'in' },
      // 天上一顆星星：就是他
      { at: 1.15, actor: 'star', do: 'pop', dur: 0.3 },
      { at: 1.5, actor: 'star', do: 'spin', times: 1, dur: 0.5 },
      { at: 2.1, actor: 'star', do: 'flash', dur: 0.4 },
      { at: 2.1, actor: 'star', do: 'hop', amount: 3, dur: 0.3 },
      { at: 2.55, actor: 'star', do: 'shake', amount: 1.5, dur: 0.3 },
      // 星星往下掉，變回機器人砸在地上
      { at: 2.85, actor: 'star', do: 'vanish', dur: 0.1 },
      { at: 2.85, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
      { at: 2.85, actor: 'robot', do: 'moveTo', to: { x: X, y: G }, dur: 0.4, ease: 'in' },
      { at: 3.25, actor: 'robot', do: 'squash', amount: 0.45, dur: 0.35 },
      // 回到原地狂踩
      { at: 4.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
      ...stomp(4.4, 5.5),
      { at: 4.4, actor: 'robot', do: 'shake', amount: 1.2, dur: 1.1 },
    ],
    fx: [
      { at: 0.3, kind: 'burst', x: X, y: 74, emoji: '🔥', n: 6, dur: 0.6 },
      { at: 0.65, kind: 'puff', actor: 'robot', dur: 0.6 },
      { at: 1.15, kind: 'burst', x: X, y: 18, emoji: '✨', n: 6, dur: 0.6 },
      { at: 2.1, kind: 'burst', x: X, y: 18, emoji: '✨', n: 6, dur: 0.6 },
      { at: 3.25, kind: 'burst', actor: 'robot', n: 1, dy: 6, dur: 0.4 },
      { at: 3.35, kind: 'dizzy', actor: 'robot', dur: 1.0 },
    ],
    camera: [{ at: 3.25, dur: 0.4, do: 'shake', amount: 2.2 }],
    cues: [
      { at: 0.65, sfx: 'whoosh' },
      { at: 0.9, say: '太快了！他飛上天了！' },
      { at: 1.15, sfx: 'blip' },
      { at: 2.85, sfx: 'whoosh' },
      { at: 3.25, sfx: 'bonk' },
    ],
  }),

  // 他跳好高！在雲上！——一朵雲飄過來，機器人一跳跳上去，在雲上蹦蹦跳，把雲踩破、掉下來
  'slow:跳': scene({
    duration: 6.0,
    bg: BG,
    actors: [
      { id: 'cloud', emoji: '☁️', x: X, y: 38, size: 30, hidden: true, float: true },
      wildBot,
    ],
    moves: [
      { at: 0, actor: 'robot', do: 'shake', amount: 1.5, dur: 0.5 },
      { at: 0.15, actor: 'cloud', do: 'enter', from: { x: 190, y: 38 }, dur: 0.6, ease: 'out' },
      { at: 0.6, actor: 'robot', do: 'squash', amount: -0.35, dur: 0.3 },
      { at: 0.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
      { at: 0.9, actor: 'robot', do: 'moveTo', to: { x: X, y: 21 }, dur: 0.45, ease: 'out' },
      { at: 1.35, actor: 'cloud', do: 'squash', amount: 0.25, dur: 0.35 },
      // 在雲上蹦蹦跳
      { at: 1.9, actor: 'robot', do: 'hop', amount: 5, dur: 0.35 },
      { at: 2.25, actor: 'cloud', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 2.6, actor: 'robot', do: 'hop', amount: 7, dur: 0.4 },
      { at: 3.0, actor: 'cloud', do: 'squash', amount: 0.45, dur: 0.3 },
      { at: 3.0, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
      { at: 3.4, actor: 'cloud', do: 'vanish', dur: 0.15 },
      { at: 3.4, actor: 'robot', do: 'moveTo', to: { x: X, y: G }, dur: 0.4, ease: 'in' },
      { at: 3.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
      { at: 3.8, actor: 'robot', do: 'squash', amount: 0.45, dur: 0.35 },
      { at: 4.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
      ...stomp(4.9, 5.9),
      { at: 4.9, actor: 'robot', do: 'shake', amount: 1.2, dur: 1.0 },
    ],
    fx: [
      { at: 3.0, kind: 'pop', actor: 'robot', emoji: '❗', dx: 14, dy: 12, dur: 0.5 },
      { at: 3.4, kind: 'burst', x: X, y: 38, emoji: '☁️', n: 6, dur: 0.6 },
      { at: 3.8, kind: 'burst', actor: 'robot', n: 1, dy: 6, dur: 0.4 },
      { at: 3.9, kind: 'dizzy', actor: 'robot', dur: 1.0 },
      // 雲的碎片下成小雨淋在他頭上
      { at: 4.0, kind: 'rain', x: X, y: 40, emoji: '💧', n: 6, dur: 0.8 },
    ],
    camera: [{ at: 3.8, dur: 0.4, do: 'shake', amount: 2 }],
    cues: [
      { at: 0.9, sfx: 'boing' },
      { at: 1.4, say: '他跳到雲上了！好高！' },
      { at: 1.9, sfx: 'boing' },
      { at: 2.6, sfx: 'boing' },
      { at: 3.4, sfx: 'poof' },
      { at: 3.8, sfx: 'bonk' },
    ],
  }),

  // 機器人給你花。他愛你。——手上冒出一朵花，走到鏡頭前面遞給你，愛心滿天，蝸牛也開心
  gift: scene({
    duration: 5.0,
    bg: BG,
    actors: [
      { id: 'snail', emoji: '🐌', x: 136, y: 70, size: 12 },
      { id: 'robot', emoji: 'hero:robot/happy', x: 100, y: G, size: 24 },
      { id: 'flower', emoji: '🌷', x: 90, y: 62, size: 11, hidden: true, float: true },
    ],
    moves: [
      { at: 0.3, actor: 'flower', do: 'pop', dur: 0.3 },
      { at: 0.4, actor: 'robot', do: 'hop', amount: 3, dur: 0.3 },
      // 走到鏡頭前面，把花遞給你
      { at: 1.6, actor: 'robot', do: 'squash', amount: -0.15, dur: 0.3 },
      { at: 1.9, actor: 'robot', do: 'moveTo', to: { x: X, y: 76 }, dur: 0.5, ease: 'back' },
      { at: 1.9, actor: 'robot', do: 'scaleTo', amount: 2.2, dur: 0.5, ease: 'back' },
      { at: 1.9, actor: 'flower', do: 'moveTo', to: { x: 64, y: 58 }, dur: 0.5, ease: 'back' },
      { at: 1.9, actor: 'flower', do: 'scaleTo', amount: 2.2, dur: 0.5, ease: 'back' },
      { at: 2.7, actor: 'flower', do: 'tilt', amount: -12, dur: 0.5 },
      { at: 3.3, actor: 'robot', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 3.3, actor: 'flower', do: 'tilt', amount: 10, dur: 0.5 },
      { at: 3.9, actor: 'robot', do: 'tilt', amount: -8, dur: 0.5 },
      { at: 4.3, actor: 'snail', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      { at: 0.3, kind: 'burst', actor: 'flower', emoji: '✨', n: 6, dur: 0.6 },
      { at: 2.4, kind: 'burst', x: X, y: 40, emoji: '💗', n: 12, dur: 1.2 },
      { at: 3.2, kind: 'burst', x: X, y: 36, emoji: '💖', n: 10, dur: 1.2 },
      { at: 4.0, kind: 'pop', actor: 'snail', emoji: '💗', dur: 1.0 },
    ],
    camera: [
      { at: 1.6, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
      { at: 2.4, dur: 0.3, do: 'shake', amount: 1 },
    ],
    cues: [
      { at: 0.6, say: '機器人給我花。他愛我。' },
      { at: 1.9, sfx: 'whoosh' },
      { at: 2.45, sfx: 'cheer' },
    ],
  }),
}

export default scenes
