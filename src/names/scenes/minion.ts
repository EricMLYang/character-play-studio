// 演的是字面意思：小小＋兵——螞蟻那麼小的小兵，戴頭盔的隊長帶大家合力扛一顆大草莓，扛起來又被一隻小鳥壓扁（沒有黃色膠囊身體、護目鏡、吊帶褲、香蕉）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 沙丘上的野餐籃旁掉了一顆大草莓。戴頭盔的螞蟻隊長帶四個小兵跑來，一起抬——抬不動（大家累趴）。
// 隊長吹號，又跑來四個：八個一起抬，草莓慢慢升起來！一隻小鳥飛過來停在草莓上……咚！草莓壓回地上，小兵全扁了。
// 小鳥左看右看（停一拍）——草莓連小鳥一起被抬起來，咻地扛走了；一下又扛回來，隊長站到草莓旁邊挺起胸膛：「小小兵」。
const A = 74.1 // 螞蟻（size 7）站在地上的 y
const BERRY = { x: 70, y: 66.1 } // 草莓（size 26）在地上
const LIFT = 6 // 抬起來多高
const HELM = -4.6 // 頭盔在隊長頭上（比螞蟻的 y 高多少）
const CREW = [-10, -4, 2, 8] // 前四個小兵在草莓下面的位置（相對草莓 x）
const MORE = [-13, -7, -1, 5] // 後來的四個
const ANTS = [...CREW.map((dx, i) => ({ id: `a${i}`, dx })), ...MORE.map((dx, i) => ({ id: `m${i}`, dx }))]
const BIRD_DY = -15 // 小鳥站在草莓上

/** 草莓（和上面的小鳥、下面的小兵）一起移到 x、抬高 lift */
const carry = (at: number, dur: number, x: number, lift: number, ease: Move['ease'], bird = true): Move[] => [
  { at, dur, actor: 'berry', do: 'moveTo', to: { x, y: BERRY.y - lift }, ease },
  ...(bird ? [{ at, dur, actor: 'bird', do: 'moveTo' as const, to: { x: x + 2, y: BERRY.y - lift + BIRD_DY }, ease }] : []),
  ...ANTS.map((a): Move => ({ at, dur, actor: a.id, do: 'moveTo', to: { x: x + a.dx, y: A }, ease })),
]

