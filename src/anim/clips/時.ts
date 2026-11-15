import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 時（v2）：豬探長睡眼惺忪站在床邊，旁邊是一個大大的紅色鬧鐘。紅色的秒針「答、答、答」走到整點——「鈴鈴鈴！」鬧鐘左右狂抖、
// 兩個鈴鐺冒聲波線，豬探長伸手要按掉——鬧鐘兩隻小腳一蹬「嘿」地跳開，他拍了個空「啪」，鬧鐘在旁邊繼續響、得意地扭（日從鬧鐘飛出來）。
// 一次比一次用力：伸手按 → 整個人撲過去趴在地上（土）→ 先停一拍：拿捕蟲網躡手躡腳靠近，秒針停住好像沒發現……答！鈴鈴鈴！
// 網子蓋下去，鬧鐘鑽出來跳到他頭上繼續響（寸）。語詞那一刻鬧鐘在畫面中間放大、秒針指著整點亮一下：時間。
// 回馬槍（第四次）：他放棄了，抱著頭蹲下——鈴鈴鈴響完，鬧鐘自己「喀」地按掉自己，走過來靠在他身上睡著了；換他眼睛睜得大大的。
// 最後畫面暗下來只剩「時」，豬探長問「這是什麼字？」，手放耳邊等他回答，再指著字說「時！」，然後退場只留字。
// 時、時、時間、這是什麼字？、時

/** 豬探長（size 38）、鬧鐘（size 36）都站在地上 */
const SP = 38
const P = 77 - 0.42 * SP
const SC = 36
const C = 77 - 0.42 * SC
/** 豬探長平常站的地方（圖朝左，flip 朝右看鬧鐘）、鬧鐘平常在的地方（畫面中間）、鬧鐘每次跳去的地方（右邊） */
const PX = 56
const X0 = 90
const X1 = 130
/** 鬧鐘跳到他頭上時的位置（第 3 次） */
const HEAD: Vec = { x: PX - 1, y: P - 25 }
/** 語詞那一刻、回馬槍：鬧鐘在正中間放大 */
const MID = 80
const BIG = 1.3

/**
 * 鐘面（prop:alarm-face，沒有指針的鬧鐘；圖上的比例，以 size 為單位）：鐘面中心在圖中心往下 0.072（白色鐘面半徑 0.313）、秒針長 0.25；
 * 兩個鈴鐺在中心左右 0.215、往上 0.275。時針、分針、秒針都是程式畫的
 */
const FACE_DY = 0.072
const HAND_L = 0.25
const BELL_DX = 0.215
const BELL_DY = -0.275
const HAND_COLOR = '#E8102B'
/** 時針、分針：黑色，一直指著七點整（分針十二點、時針七點），鬧鐘就是七點響的 */
const MIN_L = 0.235
const HOUR_L = 0.15
const HOUR_DEG = 210
const BLACK = '#2A2A33'
const WAVE_COLOR = '#2A2A33'

/** 鬧鐘站在 (x, y)、放大 s 倍時，圖上 (rx, ry)（以 size 為單位）那一點在畫面上的位置；放大是以腳底為準 */
const onClock = (x: number, y: number, s: number, rx: number, ry: number): Vec =>
  ({ x: x + s * rx * SC, y: y + 0.42 * SC + s * (ry * SC - 0.42 * SC) })
/** 同一點寫成 line 效果的起點偏移（line 從角色當下的 x、y 加 dx／dy 畫起） */
const offClock = (x: number, y: number, s: number, rx: number, ry: number) => {
  const p = onClock(x, y, s, rx, ry)
  return { dx: p.x - x, dy: p.y - y }
}

