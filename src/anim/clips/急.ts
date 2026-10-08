import type { Clip } from '../clip'

// 急：運動場的廁所大排長龍，企鵝急著上廁所，在隊伍後面跳來跳去、夾腿轉圈。前面的烏龜慢吞吞，想插隊又被長頸鹿用脖子擋回來。
// 企鵝急到頭上響起警報，退後助跑、肚子貼地滑過去，把大家撞飛衝進廁所。出來一臉舒服——才走一步，又急了，再衝回去。急、急、緊急
const clip: Clip = {
  char: '急',
  meta: { theme: '排隊上廁所', cast: '企鵝＋大象＋長頸鹿＋烏龜', gags: ['憋尿舞漸強', '前面慢吞吞', '插隊被擋', '肚子滑行撞飛大家', '出來又急了'] },
  duration: 10,
  bg: { top: '#E9F3FF', bottom: '#CFE2FA', floor: '#D46A4C', scenery: 'track' },
  actors: [
    { id: 'door', emoji: '🚪', x: 150, y: 70.7, size: 15 },
    { id: 'ele', emoji: '🐘', x: 136, y: 71.1, size: 14, flip: true },
    { id: 'giraffe', emoji: '🦒', x: 122, y: 69.4, size: 18, flip: true },
    { id: 'turtle', emoji: '🐢', x: 111, y: 72.8, size: 10, flip: true },
    { id: 'peng', emoji: '🐧', x: 98, y: 72, size: 12, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'peng', do: 'enter', from: { x: -12, y: 72 }, dur: 0.6 },
    // 原地急跳
    { at: 1.0, actor: 'peng', do: 'bounce', amount: 3, times: 4, dur: 1.0 },
    // 大象進去，隊伍往前（烏龜好慢）
    { at: 2.0, actor: 'ele', do: 'moveTo', to: { x: 150, y: 71.1 }, dur: 0.4 },
    { at: 2.35, actor: 'ele', do: 'vanish', dur: 0.15 },
    { at: 2.45, actor: 'door', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.5, actor: 'giraffe', do: 'moveTo', to: { x: 136, y: 69.4 }, dur: 0.5 },
    { at: 2.5, actor: 'turtle', do: 'moveTo', to: { x: 122, y: 72.8 }, dur: 1.8 },
    { at: 2.2, actor: 'peng', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 2.5, actor: 'peng', do: 'spin', dur: 0.4 },
    // 想插隊：被長頸鹿的脖子擋回來
    { at: 3.1, actor: 'peng', do: 'moveTo', to: { x: 112, y: 72 }, dur: 0.3, arc: 10 },
    { at: 3.2, actor: 'giraffe', do: 'tilt', amount: -30, dur: 0.4 },
    { at: 3.45, actor: 'peng', do: 'moveTo', to: { x: 96, y: 72 }, dur: 0.35, arc: 8 },
    // 憋尿舞高峰
    { at: 3.9, actor: 'peng', do: 'spin', times: 3, dur: 0.6 },
    { at: 3.9, actor: 'peng', do: 'bounce', amount: 4, times: 3, dur: 0.6 },
    // 退後助跑
    { at: 4.6, actor: 'peng', do: 'moveTo', to: { x: 34, y: 72 }, dur: 0.6 },
    { at: 5.3, actor: 'peng', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 6.3, actor: 'peng', do: 'squash', amount: -0.35, dur: 0.5 },
    // 肚子貼地滑過去，把大家撞飛
    { at: 7.0, actor: 'peng', do: 'moveTo', to: { x: 146, y: 74 }, dur: 0.4 },
    { at: 7.0, actor: 'peng', do: 'squash', amount: 0.45, dur: 0.4 },
    { at: 7.2, actor: 'turtle', do: 'hop', amount: 14, dur: 0.5 },
    { at: 7.2, actor: 'turtle', do: 'spin', dur: 0.5 },
    { at: 7.28, actor: 'giraffe', do: 'hop', amount: 16, dur: 0.5 },
    { at: 7.28, actor: 'giraffe', do: 'spin', dur: 0.5 },
    { at: 7.4, actor: 'peng', do: 'vanish', dur: 0.12 },
    { at: 7.5, actor: 'door', do: 'shake', amount: 1.5, dur: 0.4 },
    // 出來好舒服……又急了
    { at: 8.3, actor: 'peng', do: 'moveTo', to: { x: 146, y: 72 }, dur: 0.01 },
    { at: 8.32, actor: 'peng', do: 'pop' },
    { at: 8.6, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.4 },
    { at: 9.0, actor: 'peng', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 9.3, actor: 'peng', do: 'spin', dur: 0.3 },
    { at: 9.35, actor: 'peng', do: 'vanish', dur: 0.15 },
    { at: 9.5, actor: 'door', do: 'shake', amount: 1.5, dur: 0.3 },
  ],
  builds: [
    // 跳舞甩出的汗 → 刍；噗通噗通的心 → 心
    { at: 4.4, dur: 0.8, strokes: [0, 1, 2, 3, 4], from: 'peng', color: '#3D7DD8' },
    { at: 5.2, dur: 0.6, strokes: [5, 6, 7, 8], from: 'peng', color: '#E84A5F' },
  ],
  glyph: [{ at: 5.8, dur: 0.4, do: 'wobble' }, { at: 7.45, dur: 0.4, do: 'shake' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'peng', emoji: '🚽', dur: 0.6 },
    { at: 1.1, kind: 'sweat', actor: 'peng' },
    { at: 2.5, kind: 'sweat', actor: 'peng' },
    { at: 2.8, kind: 'bubble', actor: 'turtle', emoji: '🐌', dur: 0.6 },
    { at: 3.3, kind: 'pop', actor: 'giraffe', emoji: '😠', dur: 0.6, dx: -8 },
    { at: 3.8, kind: 'pop', actor: 'peng', emoji: '😖', dur: 0.4 },
    { at: 4.0, kind: 'sweat', actor: 'peng' },
    { at: 5.1, kind: 'pop', actor: 'peng', emoji: '💓', dur: 0.5 },
    { at: 6.8, kind: 'pop', actor: 'peng', emoji: '🚨', dur: 0.8 },
    { at: 7.0, kind: 'puff', actor: 'peng' },
    { at: 7.7, kind: 'dizzy', actor: 'turtle', dur: 1.0 },
    { at: 7.75, kind: 'dizzy', actor: 'giraffe', dur: 1.0 },
    { at: 8.4, kind: 'bubble', actor: 'peng', emoji: '😌', dur: 0.5, dx: -14 },
    { at: 9.0, kind: 'pop', actor: 'peng', emoji: '❗', dur: 0.35, dx: -12 },
    { at: 9.4, kind: 'bubble', actor: 'giraffe', emoji: '😑', dur: 0.6, dx: -16 },
  ],
  camera: [
    { at: 3.9, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 96, y: 64 } },
    { at: 7.45, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 1.3, say: '急' },
    { at: 2.45, sfx: 'bonk' },
    { at: 3.2, sfx: 'boing' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 5.9, say: '急' },
    { at: 6.85, say: '緊急' },
    { at: 7.0, sfx: 'slide' },
    { at: 7.45, sfx: 'bonk' },
    { at: 8.3, sfx: 'poof' },
    { at: 9.3, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
