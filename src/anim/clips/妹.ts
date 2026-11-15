import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 妹（v2）：妹妹的撒嬌絕招。兔子哥哥手上有好東西，兔子女孩（妹妹）走到他面前，仰頭、雙手合十——
// 鏡頭推近她的臉，「叮！」她變大一圈、兩隻眼睛旁邊各亮一顆大 ✨，一串小愛心往哥哥飄過去「啵」打中他胸口（💘）——
// 哥哥嚇一跳、撐一下、抖一抖……還是投降，抓頭傻笑，把東西往前一遞，東西畫一道小弧線到她手上。
// 同一個「合十→叮✨→愛心打中哥哥→投降遞過來」，拿到的一次比一次大：
// 他的紅蘋果（女從蘋果上飛出來）→ 他的大泰迪熊（未的兩橫）→
// 先停一拍：哥哥學乖了，把腳踏車舉過頭、閉緊眼睛轉頭不看；她「叮」一下，愛心打不到閉著的眼睛，她冒汗、再湊近一步，
// 最大的「叮叮叮！」——他忍不住睜眼，愛心打中，腳踏車也交出來（未的豎、撇、捺）。拿到的大東西她往背後一丟，堆成一堆。
// 語詞那一刻她拿著蘋果站在正中間跳起來，哥哥在旁邊抓頭：「妹妹」。
// 回馬槍（第四次，反過來）：哥哥學她，彎腰、合十、眨眼「叮」想要回蘋果——她看了他一秒，「啊嗚」一口把蘋果吃掉。
// 哥哥嚇得跳起來，趕快把泰迪熊和腳踏車搶回來抱著逃走，她摀嘴偷笑。
// 最後畫面暗下來只剩「妹」，她問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「妹！」，然後退場只留字。
// 刻意不跟「要」（看到更大的就丟掉手上的）、「給」（打開禮物被整）、「爸」（舉高高、騎肩膀）、「哥」（喊哥哥來舉東西）撞。
// 妹、妹、妹妹、這是什麼字？、妹

/** 兔子女孩（妹妹，明星、主角）：站在畫面中間、面向右邊的哥哥（flip） */
const SB = 40
const BY = 77 - 0.42 * SB
const BX = 70
/** 兔子哥哥（道具圖 prop:bro*，正面）：比她高一個頭以上，站在右邊 */
const RS = 58
const RY = 77 - 0.42 * RS
const BR = 112
/** 紅蘋果：拿在她合十的雙手前面（鮮紅、輪廓清楚，縮圖上也看得到） */
const AS = 12
const A_DX = 10
const A_DY = 5
/** 「叮」那一下她變大的倍率（腳底不動） */
const CUTE = 1.3
/** 泰迪熊、腳踏車：一次只帶一樣上場（哥哥從右邊外面拿進來），被她拿到以後丟到左邊她的那一堆 */
const TS = 22
const TY = 77 - 0.42 * TS
const KS = 30
const KY = 77 - 0.42 * KS
const PILE_T = { x: 30, y: TY }
const PILE_K = { x: 14, y: KY }
/** 哥哥拿在手邊（他左手、畫面右邊）；舉過頭頂（bro-lift 的手掌在圖的 v 0.15） */
const HOLD_X = BR + 19
const OVER_Y = 77 - RS * 0.85 - 8
const OFF = 190
/** 字框在左上角：哥哥與他的東西在右邊、太陽在右上，左上角後面是素色的天空 */
const FRAME = { x: 26, y: 22 }
const FRAME_K = 0.46
const WIDE = { x: 80, y: 45 }

/** 蘋果已經在她手上（跟著她跳、跟著她變大） */
let held = false

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 蘋果在她手上的位置（她站在 x、放大 k 倍時） */
const inHand = (x: number, k = 1) => ({ x: x + A_DX * k, y: 77 - (77 - BY - A_DY) * k })

/**
 * 固定訊號（四次同一套）：她仰頭、雙手合十（drool：星星眼、手握在胸前），鏡頭推近她的臉 →
 * 「叮！」她變大一圈、兩隻眼睛旁邊各一顆大 ✨（停 0.45 秒），一串小愛心往哥哥飄過去。
 * x 是她站的地方；k 是第幾次（越後面越大）；weak 是第三次前那一下沒用的（愛心飄到一半就掉了）。
 * 回傳愛心打到哥哥的那一刻。
 */
