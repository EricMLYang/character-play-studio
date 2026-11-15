import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 五（v2）：生日蛋糕上插著五根不同顏色的魔術蠟燭。愛現的忍者小老鼠要表演一口氣全部吹熄——每次吸一大口氣「呼——」，五根一起熄掉，
// 他閉眼得意，蠟燭就「啵、啵、啵、啵、啵」一根一根自己點回來（又是五根），一次比一次快，他一次比一次慘：
// 傻眼跳起來 → 嚇得往後跌坐 → 冒汗想一想、吸最大一口氣再吹，被嚇得往後彈飛趴扁。每次掉出一組筆畫：上面一橫、中間的叉、下面一橫（從趴扁的他身上）。
// 語詞「五歲」（生日蛋糕上五根蠟燭＝五歲；「五顏六色」的色是多音字被擋）：五根蠟燭一根一根亮過去，他舉起一隻手比五。回馬槍：他再吹一次，這次五根全熄、等了一拍都沒點回來，他高興得跳起來——
// 五根火苗一起「啵」地點回來，而且一起往他「呼——」地反吹回去，把他吹飛。
// 五、五、五歲、這是什麼字？、五
const MS = 38
const MY = 77 - 0.42 * MS // 小老鼠站在地上的 y
/** 小老鼠吹蠟燭站的地方（蛋糕左邊，面向右） */
const MX = 96
/** 蛋糕（偏右：國字放大到正中央時不擋字）；圖拉寬成長長的生日蛋糕 */
const CX = 133
const CAKE = 40
const CAKE_W = 1.3
/** 蠟燭：五根一樣大、排一排、中間留縫，一眼數得出五根 */
const CS = 15
const CY = 52.5
const GAP = 8.5
const CANDLES = ['c1', 'c2', 'c3', 'c4', 'c5']
const cxOf = (i: number) => CX + (i - 2) * GAP
/** 五根五個顏色：紅、黃、綠、藍、紫 */
const TINTS = [
  'sepia(1) saturate(8) hue-rotate(-40deg) brightness(0.95)',
  'sepia(1) saturate(6) hue-rotate(5deg) brightness(1.05)',
  'sepia(1) saturate(6) hue-rotate(70deg) brightness(0.9)',
  'sepia(1) saturate(7) hue-rotate(170deg) brightness(0.9)',
  'sepia(1) saturate(7) hue-rotate(235deg) brightness(0.9)',
]
/** 熄掉：切掉上面那截火苗，只剩蠟燭 */
const OUT = 0.4
/** 熄掉的蠟燭：灰灰的 */
const GRAY = 'grayscale(1) brightness(0.85)'
/** 火苗的高度（吹氣的目標） */
const FLAME = CY - 6

/** 一根一根點回來的間隔：一次比一次快 */
const RELIGHT_GAP = [0.1, 0.085, 0.065]

/**
 * 「呼——」：吸一大口氣（身體拉長）→ 吹，一串 💨 飛到蠟燭上 → 五根一起熄、冒白煙 → 他閉眼得意。
 * 前三次（k 0～2）：蠟燭「啵、啵、啵、啵、啵」一根一根點回來，第五根點回來那一下他嚇一跳，一次比一次慘。回傳嚇到那一刻 shock。
 * 第四次（k 3）：熄了以後沒有點回來，他高興得跳起來；五根一起點回來，火苗往他反吹回去，把他吹飛。
 * at 是吹出去那一刻。
 */
