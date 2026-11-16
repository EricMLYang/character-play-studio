import type { Clip } from '../clip'

// 空：小外星人開著飛碟想用牽引光束搶玩具戰士亮晶晶的圓盾——光束卻只吸走了劍，戰士兩手空空。戰士搶回劍、大力一揮揮空，自己轉成陀螺；
// 外星人再射一次，光束竟然吸住自己的飛碟，連人帶碟轉上天。兩個轉到中間「咚」撞頭坐倒，光束一斷，頂蓋、盤緣、光點、劍和盾牌掉下來疊成「空」。
// 兩個抬頭看上面空空的藍天；結果沒人開的飛碟自己飄回來，光束又把戰士吸上去。空、空、天空
const clip: Clip = {
  char: '空',
  meta: { theme: '光束搶盾牌', cast: '小外星人＋玩具戰士＋飛碟＋劍和盾', gags: ['光束吸錯東西', '揮空自己轉成陀螺', '吸住自己的飛碟', '撞頭坐倒', '沒人開的飛碟又吸人'] },
  duration: 10,
  bg: { top: '#BFEAFF', bottom: '#FFF4D6', floor: '#F2E2B8', scenery: 'desert' },
  actors: [
    { id: 'cloud', emoji: '☁️', x: 175, y: 7, size: 8, float: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 134, y: 71, size: 14 },
    { id: 'shield', emoji: '🛡️', x: 127, y: 68, size: 7 },
    { id: 'sword', emoji: '🗡️', x: 142, y: 62, size: 7 },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 30, y: 36, size: 15, hidden: true, float: true, flip: true },
    { id: 'saucer', emoji: '🛸', x: 175, y: 28, size: 11, float: true },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'enter', from: { x: -20, y: 30 }, dur: 0.7, ease: 'out' },
    { at: 0.2, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 0.2, actor: 'warrior', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.7, actor: 'alien', do: 'shake', amount: 1, dur: 0.4 },
    // 飛到戰士頭上，光束一開——只吸走了劍
    { at: 1.0, actor: 'alien', do: 'moveTo', to: { x: 128, y: 30 }, dur: 0.4, ease: 'out' },
    { at: 1.5, actor: 'sword', do: 'moveTo', to: { x: 128, y: 40 }, dur: 0.4, ease: 'in' },
    { at: 1.5, actor: 'sword', do: 'spin', times: 1, dur: 0.4 },
    { at: 1.6, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    // 戰士跳起來搶回劍，外星人退回左邊
    { at: 2.2, actor: 'warrior', do: 'hop', amount: 10, dur: 0.4 },
    { at: 2.3, actor: 'sword', do: 'moveTo', to: { x: 142, y: 62 }, dur: 0.25 },
    { at: 2.3, actor: 'alien', do: 'moveTo', to: { x: 36, y: 34 }, dur: 0.5, ease: 'out' },
    { at: 2.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    // 大力一揮——揮空，自己轉成陀螺
    { at: 2.6, actor: 'warrior', do: 'tilt', amount: -20, dur: 0.3 },
    { at: 2.9, actor: 'warrior', do: 'spin', times: 3, dur: 0.8 },
    { at: 2.9, actor: 'sword', do: 'moveTo', to: { x: 126, y: 62 }, dur: 0.4 },
    { at: 3.3, actor: 'sword', do: 'moveTo', to: { x: 142, y: 62 }, dur: 0.4 },
    { at: 3.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    // 外星人再射一次——吸住自己的飛碟，連人帶碟轉上天
    { at: 3.0, actor: 'alien', do: 'moveTo', to: { x: 36, y: 16 }, dur: 0.6, ease: 'out' },
    { at: 3.2, actor: 'alien', do: 'spin', times: 2, dur: 0.7 },
    { at: 3.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    // 兩個轉到中間，停一拍，「咚」！
    { at: 4.0, actor: 'alien', do: 'moveTo', to: { x: 74, y: 62 }, dur: 0.45, ease: 'in' },
    { at: 4.0, actor: 'warrior', do: 'moveTo', to: { x: 88, y: 71 }, dur: 0.45, ease: 'in' },
    { at: 4.0, actor: 'shield', do: 'moveTo', to: { x: 81, y: 68 }, dur: 0.45, ease: 'in' },
    { at: 4.0, actor: 'sword', do: 'moveTo', to: { x: 96, y: 62 }, dur: 0.45, ease: 'in' },
    { at: 4.6, actor: 'alien', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.6, actor: 'warrior', do: 'squash', amount: 0.3, dur: 0.25 },
    // 光束一斷，東西全掉下來；兩個彈開坐倒
    { at: 4.75, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 4.75, actor: 'alien', do: 'moveTo', to: { x: 28, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 4.75, actor: 'warrior', do: 'moveTo', to: { x: 134, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 5.4, actor: 'sword', do: 'vanish', dur: 0.2 },
    { at: 5.6, actor: 'shield', do: 'vanish', dur: 0.2 },
    // 抬頭看空空的藍天，一朵小雲慢慢飄過
    { at: 6.4, actor: 'cloud', do: 'moveTo', to: { x: -15, y: 7 }, dur: 3.4, ease: 'linear' },
    { at: 6.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 6.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.9, actor: 'alien', do: 'tilt', amount: -12, dur: 0.8 },
    { at: 6.9, actor: 'warrior', do: 'tilt', amount: 12, dur: 0.8 },
    // 回馬槍：沒人開的飛碟自己飄回來，光束又把戰士吸上去
    { at: 8.0, actor: 'saucer', do: 'moveTo', to: { x: 134, y: 26 }, dur: 0.5, ease: 'out' },
    { at: 8.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 8.6, actor: 'warrior', do: 'moveTo', to: { x: 134, y: 50 }, dur: 0.5, ease: 'out' },
    { at: 8.7, actor: 'warrior', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 9.2, actor: 'warrior', do: 'moveTo', to: { x: 134, y: 71 }, dur: 0.35, ease: 'bounce' },
    { at: 9.55, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 9.3, actor: 'saucer', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.8, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 9.5, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
  ],
  builds: [
    // 頂蓋 → 點、盤緣 → 宀、光點 → 八、劍 → 工的上橫、盾牌 → 中間一豎和底橫
    { at: 4.8, dur: 0.3, strokes: [0], from: 'alien', color: '#2F9E44' },
    { at: 4.95, dur: 0.45, strokes: [1, 2], from: 'alien', color: '#2F9E44' },
    { at: 5.2, dur: 0.4, strokes: [3, 4], from: { x: 60, y: 20 }, color: '#40C057' },
    { at: 5.4, dur: 0.3, strokes: [5], from: 'sword', color: '#2F9E44' },
    { at: 5.6, dur: 0.45, strokes: [6, 7], from: 'shield', color: '#2F9E44' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'alien', emoji: '😋', dur: 0.5 },
    { at: 1.4, kind: 'beam', actor: 'alien', n: 16, dur: 0.6 },
    { at: 1.7, kind: 'pop', actor: 'warrior', emoji: '❓', dur: 0.5 },
    { at: 2.9, kind: 'burst', actor: 'warrior', emoji: '💨', n: 5, dur: 0.6 },
    { at: 3.0, kind: 'line', actor: 'alien', to: { x: 36, y: 6 }, color: '#F783AC', width: 2.5, dur: 0.6 },
    { at: 3.7, kind: 'dizzy', actor: 'warrior', dur: 0.6 },
    { at: 4.6, kind: 'burst', x: 81, y: 56, n: 1, dur: 0.5 },
    { at: 5.25, kind: 'dizzy', actor: 'alien', dur: 0.9 },
    { at: 5.25, kind: 'dizzy', actor: 'warrior', dur: 0.9 },
    { at: 8.5, kind: 'beam', actor: 'saucer', n: 18, dur: 0.75 },
    { at: 8.8, kind: 'pop', actor: 'alien', emoji: '😅', dur: 0.6 },
  ],
  camera: [
    { at: 2.9, dur: 0.6, do: 'zoom', amount: 1.2, to: { x: 80, y: 45 } },
    { at: 4.45, dur: 0.15, do: 'zoom', amount: 1 },
    { at: 4.6, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 81, y: 62 } },
  ],
  cues: [
    { at: 1.4, sfx: 'laser' },
    { at: 1.6, say: '空' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.0, sfx: 'laser' },
    { at: 4.6, sfx: 'bonk' },
    { at: 6.05, say: '空' },
    { at: 6.95, say: '天空' },
    { at: 8.5, sfx: 'laser' },
    { at: 9.2, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
