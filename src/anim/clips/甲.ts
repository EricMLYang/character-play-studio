import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 甲（v2）：小小的獨角仙（甲蟲）力氣超大。牠慢慢往前爬，路上擋著東西——牠停下來、低頭把角插到底下、身體往後一蹲，
// 「嘿咻」一頂：東西整個轉著飛上天、飛出畫面，牠若無其事繼續往前爬。擋路的東西一次比一次大：
// 第 1 次蘋果（甲的外框從硬殼飛出來）→ 第 2 次滾過來的大西瓜（中間兩橫）→
// 先停一拍：小恐龍看得哈哈大笑，得意地一屁股坐在路中間「你頂不動我啦」，甲蟲抬頭看看他、他低頭看看甲蟲……
// 一頂，小恐龍整隻飛上天（那一豎從牠的大角飛出來），過一會兒才掉下來跌坐、頭暈。
// 語詞：甲蟲在畫面中間變大、得意地舉起角，小恐龍指著牠——甲蟲！
// 回馬槍（第四次）：路上只剩一根輕飄飄的羽毛，甲蟲照樣用力一頂——用力過頭，自己翻了個四腳朝天、六隻腳在空中亂蹬，
// 羽毛慢慢飄下來蓋在牠肚子上；小恐龍伸手輕輕把牠翻回來。
// 最後畫面暗下來只剩「甲」，小恐龍問「這是什麼字？」，手放耳邊等他回答，再指著字說「甲！」，然後退場只留字。
// 甲、甲、甲蟲、這是什麼字？、甲

/** 甲蟲（prop:beetle，圖朝左，整支 flip 朝右往前爬）：這支講的東西，鏡頭靠近、牠夠大才看得清楚角和六隻腳 */
const BS = 27
const BY = 77 - 0.42 * BS
/** 小恐龍：最大的明星，站在右邊只露大半身 */
const S = 56
const P = 77 - 0.42 * S
/** 他看熱鬧站的地方 */
const RX = 141
/** 被頂飛以後從左邊掉下來、之後都在左邊（朝右） */
const LX = 29

/** 甲蟲每次停下來的地方：每頂一次就若無其事往前爬一小段（接觸點都在畫面中間附近） */
const BX = [64, 68, 72, 80]
/** 低頭時角的前緣（插到東西底下的那一點）在甲蟲腳底前面多遠：被頂的東西左緣就擺在這裡 */
const REACH = 12
const contact = (bx: number) => ({ x: bx + REACH, y: 70 })
/** 硬殼的中間、角尖（flip 朝右以後）：筆畫從這裡飛出來 */
const shell = (bx: number) => ({ x: bx - 0.22 * BS, y: BY - 1 })
const horn = (bx: number) => ({ x: bx + 0.35 * BS, y: BY - 0.22 * BS })
/** 低頭幾度（朝右，正的是頭往下）、頂完頭往上甩到幾度 */
const DOWN = 25
const UP = -15
/** 預備（低頭、往後蹲、使勁發抖）多久 */
const WIND = 0.55

/** 站在地上的道具 */
const ground = (size: number) => 77 - 0.42 * size
/** 擋路的東西：蘋果 → 大西瓜 → （小恐龍）→ 羽毛 */
const AS = 30, MS = 44, FS = 18
const AX = contact(BX[0]).x + 13
const MX = contact(BX[1]).x + 0.417 * MS
/** 小恐龍坐下（full）的 x：他左邊的腳尖剛好在角前面 */
const SITX = contact(BX[2]).x + 20.5

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera), cues: gs.flatMap((g) => g.cues),
})

/**
 * 「嘿咻」一頂：甲蟲停在 bx，低頭把角插到東西底下、身體往後蹲、使勁發抖（預備，WIND 秒）→
 * at 那一格頭往上一甩（鏡頭推近接觸點＋震、💥、同一個「咚」，一次比一次多疊一個音）。
 * 頂完頭擺正（flop 的話不擺正，回馬槍自己接著翻過去）。被頂的東西怎麼飛，由呼叫的人寫。k 是第幾次。
 */
