import type { Clip } from '../clip'

// 肚：熊來野餐，肚子「咕嚕嚕」叫。剛拿出三明治，就被一排螞蟻扛走了；肚子叫得更大聲，鳥都嚇飛了；第三聲大到野餐籃彈上天，
// 食物噴出來變成「肚」。熊吃得肚子圓滾滾，拍拍肚子——結果又「咕嚕」一聲，大家都看熊，原來是扛三明治的小螞蟻肚子餓了。肚、肚、肚子
const clip: Clip = {
  char: '肚',
  meta: { theme: '野餐', cast: '熊＋野餐籃＋螞蟻＋小鳥', gags: ['肚子咕嚕漸強', '食物被螞蟻扛走', '叫到籃子彈上天', '原來是小螞蟻在叫'] },
  duration: 10,
  bg: { top: '#DDF4FF', bottom: '#C4ECCB', floor: '#7CC46A', scenery: 'hills' },
  actors: [
    { id: 'bird', emoji: '🐦', x: 140, y: 73.2, size: 8.8, hidden: true },
    { id: 'basket', emoji: '🧺', x: 46, y: 71.8, size: 12.5, hidden: true },
    { id: 'sandwich', emoji: '🥪', x: 46, y: 64, size: 8.8, hidden: true, float: true },
    { id: 'a1', emoji: '🐜', x: 62, y: 74.4, size: 6.2, hidden: true },
    { id: 'a2', emoji: '🐜', x: 68, y: 74.4, size: 6.2, hidden: true },
    { id: 'a3', emoji: '🐜', x: 74, y: 74.4, size: 6.2, hidden: true },
    { id: 'bear', emoji: '🐻', x: 28, y: 68.6, size: 20, hidden: true },
    { id: 'f1', emoji: '🍙', x: 44, y: 72.8, size: 8.8, hidden: true },
    { id: 'f2', emoji: '🍉', x: 50, y: 72.8, size: 8.8, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -14, y: 68.6 }, dur: 0.6 },
    { at: 0.4, actor: 'basket', do: 'pop' },
    { at: 0.5, actor: 'bird', do: 'pop' },
    // 咕嚕 1
    { at: 1.2, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.5 },
    // 拿出三明治，被螞蟻扛走
    { at: 2.06, actor: 'basket', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.28, actor: 'sandwich', do: 'pop' },
    { at: 2.28, actor: 'a1', do: 'enter', from: { x: 168, y: 74.4 }, dur: 0.6 },
    { at: 2.33, actor: 'a2', do: 'enter', from: { x: 174, y: 74.4 }, dur: 0.6 },
    { at: 2.39, actor: 'a3', do: 'enter', from: { x: 180, y: 74.4 }, dur: 0.6 },
    { at: 3.04, actor: 'sandwich', do: 'moveTo', to: { x: 68, y: 70 }, dur: 0.3 },
    { at: 3.36, actor: 'sandwich', do: 'moveTo', to: { x: 178, y: 70 }, dur: 1.0 },
    { at: 3.36, actor: 'a1', do: 'moveTo', to: { x: 172, y: 74.4 }, dur: 1.0 },
    { at: 3.36, actor: 'a2', do: 'moveTo', to: { x: 178, y: 74.4 }, dur: 1.0 },
    { at: 3.36, actor: 'a3', do: 'moveTo', to: { x: 184, y: 74.4 }, dur: 1.0 },
    { at: 3.36, actor: 'a1', do: 'bounce', amount: 1, times: 5, dur: 1.0 },
    { at: 3.36, actor: 'a3', do: 'bounce', amount: 1, times: 5, dur: 1.0 },
    // 咕嚕 2：鳥嚇飛
    { at: 4.01, actor: 'bear', do: 'shake', amount: 2, dur: 0.6 },
    { at: 4.12, actor: 'bird', do: 'moveTo', to: { x: 172, y: 16 }, dur: 0.6, arc: 6 },
    // 咕嚕 3：籃子彈上天
    { at: 4.71, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.4 },
    { at: 4.71, actor: 'bear', do: 'flash', dur: 0.5 },
    { at: 4.87, actor: 'basket', do: 'hop', amount: 16, dur: 0.6 },
    { at: 4.87, actor: 'basket', do: 'spin', dur: 0.6, times: 2 },
    // 掉下來的食物，一口一個
    { at: 6.3, actor: 'f1', do: 'drop', dur: 0.5 },
    { at: 6.45, actor: 'f2', do: 'drop', dur: 0.5 },
    { at: 6.9, actor: 'f1', do: 'moveTo', to: { x: 30, y: 66 }, dur: 0.2 },
    { at: 7.1, actor: 'f1', do: 'vanish', dur: 0.1 },
    { at: 7.2, actor: 'f2', do: 'moveTo', to: { x: 30, y: 66 }, dur: 0.2 },
    { at: 7.4, actor: 'f2', do: 'vanish', dur: 0.1 },
    { at: 7.45, actor: 'bear', do: 'scaleTo', amount: 1.2, dur: 0.3 },
    { at: 7.75, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 螞蟻扛著三明治回來
    { at: 8.15, actor: 'a1', do: 'moveTo', to: { x: 126, y: 74.4 }, dur: 0.6 },
    { at: 8.15, actor: 'a2', do: 'moveTo', to: { x: 132, y: 74.4 }, dur: 0.6 },
    { at: 8.15, actor: 'a3', do: 'moveTo', to: { x: 138, y: 74.4 }, dur: 0.6 },
    { at: 8.15, actor: 'sandwich', do: 'moveTo', to: { x: 132, y: 70 }, dur: 0.6 },
    // 又咕嚕——是小螞蟻
    { at: 8.85, actor: 'bear', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.21, actor: 'a2', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 9.21, actor: 'a2', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 籃子噴出來的食物 → 月；野餐墊 → 土
    { at: 5.25, dur: 0.7, strokes: [0, 1, 2, 3], from: 'basket', color: '#D9534F' },
    { at: 5.75, dur: 0.6, strokes: [4, 5, 6], from: 'basket', style: 'drop', color: '#4F8A2E' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'bear', emoji: '🥪', dur: 0.6 },
    { at: 1.2, kind: 'burst', actor: 'bear', emoji: '〰️', n: 4, dur: 0.5, dy: 10 },
    { at: 1.63, kind: 'pop', actor: 'bear', emoji: '😳', dur: 0.4 },
    { at: 3.04, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.3 },
    { at: 3.58, kind: 'bubble', actor: 'bear', emoji: '😭', dur: 0.4 },
    { at: 4.01, kind: 'burst', actor: 'bear', emoji: '〰️', n: 6, dur: 0.6, dy: 10 },
    { at: 4.06, kind: 'pop', actor: 'bird', emoji: '❗', dur: 0.3 },
    { at: 4.71, kind: 'burst', actor: 'bear', emoji: '〰️', n: 8, dur: 0.6, dy: 10 },
    { at: 5.2, kind: 'burst', actor: 'basket', emoji: '🍎', n: 6, dur: 0.6 },
    { at: 7.75, kind: 'bubble', actor: 'bear', emoji: '😋', dur: 0.6 },
    { at: 8.85, kind: 'burst', actor: 'bear', emoji: '〰️', n: 4, dur: 0.4, dy: 10 },
    { at: 8.9, kind: 'pop', actor: 'bear', emoji: '❓', dur: 0.4 },
    { at: 9.21, kind: 'pop', actor: 'a2', emoji: '😳', dur: 0.6 },
    { at: 9.38, kind: 'bubble', actor: 'bear', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 4.01, dur: 0.4, do: 'shake', amount: 1.2 },
    { at: 4.71, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 30, y: 62 } },
    { at: 4.87, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.2, sfx: 'rumble' },
    { at: 1.63, say: '肚' },
    { at: 2.28, sfx: 'blip' },
    { at: 3.36, sfx: 'tap' },
    { at: 4.01, sfx: 'rumble' },
    { at: 4.71, sfx: 'rumble' },
    { at: 4.87, sfx: 'boing' },
    { at: 6.45, say: '肚' },
    { at: 7.1, sfx: 'gulp' },
    { at: 7.4, sfx: 'gulp' },
    { at: 7.75, say: '肚子' },
    { at: 7.75, sfx: 'tap' },
    { at: 8.85, sfx: 'rumble' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
