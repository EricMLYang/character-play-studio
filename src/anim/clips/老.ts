import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 老（v2）：狗狗警長在路邊等一隻背著信的慢吞吞烏龜。烏龜每往前爬一小步，天上的太陽就咻地轉成月亮再轉回太陽（一天過去了）——
// 「噗」一陣白煙，警長就老一截：長出一小撮白鬍子（耂的上半從鬍子飛出來）→ 鬍子到胸口、拄拐杖（耂的那一撇）→
// 先停一拍：太陽在發抖，警長冒冷汗……噗！鬍子拖到地上、戴眼鏡、駝背（匕從彎下去的背上飛出來）。
// 字拼好後，老到不行的警長拄著拐杖走到中間（老人）。回馬槍（第 4 次）：烏龜終於爬到他腳邊，太陽又轉一圈——
// 這次「噗」在烏龜身上：烏龜自己也長出長長的白鬍子，警長嚇得跳起來、拐杖飛掉。
// 最後畫面暗下來只剩「老」，警長手放耳邊「蛤？」等他回答，再舉起拐杖指著字說「老！」，然後退場只留字。
// 老、老、老人、這是什麼字？、老
const SS = 36
const P = 77 - 0.42 * SS // 警長站在地上的 y
/** 警長等的地方（畫面中間偏右，面向左邊的烏龜；圖本來就朝左） */
const SX = 126
/** 語詞那一刻他拄拐杖走到中間 */
const MX = 79
/** 烏龜（prop:turtle 朝左，翻過來面向右邊的警長），不要比警長大 */
const TS = 24
const T = 77 - 0.42 * TS
/** 烏龜每次爬一小步 */
const STEP = 8
const TX0 = 13
/** 信放在烏龜殼上（照烏龜的 x、y 算；翻過來以後殼在左邊） */
const MAIL = { dx: -2.6, dy: -5.8 }
/** 天上的太陽／月亮 */
const SKY = { x: 136, y: 14 }
/** 警長一級一級變老 */
const OLD = ['hero:sheriff/old1', 'hero:sheriff/old2', 'hero:sheriff/old3']
/** 鬍子的位置（照警長的 x、y 算；圖朝左，下巴在中間偏左） */
const CHIN = { dx: -3.5, dy: -1.5 }

/**
 * 「爬—咻—噗」：烏龜往前爬一小步（很慢、同一個「嗒、嗒」）→ 太陽咻地轉一圈變成月亮再變回太陽、天暗一下（一天過去了）→
 * 「噗」一陣白煙＋白光＋鏡頭推近＋震，被噗到的人老一級。at 是「噗」的那一刻，k 是第幾次（越後面越大）；
 * pause 是太陽轉之前多停的一拍（第 3 次讓小孩猜到要來了）；who 是被噗到的人。
 */
