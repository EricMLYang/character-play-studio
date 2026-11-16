import { baseActorsAt } from '../clip'
import type { ActorState, Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 桌（v2）：忍者小老鼠表演「抽桌巾」的魔術。大木桌上鋪著紅白條紋的桌巾、上面擺著東西，他抓住垂下來的桌巾角，
// 「唰！」地一抽——桌巾飛走，東西要留在桌上才算成功。同一個動作做三次，桌上的東西一次比一次多、一次比一次高：
// 一個杯子：抽得漂亮，杯子只晃一下，他得意地鞠躬（⺊從杯子上彈出來）→ 一疊盤子加一壺茶：抽完搖搖晃晃才站穩，他擦汗（日從盤子上彈出來）→
// 先停一拍：桌上變出一座高高的杯塔，他抬頭看、吞口水、手發抖——還是抽了！整座塔晃到快倒，他抱頭蹲下……居然站住了（木從杯塔上彈出來）。
// 語詞那一刻他指著頂著杯塔的大桌子：「桌子」。
// 回馬槍（第四次）：桌上只剩一個小杯子，他閉著眼睛、單手隨便一抽——杯子真的一動也不動，因為被抽走的是整張桌子：
// 桌子連桌巾「咻」地從他頭上飛出畫面，杯子停在半空中一拍，才「啪」地掉下來摔碎。
// 最後畫面暗下來只剩「桌」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「桌！」，然後退場只留字。
// 刻意不跟「糕」（往塔頂丟蛋糕、越疊越晃）、「肩」「鹿」「枝」（東西越壓越重）、「椅」（翹椅子）撞：
// 這支只演「抽桌巾 → 東西留在桌上晃」，桌子是舞台，回馬槍是被抽走的變成桌子。
// 桌巾、杯子、盤子、茶壺都是畫在看不見的錨點上的 tube（照桌子現在的位置與大小算），角色只有三個。
// 桌、桌、桌子、這是什麼字？、桌

type V = Vec

// ---------- 站位 ----------
/** 大木桌（prop:table，斜上方看）：畫面正中間、整支最大的東西。不呼吸（float），桌巾才貼得住桌面 */
const TS = 56
const TX = 80
const TY = 77 - 0.42 * TS
/** 小老鼠（圖朝左，整支站在桌子右邊、面向桌子） */
const MS = 34
const MY = 77 - 0.42 * MS
const STAND = 120
/** 抽完往後退一步 */
const BACK = 127
/** 國字回中央放大時：桌子連上面的東西縮到左下角、他退到右邊 */
const SIDE_T: V = { x: 23, y: TY }
const SIDE_K = 0.52
const SIDE_M = 139
/** 國字讓位的地方（左上，背後是素色的天空；右上有太陽、中間是杯塔） */
const FRAME: V = { x: 27, y: 24 }
const FRAME_K = 0.48

// ---------- 時間表 ----------
const SAY1 = 0.55
/** 每一次：抓住桌巾角（reach）→ 蹲下蓄力 → 唰！抽 */
const Y1 = 1.45
const RESET2 = 2.45
const Y2 = 3.3
const RESET3 = 4.45
/** 第三次前停一拍：抬頭看杯塔、吞口水、手發抖 */
const PAUSE = 4.75
const Y3 = 5.75
/** 字框填滿、國字到正中央（桌子先縮到左下角讓位） */
const HOME = 7.4
const PARK = HOME + 0.8
/** 國字先讓回左上，桌子才回到正中間（杯塔不掃過國字） */
const BACK_IN = PARK + 0.25
const WORD_SAY = BACK_IN + 0.4
const RESET4 = 9.4
/** 第四次：單手隨便一抽，整張桌子飛走 */
const Y4 = 10.0
const DROP = 10.55
const SMASH = 10.72
/** 問他 */
const ASK = 11.05
const ASK_SAY = ASK + 0.05
const ANSWER = ASK_SAY + 2.5
const ASK_AT: V = { x: 122, y: MY + 2 }

// ---------- 桌子圖上的位置（512 格的圖座標，量過 public/props/table.png） ----------
/** 桌面四個角：左、後、右、前（桌巾比桌面大一點點） */
const TOP = { L: { x: 16, y: 152 }, B: { x: 262, y: 58 }, R: { x: 497, y: 135 }, F: { x: 285, y: 241 } }
/** 桌巾垂下來多長 */
const DRAPE = 84
/** 東西擺在桌面正中間 */
const SEAT = { x: 265, y: 150 }

const RED = '#E63946'
const WHITE = '#FFF6EE'
const CUP = '#5BC0EB'
const COFFEE = '#7A4A2A'
const PLATE = '#FFFFFF'
const POT = '#F4B942'

/** 桌子的狀態 → 圖座標換成舞台座標（以腳底為準的縮放，跟 AnimPlayer 畫的一樣） */
function onTable(st: ActorState, p: V): V {
  const k = st.size * st.s
  const cy = st.y + 0.42 * st.size * (1 - st.s)
  return { x: st.x + (p.x / 512 - 0.5) * k, y: cy + (p.y / 512 - 0.5) * k }
}
const lerpV = (a: V, b: V, k: number): V => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })

