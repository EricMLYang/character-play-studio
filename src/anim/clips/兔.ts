import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { pressStack } from '../helpers'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 兔（v2）：兔子女孩最會跳。前面擋著東西，她抬頭量一量有多高，蹲低、耳朵往後一壓、腳邊冒小塵土——
// 「蹦！」一蹬，在空中劃一道大弧線飛過東西的頭頂，落地「咚」彈一下，閉眼得意；被跳過去的東西抬頭傻眼。
// 東西一次比一次高，她一次比一次跳得更高：慢吞吞的烏龜（小跳，耳朵飛出⺈）→ 一棵大樹（跳到畫面上半，身體飛出中間那一塊）→
// 先停一拍：一整座山，她抬頭看山頂、往後退好幾步、助跑——蹦！整個人飛出畫面上緣，越過山頂再落下來（蹬地的腳飛出兩條腿、落地時短尾巴飛出最後那一點）。
// 語詞那一刻她站在中間、耳朵豎得高高的：「兔子」。
// 回馬槍（第四次）：她太得意，用盡全力再蹦一次——直直往上飛出畫面，沒有掉下來……「咚！」上面撞到東西，
// 她抱著一顆大月亮掉下來（跳太高，把月亮撞下來了）。
// 最後畫面暗下來只剩「兔」，月亮飄回天上，她問「這是什麼字？」，手放耳邊等他回答，再指著字說「兔！」，然後退場只留字。
// 刻意不跟「蛙」（舌頭捲走點心）、「接」（接東西越疊越高）、「足」（踢球被彈回來）撞：這支只演「蹲低→蹦→跳過去」。
// 兔、兔、兔子、這是什麼字？、兔

/** 兔子女孩：這個字講的就是她。圖朝左，跳的方向（往右）要 flip */
const SB = 40
const PB = 77 - 0.42 * SB
/** 每一次都從同一個地方起跳、落在同一個地方；被跳過的東西擺在中間偏右 */
const X0 = 42
const LX = 144
const OX = 92
/** 字框一開始就在左上（太陽在右上）：弧線、山都碰不到 */
const FRAME = { x: 21, y: 19 }
const FRAME_K = 0.42

/** 圖（0～1、朝左）上的一點：她站在 x、圖中心在 y、朝右（flip）時的位置 */
const pt = (x: number, y: number, u: number, v: number, s = 1): Vec => ({ x: x + (0.5 - u) * SB * s, y: y + (v - 0.5) * SB * s })

/** 被跳過去的三樣東西（由低到高）。y 是站在地上時圖的中心 */
const OBS = [
  { id: 'turtle', emoji: 'prop:turtle', size: 30 },
  { id: 'tree', emoji: 'prop:tree', size: 42 },
  { id: 'mountain', emoji: '⛰️', size: 76 },
].map((o) => ({ ...o, y: 77 - 0.42 * o.size }))
/** 每一次跳到最高點時圖中心的 y：小跳剛好過烏龜、跳到畫面上半過樹頂、整個人飛出畫面上緣 */
const PEAK = [36, 19, -62]
/** 在空中多久（看得到的弧線）、最高點多停一下 */
const FLIGHT = [0.46, 0.6, 0.95]
const HANG = [0.07, 0.1, 0]
/** 落地以後得意多久 */
const PROUD = 0.42

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 一道拋物線：拆成一小段一小段直線（x 等速，y 照拋物線），最高點可以多停 hang 秒 */
function arcPath(at: number, dur: number, x0: number, x1: number, yPeak: number, hang: number): Move[] {
  const N = 12, out: Move[] = []
  const step = dur / N
  let t = at
  for (let i = 1; i <= N; i++) {
    const s = i / N
    const y = PB - (PB - yPeak) * 4 * s * (1 - s)
    out.push({ at: t, dur: step, actor: 'bunny', do: 'moveTo', to: { x: x0 + (x1 - x0) * s, y }, ease: 'linear' })
    t += step
    // 最高點停一格（只往前飄一點點）
    if (i === N / 2 && hang > 0) {
      out.push({ at: t, dur: hang, actor: 'bunny', do: 'moveTo', to: { x: x0 + (x1 - x0) * s + 1.5, y: yPeak }, ease: 'inOut' })
      t += hang
    }
  }
  return out
}

