import type { Clip, Move } from '../clip'
import { ride } from '../helpers'

// 給（重做）：太空人玩偶捧著禮物要送給飛碟上的小外星人，踮腳搆不到、往上丟又砸回自己頭上；用力一跳頭撞飛碟，禮物飛上天掉下來炸開，
// 緞帶變成「糸」、蓋子和盒子變成「合」，裡面的星星落進他手裡。國字讓到上方，飛碟降落在中間，他把星星遞給外星人（給你）。
// 回馬槍：外星人太開心，從飛碟丟回一個超大禮物，「咚」地把他整個罩住，禮物盒自己跳著走到旁邊，他再從盒子裡冒出來。給、給、給你
const A = 66.9 // 太空人（size 24）站在地上的 y
const U = 30 // 飛碟在空中的 y
const R = -11 // 外星人站在飛碟上（相對飛碟的 y）

// 太空人的移動抄一份給手上的東西（dx／dy 是相對他的位置）
const carry = (ms: Move[], item: string, dx: number, dy: number): Move[] => ms.flatMap((m) => [
  m,
  ...(m.do === 'moveTo' || m.do === 'enter'
    ? [{ ...m, actor: item, to: m.to && { x: m.to.x + dx, y: m.to.y + dy }, from: m.from && { x: m.from.x + dx, y: m.from.y + dy } }]
    : []),
])

