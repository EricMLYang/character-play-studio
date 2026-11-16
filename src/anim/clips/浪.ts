import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 浪（v2）：兔子女孩踩著一塊橘色衝浪板站在海面上，一道藍色的浪從後面「嘩——」地捲過來把她托起來，一道比一道高：
// 小浪把她托高一點，她晃一下站穩、得意（氵從浪頭的白浪花飛出來）→ 中浪把她托到半空，她手忙腳亂（良的上半）→
// 先停一拍：她得意地等下一道，後面海水慢慢站起來；她回頭一看，一道比天還高的大浪捲下來，「轟嘩！」把她捲進浪裡轉好幾圈，
// 衝浪板飛上天，她暈暈地漂到另一邊（良的下半）。
// 語詞那一刻：板子漂回來，她踩著水衝過去跳上板子，一道浪把她穩穩托在畫面中間，她張開雙手：「海浪」。
// 回馬槍（第四次）：她學乖了，抱著頭縮在板子上等。最高最大的一道浪捲到她頭頂上……只滴下一小團白浪花「啪」地輕輕拍她的頭——
// 她卻嚇得跳最高、一屁股跌坐在板子上，大浪自己退走了。
// 最後畫面暗下來只剩「浪」，兔子女孩跳回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「浪！」，然後退場只留字。
// 刻意不跟「海」（警長在沙灘上被浪沖、海豚）、「湖」（打水漂）、「島」（海水漲、小島變小）撞：
// 這支人一直在海上，只演「浪從後面捲過來把她托起來」，浪是畫面上最大的那一道捲起來、頂上有白浪花的水。
// 浪、浪、海浪、這是什麼字？、浪

/** 兔子女孩（hero:bunny；圖朝左，正好面向浪前進的方向，回頭看浪才 flip） */
const BS = 36
/** 她的腳底到圖中心 */
const FOOT = 0.42 * BS
/** 海面（就是地板線） */
const S = 74
/** 前三次、第四次都站在同一個地方 */
const X = 74
/** 第三次被捲走、漂到的地方（左邊，國字回中央時不擋字） */
const LEFT = 22
/** 語詞那一刻站的地方（浪頂上） */
const WORD_X = 84
/** 衝浪板漂走的地方 */
const FAR = 146
/** 衝浪板半長 */
const BOARD = 11
/** 國字讓位的地方（左上，背後是素色的天空；浪都在右邊） */
const PARK_AT: Vec = { x: 30, y: 20 }
const PARK_K = 0.5

const ease = (p: number) => p * p * (3 - 2 * p)
const easeOut = (p: number) => 1 - (1 - p) * (1 - p)
const clamp01 = (p: number) => Math.max(0, Math.min(1, p))
const lerp = (a: number, b: number, p: number) => a + (b - a) * p

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
/** 海的藍（地板色）、浪頂的淺藍、捲起來的浪頭 */
const SEA = '#2A82D6'
const TOP = '#66C8F6'
const LIP = '#46AEEC'
const FOAM = '#FFFFFF'

// ---- 時間表 ----
const W1 = 1.7
const W2 = 3.3
/** 第三次前停一拍：她得意地等，後面的海水慢慢站起來；她回頭一看 */
const SMUG3 = W2 + 1.2
const RISE3 = SMUG3 + 0.2
const SEE3 = RISE3 + 0.3
const W3 = SEE3 + 0.6
/** 被捲著轉圈、漂到左邊 */
const TUMBLE = 0.9
/** 字框填滿、國字到正中央 */
const HOME = W3 + 1.05
const PARK = HOME + 0.85
/** 語詞：板子漂回來，她踩著水衝過去跳上板子，浪把她托在中間 */
const WORD = PARK + 0.05
const DASH0 = PARK + 0.3
const DASH1 = DASH0 + 0.35
const LIFT = DASH1 + 0.3
const SAY_WORD = LIFT + 0.02
/** 回馬槍：浪放下她、她回到老地方 */
const R4 = LIFT + 0.55
const R4END = R4 + 0.35
const RISE4 = R4END - 0.05
/** 第四次：大浪的浪頭停在她頭頂上，滴下一小團浪花「啪」 */
const LOOM4 = RISE4 + 0.65
const PAT = LOOM4 + 0.12
const LAND4 = PAT + 0.42
/** 問他 */
const ASK = LAND4 + 0.2
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
const ASK_AT: Vec = { x: 122, y: S - FOOT + 3 }

