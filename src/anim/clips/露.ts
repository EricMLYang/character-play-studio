import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 露（v2）：清晨，一片大大的荷葉上坐著一顆圓滾滾、亮晶晶的露珠（露＝早上葉子上一顆一顆的小水珠）。
// 個子小小的忍者小老鼠站在葉尖下面——露珠「咕溜」順著葉子滑到葉尖，抖一下，「啪」地滴在他頭上，一顆比一顆大：
// 小小一滴，他縮成一團發抖（雨從濺起來的水花飛出來）→ 跟他的頭一樣大，淋得他打一個大噴嚏、跳起來（足從他的腳飛出來）→
// 先停一拍：一顆超大的露珠滑到葉尖停住、越脹越大，葉子被壓得彎下來，他抬頭傻眼、蹲下抱頭——「啪嘩！」整顆砸下來，
// 他被壓扁、被沖到旁邊坐在地上（各從水花裡飛出來）。字拼好放大時，葉子先讓開。
// 語詞那一刻：葉子回來，葉子正中間又冒出一顆大露珠，他指著它：「露珠」。
// 回馬槍（第四次）：他乾脆張大嘴巴等著喝——露珠滑下來、一邊掉一邊變大，「咕嘟」整顆罩住他，他被關在大水球裡鼓著臉憋氣、跟著晃，
// 「啵！」水球破掉，他濕答答地跌坐。
// 最後畫面暗下來只剩「露」，小老鼠問「這是什麼字？」，手放耳邊等他回答，再指著字說「露！」，然後退場只留字。
// 刻意不跟「雨」「雲」（下雨）、「象」「雲」（撐荷葉當傘）、「海」「湖」（浪、水柱淋人）撞：這支只演「葉子上的露珠滑下來滴在頭上」。
// 露、露、露珠、這是什麼字？、露

// ---- 站位 ----
/** 大荷葉（prop:lotus-leaf，size 76）：腳底壓低一點（81），葉面才不會頂到畫面上緣 */
const LS = 76
const LX = 112
const LFEET = 81
const LY = LFEET - 0.42 * LS
/** 葉面正中間（葉脈的中心）、葉尖（左下那一片的邊）：露珠的「腳底」放在這裡 */
const TOP: Vec = { x: LX, y: 31.5 }
const TIP: Vec = { x: LX - 29, y: 36 }
/** 露珠（💧）的底子 size 寫最大的那顆（回馬槍罩住他的那顆），其他用 scaleTo 縮 */
const DS = 44
const dy = (feet: number) => feet - 0.42 * DS
/** 小老鼠（size 34，圖朝左、翻過來朝右看葉子）站在葉尖正下方 */
const MS = 34
const MX = LX - 27
const MY = 77 - 0.42 * MS
/** 他的頭頂（露珠滴下來打到的地方） */
const HEAD = 46
/** 第三次被沖到左邊坐著（國字回中央放大時讓到左邊） */
const XW = 16
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 30, y: 22 }
const PARK_K = 0.5

/** 四顆露珠的大小（底子 DS 的倍率）：小小一滴、跟頭一樣大、超大（滑到葉尖再脹大）、語詞那顆、回馬槍掉下來再變大 */
const K1 = 0.32, K2 = 0.5, K3A = 0.5, K3B = 0.78, KW = 0.62, K4 = 1

// ---- 時間表 ----
/** 每一次：露珠從葉面正中間滑到葉尖（SLIDE）、在葉尖抖一下（HANG）、掉下來（FALL） */
const SLIDE = 0.45, HANG = 0.22, FALL = 0.18
const S1 = 1.0
const H1 = S1 + SLIDE + HANG + FALL
const P2 = H1 + 0.55
const S2 = P2 + 0.25
const H2 = S2 + SLIDE + HANG + FALL
/** 第三次：先停一拍——滑到葉尖停住、越脹越大 */
const P3 = H2 + 0.75
const S3 = P3 + 0.2
const SWELL = S3 + SLIDE
const SWELL_D = 0.7
const H3 = SWELL + SWELL_D + 0.08 + FALL
/** 被沖到左邊 */
const WASH = H3 + 0.4
/** 字框填滿、國字到正中央（葉子先往右讓開） */
const BUILD3 = H3 + 0.1
const HOME = BUILD3 + 0.62
const PARK = HOME + 0.75
/** 語詞：葉子回來、新的一顆大露珠 */
const PW = PARK + 0.6
const WORD = PW + 0.15
/** 回馬槍：張大嘴等著喝 */
const S4 = WORD + 0.75
const F4 = S4 + SLIDE + HANG
const H4 = F4 + 0.26
const BURST = H4 + 0.62
/** 葉子退場、問他 */
const ASK = BURST + 0.45
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 0.974 + 1.55
const AX = 30

