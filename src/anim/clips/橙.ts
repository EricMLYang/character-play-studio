import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 橙（v2）：愛現的忍者小老鼠要踩出柳橙汁。畫面中間一顆超大的柳橙，他每次蹲低、一跳上去用力一踩——
// 柳橙一扁，「噗滋！」噴出一道橙色的汁，把他沖下來、淋得一身橙色，一次比一次大、他一次比一次橙：
// 沖下來站好、臉染成淡橙色（木從柳橙的蒂頭飛出來）；沖上去轉一圈跌坐、半身橙色、地上一攤橙汁（癶從他踩下去的腳底彈出來）；
// 先停一拍：他托下巴看柳橙、柳橙抖一抖，他蹲最低、跳最高——噴泉把他沖上天，掉下來趴扁在一大攤橙汁裡，整隻橙色（豆是柳橙的籽）。
// 回馬槍：他學聰明了，一踩下去馬上跳開躲到另一邊，噴泉噴上天沒打到他，他得意大笑——
// 結果噴上天的汁整片落下來，下一場最大的橙色雨，他變成最橙的一隻。
// 最後畫面暗下來只剩「橙」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「橙！」，然後退場只留字。
// 橙、橙、柳橙、這是什麼字？、橙
const SM = 34 // 小老鼠
const M = 77 - 0.42 * SM // 他站在地上的 y
const SO = 46 // 大柳橙
const O = 77 - 0.42 * SO
/** 大柳橙在畫面中間偏右 */
const OX = 100
/** 小老鼠每次從這裡起跳 */
const HOME = 64
/** 站在柳橙頂上時的 y（腳踩在柳橙頂） */
const TOP = 26.5
/** 橙汁從柳橙頂噴出來的地方（固定在原位：第三次柳橙滾走時噴泉不跟著跑） */
const SPOUT = 41
/** 橙汁的顏色 */
const JUICE = '#FF8A00'
/** 字框：一開始就停在左上角（背後是素色的天空） */
const FRAME = { x: 28, y: 21 }
const FRAME_K = 0.5
/** 他一次比一次橙（CSS filter） */
const ORANGE = [
  'sepia(.6) saturate(2.8) hue-rotate(-14deg)',
  'sepia(.75) saturate(3.2) hue-rotate(-16deg)',
  'sepia(1) saturate(4.5) hue-rotate(-18deg)',
  'sepia(1) saturate(7) hue-rotate(-22deg) brightness(1.05)',
]

/** 地上那一攤橙汁：一條貼著地板的粗橙線，一次比一次寬 */
const puddle = (at: number, end: number, x0: number, x1: number, w: number): Fx =>
  ({ at, dur: end - at, kind: 'line', actor: 'pud', dx: x0 - OX, to: { x: x1, y: 75.6 }, color: JUICE, width: w })

/**
 * 「噗滋！」：他蹲低預備 → 一跳跳上柳橙頂 → 用力一踩、柳橙一扁 → 噴出一道橙汁（粗橙線＋🟠 噴泉）＋鏡頭推近＋震＋同一個音效。
 * 那一刻要的東西都在這裡，四次一模一樣；k 越大噴得越高、越粗、越多。他被沖去哪裡由呼叫的地方各自寫。
 */
