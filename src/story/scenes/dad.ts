import { scene } from '../scene'
import { castScale, type Clip, type Fx, type Move } from '../../anim/clip'
import type { Scenes } from './index'

// 爸爸不起來：早上窗外亮了，鬧鐘狂響狂跳，爸爸一掌拍扁、它彈回來又響，第二掌拍飛出畫面，繼續睡。
// 楊捷睿抱著球衝進來：丟球、推、跳到背上都叫不醒，還被一個大鼾聲吹回去。
// 用什麼叫他：蛙跳到頭上叫三聲、一聲比一聲大，爸爸鼾聲更大，青蛙自己被催眠，被一個大鼾聲噴出畫面；
// 冰塞進領口，停一拍，爸爸整個變藍發抖、像火箭衝上天，天上亮一顆星，咚一聲掉回來還在睡，冰塊彈出去滾走；
// 肉一拿出來，香味飄到鼻子，爸爸閉著眼睛被香味牽著飄起來、流口水、一口咬掉，醒了。
// 爸爸是大什麼（三個都要選、順序他決定）：大馬讓他騎著來回跑、越跑越快跑到吐舌頭；大山讓他一步一步爬到頭頂插旗，
// 爸爸腿抖冒汗，最後他滑下來；大熊吼一聲追上去一把抱住，抱太緊他被擠扁。之後爸爸累到站著打瞌睡，咚一聲倒回去睡，
// 楊捷睿爬到爸爸背上也睡了，那隻青蛙跳回來疊在最上面，三個一起冒 💤。
// 主角 eric（爸爸，size 36 比兒子大一號，站在地上 y = 61.9；34 以上引擎不再自動放大），楊捷睿 yang（size 22，y = 67.76，引擎會放大成 27）；圖都朝左。
// 共用的站位：爸爸一直在 x 88；楊捷睿在左邊 x 50、flip 面向爸爸。窗戶與窗裡的太陽每一頁都在。
// W1（等他選「用什麼叫他」）：爸爸趴睡（sleep）、楊捷睿 ponder；W2（肉的結尾、up 的開頭）：兩個都 happy；
// W3（等他選「爸爸是大什麼」）：爸爸 idle、楊捷睿 know。
type Cue = Clip['cues'][number]
const BG = { top: '#FFE7B8', bottom: '#FFF6E3', floor: '#C9A27A', scenery: 'room' as const }
const DAD_S = 36
const DG = 77 - 0.42 * DAD_S
const YANG_S = 22
const YG = 77 - 0.42 * YANG_S
const DAD_X = 88
const YANG_X = 50

/** 牆上的窗戶（左邊，右邊牆上有背景的畫框），太陽在窗裡右上角 */
const win = { id: 'win', emoji: 'prop:window', x: 28, y: 28, size: 24, float: true }
const SUN = { x: 33, y: 23 }
const sun = { id: 'sun', emoji: '☀️', ...SUN, size: 8, float: true }
const room = [win, sun]

const sleepingDad = { id: 'dad', emoji: 'hero:eric/sleep', x: DAD_X, y: DG, size: DAD_S }
const standingDad = (pose = 'idle') => ({ id: 'dad', emoji: `hero:eric/${pose}`, x: DAD_X, y: DG, size: DAD_S })
const yangAt = (pose: string) => ({ id: 'yang', emoji: `hero:yang/${pose}`, x: YANG_X, y: YG, size: YANG_S, flip: true })

/** 趴睡的爸爸（照 sleep 圖量的）：頭頂（給青蛙站）、嘴巴（鼾聲從這裡出來）、領口（冰塊塞這裡）、腿上（楊捷睿站、睡的地方） */
const HEAD = { x: 81, y: 57.5 }
const MOUTH = { x: 77, y: 68 }
const COLLAR = { x: 89, y: 66 }
const BACK = { x: 97, y: 69.5 }
/** zzz 從頭頂出來：趴著的頭比站著低，從頭的左上方往上飄（不擋站在腿上的楊捷睿） */
const SLEEP_Z = { dx: -14, dy: 9 }
/** 青蛙站在頭上時 zzz 改從身體那邊出來 */
const SLEEP_Z_R = { dx: 8, dy: 9 }

/** 照引擎 castUp 的算法：劇本寫 y0，畫出來腳底在哪裡（離地 25 以上漸漸改成以中心放大） */
function castFeet(y0: number, size: number) {
  const k = castScale(size)
  const h = 77 - (y0 + 0.42 * size)
  const fall = 1 - Math.min(1, Math.max(0, (h - 25) / 20))
  const feet = 77 - h * (1 + (k - 1) * fall)
  const y = y0 + (feet - 0.42 * size * k - y0) * fall
  return y + 0.42 * size * k
}
/**
 * 不在地上的角色要站在 F 這個高度（腳底）時 y 要寫多少。
 * 引擎會把小角色放大，離地的連「離地多高」一起放大（castUp），所以要反算回去，才會剛好踩在爸爸身上。
 */