/**
 * 露珠滑下來滴在頭上（同一個動作、同一個音效）：在葉面正中間「啵」地冒出來（k 是大小）→ 「咕溜」滑到葉尖（葉子跟著往下彎一點）
 * → 在葉尖拉長抖一下 → 掉下來「啪」在他頭上：💧 水花＋鏡頭推近＋震，一次比一次大。pop 之後才 scaleTo（pop 會把大小重設成 1）。
 * popAt 是冒出來的時間；第三次（swell）滑到葉尖先停住脹大，再掉。
 */
function drip(popAt: number, slideAt: number, hit: number, k: number, n: number, swell?: { at: number; to: number }) {
  const moves: Move[] = [
    { at: popAt - 0.05, actor: 'drop', do: 'moveTo', to: { x: TOP.x, y: dy(TOP.y) }, dur: 0.01 },
    { at: popAt, actor: 'drop', do: 'pop', dur: 0.3 },
    { at: popAt + 0.01, actor: 'drop', do: 'scaleTo', amount: k, dur: 0.01 },
    // 咕溜：越滑越快；葉子被壓得往下彎一點
    { at: slideAt, actor: 'drop', do: 'moveTo', to: { x: TIP.x, y: dy(TIP.y) }, dur: SLIDE, ease: 'in' },
    { at: slideAt, actor: 'leaf', do: 'tilt', amount: -2 - n, dur: SLIDE + HANG },
  ]
  const fall = hit - FALL
  if (swell) {
    moves.push(
      { at: swell.at, actor: 'drop', do: 'scaleTo', amount: swell.to / k, dur: SWELL_D, ease: 'inOut' },
      { at: swell.at, actor: 'drop', do: 'shake', amount: 1, dur: SWELL_D },
      { at: swell.at, actor: 'leaf', do: 'rotateTo', amount: -7, dur: SWELL_D },
      // 打下去那一刻葉子「彈」回來
      { at: hit, actor: 'leaf', do: 'rotateTo', amount: 7, dur: 0.5, ease: 'elastic' },
    )
  }
  moves.push(
    // 在葉尖拉長、抖一下（要掉了）
    { at: fall - HANG + 0.02, actor: 'drop', do: 'squash', amount: -0.22, dur: HANG },
    { at: fall, actor: 'drop', do: 'moveTo', to: { x: MX, y: dy(HEAD + 4 + 8 * n) }, dur: FALL, ease: 'in' },
    { at: hit, actor: 'drop', do: 'vanish', dur: 0.06 },
    { at: hit, actor: 'mouse', do: 'squash', amount: 0.25 + 0.12 * n, dur: 0.3 },
  )
  const fx: Fx[] = [
    // 剛冒出來亮一下
    { at: popAt + 0.15, kind: 'burst', x: TOP.x, y: TOP.y - 4 - 9 * k, emoji: '✨', n: 4, dur: 0.45, scale: 0.8 + 0.15 * n },
    // 啪：水花在他頭上同一個位置，一次比一次大
    { at: hit, kind: 'burst', x: MX, y: HEAD - 2, emoji: '💧', n: 6 + 2 * n, dur: 0.5, scale: 1.2 + 0.45 * n },
    { at: hit, kind: 'burst', x: MX, y: HEAD - 4, n: 1, dur: 0.3, scale: 0.9 + 0.3 * n },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * n, to: { x: MX, y: 50 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.7 + 0.45 * n },
  ]
  // 同一個音效（咕溜＋啪），一次比一次多疊一個
  const cues: Cue[] = [{ at: slideAt, sfx: 'slide' }, { at: hit, sfx: 'splash' }]
  if (n >= 1) cues.push({ at: hit + 0.04, sfx: 'plop' })
  if (n >= 2) cues.push({ at: hit + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

const d1 = drip(0.25, S1, H1, K1, 0)
const d2 = drip(P2, S2, H2, K2, 1)
const d3 = drip(P3, S3, H3, K3A, 2, { at: SWELL, to: K3B })

const clip: Clip = {
  format: 2,
  char: '露',
  meta: { theme: '清晨荷葉上的露珠', cast: '小老鼠＋大荷葉＋露珠', gags: ['荷葉上的露珠每次咕溜滑到葉尖、啪地滴在站在下面的小老鼠頭上，一顆比一顆大（發抖→打噴嚏→超大顆把他壓扁沖走）；回馬槍是他張大嘴等著喝，露珠越掉越大把他整個罩在水球裡'] },
  duration: 15,
  // 清晨：淡淡的粉橘天空
  bg: { top: '#FFE6D5', bottom: '#F4FBFF', floor: '#A8DB8C', scenery: 'hills' },
  actors: [
    { id: 'leaf', emoji: 'prop:lotus-leaf', x: LX, y: LY, size: LS },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: MX, y: MY, size: MS, hidden: true, flip: true },
    // 露珠畫在小老鼠上面（回馬槍把他罩在裡面）
    { id: 'drop', emoji: '💧', x: TOP.x, y: dy(TOP.y), size: DS, hidden: true, float: true },
  ],
  moves: [
    // 小老鼠走進來，站在葉尖下面；抬頭指著葉子上的露珠
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -20, y: MY }, dur: 0.55, ease: 'out' },
    { at: 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    ...d1.moves,
    // 第 1 次：小小一滴，冷得縮成一團發抖
    { at: H1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/cold' },
    { at: H1 + 0.1, actor: 'mouse', do: 'shake', amount: 1.6, dur: 0.5 },
    { at: H1 + 0.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    ...d2.moves,
    // 第 2 次：跟頭一樣大，淋濕傻眼——「哈啾！」打一個大噴嚏、跳起來
    { at: H2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: H2 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneeze' },
    { at: H2 + 0.4, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    // 第 3 次前停一拍：超大顆滑到葉尖停住、越脹越大；他抬頭傻眼，蹲下抱頭
    { at: P3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    ...d3.moves,
    { at: SWELL + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: SWELL + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/duck' },
    { at: SWELL + 0.45, actor: 'mouse', do: 'shake', amount: 0.8, dur: 0.35 },
    // 啪嘩！壓扁，被沖到左邊坐在地上
    { at: H3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
    { at: WASH, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    { at: WASH, actor: 'mouse', do: 'moveTo', to: { x: XW, y: MY }, dur: 0.4, ease: 'out' },
    // 國字回中央放大：葉子先往右讓開
    { at: HOME - 0.35, actor: 'leaf', do: 'moveTo', to: { x: 200, y: LY }, dur: 0.35, ease: 'in' },
    // 語詞那一刻：葉子回來，正中間冒出一顆大露珠，他走回來指著它
    { at: PARK + 0.3, actor: 'leaf', do: 'moveTo', to: { x: LX, y: LY }, dur: 0.35, ease: 'out' },
    { at: PARK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: PARK + 0.05, actor: 'mouse', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.45 },
    { at: PW - 0.05, actor: 'drop', do: 'moveTo', to: { x: TOP.x, y: dy(TOP.y) }, dur: 0.01 },
    { at: PW, actor: 'drop', do: 'pop', dur: 0.35 },
    { at: PW + 0.01, actor: 'drop', do: 'scaleTo', amount: KW, dur: 0.01 },
    { at: PW + 0.4, actor: 'drop', do: 'flash', dur: 0.5 },
    { at: WORD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    // 回馬槍：流口水——張大嘴等著喝
    { at: WORD + 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    { at: S4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
    { at: S4, actor: 'drop', do: 'moveTo', to: { x: TIP.x, y: dy(TIP.y) }, dur: SLIDE, ease: 'in' },
    { at: S4, actor: 'leaf', do: 'tilt', amount: -6, dur: SLIDE + HANG },
    { at: F4 - HANG + 0.02, actor: 'drop', do: 'squash', amount: -0.22, dur: HANG },
    // 一邊掉一邊變大，整顆罩住他（腳底落到地上）
    { at: F4, actor: 'drop', do: 'moveTo', to: { x: MX, y: dy(80) }, dur: H4 - F4, ease: 'in' },
    { at: F4, actor: 'drop', do: 'scaleTo', amount: K4 / KW, dur: H4 - F4, ease: 'out' },
    { at: H4, actor: 'drop', do: 'tint', filter: 'opacity(0.62)' },
    { at: H4, actor: 'drop', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/blow' },
    // 被關在水球裡，跟著晃
    { at: H4 + 0.25, actor: 'drop', do: 'hop', amount: 3, dur: 0.4 },
    { at: H4 + 0.25, actor: 'mouse', do: 'hop', amount: 3, dur: 0.4 },
    { at: H4 + 0.3, actor: 'drop', do: 'squash', amount: -0.12, dur: 0.35 },
    // 啵！破掉，濕答答跌坐
    { at: BURST, actor: 'drop', do: 'vanish', dur: 0.08 },
    { at: BURST, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    { at: BURST, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.3 },
    // 葉子退場（問他之前）
    { at: BURST + 0.02, actor: 'leaf', do: 'moveTo', to: { x: 200, y: LY }, dur: 0.3, ease: 'in' },
    // 問他：站起來走到左前方、變大，轉向觀眾
    { at: ASK - 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: ASK - 0.15, actor: 'mouse', do: 'moveTo', to: { x: AX, y: MY + 3 }, dur: 0.4 },
    { at: ASK - 0.15, actor: 'mouse', do: 'scaleTo', amount: 1.35, dur: 0.4 },
    { at: ASK_SAY + 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: ASK_SAY + 1.0, actor: 'mouse', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: ASK_SAY + 1.6, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.1, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'mouse', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, actor: 'mouse', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: ANSWER + 0.27, actor: 'mouse', do: 'moveTo', to: { x: -45, y: MY + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 1 次：雨從濺起來的水花飛出來
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: { x: MX, y: HEAD - 2 }, color: partColor('雨') },
    // 第 2 次：打噴嚏跳起來，足從他的腳飛出來
    { at: H2 + 0.5, dur: 0.6, strokes: [8, 9, 10, 11, 12, 13, 14], from: { x: MX, y: 72 }, color: partColor('足') },
    // 第 3 次：超大的水花裡飛出各
    { at: BUILD3, dur: 0.5, strokes: [15, 16, 17, 18, 19, 20], from: { x: MX, y: 60 }, color: partColor('各') },
  ],
  glyph: [
    // 空字框一開始就讓到左上（素色的天空），右邊留給大荷葉
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['mouse'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: ANSWER + 0.65, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...d1.fx,
    { at: H1 + 0.2, kind: 'sweat', actor: 'mouse' },
    ...d2.fx,
    { at: H2 + 0.45, kind: 'burst', x: MX + 12, y: HEAD + 4, emoji: '💦', n: 5, dur: 0.45 },
    ...d3.fx,
    // 第三次前停一拍：抬頭看到了
    { at: SWELL + 0.05, kind: 'pop', actor: 'mouse', emoji: '❗', dx: -10, dur: 0.5, scale: 1.4 },
    { at: SWELL + 0.5, kind: 'sweat', actor: 'mouse' },
    { at: H3, kind: 'burst', x: MX, y: 66, emoji: '💧', n: 10, dur: 0.6, scale: 1.8 },
    { at: WASH + 0.4, kind: 'dizzy', actor: 'mouse', dur: 0.5 },
    // 語詞：大露珠亮晶晶
    { at: PW + 0.25, kind: 'burst', x: TOP.x, y: TOP.y - 14, emoji: '✨', n: 6, dur: 0.6, scale: 1.3 },
    // 回馬槍
    { at: WORD + 0.65, kind: 'pop', actor: 'mouse', emoji: '😋', dx: -12, dur: 0.45, scale: 1.2 },
    { at: H4, kind: 'burst', x: MX, y: 52, emoji: '💧', n: 8, dur: 0.45, scale: 1.6 },
    { at: BURST, kind: 'burst', x: MX, y: 58, emoji: '💧', n: 14, dur: 0.6, scale: 2.4 },
    { at: BURST, kind: 'burst', x: MX, y: 58, n: 1, dur: 0.3, scale: 1.6 },
    { at: BURST + 0.25, kind: 'sweat', actor: 'mouse' },
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫全景（稍微推一點點）：自動取景推近會把大荷葉切掉
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    { at: PARK, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...d1.camera,
    ...d2.camera,
    ...d3.camera,
    { at: H4, dur: 0.45, do: 'punch', amount: 0.15, to: { x: MX, y: 50 } },
    { at: H4, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: BURST, dur: 0.35, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '露' },
    ...d1.cues,
    ...d2.cues,
    { at: H2 + 0.4, sfx: 'achoo' },
    { at: P3, sfx: 'boing' },
    { at: SWELL, sfx: 'bubble' },
    ...d3.cues,
    { at: HOME + 0.25, say: '露' },
    { at: PW, sfx: 'bubble' },
    { at: WORD, say: '露珠' },
    { at: S4, sfx: 'slide' },
    { at: H4, sfx: 'gulp' },
    { at: H4 + 0.25, sfx: 'bubble' },
    { at: BURST, sfx: 'poof' },
    { at: BURST + 0.04, sfx: 'splash' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '露' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