// ---- 浪：一道一道橫的藍色粗線疊成浪身，浪頭是一段往前捲的弧，頂上一排白色浪花（都掛在看不見的錨點 water 上，錨點在 0,0） ----

/** 一道浪的關鍵格：[時間, 浪頂的 x, 浪高, 捲得多厲害 0～1]。浪頭朝左（浪從右邊、她的後面捲過來） */
type Key = [number, number, number, number]
type Wave = { cx: number; H: number; curl: number }

const WAVES: Key[][] = [
  // 第 1 次：小浪，把她托高一點
  [[W1 - 0.7, 172, 11, 0.4], [W1, X - 8, 20, 0.6], [W1 + 0.55, X - 8, 20, 0.75], [W1 + 1.05, X - 8, 0, 0.5]],
  // 第 2 次：中浪，托到半空
  [[W2 - 0.75, 175, 16, 0.4], [W2, X - 8, 33, 0.7], [W2 + 0.6, X - 8, 33, 0.8], [W2 + 1.1, X - 8, 0, 0.5]],
  // 第 3 次：後面的海水站起來、比天還高，捲下來把她整個捲進去
  [[RISE3, 178, 20, 0.3], [SEE3, 132, 50, 0.4], [W3 - 0.12, 112, 62, 0.6], [W3 + 0.12, 90, 62, 1], [W3 + 0.5, 66, 24, 1], [W3 + 0.9, 44, 0, 1]],
  // 語詞：一道浪把她穩穩托在畫面中間
  [[DASH0 - 0.25, 176, 10, 0.4], [LIFT, WORD_X - 8, 30, 0.7], [R4, WORD_X - 8, 30, 0.8], [R4END, WORD_X - 8, 0, 0.5]],
  // 第 4 次：最高最大的一道，浪頭停在她頭頂上，拍一下就自己退走
  [[RISE4, 178, 24, 0.3], [LOOM4 - 0.25, 116, 60, 0.45], [LOOM4, 106, 66, 0.7], [PAT, 106, 66, 0.7], [PAT + 0.28, 128, 26, 0.4], [PAT + 0.5, 160, 0, 0.3]],
]

function waveAt(keys: Key[], t: number): Wave | null {
  if (t < keys[0][0] || t > keys[keys.length - 1][0]) return null
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i]
      const p = ease((t - a[0]) / (b[0] - a[0]))
      const w = { cx: lerp(a[1], b[1], p), H: lerp(a[2], b[2], p), curl: lerp(a[3], b[3], p) }
      return w.H < 0.6 ? null : w
    }
  }
  return null
}
const wavesAt = (t: number) => WAVES.map((k) => waveAt(k, t)).filter((w): w is Wave => !!w)

/** 浪背（右邊，緩）與浪前（左邊，陡）有多寬 */
const backW = (H: number) => 1.6 * H + 14
const frontW = (H: number) => 0.2 * H + 4
/** 浪在 x 這一點有多高 */
function heightAt(w: Wave, x: number) {
  const d = Math.abs(x - w.cx), span = x >= w.cx ? backW(w.H) : frontW(w.H)
  return d >= span ? 0 : (w.H * (1 + Math.cos((Math.PI * d) / span))) / 2
}
/** 海面（有浪就是浪的表面）在 x 這一點的 y */
const surfY = (x: number, t: number) => S - Math.max(0, ...wavesAt(t).map((w) => heightAt(w, x)))
/** 高度 h 那一排，浪從浪頂往前／往後各延伸多遠 */
const spanAt = (w: Wave, h: number, W: number) => (W / Math.PI) * Math.acos(Math.max(-1, Math.min(1, (2 * h) / w.H - 1)))

