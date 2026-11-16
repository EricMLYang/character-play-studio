import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 喜（v2）：豬探長收到一個會變大的魔法禮物盒。每次他一掀開蓋子，「噹啷！」盒口炸出一個大大的 🎉、跳出一個驚喜，
// 他高興得一次比一次誇張，驚喜縮回去、蓋子「喀」地蓋上，盒子「啵」地又長大一號：
// 小熊娃娃——他開心跳起來（緞帶的十字飛出來變成「十」）→ 草莓蛋糕——他跳起來在空中轉一圈（蛋糕變成「豆」）→
// 先停一拍：盒子長到比他還大、抖個不停，他搓手流口水⋯⋯一大把氣球，他抓住氣球樂到飛上天（他哈哈大笑的嘴變成「口」）。
// 回馬槍（第四次）：他飄下來放開氣球，盒子卻「噗」地縮成一個好小好小的盒子，他抱胸斜眼不太滿意——
// 一打開，「噹啷！」跳出來的是浣熊花生，拿著最大的 🎉 對他一拉：恭喜！他樂得跳到最高、轉兩圈，落地笑倒；花生抱著小盒子跑走。
// 最後畫面暗下來只剩「喜」，豬探長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「喜！」，然後退場只留字。
// 刻意不跟「給」（禮物裡的東西撲到臉上嚇人）、「叔」（紙花炸出來嚇人）、「摸」（伸手進神秘箱摸東西）、「樂」（笑聲傳染）撞：
// 這支是自己掀開禮物、驚喜跳出來、他開心（不是被嚇），盒子一次比一次大；不用愛心、不演抱抱（那是「愛」）。
// 喜、喜、恭喜、這是什麼字？、喜

/** 站在地上的 y */
const fy = (size: number) => 77 - 0.42 * size
const PS = 34 // 豬探長、花生
const P = fy(PS)
/** 前三次豬探長都站在同一個地方開禮物（左邊，翻過來朝右） */
const PX = 100
/** 禮物盒的底子 size（寫最大的那個，前面用 scaleTo 縮小）；盒子左邊永遠對齊 BOX_L，長大是往右長 */
const GIFT = 40
const BOX_L = 114
/** 三次的盒子大小，第四次縮成最小 */
const BOXES = [18, 26, 40]
const TINY = 13
/** 盒子 size s 時的中心 x（gift 圖的內容從 u 0.061 開始） */
const boxX = (s: number) => BOX_L + (0.5 - 0.061) * s
/** 盒子 size s 打開時，盒口（不含左邊的蓋子）的中心 x 與上緣 y */
const mouth = (s: number, x = boxX(s)) => ({ x: x + 0.2 * s, y: 77 - 0.68 * s })

/** 盒子裡跳出來的驚喜：同一個角色（item）換圖、縮放；底子 size 寫最大的那個（氣球） */
const ITEM = 36
type Item = { emoji: string; size: number }
const ITEMS: Item[] = [
  { emoji: '🧸', size: 21 },
  { emoji: 'prop:cake', size: 29 },
  { emoji: '🎈', size: 36 },
]
/** item 的腳底要到 feet 時的 y（縮放以腳底為準，腳底 = y + 0.42 × 底子 size） */
const itemY = (feet: number) => feet - 0.42 * ITEM

/** 打開以後傻眼停多久，才開始高興 */
const HOLD = 0.4

const moves: Move[] = []
const fx: Fx[] = []
const camera: Camera[] = []
const cues: Cue[] = []

/**
 * 「噹啷！」：盒子抖一抖（裡面有東西）→ 他伸手掀開蓋子 → 盒口炸出一個大 🎉、驚喜從盒子後面跳出來停在盒口上方 →
 * 鏡頭推近＋震＋同一個音效，他傻眼停 HOLD 秒。k 是第幾次（0、1、2），🎉 一次比一次大、音效一次多疊一個。
 * 他高興的反應由呼叫的人寫。回傳驚喜跳到的位置。
 */
