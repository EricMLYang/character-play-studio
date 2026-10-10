import type { Clip } from '../clip'

// 三：熊做三明治：一片麵包、一片起司、一片麵包——一、二、三！好高。張大嘴——咬不下去，太高了！
// 一屁股坐上去壓扁，三片壓得扁扁的，飛出去變成「三」。熊滿意地咬一口——扁扁的剛好一口吃掉。三、三、三明治
const clip: Clip = {
  char: '三',
  meta: { theme: '做三明治', cast: '熊＋麵包＋起司', gags: ['疊太高咬不下', '用屁股壓扁'] },
  duration: 10,
  bg: { top: '#FFF0DA', bottom: '#FFF9F0', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'b1', emoji: '🍞', x: 124, y: 70, size: 14, hidden: true },
    { id: 'cheese', emoji: '🧀', x: 124, y: 62, size: 13, hidden: true },
    { id: 'b2', emoji: '🍞', x: 124, y: 54, size: 14, hidden: true },
    { id: 'bear', emoji: '🐻', x: 70, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'sand', emoji: '🥪', x: 124, y: 71, size: 14, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.7 },
    // 一、二、三！
    { at: 1.0, actor: 'b1', do: 'drop', dur: 0.5 },
    { at: 1.8, actor: 'cheese', do: 'drop', dur: 0.5 },
    { at: 2.6, actor: 'b2', do: 'drop', dur: 0.5 },
    // 張大嘴——咬不下去
    { at: 3.5, actor: 'bear', do: 'moveTo', to: { x: 106, y: 68.6 }, dur: 0.4 },
    { at: 3.9, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.5 },
    { at: 4.4, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.4 },
    // 一屁股坐上去壓扁
    { at: 5.0, actor: 'bear', do: 'moveTo', to: { x: 124, y: 46 }, dur: 0.4, arc: 10 },
    { at: 5.4, actor: 'bear', do: 'moveTo', to: { x: 124, y: 60 }, dur: 0.2 },
    { at: 5.55, actor: 'b2', do: 'vanish', dur: 0.15 },
    { at: 5.55, actor: 'cheese', do: 'vanish', dur: 0.15 },
    { at: 5.55, actor: 'b1', do: 'vanish', dur: 0.15 },
    { at: 5.6, actor: 'sand', do: 'pop', dur: 0.2 },
    { at: 5.6, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 6.0, actor: 'bear', do: 'moveTo', to: { x: 146, y: 68.6 }, dur: 0.4, arc: 6 },
    // 滿意地咬一口
    { at: 8.0, actor: 'sand', do: 'moveTo', to: { x: 136, y: 66 }, dur: 0.3 },
    { at: 8.4, actor: 'sand', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.7, actor: 'bear', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 壓扁飛出去的三片：麵包、起司、麵包
    { at: 5.6, dur: 0.3, strokes: [0], from: 'b2', color: '#D9893B' },
    { at: 5.85, dur: 0.3, strokes: [1], from: 'cheese', color: '#F5C542' },
    { at: 6.1, dur: 0.3, strokes: [2], from: 'b1', color: '#D9893B' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'bear', emoji: '🥪', dur: 0.6 },
    { at: 1.4, kind: 'burst', x: 80, y: 34, emoji: '1️⃣', dur: 0.6 },
    { at: 2.2, kind: 'burst', x: 80, y: 34, emoji: '2️⃣', dur: 0.6 },
    { at: 3.0, kind: 'burst', x: 80, y: 34, emoji: '3️⃣', dur: 0.6 },
    { at: 4.4, kind: 'sweat', actor: 'bear' },
    { at: 4.6, kind: 'pop', actor: 'bear', emoji: '💡', dur: 0.4 },
    { at: 5.6, kind: 'burst', actor: 'sand', emoji: '💨', n: 6, dur: 0.5 },
    { at: 8.5, kind: 'pop', actor: 'bear', emoji: '😋', dur: 0.8 },
  ],
  camera: [
    { at: 5.4, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 124, y: 60 } },
    { at: 5.55, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.4, sfx: 'plop' },
    { at: 1.5, say: '三' },
    { at: 2.2, sfx: 'plop' },
    { at: 3.0, sfx: 'plop' },
    { at: 4.4, sfx: 'deflate' },
    { at: 5.0, sfx: 'boing' },
    { at: 5.55, sfx: 'bonk' },
    { at: 6.6, say: '三' },
    { at: 7.5, say: '三明治' },
    { at: 8.4, sfx: 'gulp' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
