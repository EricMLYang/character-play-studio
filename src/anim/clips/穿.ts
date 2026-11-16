import type { Build, Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { castScale } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 穿（v2）：豬探長趕著出門，張開雙手等衣服——熱心的浣熊花生每次把一件衣服用力一丟，「咻——啪！」套到他身上，
// 可是每次都穿錯地方，一次比一次大件：一隻襪子套在鼻子上（宀從襪子上抖出來）→ 一條褲子倒過來套在頭上，兩隻褲管像兔耳朵（八）→
// 先停一拍：花生把一件超大的衣服舉過頭，豬探長嚇得冒汗——「啪！」整件罩下來把他吞掉，頭再從領口鑽出來，衣服長到拖地（牙）。
// 語詞那一刻他穿著超大衣服、頂著褲子和襪子站在正中間：「穿衣服」。
// 回馬槍（第四次）：花生丟出最後一隻大鞋子，這次他學乖了，一蹲躲過去、得意地站起來——鞋子從天上掉回來，「啪」地套在他頭上，最大一個。
// 最後畫面暗下來只剩「穿」，豬探長問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「穿！」，然後退場只留字。
// 穿、穿、穿衣服、這是什麼字？、穿

/** 豬探長：大、站在畫面中間偏左（右邊讓給丟衣服的花生） */
const S = 40
const Y = 77 - 0.42 * S
const X = 70
/** 國字放大到中間時他退到右邊（左上是字框，褲管會碰到；花生先跑出去拿鞋子） */
const SIDE = 130
/** 花生：右邊，抱著一大疊箱子（衣服都在裡面） */
const RS = 30
const RX = 138
const RY = 77 - 0.42 * RS
/** 花生舉手丟東西時，東西從他手上出發 */
const HAND: Vec = { x: RX - 4, y: 42 }
/** 字框在左上角：小丘場景的左上是素色的天空；衣服都從右邊飛過來，不經過字框 */
const FRAME = { x: 24, y: 22.5 }
const FRAME_K = 0.47

/** 畫出來的大小：小東西引擎會自動放大（castScale），套在身上的位置要照放大後的算 */
const drawn = (n: number) => n * castScale(n)
const SOCK = 14
const PANTS = 22
const SHIRT = 42
const SHOE = 42

/** 他身上某一點（原圖 512 格、圖朝左；他翻過來面向右邊的花生）在舞台上的位置，dy 是他整個人蹲下去多少 */
function onPig(u: number, v: number, x = X, dy = 0): Vec {
  return { x: x - (u / 512 - 0.5) * S, y: 77 + (v / 512 - 0.92) * S + dy }
}
/** 鼻子、頭頂（量過 public/hero/pig/idle.png，其他站姿差不到一格） */
const NOSE = [206, 200] as const
const HEAD = [252, 70] as const

/** 每一件衣服穿在他身上的位置（他站在 x、蹲下 dy 時） */
const wear: Record<string, (x: number, dy: number) => Vec> = {
  sock: (x, dy) => onPig(NOSE[0], NOSE[1], x, dy),
  // 褲子倒過來，褲腰套在帽子上、兩隻褲管朝天
  pants: (x, dy) => ({ x: onPig(HEAD[0], HEAD[1], x, dy).x, y: onPig(HEAD[0], HEAD[1], x, dy).y + 6 - 0.5 * drawn(PANTS) }),
  // 超大衣服：頭從領口鑽出來以後，衣服從脖子一路長到拖地
  shirt: (x, dy) => ({ x: x - 1, y: 70 + dy }),
  // 大鞋子倒過來扣在頭上（蓋住褲子）
  shoe: (x, dy) => ({ x: onPig(HEAD[0], HEAD[1], x, dy).x, y: onPig(HEAD[0], HEAD[1], x, dy).y - 4 }),
}
/** 現在穿在身上的 */
const on: string[] = []
let px = X
let pdy = 0

const g = { moves: [] as Move[], fx: [] as Fx[], camera: [] as Camera[], cues: [] as Cue[], builds: [] as Build[], lights: [] as Light[] }

/** 他和身上穿的一起移動 */
function body(at: number, dur: number, x: number, dy = pdy, ease: Move['ease'] = 'inOut', arc?: number) {
  g.moves.push({ at, dur, actor: 'pig', do: 'moveTo', to: { x, y: Y + dy }, ease, arc })
  for (const id of on) g.moves.push({ at, dur, actor: id, do: 'moveTo', to: wear[id](x, dy), ease, arc })
  px = x
  pdy = dy
}
/** 他和身上穿的一起原地動（hop、shake） */
function all(m: Omit<Move, 'actor'>) {
  g.moves.push({ ...m, actor: 'pig' } as Move)
  for (const id of on) g.moves.push({ ...m, actor: id } as Move)
}
const pig = (at: number, pose: string) => g.moves.push({ at, actor: 'pig', do: 'swap', emoji: `hero:pig/${pose}` })
const coon = (at: number, pose: string) => g.moves.push({ at, actor: 'coon', do: 'swap', emoji: `hero:raccoon/${pose}` })

/** 傻眼停多久 */
const HOLD = 0.45
/** 飛過來要多久 */
const FLY = 0.42

/**
 * 「咻——啪！」：花生舉手往後一拉（預備）→ 用力一丟，一件衣服打著轉飛過來 → 套到他身上 to 的地方（穿錯地方）。
 * 那一下：💥＋鏡頭推近＋震＋同一個「啪」（一次多疊一個音），他傻眼停 HOLD 秒。k 是第幾次（越後面越大）。
 * 東西在 L − FLY 從 from 出發（預設花生手上），回傳「啪」那一刻。
 */
function toss(L: number, k: number, id: string, to: Vec, opt: { from?: Vec; arc?: number; turn?: number; windup?: boolean } = {}) {
  const from = opt.from ?? HAND
  if (opt.windup !== false) {
    // 花生：舉手、往後一拉（預備）→ 丟
    coon(L - FLY - 0.35, 'lift')
    g.moves.push({ at: L - FLY - 0.35, dur: 0.01, actor: id, do: 'moveTo', to: { x: RX, y: 30 } })
    g.moves.push({ at: L - FLY - 0.35, dur: 0.2, actor: id, do: 'pop' })
    g.moves.push({ at: L - FLY - 0.3, dur: 0.3, actor: 'coon', do: 'tilt', amount: 8 })
    coon(L - FLY, 'throw')
    g.moves.push({ at: L - FLY, dur: 0.05, actor: id, do: 'moveTo', to: from })
  }
  g.moves.push({ at: L - FLY + 0.05, dur: FLY - 0.05, actor: id, do: 'moveTo', to, arc: opt.arc ?? 10, ease: 'in' })
  g.moves.push({ at: L - FLY + 0.05, dur: FLY - 0.05, actor: id, do: 'rotateTo', amount: opt.turn ?? -360, ease: 'in' })
  g.cues.push({ at: L - FLY, sfx: 'whoosh' })
  // 啪！
  pig(L, 'surprised')
  on.push(id)
  all({ at: L, dur: 0.3, do: 'hop', amount: -(1 + 1.2 * k) })
  all({ at: L + 0.05, dur: 0.35, do: 'shake', amount: 0.6 + 0.4 * k })
  g.fx.push(
    // 💥 在套上去的地方旁邊（不蓋住穿上去的東西），一次比一次大
    { at: L, kind: 'burst', x: to.x + 10 + 2 * k, y: to.y - 4, n: 1, dur: 0.4, scale: 1.0 + 0.4 * k },
    { at: L + 0.02, kind: 'burst', x: to.x, y: to.y, emoji: '⭐', n: 4 + 2 * k, dur: 0.45, scale: 0.9 + 0.15 * k },
    { at: L + 0.2, kind: 'sweat', actor: 'pig', dx: -9, dur: HOLD + 0.3 },
  )
  g.camera.push(
    { at: L, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: to.x, y: to.y } },
    { at: L, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  )
  g.lights.push({ at: L, dur: 0.04, level: -0.1 - 0.03 * k }, { at: L + 0.04, dur: 0.2, level: 0 })
  g.cues.push({ at: L, sfx: 'plop' })
  if (k >= 1) g.cues.push({ at: L + 0.04, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: L + 0.08, sfx: 'bonk' })
  coon(L + 0.25, 'carry')
  g.moves.push({ at: L + 0.25, dur: 0.05, actor: 'coon', do: 'rotateTo', amount: 0 })
  return L
}

// 開場：他從左邊衝進來，張開雙手：「衣服！快！」花生抱著一大疊箱子點頭
pig(0.45, 'hug')
g.moves.push({ at: 0.55, dur: 0.25, actor: 'pig', do: 'hop', amount: 3 })
g.moves.push({ at: 1.0, dur: 0.25, actor: 'coon', do: 'hop', amount: 2.5 })

// 第 1 次：一隻襪子——套在鼻子上
const L1 = toss(1.6, 0, 'sock', wear.sock(X, 0), { turn: -330 })
pig(L1 + HOLD, 'sour')
g.builds.push({ at: L1 + 0.1, dur: 0.6, strokes: [0, 1, 2], from: 'sock', color: partColor('宀') })
// 再張開雙手：下一件！
pig(L1 + 1.0, 'hug')
// 第 2 次：一條褲子——倒過來套在頭上，褲管朝天
const L2 = toss(3.0, 1, 'pants', wear.pants(X, 0), { turn: -540, arc: 14 })
pig(L2 + HOLD, 'sour')
g.builds.push({ at: L2 + 0.1, dur: 0.5, strokes: [3, 4], from: 'pants', color: partColor('八') })
// 第 3 次前停一拍：花生把一件超大的衣服舉過頭，他嚇得冒汗發抖
const LOOK = L2 + 0.8
coon(LOOK, 'lift')
g.moves.push(
  { at: LOOK, dur: 0.01, actor: 'shirt', do: 'moveTo', to: { x: RX - 2, y: 28 } },
  { at: LOOK, dur: 0.3, actor: 'shirt', do: 'pop' },
  { at: LOOK + 0.4, dur: 0.5, actor: 'shirt', do: 'shake', amount: 1.2 },
)
pig(LOOK + 0.2, 'scared')
all({ at: LOOK + 0.35, dur: 0.6, do: 'shake', amount: 0.8 })
g.fx.push(
  { at: LOOK + 0.2, kind: 'pop', actor: 'pig', emoji: '❗', dx: 12, dy: 2, dur: 0.5, scale: 1.6 },
  { at: LOOK + 0.4, kind: 'sweat', actor: 'pig', dx: -9, dur: 0.6 },
)
g.cues.push({ at: LOOK + 0.2, sfx: 'blip' })
// 第 3 次：超大衣服整件罩下來，把他吞掉（只剩褲管露在上面、腳露在下面）
const COVER: Vec = { x: X - 1, y: 54 }
const L3 = toss(LOOK + 1.1, 2, 'shirt', COVER, { from: { x: RX - 6, y: 26 }, arc: 8, turn: 0, windup: false })
g.moves.push({ at: L3 - FLY - 0.05, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/throw' })
// 襪子被大衣服一起吞進去，頭鑽出來時鼻子上已經沒有了（衣服蓋住臉那一刻搬到畫面外）
on.splice(on.indexOf('sock'), 1)
g.moves.push({ at: L3 + 0.02, dur: 0.01, actor: 'sock', do: 'moveTo', to: { x: -40, y: 70 } })
g.builds.push({ at: L3 + 0.1, dur: 0.55, strokes: [5, 6, 7, 8], from: 'shirt', color: partColor('牙') })
// 衣服裡面掙扎一下，頭「啵」地從領口鑽出來，衣服滑下去長到拖地
g.moves.push({ at: L3 + HOLD, dur: 0.4, actor: 'shirt', do: 'shake', amount: 1.5 })
const POP = L3 + 0.75
g.moves.push({ at: POP, dur: 0.2, actor: 'shirt', do: 'moveTo', to: wear.shirt(X, 0), ease: 'out' })
g.moves.push({ at: POP, dur: 0.25, actor: 'pig', do: 'hop', amount: 2 })
pig(POP, 'surprised')
g.cues.push({ at: POP, sfx: 'poof' })
g.fx.push({ at: POP, kind: 'burst', x: X, y: 46, emoji: '✨', n: 6, dur: 0.4 })
pig(POP + 0.5, 'sour')

// 國字放大到中間：花生跑出右邊去拿東西，他拖著超大衣服，一跳一跳地挪到右邊
g.moves.push({ at: POP + 0.2, dur: 0.4, actor: 'coon', do: 'moveTo', to: { x: 195, y: RY }, ease: 'in' })
const ASIDE = POP + 0.35
body(ASIDE, 0.3, (X + SIDE) / 2, 0, 'inOut', 2.5)
body(ASIDE + 0.3, 0.3, SIDE, 0, 'inOut', 2.5)
const HOME = ASIDE + 0.5
const PARK = HOME + 0.85
// 語詞那一刻：國字讓回左上，他一跳一跳地挪回中間，花生抱著箱子回來
body(PARK + 0.05, 0.3, (X + SIDE) / 2, 0, 'inOut', 2.5)
body(PARK + 0.35, 0.3, X + 8, 0, 'inOut', 2.5)
const WORD = PARK + 0.6
pig(WORD, 'happy')
all({ at: WORD, dur: 0.35, do: 'hop', amount: 3 })
g.fx.push({ at: WORD, kind: 'burst', x: X + 8, y: 66, emoji: '✨', n: 8, dur: 0.55, scale: 1.4 })
g.camera.push({ at: WORD, dur: 0.6, do: 'punch', amount: 0.1, to: { x: X + 8, y: 55 } })
g.moves.push({ at: WORD + 0.1, dur: 0.4, actor: 'coon', do: 'moveTo', to: { x: RX, y: RY }, ease: 'out' })

// 回馬槍（第四次）：花生丟出最後一隻大鞋子——這次他學乖了，一蹲躲過去
const DUCK = WORD + 1.05
const L4 = DUCK + 1.05
coon(DUCK - 0.45, 'lift')
// 大鞋子（跟襪子同一個角色：襪子早就藏在衣服裡，換成鞋子從花生的箱子裡拿出來）
g.moves.push(
  { at: DUCK - 0.45, dur: 0.01, actor: 'sock', do: 'moveTo', to: { x: RX, y: 30 } },
  { at: DUCK - 0.45, actor: 'sock', do: 'swap', emoji: '👟' },
  { at: DUCK - 0.45, dur: 0.01, actor: 'sock', do: 'rotateTo', amount: 330 },
  { at: DUCK - 0.45, dur: 0.01, actor: 'sock', do: 'scaleTo', amount: drawn(SHOE) / drawn(SOCK) },
  { at: DUCK - 0.45, dur: 0.2, actor: 'sock', do: 'pop' },
)
coon(DUCK - 0.2, 'throw')
pig(DUCK - 0.2, 'duck')
body(DUCK - 0.15, 0.15, px, 10, 'out')
g.moves.push(
  { at: DUCK - 0.2, dur: 0.05, actor: 'sock', do: 'moveTo', to: HAND },
  // 低低地從他頭上飛過去、往左上飛出畫面
  { at: DUCK - 0.15, dur: 0.45, actor: 'sock', do: 'moveTo', to: { x: -25, y: 2 }, arc: 8, ease: 'linear' },
  { at: DUCK - 0.15, dur: 0.45, actor: 'sock', do: 'rotateTo', amount: -300, ease: 'linear' },
)
g.cues.push({ at: DUCK - 0.15, sfx: 'whoosh' })
// 站起來、閉眼得意
body(DUCK + 0.35, 0.2, px, 0, 'out')
pig(DUCK + 0.35, 'smug')
// 鞋子從天上（正上方）掉回來——啪！倒扣在頭上
g.moves.push({ at: L4 - 0.5, dur: 0.01, actor: 'sock', do: 'moveTo', to: { x: px, y: -25 } })
g.moves.push({ at: L4 - 0.5, dur: 0.01, actor: 'sock', do: 'rotateTo', amount: 300 + 225 })
const L4b = toss(L4, 3, 'sock', wear.shoe(px, 0), { from: { x: px, y: -25 }, arc: 0, turn: 0, windup: false })
g.moves.push({ at: L4b, dur: 0.4, actor: 'pig', do: 'squash', amount: 0.25 })
pig(L4b + HOLD + 0.1, 'dizzy')
coon(L4b + 0.3, 'laugh')
g.fx.push({ at: L4b + HOLD + 0.1, kind: 'dizzy', actor: 'pig', dx: 0, dy: -4, dur: 0.6 })

const ASK = L4b + 0.95
const Q = ASK + 0.1
const ANSWER = Q + 2.5
/** 問他的時候豬探長放大一點 */
const ASK_S = 1.1

// 花生笑著抱著箱子走出右邊
g.moves.push({ at: ASK - 0.35, dur: 0.3, actor: 'coon', do: 'moveTo', to: { x: 195, y: RY }, ease: 'in' })
// 問他：「噗」一團煙，身上的衣服都不見了，他跳到右前方、面向左邊的國字
for (const id of on) g.moves.push({ at: ASK, dur: 0.15, actor: id, do: 'vanish' })
g.fx.push({ at: ASK, kind: 'burst', x: px, y: 55, emoji: '💨', n: 7, dur: 0.4, scale: 1.4 })
g.cues.push({ at: ASK, sfx: 'poof' })

// 他身上一直穿著東西，不讓引擎加「閒著的小動作」（身上的衣服不會跟著晃）
for (let t = L1 + 0.8; t < ASK; t += 0.8) g.moves.push({ at: t, dur: 0.05, actor: 'pig', do: 'rotateTo', amount: 0 })

const clip: Clip = {
  format: 2,
  char: '穿',
  meta: { theme: '豬探長趕著穿衣服出門', cast: '豬探長＋浣熊花生＋襪子、褲子、大衣服、大鞋子', gags: ['花生每次把一件衣服用力一丟，「咻——啪！」套到豬探長身上，可是都穿錯地方，一次比一次大件（襪子套鼻子→褲子倒過來套頭→停一拍，超大衣服整件罩下來把他吞掉、頭再從領口鑽出來）；回馬槍是第四次帶反轉：最後一隻大鞋子飛來，他學乖了一蹲躲過、得意站起來，鞋子卻從天上掉回來「啪」地扣在他頭上'] },
  duration: 15,
  bg: { top: '#D8F0FF', bottom: '#FFF8E8', floor: '#BFDC94', scenery: 'hills' },
  actors: [
    { id: 'pig', emoji: 'hero:pig/walk', x: X, y: Y, size: S, hidden: true, flip: true },
    { id: 'shirt', emoji: '👕', x: RX, y: 28, size: SHIRT, hidden: true, float: true, pivot: 'center' },
    { id: 'pants', emoji: '👖', x: RX, y: 30, size: PANTS, hidden: true, float: true, pivot: 'center' },
    // 襪子（第 1 次）；第 4 次換成大鞋子，畫在褲子上面
    { id: 'sock', emoji: '🧦', x: RX, y: 30, size: SOCK, hidden: true, float: true, pivot: 'center' },
    { id: 'coon', emoji: 'hero:raccoon/carry', x: RX, y: RY, size: RS },
  ],
  moves: [
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: Y }, dur: 0.5, ease: 'out' },
    ...g.moves,
    // 問他：他跳到右前方、變大，面向左邊的國字
    { at: ASK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK, actor: 'pig', do: 'flip' },
    { at: ASK, dur: 0.4, actor: 'pig', do: 'moveTo', to: { x: 126, y: Y + 3 }, arc: 8, ease: 'out' },
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
    { at: ANSWER + 0.18, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ANSWER + 0.2, actor: 'pig', do: 'moveTo', to: { x: 205, y: Y + 3 }, dur: 0.2, ease: 'in' },
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
    // 鏡頭固定在全景（不讓自動取景往前預看、切掉飛過來的衣服），只有「啪」那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
  ],
  lights: [
    ...g.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '穿' },
    ...g.cues,
    { at: HOME + 0.1, say: '穿' },
    { at: WORD, say: '穿衣服' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '穿' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
