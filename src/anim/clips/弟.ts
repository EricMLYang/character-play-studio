import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 弟（v2）：膽小的弟弟。小恐龍（弟弟）跟恐龍姐姐站在草地上，左邊每冒出一樣小東西，他就嚇得「哇！」跳起來，
// 咻地衝到姐姐背後躲好、只露半張臉發抖——姐姐遮嘴咯咯笑，再彎腰指給他看：只是一隻＿啦。他不好意思地走回原位。
// 同一個「東西冒出來→哇！咻地躲到姐姐背後→姐姐笑、指給他看」，嚇到他的東西一次比一次小、他躲得一次比一次誇張：
// 一隻小貓（躲在姐姐腰後面，頭上彈出兩點冷汗＝丷）→ 一隻蝴蝶飛到鼻子前（跳上去縮在姐姐背上抖，縮成一團＝弓）→
// 先停一拍：他東張西望、冒汗，一陣風吹來一片落葉輕輕停在他頭上——「哇！」整個人爬到姐姐頭上（直直站起來的豎＋撇）。
// 語詞那一刻弟弟站在正中間，姐姐彎腰拍拍他：「弟弟」。
// 回馬槍（第四次，反過來）：這次左邊走來的是一隻真的大熊，舉起雙手「吼！」——弟弟又要咻地躲，
// 結果姐姐先嚇得躲到他背後、只露半張臉發抖，他撞上姐姐彈回來，變成站在最前面。他腿發抖、回頭看一眼姐姐、吸一大口氣，
// 仰頭「吼——！」，大熊嚇得跳起來逃走，連姐姐都被那一聲嚇跑了；他自己也嚇一跳，腿一軟坐在地上。
// 最後畫面暗下來只剩「弟」，小恐龍問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「弟！」，然後退場只留字。
// 刻意不跟「怕」（警長被小蜘蛛嚇得往上跳、最後跳進恐龍懷裡）、「哥」（舉得起大象的哥哥被小老鼠嚇跑）、
// 「在」（躲貓貓）、「背」（猴子貼在背後）、「獅」（吼聲把人吹走）撞：這支只演「嚇到就躲到姐姐背後」，最後換他擋在姐姐前面。
// 弟、弟、弟弟、這是什麼字？、弟

/** 小恐龍（弟弟，明星、主角）：站在畫面中間偏左，面向左邊冒出東西的地方（圖朝左，不用 flip） */
const RS = 38
const RY = 77 - 0.42 * RS
const RX = 78
/** 恐龍姐姐（道具圖 prop:sis*，朝左）：比弟弟高一個頭以上，站在右邊 */
const SS = 58
const SY = 77 - 0.42 * SS
const SX = 116
/** 小東西冒出來停住的地方（他左邊） */
const CAT_S = 22
const CAT_Y = 77 - 0.42 * CAT_S
const CAT_X = 44
/** 回馬槍的大熊：同一個角色（小貓）換圖放大，站在左邊、頭在字框下面 */
const BEAR_S = 52
const BEAR_X = 46
/** 字框在左上角：太陽在右上，左上角後面是素色的天空；東西都從左邊地上、字框下面進來 */
const FRAME = { x: 28, y: 21 }
const FRAME_K = 0.46
const WIDE = { x: 80, y: 45 }
/** 國字放大到中間時，弟弟讓到左邊、姐姐讓到右邊 */
const R_SIDE = 22
const S_SIDE = 141

/** 弟弟躲在姐姐背後的三個位置（x、腳底高度、姿勢）：一次比一次高——腰後面 → 背上 → 爬到頭上 */
const HIDE = [
  { x: SX - 15, feet: 77, pose: 'peek' },
  { x: SX - 16, feet: 65, pose: 'scared' },
  { x: SX - 1, feet: 42, pose: 'scared' },
] as const
const footY = (feet: number, size = RS) => feet - 0.42 * size

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/**
 * 固定訊號的前半（四次同一套）：東西停在他面前那一刻，他傻眼（surprised）、頭上冒 ❗、跳一下，停 0.32 秒——
 * 「哇！」翻身換衝刺姿勢（往右）。focus 是嚇到他的東西（鏡頭推近一下）。回傳「哇」那一刻。
 */
