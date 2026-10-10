import type { Clip } from '../clip'

// 呆：熊貓坐著發呆，一動也不動。一顆球飛過來「咚」打到頭——還在發呆；小鳥飛來在牠頭上築巢——還在發呆；
// 下起雨來淋得溼答答——還是發呆！一顆甜甜圈從旁邊滾過去，熊貓「咻」地撲過去，小鳥、鳥巢、雨滴飛成「呆」。吃完……又開始發呆。呆、呆、發呆
const clip: Clip = {
  char: '呆',
  meta: { theme: '發呆', cast: '熊貓＋小鳥＋甜甜圈', gags: ['怎麼樣都不動', '只對吃的有反應', '吃完又發呆'] },
  duration: 10,
  bg: { top: '#E7F6E7', bottom: '#F7FBF2', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'panda', emoji: '🐼', x: 40, y: 67, size: 24, hidden: true },
    { id: 'ball', emoji: '⚽', x: 180, y: 40, size: 10, hidden: true, float: true },
    { id: 'nest', emoji: '🪺', x: 40, y: 54, size: 11, hidden: true, float: true },
    { id: 'bird', emoji: '🐦', x: 40, y: 48, size: 10, hidden: true, float: true },
    { id: 'cloud', emoji: '🌧️', x: 40, y: 22, size: 18, hidden: true, float: true },
    { id: 'donut', emoji: '🍩', x: 180, y: 72, size: 11, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'panda', do: 'pop' },
    // 球飛過來打到頭
    { at: 1.4, actor: 'ball', do: 'pop', dur: 0.05 },
    { at: 1.4, actor: 'ball', do: 'moveTo', to: { x: 42, y: 54 }, dur: 0.5 },
    { at: 1.9, actor: 'ball', do: 'moveTo', to: { x: 110, y: 74 }, dur: 0.6, arc: 14 },
    { at: 2.5, actor: 'ball', do: 'vanish', dur: 0.2 },
    // 小鳥飛來在頭上築巢
    { at: 3.0, actor: 'bird', do: 'enter', from: { x: 175, y: 20 }, dur: 0.7 },
    { at: 3.7, actor: 'nest', do: 'pop', dur: 0.3 },
    { at: 4.0, actor: 'bird', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
    // 下起雨來——淋得溼答答
    { at: 4.6, actor: 'cloud', do: 'pop', dur: 0.3 },
    // 甜甜圈滾過去——熊貓咻地撲過去
    { at: 5.9, actor: 'donut', do: 'pop', dur: 0.01 },
    { at: 5.9, actor: 'donut', do: 'moveTo', to: { x: 130, y: 72 }, dur: 0.6 },
    { at: 5.9, actor: 'donut', do: 'spin', times: -2, dur: 0.6 },
    { at: 6.5, actor: 'panda', do: 'flash', dur: 0.3 },
    { at: 6.7, actor: 'panda', do: 'moveTo', to: { x: 126, y: 67 }, dur: 0.35 },
    { at: 6.7, actor: 'nest', do: 'vanish', dur: 0.2 },
    { at: 6.7, actor: 'bird', do: 'vanish', dur: 0.2 },
    { at: 6.7, actor: 'cloud', do: 'vanish', dur: 0.2 },
    { at: 7.05, actor: 'donut', do: 'vanish', dur: 0.1 },
    { at: 7.1, actor: 'panda', do: 'squash', amount: 0.3, dur: 0.3 },
    // 吃完……又開始發呆
    { at: 9.0, actor: 'panda', do: 'squash', amount: 0.1, dur: 0.5 },
  ],
  builds: [
    // 飛走的鳥巢 → 口；雨滴 → 木
    { at: 6.75, dur: 0.5, strokes: [0, 1, 2], from: 'nest', color: '#8A5A3B' },
    { at: 7.05, dur: 0.6, strokes: [3, 4, 5, 6], from: 'cloud', color: '#3D8BEF' },
  ],
  glyph: [{ at: 7.7, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'panda', emoji: '😶', dur: 1.0 },
    { at: 1.9, kind: 'burst', actor: 'panda', dur: 0.4 },
    { at: 2.3, kind: 'pop', actor: 'panda', emoji: '😶', dur: 0.6 },
    { at: 4.0, kind: 'zzz', actor: 'bird', emoji: '🎵', dur: 1.0 },
    { at: 4.9, kind: 'rain', actor: 'cloud', n: 8, dur: 1.0, dy: 6 },
    { at: 5.2, kind: 'pop', actor: 'panda', emoji: '😶', dur: 0.6, dx: -14 },
    { at: 6.4, kind: 'pop', actor: 'panda', emoji: '❗', dur: 0.4 },
    { at: 6.7, kind: 'puff', actor: 'panda' },
    { at: 7.1, kind: 'burst', actor: 'panda', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.9, kind: 'bubble', actor: 'panda', emoji: '😶', dur: 1.0 },
  ],
  camera: [
    { at: 6.5, dur: 0.7, do: 'punch', amount: 0.15, to: { x: 80, y: 60 } },
  ],
  cues: [
    { at: 0.6, say: '呆' },
    { at: 1.9, sfx: 'bonk' },
    { at: 3.7, sfx: 'blip' },
    { at: 4.9, sfx: 'splash' },
    { at: 5.9, sfx: 'slide' },
    { at: 6.6, sfx: 'whoosh' },
    { at: 7.05, sfx: 'gulp' },
    { at: 7.75, say: '呆' },
    { at: 8.65, say: '發呆' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
