import type { Clip } from '../clip'

// 秒：熊把玉米丟進微波爐，倒數 3、2、1、0……什麼都沒發生？牠湊過去偷看——「碰！」爆米花大爆炸，把牠轟回原位。
// 這次牠拿碼錶盯著秒針，只設一秒鐘：一秒後，微波爐吐出一顆比熊還大的超級爆米花。秒、秒、秒針
const clip: Clip = {
  char: '秒',
  meta: { theme: '微波爐爆米花', cast: '熊＋微波爐＋爆米花', gags: ['倒數到零沒反應', '湊過去偷看就爆炸', '一秒變出超大爆米花'] },
  duration: 10,
  bg: { top: '#E8FFF7', bottom: '#C6F2E4', floor: '#C58B5C', scenery: 'room' },
  actors: [
    { id: 'oven', emoji: '📺', x: 132, y: 69.4, size: 18, hidden: true, tint: 'grayscale(.75) brightness(1.1)' },
    { id: 'num', emoji: '3️⃣', x: 132, y: 53, size: 8, hidden: true, float: true },
    { id: 'big', emoji: '🍿', x: 132, y: 66, size: 12, hidden: true },
    { id: 'corn', emoji: '🌽', x: 36, y: 64, size: 7, hidden: true, float: true },
    { id: 'bear', emoji: '🐻', x: 28, y: 70.3, size: 16, hidden: true },
    { id: 'watch', emoji: '⏱️', x: 42, y: 60, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'pop' },
    { at: 0.1, actor: 'oven', do: 'pop' },
    // 玉米丟進去
    { at: 0.8, actor: 'corn', do: 'pop', dur: 0.15 },
    { at: 0.9, actor: 'corn', do: 'moveTo', to: { x: 130, y: 66 }, arc: 15, dur: 0.5 },
    { at: 1.4, actor: 'corn', do: 'vanish', dur: 0.1 },
    { at: 1.4, actor: 'oven', do: 'flash', dur: 0.5 },
    // 倒數
    { at: 1.5, actor: 'num', do: 'pop' },
    { at: 2.2, actor: 'num', do: 'swap', emoji: '2️⃣' },
    { at: 2.2, actor: 'num', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 2.2, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 2.9, actor: 'num', do: 'swap', emoji: '1️⃣' },
    { at: 2.9, actor: 'num', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 3.6, actor: 'num', do: 'swap', emoji: '0️⃣' },
    { at: 3.6, actor: 'num', do: 'squash', amount: 0.25, dur: 0.25 },
    // 沒反應？湊過去偷看
    { at: 4.1, actor: 'bear', do: 'moveTo', to: { x: 108, y: 70.3 }, dur: 0.4 },
    { at: 4.55, actor: 'bear', do: 'tilt', amount: 15, dur: 0.4 },
    // 碰！
    { at: 4.9, actor: 'oven', do: 'hop', amount: 6, dur: 0.3 },
    { at: 4.9, actor: 'oven', do: 'shake', amount: 2, dur: 0.6 },
    { at: 4.9, actor: 'num', do: 'vanish', dur: 0.2 },
    { at: 4.9, actor: 'bear', do: 'moveTo', to: { x: 28, y: 70.3 }, arc: 20, dur: 0.6 },
    { at: 4.9, actor: 'bear', do: 'spin', dur: 0.6 },
    { at: 5.5, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    // 秒針
    { at: 6.9, actor: 'watch', do: 'pop' },
    { at: 7.2, actor: 'watch', do: 'flash', dur: 0.6 },
    { at: 7.2, actor: 'watch', do: 'tilt', amount: 15, dur: 0.5 },
    // 只設一秒
    { at: 8.0, actor: 'watch', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 8.0, actor: 'num', do: 'swap', emoji: '1️⃣' },
    { at: 8.05, actor: 'num', do: 'pop' },
    { at: 8.4, actor: 'oven', do: 'shake', amount: 2.5, dur: 0.5 },
    { at: 8.85, actor: 'num', do: 'vanish', dur: 0.15 },
    { at: 8.9, actor: 'big', do: 'pop', dur: 0.2 },
    { at: 8.9, actor: 'big', do: 'scaleTo', amount: 2.4, dur: 0.35 },
    { at: 9.1, actor: 'bear', do: 'hop', amount: 8, dur: 0.4 },
    { at: 9.1, actor: 'watch', do: 'hop', amount: 8, dur: 0.4 },
  ],
  builds: [
    // 噴出來的爆米花 → 禾；從天上掉下來的爆米花 → 少
    { at: 5.0, dur: 0.7, strokes: [0, 1, 2, 3, 4], from: 'oven', color: '#E9A21F' },
    { at: 5.4, dur: 0.8, strokes: [5, 6, 7, 8], from: { x: 96, y: 20 }, style: 'drop', color: '#E8613A' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'bear', emoji: '🍿', dur: 0.6 },
    { at: 2.9, kind: 'pop', actor: 'bear', emoji: '🤤', dur: 0.5 },
    { at: 3.8, kind: 'pop', actor: 'bear', emoji: '❓', dur: 0.4 },
    { at: 4.9, kind: 'burst', actor: 'oven' },
    { at: 4.95, kind: 'fountain', actor: 'oven', emoji: '🍿', n: 10, dur: 1.1 },
    { at: 5.5, kind: 'puff', actor: 'bear' },
    { at: 5.55, kind: 'rain', actor: 'bear', emoji: '🍿', n: 6, dur: 0.9 },
    { at: 5.6, kind: 'dizzy', actor: 'bear', dur: 0.9 },
    { at: 7.4, kind: 'bubble', actor: 'bear', emoji: '🧐', dur: 0.6 },
    { at: 8.9, kind: 'burst', actor: 'oven', emoji: '🍿', n: 7, dur: 0.5 },
    { at: 9.15, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.8 },
  ],
  camera: [
    { at: 4.55, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 118, y: 62 } },
    { at: 4.9, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.9, sfx: 'whoosh' },
    { at: 1.5, sfx: 'blip' },
    { at: 1.6, say: '秒' },
    { at: 2.2, sfx: 'blip' },
    { at: 2.9, sfx: 'blip' },
    { at: 3.6, sfx: 'blip' },
    { at: 4.9, sfx: 'crack' },
    { at: 5.0, sfx: 'poof' },
    { at: 5.5, sfx: 'plop' },
    { at: 6.25, say: '秒' },
    { at: 7.25, say: '秒針' },
    { at: 8.05, sfx: 'blip' },
    { at: 8.9, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
