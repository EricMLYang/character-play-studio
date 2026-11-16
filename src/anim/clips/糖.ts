import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 糖（v2）：萬聖節要糖！穿骷髏裝的小骷髏提著南瓜桶，走到一面小磚牆前，對著牆上那扇小窗戶「叩、叩、叩」——
// 窗戶「啪」地打開，裡面丟出糖果，一次比一次多、一次比一次大：
// 一顆小糖果咻地飛過他頭上、「咚」掉進南瓜桶，他開心跳起來（米）→ 一大把糖果嘩啦啦噴出來，砸得他滿頭都是、滿地都是，接不完（广）→
// 先停一拍：他托著下巴看看滿滿的南瓜桶……還是再敲一次——窗口擠出一根比他還大的棒棒糖，往天上一拋，他倒退著跑去接，
// 舉在頭上壓得搖搖晃晃，最後「咚」地被壓扁在地上（唐的其他筆畫）。國字回中央唸「糖」。
// 國字讓到左上角，他爬起來把大棒棒糖舉到畫面中間：「糖果」。
// 回馬槍（第四次）：他閉眼得意，把棒棒糖插在地上，貪心地再敲一次——窗戶一開，糖果像山一樣倒出來，把他整個埋住，只露出黑帽子，
// 帽子還在抖（他在裡面偷笑）；「咕嚕、咕嚕、咕嚕」——糖果山不見了，他坐在地上摸著圓滾滾的肚子打嗝（全吃光了，連棒棒糖都吃了）。
// 最後畫面暗下來只剩「糖」，小骷髏問「這是什麼字？」，手放耳邊等他回答，再指著字說「糖！」，然後退場只留字。
// 刻意不跟「甜」（點心自己跳進嘴裡）、「要」（丟掉手上的去拿更大的）、「樹」（敲樹幹探出住戶瞪他）撞：
// 這支是同一個動作（敲窗戶）、窗口出來的永遠是糖，只有糖越來越多、越來越大。
// 糖、糖、糖果、這是什麼字？、糖

/** 小骷髏（hero:jerry；圖朝左，flip 朝右看窗戶） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 每次都站在同一個地方敲窗戶（窗戶左邊） */
const STAND: Vec = { x: 112, y: JY }
/** 第三次倒退跑去接棒棒糖、被壓扁的地方（國字回中央那一秒他在字的左邊） */
const LEFT: Vec = { x: 26, y: JY }
/** 南瓜桶（🎃）：提在他背後那隻手上 */
const PS = 12
const PY = 67
const PDX = 9
/** 小磚牆＋牆上的小窗戶（右邊；國字回中央時左緣約 x 125） */
const WALL: Vec = { x: 142, y: 77 - 0.42 * 36 }
const WIN: Vec = { x: 142, y: 46.5 }
/** 窗口（糖果從這裡出來） */
const MOUTH: Vec = { x: 142, y: 48.5 }
/** 糖果（一個角色換圖）：大棒棒糖是最大的那個，底子 size 寫它；小糖果縮成 0.42 倍 */
const CS = 40
/** 棒棒糖的圖是斜的，轉 43 度棒子才朝下 */
const UPRIGHT = 43
/** 棒棒糖舉在頭上時，中心比他的腳底高多少（棒子末端在他手上） */
const OVERHEAD = 40

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 小骷髏走到 x（南瓜桶跟著，在他背後那一側） */
function go(at: number, x: number, dur: number, faceRight: boolean, ease: Move['ease'] = 'inOut'): Move[] {
  return [
    { at, actor: 'jerry', do: 'moveTo', to: { x, y: JY }, dur, ease },
    { at, actor: 'pumpkin', do: 'moveTo', to: { x: x + (faceRight ? -PDX : PDX), y: PY }, dur, ease },
  ]
}

/**
 * 同一個動作「叩、叩、叩」：舉手（reach）敲三下窗戶，窗戶每下抖一下；停半拍，窗戶「啪」地打開。
 * k 是第幾次（0～3），一次比一次用力。回傳窗戶打開的那一刻。
 */
