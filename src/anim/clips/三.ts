import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 三（v2）：豬探長做三明治。每次把一片番茄舉過頭放上麵包、手舉高高「啪！」一掌拍扁——番茄汁「噗」地噴他一身，一次比一次大：
// 噴一身 → 噴得往後退 → 噴飛跌坐。每拍扁一片，那片就扁成一條紅線飛上去：一片一橫、兩片兩橫、三片三橫＝「三」（三片番茄疊成上中下三層）。
// 回馬槍：他把三明治拉到中間（語詞「三明治」），這次不拍了，流著口水得意地張大嘴咬下去「啊嗚」——噴出最大的一道，他整隻往左噴飛、三明治往右炸開。
// 三、三、三明治、這是什麼字？、三
const P = 62.7 // 豬探長（size 34）站在地上的 y
/** 豬探長拿番茄的地方、拍番茄時站的地方 */
const HOME = 66
const SLAP = 95
/** 三明治一開始在右邊（國字拼好、放到正中央時不擋字），語詞那一刻被拉到正中間 */
const SX0 = 121
const SX = 86
/** 底下那片麵包 */
const BS = 22
const BREAD_Y = 77 - 0.42 * BS
/** 三片番茄放上去時（還圓圓的）的 y：一片疊一片 */
const TOM_Y = [60.5, 56.0, 51.5]
/** 番茄拍扁成幾倍寬 */
const FLAT = 2.3
/** 舉在頭上的番茄的 y */
const CARRY_Y = 36
const TOMS = ['t1', 't2', 't3']
const STACK = ['bread', ...TOMS]

