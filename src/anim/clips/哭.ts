import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 哭（v2）：小恐龍的冰淇淋「啪」掉在地上，他吸一大口氣——「哇——！」張大嘴大哭，兩道藍色的眼淚像噴泉一樣從兩隻眼睛往兩邊噴出來。
// 楊捷睿趕快想辦法逗他笑，可是每逗一次，他哭得更大聲、眼淚噴得更高、地上的淚水漲一截：
// 冰淇淋掉了（小噴泉、腳邊一灘；左邊的口從左眼飛出來）→ 送他氣球，他吸吸鼻子伸手要拿，氣球「啪」破掉（噴到畫面一半高，
// 楊捷睿被淋濕、地上一片水；右邊的口從右眼飛出來）→ 先停一拍：楊捷睿想一想、推來一個紙箱躲進去，他好奇地湊過來看……
// 「哇！」跳出來想嚇他一個驚喜，真的把他嚇到了（噴到畫面頂，淚水淹到膝蓋，紙箱載著楊捷睿變成小船漂起來；
// 犬從他張大的嘴飛出來，那一點是一滴掉下來的眼淚）。
// 語詞那一刻小恐龍在畫面中間張嘴大哭、噴泉噴著，楊捷睿在小船上抱著頭摀耳朵：「大哭」。
// 回馬槍（第四次）：楊捷睿把自己的冰淇淋給他——他吸吸鼻子、接過來一口吃掉，眼淚停了、水退了，楊捷睿鬆一口氣……
// 他太開心了，「哇——！」笑著又噴出兩道眼淚，把楊捷睿淋成落湯雞，兩個人一起哈哈大笑。
// 最後畫面暗下來只剩「哭」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再指著字說「哭！」，然後退場只留字。
// 刻意不跟「臉」（做鬼臉逗人笑、對方忍笑；放棄了滑一跤對方才爆笑）、「呆」（怎麼吵都沒反應；自己也跟著呆）、
// 「象」「雲」（被水柱沖、被雨淋）撞：這支只演「想逗他→反而哭更大聲、眼淚噴更高」，回馬槍是「逗成功了，他開心到又噴淚」。
// 哭、哭、大哭、這是什麼字？、哭

/** 小恐龍：哭的人，畫面正中間、最大（圖朝左，面向左邊的楊捷睿，不用 flip） */
const S = 46
const P = 77 - 0.42 * S
const RX = 82
/** 國字放大到中間時，他哭著退到右邊 */
const RSIDE = 138
/** 小恐龍圖（0～1、朝左）上的一點 */
const rpt = (u: number, v: number, x = RX): Vec => ({ x: x + (u - 0.5) * S, y: P + (v - 0.5) * S })
/** 兩隻眼睛的外眼角（cry 圖上兩道眼淚流出來的地方）：噴泉從這裡往兩邊噴，不蓋住臉 */
const EYE_L = rpt(0.3, 0.28)
const EYE_R = rpt(0.63, 0.29)
/** 張大的嘴 */
const MOUTH = rpt(0.45, 0.44)

/** 楊捷睿：想逗他笑的人，站在左邊、朝右（圖朝左，要 flip） */
const SY = 36
const PY = 77 - 0.42 * SY
/** 一開始站的地方、每次走過去逗他的地方 */
const Y0 = 28
const YG = 44
/** 紙箱（打開的、箱口朝上）：躲在裡面嚇他，水漲起來以後變成小船 */
const BS = 30
const BY = 77 - 0.42 * BS
const BX = 34
/** 水漲到膝蓋以後，小船浮起來這麼高 */
const FLOAT = 3.5

/** 冰淇淋：一開始在他手上，掉在地上倒栽蔥 */
const CS = 19
const HAND = rpt(0.1, 0.4)
const SPLAT = { x: RX - 24, y: 67.5 }

/** 字框：上方正中、他的頭頂上（兩道噴泉從兩邊繞過它往外噴，不經過字框；兩個口就在他兩隻眼睛的正上方），背後是素色的天空 */
const FRAME = { x: 81, y: 16.5 }
const FRAME_K = 0.4

const TEAR = '#1789F0'
const TEAR_HI = '#D8F3FF'
const WATER = '#49ADF2'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 一段線（錨在看不見的 sea 上，sea 在 0,0，所以 dx／dy 就是舞台座標） */
const seg = (at: number, dur: number, a: Vec, b: Vec, color: string, width: number): Fx =>
  ({ at, dur, kind: 'line', actor: 'sea', dx: a.x, dy: a.y, to: b, color, width })