function age(at: number, k: number, from: number, pause = 0, who = 'sheriff') {
  const sky = at - 0.6
  const crawl = sky - pause - 0.75
  const moves: Move[] = [
    { at: crawl, actor: 'turtle', do: 'moveTo', to: { x: from + STEP, y: T }, dur: 0.7, ease: 'linear' },
    { at: crawl, actor: 'mail', do: 'moveTo', to: { x: from + STEP + MAIL.dx, y: T + MAIL.dy }, dur: 0.7, ease: 'linear' },
    // 一天過去了：太陽咻地轉一圈，中間變成月亮
    { at: sky, actor: 'sky', do: 'spin', times: 1, dur: 0.5 },
    { at: sky + 0.12, actor: 'sky', do: 'swap', emoji: '🌙' },
    { at: sky + 0.38, actor: 'sky', do: 'swap', emoji: '☀️' },
  ]
  // 被噗到的人老一級：警長換下一級；烏龜換成同一隻的老烏龜（prop:turtle-old 跟 turtle 同 size、寬撐滿，腳底對齊直接接得上）
  moves.push(who === 'sheriff' ? { at, actor: 'sheriff', do: 'swap', emoji: OLD[k] } : { at, actor: 'turtle', do: 'swap', emoji: 'prop:turtle-old' })
  const fx: Fx[] = [
    { at, kind: 'puff', actor: who, dur: 0.5, scale: 1.4 + 0.15 * k },
    { at, kind: 'burst', actor: who, emoji: '✨', n: 6 + 2 * k, dy: 6, dur: 0.45 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: who === 'sheriff' ? SX - 6 : TX0 + 4 * STEP, y: 58 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.35 * k },
  ]
  const lights: Light[] = [
    // 天暗一下又亮回來
    { at: sky, dur: 0.12, level: 0.5 },
    { at: sky + 0.3, dur: 0.15, level: 0 },
    // 噗：淡淡的白光（四次一樣，不蓋掉變老的臉）
    { at, dur: 0.04, level: -0.15 },
    { at: at + 0.04, dur: 0.25, level: 0 },
  ]
  // 同一個音效：嗒、嗒（爬）、咻（太陽轉）、噗（變老），一次比一次多疊一個
  const cues: Cue[] = [
    { at: crawl, sfx: 'tap' }, { at: crawl + 0.4, sfx: 'tap' },
    { at: sky, sfx: 'whoosh' },
    { at, sfx: 'poof' },
  ]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'bonk' })
  return { moves, fx, camera, lights, cues }
}

const P1 = 2.0, P2 = 3.7, P3 = 6.4, P4 = 9.8
const a1 = age(P1, 0, TX0)
const a2 = age(P2, 1, TX0 + STEP)
const a3 = age(P3, 2, TX0 + 2 * STEP, 0.6)
const a4 = age(P4, 3, TX0 + 3 * STEP, 0, 'turtle')
const HOME = 7.1
const PARK = 7.95
/** 語詞那一刻 */
const WORD = 8.25
const ASK = 11.1
const ANSWER = 13.65
/** 語詞那一刻警長放大，問他時放大到 1.55 倍 */
const BIG = 1.2