function open(at: number, k: number, wait = 0) {
  const s = BOXES[k]
  const it = ITEMS[k]
  const m = mouth(s)
  const feet = m.y - 2 - 2 * k // 驚喜的腳底停在盒口上方
  const pos = { x: m.x, y: itemY(feet) }
  const T = at + wait
  moves.push(
    // 盒子抖一抖（裡面有東西），他伸手要開
    { at: at - 0.45, actor: 'gift', do: 'shake', amount: 0.6 + 0.4 * k, dur: 0.3 + wait },
    { at: at - 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: at - 0.4, actor: 'pig', do: 'tilt', amount: 8, dur: 0.3 },
    // 噹啷！蓋子掀開，驚喜從盒子裡跳出來（先 pop 出場再縮放到這一次的大小）
    { at: T, actor: 'gift', do: 'swap', emoji: 'prop:gift-open' },
    { at: T, actor: 'item', do: 'moveTo', to: { x: m.x, y: itemY(77) }, dur: 0.01 },
    { at: T, actor: 'item', do: 'swap', emoji: it.emoji },
    { at: T + 0.01, actor: 'item', do: 'pop', dur: 0.12 },
    { at: T + 0.02, actor: 'item', do: 'scaleTo', amount: it.size / ITEM, dur: 0.01 },
    { at: T + 0.02, actor: 'item', do: 'moveTo', to: pos, dur: 0.22, ease: 'back' },
    // 傻眼（看得見臉）
    { at: T + 0.08, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: T + 0.08, actor: 'pig', do: 'squash', amount: 0.15 + 0.08 * k, dur: 0.25 },
  )
  fx.push(
    // 固定訊號：盒口炸出一個大大的 🎉（恭喜！），一次比一次大；旁邊一圈星光
    { at: T, dur: 0.75, kind: 'burst', x: m.x - 4 - 4 * k, y: m.y - 8 - 2 * k, emoji: '🎉', n: 1, scale: 1.9 + 0.55 * k },
    { at: T + 0.03, dur: 0.6, kind: 'burst', x: m.x - 4 - 4 * k, y: m.y - 6 - 2 * k, emoji: '✨', n: 6 + 2 * k, scale: 1 + 0.3 * k },
  )
  camera.push(
    { at: T, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: (PX + m.x) / 2, y: 50 } },
    { at: T, dur: 0.3, do: 'shake', amount: 0.6 + 0.4 * k },
  )
  cues.push({ at: at - 0.45, sfx: 'rumble' }, { at: T, sfx: 'clink' }, { at: T + 0.03, sfx: 'poof' })
  if (k >= 1) cues.push({ at: T + 0.08, sfx: 'boing' })
  if (k >= 2) cues.push({ at: T + 0.14, sfx: 'cheer' })
  return { T, pos, feet }
}

