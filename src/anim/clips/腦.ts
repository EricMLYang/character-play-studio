import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 腦（v2）：大石頭頂上有一塊大餅乾。浣熊花生不動腦，每次蹲下、用力一跳要跳上去，都「啪」地整個人貼在石頭上、慢慢滑下來，
// 一次比一次跳得高、貼得高、摔得慘（跌坐 → 趴扁 → 先停一拍再跳，趴扁還暈）；每次他滑下來，楊捷睿頭上的大腦就「叮」地跳一下亮起來、舉手說我知道，
// 花生不聽、又跳。月（肉月，身體）從貼在石頭上的花生身上彈出來，右上的三道彎（巛＝頭髮）和下面的腦門（囟）從大腦飛出來。
// 回馬槍（第四次）：楊捷睿托著下巴用力想，大腦「咚、咚」脹到最大、「叮！」冒出燈泡——他去旁邊搬來一直立在那裡的梯子，架在石頭上（動腦），
// 一階一階爬上石頭頂；花生還是跳，又「啪」地貼上石頭滑下來，抬頭看見楊捷睿坐在石頭頂上吃餅乾，傻眼。石頭滾走、花生追著跑掉。最後畫面暗下來只剩「腦」，楊捷睿轉向觀眾問「這是什麼字？」，等他回答，再指著字說「腦！」，大家退場只留字。
// 腦、腦、動腦、這是什麼字？、腦
const P = 66.9 // 楊捷睿、花生（size 24）站在地上的 y
const ROCK = 44
/** 大石頭在中間偏右（左緣約 x 111，國字 home 時不擋字） */
const RX = 131
const RY = 77 - 0.42 * ROCK
/** 石頭頂上的大餅乾（石頭頂約 y 46） */
const TOP = 46
const CX = 138
const CY = TOP + 5
/** 花生每次起跳的地方 */
const HOME = 78
/** 貼在石頭左邊的位置（x），每次貼得越來越高（y） */
const HITXS = [110, 112, 114, 110]
const HY = [60, 55, 51, 57]
/** 梯子：一開始就立在左邊（之後才知道它一直都在） */
const LAD = 34
const LX = 14
const LY = 77 - 0.42 * LAD
/** 楊捷睿看戲的地方，大腦浮在他頭上 */
const YX = 32
const BRAIN_DY = -25
/** 貼在石頭上傻眼停多久，才滑下來 */
const HOLD = 0.4
/** 滑下來要多久 */
const SLIDE = 0.35
/** 蹲下蓄力（預備）到貼上石頭的時間 */
const WIND = 0.55
/** 貼在石頭上被壓扁成多窄 */
const FLAT = 0.62

/**
 * 「啪」：花生蹲下蓄力 → 一跳 → 整個人貼在石頭上（被壓窄、💥、鏡頭推近＋震、同一個音效）→ 傻眼停 HOLD 秒 → 慢慢滑下來。
 * k 是第幾次：跳得越來越高、貼得越來越高、落地越來越慘。
 */
