import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蛇（v2）：小老鼠對著籃子吹笛子——「嗶哩哩～」音樂一響，蛇就從籃子裡扭啊扭地升起來，跟著笛聲左搖右擺；音樂一停，蛇「咻」地縮回去。
// 同一個動作四次，只有蛇升得越來越高、扭得越來越嗨：害羞地冒出一個頭（虫從蛇身上飛出來）→ 升到跟他一樣高、跟著節奏點頭（宀）→
// 先停一拍：他喘氣、搧風、吸一口大氣（整個人鼓起來）——蛇升到快碰到畫面頂，扭得整個籃子跟著晃（匕）。
// 回馬槍（第四次）：他吹到沒氣、一屁股坐下，笛子掉在地上——蛇自己冒出來（「大蛇」，他坐著指著牠），
// 用尾巴捲起笛子「嗶哩哩～」吹起來，換小老鼠不由自主地跳起來扭屁股。
// 最後畫面暗下來只剩「蛇」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「蛇！」，然後退場只留字。
// 刻意不跟「長」（從洞裡把蛇越拉越長）撞：這支只演「笛子一吹→蛇從籃子裡升起來扭」。
// 蛇、蛇、大蛇、這是什麼字？、蛇

// ---- 站位 ----
/** 小老鼠：站在左邊、朝右（圖朝左，要 flip） */
const MS = 40
const MY = 77 - 0.42 * MS
const MX = 34
/** 籃子：弄蛇人的圓藤籃（prop:charm-basket），籃子上緣在圖的 v 0.27、籃口裡面暗暗的一圈在 v 0.31～0.47 */
const BS = 40
const BX = 92
const BY = 77 - 0.42 * BS
/** 籃子上緣：蛇頭整顆在這下面就被籃子擋住 */
const TOP = BY + (0.27 - 0.5) * BS
/** 籃蓋（prop:basket-lid，內容在 v 0.44～0.96）：蓋著時蓋子底壓在籃口前緣 */
const LS = 38
const LID_DY = TOP + 6 - 0.46 * LS - BY
const LID_SHUT: Vec = { x: BX, y: BY + LID_DY }
/** 籃蓋「啵」彈開以後落在籃子右邊的地上 */
const LID_OFF: Vec = { x: 130, y: 77 - 0.42 * LS }
/** 蛇頭（prop:snake-head／snake-sing／snake-flute 同一個比例）：脖子底在圖的 v 0.96、寬 0.23 × size；
 *  平常、唱歌那兩張脖子中心在 u 0.52，吹笛子那張在 u 0.61（笛子往左伸，頭往右偏） */
const SH = 34
/** 脖子底（往上一點，蛇身才蓋得到接縫）相對蛇頭角色中心的位置 */
const NECK = { dx: 0.02 * SH, dy: 0.43 * SH }
const NECK_F = { dx: 0.11 * SH, dy: 0.43 * SH }
/** 蛇頭頂到脖子底的高度（圖的 v 0.193～0.96） */
const HEAD_H = 0.747 * SH
/** 蛇身從籃口裡面的這一點長出來 */
const BASE: Vec = { x: BX, y: BY + (0.38 - 0.5) * BS }
/** 縮回去時脖子的高度：整顆頭躲在籃子後面 */
const HIDE = TOP + HEAD_H + 1
/** 蛇身：跟蛇頭一樣的黃綠色，最上面跟脖子一樣粗，籃口那一節粗一點 */
const SNAKE = '#74C000'
const BODY_W = 0.23 * SH
const BODY_W0 = 9.6
/** 字框一開始就在左上（蛇在中間往上升）：背後是素色的天空 */
const FRAME = { x: 22, y: 18 }
const FRAME_K = 0.42

