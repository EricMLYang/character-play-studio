import type { Clip } from '../clip'

// 貓：忍者貓半夜躡手躡腳去偷狗狗旁邊的魚。狗一醒，牠「噗」變成石頭——結果狗走過來一屁股坐在石頭上。
// 丟煙霧彈閃人，煙變成「貓」。得意叼著魚……狗早就繞到牠背後，貓又變石頭，又被坐。貓、貓、貓咪
const clip: Clip = {
  char: '貓',
  meta: { theme: '忍者（貓）', cast: '黑貓忍者＋看門狗', gags: ['變裝露餡', '被一屁股坐扁', '煙霧彈閃人', '其實一直在你後面'] },
  duration: 10,
  bg: { top: '#1C2550', bottom: '#38477E', floor: '#2C3354', scenery: 'night' },
  actors: [
    { id: 'fish', emoji: '🐟', x: 114, y: 72, size: 11, hidden: true },
    { id: 'cat', emoji: '🐈‍⬛', x: 22, y: 70.5, size: 15, hidden: true, flip: true },
    { id: 'dog', emoji: '🐕', x: 134, y: 69.5, size: 18, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dog', do: 'pop' },
    { at: 0.2, actor: 'fish', do: 'pop' },
    // 躡手躡腳，一步、一步、一步
    { at: 0, actor: 'cat', do: 'enter', from: { x: -12, y: 70.5 }, dur: 0.7 },
    { at: 1.2, actor: 'cat', do: 'squash', amount: -0.25, dur: 0.35 },
    { at: 1.7, actor: 'cat', do: 'moveTo', to: { x: 36, y: 70.5 }, dur: 0.4, arc: 2 },
    { at: 2.2, actor: 'cat', do: 'moveTo', to: { x: 50, y: 70.5 }, dur: 0.4, arc: 2 },
    { at: 2.7, actor: 'cat', do: 'moveTo', to: { x: 64, y: 70.5 }, dur: 0.4, arc: 2 },
    // 狗醒了：變石頭——被一屁股坐下去
    { at: 3.2, actor: 'dog', do: 'hop', amount: 4, dur: 0.3 },
    { at: 3.3, actor: 'cat', do: 'swap', emoji: '🪨' },
    { at: 3.9, actor: 'dog', do: 'moveTo', to: { x: 66, y: 60 }, dur: 0.5, arc: 8 },
    { at: 4.4, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: 4.4, actor: 'cat', do: 'squash', amount: 0.45, dur: 0.4 },
    { at: 5.0, actor: 'cat', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 5.4, actor: 'dog', do: 'moveTo', to: { x: 134, y: 69.5 }, dur: 0.5, arc: 14 },
    // 煙霧彈閃人，連魚一起帶走
    { at: 5.6, actor: 'cat', do: 'swap', emoji: '🐈‍⬛' },
    { at: 5.7, actor: 'cat', do: 'vanish', dur: 0.2 },
    { at: 5.75, actor: 'fish', do: 'vanish', dur: 0.2 },
    { at: 7.1, actor: 'cat', do: 'moveTo', to: { x: 32, y: 70.5 }, dur: 0 },
    { at: 7.1, actor: 'fish', do: 'moveTo', to: { x: 44, y: 72 }, dur: 0 },
    { at: 7.2, actor: 'cat', do: 'pop' },
    { at: 7.3, actor: 'fish', do: 'pop' },
    { at: 8.0, actor: 'cat', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 狗早就繞到背後
    { at: 7.4, actor: 'dog', do: 'moveTo', to: { x: 180, y: 69.5 }, dur: 0.5 },
    { at: 7.95, actor: 'dog', do: 'moveTo', to: { x: -15, y: 69.5 }, dur: 0 },
    { at: 7.95, actor: 'dog', do: 'flip' },
    { at: 8.0, actor: 'dog', do: 'moveTo', to: { x: 12, y: 69.5 }, dur: 0.6, arc: 2 },
    { at: 8.7, actor: 'cat', do: 'flip' },
    { at: 8.85, actor: 'cat', do: 'swap', emoji: '🪨' },
    { at: 9.1, actor: 'dog', do: 'moveTo', to: { x: 32, y: 60 }, dur: 0.35, arc: 6 },
    { at: 9.45, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.45, actor: 'cat', do: 'squash', amount: 0.45, dur: 0.35 },
  ],
  builds: [
    // 煙霧彈的煙 → 豸；煙裡掉下來的飛鏢 → 苗
    { at: 5.7, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'cat', color: '#FFD25A' },
    { at: 6.2, dur: 0.8, strokes: [7, 8, 9, 10, 11, 12, 13, 14, 15], from: 'cat', style: 'drop', color: '#7FE3C4' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'dog', dur: 3.0 },
    { at: 0.6, kind: 'bubble', actor: 'cat', emoji: '🐟', dur: 0.9 },
    { at: 3.2, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.3 },
    { at: 3.25, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
    { at: 3.4, kind: 'bubble', actor: 'dog', emoji: '❓', dur: 0.7 },
    { at: 4.6, kind: 'bubble', actor: 'dog', emoji: '😌', dur: 0.7 },
    { at: 5.0, kind: 'sweat', actor: 'cat' },
    { at: 5.65, kind: 'burst', actor: 'cat', emoji: '💨', n: 8, dur: 0.7 },
    { at: 7.2, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
    { at: 7.6, kind: 'bubble', actor: 'cat', emoji: '😼', dur: 0.9 },
    { at: 8.7, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.3 },
    { at: 8.8, kind: 'burst', actor: 'cat', emoji: '💨', n: 6, dur: 0.4 },
  ],
  camera: [
    { at: 4.4, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 66, y: 62 } },
  ],
  cues: [
    { at: 1.7, sfx: 'tap' }, { at: 2.2, sfx: 'tap' }, { at: 2.7, sfx: 'tap' },
    { at: 1.25, say: '貓' },
    { at: 3.3, sfx: 'poof' },
    { at: 4.4, sfx: 'plop' },
    { at: 5.4, sfx: 'boing' },
    { at: 5.65, sfx: 'poof' },
    { at: 7.05, say: '貓' },
    { at: 8.05, say: '貓咪' },
    { at: 8.85, sfx: 'poof' },
    { at: 9.45, sfx: 'plop' },
    { at: 9.7, sfx: 'cheer' },
  ],
}

export default clip
