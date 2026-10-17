import type { Clip } from '../clip'

// 鐘：太空人玩偶想跳起來敲響大鬧鐘上的鈴鐺，一跳卻輕飄飄地飄過頭，頭盔撞上天花板「咚」——掉下一陣藍色筆畫拼成「金」；
// 接著在左牆、地板、右牆之間越彈越快，每撞一下「喀」再敲進一組，最後一彈正中鈴鐺「噹」，鬧鐘跳起來叮鈴鈴響，「鐘」拼好了。
// 唸「鬧鐘」時鬧鐘蹦蹦跳，太空人暈暈地坐在字頂上比讚；最後鬧鐘又突然大響，嚇得他再飄起來撞一次天花板。鐘、鐘、鬧鐘
const clip: Clip = {
  char: '鐘',
  meta: { theme: '太空人敲鬧鐘', cast: '太空人玩偶＋大鬧鐘', gags: ['跳太輕飄過頭', '撞天花板', '連環彈牆', '正中鈴鐺', '又被嚇得撞天花板'] },
  duration: 10,
  bg: { top: '#FFF4E6', bottom: '#FFF9DB', floor: '#D0EBFF', scenery: 'room' },
  actors: [
    { id: 'clock', emoji: '⏰', x: 140, y: 68.6, size: 20 },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 22, y: 71.5, size: 13, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'astro', do: 'pop', dur: 0.35 },
    // 盯著鈴鐺、搓搓手套，蹲低蓄力
    { at: 0.5, actor: 'astro', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 0.6, actor: 'clock', do: 'flash', dur: 0.6 },
    { at: 1.0, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.6 },
    // 跳！太輕了，一路飄過頭，撞上天花板
    { at: 1.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 1.6, actor: 'astro', do: 'moveTo', to: { x: 74, y: 8 }, dur: 0.9, ease: 'out' },
    { at: 1.8, actor: 'astro', do: 'shake', amount: 0.8, dur: 0.7 },
    { at: 2.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 2.5, actor: 'astro', do: 'squash', amount: 0.35, dur: 0.25 },
    // 彈左牆、彈地板、彈右牆，越彈越快
    { at: 3.15, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 3.2, actor: 'astro', do: 'moveTo', to: { x: 8, y: 40 }, dur: 0.3, ease: 'in' },
    { at: 3.5, actor: 'astro', do: 'squash', amount: -0.25, dur: 0.15 },
    { at: 3.6, actor: 'astro', do: 'moveTo', to: { x: 40, y: 71.5 }, dur: 0.25, ease: 'in' },
    { at: 3.85, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 3.95, actor: 'astro', do: 'moveTo', to: { x: 154, y: 34 }, dur: 0.28, ease: 'in' },
    { at: 3.95, actor: 'astro', do: 'spin', times: 1, dur: 0.5 },
    { at: 4.23, actor: 'astro', do: 'moveTo', to: { x: 138, y: 54 }, dur: 0.18, ease: 'in' },
    // 噹！正中鈴鐺
    { at: 4.45, actor: 'clock', do: 'shake', amount: 2, dur: 0.6 },
    { at: 4.45, actor: 'clock', do: 'flash', dur: 0.6 },
    { at: 4.45, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    // 被彈上去，輕輕坐在「鐘」字頂上
    { at: 4.6, actor: 'astro', do: 'moveTo', to: { x: 80, y: 8.5 }, arc: 8, dur: 0.8, ease: 'out' },
    { at: 4.6, actor: 'astro', do: 'scaleTo', amount: 0.8, dur: 0.8 },
    { at: 5.4, actor: 'astro', do: 'squash', amount: 0.2, dur: 0.25 },
    // 「鬧鐘」：鬧鐘蹦蹦跳、叮鈴鈴響
    { at: 5.6, actor: 'clock', do: 'bounce', times: 4, amount: 4, dur: 1.2 },
    { at: 5.6, actor: 'clock', do: 'shake', amount: 1.2, dur: 1.2 },
    { at: 6.3, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    // 輕飄飄浮起一點點又坐回去，敬個歪歪的禮
    { at: 7.0, actor: 'astro', do: 'hop', amount: 2.5, dur: 0.5 },
    { at: 7.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/salute' },
    { at: 7.7, actor: 'astro', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 8.0, actor: 'clock', do: 'hop', amount: 2, dur: 0.25 },
    // 回馬槍：鬧鐘突然又大響——嚇得他飄起來再撞一次天花板
    { at: 8.4, actor: 'clock', do: 'shake', amount: 2, dur: 0.6 },
    { at: 8.4, actor: 'clock', do: 'bounce', times: 3, amount: 3, dur: 0.6 },
    { at: 8.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 8.5, actor: 'astro', do: 'moveTo', to: { x: 80, y: 4 }, dur: 0.15, ease: 'out' },
    { at: 8.65, actor: 'astro', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.85, actor: 'astro', do: 'moveTo', to: { x: 80, y: 8.5 }, dur: 0.5, ease: 'bounce' },
    { at: 9.35, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
  ],
  builds: [
    // 撞天花板掉下來 → 金；撞左牆 → 立；撞地板 → 里
    { at: 2.55, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'astro', style: 'drop', color: '#1C3FAA' },
    { at: 3.5, dur: 0.45, strokes: [8, 9, 10, 11, 12], from: 'astro', color: '#1C3FAA' },
    { at: 3.85, dur: 0.6, strokes: [13, 14, 15, 16, 17, 18, 19], from: 'astro', color: '#1C3FAA' },
  ],
  glyph: [{ at: 4.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'astro', emoji: '🔔', dur: 0.8 },
    { at: 2.5, kind: 'burst', actor: 'astro', dy: 6, dx: 8, dur: 0.3 },
    { at: 2.7, kind: 'sweat', actor: 'astro', dx: 5, dy: 8 },
    { at: 3.5, kind: 'burst', actor: 'astro', emoji: '💫', n: 1, dur: 0.25 },
    { at: 3.85, kind: 'puff', actor: 'astro', dur: 0.3 },
    { at: 4.45, kind: 'burst', actor: 'clock', emoji: '✨', n: 8, dur: 0.6 },
    { at: 5.5, kind: 'dizzy', actor: 'astro', dy: 4, dur: 0.9 },
    { at: 5.6, kind: 'zzz', actor: 'clock', emoji: '🎵', dur: 1.3 },
    { at: 6.35, kind: 'pop', actor: 'astro', emoji: '👍', dx: 10, dy: 10, dur: 0.6 },
    { at: 8.4, kind: 'burst', actor: 'clock', emoji: '🔔', n: 6, dur: 0.6 },
    { at: 8.65, kind: 'pop', actor: 'astro', emoji: '❗', dx: 10, dy: 10, dur: 0.4 },
  ],
  camera: [
    // 撞天花板震；正中鈴鐺推近鬧鐘
    { at: 2.5, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.45, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 132, y: 58 } },
  ],
  cues: [
    { at: 1.05, say: '鐘' },
    { at: 1.6, sfx: 'boing' },
    { at: 2.5, sfx: 'bonk' },
    { at: 3.2, say: '鐘' },
    { at: 3.5, sfx: 'bonk' },
    { at: 3.85, sfx: 'boing' },
    { at: 4.45, sfx: 'clink' },
    { at: 5.65, say: '鬧鐘' },
    { at: 8.4, sfx: 'clink' },
    { at: 8.65, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
