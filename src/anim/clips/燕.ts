import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 燕（v2）：燕子的尾巴分叉，像一把剪刀。楊捷睿開心地拿著一樣有線的東西，屋簷下的燕子先「啾」一聲飛到畫面上方亮相（他沒發現），
// 然後「咻」地低低俯衝、貼著他手邊掠過，剪刀尾巴「喀嚓！」一剪——線斷了，東西飛走，他看著手上剩下的一小截線傻眼，燕子得意地在天上繞一圈。
// 同一個動作四次，只有被剪掉的東西越來越大：氣球飄走（燕子的頭和身體飛出廿、口）→ 風箏翻著跟斗飛走（翅膀飛出北）→
// 先停一拍：他想一想、拿出兩顆大氣球，左看看右看看，被氣球帶得飄起來⋯⋯燕子從背後「咻」，喀嚓！氣球全飛走，他在半空停一下，一屁股摔下來（剪刀尾飛出灬）。
// 語詞那一刻燕子停在畫面中間、變大，他指著牠：「燕子」。
// 回馬槍（第四次）：他氣呼呼地雙手叉腰、手上什麼都沒有了，氣到頭頂「彈」地翹起一撮頭髮——燕子照樣「咻」，喀嚓！剪掉的是那撮頭髮，
// 頭髮慢慢飄下來，他傻眼、大哭；燕子叼著剪下來的線飛回屋簷下的鳥巢，給小燕子當被子。
// 最後畫面暗下來只剩「燕」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「燕！」，然後退場只留字。
// 燕、燕、燕子、這是什麼字？、燕

/** 楊捷睿：站在左邊、朝左（圖朝左，不用 flip）；燕子每次都從他背後（右邊）飛過來 */
const SY = 38
const PY = 77 - 0.42 * SY
const X = 66
/** 楊捷睿圖（0～1、朝左）上的一點 */
const yp = (u: number, v: number, x = X, y = PY): Vec => ({ x: x + (u - 0.5) * SY, y: y + (v - 0.5) * SY })
/** know 姿勢舉高的拳頭（握著線） */
const FIST = yp(0.26, 0.27)
/** surprised 姿勢垂下來的左手（握著剩下的一小截線） */
const HAND = yp(0.26, 0.7)
/** 回馬槍頭頂翹起來的那撮頭髮（〰️ 染成深棕色、轉成直的）：畫出來的中心；縮放以腳底為準，錨點往上補 */
const TUFT = { x: X + 1, y: 37 }
const TUFT_K = 1
/** 拉粗：寬 ×0.72、高 ÷0.72（轉直以後，高就是頭髮的粗細與彎度） */
const TUFT_W = 0.72
const TUFT_AT = { x: TUFT.x, y: TUFT.y - 0.42 * 20 * (1 - TUFT_K / TUFT_W) }
const HAIR = 'grayscale(1) sepia(.7) brightness(.32)'

/** 燕子：這個字講的就是牠，飛的時候 size 34、語詞那一刻放大 1.4 倍。圖朝左飛 */
const SW = 34
/** 每次俯衝前停在畫面上方亮相的地方（屋簷下、鳥巢旁邊） */
const POSE = { x: 130, y: 37 }
/** 從畫面右邊外面飛進來（先小小的，像從遠處來） */
const OFF_R = { x: 182, y: 20 }
const SMALL = 0.6
/** 剪刀尾巴分叉的那一點（圖上 u 0.75、v 0.52），相對燕子中心 */
const SNIP = { x: 0.25 * SW, y: 0.02 * SW }
/** 燕子圖上的一點：中心在 c 時 */
const swPt = (c: Vec, u: number, v: number): Vec => ({ x: c.x + (u - 0.5) * SW, y: c.y + (v - 0.5) * SW })
/** 剪完往左上爬升，在左上角繞一圈（順時針：下→左→上→右→下） */
const LOOP_C = { x: 30, y: 21 }
const LOOP_R = 9
const LOOP_IN = { x: LOOP_C.x, y: LOOP_C.y + LOOP_R }

