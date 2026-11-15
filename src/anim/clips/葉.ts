import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 葉（v2）：秋天，狗狗警長拿掃把「唰、唰、唰」把落葉掃成整整齊齊的一堆，閉眼得意、擦擦汗——
// 兔子女孩從右邊冒出來、蹲低、眼睛發亮，「蹦！」一道弧線撲進葉堆，「嘩——！」葉子炸開滿天飛，警長嚇得跳起來、全身被葉子淋，她在葉子裡哈哈笑。
// 同一個笑點，葉堆一次比一次大：到她膝蓋的小小一堆（葉子裡飛出艹）→ 跟警長一樣高（飛出世）→
// 先停一拍：比人還高的一大堆，警長左看右看、張開雙手擋在葉堆前面守著……她從畫面上面掉下來（飛出木）。
// 語詞那一刻一片大葉子飄到畫面中間：「葉子」。
// 回馬槍（第四次）：警長又掃好一堆，嘆口氣、把掃把一丟——自己助跑跳進去，兩個一起在葉子裡打滾（他是狗，其實他也好想跳）。
// 最後畫面暗下來只剩「葉」，兩個人問「這是什麼字？」，等他回答，再指著字說「葉！」，然後退場只留字。
// 刻意不跟「林」（追蝴蝶撞樹、樹葉掉下來）、「森」、「爬」撞：這支只演「掃成一堆→跳進去→葉子炸開」。
// 葉、葉、葉子、這是什麼字？、葉

/** 兩個明星一樣大 */
const S = 36
const PY = 77 - 0.42 * S
/** 警長每次都站在葉堆左邊掃（面向右）；葉堆在中間；兔子女孩每次都從右邊同一個地方起跳 */
const XS = 32
const XP = 82
const XB = 140
/** 字框一開始就在左上（太陽在右上），葉子炸開都往右上、正上方飛 */
const FRAME = { x: 21, y: 19 }
const FRAME_K = 0.42

/** 葉堆（橘紅色的落葉小山）：原本是綠色灌木叢的圖，轉成秋天的顏色。基本 size 12，每一次掃到 M 倍 */
const PILE = 12
const PILE_Y = 77 - 0.42 * PILE
/** 第幾次掃成多大：到她膝蓋 → 跟警長一樣高 → 比人還高 → 回馬槍跟警長一樣高 */
const M = [1.7, 4.2, 6.2, 4.2]
const pileTop = (k: number) => 74 - PILE * M[k] * 0.75
const TINT = 'hue-rotate(-82deg) saturate(1.5) brightness(1.02)'
/** 掃把（刷子在右下） */
const BROOM = 26
const BY = 77 - 0.42 * BROOM
const BX = (x: number) => x + 10

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }
const empty = (): Gag => ({ moves: [], fx: [], camera: [], cues: [], lights: [] })
const join = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera),
  cues: gs.flatMap((g) => g.cues), lights: gs.flatMap((g) => g.lights),
})

/** 一道拋物線：拆成一小段一小段直線（x 等速，y 照拋物線） */
function arcPath(actor: string, at: number, dur: number, from: Vec, to: Vec, yPeak: number): Move[] {
  const N = 10, out: Move[] = []
  for (let i = 1; i <= N; i++) {
    const s = i / N
    const base = from.y + (to.y - from.y) * s
    const lift = (Math.min(from.y, to.y) - yPeak) * 4 * s * (1 - s)
    out.push({ at: at + (dur / N) * (i - 1), dur: dur / N, actor, do: 'moveTo', to: { x: from.x + (to.x - from.x) * s, y: base - lift }, ease: 'linear' })
  }
  return out
}

/**
 * 掃：唰、唰、唰（每一下掃把往前推、一串落葉從地上飛進葉堆、葉堆長大一截、同一個「唰」）。
 * 第一下葉堆冒出來，後兩下各長 √M 倍。strokes 是掃幾下（回馬槍掃兩下就好）。
 */