type Spot = { x: number; y: number; s: number }
/** 紅色秒針：deg 是角度（0 是十二點，順時針為正） */
function hand(at: number, dur: number, deg: number, w: Spot, glow = false): Fx[] {
  const r = (deg * Math.PI) / 180
  const o = offClock(w.x, w.y, w.s, 0, FACE_DY)
  const c = onClock(w.x, w.y, w.s, 0, FACE_DY)
  const L = HAND_L * SC * w.s
  const to = { x: c.x + L * Math.sin(r), y: c.y - L * Math.cos(r) }
  const out: Fx[] = [{ at, dur, kind: 'line', actor: 'clock', ...o, to, color: HAND_COLOR, width: 1.7 * w.s }]
  if (glow) out.unshift({ at, dur, kind: 'line', actor: 'clock', ...o, to, color: '#FFE066', width: 4 * w.s })
  return out
}

/**
 * 時針、分針跟著鬧鐘走：face 是一個看不見的錨點，一直待在鐘面中心（鬧鐘每一個會搬動位置的動作都照抄一份，見檔尾 faceMoves）。
 * 線從指針尖（face ＋ 偏移）畫到 face，所以鬧鐘跳、搬、彈的時候指針都跟著。放大 s 倍、整個鬧鐘轉 rot 度時指針跟著放大、轉。
 */
function clockHands(at: number, dur: number, s: number, rot = 0): Fx[] {
  const tip = (deg: number, L: number) => {
    const r = ((deg + rot) * Math.PI) / 180
    return { dx: L * SC * s * Math.sin(r), dy: -L * SC * s * Math.cos(r) }
  }
  return [
    { at, dur, kind: 'line', actor: 'face', ...tip(HOUR_DEG, HOUR_L), target: 'face', color: BLACK, width: 2.3 * s },
    { at, dur, kind: 'line', actor: 'face', ...tip(0, MIN_L), target: 'face', color: BLACK, width: 1.5 * s },
  ]
}

/**
 * 「鈴鈴鈴」：兩個鈴鐺往外冒三道聲波線，每 0.12 秒換一長一短（看起來在抖）。k 越大線越長。
 * 線的起點跟著鬧鐘抖，終點留在原地，抖起來像在震。
 */
function waves(at: number, dur: number, w: Spot, k: number): Fx[] {
  const out: Fx[] = []
  for (let i = 0; at + i * 0.12 < at + dur - 0.04; i++) {
    const long = i % 2 === 0
    for (const side of [-1, 1]) {
      for (const deg of [20, 50, 80]) {
        // 從鈴鐺往外、往上斜出去
        const r = (deg * Math.PI) / 180
        const ux = side * Math.cos(r), uy = -Math.sin(r)
        const r0 = 0.15, r1 = (long ? 0.3 : 0.25) * (1 + 0.12 * k)
        const o = offClock(w.x, w.y, w.s, side * BELL_DX + ux * r0, BELL_DY + uy * r0)
        const to = onClock(w.x, w.y, w.s, side * BELL_DX + ux * r1, BELL_DY + uy * r1)
        out.push({ at: at + i * 0.12, dur: 0.16, kind: 'line', actor: 'clock', ...o, to, color: WAVE_COLOR, width: 1.25 * w.s })
      }
    }
  }
  return out
}

/** 響：鬧鐘左右狂抖（以腳底為支點搖）＋聲波線＋一串「鈴」；cam 是要不要推近震（響的第一下才推） */
function rattle(at: number, dur: number, w: Spot, k: number, cam: boolean): Gag {
  const moves: Move[] = [{ at, dur, actor: 'clock', do: 'shake', amount: 1.4 + 0.4 * k }]
  for (let i = 0; at + i * 0.1 < at + dur - 0.05; i++) {
    moves.push({ at: at + i * 0.1, dur: 0.1, actor: 'clock', do: 'tilt', amount: (i % 2 ? -1 : 1) * (7 + 2 * k) })
  }
  const cues: Cue[] = []
  for (let i = 0; i * 0.08 < dur - 0.04; i++) cues.push({ at: at + i * 0.08, sfx: 'clink' })
  const camera: Camera[] = cam
    ? [
        { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: w.x, y: w.y - 6 } },
        { at, dur: 0.4, do: 'shake', amount: 0.7 + 0.3 * k },
      ]
    : []
  // 白光很淡，不把豬探長刷白
  const lights: Light[] = cam ? [{ at, dur: 0.04, level: -0.1 - 0.03 * k }, { at: at + 0.04, dur: 0.2, level: 0 }] : []
  return { moves, fx: waves(at, dur, w, k), camera, cues, lights }
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera),
  cues: gs.flatMap((g) => g.cues), lights: gs.flatMap((g) => g.lights),
})

