import type { Clip } from '../clip'

// 短：暴龍的手太短了：老鼠拍手，牠拍不到；帽子掉在地上，彎腰撿不到；冰淇淋就在眼前，伸手也搆不到——氣得大吼，帽子和冰淇淋都被吼飛。
// 天上掉下一條短褲剛好穿上，開心跳舞……短褲滑下去了，手太短拉不起來，老鼠趕快遮眼睛。短、短、短褲
const clip: Clip = {
  char: '短',
  meta: { theme: '短手暴龍', cast: '暴龍＋小老鼠', gags: ['手太短搆不到（漸強）', '氣到大吼吼飛東西', '短褲掉下來拉不起來'] },
  duration: 10,
  bg: { top: '#FFF6E0', bottom: '#FFE6B3', floor: '#8CC56B', scenery: 'hills' },
  actors: [
    { id: 'trex', emoji: '🦖', x: 28, y: 66.9, size: 24, hidden: true, flip: true },
    { id: 'shorts', emoji: '🩳', x: 30, y: 71, size: 12.5, hidden: true, float: true },
    { id: 'hat', emoji: '🎩', x: 120, y: 66, size: 8.8, hidden: true, float: true },
    { id: 'ice', emoji: '🍦', x: 120, y: 64, size: 10, hidden: true, float: true },
    { id: 'mouse', emoji: '🐁', x: 128, y: 72.3, size: 11.2, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'trex', do: 'pop' },
    { at: 0.2, actor: 'mouse', do: 'enter', from: { x: 175, y: 72.3 }, dur: 0.6 },
    // 拍手：拍不到
    { at: 0.7, actor: 'mouse', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    { at: 1.31, actor: 'trex', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 1.58, actor: 'trex', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 1.31, actor: 'trex', do: 'shake', amount: 0.8, dur: 0.5 },
    // 帽子：掉了撿不到
    { at: 2.39, actor: 'hat', do: 'pop', dur: 0.15 },
    { at: 2.44, actor: 'hat', do: 'moveTo', to: { x: 36, y: 52 }, arc: 18, dur: 0.6 },
    { at: 3.2, actor: 'hat', do: 'moveTo', to: { x: 46, y: 72 }, dur: 0.35 },
    { at: 3.2, actor: 'hat', do: 'spin', dur: 0.35 },
    { at: 3.63, actor: 'trex', do: 'tilt', amount: 25, dur: 0.6 },
    // 冰淇淋：搆不到
    { at: 4.11, actor: 'ice', do: 'pop', dur: 0.2 },
    { at: 4.22, actor: 'mouse', do: 'moveTo', to: { x: 62, y: 72.3 }, dur: 0.45 },
    { at: 4.22, actor: 'ice', do: 'moveTo', to: { x: 55, y: 64 }, dur: 0.45 },
    { at: 4.76, actor: 'trex', do: 'squash', amount: -0.15, dur: 0.35 },
    { at: 4.76, actor: 'trex', do: 'tilt', amount: 15, dur: 0.35 },
    // 吼——！
    { at: 5.25, actor: 'trex', do: 'squash', amount: -0.25, dur: 0.4 },
    { at: 5.25, actor: 'trex', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 5.3, actor: 'mouse', do: 'moveTo', to: { x: 178, y: 60 }, arc: 10, dur: 0.5 },
    { at: 5.3, actor: 'mouse', do: 'spin', times: 2, dur: 0.5 },
    { at: 5.35, actor: 'hat', do: 'vanish', dur: 0.25 },
    { at: 5.6, actor: 'ice', do: 'vanish', dur: 0.25 },
    // 天上掉下一條短褲
    { at: 7.05, actor: 'shorts', do: 'drop', dur: 0.5 },
    { at: 7.54, actor: 'trex', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 7.77, actor: 'mouse', do: 'moveTo', to: { x: 130, y: 72.3 }, dur: 0.01 },
    { at: 7.81, actor: 'mouse', do: 'enter', from: { x: 178, y: 72.3 }, dur: 0.5 },
    // 開心跳舞……短褲滑下去
    { at: 8.21, actor: 'trex', do: 'bounce', amount: 3, times: 4, dur: 1.0 },
    { at: 8.21, actor: 'shorts', do: 'bounce', amount: 3, times: 4, dur: 1.0 },
    { at: 9.11, actor: 'shorts', do: 'moveTo', to: { x: 30, y: 75.5 }, dur: 0.25 },
    { at: 9.33, actor: 'shorts', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.29, actor: 'trex', do: 'tilt', amount: 20, dur: 0.5 },
  ],
  builds: [
    // 吼飛的帽子 → 矢；吼飛的冰淇淋 → 豆
    { at: 5.3, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'hat', color: '#4D6BD8' },
    { at: 5.55, dur: 0.85, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'ice', color: '#EF6F9A' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'mouse', emoji: '👏', dur: 0.7 },
    { at: 0.9, kind: 'bubble', actor: 'trex', emoji: '👏', dur: 0.4 },
    { at: 1.52, kind: 'pop', actor: 'trex', emoji: '❌', dur: 0.6 },
    { at: 1.96, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.5 },
    { at: 2.06, kind: 'sweat', actor: 'trex' },
    { at: 3.84, kind: 'pop', actor: 'trex', emoji: '😣', dur: 0.5 },
    { at: 4.98, kind: 'pop', actor: 'trex', emoji: '😭', dur: 0.4 },
    { at: 5.25, kind: 'burst', actor: 'trex', dx: 12, dy: 4 },
    { at: 5.3, kind: 'burst', actor: 'trex', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 6 },
    { at: 7.59, kind: 'bubble', actor: 'trex', emoji: '🥳', dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'trex', emoji: '😳', dur: 0.8 },
    { at: 9.33, kind: 'pop', actor: 'mouse', emoji: '🙈', dur: 0.75 },
  ],
  camera: [
    { at: 5.25, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 40, y: 58 } },
    { at: 5.3, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.75, sfx: 'tap' }, { at: 1, sfx: 'tap' },
    { at: 1.31, sfx: 'whoosh' }, { at: 1.58, sfx: 'whoosh' },
    { at: 1.69, say: '短' },
    { at: 2.44, sfx: 'whoosh' },
    { at: 3.57, sfx: 'plop' },
    { at: 5.25, sfx: 'rumble' },
    { at: 6.45, say: '短' },
    { at: 7.5, say: '短褲' },
    { at: 9.11, sfx: 'slide' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
