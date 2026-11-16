import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 紙（v2）：楊捷睿拿起一張白白薄薄的紙，「唰、唰」摺成紙飛機，往前一射——紙一次比一次大張，飛得一次比一次怪：
// 手掌大的一張，飛一小段就「啪」地栽到地上（糸的上半從栽下去的飛機上彈出來）→ 跟他身體一樣大的一張，繞一大圈飛回來、從後面戳他屁股，
// 他嚇得跳好高（糸的下半）→ 先停一拍：他托著下巴看地上那兩架、想到辦法——「碰」地一張比他還大的紙落下來，他整個人鑽進去「唰唰唰」摺，
// 摺出一架大飛機；他推、推不動，用力一推——飛機「咻」地衝出去，把抓著尾巴的他拖著跑出畫面（氏從飛機尖上彈出來）。
// 語詞那一刻大紙飛機載著他滑回畫面中間：「紙飛機」。
// 回馬槍（第四次）：他站在大紙飛機上喊出發——這次真的飛起來了，載著他越飛越高、飛出畫面。
// 最後畫面暗下來只剩「紙」，他從天上掉回來、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「紙！」，然後退場只留字。
// 刻意不跟「風」（報紙被風吹走、風箏）、「空」（火箭上天）、「昨」（撕日曆）、「瘦」「書」「舊」、「筆」（畫什麼變什麼）撞：這支演「紙摺成紙飛機」。
// 紙、紙、紙飛機、這是什麼字？、紙

type V = { x: number; y: number }

/** 楊捷睿（size 36）站在地上的 y；前三次都站在同一個地方、面向左邊（姿勢圖本來就朝左） */
const YS = 36
const PY = 77 - 0.42 * YS
const X = 116
/** 紙：白色、外面一圈藍灰描邊（淺藍天空上看得清楚） */
const PAPER = '#FFFFFF'
const EDGE = '#3D5A80'
const CREASE = '#9AAFC6'
/** 字框搬到左上角（飛的路線都在右邊、下面，不經過） */
const FRAME = { x: 30, y: 21 }
const FRAME_K = 0.5

// ---------- 畫紙：所有線條都掛在看不見的錨點 rb（0,0）上，dx／dy 就是舞台座標 ----------

/** 用一排直線把凸多邊形塗滿白色，再描邊（creases 是摺痕） */
function sheet(at: number, dur: number, poly: V[], creases: [V, V][] = []): Fx[] {
  const xs = poly.map((p) => p.x)
  const x0 = Math.min(...xs), x1 = Math.max(...xs), W = x1 - x0
  const n = Math.max(6, Math.round(W / 1.8))
  const w = (W / n) * 1.5
  const out: Fx[] = []
  for (let i = 0; i <= n; i++) {
    const x = x0 + w / 2 + ((W - w) * i) / n
    let top = Infinity, bot = -Infinity
    for (let j = 0; j < poly.length; j++) {
      const a = poly[j], b = poly[(j + 1) % poly.length]
      if ((x < Math.min(a.x, b.x)) || (x > Math.max(a.x, b.x)) || a.x === b.x) continue
      const y = a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x)
      top = Math.min(top, y); bot = Math.max(bot, y)
    }
    if (!(bot - top > w)) continue
    out.push({ at, dur, kind: 'line', actor: 'rb', dx: x, dy: top + w / 2, to: { x, y: bot - w / 2 }, color: PAPER, width: w })
  }
  for (let j = 0; j < poly.length; j++) {
    const a = poly[j], b = poly[(j + 1) % poly.length]
    out.push({ at, dur, kind: 'line', actor: 'rb', dx: a.x, dy: a.y, to: b, color: EDGE, width: 0.7 })
  }
  for (const [a, b] of creases) out.push({ at, dur, kind: 'line', actor: 'rb', dx: a.x, dy: a.y, to: b, color: CREASE, width: 0.5 })
  return out
}

/** 紙飛機的半高（尾巴那端） */
const halfH = (L: number) => 0.24 * L

/**
 * 紙飛機：從尾巴往尖頭拉一把扇形的白線＝尖尖的白色三角形，上下兩條描邊、中間一條摺痕。
 * 沒給 rest 就掛在兩個看不見的錨點上（tail → tip，跟著飛）；給了就畫在固定的位置（停在地上的）。
 */
