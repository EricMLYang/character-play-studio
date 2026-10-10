import type { Clip } from '../clip'

// 樹：啄木鳥想在雪地的大樹上啄個洞當家。第一下嘴巴卡住拔不出來、整隻彈飛；第二次啄太快，樹上的松鼠和雪都被震下來。
// 最後轉成鑽頭猛鑽——整棵樹碎成木片變成「樹」。只剩一根樹枝飄下來，啄木鳥在上面啄幾個洞，竟然變成笛子吹出音樂。樹、樹、樹枝
const clip: Clip = {
  char: '樹',
  meta: { theme: '啄木鳥伐木', cast: '啄木鳥＋松鼠＋大樹', gags: ['嘴巴卡住', '啄太快震下松鼠', '變鑽頭失控', '樹枝變笛子'] },
  duration: 10,
  bg: { top: '#E4EEFA', bottom: '#C9DCF1', floor: '#F5F9FD', scenery: 'snow' },
  actors: [
    { id: 'tree', emoji: '🌲', x: 82, y: 57.7, size: 46, hidden: true },
    { id: 'sq', emoji: '🐿️', x: 90, y: 34, size: 10, hidden: true, float: true },
    { id: 'twig', emoji: '🌿', x: 128, y: 72, size: 11.2, hidden: true, float: true },
    { id: 'bird', emoji: '🐦', x: 68, y: 52, size: 11.2, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.2, actor: 'sq', do: 'pop' },
    { at: 0, actor: 'bird', do: 'enter', from: { x: -10, y: 36 }, dur: 0.8 },
    // 啄啄啄
    { at: 1.42, actor: 'bird', do: 'shake', amount: 2, dur: 0.45 },
    // 嘴巴卡住
    { at: 2.01, actor: 'bird', do: 'moveTo', to: { x: 71, y: 52 }, dur: 0.08 },
    { at: 2.11, actor: 'bird', do: 'shake', amount: 1, dur: 0.6 },
    { at: 2.11, actor: 'bird', do: 'tilt', amount: -20, dur: 0.6 },
    { at: 2.81, actor: 'bird', do: 'moveTo', to: { x: 46, y: 44 }, dur: 0.3 },
    { at: 2.81, actor: 'bird', do: 'spin', times: -1, dur: 0.3 },
    // 啄太快：松鼠和雪都震下來
    { at: 3.57, actor: 'bird', do: 'moveTo', to: { x: 68, y: 52 }, dur: 0.2 },
    { at: 3.78, actor: 'bird', do: 'shake', amount: 2.5, dur: 0.8 },
    { at: 3.78, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.8 },
    { at: 3.89, actor: 'sq', do: 'hop', amount: 10, dur: 0.4 },
    { at: 4.32, actor: 'sq', do: 'shake', amount: 1, dur: 0.4 },
    // 變鑽頭猛鑽
    { at: 4.86, actor: 'bird', do: 'moveTo', to: { x: 56, y: 52 }, dur: 0.2 },
    { at: 4.86, actor: 'bird', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 4.86, actor: 'bird', do: 'flash', dur: 0.4 },
    { at: 5.13, actor: 'bird', do: 'moveTo', to: { x: 72, y: 52 }, dur: 0.15 },
    { at: 5.13, actor: 'bird', do: 'spin', times: 4, dur: 0.4 },
    { at: 5.13, actor: 'tree', do: 'shake', amount: 2, dur: 0.3 },
    { at: 5.45, actor: 'tree', do: 'vanish', dur: 0.2 },
    { at: 5.55, actor: 'bird', do: 'moveTo', to: { x: 28, y: 73.2 }, dur: 0.5, arc: 10 },
    { at: 5.55, actor: 'sq', do: 'moveTo', to: { x: 140, y: 73.6 }, dur: 0.6, arc: 12 },
    { at: 6.15, actor: 'sq', do: 'squash', amount: 0.35, dur: 0.25 },
    // 只剩一根樹枝飄下來
    { at: 7.1, actor: 'twig', do: 'enter', from: { x: 118, y: -8 }, dur: 0.8 },
    { at: 7.1, actor: 'twig', do: 'tilt', amount: 30, dur: 0.8 },
    { at: 7.89, actor: 'twig', do: 'bounce', dur: 0.3, times: 1, amount: 1.5 },
    // 啄木鳥飛過去啄洞——變成笛子
    { at: 8.24, actor: 'bird', do: 'moveTo', to: { x: 122, y: 64 }, dur: 0.6, arc: 66 },
    { at: 8.81, actor: 'bird', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: 9.16, actor: 'sq', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
    { at: 9.16, actor: 'bird', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
    { at: 9.16, actor: 'twig', do: 'tilt', amount: -10, dur: 0.8 },
  ],
  builds: [
    // 樹碎成木片和松針
    { at: 5.45, dur: 0.6, strokes: [0, 1, 2, 3], from: 'tree', color: '#8A5A2E' },
    { at: 5.75, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12], from: 'tree', color: '#2E8A58' },
    { at: 6.2, dur: 0.5, strokes: [13, 14, 15], from: 'tree', color: '#B5452F' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'sq', dur: 1.6 },
    { at: 0.85, kind: 'bubble', actor: 'bird', emoji: '🏠', dur: 0.55 },
    { at: 2.17, kind: 'sweat', actor: 'bird', dx: -6 },
    { at: 3.14, kind: 'dizzy', actor: 'bird', dur: 0.6 },
    { at: 3.78, kind: 'rain', actor: 'tree', emoji: '❄️', n: 8, dur: 0.9, dy: 4 },
    { at: 3.89, kind: 'pop', actor: 'sq', emoji: '💢', dur: 0.5 },
    { at: 5.13, kind: 'burst', actor: 'bird', emoji: '💨', n: 5, dur: 0.4 },
    { at: 5.45, kind: 'burst', actor: 'tree', emoji: '🪵', n: 8, dur: 0.7, dy: 16 },
    { at: 6.2, kind: 'dizzy', actor: 'sq', dur: 0.7 },
    { at: 6.3, kind: 'bubble', actor: 'bird', emoji: '😅', dur: 0.5 },
    { at: 7.98, kind: 'pop', actor: 'sq', emoji: '😑', dur: 0.5 },
    { at: 9.12, kind: 'zzz', actor: 'twig', emoji: '🎵', dur: 1.0 },
    { at: 9.21, kind: 'pop', actor: 'sq', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 2.11, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 70, y: 50 } },
    { at: 5.45, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.42, sfx: 'tap' }, { at: 1.58, sfx: 'tap' }, { at: 1.74, sfx: 'tap' },
    { at: 1.52, say: '樹' },
    { at: 2.01, sfx: 'tap' },
    { at: 2.81, sfx: 'boing' },
    { at: 3.78, sfx: 'tap' }, { at: 3.94, sfx: 'tap' }, { at: 4.11, sfx: 'tap' }, { at: 4.27, sfx: 'tap' }, { at: 4.43, sfx: 'tap' },
    { at: 5.13, sfx: 'rumble' },
    { at: 5.45, sfx: 'crack' },
    { at: 6.8, say: '樹' },
    { at: 7.8, say: '樹枝' },
    { at: 8.81, sfx: 'tap' }, { at: 8.94, sfx: 'tap' },
    { at: 9.16, sfx: 'blip' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