type Seg = { a: V; b: V; color: string; width: number }

/** 桌巾（舞台座標，桌子現在的樣子；dx 是被抽出去的距離） */
function clothSegs(st: ActorState, dx = 0): Seg[] {
  const k = (st.size * st.s) / 512
  const P = (p: V) => { const q = onTable(st, p); return { x: q.x + dx, y: q.y } }
  const segs: Seg[] = []
  const { L, B, R, F } = TOP
  // 垂下來的部分：沿著前面兩條邊一條一條直的，底下圓圓的就是桌巾的波浪邊
  const hang = (a: V, b: V, n: number, off: number) => {
    for (let j = 0; j < n; j++) {
      const top = lerpV(a, b, (j + 0.5) / n)
      const w = (Math.abs(b.x - a.x) / n) * k + 0.5
      segs.push({ a: P(top), b: P({ x: top.x, y: top.y + DRAPE }), color: (j + off) % 2 ? WHITE : RED, width: w })
    }
  }
  hang(L, F, 6, 0)
  hang(F, R, 5, 0)
  // 桌面：跟左前方那條邊平行的一條一條（後面先畫，前面的壓在上面），紅白相間
  const N = 6
  const dist = 155 * k
  for (let i = N - 1; i >= 0; i--) {
    const s = (i + 0.5) / N
    segs.push({ a: P(lerpV(L, B, s)), b: P(lerpV(F, R, s)), color: i % 2 ? WHITE : RED, width: dist / N + 0.45 })
  }
  // 四邊的紅色滾邊：蓋住條紋的圓頭，桌巾看起來是平平的一塊布
  const hem = 14 * k
  for (const [a, b] of [[L, B], [B, R], [F, R], [L, F]] as const) segs.push({ a: P(a), b: P(b), color: RED, width: hem })
  return segs
}

/** 抽出去在空中飛的桌巾：一面飄動的紅白條紋布 */
function flagSegs(c: V, phase: number, rot: number): Seg[] {
  const segs: Seg[] = []
  const r = (rot * Math.PI) / 180
  const R = (p: V): V => ({ x: c.x + p.x * Math.cos(r) - p.y * Math.sin(r), y: c.y + p.x * Math.sin(r) + p.y * Math.cos(r) })
  for (let j = 0; j < 4; j++) {
    const y = (j - 1.5) * 2.7
    segs.push({ a: R({ x: -8, y: y + Math.sin(phase + j) * 1.4 }), b: R({ x: 8, y: y + Math.sin(phase + j + 1.8) * 1.4 }), color: j % 2 ? WHITE : RED, width: 3.1 })
  }
  return segs
}

