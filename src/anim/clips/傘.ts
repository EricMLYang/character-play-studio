import type { Clip } from '../clip'

// 傘：下雨了，鴨子撐開傘。風一吹，傘翻過來變成一個碗，接了一碗雨水；再一吹，傘把鴨子整隻拉上天，最後傘飛走、鴨子掉進水坑，
// 傘在空中轉成「傘」，雨滴落下來變成中間的小人。傘飄回來幫鴨子擋雨——風又來，傘又翻過來，鴨子乾脆跳進去當船。傘、傘、雨傘
const clip: Clip = {
  char: '傘',
  meta: { theme: '颳風下雨', cast: '鴨子＋雨雲＋風', gags: ['傘被吹翻變碗', '被傘拉上天', '傘飛走又飛回來', '翻過來當船'] },
  duration: 10,
  bg: { top: '#C8D4E4', bottom: '#A8B9D0', floor: '#76879A', scenery: 'city' },
  actors: [
    { id: 'cloud', emoji: '🌧️', x: 80, y: 10, size: 18, hidden: true, float: true },
    { id: 'wind', emoji: '🌬️', x: 14, y: 30, size: 16, hidden: true, float: true },
    { id: 'umb', emoji: '🌂', x: 61, y: 58, size: 14, hidden: true, float: true },
    { id: 'duck', emoji: '🦆', x: 60, y: 71.5, size: 13, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'cloud', do: 'enter', from: { x: 180, y: 10 }, dur: 0.8 },
    { at: 0, actor: 'duck', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.6 },
    // 撐開傘
    { at: 1.0, actor: 'umb', do: 'pop', dur: 0.2 },
    { at: 1.3, actor: 'umb', do: 'swap', emoji: '☂️' },
    { at: 1.3, actor: 'umb', do: 'squash', amount: -0.3, dur: 0.3 },
    // 風一吹：傘翻過來變成碗
    { at: 1.8, actor: 'wind', do: 'pop', dur: 0.3 },
    { at: 2.05, actor: 'wind', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 2.35, actor: 'umb', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 3.3, actor: 'umb', do: 'rotateTo', amount: -180, dur: 0.2 },
    { at: 3.3, actor: 'duck', do: 'hop', amount: 3, dur: 0.25 },
    // 再吹：傘把鴨子拉上天
    { at: 3.5, actor: 'wind', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 3.85, actor: 'umb', do: 'moveTo', to: { x: 90, y: 26 }, dur: 0.5 },
    { at: 3.85, actor: 'duck', do: 'moveTo', to: { x: 89, y: 39 }, dur: 0.5 },
    { at: 4.35, actor: 'duck', do: 'tilt', amount: 15, dur: 0.3 },
    // 傘飛走，鴨子掉進水坑
    { at: 4.55, actor: 'umb', do: 'moveTo', to: { x: 146, y: 14 }, dur: 0.7 },
    { at: 4.55, actor: 'umb', do: 'spin', times: 3, dur: 0.7 },
    { at: 4.55, actor: 'duck', do: 'moveTo', to: { x: 127, y: 71.5 }, dur: 0.45 },
    { at: 5.0, actor: 'duck', do: 'squash', amount: 0.35, dur: 0.3 },
    // 傘飄回來擋雨
    { at: 6.9, actor: 'umb', do: 'moveTo', to: { x: 128, y: 58 }, dur: 0.5 },
    { at: 6.9, actor: 'cloud', do: 'moveTo', to: { x: 128, y: 10 }, dur: 0.5 },
    { at: 7.6, actor: 'duck', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 風又來：傘翻過來掉到地上，鴨子跳進去當船
    { at: 8.15, actor: 'wind', do: 'squash', amount: -0.4, dur: 0.3 },
    { at: 8.45, actor: 'umb', do: 'rotateTo', amount: 180, dur: 0.2 },
    { at: 8.5, actor: 'umb', do: 'moveTo', to: { x: 128, y: 71 }, dur: 0.3 },
    { at: 8.9, actor: 'duck', do: 'moveTo', to: { x: 128, y: 64 }, arc: 8, dur: 0.35 },
    { at: 9.25, actor: 'duck', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 9.25, actor: 'umb', do: 'tilt', amount: 8, dur: 0.6 },
  ],
  builds: [
    // 傘面 → 人字頂；雨滴 → 四個小人；傘柄 → 十
    { at: 5.1, dur: 0.4, strokes: [0, 1], from: 'umb', color: '#E0457B' },
    { at: 5.4, dur: 0.8, strokes: [2, 3, 4, 5, 6, 7, 8, 9], from: 'cloud', style: 'drop', color: '#3A8EDB' },
    { at: 6.0, dur: 0.4, strokes: [10, 11], from: 'umb', color: '#8A5A2E' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'rain', actor: 'cloud', n: 6, dur: 1.0 },
    { at: 0.9, kind: 'bubble', actor: 'duck', emoji: '😟', dur: 0.5 },
    { at: 2.3, kind: 'burst', actor: 'umb', emoji: '💨', n: 4, dur: 0.5 },
    { at: 2.4, kind: 'rain', actor: 'cloud', n: 6, dur: 0.8 },
    { at: 2.85, kind: 'bubble', actor: 'duck', emoji: '😑', dur: 0.5 },
    { at: 3.8, kind: 'burst', actor: 'umb', emoji: '💨', n: 6, dur: 0.5 },
    { at: 4.2, kind: 'sweat', actor: 'duck' },
    { at: 5.0, kind: 'fountain', actor: 'duck', emoji: '💧', n: 7, dur: 0.6 },
    { at: 5.2, kind: 'dizzy', actor: 'duck', dur: 0.8 },
    { at: 7.4, kind: 'rain', actor: 'cloud', n: 6, dur: 1.0 },
    { at: 7.6, kind: 'bubble', actor: 'duck', emoji: '😌', dur: 0.5, dx: -20 },
    { at: 8.4, kind: 'burst', actor: 'umb', emoji: '💨', n: 4, dur: 0.5 },
    { at: 8.55, kind: 'pop', actor: 'duck', emoji: '❗', dur: 0.4 },
    { at: 9.25, kind: 'burst', actor: 'duck', emoji: '💧', n: 5, dur: 0.5 },
    { at: 9.4, kind: 'bubble', actor: 'duck', emoji: '😎', dur: 0.6, dx: -20 },
    { at: 9.3, kind: 'pop', actor: 'wind', emoji: '❓', dur: 0.6 },
  ],
  camera: [
    { at: 4.0, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 90, y: 34 } },
    { at: 5.0, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.3, sfx: 'boing' },
    { at: 1.4, say: '傘' },
    { at: 2.3, sfx: 'whoosh' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 4.55, sfx: 'whoosh' },
    { at: 5.0, sfx: 'splash' },
    { at: 6.45, say: '傘' },
    { at: 7.45, say: '雨傘' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 9.25, sfx: 'splash' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