function plane(at: number, dur: number, L: number, rest?: { tail: V; tip: V }): Fx[] {
  const h = halfH(L)
  const n = Math.max(4, Math.ceil((2 * h) / 1.8))
  const w = Math.max(1.1, ((2 * h) / n) * 1.5)
  const hh = Math.max(0.5, h - w / 2)
  const ln = (o: V, color: string, width: number): Fx => rest
    ? { at, dur, kind: 'line', actor: 'rb', dx: rest.tail.x + o.x, dy: rest.tail.y + o.y, to: rest.tip, color, width }
    : { at, dur, kind: 'line', actor: 'tail', dx: o.x, dy: o.y, target: 'tip', color, width }
  const out: Fx[] = []
  for (let i = 0; i <= n; i++) out.push(ln({ x: 0, y: -hh + (2 * hh * i) / n }, PAPER, w))
  out.push(ln({ x: 0.3 * h, y: 0 }, PAPER, w), ln({ x: -0.3 * h, y: 0 }, PAPER, w))
  out.push(ln({ x: 0, y: -h }, EDGE, 0.7), ln({ x: 0, y: h }, EDGE, 0.7), ln({ x: 0, y: h * 0.3 }, CREASE, 0.5))
  return out
}

// ---------- 飛：兩個錨點沿著同一條曲線走，尾巴永遠在尖頭後面 L 的地方（方向自己就對了） ----------

type Ease = (p: number) => number
const easeIn: Ease = (p) => p * p
const easeOut: Ease = (p) => 1 - (1 - p) * (1 - p)
const easeInOut: Ease = (p) => (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p))
const linear: Ease = (p) => p

/** 曲線：先一段直線（尾巴→尖頭，停著的那架），再用 Catmull-Rom 穿過 pts（pts[0] 是尖頭停著的地方） */
function curve(tail: V, pts: V[]): V[] {
  const out: V[] = []
  for (let i = 0; i < 20; i++) out.push({ x: tail.x + ((pts[0].x - tail.x) * i) / 20, y: tail.y + ((pts[0].y - tail.y) * i) / 20 })
  const P = [tail, ...pts, { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x, y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y }]
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]
    for (let j = 0; j < 30; j++) {
      const u = j / 30, u2 = u * u, u3 = u2 * u
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3)
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) })
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

/** 沿著折線走到弧長 s 的地方 */
function along(poly: V[], cum: number[], s: number): V {
  if (s <= 0) return poly[0]
  for (let i = 1; i < poly.length; i++) {
    if (cum[i] >= s) {
      const k = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
      return { x: poly[i - 1].x + (poly[i].x - poly[i - 1].x) * k, y: poly[i - 1].y + (poly[i].y - poly[i - 1].y) * k }
    }
  }
  return poly[poly.length - 1]
}

/** 一趟飛行：t0 起飛、dur 秒飛完；回傳兩個錨點的 moves，和任一時刻尖頭／尾巴的位置 */
function flight(t0: number, dur: number, tail: V, pts: V[], ease: Ease) {
  const poly = curve(tail, pts)
  const cum = [0]
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i].x - poly[i - 1].x, poly[i].y - poly[i - 1].y))
  const L = Math.hypot(pts[0].x - tail.x, pts[0].y - tail.y)
  const total = cum[cum.length - 1]
  const at = (t: number) => {
    const s = L + (total - L) * ease(Math.min(1, Math.max(0, (t - t0) / dur)))
    return { tip: along(poly, cum, s), tail: along(poly, cum, s - L) }
  }
  const N = Math.max(4, Math.round(dur / 0.05))
  const moves: Move[] = []
  for (let i = 0; i < N; i++) {
    const t = t0 + (dur * i) / N, nx = at(t0 + (dur * (i + 1)) / N)
    moves.push({ at: t, dur: dur / N, actor: 'tip', do: 'moveTo', to: nx.tip, ease: 'linear' })
    moves.push({ at: t, dur: dur / N, actor: 'tail', do: 'moveTo', to: nx.tail, ease: 'linear' })
  }
  return { moves, at, end: at(t0 + dur), N }
}

/** 兩個錨點一下子放到停著的位置 */
const place = (at: number, tail: V, tip: V): Move[] => [
  { at, dur: 0.01, actor: 'tail', do: 'moveTo', to: tail },
  { at, dur: 0.01, actor: 'tip', do: 'moveTo', to: tip },
]

