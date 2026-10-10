import type { Clip } from '../clip'

// 他：小貓躲在牆角偷看，指著外面：「他！」——一個大大的影子越走越近，好可怕！小貓縮成一團發抖。
// 影子轉進來……原來是一隻小小的刺蝟，舉著一根大樹枝！後面還跟著好多小刺蝟，一隻一隻跑出來，樹枝掉成「他」。他、他、他們
const clip: Clip = {
  char: '他',
  meta: { theme: '影子好可怕', cast: '小貓＋刺蝟家族', gags: ['影子很大其實很小', '一隻變好多隻'] },
  duration: 10,
  bg: { top: '#FFE7C8', bottom: '#FFF5E6', floor: '#9BB86A', scenery: 'forest' },
  actors: [
    { id: 'cat', emoji: '🐱', x: 26, y: 69.5, size: 18, hidden: true },
    { id: 'shadow', emoji: '🦔', x: 118, y: 55, size: 50, hidden: true, tint: 'brightness(0) opacity(.8)' },
    { id: 'hog', emoji: '🦔', x: 130, y: 71, size: 13, hidden: true },
    { id: 'stick', emoji: '🪵', x: 130, y: 58, size: 14, hidden: true, float: true },
    { id: 'h1', emoji: '🦔', x: 176, y: 72, size: 9, hidden: true },
    { id: 'h2', emoji: '🦔', x: 176, y: 72, size: 9, hidden: true },
    { id: 'h3', emoji: '🦔', x: 176, y: 72, size: 9, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'cat', do: 'pop' },
    // 他！——大影子越走越近
    { at: 1.0, actor: 'shadow', do: 'enter', from: { x: 190, y: 55 }, dur: 1.4 },
    { at: 1.0, actor: 'shadow', do: 'bounce', amount: 2, times: 4, dur: 1.4 },
    { at: 2.4, actor: 'shadow', do: 'scaleTo', amount: 1.15, dur: 0.6 },
    // 小貓縮成一團發抖
    { at: 2.6, actor: 'cat', do: 'swap', emoji: '🙀' },
    { at: 2.6, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 4.6, actor: 'cat', do: 'swap', emoji: '🐱' },
    { at: 3.0, actor: 'cat', do: 'shake', amount: 1, dur: 1.2 },
    // 影子轉進來——原來是小刺蝟舉著大樹枝
    { at: 4.4, actor: 'shadow', do: 'vanish', dur: 0.3 },
    { at: 4.5, actor: 'hog', do: 'pop', dur: 0.3 },
    { at: 4.5, actor: 'stick', do: 'pop', dur: 0.3 },
    { at: 5.0, actor: 'hog', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 後面還有好多小刺蝟——樹枝掉下來
    { at: 5.5, actor: 'stick', do: 'vanish', dur: 0.2 },
    { at: 6.0, actor: 'h1', do: 'enter', from: { x: 180, y: 72 }, dur: 0.01 },
    { at: 6.0, actor: 'h1', do: 'moveTo', to: { x: 142, y: 72 }, dur: 0.4 },
    { at: 6.3, actor: 'h2', do: 'enter', from: { x: 180, y: 72 }, dur: 0.01 },
    { at: 6.3, actor: 'h2', do: 'moveTo', to: { x: 151, y: 72 }, dur: 0.4 },
    { at: 6.6, actor: 'h3', do: 'enter', from: { x: 180, y: 72 }, dur: 0.01 },
    { at: 6.6, actor: 'h3', do: 'moveTo', to: { x: 160, y: 72 }, dur: 0.4 },
    { at: 7.2, actor: 'cat', do: 'squash', amount: -0.15, dur: 0.4 },
    ...['hog', 'h1', 'h2', 'h3'].map((actor, i) => ({ at: 8.4 + i * 0.1, actor, do: 'bounce' as const, amount: 2, times: 2, dur: 0.5 })),
  ],
  builds: [
    // 掉下來的樹枝：亻、也
    { at: 5.5, dur: 0.5, strokes: [0, 1], from: 'stick', color: '#8A5A3B' },
    { at: 5.85, dur: 0.6, strokes: [2, 3, 4], from: 'stick', color: '#3E9B4F' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'pop', actor: 'cat', emoji: '👉', dur: 0.6 },
    { at: 2.6, kind: 'pop', actor: 'cat', emoji: '😱', dur: 0.6 },
    { at: 3.2, kind: 'sweat', actor: 'cat', dur: 0.9 },
    { at: 4.6, kind: 'pop', actor: 'cat', emoji: '❓', dur: 0.6 },
    { at: 5.0, kind: 'pop', actor: 'hog', emoji: '😊', dur: 0.6 },
    { at: 7.0, kind: 'pop', actor: 'cat', emoji: '😳', dur: 0.7 },
    { at: 8.5, kind: 'burst', x: 146, y: 58, emoji: '💕', n: 5, dur: 0.6 },
  ],
  camera: [
    { at: 2.4, dur: 1.2, do: 'punch', amount: 0.2, to: { x: 40, y: 62 } },
  ],
  cues: [
    { at: 1.1, say: '他' },
    { at: 1.6, sfx: 'rumble' },
    { at: 3.0, sfx: 'deflate' },
    { at: 4.5, sfx: 'poof' },
    { at: 5.5, sfx: 'plop' },
    { at: 6.0, sfx: 'tap' }, { at: 6.3, sfx: 'tap' }, { at: 6.6, sfx: 'tap' },
    { at: 7.1, say: '他' },
    { at: 8.1, say: '他們' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
