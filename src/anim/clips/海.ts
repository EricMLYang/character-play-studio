import type { Clip } from '../clip'

// 海：企鵝拿著滑板來衝浪。第一個小浪就跌進水裡，第二個大浪把牠捲上天、滑板飛走；第三個超級大浪打下來，浪花變成「海」。
// 海豚跳出來表演完美翻轉，企鵝也學著翻——結果臉直接栽進水裡。海、海、海豚
const clip: Clip = {
  char: '海',
  meta: { theme: '衝浪', cast: '企鵝＋海浪＋海豚', gags: ['漸強失敗', '浪越來越大', '模仿失敗', '臉栽進水裡'] },
  duration: 10,
  bg: { top: '#FFE8C2', bottom: '#BFE9FF', floor: '#3FA9DD', scenery: 'sea' },
  actors: [
    { id: 'board', emoji: '🛹', x: 28, y: 72.8, size: 10, hidden: true },
    { id: 'peng', emoji: '🐧', x: 28, y: 67, size: 15, hidden: true },
    { id: 'w1', emoji: '🌊', x: 140, y: 69.6, size: 17.5, hidden: true },
    { id: 'w2', emoji: '🌊', x: 140, y: 67.8, size: 22, hidden: true },
    { id: 'w3', emoji: '🌊', x: 128, y: 60.2, size: 40, hidden: true },
    { id: 'dolphin', emoji: '🐬', x: 136, y: 58, size: 17.5, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'board', do: 'enter', from: { x: -15, y: 72.8 }, dur: 0.7 },
    { at: 0, actor: 'peng', do: 'enter', from: { x: -15, y: 67 }, dur: 0.7 },
    { at: 0.7, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.25 },
    // 第一個小浪
    { at: 1.31, actor: 'w1', do: 'enter', from: { x: 180, y: 69.6 }, dur: 0.4 },
    { at: 1.52, actor: 'w1', do: 'bounce', dur: 0.4, times: 1, amount: 3 },
    { at: 1.95, actor: 'w1', do: 'moveTo', to: { x: 30, y: 69.6 }, dur: 0.5 },
    { at: 2.16, actor: 'peng', do: 'tilt', amount: 25, dur: 0.3 },
    { at: 2.49, actor: 'peng', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 2.49, actor: 'w1', do: 'moveTo', to: { x: -25, y: 69.6 }, dur: 0.4 },
    { at: 3.13, actor: 'peng', do: 'rotateTo', amount: -90, dur: 0.2 },
    // 第二個大浪：捲上天，滑板飛走
    { at: 3.34, actor: 'w2', do: 'enter', from: { x: 190, y: 67.8 }, dur: 0.4 },
    { at: 3.45, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 3.77, actor: 'w2', do: 'moveTo', to: { x: 30, y: 67.8 }, dur: 0.4 },
    { at: 4.15, actor: 'peng', do: 'hop', amount: 22, dur: 0.6 },
    { at: 4.15, actor: 'peng', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.15, actor: 'board', do: 'moveTo', to: { x: 66, y: 24 }, dur: 0.5, arc: 10 },
    { at: 4.15, actor: 'board', do: 'spin', times: 3, dur: 0.5 },
    { at: 4.2, actor: 'w2', do: 'moveTo', to: { x: -30, y: 67.8 }, dur: 0.4 },
    { at: 4.68, actor: 'board', do: 'vanish', dur: 0.2 },
    { at: 4.79, actor: 'peng', do: 'moveTo', to: { x: 24, y: 72 }, dur: 0.1 },
    { at: 4.79, actor: 'peng', do: 'squash', amount: 0.4, dur: 0.3 },
    // 第三個超級大浪
    { at: 5.16, actor: 'w3', do: 'enter', from: { x: 190, y: 60.2 }, dur: 0.4 },
    { at: 5.59, actor: 'w3', do: 'moveTo', to: { x: 80, y: 56 }, dur: 0.3 },
    { at: 5.59, actor: 'peng', do: 'moveTo', to: { x: 16, y: 72 }, dur: 0.3 },
    { at: 5.9, actor: 'w3', do: 'vanish', dur: 0.3 },
    // 海豚表演
    { at: 7.3, actor: 'dolphin', do: 'enter', from: { x: 150, y: 92 }, dur: 0.6, arc: 14 },
    { at: 7.6, actor: 'dolphin', do: 'spin', times: 1, dur: 0.6 },
    // 企鵝學翻：臉栽進水裡
    { at: 8.51, actor: 'peng', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 8.78, actor: 'peng', do: 'hop', amount: 18, dur: 0.6 },
    { at: 8.78, actor: 'peng', do: 'spin', times: 1, dur: 0.45 },
    { at: 9.17, actor: 'peng', do: 'rotateTo', amount: 90, dur: 0.15 },
    { at: 9.3, actor: 'peng', do: 'shake', amount: 1, dur: 0.5 },
    { at: 9.39, actor: 'dolphin', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 浪花打下來：三點水先落，每 從浪頭飛出
    { at: 5.7, dur: 0.6, strokes: [0, 1, 2], from: 'w3', style: 'drop', color: '#1E7FD8' },
    { at: 6, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9], from: { x: 80, y: 56 }, color: '#00A6A6' },
  ],
  glyph: [{ at: 6.9, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'peng', emoji: '🏄', dur: 0.7 },
    { at: 2.49, kind: 'burst', actor: 'peng', emoji: '💧', n: 6, dur: 0.5 },
    { at: 2.81, kind: 'bubble', actor: 'peng', emoji: '😑', dur: 0.5 },
    { at: 4.15, kind: 'burst', actor: 'peng', emoji: '💧', n: 7, dur: 0.5 },
    { at: 4.84, kind: 'dizzy', actor: 'peng', dur: 0.7 },
    { at: 5.16, kind: 'pop', actor: 'peng', emoji: '😱', dur: 0.5 },
    { at: 5.65, kind: 'fountain', actor: 'w3', n: 9, dur: 0.8 },
    { at: 7.6, kind: 'burst', actor: 'dolphin', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.08, kind: 'bubble', actor: 'peng', emoji: '🤩', dur: 0.5 },
    { at: 9.21, kind: 'burst', actor: 'peng', emoji: '💧', n: 6, dur: 0.5 },
    { at: 9.47, kind: 'pop', actor: 'dolphin', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 5.59, dur: 0.4, do: 'shake', amount: 2 },
    { at: 9.21, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 30, y: 66 } },
  ],
  cues: [
    { at: 1.52, say: '海' },
    { at: 2.49, sfx: 'splash' },
    { at: 3.77, sfx: 'whoosh' },
    { at: 4.15, sfx: 'splash' },
    { at: 4.84, sfx: 'bonk' },
    { at: 5.16, sfx: 'rumble' },
    { at: 5.65, sfx: 'splash' },
    { at: 6.9, say: '海' },
    { at: 7.3, sfx: 'splash' },
    { at: 7.9, say: '海豚' },
    { at: 8.78, sfx: 'boing' },
    { at: 9.21, sfx: 'splash' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
