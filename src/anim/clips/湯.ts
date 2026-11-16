import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 湯（v2）：一大鍋熱湯擺在中間，上面幾道白白彎彎的熱氣一直往上飄。狗狗警長肚子好餓，湊過去鼓起臉「呼——」對著湯吹一口要喝——
// 湯「噗」地噴出一大團熱氣撲到他臉上：「燙！」他傻眼停住，嚇得跳好高（警長一被嚇到就跳很高），掉下來吐舌頭猛搧。
// 同一個動作一次比一次用力，熱氣一次比一次多、比一次高，他也跳得一次比一次高：
// 輕輕吹一口（跳一下；湯裡噴出三滴湯：氵）→ 用力吹兩口（熱氣更大、跳更高、往後退一步：日）→
// 先停一拍：他托著下巴看湯、深深吸一大口氣把臉鼓得圓圓的……使出全力一吹——熱氣像噴泉一樣噴上來，把他轟上天、摔扁在畫面右邊（昜的下半），鍋子也被震到左邊。
// 警長吹哨子把鍋子叫回來，熱氣冒得又多又高：「熱湯」。
// 回馬槍（第四次）：他學乖了，不吹了！臉湊進鍋子「咕嚕咕嚕」一口氣把熱湯整鍋喝光、連熱氣都吸進肚子裡，把空鍋往後一丟、閉眼得意——
// 停一拍，熱氣換從他自己頭上「嗶——」地噴出來，臉漲紅、鼓著臉像燒開的水壺，跳得最高。
// 最後畫面暗下來只剩「湯」，警長站到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「湯！」，然後退場只留字。
// 刻意不跟「粥」（舀一匙→燙到彈起來、等到結冰）、「餃」（噴火轉圈、吹飛水餃）、「辣」（衝去找水、噴上天）、「空」（火箭）撞：這支的抓手是熱氣，「呼——吹→熱氣撲回來」。
// 湯、湯、熱湯、這是什麼字？、湯

/** 狗狗警長（右邊；圖朝左，剛好面向中間那鍋湯） */
const SS = 36
const SX = 117
const SY = 77 - 0.42 * SS
/** 吹湯時湊過去站的地方 */
const BLOW_X = 104
/** 那鍋湯：這個字講的東西，擺在正中間、比警長大 */
const BS = 40
const BX = 67
const BY = 77 - 0.42 * BS
/** 第 3 次熱氣噴上來，鍋子被震到左邊（國字放大到正中央時讓出位置） */
const BX_AWAY = 24
/** 滑到左邊時縮一點點（國字放大到正中央時，跟字留 8 以上的空隙） */
const AWAY_K = 0.86

/** 字框：左上方（右邊是警長跳上跳下的地方，中間有熱氣往上飄） */
const FRAME = { x: 25, y: 21 }
const FRAME_K = 0.44

const STEAM = '#FFFFFF'
/** 臉漲紅（回馬槍：像燒開的水壺） */
const RED = 'sepia(1) saturate(4) hue-rotate(-48deg)'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 一道彎彎的熱氣（白色、粗、S 形）：兩段弧上下接起來，跟著 actor 走；每一輪 1 秒，慢慢擺一下再淡掉，兩輪錯開半拍，所以一直看得到。
 * (dx, dy) 是熱氣最下面那一點（相對 actor 頭頂），r 是彎的大小（整道高 1.64 × r），width 是粗細。（照「粥」的寫法）
 */
function wisp(actor: string, from: number, to: number, dx: number, dy: number, r: number, width: number): Fx[] {
  const out: Fx[] = []
  for (const ph of [0, 1]) {
    for (let t = from + ph * 0.5; t < to - 0.05; t += 1) {
      const dur = Math.min(1, to - t)
      const lift = ph * 0.22 * r
      out.push({ at: t, dur, kind: 'swoosh', actor, dx: dx - r, dy: dy - lift, to: { x: 999, y: 0 }, n: r, sweep: 0, color: STEAM, width })
      out.push({ at: t, dur, kind: 'swoosh', actor, dx: dx + 0.574 * r, dy: dy - 0.82 * r - lift, to: { x: -999, y: 0 }, n: r, sweep: 0, color: STEAM, width })
    }
  }
  return out
}
/**
 * 鍋子上的熱氣：level 0～3，越燙越多、越高、越粗（0：兩道；1：三道；2：四道更高；3：語詞那一刻，四道最高）。
 * 熱氣從湯面往上冒（相對鍋子的頭頂）。
 */
