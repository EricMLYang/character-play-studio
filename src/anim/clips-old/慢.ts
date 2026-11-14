import type { Clip, Move } from '../clip'

// 慢（重做）：導演豬探長打板「開麥拉」，大砲一轟——拉布拉多警長卻用超級慢動作游出砲口，連地上的蝸牛都超過他；豬探長跳上去推他屁股，反被彈下來。
// 警長慢慢輕輕碰到積木塔……停一下，力氣才「碰」地一次到齊，把塔撞飛，積木落成「慢」。國字讓到上方，豬探長在中間打板，警長慢動作大跳（慢動作）。
// 回馬槍：蝸牛輕輕碰一下警長的腳——停一下，警長被一次到齊的力氣彈飛回大砲裡，大砲又轟，他又慢慢飄出來。慢、慢、慢動作
const P = 68.6 // 豬探長（size 20）站在地上的 y
const S = 68.6 // 警長（size 20）站在地上的 y
const IN = 55.5 // 警長坐在大砲裡的 y（下半身被砲管擋住）
const TOP = 52.6 // 坐在大砲頂上的 y
const CX = 9 // 場記板在豬探長手上（相對他的 x）
const CY = -6 // 場記板（相對他的 y）

// 豬探長的移動抄一份給手上的場記板
const withBoard = (ms: Move[]): Move[] => ms.flatMap((m) => [
  m,
  { ...m, actor: 'board', to: m.to && { x: m.to.x + CX, y: m.to.y + CY }, from: m.from && { x: m.from.x + CX, y: m.from.y + CY } },
])

