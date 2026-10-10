import type { Clip } from '../clip'

// 沙：小熊在海邊用水桶倒出一座沙堡，浪一來就沖走；牠倒一座更大的，結果浪也變得超大，「嘩」地壓下來，
// 浪花變成三點水、沙堡變成「少」。螃蟹在海灘傘下一秒蓋好一座完美的小沙堡，小熊看傻了——然後浪只打到小熊。沙、沙、沙灘
const clip: Clip = {
  char: '沙',
  meta: { theme: '海灘沙堡', cast: '熊＋海浪＋螃蟹', gags: ['蓋好就被沖走', '越蓋越大浪越大', '螃蟹一秒蓋好', '浪只打熊'] },
  duration: 10,
  bg: { top: '#BDE9FF', bottom: '#8FD6F7', floor: '#F3D9A0', scenery: 'hills' },
  actors: [
    { id: 'beach', emoji: '🏖️', x: 140, y: 67.5, size: 22.5, hidden: true },
    { id: 'castle', emoji: '🏰', x: 60, y: 70.7, size: 15, hidden: true },
    { id: 'mini', emoji: '🏰', x: 114, y: 72.8, size: 10, hidden: true },
    { id: 'crab', emoji: '🦀', x: 124, y: 72.3, size: 11.2, hidden: true },
    { id: 'bear', emoji: '🐻', x: 30, y: 69.6, size: 17.5, hidden: true },
    { id: 'bucket', emoji: '🪣', x: 42, y: 72.8, size: 10, hidden: true },
    { id: 'wave', emoji: '🌊', x: 70, y: 66, size: 20, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -12, y: 69.6 }, dur: 0.6 },
    { at: 0, actor: 'bucket', do: 'enter', from: { x: 0, y: 72.8 }, dur: 0.6 },
    // 倒出第一座沙堡
    { at: 0.8, actor: 'bucket', do: 'moveTo', to: { x: 60, y: 66 }, arc: 6, dur: 0.3 },
    { at: 0.8, actor: 'bucket', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 1.15, actor: 'castle', do: 'pop', dur: 0.3 },
    { at: 1.15, actor: 'bucket', do: 'moveTo', to: { x: 42, y: 72.8 }, arc: 6, dur: 0.3 },
    { at: 1.15, actor: 'bucket', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 1.52, actor: 'bear', do: 'hop', amount: 4, dur: 0.3 },
    // 浪來了：沖走
    { at: 1.84, actor: 'wave', do: 'enter', from: { x: 180, y: 66 }, dur: 0.6 },
    { at: 2.49, actor: 'castle', do: 'vanish', dur: 0.2 },
    { at: 2.7, actor: 'wave', do: 'moveTo', to: { x: 190, y: 66 }, dur: 0.5 },
    // 倒一座更大的
    { at: 3.51, actor: 'bucket', do: 'moveTo', to: { x: 60, y: 66 }, arc: 6, dur: 0.3 },
    { at: 3.51, actor: 'bucket', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 3.89, actor: 'castle', do: 'pop', dur: 0.3 },
    { at: 3.89, actor: 'castle', do: 'scaleTo', amount: 1.6, dur: 0.3 },
    { at: 3.89, actor: 'bucket', do: 'moveTo', to: { x: 42, y: 72.8 }, arc: 6, dur: 0.3 },
    { at: 3.89, actor: 'bucket', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 4.15, actor: 'bear', do: 'hop', amount: 5, dur: 0.3 },
    // 浪也變得超大
    { at: 4.31, actor: 'wave', do: 'moveTo', to: { x: 108, y: 58 }, dur: 0.4 },
    { at: 4.53, actor: 'wave', do: 'scaleTo', amount: 2.2, dur: 0.5 },
    { at: 4.64, actor: 'bear', do: 'moveTo', to: { x: 24, y: 69.6 }, dur: 0.2 },
    { at: 5.17, actor: 'wave', do: 'moveTo', to: { x: 66, y: 60 }, dur: 0.25 },
    { at: 5.44, actor: 'castle', do: 'vanish', dur: 0.15 },
    { at: 5.6, actor: 'wave', do: 'vanish', dur: 0.3 },
    { at: 5.5, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    // 海灘傘下的螃蟹
    { at: 7.3, actor: 'beach', do: 'pop' },
    { at: 7.3, actor: 'crab', do: 'enter', from: { x: 175, y: 72.3 }, dur: 0.5 },
    { at: 7.79, actor: 'crab', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.24, actor: 'mini', do: 'pop', dur: 0.3 },
    // 小浪只打到小熊
    { at: 8.68, actor: 'wave', do: 'moveTo', to: { x: -14, y: 66 }, dur: 0.01 },
    { at: 8.72, actor: 'wave', do: 'pop', dur: 0.05 },
    { at: 8.76, actor: 'wave', do: 'moveTo', to: { x: 22, y: 66 }, dur: 0.35 },
    { at: 9.07, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.21, actor: 'wave', do: 'moveTo', to: { x: -16, y: 66 }, dur: 0.4 },
    { at: 9.29, actor: 'crab', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
  ],
  builds: [
    // 浪花 → 三點水；沙堡的沙 → 少
    { at: 5.55, dur: 0.5, strokes: [0, 1, 2], from: 'wave', color: '#2E8FD8' },
    { at: 5.9, dur: 0.8, strokes: [3, 4, 5, 6], from: { x: 60, y: 68 }, color: '#E0A53A' },
  ],
  glyph: [{ at: 6.7, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.15, kind: 'burst', actor: 'castle', emoji: '✨', n: 5, dur: 0.5 },
    { at: 2.49, kind: 'fountain', actor: 'castle', emoji: '💦', n: 6, dur: 0.6 },
    { at: 2.81, kind: 'sweat', actor: 'bear' },
    { at: 3.03, kind: 'bubble', actor: 'bear', emoji: '😑', dur: 0.5 },
    { at: 4.21, kind: 'bubble', actor: 'bear', emoji: '😎', dur: 0.4 },
    { at: 4.64, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.5 },
    { at: 5.44, kind: 'burst', actor: 'castle', emoji: '💦', n: 8, dur: 0.6 },
    { at: 5.8, kind: 'dizzy', actor: 'bear', dur: 0.9 },
    { at: 8.24, kind: 'burst', actor: 'mini', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.32, kind: 'bubble', actor: 'crab', emoji: '😎', dur: 0.5 },
    { at: 8.5, kind: 'pop', actor: 'bear', emoji: '😮', dur: 0.5 },
    { at: 9.07, kind: 'fountain', actor: 'bear', emoji: '💦', n: 7, dur: 0.6 },
    { at: 9.38, kind: 'bubble', actor: 'bear', emoji: '😑', dur: 0.6 },
  ],
  camera: [
    { at: 4.64, dur: 0.7, do: 'punch', amount: 0.2, to: { x: 96, y: 50 } },
    { at: 5.44, dur: 0.5, do: 'shake', amount: 2.2 },
  ],
  cues: [
    { at: 1.15, sfx: 'plop' },
    { at: 1.31, say: '沙' },
    { at: 2.49, sfx: 'splash' },
    { at: 3.89, sfx: 'plop' },
    { at: 4.53, sfx: 'rumble' },
    { at: 5.44, sfx: 'splash' },
    { at: 6.75, say: '沙' },
    { at: 7.75, say: '沙灘' },
    { at: 8.24, sfx: 'blip' },
    { at: 9.07, sfx: 'splash' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
