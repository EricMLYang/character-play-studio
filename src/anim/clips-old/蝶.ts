import type { Clip, Move } from '../clip'

// 蝶（重做）：機器人踮腳偷抓花盆上的蝴蝶，一撲——蝴蝶飛起來，他臉撞花盆；開噴射飛過去，蝴蝶閃開，他一屁股砸在打瞌睡的賽車頂上。
// 賽車嚇醒載著他衝出去撞飛花盆，花盆炸成「枼」、他被甩下車震掉的螺絲變成「虫」。國字讓到上方，他在中間一動也不動，蝴蝶停在他頭上（蝴蝶）；回馬槍：想抓頭上的蝴蝶，兩手拍扁自己的頭。蝶、蝶、蝴蝶
const G = 67.8 // 機器人（size 22）站在地上的 y
const C = 66.9 // 賽車（size 24）
const R = 58 // 機器人坐在賽車頂上的 y
const H = -16 // 蝴蝶停在機器人頭上（相對他的 y）

// 蝴蝶停著時翅膀一直搧：小小地上下飄、左右歪
const flutter = (from: number, to: number): Move[] => {
  const ms: Move[] = []
  for (let at = from, i = 0; at < to - 0.1; at += 0.3, i++) {
    ms.push({ at, actor: 'bfly', do: 'hop', amount: 1.6, dur: 0.3 })
    ms.push({ at, actor: 'bfly', do: 'tilt', amount: i % 2 ? -12 : 12, dur: 0.3 })
  }
  return ms
}

