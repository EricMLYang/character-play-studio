import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 膝（v2）：豬探長當醫生，幫站在紙箱上的楊捷睿檢查膝蓋。膝蓋上先閃兩下大紅圈、旁邊一隻手指指著（「這裡是膝蓋」），
// 豬探長站在旁邊伸長手、把小木槌舉高高——「叩」輕輕落在紅圈正中，膝蓋一閃，楊捷睿的腳就「咻」地自己踢出去，
// 把東西踢飛，他自己都嚇一跳（不是我踢的！）。一次比一次大：
// 箱子上的小足球（月從膝蓋彈出來）→ 滾上來的大西瓜（桼的上半）→ 先停一拍：豬探長看看左邊（東西都往那邊飛），得意地放心敲——
// 這次換另一隻腳往右踢，正中豬探長，連人帶槌子飛出畫面（桼的下半）。
// 語詞那一刻楊捷睿站回紙箱上、變大，彎腰看自己的膝蓋，紅圈再亮一次：「膝蓋」。
// 回馬槍（第四次）：豬探長從天上掉回來坐在紙箱上頭暈，槌子也掉下來，換楊捷睿當醫生，好奇地輕輕敲一下小恐龍的膝蓋——
// 小恐龍的大腳一踢，楊捷睿和豬探長一起往左上飛上天，整個畫面一震、國字都被震得晃一晃；小恐龍傻眼：不是我踢的！
// 最後畫面暗下來只剩「膝」，楊捷睿從天上掉下來，問「這是什麼字？」，手放耳邊等他回答，再指著字說「膝！」，然後大家退場只留字。
// 膝、膝、膝蓋、這是什麼字？、膝

// ---- 角色的量法 ----
/** 楊捷睿（被檢查的人）：大，站在紙箱上（膝蓋往畫面中間抬高），平常正面站好 */
const YS = 48
/** 站在地上時的 y */
const YY = 77 - 0.42 * YS
/**
 * 楊捷睿各姿勢膝蓋在原圖（512）裡的位置（量 public/hero/yang/*.png：短褲下緣與小腿的交界）。
 * idle 正面站好：左右兩個膝蓋；bow 彎腰看膝蓋：手撐在膝蓋上。
 */
const YANG_KNEE = {
  idle: { left: [218, 428], right: [298, 428] },
  bow: { left: [350, 405], right: [350, 405] },
} as const
const kneeOf = (pose: keyof typeof YANG_KNEE, side: 'left' | 'right', x: number, y: number, s = YS): Vec => {
  const [kx, ky] = YANG_KNEE[pose][side]
  return { x: x + (kx / 512 - 0.5) * s, y: y + (ky / 512 - 0.5) * s }
}
/** 楊捷睿伸手（reach，flip 朝右）時前面那隻手（原圖（44, 280）） */
const YANG_REACH = { x: 0.414 * YS, y: 0.047 * YS }
/** 小恐龍：比楊捷睿大一隻；idle 的前腳膝蓋（圖左邊那隻腳）在原圖（512）裡的位置 */
const RS = 47
const RY = 77 - 0.42 * RS
const REX_KNEE = [180, 400] as const

/** 豬探長（醫生）：站著伸長手（reach），前面那隻手在原圖的（70, 261） */
const PS = 40
const PY = 77 - 0.42 * PS
const PIG_REACH = { x: -0.363 * PS, y: 0.01 * PS }

/** 紙箱（台子）：寬扁一點（stretchTo），他站在箱子前緣上 */
const BOX = { x: 40, s: 27, w: 1.4 }
/** 他站在箱子上時的 y（腳底踩在箱子前緣） */
const YB = YY - 8.7
/** 箱子上面放東西的高度（東西的腳底） */
const BOX_TOP = 69

/**
 * 小木槌（🔨，3D 圖：槌頭在左上、木柄往右下；調成暖暖的木頭色）。手握的地方 G、槌頭 H（離圖中心，乘上 size）。
 * 轉 θ 度（順時針）以後，要讓 G 剛好在手上，圖的中心就在 hand − R(θ)·G。
 */
