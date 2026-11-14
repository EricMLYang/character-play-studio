import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 黑（v2）：愛現的忍者小老鼠要表演「把營火吹得旺旺的」——每次他鼓起臉往火裡用力一吹，火就「轟」地噴出一大團黑煙撲到他臉上，
// 煙散開他被燻得一次比一次黑：灰灰的（火裡蹦出四點火星 灬）、黑黑的被噴退一屁股坐地（上面那塊被燻黑的煙囪口）、
// 先停一拍再吹，黑到整隻看不見、只剩兩顆眼睛眨呀眨（上面那塊的下半）。這就是「黑」的本義：火燒出來的黑煙把東西燻黑。
// 回馬槍：他學乖了，一吹完就忍者跳閃開——黑煙從他腳下穿過去，撲到偷偷跑來看表演的大熊臉上（黑熊），黑熊氣得大吼，把他連火一起吼飛。
// 最後畫面暗下來只剩「黑」，小老鼠轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「黑！」，然後退場只留字。
// 黑、黑、黑熊、這是什麼字？、黑
const P = 66.9 // 小老鼠（size 24）站在地上的 y
/** 營火（🔥，size 24）在右邊 */
const FX = 116
const FY = 77 - 0.42 * 24
/** 小老鼠每次都站到同一個地方吹火：營火的左邊 */
const BLOW = 92
/** 大熊（prop:bear／bear-roar，同一個比例）：回馬槍時偷偷跑到他背後看 */
const BEAR = 52
const BY = 77 - 0.42 * BEAR
const BX = 58
/** 黑煙撲到大熊臉上的地方 */
const BEAR_FACE = { x: BX - 4, y: BY - 10 }
/** 黑煙每一次多大：一次比一次大團 */
const SMOKE = [26, 34, 44, 46]
/** 被燻黑：一次比一次深（第 3 次黑到只剩眼睛） */
const SOOT = ['grayscale(.6) brightness(.5)', 'grayscale(.8) brightness(.26)', 'grayscale(1) brightness(.08)']
/** 黑熊：看得出是熊、眼睛還分辨得出來 */
const BLACK_BEAR = 'grayscale(1) brightness(.42) contrast(1.9)'
/** 黑煙：白雲染成深灰黑 */
const SMOKE_TINT = 'grayscale(1) brightness(.22)'
/** 第 3 次黑到只剩眼睛：眼睛疊在他臉上的位置 */
const EYES = { x: 34, y: P - 2 }
/** 被燻黑以後傻眼停多久 */
const HOLD = 0.5

/** 第 k 次被燻到時他站的地方（第 2、3 次被黑煙噴退） */
const HIT = [BLOW, BLOW - 14, 34]

/**
 * 「呼—轟」：他鼓起臉往火裡吹（blow 姿勢＋一串 💨）→ 火抖一下、猛地變大（預備），他傻眼（還沒黑）→
 * 那一刻火噴出一大團黑煙撲到他臉上＋💥＋⚫ 煤灰飛散＋鏡頭推近＋震＋同一個音效 → 煙散開，他被燻黑、傻眼停 HOLD 秒。
 * k 是第幾次（煙越後面越大、越黑、噴得越遠）。第 4 次（dodge）他吹完就跳開，黑煙撲到後面的大熊臉上。
 */