/** 秒針「答」一格的間隔、走到整點後多久響 */
const TICK = 0.17
const PRE = 0.2
/** 鬧鐘跳開要多久 */
const JUMP = 0.3

/**
 * 同一個笑點：秒針「答、答、答」走到整點（freeze：走到十一點先停住多久，第三次前的停一拍）→
 * 「鈴鈴鈴！」鬧鐘狂抖、聲波線、鏡頭推近震（同一串鈴聲，一次比一次長）→ 豬探長出手（try 秒後，各次自己寫）→
 * 鬧鐘兩腳一蹬跳一個弧線到 land（落地彈一下），他撲空「啪」（miss 秒後）→ 鬧鐘在落點繼續響、得意地扭，一組筆畫從鬧鐘飛進字框。
 * 第四次（回馬槍）沒有人出手、不跳：只到「鈴鈴鈴」為止，後面劇本自己寫。回傳每一拍的時間。
 */
function alarm(at: number, k: number, o: { w: Spot; freeze?: number; try?: number; land?: Vec; arc?: number; miss?: number; ringDur?: number }) {
  const { w } = o
  const t1 = at, t2 = at + TICK, t3 = at + 2 * TICK + (o.freeze ?? 0)
  const RING = t3 + PRE
  const ringDur = o.ringDur ?? 0.5
  const out: Gag = { moves: [], fx: [], camera: [], cues: [], lights: [] }
  // 答、答、答：紅色秒針十點 → 十一點 → 十二點，每一下鬧鐘輕輕點一下
  out.fx.push(...hand(t1, t2 - t1, -60, w), ...hand(t2, t3 - t2, -30, w))
  for (const t of [t1, t2, t3]) {
    out.cues.push({ at: t, sfx: 'tap' })
    out.moves.push({ at: t, dur: 0.12, actor: 'clock', do: 'squash', amount: 0.08 })
  }
  const tryAt = RING + (o.try ?? 0.3)
  const jump = o.land ? tryAt + 0.06 : RING + ringDur
  out.fx.push(...hand(t3, jump - t3, 0, w))
  // 鈴鈴鈴！（第一次響到跳開為止）
  const r1 = rattle(RING, (o.land ? jump : RING + ringDur) - RING, w, k, true)
  if (!o.land) return { ...merge(out, r1), RING, t3, tryAt: NaN, jump: NaN, LAND: NaN, MISS: NaN }
  // 嘿！兩腳一蹬（先壓扁蓄力），跳一個弧線到落點，落地彈一下
  const land = o.land
  const LAND = jump + JUMP
  out.moves.push(
    { at: jump - 0.06, dur: 0.08, actor: 'clock', do: 'squash', amount: 0.25 },
    { at: jump, dur: JUMP, actor: 'clock', do: 'moveTo', to: land, arc: o.arc ?? 12, ease: 'linear' },
    { at: LAND + 0.02, dur: 0.18, actor: 'clock', do: 'hop', amount: 2.5 },
  )
  out.cues.push({ at: jump, sfx: 'boing' })
  // 啪！撲空：在鬧鐘剛剛的位置冒一個 💥，一次比一次大
  const MISS = tryAt + (o.miss ?? 0.12)
  out.fx.push({ at: MISS, kind: 'burst', x: w.x - 4, y: w.y + 4, n: 1, dur: 0.4, scale: 1.1 + 0.3 * k })
  out.cues.push({ at: MISS, sfx: 'bonk' })
  // 在落點繼續響、得意地扭（扭完停下來）
  const r2 = rattle(LAND + 0.1, 0.42, { x: land.x, y: land.y, s: w.s }, k, false)
  return { ...merge(out, r1, r2), RING, t3, tryAt, jump, LAND, MISS }
}

