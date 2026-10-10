import type { Clip } from '../clip'

// 孫：熊爺爺在睡午覺，熊孫子想叫醒他玩。拉拉耳朵——打呼；在旁邊敲鍋子——還在打呼；
// 孫子想到了：拿出一罐蜂蜜，打開蓋子……爺爺鼻子動一動，「咻」地跳起來！蜂蜜和湯匙飛成「孫」。兩個一起吃蜂蜜。孫、孫、孫子
const clip: Clip = {
  char: '孫',
  meta: { theme: '叫醒爺爺', cast: '熊爺爺＋熊孫子', gags: ['怎麼叫都叫不醒', '一聞到蜂蜜就醒'] },
  duration: 10,
  bg: { top: '#E6F3E0', bottom: '#F8FBF2', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'grandpa', emoji: '🐻', x: 120, y: 66, size: 26, hidden: true },
    { id: 'cub', emoji: '🐻', x: 30, y: 71, size: 13, hidden: true, flip: true },
    { id: 'pan', emoji: '🍳', x: 92, y: 62, size: 10, hidden: true, float: true },
    { id: 'honey', emoji: '🍯', x: 94, y: 66, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'grandpa', do: 'pop' },
    { at: 0.1, actor: 'grandpa', do: 'tint', filter: 'brightness(.92)' },
    { at: 0.3, actor: 'grandpa', do: 'tilt', amount: 12, dur: 5.0 },
    { at: 0.2, actor: 'cub', do: 'enter', from: { x: -12, y: 71 }, dur: 0.6 },
    // 拉拉耳朵——打呼
    { at: 1.2, actor: 'cub', do: 'moveTo', to: { x: 100, y: 71 }, dur: 0.6 },
    { at: 1.9, actor: 'cub', do: 'tilt', amount: -15, dur: 0.4 },
    { at: 2.0, actor: 'grandpa', do: 'squash', amount: 0.1, dur: 0.5 },
    // 敲鍋子——還在打呼
    { at: 2.9, actor: 'pan', do: 'pop', dur: 0.2 },
    { at: 3.1, actor: 'pan', do: 'shake', amount: 2, dur: 0.7 },
    { at: 3.1, actor: 'cub', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    { at: 3.9, actor: 'pan', do: 'vanish', dur: 0.2 },
    // 打開蜂蜜……鼻子動一動，跳起來
    { at: 4.5, actor: 'honey', do: 'pop', dur: 0.2 },
    { at: 4.9, actor: 'honey', do: 'flash', dur: 0.5 },
    { at: 5.5, actor: 'grandpa', do: 'tint', filter: '' },
    { at: 5.6, actor: 'grandpa', do: 'hop', amount: 16, dur: 0.5 },
    { at: 5.6, actor: 'honey', do: 'moveTo', to: { x: 120, y: 40 }, dur: 0.5, arc: 8 },
    { at: 6.1, actor: 'honey', do: 'moveTo', to: { x: 138, y: 70 }, dur: 0.4 },
    { at: 6.4, actor: 'cub', do: 'moveTo', to: { x: 148, y: 71 }, dur: 0.5, arc: 6 },
    { at: 6.4, actor: 'grandpa', do: 'moveTo', to: { x: 124, y: 66 }, dur: 0.3 },
    // 兩個一起吃蜂蜜
    { at: 8.3, actor: 'grandpa', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.4, actor: 'cub', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 蜂蜜 → 子；湯匙劃過的線 → 系
    { at: 5.8, dur: 0.5, strokes: [0, 1, 2], from: 'honey', color: '#E3A23A' },
    { at: 6.2, dur: 0.8, strokes: [3, 4, 5, 6, 7, 8, 9], from: 'grandpa', color: '#8A5A3B' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'zzz', actor: 'grandpa', dur: 5.0, dx: 4 },
    { at: 0.9, kind: 'bubble', actor: 'cub', emoji: '⚽', dur: 0.6 },
    { at: 2.4, kind: 'pop', actor: 'cub', emoji: '😑', dur: 0.5 },
    { at: 3.1, kind: 'burst', actor: 'pan', emoji: '🎵', n: 5, dur: 0.6 },
    { at: 4.1, kind: 'pop', actor: 'cub', emoji: '💡', dur: 0.4 },
    { at: 4.9, kind: 'stink', actor: 'honey', dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'grandpa', emoji: '😍', dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'grandpa', emoji: '😋', dur: 0.8 },
    { at: 8.4, kind: 'pop', actor: 'cub', emoji: '😋', dur: 0.8 },
  ],
  camera: [
    { at: 5.4, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 116, y: 58 } },
  ],
  cues: [
    { at: 1.0, say: '孫' },
    { at: 1.9, sfx: 'tap' },
    { at: 3.1, sfx: 'clink' }, { at: 3.35, sfx: 'clink' }, { at: 3.6, sfx: 'clink' },
    { at: 4.5, sfx: 'poof' },
    { at: 5.6, sfx: 'boing' },
    { at: 7.1, say: '孫' },
    { at: 8.0, say: '孫子' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
