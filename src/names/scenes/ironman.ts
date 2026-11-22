// 演的是字面意思：鋼鐵＋人——穿著一身鋼鐵的小騎士，兔子哥哥一舉大磁鐵，鐵做的東西就「鏘」一聲黏到他身上；最大的那塊鐵就是他自己（沒有紅金盔甲、胸口發光的圓、手掌光束、飛行）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：兔子哥哥一舉大磁鐵，廚房裡鐵做的東西就「鏘」一聲黏到小騎士身上——一次比一次大，最大的那塊鐵是他自己。
// 同一個舉法、同一聲「鏘」：平底鍋從牆上飛過來黏在他頭上 → 大鍋子從桌上飛過來黏在他背上，撞得他往前跳 →
// 停一拍：哥哥再舉，什麼都沒飛過來，廚房已經沒有鐵了，小騎士得意地笑——腳底卻開始滑，他咬牙往後頂……
// 整個人連鍋帶盆被吸過去「鏘！」黏在磁鐵上，把哥哥壓倒。爬起來，渾身黏滿鐵：「鋼鐵人」。
const on = (surface: number, size: number) => surface + 3 - 0.42 * size
const S = 34 // 小騎士的 size
const G = on(74, S) // 小騎士站在地上的 y
const WX = 90 // 小騎士站的地方（前兩次都在這裡被黏）
const B = 30 // 兔子哥哥的 size
const BG = on(74, B)
const BX = 42
// 磁鐵（用 tube 畫的 U 形，開口朝右）：中心位置
const MAG_REST = { x: 54, y: 69 } // 放在哥哥腳邊
const MAG_UP = { x: BX + 1, y: 51 } // 舉過頭（兩手中間）
const MW = 6.5, MH = 5 // 半寬、半高
const TIP = 3 // 銀色磁極多長
// 黏在小騎士身上的位置（相對他的 x、y）
const STUCK = {
  pan: { dx: 6, dy: -17 }, // 平底鍋：扣在頭盔上，柄往右翹
  pot: { dx: 13, dy: 2 }, // 大鍋子：黏在背上（右邊）
  mag: { dx: -14, dy: -2 }, // 最後磁鐵黏在他左邊
}
const PAN0 = { x: 114, y: 33 } // 平底鍋掛在牆上
const TABLE = { x: 130, size: 24 }
const POT0 = { x: 131, y: 55 } // 大鍋子放在桌上

/** 磁鐵的四個角跟著中心一起動 */
function mag(at: number, dur: number, c: { x: number; y: number }, ease: Move['ease'] = 'out', arc?: number): Move[] {
  const pts = { mA: [-MW, -MH], mB: [-MW, MH], mT: [MW, -MH], mU: [MW, MH] } as const
  return Object.entries(pts).map(([id, [dx, dy]]): Move => ({ at, dur, actor: id, do: 'moveTo', to: { x: c.x + dx, y: c.y + dy }, ease, arc }))
}
/** 磁鐵整支畫出來（整段一直在） */
function magnetFx(dur: number): Fx[] {
  const RED = '#E5484D', STEEL = '#D9DEE6', W = 3.2, n = 99
  return [
    { at: 0, dur, kind: 'tube', actor: 'mT', dx: -TIP, target: 'mA', color: RED, width: W, n },
    { at: 0, dur, kind: 'tube', actor: 'mU', dx: -TIP, target: 'mB', color: RED, width: W, n },
    { at: 0, dur, kind: 'tube', actor: 'mA', target: 'mB', color: RED, width: W, n },
    { at: 0, dur, kind: 'tube', actor: 'mT', dx: -TIP, target: 'mT', color: STEEL, width: W, n },
    { at: 0, dur, kind: 'tube', actor: 'mU', dx: -TIP, target: 'mU', color: STEEL, width: W, n },
  ]
}