function startle(T: number, k: number, focus: Vec) {
  // 推近一下嚇到他的東西，看清楚是什麼
  g.camera.push({ at: T - 0.05, dur: 0.3, do: 'punch', amount: 0.08, to: focus })
  g.moves.push(
    { at: T, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: T, dur: 0.25, actor: 'rex', do: 'hop', amount: 2 + k },
  )
  g.fx.push({ at: T, kind: 'pop', actor: 'rex', emoji: '❗', dx: -12, dy: -2, dur: 0.45, scale: 1.6 + 0.2 * k })
  g.cues.push({ at: T, sfx: 'blip' })
  const W = T + 0.32
  g.moves.push(
    { at: W, dur: 0.01, actor: 'rex', do: 'flip' },
    { at: W, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
  )
  g.cues.push({ at: W, sfx: 'whoosh' }, { at: W + 0.02, sfx: 'boing' })
  if (k >= 1) g.cues.push({ at: W + 0.06, sfx: 'clink' })
  if (k >= 2) g.cues.push({ at: W + 0.1, sfx: 'bonk' })
  return W
}

/**
 * 「哇！」咻地躲到姐姐背後（第 k 次，一次比一次高），轉回來只露半張臉發抖；姐姐被撞得一晃、
 * 遮嘴咯咯笑、再彎腰往左指給他看。thing 是嚇到他的東西（被指的那一下它動一下）。回傳躲好那一刻。
 */
function hide(T: number, k: number, thing: string, focus: Vec, strokes: number[][], parts: ('丷' | '弓' | '丨' | '丿')[]) {
  const W = startle(T, k, focus)
  const h = HIDE[k]
  const H = W + 0.2
  g.moves.push(
    { at: W, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: h.x, y: footY(h.feet) }, arc: 3 + 8 * k, ease: 'in' },
    { at: H, dur: 0.01, actor: 'rex', do: 'flip' },
    { at: H, actor: 'rex', do: 'swap', emoji: `hero:rex/${h.pose}` },
    { at: H + 0.05, dur: 0.6, actor: 'rex', do: 'shake', amount: 0.9 + 0.6 * k },
    // 姐姐被撞得一晃（第三次被他整隻壓住）
    k < 2
      ? { at: H, dur: 0.25, actor: 'sis', do: 'tilt', amount: -5 - 2 * k }
      : { at: H, dur: 0.35, actor: 'sis', do: 'squash', amount: 0.14 },
    // 遮嘴咯咯笑
    { at: H + 0.28, actor: 'sis', do: 'swap', emoji: 'prop:sis-laugh' },
    { at: H + 0.28, dur: 0.25, actor: 'sis', do: 'hop', amount: 1.5 },
    // 彎腰往左指給他看：只是一隻＿啦
    { at: H + 0.56, actor: 'sis', do: 'swap', emoji: 'prop:sis-give' },
    { at: H + 0.56, dur: 0.2, actor: 'sis', do: 'moveTo', to: { x: SX - 5, y: SY }, ease: 'out' },
    { at: H + 0.6, dur: 0.25, actor: thing, do: 'hop', amount: 3 },
  )
  g.fx.push(
    { at: H + 0.05, kind: 'sweat', actor: 'rex', dx: 9, dur: 0.6, scale: 1 + 0.2 * k },
  )
  g.camera.push(
    { at: H, dur: 0.4, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: SX - 4, y: 50 - 6 * k } },
    { at: H, dur: 0.25 + 0.05 * k, do: 'shake', amount: 0.6 + 0.4 * k },
  )
  g.cues.push({ at: H, sfx: 'tap' }, { at: H + 0.28, sfx: 'bubble' })
  strokes.forEach((s, i) => g.builds.push({ at: H + 0.05, dur: 0.4, strokes: s, from: 'rex', color: partColor(parts[i]) }))
  return H
}

/** 他不好意思地走回原位（從頭上的話跳下來），姐姐站回來 */
function back(H: number, k: number) {
  const B = H + 0.82
  g.moves.push(
    { at: B, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
    { at: B, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: RX, y: RY }, arc: k === 2 ? 6 : 0, ease: 'inOut' },
    { at: B + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: B + 0.05, actor: 'sis', do: 'swap', emoji: 'prop:sis' },
    { at: B + 0.05, dur: 0.25, actor: 'sis', do: 'moveTo', to: { x: SX, y: SY } },
  )
  g.fx.push({ at: B + 0.3, kind: 'sweat', actor: 'rex', dx: -9, dur: 0.45 })
  return B + 0.3
}

