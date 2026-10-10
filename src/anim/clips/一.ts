import type { Clip } from '../clip'

// 一：冰淇淋車來了！大象、長頸鹿、熊一個接一個衝過來排隊，擠來擠去搶第一。大象一屁股把大家擠開——
// 結果一隻小螞蟻從大家腳下鑽過去，站到最前面！冰淇淋車伸出一根長長的甜筒餅乾，變成「一」，螞蟻拿到第一支。一、一、第一
const clip: Clip = {
  char: '一',
  meta: { theme: '排隊搶第一', cast: '大象＋長頸鹿＋熊＋螞蟻＋冰淇淋車', gags: ['擠來擠去', '大的擠開大家', '最小的偷偷變第一'] },
  duration: 10,
  bg: { top: '#DDF2FF', bottom: '#FFF6EA', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'truck', emoji: '🚚', x: 140, y: 64, size: 28, hidden: true, tint: 'hue-rotate(160deg) saturate(1.2)' },
    { id: 'ice', emoji: '🍦', x: 140, y: 44, size: 12, hidden: true, float: true },
    { id: 'bear', emoji: '🐻', x: 96, y: 68.6, size: 19, hidden: true },
    { id: 'giraffe', emoji: '🦒', x: 76, y: 64, size: 26, hidden: true, flip: true },
    { id: 'ele', emoji: '🐘', x: 52, y: 66, size: 25, hidden: true, flip: true },
    { id: 'ant', emoji: '🐜', x: 14, y: 72.6, size: 9, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'truck', do: 'enter', from: { x: 195, y: 64 }, dur: 0.8 },
    { at: 0.8, actor: 'ice', do: 'pop' },
    // 一個接一個衝過來排隊
    { at: 1.0, actor: 'bear', do: 'enter', from: { x: -20, y: 68.6 }, dur: 0.5 },
    { at: 1.4, actor: 'giraffe', do: 'enter', from: { x: -20, y: 64 }, dur: 0.5 },
    { at: 1.8, actor: 'ele', do: 'enter', from: { x: -20, y: 66 }, dur: 0.5 },
    // 擠來擠去
    { at: 2.6, actor: 'giraffe', do: 'moveTo', to: { x: 90, y: 64 }, dur: 0.3 },
    { at: 2.7, actor: 'bear', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 3.2, actor: 'bear', do: 'moveTo', to: { x: 104, y: 68.6 }, dur: 0.3 },
    { at: 3.3, actor: 'giraffe', do: 'shake', amount: 1.5, dur: 0.4 },
    // 大象一屁股把大家擠開
    { at: 4.1, actor: 'ele', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 4.4, actor: 'ele', do: 'moveTo', to: { x: 96, y: 66 }, dur: 0.3 },
    { at: 4.6, actor: 'giraffe', do: 'moveTo', to: { x: 60, y: 64 }, dur: 0.4, arc: 14 },
    { at: 4.6, actor: 'giraffe', do: 'spin', dur: 0.4 },
    { at: 4.65, actor: 'bear', do: 'moveTo', to: { x: 40, y: 68.6 }, dur: 0.4, arc: 18 },
    { at: 4.65, actor: 'bear', do: 'spin', dur: 0.4 },
    // 小螞蟻從大家腳下鑽過去，站到最前面
    { at: 5.0, actor: 'ant', do: 'pop', dur: 0.2 },
    { at: 5.3, actor: 'ant', do: 'moveTo', to: { x: 122, y: 72.6 }, dur: 0.8 },
    // 長長的甜筒餅乾變成「一」
    { at: 6.5, actor: 'truck', do: 'shake', amount: 1, dur: 0.3 },
    // 各自回到兩邊；螞蟻拿到第一支
    { at: 6.6, actor: 'ele', do: 'moveTo', to: { x: 30, y: 66 }, dur: 0.6 },
    { at: 6.6, actor: 'giraffe', do: 'moveTo', to: { x: 10, y: 64 }, dur: 0.6 },
    { at: 6.6, actor: 'bear', do: 'moveTo', to: { x: 54, y: 68.6 }, dur: 0.4 },
    { at: 8.2, actor: 'ice', do: 'moveTo', to: { x: 122, y: 64 }, dur: 0.5, arc: 6 },
    { at: 8.8, actor: 'ant', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.8, actor: 'ice', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 長長的甜筒餅乾
    { at: 6.5, dur: 0.6, strokes: [0], from: 'truck', color: '#D9893B' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'burst', actor: 'ice', emoji: '✨', n: 5, dur: 0.5 },
    { at: 2.7, kind: 'burst', x: 96, y: 54, emoji: '💢', n: 4, dur: 0.6 },
    { at: 4.4, kind: 'pop', actor: 'ele', emoji: '😤', dur: 0.6 },
    { at: 5.2, kind: 'dizzy', actor: 'bear', dur: 1.0 },
    { at: 6.2, kind: 'pop', actor: 'ant', emoji: '😎', dur: 0.6 },
    { at: 6.3, kind: 'pop', actor: 'ele', emoji: '😳', dur: 0.6 },
    { at: 8.8, kind: 'pop', actor: 'ant', emoji: '🥇', dur: 0.8 },
  ],
  camera: [
    { at: 5.3, dur: 1.2, do: 'punch', amount: 0.3, to: { x: 110, y: 66 } },
  ],
  cues: [
    { at: 1.0, sfx: 'whoosh' },
    { at: 1.4, say: '一' },
    { at: 2.7, sfx: 'bonk' },
    { at: 3.3, sfx: 'bonk' },
    { at: 4.4, sfx: 'slide' },
    { at: 4.65, sfx: 'boing' },
    { at: 5.3, sfx: 'tap' },
    { at: 7.2, say: '一' },
    { at: 8.2, say: '第一' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
