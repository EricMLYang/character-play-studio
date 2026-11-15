import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 短（v2）：楊捷睿拿著一枝好長好長的鉛筆，請小機器人幫忙削尖一點。小機器人一板一眼，抓住筆尖「滋——！」削得太認真，
// 鉛筆屑亂噴、一路削過去，「叮！」筆尖超尖，可是整枝短了一大截——原本的長度留下一條虛線輪廓，小機器人得意，楊捷睿傻眼。
// 一次比一次短：很長（半個畫面）→ 一半（矢從削掉的那一截飛出來）→ 四分之一（豆的上半）→ 先停一拍：楊捷睿把剩下的鉛筆抱在胸前、
// 伸手比「不用了不用了」，小機器人的伸縮手臂「咻」地伸過來夾走，「滋——！叮！」丟回來的只剩橡皮擦頭那麼短（豆的下半）。
// 語詞那一刻那一小截鉛筆在畫面中間放大發亮，下面是原本那麼長的虛線輪廓：「短短」。回馬槍（第四次）：小機器人「嗶」拿出一枝全新的超長鉛筆送他，
// 楊捷睿開心接過來——小機器人順手又「滋——！」一路削到底，又只剩短短一截。
// 最後畫面暗下來只剩「短」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再指著字說「短！」，然後退場只留字。
// 短、短、短短、這是什麼字？、短

/** 兩個明星一樣大，都站在地上 */
const S = 36
const P = 77 - 0.42 * S
/** 楊捷睿站在左邊（圖朝左，flip 朝右），伸手（reach）拿著鉛筆的橡皮擦那一頭 */
const YX = 40
/** 小機器人平常站在右邊（圖朝左，面向鉛筆）；用力推（push）時雙手在身體左邊 15 */
const RX = 145
const HAND = 15
/** 鉛筆橫躺在楊捷睿手的高度；橡皮擦那一頭永遠對齊 E，才比得出長短 */
const YP = 63.5
const E = YX + 0.43 * S
/**
 * 鉛筆的畫法（整枝一樣粗，短的時候只是短、不是變小）：
 * - 筆尖：✏️（翻面再轉 -45 度，筆尖朝右）只畫最下面那一截（half bottom），剩下筆尖的木頭和筆芯。
 * - 筆身：從筆尖接到橡皮擦的橘色管子（fx tube，粗細跟筆尖的根部一樣）。
 * - 橡皮擦：一顆一樣粗的粉紅圓頭（長度 0 的 tube），蓋在筆身最左邊。
 * 「butt」是橡皮擦圓頭的中心（看不見的錨點），「tip」是筆尖那支 ✏️；兩個一起搬就是搬整枝。
 */
const TS = 30
const CUT = 0.8
const W = 0.285 * TS
const R = W / 2
const BODY = '#FF8C42'
const ERASER = '#F06A93'
/** 筆尖那支 ✏️ 的中心到筆尖、到筆尖根部 */
const TIP_OFF = 0.594 * TS
const CONE_OFF = 0.467 * TS
/** 最短：只剩橡皮擦圓頭接筆尖 */
const MIN = W + (TIP_OFF - CONE_OFF)
/** 一次比一次短：很長（半個畫面）→ 一半 → 四分之一 → 只剩橡皮擦頭 */
const L0 = 76
const T0 = E + L0
const T1 = E + L0 / 2
const T2 = E + L0 / 4
const T3 = E + MIN
/** 削的時候小機器人用力推著筆尖，鉛筆屑從他手上噴出來 */
const ZD = 0.55