function sweep(t0: number, k: number, strokes = 3, gap = 0.25): Gag {
  const g = empty()
  g.moves.push({ at: t0 - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/push' })
  const grow = Math.pow(M[k], 1 / (strokes - 1))
  for (let i = 0; i < strokes; i++) {
    const at = t0 + i * gap
    g.moves.push(
      { at, dur: 0.1, actor: 'broom', do: 'moveTo', to: { x: BX(XS) + 6, y: BY }, ease: 'out' },
      { at, dur: 0.1, actor: 'broom', do: 'rotateTo', amount: 14, ease: 'out' },
      { at: at + 0.1, dur: 0.12, actor: 'broom', do: 'moveTo', to: { x: BX(XS), y: BY } },
      { at: at + 0.1, dur: 0.12, actor: 'broom', do: 'rotateTo', amount: -14 },
      { at, dur: 0.16, actor: 'sheriff', do: 'tilt', amount: 6 },
      i === 0
        ? { at: at + 0.12, dur: 0.18, actor: 'pile', do: 'pop' }
        : { at: at + 0.12, dur: 0.18, actor: 'pile', do: 'scaleTo', amount: grow, ease: 'back' },
    )
    // 一串落葉貼著地面被掃進葉堆
    g.fx.push({ at, dur: 0.3, kind: 'blow', x: BX(XS) + 8, y: 70, to: { x: XP - 6, y: 66 }, emoji: '🍂', n: 4 })
    g.cues.push({ at, sfx: 'slide' })
  }
  return g
}

/** 掃好了：閉眼得意、擦擦汗（閉著眼睛，沒看到右邊的她） */
function proud(at: number): Gag {
  const g = empty()
  g.moves.push({ at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' })
  g.fx.push({ at: at + 0.05, kind: 'sweat', actor: 'sheriff', dx: -4 })
  g.cues.push({ at, sfx: 'tap' })
  return g
}

/** 兔子女孩從右邊衝進來、蹲低預備（眼睛發亮、一抖一抖） */
function ready(at: number, k: number): Gag {
  const g = empty()
  g.moves.push(
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    k === 0
      ? { at, dur: 0.2, actor: 'bunny', do: 'enter', from: { x: 178, y: PY }, ease: 'out' }
      : { at, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: XB, y: PY }, ease: 'out' },
    { at: at + 0.22, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: at + 0.3, dur: 0.25, actor: 'bunny', do: 'shake', amount: 0.4 + 0.2 * k },
  )
  g.fx.push({ at: at + 0.24, dur: 0.4, kind: 'pop', actor: 'bunny', emoji: '✨', dx: -14, dy: 6, scale: 1.3 })
  g.cues.push({ at: at + 0.22, sfx: 'tap' })
  return g
}

/**
 * 嘩——！她撲進葉堆那一刻（每一次都一樣）：葉堆不見、落葉往上往四面炸開、飄一下才落下來，同一個「噗」（一次多疊一個音），
 * 鏡頭推一下＋震；警長嚇得跳起來傻眼、被葉子淋一身，停 0.5 秒；她在葉子裡哈哈笑。k 越大炸得越大。
 */
function boom(at: number, k: number, sheriffTurns = false): Gag {
  const g = empty()
  const top = pileTop(Math.min(k, 3))
  g.moves.push(
    { at, dur: 0.12, actor: 'pile', do: 'vanish' },
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, dur: 0.4, actor: 'sheriff', do: 'hop', amount: 4 + 3 * Math.min(k, 2) },
    { at: at + 0.18, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/laugh' },
    { at: at + 0.18, dur: 0.3, actor: 'bunny', do: 'hop', amount: 2 },
  )
  if (sheriffTurns) g.moves.push({ at, actor: 'sheriff', do: 'flip' })
  const s = 1 + 0.25 * k
  g.fx.push(
    // 往上噴、散開、被拉回來
    { at, dur: 1.0, kind: 'fountain', x: XP + 4, y: 52, emoji: '🍂', n: 9 + 2 * k, scale: 1.6 + 0.2 * k },
    // 一圈往四面八方
    { at, dur: 0.75, kind: 'burst', x: XP + 6, y: Math.max((top + 74) / 2, 50), emoji: '🍂', n: 10 + 2 * k, scale: Math.min(1.7 * s, 2.6) },
    // 💥 在葉堆頂上（她的頭上面），不蓋住她的臉
    { at, dur: 0.35, kind: 'burst', x: XP + 6, y: Math.min(top + 2, 36), n: 1, scale: 1.3 + 0.25 * k },
    // 飄下來淋在警長身上
    { at: at + 0.2, dur: 1.0, kind: 'rain', actor: 'sheriff', emoji: '🍂', n: 6 + k, dy: -8, scale: 1.4 },
  )
  g.camera.push(
    { at, dur: 0.4, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: XP, y: 55 } },
    { at, dur: 0.35, do: 'shake', amount: 0.9 + 0.45 * k },
  )
  // 淡淡的白光：不要把主角刷白
  g.lights.push({ at, dur: 0.04, level: -0.06 }, { at: at + 0.04, dur: 0.18, level: 0 })
  g.cues.push({ at, sfx: 'poof' })
  if (k >= 1) g.cues.push({ at: at + 0.04, sfx: 'whoosh' })
  if (k >= 2) g.cues.push({ at: at + 0.08, sfx: 'rumble' })
  return g
}

/** 一整次：掃（唰×3）→ 得意擦汗 → 她衝進來蹲低 → 蹦！弧線撲進葉堆 → 嘩！ */
const FLY = 0.42
function round(t0: number, k: number, peak: number) {
  const done = t0 + 0.75
  const rd = t0 + 0.55
  const go = rd + 0.6
  const land = go + FLY
  const leap: Gag = { ...empty(), moves: [
    { at: go, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    ...arcPath('bunny', go, FLY, { x: XB, y: PY }, { x: XP + 2, y: PY }, peak),
  ], cues: [{ at: go, sfx: 'boing' }], fx: [{ at: go, dur: 0.4, kind: 'puff', x: XB, y: 70 }] }
  return { g: join(sweep(t0, k), proud(done), ready(rd, k), leap, boom(land, k)), land, done }
}

/** 笑完：她轉身咻地跑出右邊；警長回到 idle */
function reset(at: number): Move[] {
  return [
    { at, actor: 'bunny', do: 'flip' },
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: 185, y: PY }, ease: 'in' },
    { at: at + 0.26, actor: 'bunny', do: 'flip' },
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
  ]
}

// ---- 時間表 ----
const r1 = round(0.7, 0, 40)
const r2 = round(2.75, 1, 30)
/** 第三次：比人還高的一大堆。掃完不得意了——左看右看、走到葉堆右邊張開雙手守著……她從上面掉下來 */
const T3 = 4.85
const s3 = sweep(T3, 2)
const LOOK = T3 + 0.8
const GUARD = LOOK + 0.45
const GX = 126
const GO3 = GUARD + 0.55
const LAND3 = GO3 + 0.38
const b3 = boom(LAND3, 2, true)
/** 拼好：國字放大到中間；警長拿掃把走回左邊，她站右邊 */
const HOME = LAND3 + 0.85
const PARK = HOME + 0.7
/** 語詞那一刻：一片大葉子飄到畫面中間 */
const WORD = PARK + 0.4
/** 回馬槍：又掃好一堆，嘆口氣、把掃把一丟，自己助跑跳進去；她也一起跳 */
const T4 = WORD + 0.45
const s4 = sweep(T4, 3, 2, 0.2)
const SIGH = T4 + 0.35
const THROW = SIGH + 0.25
const RUN4 = THROW + 0.15
const GO4 = RUN4 + 0.12
const LAND4 = GO4 + 0.36
const b4 = boom(LAND4, 3)
const ASK = LAND4 + 0.45
/** 問句唸完（0.97 秒）再安靜 1.5 秒以上才回答 */
const ANSWER = ASK + 0.05 + 0.974 + 1.53
/** 問他：兩個人放大，分站國字兩邊 */
const AS = 1.22
const APY = 77 - 0.42 * S * AS
const LEAF = 40

const clip: Clip = {
  format: 2,
  char: '葉',
  meta: { theme: '狗狗警長掃落葉，兔子女孩撲進葉堆', cast: '狗狗警長＋兔子女孩＋落葉堆＋掃把＋大葉子', gags: ['狗狗警長唰唰唰把落葉掃成整整齊齊的一堆、閉眼得意擦汗，兔子女孩從右邊衝進來蹲低、眼睛發亮，蹦地一道弧線撲進葉堆，嘩——葉子炸開滿天飛，警長嚇得跳起來、被葉子淋一身，她在葉子裡哈哈笑；葉堆一次比一次大（到她膝蓋→跟警長一樣高→停一拍：比人還高的一大堆，警長左看右看、張開雙手守在前面，她卻從上面掉下來）；回馬槍是警長又掃好一堆，嘆口氣把掃把一丟，自己助跑跳進去，兩個一起在葉子裡打滾'] },
  duration: 15,
  // 秋天：暖黃的天空、黃綠的草地（橘紅的落葉看得清楚）；太陽在右上，字框在左上
  bg: { top: '#FFE2B8', bottom: '#FFF6E6', floor: '#C6D98A', scenery: 'hills' },
  actors: [
    { id: 'pile', emoji: 'prop:bush', x: XP, y: PILE_Y, size: PILE, hidden: true, tint: TINT },
    { id: 'leaf', emoji: '🍂', x: 80, y: -25, size: LEAF, float: true, pivot: 'center', hidden: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: XS, y: PY, size: S, hidden: true, flip: true },
    { id: 'broom', emoji: '🧹', x: BX(XS), y: BY, size: BROOM, hidden: true, flip: true },
    { id: 'bunny', emoji: 'hero:bunny/dash', x: XB, y: PY, size: S, hidden: true },
  ],
  moves: [
    // 開場：警長扛著掃把走進來，抬頭看字框——葉！
    { at: 0, dur: 0.45, actor: 'sheriff', do: 'enter', from: { x: -25, y: PY }, ease: 'out' },
    { at: 0, dur: 0.45, actor: 'broom', do: 'enter', from: { x: BX(-25), y: BY }, ease: 'out' },
    { at: 0.47, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    // 第一次：小小一堆
    ...r1.g.moves,
    ...reset(r1.land + 0.5),
    // 第二次：跟警長一樣高
    ...r2.g.moves,
    ...reset(r2.land + 0.5),
    // 第三次：比人還高
    ...s3.moves,
    { at: T3 + 0.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 停一拍：左看、右看（她會從哪裡來？）
    { at: LOOK, actor: 'sheriff', do: 'flip' },
    { at: LOOK + 0.22, actor: 'sheriff', do: 'flip' },
    // 走到葉堆右邊（她每次來的那一邊），張開雙手守著
    { at: GUARD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: GUARD, dur: 0.3, actor: 'sheriff', do: 'moveTo', to: { x: GX, y: PY } },
    { at: GUARD, dur: 0.3, actor: 'broom', do: 'moveTo', to: { x: BX(GX), y: BY } },
    { at: GUARD + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/hug' },
    { at: GUARD + 0.32, dur: 0.2, actor: 'sheriff', do: 'hop', amount: 1.5 },
    // 她從畫面上面掉下來，撲進葉堆
    { at: GO3 - 0.01, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: GO3 - 0.01, dur: 0.01, actor: 'bunny', do: 'moveTo', to: { x: XP - 4, y: -30 } },
    { at: GO3, dur: LAND3 - GO3, actor: 'bunny', do: 'moveTo', to: { x: XP + 2, y: PY }, ease: 'linear' },
    ...b3.moves,
    // 炸完：她跳到右邊、警長拿掃把咻地走回左邊，國字才放大（不從字前面經過）
    { at: LAND3 + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: LAND3 + 0.5, dur: 0.32, actor: 'sheriff', do: 'moveTo', to: { x: XS, y: PY } },
    { at: LAND3 + 0.5, dur: 0.32, actor: 'broom', do: 'moveTo', to: { x: BX(XS), y: BY } },
    { at: LAND3 + 0.83, actor: 'sheriff', do: 'flip' },
    { at: LAND3 + 0.83, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: LAND3 + 0.5, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: 128, y: PY }, arc: 6 },
    { at: LAND3 + 0.8, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 語詞那一刻：一片大葉子從上面飄下來，停在畫面中間——葉子！
    { at: PARK - 0.2, dur: 0.01, actor: 'leaf', do: 'moveTo', to: { x: 182, y: 58 } },
    { at: PARK - 0.19, dur: 0.01, actor: 'leaf', do: 'pop' },
    { at: PARK - 0.18, dur: 0.55, actor: 'leaf', do: 'moveTo', to: { x: 80, y: 52 }, arc: -4, ease: 'out' },
    { at: PARK - 0.2, dur: 0.6, actor: 'leaf', do: 'rotateTo', amount: 30, ease: 'out' },
    { at: WORD, dur: 0.3, actor: 'leaf', do: 'scaleTo', amount: 1.25, ease: 'back' },
    { at: WORD, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: WORD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: WORD, dur: 0.3, actor: 'bunny', do: 'hop', amount: 4 },
    // 回馬槍：大葉子飄走，警長又掃好一堆
    { at: T4 - 0.15, dur: 0.4, actor: 'leaf', do: 'moveTo', to: { x: 215, y: 8 }, ease: 'in' },
    { at: T4 - 0.15, dur: 0.4, actor: 'leaf', do: 'rotateTo', amount: 160, ease: 'in' },
    { at: T4 - 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    ...s4.moves,
    // 嘆口氣（看著葉堆好想跳）……把掃把一丟！
    { at: SIGH, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    { at: SIGH, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: THROW, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
    { at: THROW, dur: 0.35, actor: 'broom', do: 'moveTo', to: { x: -25, y: 70 }, arc: 3, ease: 'out' },
    { at: THROW, dur: 0.35, actor: 'broom', do: 'rotateTo', amount: -540, ease: 'out' },
    // 汪！助跑、跳進去；她也一起跳
    { at: RUN4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: RUN4, dur: 0.12, actor: 'sheriff', do: 'moveTo', to: { x: 50, y: PY }, ease: 'in' },
    { at: GO4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    ...arcPath('sheriff', GO4, LAND4 - GO4, { x: 50, y: PY }, { x: XP - 10, y: PY }, 46),
    { at: GO4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    ...arcPath('bunny', GO4, LAND4 - GO4, { x: 124, y: PY }, { x: XP + 12, y: PY }, 46),
    ...b4.moves,
    // 兩個一起在葉子裡打滾
    { at: LAND4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: LAND4 + 0.05, dur: 0.4, actor: 'sheriff', do: 'spin', times: 1, pivot: 'center' },
    { at: LAND4 + 0.05, dur: 0.4, actor: 'sheriff', do: 'hop', amount: 4 },
    { at: LAND4 + 0.05, dur: 0.4, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: PY } },
    { at: LAND4 + 0.1, dur: 0.4, actor: 'bunny', do: 'spin', times: -1, pivot: 'center' },
    { at: LAND4 + 0.1, dur: 0.4, actor: 'bunny', do: 'hop', amount: 4 },
    { at: LAND4 + 0.1, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: 134, y: PY } },
    // 問他：兩個人分站國字兩邊、放大，轉向觀眾
    // 國字到正中央以後才放大（放大時國字已經在中間，不會斜切過他們的頭）
    { at: ASK + 0.45, dur: 0.25, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: APY }, ease: 'out' },
    { at: ASK + 0.45, dur: 0.25, actor: 'sheriff', do: 'scaleTo', amount: AS },
    { at: ASK + 0.45, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: 134, y: APY }, ease: 'out' },
    { at: ASK + 0.45, dur: 0.25, actor: 'bunny', do: 'scaleTo', amount: AS },
    { at: ASK + 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.55, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
    { at: 12.65, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 13.05, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 7 },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.12, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: ANSWER + 0.12, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ANSWER + 0.12, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: -40, y: APY }, ease: 'in' },
    { at: ANSWER + 0.12, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: 200, y: APY }, ease: 'in' },
  ],
  builds: [
    // 每一次葉子炸開，就從飛散的葉子裡飛出一組筆畫
    { at: r1.land + 0.05, dur: 0.45, strokes: [0, 1, 2, 3], from: { x: XP + 4, y: 56 }, color: partColor('艹') },
    { at: r2.land + 0.05, dur: 0.5, strokes: [4, 5, 6, 7, 8], from: { x: XP + 4, y: 48 }, color: partColor('世') },
    { at: LAND3 + 0.05, dur: 0.45, strokes: [9, 10, 11, 12], from: { x: XP + 4, y: 42 }, color: partColor('木') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    // 先讓到上方正中、再縮進左上角（不從警長頭上斜切過去）
    { at: PARK, dur: 0.3, do: 'park' },
    { at: PARK + 0.3, dur: 0.3, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['sheriff', 'bunny'], to: { x: 80, y: 42 }, amount: 0.78 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...r1.g.fx,
    ...r2.g.fx,
    ...s3.fx,
    { at: LOOK, kind: 'sweat', actor: 'sheriff', dx: -4 },
    { at: GUARD + 0.3, dur: 0.6, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: 2, scale: 1.3 },
    ...b3.fx,
    { at: WORD, dur: 0.6, kind: 'burst', x: 80, y: 50, n: 8, emoji: '✨', scale: 1.6 },
    ...s4.fx,
    { at: SIGH, kind: 'sweat', actor: 'sheriff', dx: -4 },
    { at: RUN4, dur: 0.3, kind: 'puff', actor: 'sheriff' },
    ...b4.fx,
    { at: ANSWER, dur: 0.3, kind: 'burst', x: 80, y: 40, emoji: '🌟', n: 10 },
  ],
  camera: [
    // 鏡頭鎖全景（她會從畫面頂掉下來、葉子滿天飛），只有撲進去那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...r1.g.camera,
    ...r2.g.camera,
    ...b3.camera,
    ...b4.camera,
  ],
  lights: [
    ...r1.g.lights,
    ...r2.g.lights,
    ...b3.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...b4.lights,
  ],
  cues: [
    { at: 0.5, say: '葉' },
    ...r1.g.cues,
    ...r2.g.cues,
    ...s3.cues,
    { at: LOOK, sfx: 'gulp' },
    { at: GO3, sfx: 'whoosh' },
    ...b3.cues,
    { at: HOME + 0.1, say: '葉' },
    { at: WORD, say: '葉子' },
    ...s4.cues,
    { at: THROW, sfx: 'whoosh' },
    { at: GO4, sfx: 'boing' },
    ...b4.cues,
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '葉' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
