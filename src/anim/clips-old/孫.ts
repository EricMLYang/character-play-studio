import type { Clip } from '../clip'

// 孫：布忍者只想輕輕按爺爺家的小門鈴，卻擺出超誇張的蓄力架式，煙霧彈提早在腳邊爆開，整隻衝過頭撞進布條籃、扁成一張鬆餅；
// 紫色布條「啪啪」貼上牆拼成「孫」。他冒著煙滑回來，用一根手指輕輕一按——山羊爺爺開門抱住他。最後他躲進爺爺的鬍子裡，只露出腳。孫、孫、孫子
const clip: Clip = {
  char: '孫',
  meta: { theme: '忍者按門鈴', cast: '布忍者＋山羊爺爺＋門鈴＋布條籃', gags: ['躲在一根竹子後面', '蓄力過猛煙霧彈提早爆', '衝過頭撞扁成鬆餅', '躲進爺爺鬍子裡露腳'] },
  duration: 10,
  bg: { top: '#FFF4DE', bottom: '#FFF9EE', floor: '#A9D8F5', scenery: 'room' },
  actors: [
    { id: 'door', emoji: '🚪', x: 136, y: 66, size: 18 },
    { id: 'bell', emoji: '🛎️', x: 122, y: 73, size: 6 },
    { id: 'basket', emoji: '🧺', x: 151, y: 72.4, size: 11 },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 30, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'goat', emoji: '🐐', x: 136, y: 68.2, size: 15, hidden: true },
    { id: 'bamboo', emoji: '🎋', x: 31, y: 66, size: 14 },
  ],
  moves: [
    { at: 0, actor: 'ninja', do: 'enter', from: { x: -15, y: 71.5 }, dur: 0.7, ease: 'out' },
    { at: 0.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 1.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    // 小小一個門鈴，蓄力蓄成這樣
    { at: 1.1, actor: 'ninja', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 1.3, actor: 'ninja', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 1.35, actor: 'ninja', do: 'shake', amount: 0.6, dur: 0.3 },
    // 煙霧彈提早爆開，整隻射出去
    { at: 1.65, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 1.65, actor: 'ninja', do: 'moveTo', to: { x: 146, y: 71.5 }, arc: 4, dur: 0.5, ease: 'in' },
    { at: 2.15, actor: 'ninja', do: 'squash', amount: 0.5, dur: 0.4 },
    { at: 2.15, actor: 'basket', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 2.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    // 籃子翻過來，布條飛上牆
    { at: 3.0, actor: 'basket', do: 'hop', amount: 8, dur: 0.5 },
    { at: 3.0, actor: 'basket', do: 'tilt', amount: -50, dur: 0.5 },
    // 冒著煙滑回來
    { at: 5.0, actor: 'ninja', do: 'moveTo', to: { x: 116, y: 71.5 }, dur: 0.6, ease: 'back' },
    { at: 5.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 5.9, actor: 'ninja', do: 'moveTo', to: { x: 117, y: 71.5 }, dur: 0.3 },
    { at: 5.9, actor: 'ninja', do: 'hop', amount: 1.5, dur: 0.3 },
    // 一根手指，輕輕一按
    { at: 6.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 6.35, actor: 'bell', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 6.5, actor: 'door', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 6.55, actor: 'goat', do: 'pop' },
    { at: 6.7, actor: 'goat', do: 'moveTo', to: { x: 128, y: 68.2 }, dur: 0.3 },
    { at: 6.75, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 6.75, actor: 'ninja', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.1, actor: 'goat', do: 'bounce', amount: 1.5, times: 2, dur: 0.6 },
    // 回馬槍：躲進爺爺的鬍子裡，腳露在外面
    { at: 7.8, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 7.8, actor: 'ninja', do: 'moveTo', to: { x: 131, y: 72.5 }, dur: 0.3 },
    { at: 8.2, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 9.0, actor: 'ninja', do: 'moveTo', to: { x: 118, y: 71.5 }, dur: 0.25, ease: 'back' },
    { at: 9.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
  ],
  builds: [
    // 左邊的子、右邊的系，一條條貼上牆
    { at: 3.2, dur: 0.6, strokes: [0, 1, 2], from: 'basket', color: '#7B4FD6' },
    { at: 3.8, dur: 1.0, strokes: [3, 4, 5, 6, 7, 8, 9], from: 'basket', color: '#9461E0' },
  ],
  glyph: [{ at: 4.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'ninja', emoji: '❗', dur: 0.4 },
    { at: 1.0, kind: 'bubble', actor: 'ninja', emoji: '🛎️', dur: 0.6 },
    { at: 1.6, kind: 'puff', actor: 'ninja', dur: 0.6 },
    { at: 1.6, kind: 'burst', actor: 'ninja', emoji: '💨', n: 5, dur: 0.6 },
    { at: 2.15, kind: 'burst', actor: 'ninja', n: 1, dur: 0.4 },
    { at: 2.5, kind: 'dizzy', actor: 'ninja', dur: 1.0 },
    { at: 3.0, kind: 'burst', actor: 'basket', dx: -10, emoji: '🟪', n: 5, dur: 0.5 },
    { at: 5.1, kind: 'zzz', actor: 'ninja', emoji: '💨', dur: 0.8 },
    { at: 6.35, kind: 'pop', actor: 'bell', emoji: '🎵', dur: 0.6 },
    { at: 6.95, kind: 'pop', actor: 'goat', emoji: '💕', dur: 0.8 },
    { at: 8.4, kind: 'pop', actor: 'goat', emoji: '😆', dur: 0.6 },
    { at: 8.8, kind: 'puff', actor: 'door', dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'ninja', emoji: '😎', dur: 0.6 },
  ],
  camera: [
    { at: 1.65, dur: 0.2, do: 'follow', actor: 'ninja', amount: 1.3 },
    { at: 2.15, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 2.6, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 6.3, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 122, y: 62 } },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.6, sfx: 'poof' },
    { at: 1.65, say: '孫' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.15, sfx: 'bonk' },
    { at: 3.0, sfx: 'boing' },
    { at: 4.85, say: '孫' },
    { at: 5.0, sfx: 'slide' },
    { at: 6.35, sfx: 'clink' },
    { at: 6.7, say: '孫子' },
    { at: 8.8, sfx: 'poof' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
