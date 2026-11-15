import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 一（v2）：只有一張椅子。小恐龍累了要去坐，兔子女孩什麼都要搶第一——每次「咻」地第一個衝到椅子前、舉手比「第一！」，
// 得意地閉上眼睛，笨手笨腳的小恐龍沒看到她，一屁股「噗」坐下去，把她坐扁，一次比一次扁：扁一點 → 趴扁 → 小恐龍跳好高再坐，她被壓成平平的「一條線」，
// 那條紅線飛上去變成「一」。回馬槍：她又是第一（語詞「第一」），這次抬頭看到了、咻地閃開偷笑，小恐龍坐垮了椅子、往後一倒，還是倒在她身上，扁成最長的一條線。
// 一、一、第一、這是什麼字？、一
const B = 62.7 // 兔子女孩（size 34）站在地上的 y
const R = 61.0 // 小恐龍（size 38）
const CH = 66.9 // 椅子（size 24）
/** 兔子女孩平常站的地方、搶到椅子時站的地方 */
const HOME = 34
const SEAT = 76
/** 小恐龍平常站的地方、坐下去的地方（偏右一點，她的頭從左邊露出來） */
const REX = 141
const SIT = 86
/** 被坐扁以後傻眼停多久 */
const HOLD = 0.45
/** 一次比一次扁：寬變幾倍（高同時變成 1／倍） */
const SQUASH = [1.25, 1.6, 2.6, 2.8]

/**
 * 「噗」坐扁：小恐龍走到椅子旁、跳起來（k 越大跳越高），一屁股坐在閉眼得意的兔子女孩身上——
 * 那一下她換成趴扁、被壓寬壓薄，💥＋鏡頭推近＋震＋同一個音效，傻眼停 HOLD 秒；小恐龍低頭一看「咦？」，跳回去。
 * at 是坐下去那一刻。前三次（k 0～2）一模一樣，只有跳的高度、扁的程度、💥 的大小越來越大。
 */
