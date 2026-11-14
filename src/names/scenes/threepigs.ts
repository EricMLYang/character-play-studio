// 演的是字面意思：三隻＋小豬——三隻小豬躲在草屋、木頭堆、磚頭房子後面，野狼一路吹過去，最後被三隻小豬一起吹走（老童話，不照任何一部動畫的造型）。
import { scene } from '../../story/scene'

// 下雪的早上：三隻小豬各躲在草屋、木頭堆、磚頭房子後面。野狼衝進來，吸一口氣——呼！草屋飛走，第一隻小豬逃到木頭堆；
// 再一口——木頭滿天飛，兩隻逃進磚頭房子。野狼吸到整張臉漲紅、肚子鼓成球……呼——房子動也不動，只掉下一片雪花（停一拍）。
// 三隻小豬疊成一座塔跳出來，一起吸氣、一起吹：野狼轉著圈飛出畫面。三隻疊在一起亮相：「三隻小豬」。
const G = 71.5 // 小豬（size 13）站在地上的 y
const W = 68.6 // 野狼（size 20）
const HUT = { x: 112, y: 64.4 } // 草屋 size 30
const LOG = { x: 84, y: 69.4 } // 木頭堆 size 18
const HOUSE = { x: 38, y: 61.9 } // 磚頭房子 size 36
const STACK = 9.5 // 疊羅漢一層多高