// ---------- 桌上的東西（以桌面正中間為原點、往上是負的；舞台單位，桌子原本大小） ----------
function cup(x: number, y: number): Seg[] {
  return [
    { a: { x: x + 3.1, y: y - 3.0 }, b: { x: x + 3.1, y: y - 4.4 }, color: CUP, width: 1.4 },
    { a: { x, y: y - 2.8 }, b: { x, y: y - 4.2 }, color: CUP, width: 4.6 },
    { a: { x: x - 1.5, y: y - 5.7 }, b: { x: x + 1.5, y: y - 5.7 }, color: COFFEE, width: 0.9 },
  ]
}
const CUP_H = 7
/** 放大幾倍：一個杯子放大一點才看得清楚；三組的高度 13 → 23 → 32 一次比一次高 */
const grow = (segs: Seg[], k: number): Seg[] => segs.map((g) => ({ a: { x: g.a.x * k, y: g.a.y * k }, b: { x: g.b.x * k, y: g.b.y * k }, color: g.color, width: g.width * k }))
const ONE_CUP: Seg[] = grow(cup(0, 0), 1.8)
/** 一疊盤子（五個）加一壺茶 */
const PLATES: Seg[] = (() => {
  const segs: Seg[] = []
  for (let i = 0; i < 5; i++) segs.push({ a: { x: -6.8, y: -0.9 - 1.75 * i }, b: { x: 6.8, y: -0.9 - 1.75 * i }, color: PLATE, width: 1.3 })
  const yb = -0.9 - 1.75 * 4 - 1.15
  segs.push(
    { a: { x: -5.0, y: yb - 3.4 }, b: { x: -8.6, y: yb - 7.4 }, color: POT, width: 1.7 },
    { a: { x: 5.6, y: yb - 5.8 }, b: { x: 6.8, y: yb - 2.6 }, color: POT, width: 1.5 },
    { a: { x: -2.6, y: yb - 3.6 }, b: { x: 2.6, y: yb - 3.6 }, color: POT, width: 6.6 },
    { a: { x: -1.9, y: yb - 7.7 }, b: { x: 1.9, y: yb - 7.7 }, color: POT, width: 1.5 },
    { a: { x: 0, y: yb - 9.2 }, b: { x: 0.01, y: yb - 9.2 }, color: POT, width: 1.9 },
  )
  return grow(segs, 1.2)
})()
/** 杯塔：四層（4、3、2、1 個） */
const TOWER: Seg[] = (() => {
  const segs: Seg[] = []
  for (let r = 0; r < 4; r++) {
    const n = 4 - r
    for (let i = 0; i < n; i++) segs.push(...cup((i - (n - 1) / 2) * 6.3, -CUP_H * r))
  }
  return grow(segs, 1.15)
})()

/** 晃：每一次抽完，那一疊以桌面為支點左右晃的角度（關鍵格：[秒, 度]，正的往右歪） */
const WOBBLES: { at: number; keys: [number, number][] }[] = [
  { at: Y1 + 0.04, keys: [[0, 0], [0.12, 4], [0.26, -3], [0.4, 1.5], [0.52, 0]] },
  { at: Y2 + 0.04, keys: [[0, 0], [0.13, 9], [0.3, -8], [0.47, 6.5], [0.64, -4.5], [0.8, 2.5], [0.95, 0]] },
  { at: Y3 + 0.04, keys: [[0, 0], [0.14, 13], [0.33, -14], [0.55, 21], [0.95, 24], [1.17, -9], [1.33, 5], [1.47, -2], [1.58, 0]] },
]
function leanAt(t: number): number {
  for (const w of WOBBLES) {
    const u = t - w.at
    const end = w.keys[w.keys.length - 1][0]
    if (u < 0 || u > end) continue
    for (let i = 1; i < w.keys.length; i++) {
      const [t0, a0] = w.keys[i - 1], [t1, a1] = w.keys[i]
      if (u <= t1) {
        const p = (u - t0) / (t1 - t0)
        return a0 + (a1 - a0) * (0.5 - 0.5 * Math.cos(Math.PI * p))
      }
    }
  }
  return 0
}

/** 那一刻桌上擺的是哪一組 */
const SHOW = 0.12
function itemsAt(t: number): Seg[] {
  if (t < RESET2 + SHOW) return ONE_CUP
  if (t < RESET3 + SHOW) return PLATES
  if (t < RESET4 + SHOW) return TOWER
  return ONE_CUP
}
/** 桌巾在不在桌上：每次抽完就不在，下一次變魔術才又出現 */
function clothOn(t: number): boolean {
  if (t < Y1) return true
  if (t < RESET2 + SHOW) return false
  if (t < Y2) return true
  if (t < RESET3 + SHOW) return false
  if (t < Y3) return true
  return t >= RESET4 + SHOW
}
/** 抽：桌巾 0.08 秒滑出去，然後從他手上往右上飛走 */
const SLIDE = 0.08
const FLY = 0.5

