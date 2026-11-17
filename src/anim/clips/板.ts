import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 板（v2）：地上躺著一塊又長又粗的大木板。小骷髏每次要往右走，一腳踩到木板這一頭——
// 另一頭「咻」地翹起來、整塊翻上來「啪！」打在他臉上，一次比一次用力（踩得一次比一次重）：
// 走過去踩到，臉被打一下、晃一晃退兩步（木）→ 衝過去踩，被打得往後一屁股跌坐（反的上半）→
// 先停一拍：他叉腰瞪著木板、氣得跺腳——跳起來雙腳用力一跺！打得他整個人飛出畫面，木板也翻著跟斗飛上天（反的下半）。
// 國字回中央唸「板」。木板從天上掉下來，他在畫面中間舉高高接住：「木板」。
// 回馬槍（第四次）：他學乖了，一踩下去馬上往後跳開——木板翹起來打空，直直立著搖啊搖，他摀嘴偷笑……
// 木板往他這邊一倒，「啪！」整塊蓋下來，把他壓成一張扁扁的骷髏餅。
// 最後畫面暗下來只剩「板」，小骷髏問「這是什麼字？」，手放耳邊等他回答，再指著字說「板！」，然後退場只留字。
// 刻意不跟「椅」（往後翹椅子）、「枝」（樹枝當跳板彈人）、「浪」（衝浪板）撞：這支是「踩到木板一頭、另一頭翻上來打臉」。
// 木板沒有道具圖，用 tube 畫在看不見的錨點上（照時間切片，跟「枝」的樹枝同一個做法）。
// 板、板、木板、這是什麼字？、板

/** 小骷髏（hero:jerry；圖朝左，整支大多 flip 朝右看著木板） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 木板：又長又粗的淺木頭色 */
const WOOD = '#D9A05B'
const BW = 7
const BL = 56
/** 木板躺在地上時的中心線高度 */
const BY = 73.6
/** 支點：木板左端他踩的那一頭（往右是長的那一截） */
const PX = 54
const LS = 3
const LR = BL - LS
/** 他踩下去時站的位置（臉剛好在木板翻上來的路上） */
const SX = 44
/** 開場、每次被打退後站的地方 */
const X0 = 26

type Ease = 'in' | 'out' | 'inOut' | 'linear'
const EASE: Record<Ease, (p: number) => number> = {
  linear: (p) => p,
  in: (p) => p * p,
  out: (p) => 1 - (1 - p) * (1 - p),
  inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
}

/** 木板的樣子：支點 (x, y)、角度 a（度，0 是往右躺平、往上翹為正）、支點往後的短截 ls、往前的長截 lr */
type BS = { x: number; y: number; a: number; ls: number; lr: number }
const REST: BS = { x: PX, y: BY, a: 0, ls: LS, lr: LR }
const tilt = (a: number): BS => ({ ...REST, a })
const ends = (s: BS): { long: Vec; short: Vec } => {
  const r = (s.a * Math.PI) / 180
  const c = Math.cos(r), n = Math.sin(r)
  return { long: { x: s.x + s.lr * c, y: s.y - s.lr * n }, short: { x: s.x - s.ls * c, y: s.y + s.ls * n } }
}
/** 木板上離支點 d 的那一點（長的那一截） */
const along = (s: BS, d: number): Vec => {
  const r = (s.a * Math.PI) / 180
  return { x: s.x + d * Math.cos(r), y: s.y - d * Math.sin(r) }
}

/** 木板的關鍵格：照時間排好，相鄰兩格之間照後一格的 ease 內插 */
const KEYS: { t: number; s: BS; ease: Ease }[] = []
const key = (t: number, s: BS, ease: Ease = 'inOut') => { KEYS.push({ t, s, ease }) }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 每一次的力道：翻上來的時間（越短越猛）、打過頭的角度 */
const SWING = [0.17, 0.12, 0.09]
const OVER = [112, 116, 121]

/**
 * 同一個「啪！」：他的腳踩到木板這一頭（at），另一頭翻上來打在他臉上，彈回來直直立在他面前，
 * 他傻眼停住（木板沒擋住臉）。k 越大越用力：💥 越大、鏡頭震得越兇、多疊一個音。
 * 回傳打中那一刻 hit。木板之後怎麼倒，各次自己寫。
 */
