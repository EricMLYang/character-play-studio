import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 熊：浣熊花生頭上頂著搖搖晃晃的積木小隊，只為了按蜂蜜罐門上一顆小小的按鈕，卻蹲低猛衝、整個衝過頭；積木從頭上飛出去疊成「能」，
// 他冒煙倒滑回來，腳下四團煙落成四點，變成「熊」。輕輕一按，罐子裡冒出一隻小熊。結尾最後一塊積木才從天上掉回他頭上。熊、熊、小熊
const clip: Clip = {
  char: '熊',
  meta: { theme: '按門鈴', cast: '浣熊花生＋積木小隊＋蜂蜜罐＋小熊', gags: ['頂太高搖搖晃晃', '用力過猛衝過頭', '煙圈變四點', '最後一塊積木晚到回馬槍'] },
  duration: 10,
  bg: { top: '#E6F4D9', bottom: '#F6FBEF', floor: '#C9DDA8', scenery: 'forest' },
  actors: [
    { id: 'cub', emoji: '🐻', x: 146, y: 63, size: 8, hidden: true },
    { id: 'pot', emoji: '🍯', x: 146, y: 72, size: 12 },
    { id: 'button', emoji: '🔴', x: 136.5, y: 69, size: 3, float: true },
    { id: 'smoke', emoji: '💨', x: 128, y: 73, size: 6, hidden: true },
    { id: 'coon', emoji: 'hero:raccoon/carry', x: 22, y: 71, size: 14, flip: true, hidden: true },
    { id: 'b1', emoji: '🧱', x: 22, y: 61.3, size: 6, hidden: true },
    { id: 'b2', emoji: '🧱', x: 22, y: 56.3, size: 6, hidden: true },
    { id: 'b3', emoji: '🧱', x: 22, y: 51.3, size: 6, hidden: true },
    { id: 'b4', emoji: '🧱', x: 130, y: -10, size: 6, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'coon', do: 'enter', from: { x: -15, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'b1', do: 'enter', from: { x: -15, y: 61.3 }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'b2', do: 'enter', from: { x: -15, y: 56.3 }, dur: 0.52, ease: 'out' },
    { at: 0, actor: 'b3', do: 'enter', from: { x: -15, y: 51.3 }, dur: 0.55, ease: 'out' },
    // 晃呀晃，越上面晃越大
    { at: 0.5, actor: 'b1', do: 'tilt', amount: 4, dur: 0.6 },
    { at: 0.5, actor: 'b2', do: 'tilt', amount: -7, dur: 0.6 },
    { at: 0.5, actor: 'b3', do: 'tilt', amount: 11, dur: 0.6 },
    // 在錯的時機敬禮，整疊歪掉
    { at: 1.0, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 1.05, actor: 'b3', do: 'moveTo', to: { x: 25, y: 51.3 }, dur: 0.2 },
    { at: 1.05, actor: 'b2', do: 'moveTo', to: { x: 23.5, y: 56.3 }, dur: 0.2 },
    { at: 1.4, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 1.4, actor: 'b3', do: 'moveTo', to: { x: 22, y: 51.3 }, dur: 0.25, ease: 'back' },
    { at: 1.4, actor: 'b2', do: 'moveTo', to: { x: 22, y: 56.3 }, dur: 0.25, ease: 'back' },
    // 蹲低蓄力，腳轉成一團
    { at: 1.9, actor: 'coon', do: 'squash', amount: 0.25, dur: 0.5 },
    ...pressStack(1.9, 0.5, 0.25, 14, ['b1', 'b2', 'b3']),
    { at: 2.0, actor: 'coon', do: 'shake', amount: 1, dur: 0.4 },
    // 咻——整個衝過按鈕
    { at: 2.45, actor: 'coon', do: 'moveTo', to: { x: 178, y: 71 }, dur: 0.5, anticipate: 4, ease: 'in' },
    { at: 2.45, actor: 'b1', do: 'moveTo', to: { x: 64, y: 30 }, arc: 10, dur: 0.5, ease: 'out' },
    { at: 2.45, actor: 'b2', do: 'moveTo', to: { x: 80, y: 22 }, arc: 12, dur: 0.55, ease: 'out' },
    { at: 2.45, actor: 'b3', do: 'moveTo', to: { x: 98, y: 28 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 2.5, actor: 'b1', do: 'spin', times: 2, dur: 0.5 },
    { at: 2.5, actor: 'b2', do: 'spin', times: 2, dur: 0.55 },
    { at: 2.5, actor: 'b3', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.15, actor: 'b1', do: 'vanish', dur: 0.15 },
    { at: 3.5, actor: 'b2', do: 'vanish', dur: 0.15 },
    { at: 4.0, actor: 'b3', do: 'vanish', dur: 0.15 },
    // 冒煙倒滑回來
    { at: 4.3, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.3, actor: 'coon', do: 'moveTo', to: { x: 124, y: 71 }, dur: 0.5, ease: 'back' },
    { at: 4.65, actor: 'smoke', do: 'pop', dur: 0.2 },
    { at: 4.95, actor: 'smoke', do: 'vanish', dur: 0.2 },
    // 甩甩頭，伸一根爪子輕輕一按
    { at: 5.8, actor: 'coon', do: 'shake', amount: 1, dur: 0.4 },
    { at: 6.2, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 6.2, actor: 'coon', do: 'moveTo', to: { x: 128, y: 71 }, dur: 0.3 },
    { at: 6.55, actor: 'button', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 6.6, actor: 'pot', do: 'shake', amount: 1, dur: 0.3 },
    { at: 6.9, actor: 'cub', do: 'pop', dur: 0.3 },
    { at: 6.9, actor: 'pot', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.2, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 敬禮，小熊慢一拍才跟著敬禮
    { at: 7.6, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.0, actor: 'cub', do: 'tilt', amount: -15, dur: 0.4 },
    // 回馬槍：最後一塊積木現在才從天上掉回頭上
    { at: 8.4, actor: 'b4', do: 'drop', dur: 0.01 },
    { at: 8.4, actor: 'b4', do: 'moveTo', to: { x: 128, y: 61.3 }, dur: 0.35, ease: 'in' },
    { at: 8.75, actor: 'coon', do: 'squash', amount: 0.25, dur: 0.3 },
    ...pressStack(8.75, 0.3, 0.25, 14, ['b4']),
    { at: 8.75, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 8.9, actor: 'cub', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 積木小隊落下鎖成「能」：厶、月、兩個匕；四團煙落成灬
    { at: 3.15, dur: 0.35, strokes: [0, 1], from: 'b1', color: '#B45309' },
    { at: 3.5, dur: 0.5, strokes: [2, 3, 4, 5], from: 'b2', color: '#C2410C' },
    { at: 4.0, dur: 0.5, strokes: [6, 7, 8, 9], from: 'b3', color: '#B45309' },
    { at: 4.75, dur: 0.5, strokes: [10, 11, 12, 13], from: 'smoke', color: '#78716C' },
  ],
  glyph: [{ at: 5.3, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'sweat', actor: 'coon' },
    { at: 1.6, kind: 'pop', actor: 'coon', emoji: '🎯', dur: 0.4, dy: -12 },
    { at: 2.0, kind: 'puff', actor: 'coon', dur: 0.45 },
    { at: 2.55, kind: 'pop', actor: 'b1', emoji: '😱', dur: 0.35 },
    { at: 4.3, kind: 'zzz', actor: 'coon', emoji: '💨', dur: 1.3, dy: 10 },
    { at: 4.85, kind: 'dizzy', actor: 'coon', dur: 1.0 },
    { at: 6.4, kind: 'pop', actor: 'coon', emoji: '☝️', dur: 0.4 },
    { at: 6.95, kind: 'burst', actor: 'cub', emoji: '✨', n: 5, dur: 0.5, dx: -3 },
    { at: 8.1, kind: 'pop', actor: 'cub', emoji: '🫡', dur: 0.5, dx: -4 },
    { at: 8.8, kind: 'pop', actor: 'coon', emoji: '😅', dur: 0.5, dx: -6, dy: -6 },
  ],
  camera: [
    { at: 1.9, dur: 0.5, do: 'zoom', amount: 1.3, actor: 'coon' },
    { at: 2.45, dur: 0.3, do: 'follow', actor: 'coon', amount: 1.3 },
    { at: 2.85, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.6, say: '熊' },
    { at: 2.0, sfx: 'rumble' },
    { at: 2.45, sfx: 'whoosh' },
    { at: 4.3, sfx: 'slide' },
    { at: 4.65, sfx: 'poof' },
    { at: 5.3, say: '熊' },
    { at: 6.55, sfx: 'tap' },
    { at: 6.9, sfx: 'plop' },
    { at: 6.95, say: '小熊' },
    { at: 8.75, sfx: 'bonk' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