/** 屋簷下的鳥巢：右上角，一半在畫面外，像從房子伸出來的屋簷 */
const NEST = { x: 149, y: 13 }
const SN = 32
/** 字框一開始就在上方偏右（鳥巢在右上角、燕子在左上繞圈、俯衝路線在中間偏下）：背後是素色的天空 */
const FRAME = { x: 100, y: 15 }
const FRAME_K = 0.4

/** 有線的東西（thing／extra）的基本 size；每次用 scaleTo 換成要的大小 */
const ST = 20
/** 🎈 的線尾（3D 圖 u 0.22、v 0.93），相對氣球中心 */
const balloonTail = (s: number) => ({ dx: (0.22 - 0.5) * s, dy: (0.93 - 0.5) * s })
/** 🪁 拉線的地方（風箏中間），相對風箏中心 */
const kiteTie = (s: number) => ({ dx: (0.36 - 0.5) * s, dy: (0.45 - 0.5) * s })

const STRING = '#4B4B5A'
const TRAIL = '#2E4FA3'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 一條從 anchor（停著不動的角色，在 base）出發的線段：from、to 都是舞台座標 */
const seg = (at: number, dur: number, anchor: string, base: Vec, from: Vec, to: Vec, color: string, width: number): Fx => ({
  at, dur, kind: 'line', actor: anchor, dx: from.x - base.x, dy: from.y - base.y, to, color, width,
})

/** moveTo 的路徑（linear、arc 往下凹 sag）：p 時的位置 */
const path = (a: Vec, b: Vec, sag: number, p: number): Vec => ({
  x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p + sag * Math.sin(Math.PI * p),
})

/** 飛行軌跡：照燕子走過的路一段一段畫出粗線（錨在不動的鳥巢上），走過就留著，一起淡掉 */
function trail(t0: number, dur: number, a: Vec, b: Vec, sag: number, until: number, width = 1.8): Fx[] {
  const n = 6
  const out: Fx[] = []
  for (let i = 0; i < n; i++) {
    const at = t0 + (dur * i) / n
    out.push(seg(at, until - at, 'nest', NEST, path(a, b, sag, i / n), path(a, b, sag, (i + 1) / n), TRAIL, width))
  }
  return out
}

/**
 * 同一個笑點：燕子從右邊飛進來，停在畫面上方亮相（上下拍兩下翅膀、「啾啾」）→ 往後一縮 →
 * 「咻」地一道往下凹的弧線俯衝，剪刀尾巴剛好經過線的那一格「喀嚓！」：鏡頭推一下＋震、淡淡的白光、✂️ 閃一下、線斷開的小火花 →
 * 往左上爬升，在天上得意地繞一圈，從左邊飛走。at 是喀嚓的那一刻，k 是第幾次（0～3），cut 是剪到的那一點。
 * 第四次（k 3）不繞圈，改成叼著線飛回鳥巢。
 */
