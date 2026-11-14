import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 高（v2）：豬探長要抓高高飄著的紅氣球——每次他跳起來、手指差一點點碰到線，氣球就「咻」地往上飄一截，他在半空中傻眼、摔下來，
// 一次比一次高、摔得一次比一次慘：從地上跳（跌坐；高的最下面一層 冂口 從地上飛上去）、墊一個箱子跳（摔扁；中間的口）、
// 疊兩個箱子、先停一拍再跳，氣球直接飛出畫面頂端（摔最扁；最上面的屋頂 亠）——字也跟著一層一層疊高。
// 回馬槍：氣球飄到高山頂上，他爬上高山（高山），這次真的抓到了！——氣球照樣往上飄，把他整個帶出畫面頂端，「啪」破掉，他從最高的地方摔下來。
// 最後畫面暗下來只剩「高」，豬探長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「高！」，然後退場只留字。
// 高、高、高山、這是什麼字？、高
const P = 66.9 // 豬探長（size 24）站在地上的 y
const FEET = 0.42 * 24 // 他的 y 到腳底
/** 箱子（size 14）：站在地上的 y、一個箱子多高 */
const BOX = 14
const BOX_Y = 77 - 0.42 * BOX
const BOX_H = 0.92 * BOX
/** 每次都在同一個地方跳（氣球正下方） */
const JX = 46
/** 箱子一開始疊在左邊角落 */
const PILE = 14
/** 他站的地方：地上、一個箱子上、兩個箱子上 */
const STAND = [P, 77 - BOX_H - FEET, 77 - 2 * BOX_H - FEET]
/** 每次跳多高 */
const JH = 11
/** 氣球中心在他跳到最高點的手上面多少（線的尾巴剛好差一點點碰到） */
const REACHGAP = 17
/** 氣球中心比他偏右一點（線往左下垂，線尾才在他手上） */
const BX = JX + 5
/** 每一次氣球等著的高度：他每墊高一個箱子，氣球就剛好高一個箱子 */
const BY = STAND.map((s) => s - JH - REACHGAP)
/** 高山（🏔️ size 46）在右邊（國字回到正中央時不能擋到） */
const MX = 128
const MS = 46
const MY = 77 - 0.42 * MS
/** 山頂（站上去的腳底） */
const PEAK = MY - 0.5 * MS + 0.13 * MS
/** 每次摔下來落地的地方（往後摔，一次比一次遠） */
const LAND = [34, 30, 28]
/** 在半空中傻眼停多久，才掉下去 */
const HOLD = 0.42
/** 蹲下去蓄力多久（預備） */
const WIND = 0.22

/**
 * 「跳—咻—碰」：他蹲下去（預備）→ 跳起來雙手往上搆，手指差一點點碰到氣球線 → 氣球「咻」地往上飄走（同一個音效），
 * 他在最高點傻眼停 HOLD 秒（看得見臉）→ 往後摔下去，落地那一刻 💥＋鏡頭推近＋震，一次比一次慘。
 * k 是第幾次，at 是手差一點碰到、氣球飄走的那一刻，rise 是氣球飄到哪（第 3 次飛出畫面）。
 */
