import type { Clip } from '../clip'

// 風：小熊貓想放風箏，可是一點風都沒有：拖著跑，風箏在地上拖；自己吹，只飄起來一下下，駱駝在旁邊偷笑。
// 風先生終於出來了——一吹太用力，連人帶風箏吹上天，吹出「風」。熊貓掉在駱駝背上，風箏總算飛好了；風先生再一吹，這次連駱駝一起吹上天。風、風、風箏
const clip: Clip = {
  char: '風',
  meta: { theme: '放風箏', cast: '熊貓＋風箏＋風先生＋駱駝', gags: ['沒風拖著跑', '自己吹沒用', '風太大連人吹走', '連旁觀者也吹上天'] },
  duration: 10,
  bg: { top: '#FFE6B8', bottom: '#FFC98A', floor: '#E0B070', scenery: 'desert' },
  actors: [
    { id: 'camel', emoji: '🐪', x: 140, y: 69.4, size: 18, hidden: true },
    { id: 'kite', emoji: '🪁', x: 22, y: 73.8, size: 9, hidden: true },
    { id: 'kid', emoji: '🐼', x: 34, y: 71.1, size: 14, hidden: true },
    { id: 'wind', emoji: '🌬️', x: 18, y: 18, size: 16, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'kid', do: 'enter', from: { x: -12, y: 71.1 }, dur: 0.6 },
    { at: 0, actor: 'kite', do: 'enter', from: { x: -24, y: 73.8 }, dur: 0.6 },
    { at: 0.3, actor: 'camel', do: 'pop' },
    // 拖著跑：風箏在地上拖
    { at: 1.0, actor: 'kid', do: 'moveTo', to: { x: 72, y: 71.1 }, dur: 0.7 },
    { at: 1.0, actor: 'kid', do: 'bounce', amount: 2, times: 4, dur: 0.7 },
    { at: 1.05, actor: 'kite', do: 'moveTo', to: { x: 60, y: 73.8 }, dur: 0.75 },
    { at: 1.05, actor: 'kite', do: 'bounce', amount: 2, times: 5, dur: 0.75 },
    { at: 1.85, actor: 'kite', do: 'rotateTo', amount: 80, dur: 0.2 },
    // 自己吹
    { at: 2.4, actor: 'kid', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 2.65, actor: 'kite', do: 'hop', amount: 6, dur: 0.5 },
    // 風先生出來，一吹太用力
    { at: 3.3, actor: 'wind', do: 'pop' },
    { at: 3.5, actor: 'wind', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 3.9, actor: 'wind', do: 'shake', amount: 1, dur: 1.4 },
    { at: 3.9, actor: 'kite', do: 'rotateTo', amount: -80, dur: 0.2 },
    { at: 3.9, actor: 'kite', do: 'moveTo', to: { x: 120, y: 18 }, dur: 0.4 },
    { at: 4.0, actor: 'kid', do: 'moveTo', to: { x: 108, y: 38 }, dur: 0.45 },
    { at: 4.0, actor: 'kid', do: 'spin', dur: 0.45 },
    { at: 4.5, actor: 'kite', do: 'moveTo', to: { x: 138, y: 12 }, dur: 0.5 },
    { at: 4.5, actor: 'kid', do: 'moveTo', to: { x: 130, y: 36 }, dur: 0.5 },
    { at: 5.0, actor: 'kid', do: 'tilt', amount: 20, dur: 0.6 },
    // 風停：掉在駱駝背上
    { at: 5.6, actor: 'kid', do: 'moveTo', to: { x: 137, y: 57 }, dur: 0.4 },
    { at: 6.0, actor: 'camel', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 6.0, actor: 'kid', do: 'hop', amount: -3, dur: 0.3 },
    { at: 5.8, actor: 'kite', do: 'moveTo', to: { x: 128, y: 14 }, dur: 0.6 },
    // 風箏飛好了
    { at: 7.2, actor: 'wind', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 7.3, actor: 'kite', do: 'bounce', amount: 3, times: 2, dur: 0.8 },
    { at: 7.4, actor: 'kid', do: 'hop', amount: 4, dur: 0.35 },
    // 再一吹：連駱駝一起
    { at: 8.2, actor: 'wind', do: 'squash', amount: -0.35, dur: 0.4 },
    { at: 8.6, actor: 'wind', do: 'shake', amount: 1, dur: 0.6 },
    { at: 8.65, actor: 'camel', do: 'moveTo', to: { x: 140, y: 48 }, dur: 0.4 },
    { at: 8.65, actor: 'kid', do: 'moveTo', to: { x: 137, y: 35.6 }, dur: 0.4 },
    { at: 8.65, actor: 'camel', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 9.2, actor: 'camel', do: 'moveTo', to: { x: 140, y: 69.4 }, dur: 0.3 },
    { at: 9.2, actor: 'kid', do: 'moveTo', to: { x: 137, y: 57 }, dur: 0.3 },
    { at: 9.5, actor: 'camel', do: 'squash', amount: 0.25, dur: 0.25 },
  ],
  builds: [
    // 風先生吹出的大風 → 外框；風箏的尾巴 → 裡面
    { at: 5.0, dur: 0.6, strokes: [0, 1], from: 'wind', color: '#2F9BE0' },
    { at: 5.4, dur: 0.8, strokes: [2, 3, 4, 5, 6, 7, 8], from: 'kite', color: '#E8484A' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'kid', emoji: '🪁', dur: 0.6 },
    { at: 1.3, kind: 'puff', actor: 'kite' },
    { at: 2.0, kind: 'sweat', actor: 'kid' },
    { at: 2.1, kind: 'bubble', actor: 'camel', emoji: '😆', dur: 0.7, dx: -12 },
    { at: 2.55, kind: 'burst', actor: 'kite', emoji: '💨', n: 4, dur: 0.4 },
    { at: 3.0, kind: 'pop', actor: 'kid', emoji: '😑', dur: 0.4 },
    { at: 3.9, kind: 'burst', actor: 'wind', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 8 },
    { at: 4.1, kind: 'pop', actor: 'kid', emoji: '😱', dur: 0.5 },
    { at: 4.0, kind: 'line', actor: 'kid', target: 'kite', color: '#ffffff', width: 0.4, dur: 2.0 },
    { at: 4.6, kind: 'burst', actor: 'wind', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 8 },
    { at: 6.0, kind: 'line', actor: 'kid', target: 'kite', color: '#ffffff', width: 0.4, dur: 3.95 },
    { at: 6.05, kind: 'puff', actor: 'camel' },
    { at: 6.1, kind: 'pop', actor: 'camel', emoji: '😵', dur: 0.4, dx: -10 },
    { at: 7.3, kind: 'burst', actor: 'kite', emoji: '✨', n: 5, dur: 0.5, dy: 12 },
    { at: 8.6, kind: 'burst', actor: 'wind', emoji: '💨', n: 7, dur: 0.6, dx: 14, dy: 8 },
    { at: 8.7, kind: 'pop', actor: 'camel', emoji: '😳', dur: 0.5, dx: -12 },
    { at: 9.5, kind: 'puff', actor: 'camel' },
  ],
  camera: [
    { at: 3.9, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 8.6, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.0, sfx: 'slide' },
    { at: 1.5, say: '風' },
    { at: 2.6, sfx: 'deflate' },
    { at: 3.3, sfx: 'poof' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 4.6, sfx: 'whoosh' },
    { at: 6.0, sfx: 'plop' },
    { at: 6.3, say: '風' },
    { at: 7.3, say: '風箏' },
    { at: 8.6, sfx: 'whoosh' },
    { at: 9.5, sfx: 'plop' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