/**
 * 同一個笑點：她看著前面擋路的東西、抬頭量一量（look）→ 蹲低預備（ready：耳朵往後壓、腳邊冒小塵土、身體一抖一抖蓄力，停 0.3 秒）→
 * 「蹦！」蹬地那一格：鏡頭推一下＋震、腳下一圈塵土、同一個彈簧聲（一次多疊一個音）→ 在空中劃一道大弧線飛過東西的頭頂（leap，耳朵往後飄）→
 * 落地「咚」彈一下，閉眼得意（smug）停 0.42 秒；被跳過去的東西在她經過頭頂時抬頭、晃一下。
 * k 是第幾次（0 烏龜、1 樹、2 山）。look 是從哪一刻開始蓄力（前面的抬頭量一量由呼叫的人寫）。
 */
function bound(go: number, k: number): Gag & { land: number; foot: Vec } {
  const o = OBS[k]
  const moves: Move[] = []
  const ready = go - 0.3
  moves.push(
    { at: ready, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    // 蓄力：一抖一抖，越來越緊
    { at: ready + 0.08, dur: 0.22, actor: 'bunny', do: 'shake', amount: 0.4 + 0.2 * k },
    // 蹦！
    { at: go, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
  )
  const fly = FLIGHT[k], hang = HANG[k]
  moves.push(...arcPath(go, fly, X0, LX, PEAK[k], hang))
  const land = go + fly + hang
  const mid = go + fly / 2
  moves.push({ at: land, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' })
  // 被跳過去的東西：她飛過頭頂時抬頭看（往後仰）、落地時晃一下
  moves.push(
    ...(k < 2 ? [
      { at: mid - 0.1, dur: 0.18, actor: o.id, do: 'rotateTo', amount: 12, ease: 'out' },
      { at: land, dur: 0.2, actor: o.id, do: 'rotateTo', amount: -12, ease: 'inOut' },
    ] as Move[] : [{ at: mid - 0.1, dur: 0.3, actor: o.id, do: 'hop', amount: 2 }] as Move[]),
    { at: land, dur: 0.35, actor: o.id, do: 'shake', amount: 0.6 + 0.3 * k },
  )
  // 蹬地的腳（ready 圖的後腳）
  const foot = pt(X0, PB, 0.8, 0.93)
  const fx: Fx[] = [
    // 預備：腳邊冒小塵土
    { at: ready + 0.05, dur: 0.3, kind: 'puff', actor: 'bunny' },
    // 蹦！腳下一圈塵土（留在地上，不跟著她飛）
    { at: go, dur: 0.5, kind: 'burst', x: X0, y: 72, n: 6 + k, emoji: '☁️', scale: 1.3 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at: go, dur: 0.28, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: X0 + 10, y: 60 } },
    { at: go, dur: 0.28, do: 'shake', amount: 0.5 + 0.3 * k },
  ]
  // 淡淡的白光：不要把她刷白
  const lights: Light[] = [
    { at: go, dur: 0.04, level: -0.06 },
    { at: go + 0.04, dur: 0.18, level: 0 },
  ]
  const cues: Cue[] = [
    { at: ready, sfx: 'tap' },
    { at: go, sfx: 'boing' },
    { at: land, sfx: 'plop' },
  ]
  if (k >= 1) cues.push({ at: go + 0.04, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: go + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights, land, foot }
}

/** 落地得意完：轉身咻地跑回起跳的地方，再轉回來 */
function runBack(at: number): Move[] {
  return [
    { at, actor: 'bunny', do: 'flip' },
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at, dur: 0.26, actor: 'bunny', do: 'moveTo', to: { x: X0, y: PB }, ease: 'out' },
    { at: at + 0.27, actor: 'bunny', do: 'flip' },
    { at: at + 0.27, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  ]
}
/** 抬頭量一量有多高：往後仰 deg 度、停一下，蹲下去之前仰回來 */
const look = (at: number, deg: number, until: number): Move[] => [
  { at, dur: 0.12, actor: 'bunny', do: 'rotateTo', amount: -deg, ease: 'out' },
  { at: until - 0.06, dur: 0.06, actor: 'bunny', do: 'rotateTo', amount: deg },
]

// ---- 時間表 ----
/** 第一次：小烏龜 */
const L1 = 0.92
const g1 = bound(L1 + 0.24 + 0.3, 0)
const B1 = g1.land + PROUD
/** 第二次：大樹 */
const L2 = B1 + 0.36
const g2 = bound(L2 + 0.26 + 0.3, 1)
const B2 = g2.land + PROUD
/** 停一拍：一整座山。抬頭看山頂、往後退好幾步、助跑 */
const L3 = B2 + 0.42
const BACKUP = L3 + 0.4
const RUN = BACKUP + 0.36
const g3 = bound(RUN + 0.2 + 0.28, 2)
/** 最後那一點（短尾巴）落地時飛出去；拼好後國字放大到中間 */
const TAIL = g3.land + 0.04
const HOME = TAIL + 0.32
const PARK = HOME + 0.82
/** 語詞那一刻：她走到中間，耳朵豎得高高的 */
const WORD = PARK + 0.42
const WS = 1.25
const WP = 77 - 0.42 * SB * WS
/** 回馬槍：太得意，用盡全力再蹦一次，直直往上飛出畫面 */
const G4 = WORD + 0.5
const GO4 = G4 + 0.42
const BONK = GO4 + 0.3
const FALL4 = BONK + 0.06
const LAND4 = FALL4 + 0.3
const ASK = 11.05
const AX = 128
const ASK_S = 1.35
const ANSWER = 13.6
/** 抱著月亮：lift 圖舉高的雙手（u 0.49、v 0.12）上面 */
const MS = 24
const moonAt = (x: number, y: number): Vec => ({ x: x - 0.5, y: y + (0.12 - 0.5) * SB * WS - MS * 0.42 })

const all = [g1, g2, g3]

const clip: Clip = {
  format: 2,
  char: '兔',
  meta: { theme: '兔子女孩跳過越來越高的東西', cast: '兔子女孩＋烏龜、大樹、山、月亮', gags: ['前面擋著東西，兔子女孩抬頭量一量，蹲低預備、腳邊冒塵土，「蹦！」一蹬劃一道大弧線跳過去，落地閉眼得意，被跳過的東西抬頭傻眼；東西一次比一次高、她一次比一次跳得高（慢吞吞的烏龜小跳→大樹跳到畫面上半→停一拍：一整座山，她抬頭看山頂、往後退、助跑，整個人飛出畫面上緣再落下來）；回馬槍是她太得意，用盡全力直直往上蹦，飛出畫面沒掉下來……「咚」撞到東西，抱著一顆大月亮掉下來'] },
  duration: 15,
  // 淡藍的天空、綠草地（白色塵土在草地上看得到）；太陽在右上，字框在左上
  bg: { top: '#BFE6FF', bottom: '#EEF8FF', floor: '#A8D884', scenery: 'hills' },
  actors: [
    ...OBS.map((o) => ({ id: o.id, emoji: o.emoji, x: 200, y: o.y, size: o.size, hidden: o.id !== 'turtle' })),
    { id: 'moon', emoji: '🌕', x: 80, y: -40, size: MS, float: true, pivot: 'center' as const, hidden: true },
    { id: 'bunny', emoji: 'hero:bunny/dash', x: X0, y: PB, size: SB, hidden: true, flip: true },
  ],
  moves: [
    // 開場：她咻地跑進來，轉身指著字框——兔！烏龜慢慢爬進來擋在前面
    { at: 0, dur: 0.4, actor: 'bunny', do: 'enter', from: { x: -20, y: PB }, ease: 'out' },
    { at: 0, dur: 1.0, actor: 'turtle', do: 'moveTo', to: { x: OX, y: OBS[0].y }, ease: 'out' },
    { at: 0.42, actor: 'bunny', do: 'flip' },
    { at: 0.42, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 0.85, actor: 'bunny', do: 'flip' },
    { at: 0.85, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 第一次：烏龜
    ...look(L1, 6, g1.land - FLIGHT[0] - HANG[0] - 0.3),
    ...g1.moves,
    ...runBack(B1),
    // 烏龜慢慢轉身爬走；大樹滑進來
    { at: g1.land + 0.2, actor: 'turtle', do: 'flip' },
    { at: g1.land + 0.2, dur: 1.0, actor: 'turtle', do: 'moveTo', to: { x: 205, y: OBS[0].y }, ease: 'in' },
    { at: B1 + 0.05, dur: 0.01, actor: 'tree', do: 'pop' },
    { at: B1 + 0.05, dur: 0.35, actor: 'tree', do: 'moveTo', to: { x: OX, y: OBS[1].y }, ease: 'out' },
    // 第二次：大樹（抬頭抬得更高）
    ...look(L2, 10, g2.land - FLIGHT[1] - HANG[1] - 0.3),
    ...g2.moves,
    ...runBack(B2),
    // 大樹滑走；一整座山轟隆隆滑進來
    { at: B2 - 0.1, dur: 0.4, actor: 'tree', do: 'moveTo', to: { x: 215, y: OBS[1].y }, ease: 'in' },
    { at: B2 + 0.1, dur: 0.01, actor: 'mountain', do: 'pop' },
    { at: B2 + 0.1, dur: 0.42, actor: 'mountain', do: 'moveTo', to: { x: OX, y: OBS[2].y }, ease: 'out' },
    // 停一拍：她抬頭看山頂（傻眼），往後退好幾步，助跑
    { at: L3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: L3, dur: 0.16, actor: 'bunny', do: 'rotateTo', amount: -12, ease: 'out' },
    { at: BACKUP, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: BACKUP, dur: 0.12, actor: 'bunny', do: 'rotateTo', amount: 12 },
    { at: BACKUP, dur: 0.34, actor: 'bunny', do: 'moveTo', to: { x: 20, y: PB }, ease: 'inOut' },
    { at: RUN, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: RUN, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: X0, y: PB }, ease: 'in' },
    ...g3.moves,
    // 落地以後山晃一下就滑走，讓出中間給國字
    { at: g3.land + 0.08, dur: 0.26, actor: 'mountain', do: 'moveTo', to: { x: 230, y: OBS[2].y }, ease: 'in' },
    // 國字放大時她在右邊得意；讓位後走到中間（放大一點）：兔子！
    { at: PARK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: PARK, actor: 'bunny', do: 'flip' },
    { at: PARK, dur: 0.36, actor: 'bunny', do: 'moveTo', to: { x: 80, y: WP }, ease: 'inOut' },
    { at: PARK, dur: 0.36, actor: 'bunny', do: 'scaleTo', amount: WS },
    { at: WORD - 0.04, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: WORD - 0.04, dur: 0.3, actor: 'bunny', do: 'hop', amount: 4 },
    // 回馬槍：閉眼得意 → 用盡全力蹲低（抖得最厲害）→ 蹦！直直往上飛出畫面
    { at: G4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    { at: G4 + 0.12, actor: 'bunny', do: 'flip' },
    { at: GO4 - 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: GO4 - 0.24, dur: 0.24, actor: 'bunny', do: 'shake', amount: 1.1 },
    { at: GO4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: GO4, dur: 0.22, actor: 'bunny', do: 'moveTo', to: { x: 80, y: -48 }, ease: 'out' },
    // 「咚！」在上面撞到東西……抱著一顆大月亮掉下來
    { at: BONK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/lift' },
    { at: BONK, dur: 0.01, actor: 'moon', do: 'moveTo', to: moonAt(80, -48) },
    { at: BONK + 0.01, dur: 0.01, actor: 'moon', do: 'pop' },
    { at: FALL4, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: 80, y: WP }, ease: 'in' },
    { at: FALL4, dur: 0.3, actor: 'moon', do: 'moveTo', to: moonAt(80, WP), ease: 'in' },
    { at: LAND4, dur: 0.26, actor: 'bunny', do: 'squash', amount: 0.25 },
    ...pressStack(LAND4, 0.26, 0.25, SB * WS, ['moon']),
    { at: LAND4 + 0.3, dur: 0.4, actor: 'moon', do: 'tilt', amount: 6 },
    // 問他：暗下來後月亮飄回天上，她跳到右前方、放大
    { at: ASK + 0.3, dur: 0.7, actor: 'moon', do: 'moveTo', to: { x: 70, y: -30 }, ease: 'in' },
    { at: ASK + 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ASK + 0.3, dur: 0.45, actor: 'bunny', do: 'moveTo', to: { x: AX, y: PB - 1 }, arc: 12, ease: 'out' },
    { at: ASK + 0.3, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S / WS, ease: 'back' },
    { at: ASK + 0.75, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK + 0.75, actor: 'bunny', do: 'flip' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.65, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 退場（往右蹦出去），畫面只留下字
    { at: ANSWER + 0.14, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: ANSWER + 0.15, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.17, actor: 'bunny', do: 'moveTo', to: { x: 205, y: PB - 1 }, ease: 'in' },
  ],
  builds: [
    // 每蹦一次，她身上就飛出一組筆畫：落地站好時耳朵飛出⺈、身體飛出中間那一塊；第三次蹬地的腳飛出兩條腿、落地時短尾巴飛出那一點
    { at: g1.land + 0.03, dur: 0.4, strokes: [0, 1], from: pt(LX, PB, 0.45, 0.1), color: partColor('⺈') },
    { at: g2.land + 0.03, dur: 0.4, strokes: [2, 3, 4], from: pt(LX, PB, 0.5, 0.62), color: partColor('兔身') },
    { at: g3.land - FLIGHT[2] + 0.02, dur: 0.4, strokes: [5, 6], from: g3.foot, color: partColor('儿') },
    { at: TAIL, dur: 0.28, strokes: [7], from: pt(LX, PB, 0.72, 0.7), color: partColor('儿') },
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
    ...g1.fx,
    ...g2.fx,
    { at: L3 + 0.1, kind: 'sweat', actor: 'bunny', dx: -6 },
    ...g3.fx,
    // 語詞那一刻：她身邊亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: 80, y: 50, n: 8, emoji: '✨', scale: 1.3 },
    // 回馬槍：用盡全力（兩次塵土），蹦！
    { at: GO4 - 0.28, dur: 0.3, kind: 'puff', actor: 'bunny' },
    { at: GO4, dur: 0.55, kind: 'burst', x: 80, y: 72, n: 9, emoji: '☁️', scale: 2 },
    // 咚！上面撞到東西
    { at: BONK, dur: 0.45, kind: 'burst', x: 80, y: 11, n: 1, emoji: '💥', scale: 1.8 },
    { at: LAND4, dur: 0.5, kind: 'burst', x: 80, y: 72, n: 8, emoji: '☁️', scale: 1.8 },
    { at: LAND4 + 0.15, dur: 0.6, kind: 'burst', x: 80, y: 28, n: 7, emoji: '✨', scale: 1.4 },
  ],
  camera: [
    // 鏡頭鎖全景（她會跳到畫面頂、飛出去），只有蹬地那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: B2 + 0.25, dur: 0.35, do: 'shake', amount: 0.8 },
    { at: GO4, dur: 0.3, do: 'punch', amount: 0.1, to: { x: 80, y: 60 } },
    { at: GO4, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: BONK, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: LAND4, dur: 0.4, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.5, say: '兔' },
    ...all.flatMap((g) => g.cues),
    { at: B2 + 0.15, sfx: 'rumble' },
    { at: L3 + 0.05, sfx: 'gulp' },
    { at: HOME + 0.1, say: '兔' },
    { at: WORD, say: '兔子' },
    { at: GO4 - 0.3, sfx: 'tap' },
    { at: GO4, sfx: 'boing' },
    { at: GO4 + 0.04, sfx: 'whoosh' },
    { at: BONK, sfx: 'bonk' },
    { at: LAND4, sfx: 'rumble' },
    { at: LAND4 + 0.05, sfx: 'plop' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '兔' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