/** 捲起來的浪頭：圓心、半徑、起點角度、捲多少度 */
function lipOf(w: Wave) {
  const R = 0.26 * w.H + 1.5
  const C = { x: w.cx - 0.3 * R, y: S - w.H + R }
  const a0 = (-65 * Math.PI) / 180
  const sweep = ((70 + 170 * w.curl) * Math.PI) / 180
  const at = (k: number, r = R) => ({ x: C.x + r * Math.cos(a0 - sweep * k), y: C.y + r * Math.sin(a0 - sweep * k) })
  return { R, C, at }
}
/** 浪頭的尖端 */
const lipTip = (w: Wave) => lipOf(w).at(1)

type Seg = { a: Vec; b: Vec; color: string; width: number }

/** 某一刻所有浪的樣子（一組線段，每段有自己的名字，前後格一樣就合併成一段） */
function waveFrame(t: number): Map<string, Seg> {
  const out = new Map<string, Seg>()
  WAVES.forEach((keys, wi) => {
    const w = waveAt(keys, t)
    if (!w) return
    // 浪身：由下往上一排一排，下面跟海一樣藍、上面淺
    const ROW = 1.9
    for (let i = 0; ; i++) {
      const y = S - 0.4 - i * ROW
      const h = S - y
      if (h > w.H - 0.6) break
      const x0 = Math.max(-8, w.cx - spanAt(w, h, frontW(w.H)))
      const x1 = Math.min(176, w.cx + spanAt(w, h, backW(w.H)))
      if (x1 - x0 > 0.3) out.set(`${wi}r${i}`, { a: { x: x0, y }, b: { x: x1, y }, color: mix(SEA, TOP, h / Math.max(w.H, 1)), width: 2.7 })
    }
    // 浪頭：一段往前（左）捲下來的弧，根部粗、尖端細
    const lip = lipOf(w)
    const N = 8
    const lw = (k: number) => Math.max(1.2, lip.R * (0.6 - 0.32 * k))
    for (let i = 0; i < N; i++) {
      out.set(`${wi}l${i}`, { a: lip.at(i / N), b: lip.at((i + 1) / N), color: i < 2 ? mix(LIP, TOP, 0.5) : LIP, width: lw(i / N) })
    }
    // 頂上一排白色浪花：沿著浪頭的外緣，再往浪背延伸一小段
    const dot = Math.max(1.4, Math.min(4.2, 0.075 * w.H + 1))
    const dots: Vec[] = []
    const arc = (70 + 170 * w.curl) * (Math.PI / 180) * lip.R
    const n = Math.max(3, Math.round(arc / (dot * 1.15)))
    for (let i = 0; i <= n; i++) {
      const k = i / n
      dots.push(lip.at(k, lip.R + lw(k) / 2 - dot * 0.25))
    }
    const back = backW(w.H) * 0.22
    for (let d = dot; d < back; d += dot * 1.2) dots.push({ x: w.cx + d, y: S - heightAt(w, w.cx + d) - 0.2 })
    dots.forEach((p, i) => out.set(`${wi}f${i}`, { a: p, b: { x: p.x + 0.3, y: p.y }, color: FOAM, width: dot }))
    const tip = lipTip(w)
    out.set(`${wi}tip`, { a: tip, b: { x: tip.x + 0.3, y: tip.y }, color: FOAM, width: dot * 1.3 })
  })
  // 第 4 次：浪頭尖端滴下一小團白浪花，輕輕拍在她頭上
  if (t >= PAT - 0.3 && t <= PAT + 0.04) {
    const w = waveAt(WAVES[4], PAT)!
    const tip = lipTip(w)
    const p = clamp01((t - PAT + 0.3) / 0.3)
    const head = { x: X + 1, y: S - BS * 0.7 }
    const q = { x: lerp(tip.x, head.x, p), y: lerp(tip.y, head.y, p * p) }
    out.set('drip', { a: q, b: { x: q.x + 0.4, y: q.y }, color: FOAM, width: 6.5 })
  }
  return out
}

