import type { Clip } from '../clip'

// 喝：渴到快不行的機器人，一杯接一杯灌，喝完把杯子往後一丟，飛出去的杯子變成「喝」的筆畫。
// 肚子越喝越大，最後還硬喝一口水——噗！從頭頂噴成噴泉，躺平睡著，還打了個嗝。喝、喝、喝水
const clip: Clip = {
  char: '喝',
  meta: { theme: '機器人', cast: '機器人', gags: ['越喝越胖', '噴泉', '睡著打嗝', '丟出去的東西變筆畫'] },
  duration: 10,
  bg: { top: '#FFE6EC', bottom: '#FFD2DD', floor: '#D8F3EE', scenery: 'hills' },
  actors: [
    { id: 'bot', emoji: '🤖', x: 26, y: 71, size: 13, hidden: true },
    { id: 'c1', emoji: '🥤', x: 40, y: 64, size: 8, hidden: true },
    { id: 'c2', emoji: '🥤', x: 40, y: 64, size: 8, hidden: true },
    { id: 'c3', emoji: '🥤', x: 40, y: 64, size: 8, hidden: true },
    { id: 'tap', emoji: '🚰', x: 44, y: 56, size: 10, hidden: true, float: true },
  ],
  moves: [
    // 拖著腳步走進來
    { at: 0, actor: 'bot', do: 'enter', dur: 0.9 },
    { at: 0, actor: 'bot', do: 'tilt', amount: 8, dur: 0.9 },
    // 第一杯
    { at: 1.6, actor: 'c1', do: 'pop' },
    { at: 1.6, actor: 'bot', do: 'hop', dur: 0.3, amount: 5 },
    { at: 1.9, actor: 'c1', do: 'moveTo', to: { x: 35, y: 68 }, dur: 0.15 },
    { at: 1.9, actor: 'c1', do: 'rotateTo', amount: -40, dur: 0.15 },
    { at: 2.0, actor: 'bot', do: 'squash', dur: 0.2 }, { at: 2.2, actor: 'bot', do: 'squash', dur: 0.2 }, { at: 2.4, actor: 'bot', do: 'squash', dur: 0.2 },
    { at: 2.6, actor: 'bot', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    { at: 2.7, actor: 'c1', do: 'moveTo', to: { x: 60, y: 8 }, dur: 0.4 },
    { at: 2.7, actor: 'c1', do: 'spin', dur: 0.4, times: 2 },
    { at: 3.05, actor: 'c1', do: 'vanish', dur: 0.1 },
    // 第二杯，喝更快
    { at: 3.4, actor: 'c2', do: 'pop' },
    { at: 3.6, actor: 'c2', do: 'moveTo', to: { x: 37, y: 67 }, dur: 0.12 },
    { at: 3.6, actor: 'c2', do: 'rotateTo', amount: -40, dur: 0.12 },
    { at: 3.7, actor: 'bot', do: 'squash', dur: 0.15 }, { at: 3.85, actor: 'bot', do: 'squash', dur: 0.15 },
    { at: 4.0, actor: 'bot', do: 'scaleTo', amount: 1.15, dur: 0.25 },
    { at: 4.2, actor: 'c2', do: 'moveTo', to: { x: 102, y: 6 }, dur: 0.4 },
    { at: 4.2, actor: 'c2', do: 'spin', dur: 0.4, times: 2 },
    { at: 4.55, actor: 'c2', do: 'vanish', dur: 0.1 },
    // 第三杯
    { at: 4.6, actor: 'c3', do: 'pop' },
    { at: 4.75, actor: 'c3', do: 'moveTo', to: { x: 39, y: 66 }, dur: 0.1 },
    { at: 4.75, actor: 'c3', do: 'rotateTo', amount: -40, dur: 0.1 },
    { at: 4.85, actor: 'bot', do: 'squash', dur: 0.15 }, { at: 5.0, actor: 'bot', do: 'squash', dur: 0.15 },
    { at: 5.1, actor: 'bot', do: 'scaleTo', amount: 1.12, dur: 0.25 },
    { at: 5.3, actor: 'c3', do: 'moveTo', to: { x: 82, y: 4 }, dur: 0.35 },
    { at: 5.3, actor: 'c3', do: 'spin', dur: 0.35, times: 2 },
    { at: 5.6, actor: 'c3', do: 'vanish', dur: 0.1 },
    // 撐到了……還是硬喝一口水
    { at: 6.3, actor: 'tap', do: 'pop' },
    { at: 6.4, actor: 'bot', do: 'shake', dur: 0.4, amount: 1 },
    { at: 6.9, actor: 'bot', do: 'squash', dur: 0.25 },
    { at: 7.0, actor: 'bot', do: 'scaleTo', amount: 1.25, dur: 0.4 },
    { at: 7.4, actor: 'bot', do: 'shake', dur: 0.4, amount: 1.6 },
    // 噗——
    { at: 7.8, actor: 'bot', do: 'scaleTo', amount: 0.54, dur: 0.3 },
    { at: 7.8, actor: 'bot', do: 'spin', dur: 0.5 },
    { at: 8.3, actor: 'tap', do: 'vanish' },
    { at: 8.4, actor: 'bot', do: 'rotateTo', amount: 80, dur: 0.35 },
    { at: 9.3, actor: 'bot', do: 'hop', dur: 0.25, amount: 4 },
  ],
  builds: [
    { at: 3.0, dur: 0.6, strokes: [0, 1, 2], from: { x: 60, y: 10 }, color: '#14A99A' },
    { at: 4.5, dur: 0.7, strokes: [3, 4, 5, 6], from: { x: 102, y: 8 }, color: '#14A99A' },
    { at: 5.6, dur: 0.9, strokes: [7, 8, 9, 10, 11], from: { x: 82, y: 6 }, color: '#14A99A' },
  ],
  glyph: [{ at: 6.6, dur: 0.5, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'sweat', actor: 'bot' },
    { at: 0.9, kind: 'bubble', actor: 'bot', emoji: '💧', dur: 1.0 },
    { at: 1.6, kind: 'pop', actor: 'bot', emoji: '❗', dur: 0.5 },
    { at: 6.4, kind: 'sweat', actor: 'bot' },
    { at: 7.8, kind: 'fountain', actor: 'bot', n: 9, dur: 1.0 },
    { at: 8.6, kind: 'zzz', actor: 'bot', dur: 1.4 },
    { at: 9.3, kind: 'pop', actor: 'bot', emoji: '💭', dur: 0.4 },
  ],
  camera: [
    { at: 7.8, dur: 0.9, do: 'punch', amount: 0.3, to: { x: 26, y: 62 } },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.6, sfx: 'blip' },
    { at: 2.0, say: '喝' },
    { at: 2.05, sfx: 'gulp' },
    { at: 2.7, sfx: 'whoosh' },
    { at: 3.7, sfx: 'gulp' },
    { at: 4.2, sfx: 'whoosh' },
    { at: 4.85, sfx: 'gulp' },
    { at: 5.3, sfx: 'whoosh' },
    { at: 6.1, say: '喝' },
    { at: 7.05, say: '喝水' },
    { at: 7.0, sfx: 'gulp' },
    { at: 7.8, sfx: 'splash' },
    { at: 9.3, sfx: 'hic' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
