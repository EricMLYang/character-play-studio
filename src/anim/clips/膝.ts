import type { Clip } from '../clip'

// 膝：袋鼠選手賽前檢查，醫生用小槌子敲膝蓋：第一下小踢、第二下槌子被踢飛、換大槌子用力敲——醫生直接被踢到跑道另一頭。
// 貼上護膝以為沒事了；袋鼠跳過去回敲醫生的膝蓋，換醫生自己彈上天。膝、膝、護膝
const clip: Clip = {
  char: '膝',
  meta: { theme: '運動員健康檢查', cast: '袋鼠＋醫生＋槌子', gags: ['越敲踢越大力（漸強）', '醫生被踢飛', '換袋鼠回敲醫生'] },
  duration: 10,
  bg: { top: '#EAFBF0', bottom: '#C8F0D5', floor: '#D46A5C', scenery: 'track' },
  actors: [
    { id: 'roo', emoji: '🦘', x: 26, y: 68.6, size: 20, hidden: true },
    { id: 'pad', emoji: '🩹', x: 31, y: 71, size: 7.5, hidden: true, float: true },
    { id: 'doc', emoji: '🧑‍⚕️', x: 56, y: 69.6, size: 17.5, hidden: true },
    { id: 'hammer', emoji: '🔨', x: 46, y: 70, size: 8.8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'roo', do: 'pop' },
    { at: 0.2, actor: 'doc', do: 'enter', from: { x: 175, y: 69.6 }, dur: 0.7 },
    { at: 0.2, actor: 'hammer', do: 'enter', from: { x: 165, y: 70 }, dur: 0.7 },
    // 第一下：小小踢一下
    { at: 1.05, actor: 'hammer', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 1.25, actor: 'roo', do: 'hop', amount: 4, dur: 0.35 },
    // 第二下：槌子被踢飛
    { at: 2.13, actor: 'hammer', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 2.35, actor: 'roo', do: 'hop', amount: 12, dur: 0.5 },
    { at: 2.35, actor: 'roo', do: 'tilt', amount: -20, dur: 0.5 },
    { at: 2.4, actor: 'hammer', do: 'hop', amount: 28, dur: 0.7 },
    { at: 2.4, actor: 'hammer', do: 'spin', times: 2, dur: 0.7 },
    // 換大槌子
    { at: 3.38, actor: 'hammer', do: 'scaleTo', amount: 2, dur: 0.4 },
    { at: 3.98, actor: 'hammer', do: 'tilt', amount: 50, dur: 0.3 },
    // 踢！醫生飛到跑道另一頭
    { at: 4.2, actor: 'roo', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 4.2, actor: 'roo', do: 'hop', amount: 22, dur: 0.6 },
    { at: 4.2, actor: 'roo', do: 'spin', dur: 0.6 },
    { at: 4.25, actor: 'doc', do: 'moveTo', to: { x: 142, y: 69.6 }, arc: 26, dur: 0.7 },
    { at: 4.25, actor: 'doc', do: 'spin', times: 2, dur: 0.7 },
    { at: 4.25, actor: 'hammer', do: 'moveTo', to: { x: 120, y: 30 }, arc: 10, dur: 0.6 },
    { at: 4.25, actor: 'hammer', do: 'spin', times: 3, dur: 0.6 },
    { at: 4.85, actor: 'roo', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5, actor: 'doc', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 5.25, actor: 'hammer', do: 'vanish', dur: 0.3 },
    // 貼上護膝
    { at: 7.2, actor: 'pad', do: 'pop', dur: 0.3 },
    { at: 7.3, actor: 'pad', do: 'flash', dur: 0.6 },
    { at: 7.48, actor: 'roo', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 7.48, actor: 'pad', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 袋鼠跳過去回敲醫生的膝蓋
    { at: 8.2, actor: 'roo', do: 'moveTo', to: { x: 120, y: 68.6 }, arc: 34, dur: 0.45 },
    { at: 8.2, actor: 'pad', do: 'moveTo', to: { x: 125, y: 71 }, arc: 34, dur: 0.45 },
    { at: 8.65, actor: 'roo', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 8.83, actor: 'roo', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 8.96, actor: 'doc', do: 'hop', amount: 24, dur: 0.7 },
    { at: 8.96, actor: 'doc', do: 'spin', dur: 0.7 },
    { at: 9.6, actor: 'doc', do: 'squash', amount: 0.3, dur: 0.3 },
  ],
  builds: [
    // 袋鼠的大長腿 → 月；被踢碎的大槌子 → 桼
    { at: 4.8, dur: 0.6, strokes: [0, 1, 2, 3], from: 'roo', color: '#3D7DD8' },
    { at: 5.2, dur: 1.0, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], from: 'hammer', color: '#E2563A' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'roo', emoji: '😬', dur: 0.6 },
    { at: 1.64, kind: 'pop', actor: 'doc', emoji: '👍', dur: 0.5 },
    { at: 2.56, kind: 'pop', actor: 'doc', emoji: '😳', dur: 0.6 },
    { at: 2.89, kind: 'puff', actor: 'roo' },
    { at: 3.27, kind: 'bubble', actor: 'doc', emoji: '😤', dur: 0.6 },
    { at: 3.6, kind: 'sweat', actor: 'roo' },
    { at: 4.2, kind: 'burst', actor: 'roo', dx: 10, dy: 12 },
    { at: 4.85, kind: 'puff', actor: 'roo' },
    { at: 5.05, kind: 'dizzy', actor: 'doc', dur: 1.3 },
    { at: 7.66, kind: 'pop', actor: 'doc', emoji: '😌', dur: 0.5 },
    { at: 8.65, kind: 'puff', actor: 'roo' },
    { at: 8.96, kind: 'pop', actor: 'roo', emoji: '😆', dur: 0.8 },
    { at: 9.6, kind: 'puff', actor: 'doc' },
  ],
  camera: [
    { at: 4.2, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 36, y: 62 } },
    { at: 5, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.2, sfx: 'tap' },
    { at: 1.36, say: '膝' },
    { at: 2.29, sfx: 'tap' },
    { at: 2.4, sfx: 'whoosh' },
    { at: 4.15, sfx: 'bonk' },
    { at: 4.25, sfx: 'whoosh' },
    { at: 5, sfx: 'plop' },
    { at: 6.25, say: '膝' },
    { at: 7.3, say: '護膝' },
    { at: 8.2, sfx: 'boing' },
    { at: 8.92, sfx: 'tap' },
    { at: 8.96, sfx: 'whoosh' },
    { at: 9.6, sfx: 'plop' },
    { at: 9.73, sfx: 'cheer' },
  ],
}

export default clip
