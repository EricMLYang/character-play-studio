import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 眼（v2）：狗狗警長的眼鏡不見了（其實一直掛在他自己的帽子上，小孩從第一格就看得到），瞇著眼睛什麼都看不清楚——
// 每次他瞇眼、伸長脖子往前看（眼睛射出一條灰灰的視線＋問號），頭上冒出一個「他以為是什麼」的大泡泡，開開心心走過去伸手一摸，
// 「咚！」大紅叉：不是啦！他縮手、眼睛瞪得好大（傻眼）。認錯的東西一次比一次離譜：
// 把大石頭當成小狗拍拍頭（目從他瞪大的眼睛飛出來）→ 把大樹當成朋友握手，握到樹枝、葉子掉一頭（艮的上半）→
// 先停一拍：前面那一團咖啡色的……他看了兩次，泡泡裡是一張沙發——其實是睡著的大熊；他舒服地一屁股坐上去，熊醒了站起來大吼，他被頂在熊頭上（艮的下半）。
// 他被甩回左邊跌坐，帽子上的眼鏡「叮」地滑到鼻子上——看得見了！語詞：眼鏡。
// 回馬槍（第 4 次）：戴著眼鏡再看一次，這次視線是亮的、泡泡裡跟眼前一模一樣——是大熊！他嚇得跳最高，客客氣氣敬個禮，熊哼一聲走了。
// 最後畫面暗下來只剩「眼」，警長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「眼！」，然後退場只留字。
// 眼、眼、眼鏡、這是什麼字？、眼

/** 狗狗警長（size 40）站在地上的 y */
const S = 40
const P = 77 - 0.42 * S
/** 眼鏡（👓）：先掛在帽子上，後來戴在臉上 */
const GS = 13
/** 每次瞇眼看的地方、走過去伸手摸的地方（四次都一樣） */
const LOOK = 34, TOUCH = 86
/** 被認錯的東西站的地方（畫面中間偏右） */
const OX = 120
const ROCK = 34, TREE = 46, BEAR = 46
const yOf = (size: number) => 77 - 0.42 * size
/** 熊站起來吼的時候往後一仰（國字放大時不擋字） */
const BEAR_UP = 131
/** 「不是啦！」的大紅叉：每次都在同一個位置（他伸出去的手上方） */
const NO = { x: 111, y: 37 }
/** 想像泡泡：固定在他瞇眼看的那個位置的頭上（字框左邊的天空），不跟著他走，才能跟真正的東西並排比 */
const BUB = { x: 40, y: 19.5 }
/** 摸到以後傻眼停多久 */
const HOLD = 0.48

/**
 * 警長各個姿勢（翻面後、面向右）帽子上的星星與兩眼中間在圖上的位置（0～1）：眼鏡照這張表貼在帽子上／臉上。
 * 量法：把姿勢圖左右翻面、畫上十等分格線讀出來的。
 */
const POSE = {
  idle: { hat: [0.55, 0.15], eye: [0.57, 0.36] },
  sneak: { hat: [0.62, 0.26], eye: [0.63, 0.47] },
  wave: { hat: [0.5, 0.14], eye: [0.52, 0.35] },
  reach: { hat: [0.5, 0.2], eye: [0.52, 0.42] },
  surprised: { hat: [0.53, 0.14], eye: [0.55, 0.34] },
  full: { hat: [0.47, 0.13], eye: [0.5, 0.34] },
  fall: { hat: [0.53, 0.15], eye: [0.56, 0.41] },
  salute: { hat: [0.52, 0.14], eye: [0.55, 0.35] },
  listen: { hat: [0.62, 0.24], eye: [0.6, 0.44] },
  point: { hat: [0.47, 0.2], eye: [0.5, 0.39] },
  happy: { hat: [0.5, 0.15], eye: [0.52, 0.35] },
} as const
type Pose = keyof typeof POSE

const moves: Move[] = []
const fx: Fx[] = []
const camera: Camera[] = []
const lights: Light[] = []
const cues: Cue[] = []

