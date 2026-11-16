import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 椅（v2）：小骷髏坐在一張大木椅上，就是不肯乖乖坐——每次把椅子往後翹、只用兩隻後腳撐著搖，翹完「叩！」地落回來，
// 一次比一次斜、一次比一次驚險：
// 翹一點點、晃兩下，得意地笑（木）→ 翹很斜，手亂揮才拉回來，冒汗（大）→
// 先停一拍：他左看看、右看看，沒人管——翹到快平了，定在半空抖啊抖，千鈞一髮「咚」地彈回來，
// 把他往前拋出去、在空中翻一圈趴在地上，椅子也被震得往後彈開（可）。國字回中央唸「椅」。
// 國字讓到左上角，他爬起來把椅子拖回畫面中間，指著它：「椅子」。
// 回馬槍（第四次）：他學乖了，端端正正坐好、閉眼——椅子自己「吱——」地往後翹，越翹越斜，
// 最後連人帶椅「咚」地整個往後躺平，他四腳朝天、眼睛轉圈圈。
// 最後畫面暗下來只剩「椅」，小骷髏問「這是什麼字？」，手放耳邊等他回答，再指著字說「椅！」，然後退場只留字。
// 刻意不跟「舊」（舊椅子一坐就垮）、「公」「孫」（阿公的搖椅）、「枝」（樹枝彈人）、「虹」（每次都溜走）撞：
// 這支的椅子從頭到尾完好，每一次都是同一個動作（往後翹），只有傾斜的角度越來越大：12° → 30° → 64° → 90°。
// 椅、椅、椅子、這是什麼字？、椅

/** 小骷髏（hero:jerry；圖朝左，坐在椅子上也朝左，椅背在他背後右邊） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 木椅（prop:chair，椅面朝左前、椅背在右邊）：畫面上最大的東西 */
const CS = 46
const CY = 77 - 0.42 * CS
/** 翹椅子的地方（畫面中間偏右，翹到快平時椅背、他的帽子還在畫面裡） */
const C1 = 90
/** 被彈開後椅子停的地方（國字回中央那一秒，左緣約 x 122） */
const C2 = 138
/** 回馬槍時椅子被拖回來的地方（畫面中間） */
const C3 = 76
/** 坐在椅子上：他的腳底（屁股）落在椅面上，比椅子的 x 偏右一點、讓前面的椅面和椅腳露出來 */
const SIT_DX = 1.5
const SIT_Y = 45.4
/** 每一次往後翹的角度：一次比一次斜，最後整個躺平 */
const TIP = [12, 30, 64, 90]

/** 支點：椅子右後腳的腳底（圖裡約 (395, 436)／512），相對椅子的腳底中心 */
const PIVOT_DX = 0.2715 * CS
const PIVOT_DY = -0.068 * CS
/** 翹起來時整張往下沉多少（後腳腳底沉到地板線） */
const SINK = 4.5
const pivotOf = (cx: number): Vec => ({ x: cx + PIVOT_DX, y: CY + 0.42 * CS + PIVOT_DY })

/**
 * 繞椅子後腳轉了 deg 度之後，一個角色（rest 是它沒轉時的 x、y）該放在哪：
 * 引擎以腳底為支點轉、而且轉得越斜越把腳底抬高（AnimPlayer 的 tip），這裡反算回來，讓後腳一直踩在地上、他一直坐在椅面上。
 */
function around(cx: number, rest: Vec, size: number, deg: number): Vec {
  const P = pivotOf(cx)
  const Lx = P.x - rest.x, Ly = P.y - (rest.y + 0.42 * size)
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r), s = Math.sin(r)
  const bx = P.x - (Lx * c - Ly * s)
  const base = P.y - (Lx * s + Ly * c)
  const tip = Math.min(1, Math.abs(s))
  // 斜看的椅子後腳畫得比前腳高（遠近）：一翹起來只剩後腳著地，整張往下沉到前腳原本的地板線，才不會像浮在半空
  const sink = SINK * Math.min(1, Math.abs(deg) / 10)
  return { x: bx, y: base - 0.42 * size + tip * 0.42 * size + sink }
}

