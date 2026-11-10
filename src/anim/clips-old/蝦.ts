import type { Clip } from '../clip'
import { ride } from '../helpers'

// 蝦（消防小隊救小火苗）：小蝦尾巴上只有一點點生日蠟燭大的火，消防小隊卻當成大火災：拚命打氣、消防車衝出去——衝過頭，倒車回來，
// 水管暴走把隊長噴下車，一大片水花往上噴、落下來變成粉紅色的「蝦」。最後隊長只輕輕擠出一滴水就把火苗熄了，小蝦戴著消防帽跳出來。
// 回馬槍：火苗又冒出來，隊長嚇一跳——小蝦自己打個噴嚏就吹熄了。蝦、蝦、蝦子
const clip: Clip = {
  char: '蝦',
  meta: { theme: '消防小隊救小火苗', cast: '消防小隊＋消防車＋小蝦', gags: ['小火苗當大火災', '消防車衝過頭水管暴走噴飛自己', '一滴水就熄、噴嚏也能熄'] },
  duration: 10,
  bg: { top: '#E3F8EE', bottom: '#D2F2E3', floor: '#BFE3CF', scenery: 'city' },
  actors: [
    { id: 'pan', emoji: '🍳', x: 141, y: 74, size: 9, float: true },
    { id: 'shrimp', emoji: '🦐', x: 140, y: 68, size: 10 },
    { id: 'hat', emoji: '⛑️', x: 138, y: 62, size: 5, hidden: true, float: true },
    { id: 'flame', emoji: '🔥', x: 146, y: 64.5, size: 4, float: true },
    { id: 'drop', emoji: '💧', x: 124, y: 60, size: 4, hidden: true, float: true },
    { id: 'ff', emoji: 'hero:firefighter/idle', x: 30, y: 53, size: 12, hidden: true },
    { id: 'truck', emoji: '🚒', x: 30, y: 68.6, size: 20, hidden: true, flip: true },
  ],
  moves: [
    ...ride([
      { at: 0, actor: 'truck', do: 'enter', from: { x: -25, y: 68.6 }, dur: 0.5, ease: 'back' },
      // 拚命打氣，車頭都翹起來
      { at: 1.3, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.6 },
      { at: 1.3, actor: 'truck', do: 'tilt', amount: -12, dur: 0.6 },
      // 衝出去！衝過頭——倒車回來
      { at: 1.95, actor: 'truck', do: 'moveTo', to: { x: 185, y: 68.6 }, dur: 0.45, anticipate: 4, ease: 'in' },
      { at: 2.45, actor: 'truck', do: 'flip' },
      { at: 2.5, actor: 'truck', do: 'moveTo', to: { x: 30, y: 68.6 }, dur: 0.45, ease: 'back' },
    ], 'ff', -15.6, 20),
    { at: 0.8, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 0.8, actor: 'ff', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.3, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    // 水管暴走，把隊長噴下車
    { at: 2.95, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 2.95, actor: 'ff', do: 'moveTo', to: { x: 124, y: 71.9 }, arc: 22, dur: 0.6 },
    { at: 2.95, actor: 'ff', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.55, actor: 'ff', do: 'squash', amount: 0.3, dur: 0.25 },
    // 一大片水往上噴，小蝦被沖上天
    { at: 3.3, actor: 'truck', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 3.4, actor: 'shrimp', do: 'moveTo', to: { x: 140, y: 16 }, dur: 0.5, ease: 'out' },
    { at: 3.4, actor: 'shrimp', do: 'spin', times: 2, dur: 1.0 },
    { at: 3.4, actor: 'flame', do: 'moveTo', to: { x: 146, y: 12.5 }, dur: 0.5, ease: 'out' },
    { at: 4.4, actor: 'shrimp', do: 'moveTo', to: { x: 140, y: 68 }, dur: 0.5, ease: 'bounce' },
    { at: 4.4, actor: 'flame', do: 'moveTo', to: { x: 146, y: 64.5 }, dur: 0.5, ease: 'bounce' },
    // 隊長輕輕一擠：一滴水，火苗「噗」熄了
    { at: 5.7, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 6.0, actor: 'ff', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 6.05, actor: 'drop', do: 'pop', dur: 0.15 },
    { at: 6.15, actor: 'drop', do: 'moveTo', to: { x: 146, y: 64.5 }, arc: 8, dur: 0.35, ease: 'in' },
    { at: 6.5, actor: 'drop', do: 'vanish', dur: 0.1 },
    { at: 6.5, actor: 'flame', do: 'vanish', dur: 0.2 },
    // 小蝦戴著消防帽跳出來
    { at: 6.8, actor: 'hat', do: 'pop', dur: 0.25 },
    { at: 6.8, actor: 'shrimp', do: 'hop', amount: 7, dur: 0.4 },
    { at: 6.8, actor: 'hat', do: 'hop', amount: 7, dur: 0.4 },
    { at: 7.3, actor: 'shrimp', do: 'tilt', amount: 15, dur: 0.4 },
    { at: 7.3, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 7.3, actor: 'ff', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：火苗又冒出來！隊長嚇到——小蝦一個噴嚏就吹熄
    { at: 8.0, actor: 'flame', do: 'pop', dur: 0.25 },
    { at: 8.2, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.2, actor: 'ff', do: 'hop', amount: 5, dur: 0.3 },
    { at: 8.5, actor: 'shrimp', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 8.75, actor: 'shrimp', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 8.8, actor: 'flame', do: 'vanish', dur: 0.15 },
    { at: 9.0, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 9.0, actor: 'ff', do: 'tilt', amount: -25, dur: 0.5 },
    { at: 9.5, actor: 'shrimp', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 9.5, actor: 'hat', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 噴上天的水花變成粉紅色的水滴落下來：虫（左）先，叚（右）後
    { at: 3.7, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5], from: { x: 60, y: 0 }, style: 'drop', color: '#F06595' },
    { at: 4.3, dur: 1.0, strokes: [6, 7, 8, 9, 10, 11, 12, 13, 14], from: { x: 100, y: 0 }, style: 'drop', color: '#E64980' },
  ],
  glyph: [{ at: 5.3, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.55, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 0.8, kind: 'pop', actor: 'ff', emoji: '😱', dur: 0.6 },
    { at: 0.9, kind: 'pop', actor: 'shrimp', emoji: '😑', dx: -14, dur: 0.7 },
    { at: 1.3, kind: 'sweat', actor: 'ff' },
    { at: 2.75, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 2.9, kind: 'fountain', actor: 'truck', emoji: '💦', n: 7, dur: 0.6 },
    { at: 3.3, kind: 'fountain', actor: 'truck', emoji: '💧', n: 12, dur: 1.0 },
    { at: 3.45, kind: 'pop', actor: 'shrimp', emoji: '😲', dx: -14, dur: 0.6 },
    { at: 3.7, kind: 'dizzy', actor: 'ff', dur: 1.6 },
    { at: 6.5, kind: 'burst', actor: 'shrimp', emoji: '☁️', n: 5, dx: -4, dur: 0.6 },
    { at: 6.85, kind: 'burst', actor: 'shrimp', emoji: '✨', n: 6, dx: -2, dur: 0.6 },
    { at: 8.2, kind: 'pop', actor: 'ff', emoji: '❗', dur: 0.5 },
    { at: 8.75, kind: 'burst', actor: 'shrimp', emoji: '💨', dx: -6, dur: 0.4 },
    { at: 9.1, kind: 'dizzy', actor: 'ff', dur: 0.8 },
  ],
  camera: [
    // 衝出去的那一下跟拍；倒車回來退回全景
    { at: 1.95, dur: 0.25, do: 'follow', actor: 'truck', amount: 1.3 },
    { at: 2.45, dur: 0.4, do: 'zoom', amount: 1 },
    // 一滴水熄火那一刻推近
    { at: 6.1, dur: 0.8, do: 'punch', amount: 0.12, to: { x: 120, y: 60 } },
  ],
  cues: [
    { at: 0.05, sfx: 'slide' },
    { at: 1.3, sfx: 'rumble' },
    { at: 1.95, say: '蝦' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 2.5, sfx: 'slide' },
    { at: 2.9, sfx: 'splash' },
    { at: 3.3, sfx: 'splash' },
    { at: 4.4, sfx: 'plop' },
    { at: 5.35, say: '蝦' },
    { at: 6.5, sfx: 'poof' },
    { at: 6.85, say: '蝦子' },
    { at: 8.0, sfx: 'blip' },
    { at: 8.7, sfx: 'achoo' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
