import type { Clip } from '../clip'

// 足（重做）：消防狗帶球進場要射門，消防車當守門員。第一腳——車頂的梯子一揮，球彈回來砸在他頭上；他退到最後面蓄力、全力一腳，
// 球把消防車撞得往後滑，梯子被震上天轉幾圈，「碰」地砸在中間散成「足」。國字讓到上方，球從天上掉下來，他在中間用腳顛球（足球），
// 一記吊射越過消防車進球門。回馬槍：球網一彈，球原地射回來把他打飛到左邊，球還落在他頭上。足、足、足球
const B = 67.8 // 消防狗（size 22）站在地上的 y
const E = 66.9 // 消防車（size 24）
const R = 74 // 足球在地上

const clip: Clip = {
  char: '足',
  meta: { theme: '消防車當守門員', cast: '消防員＋消防車＋足球＋梯子＋球門', gags: ['梯子一揮球彈回來砸頭', '蓄力全力一腳撞飛梯子', '梯子砸下來散成字', '中間顛球吊射', '球網彈回來把他打飛球落頭上'] },
  duration: 10,
  bg: { top: '#FFF6E6', bottom: '#FFEFD6', floor: '#E9D3B0', scenery: 'room' },
  actors: [
    { id: 'goal', emoji: '🥅', x: 140, y: 69, size: 18 },
    { id: 'engine', emoji: '🚒', x: 110, y: E, size: 24 },
    { id: 'ladder', emoji: '🪜', x: 114, y: 51, size: 13, float: true },
    { id: 'ff', emoji: 'hero:firefighter/idle', x: 34, y: B, size: 22, hidden: true, flip: true },
    { id: 'ball', emoji: '⚽', x: 50, y: R, size: 8, hidden: true },
  ],
  moves: [
    // 帶球進場；消防車在球門前面熱身
    { at: 0, actor: 'ff', do: 'enter', from: { x: -8, y: B }, dur: 0.6, ease: 'out' },
    { at: 0, actor: 'ball', do: 'enter', from: { x: -6, y: R }, dur: 0.6, ease: 'out' },
    { at: 0, actor: 'ball', do: 'spin', times: 3, dur: 0.6 },
    { at: 0, actor: 'engine', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 0.8, actor: 'engine', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 0.8, actor: 'ladder', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 第一腳：輕輕一踢——梯子一揮，球彈回來砸頭
    { at: 1.2, actor: 'ff', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.5, actor: 'ff', do: 'moveTo', to: { x: 42, y: B }, dur: 0.12, ease: 'in' },
    { at: 1.6, actor: 'ball', do: 'moveTo', to: { x: 108, y: 50 }, dur: 0.3, ease: 'linear' },
    { at: 1.6, actor: 'ball', do: 'spin', times: 2, dur: 0.3 },
    { at: 1.7, actor: 'ladder', do: 'tilt', amount: -40, dur: 0.3 },
    { at: 1.9, actor: 'ball', do: 'moveTo', to: { x: 42, y: 52 }, arc: 10, dur: 0.4, ease: 'linear' },
    { at: 2.3, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 2.3, actor: 'ff', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 2.3, actor: 'ball', do: 'moveTo', to: { x: 54, y: R }, arc: 6, dur: 0.35, ease: 'bounce' },
    { at: 2.45, actor: 'engine', do: 'bounce', amount: 2.5, times: 3, dur: 0.6 },
    // 第二次：退到最後面，蓄力全力一腳
    { at: 2.95, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 2.95, actor: 'ff', do: 'moveTo', to: { x: 20, y: B }, dur: 0.45, ease: 'inOut' },
    { at: 3.4, actor: 'ff', do: 'squash', amount: -0.4, dur: 0.4 },
    { at: 3.4, actor: 'ff', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 3.8, actor: 'ff', do: 'moveTo', to: { x: 46, y: B }, dur: 0.18, anticipate: 5, ease: 'in' },
    { at: 3.98, actor: 'ball', do: 'moveTo', to: { x: 100, y: 60 }, dur: 0.15, ease: 'linear' },
    // 踢太用力，自己在空中轉一圈滑回去
    { at: 3.98, actor: 'ff', do: 'hop', amount: 12, dur: 0.45 },
    { at: 3.98, actor: 'ff', do: 'spin', times: -1, dur: 0.45 },
    { at: 3.98, actor: 'ff', do: 'moveTo', to: { x: 28, y: B }, dur: 0.45, ease: 'out' },
    { at: 4.15, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 球撞上消防車：車往後滑，梯子被震上天，球飛出天花板
    { at: 4.13, actor: 'engine', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.13, actor: 'engine', do: 'moveTo', to: { x: 128, y: E }, dur: 0.35, ease: 'out' },
    { at: 4.13, actor: 'ball', do: 'moveTo', to: { x: 104, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 4.13, actor: 'ladder', do: 'moveTo', to: { x: 82, y: 12 }, arc: 8, dur: 0.6, ease: 'out' },
    { at: 4.13, actor: 'ladder', do: 'spin', times: 3, dur: 0.85 },
    { at: 4.13, actor: 'ladder', do: 'scaleTo', amount: 1.7, dur: 0.6, ease: 'out' },
    // 梯子砸下來
    { at: 4.75, actor: 'ladder', do: 'moveTo', to: { x: 80, y: 62 }, dur: 0.25, ease: 'in' },
    { at: 5.0, actor: 'ladder', do: 'vanish', dur: 0.08 },
    { at: 5.0, actor: 'ff', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.0, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.0, actor: 'ff', do: 'hop', amount: 5, dur: 0.35 },
    // 國字讓位：走到中間，球從天上掉下來
    { at: 6.75, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 6.8, actor: 'ff', do: 'moveTo', to: { x: 84, y: B }, dur: 0.5, ease: 'inOut' },
    { at: 6.7, actor: 'ball', do: 'moveTo', to: { x: 102, y: -20 }, dur: 0.1 },
    { at: 6.95, actor: 'ball', do: 'moveTo', to: { x: 100, y: 70 }, dur: 0.35, ease: 'in' },
    // 顛球三下
    ...[7.3, 7.55, 7.8].flatMap((at) => [
      { at, actor: 'ball', do: 'hop' as const, amount: 10, dur: 0.25 },
      { at, actor: 'ball', do: 'spin' as const, times: 1, dur: 0.25 },
      { at, actor: 'ff', do: 'tilt' as const, amount: -8, dur: 0.15 },
    ]),
    { at: 7.4, actor: 'engine', do: 'moveTo', to: { x: 118, y: E }, dur: 0.4, ease: 'out' },
    // 吊射越過消防車
    { at: 7.95, actor: 'ff', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 8.1, actor: 'ball', do: 'moveTo', to: { x: 143, y: 68 }, arc: 46, dur: 0.45, ease: 'linear' },
    { at: 8.1, actor: 'ball', do: 'spin', times: 2, dur: 0.45 },
    { at: 8.25, actor: 'engine', do: 'tilt', amount: 8, dur: 0.35 },
    { at: 8.55, actor: 'goal', do: 'shake', amount: 1, dur: 0.25 },
    { at: 8.55, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 8.55, actor: 'ff', do: 'hop', amount: 5, dur: 0.3 },
    // 回馬槍：球網一彈，球射回來把他打飛
    { at: 8.75, actor: 'goal', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 8.8, actor: 'ball', do: 'moveTo', to: { x: 92, y: 58 }, dur: 0.15, ease: 'linear' },
    { at: 8.95, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.95, actor: 'ff', do: 'moveTo', to: { x: 26, y: B }, arc: 24, dur: 0.4, ease: 'out' },
    { at: 8.95, actor: 'ff', do: 'spin', times: -2, dur: 0.4 },
    { at: 9.35, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 8.95, actor: 'ball', do: 'moveTo', to: { x: 28, y: 56 }, arc: 30, dur: 0.65, ease: 'linear' },
    { at: 9.6, actor: 'ball', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 9.2, actor: 'engine', do: 'bounce', amount: 2.5, times: 3, dur: 0.7 },
  ],
  builds: [
    // 梯子砸在中間散開：橫桿變成上面的口，兩根長桿變成下面
    { at: 5.0, dur: 0.4, strokes: [0, 1, 2], from: 'ladder', color: '#E03131' },
    { at: 5.3, dur: 0.6, strokes: [3, 4, 5, 6], from: 'ladder', color: '#C92A2A' },
  ],
  glyph: [
    { at: 5.95, dur: 0.4, do: 'wobble' },
    { at: 6.75, dur: 0.45, do: 'park' },
    { at: 9.2, dur: 0.4, do: 'home' },
    { at: 9.6, dur: 0.4, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'ff', emoji: '🥅', dur: 0.7 },
    { at: 0.3, kind: 'pop', actor: 'engine', emoji: '😤', dur: 0.45 },
    { at: 1.9, kind: 'burst', actor: 'ladder', n: 1, dur: 0.3 },
    { at: 2.3, kind: 'burst', actor: 'ff', n: 1, dur: 0.3 },
    { at: 2.4, kind: 'dizzy', actor: 'ff', dur: 0.6 },
    { at: 2.45, kind: 'pop', actor: 'engine', emoji: '😆', dur: 0.5 },
    { at: 3.0, kind: 'pop', actor: 'ff', emoji: '😤', dur: 0.4 },
    { at: 3.4, kind: 'sweat', actor: 'ff' },
    { at: 3.45, kind: 'puff', actor: 'ff', dur: 0.4 },
    { at: 3.8, kind: 'puff', actor: 'ff', dur: 0.35 },
    { at: 4.13, kind: 'burst', actor: 'engine', n: 1, dx: -8, dur: 0.4 },
    { at: 4.4, kind: 'dizzy', actor: 'engine', dur: 1.3 },
    { at: 5.0, kind: 'burst', x: 80, y: 60, emoji: '💥', n: 6, dur: 0.5 },
    { at: 7.05, kind: 'pop', actor: 'ff', emoji: '❗', dx: -12, dur: 0.35 },
    { at: 7.3, kind: 'burst', actor: 'ball', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.6, kind: 'pop', actor: 'engine', emoji: '😲', dur: 0.5 },
    { at: 8.55, kind: 'burst', actor: 'goal', emoji: '⭐', n: 6, dx: -6, dur: 0.5 },
    { at: 8.95, kind: 'burst', x: 90, y: 56, n: 1, dur: 0.3 },
    { at: 9.4, kind: 'dizzy', actor: 'ff', dur: 0.6 },
    { at: 9.25, kind: 'pop', actor: 'engine', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 3.3, dur: 0.5, do: 'zoom', amount: 1.3, actor: 'ff' },
    { at: 3.9, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.13, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 5.0, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 8.95, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 梯子砸下來：白光一閃
    { at: 5.0, dur: 0.04, level: -0.7 },
    { at: 5.04, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'rumble' },
    { at: 1.55, say: '足' },
    { at: 1.6, sfx: 'tap' },
    { at: 1.9, sfx: 'clink' },
    { at: 2.3, sfx: 'bonk' },
    { at: 3.4, sfx: 'rumble' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 4.13, sfx: 'bonk' },
    { at: 4.75, sfx: 'whoosh' },
    { at: 5.0, sfx: 'crack' },
    { at: 5.95, say: '足' },
    { at: 7.3, say: '足球' },
    { at: 8.1, sfx: 'whoosh' },
    { at: 8.55, sfx: 'cheer' },
    { at: 8.75, sfx: 'boing' },
    { at: 8.95, sfx: 'bonk' },
    { at: 9.6, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