const chairAt = (cx: number): Vec => ({ x: cx, y: CY })
const seatAt = (cx: number): Vec => ({ x: cx + SIT_DX, y: SIT_Y })

type Ease = 'in' | 'out' | 'inOut' | 'linear'
const EASE: Record<Ease, (p: number) => number> = {
  linear: (p) => p,
  in: (p) => p * p,
  out: (p) => 1 - (1 - p) * (1 - p),
  inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
}

/**
 * 椅子（和坐在上面的他）從 a 度翹到 b 度：拆成很多小段直線，每段的終點都剛好踩在後腳上。
 * withJerry=false 時只轉椅子（他已經被拋出去了）。
 */
function tipChair(cx: number, at: number, a: number, b: number, dur: number, ease: Ease, withJerry = true): Move[] {
  const n = Math.max(2, Math.ceil(Math.abs(b - a) / 6))
  const out: Move[] = []
  for (let i = 0; i < n; i++) {
    const d0 = a + (b - a) * EASE[ease](i / n)
    const d1 = a + (b - a) * EASE[ease]((i + 1) / n)
    const t = at + (dur * i) / n
    const d = dur / n
    out.push(
      { at: t, actor: 'chair', do: 'rotateTo', amount: d1 - d0, dur: d, ease: 'linear' },
      { at: t, actor: 'chair', do: 'moveTo', to: around(cx, chairAt(cx), CS, d1), dur: d, ease: 'linear' },
    )
    if (withJerry) out.push(
      { at: t, actor: 'jerry', do: 'rotateTo', amount: d1 - d0, dur: d, ease: 'linear' },
      { at: t, actor: 'jerry', do: 'moveTo', to: around(cx, seatAt(cx), JS, d1), dur: d, ease: 'linear' },
    )
  }
  return out
}

/** 椅子跟他一起抖（翹在半空撐著） */
const quake = (at: number, dur: number, amount: number): Move[] => [
  { at, actor: 'chair', do: 'shake', amount, dur },
  { at, actor: 'jerry', do: 'shake', amount, dur },
]

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 同一個「叩！」：椅子前腳落回地上那一下（地板噴一圈木屑星星、鏡頭一震），k 越大越用力 */
function thud(cx: number, at: number, k: number): Gag {
  return {
    // 躺平那次（k=3）椅子轉了 90°，以腳底為準的壓扁會把整張甩開，不壓
    moves: k < 3 ? [{ at, actor: 'chair', do: 'squash', amount: 0.08 + 0.05 * k, dur: 0.2 }] : [{ at, actor: 'chair', do: 'shake', amount: 0.8, dur: 0.25 }],
    fx: [{ at, kind: 'burst', x: cx - 10, y: 76, emoji: '💥', dur: 0.35, scale: 1 + 0.3 * k }],
    camera: [{ at, dur: 0.3, do: 'shake', amount: 0.8 + 0.7 * k }],
    cues: [{ at, sfx: k >= 2 ? 'bonk' : 'tap' }, ...(k >= 1 ? [{ at: at + 0.02, sfx: 'bonk' } as Cue] : [])],
  }
}

/** 往後翹時「吱——」：椅子後腳的聲音 */
const creak = (at: number): Cue => ({ at, sfx: 'slide' })

