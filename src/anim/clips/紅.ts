import type { Clip, Move } from '../clip'

// 紅：變色龍和貓頭鷹玩捉迷藏。躲在紅蘋果旁邊卻變成黃色、躲在黃檸檬旁邊卻變成藍色，每次都被抓到；
// 一慌就變成閃個不停的跑馬燈，把貓頭鷹閃到頭昏。蘋果飛成「紅」。貓頭鷹送一顆愛心，變色龍害羞臉紅——紅到變成一顆番茄。紅、紅、臉紅
const C = ['cg', 'cr', 'cb', 'cy'] as const
type Cham = (typeof C)[number]
/** 四隻不同顏色的變色龍疊在一起，一起動；一次只露出一隻。 */
const all = (m: Omit<Move, 'actor'>): Move[] => C.map((actor) => ({ ...m, actor }))
const show = (at: number, id: Cham): Move[] =>
  C.map((actor) => (actor === id ? { at, actor, do: 'pop', dur: 0.05 } : { at, actor, do: 'vanish', dur: 0.05 }))

const clip: Clip = {
  char: '紅',
  meta: { theme: '變色龍捉迷藏', cast: '變色龍＋貓頭鷹', gags: ['每次都變錯顏色', '慌到變成跑馬燈', '害羞臉紅', '紅到變番茄'] },
  duration: 10,
  bg: { top: '#FFF8E6', bottom: '#E6F5D0', floor: '#8FC46E', scenery: 'forest' },
  actors: [
    { id: 'apple', emoji: '🍎', x: 34, y: 72, size: 12, hidden: true },
    { id: 'lemon', emoji: '🍋', x: 76, y: 72.8, size: 10, hidden: true },
    { id: 'owl', emoji: '🦉', x: 138, y: 70.3, size: 16, hidden: true },
    { id: 'cg', emoji: '🦎', x: 20, y: 72, size: 12, hidden: true },
    { id: 'cr', emoji: '🦎', x: 20, y: 72, size: 12, hidden: true, tint: 'hue-rotate(-95deg) saturate(1.8)' },
    { id: 'cb', emoji: '🦎', x: 20, y: 72, size: 12, hidden: true, tint: 'hue-rotate(115deg) saturate(1.3)' },
    { id: 'cy', emoji: '🦎', x: 20, y: 72, size: 12, hidden: true, tint: 'hue-rotate(-45deg) saturate(1.6) brightness(1.15)' },
    { id: 'heart', emoji: '💕', x: 132, y: 56, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'owl', do: 'pop' },
    { at: 0.1, actor: 'apple', do: 'pop' },
    { at: 0.15, actor: 'lemon', do: 'pop' },
    { at: 0.2, actor: 'cg', do: 'enter', from: { x: -10, y: 72 }, dur: 0.6 },
    // 躲在紅蘋果旁邊……變成黃色
    ...all({ at: 1.1, do: 'moveTo', to: { x: 48, y: 72 }, arc: 6, dur: 0.35 }),
    { at: 1.4, actor: 'apple', do: 'flash', dur: 0.4 },
    ...all({ at: 1.5, do: 'squash', amount: -0.3, dur: 0.3 }),
    ...show(1.8, 'cy'),
    { at: 2.2, actor: 'owl', do: 'hop', amount: 5, dur: 0.3 },
    // 躲在黃檸檬旁邊……變成藍色
    ...all({ at: 2.7, do: 'moveTo', to: { x: 88, y: 72 }, arc: 6, dur: 0.35 }),
    ...all({ at: 3.0, do: 'squash', amount: -0.3, dur: 0.3 }),
    ...show(3.1, 'cb'),
    { at: 3.5, actor: 'owl', do: 'hop', amount: 5, dur: 0.3 },
    // 一慌：跑馬燈
    ...all({ at: 4.0, do: 'bounce', amount: 3, times: 4, dur: 0.8 }),
    ...show(4.0, 'cr'), ...show(4.1, 'cy'), ...show(4.2, 'cg'), ...show(4.3, 'cb'),
    ...show(4.4, 'cr'), ...show(4.5, 'cy'), ...show(4.6, 'cb'), ...show(4.7, 'cr'), ...show(4.8, 'cg'),
    { at: 4.3, actor: 'owl', do: 'tilt', amount: 20, dur: 1.0 },
    // 舌頭一捲吃掉檸檬；蘋果飛成「紅」
    { at: 5.1, actor: 'apple', do: 'vanish', dur: 0.2 },
    { at: 5.2, actor: 'lemon', do: 'moveTo', to: { x: 86, y: 70 }, dur: 0.15 },
    { at: 5.3, actor: 'lemon', do: 'vanish', dur: 0.1 },
    ...all({ at: 5.35, do: 'squash', amount: 0.3, dur: 0.3 }),
    ...all({ at: 5.75, do: 'moveTo', to: { x: 26, y: 72 }, dur: 0.5 }),
    // 貓頭鷹送愛心——臉紅
    { at: 6.8, actor: 'heart', do: 'pop', dur: 0.2 },
    { at: 6.95, actor: 'heart', do: 'moveTo', to: { x: 30, y: 62 }, arc: 50, dur: 0.5 },
    { at: 7.45, actor: 'heart', do: 'vanish', dur: 0.1 },
    ...show(7.4, 'cr'),
    { at: 7.45, actor: 'cr', do: 'flash', dur: 0.6 },
    // 越來越紅……變成番茄
    { at: 8.2, actor: 'cr', do: 'flash', dur: 0.6 },
    { at: 8.2, actor: 'cr', do: 'scaleTo', amount: 1.2, dur: 0.6 },
    { at: 8.9, actor: 'cr', do: 'swap', emoji: '🍅' },
    { at: 9.0, actor: 'cr', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.1, actor: 'owl', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    { at: 5.1, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5], from: 'apple', color: '#D7263D' },
    { at: 5.7, dur: 0.6, strokes: [6, 7, 8], from: 'cg', color: '#FF6B5A' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'owl', emoji: '3️⃣', dur: 0.45 },
    { at: 0.8, kind: 'pop', actor: 'owl', emoji: '2️⃣', dur: 0.45 },
    { at: 1.3, kind: 'pop', actor: 'owl', emoji: '1️⃣', dur: 0.45 },
    { at: 1.8, kind: 'burst', actor: 'cy', emoji: '✨', n: 5, dur: 0.4 },
    { at: 2.2, kind: 'pop', actor: 'owl', emoji: '👀', dur: 0.5 },
    { at: 2.4, kind: 'sweat', actor: 'cy' },
    { at: 3.1, kind: 'burst', actor: 'cb', emoji: '✨', n: 5, dur: 0.4 },
    { at: 3.5, kind: 'pop', actor: 'owl', emoji: '👀', dur: 0.5 },
    { at: 3.65, kind: 'bubble', actor: 'cb', emoji: '😖', dur: 0.4 },
    { at: 4.4, kind: 'dizzy', actor: 'owl', dur: 1.1 },
    { at: 5.0, kind: 'line', actor: 'cg', target: 'lemon', dx: -4, dy: -2, color: '#FF6F91', width: 1.2, dur: 0.35 },
    { at: 6.75, kind: 'pop', actor: 'owl', emoji: '😘', dur: 0.5 },
    { at: 7.45, kind: 'burst', actor: 'cr', emoji: '💕', n: 5, dur: 0.6 },
    { at: 7.6, kind: 'pop', actor: 'cr', emoji: '😳', dur: 0.6 },
    { at: 8.85, kind: 'burst', actor: 'cr', emoji: '💨', n: 6, dur: 0.5 },
    { at: 9.1, kind: 'pop', actor: 'owl', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.1, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 88, y: 64 } },
  ],
  cues: [
    { at: 1.4, sfx: 'blip' },
    { at: 1.5, say: '紅' },
    { at: 1.8, sfx: 'poof' },
    { at: 3.1, sfx: 'poof' },
    { at: 4.0, sfx: 'blip' }, { at: 4.2, sfx: 'blip' }, { at: 4.4, sfx: 'blip' }, { at: 4.6, sfx: 'blip' },
    { at: 5.0, sfx: 'slide' },
    { at: 5.35, sfx: 'gulp' },
    { at: 6.35, say: '紅' },
    { at: 6.95, sfx: 'whoosh' },
    { at: 7.45, say: '臉紅' },
    { at: 8.9, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