const clip: Clip = {
  char: '慢',
  meta: { theme: '慢動作大砲', cast: '拉布拉多警長＋導演豬探長＋玩具大砲＋蝸牛＋積木塔＋場記板', gags: ['大砲發射卻超級慢動作', '蝸牛都比他快', '跳上去推屁股反被彈下來', '慢慢碰一下力氣晚一步才到齊', '蝸牛一碰把他彈回大砲又慢慢飄出來'] },
  duration: 10,
  bg: { top: '#E3F7EE', bottom: '#F6FFFA', floor: '#BFDCCB', scenery: 'room' },
  actors: [
    { id: 'k1', emoji: '🟪', x: 134, y: 70, size: 10 },
    { id: 'k2', emoji: '🟪', x: 134, y: 61.5, size: 10 },
    { id: 'k3', emoji: '🟪', x: 134, y: 53, size: 10 },
    { id: 'k4', emoji: '🟪', x: 134, y: 44.5, size: 10 },
    { id: 'snail', emoji: '🐌', x: 54, y: 72, size: 11, flip: true },
    { id: 'sheriff', emoji: 'hero:sheriff/whistle', x: 36, y: IN, size: 20 },
    { id: 'cannon', emoji: '🛢️', x: 36, y: 69.4, size: 18 },
    { id: 'pig', emoji: 'hero:pig/idle', x: 12, y: P, size: 20, hidden: true, flip: true },
    { id: 'board', emoji: '🎬', x: 12 + CX, y: P + CY, size: 9, hidden: true, float: true },
  ],
  moves: [
    // 警長坐在大砲裡吹哨；導演豬探長拿著場記板走進來
    { at: 0, actor: 'sheriff', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
    ...withBoard([{ at: 0, actor: 'pig', do: 'enter', from: { x: -14, y: P }, dur: 0.5, ease: 'out' }]),
    // 打板：開麥拉！
    { at: 0.6, actor: 'board', do: 'squash', amount: 0.35, dur: 0.2 },
    { at: 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 0.65, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    // 拉繩子點火
    { at: 0.95, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 1.15, actor: 'pig', do: 'tilt', amount: -22, dur: 0.35 },
    { at: 1.15, actor: 'cannon', do: 'squash', amount: 0.3, dur: 0.25 },
    // 轟！——警長用超級慢動作游出去
    { at: 1.35, actor: 'cannon', do: 'shake', amount: 1.4, dur: 0.4 },
    { at: 1.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 1.35, actor: 'sheriff', do: 'moveTo', to: { x: 116, y: 42 }, dur: 2.85, ease: 'linear' },
    { at: 1.5, actor: 'sheriff', do: 'shake', amount: 0.7, dur: 2.7 },
    // 地上的蝸牛超過他
    { at: 1.5, actor: 'snail', do: 'moveTo', to: { x: 116, y: 72 }, dur: 2.4, ease: 'linear' },
    { at: 2.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 豬探長等不及，跳上去推他屁股——推不動，被彈下來，場記板飛出去
    { at: 2.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 2.25, actor: 'pig', do: 'squash', amount: -0.35, dur: 0.3 },
    ...withBoard([{ at: 2.55, actor: 'pig', do: 'moveTo', to: { x: 66, y: 58 }, arc: 10, dur: 0.3, ease: 'out', anticipate: 3 }]),
    { at: 2.85, actor: 'sheriff', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 2.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 彈回去，一屁股坐在大砲頂上
    ...withBoard([{ at: 2.85, actor: 'pig', do: 'moveTo', to: { x: 36, y: TOP }, arc: 10, dur: 0.45, ease: 'in' }]),
    { at: 2.85, actor: 'pig', do: 'spin', times: -1, dur: 0.45 },
    { at: 3.3, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.3, actor: 'cannon', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 3.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 蝸牛先到，回頭看他
    { at: 3.95, actor: 'snail', do: 'flip' },
    // 慢慢、輕輕碰到積木塔……
    { at: 4.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 4.2, actor: 'k4', do: 'tilt', amount: 4, dur: 0.3 },
    // ……力氣一次到齊：碰！
    { at: 4.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.6, actor: 'sheriff', do: 'moveTo', to: { x: 140, y: S }, dur: 0.15, ease: 'in' },
    { at: 4.6, actor: 'sheriff', do: 'spin', times: 1, dur: 0.3 },
    { at: 4.6, actor: 'k1', do: 'moveTo', to: { x: 54, y: 30 }, arc: 20, dur: 0.3, ease: 'out' },
    { at: 4.6, actor: 'k2', do: 'moveTo', to: { x: 96, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'k3', do: 'moveTo', to: { x: 116, y: 24 }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'k4', do: 'moveTo', to: { x: 122, y: 8 }, dur: 0.4, ease: 'out' },
    ...['k1', 'k2', 'k3', 'k4'].map((actor, i) => ({ at: 4.6, actor, do: 'spin' as const, times: i % 2 ? -2 : 2, dur: 0.6 })),
    { at: 4.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 4.65, actor: 'snail', do: 'hop', amount: 3, dur: 0.25 },
    ...([['k1', 4.85], ['k2', 5.1], ['k3', 5.35], ['k4', 5.65]] as const).map(([actor, at]) => ({ at, actor, do: 'vanish' as const, dur: 0.15 })),
    // 國字拼好：大家看傻了
    { at: 6.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 6.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    // 國字讓位：豬探長撿回場記板，警長走到中間
    ...withBoard([{ at: 6.85, actor: 'pig', do: 'moveTo', to: { x: 56, y: P }, arc: 8, dur: 0.4, ease: 'out' }]),
    { at: 6.85, actor: 'sheriff', do: 'moveTo', to: { x: 96, y: S }, dur: 0.5 },
    // 打板：慢動作！——警長慢動作大跳
    { at: 7.35, actor: 'board', do: 'squash', amount: 0.4, dur: 0.2 },
    { at: 7.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 7.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 7.4, actor: 'sheriff', do: 'hop', amount: 20, dur: 1.05 },
    { at: 7.4, actor: 'sheriff', do: 'shake', amount: 0.7, dur: 1.0 },
    // 回馬槍：蝸牛慢慢爬過來，輕輕碰一下他的腳
    { at: 7.0, actor: 'snail', do: 'flip' },
    { at: 7.0, actor: 'snail', do: 'moveTo', to: { x: 107, y: 72 }, dur: 1.45, ease: 'linear' },
    { at: 8.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 8.5, actor: 'snail', do: 'tilt', amount: 12, dur: 0.2 },
    { at: 8.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // ……停一下，力氣一次到齊：被彈飛回大砲裡
    { at: 8.85, actor: 'sheriff', do: 'moveTo', to: { x: 36, y: IN }, arc: 22, dur: 0.35, ease: 'in' },
    { at: 8.85, actor: 'sheriff', do: 'spin', times: -2, dur: 0.35 },
    { at: 8.85, actor: 'snail', do: 'moveTo', to: { x: 146, y: 72 }, dur: 0.3, ease: 'out' },
    { at: 8.85, actor: 'snail', do: 'spin', times: 1, dur: 0.3 },
    ...withBoard([{ at: 8.9, actor: 'pig', do: 'moveTo', to: { x: 124, y: P }, dur: 0.4, ease: 'out' }]),
    { at: 8.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 9.2, actor: 'cannon', do: 'squash', amount: 0.35, dur: 0.2 },
    // 大砲又轟，他又慢慢飄出來
    { at: 9.4, actor: 'cannon', do: 'shake', amount: 1.4, dur: 0.35 },
    { at: 9.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 9.4, actor: 'sheriff', do: 'moveTo', to: { x: 40, y: 44 }, dur: 0.6, ease: 'linear' },
    { at: 9.4, actor: 'sheriff', do: 'shake', amount: 0.7, dur: 0.6 },
    { at: 9.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  ],
  builds: [
    // 撞飛的積木一塊一塊落下：忄 → 日 → 罒 → 又
    { at: 4.85, dur: 0.4, strokes: [0, 1, 2], from: 'k1', color: '#7048E8' },
    { at: 5.1, dur: 0.4, strokes: [3, 4, 5, 6], from: 'k2', color: '#7048E8' },
    { at: 5.35, dur: 0.45, strokes: [7, 8, 9, 10, 11], from: 'k3', color: '#9C36B5' },
    { at: 5.65, dur: 0.4, strokes: [12, 13], from: 'k4', color: '#9C36B5' },
  ],
  glyph: [
    { at: 6.1, dur: 0.4, do: 'wobble' },
    { at: 6.9, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.1, kind: 'pop', actor: 'sheriff', emoji: '🎵', dur: 0.4 },
    { at: 0.6, kind: 'burst', actor: 'board', emoji: '✨', n: 5, dur: 0.4 },
    { at: 0.7, kind: 'pop', actor: 'sheriff', emoji: '💪', dur: 0.45 },
    { at: 0.95, dur: 0.4, kind: 'line', actor: 'pig', target: 'cannon', color: '#8D6E63', width: 1.2 },
    { at: 1.35, kind: 'burst', actor: 'cannon', emoji: '💨', n: 6, dur: 0.6 },
    { at: 2.0, kind: 'sweat', actor: 'sheriff', dur: 1.0 },
    { at: 2.1, kind: 'pop', actor: 'pig', emoji: '😑', dur: 0.4 },
    { at: 2.85, kind: 'burst', actor: 'pig', n: 1, dy: 2, dur: 0.35 },
    { at: 3.3, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    { at: 3.4, kind: 'pop', actor: 'sheriff', emoji: '😱', dur: 0.45 },
    { at: 3.95, kind: 'pop', actor: 'snail', emoji: '😎', dur: 0.5 },
    { at: 4.25, kind: 'pop', actor: 'sheriff', emoji: '😅', dur: 0.4 },
    { at: 4.6, kind: 'burst', actor: 'k3', n: 1, dur: 0.35 },
    { at: 4.7, kind: 'pop', actor: 'pig', emoji: '😲', dur: 0.45 },
    { at: 4.8, kind: 'dizzy', actor: 'sheriff', dur: 1.0 },
    { at: 7.35, kind: 'burst', actor: 'board', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.6, kind: 'sweat', actor: 'sheriff', dx: 6, dur: 0.8 },
    { at: 8.55, kind: 'pop', actor: 'sheriff', emoji: '❓', dx: 12, dy: 2, dur: 0.35 },
    { at: 8.85, kind: 'burst', actor: 'snail', n: 1, dx: -6, dur: 0.3 },
    { at: 9.1, kind: 'pop', actor: 'snail', emoji: '😎', dur: 0.5 },
    { at: 9.4, kind: 'burst', actor: 'cannon', emoji: '💨', n: 6, dur: 0.5 },
    { at: 9.5, kind: 'pop', actor: 'pig', emoji: '😆', dur: 0.5 },
    { at: 9.55, kind: 'pop', actor: 'sheriff', emoji: '😩', dx: -8, dur: 0.45 },
  ],
  camera: [
    { at: 1.35, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 4.6, dur: 0.4, do: 'shake', amount: 2 },
    { at: 8.85, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 力氣一次到齊：白光一閃
    { at: 4.6, dur: 0.04, level: -0.7 },
    { at: 4.64, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'blip' },
    { at: 0.6, sfx: 'clink' },
    { at: 1.35, sfx: 'poof' },
    { at: 1.7, say: '慢' },
    { at: 2.55, sfx: 'whoosh' },
    { at: 2.85, sfx: 'boing' },
    { at: 4.2, sfx: 'tap' },
    { at: 4.6, sfx: 'bonk' },
    { at: 4.65, sfx: 'rumble' },
    { at: 6.1, say: '慢' },
    { at: 7.35, sfx: 'clink' },
    { at: 7.4, say: '慢動作' },
    { at: 8.5, sfx: 'tap' },
    { at: 8.85, sfx: 'boing' },
    { at: 9.4, sfx: 'poof' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
