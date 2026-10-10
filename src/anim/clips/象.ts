import type { Clip } from '../clip'

// 象：森林裡的樹著火了，大象消防員用鼻子吸一桶水來噴——噴太高，全淋回自己身上。
// 這次深吸一口氣，脹成大氣球，一噴就滅火，水花變成「象」。最後樹上又冒出一小撮火，小狗「呼」一聲就吹熄了。象、象、大象
const clip: Clip = {
  char: '象',
  meta: { theme: '消防救援', cast: '大象＋小狗＋著火的樹', gags: ['噴太高淋到自己', '吸到脹成氣球', '小狗一吹就熄'] },
  duration: 10,
  bg: { top: '#FFD9B8', bottom: '#FFF2DE', floor: '#7FB069', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 134, y: 62, size: 30 },
    { id: 'fire1', emoji: '🔥', x: 128, y: 48, size: 12, hidden: true, float: true },
    { id: 'fire2', emoji: '🔥', x: 141, y: 54, size: 10, hidden: true, float: true },
    { id: 'fire3', emoji: '🔥', x: 136, y: 44, size: 7, hidden: true, float: true },
    { id: 'bucket', emoji: '🪣', x: 54, y: 72, size: 10 },
    { id: 'ele', emoji: '🐘', x: 32, y: 67, size: 24, hidden: true, flip: true },
    { id: 'dog', emoji: '🐕', x: 154, y: 71, size: 13, hidden: true },
  ],
  moves: [
    { at: 0.1, actor: 'fire1', do: 'pop' },
    { at: 0.25, actor: 'fire2', do: 'pop' },
    { at: 0.4, actor: 'fire1', do: 'bounce', dur: 5.4, times: 10, amount: 1.2 },
    { at: 0.5, actor: 'fire2', do: 'bounce', dur: 5.4, times: 9, amount: 1 },
    { at: 0.3, actor: 'dog', do: 'enter', from: { x: 180, y: 71 }, dur: 0.5 },
    { at: 0.4, actor: 'ele', do: 'enter', from: { x: -18, y: 67 }, dur: 0.8 },
    { at: 1.3, actor: 'ele', do: 'hop', amount: 4, dur: 0.35 },
    // 整桶喝光——噴太高
    { at: 1.9, actor: 'ele', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 2.0, actor: 'bucket', do: 'shake', dur: 0.4, amount: 1 },
    { at: 2.5, actor: 'bucket', do: 'moveTo', to: { x: 6, y: 72 }, dur: 0.4, arc: 10 },
    { at: 2.1, actor: 'ele', do: 'scaleTo', amount: 1.15, dur: 0.4 },
    { at: 2.7, actor: 'ele', do: 'tilt', amount: -35, dur: 0.6 },
    { at: 3.3, actor: 'ele', do: 'shake', dur: 0.8, amount: 1 },
    { at: 3.3, actor: 'ele', do: 'scaleTo', amount: 0.87, dur: 0.3 },
    // 深吸一口氣，脹成大氣球
    { at: 4.7, actor: 'ele', do: 'scaleTo', amount: 1.45, dur: 0.6 },
    { at: 4.7, actor: 'ele', do: 'flash', dur: 0.6 },
    { at: 5.6, actor: 'ele', do: 'moveTo', to: { x: 26, y: 67 }, dur: 0.3 },
    { at: 5.6, actor: 'ele', do: 'shake', dur: 0.8, amount: 1 },
    { at: 6.0, actor: 'fire1', do: 'vanish', dur: 0.2 },
    { at: 6.15, actor: 'fire2', do: 'vanish', dur: 0.2 },
    { at: 6.5, actor: 'ele', do: 'scaleTo', amount: 0.69, dur: 0.4 },
    // 大象！
    { at: 8.0, actor: 'ele', do: 'hop', dur: 0.4, amount: 6 },
    { at: 8.0, actor: 'ele', do: 'flash', dur: 0.5 },
    // 回馬槍：小火苗，小狗一吹就熄
    { at: 8.6, actor: 'fire3', do: 'pop' },
    { at: 9.0, actor: 'dog', do: 'hop', dur: 0.3, amount: 4 },
    { at: 9.15, actor: 'fire3', do: 'vanish', dur: 0.2 },
  ],
  builds: [
    // 滅火的水花 → 上半；噴完水的大象 → 下半
    { at: 6.1, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: { x: 130, y: 48 }, color: '#2E86DE' },
    { at: 6.5, dur: 0.7, strokes: [5, 6, 7, 8, 9, 10], from: 'ele', color: '#7A5CC9' },
  ],
  glyph: [{ at: 7.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.7, dx: -8 },
    { at: 2.8, kind: 'line', actor: 'ele', dx: 9, dy: -6, to: { x: 66, y: 2 }, color: '#4FB3FF', width: 2, dur: 0.5 },
    { at: 3.3, kind: 'rain', actor: 'ele', n: 8, dur: 1.0 },
    { at: 4.0, kind: 'sweat', actor: 'ele' },
    { at: 3.8, kind: 'pop', actor: 'dog', emoji: '😆', dur: 0.7, dx: -8 },
    { at: 5.6, kind: 'line', actor: 'ele', dx: 14, dy: -2, target: 'fire1', color: '#2E86DE', width: 3.5, dur: 0.9 },
    { at: 6.0, kind: 'burst', x: 130, y: 48, emoji: '💨', n: 6, dur: 0.6 },
    { at: 6.1, kind: 'burst', x: 134, y: 56, emoji: '💧', n: 6, dur: 0.6 },
    { at: 8.0, kind: 'burst', actor: 'ele', emoji: '✨', n: 6, dur: 0.6 },
    { at: 9.1, kind: 'burst', x: 136, y: 44, emoji: '💨', dur: 0.4 },
    { at: 9.3, kind: 'bubble', actor: 'ele', emoji: '😑', dur: 0.7 },
  ],
  camera: [
    { at: 4.7, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 40, y: 56 } },
    { at: 5.6, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.2, sfx: 'rumble' },
    { at: 1.35, say: '象' },
    { at: 2.0, sfx: 'gulp' },
    { at: 2.8, sfx: 'whoosh' },
    { at: 3.3, sfx: 'splash' },
    { at: 4.7, sfx: 'gulp' },
    { at: 5.6, sfx: 'splash' },
    { at: 6.0, sfx: 'poof' },
    { at: 7.3, say: '象' },
    { at: 8.3, say: '大象' },
    { at: 9.05, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
