import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 都（v2）：楊捷睿小心翼翼地排骨牌，用手把最後一塊擺上去、閉眼鬆一口氣——窗外飄進來一隻小蝴蝶，輕輕停在第一塊上，
// 第一塊一歪，「喀喀喀喀——」一塊接一塊、從頭到尾全都倒了，一塊都沒剩。每次排得更長、倒得更久，他垮得一次比一次慘：
// 短短一排、他傻眼（耂從最後一塊飛出來）→ 一整排排到畫面另一頭、他一屁股跌坐（日）→ 先停一拍：蝴蝶又來了，他伸手「等一下！」、冒汗，
// 牠還是停上去；這次排得繞一個彎又繞回來，倒了好久，最後一塊停在他腳邊，他整個人趴下去（阝）。
// 回馬槍（第四次）：他學乖了，蝴蝶飛到第一塊上面他就伸手擋——蝴蝶轉身停在另一頭的最後一塊上；他得意，骨牌往遠處倒過去、
// 繞過彎又一路倒回來，最後第一塊倒在他身上，他也像一塊骨牌直直地倒下去——全都倒了（唸「全都」）。
// 最後畫面暗下來只剩「都」，楊捷睿站到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「都！」，然後退場只留字。
// 都、都、全都、這是什麼字？、都
const S = 36
const X = 42
const P = 77 - 0.42 * S

// ───────── 骨牌：程式畫的（tube），掛在一個看不見的錨上，不佔角色數 ─────────
/** 骨牌的長度、粗細 */
const L = 17
const W = 5.6
/** 玩具骨牌：後排紅黃輪流、轉角橘、前排藍綠輪流——一塊一塊倒的時候分得出是哪一塊，也看得出是繞一圈回來的兩排 */
const color = (i: number) => (i < 10 ? ['#FF6B6B', '#FFD43B'][i % 2] : i === 10 ? '#FF922B' : ['#4DABF7', '#69DB7C'][i % 2])
type Slot = { x: number; y: number; corner?: boolean }
/** 22 個位置：後排往右 10 塊（0–9）→ 右邊轉角 1 塊（10）→ 前排往左 11 塊（11–21，跟後排錯開；最後一塊比後排的第一塊更左邊，蝴蝶停上去才不會被後排擋住） */
const SLOTS: Slot[] = [
  ...Array.from({ length: 10 }, (_, i) => ({ x: 61 + 9.2 * i, y: 76.5 })),
  { x: 151, y: 81.5, corner: true },
  ...Array.from({ length: 11 }, (_, j) => ({ x: 146 - 9.36 * j, y: 87.5 })),
]
/** 每次排幾塊：短短一排 → 排到畫面另一頭 → 繞一個彎又繞回來（第四次一樣是 22 塊） */
const COUNT = [5, 10, 22, 22]
/** 一塊接一塊倒下去的間隔、每一塊倒多久 */
const G = 0.045
const FD = 0.13
/** 靠在下一塊上的角度、最後一塊整個躺平 */
const REST = 58
const FLAT = 86

type St = { vis: boolean; ang: number; lift: number }
type Op = { t: number; dur: number; to: Partial<St>; ease?: 'in' | 'linear' }
const ops: Op[][] = SLOTS.map(() => [])
const op = (i: number, t: number, dur: number, to: Partial<St>, ease: Op['ease'] = 'linear') => ops[i].push({ t, dur, to, ease })

function stateAt(i: number, now: number): St {
  let s: St = { vis: false, ang: 0, lift: 0 }
  for (const o of [...ops[i]].sort((a, b) => a.t - b.t)) {
    if (now < o.t) break
    const raw = o.dur > 0 ? Math.min(1, (now - o.t) / o.dur) : 1
    const p = o.ease === 'in' ? raw * raw : raw
    s = {
      vis: o.to.vis ?? s.vis,
      ang: o.to.ang === undefined ? s.ang : s.ang + (o.to.ang - s.ang) * p,
      lift: o.to.lift === undefined ? s.lift : s.lift + (o.to.lift - s.lift) * p,
    }
  }
  return s
}