/** 站在大紙飛機上的他：站在離尾巴 0.4 L 的地方，跟著飛機轉 */
let riderAngle = 0
function ride(f: ReturnType<typeof flight>, t0: number, dur: number, L: number): Move[] {
  const h = halfH(L)
  const pose = (t: number) => {
    const { tip, tail } = f.at(t)
    const len = Math.hypot(tip.x - tail.x, tip.y - tail.y) || 1
    const d = { x: (tip.x - tail.x) / len, y: (tip.y - tail.y) / len }
    const up = { x: d.y, y: -d.x }
    const base = { x: tail.x + d.x * L * 0.4, y: tail.y + d.y * L * 0.4 }
    const off = h * 0.6 + 0.42 * YS
    return { x: base.x + up.x * off, y: base.y + up.y * off, a: (Math.atan2(d.y, d.x) * 180) / Math.PI }
  }
  const moves: Move[] = []
  const p0 = pose(t0)
  moves.push({ at: t0 - 0.01, dur: 0.01, actor: 'yang', do: 'moveTo', to: { x: p0.x, y: p0.y } })
  moves.push({ at: t0 - 0.01, dur: 0.01, actor: 'yang', do: 'rotateTo', amount: p0.a - riderAngle, pivot: 'center' })
  riderAngle = p0.a
  for (let i = 0; i < f.N; i++) {
    const t = t0 + (dur * i) / f.N, nx = pose(t0 + (dur * (i + 1)) / f.N)
    moves.push({ at: t, dur: dur / f.N, actor: 'yang', do: 'moveTo', to: { x: nx.x, y: nx.y }, ease: 'linear' })
    moves.push({ at: t, dur: dur / f.N, actor: 'yang', do: 'rotateTo', amount: nx.a - riderAngle, ease: 'linear', pivot: 'center' })
    riderAngle = nx.a
  }
  return moves
}

/**
 * 「唰、唰」摺紙：一張平平的長方形紙 → 左邊兩個角摺進來（尖尖的房子形）→ 停著的紙飛機（尖頭朝左）。
 * c 是紙的中心、W／H 是紙的大小、at 是紙出現的時候、fold 是開始摺的時候。回傳畫面和停著的紙飛機（尾巴、尖頭）。
 */
function foldUp(at: number, fold: number, c: V, W: number, H: number) {
  const x0 = c.x - W / 2, x1 = c.x + W / 2, y0 = c.y - H / 2, y1 = c.y + H / 2
  const xm = x0 + 0.42 * W
  const FOLD2 = fold + 0.22
  const fx: Fx[] = [
    ...sheet(at, fold - at + 0.08, [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }]),
    ...sheet(fold, 0.3, [{ x: x0, y: c.y }, { x: xm, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: xm, y: y1 }], [[{ x: xm, y: y0 }, { x: xm, y: y1 }]]),
  ]
  const cues: Cue[] = [{ at: fold, sfx: 'slide' }, { at: FOLD2, sfx: 'slide' }]
  return { fx, cues, ready: FOLD2, tail: { x: x1, y: c.y }, tip: { x: x0, y: c.y }, L: W }
}

// ---------- 時間 ----------

/** 第 1 次：手掌大的紙 */
const W1 = 16, H1 = 12
const C1 = { x: X - 13, y: PY - 3 }
const P1 = 0.55
const F1 = foldUp(P1, 0.95, C1, W1, H1)
const T1 = 1.35
const fl1 = flight(T1, 0.55, F1.tail, [F1.tip, { x: 86, y: 53 }, { x: 72, y: 57 }, { x: 63, y: 65 }, { x: 52, y: 71.5 }], easeIn)
const CRASH1 = T1 + 0.55

/** 第 2 次：跟他身體一樣大的紙，繞一大圈飛回來戳屁股 */
const W2 = 26, H2 = 20
const C2 = { x: X - 16, y: PY - 3 }
const P2 = 2.4
const F2 = foldUp(P2, 2.75, C2, W2, H2)
const T2 = 3.15
const D2 = 1.55
const fl2 = flight(T2, D2, F2.tail, [F2.tip, { x: 64, y: 63 }, { x: 50, y: 56 }, { x: 58, y: 46 }, { x: 78, y: 41 },
  { x: 104, y: 32 }, { x: 126, y: 27 }, { x: 143, y: 32 }, { x: 153, y: 44 }, { x: 150, y: 57 }, { x: X + 9, y: PY + 2 }], linear)
const HIT2 = T2 + D2
/** 戳完掉到地上（兩個錨點一起往下，方向不變） */
const DROP2 = { dx: -1, dy: 8 }

