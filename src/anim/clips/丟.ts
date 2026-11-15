import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 丟（v2）：楊捷睿想把東西丟掉。每次把東西舉到頭上、身體往後仰到底，「咻」地用力丟出去，一道粗粗的拋物線飛出畫面——
// 狗狗警長耳朵一豎「❗」，咻地衝出去，一下子就叼著東西跑回來，「啪」放在他腳邊、開心地跳著等他再丟，楊捷睿傻眼（我是要丟掉啦！）。
// 一次比一次大、丟得一次比一次遠：小球（丿）→ 捏著鼻子丟臭襪子（土，從他用力一踩的腳下揚起來）→ 停一拍：他左看右看，趁警長睡著，
// 躡手躡腳溜出去、扛著大紙箱助跑、用盡全力丟到天上（厶）——警長眼睛一張，照樣叼回來，大紙箱頂在頭上、嘴裡還多叼了一顆球。
// 語詞那一刻他在中間舉著球，警長盯著球流口水：「丟球」。回馬槍（第四次）：他放棄了，隨手輕輕一丟，
// 警長衝出去，這次推回來一座小山：大沙發上疊著紙箱、臭襪子、球，他嚇得一屁股坐倒。
// 最後畫面暗下來只剩「丟」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再指著字說「丟！」，然後大家退場只留字。
// 丟、丟、丟球、這是什麼字？、丟

// ---- 角色的量法 ----
const ground = (s: number) => 77 - 0.42 * s
/** 楊捷睿：大，朝右丟 */
const YS = 40
const YY = ground(YS)
/** 狗狗警長：坐在右邊看著他 */
const DS = 36
const DY = ground(DS)
/** 丟的東西。臭襪子是 prop:sock（圖上自己冒三條臭氣線），thing 角色的 size 是 BALL，換成襪子時放大 SOCK ÷ BALL 倍 */
const BALL = 13, SOCK = 19, BOX = 24
const SOCK_K = SOCK / BALL
/** 回馬槍推回來的那一堆：prop:junk-pile（藍沙發上疊著紙箱、足球、襪子、雨傘），比楊捷睿高 */
const PILE = 60

/**
 * 楊捷睿各姿勢的手（量 public/hero/yang/*.png，flip 朝右以後離角色中心多遠，乘上 size）。
 * lift：雙手舉過頭（東西放在手上面）；stinky：捏鼻子，另一隻手把東西拎得遠遠的（朝右時在身後）；throw：手往前上方甩出去。
 */
const liftTop = (x: number, item: number, s = YS, y = ground(s)): Vec => ({ x: x - 0.01 * s, y: y - 0.45 * s - 0.38 * item })
const stinkHand = (x: number, s = YS, y = ground(s)): Vec => ({ x: x - 0.24 * s, y: y + 0.04 * s })
const throwHand = (x: number, s = YS, y = ground(s)): Vec => ({ x: x + 0.4 * s, y: y - 0.17 * s })
/** 平常站著，前面那隻手（朝右） */
const idleHand = (x: number, s = YS, y = ground(s)): Vec => ({ x: x + 0.22 * s, y: y + 0.2 * s })
/** 警長 dash（朝左跑）嘴巴前面叼著的東西 */
const mouth = (x: number, item: number): Vec => ({ x: x - 0.26 * DS - 0.3 * item, y: DY + 0.02 * DS })
/** 警長頭上（帽子上面）頂著的東西 */
const onHead = (x: number, item: number, dx = 0): Vec => ({ x: x + dx, y: DY - 0.43 * DS - 0.36 * item })

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera), cues: gs.flatMap((g) => g.cues),
})

/** 往後仰到底（預備）停多久才丟 */
const WIND = 0.4
/** 東西從手上飛出去之前（手甩到前面那一格） */
const LET = 0.05
/** 丟出去以後多久警長衝出去 */
const GO = 0.14
/** 警長從畫面外跑回來要多久 */
const RUN = 0.3
/** 傻眼停多久 */
const HOLD = 0.45
/** 拋物線的顏色（橘紅，淺色天空上看得清楚） */
const TRAIL = '#FF6A00'

