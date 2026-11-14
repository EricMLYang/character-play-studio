// 演的是字面意思：外（外面）＋星（星星）＋人——從別的星星來的人，開著飛碟用光束想吸一個甜甜圈，一直吸錯。
import { scene } from '../../story/scene'

// 月球上：飛碟咻地飛進來，外星人看到石頭上有一個甜甜圈，好想吃。第一道光束——吸起來的是旁邊的石頭（咚，丟回去）；
// 第二道——吸起來的是一頭牛，倒栽蔥飄上來哞哞叫（又丟回去）。第三道對準甜甜圈……停一拍……甜甜圈抖一抖，動都不動。
// 外星人乾脆跳下飛碟，自己走過去拿起甜甜圈——光束還開著，把他連人帶甜甜圈一起吸上去！他在光裡飄著大口咬：「外星人」。
const FLY = 34 // 飛碟飄著的高度
const ROCK1 = { x: 54, y: 70.3 } // 第一顆石頭（size 16）
const COW = { x: 92, y: 67.8 } // 牛（size 22）
const ROCK2 = { x: 126, y: 70.3 } // 放甜甜圈的石頭（size 16）
const DONUT = { x: 126, y: 60.5 }
const A = 69.4 // 外星人（size 18）站在地上的 y

export default scene({
  duration: 9.6,
  bg: { top: '#120C35', bottom: '#3B2F73', floor: '#9C95B8', scenery: 'space' },
  actors: [
    { id: 'rocket', emoji: '🚀', x: 16, y: 66.1, size: 26 },
    { id: 'rock1', emoji: '🪨', x: ROCK1.x, y: ROCK1.y, size: 16, pivot: 'center' },
    { id: 'rock2', emoji: '🪨', x: ROCK2.x, y: ROCK2.y, size: 16 },
    { id: 'donut', emoji: '🍩', x: DONUT.x, y: DONUT.y, size: 11, pivot: 'center' },
    { id: 'cow', emoji: '🐄', x: COW.x, y: COW.y, size: 22, pivot: 'center' },
    { id: 'alien', emoji: 'hero:alien/surprised', x: ROCK2.x - 12, y: 44, size: 18, hidden: true },
    { id: 'ufo', emoji: 'hero:alien/saucer', x: ROCK1.x, y: FLY, size: 32, float: true },
  ],
  moves: [
    // 飛碟咻地飛進來，晃一晃停住
    { at: 0, actor: 'ufo', do: 'enter', from: { x: -25, y: 10 }, dur: 0.8, ease: 'back' },
    { at: 0.8, actor: 'ufo', do: 'tilt', amount: 10, dur: 0.4 },
    // 第一道光束：吸起石頭……丟回去
    { at: 1.5, actor: 'rock1', do: 'moveTo', to: { x: ROCK1.x, y: 48 }, dur: 0.6, ease: 'out' },
    { at: 1.5, actor: 'rock1', do: 'spin', times: 1, dur: 0.8 },
    { at: 2.3, actor: 'ufo', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 2.35, actor: 'rock1', do: 'moveTo', to: ROCK1, dur: 0.3, ease: 'in' },
    // 第二道：飛到牛上面，吸起一頭牛（倒栽蔥）……又丟回去
    { at: 2.75, actor: 'ufo', do: 'moveTo', to: { x: COW.x, y: FLY }, dur: 0.4 },
    { at: 3.2, actor: 'cow', do: 'moveTo', to: { x: COW.x, y: 55 }, dur: 0.55, ease: 'out' },
    { at: 3.2, actor: 'cow', do: 'rotateTo', amount: 180, dur: 0.5 },
    { at: 3.4, actor: 'cow', do: 'shake', amount: 1, dur: 0.6 },
    { at: 4.0, actor: 'cow', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 4.0, actor: 'cow', do: 'moveTo', to: COW, dur: 0.3, ease: 'in' },
    // 第三道：對準甜甜圈……抖一抖，動都不動
    { at: 4.4, actor: 'ufo', do: 'moveTo', to: { x: ROCK2.x, y: FLY }, dur: 0.4 },
    { at: 4.9, actor: 'donut', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 5.25, actor: 'ufo', do: 'squash', amount: 0.15, dur: 0.3 },
    // 外星人自己跳下飛碟，走過去拿甜甜圈
    { at: 5.7, actor: 'ufo', do: 'swap', emoji: '🛸' },
    { at: 5.7, actor: 'ufo', do: 'scaleTo', amount: 0.8, dur: 0.01 },
    { at: 5.7, actor: 'alien', do: 'pop', dur: 0.15 },
    { at: 5.75, actor: 'alien', do: 'moveTo', to: { x: ROCK2.x - 12, y: A }, dur: 0.35, ease: 'in' },
    { at: 6.15, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 6.2, actor: 'donut', do: 'moveTo', to: { x: ROCK2.x - 8, y: 64 }, arc: 4, dur: 0.25 },
    // 光束還開著：連人帶甜甜圈一起吸上去
    { at: 6.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 6.65, actor: 'alien', do: 'moveTo', to: { x: ROCK2.x - 6, y: 62 }, dur: 0.55, ease: 'out' },
    { at: 6.65, actor: 'donut', do: 'moveTo', to: { x: ROCK2.x - 1, y: 56 }, dur: 0.55, ease: 'out' },
    { at: 6.65, actor: 'alien', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
    // 在光裡飄著，大口咬甜甜圈：亮相
    { at: 7.25, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.25, actor: 'alien', do: 'moveTo', to: { x: ROCK2.x - 6, y: 66 }, dur: 0.35, ease: 'back' },
    { at: 7.2, actor: 'ufo', do: 'moveTo', to: { x: ROCK2.x, y: 23 }, dur: 0.4, ease: 'out' },
    { at: 7.25, actor: 'alien', do: 'scaleTo', amount: 1.5, dur: 0.35, ease: 'back' },
    { at: 7.25, actor: 'donut', do: 'moveTo', to: { x: ROCK2.x + 12, y: 52 }, dur: 0.35, ease: 'back' },
    { at: 7.25, actor: 'donut', do: 'scaleTo', amount: 1.3, dur: 0.35, ease: 'back' },
    { at: 8.0, actor: 'donut', do: 'scaleTo', amount: 0.75, dur: 0.15 },
    { at: 8.0, actor: 'alien', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 8.3, actor: 'cow', do: 'hop', amount: 4, dur: 0.35 },
  ],
  fx: [
    { at: 0.85, kind: 'puff', actor: 'ufo', dur: 0.4 },
    { at: 1.0, kind: 'bubble', actor: 'ufo', emoji: '🍩', dur: 0.9 },
    { at: 1.45, kind: 'beam', actor: 'ufo', n: 16, dur: 0.85 },
    { at: 2.3, kind: 'pop', actor: 'ufo', emoji: '❌', dx: 12, dur: 0.4 },
    { at: 2.65, kind: 'puff', actor: 'rock1', dur: 0.4 },
    { at: 3.15, kind: 'beam', actor: 'ufo', n: 18, dur: 0.85 },
    { at: 3.4, kind: 'pop', actor: 'cow', emoji: '😱', dx: 10, dur: 0.6 },
    { at: 3.95, kind: 'pop', actor: 'ufo', emoji: '😅', dx: 12, dur: 0.4 },
    { at: 4.3, kind: 'dizzy', actor: 'cow', dur: 1.2 },
    { at: 4.85, kind: 'beam', actor: 'ufo', n: 14, dur: 2.35 },
    { at: 5.3, kind: 'pop', actor: 'ufo', emoji: '😑', dx: 12, dur: 0.45 },
    { at: 5.7, kind: 'puff', actor: 'ufo', dur: 0.4 },
    { at: 6.2, kind: 'pop', actor: 'alien', emoji: '😋', dx: -8, dur: 0.4 },
    { at: 6.65, kind: 'pop', actor: 'alien', emoji: '😱', dx: -9, dur: 0.45 },
    { at: 7.25, kind: 'burst', actor: 'alien', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'donut', emoji: '🟤', n: 5, dur: 0.6 },
    { at: 8.2, kind: 'burst', actor: 'alien', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 8.35, kind: 'pop', actor: 'cow', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 2.65, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.3, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 6.6, dur: 0.5, do: 'punch', amount: 0.15, to: { x: ROCK2.x - 8, y: 55 } },
    { at: 7.2, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 126, y: 58 } },
  ],
  lights: [
    { at: 1.45, dur: 0.05, level: -0.15 },
    { at: 1.5, dur: 0.3, level: 0 },
    { at: 3.15, dur: 0.05, level: -0.15 },
    { at: 3.2, dur: 0.3, level: 0 },
    { at: 6.6, dur: 0.05, level: -0.3 },
    { at: 6.65, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 1.45, sfx: 'laser' },
    { at: 2.65, sfx: 'bonk' },
    { at: 3.15, sfx: 'laser' },
    { at: 4.3, sfx: 'plop' },
    { at: 4.85, sfx: 'laser' },
    { at: 5.3, sfx: 'deflate' },
    { at: 5.75, sfx: 'boing' },
    { at: 6.6, sfx: 'whoosh' },
    { at: 7.4, say: '外星人' },
    { at: 8.0, sfx: 'gulp' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