/** 第 3 次：一張比他還大的紙 */
const W3 = 56, H3 = 38
const C3 = { x: 82, y: 74 - H3 / 2 }
const P3 = 5.55
const IN3 = 5.75
const F3 = foldUp(P3, 6.05, C3, W3, H3)
const PUSH1 = 6.5
const PUSH2 = 6.95
const ZOOM = 7.05
const ZD = 0.75
const fl3 = flight(ZOOM, ZD, F3.tail, [F3.tip, { x: -10, y: C3.y - 1 }, { x: -110, y: C3.y - 3 }], easeIn)

/** 國字回中央、讓位 */
const HOME = 7.9
const PARK = 8.75
/** 語詞：大紙飛機載著他滑回中間（這次尖頭朝右） */
const GLIDE = 8.8
const REST4 = { tail: { x: 52, y: 60 }, tip: { x: 108, y: 60 } }
const fl4 = flight(GLIDE, 0.55, { x: -150, y: 56 }, [{ x: -94, y: 56 }, { x: 10, y: 58 }, { x: 70, y: 59 }, REST4.tip], easeOut)
const WORD = GLIDE + 0.6
/** 回馬槍：出發——真的飛起來了 */
const GO4 = 10.2
const fl5 = flight(GO4, 0.75, REST4.tail, [REST4.tip, { x: 128, y: 63 }, { x: 148, y: 55 }, { x: 172, y: 38 }, { x: 225, y: 14 }], easeInOut)
/** 問他 */
const ASK = 11.0
const ASKSAY = 11.1
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '紙',
  meta: { theme: '楊捷睿摺紙飛機', cast: '楊捷睿＋一張白紙（摺成紙飛機）', gags: ['楊捷睿每次拿一張白紙「唰、唰」摺成紙飛機往前一射，紙一次比一次大、飛得一次比一次怪（手掌大的飛一小段就栽到地上→跟他一樣大的繞一大圈飛回來戳他屁股→比他還大的紙他鑽進去摺，推不動、一推就把抓著尾巴的他拖出畫面）；回馬槍是他站上大紙飛機喊出發，這次真的載著他飛上天'] },
  duration: 15,
  bg: { top: '#78B4E6', bottom: '#BCDDF4', floor: '#97C878', scenery: 'hills' },
  actors: [
    // 看不見的錨點（0,0）：停著的紙、紙飛機的線都掛在這上面，dx／dy 就是舞台座標
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 2, hidden: true, float: true },
    // 飛著的紙飛機：尖頭、尾巴兩個看不見的錨點，白色的扇形線從尾巴拉到尖頭
    { id: 'tail', emoji: '⭐', x: F1.tail.x, y: F1.tail.y, size: 2, hidden: true, float: true },
    { id: 'tip', emoji: '⭐', x: F1.tip.x, y: F1.tip.y, size: 2, hidden: true, float: true },
    { id: 'yang', emoji: 'hero:yang/idle', x: 190, y: PY, size: YS },
  ],
  moves: [
    // 登場：從右邊走進來，拿出一張白紙
    { at: 0, actor: 'yang', do: 'moveTo', to: { x: X, y: PY }, dur: 0.5, ease: 'out' },
    { at: P1, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: F1.ready - 0.25, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.4 },
    // 第 1 次：射出去——飛一小段就栽到地上
    { at: T1 - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
    ...fl1.moves,
    { at: CRASH1 + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第 2 次：拿一張大一點的
    { at: P2, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    ...place(F2.ready, F2.tail, F2.tip),
    { at: F2.ready - 0.25, actor: 'yang', do: 'shake', amount: 1, dur: 0.4 },
    { at: T2 - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
    { at: T2 + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    ...fl2.moves,
    // 繞一大圈回來戳屁股：嚇得跳好高
    { at: HIT2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: HIT2, actor: 'yang', do: 'hop', amount: 16, dur: 0.55 },
    { at: HIT2 + 0.05, actor: 'tip', do: 'moveTo', to: { x: fl2.end.tip.x + DROP2.dx, y: fl2.end.tip.y + DROP2.dy }, dur: 0.25, ease: 'in' },
    { at: HIT2 + 0.05, actor: 'tail', do: 'moveTo', to: { x: fl2.end.tail.x + DROP2.dx, y: fl2.end.tail.y + DROP2.dy }, dur: 0.25, ease: 'in' },
    // 先停一拍：托著下巴看地上那兩架……想到了！
    { at: 5.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: 5.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: 5.4, actor: 'yang', do: 'hop', amount: 3, dur: 0.22 },
    // 第 3 次：「碰」一張比他還大的紙落下來，他整個人鑽進去摺
    { at: IN3, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: IN3, actor: 'yang', do: 'moveTo', to: { x: C3.x, y: PY }, dur: 0.3, ease: 'inOut' },
    ...place(F3.ready, F3.tail, F3.tip),
    // 摺好，從尾巴那邊鑽出來，推——推不動
    { at: F3.ready + 0.05, actor: 'yang', do: 'moveTo', to: { x: X - 2, y: PY }, dur: 0.18, ease: 'out' },
    { at: PUSH1 - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: PUSH1, actor: 'tip', do: 'moveTo', to: { x: F3.tip.x - 1.5, y: F3.tip.y }, dur: 0.12 },
    { at: PUSH1, actor: 'tail', do: 'moveTo', to: { x: F3.tail.x - 1.5, y: F3.tail.y }, dur: 0.12 },
    { at: PUSH1 + 0.15, actor: 'tip', do: 'moveTo', to: F3.tip, dur: 0.15 },
    { at: PUSH1 + 0.15, actor: 'tail', do: 'moveTo', to: F3.tail, dur: 0.15 },
    { at: PUSH1 + 0.05, actor: 'yang', do: 'shake', amount: 1, dur: 0.35 },
    // 用力一推（蹲低蓄力）——飛機「咻」地衝出去，把抓著尾巴的他拖出畫面
    { at: PUSH2 - 0.22, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.22 },
    { at: ZOOM, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    ...fl3.moves,
    // 他抓著尾巴，跟著飛機被拖出去
    ...Array.from({ length: 15 }, (_, i): Move => ({ at: ZOOM + (ZD * i) / 15, dur: ZD / 15, actor: 'yang', do: 'moveTo', to: { x: fl3.at(ZOOM + (ZD * (i + 1)) / 15).tail.x + 13, y: PY }, ease: 'linear' })),
    // 語詞：大紙飛機（尖頭朝右）載著他滑回畫面中間
    { at: GLIDE - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: GLIDE - 0.05, actor: 'yang', do: 'flip' },
    ...fl4.moves,
    ...ride(fl4, GLIDE, 0.55, W3),
    { at: WORD, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: WORD, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
    // 回馬槍：站穩、蹲低、喊出發——真的飛起來了，載著他越飛越高
    { at: GO4 - 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: GO4 - 0.3, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.25 },
    ...fl5.moves,
    ...ride(fl5, GO4, 0.75, W3),
    { at: GO4 + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 問他：從天上掉回來到左前方、變大，轉向觀眾（轉正、面向右邊的字）
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, actor: 'yang', do: 'rotateTo', amount: -riderAngle, dur: 0.01, pivot: 'center' },
    { at: ASK, actor: 'yang', do: 'moveTo', to: { x: 34, y: -30 }, dur: 0.01 },
    { at: ASK + 0.02, actor: 'yang', do: 'moveTo', to: { x: 34, y: PY + 4 }, dur: 0.35, ease: 'in' },
    { at: ASK, actor: 'yang', do: 'scaleTo', amount: 1.3, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.15, actor: 'yang', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.7, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -8, dur: 0.1 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 7, dur: 0.25 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.18, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.18, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'yang', do: 'moveTo', to: { x: -45, y: PY + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 每次紙飛機出事的那一下，從飛機上彈出一組：糸的上半 → 糸的下半 → 氏
    { at: CRASH1 + 0.05, dur: 0.55, strokes: [0, 1, 2], from: { x: 54, y: 68 }, color: partColor('糸') },
    { at: HIT2 + 0.05, dur: 0.55, strokes: [3, 4, 5], from: { x: X + 10, y: PY }, color: partColor('糸') },
    { at: ZOOM + 0.05, dur: 0.5, strokes: [6, 7, 8, 9], from: { x: 60, y: C3.y - 4 }, color: partColor('氏') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的他
    { at: ASK, dur: 2.95, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    // 第 1 次：紙 → 摺 → 紙飛機飛出去 → 栽在地上（停在那裡）
    ...F1.fx,
    ...plane(F1.ready, CRASH1 - F1.ready + 0.1, F1.L),
    ...plane(CRASH1, P3 + 0.05 - CRASH1, F1.L, fl1.end),
    { at: CRASH1, kind: 'burst', x: 53, y: 69, n: 1, dur: 0.4, scale: 1.2 },
    // 第 2 次：戳屁股，掉到地上
    ...F2.fx,
    ...plane(F2.ready, HIT2 + 0.32 - F2.ready, F2.L),
    ...plane(HIT2 + 0.3, P3 + 0.05 - HIT2 - 0.3, F2.L, {
      tail: { x: fl2.end.tail.x + DROP2.dx, y: fl2.end.tail.y + DROP2.dy }, tip: { x: fl2.end.tip.x + DROP2.dx, y: fl2.end.tip.y + DROP2.dy },
    }),
    { at: HIT2, kind: 'burst', x: X + 12, y: PY - 2, n: 1, dur: 0.4, scale: 1.5 },
    { at: HIT2 + 0.1, kind: 'pop', actor: 'yang', emoji: '❗', dx: -4, dur: 0.6, scale: 1.4 },
    // 停一拍：想到了
    { at: 5.4, kind: 'pop', actor: 'yang', emoji: '💡', dx: -2, dur: 0.5, scale: 1.3 },
    // 第 3 次：大紙「碰」地落下來，把地上那兩架震飛
    { at: P3, kind: 'burst', x: fl1.end.tip.x + 4, y: 66, emoji: '💨', n: 1, dur: 0.45, scale: 1.4 },
    { at: P3, kind: 'burst', x: fl2.end.tip.x + 14, y: 66, emoji: '💨', n: 1, dur: 0.45, scale: 1.4 },
    ...F3.fx,
    // 他在紙裡面摺：兩邊冒煙
    { at: 6.1, kind: 'burst', x: C3.x - 30, y: 66, emoji: '💨', n: 1, dur: 0.35, scale: 1.2 },
    { at: 6.25, kind: 'burst', x: C3.x + 30, y: 60, emoji: '💨', n: 1, dur: 0.35, scale: 1.2 },
    ...plane(F3.ready, ZOOM + ZD + 0.05 - F3.ready, F3.L),
    { at: PUSH1 + 0.2, kind: 'sweat', actor: 'yang', dx: -4 },
    { at: ZOOM, kind: 'burst', x: C3.x + 10, y: 66, emoji: '💨', n: 1, dur: 0.4, scale: 2 },
    // 語詞那一刻、回馬槍：大紙飛機
    ...plane(GLIDE, GO4 + 0.8 - GLIDE, W3),
    { at: GO4, kind: 'burst', x: REST4.tail.x - 4, y: 64, emoji: '💨', n: 1, dur: 0.45, scale: 2 },
    { at: GO4 + 0.45, kind: 'burst', x: 140, y: 40, emoji: '✨', n: 8, dur: 0.5 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把飛的路線切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    { at: CRASH1, dur: 0.35, do: 'punch', amount: 0.08, to: { x: 60, y: 66 } },
    { at: CRASH1, dur: 0.25, do: 'shake', amount: 0.8 },
    { at: HIT2, dur: 0.4, do: 'punch', amount: 0.12, to: { x: X, y: PY - 6 } },
    { at: HIT2, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: P3, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: ZOOM, dur: 0.35, do: 'shake', amount: 2 },
    { at: GO4, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    // 國字回中央的白光
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '紙' },
    ...F1.cues,
    { at: T1, sfx: 'whoosh' },
    { at: CRASH1, sfx: 'plop' },
    ...F2.cues,
    { at: T2, sfx: 'whoosh' },
    { at: HIT2, sfx: 'plop' },
    { at: HIT2 + 0.04, sfx: 'boing' },
    { at: 5.4, sfx: 'blip' },
    { at: P3, sfx: 'bonk' },
    ...F3.cues,
    { at: 6.4, sfx: 'slide' },
    { at: PUSH1, sfx: 'rumble' },
    { at: ZOOM, sfx: 'whoosh' },
    { at: ZOOM + 0.05, sfx: 'plop' },
    { at: ZOOM + 0.1, sfx: 'boing' },
    { at: HOME + 0.05, say: '紙' },
    { at: GLIDE, sfx: 'whoosh' },
    { at: WORD, say: '紙飛機' },
    { at: GO4, sfx: 'whoosh' },
    { at: GO4 + 0.05, sfx: 'laser' },
    { at: GO4 + 0.45, sfx: 'cheer' },
    { at: ASKSAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '紙' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