/** moveTo（linear＋arc）在 p 時的位置：拋物線就照這個算，跟東西飛的路一模一樣 */
const along = (a: Vec, b: Vec, arc: number, p: number): Vec => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p - arc * Math.sin(Math.PI * p) })

/**
 * 同一個笑點的前半：「丟」。往後仰到底停住（預備，東西在 lift 的頭頂上或 stinky 拎著的手上）→
 * 丟出去那一格換 throw、身體往前甩、手甩過去的橘色弧線、鏡頭推近手＋震、同一個「咻」→ 東西沿著一道粗粗的橘色拋物線飛出畫面 →
 * 警長耳朵一豎（❗）、轉身衝出畫面（每次都一樣，同一個方向）。
 * x 是他站的地方、s 是他現在的大小、item 是丟的東西、wind 是預備的姿勢（null 就不後仰：隨手丟）。
 */
function toss(at: number, k: number, o: {
  x: number; s?: number; item: string; wind: 'lift' | 'stinky' | null; to: Vec; arc: number; fly: number; spin: number; dogX: number
  dogWakes?: boolean; carry?: string[]; fade?: number
}): Gag & { hand: Vec; foot: Vec } {
  const s = o.s ?? YS
  const y = ground(s)
  const hand = throwHand(o.x, s, y)
  const lean = o.wind ? 14 : 4
  const moves: Move[] = []
  if (o.wind) {
    moves.push(
      { at: at - WIND, actor: 'yang', do: 'swap', emoji: `hero:yang/${o.wind}` },
      { at: at - WIND, dur: 0.25, actor: 'yang', do: 'rotateTo', amount: -lean, ease: 'out' },
    )
  }
  moves.push(
    // 丟！手甩到前面、身體往前倒
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
    { at, dur: 0.1, actor: 'yang', do: 'rotateTo', amount: lean + 8, ease: 'in' },
    { at: at + 0.35, dur: 0.25, actor: 'yang', do: 'rotateTo', amount: -8 },
    // 東西到手上（手甩到前面的那一格），再沿著拋物線飛出畫面
    { at, dur: LET, actor: o.item, do: 'moveTo', to: hand, ease: 'linear' },
    { at: at + LET, dur: o.fly, actor: o.item, do: 'moveTo', to: o.to, arc: o.arc, ease: 'linear' },
    { at: at + LET, dur: o.fly, actor: o.item, do: 'rotateTo', amount: o.spin, ease: 'linear' },
    { at: at + LET + o.fly, dur: 0.01, actor: o.item, do: 'vanish' },
  )
  // 警長：耳朵一豎，轉身咻地衝出畫面（朝右，跟東西飛的方向一樣）；到畫面外再轉回來，準備跑回來
  if (o.dogWakes) moves.push({ at: at + 0.06, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' }, { at: at + 0.06, dur: 0.2, actor: 'dog', do: 'hop', amount: 4 })
  const go = at + GO + (o.dogWakes ? 0.12 : 0)
  moves.push(
    { at: go, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: go, actor: 'dog', do: 'flip' },
    { at: go + 0.02, dur: 0.3, actor: 'dog', do: 'moveTo', to: { x: 205, y: DY }, ease: 'in', anticipate: 3 },
    { at: go + 0.34, actor: 'dog', do: 'flip' },
  )
  // 頭上頂著的東西跟著一起衝出去
  for (const id of o.carry ?? []) moves.push({ at: go + 0.02, dur: 0.3, actor: id, do: 'moveTo', to: { x: 205, y: onHead(205, BOX).y }, ease: 'in', anticipate: 3 })

  // 拋物線：一段一段（虛線）跟著東西長出來，飛完以後一起淡掉
  const N = 9
  const from = hand
  const end = o.fade ?? at + LET + o.fly + 0.3
  const fx: Fx[] = []
  for (let i = 0; i < N; i++) {
    const a = along(from, o.to, o.arc, i / N), b = along(from, o.to, o.arc, (i + 0.62) / N)
    if (a.x > 163 || a.y < -3) continue
    const t0 = at + LET + o.fly * ((i + 0.62) / N) - 0.06
    fx.push({ at: t0, dur: end - t0, kind: 'line', actor: 'yang', dx: a.x - o.x, dy: a.y - y, to: b, color: TRAIL, width: 2.4 })
  }
  fx.push(
    // 手從後面甩到前面的弧線（同一個顏色）
    { at: at - 0.08, dur: 0.24, kind: 'swoosh', actor: 'yang', to: o.to, dx: 0, dy: -0.18 * s, n: 0.42 * s, sweep: 150, color: TRAIL, width: 3 },
    // 警長：❗（一次比一次大）
    { at: at + 0.04, dur: 0.3, kind: 'pop', actor: 'dog', emoji: '❗', dx: -4, scale: 1.4 + 0.15 * k },
  )
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.1 + 0.03 * k, to: { x: hand.x, y: hand.y + 4 } },
    { at: at + 0.02, dur: 0.25, do: 'shake', amount: 0.5 + 0.3 * k },
  ]
  // 同一個「咻」，一次比一次多疊一個音
  const cues: Cue[] = [{ at, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'slide' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
  cues.push({ at: go, sfx: 'blip' })
  return { moves, fx, camera, cues, hand, foot: { x: o.x + 0.2 * s, y: 74 } }
}

/**
 * 同一個笑點的後半：「撿回來」。警長叼著東西從右邊咻地跑回來（東西在嘴巴前面）、在他腳邊煞車，「啪」放下，
 * 開心地跳兩下等他再丟；楊捷睿傻眼停 HOLD 秒（一次比一次跳得高、冒汗）。
 * yx 是楊捷睿站的地方，item 是叼回來的東西（放在他腳邊），head 是頂在頭上帶回來的東西。
 */
function fetch(at: number, k: number, o: { yx: number; item: string; itemS: number; head?: string; gap?: number }): Gag & { dogX: number; drop: number } {
  const feet = o.yx + 0.36 * YS
  const dogX = feet + 0.26 * DS + 0.3 * o.itemS + (o.gap ?? 0)
  const start = 205
  const drop = at + RUN + 0.04
  const moves: Move[] = [
    { at, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at, dur: RUN, actor: 'dog', do: 'moveTo', to: { x: dogX, y: DY }, ease: 'out' },
    // 東西在嘴巴前面，跟著一起跑回來
    { at: at - 0.02, dur: 0.01, actor: o.item, do: 'moveTo', to: mouth(start, o.itemS) },
    { at: at - 0.01, dur: 0.01, actor: o.item, do: 'pop' },
    { at, dur: RUN, actor: o.item, do: 'moveTo', to: mouth(dogX, o.itemS), ease: 'out' },
    // 啪：放在他腳邊
    { at: drop, dur: 0.14 + 0.01 * (o.gap ?? 0), actor: o.item, do: 'moveTo', to: { x: feet, y: ground(BALL) }, arc: (o.gap ?? 0) * 0.4, ease: 'out' },
    // 開心地跳著搖尾巴，等他再丟
    { at: drop, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: drop + 0.06, dur: 0.2, actor: 'dog', do: 'hop', amount: 3 },
    { at: drop + 0.3, dur: 0.2, actor: 'dog', do: 'hop', amount: 3 },
    // 傻眼：我是要丟掉啦！
    { at: drop + 0.04, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: drop + 0.04, dur: 0.25, actor: 'yang', do: 'hop', amount: 2 + 2 * k },
  ]
  if (o.head) {
    moves.push(
      { at, dur: RUN, actor: o.head, do: 'moveTo', to: onHead(dogX, BOX, -3), ease: 'out' },
      { at: drop, dur: 0.1, actor: o.head, do: 'moveTo', to: onHead(dogX, BOX) },
      { at: drop + 0.06, dur: 0.2, actor: o.head, do: 'hop', amount: 3 },
      { at: drop + 0.3, dur: 0.2, actor: o.head, do: 'hop', amount: 3 },
    )
  }
  const fx: Fx[] = [
    { at: drop + 0.1, kind: 'sweat', actor: 'yang', dx: 6, dy: 3 },
    { at: drop + 0.05, dur: 0.5, kind: 'burst', actor: 'dog', emoji: '💕', n: 4, dx: 2 },
  ]
  const camera: Camera[] = [{ at: drop, dur: 0.2, do: 'shake', amount: 0.4 + 0.2 * k }]
  const cues: Cue[] = [{ at: at + RUN - 0.08, sfx: 'slide' }, { at: drop, sfx: 'plop' }]
  return { moves, fx, camera, cues, dogX, drop }
}

/** 撿起腳邊的東西、塞到身後，換成下一樣拿出來 */
function swapBehind(at: number, yx: number, next: string, to: Vec): Move[] {
  return [
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at, dur: 0.16, actor: 'thing', do: 'moveTo', to: { x: yx - 2, y: YY + 2 }, arc: 4 },
    { at: at + 0.17, actor: 'thing', do: 'swap', emoji: next },
    { at: at + 0.18, dur: 0.18, actor: 'thing', do: 'moveTo', to },
  ]
}

// ---- 場景 ----
/** 字框一開始就在左上角：東西都往右上飛、警長往右衝，不經過字框 */
const FRAME = { x: 22, y: 19 }
const FRAME_K = 0.46
/** 楊捷睿丟東西的位置、警長坐著等的位置 */
const X0 = 40
const DX = 100
/** 國字放大到中間時楊捷睿退到左邊 */
const XL = 17
/** 語詞那一刻：中間、放大 */
const XM = 66
const WK = 1.2

// ---- 時間表 ----
const R1 = 0.9
const g1 = toss(R1, 0, { x: X0, item: 'thing', wind: 'lift', to: { x: 200, y: 26 }, arc: 30, fly: 0.45, spin: 540, dogX: DX })
const F1 = R1 + 0.58
const f1 = fetch(F1, 0, { yx: X0, item: 'thing', itemS: BALL })
const N1 = f1.drop + 0.04 + HOLD
const R2 = N1 + 0.4 + WIND
const g2 = toss(R2, 1, { x: X0, item: 'thing', wind: 'stinky', to: { x: 200, y: 20 }, arc: 34, fly: 0.48, spin: 720, dogX: f1.dogX })
const F2 = R2 + 0.58
const f2 = fetch(F2, 1, { yx: X0, item: 'thing', itemS: SOCK })
const N2 = f2.drop + 0.04 + HOLD
/** 第三次前停一拍：塞好襪子、警長睡著了，他左看右看，躡手躡腳溜出去，扛著大紙箱助跑回來 */
const SNEAK = N2 + 0.55
const RUNUP = SNEAK + 0.28
const R3 = RUNUP + 0.45
const g3 = toss(R3, 2, { x: X0, item: 'box', wind: 'lift', to: { x: 175, y: -45 }, arc: 34, fly: 0.55, spin: 400, dogX: f2.dogX, dogWakes: true, fade: R3 + 0.5 })
/** 國字拼好（最後一組筆畫落定）→ 放大到中間 → 停 0.8 秒以上才讓位；警長這時候在畫面外撿東西 */
const HOME = R3 + 0.5
const PARK = HOME + 0.82
const F3 = PARK + 0.15
const f3 = fetch(F3, 2, { yx: XL, item: 'thing', itemS: BALL, head: 'box', gap: 12 })
const N3 = f3.drop + 0.04 + HOLD
/** 語詞那一刻：撿起球走到中間、放大，把球舉到頭上；警長頂著紙箱跟過來盯著球 */
const WORD = N3 + 0.35
const DXW = 104
/** 回馬槍：他放棄了，放下手、隨手輕輕一丟 */
const R4 = WORD + 0.75
const g4 = toss(R4, 3, { x: XM, item: 'thing', wind: null, to: { x: 205, y: 48 }, arc: 14, fly: 0.5, spin: 360, dogX: DXW, carry: ['box'] })
/** 警長推著一座小山回來：大沙發上疊著紙箱、球、臭襪子 */
const F4 = R4 + 0.6
const SX = 110
const DXP = SX + 0.426 * PILE + 6.5
const STOP = F4 + 0.42
const ASK = STOP + 0.75
const AX = 32
const ASK_S = 1.15
const ANSWER = ASK + 2.55
const END = ANSWER + 1.4

const clip: Clip = {
  format: 2,
  char: '丟',
  meta: { theme: '楊捷睿想把東西丟掉，狗狗警長每次都撿回來', cast: '楊捷睿＋狗狗警長＋球／臭襪子＋大紙箱＋大沙發', gags: ['楊捷睿把東西舉到頭上、往後仰到底，「咻」地用力丟出去（一道粗粗的拋物線飛出畫面），狗狗警長「❗」衝出去，一下子就叼回來放在他腳邊、開心地跳著等他再丟，他傻眼：小球→捏著鼻子丟臭襪子→停一拍，趁警長睡著扛大紙箱助跑丟上天，警長頂著紙箱、嘴裡還多叼一顆球回來；回馬槍是他放棄了隨手輕輕一丟，警長推回來一座小山（大沙發上疊著紙箱、臭襪子、球），他嚇得坐倒'] },
  duration: END,
  // 公園的草地：淡藍天空、綠地；橘紅的拋物線、紅外套、黃狗都跳得出來
  bg: { top: '#D8ECFF', bottom: '#F4FAFF', floor: '#BFE0A0', scenery: 'hills' },
  actors: [
    { id: 'pile', emoji: 'prop:junk-pile', x: 230, y: ground(PILE), size: PILE, hidden: true },
    { id: 'dog', emoji: 'hero:sheriff/idle', x: DX, y: DY, size: DS },
    // 丟的東西：球 → 臭襪子 → （回來的）球；畫在警長前面（叼在嘴裡）、楊捷睿後面（塞到身後）
    { id: 'thing', emoji: '⚾', x: -25 + 0.22 * YS, y: YY + 0.2 * YS, size: BALL, pivot: 'center', float: true },
    { id: 'box', emoji: 'prop:box', x: X0, y: liftTop(X0, BOX).y, size: BOX, pivot: 'center', float: true, hidden: true },
    { id: 'yang', emoji: 'hero:yang/walk', x: -25, y: YY, size: YS, flip: true },
  ],
  moves: [
    // 開場：楊捷睿拿著球走進來，警長坐在右邊看著他
    { at: 0, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: X0, y: YY }, ease: 'out' },
    { at: 0, dur: 0.4, actor: 'thing', do: 'moveTo', to: idleHand(X0), ease: 'out' },
    { at: 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 1 次：小球舉到頭上
    { at: R1 - WIND, dur: 0.2, actor: 'thing', do: 'moveTo', to: liftTop(X0, BALL), ease: 'out' },
    ...g1.moves,
    ...f1.moves,
    // 第 2 次：球塞到身後，拿出臭襪子、捏著鼻子拎得遠遠的
    ...swapBehind(N1, X0, 'prop:sock', stinkHand(X0)),
    { at: N1 + 0.17, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: SOCK_K },
    { at: N1 + 0.18, actor: 'yang', do: 'swap', emoji: 'hero:yang/stinky' },
    ...g2.moves,
    ...f2.moves,
    // 叼回來的時候 pop 把大小重設成 1：襪子再放大回來
    { at: F2 - 0.005, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: SOCK_K },
    // 第 3 次前停一拍：襪子塞到身後；警長等著等著睡著了
    { at: N2, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: N2, dur: 0.16, actor: 'thing', do: 'moveTo', to: { x: X0 - 2, y: YY + 2 }, arc: 4 },
    { at: N2 + 0.17, dur: 0.01, actor: 'thing', do: 'vanish' },
    { at: N2 + 0.05, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/sleep' },
    // 他左看右看（警長睡著了），躡手躡腳溜出左邊
    { at: N2 + 0.15, actor: 'yang', do: 'flip' },
    { at: N2 + 0.36, actor: 'yang', do: 'flip' },
    { at: SNEAK - 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: SNEAK - 0.12, actor: 'yang', do: 'flip' },
    { at: SNEAK - 0.1, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: -28, y: YY } },
    // 扛著大紙箱助跑回來
    { at: RUNUP, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: RUNUP, actor: 'yang', do: 'flip' },
    { at: RUNUP, dur: 0.33, actor: 'yang', do: 'moveTo', to: { x: X0, y: YY }, ease: 'in' },
    { at: RUNUP, dur: 0.33, actor: 'box', do: 'enter', from: { x: -28, y: liftTop(X0, BOX).y }, ease: 'in' },
    ...g3.moves,
    // 丟完得意地退到左邊（國字要放大到中間）
    { at: R3 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: R3 + 0.4, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: XL, y: YY } },
    // 警長頂著紙箱、叼著一顆球跑回來
    { at: F3 - 0.03, actor: 'thing', do: 'swap', emoji: '⚾' },
    { at: F3 - 0.02, dur: 0.01, actor: 'box', do: 'rotateTo', amount: -400 },
    { at: F3 - 0.02, dur: 0.01, actor: 'box', do: 'moveTo', to: onHead(205, BOX, -3) },
    { at: F3 - 0.01, dur: 0.01, actor: 'box', do: 'pop' },
    ...f3.moves,
    // 語詞那一刻：撿起球、走到中間變大，把球舉到頭上；警長頂著紙箱跟過來，盯著球流口水
    { at: N3, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: N3, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: XM, y: YY } },
    { at: N3, dur: 0.35, actor: 'thing', do: 'moveTo', to: idleHand(XM) },
    { at: N3 + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: N3 + 0.35, dur: 0.25, actor: 'yang', do: 'scaleTo', amount: WK, ease: 'back' },
    { at: N3 + 0.35, dur: 0.25, actor: 'thing', do: 'moveTo', to: liftTop(XM, BALL, YS * WK, YY), ease: 'back' },
    { at: N3 + 0.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: N3 + 0.1, dur: 0.4, actor: 'dog', do: 'moveTo', to: { x: DXW, y: DY } },
    { at: N3 + 0.1, dur: 0.4, actor: 'box', do: 'moveTo', to: onHead(DXW, BOX) },
    { at: N3 + 0.5, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/drool' },
    // 回馬槍：他放棄了，放下手、縮回來，隨手輕輕一丟
    { at: R4 - 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: R4 - 0.35, dur: 0.2, actor: 'yang', do: 'scaleTo', amount: 1 / WK },
    { at: R4 - 0.35, dur: 0.2, actor: 'thing', do: 'moveTo', to: idleHand(XM) },
    ...g4.moves,
    // 警長推著一座小山回來：一整堆（沙發上疊著紙箱、足球、臭襪子、雨傘）；頭上的紙箱已經疊進那一堆裡（在畫面外收掉）
    { at: F4, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/push' },
    { at: F4, dur: 0.01, actor: 'dog', do: 'moveTo', to: { x: 230 + 0.426 * PILE + 6.5, y: DY } },
    { at: F4, dur: 0.01, actor: 'box', do: 'vanish' },
    { at: F4 + 0.01, dur: 0.01, actor: 'pile', do: 'enter', from: { x: 230, y: ground(PILE) } },
    { at: F4 + 0.02, dur: 0.4, actor: 'pile', do: 'moveTo', to: { x: SX, y: ground(PILE) }, ease: 'out' },
    { at: F4 + 0.02, dur: 0.4, actor: 'dog', do: 'moveTo', to: { x: DXP, y: DY }, ease: 'out' },
    // 煞車：整堆往前一晃、彈一下，快要倒下來
    { at: STOP, dur: 0.3, actor: 'pile', do: 'tilt', amount: -6 },
    { at: STOP, dur: 0.28, actor: 'pile', do: 'squash', amount: 0.12 },
    { at: STOP, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: STOP + 0.1, dur: 0.2, actor: 'dog', do: 'hop', amount: 3 },
    { at: STOP + 0.4, dur: 0.2, actor: 'dog', do: 'hop', amount: 3 },
    // 他嚇得一屁股坐倒
    { at: STOP + 0.04, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: STOP + 0.04, dur: 0.25, actor: 'yang', do: 'hop', amount: 8 },
    { at: STOP + 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: STOP + 0.45, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: 26, y: YY }, arc: 4, ease: 'out' },
    // 問他：警長把小山拖走，楊捷睿走到左前方、變大
    { at: ASK, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/pull' },
    { at: ASK + 0.05, dur: 0.4, actor: 'dog', do: 'moveTo', to: { x: DXP + 110, y: DY }, ease: 'in' },
    { at: ASK + 0.05, dur: 0.4, actor: 'pile', do: 'moveTo', to: { x: SX + 110, y: ground(PILE) }, ease: 'in' },
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: AX, y: YY + 2 }, arc: 4, ease: 'out' },
    { at: ASK + 0.35, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.65, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 2.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.2, dur: 0.22, actor: 'yang', do: 'moveTo', to: { x: -45, y: YY + 2 }, ease: 'in' },
  ],
  builds: [
    // 每丟一次，筆畫就從丟出去的手上飛進字框：丿、土（從用力一踩的腳下揚起來）、厶
    { at: R1 + 0.02, dur: 0.45, strokes: [0], from: g1.hand, color: partColor('丿') },
    { at: R2 + 0.02, dur: 0.45, strokes: [1, 2, 3], from: g2.foot, color: partColor('土') },
    { at: R3 + 0.02, dur: 0.45, strokes: [4, 5], from: g3.hand, color: partColor('厶') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.85, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx, ...f1.fx,
    // 臭襪子：拎起來就冒臭氣
    { at: N1 + 0.3, dur: R2 - N1 - 0.3, kind: 'stink', actor: 'thing' },
    ...g2.fx,
    // 用力一踩：腳下揚起泥土（土）
    { at: R2, kind: 'puff', actor: 'yang', dur: 0.45 },
    ...f2.fx,
    // 停一拍：警長睡著了
    { at: N2 + 0.15, dur: R3 - N2 - 0.1, kind: 'zzz', actor: 'dog', dx: -4, dy: 2 },
    ...g3.fx,
    ...f3.fx,
    // 語詞那一刻：球閃一下，警長眼睛盯著球
    { at: WORD + 0.05, dur: 0.5, kind: 'burst', ...liftTop(XM, BALL, YS * WK, YY), n: 1, emoji: '🌟', scale: 1.2 },
    ...g4.fx,
    { at: STOP + 0.05, dur: 0.6, kind: 'burst', actor: 'dog', emoji: '💕', n: 5 },
    { at: STOP + 0.35, kind: 'sweat', actor: 'yang', dx: 6, dy: 3 },
  ],
  camera: [
    // 鏡頭固定在全景（東西會飛過整個畫面），只有丟出去那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g1.camera, ...f1.camera, ...g2.camera, ...f2.camera, ...g3.camera, ...f3.camera, ...g4.camera,
    { at: STOP, dur: 0.4, do: 'shake', amount: 1.8 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.45, say: '丟' },
    ...g1.cues, ...f1.cues, ...g2.cues, ...f2.cues, ...g3.cues,
    { at: HOME + 0.1, say: '丟' },
    ...f3.cues,
    { at: WORD, say: '丟球' },
    ...g4.cues,
    { at: F4 + 0.3, sfx: 'rumble' },
    { at: STOP, sfx: 'bonk' },
    { at: STOP + 0.05, sfx: 'boing' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '丟' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