const clip: Clip = {
  format: 2,
  char: '老',
  meta: { theme: '等烏龜等到變老', cast: '狗狗警長＋背著信的烏龜＋太陽', gags: ['狗狗警長等一隻背著信的慢吞吞烏龜，烏龜每爬一小步，太陽就咻地轉一圈（一天過去了），噗一陣白煙警長就老一截，鬍子越來越長（一小撮→到胸口拄拐杖→拖地駝背戴眼鏡）；回馬槍是烏龜終於爬到他腳邊，這次噗在烏龜身上，烏龜也長出長長的白鬍子，警長嚇得跳起來拐杖飛掉'] },
  duration: 15,
  bg: { top: '#CFEBFF', bottom: '#F4FBFF', floor: '#BFD98A', scenery: 'hills' },
  actors: [
    { id: 'sky', emoji: '☀️', x: SKY.x, y: SKY.y, size: 14, float: true, pivot: 'center' },
    { id: 'turtle', emoji: 'prop:turtle', x: TX0, y: T, size: TS, flip: true },
    { id: 'mail', emoji: '✉️', x: TX0 + MAIL.dx, y: T + MAIL.dy, size: 7, float: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: P, size: SS, hidden: true },
  ],
  moves: [
    // 警長走進來，抬頭看字框：老！
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: 185, y: P }, dur: 0.4, ease: 'out' },
    { at: 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    // 跟烏龜揮手：快來！
    { at: 0.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wave' },
    { at: 1.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 第 1 次：爬—咻—噗，一小撮白鬍子
    ...a1.moves,
    // 第 2 次：鬍子到胸口、拄拐杖
    ...a2.moves,
    // 第 3 次前停一拍：太陽在發抖，警長冒冷汗
    { at: 5.1, actor: 'sky', do: 'shake', amount: 2, dur: 0.6 },
    { at: 5.1, actor: 'sky', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 5.15, actor: 'sheriff', do: 'shake', amount: 0.5, dur: 0.5 },
    ...a3.moves,
    // 字拼好、放大時，很老的警長摸著鬍子呵呵笑
    { at: HOME + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/oldLaugh' },
    // 語詞那一刻：拄著拐杖抖抖地走到中間、變大（老人）
    { at: PARK - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/oldWalk' },
    { at: PARK - 0.05, actor: 'sheriff', do: 'moveTo', to: { x: MX, y: P }, dur: 0.55, ease: 'out' },
    { at: PARK - 0.05, actor: 'sheriff', do: 'scaleTo', amount: BIG, dur: 0.35 },
    { at: WORD + 0.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/old3' },
    // 回馬槍（第 4 次）：烏龜終於爬到他腳邊……太陽又轉一圈……噗在烏龜身上！
    ...a4.moves,
    { at: P4, actor: 'turtle', do: 'hop', amount: 2, dur: 0.25 },
    { at: P4, actor: 'mail', do: 'hop', amount: 2, dur: 0.25 },
    // 警長嚇得跳起來、拐杖飛掉
    // 警長先愣一下（還是很老的樣子、抖一下），再嚇得往右後方跳開、拐杖飛掉——不蓋住左邊的老烏龜
    { at: P4 + 0.1, actor: 'sheriff', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: P4 + 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/oldShock' },
    { at: P4 + 0.45, actor: 'sheriff', do: 'moveTo', to: { x: MX + 16, y: P }, arc: 7, dur: 0.35, ease: 'out' },
    // 烏龜、信、太陽在暗下來時退場
    { at: ASK + 0.05, actor: 'turtle', do: 'vanish', dur: 0.15 },
    { at: ASK + 0.05, actor: 'mail', do: 'vanish', dur: 0.15 },
    { at: ASK + 0.05, actor: 'sky', do: 'vanish', dur: 0.15 },
    // 問他：警長到左前方、變大，手放耳邊「蛤？」
    { at: ASK + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/old3' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.55 / BIG, dur: 0.3 },
    { at: 12.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/oldHuh' },
    { at: 12.2, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：舉起拐杖指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'flip' },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/oldPoint' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.2 },
    // 退場（抖抖地走掉），畫面只留下字
    { at: ANSWER + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/oldWalk' },
    { at: ANSWER + 0.15, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.15, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次從長出來的白鬍子上飛出來（耂），第 3 次從彎下去的背上飛出來（匕）
    { at: P1 + 0.15, dur: 0.5, strokes: [0, 1, 2], from: { x: SX + CHIN.dx, y: P + CHIN.dy }, color: partColor('耂') },
    { at: P2 + 0.15, dur: 0.5, strokes: [3], from: { x: SX + CHIN.dx, y: P + CHIN.dy + 3 }, color: partColor('耂') },
    { at: P3 + 0.15, dur: 0.5, strokes: [4, 5], from: { x: SX + 3, y: P - 4 }, color: partColor('匕') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.25 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'turtle', emoji: '❗', dur: 0.5 },
    ...a1.fx,
    ...a2.fx,
    // 停一拍：冒冷汗
    { at: 5.15, kind: 'sweat', actor: 'sheriff', dur: 0.7, scale: 1.6 },
    ...a3.fx,
    { at: WORD, kind: 'burst', actor: 'sheriff', emoji: '✨', n: 6, dy: 10, dur: 0.5 },
    ...a4.fx,
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 拼字前固定全景：烏龜和警長隔很遠，自動取景追一個會切掉另一個
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...a1.camera,
    ...a2.camera,
    ...a3.camera,
    { at: 6.8, dur: 0.3, do: 'zoom', amount: 1 },
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...a4.camera,
    { at: ASK - 0.2, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    ...a1.lights,
    ...a2.lights,
    ...a3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...a4.lights,
  ],
  cues: [
    { at: 0.55, say: '老' },
    ...a1.cues,
    ...a2.cues,
    ...a3.cues,
    { at: HOME + 0.1, say: '老' },
    { at: WORD, say: '老人' },
    ...a4.cues,
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '老' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
