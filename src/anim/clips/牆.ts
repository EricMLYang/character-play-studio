import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 牆（v2）：隔著一面紅磚牆打雪仗。小骷髏站在牆的左邊，把一顆小雪球往牆的另一邊用力一丟——「咻」地飛過牆頭不見了；
// 停一拍，牆後面「咻——」地丟回來一顆雪球，飛過牆頭「噗！」打中他，而且丟回來的一次比一次大：
// 拳頭大的雪球打在臉上，他傻眼晃一下（爿）→ 比他的頭還大的雪球，把他打得往後滑、跌坐在地上（嗇的上半）→
// 先停一拍：他捏著雪球看看牆頭、冒汗發抖……還是丟了；牆後面安靜好久，他手放耳邊聽——「咻——」一顆跟他一樣大的雪球
// 把他整個人轟到畫面左邊、壓扁在地上（嗇的下半）。國字回中央唸「牆」。
// 國字讓到上方，他爬起來跑回牆邊，拍拍牆：「牆壁」。
// 回馬槍（第四次）：他學乖了，丟完馬上蹲在牆腳抱頭躲好——超大的雪球飛過來「咚」地卡在牆頭上，牆擋住了！
// 他抬頭看、開心跳起來——雪球在牆頭晃一晃，「咕嚕」滾下來，正好壓在他身上，噗地爆成一地雪，他扁扁地趴著。
// 最後畫面暗下來只剩「牆」，小骷髏問「這是什麼字？」，手放耳邊等他回答，再指著字說「牆！」，然後退場只留字。
// 刻意不跟「雪」（雪雲倒雪把人埋住）、「急」「家」（撞上門被彈回來）、「足」「睿」（被彈回來）撞：
// 這支是同一個動作（隔著牆丟雪球過去）、牆後面丟回來的永遠是雪球，只有雪球越來越大；牆一直站在那裡把兩邊隔開。
// 牆、牆、牆壁、這是什麼字？、牆

/** 小骷髏（hero:jerry；圖朝左，flip 朝右看牆） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 每次都站在同一個地方丟雪球（牆的左邊） */
const STAND: Vec = { x: 103, y: JY }
/** 第二次被打得往後滑、跌坐的地方 */
const SLID: Vec = { x: 84, y: JY }
/** 第三次被轟到左邊、壓扁的地方（國字回中央那一秒他在字的左邊） */
const LEFT: Vec = { x: 22, y: JY }
/** 紅磚牆（右邊；國字回中央時左緣約 x 121.7、右緣約 159.3，牆頭約 y 55） */
const WS = 41
const WALL: Vec = { x: 140.5, y: 77 - 0.42 * WS }
const WALL_TOP = 55.4
/** 雪球（一個角色換大小）：最大的那顆（回馬槍）是底子的 size */
const BS = 44
/** 丟出去的小雪球、丟回來的四顆（倍率） */
const MINE = 0.2
const BACK = [0.26, 0.5, 0.8, 1]
/** 雪球從他舉高的手上出手 */
const HAND: Vec = { x: 114, y: 50 }
/** 飛出畫面（牆的另一邊） */
const AWAY: Vec = { x: 176, y: 26 }
/** 丟回來的雪球打中他的臉 */
const FACE: Vec = { x: 104, y: 53 }
/** 回馬槍：超大雪球卡在牆頭上 */
const PERCH: Vec = { x: 139, y: WALL_TOP - 0.46 * BS + 2 }
/** 回馬槍：滾下來壓在他身上 */
const ONHIM: Vec = { x: STAND.x, y: 77 - 0.46 * BS }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個動作「丟過牆」：舉起雪球、往後一仰，「咻」地丟過牆頭。回傳丟出去的時刻。
 * k 是第幾次（0～3），一次比一次用力（仰得更後面）。
 */
