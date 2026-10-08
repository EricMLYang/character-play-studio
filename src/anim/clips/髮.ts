import type { Clip } from '../clip'

// 髮：光頭科學家拿氣球在頭上磨，想讓頭髮靜電豎起來——可是他沒有頭髮。改磨貓：貓咪炸成一大顆毛球，被氣球黏著飄上天，
// 「啪」一道靜電電到科學家，貓毛飛成「髮」。再磨一次頭，竟然長出頭髮了！得意不到一秒，氣球破掉，頭髮也跟著不見。髮、髮、頭髮
const clip: Clip = {
  char: '髮',
  meta: { theme: '靜電科學', cast: '光頭科學家＋貓＋氣球', gags: ['光頭磨不出頭髮', '貓炸毛', '被氣球黏上天', '頭髮只長一下下'] },
  duration: 10,
  bg: { top: '#E7E2FF', bottom: '#F6F1FF', floor: '#B7A5D8', scenery: 'room' },
  actors: [
    { id: 'cat', emoji: '🐈', x: 72, y: 71.1, size: 14, hidden: true },
    { id: 'sci', emoji: '🧑‍🦲', x: 26, y: 70.3, size: 16, hidden: true },
    { id: 'balloon', emoji: '🎈', x: 40, y: 50, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'sci', do: 'enter', from: { x: -12, y: 70.3 }, dur: 0.6 },
    { at: 0.3, actor: 'balloon', do: 'pop' },
    { at: 0.4, actor: 'cat', do: 'pop' },
    // 在光頭上磨：什麼都沒有
    { at: 1.1, actor: 'balloon', do: 'moveTo', to: { x: 28, y: 56 }, dur: 0.3 },
    { at: 1.4, actor: 'balloon', do: 'shake', dur: 0.8, amount: 2 },
    { at: 2.2, actor: 'balloon', do: 'moveTo', to: { x: 40, y: 50 }, dur: 0.3 },
    // 改磨貓：炸毛
    { at: 2.7, actor: 'sci', do: 'moveTo', to: { x: 54, y: 70.3 }, dur: 0.4 },
    { at: 2.8, actor: 'balloon', do: 'moveTo', to: { x: 72, y: 60 }, dur: 0.4 },
    { at: 3.2, actor: 'balloon', do: 'shake', dur: 0.7, amount: 2 },
    { at: 3.9, actor: 'cat', do: 'scaleTo', amount: 1.5, dur: 0.25 },
    { at: 3.9, actor: 'cat', do: 'moveTo', to: { x: 72, y: 68.2 }, dur: 0.25 },
    { at: 3.9, actor: 'cat', do: 'flash', dur: 0.5 },
    // 被氣球黏著飄上天
    { at: 4.3, actor: 'balloon', do: 'moveTo', to: { x: 80, y: 26 }, dur: 0.8 },
    { at: 4.3, actor: 'cat', do: 'moveTo', to: { x: 80, y: 40 }, dur: 0.8 },
    { at: 4.6, actor: 'sci', do: 'hop', dur: 0.4, amount: 8 },
    // 啪！靜電
    { at: 5.2, actor: 'sci', do: 'flash', dur: 0.5 },
    { at: 5.2, actor: 'sci', do: 'shake', dur: 0.5, amount: 1.5 },
    { at: 5.3, actor: 'cat', do: 'scaleTo', amount: 0.667, dur: 0.3 },
    { at: 5.6, actor: 'cat', do: 'moveTo', to: { x: 130, y: 71.1 }, dur: 0.5, arc: 10 },
    { at: 5.6, actor: 'balloon', do: 'moveTo', to: { x: 42, y: 46 }, dur: 0.5 },
    { at: 5.7, actor: 'sci', do: 'moveTo', to: { x: 26, y: 70.3 }, dur: 0.4 },
    // 再磨一次：長頭髮了！
    { at: 7.0, actor: 'balloon', do: 'moveTo', to: { x: 28, y: 56 }, dur: 0.3 },
    { at: 7.3, actor: 'balloon', do: 'shake', dur: 0.5, amount: 2 },
    { at: 7.8, actor: 'sci', do: 'swap', emoji: '👨‍🦱' },
    { at: 7.8, actor: 'sci', do: 'flash', dur: 0.4 },
    { at: 7.8, actor: 'balloon', do: 'moveTo', to: { x: 40, y: 48 }, dur: 0.3 },
    { at: 8.1, actor: 'sci', do: 'bounce', dur: 0.5, times: 2, amount: 2 },
    // 回馬槍：氣球破掉，頭髮也不見
    { at: 8.7, actor: 'balloon', do: 'vanish', dur: 0.1 },
    { at: 9.0, actor: 'sci', do: 'swap', emoji: '🧑‍🦲' },
    { at: 9.0, actor: 'sci', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.1, actor: 'cat', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 貓毛飛出去 → 髟；靜電火花 → 犮
    { at: 5.2, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], from: 'cat', color: '#E8772E' },
    { at: 5.7, dur: 0.6, strokes: [10, 11, 12, 13, 14], from: { x: 54, y: 60 }, color: '#8E5BD6' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'zzz', actor: 'cat', dur: 2.2 },
    { at: 0.8, kind: 'bubble', actor: 'sci', emoji: '💡', dur: 0.5 },
    { at: 1.4, kind: 'burst', actor: 'sci', emoji: '⚡', n: 4, dur: 0.6 },
    { at: 2.3, kind: 'bubble', actor: 'sci', emoji: '❓', dur: 0.6 },
    { at: 3.9, kind: 'burst', actor: 'cat', emoji: '⚡', n: 6, dur: 0.5 },
    { at: 3.95, kind: 'pop', actor: 'cat', emoji: '🙀', dur: 0.5 },
    { at: 4.6, kind: 'sweat', actor: 'sci' },
    { at: 5.15, kind: 'zap', actor: 'cat', target: 'sci', dur: 0.35 },
    { at: 5.3, kind: 'burst', actor: 'sci', dur: 0.4 },
    { at: 7.8, kind: 'burst', actor: 'sci', emoji: '⚡', n: 6, dur: 0.5 },
    { at: 8.2, kind: 'bubble', actor: 'sci', emoji: '😎', dur: 0.5 },
    { at: 8.7, kind: 'burst', x: 40, y: 48, dur: 0.4 },
    { at: 9.1, kind: 'bubble', actor: 'sci', emoji: '😭', dur: 0.6 },
    { at: 9.1, kind: 'pop', actor: 'cat', emoji: '😹', dur: 0.8 },
  ],
  camera: [
    { at: 3.9, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 72, y: 62 } },
    { at: 5.2, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.4, sfx: 'slide' },
    { at: 1.5, say: '髮' },
    { at: 3.2, sfx: 'slide' },
    { at: 3.9, sfx: 'poof' },
    { at: 4.3, sfx: 'whoosh' },
    { at: 5.2, sfx: 'crack' },
    { at: 6.35, say: '髮' },
    { at: 7.3, sfx: 'slide' },
    { at: 7.8, sfx: 'boing' },
    { at: 7.9, say: '頭髮' },
    { at: 8.7, sfx: 'bonk' },
    { at: 9.0, sfx: 'deflate' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