/** 橡皮擦那一頭在 ex、筆尖在 tx、高度 y 時，兩個錨點的位置 */
const buttAt = (ex: number, y = YP): Vec => ({ x: ex + R, y })
const tipAt = (tx: number, y = YP): Vec => ({ x: tx - TIP_OFF, y })
/** 整枝搬到（橡皮擦 ex、長 len、高度 y） */
function movePencil(at: number, dur: number, ex: number, len: number, y: number, extra: Partial<Move> = {}): Move[] {
  return [
    { at, dur, actor: 'butt', do: 'moveTo', to: buttAt(ex, y), ...extra } as Move,
    { at, dur, actor: 'tip', do: 'moveTo', to: tipAt(ex + len, y), ...extra } as Move,
  ]
}
/** 筆身＋橡皮擦（k 是放大倍率：語詞那一刻的特寫） */
function pencilFx(at: number, dur: number, k = 1, tipDy = 0): Fx[] {
  return [
    { at, dur, kind: 'tube', actor: 'tip', dx: (CONE_OFF - R) * k, dy: tipDy, target: 'butt', color: BODY, width: W * k, n: 999 },
    { at, dur, kind: 'tube', actor: 'butt', dx: 0.01, dy: 0, target: 'butt', color: ERASER, width: W * k, n: 999 },
  ]
}

/** 虛線輪廓：「剛才有這麼長」。畫在看不見、不會動的 mark 上，x0～x1 這一段；在 x1 畫一道紅色刻度 */
const GHOST = '#5B4A88'
function ghost(at: number, dur: number, x0: number, x1: number): Fx[] {
  const out: Fx[] = []
  const line = (a: Vec, b: Vec, color = GHOST, width = 0.9): Fx =>
    ({ at, dur, kind: 'line', actor: 'mark', dx: a.x - E, dy: a.y - YP, to: b, color, width })
  // 淡淡的筆身（線的光暈剛好跟筆身一樣粗）
  out.push(line({ x: x0, y: YP }, { x: x1, y: YP }, '#E4DCF6', W / 2.6))
  for (const y of [YP - R, YP + R]) {
    for (let x = x0; x < x1 - 0.5; x += 4.2) out.push(line({ x, y }, { x: Math.min(x + 2.4, x1), y }))
  }
  out.push(line({ x: x1, y: YP - R - 4 }, { x: x1, y: YP + R + 4 }, '#C92A2A', 1.4))
  return out
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera),
  cues: gs.flatMap((g) => g.cues), lights: gs.flatMap((g) => g.lights),
})

/**
 * 同一個笑點：小機器人雙手抓住筆尖（push 預備）→「滋——！」用力削（他整個人抖、鉛筆屑一路噴、鏡頭推近＋震，同一個音效、一次多疊一個音），
 * 鉛筆一路變短（筆尖往回縮 tipTo；或整枝被吃進他手裡：橡皮擦那頭往前 buttTo），他跟著一路削過去（botFrom → botTo；沒寫就站著不動）→
 * 「叮！」筆尖閃一下，他得意（smug）跳回原位，楊捷睿傻眼。at 是開始削的時間，k 是第幾次，dur 是削多久。回傳「叮」的時間 ding。
 */