// ── 開場：走進來，指著字框唸「椅」，跳上椅子坐好
const SAY1 = 0.55
const HOPON = 0.95
const SIT1 = HOPON + 0.3
// ── 第 1 次：翹一點點，晃兩下，得意
const T1 = 1.45
const LAND1 = T1 + 0.3 + 0.3 + 0.2
// ── 第 2 次：翹很斜，手亂揮才拉回來
const T2 = LAND1 + 0.35
const HOLD2 = T2 + 0.35
const LAND2 = HOLD2 + 0.4 + 0.18
// ── 第 3 次前停一拍：左看看、右看看
const LOOK = LAND2 + 0.25
const T3 = LOOK + 0.65
const HOLD3 = T3 + 0.6
const SNAP3 = HOLD3 + 0.6
const LAND3 = SNAP3 + 0.12
/** 被拋出去、趴在地上 */
const FLY = LAND3
const FLAT = FLY + 0.45
const FLAT_AT: Vec = { x: 22, y: JY }
/** 字框填滿、國字到正中央 */
const HOME = FLAT + 0.08
const PARK = HOME + 0.95
/** 語詞：爬起來，把椅子拖回中間 */
const RUN = PARK + 0.05
const GRAB = RUN + 0.4
const GRAB_X = C2 - 26
const PULL = GRAB + 0.05
const WORD = PULL + 0.5
const PULL_DX = C3 - C2
// ── 回馬槍（第 4 次）：端端正正坐好，椅子自己翹
const HOPON4 = WORD + 0.55
const SIT4 = HOPON4 + 0.3
const T4 = SIT4 + 0.2
const CRASH = T4 + 0.4 + 0.35 + 0.25
/** 問他 */
const ASK = CRASH + 0.55
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字偏左） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }

const k1 = thud(C1, LAND1, 0)
const k2 = thud(C1, LAND2, 1)
const k3 = thud(C1, LAND3, 2)
const k4 = thud(C3 + 52, CRASH, 3)

const builds: Build[] = [
  // 每一次椅子「叩」地落回來，木頭椅子就震出一組筆畫：木 → 大 → 可（丁＋口）
  { at: LAND1 + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: 'chair', color: partColor('木') },
  { at: LAND2 + 0.05, dur: 0.5, strokes: [4, 5, 6], from: 'chair', color: partColor('大') },
  { at: LAND3 + 0.03, dur: 0.5, strokes: [7, 11], from: 'chair', color: partColor('丁') },
  { at: LAND3 + 0.03, dur: 0.5, strokes: [8, 9, 10], from: 'chair', color: partColor('口') },
]