function whack(at: number, k: number): Gag & { hit: number } {
  const hit = at + SWING[k]
  key(at, REST)
  key(hit, tilt(OVER[k]), 'in')
  // 彈回來，立在他臉前面晃
  key(hit + 0.1, tilt(86), 'out')
  key(hit + 0.2, tilt(92), 'inOut')
  const face = along(tilt(OVER[k]), 17)
  return {
    hit,
    moves: [
      { at: hit, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
      { at: hit, actor: 'jerry', do: 'shake', amount: 0.6 + 0.4 * k, dur: 0.25 },
    ],
    fx: [{ at: hit, kind: 'burst', x: face.x + 6, y: face.y - 4, emoji: '💥', dur: 0.3, scale: 1.1 + 0.55 * k }],
    camera: [
      { at: hit, dur: 0.3, do: 'shake', amount: 1 + 0.8 * k },
      ...(k >= 1 ? [{ at: hit, dur: 0.35, do: 'punch', amount: 0.05 * k, to: { x: SX, y: 55 } } as Camera] : []),
    ],
    cues: [
      { at, sfx: 'tap' },
      { at: at + 0.02, sfx: 'whoosh' },
      { at: hit, sfx: 'bonk' },
      ...(k >= 1 ? [{ at: hit + 0.03, sfx: 'tap' } as Cue] : []),
      ...(k >= 2 ? [{ at: hit + 0.05, sfx: 'crack' } as Cue] : []),
    ],
  }
}

/** 木板倒回地上「咚」、小彈一下 */
function fallBack(at: number): { cues: Cue[]; fx: Fx[] } {
  key(at + 0.22, REST, 'in')
  key(at + 0.32, tilt(5), 'out')
  key(at + 0.42, REST, 'in')
  return {
    cues: [{ at: at + 0.22, sfx: 'plop' }],
    fx: [{ at: at + 0.22, kind: 'puff', x: PX + 36, y: 74, dur: 0.4 }],
  }
}

// ── 開場：走進來，抬頭指著右上角的字框：板！
const SAY1 = 0.55
// ── 第 1 次：走過去踩到，臉被打，晃一晃退兩步
const S1 = 1.1
const g1 = whack(S1, 0)
const BACK1 = g1.hit + 0.35
const f1 = fallBack(BACK1)
// ── 第 2 次：衝過去踩，被打得一屁股跌坐
const RUN2 = BACK1 + 0.5
const S2 = RUN2 + 0.25
const g2 = whack(S2, 1)
const BACK2 = g2.hit + 0.35
const SIT2 = BACK2 + 0.3
const SIT2_X = 22
const f2 = fallBack(BACK2)
// ── 停一拍：站起來叉腰瞪木板，氣得跺腳
const MAD = SIT2 + 0.15
const STOMP = MAD + 0.4
const JUMP3 = STOMP + 0.42
const S3 = JUMP3 + 0.4
// ── 第 3 次：跳起來雙腳一跺！打得他飛出畫面，木板也翻著跟斗飛上天
const g3 = whack(S3, 2)
const FLY3 = g3.hit + 0.35
const OUT3 = FLY3 + 0.5
/** 木板飛上天、出畫面 */
const UP3 = FLY3 + 0.05
const GONE3 = UP3 + 0.4
key(UP3, tilt(92))
key(GONE3, { x: 70, y: -50, a: 92 + 450, ls: LS, lr: LR }, 'out')
/** 字框填滿、國字到正中央（這時畫面上只有字） */
const HOME = OUT3 + 0.05
const PARK = HOME + 0.95
// ── 語詞：他從左邊走回來，木板從天上掉下來，他在畫面中間舉高高接住
const CX = 54
const WALK_IN = PARK + 0.05
const CATCH = WALK_IN + 0.6
const WORD = CATCH
/** 舉高高時木板的樣子：橫在他頭上，左右對稱 */
const HELD: BS = { x: CX - BL / 2, y: 43.5, a: 0, ls: 0, lr: BL }
key(CATCH - 0.4, { ...HELD, y: -12 })
key(CATCH, HELD, 'in')
key(CATCH + 0.08, { ...HELD, y: HELD.y + 2 }, 'out')
key(CATCH + 0.18, HELD, 'out')
// 放回原來的地方
const PUT = WORD + 0.6
key(PUT, HELD)
key(PUT + 0.3, { x: PX - LS, y: BY, a: 0, ls: 0, lr: BL }, 'inOut')
key(PUT + 0.31, REST)
const BACKOFF = PUT + 0.35
// ── 回馬槍（第 4 次）：踮腳過去，一踩馬上往後跳開——打空了，木板立著搖，他偷笑——整塊倒下來把他壓扁
const S4 = BACKOFF + 0.8
const DODGE_X = 38
key(S4, REST)
key(S4 + 0.17, tilt(90), 'in')
key(S4 + 0.32, tilt(84), 'out')
key(S4 + 0.47, tilt(95), 'inOut')
key(S4 + 0.62, tilt(86), 'inOut')
key(S4 + 0.8, tilt(98), 'inOut')
const GIGGLE = S4 + 0.35
/** 木板開始往他這邊倒：他抬頭傻眼 */
const LEAN = S4 + 0.8
key(LEAN + 0.3, tilt(124), 'in')
const SLAM = LEAN + 0.45
/** 壓在他身上：橫躺在扁扁的他上面 */
const ON_HIM: BS = { x: DODGE_X + BL / 2, y: 59.2, a: 180, ls: 0, lr: BL }
key(SLAM, ON_HIM, 'in')
key(SLAM + 0.08, { ...ON_HIM, y: ON_HIM.y + 1.2 }, 'out')
key(SLAM + 0.18, ON_HIM, 'out')
/** 問他 */
const ASK = SLAM + 0.7
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
const ASK_AT: Vec = { x: 124, y: JY + 4 }
// 問他之前：他從木板底下彈起來，木板翻到左邊飛出去
const POPUP = ASK - 0.3
key(POPUP, ON_HIM)
key(POPUP + 0.22, { x: -20, y: 30, a: 180 + 200, ls: 0, lr: BL }, 'out')
const BOARD_END = POPUP + 0.22

/** 木板的每一格：照關鍵格切片（動的時候每 1/30 秒一段，停著的時候一整段） */
function boardAt(t: number): BS {
  if (t <= KEYS[0].t) return KEYS[0].s
  for (let i = 0; i < KEYS.length - 1; i++) {
    const A = KEYS[i], B = KEYS[i + 1]
    if (t >= A.t && t <= B.t) {
      if (B.t - A.t < 1e-6) return B.s
      const p = EASE[B.ease]((t - A.t) / (B.t - A.t))
      return { x: A.s.x + (B.s.x - A.s.x) * p, y: A.s.y + (B.s.y - A.s.y) * p, a: A.s.a + (B.s.a - A.s.a) * p, ls: A.s.ls + (B.s.ls - A.s.ls) * p, lr: A.s.lr + (B.s.lr - A.s.lr) * p }
    }
  }
  return KEYS[KEYS.length - 1].s
}
const same = (a: BS, b: BS) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.a - b.a) + Math.abs(a.ls - b.ls) + Math.abs(a.lr - b.lr) < 1e-4
/** 第 3 次飛出畫面到掉下來接住之間，木板不在畫面上 */
const hiddenAt = (t: number) => t >= GONE3 - 1e-6 && t < CATCH - 0.4 - 1e-6
const boardFx: Fx[] = []
{
  KEYS.sort((a, b) => a.t - b.t)
  const marks = [...new Set([0, ...KEYS.map((k) => k.t), GONE3, CATCH - 0.4, BOARD_END])].filter((t) => t <= BOARD_END).sort((a, b) => a - b)
  for (let i = 0; i < marks.length - 1; i++) {
    const a = marks[i], b = marks[i + 1]
    if (b - a < 1e-6 || hiddenAt(a)) continue
    const moving = !same(boardAt(a + 1e-4), boardAt(b - 1e-4))
    const n = moving ? Math.max(1, Math.round((b - a) * 30)) : 1
    for (let j = 0; j < n; j++) {
      const t0 = a + ((b - a) * j) / n
      const d = (b - a) / n
      const e = ends(boardAt(t0 + d / 2))
      // 相鄰兩段的接縫挪到不整的時間（x.xxxxx3），同一刻不會畫兩塊、也不會一塊都沒有
      const s0 = t0 < 1e-6 ? 0 : Math.round(t0 * 1e5) / 1e5 + 3e-6
      const s1 = Math.round((t0 + d) * 1e5) / 1e5 + 3e-6
      boardFx.push({ at: s0, dur: s1 - s0 - 1e-7, kind: 'tube', actor: 'rb', dx: e.long.x, dy: e.long.y, to: e.short, color: WOOD, width: BW, n: 99 })
    }
  }
}

