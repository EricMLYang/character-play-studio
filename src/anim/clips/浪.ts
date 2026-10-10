import type { Clip, Move } from '../clip'

// 浪：無尾熊划小船出海遇到暴風雨，小浪把船抬高、大浪把船拋上天，閃電一劈冒出超級巨浪，一拍下來把船甩到對面，
// 水花變成三點水、巨浪變成「良」。風雨停了，無尾熊鬆一口氣、看不起一道小小的浪——結果就是那道小浪把船整個翻過來。浪、浪、海浪
/** 無尾熊坐在船裡：一起動。 */
const both = (m: Omit<Move, 'actor'>): Move[] => ['koala', 'boat'].map((actor) => ({ ...m, actor }))

const clip: Clip = {
  char: '浪',
  meta: { theme: '暴風雨航海', cast: '無尾熊＋獨木舟＋海浪', gags: ['浪越來越大', '閃電劈出巨浪', '被拋到對面', '大浪沒事小浪翻船'] },
  duration: 10,
  bg: { top: '#1F2B48', bottom: '#3D557A', floor: '#2A7AB8', scenery: 'night' },
  actors: [
    { id: 'cloudA', emoji: '⛈️', x: 26, y: 15, size: 17.5, float: true },
    { id: 'cloudB', emoji: '⛈️', x: 130, y: 14, size: 20, float: true },
    { id: 'w3', emoji: '🌊', x: 112, y: 68.3, size: 20, hidden: true },
    { id: 'koala', emoji: '🐨', x: 40, y: 64, size: 12.5 },
    { id: 'boat', emoji: '🛶', x: 40, y: 68.1, size: 22.5 },
    { id: 'w1', emoji: '🌊', x: 175, y: 69.8, size: 13.8 },
    { id: 'w2', emoji: '🌊', x: 178, y: 68.3, size: 20 },
    { id: 'w4', emoji: '🌊', x: 175, y: 71.2, size: 10 },
  ],
  moves: [
    ...both({ at: 0, do: 'bounce', amount: 1.5, times: 2, dur: 1.0 }),
    // 小浪：船抬一下
    { at: 0.6, actor: 'w1', do: 'moveTo', to: { x: -20, y: 69.8 }, dur: 1.8 },
    ...both({ at: 1.52, do: 'hop', amount: 10, dur: 0.5 }),
    // 大浪：船被拋上天
    { at: 2.28, actor: 'w2', do: 'moveTo', to: { x: -25, y: 68.3 }, dur: 1.6 },
    ...both({ at: 3.14, do: 'hop', amount: 22, dur: 0.7 }),
    ...both({ at: 3.14, do: 'tilt', amount: 25, dur: 0.7 }),
    // 閃電劈出超級巨浪
    { at: 3.79, actor: 'w3', do: 'pop', dur: 0.3 },
    { at: 4.06, actor: 'w3', do: 'scaleTo', amount: 2.8, dur: 0.6 },
    ...both({ at: 4.22, do: 'shake', amount: 2, dur: 0.6 }),
    // 巨浪拍下來，船被甩到對面
    { at: 4.87, actor: 'w3', do: 'moveTo', to: { x: 62, y: 68.3 }, dur: 0.35 },
    { at: 5.08, actor: 'boat', do: 'moveTo', to: { x: 134, y: 68.3 }, arc: 35, dur: 0.8 },
    { at: 5.08, actor: 'koala', do: 'moveTo', to: { x: 134, y: 64 }, arc: 35, dur: 0.8 },
    { at: 5.7, actor: 'w3', do: 'vanish', dur: 0.3 },
    ...both({ at: 5.9, do: 'squash', amount: 0.3, dur: 0.3 }),
    // 風雨停了
    { at: 6.7, actor: 'cloudA', do: 'vanish', dur: 0.4 },
    { at: 6.8, actor: 'cloudB', do: 'vanish', dur: 0.4 },
    // 小小的浪來了……
    { at: 7.3, actor: 'w4', do: 'moveTo', to: { x: 152, y: 71.2 }, dur: 0.8 },
    { at: 7.68, actor: 'w4', do: 'bounce', amount: 1.5, times: 2, dur: 0.6 },
    // 一推，船翻過來
    { at: 8.4, actor: 'w4', do: 'moveTo', to: { x: 128, y: 71.2 }, dur: 0.3 },
    { at: 8.57, actor: 'boat', do: 'moveTo', to: { x: 134, y: 55 }, arc: 8, dur: 0.5 },
    { at: 8.57, actor: 'boat', do: 'rotateTo', amount: 180, dur: 0.5 },
    { at: 8.57, actor: 'koala', do: 'moveTo', to: { x: 134, y: 62 }, arc: 14, dur: 0.5 },
    { at: 8.57, actor: 'koala', do: 'spin', dur: 0.5 },
    { at: 8.84, actor: 'w4', do: 'moveTo', to: { x: 176, y: 71.2 }, dur: 0.8 },
  ],
  builds: [
    // 浪花的水滴 → 三點水；巨浪 → 良
    { at: 5.3, dur: 0.6, strokes: [0, 1, 2], from: { x: 62, y: 52 }, color: '#4FC3F7' },
    { at: 5.6, dur: 0.8, strokes: [3, 4, 5, 6, 7, 8, 9], from: 'w3', color: '#FFCA28' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'rain', actor: 'cloudA', n: 8, dur: 1.5 },
    { at: 0.3, kind: 'rain', actor: 'cloudB', n: 8, dur: 1.5 },
    { at: 0.4, kind: 'pop', actor: 'koala', emoji: '😬', dur: 0.6 },
    { at: 1.52, kind: 'rain', actor: 'cloudA', n: 8, dur: 1.5 },
    { at: 1.85, kind: 'rain', actor: 'cloudB', n: 8, dur: 1.5 },
    { at: 2.93, kind: 'zap', actor: 'cloudA', target: 'w2', dur: 0.3 },
    { at: 3.36, kind: 'pop', actor: 'koala', emoji: '😱', dur: 0.6 },
    { at: 3.14, kind: 'rain', actor: 'cloudA', n: 8, dur: 1.5 },
    { at: 3.47, kind: 'rain', actor: 'cloudB', n: 8, dur: 1.5 },
    { at: 3.9, kind: 'sweat', actor: 'koala' },
    { at: 4.11, kind: 'zap', actor: 'cloudB', target: 'w3', dur: 0.35 },
    { at: 4.33, kind: 'pop', actor: 'koala', emoji: '😨', dur: 0.5 },
    { at: 4.76, kind: 'rain', actor: 'cloudA', n: 8, dur: 1.5 },
    { at: 5.08, kind: 'rain', actor: 'cloudB', n: 8, dur: 1.5 },
    { at: 5.25, kind: 'burst', x: 62, y: 55, emoji: '💦', n: 8, dur: 0.6 },
    { at: 6, kind: 'dizzy', actor: 'koala', dur: 1.0 },
    { at: 7.1, kind: 'bubble', actor: 'koala', emoji: '😮‍💨', dur: 0.7 },
    { at: 7.77, kind: 'pop', actor: 'koala', emoji: '😏', dur: 0.6 },
    { at: 8.62, kind: 'burst', actor: 'boat', emoji: '💦', n: 6, dur: 0.5 },
    { at: 8.75, kind: 'pop', actor: 'w4', emoji: '😜', dur: 0.4 },
    { at: 9.11, kind: 'pop', actor: 'koala', emoji: '😑', dur: 0.8 },
    { at: 9.2, kind: 'sweat', actor: 'koala' },
  ],
  camera: [
    { at: 4.11, dur: 0.8, do: 'punch', amount: 0.2, to: { x: 90, y: 55 } },
    { at: 5.25, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: 2.93, dur: 0.05, level: -0.6 }, { at: 2.98, dur: 0.3, level: 0 },
    { at: 4.11, dur: 0.05, level: -0.85 }, { at: 4.17, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.6, sfx: 'splash' },
    { at: 1.63, say: '浪' },
    { at: 2.93, sfx: 'rumble' },
    { at: 3.14, sfx: 'splash' },
    { at: 4.11, sfx: 'rumble' },
    { at: 5.25, sfx: 'splash' },
    { at: 5.9, sfx: 'plop' },
    { at: 6.45, say: '浪' },
    { at: 7.55, say: '海浪' },
    { at: 8.57, sfx: 'splash' },
    { at: 9.02, sfx: 'bonk' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