function splat(at: number, k: number) {
  const y = HY[k]
  const HITX = HITXS[k]
  // 第 4 次快一點：貼上、滑下來，抬頭看見石頭頂上的楊捷睿
  const hold = k >= 3 ? 0.3 : HOLD
  const slide = k >= 3 ? 0.3 : SLIDE
  const moves: Move[] = [
    { at: at - WIND, actor: 'r', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: at - WIND, actor: 'r', do: 'squash', amount: 0.3 + 0.05 * k, dur: 0.3 },
    { at: at - 0.25, actor: 'r', do: 'swap', emoji: 'hero:raccoon/jump' },
    { at: at - 0.25, actor: 'r', do: 'moveTo', to: { x: HITX, y }, arc: 8 + 3 * k, dur: 0.25, ease: 'in' },
    // 啪！貼在石頭上：壓窄、傻眼
    { at, actor: 'r', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at, actor: 'r', do: 'stretchTo', amount: FLAT, dur: 0.06 },
    { at, actor: 'rock', do: 'shake', amount: 0.5 + 0.35 * k, dur: 0.3 },
    // 慢慢滑下來
    { at: at + hold, actor: 'r', do: 'moveTo', to: { x: HITX - 1, y: P }, dur: slide, ease: 'in' },
    { at: at + hold + slide, actor: 'r', do: 'stretchTo', amount: 1 / FLAT, dur: 0.08 },
    { at: at + hold + slide, actor: 'r', do: 'swap', emoji: k === 0 ? 'hero:raccoon/fall' : k >= 3 ? 'hero:raccoon/surprised' : 'hero:raccoon/flat' },
  ]
  // 第 3 次：滑到底還被石頭彈開，翻一圈摔到畫面左邊
  if (k === 2) moves.push(
    { at: at + hold + slide + 0.05, actor: 'r', do: 'moveTo', to: { x: 18, y: P }, arc: 12, dur: 0.45, ease: 'out' },
    { at: at + hold + slide + 0.05, actor: 'r', do: 'spin', times: -1, dur: 0.45, pivot: 'center' },
  )
  const fx: Fx[] = [
    { at, kind: 'burst', x: HITX + 5, y: y - 6, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
  ]
  if (k === 1 || k === 2) fx.push({ at: at + hold + slide + (k === 2 ? 0.5 : 0), kind: 'dizzy', actor: 'r', dur: 0.5 })
  const camera: Camera[] = [{ at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k }]
  // 第 4 次楊捷睿站在石頭頂上，推近會切掉他：只震不推
  if (k < 3) camera.push({ at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: HITX, y: y - 4 } })
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.25, sfx: 'whoosh' }, { at, sfx: 'bonk' }, { at: at + hold, sfx: 'slide' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/**
 * 「叮」：楊捷睿頭上的大腦跳一下、發亮，他舉手「我知道！」（know）。第一次大腦才冒出來，之後每次再大一點。
 */
function ding(at: number, k: number) {
  const moves: Move[] = [
    k === 0
      ? { at, actor: 'brain', do: 'pop', dur: 0.3 }
      : { at, actor: 'brain', do: 'scaleTo', amount: 1.1, dur: 0.25, ease: 'back' },
    { at, actor: 'brain', do: 'squash', amount: -0.25, dur: 0.3 },
    { at, actor: 'brain', do: 'flash', dur: 0.5 },
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', actor: 'brain', emoji: '✨', n: 6, dy: 10, dur: 0.45, scale: 1.2 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: YX, y: P + BRAIN_DY } },
  ]
  const cues: Cue[] = [{ at, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'blip' })
  return { moves, fx, camera, cues }
}

const H1 = 1.4, H2 = 3.35, H3 = 5.75, H4 = 10.2
const s1 = splat(H1, 0)
const s2 = splat(H2, 1)
const s3 = splat(H3, 2)
const s4 = splat(H4, 3)
/** 每次滑到地上以後，大腦叮 */
const D = (h: number) => h + HOLD + SLIDE + 0.08
const d1 = ding(D(H1), 0)
const d2 = ding(D(H2), 1)
const d3 = ding(D(H3), 2)
/** 花生爬起來、走回起跳點（不聽） */
const back = (h: number): Move[] => [
  { at: D(h) + 0.22, actor: 'r', do: 'swap', emoji: 'hero:raccoon/angry' },
  { at: D(h) + 0.25, actor: 'r', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.25 },
]
/** 第 3 次前停一拍 */
const PAUSE = H2 + 1.35
/** 國字拼好（囟落定）→ home */
const HOMEAT = 7.25
/** 語詞那一刻：楊捷睿走到正中間，大腦脹到最大 */
const MX = 46
const THINK = 8.3
const IDEA = 8.75
/** 搬梯子：跑去左邊拿 → 舉著走到石頭左邊 → 架好（動腦）→ 爬上石頭頂 */
const FETCH = IDEA + 0.12
const LIFT = FETCH + 0.25
const PLANT = 9.52
/** 梯子架在石頭左邊（斜靠，上端搭在石頭頂的左緣） */
const LEAN = { x: 106, y: LY - 2 }
const CLIMB = PLANT + 0.1
const ONTOP = { x: 126, y: TOP - 7.1 }
const EAT = 10.25
/** 收場：他從石頭上跳下來；石頭帶著梯子滾走、花生追著跑掉；問他 */
const DOWN = 11.0
const ASK = 11.25

const clip: Clip = {
  format: 2,
  char: '腦',
  meta: { theme: '大石頭頂上的餅乾', cast: '楊捷睿＋浣熊花生＋大石頭＋大腦＋梯子', gags: ['花生不動腦，每次用力一跳要跳上大石頭拿餅乾，都啪地貼在石頭上滑下來、一次比一次慘，楊捷睿頭上的大腦每次叮地亮起來他都不聽；回馬槍是楊捷睿用力動腦、大腦脹到最大冒出燈泡，搬來梯子爬上石頭頂吃餅乾，花生又貼上去滑下來，抬頭傻眼'] },
  duration: 15,
  bg: { top: '#E3F2FF', bottom: '#FFF8E6', floor: '#C9DE9A', scenery: 'hills' },
  actors: [
    // 石頭會滾走：以中心轉
    { id: 'rock', emoji: 'prop:rock', x: RX, y: RY, size: ROCK, pivot: 'center' },
    { id: 'cookie', emoji: '🍪', x: CX, y: CY, size: 10 },
    // 梯子以中心轉：舉起來時打橫、架上去時斜靠
    { id: 'ladder', emoji: 'prop:ladder', x: LX, y: LY, size: LAD, pivot: 'center' },
    // 花生畫在石頭、梯子前面（貼在石頭上）
    { id: 'r', emoji: 'hero:raccoon/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 姿勢圖朝左，翻過來面向右邊的石頭；畫在最前面，爬梯子時在花生前面
    { id: 'yang', emoji: 'hero:yang/idle', x: YX, y: P, size: 24, hidden: true, flip: true },
    { id: 'brain', emoji: 'prop:brain', x: YX, y: P + BRAIN_DY, size: 20, hidden: true, float: true },
  ],
  moves: [
    // 開場：楊捷睿登場抬頭看字框；花生衝進來，看到石頭頂上的餅乾流口水
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.05, actor: 'r', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.05, actor: 'r', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 0.5, actor: 'r', do: 'swap', emoji: 'hero:raccoon/drool' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 第 1 次：跳——啪，貼在石頭上，滑下來跌坐
    ...s1.moves,
    ...d1.moves,
    ...back(H1),
    // 第 2 次：再跳高一點——啪，滑下來趴扁
    { at: H2 - 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...s2.moves,
    ...d2.moves,
    ...back(H2),
    // 第 3 次前停一拍：花生瞪著石頭、跺腳；楊捷睿比「等一下」——他不聽
    { at: PAUSE, actor: 'r', do: 'swap', emoji: 'hero:raccoon/stomp' },
    { at: PAUSE, actor: 'r', do: 'hop', amount: 2, dur: 0.2 },
    { at: PAUSE + 0.2, actor: 'r', do: 'hop', amount: 2, dur: 0.2 },
    { at: PAUSE, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
    { at: PAUSE + 0.25, actor: 'rock', do: 'shake', amount: 0.4, dur: 0.2 },
    ...s3.moves,
    ...d3.moves,
    // 第 3 次後他趴著暈（國字拼好）
    { at: 7.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 語詞之前：楊捷睿走到正中間、托著下巴用力想，大腦咚、咚脹到最大，叮！燈泡
    { at: 8.05, actor: 'yang', do: 'moveTo', to: { x: MX, y: P }, dur: 0.35 },
    { at: 8.05, actor: 'brain', do: 'moveTo', to: { x: MX, y: P + BRAIN_DY - 2 }, dur: 0.35 },
    { at: 8.05, actor: 'r', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 8.05, actor: 'r', do: 'moveTo', to: { x: 92, y: P }, dur: 0.35 },
    { at: THINK, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: THINK, actor: 'yang', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    { at: THINK + 0.15, actor: 'brain', do: 'scaleTo', amount: 1.2, dur: 0.2, ease: 'back' },
    { at: THINK + 0.15, actor: 'brain', do: 'flash', dur: 0.3 },
    { at: THINK + 0.35, actor: 'brain', do: 'scaleTo', amount: 1.15, dur: 0.2, ease: 'back' },
    { at: THINK + 0.35, actor: 'brain', do: 'flash', dur: 0.3 },
    { at: IDEA, actor: 'brain', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: IDEA, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: IDEA, actor: 'yang', do: 'hop', amount: 3, dur: 0.12 },
    // 大腦縮回頭裡；他跑去左邊，舉起一直立在那裡的梯子
    { at: FETCH, actor: 'brain', do: 'scaleTo', amount: 0.3, dur: 0.15 },
    { at: FETCH + 0.1, actor: 'brain', do: 'vanish', dur: 0.08 },
    { at: FETCH, actor: 'yang', do: 'flip' },
    { at: FETCH, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: FETCH, actor: 'yang', do: 'moveTo', to: { x: LX + 6, y: P }, dur: 0.25, ease: 'in' },
    { at: LIFT, actor: 'yang', do: 'flip' },
    { at: LIFT, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: LIFT, actor: 'ladder', do: 'moveTo', to: { x: LX + 6, y: P - 21 }, dur: 0.12 },
    { at: LIFT, actor: 'ladder', do: 'rotateTo', amount: 90, dur: 0.12 },
    // 舉著走到石頭左邊
    { at: LIFT + 0.15, actor: 'yang', do: 'moveTo', to: { x: LEAN.x - 8, y: P }, dur: PLANT - LIFT - 0.15, ease: 'inOut' },
    { at: LIFT + 0.15, actor: 'ladder', do: 'moveTo', to: { x: LEAN.x - 8, y: P - 21 }, dur: PLANT - LIFT - 0.15, ease: 'inOut' },
    // 架上去（動腦）
    { at: PLANT, actor: 'ladder', do: 'moveTo', to: LEAN, dur: 0.15, ease: 'back' },
    { at: PLANT, actor: 'ladder', do: 'rotateTo', amount: -75, dur: 0.15, ease: 'back' },
    { at: PLANT, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 一階一階爬上去
    { at: CLIMB, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: CLIMB, actor: 'yang', do: 'moveTo', to: { x: LEAN.x - 1, y: P - 7 }, dur: 0.12 },
    { at: CLIMB + 0.12, actor: 'yang', do: 'moveTo', to: { x: LEAN.x + 2, y: P - 14 }, dur: 0.12 },
    { at: CLIMB + 0.24, actor: 'yang', do: 'moveTo', to: { x: LEAN.x + 5, y: P - 21 }, dur: 0.12 },
    { at: CLIMB + 0.36, actor: 'yang', do: 'moveTo', to: ONTOP, arc: 4, dur: 0.18, ease: 'out' },
    { at: CLIMB + 0.54, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    // 在石頭頂上拿起餅乾吃
    { at: EAT - 0.1, actor: 'cookie', do: 'moveTo', to: { x: ONTOP.x + 5, y: ONTOP.y - 2 }, dur: 0.12 },
    { at: EAT, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: EAT + 0.3, actor: 'cookie', do: 'vanish', dur: 0.12 },
    // 回馬槍（第 4 次）：花生還是不聽、又跳——啪，滑下來，抬頭看見石頭頂上的他，傻眼
    ...s4.moves,
    { at: H4 + 0.6, actor: 'r', do: 'tilt', amount: -12, dur: 0.5 },
    // 收場：楊捷睿從石頭上跳到右前方；石頭帶著梯子滾走，花生追著跑掉
    { at: DOWN, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: DOWN, actor: 'yang', do: 'moveTo', to: { x: 130, y: P + 4 }, arc: 6, dur: 0.25, ease: 'in' },
    { at: DOWN, actor: 'rock', do: 'moveTo', to: { x: 205, y: RY }, dur: 0.22, ease: 'in' },
    { at: DOWN, actor: 'rock', do: 'rotateTo', amount: 160, dur: 0.22, ease: 'in' },
    { at: DOWN, actor: 'ladder', do: 'moveTo', to: { x: 190, y: LY }, dur: 0.22, ease: 'in' },
    { at: DOWN, actor: 'ladder', do: 'rotateTo', amount: 75, dur: 0.22, ease: 'in' },
    { at: DOWN, actor: 'r', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: DOWN, actor: 'r', do: 'moveTo', to: { x: 200, y: P }, dur: 0.2, ease: 'in' },
    // 問他：他在右前方變大，轉向左邊的字
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, actor: 'yang', do: 'flip' },
    { at: ASK, actor: 'yang', do: 'scaleTo', amount: 1.4 / 1.15, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.2, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: 12.7, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.76, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: 13.76, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.76, actor: 'yang', do: 'hop', amount: 6, dur: 0.15 },
    // 退場，畫面只留下字
    { at: 13.84, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.84, actor: 'yang', do: 'flip' },
    { at: 13.84, actor: 'yang', do: 'moveTo', to: { x: 205, y: P + 4 }, dur: 0.14, ease: 'in' },
  ],
  builds: [
    // 第 1 次：貼在石頭上的花生身上彈出月（肉月旁＝身體）
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2, 3], from: 'r', color: partColor('⺼') },
    // 第 2、3 次：大腦叮一下，頭頂的三道彎（巛）、腦門（囟）飛出來
    { at: D(H2) + 0.05, dur: 0.5, strokes: [4, 5, 6], from: 'brain', color: partColor('巛') },
    { at: D(H3) + 0.05, dur: 0.6, strokes: [7, 8, 9, 10, 11, 12], from: 'brain', color: partColor('囟') },
  ],
  glyph: [
    { at: HOMEAT, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到上方（偏右一點），左邊給楊捷睿和他的大腦、右邊給石頭和梯子
    { at: 8.05, dur: 0.45, do: 'park', to: { x: 86, y: 18 } },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的楊捷睿
    { at: ASK, dur: 2.73, do: 'ask', keep: ['yang'], to: { x: 64, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: 13.76, dur: 0.3, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.45, kind: 'pop', actor: 'yang', emoji: '❗', dx: -2, dur: 0.5, scale: 1.4 },
    ...s1.fx,
    ...d1.fx,
    ...s2.fx,
    ...d2.fx,
    // 第 3 次前停一拍：花生瞪著石頭
    { at: PAUSE, kind: 'pop', actor: 'r', emoji: '😤', dx: -10, dy: -4, dur: 0.5, scale: 1.7 },
    ...s3.fx,
    ...d3.fx,
    // 動腦：咚、咚，叮！燈泡
    { at: IDEA, kind: 'pop', actor: 'brain', emoji: '💡', dx: 22, dy: 18, dur: 0.6, scale: 2.4 },
    { at: IDEA, kind: 'burst', actor: 'brain', emoji: '✨', n: 8, dy: 12, dur: 0.5, scale: 1.8 },
    // 梯子架好那一下
    { at: PLANT, kind: 'burst', actor: 'ladder', emoji: '✨', n: 6, dy: 8, dur: 0.45, scale: 1.4 },
    ...s4.fx,
    { at: CLIMB + 0.54, kind: 'burst', actor: 'yang', emoji: '⭐', n: 6, dy: 4, dur: 0.45 },
    { at: H4 + 0.62, kind: 'pop', actor: 'r', emoji: '❗', dx: 2, dur: 0.33, scale: 1.6 },
    { at: 13.76, kind: 'burst', x: 64, y: 38, emoji: '🌟', n: 10, dur: 0.22 },
  ],
  camera: [
    // 前三次都要同時看得到楊捷睿的大腦和石頭：整段全景，不讓自動取景推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    { at: 7.0, dur: 0.3, do: 'zoom', amount: 1 },
    ...s1.camera,
    ...d1.camera,
    ...s2.camera,
    ...d2.camera,
    ...s3.camera,
    ...d3.camera,
    { at: IDEA, dur: 0.3, do: 'shake', amount: 1.2 },
    // 搬梯子、爬上去、花生貼上去：全景
    { at: FETCH, dur: 0.2, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s4.camera,
    { at: ASK, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    { at: HOMEAT, dur: 0.05, level: -0.35 },
    { at: HOMEAT + 0.05, dur: 0.35, level: 0 },
    { at: IDEA, dur: 0.04, level: -0.3 },
    { at: IDEA + 0.04, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '腦' },
    ...s1.cues,
    ...d1.cues,
    ...s2.cues,
    ...d2.cues,
    { at: PAUSE, sfx: 'tap' },
    { at: PAUSE + 0.2, sfx: 'tap' },
    ...s3.cues,
    ...d3.cues,
    { at: HOMEAT + 0.1, say: '腦' },
    { at: THINK + 0.15, sfx: 'tap' },
    { at: THINK + 0.35, sfx: 'tap' },
    { at: IDEA, sfx: 'clink' },
    { at: IDEA + 0.05, sfx: 'blip' },
    { at: LIFT, sfx: 'whoosh' },
    { at: PLANT, sfx: 'clink' },
    { at: PLANT + 0.05, say: '動腦' },
    { at: CLIMB, sfx: 'tap' },
    { at: CLIMB + 0.12, sfx: 'tap' },
    { at: CLIMB + 0.24, sfx: 'tap' },
    ...s4.cues,
    { at: EAT + 0.25, sfx: 'gulp' },
    { at: DOWN + 0.05, sfx: 'rumble' },
    { at: ASK, say: FIXED_LINES.clipAsk },
    { at: 13.76, say: '腦' },
    { at: 13.8, sfx: 'cheer' },
  ],
}

export default clip
