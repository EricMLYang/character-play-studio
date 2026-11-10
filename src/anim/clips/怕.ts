import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 怕（重做）：豬探長低頭撿餅乾屑吃，抬頭就跟白白的鬼臉貼臉——嚇得躲到小熊後面；鬼脹大「哇」一聲，他嚇到彈上天、放大鏡飛出去。
// 放大鏡掉下來「咚」砸中鬼，白布飛起來——底下是頭暈的披風英雄。白布「轟」地落成「白」、放大鏡摔碎成「忄」。國字讓到上方，豬探長站到中間挺胸（不怕），
// 回馬槍：小熊後面鑽出一隻小老鼠「吱」——他嚇到整隻跳進英雄懷裡，把英雄壓扁。怕、怕、不怕
const P = 67.8 // 豬探長（size 22）站在地上的 y
const H = 68.6 // 披風英雄（size 20）站在地上的 y

const clip: Clip = {
  char: '怕',
  meta: { theme: '以為是鬼', cast: '豬探長＋披風英雄（白布鬼）＋放大鏡＋小熊玩偶＋小老鼠＋餅乾屑', gags: ['撿餅乾抬頭跟鬼貼臉', '躲在比自己小的小熊後面', '嚇飛的放大鏡掉下來砸中鬼', '白布落成白', '說不怕卻被小老鼠嚇進別人懷裡'] },
  duration: 10,
  bg: { top: '#FFE3C8', bottom: '#FFF4E6', floor: '#D9C2A6', scenery: 'forest' },
  actors: [
    { id: 'c1', emoji: '🍪', x: 44, y: 73, size: 5 },
    { id: 'c2', emoji: '🍪', x: 56, y: 73, size: 5 },
    { id: 'c3', emoji: '🍪', x: 70, y: 73, size: 5 },
    { id: 'hero', emoji: 'hero:cape/dizzy', x: 44, y: H, size: 20, hidden: true },
    // 鬼畫在豬探長後面：嚇到彈上天時不會被脹大的鬼蓋住
    { id: 'ghost', emoji: '👻', x: 104, y: 58, size: 22, float: true },
    { id: 'pig', emoji: 'hero:pig/think', x: 30, y: P, size: 22, flip: true },
    // 小老鼠一直躲在小熊後面；小熊畫在豬探長前面，才看得出他「躲在小熊後面」
    { id: 'mouse', emoji: '🐭', x: 15, y: 71.5, size: 9 },
    { id: 'teddy', emoji: '🧸', x: 14, y: 70, size: 13 },
    { id: 'lens', emoji: '🔍', x: 38, y: 58, size: 9, hidden: true, float: true },
  ],
  moves: [
    // 低頭沿著餅乾屑走，一塊一塊撿起來吃
    { at: 0, actor: 'pig', do: 'enter', from: { x: -20, y: P }, dur: 0.55, ease: 'out' },
    { at: 0, actor: 'ghost', do: 'enter', from: { x: 180, y: 52 }, dur: 0.9, ease: 'out' },
    { at: 0.1, actor: 'pig', do: 'tilt', amount: 14, dur: 1.2 },
    { at: 0.55, actor: 'c1', do: 'moveTo', to: { x: 38, y: 62 }, dur: 0.15, ease: 'in' },
    { at: 0.7, actor: 'c1', do: 'vanish', dur: 0.1 },
    { at: 0.6, actor: 'pig', do: 'moveTo', to: { x: 46, y: P }, dur: 0.35 },
    { at: 0.9, actor: 'c2', do: 'moveTo', to: { x: 54, y: 62 }, dur: 0.15, ease: 'in' },
    { at: 1.05, actor: 'c2', do: 'vanish', dur: 0.1 },
    // 鬼也飄下來看最後一塊
    { at: 0.9, actor: 'ghost', do: 'moveTo', to: { x: 80, y: 60 }, dur: 0.4, ease: 'inOut' },
    { at: 0.95, actor: 'pig', do: 'moveTo', to: { x: 60, y: P }, dur: 0.3 },
    { at: 1.2, actor: 'c3', do: 'moveTo', to: { x: 70, y: 66 }, dur: 0.1 },
    // 抬頭——貼臉！
    { at: 1.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 1.4, actor: 'pig', do: 'hop', amount: 9, dur: 0.3 },
    { at: 1.4, actor: 'c3', do: 'moveTo', to: { x: 66, y: 30 }, arc: 8, dur: 0.3, ease: 'out' },
    { at: 1.4, actor: 'c3', do: 'spin', times: 2, dur: 0.4 },
    { at: 1.45, actor: 'ghost', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 1.7, actor: 'c3', do: 'moveTo', to: { x: 80, y: 52 }, dur: 0.25, ease: 'in' },
    { at: 1.95, actor: 'c3', do: 'vanish', dur: 0.1 },
    { at: 1.95, actor: 'ghost', do: 'squash', amount: 0.15, dur: 0.2 },
    // 逃回去躲在小熊後面（小熊根本擋不住他）
    { at: 1.7, actor: 'pig', do: 'moveTo', to: { x: 24, y: P }, dur: 0.35, ease: 'in', anticipate: 3 },
    { at: 2.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.05, actor: 'pig', do: 'squash', amount: 0.22, dur: 0.6 },
    { at: 2.05, actor: 'pig', do: 'shake', amount: 0.9, dur: 0.7 },
    { at: 2.1, actor: 'teddy', do: 'shake', amount: 0.5, dur: 0.6 },
    // 鬼慢慢飄過來看
    { at: 2.1, actor: 'ghost', do: 'moveTo', to: { x: 44, y: 58 }, dur: 0.5, ease: 'inOut' },
    { at: 2.6, actor: 'ghost', do: 'tilt', amount: 15, dur: 0.3 },
    // 鬼脹大「哇」！
    { at: 2.85, actor: 'ghost', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 3.0, actor: 'ghost', do: 'scaleTo', amount: 1.45, dur: 0.15, ease: 'back' },
    { at: 3.0, actor: 'ghost', do: 'shake', amount: 1.2, dur: 0.3 },
    // 嚇到彈上天，放大鏡飛出去
    { at: 3.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.05, actor: 'pig', do: 'hop', amount: 26, dur: 0.5 },
    { at: 3.05, actor: 'pig', do: 'spin', times: 1, dur: 0.5 },
    { at: 3.05, actor: 'lens', do: 'pop', dur: 0.05 },
    { at: 3.05, actor: 'lens', do: 'moveTo', to: { x: 40, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 3.05, actor: 'lens', do: 'spin', times: 3, dur: 0.4 },
    { at: 3.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 鬼縮回來，偷笑，湊過去看
    { at: 3.4, actor: 'ghost', do: 'scaleTo', amount: 1 / 1.45, dur: 0.25 },
    { at: 3.6, actor: 'ghost', do: 'bounce', amount: 1.5, times: 2, dur: 0.4 },
    { at: 3.9, actor: 'ghost', do: 'moveTo', to: { x: 40, y: 60 }, dur: 0.3 },
    // 放大鏡從天上掉下來「咚」砸中鬼
    { at: 3.95, actor: 'lens', do: 'moveTo', to: { x: 40, y: 48 }, dur: 0.3, ease: 'in' },
    { at: 4.25, actor: 'ghost', do: 'squash', amount: 0.35, dur: 0.15 },
    // 白布飛起來，底下是頭暈的披風英雄
    { at: 4.3, actor: 'ghost', do: 'moveTo', to: { x: 80, y: 16 }, dur: 0.45, ease: 'out' },
    { at: 4.3, actor: 'ghost', do: 'spin', times: 2, dur: 0.45 },
    { at: 4.3, actor: 'hero', do: 'pop', dur: 0.2 },
    { at: 4.3, actor: 'lens', do: 'moveTo', to: { x: 96, y: 8 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: 4.3, actor: 'lens', do: 'spin', times: -3, dur: 0.6 },
    { at: 4.85, actor: 'ghost', do: 'vanish', dur: 0.15 },
    { at: 5.4, actor: 'lens', do: 'vanish', dur: 0.1 },
    { at: 5.1, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.5 },
    // 豬探長回過神：原來是你！
    { at: 5.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 6.25, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 6.25, actor: 'hero', do: 'tilt', amount: -10, dur: 0.4 },
    // 國字讓位：豬探長走到中間，英雄退到右邊
    { at: 6.7, actor: 'hero', do: 'moveTo', to: { x: 124, y: H }, arc: 14, dur: 0.45, ease: 'out' },
    { at: 6.85, actor: 'pig', do: 'moveTo', to: { x: 80, y: P }, dur: 0.35 },
    { at: 7.1, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.25 },
    // 挺胸：不怕！
    { at: 7.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 7.35, actor: 'pig', do: 'scaleTo', amount: 1.2, dur: 0.2, ease: 'back' },
    { at: 7.35, actor: 'pig', do: 'hop', amount: 5, dur: 0.3 },
    { at: 7.5, actor: 'hero', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
    // 回馬槍：小熊後面鑽出一隻小老鼠「吱」
    { at: 7.85, actor: 'teddy', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 7.9, actor: 'mouse', do: 'moveTo', to: { x: 40, y: 71.5 }, dur: 0.25, ease: 'out' },
    { at: 8.15, actor: 'mouse', do: 'hop', amount: 3, dur: 0.2 },
    { at: 8.1, actor: 'pig', do: 'flip' },
    { at: 8.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.2, actor: 'pig', do: 'scaleTo', amount: 1 / 1.2, dur: 0.15 },
    { at: 8.2, actor: 'pig', do: 'shake', amount: 1.4, dur: 0.2 },
    // 整隻跳進英雄懷裡，把英雄壓扁
    { at: 8.35, actor: 'pig', do: 'moveTo', to: { x: 122, y: 54 }, arc: 10, dur: 0.4, ease: 'inOut' },
    { at: 8.4, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 8.75, actor: 'hero', do: 'squash', amount: 0.45, dur: 0.6 },
    ...pressStack(8.75, 0.6, 0.45, 20, ['pig']),
    { at: 8.75, actor: 'pig', do: 'shake', amount: 1, dur: 0.8 },
    { at: 8.9, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 8.8, actor: 'mouse', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    { at: 9.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  ],
  builds: [
    // 白布從天上「轟」地落下 → 白；放大鏡摔碎 → 鏡片兩點、把手那一直
    { at: 4.85, dur: 0.5, strokes: [3, 4, 5, 6, 7], from: 'ghost', style: 'drop', color: '#5B6CC9' },
    { at: 5.4, dur: 0.4, strokes: [2, 0, 1], from: 'lens', style: 'drop', color: '#C2410C' },
  ],
  glyph: [
    { at: 5.85, dur: 0.4, do: 'wobble' },
    { at: 6.65, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.2, kind: 'bubble', actor: 'pig', emoji: '🍪', dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'pig', emoji: '😱', dx: -8, dur: 0.55 },
    { at: 1.6, kind: 'pop', actor: 'ghost', emoji: '😛', dx: 8, dur: 0.4 },
    { at: 2.1, kind: 'sweat', actor: 'pig', dur: 0.7 },
    { at: 2.55, kind: 'pop', actor: 'ghost', emoji: '❓', dx: 8, dur: 0.35 },
    { at: 3.0, kind: 'burst', actor: 'ghost', emoji: '‼️', n: 1, dx: 10, dur: 0.35 },
    { at: 3.6, kind: 'dizzy', actor: 'pig', dur: 2.0 },
    { at: 3.65, kind: 'pop', actor: 'ghost', emoji: '😆', dx: 10, dur: 0.35 },
    { at: 4.25, kind: 'burst', actor: 'ghost', n: 1, dy: 2, dur: 0.3 },
    { at: 4.4, kind: 'dizzy', actor: 'hero', dur: 1.4 },
    { at: 4.85, kind: 'burst', x: 80, y: 50, emoji: '✨', n: 6, dur: 0.5 },
    { at: 5.95, kind: 'pop', actor: 'pig', emoji: '😑', dur: 0.5 },
    { at: 6.25, kind: 'sweat', actor: 'hero', dur: 0.5 },
    { at: 6.25, kind: 'pop', actor: 'hero', emoji: '😅', dx: 8, dur: 0.4 },
    { at: 7.35, kind: 'burst', actor: 'pig', emoji: '⭐', n: 6, dx: 0, dy: 14, dur: 0.6 },
    { at: 7.4, kind: 'pop', actor: 'pig', emoji: '💪', dx: -18, dy: 10, dur: 0.6 },
    { at: 7.55, kind: 'pop', actor: 'hero', emoji: '👏', dx: -8, dur: 0.45 },
    { at: 8.1, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.35 },
    { at: 8.2, kind: 'pop', actor: 'pig', emoji: '😱', dx: -16, dy: 10, dur: 0.4 },
    { at: 8.75, kind: 'puff', actor: 'hero', dur: 0.4 },
    { at: 8.8, kind: 'sweat', actor: 'pig', dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    { at: 1.4, dur: 0.5, do: 'punch', amount: 0.18, to: { x: 70, y: 58 } },
    { at: 3.0, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 4.85, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 5.4, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 白布落地：白光一閃
    { at: 4.85, dur: 0.04, level: -0.7 },
    { at: 4.89, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.55, sfx: 'gulp' },
    { at: 0.9, sfx: 'gulp' },
    { at: 1.4, say: '怕' },
    { at: 1.7, sfx: 'whoosh' },
    { at: 3.0, sfx: 'poof' },
    { at: 3.05, sfx: 'boing' },
    { at: 3.95, sfx: 'whoosh' },
    { at: 4.25, sfx: 'bonk' },
    { at: 4.85, sfx: 'crack' },
    { at: 5.4, sfx: 'clink' },
    { at: 5.85, say: '怕' },
    { at: 7.35, say: '不怕' },
    { at: 8.1, sfx: 'blip' },
    { at: 8.75, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
