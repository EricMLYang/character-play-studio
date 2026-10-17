import type { Clip } from '../clip'

// 媽（豬探長肚皮滑壘）：豬探長拿放大鏡追著地上的蹄印，一路指到一排木瓶。第一次撲出去，放大鏡先著地，整隻豬原地轉成陀螺，
// 鼻子停在木瓶前面差一點點；退更遠、肚皮滑壘衝過去——全倒！木瓶飛起來排成「媽」，豬媽媽走過來摸摸他的頭。
// 回馬槍：他又用放大鏡追新的蹄印，一回頭——腳印的主人就是媽媽。媽、媽、媽媽
const clip: Clip = {
  char: '媽',
  meta: { theme: '豬探長肚皮滑壘', cast: '豬探長＋木瓶＋豬媽媽', gags: ['放大鏡著地轉成陀螺差一點', '肚皮滑壘全倒', '腳印的主人就在背後'] },
  duration: 10,
  bg: { top: '#FFF6E8', bottom: '#FCEBD5', floor: '#CFF0E0', scenery: 'room' },
  actors: [
    { id: 'h1', emoji: '🐾', x: 38, y: 75.5, size: 5, hidden: true, float: true },
    { id: 'h2', emoji: '🐾', x: 50, y: 75.5, size: 5, hidden: true, float: true },
    { id: 'h3', emoji: '🐾', x: 62, y: 75.5, size: 5, hidden: true, float: true },
    { id: 'q1', emoji: '🐾', x: 150, y: 75.5, size: 5, hidden: true, float: true },
    { id: 'q2', emoji: '🐾', x: 157, y: 75.5, size: 5, hidden: true, float: true },
    { id: 'p1', emoji: '🎳', x: 104, y: 72.8, size: 10 },
    { id: 'p2', emoji: '🎳', x: 112, y: 72.8, size: 10 },
    { id: 'p3', emoji: '🎳', x: 120, y: 72.8, size: 10 },
    { id: 'p4', emoji: '🎳', x: 128, y: 72.8, size: 10 },
    { id: 'mama', emoji: '🐖', x: 124, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 22, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 滑進來，放大鏡貼地：蹄印！
    { at: 0, actor: 'pig', do: 'enter', from: { x: -14, y: 71.1 }, dur: 0.5, ease: 'back' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 0.5, actor: 'h1', do: 'pop' }, { at: 0.65, actor: 'h2', do: 'pop' }, { at: 0.8, actor: 'h3', do: 'pop' },
    { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 1.0, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
    // 往後退、蹄子刨地蓄力
    { at: 1.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 1.4, actor: 'pig', do: 'moveTo', to: { x: 14, y: 71.1 }, dur: 0.3 },
    { at: 1.6, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.3 },
    // 第一次撲：放大鏡先著地，原地轉成陀螺
    { at: 1.9, actor: 'pig', do: 'moveTo', to: { x: 80, y: 71.1 }, dur: 0.4, ease: 'in' },
    { at: 2.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.3, actor: 'pig', do: 'spin', times: 3, dur: 0.6 },
    { at: 2.3, actor: 'pig', do: 'moveTo', to: { x: 95, y: 71.1 }, dur: 0.6, ease: 'out' },
    { at: 2.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 2.9, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 2.9, actor: 'p1', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 2.95, actor: 'p2', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 3.0, actor: 'p3', do: 'tilt', amount: 5, dur: 0.4 },
    // 眨眨眼，退到更遠
    { at: 3.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 3.5, actor: 'pig', do: 'moveTo', to: { x: 8, y: 71.1 }, dur: 0.45 },
    { at: 3.5, actor: 'h1', do: 'vanish' }, { at: 3.55, actor: 'h2', do: 'vanish' }, { at: 3.6, actor: 'h3', do: 'vanish' },
    // 肚皮滑壘！
    { at: 4.0, actor: 'pig', do: 'moveTo', to: { x: 50, y: 71.1 }, dur: 0.25, anticipate: 5, ease: 'in' },
    { at: 4.25, actor: 'pig', do: 'rotateTo', amount: 90, dur: 0.12 },
    { at: 4.25, actor: 'pig', do: 'moveTo', to: { x: 140, y: 66 }, dur: 0.55, ease: 'out' },
    // 全倒！木瓶飛起來
    { at: 4.45, actor: 'p1', do: 'moveTo', to: { x: 92, y: 30 }, dur: 0.3, ease: 'out' },
    { at: 4.45, actor: 'p1', do: 'spin', times: 2, dur: 0.3 },
    { at: 4.5, actor: 'p2', do: 'moveTo', to: { x: 104, y: 22 }, dur: 0.3, ease: 'out' },
    { at: 4.5, actor: 'p2', do: 'spin', times: 2, dur: 0.3 },
    { at: 4.55, actor: 'p3', do: 'moveTo', to: { x: 120, y: 26 }, dur: 0.3, ease: 'out' },
    { at: 4.55, actor: 'p3', do: 'spin', times: 2, dur: 0.3 },
    { at: 4.6, actor: 'p4', do: 'moveTo', to: { x: 134, y: 34 }, dur: 0.3, ease: 'out' },
    { at: 4.6, actor: 'p4', do: 'spin', times: 2, dur: 0.3 },
    { at: 4.75, actor: 'p1', do: 'vanish', dur: 0.2 },
    { at: 4.85, actor: 'p2', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'p3', do: 'vanish', dur: 0.2 },
    { at: 5.4, actor: 'p4', do: 'vanish', dur: 0.2 },
    // 爬起來擺勝利姿勢
    { at: 5.2, actor: 'pig', do: 'rotateTo', amount: -90, dur: 0.25 },
    { at: 5.2, actor: 'pig', do: 'moveTo', to: { x: 140, y: 71.1 }, dur: 0.25, ease: 'back' },
    { at: 5.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 5.5, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
    // 豬媽媽從字後面探出頭，走過來摸摸他
    { at: 6.6, actor: 'mama', do: 'pop', dur: 0.35 },
    { at: 7.0, actor: 'mama', do: 'moveTo', to: { x: 128, y: 71.1 }, dur: 0.4 },
    { at: 7.0, actor: 'mama', do: 'bounce', amount: 1.2, times: 3, dur: 0.4 },
    { at: 7.45, actor: 'mama', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 7.5, actor: 'pig', do: 'squash', amount: 0.15, dur: 0.3 },
    // 回馬槍：又發現新的蹄印……一路追……一回頭——是媽媽的！
    { at: 8.0, actor: 'q1', do: 'pop' }, { at: 8.15, actor: 'q2', do: 'pop' },
    { at: 8.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 8.1, actor: 'pig', do: 'moveTo', to: { x: 146, y: 71.1 }, dur: 0.35 },
    { at: 8.65, actor: 'pig', do: 'flip' },
    { at: 8.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.65, actor: 'pig', do: 'hop', amount: 5, dur: 0.3 },
    { at: 9.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 9.1, actor: 'mama', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 左邊兩支木瓶 → 女；右邊兩支轉著落下 → 馬
    { at: 4.75, dur: 0.5, strokes: [0, 1, 2], from: 'p1', color: '#E03157' },
    { at: 5.0, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8], from: 'p3', color: '#E03157' },
    { at: 5.4, dur: 0.7, strokes: [9, 10, 11, 12], from: 'p4', color: '#C2255C' },
  ],
  glyph: [{ at: 6.1, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.6 },
    { at: 1.6, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 2.4, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 2.9, kind: 'dizzy', actor: 'pig', dur: 0.8 },
    { at: 3.2, kind: 'bubble', actor: 'pig', emoji: '😑', dur: 0.5 },
    { at: 4.45, kind: 'burst', actor: 'p1', emoji: '💥', dur: 0.4 },
    { at: 4.5, kind: 'burst', actor: 'p2', emoji: '⭐', n: 6, dur: 0.6 },
    { at: 7.5, kind: 'pop', actor: 'pig', emoji: '💕', dur: 0.8 },
    { at: 8.65, kind: 'pop', actor: 'pig', emoji: '❗', dx: -10, dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'mama', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    // 第一次轉陀螺推近；滑壘跟拍，木瓶飛起來就退回全景
    { at: 2.4, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 94, y: 64 } },
    { at: 4.0, dur: 0.25, do: 'follow', actor: 'pig', amount: 1.3 },
    { at: 4.5, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.45, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 0.05, sfx: 'slide' },
    { at: 1.45, say: '媽' },
    { at: 1.9, sfx: 'whoosh' },
    { at: 2.3, sfx: 'slide' },
    { at: 2.9, sfx: 'bonk' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.25, sfx: 'slide' },
    { at: 4.45, sfx: 'crack' },
    { at: 6.1, say: '媽' },
    { at: 6.65, say: '媽媽' },
    { at: 8.0, sfx: 'tap' },
    { at: 8.65, sfx: 'boing' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