const STEAM_DY = 4
function potSteam(from: number, to: number, level: number): Fx[] {
  const r = [5.5, 7, 8.5, 9.5][level]
  const w = [2.6, 3, 3.4, 3.8][level]
  const xs = level === 0 ? [-6, 6] : level === 1 ? [-10, 0, 10] : [-13, -4.5, 4.5, 13]
  return xs.flatMap((dx, i) => wisp('pot', from + i * 0.17, to, dx, STEAM_DY - (i % 2 ? 2 : 0), r, w))
}

/** 警長移動（腳站在地上，dy 是離地多高） */
const at = (x: number, dy = 0): Vec => ({ x, y: SY - dy })

/**
 * 同一個笑點「呼——吹→熱氣撲回來→燙！跳好高」。
 * B：鼓起臉吹（k 越大吹越久、💨 越多）→ T：湯「噗」地噴出一團熱氣撲到他臉上＋鍋子彈一下＋鏡頭推近＋震＋同一個音效 →
 * 他傻眼停住 0.4 秒 → 嚇得跳好高（HANG）→ 掉下來吐舌頭猛搧。
 * T 是熱氣撲到臉上那一刻，k 是第幾次（0～2，越後面越大）；land 是掉到哪裡。
 */
const SHOCK = 0.42
const RISE = 0.15
const HANG = [0.3, 0.35, 0.42]
const JUMP = [9, 17, 27]
const BLOW = [0.3, 0.5, 0.5]
const landOf = (T: number, k: number) => T + SHOCK + RISE * 2 + HANG[k]
function burn(T: number, k: number, landX: number): Gag {
  const B = T - BLOW[k]
  const L = T + SHOCK
  const land = landOf(T, k)
  const moves: Move[] = [
    // 鼓起臉「呼——」吹
    { at: B, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/blow' },
    { at: B + 0.02, dur: BLOW[k] - 0.04, actor: 'sheriff', do: 'squash', amount: 0.06 + 0.03 * k },
    // 噗！熱氣撲到臉上：傻眼停住，被熱氣往後推一點
    { at: T - 0.06, dur: 0.12, actor: 'pot', do: 'squash', amount: -0.12 - 0.05 * k },
    { at: T, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: T, dur: 0.12, actor: 'sheriff', do: 'moveTo', to: at(BLOW_X + 3 + 2 * k), ease: 'out' },
    { at: T + 0.12, dur: SHOCK - 0.14, actor: 'sheriff', do: 'shake', amount: 0.5 + 0.3 * k },
    // 嚇得跳好高（雙手往上）
    { at: L, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: L, dur: RISE, actor: 'sheriff', do: 'moveTo', to: at((BLOW_X + 3 + 2 * k + landX) / 2, JUMP[k]), ease: 'out' },
    { at: L + RISE, dur: HANG[k], actor: 'sheriff', do: 'shake', amount: 0.8 + 0.4 * k },
    { at: L + RISE + HANG[k], dur: RISE, actor: 'sheriff', do: 'moveTo', to: at(landX), ease: 'in' },
  ]
  if (k === 2) {
    // 第 3 次轟上天、在空中轉一圈，摔扁
    moves.push(
      { at: L + RISE, dur: HANG[k], actor: 'sheriff', do: 'spin', times: 1, pivot: 'center' },
      { at: land, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    )
  } else {
    // 掉下來吐舌頭猛搧
    moves.push(
      { at: land, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/hot' },
      { at: land + 0.05, dur: 0.35, actor: 'sheriff', do: 'shake', amount: 0.6 },
    )
  }
  // 💨 從他嘴巴吹向湯；一團一團熱氣從湯面撲到他臉前（一次比一次大）
  const mouth = { dx: -0.2 * SS, dy: 0.36 * SS }
  const face: Vec = { x: BLOW_X - 13, y: SY - 0.2 * SS }
  const fx: Fx[] = [
    { at: B, dur: BLOW[k], kind: 'blow', actor: 'sheriff', ...mouth, to: { x: BX + 6, y: BY - 12 }, n: 3 + k, scale: 1.1 + 0.15 * k },
    { at: T - 0.05, dur: 0.32, kind: 'blow', actor: 'pot', emoji: 'prop:smoke', dx: 2, dy: 2, to: face, n: 3 + k, scale: 1.25 + 0.25 * k },
    { at: T, dur: 0.4, kind: 'burst', actor: 'pot', emoji: 'prop:smoke', n: 1, dy: -2, scale: 1.3 + 0.45 * k },
    // 跳在空中時頭上冒汗
    { at: L + RISE, dur: HANG[k] + 0.1, kind: 'sweat', actor: 'sheriff', scale: 1.2 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: T, dur: SHOCK, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: (BX + BLOW_X) / 2, y: 50 } },
    { at: T, dur: 0.3, do: 'shake', amount: 0.7 + 0.45 * k },
  ]
  // 同一個「呼——」、同一個「噗」、同一個「咚」，一次比一次多疊一個
  const cues: Cue[] = [{ at: B, sfx: 'whoosh' }, { at: T, sfx: 'poof' }, { at: T + 0.05, sfx: 'hic' }, { at: L, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: B + 0.25, sfx: 'whoosh' }, { at: T + 0.08, sfx: 'crack' })
  if (k >= 2) cues.push({ at: L + 0.04, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 他走回去、再湊過去：x0 → BLOW_X */
const stepIn = (t: number): Move[] => [
  { at: t, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
  { at: t, dur: 0.22, actor: 'sheriff', do: 'moveTo', to: at(BLOW_X), ease: 'out' },
]

/** 第 1 次：輕輕吹一口 */
const T1 = 1.3
const G1_LAND = SX
/** 第 2 次：用力吹兩口，往後退一步 */
const T2 = 3.2
const G2_LAND = SX + 6
/** 第 3 次前停一拍：托著下巴看湯、深深吸一大口氣 */
const BEAT = landOf(T2, 1) + 0.3
const BREATH = BEAT + 0.5
const T3 = BREATH + 0.55
/** 第 3 次摔扁在畫面右邊（國字要放大到正中央） */
const X3 = 139
const LAND3 = landOf(T3, 2)
const HOME = LAND3 + 0.04
const PARK = HOME + 0.85
/** 語詞那一刻 */
const WORD = PARK + 0.42
/** 回馬槍：臉湊進鍋子咕嚕咕嚕喝光 → 空鍋往後丟 → 得意 → 熱氣從他頭上噴出來 */
const GULP = WORD + 0.55
const TOSS = GULP + 0.45
const SMUG = TOSS + 0.12
const T4 = SMUG + 0.36
const L4 = T4 + SHOCK
const JUMP4 = 30
const LAND4 = L4 + RISE + 0.5 + RISE
const ASK = LAND4 + 0.08
const ANSWER = ASK + 0.05 + 0.974 + 1.51
/** 問他的時候站的地方、放大幾倍 */
const AX = 126
const ASK_S = 1.2

const g1 = burn(T1, 0, G1_LAND)
const g2 = burn(T2, 1, G2_LAND)
const g3 = burn(T3, 2, X3)
const all = [g1, g2, g3]

/** 語詞那一刻那鍋湯放大幾倍 */
const WORD_K = 1.12
/** 回馬槍：喝湯時臉湊進鍋子站的地方 */
const GULP_X = BX + 30

const clip: Clip = {
  format: 2,
  char: '湯',
  meta: { theme: '熱湯好燙', cast: '狗狗警長＋一大鍋冒熱氣的湯', gags: ['狗狗警長湊過去鼓起臉「呼——」對著熱湯吹一口要喝，湯「噗」地噴出一團熱氣撲到他臉上，「燙！」他傻眼、嚇得跳好高；一次比一次吹得用力、熱氣一次比一次多一次比一次高、跳得一次比一次高（吹一口→吹兩口→停一拍深吸一口氣全力吹，熱氣像噴泉把他轟上天摔扁）；回馬槍是他學乖了不吹了，臉湊進去一口氣把熱湯整鍋喝光、連熱氣都吸進肚子，得意一下——熱氣換從他自己頭上「嗶——」地噴出來，臉漲紅像燒開的水壺，跳得最高'] },
  duration: 15,
  // 藍天：白色的熱氣看得清楚；左上是素色的天空（字框）
  bg: { top: '#6CB6EA', bottom: '#CBE8FB', floor: '#E2C18E', scenery: 'hills' },
  actors: [
    { id: 'pot', emoji: '🍲', x: BX, y: BY, size: BS },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: SY, size: SS },
  ],
  moves: [
    // 他走進來，看到熱湯，肚子好餓、流口水
    { at: 0, dur: 0.4, actor: 'sheriff', do: 'enter', from: { x: 185, y: SY }, ease: 'out' },
    { at: 0.42, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    { at: 0.5, dur: 0.25, actor: 'sheriff', do: 'hop', amount: 2.5 },
    // 第 1 次：輕輕吹一口
    ...stepIn(T1 - BLOW[0] - 0.3),
    ...g1.moves,
    // 第 2 次：用力吹兩口
    ...stepIn(T2 - BLOW[1] - 0.3),
    ...g2.moves,
    { at: T2 - 0.27, dur: 0.06, actor: 'sheriff', do: 'squash', amount: -0.06 },
    // 停一拍：托著下巴看湯……深深吸一大口氣，把臉鼓得圓圓的
    { at: BEAT, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: BEAT + 0.1, dur: 0.3, actor: 'sheriff', do: 'tilt', amount: 6 },
    ...stepIn(BREATH - 0.24),
    { at: BREATH, dur: 0.3, actor: 'sheriff', do: 'squash', amount: -0.12 },
    ...g3.moves,
    // 熱氣像噴泉一樣噴上來，鍋子被震得往左滑（國字放大到正中央，中間讓出來）
    { at: T3 + 0.05, dur: 0.35, actor: 'pot', do: 'moveTo', to: { x: BX_AWAY, y: BY }, ease: 'out' },
    { at: T3 + 0.05, dur: 0.35, actor: 'pot', do: 'hop', amount: 4 },
    { at: T3 + 0.05, dur: 0.35, actor: 'pot', do: 'scaleTo', amount: AWAY_K },
    // 警長吹哨子「嗶！」把鍋子叫回來，自己也走回來
    { at: PARK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: PARK + 0.12, dur: 0.28, actor: 'pot', do: 'moveTo', to: { x: BX, y: BY }, ease: 'out' },
    { at: PARK + 0.32, dur: 0.25, actor: 'pot', do: 'scaleTo', amount: WORD_K / AWAY_K, ease: 'back' },
    { at: PARK + 0.2, dur: 0.3, actor: 'sheriff', do: 'moveTo', to: at(SX), ease: 'out' },
    // 語詞那一刻：熱湯！
    { at: WORD - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    { at: WORD, dur: 0.25, actor: 'sheriff', do: 'hop', amount: 3 },
    { at: WORD, dur: 0.25, actor: 'pot', do: 'squash', amount: -0.08 },
    // 回馬槍：不吹了！臉湊進鍋子「咕嚕咕嚕」整鍋喝光
    { at: GULP - 0.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/eat' },
    { at: GULP - 0.2, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: at(GULP_X), ease: 'out' },
    { at: GULP, dur: 0.2, actor: 'sheriff', do: 'squash', amount: 0.1 },
    { at: GULP + 0.22, dur: 0.2, actor: 'sheriff', do: 'squash', amount: 0.1 },
    { at: GULP, dur: 0.4, actor: 'pot', do: 'shake', amount: 0.6 },
    // 空鍋往後一丟（飛出畫面右上），閉眼得意
    { at: TOSS, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
    { at: TOSS, dur: 0.35, actor: 'pot', do: 'moveTo', to: { x: 200, y: 20 }, arc: 14, ease: 'in' },
    { at: TOSS, dur: 0.35, actor: 'pot', do: 'rotateTo', amount: 200 },
    { at: TOSS + 0.36, dur: 0.02, actor: 'pot', do: 'vanish' },
    { at: SMUG, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: SMUG, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: at(SX - 6), ease: 'out' },
    // 停一拍——熱氣換從他自己頭上噴出來！臉漲紅、鼓著臉「嗶——」像燒開的水壺
    { at: T4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: T4, actor: 'sheriff', do: 'tint', filter: RED },
    { at: T4, dur: SHOCK, actor: 'sheriff', do: 'shake', amount: 1.4 },
    // 跳得最高，在空中轉一圈
    { at: L4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: L4, dur: RISE, actor: 'sheriff', do: 'moveTo', to: at(SX + 2, JUMP4), ease: 'out' },
    { at: L4 + RISE, dur: 0.5, actor: 'sheriff', do: 'spin', times: 1, pivot: 'center' },
    { at: L4 + RISE + 0.5, dur: RISE, actor: 'sheriff', do: 'moveTo', to: at(AX), ease: 'in' },
    { at: LAND4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/hot' },
    { at: LAND4, actor: 'sheriff', do: 'tint', filter: '' },
    // 問他：站到右前方、變大
    { at: ASK + 0.15, dur: 0.3, actor: 'sheriff', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: ASK + 1.4, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
    { at: ASK + 1.95, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 7 },
    // 退場：往右跑，畫面只留下字
    { at: ANSWER + 0.3, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: ANSWER + 0.3, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: 215, y: SY }, ease: 'in' },
  ],
  builds: [
    // 第 1 次：湯噴出三滴湯（氵）；第 2 次：那團熱氣（日）；第 3 次：噴泉一樣的熱氣（勿上面一橫）
    { at: T1 + 0.05, dur: 0.45, strokes: [0, 1, 2], from: 'pot', color: partColor('氵') },
    { at: T2 + 0.05, dur: 0.5, strokes: [3, 4, 5, 6], from: 'pot', color: partColor('昜') },
    { at: T3 + 0.05, dur: 0.5, strokes: [7, 8, 9, 10, 11], from: 'pot', color: partColor('昜') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.45 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 62, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 鍋子上的熱氣：一次比一次多、比一次高；第 3 次噴光了（鍋子滑到左邊），叫回來後冒得最多最高，直到他整鍋喝光
    ...potSteam(0, T1, 0),
    ...potSteam(T1 + 0.3, T2, 1),
    ...potSteam(T2 + 0.3, T3, 2),
    ...potSteam(PARK + 0.3, GULP + 0.1, 3),
    ...all.flatMap((g) => g.fx),
    // 第 3 次：熱氣像噴泉一樣往上噴
    { at: T3, dur: 0.5, kind: 'blow', actor: 'pot', emoji: 'prop:smoke', dy: 2, to: { x: BX + 4, y: 16 }, n: 4, scale: 1.2 },
    // 回馬槍：咕嚕咕嚕，熱氣被吸進他嘴裡
    { at: GULP - 0.05, dur: 0.5, kind: 'blow', actor: 'pot', emoji: 'prop:smoke', dy: 2, to: { x: GULP_X - 8, y: SY - 6 }, n: 4, scale: 1.1 },
    // 熱氣從他頭上噴出來：兩邊一團一團往上噴＋頭上三道最高的熱氣
    { at: T4, dur: SHOCK + 0.1, kind: 'blow', actor: 'sheriff', emoji: 'prop:smoke', dy: 2, to: { x: SX - 26, y: 20 }, n: 5, scale: 1.5 },
    { at: T4, dur: SHOCK + 0.1, kind: 'blow', actor: 'sheriff', emoji: 'prop:smoke', dy: 2, to: { x: SX + 22, y: 20 }, n: 5, scale: 1.5 },
    ...[-8, 0, 8].flatMap((dx, i) => wisp('sheriff', T4 + i * 0.08, L4 + 0.1, dx, 1, 7, 3)),
    { at: L4 + RISE, dur: 0.6, kind: 'sweat', actor: 'sheriff', scale: 1.8 },
    { at: ANSWER, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 鏡頭鎖全景（他會跳很高、熱氣往上冒，字框在左上），只有燙到的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: T4, dur: SHOCK, do: 'punch', amount: 0.16, to: { x: SX - 6, y: 48 } },
    { at: T4, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '湯' },
    ...all.flatMap((g) => g.cues),
    { at: BREATH, sfx: 'deflate' },
    { at: HOME + 0.05, say: '湯' },
    { at: PARK, sfx: 'blip' },
    { at: PARK + 0.35, sfx: 'plop' },
    { at: WORD, say: '熱湯' },
    { at: GULP, sfx: 'gulp' },
    { at: GULP + 0.22, sfx: 'gulp' },
    { at: TOSS, sfx: 'whoosh' },
    { at: T4, sfx: 'blip' },
    { at: T4 + 0.05, sfx: 'hic' },
    { at: T4 + 0.08, sfx: 'rumble' },
    { at: L4, sfx: 'boing' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '湯' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
