// 演的是字面意思：飯糰＋男孩——一個男孩捏飯糰，越捏越大（飯糰就是飯糰：沒有臉、沒有手腳，不戴在頭上、不套在身上）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：楊捷睿抓一把飯、拍拍拍捏成飯糰，舉起來欣賞——飯糰「噗」地大一號，把他的手壓得往下沉。
// 同一個動作（轉身從大碗抓一把飯丟上去 → 拍拍拍 → 舉起來 → 噗地大一號、手一沉）、同一串「啪—拍拍拍—噗」，做三次：
// 第一顆一手舉得起來 → 第二顆兩手舉、搖搖晃晃 → 停一拍：碗快見底了，他看看碗、看看飯糰，還是整碗倒上去——
// 噗！飯糰比他整個人還大，舉不住，咚地把他壓扁在底下，只露出頭。
// 反轉：旁邊餓了半天的小松鼠爬上大飯糰，在尖尖咬了一小口——嘩！大飯糰散成一堆小飯糰，
// 一顆剛好落在他舉起的拳頭上，松鼠也抱著一顆：大家一人一顆，「飯糰男孩」。
// 場景：白天的露營地（帳篷、木頭）。主角用楊捷睿（孩子自己），配角一隻松鼠。

// ── 站位 ──
const S = 38 // 楊捷睿的 size
const BY = 77 - 0.42 * S
const BX = 84 // 他站的地方（每一次都在這裡）
const KNOW = { x: BX - 9, y: 52 } // know（朝左）舉起的拳頭頂（量過）
const LIFT = { x: BX, y: 46.5 } // lift 兩手舉高的手掌頂（量過）
// 大碗飯（prop:rice size 20）在他右手邊
const RS = 20
const RX = BX + 22
const RY = 77 - 0.42 * RS
// 松鼠（🐿️ 圖朝左）：蹲在飯碗另一邊，盯著飯看
const QS = 20
const QX = 124
const QY = 77 - 0.42 * QS
// 飯糰：一個 size 52 的 🍙 用 scaleTo 縮放（腳底為準）。底部在 vb 時的 y
const BS = 52
const ballY = (vb: number) => vb - 1 - 0.42 * BS
/** 每一次的大小（倍率）：約 10 → 19 → 33 → 50 */
const SZ = [0.2, 0.37, 0.64, 0.96]
/** 飯糰放在地上時的 x：右邊緣在他手前面 */
const gx = (s: number) => BX - 16 - 0.41 * BS * s
const GROUND = 78
/** 飯糰頂端（放在地上時），丟一把飯上去的落點 */
const topOf = (s: number) => GROUND - 0.84 * BS * s
// 被壓扁：他往後退一小步趴下、頭朝左（頭在 BX − 15），大飯糰壓在他背上
const CRUSH = BX + 18
// 小飯糰（🍙 size 12）
const RI = 12
const riY = (vb: number) => vb - 1 - 0.42 * RI
/** 推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 轉身從大碗抓一把飯（p＝抓到那一刻），轉回來丟到地上的飯糰上。回傳 land＝那把飯落下去的時間 */
function scoop(p: number, k: number) {
  const s = SZ[k]
  const land = p + 0.42
  const moves: Move[] = [
    // 第一次開場就看著碗，不用轉
    ...(k > 0 ? [{ at: p - 0.25, actor: 'boy', do: 'flip' } as Move] : []),
    { at: p - 0.25, actor: 'boy', do: 'swap', emoji: 'hero:yang/reach' },
    { at: p - 0.25, actor: 'boy', do: 'moveTo', to: { x: BX + 3, y: BY }, dur: 0.18, ease: 'out' },
    { at: p, actor: 'bowl', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: p, actor: 'bowl', do: 'swap', emoji: 'prop:rice', half: 'bottom', cut: [0.38, 0.45][k] },
    { at: p, actor: 'clump', do: 'moveTo', to: { x: RX - 2, y: 60 }, dur: 0.01 },
    { at: p, actor: 'clump', do: 'pop', dur: 0.12 },
    // 轉回來丟上去
    { at: p + 0.14, actor: 'boy', do: 'flip' },
    { at: p + 0.14, actor: 'boy', do: 'swap', emoji: 'hero:yang/throw' },
    { at: p + 0.14, actor: 'boy', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.15 },
    { at: p + 0.14, actor: 'clump', do: 'moveTo', to: { x: gx(s), y: topOf(s) - 4 }, arc: 12, dur: land - p - 0.14, ease: 'in' },
    { at: p + 0.14, actor: 'clump', do: 'spin', times: -1, dur: land - p - 0.14 },
    { at: land, actor: 'clump', do: 'vanish', dur: 0.06 },
  ]
  if (k === 0) {
    // 第一把：落地就是一顆小飯糰
    moves.push({ at: land, actor: 'ball', do: 'pop', dur: 0.2 })
    moves.push({ at: land + 0.001, actor: 'ball', do: 'scaleTo', amount: SZ[0], dur: 0 })
  } else {
    moves.push({ at: land, actor: 'ball', do: 'squash', amount: 0.25, dur: 0.2 })
  }
  const fx: Fx[] = [{ at: land, kind: 'puff', x: gx(s), y: topOf(s) + 2, n: 4, dur: 0.4 }]
  const cues: Cue[] = [{ at: p, sfx: 'plop' }, { at: land, sfx: 'plop' }]
  return { moves, fx, cues, land }
}

