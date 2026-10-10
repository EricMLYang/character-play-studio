import type { Clip } from '../clip'

// 長：長頸鹿伸長脖子炫耀，小豬學牠伸——只伸長一點點；跳起來摘蘋果，跳了兩次都搆不到，摔個四腳朝天。
// 長頸鹿走到樹下，脖子一伸，頭撞到樹枝，蘋果嘩啦啦掉下來變成「長」。小豬接到一顆好開心——最後一顆咚地砸在長頸鹿頭上。長、長、長頸鹿
const clip: Clip = {
  char: '長',
  meta: { theme: '摘蘋果', cast: '長頸鹿＋小豬＋蘋果樹', gags: ['模仿失敗', '跳不夠高', '撞到樹蘋果掉滿地', '最後一顆砸頭'] },
  duration: 10,
  bg: { top: '#D6F0FF', bottom: '#F4FBE9', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 146, y: 58, size: 42, hidden: true },
    { id: 'apple', emoji: '🍎', x: 140, y: 40, size: 9, hidden: true, float: true },
    { id: 'pig', emoji: '🐷', x: 26, y: 70.3, size: 16, hidden: true, flip: true },
    { id: 'giraffe', emoji: '🦒', x: 54, y: 66, size: 26, hidden: true, flip: true },
    { id: 'apple2', emoji: '🍎', x: 30, y: 58, size: 9, hidden: true, float: true },
    { id: 'apple3', emoji: '🍎', x: 136, y: -8, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.15, actor: 'apple', do: 'pop' },
    { at: 0, actor: 'giraffe', do: 'enter', from: { x: -20, y: 66 }, dur: 0.8 },
    { at: 0.3, actor: 'pig', do: 'enter', from: { x: -14, y: 70.3 }, dur: 0.6 },
    // 長頸鹿伸長脖子炫耀
    { at: 1.1, actor: 'giraffe', do: 'scaleTo', amount: 1.3, dur: 0.5 },
    { at: 1.1, actor: 'giraffe', do: 'squash', amount: -0.2, dur: 0.5 },
    { at: 1.9, actor: 'giraffe', do: 'scaleTo', amount: 0.77, dur: 0.4 },
    // 小豬學牠伸——只伸長一點點
    { at: 2.5, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.6 },
    // 跳起來摘蘋果：搆不到、再跳也搆不到，摔個四腳朝天
    { at: 3.2, actor: 'pig', do: 'moveTo', to: { x: 128, y: 70.3 }, dur: 0.6 },
    { at: 4.95, actor: 'pig', do: 'flip' },
    { at: 3.9, actor: 'pig', do: 'hop', amount: 10, dur: 0.45 },
    { at: 4.45, actor: 'pig', do: 'hop', amount: 15, dur: 0.5 },
    { at: 4.95, actor: 'pig', do: 'rotateTo', amount: 180, dur: 0.25 },
    { at: 4.95, actor: 'pig', do: 'moveTo', to: { x: 110, y: 62 }, dur: 0.25 },
    // 長頸鹿走到樹下，脖子一伸——撞到樹枝
    { at: 5.0, actor: 'giraffe', do: 'moveTo', to: { x: 122, y: 66 }, dur: 0.5 },
    { at: 5.6, actor: 'giraffe', do: 'scaleTo', amount: 1.55, dur: 0.35 },
    { at: 5.95, actor: 'tree', do: 'shake', amount: 2, dur: 0.5 },
    { at: 6.0, actor: 'apple', do: 'vanish', dur: 0.15 },
    { at: 6.1, actor: 'giraffe', do: 'scaleTo', amount: 0.645, dur: 0.3 },
    { at: 6.1, actor: 'giraffe', do: 'moveTo', to: { x: 126, y: 66 }, dur: 0.3 },
    // 小豬翻回來、接到一顆蘋果
    { at: 6.3, actor: 'pig', do: 'rotateTo', amount: -180, dur: 0.25 },
    { at: 6.3, actor: 'pig', do: 'moveTo', to: { x: 26, y: 70.3 }, dur: 0.5, arc: 10 },
    { at: 7.3, actor: 'apple2', do: 'enter', from: { x: 30, y: -10 }, dur: 0.5 },
    { at: 7.8, actor: 'pig', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 7.8, actor: 'apple2', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 最後一顆咚地砸在長頸鹿頭上
    { at: 8.7, actor: 'apple3', do: 'pop', dur: 0.05 },
    { at: 8.7, actor: 'apple3', do: 'moveTo', to: { x: 136, y: 56 }, dur: 0.35 },
    { at: 9.05, actor: 'giraffe', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.05, actor: 'apple3', do: 'moveTo', to: { x: 146, y: 72.5 }, dur: 0.5, arc: 8 },
  ],
  builds: [
    // 撞下來的蘋果 → 上半；樹葉 → 下半
    { at: 6.05, dur: 0.7, strokes: [0, 1, 2, 3], style: 'drop', from: { x: 80, y: 0 }, color: '#E2364E' },
    { at: 6.4, dur: 0.7, strokes: [4, 5, 6, 7], from: 'tree', color: '#3E9B4F' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'pop', actor: 'giraffe', emoji: '😎', dur: 0.8 },
    { at: 1.5, kind: 'pop', actor: 'pig', emoji: '😮', dur: 0.7 },
    { at: 2.9, kind: 'bubble', actor: 'pig', emoji: '🍎', dur: 0.4 },
    { at: 4.6, kind: 'sweat', actor: 'pig' },
    { at: 5.2, kind: 'dizzy', actor: 'pig', dur: 1.0, dy: 10 },
    { at: 5.95, kind: 'burst', actor: 'giraffe', dur: 0.45 },
    { at: 6.0, kind: 'burst', actor: 'tree', emoji: '🍎', n: 6, dur: 0.6 },
    { at: 7.8, kind: 'pop', actor: 'pig', emoji: '😋', dur: 0.8 },
    { at: 9.05, kind: 'burst', actor: 'giraffe', dur: 0.4 },
    { at: 9.2, kind: 'pop', actor: 'giraffe', emoji: '😵', dur: 0.8 },
  ],
  camera: [
    { at: 5.6, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 124, y: 50 } },
    { at: 5.95, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.3, say: '長' },
    { at: 2.5, sfx: 'slide' },
    { at: 3.9, sfx: 'boing' },
    { at: 4.45, sfx: 'boing' },
    { at: 4.95, sfx: 'plop' },
    { at: 5.95, sfx: 'bonk' },
    { at: 6.05, sfx: 'rumble' },
    { at: 7.2, sfx: 'plop' },
    { at: 7.25, say: '長' },
    { at: 8.25, say: '長頸鹿' },
    { at: 9.05, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
