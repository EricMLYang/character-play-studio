import type { Clip } from '../clip'

// 湖：北極熊在結冰的湖上釣魚，第一竿釣到靴子，第二竿釣到輪胎，第三竿終於有大魚——大魚一拉，北極熊整隻被拖進冰洞！
// 靴子和輪胎變成「湖」。大魚跳出來坐在湖邊，換牠拿釣竿，一甩就把濕答答的北極熊釣上來。湖、湖、湖邊
const clip: Clip = {
  char: '湖',
  meta: { theme: '冰湖釣魚', cast: '北極熊＋大魚', gags: ['釣到垃圾漸強', '被魚拖下水', '角色互換：魚釣熊', '凍成冰棒'] },
  duration: 10,
  bg: { top: '#E3F1FF', bottom: '#BBD9F5', floor: '#F2F8FF', scenery: 'snow' },
  actors: [
    { id: 'hole', emoji: '🕳️', x: 42, y: 74.5, size: 8, float: true, hidden: true },
    { id: 'boot', emoji: '👢', x: 42, y: 72, size: 8, hidden: true },
    { id: 'tire', emoji: '🛞', x: 42, y: 72, size: 9, hidden: true },
    { id: 'fish', emoji: '🐟', x: 32, y: 72, size: 12, hidden: true, flip: true },
    { id: 'bear', emoji: '🐻‍❄️', x: 24, y: 70.3, size: 16, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'pop' },
    { at: 0.1, actor: 'hole', do: 'pop' },
    // 第一竿：靴子
    { at: 1.0, actor: 'bear', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 1.0, actor: 'bear', do: 'tilt', amount: -12, dur: 0.3 },
    { at: 1.1, actor: 'boot', do: 'pop', dur: 0.1 },
    { at: 1.1, actor: 'boot', do: 'moveTo', to: { x: 7, y: 73 }, dur: 0.5, arc: 18 },
    { at: 1.1, actor: 'boot', do: 'spin', dur: 0.5 },
    // 第二竿：輪胎，疊在靴子上
    { at: 2.4, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 2.4, actor: 'bear', do: 'tilt', amount: -15, dur: 0.3 },
    { at: 2.5, actor: 'tire', do: 'pop', dur: 0.1 },
    { at: 2.5, actor: 'tire', do: 'moveTo', to: { x: 7, y: 66 }, dur: 0.5, arc: 18 },
    { at: 2.5, actor: 'tire', do: 'spin', dur: 0.5 },
    { at: 3.0, actor: 'boot', do: 'squash', amount: 0.3, dur: 0.25 },
    // 第三竿：大魚！被拖進冰洞
    { at: 3.3, actor: 'hole', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 3.5, actor: 'bear', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 3.75, actor: 'bear', do: 'moveTo', to: { x: 35, y: 70.3 }, dur: 0.25 },
    { at: 3.75, actor: 'bear', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: 4.1, actor: 'bear', do: 'moveTo', to: { x: 42, y: 80 }, dur: 0.2 },
    { at: 4.15, actor: 'bear', do: 'vanish', dur: 0.2 },
    // 垃圾堆跳起來變成字
    { at: 4.8, actor: 'boot', do: 'vanish', dur: 0.2 },
    { at: 5.3, actor: 'tire', do: 'vanish', dur: 0.2 },
    // 大魚跳出來，坐在湖邊釣魚
    { at: 6.3, actor: 'fish', do: 'enter', from: { x: 42, y: 78 }, dur: 0.5, arc: 14 },
    { at: 6.8, actor: 'fish', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 7.6, actor: 'fish', do: 'tilt', amount: -20, dur: 0.3 },
    // 換魚把熊釣上來
    { at: 7.6, actor: 'bear', do: 'moveTo', to: { x: 14, y: 70.3 }, dur: 0.01 },
    { at: 7.65, actor: 'bear', do: 'enter', from: { x: 42, y: 78 }, dur: 0.6, arc: 22 },
    { at: 7.65, actor: 'bear', do: 'spin', dur: 0.6 },
    { at: 8.25, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 8.9, actor: 'bear', do: 'shake', amount: 1, dur: 0.6 },
  ],
  builds: [
    // 濺起的冰水 → 氵；靴子 → 古；輪胎 → 月
    { at: 4.35, dur: 0.5, strokes: [0, 1, 2], from: 'hole', color: '#3B9BE0' },
    { at: 4.8, dur: 0.7, strokes: [3, 4, 5, 6, 7], from: 'boot', color: '#7A5AC8' },
    { at: 5.3, dur: 0.6, strokes: [8, 9, 10, 11], from: 'tire', color: '#E0567A' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'line', actor: 'bear', target: 'hole', dx: 6, dy: -4, color: '#ffffff', width: 0.45, dur: 3.85 },
    { at: 0.4, kind: 'bubble', actor: 'bear', emoji: '🐟', dur: 0.6 },
    { at: 1.8, kind: 'bubble', actor: 'bear', emoji: '😑', dur: 0.5 },
    { at: 3.1, kind: 'sweat', actor: 'bear' },
    { at: 3.3, kind: 'pop', actor: 'bear', emoji: '🤩', dur: 0.4 },
    { at: 3.75, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.4 },
    { at: 4.2, kind: 'fountain', actor: 'hole', emoji: '💧', n: 8, dur: 0.8 },
    { at: 6.8, kind: 'line', actor: 'fish', target: 'hole', dx: 4, dy: -3, color: '#ffffff', width: 0.45, dur: 0.85 },
    { at: 7.0, kind: 'pop', actor: 'fish', emoji: '😎', dur: 0.6 },
    { at: 8.25, kind: 'puff', actor: 'bear' },
    { at: 8.3, kind: 'rain', actor: 'bear', emoji: '💧', n: 5, dur: 0.8, dy: 6 },
    { at: 8.4, kind: 'bubble', actor: 'fish', emoji: '😆', dur: 0.8 },
    { at: 9.0, kind: 'pop', actor: 'bear', emoji: '🥶', dur: 0.8 },
  ],
  camera: [
    { at: 3.75, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 36, y: 66 } },
    { at: 4.2, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.4, say: '湖' },
    { at: 1.6, sfx: 'plop' },
    { at: 2.5, sfx: 'whoosh' },
    { at: 3.0, sfx: 'boing' },
    { at: 3.75, sfx: 'slide' },
    { at: 4.2, sfx: 'splash' },
    { at: 6.0, say: '湖' },
    { at: 6.3, sfx: 'splash' },
    { at: 7.0, say: '湖邊' },
    { at: 7.65, sfx: 'whoosh' },
    { at: 8.25, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
