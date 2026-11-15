import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 獅（v2）：大獅子很愛現。牠深吸一口氣（胸口鼓起來、頭往後仰）——「吼——！」一聲大吼，一圈一圈粗粗的聲波和大風從嘴巴掃過整個畫面，
// 把站在對面的豬探長吹得東倒西歪，一次比一次慘：雙手按住帽子、被吹得往後滑（嘴裡吼出犭）→ 整個人被吹飛到後面，
// 抓住一棵細細的樹才沒飛走（吼出師的左半）→ 先停一拍：他躲在樹後面蹲低抱頭，獅子這次吸氣吸特別久、整隻脹得圓圓的⋯⋯
// 吼！連人帶樹被吹出畫面（吼出師的右半）。獅子每次吼完都得意地甩甩鬃毛。
// 語詞那一刻獅子走到中間、甩一下鬃毛，豬探長站在旁邊指著牠：「獅子」。
// 回馬槍（第四次）：獅子又深吸一口氣要吼——一隻小小的忍者小老鼠走到牠面前，輕輕「吱」一聲（小小一圈聲波），
// 獅子嚇得跳起來、縮成一團發抖、鬃毛炸開，小老鼠愣住，豬探長笑翻。
// 最後畫面暗下來只剩「獅」，豬探長問「這是什麼字？」，手放耳邊等他回答，再指著字說「獅！」，然後退場只留字。
// 刻意不跟「早」（公雞一叫、人被震得往上彈）、「呆」、「熊」撞：這支只演「吸氣→吼→被風往後吹」。
// 獅、獅、獅子、這是什麼字？、獅

/** 豬探長：站在左邊、朝右（圖朝左，要 flip） */
const SP = 36
const PY = 77 - 0.42 * SP
const X = 54
/** 獅子：這個字講的就是牠，畫面上最大。站在右邊、朝左（不用 flip） */
const SL = 58
const LY = 77 - 0.42 * SL
const LX = 117
/** 三張獅子同一個比例，但各自置中：吼的那張身體往右偏，swap 時 x 往左補 0.076 × size 腳才對齊 */
const ROAR_DX = -0.076 * SL
/** 細細的樹：豬探長身後，第二次被吹過去抓住它 */
const ST = 50
const TX = 30
const TY = 77 - 0.42 * ST
/** 第二次抓住樹時他站的地方（樹的左邊，雙手往右抓住樹幹） */
const GRIP = TX - 7
/** 字框一開始就在上方偏左（獅子在右邊、樹在左邊，聲波在中間偏下）：背後是素色的天空 */
const FRAME = { x: 62, y: 17 }
const FRAME_K = 0.42

/** 獅子圖（0～1、朝左）上的一點：圖畫在 x、y（中心）、放大 s 倍時的位置 */
const lpt = (x: number, u: number, v: number, s = 1, y = LY): Vec => ({ x: x + (u - 0.5) * SL * s, y: y + (v - 0.5) * SL * s })
/** 吼的那張張大的嘴（u 0.3、v 0.47） */
const MOUTH = { u: 0.3, v: 0.47 }

/** 聲波的顏色：深橘紅，淺色天空上看得清楚；風的線條：灰藍 */
const WAVE = '#C2410C'
const WIND = '#6F82A6'

/**
 * 聲波：從 o（嘴巴）往左一圈一圈打出去、越打越遠（每一圈晚一點出現），n 圈。每一圈是一段 ( 形的粗弧（三截粗線），
 * 圈越大弧越扁，上下不超過 h，才不會掃到上面的字框。base 是吼的人那時候站的位置（line 的起點照角色位置算）。
 */
function waves(at: number, who: string, base: Vec, o: Vec, n: number, width: number, step = 11, h = 15, dir = 180): Fx[] {
  const out: Fx[] = []
  const d = dir * Math.PI / 180
  for (let i = 0; i < n; i++) {
    const r = 5 + step * i
    const half = Math.min(36 * Math.PI / 180, Math.asin(Math.min(1, h / r)))
    const pts = [0, 1, 2, 3].map((j) => {
      const a = d - half + (2 * half * j) / 3
      return { x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r }
    })
    for (let j = 0; j < 3; j++) {
      out.push({ at: at + 0.05 * i, dur: 0.3, kind: 'line', actor: who, dx: pts[j].x - base.x, dy: pts[j].y - base.y,
        to: pts[j + 1], color: WAVE, width })
    }
  }
  return out
}

