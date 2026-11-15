import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 菜：披風英雄看到一顆比他還大的高麗菜，口水直流。第一次衝鋒披風蓋住頭，瞎跑撞上拿一片葉子假裝隱形的布忍者，煙霧彈提早爆開，被彈回原地；
// 第二次往後仰到底再衝——碰！撞得菜葉、葉尖、菜梗掉下來拼成「菜」，大菜滾出畫面。忍者從煙裡冒出來舉起一把青菜；英雄披風又蓋住頭，撞上忍者，青菜掉在他頭上。菜、菜、青菜
const clip: Clip = {
  char: '菜',
  meta: { theme: '披風英雄摘大菜', cast: '披風英雄＋布忍者＋巨無霸高麗菜', gags: ['披風蓋住頭瞎跑', '假裝隱形的忍者', '蓄力衝刺撞扁', '青菜掉在頭上'] },
  duration: 10,
  bg: { top: '#E6F8EE', bottom: '#FAFFF6', floor: '#CFE6C8', scenery: 'room' },
  actors: [
    { id: 'cabbage', emoji: '🥬', x: 138, y: 67.8, size: 22 },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 116, y: 71.5, size: 13 },
    { id: 'leaf', emoji: '🍃', x: 114, y: 66, size: 6 },
    { id: 'greens', emoji: '🥬', x: 142, y: 60.6, size: 8, hidden: true },
    { id: 'cape', emoji: 'hero:cape/idle', x: 22, y: 71.1, size: 14, flip: true },
  ],
  moves: [
    // 看到大菜，指著它、口水直流，往後仰蓄力
    { at: 0.4, actor: 'cape', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 0.9, actor: 'cape', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 0.9, actor: 'cape', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.3, actor: 'cape', do: 'rotateTo', amount: -15, dur: 0.3, ease: 'out' },
    { at: 1.3, actor: 'cape', do: 'squash', amount: -0.3, dur: 0.4 },
    // 第一次衝鋒：披風蓋住頭，瞎跑撞上忍者
    { at: 1.75, actor: 'cape', do: 'rotateTo', amount: 15, dur: 0.1 },
    { at: 1.75, actor: 'cape', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 1.75, actor: 'cape', do: 'moveTo', to: { x: 106, y: 71.1 }, dur: 0.8, arc: 3, ease: 'in' },
    { at: 1.75, actor: 'cape', do: 'shake', amount: 1.5, dur: 0.8 },
    { at: 2.0, actor: 'leaf', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 2.65, actor: 'ninja', do: 'vanish', dur: 0.2 },
    { at: 2.65, actor: 'leaf', do: 'vanish', dur: 0.2 },
    { at: 2.6, actor: 'cape', do: 'moveTo', to: { x: 22, y: 71.1 }, dur: 0.5, arc: 6, ease: 'out' },
    { at: 3.15, actor: 'cape', do: 'shake', amount: 1, dur: 0.3 },
    { at: 3.2, actor: 'cape', do: 'swap', emoji: 'hero:cape/idle' },
    // 第二次：往後仰到底……定住……衝！
    { at: 3.4, actor: 'cape', do: 'rotateTo', amount: -25, dur: 0.4, ease: 'out' },
    { at: 3.5, actor: 'cape', do: 'squash', amount: -0.4, dur: 0.5 },
    { at: 4.1, actor: 'cape', do: 'rotateTo', amount: 25, dur: 0.1 },
    { at: 4.1, actor: 'cape', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 4.1, actor: 'cape', do: 'moveTo', to: { x: 122, y: 71.1 }, dur: 0.45, anticipate: 4, ease: 'in' },
    // 碰！撞扁在大菜上
    { at: 4.55, actor: 'cape', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.6, actor: 'cape', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 4.55, actor: 'cabbage', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.55, actor: 'cabbage', do: 'hop', amount: 4, dur: 0.3 },
    { at: 5.0, actor: 'cabbage', do: 'moveTo', to: { x: 190, y: 67.8 }, dur: 0.8, ease: 'in' },
    { at: 5.0, actor: 'cabbage', do: 'spin', times: 2, dur: 0.8 },
    { at: 6.3, actor: 'cape', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.8, actor: 'cape', do: 'swap', emoji: 'hero:cape/happy' },
    // 忍者從煙裡冒出來，舉起一把青菜
    { at: 6.9, actor: 'ninja', do: 'moveTo', to: { x: 142, y: 71.5 }, dur: 0.01 },
    { at: 7.0, actor: 'ninja', do: 'pop' },
    { at: 7.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.1, actor: 'greens', do: 'pop' },
    { at: 7.4, actor: 'ninja', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.4, actor: 'greens', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.8, actor: 'cape', do: 'swap', emoji: 'hero:cape/pose' },
    // 回馬槍：披風又蓋住頭，瞎撞上忍者，青菜掉在他頭上
    { at: 8.3, actor: 'cape', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 8.5, actor: 'cape', do: 'moveTo', to: { x: 133, y: 71.1 }, dur: 0.35 },
    { at: 8.5, actor: 'cape', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 8.85, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.9, actor: 'greens', do: 'moveTo', to: { x: 133, y: 59.6 }, dur: 0.3, ease: 'bounce' },
    { at: 9.2, actor: 'cape', do: 'squash', amount: 0.2, dur: 0.25 },
    ...pressStack(9.2, 0.25, 0.2, 14, ['greens']),
    { at: 9.35, actor: 'cape', do: 'swap', emoji: 'hero:cape/happy' },
  ],
  builds: [
    // 震下來的兩株嫩芽 → 艹；三片葉尖 → 爫；粗粗的菜梗 → 木
    { at: 4.65, dur: 0.45, strokes: [0, 1, 2], from: 'cabbage', color: '#4CB648' },
    { at: 4.95, dur: 0.55, strokes: [3, 4, 5, 6], from: 'cabbage', color: '#3A9A3A' },
    { at: 5.35, dur: 0.6, strokes: [7, 8, 9, 10], from: 'cabbage', color: '#2E7D32' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.45, kind: 'pop', actor: 'cape', emoji: '❗', dur: 0.4 },
    { at: 0.95, kind: 'pop', actor: 'cape', emoji: '👉', dx: 8, dur: 0.6 },
    { at: 1.2, kind: 'bubble', actor: 'cape', emoji: '🤤', dur: 0.6 },
    { at: 1.8, kind: 'pop', actor: 'cape', emoji: '🙈', dur: 0.6 },
    { at: 2.6, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.6 },
    { at: 3.15, kind: 'puff', actor: 'cape', dur: 0.4 },
    { at: 3.2, kind: 'sweat', actor: 'cape' },
    { at: 4.55, kind: 'burst', actor: 'cabbage', dur: 0.5 },
    { at: 4.7, kind: 'dizzy', actor: 'cape', dur: 1.0 },
    { at: 6.85, kind: 'pop', actor: 'cape', emoji: '👍', dur: 0.5 },
    { at: 7.0, kind: 'burst', actor: 'ninja', emoji: '💨', n: 5, dur: 0.5 },
    { at: 8.3, kind: 'pop', actor: 'cape', emoji: '🙈', dur: 0.5 },
    { at: 8.85, kind: 'burst', actor: 'ninja', emoji: '💨', n: 5, dur: 0.5 },
  ],
  camera: [
    { at: 3.5, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 30, y: 60 } },
    { at: 4.1, dur: 0.25, do: 'zoom', amount: 1 },
    { at: 4.55, dur: 0.4, do: 'shake' },
  ],
  cues: [
    { at: 1.0, say: '菜' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.55, sfx: 'boing' },
    { at: 2.6, sfx: 'poof' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 4.55, sfx: 'bonk' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 6.0, say: '菜' },
    { at: 7.0, sfx: 'poof' },
    { at: 7.15, say: '青菜' },
    { at: 8.85, sfx: 'poof' },
    { at: 9.15, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
