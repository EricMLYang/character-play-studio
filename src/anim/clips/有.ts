import type { Clip } from '../clip'

// 有：浣熊翻垃圾桶找吃的——翻一翻，沒有；再翻，還是沒有，只有一隻臭襪子。牠氣得一腳踢垃圾桶，
// 結果「轟」地噴出一大堆好吃的：漢堡、蘋果、披薩……統統飛出來變成「有」！浣熊開心地抱住——最後蹦出來的是剛剛那隻臭襪子。有、有、沒有
const clip: Clip = {
  char: '有',
  meta: { theme: '翻垃圾桶', cast: '浣熊＋垃圾桶', gags: ['一直找不到', '踢一腳噴出寶藏', '臭襪子回馬槍'] },
  duration: 10,
  bg: { top: '#1E2352', bottom: '#3D4A7E', floor: '#5B5F78', scenery: 'city' },
  actors: [
    { id: 'can', emoji: '🗑️', x: 44, y: 67, size: 24, hidden: true },
    { id: 'rac', emoji: '🦝', x: 18, y: 69.5, size: 19, hidden: true, flip: true },
    { id: 'sock', emoji: '🧦', x: 44, y: 52, size: 10, hidden: true, float: true },
    { id: 'burger', emoji: '🍔', x: 44, y: 52, size: 11, hidden: true, float: true },
    { id: 'apple', emoji: '🍎', x: 44, y: 52, size: 10, hidden: true, float: true },
    { id: 'pizza', emoji: '🍕', x: 44, y: 52, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'can', do: 'pop' },
    { at: 0.2, actor: 'rac', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 翻一翻——沒有
    { at: 1.2, actor: 'rac', do: 'moveTo', to: { x: 32, y: 62 }, dur: 0.4, arc: 6 },
    { at: 1.6, actor: 'can', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 2.3, actor: 'rac', do: 'moveTo', to: { x: 18, y: 69.5 }, dur: 0.3 },
    // 再翻——只有一隻臭襪子
    { at: 3.0, actor: 'rac', do: 'moveTo', to: { x: 32, y: 62 }, dur: 0.4, arc: 6 },
    { at: 3.4, actor: 'can', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 3.9, actor: 'sock', do: 'pop', dur: 0.3 },
    { at: 4.2, actor: 'sock', do: 'moveTo', to: { x: 44, y: 70 }, dur: 0.3 },
    { at: 4.2, actor: 'rac', do: 'moveTo', to: { x: 18, y: 69.5 }, dur: 0.3 },
    { at: 4.6, actor: 'sock', do: 'vanish', dur: 0.2 },
    // 氣得一腳踢垃圾桶——轟！噴出一大堆好吃的
    { at: 5.0, actor: 'rac', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 5.25, actor: 'rac', do: 'moveTo', to: { x: 30, y: 69.5 }, dur: 0.15 },
    { at: 5.4, actor: 'can', do: 'tilt', amount: 25, dur: 0.4 },
    { at: 5.45, actor: 'burger', do: 'pop', dur: 0.1 },
    { at: 5.45, actor: 'burger', do: 'moveTo', to: { x: 120, y: 20 }, dur: 0.6, arc: 10 },
    { at: 5.55, actor: 'apple', do: 'pop', dur: 0.1 },
    { at: 5.55, actor: 'apple', do: 'moveTo', to: { x: 140, y: 34 }, dur: 0.6, arc: 10 },
    { at: 5.65, actor: 'pizza', do: 'pop', dur: 0.1 },
    { at: 5.65, actor: 'pizza', do: 'moveTo', to: { x: 104, y: 14 }, dur: 0.6, arc: 10 },
    { at: 6.3, actor: 'burger', do: 'vanish', dur: 0.15 },
    { at: 6.4, actor: 'apple', do: 'vanish', dur: 0.15 },
    { at: 6.5, actor: 'pizza', do: 'vanish', dur: 0.15 },
    { at: 6.0, actor: 'rac', do: 'moveTo', to: { x: 18, y: 69.5 }, dur: 0.3 },
    // 開心張開手——最後蹦出來的是臭襪子
    { at: 8.0, actor: 'rac', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.7, actor: 'sock', do: 'moveTo', to: { x: 44, y: 52 }, dur: 0.01 },
    { at: 8.72, actor: 'sock', do: 'pop', dur: 0.1 },
    { at: 8.75, actor: 'sock', do: 'moveTo', to: { x: 20, y: 60 }, dur: 0.4, arc: 12 },
    { at: 9.15, actor: 'rac', do: 'squash', amount: 0.3, dur: 0.3 },
  ],
  builds: [
    // 噴出來的好吃東西
    { at: 5.6, dur: 0.6, strokes: [0, 1], from: 'can', color: '#E86A33' },
    { at: 6.0, dur: 0.7, strokes: [2, 3, 4, 5], from: 'can', color: '#3D8BEF' },
  ],
  glyph: [{ at: 6.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'rac', emoji: '🍔', dur: 0.7 },
    { at: 1.7, kind: 'burst', actor: 'can', emoji: '💨', n: 4, dur: 0.5 },
    { at: 2.4, kind: 'pop', actor: 'rac', emoji: '😑', dur: 0.6 },
    { at: 4.0, kind: 'stink', actor: 'sock', dur: 0.8 },
    { at: 4.3, kind: 'pop', actor: 'rac', emoji: '🤢', dur: 0.6 },
    { at: 5.4, kind: 'burst', actor: 'can', emoji: '✨', n: 8, dur: 0.7 },
    { at: 6.1, kind: 'pop', actor: 'rac', emoji: '😍', dur: 0.8 },
    { at: 9.2, kind: 'stink', actor: 'rac', dur: 0.8 },
    { at: 9.2, kind: 'pop', actor: 'rac', emoji: '🤢', dur: 0.7, dx: 4 },
  ],
  camera: [
    { at: 5.3, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 48, y: 54 } },
    { at: 5.4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.0, say: '有' },
    { at: 1.6, sfx: 'clink' },
    { at: 3.4, sfx: 'clink' },
    { at: 3.9, sfx: 'boing' },
    { at: 5.25, sfx: 'bonk' },
    { at: 5.4, sfx: 'poof' },
    { at: 6.8, say: '有' },
    { at: 7.75, say: '沒有' },
    { at: 8.75, sfx: 'whoosh' },
    { at: 9.15, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
