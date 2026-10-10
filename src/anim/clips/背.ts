import type { Clip } from '../clip'

// 背：猴子和兔子玩捉迷藏。猴子摀著眼睛數 3、2、1，兔子躡手躡腳躲到牠背後。猴子往右找、往左找、轉一圈——兔子都跟著躲在牠背後！
// 兔子點點牠的背，猴子嚇得跳起來，變成「背」。換猴子偷偷躲到兔子背後。背、背、背後
const clip: Clip = {
  char: '背',
  meta: { theme: '捉迷藏', cast: '猴子＋兔子', gags: ['其實一直在你後面', '跟著轉來轉去', '角色互換'] },
  duration: 10,
  bg: { top: '#DDF2FF', bottom: '#F2FBEA', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'rabbit', emoji: '🐰', x: 106, y: 70.3, size: 16, hidden: true },
    { id: 'monkey', emoji: '🙈', x: 74, y: 66.5, size: 20, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'monkey', do: 'pop' },
    { at: 0.15, actor: 'rabbit', do: 'pop' },
    // 兔子躡手躡腳躲到猴子背後
    { at: 1.0, actor: 'rabbit', do: 'moveTo', to: { x: 58, y: 70.3 }, dur: 0.9, arc: 4 },
    // 睜開眼睛，往右找——兔子跟在背後
    { at: 2.4, actor: 'monkey', do: 'swap', emoji: '🐵' },
    { at: 2.4, actor: 'monkey', do: 'hop', amount: 3, dur: 0.3 },
    { at: 2.9, actor: 'monkey', do: 'moveTo', to: { x: 102, y: 66.5 }, dur: 0.5 },
    { at: 2.95, actor: 'rabbit', do: 'moveTo', to: { x: 86, y: 70.3 }, dur: 0.5 },
    // 往左找——兔子跳到另一邊
    { at: 4.0, actor: 'monkey', do: 'moveTo', to: { x: 66, y: 66.5 }, dur: 0.5 },
    { at: 4.0, actor: 'rabbit', do: 'moveTo', to: { x: 82, y: 70.3 }, dur: 0.5, arc: 6 },
    // 轉一圈——兔子從頭上跳過去，又躲到背後
    { at: 5.0, actor: 'monkey', do: 'spin', dur: 0.5 },
    { at: 5.0, actor: 'rabbit', do: 'moveTo', to: { x: 50, y: 70.3 }, dur: 0.5, arc: 26 },
    { at: 5.6, actor: 'monkey', do: 'squash', amount: 0.2, dur: 0.4 },
    // 兔子點點牠的背——猴子嚇得跳起來
    { at: 6.2, actor: 'rabbit', do: 'moveTo', to: { x: 56, y: 70.3 }, dur: 0.15 },
    { at: 6.35, actor: 'monkey', do: 'moveTo', to: { x: 32, y: 66.5 }, dur: 0.7, arc: 30 },
    { at: 6.35, actor: 'monkey', do: 'spin', dur: 0.7 },
    { at: 6.5, actor: 'rabbit', do: 'moveTo', to: { x: 122, y: 70.3 }, dur: 0.5, arc: 8 },
    // 換猴子偷偷躲到兔子背後
    { at: 8.0, actor: 'monkey', do: 'moveTo', to: { x: 141, y: 66.5 }, dur: 0.01 },
    { at: 7.7, actor: 'monkey', do: 'vanish', dur: 0.2 },
    { at: 8.05, actor: 'monkey', do: 'pop', dur: 0.3 },
    { at: 8.8, actor: 'rabbit', do: 'hop', amount: 10, dur: 0.45 },
  ],
  builds: [
    // 猴子嚇一跳甩出來的 → 北；從天上掉下來 → 月
    { at: 6.4, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: 'monkey', color: '#E86A33' },
    { at: 6.9, dur: 0.6, strokes: [5, 6, 7, 8], style: 'drop', from: { x: 80, y: 0 }, color: '#3D7DD8' },
  ],
  glyph: [{ at: 7.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'burst', x: 74, y: 44, emoji: '3️⃣', dur: 0.5 },
    { at: 1.1, kind: 'burst', x: 74, y: 44, emoji: '2️⃣', dur: 0.5 },
    { at: 1.8, kind: 'burst', x: 74, y: 44, emoji: '1️⃣', dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'rabbit', emoji: '🤫', dur: 0.7 },
    { at: 3.4, kind: 'bubble', actor: 'monkey', emoji: '❓', dur: 0.6 },
    { at: 3.5, kind: 'pop', actor: 'rabbit', emoji: '😆', dur: 0.5 },
    { at: 4.5, kind: 'bubble', actor: 'monkey', emoji: '❓', dur: 0.5 },
    { at: 5.7, kind: 'sweat', actor: 'monkey' },
    { at: 6.2, kind: 'pop', actor: 'rabbit', emoji: '👉', dur: 0.4 },
    { at: 6.35, kind: 'pop', actor: 'monkey', emoji: '😱', dur: 0.6 },
    { at: 8.2, kind: 'pop', actor: 'monkey', emoji: '🤫', dur: 0.7 },
    { at: 8.8, kind: 'pop', actor: 'rabbit', emoji: '❗', dur: 0.6 },
  ],
  camera: [
    { at: 5.0, dur: 0.7, do: 'punch', amount: 0.2, to: { x: 62, y: 60 } },
  ],
  cues: [
    { at: 0.4, sfx: 'blip' }, { at: 1.1, sfx: 'blip' }, { at: 1.8, sfx: 'blip' },
    { at: 1.4, say: '背' },
    { at: 2.95, sfx: 'tap' },
    { at: 4.0, sfx: 'tap' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 6.2, sfx: 'tap' },
    { at: 6.35, sfx: 'boing' },
    { at: 7.55, say: '背' },
    { at: 8.55, say: '背後' },
    { at: 8.8, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
