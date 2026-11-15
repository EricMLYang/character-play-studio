import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 豆（v2）：楊捷睿拿著一個鼓鼓的豌豆莢，對著前面好奇地用力一捏——豆莢鼓起來、抖一抖，「啵！」一顆圓圓的綠豆子像子彈一樣射出去，
// 拉出一條粗粗的綠線，彈一下「叮」，「叩」打中正在拿放大鏡辦案的豬探長，他嚇得跳起來傻眼，楊捷睿摀嘴偷笑。
// 同一個動作四次，一次比一次慘：彈一下地板打中鼻子（一橫）→ 連續三顆「啵啵啵」，豬探長跳、蹲、跑，一顆都沒躲掉（口的三筆，一顆一筆）→
// 先停一拍：豬探長推來一顆大石頭、躲在後面只露出帽子，楊捷睿瞄半天⋯⋯豆子打到石頭、彈到畫面頂、彈到畫面邊，繞一圈從背後打中他（下面兩點一橫）。
// 語詞那一刻豆莢飛到畫面中間、變大：「豌豆」。
// 回馬槍（第四次）：豬探長生氣地把豆莢搶過來、對著楊捷睿用力一捏——「噗」，沒東西出來；他把豆莢轉過來、拿放大鏡湊近看，
// 「啵！」一顆大豆子正中他自己的臉，豆莢往後噴飛，他頭暈坐倒，楊捷睿大笑。
// 最後畫面暗下來只剩「豆」，兩個人問「這是什麼字？」，手放耳邊等他回答，再指著字說「豆！」，然後退場只留字。
// 刻意不跟「丟」（丟出去狗撿回來）、「頭」（東西從天上砸頭腫包）、「森」（澆水長樹頂飛）撞：這支只演「一捏→啵→豆子射出去打中」。
// 豆、豆、豌豆、這是什麼字？、豆

/** 兩個明星一樣大，面對面 */
const S = 38
const GY = 77 - 0.42 * S
/** 楊捷睿每次都站在左邊（朝右）、豬探長在右邊（朝左） */
const XY = 28
const XP = 126
/** 豆莢：拿在楊捷睿伸出去的手上，尖端朝右 */
const POD = 26
const HOLD: Vec = { x: XY + 22, y: GY + 2 }
/** 豆子射出來的地方（豆莢朝右的那一端） */
const MUZ: Vec = { x: HOLD.x + 12, y: HOLD.y - 1 }
/** 豆子：亮綠的圓球 */
const BEAN = 12
/** 豆子飛多快（舞台單位／秒）：快，但 0.25 秒一格的總覽上軌跡還在 */
const V = 330
/** 軌跡：粗粗的亮綠線 */
const TRAIL = '#27A844'
/** 預備：豆莢鼓起來、抖，停這麼久才「啵」 */
const SQ = 0.4
const SWELL = 1.25
/** 大石頭（第三次躲在後面）：畫在豬探長前面 */
const ROCK = 36
const RY = 77 - 0.42 * ROCK
const XR = 132
/** 躲在石頭後面：蹲低只露出帽子 */
/** 藏在楊捷睿背後 */
const BACK: Vec = { x: XY - 13, y: GY + 3 }
/** 站在石頭上面 */
const ON_ROCK = RY - 0.283 * ROCK - 0.42 * S + 3
const HIDE: Vec = { x: XR + 1, y: GY - 6 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }
const empty = (): Gag => ({ moves: [], fx: [], camera: [], cues: [], lights: [] })
const join = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera),
  cues: gs.flatMap((g) => g.cues), lights: gs.flatMap((g) => g.lights),
})
const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y)

/** 預備：兩手用力捏，豆莢鼓起來、抖（k 越大抖得越厲害）。who 是捏的人 */
function squeeze(at: number, k: number, who: 'yang' | 'pig' = 'yang', dur = SQ): Gag {
  const g = empty()
  g.moves.push(
    { at, actor: who, do: 'swap', emoji: `hero:${who}/push` },
    { at, dur: 0.2, actor: 'pod', do: 'scaleTo', amount: SWELL, ease: 'back' },
    { at: at + 0.08, dur: dur - 0.1, actor: 'pod', do: 'shake', amount: 0.5 + 0.2 * k },
    { at: at + 0.05, dur: dur - 0.1, actor: who, do: 'shake', amount: 0.25 + 0.1 * k },
  )
  return g
}

