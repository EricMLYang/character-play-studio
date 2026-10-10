import type { Clip } from '../clip'

// 臉：海底鬼臉比賽，河豚對著鏡子扮鬼臉，鏡子裡的自己每次都扮得更誇張：吐舌頭、鼓更大、轉更多圈。河豚氣到鼓到最大——「啵」破掉，
// 洩氣亂飛，噴出來的刺變成「臉」。鏡子裡的倒影突然變成幽靈，還從鏡子裡走出來揮手，河豚嚇到肚子朝上翻白肚。臉、臉、鬼臉
const clip: Clip = {
  char: '臉',
  meta: { theme: '海底鬼臉比賽', cast: '河豚＋鏡子倒影＋螃蟹評審', gags: ['鏡子裡的自己更誇張', '鼓到破掉洩氣亂飛', '倒影變幽靈走出來', '嚇到翻白肚'] },
  duration: 10,
  bg: { top: '#7FD3E6', bottom: '#2F8FB5', floor: '#E8D3A2', scenery: 'ocean' },
  actors: [
    { id: 'crab', emoji: '🦀', x: 20, y: 71.8, size: 12.5, hidden: true },
    { id: 'mirror', emoji: '🪞', x: 140, y: 67.8, size: 22, hidden: true },
    { id: 'reflection', emoji: '🐡', x: 140, y: 63, size: 11.2, hidden: true, float: true },
    { id: 'puffer', emoji: '🐡', x: 114, y: 58, size: 16.2, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'mirror', do: 'pop' },
    { at: 0.1, actor: 'reflection', do: 'pop' },
    { at: 0.2, actor: 'crab', do: 'pop' },
    { at: 0, actor: 'puffer', do: 'enter', from: { x: -15, y: 58 }, dur: 0.8 },
    // 吐舌頭：鏡子也吐
    { at: 1.2, actor: 'puffer', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 1.52, actor: 'reflection', do: 'tilt', amount: -20, dur: 0.3 },
    // 鼓起來：鏡子鼓更大
    { at: 2.06, actor: 'puffer', do: 'scaleTo', amount: 1.4, dur: 0.3 },
    { at: 2.5, actor: 'reflection', do: 'scaleTo', amount: 1.8, dur: 0.3 },
    // 轉一圈：鏡子轉三圈
    { at: 3.15, actor: 'puffer', do: 'spin', dur: 0.4 },
    { at: 3.47, actor: 'reflection', do: 'spin', times: 3, dur: 0.5 },
    // 氣到鼓最大
    { at: 4.12, actor: 'puffer', do: 'scaleTo', amount: 1.5, dur: 0.35 },
    { at: 4.55, actor: 'reflection', do: 'scaleTo', amount: 1.4, dur: 0.3 },
    { at: 4.61, actor: 'puffer', do: 'shake', amount: 1.5, dur: 0.45 },
    // 啵！洩氣亂飛
    { at: 5.09, actor: 'puffer', do: 'scaleTo', amount: 0.476, dur: 0.2 },
    { at: 5.15, actor: 'puffer', do: 'moveTo', to: { x: 72, y: 22 }, dur: 0.3 },
    { at: 5.45, actor: 'puffer', do: 'moveTo', to: { x: 28, y: 38 }, dur: 0.3 },
    { at: 5.75, actor: 'puffer', do: 'moveTo', to: { x: 40, y: 52 }, dur: 0.3 },
    { at: 5.15, actor: 'puffer', do: 'spin', times: 3, dur: 0.9 },
    { at: 6.3, actor: 'reflection', do: 'scaleTo', amount: 0.397, dur: 0.3 },
    { at: 6.6, actor: 'crab', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 倒影變成幽靈
    { at: 7.5, actor: 'reflection', do: 'swap', emoji: '👻' },
    { at: 7.5, actor: 'reflection', do: 'flash', dur: 0.6 },
    // 從鏡子裡走出來揮手
    { at: 8.42, actor: 'reflection', do: 'moveTo', to: { x: 122, y: 55 }, dur: 0.5 },
    { at: 8.42, actor: 'reflection', do: 'scaleTo', amount: 1.3, dur: 0.5 },
    // 河豚嚇到翻白肚
    { at: 8.95, actor: 'puffer', do: 'rotateTo', amount: 180, dur: 0.4 },
    { at: 9.39, actor: 'crab', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 破掉噴出來的刺 → 月、上半；倒影縮回去甩出來的 → 下面
    { at: 5.2, dur: 0.6, strokes: [0, 1, 2, 3], from: 'puffer', color: '#FF8C42' },
    { at: 5.6, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12], from: 'puffer', color: '#3D5A80' },
    { at: 6.3, dur: 0.5, strokes: [13, 14, 15, 16], from: 'reflection', color: '#EE6C4D' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'puffer', emoji: '🫧', dur: 1.0 },
    { at: 1.25, kind: 'pop', actor: 'puffer', emoji: '😛', dur: 0.5 },
    { at: 1.58, kind: 'pop', actor: 'reflection', emoji: '😝', dx: -12, dur: 0.5 },
    { at: 2.88, kind: 'pop', actor: 'puffer', emoji: '❓', dur: 0.4 },
    { at: 3.96, kind: 'bubble', actor: 'puffer', emoji: '😤', dy: 4, dur: 0.4 },
    { at: 5.09, kind: 'burst', x: 114, y: 52, dur: 0.45 },
    { at: 5.15, kind: 'burst', x: 114, y: 56, emoji: '💨', n: 6, dur: 0.5 },
    { at: 6.05, kind: 'dizzy', actor: 'puffer', dur: 1.0 },
    { at: 5.2, kind: 'pop', actor: 'crab', emoji: '😲', dur: 0.6 },
    { at: 7.55, kind: 'burst', actor: 'reflection', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.7, kind: 'pop', actor: 'puffer', emoji: '😨', dur: 0.6 },
    { at: 8.86, kind: 'pop', actor: 'reflection', emoji: '👋', dur: 0.7 },
    { at: 9.3, kind: 'zzz', actor: 'puffer', emoji: '🫧', dur: 0.8 },
    { at: 9.3, kind: 'pop', actor: 'crab', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 4.61, dur: 0.5, do: 'punch', amount: 0.25, to: { x: 118, y: 58 } },
    { at: 5.09, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.25, sfx: 'blip' },
    { at: 1.47, say: '臉' },
    { at: 2.06, sfx: 'bubble' },
    { at: 2.5, sfx: 'bubble' },
    { at: 3.15, sfx: 'whoosh' },
    { at: 3.47, sfx: 'whoosh' },
    { at: 4.12, sfx: 'bubble' },
    { at: 5.09, sfx: 'crack' },
    { at: 5.15, sfx: 'deflate' },
    { at: 6.85, say: '臉' },
    { at: 7.5, sfx: 'poof' },
    { at: 7.85, say: '鬼臉' },
    { at: 8.99, sfx: 'boing' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
