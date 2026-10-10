import type { Clip } from '../clip'

// 嘴：鯨魚在海底打哈欠，嘴一張，小魚被吸進去；再張更大，螃蟹抓不住也被吸進去；第三口吸進一隻河豚——河豚在肚子裡鼓起來，
// 鯨魚脹成大氣球，「噗」把大家吐出來變成「嘴」。最後鯨魚又打哈欠，河豚又飄過來，鯨魚嚇得立刻閉嘴。嘴、嘴、嘴巴
const clip: Clip = {
  char: '嘴',
  meta: { theme: '鯨魚大嘴', cast: '鯨魚＋小魚＋螃蟹＋河豚', gags: ['越吸越大口', '吞錯東西脹起來', '全部吐出來', '嚇到立刻閉嘴'] },
  duration: 10,
  bg: { top: '#C8F5EC', bottom: '#6CC7C0', floor: '#D9C48E', scenery: 'ocean' },
  actors: [
    { id: 'hippo', emoji: '🐳', x: 130, y: 52, size: 34, hidden: true, float: true },
    { id: 'fish', emoji: '🐠', x: 40, y: 40, size: 11, hidden: true, float: true, flip: true },
    { id: 'crab', emoji: '🦀', x: 30, y: 72, size: 12, hidden: true },
    { id: 'puffer', emoji: '🐡', x: 60, y: 46, size: 11, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hippo', do: 'pop' },
    { at: 0, actor: 'fish', do: 'enter', from: { x: -10, y: 40 }, dur: 0.7 },
    { at: 0.22, actor: 'crab', do: 'pop' },
    // 第一口：小魚
    { at: 1, actor: 'hippo', do: 'squash', amount: -0.35, dur: 0.9 },
    { at: 1.43, actor: 'fish', do: 'moveTo', to: { x: 116, y: 54 }, dur: 0.5 },
    { at: 1.43, actor: 'fish', do: 'spin', dur: 0.5, times: 2 },
    { at: 1.96, actor: 'fish', do: 'vanish', dur: 0.1 },
    { at: 2.01, actor: 'hippo', do: 'squash', amount: 0.15, dur: 0.25 },
    // 第二口：螃蟹抓不住
    { at: 2.7, actor: 'hippo', do: 'squash', amount: -0.45, dur: 0.9 },
    { at: 2.7, actor: 'crab', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 3.09, actor: 'crab', do: 'moveTo', to: { x: 116, y: 56 }, dur: 0.45, arc: 6 },
    { at: 3.09, actor: 'crab', do: 'spin', dur: 0.45, times: 2 },
    { at: 3.6, actor: 'crab', do: 'vanish', dur: 0.1 },
    { at: 3.65, actor: 'hippo', do: 'squash', amount: 0.15, dur: 0.25 },
    // 第三口：河豚
    { at: 3.48, actor: 'puffer', do: 'enter', from: { x: -10, y: 46 }, dur: 0.5 },
    { at: 4.1, actor: 'hippo', do: 'squash', amount: -0.5, dur: 0.6 },
    { at: 4.16, actor: 'puffer', do: 'moveTo', to: { x: 116, y: 54 }, dur: 0.4 },
    { at: 4.62, actor: 'puffer', do: 'vanish', dur: 0.1 },
    // 河豚在肚子裡鼓起來
    { at: 4.8, actor: 'hippo', do: 'scaleTo', amount: 1.35, dur: 0.3 },
    { at: 5.09, actor: 'hippo', do: 'shake', amount: 1.2, dur: 0.35 },
    // 噗——全部吐出來
    { at: 5.5, actor: 'hippo', do: 'scaleTo', amount: 0.74, dur: 0.3 },
    { at: 5.5, actor: 'hippo', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 5.55, actor: 'fish', do: 'moveTo', to: { x: 26, y: 30 }, dur: 0 },
    { at: 5.55, actor: 'fish', do: 'pop' },
    { at: 5.65, actor: 'crab', do: 'moveTo', to: { x: 22, y: 72 }, dur: 0 },
    { at: 5.65, actor: 'crab', do: 'pop' },
    { at: 5.76, actor: 'puffer', do: 'moveTo', to: { x: 112, y: 22 }, dur: 0 },
    { at: 5.76, actor: 'puffer', do: 'pop' },
    // 嘴巴張超大
    { at: 7.9, actor: 'hippo', do: 'squash', amount: -0.5, dur: 0.8 },
    { at: 7.9, actor: 'hippo', do: 'flash', dur: 0.8 },
    { at: 7.99, actor: 'fish', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 7.99, actor: 'crab', do: 'hop', amount: 5, dur: 0.35 },
    // 又打哈欠，河豚又飄過來——立刻閉嘴
    { at: 8.75, actor: 'hippo', do: 'squash', amount: -0.4, dur: 0.6 },
    { at: 8.75, actor: 'puffer', do: 'moveTo', to: { x: 117, y: 60 }, dur: 0.55 },
    { at: 9.21, actor: 'hippo', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 9.21, actor: 'puffer', do: 'scaleTo', amount: 2, dur: 0.2 },
    { at: 9.4, actor: 'hippo', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.4, actor: 'hippo', do: 'shake', amount: 1.2, dur: 0.6 },
  ],
  builds: [
    // 吐出來的東西：小魚 → 口；螃蟹 → 此；河豚 → 角
    { at: 5.5, dur: 0.45, strokes: [0, 1, 2], from: 'hippo', color: '#E2556F' },
    { at: 5.86, dur: 0.6, strokes: [3, 4, 5, 6, 7, 8], from: 'hippo', color: '#F29E38' },
    { at: 6.33, dur: 0.7, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'hippo', color: '#2E7FC4' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.67, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.67, kind: 'zzz', actor: 'fish', emoji: '🫧', dur: 0.8 },
    { at: 1.11, kind: 'pop', actor: 'hippo', emoji: '😪', dur: 0.5, dx: -16, dy: 8 },
    { at: 2.17, kind: 'bubble', actor: 'hippo', emoji: '😋', dur: 0.5, dx: -20, dy: 6 },
    { at: 2.59, kind: 'pop', actor: 'crab', emoji: '❗', dur: 0.4 },
    { at: 4.86, kind: 'pop', actor: 'hippo', emoji: '😳', dur: 0.5, dx: -20, dy: 8 },
    { at: 5.09, kind: 'sweat', actor: 'hippo', dx: -6 },
    { at: 5.5, kind: 'burst', actor: 'hippo', emoji: '🫧', n: 7, dur: 0.6, dx: -12, dy: 10 },
    { at: 5.76, kind: 'dizzy', actor: 'crab', dur: 1.0 },
    { at: 5.86, kind: 'dizzy', actor: 'fish', dur: 1.0 },
    { at: 7.9, kind: 'burst', actor: 'hippo', emoji: '✨', n: 6, dur: 0.6, dx: -10, dy: 10 },
    { at: 7.99, kind: 'pop', actor: 'fish', emoji: '❗', dur: 0.4 },
    { at: 9.29, kind: 'pop', actor: 'hippo', emoji: '😱', dur: 0.6, dx: -4 },
    { at: 9.37, kind: 'sweat', actor: 'hippo', dx: -6 },
  ],
  camera: [
    { at: 4.8, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 124, y: 52 } },
    { at: 7.9, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 122, y: 52 } },
  ],
  cues: [
    { at: 1.43, sfx: 'whoosh' },
    { at: 1.48, say: '嘴' },
    { at: 2.01, sfx: 'gulp' },
    { at: 3.09, sfx: 'whoosh' },
    { at: 3.65, sfx: 'gulp' },
    { at: 4.62, sfx: 'gulp' },
    { at: 4.8, sfx: 'bubble' },
    { at: 5.5, sfx: 'poof' },
    { at: 7.05, say: '嘴' },
    { at: 8.03, say: '嘴巴' },
    { at: 9.21, sfx: 'clink' },
    { at: 9.29, sfx: 'deflate' },
    { at: 9.75, sfx: 'cheer' },
  ],
}

export default clip
