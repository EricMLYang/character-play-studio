import type { Clip } from '../clip'

// 胖：熊貓到操場減肥，雞教練一吹哨就跑步、深蹲，可是每練完一次就偷吃一個點心，越練越胖。最後用力一跳，
// 落地整個操場震起來，口袋裡的零食全噴出來變成「胖」。熊貓肚子晃呀晃；雞教練說「我示範」偷咬一口餅乾——自己也變圓滾滾。胖、胖、胖嘟嘟
const clip: Clip = {
  char: '胖',
  meta: { theme: '健身減肥', cast: '熊貓＋雞教練', gags: ['越練越胖', '偷吃點心', '一跳全場震', '教練也變胖'] },
  duration: 10,
  bg: { top: '#E7F2FF', bottom: '#D1E4FA', floor: '#DD7A55', scenery: 'track' },
  actors: [
    { id: 'donut', emoji: '🍩', x: 116, y: 73.9, size: 7.5, hidden: true },
    { id: 'panda', emoji: '🐼', x: 26, y: 68.6, size: 20, hidden: true },
    { id: 'burger', emoji: '🍔', x: 117, y: 60, size: 8.8, hidden: true, float: true },
    { id: 'coach', emoji: '🐓', x: 148, y: 71.2, size: 13.8, hidden: true },
    { id: 'cookie', emoji: '🍪', x: 140, y: 64, size: 6.2, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'panda', do: 'pop' },
    { at: 0.2, actor: 'coach', do: 'pop' },
    { at: 0.5, actor: 'coach', do: 'hop', dur: 0.3, amount: 4 },
    // 跑步
    { at: 1, actor: 'panda', do: 'moveTo', to: { x: 128, y: 68.6 }, dur: 0.6 },
    { at: 1, actor: 'panda', do: 'bounce', dur: 0.6, times: 4, amount: 2 },
    { at: 1.69, actor: 'donut', do: 'pop', dur: 0.25 },
    { at: 1.9, actor: 'donut', do: 'moveTo', to: { x: 127, y: 66 }, dur: 0.2, arc: 4 },
    { at: 2.06, actor: 'donut', do: 'vanish', dur: 0.1 },
    { at: 2.12, actor: 'panda', do: 'scaleTo', amount: 1.2, dur: 0.3 },
    // 深蹲三下
    { at: 2.71, actor: 'coach', do: 'hop', dur: 0.3, amount: 4 },
    { at: 2.87, actor: 'panda', do: 'squash', amount: 0.35, dur: 0.22 },
    { at: 3.14, actor: 'panda', do: 'squash', amount: 0.35, dur: 0.22 },
    { at: 3.41, actor: 'panda', do: 'squash', amount: 0.35, dur: 0.22 },
    { at: 3.68, actor: 'burger', do: 'pop', dur: 0.2 },
    { at: 3.84, actor: 'burger', do: 'moveTo', to: { x: 126, y: 62 }, dur: 0.15 },
    { at: 4.01, actor: 'burger', do: 'vanish', dur: 0.1 },
    { at: 4.06, actor: 'panda', do: 'scaleTo', amount: 1.2, dur: 0.3 },
    // 跳！只離地一點點，落地全場震
    { at: 4.54, actor: 'coach', do: 'hop', dur: 0.3, amount: 4 },
    { at: 4.65, actor: 'panda', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 4.92, actor: 'panda', do: 'hop', dur: 0.3, amount: 2.5 },
    { at: 5.25, actor: 'panda', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 5.25, actor: 'coach', do: 'hop', dur: 0.5, amount: 10 },
    { at: 5.25, actor: 'coach', do: 'spin', dur: 0.5 },
    // 肚子晃呀晃
    { at: 7.1, actor: 'panda', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 7.4, actor: 'panda', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 7.1, actor: 'panda', do: 'shake', dur: 0.7, amount: 1.2 },
    // 教練示範……偷咬一口
    { at: 8.12, actor: 'cookie', do: 'pop', dur: 0.2 },
    { at: 8.3, actor: 'cookie', do: 'moveTo', to: { x: 146, y: 69 }, dur: 0.15 },
    { at: 8.43, actor: 'cookie', do: 'vanish', dur: 0.1 },
    { at: 8.48, actor: 'coach', do: 'scaleTo', amount: 1.7, dur: 0.3 },
    { at: 8.83, actor: 'coach', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 9.06, actor: 'coach', do: 'hop', dur: 0.2, amount: 0.6 },
    { at: 9.01, actor: 'panda', do: 'bounce', dur: 0.8, times: 3, amount: 2 },
  ],
  builds: [
    // 口袋裡的零食全噴出來：甜甜圈 → 月；漢堡 → 半
    { at: 5.3, dur: 0.6, strokes: [0, 1, 2, 3], from: 'panda', color: '#B8641E' },
    { at: 5.65, dur: 0.7, strokes: [4, 5, 6, 7, 8], from: 'panda', color: '#D6336C' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.55, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'panda', emoji: '🏃', dur: 0.7 },
    { at: 0.5, kind: 'pop', actor: 'coach', emoji: '📣', dur: 0.5, dx: -12 },
    { at: 1, kind: 'puff', actor: 'panda' },
    { at: 1.63, kind: 'sweat', actor: 'panda' },
    { at: 2.17, kind: 'burst', actor: 'panda', emoji: '✨', n: 5, dur: 0.4 },
    { at: 2.71, kind: 'pop', actor: 'coach', emoji: '📣', dur: 0.5, dx: -12 },
    { at: 4.17, kind: 'pop', actor: 'coach', emoji: '😑', dur: 0.5, dx: -12 },
    { at: 4.54, kind: 'pop', actor: 'coach', emoji: '📣', dur: 0.4, dx: -12 },
    { at: 5.25, kind: 'puff', actor: 'panda' },
    { at: 5.25, kind: 'burst', actor: 'panda', emoji: '🍪', n: 6, dur: 0.5 },
    { at: 7.1, kind: 'pop', actor: 'panda', emoji: '😋', dur: 0.7, dx: -14 },
    { at: 8.52, kind: 'burst', actor: 'coach', emoji: '✨', n: 5, dur: 0.4, dx: -4 },
    { at: 8.74, kind: 'pop', actor: 'coach', emoji: '😳', dur: 0.7, dx: -14 },
    { at: 9.1, kind: 'pop', actor: 'panda', emoji: '😆', dur: 0.8, dx: -14 },
  ],
  camera: [
    { at: 2.12, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 126, y: 62 } },
    { at: 5.25, dur: 0.6, do: 'shake', amount: 2.5 },
  ],
  cues: [
    { at: 0.5, sfx: 'blip' },
    { at: 2.06, sfx: 'gulp' },
    { at: 2.17, sfx: 'boing' },
    { at: 2.22, say: '胖' },
    { at: 2.71, sfx: 'blip' },
    { at: 4.01, sfx: 'gulp' },
    { at: 4.11, sfx: 'boing' },
    { at: 4.54, sfx: 'blip' },
    { at: 5.25, sfx: 'rumble' },
    { at: 6.4, say: '胖' },
    { at: 7.4, say: '胖嘟嘟' },
    { at: 8.43, sfx: 'gulp' },
    { at: 8.52, sfx: 'boing' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