/**
 * 啵！（每一次都一樣）：豆莢一縮、同一個「啵」、鏡頭推一下，豆子從 from 射出去，沿著 pts 一段一段直線飛（每一段留一條粗綠線），
 * 中間的點彈一下「叮」，最後一點「叩」打中（💥＋震）。打中以後豆子彈到 off 飛走。回傳打中的時間。
 */
function shoot(at: number, k: number, pts: Vec[], o: { from?: Vec; off?: Vec; offDur?: number; reswell?: boolean; fade?: number } = {}): Gag & { hit: number } {
  const g = empty()
  const from = o.from ?? MUZ
  g.moves.push(
    { at, dur: 0.07, actor: 'pod', do: 'scaleTo', amount: 1 / SWELL, ease: 'out' },
    { at, dur: 0.2, actor: 'pod', do: 'squash', amount: 0.2 },
    { at: at - 0.02, dur: 0.01, actor: 'bean', do: 'moveTo', to: from },
    { at: at - 0.01, dur: 0.04, actor: 'bean', do: 'pop' },
  )
  // 連發：射完馬上又鼓起來
  if (o.reswell) g.moves.push({ at: at + 0.1, dur: 0.18, actor: 'pod', do: 'scaleTo', amount: SWELL, ease: 'back' })
  let t = at
  let prev = from
  const legs: { t: number; a: Vec; b: Vec }[] = []
  pts.forEach((p, i) => {
    const d = dist(prev, p) / V
    g.moves.push({ at: t, dur: d, actor: 'bean', do: 'moveTo', to: p, ease: 'linear' })
    legs.push({ t, a: prev, b: p })
    t += d
    if (i < pts.length - 1) {
      // 叮：彈一下
      g.fx.push({ at: t, dur: 0.4, kind: 'burst', x: p.x, y: p.y, n: 1, emoji: '✨', scale: 1.1 })
      g.cues.push({ at: t, sfx: 'clink' })
    }
    prev = p
  })
  const hit = t
  const fade = o.fade ?? 0.4
  for (const l of legs) {
    g.fx.push({ at: l.t, dur: hit + fade - l.t, kind: 'line', actor: 'yang', dx: l.a.x - XY, dy: l.a.y - GY, to: l.b, color: TRAIL, width: 2.6 })
  }
  // 叩！
  const off = o.off ?? { x: prev.x + 12, y: -14 }
  const offDur = o.offDur ?? 0.25
  g.moves.push(
    { at: hit, dur: offDur, actor: 'bean', do: 'moveTo', to: off, ease: 'out' },
    { at: hit + offDur, dur: 0.01, actor: 'bean', do: 'vanish' },
  )
  g.fx.push(
    { at, dur: 0.25, kind: 'burst', x: from.x + 3, y: from.y - 7, n: 1, scale: 0.8 },
    { at: hit, dur: 0.35, kind: 'burst', x: prev.x, y: prev.y - 3, n: 1, scale: 1.1 + 0.25 * k },
  )
  g.camera.push(
    { at, dur: 0.3, do: 'punch', amount: 0.07 + 0.02 * k, to: { x: from.x + 10, y: from.y - 6 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  )
  // 淡淡的白光：不要把主角刷白
  g.lights.push({ at, dur: 0.04, level: -0.06 }, { at: at + 0.04, dur: 0.15, level: 0 })
  g.cues.push({ at, sfx: 'plop' }, { at: hit, sfx: 'bonk' })
  return { ...g, hit }
}

/** 楊捷睿摀嘴偷笑（第三次以後捧腹大笑） */
const giggle = (at: number, k: number): Move[] => [
  { at, actor: 'yang', do: 'swap', emoji: k >= 2 ? 'hero:yang/laugh' : 'hero:yang/giggle' },
  { at: at + 0.1, dur: 0.3, actor: 'yang', do: 'shake', amount: 0.3 },
]

// ---- 時間表 ----
// 第一次：一顆。彈一下地板，打中鼻子（放大鏡掉了）
const P1 = 1.3
const NOSE: Vec = { x: XP - 7, y: GY - 6 }
const s1 = shoot(P1, 0, [{ x: 98, y: 73 }, NOSE], { off: { x: XP - 30, y: -14 } })
// 第二次：啵、啵、啵。他跳、蹲、跑，一顆都沒躲掉
const Q2 = 2.35
const GAP = 0.34
const P2 = [Q2 + SQ, Q2 + SQ + GAP, Q2 + SQ + 2 * GAP]
const X2 = [XP, XP + 4, XP + 9]
const T2: Vec[] = [{ x: X2[0] - 6, y: GY - 5 }, { x: X2[1] - 5, y: GY }, { x: X2[2] - 7, y: GY + 7 }]
const s2 = P2.map((p, i) => shoot(p, 1, [T2[i]], { offDur: 0.1, off: { x: T2[i].x - 8, y: T2[i].y - 26 }, reswell: i < 2, fade: 0.3 }))
// 第三次：先停一拍——他推來一顆大石頭躲在後面，楊捷睿瞄半天
const T3 = s2[2].hit + 0.6
const P3 = T3 + 1.4
const BUTT: Vec = { x: HIDE.x + 8, y: GY - 4 }
const s3 = shoot(P3, 2, [{ x: XR - 17, y: 60 }, { x: 108, y: 8 }, { x: 152, y: 34 }, BUTT], { off: { x: 175, y: 20 } })
/** 拼好：國字放大到中間 */
const HOME = s3.hit + 0.6
const PARK = HOME + 0.7
/** 語詞那一刻：豆莢飛到畫面中間、變大 */
const WORD = PARK + 0.45
const BIG = 1.75
const SHOW: Vec = { x: 80, y: 62 }
/** 回馬槍：豬探長把豆莢搶過來，對著楊捷睿一捏——噗，沒東西；轉過來湊近看，啵！打中自己的臉 */
const T4 = WORD + 0.45
const XG = 108
const GRAB: Vec = { x: XG - 23, y: GY + 2 }
const Q4 = T4 + 0.35
const PFFT = Q4 + SQ
const LOOK = PFFT + 0.35
const P4 = LOOK + 0.4
const XL = 104
const FACE: Vec = { x: XL - 4, y: GY - 7 }
const STUCK = 0.4
const ASK = P4 + STUCK + 0.45
/** 問句唸完（0.97 秒）再安靜 1.5 秒以上才回答 */
const ANSWER = ASK + 0.05 + 0.974 + 1.53
/** 問他：兩個人放大，分站國字兩邊 */
const AS = 1.22
const APY = 77 - 0.42 * S * AS

const clip: Clip = {
  format: 2,
  char: '豆',
  meta: { theme: '豌豆莢一捏，豆子射出去', cast: '楊捷睿＋豬探長＋豌豆莢＋豆子＋大石頭', gags: ['楊捷睿拿著鼓鼓的豌豆莢用力一捏，豆莢鼓起來抖一抖，啵地一顆豆子像子彈一樣射出去、拉出一條粗綠線，彈一下叮、叩地打中豬探長，他嚇得跳起來傻眼，楊捷睿摀嘴偷笑（彈一下地板打中鼻子→連續三顆啵啵啵，他跳、蹲、跑一顆都沒躲掉→停一拍：他推來大石頭躲在後面只露帽子，豆子打到石頭、彈到畫面頂、彈到畫面邊，繞一圈從背後打中他）；回馬槍是豬探長把豆莢搶過來對著楊捷睿一捏，噗地沒東西，他把豆莢轉過來拿放大鏡湊近看，啵地打中自己的臉'] },
  duration: 14.7,
  // 菜園：淺藍的天、土色的地（亮綠的豆子、綠線看得清楚）
  bg: { top: '#CDEBFF', bottom: '#F6FBFF', floor: '#DCC79C', scenery: 'hills' },
  actors: [
    { id: 'yang', emoji: 'hero:yang/reach', x: XY, y: GY, size: S, hidden: true, flip: true },
    { id: 'pig', emoji: 'hero:pig/think', x: XP, y: GY, size: S },
    // 3D 圖的豆莢是斜的（尖端在左下）：翻過來再轉 45 度，尖端才朝右
    { id: 'pod', emoji: '🫛', x: HOLD.x, y: HOLD.y, size: POD, hidden: true, float: true, pivot: 'center', flip: true },
    { id: 'rock', emoji: 'prop:rock', x: XR, y: RY, size: ROCK, hidden: true, pivot: 'center' },
    { id: 'bean', emoji: '🟢', x: MUZ.x, y: MUZ.y, size: BEAN, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：楊捷睿拿著豆莢走進來；豬探長在右邊拿放大鏡辦案
    { at: 0, dur: 0.45, actor: 'yang', do: 'enter', from: { x: -30, y: GY }, ease: 'out' },
    { at: 0, dur: 0.01, actor: 'pod', do: 'rotateTo', amount: -45 },
    { at: 0, dur: 0.45, actor: 'pod', do: 'enter', from: { x: -30 + 22, y: HOLD.y }, ease: 'out' },
    { at: 0.5, dur: 0.3, actor: 'pod', do: 'hop', amount: 3 },

    // 第一次
    ...squeeze(P1 - SQ, 0).moves,
    ...s1.moves,
    { at: s1.hit, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: s1.hit, dur: 0.35, actor: 'pig', do: 'hop', amount: 6 },
    ...giggle(s1.hit + 0.12, 0),
    { at: s1.hit + 0.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: s1.hit + 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },

    // 第二次：啵啵啵
    ...squeeze(Q2, 1).moves,
    ...s2.flatMap((s) => s.moves),
    // 跳
    { at: P2[0] - 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: P2[0] - 0.05, dur: 0.36, actor: 'pig', do: 'hop', amount: 7 },
    // 蹲
    { at: P2[1] - 0.06, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: P2[1] - 0.06, dur: 0.14, actor: 'pig', do: 'moveTo', to: { x: X2[1], y: GY }, ease: 'out' },
    // 跑
    { at: P2[2] - 0.06, actor: 'pig', do: 'swap', emoji: 'hero:pig/flee' },
    { at: P2[2] - 0.06, dur: 0.16, actor: 'pig', do: 'moveTo', to: { x: X2[2], y: GY }, ease: 'out' },
    { at: s2[0].hit, dur: 0.12, actor: 'pig', do: 'shake', amount: 0.6 },
    { at: s2[1].hit, dur: 0.12, actor: 'pig', do: 'shake', amount: 0.6 },
    { at: s2[2].hit, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: s2[2].hit, dur: 0.45, actor: 'pig', do: 'hop', amount: 13 },
    ...giggle(s2[2].hit + 0.12, 1),

    // 第三次：停一拍。豬探長跑出去，推一顆大石頭回來，躲在後面
    { at: T3, actor: 'pig', do: 'flip' },
    { at: T3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: T3, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: 188, y: GY }, ease: 'in' },
    { at: T3 + 0.22, actor: 'pig', do: 'flip' },
    { at: T3 + 0.22, actor: 'pig', do: 'swap', emoji: 'hero:pig/push' },
    { at: T3 + 0.24, dur: 0.34, actor: 'rock', do: 'enter', from: { x: 200, y: RY }, ease: 'out' },
    { at: T3 + 0.24, dur: 0.34, actor: 'pig', do: 'moveTo', to: { x: XR + 24, y: GY }, ease: 'out' },
    { at: T3 + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/peek' },
    { at: T3 + 0.6, dur: 0.15, actor: 'pig', do: 'moveTo', to: HIDE, ease: 'out' },
    // 楊捷睿想一想……瞄：豆莢上、下、對準
    { at: T3 + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: T3 + 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: T3 + 0.65, dur: 0.15, actor: 'pod', do: 'rotateTo', amount: -14 },
    { at: T3 + 0.85, dur: 0.15, actor: 'pod', do: 'rotateTo', amount: 22 },
    { at: T3 + 0.95, dur: 0.1, actor: 'pod', do: 'rotateTo', amount: -8 },
    ...squeeze(P3 - SQ, 2).moves,
    ...s3.moves,
    // 從背後被打中：整個人跳起來，落在石頭上面，傻眼
    { at: s3.hit, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: s3.hit, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: HIDE.x, y: ON_ROCK - 14 }, ease: 'out' },
    { at: s3.hit + 0.2, dur: 0.18, actor: 'pig', do: 'moveTo', to: { x: HIDE.x, y: ON_ROCK }, ease: 'in' },
    ...giggle(s3.hit + 0.12, 2),

    // 拼好：兩個人在兩邊
    // 豬探長氣得把沒用的石頭一腳踢飛
    { at: HOME + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/stomp' },
    { at: HOME + 0.4, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: HIDE.x, y: GY }, ease: 'in' },
    { at: HOME + 0.35, actor: 'pig', do: 'flip' },
    { at: HOME + 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/kick' },
    { at: HOME + 0.38, dur: 0.3, actor: 'rock', do: 'moveTo', to: { x: 215, y: RY - 30 }, ease: 'out' },
    { at: HOME + 0.38, dur: 0.3, actor: 'rock', do: 'rotateTo', amount: 200, ease: 'out' },
    { at: HOME + 0.7, dur: 0.01, actor: 'rock', do: 'vanish' },
    // 楊捷睿趕快把豆莢藏到背後，裝沒事
    { at: HOME - 0.12, dur: 0.15, actor: 'pod', do: 'moveTo', to: BACK },
    { at: HOME - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    // 語詞那一刻：豆莢拋到畫面中間、變大——豌豆！豬探長從石頭後面走出來看
    { at: PARK + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: PARK + 0.15, dur: 0.28, actor: 'pod', do: 'moveTo', to: SHOW, ease: 'out' },
    { at: PARK + 0.15, dur: 0.28, actor: 'pod', do: 'scaleTo', amount: BIG, ease: 'back' },
    { at: PARK, actor: 'pig', do: 'flip' },
    { at: PARK, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: PARK, dur: 0.3, actor: 'pig', do: 'moveTo', to: { x: XP, y: GY } },
    { at: PARK + 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: WORD, dur: 0.3, actor: 'pod', do: 'hop', amount: 3 },
    { at: WORD, dur: 0.3, actor: 'yang', do: 'hop', amount: 4 },

    // 回馬槍：豬探長生氣，把豆莢搶過來，對著楊捷睿
    { at: T4, actor: 'pig', do: 'swap', emoji: 'hero:pig/angry' },
    { at: T4, dur: 0.15, actor: 'pig', do: 'hop', amount: 3 },
    { at: T4 + 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: T4 + 0.15, dur: 0.15, actor: 'pig', do: 'moveTo', to: { x: XG, y: GY }, ease: 'out' },
    { at: T4 + 0.2, dur: 0.15, actor: 'pod', do: 'scaleTo', amount: 1 / BIG },
    { at: T4 + 0.2, dur: 0.15, actor: 'pod', do: 'moveTo', to: GRAB },
    { at: T4 + 0.2, actor: 'pod', do: 'flip' },
    { at: T4 + 0.2, dur: 0.01, actor: 'pod', do: 'rotateTo', amount: 90 },
    { at: T4 + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: Q4, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    ...squeeze(Q4, 3, 'pig').moves,
    // 噗……沒東西出來
    { at: PFFT, dur: 0.25, actor: 'pod', do: 'scaleTo', amount: 1 / SWELL },
    { at: PFFT + 0.08, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: PFFT + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    // 把豆莢轉過來，拿放大鏡湊近看
    { at: LOOK, actor: 'pod', do: 'flip' },
    { at: LOOK, dur: 0.01, actor: 'pod', do: 'rotateTo', amount: -90 },
    { at: LOOK, dur: 0.2, actor: 'pod', do: 'hop', amount: 3 },
    { at: LOOK, dur: 0.2, actor: 'pod', do: 'moveTo', to: { x: XL - 28, y: GY + 1 } },
    { at: LOOK, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: LOOK, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: XL, y: GY } },
    { at: P4 - 0.15, dur: 0.15, actor: 'pod', do: 'scaleTo', amount: SWELL, ease: 'back' },
    // 啵！大豆子正中他的臉，黏住半秒；豆莢往後噴飛
    { at: P4, dur: 0.07, actor: 'pod', do: 'scaleTo', amount: 1 / SWELL },
    { at: P4 - 0.02, dur: 0.01, actor: 'bean', do: 'moveTo', to: { x: XL - 16, y: GY } },
    { at: P4 - 0.01, dur: 0.04, actor: 'bean', do: 'pop' },
    { at: P4, dur: 0.06, actor: 'bean', do: 'moveTo', to: FACE, ease: 'linear' },
    { at: P4, dur: 0.1, actor: 'bean', do: 'scaleTo', amount: 1.7, ease: 'back' },
    { at: P4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: P4 + 0.03, dur: 0.3, actor: 'pig', do: 'shake', amount: 0.8 },
    { at: P4 + 0.02, dur: 0.3, actor: 'pod', do: 'moveTo', to: { x: -35, y: 40 }, ease: 'out' },
    { at: P4 + 0.02, dur: 0.3, actor: 'pod', do: 'rotateTo', amount: -540, ease: 'out' },
    { at: P4 + 0.33, dur: 0.01, actor: 'pod', do: 'vanish' },
    // 豆子彈走，他頭暈坐倒；楊捷睿大笑
    { at: P4 + STUCK, dur: 0.3, actor: 'bean', do: 'moveTo', to: { x: XL + 30, y: -16 }, ease: 'out' },
    { at: P4 + STUCK + 0.3, dur: 0.01, actor: 'bean', do: 'vanish' },
    { at: P4 + STUCK, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: P4 + STUCK, dur: 0.25, actor: 'pig', do: 'moveTo', to: { x: XL + 10, y: GY }, arc: 4, ease: 'out' },
    { at: P4 + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: P4 + 0.25, dur: 0.4, actor: 'yang', do: 'shake', amount: 0.4 },

    // 問他：兩個人分站國字兩邊、放大，轉向觀眾
    { at: ASK + 0.45, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: 26, y: APY }, ease: 'out' },
    { at: ASK + 0.45, dur: 0.25, actor: 'yang', do: 'scaleTo', amount: AS },
    { at: ASK + 0.45, dur: 0.25, actor: 'pig', do: 'moveTo', to: { x: 134, y: APY }, ease: 'out' },
    { at: ASK + 0.45, dur: 0.25, actor: 'pig', do: 'scaleTo', amount: AS },
    { at: ASK + 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 1.7, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 2.2, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    { at: ANSWER, dur: 0.3, actor: 'pig', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ANSWER + 0.12, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -40, y: APY }, ease: 'in' },
    { at: ANSWER + 0.12, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: 215, y: APY }, ease: 'in' },
  ],
  builds: [
    // 每一顆豆子打中的那一下，飛出一組筆畫：一橫 → 口（三顆各一筆）→ 下面兩點一橫
    { at: s1.hit + 0.05, dur: 0.4, strokes: [0], from: NOSE, color: partColor('豆') },
    { at: s2[0].hit + 0.03, dur: 0.3, strokes: [1], from: T2[0], color: partColor('豆') },
    { at: s2[1].hit + 0.03, dur: 0.3, strokes: [2], from: T2[1], color: partColor('豆') },
    { at: s2[2].hit + 0.03, dur: 0.3, strokes: [3], from: T2[2], color: partColor('豆') },
    { at: s3.hit + 0.05, dur: 0.45, strokes: [4, 5, 6], from: BUTT, color: partColor('豆') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.3, do: 'park' },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang', 'pig'], to: { x: 80, y: 42 }, amount: 0.78 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: ANSWER + 0.6, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    ...s2.flatMap((s) => s.fx),
    { at: T3 + 0.75, dur: 0.5, kind: 'pop', actor: 'yang', emoji: '❓', dx: 6, scale: 1.3 },
    ...s3.fx,
    { at: WORD, dur: 0.6, kind: 'burst', x: SHOW.x, y: SHOW.y - 6, n: 8, emoji: '✨', scale: 1.6 },
    { at: T4, dur: 0.4, kind: 'pop', actor: 'pig', emoji: '💢', dx: 6, scale: 1.3 },
    // 噗：只冒一小團煙
    { at: PFFT, dur: 0.45, kind: 'puff', x: GRAB.x - 14, y: GRAB.y },
    { at: PFFT + 0.1, dur: 0.5, kind: 'pop', actor: 'pig', emoji: '❓', dx: 6, scale: 1.3 },
    // 啵！打中自己的臉
    { at: P4, dur: 0.3, kind: 'burst', x: FACE.x - 4, y: FACE.y - 12, n: 1, scale: 1.8 },
    { at: P4 + STUCK, dur: 0.6, kind: 'dizzy', actor: 'pig' },
    { at: ANSWER, dur: 0.3, kind: 'burst', x: 80, y: 40, emoji: '🌟', n: 10 },
  ],
  camera: [
    // 鏡頭鎖全景（豆子會彈到畫面頂和畫面邊），只有啵那一下推近、打中那一下震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...s1.camera,
    ...s2.flatMap((s) => s.camera),
    ...s3.camera,
    { at: P4, dur: 0.4, do: 'punch', amount: 0.14, to: { x: FACE.x, y: FACE.y } },
    { at: P4, dur: 0.35, do: 'shake', amount: 1.9 },
  ],
  lights: [
    ...s1.lights,
    ...s2.flatMap((s) => s.lights),
    ...s3.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: P4, dur: 0.04, level: -0.06 },
    { at: P4 + 0.04, dur: 0.15, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '豆' },
    ...s1.cues,
    ...s2.flatMap((s) => s.cues),
    { at: T3 + 0.24, sfx: 'slide' },
    { at: T3 + 0.75, sfx: 'gulp' },
    ...s3.cues,
    { at: HOME + 0.1, say: '豆' },
    { at: HOME + 0.38, sfx: 'bonk' },
    { at: WORD, say: '豌豆' },
    { at: T4 + 0.2, sfx: 'whoosh' },
    { at: PFFT, sfx: 'deflate' },
    { at: P4, sfx: 'plop' },
    { at: P4 + 0.05, sfx: 'bonk' },
    { at: P4 + 0.1, sfx: 'rumble' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '豆' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
