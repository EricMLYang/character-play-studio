import type { Clip } from '../clip'

// 洞：豬探長拿放大鏡跟著腳印，看到線索就舉著鏡子全速衝，一頭撞倒第一塊石板——石板像骨牌一塊接一塊越倒越快，他追著想接，一塊都沒接到還自己絆倒。
// 倒下的石板疊成「同」，最後一塊翹板把他彈上天、踢翻水桶濺出三點水「氵」；他翻過字頂，噗通掉進山洞探出頭比讚，放大鏡才從天上掉下來砸他頭。洞、洞、山洞
const clip: Clip = {
  char: '洞',
  meta: { theme: '豬探長追腳印', cast: '豬探長＋石板骨牌＋翹板＋水桶＋山洞', gags: ['石板骨牌越倒越快', '追著接一塊都沒接到', '被翹板彈進山洞'] },
  duration: 10,
  bg: { top: '#FFF3D6', bottom: '#FFF9EC', floor: '#D9B98C', scenery: 'desert' },
  actors: [
    { id: 'mount', emoji: '⛰️', x: 148, y: 67.8, size: 22 },
    { id: 'hole', emoji: '🕳️', x: 146, y: 73, size: 9 },
    { id: 'fp1', emoji: '👣', x: 32, y: 74.5, size: 4 },
    { id: 'fp2', emoji: '👣', x: 42, y: 74.5, size: 4 },
    { id: 's1', emoji: '🟩', x: 62, y: 72.4, size: 11 },
    { id: 's2', emoji: '🟩', x: 76, y: 72.4, size: 11 },
    { id: 's3', emoji: '🟩', x: 90, y: 72.4, size: 11 },
    { id: 's4', emoji: '🟩', x: 104, y: 72.4, size: 11 },
    { id: 'board', emoji: '🪵', x: 119, y: 73.5, size: 8 },
    { id: 'pail', emoji: '🪣', x: 129, y: 73.5, size: 7 },
    { id: 'pig', emoji: 'hero:pig/think', x: 14, y: 71.5, size: 13, flip: true },
    { id: 'glass', emoji: '🔍', x: 146, y: 62, size: 6, hidden: true },
  ],
  moves: [
    // 跟著腳印找線索
    { at: 0.2, actor: 'pig', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 0.7, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
    // 全速衝——鏡子撞到第一塊石板
    { at: 0.95, actor: 'pig', do: 'moveTo', to: { x: 52, y: 71.5 }, dur: 0.35, anticipate: 4, ease: 'in' },
    { at: 1.3, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 骨牌：越倒越快
    { at: 1.4, actor: 's1', do: 'rotateTo', amount: 60, dur: 0.45, ease: 'in' },
    { at: 1.75, actor: 's2', do: 'rotateTo', amount: 60, dur: 0.4, ease: 'in' },
    { at: 2.05, actor: 's3', do: 'rotateTo', amount: 60, dur: 0.35, ease: 'in' },
    { at: 2.3, actor: 's4', do: 'rotateTo', amount: 60, dur: 0.3, ease: 'in' },
    // 豬探長追著接，一塊都沒接到
    { at: 1.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 1.6, actor: 'pig', do: 'moveTo', to: { x: 108, y: 71.5 }, dur: 1.1 },
    { at: 1.8, actor: 'pig', do: 'hop', amount: 4, dur: 0.25 },
    { at: 2.1, actor: 'pig', do: 'hop', amount: 4, dur: 0.25 },
    { at: 2.4, actor: 'pig', do: 'hop', amount: 4, dur: 0.25 },
    // 自己絆倒
    { at: 2.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 2.8, actor: 'pig', do: 'rotateTo', amount: 75, dur: 0.25, ease: 'bounce' },
    { at: 2.8, actor: 'pig', do: 'moveTo', to: { x: 112, y: 72.5 }, dur: 0.25 },
    // 大崩塌：石板疊成「同」
    { at: 3.4, actor: 's1', do: 'vanish', dur: 0.2 },
    { at: 3.7, actor: 's2', do: 'vanish', dur: 0.2 },
    { at: 3.9, actor: 's3', do: 'vanish', dur: 0.2 },
    { at: 4.2, actor: 's4', do: 'vanish', dur: 0.2 },
    // 翹板把他彈上天，踢翻水桶
    { at: 4.6, actor: 'board', do: 'tilt', amount: -30, dur: 0.3 },
    { at: 4.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 4.65, actor: 'pig', do: 'rotateTo', amount: -75, dur: 0.2 },
    { at: 4.65, actor: 'pig', do: 'moveTo', to: { x: 108, y: 8 }, dur: 0.45, ease: 'out' },
    { at: 4.7, actor: 'pail', do: 'rotateTo', amount: -70, dur: 0.25, ease: 'back' },
    { at: 4.7, actor: 'pail', do: 'moveTo', to: { x: 133, y: 73.5 }, dur: 0.25 },
    // 翻過字頂，掉進山洞
    { at: 5.1, actor: 'pig', do: 'spin', times: 1, dur: 0.5 },
    { at: 5.1, actor: 'pig', do: 'moveTo', to: { x: 146, y: 66 }, dur: 0.55, arc: 4, ease: 'in' },
    { at: 5.6, actor: 'pig', do: 'vanish', dur: 0.15 },
    { at: 5.7, actor: 'hole', do: 'squash', amount: 0.3, dur: 0.25 },
    // 從洞口探頭
    { at: 6.3, actor: 'pig', do: 'moveTo', to: { x: 146, y: 69 }, dur: 0.01 },
    { at: 6.35, actor: 'pig', do: 'pop' },
    { at: 6.35, actor: 'pig', do: 'scaleTo', amount: 0.8, dur: 0.01 },
    { at: 6.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 7.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.2, actor: 'pig', do: 'hop', amount: 2, dur: 0.3 },
    // 放大鏡這才從天上掉下來
    { at: 8.3, actor: 'glass', do: 'drop', dur: 0.4 },
    { at: 8.65, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.65, actor: 'glass', do: 'hop', amount: 3, dur: 0.3 },
    { at: 9.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 9.1, actor: 'glass', do: 'vanish', dur: 0.2 },
  ],
  builds: [
    // 倒下的石板：冂、一、口
    { at: 3.4, dur: 0.5, strokes: [3, 4], from: 's1', color: '#087F5B' },
    { at: 3.75, dur: 0.3, strokes: [5], from: 's2', color: '#087F5B' },
    { at: 3.95, dur: 0.55, strokes: [6, 7, 8], from: 's4', color: '#087F5B' },
    // 水桶濺出的三滴水 → 氵
    { at: 4.75, dur: 0.6, strokes: [0, 1, 2], from: 'pail', color: '#0CA678' },
  ],
  glyph: [{ at: 5.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.4 },
    { at: 0.75, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.4 },
    { at: 0.95, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 1.3, kind: 'burst', actor: 'pig', dx: 6 },
    { at: 2.85, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 3.0, kind: 'sweat', actor: 'pig' },
    { at: 3.4, kind: 'puff', actor: 's2', dur: 0.6 },
    { at: 4.7, kind: 'fountain', actor: 'pail', n: 6, dur: 0.6 },
    { at: 5.7, kind: 'puff', actor: 'hole', dur: 0.5 },
    { at: 6.5, kind: 'dizzy', actor: 'pig', dur: 0.7 },
    { at: 7.25, kind: 'pop', actor: 'pig', emoji: '👍', dx: -10, dur: 0.8 },
    { at: 8.65, kind: 'burst', actor: 'pig' },
  ],
  camera: [
    { at: 1.3, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: 2.8, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 112, y: 66 } },
  ],
  cues: [
    { at: 0.7, sfx: 'blip' },
    { at: 1.3, sfx: 'bonk' },
    { at: 1.35, say: '洞' },
    { at: 1.75, sfx: 'tap' },
    { at: 2.05, sfx: 'tap' },
    { at: 2.3, sfx: 'tap' },
    { at: 2.8, sfx: 'slide' },
    { at: 3.4, sfx: 'rumble' },
    { at: 4.6, sfx: 'boing' },
    { at: 4.75, sfx: 'splash' },
    { at: 5.4, say: '洞' },
    { at: 5.7, sfx: 'plop' },
    { at: 6.4, say: '山洞' },
    { at: 8.65, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