function zap(at: number, k: number, o: {
  tipTo?: Vec; buttTo?: Vec; botFrom?: number; botTo?: number; dur?: number; hopHome?: boolean; newTip: Vec
}): Gag & { ding: number } {
  const dur = o.dur ?? ZD
  const ding = at + dur
  const moves: Move[] = [
    { at: at - 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/push' },
    { at, dur, actor: 'bot', do: 'shake', amount: 0.7 + 0.2 * k },
    // 叮！
    { at: ding, actor: 'bot', do: 'swap', emoji: 'hero:bot/smug' },
    { at: ding + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: ding + 0.05, dur: 0.25, actor: 'yang', do: 'hop', amount: 2.5 },
  ]
  if (o.tipTo) moves.push({ at, dur, actor: 'tip', do: 'moveTo', to: o.tipTo, ease: 'linear' })
  if (o.buttTo) moves.push({ at, dur, actor: 'butt', do: 'moveTo', to: o.buttTo, ease: 'linear' })
  if (o.botTo != null) moves.push({ at, dur, actor: 'bot', do: 'moveTo', to: { x: o.botTo, y: P }, ease: 'linear' })
  if (o.hopHome) moves.push({ at: ding + 0.08, dur: 0.35, actor: 'bot', do: 'moveTo', to: { x: RX, y: P }, arc: 7, ease: 'out' })
  // 鉛筆屑：每 0.12 秒從他手上（筆尖那裡）噴一把
  const fx: Fx[] = []
  const bx0 = o.botFrom ?? RX, bx1 = o.botTo ?? bx0
  for (let i = 0; at + i * 0.12 < ding - 0.05; i++) {
    const q = (i * 0.12) / dur
    const hx = bx0 + (bx1 - bx0) * q - HAND
    fx.push({ at: at + i * 0.12, dur: 0.4, kind: 'burst', x: hx, y: YP - 1, n: 5 + k, emoji: i % 2 ? '🟧' : '🟫', scale: 0.8 + 0.08 * k })
  }
  // 叮：新的筆尖超尖，閃一下
  fx.push({ at: ding, dur: 0.5, kind: 'burst', x: o.newTip.x, y: o.newTip.y - 1, n: 1, emoji: '✨', scale: 1.1 + 0.15 * k })
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: Math.min(110, (bx0 + bx1) / 2 - HAND), y: 55 } },
    { at, dur, do: 'shake', amount: 0.5 + 0.25 * k },
  ]
  // 滋——（低沉的磨＋一串喀喀喀），一次比一次多疊一個；叮
  const cues: Cue[] = [{ at, sfx: 'rumble' }, ...[0, 0.18, 0.36].map((d): Cue => ({ at: at + d, sfx: 'crack' }))]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'laser' })
  if (k >= 2) cues.push({ at: at + 0.25, sfx: 'laser' })
  cues.push({ at: ding, sfx: 'clink' })
  // 白光很淡，不把人刷白
  const lights: Light[] = [{ at: ding, dur: 0.04, level: -0.12 }, { at: ding + 0.04, dur: 0.2, level: 0 }]
  return { moves, fx, camera, cues, lights, ding }
}

/** 字框一開始就在上方正中（背後是素色的牆，避開左上的窗戶、右上的掛畫和書架） */
const FRAME = { x: 86, y: 16 }
const FRAME_K = 0.42

// ---- 時間表 ----
/** 第 1 次：他本來就站在筆尖那裡，一路削到一半 */
const Z1 = 1.2
const g1 = zap(Z1, 0, { tipTo: tipAt(T1), botFrom: T0 + HAND, botTo: T1 + HAND, hopHome: true, newTip: { x: T1, y: YP } })
const D1 = g1.ding
/** 第 2 次：走到筆尖，削到四分之一 */
const Z2 = D1 + 1.1
const g2 = zap(Z2, 1, { tipTo: tipAt(T2), botFrom: T1 + HAND, botTo: T2 + HAND, hopHome: true, newTip: { x: T2, y: YP } })
const D2 = g2.ding
/** 停一拍：抱住剩下的、比「不用了不用了」；伸縮手臂咻地伸過來夾走 */
const HUG = D2 + 0.65
const NO = HUG + 0.35
const GRAB = NO + 0.75
const GRAB_D = 0.3
/** 抱在胸前、夾到他手上（筆尖在他手上） */
const CHEST = { ex: YX - 4, y: 62 }
const HELD = { tx: RX - HAND, y: 65 }
const Z3 = GRAB + GRAB_D + 0.2
/** 第 3 次：整枝被吃進他手裡，橡皮擦那頭一路往前 */
const g3 = zap(Z3, 2, { buttTo: buttAt(HELD.tx - MIN, HELD.y), newTip: { x: HELD.tx, y: HELD.y } })
const D3 = g3.ding
/** 小小一截丟回來 */
const TOSS = D3 + 0.15
const CATCH = TOSS + 0.35
/** 國字拼好 → 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const HOME = D3 + 0.6
const PARK = HOME + 0.9
const WORD = PARK + 0.3
/** 語詞那一刻：那一小截飛到畫面中間、放大 SHOW_K 倍（一樣是橡皮擦頭接筆尖） */
const SHOW_K = 2.4
const SHOW_Y = 46
/** 放大時 ✏️ 以腳底為準，看起來的中心往上移；錨點的 y 要往下補回來 */
const LIFT = 0.42 * TS * (SHOW_K - 1)
const SHOW_EX = 80 - (MIN * SHOW_K) / 2
/** 國字放大到中間時他退到左邊 */
const SIDE = 22
/** 回馬槍：嗶，拿出一枝全新的超長鉛筆 */
const NEW = WORD + 0.85
const Z4 = NEW + 0.7
const g4 = zap(Z4, 3, { tipTo: tipAt(T3), botFrom: T0 + HAND, botTo: T3 + HAND, dur: 0.85, hopHome: true, newTip: { x: T3, y: YP } })
const D4 = g4.ding
const ASK = D4 + 0.6
const AX = 34
const ASK_S = 1.35
const ANSWER = ASK + 2.6
const END = ANSWER + 1.4

