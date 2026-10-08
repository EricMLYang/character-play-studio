import type { Clip } from '../clip'

// 抱：小刺蝟好想抱抱。抱熊貓，熊貓被刺到跳超高；抱氣球，氣球「砰」地破掉。刺蝟難過的時候，地上冒出一棵仙人掌——
// 刺刺配刺刺剛剛好，抱在一起冒出愛心變成「抱」。熊貓看了也想學，跑去抱另一棵仙人掌，又被刺到飛上天。抱、抱、抱抱
const clip: Clip = {
  char: '抱',
  meta: { theme: '刺蝟抱抱', cast: '刺蝟＋熊貓＋仙人掌', gags: ['抱誰誰痛', '抱破氣球', '刺刺配刺刺剛剛好', '學人抱仙人掌'] },
  duration: 10,
  bg: { top: '#E8F7FF', bottom: '#FFE9C7', floor: '#E6C590', scenery: 'desert' },
  actors: [
    { id: 'cactus', emoji: '🌵', x: 32, y: 70.3, size: 16, hidden: true },
    { id: 'cactus2', emoji: '🌵', x: 126, y: 70.3, size: 16, hidden: true },
    { id: 'panda', emoji: '🐼', x: 120, y: 70.3, size: 16, hidden: true },
    { id: 'balloon', emoji: '🎈', x: 80, y: 48, size: 12, hidden: true, float: true },
    { id: 'hog', emoji: '🦔', x: 30, y: 72, size: 12, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hog', do: 'enter', from: { x: -10, y: 72 }, dur: 0.6 },
    { at: 0.2, actor: 'panda', do: 'pop' },
    { at: 0.4, actor: 'balloon', do: 'pop' },
    { at: 0.6, actor: 'balloon', do: 'bounce', amount: 1.5, times: 4, dur: 2.6 },
    { at: 1.3, actor: 'hog', do: 'squash', amount: -0.35, dur: 0.4 },
    // 抱熊貓：被刺到跳超高
    { at: 1.7, actor: 'hog', do: 'moveTo', to: { x: 108, y: 72 }, dur: 0.45 },
    { at: 1.8, actor: 'panda', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 2.15, actor: 'panda', do: 'hop', amount: 22, dur: 0.5 },
    { at: 2.7, actor: 'panda', do: 'moveTo', to: { x: 146, y: 70.3 }, dur: 0.3 },
    // 抱氣球：砰
    { at: 3.1, actor: 'hog', do: 'flip' },
    { at: 3.3, actor: 'hog', do: 'moveTo', to: { x: 80, y: 56 }, arc: 6, dur: 0.35 },
    { at: 3.65, actor: 'balloon', do: 'vanish', dur: 0.05 },
    { at: 3.75, actor: 'hog', do: 'moveTo', to: { x: 78, y: 72 }, dur: 0.3 },
    { at: 4.05, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.25 },
    // 仙人掌冒出來：剛剛好！
    { at: 4.5, actor: 'cactus', do: 'pop', dur: 0.4 },
    { at: 4.9, actor: 'hog', do: 'moveTo', to: { x: 45, y: 72 }, dur: 0.35 },
    { at: 5.25, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 5.25, actor: 'cactus', do: 'squash', amount: 0.2, dur: 0.4 },
    // 抱抱
    { at: 7.4, actor: 'hog', do: 'squash', amount: 0.3, dur: 0.5 },
    { at: 7.4, actor: 'cactus', do: 'squash', amount: 0.2, dur: 0.5 },
    // 熊貓學人抱仙人掌
    { at: 8.0, actor: 'cactus2', do: 'pop', dur: 0.3 },
    { at: 8.3, actor: 'panda', do: 'moveTo', to: { x: 136, y: 70.3 }, dur: 0.3 },
    { at: 8.6, actor: 'panda', do: 'hop', amount: 40, dur: 0.7 },
    { at: 9.3, actor: 'panda', do: 'squash', amount: 0.35, dur: 0.3 },
  ],
  builds: [
    // 抱在一起冒出來的愛心
    { at: 5.4, dur: 0.5, strokes: [0, 1, 2], from: 'cactus', color: '#3E9B4F' },
    { at: 5.7, dur: 0.7, strokes: [3, 4, 5, 6, 7], from: 'hog', color: '#E8508A' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'bubble', actor: 'hog', emoji: '🤗', dur: 0.7 },
    { at: 2.15, kind: 'burst', actor: 'panda', dur: 0.4 },
    { at: 2.2, kind: 'pop', actor: 'panda', emoji: '😣', dur: 0.5, dx: -12 },
    { at: 2.9, kind: 'sweat', actor: 'panda' },
    { at: 3.15, kind: 'pop', actor: 'hog', emoji: '💡', dur: 0.4 },
    { at: 3.65, kind: 'burst', actor: 'hog', dur: 0.4, dy: -4 },
    { at: 4.1, kind: 'dizzy', actor: 'hog', dur: 0.5 },
    { at: 4.6, kind: 'bubble', actor: 'hog', emoji: '😢', dur: 0.4 },
    { at: 4.75, kind: 'pop', actor: 'hog', emoji: '❗', dur: 0.4 },
    { at: 5.3, kind: 'burst', actor: 'hog', emoji: '💕', n: 6, dur: 0.6, dx: -6 },
    { at: 7.45, kind: 'burst', actor: 'hog', emoji: '💕', n: 6, dur: 0.7, dx: -6 },
    { at: 7.9, kind: 'pop', actor: 'panda', emoji: '💡', dur: 0.4, dx: -12 },
    { at: 8.6, kind: 'burst', actor: 'panda', dur: 0.4 },
    { at: 9.3, kind: 'dizzy', actor: 'panda', dur: 0.7 },
    { at: 9.3, kind: 'pop', actor: 'hog', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 3.65, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: 5.25, dur: 0.8, do: 'punch', amount: 0.3, to: { x: 40, y: 64 } },
    { at: 8.6, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.35, say: '抱' },
    { at: 2.15, sfx: 'boing' },
    { at: 3.65, sfx: 'crack' },
    { at: 3.75, sfx: 'deflate' },
    { at: 4.5, sfx: 'plop' },
    { at: 5.25, sfx: 'blip' },
    { at: 6.45, say: '抱' },
    { at: 7.45, say: '抱抱' },
    { at: 8.6, sfx: 'boing' },
    { at: 9.3, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
