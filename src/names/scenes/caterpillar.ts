// 演的是字面意思：毛毛＋蟲——一隻毛茸茸的小蟲，用身上的毛搔大象的鼻子，大象一個大噴嚏，把牠吹得全身的毛都蓬起來（不演吃水果、變蝴蝶）。
import { scene } from '../../story/scene'

// 早上的樹林：毛毛蟲一伸一縮爬過來，看到睡覺的大象，爬上牠的長鼻子，扭一扭——毛搔得大象鼻子好癢。
// 大象吸氣「啊……啊……」……停一拍……又睡回去了。毛毛蟲再用力扭，大象吸好大一口氣——哈啾！
// 毛毛蟲被噴上天、轉好幾圈，掉在大象頭上，全身的毛都蓬成一大顆毛球。大象醒來往上看，兩個一起笑：「毛毛蟲」。
const W = 10 // 毛毛蟲
const WG = 77 - 0.42 * W
const E = 34 // 大象
const EG = 77 - 0.42 * E
const EX = 100
const TRUNK = { x: 84, y: 64 } // 爬到鼻子上
const HEAD = { x: 104, y: 49 } // 掉在大象頭上

export default scene({
  duration: 9.0,
  bg: { top: '#BFE8B0', bottom: '#F2FBE6', floor: '#7DB860', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 30, y: 77 - 0.42 * 30, size: 30 },
    { id: 'shroom', emoji: '🍄', x: 52, y: 77 - 0.42 * 9, size: 9 },
    { id: 'flower', emoji: '🌼', x: 148, y: 77 - 0.42 * 9, size: 9 },
    { id: 'ele', emoji: '🐘', x: EX, y: EG, size: E },
    { id: 'bug', emoji: '🐛', x: -10, y: WG, size: W, flip: true, pivot: 'center' },
  ],
  moves: [
    // ① 一伸一縮爬過來
    { at: 0.0, actor: 'bug', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 0.25, actor: 'bug', do: 'moveTo', to: { x: 10, y: WG }, dur: 0.35, ease: 'out' },
    { at: 0.6, actor: 'bug', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 0.85, actor: 'bug', do: 'moveTo', to: { x: 30, y: WG }, dur: 0.35, ease: 'out' },
    { at: 1.2, actor: 'bug', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 1.45, actor: 'bug', do: 'moveTo', to: { x: 52, y: WG }, dur: 0.35, ease: 'out' },
    { at: 1.8, actor: 'bug', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 2.0, actor: 'bug', do: 'moveTo', to: { x: 64, y: WG }, dur: 0.35, ease: 'out' },
    // 爬上長鼻子
    { at: 2.4, actor: 'bug', do: 'rotateTo', amount: -30, dur: 0.2 },
    { at: 2.4, actor: 'bug', do: 'moveTo', to: TRUNK, dur: 0.4 },
    { at: 2.8, actor: 'bug', do: 'rotateTo', amount: 30, dur: 0.2 },
    // ② 扭一扭：好癢
    { at: 3.0, actor: 'bug', do: 'shake', amount: 0.8, dur: 0.45 },
    { at: 3.2, actor: 'ele', do: 'shake', amount: 0.4, dur: 0.3 },
    // 吸氣「啊……啊……」
    { at: 3.5, actor: 'ele', do: 'squash', amount: -0.12, dur: 0.6 },
    // 停一拍……又睡回去了
    { at: 4.3, actor: 'bug', do: 'tilt', amount: 15, dur: 0.4 },
    // ③ 再用力扭，吸好大一口氣
    { at: 4.75, actor: 'bug', do: 'shake', amount: 1.4, dur: 0.5 },
    { at: 4.9, actor: 'ele', do: 'squash', amount: -0.25, dur: 0.45 },
    { at: 4.9, actor: 'ele', do: 'tilt', amount: -8, dur: 0.45 },
    // ④ 哈啾！
    { at: 5.35, actor: 'ele', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 5.35, actor: 'ele', do: 'moveTo', to: { x: EX + 4, y: EG }, dur: 0.15, ease: 'out' },
    { at: 5.35, actor: 'bug', do: 'moveTo', to: { x: 50, y: 14 }, dur: 0.45, ease: 'out' },
    { at: 5.35, actor: 'bug', do: 'spin', times: 3, dur: 0.9 },
    { at: 5.45, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 5.45, actor: 'shroom', do: 'tilt', amount: 25, dur: 0.5 },
    { at: 5.8, actor: 'bug', do: 'moveTo', to: HEAD, arc: 8, dur: 0.5, ease: 'in' },
    // 掉在大象頭上，全身的毛都蓬起來
    { at: 6.3, actor: 'ele', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 6.35, actor: 'bug', do: 'scaleTo', amount: 2.2, dur: 0.35, ease: 'elastic' },
    { at: 6.35, actor: 'bug', do: 'tint', filter: 'brightness(1.15) saturate(1.35)' },
    { at: 6.35, actor: 'bug', do: 'moveTo', to: { x: HEAD.x, y: HEAD.y - 1 }, dur: 0.35, ease: 'back' },
    // ⑤ 大象往上看，兩個一起笑
    { at: 6.7, actor: 'ele', do: 'tilt', amount: 8, dur: 0.6 },
    { at: 7.4, actor: 'bug', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.1, actor: 'ele', do: 'hop', amount: 2, dur: 0.3 },
    { at: 8.1, actor: 'bug', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'ele', dx: 4, dur: 3.0 },
    { at: 1.0, kind: 'pop', actor: 'bug', emoji: '😊', dur: 0.5 },
    { at: 3.0, kind: 'burst', actor: 'bug', emoji: '🪶', n: 4, dur: 0.5 },
    { at: 3.25, kind: 'pop', actor: 'ele', emoji: '😖', dx: -12, dy: 6, dur: 0.6 },
    { at: 4.2, kind: 'zzz', actor: 'ele', dx: 4, dur: 0.9 },
    { at: 4.3, kind: 'pop', actor: 'bug', emoji: '❓', dur: 0.4 },
    { at: 4.75, kind: 'burst', actor: 'bug', emoji: '🪶', n: 6, dur: 0.5 },
    { at: 4.9, kind: 'pop', actor: 'ele', emoji: '🤧', dx: -12, dy: 6, dur: 0.5 },
    { at: 5.35, kind: 'puff', actor: 'ele', n: 16, dur: 0.6 },
    { at: 5.35, kind: 'fountain', actor: 'ele', emoji: '💦', n: 10, dx: -14, dur: 0.7 },
    { at: 5.5, kind: 'burst', actor: 'tree', emoji: '🍃', n: 8, dur: 0.8 },
    { at: 5.6, kind: 'dizzy', actor: 'bug', dur: 0.6 },
    { at: 6.35, kind: 'burst', actor: 'bug', emoji: '🪶', n: 8, dur: 0.8 },
    { at: 6.4, kind: 'puff', actor: 'bug', n: 10, dur: 0.6 },
    { at: 6.95, kind: 'burst', actor: 'bug', emoji: '✨', n: 10, dur: 0.9 },
    { at: 6.5, kind: 'pop', actor: 'ele', emoji: '❗', dx: -10, dur: 0.4 },
    { at: 7.0, kind: 'pop', actor: 'ele', emoji: '😆', dx: -14, dy: 8, dur: 0.9 },
    { at: 7.6, kind: 'burst', actor: 'bug', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 2.9, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 86, y: 60 } },
    { at: 5.35, dur: 0.45, do: 'shake', amount: 1.8 },
    { at: 6.3, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: 100, y: 48 } },
  ],
  lights: [
    { at: 4.9, dur: 0.4, level: 0.2 },
    { at: 5.35, dur: 0.05, level: -0.3 },
    { at: 5.4, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.25, sfx: 'tap' },
    { at: 1.45, sfx: 'tap' },
    { at: 3.0, sfx: 'blip' },
    { at: 3.5, sfx: 'deflate' },
    { at: 4.75, sfx: 'blip' },
    { at: 4.9, sfx: 'deflate' },
    { at: 5.35, sfx: 'achoo' },
    { at: 5.4, sfx: 'whoosh' },
    { at: 6.3, sfx: 'boing' },
    { at: 6.35, sfx: 'poof' },
    { at: 7.0, say: '毛毛蟲' },
    { at: 7.7, sfx: 'cheer' },
  ],
})
