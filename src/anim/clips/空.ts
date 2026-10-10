import type { Clip } from '../clip'

// 空：小狗搭火箭降落在月球上，跳一下——飄好高、好慢！好好玩，再用力一跳……結果飄上天回不來了，四腳亂划。
// 火箭轟一聲飛上去把牠接回來，噴出的煙變成「空」。小狗得意揮手——打了個噴嚏，又慢慢飄走了。空、空、太空
const clip: Clip = {
  char: '空',
  meta: { theme: '月球漫步', cast: '小狗太空人＋火箭', gags: ['飄得好高好慢', '跳太用力回不來', '噴嚏又飄走'] },
  duration: 10,
  bg: { top: '#14163A', bottom: '#2D2A66', floor: '#B9B4CC', scenery: 'space' },
  actors: [
    { id: 'rocket', emoji: '🚀', x: 138, y: 64, size: 26, hidden: true },
    { id: 'dog', emoji: '🐶', x: 122, y: 69.4, size: 18, hidden: true },
  ],
  moves: [
    // 火箭降落
    { at: 0, actor: 'rocket', do: 'enter', from: { x: 138, y: -20 }, dur: 1.0 },
    { at: 0, actor: 'rocket', do: 'rotateTo', amount: -45, dur: 0.01 },
    { at: 1.0, actor: 'rocket', do: 'squash', amount: 0.2, dur: 0.3 },
    // 小狗跳出來，飄著落地
    { at: 1.1, actor: 'dog', do: 'pop', dur: 0.2 },
    { at: 1.3, actor: 'dog', do: 'moveTo', to: { x: 34, y: 69.4 }, dur: 1.2, arc: 24 },
    // 跳一下——飄好高、好慢
    { at: 2.9, actor: 'dog', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 3.2, actor: 'dog', do: 'hop', amount: 32, dur: 1.6 },
    { at: 3.2, actor: 'dog', do: 'spin', dur: 1.6 },
    // 再用力一跳……回不來了
    { at: 5.0, actor: 'dog', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 5.3, actor: 'dog', do: 'moveTo', to: { x: 40, y: 14 }, dur: 1.2 },
    { at: 5.9, actor: 'dog', do: 'shake', amount: 1.5, dur: 0.7 },
    // 火箭飛上去接牠
    { at: 6.0, actor: 'rocket', do: 'shake', amount: 1, dur: 0.3 },
    { at: 6.3, actor: 'rocket', do: 'moveTo', to: { x: 44, y: 14 }, dur: 0.5 },
    { at: 6.8, actor: 'dog', do: 'vanish', dur: 0.1 },
    { at: 6.85, actor: 'rocket', do: 'moveTo', to: { x: 138, y: 64 }, dur: 0.7, arc: 10 },
    // 小狗跳出來揮手
    { at: 7.6, actor: 'dog', do: 'moveTo', to: { x: 122, y: 69.4 }, dur: 0.01 },
    { at: 7.65, actor: 'dog', do: 'pop', dur: 0.3 },
    // 哈啾——又慢慢飄走
    { at: 8.6, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 8.9, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 9.0, actor: 'dog', do: 'moveTo', to: { x: 124, y: 44 }, dur: 1.0 },
  ],
  builds: [
    // 火箭點火噴出的煙 → 穴；火箭飛過的軌跡 → 工
    { at: 6.1, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: { x: 138, y: 72 }, color: '#8E7BFF' },
    { at: 6.6, dur: 0.6, strokes: [5, 6, 7], from: 'rocket', color: '#FFB13B' },
  ],
  glyph: [{ at: 7.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'puff', actor: 'rocket' },
    { at: 2.5, kind: 'puff', actor: 'dog' },
    { at: 3.4, kind: 'pop', actor: 'dog', emoji: '😆', dur: 1.2 },
    { at: 4.8, kind: 'puff', actor: 'dog' },
    { at: 5.6, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.8 },
    { at: 6.0, kind: 'burst', x: 138, y: 74, emoji: '🔥', n: 6, dur: 0.5 },
    { at: 7.7, kind: 'pop', actor: 'dog', emoji: '👋', dur: 0.8 },
    { at: 8.9, kind: 'burst', actor: 'dog', emoji: '💦', n: 5, dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'dog', emoji: '😅', dur: 0.8 },
  ],
  camera: [
    { at: 5.5, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 40, y: 24 } },
    { at: 6.0, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.1, sfx: 'rumble' },
    { at: 1.0, sfx: 'plop' },
    { at: 1.6, say: '空' },
    { at: 3.2, sfx: 'boing' },
    { at: 5.3, sfx: 'boing' },
    { at: 6.0, sfx: 'whoosh' },
    { at: 7.25, say: '空' },
    { at: 8.25, say: '太空' },
    { at: 8.85, sfx: 'achoo' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
