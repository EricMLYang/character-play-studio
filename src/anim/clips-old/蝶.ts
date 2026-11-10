import type { Clip } from '../clip'

// 蝶：玩具機器人踮著腳偷偷去抓停在花盆上的蝴蝶，可是馬達太大力，每一步都「吱——咚」；手一伸，蝴蝶跳高一片葉子，手撞到打瞌睡的賽車。
// 賽車醒來，兩個鼻子對鼻子大叫，一起撞翻花盆：木莖和葉子倒成右邊的枼，機器人震掉的螺絲彈簧捲成左邊的虫。蝴蝶最後停在機器人頭上。蝶、蝶、蝴蝶
const clip: Clip = {
  char: '蝶',
  meta: { theme: '偷抓蝴蝶', cast: '機器人＋酷炫車子＋蝴蝶＋花盆', gags: ['踮腳每步都吱咚', '鼻子對鼻子大叫', '一起撞翻花盆'] },
  duration: 10,
  bg: { top: '#EADFFF', bottom: '#F6F0FF', floor: '#CDB8EE', scenery: 'room' },
  actors: [
    { id: 'pot', emoji: '🪴', x: 132, y: 66, size: 17 },
    { id: 'car', emoji: 'hero:car/idle', x: 112, y: 69, size: 19 },
    { id: 'bfly', emoji: '🦋', x: 134, y: 52, size: 7, float: true },
    { id: 'bolt1', emoji: '🔩', x: 92, y: 66, size: 5, hidden: true },
    { id: 'bolt2', emoji: '🔩', x: 92, y: 66, size: 5, hidden: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 22, y: 71, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 從左邊探頭進來，看到蝴蝶
    { at: 0.1, actor: 'robot', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.9, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.4 },
    // 踮腳——馬達太大力，每一步都咚
    { at: 1.0, actor: 'robot', do: 'moveTo', to: { x: 46, y: 71 }, dur: 0.3, arc: 7 },
    { at: 1.3, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 1.55, actor: 'robot', do: 'moveTo', to: { x: 70, y: 71 }, dur: 0.3, arc: 7 },
    { at: 1.85, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.1, actor: 'robot', do: 'moveTo', to: { x: 90, y: 71 }, dur: 0.3, arc: 7 },
    { at: 2.4, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.2 },
    // 長手臂伸出去——蝴蝶跳高一片葉子，手撞到賽車的引擎蓋
    { at: 2.6, actor: 'robot', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 2.65, actor: 'bfly', do: 'moveTo', to: { x: 136, y: 44 }, dur: 0.3, arc: 4 },
    { at: 2.95, actor: 'robot', do: 'tilt', amount: 22, dur: 0.35 },
    { at: 3.05, actor: 'car', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 3.1, actor: 'bolt1', do: 'pop', dur: 0.1 },
    { at: 3.1, actor: 'bolt1', do: 'moveTo', to: { x: 30, y: 72 }, dur: 0.7, ease: 'out' },
    { at: 3.1, actor: 'bolt1', do: 'spin', times: 3, dur: 0.7 },
    { at: 3.15, actor: 'bolt2', do: 'pop', dur: 0.1 },
    { at: 3.15, actor: 'bolt2', do: 'moveTo', to: { x: 40, y: 72 }, dur: 0.6, ease: 'out' },
    { at: 3.15, actor: 'bolt2', do: 'spin', times: 3, dur: 0.6 },
    // 賽車睜眼！鼻子對鼻子
    { at: 3.4, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 3.4, actor: 'car', do: 'hop', amount: 4, dur: 0.3 },
    { at: 3.45, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    // 兩個都嚇得往後衝——一起撞翻花盆
    { at: 4.0, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 4.0, actor: 'car', do: 'moveTo', to: { x: 124, y: 69 }, dur: 0.2, ease: 'in' },
    { at: 4.0, actor: 'robot', do: 'moveTo', to: { x: 106, y: 71 }, dur: 0.2, ease: 'in' },
    { at: 4.2, actor: 'pot', do: 'rotateTo', amount: 85, dur: 0.3, ease: 'bounce' },
    { at: 4.2, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.2, actor: 'bfly', do: 'moveTo', to: { x: 26, y: 18 }, dur: 0.5, arc: 10 },
    // 機器人震得零件亂飛，被彈到左邊；賽車被彈到右邊
    { at: 4.25, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    { at: 4.3, actor: 'robot', do: 'moveTo', to: { x: 24, y: 71 }, dur: 0.45, arc: 28, ease: 'out' },
    { at: 4.3, actor: 'robot', do: 'spin', dur: 0.45 },
    { at: 4.35, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 4.35, actor: 'car', do: 'moveTo', to: { x: 146, y: 69 }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'pot', do: 'vanish', dur: 0.2 },
    { at: 4.85, actor: 'bolt1', do: 'vanish', dur: 0.15 },
    { at: 4.85, actor: 'bolt2', do: 'vanish', dur: 0.15 },
    { at: 4.9, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 蝴蝶飛一圈，停在機器人頭上
    { at: 6.4, actor: 'bfly', do: 'moveTo', to: { x: 24, y: 59 }, dur: 0.7, arc: 8 },
    { at: 6.4, actor: 'bfly', do: 'spin', dur: 0.7 },
    { at: 7.1, actor: 'robot', do: 'squash', amount: 0.1, dur: 0.2 },
    { at: 7.6, actor: 'car', do: 'shake', amount: 0.8, dur: 0.6 },
    // 回馬槍：機器人想抓頭上的蝴蝶——蝴蝶又跳高一點，手太大力敲到自己的頭
    { at: 8.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 8.3, actor: 'bfly', do: 'moveTo', to: { x: 30, y: 48 }, dur: 0.3, arc: 4 },
    { at: 8.4, actor: 'robot', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 8.45, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 9.0, actor: 'bfly', do: 'moveTo', to: { x: 24, y: 59 }, dur: 0.4 },
    { at: 9.1, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 9.1, actor: 'car', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 花盆的木莖和葉子倒成右邊的枼
    { at: 4.45, dur: 1.0, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14], from: 'pot', color: '#7B2FBE' },
    // 震掉的螺絲和彈簧捲成左邊的虫
    { at: 4.85, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'bolt1', color: '#AE3EC9' },
  ],
  glyph: [{ at: 5.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, dur: 3.2, kind: 'zzz', actor: 'car' },
    { at: 0.7, kind: 'bubble', actor: 'robot', emoji: '🦋', dur: 0.8 },
    { at: 1.3, kind: 'puff', actor: 'robot' },
    { at: 1.85, kind: 'puff', actor: 'robot' },
    { at: 2.4, kind: 'puff', actor: 'robot' },
    { at: 3.0, kind: 'burst', actor: 'car', emoji: '💥', dur: 0.35 },
    { at: 3.45, kind: 'pop', actor: 'car', emoji: '❗', dur: 0.5 },
    { at: 3.6, kind: 'pop', actor: 'robot', emoji: '😱', dur: 0.4 },
    { at: 3.6, kind: 'pop', actor: 'car', emoji: '😱', dx: 4, dur: 0.4 },
    { at: 4.2, kind: 'burst', x: 128, y: 58, emoji: '💥', dur: 0.4 },
    { at: 4.3, kind: 'burst', actor: 'robot', emoji: '🔩', n: 5, dur: 0.5 },
    { at: 4.9, kind: 'dizzy', actor: 'robot', dur: 1.3 },
    { at: 4.8, kind: 'dizzy', actor: 'car', dur: 1.6 },
    { at: 6.3, kind: 'puff', actor: 'robot' },
    { at: 7.15, kind: 'pop', actor: 'robot', emoji: '😊', dx: 6, dur: 0.6 },
    { at: 8.4, kind: 'burst', actor: 'robot', emoji: '💥', dy: 4, dur: 0.35 },
    { at: 8.6, kind: 'dizzy', actor: 'robot', dur: 0.8 },
  ],
  camera: [
    // 鼻子對鼻子那一下推近
    { at: 3.35, dur: 0.75, do: 'punch', amount: 0.3, to: { x: 100, y: 62 } },
    { at: 4.2, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.3, sfx: 'bonk' },
    { at: 1.6, say: '蝶' },
    { at: 2.4, sfx: 'bonk' },
    { at: 3.05, sfx: 'tap' },
    { at: 3.15, sfx: 'clink' },
    { at: 3.45, sfx: 'boing' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.2, sfx: 'crack' },
    { at: 5.6, say: '蝶' },
    { at: 6.5, say: '蝴蝶' },
    { at: 8.4, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
