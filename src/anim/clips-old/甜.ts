import type { Clip, Move } from '../clip'

// 甜（重做）：大怪獸和發條鯊魚為了一個杯子蛋糕，拿巨大棒棒糖當劍決鬥。第一劍糖黏在一起拔不開，一拔開兩個都彈飛坐倒；
// 再全速衝過去對砍——兩支棒棒糖「碰」地碎成「甜」，蛋糕被震上天。國字讓到上方，蛋糕變成超大的掉回中間（甜點），
// 回馬槍：兩個同時撲上去咬，頭撞頭彈開，蛋糕彈進鯊魚嘴裡整個吞下去，撐成圓球，打嗝噴出櫻桃落到怪獸頭上。甜、甜、甜點
const M = 67.8 // 大怪獸（size 22）站在地上的 y
const S = 68.2 // 鯊魚（size 21）
const LY = -10 // 棒棒糖握在手上（相對角色的 y）

// 角色的移動抄一份給手上的棒棒糖（dx 是在角色前面多遠）
const hold = (ms: Move[], lolly: string, dx: number): Move[] => ms.flatMap((m) => [
  m,
  ...(m.do === 'moveTo' || m.do === 'enter'
    ? [{ ...m, actor: lolly, to: m.to && { x: m.to.x + dx, y: m.to.y + LY }, from: m.from && { x: m.from.x + dx, y: m.from.y + LY } }]
    : []),
])