function squirt(at: number, k: number, from = HOME) {
  const moves: Move[] = [
    // 預備：蹲低
    { at: at - 0.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: at - 0.6, actor: 'mouse', do: 'squash', amount: 0.15 + 0.04 * k, dur: 0.2 },
    // 一跳跳上柳橙頂
    { at: at - 0.42, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
    { at: at - 0.42, actor: 'mouse', do: 'moveTo', from: { x: from, y: M }, to: { x: OX, y: TOP }, arc: 9 + 2 * k, dur: 0.3, ease: 'out' },
    // 用力一踩：柳橙一扁，他跟著沉下去
    { at: at - 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stomp' },
    { at: at - 0.1, actor: 'orange', do: 'squash', amount: 0.22 + 0.05 * k, dur: 0.3 },
    { at: at - 0.1, actor: 'mouse', do: 'hop', amount: -(2.5 + 0.8 * k), dur: 0.3 },
  ]
  const fx: Fx[] = [
    // 一道粗粗的橙汁往上噴（從柳橙頂、他腳邊衝上去）
    { at, kind: 'line', actor: 'pud', dx: -3, dy: SPOUT - 75.6, to: { x: OX - 4, y: 14 - 9 * k }, color: JUICE, width: 3.2 + 1.3 * k, dur: 0.45 + 0.1 * k },
    // 🟠 噴泉：一次比一次多、比一次大
    { at, kind: 'fountain', x: OX, y: SPOUT, emoji: '🟠', n: 7 + 3 * k, dur: 0.9 + 0.1 * k, scale: 1.5 + 0.22 * k },
    // 柳橙旁邊噴一圈 🍊 汁花
    { at, kind: 'burst', x: OX, y: SPOUT + 8, emoji: '🟠', n: 6 + 2 * k, dur: 0.45, scale: 1.3 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.07 + 0.04 * k, to: { x: OX - 8, y: 40 } },
    { at, dur: 0.35, do: 'shake', amount: 0.8 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at: at - 0.42, sfx: 'whoosh' }, { at: at - 0.1, sfx: 'plop' }, { at, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bubble' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues }
}

/** 被橙汁淋到：💦 換成 🟠 打在他身上，他染得更橙 */
const drench = (at: number, k: number): { moves: Move[]; fx: Fx[] } => ({
  moves: [{ at, actor: 'mouse', do: 'tint', filter: ORANGE[k] }],
  fx: [
    { at: at - 0.15, kind: 'rain', actor: 'mouse', emoji: '🟠', dy: -6, n: 6 + 2 * k, dur: 0.6, scale: 1.4 + 0.3 * k },
    { at, kind: 'burst', actor: 'mouse', emoji: '🟠', n: 6, dy: 6, dur: 0.4, scale: 1 + 0.25 * k },
  ],
})

const S1 = 1.9, S2 = 3.7, S3 = 6.25, S4 = 9.65
const q1 = squirt(S1, 0)
const q2 = squirt(S2, 1)
const q3 = squirt(S3, 2)
/** 第四次他從語詞那一刻站的地方起跳 */
const WORD_X = 72
const q4 = squirt(S4, 3, WORD_X)
const d1 = drench(S1 + 0.35, 0)
const d2 = drench(S2 + 0.55, 1)
const d3 = drench(S3 + 0.85, 2)
/** 回馬槍：他踩完馬上跳到右邊躲開 */
const DODGE = 128
/** 噴上天的汁整片落下來 */
const RAIN = 10.35
/** 第三次噴太大力，柳橙往後滾到這裡 */
const ROLL = 132

const clip: Clip = {
  format: 2,
  char: '橙',
  meta: { theme: '踩柳橙噴橙汁', cast: '忍者小老鼠＋大柳橙', gags: ['小老鼠每次跳上大柳橙用力一踩，柳橙就噗滋噴出一道橙汁把他沖下來、淋得一身橙色，一次比一次大（沖下來→沖上去跌坐→沖上天趴扁在橙汁裡）；回馬槍是他一踩就跳開躲過噴泉、得意大笑，結果噴上天的汁整片落下來，他變成最橙的一隻'] },
  duration: 15,
  bg: { top: '#CDEBFF', bottom: '#F2FAFF', floor: '#CFE3B0', scenery: 'hills' },
  actors: [
    // 橙汁那一攤的錨點（看不見；柳橙會跳，錨點不動）
    { id: 'pud', emoji: '⭐', x: OX, y: 75.6, size: 4, hidden: true },
    { id: 'orange', emoji: '🍊', x: OX, y: O, size: SO, pivot: 'center' },
    // 姿勢圖朝左，翻過來面向右邊的柳橙
    { id: 'mouse', emoji: 'hero:mouse/idle', x: HOME, y: M, size: SM, hidden: true, flip: true },
  ],
  moves: [
    // 登場：衝進來、看到大柳橙流口水
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: M }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    // 第 1 次：噗滋！沖下來站好，傻眼，臉染成淡橙色
    ...q1.moves,
    { at: S1 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: S1 + 0.05, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: M }, arc: 8, dur: 0.4, ease: 'in' },
    ...d1.moves,
    // 不服氣：跺腳
    { at: 2.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stomp' },
    { at: 2.85, actor: 'mouse', do: 'hop', amount: 2, dur: 0.2 },
    // 第 2 次：噗滋！沖上去轉一圈，跌坐在後面
    ...q2.moves,
    { at: S2 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: S2 + 0.05, actor: 'mouse', do: 'moveTo', to: { x: HOME - 14, y: M }, arc: 18, dur: 0.6, ease: 'inOut' },
    { at: S2 + 0.05, actor: 'mouse', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
    { at: S2 + 0.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    ...d2.moves,
    // 爬起來走回起跳的地方
    { at: 4.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: 4.9, actor: 'mouse', do: 'moveTo', to: { x: HOME, y: M }, dur: 0.35 },
    // 先停一拍：托下巴看柳橙，柳橙抖一抖（又要來了）
    { at: 5.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: 5.3, actor: 'orange', do: 'shake', amount: 0.9, dur: 0.3 },
    // 第 3 次：蹲最低、跳最高——噗滋！沖上天，掉下來趴扁在一大攤橙汁裡
    ...q3.moves,
    { at: S3 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: S3 + 0.05, actor: 'mouse', do: 'moveTo', to: { x: 26, y: M }, arc: 24, dur: 0.8, ease: 'inOut' },
    // 噴太大力，柳橙自己往後咕嚕咕嚕滾到右邊（國字回中央時讓出位置）
    { at: S3 + 0.2, actor: 'orange', do: 'moveTo', to: { x: ROLL, y: O }, dur: 0.6, ease: 'out' },
    { at: S3 + 0.2, actor: 'orange', do: 'rotateTo', amount: 110, dur: 0.6, ease: 'out' },
    { at: S3 + 0.05, actor: 'mouse', do: 'spin', times: 2, dur: 0.75, pivot: 'center' },
    { at: S3 + 0.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
    ...d3.moves,
    // 國字回中央：他撐起來坐著傻眼
    { at: 7.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    // 語詞那一刻：他走到柳橙旁邊，指著它：柳橙！柳橙跳一下
    // 柳橙咕嚕咕嚕滾回中間
    { at: 8.1, actor: 'orange', do: 'moveTo', to: { x: OX, y: O }, dur: 0.45, ease: 'out' },
    { at: 8.1, actor: 'orange', do: 'rotateTo', amount: -110, dur: 0.45, ease: 'out' },
    { at: 8.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: 8.2, actor: 'mouse', do: 'moveTo', to: { x: WORD_X, y: M }, dur: 0.3 },
    { at: 8.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 8.5, actor: 'orange', do: 'hop', amount: 4, dur: 0.35 },
    // 回馬槍：第 4 次——一踩下去馬上跳開，躲到另一邊
    ...q4.moves,
    { at: S4 + 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
    { at: S4 + 0.05, actor: 'mouse', do: 'moveTo', to: { x: DODGE, y: M }, arc: 12, dur: 0.35, ease: 'out' },
    { at: S4 + 0.05, actor: 'mouse', do: 'flip' },
    // 噴泉沒打到他：得意大笑
    { at: S4 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    // 噴上天的汁整片落下來：最大的一次，他整隻變最橙
    { at: RAIN, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/duck' },
    { at: RAIN + 0.35, actor: 'mouse', do: 'tint', filter: ORANGE[3] },
    { at: RAIN + 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: RAIN + 0.35, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.3 },
    // 問他：他走到右前方、變大，面向左邊的字
    { at: 11.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 11.0, actor: 'mouse', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 11.0, actor: 'mouse', do: 'moveTo', to: { x: 122, y: M + 2 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 12.0, actor: 'mouse', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: 12.6, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.25 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'mouse', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: 13.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 13.45, actor: 'mouse', do: 'hop', amount: 6, dur: 0.25 },
    // 退場：他衝出去，柳橙咕嚕咕嚕滾著跟上，畫面只留下字
    { at: 13.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 13.7, actor: 'mouse', do: 'flip' },
    { at: 13.72, actor: 'mouse', do: 'moveTo', to: { x: 205, y: M + 2 }, dur: 0.24, ease: 'in' },
    { at: 13.7, actor: 'orange', do: 'moveTo', to: { x: 215, y: O }, dur: 0.3, ease: 'in' },
    { at: 13.7, actor: 'orange', do: 'rotateTo', amount: 300, dur: 0.3, ease: 'in' },
  ],
  builds: [
    // 每次噗滋一噴，筆畫飛上去：木從柳橙的蒂頭（柳橙長在樹上）、癶從他踩下去的腳底、豆是柳橙的籽
    { at: S1 + 0.4, dur: 0.55, strokes: [0, 1, 2, 3], from: 'orange', color: partColor('木') },
    { at: S2 + 0.25, dur: 0.55, strokes: [4, 5, 6, 7, 8], from: 'mouse', color: partColor('癶') },
    { at: S3 + 0.3, dur: 0.6, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'orange', color: partColor('豆') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: 7.25, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.15, dur: 0.4, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小老鼠
    { at: 10.9, dur: 3.1, do: 'ask', keep: ['mouse'], to: { x: 62, y: 43 }, amount: 0.82 },
    { at: 11.0, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...q1.fx,
    ...d1.fx,
    { at: S1 + 0.5, kind: 'sweat', actor: 'mouse' },
    ...q2.fx,
    ...d2.fx,
    ...q3.fx,
    ...d3.fx,
    { at: S3 + 0.95, kind: 'dizzy', actor: 'mouse', dy: 6, dur: 0.6 },
    ...q4.fx,
    // 地上的橙汁一次比一次大攤（下一次蓋過上一次）
    puddle(S2 + 0.4, S3 + 0.6, HOME - 26, OX + 18, 2.4),
    puddle(S3 + 0.6, RAIN + 0.3, 18, OX + 24, 3.4),
    puddle(RAIN + 0.3, 10.95, 8, 156, 4.4),
    // 噴上天的汁整片落下來：整個畫面下一場最大的 🟠 雨
    ...[28, 55, 82, 109, 134].map((x, i): Fx => ({ at: RAIN - 0.05 + 0.04 * i, kind: 'rain', x, y: 12, emoji: '🟠', n: 8, dur: 0.75, scale: 2.2 })),
    { at: RAIN + 0.35, kind: 'burst', actor: 'mouse', emoji: '🟠', n: 8, dy: 6, dur: 0.5, scale: 1.5 },
    { at: 13.45, kind: 'burst', x: 62, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 整支用手寫的取景（自動取景會只推近他、把柳橙頂上的噴泉切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 82, y: 45 } },
    ...q1.camera,
    ...q2.camera,
    ...q3.camera,
    { at: S3 + 0.85, dur: 0.3, do: 'shake', amount: 1.3 },
    // 國字回中央放大時退回全景
    { at: 7.1, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    // 語詞那一刻：推近他和柳橙
    { at: 8.3, dur: 0.4, do: 'zoom', amount: 1.12, to: { x: 92, y: 48 } },
    { at: 9.0, dur: 0.3, do: 'zoom', amount: 1.03, to: { x: 82, y: 45 } },
    ...q4.camera,
    { at: RAIN + 0.35, dur: 0.45, do: 'shake', amount: 1.8 },
  ],
  lights: [],
  cues: [
    { at: 0.05, sfx: 'whoosh' },
    { at: 0.7, say: '橙' },
    ...q1.cues,
    ...q2.cues,
    { at: S2 + 0.65, sfx: 'plop' },
    { at: 5.3, sfx: 'tap' },
    ...q3.cues,
    { at: S3 + 0.85, sfx: 'bonk' },
    { at: 7.45, say: '橙' },
    { at: 8.5, say: '柳橙' },
    ...q4.cues,
    { at: S4 + 0.4, sfx: 'hic' },
    { at: RAIN, sfx: 'splash' },
    { at: RAIN + 0.1, sfx: 'bubble' },
    { at: RAIN + 0.35, sfx: 'plop' },
    { at: 10.94, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '橙' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