/** 笛子：🪈（3D 圖是從左下斜到右上的一支，pivot center 原地轉），吹的時候順時針轉 65 度：吹口在左上、笛口斜斜往右下指著籃子 */
const FS = 18
const PLAY_ROT = 65
/** 笛子半支長，在 20 度斜線上的位移（吹口→中心→笛口） */
const HALF = { x: 0.5 * FS, y: 0.18 * FS }
/** 他吹笛子時，吹口對著嘴（摀嘴笑那張的手在圖的 u 0.42、v 0.45，flip 之後在 u 0.58） */
const MOUTH: Vec = { x: MX + (0.58 - 0.5) * MS, y: MY + (0.45 - 0.5) * MS }
const FLUTE_PLAY: Vec = { x: MOUTH.x + HALF.x, y: MOUTH.y + HALF.y }
/** 平常拿在手上（垂在身邊） */
const FLUTE_REST: Vec = { x: MX + 0.2 * MS, y: MY + 0.1 * MS }
/** 笛口（相對笛子頭頂的錨點：頭頂在中心往上 0.45 × size）：音符從這裡飄出去 */
const FLUTE_END = { dx: HALF.x, dy: HALF.y + 0.45 * FS }

// ---- 蛇的身體：一串關鍵格（脖子高度 ny、扭的幅度 amp、點頭 bob），中間照緩動補 ----
type Key = { t: number; ny: number; amp: number; bob?: number; ease?: 'out' | 'in' | 'back' }
const keys: Key[] = []
const easeFn = (e: Key['ease'], p: number) => e === 'out' ? 1 - (1 - p) ** 3 : e === 'in' ? p ** 3
  : e === 'back' ? 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2 : p * p * (3 - 2 * p)
/** 跳舞的節奏（每秒幾拍） */
const BEAT_HZ = 2.2
function snakeAt(t: number) {
  let ny = HIDE, amp = 0, bob = 0
  for (let i = 0; i < keys.length; i++) {
    const a = keys[i], b = keys[i + 1]
    if (t < a.t) break
    if (!b || t < b.t) {
      if (!b) { ny = a.ny; amp = a.amp; bob = a.bob ?? 0; break }
      const p = easeFn(b.ease, (t - a.t) / (b.t - a.t))
      ny = a.ny + (b.ny - a.ny) * p
      amp = a.amp + (b.amp - a.amp) * p
      bob = (a.bob ?? 0) + ((b.bob ?? 0) - (a.bob ?? 0)) * p
      break
    }
  }
  return { ny: ny + bob * Math.abs(Math.sin(Math.PI * BEAT_HZ * t)), amp }
}
/** 蛇身上 s（0 籃口～1 脖子）那一點：一道從下往上傳的波，越上面扭得越大 */
function bodyPoint(t: number, s: number): Vec {
  const { ny, amp } = snakeAt(t)
  const sway = amp * s * Math.sin(2 * Math.PI * BEAT_HZ / 2 * t - 2.4 * s)
  // 本來就彎成 S 形（下面往右鼓、上面往左鼓），升得越高彎得越明顯：一眼看得出是蛇不是水管
  const curl = 4.2 * Math.min(1, Math.max(0, BASE.y - ny) / 30) * Math.sin(2 * Math.PI * s)
  return { x: BASE.x + sway + curl, y: BASE.y + (ny - BASE.y) * s }
}

/** 第四次蛇自己吹笛子那段換成吹笛子那張：脖子在圖上的位置不一樣 */
const FLUTE_POSE = { from: Infinity, to: -Infinity }
const neckAt = (t: number) => (t >= FLUTE_POSE.from && t < FLUTE_POSE.to ? NECK_F : NECK)

