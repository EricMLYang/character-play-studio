import type { Clip } from '../clip'

// 肚：熊來野餐，肚子「咕嚕嚕」叫。剛拿出三明治，就被一排螞蟻扛走了；肚子叫得更大聲，鳥都嚇飛了；第三聲大到野餐籃彈上天，
// 食物噴出來變成「肚」。熊吃得肚子圓滾滾，拍拍肚子——結果又「咕嚕」一聲，大家都看熊，原來是扛三明治的小螞蟻肚子餓了。肚、肚、肚子
const clip: Clip = {
  char: '肚',
  meta: { theme: '野餐', cast: '熊＋野餐籃＋螞蟻＋小鳥', gags: ['肚子咕嚕漸強', '食物被螞蟻扛走', '叫到籃子彈上天', '原來是小螞蟻在叫'] },
  duration: 10,
  bg: { top: '#DDF4FF', bottom: '#C4ECCB', floor: '#7CC46A', scenery: 'hills' },
  actors: [
    { id: 'bird', emoji: '🐦', x: 140, y: 74, size: 7, hidden: true },
    { id: 'basket', emoji: '🧺', x: 46, y: 72.8, size: 10, hidden: true },
    { id: 'sandwich', emoji: '🥪', x: 46, y: 64, size: 7, hidden: true, float: true },
    { id: 'a1', emoji: '🐜', x: 62, y: 74.9, size: 5, hidden: true },
    { id: 'a2', emoji: '🐜', x: 68, y: 74.9, size: 5, hidden: true },
    { id: 'a3', emoji: '🐜', x: 74, y: 74.9, size: 5, hidden: true },
    { id: 'bear', emoji: '🐻', x: 28, y: 70.3, size: 16, hidden: true },
    { id: 'f1', emoji: '🍙', x: 44, y: 73.6, size: 7, hidden: true },
    { id: 'f2', emoji: '🍉', x: 50, y: 73.6, size: 7, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -14, y: 70.3 }, dur: 0.6 },
    { at: 0.4, actor: 'basket', do: 'pop' },
    { at: 0.5, actor: 'bird', do: 'pop' },
    // 咕嚕 1
    { at: 1.2, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.5 },
    // 拿出三明治，被螞蟻扛走
    { at: 2.0, actor: 'basket', do: 'shake', amount: 1, dur: 0.3 },
    { at: 2.2, actor: 'sandwich', do: 'pop' },
    { at: 2.2, actor: 'a1', do: 'enter', from: { x: 168, y: 74.9 }, dur: 0.6 },
    { at: 2.25, actor: 'a2', do: 'enter', from: { x: 174, y: 74.9 }, dur: 0.6 },
    { at: 2.3, actor: 'a3', do: 'enter', from: { x: 180, y: 74.9 }, dur: 0.6 },
    { at: 2.9, actor: 'sandwich', do: 'moveTo', to: { x: 68, y: 70 }, dur: 0.3 },
    { at: 3.2, actor: 'sandwich', do: 'moveTo', to: { x: 178, y: 70 }, dur: 1.0 },
    { at: 3.2, actor: 'a1', do: 'moveTo', to: { x: 172, y: 74.9 }, dur: 1.0 },
    { at: 3.2, actor: 'a2', do: 'moveTo', to: { x: 178, y: 74.9 }, dur: 1.0 },
    { at: 3.2, actor: 'a3', do: 'moveTo', to: { x: 184, y: 74.9 }, dur: 1.0 },
    { at: 3.2, actor: 'a1', do: 'bounce', amount: 1, times: 5, dur: 1.0 },
    { at: 3.2, actor: 'a3', do: 'bounce', amount: 1, times: 5, dur: 1.0 },
    // 咕嚕 2：鳥嚇飛
    { at: 3.8, actor: 'bear', do: 'shake', amount: 2, dur: 0.6 },
    { at: 3.9, actor: 'bird', do: 'moveTo', to: { x: 172, y: 16 }, dur: 0.6, arc: 6 },
    // 咕嚕 3：籃子彈上天
    { at: 4.45, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.4 },
    { at: 4.45, actor: 'bear', do: 'flash', dur: 0.5 },
    { at: 4.6, actor: 'basket', do: 'hop', amount: 16, dur: 0.6 },
    { at: 4.6, actor: 'basket', do: 'spin', dur: 0.6, times: 2 },
    // 掉下來的食物，一口一個
    { at: 6.0, actor: 'f1', do: 'drop', dur: 0.5 },
    { at: 6.15, actor: 'f2', do: 'drop', dur: 0.5 },
    { at: 6.6, actor: 'f1', do: 'moveTo', to: { x: 30, y: 66 }, dur: 0.2 },
    { at: 6.8, actor: 'f1', do: 'vanish', dur: 0.1 },
    { at: 6.9, actor: 'f2', do: 'moveTo', to: { x: 30, y: 66 }, dur: 0.2 },
    { at: 7.1, actor: 'f2', do: 'vanish', dur: 0.1 },
    { at: 7.15, actor: 'bear', do: 'scaleTo', amount: 1.2, dur: 0.3 },
    { at: 7.45, actor: 'bear', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 螞蟻扛著三明治回來
    { at: 7.9, actor: 'a1', do: 'moveTo', to: { x: 126, y: 74.9 }, dur: 0.6 },
    { at: 7.9, actor: 'a2', do: 'moveTo', to: { x: 132, y: 74.9 }, dur: 0.6 },
    { at: 7.9, actor: 'a3', do: 'moveTo', to: { x: 138, y: 74.9 }, dur: 0.6 },
    { at: 7.9, actor: 'sandwich', do: 'moveTo', to: { x: 132, y: 70 }, dur: 0.6 },
    // 又咕嚕——是小螞蟻
    { at: 8.7, actor: 'bear', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.1, actor: 'a2', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 9.1, actor: 'a2', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 籃子噴出來的食物 → 月；野餐墊 → 土
    { at: 4.95, dur: 0.7, strokes: [0, 1, 2, 3], from: 'basket', color: '#D9534F' },
    { at: 5.45, dur: 0.6, strokes: [4, 5, 6], from: 'basket', style: 'drop', color: '#4F8A2E' },
  ],
  glyph: [{ at: 6.15, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'bear', emoji: '🥪', dur: 0.6 },
    { at: 1.2, kind: 'burst', actor: 'bear', emoji: '〰️', n: 4, dur: 0.5, dy: 10 },
    { at: 1.6, kind: 'pop', actor: 'bear', emoji: '😳', dur: 0.4 },
    { at: 2.9, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.3 },
    { at: 3.4, kind: 'bubble', actor: 'bear', emoji: '😭', dur: 0.4 },
    { at: 3.8, kind: 'burst', actor: 'bear', emoji: '〰️', n: 6, dur: 0.6, dy: 10 },
    { at: 3.85, kind: 'pop', actor: 'bird', emoji: '❗', dur: 0.3 },
    { at: 4.45, kind: 'burst', actor: 'bear', emoji: '〰️', n: 8, dur: 0.6, dy: 10 },
    { at: 4.9, kind: 'burst', actor: 'basket', emoji: '🍎', n: 6, dur: 0.6 },
    { at: 7.45, kind: 'bubble', actor: 'bear', emoji: '😋', dur: 0.6 },
    { at: 8.7, kind: 'burst', actor: 'bear', emoji: '〰️', n: 4, dur: 0.4, dy: 10 },
    { at: 8.75, kind: 'pop', actor: 'bear', emoji: '❓', dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'a2', emoji: '😳', dur: 0.6 },
    { at: 9.3, kind: 'bubble', actor: 'bear', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 3.8, dur: 0.4, do: 'shake', amount: 1.2 },
    { at: 4.45, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 30, y: 62 } },
    { at: 4.6, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.2, sfx: 'rumble' },
    { at: 1.6, say: '肚' },
    { at: 2.2, sfx: 'blip' },
    { at: 3.2, sfx: 'tap' },
    { at: 3.8, sfx: 'rumble' },
    { at: 4.45, sfx: 'rumble' },
    { at: 4.6, sfx: 'boing' },
    { at: 6.15, say: '肚' },
    { at: 6.8, sfx: 'gulp' },
    { at: 7.1, sfx: 'gulp' },
    { at: 7.45, say: '肚子' },
    { at: 7.45, sfx: 'tap' },
    { at: 8.7, sfx: 'rumble' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
