import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 果（重做）：拉布拉多警長在水果攤吹哨，果架上的大蘋果滾下來把他撞成四腳朝天；他跳上蘋果想踩住它，結果蘋果載著他越滾越快，
// 一頭撞上木頭果架——蘋果爆開變成「田」、木頭果架飛起來變成「木」，旁邊的水果全被震上天。國字讓到上方，水果一顆顆掉回來疊在他頭上、滾到腳邊（水果）。
// 回馬槍：最後掉下來的是一顆大鳳梨，砸散頭上的水果、把他壓扁，他只好頂著大鳳梨搖搖晃晃走開。果、果、水果
const B = 66.9 // 警長（size 24）站在地上的 y
const W = 70.3 // 大蘋果（size 16）在地上的 y
const R = 53.5 // 警長站在大蘋果上的 y
const HEAD = ['apple', 'nana']
const HY = [50.5, 42] // 頭上那一疊（梨子、香蕉）
const BIG = 52.5 // 大鳳梨頂在頭上的 y

// 警長跟著大蘋果一起走（站在上面）
const ride = (at: number, dur: number, x: number, ease: Move['ease'], turn: number): Move[] => [
  { at, dur, actor: 'w1', do: 'moveTo', to: { x, y: W }, ease },
  { at, dur, actor: 'w1', do: 'rotateTo', amount: turn, ease },
  { at, dur, actor: 'dog', do: 'moveTo', to: { x, y: R }, ease },
]