function blow(at: number, k: number) {
  const moves: Move[] = [
    // 吸氣：鼓臉、身體拉長
    { at: at - 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/blow' },
    { at: at - 0.33, actor: 'mouse', do: 'squash', amount: -0.12 - 0.04 * Math.min(k, 2), dur: 0.3 },
    // 吹
    { at, actor: 'mouse', do: 'squash', amount: 0.1, dur: 0.2 },
    // 閉眼得意
    { at: at + 0.38, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
  ]
  const fx: Fx[] = [
    { at, kind: 'blow', actor: 'mouse', dx: 9, dy: 15, to: { x: CX - 10, y: FLAME }, n: 4 + k, dur: 0.3, scale: 1.1 + 0.2 * Math.min(k, 2) },
  ]
  const cues: Cue[] = [{ at: at - 0.35, sfx: 'gulp' }, { at, sfx: 'whoosh' }, { at: at + 0.14, sfx: 'poof' }]
  const camera: Camera[] = []
  CANDLES.forEach((c, i) => {
    moves.push(
      { at: at + 0.12 + 0.03 * i, actor: c, do: 'swap', half: 'bottom', cut: OUT },
      // 熄掉的蠟燭變灰，一眼看得出哪幾根是亮的
      { at: at + 0.12 + 0.03 * i, actor: c, do: 'tint', filter: GRAY },
    )
    fx.push({ at: at + 0.12 + 0.03 * i, kind: 'puff', actor: c, dx: -2.5 * i, dy: 4, dur: 0.5, scale: 0.75 })
  })
  let shock = 0
  if (k < 3) {
    const g = RELIGHT_GAP[k]
    const r = at + 0.72
    CANDLES.forEach((c, i) => {
      moves.push(
        { at: r + g * i, actor: c, do: 'swap', half: 'whole' },
        { at: r + g * i, actor: c, do: 'tint', filter: TINTS[i] },
        { at: r + g * i, actor: c, do: 'hop', amount: 2.5, dur: 0.18 },
        { at: r + g * i, actor: c, do: 'flash', dur: 0.25 },
      )
      cues.push({ at: r + g * i, sfx: 'blip' })
    })
    shock = r + 4 * g + 0.06
    moves.push({ at: shock, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' })
    fx.push(
      { at: shock - 0.06, kind: 'burst', x: CX, y: FLAME - 2, emoji: '✨', n: 6 + 2 * k, dur: 0.4, scale: 1.1 + 0.25 * k },
      { at: shock, kind: 'pop', actor: 'mouse', emoji: '❗', dx: -4, dur: 0.45, scale: 1.3 + 0.2 * k },
    )
    camera.push(
      { at: shock, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: MX + 12, y: 55 } },
      { at: shock, dur: 0.3, do: 'shake', amount: 0.7 + 0.45 * k },
    )
    cues.push({ at: shock, sfx: 'boing' })
    if (k === 0) {
      // 傻眼，原地跳一下
      moves.push({ at: shock, actor: 'mouse', do: 'hop', amount: 5, dur: 0.3 })
    } else if (k === 1) {
      // 嚇得往後跳、跌坐
      moves.push(
        { at: shock, actor: 'mouse', do: 'moveTo', to: { x: MX - 12, y: MY }, arc: 8, dur: 0.32, ease: 'out' },
        { at: shock + 0.32, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
      )
      cues.push({ at: shock + 0.32, sfx: 'bonk' })
    } else {
      // 彈飛、翻一圈、趴扁在左邊
      moves.push(
        { at: shock + 0.05, actor: 'mouse', do: 'moveTo', to: { x: 32, y: MY }, arc: 12, dur: 0.45, ease: 'out' },
        { at: shock + 0.05, actor: 'mouse', do: 'spin', pivot: 'center', times: -1, dur: 0.4 },
        { at: shock + 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
      )
      fx.push({ at: shock + 0.5, kind: 'burst', x: 32, y: 70, n: 1, dur: 0.4, scale: 1.8 })
      camera.push({ at: shock + 0.5, dur: 0.3, do: 'shake', amount: 1.6 })
      cues.push({ at: shock + 0.1, sfx: 'whoosh' }, { at: shock + 0.5, sfx: 'bonk' }, { at: shock + 0.55, sfx: 'crack' })
    }
  } else {
    // 回馬槍：等了一拍都沒點回來……他睜眼、高興得跳起來
    moves.push(
      { at: at + 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
      { at: at + 0.6, actor: 'mouse', do: 'hop', amount: 6, dur: 0.3 },
    )
    cues.push({ at: at + 0.6, sfx: 'cheer' })
    shock = at + 0.95
    CANDLES.forEach((c, i) => {
      moves.push(
        { at: shock, actor: c, do: 'swap', half: 'whole' },
        { at: shock, actor: c, do: 'tint', filter: TINTS[i] },
        { at: shock, actor: c, do: 'hop', amount: 3, dur: 0.2 },
        { at: shock, actor: c, do: 'flash', dur: 0.3 },
      )
    })
    // 五根火苗一起往他反吹回去
    fx.push(
      { at: shock + 0.05, kind: 'blow', actor: 'c3', dx: 0, dy: -2, to: { x: MX, y: MY - 6 }, n: 7, dur: 0.35, scale: 2.2 },
      { at: shock + 0.05, kind: 'blow', actor: 'c1', dx: 0, dy: -2, to: { x: MX - 4, y: MY - 12 }, n: 4, dur: 0.35, scale: 1.6 },
      { at: shock + 0.05, kind: 'blow', actor: 'c5', dx: 0, dy: -2, to: { x: MX - 4, y: MY }, n: 4, dur: 0.35, scale: 1.6 },
    )
    // 反吹的那一下，蛋糕被往反方向推出畫面（像火箭往後噴）
    moves.push(
      { at: shock + 0.1, actor: 'cake', do: 'moveTo', to: { x: CX + 75, y: 77 - 0.42 * CAKE }, dur: 0.45, ease: 'in' },
      ...CANDLES.map((c, i): Move => ({ at: shock + 0.1, actor: c, do: 'moveTo', to: { x: cxOf(i) + 75, y: CY }, dur: 0.45, ease: 'in' })),
    )
    moves.push(
      { at: shock + 0.12, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: shock + 0.2, actor: 'mouse', do: 'moveTo', to: { x: 32, y: MY }, arc: 12, dur: 0.5, ease: 'out' },
      { at: shock + 0.2, actor: 'mouse', do: 'spin', pivot: 'center', times: -2, dur: 0.45 },
      { at: shock + 0.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    )
    fx.push(
      { at: shock + 0.12, kind: 'pop', actor: 'mouse', emoji: '❗', dx: -4, dur: 0.4, scale: 1.6 },
      { at: shock + 0.7, kind: 'burst', x: 32, y: 70, n: 1, dur: 0.4, scale: 2.4 },
      { at: shock + 0.75, kind: 'dizzy', actor: 'mouse', dur: 0.4 },
    )
    camera.push(
      { at: shock + 0.05, dur: 0.45, do: 'punch', amount: 0.25, to: { x: MX + 10, y: 55 } },
      { at: shock + 0.7, dur: 0.3, do: 'shake', amount: 2.2 },
    )
    cues.push({ at: shock, sfx: 'blip' }, { at: shock + 0.05, sfx: 'whoosh' }, { at: shock + 0.7, sfx: 'bonk' }, { at: shock + 0.75, sfx: 'boing' })
  }
  return { moves, fx, cues, camera, shock }
}

const H1 = 1.6, H2 = 3.45, H3 = 6.1
const b1 = blow(H1, 0), b2 = blow(H2, 1), b3 = blow(H3, 2)
const FULL = b3.shock + 0.1 + 0.6 // 國字填滿
const PARK = FULL + 0.9
const WORD = PARK + 0.15
const H4 = WORD + 0.5
const b4 = blow(H4, 3)
const ASK = 11.05
const ANSWER = 13.65

const clip: Clip = {
  format: 2,
  char: '五',
  meta: { theme: '吹不熄的生日蠟燭', cast: '忍者小老鼠＋生日蛋糕＋五根魔術蠟燭', gags: ['愛現的小老鼠要一口氣吹熄蛋糕上的五根蠟燭，每次一吹全熄、他閉眼得意，五根就一根一根自己點回來，一次比一次快，他一次比一次慘（傻眼跳起來→嚇得跌坐→吸最大一口氣再吹，被嚇得彈飛趴扁）；回馬槍是五根熄了以後沒點回來、他高興得跳起來，五根火苗卻一起點回來、往他反吹，把他吹飛'] },
  duration: 15,
  bg: { top: '#FFE9F0', bottom: '#FFF7FA', floor: '#E8C9A0', scenery: 'room' },
  actors: [
    { id: 'cake', emoji: 'prop:cake', x: CX, y: 77 - 0.42 * CAKE, size: CAKE },
    ...CANDLES.map((id, i) => ({ id, emoji: '🕯️', x: cxOf(i), y: CY, size: CS, float: true, tint: TINTS[i] })),
    { id: 'mouse', emoji: 'hero:mouse/dash', x: MX, y: MY, size: MS, flip: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'cake', do: 'stretchTo', amount: CAKE_W, dur: 0.01 },
    // 蠟燭拉細拉高：一根一根分得開
    ...CANDLES.map((c): Move => ({ at: 0, actor: c, do: 'stretchTo', amount: 0.7, dur: 0.01 })),
    // 開場：小老鼠咻地衝進來，指著字框「五！」——蛋糕上的五根蠟燭一根一根亮過去
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -20, y: MY }, dur: 0.4, ease: 'out' },
    { at: 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    ...CANDLES.flatMap((c, i): Move[] => [
      { at: 0.95 + 0.11 * i, actor: c, do: 'hop', amount: 2.5, dur: 0.18 },
      { at: 0.95 + 0.11 * i, actor: c, do: 'flash', dur: 0.25 },
    ]),
    { at: 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    // 第 1 次
    ...b1.moves,
    { at: b1.shock + 0.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 第 2 次
    ...b2.moves,
    { at: b2.shock + 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stomp' },
    { at: b2.shock + 0.5, actor: 'mouse', do: 'hop', amount: 2, dur: 0.2 },
    { at: b2.shock + 0.65, actor: 'mouse', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.25 },
    // 第 3 次前停一拍：托下巴盯著蠟燭、冒汗……蠟燭抖一抖
    { at: H3 - 0.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    ...CANDLES.map((c): Move => ({ at: H3 - 0.7, actor: c, do: 'shake', amount: 0.8, dur: 0.3 })),
    ...b3.moves,
    // 字拼好、讓位：他爬起來走回蛋糕旁邊，舉手比五——五歲！
    { at: PARK - 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: PARK - 0.1, actor: 'mouse', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.35 },
    { at: WORD - 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/know' },
    ...CANDLES.flatMap((c, i): Move[] => [
      { at: WORD + 0.12 * i, actor: c, do: 'hop', amount: 3, dur: 0.2 },
      { at: WORD + 0.12 * i, actor: c, do: 'flash', dur: 0.3 },
    ]),
    // 回馬槍
    ...b4.moves,
    // 問他：他在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'mouse', do: 'moveTo', to: { x: 30, y: MY + 2 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'mouse', do: 'scaleTo', amount: 1.1, dur: 0.3 },
    { at: ASK + 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 12.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 12.2, actor: 'mouse', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'mouse', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, actor: 'mouse', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：咻地往左衝出去
    { at: ANSWER + 0.08, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: ANSWER + 0.08, actor: 'mouse', do: 'flip' },
    { at: ANSWER + 0.1, actor: 'mouse', do: 'moveTo', to: { x: -30, y: MY + 2 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 每次第五根點回來那一下掉出一組：上面一橫（從點回來的火苗）、中間的叉（從冒交叉白煙的中間那根）、下面一橫（從趴扁的他身上）
    { at: b1.shock + 0.08, dur: 0.6, strokes: [0], from: 'c5', color: partColor('一') },
    { at: b2.shock + 0.08, dur: 0.6, strokes: [1, 2], from: 'c3', color: partColor('㐅') },
    { at: b3.shock + 0.1, dur: 0.6, strokes: [3], from: 'mouse', color: partColor('一') },
  ],
  glyph: [
    { at: b1.shock + 0.05, dur: 0.4, do: 'wobble' },
    { at: b2.shock + 0.05, dur: 0.4, do: 'wobble' },
    { at: FULL + 0.05, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    ...b2.fx,
    { at: b2.shock + 0.5, kind: 'pop', actor: 'mouse', emoji: '😤', dx: -6, dur: 0.45 },
    // 第 3 次前停一拍
    { at: H3 - 0.85, kind: 'sweat', actor: 'mouse', dur: 0.55 },
    ...b3.fx,
    { at: b3.shock + 0.6, kind: 'dizzy', actor: 'mouse', dur: 0.6 },
    // 五歲：五根一根一根亮過去，他舉手比五
    { at: WORD, kind: 'pop', actor: 'mouse', emoji: '🖐️', dx: 10, dy: 2, dur: 0.9, scale: 1.8 },
    { at: WORD + 0.5, kind: 'burst', x: CX, y: FLAME - 4, emoji: '✨', n: 8, dur: 0.45, scale: 1.3 },
    ...b4.fx,
    { at: ANSWER, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    ...b4.camera,
  ],
  lights: [
    { at: FULL + 0.05, dur: 0.05, level: -0.35 },
    { at: FULL + 0.1, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '五' },
    ...CANDLES.map((_, i): Cue => ({ at: 0.95 + 0.11 * i, sfx: 'blip' })),
    ...b1.cues,
    ...b2.cues,
    { at: H3 - 0.7, sfx: 'gulp' },
    ...b3.cues,
    { at: FULL + 0.1, say: '五' },
    { at: WORD, say: '五歲' },
    ...b4.cues,
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '五' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