function plop(at: number, k: number, recover = true) {
  const s = SQUASH[k]
  const hi = [5, 9, 34][k] ?? 0
  const sitY = R - 7 + 1.8 * k
  const moves: Move[] = [
    // 小恐龍累了，慢慢走到椅子旁邊（從右邊來，圖本來就朝左）
    { at: at - 1.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/tired' },
    { at: at - 0.85, actor: 'rex', do: 'moveTo', to: { x: 104, y: R }, dur: 0.4 },
    // 跳起來、一屁股坐下去（眼睛只看椅子，沒看到她）
    { at: at - 0.42, actor: 'rex', do: 'swap', emoji: 'hero:rex/jump' },
    { at: at - 0.42, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.12 },
    { at: at - 0.32, actor: 'rex', do: 'moveTo', to: { x: SIT, y: sitY }, arc: hi, dur: 0.32, ease: 'in' },
    { at: at - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/fall' },
    // 噗！她被坐扁
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    { at, actor: 'bunny', do: 'stretchTo', amount: s, dur: 0.1, ease: 'out' },
    { at, actor: 'rex', do: 'squash', amount: 0.15 + 0.05 * k, dur: 0.25 },
    // 小恐龍低頭一看：咦？坐到什麼了——跳回原位
    { at: at + HOLD, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: at + HOLD + 0.1, actor: 'rex', do: 'moveTo', to: { x: REX, y: R }, arc: 6, dur: 0.38, ease: 'out' },
    { at: at + HOLD + 0.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
  ]
  // 她「啵」地彈回原形、頭暈（第 3 次另外寫：彈回來就氣得踢椅子）
  if (recover) moves.push(
    { at: at + HOLD + 0.2, actor: 'bunny', do: 'stretchTo', amount: 1 / s, dur: 0.22, ease: 'back' },
    { at: at + HOLD + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dizzy' },
  )
  const fx: Fx[] = [
    { at, kind: 'burst', x: SEAT - 6, y: B - 4, n: 1, dur: 0.4, scale: 1.5 + 0.4 * k },
    { at: at + HOLD - 0.05, kind: 'pop', actor: 'rex', emoji: '❓', dx: -6, dur: 0.4, scale: 1.3 },
    ...(recover ? [{ at: at + HOLD + 0.25, kind: 'dizzy', actor: 'bunny', dur: 0.45 } as Fx] : []),
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: SEAT + 4, y: B - 2 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'bonk' }, { at: at + 0.04, sfx: 'deflate' }]
  if (k >= 1) cues.push({ at: at + 0.08, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.12, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/** 搶第一：「❗」咻地衝到椅子前，舉手比「第一！」（🥇），然後閉眼得意。at 是開始衝的那一刻 */
function first(at: number) {
  const moves: Move[] = [
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at, actor: 'bunny', do: 'moveTo', to: { x: SEAT, y: B }, dur: 0.28, ease: 'in', anticipate: 4 },
    { at: at + 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/know' },
    { at: at + 0.3, actor: 'bunny', do: 'hop', amount: 4, dur: 0.25 },
    { at: at + 0.62, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
  ]
  const fx: Fx[] = [
    { at: at - 0.2, kind: 'pop', actor: 'bunny', emoji: '❗', dx: 2, dur: 0.3, scale: 1.3 },
    { at: at + 0.3, kind: 'pop', actor: 'bunny', emoji: '🥇', dx: -9, dy: 2, dur: 0.6, scale: 1.6 },
  ]
  return { moves, fx, cues: [{ at, sfx: 'whoosh' }] as Cue[] }
}

/** 走回原位（往左走要轉身，到了再轉回來朝右） */
function goHome(at: number): Move[] {
  return [
    { at, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at, actor: 'bunny', do: 'flip' },
    { at, actor: 'bunny', do: 'moveTo', to: { x: HOME, y: B }, dur: 0.35 },
    { at: at + 0.38, actor: 'bunny', do: 'flip' },
    { at: at + 0.38, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  ]
}

const H1 = 2.05, H2 = 4.2, H3 = 6.75
const p1 = plop(H1, 0), p2 = plop(H2, 1), p3 = plop(H3, 2, false)
const f1 = first(H1 - 0.95), f2 = first(H2 - 0.95), f3 = first(H3 - 0.95)
// 回馬槍
const KICK = H3 + 0.55 // 第 3 次以後把椅子踢開
const F4 = 8.35 // 又衝第一
const WORD = F4 + 0.32
const DODGE = 9.05 // 抬頭看到了，咻地閃開
const AWAY = 112 // 她閃到椅子右邊（小恐龍的背後）
const CRASH = 9.5 // 小恐龍坐垮椅子
const H4 = 10.0 // 往後一倒，壓在她身上

const clip: Clip = {
  format: 2,
  char: '一',
  meta: { theme: '只有一張椅子', cast: '兔子女孩＋小恐龍＋一張椅子', gags: ['只有一張椅子，兔子女孩每次都搶第一衝到椅子前得意閉眼，小恐龍沒看到、一屁股坐下去把她坐扁，一次比一次扁，第三次扁成一條線飛上去變成一；回馬槍是她看到了閃開，小恐龍坐垮椅子往後倒，還是壓在她身上'] },
  duration: 15,
  bg: { top: '#FFE9EC', bottom: '#FFF8F0', floor: '#F2C98B', scenery: 'room' },
  actors: [
    { id: 'chair', emoji: '🪑', x: 80, y: CH, size: 24 },
    { id: 'bunny', emoji: 'hero:bunny/idle', x: HOME, y: B, size: 34, flip: true, hidden: true },
    { id: 'rex', emoji: 'hero:rex/idle', x: REX, y: R, size: 38 },
  ],
  moves: [
    // 開場：兔子女孩跑進來，舉起一隻手「一！」
    { at: 0, actor: 'bunny', do: 'enter', from: { x: -25, y: B }, dur: 0.45, ease: 'out' },
    { at: 0.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/know' },
    { at: 0.6, actor: 'bunny', do: 'hop', amount: 3, dur: 0.25 },
    { at: 0.95, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 第 1 次
    ...f1.moves,
    ...p1.moves,
    ...goHome(H1 + 1.15),
    // 第 2 次
    ...f2.moves,
    ...p2.moves,
    ...goHome(H2 + 1.15),
    // 第 3 次前停一拍：她看一眼小恐龍、小恐龍也看她……衝！
    { at: 5.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ponder' },
    { at: 5.55, actor: 'rex', do: 'tilt', amount: -8, dur: 0.3 },
    ...f3.moves,
    ...p3.moves,
    // 第 3 次以後她氣得把椅子一腳踢到右邊，自己走到左邊（讓出中間給國字）
    { at: KICK - 0.1, actor: 'bunny', do: 'stretchTo', amount: 1 / SQUASH[2], dur: 0.15, ease: 'back' },
    { at: KICK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/kick' },
    { at: KICK + 0.05, actor: 'chair', do: 'moveTo', to: { x: 129, y: CH }, dur: 0.28, ease: 'out' },
    { at: KICK + 0.05, actor: 'chair', do: 'tilt', amount: 15, dur: 0.3 },
    { at: KICK + 0.22, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: KICK + 0.22, actor: 'bunny', do: 'flip' },
    { at: KICK + 0.22, actor: 'bunny', do: 'moveTo', to: { x: 24, y: B }, dur: 0.28, ease: 'out' },
    { at: KICK + 0.55, actor: 'bunny', do: 'flip' },
    { at: KICK + 0.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 回馬槍：小恐龍把椅子推回中間要坐；她又第一（第一！）——抬頭看到了，咻地閃開偷笑
    { at: F4 - 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/push' },
    { at: F4 - 0.25, actor: 'rex', do: 'moveTo', to: { x: 106, y: R }, dur: 0.5 },
    { at: F4 - 0.25, actor: 'chair', do: 'moveTo', to: { x: 80, y: CH }, dur: 0.5 },
    { at: F4 + 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/tired' },
    ...first(F4).moves.filter((m) => !(m.do === 'swap' && m.emoji === 'hero:bunny/smug')),
    { at: DODGE - 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: DODGE - 0.12, actor: 'rex', do: 'swap', emoji: 'hero:rex/jump' },
    { at: DODGE, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: DODGE, actor: 'bunny', do: 'moveTo', to: { x: AWAY, y: B }, dur: 0.22, ease: 'out' },
    { at: DODGE + 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/giggle' },
    { at: DODGE + 0.25, actor: 'bunny', do: 'flip' },
    // 小恐龍一屁股坐下去——椅子「喀啦」垮掉，他坐在地上
    { at: CRASH - 0.35, actor: 'rex', do: 'moveTo', to: { x: 82, y: R }, arc: 9, dur: 0.35, ease: 'in' },
    { at: CRASH - 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/fall' },
    { at: CRASH, actor: 'chair', do: 'stretchTo', amount: 2, dur: 0.1 },
    { at: CRASH + 0.1, actor: 'chair', do: 'vanish', dur: 0.15 },
    { at: CRASH, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    // 往後一倒——倒在她身上，扁成最長的一條線
    { at: H4 - 0.3, actor: 'rex', do: 'rotateTo', amount: 85, dur: 0.3, ease: 'in' },
    { at: H4 - 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/fall' },
    { at: H4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    { at: H4, actor: 'bunny', do: 'stretchTo', amount: SQUASH[3], dur: 0.1, ease: 'out' },
    { at: H4, actor: 'rex', do: 'squash', amount: 0.25, dur: 0.25 },
    // 小恐龍爬起來，不好意思地走掉；她彈回原形
    { at: H4 + 0.5, actor: 'rex', do: 'rotateTo', amount: -85, dur: 0.2, ease: 'out' },
    { at: H4 + 0.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/giggle' },
    { at: H4 + 0.75, actor: 'rex', do: 'moveTo', to: { x: 200, y: R }, dur: 0.4, ease: 'in' },
    { at: H4 + 0.6, actor: 'bunny', do: 'stretchTo', amount: 1 / SQUASH[3], dur: 0.22, ease: 'back' },
    { at: H4 + 0.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dizzy' },
    // 問他：她走到左前方、變大，轉向觀眾
    { at: 10.85, actor: 'bunny', do: 'moveTo', to: { x: 34, y: B + 3 }, dur: 0.3, ease: 'out' },
    { at: 10.85, actor: 'bunny', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    { at: 10.85, actor: 'bunny', do: 'flip' },
    { at: 11.0, actor: 'bunny', do: 'flip' },
    { at: 11.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 安靜等他回答：手放耳邊、身體前傾聽，點兩下頭
    { at: 12.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.2, actor: 'bunny', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.55, actor: 'bunny', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: 13.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 13.55, actor: 'bunny', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.7, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: 13.7, actor: 'bunny', do: 'flip' },
    { at: 13.72, actor: 'bunny', do: 'moveTo', to: { x: -45, y: B + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 3 次：被坐成平平的一條紅線，「咻」地飛上去變成一
    { at: H3 + 0.12, dur: 0.62, strokes: [0], from: 'bunny', color: partColor('一') },
  ],
  glyph: [
    // 前兩次被坐扁時，空字框抖一下（「一」快要來了）
    { at: H1 + 0.1, dur: 0.4, do: 'wobble' },
    { at: H2 + 0.1, dur: 0.4, do: 'wobble' },
    { at: 7.55, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.4, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的兔子女孩
    { at: 10.75, dur: 3.2, do: 'ask', keep: ['bunny'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.8, dur: 0.4, do: 'home' },
    { at: 13.55, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...f1.fx,
    ...p1.fx,
    ...f2.fx,
    ...p2.fx,
    // 第 3 次前停一拍
    { at: 5.55, kind: 'pop', actor: 'bunny', emoji: '👀', dx: 0, dur: 0.5, scale: 1.3 },
    ...f3.fx,
    ...p3.fx,
    { at: H3, kind: 'burst', x: SEAT, y: B + 4, emoji: '⭐', n: 6, dur: 0.4 },
    ...first(F4).fx,
    { at: DODGE - 0.2, kind: 'pop', actor: 'bunny', emoji: '❗', dx: 2, dur: 0.3, scale: 1.3 },
    { at: CRASH, kind: 'burst', x: 80, y: CH, n: 1, dur: 0.35, scale: 1.6 },
    { at: CRASH, kind: 'puff', x: 80, y: CH + 4, dur: 0.4 },
    { at: H4, kind: 'burst', x: AWAY - 14, y: B - 6, n: 1, dur: 0.45, scale: 2.4 },
    { at: H4, kind: 'burst', x: AWAY, y: B + 4, emoji: '⭐', n: 8, dur: 0.4 },
    { at: H4 + 0.85, kind: 'dizzy', actor: 'bunny', dur: 0.5 },
    { at: 13.55, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...p1.camera,
    ...p2.camera,
    ...p3.camera,
    { at: CRASH, dur: 0.25, do: 'shake', amount: 1.2 },
    { at: H4, dur: 0.45, do: 'punch', amount: 0.3, to: { x: AWAY - 10, y: 40 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: 7.55, dur: 0.05, level: -0.35 },
    { at: 7.6, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '一' },
    ...f1.cues,
    ...p1.cues,
    ...f2.cues,
    ...p2.cues,
    ...f3.cues,
    ...p3.cues,
    { at: 7.65, say: '一' },
    ...first(F4).cues,
    { at: WORD, say: '第一' },
    { at: DODGE, sfx: 'whoosh' },
    { at: CRASH, sfx: 'crack' },
    { at: H4, sfx: 'bonk' },
    { at: H4 + 0.04, sfx: 'deflate' },
    { at: H4 + 0.08, sfx: 'boing' },
    { at: H4 + 0.12, sfx: 'crack' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.55, say: '一' },
    { at: 13.6, sfx: 'cheer' },
  ],
}

export default clip
