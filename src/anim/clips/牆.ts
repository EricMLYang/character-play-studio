import type { Clip } from '../clip'

// 牆：積木小隊疊成一座搖搖晃晃的高塔，踮著腳偷偷走過去，想拿回被小老鼠當枕頭的金色積木；每走一步就「吱」一聲，老鼠耳朵抖一下，高塔就僵住。
// 指尖剛碰到——老鼠睜眼，兩邊鼻子對鼻子尖叫，高塔往後倒，積木散開又一塊塊疊成「牆」。老鼠躲到一小面牆壁後面；結尾積木又吱一聲，老鼠秒躲。牆、牆、牆壁
const clip: Clip = {
  char: '牆',
  meta: { theme: '偷拿金積木', cast: '積木小隊高塔＋小老鼠＋金色積木', gags: ['踮腳每步都吱', '對看尖叫', '高塔倒下變字', '吱一聲秒躲回馬槍'] },
  duration: 10,
  bg: { top: '#FFF1C9', bottom: '#FFF9E6', floor: '#E7C79A', scenery: 'room' },
  actors: [
    { id: 'gold', emoji: '🟨', x: 149, y: 74.5, size: 5 },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 140, y: 71.5, size: 13 },
    { id: 'wall', emoji: '🧱', x: 140, y: 73, size: 10, hidden: true },
    { id: 'tower', emoji: 'hero:brick/stack', x: 12, y: 67, size: 22, flip: true, hidden: true },
    { id: 'squad', emoji: 'hero:brick/dizzy', x: 24, y: 72, size: 11, hidden: true },
  ],
  moves: [
    // 高塔從左邊探頭進來
    { at: 0, actor: 'tower', do: 'enter', from: { x: -20, y: 67 }, dur: 0.6, ease: 'out' },
    { at: 0.8, actor: 'tower', do: 'tilt', amount: 6, dur: 0.4 },
    // 誇張的高抬腿踮腳：三步，每步更晃
    { at: 1.6, actor: 'tower', do: 'moveTo', to: { x: 50, y: 67 }, arc: 4, dur: 0.35 },
    { at: 1.95, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.2 },
    { at: 2.0, actor: 'tower', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 2.4, actor: 'tower', do: 'moveTo', to: { x: 86, y: 67 }, arc: 4, dur: 0.35 },
    { at: 2.75, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.2 },
    { at: 2.8, actor: 'tower', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 3.2, actor: 'tower', do: 'moveTo', to: { x: 122, y: 67 }, arc: 4, dur: 0.35 },
    { at: 3.55, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.2 },
    { at: 3.6, actor: 'tower', do: 'tilt', amount: 18, dur: 0.5 },
    // 老鼠睜眼，鼻子對鼻子，一起尖叫
    { at: 4.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 4.0, actor: 'tower', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.35, actor: 'mouse', do: 'hop', amount: 10, dur: 0.45 },
    // 高塔往後倒
    { at: 4.4, actor: 'tower', do: 'rotateTo', amount: -90, dur: 0.35, ease: 'in' },
    { at: 4.4, actor: 'tower', do: 'moveTo', to: { x: 122, y: 58 }, dur: 0.35, ease: 'in' },
    { at: 4.75, actor: 'tower', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 4.8, actor: 'tower', do: 'vanish', dur: 0.15 },
    // 最底下那塊彈到左下角，暈頭轉向
    { at: 4.8, actor: 'squad', do: 'enter', from: { x: 110, y: 66 }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 4.8, actor: 'squad', do: 'spin', times: 2, dur: 0.5 },
    // 老鼠躲進一小面牆壁後面，抱著金積木探頭
    { at: 5.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 6.9, actor: 'wall', do: 'pop', dur: 0.3 },
    { at: 6.95, actor: 'gold', do: 'moveTo', to: { x: 147, y: 66 }, dur: 0.3, ease: 'back' },
    { at: 7.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 7.6, actor: 'squad', do: 'swap', emoji: 'hero:brick/happy' },
    // 回馬槍：小積木一動，又「吱」一聲，老鼠秒躲到牆後面
    { at: 8.3, actor: 'squad', do: 'hop', amount: 2, dur: 0.25 },
    { at: 8.4, actor: 'mouse', do: 'moveTo', to: { x: 140, y: 79 }, dur: 0.12, ease: 'out' },
    { at: 8.4, actor: 'gold', do: 'moveTo', to: { x: 147, y: 75 }, dur: 0.12, ease: 'out' },
    { at: 8.6, actor: 'squad', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 9.0, actor: 'mouse', do: 'moveTo', to: { x: 140, y: 71.5 }, dur: 0.3, ease: 'back' },
    { at: 9.3, actor: 'squad', do: 'swap', emoji: 'hero:brick/happy' },
  ],
  builds: [
    // 倒下的積木彈開，左邊站成爿、右邊疊成嗇，最後一塊落進右下的回
    { at: 4.85, dur: 0.45, strokes: [0, 1, 2, 3], from: 'tower', color: '#C0392B' },
    { at: 5.3, dur: 0.55, strokes: [4, 5, 6, 7, 8, 9, 10], from: 'tower', color: '#D9480F' },
    { at: 5.85, dur: 0.45, strokes: [11, 12, 13, 14, 15, 16], from: 'tower', color: '#C0392B' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'mouse', dur: 3.9 },
    { at: 0.7, kind: 'pop', actor: 'tower', emoji: '👀', dur: 0.4 },
    { at: 1.1, kind: 'pop', actor: 'tower', emoji: '👉', dur: 0.4 },
    { at: 2.0, kind: 'sweat', actor: 'tower' },
    { at: 2.8, kind: 'sweat', actor: 'tower' },
    { at: 3.6, kind: 'sweat', actor: 'tower' },
    { at: 4.05, kind: 'pop', actor: 'mouse', emoji: '😱', dur: 0.5 },
    { at: 4.05, kind: 'pop', actor: 'tower', emoji: '😱', dur: 0.5 },
    { at: 4.75, kind: 'burst', actor: 'tower', n: 1, dur: 0.35 },
    { at: 4.75, kind: 'puff', actor: 'tower', dur: 0.5 },
    { at: 5.3, kind: 'dizzy', actor: 'squad', dur: 1.5 },
    { at: 7.7, kind: 'pop', actor: 'squad', emoji: '👍', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'wall', emoji: '❗', dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'mouse', emoji: '😜', dur: 0.5, dx: -6 },
  ],
  camera: [
    { at: 3.5, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 130, y: 58 } },
    { at: 4.4, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.75, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.15, say: '牆' },
    { at: 1.9, sfx: 'blip' },
    { at: 2.7, sfx: 'blip' },
    { at: 3.5, sfx: 'blip' },
    { at: 4.75, sfx: 'bonk' },
    { at: 6.3, say: '牆' },
    { at: 6.9, sfx: 'plop' },
    { at: 6.95, say: '牆壁' },
    { at: 8.3, sfx: 'blip' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
