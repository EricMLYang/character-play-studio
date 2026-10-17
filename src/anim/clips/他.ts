import type { Clip } from '../clip'

// 他：豬探長發現一顆亮晶晶的線索彈珠，衝過去一腳踩上——像彈珠台一樣彈地板、天花板、牆壁、披風英雄的頭，每彈一下就敲進「他」的一筆，最後順著彎鉤滑下來。
// 兩個人互相指著對方——他們！彈珠又滾回來，豬探長再踩一次，又「咚」地彈上天。他、他、他們
const clip: Clip = {
  char: '他',
  meta: { theme: '豬探長彈珠台', cast: '豬探長＋披風英雄＋彈珠', gags: ['踩到線索彈成彈珠台', '彈到英雄頭上', '彈珠滾回來再踩一次'] },
  duration: 10,
  bg: { top: '#D8F5EA', bottom: '#F2FCF7', floor: '#B9DCCB', scenery: 'city' },
  actors: [
    { id: 'marble', emoji: '🔮', x: 130, y: 74.5, size: 5 },
    { id: 'cape', emoji: 'hero:cape/idle', x: 112, y: 40, size: 14, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 18, y: 71.1, size: 14, flip: true },
  ],
  moves: [
    // 發現線索，蓄力
    { at: 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 0.8, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 0.8, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 1.1, actor: 'pig', do: 'moveTo', to: { x: 128, y: 71.1 }, dur: 0.5, anticipate: 3, ease: 'in' },
    // 一腳踩上彈珠——彈地板
    { at: 1.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 1.6, actor: 'marble', do: 'moveTo', to: { x: 156, y: 74.5 }, dur: 0.4, ease: 'out' },
    { at: 1.62, actor: 'pig', do: 'moveTo', to: { x: 96, y: 14 }, dur: 0.33, ease: 'out' },
    // 天花板
    { at: 1.95, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.2 },
    { at: 2.15, actor: 'pig', do: 'moveTo', to: { x: 150, y: 36 }, dur: 0.33 },
    // 右邊的牆
    { at: 2.48, actor: 'pig', do: 'squash', amount: -0.4, dur: 0.2 },
    // 披風英雄飛進來，披風蓋住臉看不到
    { at: 2.2, actor: 'cape', do: 'enter', from: { x: 175, y: 4 }, dur: 0.45, ease: 'out' },
    { at: 2.7, actor: 'pig', do: 'moveTo', to: { x: 112, y: 24 }, dur: 0.3 },
    // 彈到英雄頭上——咚！英雄轉成陀螺
    { at: 3.0, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.2 },
    { at: 3.0, actor: 'cape', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.0, actor: 'cape', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.6, actor: 'cape', do: 'moveTo', to: { x: 142, y: 71.1 }, dur: 0.5, arc: 8, ease: 'bounce' },
    // 最後一彈落到底下，順著彎鉤當雪橇滑過去，滑下來一屁股坐好
    { at: 3.25, actor: 'pig', do: 'moveTo', to: { x: 72, y: 62 }, dur: 0.4, arc: 12 },
    { at: 3.65, actor: 'pig', do: 'moveTo', to: { x: 100, y: 64 }, dur: 0.55, ease: 'linear' },
    { at: 3.65, actor: 'pig', do: 'tilt', amount: 12, dur: 0.55 },
    { at: 4.25, actor: 'pig', do: 'moveTo', to: { x: 124, y: 71.1 }, dur: 0.35, ease: 'bounce' },
    { at: 4.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 英雄把披風扯開，兩個互相指著對方
    { at: 5.4, actor: 'cape', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 5.4, actor: 'cape', do: 'hop', amount: 4, dur: 0.3 },
    { at: 5.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 7.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 7.0, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.4, actor: 'cape', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 7.9, actor: 'cape', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 7.9, actor: 'cape', do: 'shake', amount: 1, dur: 0.4 },
    // 回馬槍：彈珠又滾回來，豬探長再踩一次
    { at: 8.3, actor: 'marble', do: 'moveTo', to: { x: 124, y: 74.5 }, dur: 0.45, ease: 'out' },
    { at: 8.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 8.75, actor: 'pig', do: 'hop', amount: 18, dur: 0.6 },
    { at: 8.75, actor: 'pig', do: 'spin', dur: 0.6 },
    { at: 8.8, actor: 'marble', do: 'moveTo', to: { x: 150, y: 74.5 }, dur: 0.4, ease: 'out' },
    { at: 9.35, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
  ],
  builds: [
    // 每彈一下敲進一筆：地板、天花板、牆壁、英雄的頭、最後的彎鉤
    { at: 1.6, dur: 0.3, strokes: [0], from: 'pig', color: '#1F4FB4' },
    { at: 1.95, dur: 0.3, strokes: [1], from: 'pig', color: '#1F4FB4' },
    { at: 2.5, dur: 0.3, strokes: [2], from: 'pig', color: '#2A63D4' },
    { at: 3.0, dur: 0.3, strokes: [3], from: 'pig', color: '#2A63D4' },
    { at: 3.6, dur: 0.6, strokes: [4], from: 'pig', color: '#2A63D4' },
  ],
  glyph: [{ at: 4.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.6 },
    { at: 0.8, kind: 'puff', actor: 'pig', dur: 0.4 },
    { at: 1.6, kind: 'burst', actor: 'pig', emoji: '✨', n: 5, dur: 0.25 },
    { at: 1.95, kind: 'burst', actor: 'pig', dur: 0.35 },
    { at: 2.48, kind: 'burst', actor: 'pig', dur: 0.35 },
    { at: 2.4, kind: 'pop', actor: 'cape', emoji: '🙈', dur: 0.5 },
    { at: 3.0, kind: 'burst', actor: 'cape', dur: 0.4 },
    { at: 4.6, kind: 'dizzy', actor: 'pig', dur: 0.9 },
    { at: 4.1, kind: 'puff', actor: 'cape', dur: 0.5 },
    { at: 6.2, kind: 'pop', actor: 'pig', emoji: '👉', dx: 6, dur: 0.9 },
    { at: 6.2, kind: 'pop', actor: 'cape', emoji: '👈', dx: -6, dur: 0.9 },
    { at: 7.9, kind: 'pop', actor: 'cape', emoji: '🙈', dur: 0.6 },
    { at: 8.75, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 9.35, kind: 'puff', actor: 'pig', dur: 0.4 },
  ],
  camera: [
    { at: 1.6, dur: 0.3, do: 'follow', actor: 'pig', amount: 1.25 },
    { at: 3.0, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 3.0, dur: 0.35, do: 'shake' },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.15, say: '他' },
    { at: 1.6, sfx: 'boing' },
    { at: 1.95, sfx: 'bonk' },
    { at: 2.2, sfx: 'whoosh' },
    { at: 2.5, sfx: 'bonk' },
    { at: 3.0, sfx: 'bonk' },
    { at: 3.65, sfx: 'slide' },
    { at: 4.25, say: '他' },
    { at: 4.55, sfx: 'plop' },
    { at: 6.25, sfx: 'tap' },
    { at: 6.3, say: '他們' },
    { at: 8.3, sfx: 'slide' },
    { at: 8.75, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
