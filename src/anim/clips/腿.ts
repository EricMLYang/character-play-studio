import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 腿（v2）：小機器人的腿是伸縮管。高處有東西他搆不到，就把腿「喀、喀、喀」一節一節伸長，身體跟著升上去——
// 手一碰到東西「叮」，腿就開始發抖，越抖越大，「嘩啦」整個垮下來，一屁股坐在地上，東西再掉下來砸在他頭上。一次比一次高：
// 樹邊的蘋果（伸一點點）→ 卡在樹頂的氣球（伸到樹頂）→ 先停一拍：天上的星星，他伸到畫面最頂，往下看一眼、螢幕臉變成害怕，
// 腿還沒抖他先抖——垮下來，星星砸頭，把他撞得滾到旁邊。每垮一次，他的腿就震出一組筆畫：月（第 1 次）、艮（第 2 次）、辶（第 3 次）。
// 語詞那一刻他站在中間，腿伸長一截正在發抖：「腿軟」。回馬槍（第四次）：星星就掉在腳邊，這次不用伸了——他彎腰去撿，
// 腿卻自己「喀喀喀喀」亂伸（當機），一路把他頂到畫面外面，停在半空發抖……垮下來，地一震，星星彈起來又砸他的頭。
// 最後畫面暗下來只剩「腿」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「腿！」，然後退場只留字。
// 腿、腿、腿軟、這是什麼字？、腿

/** 小機器人：圖朝左，整支面向左邊的樹 */
const S = 36
const PR = 77 - 0.42 * S
/** 每次都站在同一個地方 */
const BX = 64
/** 伸長腿的畫法：身體只畫上面一截（切在身體下緣）往上移，腳只畫下面一截留在地上，中間接兩根伸縮管 */
const CUT = 0.77
const FOOT_CUT = 0.8
/** 身體下緣（切口）離角色中心多遠 */
const HIP = (CUT - 0.5) * S
/** 兩根管子在身體下緣與腳上緣的左右位置（原圖的兩條腿） */
const LEG_TOP = [-3.4, 2.0]
const LEG_FOOT = [-2.7, 1.7]
const FOOT_Y = PR + (FOOT_CUT - 0.5) * S + 0.6
/** 管子：鐵灰色，粗細對上原圖的腿，有一圈一圈的環節 */
const tubes = (at: number, dur: number): Fx[] => [0, 1].map((i) => (
  { at, dur, kind: 'tube', actor: 'bot', dx: LEG_TOP[i], dy: HIP, to: { x: BX + LEG_FOOT[i], y: FOOT_Y }, width: 3, n: 2.4 } as Fx
))
/** 伸長 L 的時候，兩根腿中間那一點（筆畫從這裡震出來） */
const legMid = (L: number): Vec => ({ x: BX, y: (PR - L + HIP + FOOT_Y) / 2 })
/** 坐在地上（fall／dizzy）時頭頂的高度 */
const SIT_HEAD = PR - 10

/** 高處的東西：在他左手上方（lift 的左手在 x − 9） */
const IX = BX - 9
/** 東西在 y 的時候，腿要伸多長，手才碰得到 */
const reachFor = (y: number) => PR - 13 - y

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點：抬頭（lead 姿勢）→ 身體跟腳分開，腿「喀、喀、喀」一節一節伸長（同一個音效，身體一節一節升上去）→
 * 碰到東西「叮」→（pause：在最高的地方往下看一眼、害怕，腿還沒抖他先抖）→ 腿開始發抖、越抖越大 →
 * 「嘩啦」垮下來（滑音往下）、一屁股坐在地上（鏡頭推近＋震、💥，一次多疊一個音）。
 * k 是第幾次；回傳碰到東西的時間 top、垮下來的時間 col、坐到地上的時間 land。
 */
