import type { Clip } from '../clip'

// 島：小老鼠坐上彈射蹺蹺板，要飛去搶小島上的起司；拉布拉多警長衝來阻止，卻滑過頭一腳踩中板尾——老鼠被彈上天，飛過小島、撞上一疊藍色積木，
// 積木嘩啦落下排成「島」，老鼠倒栽進水桶。水桶周圍長出沙子和椰子樹，變成一座迷你小島。結尾警長又踩到蹺蹺板，換自己被彈起來。島、島、小島
const clip: Clip = {
  char: '島',
  meta: { theme: '海邊彈射', cast: '小老鼠＋拉布拉多警長＋蹺蹺板＋起司', gags: ['衝來阻止反而踩中', '飛過頭撞積木', '倒栽水桶', '警長自己被彈回馬槍'] },
  duration: 10,
  bg: { top: '#C9ECFF', bottom: '#EAF8FF', floor: '#F1DCA7', scenery: 'sea' },
  actors: [
    { id: 'plank', emoji: '🪵', x: 26, y: 73, size: 12 },
    { id: 'island', emoji: '🏝️', x: 124, y: 70, size: 14 },
    { id: 'cheese', emoji: '🧀', x: 125, y: 62, size: 5 },
    { id: 'k3', emoji: '🟦', x: 151, y: 57.5, size: 7 },
    { id: 'k2', emoji: '🟦', x: 151, y: 64.5, size: 7 },
    { id: 'k1', emoji: '🟦', x: 151, y: 71.5, size: 7 },
    { id: 'isle2', emoji: '🏝️', x: 139, y: 71, size: 12, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 20, y: 65, size: 12, flip: true },
    { id: 'bucket', emoji: '🪣', x: 139, y: 74, size: 8 },
    { id: 'dog', emoji: 'hero:sheriff/run', x: -20, y: 71, size: 14, flip: true },
  ],
  moves: [
    // 指著小島，搓搓手，尾巴打鼓
    { at: 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 1.3, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.5 },
    // 警長衝進來阻止
    { at: 1.6, actor: 'dog', do: 'moveTo', to: { x: 22, y: 71 }, dur: 0.45, ease: 'in' },
    { at: 1.6, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    // 地板太滑，滑過頭，後腳一踩板尾
    { at: 2.05, actor: 'dog', do: 'moveTo', to: { x: 38, y: 71 }, dur: 0.3, ease: 'back' },
    { at: 2.05, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 2.35, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 2.35, actor: 'plank', do: 'tilt', amount: 18, dur: 0.3 },
    // 老鼠被彈上天，飛過小島、差一點點搆到起司
    { at: 2.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 2.4, actor: 'mouse', do: 'moveTo', to: { x: 146, y: 62 }, arc: 42, dur: 1.3, ease: 'linear' },
    { at: 2.4, actor: 'mouse', do: 'spin', times: 1, dur: 1.0 },
    { at: 3.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 3.4, actor: 'cheese', do: 'hop', amount: 2, dur: 0.2 },
    // 臉朝前撞進積木
    { at: 3.7, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 3.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 3.75, actor: 'k1', do: 'moveTo', to: { x: 64, y: 26 }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 3.75, actor: 'k2', do: 'moveTo', to: { x: 90, y: 16 }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 3.75, actor: 'k3', do: 'moveTo', to: { x: 100, y: 34 }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 3.75, actor: 'k1', do: 'spin', times: 2, dur: 0.5 },
    { at: 3.75, actor: 'k2', do: 'spin', times: 2, dur: 0.5 },
    // 彈回來，倒栽進水桶，只剩腳在踢
    { at: 3.95, actor: 'mouse', do: 'rotateTo', amount: 180, dur: 0.35 },
    { at: 3.95, actor: 'mouse', do: 'moveTo', to: { x: 139, y: 58 }, arc: 8, dur: 0.35, ease: 'in' },
    { at: 4.3, actor: 'bucket', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 4.5, actor: 'mouse', do: 'shake', amount: 0.8, dur: 1.0 },
    { at: 4.2, actor: 'k1', do: 'vanish', dur: 0.15 },
    { at: 4.9, actor: 'k2', do: 'vanish', dur: 0.15 },
    { at: 4.9, actor: 'k3', do: 'vanish', dur: 0.15 },
    // 起司被震飛，剛好掉進水桶
    { at: 5.8, actor: 'island', do: 'shake', amount: 1, dur: 0.3 },
    { at: 5.9, actor: 'cheese', do: 'moveTo', to: { x: 139, y: 66 }, arc: 10, dur: 0.4 },
    { at: 6.3, actor: 'cheese', do: 'vanish', dur: 0.1 },
    // 水桶周圍長出沙和椰子樹：迷你小島
    { at: 6.6, actor: 'isle2', do: 'pop', dur: 0.35 },
    { at: 6.6, actor: 'bucket', do: 'hop', amount: 2, dur: 0.3 },
    // 老鼠翻正，舉起起司
    { at: 7.3, actor: 'mouse', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 7.3, actor: 'mouse', do: 'moveTo', to: { x: 139, y: 64 }, dur: 0.3, ease: 'back' },
    { at: 7.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cheese' },
    { at: 7.6, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.7, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.5 },
    // 回馬槍：警長退一步，又踩到板尾，換自己被彈起來
    { at: 8.3, actor: 'dog', do: 'moveTo', to: { x: 31, y: 71 }, dur: 0.25 },
    { at: 8.55, actor: 'plank', do: 'tilt', amount: -18, dur: 0.3 },
    { at: 8.55, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 8.55, actor: 'dog', do: 'hop', amount: 14, dur: 0.6 },
    { at: 9.15, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.2, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
  ],
  builds: [
    // 積木嘩啦落下：先疊出鳥的上半，再把山塞進底下
    { at: 4.2, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'k1', color: '#1971C2' },
    { at: 4.9, dur: 0.4, strokes: [7, 8, 9], from: 'k2', color: '#0C8599' },
  ],
  glyph: [{ at: 5.35, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'mouse', emoji: '👉', dur: 0.5 },
    { at: 0.8, kind: 'bubble', actor: 'mouse', emoji: '🧀', dur: 0.6 },
    { at: 2.0, kind: 'pop', actor: 'dog', emoji: '📣', dur: 0.4 },
    { at: 2.05, kind: 'puff', actor: 'dog', dur: 0.4 },
    { at: 2.35, kind: 'burst', actor: 'plank', n: 1, dur: 0.3 },
    { at: 3.3, kind: 'pop', actor: 'mouse', emoji: '😮', dur: 0.3 },
    { at: 3.7, kind: 'burst', actor: 'k2', n: 1, dur: 0.35 },
    { at: 4.3, kind: 'burst', actor: 'bucket', emoji: '💦', n: 5, dur: 0.5 },
    { at: 6.6, kind: 'burst', actor: 'isle2', emoji: '✨', n: 5, dur: 0.5 },
    { at: 7.7, kind: 'pop', actor: 'dog', emoji: '🫡', dur: 0.5 },
    { at: 8.6, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
  ],
  camera: [
    { at: 2.4, dur: 0.3, do: 'follow', actor: 'mouse', amount: 1.25 },
    { at: 3.6, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 3.7, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 1.0, say: '島' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.05, sfx: 'slide' },
    { at: 2.35, sfx: 'boing' },
    { at: 3.7, sfx: 'bonk' },
    { at: 4.3, sfx: 'splash' },
    { at: 5.35, say: '島' },
    { at: 6.6, sfx: 'poof' },
    { at: 6.65, say: '小島' },
    { at: 8.55, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
