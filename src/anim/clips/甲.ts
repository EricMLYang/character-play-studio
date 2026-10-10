import type { Clip } from '../clip'

// 甲：大力士比賽。小螞蟻想舉起一顆葡萄，舉不動、一屁股坐下；甲蟲用角輕輕一挑就舉起來。天上又掉下一顆大西瓜，
// 甲蟲被壓扁、用力一頂——西瓜飛上天碎成「甲」。結果小螞蟻走過來，把甲蟲整隻舉起來。甲、甲、甲蟲
const clip: Clip = {
  char: '甲',
  meta: { theme: '大力士比賽', cast: '甲蟲＋小螞蟻＋葡萄＋西瓜', gags: ['舉不動', '越舉越大', '小傢伙反過來舉起大傢伙'] },
  duration: 10,
  bg: { top: '#D9F0FF', bottom: '#FFF4DE', floor: '#C96F4A', scenery: 'track' },
  actors: [
    { id: 'grape', emoji: '🍇', x: 66, y: 72.5, size: 10, hidden: true },
    { id: 'melon', emoji: '🍉', x: 24, y: 52, size: 20, hidden: true, float: true },
    { id: 'ant', emoji: '🐜', x: 56, y: 72.6, size: 11, hidden: true },
    { id: 'beetle', emoji: '🪲', x: 24, y: 70, size: 17, hidden: true, flip: true },
  ],
  moves: [
    // 甲蟲登場，秀肌肉
    { at: 0, actor: 'beetle', do: 'enter', from: { x: -14, y: 70 }, dur: 0.7 },
    { at: 0.8, actor: 'beetle', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 1.2, actor: 'beetle', do: 'flash', dur: 0.5 },
    // 小螞蟻想舉葡萄——舉不動，一屁股坐下
    { at: 0.3, actor: 'grape', do: 'pop' },
    { at: 1.6, actor: 'ant', do: 'enter', from: { x: 180, y: 72.6 }, dur: 0.6 },
    { at: 2.4, actor: 'ant', do: 'squash', amount: 0.3, dur: 0.7 },
    { at: 2.4, actor: 'grape', do: 'shake', amount: 0.5, dur: 0.7 },
    { at: 3.2, actor: 'ant', do: 'rotateTo', amount: 70, dur: 0.2 },
    { at: 3.8, actor: 'ant', do: 'rotateTo', amount: -70, dur: 0.2 },
    // 甲蟲用角一挑，舉起葡萄
    { at: 4.1, actor: 'beetle', do: 'moveTo', to: { x: 50, y: 70 }, dur: 0.4 },
    { at: 4.5, actor: 'grape', do: 'moveTo', to: { x: 50, y: 58 }, dur: 0.3, arc: 4 },
    { at: 4.8, actor: 'beetle', do: 'hop', amount: 3, dur: 0.3 },
    { at: 4.8, actor: 'grape', do: 'hop', amount: 3, dur: 0.3 },
    // 退回左邊，天上掉下大西瓜——被壓扁
    { at: 5.2, actor: 'grape', do: 'vanish', dur: 0.2 },
    { at: 5.2, actor: 'beetle', do: 'moveTo', to: { x: 24, y: 70 }, dur: 0.4 },
    { at: 5.4, actor: 'ant', do: 'moveTo', to: { x: 136, y: 72.6 }, dur: 0.5 },
    { at: 5.7, actor: 'melon', do: 'drop', dur: 0.5 },
    { at: 6.15, actor: 'beetle', do: 'squash', amount: 0.45, dur: 0.6 },
    { at: 6.15, actor: 'melon', do: 'hop', amount: -6, dur: 0.6 },
    // 用力一頂——西瓜飛上天
    { at: 6.8, actor: 'beetle', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 6.85, actor: 'melon', do: 'moveTo', to: { x: 80, y: 18 }, dur: 0.4 },
    { at: 6.85, actor: 'melon', do: 'spin', dur: 0.4 },
    { at: 7.25, actor: 'melon', do: 'vanish', dur: 0.1 },
    // 小螞蟻走過來，把甲蟲整隻舉起來
    { at: 7.7, actor: 'ant', do: 'vanish', dur: 0.2 },
    { at: 8.4, actor: 'ant', do: 'moveTo', to: { x: 24, y: 72.6 }, dur: 0.01 },
    { at: 8.4, actor: 'beetle', do: 'moveTo', to: { x: 24, y: 61 }, dur: 0.01 },
    { at: 8.42, actor: 'ant', do: 'pop', dur: 0.2 },
    
    { at: 8.6, actor: 'ant', do: 'hop', amount: 3, dur: 0.4 },
    { at: 8.6, actor: 'beetle', do: 'hop', amount: 3, dur: 0.4 },
  ],
  builds: [
    // 西瓜皮 → 田；甲蟲的角 → 中間那一長豎
    { at: 7.25, dur: 0.7, strokes: [0, 1, 2, 3], from: { x: 80, y: 18 }, color: '#2F9E5A' },
    { at: 7.7, dur: 0.4, strokes: [4], style: 'drop', from: { x: 80, y: 0 }, color: '#E24B3B' },
  ],
  glyph: [{ at: 8.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.2, kind: 'pop', actor: 'beetle', emoji: '💪', dur: 0.8 },
    { at: 2.0, kind: 'bubble', actor: 'ant', emoji: '🍇', dur: 0.6 },
    { at: 2.6, kind: 'sweat', actor: 'ant', dur: 0.7 },
    { at: 3.3, kind: 'dizzy', actor: 'ant', dur: 0.6 },
    { at: 4.85, kind: 'burst', actor: 'grape', emoji: '✨', n: 5, dur: 0.5 },
    { at: 4.9, kind: 'pop', actor: 'ant', emoji: '😮', dur: 0.6 },
    { at: 6.15, kind: 'burst', actor: 'beetle', dy: 4, dur: 0.4 },
    { at: 6.3, kind: 'sweat', actor: 'beetle', dur: 0.6 },
    { at: 7.25, kind: 'burst', x: 80, y: 18, emoji: '💦', n: 7, dur: 0.6 },
    { at: 8.7, kind: 'pop', actor: 'beetle', emoji: '😳', dur: 0.9, dx: 6 },
  ],
  camera: [
    { at: 6.15, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 28, y: 60 } },
    { at: 6.85, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.25, say: '甲' },
    { at: 2.4, sfx: 'slide' },
    { at: 3.2, sfx: 'plop' },
    { at: 4.5, sfx: 'boing' },
    { at: 5.7, sfx: 'whoosh' },
    { at: 6.15, sfx: 'bonk' },
    { at: 6.85, sfx: 'boing' },
    { at: 7.25, sfx: 'crack' },
    { at: 8.2, say: '甲' },
    { at: 9.1, say: '甲蟲' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