function stretch(at: number, k: number, o: {
  L: number; n?: number; tick?: number; lead: string; leadDur?: number; top?: string; touch?: Vec; pause?: number; tremble?: number; drop?: number
}): Gag & { top: number; col: number; land: number } {
  const n = o.n ?? 3, tick = o.tick ?? 0.12, leadDur = o.leadDur ?? 0.22, tremble = o.tremble ?? 0.38, drop = o.drop ?? 0.13
  const c0 = at + leadDur
  const moves: Move[] = [
    { at, actor: 'bot', do: 'swap', emoji: `hero:bot/${o.lead}`, half: 'whole' },
    // 身體跟腳分開（看起來還是一整隻），腳留在地上
    { at: c0, actor: 'bot', do: 'swap', emoji: `hero:bot/${o.top ?? 'lift'}`, half: 'top' },
    { at: c0, dur: 0.01, actor: 'legs', do: 'enter', from: { x: BX, y: PR } },
  ]
  const cues: Cue[] = []
  const fx: Fx[] = []
  // 喀、喀、喀：一節一節往上彈
  for (let i = 0; i < n; i++) {
    const t = c0 + i * tick
    moves.push({ at: t, dur: Math.min(0.08, tick * 0.6), actor: 'bot', do: 'moveTo', to: { x: BX, y: PR - (o.L * (i + 1)) / n }, ease: 'back' })
    cues.push({ at: t, sfx: 'crack' })
  }
  const top = c0 + n * tick
  let hold = top
  if (o.touch) {
    // 叮！碰到了
    moves.push({ at: top, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' })
    fx.push({ at: top, dur: 0.45, kind: 'burst', x: o.touch.x, y: o.touch.y, n: 1, emoji: '🌟', scale: 0.9 })
    cues.push({ at: top, sfx: 'clink' })
    hold = top + 0.15
  }
  if (o.pause) {
    // 停一拍：往下看一眼，好高……螢幕臉變成害怕，自己先抖
    moves.push({ at: hold, actor: 'bot', do: 'swap', emoji: 'hero:bot/scared' })
    fx.push({ at: hold + 0.05, kind: 'sweat', actor: 'bot', dx: 6, dy: 7 })
    hold += o.pause
  }
  // 腿開始發抖：先小小的、再越抖越大（兩根腿一起晃，腳還踩在地上）
  moves.push(
    { at: hold, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: hold, dur: tremble * 0.4, actor: 'bot', do: 'shake', amount: 0.6 + 0.2 * k },
    { at: hold + tremble * 0.4, dur: tremble * 0.6, actor: 'bot', do: 'shake', amount: 1.4 + 0.4 * k },
  )
  const col = hold + tremble
  const land = col + drop
  moves.push(
    // 嘩啦——垮下來
    { at: col, dur: drop, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR }, ease: 'in' },
    { at: land, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall', half: 'whole' },
    { at: land, dur: 0.01, actor: 'legs', do: 'vanish' },
  )
  fx.push(
    ...tubes(c0, land - c0),
    // 💥 在腳邊（不要蓋住他傻眼的臉）
    { at: land, dur: 0.5, kind: 'burst', x: BX + 13, y: 70, n: 1, emoji: '💥', scale: 1.1 + 0.3 * k },
  )
  const camera: Camera[] = [
    { at: land, dur: 0.35, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: BX, y: 62 } },
    { at: land, dur: 0.4, do: 'shake', amount: 0.9 + 0.4 * k },
  ]
  cues.push({ at: col, sfx: 'deflate' }, { at: land, sfx: 'rumble' })
  if (k >= 1) cues.push({ at: land + 0.04, sfx: 'crack' })
  if (k >= 2) cues.push({ at: land + 0.08, sfx: 'plop' })
  return { moves, fx, camera, cues, top, col, land }
}

// ---- 場景 ----
/** 左邊的大樹（樹冠右緣在 x 53 左右）：國字回到中間時不會擋到 */
const TREE = { x: 16, s: 86 }
/** 字框一開始就在右上：他往上伸、筆畫往右上飛，不經過字框 */
const FRAME = { x: 130, y: 21 }
const FRAME_K = 0.5
/** 三樣東西的位置與大小 */
const APPLE = { x: IX, y: 38.5, s: 8 }
const BALLOON = { x: IX, y: 21, s: 11 }
const STAR = { x: IX, y: 7.5, s: 10 }
/** 星星砸完頭彈到地上（在他腳邊、國字回到中間時也擋不到） */
const STAR_FLOOR = { x: 38, y: 77 - 0.42 * STAR.s }

// ---- 時間表 ----
const G1 = 0.55
// 第 1 次：樹邊的蘋果（伸一點點）
const g1 = stretch(G1, 0, { L: reachFor(APPLE.y), lead: 'point', touch: APPLE })
const L1 = g1.land
const BONK1 = L1 + 0.3
const G2 = L1 + 0.82
// 第 2 次：卡在樹頂的氣球（伸到樹頂）
const g2 = stretch(G2, 1, { L: reachFor(BALLOON.y), lead: 'point', touch: BALLOON, tick: 0.13 })
const L2 = g2.land
const BONK2 = L2 + 0.38
/** 停一拍：這次在天上，他盯著星星看一眼才開始伸 */
const G3 = L2 + 0.85
const g3 = stretch(G3, 2, { L: reachFor(STAR.y), lead: 'point', leadDur: 0.26, touch: STAR, tick: 0.13, pause: 0.4, tremble: 0.4, drop: 0.16 })
const L3 = g3.land
const BONK3 = L3 + 0.24
/** 國字拼好（最後一組筆畫落定）→ 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const B3 = g3.col + 0.02
const HOME = L3 + 0.5
const PARK = HOME + 0.8
const WORD = PARK + 0.75
/** 語詞那一刻：腿伸長一截正在發抖 */
const WL = 20
/** 回馬槍：星星就在腳邊，彎腰去撿，腿自己亂伸 */
const G4 = WORD + 0.6
const g4 = stretch(G4, 3, { L: 58, n: 4, tick: 0.1, lead: 'bow', leadDur: 0.25, top: 'glitch', tremble: 0.36, drop: 0.18 })
const L4 = g4.land
const BONK4 = L4 + 0.33
const ASK = BONK4 + 0.4
const AX = 40
const ASK_S = 1.35
const ANSWER = ASK + 2.55
const END = ANSWER + 1.37

/** 東西從高處掉到他頭上 */
const onHead = (s: number): Vec => ({ x: BX - 1, y: SIT_HEAD - 0.42 * s })

const clip: Clip = {
  format: 2,
  char: '腿',
  meta: { theme: '小機器人的伸縮腿越伸越長，一拿到東西就腿軟垮下來', cast: '小機器人＋大樹＋蘋果／氣球／星星', gags: ['小機器人搆不到高處的東西，就把伸縮腿「喀喀喀」一節一節伸長，手一碰到東西「叮」，腿就開始發抖、越抖越大，「嘩啦」垮下來一屁股坐在地上，東西掉下來砸頭（樹邊的蘋果→樹頂的氣球→停一拍：天上的星星，伸到畫面最頂、往下看一眼先嚇得發抖）；回馬槍是星星就在腳邊，他彎腰去撿，腿卻自己亂伸把他頂到畫面外，抖一抖又垮下來，星星彈起來再砸一次'] },
  duration: END,
  // 淡淡的天空藍：灰色的腿、橘色的機器人、紅蘋果都跳得出來
  bg: { top: '#DDF0FF', bottom: '#F6FBFF', floor: '#C9E8A8', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: TREE.x, y: 77 - 0.42 * TREE.s, size: TREE.s },
    { id: 'item', emoji: '🍎', x: APPLE.x, y: APPLE.y, size: APPLE.s, float: true, pivot: 'center' },
    // 腳（只畫下面一截），畫在身體後面
    { id: 'legs', emoji: 'hero:bot/idle', x: BX, y: PR, size: S, hidden: true, half: 'bottom', cut: FOOT_CUT },
    { id: 'bot', emoji: 'hero:bot/walk', x: BX, y: PR, size: S, hidden: true, cut: CUT },
  ],
  moves: [
    // 開場：他從右邊走進來，抬頭一看——蘋果！
    { at: 0.02, actor: 'bot', do: 'enter', from: { x: 185, y: PR }, dur: 0.5, ease: 'out' },
    // 第 1 次
    ...g1.moves,
    // 蘋果停一下才掉下來，咚！砸在頭上，彈到左邊滾出去
    { at: L1 + 0.12, dur: BONK1 - L1 - 0.12, actor: 'item', do: 'moveTo', to: onHead(APPLE.s), ease: 'in' },
    { at: BONK1, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: BONK1 + 0.03, dur: 0.35, actor: 'item', do: 'moveTo', to: { x: -12, y: 72 }, arc: 8, ease: 'out' },
    { at: BONK1 + 0.03, dur: 0.35, actor: 'item', do: 'rotateTo', amount: -400 },
    { at: BONK1 + 0.37, dur: 0.01, actor: 'item', do: 'vanish' },
    // 爬起來；氣球從右邊飄進來，卡在樹頂
    { at: BONK1 + 0.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: BONK1 + 0.38, actor: 'item', do: 'swap', emoji: '🎈' },
    { at: BONK1 + 0.38, dur: 0.01, actor: 'item', do: 'rotateTo', amount: 400 },
    { at: BONK1 + 0.38, dur: 0.01, actor: 'item', do: 'moveTo', to: { x: BALLOON.x, y: BALLOON.y } },
    { at: BONK1 + 0.4, dur: 0.4, actor: 'item', do: 'enter', from: { x: 120, y: 45 }, ease: 'out' },
    { at: BONK1 + 0.41, dur: 0.01, actor: 'item', do: 'scaleTo', amount: BALLOON.s / APPLE.s },
    // 第 2 次
    ...g2.moves,
    // 氣球慢慢飄下來，「啵」地彈在頭上，再彈走
    { at: L2 + 0.1, dur: BONK2 - L2 - 0.1, actor: 'item', do: 'moveTo', to: onHead(BALLOON.s), ease: 'inOut' },
    { at: BONK2, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: BONK2, dur: 0.15, actor: 'bot', do: 'squash', amount: 0.15 },
    { at: BONK2 + 0.03, dur: 0.33, actor: 'item', do: 'moveTo', to: { x: 175, y: -10 }, ease: 'in' },
    { at: BONK2 + 0.36, dur: 0.01, actor: 'item', do: 'vanish' },
    { at: BONK2 + 0.42, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 天上亮起一顆星星
    { at: BONK2 + 0.37, actor: 'item', do: 'swap', emoji: '⭐' },
    { at: BONK2 + 0.37, dur: 0.01, actor: 'item', do: 'moveTo', to: { x: STAR.x, y: STAR.y } },
    { at: BONK2 + 0.39, dur: 0.3, actor: 'item', do: 'pop' },
    { at: BONK2 + 0.39, dur: 0.01, actor: 'item', do: 'scaleTo', amount: STAR.s / APPLE.s },
    // 第 3 次
    ...g3.moves,
    // 星星從最高的地方直直掉下來，咚！把他撞得滾到右邊；星星彈到他腳邊的地上
    { at: L3 + 0.05, dur: BONK3 - L3 - 0.05, actor: 'item', do: 'moveTo', to: onHead(STAR.s), ease: 'in' },
    { at: BONK3, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: BONK3 + 0.02, dur: 0.32, actor: 'bot', do: 'moveTo', to: { x: 138, y: PR }, arc: 6, ease: 'out' },
    { at: BONK3 + 0.02, dur: 0.32, actor: 'bot', do: 'spin', times: 1, pivot: 'center' },
    { at: BONK3 + 0.02, dur: 0.32, actor: 'item', do: 'moveTo', to: STAR_FLOOR, arc: 8, ease: 'out' },
    { at: BONK3 + 0.02, dur: 0.32, actor: 'item', do: 'rotateTo', amount: -360 },
    // 語詞那一刻：走回原位，站在中間，腿伸長一截正在發抖——腿軟
    { at: PARK + 0.2, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: PARK + 0.2, dur: 0.38, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR } },
    { at: WORD - 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/scared', half: 'top' },
    { at: WORD - 0.15, dur: 0.01, actor: 'legs', do: 'enter', from: { x: BX, y: PR } },
    { at: WORD - 0.15, dur: 0.08, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR - WL / 2 }, ease: 'back' },
    { at: WORD - 0.03, dur: 0.08, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR - WL }, ease: 'back' },
    { at: WORD + 0.06, dur: 0.42, actor: 'bot', do: 'shake', amount: 1.2 },
    // 腿一軟，縮回來
    { at: WORD + 0.48, dur: 0.1, actor: 'bot', do: 'moveTo', to: { x: BX, y: PR }, ease: 'in' },
    { at: WORD + 0.58, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle', half: 'whole' },
    { at: WORD + 0.58, dur: 0.01, actor: 'legs', do: 'vanish' },
    // 第 4 次：星星就在腳邊，彎腰去撿——腿自己亂伸
    ...g4.moves,
    // 地一震，星星彈起來砸頭
    { at: L4 + 0.03, dur: BONK4 - L4 - 0.03, actor: 'item', do: 'moveTo', to: onHead(STAR.s), arc: 10, ease: 'in' },
    { at: BONK4, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: BONK4 + 0.02, dur: 0.35, actor: 'item', do: 'moveTo', to: { x: BX - 20, y: STAR_FLOOR.y }, arc: 6, ease: 'out' },
    // 問他：星星、樹收掉，他站起來跳到左前方、放大，轉過來面向國字
    { at: ASK, dur: 0.25, actor: 'item', do: 'vanish' },
    { at: ASK, dur: 0.25, actor: 'tree', do: 'vanish' },
    { at: ASK, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: ASK, actor: 'bot', do: 'flip' },
    { at: ASK, dur: 0.4, actor: 'bot', do: 'moveTo', to: { x: AX, y: PR - 1 }, arc: 5, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'bot', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: ASK + 1.65, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
    { at: ASK + 2.15, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ANSWER, dur: 0.3, actor: 'bot', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ANSWER + 0.15, actor: 'bot', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.2, actor: 'bot', do: 'moveTo', to: { x: -45, y: PR - 1 }, ease: 'in' },
  ],
  builds: [
    // 每垮一次，腿就震出一組筆畫：月、艮、辶
    { at: g1.col + 0.02, dur: 0.45, strokes: [0, 1, 2, 3], from: legMid(reachFor(APPLE.y)), color: partColor('⺼') },
    { at: g2.col + 0.02, dur: 0.45, strokes: [4, 5, 6, 7, 8, 9], from: legMid(reachFor(BALLOON.y)), color: partColor('艮') },
    { at: B3, dur: 0.45, strokes: [10, 11, 12], from: legMid(reachFor(STAR.y)), color: partColor('辶') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bot'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.85, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    { at: BONK1, dur: 0.3, kind: 'burst', actor: 'bot', dx: -9, dy: 2, n: 1, emoji: '💥', scale: 0.8 },
    { at: BONK1 + 0.05, dur: 0.4, kind: 'dizzy', actor: 'bot' },
    ...g2.fx,
    { at: BONK2 + 0.05, dur: 0.45, kind: 'dizzy', actor: 'bot' },
    { at: BONK2 + 0.39, dur: 0.4, kind: 'burst', x: STAR.x + 6, y: STAR.y + 4, n: 1, emoji: '✨', scale: 0.7 },
    ...g3.fx,
    { at: BONK3, dur: 0.3, kind: 'burst', actor: 'bot', dx: -9, dy: 2, n: 1, emoji: '💥', scale: 1.1 },
    { at: BONK3 + 0.5, dur: 1.0, kind: 'dizzy', actor: 'bot' },
    // 語詞那一刻：兩根腿
    ...tubes(WORD - 0.15, 0.73),
    { at: WORD + 0.06, kind: 'sweat', actor: 'bot', dx: 6, dy: 7 },
    ...g4.fx,
    { at: BONK4, dur: 0.3, kind: 'burst', actor: 'bot', dx: -9, dy: 2, n: 1, emoji: '💥', scale: 1.2 },
    { at: BONK4 + 0.05, dur: ASK - BONK4 - 0.05, kind: 'dizzy', actor: 'bot' },
  ],
  camera: [
    // 鏡頭固定在全景（他會一路伸到畫面頂），只有垮下來那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g1.camera, ...g2.camera, ...g3.camera, ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: G1 + 0.25, say: '腿' },
    ...g1.cues,
    { at: BONK1, sfx: 'bonk' },
    { at: BONK1 + 0.4, sfx: 'whoosh' },
    ...g2.cues,
    { at: BONK2, sfx: 'boing' },
    { at: BONK2 + 0.39, sfx: 'blip' },
    ...g3.cues,
    { at: BONK3, sfx: 'bonk' },
    { at: HOME + 0.1, say: '腿' },
    { at: WORD - 0.15, sfx: 'crack' },
    { at: WORD - 0.03, sfx: 'crack' },
    { at: WORD, say: '腿軟' },
    ...g4.cues,
    { at: G4 + 0.3, sfx: 'blip' },
    { at: BONK4, sfx: 'bonk' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '腿' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
