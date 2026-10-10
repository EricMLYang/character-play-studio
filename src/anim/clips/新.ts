import type { Clip } from '../clip'

// 新：小貓拆開禮物——一雙新球鞋！穿上去才站好，鞋子自己跑起來：咻到右邊、咻回左邊、跳好高，最後把小貓甩飛出去。
// 鞋子跑過的路線變成「新」。新球鞋乖乖走回來坐好；小貓伸手要穿——鞋子又跳開了。新、新、新鞋
const clip: Clip = {
  char: '新',
  meta: { theme: '新球鞋', cast: '小貓＋會自己跑的新鞋', gags: ['東西自己動起來（失控）', '被甩飛', '想穿又跑掉'] },
  duration: 10,
  bg: { top: '#E7F0FF', bottom: '#FBF7FF', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'gift', emoji: '🎁', x: 50, y: 71, size: 15, hidden: true },
    { id: 'shoes', emoji: '👟', x: 50, y: 72, size: 13, hidden: true },
    { id: 'cat', emoji: '🐱', x: 28, y: 69.5, size: 18, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'gift', do: 'pop' },
    { at: 0.2, actor: 'cat', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 拆開禮物：一雙新球鞋！
    { at: 1.0, actor: 'gift', do: 'shake', amount: 1, dur: 0.3 },
    { at: 1.3, actor: 'gift', do: 'vanish', dur: 0.15 },
    { at: 1.35, actor: 'shoes', do: 'pop', dur: 0.4 },
    { at: 1.8, actor: 'cat', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 穿上去
    { at: 2.5, actor: 'cat', do: 'moveTo', to: { x: 50, y: 61 }, dur: 0.4, arc: 8 },
    // 鞋子自己跑起來：咻到右邊、咻回左邊
    { at: 3.3, actor: 'shoes', do: 'moveTo', to: { x: 136, y: 72 }, dur: 0.4 },
    { at: 3.3, actor: 'cat', do: 'moveTo', to: { x: 136, y: 61 }, dur: 0.4 },
    { at: 3.9, actor: 'shoes', do: 'flip' },
    { at: 3.9, actor: 'shoes', do: 'moveTo', to: { x: 30, y: 72 }, dur: 0.45 },
    { at: 3.9, actor: 'cat', do: 'moveTo', to: { x: 30, y: 61 }, dur: 0.45 },
    // 跳好高——把小貓甩飛
    { at: 4.6, actor: 'shoes', do: 'flip' },
    { at: 4.6, actor: 'shoes', do: 'hop', amount: 26, dur: 0.6 },
    { at: 4.6, actor: 'cat', do: 'hop', amount: 26, dur: 0.6 },
    { at: 5.3, actor: 'shoes', do: 'moveTo', to: { x: 190, y: 72 }, dur: 0.6 },
    { at: 5.3, actor: 'cat', do: 'moveTo', to: { x: 22, y: 69.5 }, dur: 0.6, arc: 24 },
    { at: 5.3, actor: 'cat', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.9, actor: 'cat', do: 'squash', amount: 0.35, dur: 0.3 },
    // 新球鞋乖乖走回來坐好
    { at: 7.2, actor: 'shoes', do: 'flip' },
    { at: 7.2, actor: 'shoes', do: 'moveTo', to: { x: 128, y: 72 }, dur: 0.01 },
    { at: 7.22, actor: 'shoes', do: 'enter', from: { x: 178, y: 72 }, dur: 0.6 },
    { at: 7.85, actor: 'shoes', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 小貓伸手要穿——鞋子又跳開
    { at: 8.6, actor: 'cat', do: 'moveTo', to: { x: 36, y: 69.5 }, dur: 0.3 },
    { at: 8.9, actor: 'shoes', do: 'moveTo', to: { x: 146, y: 72 }, dur: 0.35, arc: 10 },
  ],
  builds: [
    // 鞋子跑過的路線：左邊的亲、右邊的斤
    { at: 5.4, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: 'shoes', color: '#7A5CC9' },
    { at: 5.9, dur: 0.6, strokes: [9, 10, 11, 12], from: 'shoes', color: '#E86A33' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.35, kind: 'burst', actor: 'shoes', emoji: '✨', n: 6, dur: 0.6 },
    { at: 1.8, kind: 'pop', actor: 'cat', emoji: '😍', dur: 0.7 },
    { at: 3.3, kind: 'puff', actor: 'shoes' },
    { at: 3.5, kind: 'pop', actor: 'cat', emoji: '😱', dur: 0.8 },
    { at: 4.6, kind: 'puff', actor: 'shoes' },
    { at: 6.0, kind: 'dizzy', actor: 'cat', dur: 1.2 },
    { at: 8.0, kind: 'pop', actor: 'shoes', emoji: '✨', dur: 0.6 },
    { at: 9.1, kind: 'pop', actor: 'cat', emoji: '😾', dur: 0.8 },
  ],
  camera: [
    { at: 3.3, dur: 0.9, do: 'punch', amount: 0.15, to: { x: 80, y: 60 } },
    { at: 5.9, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.3, sfx: 'poof' },
    { at: 1.5, say: '新' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.6, sfx: 'boing' },
    { at: 5.3, sfx: 'whoosh' },
    { at: 5.9, sfx: 'bonk' },
    { at: 6.65, sfx: 'tap' },
    { at: 6.7, say: '新' },
    { at: 7.85, say: '新鞋' },
    { at: 8.9, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