/** 小騎士移動，黏在身上的東西跟著（ids 是已經黏上的） */
function knight(at: number, dur: number, x: number, y: number, ids: (keyof typeof STUCK)[], ease: Move['ease'] = 'out', arc?: number): Move[] {
  const moves: Move[] = [{ at, dur, actor: 'kn', do: 'moveTo', to: { x, y }, ease, arc }]
  for (const id of ids) {
    if (id === 'mag') moves.push(...mag(at, dur, { x: x + STUCK.mag.dx, y: y + STUCK.mag.dy }, ease, arc))
    else moves.push({ at, dur, actor: id, do: 'moveTo', to: { x: x + STUCK[id].dx, y: y + STUCK[id].dy }, ease, arc })
  }
  return moves
}
/** 小騎士抖一下，黏著的東西一起抖 */
function jolt(at: number, dur: number, amount: number, ids: string[], hop = 0): Move[] {
  const all = ['kn', ...ids.flatMap((id) => (id === 'mag' ? ['mA', 'mB', 'mT', 'mU'] : [id]))]
  return all.flatMap((actor): Move[] => [
    { at, actor, do: 'shake', amount, dur },
    ...(hop ? [{ at, actor, do: 'hop', amount: hop, dur: 0.35 } as Move] : []),
  ])
}

