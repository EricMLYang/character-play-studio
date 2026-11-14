// 演的是字面意思：大＋怪獸——一隻好大好大的怪獸在雪地裡跟小企鵝玩躲貓貓，可是他太大了，躲哪裡都藏不住。
import { scene } from '../../story/scene'

// 雪地：小企鵝摀著眼睛數 1、2、3，大怪獸躡手躡腳躲到小雪人後面——雪人只有他的膝蓋高。企鵝轉身……左看右看……沒看到？
// 大怪獸換躲到細細的松樹後面，吸氣把自己拉得好瘦，肚子還是從兩邊凸出來。企鵝又轉身……又沒看到。
// 大怪獸想到辦法：在雪裡滾一圈，變成一顆大雪球（頭上的角還露在外面）。企鵝走過來戳一戳雪球……停一拍……沒事，轉身要走——
// 「吼！」雪球炸開，大怪獸跳出來變得更大：「大怪獸」！企鵝嚇得彈上天，剛好掉在他頭上，兩個一起笑。
const M = 65.2 // 大怪獸（size 28）站在地上的 y
const P = 71.1 // 企鵝（size 14）
const TREE = 100 // 細松樹
const SNOWMAN = 130
const BALL = 70 // 變成雪球的地方
const HEAD = { x: BALL, y: 41 } // 企鵝坐在大怪獸頭上（放大之後）

