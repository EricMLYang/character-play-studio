import type { Build, Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { castScale } from '../clip'
import { pressStack } from '../helpers'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 肩（v2）：豬探長的肩膀是最棒的停機坪。他站得直直的，一樣東西「咻」地飛來、「啪」地停在他肩膀上——那一邊的肩膀一沉，
// 他整個人歪一邊，一次比一次重：一隻小鳥停右肩，他斜眼看、歪一點點（戶的上面從小鳥身上震出來）→ 一隻猴子跳上左肩，
// 換歪另一邊、膝蓋發抖（戶的一撇）→ 先停一拍：他抬頭看到天上一隻大熊貓在晃、冒汗——「咚」地坐上右肩，小鳥被擠到熊貓頭上，
// 他整個人被壓矮一截、歪得最厲害（月從熊貓身上震出來）。
// 語詞那一刻他頂著三隻動物站在正中間，兩邊肩膀各亮一下：「肩膀」。
// 回馬槍（第四次）：他深吸一口氣、肩膀用力一聳（聳肩），三隻全部被彈上天、飛出畫面，他得意地轉轉肩膀——
// 小鳥輕飄飄地飛回來，「啪」停回右肩，就這一點點重量，他整個人「碰」地垮下去趴在地上；小鳥嚇一跳飛走。
// 最後畫面暗下來只剩「肩」，豬探長問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「肩！」，然後退場只留字。
// 肩、肩、肩膀、這是什麼字？、肩

/** 豬探長：大、站在畫面正中間（肩膀是這支的主角） */
const S = 48
const Y = 77 - 0.42 * S
const X = 80
/** 國字放大到中間時他扛著動物退到右邊 */
const SIDE = 136
/** 字框在左上角：太陽在右上，左上角後面是素色的天空；動物都從右上、左邊低低地飛進來，不經過字框 */
const FRAME = { x: 24, y: 22.5 }
const FRAME_K = 0.47

/** 各個姿勢的左右肩頭在原圖（512 格、圖朝左）裡的位置：量過 public/hero/pig/*.png */
const SH = {
  idle: { L: [134, 290], R: [380, 290] },
  surprised: { L: [132, 294], R: [384, 294] },
  doubt: { L: [134, 292], R: [378, 290] },
  hold: { L: [156, 286], R: [356, 272] },
  scared: { L: [136, 280], R: [368, 264] },
  sour: { L: [130, 280], R: [386, 270] },
  smug: { L: [130, 298], R: [376, 282] },
} as const
type Pose = keyof typeof SH
type Side = 'L' | 'R'
/** 他的身體：站在哪、歪幾度（正的往右歪）、被壓扁幾倍（stretchTo：寬 ×st、高 ÷st） */
type Body = { x: number; r: number; st: number }

/** 他身上某一點（原圖 512 格）在舞台上的位置：照播放器的畫法，以腳底為支點縮放、旋轉（歪的時候支點會微微抬起來） */
function onPig([u, v]: readonly [number, number], b: Body): Vec {
  const lx = (u / 512 - 0.5) * S * b.st
  const ly = ((v / 512 - 0.5) * S - 0.42 * S) / b.st
  const a = (b.r * Math.PI) / 180
  const base = 77 - Math.abs(Math.sin(a)) * 0.42 * S
  return { x: b.x + lx * Math.cos(a) - ly * Math.sin(a), y: base + lx * Math.sin(a) + ly * Math.cos(a) }
}

/** 停在肩膀上的三隻（size） */
const BIRD = 11
const MONKEY = 17
const PANDA = 24
/** 畫出來的大小：小東西引擎會自動放大（castScale；飛著的以中心放大），停在肩上的位置要照放大後的算 */
const drawn = (n: number) => n * castScale(n)
const SIZE: Record<string, number> = { bird: drawn(BIRD), monkey: drawn(MONKEY), panda: drawn(PANDA) }
/** 每一隻現在停在哪裡：左肩、右肩、熊貓頭上（小鳥被擠上去） */
const perch: Record<string, Side | 'panda'> = {}
/** 每一隻現在轉了幾度（跟著他歪） */
const tilt: Record<string, number> = { bird: 0, monkey: 0, panda: 0 }
/** 熊貓坐在肩頭往外一點（不擋他的臉）；猴子、小鳥站在肩頭上 */
const OUT: Record<string, number> = { bird: 3, monkey: 2, panda: 1 }

let pose: Pose = 'idle'
let body: Body = { x: X, r: 0, st: 1 }

/** 某一隻停在現在的姿勢、身體上時，牠的位置（y 是牠的中心） */
function seat(id: string, p: Pose = pose, b: Body = body): Vec {
  const where = perch[id]
  if (where === 'panda') {
    const pd = seat('panda', p, b)
    return { x: pd.x + 1, y: pd.y - 0.44 * SIZE.panda - 0.42 * SIZE.bird + 1.2 }
  }
  const s = onPig(SH[p][where], b)
  const out = (where === 'L' ? -1 : 1) * OUT[id]
  return { x: s.x + out, y: s.y - 0.42 * SIZE[id] + 0.8 }
}

const g = { moves: [] as Move[], fx: [] as Fx[], camera: [] as Camera[], cues: [] as Cue[], builds: [] as Build[], lights: [] as Light[] }
const riders = () => Object.keys(perch)

/** 他換姿勢、身體一起變（歪、壓扁），肩上的每一隻同一刻搬到新的肩頭、跟著一起歪 */
function setBody(at: number, dur: number, p: Pose, nb: Partial<Body>, ease: Move['ease'] = 'out', arc?: number) {
  const next: Body = { ...body, ...nb }
  if (p !== pose) g.moves.push({ at, actor: 'pig', do: 'swap', emoji: `hero:pig/${p}` })
  if (next.r !== body.r) g.moves.push({ at, dur, actor: 'pig', do: 'rotateTo', amount: next.r - body.r, ease })
  if (next.st !== body.st) g.moves.push({ at, dur, actor: 'pig', do: 'stretchTo', amount: next.st / body.st, ease })
  if (next.x !== body.x) g.moves.push({ at, dur, actor: 'pig', do: 'moveTo', to: { x: next.x, y: Y }, ease, arc })
  for (const id of riders()) {
    g.moves.push({ at, dur: Math.max(dur, 0.06), actor: id, do: 'moveTo', to: seat(id, p, next), ease, arc })
    if (tilt[id] !== next.r) {
      g.moves.push({ at, dur: Math.max(dur, 0.06), actor: id, do: 'rotateTo', amount: next.r - tilt[id], ease })
      tilt[id] = next.r
    }
  }
  pose = p
  body = next
}
/** 他和肩上的每一隻一起原地動（hop、shake） */
function all(m: Omit<Move, 'actor'>) {
  g.moves.push({ ...m, actor: 'pig' } as Move)
  for (const id of riders()) g.moves.push({ ...m, actor: id } as Move)
}

/** 傻眼停多久 */
const HOLD = 0.45
/** 飛過來要多久 */
const FLY = 0.5

/**
 * 「咻——啪！」：一隻動物從 from 飛過來、停在他的 side 肩上 → 那一邊的肩膀一沉、他整個人歪過去（after）。
 * 那一下：肩頭冒 💥、鏡頭推近肩膀＋震＋同一個「啪」（一次多疊一個音）、他傻眼停 HOLD 秒，再換成 then 姿勢。
 * k 是第幾次（越後面越重）。回傳「啪」那一刻。
 */
function land(L: number, k: number, id: string, side: Side, from: Vec, arc: number, after: Partial<Body>, then: Pose, extra?: () => void) {
  // 飛過來：落點是他現在的肩頭
  perch[id] = side
  const to = seat(id)
  g.moves.push(
    { at: L - FLY - 0.3, dur: 0.01, actor: id, do: 'moveTo', to: from },
    { at: L - FLY - 0.3, dur: 0.2, actor: id, do: 'pop' },
    { at: L - FLY, dur: FLY, actor: id, do: 'moveTo', to, arc, ease: 'in' },
  )
  g.cues.push({ at: L - FLY, sfx: 'whoosh' })
  extra?.()
  // 啪！肩膀一沉、整個人歪過去
  setBody(L, 0.3, 'surprised', after, 'back')
  const sh = onPig(SH.surprised[side], body)
  all({ at: L, dur: 0.3, do: 'hop', amount: -(1.2 + 1.2 * k) })
  const out = side === 'L' ? -1 : 1
  g.fx.push(
    // 💥 在肩頭外側（不蓋臉），一次比一次大
    { at: L, kind: 'burst', x: sh.x + out * (7 + 2 * k), y: sh.y - 2, n: 1, dur: 0.4, scale: 1.0 + 0.35 * k },
    { at: L + 0.02, kind: 'burst', x: sh.x + out * 3, y: sh.y, emoji: '⭐', n: 4 + 2 * k, dur: 0.45, scale: 0.9 + 0.15 * k },
    { at: L + 0.15, kind: 'sweat', actor: 'pig', dx: -out * 8, dur: HOLD + 0.3 },
  )
  g.camera.push(
    { at: L, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: sh.x, y: sh.y - 4 } },
    { at: L, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  )
  g.lights.push({ at: L, dur: 0.04, level: -0.1 - 0.03 * k }, { at: L + 0.04, dur: 0.2, level: 0 })
  g.cues.push({ at: L, sfx: 'plop' })
  if (k >= 1) g.cues.push({ at: L + 0.04, sfx: 'bonk' })
  if (k >= 2) g.cues.push({ at: L + 0.08, sfx: 'rumble' })
  // 傻眼停一下，再換成這一次的樣子
  setBody(L + HOLD, 0.06, then, {})
  return L
}

// 開場：他從右邊走進來，站到正中間，挺胸站得直直的
// 第 1 次：一隻小鳥從右上飛來，停右肩——歪一點點，他斜眼看
const L1 = land(1.4, 0, 'bird', 'R', { x: 150, y: 14 }, 6, { r: 4 }, 'doubt')
g.builds.push({ at: L1 + 0.1, dur: 0.6, strokes: [0, 1, 2], from: 'bird', color: partColor('戶') })
// 第 2 次：一隻猴子從左邊跳上來，停左肩——換歪另一邊、膝蓋發抖
const L2 = land(2.9, 1, 'monkey', 'L', { x: -14, y: 60 }, 12, { r: -6 }, 'hold')
g.builds.push({ at: L2 + 0.1, dur: 0.5, strokes: [3], from: 'monkey', color: partColor('戶') })
all({ at: L2 + HOLD + 0.05, dur: 0.6, do: 'shake', amount: 1.2 })
g.cues.push({ at: L2 + HOLD + 0.05, sfx: 'slide' })
// 第 3 次前停一拍：天上一隻大熊貓在晃，他抬頭、冒汗
const LOOK = L2 + 1.0
const UP = { x: X + 14, y: 8 }
g.moves.push(
  { at: LOOK, dur: 0.01, actor: 'panda', do: 'moveTo', to: UP },
  { at: LOOK, dur: 0.25, actor: 'panda', do: 'pop' },
  { at: LOOK + 0.35, dur: 0.4, actor: 'panda', do: 'shake', amount: 1.5 },
)
setBody(LOOK + 0.1, 0.06, 'scared', {})
g.fx.push(
  { at: LOOK + 0.15, kind: 'pop', actor: 'pig', emoji: '❗', dx: -14, dy: 2, dur: 0.5, scale: 1.6 },
  { at: LOOK + 0.35, kind: 'sweat', actor: 'pig', dx: -8, dur: 0.6 },
)
g.cues.push({ at: LOOK + 0.15, sfx: 'blip' })
all({ at: LOOK + 0.4, dur: 0.5, do: 'shake', amount: 0.8 })
// 第 3 次：咚！熊貓坐上右肩，小鳥被擠到熊貓頭上；他整個人被壓矮一截、歪得最厲害
const L3 = land(LOOK + 1.1, 2, 'panda', 'R', UP, 0, { r: 9, st: 1.16 }, 'hold', () => {
  // 熊貓落下來那一刻，小鳥往上一跳、站到熊貓頭上
  perch.bird = 'panda'
})
g.moves.push({ at: L3 - 0.05, dur: 0.3, actor: 'bird', do: 'hop', amount: 4 })
g.builds.push({ at: L3 + 0.1, dur: 0.55, strokes: [4, 5, 6, 7], from: 'panda', color: partColor('月') })
all({ at: L3 + HOLD + 0.05, dur: 0.4, do: 'shake', amount: 1.8 })
g.cues.push({ at: L3 + HOLD + 0.05, sfx: 'slide' })

// 國字放大到中間：他扛著三隻，一跳一跳地挪到右邊
const ASIDE = L3 + 0.6
setBody(ASIDE, 0.3, 'hold', { x: (X + SIDE) / 2, r: 4 }, 'inOut', 2.5)
setBody(ASIDE + 0.3, 0.3, 'hold', { x: SIDE, r: 0 }, 'inOut', 2.5)
const HOME = ASIDE + 0.5
const PARK = HOME + 0.85
// 語詞那一刻：國字讓回左上，他一跳一跳地挪回正中間
setBody(PARK + 0.05, 0.3, 'hold', { x: (X + SIDE) / 2 }, 'inOut', 2.5)
setBody(PARK + 0.35, 0.3, 'hold', { x: X, r: 9 }, 'inOut', 2.5)
const WORD = PARK + 0.6
// 兩邊肩膀各亮一下，三隻一起跳一下
{
  const l = onPig(SH.hold.L, body), r = onPig(SH.hold.R, body)
  g.fx.push(
    { at: WORD, kind: 'burst', x: l.x - 4, y: l.y, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
    { at: WORD + 0.12, kind: 'burst', x: r.x + 6, y: r.y, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
  )
  for (const id of riders()) g.moves.push({ at: WORD, dur: 0.3, actor: id, do: 'hop', amount: 3 })
  g.camera.push({ at: WORD, dur: 0.6, do: 'punch', amount: 0.12, to: { x: X, y: l.y } })
}

// 回馬槍：深吸一口氣（縮起肩膀發抖）→ 肩膀用力一聳，三隻全部彈上天、飛出畫面
const BREATH = WORD + 0.65
setBody(BREATH, 0.06, 'sour', {})
all({ at: BREATH + 0.05, dur: 0.4, do: 'shake', amount: 1 })
g.cues.push({ at: BREATH, sfx: 'gulp' })
const SHRUG = BREATH + 0.4
// 聳肩那一下：身體往上一彈、站直（不歪、不扁）
g.moves.push(
  { at: SHRUG, dur: 0.2, actor: 'pig', do: 'squash', amount: -0.25 },
  { at: SHRUG, dur: 0.3, actor: 'pig', do: 'hop', amount: 3 },
)
const FLING: Record<string, Vec> = { bird: { x: 150, y: -20 }, monkey: { x: 40, y: -30 }, panda: { x: 118, y: -40 } }
for (const id of riders()) {
  g.moves.push(
    { at: SHRUG + 0.03, dur: 0.45, actor: id, do: 'moveTo', to: FLING[id], ease: 'out' },
    { at: SHRUG + 0.03, dur: 0.45, actor: id, do: 'spin', times: id === 'monkey' ? -1 : 1, pivot: 'center' },
    { at: SHRUG + 0.5, dur: 0.01, actor: id, do: 'vanish' },
  )
  g.moves.push({ at: SHRUG + 0.5, dur: 0.01, actor: id, do: 'rotateTo', amount: -tilt[id] })
  tilt[id] = 0
  delete perch[id]
}
setBody(SHRUG, 0.2, 'smug', { r: 0, st: 1 }, 'out')
g.fx.push({ at: SHRUG, kind: 'burst', x: X, y: 52, emoji: '💨', n: 6, dur: 0.45, scale: 1.4 })
g.camera.push({ at: SHRUG, dur: 0.3, do: 'shake', amount: 1 })
g.cues.push({ at: SHRUG, sfx: 'boing' }, { at: SHRUG + 0.05, sfx: 'whoosh' })
// 得意地轉轉肩膀（左歪、右歪）
const ROLL = SHRUG + 0.4
g.moves.push(
  { at: ROLL, dur: 0.3, actor: 'pig', do: 'tilt', amount: -7 },
  { at: ROLL + 0.32, dur: 0.3, actor: 'pig', do: 'tilt', amount: 7 },
)
g.fx.push({ at: ROLL + 0.1, kind: 'pop', actor: 'pig', emoji: '😎', dx: -18, dy: 8, dur: 0.5, scale: 1.3 })
// 第 4 次：小鳥輕飄飄地飛回來，「啪」停回右肩——就這一點點重量，他整個人垮下去趴在地上
const L4 = ROLL + 0.95
perch.bird = 'R'
const B4 = seat('bird')
g.moves.push(
  { at: L4 - 0.8, dur: 0.01, actor: 'bird', do: 'moveTo', to: { x: 128, y: 6 } },
  { at: L4 - 0.8, dur: 0.2, actor: 'bird', do: 'pop' },
  { at: L4 - 0.6, dur: 0.6, actor: 'bird', do: 'moveTo', to: B4, arc: -3, ease: 'inOut' },
)
g.cues.push({ at: L4 - 0.6, sfx: 'blip' })
{
  const sh = onPig(SH.smug.R, body)
  g.moves.push(
    { at: L4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: L4, dur: 0.15, actor: 'pig', do: 'squash', amount: 0.15 },
    { at: L4 + 0.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    // 他趴下去，小鳥落在他背上
    { at: L4 + 0.25, dur: 0.15, actor: 'bird', do: 'moveTo', to: { x: X + 8, y: 77 - 0.42 * SIZE.bird - 9 }, ease: 'in' },
  )
  g.fx.push(
    { at: L4, kind: 'burst', x: sh.x + 7, y: sh.y - 2, n: 1, dur: 0.35, scale: 0.8 },
    { at: L4 + 0.25, kind: 'burst', x: X + 22, y: 62, n: 1, dur: 0.5, scale: 2.3 },
    { at: L4 + 0.3, kind: 'burst', x: X, y: 70, emoji: '⭐', n: 10, dur: 0.5, scale: 1.4 },
  )
  g.camera.push(
    { at: L4 + 0.25, dur: 0.5, do: 'punch', amount: 0.16, to: { x: X, y: 62 } },
    { at: L4 + 0.25, dur: 0.45, do: 'shake', amount: 2.4 },
  )
  g.cues.push({ at: L4, sfx: 'plop' }, { at: L4 + 0.25, sfx: 'bonk' }, { at: L4 + 0.29, sfx: 'boing' }, { at: L4 + 0.33, sfx: 'rumble' })
}
// 小鳥嚇一跳，飛走
const SHOO = L4 + 0.6
g.fx.push({ at: SHOO, kind: 'pop', actor: 'bird', emoji: '❗', dy: 2, dur: 0.35, scale: 1.2 })
g.moves.push(
  { at: SHOO + 0.05, dur: 0.28, actor: 'bird', do: 'moveTo', to: { x: 185, y: 10 }, ease: 'in' },
  { at: SHOO + 0.33, dur: 0.01, actor: 'bird', do: 'vanish' },
)
g.cues.push({ at: SHOO + 0.05, sfx: 'whoosh' })

const ASK = SHOO + 0.35
const Q = ASK + 0.1
const ANSWER = Q + 2.5
/** 問他的時候豬探長放大一點 */
const ASK_S = 1.1

// 他身上一直有東西在變，不讓引擎加「閒著的小動作」（肩上的動物不會跟著晃）
for (let t = 0.6; t < SHRUG; t += 0.8) g.moves.push({ at: t, dur: 0.05, actor: 'pig', do: 'rotateTo', amount: 0 })

const clip: Clip = {
  format: 2,
  char: '肩',
  meta: { theme: '豬探長的肩膀是停機坪', cast: '豬探長＋小鳥、猴子、熊貓', gags: ['豬探長站得直直的，每次一隻動物「咻」地飛來、「啪」地停在他肩膀上，那一邊的肩膀一沉、整個人歪一邊，一次比一次重（小鳥停右肩歪一點點→猴子跳上左肩換歪另一邊、膝蓋發抖→停一拍抬頭看到天上的大熊貓、冒汗，熊貓咚地坐上右肩，他被壓矮一截）；回馬槍是第四次帶反轉：他用力一聳肩把三隻全彈上天、得意地轉轉肩膀，結果小鳥輕輕飛回來停上肩膀，他就整個垮下去趴在地上'] },
  duration: 15,
  bg: { top: '#D8F0FF', bottom: '#FFF8E8', floor: '#BFDC94', scenery: 'hills' },
  actors: [
    { id: 'pig', emoji: 'hero:pig/walk', x: X, y: Y, size: S, hidden: true },
    { id: 'panda', emoji: 'prop:panda', x: X, y: 10, size: PANDA, hidden: true, float: true },
    { id: 'monkey', emoji: 'prop:monkey', x: -14, y: 60, size: MONKEY, hidden: true, float: true, flip: true },
    { id: 'bird', emoji: '🐦', x: 150, y: 14, size: BIRD, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'pig', do: 'enter', from: { x: 185, y: Y }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 0.55, dur: 0.25, actor: 'pig', do: 'hop', amount: 2.5 },
    ...g.moves,
    // 問他：他爬起來、跳到右前方，面向左邊的國字
    { at: ASK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK, dur: 0.4, actor: 'pig', do: 'moveTo', to: { x: 128, y: Y + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'pig', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、往字那邊傾、點兩下頭
    { at: Q + 1.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: Q + 1.1, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: Q + 1.6, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: Q + 2.05, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ANSWER + 0.25, actor: 'pig', do: 'moveTo', to: { x: 205, y: Y + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['pig'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看、切掉飛進來的動物），只有「啪」那一下推近肩膀
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
  ],
  lights: [
    ...g.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '肩' },
    ...g.cues,
    { at: HOME + 0.1, say: '肩' },
    { at: WORD, say: '肩膀' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '肩' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
