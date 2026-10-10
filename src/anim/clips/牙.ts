import type { Clip } from '../clip'

// 牙：小魚在海底游泳，一條大鯊魚慢慢游過來，張開大嘴露出一排牙——小魚和螃蟹嚇得逃走。螃蟹鼓起勇氣夾牠鼻子，
// 鯊魚竟然哭了：原來牠只是牙痛。大家幫牠刷牙，泡泡變成「牙」。最後鯊魚咧嘴一笑，螃蟹又嚇昏。牙、牙、刷牙
const clip: Clip = {
  char: '牙',
  meta: { theme: '海洋', cast: '鯊魚＋小魚＋螃蟹', gags: ['以為很可怕', '反轉：其實牙痛', '笑容太嚇人'] },
  duration: 10,
  bg: { top: '#BDEBFF', bottom: '#8FD3EA', floor: '#F0DDAA', scenery: 'ocean' },
  actors: [
    { id: 'crab', emoji: '🦀', x: 44, y: 72, size: 12, hidden: true },
    { id: 'fish', emoji: '🐠', x: 34, y: 40, size: 11, hidden: true, float: true, flip: true },
    { id: 'shark', emoji: '🦈', x: 124, y: 44, size: 30, hidden: true, float: true },
    { id: 'brush', emoji: '🪥', x: 114, y: 52, size: 12, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'crab', do: 'pop' },
    { at: 0, actor: 'fish', do: 'enter', from: { x: -10, y: 40 }, dur: 0.8 },
    { at: 0.8, actor: 'fish', do: 'bounce', dur: 0.9, times: 2, amount: 2 },
    // 大鯊魚慢慢游進來，張大嘴
    { at: 0.6, actor: 'shark', do: 'enter', from: { x: 195, y: 44 }, dur: 1.2 },
    { at: 1.9, actor: 'shark', do: 'squash', amount: -0.3, dur: 0.5 },
    { at: 1.9, actor: 'shark', do: 'flash', dur: 0.5 },
    // 大家嚇到逃
    { at: 2.6, actor: 'fish', do: 'moveTo', to: { x: 14, y: 26 }, dur: 0.4 },
    { at: 2.6, actor: 'crab', do: 'moveTo', to: { x: 18, y: 72 }, dur: 0.5 },
    { at: 2.6, actor: 'crab', do: 'bounce', dur: 0.5, times: 4, amount: 1.5 },
    // 螃蟹鼓起勇氣，夾鼻子！
    { at: 3.5, actor: 'crab', do: 'moveTo', to: { x: 100, y: 46 }, dur: 0.45, arc: 12 },
    { at: 3.95, actor: 'shark', do: 'hop', dur: 0.4, amount: 6 },
    { at: 3.95, actor: 'shark', do: 'shake', dur: 0.5, amount: 1.5 },
    { at: 4.2, actor: 'crab', do: 'moveTo', to: { x: 40, y: 72 }, dur: 0.45, arc: 6 },
    // 鯊魚哭了：原來牙痛。大家幫牠刷牙
    { at: 5.6, actor: 'brush', do: 'pop' },
    { at: 5.7, actor: 'brush', do: 'shake', dur: 1.3, amount: 2 },
    { at: 7.6, actor: 'brush', do: 'shake', dur: 0.7, amount: 2 },
    { at: 8.35, actor: 'brush', do: 'vanish' },
    // 咧嘴一笑——螃蟹嚇昏
    { at: 8.6, actor: 'shark', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 8.6, actor: 'shark', do: 'flash', dur: 0.5 },
    { at: 8.8, actor: 'crab', do: 'hop', dur: 0.3, amount: 6 },
    { at: 9.1, actor: 'crab', do: 'rotateTo', amount: 180, dur: 0.25 },
  ],
  builds: [
    // 刷牙刷出來的泡泡
    { at: 5.8, dur: 0.5, strokes: [0, 1], from: 'brush', color: '#2A8FD6' },
    { at: 6.2, dur: 0.6, strokes: [2, 3], from: 'brush', color: '#2A8FD6' },
  ],
  glyph: [{ at: 6.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'zzz', actor: 'fish', emoji: '🫧', dur: 1.4 },
    { at: 1.95, kind: 'pop', actor: 'shark', emoji: '🦷', dur: 0.8, dx: -16, dy: 16 },
    { at: 2.5, kind: 'pop', actor: 'fish', emoji: '❗', dur: 0.5 },
    { at: 2.5, kind: 'pop', actor: 'crab', emoji: '❗', dur: 0.5 },
    { at: 3.95, kind: 'burst', actor: 'shark', dur: 0.45, dx: -12, dy: 10 },
    { at: 4.6, kind: 'pop', actor: 'shark', emoji: '😭', dur: 0.8, dx: -10, dy: 8 },
    { at: 4.9, kind: 'rain', actor: 'shark', emoji: '💧', n: 5, dur: 0.8, dx: -8, dy: 10 },
    { at: 5.0, kind: 'bubble', actor: 'shark', emoji: '🦷', dur: 0.7, dx: -8, dy: 6 },
    { at: 5.7, kind: 'burst', actor: 'brush', emoji: '🫧', n: 6, dur: 0.6 },
    { at: 7.6, kind: 'burst', actor: 'brush', emoji: '🫧', n: 6, dur: 0.6 },
    { at: 8.6, kind: 'burst', actor: 'shark', emoji: '✨', n: 6, dur: 0.6, dx: -8, dy: 10 },
    { at: 9.1, kind: 'dizzy', actor: 'crab', dur: 0.9 },
  ],
  camera: [
    { at: 1.9, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 110, y: 46 } },
    { at: 3.95, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.8, sfx: 'bubble' },
    { at: 0.6, sfx: 'rumble' },
    { at: 2.0, say: '牙' },
    { at: 2.6, sfx: 'whoosh' },
    { at: 3.95, sfx: 'bonk' },
    { at: 4.6, sfx: 'deflate' },
    { at: 5.7, sfx: 'bubble' },
    { at: 6.9, say: '牙' },
    { at: 7.85, say: '刷牙' },
    { at: 7.6, sfx: 'bubble' },
    { at: 9.1, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
