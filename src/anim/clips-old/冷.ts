import type { Clip } from '../clip'

// 冷（重做）：大太陽底下，小恐龍熱到冒汗。企鵝推來一大塊冰坐在上面納涼；恐龍衝過去抱冰——冷到變藍發抖，放開又熱回來；
// 乾脆整隻撲上去，冰太滑一路滑下去屁股撞仙人掌。氣得噴火燒冰，冰「碰」地炸開變成「冷」，還把他炸回仙人掌上。
// 國字讓到上方，企鵝走到中間吹一口冷氣給他（冷氣）；回馬槍：吹太大力，恐龍整隻被吹成雪人滑走。冷、冷、冷氣
const D = 67.8 // 恐龍（size 22）站在地上的 y
const P = 70.3 // 企鵝（size 16）
const HOT = 'sepia(.7) saturate(3.2) hue-rotate(-45deg) brightness(1.02)'
const COLD = 'hue-rotate(115deg) saturate(.85) brightness(1.12)'

const clip: Clip = {
  char: '冷',
  meta: { theme: '大熱天搶冰塊', cast: '小恐龍＋企鵝＋大冰塊＋仙人掌＋太陽', gags: ['抱冰太冷放開又太熱', '撲上冰塊滑下去撞仙人掌', '噴火燒冰炸回仙人掌', '冷氣吹太大力變雪人'] },
  duration: 10,
  bg: { top: '#FFD8A8', bottom: '#FFF4E6', floor: '#F5D9A6', scenery: 'desert' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 24, y: 17, size: 13, float: true },
    { id: 'cactus', emoji: '🌵', x: 149, y: 70.3, size: 16 },
    { id: 'ice', emoji: '🧊', x: 90, y: D, size: 22, hidden: true },
    { id: 'peng', emoji: '🐧', x: 112, y: P, size: 16, hidden: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 30, y: D, size: 22, flip: true, tint: HOT },
  ],
  moves: [
    // 熱到喘氣；企鵝推著一大塊冰進來，跳上去坐著納涼
    { at: 0, actor: 'dino', do: 'shake', amount: 0.6, dur: 0.8 },
    { at: 0, actor: 'sun', do: 'bounce', amount: 2, times: 2, dur: 0.8 },
    { at: 0, actor: 'ice', do: 'enter', from: { x: 190, y: D }, dur: 0.8, ease: 'out' },
    { at: 0, actor: 'peng', do: 'enter', from: { x: 212, y: P }, dur: 0.8, ease: 'out' },
    { at: 0.85, actor: 'peng', do: 'moveTo', to: { x: 90, y: 52 }, arc: 8, dur: 0.4, ease: 'out' },
    // 看到冰：衝過去抱住——好冷！變藍發抖
    { at: 0.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 1.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 1.3, actor: 'dino', do: 'moveTo', to: { x: 70, y: D }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 1.65, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 1.65, actor: 'dino', do: 'tint', filter: COLD, dur: 0.12 },
    { at: 1.65, actor: 'dino', do: 'shake', amount: 1.3, dur: 0.6 },
    { at: 1.65, actor: 'ice', do: 'squash', amount: 0.1, dur: 0.2 },
    // 跳開——又熱回來
    { at: 2.3, actor: 'dino', do: 'moveTo', to: { x: 40, y: D }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 2.65, actor: 'dino', do: 'tint', filter: HOT, dur: 0.35 },
    { at: 2.65, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 2.65, actor: 'sun', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 2.7, actor: 'peng', do: 'tilt', amount: 12, dur: 0.4 },
    // 乾脆整隻撲上去：企鵝跳起來躲開，恐龍在冰上一路滑下去，屁股撞仙人掌
    { at: 3.0, actor: 'dino', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 3.3, actor: 'dino', do: 'moveTo', to: { x: 90, y: 54 }, arc: 14, dur: 0.35, anticipate: 4, ease: 'in' },
    { at: 3.35, actor: 'peng', do: 'hop', amount: 18, dur: 0.55 },
    { at: 3.65, actor: 'dino', do: 'moveTo', to: { x: 134, y: D }, dur: 0.3, ease: 'in' },
    { at: 3.95, actor: 'cactus', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 3.95, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 3.95, actor: 'dino', do: 'moveTo', to: { x: 124, y: D }, dur: 0.3, ease: 'out' },
    { at: 3.95, actor: 'dino', do: 'hop', amount: 7, dur: 0.4 },
    { at: 4.1, actor: 'peng', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 氣到噴火燒冰
    { at: 4.35, actor: 'dino', do: 'flip' },
    { at: 4.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 4.45, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 4.75, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.45 },
    { at: 4.8, actor: 'peng', do: 'moveTo', to: { x: 34, y: P }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 4.9, actor: 'ice', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 4.9, actor: 'ice', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'in' },
    // 碰！冰炸開，把恐龍炸回仙人掌上
    { at: 5.2, actor: 'ice', do: 'vanish', dur: 0.08 },
    { at: 5.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 5.2, actor: 'dino', do: 'moveTo', to: { x: 134, y: D }, dur: 0.2, ease: 'out' },
    { at: 5.4, actor: 'cactus', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 5.4, actor: 'dino', do: 'hop', amount: 7, dur: 0.4 },
    { at: 5.4, actor: 'dino', do: 'moveTo', to: { x: 128, y: D }, dur: 0.3, ease: 'out' },
    // 冰沒了，又熱回來
    { at: 6.05, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 6.1, actor: 'sun', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 國字讓位：企鵝走到中間，吸一大口氣——呼！冷氣
    { at: 6.9, actor: 'peng', do: 'flip' },
    { at: 6.9, actor: 'peng', do: 'moveTo', to: { x: 60, y: P }, dur: 0.5 },
    { at: 6.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 6.9, actor: 'dino', do: 'moveTo', to: { x: 98, y: D }, dur: 0.5 },
    { at: 7.3, actor: 'peng', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 7.6, actor: 'peng', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.65, actor: 'dino', do: 'tint', filter: COLD, dur: 0.25 },
    { at: 7.7, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 7.75, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：再來一口，這次吸到整隻鼓起來——吹太大力，恐龍變成雪人滑走
    { at: 8.1, actor: 'peng', do: 'scaleTo', amount: 1.35, dur: 0.35, ease: 'in' },
    { at: 8.45, actor: 'peng', do: 'scaleTo', amount: 1 / 1.35, dur: 0.2, ease: 'out' },
    { at: 8.5, actor: 'dino', do: 'tint', filter: '', dur: 0.05 },
    { at: 8.5, actor: 'dino', do: 'swap', emoji: '⛄' },
    { at: 8.5, actor: 'dino', do: 'moveTo', to: { x: 128, y: D }, dur: 0.45, ease: 'out' },
    { at: 8.5, actor: 'dino', do: 'scaleTo', amount: 1.25, dur: 0.2, ease: 'back' },
    { at: 9.5, actor: 'dino', do: 'scaleTo', amount: 0.8, dur: 0.15, ease: 'out' },
    { at: 8.75, actor: 'peng', do: 'flip' },
    { at: 8.75, actor: 'peng', do: 'moveTo', to: { x: 34, y: P }, dur: 0.4 },
    { at: 9.2, actor: 'peng', do: 'flip' },
    // 雪人打個噴嚏，變回藍藍的恐龍
    { at: 9.15, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 9.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 9.5, actor: 'dino', do: 'tint', filter: COLD, dur: 0.05 },
    { at: 9.5, actor: 'dino', do: 'hop', amount: 5, dur: 0.35 },
  ],
  builds: [
    // 炸開的冰：大塊 → 令，兩小塊 → 冫
    { at: 5.2, dur: 0.55, strokes: [2, 3, 4, 5, 6], from: 'ice', color: '#1C7ED6' },
    { at: 5.35, dur: 0.4, strokes: [0, 1], from: 'ice', color: '#74C0FC' },
  ],
  glyph: [
    { at: 5.85, dur: 0.4, do: 'wobble' },
    { at: 6.7, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.1, kind: 'sweat', actor: 'dino' },
    { at: 0.9, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.4 },
    { at: 1.25, kind: 'pop', actor: 'peng', emoji: '😎', dur: 0.6 },
    { at: 1.65, kind: 'burst', actor: 'dino', emoji: '❄️', n: 6, dur: 0.5 },
    { at: 1.75, kind: 'pop', actor: 'dino', emoji: '🥶', dur: 0.55 },
    { at: 2.7, kind: 'sweat', actor: 'dino' },
    { at: 2.75, kind: 'pop', actor: 'dino', emoji: '😩', dur: 0.4 },
    { at: 3.95, kind: 'burst', actor: 'cactus', n: 1, dx: -6, dy: 8, dur: 0.35 },
    { at: 4.05, kind: 'pop', actor: 'dino', emoji: '😣', dur: 0.35 },
    { at: 4.1, kind: 'pop', actor: 'peng', emoji: '😆', dur: 0.5 },
    { at: 4.75, dur: 0.45, kind: 'line', actor: 'dino', to: { x: 96, y: 64 }, color: '#FF6B00', width: 4, dx: -9, dy: -8 },
    { at: 4.85, kind: 'burst', actor: 'ice', emoji: '🔥', n: 6, dy: 10, dur: 0.4 },
    { at: 4.85, kind: 'pop', actor: 'peng', emoji: '😱', dur: 0.4 },
    { at: 5.2, kind: 'burst', actor: 'ice', n: 1, dy: 8, dur: 0.4 },
    { at: 5.4, kind: 'burst', actor: 'cactus', n: 1, dx: -6, dy: 8, dur: 0.3 },
    { at: 5.5, kind: 'dizzy', actor: 'dino', dur: 0.9 },
    { at: 6.1, kind: 'sweat', actor: 'dino' },
    { at: 6.3, kind: 'pop', actor: 'dino', emoji: '😭', dur: 0.5 },
    { at: 6.35, kind: 'pop', actor: 'peng', emoji: '💡', dur: 0.45 },
    // 冷氣：企鵝吹過去一道白白的冷風
    { at: 7.6, dur: 0.6, kind: 'line', actor: 'peng', target: 'dino', color: '#D0EBFF', width: 6, dx: 5, dy: -3 },
    { at: 7.65, kind: 'burst', actor: 'dino', emoji: '❄️', n: 8, dy: 10, dur: 0.6 },
    { at: 7.95, kind: 'pop', actor: 'dino', emoji: '😌', dx: 8, dur: 0.45 },
    { at: 8.1, kind: 'pop', actor: 'peng', emoji: '😤', dur: 0.35 },
    { at: 8.45, dur: 0.35, kind: 'line', actor: 'peng', target: 'dino', color: '#E7F5FF', width: 8, dx: 5, dy: -3 },
    { at: 8.5, kind: 'burst', actor: 'dino', emoji: '❄️', n: 12, dy: 10, dur: 0.7 },
    { at: 8.8, kind: 'pop', actor: 'peng', emoji: '😬', dur: 0.4 },
    { at: 9.5, kind: 'burst', actor: 'dino', emoji: '❄️', n: 8, dy: 6, dur: 0.5 },
    { at: 9.6, kind: 'pop', actor: 'dino', emoji: '🥶', dx: 6, dur: 0.4 },
    { at: 9.65, kind: 'pop', actor: 'peng', emoji: '😆', dur: 0.35 },
  ],
  camera: [
    { at: 3.95, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 5.2, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 7.65, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 80, y: 56 } },
    { at: 8.5, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 冰炸開：白光一閃
    { at: 5.2, dur: 0.04, level: -0.7 },
    { at: 5.24, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.85, sfx: 'boing' },
    { at: 1.3, sfx: 'whoosh' },
    { at: 1.65, say: '冷' },
    { at: 3.3, sfx: 'whoosh' },
    { at: 3.65, sfx: 'slide' },
    { at: 3.95, sfx: 'bonk' },
    { at: 4.75, sfx: 'laser' },
    { at: 5.2, sfx: 'crack' },
    { at: 5.4, sfx: 'bonk' },
    { at: 5.85, say: '冷' },
    { at: 7.6, say: '冷氣' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 9.45, sfx: 'achoo' },
    { at: 9.7, sfx: 'cheer' },
  ],
}

export default clip
