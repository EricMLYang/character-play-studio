import type { Clip } from '../clip'

// 可：小幽靈想嚇人。對兔子「哇！」——兔子摸摸牠的頭說好可愛；對小狗「哇——！」——小狗搖尾巴舔牠一口。
// 小幽靈氣得鼓成大大一團，用盡全力「哇————！」……結果自己被自己的回音嚇到，嚇得飛起來，變成「可」。可、可、可怕
const clip: Clip = {
  char: '可',
  meta: { theme: '小幽靈', cast: '小幽靈＋兔子＋小狗', gags: ['想嚇人卻被說可愛', '越嚇越用力', '被自己的回音嚇到'] },
  duration: 10,
  bg: { top: '#2A2350', bottom: '#4B3D7A', floor: '#3E3A5C', scenery: 'night' },
  actors: [
    { id: 'ghost', emoji: '👻', x: 60, y: 60, size: 15, hidden: true, float: true },
    { id: 'bunny', emoji: '🐰', x: 26, y: 70, size: 16, hidden: true },
    { id: 'dog', emoji: '🐶', x: 132, y: 69.5, size: 17, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bunny', do: 'pop' },
    { at: 0.1, actor: 'dog', do: 'pop' },
    { at: 0.3, actor: 'ghost', do: 'pop', dur: 0.4 },
    { at: 0.7, actor: 'ghost', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 對兔子：哇！——好可愛
    { at: 1.4, actor: 'ghost', do: 'moveTo', to: { x: 40, y: 58 }, dur: 0.4 },
    { at: 1.8, actor: 'ghost', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 2.3, actor: 'bunny', do: 'hop', amount: 4, dur: 0.3 },
    // 對小狗：哇——！——小狗舔一口
    { at: 3.2, actor: 'ghost', do: 'moveTo', to: { x: 116, y: 58 }, dur: 0.6 },
    { at: 3.8, actor: 'ghost', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 4.3, actor: 'dog', do: 'hop', amount: 6, dur: 0.3 },
    { at: 4.3, actor: 'dog', do: 'moveTo', to: { x: 124, y: 69.5 }, dur: 0.2 },
    { at: 4.6, actor: 'ghost', do: 'shake', amount: 1, dur: 0.4 },
    // 鼓成大大一團——用盡全力哇！
    { at: 5.2, actor: 'ghost', do: 'moveTo', to: { x: 80, y: 38 }, dur: 0.4 },
    { at: 5.6, actor: 'ghost', do: 'scaleTo', amount: 2.2, dur: 0.6 },
    { at: 6.2, actor: 'ghost', do: 'squash', amount: -0.3, dur: 0.3 },
    // 被自己的回音嚇到
    { at: 6.6, actor: 'ghost', do: 'scaleTo', amount: 0.45, dur: 0.2 },
    { at: 6.8, actor: 'ghost', do: 'moveTo', to: { x: 150, y: 14 }, dur: 0.5, arc: 6 },
    { at: 6.8, actor: 'ghost', do: 'spin', times: 2, dur: 0.5 },
    { at: 8.5, actor: 'bunny', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.5, actor: 'dog', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 超大聲的「哇」
    { at: 6.25, dur: 0.4, strokes: [0], from: 'ghost', color: '#B9A6FF' },
    { at: 6.5, dur: 0.5, strokes: [1, 2, 3], from: 'ghost', color: '#7CF2D2' },
    { at: 6.9, dur: 0.4, strokes: [4], style: 'drop', from: { x: 80, y: 0 }, color: '#B9A6FF' },
  ],
  glyph: [{ at: 7.35, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.8, kind: 'burst', actor: 'ghost', emoji: '❗', n: 1, dur: 0.4 },
    { at: 2.3, kind: 'pop', actor: 'bunny', emoji: '🥰', dur: 0.7 },
    { at: 2.5, kind: 'pop', actor: 'ghost', emoji: '😑', dur: 0.5 },
    { at: 3.8, kind: 'burst', actor: 'ghost', emoji: '❗', n: 1, dur: 0.4 },
    { at: 4.3, kind: 'pop', actor: 'dog', emoji: '😛', dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'ghost', emoji: '💢', dur: 0.5 },
    { at: 6.2, kind: 'burst', actor: 'ghost', emoji: '💥', n: 6, dur: 0.6, dy: -8 },
    { at: 6.7, kind: 'pop', actor: 'ghost', emoji: '😱', dur: 0.5 },
    { at: 8.6, kind: 'pop', actor: 'bunny', emoji: '😆', dur: 0.8 },
    { at: 8.7, kind: 'pop', actor: 'ghost', emoji: '😳', dur: 0.8, dx: -14, dy: 10 },
  ],
  camera: [
    { at: 6.2, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: 6.1, dur: 0.1, level: -0.6 },
    { at: 6.3, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.8, say: '可' },
    { at: 1.8, sfx: 'blip' },
    { at: 3.8, sfx: 'blip' },
    { at: 4.3, sfx: 'gulp' },
    { at: 5.6, sfx: 'gulp' },
    { at: 6.2, sfx: 'rumble' },
    { at: 6.8, sfx: 'whoosh' },
    { at: 7.4, say: '可' },
    { at: 8.3, say: '可怕' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