const clip: Clip = {
  char: '甜',
  meta: { theme: '搶杯子蛋糕的糖果劍決鬥', cast: '大怪獸＋發條鯊魚＋棒棒糖劍＋杯子蛋糕＋櫻桃', gags: ['偷舔自己的劍', '糖黏住拔不開彈飛坐倒', '對砍糖劍碎成字', '頭撞頭蛋糕彈進鯊魚嘴', '整個吞下撐成球打嗝噴櫻桃'] },
  duration: 10,
  bg: { top: '#FFD9E8', bottom: '#FFF4F8', floor: '#F3C6D6', scenery: 'hills' },
  actors: [
    { id: 'cake', emoji: '🧁', x: 80, y: 72, size: 12 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 30, y: M, size: 22, flip: true },
    { id: 'lm', emoji: '🍭', x: 40, y: M + LY, size: 12, float: true },
    { id: 'shark', emoji: 'hero:shark/idle', x: 130, y: S, size: 21 },
    { id: 'ls', emoji: '🍭', x: 120, y: S + LY, size: 12, float: true, flip: true },
    { id: 'cherry', emoji: '🍒', x: 124, y: 60, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 兩邊進場，看到中間的杯子蛋糕
    ...hold([{ at: 0, actor: 'mon', do: 'enter', from: { x: 2, y: M }, dur: 0.45, ease: 'out' }], 'lm', 10),
    ...hold([{ at: 0, actor: 'shark', do: 'enter', from: { x: 158, y: S }, dur: 0.45, ease: 'out' }], 'ls', -10),
    { at: 0.5, actor: 'cake', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 怪獸忍不住先舔一口自己的劍
    { at: 0.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 0.9, actor: 'lm', do: 'moveTo', to: { x: 36, y: M - 12 }, dur: 0.2 },
    { at: 1.0, actor: 'lm', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 1.45, actor: 'lm', do: 'moveTo', to: { x: 40, y: M + LY }, dur: 0.15 },
    { at: 1.05, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.05, actor: 'shark', do: 'shake', amount: 0.8, dur: 0.4 },
    // 第一劍：衝到中間，糖劍「叮」地碰在一起
    { at: 1.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    ...hold([{ at: 1.6, actor: 'mon', do: 'moveTo', to: { x: 62, y: M }, dur: 0.4, anticipate: 3, ease: 'in' }], 'lm', 11),
    ...hold([{ at: 1.6, actor: 'shark', do: 'moveTo', to: { x: 98, y: S }, dur: 0.4, anticipate: 3, ease: 'in' }], 'ls', -11),
    { at: 2.0, actor: 'lm', do: 'shake', amount: 0.8, dur: 0.2 },
    { at: 2.0, actor: 'ls', do: 'shake', amount: 0.8, dur: 0.2 },
    // 黏住了！兩邊往後拔，劍拔不開
    { at: 2.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 2.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 2.35, actor: 'mon', do: 'moveTo', to: { x: 57, y: M }, dur: 0.5, ease: 'out' },
    { at: 2.35, actor: 'shark', do: 'moveTo', to: { x: 103, y: S }, dur: 0.5, ease: 'out' },
    { at: 2.35, actor: 'mon', do: 'tilt', amount: -12, dur: 0.85 },
    { at: 2.35, actor: 'shark', do: 'tilt', amount: 12, dur: 0.85 },
    { at: 2.4, actor: 'mon', do: 'shake', amount: 0.7, dur: 0.8 },
    { at: 2.4, actor: 'shark', do: 'shake', amount: 0.7, dur: 0.8 },
    // 用力一拔——啵！兩個一起彈飛坐倒
    ...hold([{ at: 3.2, actor: 'mon', do: 'moveTo', to: { x: 28, y: M }, arc: 10, dur: 0.45, ease: 'out' }], 'lm', 10),
    ...hold([{ at: 3.2, actor: 'shark', do: 'moveTo', to: { x: 132, y: S }, arc: 10, dur: 0.45, ease: 'out' }], 'ls', -10),
    { at: 3.2, actor: 'mon', do: 'spin', times: -1, dur: 0.45 },
    { at: 3.2, actor: 'shark', do: 'spin', times: 1, dur: 0.45 },
    { at: 3.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 3.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 氣炸了，蓄力
    { at: 3.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 3.95, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 4.0, actor: 'mon', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.0, actor: 'shark', do: 'squash', amount: -0.35, dur: 0.3 },
    // 全速衝過去對砍——兩支糖劍碎掉，蛋糕被震上天
    ...hold([{ at: 4.3, actor: 'mon', do: 'moveTo', to: { x: 63, y: M }, dur: 0.35, anticipate: 5, ease: 'in' }], 'lm', 11),
    ...hold([{ at: 4.3, actor: 'shark', do: 'moveTo', to: { x: 97, y: S }, dur: 0.35, anticipate: 5, ease: 'in' }], 'ls', -11),
    { at: 4.65, actor: 'lm', do: 'vanish', dur: 0.08 },
    { at: 4.65, actor: 'ls', do: 'vanish', dur: 0.08 },
    { at: 4.65, actor: 'cake', do: 'moveTo', to: { x: 80, y: -24 }, dur: 0.4, ease: 'out' },
    { at: 4.65, actor: 'cake', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.68, actor: 'mon', do: 'moveTo', to: { x: 30, y: M }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 4.68, actor: 'shark', do: 'moveTo', to: { x: 130, y: S }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 4.68, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 4.68, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 劍呢？手上空空的
    { at: 5.75, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 5.75, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 6.25, actor: 'mon', do: 'tilt', amount: -10, dur: 0.4 },
    { at: 6.25, actor: 'shark', do: 'tilt', amount: 10, dur: 0.4 },
    // 蛋糕從天上掉回來——變成超大的！兩個衝去接
    { at: 6.9, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 6.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 6.95, actor: 'mon', do: 'moveTo', to: { x: 56, y: M }, dur: 0.4, ease: 'out' },
    { at: 6.95, actor: 'shark', do: 'moveTo', to: { x: 104, y: S }, dur: 0.4, ease: 'out' },
    { at: 6.95, actor: 'cake', do: 'moveTo', to: { x: 80, y: 66.9 }, dur: 0.4, ease: 'in' },
    { at: 6.95, actor: 'cake', do: 'scaleTo', amount: 2, dur: 0.4 },
    { at: 7.35, actor: 'cake', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 7.45, actor: 'mon', do: 'hop', amount: 5, dur: 0.35 },
    { at: 7.5, actor: 'shark', do: 'hop', amount: 5, dur: 0.35 },
    // 回馬槍：兩個同時撲上去咬——蛋糕彈起來，頭撞頭
    { at: 7.95, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 7.95, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 8.0, actor: 'mon', do: 'moveTo', to: { x: 70, y: M }, dur: 0.2, anticipate: 4, ease: 'in' },
    { at: 8.0, actor: 'shark', do: 'moveTo', to: { x: 90, y: S }, dur: 0.2, anticipate: 4, ease: 'in' },
    { at: 8.0, actor: 'cake', do: 'hop', amount: 20, dur: 0.5 },
    { at: 8.2, actor: 'mon', do: 'moveTo', to: { x: 30, y: M }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 8.2, actor: 'shark', do: 'moveTo', to: { x: 128, y: S }, arc: 12, dur: 0.45, ease: 'out' },
    { at: 8.2, actor: 'mon', do: 'spin', times: -1, dur: 0.45 },
    { at: 8.2, actor: 'shark', do: 'spin', times: 1, dur: 0.45 },
    { at: 8.2, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 8.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    // 蛋糕落地再彈一下，直接彈進鯊魚張開的嘴
    { at: 8.5, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 8.45, actor: 'cake', do: 'moveTo', to: { x: 120, y: 60 }, arc: 10, dur: 0.3, ease: 'in' },
    { at: 8.75, actor: 'cake', do: 'scaleTo', amount: 0.2, dur: 0.12 },
    { at: 8.75, actor: 'cake', do: 'vanish', dur: 0.12 },
    { at: 8.75, actor: 'shark', do: 'squash', amount: -0.2, dur: 0.15 },
    // 整個吞下去，撐成圓球
    { at: 8.85, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 8.85, actor: 'shark', do: 'scaleTo', amount: 1.45, dur: 0.25, ease: 'back' },
    { at: 8.85, actor: 'shark', do: 'moveTo', to: { x: 130, y: S - 4.5 }, dur: 0.25, ease: 'back' },
    { at: 8.8, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    // 打嗝，櫻桃噴出來落到怪獸頭上
    { at: 9.0, actor: 'shark', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.0, actor: 'cherry', do: 'pop', dur: 0.1 },
    { at: 9.0, actor: 'cherry', do: 'moveTo', to: { x: 30, y: M - 15 }, arc: 12, dur: 0.35, ease: 'linear' },
    { at: 9.35, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 9.35, actor: 'mon', do: 'squash', amount: 0.15, dur: 0.15 },
  ],
  builds: [
    // 怪獸的粉紅糖劍碎片 → 舌；鯊魚的橘色糖劍碎片 → 甘
    { at: 4.65, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'lm', color: '#E64980' },
    { at: 4.85, dur: 0.7, strokes: [6, 7, 8, 9, 10], from: 'ls', color: '#F76707' },
  ],
  glyph: [
    { at: 5.6, dur: 0.4, do: 'wobble' },
    { at: 6.45, dur: 0.45, do: 'park' },
    { at: 9.3, dur: 0.35, do: 'home' },
    { at: 9.65, dur: 0.35, do: 'pulse' },
  ],
  fx: [
    { at: 0.5, kind: 'burst', actor: 'cake', emoji: '✨', n: 5, dur: 0.5 },
    { at: 0.55, kind: 'pop', actor: 'mon', emoji: '❗', dur: 0.35 },
    { at: 0.55, kind: 'pop', actor: 'shark', emoji: '❗', dur: 0.35 },
    { at: 1.0, kind: 'pop', actor: 'mon', emoji: '👅', dx: 6, dur: 0.5 },
    { at: 1.1, kind: 'pop', actor: 'shark', emoji: '😤', dur: 0.4 },
    { at: 2.0, kind: 'burst', x: 80, y: 56, emoji: '✨', n: 6, dur: 0.4 },
    // 糖黏住：中間拉出黏黏的糖絲
    { at: 2.3, dur: 0.9, kind: 'line', actor: 'lm', target: 'ls', color: '#F783AC', width: 2 },
    { at: 2.4, kind: 'sweat', actor: 'mon' },
    { at: 2.4, kind: 'sweat', actor: 'shark' },
    { at: 2.5, kind: 'pop', actor: 'lm', emoji: '❗', dy: -2, dur: 0.4 },
    { at: 3.2, kind: 'burst', x: 80, y: 56, n: 1, dur: 0.3 },
    { at: 3.65, kind: 'dizzy', actor: 'mon', dur: 0.5 },
    { at: 3.65, kind: 'dizzy', actor: 'shark', dur: 0.5 },
    { at: 4.0, kind: 'puff', actor: 'mon', dur: 0.4 },
    { at: 4.0, kind: 'puff', actor: 'shark', dur: 0.4 },
    { at: 4.0, kind: 'pop', actor: 'mon', emoji: '😤', dur: 0.35 },
    { at: 4.65, kind: 'burst', x: 80, y: 54, n: 1, dur: 0.4 },
    { at: 4.65, kind: 'burst', x: 80, y: 54, emoji: '🍬', n: 8, dur: 0.6 },
    { at: 5.15, kind: 'dizzy', actor: 'mon', dur: 0.6 },
    { at: 5.15, kind: 'dizzy', actor: 'shark', dur: 0.6 },
    { at: 5.8, kind: 'pop', actor: 'mon', emoji: '❓', dur: 0.45 },
    { at: 5.85, kind: 'pop', actor: 'shark', emoji: '❓', dur: 0.45 },
    { at: 6.35, kind: 'pop', actor: 'mon', emoji: '😭', dur: 0.45 },
    { at: 6.4, kind: 'pop', actor: 'shark', emoji: '😭', dur: 0.45 },
    { at: 7.35, kind: 'burst', actor: 'cake', emoji: '✨', n: 8, dur: 0.6 },
    { at: 7.5, kind: 'pop', actor: 'mon', emoji: '😋', dx: -6, dur: 0.45 },
    { at: 7.55, kind: 'pop', actor: 'shark', emoji: '😋', dx: 6, dur: 0.45 },
    { at: 8.2, kind: 'burst', x: 80, y: 66, n: 1, dur: 0.3 },
    { at: 8.65, kind: 'dizzy', actor: 'mon', dur: 0.4 },
    { at: 8.85, kind: 'burst', actor: 'shark', emoji: '💕', n: 5, dur: 0.5 },
    { at: 8.85, kind: 'pop', actor: 'mon', emoji: '😱', dur: 0.4 },
    { at: 9.4, kind: 'pop', actor: 'mon', emoji: '😋', dx: 12, dy: 4, dur: 0.5 },
  ],
  camera: [
    { at: 2.0, dur: 0.2, do: 'shake', amount: 0.6 },
    { at: 4.65, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 7.35, dur: 0.25, do: 'shake', amount: 1 },
    { at: 8.2, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    // 糖劍碎掉：白光一閃
    { at: 4.65, dur: 0.04, level: -0.8 },
    { at: 4.69, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.5, sfx: 'blip' },
    { at: 1.0, say: '甜' },
    { at: 2.0, sfx: 'clink' },
    { at: 2.4, sfx: 'slide' },
    { at: 3.2, sfx: 'boing' },
    { at: 4.3, sfx: 'whoosh' },
    { at: 4.65, sfx: 'crack' },
    { at: 5.6, say: '甜' },
    { at: 6.95, sfx: 'whoosh' },
    { at: 7.35, say: '甜點' },
    { at: 8.2, sfx: 'bonk' },
    { at: 8.75, sfx: 'gulp' },
    { at: 9.0, sfx: 'hic' },
    { at: 9.35, sfx: 'plop' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