const HS = 18
const GRIP = { x: 0.28 * HS, y: 0.32 * HS }
const HEAD = { x: -0.21 * HS, y: -0.17 * HS }
const rot = (v: Vec, deg: number): Vec => {
  const r = (deg * Math.PI) / 180
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) }
}
const ang = (v: Vec) => (Math.atan2(v.y, v.x) * 180) / Math.PI
/** 握在 hand、槌頭朝 target 時要轉幾度 */
const aimAt = (hand: Vec, target: Vec) => ang({ x: target.x - hand.x, y: target.y - hand.y }) - ang({ x: HEAD.x - GRIP.x, y: HEAD.y - GRIP.y })
const hammerCenter = (hand: Vec, deg: number): Vec => {
  const g = rot(GRIP, deg)
  return { x: hand.x - g.x, y: hand.y - g.y }
}
/** 槌子從手到槌頭多長 */
const HAM_LEN = Math.hypot(HEAD.x - GRIP.x, HEAD.y - GRIP.y)
/** 手比膝蓋高 dy 的時候，手要在膝蓋旁邊多遠，槌頭才剛好敲到 */
const reachX = (dy: number) => Math.sqrt(Math.max(0, HAM_LEN ** 2 - dy ** 2))
/** 槌子現在轉了幾度（rotateTo 是累加的，記著才能轉到指定的角度） */
let hamDeg = 0
const hammerTo = (at: number, dur: number, hand: Vec, deg: number, ease: Move['ease'] = 'inOut'): Move[] => {
  const d = deg - hamDeg
  hamDeg = deg
  const c = hammerCenter(hand, deg)
  return [
    { at, dur, actor: 'hammer', do: 'moveTo', to: c, ease },
    { at, dur, actor: 'hammer', do: 'rotateTo', amount: d, ease },
  ]
}
/** 槌頭朝正上方（舉高高）的角度：醫生在右邊就逆時針敲下去，在左邊就順時針 */
const raised = (hand: Vec, knee: Vec) => {
  const tap = aimAt(hand, knee)
  const d = (((aimAt(hand, { x: hand.x, y: hand.y - 10 }) - tap) % 360) + 360) % 360
  return tap + (hand.x > knee.x ? d : d - 360)
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 敲之前多久亮紅圈圈、舉槌子（預備） */
const AIM = 0.65
/** 敲下去以後多久腳踢出去（中間那一格是膝蓋的閃光） */
const KICK = 0.22
/** 踢到東西（腳伸到最遠） */
const HIT = 0.16
/** 傻眼停多久 */
const HOLD = 0.5

/**
 * 同一個笑點：膝蓋上大紅圈閃兩下、旁邊一隻手指指著（這裡是膝蓋），醫生把小木槌舉高高停住（預備）→
 *「叩」輕輕落在紅圈正中（同一個音效、鏡頭推近膝蓋）→ 膝蓋一閃 → 腳自己「咻」地踢出去（kick 姿勢＋一道橘色的弧線）→
 * 踢到東西那一格 💥＋震（一次比一次大、多疊一個音）→ 被檢查的人傻眼停 HOLD 秒。
 * who／hero 是被敲的角色與他的主角圖、size 是他的大小、knee 是膝蓋、hand 是醫生拿槌子的手、kickRight 是這次往右踢（要 flip）。
 * 被踢到的東西怎麼飛、傻眼以後怎麼收，由呼叫的人寫。
 */
function knock(at: number, k: number, o: {
  who: string; hero: string; size: number; knee: Vec; hand: Vec; kickRight: boolean; hitAt: Vec; pause?: number
}): Gag {
  const pause = o.pause ?? 0
  const tap = aimAt(o.hand, o.knee)
  const up = raised(o.hand, o.knee)
  const pre = at - AIM - pause
  const doctorRight = o.hand.x > o.knee.x
  const moves: Move[] = [
    // 預備：把小木槌舉高高、停住瞄準
    ...hammerTo(pre + 0.05, 0.22, o.hand, up, 'out'),
    // 叩！（輕輕的、很快，落在紅圈正中）
    ...hammerTo(at - 0.06, 0.06, o.hand, tap, 'in'),
    // 敲完槌子彈回舉高
    ...hammerTo(at + 0.12, 0.22, o.hand, up, 'out'),
    // 腳自己踢出去
    { at: at + KICK, actor: o.who, do: 'swap', emoji: `hero:${o.hero}/kick` },
  ]
  if (o.kickRight) moves.push({ at: at + KICK, actor: o.who, do: 'flip' })
  // 不是我踢的！傻眼停住
  moves.push({ at: at + KICK + HIT + 0.2, actor: o.who, do: 'swap', emoji: `hero:${o.hero}/surprised` })
  if (o.kickRight) moves.push({ at: at + KICK + HIT + 0.2, actor: o.who, do: 'flip' })
  const ring = (t: number, dur: number): Fx => ({ at: t, dur, kind: 'burst', x: o.knee.x, y: o.knee.y, n: 1, emoji: '⭕', scale: 1.15 })
  const fx: Fx[] = [
    // 這裡是膝蓋：大紅圈閃兩下，一直亮到敲完；手指從醫生的另一邊指著膝蓋
    ring(pre, 0.4),
    ring(pre + 0.4, AIM + pause - 0.4 + 0.3),
    { at: pre, dur: AIM + pause + 0.2, kind: 'burst', x: o.knee.x + (doctorRight ? -13 : 13), y: o.knee.y, n: 1, emoji: doctorRight ? '👉' : '👈', scale: 0.85 },
    // 叩：膝蓋一閃
    { at: at + 0.02, dur: 0.35, kind: 'burst', x: o.knee.x, y: o.knee.y, n: 1, emoji: '🌟', scale: 0.95 },
    // 腳踢出去的弧線（從屁股往前下方甩上來）
    { at: at + KICK - 0.04, dur: 0.24, kind: 'swoosh', actor: o.who, to: o.hitAt, dx: 0, dy: 0.62 * o.size, n: 0.36 * o.size,
      sweep: 120, low: true, color: '#FF8A1F', width: 3.2 },
    // 踢到東西：💥 一次比一次大
    { at: at + KICK + HIT - 0.02, dur: 0.4, kind: 'burst', x: o.hitAt.x, y: o.hitAt.y, n: 1, emoji: '💥', scale: 0.9 + 0.3 * k },
  ]
  const camera: Camera[] = [
    // 叩那一格推近膝蓋，踢到那一格震
    { at, dur: 0.6, do: 'punch', amount: 0.12 + 0.03 * k, to: { x: o.knee.x, y: o.knee.y - 6 } },
    { at: at + KICK + HIT - 0.02, dur: 0.35, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  const cues: Cue[] = [
    { at, sfx: 'tap' },
    { at: at + KICK, sfx: 'whoosh' },
    { at: at + KICK + HIT - 0.02, sfx: 'bonk' },
  ]
  if (k >= 1) cues.push({ at: at + KICK + HIT + 0.02, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + KICK + HIT + 0.06, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

// ---- 場景 ----
/** 字框在上方正中：背後是乾淨的牆（窗戶在左上、掛畫和書架在右上），東西往左下飛、豬探長往右邊低低地飛，都不經過字框 */
const FRAME = { x: 86, y: 16 }
const FRAME_K = 0.42
/** 楊捷睿站在紙箱上的位置與膝蓋（右邊那個，靠豬探長） */
const YX = 46
const KNEE = kneeOf('idle', 'right', YX, YB)
/** 豬探長站在他右邊、中間留空隙，伸長手剛好用槌子搆到膝蓋 */
const PX = KNEE.x + reachX(KNEE.y - (PY + PIG_REACH.y)) - PIG_REACH.x
const pigHand: Vec = { x: PX + PIG_REACH.x, y: PY + PIG_REACH.y }
/** 踢出去的腳尖（kick 姿勢腳尖在原圖的（75, 290）） */
const footR: Vec = { x: YX + 0.354 * YS, y: YB + 0.066 * YS }
/** 小足球、大西瓜放在紙箱左半邊、他踢出去的那隻腳前面 */
const BALL = { s: 9, x: 28 }
const MELON = { s: 20, x: 30 }
const onBox = (s: number) => BOX_TOP - 0.42 * s
/**
 * 被踢的東西（thing）本來的大小就是小恐龍（size 47，引擎不會自動放大），開場先縮成足球；縮放以腳底為準，
 * 所以放在箱子上的 y 一律照 47 算。西瓜飛出畫面消失、再出場時回到原本的大小，剛好就是走進來的小恐龍。
 */
const THING_ON_BOX = BOX_TOP - 0.42 * RS

// ---- 時間表 ----
const T1 = 1.6
const T2 = T1 + 1.85
/** 第三次前停一拍：豬探長看看左邊、得意地放心了，才伸手敲 */
const PAUSE3 = 0.5
const T3 = T2 + 1.75 + PAUSE3
/** 國字拼好（最後一組筆畫落定）→ 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const B = (t: number) => t + KICK + HIT - 0.02
const HOME = B(T3) + 0.55
const PARK = HOME + 0.85
const WORD = PARK + 0.55
/** 語詞那一刻：站回紙箱上、放大 */
const WK = 1.2
/** 回馬槍：豬探長坐在紙箱上（最左），楊捷睿站中間、flip 朝右伸手，小恐龍在最右邊 */
const YX4 = 76
const yangHand4: Vec = { x: YX4 + YANG_REACH.x, y: YY + YANG_REACH.y }
const REX_KY = RY + (REX_KNEE[1] / 512 - 0.5) * RS
const RX = yangHand4.x + reachX(REX_KY - yangHand4.y) - (REX_KNEE[0] / 512 - 0.5) * RS
const REX_K: Vec = { x: RX + (REX_KNEE[0] / 512 - 0.5) * RS, y: REX_KY }
/** 豬探長坐在紙箱上（dizzy 坐姿的腳底踩在箱子上） */
const PIG_SIT = { x: BOX.x - 2, y: BOX_TOP + 1 - 0.457 * PS }
const T4 = WORD + 1.85
const ASK = B(T4) + 0.75
const AX = 36
const ASK_S = 1.15
const ANSWER = ASK + 2.55
const END = ANSWER + 1.37

// 槌子的動作要照時間順序算（rotateTo 是累加的，hamDeg 記著現在的角度）
const HAM0 = raised(pigHand, KNEE)
const ham0 = hammerTo(0, 0.01, pigHand, HAM0)
const g1 = knock(T1, 0, { who: 'yang', hero: 'yang', size: YS, knee: KNEE, hand: pigHand, kickRight: false, hitAt: { x: BALL.x, y: onBox(BALL.s) }, })
const g2 = knock(T2, 1, { who: 'yang', hero: 'yang', size: YS, knee: KNEE, hand: pigHand, kickRight: false, hitAt: { x: MELON.x, y: onBox(MELON.s) } })
const g3 = knock(T3, 2, { who: 'yang', hero: 'yang', size: YS, knee: KNEE, hand: pigHand, kickRight: true, hitAt: { x: footR.x + 3, y: footR.y + 2 }, pause: PAUSE3 })
/** 豬探長被踢飛時槌子跟著轉 540 度 */
const FLY_SPIN = 540
hamDeg += FLY_SPIN
/** 槌子從天上轉著掉回來、落在楊捷睿手上，剛好是舉高高的角度 */
const drop4 = hammerTo(WORD + 1.3, 0.25, yangHand4, raised(yangHand4, REX_K) + 360, 'in')
const g4 = knock(T4, 3, { who: 'thing', hero: 'rex', size: RS, knee: REX_K, hand: yangHand4, kickRight: false, hitAt: { x: YX4 + 9, y: YY + 4 } })
/** 被踢的東西（thing）一路轉了幾度：變成小恐龍前要轉回正 */
const THING_SPIN = -540 + 840 - 720

const clip: Clip = {
  format: 2,
  char: '膝',
  meta: { theme: '豬探長當醫生用小木槌敲膝蓋，腳自己踢出去', cast: '楊捷睿＋豬探長＋小恐龍＋小木槌＋紙箱＋足球／大西瓜', gags: ['豬探長當醫生，膝蓋亮大紅圈、舉起小木槌「叩」輕輕一敲，楊捷睿的腳就自己「咻」地踢出去，他自己都嚇一跳：踢飛小足球→踢飛大西瓜→停一拍，豬探長以為東西都往左邊飛、放心地敲，這次另一隻腳往右踢，連人帶槌子踢飛；回馬槍是換楊捷睿拿槌子好奇地敲小恐龍的膝蓋，大腳一踢，他和豬探長一起飛上天'] },
  duration: END,
  // 診所的室內：淡薄荷綠的牆、木地板
  bg: { top: '#E3F4EE', bottom: '#F7FCFA', floor: '#E8D2B0', scenery: 'room' },
  actors: [
    { id: 'box', emoji: 'prop:box', x: BOX.x, y: 77 - 0.42 * BOX.s, size: BOX.s },
    { id: 'yang', emoji: 'hero:yang/walk', x: 18, y: YY, size: YS, hidden: true },
    // 被踢飛的東西：小足球 → 大西瓜；飛出畫面以後，同一個角色換成走進來的小恐龍（v2 角色＋道具最多 5 個，見 THING_ON_BOX）
    { id: 'thing', emoji: '⚽', x: BALL.x, y: THING_ON_BOX, size: RS, pivot: 'center', float: true, hidden: true },
    { id: 'pig', emoji: 'hero:pig/walk', x: PX, y: PY, size: PS, hidden: true },
    { id: 'hammer', emoji: '🔨', x: 0, y: 0, size: HS, hidden: true, float: true, pivot: 'center', tint: 'sepia(0.55) saturate(1.8) brightness(1.05)' },
  ],
  moves: [
    { at: 0, dur: 0.01, actor: 'box', do: 'stretchTo', amount: BOX.w },
    { at: 0.005, dur: 0.001, actor: 'thing', do: 'enter', from: { x: BALL.x, y: THING_ON_BOX } },
    { at: 0.007, dur: 0.001, actor: 'thing', do: 'scaleTo', amount: BALL.s / RS },
    // 開場：楊捷睿從左邊走進來、跳上紙箱站好；豬探長拿著小木槌從右邊走過來
    { at: 0.02, dur: 0.4, actor: 'yang', do: 'enter', from: { x: -25, y: YY }, ease: 'out' },
    { at: 0.42, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: YX, y: YB }, arc: 7, ease: 'out' },
    { at: 0.72, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 0.1, dur: 0.5, actor: 'pig', do: 'enter', from: { x: 190, y: PY }, ease: 'out' },
    ...ham0,
    { at: 0.1, dur: 0.5, actor: 'hammer', do: 'enter', from: { x: 190 - PX + hammerCenter(pigHand, HAM0).x, y: hammerCenter(pigHand, HAM0).y }, ease: 'out' },
    { at: 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    // 第 1 次：小足球
    ...g1.moves,
    { at: B(T1), dur: 0.5, actor: 'thing', do: 'moveTo', to: { x: -15, y: 12 }, arc: 10, ease: 'out' },
    { at: B(T1), dur: 0.5, actor: 'thing', do: 'rotateTo', amount: -540, ease: 'out' },
    { at: T1 + KICK + HIT + 0.2 + HOLD, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 大西瓜從左邊滾過來、彈上紙箱
    { at: B(T1) + 0.55, actor: 'thing', do: 'swap', emoji: 'prop:watermelon' },
    { at: B(T1) + 0.55, dur: 0.01, actor: 'thing', do: 'scaleTo', amount: MELON.s / BALL.s },
    { at: B(T1) + 0.56, dur: 0.01, actor: 'thing', do: 'moveTo', to: { x: -15, y: THING_ON_BOX } },
    { at: B(T1) + 0.6, dur: 0.5, actor: 'thing', do: 'moveTo', to: { x: MELON.x, y: THING_ON_BOX }, arc: 6, ease: 'out' },
    { at: B(T1) + 0.6, dur: 0.5, actor: 'thing', do: 'rotateTo', amount: 840, ease: 'out' },
    // 第 2 次：大西瓜
    ...g2.moves,
    { at: B(T2), dur: 0.6, actor: 'thing', do: 'moveTo', to: { x: -25, y: -5 }, arc: 14, ease: 'out' },
    { at: B(T2), dur: 0.6, actor: 'thing', do: 'rotateTo', amount: -720, ease: 'out' },
    { at: B(T2) + 0.62, dur: 0.01, actor: 'thing', do: 'vanish' },
    { at: T2 + KICK + HIT + 0.2 + HOLD, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 3 次前停一拍：豬探長看看左邊（東西都往那邊飛）……得意地放心了
    { at: T3 - AIM - PAUSE3 - 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: T3 - AIM - PAUSE3 - 0.45, dur: 0.35, actor: 'pig', do: 'tilt', amount: -6 },
    { at: T3 - AIM - PAUSE3 + 0.02, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    // 楊捷睿右邊的腳先抖一下（小孩猜得到要來了）
    { at: T3 - 0.45, dur: 0.25, actor: 'yang', do: 'shake', amount: 0.8 },
    ...g3.moves,
    // 這次往右踢：豬探長連人帶槌子低低地飛出畫面右邊
    { at: B(T3), actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: B(T3) + 0.12, dur: 0.45, actor: 'pig', do: 'moveTo', to: { x: 205, y: PY - 4 }, arc: 8, ease: 'in' },
    { at: B(T3) + 0.12, dur: 0.45, actor: 'pig', do: 'spin', times: 1, pivot: 'center' },
    { at: B(T3) + 0.12, dur: 0.45, actor: 'hammer', do: 'moveTo', to: { x: 215, y: PY - 12 }, arc: 12, ease: 'in' },
    { at: B(T3) + 0.12, dur: 0.45, actor: 'hammer', do: 'rotateTo', amount: FLY_SPIN },
    // 他自己也嚇得從箱子上跳下來（國字要放大到中間，讓出位置）
    { at: B(T3) + 0.4, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: 14, y: YY }, arc: 6, ease: 'out' },
    { at: T3 + KICK + HIT + 0.2 + HOLD + 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 語詞那一刻：跳回紙箱上、變大，彎腰看自己的膝蓋——膝蓋
    { at: PARK + 0.05, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: YX, y: YB }, arc: 7, ease: 'out' },
    { at: PARK + 0.05, dur: 0.35, actor: 'yang', do: 'scaleTo', amount: WK },
    { at: WORD - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/bow' },
    { at: WORD + 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: WORD + 0.7, dur: 0.01, actor: 'yang', do: 'scaleTo', amount: 1 / WK },
    // 回馬槍：楊捷睿跳下紙箱走到中間；豬探長從天上掉回來坐在紙箱上；小恐龍從右邊走進來；槌子掉下來，楊捷睿接住
    { at: WORD + 0.75, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: YX4, y: YY }, arc: 5, ease: 'out' },
    { at: WORD + 0.5, dur: 0.01, actor: 'thing', do: 'rotateTo', amount: -THING_SPIN },
    { at: WORD + 0.5, actor: 'thing', do: 'swap', emoji: 'hero:rex/walk' },
    { at: WORD + 0.52, dur: 0.01, actor: 'thing', do: 'moveTo', to: { x: RX, y: RY } },
    { at: WORD + 0.55, dur: 0.6, actor: 'thing', do: 'enter', from: { x: 195, y: RY }, ease: 'out' },
    { at: WORD + 1.15, actor: 'thing', do: 'swap', emoji: 'hero:rex/idle' },
    { at: WORD + 0.9, dur: 0.01, actor: 'pig', do: 'moveTo', to: { x: PIG_SIT.x, y: -40 } },
    { at: WORD + 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: WORD + 0.95, dur: 0.3, actor: 'pig', do: 'moveTo', to: PIG_SIT, ease: 'in' },
    { at: WORD + 1.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: WORD + 1.25, dur: 0.01, actor: 'hammer', do: 'moveTo', to: { x: yangHand4.x + 18, y: -20 } },
    ...drop4,
    { at: WORD + 1.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: WORD + 1.55, actor: 'yang', do: 'flip' },
    // 第 4 次：楊捷睿好奇地輕輕敲一下小恐龍的膝蓋
    ...g4.moves,
    // 大腳一踢：楊捷睿和豬探長一起往左上飛上天
    { at: B(T4), actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: B(T4), actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: B(T4) + 0.06, dur: 0.85, actor: 'yang', do: 'moveTo', to: { x: 6, y: -45 }, arc: 10, ease: 'linear' },
    { at: B(T4) + 0.06, dur: 0.85, actor: 'yang', do: 'spin', times: -2, pivot: 'center' },
    { at: B(T4) + 0.1, dur: 0.85, actor: 'pig', do: 'moveTo', to: { x: -20, y: -45 }, arc: 10, ease: 'linear' },
    { at: B(T4) + 0.1, dur: 0.85, actor: 'pig', do: 'spin', times: -2, pivot: 'center' },
    { at: B(T4) + 0.06, dur: 0.85, actor: 'hammer', do: 'moveTo', to: { x: -10, y: -40 }, ease: 'linear' },
    { at: B(T4) + 0.92, dur: 0.01, actor: 'hammer', do: 'vanish' },
    { at: B(T4) + 0.96, dur: 0.01, actor: 'pig', do: 'vanish' },
    // 問他：小恐龍走掉、紙箱收掉，楊捷睿從天上掉到左前方、放大
    { at: ASK + 0.05, actor: 'thing', do: 'swap', emoji: 'hero:rex/walk' },
    { at: ASK + 0.05, actor: 'thing', do: 'flip' },
    { at: ASK + 0.05, dur: 0.3, actor: 'thing', do: 'moveTo', to: { x: 200, y: RY }, ease: 'in' },
    { at: ASK, dur: 0.25, actor: 'box', do: 'vanish' },
    { at: ASK, dur: 0.01, actor: 'yang', do: 'moveTo', to: { x: AX, y: -45 } },
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.01, actor: 'yang', do: 'scaleTo', amount: ASK_S },
    { at: ASK + 0.05, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: AX, y: YY + 2 }, ease: 'in' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.65, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 2.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.15, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: YY + 2 }, ease: 'in' },
  ],
  builds: [
    // 每敲一次，筆畫就從被敲的膝蓋彈出來：月、桼的上半、桼的下半
    { at: B(T1), dur: 0.45, strokes: [0, 1, 2, 3], from: KNEE, color: partColor('⺼') },
    { at: B(T2), dur: 0.45, strokes: [4, 5, 6, 7, 8, 9], from: KNEE, color: partColor('桼') },
    { at: B(T3), dur: 0.45, strokes: [10, 11, 12, 13, 14], from: KNEE, color: partColor('桼') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 回馬槍那一腳：整個畫面一震，國字也被震得晃一晃
    { at: B(T4), dur: 0.5, do: 'shake' },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.85, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    { at: T1 + KICK + HIT + 0.25, kind: 'sweat', actor: 'yang', dx: 6, dy: 4 },
    ...g2.fx,
    { at: T2 + KICK + HIT + 0.25, kind: 'sweat', actor: 'yang', dx: 6, dy: 4 },
    ...g3.fx,
    // 語詞那一刻：膝蓋的紅圈再亮一次、閃一下
    { at: WORD - 0.05, dur: 0.75, kind: 'burst', ...kneeOf('bow', 'right', YX, YB, YS * WK), n: 1, emoji: '⭕', scale: 1.2 },
    { at: WORD + 0.1, dur: 0.35, kind: 'burst', ...kneeOf('bow', 'right', YX, YB, YS * WK), n: 1, emoji: '🌟', scale: 0.9 },
    { at: WORD + 1.3, dur: 0.6, kind: 'dizzy', actor: 'pig' },
    ...g4.fx,
  ],
  camera: [
    ...g1.camera, ...g2.camera, ...g3.camera, ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.95, say: '膝' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.1, say: '膝' },
    { at: WORD, say: '膝蓋' },
    { at: WORD + 1.25, sfx: 'plop' },
    ...g4.cues,
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '膝' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
