import type { Clip } from '../clip'

// 飯：太空人靠著台座打瞌睡，台座上放著一顆大飯糰。酷炫車子盯上飯糰，踮著輪子一步一步偷偷靠近，每一步都吱一聲，太空人一動就僵住。
// 太空人睡著睡著飄了起來，頭盔撞上車子的眼睛——兩個一起尖叫！車子彈簧一放衝過頭撞翻台座，飯糰炸成一團團白飯疊成「食」，太空人撞到天花板掉下來排成「反」。太空人送上一顆新飯糰，車子一口吞掉；太空人又睡著飄起來。飯、飯、飯糰
const clip: Clip = {
  char: '飯',
  meta: { theme: '偷吃飯糰', cast: '酷炫車子＋太空人＋大飯糰', gags: ['踮輪子偷溜一步一吱', '睡著飄起來撞個正著', '一起尖叫衝過頭', '又睡著飄走'] },
  duration: 10,
  bg: { top: '#FFF3D9', bottom: '#FFFBF0', floor: '#E3C9A1', scenery: 'room' },
  actors: [
    { id: 'stand', emoji: '🪵', x: 148, y: 70, size: 11 },
    { id: 'ball', emoji: '🍙', x: 148, y: 59, size: 11, float: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 132, y: 71, size: 14 },
    { id: 'car', emoji: 'hero:car/idle', x: 20, y: 69, size: 19, hidden: true, flip: true },
    { id: 'ball2', emoji: '🍙', x: 136, y: 52, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 車子探頭進來，盯著飯糰扭扭屁股
    { at: 0.2, actor: 'car', do: 'enter', from: { x: -20, y: 69 }, dur: 0.6, ease: 'out' },
    { at: 1.1, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 1.3, actor: 'car', do: 'shake', amount: 0.8, dur: 0.4 },
    // 踮著輪子，一步一吱
    { at: 1.8, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 1.8, actor: 'car', do: 'moveTo', to: { x: 40, y: 69 }, dur: 0.3, arc: 4 },
    { at: 2.2, actor: 'car', do: 'moveTo', to: { x: 60, y: 69 }, dur: 0.3, arc: 4 },
    // 太空人動了一下——僵住
    { at: 2.55, actor: 'astro', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 2.55, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 3.0, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 3.0, actor: 'car', do: 'moveTo', to: { x: 82, y: 69 }, dur: 0.3, arc: 4 },
    { at: 3.4, actor: 'car', do: 'moveTo', to: { x: 102, y: 69 }, dur: 0.3, arc: 4 },
    // 太空人睡著飄起來，頭盔撞上車子的眼睛
    { at: 3.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 3.5, actor: 'astro', do: 'moveTo', to: { x: 118, y: 58 }, dur: 0.5 },
    { at: 4.0, actor: 'car', do: 'squash', amount: 0.2, dur: 0.2 },
    // 鼻子碰鼻子，一起尖叫！
    { at: 4.15, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 4.15, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 4.15, actor: 'car', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.15, actor: 'astro', do: 'hop', amount: 4, dur: 0.3 },
    // 彈簧一放，衝過頭撞翻台座；太空人彈到天花板
    { at: 4.55, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 4.55, actor: 'car', do: 'moveTo', to: { x: 136, y: 69 }, dur: 0.2, anticipate: 4, ease: 'in' },
    { at: 4.6, actor: 'astro', do: 'moveTo', to: { x: 100, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 4.6, actor: 'astro', do: 'spin', times: 1, dur: 0.35 },
    { at: 4.75, actor: 'car', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.75, actor: 'car', do: 'swap', emoji: 'hero:car/broken' },
    { at: 4.75, actor: 'stand', do: 'rotateTo', amount: 90, dur: 0.25, ease: 'bounce' },
    { at: 4.75, actor: 'ball', do: 'moveTo', to: { x: 80, y: 8 }, dur: 0.35, ease: 'out' },
    { at: 4.75, actor: 'ball', do: 'spin', times: 2, dur: 0.35 },
    { at: 5.1, actor: 'ball', do: 'vanish', dur: 0.15 },
    // 太空人慢慢飄下來，落在車頂上
    { at: 5.6, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 5.6, actor: 'astro', do: 'moveTo', to: { x: 136, y: 54 }, dur: 1.1, ease: 'out' },
    { at: 6.7, actor: 'astro', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 6.7, actor: 'car', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 6.7, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    // 變出一顆新飯糰，放在車子前面
    { at: 6.9, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 7.0, actor: 'ball2', do: 'pop', dur: 0.3 },
    { at: 7.4, actor: 'ball2', do: 'moveTo', to: { x: 151, y: 66 }, dur: 0.35, arc: 4 },
    { at: 7.75, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 7.8, actor: 'car', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 7.8, actor: 'ball2', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 7.8, actor: 'astro', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 回馬槍：車子一口吞掉；太空人又睡著，飄走了
    { at: 8.4, actor: 'ball2', do: 'vanish', dur: 0.15 },
    { at: 8.45, actor: 'car', do: 'squash', amount: -0.15, dur: 0.25 },
    { at: 8.7, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 8.9, actor: 'astro', do: 'moveTo', to: { x: 140, y: 30 }, dur: 1.0 },
  ],
  builds: [
    // 飯糰炸成一團團白飯疊成食字旁；太空人撞天花板掉下來排成反
    { at: 5.15, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'ball', style: 'drop', color: '#E03131' },
    { at: 5.75, dur: 0.45, strokes: [8, 9, 10, 11], from: 'astro', color: '#C92A2A' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'astro', dur: 3.5 },
    { at: 1.0, kind: 'bubble', actor: 'car', emoji: '🍙', dur: 0.7 },
    { at: 1.4, kind: 'pop', actor: 'car', emoji: '😋', dur: 0.4 },
    { at: 2.6, kind: 'sweat', actor: 'car' },
    { at: 3.5, kind: 'zzz', actor: 'astro', dur: 0.6 },
    { at: 4.15, kind: 'pop', actor: 'car', emoji: '😱', dur: 0.4 },
    { at: 4.15, kind: 'pop', actor: 'astro', emoji: '😱', dur: 0.4 },
    { at: 4.75, kind: 'burst', x: 144, y: 64, n: 1, dur: 0.35 },
    { at: 4.8, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 4.9, kind: 'burst', x: 80, y: 17, emoji: '🍚', n: 6, dur: 0.5 },
    { at: 5.0, kind: 'dizzy', actor: 'car', dur: 1.5 },
    { at: 7.05, kind: 'burst', actor: 'ball2', emoji: '✨', n: 4, dur: 0.5 },
    { at: 8.5, kind: 'pop', actor: 'car', emoji: '😋', dur: 0.5 },
    { at: 8.9, kind: 'zzz', actor: 'astro', dur: 1.0 },
  ],
  camera: [
    { at: 4.15, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 112, y: 58 } },
    { at: 4.75, dur: 0.3, do: 'shake', amount: 0.8 },
  ],
  cues: [
    { at: 1.1, say: '飯' },
    { at: 1.95, sfx: 'blip' },
    { at: 2.35, sfx: 'blip' },
    { at: 3.15, sfx: 'blip' },
    { at: 3.55, sfx: 'blip' },
    { at: 4.0, sfx: 'tap' },
    { at: 4.55, sfx: 'whoosh' },
    { at: 4.75, sfx: 'bonk' },
    { at: 5.15, sfx: 'plop' },
    { at: 6.3, say: '飯' },
    { at: 7.1, say: '飯糰' },
    { at: 8.45, sfx: 'gulp' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