const clip: Clip = {
  char: '蝶',
  meta: { theme: '機器人抓蝴蝶', cast: '機器人＋酷炫車子＋蝴蝶＋花盆＋螺絲', gags: ['一撲蝴蝶飛走臉撞花盆', '開噴射飛過頭砸在睡覺的賽車上', '賽車載著他撞飛花盆', '一動也不動蝴蝶自己停上來', '拍頭上的蝴蝶拍扁自己'] },
  duration: 10,
  bg: { top: '#D9F2E6', bottom: '#F4FBEF', floor: '#C9E3A8', scenery: 'forest' },
  actors: [
    { id: 'pot', emoji: '🪴', x: 100, y: 68.6, size: 20, pivot: 'center' },
    { id: 'car', emoji: 'hero:car/idle', x: 138, y: C, size: 24 },
    { id: 'bolt1', emoji: '🔩', x: 30, y: 60, size: 7, hidden: true, float: true, pivot: 'center' },
    { id: 'bolt2', emoji: '🔩', x: 30, y: 60, size: 7, hidden: true, float: true, pivot: 'center' },
    { id: 'robot', emoji: 'hero:robot/idle', x: 30, y: G, size: 22, hidden: true, flip: true },
    { id: 'bfly', emoji: '🦋', x: 100, y: 55, size: 11, float: true },
  ],
  moves: [
    ...flutter(0, 2.4),
    // 機器人走進來，看到花盆上的蝴蝶
    { at: 0, actor: 'robot', do: 'enter', from: { x: -20, y: G }, dur: 0.55, ease: 'out' },
    { at: 0.65, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 0.65, actor: 'robot', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    // 踮腳偷偷走過去
    { at: 1.45, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 1.45, actor: 'robot', do: 'moveTo', to: { x: 72, y: G }, dur: 0.75, ease: 'linear' },
    ...[1.45, 1.64, 1.83, 2.02].map((at) => ({ at, actor: 'robot', do: 'hop' as const, amount: 1.5, dur: 0.19 })),
    // 蓄力一撲——蝴蝶飛起來，臉撞花盆
    { at: 2.25, actor: 'robot', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 2.42, actor: 'bfly', do: 'moveTo', to: { x: 96, y: 34 }, dur: 0.35, ease: 'out' },
    { at: 2.5, actor: 'robot', do: 'moveTo', to: { x: 86, y: G }, dur: 0.13, ease: 'in' },
    { at: 2.5, actor: 'robot', do: 'tilt', amount: 18, dur: 0.25 },
    { at: 2.63, actor: 'pot', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 2.63, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 2.63, actor: 'robot', do: 'moveTo', to: { x: 72, y: G }, dur: 0.3, ease: 'out' },
    { at: 2.63, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.3 },
    ...flutter(2.8, 3.1),
    // 蝴蝶慢慢飄到賽車頂上
    { at: 3.05, actor: 'bfly', do: 'moveTo', to: { x: 138, y: 52 }, arc: 6, dur: 0.6, ease: 'inOut' },
    ...flutter(3.65, 3.95),
    // 第二次：開噴射飛過去
    { at: 3.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 3.35, actor: 'robot', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 3.7, actor: 'robot', do: 'moveTo', to: { x: 138, y: R }, arc: 24, dur: 0.45, anticipate: 4, ease: 'in' },
    // 蝴蝶一閃——他一屁股砸在賽車頂上
    { at: 3.95, actor: 'bfly', do: 'moveTo', to: { x: 116, y: 38 }, dur: 0.3, ease: 'out' },
    { at: 4.15, actor: 'car', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.15, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 4.2, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 4.2, actor: 'bfly', do: 'moveTo', to: { x: 22, y: 30 }, arc: 8, dur: 0.9, ease: 'inOut' },
    // 賽車嚇醒，載著他衝出去
    { at: 4.45, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 4.45, actor: 'car', do: 'shake', amount: 1, dur: 0.2 },
    { at: 4.45, actor: 'robot', do: 'shake', amount: 1, dur: 0.2 },
    { at: 4.65, actor: 'car', do: 'moveTo', to: { x: 111, y: C }, dur: 0.2, ease: 'in' },
    { at: 4.65, actor: 'robot', do: 'moveTo', to: { x: 111, y: R }, dur: 0.2, ease: 'in' },
    // 撞飛花盆！
    { at: 4.85, actor: 'pot', do: 'moveTo', to: { x: 80, y: 30 }, dur: 0.35, ease: 'out' },
    { at: 4.85, actor: 'pot', do: 'spin', times: -2, dur: 0.35 },
    { at: 4.85, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 4.85, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.85, actor: 'car', do: 'moveTo', to: { x: 136, y: C }, dur: 0.4, ease: 'out' },
    { at: 5.2, actor: 'pot', do: 'vanish', dur: 0.12 },
    // 機器人被甩下車，翻一圈摔在左邊，螺絲震出來
    { at: 4.85, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    { at: 4.85, actor: 'robot', do: 'moveTo', to: { x: 30, y: G }, arc: 22, dur: 0.55, ease: 'out' },
    { at: 4.85, actor: 'robot', do: 'spin', times: -1, dur: 0.55, pivot: 'center' },
    { at: 5.4, actor: 'bolt1', do: 'pop' },
    { at: 5.4, actor: 'bolt1', do: 'moveTo', to: { x: 22, y: 40 }, dur: 0.3, ease: 'out' },
    { at: 5.4, actor: 'bolt1', do: 'spin', times: 2, dur: 0.3 },
    { at: 5.4, actor: 'bolt2', do: 'pop' },
    { at: 5.4, actor: 'bolt2', do: 'moveTo', to: { x: 40, y: 44 }, dur: 0.3, ease: 'out' },
    { at: 5.4, actor: 'bolt2', do: 'spin', times: -2, dur: 0.3 },
    { at: 5.7, actor: 'bolt1', do: 'vanish', dur: 0.12 },
    { at: 5.7, actor: 'bolt2', do: 'vanish', dur: 0.12 },
    ...flutter(5.1, 7.2),
    { at: 6.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 6.4, actor: 'robot', do: 'shake', amount: 1, dur: 0.35 },
    { at: 6.6, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    // 國字讓位：他走到中間，一動也不動……蝴蝶自己飛下來停在他頭上
    { at: 6.95, actor: 'robot', do: 'moveTo', to: { x: 78, y: G }, dur: 0.55, ease: 'inOut' },
    { at: 6.95, actor: 'car', do: 'moveTo', to: { x: 124, y: C }, dur: 0.5, ease: 'out' },
    { at: 7.2, actor: 'bfly', do: 'moveTo', to: { x: 78, y: G + H }, arc: 12, dur: 0.55, ease: 'inOut' },
    { at: 7.2, actor: 'bfly', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
    { at: 7.75, actor: 'bfly', do: 'scaleTo', amount: 1.25, dur: 0.25, ease: 'back' },
    { at: 7.75, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 7.8, actor: 'robot', do: 'hop', amount: 5, dur: 0.35 },
    { at: 7.8, actor: 'bfly', do: 'hop', amount: 5, dur: 0.35 },
    ...flutter(8.15, 8.45),
    // 回馬槍：想抓頭上的蝴蝶——蝴蝶一飛，兩手拍扁自己的頭
    { at: 8.2, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 8.25, actor: 'robot', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 8.45, actor: 'bfly', do: 'moveTo', to: { x: 42, y: 44 }, dur: 0.3, ease: 'out' },
    { at: 8.55, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 8.55, actor: 'robot', do: 'squash', amount: 0.65, dur: 0.55 },
    { at: 8.55, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 8.6, actor: 'car', do: 'shake', amount: 1.2, dur: 0.5 },
    ...flutter(8.7, 9.0),
    // 搖搖晃晃退到左邊，蝴蝶又停回他頭上
    { at: 8.95, actor: 'robot', do: 'moveTo', to: { x: 32, y: G }, dur: 0.4, ease: 'inOut' },
    { at: 8.95, actor: 'bfly', do: 'moveTo', to: { x: 32, y: G + H }, arc: 3, dur: 0.45, ease: 'inOut' },
    { at: 9.05, actor: 'car', do: 'moveTo', to: { x: 134, y: C }, dur: 0.4, ease: 'inOut' },
    ...flutter(9.5, 10),
  ],
  builds: [
    // 撞飛的花盆炸開，莖和葉子變成右邊的枼
    { at: 5.2, dur: 0.55, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14], from: 'pot', color: '#2F9E44' },
    // 機器人震掉的螺絲捲成左邊的虫
    { at: 5.7, dur: 0.45, strokes: [0, 1, 2, 3, 4, 5], from: 'bolt1', color: '#7048E8' },
  ],
  glyph: [
    { at: 6.2, dur: 0.4, do: 'wobble' },
    { at: 7.0, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0, dur: 4.1, kind: 'zzz', actor: 'car' },
    { at: 0.65, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.4 },
    { at: 1.05, kind: 'bubble', actor: 'robot', emoji: '🦋', dur: 0.6 },
    { at: 2.63, kind: 'burst', x: 92, y: 60, n: 1, dur: 0.35 },
    { at: 2.95, kind: 'pop', actor: 'robot', emoji: '😑', dur: 0.45 },
    { at: 3.0, kind: 'sweat', actor: 'robot' },
    { at: 3.4, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 4.15, kind: 'burst', x: 124, y: 62, n: 1, dur: 0.35 },
    { at: 4.2, kind: 'pop', actor: 'car', emoji: '❗', dx: -18, dy: 6, dur: 0.4 },
    { at: 4.45, kind: 'puff', actor: 'car', dx: 12, dy: 14, dur: 0.4 },
    { at: 4.85, kind: 'burst', x: 104, y: 60, n: 1, dur: 0.35 },
    { at: 5.2, kind: 'burst', x: 80, y: 30, emoji: '🍃', n: 8, dur: 0.5 },
    { at: 5.4, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 5.45, kind: 'dizzy', actor: 'robot', dur: 0.95 },
    { at: 5.3, kind: 'dizzy', actor: 'car', dur: 1.2 },
    { at: 7.2, kind: 'sweat', actor: 'robot' },
    { at: 7.75, kind: 'burst', actor: 'robot', emoji: '✨', n: 8, dy: 6, dur: 0.6 },
    { at: 7.95, kind: 'pop', actor: 'car', emoji: '😍', dx: -4, dur: 0.5 },
    { at: 8.2, kind: 'pop', actor: 'robot', emoji: '👀', dx: -14, dy: 6, dur: 0.35 },
    { at: 8.55, kind: 'burst', actor: 'robot', n: 1, dy: 8, dur: 0.35 },
    { at: 8.6, kind: 'burst', actor: 'robot', emoji: '🔩', n: 6, dy: 8, dur: 0.55 },
    { at: 8.7, kind: 'pop', actor: 'car', emoji: '😆', dx: 4, dur: 0.5 },
    { at: 8.75, kind: 'dizzy', actor: 'robot', dur: 0.5 },
  ],
  camera: [
    { at: 4.15, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 5.2, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 8.55, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  lights: [
    // 花盆炸開：白光一閃
    { at: 5.2, dur: 0.04, level: -0.4 },
    { at: 5.24, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 1.1, say: '蝶' },
    { at: 2.5, sfx: 'whoosh' },
    { at: 2.63, sfx: 'bonk' },
    { at: 3.7, sfx: 'whoosh' },
    { at: 4.15, sfx: 'bonk' },
    { at: 4.45, sfx: 'rumble' },
    { at: 4.85, sfx: 'crack' },
    { at: 5.2, sfx: 'poof' },
    { at: 5.4, sfx: 'clink' },
    { at: 6.2, say: '蝶' },
    { at: 7.75, say: '蝴蝶' },
    { at: 8.55, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
