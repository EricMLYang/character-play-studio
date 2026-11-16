import { easeBy } from '../clip'
import type { Camera, Clip, Cue, Ease, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 枝（v2）：大樹的樹幹上橫著長出一根長長的樹枝，像一塊跳板。東西每次停到樹枝尖端，樹枝就被壓得往下彎、抖一抖（吱——），
// 停一下，「咚——」地彈回來，把上面的東西彈上天，一次比一次重、彎得一次比一次深、彈得一次比一次高：
// 小鳥停上去，彎一點點、彈一下（樹枝甩出木）→ 貓跳上去，彎很多，彈得老高（被彈起來的貓甩出十）→
// 先停一拍：楊捷睿走過去看看樹枝、托著下巴想、冒汗、伸手……跳上去站在尖端！樹枝彎到快碰到地、吱吱作響，他傻眼——
// 「咚——」把他彈出畫面（他揮著的手甩出又）。國字拼好放大時，他還在天上，大樹連樹枝縮到左下角讓位。
// 語詞：國字讓回右上，他從天上掉回來、跌坐，樹枝輕輕彈一下，他跳起來指著它：「樹枝」。
// 回馬槍（第四次）：他還要再玩！閉眼得意、又跳上去，樹枝一樣彎下去，他抱頭蹲好等著被彈——樹枝一直彎、一直吱吱叫，
// 「啪！」斷了：整根樹枝連他一起掉到地上，樹幹上只剩一小截，他坐在斷掉的樹枝上傻眼。
// 最後畫面暗下來只剩「枝」，他問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「枝！」，然後退場只留字。
// 刻意不跟「樹」（整棵樹當彈弓把大家彈上天）、「肩」（東西停上肩膀、被最後一隻壓垮）、「肚」（肚子彈開東西）、
// 「鹿」（鹿角掛東西）、「猴」「燕」「葉」「根」撞：這支的主角是「一根樹枝」，只演「停上去 → 壓彎 → 咚地彈回來」，回馬槍是斷掉。
// 枝、枝、樹枝、這是什麼字？、枝

type V = Vec

/** 楊捷睿（size 34）：平常站在右邊、字框底下，面向左邊的樹枝（圖本來就朝左，不用 flip） */
const YS = 34
const YP = 77 - 0.42 * YS
const YX = 142
/** 大樹（prop:tree）：靠在畫面左邊、只露出右半截樹幹和樹冠的右下角 */
const TX = 4
const TS = 96
const TY = 77 - 0.42 * TS
const FEET = 77
/** 字框一開始就在右上（素色的天空，樹冠在左上，不壓在任何東西上） */
const FRAME = { x: 136, y: 20.5 }
const FRAME_K = 0.45

/** 樹枝：從樹幹（X0, Y0）橫著伸到右邊，長 L，尖端稍微往上翹 */
const X0 = 11
const Y0 = 53
const L = 99
/** 樹枝上的節點（0 是長在樹幹上的根部，1 是尖端）；相鄰兩點之間是一根 tube */
const S = [0, 0.22, 0.45, 0.68, 0.9, 1]
/** 每一段的粗細：根部粗、尖端細 */
const W = [0, 6.2, 5.3, 4.5, 3.7, 3.1]
const BARK = '#8A5A2E'
/** 東西停在樹枝上的地方（第 4 個節點） */
const SEAT = 4
/** 尖端的一小把葉子（🌿 的莖在圖的左下角，接在尖端上） */
const LS = 16
const LEAF_OFF = { x: 0.28 * LS, y: -0.4 * LS }

/** 懸臂樑的彎法：越靠尖端彎得越多 */
const bendF = (s: number) => (s * s * (3 - s)) / 2
/** 以大樹的腳底為中心縮放 k 倍（字放大時整棵樹連樹枝縮到左下角） */
const onTree = (p: V, k: number): V => ({ x: TX + (p.x - TX) * k, y: FEET + (p.y - FEET) * k })

type Pose = { pts: V[]; leaf: V; ang: number; k: number }
/** 尖端被壓下去 D（負的是往上翹）、整棵縮成 k 倍時，樹枝的樣子 */
function pose(D: number, k = 1): Pose {
  const pts = S.map((s) => onTree({ x: X0 + L * s - 0.08 * D * bendF(s), y: Y0 - 4 * s + D * bendF(s) }, k))
  // 尖端的斜率 → 葉子跟著轉
  const ang = Math.atan2(-4 + 1.5 * D, L)
  const c = Math.cos(ang), sn = Math.sin(ang)
  const tip = pts[5]
  const leaf = { x: tip.x + (LEAF_OFF.x * c - LEAF_OFF.y * sn) * k, y: tip.y + (LEAF_OFF.x * sn + LEAF_OFF.y * c) * k }
  return { pts, leaf, ang: (ang * 180) / Math.PI, k }
}
/** 斷掉以後：整根（b1～b5）躺在地上，根部那頭 b0 留在樹幹上 */
function fallen(): Pose {
  const pts = S.map((s, i) => (i === 0 ? { x: X0, y: Y0 } : { x: X0 + 4 + L * s * 0.97, y: 71.6 - 0.5 * s }))
  const tip = pts[5]
  return { pts, leaf: { x: tip.x + LEAF_OFF.x, y: tip.y + LEAF_OFF.y + 0.5 }, ang: 0, k: 1 }
}
/** 站在樹枝上的東西（腳底踩在樹枝上面） */
const seatOf = (p: Pose, size: number): V => ({ x: p.pts[SEAT].x - 1, y: p.pts[SEAT].y - 0.9 - 0.4 * size })

/**
 * 樹枝現在的樣子（moves 依時間順序產生，go() 會接著上一次的結果）。
 * 樹枝本身是 tube 效果，掛在一個看不見的錨點 rb（在 0,0）上：每一次 go() 記下一段變形，
 * 最後照時間每 1/30 秒切一片，算出那一片的形狀（用跟引擎一樣的 ease），葉子、站在上面的東西照常用 moveTo 跟著走。
 */
let cur = pose(0)
type Tween = { at: number; dur: number; from: Pose; to: Pose; ease: Ease }
const tweens: Tween[] = []
/** 尖端抖一抖：跟引擎的 shake 同一個公式（左右晃、越來越小），越靠尖端晃越多 */
const quivers: { at: number; dur: number; amt: number }[] = []
function go(at: number, dur: number, next: Pose, ease: Ease = 'inOut', rider?: { id: string; size: number }): Move[] {
  tweens.push({ at, dur, from: cur, to: next, ease })
  const out: Move[] = [{ at, dur, actor: 'leaf', do: 'moveTo', to: next.leaf, ease }]
  if (Math.abs(next.ang - cur.ang) > 0.05) out.push({ at, dur, actor: 'leaf', do: 'rotateTo', amount: next.ang - cur.ang, ease })
  if (Math.abs(next.k - cur.k) > 0.001) out.push({ at, dur, actor: 'leaf', do: 'scaleTo', amount: next.k / cur.k, ease })
  if (rider) out.push({ at, dur, actor: rider.id, do: 'moveTo', to: seatOf(next, rider.size), ease })
  cur = next
  return out
}
/** 尖端抖一抖（被壓著、吱吱叫）：靠尖端的節點、葉子、上面的東西一起抖 */
function quiver(at: number, dur: number, amount: number, rider?: string): Move[] {
  quivers.push({ at, dur, amt: amount })
  return ['leaf', ...(rider ? [rider] : [])].map((id): Move => ({ at, dur, actor: id, do: 'shake', amount }))
}

/** t 時樹枝的節點位置 */
function shapeAt(t: number): V[] {
  let pts = pose(0).pts
  for (const w of tweens) {
    if (t < w.at) break
    const p = w.dur > 0 ? Math.min(1, (t - w.at) / w.dur) : 1
    const e = easeBy(w.ease)(p)
    pts = w.from.pts.map((a, i) => ({ x: a.x + (w.to.pts[i].x - a.x) * e, y: a.y + (w.to.pts[i].y - a.y) * e }))
  }
  for (const q of quivers) {
    if (t < q.at || t > q.at + q.dur) continue
    const p = (t - q.at) / q.dur
    const dx = q.amt * Math.sin(p * Math.PI * 12) * (1 - p)
    pts = pts.map((a, i) => ({ x: a.x + dx * bendF(S[i]), y: a.y }))
  }
  return pts
}
/** 這一刻樹枝在不在動（在動就每 1/30 秒切一片） */
const moving = (t: number) => tweens.some((w) => t >= w.at && t < w.at + w.dur) || quivers.some((q) => t >= q.at && t < q.at + q.dur)
/** 下一次開始動的時間 */
const nextStart = (t: number) => Math.min(...[...tweens.map((w) => w.at), ...quivers.map((q) => q.at)].filter((a) => a > t + 1e-6), Infinity)

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 三次停上去的東西：一次比一次重（大）、壓得一次比一次深、停得一次比一次久 */
const RIDERS = [
  { id: 'pet', size: 17, D: 7, hold: 0.5 },
  { id: 'pet', size: 25, D: 13, hold: 0.55 },
  { id: 'yang', size: YS, D: 20, hold: 0.75 },
] as const

/**
 * 同一個笑點：第 k 個東西在 L 那一刻停到樹枝尖端 → 樹枝被壓得往下彎（吱——）、尖端抖 →
 * 停一下 → 「咚——」彈回來（先往上甩過頭，再像橡皮筋晃到停），把上面的東西彈上天。
 * 回傳彈出去那一刻 F；彈上天的路線由各自的段落寫（小鳥、貓飛出畫面，他飛出去晚點再掉回來）。
 */
function spring(L0: number, k: number): Gag & { F: number } {
  const r = RIDERS[k]
  const F = L0 + r.hold
  const tip = pose(r.D)
  const moves: Move[] = [
    // 壓下去
    ...go(L0, 0.25, tip, 'out', r),
    ...quiver(L0 + 0.25, r.hold - 0.27, 0.25 + 0.2 * k, r.id),
    // 咚——彈回來：先往上甩過頭，再晃到停
    ...go(F, 0.12, pose(-0.45 * r.D), 'out'),
    ...go(F + 0.12, 0.5, pose(0), 'elastic'),
  ]
  const seat = seatOf(tip, 0)
  const fx: Fx[] = [
    // 彈回來那一下：尖端冒 💥、葉子噴出來，一次比一次大
    { at: F, kind: 'burst', x: seat.x - 2, y: seat.y + 3, n: 1, dur: 0.35, scale: 0.9 + 0.3 * k },
    { at: F, kind: 'burst', x: cur.leaf.x, y: cur.leaf.y - 6, emoji: '🍃', n: 5 + 2 * k, dur: 0.45, scale: 1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: F, dur: 0.35, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: seat.x, y: 45 } },
    { at: F, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  const lights: Light[] = [{ at: F, dur: 0.04, level: -0.12 - 0.05 * k }, { at: F + 0.04, dur: 0.2, level: 0 }]
  // 同一個音效：停上去「噗」、壓彎「吱」、彈回來「咚——」，一次比一次多疊一個
  const cues: Cue[] = [{ at: L0, sfx: 'plop' }, { at: L0 + 0.2, sfx: 'slide' }, { at: F, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: L0 + 0.45, sfx: 'slide' }, { at: F + 0.04, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: L0 + 0.65, sfx: 'slide' }, { at: F + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues, lights, F }
}

// ── 時間表 ──
const L1 = 1.7
const L2 = 3.6
const L3 = 6.0
/** 國字拼好、放大到正中央；大樹連樹枝縮到左下角 */
const HOME = 7.35
const SMALL = 0.34
/** 讓位、他從天上掉回來、語詞 */
const PARK = 8.2
const BACK = 8.65
const WORD = 9.1
/** 回馬槍：再跳上去 → 一直彎 → 啪！ */
const SMUG = 9.45
const L4 = 10.0
const SNAP = 10.55
const GONE = 10.95
const ASK = 11.2
const ANSWER = 13.72
/** 問他：國字到左邊，他站右前方 */
const AX = 126
const ASK_S = 1.35

// 依時間順序產生（go() 接著上一次的樹枝樣子）
const g1 = spring(L1, 0)
const g2 = spring(L2, 1)
const g3 = spring(L3, 2)
const all = [g1, g2, g3]
const F1 = g1.F, F2 = g2.F, F3 = g3.F
/** 字放大：樹連樹枝縮到左下角 */
const shrinkMoves: Move[] = [
  ...go(F3 + 0.42, 0.3, pose(0, SMALL), 'out'),
  { at: F3 + 0.42, dur: 0.3, actor: 'tree', do: 'scaleTo', amount: SMALL, ease: 'out' },
]
/** 讓位：長回來 */
const parkMoves: Move[] = [
  ...go(PARK + 0.3, 0.35, pose(0), 'out'),
  { at: PARK + 0.3, dur: 0.35, actor: 'tree', do: 'scaleTo', amount: 1 / SMALL, ease: 'out' },
]
/** 他從天上掉下來擦過葉子；語詞那一刻樹枝輕輕彈一下 */
const wordMoves: Move[] = [
  ...go(WORD, 0.15, pose(4), 'out'),
  ...go(WORD + 0.15, 0.45, pose(0), 'elastic'),
]
/** 回馬槍：一樣彎下去，再一直彎、一直吱吱叫 → 啪！整根掉到地上 */
const Y4 = { id: 'yang', size: YS }
const snapMoves: Move[] = [
  ...go(L4, 0.25, pose(20), 'out', Y4),
  ...quiver(L4 + 0.25, SNAP - L4 - 0.27, 0.5, 'yang'),
  ...go(L4 + 0.3, SNAP - L4 - 0.3, pose(24), 'in', Y4),
  ...go(SNAP, 0.18, fallen(), 'in'),
]
const FALL_SEAT = seatOf(fallen(), YS)
/** 斷掉的那一截：問他之前縮成一點（跟樹一起退場） */
const MID = { x: 60, y: 72 }
const goneMoves: Move[] = [
  ...go(GONE, 0.25, { pts: [cur.pts[0], MID, MID, MID, MID, MID], leaf: MID, ang: cur.ang, k: 1 }, 'in'),
  { at: GONE, dur: 0.25, actor: 'leaf', do: 'scaleTo', amount: 0.05, ease: 'in' },
  { at: GONE + 0.25, dur: 0.02, actor: 'leaf', do: 'vanish' },
  { at: GONE, dur: 0.25, actor: 'tree', do: 'scaleTo', amount: 0.02, ease: 'in' },
  { at: GONE + 0.25, dur: 0.02, actor: 'tree', do: 'vanish' },
]

/** 樹枝的每一段（tube）：照時間切片畫到 end；斷掉之後第一段（接樹幹那段）不見了，樹幹上留一小截 */
const BRANCH_END = GONE + 0.25
const branchFx: Fx[] = []
for (let t = 0; t < BRANCH_END - 1e-6; ) {
  const d = moving(t) ? 1 / 30 : Math.min(nextStart(t), BRANCH_END) - t
  const pts = shapeAt(t)
  for (let j = 1; j < S.length; j++) {
    if (j === 1 && t >= SNAP - 1e-6) continue
    branchFx.push({ at: t, dur: d, kind: 'tube', actor: 'rb', dx: pts[j].x, dy: pts[j].y, to: pts[j - 1], color: BARK, width: W[j], n: 99 })
  }
  t += d
}
branchFx.push({ at: SNAP, dur: BRANCH_END - SNAP, kind: 'tube', actor: 'rb', dx: X0, dy: Y0, to: { x: X0 + 6, y: Y0 - 0.3 }, color: BARK, width: W[1], n: 99 })

/** 第 1、2 次彈上天：從尖端往左上飛出畫面（看得到一段），一路翻滾 */
const BIRD_UP: V = { x: 66, y: -28 }
const CAT_UP: V = { x: 54, y: -40 }
const s1 = seatOf(pose(0), RIDERS[0].size)
const s2 = seatOf(pose(0), RIDERS[1].size)
const s3 = seatOf(pose(0), YS)
const BIRD_K = RIDERS[0].size / RIDERS[1].size
/** 貓一開始躲在樹冠裡（樹冠的右下角） */
const CAT_CROWN: V = { x: 36, y: 34 }

const clip: Clip = {
  format: 2,
  char: '枝',
  meta: { theme: '大樹上橫著長出來的一根樹枝當跳板', cast: '楊捷睿＋小鳥＋貓＋大樹（樹枝）', gags: ['東西每次停到樹枝尖端，樹枝就被壓得往下彎、吱吱叫，停一下「咚——」地彈回來把上面的東西彈上天，一次比一次重、彎得一次比一次深（小鳥彎一點彈一下、貓彎很多彈得老高、先停一拍：楊捷睿自己跳上去，彎到快碰地，被彈出畫面）；回馬槍是他還要再玩，又跳上去抱頭等著被彈，樹枝一直彎、一直吱吱叫——「啪！」斷了，整根連他一起掉到地上'] },
  duration: 15,
  bg: { top: '#CDE8FF', bottom: '#F3FAEA', floor: '#A9D07E', scenery: 'forest' },
  actors: [
    // 看不見的錨點（0,0）：樹枝的每一段 tube 掛在這上面，dx／dy 就是舞台座標
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 2, hidden: true, float: true },
    { id: 'tree', emoji: 'prop:tree', x: TX, y: TY, size: TS },
    { id: 'leaf', emoji: '🌿', x: pose(0).leaf.x, y: pose(0).leaf.y, size: LS, float: true, pivot: 'center' },
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: YP, size: YS, hidden: true },
    // 小鳥和貓是同一個角色換圖（底子是比較大的貓；小鳥那段縮成 BIRD_K 倍）
    { id: 'pet', emoji: '🐦', x: s1.x, y: s1.y, size: RIDERS[1].size, hidden: true, float: true },
  ],
  moves: [
    // 開場：他走進來，抬頭指著右上的字框：枝！
    { at: 0, dur: 0.5, actor: 'yang', do: 'enter', from: { x: 185, y: YP }, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 1.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 1 次：小鳥從天上飛下來停在尖端
    { at: L1 - 0.6, dur: 0.6, actor: 'pet', do: 'enter', from: { x: 84, y: -14 }, ease: 'out' },
    { at: L1 - 0.59, dur: 0.01, actor: 'pet', do: 'scaleTo', amount: BIRD_K },
    ...g1.moves,
    { at: F1 + 0.03, dur: 0.85, actor: 'pet', do: 'moveTo', to: BIRD_UP, ease: 'linear' },
    { at: F1 + 0.03, dur: 0.85, actor: 'pet', do: 'spin', times: 2, pivot: 'center' },
    { at: F1 + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: F1 + 0.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 2 次：貓從右邊走進來、蹲低、跳上尖端
    // 小鳥飛出畫面以後，換成貓：從樹冠裡探出來、蹲低、跳上尖端
    { at: L2 - 0.62, dur: 0.01, actor: 'pet', do: 'vanish' },
    { at: L2 - 0.61, actor: 'pet', do: 'swap', emoji: '🐈' },
    { at: L2 - 0.61, dur: 0.01, actor: 'pet', do: 'moveTo', to: CAT_CROWN },
    { at: L2 - 0.6, dur: 0.25, actor: 'pet', do: 'pop' },
    { at: L2 - 0.59, dur: 0.01, actor: 'pet', do: 'scaleTo', amount: 1 / BIRD_K },
    { at: L2 - 0.4, dur: 0.12, actor: 'pet', do: 'squash', amount: 0.25 },
    { at: L2 - 0.3, dur: 0.3, actor: 'pet', do: 'moveTo', to: s2, arc: 8, ease: 'out' },
    ...g2.moves,
    { at: F2 + 0.03, dur: 0.8, actor: 'pet', do: 'moveTo', to: CAT_UP, ease: 'linear' },
    { at: F2 + 0.03, dur: 0.8, actor: 'pet', do: 'spin', times: 2, pivot: 'center' },
    { at: F2 + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: F2 + 0.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    // 第 3 次前停一拍：他走過去、看看樹枝、托著下巴想、冒汗……伸手、跳上去
    { at: F2 + 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: F2 + 0.75, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: 122, y: YP } },
    { at: F2 + 1.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: L3 - 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: L3 - 0.32, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: L3 - 0.3, dur: 0.3, actor: 'yang', do: 'moveTo', to: s3, arc: 5, ease: 'out' },
    { at: L3, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: L3 + 0.28, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...g3.moves,
    // 咚——他被彈出畫面（揮著的手甩出又）
    { at: F3 + 0.03, dur: 0.7, actor: 'yang', do: 'moveTo', to: { x: 84, y: -48 }, ease: 'linear' },
    { at: F3 + 0.03, dur: 0.7, actor: 'yang', do: 'spin', times: 1, pivot: 'center' },
    ...shrinkMoves,
    // 讓位：樹長回來；他從天上掉回來（從左上斜斜掉下來，不經過字框），一屁股跌坐
    ...parkMoves,
    { at: BACK, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: BACK, dur: 0.01, actor: 'yang', do: 'moveTo', to: { x: 70, y: -45 } },
    { at: BACK + 0.01, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: 122, y: YP }, ease: 'in' },
    { at: BACK + 0.31, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    // 語詞：跳起來指著樹枝
    { at: WORD, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: WORD, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    ...wordMoves,
    // 回馬槍（第 4 次）：還要再玩！閉眼得意 → 跳上去 → 抱頭蹲好等著被彈
    { at: SMUG, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: L4 - 0.32, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: L4 - 0.3, dur: 0.3, actor: 'yang', do: 'moveTo', to: s3, arc: 5, ease: 'out' },
    { at: L4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: L4 + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    ...snapMoves,
    // 啪！連他一起掉到地上，坐在斷掉的樹枝上，回頭看樹幹上那一小截：傻眼
    { at: SNAP, dur: 0.18, actor: 'yang', do: 'moveTo', to: { x: FALL_SEAT.x - 6, y: YP }, ease: 'in' },
    { at: SNAP + 0.18, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: SNAP + 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...goneMoves,
    // 問他：走到右前方、放大，面向國字
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: AX, y: YP } },
    { at: ASK + 0.05, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.75, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.25, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.25, actor: 'yang', do: 'hop', amount: 6 },
    // 退場（往右跑出去），畫面只留下字
    { at: ANSWER + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.1, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.1, dur: 0.16, actor: 'yang', do: 'moveTo', to: { x: 215, y: YP }, ease: 'in' },
  ],
  builds: [
    // 每彈一次就甩出一組：小鳥那次樹枝甩出木、貓那次被彈起來的貓甩出十、他那次揮著的手甩出又
    { at: F1 + 0.1, dur: 0.5, strokes: [0, 1, 2, 3], from: { x: s1.x, y: s1.y + 6 }, color: partColor('木') },
    { at: F2 + 0.12, dur: 0.5, strokes: [4, 5], from: 'pet', color: partColor('十') },
    { at: F3 + 0.08, dur: 0.45, strokes: [6, 7], from: 'yang', color: partColor('又') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.28 - ASK, do: 'ask', keep: ['yang'], to: { x: 60, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...branchFx,
    ...all.flatMap((g) => g.fx),
    // 第 3 次前停一拍：冒汗
    { at: F2 + 1.3, kind: 'sweat', actor: 'yang', dx: -5 },
    // 他掉回來跌坐：頭暈
    { at: BACK + 0.32, kind: 'dizzy', actor: 'yang', dy: 4, dur: 0.6 },
    // 語詞：樹枝亮晶晶
    { at: WORD, kind: 'burst', x: X0 + L * 0.6, y: Y0 - 6, emoji: '✨', n: 9, dur: 0.55, scale: 1.4 },
    // 回馬槍：一直彎、冒汗……啪！
    { at: L4 + 0.35, kind: 'sweat', actor: 'yang', dx: -6 },
    { at: SNAP, kind: 'burst', x: X0 + 5, y: Y0 - 2, n: 1, dur: 0.45, scale: 1.8 },
    { at: SNAP + 0.18, kind: 'burst', x: X0 + L * 0.45, y: Y0 + 8, emoji: '🍃', n: 10, dur: 0.55, scale: 1.5 },
    { at: SNAP + 0.18, kind: 'puff', actor: 'yang', dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.28 },
  ],
  camera: [
    // 鏡頭鎖全景（樹幹、字框、彈上天都要在畫面裡），只有彈回來那一下推一點、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: BACK + 0.31, dur: 0.25, do: 'shake', amount: 1 },
    { at: SNAP, dur: 0.45, do: 'shake', amount: 2.4 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: SNAP, dur: 0.04, level: -0.3 },
    { at: SNAP + 0.04, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '枝' },
    { at: L1 - 0.5, sfx: 'whoosh' },
    ...all.flatMap((g) => g.cues),
    { at: F2 + 1.3, sfx: 'gulp' },
    { at: HOME + 0.1, say: '枝' },
    { at: BACK + 0.31, sfx: 'bonk' },
    { at: WORD, say: '樹枝' },
    { at: WORD + 0.05, sfx: 'boing' },
    { at: L4, sfx: 'plop' },
    { at: L4 + 0.25, sfx: 'slide' },
    { at: L4 + 0.5, sfx: 'slide' },
    { at: L4 + 0.75, sfx: 'slide' },
    { at: SNAP, sfx: 'crack' },
    { at: SNAP + 0.18, sfx: 'bonk' },
    { at: GONE, sfx: 'poof' },
    { at: ASK + 0.02, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '枝' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
