import type { Clip } from '../clip'

// 八：章魚有八隻腳，想學紳士留八字鬍。黏上鬍子——打噴嚏，鬍子飛走；再黏一次——風一吹又飛走！
// 章魚乾脆把兩隻腳捲起來，變成一副超大的八字鬍，兩撇鬍子變成「八」。好帥——可是只剩六隻腳，走路一直跌倒。八、八、八字鬍
const clip: Clip = {
  char: '八',
  meta: { theme: '留鬍子', cast: '章魚紳士', gags: ['鬍子一直飛走', '用自己的腳當鬍子'] },
  duration: 10,
  bg: { top: '#C6EEF7', bottom: '#8DD3E8', floor: '#E9D6A6', scenery: 'ocean' },
  actors: [
    { id: 'octo', emoji: '🐙', x: 28, y: 64, size: 26, hidden: true },
    { id: 'hat', emoji: '🎩', x: 28, y: 48, size: 12, hidden: true, float: true },
    { id: 'stache', emoji: '🥸', x: 28, y: 66, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'octo', do: 'pop' },
    { at: 0.2, actor: 'hat', do: 'drop', dur: 0.5 },
    { at: 0.8, actor: 'octo', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 黏上鬍子——打噴嚏，飛走
    { at: 1.6, actor: 'stache', do: 'pop', dur: 0.2 },
    { at: 2.3, actor: 'octo', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 2.6, actor: 'octo', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.6, actor: 'stache', do: 'moveTo', to: { x: 140, y: 30 }, dur: 0.5, arc: 8 },
    { at: 2.6, actor: 'stache', do: 'spin', dur: 0.5 },
    // 再黏一次——風一吹又飛走
    { at: 3.4, actor: 'stache', do: 'moveTo', to: { x: 28, y: 66 }, dur: 0.4, arc: 6 },
    { at: 4.2, actor: 'stache', do: 'moveTo', to: { x: 10, y: 40 }, dur: 0.5, arc: 8 },
    { at: 4.2, actor: 'stache', do: 'spin', dur: 0.5 },
    { at: 4.7, actor: 'stache', do: 'vanish', dur: 0.15 },
    { at: 4.3, actor: 'hat', do: 'tilt', amount: -20, dur: 0.4 },
    // 乾脆把兩隻腳捲起來當鬍子
    { at: 5.3, actor: 'octo', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 5.3, actor: 'octo', do: 'flash', dur: 0.5 },
    // 好帥——走路一直跌倒
    { at: 8.0, actor: 'octo', do: 'tilt', amount: 25, dur: 0.4 },
    { at: 8.6, actor: 'octo', do: 'tilt', amount: -25, dur: 0.4 },
    { at: 9.1, actor: 'octo', do: 'squash', amount: 0.3, dur: 0.3 },
  ],
  builds: [
    // 兩撇鬍子
    { at: 5.5, dur: 0.4, strokes: [0], from: 'octo', color: '#6B3FA0' },
    { at: 5.9, dur: 0.4, strokes: [1], from: 'octo', color: '#6B3FA0' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'bubble', actor: 'octo', emoji: '🥸', dur: 0.6 },
    { at: 2.6, kind: 'burst', actor: 'octo', emoji: '💦', n: 5, dur: 0.4, dy: 10 },
    { at: 3.0, kind: 'pop', actor: 'octo', emoji: '😑', dur: 0.5 },
    { at: 4.1, kind: 'burst', x: 48, y: 60, emoji: '💨', n: 4, dur: 0.5 },
    { at: 4.8, kind: 'pop', actor: 'octo', emoji: '😤', dur: 0.4 },
    { at: 5.3, kind: 'pop', actor: 'octo', emoji: '💡', dur: 0.5 },
    { at: 6.5, kind: 'burst', actor: 'octo', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.2, kind: 'sweat', actor: 'octo' },
    { at: 9.15, kind: 'dizzy', actor: 'octo', dur: 0.8 },
  ],
  camera: [
    { at: 5.3, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 30, y: 60 } },
  ],
  cues: [
    { at: 1.0, say: '八' },
    { at: 1.6, sfx: 'tap' },
    { at: 2.6, sfx: 'achoo' },
    { at: 3.4, sfx: 'tap' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 5.3, sfx: 'blip' },
    { at: 6.45, say: '八' },
    { at: 7.4, say: '八字鬍' },
    { at: 9.1, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
