import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 窗（v2）：一本正經的狗狗警長是擦窗工。磚牆上一扇大窗戶，玻璃髒髒的，他拿海綿「吱吱吱」把四格玻璃擦得亮晶晶（✨），
// 得意地轉身——調皮的小鳥就從右上飛過來，丟下一顆泥巴球「啪」地糊在玻璃上，他回頭傻眼、嚇得跳起來，一次比一次髒：
// 一小坨泥巴黏在一格上（宀從窗戶飛出來）→ 一大顆泥巴球糊滿一整格、往下流（八）→
// 先停一拍：他擦完不轉身，叉腰瞪著右上的天空等……沒來，鬆一口氣、得意轉身——最大的一團泥巴加落葉把整扇窗糊成咖啡色，
// 他嚇得往後跳到畫面另一頭、跌坐（囱從窗框飛出來）。字拼好放大時，牆和窗戶縮到字的右邊讓位。
// 語詞那一刻：牆回到中間，他衝回去用力擦，窗戶亮到發光，他敬禮：「窗戶」。
// 回馬槍（第四次）：他又得意轉身，小鳥又來了——可是玻璃擦得太乾淨，牠根本沒看到，「咚！」一頭撞在玻璃上、扁扁地貼著滑下來，
// 窗戶還是亮晶晶的；警長嚇得跳最高，然後捧腹大笑。
// 最後畫面暗下來只剩「窗」，警長問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「窗！」，然後退場只留字。
// 刻意不跟「糖」（敲窗、窗裡丟出糖果）、「筆」（畫一扇窗、老虎從窗裡撲出來）、「樹」「摸」「喜」（打開、裡面跑出東西）撞：這支窗戶從頭到尾都不打開；
// 也不跟「洗」（被潑顏料、洗澡）、「新」（烏雲丟泥巴打髒新東西）撞：髒的是窗戶玻璃，泥巴是小鳥丟的，他擦的是窗戶不是自己。
// 窗、窗、窗戶、這是什麼字？、窗

/** 狗狗警長（圖朝左；flip 朝右看窗戶） */
const SS = 34
const SY = 77 - 0.42 * SS
/** 每次都站在這裡擦窗戶（窗戶左邊），擦的時候往前靠一點 */
const STAND = 66
const NEAR = 72
/** 擦完往後跳、跌坐的地方（國字回中央那一秒他在字的左邊） */
const LEFT = 24

/** 大窗戶（prop:window，size 50）：x 73–115、y 30–70，玻璃 x 81–107、y 35–61 */
const WS = 50
const WIN: Vec = { x: 94, y: 47 }
/** 四格玻璃的中心（左上、右上、左下、右下） */
const PANE: Vec[] = [{ x: 87, y: 41 }, { x: 101, y: 41 }, { x: 87, y: 55 }, { x: 101, y: 55 }]
/** 玻璃正中間 */
const GLASS: Vec = { x: 94, y: 48 }
/** 窗戶後面的磚牆（拉高一點：x 58–130、y 21–77） */
const WALL_S = 88
const WALL: Vec = { x: 94, y: 36.5 }
const WALL_K = 0.892
/** 國字回中央時，牆和窗戶一起縮小、讓到右邊（以牆腳為準縮） */
const SIDE_K = 0.5
const SIDE_DX = 45
const FEET_Y = 77.5
/** 縮小後的位置：腳底（y + 0.42 × size）以牆腳為準縮過去 */
const side = (y: number, size: number): Vec => {
  const feet = y + 0.42 * size
  return { x: WIN.x + SIDE_DX, y: FEET_Y + SIDE_K * (feet - FEET_Y) - 0.42 * size }
}
const WALL_SIDE = side(WALL.y, WALL_S)
const WIN_SIDE = side(WIN.y, WS)

/** 小鳥：從右上飛來、停在窗戶上方丟泥巴 */
const BIRD_IN: Vec = { x: 176, y: 4 }
const OVER: Vec = { x: 112, y: 17 }
const BIRD_OUT: Vec = { x: 122, y: -22 }