function blast(at: number, k: number, dodge = false) {
  const smoke = 'smoke'
  // 同一團煙重複用：上一次散開時放大了 1.3 倍，這次先調回這一次的大小
  const was = k === 0 ? SMOKE[0] : SMOKE[k - 1] * 1.3
  const to = dodge ? BEAR_FACE : { x: HIT[k] + 2, y: P - 6 }
  const moves: Move[] = [
    // 預備：鼓起臉吸一口氣、往火裡吹
    { at: at - 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/blow' },
    { at: at - 0.8, actor: 'mouse', do: 'squash', amount: -0.16 - 0.04 * k, dur: 0.3 },
    // 火抖一下、猛地變大
    { at: at - 0.35, actor: 'fire', do: 'shake', amount: 1 + 0.3 * k, dur: 0.3 },
    { at: at - 0.3, actor: 'fire', do: 'scaleTo', amount: 1.4, dur: 0.22, ease: 'back' },
    { at: at + 0.35, actor: 'fire', do: 'scaleTo', amount: 1 / 1.4, dur: 0.3 },
    // 轟！黑煙從火裡噴出來，撲到臉上
    { at: at - 0.05, actor: smoke, do: 'moveTo', to: { x: FX - 4, y: FY - 6 }, dur: 0.01 },
    { at: at - 0.05, actor: smoke, do: 'scaleTo', amount: SMOKE[k] / was, dur: 0.01 },
    { at, actor: smoke, do: 'pop', dur: 0.08 },
    { at, actor: smoke, do: 'moveTo', to, dur: 0.14, ease: 'out' },
    { at: at + 0.36, actor: smoke, do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'out' },
    { at: at + 0.38, actor: smoke, do: 'vanish', dur: 0.18 },
    { at: at + 0.1, actor: 'fire', do: 'squash', amount: 0.2, dur: 0.2 },
  ]
  if (!dodge) moves.push(
    // 火一變大，他傻眼（臉還是乾淨的）
    { at: at - 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    // 煙蓋住他那一刻變黑
    { at: at + 0.1, actor: 'mouse', do: 'tint', filter: SOOT[k] },
    { at, actor: 'mouse', do: 'squash', amount: 0.18 + 0.05 * k, dur: 0.25 },
  )
  if (!dodge && HIT[k] !== BLOW) moves.push(
    // 被黑煙噴退
    { at: at + 0.03, actor: 'mouse', do: 'moveTo', to: { x: HIT[k], y: P }, dur: 0.28 + 0.06 * k, ease: 'out' },
  )
  const fx: Fx[] = [
    { at: at - 0.55, kind: 'blow', actor: 'mouse', dx: 9, dy: 8, to: { x: FX - 6, y: FY - 2 }, n: 3, dur: 0.35, scale: 1.2 },
    // 💥 在煙跟火之間
    { at, kind: 'burst', x: FX - 14, y: dodge ? FY : FY - 10, n: 1, dur: 0.3, scale: 1.5 + 0.4 * k },
    // 煤灰四散，一次比一次多
    { at: at + 0.12, kind: 'burst', x: to.x, y: to.y, emoji: '⚫', n: 5 + 2 * k, dur: 0.45, scale: 0.8 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: (to.x + FX) / 2, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.55, sfx: 'whoosh' }, { at, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'rumble' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 拍掉煤灰：抖一抖、⚫ 飛掉，變回乾淨的 */
function dust(at: number, k: number) {
  const moves: Move[] = [
    { at, actor: 'mouse', do: 'shake', amount: 2, dur: 0.3 },
    { at: at + 0.15, actor: 'mouse', do: 'tint', filter: '' },
  ]
  const fx: Fx[] = [{ at: at + 0.1, kind: 'burst', actor: 'mouse', dy: 10, emoji: '⚫', n: 5 + k, dur: 0.35, scale: 0.8 }]
  const cues: Cue[] = [{ at: at + 0.1, sfx: 'poof' }]
  return { moves, fx, cues }
}

const H1 = 1.65, H2 = 3.6, H3 = 6.0, H4 = 9.1
const b1 = blast(H1, 0)
const b2 = blast(H2, 1)
const b3 = blast(H3, 2)
const b4 = blast(H4, 3, true)
/** 煙散開、看到被燻黑的他 */
const R = (at: number) => at + 0.45
const d1 = dust(R(H1) + HOLD + 0.1, 0)
const d2 = dust(R(H2) + HOLD + 0.35, 1)
/** 第 3 次黑到只剩眼睛，等國字讓位、大熊進場時才拍掉 */
const d3 = dust(7.85, 2)
/** 黑熊吼的那一刻 */
const ROAR = 10.0

const clip: Clip = {
  format: 2,
  char: '黑',
  meta: { theme: '忍者小老鼠表演吹營火', cast: '小老鼠＋大熊＋營火', gags: ['愛現的小老鼠每次往營火裡用力一吹，火就轟地噴出一大團黑煙撲到他臉上，他被燻得一次比一次黑（灰灰的、黑黑的被噴退、黑到只剩兩顆眼睛）；回馬槍是他一吹完就忍者跳閃開，黑煙撲到後面偷看的大熊臉上變成黑熊，黑熊氣得把他吼飛'] },
  duration: 15,
  bg: { top: '#BFE8FF', bottom: '#F4FBFF', floor: '#CFE6A8', scenery: 'hills' },
  actors: [
    { id: 'bear', emoji: 'prop:bear', x: -40, y: BY, size: BEAR, hidden: true },
    { id: 'fire', emoji: '🔥', x: FX, y: FY, size: 24 },
    // 姿勢圖朝左，翻過來面向右邊的營火（問他時也面向右邊的字）
    { id: 'mouse', emoji: 'hero:mouse/idle', x: BLOW, y: P, size: 24, hidden: true, flip: true },
    // 黑煙：畫在最上面（撲到臉上那一刻蓋住他）
    { id: 'smoke', emoji: '☁️', x: FX, y: FY, size: SMOKE[0], hidden: true, float: true, tint: SMOKE_TINT },
  ],
  moves: [
    // 小老鼠衝進來，擺忍者架式，抬頭看字框：看我把火吹得旺旺的！
    { at: 0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'back' },
    { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: 0.5, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.35 },
    // 第 1 次：呼——轟！被燻成灰灰的
    ...b1.moves,
    ...d1.moves,
    { at: d1.moves[0].at + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stomp' },
    { at: d1.moves[0].at + 0.3, actor: 'mouse', do: 'hop', amount: 2, dur: 0.2 },
    // 第 2 次：吹更用力——轟！黑黑的，被噴退一屁股坐地
    ...b2.moves,
    { at: R(H2) + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/fall' },
    ...d2.moves,
    { at: d2.moves[0].at + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: d2.moves[0].at + 0.3, actor: 'mouse', do: 'moveTo', to: { x: BLOW, y: P }, dur: 0.35 },
    // 第 3 次：先停一拍——托下巴看火，火晃一晃……深吸一大口氣
    { at: 5.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: 5.0, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 5.05, actor: 'fire', do: 'tilt', amount: 8, dur: 0.3 },
    ...b3.moves,
    ...d3.moves,
    // 國字讓位；大熊聽到聲音，偷偷跑到他背後看表演
    { at: 8.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: 8.05, actor: 'mouse', do: 'moveTo', to: { x: BLOW, y: P }, dur: 0.4 },
    { at: 8.0, actor: 'bear', do: 'pop', dur: 0.01 },
    { at: 7.95, actor: 'bear', do: 'moveTo', to: { x: BX, y: BY }, dur: 1.05, ease: 'linear' },
    // 回馬槍（第 4 次）：吹完就忍者跳閃開——黑煙從他腳下穿過去
    ...b4.moves,
    { at: H4 - 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
    { at: H4 - 0.3, actor: 'mouse', do: 'moveTo', to: { x: BLOW + 6, y: P - 22 }, dur: 0.25, ease: 'out' },
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    { at: H4 + 0.25, actor: 'mouse', do: 'moveTo', to: { x: BLOW + 6, y: P }, dur: 0.25, ease: 'in' },
    // 撲到大熊臉上：黑熊
    { at: H4 + 0.12, actor: 'bear', do: 'tint', filter: BLACK_BEAR },
    { at: H4 + 0.1, actor: 'bear', do: 'squash', amount: 0.15, dur: 0.25 },
    // 黑熊氣得大吼：把他連火一起吼飛
    { at: ROAR - 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/back' },
    { at: ROAR - 0.25, actor: 'bear', do: 'squash', amount: -0.12, dur: 0.25 },
    { at: ROAR, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' },
    { at: ROAR, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: ROAR, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: ROAR + 0.15, actor: 'mouse', do: 'moveTo', to: { x: 175, y: 10 }, dur: 0.4, ease: 'out' },
    { at: ROAR + 0.15, actor: 'mouse', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    { at: ROAR + 0.2, actor: 'fire', do: 'vanish', dur: 0.15 },
    // 大熊氣呼呼地走掉（往左走出畫面，小老鼠掉回來之前）
    { at: 10.3, actor: 'bear', do: 'swap', emoji: 'prop:bear' },
    { at: 10.35, actor: 'bear', do: 'moveTo', to: { x: -45, y: BY }, dur: 0.6, ease: 'in' },
    // 問他：小老鼠掉回左前方、變大，轉向觀眾
    { at: 10.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 10.65, actor: 'mouse', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: 10.92, actor: 'mouse', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    { at: 11.2, actor: 'mouse', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 11.95, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 13.45, actor: 'mouse', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（衝刺），畫面只留下字
    { at: 13.72, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 13.72, actor: 'mouse', do: 'flip' },
    { at: 13.75, actor: 'mouse', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：火裡蹦出四點火星——灬（火）
    { at: H1 + 0.05, dur: 0.6, strokes: [8, 9, 10, 11], from: 'fire', color: partColor('灬') },
    // 第 2、3 次：黑煙裡飛出來——上面那塊被燻黑的煙囪口
    { at: H2 + 0.1, dur: 0.6, strokes: [0, 1, 2, 3], from: 'smoke', color: partColor('黑頭') },
    { at: H3 + 0.1, dur: 0.6, strokes: [4, 5, 6, 7], from: 'smoke', color: partColor('黑頭') },
  ],
  glyph: [
    { at: 7.0, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.9, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.55, dur: 3.4, do: 'ask', keep: ['mouse'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.6, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    ...d1.fx,
    ...b2.fx,
    ...d2.fx,
    { at: 5.0, kind: 'sweat', actor: 'mouse' },
    ...b3.fx,
    // 黑到整隻看不見，只剩兩顆眼睛眨呀眨（閉一下眼＝眼睛消失一格）
    ...[[R(H3) - 0.05, 0.6], [R(H3) + 0.62, 0.4], [R(H3) + 1.1, d3.moves[0].at - R(H3) - 1.1]].map(([at, dur]): Fx => (
      { at, kind: 'pop', x: EYES.x - 6, y: EYES.y + 6, emoji: '👀', dur, scale: 1.5 })),
    ...d3.fx,
    ...b4.fx,
    { at: H4 + 0.5, kind: 'pop', actor: 'bear', emoji: '💢', dx: -22, dy: 14, dur: 0.9, scale: 1.6 },
    { at: ROAR, kind: 'blow', actor: 'bear', dx: -2, dy: 12, to: { x: BLOW + 20, y: P - 10 }, n: 5, dur: 0.4, scale: 1.6 },
    { at: ROAR + 0.2, kind: 'burst', x: FX, y: FY - 4, emoji: '⚫', n: 6, dur: 0.4 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    ...b4.camera,
    { at: ROAR, dur: 0.4, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: 7.0, dur: 0.05, level: -0.35 },
    { at: 7.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '黑' },
    ...b1.cues,
    ...d1.cues,
    ...b2.cues,
    ...d2.cues,
    ...b3.cues,
    ...d3.cues,
    { at: 7.1, say: '黑' },
    ...b4.cues,
    { at: H4 + 0.45, say: '黑熊' },
    { at: ROAR, sfx: 'rumble' },
    { at: ROAR + 0.15, sfx: 'boing' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '黑' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
