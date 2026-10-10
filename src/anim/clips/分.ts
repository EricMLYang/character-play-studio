import type { Clip } from '../clip'

// 分：兩隻熊只有一塊蛋糕，切成兩半——一邊大一邊小，兩隻都搶大的；再切一刀——又一邊大一邊小，再搶！
// 越切越小，最後只剩一點點蛋糕屑，刀子和碎片飛成「分」。一隻小鳥飛來把蛋糕屑啄走，兩隻熊愣住……然後一起哈哈大笑。分、分、分享
const clip: Clip = {
  char: '分',
  meta: { theme: '分蛋糕', cast: '兩隻熊＋蛋糕＋小鳥', gags: ['怎麼切都不一樣大', '越切越小', '最後被搶走', '一起大笑'] },
  duration: 10,
  bg: { top: '#FFEED9', bottom: '#FFF8EE', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'cake', emoji: '🍰', x: 80, y: 70, size: 18, hidden: true },
    { id: 'bearL', emoji: '🐻', x: 50, y: 68.6, size: 20, hidden: true },
    { id: 'bearR', emoji: '🐻', x: 110, y: 68.6, size: 20, hidden: true, tint: 'hue-rotate(-15deg) brightness(1.1)' },
    { id: 'knife', emoji: '🔪', x: 80, y: 50, size: 12, hidden: true, float: true },
    { id: 'bird', emoji: '🐦', x: 180, y: 30, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cake', do: 'pop' },
    { at: 0.1, actor: 'bearL', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    { at: 0.2, actor: 'bearR', do: 'enter', from: { x: 175, y: 68.6 }, dur: 0.6 },
    // 切一刀——兩隻都搶
    { at: 1.4, actor: 'knife', do: 'pop' },
    { at: 1.7, actor: 'knife', do: 'moveTo', to: { x: 80, y: 62 }, dur: 0.2 },
    { at: 1.9, actor: 'knife', do: 'moveTo', to: { x: 80, y: 50 }, dur: 0.2 },
    { at: 2.4, actor: 'bearL', do: 'moveTo', to: { x: 66, y: 68.6 }, dur: 0.25 },
    { at: 2.4, actor: 'bearR', do: 'moveTo', to: { x: 94, y: 68.6 }, dur: 0.25 },
    { at: 2.65, actor: 'bearL', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 2.65, actor: 'bearR', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 3.3, actor: 'bearL', do: 'moveTo', to: { x: 50, y: 68.6 }, dur: 0.3 },
    { at: 3.3, actor: 'bearR', do: 'moveTo', to: { x: 110, y: 68.6 }, dur: 0.3 },
    // 再切——蛋糕越來越小，再搶
    { at: 3.8, actor: 'knife', do: 'moveTo', to: { x: 80, y: 62 }, dur: 0.15 },
    { at: 3.95, actor: 'knife', do: 'moveTo', to: { x: 80, y: 50 }, dur: 0.15 },
    { at: 3.95, actor: 'cake', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    { at: 4.3, actor: 'bearL', do: 'moveTo', to: { x: 68, y: 68.6 }, dur: 0.2 },
    { at: 4.3, actor: 'bearR', do: 'moveTo', to: { x: 92, y: 68.6 }, dur: 0.2 },
    { at: 4.5, actor: 'bearL', do: 'shake', amount: 2, dur: 0.5 },
    { at: 4.5, actor: 'bearR', do: 'shake', amount: 2, dur: 0.5 },
    // 越切越小——咻咻咻
    { at: 5.1, actor: 'knife', do: 'shake', amount: 3, dur: 0.5 },
    { at: 5.2, actor: 'cake', do: 'scaleTo', amount: 0.4, dur: 0.4 },
    { at: 5.7, actor: 'knife', do: 'vanish', dur: 0.2 },
    { at: 5.7, actor: 'bearL', do: 'moveTo', to: { x: 30, y: 68.6 }, dur: 0.4 },
    { at: 5.7, actor: 'bearR', do: 'moveTo', to: { x: 130, y: 68.6 }, dur: 0.4 },
    // 小鳥飛來把蛋糕屑啄走
    { at: 7.3, actor: 'bird', do: 'moveTo', to: { x: 80, y: 66 }, dur: 0.6, arc: 6 },
    { at: 7.9, actor: 'cake', do: 'vanish', dur: 0.15 },
    { at: 8.0, actor: 'bird', do: 'moveTo', to: { x: 180, y: 20 }, dur: 0.6 },
    // 兩隻熊愣住……一起哈哈大笑
    { at: 9.0, actor: 'bearL', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 9.0, actor: 'bearR', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 刀子揮出來的兩撇 → 八；切下來的碎片 → 刀
    { at: 5.3, dur: 0.5, strokes: [0, 1], from: 'knife', color: '#E86A33' },
    { at: 5.7, dur: 0.5, strokes: [2, 3], from: 'cake', color: '#F06292' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'bearL', emoji: '🍰', dur: 0.7 },
    { at: 0.9, kind: 'bubble', actor: 'bearR', emoji: '🍰', dur: 0.7 },
    { at: 2.65, kind: 'burst', x: 80, y: 60, emoji: '💢', n: 4, dur: 0.6 },
    { at: 4.5, kind: 'burst', x: 80, y: 60, emoji: '💢', n: 5, dur: 0.5 },
    { at: 5.1, kind: 'burst', actor: 'cake', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.0, kind: 'pop', actor: 'bearL', emoji: '😳', dur: 0.5 },
    { at: 8.0, kind: 'pop', actor: 'bearR', emoji: '😱', dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'bearL', emoji: '😆', dur: 0.8 },
    { at: 9.05, kind: 'pop', actor: 'bearR', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 4.3, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 80, y: 62 } },
  ],
  cues: [
    { at: 0.9, say: '分' },
    { at: 1.75, sfx: 'tap' },
    { at: 2.65, sfx: 'rumble' },
    { at: 3.85, sfx: 'tap' },
    { at: 4.5, sfx: 'rumble' },
    { at: 5.1, sfx: 'whoosh' },
    { at: 6.3, say: '分' },
    { at: 7.3, sfx: 'whoosh' },
    { at: 7.9, sfx: 'gulp' },
    { at: 8.8, say: '分享' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