/** 噴泉有多大：最高點的 y、往旁邊噴多遠、多粗、落在哪個高度（地上／水面） */
type Level = { apex: number; reach: number; width: number; land: number }
const LEVELS: Level[] = [
  // 第 1 次：小噴泉，只比頭高一點
  { apex: 37, reach: 15, width: 2.6, land: 74.5 },
  // 第 2 次：噴到畫面一半高，落在楊捷睿身上
  { apex: 20, reach: 30, width: 3.6, land: 73.5 },
  // 第 3 次：噴到畫面頂
  { apex: 3.5, reach: 44, width: 4.8, land: 70.5 },
  // 回馬槍：開心的眼淚，一樣噴到頂，全落在楊捷睿身上
  { apex: 4.5, reach: 31, width: 4.6, land: 74.5 },
]
/** 語詞那一刻：一直在大哭 */
const WORD_LEVEL: Level = { apex: 11, reach: 36, width: 4.2, land: 70.5 }

/** 一道弧形的眼淚：從眼角往上、往旁邊噴，再掉到地上（拋物線，一開始就往外斜，不經過臉） */
function arc(eye: Vec, dir: number, lv: Level, wob: number, n = 11): Vec[] {
  const D = lv.land - eye.y, H = eye.y - (lv.apex + wob)
  const A = (8 * D + 16 * H + Math.sqrt((8 * D + 16 * H) ** 2 - 64 * D * D)) / 32
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n
    return { x: eye.x + dir * (lv.reach + wob * 0.6) * s ** 0.5, y: eye.y + D * s - 4 * A * s * (1 - s) }
  })
}

/**
 * 兩道眼淚噴泉：每 0.1 秒重畫一次（高度微微晃、亮的水紋一格一格往前流），粗的深藍＋亮的水芯；
 * 落地的地方一直濺水花。eyes 是兩個眼角。
 */
function fountain(at: number, dur: number, lv: Level, k: number, eyes: [Vec, Vec] = [EYE_L, EYE_R]): Fx[] {
  const out: Fx[] = []
  const step = 0.1
  for (let s = 0; at + s * step < at + dur - 0.06; s++) {
    const t = at + s * step
    const d = Math.min(0.22, at + dur - t)
    const wob = (s % 2 ? 1 : -1) * (0.5 + 0.25 * k)
    const arcs = [arc(eyes[0], -1, lv, wob), arc(eyes[1], 1, lv, wob)]
    for (const pts of arcs) for (let i = 0; i < pts.length - 1; i++) out.push(seg(t, d, pts[i], pts[i + 1], TEAR, lv.width))
    for (const pts of arcs) for (let i = 0; i < pts.length - 1; i++) if ((i + 3 - (s % 3)) % 3 === 0) out.push(seg(t, d, pts[i], pts[i + 1], TEAR_HI, lv.width * 0.38))
  }
  // 落地的水花（一次比一次大）
  for (let t = at + 0.12; t < at + dur - 0.2; t += 0.32) {
    for (const [e, dir] of [[eyes[0], -1], [eyes[1], 1]] as [Vec, number][]) {
      out.push({ at: t, dur: 0.45, kind: 'burst', x: e.x + dir * lv.reach, y: lv.land - 5, emoji: '💦', n: 4 + k, scale: 0.75 + 0.2 * k })
    }
  }
  return out
}

/** 地上的淚水：一排一排的藍色橫線疊成水面，從他腳下往兩邊漫開、由下往上漲；退的時候由上往下退 */
function water(at: number, until: number, ys: number[], width = 3.4, x0 = -14, x1 = 174): Fx[] {
  return ys.flatMap((y, j) => {
    const start = at + j * 0.06, end = until + (ys.length - 1 - j) * 0.06
    return [x0, x1].map((x) => seg(start, end - start, { x: RX, y }, { x, y }, WATER, width))
  })
}

/**
 * 同一個笑點「哇——！」：他吸一大口氣（往上拉長、抖）→ 張大嘴大哭：換成大哭的臉、整隻一直抖，兩道眼淚噴泉往兩邊噴，
 * 鏡頭推一下＋震、淡淡的白光、同一個哭聲（往下掉的滑音，一次多疊一個音）。at 是哇的那一刻，k 是第幾次（0～3），dur 是哭多久；
 * 回馬槍（k 3）是笑著噴淚，臉換成大笑。每次為什麼哭（東西掉了、破了、被嚇到）和楊捷睿被淋到的反應由呼叫的人寫。
 */
