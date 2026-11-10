import type { Clip } from '../clip'

// 猴（重做）：豬探長發現椰子樹上垂下一條猴子尾巴，跳起來抓不到；助跑飛撲抓住了，樹被他拉彎又彈回去，把他甩飛——
// 香蕉飛上天落成「犭」，椰子砸到他頭上彈到中間裂成「侯」。國字讓位，小猴子從樹上翻筋斗跳到中間（猴子）。
// 回馬槍：他又去抓尾巴，小猴子一跳回樹上，樹被拉得更彎，把他甩得轉好幾圈、香蕉雨淋了一身。猴、猴、猴子
const P = 67.8 // 豬探長（size 22）站在地上的 y
const M = 68.6 // 小猴子（size 20）
const TX = -10 // 尾巴在小猴子左後方（小猴子朝右）
const TY = -1

// 3D 版的椰子切面是灰紫色、外殼偏粉紅，看起來像泡泡；染成咖啡色才認得出是椰子
const COCO = 'sepia(1) saturate(1.1) brightness(.68) contrast(1.3)'

const clip: Clip = {
  char: '猴',
  meta: { theme: '抓樹上的猴子尾巴', cast: '豬探長＋小猴子＋猴子尾巴＋椰子樹＋香蕉＋椰子', gags: ['跳起來尾巴剛好縮上去', '拉彎椰子樹被彈飛', '椰子砸頭', '猴子翻筋斗落地', '再拉一次樹更彎甩更遠香蕉雨'] },
  duration: 10,
  bg: { top: '#DDF0D0', bottom: '#F6FBEF', floor: '#D8C28E', scenery: 'forest' },
  actors: [
    { id: 'monkey', emoji: '🐒', x: 138, y: 50, size: 20, flip: true, pivot: 'center' },
    { id: 'coco2', emoji: '🥥', tint: COCO, x: 128, y: 48, size: 10, float: true, pivot: 'center' },
    { id: 'coco3', emoji: '🥥', tint: COCO, x: 142, y: 48, size: 10, float: true, pivot: 'center' },
    { id: 'tree', emoji: '🌴', x: 134, y: 60.5, size: 40 },
    { id: 'tail', emoji: '➰', x: 120, y: 57, size: 12, float: true, tint: 'sepia(1) saturate(3) brightness(.6)' },
    { id: 'ban1', emoji: '🍌', x: 126, y: 46, size: 8, float: true, pivot: 'center' },
    { id: 'ban2', emoji: '🍌', x: 132, y: 42, size: 8, float: true, pivot: 'center' },
    { id: 'ban3', emoji: '🍌', x: 120, y: 44, size: 8, float: true, pivot: 'center' },
    { id: 'coco', emoji: '🥥', tint: COCO, x: 138, y: 46, size: 10, float: true, pivot: 'center' },
    { id: 'pig', emoji: 'hero:pig/think', x: 40, y: P, size: 22, flip: true, hidden: true },
  ],
  moves: [
    // 豬探長拿放大鏡走進來，尾巴在樹下晃
    { at: 0, actor: 'pig', do: 'enter', from: { x: -20, y: P }, dur: 0.6, ease: 'out' },
    { at: 0.2, actor: 'tail', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 0.9, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 第一次：走到樹下跳起來抓——尾巴咻地縮上去
    { at: 1.3, actor: 'pig', do: 'moveTo', to: { x: 106, y: P }, dur: 0.45, ease: 'inOut' },
    { at: 1.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 1.8, actor: 'pig', do: 'hop', amount: 9, dur: 0.4 },
    { at: 1.85, actor: 'tail', do: 'moveTo', to: { x: 120, y: 38 }, dur: 0.12, ease: 'out' },
    { at: 2.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 尾巴又垂下來晃，氣死人
    { at: 2.45, actor: 'tail', do: 'moveTo', to: { x: 120, y: 57 }, dur: 0.2, ease: 'bounce' },
    { at: 2.65, actor: 'tail', do: 'shake', amount: 1.5, dur: 0.4 },
    // 第二次：退後助跑、蹲——飛撲抓住！
    { at: 2.55, actor: 'pig', do: 'moveTo', to: { x: 78, y: P }, dur: 0.4, ease: 'inOut' },
    { at: 2.95, actor: 'pig', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 3.25, actor: 'pig', do: 'moveTo', to: { x: 114, y: 56 }, arc: 10, dur: 0.3, anticipate: 4, ease: 'in' },
    { at: 3.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    // 樹被他拉彎
    { at: 3.55, actor: 'tree', do: 'rotateTo', amount: -18, dur: 0.35, ease: 'out' },
    { at: 3.55, actor: 'pig', do: 'moveTo', to: { x: 108, y: 58 }, dur: 0.35, ease: 'out' },
    { at: 3.55, actor: 'tail', do: 'moveTo', to: { x: 112, y: 52 }, dur: 0.35, ease: 'out' },
    // 彈回去！豬探長被甩飛，香蕉也飛上天
    { at: 3.95, actor: 'tree', do: 'rotateTo', amount: 18, dur: 0.7, ease: 'elastic' },
    { at: 3.95, actor: 'tail', do: 'moveTo', to: { x: 120, y: 57 }, dur: 0.5, ease: 'elastic' },
    { at: 3.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.95, actor: 'pig', do: 'moveTo', to: { x: 34, y: P }, arc: 26, dur: 0.6, ease: 'out' },
    { at: 3.95, actor: 'pig', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
    { at: 3.95, actor: 'ban1', do: 'moveTo', to: { x: 58, y: 14 }, dur: 0.35, ease: 'out' },
    { at: 3.95, actor: 'ban2', do: 'moveTo', to: { x: 66, y: 8 }, dur: 0.35, ease: 'out' },
    { at: 3.95, actor: 'ban3', do: 'moveTo', to: { x: 54, y: 24 }, dur: 0.35, ease: 'out' },
    ...['ban1', 'ban2', 'ban3'].map((actor, i) => ({ at: 3.95, actor, do: 'spin' as const, times: i % 2 ? -2 : 2, dur: 0.4 })),
    ...['ban1', 'ban2', 'ban3'].map((actor) => ({ at: 4.3, actor, do: 'vanish' as const, dur: 0.15 })),
    { at: 4.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 樹還在晃，椰子掉下來飛過去砸到他頭上
    { at: 4.5, actor: 'coco', do: 'moveTo', to: { x: 36, y: 49 }, arc: 16, dur: 0.4, ease: 'in' },
    { at: 4.5, actor: 'coco', do: 'rotateTo', amount: -540, dur: 0.4, ease: 'in' },
    { at: 4.9, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.35 },
    { at: 4.9, actor: 'coco', do: 'moveTo', to: { x: 80, y: 40 }, arc: 14, dur: 0.4, ease: 'out' },
    { at: 4.9, actor: 'coco', do: 'rotateTo', amount: 540, dur: 0.4, ease: 'out' },
    { at: 5.3, actor: 'coco', do: 'scaleTo', amount: 1.5, dur: 0.1, ease: 'out' },
    { at: 5.4, actor: 'coco', do: 'vanish', dur: 0.08 },
    // 揉揉頭，抬頭看——樹上有人在笑
    { at: 6.0, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: 6.2, actor: 'monkey', do: 'moveTo', to: { x: 136, y: 42 }, dur: 0.25, ease: 'back' },
    { at: 6.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 6.45, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 國字讓位：小猴子翻筋斗跳到中間
    { at: 6.85, actor: 'monkey', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 7.05, actor: 'monkey', do: 'moveTo', to: { x: 82, y: M }, arc: 22, dur: 0.5, ease: 'inOut' },
    { at: 7.05, actor: 'monkey', do: 'spin', times: 1, dur: 0.5 },
    { at: 7.05, actor: 'tail', do: 'moveTo', to: { x: 82 + TX, y: M + TY }, arc: 22, dur: 0.5, ease: 'inOut' },
    { at: 7.55, actor: 'monkey', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.55, actor: 'tail', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 7.6, actor: 'pig', do: 'hop', amount: 5, dur: 0.3 },
    // 回馬槍：豬探長偷偷靠過去抓尾巴
    { at: 7.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 7.85, actor: 'pig', do: 'moveTo', to: { x: 58, y: P }, dur: 0.3, ease: 'in' },
    { at: 8.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 8.15, actor: 'tail', do: 'shake', amount: 1.2, dur: 0.2 },
    // 小猴子一跳回樹上，連他一起拖上去
    { at: 8.3, actor: 'monkey', do: 'moveTo', to: { x: 136, y: 42 }, arc: 12, dur: 0.3, ease: 'out' },
    { at: 8.3, actor: 'tail', do: 'moveTo', to: { x: 124, y: 49 }, arc: 12, dur: 0.3, ease: 'out' },
    { at: 8.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.3, actor: 'pig', do: 'moveTo', to: { x: 110, y: 54 }, arc: 10, dur: 0.3, ease: 'out' },
    // 樹彎得比剛剛更低
    { at: 8.6, actor: 'tree', do: 'rotateTo', amount: -30, dur: 0.2, ease: 'out' },
    { at: 8.6, actor: 'pig', do: 'moveTo', to: { x: 98, y: 64 }, dur: 0.2, ease: 'out' },
    { at: 8.6, actor: 'tail', do: 'moveTo', to: { x: 106, y: 54 }, dur: 0.2, ease: 'out' },
    // 彈！甩得轉三圈
    { at: 8.8, actor: 'tree', do: 'rotateTo', amount: 30, dur: 0.8, ease: 'elastic' },
    { at: 8.8, actor: 'tail', do: 'moveTo', to: { x: 124, y: 49 }, dur: 0.5, ease: 'elastic' },
    { at: 8.8, actor: 'pig', do: 'moveTo', to: { x: 26, y: P }, arc: 16, dur: 0.45, ease: 'out' },
    { at: 8.8, actor: 'pig', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: 9.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 樹上的椰子全被甩下來，一顆一顆疊在他頭上
    { at: 8.85, actor: 'coco2', do: 'moveTo', to: { x: 27, y: P - 13 }, arc: 20, dur: 0.5, ease: 'in' },
    { at: 8.85, actor: 'coco2', do: 'rotateTo', amount: -720, dur: 0.5, ease: 'in' },
    { at: 9.0, actor: 'coco3', do: 'moveTo', to: { x: 26, y: P - 21 }, arc: 24, dur: 0.5, ease: 'in' },
    { at: 9.0, actor: 'coco3', do: 'rotateTo', amount: -720, dur: 0.5, ease: 'in' },
    { at: 9.35, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.5, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 9.45, actor: 'monkey', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 飛上天的香蕉落成「犭」；砸頭的椰子裂開變成「侯」
    { at: 4.3, dur: 0.55, strokes: [0, 1, 2], from: 'ban2', color: '#F08C00' },
    { at: 5.4, dur: 0.55, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: 'coco', color: '#8B5A2B' },
  ],
  glyph: [
    { at: 5.95, dur: 0.4, do: 'wobble' },
    { at: 6.8, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'pig', emoji: '🔍', dur: 0.6 },
    { at: 0.95, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.45 },
    { at: 2.1, kind: 'sweat', actor: 'pig' },
    { at: 2.3, kind: 'pop', actor: 'pig', emoji: '😑', dur: 0.4 },
    { at: 2.95, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 3.95, kind: 'burst', actor: 'tree', emoji: '🍃', n: 6, dy: 18, dur: 0.5 },
    { at: 4.5, kind: 'dizzy', actor: 'pig', dur: 0.4 },
    { at: 4.9, kind: 'burst', actor: 'pig', n: 1, dy: 2, dur: 0.35 },
    { at: 5.4, kind: 'burst', x: 80, y: 40, emoji: '✨', n: 8, dur: 0.5 },
    { at: 5.5, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    { at: 6.25, kind: 'pop', actor: 'monkey', emoji: '😆', dx: 10, dy: 4, dur: 0.5 },
    { at: 6.5, kind: 'pop', actor: 'pig', emoji: '❗', dx: -6, dur: 0.4 },
    { at: 7.55, kind: 'burst', actor: 'monkey', emoji: '⭐', n: 6, dur: 0.6 },
    { at: 7.65, kind: 'pop', actor: 'pig', emoji: '😲', dx: -8, dy: 4, dur: 0.4 },
    { at: 8.1, kind: 'pop', actor: 'monkey', emoji: '😏', dx: 12, dy: 6, dur: 0.4 },
    { at: 8.8, kind: 'burst', actor: 'tree', emoji: '🍃', n: 8, dy: 18, dur: 0.5 },
    { at: 9.35, kind: 'burst', actor: 'pig', n: 1, dx: 6, dy: 4, dur: 0.25 },
    { at: 9.5, kind: 'burst', actor: 'pig', n: 1, dx: 8, dy: -4, dur: 0.3 },
    { at: 9.6, kind: 'dizzy', actor: 'pig', dy: -12, dur: 0.4 },
    { at: 9.5, kind: 'pop', actor: 'monkey', emoji: '😆', dx: 12, dy: 6, dur: 0.5 },
  ],
  camera: [
    { at: 3.55, dur: 0.25, do: 'shake', amount: 0.8 },
    { at: 4.9, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: 5.4, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    // 椰子裂開：白光一閃
    { at: 5.4, dur: 0.04, level: -0.5 },
    { at: 5.44, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.9, say: '猴' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 3.25, sfx: 'whoosh' },
    { at: 3.55, sfx: 'slide' },
    { at: 3.95, sfx: 'boing' },
    { at: 4.9, sfx: 'bonk' },
    { at: 5.4, sfx: 'crack' },
    { at: 5.95, say: '猴' },
    { at: 7.55, say: '猴子' },
    { at: 8.3, sfx: 'whoosh' },
    { at: 8.8, sfx: 'boing' },
    { at: 9.35, sfx: 'bonk' },
    { at: 9.5, sfx: 'bonk' },
    { at: 9.7, sfx: 'cheer' },
  ],
}

export default clip
