import type { Clip } from '../clip'

// 瓜：河馬和小老鼠比賽吐西瓜籽。河馬一吐就飛到終點旗；小老鼠吐在自己腳邊。小老鼠深吸一口氣要用力吐——結果把籽吞下去了！
// 開始打嗝，每打一個嗝就射出一筆，變成「瓜」，贏到超大西瓜。最後又一個嗝，把自己彈到河馬頭上。瓜、瓜、西瓜
const clip: Clip = {
  char: '瓜',
  meta: { theme: '吐西瓜籽比賽', cast: '河馬＋小老鼠', gags: ['大小對比', '吐到自己腳邊', '打嗝連發'] },
  duration: 10,
  bg: { top: '#D8F0FF', bottom: '#FFF3D6', floor: '#E59E5C', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🚩', x: 150, y: 68, size: 13, hidden: true },
    { id: 'prize', emoji: '🍉', x: 136, y: 66, size: 24, hidden: true },
    { id: 'hippo', emoji: '🦛', x: 22, y: 66, size: 26, hidden: true, flip: true },
    { id: 'mouse', emoji: '🐁', x: 45, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'hm', emoji: '🍉', x: 34, y: 58, size: 9, hidden: true, float: true },
    { id: 'mm', emoji: '🍉', x: 52, y: 67, size: 6, hidden: true, float: true },
    { id: 's1', emoji: '⚫', x: 34, y: 58, size: 3.5, hidden: true, float: true },
    { id: 's2', emoji: '⚫', x: 52, y: 68, size: 3, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flag', do: 'pop' },
    { at: 0, actor: 'hippo', do: 'pop' },
    { at: 0.15, actor: 'mouse', do: 'pop' },
    { at: 0.3, actor: 'hm', do: 'pop' }, { at: 0.35, actor: 'mm', do: 'pop' },
    // 兩個一起大口吃西瓜
    { at: 0.9, actor: 'hm', do: 'vanish', dur: 0.15 },
    { at: 0.9, actor: 'mm', do: 'vanish', dur: 0.15 },
    { at: 0.9, actor: 'hippo', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 0.9, actor: 'mouse', do: 'squash', amount: 0.2, dur: 0.3 },
    // 河馬：一吐就到終點
    { at: 1.5, actor: 'hippo', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.8, actor: 's1', do: 'pop', dur: 0.05 },
    { at: 1.8, actor: 's1', do: 'moveTo', to: { x: 148, y: 74 }, dur: 0.9, arc: 30 },
    { at: 2.7, actor: 'flag', do: 'shake', amount: 1, dur: 0.4 },
    // 小老鼠：吐在自己腳邊
    { at: 3.1, actor: 'mouse', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 3.4, actor: 's2', do: 'pop', dur: 0.05 },
    { at: 3.4, actor: 's2', do: 'moveTo', to: { x: 54, y: 76 }, dur: 0.35, arc: 3 },
    // 深吸一口氣……咕嚕，吞下去了
    { at: 4.4, actor: 'mouse', do: 'squash', amount: -0.5, dur: 0.6 },
    { at: 4.4, actor: 'mouse', do: 'flash', dur: 0.6 },
    { at: 4.6, actor: 's2', do: 'moveTo', to: { x: 46, y: 68 }, dur: 0.3 },
    { at: 4.9, actor: 's2', do: 'vanish', dur: 0.1 },
    // 打嗝連發
    { at: 5.4, actor: 'mouse', do: 'hop', amount: 5, dur: 0.25 },
    { at: 5.9, actor: 'mouse', do: 'hop', amount: 5, dur: 0.25 },
    { at: 6.4, actor: 'mouse', do: 'hop', amount: 5, dur: 0.25 },
    { at: 6.0, actor: 's1', do: 'vanish', dur: 0.2 },
    // 贏到超大西瓜
    { at: 7.5, actor: 'prize', do: 'drop', dur: 0.6 },
    { at: 7.9, actor: 'mouse', do: 'bounce', dur: 0.6, times: 2, amount: 3 },
    // 又一個嗝，把自己彈到河馬頭上
    { at: 8.7, actor: 'mouse', do: 'moveTo', to: { x: 20, y: 54 }, dur: 0.5, arc: 16 },
    { at: 8.7, actor: 'mouse', do: 'spin', times: -1, dur: 0.5 },
    { at: 9.2, actor: 'hippo', do: 'squash', amount: 0.15, dur: 0.25 },
  ],
  builds: [
    // 每打一個嗝射出一筆
    { at: 5.4, dur: 0.4, strokes: [1], from: 'mouse', color: '#2E8B3A' },
    { at: 5.9, dur: 0.4, strokes: [0], from: 'mouse', color: '#2E8B3A' },
    { at: 6.4, dur: 0.6, strokes: [2, 3, 4], from: 'mouse', color: '#E2364E' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'bubble', actor: 'hippo', emoji: '😤', dur: 0.6 },
    { at: 2.75, kind: 'burst', actor: 'flag', emoji: '✨', n: 5, dur: 0.5, dx: -6 },
    { at: 2.8, kind: 'bubble', actor: 'hippo', emoji: '😎', dur: 0.7 },
    { at: 3.8, kind: 'pop', actor: 'mouse', emoji: '😳', dur: 0.6 },
    { at: 3.9, kind: 'pop', actor: 'hippo', emoji: '😆', dur: 0.6, dx: -10 },
    { at: 4.95, kind: 'pop', actor: 'mouse', emoji: '😨', dur: 0.4 },
    { at: 5.4, kind: 'burst', actor: 'mouse', emoji: '🫧', n: 4, dur: 0.35 },
    { at: 5.9, kind: 'burst', actor: 'mouse', emoji: '🫧', n: 4, dur: 0.35 },
    { at: 6.4, kind: 'burst', actor: 'mouse', emoji: '🫧', n: 4, dur: 0.35 },
    { at: 7.0, kind: 'pop', actor: 'hippo', emoji: '😲', dur: 0.7, dx: -10 },
    { at: 8.0, kind: 'burst', actor: 'prize', emoji: '✨', n: 7, dur: 0.6 },
    { at: 8.65, kind: 'burst', actor: 'mouse', emoji: '🫧', n: 4, dur: 0.35 },
    { at: 9.3, kind: 'pop', actor: 'hippo', emoji: '😳', dur: 0.7, dx: -12, dy: 8 },
  ],
  camera: [
    { at: 4.4, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 40, y: 64 } },
  ],
  cues: [
    { at: 0.9, sfx: 'gulp' },
    { at: 1.2, say: '瓜' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 2.7, sfx: 'plop' },
    { at: 3.6, sfx: 'plop' },
    { at: 4.85, sfx: 'gulp' },
    { at: 5.4, sfx: 'hic' }, { at: 5.9, sfx: 'hic' }, { at: 6.4, sfx: 'hic' },
    { at: 8.05, sfx: 'boing' },
    { at: 7.2, say: '瓜' },
    { at: 8.25, say: '西瓜' },
    { at: 8.7, sfx: 'hic' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
