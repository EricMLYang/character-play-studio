import type { Clip } from '../clip'

// 要：小豬在夾娃娃機前面，好想要那隻小熊娃娃！投一個硬幣——爪子夾起來，掉了；再投一個——夾起來，又掉了！
// 小豬整隻趴在機器上用力搖，機器「叮叮叮」狂響，掉出一大堆娃娃，硬幣和娃娃飛成「要」……就是沒有小熊。要、要、想要
const clip: Clip = {
  char: '要',
  meta: { theme: '夾娃娃', cast: '小豬＋夾娃娃機', gags: ['差一點又掉', '搖機器掉出一堆', '就是沒有想要的'] },
  duration: 10,
  bg: { top: '#FFE6F2', bottom: '#FFF6FA', floor: '#C9A88A', scenery: 'city' },
  actors: [
    { id: 'machine', emoji: '🎰', x: 138, y: 60, size: 34, hidden: true, tint: 'hue-rotate(290deg) saturate(1.3)' },
    { id: 'claw', emoji: '🪝', x: 138, y: 40, size: 10, hidden: true, float: true },
    { id: 'teddy', emoji: '🧸', x: 138, y: 62, size: 10, hidden: true, float: true },
    { id: 'pig', emoji: '🐷', x: 90, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'coin', emoji: '🪙', x: 104, y: 60, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'machine', do: 'pop' },
    { at: 0.15, actor: 'claw', do: 'pop' },
    { at: 0.25, actor: 'teddy', do: 'pop' },
    { at: 0.3, actor: 'pig', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 投一個硬幣——夾起來，掉了
    { at: 1.3, actor: 'coin', do: 'pop', dur: 0.15 },
    { at: 1.5, actor: 'coin', do: 'moveTo', to: { x: 122, y: 56 }, dur: 0.3 },
    { at: 1.8, actor: 'coin', do: 'vanish', dur: 0.1 },
    { at: 2.0, actor: 'claw', do: 'moveTo', to: { x: 138, y: 54 }, dur: 0.4 },
    { at: 2.4, actor: 'claw', do: 'moveTo', to: { x: 138, y: 40 }, dur: 0.4 },
    { at: 2.4, actor: 'teddy', do: 'moveTo', to: { x: 138, y: 48 }, dur: 0.4 },
    { at: 2.85, actor: 'teddy', do: 'moveTo', to: { x: 138, y: 62 }, dur: 0.3 },
    // 再投一個——又掉了
    { at: 3.4, actor: 'coin', do: 'moveTo', to: { x: 104, y: 60 }, dur: 0.01 },
    { at: 3.42, actor: 'coin', do: 'pop', dur: 0.15 },
    { at: 3.6, actor: 'coin', do: 'moveTo', to: { x: 122, y: 56 }, dur: 0.3 },
    { at: 3.9, actor: 'coin', do: 'vanish', dur: 0.1 },
    { at: 4.0, actor: 'claw', do: 'moveTo', to: { x: 138, y: 54 }, dur: 0.3 },
    { at: 4.3, actor: 'claw', do: 'moveTo', to: { x: 138, y: 40 }, dur: 0.3 },
    { at: 4.3, actor: 'teddy', do: 'moveTo', to: { x: 138, y: 46 }, dur: 0.3 },
    { at: 4.65, actor: 'teddy', do: 'moveTo', to: { x: 138, y: 62 }, dur: 0.25 },
    // 趴在機器上用力搖
    { at: 5.2, actor: 'pig', do: 'moveTo', to: { x: 120, y: 62 }, dur: 0.3, arc: 6 },
    { at: 5.5, actor: 'machine', do: 'shake', amount: 2.5, dur: 0.9 },
    { at: 5.5, actor: 'pig', do: 'shake', amount: 2.5, dur: 0.9 },
    { at: 5.5, actor: 'teddy', do: 'shake', amount: 2.5, dur: 0.9 },
    { at: 6.5, actor: 'pig', do: 'moveTo', to: { x: 26, y: 69.5 }, dur: 0.5, arc: 6 },
    // 掉出一堆娃娃——就是沒有小熊
    { at: 8.4, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 8.9, actor: 'teddy', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 掉出來的硬幣和娃娃
    { at: 6.4, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'machine', color: '#F5A623' },
    { at: 6.8, dur: 0.5, strokes: [6, 7, 8], from: 'machine', color: '#E8508A' },
  ],
  glyph: [{ at: 7.35, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'pig', emoji: '🧸', dur: 0.8 },
    { at: 3.0, kind: 'pop', actor: 'pig', emoji: '😫', dur: 0.5 },
    { at: 4.8, kind: 'pop', actor: 'pig', emoji: '💢', dur: 0.5 },
    { at: 5.5, kind: 'burst', actor: 'machine', emoji: '🎵', n: 5, dur: 0.8 },
    { at: 6.3, kind: 'fountain', actor: 'machine', emoji: '🐰', n: 7, dur: 0.8 },
    { at: 6.5, kind: 'fountain', actor: 'machine', emoji: '🐥', n: 6, dur: 0.8 },
    { at: 8.5, kind: 'bubble', actor: 'pig', emoji: '🧸', dur: 0.9 },
  ],
  camera: [
    { at: 4.6, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 138, y: 54 } },
    { at: 5.5, dur: 0.8, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.0, say: '要' },
    { at: 1.5, sfx: 'clink' },
    { at: 2.85, sfx: 'deflate' },
    { at: 3.6, sfx: 'clink' },
    { at: 4.65, sfx: 'deflate' },
    { at: 5.5, sfx: 'blip' }, { at: 5.7, sfx: 'blip' }, { at: 5.9, sfx: 'blip' },
    { at: 6.3, sfx: 'poof' },
    { at: 7.4, say: '要' },
    { at: 8.3, say: '想要' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
