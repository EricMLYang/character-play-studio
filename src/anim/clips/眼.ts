import type { Clip } from '../clip'

// 眼：太空人玩偶想抓一顆亂跳的大眼珠球。追著追著腳就離地了，在空中划水、頭盔「咚」地撞到天花板，屁股著地；眼珠還從他鼻子前彈過去。
// 他瞇眼蓄力、飛撲肚子著地「啪」——眼珠壓扁變成「目」，追逐留下的紫色滑痕被震成「艮」。最後他拍拍頭盔，裡面的大眼睛睜得好大；一飄起來，屁股下又冒出一顆眼珠對他眨眼。眼、眼、眼睛
const clip: Clip = {
  char: '眼',
  meta: { theme: '追眼珠球', cast: '太空人玩偶＋大眼珠球＋紫色滑痕', gags: ['追著追著飄起來划水', '頭盔撞天花板屁股著地', '飛撲壓扁眼珠', '又冒出一顆眼珠眨眼'] },
  duration: 10,
  bg: { top: '#14163A', bottom: '#2D2A66', floor: '#B9B4CC', scenery: 'space' },
  actors: [
    { id: 'skid', emoji: '〰️', x: 122, y: 73, size: 9, hidden: true, tint: 'invert(1) sepia(1) saturate(6) hue-rotate(220deg)' },
    { id: 'ball', emoji: '👁️', x: 130, y: 72, size: 9, hidden: true },
    { id: 'ball2', emoji: '👁️', x: 128, y: 73, size: 7, hidden: true },
    { id: 'astro', emoji: 'hero:astronaut/idle', x: 24, y: 71, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 太空人「咚」地降落，眼珠球冒出來盯著他
    { at: 0, actor: 'astro', do: 'enter', from: { x: 24, y: -15 }, dur: 0.6, ease: 'bounce' },
    { at: 0.6, actor: 'astro', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 0.5, actor: 'ball', do: 'pop', dur: 0.3 },
    { at: 0.9, actor: 'ball', do: 'flash', dur: 0.3 },
    { at: 1.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 1.0, actor: 'astro', do: 'hop', amount: 4, dur: 0.3 },
    // 眼珠溜走，太空人追上去，跑出一道紫色滑痕
    { at: 1.4, actor: 'ball', do: 'moveTo', to: { x: 148, y: 72 }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 1.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 1.55, actor: 'astro', do: 'moveTo', to: { x: 116, y: 71 }, dur: 0.5, anticipate: 3, ease: 'in' },
    { at: 1.95, actor: 'skid', do: 'pop', dur: 0.25 },
    // 眼珠從他頭上彈回去，他轉身——腳離地了
    { at: 2.0, actor: 'ball', do: 'moveTo', to: { x: 40, y: 72 }, arc: 24, dur: 0.6 },
    { at: 2.1, actor: 'astro', do: 'flip' },
    { at: 2.2, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 2.2, actor: 'astro', do: 'moveTo', to: { x: 80, y: 22 }, dur: 0.8, ease: 'out' },
    { at: 2.3, actor: 'astro', do: 'tilt', amount: 12, dur: 0.35 },
    { at: 2.65, actor: 'astro', do: 'tilt', amount: -12, dur: 0.35 },
    // 頭盔撞天花板
    { at: 3.0, actor: 'astro', do: 'moveTo', to: { x: 80, y: 15 }, dur: 0.12, ease: 'in' },
    { at: 3.12, actor: 'astro', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 3.15, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 3.4, actor: 'astro', do: 'moveTo', to: { x: 76, y: 71 }, dur: 0.45, ease: 'bounce' },
    // 眼珠從他鼻子前彈過去，瞳孔轉圈
    { at: 3.95, actor: 'ball', do: 'moveTo', to: { x: 104, y: 72 }, arc: 12, dur: 0.45 },
    { at: 3.95, actor: 'ball', do: 'spin', times: 2, dur: 0.45 },
    // 瞇眼、蓄力、飛撲！
    { at: 4.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/idle' },
    { at: 4.5, actor: 'astro', do: 'flip' },
    { at: 4.6, actor: 'astro', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 5.0, actor: 'astro', do: 'moveTo', to: { x: 102, y: 70 }, arc: 16, dur: 0.4, ease: 'in' },
    { at: 5.4, actor: 'astro', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 5.45, actor: 'ball', do: 'vanish', dur: 0.15 },
    { at: 5.55, actor: 'skid', do: 'vanish', dur: 0.2 },
    // 滾到右下角坐好
    { at: 5.7, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/dizzy' },
    { at: 5.7, actor: 'astro', do: 'moveTo', to: { x: 136, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 5.7, actor: 'astro', do: 'spin', times: 1, dur: 0.5 },
    // 拍拍頭盔，大眼睛睜得好大
    { at: 7.0, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 7.0, actor: 'astro', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 7.3, actor: 'astro', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 7.6, actor: 'astro', do: 'tilt', amount: -10, dur: 0.3 },
    // 回馬槍：又飄起來，屁股下冒出另一顆眼珠對他眨眼
    { at: 8.1, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/float' },
    { at: 8.1, actor: 'astro', do: 'moveTo', to: { x: 136, y: 54 }, dur: 0.5, ease: 'out' },
    { at: 8.4, actor: 'ball2', do: 'pop', dur: 0.3 },
    { at: 8.75, actor: 'ball2', do: 'flash', dur: 0.3 },
    { at: 8.9, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/surprised' },
    { at: 9.1, actor: 'astro', do: 'moveTo', to: { x: 136, y: 71 }, dur: 0.4, ease: 'bounce' },
    { at: 9.1, actor: 'ball2', do: 'moveTo', to: { x: 150, y: 73 }, arc: 8, dur: 0.35 },
    { at: 9.5, actor: 'astro', do: 'swap', emoji: 'hero:astronaut/happy' },
  ],
  builds: [
    // 壓扁的眼珠 → 目；被震起來的紫色滑痕 → 艮
    { at: 5.45, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'ball', color: '#9775FA' },
    { at: 5.6, dur: 0.8, strokes: [5, 6, 7, 8, 9, 10], from: 'skid', color: '#E599F7' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'puff', actor: 'astro', dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'astro', emoji: '❗', dur: 0.5 },
    { at: 1.7, kind: 'puff', actor: 'astro', dur: 0.4 },
    { at: 2.4, kind: 'sweat', actor: 'astro' },
    { at: 3.12, kind: 'burst', actor: 'astro', n: 1, dy: 6, dur: 0.4 },
    { at: 3.85, kind: 'dizzy', actor: 'astro', dur: 0.7 },
    { at: 3.85, kind: 'puff', actor: 'astro', dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'ball', emoji: '😜', dur: 0.5 },
    { at: 4.6, kind: 'pop', actor: 'astro', emoji: '😠', dur: 0.4 },
    { at: 5.4, kind: 'burst', actor: 'astro', emoji: '⭐', n: 6, dur: 0.6 },
    { at: 6.2, kind: 'dizzy', actor: 'astro', dur: 0.8 },
    { at: 7.05, kind: 'pop', actor: 'astro', emoji: '👀', dur: 0.8 },
    { at: 8.8, kind: 'pop', actor: 'ball2', emoji: '😉', dur: 0.5 },
    { at: 9.0, kind: 'pop', actor: 'astro', emoji: '❗', dur: 0.4 },
  ],
  camera: [
    { at: 1.55, dur: 0.3, do: 'follow', actor: 'astro', amount: 1.3 },
    { at: 2.2, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 4.6, dur: 0.4, do: 'zoom', amount: 1.25, actor: 'astro' },
    { at: 5.2, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.4, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.6, sfx: 'plop' },
    { at: 1.05, say: '眼' },
    { at: 1.55, sfx: 'whoosh' },
    { at: 2.2, sfx: 'bubble' },
    { at: 3.12, sfx: 'boing' },
    { at: 3.8, sfx: 'bonk' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 5.4, sfx: 'splash' },
    { at: 6.45, say: '眼' },
    { at: 7.05, say: '眼睛' },
    { at: 8.75, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
