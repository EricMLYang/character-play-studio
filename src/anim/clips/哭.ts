import type { Clip } from '../clip'

// 哭：硬漢老虎廚師切洋蔥，切一刀眼淚就噴出來；越切越快，連遠遠在洗碗的小狗也噴淚，最後連洋蔥自己都哭了。
// 三條眼淚和洋蔥變成「哭」。一隻鬼飄出來想嚇人，聞到洋蔥也哇哇大哭。老虎戴上蛙鏡再切一刀——眼淚照樣從蛙鏡下面噴出來。哭、哭、愛哭鬼
const clip: Clip = {
  char: '哭',
  meta: { theme: '廚房切洋蔥', cast: '老虎廚師＋小狗＋洋蔥＋鬼', gags: ['硬漢噴淚', '遠遠的也被傳染', '洋蔥自己也哭', '嚇人的鬼也哭', '蛙鏡沒用'] },
  duration: 10,
  bg: { top: '#F3FAE8', bottom: '#E0EFCB', floor: '#D7B288', scenery: 'room' },
  actors: [
    { id: 'tiger', emoji: '🐯', x: 22, y: 69.6, size: 17.5, hidden: true },
    { id: 'goggles', emoji: '🥽', x: 22, y: 68.5, size: 11.2, hidden: true, float: true },
    { id: 'onion', emoji: '🧅', x: 38, y: 72.3, size: 11.2, hidden: true },
    { id: 'knife', emoji: '🔪', x: 39, y: 63, size: 10, hidden: true, float: true },
    { id: 'dog', emoji: '🐶', x: 140, y: 70.7, size: 15, hidden: true },
    { id: 'ghost', emoji: '👻', x: 18, y: 40, size: 15, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'tiger', do: 'pop' },
    { at: 0.1, actor: 'onion', do: 'pop' },
    { at: 0.2, actor: 'knife', do: 'pop' },
    { at: 0.3, actor: 'dog', do: 'pop' },
    { at: 0.8, actor: 'dog', do: 'shake', dur: 1.2, amount: 0.6 },
    // 一刀
    { at: 1.1, actor: 'knife', do: 'hop', dur: 0.2, amount: -6 },
    { at: 1.2, actor: 'onion', do: 'squash', amount: 0.3, dur: 0.2 },
    // 兩刀
    { at: 2, actor: 'knife', do: 'hop', dur: 0.2, amount: -6 },
    { at: 2.11, actor: 'onion', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 2.28, actor: 'knife', do: 'hop', dur: 0.2, amount: -6 },
    { at: 2.39, actor: 'onion', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 2.44, actor: 'tiger', do: 'shake', dur: 0.6, amount: 1 },
    // 三刀，越來越快
    { at: 3.33, actor: 'knife', do: 'hop', dur: 0.15, amount: -6 },
    { at: 3.56, actor: 'knife', do: 'hop', dur: 0.15, amount: -6 },
    { at: 3.78, actor: 'knife', do: 'hop', dur: 0.15, amount: -6 },
    { at: 4, actor: 'onion', do: 'shake', dur: 0.8, amount: 0.8 },
    // 大家一起哇哇大哭
    { at: 4.56, actor: 'tiger', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 4.56, actor: 'dog', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 5, actor: 'knife', do: 'vanish', dur: 0.2 },
    // 鬼來嚇人，聞到洋蔥也哭
    { at: 6.9, actor: 'ghost', do: 'pop', dur: 0.3 },
    { at: 6.9, actor: 'ghost', do: 'flash', dur: 0.4 },
    { at: 7, actor: 'tiger', do: 'hop', dur: 0.3, amount: 6 },
    { at: 7.25, actor: 'ghost', do: 'moveTo', to: { x: 34, y: 52 }, dur: 0.3 },
    { at: 7.6, actor: 'ghost', do: 'shake', dur: 0.8, amount: 1 },
    // 戴上蛙鏡再切一刀
    { at: 8.23, actor: 'goggles', do: 'pop', dur: 0.25 },
    { at: 8.58, actor: 'knife', do: 'pop', dur: 0.2 },
    { at: 8.76, actor: 'knife', do: 'hop', dur: 0.2, amount: -6 },
    { at: 8.85, actor: 'onion', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.98, actor: 'goggles', do: 'shake', dur: 0.6, amount: 0.8 },
    { at: 8.98, actor: 'tiger', do: 'shake', dur: 0.6, amount: 0.8 },
  ],
  builds: [
    // 老虎的眼淚、小狗的眼淚 → 兩個口；洋蔥 → 犬
    { at: 5, dur: 0.5, strokes: [0, 1, 2], from: 'tiger', color: '#2F80ED' },
    { at: 5.25, dur: 0.5, strokes: [3, 4, 5], from: 'dog', color: '#2F80ED' },
    { at: 5.6, dur: 0.6, strokes: [6, 7, 8, 9], from: 'onion', color: '#8E44AD' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'tiger', emoji: '😤', dur: 0.6 },
    { at: 0.8, kind: 'zzz', actor: 'dog', emoji: '🫧', dur: 1.2 },
    { at: 1.3, kind: 'fountain', actor: 'tiger', n: 4, dur: 0.6 },
    { at: 2.44, kind: 'fountain', actor: 'tiger', n: 8, dur: 0.7 },
    { at: 2.67, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
    { at: 3, kind: 'fountain', actor: 'dog', n: 6, dur: 0.7 },
    { at: 4, kind: 'fountain', actor: 'onion', n: 6, dur: 0.7 },
    { at: 4.11, kind: 'pop', actor: 'tiger', emoji: '😳', dur: 0.5 },
    { at: 4.56, kind: 'fountain', actor: 'tiger', n: 10, dur: 0.7 },
    { at: 4.61, kind: 'fountain', actor: 'dog', n: 10, dur: 0.7 },
    { at: 4.67, kind: 'fountain', actor: 'onion', n: 8, dur: 0.7 },
    { at: 6.5, kind: 'pop', actor: 'tiger', emoji: '😮‍💨', dur: 0.5 },
    { at: 7.05, kind: 'pop', actor: 'tiger', emoji: '❗', dur: 0.4 },
    { at: 7.6, kind: 'fountain', actor: 'ghost', n: 8, dur: 0.7 },
    { at: 8.41, kind: 'pop', actor: 'tiger', emoji: '😎', dur: 0.5 },
    { at: 8.98, kind: 'fountain', actor: 'tiger', n: 10, dur: 0.7 },
    { at: 9.07, kind: 'fountain', actor: 'dog', n: 8, dur: 0.7 },
    { at: 9.12, kind: 'fountain', actor: 'ghost', n: 8, dur: 0.7 },
  ],
  camera: [
    { at: 4, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 38, y: 68 } },
    { at: 4.56, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.1, sfx: 'tap' },
    { at: 1.4, say: '哭' },
    { at: 2, sfx: 'tap' }, { at: 2.28, sfx: 'tap' },
    { at: 2.44, sfx: 'splash' },
    { at: 3, sfx: 'splash' },
    { at: 3.33, sfx: 'tap' }, { at: 3.56, sfx: 'tap' }, { at: 3.78, sfx: 'tap' },
    { at: 4, sfx: 'splash' },
    { at: 4.56, sfx: 'splash' },
    { at: 6.3, say: '哭' },
    { at: 6.9, sfx: 'poof' },
    { at: 7.6, sfx: 'splash' },
    { at: 7.7, say: '愛哭鬼' },
    { at: 8.23, sfx: 'clink' },
    { at: 8.76, sfx: 'tap' },
    { at: 8.98, sfx: 'splash' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