/**
 * 拍拍拍 → 舉起來欣賞 → 噗！大一號，手被壓得往下沉。q＝第一下拍，k＝第幾次（0、1、2）。
 * 回傳 pop＝大一號那一刻。
 */
function shape(q: number, k: number) {
  const s = SZ[k]
  const up = q + 0.5
  const pop = up + 0.4
  const hold = k === 0 ? { x: KNOW.x, y: ballY(KNOW.y) } : { x: LIFT.x, y: ballY(LIFT.y) }
  const sink = [2, 3.5, 7][k]
  const moves: Move[] = []
  // 拍拍拍：兩手往前推一下、飯糰扁一下
  for (let i = 0; i < 3; i++) {
    const t = q + 0.15 * i
    moves.push(
      { at: t, actor: 'boy', do: 'swap', emoji: 'hero:yang/push' },
      { at: t, actor: 'boy', do: 'hop', amount: -1.5, dur: 0.12 },
      { at: t, actor: 'ball', do: 'squash', amount: 0.22, dur: 0.12 },
      { at: t + 0.08, actor: 'boy', do: 'swap', emoji: 'hero:yang/hug' },
    )
  }
  moves.push(
    // 舉起來欣賞
    { at: up, actor: 'boy', do: 'swap', emoji: k === 0 ? 'hero:yang/know' : 'hero:yang/lift' },
    { at: up, actor: 'boy', do: 'squash', amount: -0.08, dur: 0.2 },
    { at: up, actor: 'ball', do: 'moveTo', to: hold, arc: 4, dur: 0.22, ease: 'out' },
    { at: up + 0.24, actor: 'ball', do: 'hop', amount: 1.5, dur: 0.15 },
    // 噗！大一號（有彈性），手被壓得往下沉
    { at: pop, actor: 'ball', do: 'scaleTo', amount: SZ[k + 1] / s, dur: 0.4, ease: 'elastic' },
    { at: pop, actor: 'boy', do: 'squash', amount: 0.1 + 0.07 * k, dur: 0.4 },
    { at: pop, actor: 'boy', do: 'hop', amount: -sink, dur: 0.45 },
    { at: pop, actor: 'ball', do: 'hop', amount: -sink * 1.4, dur: 0.45 },
  )
  const fx: Fx[] = [
    { at: q, kind: 'puff', x: gx(s), y: GROUND - 2, n: 3, dur: 0.5 },
    { at: pop, kind: 'burst', x: hold.x, y: hold.y - 4 - 6 * k, emoji: '✨', n: 6 + 2 * k, dy: -4, dur: 0.6, scale: 1.1 + 0.2 * k },
  ]
  if (k >= 1) fx.push({ at: pop + 0.1, kind: 'sweat', actor: 'boy', dur: 0.6 })
  const camera: Camera[] = [
    { at: pop, dur: 0.4, do: 'punch', amount: [0.07, 0.08, 0.05][k], to: { x: BX, y: 56 } },
    { at: pop, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.5 + 0.5 * k },
  ]
  // 同一串音效：拍拍拍＋噗，一次比一次多疊一個
  const cues: Cue[] = [
    { at: q, sfx: 'tap' }, { at: q + 0.15, sfx: 'tap' }, { at: q + 0.3, sfx: 'tap' },
    { at: pop, sfx: 'poof' },
  ]
  if (k >= 1) cues.push({ at: pop + 0.05, sfx: 'boing' })
  if (k >= 2) cues.push({ at: pop + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues, pop }
}

/** 放回地上（越來越吃力） */
function putDown(at: number, k: number, pose: string): Move[] {
  const s = SZ[k + 1]
  return [
    // 先往前移開、再放下，不從他臉前面經過
    { at, actor: 'ball', do: 'moveTo', to: { x: gx(s), y: ballY(LIFT.y) + 4 }, dur: 0.12, ease: 'out' },
    { at: at + 0.12, actor: 'ball', do: 'moveTo', to: { x: gx(s), y: ballY(GROUND) }, dur: 0.15, ease: 'in' },
    { at: at + 0.1, actor: 'boy', do: 'swap', emoji: `hero:yang/${pose}` },
  ]
}

// ── 時間表 ──
const s0 = scoop(0.5, 0)
const f0 = shape(s0.land + 0.15, 0)
const D0 = f0.pop + 0.4
const s1 = scoop(D0 + 0.5, 1)
const f1 = shape(s1.land + 0.15, 1)
const D1 = f1.pop + 0.45
// 停一拍：轉身看碗——快見底了；看看飯糰、再看看碗……還是整碗倒上去
const LOOK = D1 + 0.35
const GRAB = LOOK + 0.9
const POUR = GRAB + 0.4
const TOSS = POUR + 0.35
const f2 = shape(TOSS + 0.15, 2)
const P2 = f2.pop
// 舉不住：搖搖晃晃，咚！壓扁在底下
const FALL = P2 + 0.55
const HIT = FALL + 0.3
// 松鼠爬上大飯糰咬一小口
const CLIMB = HIT + 0.3
const BITE = CLIMB + 0.4
const BURST = BITE + 0.45 // 嘩！散成一堆小飯糰
const POSE = BURST + 0.45
const END = POSE + 1.65 // 名字唸完再留 0.5 秒以上

// 小飯糰散開的落點：r1 落到他舉起的拳頭上，r2 給松鼠，其他堆在中間
const SQEND = { x: 123, y: QY }
const PILE = [
  { id: 'r1', to: { x: KNOW.x, y: riY(KNOW.y) }, arc: 16 },
  { id: 'r2', to: { x: SQEND.x - 7, y: riY(GROUND - 7) }, arc: 12 },
  { id: 'r3', to: { x: 96, y: riY(GROUND) }, arc: 10 },
  { id: 'r4', to: { x: 106, y: riY(GROUND) }, arc: 12 },
  { id: 'r5', to: { x: 101, y: riY(GROUND - 9) }, arc: 14 },
  { id: 'r6', to: { x: 58, y: riY(GROUND) }, arc: 12 },
]

export default scene({
  duration: Math.ceil(END * 10) / 10,
  bg: { top: '#5FA8E0', bottom: '#CDEBEF', floor: '#D8BE8E', scenery: 'forest' },
  actors: [
    { id: 'tent', emoji: '⛺', x: 141, y: 77 - 0.42 * 28, size: 28 },
    { id: 'log', emoji: '🪵', x: 30, y: 77 - 0.42 * 14, size: 14 },
    { id: 'bowl', emoji: 'prop:rice', x: RX, y: RY, size: RS, pivot: 'center' },
    ...PILE.slice(2).map((r) => ({ id: r.id, emoji: '🍙', x: CRUSH, y: 50, size: RI, hidden: true })),
    { id: 'boy', emoji: 'hero:yang/drool', x: BX, y: BY, size: S, flip: true },
    { id: 'ball', emoji: '🍙', x: gx(SZ[0]), y: ballY(GROUND), size: BS, hidden: true },
    { id: 'sq', emoji: '🐿️', x: QX, y: QY, size: QS },
    { id: 'clump', emoji: 'prop:snowball', x: RX, y: 60, size: 7, hidden: true, pivot: 'center' },
    ...PILE.slice(0, 2).map((r) => ({ id: r.id, emoji: '🍙', x: CRUSH, y: 50, size: RI, hidden: true })),
  ],
  moves: [
    // 開場：看著一大碗飯流口水，松鼠也跳一下（牠也餓）
    { at: 0.1, actor: 'boy', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.25, actor: 'boy', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.3, actor: 'sq', do: 'hop', amount: 3, dur: 0.3 },
    // 第一次：一顆小飯糰，一手舉
    ...s0.moves,
    ...f0.moves,
    ...putDown(D0, 0, 'smug'),
    { at: f0.pop + 0.15, actor: 'sq', do: 'hop', amount: 2, dur: 0.25 },
    // 第二次：兩手舉，搖搖晃晃
    ...s1.moves,
    ...f1.moves,
    { at: f1.pop + 0.4, actor: 'ball', do: 'tilt', amount: 8, dur: 0.3 },
    { at: f1.pop + 0.4, actor: 'boy', do: 'tilt', amount: 5, dur: 0.3 },
    ...putDown(D1, 1, 'tired'),
    { at: f1.pop + 0.15, actor: 'sq', do: 'hop', amount: 3, dur: 0.3 },
    { at: f1.pop + 0.45, actor: 'sq', do: 'tilt', amount: -10, dur: 0.4 },
    // 停一拍：轉身看碗——快見底了
    { at: LOOK, actor: 'boy', do: 'flip' },
    { at: LOOK, actor: 'boy', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: LOOK, actor: 'bowl', do: 'swap', emoji: 'prop:rice', half: 'bottom', cut: 0.56 },
    { at: LOOK + 0.1, actor: 'boy', do: 'tilt', amount: 8, dur: 0.4 },
    { at: LOOK + 0.35, actor: 'boy', do: 'flip' }, // 看看飯糰
    { at: LOOK + 0.6, actor: 'boy', do: 'flip' }, // 再看看碗：好，整碗！
    { at: LOOK + 0.6, actor: 'boy', do: 'swap', emoji: 'hero:yang/know' },
    { at: LOOK + 0.6, actor: 'boy', do: 'hop', amount: 2.5, dur: 0.25 },
    { at: LOOK + 0.4, actor: 'sq', do: 'shake', amount: 0.8, dur: 0.5 },
    // 整碗端起來，轉回來倒上去
    { at: GRAB - 0.12, actor: 'boy', do: 'swap', emoji: 'hero:yang/reach' },
    { at: GRAB, actor: 'boy', do: 'flip' },
    { at: GRAB, actor: 'boy', do: 'swap', emoji: 'hero:yang/lift' },
    { at: GRAB, actor: 'bowl', do: 'moveTo', to: { x: BX, y: 46.5 - 1 - 0.42 * RS + 4 }, arc: 5, dur: 0.22, ease: 'out' },
    { at: GRAB + 0.25, actor: 'boy', do: 'moveTo', to: { x: BX - 7, y: BY }, dur: 0.2 },
    { at: GRAB + 0.25, actor: 'bowl', do: 'moveTo', to: { x: gx(SZ[2]) + 4, y: topOf(SZ[2]) - 8 }, dur: 0.2 },
    { at: POUR, actor: 'bowl', do: 'rotateTo', amount: -130, dur: 0.2, ease: 'out' },
    { at: POUR + 0.05, actor: 'bowl', do: 'shake', amount: 1, dur: 0.25 },
    { at: POUR + 0.1, actor: 'ball', do: 'squash', amount: 0.3, dur: 0.25 },
    // 空碗往後一丟，倒扣在帳篷那邊
    { at: TOSS, actor: 'boy', do: 'swap', emoji: 'hero:yang/throw' },
    { at: TOSS, actor: 'bowl', do: 'moveTo', to: { x: 156, y: RY - 1 }, arc: 18, dur: 0.45, ease: 'inOut' },
    { at: TOSS, actor: 'bowl', do: 'rotateTo', amount: -50, dur: 0.45 },
    { at: TOSS + 0.05, actor: 'boy', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.15 },
    // 第三次：噗——比他整個人還大
    ...f2.moves,
    { at: P2 + 0.05, actor: 'sq', do: 'hop', amount: 4, dur: 0.3 },
    // 舉不住：左搖右晃
    { at: P2 + 0.4, actor: 'boy', do: 'shake', amount: 1.2, dur: FALL - P2 - 0.4 },
    { at: P2 + 0.3, actor: 'ball', do: 'tilt', amount: -8, dur: 0.18 },
    { at: P2 + 0.48, actor: 'ball', do: 'tilt', amount: 10, dur: 0.17 },
    // 咚！往後倒，把他壓扁在底下，只露出頭
    // 先往後倒（還在頭上方），再整顆落下來，不會從他臉上掃過去
    { at: FALL, actor: 'ball', do: 'moveTo', to: { x: BX + 16, y: ballY(LIFT.y) + 3 }, dur: 0.12, ease: 'in' },
    { at: FALL + 0.12, actor: 'ball', do: 'moveTo', to: { x: CRUSH, y: ballY(GROUND) }, dur: HIT - FALL - 0.12, ease: 'in' },
    { at: FALL, actor: 'boy', do: 'moveTo', to: { x: BX - 3, y: BY }, dur: 0.15 },
    { at: HIT - 0.05, actor: 'boy', do: 'swap', emoji: 'hero:yang/flat' },
    { at: HIT, actor: 'ball', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: HIT + 0.3, actor: 'boy', do: 'shake', amount: 0.5, dur: 0.4 },
    // 松鼠跳上大飯糰的肩膀
    { at: CLIMB - 0.15, actor: 'sq', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: CLIMB, actor: 'sq', do: 'moveTo', to: { x: CRUSH + 15, y: 60 - 1 - 0.42 * QS }, arc: 8, dur: 0.36, ease: 'out' },
    // 咬一小口，喀滋喀滋
    { at: BITE, actor: 'sq', do: 'tilt', amount: -18, dur: 0.2 },
    { at: BITE + 0.25, actor: 'sq', do: 'tilt', amount: -18, dur: 0.2 },
    { at: BITE + 0.3, actor: 'ball', do: 'shake', amount: 0.6, dur: BURST - BITE - 0.3 },
    // 嘩！散成一堆小飯糰
    { at: BURST, actor: 'ball', do: 'vanish', dur: 0.12 },
    { at: BURST, actor: 'sq', do: 'moveTo', to: SQEND, arc: 6, dur: 0.4, ease: 'in' },
        ...PILE.flatMap((r, i): Move[] => [
      { at: BURST, actor: r.id, do: 'moveTo', to: { x: CRUSH - 8 + 3 * i, y: 52 }, dur: 0.01 },
      { at: BURST + 0.01, actor: r.id, do: 'pop', dur: 0.12 },
      { at: BURST + 0.03, actor: r.id, do: 'moveTo', to: r.to, arc: r.arc, dur: 0.4 + 0.03 * i, ease: 'inOut' },
      { at: BURST + 0.03, actor: r.id, do: 'spin', times: i % 2 ? 1 : -1, dur: 0.4 + 0.03 * i },
    ]),
    // 他彈起來，舉起拳頭——一顆剛好落在拳頭上
    { at: BURST + 0.1, actor: 'boy', do: 'swap', emoji: 'hero:yang/know' },
    { at: BURST + 0.1, actor: 'boy', do: 'hop', amount: 4, dur: 0.35 },
    { at: BURST + 0.1, actor: 'boy', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.3 },
    { at: POSE, actor: 'r1', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: POSE, actor: 'boy', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: POSE + 0.35, actor: 'boy', do: 'hop', amount: 3, dur: 0.3 },
    { at: POSE + 0.35, actor: 'r1', do: 'hop', amount: 3, dur: 0.3 },
    { at: POSE + 0.3, actor: 'sq', do: 'hop', amount: 2.5, dur: 0.3 },
    { at: POSE + 0.3, actor: 'r2', do: 'hop', amount: 2.5, dur: 0.3 },
  ],
  fx: [
    ...s0.fx, ...f0.fx,
    ...s1.fx, ...f1.fx,
    // 停一拍：松鼠冒汗
    { at: LOOK + 0.4, kind: 'sweat', actor: 'sq', dur: 0.6 },
    // 整碗倒上去：飯團團落下
    { at: POUR + 0.05, kind: 'burst', x: gx(SZ[2]), y: topOf(SZ[2]) - 2, emoji: 'prop:snowball', n: 7, dur: 0.5, scale: 0.9 },
    { at: POUR + 0.1, kind: 'puff', x: gx(SZ[2]), y: topOf(SZ[2]) + 4, n: 8, dur: 0.5 },
    ...f2.fx,
    { at: P2 + 0.35, kind: 'sweat', actor: 'boy', dur: 0.5 },
    // 咚
    { at: HIT, kind: 'burst', x: CRUSH - 12, y: 50, n: 1, dur: 0.35, scale: 1.4 },
    { at: HIT, kind: 'puff', x: CRUSH, y: 76, n: 10, dur: 0.6 },
    // 咬一小口：飯粒噴出來
    { at: BITE + 0.05, kind: 'burst', x: CRUSH + 9, y: 54, emoji: 'prop:snowball', n: 4, dur: 0.4, scale: 0.5 },
    // 嘩
    { at: BURST, kind: 'puff', x: CRUSH, y: 66, n: 12, dur: 0.6 },
    { at: BURST, kind: 'fountain', x: CRUSH, y: 60, emoji: '🍙', n: 8, dur: 0.8 },
    // 亮相
    { at: POSE, kind: 'burst', x: BX + 18, y: 32, emoji: '✨', n: 10, dur: 1.0, scale: 1.4 },
    { at: POSE + 0.25, kind: 'burst', x: BX + 20, y: 28, emoji: '🎉', n: 8, dur: 1.0, scale: 1.3 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.35, to: look(86, 50, 1.35) },
    ...f0.camera,
    ...f1.camera,
    // 停一拍：推近看碗和他
    { at: LOOK, dur: 0.5, do: 'zoom', amount: 1.6, to: look(94, 55, 1.6) },
    { at: GRAB, dur: 0.4, do: 'zoom', amount: 1.3, to: look(78, 48, 1.3) },
    // 第三次：拉開，飯糰比他還大
    { at: P2 - 0.15, dur: 0.35, do: 'zoom', amount: 1.1, to: look(84, 42, 1.1) },
    ...f2.camera,
    { at: HIT, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: HIT + 0.1, dur: 0.5, do: 'zoom', amount: 1.3, to: look(94, 52, 1.3) },
    { at: BURST, dur: 0.4, do: 'shake', amount: 1.2 },
    // 亮相
    { at: BURST + 0.2, dur: 0.5, do: 'zoom', amount: 1.45, to: look(92, 50, 1.45) },
  ],
  lights: [
    { at: HIT, dur: 0.05, level: -0.25 },
    { at: HIT + 0.05, dur: 0.35, level: 0 },
    { at: BURST, dur: 0.05, level: -0.25 },
    { at: BURST + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.25, sfx: 'boing' },
    ...s0.cues, ...f0.cues,
    ...s1.cues, ...f1.cues,
    { at: LOOK + 0.1, sfx: 'blip' },
    { at: LOOK + 0.6, sfx: 'blip' },
    { at: GRAB, sfx: 'whoosh' },
    { at: POUR, sfx: 'slide' },
    { at: POUR + 0.1, sfx: 'plop' },
    { at: TOSS + 0.4, sfx: 'clink' },
    ...f2.cues,
    { at: FALL, sfx: 'whoosh' },
    { at: HIT, sfx: 'bonk' },
    { at: CLIMB, sfx: 'boing' },
    { at: BITE, sfx: 'gulp' },
    { at: BITE + 0.3, sfx: 'crack' },
    { at: BURST, sfx: 'splash' },
    { at: POSE, sfx: 'cheer' },
    { at: POSE, say: '飯糰男孩' },
  ],
})
