import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 九（v2）：打地鼠。地上有九個洞，排成三排、每排三個（開場一個一個挖出來，數到九）。楊捷睿拿著大槌子——
// 每次地鼠從他面前的洞探頭笑他，他把槌子舉高高「咚！」敲下去，地鼠早就鑽走了，從別的洞「啵」地冒出來，一次比一次多洞：
// 另一個洞冒出來 → 連冒三個洞、他氣到跺腳 → 冒汗想一想、敲下去，地鼠把九個洞一個一個全冒一遍（再數一次九），他跟著轉到頭暈坐倒。
// 第一次敲出一撇、第二次從冒出來的洞口飛出橫折彎鉤，第三次整個字亮起來。語詞「九個」：九個洞一個一個亮一下。
// 回馬槍：他這次真的敲中了，閉眼得意——九個洞同時「啵」地冒出九隻一模一樣的地鼠：原來一直有九隻。他一屁股跌坐。
// 九、九、九個、這是什麼字？、九
const S = 38
const X = 26
const P = 77 - 0.42 * S
/** 地鼠（先用 🐹 頂著，之後換自製道具圖）：只露出頭，下巴藏在洞口後面 */
const MS = 17
const headY = (holeY: number) => holeY + 1.4 - 0.42 * MS

type V = { x: number; y: number }
/** 九個洞：三排、每排三個，斜斜地往右前方排（後排在上、前排在下），九隻同時冒出來也不互相擋 */
const ROWS = [72, 79, 86]
const HOLES: V[] = ROWS.flatMap((y, r) => [0, 1, 2].map((c) => ({ x: 52 + 15 * r + 30 * c, y })))
/** 他每次敲的洞：後排最左邊，就在他面前 */
const T = 0

/** 槌子（🔨 原圖頭在左上、柄尾在右下）：B 是大小，柄尾離圖中心 G */
const B = 22
const G = 0.38 * B
/** 舉高（lift）時兩手在頭頂上、往前推（push）時兩手在前面：圖朝左、他 flip 朝右 */
const LIFT_HAND: V = { x: X + 0.03 * S, y: P - 0.4 * S }
const PUSH_HAND: V = { x: X + 0.425 * S, y: P }
/** 柄尾握在 hand、轉 deg 度時，槌子的中心在哪裡 */
function toolAt(hand: V, deg: number): V {
  const r = (deg * Math.PI) / 180
  return { x: hand.x - (G * Math.cos(r) - G * Math.sin(r)), y: hand.y - (G * Math.sin(r) + G * Math.cos(r)) }
}
/** 舉高時槌頭往後翹、敲下去時槌頭朝右下打進洞裡 */
const LIFT = 20
const SWING = 200
const UP = toolAt(LIFT_HAND, LIFT)
const DOWN = toolAt(PUSH_HAND, SWING)

/** 每一次地鼠鑽走以後從哪些洞冒出來（最後一個停住笑他）：一個 → 三個 → 九個全部 */
const ROUTES = [[8], [8, 2, 4], [8, 7, 6, 3, 4, 5, 2, 1, 0]]
/** 九個洞一個一個冒的間隔 */
const GAPS = [0, 0.25, 0.1]

const mole = (i: number) => `m${i}`
const at = (i: number) => HOLES[i]

/**
 * 「咚！」：地鼠從他面前的洞探頭、搖頭晃腦笑他 → 他把槌子舉高高（預備）→ 揮下去，地鼠在最後一刻「咻」地鑽走 →
 * 槌子打在空洞上：那一格鏡頭推近＋震＋同一個「咚」＋💥 → 地鼠從別的洞「啵」地冒出來，一次比一次多洞。k 是第幾次。
 * k 3（回馬槍）：地鼠沒鑽走，被敲中了；後面由外面接。槌子敲完留在洞口（他嚇得放手），下一次再撿起來。
 */
