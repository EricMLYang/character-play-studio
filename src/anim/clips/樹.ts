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
    { id: 'sq', emoji: '🐿️', x: 90, y: 34, size: 8, hidden: true, float: true },
    { id: 'twig', emoji: '🌿', x: 128, y: 72, size: 9, hidden: true, float: true },
    { id: 'bird', emoji: '🐦', x: 68, y: 52, size: 9, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.2, actor: 'sq', do: 'pop' },
    { at: 0, actor: 'bird', do: 'enter', from: { x: -10, y: 36 }, dur: 0.8 },
    // 啄啄啄
    { at: 1.4, actor: 'bird', do: 'shake', amount: 2, dur: 0.45 },
    // 嘴巴卡住
    { at: 1.95, actor: 'bird', do: 'moveTo', to: { x: 71, y: 52 }, dur: 0.08 },
    { at: 2.05, actor: 'bird', do: 'shake', amount: 1, dur: 0.6 },
    { at: 2.05, actor: 'bird', do: 'tilt', amount: -20, dur: 0.6 },
    { at: 2.7, actor: 'bird', do: 'moveTo', to: { x: 46, y: 44 }, dur: 0.3 },
    { at: 2.7, actor: 'bird', do: 'spin', times: -1, dur: 0.3 },
    // 啄太快：松鼠和雪都震下來
    { at: 3.4, actor: 'bird', do: 'moveTo', to: { x: 68, y: 52 }, dur: 0.2 },
    { at: 3.6, actor: 'bird', do: 'shake', amount: 2.5, dur: 0.8 },
    { at: 3.6, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.8 },
    { at: 3.7, actor: 'sq', do: 'hop', amount: 10, dur: 0.4 },
    { at: 4.1, actor: 'sq', do: 'shake', amount: 1, dur: 0.4 },
    // 變鑽頭猛鑽
    { at: 4.6, actor: 'bird', do: 'moveTo', to: { x: 56, y: 52 }, dur: 0.2 },
    { at: 4.6, actor: 'bird', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 4.6, actor: 'bird', do: 'flash', dur: 0.4 },
    { at: 4.85, actor: 'bird', do: 'moveTo', to: { x: 72, y: 52 }, dur: 0.15 },
    { at: 4.85, actor: 'bird', do: 'spin', times: 4, dur: 0.4 },
    { at: 4.85, actor: 'tree', do: 'shake', amount: 2, dur: 0.3 },
    { at: 5.15, actor: 'tree', do: 'vanish', dur: 0.2 },
    { at: 5.25, actor: 'bird', do: 'moveTo', to: { x: 28, y: 73.2 }, dur: 0.5, arc: 10 },
    { at: 5.25, actor: 'sq', do: 'moveTo', to: { x: 140, y: 73.6 }, dur: 0.6, arc: 12 },
    { at: 5.85, actor: 'sq', do: 'squash', amount: 0.35, dur: 0.25 },
    // 只剩一根樹枝飄下來
    { at: 6.8, actor: 'twig', do: 'enter', from: { x: 118, y: -8 }, dur: 0.8 },
    { at: 6.8, actor: 'twig', do: 'tilt', amount: 30, dur: 0.8 },
    { at: 7.6, actor: 'twig', do: 'bounce', dur: 0.3, times: 1, amount: 1.5 },
    // 啄木鳥飛過去啄洞——變成笛子
    { at: 8.0, actor: 'bird', do: 'moveTo', to: { x: 122, y: 64 }, dur: 0.6, arc: 66 },
    { at: 8.65, actor: 'bird', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: 9.05, actor: 'sq', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
    { at: 9.05, actor: 'bird', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
    { at: 9.05, actor: 'twig', do: 'tilt', amount: -10, dur: 0.8 },
  ],
  builds: [
    // 樹碎成木片和松針
    { at: 5.15, dur: 0.6, strokes: [0, 1, 2, 3], from: 'tree', color: '#8A5A2E' },
    { at: 5.45, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12], from: 'tree', color: '#2E8A58' },
    { at: 5.9, dur: 0.5, strokes: [13, 14, 15], from: 'tree', color: '#B5452F' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'sq', dur: 1.6 },
    { at: 0.85, kind: 'bubble', actor: 'bird', emoji: '🏠', dur: 0.55 },
    { at: 2.1, kind: 'sweat', actor: 'bird', dx: -6 },
    { at: 3.0, kind: 'dizzy', actor: 'bird', dur: 0.6 },
    { at: 3.6, kind: 'rain', actor: 'tree', emoji: '❄️', n: 8, dur: 0.9, dy: 4 },
    { at: 3.7, kind: 'pop', actor: 'sq', emoji: '💢', dur: 0.5 },
    { at: 4.85, kind: 'burst', actor: 'bird', emoji: '💨', n: 5, dur: 0.4 },
    { at: 5.15, kind: 'burst', actor: 'tree', emoji: '🪵', n: 8, dur: 0.7, dy: 16 },
    { at: 5.9, kind: 'dizzy', actor: 'sq', dur: 0.7 },
    { at: 6.0, kind: 'bubble', actor: 'bird', emoji: '😅', dur: 0.5 },
    { at: 7.7, kind: 'pop', actor: 'sq', emoji: '😑', dur: 0.5 },
    { at: 9.0, kind: 'zzz', actor: 'twig', emoji: '🎵', dur: 1.0 },
    { at: 9.1, kind: 'pop', actor: 'sq', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 2.05, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 70, y: 50 } },
    { at: 5.15, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.4, sfx: 'tap' }, { at: 1.55, sfx: 'tap' }, { at: 1.7, sfx: 'tap' },
    { at: 1.5, say: '樹' },
    { at: 1.95, sfx: 'tap' },
    { at: 2.7, sfx: 'boing' },
    { at: 3.6, sfx: 'tap' }, { at: 3.75, sfx: 'tap' }, { at: 3.9, sfx: 'tap' }, { at: 4.05, sfx: 'tap' }, { at: 4.2, sfx: 'tap' },
    { at: 4.85, sfx: 'rumble' },
    { at: 5.15, sfx: 'crack' },
    { at: 6.5, say: '樹' },
    { at: 7.5, say: '樹枝' },
    { at: 8.65, sfx: 'tap' }, { at: 8.8, sfx: 'tap' },
    { at: 9.05, sfx: 'blip' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