function plea(P: number, k: number, x = BX, weak = false) {
  const eyeY = 77 - 0.4 * SB * CUTE
  g.moves.push(
    { at: P - 0.32, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/drool' },
    { at: P - 0.3, dur: 0.3, actor: 'bunny', do: 'tilt', amount: 9 },
    { at: P, dur: 0.14, actor: 'bunny', do: 'scaleTo', amount: CUTE, ease: 'back' },
    { at: P + 0.5, dur: 0.15, actor: 'bunny', do: 'scaleTo', amount: 1 / CUTE },
  )
  if (held) {
    const big = inHand(x, CUTE), small = inHand(x)
    g.moves.push(
      { at: P, dur: 0.14, actor: 'apple', do: 'moveTo', to: big, ease: 'back' },
      { at: P + 0.5, dur: 0.15, actor: 'apple', do: 'moveTo', to: small },
    )
  }
  const s = weak ? 1.7 : 2.0 + 0.25 * k
  g.fx.push(
    // 兩顆大 ✨ 貼在她兩隻眼睛外側（比眼睛大，不蓋臉）
    { at: P, kind: 'pop', x: x - 16, y: eyeY - 2, emoji: '✨', dur: 0.5, scale: s },
    { at: P, kind: 'pop', x: x + 13, y: eyeY - 2, emoji: '✨', dur: 0.5, scale: s },
    // 小愛心一顆接一顆往哥哥飄過去
    weak
      ? { at: P + 0.2, kind: 'blow', actor: 'bunny', emoji: '💕', to: { x: x + 22, y: eyeY + 6 }, dx: 6, dy: 10, n: 2, dur: 0.4 }
      : { at: P + 0.2, kind: 'blow', actor: 'bunny', emoji: '💕', target: 'bro', dx: 6, dy: 10, n: 3 + k, dur: 0.35 },
  )
  // 推近她：她的臉佔畫面高度三分之一以上（國字框還在左上，引擎會留著它）
  g.camera.push(
    { at: P - 0.3, dur: 0.25, do: 'zoom', amount: 1.6, to: { x: x + 6, y: 40 } },
    { at: P + 0.5, dur: 0.2, do: 'zoom', amount: 1.01, to: WIDE },
  )
  g.cues.push({ at: P, sfx: 'clink' })
  if (k >= 1 && !weak) g.cues.push({ at: P + 0.1, sfx: 'clink' })
  if (k >= 2 && !weak) g.cues.push({ at: P + 0.2, sfx: 'clink' })
  return P + 0.52
}

/**
 * 愛心打中哥哥：嚇一跳（bro-shock）、💘 在胸口、撐一下（抖、冒汗），然後投降（bro-oops 抓頭傻笑＋洩氣的滑音）。
 * 回傳投降那一刻。
 */
function melt(S: number, k: number) {
  const G = S + 0.35 + 0.08 * k
  g.moves.push(
    { at: S, actor: 'bro', do: 'swap', emoji: 'prop:bro-shock' },
    { at: S, dur: 0.3, actor: 'bro', do: 'hop', amount: 2.5 + 1.5 * k },
    { at: S + 0.3, dur: G - S - 0.32, actor: 'bro', do: 'shake', amount: 0.6 + 0.4 * k },
    { at: G, actor: 'bro', do: 'swap', emoji: 'prop:bro-oops' },
  )
  g.fx.push(
    // 💘 打在他胸口（不蓋臉）
    { at: S, kind: 'pop', x: BR - 14, y: 66, emoji: '💘', dur: 0.5, scale: 1.4 + 0.3 * k },
    { at: G, kind: 'sweat', actor: 'bro', dx: -9, dur: 0.55 },
  )
  g.cues.push({ at: S, sfx: 'boing' }, { at: G, sfx: 'deflate' })
  return G
}

/** 他投降、把東西往前一遞，東西畫一道小弧線到她手上：她開心地抱住、跳一下 */
function handOver(G: number, id: string, from: { x: number; y: number }, to: { x: number; y: number }, arc: number) {
  const L = G + 0.42
  g.moves.push(
    { at: G + 0.04, dur: 0.1, actor: id, do: 'moveTo', to: { x: from.x - 7, y: from.y }, ease: 'out' },
    { at: G + 0.14, dur: 0.28, actor: id, do: 'moveTo', to, arc, ease: 'inOut' },
    { at: L, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: L, dur: 0.25, actor: 'bunny', do: 'hop', amount: 3 },
  )
  if (held) g.moves.push({ at: L, dur: 0.25, actor: 'apple', do: 'hop', amount: 3 })
  g.cues.push({ at: G + 0.14, sfx: 'whoosh' }, { at: L, sfx: 'tap' })
  return L
}

/** 她把拿到的大東西往背後一丟，丟進左邊那一堆 */
function toss(T: number, id: string, to: { x: number; y: number }, spin: number) {
  g.moves.push(
    { at: T, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/throw' },
    { at: T + 0.04, dur: 0.34, actor: id, do: 'moveTo', to, arc: 12, ease: 'linear' },
    { at: T + 0.04, dur: 0.34, actor: id, do: 'rotateTo', amount: spin },
    { at: T + 0.28, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  )
  if (held) g.moves.push({ at: T + 0.02, dur: 0.15, actor: 'apple', do: 'hop', amount: 2 })
  g.cues.push({ at: T + 0.02, sfx: 'whoosh' }, { at: T + 0.38, sfx: 'plop' })
}

const APPLE_HOLD = { x: HOLD_X, y: RY + 2 }
// 第 1 次：他的紅蘋果（她留在手上）
const P1 = 0.6
const G1 = melt(plea(P1, 0), 0)
const L1 = handOver(G1, 'apple', APPLE_HOLD, inHand(BX), 8)
held = true
// 第 2 次：他從右邊外面拿出大泰迪熊
const PICK2 = L1 - 0.15
const TEDDY_HOLD = { x: HOLD_X, y: TY - 8 }
g.moves.push({ at: PICK2, dur: 0.28, actor: 'teddy', do: 'moveTo', to: TEDDY_HOLD, arc: 6, ease: 'out' })
const P2 = PICK2 + 0.5
const G2 = melt(plea(P2, 1), 1)
const L2 = handOver(G2, 'teddy', TEDDY_HOLD, { x: BX + 10, y: BY + 2 }, 10)
const T2 = L2 + 0.12
toss(T2, 'teddy', PILE_T, -360)
// 第 3 次前停一拍：他從右邊外面拿出腳踏車舉過頭、閉緊眼睛轉頭不看
const LIFT3 = T2 + 0.15
const BIKE_OVER = { x: BR, y: OVER_Y }
g.moves.push(
  { at: LIFT3, actor: 'bro', do: 'swap', emoji: 'prop:bro-lift' },
  { at: LIFT3, dur: 0.28, actor: 'bike', do: 'moveTo', to: BIKE_OVER, arc: 6, ease: 'out' },
  { at: LIFT3 + 0.25, dur: 0.3, actor: 'bro', do: 'tilt', amount: -6 },
)
const P3A = LIFT3 + 0.5
plea(P3A, 2, BX, true)
// 沒用！他閉著眼睛搖頭；她冒汗、再湊近一步
const NEAR = P3A + 0.55
g.moves.push(
  { at: P3A + 0.3, dur: 0.35, actor: 'bro', do: 'shake', amount: 1.4 },
  { at: P3A + 0.52, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  { at: NEAR, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: BX + 5, y: BY }, ease: 'out' },
  { at: NEAR, dur: 0.2, actor: 'apple', do: 'moveTo', to: inHand(BX + 5), ease: 'out' },
)
g.fx.push({ at: P3A + 0.52, kind: 'sweat', actor: 'bunny', dx: 9, dur: 0.45 })
g.cues.push({ at: P3A + 0.52, sfx: 'blip' })
const P3 = NEAR + 0.35
const S3 = plea(P3, 2, BX + 5)
// 他忍不住睜眼：愛心打中，腳踏車從頭上遞下來「咚」地落到她面前
g.moves.push({ at: S3, dur: 0.01, actor: 'bro', do: 'tilt', amount: 6 })
const G3 = melt(S3, 2)
const L3 = handOver(G3, 'bike', BIKE_OVER, { x: BX + 22, y: KY }, 6)
g.cues.push({ at: L3, sfx: 'bonk' })
g.camera.push({ at: L3, dur: 0.3, do: 'shake', amount: 1.4 })
const T3 = L3 + 0.15
toss(T3, 'bike', PILE_K, -360)

/** 國字放大到中間：她讓到左邊，哥哥退到右邊 */
const ASIDE = T3 + 0.17
const HOME = T3 + 0.3
const PARK = HOME + 0.85
const WORD = PARK + 0.4
/** 回馬槍：哥哥學她撒嬌要回蘋果 */
const X4 = WORD + 0.5
const P4 = X4 + 0.2
const EAT = P4 + 0.55
const RUN = EAT + 0.33
const ASK = 11.1
const Q = ASK + 0.03
const ANSWER = Q + 2.48
/** 問他的時候她放大一點 */
const ASK_S = 1.15
const AX = 126

const clip: Clip = {
  format: 2,
  char: '妹',
  meta: { theme: '妹妹的撒嬌絕招', cast: '兔子女孩＋兔子哥哥＋紅蘋果、泰迪熊、腳踏車', gags: ['哥哥手上有好東西，兔子女孩走到他面前雙手合十，鏡頭推近、她眼睛「叮」地兩邊各亮一顆大 ✨，一串小愛心飄過去打中哥哥，他撐一下就投降，把東西遞到她手上，一次比一次大（紅蘋果→大泰迪熊→停一拍他舉著腳踏車閉眼轉頭不看，她叮一下愛心打不到、湊近再叮，他睜眼就被打中投降）；回馬槍是第四次反過來：哥哥學她合十眨眼「叮」想要回蘋果，她看了一秒「啊嗚」一口吃掉，哥哥嚇得抱回泰迪熊和腳踏車逃走'] },
  duration: 15,
  // 晴天的草地：白兔、哥哥的天藍外套、紅蘋果在淡粉黃天空上都看得清楚
  bg: { top: '#FFEFD8', bottom: '#FFFBF2', floor: '#C6E6A6', scenery: 'hills' },
  actors: [
    { id: 'teddy', emoji: '🧸', x: OFF, y: TEDDY_HOLD.y, size: TS },
    { id: 'bike', emoji: '🚲', x: OFF, y: OVER_Y, size: KS },
    { id: 'bro', emoji: 'prop:bro', x: BR, y: RY, size: RS },
    { id: 'bunny', emoji: 'hero:bunny/idle', x: BX, y: BY, size: SB, flip: true },
    { id: 'apple', emoji: '🍎', x: APPLE_HOLD.x, y: APPLE_HOLD.y, size: AS },
  ],
  moves: [
    // 開場：哥哥得意地拋一下蘋果，她抬頭看
    { at: 0.1, dur: 0.3, actor: 'apple', do: 'hop', amount: 5 },
    { at: 0.1, dur: 0.25, actor: 'bro', do: 'hop', amount: 1.5 },
    { at: 0.15, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2 },
    ...g.moves.filter((m) => m.at < ASIDE),
    // 國字放大到中間：她（拿著蘋果）讓到左邊，哥哥抓著頭退到右邊
    { at: ASIDE, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: 27, y: BY } },
    { at: ASIDE, dur: 0.25, actor: 'apple', do: 'moveTo', to: inHand(27) },
    { at: ASIDE, dur: 0.35, actor: 'bro', do: 'moveTo', to: { x: 138, y: RY } },
    { at: ASIDE + 0.2, dur: 0.3, actor: 'bro', do: 'tilt', amount: 0 },
    // 語詞那一刻：她走回正中間跳起來，哥哥在旁邊抓頭——妹妹
    { at: PARK + 0.2, dur: 0.35, actor: 'bunny', do: 'moveTo', to: { x: BX, y: BY } },
    { at: PARK + 0.2, dur: 0.35, actor: 'apple', do: 'moveTo', to: inHand(BX) },
    { at: PARK, dur: 0.45, actor: 'bro', do: 'moveTo', to: { x: BR + 4, y: RY } },
    { at: WORD - 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: WORD - 0.05, dur: 0.35, actor: 'bunny', do: 'hop', amount: 5 },
    { at: WORD - 0.05, dur: 0.35, actor: 'apple', do: 'hop', amount: 5 },
    // 回馬槍：哥哥湊過來、彎腰，學她合十眨眼「叮」
    { at: X4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: X4, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    { at: X4, dur: 0.25, actor: 'bro', do: 'moveTo', to: { x: BR - 6, y: RY }, ease: 'out' },
    { at: P4 - 0.15, dur: 0.3, actor: 'bro', do: 'squash', amount: 0.12 },
    { at: P4 - 0.1, dur: 0.3, actor: 'bro', do: 'tilt', amount: 8 },
    { at: P4, dur: 0.2, actor: 'bro', do: 'hop', amount: 1.5 },
    // 她看了他一秒（面無表情）……「啊嗚」一口吃掉
    { at: EAT - 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/eat' },
    { at: EAT, dur: 0.14, actor: 'apple', do: 'moveTo', to: { x: BX + 4, y: BY - 3 }, ease: 'in' },
    { at: EAT + 0.1, dur: 0.06, actor: 'apple', do: 'vanish' },
    { at: EAT + 0.12, dur: 0.25, actor: 'bunny', do: 'squash', amount: 0.15 },
    // 哥哥嚇得跳起來
    { at: EAT + 0.18, actor: 'bro', do: 'swap', emoji: 'prop:bro-shock' },
    { at: EAT + 0.18, dur: 0.01, actor: 'bro', do: 'tilt', amount: 0 },
    { at: EAT + 0.18, dur: 0.35, actor: 'bro', do: 'hop', amount: 10 },
    { at: EAT + 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/giggle' },
    // 趕快把泰迪熊和腳踏車搶回來，抱著逃出左邊
    { at: RUN, actor: 'bro', do: 'swap', emoji: 'prop:bro-run' },
    { at: RUN, dur: 0.25, actor: 'bro', do: 'moveTo', to: { x: 26, y: RY }, ease: 'in' },
    { at: RUN + 0.25, dur: 0.25, actor: 'bro', do: 'moveTo', to: { x: -50, y: RY }, ease: 'linear' },
    { at: RUN + 0.21, dur: 0.1, actor: 'teddy', do: 'moveTo', to: { x: 22, y: TY - 5 } },
    { at: RUN + 0.21, dur: 0.1, actor: 'bike', do: 'moveTo', to: { x: 26, y: KY - 10 } },
    { at: RUN + 0.31, dur: 0.25, actor: 'teddy', do: 'moveTo', to: { x: -54, y: TY - 5 }, ease: 'linear' },
    { at: RUN + 0.31, dur: 0.25, actor: 'bike', do: 'moveTo', to: { x: -50, y: KY - 10 }, ease: 'linear' },
    // 問他：她跳到右前方、轉向國字、放大
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: ASK, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: AX, y: BY + 3 }, arc: 6, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: Q + 1.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: Q + 1.5, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: Q + 2.0, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ANSWER + 0.22, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.22, dur: 0.18, actor: 'bunny', do: 'moveTo', to: { x: 205, y: BY + 3 }, ease: 'in' },
  ],
  builds: [
    // 女從蘋果上、未的兩橫從泰迪熊上、未的豎撇捺從腳踏車上飛出來（交到她手上的那一刻）
    { at: L1 - 0.05, dur: 0.45, strokes: [0, 1, 2], from: 'apple', color: partColor('女') },
    { at: L2 - 0.05, dur: 0.45, strokes: [3, 4], from: 'teddy', color: partColor('未') },
    { at: L3 - 0.05, dur: 0.45, strokes: [5, 6, 7], from: 'bike', color: partColor('未') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bunny'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 語詞那一刻：好可愛的妹妹
    { at: WORD, kind: 'burst', x: BX + 2, y: 40, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
    // 哥哥學她：同一顆 ✨，在他眼睛左邊（她那邊）
    { at: P4, kind: 'pop', x: BR - 24, y: 30, emoji: '✨', dur: 0.55, scale: 2.4 },
    { at: P4 + 0.02, kind: 'burst', x: BR - 6, y: 34, emoji: '✨', n: 4, dur: 0.45, scale: 1.0 },
    { at: P4 - 0.1, kind: 'pop', x: BR - 18, y: 66, emoji: '🙏', dur: 0.6, scale: 1.4 },
    // 啊嗚！💥 在她頭的右上，不蓋臉
    { at: EAT + 0.12, kind: 'burst', x: BX + 16, y: 36, n: 1, dur: 0.35, scale: 1.6 },
    { at: EAT + 0.2, kind: 'pop', x: BR + 14, y: 22, emoji: '❗', dur: 0.45, scale: 1.8 },
    { at: RUN, kind: 'sweat', actor: 'bro', dx: 10, dur: 0.4 },
  ],
  camera: [
    // 鏡頭平常固定在全景（不讓自動取景往前預看），只有「叮」那一下推近她（plea 裡寫）
    { at: 0.05, dur: 0.2, do: 'zoom', amount: 1.01, to: WIDE },
    ...g.camera,
    { at: EAT + 0.12, dur: 0.4, do: 'punch', amount: 0.1, to: { x: BX + 10, y: 50 } },
    { at: EAT + 0.18, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...g.cues,
    { at: G1 + 0.05, say: '妹' },
    { at: HOME + 0.1, say: '妹' },
    { at: WORD, say: '妹妹' },
    { at: P4, sfx: 'clink' },
    { at: EAT, sfx: 'gulp' },
    { at: EAT + 0.18, sfx: 'slide' },
    { at: RUN, sfx: 'whoosh' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '妹' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