function toss(at: number, k: number): Gag {
  const moves: Move[] = [
    // 手上冒出一顆小雪球
    { at: at - 0.3, actor: 'ball', do: 'moveTo', to: HAND, dur: 0.01 },
    { at: at - 0.29, actor: 'ball', do: 'pop', dur: 0.15 },
    { at: at - 0.289, actor: 'ball', do: 'scaleTo', amount: MINE, dur: 0.001 },
    // 往後一仰（預備）
    { at: at - 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/lift' },
    { at: at - 0.25, actor: 'jerry', do: 'tilt', amount: -(8 + 2 * k), dur: 0.25 },
    // 丟！
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/throw' },
    { at, actor: 'ball', do: 'moveTo', to: AWAY, arc: 16, dur: 0.38, ease: 'linear' },
    { at, actor: 'ball', do: 'rotateTo', amount: 300, dur: 0.38, ease: 'linear' },
    { at: at + 0.38, actor: 'ball', do: 'vanish', dur: 0.02 },
  ]
  return { moves, fx: [], camera: [], cues: [{ at, sfx: 'whoosh' }] }
}

/**
 * 同一個結果：牆後面丟回來一顆雪球，飛過牆頭。k 是第幾次，決定雪球多大。
 * 從 at 開始飛，回傳打中（或落點）的時刻 hit。to 是終點（預設他的臉）。
 */
function comeback(at: number, k: number, dur: number, to: Vec = FACE): Gag & { hit: number } {
  const s = BACK[k]
  const r = 0.46 * BS * s
  const from: Vec = { x: 160 + r + 2, y: 22 - r * 0.3 }
  const moves: Move[] = [
    { at: at - 0.03, actor: 'ball', do: 'moveTo', to: from, dur: 0.01 },
    { at: at - 0.02, actor: 'ball', do: 'pop', dur: 0.05 },
    { at: at - 0.019, actor: 'ball', do: 'scaleTo', amount: s, dur: 0.001 },
    { at, actor: 'ball', do: 'moveTo', to, arc: 8 + 4 * k, dur, ease: 'in' },
    { at, actor: 'ball', do: 'rotateTo', amount: -300, dur, ease: 'linear' },
  ]
  // 聲音：「咻——」一次比一次低沉（多疊一個 rumble）
  const cues: Cue[] = [{ at, sfx: 'whoosh' }]
  if (k >= 2) cues.push({ at: at + 0.05, sfx: 'rumble' })
  return { hit: at + dur, moves, fx: [], camera: [], cues }
}

/** 「噗！」雪球在 c 爆開：雪塊＋❄️，一次比一次大 */
function splat(at: number, c: Vec, k: number): Fx[] {
  const fx: Fx[] = [
    { at, kind: 'burst', x: c.x, y: c.y, emoji: 'prop:snowball', n: 5 + 2 * k, dur: 0.5, scale: 1 + 0.35 * k },
    { at: at + 0.03, kind: 'burst', x: c.x, y: c.y, emoji: '❄️', n: 4 + 2 * k, dur: 0.55, scale: 1 + 0.3 * k },
  ]
  return fx
}

// ── 開場：走到牆邊，抬頭指著字框唸「牆」，轉回去捏好雪球
const SAY1 = 0.55
// ── 第 1 次：拳頭大的雪球
const T1 = 1.0
const t1 = toss(T1, 0)
const c1 = comeback(T1 + 0.5, 0, 0.36)
const H1 = c1.hit
// ── 第 2 次：比他的頭還大
const T2 = H1 + 0.5
const t2 = toss(T2, 1)
const c2 = comeback(T2 + 0.5, 1, 0.38)
const H2 = c2.hit
/** 爬起來走回原位 */
const BACK2 = H2 + 0.5
// ── 第 3 次前停一拍：捏著雪球看牆頭、發抖
const PAUSE3 = BACK2 + 0.35
const T3 = PAUSE3 + 0.5
const t3 = toss(T3, 2)
/** 牆後面安靜好久，他手放耳邊聽 */
const LISTEN3 = T3 + 0.4
const c3 = comeback(T3 + 0.85, 2, 0.4)
const H3 = c3.hit
/** 被轟到左邊、壓扁 */
const FLAT3 = H3 + 0.42
/** 字框填滿、國字到正中央 */
const HOME = FLAT3 + 0.08
const PARK = HOME + 0.88
// ── 語詞那一刻：爬起來跑回牆邊、拍拍牆
const UP = HOME + 0.55
const RUN = PARK + 0.22
const PAT = RUN + 0.25
const WORD = PAT + 0.05
// ── 回馬槍（第 4 次）：丟完馬上蹲在牆腳抱頭躲好
const T4 = WORD + 0.55
const t4 = toss(T4, 3)
const DUCK = T4 + 0.25
const c4 = comeback(T4 + 0.5, 3, 0.38, PERCH)
/** 「咚」地卡在牆頭上 */
const PERCHED = c4.hit
/** 抬頭看、開心跳起來 */
const LOOK = PERCHED + 0.25
const YAY = LOOK + 0.2
/** 雪球在牆頭晃一晃、滾下來 */
const ROLL = YAY + 0.28
const H4 = ROLL + 0.28
const BURST4 = H4 + 0.14
/** 問他 */
const ASK = BURST4 + 0.4
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.55
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }

const builds: Build[] = [
  // 拳頭大的雪球打在臉上：爿
  { at: H1 + 0.05, dur: 0.5, strokes: [0, 1, 2, 3], from: FACE, color: partColor('爿') },
  // 比他的頭還大的雪球：嗇的上半
  { at: H2 + 0.05, dur: 0.5, strokes: [4, 5, 6, 7, 8, 9, 10], from: FACE, color: partColor('嗇') },
  // 跟他一樣大的雪球：嗇的下半（回）
  { at: H3 + 0.05, dur: 0.5, strokes: [11, 12, 13, 14, 15, 16], from: FACE, color: partColor('嗇') },
]

const clip: Clip = {
  format: 2,
  char: '牆',
  meta: { theme: '隔著牆打雪仗', cast: '小骷髏＋紅磚牆＋雪球', gags: ['小骷髏每次把小雪球往紅磚牆的另一邊一丟，牆後面就「咻」地丟回來一顆雪球、飛過牆頭「噗」地打中他，一次比一次大（拳頭大的打在臉上晃一下→比頭還大的把他打得滑出去跌坐→停一拍、安靜好久，跟他一樣大的把他轟到畫面另一邊壓扁）；回馬槍是他丟完就蹲在牆腳躲好，超大雪球「咚」地卡在牆頭上、牆擋住了，他開心跳起來，雪球卻從牆頭滾下來壓在他身上'] },
  duration: 15,
  bg: { top: '#9FC6EC', bottom: '#E2EEFA', floor: '#F2F7FC', scenery: 'snow' },
  actors: [
    { id: 'wall', emoji: 'prop:brick-wall', x: WALL.x, y: WALL.y, size: WS },
    { id: 'jerry', emoji: 'hero:jerry/walk', x: STAND.x, y: STAND.y, size: JS, flip: true },
    // 雪球：畫在最上面
    { id: 'ball', emoji: 'prop:snowball', x: HAND.x, y: HAND.y, size: BS, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：走到牆邊
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.5 },
    // 抬頭指著字框：牆！
    { at: SAY1 - 0.05, actor: 'jerry', do: 'flip' },
    { at: SAY1 - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: SAY1 + 0.3, actor: 'jerry', do: 'flip' },
    { at: SAY1 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },

    // ── 第 1 次：拳頭大的雪球打在臉上，傻眼晃一下
    ...t1.moves,
    { at: T1 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    ...c1.moves,
    { at: H1, actor: 'ball', do: 'vanish', dur: 0.04 },
    { at: H1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: H1, actor: 'jerry', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: H1 + 0.05, actor: 'jerry', do: 'tilt', amount: -10, dur: 0.4 },

    // ── 第 2 次：比他的頭還大，打得往後滑、跌坐
    ...t2.moves,
    { at: T2 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    ...c2.moves,
    { at: H2, actor: 'ball', do: 'vanish', dur: 0.04 },
    { at: H2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: H2 + 0.06, actor: 'jerry', do: 'moveTo', to: SLID, dur: 0.25, ease: 'out' },
    { at: H2 + 0.12, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: H2 + 0.3, actor: 'jerry', do: 'squash', amount: 0.15, dur: 0.2 },
    // 爬起來、走回原位
    { at: BACK2 - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/angry' },
    { at: BACK2, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.3 },

    // ── 停一拍：捏著雪球，看看牆頭、冒汗發抖……
    { at: PAUSE3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/scared' },
    { at: PAUSE3 + 0.05, actor: 'jerry', do: 'shake', amount: 0.6, dur: 0.4 },
    // ── 第 3 次：還是丟了；牆後面安靜好久
    ...t3.moves,
    { at: T3 + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: LISTEN3, actor: 'jerry', do: 'tilt', amount: 8, dur: 0.4 },
    ...c3.moves,
    // 「咻——」跟他一樣大：轟到畫面左邊、壓扁（雪球跟著把他推過去，然後爆開）
    { at: H3 - 0.12, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: H3, actor: 'jerry', do: 'moveTo', to: LEFT, arc: 7, dur: FLAT3 - H3, ease: 'out' },
    { at: H3, actor: 'jerry', do: 'spin', times: 1, dur: FLAT3 - H3, pivot: 'center' },
    { at: H3, actor: 'ball', do: 'moveTo', to: { x: LEFT.x + 27, y: 60 }, arc: 7, dur: FLAT3 - H3 - 0.04, ease: 'out' },
    { at: H3, actor: 'ball', do: 'rotateTo', amount: -200, dur: FLAT3 - H3, ease: 'out' },
    { at: FLAT3 - 0.04, actor: 'ball', do: 'vanish', dur: 0.06 },
    { at: FLAT3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },

    // ── 語詞：爬起來跑回牆邊、拍拍牆
    { at: UP, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dizzy' },
    { at: RUN - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dash' },
    { at: RUN, actor: 'jerry', do: 'moveTo', to: STAND, dur: PAT - RUN, ease: 'inOut' },
    { at: PAT, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/push' },
    { at: PAT, actor: 'jerry', do: 'moveTo', to: { x: STAND.x + 4, y: JY }, dur: 0.12 },
    { at: PAT + 0.12, actor: 'wall', do: 'shake', amount: 0.4, dur: 0.15 },
    { at: PAT + 0.3, actor: 'wall', do: 'shake', amount: 0.4, dur: 0.15 },
    { at: WORD + 0.4, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.12 },

    // ── 回馬槍（第 4 次）：丟完馬上蹲在牆腳抱頭
    ...t4.moves,
    { at: DUCK, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/duck' },
    { at: DUCK, actor: 'jerry', do: 'moveTo', to: { x: STAND.x + 5, y: JY }, dur: 0.12 },
    ...c4.moves,
    // 「咚」卡在牆頭上，牆擋住了！
    { at: PERCHED, actor: 'ball', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: PERCHED, actor: 'wall', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: PERCHED, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.3 },
    // 抬頭看、開心跳起來
    { at: LOOK, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/peek' },
    { at: YAY, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: YAY, actor: 'jerry', do: 'hop', amount: 5, dur: 0.3 },
    // 雪球在牆頭晃一晃……
    { at: YAY + 0.05, actor: 'ball', do: 'tilt', amount: -10, dur: 0.25 },
    // ……「咕嚕」滾下來壓在他身上
    { at: ROLL - 0.08, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: ROLL, actor: 'ball', do: 'moveTo', to: ONHIM, arc: 4, dur: H4 - ROLL, ease: 'in' },
    { at: ROLL, actor: 'ball', do: 'rotateTo', amount: -160, dur: H4 - ROLL, ease: 'in' },
    { at: H4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },
    { at: H4, actor: 'jerry', do: 'moveTo', to: { x: STAND.x - 4, y: JY }, dur: 0.01 },
    { at: H4, actor: 'ball', do: 'squash', amount: 0.25, dur: 0.14 },
    { at: BURST4, actor: 'ball', do: 'vanish', dur: 0.08 },
    // 問他之前：牆退掉（畫面暗下來）
    { at: ASK - 0.2, actor: 'wall', do: 'vanish', dur: 0.15 },
    // 問他：站起來、轉向國字、變大
    { at: ASK + 0.2, actor: 'jerry', do: 'flip' },
    { at: ASK + 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.2, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.2, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.0, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.27, actor: 'jerry', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'jerry', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.2, ease: 'in' },
  ],
  builds,
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 第 1 次
    ...splat(H1, FACE, 0),
    // 第 2 次
    ...splat(H2, FACE, 1),
    { at: H2 + 0.3, kind: 'puff', actor: 'jerry' },
    // 停一拍：冒汗
    { at: PAUSE3 + 0.05, kind: 'sweat', actor: 'jerry', dx: 6 },
    // 第 3 次
    ...splat(H3, FACE, 2),
    { at: FLAT3, kind: 'burst', x: LEFT.x + 10, y: 62, emoji: 'prop:snowball', n: 8, dur: 0.5, scale: 1.6 },
    { at: FLAT3 + 0.02, kind: 'burst', x: LEFT.x + 8, y: 58, emoji: '💥', dur: 0.4, scale: 1.5 },
    // 語詞：牆亮晶晶
    { at: PAT + 0.1, kind: 'burst', x: 130, y: 62, emoji: '✨', n: 7, dur: 0.5, scale: 1.4 },
    // 第 4 次：卡在牆頭上的那一下
    { at: PERCHED, kind: 'burst', x: 130, y: WALL_TOP, emoji: '❄️', n: 6, dur: 0.45, scale: 1.3 },
    // 壓在他身上、爆成一地雪
    ...splat(BURST4, { x: ONHIM.x, y: 62 }, 3),
    { at: BURST4 + 0.02, kind: 'burst', x: ONHIM.x, y: 58, emoji: '💥', dur: 0.4, scale: 1.8 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把牆、被轟走的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    { at: H1, dur: 0.3, do: 'shake', amount: 0.6 },
    { at: H2, dur: 0.35, do: 'punch', amount: 0.05, to: { x: 100, y: 55 } },
    { at: H2, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: H3, dur: 0.4, do: 'punch', amount: 0.08, to: { x: 90, y: 55 } },
    { at: H3, dur: 0.45, do: 'shake', amount: 2 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: 125, y: 58 } },
    { at: PERCHED, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.1, to: { x: 105, y: 58 } },
    { at: H4, dur: 0.45, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: SAY1, say: '牆' },
    ...t1.cues,
    ...c1.cues,
    { at: H1, sfx: 'poof' },
    ...t2.cues,
    ...c2.cues,
    { at: H2, sfx: 'poof' },
    { at: H2 + 0.05, sfx: 'bonk' },
    { at: H2 + 0.12, sfx: 'slide' },
    ...t3.cues,
    ...c3.cues,
    { at: H3, sfx: 'poof' },
    { at: H3 + 0.05, sfx: 'bonk' },
    { at: FLAT3, sfx: 'plop' },
    { at: HOME + 0.2, say: '牆' },
    { at: PAT + 0.12, sfx: 'tap' },
    { at: PAT + 0.3, sfx: 'tap' },
    { at: WORD + 0.05, say: '牆壁' },
    ...t4.cues,
    ...c4.cues,
    { at: PERCHED, sfx: 'bonk' },
    { at: ROLL, sfx: 'slide' },
    { at: H4, sfx: 'poof' },
    { at: H4 + 0.05, sfx: 'bonk' },
    { at: BURST4, sfx: 'plop' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '牆' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
