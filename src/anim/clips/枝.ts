import type { Clip } from '../clip'

// 枝：外星人的火箭壞了，天上掉下一根會發光的魔法樹枝。牠一揮想修火箭，火箭變成香蕉；再揮，香蕉變成一頭牛飄走了；
// 用力一甩，樹枝爆炸變成「枝」。小樹又給牠一根樹枝，這次牠點自己——自己變成火箭飛回家，噴出的火花把小樹變成雞。枝、枝、樹枝
const clip: Clip = {
  char: '枝',
  meta: { theme: '太空魔法', cast: '外星人＋魔法樹枝＋火箭＋牛', gags: ['魔法變錯東西', '越變越離譜', '用力過猛爆炸', '把自己變成火箭', '小樹變成雞'] },
  duration: 10,
  bg: { top: '#1B1240', bottom: '#3B2A78', floor: '#8C86A8', scenery: 'space' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 10, y: 72, size: 12, hidden: true },
    { id: 'rocket', emoji: '🚀', x: 132, y: 70, size: 14 },
    { id: 'alien', emoji: '👽', x: 28, y: 71.5, size: 13, hidden: true },
    { id: 'twig', emoji: '🌿', x: 38, y: 64, size: 7, float: true, hidden: true },
    { id: 'twig2', emoji: '🌿', x: 38, y: 64, size: 7, float: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'pop' },
    // 天上飄下魔法樹枝
    { at: 0.8, actor: 'twig', do: 'enter', from: { x: 38, y: 18 }, dur: 0.5 },
    { at: 1.3, actor: 'twig', do: 'flash', dur: 0.6 },
    { at: 1.3, actor: 'alien', do: 'hop', amount: 4, dur: 0.3 },
    // 第一揮：火箭變香蕉
    { at: 1.9, actor: 'twig', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 2.15, actor: 'rocket', do: 'swap', emoji: '🍌' },
    { at: 2.15, actor: 'rocket', do: 'squash', amount: 0.3, dur: 0.3 },
    // 第二揮：香蕉變牛，飄走
    { at: 2.9, actor: 'twig', do: 'tilt', amount: 40, dur: 0.3 },
    { at: 3.15, actor: 'rocket', do: 'swap', emoji: '🐄' },
    { at: 3.2, actor: 'rocket', do: 'moveTo', to: { x: 136, y: 50 }, dur: 1.4 },
    { at: 3.2, actor: 'rocket', do: 'rotateTo', amount: 20, dur: 1.4 },
    // 氣到用力甩：樹枝爆炸
    { at: 3.9, actor: 'twig', do: 'shake', amount: 2.5, dur: 0.5 },
    { at: 3.9, actor: 'twig', do: 'flash', dur: 0.5 },
    { at: 3.9, actor: 'alien', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.45, actor: 'twig', do: 'vanish', dur: 0.15 },
    { at: 4.5, actor: 'alien', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.95, actor: 'rocket', do: 'vanish', dur: 0.2 },
    // 小樹再給一根樹枝
    { at: 6.3, actor: 'tree', do: 'pop' },
    { at: 6.6, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 6.6, actor: 'twig2', do: 'enter', from: { x: 12, y: 62 }, dur: 0.4, arc: 6 },
    { at: 7.0, actor: 'twig2', do: 'flash', dur: 0.6 },
    // 點自己：變成火箭飛回家
    { at: 7.5, actor: 'twig2', do: 'tilt', amount: -40, dur: 0.3 },
    { at: 7.7, actor: 'alien', do: 'swap', emoji: '🚀' },
    { at: 7.75, actor: 'twig2', do: 'moveTo', to: { x: 40, y: 74.5 }, dur: 0.3 },
    { at: 7.75, actor: 'twig2', do: 'rotateTo', amount: 80, dur: 0.3 },
    { at: 8.0, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.4, actor: 'alien', do: 'moveTo', to: { x: 62, y: -25 }, dur: 0.6 },
    // 火花打到小樹：變成雞
    { at: 9.05, actor: 'tree', do: 'swap', emoji: '🐔' },
    { at: 9.05, actor: 'tree', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 爆炸的樹枝 → 木；被打中的牛 → 支
    { at: 4.4, dur: 0.7, strokes: [0, 1, 2, 3], from: 'twig', color: '#5BBF4A' },
    { at: 4.9, dur: 0.7, strokes: [4, 5, 6, 7], from: 'rocket', color: '#FF8FD0' },
  ],
  glyph: [{ at: 5.6, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'rocket', emoji: '💨', dur: 1.9 },
    { at: 0.3, kind: 'bubble', actor: 'alien', emoji: '😢', dur: 0.6 },
    { at: 1.3, kind: 'burst', actor: 'twig', emoji: '✨', n: 6, dur: 0.5 },
    { at: 2.0, kind: 'zap', actor: 'twig', target: 'rocket', dur: 0.25 },
    { at: 2.15, kind: 'burst', actor: 'rocket', emoji: '💨', n: 6, dur: 0.4 },
    { at: 2.4, kind: 'pop', actor: 'alien', emoji: '😳', dur: 0.5 },
    { at: 3.0, kind: 'zap', actor: 'twig', target: 'rocket', dur: 0.25 },
    { at: 3.15, kind: 'burst', actor: 'rocket', emoji: '💨', n: 6, dur: 0.4 },
    { at: 3.4, kind: 'pop', actor: 'alien', emoji: '😱', dur: 0.5 },
    { at: 3.6, kind: 'zzz', actor: 'rocket', emoji: '🎵', dur: 1.2 },
    { at: 4.3, kind: 'zap', actor: 'twig', target: 'rocket', dur: 0.3 },
    { at: 4.4, kind: 'burst', actor: 'twig', dur: 0.4 },
    { at: 4.6, kind: 'dizzy', actor: 'alien', dur: 1.0 },
    { at: 4.9, kind: 'burst', actor: 'rocket', emoji: '💨', n: 6, dur: 0.4 },
    { at: 6.3, kind: 'burst', actor: 'tree', emoji: '✨', n: 5, dur: 0.4, dx: 10 },
    { at: 7.0, kind: 'burst', actor: 'twig2', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.2, kind: 'pop', actor: 'alien', emoji: '💡', dur: 0.4 },
    { at: 7.6, kind: 'zap', actor: 'twig2', target: 'alien', dur: 0.2 },
    { at: 7.7, kind: 'burst', actor: 'alien', emoji: '💨', n: 6, dur: 0.4 },
    { at: 8.4, kind: 'puff', actor: 'alien' },
    { at: 8.85, kind: 'zap', actor: 'twig2', target: 'tree', dur: 0.2 },
    { at: 9.05, kind: 'burst', actor: 'tree', emoji: '💨', n: 5, dur: 0.4, dx: 10 },
    { at: 9.2, kind: 'pop', actor: 'tree', emoji: '❓', dur: 0.7 },
  ],
  camera: [
    { at: 4.4, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 36, y: 62 } },
    { at: 8.4, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.3, sfx: 'blip' },
    { at: 1.45, say: '枝' },
    { at: 2.0, sfx: 'laser' },
    { at: 2.15, sfx: 'poof' },
    { at: 3.0, sfx: 'laser' },
    { at: 3.15, sfx: 'poof' },
    { at: 4.4, sfx: 'crack' },
    { at: 5.65, say: '枝' },
    { at: 6.3, sfx: 'poof' },
    { at: 7.0, say: '樹枝' },
    { at: 7.7, sfx: 'poof' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 9.05, sfx: 'poof' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