// 開場：弟弟抬頭看字框跳一下（第一聲「弟」），姐姐彎腰拍拍他
g.moves.push(
  { at: 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
  { at: 0.25, dur: 0.3, actor: 'rex', do: 'hop', amount: 3 },
  { at: 0.3, actor: 'sis', do: 'swap', emoji: 'prop:sis-give' },
  { at: 0.75, actor: 'sis', do: 'swap', emoji: 'prop:sis' },
  { at: 0.7, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
)

// 第 1 次：一隻小貓從左邊走進來，停在他面前喵一下
const T1 = 1.0
g.moves.push({ at: T1 - 0.42, dur: 0.42, actor: 'thing', do: 'moveTo', to: { x: CAT_X, y: CAT_Y }, ease: 'out' })
const H1 = hide(T1, 0, 'thing', { x: (CAT_X + RX) / 2, y: 58 }, [[0, 1]], ['丷'])
const R1 = back(H1, 0)
// 小貓被指了一下，轉身走回左邊
g.moves.push(
  { at: H1 + 0.85, dur: 0.01, actor: 'thing', do: 'flip' },
  { at: H1 + 0.87, dur: 0.45, actor: 'thing', do: 'moveTo', to: { x: -22, y: CAT_Y }, ease: 'in' },
)

// 第 2 次：一隻蝴蝶彎彎地飛進來，停在他鼻子前
const T2 = R1 + 0.15
const FLY = { x: RX - 24, y: 46 }
g.moves.push(
  { at: T2 - 0.5, actor: 'fly', do: 'swap', emoji: 'prop:butterfly' },
  { at: T2 - 0.5, dur: 0.25, actor: 'fly', do: 'moveTo', to: { x: 22, y: 54 }, ease: 'linear' },
  { at: T2 - 0.25, dur: 0.25, actor: 'fly', do: 'moveTo', to: FLY, arc: 6, ease: 'out' },
  { at: T2 - 0.5, dur: 0.5, actor: 'fly', do: 'tilt', amount: 12 },
)
const H2 = hide(T2, 1, 'fly', { x: RX - 12, y: 50 }, [[2, 3, 4]], ['弓'])
const R2 = back(H2, 1)
g.moves.push(
  { at: H2 + 0.85, dur: 0.5, actor: 'fly', do: 'moveTo', to: { x: -20, y: 40 }, arc: 8, ease: 'in' },
)

// 第 3 次前停一拍：他左右張望、冒汗……一陣風吹來一片落葉，輕輕飄下來停在他頭上
const LOOK = R2 + 0.05
g.moves.push(
  { at: LOOK, actor: 'rex', do: 'swap', emoji: 'hero:rex/peek' },
  { at: LOOK + 0.25, dur: 0.01, actor: 'rex', do: 'flip' },
  { at: LOOK + 0.45, dur: 0.01, actor: 'rex', do: 'flip' },
  { at: LOOK + 0.55, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
)
g.fx.push({ at: LOOK + 0.1, kind: 'sweat', actor: 'rex', dx: 9, dur: 0.5 })
const T3 = LOOK + 0.7
const LEAF_ON = { x: RX - 3, y: RY - 0.5 * RS - 2 }
g.moves.push(
  { at: T3 - 0.9, actor: 'fly', do: 'swap', emoji: 'prop:maple-leaf' },
  { at: T3 - 0.9, dur: 0.01, actor: 'fly', do: 'moveTo', to: { x: -12, y: 42 } },
  { at: T3 - 0.88, dur: 0.3, actor: 'fly', do: 'moveTo', to: { x: 22, y: 52 }, ease: 'linear' },
  { at: T3 - 0.58, dur: 0.3, actor: 'fly', do: 'moveTo', to: { x: 48, y: 40 }, ease: 'linear' },
  { at: T3 - 0.28, dur: 0.28, actor: 'fly', do: 'moveTo', to: LEAF_ON, ease: 'out' },
  { at: T3 - 0.88, dur: 0.3, actor: 'fly', do: 'rotateTo', amount: 35 },
  { at: T3 - 0.58, dur: 0.3, actor: 'fly', do: 'rotateTo', amount: -55 },
  { at: T3 - 0.28, dur: 0.28, actor: 'fly', do: 'rotateTo', amount: 20 },
)
g.cues.push({ at: T3 - 0.88, sfx: 'slide' })
const H3 = hide(T3, 2, 'fly', { x: RX, y: 48 }, [[5], [6]], ['丨', '丿'])
const R3 = back(H3, 2)
// 他一跳，落葉從頭上滑下來，慢慢飄到他原本站的地方；被指了一下，風又把它吹走
g.moves.push(
  { at: T3 + 0.33, dur: 0.6, actor: 'fly', do: 'moveTo', to: { x: RX - 14, y: 70 }, ease: 'out' },
  { at: T3 + 0.33, dur: 0.6, actor: 'fly', do: 'rotateTo', amount: -30 },
  { at: H3 + 0.85, dur: 0.45, actor: 'fly', do: 'moveTo', to: { x: -20, y: 58 }, arc: 8, ease: 'in' },
)

// 國字拼好：放大到中間，弟弟衝到左邊、姐姐退到右邊
const ASIDE = R3
const HOME = ASIDE + 0.12
const PARK = HOME + 0.85
// 語詞那一刻：弟弟走回正中間跳一下，姐姐彎腰拍拍他——弟弟
const WORD = PARK + 0.35

// 回馬槍：真的大熊從左邊走進來
const T4 = WORD + 0.45
const W4 = T4 + 0.32
const BONK = W4 + 0.14
const LOOKB = BONK + 0.35
const ROAR = LOOKB + 0.5
const ASK = ROAR + 1.15
const Q = ASK + 0.05
const ANSWER = Q + 2.48
/** 問他的時候小恐龍放大一點 */
const ASK_S = 1.15
/** 姐姐躲到弟弟背後的位置 */
const S_BEHIND = RX + 13
// 大熊一出來，弟弟照樣傻眼、❗、「哇！」翻身要衝（同一個訊號）
startle(T4, 3, { x: (BEAR_X + RX) / 2, y: 52 })

/** 吼聲：從嘴巴往左一圈一圈粗粗的弧線打出去 */
function waves(at: number, o: Vec, n: number): Fx[] {
  const out: Fx[] = []
  const base = { x: RX, y: RY }
  for (let i = 0; i < n; i++) {
    const r = 5 + 9 * i
    const half = Math.min(40 * Math.PI / 180, Math.asin(Math.min(1, 14 / r)))
    const pts = [0, 1, 2, 3].map((j) => {
      const a = Math.PI - half + (2 * half * j) / 3
      return { x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r }
    })
    for (let j = 0; j < 3; j++) {
      out.push({ at: at + 0.05 * i, dur: 0.35, kind: 'line', actor: 'rex', dx: pts[j].x - base.x, dy: pts[j].y - base.y, to: pts[j + 1], color: '#C2410C', width: 2.2 })
    }
  }
  return out
}

const clip: Clip = {
  format: 2,
  char: '弟',
  meta: { theme: '膽小的弟弟', cast: '小恐龍＋恐龍姐姐＋小貓、蝴蝶、落葉、大熊', gags: ['膽小的小恐龍弟弟，左邊每冒出一樣小東西就「哇！」咻地躲到恐龍姐姐背後只露半張臉發抖，姐姐遮嘴笑、彎腰指給他看，東西一次比一次小、他躲得一次比一次誇張（小貓→躲在腰後面；蝴蝶→跳到背上；停一拍東張西望，一片落葉停在頭上→整個爬到姐姐頭上）；回馬槍是第四次反過來：真的大熊來了，姐姐先嚇得躲到他背後，他撞上姐姐彈回最前面，腿發抖、吸一口氣仰頭大吼，大熊嚇跑、連姐姐都嚇跑，他自己也腿軟坐下'] },
  duration: 15,
  // 晴天的草地：綠色的恐龍姐弟、橘色的小貓與落葉、藍色的蝴蝶、棕色的大熊在淡黃天空上都看得清楚
  bg: { top: '#FFF3D6', bottom: '#FFFCF0', floor: '#C3E3A2', scenery: 'hills' },
  actors: [
    // 回馬槍時躲在弟弟背後的姐姐（畫在弟弟後面）
    { id: 'sis2', emoji: 'prop:sis-shock', x: SX, y: SY, size: SS, hidden: true },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RY, size: RS },
    { id: 'sis', emoji: 'prop:sis', x: SX, y: SY, size: SS },
    // 小貓（回馬槍換成大熊）
    { id: 'thing', emoji: '🐈', x: -22, y: CAT_Y, size: CAT_S, flip: true },
    // 蝴蝶、落葉（飄在空中）
    { id: 'fly', emoji: 'prop:butterfly', x: -20, y: 50, size: 23, float: true },
  ],
  moves: [
    ...g.moves,
    // 國字放大到中間：弟弟衝到左邊、姐姐退到右邊
    { at: ASIDE, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: ASIDE, dur: 0.25, actor: 'rex', do: 'moveTo', to: { x: R_SIDE, y: RY }, ease: 'inOut' },
    { at: ASIDE + 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASIDE, dur: 0.4, actor: 'sis', do: 'moveTo', to: { x: S_SIDE, y: SY } },
    // 語詞那一刻：弟弟走回正中間、跳起來，姐姐走回來彎腰拍拍他
    { at: PARK + 0.05, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: RX, y: RY } },
    { at: PARK, dur: 0.35, actor: 'sis', do: 'moveTo', to: { x: SX - 4, y: SY } },
    { at: WORD - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: WORD - 0.05, dur: 0.35, actor: 'rex', do: 'hop', amount: 5 },
    { at: WORD, actor: 'sis', do: 'swap', emoji: 'prop:sis-give' },
    { at: WORD + 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 大熊（小貓換圖、放大）從左邊走進來
    { at: 7.0, actor: 'thing', do: 'swap', emoji: 'prop:bear' },
    { at: 7.0, dur: 0.01, actor: 'thing', do: 'flip' },
    { at: 7.0, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: BEAR_S / CAT_S },
    { at: 7.0, dur: 0.01, actor: 'thing', do: 'moveTo', to: { x: -40, y: CAT_Y } },
    { at: T4 - 0.45, dur: 0.45, actor: 'thing', do: 'moveTo', to: { x: BEAR_X, y: CAT_Y }, ease: 'out' },
    { at: T4 - 0.1, actor: 'sis', do: 'swap', emoji: 'prop:sis' },
    { at: T4, actor: 'thing', do: 'swap', emoji: 'prop:bear-roar' },
    { at: T4, dur: 0.3, actor: 'thing', do: 'hop', amount: 3 },
    // 姐姐嚇一跳
    { at: T4 + 0.08, actor: 'sis', do: 'swap', emoji: 'prop:sis-shock' },
    { at: T4 + 0.08, dur: 0.25, actor: 'sis', do: 'hop', amount: 4 },
    // 弟弟照樣要咻地躲（startle 已經翻身換衝刺）——姐姐先咻地躲到他背後（換成畫在他後面的 sis2）
    { at: W4, dur: 0.12, actor: 'rex', do: 'moveTo', to: { x: RX + 7, y: RY }, ease: 'in' },
    { at: W4 - 0.02, dur: 0.01, actor: 'sis', do: 'vanish' },
    { at: W4 - 0.02, dur: 0.01, actor: 'sis2', do: 'enter', from: { x: SX, y: SY } },
    { at: W4, dur: 0.16, actor: 'sis2', do: 'moveTo', to: { x: S_BEHIND, y: SY }, ease: 'out' },
    // 撞上姐姐彈回最前面，轉回去面對大熊：腿發抖
    { at: BONK, dur: 0.18, actor: 'rex', do: 'moveTo', to: { x: RX, y: RY }, ease: 'out' },
    { at: BONK, dur: 0.01, actor: 'rex', do: 'flip' },
    { at: BONK, actor: 'rex', do: 'swap', emoji: 'hero:rex/scared' },
    { at: BONK + 0.1, dur: 0.4, actor: 'rex', do: 'shake', amount: 1.6 },
    { at: BONK + 0.05, dur: 1.0, actor: 'sis2', do: 'shake', amount: 1.0 },
    // 回頭看一眼發抖的姐姐，轉回來吸一大口氣
    { at: LOOKB, actor: 'rex', do: 'swap', emoji: 'hero:rex/back' },
    { at: LOOKB + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/angry' },
    { at: LOOKB + 0.3, dur: 0.25, actor: 'rex', do: 'squash', amount: -0.12 },
    // 吼——！
    { at: ROAR, actor: 'rex', do: 'swap', emoji: 'hero:rex/roar' },
    { at: ROAR, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: 1.12, ease: 'back' },
    { at: ROAR + 0.5, dur: 0.2, actor: 'rex', do: 'scaleTo', amount: 1 / 1.12 },
    // 大熊嚇得跳起來逃走
    { at: ROAR + 0.08, actor: 'thing', do: 'swap', emoji: 'prop:bear' },
    { at: ROAR + 0.08, actor: 'thing', do: 'tint', filter: 'grayscale(.7) brightness(1.2)' },
    { at: ROAR + 0.08, dur: 0.35, actor: 'thing', do: 'hop', amount: 9 },
    { at: ROAR + 0.42, dur: 0.01, actor: 'thing', do: 'flip' },
    { at: ROAR + 0.42, dur: 0.45, actor: 'thing', do: 'moveTo', to: { x: -50, y: CAT_Y }, ease: 'in' },
    // 連姐姐都被那一聲嚇得跳起來跑掉
    { at: ROAR + 0.1, dur: 0.3, actor: 'sis2', do: 'hop', amount: 6 },
    { at: ROAR + 0.6, dur: 0.45, actor: 'sis2', do: 'moveTo', to: { x: 200, y: SY }, ease: 'in' },
    // 他自己也嚇一跳，腿一軟坐下
    { at: ROAR + 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: ROAR + 0.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/fall' },
    // 問他：小恐龍站起來跳到左前方、放大
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK, dur: 0.4, actor: 'rex', do: 'moveTo', to: { x: 32, y: RY + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: Q + 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: Q + 1.5, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: Q + 2.0, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, dur: 0.3, actor: 'rex', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: -45, y: RY + 3 }, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['rex'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 語詞那一刻
    { at: WORD, kind: 'burst', x: RX, y: 36, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
    // 大熊吼
    { at: BONK, kind: 'burst', x: RX + 12, y: 50, n: 1, dur: 0.3, scale: 1.0 },
    { at: BONK + 0.1, kind: 'sweat', actor: 'sis2', dx: 14, dur: 0.6 },
    { at: BONK + 0.15, kind: 'sweat', actor: 'rex', dx: 10, dur: 0.6 },
    // 弟弟的吼聲
    ...waves(ROAR + 0.02, { x: RX - 14, y: RY - 10 }, 5),
    { at: ROAR + 0.12, kind: 'sweat', actor: 'thing', dx: 18, dur: 0.6, scale: 1.4 },
    { at: ROAR + 0.12, kind: 'pop', x: BEAR_X - 22, y: 28, emoji: '❗', dur: 0.5, scale: 2 },
    { at: ROAR + 0.75, kind: 'sweat', actor: 'rex', dx: 10, dur: 0.6 },
  ],
  camera: [
    // 鏡頭平常固定在全景（不讓自動取景往前預看、切掉頭上的東西），只有躲好那一下推近
    { at: 0.05, dur: 0.2, do: 'zoom', amount: 1.01, to: WIDE },
    ...g.camera,
    { at: T4, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: BONK, dur: 0.2, do: 'shake', amount: 0.6 },
    { at: ROAR, dur: 0.5, do: 'punch', amount: 0.14, to: { x: RX - 14, y: 50 } },
    { at: ROAR, dur: 0.5, do: 'shake', amount: 2.0 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '弟' },
    ...g.cues,
    { at: HOME + 0.1, say: '弟' },
    { at: WORD, say: '弟弟' },
    { at: T4 - 0.45, sfx: 'rumble' },
    { at: T4, sfx: 'rumble' },
    { at: W4, sfx: 'whoosh' },
    { at: BONK, sfx: 'bonk' },
    { at: LOOKB + 0.3, sfx: 'gulp' },
    { at: ROAR, sfx: 'rumble' },
    { at: ROAR + 0.02, sfx: 'boing' },
    { at: ROAR + 0.45, sfx: 'whoosh' },
    { at: ROAR + 0.75, sfx: 'plop' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '弟' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
