import type { Clip } from '../clip'

// 風：小熊貓想放風箏，可是一點風都沒有：拖著跑，風箏在地上拖；自己吹，只飄起來一下下，駱駝在旁邊偷笑。
// 風先生終於出來了——一吹太用力，連人帶風箏吹上天，吹出「風」。熊貓掉在駱駝背上，風箏總算飛好了；風先生再一吹，這次連駱駝一起吹上天。風、風、風箏
const clip: Clip = {
  char: '風',
  meta: { theme: '放風箏', cast: '熊貓＋風箏＋風先生＋駱駝', gags: ['沒風拖著跑', '自己吹沒用', '風太大連人吹走', '連旁觀者也吹上天'] },
  duration: 10,
  bg: { top: '#FFE6B8', bottom: '#FFC98A', floor: '#E0B070', scenery: 'desert' },
  actors: [
    { id: 'camel', emoji: '🐪', x: 140, y: 67.5, size: 22.5, hidden: true },
    { id: 'kite', emoji: '🪁', x: 22, y: 72.9, size: 11.2, hidden: true },
    { id: 'kid', emoji: '🐼', x: 34, y: 69.6, size: 17.5, hidden: true },
    { id: 'wind', emoji: '🌬️', x: 18, y: 18, size: 20, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'kid', do: 'enter', from: { x: -12, y: 69.6 }, dur: 0.6 },
    { at: 0, actor: 'kite', do: 'enter', from: { x: -24, y: 72.9 }, dur: 0.6 },
    { at: 0.3, actor: 'camel', do: 'pop' },
    // 拖著跑：風箏在地上拖
    { at: 1, actor: 'kid', do: 'moveTo', to: { x: 72, y: 69.6 }, dur: 0.7 },
    { at: 1, actor: 'kid', do: 'bounce', amount: 2, times: 4, dur: 0.7 },
    { at: 1.05, actor: 'kite', do: 'moveTo', to: { x: 60, y: 72.9 }, dur: 0.75 },
    { at: 1.05, actor: 'kite', do: 'bounce', amount: 2, times: 5, dur: 0.75 },
    { at: 1.9, actor: 'kite', do: 'rotateTo', amount: 80, dur: 0.2 },
    // 自己吹
    { at: 2.49, actor: 'kid', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 2.76, actor: 'kite', do: 'hop', amount: 6, dur: 0.5 },
    // 風先生出來，一吹太用力
    { at: 3.47, actor: 'wind', do: 'pop' },
    { at: 3.68, actor: 'wind', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 4.11, actor: 'wind', do: 'shake', amount: 1, dur: 1.4 },
    { at: 4.11, actor: 'kite', do: 'rotateTo', amount: -80, dur: 0.2 },
    { at: 4.11, actor: 'kite', do: 'moveTo', to: { x: 120, y: 18 }, dur: 0.4 },
    { at: 4.22, actor: 'kid', do: 'moveTo', to: { x: 108, y: 38 }, dur: 0.45 },
    { at: 4.22, actor: 'kid', do: 'spin', dur: 0.45 },
    { at: 4.76, actor: 'kite', do: 'moveTo', to: { x: 138, y: 12 }, dur: 0.5 },
    { at: 4.76, actor: 'kid', do: 'moveTo', to: { x: 130, y: 36 }, dur: 0.5 },
    { at: 5.3, actor: 'kid', do: 'tilt', amount: 20, dur: 0.6 },
    // 風停：掉在駱駝背上
    { at: 5.9, actor: 'kid', do: 'moveTo', to: { x: 137, y: 57 }, dur: 0.4 },
    { at: 6.3, actor: 'camel', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 6.3, actor: 'kid', do: 'hop', amount: -3, dur: 0.3 },
    { at: 6.1, actor: 'kite', do: 'moveTo', to: { x: 128, y: 14 }, dur: 0.6 },
    // 風箏飛好了
    { at: 7.5, actor: 'wind', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 7.6, actor: 'kite', do: 'bounce', amount: 3, times: 2, dur: 0.8 },
    { at: 7.69, actor: 'kid', do: 'hop', amount: 4, dur: 0.35 },
    // 再一吹：連駱駝一起
    { at: 8.4, actor: 'wind', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 8.76, actor: 'wind', do: 'shake', amount: 1, dur: 0.6 },
    { at: 8.8, actor: 'camel', do: 'moveTo', to: { x: 140, y: 48 }, dur: 0.4 },
    { at: 8.8, actor: 'kid', do: 'moveTo', to: { x: 137, y: 35.6 }, dur: 0.4 },
    { at: 8.8, actor: 'camel', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 9.29, actor: 'camel', do: 'moveTo', to: { x: 140, y: 67.5 }, dur: 0.3 },
    { at: 9.29, actor: 'kid', do: 'moveTo', to: { x: 137, y: 57 }, dur: 0.3 },
    { at: 9.56, actor: 'camel', do: 'squash', amount: 0.25, dur: 0.25 },
  ],
  builds: [
    // 風先生吹出的大風 → 外框；風箏的尾巴 → 裡面
    { at: 5.3, dur: 0.6, strokes: [0, 1], from: 'wind', color: '#2F9BE0' },
    { at: 5.7, dur: 0.8, strokes: [2, 3, 4, 5, 6, 7, 8], from: 'kite', color: '#E8484A' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'kid', emoji: '🪁', dur: 0.6 },
    { at: 1.31, kind: 'puff', actor: 'kite' },
    { at: 2.06, kind: 'sweat', actor: 'kid' },
    { at: 2.17, kind: 'bubble', actor: 'camel', emoji: '😆', dur: 0.7, dx: -12 },
    { at: 2.66, kind: 'burst', actor: 'kite', emoji: '💨', n: 4, dur: 0.4 },
    { at: 3.14, kind: 'pop', actor: 'kid', emoji: '😑', dur: 0.4 },
    { at: 4.11, kind: 'burst', actor: 'wind', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 8 },
    { at: 4.33, kind: 'pop', actor: 'kid', emoji: '😱', dur: 0.5 },
    { at: 4.22, kind: 'line', actor: 'kid', target: 'kite', color: '#ffffff', width: 0.4, dur: 2.0 },
    { at: 4.87, kind: 'burst', actor: 'wind', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 8 },
    { at: 6.3, kind: 'line', actor: 'kid', target: 'kite', color: '#ffffff', width: 0.4, dur: 3.95 },
    { at: 6.35, kind: 'puff', actor: 'camel' },
    { at: 6.4, kind: 'pop', actor: 'camel', emoji: '😵', dur: 0.4, dx: -10 },
    { at: 7.6, kind: 'burst', actor: 'kite', emoji: '✨', n: 5, dur: 0.5, dy: 12 },
    { at: 8.76, kind: 'burst', actor: 'wind', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 8 },
    { at: 8.84, kind: 'pop', actor: 'camel', emoji: '😳', dur: 0.5, dx: -12 },
    { at: 9.56, kind: 'puff', actor: 'camel' },
  ],
  camera: [
    { at: 4.11, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 8.76, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1, sfx: 'slide' },
    { at: 1.52, say: '風' },
    { at: 2.71, sfx: 'deflate' },
    { at: 3.47, sfx: 'poof' },
    { at: 4.11, sfx: 'whoosh' },
    { at: 4.87, sfx: 'whoosh' },
    { at: 6.3, sfx: 'plop' },
    { at: 6.6, say: '風' },
    { at: 7.6, say: '風箏' },
    { at: 8.76, sfx: 'whoosh' },
    { at: 9.56, sfx: 'plop' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