/** 泥巴 */
const MUD = '#6B4A2B'
/** 一開始的灰灰污漬 */
const GREY = '#8E8E84'
/** 整扇窗糊成泥巴 */
const MUDDY = 'sepia(1) saturate(1.5) brightness(.55)'

/** 海綿拿在手上的位置 */
const hand = (x: number, faceRight: boolean): Vec => ({ x: x + (faceRight ? 9 : -9), y: SY - 4 })

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 一坨污漬：一段很短、很粗的管子（深色描邊＋本色），貼在窗戶上，從 at 到 end */
const blob = (c: Vec, w: number, at: number, end: number, color = MUD, len = 1.2): Fx =>
  ({ at, dur: end - at, kind: 'tube', actor: 'window', dx: c.x - WIN.x, dy: c.y - len / 2 - WIN.y, to: { x: c.x + 0.2, y: c.y + len / 2 }, width: w, color, n: 99 })
/** 泥巴往下流的一條 */
const drip = (x: number, y0: number, y1: number, w: number, at: number, end: number): Fx =>
  ({ at, dur: end - at, kind: 'tube', actor: 'window', dx: x - WIN.x, dy: y0 - WIN.y, to: { x, y: y1 }, width: w, color: MUD, n: 99 })

/**
 * 同一個動作「吱吱吱」：往前靠、海綿照 Z 字擦過四格玻璃（每格吱一聲），擦回手上；
 * 「叮」玻璃亮晶晶（✨＋窗戶發光）。k 是第幾次（0～3），一次比一次拚（跳得越高）。
 * 回傳每格被擦到的時間（那一格的髒東西擦到就不見）與亮起來的那一刻。
 */
function wipe(at: number, k: number): Gag & { hit: number[]; shine: number } {
  const step = 0.1
  const hit = PANE.map((_, i) => at + 0.12 + i * step)
  const shine = hit[3] + 0.15
  const moves: Move[] = [
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at, actor: 'sheriff', do: 'moveTo', to: { x: NEAR, y: SY }, dur: 0.12 },
  ]
  const cues: Cue[] = []
  PANE.forEach((p, i) => {
    moves.push({ at: hit[i] - step + 0.02, actor: 'sponge', do: 'moveTo', to: p, dur: step - 0.02, ease: 'linear' })
    moves.push({ at: hit[i], actor: 'sponge', do: 'tilt', amount: i % 2 ? -18 : 18, dur: 0.1 })
    // 擦上面那排要跳起來（一次比一次跳得高）
    if (i < 2 && k > 0) moves.push({ at: hit[i] - 0.06, actor: 'sheriff', do: 'hop', amount: 1.5 + 1.5 * k, dur: 0.12 })
    cues.push({ at: hit[i], sfx: 'blip' })
  })
  moves.push(
    { at: hit[3] + 0.06, actor: 'sponge', do: 'moveTo', to: hand(NEAR, true), dur: 0.12 },
    { at: shine, actor: 'window', do: 'flash', dur: 0.5 },
  )
  const fx: Fx[] = [
    { at: shine, kind: 'burst', x: GLASS.x, y: GLASS.y, emoji: '✨', n: 7, dur: 0.5, scale: 1.1 + 0.15 * k },
    { at: shine + 0.05, kind: 'pop', x: PANE[1].x - 2, y: PANE[1].y - 1, emoji: '✨', dur: 0.45, scale: 1 + 0.1 * k },
  ]
  if (k >= 1) fx.push({ at: hit[1], kind: 'sweat', actor: 'sheriff', dx: -4 })
  cues.push({ at: shine, sfx: 'clink' })
  return { hit, shine, moves, fx, camera: [], cues }
}