/** 把整支的浪每 0.05 秒取一格，前後格一樣的線段合成一段，變成一串 line 效果 */
function waveFx(end: number): Fx[] {
  const fx: Fx[] = []
  const open = new Map<string, { seg: Seg; at: number }>()
  const same = (p: Seg, q: Seg) => Math.abs(p.a.x - q.a.x) < 0.05 && Math.abs(p.a.y - q.a.y) < 0.05 && Math.abs(p.b.x - q.b.x) < 0.05 && Math.abs(p.b.y - q.b.y) < 0.05 && p.color === q.color && Math.abs(p.width - q.width) < 0.02
  const close = (key: string, t: number, last: boolean) => {
    const o = open.get(key)!
    // 多留 0.12 秒跟下一段疊在一起，換段的時候不會閃
    fx.push({ at: o.at, dur: t - o.at + (last ? 0 : 0.12), kind: 'line', actor: 'water', dx: o.seg.a.x, dy: o.seg.a.y, to: o.seg.b, color: o.seg.color, width: o.seg.width })
    open.delete(key)
  }
  const STEP = 0.05
  for (let n = 0; n * STEP < end - 1e-6; n++) {
    const t = +(n * STEP).toFixed(3)
    const frame = waveFrame(t)
    for (const key of [...open.keys()]) {
      const now = frame.get(key)
      if (!now || !same(now, open.get(key)!.seg)) close(key, t, !now)
    }
    for (const [key, seg] of frame) if (!open.has(key)) open.set(key, { seg, at: t })
  }
  for (const key of [...open.keys()]) close(key, end, true)
  return fx
}

// ---- 她的腳底、衝浪板：照時間算位置，每 0.05 秒取一格變成一串 moveTo ----

/** 她的腳底在哪 */
function feetAt(t: number): Vec {
  if (t < 0.7) return { x: lerp(-16, X, easeOut(t / 0.7)), y: S }
  if (t < W3 + 0.05) return { x: X, y: surfY(X, t) }
  if (t < W3 + 0.05 + TUMBLE) {
    // 被捲著往左帶、在浪花裡翻滾
    const p = (t - W3 - 0.05) / TUMBLE
    // 拋高只在右半段（國字字框在左上，不從它前面經過），之後貼著海面滾過去
    return { x: lerp(X, LEFT, easeOut(p)), y: S - (p < 0.35 ? 9 * Math.sin((Math.PI * p) / 0.35) : 0) }
  }
  if (t < DASH0) return { x: LEFT, y: S }
  if (t < DASH1) {
    // 踩著水衝過去，最後一小跳跳上板子
    const p = (t - DASH0) / (DASH1 - DASH0)
    return { x: lerp(LEFT, WORD_X, ease(p)), y: S - 5 * Math.max(0, Math.sin(Math.PI * (p - 0.55) / 0.45)) }
  }
  if (t < R4) return { x: WORD_X, y: surfY(WORD_X, t) }
  if (t < R4END) {
    const x = lerp(WORD_X, X, ease((t - R4) / (R4END - R4)))
    return { x, y: surfY(x, t) }
  }
  return { x: X, y: surfY(X, t) }
}