/** 骨牌的底（圓頭剛好貼地）與頂：側面的往左右倒；轉角那塊往前（ang > 0）或往後（ang < 0）倒，看起來是縮短、斜斜躺下 */
function ends(i: number, s: St) {
  const sl = SLOTS[i]
  const base = { x: sl.x, y: sl.y - W / 2 - s.lift }
  const r = (Math.abs(s.ang) * Math.PI) / 180
  if (!sl.corner) {
    const a = (s.ang * Math.PI) / 180
    return { base, top: { x: base.x + Math.sin(a) * L, y: base.y - Math.cos(a) * L } }
  }
  const depth = s.ang >= 0 ? 0.35 : -0.3
  return { base, top: { x: base.x - 0.45 * L * Math.sin(r), y: base.y - L * Math.cos(r) + depth * L * Math.sin(r) } }
}

/** 照每塊骨牌的動作，每 1/30 秒取一次樣，一樣的連成一段，畫成 tube */
function dominoFx(end: number): Fx[] {
  const out: Fx[] = []
  const DT = 1 / 30
  SLOTS.forEach((_, i) => {
    let cur: { t: number; key: string; s: St } | undefined
    const flush = (t: number) => {
      if (cur && cur.s.vis) {
        const { base, top } = ends(i, cur.s)
        out.push({ at: cur.t, dur: Math.max(0.001, t - cur.t), kind: 'tube', actor: 'rb', dx: top.x, dy: top.y, to: base, color: color(i), width: W, n: L / 2 })
      }
    }
    for (let t = 0; t <= end + 1e-6; t += DT) {
      const s = stateAt(i, t)
      const key = s.vis ? `${s.ang.toFixed(1)}|${s.lift.toFixed(1)}` : 'x'
      if (cur && cur.key === key) continue
      flush(t)
      cur = { t, key, s }
    }
    flush(end)
  })
  return out
}

/** 骨牌的頂（筆畫從倒下去的最後一塊飛出來、蝴蝶停的地方） */
const topOf = (i: number, ang = 0) => ends(i, { vis: true, ang, lift: 0 }).top

// ───────── 蝴蝶：從左上角窗戶飄進來 ─────────
const BF = 13
const BF_OUT = { x: -14, y: 22 }
/** 停在第 i 塊上面時蝴蝶的位置（翅膀下緣貼著骨牌的頂） */
const perch = (i: number) => { const t = topOf(i); return { x: t.x, y: t.y - W / 2 - 0.42 * BF + 1.2 } }

type Gag = { moves: Move[]; fx: Fx[]; cues: Cue[]; camera: Camera[] }
const g: Gag = { moves: [], fx: [], cues: [], camera: [] }