const gags = merge(g1, g2, g3, g4)

const clip: Clip = {
  format: 2,
  char: '短',
  meta: { theme: '小機器人幫忙削鉛筆，削得太認真，鉛筆一下子短了一大截', cast: '楊捷睿＋小機器人＋一枝長鉛筆', gags: ['楊捷睿請小機器人幫忙把長鉛筆削尖一點，小機器人一板一眼抓住筆尖「滋——！」削得太認真，鉛筆屑亂噴、一路削過去，「叮！」筆尖超尖、整枝短了一大截（虛線輪廓留著原本的長度），他得意、楊捷睿傻眼，一次比一次短（半個畫面→一半→四分之一→停一拍：楊捷睿抱著剩下的比「不用了」，伸縮手臂咻地夾走，丟回來只剩橡皮擦頭那麼短）；回馬槍是小機器人拿出一枝全新的超長鉛筆送他，楊捷睿開心接過來，小機器人順手又「滋——！」一路削到底'] },
  duration: END,
  // 淺藍白的房間、木頭色地板：橘色的鉛筆、紅外套的楊捷睿、橘色的機器人都跳得出來
  bg: { top: '#E6F4FF', bottom: '#FBFDFF', floor: '#D8C9A8', scenery: 'room' },
  actors: [
    // 虛線輪廓的錨點（看不見、不會動）
    { id: 'mark', emoji: '✏️', x: E, y: YP, size: 4, float: true, hidden: true },
    // 橡皮擦圓頭的中心（看不見的錨點，圓頭是效果畫的）
    { id: 'butt', emoji: '✏️', x: buttAt(E).x - 150, y: YP, size: 4, float: true, hidden: true },
    // 筆尖（畫在兩個人後面：插進機器人手裡就被擋住；筆身、橡皮擦是效果，畫在最上面）
    { id: 'tip', emoji: '✏️', x: tipAt(T0).x, y: YP, size: TS, flip: true, float: true, pivot: 'center', hidden: true, half: 'bottom', cut: CUT },
    { id: 'bot', emoji: 'hero:bot/idle', x: RX, y: P, size: S },
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: P, size: S, flip: true, hidden: true },
  ],
  moves: [
    // 筆尖轉成橫的、朝右
    { at: 0, dur: 0.01, actor: 'tip', do: 'rotateTo', amount: -45 },
    // 開場：楊捷睿拿著好長的鉛筆走進來
    { at: 0, dur: 0.45, actor: 'yang', do: 'enter', from: { x: YX - 150, y: P }, ease: 'out' },
    { at: 0, dur: 0.45, actor: 'tip', do: 'enter', from: { x: tipAt(T0).x - 150, y: YP }, ease: 'out' },
    { at: 0, dur: 0.45, actor: 'butt', do: 'moveTo', to: buttAt(E), ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    // 小機器人：「嗶」，收到
    { at: 0.75, dur: 0.25, actor: 'bot', do: 'hop', amount: 2 },
    // 第 1 次：他就站在筆尖旁邊，抓住筆尖——滋！
    { at: Z1 - 0.3, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: T0 + HAND, y: P } },
    ...g1.moves,
    { at: D1 + 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    // 第 2 次：走到筆尖
    { at: Z2 - 0.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: Z2 - 0.6, dur: 0.4, actor: 'bot', do: 'moveTo', to: { x: T1 + HAND, y: P } },
    ...g2.moves,
    // 停一拍：抱住剩下的、比「不用了不用了」
    { at: HUG, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
    ...movePencil(HUG, 0.2, CHEST.ex, T2 - E, CHEST.y),
    { at: NO, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
    { at: NO + 0.05, dur: 0.6, actor: 'yang', do: 'shake', amount: 1.2 },
    { at: NO + 0.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/think' },
    // 咻！伸縮手臂伸過來夾走
    { at: GRAB - 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/extend' },
    ...movePencil(GRAB + 0.12, GRAB_D - 0.05, HELD.tx - (T2 - E), T2 - E, HELD.y, { ease: 'in' }),
    { at: GRAB + 0.17, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第 3 次：在他手上削，整枝被吃進去
    ...g3.moves,
    // 叮——丟回來只剩一小截，楊捷睿接住，欲哭無淚
    { at: TOSS, actor: 'bot', do: 'swap', emoji: 'hero:bot/throw' },
    ...movePencil(TOSS, CATCH - TOSS, E, MIN, YP, { arc: 14 }),
    { at: TOSS + 0.35, actor: 'bot', do: 'swap', emoji: 'hero:bot/smug' },
    { at: CATCH, actor: 'yang', do: 'swap', emoji: 'hero:yang/cry' },
    // 國字放大到中間：他捏著那一小截退到左邊
    { at: HOME - 0.1, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: SIDE, y: P }, arc: 4, ease: 'out' },
    ...movePencil(HOME - 0.1, 0.35, E - (YX - SIDE), MIN, YP, { arc: 4, ease: 'out' }),
    // 語詞那一刻：那一小截飛到畫面中間、「啵」地放大發亮，他指著它
    ...movePencil(WORD - 0.1, 0.25, SHOW_EX, MIN, SHOW_Y, { ease: 'out' }),
    { at: WORD + 0.15, dur: 0.01, actor: 'tip', do: 'scaleTo', amount: SHOW_K },
    { at: WORD + 0.15, dur: 0.01, actor: 'tip', do: 'moveTo', to: { x: SHOW_EX + MIN * SHOW_K - TIP_OFF * SHOW_K, y: SHOW_Y + LIFT } },
    { at: WORD + 0.15, dur: 0.01, actor: 'butt', do: 'moveTo', to: { x: SHOW_EX + R * SHOW_K, y: SHOW_Y } },
    { at: WORD - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    // 走回原位接新鉛筆
    { at: WORD + 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: WORD + 0.45, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: YX, y: P } },
    // 回馬槍：那一小截縮回來、丟到後面；嗶，小機器人拿出一枝全新的超長鉛筆
    { at: NEW - 0.12, dur: 0.01, actor: 'tip', do: 'scaleTo', amount: 1 / SHOW_K },
    ...movePencil(NEW - 0.12, 0.01, SHOW_EX, MIN, SHOW_Y),
    { at: NEW - 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: NEW - 0.1, dur: 0.25, actor: 'bot', do: 'hop', amount: 3 },
    ...movePencil(NEW - 0.1, 0.3, -30, MIN, 72, { arc: 10, ease: 'in' }),
    { at: NEW + 0.2, dur: 0.01, actor: 'tip', do: 'vanish' },
    ...movePencil(NEW + 0.22, 0.01, E, L0, YP),
    { at: NEW + 0.25, dur: 0.25, actor: 'tip', do: 'pop' },
    { at: NEW + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: NEW + 0.3, dur: 0.3, actor: 'yang', do: 'hop', amount: 4 },
    { at: NEW + 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    // 第 4 次：順手又滋——一路削到底
    { at: Z4 - 0.3, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: T0 + HAND, y: P } },
    ...g4.moves,
    // 問他：那一小截收掉，楊捷睿跳到左前方、放大，面向右邊的國字
    { at: ASK, dur: 0.01, actor: 'tip', do: 'vanish' },
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: AX, y: P - 1 }, arc: 5, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.2, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P - 1 }, ease: 'in' },
    { at: ANSWER + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ANSWER + 0.1, actor: 'bot', do: 'flip' },
    { at: ANSWER + 0.12, dur: 0.25, actor: 'bot', do: 'moveTo', to: { x: 200, y: P }, ease: 'in' },
  ],
  builds: [
    // 每削一次，削掉的那一截就變成一組筆畫飛進字框：矢、豆的上半、豆的下半
    { at: D1 + 0.02, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: { x: (T0 + T1) / 2, y: YP }, color: partColor('矢') },
    { at: D2 + 0.02, dur: 0.5, strokes: [5, 6, 7, 8], from: { x: (T1 + T2) / 2, y: YP }, color: partColor('豆') },
    { at: D3 + 0.02, dur: 0.45, strokes: [9, 10, 11], from: { x: RX - HAND, y: 62 }, color: partColor('豆') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.8, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 「剛才有這麼長」：每削一次留下一段虛線輪廓＋一道紅色刻度，留到問他之前（國字放大到中間那一段先收起來，不畫在字上）
    ...ghost(D1, HOME - D1, T1, T0),
    ...ghost(D2, HOME - D2, T2, T1),
    ...ghost(PARK + 0.3, ASK - PARK - 0.3, T1, T0),
    ...ghost(PARK + 0.3, ASK - PARK - 0.3, T2, T1),
    ...ghost(PARK + 0.3, ASK - PARK - 0.3, T3, T2),
    // 筆身＋橡皮擦：一般大小、語詞那一刻放大、回馬槍的新鉛筆
    ...pencilFx(0, WORD + 0.15),
    ...pencilFx(WORD + 0.15, NEW - 0.12 - WORD - 0.15, SHOW_K, -LIFT),
    ...pencilFx(NEW - 0.12, 0.32),
    ...pencilFx(NEW + 0.25, ASK - NEW - 0.25 + 0.02),
    // 開場：機器人收到
    { at: 0.75, dur: 0.45, kind: 'pop', actor: 'bot', emoji: '❗', dy: 2 },
    ...gags.fx,
    // 停一拍：他冒汗
    { at: NO + 0.1, kind: 'sweat', actor: 'yang', dx: 4 },
    // 伸縮手臂：從機器人的手接到鉛筆
    { at: GRAB, dur: GRAB_D + 0.15, kind: 'tube', actor: 'bot', dx: -16.7, dy: 6.4, target: 'tip', width: 2.4, n: 2.4 },
    // 語詞那一刻：那一小截發亮
    { at: WORD + 0.15, dur: 0.6, kind: 'burst', x: 80, y: SHOW_Y, n: 8, emoji: '✨' },
    // 嗶！全新的
    { at: NEW + 0.25, dur: 0.5, kind: 'burst', x: (E + T0) / 2, y: YP, n: 8, emoji: '✨' },
    { at: NEW - 0.1, dur: 0.45, kind: 'pop', actor: 'bot', emoji: '❗', dy: 2 },
  ],
  camera: [
    // 鏡頭固定在全景（鉛筆橫過半個畫面），只有削的那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...gags.camera,
  ],
  lights: [
    ...gags.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.5, say: '短' },
    { at: 0.75, sfx: 'blip' },
    ...gags.cues,
    { at: GRAB, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '短' },
    { at: WORD, say: '短短' },
    { at: NEW - 0.1, sfx: 'blip' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '短' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