/** 一段時間裡，蛇頭跟著身體走（每 0.05 秒一段 moveTo），蛇身每 1/30 秒畫一次（一節一節的綠色管子） */
function snakeTrack(t0: number, t1: number): { moves: Move[]; fx: Fx[] } {
  const moves: Move[] = []
  const fx: Fx[] = []
  for (let t = t0; t < t1 - 1e-6; t += 0.05) {
    const n = bodyPoint(t + 0.05, 1)
    const k = neckAt(t + 0.05)
    moves.push({ at: t, dur: 0.05, actor: 'snake', do: 'moveTo', to: { x: n.x - k.dx, y: n.y - k.dy }, ease: 'linear' })
  }
  const DT = 1 / 30
  for (let t = t0; t < t1 - 1e-6; t += DT) {
    const { ny } = snakeAt(t)
    const len = BASE.y - ny
    if (len < 1) continue
    const K = Math.max(1, Math.min(7, Math.round(len / 6)))
    const pts = Array.from({ length: K + 1 }, (_, i) => bodyPoint(t, i / K))
    const w = (i: number) => BODY_W0 + (BODY_W - BODY_W0) * i / K
    for (let i = 0; i < K - 1; i++) {
      fx.push({ at: t, dur: DT + 0.004, kind: 'tube', actor: 'basket', dx: pts[i].x - BX, dy: pts[i].y - BY, to: pts[i + 1], color: SNAKE, width: w(i), n: 3 })
    }
    // 最上面一節接在蛇頭的脖子上（跟著蛇頭角色走，不會脫節）
    fx.push({ at: t, dur: DT + 0.004, kind: 'tube', actor: 'snake', dx: neckAt(t).dx, dy: neckAt(t).dy, to: pts[K - 1], color: SNAKE, width: BODY_W, n: 3 })
  }
  return { moves, fx }
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[]; pop: number; stop: number; end: number }

/** 每一次升多高（脖子的 y）、扭多大、點頭多大、跳多久 */
const HIGH = [TOP - 11 + HEAD_H, 21 + HEAD_H, 3 + HEAD_H]
const AMP = [1.2, 4, 9]
const BOB = [0, 2.2, 1.5]
const DANCE = [0.4, 0.6, 0.8]
/** 他吹多久才「啵」 */
const LEAD = 0.25

/**
 * 同一個笑點：他吸一口氣、把笛子舉到嘴邊（預備）→ 「嗶哩哩～」（同一段笛聲，一次多疊一個音），笛口飄出一串 🎵 飄向籃子 →
 * 「啵」蛇從籃子裡冒出來、升高、跟著音樂扭 → 他停下來喘氣，蛇愣一下，「咻」地縮回籃子。
 * at 是開始吹的那一刻，k 是第幾次（0～2）。
 */
