import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { castScale } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 接（v2）：天上一直掉東西下來。每次地上先冒出一塊影子，兔子女孩眼睛一亮「❗」，咻地衝到影子上、雙手舉高——
// 「啪！」接住，東西疊在她手上那一疊的最上面，整疊搖搖晃晃，越高晃得越厲害，她穩住了、得意地一跳，再退回原位等下一個。
// 一次比一次大、整疊一次比一次高：蘋果（扌）→ 蛋糕疊在蘋果上（立）→ 先停一拍：影子好大好大，她吞口水、整疊晃得好厲害，
// 一步一步慢慢挪到影子下面——大西瓜「啪」地疊上去（女），整疊快碰到畫面頂，她兩腿發抖但撐住了。
// 每接住一次，她手上就飛出一組筆畫（筆畫從接住東西的手飛進字框）。
// 語詞那一刻她站在中間、雙手舉高穩穩撐著那一疊：「接住」。
// 回馬槍（第四次）：最後只飄下來一根小小的羽毛，影子小小的；輕輕落在最上面……停半秒……整疊「嘩啦」垮下來，
// 把她壓扁在地上，東西還整整齊齊疊在她背上，只剩耳朵和蝴蝶結露在外面，羽毛最後才慢慢飄下來放在最上面。
// 最後畫面暗下來只剩「接」，她從那一堆底下彈出來，問「這是什麼字？」，手放耳邊等他回答，再指著字說「接！」，然後退場只留字。
// 刻意不跟「丟」（丟出去、狗撿回來）、「頭」（東西掉下來砸頭、腫包）撞：這支只演「伸手接住、越疊越高」。
// 接、接、接住、這是什麼字？、接

/** 兔子女孩：圖朝左，整支都面向左邊（接的地方在她左邊） */
const SB = 38
const PB = 77 - 0.42 * SB
/** 她平常站的地方（右邊）、每次接東西的地方（畫面中間偏右，字框在左上） */
const HX = 136
const CX = 94
/** 字框一開始就在左上：整疊會長到快碰到畫面頂，不能經過字框 */
const FRAME = { x: 30, y: 20.5 }
const FRAME_K = 0.5
/** 地上的影子畫在腳下這條線 */
const SHADOW_Y = 75.6

/** 舉高的雙手（lift 圖兩手中間、手掌上緣：朝左的原圖 u 0.49、v 0.235）：她站在 x 時那一點 */
const hand = (x: number): Vec => ({ x: x + (0.49 - 0.5) * SB, y: PB + (0.235 - 0.5) * SB })

/**
 * 疊在手上的四樣東西（由下往上）。float＋以中心為支點，位置都是「圖的中心」；
 * 小東西引擎會自動放大（castScale），疊的高度照放大以後的樣子算。box 是圖內容的上緣、下緣（0～1）。
 */
const ITEMS = [
  { id: 'apple', emoji: '🍎', size: 9, top: 0.094, bot: 0.938 },
  { id: 'cake', emoji: 'prop:cake', size: 12, top: 0.098, bot: 0.961 },
  { id: 'melon', emoji: 'prop:watermelon', size: 17, top: 0.055, bot: 0.959 },
  { id: 'feather', emoji: 'prop:feather', size: 9, top: 0.119, bot: 0.961 },
] as const
const vis = (s: number) => s * castScale(s)
/** 每一樣東西的中心在手上面多高（往上是正）：上一樣的上緣往下疊進去一點點，看起來是真的壓在上面 */
const LIFT: number[] = []
{
  let bottom = -0.5
  for (const it of ITEMS) {
    const v = vis(it.size)
    LIFT.push(bottom + (it.bot - 0.5) * v)
    bottom = bottom + (it.bot - it.top) * v - 0.8
  }
}
/** 第 i 樣東西在她站在 x、整疊往右歪 deg 度時的中心 */
function slot(i: number, x: number, deg = 0): Vec {
  const p = hand(x), r = (deg * Math.PI) / 180
  return { x: p.x + LIFT[i] * Math.sin(r), y: p.y - LIFT[i] * Math.cos(r) }
}
/** 第 i 樣東西的上緣（接住時 ✨ 冒出來、筆畫飛出來的那一點） */
const topOf = (i: number, x: number): Vec => {
  const it = ITEMS[i], c = slot(i, x)
  return { x: c.x, y: c.y + (it.top - 0.5) * vis(it.size) }
}
/** 天上：還沒掉下來的東西藏在畫面頂上面 */
const SKY = -16

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 手上那一疊：目前疊了幾樣（n）、她站在哪（x）、歪幾度（deg）。
 * 她移動、跳、被壓一下時整疊一起動（跟著她的手走）；sway 是整疊以手為支點左右晃。
 */
