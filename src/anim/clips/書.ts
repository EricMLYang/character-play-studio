import type { Clip } from '../clip'

// 書：外星人開飛碟來地球想抓一本書回去研究，光束先吸到一頭牛（吐回來），再吸到一個馬桶（噁心地吐回來），
// 第三次終於吸到書，書一打開，書頁飛出來拼成「書」。外星人下來背上書包好開心，結果光束沒關，把自己也吸上去了。書、書、書包
const clip: Clip = {
  char: '書',
  meta: { theme: '太空外星人', cast: '飛碟外星人＋牛', gags: ['吸錯東西', '吐回來', '終於成功', '把自己吸走'] },
  duration: 10,
  bg: { top: '#E7E2FF', bottom: '#D2CAF6', floor: '#BFE2BC', scenery: 'space' },
  actors: [
    { id: 'cow', emoji: '🐄', x: 36, y: 70.2, size: 16.2, hidden: true },
    { id: 'toilet', emoji: '🚽', x: 64, y: 71, size: 12.5, hidden: true },
    { id: 'book', emoji: '📖', x: 96, y: 72.1, size: 11.2, hidden: true },
    { id: 'alien', emoji: '👽', x: 136, y: 69.7, size: 15, hidden: true },
    { id: 'bag', emoji: '🎒', x: 124, y: 71.7, size: 10, hidden: true },
    { id: 'ufo', emoji: '🛸', x: 36, y: 22, size: 20, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'cow', do: 'pop' }, { at: 0.1, actor: 'toilet', do: 'pop' }, { at: 0.2, actor: 'book', do: 'pop' },
    { at: 0, actor: 'ufo', do: 'enter', from: { x: -20, y: 6 }, dur: 0.8 },
    { at: 0.8, actor: 'ufo', do: 'bounce', dur: 0.8, times: 2, amount: 1.5 },
    // 第一次：吸到牛
    { at: 1.72, actor: 'cow', do: 'moveTo', to: { x: 36, y: 30 }, dur: 0.8 },
    { at: 1.72, actor: 'cow', do: 'spin', dur: 0.8 },
    { at: 2.55, actor: 'cow', do: 'vanish', dur: 0.1 },
    { at: 2.61, actor: 'ufo', do: 'shake', dur: 0.3, amount: 1.2 },
    { at: 2.92, actor: 'cow', do: 'pop', dur: 0.1 },
    { at: 2.92, actor: 'cow', do: 'moveTo', to: { x: 36, y: 70.2 }, dur: 0.35 },
    { at: 3.28, actor: 'cow', do: 'squash', amount: 0.4, dur: 0.3 },
    // 第二次：吸到馬桶
    { at: 3.49, actor: 'ufo', do: 'moveTo', to: { x: 64, y: 22 }, dur: 0.45 },
    { at: 4.01, actor: 'toilet', do: 'moveTo', to: { x: 64, y: 30 }, dur: 0.6 },
    { at: 4.63, actor: 'toilet', do: 'vanish', dur: 0.1 },
    { at: 4.69, actor: 'ufo', do: 'shake', dur: 0.4, amount: 1.5 },
    { at: 5, actor: 'toilet', do: 'pop', dur: 0.1 },
    { at: 5, actor: 'toilet', do: 'moveTo', to: { x: 14, y: 69.7 }, dur: 0.45, arc: 14 },
    { at: 5, actor: 'toilet', do: 'spin', dur: 0.45 },
    // 第三次：終於是書
    { at: 5.36, actor: 'ufo', do: 'moveTo', to: { x: 96, y: 20 }, dur: 0.4 },
    { at: 5.78, actor: 'book', do: 'moveTo', to: { x: 96, y: 36 }, dur: 0.5 },
    { at: 6.3, actor: 'book', do: 'vanish', dur: 0.15 },
    { at: 6.7, actor: 'ufo', do: 'moveTo', to: { x: 136, y: 18 }, dur: 0.5 },
    // 外星人下來，背上書包
    { at: 7.35, actor: 'alien', do: 'enter', from: { x: 136, y: 30 }, dur: 0.45 },
    { at: 8.08, actor: 'bag', do: 'pop' },
    { at: 8.29, actor: 'alien', do: 'hop', dur: 0.35, amount: 5 },
    { at: 8.29, actor: 'bag', do: 'hop', dur: 0.35, amount: 5 },
    // 光束忘了關
    { at: 8.96, actor: 'alien', do: 'moveTo', to: { x: 136, y: 24 }, dur: 0.6 },
    { at: 8.96, actor: 'alien', do: 'spin', dur: 0.6 },
    { at: 9.48, actor: 'alien', do: 'vanish', dur: 0.1 },
    { at: 9.57, actor: 'ufo', do: 'moveTo', to: { x: 185, y: 4 }, dur: 0.4 },
    { at: 9.61, actor: 'cow', do: 'bounce', dur: 0.45, times: 2, amount: 2 },
  ],
  builds: [
    // 書打開，書頁飛出來
    { at: 6.3, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5], from: 'book', color: '#3F6FD8' },
    { at: 6.8, dur: 0.6, strokes: [6, 7, 8, 9], from: 'book', color: '#E2802A' },
  ],
  glyph: [{ at: 7.51, dur: 0.4, do: 'wobble' }, { at: 9.57, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'ufo', emoji: '📖', dur: 0.9, dx: 4, dy: 8 },
    { at: 1.62, kind: 'beam', actor: 'ufo', n: 18, dur: 1.0 },
    { at: 3.28, kind: 'bubble', actor: 'cow', emoji: '😑', dur: 0.8 },
    { at: 3.91, kind: 'beam', actor: 'ufo', n: 18, dur: 0.8 },
    { at: 4.74, kind: 'pop', actor: 'ufo', emoji: '🤢', dur: 0.6, dx: 8, dy: 8 },
    { at: 5.68, kind: 'beam', actor: 'ufo', n: 16, dur: 0.7 },
    { at: 6.3, kind: 'burst', x: 96, y: 36, emoji: '📄', n: 6, dur: 0.6 },
    { at: 7.25, kind: 'beam', actor: 'ufo', n: 14, dur: 0.6 },
    { at: 8.35, kind: 'burst', actor: 'alien', emoji: '💕', n: 5, dur: 0.6 },
    { at: 8.88, kind: 'beam', actor: 'ufo', n: 14, dur: 0.8 },
    { at: 8.96, kind: 'pop', actor: 'alien', emoji: '❗', dur: 0.4 },
    { at: 9.61, kind: 'pop', actor: 'cow', emoji: '😆', dur: 0.45 },
  ],
  camera: [
    { at: 4.69, dur: 0.7, do: 'punch', amount: 0.2, to: { x: 64, y: 30 } },
  ],
  cues: [
    { at: 0.9, sfx: 'blip' },
    { at: 1.15, say: '書' },
    { at: 1.72, sfx: 'slide' },
    { at: 2.92, sfx: 'poof' }, { at: 3.28, sfx: 'bonk' },
    { at: 4.01, sfx: 'slide' },
    { at: 5, sfx: 'poof' }, { at: 5.47, sfx: 'bonk' },
    { at: 5.78, sfx: 'slide' },
    { at: 6.3, sfx: 'poof' },
    { at: 7.4, say: '書' },
    { at: 8.4, say: '書包' },
    { at: 8.96, sfx: 'slide' },
    { at: 9.57, sfx: 'whoosh' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
