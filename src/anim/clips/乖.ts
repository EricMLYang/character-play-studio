import type { Clip } from '../clip'

// 乖：機器人訓練小狗：「坐下！」小狗趴下；「坐下！」小狗翻滾；「坐下！」小狗終於乖乖坐好——坐在睡覺的貓身上。
// 貓跳起來，小狗被彈上天，餅乾也撒出來變成「乖」。機器人給小狗一塊餅乾獎勵，小狗開心搖尾巴……貓一口搶走。乖、乖、乖乖
const clip: Clip = {
  char: '乖',
  meta: { theme: '訓練小狗', cast: '小狗＋機器人＋貓', gags: ['聽錯指令', '坐在別人身上', '獎勵被搶走'] },
  duration: 10,
  bg: { top: '#E3F5E3', bottom: '#F7FBF2', floor: '#9BCB5B', scenery: 'hills' },
  actors: [
    { id: 'cat', emoji: '🐈', x: 46, y: 71, size: 14, hidden: true },
    { id: 'dog', emoji: '🐕', x: 28, y: 69.5, size: 18, hidden: true, flip: true },
    { id: 'robot', emoji: '🤖', x: 130, y: 68.6, size: 20, hidden: true },
    { id: 'cookie', emoji: '🍪', x: 118, y: 62, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'robot', do: 'pop' },
    { at: 0.1, actor: 'cat', do: 'pop' },
    { at: 0.2, actor: 'dog', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    // 「坐下！」——趴下
    { at: 1.0, actor: 'robot', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 1.4, actor: 'dog', do: 'squash', amount: 0.4, dur: 0.6 },
    // 「坐下！」——翻滾
    { at: 2.6, actor: 'robot', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 3.0, actor: 'dog', do: 'spin', dur: 0.6 },
    { at: 3.0, actor: 'dog', do: 'hop', amount: 6, dur: 0.6 },
    // 「坐下！」——乖乖坐好……坐在貓身上
    { at: 4.2, actor: 'robot', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 4.6, actor: 'dog', do: 'moveTo', to: { x: 46, y: 62 }, dur: 0.4, arc: 8 },
    { at: 5.0, actor: 'cat', do: 'squash', amount: 0.35, dur: 0.4 },
    // 貓跳起來——小狗被彈上天
    { at: 5.6, actor: 'cat', do: 'hop', amount: 10, dur: 0.4 },
    { at: 5.65, actor: 'dog', do: 'moveTo', to: { x: 24, y: 69.5 }, dur: 0.7, arc: 30 },
    { at: 5.65, actor: 'dog', do: 'spin', dur: 0.7 },
    { at: 6.0, actor: 'cat', do: 'moveTo', to: { x: 116, y: 71 }, dur: 0.5 },
    // 機器人給小狗一塊餅乾獎勵——貓一口搶走
    { at: 8.0, actor: 'cookie', do: 'pop' },
    { at: 8.2, actor: 'cookie', do: 'moveTo', to: { x: 36, y: 62 }, dur: 0.5, arc: 10 },
    { at: 8.7, actor: 'dog', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 9.0, actor: 'cat', do: 'moveTo', to: { x: 40, y: 66 }, dur: 0.25, arc: 8 },
    { at: 9.2, actor: 'cookie', do: 'vanish', dur: 0.1 },
    { at: 9.3, actor: 'cat', do: 'moveTo', to: { x: 140, y: 71 }, dur: 0.5 },
  ],
  builds: [
    // 小狗被彈上天、撒出來的餅乾屑
    { at: 5.7, dur: 0.6, strokes: [0, 1, 2], from: 'dog', color: '#C68642' },
    { at: 6.1, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: 'cat', color: '#3D7DD8' },
  ],
  glyph: [{ at: 6.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'pop', actor: 'robot', emoji: '👇', dur: 0.6 },
    { at: 0.3, kind: 'zzz', actor: 'cat', dur: 4.7 },
    { at: 2.0, kind: 'bubble', actor: 'robot', emoji: '😑', dur: 0.5 },
    { at: 2.6, kind: 'pop', actor: 'robot', emoji: '👇', dur: 0.6 },
    { at: 3.6, kind: 'bubble', actor: 'robot', emoji: '😑', dur: 0.5 },
    { at: 4.2, kind: 'pop', actor: 'robot', emoji: '👇', dur: 0.6 },
    { at: 5.0, kind: 'pop', actor: 'dog', emoji: '😇', dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'cat', emoji: '😾', dur: 0.6 },
    { at: 6.4, kind: 'dizzy', actor: 'dog', dur: 1.0 },
    { at: 8.7, kind: 'pop', actor: 'dog', emoji: '😋', dur: 0.5 },
    { at: 9.3, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.7 },
  ],
  camera: [
    { at: 4.8, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 46, y: 60 } },
  ],
  cues: [
    { at: 1.0, sfx: 'blip' },
    { at: 1.4, say: '乖' },
    { at: 2.6, sfx: 'blip' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 4.2, sfx: 'blip' },
    { at: 5.0, sfx: 'plop' },
    { at: 5.6, sfx: 'boing' },
    { at: 6.8, say: '乖' },
    { at: 7.7, say: '乖乖' },
    { at: 9.0, sfx: 'gulp' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