function whack(h: number, k: number, prep = h - 0.6) {
  const moves: Move[] = [
    // 地鼠從他面前的洞探頭，搖頭晃腦笑他
    { at: h - 0.9, actor: mole(T), do: 'pop', dur: 0.15 },
    { at: h - 0.75, actor: mole(T), do: 'hop', amount: 1.5, dur: 0.22 },
    { at: h - 0.5, actor: mole(T), do: 'tilt', amount: 3, dur: 0.35 },
    // 舉高高（第一次槌子從手上冒出來，之後從洞口撿起來）
    { at: prep, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: prep + 0.15, actor: 'yang', do: 'squash', amount: -0.1, dur: 0.3 },
    // 揮下去
    { at: h - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: h - 0.1, actor: 'ham', do: 'moveTo', to: DOWN, dur: 0.1, ease: 'in' },
    { at: h - 0.1, actor: 'ham', do: 'rotateTo', amount: SWING - LIFT, dur: 0.1, ease: 'in' },
  ]
  if (k === 0 || k === 3) moves.push(
    { at: prep, actor: 'ham', do: 'moveTo', to: UP, dur: 0.01 },
    { at: prep, actor: 'ham', do: 'rotateTo', amount: LIFT, dur: 0.01 },
    { at: prep, actor: 'ham', do: 'pop', dur: 0.2 },
  )
  else moves.push(
    { at: prep, actor: 'ham', do: 'moveTo', to: UP, dur: 0.15, ease: 'out' },
    { at: prep, actor: 'ham', do: 'rotateTo', amount: LIFT - SWING, dur: 0.15, ease: 'out' },
  )
  const fx: Fx[] = [
    { at: h, kind: 'burst', x: at(T).x + 2, y: at(T).y - 4, n: 1, dur: 0.4, scale: 1.1 + 0.25 * Math.min(k, 2) },
    { at: h + 0.02, kind: 'burst', x: at(T).x, y: at(T).y - 1, emoji: '💫', n: 6, dur: 0.4, scale: 0.9 },
  ]
  const cues: Cue[] = [{ at: h - 0.9, sfx: 'plop' }, { at: h - 0.12, sfx: 'whoosh' }, { at: h, sfx: 'bonk' }]
  const camera: Camera[] = [
    { at: h, dur: 0.4, do: 'punch', amount: 0.1 + 0.04 * Math.min(k, 2), to: { x: 46, y: 66 } },
    { at: h, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * Math.min(k, 2) },
  ]
  if (k === 3) return { moves, fx, cues, camera }
  // 最後一刻鑽走：槌子打在空洞上
  moves.push(
    { at: h - 0.12, actor: mole(T), do: 'vanish', dur: 0.06 },
    { at: h, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
  )
  // 從別的洞冒出來：一個一個冒（前一個鑽下去、下一個冒上來），最後一個停住笑他
  const route = ROUTES[k]
  const t0 = h + (k === 2 ? 0.25 : 0.35)
  route.forEach((i, j) => {
    const t = t0 + j * GAPS[k]
    const last = j === route.length - 1
    moves.push({ at: t, actor: mole(i), do: 'pop', dur: 0.1 })
    if (!last) moves.push({ at: t + GAPS[k] - 0.02, actor: mole(i), do: 'vanish', dur: 0.04 })
    cues.push({ at: t, sfx: k === 2 ? 'blip' : 'plop' })
  })
  const end = t0 + (route.length - 1) * GAPS[k]
  const last = mole(route[route.length - 1])
  moves.push(
    { at: end + 0.05, actor: last, do: 'hop', amount: 2.5, dur: 0.2 },
    { at: end + 0.25, actor: last, do: 'vanish', dur: 0.06 },
  )
  if (k === 0) {
    // 傻眼、轉頭看那個洞
    moves.push({ at: h + 0.05, actor: 'yang', do: 'shake', amount: 1, dur: 0.4 })
  } else if (k === 1) {
    // 傻眼，然後氣到跺腳
    moves.push(
      { at: h + 0.05, actor: 'yang', do: 'shake', amount: 1.5, dur: 0.4 },
      { at: end + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/stomp' },
      { at: end + 0.15, actor: 'yang', do: 'hop', amount: 3, dur: 0.2 },
      { at: end + 0.4, actor: 'yang', do: 'hop', amount: 3, dur: 0.2 },
    )
    cues.push({ at: end + 0.35, sfx: 'tap' }, { at: end + 0.6, sfx: 'tap' })
  } else {
    // 跟著地鼠轉來轉去，轉到頭暈坐倒
    moves.push(
      { at: h + 0.3, actor: 'yang', do: 'hop', amount: 4, dur: 0.8 },
      { at: h + 0.3, actor: 'yang', do: 'spin', pivot: 'center', times: 2, dur: 0.8 },
      { at: end + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
      // 轉圈時槌子被甩飛出畫面（回馬槍再拿一支新的）
      { at: h + 0.35, actor: 'ham', do: 'moveTo', to: { x: -20, y: 20 }, arc: 10, dur: 0.45, ease: 'out' },
      { at: h + 0.35, actor: 'ham', do: 'spin', times: -2, dur: 0.45 },
      { at: h + 0.8, actor: 'ham', do: 'vanish', dur: 0.05 },
      { at: h + 0.9, actor: 'ham', do: 'rotateTo', amount: -SWING, dur: 0.01 },
    )
    fx.push({ at: end + 0.1, kind: 'dizzy', actor: 'yang', dur: 1.0 })
    cues.push({ at: end + 0.1, sfx: 'bonk' })
  }
  return { moves, fx, cues, camera }
}

const H1 = 2.1
const H2 = 3.65
const PAUSE = 4.7
const H3 = 5.85
const FULL = H3 + 1.4
const PARK = FULL + 0.85
const WORD = PARK + 0.15
/** 回馬槍：真的敲中了——九個洞同時冒出九隻地鼠 */
const H4 = 9.25
const NINE = H4 + 0.55
const SIT = NINE + 0.4
const DUCK = NINE + 0.7
const ASK = 11.0
const ANSWER = 13.6

const w1 = whack(H1, 0)
const w2 = whack(H2, 1)
const w3 = whack(H3, 2, H3 - 0.75)
const w4 = whack(H4, 3)

/** 洞：深咖啡的洞口＋外面一圈翻起來的土（線條效果掛在看不見的錨 rb 上，dx／dy 就是舞台座標） */
function hole(p: V, from: number, to: number): Fx[] {
  const L = 6.8
  return [
    { at: from, dur: to - from, kind: 'line', actor: 'rb', dx: p.x - L, dy: p.y, to: { x: p.x + L, y: p.y }, color: '#8B5A2B', width: 3.6 },
    { at: from, dur: to - from, kind: 'line', actor: 'rb', dx: p.x - L + 0.7, dy: p.y + 0.2, to: { x: p.x + L - 0.7, y: p.y + 0.2 }, color: '#24140A', width: 2.4 },
  ]
}
/** 開場一個一個挖出來；回馬槍以後一個一個填起來 */
const BORN = (i: number) => 0.6 + 0.1 * i
const CLOSE = (i: number) => DUCK + 0.15 + 0.03 * i

const clip: Clip = {
  format: 2,
  char: '九',
  meta: { theme: '打地鼠：九個洞', cast: '楊捷睿＋大槌子＋九個洞裡的地鼠', gags: ['楊捷睿打地鼠：地鼠每次從他面前的洞探頭笑他，他舉高槌子「咚！」敲下去，地鼠早就鑽走、從別的洞冒出來，一次比一次多洞（另一個洞→連冒三個洞，他氣到跺腳→九個洞一個一個全冒一遍，他跟著轉到頭暈坐倒）；回馬槍是他終於敲中了、閉眼得意，九個洞同時冒出九隻一模一樣的地鼠——原來一直有九隻，他一屁股跌坐'] },
  duration: 15,
  bg: { top: '#BFE6FF', bottom: '#EAF7FF', floor: '#BFE08A', scenery: 'hills' },
  actors: [
    // 看不見的錨：洞的線都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    ...HOLES.map((p, i) => ({ id: mole(i), emoji: '🐹', x: p.x, y: headY(p.y), size: MS, hidden: true, float: true })),
    { id: 'yang', emoji: 'hero:yang/walk', x: X, y: P, size: S, flip: true, hidden: true },
    { id: 'ham', emoji: '🔨', x: UP.x, y: UP.y, size: B, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：他走進來，指著字框「九！」
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 第 1 次
    ...w1.moves,
    { at: H1 + 1.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 2 次
    ...w2.moves,
    // 第 3 次前停一拍：托下巴、冒汗——地鼠已經在洞口等他
    { at: PAUSE, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    ...w3.moves,
    // 讓位：他爬起來，指著九個洞——九個！
    { at: PARK + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: WORD + 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: WORD + 1.0, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：敲中了！地鼠被敲扁、冒金星
    ...w4.moves,
    { at: H4, actor: mole(T), do: 'squash', amount: 0.45, dur: 0.5 },
    { at: H4 + 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: H4 + 0.12, actor: 'yang', do: 'hop', amount: 2.5, dur: 0.25 },
    // 九個洞同時冒出九隻一模一樣的地鼠，一起笑他
    ...HOLES.flatMap((_, i): Move[] => i === T ? [] : [{ at: NINE, actor: mole(i), do: 'pop', dur: 0.15 }]),
    ...HOLES.map((_, i): Move => ({ at: NINE + 0.2, actor: mole(i), do: 'hop', amount: 2, dur: 0.25 })),
    ...HOLES.map((_, i): Move => ({ at: NINE + 0.5, actor: mole(i), do: 'shake', amount: 1, dur: 0.4 })),
    { at: NINE + 0.02, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: NINE + 0.02, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
    // 一屁股跌坐
    { at: SIT, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: SIT, actor: 'yang', do: 'moveTo', to: { x: X - 6, y: P }, arc: 5, dur: 0.25, ease: 'out' },
    // 九隻一起鑽回去，槌子也被拖進洞裡
    ...HOLES.map((_, i): Move => ({ at: DUCK + 0.03 * i, actor: mole(i), do: 'vanish', dur: 0.08 })),
    { at: DUCK, actor: 'ham', do: 'moveTo', to: { x: at(T).x, y: at(T).y - 2 }, dur: 0.15, ease: 'in' },
    { at: DUCK + 0.12, actor: 'ham', do: 'vanish', dur: 0.08 },
    // 問他：他在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 30, y: P + 2 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.05, dur: 0.3 },
    { at: 12.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.2, actor: 'yang', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：往左跑出去
    { at: ANSWER + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.1, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'yang', do: 'moveTo', to: { x: -35, y: P + 2 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：槌子「咚」地敲出一撇；第 2 次：地鼠最後冒出來的洞口飛出橫折彎鉤
    { at: H1 + 0.55, dur: 0.6, strokes: [0], from: at(T), color: partColor('丿') },
    { at: H2 + 1.0, dur: 0.6, strokes: [1], from: at(ROUTES[1][2]), color: partColor('乙') },
  ],
  glyph: [
    // 第 3 次：九個洞冒完，整個字亮起來
    { at: H3 + 1.15, dur: 0.4, do: 'pulse' },
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...HOLES.flatMap((p, i) => hole(p, BORN(i), CLOSE(i))),
    // 挖洞時翻起一點土
    ...HOLES.map((p, i): Fx => ({ at: BORN(i), kind: 'burst', x: p.x, y: p.y - 2, emoji: '🟤', n: 4, dur: 0.3, scale: 0.4 })),
    ...w1.fx,
    ...w2.fx,
    // 第 3 次前停一拍
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'yang', dur: 0.8 },
    ...w3.fx,
    // 九個：一個洞一個洞亮一下
    ...HOLES.map((p, i): Fx => ({ at: WORD + 0.1 * i, kind: 'burst', x: p.x, y: p.y - 3, emoji: '✨', n: 6, dur: 0.45, scale: 1.1 })),
    // 回馬槍
    ...w4.fx,
    { at: H4 + 0.1, kind: 'dizzy', actor: mole(T), dur: 0.5 },
    { at: NINE, kind: 'burst', x: 90, y: 72, emoji: '💨', n: 9, dur: 0.4, scale: 1.2 },
    ...HOLES.map((p, i): Fx => ({ at: CLOSE(i) - 0.05, kind: 'burst', x: p.x, y: p.y - 1, emoji: '🟤', n: 4, dur: 0.25, scale: 0.4 })),
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 九個洞一直留在畫面裡：國字拼好前不讓自動取景推近到只剩他
    { at: 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 84, y: 50 } },
    ...w1.camera,
    ...w2.camera,
    ...w3.camera,
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.03, to: { x: 84, y: 50 } },
    ...w4.camera,
    { at: NINE, dur: 0.45, do: 'punch', amount: 0.2, to: { x: 88, y: 70 } },
    { at: NINE, dur: 0.3, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: FULL, dur: 0.05, level: -0.25 },
    { at: FULL + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '九' },
    // 九個洞一個一個挖出來
    ...HOLES.map((_, i): Cue => ({ at: BORN(i), sfx: 'blip' })),
    ...w1.cues,
    ...w2.cues,
    { at: PAUSE + 0.2, sfx: 'gulp' },
    ...w3.cues,
    { at: FULL + 0.05, say: '九' },
    { at: WORD, say: '九個' },
    ...HOLES.map((_, i): Cue => ({ at: WORD + 0.1 * i, sfx: 'blip' })),
    ...w4.cues,
    { at: H4 + 0.05, sfx: 'boing' },
    { at: NINE, sfx: 'poof' },
    { at: NINE + 0.05, sfx: 'plop' },
    { at: SIT, sfx: 'bonk' },
    { at: DUCK, sfx: 'whoosh' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '九' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