// ---------- 小老鼠 ----------
const mouse: Move[] = []
/**
 * 同一個動作：抓住桌巾角（reach）→ 蹲下蓄力（拉長）→ 唰！往後一抽（pull、退一步）。
 * 每一次都一樣：同一個站位、同一個姿勢、同一個「唰」，只有桌上的東西越來越高。
 */
function yank(at: number, k: number, grab = 0.5) {
  const moves: Move[] = [
    { at: at - grab, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: at - grab + 0.02, dur: 0.2, actor: 'mouse', do: 'moveTo', to: { x: STAND - 2, y: MY } },
    { at: at - 0.24, dur: 0.22, actor: 'mouse', do: 'squash', amount: 0.14 },
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/pull' },
    { at, dur: 0.16, actor: 'mouse', do: 'moveTo', to: { x: BACK, y: MY }, ease: 'out' },
  ]
  const fx: Fx[] = [
    // 唰：一道紅色的弧線（桌巾被抽出去的軌跡）
    { at: at - 0.02, kind: 'swoosh', actor: 'table', target: 'mouse', dx: 16, dy: 2, n: 14, sweep: 70, dur: 0.22, color: RED, width: 2.6, scale: 1 + 0.12 * k },
  ]
  const camera: Camera[] = [
    { at: at + 0.02, dur: 0.4, do: 'punch', amount: 0.06 + 0.04 * k, to: { x: TX, y: 40 } },
    { at: at + 0.02, dur: 0.3, do: 'shake', amount: 0.5 + 0.35 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'whoosh' }, { at: at + 0.02, sfx: 'slide' }]
  if (k >= 1) cues.push({ at: at + 0.18, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.6, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 變魔術：他舉手一揮，桌上「噗」地冒一團煙，桌巾跟下一組東西就擺好了 */
function magic(at: number): { moves: Move[]; fx: Fx[]; cues: Cue[] } {
  return {
    moves: [
      { at: at - 0.15, dur: 0.2, actor: 'mouse', do: 'moveTo', to: { x: STAND, y: MY } },
      { at: at - 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/know' },
      { at: at - 0.1, dur: 0.2, actor: 'mouse', do: 'hop', amount: 2 },
    ],
    fx: [
      { at, kind: 'burst', x: TX, y: 40, emoji: '☁️', n: 7, dur: 0.45, scale: 1.3 },
      { at: at + SHOW, kind: 'burst', x: TX, y: 34, emoji: '✨', n: 6, dur: 0.45 },
    ],
    cues: [{ at, sfx: 'poof' }],
  }
}

const y1 = yank(Y1, 0)
const y2 = yank(Y2, 1)
const y3 = yank(Y3, 2, 0.4)
const m2 = magic(RESET2)
const m3 = magic(RESET3)
const m4 = magic(RESET4)

mouse.push(
  // 開場：從右邊走進來，站好、擺架式：桌！
  { at: 0, dur: 0.45, actor: 'mouse', do: 'enter', from: { x: 185, y: MY }, ease: 'out' },
  { at: 0.47, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
  ...y1.moves,
  // 第 1 次：杯子只晃一下——閉眼得意，鞠躬
  { at: Y1 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
  { at: Y1 + 0.42, dur: 0.25, actor: 'mouse', do: 'hop', amount: 2 },
  { at: Y1 + 0.72, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/bow' },
  ...m2.moves,
  ...y2.moves,
  // 第 2 次：搖搖晃晃——傻眼看著，站穩了才擦汗
  { at: Y2 + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
  { at: Y2 + 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/tired' },
  ...m3.moves,
  // 停一拍：抬頭看看比他高的杯塔、吞口水、伸手發抖
  { at: PAUSE, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
  { at: PAUSE + 0.05, dur: 0.22, actor: 'mouse', do: 'hop', amount: 2.5 },
  { at: PAUSE + 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
  { at: PAUSE + 0.4, dur: 0.18, actor: 'mouse', do: 'squash', amount: 0.08 },
  ...y3.moves,
  { at: Y3 - 0.38, dur: 0.15, actor: 'mouse', do: 'shake', amount: 0.5 },
  // 第 3 次：整座塔晃到快倒——抱頭蹲下發抖……居然站住了，偷看一下、鬆一口氣
  { at: Y3 + 0.22, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/duck' },
  { at: Y3 + 0.3, dur: 1.0, actor: 'mouse', do: 'shake', amount: 0.6 },
  { at: Y3 + 1.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/peek' },
  { at: HOME - 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
  { at: HOME - 0.2, dur: 0.3, actor: 'mouse', do: 'moveTo', to: { x: SIDE_M, y: MY }, ease: 'out' },
  // 語詞：走回來，指著頂著杯塔的大桌子
  { at: BACK_IN, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
  { at: BACK_IN, dur: 0.4, actor: 'mouse', do: 'moveTo', to: { x: STAND, y: MY } },
  { at: WORD_SAY - 0.08, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
  { at: WORD_SAY - 0.08, dur: 0.3, actor: 'mouse', do: 'hop', amount: 3 },
  ...m4.moves,
  // 第 4 次：只剩一個小杯子——閉著眼睛、單手隨便一抽（沒有蹲、沒有蓄力）
  { at: RESET4 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
  { at: Y4 - 0.12, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
  { at: Y4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/pull' },
  // 整張桌子從他頭上飛過去，把他捲得轉一圈、一屁股坐下
  { at: Y4 + 0.12, dur: 0.3, actor: 'mouse', do: 'spin', times: -1, pivot: 'center' },
  { at: Y4 + 0.12, dur: 0.3, actor: 'mouse', do: 'moveTo', to: { x: 128, y: MY }, ease: 'out' },
  { at: Y4 + 0.42, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
  // 杯子停在半空中——傻眼
  { at: Y4 + 0.62, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
  { at: SMASH, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/duck' },
  { at: SMASH + 0.05, dur: 0.25, actor: 'mouse', do: 'shake', amount: 0.8 },
  // 問他：走到右前方、變大，面向左邊的國字
  { at: ASK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
  { at: ASK, dur: 0.35, actor: 'mouse', do: 'moveTo', to: ASK_AT, ease: 'out' },
  { at: ASK + 0.05, dur: 0.3, actor: 'mouse', do: 'scaleTo', amount: 1.2 },
  { at: ASK_SAY + 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
  { at: ASK_SAY + 1.0, dur: 0.3, actor: 'mouse', do: 'rotateTo', amount: -8 },
  { at: ASK_SAY + 1.55, dur: 0.3, actor: 'mouse', do: 'hop', amount: 1.5 },
  { at: ASK_SAY + 2.05, dur: 0.3, actor: 'mouse', do: 'hop', amount: 1.5 },
  // 回答：跳起來指著字
  { at: ANSWER, dur: 0.12, actor: 'mouse', do: 'rotateTo', amount: 8 },
  { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
  { at: ANSWER, dur: 0.3, actor: 'mouse', do: 'hop', amount: 7 },
  // 退場，畫面只留下字
  { at: ANSWER + 0.16, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
  { at: ANSWER + 0.16, actor: 'mouse', do: 'flip' },
  { at: ANSWER + 0.18, dur: 0.2, actor: 'mouse', do: 'moveTo', to: { x: 220, y: ASK_AT.y }, ease: 'in' },
)

// ---------- 桌子 ----------
const table: Move[] = [
  // 國字回中央：桌子連上面的杯塔縮到左下角讓位，國字讓回左上後再回到正中間
  { at: HOME - 0.25, dur: 0.35, actor: 'table', do: 'moveTo', to: SIDE_T },
  { at: HOME - 0.25, dur: 0.35, actor: 'table', do: 'scaleTo', amount: SIDE_K },
  { at: BACK_IN, dur: 0.4, actor: 'table', do: 'moveTo', to: { x: TX, y: TY } },
  { at: BACK_IN, dur: 0.4, actor: 'table', do: 'scaleTo', amount: 1 / SIDE_K },
  // 第 4 次：整張桌子被抽走，從他頭上飛出畫面右邊
  { at: Y4 + 0.03, dur: 0.45, actor: 'table', do: 'moveTo', to: { x: 215, y: TY - 6 }, arc: 16, ease: 'in' },
  { at: Y4 + 0.5, dur: 0.01, actor: 'table', do: 'vanish' },
]

const clip: Clip = {
  format: 2,
  char: '桌',
  meta: { theme: '抽桌巾魔術', cast: '小老鼠＋大木桌（桌巾、杯子、盤子、茶壺）', gags: ['小老鼠表演抽桌巾，抓住桌巾角「唰」地一抽，東西要留在桌上：一個杯子只晃一下他得意鞠躬→一疊盤子加茶壺搖搖晃晃才站穩他擦汗→先停一拍，高高的杯塔晃到快倒他抱頭蹲下，居然站住了；回馬槍是只剩一個小杯子，他閉眼單手隨便一抽，杯子真的沒動——被抽走的是整張桌子，杯子停在半空一拍才掉下來摔碎'] },
  duration: 15,
  bg: { top: '#DDF1FF', bottom: '#F6FBFF', floor: '#C9E3A4', scenery: 'hills' },
  actors: [
    // 看不見的錨點（0,0）：桌巾、杯子盤子的每一段 tube 掛在這上面，dx／dy 就是舞台座標
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 2, hidden: true, float: true },
    { id: 'mouse', emoji: 'hero:mouse/walk', x: STAND, y: MY, size: MS, hidden: true },
    { id: 'table', emoji: 'prop:table', x: TX, y: TY, size: TS, float: true },
  ],
  moves: [...mouse, ...table],
  builds: [] as Build[],
  glyph: [
    // 空字框一開始就讓到左上（中間是桌子跟越疊越高的東西）
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給他
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['mouse'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...y1.fx, ...y2.fx, ...y3.fx,
    ...m2.fx, ...m3.fx, ...m4.fx,
    // 第 1 次：漂亮！
    { at: Y1 + 0.55, kind: 'burst', x: TX, y: 30, emoji: '✨', n: 6, dur: 0.5 },
    // 第 2 次：擦汗
    { at: Y2 + 1.05, kind: 'sweat', actor: 'mouse', dx: -6 },
    // 停一拍：冒汗
    { at: PAUSE + 0.1, kind: 'pop', actor: 'mouse', emoji: '❗', dx: -12, dur: 0.4, scale: 1.3 },
    { at: PAUSE + 0.45, kind: 'sweat', actor: 'mouse', dx: -6 },
    // 第 3 次：居然站住了
    { at: Y3 + 1.65, kind: 'burst', x: TX + 1, y: 14, emoji: '✨', n: 7, dur: 0.5, scale: 1.1 },
    // 語詞：亮晶晶
    { at: WORD_SAY, kind: 'burst', x: TX, y: 34, emoji: '✨', n: 7, dur: 0.6, scale: 1.2 },
    // 第 4 次：杯子停在半空中
    { at: Y4 + 0.6, kind: 'pop', actor: 'mouse', emoji: '❓', dx: -12, dur: 0.5, scale: 1.4 },
    // 啪！摔碎
    { at: SMASH, kind: 'burst', x: TX + 1, y: 68, n: 1, dur: 0.45, scale: 2.2 },
    { at: SMASH + 0.03, kind: 'burst', x: TX + 1, y: 70, emoji: '💧', n: 7, dur: 0.5 },
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.32 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到高高的杯塔和左上的字框）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 45 } },
    ...y1.camera, ...y2.camera, ...y3.camera,
    { at: Y4 + 0.03, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: SMASH, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '桌' },
    ...y1.cues, ...y2.cues, ...y3.cues,
    ...m2.cues, ...m3.cues, ...m4.cues,
    { at: Y1 + 0.42, sfx: 'tap' },
    { at: PAUSE + 0.15, sfx: 'gulp' },
    { at: HOME + 0.1, say: '桌' },
    { at: WORD_SAY, say: '桌子' },
    { at: Y4, sfx: 'whoosh' },
    { at: Y4 + 0.03, sfx: 'slide' },
    { at: Y4 + 0.12, sfx: 'whoosh' },
    { at: SMASH, sfx: 'crack' },
    { at: SMASH + 0.03, sfx: 'clink' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '桌' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

// ---------- 照時間切片畫出桌巾和桌上的東西（每 1/30 秒；沒在動的時候合成一片） ----------
const tableI = clip.actors.findIndex((a) => a.id === 'table')
const tableAt = (t: number) => baseActorsAt(clip, t)[tableI]
/** 東西在舞台上的位置：桌面正中間為支點，晃的角度 lean，大小跟著桌子 */
function placeItems(items: Seg[], base: V, k: number, lean: number): Seg[] {
  const r = (lean * Math.PI) / 180
  const R = (p: V): V => ({ x: base.x + k * (p.x * Math.cos(r) - p.y * Math.sin(r)), y: base.y + k * (p.x * Math.sin(r) + p.y * Math.cos(r)) })
  return items.map((g) => ({ a: R(g.a), b: R(g.b), color: g.color, width: g.width * k }))
}
/** 第 4 次：桌子飛走的那一刻，杯子留在原地（半空中），一拍以後掉下來 */
const HANG = onTable(tableAt(Y4), SEAT)
const FLOOR_CUP = 73.5
function itemSegsAt(t: number): Seg[] {
  if (t >= SMASH) return []
  if (t >= Y4) {
    const p = Math.min(1, Math.max(0, (t - DROP) / (SMASH - DROP)))
    return placeItems(ONE_CUP, { x: HANG.x, y: HANG.y + (FLOOR_CUP - HANG.y) * p * p }, 1, 0)
  }
  const st = tableAt(t)
  return placeItems(itemsAt(t), onTable(st, SEAT), (st.size * st.s) / TS, leanAt(t))
}
function clothSegsAt(t: number): Seg[] {
  const st = tableAt(t)
  if (!st.visible || st.o < 0.5) return []
  // 第 4 次：桌巾跟著桌子一起飛走
  if (t >= Y4) return clothSegs(st)
  for (const y of [Y1, Y2, Y3]) {
    if (t >= y && t < y + SLIDE) return clothSegs(st, 26 * ((t - y) / SLIDE) ** 2)
    if (t >= y + SLIDE && t < y + SLIDE + FLY) {
      const p = (t - y - SLIDE) / FLY
      const c = { x: 118 + 70 * p, y: 46 - 58 * p * p - 10 * p }
      return flagSegs(c, t * 30, -20 - 40 * p)
    }
  }
  return clothOn(t) ? clothSegs(st) : []
}

{
  const key = (ss: Seg[]) => ss.map((s) => `${s.a.x.toFixed(2)},${s.a.y.toFixed(2)},${s.b.x.toFixed(2)},${s.b.y.toFixed(2)},${s.width.toFixed(2)},${s.color}`).join('|')
  const tubes: Fx[] = []
  // 桌巾先畫、東西後畫（東西壓在桌巾上面）
  for (const segsAt of [clothSegsAt, itemSegsAt]) {
    const slices: { at: number; dur: number; segs: Seg[] }[] = []
    let last = ''
    for (let t = 0; t < ASK; t += 1 / 30) {
      const segs = segsAt(t)
      const k = key(segs)
      if (k === last && slices.length) slices[slices.length - 1].dur += 1 / 30
      else slices.push({ at: t, dur: 1 / 30, segs })
      last = k
    }
    for (const s of slices) {
      for (const g of s.segs) {
        tubes.push({ at: s.at, dur: s.dur, kind: 'tube', actor: 'rb', dx: g.a.x, dy: g.a.y, to: g.b, color: g.color, width: g.width, n: 99 })
      }
    }
  }
  // tube 畫在最前面（底下），煙、星星、💥 畫在它們上面
  clip.fx = [...tubes, ...clip.fx!]

  // 三個部件：每一次抽完，從晃的那一疊上彈出來
  const at = (t: number, p: V) => onTable(tableAt(t), p)
  clip.builds = [
    { at: Y1 + 0.1, dur: 0.5, strokes: [0, 1], from: { x: at(Y1, SEAT).x, y: at(Y1, SEAT).y - 5 }, color: partColor('⺊') },
    { at: Y2 + 0.15, dur: 0.55, strokes: [2, 3, 4, 5], from: { x: at(Y2, SEAT).x, y: at(Y2, SEAT).y - 9 }, color: partColor('日') },
    { at: Y3 + 0.2, dur: 0.55, strokes: [6, 7, 8, 9], from: { x: at(Y3, SEAT).x, y: at(Y3, SEAT).y - 16 }, color: partColor('木') },
  ]
}

export default clip