const builds: Build[] = [
  // 每一次木板「啪」地打中，木板上就震出一組筆畫：木 → 反（上半）→ 反（下半）
  { at: g1.hit + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: along(tilt(OVER[0]), 34), color: partColor('木') },
  { at: g2.hit + 0.05, dur: 0.5, strokes: [4, 5], from: along(tilt(OVER[1]), 34), color: partColor('反') },
  { at: g3.hit + 0.05, dur: 0.5, strokes: [6, 7], from: along(tilt(OVER[2]), 34), color: partColor('反') },
]

const clip: Clip = {
  format: 2,
  char: '板',
  meta: { theme: '踩到木板一頭', cast: '小骷髏＋大木板', gags: ['小骷髏每次一腳踩到地上大木板的這一頭，另一頭就翻上來「啪」地打在他臉上，踩得一次比一次重、被打得一次比一次遠（走過去踩，臉被打一下退兩步→衝過去踩，被打得跌坐→停一拍叉腰跺腳，跳起來雙腳一跺，打得他飛出畫面、木板也翻著跟斗飛上天）；回馬槍是他學乖了，一踩馬上往後跳開，木板打空直直立著搖，他摀嘴偷笑，木板卻往他這邊一倒，整塊蓋下來把他壓扁'] },
  duration: 15,
  bg: { top: '#BFE4FF', bottom: '#F6FBFF', floor: '#BFE0A0', scenery: 'hills' },
  actors: [
    // 看不見的錨點（0,0）：木板的每一段 tube 掛在這上面，dx／dy 就是舞台座標
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 2, hidden: true, float: true },
    { id: 'jerry', emoji: 'hero:jerry/walk', x: X0, y: JY, size: JS, flip: true },
  ],
  moves: [
    // 開場：走進來，指著右上角的字框
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.5 },
    { at: SAY1 - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },

    // ── 第 1 次：走過去，一腳踩到
    { at: S1 - 0.4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: S1 - 0.4, actor: 'jerry', do: 'moveTo', to: { x: SX, y: JY }, dur: 0.4, ease: 'linear' },
    ...g1.moves,
    // 晃一晃，退兩步
    { at: BACK1, actor: 'jerry', do: 'moveTo', to: { x: 34, y: JY }, dur: 0.3, ease: 'out' },
    { at: BACK1 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dizzy' },

    // ── 第 2 次：衝過去踩
    { at: RUN2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dash' },
    { at: RUN2, actor: 'jerry', do: 'moveTo', to: { x: SX, y: JY }, dur: S2 - RUN2, ease: 'in', anticipate: 3 },
    ...g2.moves,
    // 被打得往後一屁股跌坐
    { at: BACK2, actor: 'jerry', do: 'moveTo', to: { x: SIT2_X, y: JY }, arc: 7, dur: SIT2 - BACK2, ease: 'out' },
    { at: SIT2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },

    // ── 停一拍：站起來叉腰瞪著木板、氣得跺腳
    { at: MAD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/angry' },
    { at: STOMP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/stomp' },
    { at: STOMP, actor: 'jerry', do: 'hop', amount: 2, dur: 0.18 },
    { at: STOMP + 0.2, actor: 'jerry', do: 'hop', amount: 2, dur: 0.18 },
    // ── 第 3 次：跳起來雙腳一跺
    { at: JUMP3 - 0.08, actor: 'jerry', do: 'squash', amount: 0.18, dur: 0.1 },
    { at: JUMP3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: JUMP3, actor: 'jerry', do: 'moveTo', to: { x: SX, y: JY }, arc: 14, dur: S3 - JUMP3 },
    { at: S3 - 0.02, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/stomp' },
    ...g3.moves,
    // 打得他整個人翻著飛出畫面（左邊）
    { at: FLY3, actor: 'jerry', do: 'moveTo', to: { x: -30, y: JY - 14 }, arc: 16, dur: OUT3 - FLY3, ease: 'out' },
    { at: FLY3, actor: 'jerry', do: 'rotateTo', amount: -400, dur: OUT3 - FLY3, ease: 'linear', pivot: 'center' },
    { at: OUT3, actor: 'jerry', do: 'vanish', dur: 0.01 },

    // ── 語詞：從左邊走回來，抬頭，木板從天上掉下來，舉高高接住
    { at: WALK_IN - 0.03, actor: 'jerry', do: 'rotateTo', amount: 400, dur: 0.01 },
    { at: WALK_IN - 0.03, actor: 'jerry', do: 'moveTo', to: { x: CX, y: JY }, dur: 0.01 },
    { at: WALK_IN, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: WALK_IN, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.4, ease: 'out' },
    { at: WALK_IN + 0.42, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: CATCH, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: CATCH, actor: 'jerry', do: 'squash', amount: 0.12, dur: 0.2 },
    // 放回地上，退回開場的位置
    { at: PUT + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: BACKOFF, actor: 'jerry', do: 'flip' },
    { at: BACKOFF, actor: 'jerry', do: 'moveTo', to: { x: X0, y: JY }, dur: 0.4, ease: 'inOut' },
    { at: BACKOFF + 0.42, actor: 'jerry', do: 'flip' },
    // ── 回馬槍：踮腳過去，一踩馬上往後跳開
    { at: BACKOFF + 0.42, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/sneak' },
    { at: BACKOFF + 0.5, actor: 'jerry', do: 'moveTo', to: { x: SX, y: JY }, dur: S4 - BACKOFF - 0.5, ease: 'inOut' },
    { at: S4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: S4, actor: 'jerry', do: 'moveTo', to: { x: DODGE_X, y: JY }, arc: 7, dur: 0.25, ease: 'out' },
    // 打空了！摀嘴偷笑
    { at: GIGGLE, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },
    // 木板往他這邊倒：抬頭傻眼
    { at: LEAN + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 啪！整塊蓋下來，壓扁
    { at: SLAM, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },
    { at: SLAM, actor: 'jerry', do: 'stretchTo', amount: 1.15, dur: 0.1, ease: 'out' },

    // 問他之前：從木板底下彈起來（木板翻出去）
    { at: POPUP, actor: 'jerry', do: 'stretchTo', amount: 1 / 1.15, dur: 0.1 },
    { at: POPUP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: POPUP, actor: 'jerry', do: 'hop', amount: 5, dur: 0.25 },
    // 問他：轉向國字、變大
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
    // 空字框一開始就在上方偏右（右上角有太陽，避開）（左邊留給翻上來的木板）
    { at: 0, dur: 0.01, do: 'park', to: { x: 104, y: 17 }, amount: 0.5 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: { x: 104, y: 17 }, amount: 0.5 },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.35, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...boardFx,
    ...g1.fx,
    { at: BACK1 + 0.3, kind: 'dizzy', actor: 'jerry', dur: 0.6 },
    ...f1.fx,
    ...g2.fx,
    { at: SIT2 + 0.05, kind: 'sweat', actor: 'jerry', dx: -6 },
    ...f2.fx,
    ...g3.fx,
    // 語詞：木板亮晶晶
    { at: WORD, kind: 'burst', x: CX, y: HELD.y, emoji: '✨', n: 8, dur: 0.55, scale: 1.4 },
    // 第 4 次：打空了，風從他鼻子前面掃過去
    { at: S4 + 0.1, kind: 'puff', x: PX - 2, y: 60, dur: 0.4 },
    { at: LEAN + 0.1, kind: 'pop', actor: 'jerry', emoji: '❗', dur: 0.4, dx: -9 },
    { at: SLAM, kind: 'burst', x: DODGE_X, y: 62, emoji: '💥', dur: 0.45, scale: 2.6 },
    { at: SLAM + 0.15, kind: 'dizzy', actor: 'jerry', dur: POPUP - SLAM - 0.2 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把翻上來的木板、飛出去的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.06, to: { x: CX, y: 50 } },
    { at: SLAM, dur: 0.4, do: 'shake', amount: 3.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '板' },
    ...g1.cues,
    ...f1.cues,
    ...g2.cues,
    { at: SIT2, sfx: 'plop' },
    ...f2.cues,
    { at: STOMP, sfx: 'tap' },
    { at: STOMP + 0.2, sfx: 'tap' },
    ...g3.cues,
    { at: FLY3 + 0.03, sfx: 'whoosh' },
    { at: UP3 + 0.1, sfx: 'boing' },
    { at: HOME + 0.2, say: '板' },
    { at: CATCH - 0.35, sfx: 'whoosh' },
    { at: CATCH, sfx: 'plop' },
    { at: WORD + 0.05, say: '木板' },
    { at: PUT + 0.3, sfx: 'tap' },
    { at: S4, sfx: 'tap' },
    { at: S4 + 0.02, sfx: 'whoosh' },
    { at: S4 + 0.32, sfx: 'boing' },
    { at: LEAN + 0.05, sfx: 'slide' },
    { at: SLAM, sfx: 'bonk' },
    { at: SLAM + 0.03, sfx: 'crack' },
    { at: POPUP, sfx: 'poof' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '板' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