/** 警長現在的位置、姿勢、倍率、面向（right＝面向右）、眼鏡戴上了沒：眼鏡跟著這份狀態走 */
const st = { x: LOOK, y: P, pose: 'idle' as Pose, k: 1, right: true, worn: false }

/** 眼鏡（中心）現在該在哪：警長的圖以腳底為準放大，眼鏡自己也跟著放大 */
function spot(pose: Pose = st.pose) {
  const [u0, v] = POSE[pose][st.worn ? 'eye' : 'hat']
  const u = st.right ? u0 : 1 - u0
  return { x: st.x + (u - 0.5) * S * st.k, y: st.y + 0.42 * S + (v - 0.92) * S * st.k - 0.42 * GS * (1 - st.k) }
}
/** 換姿勢：眼鏡同一刻跳到新姿勢的帽子／眼睛上（自動的「換姿勢彈一下」關掉，眼鏡才不會跟臉錯開） */
function pose(at: number, p: Pose) {
  st.pose = p
  moves.push({ at, actor: 'sheriff', do: 'swap', emoji: `hero:sheriff/${p}` })
  moves.push({ at, dur: 0.05, actor: 'sheriff', do: 'squash', amount: 0.02 })
  moves.push({ at, dur: 0.01, actor: 'specs', do: 'moveTo', to: spot() })
}
/** 走過去（自己寫小跳步，警長和眼鏡一起跳）；arc 是整段拋多高 */
function go(at: number, dur: number, x: number, y = st.y, o: { ease?: Move['ease']; arc?: number; steps?: number } = {}) {
  const dist = Math.abs(x - st.x)
  st.x = x; st.y = y
  for (const actor of ['sheriff', 'specs']) {
    moves.push({ at, dur, actor, do: 'moveTo', to: actor === 'sheriff' ? { x, y } : spot(), ease: o.ease ?? 'inOut', ...(o.arc ? { arc: o.arc } : {}) })
  }
  const n = o.arc ? 0 : o.steps ?? Math.round(dist / 16)
  for (let i = 0; i < n; i++) hop(at + (i * dur) / n, 1.6, dur / n)
}
function hop(at: number, amount: number, dur: number) {
  for (const actor of ['sheriff', 'specs']) moves.push({ at, dur, actor, do: 'hop', amount })
}
/** 唸字那一拍不要自動點頭（眼鏡不會跟著點） */
function still(at: number) {
  moves.push({ at, dur: 0.3, actor: 'sheriff', do: 'squash', amount: 0.02 })
}
/** 想像泡泡（一個大的空泡泡＋裡面一個大大的東西），固定在 BUB */
function think(at: number, dur: number, emoji: string) {
  fx.push({ at, kind: 'bubble', x: BUB.x - 9 * 3.2, y: BUB.y + 9 * 3.2, emoji: '', dur, scale: 3.2 })
  // 主角圖、道具圖四周留白多，放大一點才跟 emoji 一樣大
  const k = emoji.includes(':') ? 3.5 : 3
  fx.push({ at: at + 0.03, kind: 'pop', x: BUB.x - 6 * k, y: BUB.y + 6 * k + (k > 3 ? 2.5 : 0.5), emoji, dur: dur - 0.03, scale: k })
  cues.push({ at, sfx: 'bubble' })
}
function scale(at: number, dur: number, k: number) {
  const by = k / st.k
  st.k = k
  moves.push({ at, dur, actor: 'sheriff', do: 'scaleTo', amount: by })
  moves.push({ at, dur, actor: 'specs', do: 'scaleTo', amount: by })
  moves.push({ at, dur, actor: 'specs', do: 'moveTo', to: spot() })
}

/**
 * 「瞇眼看」：伸長脖子（sneak：頭往前伸、眼睛瞇成一條線），眼睛射出一條視線到那個東西，眼睛前面冒一個符號。
 * 沒戴眼鏡：灰灰的視線＋問號；戴上眼鏡（clear）：亮黃色的視線＋閃光。四次都在同一個位置。
 */
