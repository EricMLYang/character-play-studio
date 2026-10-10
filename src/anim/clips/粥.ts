import type { Clip } from '../clip'

// 粥：熊貓把一碗米倒進鍋子煮粥，鍋子咕嚕咕嚕冒泡，粥越煮越多、整鍋鼓起來！熊貓拿湯匙拚命吃，吃到肚子圓滾滾還是吃不完——
// 鍋子「噗」一聲噴出米粒和湯匙，變成「粥」。小老鼠端著一小碗白粥走過來，喝一口……也變得圓滾滾。粥、粥、白粥
const clip: Clip = {
  char: '粥',
  meta: { theme: '煮粥', cast: '熊貓＋會長大的鍋子＋小老鼠', gags: ['越煮越多（失控）', '越吃越胖', '連小老鼠也一樣'] },
  duration: 10,
  bg: { top: '#FFE9D2', bottom: '#FFF6EA', floor: '#B98C64', scenery: 'room' },
  actors: [
    { id: 'pot', emoji: '🍲', x: 36, y: 67.8, size: 22, hidden: true },
    { id: 'panda', emoji: '🐼', x: 12, y: 68.6, size: 20, hidden: true },
    { id: 'rice', emoji: '🍚', x: 20, y: 58, size: 10, hidden: true, float: true },
    { id: 'spoon', emoji: '🥄', x: 32, y: 56, size: 9, hidden: true, float: true },
    { id: 'mouse', emoji: '🐭', x: 140, y: 71.6, size: 13, hidden: true },
    { id: 'bowl', emoji: '🥣', x: 128, y: 72.4, size: 10, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'pot', do: 'pop' },
    { at: 0.1, actor: 'panda', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    { at: 0.6, actor: 'rice', do: 'pop' },
    // 把米倒進鍋子
    { at: 1.2, actor: 'rice', do: 'moveTo', to: { x: 36, y: 54 }, dur: 0.4, arc: 8 },
    { at: 1.6, actor: 'rice', do: 'tilt', amount: 60, dur: 0.3 },
    { at: 1.9, actor: 'rice', do: 'vanish', dur: 0.2 },
    // 咕嚕咕嚕……越煮越多
    { at: 2.4, actor: 'pot', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 3.3, actor: 'pot', do: 'scaleTo', amount: 1.3, dur: 0.4 },
    { at: 3.3, actor: 'pot', do: 'shake', amount: 1, dur: 0.5 },
    // 拿湯匙拚命吃：一口、兩口、三口
    { at: 4.0, actor: 'spoon', do: 'pop' },
    { at: 4.2, actor: 'spoon', do: 'moveTo', to: { x: 18, y: 62 }, dur: 0.25 },
    { at: 4.45, actor: 'panda', do: 'scaleTo', amount: 1.12, dur: 0.2 },
    { at: 4.5, actor: 'spoon', do: 'moveTo', to: { x: 32, y: 52 }, dur: 0.2 },
    { at: 4.75, actor: 'spoon', do: 'moveTo', to: { x: 18, y: 62 }, dur: 0.2 },
    { at: 4.95, actor: 'panda', do: 'scaleTo', amount: 1.12, dur: 0.2 },
    { at: 4.6, actor: 'pot', do: 'scaleTo', amount: 1.25, dur: 0.4 },
    { at: 5.0, actor: 'spoon', do: 'moveTo', to: { x: 32, y: 50 }, dur: 0.15 },
    { at: 5.2, actor: 'spoon', do: 'moveTo', to: { x: 18, y: 62 }, dur: 0.15 },
    { at: 5.35, actor: 'panda', do: 'scaleTo', amount: 1.12, dur: 0.2 },
    // 噗！鍋子噴出米粒和湯匙
    { at: 5.8, actor: 'pot', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 5.8, actor: 'pot', do: 'flash', dur: 0.4 },
    { at: 6.0, actor: 'spoon', do: 'vanish', dur: 0.15 },
    { at: 6.1, actor: 'pot', do: 'scaleTo', amount: 0.615, dur: 0.3 },
    { at: 6.3, actor: 'panda', do: 'squash', amount: 0.25, dur: 0.4 },
    // 小老鼠端著一小碗白粥
    { at: 7.4, actor: 'mouse', do: 'enter', from: { x: 178, y: 71.6 }, dur: 0.6 },
    { at: 7.4, actor: 'bowl', do: 'enter', from: { x: 166, y: 72.4 }, dur: 0.6 },
    { at: 8.4, actor: 'bowl', do: 'moveTo', to: { x: 134, y: 64 }, dur: 0.25 },
    { at: 8.7, actor: 'bowl', do: 'moveTo', to: { x: 128, y: 72.4 }, dur: 0.2 },
    { at: 8.9, actor: 'mouse', do: 'scaleTo', amount: 1.5, dur: 0.35 },
    { at: 9.3, actor: 'mouse', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 一根湯匙 → 左邊的弓；米粒 → 米；另一根湯匙 → 右邊的弓
    { at: 5.9, dur: 0.5, strokes: [0, 1, 2], from: 'spoon', color: '#E2556F' },
    { at: 6.0, dur: 0.8, strokes: [3, 4, 5, 6, 7, 8], from: 'pot', color: '#E3A23A' },
    { at: 6.4, dur: 0.5, strokes: [9, 10, 11], from: 'pot', color: '#E2556F' },
  ],
  glyph: [{ at: 6.95, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'panda', emoji: '🍲', dur: 0.8 },
    { at: 2.4, kind: 'burst', actor: 'pot', emoji: '🫧', n: 4, dur: 0.5 },
    { at: 2.9, kind: 'burst', actor: 'pot', emoji: '🫧', n: 5, dur: 0.5 },
    { at: 3.4, kind: 'pop', actor: 'panda', emoji: '😳', dur: 0.6 },
    { at: 4.0, kind: 'zzz', actor: 'pot', emoji: '♨️', dur: 1.6 },
    { at: 5.0, kind: 'sweat', actor: 'panda', dur: 0.7 },
    { at: 5.8, kind: 'burst', actor: 'pot', emoji: '🍚', n: 7, dur: 0.6 },
    { at: 6.4, kind: 'dizzy', actor: 'panda', dur: 1.4 },
    { at: 8.0, kind: 'bubble', actor: 'mouse', emoji: '😋', dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'panda', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 5.0, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 28, y: 58 } },
    { at: 5.8, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.3, say: '粥' },
    { at: 1.6, sfx: 'plop' },
    { at: 2.4, sfx: 'bubble' },
    { at: 3.3, sfx: 'rumble' },
    { at: 4.45, sfx: 'gulp' }, { at: 4.95, sfx: 'gulp' }, { at: 5.35, sfx: 'gulp' },
    { at: 5.8, sfx: 'poof' },
    { at: 7.0, say: '粥' },
    { at: 8.0, say: '白粥' },
    { at: 8.5, sfx: 'gulp' },
    { at: 8.9, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
