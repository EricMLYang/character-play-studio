import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 蟹（重做）：積木隊長頭上頂著三塊積木和一塊大螯積木，調皮小老鼠跳上積木塔搶走大螯，躲到大螃蟹後面。隊長走過去要——鼻子被夾，整個人彈飛；
// 隊長氣到飛撲過螃蟹頭頂，螃蟹往上一夾夾到屁股，頭上的積木噴上天落成「蟹」。國字讓到上方，螃蟹橫著走到中間（螃蟹），小老鼠沒地方躲了；
// 回馬槍：小老鼠想偷溜，尾巴被夾，整隻轉著圈飛過去，剛好疊在隊長頭上、大螯也送回來了。蟹、蟹、螃蟹
const C = 67.8 // 隊長（size 22）站在地上的 y
const M = 68.6 // 小老鼠（size 20）
const K = 67.8 // 螃蟹（size 22）
// 隊長頭上那一疊（相對隊長的 y）
const STACK: [string, number][] = [['b1', -12], ['b2', -21], ['b3', -30], ['claw', -40]]
const CLAW_ON_MOUSE = -15 // 大螯積木舉在小老鼠頭上

// 隊長的移動抄一份給頭上那一疊
const follow = (ms: Move[], ids: [string, number][]): Move[] => ms.flatMap((m) => [
  m,
  ...ids.map(([actor, dy]) => ({ ...m, actor, to: m.to && { x: m.to.x, y: m.to.y + dy }, from: m.from && { x: m.from.x, y: m.from.y + dy } })),
])
const BRICKS = STACK.slice(0, 3)