function wail(at: number, k: number, dur: number, pose = 'cry'): Gag {
  const lv = LEVELS[k]
  const moves: Move[] = [
    { at: at - 0.26, dur: 0.24, actor: 'rex', do: 'squash', amount: -0.1 - 0.02 * k },
    { at, actor: 'rex', do: 'swap', emoji: `hero:rex/${pose}` },
    { at: at + 0.05, dur: dur - 0.05, actor: 'rex', do: 'shake', amount: 0.5 + 0.15 * k },
  ]
  const fx = fountain(at, dur, lv, k)
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: RX, y: 46 } },
    { at, dur: 0.35, do: 'shake', amount: 0.7 + 0.45 * k },
  ]
  // 淡淡的白光：不要把他刷白
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.07 },
    { at: at + 0.04, dur: 0.2, level: 0 },
  ]
  const cues: Cue[] = [{ at, sfx: 'deflate' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'splash' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights }
}

/** 吸吸鼻子：眼淚快停了（垂著頭癟嘴、肩膀一抽一抽） */
const sniff = (at: number): { moves: Move[]; cues: Cue[] } => ({
  moves: [
    { at, actor: 'rex', do: 'swap', emoji: 'hero:rex/hungry' },
    { at: at + 0.05, dur: 0.14, actor: 'rex', do: 'hop', amount: 1.2 },
    { at: at + 0.24, dur: 0.14, actor: 'rex', do: 'hop', amount: 1.2 },
  ],
  cues: [{ at: at + 0.05, sfx: 'hic' }, { at: at + 0.24, sfx: 'hic' }],
})

// ---- 時間表 ----
/** 冰淇淋「啪」掉在地上 */
const DROP = 0.8
/** 第 1 次：小噴泉 */
const C1 = 1.25
const D1 = 0.85
/** 氣球「啪」破掉 */
const BANG = 2.9
/** 第 2 次：噴到一半高，楊捷睿被淋濕 */
const C2 = 3.3
const D2 = 0.95
/** 停一拍：想一想、推紙箱進來、躲進去 */
const BEAT = C2 + D2
const BOX_IN = BEAT + 0.8
const HIDE = BOX_IN + 0.6
/** 「哇！」從紙箱跳出來 */
const BOO = HIDE + 0.42
/** 第 3 次：噴到畫面頂，淚水淹到膝蓋 */
const C3 = BOO + 0.45
const D3 = 0.8
/** 國字放大到中間（他哭著退到右邊、小船漂到左邊） */
const HOME = C3 + D3 + 0.3
const PARK = HOME + 0.85
/** 語詞那一刻：他回到中間，張嘴大哭 */
const WORD = PARK + 0.4
const DW = 0.6
/** 回馬槍：楊捷睿把自己的冰淇淋給他 */
const GIVE = WORD + DW
const EAT = GIVE + 0.6
/** 第 4 次：開心到又噴淚 */
const C4 = EAT + 0.35
const D4 = 0.5
const ASK = 11.15
const ANSWER = 13.68
const AX = 36
const ASK_S = 1.25

const g1 = wail(C1, 0, D1)
const g2 = wail(C2, 1, D2)
const g3 = wail(C3, 2, D3)
const g4 = wail(C4, 3, D4, 'laugh')
const all = [g1, g2, g3, g4]
const s2 = sniff(C1 + D1)
const s3 = sniff(BEAT)
const s4 = sniff(GIVE)

/** 水面：第 2 次以後前面的草地上一片水，第 3 次再漲到膝蓋 */
const SHEET = [88.6, 85.4, 82.2, 79.4]
const KNEE = [76.2, 73, 70.2]
/** 水開始退 */
const DRAIN = EAT + 0.05
/** 氣球（楊捷睿伸手拿著，跟著他走）：錨在他頭上，放大以後在他前面、兩個人中間 */
const BALLOON = { dx: -3, dy: 13, scale: 3 }
/** 犬的那一點：一滴從最高的噴泉掉下來的大眼淚 */
const TEARDROP = { x: 120, y: 26 }

