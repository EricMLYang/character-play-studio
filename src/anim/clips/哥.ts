import type { Clip } from '../clip'

// 哥：小猴子搆不到樹上的香蕉，猴子哥哥說：「看我的！」哥哥爬上樹，摘到香蕉丟下去——小猴子接住了！
// 哥哥得意地揮手，樹枝「喀」一聲斷掉，哥哥掉下來，小猴子張開手……接住哥哥！香蕉和樹葉飛成「哥」。哥、哥、哥哥
const clip: Clip = {
  char: '哥',
  meta: { theme: '摘香蕉', cast: '猴子哥哥＋小猴子', gags: ['哥哥好厲害', '得意過頭樹枝斷', '小的接住大的'] },
  duration: 10,
  bg: { top: '#D9F2E0', bottom: '#F4FBEF', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌴', x: 128, y: 50, size: 48, hidden: true },
    { id: 'banana', emoji: '🍌', x: 122, y: 30, size: 10, hidden: true, float: true },
    { id: 'small', emoji: '🐒', x: 96, y: 71, size: 13, hidden: true, flip: true },
    { id: 'big', emoji: '🐒', x: 60, y: 68.6, size: 20, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.15, actor: 'banana', do: 'pop' },
    { at: 0.3, actor: 'small', do: 'pop' },
    // 小猴子搆不到
    { at: 0.8, actor: 'small', do: 'hop', amount: 8, dur: 0.4 },
    { at: 1.3, actor: 'small', do: 'hop', amount: 8, dur: 0.4 },
    // 哥哥：看我的！
    { at: 1.9, actor: 'big', do: 'pop', dur: 0.3 },
    { at: 2.3, actor: 'big', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 2.9, actor: 'big', do: 'moveTo', to: { x: 118, y: 36 }, dur: 0.8, arc: 10 },
    // 摘到香蕉丟下去——小猴子接住
    { at: 3.9, actor: 'banana', do: 'moveTo', to: { x: 96, y: 62 }, dur: 0.5, arc: 6 },
    { at: 4.4, actor: 'small', do: 'hop', amount: 4, dur: 0.3 },
    // 哥哥得意揮手——樹枝斷掉，掉下來
    { at: 5.0, actor: 'big', do: 'tilt', amount: 20, dur: 0.4 },
    { at: 5.5, actor: 'tree', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 5.6, actor: 'big', do: 'moveTo', to: { x: 98, y: 52 }, dur: 0.4 },
    { at: 5.6, actor: 'big', do: 'spin', dur: 0.4 },
    { at: 6.0, actor: 'small', do: 'squash', amount: 0.4, dur: 0.4 },
    { at: 6.0, actor: 'banana', do: 'vanish', dur: 0.2 },
    { at: 6.4, actor: 'big', do: 'moveTo', to: { x: 98, y: 60 }, dur: 0.2 },
    // 一起回到左邊
    { at: 7.0, actor: 'small', do: 'moveTo', to: { x: 38, y: 71 }, dur: 0.6 },
    { at: 7.0, actor: 'big', do: 'moveTo', to: { x: 18, y: 68.6 }, dur: 0.6, arc: 6 },
    { at: 8.8, actor: 'big', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.8, actor: 'small', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 香蕉 → 上面的可；樹葉 → 下面的可
    { at: 6.0, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'banana', color: '#F5C542' },
    { at: 6.4, dur: 0.6, strokes: [5, 6, 7, 8, 9], from: 'tree', color: '#3E9B4F' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'small', emoji: '🍌', dur: 0.6 },
    { at: 1.7, kind: 'pop', actor: 'small', emoji: '😢', dur: 0.4 },
    { at: 2.3, kind: 'pop', actor: 'big', emoji: '💪', dur: 0.6 },
    { at: 4.4, kind: 'pop', actor: 'small', emoji: '😆', dur: 0.6 },
    { at: 5.0, kind: 'pop', actor: 'big', emoji: '😎', dur: 0.5 },
    { at: 5.5, kind: 'pop', actor: 'big', emoji: '😱', dur: 0.5 },
    { at: 6.1, kind: 'sweat', actor: 'small' },
    { at: 8.8, kind: 'burst', x: 28, y: 52, emoji: '💕', n: 5, dur: 0.6 },
  ],
  camera: [
    { at: 5.5, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 100, y: 56 } },
  ],
  cues: [
    { at: 0.8, sfx: 'boing' },
    { at: 1.3, sfx: 'boing' },
    { at: 2.0, say: '哥' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 5.5, sfx: 'crack' },
    { at: 6.0, sfx: 'bonk' },
    { at: 7.1, say: '哥' },
    { at: 8.0, say: '哥哥' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
