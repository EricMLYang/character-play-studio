import type { Clip } from '../clip'

// 都：小熊溜滑梯，咻——好好玩！兔子也爬上去、小豬也爬上去、大象也爬上去，全都擠在滑梯頂端，滑梯被壓得彎彎的……
// 「咻——」全部一起滑下來，疊成一座小山，彈起來的星星變成「都」。最上面的大象又爬回滑梯：再一次！都、都、全都
const clip: Clip = {
  char: '都',
  meta: { theme: '溜滑梯', cast: '小熊＋兔子＋小豬＋大象', gags: ['越擠越多', '滑梯被壓彎', '全部疊成小山'] },
  duration: 10,
  bg: { top: '#DDF2FF', bottom: '#F6FBEE', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'slide', emoji: '🛝', x: 30, y: 63, size: 30, hidden: true },
    { id: 'bear', emoji: '🐻', x: 22, y: 50, size: 13, hidden: true },
    { id: 'bunny', emoji: '🐰', x: -10, y: 70, size: 13, hidden: true },
    { id: 'pig', emoji: '🐷', x: -10, y: 70, size: 13, hidden: true },
    { id: 'ele', emoji: '🐘', x: -10, y: 68, size: 18, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'slide', do: 'pop' },
    { at: 0.2, actor: 'bear', do: 'pop' },
    // 小熊滑下來——好好玩
    { at: 0.8, actor: 'bear', do: 'moveTo', to: { x: 54, y: 71 }, dur: 0.6 },
    { at: 1.6, actor: 'bear', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 2.2, actor: 'bear', do: 'moveTo', to: { x: 22, y: 50 }, dur: 0.5, arc: 14 },
    // 兔子、小豬、大象也爬上去
    { at: 2.6, actor: 'bunny', do: 'pop' },
    { at: 2.7, actor: 'bunny', do: 'moveTo', to: { x: 22, y: 40 }, dur: 0.5, arc: 10 },
    { at: 3.3, actor: 'pig', do: 'pop' },
    { at: 3.4, actor: 'pig', do: 'moveTo', to: { x: 22, y: 30 }, dur: 0.5, arc: 10 },
    { at: 4.0, actor: 'ele', do: 'pop' },
    { at: 4.1, actor: 'ele', do: 'moveTo', to: { x: 22, y: 18 }, dur: 0.6, arc: 10 },
    // 滑梯被壓得彎彎的
    { at: 5.0, actor: 'slide', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 5.0, actor: 'ele', do: 'shake', amount: 1, dur: 0.5 },
    // 咻——全部一起滑下來，疊成小山
    { at: 5.6, actor: 'bear', do: 'moveTo', to: { x: 136, y: 70 }, dur: 0.7 },
    { at: 5.65, actor: 'bunny', do: 'moveTo', to: { x: 136, y: 59 }, dur: 0.7 },
    { at: 5.7, actor: 'pig', do: 'moveTo', to: { x: 136, y: 48 }, dur: 0.7 },
    { at: 5.75, actor: 'ele', do: 'moveTo', to: { x: 136, y: 34 }, dur: 0.75 },
    { at: 6.5, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    // 最上面的大象爬回去——再一次！
    { at: 8.4, actor: 'ele', do: 'moveTo', to: { x: 22, y: 50 }, dur: 0.8, arc: 20 },
  ],
  builds: [
    // 疊成小山彈起來的星星
    { at: 6.4, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: { x: 136, y: 40 }, color: '#E86A33' },
    { at: 6.9, dur: 0.5, strokes: [8, 9], from: 'slide', color: '#3D7DD8' },
  ],
  glyph: [{ at: 7.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.5, kind: 'pop', actor: 'bear', emoji: '😆', dur: 0.7 },
    { at: 4.9, kind: 'pop', actor: 'bear', emoji: '😳', dur: 0.5 },
    { at: 5.1, kind: 'sweat', actor: 'pig' },
    { at: 6.4, kind: 'burst', x: 136, y: 44, emoji: '⭐', n: 7, dur: 0.6 },
    { at: 6.6, kind: 'dizzy', actor: 'ele', dur: 1.0 },
    { at: 9.2, kind: 'pop', actor: 'ele', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 5.0, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 30, y: 36 } },
    { at: 6.4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 0.8, sfx: 'slide' },
    { at: 1.6, say: '都' },
    { at: 2.9, sfx: 'tap' }, { at: 3.6, sfx: 'tap' }, { at: 4.3, sfx: 'tap' },
    { at: 5.0, sfx: 'deflate' },
    { at: 5.6, sfx: 'slide' },
    { at: 6.4, sfx: 'bonk' },
    { at: 7.5, say: '都' },
    { at: 8.4, say: '全都' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
