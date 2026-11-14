import type { Clip, Move } from '../clip'

// 睿（重做）：大猩猩想打開一個超大禮物，一拳打下去手痛、整隻撞上去被彈飛；楊捷睿想一想——輕輕拉一下緞帶，禮物「碰」地炸開，
// 彩紙飛上天變成「睿」的上半部，裡面跳出戴博士帽的貓頭鷹，大眼睛眨一下變成「目」。國字讓到上方，貓頭鷹把博士帽戴到楊捷睿頭上（睿智）。
// 回馬槍：大猩猩學他輕輕拉小禮物的緞帶，結果彈出一個拳擊手套，把他打飛上天又摔下來。睿、睿、睿智
const B = 67.8 // 楊捷睿（size 22）站在地上的 y
const G = 66.9 // 大猩猩（size 24）
const O = -16 // 貓頭鷹站在楊捷睿頭上（相對他的 y）
const P = -9 // 博士帽戴在貓頭鷹頭上（相對貓頭鷹）
const H = -15 // 博士帽戴在楊捷睿頭上（相對他的 y）

// 楊捷睿的移動抄一份給頭上的貓頭鷹／帽子（dy 是相對他的高度）
const follow = (ms: Move[], ids: [string, number][]): Move[] => ms.flatMap((m) => [
  m,
  ...ids.map(([actor, dy]) => ({ ...m, actor, to: m.to && { x: m.to.x, y: m.to.y + dy }, from: m.from && { x: m.from.x, y: m.from.y + dy } })),
])

