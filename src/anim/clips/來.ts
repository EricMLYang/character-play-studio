import type { Clip } from '../clip'

// 來：太空人玩偶在右邊招手「過來」，迴力賽車往後一拉、放手——快到從整排保齡球瓶上面飛過去，連太空人都嚇得飄起來撞到燈籠，賽車一頭撞牆。
// 倒車拉更遠再衝，趴地像保齡球一樣滑進球瓶：全倒！球瓶翻滾落下變成「來」。太空人再招一次手，賽車咻地沿著底邊跑過來，這次終於剛好停在他旁邊。來、來、過來
const clip: Clip = {
  char: '來',
  meta: { theme: '保齡球', cast: '酷炫車子＋太空人玩偶＋保齡球瓶＋燈籠', gags: ['衝過頭撞牆', '嚇到飄起來撞燈籠', '趴地滑行全倒', '這次終於停好'] },
  duration: 10,
  bg: { top: '#FFF4DE', bottom: '#FFFAEF', floor: '#9FE0C8', scenery: 'track' },
  actors: [
    { id: 'lantern', emoji: '🏮', x: 144, y: 17, size: 8, float: true },
    { id: 'p1', emoji: '🎳', x: 62, y: 73, size: 8 },
    { id: 'p2', emoji: '🎳', x: 74, y: 73, size: 8 },
    { id: 'p3', emoji: '🎳', x: 86, y: 73, size: 8 },
    { id: 'p4', emoji: '🎳', x: 98, y: 73, size: 8 },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 145, y: 71, size: 14 },
    { id: 'car', emoji: 'hero:car/idle', x: 18, y: 69, size: 19, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'car', do: 'enter', from: { x: -20, y: 69 }, dur: 0.5, ease: 'out' },
    // 太空人招手：過來！
    { at: 0.3, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 0.3, actor: 'astro', do: 'bounce', amount: 3, times: 2, dur: 0.7 },
    // 迴力車往後拉、上發條
    { at: 0.8, actor: 'car', do: 'moveTo', to: { x: 15, y: 69 }, dur: 0.6, ease: 'out' },
    { at: 0.9, actor: 'car', do: 'shake', amount: 0.8, dur: 0.6 },
    // 放手——快到從球瓶上面飛過去
    { at: 1.6, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 1.6, actor: 'car', do: 'moveTo', to: { x: 150, y: 69 }, arc: 16, dur: 0.5, anticipate: 3, ease: 'in' },
    { at: 1.8, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 1.85, actor: 'astro', do: 'moveTo', to: { x: 145, y: 32 }, dur: 0.45, ease: 'out' },
    // 太空人頭盔撞到燈籠
    { at: 2.3, actor: 'lantern', do: 'tilt', amount: 25, dur: 0.6 },
    { at: 2.3, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 2.9, actor: 'astro', do: 'moveTo', to: { x: 145, y: 71 }, dur: 0.6, ease: 'inOut' },
    { at: 3.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    // 賽車一頭撞牆、倒退
    { at: 2.1, actor: 'car', do: 'squash', amount: 0.45, dur: 0.25 },
    { at: 2.1, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 2.35, actor: 'car', do: 'moveTo', to: { x: 122, y: 69 }, dur: 0.5, ease: 'out' },
    // 倒車倒到最左邊，拉更遠
    { at: 3.3, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 3.3, actor: 'car', do: 'moveTo', to: { x: 12, y: 69 }, dur: 0.8, ease: 'inOut' },
    { at: 4.15, actor: 'car', do: 'squash', amount: -0.25, dur: 0.4 },
    // 衝！跳起來趴地滑進球瓶
    { at: 4.6, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 4.6, actor: 'car', do: 'moveTo', to: { x: 50, y: 69 }, arc: 8, dur: 0.3, anticipate: 4, ease: 'in' },
    { at: 4.9, actor: 'car', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 4.9, actor: 'car', do: 'moveTo', to: { x: 185, y: 69 }, dur: 0.6, ease: 'in' },
    // 全倒！球瓶飛上天
    { at: 5.0, actor: 'p1', do: 'moveTo', to: { x: 56, y: 22 }, dur: 0.4, ease: 'out' },
    { at: 5.0, actor: 'p1', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.05, actor: 'p2', do: 'moveTo', to: { x: 72, y: 12 }, dur: 0.4, ease: 'out' },
    { at: 5.05, actor: 'p2', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.1, actor: 'p3', do: 'moveTo', to: { x: 90, y: 14 }, dur: 0.4, ease: 'out' },
    { at: 5.1, actor: 'p3', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.15, actor: 'p4', do: 'moveTo', to: { x: 106, y: 24 }, dur: 0.4, ease: 'out' },
    { at: 5.15, actor: 'p4', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.6, actor: 'p2', do: 'vanish', dur: 0.2 },
    { at: 5.8, actor: 'p1', do: 'vanish', dur: 0.2 },
    { at: 6.0, actor: 'p3', do: 'vanish', dur: 0.2 },
    { at: 6.3, actor: 'p4', do: 'vanish', dur: 0.2 },
    // 再招一次手——賽車咻地沿著底邊跑過來，這次剛好停好
    { at: 7.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 7.0, actor: 'astro', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 7.3, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 7.35, actor: 'car', do: 'moveTo', to: { x: -25, y: 69 }, dur: 0.01 },
    { at: 7.4, actor: 'car', do: 'moveTo', to: { x: 125, y: 69 }, dur: 0.5, ease: 'back' },
    { at: 7.95, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 8.0, actor: 'car', do: 'rotateTo', amount: -18, dur: 0.25, ease: 'back' },
    { at: 8.7, actor: 'car', do: 'rotateTo', amount: 18, dur: 0.2 },
    // 回馬槍：輕輕碰一下，太空人又飄起來撞到燈籠
    { at: 8.9, actor: 'car', do: 'moveTo', to: { x: 128, y: 69 }, dur: 0.15 },
    { at: 9.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 9.0, actor: 'astro', do: 'moveTo', to: { x: 145, y: 32 }, dur: 0.35, ease: 'out' },
    { at: 9.35, actor: 'lantern', do: 'tilt', amount: -25, dur: 0.5 },
    { at: 9.35, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 9.55, actor: 'astro', do: 'moveTo', to: { x: 145, y: 60 }, dur: 0.45 },
  ],
  builds: [
    // 球瓶落下：直的那根當中間一豎，橫的當上面一橫，兩對小人，最後兩條腿
    { at: 5.6, dur: 0.35, strokes: [5], from: 'p2', color: '#F03E3E' },
    { at: 5.8, dur: 0.35, strokes: [0], from: 'p1', color: '#F03E3E' },
    { at: 6.0, dur: 0.6, strokes: [1, 2, 3, 4], from: 'p3', color: '#FF6B6B' },
    { at: 6.3, dur: 0.5, strokes: [6, 7], from: 'p4', color: '#F03E3E' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.35, kind: 'pop', actor: 'astro', emoji: '👋', dur: 0.6 },
    { at: 0.9, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 2.1, kind: 'burst', actor: 'car', n: 1, dx: -6, dy: 6, dur: 0.5 },
    { at: 2.3, kind: 'burst', actor: 'astro', emoji: '⭐', n: 4, dy: 8, dx: -4, dur: 0.5 },
    { at: 2.5, kind: 'dizzy', actor: 'car', dur: 0.9 },
    { at: 4.2, kind: 'pop', actor: 'car', emoji: '😠', dur: 0.4 },
    { at: 4.9, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 5.05, kind: 'burst', x: 80, y: 50, emoji: '⭐', n: 6, dur: 0.6 },
    { at: 7.05, kind: 'pop', actor: 'astro', emoji: '👋', dur: 0.6 },
    { at: 8.0, kind: 'pop', actor: 'car', emoji: '😎', dur: 0.6 },
    { at: 9.4, kind: 'pop', actor: 'astro', emoji: '😅', dur: 0.5 },
  ],
  camera: [
    { at: 1.6, dur: 0.3, do: 'follow', actor: 'car', amount: 1.3 },
    { at: 2.1, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 2.3, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 4.9, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 74, y: 64 } },
  ],
  cues: [
    { at: 0.9, sfx: 'tap' },
    { at: 1.0, say: '來' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.1, sfx: 'bonk' },
    { at: 2.3, sfx: 'boing' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 4.9, sfx: 'slide' },
    { at: 5.05, sfx: 'crack' },
    { at: 6.8, say: '來' },
    { at: 7.4, say: '過來' },
    { at: 7.9, sfx: 'slide' },
    { at: 9.35, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