function heave(at: number, k: number, bx: number, flop = false): Gag {
  const c = contact(bx)
  const moves: Move[] = [
    // 預備：低頭、角插到底下、身體往後一蹲
    { at: at - WIND, dur: 0.2, actor: 'beetle', do: 'rotateTo', amount: DOWN, ease: 'out' },
    { at: at - WIND, dur: 0.2, actor: 'beetle', do: 'moveTo', to: { x: bx - 2.5, y: BY }, ease: 'out' },
    // 嘿咻——使勁到發抖
    { at: at - 0.3, dur: 0.27, actor: 'beetle', do: 'shake', amount: 0.5 + 0.15 * k },
    // 頂！頭往上一甩、身體往前衝一下
    { at, dur: 0.09, actor: 'beetle', do: 'rotateTo', amount: UP - DOWN, ease: 'out' },
    { at, dur: 0.09, actor: 'beetle', do: 'moveTo', to: { x: bx + 1, y: BY }, ease: 'out' },
  ]
  if (!flop) {
    moves.push(
      { at: at + 0.3, dur: 0.2, actor: 'beetle', do: 'rotateTo', amount: -UP, ease: 'back' },
      { at: at + 0.3, dur: 0.2, actor: 'beetle', do: 'moveTo', to: { x: bx, y: BY } },
    )
  }
  const fx: Fx[] = [
    { at: at - 0.3, kind: 'puff', actor: 'beetle', dur: 0.3 },
    { at, dur: 0.4, kind: 'burst', x: c.x + 2, y: c.y - 4, n: 1, scale: 1.1 + 0.3 * k },
    { at: at + 0.02, dur: 0.45, kind: 'burst', x: c.x + 2, y: c.y - 6, emoji: '⭐', n: 4 + 2 * k, scale: 0.9 + 0.1 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.32, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: c.x, y: c.y - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.35 * k },
  ]
  const cues: Cue[] = [{ at: at - WIND, sfx: 'tap' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.12, sfx: 'whoosh' })
  return { moves, fx, camera, cues }
}

/** 被頂的東西轉著飛上天、往右上飛出畫面（看得到往上飛的軌跡），飛出去就退場 */
function launch(at: number, id: string, to: { x: number; y: number }, dur: number, times: number): Move[] {
  return [
    { at, dur: 0.12, actor: id, do: 'squash', amount: -0.2 },
    { at: at + 0.02, dur, actor: id, do: 'moveTo', to, ease: 'out' },
    { at: at + 0.02, dur, actor: id, do: 'rotateTo', amount: 360 * times, ease: 'out' },
    { at: at + dur, dur: 0.05, actor: id, do: 'vanish' },
  ]
}

/** 甲蟲若無其事往前爬一小段 */
const crawl = (at: number, to: number, dur: number): Move => ({ at, dur, actor: 'beetle', do: 'moveTo', to: { x: to, y: BY }, ease: 'inOut' })

// ---- 時間表 ----
/** 三次頂的那一格 */
const T1 = 1.6, T2 = 2.95, T3 = 5.1
/** 國字拼好（最後一組筆畫落定）→ 甲蟲爬開、小恐龍掉下來以後才放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const HOME = T3 + 1.3
const PARK = HOME + 1.25
const WORD = PARK + 0.3
/** 語詞那一刻甲蟲走到畫面中間、放大 */
const WX = 80
const WORD_S = 1.5
/** 回馬槍頂的那一格 */
const T4 = WORD + 1.45
const ASK = T4 + 1.55
const ANSWER = ASK + 2.6
/** 問他時小恐龍站的地方 */
const QX = 34
const ASK_S = 1.1
/** 字框在上方正中、小一點：東西往右上飛、小恐龍後來待在左邊，都不經過字框 */
const FRAME = { x: 78, y: 18.5 }
const FRAME_K = 0.42

const g1 = heave(T1, 0, BX[0])
const g2 = heave(T2, 1, BX[1])
const g3 = heave(T3, 2, BX[2])
const g4 = heave(T4, 3, BX[3], true)

