import type { Clip } from '../clip'
import { ride } from '../helpers'

// 給：太空人玩偶想把金星星送給飛碟裡的小外星人，一走路就飄起來，只好站上彈跳板把自己發射出去——飛過頭撞牆、倒栽蔥掉進水桶。
// 發射時踢翻的線軸散成「糸」，撞牆震下來的屋頂、橫條、箱子疊成「合」，拼出「給」；半空中的星星被外星人的光束接進飛碟。
// 最後光束不小心把整個水桶也吸起來又放下。給、給、給你
const clip: Clip = {
  char: '給',
  meta: { theme: '送星星給外星人', cast: '太空人玩偶＋小外星人飛碟＋彈跳板', gags: ['一走路就飄起來', '發射飛過頭撞牆倒栽蔥', '光束吸錯把水桶吸起來'] },
  duration: 10,
  bg: { top: '#D9F5EA', bottom: '#F2FBF6', floor: '#F6EBD4', scenery: 'hills' },
  actors: [
    { id: 'pad', emoji: '🛹', x: 20, y: 73, size: 11 },
    { id: 'spool', emoji: '🧵', x: 28, y: 71, size: 7 },
    { id: 'wall', emoji: '🧱', x: 153, y: 71, size: 14 },
    { id: 'crate', emoji: '📦', x: 153, y: 59, size: 8 },
    { id: 'roof', emoji: '⛺', x: 153, y: 52, size: 8 },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 136, y: 30, size: 16, float: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 34, y: 71, size: 14, flip: true },
    { id: 'star', emoji: '⭐', x: 38, y: 68, size: 6, hidden: true },
    { id: 'bucket', emoji: '🪣', x: 136, y: 71, size: 12 },
  ],
  moves: [
    { at: 0.3, actor: 'star', do: 'pop', dur: 0.3 },
    { at: 0.7, actor: 'star', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0, actor: 'alien', do: 'bounce', amount: 2, times: 3, dur: 1.5 },
    ...ride([
      // 走兩步……靴子就飄起來，在空中划水
      { at: 1.1, actor: 'astro', do: 'moveTo', to: { x: 44, y: 71 }, dur: 0.4 },
      { at: 1.5, actor: 'astro', do: 'moveTo', to: { x: 46, y: 54 }, dur: 0.5, ease: 'out' },
      { at: 2.0, actor: 'astro', do: 'shake', amount: 1.5, dur: 0.5 },
      // 噗通掉回彈跳板上
      { at: 2.5, actor: 'astro', do: 'moveTo', to: { x: 20, y: 66 }, dur: 0.35, arc: 4, ease: 'in' },
    ], 'star', -3, 14),
    { at: 1.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 2.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 2.85, actor: 'astro', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 2.85, actor: 'pad', do: 'squash', amount: 0.3, dur: 0.2 },
    // 蹲下蓄力——彈！一大道弧線飛過整個畫面
    { at: 3.2, actor: 'astro', do: 'squash', amount: 0.4, dur: 0.45 },
    { at: 3.2, actor: 'pad', do: 'squash', amount: 0.45, dur: 0.45 },
    { at: 3.65, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 3.65, actor: 'astro', do: 'moveTo', to: { x: 143, y: 62 }, arc: 46, dur: 0.95, ease: 'linear' },
    { at: 3.65, actor: 'star', do: 'moveTo', to: { x: 78, y: 16 }, arc: 10, dur: 0.5, ease: 'out' },
    { at: 4.15, actor: 'star', do: 'moveTo', to: { x: 118, y: 14 }, dur: 0.6, ease: 'out' },
    { at: 4.8, actor: 'star', do: 'bounce', amount: 1.5, times: 3, dur: 1.2 },
    // 踢翻的線軸飛起來
    { at: 3.65, actor: 'spool', do: 'moveTo', to: { x: 44, y: 48 }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 3.75, actor: 'spool', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.6, actor: 'spool', do: 'vanish', dur: 0.2 },
    // 砰！撞牆，彈回來翻個身，倒栽蔥掉進水桶
    { at: 4.6, actor: 'astro', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 4.6, actor: 'wall', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 4.85, actor: 'astro', do: 'moveTo', to: { x: 136, y: 52 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 4.85, actor: 'astro', do: 'rotateTo', amount: 180, dur: 0.45 },
    { at: 5.3, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.4, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 5.5, actor: 'astro', do: 'shake', amount: 1, dur: 0.6 },
    // 牆上那一疊被震下來
    { at: 4.75, actor: 'roof', do: 'hop', amount: 6, dur: 0.3 },
    { at: 4.8, actor: 'crate', do: 'hop', amount: 4, dur: 0.3 },
    { at: 5.15, actor: 'roof', do: 'vanish', dur: 0.2 },
    { at: 5.45, actor: 'crate', do: 'vanish', dur: 0.2 },
    // 外星人的光束把星星接進飛碟
    { at: 6.6, actor: 'star', do: 'moveTo', to: { x: 136, y: 28 }, dur: 0.7, ease: 'inOut' },
    { at: 7.3, actor: 'star', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    { at: 7.35, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.35, actor: 'alien', do: 'bounce', amount: 3, times: 2, dur: 0.7 },
    { at: 7.35, actor: 'star', do: 'bounce', amount: 3, times: 2, dur: 0.7 },
    { at: 7.9, actor: 'astro', do: 'shake', amount: 0.8, dur: 0.5 },
    // 回馬槍：光束又來一次……吸錯，把整個水桶連人吸起來又放下
    { at: 8.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    { at: 8.4, actor: 'bucket', do: 'hop', amount: 7, dur: 0.8 },
    { at: 8.4, actor: 'astro', do: 'hop', amount: 7, dur: 0.8 },
    { at: 9.2, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.2 },
  ],
  builds: [
    // 線軸的線在空中散開 → 糸；牆上震下來的屋頂、橫條、箱子 → 合
    { at: 3.9, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'spool', color: '#E8461E' },
    { at: 5.0, dur: 0.35, strokes: [6, 7], from: 'roof', color: '#D9480F' },
    { at: 5.3, dur: 0.55, strokes: [8, 9, 10, 11], from: 'crate', color: '#D9480F' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'astro', emoji: '👽', dur: 0.9 },
    { at: 1.6, kind: 'pop', actor: 'astro', emoji: '😲', dur: 0.5 },
    { at: 2.0, kind: 'sweat', actor: 'astro' },
    { at: 2.9, kind: 'pop', actor: 'astro', emoji: '💡', dur: 0.5 },
    { at: 3.65, kind: 'puff', actor: 'pad', dur: 0.5 },
    { at: 4.6, kind: 'burst', actor: 'wall', n: 1, dur: 0.4, dx: -6 },
    { at: 5.5, kind: 'burst', actor: 'bucket', emoji: '⭐', n: 5, dur: 0.5 },
    { at: 6.5, dur: 0.9, kind: 'beam', actor: 'alien', n: 8 },
    { at: 7.4, kind: 'pop', actor: 'alien', emoji: '💕', dur: 0.7, dx: -10 },
    { at: 7.9, kind: 'pop', actor: 'bucket', emoji: '👍', dur: 0.7, dx: -12, dy: 4 },
    { at: 8.3, dur: 0.9, kind: 'beam', actor: 'alien', n: 12 },
    { at: 8.6, kind: 'pop', actor: 'alien', emoji: '😅', dur: 0.6, dx: -10 },
  ],
  camera: [
    // 飛起來那一下跟拍，撞牆前退回全景
    { at: 3.65, dur: 0.3, do: 'follow', actor: 'astro', amount: 1.3 },
    { at: 4.3, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.6, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.75, say: '給' },
    { at: 1.5, sfx: 'whoosh' },
    { at: 2.85, sfx: 'plop' },
    { at: 3.65, sfx: 'boing' },
    { at: 4.6, sfx: 'bonk' },
    { at: 5.3, sfx: 'clink' },
    { at: 6.0, say: '給' },
    { at: 6.6, sfx: 'laser' },
    { at: 7.35, say: '給你' },
    { at: 8.4, sfx: 'laser' },
    { at: 9.2, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
