import type { Clip } from '../clip'

// 湯：太空人玩偶只想輕輕按一下湯鍋上的小按鈕，卻扳手指、蹲低、噴射背包全開衝出去——衝過按鈕咚一聲撞牆，冒煙轉著圈滑回來。
// 撞擊震得湯鍋噴出三滴湯（氵）、鍋蓋翻成「日」、麵條垂成下半部；他踮腳輕輕一點「叮」，「湯」完成，鍋裡浮出三顆湯圓繞著頭盔飄，想抓又把按鈕踩到，湯噴他一臉。湯、湯、湯圓
const clip: Clip = {
  char: '湯',
  meta: { theme: '太空人按按鈕煮湯', cast: '太空人玩偶＋湯鍋＋鍋蓋＋麵條＋湯圓', gags: ['噴射背包全開衝過頭撞牆', '輕輕一點就成功', '湯圓抓不到又噴一臉'] },
  duration: 10,
  bg: { top: '#E7F5FF', bottom: '#F8FBFF', floor: '#E9ECEF', scenery: 'snow' },
  actors: [
    { id: 'pot', emoji: '🍲', x: 140, y: 68, size: 18 },
    { id: 'button', emoji: '🔴', x: 131, y: 62, size: 4 },
    { id: 'lid', emoji: '🥏', x: 140, y: 58, size: 9, hidden: true, float: true },
    { id: 'noodle', emoji: '🍜', x: 140, y: 58, size: 9, hidden: true, float: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 22, y: 70, size: 13, flip: true, float: true },
    { id: 'ball1', emoji: '⚪', x: 140, y: 62, size: 5, hidden: true, float: true },
    { id: 'ball2', emoji: '⚪', x: 140, y: 62, size: 5, hidden: true, float: true },
    { id: 'ball3', emoji: '⚪', x: 140, y: 62, size: 5, hidden: true, float: true },
  ],
  moves: [
    // 飄在地板上一點點，指著小按鈕
    { at: 0.1, actor: 'astro', do: 'bounce', amount: 1.5, times: 2, dur: 1.0 },
    { at: 0.4, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/salute' },
    // 扳手指、蹲低，背包亮到不像話
    { at: 0.75, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 0.75, actor: 'astro', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 1.0, actor: 'astro', do: 'squash', amount: 0.35, dur: 0.45 },
    { at: 1.0, actor: 'astro', do: 'flash', dur: 0.5 },
    // 咻——衝過按鈕，撞牆
    { at: 1.4, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 1.4, actor: 'astro', do: 'moveTo', to: { x: 153, y: 50 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 1.85, actor: 'astro', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 1.85, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 1.85, actor: 'pot', do: 'shake', amount: 1.5, dur: 0.5 },
    // 冒煙的靴子轉著圈滑回來
    { at: 2.2, actor: 'astro', do: 'moveTo', to: { x: 120, y: 70 }, dur: 1.1, ease: 'out' },
    { at: 2.2, actor: 'astro', do: 'spin', times: 2, dur: 1.1 },
    // 鍋蓋翻起來、麵條甩出來
    { at: 3.1, actor: 'lid', do: 'pop' },
    { at: 3.1, actor: 'lid', do: 'moveTo', to: { x: 140, y: 40 }, dur: 0.3, ease: 'out' },
    { at: 3.1, actor: 'lid', do: 'spin', times: 1, dur: 0.3 },
    { at: 3.45, actor: 'lid', do: 'vanish', dur: 0.2 },
    { at: 3.8, actor: 'noodle', do: 'pop' },
    { at: 3.8, actor: 'noodle', do: 'moveTo', to: { x: 140, y: 44 }, dur: 0.3, ease: 'out' },
    { at: 4.4, actor: 'noodle', do: 'vanish', dur: 0.3 },
    // 踮腳走過去，伸一根手指輕輕按
    { at: 4.3, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 4.6, actor: 'astro', do: 'moveTo', to: { x: 124, y: 70 }, dur: 0.6, ease: 'linear' },
    { at: 4.6, actor: 'astro', do: 'bounce', amount: 1, times: 3, dur: 0.6 },
    { at: 5.35, actor: 'astro', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: 5.45, actor: 'button', do: 'flash', dur: 0.6 },
    { at: 5.45, actor: 'button', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 5.7, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    // 湯圓浮上來，繞著頭盔飄
    { at: 6.5, actor: 'ball1', do: 'pop' },
    { at: 6.5, actor: 'ball1', do: 'moveTo', to: { x: 118, y: 52 }, dur: 0.6, arc: 4 },
    { at: 6.65, actor: 'ball2', do: 'pop' },
    { at: 6.65, actor: 'ball2', do: 'moveTo', to: { x: 126, y: 49 }, dur: 0.6, arc: 4 },
    { at: 6.8, actor: 'ball3', do: 'pop' },
    { at: 6.8, actor: 'ball3', do: 'moveTo', to: { x: 133, y: 53 }, dur: 0.6, arc: 4 },
    { at: 7.4, actor: 'ball1', do: 'bounce', amount: 1.5, times: 2, dur: 1.2 },
    { at: 7.5, actor: 'ball3', do: 'bounce', amount: 1.5, times: 2, dur: 1.2 },
    // 想抓一顆，自己飄上去，腳又踩到按鈕
    { at: 7.7, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 7.7, actor: 'astro', do: 'moveTo', to: { x: 126, y: 60 }, dur: 0.4, ease: 'out' },
    { at: 7.7, actor: 'ball2', do: 'moveTo', to: { x: 128, y: 40 }, dur: 0.4, ease: 'out' },
    { at: 8.3, actor: 'astro', do: 'moveTo', to: { x: 126, y: 70 }, dur: 0.3, ease: 'in' },
    { at: 8.6, actor: 'button', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.75, actor: 'pot', do: 'shake', amount: 1, dur: 0.4 },
    { at: 8.9, actor: 'astro', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 9.2, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
  ],
  builds: [
    // 三滴湯 → 氵
    { at: 1.95, dur: 0.6, strokes: [0, 1, 2], from: 'pot', color: '#E03131' },
    // 鍋蓋 → 日；麵條 → 下半部
    { at: 3.25, dur: 0.7, strokes: [3, 4, 5, 6], from: 'lid', color: '#E03131' },
    { at: 4.1, dur: 1.35, strokes: [7, 8, 9, 10, 11], from: 'noodle', color: '#F03E3E' },
  ],
  glyph: [{ at: 5.45, dur: 0.4, do: 'pulse' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'astro', emoji: '🔴', dur: 0.8 },
    { at: 1.0, kind: 'puff', actor: 'astro', dur: 0.5 },
    { at: 1.4, kind: 'puff', actor: 'astro', dur: 0.4 },
    { at: 1.85, kind: 'burst', actor: 'astro', dx: -8 },
    { at: 2.2, kind: 'stink', actor: 'astro', dy: 4, dur: 1.0 },
    { at: 3.4, kind: 'dizzy', actor: 'astro', dur: 1.0 },
    { at: 5.45, kind: 'burst', actor: 'button', emoji: '✨', n: 6 },
    { at: 6.4, kind: 'zzz', actor: 'pot', emoji: '♨️', dur: 1.2 },
    { at: 8.7, kind: 'fountain', actor: 'pot', n: 8, dur: 0.7 },
    { at: 9.0, kind: 'pop', actor: 'astro', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 1.4, dur: 0.3, do: 'follow', actor: 'astro', amount: 1.3 },
    { at: 1.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 1.85, dur: 0.35, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.4, sfx: 'blip' },
    { at: 1.0, sfx: 'rumble' },
    { at: 1.4, sfx: 'whoosh' },
    { at: 1.85, sfx: 'bonk' },
    { at: 1.9, say: '湯' },
    { at: 2.2, sfx: 'slide' },
    { at: 3.1, sfx: 'boing' },
    { at: 3.8, sfx: 'splash' },
    { at: 5.45, sfx: 'clink' },
    { at: 5.5, say: '湯' },
    { at: 6.5, sfx: 'bubble' },
    { at: 6.7, say: '湯圓' },
    { at: 8.7, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
