import type { Clip } from '../clip'

// 鹿：麋鹿要拉聖誕雪橇，用力拉——拉不動；更用力——被繩子彈回來；聖誕老人還再加一盒禮物！兔子把紅蘿蔔一丟，
// 麋鹿「咻」地衝出去，聖誕老人倒栽蔥插進雪裡，禮物飛成「鹿」。最後小兔子拉起繩子，輕輕鬆鬆把整台雪橇拉走了。鹿、鹿、麋鹿
const clip: Clip = {
  char: '鹿',
  meta: { theme: '聖誕雪橇', cast: '麋鹿＋聖誕老人＋兔子', gags: ['拉不動漸強', '紅蘿蔔一丟衝太快', '倒栽蔥插進雪裡', '小兔子輕鬆拉走'] },
  duration: 10,
  bg: { top: '#BFD9F2', bottom: '#EEF6FF', floor: '#F7FBFF', scenery: 'snow' },
  actors: [
    { id: 'tree', emoji: '🎄', x: 148, y: 69.4, size: 18, hidden: true },
    { id: 'sleigh', emoji: '🛷', x: 36, y: 70.7, size: 15, hidden: true },
    { id: 'g1', emoji: '🎁', x: 25, y: 63, size: 7, hidden: true, float: true },
    { id: 'g2', emoji: '🎁', x: 25, y: 56.5, size: 7, hidden: true, float: true },
    { id: 'g3', emoji: '🎁', x: 25, y: 50, size: 7, hidden: true, float: true },
    { id: 'g4', emoji: '🎁', x: 25, y: 43.5, size: 7, hidden: true, float: true },
    { id: 'santa', emoji: '🎅', x: 38, y: 60, size: 11, hidden: true, float: true },
    { id: 'bunny', emoji: '🐰', x: 10, y: 72.8, size: 10, hidden: true },
    { id: 'carrot', emoji: '🥕', x: 16, y: 64, size: 6, hidden: true, float: true },
    { id: 'deer', emoji: '🦌', x: 66, y: 70.3, size: 16, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'sleigh', do: 'pop' },
    { at: 0.1, actor: 'santa', do: 'pop' },
    { at: 0.2, actor: 'g1', do: 'pop' }, { at: 0.3, actor: 'g2', do: 'pop' }, { at: 0.4, actor: 'g3', do: 'pop' },
    { at: 0.3, actor: 'bunny', do: 'pop' },
    { at: 0.5, actor: 'deer', do: 'pop' },
    // 準備出發
    { at: 1.2, actor: 'deer', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.35, actor: 'deer', do: 'hop', amount: 7, dur: 0.4 },
    // 用力拉：拉不動
    { at: 2.0, actor: 'deer', do: 'tilt', amount: 15, dur: 0.6 },
    { at: 2.0, actor: 'deer', do: 'shake', amount: 0.6, dur: 0.6 },
    // 更用力：被繩子彈回來
    { at: 2.9, actor: 'deer', do: 'moveTo', to: { x: 74, y: 70.3 }, dur: 0.3 },
    { at: 3.2, actor: 'deer', do: 'moveTo', to: { x: 62, y: 70.3 }, dur: 0.2 },
    { at: 3.2, actor: 'sleigh', do: 'shake', amount: 1, dur: 0.3 },
    { at: 3.4, actor: 'deer', do: 'squash', amount: 0.4, dur: 0.25 },
    // 聖誕老人再加一盒
    { at: 3.6, actor: 'santa', do: 'hop', amount: 3, dur: 0.3 },
    { at: 3.65, actor: 'g4', do: 'pop' },
    // 兔子丟紅蘿蔔
    { at: 4.0, actor: 'bunny', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.0, actor: 'carrot', do: 'pop' },
    { at: 4.3, actor: 'carrot', do: 'moveTo', to: { x: 128, y: 74.5 }, arc: 30, dur: 0.6 },
    { at: 4.3, actor: 'carrot', do: 'spin', times: 2, dur: 0.6 },
    // 麋鹿衝出去
    { at: 4.55, actor: 'deer', do: 'squash', amount: -0.4, dur: 0.15 },
    { at: 4.7, actor: 'deer', do: 'moveTo', to: { x: 124, y: 70.3 }, dur: 0.35 },
    // 雪橇被扯一下，聖誕老人倒栽蔥，禮物飛上天
    { at: 4.75, actor: 'sleigh', do: 'moveTo', to: { x: 42, y: 70.7 }, dur: 0.2 },
    { at: 4.75, actor: 'g1', do: 'moveTo', to: { x: 31, y: 63 }, dur: 0.2 },
    { at: 4.75, actor: 'santa', do: 'moveTo', to: { x: 48, y: 62 }, arc: 14, dur: 0.45 },
    { at: 4.75, actor: 'santa', do: 'rotateTo', amount: 180, dur: 0.45 },
    { at: 4.75, actor: 'g4', do: 'moveTo', to: { x: 62, y: 22 }, dur: 0.3 },
    { at: 4.75, actor: 'g3', do: 'moveTo', to: { x: 74, y: 30 }, dur: 0.35 },
    { at: 4.75, actor: 'g2', do: 'moveTo', to: { x: 88, y: 40 }, dur: 0.4 },
    { at: 5.05, actor: 'g4', do: 'vanish', dur: 0.15 },
    { at: 5.3, actor: 'g3', do: 'vanish', dur: 0.15 },
    { at: 5.7, actor: 'g2', do: 'vanish', dur: 0.15 },
    { at: 5.3, actor: 'santa', do: 'shake', amount: 1, dur: 0.5 },
    // 吃紅蘿蔔
    { at: 5.05, actor: 'carrot', do: 'vanish', dur: 0.15 },
    { at: 5.05, actor: 'deer', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 5.3, actor: 'deer', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 5.55, actor: 'deer', do: 'squash', amount: 0.2, dur: 0.2 },
    // 麋鹿得意
    { at: 6.8, actor: 'tree', do: 'pop' },
    { at: 7.1, actor: 'deer', do: 'hop', amount: 8, dur: 0.45 },
    { at: 7.2, actor: 'deer', do: 'flash', dur: 0.6 },
    // 聖誕老人爬回雪橇，小兔子輕鬆拉走
    { at: 7.9, actor: 'santa', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 7.9, actor: 'santa', do: 'moveTo', to: { x: 44, y: 60 }, arc: 10, dur: 0.4 },
    { at: 8.6, actor: 'bunny', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 8.75, actor: 'bunny', do: 'moveTo', to: { x: -20, y: 72.8 }, dur: 0.45 },
    { at: 8.8, actor: 'sleigh', do: 'moveTo', to: { x: -14, y: 70.7 }, dur: 0.5 },
    { at: 8.8, actor: 'g1', do: 'moveTo', to: { x: -25, y: 63 }, dur: 0.5 },
    { at: 8.8, actor: 'santa', do: 'moveTo', to: { x: -12, y: 60 }, dur: 0.5 },
  ],
  builds: [
    // 飛上天的禮物 → 广、中間、比
    { at: 5.05, dur: 0.55, strokes: [0, 1, 2], from: 'g4', color: '#D62839' },
    { at: 5.3, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: 'g3', color: '#1E8A4C' },
    { at: 5.7, dur: 0.55, strokes: [8, 9, 10], from: 'g2', color: '#B5762E' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'line', actor: 'deer', target: 'sleigh', dx: -5, color: '#8B5A2B', width: 0.8, dur: 4.1 },
    { at: 0.8, kind: 'pop', actor: 'santa', emoji: '🔔', dur: 0.5 },
    { at: 2.4, kind: 'sweat', actor: 'deer' },
    { at: 3.5, kind: 'bubble', actor: 'deer', emoji: '😩', dur: 0.4 },
    { at: 3.95, kind: 'pop', actor: 'bunny', emoji: '💡', dur: 0.4 },
    { at: 4.45, kind: 'pop', actor: 'deer', emoji: '❗', dur: 0.3 },
    { at: 4.7, kind: 'puff', actor: 'deer' },
    { at: 5.25, kind: 'burst', x: 48, y: 72, emoji: '❄️', n: 6, dur: 0.5 },
    { at: 7.2, kind: 'burst', actor: 'deer', emoji: '✨', n: 6, dur: 0.6 },
    { at: 8.3, kind: 'line', actor: 'bunny', target: 'sleigh', dx: 3, color: '#8B5A2B', width: 0.8, dur: 1.2 },
    { at: 8.3, kind: 'pop', actor: 'bunny', emoji: '💪', dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'deer', emoji: '😳', dur: 0.6 },
  ],
  camera: [
    { at: 4.75, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 48, y: 62 } },
  ],
  cues: [
    { at: 0.8, sfx: 'blip' },
    { at: 1.4, say: '鹿' },
    { at: 2.0, sfx: 'rumble' },
    { at: 3.2, sfx: 'boing' },
    { at: 3.65, sfx: 'plop' },
    { at: 4.3, sfx: 'whoosh' },
    { at: 4.7, sfx: 'whoosh' },
    { at: 5.2, sfx: 'plop' },
    { at: 5.05, sfx: 'gulp' },
    { at: 6.25, say: '鹿' },
    { at: 6.8, sfx: 'poof' },
    { at: 7.25, say: '麋鹿' },
    { at: 8.75, sfx: 'slide' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