/** 衝浪板的中心與角度（度） */
function boardAt(t: number): { c: Vec; ang: number } {
  const under = () => { const f = feetAt(t); return { c: { x: f.x, y: f.y + 1 }, ang: 0 } }
  if (t < W3) return under()
  if (t < W3 + 0.85) {
    // 被浪打飛上天、翻兩圈，掉在右邊的海上
    const p = (t - W3) / 0.85
    return { c: { x: lerp(X, FAR, p), y: S + 1 - 46 * Math.sin(Math.PI * p) }, ang: 720 * p }
  }
  if (t < PARK) return { c: { x: FAR, y: S + 1 - 0.5 * Math.abs(Math.sin((t - W3) * 4)) }, ang: 0 }
  if (t < DASH1) {
    // 被海水推回來，漂到中間等她
    const x = lerp(FAR, WORD_X, ease((t - PARK) / (DASH1 - PARK)))
    return { c: { x, y: surfY(x, t) + 1 }, ang: 0 }
  }
  return under()
}

/** 把位置函式取樣成一串 moveTo（位置沒變就不寫） */
function track(actor: string, at: (t: number) => Vec, end: number): Move[] {
  const out: Move[] = []
  const STEP = 0.05
  let prev = at(0)
  for (let n = 1; n * STEP <= end + 1e-6; n++) {
    const t = +(n * STEP).toFixed(3)
    const p = at(t)
    if (Math.abs(p.x - prev.x) > 0.02 || Math.abs(p.y - prev.y) > 0.02) {
      out.push({ at: +(t - STEP).toFixed(3), dur: STEP, actor, do: 'moveTo', to: { x: +p.x.toFixed(2), y: +p.y.toFixed(2) }, ease: 'linear' })
    }
    prev = p
  }
  return out
}
const bunnyAt = (t: number) => { const f = feetAt(t); return { x: f.x, y: f.y - FOOT } }
const endAt = (side: 1 | -1) => (t: number) => {
  const { c, ang } = boardAt(t)
  const r = (ang * Math.PI) / 180
  return { x: c.x + side * BOARD * Math.cos(r), y: c.y + side * BOARD * Math.sin(r) }
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 浪打到那一下：浪花四濺＋鏡頭推一下＋震＋同一個音效（一次比一次多疊一個音） */
function hit(at: number, k: number, c: Vec): Gag {
  const fx: Fx[] = [{ at, kind: 'burst', x: c.x, y: c.y, emoji: '💦', n: 6 + 2 * k, dur: 0.5, scale: 1.2 + 0.4 * k }]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: c.x, y: 52 } },
    { at, dur: 0.32, do: 'shake', amount: 0.7 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at: at - 0.33, sfx: 'whoosh' }, { at, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'bubble' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'rumble' })
  return { moves: [], fx, camera, cues }
}

