import type { Clip, Move } from '../clip'

// 虎（太空人推骨牌）：太空人玩偶想推倒第一塊橘色骨牌，手指一伸——人卻飄起來，頭盔撞到吊燈；掉下來屁股坐在第一塊上，
// 骨牌一塊接一塊越倒越快，他坐在上面一路被送到尾巴，每倒一塊就變成一筆「虎」。最後一塊壓到翹翹板把他彈上天，小老虎從後面冒出來。
// 回馬槍：他得意扭一扭，又飄起來了，小老虎跳起來抓住他的靴子拉回地上。虎、虎、老虎
const XS = [38, 52, 66, 80, 94, 108, 122]
const FALL = [3.0, 3.25, 3.47, 3.66, 3.83, 3.98, 4.11]
const DOMINO_Y = 73.6

const clip: Clip = {
  char: '虎',
  meta: { theme: '太空人推骨牌', cast: '太空人玩偶＋骨牌＋翹翹板＋小老虎', gags: ['一伸手就飄起來撞燈', '屁股坐倒骨牌越倒越快', '翹翹板彈上天'] },
  duration: 10,
  bg: { top: '#FFF6E6', bottom: '#FCEED6', floor: '#E9DCC4', scenery: 'room' },
  actors: [
    { id: 'lamp', emoji: '💡', x: 28, y: 6, size: 8, float: true },
    ...XS.map((x, i) => ({ id: `d${i + 1}`, emoji: '🟧', x, y: DOMINO_Y, size: 8 })),
    { id: 'saw', emoji: '🛹', x: 134, y: 75, size: 10, float: true },
    { id: 'cub', emoji: '🐯', x: 126, y: 72.4, size: 11, hidden: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 24, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'astro', do: 'enter', from: { x: -14, y: 71.1 }, dur: 0.7 },
    { at: 0, actor: 'astro', do: 'bounce', amount: 2.5, times: 3, dur: 0.7 },
    { at: 0.8, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    // 骨牌們緊張地晃一下
    ...XS.map((_, i): Move => ({ at: 1.0 + i * 0.05, actor: `d${i + 1}`, do: 'tilt', amount: 6, dur: 0.3 })),
    // 伸手一戳——人飄起來了，頭盔撞吊燈
    { at: 1.5, actor: 'astro', do: 'squash', amount: -0.15, dur: 0.25 },
    { at: 1.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 1.6, actor: 'astro', do: 'moveTo', to: { x: 28, y: 18 }, dur: 0.6, ease: 'out' },
    { at: 2.2, actor: 'lamp', do: 'tilt', amount: 30, dur: 0.6 },
    { at: 2.2, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 2.25, actor: 'astro', do: 'spin', dur: 0.4 },
    // 掉下來，屁股坐在第一塊上
    { at: 2.65, actor: 'astro', do: 'moveTo', to: { x: 38, y: 64 }, dur: 0.35, ease: 'in' },
    { at: 3.0, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 3.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    // 骨牌越倒越快，他坐在上面一路被送過去
    ...XS.flatMap((x, i): Move[] => [
      { at: FALL[i], actor: `d${i + 1}`, do: 'rotateTo', amount: 85, dur: 0.18, ease: 'in' },
      { at: FALL[i] + 0.2, actor: `d${i + 1}`, do: 'vanish', dur: 0.15 },
    ]),
    { at: 3.1, actor: 'astro', do: 'moveTo', to: { x: 128, y: 66 }, dur: 1.1, ease: 'in' },
    { at: 3.1, actor: 'astro', do: 'bounce', amount: 2, times: 6, dur: 1.1 },
    // 最後一塊壓到翹翹板——把他彈上天
    { at: 4.2, actor: 'saw', do: 'tilt', amount: -25, dur: 0.3 },
    { at: 4.25, actor: 'astro', do: 'moveTo', to: { x: 145, y: 71.1 }, arc: 42, dur: 0.9 },
    { at: 4.25, actor: 'astro', do: 'spin', times: 2, dur: 0.8 },
    { at: 5.15, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.15, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/salute' },
    // 小老虎從最後一塊後面冒出來，打個呵欠，拍拍他的頭盔
    { at: 5.85, actor: 'cub', do: 'pop', dur: 0.35 },
    { at: 6.5, actor: 'cub', do: 'moveTo', to: { x: 134, y: 72.4 }, dur: 0.3 },
    { at: 6.85, actor: 'cub', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.9, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 7.2, actor: 'astro', do: 'tilt', amount: 10, dur: 0.6 },
    // 回馬槍：扭一扭……又飄起來了，小老虎跳起來抓住靴子拉下來
    { at: 7.9, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 7.9, actor: 'astro', do: 'moveTo', to: { x: 145, y: 46 }, dur: 0.8, ease: 'out' },
    { at: 8.5, actor: 'cub', do: 'swap', emoji: '🐯' },
    { at: 8.5, actor: 'cub', do: 'moveTo', to: { x: 142, y: 56 }, dur: 0.25, ease: 'out' },
    { at: 8.75, actor: 'cub', do: 'moveTo', to: { x: 140, y: 72.4 }, dur: 0.3, ease: 'in' },
    { at: 8.75, actor: 'astro', do: 'moveTo', to: { x: 146, y: 71.1 }, dur: 0.3, ease: 'in' },
    { at: 9.05, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.05, actor: 'cub', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.3, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
  ],
  builds: [
    // 每倒一塊骨牌就變成一筆
    { at: FALL[0], dur: 0.35, strokes: [0], from: 'd1', color: '#F76707' },
    { at: FALL[1], dur: 0.35, strokes: [1], from: 'd2', color: '#F76707' },
    { at: FALL[2], dur: 0.3, strokes: [2], from: 'd3', color: '#F76707' },
    { at: FALL[3], dur: 0.3, strokes: [3], from: 'd4', color: '#E8590C' },
    { at: FALL[4], dur: 0.35, strokes: [4, 5], from: 'd5', color: '#F76707' },
    { at: FALL[5], dur: 0.3, strokes: [6], from: 'd6', color: '#E8590C' },
    { at: FALL[6], dur: 0.3, strokes: [7], from: 'd7', color: '#E8590C' },
  ],
  glyph: [{ at: 4.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'astro', emoji: '👉', dur: 0.6 },
    { at: 1.7, kind: 'pop', actor: 'astro', emoji: '❓', dur: 0.5 },
    { at: 2.2, kind: 'burst', actor: 'lamp', emoji: '💥', dy: 10, dur: 0.4 },
    { at: 2.3, kind: 'dizzy', actor: 'astro', dur: 0.8 },
    { at: 3.05, kind: 'puff', actor: 'd1', dur: 0.4 },
    { at: 4.2, kind: 'burst', actor: 'saw', emoji: '💥', dur: 0.35 },
    { at: 5.2, kind: 'pop', actor: 'astro', emoji: '👍', dx: -14, dur: 0.7 },
    { at: 6.0, kind: 'pop', actor: 'cub', emoji: '🥱', dx: -14, dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'astro', emoji: '😅', dx: -14, dur: 0.5 },
    { at: 9.05, kind: 'puff', actor: 'astro', dur: 0.4 },
  ],
  camera: [
    // 骨牌連鎖跟拍太空人，翹翹板之前退回全景
    { at: 3.1, dur: 0.3, do: 'follow', actor: 'astro', amount: 1.25 },
    { at: 3.9, dur: 0.45, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.0, say: '虎' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.2, sfx: 'boing' },
    { at: 3.0, sfx: 'plop' },
    { at: 3.1, sfx: 'tap' },
    { at: 4.2, sfx: 'boing' },
    { at: 4.55, say: '虎' },
    { at: 5.15, sfx: 'plop' },
    { at: 5.9, say: '老虎' },
    { at: 7.9, sfx: 'whoosh' },
    { at: 9.05, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