/** 大風：幾條長長的灰藍線從獅子嘴巴前面往左一路拉過整個畫面 */
function wind(at: number, dur: number, base: Vec, n: number): Fx[] {
  const ys = [56, 44, 66, 50, 61]
  return ys.slice(0, n).map((y, i): Fx => ({
    at: at + 0.06 + 0.05 * i, dur, kind: 'line', actor: 'lion',
    dx: 86 - 3 * i - base.x, dy: y - base.y, to: { x: -12, y: y + 1 }, color: WIND, width: 1.1,
  }))
}

/** 每一次吸氣多久（第三次吸特別久、脹得圓圓的；第四次被小老鼠打斷） */
const INHALE = [0.5, 0.5, 0.95]
/** 每一次吼多久（風吹多久） */
const BLOW = [0.45, 0.6, 0.6]

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 同一個笑點：獅子深吸一口氣（prop:lion 頭往後仰、胸口鼓起來，停得住）→
 * 「吼——！」換成張大嘴那張（prop:lion-roar）往前一衝：鏡頭推一下＋震、淡淡的白光、同一個吼聲（一次多疊一個音），
 * 一圈一圈粗粗的聲波＋大風從嘴巴掃過整個畫面 → 吼完換回站好那張，得意地甩甩鬃毛。
 * at 是吼的那一刻，k 是第幾次（0～2）。被吹到的反應（按帽子、抓樹、飛走）由呼叫的人寫。
 */
function roar(at: number, k: number, x = LX): Gag {
  const inhale = INHALE[k]
  const blow = BLOW[k]
  const big = k === 2 ? 1.16 : 1.07
  const lean = k === 2 ? 12 : 8
  const s0 = at - inhale
  const rx = x + ROAR_DX
  const moves: Move[] = [
    // 吸氣：頭往後仰、胸口鼓起來（第三次脹得圓圓的）
    { at: s0, dur: inhale * 0.7, actor: 'lion', do: 'rotateTo', amount: lean, ease: 'out' },
    { at: s0, dur: inhale * 0.7, actor: 'lion', do: 'scaleTo', amount: big, ease: 'out' },
    // 吼！往前一衝
    { at, actor: 'lion', do: 'swap', emoji: 'prop:lion-roar' },
    { at, dur: 0.01, actor: 'lion', do: 'moveTo', to: { x: rx, y: LY } },
    { at, dur: 0.1, actor: 'lion', do: 'rotateTo', amount: -lean - 4, ease: 'out' },
    { at, dur: 0.3, actor: 'lion', do: 'scaleTo', amount: 1 / big, ease: 'elastic' },
    { at: at + 0.1, dur: blow - 0.1, actor: 'lion', do: 'shake', amount: 0.5 + 0.2 * k },
    // 吼完：換回站好、得意地甩甩鬃毛
    { at: at + blow, actor: 'lion', do: 'swap', emoji: 'prop:lion' },
    { at: at + blow, dur: 0.01, actor: 'lion', do: 'moveTo', to: { x, y: LY } },
    { at: at + blow, dur: 0.12, actor: 'lion', do: 'rotateTo', amount: 4 },
    { at: at + blow + 0.12, dur: 0.4, actor: 'lion', do: 'tilt', amount: 7, times: 2 },
  ]
  const base = { x: rx, y: LY }
  const o = lpt(rx, MOUTH.u, MOUTH.v)
  const fx: Fx[] = [
    ...waves(at, 'lion', base, o, 5 + k, 2.8 + 0.5 * k, 14, 19),
    ...wind(at, blow, base, 3 + k),
  ]
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.06 + 0.02 * k, to: { x: 76, y: 50 } },
    { at, dur: blow, do: 'shake', amount: 0.8 + 0.4 * k },
  ]
  // 淡淡的白光：不要把主角刷白
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.07 },
    { at: at + 0.04, dur: 0.2, level: 0 },
  ]
  const cues: Cue[] = [{ at, sfx: 'rumble' }, { at: at + 0.05, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.2, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.3, sfx: 'bonk' })
  return { moves, fx, camera, cues, lights }
}

