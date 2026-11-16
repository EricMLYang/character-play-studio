import type { Clip } from '../clip'

// 樂：豬探長衝進來，放大鏡一照——地上有一條紅白相間的糖果繩，是線索！披風英雄從右邊飛進來，披風太長蓋住臉，摸到另一頭以為是自己的披風。
// 兩個拔河，越拉越後仰、繩子越拉越細……「啪！」兩個一起往後飛、屁股著地，繩子彈上天捲成「樂」。
// 兩個對看一眼笑出來；英雄想擺帥氣姿勢，披風又蓋住頭，轉一圈跌坐地上。樂、樂、快樂
const clip: Clip = {
  char: '樂',
  meta: { theme: '糖果繩拔河', cast: '豬探長＋披風英雄＋糖果繩', gags: ['披風蓋臉以為抓到自己的披風', '拔河繩子斷兩個往後飛', '擺帥被披風蓋頭'] },
  duration: 10,
  bg: { top: '#FFF1B8', bottom: '#FFF9E0', floor: '#F6D6A8', scenery: 'room' },
  actors: [
    { id: 'rope', emoji: '🪢', x: 80, y: 71, size: 11 },
    { id: 'pig', emoji: 'hero:pig/idle', x: 56, y: 71, size: 14, flip: true, hidden: true },
    { id: 'hero', emoji: 'hero:cape/fly', x: 104, y: 71, size: 14, hidden: true },
  ],
  moves: [
    // 全速衝進來，煞車
    { at: 0, actor: 'pig', do: 'enter', from: { x: -14, y: 71 }, dur: 0.45, ease: 'back' },
    { at: 0.45, actor: 'pig', do: 'shake', amount: 1, dur: 0.3 },
    { at: 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    // 英雄飛進來，披風蓋住臉
    { at: 0.5, actor: 'hero', do: 'enter', from: { x: 180, y: 30 }, dur: 0.55, ease: 'out' },
    { at: 1.05, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 1.05, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 1.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 拔河：越拉越後仰
    { at: 1.5, actor: 'pig', do: 'moveTo', to: { x: 44, y: 71 }, dur: 1.7 },
    { at: 1.5, actor: 'hero', do: 'moveTo', to: { x: 116, y: 71 }, dur: 1.7 },
    { at: 1.5, actor: 'pig', do: 'rotateTo', amount: -14, dur: 1.2 },
    { at: 1.5, actor: 'hero', do: 'rotateTo', amount: 14, dur: 1.2 },
    { at: 1.6, actor: 'pig', do: 'shake', amount: 0.8, dur: 1.5 },
    { at: 1.6, actor: 'hero', do: 'shake', amount: 0.8, dur: 1.5 },
    { at: 1.6, actor: 'rope', do: 'shake', amount: 1.2, dur: 1.8 },
    { at: 2.4, actor: 'pig', do: 'squash', amount: 0.12, dur: 0.4 },
    // 定格：兩個眼睛都睜大
    { at: 3.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    // 啪！往後飛，屁股著地
    { at: 3.6, actor: 'pig', do: 'moveTo', to: { x: 20, y: 71 }, dur: 0.45, arc: 6, ease: 'out' },
    { at: 3.6, actor: 'hero', do: 'moveTo', to: { x: 140, y: 71 }, dur: 0.45, arc: 6, ease: 'out' },
    { at: 3.6, actor: 'pig', do: 'rotateTo', amount: 14, dur: 0.4 },
    { at: 3.6, actor: 'hero', do: 'rotateTo', amount: -14, dur: 0.4 },
    { at: 4.05, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.05, actor: 'hero', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 4.05, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    // 繩子彈上天
    { at: 3.6, actor: 'rope', do: 'moveTo', to: { x: 80, y: 32 }, dur: 0.3, ease: 'out' },
    { at: 3.6, actor: 'rope', do: 'spin', times: 2, dur: 0.3 },
    { at: 3.95, actor: 'rope', do: 'vanish', dur: 0.2 },
    // 對看一眼，笑出來
    { at: 5.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 5.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 5.9, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 5.9, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 6.6, actor: 'pig', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
    { at: 6.6, actor: 'hero', do: 'tilt', amount: 10, dur: 0.45 },
    { at: 7.05, actor: 'hero', do: 'tilt', amount: -10, dur: 0.45 },
    // 回馬槍：英雄要擺帥——披風又蓋住頭，轉一圈跌坐
    { at: 8.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 8.0, actor: 'hero', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 8.5, actor: 'hero', do: 'spin', times: 1, dur: 0.5 },
    { at: 9.0, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 9.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 9.1, actor: 'pig', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 糖果繩一段一段彈開，啪啪啪扣成「樂」
    { at: 3.9, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'rope', color: '#E8443A' },
    { at: 4.35, dur: 0.55, strokes: [5, 6, 7, 8, 9, 10], from: 'rope', color: '#E8443A' },
    { at: 4.85, dur: 0.5, strokes: [11, 12, 13, 14], from: 'rope', color: '#E8443A' },
  ],
  glyph: [{ at: 5.35, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.45, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 0.7, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 1.05, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.8 },
    { at: 1.1, kind: 'line', actor: 'pig', target: 'rope', color: '#E8443A', width: 1.4, dur: 2.5 },
    { at: 1.1, kind: 'line', actor: 'hero', target: 'rope', color: '#FFFFFF', width: 1.4, dur: 2.5 },
    { at: 2.0, kind: 'sweat', actor: 'pig', dur: 0.6 },
    { at: 2.3, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.7 },
    { at: 2.8, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 2.8, kind: 'puff', actor: 'hero', dur: 0.4 },
    { at: 3.2, kind: 'pop', actor: 'pig', emoji: '😳', dur: 0.4 },
    { at: 3.2, kind: 'pop', actor: 'hero', emoji: '😳', dur: 0.4 },
    { at: 3.6, kind: 'burst', actor: 'rope', dur: 0.4 },
    { at: 4.1, kind: 'pop', actor: 'pig', emoji: '🔍', dx: -6, dy: 6, dur: 1.0 },
    { at: 4.1, kind: 'dizzy', actor: 'hero', dur: 1.0 },
    { at: 5.9, kind: 'pop', actor: 'pig', emoji: '😆', dur: 0.6 },
    { at: 5.9, kind: 'pop', actor: 'hero', emoji: '😆', dx: -10, dur: 0.6 },
    { at: 6.6, kind: 'rain', actor: 'pig', emoji: '🎊', n: 6, dy: -8, dur: 1.2 },
    { at: 6.6, kind: 'rain', actor: 'hero', emoji: '🎊', n: 6, dy: -8, dur: 1.2 },
    { at: 8.5, kind: 'pop', actor: 'hero', emoji: '🙈', dx: -10, dur: 0.8 },
    { at: 9.1, kind: 'pop', actor: 'pig', emoji: '🤭', dur: 0.6 },
  ],
  camera: [
    { at: 2.3, dur: 1.3, do: 'zoom', amount: 1.25, to: { x: 80, y: 62 } },
    { at: 3.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 3.6, dur: 0.35, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.15, say: '樂' },
    { at: 3.6, sfx: 'boing' },
    { at: 4.05, sfx: 'plop' },
    { at: 5.4, say: '樂' },
    { at: 6.6, say: '快樂' },
    { at: 6.6, sfx: 'cheer' },
    { at: 8.5, sfx: 'whoosh' },
    { at: 9.0, sfx: 'plop' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
