import { baseActorsAt } from '../clip'
import type { ActorState, Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 糕（v2）：小恐龍當蛋糕師傅，要疊一座最高的蛋糕塔。每次他把一個大蛋糕舉過頭、「嘿！」往塔頂一丟，
// 「噗」一聲疊上去，整座塔就晃一下——疊得越高晃得越厲害、他越手忙腳亂：
// 兩層，穩穩的，他閉眼得意（米從噗出來的那團白粉飛出來）→ 連丟兩個疊到四層，塔左搖右晃，他衝過去左扶右扶、冒汗（羔的上半）→
// 先停一拍：他抬頭看看比他高的塔、吞口水——還是連丟三個，疊到七層，比他高好多，整座塔大搖大擺歪向一邊，他嚇得抱頭跑開（灬）。
// 語詞那一刻：塔慢慢站直了，他走回來指著這座超高的塔：「蛋糕」。
// 回馬槍（第四次）：最後只丟一根小小的蠟燭插在塔頂——這次塔一動也不動，他好得意；他鼓起臉「呼——」吹蠟燭，
// 蠟燭飛走了，塔被他自己吹得往後一彎、再「咚」地整座倒下來壓在他身上，奶油蓋了他一身。
// 最後畫面暗下來只剩「糕」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「糕！」，然後退場只留字。
// 刻意不跟「乖」（忍住不吃蛋糕）、「午」（蛋糕被曬融）、「喜」（禮物盒跳出蛋糕）、「姑」（捧生日蛋糕）、「甜」（舔一口飄起來）、
// 「也」（蛋糕從天上砸頭）、「五」（吹蠟燭吹不熄）、「接」（手上接東西越疊越高）、「家」（抱一疊撞門）撞：
// 這支只演「往塔頂丟一個蛋糕 → 噗地疊上去 → 整座塔晃，一次比一次高、晃得一次比一次厲害」。
// 塔身（一層一層的海綿蛋糕＋奶油＋草莓切片）是畫在看不見的錨點上的 tube，塔頂永遠是同一個草莓蛋糕（prop:cake）。
// 糕、糕、蛋糕、這是什麼字？、糕

type V = Vec

/** 小恐龍（圖朝左；整支在塔的左邊，flip 面向右邊的塔） */
const RS = 34
const RY = 77 - 0.42 * RS
/** 每次都站在同一個地方丟 */
const STAND = 100
/** 蛋糕塔：塔頂的草莓蛋糕 size 34（不會被自動放大，塔身才對得齊）。放在右邊：國字回中央放大時要讓開 */
const CS = 34
const TX = 138
/** 蛋糕架的盤子面 */
const BASE = 73
/** 一層的高度 */
const LH = 4.6
/** 塔身的寬（比蛋糕圖的內容窄一點點，跟圖上的海綿蛋糕一樣寬） */
const LW = 28
/** 蛋糕圖：腳底（旋轉的支點）在中心下面 17；內容的底在腳底上面 GAP */
const FEET = CS / 2
const GAP = (1 - 0.961) * CS
const CUP = FEET - GAP
/** 疊了 n 層時，塔頂蛋糕的中心 */
const topCy = (n: number) => BASE - n * LH - CUP
/** 舉過頭的蛋糕（lift 姿勢兩手的上面） */
const LIFT: V = { x: STAND, y: 37 }
/** 國字讓位的地方（左上，背後是素色的天空；右上有太陽、右邊是塔） */
const FRAME: V = { x: 27, y: 24 }
const FRAME_K = 0.48

const SPONGE = '#F6C25B'
const CREAM = '#FFF8EC'
const BERRY = '#E5383B'

// ---------- 時間表 ----------
/** 每一次丟：at 舉起來，+0.22 丟出去，+0.48 落在塔頂 */
const THROW = 0.22
const FLY = 0.26
const landOf = (at: number) => at + THROW + FLY
/** 第 1 次：一個 */
const T1 = [0.85]
/** 第 2 次：連丟兩個 */
const T2 = [1.95, 2.5]
/** 第 3 次前停一拍，再連丟三個 */
const PAUSE = 3.95
const T3 = [4.35, 4.9, 5.45]
const L1 = landOf(T1[0])
const L2 = landOf(T2[1])
const L3 = landOf(T3[2])
/** 每一次落下（塔多一層）的時間 */
const LANDS = [...T1, ...T2, ...T3].map(landOf)
const layersAt = (t: number) => LANDS.filter((l) => l <= t).length
/** 嚇得跑到左邊、抱頭 */
const RUN = L3 + 0.17
const HIDE_X = 24
/** 字框填滿、國字到正中央 */
const HOME = 6.5
const PARK = HOME + 0.85
/** 語詞那一刻 */
const WORD = PARK - 0.05
const WORD_SAY = WORD + 0.45
/** 第 4 次（回馬槍）：丟一根蠟燭 */
const T4 = 8.65
const L4 = landOf(T4)
/** 吹蠟燭 → 蠟燭飛走、塔往右一彎 → 整座倒下來壓在他身上 */
const BLOW = 9.5
const BEND = 9.65
const FALL = 9.85
const IMPACT = 10.15
/** 從蛋糕底下彈出來，把身上的蛋糕抖掉 */
const SHAKE = 10.75
/** 問他 */
const ASK = 11.0
const ASK_SAY = ASK + 0.05
const ANSWER = ASK_SAY + 2.5
const ASK_AT: V = { x: 122, y: RY + 2 }

// ---------- 塔頂的蛋糕怎麼動（塔身照它畫） ----------
const moves: Move[] = []
/** 塔頂蛋糕現在的位置與角度（rotateTo 是累加的，要自己記） */
const top = { x: TX, y: topCy(0), r: 0 }
function topTo(at: number, dur: number, x: number, y: number, r: number, ease: Move['ease'] = 'inOut') {
  moves.push({ at, dur, actor: 'top', do: 'moveTo', to: { x, y }, ease })
  if (Math.abs(r - top.r) > 1e-6) moves.push({ at, dur, actor: 'top', do: 'rotateTo', amount: r - top.r, ease })
  top.x = x; top.y = y; top.r = r
}
/** 塔頂往旁邊偏 dx 時蛋糕歪幾度（越高的塔歪得越少一點） */
const tiltOf = (dx: number, n: number) => (Math.atan((1.5 * dx) / (n * LH + 15)) * 180) / Math.PI
/** 晃：塔頂依序晃到 TX + 每一個偏移，每段 half 秒 */
function sway(at: number, n: number, offs: number[], half: number) {
  offs.forEach((d, i) => topTo(at + i * half, half, TX + d, topCy(n), tiltOf(d, n)))
}

/** 小恐龍跟著晃的塔左扶右扶（第 2 次） */
const rexMoves: Move[] = []

/**
 * 同一個動作：舉起蛋糕 → 「嘿！」往塔頂一丟 → 「噗」疊上去（塔多一層）。n 是落下以後的層數。
 * 每一個都一樣：lift 舉過頭、throw 丟出去、同一個弧線、同一團白粉、同一個音效。
 */
function toss(at: number, n: number): { moves: Move[]; fx: Fx[]; cues: Cue[]; camera: Camera[] } {
  const L = landOf(at)
  const land: V = { x: TX, y: topCy(n) }
  const ms: Move[] = [
    { at: at - 0.02, dur: 0.01, actor: 'held', do: 'moveTo', to: LIFT },
    { at, dur: 0.2, actor: 'held', do: 'pop' },
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/lift' },
    { at, dur: 0.18, actor: 'rex', do: 'squash', amount: 0.12 },
    { at: at + THROW, actor: 'rex', do: 'swap', emoji: 'hero:rex/throw' },
    { at: at + THROW, dur: FLY, actor: 'held', do: 'moveTo', to: land, arc: 7, ease: 'out' },
    // 噗！疊上去：丟上去的那個變成新的塔頂，原本的塔頂變成一層
    { at: L, dur: 0.01, actor: 'held', do: 'vanish' },
    { at: L, dur: 0.18, actor: 'top', do: 'squash', amount: 0.14 },
  ]
  topTo(L, 0.01, TX, topCy(n), 0)
  const junction: V = { x: TX, y: BASE - (n - 1) * LH - 1 }
  return {
    moves: ms,
    fx: [{ at: L, kind: 'burst', x: junction.x, y: junction.y, emoji: '☁️', n: 6, dur: 0.45, scale: 0.9 + 0.08 * n }],
    cues: [{ at: at + THROW, sfx: 'whoosh' }, { at: L, sfx: 'plop' }],
    camera: [{ at: L, dur: 0.25, do: 'shake', amount: 0.3 + 0.15 * n }],
  }
}

// 第 1 次：一個蛋糕 → 兩層，穩穩的，只抖一下
const b1 = [toss(T1[0], 1)]
sway(L1 + 0.01, 1, [1.2, -0.8, 0.4, 0], 0.12)
// 第 2 次：連丟兩個 → 四層，左搖右晃
const b2 = [toss(T2[0], 2)]
sway(landOf(T2[0]) + 0.01, 2, [1.6, -1.2, 0.5, 0], 0.11)
b2.push(toss(T2[1], 3))
const SWAY2 = [3, -3.4, 3.2, -2.8, 2, -1, 0]
sway(L2 + 0.01, 3, SWAY2, 0.15)
// 停一拍：還在輕輕晃
sway(PAUSE, 3, [0.8, -0.6, 0], 0.13)
// 第 3 次：連丟三個 → 七層，大搖大擺、歪向右邊
const b3 = [toss(T3[0], 4)]
sway(landOf(T3[0]) + 0.01, 4, [2, -2.2, 1, 0], 0.11)
b3.push(toss(T3[1], 5))
sway(landOf(T3[1]) + 0.01, 5, [2.6, -2.6, 1.2, 0], 0.11)
b3.push(toss(T3[2], 6))
sway(L3 + 0.01, 6, [5, -4.5, 4.2], 0.15)
// 歪著停不下來（一直歪在右邊晃，國字放大時讓開）
const LEAN0 = L3 + 0.46
const LEANS = Math.ceil((WORD + 0.1 - LEAN0) / 0.2)
sway(LEAN0, 6, Array.from({ length: LEANS }, (_, i) => (i % 2 ? 2.2 : 4.2)), 0.2)
// 語詞：塔慢慢站直
sway(LEAN0 + 0.2 * LEANS, 6, [-1, 0.6, 0], 0.18)
// 第 4 次（回馬槍）：一根小蠟燭——塔一動也不動
const CANDLE = 12
const CANDLE_AT: V = { x: TX, y: topCy(6) - (0.5 - 0.098) * CS - 0.36 * CANDLE }
// 吹：蠟燭飛走，塔被吹得往右一彎（不能彎出畫面）
const BENT = 3.5
sway(BEND, 6, [BENT], FALL - BEND)
// 倒下來：以盤子為支點整座往左倒，壓在他背上
{
  const R = 6 * LH - GAP
  const a0 = (Math.atan2(BENT, R) * 180) / Math.PI
  const a1 = -62
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    const p = i / steps
    const deg = a0 + (a1 - a0) * p * p
    const rad = (deg * Math.PI) / 180
    const pv = { x: TX + R * Math.sin(rad), y: BASE - R * Math.cos(rad) }
    topTo(FALL + ((IMPACT - FALL) * (i - 1)) / steps, (IMPACT - FALL) / steps, pv.x, pv.y - FEET, deg, 'linear')
  }
}

