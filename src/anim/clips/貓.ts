import type { Clip } from '../clip'

// 貓：忍者貓半夜躡手躡腳去偷狗狗旁邊的魚。狗一動，牠變成盆栽；狗一靠近，牠變成石頭——結果狗一屁股坐在石頭上。
// 丟煙霧彈閃人，煙變成「貓」。得意叼著魚擺姿勢……狗早就繞到牠背後，貓又變石頭，又被坐。貓、貓、貓咪
const clip: Clip = {
  char: '貓',
  meta: { theme: '忍者（貓）', cast: '黑貓忍者＋看門狗', gags: ['變裝露餡', '被一屁股坐扁', '煙霧彈閃人', '其實一直在你後面'] },
  duration: 10,
  bg: { top: '#1C2550', bottom: '#38477E', floor: '#2C3354', scenery: 'night' },
  actors: [
    { id: 'fish', emoji: '🐟', x: 112, y: 73.6, size: 8, hidden: true },
    { id: 'cat', emoji: '🐈‍⬛', x: 22, y: 72, size: 12, hidden: true, flip: true },
    { id: 'dog', emoji: '🐕', x: 132, y: 71.1, size: 14, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'pop' },
    { at: 0.2, actor: 'fish', do: 'pop' },
    // 躡手躡腳
    { at: 0, actor: 'cat', do: 'enter', from: { x: -12, y: 72 }, dur: 0.6 },
    { at: 0.7, actor: 'cat', do: 'moveTo', to: { x: 34, y: 72 }, dur: 0.35, arc: 2 },
    { at: 1.1, actor: 'cat', do: 'moveTo', to: { x: 46, y: 72 }, dur: 0.35, arc: 2 },
    { at: 1.45, actor: 'cat', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 1.6, actor: 'cat', do: 'moveTo', to: { x: 58, y: 72 }, dur: 0.3, arc: 2 },
    // 狗一動：變盆栽
    { at: 1.9, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
    { at: 2.05, actor: 'cat', do: 'swap', emoji: '🪴' },
    { at: 2.5, actor: 'cat', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 3.1, actor: 'cat', do: 'moveTo', to: { x: 72, y: 72 }, dur: 0.45 },
    // 狗走過來：變石頭——被一屁股坐下去
    { at: 3.6, actor: 'dog', do: 'hop', amount: 4, dur: 0.25 },
    { at: 3.7, actor: 'cat', do: 'swap', emoji: '🪨' },
    { at: 3.9, actor: 'dog', do: 'moveTo', to: { x: 74, y: 63 }, dur: 0.4, arc: 8 },
    { at: 4.3, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 4.3, actor: 'cat', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 4.7, actor: 'cat', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 4.85, actor: 'dog', do: 'moveTo', to: { x: 132, y: 71.1 }, dur: 0.4, arc: 14 },
    // 煙霧彈閃人，連魚一起帶走
    { at: 5.0, actor: 'cat', do: 'swap', emoji: '🐈‍⬛' },
    { at: 5.15, actor: 'cat', do: 'vanish', dur: 0.2 },
    { at: 5.2, actor: 'fish', do: 'vanish', dur: 0.2 },
    { at: 6.5, actor: 'cat', do: 'moveTo', to: { x: 30, y: 72 }, dur: 0 },
    { at: 6.5, actor: 'fish', do: 'moveTo', to: { x: 42, y: 73.6 }, dur: 0 },
    { at: 6.6, actor: 'cat', do: 'pop' },
    { at: 6.7, actor: 'fish', do: 'pop' },
    { at: 7.35, actor: 'cat', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 狗悄悄繞到背後
    { at: 6.9, actor: 'dog', do: 'moveTo', to: { x: 176, y: 71.1 }, dur: 0.5 },
    { at: 7.5, actor: 'dog', do: 'moveTo', to: { x: -15, y: 71.1 }, dur: 0 },
    { at: 7.5, actor: 'dog', do: 'flip' },
    { at: 7.6, actor: 'dog', do: 'moveTo', to: { x: 12, y: 71.1 }, dur: 0.6, arc: 2 },
    { at: 8.3, actor: 'cat', do: 'flip' },
    { at: 8.45, actor: 'cat', do: 'swap', emoji: '🪨' },
    { at: 8.7, actor: 'dog', do: 'moveTo', to: { x: 30, y: 63 }, dur: 0.35, arc: 6 },
    { at: 9.05, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.05, actor: 'cat', do: 'squash', amount: 0.45, dur: 0.35 },
  ],
  builds: [
    // 煙霧彈的煙 → 豸；煙裡掉下來的飛鏢 → 苗
    { at: 5.15, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'cat', color: '#FFD25A' },
    { at: 5.7, dur: 0.8, strokes: [7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'cat', style: 'drop', color: '#7FE3C4' },
  ],
  glyph: [{ at: 6.5, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'dog', dur: 1.8 },
    { at: 0.6, kind: 'bubble', actor: 'cat', emoji: '🐟', dur: 0.7 },
    { at: 1.85, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.3 },
    { at: 2.0, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
    { at: 2.2, kind: 'bubble', actor: 'dog', emoji: '❓', dur: 0.7 },
    { at: 3.0, kind: 'zzz', actor: 'dog', dur: 0.6 },
    { at: 3.6, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.3 },
    { at: 3.65, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
    { at: 4.45, kind: 'bubble', actor: 'dog', emoji: '😌', dur: 0.4 },
    { at: 4.7, kind: 'sweat', actor: 'cat' },
    { at: 4.8, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
    { at: 5.1, kind: 'burst', actor: 'cat', emoji: '💨', n: 8, dur: 0.7 },
    { at: 6.6, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
    { at: 7.3, kind: 'bubble', actor: 'cat', emoji: '😼', dur: 0.8 },
    { at: 8.3, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.3 },
    { at: 8.4, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
    { at: 9.2, kind: 'bubble', actor: 'dog', emoji: '😌', dur: 0.7 },
    { at: 9.3, kind: 'sweat', actor: 'cat' },
  ],
  camera: [
    { at: 4.3, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 74, y: 64 } },
  ],
  cues: [
    { at: 0.7, sfx: 'tap' }, { at: 1.1, sfx: 'tap' },
    { at: 1.45, say: '貓' },
    { at: 2.05, sfx: 'poof' },
    { at: 3.1, sfx: 'slide' },
    { at: 3.7, sfx: 'poof' },
    { at: 4.3, sfx: 'plop' },
    { at: 4.85, sfx: 'boing' },
    { at: 5.1, sfx: 'poof' },
    { at: 6.45, say: '貓' },
    { at: 7.45, say: '貓咪' },
    { at: 8.45, sfx: 'poof' },
    { at: 9.05, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
