import type { Clip } from '../clip'

// 急：運動場的廁所大排長龍，企鵝急著上廁所，在隊伍後面跳來跳去。想插隊，被長頸鹿用脖子擋回來。
// 急到頭上響起警報，退後、肚子貼地滑過去，把大家撞飛衝進廁所。出來一臉舒服——又急了，再衝回去。急、急、緊急
const clip: Clip = {
  char: '急',
  meta: { theme: '排隊上廁所', cast: '企鵝＋大象＋長頸鹿', gags: ['憋尿舞漸強', '插隊被擋', '肚子滑行撞飛大家', '出來又急了'] },
  duration: 10,
  bg: { top: '#DCEEFF', bottom: '#F2F7FF', floor: '#D46A4C', scenery: 'track' },
  actors: [
    { id: 'door', emoji: '🚪', x: 152, y: 68, size: 20 },
    { id: 'ele', emoji: '🐘', x: 139, y: 70, size: 17, flip: true },
    { id: 'giraffe', emoji: '🦒', x: 123, y: 67, size: 24, flip: true },
    { id: 'peng', emoji: '🐧', x: 100, y: 70.5, size: 15, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'peng', do: 'enter', from: { x: -12, y: 70.5 }, dur: 0.7 },
    // 原地急跳
    { at: 1.0, actor: 'peng', do: 'bounce', amount: 3, times: 4, dur: 1.2 },
    // 想插隊：被長頸鹿的脖子擋回來
    { at: 2.5, actor: 'peng', do: 'moveTo', to: { x: 112, y: 70.5 }, dur: 0.35, arc: 10 },
    { at: 2.65, actor: 'giraffe', do: 'tilt', amount: -30, dur: 0.45 },
    { at: 2.85, actor: 'peng', do: 'moveTo', to: { x: 98, y: 70.5 }, dur: 0.4, arc: 8 },
    { at: 3.25, actor: 'peng', do: 'squash', amount: 0.3, dur: 0.3 },
    // 憋尿舞高峰
    { at: 3.8, actor: 'peng', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.8, actor: 'peng', do: 'bounce', amount: 4, times: 3, dur: 0.6 },
    // 退後、蓄力
    { at: 4.6, actor: 'peng', do: 'moveTo', to: { x: 26, y: 70.5 }, dur: 0.6 },
    { at: 5.4, actor: 'peng', do: 'shake', amount: 1.2, dur: 1.0 },
    { at: 6.4, actor: 'peng', do: 'squash', amount: -0.35, dur: 0.4 },
    // 肚子貼地滑過去，把大家撞飛
    { at: 6.85, actor: 'peng', do: 'rotateTo', amount: 90, dur: 0.1 },
    { at: 6.85, actor: 'peng', do: 'moveTo', to: { x: 148, y: 76 }, dur: 0.45 },
    { at: 7.15, actor: 'giraffe', do: 'hop', amount: 16, dur: 0.6 },
    { at: 7.15, actor: 'giraffe', do: 'spin', dur: 0.6 },
    { at: 7.25, actor: 'ele', do: 'hop', amount: 14, dur: 0.6 },
    { at: 7.25, actor: 'ele', do: 'spin', dur: 0.6 },
    { at: 7.3, actor: 'peng', do: 'vanish', dur: 0.12 },
    { at: 7.4, actor: 'door', do: 'shake', amount: 1.5, dur: 0.4 },
    // 出來好舒服……又急了
    { at: 8.3, actor: 'peng', do: 'rotateTo', amount: -90, dur: 0.01 },
    { at: 8.3, actor: 'peng', do: 'moveTo', to: { x: 154, y: 72 }, dur: 0.01 },
    { at: 8.32, actor: 'peng', do: 'pop' },
    { at: 8.6, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.5 },
    { at: 9.2, actor: 'peng', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 9.5, actor: 'peng', do: 'vanish', dur: 0.15 },
    { at: 9.6, actor: 'door', do: 'shake', amount: 1.5, dur: 0.3 },
  ],
  builds: [
    // 跳舞甩出的汗 → 上面；噗通噗通的心 → 心
    { at: 4.9, dur: 0.8, strokes: [0, 1, 2, 3, 4], from: 'peng', color: '#3D7DD8' },
    { at: 5.6, dur: 0.6, strokes: [5, 6, 7, 8], from: 'peng', color: '#E84A5F' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 7.35, dur: 0.4, do: 'shake' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'peng', emoji: '🚽', dur: 1.1 },
    { at: 1.6, kind: 'sweat', actor: 'peng' },
    { at: 2.8, kind: 'pop', actor: 'giraffe', emoji: '😠', dur: 0.8, dx: -8 },
    { at: 3.6, kind: 'pop', actor: 'peng', emoji: '😖', dur: 0.6 },
    { at: 5.5, kind: 'pop', actor: 'peng', emoji: '💓', dur: 0.5 },
    { at: 6.0, kind: 'pop', actor: 'peng', emoji: '🚨', dur: 0.8 },
    { at: 6.85, kind: 'puff', actor: 'peng' },
    { at: 7.7, kind: 'dizzy', actor: 'giraffe', dur: 1.2 },
    { at: 7.8, kind: 'dizzy', actor: 'ele', dur: 1.2 },
    { at: 8.4, kind: 'bubble', actor: 'peng', emoji: '😌', dur: 0.7, dx: -14 },
    { at: 9.2, kind: 'pop', actor: 'peng', emoji: '❗', dur: 0.4, dx: -12 },
  ],
  camera: [
    { at: 3.8, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 98, y: 62 } },
    { at: 7.35, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 1.4, say: '急' },
    { at: 2.65, sfx: 'boing' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 6.3, say: '急' },
    { at: 6.85, sfx: 'slide' },
    { at: 7.35, sfx: 'bonk' },
    { at: 7.9, say: '緊急' },
    { at: 8.3, sfx: 'poof' },
    { at: 9.5, sfx: 'whoosh' },
    { at: 9.7, sfx: 'cheer' },
  ],
}

export default clip