const clip: Clip = {
  format: 2,
  char: '哭',
  meta: { theme: '冰淇淋掉了，小恐龍大哭，越逗哭越大聲', cast: '小恐龍＋楊捷睿＋冰淇淋／氣球／紙箱', gags: ['小恐龍的冰淇淋「啪」掉在地上，他「哇——」大哭，兩道眼淚像噴泉從眼睛往兩邊噴；楊捷睿想逗他笑，每逗一次他哭得更大聲、眼淚噴得更高、地上的淚水漲一截（冰淇淋掉了，小噴泉→送氣球，氣球啪地破掉，噴到一半高把楊捷睿淋濕→停一拍：躲進紙箱「哇！」跳出來想給他驚喜，把他嚇到，噴到畫面頂、淚水淹到膝蓋、紙箱變成小船漂起來）；回馬槍是楊捷睿把自己的冰淇淋給他，他一口吃掉、不哭了、水也退了，結果太開心笑著又噴出兩道眼淚，把楊捷睿淋成落湯雞，兩個人一起大笑'] },
  duration: 15,
  // 暖暖的蜜桃色天空、綠草地：藍色的眼淚和淚水跳得出來
  bg: { top: '#FFD8BE', bottom: '#FFF3E4', floor: '#BCDD96', scenery: 'hills' },
  actors: [
    // 看不見的錨點：眼淚、水面的線都掛在它身上（在 0,0，不會動）
    { id: 'sea', emoji: '🟦', x: 0, y: 0, size: 1, hidden: true, float: true },
    { id: 'rex', emoji: 'hero:rex/happy', x: RX, y: P, size: S },
    { id: 'cone', emoji: '🍦', x: HAND.x, y: HAND.y, size: CS, float: true, pivot: 'center' },
    { id: 'yang', emoji: 'hero:yang/walk', x: Y0, y: PY, size: SY, hidden: true, flip: true },
    // 紙箱畫在楊捷睿前面：他站在裡面只露出上半身
    { id: 'box', emoji: 'prop:box', x: BX, y: BY, size: BS, hidden: true },
  ],
  moves: [
    // 開場：小恐龍開心地舉著冰淇淋；楊捷睿走進來揮手
    { at: 0, dur: 0.45, actor: 'yang', do: 'enter', from: { x: -22, y: PY }, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    { at: 0.1, dur: 0.25, actor: 'rex', do: 'hop', amount: 2.5 },
    { at: 0.1, dur: 0.25, actor: 'cone', do: 'hop', amount: 2.5 },
    // 手一滑——冰淇淋「啪」掉在地上，倒栽蔥
    { at: DROP - 0.25, dur: 0.25, actor: 'cone', do: 'moveTo', to: SPLAT, ease: 'in' },
    { at: DROP - 0.25, dur: 0.25, actor: 'cone', do: 'rotateTo', amount: -180, ease: 'in' },
    { at: DROP - 0.22, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: DROP, dur: 0.2, actor: 'cone', do: 'squash', amount: 0.3 },
    { at: DROP + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第 1 次：哇——！小噴泉
    ...g1.moves,
    { at: C1 + 0.05, dur: 0.25, actor: 'yang', do: 'hop', amount: 3 },
    // 楊捷睿想到辦法：送他氣球！
    { at: C1 + 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: C1 + 0.5, dur: 0.25, actor: 'yang', do: 'hop', amount: 2.5 },
    { at: C1 + D1, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: C1 + D1 + 0.05, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: YG, y: PY }, ease: 'out' },
    // 他吸吸鼻子、眼淚快停了，伸手要拿（好像有用）
    ...s2.moves,
    { at: BANG - 0.38, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
    { at: BANG - 0.38, dur: 0.2, actor: 'rex', do: 'hop', amount: 1.5 },
    // 「啪！」氣球破了——兩個人都傻眼
    { at: BANG, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: BANG, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: BANG, dur: 0.2, actor: 'yang', do: 'squash', amount: 0.15 },
    // 第 2 次：哇——！噴到一半高，楊捷睿被淋濕、傻眼
    ...g2.moves,
    { at: C2 + 0.2, dur: D2 - 0.25, actor: 'yang', do: 'shake', amount: 0.6 },
    // 地上的冰淇淋被淚水沖走
    { at: C2 + 0.3, dur: 0.55, actor: 'cone', do: 'moveTo', to: { x: 182, y: 70 }, ease: 'in' },
    { at: C2 + 0.9, dur: 0.01, actor: 'cone', do: 'vanish' },
    // 第 3 次前停一拍：他吸吸鼻子；楊捷睿甩甩水、想一想……有了！
    ...s3.moves,
    { at: BEAT + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: BEAT + 0.05, dur: 0.3, actor: 'yang', do: 'tilt', amount: 6 },
    { at: BEAT + 0.42, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: BEAT + 0.42, dur: 0.22, actor: 'yang', do: 'hop', amount: 2.5 },
    // 跑出去，推一個大紙箱進來
    { at: BEAT + 0.62, actor: 'yang', do: 'flip' },
    { at: BEAT + 0.62, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: BEAT + 0.62, dur: 0.17, actor: 'yang', do: 'moveTo', to: { x: -26, y: PY }, ease: 'in' },
    { at: BOX_IN, actor: 'yang', do: 'flip' },
    { at: BOX_IN, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: BOX_IN, dur: 0.01, actor: 'yang', do: 'moveTo', to: { x: -44, y: PY } },
    { at: BOX_IN + 0.01, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: BX - 21, y: PY }, ease: 'out' },
    { at: BOX_IN, dur: 0.31, actor: 'box', do: 'enter', from: { x: -23, y: BY }, ease: 'out' },
    // 跳進紙箱，蹲下去躲好（只露出頭頂）
    { at: BOX_IN + 0.36, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: BOX_IN + 0.36, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: BX, y: PY }, arc: 9, ease: 'out' },
    { at: BOX_IN + 0.56, dur: 0.15, actor: 'box', do: 'squash', amount: 0.12 },
    { at: HIDE, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    { at: HIDE, dur: 0.1, actor: 'yang', do: 'moveTo', to: { x: BX, y: PY + 4 } },
    // 他不哭了，好奇地歪頭看：人呢？紙箱偷偷抖一下
    { at: HIDE + 0.02, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
    { at: HIDE + 0.05, dur: 0.35, actor: 'rex', do: 'tilt', amount: -6 },
    { at: BOO - 0.2, dur: 0.18, actor: 'box', do: 'shake', amount: 1 },
    // 「哇！」張開雙手跳出來——真的把他嚇到了，嚇得跳起來發抖
    { at: BOO, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: BOO, dur: 0.12, actor: 'yang', do: 'moveTo', to: { x: BX, y: PY - 3 }, ease: 'out' },
    { at: BOO, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    { at: BOO, dur: 0.2, actor: 'box', do: 'hop', amount: 2 },
    { at: BOO + 0.04, actor: 'rex', do: 'swap', emoji: 'hero:rex/scared' },
    { at: BOO + 0.04, dur: 0.22, actor: 'rex', do: 'hop', amount: 5 },
    { at: BOO + 0.26, dur: 0.18, actor: 'rex', do: 'shake', amount: 0.9 },
    // 第 3 次：哇——！噴到畫面頂；楊捷睿被淋得傻眼
    ...g3.moves,
    { at: C3 + 0.08, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 淚水淹到膝蓋：紙箱載著他浮起來，變成小船，一晃一晃
    { at: C3 + 0.35, dur: 0.35, actor: 'box', do: 'moveTo', to: { x: BX, y: BY - FLOAT }, ease: 'out' },
    { at: C3 + 0.35, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: BX, y: PY - 7 - FLOAT }, ease: 'out' },
    { at: C3 + 0.7, dur: 0.4, actor: 'box', do: 'tilt', amount: 5, times: 2 },
    { at: C3 + 0.7, dur: 0.4, actor: 'yang', do: 'tilt', amount: 5, times: 2 },
    // 國字要放大到中間：他哭著退到右邊，小船漂到左邊
    { at: HOME - 0.36, dur: 0.34, actor: 'rex', do: 'moveTo', to: { x: RSIDE, y: P }, ease: 'inOut' },
    { at: HOME - 0.3, dur: 0.32, actor: 'box', do: 'moveTo', to: { x: 22, y: BY - FLOAT }, ease: 'inOut' },
    { at: HOME - 0.3, dur: 0.32, actor: 'yang', do: 'moveTo', to: { x: 22, y: PY - 7 - FLOAT }, ease: 'inOut' },
    { at: HOME + 0.05, dur: PARK - HOME - 0.1, actor: 'rex', do: 'shake', amount: 0.5 },
    { at: HOME + 0.3, dur: 0.4, actor: 'box', do: 'tilt', amount: -4, times: 2 },
    { at: HOME + 0.3, dur: 0.4, actor: 'yang', do: 'tilt', amount: -4, times: 2 },
    // 語詞那一刻：國字讓位，他回到畫面中間，張嘴大哭、噴泉噴著；楊捷睿在小船上抱著頭摀耳朵
    { at: PARK, dur: 0.36, actor: 'rex', do: 'moveTo', to: { x: RX, y: P }, ease: 'inOut' },
    { at: PARK, dur: 0.36, actor: 'box', do: 'moveTo', to: { x: BX - 4, y: BY - FLOAT }, ease: 'inOut' },
    { at: PARK, dur: 0.36, actor: 'yang', do: 'moveTo', to: { x: BX - 4, y: PY - 7 - FLOAT }, ease: 'inOut' },
    { at: WORD - 0.24, dur: 0.22, actor: 'rex', do: 'squash', amount: -0.12 },
    { at: WORD, dur: DW, actor: 'rex', do: 'shake', amount: 0.7 },
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: WORD, dur: DW, actor: 'yang', do: 'shake', amount: 0.5 },
    // 回馬槍：楊捷睿沒招了，從小船跳出來，把自己的冰淇淋遞給他；小船漂走
    ...s4.moves,
    { at: GIVE, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: GIVE, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: YG, y: PY }, arc: 7, ease: 'out' },
    { at: GIVE + 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: GIVE + 0.1, dur: 0.5, actor: 'box', do: 'moveTo', to: { x: -32, y: BY - FLOAT }, ease: 'in' },
    { at: GIVE + 0.24, dur: 0.01, actor: 'cone', do: 'moveTo', to: { x: YG + 15, y: PY - 6 } },
    { at: GIVE + 0.24, dur: 0.01, actor: 'cone', do: 'rotateTo', amount: 180 },
    { at: GIVE + 0.25, dur: 0.18, actor: 'cone', do: 'pop' },
    // 他吸吸鼻子、伸手接過來（眼淚停了）
    { at: GIVE + 0.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
    { at: GIVE + 0.45, dur: 0.15, actor: 'cone', do: 'moveTo', to: MOUTH, ease: 'inOut' },
    // 一口吃掉，開心地跳；水退了，楊捷睿鬆一口氣
    { at: EAT, actor: 'rex', do: 'swap', emoji: 'hero:rex/eat' },
    { at: EAT + 0.02, dur: 0.1, actor: 'cone', do: 'vanish' },
    { at: EAT + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    // 第 4 次：太開心了，「哇——！」笑著又噴出兩道眼淚，全淋在楊捷睿身上
    ...g4.moves,
    { at: C4 + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: C4 + 0.12, dur: 0.2, actor: 'yang', do: 'squash', amount: 0.18 },
    { at: C4 + 0.15, dur: 0.2, actor: 'rex', do: 'hop', amount: 2 },
    { at: C4 + 0.4, dur: 0.2, actor: 'rex', do: 'hop', amount: 2 },
    // 兩個人一起笑；小恐龍開心地跑出右邊
    { at: C4 + D4 - 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: C4 + D4, actor: 'rex', do: 'flip' },
    { at: C4 + D4, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: C4 + D4, dur: 0.22, actor: 'rex', do: 'moveTo', to: { x: 205, y: P }, ease: 'in' },
    // 問他：楊捷睿走到左前方、放大，轉向觀眾
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ASK + 0.05, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: AX, y: PY - 1 }, arc: 6, ease: 'out' },
    { at: ASK + 0.35, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.7, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場（往左跑出去），畫面只留下字
    { at: ANSWER + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.12, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.12, dur: 0.18, actor: 'yang', do: 'moveTo', to: { x: -45, y: PY - 1 }, ease: 'in' },
  ],
  builds: [
    // 兩個口是兩隻哭得張開的眼睛：左邊的口從左眼、右邊的口從右眼飛進字框
    { at: C1 + 0.12, dur: 0.5, strokes: [0, 1, 2], from: EYE_L, color: partColor('口') },
    { at: C2 + 0.12, dur: 0.5, strokes: [3, 4, 5], from: EYE_R, color: partColor('口') },
    // 犬：從他張大的嘴飛出來；那一點是一滴從最高的噴泉掉下來的眼淚
    { at: C3 + 0.12, dur: 0.45, strokes: [6, 7, 8], from: MOUTH, color: partColor('犬') },
    { at: C3 + 0.45, dur: 0.4, strokes: [9], from: TEARDROP, color: partColor('犬') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['yang'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 眼淚噴泉（四次＋語詞那一刻）
    ...all.flatMap((g) => g.fx),
    ...fountain(WORD, DW, WORD_LEVEL, 2),
    // 地上的淚水：腳邊一灘 → 一片水 → 淹到膝蓋；冰淇淋一吃到就退
    ...water(C1 + 0.3, C2 + 0.3, [76], 2.4, RX - 24, RX + 22),
    ...water(C2 + 0.25, DRAIN, SHEET),
    ...water(C3 + 0.3, DRAIN, KNEE),
    // 冰淇淋「啪」
    { at: DROP, kind: 'burst', x: SPLAT.x, y: SPLAT.y, n: 1, dur: 0.35, scale: 1.3 },
    // 想到辦法了
    { at: C1 + 0.5, dur: 0.4, kind: 'pop', actor: 'yang', emoji: '💡', dx: -10, scale: 1.4 },
    // 氣球：他伸手拿著走過去——「啪！」
    { at: C1 + D1, dur: BANG - C1 - D1 + 0.04, kind: 'pop', actor: 'yang', emoji: '🎈', ...BALLOON },
    { at: BANG, kind: 'burst', x: YG + 15, y: 42, n: 1, dur: 0.4, scale: 2.2 },
    // 被淋濕：水花、頭髮滴水
    { at: C2 + 0.2, dur: 0.5, kind: 'burst', actor: 'yang', emoji: '💦', n: 6, dy: 14, scale: 1.1 },
    { at: C2 + 0.5, dur: 0.8, kind: 'rain', actor: 'yang', n: 6 },
    // 停一拍：有了！
    { at: BEAT + 0.42, dur: 0.35, kind: 'pop', actor: 'yang', emoji: '💡', dx: -10, scale: 1.4 },
    // 「哇！」跳出來
    { at: BOO, dur: 0.4, kind: 'burst', x: BX + 4, y: 34, n: 7, emoji: '✨', scale: 1.1 },
    { at: BOO + 0.06, dur: 0.38, kind: 'pop', actor: 'rex', emoji: '❗', dx: -16, dy: 6, scale: 1.8 },
    // 第 3 次：他在紙箱裡被淋；一滴大眼淚掉下來（犬的那一點）
    { at: C3 + 0.2, dur: 0.5, kind: 'burst', actor: 'yang', emoji: '💦', n: 7, dy: 12, scale: 1.2 },
    { at: C3 + 0.3, dur: 0.22, kind: 'pop', x: TEARDROP.x - 6, y: TEARDROP.y + 6, emoji: '💧', scale: 1.7 },
    // 回馬槍：開心的眼淚，愛心；楊捷睿又被淋
    { at: C4 + 0.05, dur: 0.55, kind: 'burst', x: RX - 4, y: 50, emoji: '💕', n: 6, scale: 1.3 },
    { at: C4 + 0.15, dur: 0.45, kind: 'burst', actor: 'yang', emoji: '💦', n: 7, dy: 14, scale: 1.2 },
  ],
  camera: [
    // 鏡頭鎖全景（噴泉往兩邊、往上噴，整道都要在畫面裡），只有哇的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: BANG, dur: 0.25, do: 'shake', amount: 0.8 },
    { at: WORD, dur: 0.35, do: 'shake', amount: 1.1 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: DROP, sfx: 'plop' },
    ...all.flatMap((g) => g.cues),
    { at: C1 + 0.03, say: '哭' },
    ...s2.cues,
    { at: C1 + 0.5, sfx: 'blip' },
    { at: BANG, sfx: 'crack' },
    ...s3.cues,
    { at: BEAT + 0.42, sfx: 'blip' },
    { at: BOX_IN, sfx: 'whoosh' },
    { at: BOX_IN + 0.56, sfx: 'tap' },
    { at: BOO, sfx: 'boing' },
    { at: HOME + 0.05, say: '哭' },
    { at: WORD, say: '大哭' },
    { at: WORD + 0.02, sfx: 'deflate' },
    ...s4.cues,
    { at: GIVE + 0.25, sfx: 'blip' },
    { at: EAT, sfx: 'gulp' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '哭' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