/** 哥哥舉磁鐵（每一次都一模一樣）。l 是舉到頭頂那一刻 */
function lift(l: number) {
  const moves: Move[] = [
    { at: l - 0.4, actor: 'bro', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: l - 0.25, actor: 'bro', do: 'swap', emoji: 'prop:bro-lift' },
    ...mag(l - 0.25, 0.25, MAG_UP, 'back'),
    ...['mA', 'mB', 'mT', 'mU'].map((id): Move => ({ at: l, actor: id, do: 'shake', amount: 0.5, dur: 0.4 })),
  ]
  // 磁極「滋」一下冒小星光（每次一樣）
  const fx: Fx[] = [{ at: l, kind: 'burst', x: MAG_UP.x + MW + 2, y: MAG_UP.y, emoji: '✨', n: 4, dur: 0.45, scale: 1.1 }]
  const cues: Cue[] = [{ at: l - 0.25, sfx: 'whoosh' }, { at: l, sfx: 'blip' }]
  return { moves, fx, cues }
}
/** 放下磁鐵 */
const lower = (at: number): Move[] => [
  { at, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
  ...mag(at, 0.3, MAG_REST, 'inOut'),
]

/**
 * 主軸笑點：舉磁鐵 → 鐵東西飛過來「鏘」黏在小騎士身上、他傻眼。k＝0 平底鍋、1 大鍋子（更大、撞得更重）。
 */
function clang(l: number, k: 0 | 1) {
  const id = k === 0 ? 'pan' : 'pot'
  const from = k === 0 ? PAN0 : POT0
  const stuck = k === 0 ? [] : ['pan' as const]
  const hit = l + 0.45
  const fly = 0.25
  const to = { x: WX + STUCK[id].dx, y: G + STUCK[id].dy }
  const lt = lift(l)
  const moves: Move[] = [
    ...lt.moves,
    // 東西先抖、往磁鐵那邊歪，然後「咻」飛過來
    { at: l, actor: id, do: 'shake', amount: 0.6 + 0.4 * k, dur: hit - fly - l },
    { at: hit - fly, actor: id, do: 'moveTo', to, dur: fly, ease: 'in', arc: k === 0 ? 3 : 5 },
    ...(k === 0 ? [{ at: hit - fly, actor: 'pan', do: 'rotateTo', amount: -25, dur: fly } as Move] : []),
    // 鏘！傻眼
    { at: hit, actor: 'kn', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: hit, actor: 'kn', do: 'squash', amount: 0.12 + 0.08 * k, dur: 0.25 },
    ...jolt(hit, 0.45, 0.5 + 0.5 * k, [...stuck, id], k === 0 ? 0 : 4),
    ...lower(hit + 0.6),
  ]
  const fx: Fx[] = [
    ...lt.fx,
    { at: hit, kind: 'burst', x: to.x, y: to.y, n: 1, dur: 0.35, scale: 1.0 + 0.5 * k },
    { at: hit + 0.05, kind: 'burst', actor: 'kn', emoji: '⭐', n: 3 + 3 * k, dur: 0.5, scale: 1.1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: WX, y: G - 6 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.7 + 0.6 * k },
  ]
  const cues: Cue[] = [...lt.cues, { at: hit, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: hit + 0.05, sfx: 'bonk' })
  return { moves, fx, camera, cues, hit }
}

const L1 = 1.1, L2 = 3.0, L3 = 5.0
const c1 = clang(L1, 0)
const c2 = clang(L2, 1)
const l3 = lift(L3)
const SLIDE = 5.85 // 腳底開始滑
const YANK = 6.35 // 被吸過去
const HIT = YANK + 0.3 // 鏘！黏上磁鐵
const HX = MAG_UP.x - STUCK.mag.dx, HY = MAG_UP.y - STUCK.mag.dy // 黏在磁鐵上時小騎士的位置
const FALL = HIT + 0.5 // 黏在磁鐵上停一下，哥哥撐不住往後倒
const DOWN = FALL + 0.25 // 摔到地上
const DX = 64 // 摔下來的地方
const UP = DOWN + 0.7 // 爬起來亮相
const FX_ = 74 // 亮相站的地方
const DUR = UP + 2.0
const ALL = ['pan', 'pot'] as const

export default scene({
  duration: DUR,
  bg: { top: '#9FD8CF', bottom: '#DDF3EE', floor: '#C8925E', scenery: 'room' },
  actors: [
    { id: 'plant', emoji: '🪴', x: 16, y: on(74, 16), size: 16 },
    { id: 'table', emoji: 'prop:table', x: TABLE.x, y: on(74, TABLE.size), size: TABLE.size },
    { id: 'bro', emoji: 'prop:bro', x: BX, y: BG, size: B },
    { id: 'kn', emoji: 'hero:warrior/idle', x: WX, y: G, size: S },
    { id: 'pot', emoji: 'prop:dumpling-pot', x: POT0.x, y: POT0.y, size: 18 },
    { id: 'pan', emoji: 'prop:pan', x: PAN0.x, y: PAN0.y, size: 17, float: true },
    // 磁鐵四個角（看不到，用來拉 tube）
    ...(['mA', 'mB', 'mT', 'mU'] as const).map((id, i) => ({
      id, emoji: '⭐', hidden: true, size: 2,
      x: MAG_REST.x + (i < 2 ? -MW : MW), y: MAG_REST.y + (i % 2 ? MH : -MH),
    })),
  ],
  moves: [
    // 開場：哥哥搓手、小騎士站好挺胸
    { at: 0.1, actor: 'bro', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.3, actor: 'kn', do: 'hop', amount: 3, dur: 0.3 },
    // 第一次：平底鍋扣到頭上
    ...c1.moves,
    { at: c1.hit + 0.55, actor: 'kn', do: 'swap', emoji: 'hero:warrior/idle' },
    // 第二次：大鍋子撞到背上
    ...c2.moves,
    { at: c2.hit + 0.6, actor: 'kn', do: 'swap', emoji: 'hero:warrior/idle' },
    // 停一拍：哥哥再舉——什麼都沒飛過來
    ...l3.moves,
    { at: L3 + 0.45, actor: 'bro', do: 'tilt', amount: 12, dur: 0.4 },
    // 小騎士得意：廚房已經沒有鐵了
    { at: L3 + 0.3, actor: 'kn', do: 'swap', emoji: 'hero:warrior/swing' },
    // 可是腳底開始滑……咬牙往後頂
    { at: SLIDE, actor: 'kn', do: 'swap', emoji: 'hero:warrior/shield' },
    ...knight(SLIDE, 0.45, WX - 4, G, [...ALL], 'in'),
    ...jolt(SLIDE, 0.5, 0.5, [...ALL]),
    // 整個人被吸過去：鏘！
    { at: YANK, actor: 'kn', do: 'swap', emoji: 'hero:warrior/surprised' },
    ...knight(YANK, 0.3, HX, HY, [...ALL], 'in', 4),
    // 哥哥被壓倒
    { at: HIT, actor: 'bro', do: 'squash', amount: 0.22, dur: 0.4 },
    ...jolt(HIT, 0.45, 0.8, [...ALL, 'mag']),
    { at: HIT + 0.15, actor: 'bro', do: 'swap', emoji: 'prop:bro-shock' },
    { at: FALL, actor: 'bro', do: 'rotateTo', amount: -80, dur: 0.3, ease: 'out' },
    // 小騎士連磁鐵一起摔到地上
    ...knight(FALL, 0.25, DX, G, [...ALL, 'mag'], 'in'),
    { at: DOWN, actor: 'kn', do: 'squash', amount: 0.2, dur: 0.25 },
    // 爬起來亮相
    { at: UP, actor: 'kn', do: 'swap', emoji: 'hero:warrior/happy' },
    ...knight(UP, 0.45, FX_, G, [...ALL, 'mag'], 'out', 8),
    { at: UP + 0.3, actor: 'bro', do: 'rotateTo', amount: 80, dur: 0.3, ease: 'back' },
    { at: UP + 0.3, actor: 'bro', do: 'swap', emoji: 'prop:bro-oops' },
  ],
  fx: [
    ...magnetFx(DUR),
    ...c1.fx,
    ...c2.fx,
    ...l3.fx,
    { at: SLIDE, kind: 'sweat', actor: 'kn', dur: 0.8 },
    { at: SLIDE + 0.1, kind: 'puff', actor: 'kn', n: 6, dur: 0.5 },
    { at: HIT, kind: 'burst', x: MAG_UP.x + MW + 1, y: MAG_UP.y + 6, n: 1, dur: 0.35, scale: 1.8 },
    { at: HIT + 0.05, kind: 'burst', actor: 'kn', emoji: '⭐', n: 8, dur: 0.6, scale: 1.5, dy: -10 },
    { at: HIT + 0.1, kind: 'sweat', actor: 'bro', dur: 0.6 },
    { at: DOWN, kind: 'puff', actor: 'kn', n: 10, dur: 0.6 },
    { at: UP + 0.45, kind: 'burst', actor: 'kn', emoji: '✨', n: 10, dur: 0.9, scale: 1.4, dy: -12 },
    { at: UP + 0.7, kind: 'burst', actor: 'kn', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4, dy: -16 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: { x: 88, y: 50 } },
    ...c1.camera,
    ...c2.camera,
    // 停一拍：慢慢推近小騎士
    { at: L3 + 0.2, dur: 0.8, do: 'zoom', amount: 1.45, to: { x: 80, y: 50 } },
    { at: YANK, dur: 0.3, do: 'zoom', amount: 1.3, to: { x: 76, y: 50 } },
    { at: HIT, dur: 0.45, do: 'punch', amount: 0.14, to: { x: HX - 6, y: HY } },
    { at: HIT, dur: 0.5, do: 'shake', amount: 2 },
    // 哥哥往後倒：鏡頭往左讓，不要把他切掉
    { at: FALL, dur: 0.3, do: 'zoom', amount: 1.2, to: { x: 58, y: 50 } },
    { at: DOWN, dur: 0.3, do: 'shake', amount: 1 },
    // 亮相
    { at: UP, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: FX_ - 6, y: 55 } },
  ],
  lights: [
    { at: HIT, dur: 0.05, level: -0.25 },
    { at: HIT + 0.05, dur: 0.35, level: 0 },
    { at: UP + 0.45, dur: 0.05, level: -0.3 },
    { at: UP + 0.5, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'boing' },
    ...c1.cues,
    ...c2.cues,
    ...l3.cues,
    { at: SLIDE, sfx: 'slide' },
    { at: YANK, sfx: 'whoosh' },
    { at: HIT, sfx: 'clink' },
    { at: HIT + 0.05, sfx: 'crack' },
    { at: DOWN, sfx: 'bonk' },
    { at: UP, sfx: 'boing' },
    { at: UP + 0.45, say: '鋼鐵人' },
    { at: UP + 0.7, sfx: 'cheer' },
  ],
})