const stack = { n: 0, x: HX, deg: 0 }
const ids = () => ITEMS.slice(0, stack.n).map((it) => it.id)
function carry(at: number, dur: number, x: number, o: { ease?: Move['ease']; anticipate?: number } = {}): Move[] {
  const out: Move[] = [{ at, dur, actor: 'bunny', do: 'moveTo', to: { x, y: PB }, ...o }]
  ITEMS.slice(0, stack.n).forEach((it, i) => out.push({ at, dur, actor: it.id, do: 'moveTo', to: slot(i, x, stack.deg), ...o }))
  stack.x = x
  return out
}
function lean(at: number, dur: number, deg: number, ease: Move['ease'] = 'inOut'): Move[] {
  const out: Move[] = []
  ITEMS.slice(0, stack.n).forEach((it, i) => {
    out.push({ at, dur, actor: it.id, do: 'moveTo', to: slot(i, stack.x, deg), ease })
    out.push({ at, dur, actor: it.id, do: 'rotateTo', amount: deg - stack.deg, ease })
  })
  stack.deg = deg
  return out
}
/** 搖搖晃晃：amp 度起，左右來回 n 下慢慢停（每下 per 秒），最後回到正中 */
function sway(at: number, amp: number, n: number, per: number): Move[] {
  const out: Move[] = []
  for (let j = 0; j < n; j++) out.push(...lean(at + j * per, per, amp * (j % 2 ? -1 : 1) * (1 - j / n)))
  out.push(...lean(at + n * per, per, 0))
  return out
}
/** 她跳一下／被壓一下：整疊一起 */
const bob = (at: number, dur: number, amount: number): Move[] =>
  [{ at, dur, actor: 'bunny', do: 'hop', amount }, ...ids().map((id) => ({ at, dur, actor: id, do: 'hop', amount }) as Move)]

/** 地上的影子：掛在還藏在天上不動的羽毛上畫一條扁扁的深色粗線（從中間往兩邊長），一段比一段寬 */
function shadow(at: number, until: number, x: number, widths: number[], anchor: { id: string; at: Vec }): Fx[] {
  const step = (until - at) / widths.length
  return widths.flatMap((w, j) => {
    const t = at + j * step
    const end = j === widths.length - 1 ? until + 0.1 : t + step + 0.12
    return [-1, 1].map((side): Fx => ({
      at: t, dur: end - t, kind: 'line', actor: anchor.id, dx: x - anchor.at.x, dy: SHADOW_Y - anchor.at.y,
      to: { x: x + (side * w) / 2, y: SHADOW_Y }, color: 'rgba(40,50,30,.5)', width: 2.2 + w * 0.05,
    }))
  })
}
const FEATHER0: Vec = { x: CX + 2, y: SKY }

/** 東西從天上掉到手上要多久（看得到的那一段） */
const FALL = 0.7

/**
 * 同一個笑點：地上先冒出影子（預備）→ 她眼睛一亮「❗」→ 咻地衝到影子上、雙手舉高（lift）→
 * 東西從天上掉下來「啪！」接住：疊在手上那一疊的最上面（鏡頭推一下＋震、手上一圈 ✨、同一個「啪」，一次多疊一個音）→
 * 她被壓得一沉，整疊搖搖晃晃（越高晃越大），穩住了，得意地一跳 → 退回原位。
 * k 是第幾樣（0 蘋果、1 蛋糕、2 西瓜）。steps：第三次不衝了，一步一步慢慢挪過去。回傳接住的那一刻 hit 與手上那一點 at。
 */