function charm(at: number, k: number): Gag {
  const pop = at + LEAD
  const rise = pop + 0.3 + 0.08 * k
  const stop = rise + DANCE[k]
  const back = stop + 0.25
  const end = back + 0.13
  keys.push(
    { t: pop, ny: HIDE, amp: 0 },
    { t: rise, ny: HIGH[k], amp: AMP[k], bob: BOB[k], ease: 'back' },
    { t: stop, ny: HIGH[k], amp: AMP[k], bob: BOB[k] },
    { t: stop + 0.12, ny: HIGH[k], amp: 0, bob: 0, ease: 'out' },
    { t: back, ny: HIGH[k], amp: 0 },
    { t: end, ny: HIDE, amp: 0, ease: 'in' },
  )
  const moves: Move[] = [
    // 預備：吸一口氣（身體往上拉長），笛子舉到嘴邊
    { at: at - 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    { at: at - 0.45, dur: 0.35, actor: 'mouse', do: 'squash', amount: -0.12 },
    { at: at - 0.2, dur: 0.18, actor: 'flute', do: 'moveTo', to: FLUTE_PLAY, ease: 'out' },
    { at: at - 0.2, dur: 0.18, actor: 'flute', do: 'rotateTo', amount: PLAY_ROT, ease: 'out' },
    // 吹
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    // 啵：籃子一跳，籃蓋彈開飛到旁邊；蛇一邊扭一邊唱
    { at: pop, dur: 0.22, actor: 'basket', do: 'squash', amount: 0.18 + 0.05 * k },
    { at: pop, dur: 0.26, actor: 'lid', do: 'moveTo', to: LID_OFF, arc: 9 + 3 * k, ease: 'out' },
    { at: pop, dur: 0.26, actor: 'lid', do: 'rotateTo', amount: 360 },
    { at: rise - 0.05, actor: 'snake', do: 'swap', emoji: 'prop:snake-sing' },
    ...snakeTrack(pop, end + 0.05).moves,
  ]
  // 跟著節奏：笛子一抖一抖
  for (let t = at; t < stop - 0.1; t += 1 / BEAT_HZ) moves.push({ at: t, dur: 0.2, actor: 'flute', do: 'tilt', amount: 6 })
  // 第三次扭得整個籃子跟著晃
  if (k === 2) for (let t = rise; t < stop - 0.1; t += 0.5 / BEAT_HZ) moves.push({ at: t, dur: 0.22, actor: 'basket', do: 'tilt', amount: 5 * Math.sign(Math.sin(2 * Math.PI * BEAT_HZ / 2 * t)) || 5 })
  // 停：放下笛子、彎腰喘氣
  moves.push(
    { at: stop, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/tired' },
    { at: stop, dur: 0.2, actor: 'flute', do: 'moveTo', to: FLUTE_REST },
    { at: stop, dur: 0.2, actor: 'flute', do: 'rotateTo', amount: -PLAY_ROT },
    // 愣住（換回睜眼）→ 咻：縮回去；籃蓋「喀」飛回來蓋上，籃子一沉
    { at: stop, actor: 'snake', do: 'swap', emoji: 'prop:snake-head' },
    { at: end - 0.1, dur: 0.2, actor: 'lid', do: 'moveTo', to: LID_SHUT, arc: 8, ease: 'in' },
    { at: end - 0.1, dur: 0.2, actor: 'lid', do: 'rotateTo', amount: -360 },
    { at: end + 0.1, dur: 0.2, actor: 'basket', do: 'squash', amount: 0.2 },
  )
  const fx: Fx[] = [
    ...snakeTrack(pop, end + 0.05).fx,
    { at: pop, dur: 0.4, kind: 'puff', actor: 'basket', dy: TOP - BY - 0.42 * BS },
    { at: end, dur: 0.4, kind: 'puff', actor: 'basket', dy: TOP - BY - 0.42 * BS },
    { at: stop + 0.05, kind: 'sweat', actor: 'mouse', dx: 3 },
  ]
  // 音符：從笛口一串一串飄向籃子（音樂停才停）
  for (let t = at; t < stop - 0.2; t += 0.45) {
    fx.push({ at: t, dur: 0.7, kind: 'blow', actor: 'flute', ...FLUTE_END, target: 'basket', emoji: t === at ? '🎵' : '🎶', n: 3, scale: 1.5 })
  }
  const cues: Cue[] = []
  // 嗶哩哩～：同一段笛聲，跟著節奏一直吹；一次多疊一個音
  for (let t = at; t < stop - 0.1; t += 0.45) {
    cues.push({ at: t, sfx: 'blip' }, { at: t + 0.1, sfx: 'blip' })
    if (k >= 1) cues.push({ at: t + 0.2, sfx: 'blip' })
  }
  cues.push({ at: pop, sfx: 'poof' }, { at: pop + 0.05, sfx: 'boing' }, { at: back, sfx: 'whoosh' }, { at: end + 0.1, sfx: 'tap' })
  const camera: Camera[] = [
    { at: rise - 0.1, dur: 0.35, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: BX, y: (HIGH[k] - HEAD_H + TOP) / 2 } },
    { at: pop, dur: 0.25, do: 'shake', amount: 0.5 + 0.4 * k },
  ]
  const lights: Light[] = []
  return { moves, fx, camera, cues, lights, pop, stop, end }
}

// ---- 時間表 ----
const A1 = 1.25
const g1 = charm(A1, 0)
const A2 = g1.end + 0.4
const g2 = charm(A2, 1)
/** 停一拍：喘氣、搧風，吸一口大氣（鼓起來） */
const BEAT = g2.end + 0.08
const A3 = BEAT + 0.72
const g3 = charm(A3, 2)
/** 第三次縮回去太用力，籃子蹦到右邊；他累得退到左邊——中間讓給國字 */
const HOME = g3.end + 0.1
const PARK = HOME + 0.85
/** 籃子自己蹦回中間（裡面的蛇等不及了）；他吹不動了，一屁股坐下，笛子掉在地上 */
const SIT = PARK
const MX4 = 22
/** 回馬槍（第四次）：蛇自己冒出來——語詞那一刻 */
const POP4 = PARK + 0.5
const RISE4 = POP4 + 0.3
const WORD = RISE4
/** 尾巴從籃子裡伸出來捲起笛子，舉到嘴邊吹 */
const TAIL = WORD + 0.35
const GRAB = TAIL + 0.25
const PLAY4 = GRAB + 0.3
const ASK = 11.0
const ANSWER = 13.55
const AX = 36
const ASK_S = 1.3
const BACK4 = ASK - 0.2
/** 笛子掉在地上的地方（尾巴伸過來捲起來） */
const FLUTE_DROP: Vec = { x: 46, y: 73 }

/** 第四次：蛇升到最高、在畫面中間（語詞）；自己吹笛子的時候低一點 */
const PLAY_NY = 18 + HEAD_H
FLUTE_POSE.from = PLAY4
FLUTE_POSE.to = BACK4
keys.push(
  { t: POP4, ny: HIDE, amp: 0 },
  { t: RISE4, ny: HIGH[2], amp: 3, bob: 1, ease: 'back' },
  { t: GRAB, ny: HIGH[2], amp: 3, bob: 1 },
  { t: PLAY4, ny: PLAY_NY, amp: 4, bob: 1 },
  { t: PLAY4 + 0.2, ny: PLAY_NY, amp: 7, bob: 1.5 },
  { t: BACK4, ny: PLAY_NY, amp: 7, bob: 1.5 },
  { t: BACK4 + 0.15, ny: HIDE, amp: 0, ease: 'in' },
)
const t4 = snakeTrack(POP4, BACK4 + 0.2)
/** 吹笛子那張圖上笛子的中間（u 0.16、v 0.37）：地上的笛子被尾巴捲到這裡，就換成那張 */
const hold4 = (t: number): Vec => {
  const n = bodyPoint(t, 1)
  return { x: n.x - NECK_F.dx + (0.16 - 0.5) * SH, y: n.y - NECK_F.dy + (0.37 - 0.5) * SH }
}
/** 第四次笛子在哪：掉在地上 → 被尾巴捲起來送到嘴邊 */
function flute4(t: number): Vec {
  if (t <= GRAB) return FLUTE_DROP
  const h = hold4(PLAY4)
  if (t >= PLAY4) return h
  const p = (t - GRAB) / (PLAY4 - GRAB), e = p * p * (3 - 2 * p)
  return { x: FLUTE_DROP.x + (h.x - FLUTE_DROP.x) * e, y: FLUTE_DROP.y + (h.y - FLUTE_DROP.y) * e - 8 * Math.sin(Math.PI * p) }
}
/** 尾巴從籃口左邊伸出來 */
const TAIL_ROOT: Vec = { x: BX - 11, y: BASE.y + 1 }
/** 尾巴：從籃口彎彎地伸到地上的笛子（前 0.25 秒從籃子裡長出來），捲起來送到嘴邊就縮回去 */
function tail4(): { moves: Move[]; fx: Fx[] } {
  const moves: Move[] = []
  for (let t = GRAB; t < PLAY4 - 1e-6; t += 0.05) moves.push({ at: t, dur: 0.05, actor: 'flute', do: 'moveTo', to: flute4(t + 0.05), ease: 'linear' })
  const fx: Fx[] = []
  const DT = 1 / 30, K = 6
  for (let t = TAIL; t < PLAY4 - 1e-6; t += DT) {
    const g = Math.min(1, (t - TAIL) / 0.25)
    const E0 = flute4(t)
    const E = { x: TAIL_ROOT.x + (E0.x - TAIL_ROOT.x) * g, y: TAIL_ROOT.y + (E0.y - TAIL_ROOT.y) * g }
    const C = { x: Math.min(TAIL_ROOT.x, E.x) - 9 * g, y: TAIL_ROOT.y + 1 }
    const pts = Array.from({ length: K + 1 }, (_, i) => {
      const u = i / K
      return { x: (1 - u) ** 2 * TAIL_ROOT.x + 2 * u * (1 - u) * C.x + u * u * E.x, y: (1 - u) ** 2 * TAIL_ROOT.y + 2 * u * (1 - u) * C.y + u * u * E.y }
    })
    for (let i = 0; i < K - (g < 1 ? 0 : 1); i++) {
      fx.push({ at: t, dur: DT + 0.004, kind: 'tube', actor: 'basket', dx: pts[i].x - BX, dy: pts[i].y - BY, to: pts[i + 1], color: SNAKE, width: 5.6 - 2 * i / K, n: 2.6 })
    }
    // 尾巴尖捲在笛子上（跟著笛子角色走）
    if (g >= 1) fx.push({ at: t, dur: DT + 0.004, kind: 'tube', actor: 'flute', to: pts[K - 1], color: SNAKE, width: 3.6, n: 2.6 })
  }
  return { moves, fx }
}
const tl = tail4()

const all = [g1, g2, g3]

const clip: Clip = {
  format: 2,
  char: '蛇',
  meta: { theme: '小老鼠吹笛子，蛇從籃子裡扭出來', cast: '小老鼠＋蛇＋籃子（籃蓋）＋笛子', gags: ['小老鼠對著籃子吹笛子，「嗶哩哩」音樂一響，蛇就從籃子裡扭啊扭地升起來跟著跳舞，音樂一停就「咻」地縮回去；一次比一次高、一次比一次嗨（害羞冒個頭→升到跟他一樣高、跟著點頭→停一拍他吸一口大氣，蛇升到快碰到天、扭得籃子跟著晃）；回馬槍是他吹到沒氣坐下來，蛇自己冒出來、用尾巴捲起笛子吹，換小老鼠不由自主地跳起來扭屁股'] },
  duration: 15,
  // 沙漠的黃昏：暖橘的天空，綠色的蛇在上面最顯眼
  bg: { top: '#FFE3B8', bottom: '#FFF5E4', floor: '#E2B878', scenery: 'desert' },
  actors: [
    { id: 'snake', emoji: 'prop:snake-head', x: BASE.x - NECK.dx, y: HIDE - NECK.dy, size: SH },
    { id: 'basket', emoji: 'prop:charm-basket', x: BX, y: BY, size: BS },
    { id: 'lid', emoji: 'prop:basket-lid', x: LID_SHUT.x, y: LID_SHUT.y, size: LS, pivot: 'center' },
    { id: 'mouse', emoji: 'hero:mouse/walk', x: MX, y: MY, size: MS, hidden: true, flip: true },
    { id: 'flute', emoji: '🪈', x: FLUTE_REST.x, y: FLUTE_REST.y, size: FS, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：他拿著笛子走進來，轉身指著字框——蛇！再轉回來對著籃子
    { at: 0, dur: 0.45, actor: 'mouse', do: 'enter', from: { x: -22, y: MY }, ease: 'out' },
    { at: 0, dur: 0.45, actor: 'flute', do: 'enter', from: { x: FLUTE_REST.x - 56, y: FLUTE_REST.y }, ease: 'out' },
    { at: 0.45, actor: 'mouse', do: 'flip' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 0.95, actor: 'mouse', do: 'flip' },
    { at: 0.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    ...g1.moves,
    { at: g1.end + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    ...g2.moves,
    // 停一拍：喘氣、搧風……吸一口大氣，整個人鼓起來
    { at: BEAT, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/hot' },
    { at: BEAT + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: A3 - 0.5, dur: 0.4, actor: 'mouse', do: 'scaleTo', amount: 1.08 },
    ...g3.moves,
    { at: g3.stop, dur: 0.3, actor: 'mouse', do: 'scaleTo', amount: 1 / 1.08 },
    // 咻——縮回去太用力，籃子蹦到右邊（蛇躲在裡面）；他累得往後退，中間讓給國字
    { at: g3.end, dur: 0.01, actor: 'snake', do: 'vanish' },
    { at: g3.end + 0.12, dur: 0.22, actor: 'basket', do: 'moveTo', to: { x: 118, y: BY }, arc: 7, ease: 'linear' },
    { at: g3.end + 0.12, dur: 0.22, actor: 'lid', do: 'moveTo', to: { x: 118, y: LID_SHUT.y }, arc: 7, ease: 'linear' },
    { at: g3.end + 0.36, dur: 0.22, actor: 'basket', do: 'moveTo', to: { x: 140, y: BY }, arc: 5, ease: 'linear' },
    { at: g3.end + 0.36, dur: 0.22, actor: 'lid', do: 'moveTo', to: { x: 140, y: LID_SHUT.y }, arc: 5, ease: 'linear' },
    { at: HOME - 0.05, dur: 0.35, actor: 'mouse', do: 'moveTo', to: { x: MX4, y: MY }, ease: 'out' },
    { at: HOME - 0.05, dur: 0.35, actor: 'flute', do: 'moveTo', to: { x: FLUTE_REST.x + MX4 - MX, y: FLUTE_REST.y }, ease: 'out' },
    // 籃子自己蹦回中間（裡面的蛇等不及了）
    { at: PARK, dur: 0.2, actor: 'basket', do: 'moveTo', to: { x: 116, y: BY }, arc: 5, ease: 'linear' },
    { at: PARK, dur: 0.2, actor: 'lid', do: 'moveTo', to: { x: 116, y: LID_SHUT.y }, arc: 5, ease: 'linear' },
    { at: PARK + 0.22, dur: 0.2, actor: 'basket', do: 'moveTo', to: { x: BX, y: BY }, arc: 5, ease: 'linear' },
    { at: PARK + 0.22, dur: 0.2, actor: 'lid', do: 'moveTo', to: { x: BX, y: LID_SHUT.y }, arc: 5, ease: 'linear' },
    { at: POP4 - 0.02, dur: 0.01, actor: 'snake', do: 'pop' },
    // 吹不動了：一屁股坐下，笛子掉在地上
    { at: SIT, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    { at: SIT, dur: 0.25, actor: 'flute', do: 'moveTo', to: FLUTE_DROP, ease: 'in' },
    { at: SIT, dur: 0.25, actor: 'flute', do: 'rotateTo', amount: 45 },
    // 蛇自己冒出來——他傻眼，再指著牠：大蛇！
    { at: POP4, dur: 0.22, actor: 'basket', do: 'squash', amount: 0.25 },
    { at: POP4, dur: 0.26, actor: 'lid', do: 'moveTo', to: LID_OFF, arc: 12, ease: 'out' },
    { at: POP4, dur: 0.26, actor: 'lid', do: 'rotateTo', amount: 360 },
    ...t4.moves,
    { at: POP4 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: WORD - 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    // 尾巴伸出來捲起笛子，舉到嘴邊
    ...tl.moves,
    { at: GRAB, dur: PLAY4 - GRAB, actor: 'flute', do: 'scaleTo', amount: 0.55 },
    { at: GRAB, dur: PLAY4 - GRAB, actor: 'flute', do: 'rotateTo', amount: -45 },
    // 送到嘴邊：換成蛇自己吹笛子那張（笛子畫在圖上）
    { at: PLAY4, dur: 0.01, actor: 'flute', do: 'vanish' },
    { at: PLAY4, actor: 'snake', do: 'swap', emoji: 'prop:snake-flute' },
    // 嗶哩哩～ 換他不由自主地跳起來扭屁股
    { at: PLAY4 + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    ...[0, 1].map((i): Move => ({ at: PLAY4 + 0.4 + 0.45 * i, actor: 'mouse', do: 'flip' })),
    ...[0, 1].map((i): Move => ({ at: PLAY4 + 0.18 + 0.45 * i, dur: 0.3, actor: 'mouse', do: 'hop', amount: 3 })),
    ...[0, 1, 2, 3].map((i): Move => ({ at: PLAY4 + 0.18 + 0.22 * i, dur: 0.2, actor: 'mouse', do: 'tilt', amount: i % 2 ? -9 : 9 })),
    // 蛇縮回籃子（笛子也帶走），籃子跳出畫面
    // 咻：縮回籃子，籃蓋飛回來蓋上
    { at: BACK4, actor: 'snake', do: 'swap', emoji: 'prop:snake-head' },
    { at: BACK4 + 0.15, dur: 0.01, actor: 'snake', do: 'vanish' },
    { at: BACK4 + 0.05, dur: 0.2, actor: 'lid', do: 'moveTo', to: LID_SHUT, arc: 8, ease: 'in' },
    { at: BACK4 + 0.05, dur: 0.2, actor: 'lid', do: 'rotateTo', amount: -360 },
    { at: ASK + 0.2, dur: 0.35, actor: 'basket', do: 'moveTo', to: { x: 200, y: BY }, arc: 10, ease: 'in' },
    { at: ASK + 0.2, dur: 0.35, actor: 'lid', do: 'moveTo', to: { x: 200, y: LID_SHUT.y }, arc: 10, ease: 'in' },
    // 問他：蹦到左邊、放大，轉向觀眾
    { at: ASK - 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: ASK - 0.15, dur: 0.3, actor: 'mouse', do: 'moveTo', to: { x: AX, y: MY - 1 }, arc: 6, ease: 'out' },
    { at: ASK + 0.3, dur: 0.3, actor: 'mouse', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 12.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 12.6, dur: 0.3, actor: 'mouse', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'mouse', do: 'hop', amount: 1.5 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, dur: 0.3, actor: 'mouse', do: 'hop', amount: 7 },
    { at: ANSWER + 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: ANSWER + 0.2, actor: 'mouse', do: 'flip' },
    { at: ANSWER + 0.2, dur: 0.22, actor: 'mouse', do: 'moveTo', to: { x: -45, y: MY - 1 }, ease: 'in' },
  ],
  builds: [
    // 每一次蛇升到最高、扭起來，蛇身上就飛出一組：虫 → 宀 → 匕
    { at: g1.pop + 0.35, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5], from: { x: BASE.x, y: HIGH[0] - HEAD_H / 2 }, color: partColor('虫') },
    { at: g2.pop + 0.45, dur: 0.45, strokes: [6, 7, 8], from: { x: BASE.x, y: HIGH[1] + 4 }, color: partColor('宀') },
    { at: g3.pop + 0.5, dur: 0.45, strokes: [9, 10], from: { x: BASE.x, y: HIGH[2] + 10 }, color: partColor('匕') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['mouse'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    { at: BEAT + 0.05, kind: 'sweat', actor: 'mouse', dx: 3 },
    { at: POP4, dur: 0.4, kind: 'puff', actor: 'basket', dy: TOP - BY - 0.42 * BS },
    ...t4.fx,
    // 尾巴從籃子裡伸出來，捲著笛子
    ...tl.fx,
    // 語詞那一刻：亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: BASE.x - 6, y: 24, n: 8, emoji: '✨', scale: 1.3 },
    // 換蛇吹：音符飄向小老鼠
    ...[0, 1].map((i): Fx => ({ at: PLAY4 + 0.45 * i, dur: 0.7, kind: 'blow', actor: 'snake', dx: (0.05 - 0.5) * SH, dy: (0.36 - 0.193) * SH, to: { x: MX4 + 10, y: 50 }, emoji: i % 2 ? '🎶' : '🎵', n: 3, scale: 1.5 })),
  ],
  camera: [
    // 鏡頭鎖全景（蛇從地上升到畫面頂），只有冒出來那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: POP4, dur: 0.25, do: 'shake', amount: 1.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '蛇' },
    ...all.flatMap((g) => g.cues),
    { at: HOME + 0.1, say: '蛇' },
    { at: POP4, sfx: 'poof' },
    { at: POP4 + 0.05, sfx: 'boing' },
    { at: WORD, say: '大蛇' },
    { at: GRAB, sfx: 'tap' },
    ...[0, 1].flatMap((i): Cue[] => [{ at: PLAY4 + 0.45 * i, sfx: 'blip' }, { at: PLAY4 + 0.45 * i + 0.1, sfx: 'blip' }, { at: PLAY4 + 0.45 * i + 0.2, sfx: 'blip' }]),
    { at: BACK4, sfx: 'whoosh' },
    { at: BACK4 + 0.25, sfx: 'tap' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '蛇' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