const clip: Clip = {
  char: '睿',
  meta: { theme: '大猩猩打不開大禮物', cast: '楊捷睿＋大猩猩＋超大禮物＋貓頭鷹博士＋拳擊手套小禮物', gags: ['用蠻力打禮物手痛', '整隻撞上去被彈飛', '輕輕一拉緞帶就炸開', '學人家拉緞帶被拳擊手套打飛'] },
  duration: 10,
  bg: { top: '#FFE3EC', bottom: '#FFF6E8', floor: '#E9C38F', scenery: 'room' },
  actors: [
    { id: 'gift', emoji: '🎁', x: 80, y: 66.1, size: 26 },
    { id: 'small', emoji: '🎁', x: 80, y: 66, size: 12, hidden: true },
    { id: 'glove', emoji: '🥊', x: 118, y: 70, size: 12, hidden: true },
    { id: 'ape', emoji: '🦍', x: 128, y: G, size: 24 },
    { id: 'boy', emoji: 'hero:yang/idle', x: 30, y: B, size: 22, hidden: true },
    { id: 'owl', emoji: '🦉', x: 80, y: 62, size: 13, hidden: true, float: true },
    { id: 'cap', emoji: '🎓', x: 80, y: 53, size: 12, hidden: true, float: true },
  ],
  moves: [
    // 大猩猩已經在禮物旁邊搥胸；楊捷睿跑進來，看到禮物好開心
    { at: 0, actor: 'ape', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 0, actor: 'boy', do: 'enter', from: { x: -20, y: B }, dur: 0.55, ease: 'out' },
    { at: 0.7, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 0.7, actor: 'boy', do: 'hop', amount: 4, dur: 0.3 },
    // 第一次：大猩猩一拳打下去——禮物沒事，手好痛
    { at: 1.3, actor: 'ape', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.6, actor: 'ape', do: 'moveTo', to: { x: 104, y: G }, dur: 0.18, anticipate: 4, ease: 'in' },
    { at: 1.78, actor: 'gift', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 1.78, actor: 'ape', do: 'moveTo', to: { x: 122, y: G }, dur: 0.3, ease: 'out' },
    { at: 2.1, actor: 'ape', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 2.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第二次：退到後面蓄力，整隻撞上去——被禮物彈飛
    { at: 2.65, actor: 'ape', do: 'moveTo', to: { x: 138, y: G }, dur: 0.35, ease: 'inOut' },
    { at: 3.0, actor: 'ape', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 3.35, actor: 'ape', do: 'moveTo', to: { x: 104, y: G }, dur: 0.17, anticipate: 5, ease: 'in' },
    { at: 3.52, actor: 'gift', do: 'squash', amount: 0.22, dur: 0.35, },
    { at: 3.52, actor: 'gift', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.52, actor: 'ape', do: 'moveTo', to: { x: 140, y: G }, arc: 18, dur: 0.5, ease: 'out' },
    { at: 3.52, actor: 'ape', do: 'spin', times: -1, dur: 0.5 },
    // 楊捷睿想一想……💡 走過去輕輕拉一下緞帶
    { at: 4.1, actor: 'boy', do: 'swap', emoji: 'hero:yang/think' },
    { at: 4.1, actor: 'boy', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 4.6, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 4.75, actor: 'boy', do: 'moveTo', to: { x: 56, y: B }, dur: 0.35, ease: 'out' },
    { at: 5.15, actor: 'boy', do: 'moveTo', to: { x: 51, y: B }, dur: 0.12, ease: 'out' },
    { at: 5.15, actor: 'boy', do: 'tilt', amount: -10, dur: 0.25 },
    // 禮物抖、鼓起來——碰！炸開
    { at: 5.2, actor: 'gift', do: 'shake', amount: 1, dur: 0.3 },
    { at: 5.2, actor: 'gift', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'in' },
    { at: 5.5, actor: 'gift', do: 'vanish', dur: 0.1 },
    // 楊捷睿被炸得往後滑
    { at: 5.5, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 5.5, actor: 'boy', do: 'moveTo', to: { x: 30, y: B }, dur: 0.4, ease: 'out' },
    // 小禮物被炸飛到大猩猩前面
    { at: 5.5, actor: 'small', do: 'pop' },
    { at: 5.5, actor: 'small', do: 'moveTo', to: { x: 118, y: 72 }, arc: 26, dur: 0.6, ease: 'linear' },
    { at: 5.5, actor: 'small', do: 'spin', times: 1, dur: 0.6 },
    // 戴博士帽的貓頭鷹跳出來，飛到楊捷睿頭上
    ...[ ['owl', 0], ['cap', P] ].flatMap(([actor, dy]) => [
      { at: 5.55, actor: actor as string, do: 'pop' as const },
      { at: 5.6, actor: actor as string, do: 'moveTo' as const, to: { x: 30, y: B + O + (dy as number) }, arc: 14, dur: 0.45, ease: 'out' as const },
    ]),
    { at: 6.05, actor: 'owl', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 6.1, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 6.45, actor: 'boy', do: 'hop', amount: 3, dur: 0.3 },
    ...[6.45].flatMap((at) => [
      { at, actor: 'owl', do: 'hop' as const, amount: 3, dur: 0.3 },
      { at, actor: 'cap', do: 'hop' as const, amount: 3, dur: 0.3 },
    ]),
    // 國字讓位：楊捷睿頂著貓頭鷹走到中間
    ...follow([
      { at: 7.3, actor: 'boy', do: 'moveTo', to: { x: 74, y: B }, dur: 0.55, ease: 'inOut' },
    ], [['owl', O], ['cap', O + P]]),
    // 貓頭鷹飛到旁邊，把博士帽丟到他頭上
    { at: 7.9, actor: 'owl', do: 'moveTo', to: { x: 94, y: 50 }, dur: 0.3, ease: 'out' },
    { at: 7.9, actor: 'cap', do: 'moveTo', to: { x: 74, y: B + H }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 7.9, actor: 'cap', do: 'spin', times: 1, dur: 0.3 },
    // 睿智！
    { at: 8.2, actor: 'boy', do: 'hop', amount: 6, dur: 0.35 },
    { at: 8.2, actor: 'cap', do: 'hop', amount: 6, dur: 0.35 },
    { at: 8.2, actor: 'owl', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 回馬槍：大猩猩學他，輕輕拉小禮物的緞帶
    { at: 7.6, actor: 'ape', do: 'moveTo', to: { x: 132, y: G }, dur: 0.4, ease: 'out' },
    { at: 8.55, actor: 'ape', do: 'tilt', amount: 10, dur: 0.3 },
    // 拳擊手套彈出來，把他打飛上天
    { at: 8.85, actor: 'small', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 8.85, actor: 'glove', do: 'pop' },
    { at: 8.85, actor: 'glove', do: 'moveTo', to: { x: 124, y: 56 }, dur: 0.08, ease: 'out' },
    { at: 8.93, actor: 'ape', do: 'moveTo', to: { x: 150, y: -25 }, dur: 0.35, ease: 'out' },
    { at: 8.93, actor: 'ape', do: 'spin', times: 2, dur: 0.35 },
    // 楊捷睿嚇一跳退回左邊
    ...follow([
      { at: 8.95, actor: 'boy', do: 'moveTo', to: { x: 32, y: B }, dur: 0.4, ease: 'out' },
    ], [['cap', H]]),
    { at: 8.95, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 8.95, actor: 'owl', do: 'moveTo', to: { x: 14, y: 46 }, dur: 0.45, ease: 'out' },
    { at: 9.35, actor: 'glove', do: 'moveTo', to: { x: 120, y: 64 }, dur: 0.25, ease: 'elastic' },
    // 摔回地上
    { at: 9.3, actor: 'ape', do: 'moveTo', to: { x: 140, y: G }, dur: 0.25, ease: 'in' },
    { at: 9.55, actor: 'ape', do: 'squash', amount: 0.45, dur: 0.45 },
    { at: 9.55, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    // 剛爬起來，彈簧手套又「咚」一下
    { at: 9.75, actor: 'glove', do: 'moveTo', to: { x: 128, y: 60 }, dur: 0.07, ease: 'out' },
    { at: 9.82, actor: 'ape', do: 'tilt', amount: 18, dur: 0.18 },
    { at: 9.82, actor: 'glove', do: 'moveTo', to: { x: 121, y: 64 }, dur: 0.15, ease: 'out' },
  ],
  builds: [
    // 炸開的彩紙 → 上半部；貓頭鷹的大眼睛 → 目
    { at: 5.5, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: 'gift', color: '#E64980' },
    { at: 6.05, dur: 0.4, strokes: [9, 10, 11, 12, 13], from: 'owl', color: '#F59F00' },
  ],
  glyph: [
    { at: 6.5, dur: 0.4, do: 'wobble' },
    { at: 7.3, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.15, kind: 'pop', actor: 'ape', emoji: '💪', dur: 0.45 },
    { at: 0.75, kind: 'bubble', actor: 'boy', emoji: '🎁', dur: 0.7 },
    { at: 1.3, kind: 'pop', actor: 'ape', emoji: '😤', dur: 0.35 },
    { at: 1.78, kind: 'burst', x: 93, y: 60, n: 1, dur: 0.35 },
    { at: 2.1, kind: 'pop', actor: 'ape', emoji: '😣', dur: 0.5 },
    { at: 2.15, kind: 'sweat', actor: 'ape' },
    { at: 2.7, kind: 'sweat', actor: 'boy' },
    { at: 3.0, kind: 'puff', actor: 'ape', dx: 8, dy: 12, dur: 0.4 },
    { at: 3.52, kind: 'burst', x: 93, y: 58, n: 1, dur: 0.4 },
    { at: 3.6, kind: 'pop', actor: 'boy', emoji: '😬', dur: 0.45 },
    { at: 4.05, kind: 'dizzy', actor: 'ape', dur: 1.1 },
    { at: 4.1, kind: 'bubble', actor: 'boy', emoji: '🎀', dur: 0.5 },
    { at: 4.6, kind: 'pop', actor: 'boy', emoji: '💡', dur: 0.4 },
    // 緞帶：被楊捷睿輕輕一拉
    { at: 4.95, dur: 0.55, kind: 'line', actor: 'gift', target: 'boy', color: '#E64980', width: 1.6, dy: 2 },
    { at: 5.5, kind: 'burst', actor: 'gift', emoji: '🎊', n: 8, dur: 0.6 },
    { at: 5.6, kind: 'pop', actor: 'ape', emoji: '😲', dur: 0.5 },
    { at: 6.5, kind: 'burst', actor: 'owl', emoji: '✨', n: 5, dur: 0.5 },
    { at: 8.2, kind: 'burst', actor: 'boy', emoji: '⭐', n: 6, dx: -6, dy: 4, dur: 0.6 },
    { at: 8.25, kind: 'pop', actor: 'owl', emoji: '👏', dx: 8, dur: 0.45 },
    { at: 8.4, kind: 'pop', actor: 'ape', emoji: '😏', dur: 0.4 },
    { at: 8.5, dur: 0.38, kind: 'line', actor: 'small', target: 'ape', color: '#E64980', width: 1.2 },
    { at: 8.93, kind: 'burst', x: 128, y: 54, n: 1, dur: 0.35 },
    { at: 9.0, kind: 'pop', actor: 'boy', emoji: '😱', dx: 12, dy: 4, dur: 0.4 },
    { at: 9.55, kind: 'puff', actor: 'ape', dur: 0.4 },
    { at: 9.55, kind: 'dizzy', actor: 'ape', dur: 0.45 },
    { at: 9.82, kind: 'burst', x: 130, y: 58, n: 1, dur: 0.18 },
  ],
  camera: [
    { at: 3.52, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 5.5, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 8.2, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 78, y: 44 } },
    { at: 8.93, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    // 禮物炸開：白光一閃
    { at: 5.5, dur: 0.04, level: -0.7 },
    { at: 5.54, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'rumble' },
    { at: 0.7, say: '睿' },
    { at: 1.78, sfx: 'bonk' },
    { at: 3.35, sfx: 'whoosh' },
    { at: 3.52, sfx: 'boing' },
    { at: 4.6, sfx: 'blip' },
    { at: 5.15, sfx: 'tap' },
    { at: 5.5, sfx: 'poof' },
    { at: 6.5, say: '睿' },
    { at: 7.9, sfx: 'whoosh' },
    { at: 8.2, say: '睿智' },
    { at: 8.85, sfx: 'boing' },
    { at: 8.93, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
