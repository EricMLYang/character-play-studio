import type { Clip } from '../clip'

// 灰：大掃除！掃地機器人吸灰塵、吸襪子，越吸越貪心，連睡覺的貓都吸進去，脹到「碰」一聲爆開，吐出一團灰變成「灰」。
// 貓咪被噴得全身灰撲撲，用力一抖抖出一大團灰塵，灰塵飄到機器人面前——哈啾！灰、灰、灰塵
const clip: Clip = {
  char: '灰',
  meta: { theme: '大掃除', cast: '掃地機器人＋貓', gags: ['什麼都吸（失控）', '連貓都吸進去', '灰撲撲的貓抖出灰塵', '機器人打噴嚏'] },
  duration: 10,
  bg: { top: '#EEE8FF', bottom: '#F7F3FF', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'dust1', emoji: '🌫️', x: 50, y: 71, size: 13, tint: 'brightness(.7)' },
    { id: 'dust2', emoji: '🌫️', x: 70, y: 71, size: 13, tint: 'brightness(.7)' },
    { id: 'sock', emoji: '🧦', x: 84, y: 72, size: 10 },
    { id: 'cat', emoji: '🐈', x: 130, y: 70, size: 17 },
    { id: 'grayCat', emoji: '🐈', x: 26, y: 70, size: 17, hidden: true, flip: true, tint: 'grayscale(1) brightness(.72)' },
    { id: 'cat2', emoji: '🐈', x: 26, y: 70, size: 17, hidden: true, flip: true },
    { id: 'dustBall', emoji: '🌫️', x: 30, y: 64, size: 13, hidden: true, float: true, tint: 'brightness(.7)' },
    { id: 'robot', emoji: '🤖', x: 20, y: 70, size: 16, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'robot', do: 'pop' },
    { at: 0.3, actor: 'robot', do: 'flash', dur: 0.5 },
    // 吸灰塵
    { at: 1.2, actor: 'dust1', do: 'moveTo', to: { x: 26, y: 70 }, dur: 0.35 },
    { at: 1.45, actor: 'dust1', do: 'vanish', dur: 0.15 },
    { at: 1.6, actor: 'robot', do: 'squash', amount: 0.25, dur: 0.3 },
    // 再吸：灰塵＋襪子
    { at: 2.3, actor: 'robot', do: 'moveTo', to: { x: 54, y: 70 }, dur: 0.5 },
    { at: 2.85, actor: 'dust2', do: 'moveTo', to: { x: 60, y: 70 }, dur: 0.25 },
    { at: 3.0, actor: 'dust2', do: 'vanish', dur: 0.15 },
    { at: 2.95, actor: 'sock', do: 'moveTo', to: { x: 60, y: 70 }, dur: 0.3 },
    { at: 3.2, actor: 'sock', do: 'vanish', dur: 0.15 },
    { at: 3.35, actor: 'robot', do: 'scaleTo', amount: 1.15, dur: 0.25 },
    // 連貓都吸進去
    { at: 3.9, actor: 'robot', do: 'moveTo', to: { x: 100, y: 70 }, dur: 0.5 },
    { at: 4.5, actor: 'cat', do: 'moveTo', to: { x: 112, y: 70 }, dur: 0.4 },
    { at: 4.7, actor: 'cat', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 4.95, actor: 'cat', do: 'moveTo', to: { x: 102, y: 70 }, dur: 0.12 },
    { at: 5.0, actor: 'cat', do: 'vanish', dur: 0.12 },
    { at: 5.1, actor: 'robot', do: 'scaleTo', amount: 1.3, dur: 0.2 },
    // 脹到爆開
    { at: 5.3, actor: 'robot', do: 'shake', amount: 2, dur: 0.6 },
    { at: 5.3, actor: 'robot', do: 'flash', dur: 0.6 },
    { at: 5.9, actor: 'robot', do: 'moveTo', to: { x: 142, y: 70 }, arc: 15, dur: 0.5 },
    { at: 5.9, actor: 'robot', do: 'spin', times: 2, dur: 0.5 },
    { at: 5.9, actor: 'robot', do: 'scaleTo', amount: 0.67, dur: 0.3 },
    { at: 5.95, actor: 'grayCat', do: 'enter', from: { x: 100, y: 58 }, arc: 20, dur: 0.6 },
    { at: 6.55, actor: 'grayCat', do: 'squash', amount: 0.3, dur: 0.3 },
    // 用力一抖：抖出一大團灰塵
    { at: 7.4, actor: 'grayCat', do: 'shake', amount: 2, dur: 0.5 },
    { at: 7.8, actor: 'grayCat', do: 'vanish', dur: 0.1 },
    { at: 7.8, actor: 'cat2', do: 'pop', dur: 0.15 },
    { at: 7.8, actor: 'dustBall', do: 'pop', dur: 0.3 },
    // 灰塵飄到機器人面前——哈啾！
    { at: 8.4, actor: 'dustBall', do: 'moveTo', to: { x: 140, y: 64 }, dur: 0.8 },
    { at: 9.2, actor: 'dustBall', do: 'vanish', dur: 0.1 },
    { at: 9.0, actor: 'robot', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 9.25, actor: 'robot', do: 'hop', amount: 8, dur: 0.45 },
    { at: 9.25, actor: 'robot', do: 'spin', times: 2, dur: 0.45 },
  ],
  builds: [
    // 爆開的灰塵 → 厂；機器人冒出的火花 → 火
    { at: 5.9, dur: 0.5, strokes: [0, 1], from: 'robot', color: '#7D7F8C' },
    { at: 6.2, dur: 0.8, strokes: [2, 3, 4, 5], from: 'robot', color: '#FF7A2F' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'cat', dur: 4.2 },
    { at: 0.5, kind: 'bubble', actor: 'robot', emoji: '🧹', dur: 0.7 },
    { at: 1.15, kind: 'line', actor: 'robot', target: 'dust1', color: '#C9CCF5', width: 2, dur: 0.4 },
    { at: 2.8, kind: 'line', actor: 'robot', target: 'sock', color: '#C9CCF5', width: 2, dur: 0.45 },
    { at: 3.5, kind: 'pop', actor: 'robot', emoji: '😋', dur: 0.6 },
    { at: 4.45, kind: 'line', actor: 'robot', target: 'cat', color: '#C9CCF5', width: 2.5, dur: 0.6 },
    { at: 4.55, kind: 'pop', actor: 'cat', emoji: '😱', dur: 0.5 },
    { at: 5.9, kind: 'burst', actor: 'robot', emoji: '🌫️', n: 8, dur: 0.6 },
    { at: 6.2, kind: 'burst', actor: 'robot', emoji: '⚡', n: 5, dur: 0.5 },
    { at: 6.6, kind: 'dizzy', actor: 'grayCat', dur: 0.9 },
    { at: 7.6, kind: 'burst', actor: 'grayCat', emoji: '💨', n: 6, dur: 0.5 },
    { at: 9.25, kind: 'burst', actor: 'robot', emoji: '💦', n: 6, dur: 0.5 },
    { at: 9.3, kind: 'pop', actor: 'cat2', emoji: '😹', dur: 0.7 },
  ],
  camera: [
    { at: 5.3, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 100, y: 62 } },
    { at: 5.9, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.2, sfx: 'whoosh' },
    { at: 1.6, say: '灰' },
    { at: 2.85, sfx: 'whoosh' },
    { at: 3.3, sfx: 'gulp' },
    { at: 4.5, sfx: 'whoosh' },
    { at: 5.05, sfx: 'gulp' },
    { at: 5.9, sfx: 'crack' },
    { at: 5.95, sfx: 'poof' },
    { at: 7.05, say: '灰' },
    { at: 7.6, sfx: 'poof' },
    { at: 8.0, say: '灰塵' },
    { at: 9.25, sfx: 'achoo' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
