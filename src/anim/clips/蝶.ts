import type { Clip } from '../clip'

// 蝶：毛毛蟲看到蝴蝶飛過去好羨慕，用力一跳——翻一圈摔扁。乾脆狂吃葉子變胖、包成繭，繭抖啊抖「砰」炸成「蝶」，
// 鑽出來一隻胖胖的大蝴蝶！拍拍翅膀卻胖到飛不起來……打一個大嗝，才「咻」地被嗝噴上天、終於飛起來。蝶、蝶、蝴蝶
const clip: Clip = {
  char: '蝶',
  meta: { theme: '毛毛蟲變身', cast: '毛毛蟲＋蝴蝶', gags: ['想飛跳不起來', '狂吃變胖包成繭', '胖到飛不起來', '打嗝噴上天'] },
  duration: 10,
  bg: { top: '#F6ECFF', bottom: '#E3F4D9', floor: '#86C26A', scenery: 'forest' },
  actors: [
    { id: 'flower', emoji: '🌼', x: 146, y: 71.5, size: 13 },
    { id: 'l1', emoji: '🍃', x: 46, y: 73.7, size: 7.8, hidden: true },
    { id: 'l2', emoji: '🍃', x: 48, y: 73.7, size: 7.8, hidden: true },
    { id: 'l3', emoji: '🍃', x: 54, y: 73.7, size: 7.8, hidden: true },
    { id: 'cat', emoji: '🐛', x: 34, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'bf', emoji: '🦋', x: 100, y: 26, size: 10.4, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cat', do: 'enter', from: { x: -10, y: 71.5 }, dur: 0.6 },
    { at: 0.25, actor: 'l1', do: 'pop' },
    // 嚼嚼嚼
    { at: 0.55, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 0.8, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 0.8, actor: 'l1', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    { at: 1.05, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 1.05, actor: 'l1', do: 'vanish', dur: 0.15 },
    // 蝴蝶飛過去
    { at: 0.8, actor: 'bf', do: 'enter', from: { x: 170, y: 18 }, dur: 0.5 },
    { at: 1.3, actor: 'bf', do: 'moveTo', to: { x: 66, y: 20 }, arc: 4, dur: 0.4 },
    { at: 1.56, actor: 'bf', do: 'moveTo', to: { x: 175, y: 12 }, dur: 0.5 },
    // 用力跳：翻一圈摔扁
    { at: 2.2, actor: 'cat', do: 'squash', amount: -0.45, dur: 0.2 },
    { at: 2.44, actor: 'cat', do: 'hop', amount: 16, dur: 0.45 },
    { at: 2.44, actor: 'cat', do: 'spin', dur: 0.45 },
    { at: 2.98, actor: 'cat', do: 'squash', amount: 0.55, dur: 0.3 },
    // 狂吃葉子變胖
    { at: 3.4, actor: 'l2', do: 'pop' },
    { at: 3.53, actor: 'l3', do: 'pop' },
    { at: 3.8, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 3.8, actor: 'l2', do: 'moveTo', to: { x: 38, y: 73 }, dur: 0.12 },
    { at: 3.93, actor: 'l2', do: 'vanish', dur: 0.1 },
    { at: 3.93, actor: 'cat', do: 'scaleTo', amount: 1.25, dur: 0.2 },
    { at: 4.2, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 4.2, actor: 'l3', do: 'moveTo', to: { x: 38, y: 73 }, dur: 0.12 },
    { at: 4.33, actor: 'l3', do: 'vanish', dur: 0.1 },
    { at: 4.33, actor: 'cat', do: 'scaleTo', amount: 1.25, dur: 0.2 },
    // 包成繭，抖啊抖
    { at: 4.67, actor: 'cat', do: 'swap', emoji: '🥜' },
    { at: 4.8, actor: 'cat', do: 'shake', amount: 1, dur: 0.3 },
    { at: 5.27, actor: 'cat', do: 'shake', amount: 2.2, dur: 0.35 },
    // 砰！鑽出胖蝴蝶
    { at: 5.8, actor: 'cat', do: 'swap', emoji: '🦋' },
    { at: 5.8, actor: 'cat', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 7.7, actor: 'cat', do: 'flash', dur: 0.6 },
    { at: 7.7, actor: 'cat', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 拍拍翅膀……胖到飛不起來
    { at: 8.38, actor: 'cat', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 8.52, actor: 'cat', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 8.67, actor: 'cat', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 8.81, actor: 'cat', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: 8.38, actor: 'cat', do: 'hop', amount: 1.5, dur: 0.6 },
    // 打嗝噴上天，變苗條飛起來
    { at: 9.1, actor: 'cat', do: 'moveTo', to: { x: 30, y: 36 }, dur: 0.35 },
    { at: 9.1, actor: 'cat', do: 'scaleTo', amount: 0.65, dur: 0.35 },
    { at: 9.48, actor: 'cat', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.1, actor: 'bf', do: 'moveTo', to: { x: -10, y: 22 }, dur: 0.05 },
    { at: 9.24, actor: 'bf', do: 'moveTo', to: { x: 14, y: 28 }, dur: 0.4 },
    { at: 9.62, actor: 'bf', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
  ],
  builds: [
    // 繭炸開的碎片 → 虫、世、木
    { at: 5.8, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'cat', color: '#3FAE5A' },
    { at: 6.15, dur: 0.55, strokes: [6, 7, 8, 9, 10], from: 'cat', color: '#A45BD6' },
    { at: 6.5, dur: 0.55, strokes: [11, 12, 13, 14], from: 'cat', style: 'drop', color: '#FF6F9C' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.52, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.3 },
    { at: 1.51, kind: 'bubble', actor: 'cat', emoji: '😍', dur: 0.6 },
    { at: 2.98, kind: 'puff', actor: 'cat' },
    { at: 3.04, kind: 'dizzy', actor: 'cat', dur: 0.5 },
    { at: 3.4, kind: 'pop', actor: 'cat', emoji: '💡', dur: 0.4 },
    { at: 4.67, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.45 },
    { at: 5.8, kind: 'burst', actor: 'cat', emoji: '✨', n: 8, dur: 0.6 },
    { at: 7.7, kind: 'burst', actor: 'cat', emoji: '🌸', n: 6, dur: 0.6 },
    { at: 8.86, kind: 'sweat', actor: 'cat' },
    { at: 9.1, kind: 'puff', actor: 'cat' },
    { at: 9.14, kind: 'pop', actor: 'cat', emoji: '😳', dur: 0.5 },
    { at: 9.62, kind: 'pop', actor: 'bf', emoji: '😆', dur: 0.4 },
  ],
  camera: [
    { at: 2.98, dur: 0.5, do: 'punch', amount: 0.25, to: { x: 34, y: 66 } },
    { at: 5.27, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.55, sfx: 'tap' }, { at: 0.8, sfx: 'tap' }, { at: 1.05, sfx: 'tap' },
    { at: 1.4, say: '蝶' },
    { at: 2.44, sfx: 'boing' },
    { at: 2.98, sfx: 'plop' },
    { at: 3.93, sfx: 'gulp' }, { at: 4.33, sfx: 'gulp' },
    { at: 4.67, sfx: 'poof' },
    { at: 5.27, sfx: 'rumble' },
    { at: 5.8, sfx: 'poof' },
    { at: 7.05, say: '蝶' },
    { at: 8, say: '蝴蝶' },
    { at: 9.1, sfx: 'hic' },
    { at: 9.19, sfx: 'whoosh' },
    { at: 9.62, sfx: 'cheer' },
  ],
}

export default clip
