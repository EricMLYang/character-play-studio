import type { Clip } from '../clip'

// 蜂（重做）：大怪獸看小蜜蜂飛來飛去好羨慕，拍手臂跳一下——只離地一點點，蜜蜂還在他頭上翻筋斗笑他；退到最後面助跑起飛，
// 飛了一下就一頭撞進黃色積木塔，積木「碰」地炸成「蜂」，最上面那塊掉下來敲他的頭。國字讓到上方，小蜜蜂飛到中間停在他頭上，把整隻大怪獸提起來（蜜蜂）。
// 回馬槍：蜜蜂提到滿頭大汗一放手，怪獸從半空摔成扁扁一片，累壞的蜜蜂掉在他頭上睡著。蜂、蜂、蜜蜂
const G = 66.9 // 大怪獸（size 24）站在地上的 y
const TX = 134 // 積木塔的 x
const blk = (id: string, y: number) => ({ id, emoji: '🟨', x: TX, y, size: 8, pivot: 'center' as const, tint: 'saturate(1.4) hue-rotate(-8deg)' })

const clip: Clip = {
  char: '蜂',
  meta: { theme: '大怪獸想跟蜜蜂一樣飛', cast: '大怪獸＋小蜜蜂＋黃色積木塔', gags: ['拍手臂只跳離地一點點', '蜜蜂翻筋斗笑他', '助跑起飛一頭撞進積木塔', '小蜜蜂把大怪獸提起來', '蜜蜂累到放手摔成扁片'] },
  duration: 10,
  bg: { top: '#FFF4C2', bottom: '#FFFBEA', floor: '#CDEB9A', scenery: 'hills' },
  actors: [
    blk('k1', 73.6), blk('k2', 65.6), blk('k3', 57.6), blk('k4', 49.6), blk('k5', 41.6),
    { id: 'mon', emoji: 'hero:monster/idle', x: 36, y: G, size: 24, hidden: true, flip: true },
    { id: 'bee', emoji: '🐝', x: 96, y: 30, size: 9, float: true, pivot: 'center' },
  ],
  moves: [
    // 小蜜蜂飛來飛去，大怪獸走進來看得好羨慕
    { at: 0, actor: 'mon', do: 'enter', from: { x: -20, y: G }, dur: 0.55, ease: 'out' },
    { at: 0, actor: 'bee', do: 'moveTo', to: { x: 70, y: 38 }, arc: 6, dur: 0.5 },
    { at: 0.5, actor: 'bee', do: 'moveTo', to: { x: 92, y: 44 }, arc: -5, dur: 0.45 },
    { at: 0.65, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 0.65, actor: 'mon', do: 'hop', amount: 3, dur: 0.3 },
    // 蜜蜂嗡一下擦過他的鼻子
    { at: 0.95, actor: 'bee', do: 'flip' },
    { at: 0.95, actor: 'bee', do: 'moveTo', to: { x: 54, y: 52 }, dur: 0.3, ease: 'out' },
    { at: 1.25, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 1.3, actor: 'bee', do: 'flip' },
    { at: 1.3, actor: 'bee', do: 'moveTo', to: { x: 66, y: 38 }, arc: 4, dur: 0.35 },
    // 第一次：蹲下、拍手臂往上跳——只離地一點點
    { at: 1.6, actor: 'mon', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 1.85, actor: 'mon', do: 'hop', amount: 6, dur: 0.45 },
    { at: 1.85, actor: 'mon', do: 'shake', amount: 1.8, dur: 0.45 },
    { at: 2.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    // 蜜蜂在他頭上翻筋斗笑他
    { at: 2.4, actor: 'bee', do: 'moveTo', to: { x: 40, y: 42 }, arc: 6, dur: 0.4 },
    { at: 2.4, actor: 'bee', do: 'spin', times: 1, dur: 0.4 },
    // 第二次：退到最後面，助跑起飛
    { at: 2.75, actor: 'mon', do: 'moveTo', to: { x: 16, y: G }, dur: 0.4, ease: 'inOut' },
    { at: 3.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 3.2, actor: 'mon', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 3.2, actor: 'bee', do: 'moveTo', to: { x: 96, y: 26 }, arc: 5, dur: 0.5 },
    { at: 3.6, actor: 'mon', do: 'moveTo', to: { x: 66, y: G }, dur: 0.3, anticipate: 4, ease: 'in' },
    { at: 3.9, actor: 'mon', do: 'moveTo', to: { x: 104, y: 40 }, dur: 0.4, ease: 'out' },
    { at: 3.9, actor: 'mon', do: 'shake', amount: 2, dur: 0.4 },
    { at: 3.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    // 飛不住了，一頭栽進積木塔
    { at: 4.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 4.3, actor: 'mon', do: 'moveTo', to: { x: 124, y: 56 }, dur: 0.2, ease: 'in' },
    { at: 4.3, actor: 'bee', do: 'moveTo', to: { x: 26, y: 36 }, dur: 0.35, ease: 'out' },
    { at: 4.5, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 4.5, actor: 'mon', do: 'moveTo', to: { x: 140, y: G }, arc: 6, dur: 0.3, ease: 'out' },
    // 積木炸開：中間三塊變成筆畫，最下面那塊被撞飛，最上面那塊飛上天
    { at: 4.5, actor: 'k2', do: 'vanish', dur: 0.1 },
    { at: 4.5, actor: 'k3', do: 'vanish', dur: 0.1 },
    { at: 4.5, actor: 'k4', do: 'vanish', dur: 0.1 },
    { at: 4.5, actor: 'k1', do: 'moveTo', to: { x: 180, y: 60 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'k1', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.5, actor: 'k5', do: 'moveTo', to: { x: 124, y: 6 }, dur: 0.45, ease: 'out' },
    { at: 4.5, actor: 'k5', do: 'spin', times: 2, dur: 0.7 },
    // 最上面那塊掉下來，「咚」敲在他頭上
    { at: 5.0, actor: 'k5', do: 'moveTo', to: { x: 140, y: 56 }, dur: 0.25, ease: 'in' },
    { at: 5.25, actor: 'mon', do: 'squash', amount: 0.3, dur: 0.3 },
    // 甩甩頭，積木掉下去
    { at: 6.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 6.0, actor: 'mon', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 6.1, actor: 'k5', do: 'moveTo', to: { x: 146, y: 73.6 }, arc: 6, dur: 0.3 },
    { at: 6.1, actor: 'k5', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 5.95, actor: 'bee', do: 'spin', times: 1, dur: 0.4 },
    // 國字讓位，他垂頭喪氣走到中間
    { at: 6.5, actor: 'mon', do: 'flip' },
    { at: 6.55, actor: 'mon', do: 'moveTo', to: { x: 80, y: G }, dur: 0.6 },
    // 「蜜蜂」：小蜜蜂飛下來停在他頭上，變大一點、閃閃發亮
    { at: 6.8, actor: 'bee', do: 'moveTo', to: { x: 80, y: 49 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 7.25, actor: 'bee', do: 'scaleTo', amount: 1.5, dur: 0.25, ease: 'back' },
    { at: 7.25, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    // 小蜜蜂把整隻大怪獸提起來
    { at: 7.6, actor: 'mon', do: 'moveTo', to: { x: 110, y: 45 }, dur: 0.7 },
    { at: 7.6, actor: 'bee', do: 'moveTo', to: { x: 110, y: 28 }, dur: 0.7 },
    { at: 7.6, actor: 'bee', do: 'shake', amount: 1.2, dur: 0.7 },
    { at: 7.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 8.0, actor: 'mon', do: 'shake', amount: 1.5, dur: 0.4 },
    // 回馬槍：蜜蜂提到滿頭大汗——一放手
    { at: 8.3, actor: 'bee', do: 'shake', amount: 2, dur: 0.3 },
    { at: 8.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 8.6, actor: 'bee', do: 'moveTo', to: { x: 112, y: 22 }, dur: 0.2, ease: 'out' },
    { at: 8.65, actor: 'mon', do: 'moveTo', to: { x: 128, y: G }, dur: 0.25, ease: 'in' },
    { at: 8.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 8.9, actor: 'mon', do: 'squash', amount: 0.6, dur: 0.8 },
    // 累壞的蜜蜂飄下來，掉在他頭上睡著
    { at: 8.95, actor: 'bee', do: 'scaleTo', amount: 0.67, dur: 0.3 },
    { at: 8.95, actor: 'bee', do: 'moveTo', to: { x: 128, y: 63 }, dur: 0.35, ease: 'in' },
    { at: 9.3, actor: 'bee', do: 'rotateTo', amount: 70, dur: 0.2 },
    // 怪獸彈回原形，把睡著的蜜蜂頂起來
    { at: 9.5, actor: 'bee', do: 'moveTo', to: { x: 128, y: 55 }, dur: 0.25, ease: 'out' },
    { at: 9.5, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
  ],
  builds: [
    // 積木炸開：左邊 → 虫；右邊 → 夆
    { at: 4.5, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'k3', color: '#F08C00' },
    { at: 4.7, dur: 0.9, strokes: [6, 7, 8, 9, 10, 11, 12], from: 'k4', color: '#C2410C' },
  ],
  glyph: [
    { at: 5.65, dur: 0.4, do: 'wobble' },
    { at: 6.45, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'mon', emoji: '🐝', dur: 0.8 },
    { at: 1.2, kind: 'pop', actor: 'mon', emoji: '😍', dx: 6, dur: 0.4 },
    { at: 2.35, kind: 'sweat', actor: 'mon' },
    { at: 2.45, kind: 'pop', actor: 'bee', emoji: '😆', dur: 0.45 },
    { at: 3.25, kind: 'pop', actor: 'mon', emoji: '😤', dur: 0.4 },
    { at: 4.3, kind: 'pop', actor: 'bee', emoji: '😱', dur: 0.4 },
    { at: 4.5, kind: 'burst', x: TX, y: 56, emoji: '🟨', n: 7, dur: 0.6 },
    { at: 5.25, kind: 'burst', actor: 'mon', n: 1, dur: 0.3 },
    { at: 4.8, kind: 'dizzy', actor: 'mon', dur: 1.1 },
    { at: 5.95, kind: 'pop', actor: 'bee', emoji: '😆', dur: 0.45 },
    { at: 7.25, kind: 'burst', actor: 'bee', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.3, kind: 'sweat', actor: 'bee' },
    { at: 8.9, kind: 'burst', x: 128, y: 70, n: 1, dur: 0.35 },
    { at: 8.95, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 9.35, kind: 'zzz', actor: 'bee', dx: 6, dur: 0.6 },
  ],
  camera: [
    { at: 4.5, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 8.9, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  lights: [
    // 撞進積木塔：白光一閃
    { at: 4.5, dur: 0.04, level: -0.5 },
    { at: 4.54, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 0.6, sfx: 'blip' },
    { at: 1.2, say: '蜂' },
    { at: 1.85, sfx: 'boing' },
    { at: 2.4, sfx: 'whoosh' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 4.5, sfx: 'crack' },
    { at: 5.25, sfx: 'bonk' },
    { at: 5.65, say: '蜂' },
    { at: 7.25, say: '蜜蜂' },
    { at: 7.6, sfx: 'whoosh' },
    { at: 8.65, sfx: 'whoosh' },
    { at: 8.9, sfx: 'bonk' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