function snip(at: number, k: number, cut: Vec, sag: number, arrive: 'enter' | 'fly' | 'none'): Gag {
  const c = { x: cut.x - SNIP.x, y: cut.y - SNIP.y }
  const back = { x: POSE.x + 3, y: POSE.y - 3 }
  const moves: Move[] = []
  const cues: Cue[] = []
  if (arrive === 'enter' || arrive === 'fly') {
    // enter 會把大小從頭算：先縮小，再一邊飛進來一邊變大
    moves.push({ at: at - 1.15, dur: 0.35, actor: 'sw', do: 'enter', from: OFF_R, ease: 'out' })
    moves.push({ at: at - 1.1499, dur: 0.0001, actor: 'sw', do: 'scaleTo', amount: SMALL })
    moves.push({ at: at - 1.149, dur: 0.35, actor: 'sw', do: 'scaleTo', amount: 1 / SMALL, ease: 'out' })
  }
  // 亮相：停在上方拍兩下翅膀，「啾啾」
  moves.push(
    { at: at - 0.78, dur: 0.18, actor: 'sw', do: 'hop', amount: 1.6 },
    { at: at - 0.6, dur: 0.18, actor: 'sw', do: 'hop', amount: 1.6 },
  )
  cues.push({ at: at - 0.78, sfx: 'blip' }, { at: at - 0.6, sfx: 'blip' })
  // 往後一縮（頭抬起來）→ 咻！往下凹的弧線俯衝，經過線的那一格剛好水平
  moves.push(
    { at: at - 0.42, dur: 0.12, actor: 'sw', do: 'moveTo', to: back, ease: 'out' },
    { at: at - 0.42, dur: 0.12, actor: 'sw', do: 'rotateTo', amount: 12 },
    { at: at - 0.3, dur: 0.3, actor: 'sw', do: 'moveTo', to: c, arc: -sag, ease: 'linear' },
    { at: at - 0.3, dur: 0.08, actor: 'sw', do: 'rotateTo', amount: -37 },
    { at: at - 0.14, dur: 0.14, actor: 'sw', do: 'rotateTo', amount: 25 },
  )
  cues.push({ at: at - 0.3, sfx: 'whoosh' })
  const fx: Fx[] = [...trail(at - 0.3, 0.3, back, c, sag, at + 0.6)]
  if (k < 3) {
    // 往左上爬升，繞一圈，從左邊飛走；回到右邊外面、變小，等下一次
    moves.push(
      { at, dur: 0.28, actor: 'sw', do: 'moveTo', to: LOOP_IN, arc: -3, ease: 'linear' },
      { at, dur: 0.1, actor: 'sw', do: 'rotateTo', amount: 20 },
    )
    fx.push(...trail(at, 0.28, c, LOOP_IN, 3, at + 0.75))
    const n = 8
    const lt = at + 0.28
    for (let i = 1; i <= n; i++) {
      const th = (2 * Math.PI * i) / n
      const p = { x: LOOP_C.x - Math.sin(th) * LOOP_R, y: LOOP_C.y + Math.cos(th) * LOOP_R }
      moves.push({ at: lt + 0.07 * (i - 1), dur: 0.07, actor: 'sw', do: 'moveTo', to: p, ease: 'linear' })
      const th0 = (2 * Math.PI * (i - 1)) / n
      const p0 = { x: LOOP_C.x - Math.sin(th0) * LOOP_R, y: LOOP_C.y + Math.cos(th0) * LOOP_R }
      fx.push(seg(lt + 0.07 * (i - 1), at + 1.0 - (lt + 0.07 * (i - 1)), 'nest', NEST, p0, p, TRAIL, 1.2))
    }
    moves.push(
      { at: lt, dur: 0.56, actor: 'sw', do: 'rotateTo', amount: 340, ease: 'linear' },
      { at: lt + 0.56, dur: 0.2, actor: 'sw', do: 'moveTo', to: { x: -30, y: 34 }, ease: 'in' },
      { at: lt + 0.56, dur: 0.1, actor: 'sw', do: 'rotateTo', amount: -10 },
      // 飛出畫面就收起來、回到亮相的位置等下一次（下一次用 enter 從右邊外面飛進來，不會拖著殘影橫過畫面）
      { at: lt + 0.77, dur: 0.01, actor: 'sw', do: 'vanish' },
      { at: lt + 0.79, dur: 0.01, actor: 'sw', do: 'moveTo', to: POSE },
      { at: lt + 0.79, dur: 0.01, actor: 'sw', do: 'rotateTo', amount: 10 },
    )
    cues.push({ at: lt + 0.1, sfx: 'blip' })
  }
  // 喀嚓！✂️ 閃一下、線斷開的小火花
  fx.push(
    { at, dur: 0.45, kind: 'burst', x: cut.x, y: cut.y - 4, n: 1, emoji: '✂️', scale: 1.5 + 0.15 * k },
    { at, dur: 0.4, kind: 'burst', x: cut.x, y: cut.y, n: 6, emoji: '✨', scale: 0.7 + 0.1 * k },
  )
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.06 + 0.02 * k, to: cut },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.3 * k },
  ]
  // 淡淡的白光：不要把他刷白
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.07 },
    { at: at + 0.04, dur: 0.2, level: 0 },
  ]
  cues.push({ at, sfx: 'crack' })
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'tap' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'clink' })
  return { moves, fx, camera, cues, lights }
}