export default scene({
  duration: 9.8,
  bg: { top: '#9EC9F2', bottom: '#EAF4FF', floor: '#F4F8FF', scenery: 'snow' },
  actors: [
    { id: 'tree', emoji: '🌲', x: 150, y: 61.5, size: 30 },
    { id: 'pig3', emoji: '🐖', x: 32, y: G, size: 13 },
    { id: 'house', emoji: '🏠', x: HOUSE.x, y: HOUSE.y, size: 36 },
    { id: 'flake', emoji: '❄️', x: 40, y: 40, size: 6, hidden: true, float: true },
    { id: 'log', emoji: '🪵', x: LOG.x, y: LOG.y, size: 18, pivot: 'center' },
    { id: 'hut', emoji: '🛖', x: HUT.x, y: HUT.y, size: 30, pivot: 'center' },
    { id: 'pig2', emoji: '🐖', x: 94, y: G, size: 13 },
    { id: 'pig1', emoji: '🐖', x: 126, y: G, size: 13 },
    { id: 'wolf', emoji: '🐺', x: 146, y: W, size: 20 },
    { id: 'gust', emoji: '💨', x: 130, y: 64, size: 12, hidden: true, float: true },
    { id: 'gust2', emoji: '💨', x: 66, y: 56, size: 20, hidden: true, float: true, flip: true },
  ],
  moves: [
    // 野狼衝進來（先往後縮），三隻小豬在各自的掩護後面跳一下
    { at: 0.1, actor: 'wolf', do: 'enter', from: { x: 185, y: W }, dur: 0.7, anticipate: 4, ease: 'back' },
    { at: 0.85, actor: 'pig1', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.95, actor: 'pig2', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.05, actor: 'pig3', do: 'hop', amount: 3, dur: 0.3 },
    // 第一口氣：草屋飛走
    { at: 1.3, actor: 'wolf', do: 'scaleTo', amount: 1.25, dur: 0.45 },
    { at: 1.8, actor: 'wolf', do: 'scaleTo', amount: 0.8, dur: 0.15 },
    { at: 1.8, actor: 'gust', do: 'pop', dur: 0.1 },
    { at: 1.8, actor: 'gust', do: 'moveTo', to: { x: 120, y: 62 }, dur: 0.25, ease: 'out' },
    { at: 2.1, actor: 'gust', do: 'vanish', dur: 0.1 },
    { at: 1.95, actor: 'hut', do: 'moveTo', to: { x: -30, y: 6 }, arc: 12, dur: 0.8, ease: 'in' },
    { at: 1.95, actor: 'hut', do: 'spin', times: -2, dur: 0.8 },
    // 第一隻小豬露出來，嚇一跳，逃到木頭堆
    { at: 2.3, actor: 'pig1', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.6, actor: 'pig1', do: 'moveTo', to: { x: 100, y: G }, dur: 0.4, ease: 'in' },
    // 第二口氣：木頭堆
    { at: 3.0, actor: 'wolf', do: 'moveTo', to: { x: 112, y: W }, dur: 0.45 },
    { at: 3.0, actor: 'gust', do: 'moveTo', to: { x: 102, y: 63 }, dur: 0.1 },
    { at: 3.55, actor: 'wolf', do: 'scaleTo', amount: 1.25, dur: 0.45 },
    { at: 4.05, actor: 'wolf', do: 'scaleTo', amount: 0.8, dur: 0.15 },
    { at: 4.05, actor: 'gust', do: 'pop', dur: 0.1 },
    { at: 4.05, actor: 'gust', do: 'moveTo', to: { x: 86, y: 64 }, dur: 0.22, ease: 'out' },
    { at: 4.3, actor: 'gust', do: 'vanish', dur: 0.1 },
    { at: 4.2, actor: 'log', do: 'moveTo', to: { x: 20, y: 4 }, arc: 10, dur: 0.7, ease: 'in' },
    { at: 4.2, actor: 'log', do: 'spin', times: -3, dur: 0.7 },
    // 兩隻一起逃進磚頭房子
    { at: 4.4, actor: 'pig1', do: 'moveTo', to: { x: 46, y: G }, dur: 0.5, ease: 'in' },
    { at: 4.95, actor: 'pig1', do: 'vanish', dur: 0.1 },
    { at: 5.0, actor: 'pig2', do: 'vanish', dur: 0.1 },
    { at: 4.45, actor: 'pig2', do: 'moveTo', to: { x: 40, y: G }, dur: 0.5, ease: 'in' },
    // 第三口氣：吸到臉漲紅、整個鼓起來
    { at: 4.8, actor: 'wolf', do: 'moveTo', to: { x: 88, y: W }, dur: 0.6 },
    { at: 5.45, actor: 'wolf', do: 'scaleTo', amount: 2.0, dur: 0.7, ease: 'out' },
    { at: 5.45, actor: 'wolf', do: 'tint', filter: 'saturate(1.5) sepia(0.4) hue-rotate(-30deg)' },
    { at: 5.9, actor: 'wolf', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 6.2, actor: 'wolf', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    { at: 6.2, actor: 'wolf', do: 'tint', filter: '' },
    { at: 6.2, actor: 'gust', do: 'moveTo', to: { x: 78, y: 62 }, dur: 0.05 },
    { at: 6.25, actor: 'gust', do: 'pop', dur: 0.1 },
    { at: 6.25, actor: 'gust', do: 'moveTo', to: { x: 54, y: 60 }, dur: 0.25, ease: 'out' },
    { at: 6.55, actor: 'gust', do: 'vanish', dur: 0.1 },
    // 房子動也不動……只掉下一片雪花
    { at: 6.5, actor: 'flake', do: 'pop', dur: 0.15 },
    { at: 6.5, actor: 'flake', do: 'moveTo', to: { x: 44, y: 70 }, dur: 0.7, ease: 'linear' },
    { at: 6.5, actor: 'wolf', do: 'tilt', amount: -8, dur: 0.5 },
    // 三隻小豬疊成一座塔跳出來
    { at: 7.0, actor: 'pig3', do: 'moveTo', to: { x: 64, y: G }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 7.08, actor: 'pig2', do: 'pop', dur: 0.1 },
    { at: 7.16, actor: 'pig1', do: 'pop', dur: 0.1 },
    { at: 7.08, actor: 'pig2', do: 'moveTo', to: { x: 64, y: G - STACK }, arc: 8, dur: 0.3, ease: 'out' },
    { at: 7.16, actor: 'pig1', do: 'moveTo', to: { x: 64, y: G - STACK * 2 }, arc: 10, dur: 0.3, ease: 'out' },
    { at: 7.0, actor: 'flake', do: 'vanish', dur: 0.1 },
    { at: 7.3, actor: 'pig1', do: 'flip' },
    { at: 7.3, actor: 'pig2', do: 'flip' },
    { at: 7.3, actor: 'pig3', do: 'flip' },
    // 一起吸氣、一起吹：野狼轉著圈飛出去
    { at: 7.5, actor: 'pig1', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 7.5, actor: 'pig2', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 7.5, actor: 'pig3', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 7.75, actor: 'gust2', do: 'pop', dur: 0.1 },
    { at: 7.75, actor: 'gust2', do: 'moveTo', to: { x: 82, y: 58 }, dur: 0.25, ease: 'out' },
    { at: 8.05, actor: 'gust2', do: 'vanish', dur: 0.1 },
    { at: 7.85, actor: 'wolf', do: 'moveTo', to: { x: 200, y: 6 }, arc: 10, dur: 0.6, ease: 'in' },
    { at: 7.85, actor: 'wolf', do: 'spin', times: 3, dur: 0.6 },
    // 亮相
    { at: 8.2, actor: 'pig1', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.3, actor: 'pig2', do: 'hop', amount: 2, dur: 0.3 },
    { at: 8.4, actor: 'pig3', do: 'hop', amount: 1.5, dur: 0.3 },
  ],
  fx: [
    { at: 0.8, kind: 'puff', actor: 'wolf', dur: 0.4 },
    { at: 0.9, kind: 'pop', actor: 'pig1', emoji: '❗', dur: 0.45 },
    { at: 1.85, kind: 'burst', actor: 'hut', emoji: '🌾', n: 6, dur: 0.7 },
    { at: 2.3, kind: 'pop', actor: 'pig1', emoji: '😱', dx: -6, dur: 0.5 },
    { at: 2.4, kind: 'sweat', actor: 'pig1' },
    { at: 4.15, kind: 'burst', actor: 'log', emoji: '🪵', n: 5, dur: 0.7 },
    { at: 5.5, kind: 'sweat', actor: 'wolf' },
    { at: 6.25, kind: 'puff', actor: 'house', n: 6, dur: 0.5 },
    { at: 6.75, kind: 'pop', actor: 'wolf', emoji: '😑', dx: 10, dur: 0.6 },
    { at: 7.85, kind: 'puff', actor: 'pig3', n: 8, dur: 0.6 },
    { at: 7.9, kind: 'burst', actor: 'wolf', emoji: '💫', n: 6, dur: 0.6 },
    { at: 8.2, kind: 'burst', actor: 'pig1', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 8.3, kind: 'burst', actor: 'pig2', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 5.4, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 66, y: 55 } },
    { at: 6.2, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 6.4, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 7.8, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: 8.0, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 70, y: 60 } },
  ],
  lights: [
    { at: 5.45, dur: 0.6, level: 0.2 },
    { at: 6.4, dur: 0.3, level: 0 },
    { at: 7.8, dur: 0.05, level: -0.4 },
    { at: 7.85, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.9, sfx: 'blip' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 1.95, sfx: 'poof' },
    { at: 4.05, sfx: 'whoosh' },
    { at: 4.2, sfx: 'clink' },
    { at: 5.45, sfx: 'bubble' },
    { at: 6.2, sfx: 'deflate' },
    { at: 6.6, sfx: 'tap' },
    { at: 7.0, sfx: 'boing' },
    { at: 7.8, sfx: 'whoosh' },
    { at: 8.15, say: '三隻小豬' },
    { at: 8.4, sfx: 'cheer' },
  ],
})
