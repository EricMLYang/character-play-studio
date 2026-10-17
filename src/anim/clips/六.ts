import type { Clip } from '../clip'

// 六：布忍者舉著一片葉子站在消防車雲梯上，以為自己隱形了，想偷偷飛去敲金鈴。跳板蹦一下沒動，水管一噴把他彈飛——差一點點搆到鈴，
// 咚一聲撞牆、倒栽進水桶。煙霧彈、腰帶和兩隻草鞋掉下來排成「六」，口袋裡再滾出六顆小煙霧彈；最後他戴著水桶又舉起葉子「隱形」，水管又把他淋濕。六、六、六個
const clip: Clip = {
  char: '六',
  meta: { theme: '忍者偷敲鈴', cast: '布忍者＋消防車＋金鈴＋水桶＋煙霧彈', gags: ['葉子遮臉以為隱形', '水管把跳板彈飛撞牆', '倒栽水桶當帽子'] },
  duration: 10,
  bg: { top: '#FFF4C2', bottom: '#FFF9E3', floor: '#B7E4C7', scenery: 'city' },
  actors: [
    { id: 'truck', emoji: '🚒', x: 20, y: 67.8, size: 22, flip: true },
    { id: 'bell', emoji: '🔔', x: 140, y: 16, size: 9, float: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 26, y: 51, size: 13, flip: true },
    { id: 'leaf', emoji: '🍃', x: 29, y: 49, size: 6, float: true },
    { id: 'bucket', emoji: '🪣', x: 146, y: 71.5, size: 12 },
    { id: 'b1', emoji: '⚫', x: 114, y: 74, size: 4.5, hidden: true },
    { id: 'b2', emoji: '⚫', x: 118.5, y: 74, size: 4.5, hidden: true },
    { id: 'b3', emoji: '⚫', x: 123, y: 74, size: 4.5, hidden: true },
    { id: 'b4', emoji: '⚫', x: 127.5, y: 74, size: 4.5, hidden: true },
    { id: 'b5', emoji: '⚫', x: 132, y: 74, size: 4.5, hidden: true },
    { id: 'b6', emoji: '⚫', x: 136.5, y: 74, size: 4.5, hidden: true },
  ],
  moves: [
    // 葉子後面偷看，指著金鈴
    { at: 0.3, actor: 'leaf', do: 'moveTo', to: { x: 33, y: 50 }, dur: 0.3 },
    { at: 0.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 0.6, actor: 'ninja', do: 'hop', amount: 2, dur: 0.25 },
    { at: 1.0, actor: 'leaf', do: 'moveTo', to: { x: 29, y: 49 }, dur: 0.2 },
    { at: 1.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    // 跳板蹦一下，蹦不起來
    { at: 1.2, actor: 'ninja', do: 'squash', amount: 0.35, dur: 0.2 },
    { at: 1.4, actor: 'ninja', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.4, actor: 'leaf', do: 'hop', amount: 3, dur: 0.3 },
    // 水管亂噴，跳板把他彈飛
    { at: 1.7, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 1.85, actor: 'leaf', do: 'vanish', dur: 0.2 },
    { at: 1.85, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 1.85, actor: 'ninja', do: 'moveTo', to: { x: 130, y: 22 }, dur: 0.85, arc: 22, ease: 'out' },
    { at: 1.85, actor: 'ninja', do: 'spin', times: 1, dur: 0.85 },
    { at: 2.6, actor: 'bell', do: 'tilt', amount: 20, dur: 0.4 },
    // 咚！撞牆
    { at: 2.75, actor: 'ninja', do: 'moveTo', to: { x: 151, y: 36 }, dur: 0.2, ease: 'in' },
    { at: 2.95, actor: 'ninja', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 2.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    // 滑下來，倒栽進水桶，腳在外面亂踢
    { at: 3.3, actor: 'ninja', do: 'moveTo', to: { x: 146, y: 51.5 }, dur: 0.35, ease: 'in' },
    { at: 3.3, actor: 'ninja', do: 'rotateTo', amount: 180, dur: 0.35 },
    { at: 3.65, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.9, actor: 'ninja', do: 'shake', amount: 1, dur: 0.7 },
    { at: 4.6, actor: 'bucket', do: 'shake', amount: 0.8, dur: 0.4 },
    // 口袋滾出六顆煙霧彈
    { at: 5.4, actor: 'b6', do: 'enter', from: { x: 146, y: 70 }, dur: 0.3, arc: 4 },
    { at: 5.55, actor: 'b5', do: 'enter', from: { x: 146, y: 70 }, dur: 0.35, arc: 4 },
    { at: 5.7, actor: 'b4', do: 'enter', from: { x: 146, y: 70 }, dur: 0.4, arc: 4 },
    { at: 5.85, actor: 'b3', do: 'enter', from: { x: 146, y: 70 }, dur: 0.45, arc: 4 },
    { at: 6.0, actor: 'b2', do: 'enter', from: { x: 146, y: 70 }, dur: 0.5, arc: 4 },
    { at: 6.15, actor: 'b1', do: 'enter', from: { x: 146, y: 70 }, dur: 0.55, arc: 4 },
    { at: 6.9, actor: 'ninja', do: 'shake', amount: 1, dur: 0.5 },
    // 翻出水桶，把水桶當帽子，又舉起葉子「隱形」
    { at: 7.5, actor: 'ninja', do: 'rotateTo', amount: -180, dur: 0.35 },
    { at: 7.5, actor: 'ninja', do: 'moveTo', to: { x: 148, y: 71.5 }, dur: 0.35, arc: 8 },
    { at: 7.5, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.5, actor: 'bucket', do: 'moveTo', to: { x: 148, y: 62 }, dur: 0.35, arc: 8 },
    { at: 7.5, actor: 'bucket', do: 'rotateTo', amount: 180, dur: 0.35 },
    { at: 7.85, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 8.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.3, actor: 'leaf', do: 'moveTo', to: { x: 145, y: 69 }, dur: 0.01 },
    { at: 8.3, actor: 'leaf', do: 'pop' },
    // 水管又噴一下——隱形的忍者被淋濕
    { at: 8.7, actor: 'truck', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 8.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 8.9, actor: 'ninja', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.9, actor: 'bucket', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.9, actor: 'leaf', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 煙霧彈 → 點；腰帶 → 長橫；兩隻草鞋 → 下面兩點
    { at: 2.0, dur: 0.45, strokes: [0], from: 'ninja', color: '#F25C1F' },
    { at: 3.35, dur: 0.45, strokes: [1], from: 'ninja', color: '#F25C1F' },
    { at: 3.85, dur: 0.6, strokes: [2, 3], from: { x: 146, y: 56 }, style: 'drop', color: '#F25C1F' },
  ],
  glyph: [{ at: 4.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'ninja', emoji: '🔔', dx: 6, dur: 0.8 },
    { at: 1.6, kind: 'pop', actor: 'ninja', emoji: '😑', dur: 0.4 },
    { at: 1.7, kind: 'fountain', actor: 'truck', dx: 6, n: 10, dur: 0.8 },
    { at: 2.0, kind: 'puff', actor: 'ninja', dur: 0.4 },
    { at: 2.95, kind: 'burst', actor: 'ninja', dx: 2 },
    { at: 3.65, kind: 'puff', actor: 'bucket' },
    { at: 4.9, kind: 'pop', x: 140, y: 26, emoji: '🎵', dur: 0.5 },
    { at: 5.4, kind: 'puff', actor: 'bucket', dur: 0.9 },
    { at: 7.9, kind: 'pop', actor: 'ninja', emoji: '😎', dur: 0.5 },
    { at: 8.7, kind: 'fountain', actor: 'truck', dx: 6, n: 6, dur: 0.6 },
    { at: 9.0, kind: 'rain', actor: 'bucket', emoji: '💧', dur: 0.7 },
    { at: 9.2, kind: 'pop', actor: 'ninja', emoji: '😑', dur: 0.6 },
  ],
  camera: [
    { at: 1.85, dur: 0.3, do: 'follow', actor: 'ninja', amount: 1.3 },
    { at: 2.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 2.95, dur: 0.35, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.6, sfx: 'tap' },
    { at: 1.25, sfx: 'boing' },
    { at: 1.7, sfx: 'splash' },
    { at: 1.9, say: '六' },
    { at: 2.1, sfx: 'poof' },
    { at: 2.95, sfx: 'bonk' },
    { at: 3.65, sfx: 'plop' },
    { at: 4.5, say: '六' },
    { at: 4.95, sfx: 'clink' },
    { at: 5.7, say: '六個' },
    { at: 7.5, sfx: 'whoosh' },
    { at: 8.7, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