function knock(at: number, k: number): Gag & { open: number } {
  const open = at + 0.42
  const moves: Move[] = [{ at: at - 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' }]
  const cues: Cue[] = []
  for (let i = 0; i < 3; i++) {
    const t = at + i * 0.13
    moves.push(
      { at: t, actor: 'jerry', do: 'tilt', amount: 5 + k, dur: 0.11 },
      { at: t, actor: 'window', do: 'shake', amount: 0.5 + 0.15 * k, dur: 0.11 },
    )
    cues.push({ at: t, sfx: 'tap' })
  }
  moves.push(
    { at: open, actor: 'window', do: 'swap', emoji: 'prop:window-open' },
    { at: open, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/drool' },
  )
  cues.push({ at: open, sfx: 'poof' })
  return { open, moves, fx: [], camera: [], cues }
}

/** 窗戶關起來 */
const shut = (at: number): Move => ({ at, actor: 'window', do: 'swap', emoji: 'prop:window' })

/** 一顆糖（fx pop）：放在 c（中心），從 at 到 end 一直在 */
const sweet = (c: Vec, at: number, end: number, emoji = '🍬', scale = 1.6): Fx =>
  ({ at, dur: end - at, kind: 'pop', x: c.x - 6, y: c.y + 6, emoji, scale })

// ── 開場：提著南瓜桶走進來，指著字框唸「糖」，再看著窗戶流口水
const SAY1 = 0.5
// ── 第 1 次：一顆小糖果
const k1 = knock(0.95, 0)
const O1 = k1.open
const LAND1 = O1 + 0.55
// ── 第 2 次：一大把糖果
const k2 = knock(LAND1 + 0.4, 1)
const O2 = k2.open
// ── 第 3 次前停一拍：托下巴看看滿滿的南瓜桶
const PONDER = O2 + 0.9
const k3 = knock(PONDER + 0.55, 2)
const O3 = k3.open
/** 棒棒糖從窗口擠出來、變大 */
const GROW3 = O3 + 0.05
/** 往天上一拋，他倒退著跑去接 */
const TOSS3 = O3 + 0.4
const CATCH3 = TOSS3 + 0.55
/** 壓扁 */
const FLAT3 = CATCH3 + 0.65
/** 字框填滿、國字到正中央 */
const HOME = FLAT3 + 0.15
const PARK = HOME + 0.9
/** 語詞那一刻：爬起來，把棒棒糖舉到畫面中間 */
const UP = PARK + 0.05
const MID: Vec = { x: 76, y: JY }
const WORD = UP + 0.4
// ── 回馬槍（第 4 次）：插好棒棒糖、閉眼得意，再敲一次
const PLANT = WORD + 0.45
const PLANT_AT: Vec = { x: 88, y: 74 - 24 }
const k4 = knock(PLANT + 0.4, 3)
const O4 = k4.open
/** 糖果山蓋滿 */
const BURIED = O4 + 0.4
/** 咕嚕咕嚕吃光 */
const EAT = BURIED + 0.42
const FULL = EAT + 0.36
/** 問他 */
const ASK = FULL + 0.25
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }

/** 棒棒糖舉在 x 的頭上 */
const overhead = (x: number): Vec => ({ x, y: JY - OVERHEAD + 17 })

/** 第 2 次：一大把糖果嘩啦啦噴出來（三道糖果串＋頭上彈開一圈＋滿地都是） */
function handful(at: number): Fx[] {
  const fx: Fx[] = [
    { at, kind: 'blow', x: MOUTH.x, y: MOUTH.y, to: { x: 100, y: 38 }, emoji: '🍬', n: 4, dur: 0.6, scale: 1.7 },
    { at: at + 0.08, kind: 'blow', x: MOUTH.x, y: MOUTH.y - 3, to: { x: 88, y: 54 }, emoji: '🍬', n: 4, dur: 0.6, scale: 1.7 },
    { at: at + 0.16, kind: 'blow', x: MOUTH.x, y: MOUTH.y + 2, to: { x: 76, y: 66 }, emoji: '🍭', n: 4, dur: 0.6, scale: 1.6 },
    // 砸到頭上彈開
    { at: at + 0.35, kind: 'burst', actor: 'jerry', dy: 2, emoji: '🍬', n: 7, dur: 0.6, scale: 1.7 },
  ]
  // 掉了滿地（各佔一個位置，數得出很多顆）
  const floor: [number, string][] = [[66, '🍬'], [76, '🍭'], [86, '🍬'], [95, '🍬'], [127, '🍭']]
  floor.forEach(([x, e], i) => fx.push(sweet({ x, y: 69 }, at + 0.4 + i * 0.05, at + 1.35, e)))
  return fx
}

/** 第 4 次：糖果山（一顆一顆從下往上堆，只露出帽子；吃的時候從上往下不見） */
function mountain(at: number, eat: number): Fx[] {
  const rows: { y: number; xs: number[] }[] = [
    { y: 77, xs: [74, 82, 90, 98, 106, 114, 122, 130, 138, 146] },
    { y: 73, xs: [70, 78, 86, 94, 102, 110, 118, 126, 134, 142, 149] },
    { y: 69, xs: [76, 84, 92, 100, 108, 116, 124, 132, 140, 148] },
    { y: 63, xs: [83, 90, 97, 104, 111, 118, 125, 132, 139] },
    { y: 57, xs: [88, 95, 129, 136] },
    { y: 51.5, xs: [92, 133] },
  ]
  const fx: Fx[] = []
  rows.forEach((r, j) => r.xs.forEach((x, i) => {
    const e = (i + j) % 4 === 1 ? '🍭' : '🍬'
    fx.push(sweet({ x: x - 4, y: r.y }, at + j * 0.09 + i * 0.012, eat + (rows.length - 1 - j) * 0.09 + 0.02, e, 2.1))
  }))
  return fx
}

const builds: Build[] = [
  // 一顆小糖果飛過頭上：米
  { at: O1 + 0.2, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: 'candy', color: partColor('米') },
  // 一大把糖果從窗口噴出來：广
  { at: O2 + 0.15, dur: 0.5, strokes: [6, 7, 8], from: MOUTH, color: partColor('唐') },
  // 大棒棒糖舉在頭上搖搖晃晃：唐的其他筆畫
  { at: CATCH3 + 0.05, dur: 0.55, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'candy', color: partColor('唐') },
]

const clip: Clip = {
  format: 2,
  char: '糖',
  meta: { theme: '萬聖節敲門要糖', cast: '小骷髏＋南瓜桶＋小窗戶＋糖果', gags: ['萬聖節小骷髏每次敲窗戶「叩叩叩」，窗戶一開就丟出糖果，一次比一次多、一次比一次大（一顆小糖果掉進南瓜桶→一大把糖果砸得滿頭滿地接不完→一根比他還大的棒棒糖，舉在頭上壓得搖搖晃晃、被壓扁）；回馬槍是他貪心再敲一次，糖果像山一樣倒出來把他埋住、只露出帽子，咕嚕咕嚕全吃光、坐著摸圓肚子打嗝'] },
  duration: 15,
  bg: { top: '#FFD9A0', bottom: '#FFF4DE', floor: '#E9CFA2', scenery: 'hills' },
  actors: [
    { id: 'wall', emoji: 'prop:brick-wall', x: WALL.x, y: WALL.y, size: 36 },
    { id: 'window', emoji: 'prop:window', x: WIN.x, y: WIN.y, size: 28, float: true },
    { id: 'pumpkin', emoji: '🎃', x: STAND.x - PDX, y: PY, size: PS, float: true },
    { id: 'jerry', emoji: 'hero:jerry/walk', x: STAND.x, y: STAND.y, size: JS, flip: true },
    // 糖果：小糖果 🍬 → 大棒棒糖 🍭（畫在最上面）
    { id: 'candy', emoji: '🍬', x: MOUTH.x, y: MOUTH.y, size: CS, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：提著南瓜桶走進來
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.5 },
    { at: 0, actor: 'pumpkin', do: 'enter', from: { x: -20 - PDX, y: PY }, dur: 0.5 },
    // 抬頭指著字框：糖！
    { at: SAY1, actor: 'jerry', do: 'flip' },
    { at: SAY1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    // 轉回去看窗戶、流口水
    { at: SAY1 + 0.3, actor: 'jerry', do: 'flip' },
    { at: SAY1 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/drool' },

    // ── 第 1 次：一顆小糖果咻地飛過他頭上，「咚」掉進南瓜桶
    ...k1.moves,
    { at: O1 + 0.05, actor: 'candy', do: 'pop', dur: 0.15 },
    { at: O1 + 0.051, actor: 'candy', do: 'scaleTo', amount: 0.42, dur: 0.001 },
    { at: O1 + 0.2, actor: 'candy', do: 'moveTo', to: { x: STAND.x - PDX, y: PY - 3 }, arc: 18, dur: 0.4, ease: 'linear' },
    { at: O1 + 0.2, actor: 'candy', do: 'rotateTo', amount: -360, dur: 0.4, ease: 'linear' },
    { at: LAND1, actor: 'candy', do: 'vanish', dur: 0.06 },
    { at: LAND1, actor: 'pumpkin', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: LAND1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: LAND1, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
    shut(LAND1 + 0.1),

    // ── 第 2 次：一大把糖果嘩啦啦，接不完
    ...k2.moves,
    { at: O2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/hug' },
    { at: O2 + 0.35, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: O2 + 0.35, actor: 'jerry', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: O2 + 0.45, actor: 'jerry', do: 'shake', amount: 1, dur: 0.4 },
    { at: O2 + 0.45, actor: 'pumpkin', do: 'hop', amount: 2, dur: 0.2 },
    shut(O2 + 0.85),
    // 停一拍：托下巴看看滿滿的南瓜桶……
    { at: PONDER, actor: 'jerry', do: 'flip' },
    { at: PONDER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/ponder' },
    { at: PONDER + 0.1, actor: 'jerry', do: 'tilt', amount: 8, dur: 0.3 },
    // ……還是要！轉回去
    { at: PONDER + 0.4, actor: 'jerry', do: 'flip' },
    { at: PONDER + 0.4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/drool' },

    // ── 第 3 次：窗口擠出一根比他還大的棒棒糖
    ...k3.moves,
    { at: O3 - 0.05, actor: 'candy', do: 'swap', emoji: '🍭' },
    { at: O3 - 0.05, actor: 'candy', do: 'moveTo', to: { x: 134, y: 40 }, dur: 0.01 },
    { at: O3 - 0.05, actor: 'candy', do: 'rotateTo', amount: UPRIGHT, dur: 0.01 },
    { at: O3, actor: 'candy', do: 'pop', dur: 0.12 },
    { at: O3 + 0.001, actor: 'candy', do: 'scaleTo', amount: 0.45, dur: 0.001 },
    // 放大寫在 pop 之後：從窗口擠出來
    { at: GROW3, actor: 'candy', do: 'scaleTo', amount: 1 / 0.45, dur: 0.3, ease: 'back' },
    { at: O3 + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 往天上一拋，他倒退著跑去接（南瓜桶甩到後面）
    { at: TOSS3, actor: 'candy', do: 'moveTo', to: overhead(LEFT.x), arc: 16, dur: CATCH3 - TOSS3, ease: 'inOut' },
    { at: TOSS3, actor: 'candy', do: 'rotateTo', amount: -360, dur: CATCH3 - TOSS3, ease: 'inOut' },
    { at: TOSS3, actor: 'jerry', do: 'flip' },
    { at: TOSS3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dash' },
    ...go(TOSS3, LEFT.x, CATCH3 - TOSS3 - 0.08, false, 'in'),
    // 接住！舉在頭上，壓得搖搖晃晃
    { at: CATCH3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: CATCH3, actor: 'jerry', do: 'squash', amount: 0.18, dur: 0.25 },
    { at: CATCH3, actor: 'pumpkin', do: 'moveTo', to: { x: 10, y: 77 - 0.42 * PS }, arc: 8, dur: 0.3 },
    { at: CATCH3 + 0.1, actor: 'jerry', do: 'moveTo', to: { x: LEFT.x + 4, y: JY }, dur: 0.16 },
    { at: CATCH3 + 0.1, actor: 'candy', do: 'moveTo', to: overhead(LEFT.x + 4), dur: 0.16 },
    { at: CATCH3 + 0.1, actor: 'candy', do: 'tilt', amount: 9, dur: 0.16 },
    { at: CATCH3 + 0.26, actor: 'jerry', do: 'moveTo', to: { x: LEFT.x - 3, y: JY }, dur: 0.18 },
    { at: CATCH3 + 0.26, actor: 'candy', do: 'moveTo', to: overhead(LEFT.x - 3), dur: 0.18 },
    { at: CATCH3 + 0.26, actor: 'candy', do: 'tilt', amount: -11, dur: 0.18 },
    { at: CATCH3 + 0.44, actor: 'jerry', do: 'moveTo', to: LEFT, dur: 0.14 },
    { at: CATCH3 + 0.44, actor: 'candy', do: 'moveTo', to: overhead(LEFT.x), dur: 0.14 },
    { at: CATCH3 + 0.3, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.3 },
    // 「咚」被壓扁
    { at: FLAT3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },
    { at: FLAT3, actor: 'candy', do: 'moveTo', to: { x: LEFT.x + 2, y: 70 - 24 }, dur: 0.12, ease: 'in' },

    // ── 語詞：爬起來，把棒棒糖舉到畫面中間
    { at: UP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: UP, actor: 'candy', do: 'moveTo', to: overhead(LEFT.x), dur: 0.15, ease: 'out' },
    { at: UP + 0.15, actor: 'jerry', do: 'moveTo', to: MID, dur: 0.3 },
    { at: UP + 0.15, actor: 'candy', do: 'moveTo', to: overhead(MID.x), dur: 0.3 },
    { at: WORD, actor: 'jerry', do: 'hop', amount: 3, dur: 0.3 },
    { at: WORD, actor: 'candy', do: 'hop', amount: 3, dur: 0.3 },

    // ── 回馬槍：把棒棒糖插在地上，閉眼得意，走回窗戶前
    { at: PLANT, actor: 'candy', do: 'moveTo', to: PLANT_AT, dur: 0.2, ease: 'in' },
    { at: PLANT, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: PLANT + 0.12, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.3 },
    ...k4.moves,
    // 糖果山倒出來，把他埋住：嚇一跳→在裡面偷笑（帽子在抖）
    { at: O4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: O4 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },
    { at: BURIED, actor: 'jerry', do: 'shake', amount: 1, dur: EAT - BURIED },
    // 咕嚕咕嚕全吃光（連棒棒糖都吃了），坐著摸圓肚子
    { at: EAT, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/eat' },
    { at: EAT + 0.15, actor: 'candy', do: 'vanish', dur: 0.12 },
    { at: FULL - 0.06, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/full' },
    { at: FULL, actor: 'jerry', do: 'hop', amount: 2.5, dur: 0.22 },
    shut(EAT),
    // 問他之前：牆、窗戶、南瓜桶退掉（畫面暗下來）
    { at: ASK - 0.15, actor: 'window', do: 'vanish', dur: 0.12 },
    { at: ASK - 0.15, actor: 'wall', do: 'vanish', dur: 0.12 },
    { at: ASK - 0.15, actor: 'pumpkin', do: 'vanish', dur: 0.12 },
    // 問他：站起來、轉向國字、變大
    { at: ASK + 0.2, actor: 'jerry', do: 'flip' },
    { at: ASK + 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.2, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.2, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.27, actor: 'jerry', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'jerry', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds,
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到左上角：中間留給大棒棒糖和糖果山
    { at: PARK, dur: 0.45, do: 'park', to: { x: 30, y: 22 } },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 第 1 次：糖果亮一下
    { at: O1 + 0.05, kind: 'burst', x: MOUTH.x, y: MOUTH.y, emoji: '✨', n: 5, dur: 0.4 },
    // 第 2 次
    ...handful(O2),
    // 停一拍
    { at: PONDER + 0.1, kind: 'sweat', actor: 'jerry', dx: 6 },
    // 第 3 次：棒棒糖擠出來
    { at: O3, kind: 'burst', x: MOUTH.x - 6, y: MOUTH.y - 6, emoji: '✨', n: 7, dur: 0.45, scale: 1.3 },
    { at: CATCH3 + 0.2, kind: 'sweat', actor: 'jerry', dx: 8, dy: 14 },
    { at: FLAT3 + 0.05, kind: 'burst', x: LEFT.x + 8, y: 60, emoji: '💥', dur: 0.4, scale: 1.4 },
    // 語詞：棒棒糖亮晶晶
    { at: WORD, kind: 'burst', x: MID.x, y: 20, emoji: '✨', n: 7, dur: 0.5, scale: 1.4 },
    // 第 4 次：糖果像瀑布一樣倒出來，堆成一座山
    { at: O4, kind: 'blow', x: MOUTH.x, y: MOUTH.y, to: { x: STAND.x, y: 48 }, emoji: '🍬', n: 8, dur: 0.45, scale: 2 },
    { at: O4 + 0.05, kind: 'blow', x: MOUTH.x, y: MOUTH.y, to: { x: 92, y: 62 }, emoji: '🍭', n: 7, dur: 0.45, scale: 1.8 },
    ...mountain(O4 + 0.08, EAT),
    // 吃光：打嗝
    { at: FULL + 0.05, kind: 'pop', actor: 'jerry', dx: 6, dy: 6, emoji: '😋', dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把窗戶、倒退跑的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    { at: LAND1, dur: 0.3, do: 'shake', amount: 0.5 },
    { at: O2 + 0.35, dur: 0.4, do: 'punch', amount: 0.05, to: { x: 112, y: 50 } },
    { at: O2 + 0.35, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: CATCH3, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: FLAT3, dur: 0.4, do: 'shake', amount: 2.2 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: 76, y: 45 } },
    { at: BURIED - 0.1, dur: 0.4, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '糖' },
    ...k1.cues,
    { at: O1 + 0.05, sfx: 'blip' },
    { at: LAND1, sfx: 'plop' },
    ...k2.cues,
    { at: O2 + 0.05, sfx: 'blip' },
    { at: O2 + 0.35, sfx: 'bonk' },
    { at: O2 + 0.45, sfx: 'plop' },
    { at: O2 + 0.55, sfx: 'plop' },
    ...k3.cues,
    { at: O3 + 0.05, sfx: 'blip' },
    { at: TOSS3, sfx: 'whoosh' },
    { at: CATCH3, sfx: 'boing' },
    { at: FLAT3, sfx: 'bonk' },
    { at: HOME + 0.2, say: '糖' },
    { at: WORD, say: '糖果' },
    ...k4.cues,
    { at: O4 + 0.05, sfx: 'blip' },
    { at: O4 + 0.1, sfx: 'rumble' },
    { at: EAT, sfx: 'gulp' },
    { at: EAT + 0.13, sfx: 'gulp' },
    { at: EAT + 0.26, sfx: 'gulp' },
    { at: FULL + 0.05, sfx: 'hic' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '糖' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