// ---- 時間表 ----
/** 第一次：一顆氣球 */
const H1 = 1.9
const B1 = { x: 50, y: 29 }
const S1 = 14
const T1 = { x: B1.x + balloonTail(S1).dx, y: B1.y + balloonTail(S1).dy }
const CUT1 = { x: T1.x + (FIST.x - T1.x) * ((45 - T1.y) / (FIST.y - T1.y)), y: 45 }
const g1 = snip(H1, 0, CUT1, 6, 'enter')
/** 第二次：風箏 */
const H2 = 4.12
const K2 = { x: 40, y: 22 }
const S2 = 18
const T2 = { x: K2.x + kiteTie(S2).dx, y: K2.y + kiteTie(S2).dy }
const CUT2 = { x: T2.x + (FIST.x - T2.x) * ((45 - T2.y) / (FIST.y - T2.y)), y: 45 }
const g2 = snip(H2, 1, CUT2, 6, 'fly')
/** 停一拍：想一想、拿出兩顆大氣球、左看看右看看、被帶得飄起來 */
const BEAT = H2 + 1.05
const POP3 = BEAT + 0.25
const RISE = POP3 + 0.65
const LIFT = 7
const H3 = 6.75
const S3 = 22
const S3B = 20
const B3 = { x: 46, y: 20 }
const B3B = { x: 62, y: 17 }
const FIST3 = { x: FIST.x, y: FIST.y - LIFT }
const CUT3 = { x: FIST3.x - 2, y: FIST3.y - 5 }
const g3 = snip(H3, 2, CUT3, 6, 'fly')
/** 剪斷後在半空停一下，再一屁股摔下來，彈到左邊 */
const DROP = H3 + 0.45
const LAND = DROP + 0.18
const SIDE_X = 24
/** 拼好後國字放大到中間 */
const HOME = H3 + 0.7
const PARK = HOME + 0.7
/** 語詞那一刻：燕子停在畫面中間、變大 */
const WORD = PARK + 0.5
const WC = { x: 88, y: 46 }
const WS = 1.4
/** 回馬槍：他氣呼呼叉腰，手上什麼都沒有——剪到的是褲頭 */
const H4 = 9.95
const CUT4 = { x: TUFT.x, y: TUFT.y + 3 }
const g4 = snip(H4, 3, CUT4, 4, 'none')
/** 第四次剪完：爬升、叼著線飛回鳥巢 */
const PERCH = { x: 131, y: 22 }
const ASK = 11.1
const ANSWER = 13.65
const AX = 36
const ASK_S = 1.3

/** 線：從東西（錨）拉到手上（舞台座標） */
const string = (at: number, dur: number, id: string, tie: { dx: number; dy: number }, hand: Vec): Fx => ({
  at, dur, kind: 'line', actor: id, dx: tie.dx, dy: tie.dy, to: hand, color: STRING, width: 0.75,
})
/** 剩下的一小截線：從垂下來的手往下掛 */
const stub = (at: number, dur: number, hand: Vec): Fx => ({
  at, dur, kind: 'line', actor: 'yang', dx: hand.x - X, dy: hand.y - PY + 0.5, to: { x: hand.x + 0.8, y: hand.y + 5 }, color: STRING, width: 0.75,
})

const all = [g1, g2, g3, g4]