// ---- 時間表 ----
/** 第一次：雙手按住帽子、被吹得往後滑一小段 */
const H1 = 2.05
const g1 = roar(H1, 0)
const SLIDE1 = 45
/** 第二次：整個人被吹飛到後面，抓住樹才沒飛走 */
const H2 = 4.0
const g2 = roar(H2, 1)
/** 停一拍：他躲到樹後面蹲低抱頭；獅子吸特別久 */
const BEAT = H2 + BLOW[1] + 0.75
const H3 = BEAT + 0.3 + INHALE[2]
const g3 = roar(H3, 2)
/** 樹被吹彎、他頂著風抖、傻眼⋯⋯連人帶樹飛出畫面 */
const BLAST = H3 + 0.3
/** 拼好後國字放大到中間；他頭暈暈地走回來 */
const HOME = BLAST + 0.45
const BACK = HOME + 0.15
const PARK = HOME + 0.85
/** 語詞那一刻：獅子走到中間，甩一下鬃毛 */
const WORD = PARK + 0.35
const WX = 100
const WS = 1.08
const WY = 77 - 0.42 * SL * WS
/** 回馬槍：獅子又吸氣，小老鼠走到牠面前「吱」 */
const S4 = WORD + 0.6
const SQUEAK = S4 + 0.75
const MS = 22
const MY = 77 - 0.42 * MS
const MX = 60
const ASK = 11.1
const ANSWER = 13.65
const AX = 36
const ASK_S = 1.3

const all = [g1, g2, g3]