/** 字框一開始就在上方正中（背後是素色的牆，避開左上的窗戶、右上的掛畫） */
const FRAME = { x: 86, y: 16 }
const FRAME_K = 0.42

const home: Spot = { x: X0, y: C, s: 1 }
const big: Spot = { x: MID, y: C, s: BIG }

// ---- 時間表 ----
const A1 = 0.75
const g1 = alarm(A1, 0, { w: home, try: 0.28, land: { x: X1, y: C }, arc: 12 })
const B1 = g1.LAND + 0.85
const A2 = B1 + 0.1
const g2 = alarm(A2, 1, { w: home, try: 0.2, land: { x: X1, y: C }, arc: 18, miss: 0.22 })
const B2 = g2.LAND + 0.85
/** 第 3 次：拿出網子、躡手躡腳靠近，秒針停在十一點好久（停一拍）……答！ */
const NET = B2 + 0.05
const A3 = NET + 0.2
const g3 = alarm(A3, 2, { w: home, freeze: 0.5, try: 0.25, land: HEAD, arc: 8, miss: 0.1 })
/** 國字拼好 → 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const DONE3 = g3.LAND + 0.05 + 0.45
const HOME = DONE3 + 0.1
const PARK = HOME + 0.85
const WORD = PARK + 0.25
/** 回馬槍：他放棄了抱頭蹲下，鬧鐘在正中間（放大的）照樣答答答、鈴鈴鈴 */
const A4 = WORD + 0.65
const g4 = alarm(A4, 3, { w: big, ringDur: 0.4 })
/** 喀：自己按掉自己；靠過去睡著；他眼睛睜大 */
const OFF = g4.RING + 0.4
const LEAN = OFF + 0.25
const AWAKE = LEAN + 0.35
const ASK = AWAKE + 0.35
const AX = 34
const ASK_S = 1.35
const ANSWER = ASK + 2.6
const END = ANSWER + 1.4

/** 靠在他身上歪幾度 */
const LEAN_DEG = -16

/** 網子：拿在手上（網子在右上、柄往左下），網圈懸在鬧鐘上方；蓋下去時整枝往下砸 */
const SN = 40
const NET_UP: Vec = { x: X0 - 10, y: 46 }
const NET_DOWN: Vec = { x: X0 - 9, y: 63 }

const gags = merge(g1, g2, g3, g4)

