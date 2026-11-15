import type { Clip } from '../clip'

// 長：披風英雄站在彈射板上，指著遠處的鈴鐺要一飛命中；布忍者跑出來揮旗卻踩到開關，英雄被彈上天，太長的披風蓋住頭，盲飛過鈴鐺、撞上軟牆、
// 倒栽蔥插進水桶。撞落的長泡棉條和拉長的披風落成「長」。英雄從桶子探出頭比讚，披風沿著地面越伸越長，布忍者被絆倒。長、長、長長
const clip: Clip = {
  char: '長',
  meta: { theme: '彈射英雄', cast: '披風英雄＋布忍者＋彈射板＋鈴鐺＋水桶', gags: ['踩錯開關被彈射', '披風蓋頭盲飛撞牆', '倒栽蔥插進水桶'] },
  duration: 10,
  bg: { top: '#FFF4BF', bottom: '#FFFBE8', floor: '#EBD9A4', scenery: 'hills' },
  actors: [
    { id: 'wall', emoji: '🧱', x: 155, y: 60, size: 20, tint: 'hue-rotate(10deg) saturate(.8) brightness(1.15)' },
    { id: 'board', emoji: '🛹', x: 20, y: 73, size: 11 },
    { id: 'hero', emoji: 'hero:cape/pose', x: 20, y: 66.5, size: 14, flip: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 40, y: 71.5, size: 12, flip: true },
    { id: 'pot', emoji: '🪴', x: 45, y: 71, size: 9 },
    { id: 'bell', emoji: '🔔', x: 116, y: 40, size: 9, float: true },
    { id: 'bucket', emoji: '🪣', x: 136, y: 70, size: 12 },
  ],
  moves: [
    // 指著鈴鐺，倒數
    { at: 0.5, actor: 'hero', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 1.4, actor: 'hero', do: 'squash', amount: -0.3, dur: 0.4 },
    // 布忍者跑出來揮旗，踩到彈射開關
    { at: 2.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 2.0, actor: 'ninja', do: 'flip' },
    { at: 2.0, actor: 'ninja', do: 'moveTo', to: { x: 30, y: 71.5 }, dur: 0.35, arc: 3 },
    { at: 2.4, actor: 'board', do: 'tilt', amount: -30, dur: 0.3 },
    // 被彈上天，披風蓋住頭，盲飛
    { at: 2.45, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 2.45, actor: 'hero', do: 'moveTo', to: { x: 116, y: 30 }, dur: 0.75, arc: 22, ease: 'out' },
    { at: 3.2, actor: 'bell', do: 'shake', amount: 2, dur: 0.6 },
    { at: 3.2, actor: 'hero', do: 'moveTo', to: { x: 148, y: 52 }, dur: 0.3, ease: 'in' },
    // 碰！扁在軟牆上，晃得像果凍
    { at: 3.5, actor: 'hero', do: 'squash', amount: -0.5, dur: 0.5 },
    { at: 3.5, actor: 'wall', do: 'shake', amount: 1.5, dur: 0.6 },
    // 彈回來，倒栽蔥插進水桶
    { at: 4.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 4.0, actor: 'hero', do: 'moveTo', to: { x: 136, y: 49 }, dur: 0.45, arc: 10 },
    { at: 4.0, actor: 'hero', do: 'rotateTo', amount: 180, dur: 0.45 },
    { at: 4.45, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.6, actor: 'hero', do: 'shake', amount: 1.2, dur: 1.0 },
    // 從桶子裡探出頭比讚
    { at: 6.2, actor: 'hero', do: 'rotateTo', amount: -180, dur: 0.01 },
    { at: 6.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 6.2, actor: 'hero', do: 'moveTo', to: { x: 136, y: 63 }, dur: 0.25, ease: 'back' },
    { at: 6.1, actor: 'bucket', do: 'squash', amount: -0.2, dur: 0.3 },
    // 披風越伸越長，布忍者走過去被絆倒，煙霧彈又晚一步爆開
    { at: 7.9, actor: 'ninja', do: 'flip' },
    { at: 7.9, actor: 'ninja', do: 'moveTo', to: { x: 36, y: 71.5 }, dur: 0.4 },
    { at: 8.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 8.3, actor: 'ninja', do: 'rotateTo', amount: 90, dur: 0.25 },
    { at: 8.95, actor: 'ninja', do: 'rotateTo', amount: -90, dur: 0.2 },
    { at: 8.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 9.2, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 軟牆上震落的長泡棉條，一根一根掉下來
    { at: 4.2, dur: 0.6, strokes: [0, 1, 2, 3], from: 'wall', color: '#F76707' },
    { at: 4.8, dur: 0.55, strokes: [4, 5, 6], from: 'wall', color: '#F76707' },
    // 披風尖端甩進來變成最後那一長撇
    { at: 5.35, dur: 0.35, strokes: [7], from: 'hero', color: '#E8590C' },
  ],
  glyph: [{ at: 5.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.5 },
    { at: 0.5, kind: 'bubble', actor: 'hero', emoji: '🔔', dur: 0.8 },
    { at: 1.4, dur: 0.8, kind: 'line', actor: 'hero', dx: -2, dy: 3, to: { x: 2, y: 73 }, color: '#C92A2A', width: 2.6 },
    { at: 2.05, kind: 'pop', actor: 'ninja', emoji: '🚩', dur: 0.5 },
    { at: 2.4, kind: 'burst', actor: 'board', emoji: '💥', dur: 0.35 },
    { at: 2.85, kind: 'pop', actor: 'hero', emoji: '🙈', dy: 10, dur: 0.5 },
    { at: 2.9, kind: 'burst', actor: 'ninja', emoji: '☁️', n: 5, dur: 0.5 },
    { at: 3.1, kind: 'sweat', actor: 'ninja' },
    { at: 3.25, kind: 'pop', actor: 'bell', emoji: '🎵', dx: -12, dur: 0.6 },
    { at: 3.5, kind: 'burst', x: 150, y: 50, emoji: '💥', dur: 0.4 },
    { at: 4.45, kind: 'burst', actor: 'bucket', emoji: '💦', n: 5, dur: 0.5 },
    { at: 6.35, kind: 'pop', actor: 'hero', emoji: '👍', dur: 0.8 },
    { at: 6.35, kind: 'dizzy', actor: 'hero', dur: 1.0 },
    // 披風沿著地面越伸越長
    { at: 6.95, dur: 3.05, kind: 'line', actor: 'bucket', dx: -5, dy: 8, to: { x: 2, y: 86 }, color: '#C92A2A', width: 2.6 },
    { at: 8.55, kind: 'burst', actor: 'ninja', emoji: '☁️', n: 6, dur: 0.6 },
  ],
  camera: [
    // 彈射出去跟拍，撞牆前回全景
    { at: 2.45, dur: 0.3, do: 'follow', actor: 'hero', amount: 1.3 },
    { at: 3.2, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 3.5, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.45, say: '長' },
    { at: 2.4, sfx: 'boing' },
    { at: 2.9, sfx: 'poof' },
    { at: 3.2, sfx: 'clink' },
    { at: 3.5, sfx: 'bonk' },
    { at: 4.45, sfx: 'splash' },
    { at: 5.8, say: '長' },
    { at: 7.0, say: '長長' },
    { at: 7.05, sfx: 'whoosh' },
    { at: 8.3, sfx: 'slide' },
    { at: 8.55, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