// 第 1 次：小浪托高一點，她晃一下站穩，得意
const g1 = hit(W1, 0, { x: X - 12, y: S - 22 })
g1.moves.push(
  { at: W1 - 0.05, actor: 'bunny', do: 'shake', amount: 1.2, dur: 0.35 },
  { at: W1 + 0.35, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
  { at: W1 + 1.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/hug' },
)
// 第 2 次：中浪托到半空，手忙腳亂；放下來以後傻眼
const g2 = hit(W2, 1, { x: X - 12, y: S - 36 })
g2.moves.push(
  { at: W2 - 0.12, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/slip' },
  { at: W2 - 0.05, actor: 'bunny', do: 'shake', amount: 2, dur: 0.6 },
  { at: W2 + 0.62, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
)
g2.fx.push({ at: W2 + 0.2, kind: 'sweat', actor: 'bunny', dx: 6 })
// 停一拍：她得意地叉腰等下一道（後面的海水慢慢站起來，她沒看到）；回頭一看，傻眼
const pause: Move[] = [
  { at: SMUG3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
  { at: SEE3, actor: 'bunny', do: 'flip' },
  { at: SEE3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
  { at: SEE3, actor: 'bunny', do: 'hop', amount: 4, dur: 0.28 },
  { at: SEE3 + 0.35, actor: 'bunny', do: 'shake', amount: 1, dur: 0.25 },
]
// 第 3 次：轟嘩！整個人被捲進浪裡轉好幾圈，衝浪板飛上天
const g3 = hit(W3, 2, { x: X + 4, y: S - 30 })
g3.moves.push(
  { at: W3 + 0.02, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/slip' },
  { at: W3 + 0.05, actor: 'bunny', do: 'spin', times: 3, dur: TUMBLE, pivot: 'center' },
  // 漂到左邊，暈暈地坐著（還是面向右邊的國字）
  { at: W3 + 0.05 + TUMBLE, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dizzy' },
)
g3.fx.push(
  { at: SEE3, kind: 'pop', actor: 'bunny', emoji: '❗', dx: 6, dy: 2 },
  { at: W3 + 0.05 + TUMBLE, kind: 'dizzy', actor: 'bunny', dur: 1.2 },
)
g3.cues.unshift({ at: RISE3, sfx: 'rumble' })
// 浪牆站起來的時候，浪頭一直噴白色浪花
for (const dt of [0.55, 0.35]) g3.fx.push({ at: W3 - dt, kind: 'burst', x: 112 - (0.55 - dt) * 40, y: S - 58, emoji: '💦', n: 5, dur: 0.35, scale: 1.1 })

// 第 4 次：最大的一道浪捲到她頭頂上……只滴下一小團浪花「啪」，她卻嚇得跳最高，一屁股跌坐在板子上
const g4: Gag = {
  moves: [
    { at: RISE4 + 0.2, actor: 'bunny', do: 'flip' },
    { at: RISE4 + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/scared' },
    { at: RISE4 + 0.25, actor: 'bunny', do: 'shake', amount: 1, dur: 0.35 },
    { at: LOOM4 - 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/duck' },
    { at: LOOM4 - 0.1, actor: 'bunny', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: PAT + 0.02, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: PAT + 0.03, actor: 'bunny', do: 'hop', amount: 16, dur: 0.38 },
    { at: LAND4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' },
  ],
  fx: [
    { at: PAT, kind: 'burst', x: X + 1, y: S - BS * 0.7, emoji: '💦', n: 5, dur: 0.4, scale: 1.1 },
    { at: PAT + 0.05, kind: 'pop', actor: 'bunny', emoji: '❗', dx: 6, dy: 2, dur: 0.5 },
    { at: LAND4, kind: 'sweat', actor: 'bunny', dx: 6, dur: 0.4 },
  ],
  camera: [
    { at: LOOM4 - 0.25, dur: 0.6, do: 'punch', amount: 0.05, to: { x: 96, y: 45 } },
    { at: PAT, dur: 0.3, do: 'shake', amount: 0.5 },
  ],
  cues: [{ at: RISE4, sfx: 'rumble' }, { at: LOOM4 - 0.33, sfx: 'whoosh' }, { at: PAT, sfx: 'tap' }, { at: PAT + 0.05, sfx: 'boing' }],
}

const TRACK_END = ASK - 0.02
const BOARD_FX = (at: number, dur: number): Fx[] => [
  { at, dur, kind: 'line', actor: 'tail', target: 'nose', color: '#F57C00', width: 3 },
  { at, dur, kind: 'line', actor: 'tail', target: 'nose', color: '#FFFFFF', width: 0.7 },
]

const clip: Clip = {
  format: 2,
  char: '浪',
  meta: { theme: '衝浪被浪托起來', cast: '兔子女孩＋衝浪板', gags: ['兔子女孩踩著衝浪板站在海上，一道浪從後面捲過來把她托起來，一道比一道高：小浪托高一點她晃一下站穩得意→中浪托到半空她手忙腳亂→停一拍她得意地等，回頭看到比天還高的大浪，被捲進浪裡轉好幾圈、板子飛上天；回馬槍是她抱著頭縮在板子上等最大的一道浪，浪頭捲到她頭頂上卻只滴下一小團浪花輕輕拍她一下，她嚇得跳最高、一屁股跌坐在板子上'] },
  duration: 15,
  // 淺藍的天、藍色的海（地板就是海面）
  bg: { top: '#BCE4FF', bottom: '#EAF7FF', floor: SEA, scenery: 'sea' },
  actors: [
    // 看不見的錨點：浪的線都掛在它身上（在 0,0，不會動）
    { id: 'water', emoji: '🟦', x: 0, y: 0, size: 1, hidden: true, float: true },
    // 衝浪板的兩頭（看不見），板子是從 tail 拉到 nose 的一條粗線
    { id: 'tail', emoji: '🟧', x: endAt(1)(0).x, y: endAt(1)(0).y, size: 1, hidden: true, float: true },
    { id: 'nose', emoji: '🟧', x: endAt(-1)(0).x, y: endAt(-1)(0).y, size: 1, hidden: true, float: true },
    { id: 'bunny', emoji: 'hero:bunny/hug', x: bunnyAt(0).x, y: bunnyAt(0).y, size: BS, float: true },
  ],
  moves: [
    ...track('bunny', bunnyAt, TRACK_END),
    ...track('tail', endAt(1), TRACK_END),
    ...track('nose', endAt(-1), TRACK_END),
    // 開場：踩著板子滑進來，抬頭指著字框「浪」，張開雙手站穩
    { at: 0.65, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 1.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/hug' },
    ...g1.moves,
    ...g2.moves,
    ...pause,
    ...g3.moves,
    // 語詞：踩著水衝過去、跳上漂回來的板子，浪把她托在中間，張開雙手
    { at: DASH0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: DASH1, actor: 'bunny', do: 'flip' },
    { at: DASH1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/hug' },
    { at: LIFT + 0.25, actor: 'bunny', do: 'hop', amount: 3, dur: 0.25 },
    // 浪放下她，回到老地方，學乖了
    { at: R4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    ...g4.moves,
    // 問他：從右邊跳回來，轉向國字、變大
    { at: ASK + 0.02, actor: 'bunny', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.05, actor: 'bunny', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'bunny', do: 'flip' },
    { at: ASK + 0.06, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: ASK + 0.1, actor: 'bunny', do: 'enter', from: { x: 200, y: ASK_AT.y }, arc: 6, dur: 0.45 },
    { at: ASK + 0.12, actor: 'bunny', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: ASK_SAY + 1.0, actor: 'bunny', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, actor: 'bunny', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ANSWER + 0.16, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'bunny', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds: [
    // 浪頭的白浪花濺起來：氵 → 良的上半 → 良的下半
    { at: W1 + 0.05, dur: 0.5, strokes: [0, 1, 2], from: { x: X - 12, y: S - 22 }, color: partColor('氵') },
    { at: W2 + 0.05, dur: 0.5, strokes: [3, 4, 5, 6], from: { x: X - 12, y: S - 36 }, color: partColor('良') },
    { at: W3 + 0.1, dur: 0.5, strokes: [7, 8, 9], from: { x: 84, y: S - 40 }, color: partColor('良') },
  ],
  glyph: [
    // 空字框一開始就讓到左上（浪都從右邊來）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給兔子女孩
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['bunny'], to: { x: 58, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...waveFx(ASK - 0.05),
    // 衝浪板（畫在浪上面）：開場滑進來到問他之前
    ...BOARD_FX(0, ASK - 0.03),
    ...g1.fx,
    ...g2.fx,
    ...g3.fx,
    { at: LIFT, kind: 'burst', x: WORD_X - 12, y: S - 32, emoji: '💦', n: 6, dur: 0.5, scale: 1.3 },
    ...g4.fx,
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把右邊的大浪切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: LIFT, dur: 0.6, do: 'punch', amount: 0.06, to: { x: WORD_X, y: 50 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '浪' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '浪' },
    { at: DASH1 - 0.05, sfx: 'boing' },
    { at: LIFT - 0.05, sfx: 'splash' },
    { at: SAY_WORD, say: '海浪' },
    ...g4.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '浪' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