function jump(at: number, k: number, rise: number) {
  const stand = STAND[k], top = stand - JH, land = at + HOLD + 0.28
  const moves: Move[] = [
    // 預備：蹲低
    { at: at - 0.2 - WIND, actor: 'pig', do: 'squash', amount: 0.22, dur: WIND },
    // 跳！雙手往上伸
    { at: at - 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: at - 0.2, actor: 'pig', do: 'moveTo', to: { x: JX, y: top }, dur: 0.2, ease: 'out' },
    // 氣球「咻」地往上飄走
    { at, actor: 'balloon', do: 'moveTo', to: { x: BX, y: rise }, dur: k >= 2 ? 0.3 : 0.32, ease: k >= 2 ? 'in' : 'out' },
    { at, actor: 'balloon', do: 'tilt', amount: -8, dur: 0.3 },
    // 傻眼，停在半空中
    { at: at + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 往後摔下去
    { at: at + HOLD, actor: 'pig', do: 'moveTo', to: { x: LAND[k], y: P }, dur: 0.28, ease: 'in' },
    { at: at + HOLD, actor: 'pig', do: 'rotateTo', amount: -25 - 15 * k, dur: 0.28, ease: 'in' },
    { at: land, actor: 'pig', do: 'rotateTo', amount: 25 + 15 * k, dur: 0.06 },
    { at: land, actor: 'pig', do: 'swap', emoji: k === 0 ? 'hero:pig/fall' : 'hero:pig/flat' },
    { at: land, actor: 'pig', do: 'squash', amount: 0.25 + 0.1 * k, dur: 0.3 + 0.1 * k },
  ]
  const fx: Fx[] = [
    // 氣球飄走：手指那裡冒一個 ❗（差一點點！）
    { at: at + 0.05, kind: 'pop', x: JX + 14, y: top - 14, emoji: '❗', dur: 0.4, scale: 1.4 },
    { at: land, kind: 'burst', x: LAND[k] + 10, y: P - 14, n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
  ]
  if (k >= 1) fx.push({ at: land, kind: 'burst', x: LAND[k], y: P - 8, emoji: '⭐', n: 4 + 2 * k, dur: 0.45 })
  const camera: Camera[] = [
    { at: land, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: LAND[k], y: P - 8 } },
    { at: land, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效：氣球咻、落地碰，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'whoosh' }, { at: land, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: land + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: land + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, land }
}

const T1 = 1.35, T2 = 3.65, T3 = 6.35
const j1 = jump(T1, 0, BY[1])
const j2 = jump(T2, 1, BY[2])
const j3 = jump(T3, 2, -40)
const L1 = j1.land, L2 = j2.land, L3 = j3.land
/** 回馬槍：站在山頂上伸手就抓到線 */
const TOP = PEAK - FEET
const B4 = TOP - 6 - REACHGAP
/** 抓到了！那一刻 */
const G4 = 9.5
/** 氣球把他帶出畫面頂端、破掉的那一刻 */
const POP = G4 + 0.7
const DOWN = POP + 0.12
const FLAT = DOWN + 0.32
const FX4 = 100

const clip: Clip = {
  format: 2,
  char: '高',
  meta: { theme: '豬探長抓高高的氣球', cast: '豬探長＋紅氣球＋兩個紙箱＋高山', gags: ['豬探長每次跳起來手指差一點點碰到氣球線，氣球就咻地往上飄一截，他在半空中傻眼摔下來，墊一個、兩個箱子再跳，一次比一次高、摔得一次比一次慘；回馬槍是他爬上高山真的抓到了，氣球照樣往上飄，把他整個帶出畫面頂端，啪地破掉，他從最高的地方摔下來'] },
  duration: 15,
  bg: { top: '#BFE3FF', bottom: '#EEF8FF', floor: '#A8D77C', scenery: 'hills' },
  actors: [
    { id: 'mountain', emoji: '🏔️', x: MX, y: MY, size: MS },
    // 兩個紙箱一開始疊在左邊角落：上面的是 boxA（第 2 次先搬），下面的是 boxB（第 3 次疊上去）
    { id: 'boxB', emoji: '📦', x: PILE, y: BOX_Y, size: BOX },
    { id: 'boxA', emoji: '📦', x: PILE, y: BOX_Y - BOX_H, size: BOX },
    { id: 'balloon', emoji: '🎈', x: BX, y: BY[0], size: 16, float: true },
    // 新的豬探長圖朝左，翻過來朝右（面向氣球、箱子搬過去的方向）
    { id: 'pig', emoji: 'hero:pig/idle', x: 30, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 氣球輕輕飄著
    { at: 0, actor: 'balloon', do: 'bounce', amount: 1.2, times: 2, dur: 1.0 },
    // 豬探長登場：看到高高的氣球，指著它
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 第 1 次：走到氣球正下方——從地上跳
    { at: 0.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 0.65, actor: 'pig', do: 'moveTo', to: { x: JX, y: P }, dur: 0.25 },
    ...j1.moves,
    // 第 2 次：爬起來，把角落上面那個箱子舉過頭搬過來，站上去再跳
    { at: L1 + 0.45, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: L1 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
    { at: L1 + 0.45, actor: 'pig', do: 'moveTo', to: { x: 24, y: P }, dur: 0.15 },
    { at: L1 + 0.45, actor: 'boxA', do: 'moveTo', to: { x: 24, y: 44 }, arc: 3, dur: 0.15 },
    { at: L1 + 0.6, actor: 'pig', do: 'moveTo', to: { x: JX - 6, y: P }, dur: 0.25 },
    { at: L1 + 0.6, actor: 'boxA', do: 'moveTo', to: { x: JX - 6, y: 44 }, dur: 0.25 },
    { at: L1 + 0.85, actor: 'boxA', do: 'moveTo', to: { x: JX, y: BOX_Y }, dur: 0.12, ease: 'in' },
    { at: L1 + 0.97, actor: 'boxA', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: L1 + 0.97, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: L1 + 0.97, actor: 'pig', do: 'moveTo', to: { x: JX, y: STAND[1] }, arc: 6, dur: 0.25, ease: 'out' },
    ...j2.moves,
    // 第 3 次：爬起來，把下面那個箱子也搬過來疊上去，爬到最上面
    { at: L2 + 0.45, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: L2 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
    { at: L2 + 0.45, actor: 'pig', do: 'moveTo', to: { x: 22, y: P }, dur: 0.15 },
    { at: L2 + 0.45, actor: 'boxB', do: 'moveTo', to: { x: 22, y: 44 }, arc: 3, dur: 0.15 },
    { at: L2 + 0.6, actor: 'pig', do: 'moveTo', to: { x: JX - 12, y: P }, dur: 0.22 },
    { at: L2 + 0.6, actor: 'boxB', do: 'moveTo', to: { x: JX - 12, y: 44 }, dur: 0.22 },
    { at: L2 + 0.82, actor: 'boxB', do: 'moveTo', to: { x: JX, y: BOX_Y - BOX_H }, arc: 4, dur: 0.15, ease: 'in' },
    { at: L2 + 0.97, actor: 'boxB', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: L2 + 0.97, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: L2 + 0.97, actor: 'pig', do: 'moveTo', to: { x: JX, y: STAND[2] }, arc: 6, dur: 0.28, ease: 'out' },
    // 先停一拍：托下巴看氣球，氣球晃一下……
    { at: L2 + 1.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: L2 + 1.4, actor: 'balloon', do: 'tilt', amount: 10, dur: 0.3 },
    ...j3.moves,
    // 國字拼好（home 到正中央），讓位到左上方；他爬起來
    { at: L3 + 0.75, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.01 },
    { at: L3 + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 語詞那一刻：氣球從天上飄下來，停在高山頂上——他衝過去爬上高山
    { at: 8.1, actor: 'balloon', do: 'moveTo', to: { x: MX + 5, y: -30 }, dur: 0.01 },
    { at: 8.15, actor: 'balloon', do: 'moveTo', to: { x: MX + 5, y: B4 }, dur: 0.5, ease: 'out' },
    { at: 8.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: 8.6, actor: 'pig', do: 'moveTo', to: { x: 100, y: P }, dur: 0.25, ease: 'in' },
    { at: 8.85, actor: 'pig', do: 'moveTo', to: { x: MX, y: TOP }, arc: 8, dur: 0.25, ease: 'out' },
    { at: 9.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 回馬槍（第 4 次）：伸手——抓到了！
    { at: G4 - 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: G4, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    // 氣球照樣往上飄……把他整個帶出畫面頂端
    { at: G4 + 0.35, actor: 'balloon', do: 'moveTo', to: { x: MX + 5, y: -45 }, dur: 0.45, ease: 'in' },
    { at: G4 + 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: G4 + 0.35, actor: 'pig', do: 'moveTo', to: { x: MX, y: -45 + REACHGAP + 6 }, dur: 0.45, ease: 'in' },
    { at: G4 + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 啪！破掉，他從最高的地方摔下來，摔得最扁
    { at: POP, actor: 'balloon', do: 'vanish', dur: 0.05 },
    { at: DOWN, actor: 'pig', do: 'moveTo', to: { x: FX4, y: P }, dur: 0.32, ease: 'in' },
    { at: DOWN, actor: 'pig', do: 'spin', times: -2, dur: 0.32, pivot: 'center' },
    { at: FLAT, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: FLAT, actor: 'pig', do: 'squash', amount: 0.55, dur: 0.45 },
    // 問他：高山、箱子在黑幕裡收掉；豬探長撐起來、走到左前方、變大，轉向觀眾
    { at: 10.85, actor: 'mountain', do: 'vanish', dur: 0.3 },
    { at: 10.85, actor: 'boxA', do: 'vanish', dur: 0.3 },
    { at: 10.85, actor: 'boxB', do: 'vanish', dur: 0.3 },
    { at: 10.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.85, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    { at: 10.85, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.35 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.05, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.6, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.1, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.5, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.7, actor: 'pig', do: 'flip' },
    { at: 13.72, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 一層一層疊高：每次他從哪裡跳，那一層就飛上去
    // 第 1 次：從地上跳——最下面一層（冂＋口）
    { at: L1 + 0.05, dur: 0.6, strokes: [5, 6], from: { x: JX, y: 72 }, color: partColor('冂') },
    { at: L1 + 0.12, dur: 0.6, strokes: [7, 8, 9], from: { x: JX, y: 72 }, color: partColor('口') },
    // 第 2 次：從一個箱子上跳——中間一層（口）
    { at: L2 + 0.05, dur: 0.6, strokes: [2, 3, 4], from: 'boxA', color: partColor('口') },
    // 第 3 次：從兩個箱子上跳——最上面的屋頂（亠）
    { at: L3 + 0.05, dur: 0.5, strokes: [0, 1], from: 'boxB', color: partColor('亠') },
  ],
  glyph: [
    { at: L3 + 0.6, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到左上方，右邊空出來給高山
    { at: L3 + 1.4, dur: 0.45, do: 'park', to: { x: 46, y: 21.5 } },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 10.75, dur: 3.2, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.8, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    // 開場：好想要！
    { at: 0.45, kind: 'pop', actor: 'pig', emoji: '😍', dx: -14, dur: 0.45, scale: 1.4 },
    ...j1.fx,
    { at: L1 + 0.15, kind: 'sweat', actor: 'pig' },
    ...j2.fx,
    { at: L2 + 0.15, kind: 'dizzy', actor: 'pig', dur: 0.35 },
    // 第 3 次前停一拍：看一眼氣球
    { at: L2 + 1.3, kind: 'pop', actor: 'pig', emoji: '👀', dx: -14, dur: 0.5, scale: 1.4 },
    ...j3.fx,
    { at: L3 + 0.3, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    // 語詞那一刻：高山頂上，他得意
    { at: 9.1, kind: 'burst', actor: 'pig', emoji: '✨', n: 6, dur: 0.45 },
    // 回馬槍：抓到了！破掉！
    { at: G4, kind: 'burst', x: MX + 10, y: TOP - 12, emoji: '⭐', n: 6, dur: 0.4 },
    { at: POP, kind: 'burst', x: MX + 4, y: 14, n: 1, dur: 0.4, scale: 2 },
    { at: FLAT, kind: 'burst', x: FX4 + 12, y: P - 18, n: 1, dur: 0.4, scale: 2.4 },
    { at: FLAT, kind: 'burst', x: FX4, y: P - 10, emoji: '⭐', n: 10, dur: 0.5 },
    { at: 13.5, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...j1.camera,
    ...j2.camera,
    ...j3.camera,
    { at: FLAT, dur: 0.45, do: 'punch', amount: 0.16, to: { x: FX4, y: P - 8 } },
    { at: FLAT, dur: 0.4, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: L3 + 0.6, dur: 0.05, level: -0.35 },
    { at: L3 + 0.65, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '高' },
    ...j1.cues,
    ...j2.cues,
    ...j3.cues,
    { at: L3 + 0.7, say: '高' },
    { at: 9.1, say: '高山' },
    { at: G4, sfx: 'clink' },
    { at: G4 + 0.35, sfx: 'whoosh' },
    { at: POP, sfx: 'poof' },
    { at: FLAT, sfx: 'bonk' },
    { at: FLAT + 0.04, sfx: 'boing' },
    { at: FLAT + 0.08, sfx: 'rumble' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '高' },
    { at: 13.55, sfx: 'cheer' },
  ],
}

export default clip
