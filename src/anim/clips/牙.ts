import type { Clip } from '../clip'

// 牙：小魚在海底游泳，一條大鯊魚慢慢游過來，張開大嘴露出一排牙——小魚和螃蟹嚇到四處逃。鯊魚追啊追，螃蟹夾牠鼻子，
// 鯊魚竟然哭了：原來牠只是牙痛想刷牙。大家幫牠刷，泡泡變成「牙」。最後鯊魚咧嘴一笑，螃蟹又嚇昏。牙、牙、刷牙
const clip: Clip = {
  char: '牙',
  meta: { theme: '海洋', cast: '鯊魚＋小魚＋螃蟹', gags: ['以為很可怕', '追逐', '反轉：其實牙痛', '笑容太嚇人'] },
  duration: 10,
  bg: { top: '#CDF2FF', bottom: '#98D9EE', floor: '#F0DDAA', scenery: 'ocean' },
  actors: [
    { id: 'crab', emoji: '🦀', x: 40, y: 73.2, size: 9, hidden: true },
    { id: 'fish', emoji: '🐠', x: 34, y: 40, size: 8, hidden: true, float: true, flip: true },
    { id: 'shark', emoji: '🦈', x: 124, y: 46, size: 24, hidden: true, float: true },
    { id: 'brush', emoji: '🪥', x: 117, y: 52, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'crab', do: 'pop' },
    { at: 0, actor: 'fish', do: 'enter', from: { x: -10, y: 40 }, dur: 0.7 },
    { at: 0.7, actor: 'fish', do: 'bounce', dur: 0.8, times: 2, amount: 2 },
    // 大鯊魚慢慢游進來，張大嘴
    { at: 0.6, actor: 'shark', do: 'enter', from: { x: 190, y: 46 }, dur: 1.0 },
    { at: 1.65, actor: 'shark', do: 'squash', amount: -0.3, dur: 0.45 },
    { at: 1.65, actor: 'shark', do: 'flash', dur: 0.45 },
    // 大家嚇到逃
    { at: 2.1, actor: 'fish', do: 'moveTo', to: { x: 14, y: 26 }, dur: 0.35 },
    { at: 2.1, actor: 'crab', do: 'moveTo', to: { x: 20, y: 73.2 }, dur: 0.4 },
    { at: 2.1, actor: 'crab', do: 'bounce', dur: 0.4, times: 4, amount: 1.5 },
    { at: 2.6, actor: 'shark', do: 'moveTo', to: { x: 44, y: 34 }, dur: 0.6 },
    { at: 2.8, actor: 'fish', do: 'moveTo', to: { x: 22, y: 64 }, dur: 0.3 },
    { at: 3.1, actor: 'fish', do: 'moveTo', to: { x: 14, y: 66 }, dur: 0.2 },
    // 螃蟹夾鼻子！
    { at: 3.35, actor: 'crab', do: 'moveTo', to: { x: 34, y: 46 }, dur: 0.3, arc: 6 },
    { at: 3.65, actor: 'shark', do: 'hop', dur: 0.35, amount: 6 },
    { at: 3.65, actor: 'shark', do: 'shake', dur: 0.5, amount: 1.5 },
    { at: 3.85, actor: 'crab', do: 'moveTo', to: { x: 30, y: 73.2 }, dur: 0.35 },
    // 鯊魚哭了：原來牙痛
    { at: 4.3, actor: 'shark', do: 'moveTo', to: { x: 126, y: 44 }, dur: 0.5 },
    { at: 4.9, actor: 'brush', do: 'pop' },
    { at: 5.0, actor: 'brush', do: 'shake', dur: 1.6, amount: 2 },
    { at: 6.6, actor: 'brush', do: 'shake', dur: 0.8, amount: 2 },
    { at: 7.4, actor: 'brush', do: 'vanish' },
    { at: 7.5, actor: 'shark', do: 'squash', amount: -0.25, dur: 0.5 },
    { at: 7.5, actor: 'shark', do: 'flash', dur: 0.5 },
    { at: 7.6, actor: 'fish', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 咧嘴一笑——螃蟹嚇昏
    { at: 8.5, actor: 'shark', do: 'moveTo', to: { x: 116, y: 50 }, dur: 0.3 },
    { at: 8.6, actor: 'shark', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 8.8, actor: 'crab', do: 'hop', dur: 0.3, amount: 6 },
    { at: 9.1, actor: 'crab', do: 'rotateTo', amount: 180, dur: 0.25 },
  ],
  builds: [
    // 刷牙刷出來的泡泡
    { at: 5.1, dur: 0.5, strokes: [0, 1], from: 'brush', color: '#2A8FD6' },
    { at: 5.5, dur: 0.6, strokes: [2, 3], from: 'brush', color: '#2A8FD6' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'zzz', actor: 'fish', emoji: '🫧', dur: 1.2 },
    { at: 1.7, kind: 'pop', actor: 'shark', emoji: '🦷', dur: 0.6, dx: -14, dy: 14 },
    { at: 2.0, kind: 'pop', actor: 'fish', emoji: '❗', dur: 0.4 },
    { at: 2.0, kind: 'pop', actor: 'crab', emoji: '❗', dur: 0.4 },
    { at: 3.65, kind: 'burst', actor: 'shark', dur: 0.4, dx: -10, dy: 8 },
    { at: 4.2, kind: 'pop', actor: 'shark', emoji: '😭', dur: 0.6, dx: -10, dy: 8 },
    { at: 4.5, kind: 'bubble', actor: 'shark', emoji: '🦷', dur: 0.6, dx: -8, dy: 6 },
    { at: 5.0, kind: 'burst', actor: 'brush', emoji: '🫧', n: 6, dur: 0.6 },
    { at: 6.6, kind: 'burst', actor: 'brush', emoji: '🫧', n: 6, dur: 0.6 },
    { at: 7.5, kind: 'burst', actor: 'shark', emoji: '✨', n: 6, dur: 0.6, dx: -8, dy: 10 },
    { at: 9.1, kind: 'dizzy', actor: 'crab', dur: 0.9 },
    { at: 9.2, kind: 'bubble', actor: 'shark', emoji: '😅', dur: 0.7, dx: -8, dy: 8 },
  ],
  camera: [
    { at: 1.65, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 110, y: 46 } },
    { at: 3.65, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.7, sfx: 'bubble' },
    { at: 0.6, sfx: 'rumble' },
    { at: 1.75, say: '牙' },
    { at: 2.1, sfx: 'whoosh' },
    { at: 3.65, sfx: 'bonk' },
    { at: 4.2, sfx: 'deflate' },
    { at: 5.0, sfx: 'bubble' },
    { at: 6.1, say: '牙' },
    { at: 7.05, say: '刷牙' },
    { at: 7.5, sfx: 'blip' },
    { at: 9.1, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
