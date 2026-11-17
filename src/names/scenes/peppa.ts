// 演的是字面意思：佩（佩戴、戴在身上）＋佩＋豬——戴偵探帽的豬探長要走上頒獎台，小機器人一次又一次把金牌「佩」到他身上，重到走不動（不是側臉粉紅豬、沒穿裙子、沒有泥巴坑、沒有一家人）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小機器人每「佩」一次金牌到豬探長身上，他就被壓得更低、走得更慢。
// 同一隻伸長的手臂、同一聲「叮」，三次只有結果變大：一面（還得意地走得動）→ 兩面（彎腰喘氣、只拖一小步）→
// 先停一拍（機器人舉起一面超大的金牌，豬探長回頭看、嚇得發抖）→ 砰！整隻被壓扁在地上。
// 回馬槍是第四次：機器人再佩上一面小小的金牌——這次他沒有更扁，而是被金牌拖得往前一倒、整隻滾起來，
// 一路滾到頒獎台、彈上去站好：「佩佩豬」。
const S = 36 // 豬探長的 size
const PY = 77 - 0.42 * S // 豬探長站在地上的 y
const BS = 24 // 小機器人
const BY = 77 - 0.42 * BS
const GAP = 26 // 機器人永遠站在豬探長右後方這麼遠
const X1 = 112 // 第一次站的地方
const X2 = 101 // 第一次佩完自己走過去的地方
const X3 = 97 // 第二次佩完只拖得動這一小步
const TABLE = { x: 54, size: 26 }
const TOP = 58 // 頒獎台（桌子）的檯面
const PT = TOP + 1.5 - 0.42 * S // 站在檯面上的 y

type Pose = 'idle' | 'happy' | 'tired' | 'scared' | 'flat' | 'duck' | 'top'
/** 每面金牌掛在身上的位置：相對豬探長（朝左），照姿勢不同（top＝最後站上頒獎台，全部攤開來給大家看） */
const WEAR: Record<string, Record<Pose, [number, number]>> = {
  m1: { idle: [-1, 8], happy: [-1, 8], tired: [-3, 5], scared: [-1, 7], flat: [7, 7], duck: [-2, 7], top: [-10, 10] },
  m2: { idle: [-6, 9], happy: [-6, 9], tired: [-8, 6], scared: [-6, 8], flat: [11, 7], duck: [-6, 8], top: [8, 10] },
  m3: { idle: [4, 9], happy: [4, 9], tired: [2, 6], scared: [4, 8], flat: [15, 7], duck: [2, 8], top: [-1, 13] },
  big: { idle: [-1, 10], happy: [-1, 10], tired: [-3, 7], scared: [-1, 10], flat: [10, 5], duck: [0, 7], top: [-1, 12] },
  tiny: { idle: [0, -13], happy: [1, -13], tired: [-4, -7], scared: [0, -13], flat: [-2, 6], duck: [0, -6], top: [1, -13] },
}
const spot = (id: string, x: number, y: number, pose: Pose) => ({ x: x + WEAR[id][pose][0], y: y + WEAR[id][pose][1] })

/** 豬探長移動或換姿勢：身上已經戴著的金牌照抄（同一刻移到新位置） */
function body(at: number, dur: number, x: number, y: number, pose: Pose, worn: string[], extra: Partial<Move> = {}): Move[] {
  return [
    { at, actor: 'pig', do: 'moveTo', to: { x, y }, dur, ...extra },
    ...worn.map((id): Move => ({ at, actor: id, do: 'moveTo', to: spot(id, x, y, pose), dur, ...extra, anticipate: undefined })),
  ]
}

/**
 * 主軸笑點：機器人伸長手臂把金牌「佩」上去 → 叮 → 他被壓低一級。每一次都一模一樣：
 * 機器人換 extend、金牌從手上跳起來越過頭頂套進脖子、落下那一刻叮＋壓扁＋揚塵＋鏡頭推近。
 * k 是第幾次（0、1、2），ids 是這次佩上的金牌，x 是他站的地方，pose 是壓完的姿勢。hit＝金牌套上那一刻。
 */