export default scene({
  duration: 9.6,
  bg: { top: '#8EC9F0', bottom: '#E6F5FF', floor: '#D6E6F5', scenery: 'snow' },
  actors: [
    { id: 'pine1', emoji: '🌲', x: 14, y: 64.4, size: 30 },
    { id: 'sled', emoji: '🛷', x: 150, y: 72, size: 11 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 186, y: M, size: 28 },
    { id: 'tree', emoji: '🌲', x: TREE, y: 63.2, size: 33 },
    { id: 'snowman', emoji: '⛄', x: SNOWMAN, y: 70.7, size: 15 },
    { id: 'ball', emoji: '⚪', x: BALL, y: 67.5, size: 25, hidden: true, pivot: 'center' },
    { id: 'peng', emoji: '🐧', x: 36, y: P, size: 14 },
  ],
  moves: [
    // 企鵝摀眼睛數數；大怪獸躡手躡腳走進來，蹲在小雪人後面（整隻都看得到）
    { at: 0.1, actor: 'mon', do: 'moveTo', to: { x: SNOWMAN + 2, y: M }, dur: 1.0, ease: 'out', anticipate: 3 },
    { at: 0.1, actor: 'mon', do: 'bounce', amount: 1.5, times: 4, dur: 1.0 },
    { at: 0.3, actor: 'peng', do: 'shake', amount: 0.4, dur: 1.5 },
    { at: 1.2, actor: 'mon', do: 'squash', amount: 0.25, dur: 0.9 },
    // 企鵝轉身：左看右看……沒看到？
    { at: 2.05, actor: 'peng', do: 'flip' },
    { at: 2.1, actor: 'peng', do: 'hop', amount: 3, dur: 0.3 },
    { at: 2.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 2.25, actor: 'mon', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 2.6, actor: 'peng', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 2.95, actor: 'peng', do: 'flip' },
    // 大怪獸換躲到細松樹後面，吸氣拉得好瘦……肚子還是凸出來
    { at: 3.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 3.0, actor: 'mon', do: 'moveTo', to: { x: TREE, y: M }, dur: 0.4, ease: 'in' },
    { at: 3.45, actor: 'mon', do: 'squash', amount: -0.3, dur: 1.1 },
    { at: 3.6, actor: 'peng', do: 'flip' },
    { at: 3.65, actor: 'peng', do: 'moveTo', to: { x: 50, y: P }, dur: 0.4 },
    { at: 4.15, actor: 'peng', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 4.55, actor: 'peng', do: 'flip' },
    // 想到了：在雪裡滾一圈，變成一顆大雪球
    { at: 4.7, actor: 'mon', do: 'moveTo', to: { x: BALL, y: M }, dur: 0.45, ease: 'inOut' },
    { at: 4.7, actor: 'mon', do: 'spin', times: -1, dur: 0.45, pivot: 'center' },
    { at: 5.15, actor: 'ball', do: 'pop', dur: 0.25 },
    { at: 5.15, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    // 企鵝轉身走過來，戳一戳雪球……停一拍……沒事，轉身要走
    { at: 5.5, actor: 'peng', do: 'flip' },
    { at: 5.6, actor: 'peng', do: 'moveTo', to: { x: 54, y: P }, dur: 0.3 },
    { at: 6.0, actor: 'peng', do: 'tilt', amount: 15, dur: 0.25 },
    { at: 6.05, actor: 'ball', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: 6.55, actor: 'peng', do: 'flip' },
    // 吼！雪球炸開，大怪獸跳出來變得更大
    { at: 6.8, actor: 'ball', do: 'vanish', dur: 0.1 },
    { at: 6.8, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 6.8, actor: 'mon', do: 'scaleTo', amount: 1.35, dur: 0.3, ease: 'back' },
    // 企鵝嚇得彈上天，掉在他頭上
    { at: 6.85, actor: 'peng', do: 'moveTo', to: { x: 42, y: 24 }, arc: 4, dur: 0.4, ease: 'out' },
    { at: 6.85, actor: 'peng', do: 'spin', times: 2, dur: 0.8, pivot: 'center' },
    { at: 7.25, actor: 'peng', do: 'moveTo', to: HEAD, dur: 0.4, ease: 'bounce' },
    { at: 7.25, actor: 'peng', do: 'flip' },
    // 亮相：兩個一起笑
    { at: 7.8, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 8.1, actor: 'mon', do: 'hop', amount: 3, dur: 0.35 },
    { at: 8.1, actor: 'peng', do: 'hop', amount: 6, dur: 0.4 },
  ],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'peng', emoji: '🙈', dur: 0.4 },
    { at: 0.6, kind: 'pop', actor: 'peng', emoji: '1️⃣', dur: 0.45 },
    { at: 1.1, kind: 'pop', actor: 'peng', emoji: '2️⃣', dur: 0.45 },
    { at: 1.6, kind: 'pop', actor: 'peng', emoji: '3️⃣', dur: 0.45 },
    { at: 1.3, kind: 'pop', actor: 'mon', emoji: '🤫', dx: -8, dur: 0.6 },
    { at: 2.15, kind: 'pop', actor: 'peng', emoji: '👀', dur: 0.6 },
    { at: 2.3, kind: 'sweat', actor: 'mon' },
    { at: 2.75, kind: 'pop', actor: 'peng', emoji: '❓', dur: 0.4 },
    { at: 3.4, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 3.9, kind: 'sweat', actor: 'mon' },
    { at: 4.2, kind: 'pop', actor: 'peng', emoji: '❓', dur: 0.4 },
    { at: 4.6, kind: 'pop', actor: 'mon', emoji: '💡', dur: 0.4 },
    { at: 5.15, kind: 'burst', actor: 'ball', emoji: '❄️', n: 8, dur: 0.7 },
    { at: 5.15, kind: 'puff', actor: 'ball', n: 8, dur: 0.6 },
    { at: 5.7, kind: 'pop', actor: 'peng', emoji: '❓', dur: 0.5 },
    { at: 6.15, kind: 'pop', actor: 'peng', emoji: '😑', dur: 0.4 },
    { at: 6.8, kind: 'burst', actor: 'mon', emoji: '❄️', n: 14, dur: 0.9 },
    { at: 6.85, kind: 'pop', actor: 'peng', emoji: '😱', dx: 8, dur: 0.5 },
    { at: 7.65, kind: 'pop', actor: 'peng', emoji: '😆', dx: 9, dur: 0.7 },
    { at: 8.05, kind: 'burst', actor: 'mon', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.2, kind: 'burst', actor: 'peng', emoji: '🎉', n: 6, dur: 0.9 },
  ],
  camera: [
    { at: 6.8, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 6.8, dur: 0.6, do: 'punch', amount: 0.15, to: { x: BALL, y: 50 } },
    { at: 7.5, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: BALL, y: 62 } },
  ],
  lights: [
    { at: 6.75, dur: 0.05, level: -0.35 },
    { at: 6.8, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.6, sfx: 'blip' },
    { at: 1.1, sfx: 'blip' },
    { at: 1.6, sfx: 'blip' },
    { at: 3.0, sfx: 'slide' },
    { at: 3.45, sfx: 'deflate' },
    { at: 4.7, sfx: 'whoosh' },
    { at: 5.15, sfx: 'poof' },
    { at: 6.05, sfx: 'tap' },
    { at: 6.8, sfx: 'crack' },
    { at: 6.95, say: '大怪獸' },
    { at: 7.6, sfx: 'boing' },
    { at: 8.1, sfx: 'cheer' },
  ],
})
