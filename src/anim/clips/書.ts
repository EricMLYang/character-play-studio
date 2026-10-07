import type { Clip } from '../clip'

// 書：外星人開飛碟來地球想抓一本書回去研究，光束先吸到一頭牛（吐回來），再吸到一個馬桶（噁心地吐回來），
// 第三次終於吸到書，書一打開，書頁飛出來拼成「書」。外星人下來背上書包好開心，結果光束沒關，把自己也吸上去了。書、書、書包
const clip: Clip = {
  char: '書',
  meta: { theme: '太空外星人', cast: '飛碟外星人＋牛', gags: ['吸錯東西', '吐回來', '終於成功', '把自己吸走'] },
  duration: 10,
  bg: { top: '#E7E2FF', bottom: '#D2CAF6', floor: '#BFE2BC' },
  actors: [
    { id: 'cow', emoji: '🐄', x: 36, y: 71.5, size: 13, hidden: true },
    { id: 'toilet', emoji: '🚽', x: 64, y: 72, size: 10, hidden: true },
    { id: 'book', emoji: '📖', x: 96, y: 73, size: 9, hidden: true },
    { id: 'alien', emoji: '👽', x: 136, y: 71, size: 12, hidden: true },
    { id: 'bag', emoji: '🎒', x: 124, y: 72.5, size: 8, hidden: true },
    { id: 'ufo', emoji: '🛸', x: 36, y: 22, size: 16, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cow', do: 'pop' }, { at: 0.1, actor: 'toilet', do: 'pop' }, { at: 0.2, actor: 'book', do: 'pop' },
    { at: 0, actor: 'ufo', do: 'enter', from: { x: -20, y: 6 }, dur: 0.8 },
    { at: 0.8, actor: 'ufo', do: 'bounce', dur: 0.8, times: 2, amount: 1.5 },
    // 第一次：吸到牛
    { at: 1.7, actor: 'cow', do: 'moveTo', to: { x: 36, y: 30 }, dur: 0.8 },
    { at: 1.7, actor: 'cow', do: 'spin', dur: 0.8 },
    { at: 2.5, actor: 'cow', do: 'vanish', dur: 0.1 },
    { at: 2.55, actor: 'ufo', do: 'shake', dur: 0.3, amount: 1.2 },
    { at: 2.85, actor: 'cow', do: 'pop', dur: 0.1 },
    { at: 2.85, actor: 'cow', do: 'moveTo', to: { x: 36, y: 71.5 }, dur: 0.35 },
    { at: 3.2, actor: 'cow', do: 'squash', amount: 0.4, dur: 0.3 },
    // 第二次：吸到馬桶
    { at: 3.4, actor: 'ufo', do: 'moveTo', to: { x: 64, y: 22 }, dur: 0.45 },
    { at: 3.9, actor: 'toilet', do: 'moveTo', to: { x: 64, y: 30 }, dur: 0.6 },
    { at: 4.5, actor: 'toilet', do: 'vanish', dur: 0.1 },
    { at: 4.55, actor: 'ufo', do: 'shake', dur: 0.4, amount: 1.5 },
    { at: 4.85, actor: 'toilet', do: 'pop', dur: 0.1 },
    { at: 4.85, actor: 'toilet', do: 'moveTo', to: { x: 14, y: 72 }, dur: 0.45, arc: 14 },
    { at: 4.85, actor: 'toilet', do: 'spin', dur: 0.45 },
    // 第三次：終於是書
    { at: 5.2, actor: 'ufo', do: 'moveTo', to: { x: 96, y: 20 }, dur: 0.4 },
    { at: 5.6, actor: 'book', do: 'moveTo', to: { x: 96, y: 36 }, dur: 0.5 },
    { at: 6.1, actor: 'book', do: 'vanish', dur: 0.15 },
    { at: 6.5, actor: 'ufo', do: 'moveTo', to: { x: 136, y: 18 }, dur: 0.5 },
    // 外星人下來，背上書包
    { at: 7.15, actor: 'alien', do: 'enter', from: { x: 136, y: 30 }, dur: 0.45 },
    { at: 7.85, actor: 'bag', do: 'pop' },
    { at: 8.05, actor: 'alien', do: 'hop', dur: 0.35, amount: 5 },
    { at: 8.05, actor: 'bag', do: 'hop', dur: 0.35, amount: 5 },
    // 光束忘了關
    { at: 8.8, actor: 'alien', do: 'moveTo', to: { x: 136, y: 24 }, dur: 0.6 },
    { at: 8.8, actor: 'alien', do: 'spin', dur: 0.6 },
    { at: 9.4, actor: 'alien', do: 'vanish', dur: 0.1 },
    { at: 9.5, actor: 'ufo', do: 'moveTo', to: { x: 185, y: 4 }, dur: 0.4 },
    { at: 9.55, actor: 'cow', do: 'bounce', dur: 0.45, times: 2, amount: 2 },
  ],
  builds: [
    // 書打開，書頁飛出來
    { at: 6.1, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5], from: 'book', color: '#3F6FD8' },
    { at: 6.6, dur: 0.6, strokes: [6, 7, 8, 9], from: 'book', color: '#E2802A' },
  ],
  glyph: [{ at: 7.3, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'ufo', emoji: '📖', dur: 0.9, dx: 4, dy: 8 },
    { at: 1.6, kind: 'beam', actor: 'ufo', n: 18, dur: 1.0 },
    { at: 3.2, kind: 'bubble', actor: 'cow', emoji: '😑', dur: 0.8 },
    { at: 3.8, kind: 'beam', actor: 'ufo', n: 18, dur: 0.8 },
    { at: 4.6, kind: 'pop', actor: 'ufo', emoji: '🤢', dur: 0.6, dx: 8, dy: 8 },
    { at: 5.5, kind: 'beam', actor: 'ufo', n: 16, dur: 0.7 },
    { at: 6.1, kind: 'burst', x: 96, y: 36, emoji: '📄', n: 6, dur: 0.6 },
    { at: 7.05, kind: 'beam', actor: 'ufo', n: 14, dur: 0.6 },
    { at: 8.1, kind: 'burst', actor: 'alien', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.7, kind: 'beam', actor: 'ufo', n: 14, dur: 0.8 },
    { at: 8.8, kind: 'pop', actor: 'alien', emoji: '❗', dur: 0.4 },
    { at: 9.55, kind: 'pop', actor: 'cow', emoji: '😆', dur: 0.45 },
  ],
  camera: [
    { at: 4.55, dur: 0.7, do: 'punch', amount: 0.2, to: { x: 64, y: 30 } },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.15, say: '書' },
    { at: 1.7, sfx: 'slide' },
    { at: 2.85, sfx: 'poof' }, { at: 3.2, sfx: 'bonk' },
    { at: 3.9, sfx: 'slide' },
    { at: 4.85, sfx: 'poof' }, { at: 5.3, sfx: 'bonk' },
    { at: 5.6, sfx: 'slide' },
    { at: 6.1, sfx: 'poof' },
    { at: 7.2, say: '書' },
    { at: 7.9, say: '書包' },
    { at: 8.8, sfx: 'slide' },
    { at: 9.5, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
