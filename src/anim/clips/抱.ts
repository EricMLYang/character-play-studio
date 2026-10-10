import type { Clip } from '../clip'

// 抱：小刺蝟好想抱抱。抱熊貓，熊貓被刺到跳超高；跳起來抱氣球，氣球「砰」地破掉。刺蝟難過的時候，地上冒出一棵仙人掌——
// 刺刺配刺刺剛剛好！抱在一起冒出愛心，變成「抱」。抱、抱、抱抱
const clip: Clip = {
  char: '抱',
  meta: { theme: '刺蝟抱抱', cast: '刺蝟＋熊貓＋仙人掌', gags: ['抱誰誰痛', '抱破氣球', '刺刺配刺刺剛剛好'] },
  duration: 10,
  bg: { top: '#DDF3FF', bottom: '#FFE9C7', floor: '#E6C590', scenery: 'desert' },
  actors: [
    { id: 'cactus', emoji: '🌵', x: 30, y: 68, size: 21, hidden: true },
    { id: 'panda', emoji: '🐼', x: 122, y: 68.5, size: 20, hidden: true },
    { id: 'balloon', emoji: '🎈', x: 80, y: 42, size: 15, hidden: true, float: true },
    { id: 'hog', emoji: '🦔', x: 28, y: 70.5, size: 15, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hog', do: 'enter', from: { x: -10, y: 70.5 }, dur: 0.7 },
    { at: 0.2, actor: 'panda', do: 'pop' },
    { at: 0.4, actor: 'balloon', do: 'pop' },
    { at: 0.6, actor: 'balloon', do: 'bounce', amount: 1.5, times: 4, dur: 3.2 },
    { at: 1.1, actor: 'hog', do: 'squash', amount: -0.3, dur: 0.4 },
    // 抱熊貓：被刺到跳超高
    { at: 1.8, actor: 'hog', do: 'moveTo', to: { x: 108, y: 70.5 }, dur: 0.5 },
    { at: 2.3, actor: 'hog', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 2.4, actor: 'panda', do: 'hop', amount: 24, dur: 0.6 },
    { at: 3.0, actor: 'panda', do: 'moveTo', to: { x: 146, y: 68.5 }, dur: 0.35 },
    // 跳起來抱氣球：砰
    { at: 3.9, actor: 'hog', do: 'flip' },
    { at: 4.0, actor: 'hog', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 4.2, actor: 'hog', do: 'moveTo', to: { x: 82, y: 50 }, arc: 6, dur: 0.4 },
    { at: 4.6, actor: 'balloon', do: 'vanish', dur: 0.05 },
    { at: 4.7, actor: 'hog', do: 'moveTo', to: { x: 78, y: 70.5 }, dur: 0.35 },
    { at: 5.05, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.3 },
    // 仙人掌冒出來：剛剛好！
    { at: 6.0, actor: 'cactus', do: 'pop', dur: 0.4 },
    { at: 6.5, actor: 'hog', do: 'moveTo', to: { x: 44, y: 70.5 }, dur: 0.4 },
    { at: 6.9, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.45 },
    { at: 6.9, actor: 'cactus', do: 'squash', amount: 0.2, dur: 0.45 },
    // 抱抱
    { at: 8.9, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 8.9, actor: 'cactus', do: 'squash', amount: 0.2, dur: 0.6 },
  ],
  builds: [
    // 抱在一起冒出來的愛心
    { at: 7.0, dur: 0.5, strokes: [0, 1, 2], from: 'cactus', color: '#3E9B4F' },
    { at: 7.3, dur: 0.7, strokes: [3, 4, 5, 6, 7], from: 'hog', color: '#E8508A' },
  ],
  glyph: [{ at: 8.0, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'hog', emoji: '🤗', dur: 1.0 },
    { at: 2.4, kind: 'burst', actor: 'panda', dur: 0.4 },
    { at: 2.45, kind: 'pop', actor: 'panda', emoji: '😣', dur: 0.7, dx: -12 },
    { at: 3.4, kind: 'sweat', actor: 'panda' },
    { at: 3.6, kind: 'pop', actor: 'hog', emoji: '🎈', dur: 0.5 },
    { at: 4.6, kind: 'burst', actor: 'hog', dur: 0.45, dy: -4 },
    { at: 5.1, kind: 'dizzy', actor: 'hog', dur: 0.8 },
    { at: 5.5, kind: 'bubble', actor: 'hog', emoji: '😢', dur: 0.6 },
    { at: 6.2, kind: 'pop', actor: 'hog', emoji: '❗', dur: 0.4 },
    { at: 6.9, kind: 'burst', actor: 'hog', emoji: '💕', n: 6, dur: 0.7, dx: -6 },
    { at: 8.9, kind: 'burst', actor: 'hog', emoji: '💕', n: 6, dur: 0.8, dx: -6 },
    { at: 8.2, kind: 'bubble', actor: 'panda', emoji: '🥺', dur: 1.0, dx: -14 },
  ],
  camera: [
    { at: 4.6, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 6.9, dur: 1.0, do: 'punch', amount: 0.3, to: { x: 38, y: 62 } },
  ],
  cues: [
    { at: 1.2, say: '抱' },
    { at: 2.4, sfx: 'boing' },
    { at: 4.6, sfx: 'crack' },
    { at: 4.7, sfx: 'deflate' },
    { at: 6.0, sfx: 'plop' },
    { at: 6.9, sfx: 'blip' },
    { at: 8.05, say: '抱' },
    { at: 9.0, say: '抱抱' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
