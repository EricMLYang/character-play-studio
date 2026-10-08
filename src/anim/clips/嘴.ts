import type { Clip } from '../clip'

// 嘴：河馬在海底打哈欠，嘴一張，小魚被吸進去；再張更大，螃蟹抓不住也被吸進去；第三口吸進一隻河豚——河豚在肚子裡鼓起來，
// 河馬脹成大氣球，「噗」把大家吐出來變成「嘴」。最後河馬又打哈欠，河豚又飄過來，河馬嚇得立刻閉嘴。嘴、嘴、嘴巴
const clip: Clip = {
  char: '嘴',
  meta: { theme: '河馬大嘴', cast: '河馬＋小魚＋螃蟹＋河豚', gags: ['越吸越大口', '吞錯東西脹起來', '全部吐出來', '嚇到立刻閉嘴'] },
  duration: 10,
  bg: { top: '#C8F5EC', bottom: '#6CC7C0', floor: '#D9C48E', scenery: 'ocean' },
  actors: [
    { id: 'hippo', emoji: '🦛', x: 132, y: 66.1, size: 26, hidden: true },
    { id: 'fish', emoji: '🐠', x: 40, y: 40, size: 8, hidden: true, float: true, flip: true },
    { id: 'crab', emoji: '🦀', x: 30, y: 73.2, size: 9, hidden: true },
    { id: 'puffer', emoji: '🐡', x: 60, y: 46, size: 8, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hippo', do: 'pop' },
    { at: 0, actor: 'fish', do: 'enter', from: { x: -10, y: 40 }, dur: 0.7 },
    { at: 0.2, actor: 'crab', do: 'pop' },
    // 第一口：小魚
    { at: 0.9, actor: 'hippo', do: 'squash', amount: -0.35, dur: 0.9 },
    { at: 1.3, actor: 'fish', do: 'moveTo', to: { x: 118, y: 62 }, dur: 0.5 },
    { at: 1.3, actor: 'fish', do: 'spin', dur: 0.5, times: 2 },
    { at: 1.8, actor: 'fish', do: 'vanish', dur: 0.1 },
    { at: 1.85, actor: 'hippo', do: 'squash', amount: 0.15, dur: 0.25 },
    // 第二口：螃蟹抓不住
    { at: 2.5, actor: 'hippo', do: 'squash', amount: -0.45, dur: 0.9 },
    { at: 2.5, actor: 'crab', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 2.85, actor: 'crab', do: 'moveTo', to: { x: 118, y: 64 }, dur: 0.45, arc: 6 },
    { at: 2.85, actor: 'crab', do: 'spin', dur: 0.45, times: 2 },
    { at: 3.3, actor: 'crab', do: 'vanish', dur: 0.1 },
    { at: 3.35, actor: 'hippo', do: 'squash', amount: 0.15, dur: 0.25 },
    // 第三口：河豚
    { at: 3.2, actor: 'puffer', do: 'enter', from: { x: -10, y: 46 }, dur: 0.5 },
    { at: 3.75, actor: 'hippo', do: 'squash', amount: -0.5, dur: 0.6 },
    { at: 3.8, actor: 'puffer', do: 'moveTo', to: { x: 118, y: 62 }, dur: 0.4 },
    { at: 4.2, actor: 'puffer', do: 'vanish', dur: 0.1 },
    // 河豚在肚子裡鼓起來
    { at: 4.35, actor: 'hippo', do: 'scaleTo', amount: 1.35, dur: 0.3 },
    { at: 4.6, actor: 'hippo', do: 'shake', amount: 1.2, dur: 0.35 },
    // 噗——全部吐出來
    { at: 4.95, actor: 'hippo', do: 'scaleTo', amount: 0.74, dur: 0.3 },
    { at: 4.95, actor: 'hippo', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 5.0, actor: 'fish', do: 'moveTo', to: { x: 26, y: 30 }, dur: 0 },
    { at: 5.0, actor: 'fish', do: 'pop' },
    { at: 5.1, actor: 'crab', do: 'moveTo', to: { x: 22, y: 73.2 }, dur: 0 },
    { at: 5.1, actor: 'crab', do: 'pop' },
    { at: 5.2, actor: 'puffer', do: 'moveTo', to: { x: 112, y: 22 }, dur: 0 },
    { at: 5.2, actor: 'puffer', do: 'pop' },
    // 嘴巴張超大
    { at: 7.3, actor: 'hippo', do: 'squash', amount: -0.5, dur: 0.8 },
    { at: 7.3, actor: 'hippo', do: 'flash', dur: 0.8 },
    { at: 7.4, actor: 'fish', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 7.4, actor: 'crab', do: 'hop', amount: 5, dur: 0.35 },
    // 又打哈欠，河豚又飄過來——立刻閉嘴
    { at: 8.3, actor: 'hippo', do: 'squash', amount: -0.4, dur: 0.6 },
    { at: 8.3, actor: 'puffer', do: 'moveTo', to: { x: 116, y: 56 }, dur: 0.55 },
    { at: 8.9, actor: 'hippo', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 8.9, actor: 'puffer', do: 'scaleTo', amount: 2, dur: 0.2 },
    { at: 9.15, actor: 'hippo', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.15, actor: 'hippo', do: 'shake', amount: 1.2, dur: 0.6 },
  ],
  builds: [
    // 吐出來的東西：小魚 → 口；螃蟹 → 此；河豚 → 角
    { at: 4.95, dur: 0.45, strokes: [0, 1, 2], from: 'hippo', color: '#E2556F' },
    { at: 5.3, dur: 0.6, strokes: [3, 4, 5, 6, 7, 8], from: 'hippo', color: '#F29E38' },
    { at: 5.75, dur: 0.7, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'hippo', color: '#2E7FC4' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'zzz', actor: 'fish', emoji: '🫧', dur: 0.8 },
    { at: 1.0, kind: 'pop', actor: 'hippo', emoji: '😪', dur: 0.5, dx: -16, dy: 8 },
    { at: 2.0, kind: 'bubble', actor: 'hippo', emoji: '😋', dur: 0.5, dx: -20, dy: 6 },
    { at: 2.4, kind: 'pop', actor: 'crab', emoji: '❗', dur: 0.4 },
    { at: 4.4, kind: 'pop', actor: 'hippo', emoji: '😳', dur: 0.5, dx: -20, dy: 8 },
    { at: 4.6, kind: 'sweat', actor: 'hippo', dx: -6 },
    { at: 4.95, kind: 'burst', actor: 'hippo', emoji: '🫧', n: 7, dur: 0.6, dx: -12, dy: 10 },
    { at: 5.2, kind: 'dizzy', actor: 'crab', dur: 1.0 },
    { at: 5.3, kind: 'dizzy', actor: 'fish', dur: 1.0 },
    { at: 7.3, kind: 'burst', actor: 'hippo', emoji: '✨', n: 6, dur: 0.6, dx: -10, dy: 10 },
    { at: 7.4, kind: 'pop', actor: 'fish', emoji: '❗', dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'hippo', emoji: '😱', dur: 0.6, dx: -4 },
    { at: 9.1, kind: 'sweat', actor: 'hippo', dx: -6 },
  ],
  camera: [
    { at: 4.35, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 128, y: 60 } },
    { at: 7.3, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 124, y: 60 } },
  ],
  cues: [
    { at: 1.3, sfx: 'whoosh' },
    { at: 1.35, say: '嘴' },
    { at: 1.85, sfx: 'gulp' },
    { at: 2.85, sfx: 'whoosh' },
    { at: 3.35, sfx: 'gulp' },
    { at: 4.2, sfx: 'gulp' },
    { at: 4.35, sfx: 'bubble' },
    { at: 4.95, sfx: 'poof' },
    { at: 6.45, say: '嘴' },
    { at: 7.45, say: '嘴巴' },
    { at: 8.9, sfx: 'clink' },
    { at: 9.0, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
