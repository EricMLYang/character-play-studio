import type { Clip } from '../clip'

// 海：企鵝拿著滑板來衝浪。第一個小浪就跌進水裡，第二個大浪把牠捲上天、滑板飛走；第三個超級大浪打下來，浪花變成「海」。
// 海豚跳出來表演完美翻轉，企鵝也學著翻——結果臉直接栽進水裡。海、海、海豚
const clip: Clip = {
  char: '海',
  meta: { theme: '衝浪', cast: '企鵝＋海浪＋海豚', gags: ['漸強失敗', '浪越來越大', '模仿失敗', '臉栽進水裡'] },
  duration: 10,
  bg: { top: '#FFE8C2', bottom: '#BFE9FF', floor: '#3FA9DD', scenery: 'hills' },
  actors: [
    { id: 'board', emoji: '🛹', x: 28, y: 73.6, size: 8, hidden: true },
    { id: 'peng', emoji: '🐧', x: 28, y: 67, size: 12, hidden: true },
    { id: 'w1', emoji: '🌊', x: 140, y: 71.1, size: 14, hidden: true },
    { id: 'w2', emoji: '🌊', x: 140, y: 67.8, size: 22, hidden: true },
    { id: 'w3', emoji: '🌊', x: 128, y: 60.2, size: 40, hidden: true },
    { id: 'dolphin', emoji: '🐬', x: 136, y: 58, size: 14, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'board', do: 'enter', from: { x: -15, y: 73.6 }, dur: 0.7 },
    { at: 0, actor: 'peng', do: 'enter', from: { x: -15, y: 67 }, dur: 0.7 },
    { at: 0.7, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.25 },
    // 第一個小浪
    { at: 1.3, actor: 'w1', do: 'enter', from: { x: 180, y: 71.1 }, dur: 0.4 },
    { at: 1.5, actor: 'w1', do: 'bounce', dur: 0.4, times: 1, amount: 3 },
    { at: 1.9, actor: 'w1', do: 'moveTo', to: { x: 30, y: 71.1 }, dur: 0.5 },
    { at: 2.1, actor: 'peng', do: 'tilt', amount: 25, dur: 0.3 },
    { at: 2.4, actor: 'peng', do: 'rotateTo', amount: 90, dur: 0.2 },
    { at: 2.4, actor: 'w1', do: 'moveTo', to: { x: -25, y: 71.1 }, dur: 0.4 },
    { at: 3.0, actor: 'peng', do: 'rotateTo', amount: -90, dur: 0.2 },
    // 第二個大浪：捲上天，滑板飛走
    { at: 3.2, actor: 'w2', do: 'enter', from: { x: 190, y: 67.8 }, dur: 0.4 },
    { at: 3.3, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 3.6, actor: 'w2', do: 'moveTo', to: { x: 30, y: 67.8 }, dur: 0.4 },
    { at: 3.95, actor: 'peng', do: 'hop', amount: 22, dur: 0.6 },
    { at: 3.95, actor: 'peng', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.95, actor: 'board', do: 'moveTo', to: { x: 66, y: 24 }, dur: 0.5, arc: 10 },
    { at: 3.95, actor: 'board', do: 'spin', times: 3, dur: 0.5 },
    { at: 4.0, actor: 'w2', do: 'moveTo', to: { x: -30, y: 67.8 }, dur: 0.4 },
    { at: 4.45, actor: 'board', do: 'vanish', dur: 0.2 },
    { at: 4.55, actor: 'peng', do: 'moveTo', to: { x: 24, y: 72 }, dur: 0.1 },
    { at: 4.55, actor: 'peng', do: 'squash', amount: 0.4, dur: 0.3 },
    // 第三個超級大浪
    { at: 4.9, actor: 'w3', do: 'enter', from: { x: 190, y: 60.2 }, dur: 0.4 },
    { at: 5.3, actor: 'w3', do: 'moveTo', to: { x: 80, y: 56 }, dur: 0.3 },
    { at: 5.3, actor: 'peng', do: 'moveTo', to: { x: 16, y: 72 }, dur: 0.3 },
    { at: 5.6, actor: 'w3', do: 'vanish', dur: 0.3 },
    // 海豚表演
    { at: 7.0, actor: 'dolphin', do: 'enter', from: { x: 150, y: 92 }, dur: 0.6, arc: 14 },
    { at: 7.3, actor: 'dolphin', do: 'spin', times: 1, dur: 0.6 },
    // 企鵝學翻：臉栽進水裡
    { at: 8.3, actor: 'peng', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 8.6, actor: 'peng', do: 'hop', amount: 18, dur: 0.6 },
    { at: 8.6, actor: 'peng', do: 'spin', times: 1, dur: 0.45 },
    { at: 9.05, actor: 'peng', do: 'rotateTo', amount: 90, dur: 0.15 },
    { at: 9.2, actor: 'peng', do: 'shake', amount: 1, dur: 0.5 },
    { at: 9.3, actor: 'dolphin', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 浪花打下來：三點水先落，每 從浪頭飛出
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2], from: 'w3', style: 'drop', color: '#1E7FD8' },
    { at: 5.7, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9], from: { x: 80, y: 56 }, color: '#00A6A6' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'peng', emoji: '🏄', dur: 0.7 },
    { at: 2.4, kind: 'burst', actor: 'peng', emoji: '💧', n: 6, dur: 0.5 },
    { at: 2.7, kind: 'bubble', actor: 'peng', emoji: '😑', dur: 0.5 },
    { at: 3.95, kind: 'burst', actor: 'peng', emoji: '💧', n: 7, dur: 0.5 },
    { at: 4.6, kind: 'dizzy', actor: 'peng', dur: 0.7 },
    { at: 4.9, kind: 'pop', actor: 'peng', emoji: '😱', dur: 0.5 },
    { at: 5.35, kind: 'fountain', actor: 'w3', n: 9, dur: 0.8 },
    { at: 7.3, kind: 'burst', actor: 'dolphin', emoji: '✨', n: 6, dur: 0.6 },
    { at: 7.8, kind: 'bubble', actor: 'peng', emoji: '🤩', dur: 0.5 },
    { at: 9.1, kind: 'burst', actor: 'peng', emoji: '💧', n: 6, dur: 0.5 },
    { at: 9.4, kind: 'pop', actor: 'dolphin', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 5.3, dur: 0.4, do: 'shake', amount: 2 },
    { at: 9.1, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 30, y: 66 } },
  ],
  cues: [
    { at: 1.5, say: '海' },
    { at: 2.4, sfx: 'splash' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 3.95, sfx: 'splash' },
    { at: 4.6, sfx: 'bonk' },
    { at: 4.9, sfx: 'rumble' },
    { at: 5.35, sfx: 'splash' },
    { at: 6.6, say: '海' },
    { at: 7.0, sfx: 'splash' },
    { at: 7.6, say: '海豚' },
    { at: 8.6, sfx: 'boing' },
    { at: 9.1, sfx: 'splash' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