const clip: Clip = {
  format: 2,
  char: '燕',
  meta: { theme: '燕子的剪刀尾巴', cast: '楊捷睿＋燕子＋鳥巢＋氣球風箏', gags: ['楊捷睿開心地拿著有線的東西，燕子每次都先在上方亮相「啾啾」，再「咻」地低低俯衝掠過他手邊，剪刀一樣的尾巴「喀嚓」一剪，線斷了東西飛走，他看著手上剩下的一小截線傻眼，燕子得意地繞一圈，一次比一次大（氣球飄走→風箏翻著跟斗飛走→停一拍他拿出兩顆大氣球、左看右看、被帶得飄起來，燕子從背後一剪，氣球全飛走，他在半空停一下一屁股摔下來）；回馬槍是他氣呼呼叉腰、手上什麼都沒有了，氣到頭頂翹起一撮頭髮，燕子照樣咻地一剪，剪掉的是那撮頭髮，頭髮慢慢飄下來他大哭，燕子叼著線飛回鳥巢給小燕子當被子'] },
  duration: 15,
  // 晴朗的淡藍天空、嫩綠草地；深藍的燕子、深藍的飛行軌跡在淺色天空上看得清楚
  bg: { top: '#CFEBFF', bottom: '#F2FAFF', floor: '#A8D884', scenery: 'hills' },
  actors: [
    { id: 'nest', emoji: 'prop:swallow-nest', x: NEST.x, y: NEST.y, size: SN, float: true },
    { id: 'yang', emoji: 'hero:yang/walk', x: X, y: PY, size: SY, hidden: true },
    // 有線的東西：🎈 → 🪁 → 🎈（大）→ 〰️（回馬槍頭頂那撮頭髮）
    { id: 'thing', emoji: '🎈', x: B1.x, y: B1.y, size: ST, hidden: true, float: true },
    // 第三次的第二顆氣球（染成綠色）
    { id: 'extra', emoji: '🎈', x: B3B.x, y: B3B.y, size: ST, hidden: true, float: true, tint: 'hue-rotate(120deg)' },
    { id: 'sw', emoji: 'prop:swallow', x: POSE.x, y: POSE.y, size: SW, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：他走進來，轉身指著字框——燕！再轉回來拿出氣球
    { at: 0, dur: 0.45, actor: 'yang', do: 'enter', from: { x: -22, y: PY }, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'flip' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 0.95, actor: 'yang', do: 'flip' },
    { at: 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: 0.95, dur: 0.2, actor: 'thing', do: 'pop' },
    { at: 0.951, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: S1 / ST },
    { at: 1.2, dur: 0.5, actor: 'thing', do: 'hop', amount: 1 },
    ...g1.moves,
    // 第一次：喀嚓！氣球飄走，他看著手上剩下的一小截線傻眼
    { at: H1 + 0.03, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H1 + 0.03, dur: 0.9, actor: 'thing', do: 'moveTo', to: { x: 30, y: -30 }, ease: 'in' },
    { at: H1 + 0.03, dur: 0.9, actor: 'thing', do: 'tilt', amount: -12, times: 2 },
    { at: H1 + 0.95, dur: 0.01, actor: 'thing', do: 'vanish' },
    { at: H1 + 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/angry' },
    // 第二次：拿出風箏，開心
    { at: 2.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 2.95, dur: 0.25, actor: 'yang', do: 'hop', amount: 2 },
    { at: 3.0, dur: 0.01, actor: 'thing', do: 'moveTo', to: K2 },
    { at: 3.0, actor: 'thing', do: 'swap', emoji: '🪁' },
    { at: 3.01, dur: 0.2, actor: 'thing', do: 'pop' },
    { at: 3.011, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: S2 / ST },
    { at: 3.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: 3.3, dur: 0.8, actor: 'thing', do: 'tilt', amount: 7, times: 2 },
    ...g2.moves,
    // 喀嚓！風箏翻著跟斗飛走；他傻眼，再氣得跺腳
    { at: H2 + 0.03, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H2 + 0.03, dur: 0.75, actor: 'thing', do: 'moveTo', to: { x: -25, y: 4 }, ease: 'in' },
    { at: H2 + 0.03, dur: 0.75, actor: 'thing', do: 'spin', times: -2, pivot: 'center' },
    { at: H2 + 0.8, dur: 0.01, actor: 'thing', do: 'vanish' },
    { at: H2 + 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/stomp' },
    { at: H2 + 0.58, dur: 0.2, actor: 'yang', do: 'hop', amount: 2.5 },
    { at: H2 + 0.82, dur: 0.2, actor: 'yang', do: 'hop', amount: 2.5 },
    // 停一拍：想一想 → 拿出兩顆大氣球 → 往右看、往左看（沒看到燕子）→ 被氣球帶得飄起來
    { at: BEAT, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: POP3 - 0.01, dur: 0.01, actor: 'thing', do: 'moveTo', to: B3 },
    { at: POP3 - 0.01, actor: 'thing', do: 'swap', emoji: '🎈' },
    { at: POP3, dur: 0.2, actor: 'thing', do: 'pop' },
    { at: POP3 + 0.001, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: S3 / ST },
    { at: POP3 + 0.08, dur: 0.2, actor: 'extra', do: 'pop' },
    { at: POP3 + 0.081, dur: 0.01, actor: 'extra', do: 'scaleTo', amount: S3B / ST },
    { at: POP3, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: POP3 + 0.15, actor: 'yang', do: 'flip' },
    { at: POP3 + 0.4, actor: 'yang', do: 'flip' },
    { at: RISE, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: X, y: PY - LIFT }, ease: 'linear' },
    { at: RISE + 0.4, dur: 0.6, actor: 'yang', do: 'hop', amount: 1.2, times: 2 },
    ...g3.moves,
    // 喀嚓！兩顆氣球都飛走；他在半空停一下傻眼，一屁股摔下來，彈到左邊
    { at: H3 + 0.03, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H3 + 0.03, dur: 0.8, actor: 'thing', do: 'moveTo', to: { x: 20, y: -35 }, ease: 'in' },
    { at: H3 + 0.03, dur: 0.8, actor: 'extra', do: 'moveTo', to: { x: 52, y: -35 }, ease: 'in' },
    { at: H3 + 0.85, dur: 0.01, actor: 'thing', do: 'vanish' },
    { at: H3 + 0.85, dur: 0.01, actor: 'extra', do: 'vanish' },
    { at: DROP, dur: 0.18, actor: 'yang', do: 'moveTo', to: { x: X, y: PY }, ease: 'in' },
    { at: LAND, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: LAND, dur: 0.25, actor: 'yang', do: 'shake', amount: 1 },
    { at: LAND + 0.25, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: SIDE_X, y: PY }, arc: 5, ease: 'out' },
    { at: LAND + 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 語詞那一刻：燕子飛到畫面中間、變大；他站起來指著牠：燕子！
    { at: PARK + 0.23, dur: 0.01, actor: 'sw', do: 'moveTo', to: WC },
    { at: PARK + 0.25, dur: 0.25, actor: 'sw', do: 'enter', from: { x: 182, y: 54 }, ease: 'out' },
    { at: PARK + 0.2501, dur: 0.0001, actor: 'sw', do: 'scaleTo', amount: SMALL },
    { at: PARK + 0.251, dur: 0.25, actor: 'sw', do: 'scaleTo', amount: WS / SMALL, ease: 'out' },
    { at: WORD - 0.05, actor: 'yang', do: 'flip' },
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    { at: WORD + 0.05, dur: 0.22, actor: 'sw', do: 'hop', amount: 2 },
    { at: WORD + 0.3, dur: 0.22, actor: 'sw', do: 'hop', amount: 2 },
    // 回馬槍：燕子回到上方；他走回原位，氣呼呼地雙手叉腰（手上什麼都沒有了）
    { at: WORD + 0.35, dur: 0.25, actor: 'sw', do: 'moveTo', to: POSE, ease: 'inOut' },
    { at: WORD + 0.35, dur: 0.25, actor: 'sw', do: 'scaleTo', amount: 1 / WS, ease: 'inOut' },
    { at: WORD + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: WORD + 0.35, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: X, y: PY } },
    { at: WORD + 0.65, actor: 'yang', do: 'flip' },
    { at: WORD + 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/angry' },
    // 氣到頭頂「彈」地翹起一撮頭髮
    { at: WORD + 0.7, dur: 0.01, actor: 'thing', do: 'moveTo', to: TUFT_AT },
    { at: WORD + 0.7, actor: 'thing', do: 'swap', emoji: '〰️' },
    { at: WORD + 0.7, actor: 'thing', do: 'tint', filter: HAIR },
    { at: WORD + 0.7, dur: 0.01, actor: 'thing', do: 'rotateTo', amount: 80, pivot: 'center' },
    { at: WORD + 0.71, dur: 0.2, actor: 'thing', do: 'pop' },
    { at: WORD + 0.711, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: TUFT_K },
    { at: WORD + 0.711, dur: 0.01, actor: 'thing', do: 'stretchTo', amount: TUFT_W },
    // 預備：燕子俯衝前，那撮頭髮氣得抖一下
    { at: H4 - 0.42, dur: 0.3, actor: 'thing', do: 'shake', amount: 1.2 },
    { at: WORD + 0.7, dur: 0.25, actor: 'yang', do: 'hop', amount: 1.5 },
    ...g4.moves,
    // 喀嚓！頭髮被剪掉，慢慢左右飄下來；他傻眼（停住），頭髮落地時大哭
    { at: H4 + 0.03, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H4 + 0.03, dur: 0.12, actor: 'thing', do: 'moveTo', to: { x: TUFT_AT.x - 3, y: TUFT_AT.y - 3 }, ease: 'out' },
    { at: H4 + 0.15, dur: 0.95, actor: 'thing', do: 'moveTo', to: { x: X - 17, y: 58 }, ease: 'out' },
    { at: H4 + 0.15, dur: 0.95, actor: 'thing', do: 'tilt', amount: 25, times: 3, pivot: 'center' },
    { at: H4 + 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/cry' },
    { at: H4 + 0.5, dur: 0.45, actor: 'yang', do: 'shake', amount: 0.5 },
    // 燕子：剪完往上爬，叼著線飛回鳥巢（變小一點，停在鳥巢旁邊）
    { at: H4, dur: 0.25, actor: 'sw', do: 'moveTo', to: { x: 34, y: 40 }, arc: -3, ease: 'linear' },
    { at: H4, dur: 0.12, actor: 'sw', do: 'rotateTo', amount: 25 },
    { at: H4 + 0.25, actor: 'sw', do: 'flip' },
    { at: H4 + 0.25, dur: 0.01, actor: 'sw', do: 'rotateTo', amount: -25 },
    { at: H4 + 0.26, dur: 0.38, actor: 'sw', do: 'moveTo', to: PERCH, arc: -20, ease: 'inOut' },
    { at: H4 + 0.26, dur: 0.38, actor: 'sw', do: 'scaleTo', amount: 0.75 },
    // 鑽進鳥巢：問他的時候國字旁邊不能有東西
    { at: H4 + 0.66, dur: 0.2, actor: 'sw', do: 'moveTo', to: { x: 147, y: 17 }, ease: 'in' },
    { at: H4 + 0.7, dur: 0.18, actor: 'sw', do: 'vanish' },
    { at: ASK - 0.18, dur: 0.1, actor: 'thing', do: 'vanish' },
    // 問他：放大，轉向觀眾
    { at: ASK - 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ASK - 0.15, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: AX, y: PY - 1 }, arc: 8, ease: 'out' },
    { at: ASK + 0.3, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場：他往左跑出去，燕子飛出右邊，畫面只留下字
    { at: ANSWER + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.12, dur: 0.18, actor: 'yang', do: 'moveTo', to: { x: -45, y: PY - 1 }, ease: 'in' },
    { at: ANSWER + 0.05, dur: 0.25, actor: 'sw', do: 'moveTo', to: { x: 190, y: 10 }, ease: 'in' },
    { at: ANSWER + 0.05, dur: 0.25, actor: 'nest', do: 'moveTo', to: { x: 200, y: NEST.y }, ease: 'in' },
  ],
  builds: [
    // 每剪一次，燕子身上對應的地方就飛出一組筆畫：頭飛出廿、紅喉嚨和身體飛出口 → 一對翅膀飛出北 → 剪刀尾巴飛出灬
    { at: H1 + 0.05, dur: 0.45, strokes: [0, 1, 2, 3], from: swPt({ x: CUT1.x - SNIP.x, y: CUT1.y - SNIP.y }, 0.12, 0.5), color: partColor('廿') },
    { at: H1 + 0.1, dur: 0.45, strokes: [4, 5, 6], from: swPt({ x: CUT1.x - SNIP.x, y: CUT1.y - SNIP.y }, 0.27, 0.62), color: partColor('口') },
    { at: H2 + 0.05, dur: 0.5, strokes: [7, 8, 9, 10, 11], from: swPt({ x: CUT2.x - SNIP.x, y: CUT2.y - SNIP.y }, 0.45, 0.3), color: partColor('北') },
    { at: H3 + 0.05, dur: 0.5, strokes: [12, 13, 14, 15], from: swPt({ x: CUT3.x - SNIP.x, y: CUT3.y - SNIP.y }, 0.85, 0.5), color: partColor('灬') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 96, y: 45 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    // 線：第一次氣球、第二次風箏、第三次兩顆大氣球（飄起來那段分四截，線尾跟著）
    string(0.95, H1 - 0.95, 'thing', balloonTail(S1), FIST),
    stub(H1 + 0.03, 0.65, HAND),
    string(3.02, H2 - 3.02, 'thing', kiteTie(S2), FIST),
    stub(H2 + 0.03, 0.5, HAND),
    // 第三次的兩條線錨在他舉高的拳頭上（他被氣球帶得飄起來，線跟著縮短），拉到兩顆氣球的線尾
    ...[{ id: 'thing', b: B3, s: S3, d: 0 }, { id: 'extra', b: B3B, s: S3B, d: 0.08 }].map(({ b, s, d }): Fx => ({
      at: POP3 + 0.05 + d, dur: H3 - POP3 - 0.05 - d, kind: 'line', actor: 'yang', dx: FIST.x - X, dy: FIST.y - PY,
      to: { x: b.x + balloonTail(s).dx, y: b.y + balloonTail(s).dy }, color: STRING, width: 0.75,
    })),
    { at: H3 + 0.03, dur: DROP - H3 - 0.03, kind: 'line', actor: 'yang', dx: HAND.x - X, dy: HAND.y - PY + 0.5, to: { x: HAND.x + 0.8, y: HAND.y - LIFT + 5 }, color: STRING, width: 0.75 },
    // 傻眼：汗
    { at: H1 + 0.1, kind: 'sweat', actor: 'yang', dx: -5 },
    { at: H2 + 0.1, kind: 'sweat', actor: 'yang', dx: -5 },
    // 停一拍：左看右看，冒汗
    { at: POP3 + 0.2, kind: 'sweat', actor: 'yang', dx: 5 },
    // 摔下來：頭暈
    { at: LAND + 0.6, dur: 0.75, kind: 'dizzy', actor: 'yang' },
    // 語詞那一刻：燕子身邊亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: WC.x, y: WC.y, n: 8, emoji: '✨', scale: 1.4 },
    // 回馬槍：頭髮被剪掉，他嚇出汗
    { at: H4 + 0.1, kind: 'sweat', actor: 'yang', dx: -5 },
    // 燕子回到鳥巢：小燕子蓋著線睡著
    { at: H4 + 0.88, dur: ASK - H4 - 0.88, kind: 'zzz', actor: 'nest', dx: -10, dy: 16 },
  ],
  camera: [
    // 鏡頭鎖全景（燕子從右上俯衝到左上繞圈，整條路線都要在畫面裡），只有喀嚓的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '燕' },
    ...all.flatMap((g) => g.cues),
    { at: POP3, sfx: 'boing' },
    { at: LAND, sfx: 'bonk' },
    { at: HOME + 0.1, say: '燕' },
    { at: WORD, say: '燕子' },
    { at: WORD + 0.71, sfx: 'boing' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '燕' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