function catchIt(t0: number, k: number, o: { width: number; steps?: number; wait?: number; back?: number }): Gag & { hit: number; at: Vec; settled: number } {
  const it = ITEMS[k]
  const moves: Move[] = []
  const notice = t0 + 0.1
  // 預備：她眼睛一亮
  if (k === 0) moves.push({ at: notice, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' })
  moves.push(...bob(notice, 0.2, 1.5))
  let arrive: number
  if (!o.steps) {
    // 咻！衝到影子上
    const go = t0 + 0.3
    if (k === 0) moves.push({ at: go, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' })
    moves.push(...carry(go, 0.2, CX, { ease: 'out', anticipate: 3 }))
    arrive = go + 0.2
    if (k === 0) moves.push({ at: arrive, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/lift' })
  } else {
    // 不敢衝：一步一步挪過去，每一步整疊都晃一下
    const from = stack.x, n = o.steps
    let t = t0 + (o.wait ?? 0)
    for (let s = 1; s <= n; s++) {
      moves.push(...carry(t, 0.2, from + ((CX - from) * s) / n, { ease: 'inOut' }))
      moves.push(...sway(t + 0.2, 7, 1, 0.11))
      t += 0.2 + 0.22 + 0.02
    }
    arrive = t - 0.02
  }
  // 從天上掉下來，正好落在那一疊的最上面
  const hit = arrive + 0.12
  const land = slot(k, CX)
  moves.push(
    { at: hit - FALL - 0.02, dur: 0.02, actor: it.id, do: 'pop' },
    { at: hit - FALL, dur: FALL, actor: it.id, do: 'moveTo', to: land, ease: 'in' },
  )
  stack.n = k + 1
  // 啪！被壓得一沉，整疊晃
  const press = 2.4 + 1.2 * k
  moves.push(...bob(hit, 0.24, -press))
  const per = [0.15, 0.14, 0.12][k], swings = [3, 4, 4][k]
  moves.push(...sway(hit + 0.22, [5, 9, 13][k], swings, per))
  const settled = hit + 0.22 + (swings + 1) * per
  if (k === 2) {
    // 兩腿發抖但撐住了
    moves.push({ at: hit + 0.25, dur: settled - hit, actor: 'bunny', do: 'shake', amount: 0.7 })
  }
  // 穩住了：得意地一跳
  moves.push(...bob(settled + 0.02, 0.26, 2))
  // 退回原位（倒退著走，眼睛盯著那一疊）
  const back = o.back ?? settled + 0.15
  if (o.back !== -1) moves.push(...carry(back, 0.32, HX, { ease: 'inOut' }))
  const at = topOf(Math.max(0, k - 1), CX)
  const contact = k === 0 ? hand(CX) : at
  const fx: Fx[] = [
    ...shadow(t0, hit, CX, [o.width * 0.45, o.width * 0.75, o.width], { id: 'feather', at: FEATHER0 }),
    { at: notice, dur: 0.45, kind: 'pop', actor: 'bunny', emoji: '❗', dx: -16, dy: 4, scale: 1.6 },
    // 啪！手上一圈星光
    { at: hit, dur: 0.5, kind: 'burst', x: contact.x, y: contact.y + 1, n: 6 + 2 * k, emoji: '✨', scale: 0.9 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.3, do: 'punch', amount: 0.06 + 0.02 * k, to: contact },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.4 + 0.3 * k },
  ]
  // 淡淡的白光：不要把她刷白
  const lights: Light[] = [
    { at: hit, dur: 0.04, level: -0.08 },
    { at: hit + 0.04, dur: 0.2, level: 0 },
  ]
  const cues: Cue[] = [
    { at: notice, sfx: 'blip' },
    { at: hit, sfx: 'tap' },
  ]
  if (!o.steps) cues.push({ at: t0 + 0.3, sfx: 'whoosh' })
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'plop' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights, hit, at: contact, settled }
}

// ---- 時間表 ----
const g1 = catchIt(0.7, 0, { width: 12 })
const G2 = g1.hit + 1.2
const g2 = catchIt(G2, 1, { width: 17 })
/** 停一拍：好大的影子，她吞口水，一步一步挪過去 */
const G3 = g2.hit + 1.25
const g3 = catchIt(G3, 2, { width: 42, steps: 3, wait: 0.3, back: -1 })
/** 拼好：她撐著整疊退到右邊，國字放大到中間 */
const BACK3 = g3.settled + 0.02
const HOME = BACK3 + 0.24
const PARK = HOME + 0.8
/** 語詞那一刻：她走回中間，雙手舉高穩穩撐著那一疊 */
const WORD = PARK + 0.45
/** 回馬槍：小小的影子、一根羽毛慢慢飄下來 */
const G4 = WORD + 0.35
const F_SHOW = G4 + 0.2
const F_HIT = F_SHOW + 0.8
/** 停半秒，整疊垮下來 */
const COLLAPSE = F_HIT + 0.45
const ASK = 11.05
/** 她在那一堆底下多趴一下，問句唸到一半才彈出來 */
const POP = ASK + 0.3
const AX = 128
const ASK_S = 1.35
const ANSWER = 13.6

/** 拼好後撐著整疊退到右邊、語詞那一刻走回中間（要在回馬槍之前算，整疊的狀態照時間順序走） */
const mid: Move[] = [
  ...carry(BACK3, 0.26, HX + 2, { ease: 'inOut' }),
  ...carry(PARK + 0.15, 0.35, CX, { ease: 'inOut' }),
  ...bob(WORD, 0.3, 2.5),
]

const moves4: Move[] = []
{
  // 小小的影子，她抬頭（一樣先一亮）
  moves4.push(...bob(G4 + 0.1, 0.2, 1.5))
  // 羽毛左右飄著落下來，輕輕停在最上面
  const top = slot(3, CX)
  const path = [
    { x: top.x - 7, y: 4 }, { x: top.x + 6, y: top.y - 10 }, { x: top.x - 3, y: top.y - 4 }, top,
  ]
  moves4.push({ at: F_SHOW - 0.02, dur: 0.02, actor: 'feather', do: 'pop' })
  path.forEach((p, i) => {
    moves4.push({ at: F_SHOW + i * 0.2, dur: 0.2, actor: 'feather', do: 'moveTo', to: p, ease: i === 3 ? 'out' : 'inOut' })
    moves4.push({ at: F_SHOW + i * 0.2, dur: 0.2, actor: 'feather', do: 'rotateTo', amount: i === 3 ? 10 : i % 2 ? 20 : -20 })
  })
  // 落定時羽毛的角度歸零（-20＋20－20＋10＝－10）
  moves4.push({ at: F_HIT, dur: 0.15, actor: 'feather', do: 'rotateTo', amount: 10 })
  stack.n = 4
  // ……停半秒：她抬頭看，整疊開始微微抖
  moves4.push(...sway(F_HIT + 0.25, 2.5, 1, 0.12))
  // 嘩啦！整疊往右歪倒
  moves4.push(...lean(COLLAPSE, 0.22, 16, 'in'))
  moves4.push({ at: COLLAPSE + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' })
  moves4.push({ at: COLLAPSE + 0.05, dur: 0.22, actor: 'bunny', do: 'hop', amount: 3 })
  // 全部砸下來，整整齊齊疊在她背上：她被壓扁趴在地上
  const flatAt = COLLAPSE + 0.3
  moves4.push({ at: flatAt, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' })
  const backX = CX + 6
  // 她背上（flat 圖身體上緣約 v 0.56）
  let bottom = PB + (0.56 - 0.5) * SB
  ITEMS.forEach((it, i) => {
    const v = vis(it.size)
    const c = { x: backX, y: bottom - (it.bot - 0.5) * v }
    bottom = bottom - (it.bot - it.top) * v + 0.8
    const t = i < 3 ? COLLAPSE + 0.22 + 0.08 * i : COLLAPSE + 0.45
    const d = i < 3 ? 0.32 : 0.45
    moves4.push({ at: t, dur: d, actor: it.id, do: 'moveTo', to: c, arc: i < 3 ? 8 + 3 * i : 3, ease: i < 3 ? 'in' : 'inOut' })
    // 翻一圈落地，角度回到正的
    moves4.push({ at: t, dur: d, actor: it.id, do: 'rotateTo', amount: (i === 3 ? 0 : 360 * (i % 2 ? -1 : 1)) - 16, ease: 'out' })
  })
}
const C_LAND = COLLAPSE + 0.54

const all = [g1, g2, g3]

const clip: Clip = {
  format: 2,
  char: '接',
  meta: { theme: '天上掉東西下來一直接', cast: '兔子女孩＋蘋果、蛋糕、西瓜、羽毛', gags: ['天上掉東西下來，地上先冒出影子，兔子女孩眼睛一亮咻地衝過去雙手舉高「啪」接住，東西疊在她手上那一疊的最上面，越疊越高、越晃越大（蘋果→蛋糕疊上去→停一拍：影子好大，她吞口水一步一步挪過去，大西瓜疊到快碰到畫面頂，兩腿發抖撐住）；回馬槍是最後只飄下來一根小羽毛，輕輕落在最上面……停半秒，整疊嘩啦垮下來把她壓扁，東西整整齊齊疊在她背上'] },
  duration: 15,
  // 淡藍的天空、綠草地：紅蘋果、白蛋糕、綠西瓜、白羽毛都看得清楚
  bg: { top: '#BFE6FF', bottom: '#EEF8FF', floor: '#B8DE94', scenery: 'hills' },
  actors: [
    { id: 'bunny', emoji: 'hero:bunny/dash', x: HX, y: PB, size: SB, hidden: true },
    ...ITEMS.map((it) => ({
      id: it.id, emoji: it.emoji, size: it.size, float: true, pivot: 'center' as const, hidden: true,
      ...(it.id === 'feather' ? FEATHER0 : { x: CX - 0.4, y: SKY }),
    })),
  ],
  moves: [
    // 開場：她咻地跑進來站好，抬頭看字框——接！
    { at: 0, actor: 'bunny', do: 'enter', from: { x: 195, y: PB }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    ...g1.moves,
    ...g2.moves,
    // 停一拍：好大的影子……吞口水
    { at: G3 + 0.15, actor: 'bunny', do: 'shake', amount: 0.6, dur: 0.4 },
    ...g3.moves,
    // 撐著整疊退到右邊讓國字放大；語詞那一刻走回中間，穩穩撐著
    ...mid,
    ...moves4,
    // 問他：暗下來後她從那一堆底下彈出來，東西飛散出畫面；她跳到右前方、放大
    { at: POP, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: POP, dur: 0.45, actor: 'bunny', do: 'moveTo', to: { x: AX, y: PB - 1 }, arc: 12, ease: 'out' },
    { at: POP, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: POP + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    ...ITEMS.map((it, i): Move => ({ at: POP + 0.03 * i, dur: 0.5, actor: it.id, do: 'moveTo', to: { x: 205 + 10 * i, y: 30 - 8 * i }, arc: 12 + 4 * i, ease: 'in' })),
    ...ITEMS.map((it, i): Move => ({ at: POP + 0.03 * i, dur: 0.5, actor: it.id, do: 'rotateTo', amount: i % 2 ? -300 : 300 })),
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.65, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.14, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: ANSWER + 0.15, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.17, actor: 'bunny', do: 'moveTo', to: { x: 205, y: PB - 1 }, ease: 'in' },
  ],
  builds: [
    // 每接住一次，她手上就飛出一組筆畫：扌、立、女
    { at: g1.hit + 0.02, dur: 0.4, strokes: [0, 1, 2], from: g1.at, color: partColor('扌') },
    { at: g2.hit + 0.02, dur: 0.4, strokes: [3, 4, 5, 6, 7], from: g2.at, color: partColor('立') },
    { at: g3.hit + 0.02, dur: 0.4, strokes: [8, 9, 10], from: g3.at, color: partColor('女') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bunny'], to: { x: 58, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx, ...g2.fx,
    { at: G3 + 0.2, kind: 'sweat', actor: 'bunny', dx: 8 },
    ...g3.fx,
    // 語詞那一刻：整疊亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: CX, y: slot(1, CX).y, n: 8, emoji: '✨', scale: 1.3 },
    // 回馬槍：小小的影子
    ...shadow(G4, F_HIT, CX, [4, 5, 6], { id: 'bunny', at: { x: CX, y: PB } }),
    { at: G4 + 0.1, dur: 0.45, kind: 'pop', actor: 'bunny', emoji: '❗', dx: -16, dy: 4, scale: 1.6 },
    // 嘩啦！
    { at: C_LAND, dur: 0.5, kind: 'burst', x: CX + 6, y: 60, n: 1, emoji: '💥', scale: 1.6 },
    { at: C_LAND, kind: 'puff', actor: 'bunny' },
  ],
  camera: [
    // 鏡頭鎖全景（整疊會長到畫面頂），只有接住、垮下來那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: F_HIT, dur: 0.25, do: 'punch', amount: 0.03, to: slot(3, CX) },
    { at: C_LAND, dur: 0.45, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.4, say: '接' },
    ...all.flatMap((g) => g.cues),
    { at: G3 + 0.3, sfx: 'gulp' },
    { at: HOME + 0.1, say: '接' },
    { at: WORD - 0.05, say: '接住' },
    { at: G4 + 0.1, sfx: 'blip' },
    { at: F_HIT, sfx: 'tap' },
    { at: COLLAPSE, sfx: 'slide' },
    { at: C_LAND - 0.1, sfx: 'crack' },
    { at: C_LAND, sfx: 'rumble' },
    { at: C_LAND + 0.05, sfx: 'bonk' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '接' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