/** 第一塊：他彎腰用手擺上去（從手上往下放），擺好閉眼鬆一口氣 */
function place(at: number) {
  g.moves.push(
    { at: at - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: at - 0.05, actor: 'yang', do: 'squash', amount: 0.1, dur: 0.25 },
    { at: at + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
  )
  op(0, at, 0, { vis: true, ang: 0, lift: 8 })
  op(0, at + 0.02, 0.13, { lift: 0 }, 'in')
  g.cues.push({ at: at + 0.15, sfx: 'tap' })
}

/** 蝴蝶從窗戶飄到 to（一路上下飄） */
function flyIn(at: number, to: { x: number; y: number }, dur = 0.45) {
  const mid = { x: (BF_OUT.x + to.x) / 2 + 4, y: Math.min(BF_OUT.y, to.y) - 6 }
  g.moves.push(
    { at, actor: 'bf', do: 'moveTo', to: mid, dur: dur * 0.5, ease: 'linear' },
    { at: at + dur * 0.5, actor: 'bf', do: 'moveTo', to, dur: dur * 0.5, ease: 'out' },
    { at, actor: 'bf', do: 'hop', amount: 2.5, dur: dur * 0.5 },
    { at: at + dur * 0.5, actor: 'bf', do: 'hop', amount: 2, dur: dur * 0.5 },
  )
}
/** 骨牌一歪，蝴蝶飛回窗外 */
function flyOut(at: number) {
  g.moves.push(
    { at, actor: 'bf', do: 'moveTo', to: { x: 30, y: 30 }, dur: 0.3, ease: 'out' },
    { at: at + 0.3, actor: 'bf', do: 'moveTo', to: BF_OUT, dur: 0.3, ease: 'in' },
    { at, actor: 'bf', do: 'hop', amount: 2.5, dur: 0.3 },
  )
}

/**
 * 「喀喀喀喀——」：從 order[0] 開始一塊接一塊倒下去（dir 是每一塊往哪邊倒：+1 右／轉角往前，-1 左／轉角往後），
 * 最後一塊整個躺平；每一塊一聲「喀」。回傳最後一塊躺平的時間。
 */
function chain(S0: number, order: number[], dir: (i: number) => number) {
  order.forEach((i, m) => {
    const t = S0 + m * G
    const last = m === order.length - 1
    const target = SLOTS[i].corner ? 90 : last ? FLAT : REST
    op(i, t, last ? 0.2 : FD, { ang: dir(i) * target }, 'in')
    g.cues.push({ at: t + 0.05, sfx: m % 4 === 3 ? 'clink' : 'tap' })
  })
  return S0 + (order.length - 1) * G + 0.2
}
const fwd = (i: number) => (i <= 10 ? 1 : -1)
const back = (i: number) => (i <= 10 ? -1 : 1)

/**
 * 同一個笑點：擺上第一塊、鬆一口氣 → 蝴蝶飄進來停在第一塊上 → 一塊接一塊全都倒了 →
 * 最後一塊躺平那一刻 💥（在地上，不蓋他的臉）＋推近＋震、他垮下來。k 是第幾次（0～2）。回傳最後一塊躺平的時間。
 * pause：第三次前停一拍（蝴蝶先停在第一塊上面飄、他伸手「等一下！」冒汗）。
 */
function topple(Pl: number, k: number, pause = 0) {
  place(Pl)
  const above = { x: perch(0).x, y: perch(0).y - 9 }
  flyIn(Pl + 0.12, pause ? above : perch(0), pause ? 0.4 : 0.42)
  let Ld = Pl + 0.55
  if (pause) {
    // 停一拍：他看到蝴蝶，伸手「等一下！」、冒汗；蝴蝶在第一塊上面飄
    g.moves.push(
      { at: Pl + 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
      { at: Pl + 0.5, actor: 'yang', do: 'shake', amount: 0.6, dur: pause },
      { at: Pl + 0.55, actor: 'bf', do: 'hop', amount: 2, dur: 0.22 },
      { at: Pl + 0.78, actor: 'bf', do: 'hop', amount: 2, dur: 0.22 },
      { at: Pl + 0.52 + pause - 0.12, actor: 'bf', do: 'moveTo', to: perch(0), dur: 0.15, ease: 'out' },
    )
    g.fx.push({ at: Pl + 0.45, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.4, dx: 6, scale: 1.3 }, { at: Pl + 0.6, kind: 'sweat', actor: 'yang', dx: 2 })
    Ld += pause
  }
  const S0 = Ld + 0.07
  flyOut(S0)
  g.cues.push({ at: Ld, sfx: 'blip' })
  const n = COUNT[k]
  const E = chain(S0, Array.from({ length: n }, (_, i) => i), fwd)
  const lastI = n - 1
  const lt = topOf(lastI, fwd(lastI) * FLAT)
  // 他傻眼，眼睛跟著一路看過去
  g.moves.push(
    { at: S0 + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: S0 + 0.05, actor: 'yang', do: 'hop', amount: 1.5 + k, dur: 0.2 },
    { at: S0 + 0.1, actor: 'yang', do: 'rotateTo', amount: 5 + 2 * k, dur: E - S0 - 0.1 },
    { at: E, actor: 'yang', do: 'rotateTo', amount: -(5 + 2 * k), dur: 0.12 },
  )
  // 垮下來：傻眼停住 → 一屁股跌坐 → 整個人趴下去
  if (k === 1) g.moves.push({ at: E + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' })
  // 第三次：最後一塊碰到他的腳，他往後一倒趴下去（讓開國字等一下回到中間的位置）
  if (k === 2) g.moves.push(
    { at: E + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: E + 0.05, actor: 'yang', do: 'moveTo', to: { x: X - 15, y: P }, dur: 0.2, ease: 'out' },
  )
  g.moves.push({ at: E, actor: 'yang', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.2 })
  const floorX = (SLOTS[lastI].x + lt.x) / 2
  g.fx.push({ at: E, kind: 'burst', x: floorX, y: SLOTS[lastI].y - 7, n: 1, dur: 0.4, scale: 0.9 + 0.3 * k })
  g.camera.push(
    { at: E, dur: 0.4, do: 'punch', amount: 0.05 + 0.04 * k, to: { x: (X + floorX) / 2, y: 62 } },
    { at: E, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  )
  g.cues.push({ at: E, sfx: 'bonk' })
  if (k >= 1) g.cues.push({ at: E + 0.05, sfx: 'deflate' })
  return E
}

/** 他把倒下去的骨牌一塊一塊扶起來（第一塊拿在手上，等一下再擺），新加的也排上去 */
function reset(at: number, k: number) {
  g.moves.push({ at, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' })
  op(0, at, 0, { vis: false, ang: 0 })
  const step = 0.24 / COUNT[k]
  for (let i = 1; i < COUNT[k]; i++) {
    const t = at + 0.03 + step * i
    if (i < COUNT[k - 1]) op(i, t, 0.07, { ang: 0 })
    else { op(i, t, 0, { vis: true, ang: 0, lift: 3 }); op(i, t + 0.01, 0.07, { lift: 0 }) }
    if (i % 3 === 0) g.cues.push({ at: t, sfx: 'blip' })
  }
  return at + 0.03 + 0.24 + 0.07
}

// 開場：前四塊已經排好，他走進來、指著字框唸「都」
for (let i = 1; i < COUNT[0]; i++) op(i, 0, 0, { vis: true, ang: 0, lift: 0 })

const P1 = 0.8
const E1 = topple(P1, 0)
const R2 = E1 + 0.4
const P2 = reset(R2, 1) + 0.02
const E2 = topple(P2, 1)
const R3 = E2 + 0.45
const P3 = reset(R3, 2) + 0.02
const E3 = topple(P3, 2, 0.4)

const builds: Build[] = [
  // 每次從倒下去的最後一塊飛出一組：耂 → 日 → 阝
  { at: E1 + 0.02, dur: 0.5, strokes: [0, 1, 2, 3], from: topOf(COUNT[0] - 1, FLAT), color: partColor('耂') },
  { at: E2 + 0.02, dur: 0.5, strokes: [4, 5, 6, 7], from: topOf(COUNT[1] - 1, FLAT), color: partColor('日') },
  { at: E3 + 0.02, dur: 0.45, strokes: [8, 9], from: topOf(COUNT[2] - 1, -FLAT), color: partColor('⻏') },
]
const FULL = E3 + 0.5
const HOME = FULL + 0.02
const PARK = HOME + 0.82

// 回馬槍（第四次）
const R4 = PARK - 0.25
const P4 = reset(R4, 3) + 0.02
place(P4)
const above4 = { x: perch(0).x, y: perch(0).y - 9 }
flyIn(P4 + 0.12, above4, 0.4)
/** 他伸手擋「等一下！」——蝴蝶轉個身，停到另一頭的最後一塊（前排最左邊） */
const BLOCK = P4 + 0.45
const L4 = BLOCK + 0.45
g.moves.push(
  { at: BLOCK, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
  { at: BLOCK + 0.05, actor: 'bf', do: 'hop', amount: 2, dur: 0.2 },
  { at: BLOCK + 0.18, actor: 'bf', do: 'moveTo', to: perch(21), dur: 0.27, ease: 'out' },
  { at: L4 + 0.03, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
)
g.fx.push({ at: BLOCK - 0.05, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.4, dx: 6, scale: 1.3 })
g.cues.push({ at: L4, sfx: 'blip' })
const S4 = L4 + 0.07
flyOut(S4)
/** 倒過來：前排往右倒過去 → 轉角往後 → 後排一路往左倒回來 → 第一塊倒在他身上 */
const ORDER4 = Array.from({ length: SLOTS.length }, (_, m) => SLOTS.length - 1 - m)
chain(S4, ORDER4, back)
/** 往回倒到轉角時他發現了 */
const SEE = S4 + 10 * G
/** 第一塊倒到他身上；他像一塊骨牌直直往後倒下去 */
const HIT = S4 + (SLOTS.length - 1) * G + 0.08
const THUD = HIT + 0.32
const ASK = 11.17
const ANSWER = ASK + 2.55
const OUT = ANSWER + 0.12

const clip: Clip = {
  format: 2,
  char: '都',
  meta: { theme: '排骨牌', cast: '楊捷睿＋小蝴蝶＋一整排骨牌', gags: ['楊捷睿小心翼翼排好骨牌、用手擺上第一塊、鬆一口氣，一隻小蝴蝶停在第一塊上，「喀喀喀」一塊接一塊全都倒了，一塊都沒剩；每次排得更長、倒得更久，他垮得一次比一次慘（短短一排傻眼→排到畫面另一頭一屁股跌坐→停一拍他伸手擋還是停上去、繞一個彎又繞回來，他趴下去）；回馬槍是他伸手擋住第一塊，蝴蝶改停在另一頭的最後一塊，他得意，骨牌繞一圈一路倒回來，第一塊倒在他身上，他也像骨牌一樣直直倒下去——全都倒了'] },
  duration: 15,
  // 室內：木地板上排骨牌，左上的窗戶飄進蝴蝶；字框在上方正中（背後是素色的牆）
  bg: { top: '#FFF4E0', bottom: '#FFFAF0', floor: '#E8C28A', scenery: 'room' },
  actors: [
    // 看不見的錨：骨牌的線都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    { id: 'yang', emoji: 'hero:yang/walk', x: X, y: P, size: S, flip: true },
    { id: 'bf', emoji: 'prop:butterfly', x: BF_OUT.x, y: BF_OUT.y, size: BF, float: true },
  ],
  moves: [
    // 開場：他走進來，指著字框「都！」
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    ...g.moves,
    // 第三次以後：趴著，國字回到中間、他爬起來
    { at: PARK - 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: PARK - 0.25, actor: 'yang', do: 'moveTo', to: { x: X, y: P }, dur: 0.22, ease: 'out' },
    // 回馬槍：骨牌往回倒到轉角，他發現了
    { at: SEE, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: SEE, actor: 'yang', do: 'hop', amount: 2.5, dur: 0.2 },
    { at: HIT, actor: 'yang', do: 'shake', amount: 1, dur: 0.1 },
    { at: HIT + 0.04, actor: 'yang', do: 'rotateTo', amount: -86, dur: 0.28, ease: 'in' },
    // 被推得腳往前滑一點，倒下去頭才不會出畫面
    { at: HIT + 0.04, actor: 'yang', do: 'moveTo', to: { x: X + 5, y: P }, dur: 0.28, ease: 'out' },
    // 問他：爬起來，站到左前方、變大，面向國字
    { at: ASK - 0.1, actor: 'yang', do: 'rotateTo', amount: 86, dur: 0.15 },
    { at: ASK - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK - 0.1, actor: 'yang', do: 'moveTo', to: { x: 34, y: P + 2 }, dur: 0.3 },
    { at: ASK, actor: 'yang', do: 'scaleTo', amount: 1.25, dur: 0.3, ease: 'back' },
    { at: ASK + 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.0, actor: 'yang', do: 'rotateTo', amount: 9, dur: 0.3 },
    { at: ASK + 1.5, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK + 1.95, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -9, dur: 0.1 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: OUT, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OUT, actor: 'yang', do: 'flip' },
    { at: OUT, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 2 }, dur: 0.15, ease: 'in' },
  ],
  builds,
  glyph: [
    // 字框一開始就在上方正中（背後是素色的牆）
    { at: 0, dur: 0, do: 'park', to: { x: 80, y: 21 }, amount: 0.5 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: { x: 80, y: 21 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的他
    { at: ASK, dur: 2.75, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.12, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.3, do: 'pulse' },
    { at: ANSWER + 0.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 骨牌（問他的時候收起來）
    ...dominoFx(ASK),
    ...g.fx,
    // 回馬槍：他像一塊骨牌倒下去「咚」
    { at: THUD, kind: 'burst', x: X + 2, y: 79, n: 1, dur: 0.4, scale: 1.4 },
    // 全都：每一塊（和他）一個接一個亮一下
    ...SLOTS.map((_, i): Fx => { const b = SLOTS[i], t = topOf(i, (i <= 10 ? -1 : 1) * REST); return { at: THUD + 0.05 + 0.02 * i, kind: 'burst', x: Math.min(144, (b.x + t.x) / 2), y: (b.y + t.y) / 2 - 3, emoji: '✨', n: 4, dur: 0.35, scale: 0.6 } }),
  ],
  camera: [
    // 整排骨牌一直留在畫面裡：國字拼好前不讓自動取景推近到只剩他
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    ...g.camera,
    { at: THUD, dur: 0.45, do: 'punch', amount: 0.14, to: { x: X - 6, y: 64 } },
    { at: THUD, dur: 0.35, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.18 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.45, say: '都' },
    ...g.cues,
    { at: HOME + 0.12, say: '都' },
    { at: THUD, sfx: 'bonk' },
    { at: THUD + 0.03, sfx: 'rumble' },
    { at: THUD - 0.06, say: '全都' },
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: ANSWER + 0.02, say: '都' },
    { at: ANSWER + 0.04, sfx: 'cheer' },
  ],
}

export default clip