function look(at: number, to: { x: number; y: number }, clear = false) {
  if (st.pose !== 'sneak') pose(at, 'sneak')
  const [u, v] = POSE.sneak.eye
  const eye = { dx: (u - 0.5) * S + 3, dy: (v - 0.5) * S }
  fx.push({ at, kind: 'line', actor: 'sheriff', ...eye, to, dur: 0.5, color: clear ? '#FFC400' : '#8C9BB0', width: clear ? 2.2 : 1.5 })
  fx.push({ at, kind: 'burst', x: LOOK + 15, y: P - 9, emoji: clear ? '✨' : '❓', n: 1, dur: 0.5, scale: clear ? 1.3 : 1.15 })
  cues.push({ at, sfx: 'blip' })
}

/**
 * 「看不清楚→認錯→摸到才發現」：at 是摸到（咚）的那一刻。
 * 瞇眼看（at−1.2）→ 頭上冒出「他以為是什麼」的大泡泡（at−0.85）→ 開心地揮手、走過去 → touch() 伸手摸 →
 * 咚！大紅叉＋鏡頭推近＋震＋同一個音效（一次多疊一個音）→ 縮手、眼睛瞪大傻眼停 HOLD 秒。
 * k 是第幾次（越後面越大），what 是泡泡裡的東西，see 是視線看到哪裡，touch 是怎麼摸（預設走到 TOUCH 伸手）。
 */
function mistake(at: number, k: number, what: string, see: { x: number; y: number }, touch?: () => void) {
  look(at - 1.2, see)
  think(at - 0.85, 0.95, what)
  if (touch) touch()
  else {
    pose(at - 0.5, 'wave')
    hop(at - 0.5, 3, 0.14)
    go(at - 0.36, 0.24, TOUCH)
    pose(at - 0.12, 'reach')
  }
  // 咚！不是啦！
  fx.push({ at, kind: 'burst', ...NO, emoji: '❌', n: 1, dur: 0.6, scale: 2.0 + 0.3 * k })
  camera.push({ at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: 100, y: k >= 2 ? 40 : 52 } })
  camera.push({ at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k })
  cues.push({ at, sfx: 'bonk' })
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
}

/** 他繼續往前走：眼前的東西往左邊滑出去，下一個從右邊滑進來，他回到同一個位置 */
function walkOn(at: number, out: string, into: string, size: number) {
  const dur = 0.32
  pose(at, 'idle')
  go(at, dur, LOOK, P, { ease: 'linear', steps: 2 })
  moves.push({ at, dur, actor: out, do: 'moveTo', to: { x: -45, y: yOf(out === 'rock' ? ROCK : TREE) }, ease: 'linear' })
  moves.push({ at: at + dur, dur: 0.05, actor: out, do: 'vanish' })
  moves.push({ at, dur, actor: into, do: 'enter', from: { x: 215, y: yOf(size) }, ease: 'out' })
  cues.push({ at, sfx: 'slide' })
}

const H1 = 2.2, H2 = 4.3, H3 = 6.75, H4 = 10.05
const HOME = 7.5, PARK = 8.7, WORD = 8.95, ASK = 11.05, ANSWER = 13.68

// ── 開場：警長走進來，眼鏡就掛在他帽子上（閃一下）；他瞇著眼找：我的眼鏡呢？ ──
moves.push({ at: 0, dur: 0.4, actor: 'sheriff', do: 'enter', from: { x: -30, y: P }, ease: 'out' })
moves.push({ at: 0, dur: 0.4, actor: 'specs', do: 'enter', from: { x: spot().x - LOOK - 30, y: spot().y }, ease: 'out' })
hop(0.05, 1.6, 0.17); hop(0.22, 1.6, 0.17)
think(0.4, 0.62, '👓')
fx.push({ at: 0.45, kind: 'burst', x: BUB.x + 15, y: BUB.y - 9, emoji: '❓', n: 1, dur: 0.55, scale: 0.9 })
moves.push({ at: 0.45, dur: 0.4, actor: 'specs', do: 'flash' })
still(0.5)
cues.push({ at: 0.5, say: '眼' })