function on(F: number, size = YANG_S) {
  let lo = -80, hi = 77
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (castFeet(mid, size) < F) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** 睡覺的 💤，從 from 到 to 每 1.6 秒一串 */
function zzz(from: number, to: number, scale = 1.3, who = 'dad', off: { dx: number; dy: number } = SLEEP_Z): Fx[] {
  const out: Fx[] = []
  for (let t = from; t < to - 0.4; t += 1.6) out.push({ at: +t.toFixed(2), kind: 'zzz', actor: who, emoji: '💤', ...off, scale, dur: Math.min(1.5, to - t) })
  return out
}

/** 打鼾：吸一口氣（拉長）、呼出來（壓扁）＋一串 💨 從嘴巴往左吹 */
function snore(at: number, size = 1, to = { x: 50, y: 62 }): { moves: Move[]; fx: Fx[] } {
  return {
    moves: [
      { at, actor: 'dad', do: 'squash', amount: -0.08 * size, dur: 0.35 },
      { at: +(at + 0.35).toFixed(2), actor: 'dad', do: 'squash', amount: 0.1 * size, dur: 0.3 },
    ],
    fx: [{ at: +(at + 0.35).toFixed(2), kind: 'blow', x: MOUTH.x, y: MOUTH.y, to, n: 4, scale: size, dur: 0.6 }],
  }
}
const merge = (...parts: { moves?: Move[]; fx?: Fx[]; cues?: Cue[] }[]) => ({
  moves: parts.flatMap((p) => p.moves ?? []),
  fx: parts.flatMap((p) => p.fx ?? []),
  cues: parts.flatMap((p) => p.cues ?? []),
})

/** 當馬：彎腰（bow）再壓寬成 HORSE 倍（又長又矮像馬背）；背在頭的右邊（臉朝左時） */
const HORSE = 1.25
const SEAT_DX = 5.5
const SEAT_Y = on(62)
/** 騎馬：爸爸帶著背上的楊捷睿跑到 x1，一步一顛（bump 越大顛得越兇），喀噠喀噠 */
function gallop(at: number, x1: number, dur: number, steps: number, faceRight: boolean, bump = 1, ease: Move['ease'] = 'linear') {
  const moves: Move[] = [
    { at, actor: 'dad', do: 'moveTo', to: { x: x1, y: DG }, dur, ease },
    { at, actor: 'yang', do: 'moveTo', to: { x: x1 + (faceRight ? -SEAT_DX : SEAT_DX), y: SEAT_Y }, dur, ease },
  ]
  const fx: Fx[] = []
  const cues: Cue[] = []
  const step = dur / steps
  for (let i = 0; i < steps; i++) {
    const t = +(at + i * step).toFixed(2)
    moves.push({ at: t, actor: 'dad', do: 'hop', amount: 1.6 * bump, dur: step * 0.9 })
    moves.push({ at: t, actor: 'yang', do: 'hop', amount: 2.6 * bump, dur: step * 0.9 })
    cues.push({ at: t, sfx: 'tap' })
    if (i % 2 === 0) fx.push({ at: t, kind: 'puff', actor: 'dad', dur: 0.4 })
  }
  return { moves, fx, cues }
}

/** 青蛙站在趴睡的爸爸頭頂（size 16 的 prop，圖底下留白一點點） */
const FROG_ON_HEAD = { x: HEAD.x, y: on(HEAD.y - 0.3, 16) }

/** 被肉牽著走：浮起來一點點；咬到肉時肉在嘴邊的位置（爸爸 doze 前傾、站在 x 54） */
const SNIFF_Y = DG - 5
const BITE = { x: 46, y: 50.5 }

/** 大山：爸爸長大成 MOUNTAIN 倍（36 × 1.3 = 46.8，不到 50，自動取景還框得到），頭頂 PEAK */
const MOUNTAIN = 1.3
const PEAK = 77 - (0.92 - 26 / 512) * DAD_S * MOUNTAIN + 0.3

/** 站著打瞌睡（doze）的爸爸鼻子：鼻涕泡從這裡冒出來 */
const SNOT = { x: 79, y: 58 }

/** 冰到整個人變藍 */
const BLUE = 'sepia(1) saturate(3) hue-rotate(170deg)'

/** 變成熊的棕色 */
const BEAR = 'sepia(1) hue-rotate(-45deg) saturate(1.8) brightness(0.8)'
/** 最後一頁楊捷睿趴在爸爸腿上睡的位置 */
const YANG_NAP = 101

const want = merge(snore(4.4, 2.2, { x: 40, y: 58 }))
const YANG_BODY = { x: YANG_X, y: 70 }
const frog = merge(snore(1.45, 1, YANG_BODY), snore(2.3, 1.5, YANG_BODY), snore(3.2, 2, YANG_BODY))

const scenes: Scenes = {
  // 早上了。爸爸在睡。——窗外亮起來、太陽出來；鬧鐘狂響狂跳越跳越近，爸爸一掌拍扁，它彈回來又響，第二掌拍飛出畫面，繼續睡
  sleep: scene({
    duration: 5.4,
    bg: BG,
    actors: [
      { ...win, tint: 'brightness(0.45)' },
      { ...sun, y: SUN.y + 6, hidden: true },
      sleepingDad,
      { id: 'clock', emoji: 'prop:alarm-clock', x: 60, y: 77 - 0.42 * 15, size: 15 },
      { id: 'hand', emoji: '🫳', x: 82, y: 58, size: 13, hidden: true, float: true },
    ],
    moves: [
      { at: 0.15, actor: 'win', do: 'tint', filter: 'brightness(0.6)' },
      { at: 0.35, actor: 'win', do: 'tint', filter: 'brightness(0.75)' },
      { at: 0.55, actor: 'win', do: 'tint', filter: 'brightness(0.9)' },
      { at: 0.75, actor: 'win', do: 'tint', filter: '' },
      { at: 0.3, actor: 'sun', do: 'pop', dur: 0.3 },
      { at: 0.35, actor: 'sun', do: 'moveTo', to: SUN, dur: 0.9, ease: 'out' },
      // 鬧鐘響：一次比一次跳得高、抖得兇、往爸爸的頭靠過去
      { at: 1.0, actor: 'clock', do: 'shake', amount: 1.2, dur: 0.4 },
      { at: 1.0, actor: 'clock', do: 'hop', amount: 2, dur: 0.25 },
      { at: 1.4, actor: 'clock', do: 'hop', amount: 4, dur: 0.3 },
      { at: 1.4, actor: 'clock', do: 'shake', amount: 2, dur: 0.4 },
      { at: 1.4, actor: 'clock', do: 'moveTo', to: { x: 63, y: 77 - 0.42 * 15 }, dur: 0.3 },
      { at: 1.85, actor: 'clock', do: 'hop', amount: 6, dur: 0.35 },
      { at: 1.85, actor: 'clock', do: 'shake', amount: 3, dur: 0.45 },
      { at: 1.85, actor: 'clock', do: 'moveTo', to: { x: 66, y: 77 - 0.42 * 15 }, dur: 0.35 },
      { at: 1.5, actor: 'dad', do: 'shake', amount: 0.5, dur: 0.4 },
      // 手舉起來……啪！拍扁
      { at: 2.25, actor: 'hand', do: 'pop', dur: 0.12 },
      { at: 2.3, actor: 'hand', do: 'moveTo', to: { x: 70, y: 46 }, dur: 0.2, ease: 'out' },
      { at: 2.5, actor: 'hand', do: 'moveTo', to: { x: 66, y: 62 }, dur: 0.08, ease: 'in' },
      { at: 2.58, actor: 'clock', do: 'stretchTo', amount: 1.9, dur: 0.06 },
      { at: 2.58, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 2.9, actor: 'hand', do: 'moveTo', to: { x: 82, y: 58 }, dur: 0.2 },
      { at: 3.1, actor: 'hand', do: 'vanish', dur: 0.08 },
      // 扁掉的鬧鐘抖一抖，彈回來又響
      { at: 2.9, actor: 'clock', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 3.25, actor: 'clock', do: 'stretchTo', amount: 1 / 1.9, dur: 0.3, ease: 'elastic' },
      { at: 3.3, actor: 'clock', do: 'hop', amount: 5, dur: 0.35 },
      { at: 3.3, actor: 'clock', do: 'shake', amount: 3, dur: 0.4 },
      // 第二掌更大：橫著一掃，拍飛出畫面
      { at: 3.6, actor: 'hand', do: 'pop', dur: 0.1 },
      { at: 3.6, actor: 'hand', do: 'scaleTo', amount: 1.4, dur: 0.1 },
      { at: 3.62, actor: 'hand', do: 'moveTo', to: { x: 90, y: 56 }, dur: 0.15, ease: 'out' },
      { at: 3.78, actor: 'hand', do: 'moveTo', to: { x: 62, y: 64 }, dur: 0.1, ease: 'in' },
      { at: 3.88, actor: 'clock', do: 'moveTo', to: { x: -16, y: 14 }, arc: 14, dur: 0.6, ease: 'out' },
      { at: 3.88, actor: 'clock', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
      { at: 4.5, actor: 'clock', do: 'vanish', dur: 0.05 },
      { at: 4.1, actor: 'hand', do: 'moveTo', to: { x: 82, y: 58 }, dur: 0.2 },
      { at: 4.3, actor: 'hand', do: 'vanish', dur: 0.08 },
      // 舒服地蹭一下，繼續睡
      { at: 4.6, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.5 },
    ],
    fx: [
      { at: 0.3, kind: 'burst', actor: 'sun', emoji: '✨', n: 6, dy: 4, dur: 0.9 },
      ...zzz(0.3, 2.2),
      { at: 1.0, kind: 'burst', actor: 'clock', emoji: '🎵', n: 4, dy: 4, dur: 0.5 },
      { at: 1.4, kind: 'burst', actor: 'clock', emoji: '🎵', n: 6, dy: 4, scale: 1.4, dur: 0.5 },
      { at: 1.85, kind: 'burst', actor: 'clock', emoji: '🔔', n: 7, dy: 4, scale: 1.7, dur: 0.6 },
      { at: 2.58, kind: 'burst', x: 66, y: 64, n: 1, dur: 0.4 },
      { at: 3.3, kind: 'burst', actor: 'clock', emoji: '🔔', n: 6, dy: 4, scale: 1.4, dur: 0.4 },
      { at: 3.88, kind: 'burst', x: 64, y: 62, n: 1, scale: 1.4, dur: 0.4 },
      ...zzz(4.0, 5.4, 1.6),
    ],
    lights: [{ at: 0, dur: 0.01, level: 0.4 }, { at: 0.15, dur: 0.9, level: 0 }],
    camera: [
      { at: 2.58, dur: 0.3, do: 'shake', amount: 1 },
      { at: 3.88, dur: 0.35, do: 'shake', amount: 1.6 },
    ],
    cues: [
      { at: 0.35, say: '早上了。爸爸在睡。' },
      { at: 1.0, sfx: 'blip' },
      { at: 1.4, sfx: 'blip' },
      { at: 1.85, sfx: 'blip' },
      { at: 2.58, sfx: 'bonk' },
      { at: 3.25, sfx: 'boing' },
      { at: 3.88, sfx: 'whoosh' },
    ],
  }),

  // 楊捷睿想玩。爸爸不起來！——抱著球衝進來，丟球打到頭彈走、用力推、跳到背上蹦蹦跳，爸爸都沒醒；
  // 吸一口氣一個大鼾聲把他吹回左邊，停在 W1 想辦法
  want: scene({
    duration: 6.4,
    bg: BG,
    actors: [
      ...room,
      sleepingDad,
      { id: 'yang', emoji: 'hero:yang/dash', x: 58, y: YG, size: YANG_S, flip: true, hidden: true },
      { id: 'ball', emoji: '⚽', x: 66, y: 67, size: 8, hidden: true, float: true, pivot: 'center' as const },
    ],
    moves: [
      { at: 0.05, actor: 'yang', do: 'enter', from: { x: -14, y: YG }, dur: 0.6, ease: 'out' },
      { at: 0.05, actor: 'ball', do: 'enter', from: { x: -6, y: 67 }, dur: 0.6, ease: 'out' },
      { at: 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 0.7, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 0.7, actor: 'ball', do: 'hop', amount: 4, dur: 0.3 },
      // 丟球：打到頭、彈走
      { at: 1.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
      { at: 1.25, actor: 'ball', do: 'moveTo', to: { x: HEAD.x - 2, y: HEAD.y + 1 }, arc: 8, dur: 0.3, ease: 'in' },
      { at: 1.25, actor: 'ball', do: 'spin', times: 1, dur: 0.3 },
      { at: 1.55, actor: 'ball', do: 'moveTo', to: { x: 175, y: 20 }, arc: 14, dur: 0.7, ease: 'out' },
      { at: 1.55, actor: 'ball', do: 'spin', times: 3, dur: 0.7 },
      { at: 2.25, actor: 'ball', do: 'vanish', dur: 0.05 },
      { at: 1.55, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.2 },
      // 推：推不動
      { at: 1.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
      { at: 2.0, actor: 'yang', do: 'moveTo', to: { x: 69, y: YG }, dur: 0.3 },
      { at: 2.35, actor: 'yang', do: 'shake', amount: 1, dur: 0.6 },
      { at: 2.35, actor: 'dad', do: 'shake', amount: 0.4, dur: 0.6 },
      // 跳到背上蹦蹦跳
      { at: 3.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 3.0, actor: 'yang', do: 'moveTo', to: { x: BACK.x, y: on(BACK.y) }, arc: 10, dur: 0.4 },
      { at: 3.45, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 3.55, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
      { at: 3.85, actor: 'dad', do: 'squash', amount: 0.18, dur: 0.2 },
      { at: 3.9, actor: 'yang', do: 'hop', amount: 6, dur: 0.3 },
      { at: 4.2, actor: 'dad', do: 'squash', amount: 0.2, dur: 0.2 },
      { at: 4.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      // 大鼾聲：吹回左邊
      ...want.moves,
      { at: 4.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 4.75, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, arc: 10, dur: 0.5, ease: 'out' },
      { at: 4.75, actor: 'yang', do: 'tilt', amount: -35, dur: 0.5 },
      { at: 5.35, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 5.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    ],
    fx: [
      ...zzz(0.2, 4.4),
      { at: 0.7, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.6 },
      { at: 1.55, kind: 'burst', x: HEAD.x - 2, y: HEAD.y - 2, n: 1, scale: 0.8, dur: 0.3 },
      { at: 2.4, kind: 'sweat', actor: 'yang' },
      ...want.fx,
      { at: 4.8, kind: 'burst', actor: 'yang', emoji: '💨', n: 5, dur: 0.5 },
      ...zzz(4.9, 6.4, 1.6),
      { at: 5.8, kind: 'pop', actor: 'yang', emoji: '❓', dur: 0.6 },
    ],
    camera: [{ at: 4.75, dur: 0.35, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 0.05, sfx: 'whoosh' },
      { at: 0.9, say: '楊捷睿想玩。爸爸不起來！' },
      { at: 1.55, sfx: 'boing' },
      { at: 3.45, sfx: 'boing' },
      { at: 3.85, sfx: 'boing' },
      { at: 4.2, sfx: 'boing' },
      { at: 4.75, sfx: 'rumble' },
    ],
  }),

  // 蛙在他的頭上叫。他沒聽到！——青蛙從左邊一跳落在爸爸頭上，叫三聲一聲比一聲大，爸爸的鼾聲也一聲比一聲大；
  // 青蛙自己被鼾聲催眠打瞌睡，爸爸吸一口氣、一個超大的鼾聲把青蛙噴出畫面。回到 W1
  'wake:蛙': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      ...room,
      sleepingDad,
      yangAt('ponder'),
      { id: 'frog', emoji: 'prop:frog-jump', x: -12, y: 46, size: 16, flip: true, hidden: true },
    ],
    moves: [
      { at: 0.05, actor: 'frog', do: 'pop', dur: 0.05 },
      { at: 0.1, actor: 'frog', do: 'moveTo', to: FROG_ON_HEAD, arc: 22, dur: 0.65, ease: 'linear' },
      { at: 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.3, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 0.75, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
      { at: 0.75, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.2 },
      { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
      // 叫三聲：一聲比一聲大
      { at: 1.1, actor: 'frog', do: 'squash', amount: -0.2, dur: 0.25 },
      { at: 1.9, actor: 'frog', do: 'squash', amount: -0.35, dur: 0.3 },
      { at: 1.9, actor: 'frog', do: 'hop', amount: 2, dur: 0.3 },
      { at: 2.8, actor: 'frog', do: 'squash', amount: -0.4, dur: 0.35 },
      { at: 2.8, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
      { at: 2.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
      ...frog.moves,
      // 青蛙被鼾聲催眠：搖啊搖、閉眼
      { at: 3.8, actor: 'frog', do: 'swap', emoji: 'prop:frog-wink' },
      { at: 3.8, actor: 'frog', do: 'scaleTo', amount: 0.82, dur: 0.01 },
      { at: 3.8, actor: 'frog', do: 'tilt', amount: -14, dur: 0.6 },
      { at: 3.8, actor: 'frog', do: 'squash', amount: 0.12, dur: 0.6 },
      { at: 4.4, actor: 'frog', do: 'tilt', amount: 16, dur: 0.6 },
      { at: 4.4, actor: 'frog', do: 'squash', amount: 0.15, dur: 0.6 },
      { at: 3.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
      // 吸一大口氣……噴！
      { at: 4.6, actor: 'dad', do: 'squash', amount: -0.2, dur: 0.5 },
      { at: 4.6, actor: 'frog', do: 'hop', amount: 2, dur: 0.5 },
      { at: 5.1, actor: 'dad', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: 5.1, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
      { at: 5.1, actor: 'frog', do: 'scaleTo', amount: 1 / 0.82, dur: 0.01 },
      { at: 5.1, actor: 'frog', do: 'moveTo', to: { x: 150, y: -14 }, arc: 10, dur: 0.55, ease: 'out' },
      { at: 5.1, actor: 'frog', do: 'spin', times: 3, dur: 0.55, pivot: 'center' },
      { at: 5.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 5.2, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 6.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    ],
    fx: [
      { at: 0.75, kind: 'puff', actor: 'frog', dur: 0.3 },
      { at: 1.1, kind: 'burst', actor: 'frog', emoji: '🎵', n: 5, dy: 3, dur: 0.6 },
      { at: 1.9, kind: 'burst', actor: 'frog', emoji: '🎵', n: 7, dy: 3, scale: 1.5, dur: 0.7 },
      { at: 2.8, kind: 'burst', actor: 'frog', emoji: '🎶', n: 10, dy: 3, scale: 2.1, dur: 0.8 },
      ...frog.fx,
      ...zzz(0.2, 3.7, 1.1, 'dad', SLEEP_Z_R),
      { at: 3.4, kind: 'zzz', actor: 'dad', emoji: '💤', ...SLEEP_Z_R, scale: 2, dur: 1.4 },
      { at: 3.9, kind: 'zzz', actor: 'frog', emoji: '💤', dx: -14, scale: 0.9, dur: 1.2 },
      { at: 5.1, kind: 'blow', x: MOUTH.x + 2, y: MOUTH.y - 4, to: { x: 120, y: 20 }, n: 5, scale: 2, dur: 0.6 },
      { at: 5.1, kind: 'burst', x: HEAD.x, y: HEAD.y - 4, emoji: '💨', n: 6, scale: 1.4, dur: 0.5 },
      ...zzz(5.5, 6.6, 1.3, 'dad', SLEEP_Z_R),
    ],
    camera: [
      { at: 1.9, dur: 0.25, do: 'shake', amount: 0.6 },
      { at: 2.8, dur: 0.35, do: 'shake', amount: 1.3 },
      // 青蛙往右上飛出去：自動取景會追著青蛙、把地上的兩個切掉，自己定住，飛走以後再交回去
      { at: 4.6, dur: 0.4, do: 'zoom', amount: 1.25, to: { x: 76, y: 52 } },
      { at: 5.1, dur: 0.35, do: 'shake', amount: 1.6 },
      { at: 5.9, dur: 0.5, do: 'zoom', amount: 1 },
    ],
    cues: [
      { at: 0.1, sfx: 'boing' },
      { at: 1.0, say: '蛙在他的頭上叫。他沒聽到！' },
      { at: 1.1, sfx: 'blip' },
      { at: 1.9, sfx: 'blip' },
      { at: 2.8, sfx: 'blip' },
      { at: 5.1, sfx: 'whoosh' },
    ],
  }),

  // 好冰！爸爸跳到天上了！——冰塊啵一聲在他手上，偷偷塞進爸爸領口；停一拍，爸爸變藍、發抖、整個人縮起來，
  // 像火箭一樣衝出畫面上緣，天上亮一顆星；咚一聲掉回原位還在睡，冰塊彈出來滾走。回到 W1
  'wake:冰': scene({
    duration: 7.0,
    bg: BG,
    actors: [
      ...room,
      sleepingDad,
      yangAt('ponder'),
      { id: 'ice', emoji: 'prop:ice', x: 62, y: 67, size: 9, hidden: true, float: true, pivot: 'center' as const },
      { id: 'star', emoji: '🌟', x: 88, y: 10, size: 12, hidden: true, float: true },
    ],
    moves: [
      { at: 0.15, actor: 'ice', do: 'pop', dur: 0.3 },
      { at: 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      // 踮腳過去、塞進領口
      { at: 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
      { at: 0.75, actor: 'yang', do: 'moveTo', to: { x: 66, y: YG }, dur: 0.5 },
      { at: 0.75, actor: 'ice', do: 'moveTo', to: { x: 78, y: 54 }, dur: 0.5 },
      { at: 1.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 1.35, actor: 'ice', do: 'moveTo', to: COLLAR, arc: 4, dur: 0.3, ease: 'in' },
      { at: 1.65, actor: 'ice', do: 'scaleTo', amount: 0.3, dur: 0.15 },
      { at: 1.8, actor: 'ice', do: 'vanish', dur: 0.05 },
      { at: 1.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 1.85, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.45 },
      // 停一拍……變藍、發抖
      { at: 2.3, actor: 'dad', do: 'tint', filter: BLUE },
      { at: 2.3, actor: 'dad', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: 2.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/cold' },
      { at: 2.6, actor: 'dad', do: 'shake', amount: 2.4, dur: 0.5 },
      { at: 2.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      // 火箭！
      { at: 3.1, actor: 'dad', do: 'squash', amount: 0.25, dur: 0.15 },
      { at: 3.25, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: -34 }, dur: 0.35, ease: 'in' },
      { at: 3.75, actor: 'star', do: 'pop', dur: 0.25 },
      { at: 4.0, actor: 'star', do: 'shake', amount: 1, dur: 0.4 },
      // 他在地上：指著天上、跳起來看、伸長脖子越看嘴巴越大，爸爸掉下來時抱頭
      { at: 3.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
      { at: 3.6, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 3.95, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      { at: 4.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 4.3, actor: 'yang', do: 'squash', amount: -0.18, dur: 0.3 },
      { at: 4.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
      { at: 4.4, actor: 'star', do: 'vanish', dur: 0.2 },
      // 咚！掉回來，還在睡
      { at: 4.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/sleep' },
      { at: 4.6, actor: 'dad', do: 'tint', filter: 'sepia(0.5) saturate(1.6) hue-rotate(170deg)' },
      { at: 4.6, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.35, ease: 'in' },
      { at: 4.95, actor: 'dad', do: 'tint', filter: '' },
      { at: 4.95, actor: 'dad', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 4.95, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 4.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      // 冰塊彈出來滾走
      { at: 5.0, actor: 'ice', do: 'pop', dur: 0.1 },
      { at: 5.0, actor: 'ice', do: 'moveTo', to: { x: 120, y: 72 }, arc: 12, dur: 0.5, ease: 'out' },
      { at: 5.5, actor: 'ice', do: 'moveTo', to: { x: 176, y: 72 }, dur: 0.6, ease: 'in' },
      { at: 5.0, actor: 'ice', do: 'rotateTo', amount: 540, dur: 1.1 },
      { at: 6.1, actor: 'ice', do: 'vanish', dur: 0.05 },
      { at: 5.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 6.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    ],
    fx: [
      ...zzz(0.2, 2.1),
      { at: 0.15, kind: 'burst', actor: 'ice', emoji: '❄️', n: 6, dy: -2, dur: 0.6 },
      { at: 1.7, kind: 'burst', x: COLLAR.x, y: COLLAR.y - 2, emoji: '❄️', n: 5, dur: 0.5 },
      { at: 2.3, kind: 'pop', actor: 'dad', emoji: '❗', dx: -8, dy: 8, dur: 0.4 },
      { at: 2.6, kind: 'pop', actor: 'dad', emoji: '🥶', dx: -2, dur: 0.6 },
      { at: 2.6, kind: 'burst', actor: 'dad', emoji: '❄️', n: 8, dy: 6, dur: 0.6 },
      { at: 3.25, kind: 'puff', x: DAD_X, y: 70, dur: 0.5 },
      { at: 3.25, kind: 'burst', x: DAD_X, y: 66, emoji: '💨', n: 6, scale: 1.4, dur: 0.6 },
      { at: 3.75, kind: 'burst', x: 88, y: 12, emoji: '✨', n: 8, dur: 0.7 },
      { at: 4.95, kind: 'burst', actor: 'dad', n: 1, dx: 6, dy: 14, scale: 1.4, dur: 0.4 },
      { at: 4.95, kind: 'puff', actor: 'dad', dur: 0.5 },
      { at: 5.0, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      ...zzz(5.4, 7.0, 1.4),
    ],
    camera: [
      // 爸爸飛出上緣、天上亮星星、掉回來：自動取景會只框楊捷睿，自己定成全景
      { at: 3.0, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
      { at: 3.25, dur: 0.3, do: 'shake', amount: 1 },
      { at: 4.95, dur: 0.4, do: 'shake', amount: 2.2 },
      { at: 5.5, dur: 0.5, do: 'zoom', amount: 1 },
    ],
    cues: [
      { at: 0.15, sfx: 'poof' },
      { at: 1.35, sfx: 'slide' },
      { at: 2.3, say: '好冰！爸爸跳到天上了！' },
      { at: 3.25, sfx: 'whoosh' },
      { at: 3.75, sfx: 'blip' },
      { at: 4.6, sfx: 'whoosh' },
      { at: 4.95, sfx: 'bonk' },
    ],
  }),

  // 爸爸聞到肉了。他起來了！——他拿出一塊大肉，香味一波一波飄到爸爸鼻子，鼻子抽兩下；爸爸閉著眼睛浮起來、鼻子在前、
  // 身體往前傾，沿著香味滑過去；他拿著肉往後退、爸爸跟過去，退兩次（一次比一次快），第三次被追上一口咬住。
  // 啃三下肉一次比一次小，變成一根骨頭，眼睛睜開，把骨頭踢飛，兩個回原位。結尾 W2：爸爸醒著站回中間、他在左邊開心
  'wake:肉': scene({
    duration: 7.4,
    bg: BG,
    actors: [
      ...room,
      sleepingDad,
      yangAt('ponder'),
      { id: 'meat', emoji: 'prop:meat', x: 62, y: 64, size: 13, hidden: true, float: true, pivot: 'center' as const },
    ],
    moves: [
      { at: 0.15, actor: 'meat', do: 'pop', dur: 0.3 },
      { at: 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 0.5, actor: 'meat', do: 'tilt', amount: 8, dur: 0.6 },
      // 鼻子抽一下、兩下
      { at: 1.1, actor: 'dad', do: 'squash', amount: -0.08, dur: 0.2 },
      { at: 1.4, actor: 'dad', do: 'squash', amount: -0.1, dur: 0.2 },
      // 閉著眼睛浮起來一點點，鼻子在前、往前傾
      { at: 1.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/doze' },
      { at: 1.7, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: SNIFF_Y }, dur: 0.35, ease: 'out' },
      { at: 1.7, actor: 'dad', do: 'rotateTo', amount: 12, dur: 0.35 },
      // 第一次：滑過去，他往後退一步
      { at: 2.1, actor: 'dad', do: 'moveTo', to: { x: 74, y: SNIFF_Y }, dur: 0.5 },
      { at: 2.1, actor: 'dad', do: 'hop', amount: 1, dur: 0.5 },
      { at: 2.45, actor: 'yang', do: 'moveTo', to: { x: 40, y: YG }, dur: 0.35 },
      { at: 2.45, actor: 'meat', do: 'moveTo', to: { x: 52, y: 64 }, dur: 0.35 },
      // 第二次：快一點
      { at: 2.85, actor: 'dad', do: 'moveTo', to: { x: 64, y: SNIFF_Y }, dur: 0.35 },
      { at: 2.85, actor: 'dad', do: 'hop', amount: 1, dur: 0.35 },
      { at: 3.05, actor: 'yang', do: 'moveTo', to: { x: 30, y: YG }, dur: 0.22 },
      { at: 3.05, actor: 'meat', do: 'moveTo', to: { x: 42, y: 64 }, dur: 0.22 },
      // 第三次：衝過去，啊嗚！咬住
      { at: 3.35, actor: 'dad', do: 'moveTo', to: { x: 54, y: SNIFF_Y }, dur: 0.2, ease: 'in' },
      { at: 3.55, actor: 'meat', do: 'moveTo', to: BITE, dur: 0.06 },
      { at: 3.55, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 3.55, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 3.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 3.55, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      // 啃三下：一次比一次小
      ...[3.9, 4.25, 4.6].flatMap((t): Move[] => [
        { at: t, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.18 },
        { at: t, actor: 'meat', do: 'scaleTo', amount: 0.8, dur: 0.08 },
        { at: t, actor: 'meat', do: 'shake', amount: 0.5, dur: 0.15 },
      ]),
      { at: 4.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      // 只剩骨頭：眼睛睜開、落地
      { at: 4.95, actor: 'meat', do: 'swap', emoji: 'prop:bone' },
      { at: 4.95, actor: 'meat', do: 'scaleTo', amount: 1.6, dur: 0.1 },
      { at: 4.95, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 4.95, actor: 'dad', do: 'rotateTo', amount: -12, dur: 0.2 },
      { at: 4.95, actor: 'dad', do: 'moveTo', to: { x: 54, y: DG }, dur: 0.25 },
      { at: 5.1, actor: 'meat', do: 'moveTo', to: { x: 42, y: 69 }, dur: 0.3, ease: 'in' },
      // 把骨頭踢飛
      { at: 5.55, actor: 'dad', do: 'swap', emoji: 'hero:eric/kick' },
      { at: 5.6, actor: 'meat', do: 'moveTo', to: { x: -16, y: 22 }, arc: 10, dur: 0.5, ease: 'out' },
      { at: 5.6, actor: 'meat', do: 'spin', times: -2, dur: 0.5 },
      { at: 6.1, actor: 'meat', do: 'vanish', dur: 0.05 },
      // 回原位
      { at: 6.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 6.05, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.6 },
      { at: 6.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 6.1, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.55 },
      { at: 6.8, actor: 'dad', do: 'hop', amount: 4, dur: 0.35 },
      { at: 6.8, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
    ],
    fx: [
      ...zzz(0.2, 1.6),
      { at: 0.15, kind: 'burst', actor: 'meat', emoji: '✨', n: 6, dy: 4, dur: 0.6 },
      { at: 0.45, kind: 'blow', x: 64, y: 62, to: { x: MOUTH.x, y: MOUTH.y - 2 }, emoji: '〰️', n: 3, dur: 0.8 },
      { at: 0.95, kind: 'blow', x: 64, y: 62, to: { x: MOUTH.x, y: MOUTH.y - 2 }, emoji: '〰️', n: 3, dur: 0.8 },
      { at: 1.15, kind: 'pop', actor: 'dad', emoji: '❗', dx: -20, dy: 8, dur: 0.5 },
      // 香味的波浪線一直牽著鼻子
      ...[1.65, 2.2, 2.75, 3.2].map((t): Fx => ({ at: t, kind: 'blow', actor: 'meat', dy: 4, target: 'dad', emoji: '〰️', n: 3, dur: 0.6 })),
      { at: 2.1, kind: 'zzz', actor: 'dad', emoji: '💤', dx: 4, scale: 0.9, dur: 1.4 },
      { at: 2.5, kind: 'pop', actor: 'yang', emoji: '😆', dx: -12, dur: 0.6 },
      { at: 3.55, kind: 'burst', x: BITE.x, y: BITE.y - 2, n: 1, scale: 0.8, dur: 0.3 },
      ...[3.9, 4.25, 4.6].map((t, i): Fx => ({ at: t, kind: 'burst', x: BITE.x, y: BITE.y, emoji: '🟤', n: 4 + i, scale: 0.7, dur: 0.4 })),
      { at: 4.95, kind: 'burst', actor: 'dad', emoji: '⭐', n: 7, dy: -6, dur: 0.8 },
      { at: 5.0, kind: 'pop', actor: 'dad', emoji: '😋', dx: 4, dur: 1.0 },
      { at: 5.6, kind: 'swoosh', actor: 'dad', dx: -6, dy: 26, target: 'meat', n: 8, dur: 0.3 },
    ],
    cues: [
      { at: 0.15, sfx: 'poof' },
      { at: 1.0, say: '爸爸聞到肉了。他起來了！' },
      { at: 3.55, sfx: 'crack' },
      { at: 3.9, sfx: 'gulp' },
      { at: 4.25, sfx: 'gulp' },
      { at: 4.6, sfx: 'gulp' },
      { at: 4.95, sfx: 'poof' },
      { at: 5.6, sfx: 'whoosh' },
      { at: 6.8, sfx: 'cheer' },
    ],
  }),
  // 爸爸起來了！一起玩！——伸個大懶腰、打大呵欠（把他的頭髮吹亂），他開心跳兩下撲過去，爸爸把他舉高高拋兩下，放回左邊。結尾 W3
  up: scene({
    duration: 5.2,
    bg: BG,
    actors: [...room, standingDad('happy'), yangAt('happy')],
    moves: [
      { at: 0.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/yawn' },
      { at: 0.1, actor: 'dad', do: 'squash', amount: -0.15, dur: 0.8 },
      { at: 0.5, actor: 'yang', do: 'tilt', amount: -10, dur: 0.5 },
      { at: 1.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 1.05, actor: 'yang', do: 'hop', amount: 6, dur: 0.4 },
      { at: 1.5, actor: 'yang', do: 'hop', amount: 7, dur: 0.4 },
      // 撲過去、舉高高
      { at: 1.95, actor: 'dad', do: 'swap', emoji: 'hero:eric/hug' },
      { at: 1.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
      { at: 2.0, actor: 'yang', do: 'moveTo', to: { x: 72, y: YG }, dur: 0.3, ease: 'in' },
      { at: 2.35, actor: 'dad', do: 'swap', emoji: 'hero:eric/lift' },
      { at: 2.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 2.35, actor: 'yang', do: 'moveTo', to: { x: DAD_X, y: on(47) }, arc: 4, dur: 0.3, ease: 'out' },
      { at: 2.8, actor: 'yang', do: 'hop', amount: 7, dur: 0.4 },
      { at: 2.8, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.2 },
      { at: 3.25, actor: 'yang', do: 'hop', amount: 9, dur: 0.45 },
      { at: 3.25, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.2 },
      // 放下來
      { at: 3.8, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, arc: 8, dur: 0.5 },
      { at: 3.85, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 4.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/idle' },
      { at: 4.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    ],
    fx: [
      { at: 0.3, kind: 'blow', actor: 'dad', dx: -6, dy: 8, target: 'yang', n: 4, dur: 0.7 },
      { at: 1.05, kind: 'burst', actor: 'yang', emoji: '🎉', n: 6, dy: -6, dur: 0.8 },
      { at: 2.8, kind: 'burst', actor: 'yang', emoji: '💗', n: 7, dy: -6, dur: 0.9 },
      { at: 3.3, kind: 'pop', actor: 'dad', emoji: '😆', dx: 6, dy: 8, dur: 1.0 },
    ],
    cues: [
      { at: 0.4, say: '爸爸起來了！一起玩！' },
      { at: 2.35, sfx: 'boing' },
      { at: 2.8, sfx: 'boing' },
      { at: 3.25, sfx: 'cheer' },
    ],
  }),

  // 爸爸是大馬！跑好快！——爸爸彎下腰變成馬，他跳上背。第一趟慢慢走（喀噠、喀噠），第二趟小跑，第三趟快到他整個人往後飄、
  // 嚇一跳，衝出畫面左邊、從右邊衝回來急煞，塵土一大團；他跳下來歡呼，爸爸吐著舌頭喘，甩甩頭站直。開頭結尾都是 W3
  'game:馬': scene({
    duration: 6.6,
    bg: BG,
    actors: [...room, standingDad(), yangAt('know')],
    ...(() => {
      const legs = merge(
        gallop(1.0, 60, 1.0, 4, false, 1),
        gallop(2.15, 124, 0.6, 6, true, 1.6),
        gallop(2.95, -30, 0.35, 4, false, 2.2),
        gallop(3.33, DAD_X, 0.5, 3, false, 2.2, 'out'),
      )
      return {
        moves: [
          { at: 0.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/bow' },
          { at: 0.1, actor: 'dad', do: 'stretchTo', amount: HORSE, dur: 0.3, ease: 'back' },
          { at: 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
          { at: 0.35, actor: 'yang', do: 'moveTo', to: { x: DAD_X + SEAT_DX, y: SEAT_Y }, arc: 10, dur: 0.45 },
          { at: 0.8, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.2 },
          { at: 0.8, actor: 'yang', do: 'flip' },
          ...legs.moves,
          // 第二趟：小跑，他開心
          { at: 2.05, actor: 'dad', do: 'flip' },
          { at: 2.05, actor: 'yang', do: 'flip' },
          { at: 2.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
          // 第三趟：快到他往後飄
          { at: 2.85, actor: 'dad', do: 'flip' },
          { at: 2.85, actor: 'yang', do: 'flip' },
          { at: 2.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
          { at: 2.9, actor: 'yang', do: 'rotateTo', amount: 28, dur: 0.15 },
          // 衝出左邊，從右邊衝回來（畫面外瞬間換邊）
          { at: 3.31, actor: 'dad', do: 'moveTo', to: { x: 200, y: DG }, dur: 0.01 },
          { at: 3.31, actor: 'yang', do: 'moveTo', to: { x: 200 + SEAT_DX, y: SEAT_Y }, dur: 0.01 },
          // 急煞：他往前一甩
          { at: 3.85, actor: 'dad', do: 'squash', amount: 0.3, dur: 0.3 },
          { at: 3.85, actor: 'yang', do: 'rotateTo', amount: -28, dur: 0.35, ease: 'back' },
          // 跳下來歡呼，爸爸吐舌頭
          { at: 4.25, actor: 'yang', do: 'flip' },
          { at: 4.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
          { at: 4.25, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, arc: 8, dur: 0.45 },
          { at: 4.35, actor: 'dad', do: 'swap', emoji: 'hero:eric/tired' },
          { at: 4.35, actor: 'dad', do: 'stretchTo', amount: 1 / HORSE, dur: 0.2 },
          { at: 4.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
          { at: 4.8, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
          { at: 4.8, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
          { at: 5.1, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
          { at: 5.3, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
          { at: 5.4, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
          { at: 5.75, actor: 'dad', do: 'shake', amount: 1, dur: 0.3 },
          { at: 5.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/idle' },
          { at: 6.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
        ],
        fx: [
          { at: 0.1, kind: 'bubble', actor: 'dad', emoji: '🐎', scale: 1.3, dur: 0.9 },
          ...legs.fx,
          { at: 2.95, kind: 'pop', actor: 'yang', emoji: '❗', dx: 2, dur: 0.35 },
          { at: 3.85, kind: 'burst', x: DAD_X, y: 70, emoji: '💨', n: 9, scale: 1.8, dur: 0.7 },
          { at: 3.85, kind: 'puff', actor: 'dad', scale: 1.8, dur: 0.6 },
          { at: 4.4, kind: 'sweat', actor: 'dad', dx: 4 },
          { at: 4.8, kind: 'burst', actor: 'yang', emoji: '🎉', n: 6, dy: -6, dur: 0.8 },
          { at: 4.9, kind: 'sweat', actor: 'dad', dx: 4 },
        ],
        // 第三趟衝出畫面：自己定成全景，不讓自動取景追出去；煞住以後交回去
        camera: [
          { at: 2.8, dur: 0.2, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
          { at: 3.85, dur: 0.35, do: 'shake', amount: 1.4 },
          { at: 4.3, dur: 0.5, do: 'zoom', amount: 1 },
        ],
        cues: [
          { at: 0.8, sfx: 'boing' },
          ...legs.cues,
          { at: 1.0, say: '爸爸是大馬！跑好快！' },
          { at: 2.95, sfx: 'whoosh' },
          { at: 3.85, sfx: 'slide' },
          { at: 4.8, sfx: 'cheer' },
        ] as Cue[],
      }
    })(),
  }),
  // 爸爸是大山！爬上去了！——爸爸得意地挺胸、整個人長大一號變成大山，頭後面飄來一朵雲；他一步一步爬上去（膝蓋、肚子、
  // 肩膀、頭頂），插一面旗；爸爸咬牙硬撐、腿抖、冒汗，膝蓋一軟縮回原來大小，他滑下來一屁股坐地上，笑著走回去。開頭結尾都是 W3
  'game:山': scene({
    duration: 7.0,
    bg: BG,
    actors: [
      ...room,
      // 雲畫在爸爸後面：從頭後面露出來，像山頂的雲
      { id: 'cloud', emoji: '☁️', x: 105, y: 36, size: 12, hidden: true, float: true },
      standingDad(),
      yangAt('know'),
      { id: 'flag', emoji: '🚩', x: 99, y: 29, size: 10, hidden: true, float: true },
    ],
    moves: [
      { at: 0.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      // 挺胸、長大成大山
      { at: 0.95, actor: 'dad', do: 'squash', amount: -0.12, dur: 0.3 },
      { at: 1.15, actor: 'dad', do: 'scaleTo', amount: MOUNTAIN, dur: 0.45, ease: 'back' },
      { at: 0.7, actor: 'cloud', do: 'enter', from: { x: 150, y: 34 }, dur: 0.9, ease: 'out' },
      // 一步一步爬
      { at: 1.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 1.7, actor: 'yang', do: 'moveTo', to: { x: 70, y: on(73) }, arc: 3, dur: 0.3 },
      { at: 2.0, actor: 'dad', do: 'squash', amount: 0.04, dur: 0.15 },
      { at: 2.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/sour' },
      { at: 2.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 2.25, actor: 'yang', do: 'moveTo', to: { x: 68, y: on(62) }, arc: 3, dur: 0.3 },
      { at: 2.55, actor: 'dad', do: 'squash', amount: 0.06, dur: 0.15 },
      { at: 2.55, actor: 'dad', do: 'shake', amount: 0.5, dur: 0.5 },
      { at: 2.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 2.8, actor: 'yang', do: 'moveTo', to: { x: 70, y: on(51) }, arc: 3, dur: 0.3 },
      { at: 3.1, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.15 },
      { at: 3.1, actor: 'dad', do: 'shake', amount: 0.8, dur: 0.5 },
      { at: 3.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 3.35, actor: 'yang', do: 'moveTo', to: { x: DAD_X - 1, y: on(PEAK) }, arc: 5, dur: 0.35 },
      { at: 3.7, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.15 },
      // 插旗！
      { at: 3.75, actor: 'flag', do: 'pop', dur: 0.25 },
      { at: 3.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
      { at: 4.05, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.75, actor: 'dad', do: 'shake', amount: 1.4, dur: 1.0 },
      // 膝蓋一軟：縮回原來大小，他滑下來
      { at: 4.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/tired' },
      { at: 4.8, actor: 'dad', do: 'scaleTo', amount: 1 / MOUNTAIN, dur: 0.35, ease: 'in' },
      { at: 4.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/slip' },
      { at: 4.8, actor: 'yang', do: 'moveTo', to: { x: 64, y: YG }, dur: 0.45, ease: 'in' },
      { at: 4.8, actor: 'flag', do: 'moveTo', to: { x: 106, y: 70 }, arc: 6, dur: 0.45, ease: 'in' },
      { at: 4.8, actor: 'flag', do: 'rotateTo', amount: 80, dur: 0.45 },
      { at: 5.3, actor: 'flag', do: 'vanish', dur: 0.15 },
      { at: 4.9, actor: 'cloud', do: 'moveTo', to: { x: 176, y: 34 }, dur: 0.9, ease: 'in' },
      { at: 5.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
      { at: 5.65, actor: 'dad', do: 'swap', emoji: 'hero:eric/idle' },
      { at: 5.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 5.95, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.45 },
      { at: 6.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    ],
    fx: [
      { at: 0.1, kind: 'bubble', actor: 'dad', emoji: '⛰️', scale: 1.3, dur: 0.8 },
      { at: 1.15, kind: 'puff', actor: 'dad', dur: 0.5 },
      { at: 2.6, kind: 'sweat', actor: 'dad', dx: 6 },
      { at: 3.75, kind: 'burst', actor: 'flag', emoji: '✨', n: 7, dy: 4, dur: 0.7 },
      { at: 3.9, kind: 'sweat', actor: 'dad', dx: 8, dy: 6 },
      { at: 4.4, kind: 'sweat', actor: 'dad', dx: 8, dy: 6 },
      { at: 5.25, kind: 'puff', actor: 'yang', dur: 0.4 },
      { at: 5.7, kind: 'blow', actor: 'dad', dx: -4, dy: 8, to: { x: 106, y: 46 }, n: 3, dur: 0.6 },
    ],
    camera: [{ at: 5.25, dur: 0.25, do: 'shake', amount: 0.8 }],
    cues: [
      { at: 1.15, sfx: 'boing' },
      { at: 1.7, sfx: 'tap' },
      { at: 2.25, sfx: 'tap' },
      { at: 2.8, sfx: 'tap' },
      { at: 3.35, sfx: 'tap' },
      { at: 1.2, say: '爸爸是大山！爬上去了！' },
      { at: 3.75, sfx: 'cheer' },
      { at: 4.8, sfx: 'slide' },
      { at: 5.25, sfx: 'plop' },
    ],
  }),
  // 爸爸是大熊！抱抱！——爸爸變成棕色、張牙舞爪吼一聲，他嚇得往左逃，被追上一把抱住，抱太緊越擠越扁、眼睛瞪好大，
  // 爸爸冒愛心；放開以後他暈暈地坐在地上又笑，兩個走回原位。開頭結尾都是 W3
  'game:熊': scene({
    duration: 6.2,
    bg: BG,
    actors: [...room, standingDad(), yangAt('know')],
    moves: [
      { at: 0.05, actor: 'dad', do: 'squash', amount: -0.15, dur: 0.25 },
      { at: 0.15, actor: 'dad', do: 'swap', emoji: 'hero:eric/stomp' },
      { at: 0.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/hug' },
      { at: 0.15, actor: 'dad', do: 'tint', filter: BEAR },
      { at: 0.15, actor: 'dad', do: 'stretchTo', amount: 1.12, dur: 0.2, ease: 'back' },
      { at: 0.35, actor: 'dad', do: 'shake', amount: 1, dur: 0.4 },
      { at: 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
      { at: 0.35, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 逃！追！
      { at: 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/flee' },
      { at: 0.8, actor: 'yang', do: 'moveTo', to: { x: 24, y: YG }, dur: 0.5, ease: 'in' },
      { at: 0.95, actor: 'dad', do: 'moveTo', to: { x: 44, y: DG }, dur: 0.6, ease: 'in' },
      // 抓到：一把抱住
      { at: 1.55, actor: 'yang', do: 'moveTo', to: { x: 31, y: YG }, dur: 0.12 },
      { at: 1.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 1.6, actor: 'dad', do: 'tint', filter: '' },
      { at: 1.6, actor: 'dad', do: 'stretchTo', amount: 1 / 1.12, dur: 0.2 },
      { at: 1.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
      // 抱太緊：越擠越扁
      { at: 1.75, actor: 'yang', do: 'stretchTo', amount: 0.86, dur: 0.15 },
      { at: 1.75, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.2 },
      { at: 2.25, actor: 'yang', do: 'stretchTo', amount: 0.84, dur: 0.15 },
      { at: 2.25, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 2.25, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.5 },
      // 放開：彈回來、暈暈的坐地上
      { at: 3.0, actor: 'yang', do: 'stretchTo', amount: 1 / (0.86 * 0.84), dur: 0.5, ease: 'elastic' },
      { at: 3.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
      { at: 3.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 3.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 3.95, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      // 走回原位
      { at: 4.4, actor: 'dad', do: 'flip' },
      { at: 4.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/walk' },
      { at: 4.45, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.75 },
      { at: 4.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
      { at: 4.5, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.6 },
      { at: 5.25, actor: 'dad', do: 'flip' },
      { at: 5.25, actor: 'dad', do: 'swap', emoji: 'hero:eric/idle' },
      { at: 5.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    ],
    fx: [
      { at: 0.1, kind: 'bubble', actor: 'dad', emoji: '🐻', scale: 1.3, dur: 0.9 },
      { at: 0.2, kind: 'blow', actor: 'dad', dx: -6, dy: 8, target: 'yang', emoji: '💢', n: 3, dur: 0.6 },
      { at: 0.4, kind: 'sweat', actor: 'yang' },
      { at: 0.85, kind: 'puff', actor: 'yang', dur: 0.4 },
      { at: 1.1, kind: 'puff', actor: 'dad', dur: 0.4 },
      { at: 1.8, kind: 'burst', actor: 'dad', emoji: '💗', n: 7, dy: -6, dur: 0.9 },
      { at: 2.3, kind: 'pop', actor: 'yang', emoji: '😳', dx: -14, dy: 8, dur: 0.7 },
      { at: 2.4, kind: 'burst', actor: 'dad', emoji: '💕', n: 9, dy: -10, scale: 1.3, dur: 0.9 },
      { at: 3.1, kind: 'dizzy', actor: 'yang', dy: 6, dur: 1.0 },
    ],
    camera: [
      { at: 0.2, dur: 0.35, do: 'shake', amount: 1.2 },
      { at: 1.6, dur: 0.25, do: 'shake', amount: 0.8 },
    ],
    cues: [
      { at: 0.2, sfx: 'rumble' },
      { at: 0.35, say: '爸爸是大熊！抱抱！' },
      { at: 1.6, sfx: 'bonk' },
      { at: 2.25, sfx: 'deflate' },
      { at: 3.0, sfx: 'boing' },
    ],
  }),

  // 玩了好多。爸爸累了。——爸爸彎腰喘氣、滿頭汗，他還在旁邊跳著要再玩（想著馬、山、熊），去拉爸爸的手；
  // 爸爸眼皮越來越重，站著打瞌睡、越晃越大
  tired: scene({
    duration: 5.6,
    bg: BG,
    actors: [...room, standingDad(), yangAt('know'), { id: 'snot', emoji: '🫧', ...SNOT, size: 4, hidden: true, float: true }],
    moves: [
      { at: 0.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/tired' },
      { at: 0.4, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
      { at: 0.75, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
      { at: 1.1, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
      { at: 1.45, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
      { at: 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 0.35, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      { at: 0.9, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.45, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      // 去拉爸爸
      { at: 2.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
      { at: 2.0, actor: 'yang', do: 'moveTo', to: { x: 69, y: YG }, dur: 0.3 },
      { at: 2.35, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.5 },
      { at: 2.35, actor: 'yang', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 3.0, actor: 'yang', do: 'shake', amount: 1, dur: 0.6 },
      // 眼皮越來越重：越晃越大
      { at: 2.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/doze' },
      { at: 2.4, actor: 'dad', do: 'tilt', amount: -6, dur: 0.6 },
      { at: 3.0, actor: 'dad', do: 'tilt', amount: 9, dur: 0.7 },
      { at: 3.7, actor: 'dad', do: 'tilt', amount: -12, dur: 0.8 },
      // 在爸爸眼前揮手：爸爸頭越垂越低、冒一個鼻涕泡，啵！破了他嚇一跳
      { at: 3.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
      { at: 3.75, actor: 'yang', do: 'shake', amount: 1.4, dur: 0.7 },
      { at: 3.95, actor: 'snot', do: 'pop', dur: 0.2 },
      { at: 4.0, actor: 'snot', do: 'scaleTo', amount: 2.6, dur: 0.8, ease: 'out' },
      { at: 4.2, actor: 'dad', do: 'rotateTo', amount: -8, dur: 0.6 },
      { at: 4.2, actor: 'snot', do: 'moveTo', to: { x: SNOT.x - 3, y: SNOT.y + 1 }, dur: 0.6 },
      { at: 4.85, actor: 'snot', do: 'vanish', dur: 0.06 },
      { at: 4.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 4.85, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 4.9, actor: 'yang', do: 'moveTo', to: { x: 64, y: YG }, dur: 0.3, ease: 'out' },
      { at: 5.0, actor: 'dad', do: 'tilt', amount: -5, dur: 0.5 },
    ],
    fx: [
      { at: 0.15, kind: 'burst', actor: 'dad', emoji: '💦', n: 6, dy: -6, dur: 0.7 },
      { at: 0.4, kind: 'bubble', actor: 'yang', emoji: '🐎', dur: 0.55 },
      { at: 0.95, kind: 'bubble', actor: 'yang', emoji: '⛰️', dur: 0.55 },
      { at: 1.5, kind: 'bubble', actor: 'yang', emoji: '🐻', dur: 0.55 },
      { at: 1.2, kind: 'sweat', actor: 'dad', dx: 4 },
      { at: 2.6, kind: 'zzz', actor: 'dad', emoji: '💤', dx: 2, scale: 0.9, dur: 3.0 },
      { at: 4.85, kind: 'burst', x: SNOT.x - 3, y: SNOT.y - 2, emoji: '💧', n: 5, scale: 0.7, dur: 0.45 },
      { at: 4.9, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.45 },
    ],
    cues: [
      { at: 0.3, say: '玩了好多。爸爸累了。' },
      { at: 3.95, sfx: 'bubble' },
      { at: 4.85, sfx: 'poof' },
    ],
  }),

  // 爸爸睡了。楊捷睿也睡了。——爸爸往前一倒，咚！趴回地上睡；他打個大呵欠、爬到爸爸背上也睡著；
  // 那隻青蛙跳回來疊在最上面，三個一起冒 💤
  end: scene({
    duration: 6.2,
    bg: BG,
    actors: [
      ...room,
      standingDad('doze'),
      { id: 'yang', emoji: 'hero:yang/surprised', x: 64, y: YG, size: YANG_S, flip: true },
      { id: 'frog', emoji: 'prop:frog-jump', x: 176, y: 30, size: 14, hidden: true },
    ],
    moves: [
      { at: 0, actor: 'dad', do: 'rotateTo', amount: -8, dur: 0 },
      { at: 0.1, actor: 'dad', do: 'rotateTo', amount: -6, dur: 0.25 },
      { at: 0.35, actor: 'dad', do: 'rotateTo', amount: 14, dur: 0.01 },
      { at: 0.35, actor: 'dad', do: 'swap', emoji: 'hero:eric/sleep' },
      { at: 0.35, actor: 'dad', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 0.4, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 呵欠、爬上背
      { at: 0.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/yawn' },
      { at: 0.9, actor: 'yang', do: 'squash', amount: -0.12, dur: 0.7 },
      { at: 1.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 1.7, actor: 'yang', do: 'moveTo', to: { x: YANG_NAP, y: on(BACK.y) }, arc: 8, dur: 0.45 },
      { at: 2.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/sleep' },
      { at: 2.2, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.25 },
      // 青蛙回來，疊在最上面
      { at: 2.8, actor: 'frog', do: 'pop', dur: 0.05 },
      { at: 2.8, actor: 'frog', do: 'moveTo', to: { x: 106, y: on(58.5, 14) }, arc: 14, dur: 0.6, ease: 'linear' },
      { at: 3.4, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
      { at: 3.4, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 3.9, actor: 'frog', do: 'swap', emoji: 'prop:frog-wink' },
      { at: 3.9, actor: 'frog', do: 'scaleTo', amount: 0.82, dur: 0.01 },
      { at: 4.0, actor: 'frog', do: 'tilt', amount: -10, dur: 0.6 },
      { at: 4.6, actor: 'frog', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 5.2, actor: 'frog', do: 'tilt', amount: -8, dur: 0.6 },
      { at: 4.9, actor: 'dad', do: 'squash', amount: 0.06, dur: 0.5 },
    ],
    fx: [
      { at: 0.35, kind: 'puff', actor: 'dad', dur: 0.5 },
      { at: 0.4, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.4 },
      ...zzz(0.8, 6.2, 1, 'dad', { dx: -14, dy: 9 }),
      { at: 1.0, kind: 'blow', actor: 'yang', dx: 2, dy: 6, to: { x: 40, y: 50 }, n: 3, dur: 0.6 },
      ...zzz(2.6, 6.2, 1, 'yang', { dx: -8, dy: 9 }),
      { at: 3.45, kind: 'pop', actor: 'frog', emoji: '❓', dur: 0.4 },
      ...zzz(4.1, 6.2, 1, 'frog', { dx: 3, dy: 0 }),
    ],
    camera: [{ at: 0.35, dur: 0.35, do: 'shake', amount: 1.4 }],
    cues: [
      { at: 0.35, sfx: 'bonk' },
      { at: 1.3, say: '爸爸睡了。楊捷睿也睡了。' },
      { at: 2.8, sfx: 'boing' },
      { at: 3.4, sfx: 'plop' },
    ],
  }),
}

export default scenes