/** 拿起一片番茄舉過頭、走到三明治前、放上去。at 是拿起來的那一刻 */
function carry(at: number, k: number): Move[] {
  const t = TOMS[k]
  return [
    { at, actor: t, do: 'pop', dur: 0.2 },
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
    { at: at + 0.25, actor: 'pig', do: 'moveTo', to: { x: SLAP, y: P }, dur: 0.45 },
    { at: at + 0.25, actor: t, do: 'moveTo', to: { x: SLAP, y: CARRY_Y }, dur: 0.45 },
    // 放上去
    { at: at + 0.75, actor: t, do: 'moveTo', to: { x: SX0, y: TOM_Y[k] }, arc: 5, dur: 0.25, ease: 'out' },
    { at: at + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
  ]
}

/**
 * 「啪」一掌拍扁番茄（k 0～2）或咬下去（k 3），番茄汁「噗」地一道噴到他身上——
 * 同一道紅色的汁、同一圈 🍅 碎塊、同一組音效，只有汁越來越粗、他被噴得越來越遠。at 是拍下去（咬下去）那一刻。
 */
function squirt(at: number, k: number) {
  const sx = k < 3 ? SX0 : SX
  const moves: Move[] = []
  if (k < 3) moves.push(
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/push' },
    { at, actor: TOMS[k], do: 'stretchTo', amount: FLAT, dur: 0.08, ease: 'out' },
  )
  moves.push(
    { at, actor: 'bread', do: 'squash', amount: 0.12 + 0.04 * k, dur: 0.2 },
    { at: at + 0.08, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
  )
  // 被噴的結果一次比一次大：站著傻眼 → 往後退一步 → 噴飛跌坐 →（咬）整隻噴飛、轉一圈趴扁
  if (k === 1) moves.push({ at: at + 0.1, actor: 'pig', do: 'moveTo', to: { x: SLAP - 10, y: P }, dur: 0.2, ease: 'out' })
  if (k === 2) moves.push(
    { at: at + 0.1, actor: 'pig', do: 'moveTo', to: { x: 34, y: P }, arc: 10, dur: 0.4, ease: 'out' },
    { at: at + 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
  )
  if (k === 3) moves.push(
    { at: at + 0.1, actor: 'pig', do: 'moveTo', to: { x: 28, y: P }, arc: 14, dur: 0.5, ease: 'out' },
    { at: at + 0.1, actor: 'pig', do: 'spin', pivot: 'center', dur: 0.45 },
    { at: at + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
  )
  const width = [1.8, 2.8, 4.0, 5.2][k]
  const top = TOMS[Math.min(k, 2)]
  const fx: Fx[] = [
    { at, kind: 'burst', x: sx - 4, y: TOM_Y[Math.min(k, 2)] - 2, n: 1, dur: 0.35, scale: 1.1 + 0.3 * k },
    // 汁一直噴在他身上（他被噴走，汁跟著他）
    { at: at + 0.04, kind: 'line', actor: top, dx: -10, dy: 1, target: 'pig', color: '#E3262E', width, dur: k === 0 ? 0.3 : 0.45 },
    { at: at + 0.1, kind: 'burst', actor: 'pig', emoji: '🍅', n: 4 + 2 * k, dur: 0.4, scale: 0.9 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: sx - 14, y: 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'plop' }, { at: at + 0.05, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: at + 0.1, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.15, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 手舉高高預備拍下去（看得到的預備） */
const windup = (at: number): Move => ({ at, actor: 'pig', do: 'swap', emoji: 'hero:pig/know' })

/** 走回拿番茄的地方（往左走要轉身，到了再轉回來朝右） */
function goHome(at: number): Move[] {
  return [
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at, actor: 'pig', do: 'flip' },
    { at, actor: 'pig', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.35 },
    { at: at + 0.38, actor: 'pig', do: 'flip' },
    { at: at + 0.38, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
  ]
}

const H1 = 2.2, H2 = 4.35, H3 = 6.95
const s1 = squirt(H1, 0), s2 = squirt(H2, 1), s3 = squirt(H3, 2)
const FULL = H3 + 0.15 + 0.6 // 國字填滿
// 回馬槍
const PULL = 9.1 // 把三明治拉到中間
const WORD = PULL + 0.5
const BITE = 10.05 // 咬下去
const s4 = squirt(BITE, 3)
const ASK = 11.0
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '三',
  meta: { theme: '三層的三明治', cast: '豬探長＋三明治（麵包、三片番茄）', gags: ['豬探長做三明治，每放一片番茄就一掌拍扁，番茄汁噗地噴他一身，一次比一次大（噴一身→往後退→噴飛跌坐），拍扁的番茄一片變一橫，三片三橫；回馬槍是三明治做好了、他不拍了，得意地張嘴咬下去，噴出最大的一道把他整隻噴飛'] },
  duration: 15,
  bg: { top: '#FFF1D6', bottom: '#FFF9EE', floor: '#E9C28A', scenery: 'room' },
  actors: [
    { id: 'bread', emoji: '🍞', x: SX0, y: BREAD_Y, size: BS },
    { id: 't1', emoji: '🍅', x: HOME, y: CARRY_Y, size: 15, hidden: true },
    { id: 't2', emoji: '🍅', x: HOME, y: CARRY_Y, size: 15, hidden: true },
    { id: 't3', emoji: '🍅', x: HOME, y: CARRY_Y, size: 15, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: HOME, y: P, size: 34, flip: true, hidden: true },
  ],
  moves: [
    // 開場：豬探長走進來，指著字框「三！」
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 第 1 次
    ...carry(H1 - 1.2, 0),
    windup(H1 - 0.3),
    ...s1.moves,
    ...goHome(H1 + 0.55),
    // 第 2 次
    ...carry(H2 - 1.2, 1),
    windup(H2 - 0.3),
    ...s2.moves,
    ...goHome(H2 + 0.6),
    // 第 3 次前停一拍：手舉起來了……看一眼你、冒汗……拍！
    ...carry(H3 - 1.6, 2),
    windup(H3 - 0.8),
    { at: H3 - 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: H3 - 0.55, actor: 'pig', do: 'tilt', amount: -6, dur: 0.3 },
    windup(H3 - 0.25),
    ...s3.moves,
    // 回馬槍：國字讓位以後，他衝回去把三明治拉到正中間——三明治！
    { at: PULL - 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: PULL - 0.3, actor: 'pig', do: 'moveTo', to: { x: SX0 - 22, y: P }, dur: 0.28, ease: 'out' },
    { at: PULL, actor: 'pig', do: 'swap', emoji: 'hero:pig/pull' },
    { at: PULL, actor: 'pig', do: 'moveTo', to: { x: SX - 22, y: P }, dur: 0.45 },
    ...STACK.map((id): Move => ({ at: PULL, actor: id, do: 'moveTo', to: { x: SX, y: id === 'bread' ? BREAD_Y : TOM_Y[TOMS.indexOf(id)] }, dur: 0.45 })),
    { at: WORD, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
    // 這次不拍了，得意地張大嘴咬下去
    { at: BITE - 0.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
    { at: BITE - 0.25, actor: 'pig', do: 'moveTo', to: { x: SX - 19, y: P }, dur: 0.2, ease: 'in' },
    ...s4.moves,
    // 三明治也被噴得炸開，一層一層往右飛出畫面
    ...STACK.map((id, i): Move => ({ at: BITE + 0.08 + 0.04 * i, actor: id, do: 'moveTo', to: { x: 190 + 10 * i, y: 60 - 4 * i }, arc: 6 + 3 * i, dur: 0.4, ease: 'in' })),
    // 問他：他走到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 3 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'pig', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    { at: ASK + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 安靜等他回答：手放耳邊、身體前傾聽，點兩下頭
    { at: 12.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.2, actor: 'pig', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：畫面只留下字
    { at: ANSWER + 0.08, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: ANSWER + 0.08, actor: 'pig', do: 'flip' },
    { at: ANSWER + 0.1, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 每拍扁一片番茄，那片就扁成一條紅線（一）飛上去：上、中、下
    { at: H1 + 0.15, dur: 0.6, strokes: [0], from: 't1', color: partColor('一') },
    { at: H2 + 0.15, dur: 0.6, strokes: [1], from: 't2', color: partColor('一') },
    { at: H3 + 0.15, dur: 0.6, strokes: [2], from: 't3', color: partColor('一') },
  ],
  glyph: [
    // 前兩次拍扁時，空字框抖一下
    { at: H1 + 0.1, dur: 0.4, do: 'wobble' },
    { at: H2 + 0.1, dur: 0.4, do: 'wobble' },
    { at: FULL + 0.1, dur: 0.45, do: 'home', ease: 'back' },
    { at: FULL + 0.95, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: ASK, dur: 3.0, do: 'ask', keep: ['pig'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    ...s2.fx,
    // 第 3 次前停一拍
    { at: H3 - 0.55, kind: 'sweat', actor: 'pig', dur: 0.5 },
    ...s3.fx,
    { at: H3 + 0.55, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    // 三明治到中間：閃一下
    { at: WORD, kind: 'burst', x: SX, y: 50, emoji: '✨', n: 8, dur: 0.45 },
    ...s4.fx,
    { at: BITE + 0.6, kind: 'burst', x: 28, y: P, emoji: '⭐', n: 8, dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    ...s4.camera,
  ],
  lights: [
    { at: FULL + 0.1, dur: 0.05, level: -0.35 },
    { at: FULL + 0.15, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '三' },
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    { at: FULL + 0.2, say: '三' },
    { at: WORD, say: '三明治' },
    ...s4.cues,
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '三' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