const clip: Clip = {
  char: '給',
  meta: { theme: '送禮物給外星人', cast: '太空人玩偶＋小外星人＋飛碟＋禮物＋星星＋超大禮物', gags: ['踮腳搆不到', '往上丟砸回自己頭', '一跳頭撞飛碟', '禮物炸開變成字', '回禮把人整個罩住盒子自己走'] },
  duration: 10,
  bg: { top: '#D9F5EA', bottom: '#F2FBF6', floor: '#F6EBD4', scenery: 'hills' },
  actors: [
    { id: 'ufo', emoji: '🛸', x: 100, y: U, size: 22, float: true, pivot: 'center' },
    { id: 'alien', emoji: 'hero:alien/idle', x: 100, y: U + R, size: 16, float: true, pivot: 'center' },
    { id: 'star', emoji: '⭐', x: 80, y: 66, size: 9, hidden: true, pivot: 'center' },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 30, y: A, size: 24, flip: true },
    { id: 'gift', emoji: '🎁', x: 38, y: A + 1, size: 12, pivot: 'center' },
    { id: 'big', emoji: '🎁', x: 110, y: 54, size: 30, hidden: true },
  ],
  moves: [
    // 太空人捧著禮物走進來；飛碟在空中晃
    ...carry([
      { at: 0, actor: 'astro', do: 'enter', from: { x: -20, y: A }, dur: 0.6, ease: 'out' },
    ], 'gift', 8, 1),
    ...ride([
      { at: 0, actor: 'ufo', do: 'bounce', amount: 1.5, times: 2, dur: 1.2 },
    ], 'alien', R, 22),
    // 給！舉起禮物
    { at: 0.75, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 0.75, actor: 'astro', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.75, actor: 'gift', do: 'hop', amount: 6, dur: 0.35 },
    { at: 1.05, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    // 第一次：走到飛碟下面，踮腳舉高——差好遠
    ...carry([
      { at: 1.2, actor: 'astro', do: 'moveTo', to: { x: 84, y: A }, dur: 0.55 },
    ], 'gift', 8, 1),
    { at: 1.85, actor: 'astro', do: 'squash', amount: -0.35, dur: 0.55 },
    { at: 1.85, actor: 'gift', do: 'hop', amount: 9, dur: 0.55 },
    { at: 1.9, actor: 'alien', do: 'hop', amount: -3, dur: 0.5 },
    // 第二次：往上丟——丟不到，掉回來砸在自己頭上
    { at: 2.5, actor: 'astro', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 2.5, actor: 'gift', do: 'moveTo', to: { x: 94, y: 38 }, dur: 0.3, ease: 'out' },
    { at: 2.5, actor: 'gift', do: 'spin', times: 1, dur: 0.3 },
    { at: 2.8, actor: 'gift', do: 'moveTo', to: { x: 86, y: A - 21 }, dur: 0.25, ease: 'in' },
    { at: 3.05, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 3.05, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.05, actor: 'gift', do: 'moveTo', to: { x: 92, y: A + 1 }, arc: 5, dur: 0.3, ease: 'out' },
    // 第三次：蹲好低——用力一跳
    { at: 3.45, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 3.45, actor: 'astro', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 3.45, actor: 'gift', do: 'hop', amount: -4, dur: 0.35 },
    { at: 3.8, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    ...carry([
      { at: 3.8, actor: 'astro', do: 'moveTo', to: { x: 92, y: 51 }, dur: 0.24, ease: 'out' },
    ], 'gift', 8, -2),
    // 頭撞飛碟！飛碟轉著被撞開，禮物飛上天
    ...ride([
      { at: 4.04, actor: 'ufo', do: 'moveTo', to: { x: 130, y: 26 }, dur: 0.45, ease: 'out' },
      { at: 4.04, actor: 'ufo', do: 'spin', times: 2, dur: 0.55 },
    ], 'alien', R, 22),
    { at: 4.04, actor: 'gift', do: 'moveTo', to: { x: 80, y: 12 }, dur: 0.35, ease: 'out' },
    { at: 4.04, actor: 'gift', do: 'spin', times: -2, dur: 0.75 },
    { at: 4.4, actor: 'gift', do: 'moveTo', to: { x: 80, y: 70 }, dur: 0.4, ease: 'in' },
    // 太空人慢慢飄下來，在空中划手
    { at: 4.05, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 4.05, actor: 'astro', do: 'moveTo', to: { x: 38, y: A }, dur: 1.15, ease: 'inOut' },
    { at: 4.3, actor: 'astro', do: 'shake', amount: 1.2, dur: 0.7 },
    // 禮物落地、抖一抖、鼓起來——碰！
    { at: 4.95, actor: 'gift', do: 'shake', amount: 1, dur: 0.35 },
    { at: 4.95, actor: 'gift', do: 'scaleTo', amount: 1.4, dur: 0.35, ease: 'in' },
    { at: 5.3, actor: 'gift', do: 'vanish', dur: 0.08 },
    // 裡面的星星飛出來，落進太空人手裡
    { at: 5.3, actor: 'star', do: 'pop' },
    { at: 5.3, actor: 'star', do: 'moveTo', to: { x: 46, y: A - 2 }, arc: 22, dur: 0.55, ease: 'linear' },
    { at: 5.3, actor: 'star', do: 'spin', times: -2, dur: 0.55 },
    { at: 5.85, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 5.85, actor: 'astro', do: 'hop', amount: 3, dur: 0.3 },
    { at: 5.85, actor: 'star', do: 'hop', amount: 3, dur: 0.3 },
    // 炫耀一下星星，外星人眼睛發亮
    { at: 6.4, actor: 'astro', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.4, actor: 'star', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.4, actor: 'star', do: 'spin', times: 1, dur: 0.3 },
    // 飛碟還在暈
    { at: 4.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 5.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    // 國字讓位：飛碟降落在中間，太空人捧著星星走過去
    ...ride([
      { at: 6.85, actor: 'ufo', do: 'moveTo', to: { x: 96, y: 66 }, dur: 0.55, ease: 'inOut' },
    ], 'alien', R, 22),
    ...carry([
      { at: 6.9, actor: 'astro', do: 'moveTo', to: { x: 66, y: A }, dur: 0.5 },
    ], 'star', 8, -2),
    // 給你！把星星遞過去
    { at: 7.5, actor: 'astro', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 7.5, actor: 'star', do: 'moveTo', to: { x: 89, y: 52 }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 7.8, actor: 'star', do: 'scaleTo', amount: 1.5, dur: 0.2, ease: 'back' },
    { at: 7.8, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.8, actor: 'alien', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.8, actor: 'star', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：外星人也要回禮——飛起來，丟下一個超大禮物
    ...ride([
      { at: 8.15, actor: 'ufo', do: 'moveTo', to: { x: 110, y: 40 }, dur: 0.3, ease: 'in' },
    ], 'alien', R, 22),
    { at: 8.15, actor: 'star', do: 'moveTo', to: { x: 103, y: 55 }, dur: 0.3, ease: 'in' },
    { at: 8.45, actor: 'alien', do: 'tilt', amount: -18, dur: 0.35 },
    { at: 8.45, actor: 'ufo', do: 'tilt', amount: -10, dur: 0.35 },
    { at: 8.5, actor: 'big', do: 'pop' },
    { at: 8.55, actor: 'big', do: 'moveTo', to: { x: 66, y: 64.4 }, arc: 10, dur: 0.32, ease: 'in' },
    { at: 8.55, actor: 'big', do: 'spin', times: -1, dur: 0.32 },
    { at: 8.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    // 咚！整個人被罩住
    { at: 8.87, actor: 'astro', do: 'vanish', dur: 0.04 },
    { at: 8.87, actor: 'big', do: 'squash', amount: 0.35, dur: 0.3 },
    // 禮物盒自己一跳一跳走到旁邊
    { at: 8.98, actor: 'big', do: 'moveTo', to: { x: 30, y: 64.4 }, dur: 0.42, ease: 'linear' },
    { at: 8.98, actor: 'big', do: 'bounce', amount: 3, times: 3, dur: 0.42 },
    { at: 8.98, actor: 'astro', do: 'moveTo', to: { x: 30, y: A - 20 }, dur: 0.42 },
    ...ride([
      { at: 8.9, actor: 'ufo', do: 'moveTo', to: { x: 132, y: U + 4 }, dur: 0.45 },
    ], 'alien', R, 22),
    { at: 8.9, actor: 'star', do: 'moveTo', to: { x: 125, y: U + 19 }, dur: 0.45 },
    // 從盒子裡冒出來
    { at: 9.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 9.6, actor: 'astro', do: 'pop' },
    { at: 9.6, actor: 'astro', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 禮物炸開：緞帶 → 糸；蓋子 → 人＋一；盒子 → 口
    { at: 5.3, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: 'gift', color: '#E64980' },
    { at: 5.4, dur: 0.4, strokes: [6, 7, 8], from: 'gift', color: '#F08C00' },
    { at: 5.55, dur: 0.4, strokes: [9, 10, 11], from: 'gift', color: '#F08C00' },
  ],
  glyph: [
    { at: 6.0, dur: 0.4, do: 'wobble' },
    { at: 6.8, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.38, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'alien', emoji: '😢', dx: 12, dy: 6, dur: 0.6 },
    { at: 1.05, kind: 'pop', actor: 'alien', emoji: '❗', dx: 12, dy: 6, dur: 0.4 },
    { at: 2.2, kind: 'sweat', actor: 'astro' },
    { at: 3.05, kind: 'burst', actor: 'astro', n: 1, dur: 0.35 },
    { at: 3.1, kind: 'pop', actor: 'alien', emoji: '😬', dx: 12, dy: 6, dur: 0.4 },
    { at: 3.45, kind: 'pop', actor: 'astro', emoji: '😤', dur: 0.35 },
    { at: 4.04, kind: 'burst', x: 98, y: 32, n: 1, dur: 0.35 },
    { at: 4.6, kind: 'dizzy', actor: 'alien', dur: 1.2 },
    { at: 5.3, kind: 'burst', actor: 'gift', emoji: '🎊', n: 8, dur: 0.6 },
    { at: 6.3, kind: 'pop', actor: 'alien', emoji: '🤩', dx: 12, dy: 6, dur: 0.45 },
    { at: 7.8, kind: 'burst', actor: 'star', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.95, kind: 'pop', actor: 'alien', emoji: '💕', dx: 12, dy: 2, dur: 0.5 },
    { at: 8.2, kind: 'pop', actor: 'alien', emoji: '🎁', dx: 13, dur: 0.4 },
    { at: 8.6, kind: 'pop', actor: 'astro', emoji: '😱', dx: -10, dur: 0.3 },
    { at: 8.87, kind: 'puff', actor: 'big', dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'alien', emoji: '😅', dx: 12, dur: 0.5 },
  ],
  camera: [
    { at: 4.04, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 5.3, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 7.8, dur: 0.45, do: 'punch', amount: 0.12, to: { x: 78, y: 56 } },
    { at: 8.87, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    // 禮物炸開：白光一閃
    { at: 5.3, dur: 0.04, level: -0.5 },
    { at: 5.34, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.8, say: '給' },
    { at: 2.5, sfx: 'whoosh' },
    { at: 3.05, sfx: 'bonk' },
    { at: 3.8, sfx: 'boing' },
    { at: 4.04, sfx: 'bonk' },
    { at: 4.8, sfx: 'plop' },
    { at: 5.3, sfx: 'poof' },
    { at: 6.0, say: '給' },
    { at: 6.85, sfx: 'whoosh' },
    { at: 7.5, say: '給你' },
    { at: 8.5, sfx: 'whoosh' },
    { at: 8.87, sfx: 'bonk' },
    { at: 8.98, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
