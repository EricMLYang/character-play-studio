import type { Clip } from '../clip'

// 筆：鉛筆在太空裡畫畫，畫的東西都會活過來。畫一顆星星，星星眨眨眼飛走了；畫一隻大恐龍——恐龍活過來大吼，追著鉛筆跑！
// 鉛筆倒過來用橡皮擦把恐龍擦掉，擦屑和筆跡變成「筆」。最後牠想畫個可愛的小雞當朋友，小雞一出殼也大吼，鉛筆嚇得逃走。筆、筆、鉛筆
const clip: Clip = {
  char: '筆',
  meta: { theme: '塗鴉活過來', cast: '鉛筆＋畫出來的恐龍＋小雞', gags: ['畫的東西活過來', '被自己的畫追', '用橡皮擦擦掉', '可愛的也會吼'] },
  duration: 10,
  bg: { top: '#1B1440', bottom: '#3B2A6B', floor: '#5A4A8A', scenery: 'space' },
  actors: [
    { id: 'sketchStar', emoji: '⭐', x: 28, y: 52, size: 9, hidden: true, float: true, tint: 'grayscale(1) brightness(1.6) opacity(.75)' },
    { id: 'star', emoji: '⭐', x: 28, y: 52, size: 9, hidden: true, float: true },
    { id: 'sketchDino', emoji: '🦖', x: 104, y: 67.8, size: 22, hidden: true, tint: 'grayscale(1) brightness(1.6) opacity(.75)' },
    { id: 'dino', emoji: '🦖', x: 104, y: 67.8, size: 22, hidden: true },
    { id: 'sketchChick', emoji: '🐣', x: 22, y: 73.2, size: 9, hidden: true, tint: 'grayscale(1) brightness(1.6) opacity(.75)' },
    { id: 'chick', emoji: '🐣', x: 22, y: 73.2, size: 9, hidden: true },
    { id: 'pencil', emoji: '✏️', x: 40, y: 34, size: 12, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'pencil', do: 'enter', from: { x: -10, y: 30 }, dur: 0.7 },
    { at: 0, actor: 'pencil', do: 'spin', dur: 0.7 },
    // 畫星星：星星活過來飛走
    { at: 0.8, actor: 'pencil', do: 'moveTo', to: { x: 34, y: 46 }, dur: 0.2 },
    { at: 1.0, actor: 'pencil', do: 'shake', amount: 3, dur: 0.5 },
    { at: 1.2, actor: 'sketchStar', do: 'pop' },
    { at: 1.6, actor: 'sketchStar', do: 'vanish', dur: 0.1 },
    { at: 1.6, actor: 'star', do: 'pop' },
    { at: 1.6, actor: 'star', do: 'flash', dur: 0.4 },
    { at: 2.0, actor: 'star', do: 'moveTo', to: { x: 16, y: 14 }, dur: 0.5, arc: 4 },
    { at: 2.0, actor: 'star', do: 'spin', dur: 0.5 },
    // 畫一隻大恐龍
    { at: 2.2, actor: 'pencil', do: 'moveTo', to: { x: 108, y: 54 }, dur: 0.3 },
    { at: 2.5, actor: 'pencil', do: 'shake', amount: 4, dur: 0.7 },
    { at: 2.6, actor: 'sketchDino', do: 'pop', dur: 0.5 },
    { at: 3.3, actor: 'sketchDino', do: 'vanish', dur: 0.1 },
    { at: 3.3, actor: 'dino', do: 'pop', dur: 0.2 },
    { at: 3.5, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.4 },
    // 恐龍追鉛筆
    { at: 3.8, actor: 'pencil', do: 'moveTo', to: { x: 22, y: 30 }, dur: 0.4, arc: 6 },
    { at: 3.9, actor: 'dino', do: 'moveTo', to: { x: 58, y: 67.8 }, dur: 0.5 },
    { at: 3.9, actor: 'dino', do: 'bounce', amount: 3, times: 3, dur: 0.5 },
    // 倒過來用橡皮擦擦
    { at: 4.35, actor: 'pencil', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 4.7, actor: 'pencil', do: 'moveTo', to: { x: 58, y: 54 }, dur: 0.25 },
    { at: 4.95, actor: 'pencil', do: 'shake', amount: 3, dur: 0.5 },
    { at: 4.95, actor: 'dino', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.95, actor: 'dino', do: 'scaleTo', amount: 0.4, dur: 0.45 },
    { at: 5.4, actor: 'dino', do: 'vanish', dur: 0.2 },
    // 用筆尖畫出聿
    { at: 5.6, actor: 'pencil', do: 'rotateTo', amount: -180, dur: 0.25 },
    { at: 5.9, actor: 'pencil', do: 'shake', amount: 2, dur: 0.6 },
    { at: 6.5, actor: 'pencil', do: 'moveTo', to: { x: 30, y: 40 }, dur: 0.3 },
    // 得意
    { at: 7.45, actor: 'pencil', do: 'hop', amount: 6, dur: 0.4 },
    { at: 7.45, actor: 'pencil', do: 'flash', dur: 0.6 },
    // 畫小雞當朋友——小雞也吼
    { at: 8.1, actor: 'pencil', do: 'moveTo', to: { x: 30, y: 60 }, dur: 0.2 },
    { at: 8.3, actor: 'pencil', do: 'shake', amount: 2.5, dur: 0.4 },
    { at: 8.4, actor: 'sketchChick', do: 'pop' },
    { at: 8.75, actor: 'sketchChick', do: 'vanish', dur: 0.1 },
    { at: 8.75, actor: 'chick', do: 'pop' },
    { at: 9.0, actor: 'chick', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 9.05, actor: 'pencil', do: 'moveTo', to: { x: 14, y: 22 }, dur: 0.4, arc: 6 },
    { at: 9.05, actor: 'pencil', do: 'spin', dur: 0.4 },
    { at: 9.3, actor: 'star', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
  ],
  builds: [
    // 恐龍的橡皮擦屑 → 竹；鉛筆畫出來的線 → 聿
    { at: 5.4, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'dino', color: '#FF8FB1' },
    { at: 5.9, dur: 0.7, strokes: [6, 7, 8, 9, 10, 11], from: 'pencil', color: '#FFD23F' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 1.75, kind: 'burst', actor: 'star', emoji: '✨', n: 5, dur: 0.5 },
    { at: 1.85, kind: 'pop', actor: 'pencil', emoji: '😲', dur: 0.4 },
    { at: 3.1, kind: 'bubble', actor: 'pencil', emoji: '😎', dur: 0.4 },
    { at: 3.5, kind: 'burst', actor: 'dino', emoji: '💢', n: 1, dur: 0.4, dx: -8 },
    { at: 3.55, kind: 'pop', actor: 'pencil', emoji: '❗', dur: 0.3 },
    { at: 4.2, kind: 'sweat', actor: 'pencil' },
    { at: 5.0, kind: 'burst', actor: 'dino', emoji: '💨', n: 6, dur: 0.5 },
    { at: 7.45, kind: 'burst', actor: 'pencil', emoji: '✨', n: 6, dur: 0.5 },
    { at: 8.85, kind: 'burst', actor: 'chick', emoji: '✨', n: 4, dur: 0.4 },
    { at: 9.0, kind: 'burst', actor: 'chick', emoji: '💢', n: 1, dur: 0.4 },
    { at: 9.05, kind: 'pop', actor: 'pencil', emoji: '😱', dur: 0.6 },
    { at: 9.4, kind: 'sweat', actor: 'pencil' },
  ],
  camera: [
    { at: 3.5, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 104, y: 60 } },
    { at: 3.55, dur: 0.4, do: 'shake', amount: 1.5 },
    { at: 9.0, dur: 0.3, do: 'shake', amount: 0.8 },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 1.25, say: '筆' },
    { at: 1.6, sfx: 'blip' },
    { at: 2.5, sfx: 'tap' }, { at: 2.8, sfx: 'tap' },
    { at: 3.5, sfx: 'rumble' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 4.95, sfx: 'slide' },
    { at: 5.4, sfx: 'poof' },
    { at: 6.6, say: '筆' },
    { at: 7.55, say: '鉛筆' },
    { at: 8.75, sfx: 'blip' },
    { at: 9.0, sfx: 'rumble' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