/** 驚喜縮回盒子裡、蓋子「喀」地蓋上，盒子「啵」地長大到下一號（k 是長到第幾號） */
function regrow(at: number, k: number) {
  const s0 = BOXES[k - 1], s1 = BOXES[k]
  moves.push(
    { at, actor: 'item', do: 'moveTo', to: { x: mouth(s0).x, y: itemY(77) }, dur: 0.2, ease: 'in' },
    { at: at + 0.2, actor: 'item', do: 'vanish', dur: 0.01 },
    { at: at + 0.22, actor: 'gift', do: 'swap', emoji: 'prop:gift' },
    { at: at + 0.22, actor: 'gift', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: at + 0.4, actor: 'gift', do: 'scaleTo', amount: s1 / s0, dur: 0.3, ease: 'back' },
    { at: at + 0.4, actor: 'gift', do: 'moveTo', to: { x: boxX(s1), y: fy(GIFT) }, dur: 0.3, ease: 'back' },
    { at: at + 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
  )
  cues.push({ at: at + 0.22, sfx: 'tap' }, { at: at + 0.4, sfx: 'boing' })
}

// ── 開場：豬探長走進來，看到一個禮物，好開心
moves.push(
  // 盒子底子是最大的 size：先 pop 出場、再縮到第一號
  { at: 0, actor: 'gift', do: 'moveTo', to: { x: boxX(BOXES[0]), y: fy(GIFT) }, dur: 0.01 },
  { at: 0, actor: 'gift', do: 'pop', dur: 0.2 },
  { at: 0.005, actor: 'gift', do: 'scaleTo', amount: BOXES[0] / GIFT, dur: 0.01 },
  { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.5, ease: 'out' },
  { at: 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
  { at: 0.7, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
)

// ── 第 1 次：小熊娃娃——他開心地跳起來
const H1 = 1.6
const o1 = open(H1, 0)
moves.push(
  { at: H1 + HOLD, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  { at: H1 + HOLD, actor: 'pig', do: 'hop', amount: 9, dur: 0.4 },
  { at: H1 + HOLD, actor: 'item', do: 'hop', amount: 3, dur: 0.3 },
)
regrow(2.6, 1)

// ── 第 2 次：草莓蛋糕——他跳起來在空中轉一圈
const H2 = 3.55
const o2 = open(H2, 1)
moves.push(
  { at: H2 + HOLD, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  { at: H2 + HOLD, actor: 'pig', do: 'hop', amount: 15, dur: 0.55 },
  { at: H2 + HOLD, actor: 'pig', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
)
regrow(4.65, 2)

// ── 第 3 次：先停一拍——盒子比他還大、抖個不停，他搓手流口水⋯⋯一大把氣球，抓住氣球樂到飛上天
const H3 = 6.05
moves.push(
  { at: 5.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
  { at: 5.35, actor: 'pig', do: 'shake', amount: 0.5, dur: 0.3 },
)
const o3 = open(H3 - 0.25, 2, 0.25)
/** 抓住氣球以後一起往上飄：豬探長的手在氣球繩子的尾巴 */
const FLY = H3 + HOLD
const HAND_UP = 18
/** 抓氣球的地方：往右跨一步，氣球才不會擋到上面的字框 */
const GRAB = 108 // 豬探長（jump 姿勢）y 往上 HAND_UP 是他舉高的手
const rise = (at: number, dur: number, x: number, y: number, ease: Move['ease'] = 'inOut'): Move[] => [
  { at, actor: 'pig', do: 'moveTo', to: { x, y }, dur, ease },
  { at, actor: 'item', do: 'moveTo', to: { x: x + 1, y: itemY(y - HAND_UP + 3) }, dur, ease },
]
moves.push(
  // 氣球從盒口飄到他頭上，他跳起來雙手抓住繩子
  { at: FLY, actor: 'item', do: 'moveTo', to: { x: GRAB + 1, y: itemY(P - HAND_UP + 3) }, dur: 0.25, ease: 'out' },
  { at: FLY, actor: 'pig', do: 'moveTo', to: { x: GRAB, y: P }, dur: 0.25, arc: 3 },
  { at: FLY, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
  { at: FLY + 0.2, actor: 'pig', do: 'hop', amount: 3, dur: 0.2 },
  // 抓到了：一起往上飄、往右邊偏（不經過上面的字框），看得到一段，他哈哈大笑，飛出畫面頂端
  { at: FLY + 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
  ...rise(FLY + 0.3, 0.45, 112, 28, 'out'),
  ...rise(FLY + 0.75, 0.4, 134, -50, 'in'),
  { at: FLY + 0.35, actor: 'pig', do: 'tilt', amount: -8, dur: 0.5 },
  // 盒子自己蓋起來
  { at: FLY + 0.5, actor: 'gift', do: 'swap', emoji: 'prop:gift' },
  { at: FLY + 0.5, actor: 'gift', do: 'squash', amount: 0.15, dur: 0.15 },
)
cues.push({ at: FLY + 0.5, sfx: 'tap' }, { at: FLY + 0.3, sfx: 'whoosh' })

// ── 字框填滿：國字到正中央（他在天上，盒子在右邊讓開）
const HOME = 7.4
const PARK = 8.3

// ── 回馬槍（第四次）：他抓著氣球從左邊飄下來、放開氣球；盒子「噗」地縮成最小，他抱胸斜眼——一打開，跳出來的是花生，拿著最大的 🎉：恭喜！
const DOWN = 7.9
const LX = 26 // 他飄下來的地方（左邊，國字在正中央時讓開）
moves.push(
  ...rise(DOWN - 0.01, 0.01, LX, -40),
  ...rise(DOWN, 0.75, LX, P, 'out'),
  { at: DOWN + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  // 放開，氣球往上飄走（看得到一段）
  { at: DOWN + 0.85, actor: 'item', do: 'moveTo', to: { x: 18, y: -45 }, dur: 1.0, ease: 'in' },
)
/** 第四次：小盒子在畫面中間偏右，他站在左邊 */
const TX = 104
const PX4 = 58
const OPEN4 = 9.55
const RAC = { x: 112, y: P }
moves.push(
  // 盒子「噗」地縮成好小一個，跳到中間
  { at: PARK + 0.15, actor: 'gift', do: 'scaleTo', amount: TINY / BOXES[2], dur: 0.25, ease: 'in' },
  { at: PARK + 0.45, actor: 'gift', do: 'moveTo', to: { x: TX, y: fy(GIFT) }, dur: 0.4, arc: 10 },
  // 他走過來，抱胸斜眼：這麼小？
  { at: DOWN + 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
  { at: DOWN + 1.0, actor: 'pig', do: 'moveTo', to: { x: PX4, y: P }, dur: 0.45 },
  { at: 9.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
  { at: 9.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
  { at: 9.3, actor: 'gift', do: 'shake', amount: 0.8, dur: 0.2 },
  // 噹啷！小盒子掀開，花生從裡面跳出來，拿著最大的 🎉 對他一拉
  { at: OPEN4, actor: 'gift', do: 'swap', emoji: 'prop:gift-open' },
  { at: OPEN4, actor: 'rac', do: 'moveTo', to: { x: TX + 2, y: P + 6 }, dur: 0.01 },
  { at: OPEN4 + 0.01, actor: 'rac', do: 'pop', dur: 0.15 },
  { at: OPEN4 + 0.02, actor: 'rac', do: 'moveTo', to: RAC, dur: 0.3, arc: 14, ease: 'out' },
  { at: OPEN4 + 0.08, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
  { at: OPEN4 + 0.08, actor: 'pig', do: 'squash', amount: 0.35, dur: HOLD },
  // 樂得跳到最高、轉兩圈，落地笑倒
  { at: OPEN4 + 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  // 被最大的 🎉 噴得往後一跳：跳到最高、轉兩圈，落在左邊（不經過上面的國字）
  { at: OPEN4 + 0.5, actor: 'pig', do: 'moveTo', to: { x: 34, y: P }, arc: 20, dur: 0.6, ease: 'out' },
  { at: OPEN4 + 0.5, actor: 'pig', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
  { at: OPEN4 + 1.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
  // 花生抱起小盒子跑走
  { at: OPEN4 + 0.4, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/happy' },
  { at: OPEN4 + 0.4, actor: 'rac', do: 'hop', amount: 4, dur: 0.25 },
  { at: OPEN4 + 0.7, actor: 'gift', do: 'swap', emoji: 'prop:gift' },
  { at: OPEN4 + 0.7, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/carry' },
  { at: OPEN4 + 0.7, actor: 'rac', do: 'flip' },
  { at: OPEN4 + 0.7, actor: 'gift', do: 'moveTo', to: { x: RAC.x + 3, y: fy(GIFT) - 22 }, dur: 0.12 },
  { at: OPEN4 + 0.8, actor: 'rac', do: 'moveTo', to: { x: 200, y: P }, dur: 0.35, ease: 'in' },
  { at: OPEN4 + 0.8, actor: 'gift', do: 'moveTo', to: { x: 203, y: fy(GIFT) - 22 }, dur: 0.35, ease: 'in' },
)
fx.push(
  // 最大的 🎉，從花生手上往他噴過去
  { at: OPEN4 + 0.05, dur: 0.85, kind: 'burst', x: (PX4 + RAC.x) / 2 + 2, y: 58, emoji: '🎉', n: 1, scale: 3.4 },
  { at: OPEN4 + 0.08, dur: 0.8, kind: 'burst', x: (PX4 + RAC.x) / 2, y: 59, emoji: '✨', n: 12, scale: 1.8 },
)
camera.push(
  { at: OPEN4 + 0.05, dur: 0.45, do: 'punch', amount: 0.25, to: { x: 86, y: 52 } },
  { at: OPEN4 + 0.05, dur: 0.35, do: 'shake', amount: 2.0 },
)
cues.push(
  { at: 9.3, sfx: 'rumble' },
  { at: OPEN4, sfx: 'clink' }, { at: OPEN4 + 0.03, sfx: 'poof' }, { at: OPEN4 + 0.08, sfx: 'boing' }, { at: OPEN4 + 0.14, sfx: 'cheer' },
)

// ── 問他：畫面暗下來只剩國字，豬探長走到左前方、轉向觀眾
const ASK = 10.8
const ANS = 13.45
moves.push(
  { at: 10.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
  { at: 10.75, actor: 'pig', do: 'moveTo', to: { x: 32, y: P }, dur: 0.3 },
  { at: 12.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
  { at: 12.0, actor: 'pig', do: 'rotateTo', amount: 8, dur: 0.3 },
  { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
  { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
  // 回答：跳起來指著字
  { at: ANS, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.12 },
  { at: ANS, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
  { at: ANS, actor: 'pig', do: 'hop', amount: 7, dur: 0.3 },
  // 退場，畫面只留下字
  { at: ANS + 0.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  { at: ANS + 0.25, actor: 'pig', do: 'flip' },
  { at: ANS + 0.27, actor: 'pig', do: 'moveTo', to: { x: -40, y: P }, dur: 0.28, ease: 'in' },
)
fx.push({ at: ANS, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 })

const clip: Clip = {
  format: 2,
  char: '喜',
  meta: { theme: '豬探長開魔法禮物', cast: '豬探長＋浣熊花生＋禮物盒＋盒子裡的驚喜', gags: ['豬探長每次掀開禮物，噹啷一聲盒口炸出 🎉、跳出一個驚喜（小熊、蛋糕、一大把氣球），盒子一次比一次大，他高興得一次比一次誇張（跳起來、空中轉圈、抓著氣球飛上天）；回馬槍是盒子縮成最小的一個，他斜眼嫌小，打開跳出來的是花生拿著最大的 🎉 恭喜他，他樂得跳到最高'] },
  duration: 15,
  bg: { top: '#FFE8F0', bottom: '#FFF8F2', floor: '#F6D9A8', scenery: 'hills' },
  actors: [
    // 驚喜畫在盒子後面：看起來是從盒子裡跳出來的
    { id: 'item', emoji: '🧸', x: boxX(BOXES[0]), y: itemY(77), size: ITEM, hidden: true, float: true },
    { id: 'rac', emoji: 'hero:raccoon/idle', x: TX, y: P, size: PS, hidden: true },
    { id: 'gift', emoji: 'prop:gift', x: boxX(GIFT), y: fy(GIFT), size: GIFT, hidden: true },
    // 新的豬探長圖朝左，翻過來朝右：面向右邊的禮物
    { id: 'pig', emoji: 'hero:pig/idle', x: PX, y: P, size: PS, hidden: true, flip: true },
  ],
  moves,
  builds: [
    // 第 1 次：禮物緞帶的十字彈出來
    { at: o1.T + 0.05, dur: 0.55, strokes: [0, 1], from: 'gift', color: partColor('十') },
    // 第 2 次：草莓蛋糕（豆本來是高腳盤子）
    { at: o2.T + 0.1, dur: 0.6, strokes: [2, 3, 4, 5, 6, 7, 8], from: 'item', color: partColor('豆') },
    // 第 3 次：抓著氣球飛上天、哈哈大笑的嘴
    { at: FLY + 0.35, dur: 0.5, strokes: [9, 10, 11], from: 'pig', color: partColor('口') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: ANS - ASK + 0.35, do: 'ask', keep: ['pig'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANS, dur: 0.35, do: 'pulse' },
    { at: 14.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'pig', emoji: '❗', dx: 6, dur: 0.5, scale: 1.3 },
    ...fx,
  ],
  camera,
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.75, say: '喜' },
    ...cues,
    { at: HOME + 0.1, say: '喜' },
    { at: OPEN4 + 0.15, say: '恭喜' },
    { at: ASK + 0.15, say: FIXED_LINES.clipAsk },
    { at: ANS, say: '喜' },
    { at: ANS + 0.05, sfx: 'cheer' },
  ],
}

export default clip