// ── 第 1 次：把大石頭當成小狗，拍拍頭 ──
mistake(H1, 0, '🐶', { x: OX - 15, y: 60 })
moves.push({ at: H1, dur: 0.3, actor: 'rock', do: 'shake', amount: 0.8 })
pose(H1 + 0.12, 'surprised')
go(H1 + 0.12, 0.12, TOUCH - 5, P, { ease: 'out', steps: 0 })
walkOn(H1 + 0.12 + HOLD, 'rock', 'tree', TREE)

// ── 第 2 次：把大樹當成朋友，握手——握到樹枝，葉子掉一頭 ──
mistake(H2, 1, 'hero:raccoon/wave', { x: OX - 14, y: 56 })
moves.push({ at: H2, dur: 0.45, actor: 'tree', do: 'shake', amount: 1.6 })
fx.push({ at: H2 + 0.05, kind: 'burst', x: TOUCH + 4, y: 42, emoji: '🍃', n: 9, dur: 0.6, scale: 1.2 })
pose(H2 + 0.12, 'surprised')
go(H2 + 0.12, 0.12, TOUCH - 6, P, { ease: 'out', steps: 0 })
walkOn(H2 + 0.12 + HOLD, 'tree', 'bear', BEAR)

// ── 第 3 次前停一拍：那一團咖啡色的是什麼？他看了兩次……是沙發！一屁股坐上去——熊醒了 ──
look(H3 - 1.6, { x: OX - 21, y: 62 })
fx.push({ at: H3 - 1.55, kind: 'sweat', actor: 'sheriff', dur: 0.5 })
// 看不出來，脖子再伸一下、再瞇一次（mistake 裡的那一次）
hop(H3 - 1.25, 1.5, 0.15)
moves.push({ at: H3 - 1.3, dur: 0.3, actor: 'bear', do: 'squash', amount: -0.08 })
/** 坐在熊背上的位置；熊站起來以後，他被頂在熊頭上 */
const SIT = { x: OX + 9, y: yOf(BEAR) + 0.03 * BEAR - 0.4 * S }
const TOP = { x: BEAR_UP, y: yOf(BEAR) + 0.45 * BEAR - 0.86 * BEAR - 0.4 * S }
mistake(H3, 2, '🛋️', { x: OX - 21, y: 62 }, () => {
  pose(H3 - 0.72, 'wave')
  hop(H3 - 0.72, 3, 0.14)
  go(H3 - 0.58, 0.2, TOUCH + 8)
  // 轉身一跳，舒服地坐上去
  pose(H3 - 0.38, 'full')
  go(H3 - 0.38, 0.2, SIT.x, SIT.y, { arc: 9, ease: 'inOut' })
  moves.push({ at: H3 - 0.18, dur: 0.16, actor: 'bear', do: 'squash', amount: 0.14 })
  fx.push({ at: H3 - 0.2, kind: 'pop', actor: 'sheriff', emoji: '💕', dx: -12, dy: 4, dur: 0.22, scale: 1.2 })
  cues.push({ at: H3 - 0.18, sfx: 'plop' })
})
// 熊醒了：站起來大吼，他被頂在熊頭上、傻眼
moves.push({ at: H3, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' })
moves.push({ at: H3, dur: 0.08, actor: 'bear', do: 'moveTo', to: { x: BEAR_UP, y: yOf(BEAR) } })
moves.push({ at: H3 + 0.08, dur: 0.4, actor: 'bear', do: 'shake', amount: 1.4 })
pose(H3, 'surprised')
go(H3, 0.08, TOP.x, TOP.y, { ease: 'out', steps: 0 })
cues.push({ at: H3 + 0.12, sfx: 'rumble' })
// 被甩回左邊，一屁股跌坐
/** 跌坐的地方 */
const SITX = 20
go(H3 + 0.06 + HOLD, 0.2, SITX, P, { ease: 'in', steps: 0 })
pose(H3 + 0.26 + HOLD, 'fall')
cues.push({ at: H3 + 0.06 + HOLD, sfx: 'whoosh' }, { at: H3 + 0.26 + HOLD, sfx: 'plop' })
fx.push({ at: H3 + 0.3 + HOLD, kind: 'dizzy', actor: 'sheriff', dy: 4, dur: 0.5 })

// ── 字拼好放大（他坐在左邊、熊站在右邊）；帽子上的眼鏡「叮」地滑到鼻子上——看得見了！ ──
lights.push({ at: HOME, dur: 0.05, level: -0.35 }, { at: HOME + 0.05, dur: 0.35, level: 0 })
still(HOME + 0.08)
cues.push({ at: HOME + 0.1, say: '眼' })
moves.push({ at: H3 + 0.9, actor: 'bear', do: 'swap', emoji: 'prop:bear' })
/** 眼鏡從帽子滑到鼻子上 */
const DROP = 8.22
st.worn = true
moves.push({ at: DROP - 0.12, dur: 0.12, actor: 'specs', do: 'hop', amount: 2.5 })
moves.push({ at: DROP, dur: 0.16, actor: 'specs', do: 'moveTo', to: spot(), ease: 'in' })
cues.push({ at: DROP + 0.16, sfx: 'clink' })
pose(DROP + 0.2, 'surprised')
fx.push({ at: DROP + 0.2, kind: 'burst', x: SITX + 10, y: P - 12, emoji: '✨', n: 1, dur: 0.4, scale: 1.0 })

// ── 語詞那一刻：戴著眼鏡走到畫面中間、變大，眼鏡閃一下：眼鏡 ──
/** 語詞那一刻站的地方（國字讓回上方以後，正下方偏左） */
const MID = 52
pose(PARK - 0.05, 'idle')
go(PARK, 0.22, MID, P, { steps: 2 })
scale(PARK, 0.22, 1.2)
pose(WORD - 0.02, 'happy')
hop(WORD, 2, 0.3)
moves.push({ at: WORD, dur: 0.45, actor: 'specs', do: 'flash' })
fx.push({ at: WORD, kind: 'burst', x: MID + 2, y: P - 14, emoji: '✨', n: 8, dur: 0.55, scale: 1.25 })
cues.push({ at: WORD, say: '眼鏡' }, { at: WORD, sfx: 'clink' })

// ── 回馬槍（第 4 次）：戴著眼鏡回到同一個位置再看一次——視線是亮的，泡泡裡跟眼前一模一樣：是大熊！ ──
pose(H4 - 0.72, 'idle')
go(H4 - 0.72, 0.2, LOOK, P, { steps: 2 })
scale(H4 - 0.72, 0.2, 1)
look(H4 - 0.5, { x: BEAR_UP - 13, y: 54 }, true)
think(H4 - 0.38, 0.5, 'prop:bear')
// 咚！看清楚了：熊站起來一吼，他嚇得跳最高
moves.push({ at: H4, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' })
moves.push({ at: H4, dur: 0.4, actor: 'bear', do: 'shake', amount: 1.6 })
pose(H4, 'surprised')
hop(H4 + 0.02, 15, 0.48)
fx.push({ at: H4, kind: 'burst', ...NO, emoji: '❗', n: 1, dur: 0.6, scale: 2.9 })
camera.push({ at: H4, dur: 0.45, do: 'punch', amount: 0.2, to: { x: 100, y: 52 } })
camera.push({ at: H4, dur: 0.3, do: 'shake', amount: 2.4 })
cues.push({ at: H4, sfx: 'bonk' }, { at: H4 + 0.04, sfx: 'boing' }, { at: H4 + 0.08, sfx: 'crack' }, { at: H4 + 0.12, sfx: 'rumble' })
// 客客氣氣敬個禮；熊哼一聲，轉身走了
pose(H4 + 0.52, 'salute')
moves.push({ at: H4 + 0.62, actor: 'bear', do: 'swap', emoji: 'prop:bear' })
moves.push({ at: H4 + 0.7, actor: 'bear', do: 'flip' })
moves.push({ at: H4 + 0.72, dur: 0.4, actor: 'bear', do: 'moveTo', to: { x: 205, y: yOf(BEAR) }, ease: 'in' })
moves.push({ at: H4 + 1.14, dur: 0.05, actor: 'bear', do: 'vanish' })

// ── 問他：警長走到左前方、變大，轉向觀眾 ──
/** 問他時站的地方 */
const FRONT = { x: 32, y: P + 3 }
pose(ASK + 0.08, 'idle')
go(ASK + 0.08, 0.2, FRONT.x, FRONT.y, { steps: 0 })
scale(ASK + 0.08, 0.2, 1.3)
still(ASK + 0.1)
cues.push({ at: ASK + 0.1, say: FIXED_LINES.clipAsk })
// 安靜等他回答：手放耳邊、往字那邊傾、點兩下頭
pose(12.1, 'listen')
hop(12.6, 1.5, 0.3)
hop(13.1, 1.5, 0.3)
// 回答：跳起來指著字
pose(ANSWER, 'point')
hop(ANSWER, 6, 0.25)
cues.push({ at: ANSWER, say: '眼' }, { at: ANSWER + 0.05, sfx: 'cheer' })
fx.push({ at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 })
// 退場，畫面只留下字
st.right = false
moves.push({ at: ANSWER + 0.12, actor: 'sheriff', do: 'flip' })
pose(ANSWER + 0.12, 'happy')
go(ANSWER + 0.14, 0.16, -50, FRONT.y, { ease: 'in', steps: 0 })

const clip: Clip = {
  format: 2,
  char: '眼',
  meta: { theme: '警長的眼鏡不見了', cast: '狗狗警長＋眼鏡＋大石頭＋大樹＋大熊', gags: ['狗狗警長的眼鏡不見了（其實一直掛在帽子上），每次瞇著眼往前看都把眼前的東西認成別的、開開心心走過去一摸才「咚」地發現不對，一次比一次離譜（把大石頭當小狗拍頭、把大樹當朋友握手、把睡著的大熊當沙發坐上去被頂上天）；回馬槍是眼鏡從帽子滑到鼻子上，他戴著眼鏡再看一次，這次看清楚了是大熊，嚇得跳最高再客氣地敬禮'] },
  duration: 15,
  bg: { top: '#D9F0FF', bottom: '#F7FBEE', floor: '#BFDD96', scenery: 'hills' },
  actors: [
    { id: 'rock', emoji: 'prop:rock', x: OX, y: yOf(ROCK), size: ROCK },
    { id: 'tree', emoji: 'prop:tree', x: OX, y: yOf(TREE), size: TREE, hidden: true },
    { id: 'bear', emoji: 'prop:bear-sleep', x: OX, y: yOf(BEAR), size: BEAR, hidden: true },
    // 姿勢圖朝左，翻過來面向右邊的東西
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: LOOK, y: P, size: S, hidden: true, flip: true },
    { id: 'specs', emoji: '👓', x: LOOK + (POSE.idle.hat[0] - 0.5) * S, y: P + (POSE.idle.hat[1] - 0.5) * S, size: GS, hidden: true, float: true },
  ],
  moves,
  builds: [
    // 目：摸到石頭、嚇得瞪大的眼睛飛出來
    { at: H1 + 0.14, dur: 0.55, strokes: [0, 1, 2, 3, 4], from: { x: TOUCH - 3, y: P - 7 }, color: partColor('目') },
    // 艮的上半：握到的那棵樹
    { at: H2 + 0.1, dur: 0.5, strokes: [5, 6, 7], from: 'tree', color: partColor('艮') },
    // 艮的下半：站起來的大熊
    { at: H3 + 0.08, dur: 0.5, strokes: [8, 9, 10], from: 'bear', color: partColor('艮') },
  ],
  glyph: [
    { at: HOME, dur: 0.4, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['sheriff', 'specs'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...fx,
    // 睡著的大熊在打呼
    { at: H2 + 1.0, kind: 'zzz', actor: 'bear', dx: -12, dy: 6, dur: H3 - H2 - 1.0 },
  ],
  camera: [
    // 整支鎖在全景：泡泡、眼前的東西、國字要一直整個在畫面裡（自動取景往前預看會切到）
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...camera,
    { at: HOME - 0.35, dur: 0.3, do: 'zoom', amount: 1 },
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    { at: ASK - 0.3, dur: 0.25, do: 'zoom', amount: 1 },
  ],
  lights,
  cues,
}

export default clip