/** 停一拍：小恐龍一屁股坐在路中間，甲蟲抬頭看他、他低頭看甲蟲 */
const SIT = T3 - 1.0
const beat: Gag = {
  moves: [
    { at: T2 + 0.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
    { at: T2 + 0.75, dur: 0.4, actor: 'rex', do: 'moveTo', to: { x: SITX, y: P } },
    { at: SIT, actor: 'rex', do: 'swap', emoji: 'hero:rex/full' },
    { at: SIT, dur: 0.25, actor: 'rex', do: 'squash', amount: 0.18 },
    // 甲蟲抬頭看看他
    { at: SIT + 0.15, dur: 0.15, actor: 'beetle', do: 'rotateTo', amount: -14, ease: 'out' },
    // 他低頭看看甲蟲
    { at: SIT + 0.3, dur: 0.2, actor: 'rex', do: 'tilt', amount: -7 },
    { at: SIT + 0.38, dur: 0.12, actor: 'beetle', do: 'rotateTo', amount: 14 },
  ],
  fx: [
    { at: SIT, kind: 'puff', actor: 'rex', dur: 0.35 },
    { at: SIT + 0.15, dur: 0.35, kind: 'pop', actor: 'beetle', emoji: '❓', dx: 4 },
  ],
  camera: [],
  cues: [{ at: SIT, sfx: 'plop' }],
}

const clip: Clip = {
  format: 2,
  char: '甲',
  meta: { theme: '小小的獨角仙力氣超大，用角一頂就把擋路的東西頂飛上天', cast: '小恐龍＋獨角仙＋蘋果／大西瓜／羽毛', gags: ['小小的獨角仙慢慢往前爬，路上擋著東西：牠停下來低頭、角插到底下、身體往後一蹲，「嘿咻」一頂，東西轉著飛上天、飛出畫面，牠若無其事繼續爬；一次比一次大（蘋果→滾過來的大西瓜→停一拍：小恐龍得意地一屁股坐在路中間，甲蟲抬頭看他、他低頭看甲蟲，一頂，小恐龍整隻飛上天，過一會兒掉下來跌坐頭暈）；回馬槍是路上只剩一根羽毛，牠照樣用力一頂，用力過頭自己翻成四腳朝天、六隻腳亂蹬，羽毛飄下來蓋在肚子上，小恐龍伸手把牠翻回來'] },
  duration: 15,
  // 淡綠天空、草地：咖啡色的甲蟲、紅蘋果、綠西瓜、綠色的他都跳得出來
  bg: { top: '#DDF1FF', bottom: '#F6FBEF', floor: '#C8DC8C', scenery: 'hills' },
  actors: [
    { id: 'rex', emoji: 'hero:rex/walk', x: RX, y: P, size: S, hidden: true },
    { id: 'apple', emoji: '🍎', x: AX, y: ground(AS), size: AS, pivot: 'center' },
    { id: 'melon', emoji: 'prop:watermelon', x: 185, y: ground(MS), size: MS, hidden: true, pivot: 'center' },
    { id: 'beetle', emoji: 'prop:beetle', x: 24, y: BY, size: BS, flip: true },
    { id: 'feather', emoji: 'prop:feather', x: 100, y: -12, size: FS, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 開場：甲蟲慢慢爬到蘋果前面；小恐龍從右邊走進來看熱鬧
    { at: 0, actor: 'rex', do: 'enter', from: { x: 185, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    crawl(0.1, BX[0], T1 - WIND - 0.25),
    // 第 1 次：蘋果
    ...g1.moves,
    ...launch(T1, 'apple', { x: 128, y: -24 }, 0.6, 2),
    { at: T1 + 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/laugh' },
    { at: T1 + 0.3, dur: 0.3, actor: 'rex', do: 'hop', amount: 2 },
    crawl(T1 + 0.55, BX[1], 0.35),
    // 大西瓜從右邊咕嚕咕嚕滾過來，停在牠面前
    { at: T1 + 0.4, actor: 'melon', do: 'pop', dur: 0.01 },
    { at: T1 + 0.4, dur: 0.55, actor: 'melon', do: 'moveTo', to: { x: MX, y: ground(MS) }, ease: 'out' },
    { at: T1 + 0.4, dur: 0.55, actor: 'melon', do: 'rotateTo', amount: -260, ease: 'out' },
    // 第 2 次：大西瓜
    ...g2.moves,
    ...launch(T2, 'melon', { x: 136, y: -32 }, 0.7, 2),
    { at: T2 + 0.2, dur: 0.45, actor: 'rex', do: 'bounce', amount: 2.5, times: 2 },
    crawl(T2 + 0.5, BX[2], 0.35),
    // 停一拍
    ...beat.moves,
    // 第 3 次：小恐龍整隻飛上天
    ...g3.moves,
    { at: T3, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: T3 + 0.02, dur: 0.55, actor: 'rex', do: 'moveTo', to: { x: 128, y: -45 }, ease: 'out' },
    { at: T3 + 0.02, dur: 0.55, actor: 'rex', do: 'spin', times: 1, pivot: 'center' },
    // 甲蟲若無其事往前爬開（讓出國字的位置）
    crawl(T3 + 0.5, 127, 1.15),
    // 過一會兒才從左邊掉下來（甲蟲爬到右邊去了，讓出國字的位置）：跌坐、頭暈，轉過來朝右
    { at: T3 + 0.9, dur: 0.01, actor: 'rex', do: 'moveTo', to: { x: LX, y: -45 } },
    { at: T3 + 0.9, actor: 'rex', do: 'flip' },
    { at: T3 + 1.0, dur: 0.32, actor: 'rex', do: 'moveTo', to: { x: LX, y: P }, ease: 'in' },
    { at: T3 + 1.32, actor: 'rex', do: 'swap', emoji: 'hero:rex/fall' },
    { at: T3 + 1.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/dizzy' },
    // 語詞那一刻：甲蟲轉身跳到畫面中間、變大、得意地舉起角；小恐龍指著牠
    { at: PARK + 0.1, actor: 'beetle', do: 'flip' },
    { at: PARK + 0.12, dur: 0.3, actor: 'beetle', do: 'moveTo', to: { x: WX, y: BY }, arc: 8, ease: 'out' },
    { at: WORD - 0.05, dur: 0.3, actor: 'beetle', do: 'scaleTo', amount: WORD_S, ease: 'back' },
    { at: WORD, dur: 0.2, actor: 'beetle', do: 'rotateTo', amount: 14, ease: 'back' },
    { at: WORD - 0.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: WORD - 0.1, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: LX + 6, y: P }, arc: 4, ease: 'out' },
    { at: WORD + 0.6, dur: 0.15, actor: 'beetle', do: 'rotateTo', amount: -14 },
    { at: WORD + 0.62, dur: 0.22, actor: 'beetle', do: 'scaleTo', amount: 1 / WORD_S },
    { at: WORD + 0.82, actor: 'beetle', do: 'flip' },
    { at: WORD + 0.8, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    // 羽毛輕輕飄下來，落在路上
    { at: WORD + 0.2, actor: 'feather', do: 'pop', dur: 0.01 },
    { at: WORD + 0.2, dur: 0.35, actor: 'feather', do: 'moveTo', to: { x: 104, y: 40 }, ease: 'linear' },
    { at: WORD + 0.2, dur: 0.35, actor: 'feather', do: 'rotateTo', amount: 25 },
    { at: WORD + 0.55, dur: 0.35, actor: 'feather', do: 'moveTo', to: { x: contact(BX[3]).x + 6, y: ground(FS) }, ease: 'out' },
    { at: WORD + 0.55, dur: 0.35, actor: 'feather', do: 'rotateTo', amount: -25 },
    // 第 4 次（回馬槍）：照樣用力一頂——羽毛只飄起來一點點，牠用力過頭往後翻成四腳朝天
    ...g4.moves,
    { at: T4 + 0.02, dur: 0.3, actor: 'feather', do: 'moveTo', to: { x: contact(BX[3]).x + 4, y: 44 }, ease: 'out' },
    { at: T4 + 0.06, dur: 0.38, actor: 'beetle', do: 'hop', amount: 10 },
    { at: T4 + 0.06, dur: 0.38, actor: 'beetle', do: 'rotateTo', amount: -180, pivot: 'center', ease: 'inOut' },
    { at: T4 + 0.1, dur: 0.1, actor: 'beetle', do: 'rotateTo', amount: -UP },
    { at: T4 + 0.06, dur: 0.38, actor: 'beetle', do: 'moveTo', to: { x: BX[3] - 4, y: BY + 4.8 } },
    // 四腳朝天，六隻腳在空中亂蹬
    { at: T4 + 0.5, dur: 0.85, actor: 'beetle', do: 'shake', amount: 0.9 },
    // 羽毛慢慢左右飄下來，蓋在牠肚子上
    { at: T4 + 0.32, dur: 0.3, actor: 'feather', do: 'moveTo', to: { x: BX[3] + 4, y: 38 } },
    { at: T4 + 0.32, dur: 0.3, actor: 'feather', do: 'rotateTo', amount: 25 },
    { at: T4 + 0.62, dur: 0.3, actor: 'feather', do: 'moveTo', to: { x: BX[3] - 4, y: 51 }, ease: 'out' },
    { at: T4 + 0.62, dur: 0.3, actor: 'feather', do: 'rotateTo', amount: 15 },
    // 小恐龍走過來，伸手輕輕把牠翻回來
    { at: T4 + 0.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/walk' },
    { at: T4 + 0.6, dur: 0.35, actor: 'rex', do: 'moveTo', to: { x: BX[3] - 36, y: P } },
    { at: T4 + 0.95, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
    { at: T4 + 1.1, dur: 0.3, actor: 'beetle', do: 'hop', amount: 7 },
    { at: T4 + 1.1, dur: 0.3, actor: 'beetle', do: 'rotateTo', amount: 180, pivot: 'center' },
    { at: T4 + 1.1, dur: 0.3, actor: 'beetle', do: 'moveTo', to: { x: BX[3] - 4, y: BY } },
    { at: T4 + 1.12, dur: 0.35, actor: 'feather', do: 'moveTo', to: { x: BX[3] - 20, y: ground(FS) }, ease: 'out' },
    { at: T4 + 1.12, dur: 0.35, actor: 'feather', do: 'rotateTo', amount: -10 },
    // 問他：羽毛收掉、甲蟲爬走，小恐龍走到左前方、放大
    { at: ASK, dur: 0.25, actor: 'feather', do: 'vanish' },
    crawl(ASK + 0.1, 185, 1.1),
    { at: ASK, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: ASK, dur: 0.45, actor: 'rex', do: 'moveTo', to: { x: QX, y: P - 1 }, arc: 6, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'rex', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/listen' },
    { at: ASK + 1.65, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    { at: ASK + 2.15, dur: 0.3, actor: 'rex', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rex', do: 'swap', emoji: 'hero:rex/point' },
    { at: ANSWER, dur: 0.3, actor: 'rex', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: ANSWER + 0.22, actor: 'rex', do: 'flip' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'rex', do: 'moveTo', to: { x: -45, y: P - 1 }, ease: 'in' },
  ],
  builds: [
    // 田的外框、中間兩橫從甲蟲的硬殼飛出來，那一豎從牠的大角飛出來
    { at: T1 + 0.05, dur: 0.4, strokes: [0, 1], from: shell(BX[0]), color: partColor('甲') },
    { at: T2 + 0.05, dur: 0.4, strokes: [2, 3], from: shell(BX[1]), color: partColor('甲') },
    { at: T3 + 0.05, dur: 0.4, strokes: [4], from: horn(BX[2]), color: partColor('甲') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['rex'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx, ...g2.fx,
    // 他看得哈哈大笑
    ...beat.fx,
    ...g3.fx,
    { at: T3 + 1.35, dur: 0.95, kind: 'dizzy', actor: 'rex' },
    // 語詞那一刻：角尖閃一下
    { at: WORD + 0.05, dur: 0.5, kind: 'burst', x: WX - 0.35 * BS * WORD_S, y: BY - 0.3 * BS * WORD_S, n: 1, emoji: '🌟', scale: 1.2 },
    ...g4.fx,
    { at: T4 + 0.5, dur: 0.6, kind: 'sweat', actor: 'beetle', dx: 6 },
  ],
  camera: [
    // 鏡頭靠近一點：甲蟲小，要看得清楚角和六隻腳
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.1, to: { x: 82, y: 48 } },
    ...g1.camera, ...g2.camera, ...g3.camera,
    { at: T3 + 1.32, dur: 0.3, do: 'shake', amount: 1.0 },
    { at: T3 + 1.0, dur: 0.3, do: 'zoom', amount: 1.0, to: { x: 80, y: 45 } },
    { at: WORD + 0.5, dur: 0.4, do: 'zoom', amount: 1.12, to: { x: 86, y: 50 } },
    ...g4.camera,
    { at: T4 + 0.44, dur: 0.25, do: 'shake', amount: 0.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '甲' },
    ...g1.cues, ...g2.cues,
    { at: T1 + 0.4, sfx: 'slide' },
    ...beat.cues,
    ...g3.cues,
    { at: T3 + 1.32, sfx: 'bonk' },
    { at: HOME + 0.1, say: '甲' },
    { at: WORD, say: '甲蟲' },
    ...g4.cues,
    { at: T4 + 0.44, sfx: 'plop' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '甲' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
