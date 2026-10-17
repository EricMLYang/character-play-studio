import type { Clip, Move } from '../clip'

// 麵（v8）：橡膠恐龍想吃高架上的大碗麵，手太短搆不到，只好把空碗一個個疊成高塔——用腳踩、用鼻子頂、用尾巴甩，再爬上去用頭頂兩個。
// 最後用鼻尖放上一片小魚板，整座塔「嘩啦」倒下，碗和金黃麵條散成「麵」，恐龍被空碗埋住只露出眼睛。一根麵條從架子上垂下來，恐龍一口吸光；開心踏腳——架上的大碗掉下來扣在頭上。麵、麵、麵條
const sway = (at: number, amount: number): Move[] =>
  ['b1', 'b2', 'b3', 'dino', 'b4', 'b5', 'fish'].map((actor) => ({ at, dur: 0.45, actor, do: 'tilt' as const, amount }))
const clip: Clip = {
  char: '麵',
  meta: { theme: '恐龍疊碗吃麵', cast: '橡膠恐龍＋一疊碗＋魚板＋大碗麵', gags: ['手太短搆不到', '疊碗越疊越晃', '整座塔倒下來', '大碗扣在頭上'] },
  duration: 10,
  bg: { top: '#FFF0D6', bottom: '#FFF9EE', floor: '#D7B98E', scenery: 'room' },
  actors: [
    { id: 'shelf', emoji: '🪵', x: 34, y: 22, size: 12, float: true },
    { id: 'big', emoji: '🍜', x: 34, y: 14, size: 11, float: true },
    { id: 'b1', emoji: '🥣', x: 36, y: 71, size: 8, hidden: true },
    { id: 'b2', emoji: '🥣', x: 26, y: 71, size: 8, hidden: true, float: true },
    { id: 'b3', emoji: '🥣', x: 26, y: 71, size: 8, hidden: true, float: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 16, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'b4', emoji: '🥣', x: 36, y: 40, size: 7, hidden: true, float: true },
    { id: 'b5', emoji: '🥣', x: 36, y: 34.5, size: 7, hidden: true, float: true },
    { id: 'fish', emoji: '🍥', x: 36, y: 30, size: 5, hidden: true, float: true },
    { id: 'e1', emoji: '🥣', x: 12, y: 71, size: 9, hidden: true },
    { id: 'e2', emoji: '🥣', x: 22, y: 71, size: 9, hidden: true },
  ],
  moves: [
    { at: 0.1, actor: 'dino', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.6 },
    // 伸手搆——手太短
    { at: 0.8, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 0.8, actor: 'dino', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 1.0, actor: 'dino', do: 'hop', amount: 3, dur: 0.3 },
    // 「碰」地踩下第一個碗當底座
    { at: 1.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 1.35, actor: 'b1', do: 'drop', dur: 0.3 },
    { at: 1.65, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.2 },
    // 鼻子頂第二個、尾巴甩第三個
    { at: 1.9, actor: 'b2', do: 'pop', dur: 0.15 },
    { at: 1.95, actor: 'b2', do: 'moveTo', to: { x: 36, y: 64.5 }, dur: 0.35, arc: 6 },
    { at: 1.95, actor: 'dino', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 2.4, actor: 'dino', do: 'flip' },
    { at: 2.45, actor: 'b3', do: 'pop', dur: 0.15 },
    { at: 2.5, actor: 'dino', do: 'tilt', amount: -18, dur: 0.3 },
    { at: 2.55, actor: 'b3', do: 'moveTo', to: { x: 36, y: 58 }, dur: 0.4, arc: 12 },
    { at: 2.55, actor: 'b3', do: 'spin', times: 1, dur: 0.4 },
    { at: 2.95, actor: 'dino', do: 'flip' },
    // 爬上去，用頭頂第四、第五個
    { at: 3.05, actor: 'dino', do: 'moveTo', to: { x: 36, y: 49.5 }, dur: 0.4, arc: 6 },
    { at: 3.5, actor: 'b4', do: 'pop', dur: 0.2 },
    { at: 3.75, actor: 'b5', do: 'pop', dur: 0.2 },
    ...sway(3.6, 8),
    ...sway(4.05, -10),
    // 用鼻尖放上一片小魚板——定格一拍
    { at: 4.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 4.3, actor: 'fish', do: 'pop', dur: 0.2 },
    ...sway(4.55, 14),
    // 嘩啦！整座塔倒下
    { at: 5.0, actor: 'b3', do: 'moveTo', to: { x: 66, y: 40 }, dur: 0.3, arc: 6 },
    { at: 5.0, actor: 'b4', do: 'moveTo', to: { x: 96, y: 34 }, dur: 0.35, arc: 6 },
    { at: 5.0, actor: 'b5', do: 'moveTo', to: { x: 90, y: 22 }, dur: 0.35, arc: 6 },
    { at: 5.0, actor: 'fish', do: 'moveTo', to: { x: 100, y: 16 }, dur: 0.35, arc: 6 },
    { at: 5.0, actor: 'b3', do: 'spin', times: 1, dur: 0.3 },
    { at: 5.0, actor: 'b4', do: 'spin', times: 1, dur: 0.35 },
    { at: 5.0, actor: 'b5', do: 'spin', times: 1, dur: 0.35 },
    { at: 5.3, actor: 'b3', do: 'vanish', dur: 0.1 },
    { at: 5.4, actor: 'b4', do: 'vanish', dur: 0.1 },
    { at: 5.4, actor: 'b5', do: 'vanish', dur: 0.1 },
    { at: 5.4, actor: 'fish', do: 'vanish', dur: 0.1 },
    { at: 5.0, actor: 'b1', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'b2', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 5.0, actor: 'dino', do: 'moveTo', to: { x: 16, y: 72 }, dur: 0.45, arc: 6, ease: 'in' },
    { at: 5.0, actor: 'dino', do: 'spin', times: 1, dur: 0.45 },
    // 被空碗埋住，只露出眼睛
    { at: 5.4, actor: 'e1', do: 'drop', dur: 0.3 },
    { at: 5.5, actor: 'e2', do: 'drop', dur: 0.3 },
    { at: 5.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 5.45, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.25 },
    // 麵條垂下來，探出頭一口吸光
    { at: 7.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.0, actor: 'dino', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.0, actor: 'e1', do: 'moveTo', to: { x: 6, y: 71 }, dur: 0.35, arc: 4 },
    { at: 7.0, actor: 'e2', do: 'moveTo', to: { x: 28, y: 71 }, dur: 0.35, arc: 4 },
    { at: 7.5, actor: 'dino', do: 'squash', amount: -0.15, dur: 0.6 },
    // 回馬槍：開心踏腳——架上的大碗掉下來扣在頭上
    { at: 8.2, actor: 'dino', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 8.3, actor: 'shelf', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 8.6, actor: 'big', do: 'moveTo', to: { x: 17, y: 61.5 }, dur: 0.4, arc: 4, ease: 'in' },
    { at: 9.0, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 9.0, actor: 'big', do: 'hop', amount: -2.4, dur: 0.25 },
    { at: 9.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 9.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
  ],
  builds: [
    // 倒下的碗和金黃麵條：左邊 → 麥；右邊 → 面
    { at: 5.15, dur: 0.85, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], from: 'b3', color: '#F59F00' },
    { at: 5.3, dur: 0.8, strokes: [11, 12, 13, 14, 15, 16, 17, 18, 19], from: 'b4', color: '#E8590C' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'dino', emoji: '🍜', dur: 0.6 },
    { at: 1.2, kind: 'pop', actor: 'dino', emoji: '😤', dur: 0.3 },
    { at: 1.65, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 4.0, kind: 'sweat', actor: 'dino' },
    { at: 4.7, kind: 'pop', actor: 'fish', emoji: '❗', dur: 0.3 },
    { at: 5.0, kind: 'burst', x: 40, y: 48, n: 1, dur: 0.35 },
    { at: 5.6, kind: 'dizzy', actor: 'dino', dur: 1.2 },
    { at: 7.0, dur: 1.0, kind: 'line', actor: 'shelf', to: { x: 19, y: 64 }, color: '#FCC419', width: 1.2 },
    { at: 8.0, kind: 'pop', actor: 'dino', emoji: '😋', dur: 0.4 },
    { at: 9.05, kind: 'pop', actor: 'dino', emoji: '⭐', dur: 0.4, dx: 6 },
  ],
  camera: [
    { at: 3.6, dur: 1.2, do: 'zoom', amount: 1.35, to: { x: 40, y: 48 } },
    { at: 5.0, dur: 0.3, do: 'shake', amount: 1 },
    { at: 5.05, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.3, sfx: 'tap' },
    { at: 1.65, sfx: 'plop' },
    { at: 1.7, say: '麵' },
    { at: 2.2, sfx: 'clink' },
    { at: 2.95, sfx: 'clink' },
    { at: 3.65, sfx: 'clink' },
    { at: 3.9, sfx: 'clink' },
    { at: 4.5, sfx: 'tap' },
    { at: 5.0, sfx: 'crack' },
    { at: 5.5, sfx: 'plop' },
    { at: 6.2, say: '麵' },
    { at: 7.15, say: '麵條' },
    { at: 7.8, sfx: 'gulp' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
