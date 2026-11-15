import type { Clip } from '../clip'

// 爬（重做）：大怪獸看到一座才到膝蓋的小山，像要爬聖母峰一樣暖身、原地狂踩——一衝就整隻飛過小山，臉撞進一疊橘色泡棉塊。
// 泡棉塊飛上天落成「爬」。國字讓到上方，小山趁牠不注意自己挪到中間；牠趴下來一步一步、滿頭大汗地爬上去，插上旗子（爬山）。
// 回馬槍：小山睜開眼睛——原來是一隻大烏龜，載著牠慢慢走掉。爬、爬、爬山
const G = 66.9 // 大怪獸（size 24）站在地上的 y

const clip: Clip = {
  char: '爬',
  meta: { theme: '爬小山', cast: '大怪獸＋會走路的小山（烏龜）＋旗子＋泡棉塊', gags: ['小事暖身暖過頭', '飛過小山臉撞泡棉', '小山偷偷挪位置', '滿頭大汗爬上膝蓋高的山', '小山原來是烏龜'] },
  duration: 10,
  bg: { top: '#BFE3FF', bottom: '#EAF6FF', floor: '#F3E9CF', scenery: 'hills' },
  actors: [
    { id: 'hill', emoji: '⛰️', x: 36, y: 69.5, size: 18 },
    { id: 'flag', emoji: '🚩', x: 37, y: 58, size: 7, float: true },
    { id: 'blk1', emoji: '🟧', x: 146, y: 72, size: 10 },
    { id: 'blk2', emoji: '🟧', x: 146, y: 63.5, size: 10 },
    { id: 'blk3', emoji: '🟧', x: 146, y: 55, size: 10 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 16, y: G, size: 24, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'mon', do: 'enter', from: { x: -20, y: G }, dur: 0.5, ease: 'out' },
    // 看到小山上的旗子：我要爬上去！
    { at: 0.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 0.6, actor: 'mon', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.8, actor: 'flag', do: 'tilt', amount: 15, dur: 0.4 },
    // 像要爬聖母峰：蹲、伸展、原地狂踩
    { at: 1.1, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 1.3, actor: 'mon', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: 1.65, actor: 'mon', do: 'squash', amount: -0.35, dur: 0.35 },
    { at: 1.75, actor: 'mon', do: 'shake', amount: 1.6, dur: 0.5 },
    // 一衝就飛過小山，臉撞進泡棉塊
    { at: 2.25, actor: 'mon', do: 'moveTo', to: { x: 130, y: G }, arc: 26, dur: 0.55, anticipate: 4, ease: 'in' },
    { at: 2.8, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 2.8, actor: 'mon', do: 'squash', amount: 0.5, dur: 0.4 },
    { at: 2.8, actor: 'blk1', do: 'moveTo', to: { x: 112, y: 22 }, dur: 0.4, ease: 'out' },
    { at: 2.8, actor: 'blk1', do: 'spin', times: 2, dur: 0.6 },
    { at: 2.8, actor: 'blk2', do: 'moveTo', to: { x: 138, y: 12 }, dur: 0.45, ease: 'out' },
    { at: 2.8, actor: 'blk2', do: 'spin', times: -2, dur: 0.6 },
    { at: 2.8, actor: 'blk3', do: 'moveTo', to: { x: 156, y: -25 }, dur: 0.4, ease: 'out' },
    { at: 3.3, actor: 'blk1', do: 'vanish', dur: 0.25 },
    { at: 3.65, actor: 'blk2', do: 'vanish', dur: 0.25 },
    // 甩甩頭坐起來
    { at: 4.4, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 4.4, actor: 'mon', do: 'shake', amount: 1, dur: 0.4 },
    { at: 4.95, actor: 'mon', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 5.2, actor: 'mon', do: 'hop', amount: 3, dur: 0.3 },
    // 國字讓位：小山趁牠不注意，自己一跳一跳挪到中間
    { at: 5.3, actor: 'hill', do: 'moveTo', to: { x: 78, y: 69.5 }, dur: 0.6, ease: 'linear' },
    { at: 5.3, actor: 'hill', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 5.3, actor: 'flag', do: 'moveTo', to: { x: 79, y: 58 }, dur: 0.6, ease: 'linear' },
    { at: 5.3, actor: 'flag', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 5.95, actor: 'mon', do: 'flip' },
    { at: 6.1, actor: 'mon', do: 'flip' },
    // 趴下來，一步一步爬上去
    { at: 6.25, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 6.25, actor: 'mon', do: 'rotateTo', amount: -30, dur: 0.2 },
    ...[6.3, 6.45, 6.6, 6.75].map((at) => ({ at, actor: 'mon', do: 'hop' as const, amount: 1.8, dur: 0.15 })),
    ...[6.3, 6.45, 6.6, 6.75].map((at) => ({ at, actor: 'mon', do: 'squash' as const, amount: 0.12, dur: 0.15 })),
    { at: 6.3, actor: 'mon', do: 'moveTo', to: { x: 96, y: G }, dur: 0.6, ease: 'linear' },
    { at: 6.95, actor: 'mon', do: 'moveTo', to: { x: 80, y: 56 }, dur: 0.6, ease: 'out' },
    { at: 6.95, actor: 'mon', do: 'shake', amount: 0.8, dur: 0.6 },
    // 山頂！插旗子
    { at: 7.55, actor: 'mon', do: 'rotateTo', amount: 30, dur: 0.15 },
    { at: 7.55, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 7.6, actor: 'flag', do: 'moveTo', to: { x: 66, y: 44 }, dur: 0.2, ease: 'back' },
    { at: 7.6, actor: 'flag', do: 'scaleTo', amount: 1.6, dur: 0.2, ease: 'back' },
    { at: 7.85, actor: 'flag', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 7.85, actor: 'mon', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：小山睜開眼睛——是一隻大烏龜，載著牠走掉
    { at: 8.05, actor: 'hill', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 8.05, actor: 'mon', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 8.35, actor: 'hill', do: 'swap', emoji: '🐢' },
    { at: 8.35, actor: 'hill', do: 'flip' },
    { at: 8.35, actor: 'hill', do: 'scaleTo', amount: 1.25, dur: 0.2, ease: 'back' },
    { at: 8.4, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 8.4, actor: 'mon', do: 'hop', amount: 4, dur: 0.25 },
    { at: 8.7, actor: 'hill', do: 'moveTo', to: { x: 128, y: 69.5 }, dur: 0.7, ease: 'inOut' },
    { at: 8.7, actor: 'mon', do: 'moveTo', to: { x: 130, y: 56 }, dur: 0.7, ease: 'inOut' },
    { at: 8.7, actor: 'flag', do: 'moveTo', to: { x: 116, y: 44 }, dur: 0.7, ease: 'inOut' },
    { at: 9.45, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 9.5, actor: 'flag', do: 'tilt', amount: -18, dur: 0.35 },
  ],
  builds: [
    // 飛上天的泡棉塊落下：爪、巴
    { at: 3.3, dur: 0.6, strokes: [0, 1, 2, 3], from: 'blk1', color: '#F76707' },
    { at: 3.65, dur: 0.6, strokes: [4, 5, 6, 7], from: 'blk2', color: '#E8590C' },
  ],
  glyph: [
    { at: 4.25, dur: 0.4, do: 'wobble' },
    { at: 5.1, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'mon', emoji: '❗', dur: 0.45 },
    { at: 1.3, kind: 'sweat', actor: 'mon' },
    { at: 1.75, kind: 'puff', actor: 'mon', dur: 0.5 },
    { at: 2.25, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 2.8, kind: 'burst', actor: 'mon', n: 1, dx: 6, dy: 6, dur: 0.5 },
    { at: 3.2, kind: 'dizzy', actor: 'mon', dur: 1.1 },
    { at: 4.9, kind: 'pop', actor: 'mon', emoji: '😵‍💫', dur: 0.45 },
    { at: 5.4, kind: 'pop', actor: 'hill', emoji: '🤫', dur: 0.5 },
    { at: 5.9, kind: 'pop', actor: 'mon', emoji: '❓', dur: 0.45 },
    { at: 6.4, kind: 'sweat', actor: 'mon' },
    { at: 7.0, kind: 'sweat', actor: 'mon' },
    { at: 7.6, kind: 'burst', actor: 'flag', emoji: '✨', n: 8, dur: 0.6 },
    { at: 8.1, kind: 'pop', actor: 'hill', emoji: '👀', dx: -20, dy: 16, dur: 0.45 },
    { at: 8.45, kind: 'pop', actor: 'mon', emoji: '😱', dur: 0.45 },
    { at: 9.5, kind: 'pop', actor: 'mon', emoji: '😆', dx: 4, dur: 0.5 },
  ],
  camera: [
    { at: 2.8, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.1, say: '爬' },
    { at: 1.75, sfx: 'tap' },
    { at: 2.25, sfx: 'whoosh' },
    { at: 2.8, sfx: 'bonk' },
    { at: 4.25, say: '爬' },
    { at: 5.3, sfx: 'boing' },
    { at: 6.3, sfx: 'tap' },
    { at: 6.95, sfx: 'tap' },
    { at: 7.6, say: '爬山' },
    { at: 8.05, sfx: 'rumble' },
    { at: 8.35, sfx: 'blip' },
    { at: 8.7, sfx: 'slide' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
