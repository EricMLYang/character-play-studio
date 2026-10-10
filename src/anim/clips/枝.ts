import type { Clip } from '../clip'

// 枝：外星人的火箭壞了，天上掉下一根會發光的魔法樹枝。牠一揮想修火箭，火箭變成香蕉；再揮，香蕉變成一頭牛飄走了；
// 用力一甩，樹枝爆炸變成「枝」。小樹又給牠一根樹枝，這次牠點自己——自己變成火箭飛回家，噴出的火花把小樹變成雞。枝、枝、樹枝
const clip: Clip = {
  char: '枝',
  meta: { theme: '太空魔法', cast: '外星人＋魔法樹枝＋火箭＋牛', gags: ['魔法變錯東西', '越變越離譜', '用力過猛爆炸', '把自己變成火箭', '小樹變成雞'] },
  duration: 10,
  bg: { top: '#1B1240', bottom: '#3B2A78', floor: '#8C86A8', scenery: 'space' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 16, y: 70.7, size: 15, hidden: true },
    { id: 'rocket', emoji: '🚀', x: 132, y: 68.5, size: 17.5 },
    { id: 'alien', emoji: '👽', x: 28, y: 70.2, size: 16.2, hidden: true },
    { id: 'twig', emoji: '🌿', x: 38, y: 64, size: 8.8, float: true, hidden: true },
    { id: 'twig2', emoji: '🌿', x: 38, y: 64, size: 8.8, float: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'pop' },
    // 天上飄下魔法樹枝
    { at: 0.8, actor: 'twig', do: 'enter', from: { x: 38, y: 18 }, dur: 0.5 },
    { at: 1.31, actor: 'twig', do: 'flash', dur: 0.6 },
    { at: 1.31, actor: 'alien', do: 'hop', amount: 4, dur: 0.3 },
    // 第一揮：火箭變香蕉
    { at: 1.97, actor: 'twig', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 2.24, actor: 'rocket', do: 'swap', emoji: '🍌' },
    { at: 2.24, actor: 'rocket', do: 'squash', amount: 0.3, dur: 0.3 },
    // 第二揮：香蕉變牛，飄走
    { at: 3.06, actor: 'twig', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 3.33, actor: 'rocket', do: 'swap', emoji: '🐄' },
    { at: 3.39, actor: 'rocket', do: 'moveTo', to: { x: 136, y: 50 }, dur: 1.4 },
    { at: 3.39, actor: 'rocket', do: 'rotateTo', amount: 20, dur: 1.4 },
    // 氣到用力甩：樹枝爆炸
    { at: 4.15, actor: 'twig', do: 'shake', amount: 2.5, dur: 0.5 },
    { at: 4.15, actor: 'twig', do: 'flash', dur: 0.5 },
    { at: 4.15, actor: 'alien', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.75, actor: 'twig', do: 'vanish', dur: 0.15 },
    { at: 4.8, actor: 'alien', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 5.25, actor: 'rocket', do: 'vanish', dur: 0.2 },
    // 小樹再給一根樹枝
    { at: 6.6, actor: 'tree', do: 'pop' },
    { at: 6.9, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 6.9, actor: 'twig2', do: 'enter', from: { x: 12, y: 62 }, dur: 0.4, arc: 6 },
    { at: 7.3, actor: 'twig2', do: 'flash', dur: 0.6 },
    // 點自己：變成火箭飛回家
    { at: 7.75, actor: 'twig2', do: 'tilt', amount: -40, dur: 0.3 },
    { at: 7.93, actor: 'alien', do: 'swap', emoji: '🚀' },
    { at: 7.97, actor: 'twig2', do: 'moveTo', to: { x: 40, y: 74.5 }, dur: 0.3 },
    { at: 7.97, actor: 'twig2', do: 'rotateTo', amount: 80, dur: 0.3 },
    { at: 8.2, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.56, actor: 'alien', do: 'moveTo', to: { x: 62, y: -25 }, dur: 0.6 },
    // 火花打到小樹：變成雞
    { at: 9.14, actor: 'tree', do: 'swap', emoji: '🐔' },
    { at: 9.14, actor: 'tree', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 爆炸的樹枝 → 木；被打中的牛 → 支
    { at: 4.7, dur: 0.7, strokes: [0, 1, 2, 3], from: 'twig', color: '#5BBF4A' },
    { at: 5.2, dur: 0.7, strokes: [4, 5, 6, 7], from: 'rocket', color: '#FF8FD0' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'rocket', emoji: '💨', dur: 1.9 },
    { at: 0.3, kind: 'bubble', actor: 'alien', emoji: '😢', dur: 0.6 },
    { at: 1.31, kind: 'burst', actor: 'twig', emoji: '✨', n: 6, dur: 0.5 },
    { at: 2.08, kind: 'zap', actor: 'twig', target: 'rocket', dur: 0.25 },
    { at: 2.24, kind: 'burst', actor: 'rocket', emoji: '💨', n: 6, dur: 0.4 },
    { at: 2.51, kind: 'pop', actor: 'alien', emoji: '😳', dur: 0.5 },
    { at: 3.17, kind: 'zap', actor: 'twig', target: 'rocket', dur: 0.25 },
    { at: 3.33, kind: 'burst', actor: 'rocket', emoji: '💨', n: 6, dur: 0.4 },
    { at: 3.61, kind: 'pop', actor: 'alien', emoji: '😱', dur: 0.5 },
    { at: 3.83, kind: 'zzz', actor: 'rocket', emoji: '🎵', dur: 1.2 },
    { at: 4.59, kind: 'zap', actor: 'twig', target: 'rocket', dur: 0.3 },
    { at: 4.7, kind: 'burst', actor: 'twig', dur: 0.4 },
    { at: 4.9, kind: 'dizzy', actor: 'alien', dur: 1.0 },
    { at: 5.2, kind: 'burst', actor: 'rocket', emoji: '💨', n: 6, dur: 0.4 },
    { at: 6.6, kind: 'burst', actor: 'tree', emoji: '✨', n: 5, dur: 0.4, dx: 10 },
    { at: 7.3, kind: 'burst', actor: 'twig2', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.48, kind: 'pop', actor: 'alien', emoji: '💡', dur: 0.4 },
    { at: 7.84, kind: 'zap', actor: 'twig2', target: 'alien', dur: 0.2 },
    { at: 7.93, kind: 'burst', actor: 'alien', emoji: '💨', n: 6, dur: 0.4 },
    { at: 8.56, kind: 'puff', actor: 'alien' },
    { at: 8.96, kind: 'zap', actor: 'twig2', target: 'tree', dur: 0.2 },
    { at: 9.14, kind: 'burst', actor: 'tree', emoji: '💨', n: 5, dur: 0.4, dx: 10 },
    { at: 9.28, kind: 'pop', actor: 'tree', emoji: '❓', dur: 0.7 },
  ],
  camera: [
    { at: 4.7, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 36, y: 62 } },
    { at: 8.56, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.31, sfx: 'blip' },
    { at: 1.47, say: '枝' },
    { at: 2.08, sfx: 'laser' },
    { at: 2.24, sfx: 'poof' },
    { at: 3.17, sfx: 'laser' },
    { at: 3.33, sfx: 'poof' },
    { at: 4.7, sfx: 'crack' },
    { at: 5.95, say: '枝' },
    { at: 6.6, sfx: 'poof' },
    { at: 7.3, say: '樹枝' },
    { at: 7.93, sfx: 'poof' },
    { at: 8.56, sfx: 'whoosh' },
    { at: 9.14, sfx: 'poof' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