const clip: Clip = {
  format: 2,
  char: '獅',
  meta: { theme: '獅子一吼，風好大', cast: '豬探長＋獅子＋小老鼠＋一棵細樹', gags: ['愛現的大獅子深吸一口氣，「吼——！」一聲大吼，一圈一圈的聲波和大風把站在對面的豬探長吹得東倒西歪，一次比一次慘（按住帽子往後滑→被吹飛、抓住一棵樹才沒飛走→停一拍他躲在樹後蹲低抱頭，獅子吸特別久、脹得圓圓的，連人帶樹被吹出畫面），獅子每次都得意地甩鬃毛；回馬槍是獅子又吸氣要吼，一隻小小的忍者小老鼠走到牠面前輕輕「吱」一聲，獅子嚇得跳起來縮成一團發抖'] },
  duration: 15,
  // 草原：淡黃的天空、黃綠色的草地；深橘紅的聲波、灰藍的風在淺色天空上看得清楚
  bg: { top: '#FFE9B8', bottom: '#FFF8E6', floor: '#C8D97A', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tall-tree', x: TX, y: TY, size: ST },
    { id: 'lion', emoji: 'prop:lion', x: LX, y: LY, size: SL },
    { id: 'pig', emoji: 'hero:pig/walk', x: X, y: PY, size: SP, hidden: true, flip: true },
    { id: 'mouse', emoji: 'hero:mouse/walk', x: MX, y: MY, size: MS, hidden: true, flip: true },
  ],
  moves: [
    // 開場：他走進來，指著字框——獅！再看向獅子
    { at: 0, dur: 0.45, actor: 'pig', do: 'enter', from: { x: -22, y: PY }, ease: 'out' },
    { at: 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    // 獅子很愛現：甩甩鬃毛
    { at: 0.9, dur: 0.4, actor: 'lion', do: 'tilt', amount: 6, times: 2 },
    // 第一次：吸氣（他愣住看）→ 吼！雙手按住帽子，被吹得往後滑
    { at: H1 - INHALE[0], actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    ...g1.moves,
    { at: H1 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: H1 + 0.05, dur: BLOW[0], actor: 'pig', do: 'moveTo', to: { x: SLIDE1, y: PY }, ease: 'out' },
    { at: H1 + 0.05, dur: BLOW[0], actor: 'pig', do: 'shake', amount: 0.6 },
    { at: H1 + BLOW[0] + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: H1 + 1.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: H1 + 1.15, dur: 0.35, actor: 'pig', do: 'moveTo', to: { x: X, y: PY } },
    { at: H1 + 1.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/stomp' },
    // 第二次：同樣站好 → 吸氣 → 吼！整個人被吹飛到後面，抓住樹，身體往後倒著抖
    { at: H2 - INHALE[1], actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    ...g2.moves,
    { at: H2 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/slip' },
    { at: H2 + 0.05, dur: 0.22, actor: 'pig', do: 'moveTo', to: { x: GRIP, y: PY - 4 }, ease: 'out' },
    { at: H2 + 0.27, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: H2 + 0.27, dur: 0.1, actor: 'pig', do: 'rotateTo', amount: -22 },
    { at: H2 + 0.27, dur: BLOW[1] - 0.2, actor: 'pig', do: 'shake', amount: 0.9 },
    { at: H2 + 0.27, dur: BLOW[1] - 0.2, actor: 'tree', do: 'shake', amount: 0.6 },
    { at: H2 + 0.05, dur: 0.2, actor: 'tree', do: 'rotateTo', amount: -8 },
    // 風停了：掉下來跌坐、傻眼
    { at: H2 + BLOW[1] + 0.05, dur: 0.12, actor: 'pig', do: 'rotateTo', amount: 22 },
    { at: H2 + BLOW[1] + 0.05, dur: 0.12, actor: 'pig', do: 'moveTo', to: { x: GRIP, y: PY } },
    { at: H2 + BLOW[1] + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
    { at: H2 + BLOW[1] + 0.05, dur: 0.3, actor: 'tree', do: 'rotateTo', amount: 8, ease: 'elastic' },
    // 停一拍：他躲到樹後面，蹲低抱頭發抖；獅子這次吸特別久
    { at: BEAT, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: BEAT + 0.1, dur: H3 - BEAT - 0.1, actor: 'pig', do: 'shake', amount: 0.4 },
    ...g3.moves,
    // 吼！樹被吹彎，他頂著風抖⋯⋯連人帶樹被吹出畫面
    { at: H3 + 0.05, dur: 0.2, actor: 'tree', do: 'rotateTo', amount: -30, ease: 'out' },
    { at: H3 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: H3 + 0.05, dur: 0.25, actor: 'pig', do: 'shake', amount: 1 },
    { at: BLAST, dur: 0.3, actor: 'tree', do: 'moveTo', to: { x: -40, y: TY - 12 }, ease: 'in' },
    { at: BLAST, dur: 0.3, actor: 'tree', do: 'rotateTo', amount: -60, ease: 'in' },
    { at: BLAST, actor: 'pig', do: 'swap', emoji: 'hero:pig/slip' },
    { at: BLAST, dur: 0.28, actor: 'pig', do: 'moveTo', to: { x: -30, y: PY - 10 }, ease: 'in' },
    { at: BLAST, dur: 0.28, actor: 'pig', do: 'spin', times: -1, pivot: 'center' },
    { at: BLAST + 0.32, actor: 'tree', do: 'vanish', dur: 0.01 },
    // 獅子吼完往右退，讓出中間給國字
    { at: H3 + BLOW[2] + 0.02, dur: 0.3, actor: 'lion', do: 'moveTo', to: { x: 138, y: LY } },
    // 他頭暈暈地走回來
    { at: BACK, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: BACK, dur: 0.01, actor: 'pig', do: 'moveTo', to: { x: -25, y: PY } },
    { at: BACK + 0.02, dur: 0.5, actor: 'pig', do: 'moveTo', to: { x: 34, y: PY }, ease: 'out' },
    { at: BACK + 0.52, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 語詞那一刻：國字讓位，獅子走到中間、變大，甩一下鬃毛；他站起來指著牠：獅子！
    { at: PARK, dur: 0.35, actor: 'lion', do: 'moveTo', to: { x: WX, y: WY } },
    { at: PARK, dur: 0.35, actor: 'lion', do: 'scaleTo', amount: WS },
    { at: WORD - 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'pig', do: 'hop', amount: 3 },
    { at: WORD, dur: 0.5, actor: 'lion', do: 'tilt', amount: 8, times: 2 },
    // 回馬槍（第四次）：獅子又吸一口氣要吼——他嚇得蹲下抱頭；小老鼠從旁邊走到獅子面前
    { at: S4, dur: 0.45, actor: 'lion', do: 'rotateTo', amount: 9, ease: 'out' },
    { at: S4, dur: 0.45, actor: 'lion', do: 'scaleTo', amount: 1.07, ease: 'out' },
    { at: S4 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: S4 - 0.15, dur: 0.5, actor: 'mouse', do: 'enter', from: { x: -20, y: MY } },
    { at: S4 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    // 吱！獅子嚇得跳起來，縮成一團發抖、鬃毛炸開
    { at: SQUEAK, dur: 0.15, actor: 'mouse', do: 'hop', amount: 1.5 },
    { at: SQUEAK + 0.1, actor: 'lion', do: 'swap', emoji: 'prop:lion-scared' },
    { at: SQUEAK + 0.1, dur: 0.01, actor: 'lion', do: 'rotateTo', amount: -9 },
    { at: SQUEAK + 0.1, dur: 0.01, actor: 'lion', do: 'scaleTo', amount: 1 / 1.07 },
    { at: SQUEAK + 0.1, dur: 0.4, actor: 'lion', do: 'hop', amount: 8 },
    { at: SQUEAK + 0.5, dur: 0.75, actor: 'lion', do: 'shake', amount: 0.9 },
    { at: SQUEAK + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: SQUEAK + 0.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: SQUEAK + 0.65, dur: 0.25, actor: 'mouse', do: 'hop', amount: 2.5 },
    { at: SQUEAK + 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
    { at: SQUEAK + 0.45, dur: 0.22, actor: 'pig', do: 'hop', amount: 2 },
    { at: SQUEAK + 0.75, dur: 0.22, actor: 'pig', do: 'hop', amount: 2 },
    // 獅子逃出右邊，小老鼠蹦蹦跳跳追過去
    { at: ASK - 0.3, actor: 'lion', do: 'flip' },
    { at: ASK - 0.3, dur: 0.35, actor: 'lion', do: 'moveTo', to: { x: 205, y: WY }, ease: 'in' },
    { at: ASK - 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: ASK - 0.25, dur: 0.35, actor: 'mouse', do: 'moveTo', to: { x: 185, y: MY }, ease: 'in' },
    // 問他：放大，轉向觀眾
    { at: ASK - 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ASK - 0.15, dur: 0.3, actor: 'pig', do: 'moveTo', to: { x: AX, y: PY - 1 }, ease: 'out' },
    { at: ASK + 0.3, dur: 0.3, actor: 'pig', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.7, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    { at: 13.2, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, dur: 0.3, actor: 'pig', do: 'hop', amount: 7 },
    // 退場（往左跑出去），畫面只留下字
    { at: ANSWER + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: ANSWER + 0.12, actor: 'pig', do: 'flip' },
    { at: ANSWER + 0.12, dur: 0.18, actor: 'pig', do: 'moveTo', to: { x: -45, y: PY - 1 }, ease: 'in' },
  ],
  builds: [
    // 每吼一次，張大的嘴巴就吼出一組筆畫：犭 → 師的左半 → 師的右半
    { at: H1 + 0.08, dur: 0.45, strokes: [0, 1, 2], from: lpt(LX + ROAR_DX, MOUTH.u, MOUTH.v), color: partColor('犭') },
    { at: H2 + 0.08, dur: 0.5, strokes: [3, 4, 5, 6, 7, 8], from: lpt(LX + ROAR_DX, MOUTH.u, MOUTH.v), color: partColor('𠂤') },
    { at: H3 + 0.08, dur: 0.5, strokes: [9, 10, 11, 12], from: lpt(LX + ROAR_DX, MOUTH.u, MOUTH.v), color: partColor('帀') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['pig'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    // 被吹到：汗噴出來
    { at: H1 + BLOW[0] + 0.1, kind: 'sweat', actor: 'pig', dx: -5 },
    { at: BEAT + 0.1, kind: 'sweat', actor: 'pig', dx: -5 },
    // 頭暈暈地走回來
    { at: BACK + 0.55, dur: 0.75, kind: 'dizzy', actor: 'pig' },
    // 語詞那一刻：獅子身邊亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: WX, y: 48, n: 8, emoji: '✨', scale: 1.3 },
    // 回馬槍：小老鼠「吱」——小小一圈聲波（跟獅子的吼聲同一種，只是好小）
    ...waves(SQUEAK, 'mouse', { x: MX, y: MY }, { x: MX + 5, y: MY - 6 }, 3, 2.2, 3.5, 6, 0),
    { at: SQUEAK + 0.15, kind: 'sweat', actor: 'lion', dx: -14, dy: 4, scale: 1.4 },
    { at: SQUEAK + 0.15, kind: 'pop', actor: 'mouse', emoji: '❓', dx: -4, dur: 0.45 },
  ],
  camera: [
    // 鏡頭鎖全景（聲波從右邊掃到左邊，兩個人都要在畫面裡），只有吼的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: SQUEAK + 0.1, dur: 0.35, do: 'punch', amount: 0.1, to: { x: WX - 10, y: 45 } },
    { at: SQUEAK + 0.1, dur: 0.35, do: 'shake', amount: 1.2 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '獅' },
    ...all.flatMap((g) => g.cues),
    { at: BLAST, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '獅' },
    { at: WORD, say: '獅子' },
    { at: SQUEAK, sfx: 'blip' },
    { at: SQUEAK + 0.1, sfx: 'boing' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '獅' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