function pin(hit: number, k: number, ids: string[], worn: string[], x: number, pose: Pose, held = false) {
  const bx = x + GAP
  const moves: Move[] = [
    { at: hit - 0.45, actor: 'bot', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: hit - 0.35, actor: 'bot', do: 'swap', emoji: held ? 'hero:bot/throw' : 'hero:bot/extend' },
    ...ids.flatMap((id, i): Move[] => [
      ...(held ? [] : [
        { at: hit - 0.35, actor: id, do: 'moveTo', to: { x: bx - 11 - 3 * i, y: BY - 3 }, dur: 0.01 },
        { at: hit - 0.33, actor: id, do: 'pop', dur: 0.1 },
      ] as Move[]),
      { at: hit - 0.25, actor: id, do: 'moveTo', to: spot(id, x, PY, pose === 'flat' ? 'idle' : pose), arc: 12 + 4 * k, dur: 0.25, ease: 'in' },
    ]),
    { at: hit + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    // 叮！被壓下去一級
    { at: hit, actor: 'pig', do: 'swap', emoji: `hero:pig/${pose}` },
    { at: hit, actor: 'pig', do: 'squash', amount: 0.18 + 0.12 * k, dur: 0.3 },
    ...body(hit, 0.12, x, PY, pose, [...worn, ...(pose === 'flat' ? ids : [])]),
  ]
  for (const id of ids) moves.push({ at: hit, actor: id, do: 'hop', amount: -1.5 - k, dur: 0.3 })
  if (k >= 1) moves.push({ at: hit + 0.1, actor: 'pig', do: 'shake', amount: 0.4 + 0.3 * k, dur: 0.4 })
  const fx: Fx[] = [
    { at: hit, kind: 'burst', x: x - 2, y: PY - 6, emoji: '✨', n: 4 + 2 * k, dur: 0.5, scale: 1.2 + 0.2 * k },
    { at: hit + 0.02, kind: 'puff', actor: 'pig', n: 4 + 4 * k, dur: 0.5 },
  ]
  if (k >= 2) fx.push({ at: hit, kind: 'burst', x: x + 14, y: PY + 4, n: 1, dur: 0.35, scale: 1.5 })
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: x + 8, y: k >= 2 ? PY + 6 : PY - 6 } },
    { at: hit, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.4 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at: hit - 0.3, sfx: 'whoosh' }, { at: hit, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: hit + 0.06, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: hit + 0.1, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

const H1 = 1.65, H2 = 3.55, H3 = 6.3, H4 = 7.65
const p1 = pin(H1, 0, ['m1'], [], X1, 'happy')
const p2 = pin(H2, 1, ['m2', 'm3'], ['m1'], X2, 'tired')
const p3 = pin(H3, 2, ['big'], ['m1', 'm2', 'm3'], X3, 'flat', true)
const ALL = ['m1', 'm2', 'm3', 'big']
// 回馬槍：同一隻手、同一聲叮，佩上一面小小的——他被拖得往前一倒，整隻滾起來
const p4 = pin(H4, 0, ['tiny'], ALL, X3, 'flat')
const ROLL = H4 + 0.55
const BUMP = ROLL + 0.75
const LAND = BUMP + 0.45
const WORN = [...ALL, 'tiny']

export default scene({
  duration: 11.0,
  bg: { top: '#16204A', bottom: '#3C4A8C', floor: '#B23A3A', scenery: 'city' },
  actors: [
    { id: 'table', emoji: 'prop:table', x: TABLE.x, y: 77 - 0.42 * TABLE.size, size: TABLE.size },
    { id: 'pig', emoji: 'hero:pig/walk', x: X1, y: PY, size: S },
    { id: 'bot', emoji: 'hero:bot/idle', x: X1 + GAP, y: BY, size: BS },
    { id: 'm1', emoji: '🥇', x: 0, y: 0, size: 9, hidden: true, pivot: 'center' },
    { id: 'm2', emoji: '🥇', x: 0, y: 0, size: 9, hidden: true, pivot: 'center' },
    { id: 'm3', emoji: '🥇', x: 0, y: 0, size: 9, hidden: true, pivot: 'center' },
    { id: 'big', emoji: '🥇', x: 0, y: 0, size: 12, hidden: true, pivot: 'center' },
    { id: 'tiny', emoji: '🥇', x: 0, y: 0, size: 5, hidden: true, pivot: 'center' },
  ],
  moves: [
    // 開場：豬探長大步走向左邊的頒獎台，機器人追上來「等一下！」
    { at: 0, actor: 'pig', do: 'enter', from: { x: 172, y: PY }, dur: 0.8, ease: 'out' },
    { at: 0.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 0, actor: 'bot', do: 'enter', from: { x: 190, y: BY }, dur: 1.1, ease: 'back' },
    // 第一面：得意得跳一下，還走得動
    ...p1.moves,
    { at: H1 + 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    ...body(H1 + 0.55, 0.6, X2, PY, 'happy', ['m1']),
    { at: H1 + 0.7, actor: 'bot', do: 'moveTo', to: { x: X2 + GAP, y: BY }, dur: 0.6 },
    { at: H1 + 1.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: H1 + 1.2, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 第二面、第三面：彎腰喘氣，只拖得動一小步
    ...p2.moves,
    ...body(H2 + 0.6, 0.7, X3, PY, 'tired', ['m1', 'm2', 'm3'], { ease: 'linear' }),
    { at: H2 + 0.6, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.7 },
    { at: H2 + 0.8, actor: 'bot', do: 'moveTo', to: { x: X3 + GAP, y: BY }, dur: 0.4 },
    // 停一拍：機器人舉起一面超大的金牌，豬探長回頭一看，嚇得縮起來發抖
    { at: 4.75, actor: 'bot', do: 'swap', emoji: 'hero:bot/lift' },
    { at: 4.75, actor: 'big', do: 'moveTo', to: { x: X3 + GAP, y: BY - 18 }, dur: 0.01 },
    { at: 4.78, actor: 'big', do: 'pop', dur: 0.2 },
    { at: 5.0, actor: 'big', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: 5.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    ...body(5.05, 0.1, X3, PY, 'scared', ['m1', 'm2', 'm3']),
    { at: 5.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/scared' },
    { at: 5.5, actor: 'pig', do: 'shake', amount: 0.7, dur: 0.6 },
    // 砰！整隻壓扁
    ...p3.moves,
    { at: H3 + 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    // 回馬槍：再佩一面小小的
    ...p4.moves,
    { at: H4 + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 被金牌拖得往前一倒，整隻滾起來
    { at: ROLL - 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    ...body(ROLL, BUMP - ROLL, TABLE.x + 16, PY + 2, 'duck', WORN, { ease: 'in' }),
    { at: ROLL, actor: 'pig', do: 'spin', times: -3, dur: BUMP - ROLL, pivot: 'center' },
    ...WORN.map((id): Move => ({ at: ROLL, actor: id, do: 'spin', times: -2, dur: BUMP - ROLL })),
    { at: ROLL + 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ROLL + 0.15, actor: 'bot', do: 'moveTo', to: { x: 98, y: BY }, dur: 0.9, ease: 'out' },
    // 撞到頒獎台，彈上去站好
    ...body(BUMP, LAND - BUMP, TABLE.x, PT, 'top', WORN, { arc: 16, ease: 'out' }),
    { at: BUMP, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: BUMP, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: BUMP, actor: 'bot', do: 'hop', amount: 4, dur: 0.35 },
    { at: LAND, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.25 },
  ],
  fx: [
    ...p1.fx,
    ...p2.fx,
    { at: H2 + 0.2, kind: 'sweat', actor: 'pig', dur: 1.0 },
    { at: 5.5, kind: 'sweat', actor: 'pig', dur: 0.8 },
    ...p3.fx,
    ...p4.fx,
    { at: ROLL, kind: 'puff', actor: 'pig', n: 8, dur: 0.6 },
    { at: BUMP, kind: 'burst', x: TABLE.x + 8, y: 62, n: 1, dur: 0.35, scale: 1.6 },
    { at: LAND, kind: 'burst', actor: 'pig', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: LAND + 0.3, kind: 'burst', actor: 'pig', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: { x: 104, y: 50 } },
    ...p1.camera,
    ...p2.camera,
    // 停一拍時慢慢推近
    { at: 4.8, dur: 0.7, do: 'zoom', amount: 1.5, to: { x: 108, y: 56 } },
    ...p3.camera,
    { at: H3 + 0.5, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 104, y: 56 } },
    ...p4.camera,
    { at: ROLL, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 76, y: 50 } },
    { at: BUMP, dur: 0.3, do: 'shake', amount: 1.0 },
    { at: LAND, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: 66, y: 45 } },
  ],
  lights: [
    // 亮相：記者的閃光燈閃兩下
    { at: LAND + 0.05, dur: 0.05, level: -0.35 },
    { at: LAND + 0.1, dur: 0.3, level: 0 },
    { at: LAND + 0.6, dur: 0.05, level: -0.25 },
    { at: LAND + 0.65, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    ...p1.cues,
    ...p2.cues,
    { at: 4.78, sfx: 'boing' },
    { at: 5.5, sfx: 'rumble' },
    ...p3.cues,
    ...p4.cues,
    { at: ROLL, sfx: 'whoosh' },
    { at: BUMP, sfx: 'boing' },
    { at: LAND + 0.1, say: '佩佩豬' },
    { at: LAND + 0.4, sfx: 'cheer' },
  ],
})