const clip: Clip = {
  char: '蟹',
  meta: { theme: '搶大螯積木躲螃蟹後面', cast: '積木隊長＋調皮小老鼠＋大螃蟹＋三塊積木＋大螯積木', gags: ['跳上積木塔搶走就躲', '走過去要鼻子被夾彈飛', '飛撲被夾屁股積木噴上天', '螃蟹橫著走開小老鼠沒地方躲', '尾巴被夾轉圈飛去疊在隊長頭上'] },
  duration: 10,
  bg: { top: '#FFE2D1', bottom: '#FFF6EE', floor: '#F0CFA0', scenery: 'room' },
  actors: [
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 175, y: M, size: 20, hidden: true },
    { id: 'crab', emoji: '🦀', x: 32, y: K, size: 22 },
    { id: 'cap', emoji: 'hero:brick/stack', x: 118, y: C, size: 22, hidden: true },
    { id: 'b1', emoji: '🧱', x: 118, y: C - 12, size: 9, hidden: true },
    { id: 'b2', emoji: '🧱', x: 118, y: C - 21, size: 9, hidden: true },
    { id: 'b3', emoji: '🧱', x: 118, y: C - 30, size: 9, hidden: true },
    { id: 'claw', emoji: '🧩', x: 118, y: C - 40, size: 9, hidden: true, float: true },
  ],
  moves: [
    // 隊長頂著一疊積木走進來
    ...follow([{ at: 0, actor: 'cap', do: 'enter', from: { x: 185, y: C }, dur: 0.7, ease: 'out' }], STACK),
    { at: 0.35, actor: 'crab', do: 'shake', amount: 1, dur: 0.4 },
    // 小老鼠從後面跳上積木塔，搶走最上面的大螯
    { at: 0.75, actor: 'mouse', do: 'pop' },
    { at: 0.75, actor: 'mouse', do: 'moveTo', to: { x: 124, y: C - 45 }, arc: 12, dur: 0.3, ease: 'out' },
    { at: 1.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 1.05, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    ...BRICKS.map(([actor]) => ({ at: 1.05, actor, do: 'shake' as const, amount: 1.2, dur: 0.4 })),
    // 跳下去，躲到大螃蟹後面
    { at: 1.1, actor: 'mouse', do: 'flip' },
    { at: 1.1, actor: 'mouse', do: 'moveTo', to: { x: 20, y: M }, arc: 16, dur: 0.45, ease: 'inOut' },
    { at: 1.1, actor: 'claw', do: 'moveTo', to: { x: 20, y: M + CLAW_ON_MOUSE }, arc: 16, dur: 0.45, ease: 'inOut' },
    // 大螃蟹舉起大螯：我是螃蟹，你過來看看
    { at: 1.55, actor: 'crab', do: 'hop', amount: 3, dur: 0.3 },
    { at: 1.55, actor: 'crab', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    // 隊長走過去要回來
    { at: 2.0, actor: 'cap', do: 'swap', emoji: 'hero:brick/march' },
    ...follow([{ at: 2.0, actor: 'cap', do: 'moveTo', to: { x: 54, y: C }, dur: 0.55, ease: 'out' }], BRICKS),
    // 螃蟹往後一縮……喀嚓！夾鼻子
    { at: 2.6, actor: 'crab', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 2.8, actor: 'crab', do: 'moveTo', to: { x: 42, y: K }, dur: 0.08, ease: 'in' },
    { at: 2.95, actor: 'crab', do: 'moveTo', to: { x: 32, y: K }, dur: 0.25, ease: 'out' },
    { at: 2.85, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    ...follow([{ at: 2.85, actor: 'cap', do: 'moveTo', to: { x: 112, y: C }, arc: 14, dur: 0.5, ease: 'out' }], BRICKS),
    ...BRICKS.map(([actor]) => ({ at: 2.85, actor, do: 'shake' as const, amount: 1.5, dur: 0.5 })),
    { at: 2.85, actor: 'cap', do: 'tilt', amount: 20, dur: 0.5 },
    // 落地壓扁，頭上那一疊跟著沉
    { at: 3.35, actor: 'cap', do: 'squash', amount: 0.3, dur: 0.25 },
    ...pressStack(3.35, 0.25, 0.3, 22, BRICKS.map(([id]) => id)),
    // 氣炸了：蓄力
    { at: 3.55, actor: 'cap', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 3.55, actor: 'cap', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 3.75, actor: 'cap', do: 'squash', amount: -0.3, dur: 0.3 },
    ...pressStack(3.75, 0.3, -0.3, 22, BRICKS.map(([id]) => id)),
    // 飛撲過螃蟹頭頂要抓小老鼠
    ...follow([{ at: 4.05, actor: 'cap', do: 'moveTo', to: { x: 52, y: 46 }, arc: 14, dur: 0.4, ease: 'out' }], BRICKS),
    { at: 4.05, actor: 'cap', do: 'rotateTo', amount: 30, dur: 0.4 },
    // 螃蟹往上一夾——夾到屁股！
    { at: 4.2, actor: 'crab', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 4.4, actor: 'crab', do: 'hop', amount: 9, dur: 0.3 },
    { at: 4.45, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.45, actor: 'cap', do: 'rotateTo', amount: -30, dur: 0.3 },
    { at: 4.45, actor: 'cap', do: 'moveTo', to: { x: 128, y: C }, arc: 22, dur: 0.6, ease: 'out' },
    { at: 4.45, actor: 'cap', do: 'spin', times: -2, dur: 0.6 },
    { at: 5.05, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    // 頭上的積木噴上天
    { at: 4.45, actor: 'b1', do: 'moveTo', to: { x: 50, y: 14 }, dur: 0.35, ease: 'out' },
    { at: 4.45, actor: 'b1', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.45, actor: 'b2', do: 'moveTo', to: { x: 80, y: 8 }, dur: 0.4, ease: 'out' },
    { at: 4.45, actor: 'b2', do: 'spin', times: -2, dur: 0.45 },
    { at: 4.45, actor: 'b3', do: 'moveTo', to: { x: 110, y: 14 }, dur: 0.45, ease: 'out' },
    { at: 4.45, actor: 'b3', do: 'spin', times: 2, dur: 0.5 },
    { at: 4.8, actor: 'b1', do: 'vanish', dur: 0.2 },
    { at: 5.05, actor: 'b2', do: 'vanish', dur: 0.2 },
    { at: 5.3, actor: 'b3', do: 'vanish', dur: 0.2 },
    // 小老鼠在後面偷笑
    { at: 5.2, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    { at: 5.2, actor: 'claw', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.1, actor: 'crab', do: 'shake', amount: 1, dur: 0.35 },
    { at: 6.5, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.5, actor: 'claw', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.2, actor: 'cap', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 6.2, actor: 'cap', do: 'shake', amount: 1, dur: 0.35 },
    // 國字讓位：螃蟹橫著走到中間，小老鼠沒地方躲了
    { at: 6.95, actor: 'crab', do: 'moveTo', to: { x: 80, y: K }, dur: 0.55, ease: 'inOut' },
    { at: 6.95, actor: 'crab', do: 'shake', amount: 1.2, dur: 0.55 },
    { at: 7.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 7.45, actor: 'crab', do: 'hop', amount: 6, dur: 0.35 },
    { at: 7.45, actor: 'crab', do: 'scaleTo', amount: 1.25, dur: 0.3, ease: 'back' },
    // 回馬槍：小老鼠踮腳想從螃蟹後面偷溜
    { at: 7.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    ...[7.95, 8.1, 8.25].flatMap((at, i) => [
      { at, actor: 'mouse', do: 'moveTo' as const, to: { x: 34 + i * 8, y: M }, dur: 0.14 },
      { at, actor: 'mouse', do: 'hop' as const, amount: 1.8, dur: 0.14 },
      { at, actor: 'claw', do: 'moveTo' as const, to: { x: 34 + i * 8, y: M + CLAW_ON_MOUSE }, dur: 0.14 },
      { at, actor: 'claw', do: 'hop' as const, amount: 1.8, dur: 0.14 },
    ]),
    // 喀嚓！尾巴被夾，整隻轉著圈飛過去，疊在隊長頭上
    { at: 8.4, actor: 'crab', do: 'moveTo', to: { x: 70, y: K }, dur: 0.08, ease: 'in' },
    { at: 8.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 8.45, actor: 'mouse', do: 'moveTo', to: { x: 128, y: C - 13.5 }, arc: 16, dur: 0.5, ease: 'linear' },
    { at: 8.45, actor: 'mouse', do: 'spin', times: 3, dur: 0.5 },
    { at: 8.45, actor: 'claw', do: 'moveTo', to: { x: 128, y: C - 28.5 }, arc: 16, dur: 0.5, ease: 'linear' },
    { at: 8.45, actor: 'claw', do: 'spin', times: -3, dur: 0.5 },
    { at: 8.95, actor: 'cap', do: 'squash', amount: 0.3, dur: 0.3 },
    // 螃蟹橫著走回左邊
    { at: 8.55, actor: 'crab', do: 'moveTo', to: { x: 30, y: K }, dur: 0.45, ease: 'inOut' },
    { at: 8.55, actor: 'crab', do: 'shake', amount: 1.2, dur: 0.45 },
    { at: 9.25, actor: 'cap', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 9.45, actor: 'crab', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 噴上天的三塊積木落下：角、刀＋牛、虫
    { at: 4.8, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'b1', color: '#F03E3E' },
    { at: 5.05, dur: 0.45, strokes: [7, 8, 9, 10, 11, 12], from: 'b2', color: '#E8590C' },
    { at: 5.3, dur: 0.45, strokes: [13, 14, 15, 16, 17, 18], from: 'b3', color: '#C2255C' },
  ],
  glyph: [
    { at: 5.8, dur: 0.4, do: 'wobble' },
    { at: 6.6, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.45, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 1.05, kind: 'pop', actor: 'cap', emoji: '❗', dx: 8, dur: 0.45 },
    { at: 1.6, kind: 'pop', actor: 'mouse', emoji: '😜', dx: -6, dur: 0.5 },
    { at: 2.6, kind: 'sweat', actor: 'cap' },
    { at: 2.85, kind: 'burst', actor: 'cap', n: 1, dx: -8, dy: 8, dur: 0.4 },
    { at: 3.35, kind: 'dizzy', actor: 'cap', dur: 0.4 },
    { at: 3.4, kind: 'pop', actor: 'mouse', emoji: '😆', dx: -6, dur: 0.45 },
    { at: 3.55, kind: 'pop', actor: 'cap', emoji: '💢', dx: 8, dur: 0.5 },
    { at: 3.75, kind: 'puff', actor: 'cap', dur: 0.4 },
    { at: 4.45, kind: 'burst', actor: 'cap', n: 1, dy: 10, dur: 0.45 },
    { at: 5.1, kind: 'dizzy', actor: 'cap', dur: 1.0 },
    { at: 5.25, kind: 'pop', actor: 'mouse', emoji: '😆', dx: -6, dur: 0.45 },
    { at: 6.5, kind: 'pop', actor: 'mouse', emoji: '😜', dx: -6, dur: 0.4 },
    { at: 7.4, kind: 'pop', actor: 'mouse', emoji: '😱', dx: -4, dur: 0.5 },
    { at: 7.45, kind: 'burst', actor: 'crab', emoji: '✨', n: 8, dur: 0.6 },
    { at: 8.4, kind: 'burst', actor: 'mouse', n: 1, dx: -6, dy: 12, dur: 0.35 },
    { at: 9.0, kind: 'pop', actor: 'cap', emoji: '😆', dx: -12, dy: 10, dur: 0.5 },
  ],
  camera: [
    { at: 2.85, dur: 0.3, do: 'shake', amount: 1 },
    { at: 4.45, dur: 0.4, do: 'shake', amount: 1.8 },
  ],
  lights: [{ at: 4.45, dur: 0.08, level: -0.8 }, { at: 4.55, dur: 0.3, level: 0 }],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.75, sfx: 'boing' },
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.55, say: '蟹' },
    { at: 2.85, sfx: 'bonk' },
    { at: 4.05, sfx: 'whoosh' },
    { at: 4.45, sfx: 'crack' },
    { at: 5.8, say: '蟹' },
    { at: 6.95, sfx: 'slide' },
    { at: 7.45, say: '螃蟹' },
    { at: 8.4, sfx: 'crack' },
    { at: 8.95, sfx: 'boing' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