// ---------- 小恐龍 ----------
rexMoves.push(
  // 開場：從左邊走進來，抬頭看字框：糕！
  { at: 0, dur: 0.42, actor: 'rex', do: 'enter', from: { x: -20, y: RY }, ease: 'out' },
  { at: 0.44, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
  // 第 1 次：兩層，穩穩的——閉眼得意
  { at: L1 + 0.08, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
  { at: L1 + 0.1, dur: 0.25, actor: 'rex', do: 'hop', amount: 2 },
  { at: T2[0] - 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
  // 第 2 次：四層，晃了！衝過去左扶右扶
  { at: L2 + 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/push' },
  { at: L2 + 0.05, dur: 0.15, actor: 'rex', do: 'moveTo', to: { x: 106, y: RY }, ease: 'out' },
)
SWAY2.forEach((d, i) => {
  if (i === 0) return
  rexMoves.push({ at: L2 + 0.01 + i * 0.15, dur: 0.15, actor: 'rex', do: 'moveTo', to: { x: 106 + d * 0.5, y: RY } })
})
rexMoves.push(
  // 停一拍：退回原位，抬頭看看比他高的塔、吞口水
  { at: PAUSE - 0.1, dur: 0.25, actor: 'rex', do: 'moveTo', to: { x: STAND, y: RY } },
  { at: PAUSE, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
  { at: PAUSE + 0.2, dur: 0.2, actor: 'rex', do: 'squash', amount: 0.08 },
  // 第 3 次：七層！嚇一跳，抱著頭跑到左邊
  { at: L3 + 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
  { at: L3 + 0.05, dur: 0.25, actor: 'rex', do: 'hop', amount: 3 },
  { at: RUN, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
  { at: RUN, actor: 'rex', do: 'flip' },
  { at: RUN, dur: 0.33, actor: 'rex', do: 'moveTo', to: { x: HIDE_X, y: RY }, ease: 'in' },
  { at: RUN + 0.35, actor: 'rex', do: 'flip' },
  { at: RUN + 0.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/duck' },
  { at: RUN + 0.5, dur: 0.6, actor: 'rex', do: 'shake', amount: 0.6 },
  // 語詞：走回來，指著這座超高的蛋糕塔
  { at: WORD - 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
  { at: WORD - 0.1, dur: 0.45, actor: 'rex', do: 'moveTo', to: { x: STAND, y: RY }, ease: 'inOut' },
  { at: WORD_SAY - 0.08, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
  { at: WORD_SAY - 0.08, dur: 0.3, actor: 'rex', do: 'hop', amount: 3 },
  // 第 4 次：蠟燭插上去，塔一動也不動——好得意
  { at: L4 + 0.06, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
  { at: L4 + 0.08, dur: 0.25, actor: 'rex', do: 'hop', amount: 2 },
  // 鼓起臉吹蠟燭
  { at: BLOW - 0.08, actor: 'rex', do: 'swap', emoji: 'hero:rex/blow' },
  { at: BLOW - 0.08, dur: 0.2, actor: 'rex', do: 'squash', amount: -0.1 },
  // 塔彎回來了！傻眼
  { at: FALL, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
  // 咚！整座壓在他身上（臉朝左露出來）
  { at: IMPACT, actor: 'rex', do: 'swap', emoji: 'hero:rex/flat' },
  { at: IMPACT, actor: 'rex', do: 'flip' },
  { at: IMPACT + 0.3, dur: 0.3, actor: 'rex', do: 'shake', amount: 0.5 },
  // 彈出來，把身上的蛋糕抖掉
  { at: SHAKE, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
  { at: SHAKE, dur: 0.25, actor: 'rex', do: 'hop', amount: 4 },
  { at: SHAKE + 0.05, dur: 0.2, actor: 'rex', do: 'shake', amount: 1.2 },
  // 問他：走到右前方、變大，面向左邊的國字
  { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
  { at: ASK, dur: 0.35, actor: 'rex', do: 'moveTo', to: ASK_AT, ease: 'out' },
  { at: ASK + 0.05, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: 1.18 },
  // 安靜等他回答：手放耳邊、身體前傾
  { at: ASK_SAY + 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
  { at: ASK_SAY + 1.0, dur: 0.3, actor: 'rex', do: 'rotateTo', amount: -8 },
  { at: ASK_SAY + 1.55, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
  { at: ASK_SAY + 2.05, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
  // 回答：跳起來指著字
  { at: ANSWER, dur: 0.12, actor: 'rex', do: 'rotateTo', amount: 8 },
  { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
  { at: ANSWER, dur: 0.3, actor: 'rex', do: 'hop', amount: 7 },
  // 退場，畫面只留下字
  { at: ANSWER + 0.16, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
  { at: ANSWER + 0.16, actor: 'rex', do: 'flip' },
  { at: ANSWER + 0.18, dur: 0.22, actor: 'rex', do: 'moveTo', to: { x: 220, y: ASK_AT.y }, ease: 'in' },
)

// 第 4 次：蠟燭（共用 held，底子 size 34 是蛋糕，蠟燭用 scaleTo 縮，寫在 pop 之後）
const candleMoves: Move[] = [
  { at: T4 - 0.03, actor: 'held', do: 'swap', emoji: '🕯️' },
  { at: T4 - 0.02, dur: 0.01, actor: 'held', do: 'moveTo', to: { x: LIFT.x, y: 47 } },
  { at: T4, dur: 0.2, actor: 'held', do: 'pop' },
  { at: T4 + 0.001, dur: 0.01, actor: 'held', do: 'scaleTo', amount: CANDLE / CS },
  { at: T4, actor: 'rex', do: 'swap', emoji: 'hero:rex/lift' },
  { at: T4 + THROW, actor: 'rex', do: 'swap', emoji: 'hero:rex/throw' },
  { at: T4 + THROW, dur: FLY, actor: 'held', do: 'moveTo', to: CANDLE_AT, arc: 7, ease: 'out' },
  // 吹走：往右上飛出畫面
  { at: BEND, dur: 0.35, actor: 'held', do: 'moveTo', to: { x: 178, y: -6 }, ease: 'in' },
  { at: BEND, dur: 0.35, actor: 'held', do: 'spin', times: 1 },
  // 倒下來的蛋糕：抖掉、往右上飛走
  { at: SHAKE + 0.05, dur: 0.3, actor: 'top', do: 'moveTo', to: { x: 190, y: 20 }, ease: 'in' },
  { at: SHAKE + 0.05, dur: 0.3, actor: 'top', do: 'spin', times: 1 },
  { at: SHAKE + 0.35, dur: 0.01, actor: 'top', do: 'vanish' },
]

const allToss = [...b1, ...b2, ...b3]

const builds: Build[] = [
  // 米：第一次「噗」出來的那團白粉
  { at: L1 + 0.05, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5], from: { x: TX, y: topCy(1) - 4 }, color: partColor('米') },
  // 羔的上半：四層的塔頂
  { at: L2 + 0.05, dur: 0.55, strokes: [6, 7, 8, 9, 10, 11], from: { x: TX, y: topCy(3) - 4 }, color: partColor('羊') },
  // 灬：七層的塔頂
  { at: L3 + 0.05, dur: 0.45, strokes: [12, 13, 14, 15], from: { x: TX + 4, y: topCy(6) - 4 }, color: partColor('灬') },
]

const clip: Clip = {
  format: 2,
  char: '糕',
  meta: { theme: '疊蛋糕塔', cast: '小恐龍＋草莓蛋糕塔＋蠟燭', gags: ['小恐龍把大蛋糕舉過頭、往塔頂一丟，「噗」地疊上去，整座蛋糕塔就晃一下，疊得越高晃得越厲害：兩層穩穩的他閉眼得意→連丟兩個到四層，左搖右晃他衝過去左扶右扶→先停一拍再連丟三個到七層，比他高好多、大搖大擺歪向一邊，他抱頭跑開；回馬槍是最後只插一根小蠟燭，塔一動也不動，他得意地「呼」一吹，蠟燭飛走、塔被吹彎再整座倒下來壓在他身上'] },
  duration: 15,
  bg: { top: '#FFE3EC', bottom: '#FFF8F2', floor: '#E8C9A0', scenery: 'hills' },
  actors: [
    // 看不見的錨點（0,0）：塔身的每一段 tube 掛在這上面，dx／dy 就是舞台座標
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 2, hidden: true, float: true },
    { id: 'top', emoji: 'prop:cake', x: TX, y: topCy(0), size: CS },
    { id: 'rex', emoji: 'hero:rex/walk', x: STAND, y: RY, size: RS, flip: true, hidden: true },
    { id: 'held', emoji: 'prop:cake', x: LIFT.x, y: LIFT.y, size: CS, hidden: true },
  ],
  moves: [...rexMoves, ...allToss.flatMap((g) => g.moves), ...moves, ...candleMoves],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（塔在右邊，會長到很高）
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給他
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['rex'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...allToss.flatMap((g) => g.fx),
    // 第 2 次：晃得他冒汗
    { at: L2 + 0.3, kind: 'sweat', actor: 'rex', dx: -6 },
    // 停一拍：冒汗
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'rex', dx: -6 },
    // 第 3 次：嚇一跳
    { at: L3 + 0.05, kind: 'pop', actor: 'rex', emoji: '❗', dx: -12, dur: 0.45, scale: 1.4 },
    // 語詞：亮晶晶
    { at: WORD_SAY, kind: 'burst', x: TX - 8, y: 42, emoji: '✨', n: 6, dur: 0.6, scale: 1.1 },
    // 第 4 次：蠟燭插上去
    { at: L4, kind: 'burst', x: CANDLE_AT.x, y: CANDLE_AT.y, emoji: '✨', n: 5, dur: 0.4 },
    // 呼——
    { at: BLOW, dur: 0.45, kind: 'blow', actor: 'rex', to: CANDLE_AT, dx: 8, dy: 6, scale: 1.4 },
    // 咚！
    { at: IMPACT, kind: 'burst', x: 116, y: 54, n: 1, dur: 0.4, scale: 2.2 },
    { at: IMPACT + 0.05, kind: 'burst', x: 104, y: 64, emoji: '☁️', n: 8, dur: 0.6, scale: 1.4 },
    // 抖掉：一團白粉
    { at: SHAKE, kind: 'burst', x: 110, y: 62, emoji: '☁️', n: 8, dur: 0.45, scale: 1.4 },
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.32 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到高高的塔頂和左上的字框）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...allToss.flatMap((g) => g.camera),
    { at: IMPACT, dur: 0.45, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '糕' },
    ...allToss.flatMap((g) => g.cues),
    { at: L2 + 0.04, sfx: 'boing' },
    { at: PAUSE + 0.2, sfx: 'gulp' },
    { at: L3 + 0.04, sfx: 'boing' },
    { at: L3 + 0.08, sfx: 'crack' },
    { at: HOME + 0.1, say: '糕' },
    { at: WORD_SAY, say: '蛋糕' },
    { at: T4 + THROW, sfx: 'whoosh' },
    { at: L4, sfx: 'clink' },
    { at: BLOW, sfx: 'whoosh' },
    { at: BEND, sfx: 'boing' },
    { at: IMPACT, sfx: 'bonk' },
    { at: IMPACT + 0.04, sfx: 'plop' },
    { at: IMPACT + 0.08, sfx: 'rumble' },
    { at: SHAKE, sfx: 'poof' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '糕' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

// ---------- 塔身：照時間切片（每 1/30 秒；沒在動的時候合成一片），每一層是幾根 tube ----------
type Seg = { a: V; b: V; color: string; width: number }
const add = (a: V, b: V, k = 1): V => ({ x: a.x + b.x * k, y: a.y + b.y * k })
const lerpV = (a: V, b: V, k: number): V => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })
const norm = (v: V): V => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l } }
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** 蛋糕架的盤子 */
const PLATE: Seg = { a: { x: TX - 16, y: BASE + 0.8 }, b: { x: TX + 16, y: BASE + 0.8 }, color: '#EEF0F6', width: 1.4 }

/** 塔身：從盤子接到塔頂蛋糕的底，中間一層一層（海綿蛋糕＋奶油＋草莓切片） */
function towerSegs(t: number, st: ActorState): Seg[] {
  const segs: Seg[] = [PLATE]
  const n = layersAt(t)
  if (n === 0) return segs
  const rad = (st.r * Math.PI) / 180
  const up: V = { x: Math.sin(rad), y: -Math.cos(rad) }
  const T = add({ x: st.x, y: st.y + FEET }, up, GAP)
  const B: V = { x: TX, y: BASE }
  const L = Math.hypot(T.x - B.x, T.y - B.y)
  // 晃的時候底部直立、上面彎過去；整座倒下來時變成一根直的
  const rig = clamp01((Math.abs(st.r) - 15) / 20)
  const d0 = norm(lerpV({ x: 0, y: -1 }, up, rig))
  const P1 = add(B, d0, L / 3), P2 = add(T, up, -L / 3)
  const bez = (s: number): V => {
    const u = 1 - s
    return { x: u * u * u * B.x + 3 * u * u * s * P1.x + 3 * u * s * s * P2.x + s * s * s * T.x, y: u * u * u * B.y + 3 * u * u * s * P1.y + 3 * u * s * s * P2.y + s * s * s * T.y }
  }
  const tan = (s: number): V => {
    const u = 1 - s
    return norm({
      x: 3 * u * u * (P1.x - B.x) + 6 * u * s * (P2.x - P1.x) + 3 * s * s * (T.x - P2.x),
      y: 3 * u * u * (P1.y - B.y) + 6 * u * s * (P2.y - P1.y) + 3 * s * s * (T.y - P2.y),
    })
  }
  const l = L / n
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) / n
    const C = bez(s), tg = tan(s)
    const nv: V = { x: -tg.y, y: tg.x }
    const ths = 0.62 * l, thc = 0.32 * l
    const cs = add(C, tg, -0.14 * l), cc = add(C, tg, 0.32 * l)
    const hs = (LW - ths) / 2, hc = (LW - thc) / 2 - 0.3
    segs.push({ a: add(cs, nv, -hs), b: add(cs, nv, hs), color: SPONGE, width: ths })
    segs.push({ a: add(cc, nv, -hc), b: add(cc, nv, hc), color: CREAM, width: thc })
    for (const k of [-0.62, 0, 0.62]) {
      const p = add(cc, nv, k * hc + (i % 2 ? 1.5 : -1.5))
      segs.push({ a: p, b: add(p, nv, 0.01), color: BERRY, width: 0.6 * l })
    }
  }
  return segs
}

/** 倒下來壓在他身上以後：奶油一團一團黏在他身上、海綿蛋糕碎塊掉在地上 */
const MESS: Seg[] = [
  ...[[86, 66, 4.6], [93, 64, 5.2], [101, 65.5, 4.4], [108, 67, 4], [97, 69, 3.4], [89, 70.5, 3], [113, 69.5, 3.2]].map(([x, y, w]) => ({ a: { x, y }, b: { x: x + 0.8, y: y + 0.2 }, color: CREAM, width: w })),
  ...[[76, 72.6, -20], [122, 72.8, 15], [130, 72.4, -10]].map(([x, y, d]) => {
    const r = (d * Math.PI) / 180
    return { a: { x: x - 2.2 * Math.cos(r), y: y - 2.2 * Math.sin(r) }, b: { x: x + 2.2 * Math.cos(r), y: y + 2.2 * Math.sin(r) }, color: SPONGE, width: 2.4 }
  }),
  ...[[91, 63], [104, 66], [118, 71]].map(([x, y]) => ({ a: { x, y }, b: { x: x + 0.01, y }, color: BERRY, width: 2.2 })),
]

{
  const topI = clip.actors.findIndex((a) => a.id === 'top')
  const key = (ss: Seg[]) => ss.map((s) => `${s.a.x.toFixed(2)},${s.a.y.toFixed(2)},${s.b.x.toFixed(2)},${s.b.y.toFixed(2)},${s.width.toFixed(2)}`).join('|')
  const slices: { at: number; dur: number; segs: Seg[] }[] = []
  let last = ''
  for (let t = 0; t < SHAKE - 1e-6; t += 1 / 30) {
    const st = baseActorsAt(clip, t)[topI]
    const segs = towerSegs(t, st)
    if (t >= IMPACT) segs.push(...MESS)
    const k = key(segs)
    if (k === last && slices.length) slices[slices.length - 1].dur += 1 / 30
    else slices.push({ at: t, dur: 1 / 30, segs })
    last = k
  }
  for (const s of slices) {
    for (const g of s.segs) {
      clip.fx!.push({ at: s.at, dur: s.dur, kind: 'tube', actor: 'rb', dx: g.a.x, dy: g.a.y, to: g.b, color: g.color, width: g.width, n: 99 })
    }
  }
}

export default clip