const clip: Clip = {
  char: '果',
  meta: { theme: '警長追滾走的大蘋果', cast: '拉布拉多警長＋大蘋果＋木頭果架＋水果＋大鳳梨', gags: ['吹哨蘋果不聽話滾下來撞翻他', '跳上蘋果想踩住反被載著跑', '撞上果架蘋果爆開水果全飛上天', '水果一顆顆掉回來疊在頭上', '大鳳梨砸下來只好頂著走'] },
  duration: 10,
  bg: { top: '#FFE8CC', bottom: '#FFF4E6', floor: '#E6CFA8', scenery: 'city' },
  actors: [
    { id: 'log', emoji: '🪵', x: 100, y: 69.4, size: 18, pivot: 'center' },
    { id: 'w2', emoji: '🍍', x: 140, y: 69.4, size: 18, pivot: 'center' },
    { id: 'w1', emoji: '🍎', x: 100, y: 56.5, size: 16, pivot: 'center' },
    { id: 'dog', emoji: 'hero:sheriff/idle', x: 30, y: B, size: 24, hidden: true, flip: true },
    { id: 'apple', emoji: '🍐', x: 112, y: 71.5, size: 13, pivot: 'center' },
    { id: 'nana', emoji: '🍌', x: 120, y: 72.4, size: 11, pivot: 'center' },
    { id: 'grape', emoji: '🍇', x: 128, y: 71.5, size: 13, pivot: 'center' },
    { id: 'o1', emoji: '🍊', x: 150, y: 72.4, size: 11, pivot: 'center' },
    { id: 's1', emoji: '🍓', x: 156, y: 73.2, size: 9, pivot: 'center' },
  ],
  moves: [
    // 警長走進來，對著水果攤神氣地吹哨
    { at: 0, actor: 'dog', do: 'enter', from: { x: -20, y: B }, dur: 0.6, ease: 'out' },
    { at: 0.7, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    // 大蘋果晃一晃，從果架上滾下來，朝他直直滾過去
    { at: 1.0, actor: 'w1', do: 'tilt', amount: -14, dur: 0.35 },
    { at: 1.35, actor: 'w1', do: 'moveTo', to: { x: 86, y: W }, arc: 4, dur: 0.3, ease: 'in' },
    { at: 1.35, actor: 'w1', do: 'rotateTo', amount: -60, dur: 0.3 },
    { at: 1.65, actor: 'w1', do: 'moveTo', to: { x: 49, y: W }, dur: 0.45, ease: 'in' },
    { at: 1.65, actor: 'w1', do: 'rotateTo', amount: -380, dur: 0.45, ease: 'in' },
    { at: 1.6, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 撞翻！四腳朝天，大蘋果彈回去
    { at: 2.1, actor: 'dog', do: 'moveTo', to: { x: 27, y: B }, dur: 0.2, ease: 'out' },
    { at: 2.1, actor: 'dog', do: 'rotateTo', amount: -90, dur: 0.2, ease: 'out' },
    { at: 2.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 2.1, actor: 'w1', do: 'moveTo', to: { x: 54, y: W }, dur: 0.4, ease: 'out' },
    { at: 2.1, actor: 'w1', do: 'rotateTo', amount: 200, dur: 0.4, ease: 'out' },
    // 爬起來，氣呼呼
    { at: 2.65, actor: 'dog', do: 'rotateTo', amount: 90, dur: 0.25, ease: 'back' },
    { at: 2.65, actor: 'dog', do: 'moveTo', to: { x: 30, y: B }, dur: 0.25 },
    { at: 2.9, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 2.95, actor: 'dog', do: 'shake', amount: 1.2, dur: 0.3 },
    // 蹲一下，跳上大蘋果踩住它
    { at: 3.2, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 3.4, actor: 'dog', do: 'moveTo', to: { x: 54, y: R }, arc: 12, dur: 0.35, ease: 'out' },
    { at: 3.75, actor: 'w1', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 3.75, actor: 'dog', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 3.85, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    // 大蘋果開始滾，載著他越滾越快
    { at: 4.3, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/run' },
    ...ride(4.3, 0.7, 86, 'in', 300),
    { at: 4.3, actor: 'dog', do: 'shake', amount: 1, dur: 0.7 },
    // 碰！撞上果架：大蘋果爆開，果架和水果全飛上天，警長被彈飛
    { at: 5.0, actor: 'w1', do: 'vanish', dur: 0.08 },
    { at: 5.0, actor: 'log', do: 'moveTo', to: { x: 92, y: 40 }, dur: 0.3, ease: 'out' },
    { at: 5.0, actor: 'log', do: 'spin', times: 1, dur: 0.3 },
    { at: 5.3, actor: 'log', do: 'vanish', dur: 0.15 },
    { at: 5.0, actor: 'apple', do: 'moveTo', to: { x: 60, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 5.0, actor: 'apple', do: 'spin', times: 2, dur: 0.4 },
    { at: 5.02, actor: 'nana', do: 'moveTo', to: { x: 110, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 5.02, actor: 'nana', do: 'spin', times: -2, dur: 0.4 },
    { at: 5.04, actor: 'grape', do: 'moveTo', to: { x: 140, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 5.04, actor: 'grape', do: 'spin', times: 2, dur: 0.4 },
    { at: 5.05, actor: 'o1', do: 'moveTo', to: { x: 30, y: -20 }, dur: 0.45, ease: 'out' },
    { at: 5.05, actor: 's1', do: 'moveTo', to: { x: 125, y: -20 }, dur: 0.45, ease: 'out' },
    { at: 5.06, actor: 'w2', do: 'moveTo', to: { x: 150, y: -30 }, dur: 0.45, ease: 'out' },
    { at: 5.05, actor: 'o1', do: 'moveTo', to: { x: 30, y: -20 }, dur: 0.45, ease: 'out' },
    { at: 5.05, actor: 's1', do: 'moveTo', to: { x: 125, y: -20 }, dur: 0.45, ease: 'out' },
    { at: 5.06, actor: 'w2', do: 'spin', times: -1, dur: 0.45 },
    { at: 5.0, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 5.0, actor: 'dog', do: 'moveTo', to: { x: 136, y: B }, arc: 22, dur: 0.55, ease: 'linear' },
    { at: 5.0, actor: 'dog', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
    { at: 5.55, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 6.2, actor: 'dog', do: 'shake', amount: 1, dur: 0.35 },
    { at: 6.55, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 國字讓位：他走到中間，抬頭——水果一顆顆掉回來疊在頭上
    { at: 6.75, actor: 'dog', do: 'flip' },
    { at: 6.8, actor: 'dog', do: 'moveTo', to: { x: 80, y: B }, dur: 0.55 },
    { at: 7.35, actor: 'apple', do: 'moveTo', from: { x: 70, y: -15 }, to: { x: 80, y: HY[0] }, dur: 0.3, ease: 'in' },
    { at: 7.5, actor: 'nana', do: 'moveTo', from: { x: 90, y: -15 }, to: { x: 80, y: HY[1] }, dur: 0.3, ease: 'in' },
    { at: 7.45, actor: 'o1', do: 'moveTo', from: { x: 50, y: -15 }, to: { x: 60, y: 72.4 }, dur: 0.35, ease: 'in' },
    { at: 7.8, actor: 'o1', do: 'moveTo', to: { x: 52, y: 72.4 }, dur: 0.3, ease: 'out' },
    { at: 7.8, actor: 'o1', do: 'rotateTo', amount: -180, dur: 0.3, ease: 'out' },
    { at: 7.6, actor: 's1', do: 'moveTo', from: { x: 112, y: -15 }, to: { x: 106, y: 73.2 }, dur: 0.35, ease: 'in' },
    { at: 7.95, actor: 's1', do: 'moveTo', to: { x: 114, y: 73.2 }, dur: 0.3, ease: 'out' },
    { at: 7.95, actor: 's1', do: 'rotateTo', amount: 200, dur: 0.3, ease: 'out' },
    // 第三顆葡萄砸在香蕉上彈開，滾到腳邊
    { at: 7.65, actor: 'grape', do: 'moveTo', from: { x: 74, y: -15 }, to: { x: 80, y: 36 }, dur: 0.25, ease: 'in' },
    { at: 7.9, actor: 'grape', do: 'moveTo', to: { x: 100, y: 71.5 }, arc: 10, dur: 0.4, ease: 'linear' },
    { at: 7.9, actor: 'grape', do: 'rotateTo', amount: 360, dur: 0.4 },
    { at: 7.65, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    ...pressStack(7.65, 0.2, 0.1, 24, ['apple', 'nana']),
    { at: 7.65, actor: 'dog', do: 'squash', amount: 0.1, dur: 0.2 },
    // 水果！頂著一疊水果開心跳
    { at: 8.0, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    ...['dog', ...HEAD].map((actor) => ({ at: 8.0, actor, do: 'hop' as const, amount: 4, dur: 0.3 })),
    // 回馬槍：最後掉下來的是那顆大鳳梨——砸散水果、卡在頭上
    { at: 8.4, actor: 'w2', do: 'moveTo', from: { x: 80, y: -30 }, to: { x: 80, y: BIG }, dur: 0.25, ease: 'in' },
    { at: 8.58, actor: 'apple', do: 'moveTo', to: { x: 10, y: 71.5 }, arc: 10, dur: 0.45, ease: 'linear' },
    { at: 8.58, actor: 'apple', do: 'rotateTo', amount: -360, dur: 0.45 },
    { at: 8.58, actor: 'nana', do: 'moveTo', to: { x: 126, y: 72.4 }, arc: 14, dur: 0.45, ease: 'linear' },
    { at: 8.58, actor: 'nana', do: 'rotateTo', amount: 360, dur: 0.45 },
    { at: 8.6, actor: 'grape', do: 'moveTo', to: { x: 140, y: 71.5 }, arc: 8, dur: 0.5, ease: 'linear' },
    { at: 8.6, actor: 'o1', do: 'moveTo', to: { x: 22, y: 72.4 }, dur: 0.4, ease: 'out' },
    { at: 8.6, actor: 'o1', do: 'rotateTo', amount: -400, dur: 0.4, ease: 'out' },
    { at: 8.6, actor: 's1', do: 'moveTo', to: { x: 150, y: 73.2 }, dur: 0.4, ease: 'out' },
    { at: 8.6, actor: 's1', do: 'rotateTo', amount: 400, dur: 0.4, ease: 'out' },
    { at: 8.6, actor: 'grape', do: 'rotateTo', amount: 360, dur: 0.5 },
    { at: 8.65, actor: 'dog', do: 'squash', amount: 0.45, dur: 0.4 },
    ...pressStack(8.65, 0.4, 0.45, 24, ['w2']),
    { at: 8.65, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    // 頂著大鳳梨，搖搖晃晃走到左邊
    { at: 9.0, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 9.0, actor: 'dog', do: 'flip' },
    { at: 9.0, actor: 'dog', do: 'moveTo', to: { x: 42, y: B }, dur: 0.5 },
    { at: 9.0, actor: 'w2', do: 'moveTo', to: { x: 42, y: BIG }, dur: 0.5 },
    { at: 9.0, actor: 'w2', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 9.55, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
  ],
  builds: [
    // 爆開的大蘋果 → 田；飛起來的木頭果架 → 木
    { at: 5.0, dur: 0.5, strokes: [0, 1, 2, 3], from: 'w1', color: '#E03131' },
    { at: 5.3, dur: 0.55, strokes: [4, 5, 6, 7], from: 'log', color: '#8D5524' },
  ],
  glyph: [
    { at: 5.9, dur: 0.4, do: 'wobble' },
    { at: 6.7, dur: 0.45, do: 'park', to: { x: 80, y: 19.5 } },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.55, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.75, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.6 },
    { at: 1.05, kind: 'pop', actor: 'w1', emoji: '❗', dur: 0.35 },
    { at: 1.6, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.45 },
    { at: 2.1, kind: 'burst', x: 38, y: 64, n: 1, dur: 0.35 },
    { at: 2.25, kind: 'dizzy', actor: 'dog', dx: -6, dy: 10, dur: 0.4 },
    { at: 2.95, kind: 'pop', actor: 'dog', emoji: '😤', dur: 0.4 },
    { at: 3.2, kind: 'puff', actor: 'dog', dur: 0.3 },
    { at: 3.9, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.4 },
    { at: 4.35, kind: 'sweat', actor: 'dog' },
    { at: 4.55, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.4 },
    { at: 5.0, kind: 'burst', x: 92, y: 64, n: 1, dur: 0.4 },
    { at: 5.0, kind: 'burst', x: 92, y: 64, emoji: '❤️', n: 8, dur: 0.5 },
    { at: 5.6, kind: 'dizzy', actor: 'dog', dur: 0.9 },
    { at: 7.25, kind: 'pop', actor: 'dog', emoji: '❓', dx: 16, dy: 6, dur: 0.4 },
    { at: 8.0, kind: 'burst', actor: 'dog', emoji: '✨', n: 8, dy: 6, dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'dog', emoji: '❗', dx: 16, dy: 6, dur: 0.3 },
    { at: 8.6, kind: 'burst', x: 80, y: 44, n: 1, dur: 0.35 },
    { at: 8.8, kind: 'dizzy', actor: 'dog', dy: 8, dur: 0.4 },
    { at: 9.05, kind: 'sweat', actor: 'dog', dx: 8 },
    { at: 9.6, kind: 'pop', actor: 'dog', emoji: '😅', dx: -16, dy: -2, dur: 0.5 },
  ],
  camera: [
    { at: 2.1, dur: 0.25, do: 'shake', amount: 1 },
    { at: 5.0, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 7.8, dur: 0.5, do: 'punch', amount: 0.1, to: { x: 80, y: 52 } },
    { at: 8.62, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    // 大蘋果爆開：白光一閃
    { at: 5.0, dur: 0.04, level: -0.45 },
    { at: 5.04, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '果' },
    { at: 1.35, sfx: 'slide' },
    { at: 2.1, sfx: 'bonk' },
    { at: 3.4, sfx: 'boing' },
    { at: 3.85, sfx: 'blip' },
    { at: 4.3, sfx: 'whoosh' },
    { at: 5.0, sfx: 'crack' },
    { at: 5.02, sfx: 'splash' },
    { at: 5.9, say: '果' },
    { at: 7.35, sfx: 'plop' },
    { at: 7.65, sfx: 'plop' },
    { at: 7.9, sfx: 'boing' },
    { at: 7.8, say: '水果' },
    { at: 7.8, sfx: 'plop' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 8.6, sfx: 'bonk' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
