import type { Clip } from '../clip'

// 象：森林裡的樹著火了，大象消防員用鼻子吸水來噴。第一次只滴出一點點，第二次噴太高、全淋回自己身上，第三次把整桶水吸光、
// 脹成大氣球，一噴就滅火，水花變成「象」。最後屋頂又冒出一小撮火，大象深吸一口氣準備大噴——小狗「呼」一聲就吹熄了。象、象、大象
const clip: Clip = {
  char: '象',
  meta: { theme: '消防救援', cast: '大象＋小狗＋著火的樹', gags: ['水太少', '噴太高淋到自己', '吸到脹成氣球', '小狗一吹就熄'] },
  duration: 10,
  bg: { top: '#FFE0C2', bottom: '#FFF2DE', floor: '#7FB069', scenery: 'forest' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 132, y: 66, size: 26 },
    { id: 'fire1', emoji: '🔥', x: 128, y: 52, size: 10, hidden: true, float: true },
    { id: 'fire2', emoji: '🔥', x: 140, y: 58, size: 8, hidden: true, float: true },
    { id: 'fire3', emoji: '🔥', x: 134, y: 47, size: 6, hidden: true, float: true },
    { id: 'bucket', emoji: '🪣', x: 52, y: 73.6, size: 8 },
    { id: 'ele', emoji: '🐘', x: 34, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'dog', emoji: '🐕', x: 152, y: 72.8, size: 10, hidden: true },
  ],
  moves: [
    { at: 0.1, actor: 'fire1', do: 'pop' },
    { at: 0.25, actor: 'fire2', do: 'pop' },
    { at: 0.4, actor: 'fire1', do: 'bounce', dur: 4.6, times: 9, amount: 1.2 },
    { at: 0.5, actor: 'fire2', do: 'bounce', dur: 4.6, times: 8, amount: 1 },
    { at: 0.3, actor: 'dog', do: 'enter', from: { x: 180, y: 72.8 }, dur: 0.5 },
    { at: 0.8, actor: 'dog', do: 'bounce', dur: 0.6, times: 3, amount: 2 },
    { at: 0.4, actor: 'ele', do: 'enter', from: { x: -15, y: 68.6 }, dur: 0.7 },
    // 第一次：吸水、噴——只滴出一點點
    { at: 1.1, actor: 'ele', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 1.5, actor: 'ele', do: 'squash', amount: -0.25, dur: 0.4 },
    // 第二次：整桶喝光，噴太高
    { at: 2.6, actor: 'ele', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 2.7, actor: 'bucket', do: 'shake', dur: 0.4, amount: 1 },
    { at: 2.8, actor: 'ele', do: 'scaleTo', amount: 1.3, dur: 0.5 },
    { at: 3.4, actor: 'ele', do: 'tilt', amount: -35, dur: 0.6 },
    { at: 3.9, actor: 'ele', do: 'shake', dur: 0.6, amount: 1 },
    // 第三次：深吸一口氣，脹成大氣球
    { at: 4.6, actor: 'ele', do: 'scaleTo', amount: 1.25, dur: 0.4 },
    { at: 4.6, actor: 'ele', do: 'flash', dur: 0.5 },
    { at: 5.1, actor: 'ele', do: 'moveTo', to: { x: 28, y: 68.6 }, dur: 0.3 },
    { at: 5.1, actor: 'ele', do: 'shake', dur: 0.8, amount: 1 },
    { at: 5.5, actor: 'fire1', do: 'vanish', dur: 0.2 },
    { at: 5.7, actor: 'fire2', do: 'vanish', dur: 0.2 },
    { at: 6.2, actor: 'ele', do: 'scaleTo', amount: 0.615, dur: 0.4 },
    // 大象！
    { at: 7.4, actor: 'ele', do: 'hop', dur: 0.4, amount: 6 },
    { at: 7.4, actor: 'ele', do: 'flash', dur: 0.5 },
    { at: 7.5, actor: 'dog', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    // 回馬槍：小火苗，大象準備大噴，小狗一吹就熄
    { at: 8.3, actor: 'fire3', do: 'pop' },
    { at: 8.5, actor: 'ele', do: 'squash', amount: -0.3, dur: 0.5 },
    { at: 8.5, actor: 'ele', do: 'scaleTo', amount: 1.3, dur: 0.5 },
    { at: 8.7, actor: 'dog', do: 'hop', dur: 0.3, amount: 4 },
    { at: 8.9, actor: 'fire3', do: 'vanish', dur: 0.2 },
    { at: 9.1, actor: 'ele', do: 'scaleTo', amount: 0.77, dur: 0.3 },
    { at: 9.1, actor: 'ele', do: 'squash', amount: 0.3, dur: 0.3 },
  ],
  builds: [
    // 滅火的水花 → 上半；噴完水的大象 → 下半
    { at: 5.6, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: { x: 130, y: 50 }, color: '#2E86DE' },
    { at: 6.0, dur: 0.7, strokes: [5, 6, 7, 8, 9, 10], from: 'ele', color: '#7A5CC9' },
  ],
  glyph: [{ at: 6.75, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.6, dx: -8 },
    { at: 1.5, kind: 'pop', actor: 'ele', emoji: '💪', dur: 0.5 },
    { at: 1.9, kind: 'line', actor: 'ele', dx: 9, dy: -2, to: { x: 60, y: 74 }, color: '#4FB3FF', width: 1, dur: 0.6 },
    { at: 2.2, kind: 'pop', actor: 'dog', emoji: '😑', dur: 0.5, dx: -8 },
    { at: 3.5, kind: 'line', actor: 'ele', dx: 9, dy: -6, to: { x: 66, y: 2 }, color: '#4FB3FF', width: 2, dur: 0.5 },
    { at: 3.9, kind: 'rain', actor: 'ele', n: 8, dur: 0.9 },
    { at: 4.2, kind: 'sweat', actor: 'ele' },
    { at: 4.3, kind: 'pop', actor: 'dog', emoji: '😆', dur: 0.5, dx: -8 },
    { at: 5.1, kind: 'line', actor: 'ele', dx: 12, dy: -2, target: 'fire1', color: '#2E86DE', width: 3.5, dur: 0.9 },
    { at: 5.5, kind: 'burst', x: 130, y: 52, emoji: '💨', n: 6, dur: 0.6 },
    { at: 5.6, kind: 'burst', x: 132, y: 60, emoji: '💧', n: 6, dur: 0.6 },
    { at: 7.5, kind: 'burst', actor: 'ele', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.4, kind: 'pop', actor: 'ele', emoji: '😤', dur: 0.4 },
    { at: 8.8, kind: 'burst', x: 134, y: 47, emoji: '💨', dur: 0.4 },
    { at: 9.2, kind: 'bubble', actor: 'ele', emoji: '😑', dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'dog', emoji: '😎', dur: 0.6, dx: -10 },
  ],
  camera: [
    { at: 4.6, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 40, y: 58 } },
    { at: 5.1, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.2, sfx: 'rumble' },
    { at: 1.1, sfx: 'gulp' },
    { at: 1.5, say: '象' },
    { at: 1.9, sfx: 'plop' },
    { at: 2.8, sfx: 'gulp' },
    { at: 3.5, sfx: 'whoosh' },
    { at: 3.9, sfx: 'splash' },
    { at: 5.1, sfx: 'splash' },
    { at: 5.5, sfx: 'poof' },
    { at: 6.75, say: '象' },
    { at: 7.75, say: '大象' },
    { at: 8.5, sfx: 'gulp' },
    { at: 8.8, sfx: 'whoosh' },
    { at: 9.1, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