export default scene({
  duration: 9.4,
  bg: { top: '#FFD98F', bottom: '#FFF3D6', floor: '#EBC27E', scenery: 'desert' },
  actors: [
    { id: 'basket', emoji: '🧺', x: 22, y: 67.8, size: 22 },
    { id: 'cactus', emoji: '🌵', x: 148, y: 60.2, size: 40 },
    { id: 'berry', emoji: '🍓', x: BERRY.x, y: BERRY.y, size: 26 },
    { id: 'bird', emoji: '🐦', x: 30, y: -10, size: 12, float: true },
    ...CREW.map((dx, i) => ({ id: `a${i}`, emoji: '🐜', x: 140 + i * 7, y: A, size: 7 })),
    ...MORE.map((_, i) => ({ id: `m${i}`, emoji: '🐜', x: 176 + i * 6, y: A, size: 7 })),
    { id: 'cap', emoji: '🐜', x: 118, y: A, size: 7 },
    { id: 'helm', emoji: '🪖', x: 118, y: A + HELM, size: 5 },
  ],
  moves: [
    // 隊長帶頭跑進來，小兵跟在後面
    { at: 0.05, actor: 'cap', do: 'enter', from: { x: 172, y: A }, dur: 0.7, anticipate: 3, ease: 'out' },
    { at: 0.05, actor: 'helm', do: 'enter', from: { x: 172, y: A + HELM }, dur: 0.7, anticipate: 3, ease: 'out' },
    ...CREW.map((_, i): Move => ({ at: 0.15 + i * 0.1, actor: `a${i}`, do: 'enter', from: { x: 178 + i * 6, y: A }, dur: 0.7, ease: 'out' })),
    // 隊長看到草莓，大家衝過去
    { at: 1.3, actor: 'cap', do: 'moveTo', to: { x: 96, y: A }, dur: 0.35, ease: 'out' },
    { at: 1.3, actor: 'helm', do: 'moveTo', to: { x: 96, y: A + HELM }, dur: 0.35, ease: 'out' },
    ...CREW.map((dx, i): Move => ({ at: 1.35 + i * 0.05, actor: `a${i}`, do: 'moveTo', to: { x: BERRY.x + dx, y: A }, dur: 0.45, ease: 'out' })),
    // 一起抬——抬不動
    ...CREW.map((_, i): Move => ({ at: 2.0, actor: `a${i}`, do: 'squash', amount: -0.25, dur: 0.4 })),
    { at: 2.0, actor: 'berry', do: 'shake', amount: 0.3, dur: 0.4 },
    ...CREW.map((_, i): Move => ({ at: 2.5 + i * 0.05, actor: `a${i}`, do: 'squash', amount: 0.4, dur: 0.4 })),
    // 隊長吹號，又跑來四個
    { at: 2.9, actor: 'cap', do: 'hop', amount: 3, dur: 0.25 },
    ...MORE.map((dx, i): Move => ({ at: 3.0 + i * 0.06, actor: `m${i}`, do: 'moveTo', to: { x: BERRY.x + dx, y: A }, dur: 0.45, ease: 'out' })),
    // 八個一起抬：草莓升起來！
    ...ANTS.map((a): Move => ({ at: 3.6, actor: a.id, do: 'squash', amount: -0.2, dur: 0.3 })),
    ...carry(3.75, 0.4, BERRY.x, LIFT, 'back', false),
    // 小鳥飛過來停在草莓上……咚！壓回地上
    { at: 4.0, actor: 'bird', do: 'moveTo', to: { x: BERRY.x + 2, y: BERRY.y - LIFT + BIRD_DY }, dur: 0.4, ease: 'out' },
    ...carry(4.45, 0.12, BERRY.x, 0, 'in'),
    ...ANTS.map((a): Move => ({ at: 4.55, actor: a.id, do: 'squash', amount: 0.6, dur: 0.6 })),
    { at: 4.55, actor: 'cap', do: 'hop', amount: 4, dur: 0.3 },
    { at: 4.55, actor: 'helm', do: 'hop', amount: 4, dur: 0.3 },
    // 小鳥左看右看
    { at: 5.0, actor: 'bird', do: 'flip' },
    { at: 5.35, actor: 'bird', do: 'flip' },
    // 草莓連小鳥一起被扛走！
    ...carry(5.7, 0.2, BERRY.x, LIFT, 'back'),
    ...carry(5.95, 0.6, -30, LIFT, 'in'),
    { at: 6.2, actor: 'cap', do: 'flip' },
    { at: 6.2, actor: 'helm', do: 'flip' },
    // 一下又扛回來
    { at: 6.75, actor: 'berry', do: 'flip' },
    ...carry(6.75, 0.6, 60, LIFT, 'out'),
    ...ANTS.map((a): Move => ({ at: 6.75, actor: a.id, do: 'flip' })),
    { at: 6.75, actor: 'bird', do: 'flip' },
    // 隊長跳上草莓頂，變大敬禮
    { at: 7.3, actor: 'cap', do: 'moveTo', to: { x: 94, y: A }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 7.3, actor: 'helm', do: 'moveTo', to: { x: 98, y: A + HELM * 3 + 6.5 }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 7.3, actor: 'cap', do: 'scaleTo', amount: 3, dur: 0.35, ease: 'back' },
    { at: 7.3, actor: 'helm', do: 'scaleTo', amount: 3, dur: 0.35, ease: 'back' },
    { at: 8.0, actor: 'cap', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.0, actor: 'helm', do: 'hop', amount: 3, dur: 0.3 },
    ...ANTS.map((a, i): Move => ({ at: 7.9 + i * 0.04, actor: a.id, do: 'hop', amount: 2, dur: 0.25 })),
  ],
  fx: [
    { at: 0.8, kind: 'puff', actor: 'cap', dur: 0.4 },
    { at: 1.1, kind: 'pop', actor: 'cap', emoji: '❗', dur: 0.5 },
    { at: 2.0, kind: 'sweat', actor: 'a1' },
    { at: 2.6, kind: 'pop', actor: 'cap', emoji: '😑', dur: 0.5 },
    { at: 2.9, kind: 'pop', actor: 'cap', emoji: '📣', dx: -5, dur: 0.6 },
    { at: 3.4, kind: 'puff', actor: 'm3', n: 6, dur: 0.5 },
    { at: 3.9, kind: 'burst', actor: 'berry', emoji: '✨', n: 5, dur: 0.5 },
    { at: 4.55, kind: 'puff', actor: 'berry', n: 8, dur: 0.6 },
    { at: 4.6, kind: 'dizzy', actor: 'a2', dur: 0.8 },
    { at: 5.0, kind: 'pop', actor: 'bird', emoji: '❓', dur: 0.6 },
    { at: 5.75, kind: 'pop', actor: 'bird', emoji: '😱', dx: 5, dur: 0.5 },
    { at: 6.3, kind: 'pop', actor: 'cap', emoji: '😆', dx: 5, dur: 0.5 },
    { at: 7.6, kind: 'burst', actor: 'cap', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 7.7, kind: 'burst', actor: 'cap', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 3.7, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 72, y: 60 } },
    { at: 4.55, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 5.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.4, dur: 0.5, do: 'zoom', amount: 1.55, to: { x: 82, y: 56 } },
  ],
  lights: [
    { at: 4.0, dur: 0.3, level: 0.2 },
    { at: 4.55, dur: 0.3, level: 0 },
    { at: 7.6, dur: 0.05, level: -0.35 },
    { at: 7.65, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 1.1, sfx: 'blip' },
    { at: 2.0, sfx: 'rumble' },
    { at: 2.5, sfx: 'deflate' },
    { at: 2.9, sfx: 'blip' },
    { at: 3.75, sfx: 'boing' },
    { at: 4.45, sfx: 'bonk' },
    { at: 5.95, sfx: 'whoosh' },
    { at: 6.75, sfx: 'whoosh' },
    { at: 7.5, say: '小小兵' },
    { at: 7.7, sfx: 'cheer' },
  ],
})