const clip: Clip = {
  format: 2,
  char: '椅',
  meta: { theme: '翹椅子', cast: '小骷髏＋木椅', gags: ['小骷髏坐在木椅上不乖乖坐，每次把椅子往後翹、只用兩隻後腳撐著搖，「叩」地落回來，一次比一次斜（翹一點點晃兩下得意→翹很斜手亂揮才拉回來冒汗→左看右看沒人管，翹到快平了定在半空抖，「咚」地彈回來把他拋出去趴在地上）；回馬槍是他學乖了端正坐好，椅子卻自己「吱——」地往後翹，連人帶椅整個躺平，他四腳朝天'] },
  duration: 15,
  bg: { top: '#BEE7FF', bottom: '#F2FAFF', floor: '#E8D2A6', scenery: 'hills' },
  actors: [
    { id: 'chair', emoji: 'prop:chair', x: C1, y: CY, size: CS },
    { id: 'jerry', emoji: 'hero:jerry/walk', x: 66, y: JY, size: JS, flip: true },
  ],
  moves: [
    // 開場：走進來
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.5 },
    // 轉身指著左上角的字框：椅！
    { at: SAY1 - 0.05, actor: 'jerry', do: 'flip' },
    { at: SAY1 - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    // 跳上椅子坐好（朝左坐，椅背在背後）
    { at: HOPON, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: HOPON, actor: 'jerry', do: 'moveTo', to: seatAt(C1), arc: 10, dur: SIT1 - HOPON },
    { at: SIT1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/full' },
    { at: SIT1, actor: 'chair', do: 'squash', amount: 0.12, dur: 0.2 },

    // ── 第 1 次：翹 12°，晃兩下，落回來（得意地笑）
    ...tipChair(C1, T1, 0, TIP[0], 0.3, 'out'),
    ...tipChair(C1, T1 + 0.3, TIP[0], TIP[0] - 5, 0.15, 'inOut'),
    ...tipChair(C1, T1 + 0.45, TIP[0] - 5, TIP[0], 0.15, 'inOut'),
    ...tipChair(C1, T1 + 0.6, TIP[0], 0, 0.2, 'in'),
    ...k1.moves,
    { at: LAND1 + 0.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.2 },

    // ── 第 2 次：翹 30°，手亂揮，好不容易拉回來（冒汗）
    ...tipChair(C1, T2, 0, TIP[1], 0.35, 'out'),
    { at: T2 + 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/slip' },
    ...quake(HOLD2, 0.4, 0.9),
    ...tipChair(C1, HOLD2 + 0.4, TIP[1], 0, 0.18, 'in'),
    ...k2.moves,
    { at: LAND2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },

    // ── 停一拍：左看看、右看看，沒人管
    { at: LOOK, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/peek' },
    { at: LOOK + 0.22, actor: 'jerry', do: 'flip' },
    { at: LOOK + 0.44, actor: 'jerry', do: 'flip' },
    { at: T3 - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/full' },

    // ── 第 3 次：翹到 64°，快平了，定在半空抖啊抖——「咚」彈回來，把他拋出去
    ...tipChair(C1, T3, 0, TIP[2], 0.6, 'out'),
    { at: T3 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/slip' },
    ...quake(HOLD3, 0.6, 1.3),
    ...tipChair(C1, SNAP3, TIP[2], 0, 0.12, 'in'),
    // 彈回來太猛，往前多翹一點又站穩
    ...tipChair(C1, LAND3, 0, -9, 0.08, 'out', false),
    ...tipChair(C1, LAND3 + 0.08, -9, 0, 0.1, 'in', false),
    ...k3.moves,
    // 他被往前拋出去，空中翻一圈，趴在地上
    { at: FLY, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: FLY, actor: 'jerry', do: 'moveTo', to: FLAT_AT, arc: 16, dur: FLAT - FLY, ease: 'linear' },
    { at: FLY, actor: 'jerry', do: 'rotateTo', amount: -360, dur: FLAT - FLY, ease: 'linear', pivot: 'center' },
    { at: FLAT, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },
    // 椅子被震得往後彈開（國字回中央時讓到右邊）
    { at: LAND3 + 0.2, actor: 'chair', do: 'moveTo', to: chairAt(C2), arc: 6, dur: 0.35, ease: 'out' },
    { at: LAND3 + 0.2, actor: 'chair', do: 'tilt', amount: 10, dur: 0.35 },

    // ── 語詞：爬起來跑過去，把椅子拖回中間，指著它
    { at: RUN, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dash' },
    { at: RUN, actor: 'jerry', do: 'flip' },
    { at: RUN, actor: 'jerry', do: 'moveTo', to: { x: GRAB_X, y: JY }, dur: GRAB - RUN, ease: 'inOut' },
    { at: GRAB, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/pull' },
    { at: PULL, actor: 'jerry', do: 'moveTo', to: { x: GRAB_X + PULL_DX, y: JY }, dur: WORD - PULL - 0.05 },
    { at: PULL, actor: 'chair', do: 'moveTo', to: chairAt(C3), dur: WORD - PULL - 0.05 },
    { at: PULL, actor: 'chair', do: 'shake', amount: 0.5, dur: WORD - PULL - 0.05 },
    { at: WORD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: WORD, actor: 'chair', do: 'hop', amount: 3, dur: 0.3 },

    // ── 回馬槍：端端正正坐好、閉眼——椅子自己往後翹，連人帶椅躺平
    { at: HOPON4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: HOPON4, actor: 'jerry', do: 'moveTo', to: seatAt(C3), arc: 10, dur: SIT4 - HOPON4 },
    { at: SIT4, actor: 'jerry', do: 'flip' },
    { at: SIT4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/full' },
    { at: SIT4, actor: 'chair', do: 'squash', amount: 0.12, dur: 0.2 },
    // 吱——（慢慢翹，他還閉著眼）
    ...tipChair(C3, T4, 0, 18, 0.4, 'inOut'),
    // 他睜眼：咦？
    { at: T4 + 0.4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/slip' },
    ...tipChair(C3, T4 + 0.4, 18, 50, 0.35, 'inOut'),
    // 咚！整個往後躺平
    ...tipChair(C3, T4 + 0.75, 50, TIP[3], 0.25, 'in'),
    ...k4.moves,
    { at: CRASH, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dizzy' },

    // 問他之前：椅子退掉
    { at: ASK - 0.15, actor: 'chair', do: 'vanish', dur: 0.12 },
    // 問他：站起來、轉向國字、變大
    { at: ASK + 0.05, actor: 'jerry', do: 'rotateTo', amount: -TIP[3], dur: 0.15 },
    { at: ASK + 0.05, actor: 'jerry', do: 'flip' },
    { at: ASK + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.05, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.35 },
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
    // 空字框一開始就在左上角（右邊留給往後翹的椅子）
    { at: 0, dur: 0.01, do: 'park', to: { x: 30, y: 22 } },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: { x: 30, y: 22 } },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.35, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 第 1 次：得意
    { at: T1 + 0.35, kind: 'pop', actor: 'jerry', emoji: '😁', dur: 0.5, dx: -8 },
    ...k1.fx,
    // 第 2 次：手亂揮、冒汗
    { at: HOLD2, kind: 'sweat', actor: 'jerry', dx: -6 },
    ...k2.fx,
    { at: LAND2 + 0.1, kind: 'sweat', actor: 'jerry', dx: -6 },
    // 停一拍：偷看有沒有人
    { at: LOOK + 0.05, kind: 'pop', actor: 'jerry', emoji: '👀', dur: 0.55, dx: -8 },
    // 第 3 次：定在半空抖啊抖
    { at: HOLD3, kind: 'sweat', actor: 'jerry', dx: -6 },
    { at: HOLD3 + 0.2, kind: 'pop', actor: 'jerry', emoji: '❗', dur: 0.4, dx: -10 },
    ...k3.fx,
    { at: FLAT, kind: 'burst', x: FLAT_AT.x + 6, y: 66, emoji: '💥', dur: 0.4, scale: 1.4 },
    // 語詞：椅子亮晶晶
    { at: WORD, kind: 'burst', actor: 'chair', emoji: '✨', n: 7, dur: 0.5, scale: 1.3 },
    // 第 4 次：咦？椅子自己在翹
    { at: T4 + 0.3, kind: 'pop', actor: 'jerry', emoji: '❓', dur: 0.5, dx: -10 },
    // 四腳朝天、轉圈圈
    ...k4.fx,
    { at: CRASH + 0.1, kind: 'dizzy', actor: 'jerry', dur: ASK - CRASH - 0.15 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把翹起來的椅背、拋出去的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...k1.camera,
    ...k2.camera,
    { at: HOLD3, dur: 0.6, do: 'shake', amount: 0.5 },
    ...k3.camera,
    { at: FLAT, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: C3, y: 50 } },
    ...k4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '椅' },
    { at: SIT1, sfx: 'plop' },
    creak(T1),
    ...k1.cues,
    creak(T2),
    { at: HOLD2, sfx: 'whoosh' },
    ...k2.cues,
    { at: LOOK + 0.22, sfx: 'blip' },
    { at: LOOK + 0.44, sfx: 'blip' },
    creak(T3),
    creak(T3 + 0.3),
    ...k3.cues,
    { at: FLY + 0.05, sfx: 'whoosh' },
    { at: FLAT, sfx: 'plop' },
    { at: HOME + 0.2, say: '椅' },
    { at: PULL, sfx: 'slide' },
    { at: WORD, say: '椅子' },
    { at: SIT4, sfx: 'plop' },
    creak(T4),
    creak(T4 + 0.4),
    ...k4.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '椅' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