/** 得意轉身：背對窗戶、閉眼得意，海綿換到另一隻手 */
const turnAway = (at: number): Move[] => [
  { at, actor: 'sheriff', do: 'flip' },
  { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
  { at, actor: 'sheriff', do: 'moveTo', to: { x: STAND, y: SY }, dur: 0.15 },
  { at, actor: 'sponge', do: 'moveTo', to: hand(STAND, false), dur: 0.15 },
]

/**
 * 小鳥從右上飛來、停在窗戶上方，「咻」丟下一顆泥巴球「啪」地糊在 spot 上。k 越大泥巴球越大。
 * at 是糊上去的那一刻。
 */
function splat(at: number, k: number, spot: Vec): Gag {
  const moves: Move[] = [
    { at: at - 0.62, actor: 'bird', do: 'moveTo', to: BIRD_IN, dur: 0.01 },
    { at: at - 0.6, actor: 'bird', do: 'moveTo', to: OVER, dur: 0.32, ease: 'out' },
    { at: at - 0.24, actor: 'bird', do: 'hop', amount: 2, dur: 0.18 },
    { at, actor: 'window', do: 'shake', amount: 0.6 + 0.3 * k, dur: 0.25 },
    { at: at + 0.1, actor: 'bird', do: 'moveTo', to: BIRD_OUT, dur: 0.35, ease: 'in' },
  ]
  const fx: Fx[] = [
    // 泥巴球從小鳥腳下丟出去
    { at: at - 0.2, kind: 'blow', actor: 'bird', dx: -2, dy: 8, to: spot, emoji: '🟤', n: 1, dur: 0.32, scale: 1 + 0.3 * k },
    // 啪：泥巴噴開
    { at, kind: 'burst', x: spot.x, y: spot.y, emoji: '🟤', n: 6 + 2 * k, dur: 0.45, scale: 0.5 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: GLASS.x, y: 46 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at: at - 0.6, sfx: 'whoosh' }, { at, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'plop' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 聽到「啪」：回頭（轉回去看窗戶）傻眼（跳多高寫在呼叫的地方，一次比一次高） */
const startle = (at: number): Move[] => [
  { at, actor: 'sheriff', do: 'flip' },
  { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
  { at, actor: 'sponge', do: 'moveTo', to: hand(STAND, true), dur: 0.05 },
]

// ── 開場：拿著海綿走進來，抬頭指著左上角的字框唸「窗」
const SAY1 = 0.6
// ── 第 1 次
const w1 = wipe(0.95, 0)
const T1 = w1.shine + 0.55
const s1 = splat(T1, 0, PANE[1])
// ── 第 2 次
const w2 = wipe(T1 + 0.7, 1)
const T2 = w2.shine + 0.55
const s2 = splat(T2, 1, PANE[0])
// ── 第 3 次：擦完先停一拍，叉腰瞪著右上的天空等
const w3 = wipe(T2 + 0.7, 2)
const GLARE = w3.shine + 0.12
const TURN3 = GLARE + 0.55
const T3 = TURN3 + 0.5
const s3 = splat(T3, 2, GLASS)
/** 嚇得往後跳到左邊、跌坐 */
const LAND3 = T3 + 0.62
/** 字框填滿、國字到正中央（牆和窗戶縮到右邊） */
const HOME = LAND3 + 0.13
const PARK = HOME + 0.9
// ── 語詞：牆回中間，他衝回去用力擦，亮到發光，敬禮「窗戶」
const BACK = PARK
const w4 = wipe(BACK + 0.42, 3)
const WORD = w4.shine + 0.05
// ── 回馬槍（第 4 次）：得意轉身，小鳥又來——一頭撞在太乾淨的玻璃上
const TURN4 = WORD + 0.4
const T4 = TURN4 + 0.45
/** 問他 */
const ASK = T4 + 0.75
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
/** 問他時他站的地方（左前方，國字讓到右邊） */
const ASK_AT: Vec = { x: 32, y: SY + 4 }

/** 第 1 次：一小坨泥巴黏在右上那一格 */
const dirt1 = (end: number): Fx[] => [
  blob(PANE[1], 5, T1, end),
  blob({ x: 97, y: 38 }, 1.6, T1, end, MUD, 0.4),
  blob({ x: 104.5, y: 44.5 }, 1.4, T1, end, MUD, 0.4),
  drip(101, 43.5, 47.5, 1.6, T1, end),
]
/** 第 2 次：一大顆泥巴球糊滿左上那一格、往下流 */
const dirt2 = (end: number): Fx[] => [
  blob(PANE[0], 11, T2, end),
  drip(84, 46, 52, 2.4, T2, end),
  drip(89.5, 46, 50, 2, T2, end),
  blob({ x: 80.5, y: 36.5 }, 1.8, T2, end, MUD, 0.4),
  blob({ x: 94, y: 36 }, 1.6, T2, end, MUD, 0.4),
  blob({ x: 99, y: 56 }, 3.5, T2, end),
]
/** 第 3 次：整扇窗糊滿（窗戶染成咖啡色＋四格各一大團＋落葉）；ends 是四格各自什麼時候被擦掉 */
const dirt3 = (at: number, ends: number[]): Fx[] => [
  ...PANE.map((p, i) => blob(p, 10, at, ends[i])),
  ...[[83, 49, 0], [99, 38, 1], [96, 58, 3]].map(([x, y, i]): Fx =>
    ({ at, dur: ends[i] - at, kind: 'pop', x: x - 6, y: y + 6, emoji: '🍂', scale: 0.85 })),
]

const clip: Clip = {
  format: 2,
  char: '窗',
  meta: { theme: '擦窗戶', cast: '狗狗警長＋小鳥＋大窗戶＋磚牆', gags: ['狗狗警長每次把窗戶擦得亮晶晶、得意轉身，小鳥就飛來丟泥巴「啪」地糊在玻璃上，一次比一次髒（一小坨→糊滿一格→整扇窗連落葉都糊住），他回頭嚇得一次比一次跳得高；回馬槍是他把窗戶擦到亮得發光，小鳥根本沒看到玻璃，「咚」一頭撞上去、扁扁地滑下來'] },
  duration: 15,
  bg: { top: '#BFE3FF', bottom: '#F2FAFF', floor: '#C9E3A0', scenery: 'hills' },
  actors: [
    { id: 'wall', emoji: 'prop:brick-wall', x: WALL.x, y: WALL.y, size: WALL_S },
    { id: 'window', emoji: 'prop:window', x: WIN.x, y: WIN.y, size: WS, float: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: STAND, y: SY, size: SS, flip: true, hidden: true },
    { id: 'sponge', emoji: '🧽', ...hand(STAND, true), size: 9, float: true, hidden: true, pivot: 'center' },
    { id: 'bird', emoji: '🐦', x: BIRD_IN.x, y: BIRD_IN.y, size: 12, float: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'wall', do: 'stretchTo', amount: WALL_K, dur: 0.001 },
    // 開場：拿著海綿走進來
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -20, y: SY }, dur: 0.5 },
    { at: 0, actor: 'sponge', do: 'enter', from: hand(-20, true), dur: 0.5 },
    // 轉身抬頭指著字框：窗！
    { at: SAY1 - 0.05, actor: 'sheriff', do: 'flip' },
    { at: SAY1 - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: SAY1 - 0.05, actor: 'sponge', do: 'moveTo', to: hand(STAND, false), dur: 0.1 },
    { at: 0.88, actor: 'sheriff', do: 'flip' },

    // ── 第 1 次：擦掉灰灰的污漬，亮晶晶——轉身——啪，一小坨
    ...w1.moves,
    ...turnAway(w1.shine + 0.12),
    { at: 0.6, actor: 'bird', do: 'pop', dur: 0.01 },
    ...s1.moves,
    ...startle(T1 + 0.12),
    { at: T1 + 0.12, actor: 'sheriff', do: 'hop', amount: 5, dur: 0.35 },
    { at: T1 + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },

    // ── 第 2 次：擦得更拚——轉身——啪，糊滿一格
    ...w2.moves,
    ...turnAway(w2.shine + 0.12),
    ...s2.moves,
    ...startle(T2 + 0.12),
    { at: T2 + 0.12, actor: 'sheriff', do: 'hop', amount: 10, dur: 0.42 },
    { at: T2 + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/stomp' },
    { at: T2 + 0.55, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.15 },

    // ── 第 3 次：擦完先不轉身，叉腰瞪著右上的天空等……沒來，鬆一口氣、得意轉身——啪！整扇窗糊住
    ...w3.moves,
    { at: GLARE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
    { at: GLARE, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.25 },
    { at: GLARE + 0.3, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: TURN3 - 0.05, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.15 },
    ...turnAway(TURN3 + 0.1),
    ...s3.moves,
    { at: T3, actor: 'window', do: 'tint', filter: MUDDY },
    ...startle(T3 + 0.12),
    // 嚇得往後跳到畫面另一頭、跌坐
    { at: T3 + 0.12, actor: 'sheriff', do: 'moveTo', to: { x: LEFT, y: SY }, arc: 8, dur: 0.5, ease: 'out' },
    { at: T3 + 0.12, actor: 'sponge', do: 'moveTo', to: hand(LEFT, true), arc: 8, dur: 0.5, ease: 'out' },
    { at: LAND3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },

    // ── 字框填滿：牆和窗戶縮到右邊讓位
    { at: HOME - 0.1, actor: 'wall', do: 'moveTo', to: WALL_SIDE, dur: 0.4, ease: 'out' },
    { at: HOME - 0.1, actor: 'wall', do: 'scaleTo', amount: SIDE_K, dur: 0.4, ease: 'out' },
    { at: HOME - 0.1, actor: 'window', do: 'moveTo', to: WIN_SIDE, dur: 0.4, ease: 'out' },
    { at: HOME - 0.1, actor: 'window', do: 'scaleTo', amount: SIDE_K, dur: 0.4, ease: 'out' },
    { at: HOME + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },

    // ── 語詞：牆回中間，他衝回去用力擦，亮到發光
    { at: BACK, actor: 'wall', do: 'moveTo', to: WALL, dur: 0.4 },
    { at: BACK, actor: 'wall', do: 'scaleTo', amount: 1 / SIDE_K, dur: 0.4 },
    { at: BACK, actor: 'window', do: 'moveTo', to: WIN, dur: 0.4 },
    { at: BACK, actor: 'window', do: 'scaleTo', amount: 1 / SIDE_K, dur: 0.4 },
    { at: BACK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: BACK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: STAND, y: SY }, dur: 0.35 },
    { at: BACK + 0.05, actor: 'sponge', do: 'moveTo', to: hand(STAND, true), dur: 0.35 },
    ...w4.moves,
    { at: w4.hit[3], actor: 'window', do: 'tint', filter: '' },
    // 敬禮：窗戶！
    { at: WORD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    { at: WORD, actor: 'sheriff', do: 'moveTo', to: { x: STAND - 4, y: SY }, dur: 0.15 },
    { at: WORD, actor: 'sponge', do: 'moveTo', to: hand(STAND - 4, true), dur: 0.15 },

    // ── 回馬槍：得意轉身，小鳥又來——玻璃太乾淨，「咚」一頭撞上去、扁扁地滑下來
    ...turnAway(TURN4),
    { at: T4 - 0.47, actor: 'bird', do: 'moveTo', to: BIRD_IN, dur: 0.01 },
    { at: T4 - 0.45, actor: 'bird', do: 'moveTo', to: { x: GLASS.x + 3, y: 44 }, dur: 0.45, ease: 'in' },
    { at: T4, actor: 'bird', do: 'stretchTo', amount: 1.7, dur: 0.06 },
    { at: T4, actor: 'window', do: 'shake', amount: 1.6, dur: 0.3 },
    { at: T4 + 0.3, actor: 'bird', do: 'moveTo', to: { x: GLASS.x + 3, y: 58 }, dur: 0.4, ease: 'in' },
    ...startle(T4 + 0.12),
    { at: T4 + 0.12, actor: 'sheriff', do: 'hop', amount: 16, dur: 0.5 },
    { at: T4 + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/laugh' },

    // 問他之前：牆、窗戶、小鳥、海綿退掉（畫面暗下來）
    { at: ASK - 0.15, actor: 'bird', do: 'vanish', dur: 0.12 },
    { at: ASK - 0.15, actor: 'window', do: 'vanish', dur: 0.12 },
    { at: ASK - 0.15, actor: 'wall', do: 'vanish', dur: 0.12 },
    { at: ASK - 0.15, actor: 'sponge', do: 'vanish', dur: 0.12 },
    // 問他：走到左前方、變大，面向國字
    { at: ASK + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.1, actor: 'sheriff', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.1, actor: 'sheriff', do: 'scaleTo', amount: 1.45, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: ANSWER + 0.27, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：一小坨泥巴糊上去，窗戶一震——宀
    { at: T1 + 0.05, dur: 0.55, strokes: [0, 1, 2], from: 'window', color: partColor('宀') },
    // 第 2 次：糊滿一格——八
    { at: T2 + 0.05, dur: 0.5, strokes: [3, 4], from: 'window', color: partColor('八') },
    // 第 3 次：整扇窗糊住——窗格子（囱）
    { at: T3 + 0.05, dur: 0.6, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'window', color: partColor('囱') },
  ],
  glyph: [
    // 空字框放在左上角（中間是牆和窗戶）
    { at: 0, dur: 0.01, do: 'park', to: { x: 26, y: 20 }, amount: 0.45 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: { x: 26, y: 20 }, amount: 0.45 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 一開始玻璃上灰灰的污漬（第 1 次擦掉）
    blob({ x: 85, y: 52 }, 3.6, 0, w1.hit[2], GREY),
    blob({ x: 100, y: 44 }, 3, 0, w1.hit[1], GREY),
    blob({ x: 90, y: 39 }, 2.6, 0, w1.hit[0], GREY),
    blob({ x: 103, y: 57 }, 2.8, 0, w1.hit[3], GREY),
    ...w1.fx,
    ...s1.fx,
    ...dirt1(w2.hit[1]),
    ...w2.fx,
    ...s2.fx,
    ...dirt2(w3.hit[0]),
    ...w3.fx,
    // 第 3 次前停一拍：瞪著右上的天空
    { at: GLARE + 0.2, kind: 'sweat', actor: 'sheriff', dx: -4 },
    ...s3.fx,
    { at: T3 + 0.05, kind: 'blow', actor: 'bird', dx: -2, dy: 8, to: GLASS, emoji: '🍂', n: 4, dur: 0.3, scale: 1.4 },
    // 整扇窗糊住：縮到旁邊之前先拿掉（窗戶還是咖啡色），回到中間再貼回去、被擦掉
    ...dirt3(T3, PANE.map(() => HOME - 0.1)),
    ...dirt3(BACK + 0.4, w4.hit),
    { at: LAND3, kind: 'dizzy', actor: 'sheriff', dur: 0.6 },
    // 語詞：亮到發光
    ...w4.fx,
    { at: WORD, kind: 'burst', x: GLASS.x, y: GLASS.y, emoji: '✨', n: 10, dur: 0.6, scale: 1.6 },
    // 回馬槍：咚！
    { at: T4, kind: 'burst', x: GLASS.x + 3, y: 38, n: 1, dur: 0.4, scale: 2 },
    { at: T4 + 0.3, kind: 'dizzy', actor: 'bird', dur: 0.38 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把窗戶、往後跳的他、字框切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: LAND3, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.06, to: { x: 84, y: 46 } },
    { at: T4, dur: 0.45, do: 'punch', amount: 0.08, to: { x: GLASS.x, y: 46 } },
    { at: T4, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '窗' },
    ...w1.cues,
    ...s1.cues,
    ...w2.cues,
    ...s2.cues,
    { at: T2 + 0.12, sfx: 'slide' },
    ...w3.cues,
    ...s3.cues,
    { at: T3 + 0.12, sfx: 'slide' },
    { at: LAND3, sfx: 'plop' },
    { at: HOME + 0.15, say: '窗' },
    ...w4.cues,
    { at: WORD, say: '窗戶' },
    { at: T4 - 0.45, sfx: 'whoosh' },
    { at: T4, sfx: 'bonk' },
    { at: T4 + 0.12, sfx: 'slide' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '窗' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
