// 演的是字面意思：哆啦＝鈴鐺「哆啦哆啦」響，夢＝主角睡著做了一個夢（沒有藍色圓貓、口袋、竹蜻蜓、任意門）。
import { scene } from '../../story/scene'

// 月亮下的野營床：大怪獸打著哈欠爬上床，一睡著頭上就冒出夢：蛋糕、甜甜圈、冰淇淋。樹上的鈴鐺「哆啦哆啦」一響，
// 夢就啵一聲破掉。他翻個身再睡，夢回來了——這次是一個超大的蛋糕！鈴鐺又響，他在夢裡一口咬下去……咬到的是鈴鐺！
// 他掉回床上坐起來，打一個嗝：肚子裡「哆啦」一聲。「哆啦Ａ夢」。
const G = 66.1 // 大怪獸（size 26）站在地上的 y
const BED = { x: 80, y: 64 }
const NAP = { x: 80, y: 60 } // 躺在床上
const CLOUD = { x: 70, y: 31 }

export default scene({
  duration: 9.6,
  bg: { top: '#1B2A55', bottom: '#45579A', floor: '#3E6B4A', scenery: 'night' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 136, y: 58.5, size: 44 },
    { id: 'bell', emoji: '🔔', x: 121, y: 47, size: 11, float: true, pivot: 'center' },
    { id: 'tent', emoji: '⛺', x: 22, y: 67.8, size: 22 },
    { id: 'bed', emoji: '🛏️', x: BED.x, y: BED.y + 4.5, size: 30 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 46, y: G, size: 26, hidden: true },
    { id: 'cloud', emoji: '💭', x: CLOUD.x, y: CLOUD.y + 6, size: 44, float: true, hidden: true },
    { id: 'cake', emoji: '🍰', x: CLOUD.x - 9, y: CLOUD.y - 1, size: 10, float: true, hidden: true },
    { id: 'donut', emoji: '🍩', x: CLOUD.x + 1, y: CLOUD.y - 4, size: 10, float: true, hidden: true },
    { id: 'ice', emoji: '🍦', x: CLOUD.x + 10, y: CLOUD.y - 1, size: 10, float: true, hidden: true },
    { id: 'big', emoji: '🎂', x: CLOUD.x, y: CLOUD.y, size: 20, float: true, hidden: true },
  ],
  moves: [
    // 打著哈欠走進來，蹲一下跳上床，倒頭就睡
    { at: 0.1, actor: 'mon', do: 'enter', from: { x: -16, y: G }, dur: 0.8, ease: 'out' },
    { at: 1.0, actor: 'mon', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.25, actor: 'mon', do: 'moveTo', to: NAP, arc: 12, dur: 0.45, ease: 'out' },
    { at: 1.7, actor: 'mon', do: 'swap', emoji: 'hero:monster/sleep' },
    { at: 1.7, actor: 'bed', do: 'squash', amount: 0.2, dur: 0.3 },
    // 做夢：雲冒出來，好吃的一個一個跳進去
    { at: 2.2, actor: 'cloud', do: 'pop', dur: 0.35 },
    { at: 2.55, actor: 'cake', do: 'pop' },
    { at: 2.8, actor: 'donut', do: 'pop' },
    { at: 3.05, actor: 'ice', do: 'pop' },
    // 哆啦哆啦！鈴鐺響，夢破掉
    { at: 3.5, actor: 'bell', do: 'shake', amount: 2.5, dur: 0.8 },
    { at: 3.6, actor: 'mon', do: 'shake', amount: 1, dur: 0.6 },
    { at: 4.25, actor: 'cake', do: 'vanish', dur: 0.15 },
    { at: 4.25, actor: 'donut', do: 'vanish', dur: 0.15 },
    { at: 4.25, actor: 'ice', do: 'vanish', dur: 0.15 },
    { at: 4.25, actor: 'cloud', do: 'vanish', dur: 0.2 },
    { at: 4.25, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 4.25, actor: 'mon', do: 'hop', amount: 4, dur: 0.3 },
    // 翻個身再睡（他放棄了？）……夢回來了，超大蛋糕
    { at: 4.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/sleep' },
    { at: 4.9, actor: 'mon', do: 'flip' },
    { at: 5.45, actor: 'cloud', do: 'pop', dur: 0.35 },
    { at: 5.45, actor: 'cloud', do: 'scaleTo', amount: 1.15, dur: 0.35 },
    { at: 5.75, actor: 'big', do: 'pop', dur: 0.4 },
    // 又響了——他在夢裡跳起來一口咬下去：咬到的是鈴鐺！
    { at: 6.1, actor: 'bell', do: 'shake', amount: 2.5, dur: 0.5 },
    { at: 6.35, actor: 'mon', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 6.55, actor: 'mon', do: 'moveTo', to: { x: 120, y: 62 }, arc: 14, dur: 0.35, ease: 'in' },
    { at: 6.55, actor: 'big', do: 'vanish', dur: 0.2 },
    { at: 6.6, actor: 'cloud', do: 'vanish', dur: 0.25 },
    { at: 6.9, actor: 'bell', do: 'vanish', dur: 0.08 },
    { at: 6.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/stuffed' },
    { at: 6.9, actor: 'mon', do: 'squash', amount: 0.35, dur: 0.3 },
    // 掉回床上
    { at: 7.2, actor: 'mon', do: 'flip' },
    { at: 7.2, actor: 'mon', do: 'moveTo', to: NAP, arc: 6, dur: 0.4, ease: 'in' },
    { at: 7.5, actor: 'bed', do: 'squash', amount: 0.25, dur: 0.3 },
    // 打嗝：肚子裡「哆啦」！亮相
    { at: 7.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 7.9, actor: 'mon', do: 'scaleTo', amount: 1.3, dur: 0.35, ease: 'back' },
    { at: 7.9, actor: 'mon', do: 'hop', amount: 7, dur: 0.45 },
    { at: 8.6, actor: 'mon', do: 'squash', amount: -0.15, dur: 0.3 },
  ],
  fx: [
    // 綁鈴鐺的繩子（咬走之前）
    { at: 0, kind: 'line', actor: 'bell', to: { x: 121, y: 38 }, color: '#5C3B1E', width: 0.5, dur: 6.9 },
    { at: 0.4, kind: 'pop', actor: 'mon', emoji: '🥱', dx: 12, dur: 0.8 },
    { at: 1.7, kind: 'puff', actor: 'bed', dur: 0.4 },
    { at: 1.9, kind: 'zzz', actor: 'mon', dur: 1.6 },
    { at: 3.1, kind: 'pop', actor: 'mon', emoji: '😋', dx: -14, dy: 8, dur: 0.5 },
    { at: 3.5, kind: 'burst', actor: 'bell', emoji: '🎶', n: 4, dur: 0.8 },
    { at: 4.25, kind: 'burst', x: CLOUD.x, y: CLOUD.y, emoji: '💨', n: 6, dur: 0.6 },
    { at: 4.35, kind: 'sweat', actor: 'mon' },
    { at: 5.0, kind: 'zzz', actor: 'mon', dur: 1.2 },
    { at: 5.9, kind: 'pop', actor: 'mon', emoji: '🤤', dx: -14, dy: 8, dur: 0.6 },
    { at: 6.1, kind: 'burst', actor: 'bell', emoji: '🎶', n: 4, dur: 0.6 },
    { at: 6.9, kind: 'burst', actor: 'mon', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.5, kind: 'puff', actor: 'bed', dur: 0.4 },
    { at: 7.9, kind: 'burst', actor: 'mon', emoji: '🎶', n: 6, dur: 0.8 },
    { at: 8.0, kind: 'pop', actor: 'mon', emoji: '🔔', dx: 14, dy: 4, dur: 0.8 },
    { at: 8.3, kind: 'burst', actor: 'mon', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 6.9, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 7.5, dur: 0.25, do: 'shake', amount: 0.8 },
    { at: 7.9, dur: 0.45, do: 'zoom', amount: 1.45, to: { x: 80, y: 50 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.25 },
    // 咬到鈴鐺：一閃；打嗝亮相：營火般亮起來
    { at: 6.9, dur: 0.05, level: -0.3 },
    { at: 6.95, dur: 0.25, level: 0.25 },
    { at: 7.8, dur: 0.5, level: -0.1 },
  ],
  cues: [
    { at: 0.4, sfx: 'deflate' },
    { at: 1.7, sfx: 'boing' },
    { at: 2.2, sfx: 'bubble' },
    { at: 3.5, sfx: 'clink' },
    { at: 3.8, sfx: 'clink' },
    { at: 4.25, sfx: 'poof' },
    { at: 5.45, sfx: 'bubble' },
    { at: 6.1, sfx: 'clink' },
    { at: 6.9, sfx: 'gulp' },
    { at: 7.5, sfx: 'plop' },
    { at: 7.9, sfx: 'hic' },
    { at: 8.05, say: '哆啦Ａ夢' },
    { at: 8.4, sfx: 'cheer' },
  ],
})