const clip: Clip = {
  format: 2,
  char: '時',
  meta: { theme: '鬧鐘響了按不掉', cast: '豬探長＋會跳的紅色鬧鐘＋捕蟲網', gags: ['時間到，紅色秒針答答答走到整點，鬧鐘「鈴鈴鈴」響個不停，豬探長每次要按掉它，鬧鐘就用兩隻小腳嘿地跳開、讓他撲空，在旁邊繼續響（伸手按→整個人撲過去趴在地上→停一拍：拿網子躡手躡腳蓋下去，鬧鐘鑽出來跳到他頭上響）；回馬槍是他放棄抱頭蹲下，鬧鐘響完自己喀地按掉自己、靠在他身上睡著了，換他睜大眼睛睡不著'] },
  duration: END,
  // 淡黃的早晨房間、木頭地板：紅色鬧鐘、咖啡色的豬探長都跳得出來
  bg: { top: '#FFF4D6', bottom: '#FFFBEF', floor: '#D9C3A0', scenery: 'room' },
  actors: [
    { id: 'net', emoji: 'prop:net', x: NET_UP.x - 120, y: NET_UP.y, size: SN, float: true, hidden: true },
    { id: 'pig', emoji: 'hero:pig/walk', x: PX, y: P, size: SP, flip: true, hidden: true },
    { id: 'clock', emoji: 'prop:alarm-face', x: X0, y: C, size: SC },
    // 鐘面中心（看不見的錨點）：時針、分針從這裡畫
    { id: 'face', emoji: '⏺️', ...faceAt(X0, C, 1), size: 2, float: true, hidden: true },
  ],
  moves: [
    // 開場：豬探長打著哈欠走進來，抬頭看字框
    { at: 0, dur: 0.45, actor: 'pig', do: 'enter', from: { x: PX - 90, y: P }, ease: 'out' },
    { at: 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/yawn' },
    { at: 0.62, actor: 'pig', do: 'swap', emoji: 'hero:pig/doze' },
    ...gags.moves,
    // ---- 第 1 次：伸手按 ----
    { at: g1.RING, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: g1.RING, dur: 0.2, actor: 'pig', do: 'hop', amount: 3 },
    { at: g1.tryAt, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: g1.tryAt, dur: 0.15, actor: 'pig', do: 'moveTo', to: { x: PX + 8, y: P }, ease: 'out' },
    { at: g1.MISS, dur: 0.2, actor: 'pig', do: 'squash', amount: 0.15 },
    // 撲空：傻眼停住
    { at: g1.MISS + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: g1.LAND + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/angry' },
    // 鬧鐘響完，蹦回原位；他走回去
    { at: B1 - 0.35, dur: 0.3, actor: 'clock', do: 'moveTo', to: { x: X0, y: C }, arc: 7 },
    { at: B1 - 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: B1 - 0.35, dur: 0.3, actor: 'pig', do: 'moveTo', to: { x: PX, y: P } },
    { at: B1 - 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    // ---- 第 2 次：蹲低等著，一響就整個人撲過去 ----
    { at: A2, dur: 0.5, actor: 'pig', do: 'squash', amount: 0.12 },
    { at: g2.RING, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: g2.tryAt! - 0.1, dur: 0.12, actor: 'pig', do: 'squash', amount: -0.2 },
    { at: g2.tryAt, dur: 0.22, actor: 'pig', do: 'moveTo', to: { x: X0 - 6, y: P }, arc: 5, ease: 'in' },
    { at: g2.MISS, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: g2.MISS, dur: 0.3, actor: 'pig', do: 'squash', amount: 0.3 },
    // 趴著傻眼，再爬起來走回去
    { at: g2.MISS + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: B2 - 0.35, dur: 0.3, actor: 'clock', do: 'moveTo', to: { x: X0, y: C }, arc: 7 },
    { at: B2 - 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: B2 - 0.35, dur: 0.35, actor: 'pig', do: 'moveTo', to: { x: PX, y: P } },
    // ---- 第 3 次：拿出網子，躡手躡腳，網子懸在鬧鐘上方……停一拍 ----
    { at: NET, actor: 'pig', do: 'swap', emoji: 'hero:pig/sneak' },
    { at: NET, dur: 0.01, actor: 'net', do: 'moveTo', to: NET_UP },
    { at: NET, dur: 0.25, actor: 'net', do: 'pop' },
    ...[A3 + 0.1, A3 + 0.4, A3 + 0.7].map((at): Move => ({ at, dur: 0.18, actor: 'pig', do: 'hop', amount: 1.5 })),
    { at: A3 + 0.1, dur: 0.8, actor: 'net', do: 'moveTo', to: { x: NET_UP.x + 1, y: NET_UP.y - 3 } },
    // 蓋下去！
    { at: g3.tryAt, actor: 'pig', do: 'swap', emoji: 'hero:pig/push' },
    { at: g3.tryAt, dur: 0.1, actor: 'net', do: 'moveTo', to: NET_DOWN, ease: 'in' },
    { at: g3.MISS, dur: 0.2, actor: 'net', do: 'squash', amount: 0.2 },
    // 鬧鐘鑽出來跳到他頭上：他被壓得一縮、傻眼
    { at: g3.LAND, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: g3.LAND, dur: 0.25, actor: 'pig', do: 'squash', amount: 0.25 },
    // 網子丟掉
    { at: DONE3, dur: 0.25, actor: 'net', do: 'vanish' },
    // 國字放大到中間：他頂著鬧鐘退到左邊
    { at: HOME - 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: HOME - 0.15, dur: 0.35, actor: 'pig', do: 'moveTo', to: { x: 22, y: P } },
    { at: HOME - 0.15, dur: 0.35, actor: 'clock', do: 'moveTo', to: { x: 22 - 1, y: HEAD.y } },
    { at: HOME + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    // 語詞那一刻：鬧鐘從頭上跳到正中間、放大，他指著它
    { at: WORD - 0.2, dur: 0.3, actor: 'clock', do: 'moveTo', to: { x: MID, y: C }, arc: 8 },
    { at: WORD + 0.1, dur: 0.25, actor: 'clock', do: 'scaleTo', amount: BIG, ease: 'back' },
    { at: WORD - 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: WORD - 0.1, dur: 0.3, actor: 'pig', do: 'moveTo', to: { x: 36, y: P } },
    // 回馬槍：他放棄了，抱頭蹲下
    { at: A4 - 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: g4.RING, dur: 0.4, actor: 'pig', do: 'shake', amount: 1.2 },
    // 喀：自己按掉自己（往下一壓）
    { at: OFF - 0.12, dur: 0.12, actor: 'clock', do: 'hop', amount: 3 },
    { at: OFF, dur: 0.2, actor: 'clock', do: 'squash', amount: 0.35 },
    // 走過去靠在他身上睡著
    { at: LEAN, dur: 0.3, actor: 'clock', do: 'moveTo', to: { x: 68, y: C } },
    { at: LEAN + 0.2, dur: 0.25, actor: 'clock', do: 'rotateTo', amount: LEAN_DEG },
    // 換他睜大眼睛
    { at: AWAKE, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: AWAKE, dur: 0.25, actor: 'pig', do: 'hop', amount: 4 },
    // 問他：鬧鐘退下，豬探長站到左前方、放大，面向右邊的國字
    { at: ASK, dur: 0.25, actor: 'clock', do: 'vanish' },
    { at: ASK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK, dur: 0.4, actor: 'pig', do: 'moveTo', to: { x: AX, y: P - 1 }, arc: 4, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'pig', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, dur: 0.3, actor: 'pig', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: ANSWER + 0.15, actor: 'pig', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: -45, y: P - 1 }, ease: 'in' },
  ],
  builds: [
    // 每響一次、跳開以後，一組筆畫從還在響的鬧鐘飛進字框：日、土、寸
    { at: g1.LAND + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: 'clock', color: partColor('日') },
    { at: g2.LAND + 0.05, dur: 0.5, strokes: [4, 5, 6], from: 'clock', color: partColor('土') },
    { at: g3.LAND + 0.05, dur: 0.45, strokes: [7, 8, 9], from: 'clock', color: partColor('寸') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['pig'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.8, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 時針、分針（黑色，畫在秒針下面）：平常、放大以後、靠在他身上歪著（換的時候前後疊 0.12 秒，不會閃）
    ...clockHands(0, WORD + 0.22 + 0.12, 1),
    ...clockHands(WORD + 0.22, LEAN + 0.32 + 0.12 - WORD - 0.22, BIG),
    // 鬧鐘退下（vanish 0.25 秒）的頭一點點還看得到指針，淡掉
    ...clockHands(LEAN + 0.32, ASK + 0.1 - LEAN - 0.32, BIG, LEAN_DEG),
    // 開場：睡眼惺忪
    { at: 0.7, dur: A1 + 2 * TICK + PRE - 0.7, kind: 'zzz', actor: 'pig', dx: -4 },
    ...gags.fx,
    // 第 1 次撲空：冒汗
    { at: g1.MISS + 0.15, kind: 'sweat', actor: 'pig', dx: 4 },
    // 第 2 次：趴在地上頭暈
    { at: g2.MISS + 0.1, dur: 0.6, kind: 'dizzy', actor: 'pig', dy: 8 },
    // 第 3 次前停一拍：他屏住呼吸冒汗
    { at: A3 + 0.35, kind: 'sweat', actor: 'pig', dx: 4 },
    // 語詞那一刻：秒針指著整點、亮一下
    ...hand(WORD + 0.35, A4 - WORD - 0.35, 0, big, true),
    { at: WORD + 0.3, dur: 0.6, kind: 'burst', x: MID, y: C - 2, n: 8, emoji: '✨' },
    // 回馬槍：喀，一按就安靜；靠著他睡著
    { at: OFF, dur: 0.35, kind: 'burst', ...onClock(MID, C, BIG, 0, -0.42), n: 1, emoji: '✨', scale: 1.5 },
    { at: LEAN + 0.4, dur: ASK - LEAN - 0.4, kind: 'zzz', actor: 'clock', dx: 4, dy: 4 },
    { at: AWAKE + 0.05, kind: 'sweat', actor: 'pig', dx: -6 },
  ],
  camera: [
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...gags.camera,
  ],
  lights: [
    ...gags.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '時' },
    ...gags.cues,
    { at: g3.LAND, sfx: 'bonk' },
    { at: HOME + 0.1, say: '時' },
    { at: WORD, say: '時間' },
    { at: OFF, sfx: 'tap' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '時' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

/** 鐘面中心：鬧鐘站在 (x, y)、放大 s 倍、以腳底轉 rot 度時（跟引擎一樣：轉斜了腳底會抬起來一點） */
function faceAt(x: number, y: number, s: number, rot = 0): Vec {
  const r = (rot * Math.PI) / 180
  const d = (FACE_DY - 0.42) * SC * s
  const base = y + 0.42 * SC - Math.abs(Math.sin(r)) * 0.42 * SC * s
  return { x: x - d * Math.sin(r), y: base + d * Math.cos(r) }
}
/**
 * 看不見的錨點 face 跟著鬧鐘：鬧鐘的 moveTo、hop、shake、vanish 照抄一份（位置換成鐘面中心）；
 * 鬧鐘放大（語詞那一刻）、歪著靠過去（回馬槍）時，錨點跟著搬到新的鐘面中心。壓扁、左右搖（tilt）不跟。
 */
function faceMoves(moves: Move[]): Move[] {
  // 動作「結束時」的大小、角度：剛好在放大／轉之前結束的那一步還是原樣
  const sAt = (t: number) => (t > WORD + 0.1 + 1e-6 ? BIG : 1)
  const rAt = (t: number) => (t > LEAN + 0.2 + 1e-6 ? LEAN_DEG : 0)
  const out: Move[] = []
  for (const m of moves) {
    if (m.actor !== 'clock') continue
    const end = m.at + (m.dur ?? 0)
    if (m.do === 'moveTo' && m.to) out.push({ ...m, actor: 'face', to: faceAt(m.to.x, m.to.y, sAt(end), rAt(end)) })
    else if (m.do === 'hop' || m.do === 'shake' || m.do === 'vanish') out.push({ ...m, actor: 'face' })
    else if (m.do === 'scaleTo') out.push({ at: m.at, dur: m.dur, actor: 'face', do: 'moveTo', to: faceAt(MID, C, BIG), ease: m.ease })
    else if (m.do === 'rotateTo') out.push({ at: m.at, dur: m.dur, actor: 'face', do: 'moveTo', to: faceAt(68, C, BIG, LEAN_DEG), ease: m.ease })
  }
  return out
}
clip.moves.push(...faceMoves(clip.moves))

export default clip
