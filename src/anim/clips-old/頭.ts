import type { Clip } from '../clip'

// 頭：太空人玩偶的魚缸頭盔一直飄在頭上扣不下去。小老鼠只要「輕輕拍一下」，卻原地猛催、衝過頭撞翻一疊橘色長條，長條落下排成「頭」；
// 老鼠冒煙倒滑回來，伸一根手指輕輕一點，頭盔「喀」扣上。結尾太空人照樣飄起來，老鼠再用一根手指把他按回地上。頭、頭、頭盔
const clip: Clip = {
  char: '頭',
  meta: { theme: '太空玩具房', cast: '小老鼠＋太空人玩偶＋魚缸頭盔', gags: ['用力過猛衝過頭', '一根手指剛剛好', '飄起來又被按回去'] },
  duration: 10,
  bg: { top: '#CFE3FF', bottom: '#EAF2FF', floor: '#B9C3E6', scenery: 'space' },
  actors: [
    { id: 'bar3', emoji: '🟧', x: 152, y: 56.5, size: 7 },
    { id: 'bar2', emoji: '🟧', x: 152, y: 63.5, size: 7 },
    { id: 'bar1', emoji: '🟧', x: 152, y: 70.5, size: 7 },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 136, y: 71, size: 14 },
    { id: 'helmet', emoji: '🫧', x: 136, y: 55, size: 9, float: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 24, y: 71.5, size: 13, flip: true },
  ],
  moves: [
    // 太空人跳起來頂頭盔：碰、沒中，碰、沒中
    { at: 0.15, actor: 'astro', do: 'hop', amount: 5, dur: 0.35 },
    { at: 0.25, actor: 'helmet', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.7, actor: 'astro', do: 'hop', amount: 5, dur: 0.35 },
    { at: 0.8, actor: 'helmet', do: 'hop', amount: 4, dur: 0.35 },
    // 老鼠：小事一樁，一下就好——然後火力全開
    { at: 0.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 1.1, actor: 'mouse', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 1.1, actor: 'mouse', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 1.45, actor: 'mouse', do: 'moveTo', to: { x: 145, y: 71.5 }, dur: 0.45, anticipate: 4, ease: 'in' },
    // 衝過太空人，頭盔被風吹得像陀螺
    { at: 1.75, actor: 'helmet', do: 'spin', times: 3, dur: 0.8 },
    { at: 1.75, actor: 'astro', do: 'tilt', amount: -15, dur: 0.4 },
    // 撞上長條
    { at: 1.9, actor: 'mouse', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 1.9, actor: 'bar1', do: 'shake', amount: 2, dur: 0.2 },
    { at: 1.95, actor: 'bar3', do: 'moveTo', to: { x: 128, y: 14 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 1.95, actor: 'bar2', do: 'moveTo', to: { x: 146, y: 12 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 1.95, actor: 'bar1', do: 'moveTo', to: { x: 110, y: 16 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 2.0, actor: 'bar3', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.0, actor: 'bar1', do: 'spin', times: 2, dur: 0.6 },
    // 倒滑回來，腳底冒煙
    { at: 2.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 2.2, actor: 'mouse', do: 'moveTo', to: { x: 121, y: 71.5 }, dur: 0.9, ease: 'out' },
    { at: 2.35, actor: 'bar1', do: 'vanish', dur: 0.15 },
    { at: 3.05, actor: 'bar3', do: 'vanish', dur: 0.15 },
    { at: 3.75, actor: 'bar2', do: 'vanish', dur: 0.15 },
    // 甩甩頭，深呼吸，一根手指輕輕一點
    { at: 4.3, actor: 'mouse', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 4.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 4.75, actor: 'mouse', do: 'squash', amount: -0.12, dur: 0.4 },
    { at: 5.1, actor: 'mouse', do: 'hop', amount: 2, dur: 0.2 },
    { at: 5.15, actor: 'helmet', do: 'moveTo', to: { x: 136, y: 63 }, dur: 0.25, ease: 'bounce' },
    { at: 5.45, actor: 'helmet', do: 'vanish', dur: 0.15 },
    { at: 5.45, actor: 'astro', do: 'flash', dur: 0.3 },
    { at: 5.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
    { at: 5.7, actor: 'astro', do: 'tilt', amount: 8, dur: 0.25 },
    { at: 6.0, actor: 'astro', do: 'tilt', amount: 8, dur: 0.25 },
    { at: 6.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 回馬槍：頭盔扣好了，人還是飄起來
    { at: 7.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 7.0, actor: 'astro', do: 'moveTo', to: { x: 136, y: 58 }, dur: 1.0, ease: 'out' },
    { at: 7.6, actor: 'astro', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 8.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 8.5, actor: 'mouse', do: 'hop', amount: 4, dur: 0.25 },
    { at: 8.6, actor: 'astro', do: 'moveTo', to: { x: 136, y: 71 }, dur: 0.4, ease: 'bounce' },
    { at: 9.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 9.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 9.4, actor: 'mouse', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 長條雨點般落下：左邊豆、右邊頁，最後兩點
    { at: 2.3, dur: 0.75, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'bar1', style: 'drop', color: '#F76707' },
    { at: 3.05, dur: 0.7, strokes: [7, 8, 9, 10, 11, 12, 13], from: 'bar3', style: 'drop', color: '#FD7E14' },
    { at: 3.75, dur: 0.3, strokes: [14, 15], from: 'bar2', style: 'drop', color: '#F76707' },
  ],
  glyph: [{ at: 4.1, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'astro', emoji: '😣', dur: 0.4 },
    { at: 0.6, kind: 'pop', actor: 'mouse', emoji: '☝️', dur: 0.5 },
    { at: 1.1, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 1.9, kind: 'burst', actor: 'bar1', n: 1, dur: 0.4 },
    { at: 2.3, kind: 'zzz', actor: 'mouse', emoji: '💨', dur: 1.0, dy: 10 },
    { at: 3.1, kind: 'dizzy', actor: 'mouse', dur: 1.0 },
    { at: 5.1, kind: 'pop', actor: 'mouse', emoji: '☝️', dur: 0.4 },
    { at: 5.45, kind: 'burst', actor: 'astro', emoji: '✨', n: 5, dur: 0.5 },
    { at: 6.3, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.5 },
    { at: 7.7, kind: 'sweat', actor: 'mouse' },
    { at: 8.5, kind: 'pop', actor: 'mouse', emoji: '☝️', dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'astro', emoji: '❗', dur: 0.4 },
  ],
  camera: [
    { at: 1.1, dur: 0.35, do: 'zoom', amount: 1.25, actor: 'mouse' },
    { at: 1.45, dur: 0.3, do: 'follow', actor: 'mouse', amount: 1.3 },
    { at: 1.9, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 2.0, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.15, sfx: 'boing' },
    { at: 0.7, sfx: 'boing' },
    { at: 1.1, sfx: 'rumble' },
    { at: 1.4, say: '頭' },
    { at: 1.45, sfx: 'whoosh' },
    { at: 1.9, sfx: 'bonk' },
    { at: 2.2, sfx: 'slide' },
    { at: 4.1, say: '頭' },
    { at: 5.1, sfx: 'tap' },
    { at: 5.15, say: '頭盔' },
    { at: 5.45, sfx: 'clink' },
    { at: 8.5, sfx: 'tap' },
    { at: 8.7, sfx: 'plop' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
