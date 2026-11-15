import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 岩（v2）：一顆大岩石擋在路中間，浣熊花生想把它敲開——每次把工具舉高高，「鏘！」用力敲下去，
// 岩石一點事都沒有，工具從他手上震飛出去，他自己被震得從頭抖到尾巴，一次比一次慘：
// 小槌子（手麻、抖一抖，山從岩石頂上震出來）→ 十字鎬（縮成一團發抖，石的上半）→ 先停一拍：他敲敲岩石、耳朵貼上去聽，
// 退得遠遠的、舉起超大的槌子助跑——鏘！他整個人被彈飛跌坐（石的口）。
// 語詞：他拍拍大岩石（岩石）；回馬槍：他放棄了，累得往岩石上一靠——「喀……啪！」岩石自己裂開，裡面蹦出一朵小花。
// 最後畫面暗下來只剩「岩」，花生問「這是什麼字？」，手放耳邊等他回答，再指著字說「岩！」，然後退場只留字。
// 岩、岩、岩石、這是什麼字？、岩

/** 花生：站在岩石左邊、面向岩石 */
const S = 34
const P = 77 - 0.42 * S
/** 大岩石：畫面中間、最大 */
const RS = 52
const RX = 90
const RY = 77 - 0.42 * RS
/** 字框（國字讓位的位置）在右上：舉高的槌子在左邊，不會擋到 */
const FRAME = { x: 131, y: 21.5 }
/** 敲完傻眼、發抖停多久 */
const HOLD = 0.5

type Pt = { x: number; y: number }
/** 舉高（lift）時兩手在頭頂上：圖朝左、他 flip 朝右 */
const liftHand = (x: number): Pt => ({ x: x + 0.03 * S, y: P - 0.4 * S })
/** 往前推（push）時兩手伸在前面 */
const pushHand = (x: number): Pt => ({ x: x + 0.425 * S, y: P })
/** 工具（🔨⛏️ 原圖頭在左上、柄尾在右下）轉 deg 度以後，柄尾離圖中心多遠 */
const grip = (size: number, deg: number): Pt => {
  const r = (deg * Math.PI) / 180, g = 0.38 * size
  return { x: g * Math.cos(r) - g * Math.sin(r), y: g * Math.sin(r) + g * Math.cos(r) }
}
/** 柄尾握在 hand、轉 deg 度時，工具的中心在哪裡 */
const toolAt = (hand: Pt, size: number, deg: number): Pt => {
  const g = grip(size, deg)
  return { x: hand.x - g.x, y: hand.y - g.y }
}
/** 敲下去時工具轉多少：槌頭水平朝右 */
const SWING = 135
/** 舉高時工具先轉一點（槌頭往上翹，大槌子才不會跑出畫面左邊） */
const LIFT = 20
/** 槌頭碰到岩石左邊的那一點（槌頭中心）：工具越大站得越遠 */
const standFor = (size: number) => 67 + 0.1 * size - 0.425 * S - 0.96 * size

/** 三次的工具：一次比一次大（同一個角色 tool，換圖、換大小） */
const TOOLS = [
  { emoji: '🔨', size: 14 },
  { emoji: '⛏️', size: 19 },
  { emoji: '🔨', size: 25 },
] as const
/** tool 原本的大小 */
const B = TOOLS[0].size
/** 放大過的 tool 以腳底為準縮放：要讓圖的中心在 c，y 要往下補 */
const place = (c: Pt, size: number): Pt => ({ x: c.x, y: c.y + 0.42 * (size - B) })

/**
 * 「鏘！」：他把工具舉高高（預備，看得到）→ 換成往前推的姿勢、工具揮下去打在岩石上 →
 * 那一格鏡頭推近＋震＋同一個「鏘」＋火花（在岩石上，不蓋他的臉）＋淡淡的白光；岩石紋風不動，只亮一下；
 * 工具從他手上震飛、轉著飛出畫面左上；他傻眼、整個人抖。k 是第幾次（越後面越大），x 是他站的地方。
 * prep 是開始舉高的時間（第 3 次他舉著槌子助跑，比較早）。
 */
function clang(at: number, k: number, x: number, prep = at - 0.6) {
  const t = TOOLS[k]
  const contact = { x: 67 + 0.1 * t.size, y: P }
  const moves: Move[] = [
    // 預備：舉高高，工具在他手上（柄尾跟著手）
    { at: prep, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/lift' },
    { at: prep + 0.2, actor: 'raccoon', do: 'squash', amount: -0.12, dur: 0.3 },
    // 揮下去
    { at: at - 0.08, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/push' },
    { at: at - 0.08, actor: 'tool', do: 'moveTo', to: place(toolAt(pushHand(x), t.size, SWING), t.size), dur: 0.08, ease: 'in' },
    { at: at - 0.08, actor: 'tool', do: 'rotateTo', amount: SWING - LIFT, dur: 0.08, ease: 'in' },
    // 鏘！岩石只亮一下
    { at, actor: 'rock', do: 'flash', dur: 0.15 },
    // 工具震飛：轉著往後飛出畫面左上
    { at: at + 0.06, actor: 'tool', do: 'moveTo', to: { x: -20, y: 8 }, arc: 10 + 4 * k, dur: 0.55, ease: 'out' },
    { at: at + 0.06, actor: 'tool', do: 'spin', times: -3, dur: 0.55 },
    { at: at + 0.6, actor: 'tool', do: 'vanish', dur: 0.05 },
    // 轉回原本的角度，下一次換新工具
    { at: at + 0.7, actor: 'tool', do: 'rotateTo', amount: -SWING, dur: 0.01 },
    // 他被震得傻眼、全身抖，一次比一次抖得厲害
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at, actor: 'raccoon', do: 'shake', amount: 1.2 + 0.6 * k, dur: HOLD + 0.1 * k },
  ]
  const fx: Fx[] = [
    // 火花在槌頭打到的地方（岩石上），💥 一次比一次大
    { at, kind: 'burst', x: contact.x + 5, y: contact.y - 4, n: 1, dur: 0.4, scale: 1.1 + 0.35 * k },
    { at: at + 0.03, kind: 'burst', x: contact.x + 3, y: contact.y - 2, emoji: '✨', n: 6 + 2 * k, dur: 0.45, scale: 1 + 0.15 * k },
  ]
  const camera: Camera[] = [
    // 推近到他和打到的地方中間：他被震的臉也要在畫面裡
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: (x + contact.x) / 2 + 4, y: contact.y - 8 } },
    { at, dur: 0.35, do: 'shake', amount: 1 + 0.5 * k },
  ]
  // 白光很淡，不把他刷白
  const lights: Light[] = [{ at, dur: 0.04, level: -0.12 - 0.04 * k }, { at: at + 0.04, dur: 0.2, level: 0 }]
  // 揮下去「咻」、同一個「鏘」，一次比一次多疊一個音
  const cues: Cue[] = [{ at: at - 0.1, sfx: 'whoosh' }, { at, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, lights, cues, contact }
}

/** 工具在 at 出現在他舉高的手上：換圖、換大小 */
function grab(at: number, k: number, x: number): Move[] {
  const t = TOOLS[k]
  return [
    { at, actor: 'tool', do: 'swap', emoji: t.emoji },
    { at, actor: 'tool', do: 'moveTo', to: place(toolAt(liftHand(x), t.size, LIFT), t.size), dur: 0.01 },
    { at, actor: 'tool', do: 'rotateTo', amount: LIFT, dur: 0.01 },
    { at, actor: 'tool', do: 'pop', dur: 0.2 },
    { at, actor: 'tool', do: 'scaleTo', amount: t.size / B, dur: 0.01 },
  ]
}

const X1 = standFor(TOOLS[0].size), X2 = standFor(TOOLS[1].size), X3 = standFor(TOOLS[2].size)
/** 第 3 次前退到這裡助跑 */
const BACK = 20
const H1 = 1.7, H2 = 3.2, H3 = 5.8
const HOME = 6.8
const PARK = 7.7
const WORD = 8.3
/** 回馬槍：靠上去、喀、啪 */
const LEAN = 9.0, CRACK = 9.45, OPEN = 9.85
const ASK = 10.7
const ANSWER = 13.5
/** 被彈飛跌坐的地方 */
const SIT = 19

const c1 = clang(H1, 0, X1)
const c2 = clang(H2, 1, X2)
const c3 = clang(H3, 2, X3, 5.2)
/** 國字放大到中間時，岩石讓到右邊、縮小 */
const SIDE_X = 142, SIDE = 0.55

const clip: Clip = {
  format: 2,
  char: '岩',
  meta: { theme: '浣熊花生想把擋路的大岩石敲開', cast: '浣熊花生＋大岩石＋越換越大的槌子', gags: ['花生把工具舉高高「鏘！」用力敲大岩石，岩石一點事都沒有，工具從手上震飛、他自己被震得全身發抖，一次比一次慘（小槌子手麻、十字鎬縮成一團抖、先敲敲聽聽再退遠助跑掄超大槌子被彈飛跌坐）；回馬槍是他放棄了累得往岩石上一靠，「喀……啪！」岩石自己裂開，裡面蹦出一朵小花'] },
  duration: 15,
  // 暖黃的天、淺綠的地：灰藍的岩石、灰色的浣熊都看得清楚
  bg: { top: '#FFF1D2', bottom: '#FFE2B0', floor: '#B9D98A', scenery: 'hills' },
  actors: [
    { id: 'rock', emoji: 'prop:rock', x: RX, y: RY, size: RS },
    // 回馬槍裂開的右半邊（裂開那一刻 rock 換成左半邊）
    { id: 'rR', emoji: 'prop:rock', x: RX, y: RY, size: RS, half: 'right', hidden: true },
    { id: 'flower', emoji: '🌷', x: RX, y: 60, size: 18, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: X1, y: P, size: S, hidden: true, flip: true },
    { id: 'tool', emoji: '🔨', x: 0, y: 0, size: B, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 花生從左邊走進來，大岩石擋在路中間：指著它——岩！
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -20, y: P }, dur: 0.55, ease: 'out' },
    { at: 0.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    // 第 1 次：小槌子——鏘！手麻、抖一抖
    ...grab(c1.moves[0].at, 0, X1),
    ...c1.moves,
    { at: H1 + HOLD + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 2 次：退半步，換十字鎬——鏘！縮成一團發抖
    { at: 2.35, actor: 'raccoon', do: 'moveTo', to: { x: X2, y: P }, dur: 0.2 },
    ...grab(c2.moves[0].at, 1, X2),
    ...c2.moves,
    { at: H2 + 0.12, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/cold' },
    { at: H2 + HOLD + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 3 次前停一拍：走過去敲敲岩石、耳朵貼上去聽……
    { at: 3.95, actor: 'raccoon', do: 'moveTo', to: { x: 47, y: P }, dur: 0.25 },
    { at: 4.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: 4.25, actor: 'raccoon', do: 'tilt', amount: 5, dur: 0.12 },
    { at: 4.45, actor: 'raccoon', do: 'tilt', amount: 5, dur: 0.12 },
    { at: 4.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    // 退得遠遠的，舉起超大的槌子，助跑衝過去
    { at: 4.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: 4.95, actor: 'raccoon', do: 'moveTo', to: { x: BACK, y: P }, dur: 0.3 },
    ...grab(5.2, 2, BACK),
    { at: 5.48, actor: 'raccoon', do: 'moveTo', to: { x: X3, y: P }, dur: 0.24, ease: 'in' },
    { at: 5.48, actor: 'tool', do: 'moveTo', to: place(toolAt(liftHand(X3), TOOLS[2].size, LIFT), TOOLS[2].size), dur: 0.24, ease: 'in' },
    ...c3.moves,
    // 被彈飛，跌坐在左邊
    { at: H3 + 0.4, actor: 'raccoon', do: 'moveTo', to: { x: SIT, y: P }, arc: 14, dur: 0.45, ease: 'out' },
    { at: H3 + 0.4, actor: 'raccoon', do: 'rotateTo', amount: -25, dur: 0.4 },
    { at: H3 + 0.85, actor: 'raccoon', do: 'rotateTo', amount: 25, dur: 0.1 },
    { at: H3 + 0.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/fall' },
    { at: H3 + 1.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 國字放大到中間：岩石讓到右邊
    { at: HOME - 0.3, actor: 'rock', do: 'moveTo', to: { x: SIDE_X, y: RY }, dur: 0.4 },
    { at: HOME - 0.3, actor: 'rock', do: 'scaleTo', amount: SIDE, dur: 0.4 },
    { at: PARK + 0.25, actor: 'rock', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.35 },
    { at: PARK + 0.25, actor: 'rock', do: 'scaleTo', amount: 1 / SIDE, dur: 0.35 },
    // 語詞那一刻：他走回岩石旁邊，拍拍它——岩石
    { at: PARK + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: PARK + 0.05, actor: 'raccoon', do: 'moveTo', to: { x: 50, y: P }, dur: 0.4 },
    { at: WORD - 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/reach' },
    { at: WORD + 0.05, actor: 'raccoon', do: 'tilt', amount: 5, dur: 0.15 },
    { at: WORD + 0.35, actor: 'raccoon', do: 'tilt', amount: 5, dur: 0.15 },
    // 回馬槍：他放棄了，累得往岩石上一靠……喀……啪！岩石自己裂開，蹦出一朵小花
    { at: LEAN, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/tired' },
    { at: LEAN, actor: 'raccoon', do: 'moveTo', to: { x: 52, y: P }, dur: 0.2 },
    { at: LEAN + 0.05, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: CRACK, actor: 'rock', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: OPEN, actor: 'rock', do: 'swap', emoji: 'prop:rock', half: 'left' },
    { at: OPEN, actor: 'rR', do: 'pop', dur: 0.01 },
    { at: OPEN, actor: 'rock', do: 'moveTo', to: { x: RX - 4, y: RY }, dur: 0.15, ease: 'out' },
    { at: OPEN, actor: 'rR', do: 'moveTo', to: { x: RX + 4, y: RY }, dur: 0.15, ease: 'out' },
    { at: OPEN, actor: 'rock', do: 'rotateTo', amount: -8, dur: 0.15, ease: 'out' },
    { at: OPEN, actor: 'rR', do: 'rotateTo', amount: 8, dur: 0.15, ease: 'out' },
    { at: OPEN + 0.05, actor: 'flower', do: 'pop', dur: 0.3 },
    { at: OPEN + 0.05, actor: 'flower', do: 'moveTo', to: { x: RX, y: 44 }, dur: 0.35, ease: 'back' },
    // 靠的地方不見了：他往後一倒，傻眼，然後開心跳起來
    { at: OPEN, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: OPEN, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.15 },
    { at: OPEN, actor: 'raccoon', do: 'moveTo', to: { x: 46, y: P }, dur: 0.2, ease: 'out' },
    { at: OPEN + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: OPEN + 0.5, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    // 問他：岩石、小花收掉，花生跳到左前方
    { at: ASK, actor: 'rock', do: 'vanish', dur: 0.3 },
    { at: ASK, actor: 'rR', do: 'vanish', dur: 0.3 },
    { at: ASK, actor: 'flower', do: 'vanish', dur: 0.3 },
    { at: ASK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: P + 3 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: ASK, actor: 'raccoon', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.9, actor: 'raccoon', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.22, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.25, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 每敲一下，一組筆畫從岩石上震出來、飛進右上的字框：山從岩石頂上、石從槌子打到的地方
    { at: H1 + 0.1, dur: 0.6, strokes: [0, 1, 2], from: { x: RX, y: 38 }, color: partColor('山') },
    { at: H2 + 0.1, dur: 0.55, strokes: [3, 4], from: { x: c2.contact.x + 4, y: c2.contact.y - 4 }, color: partColor('石') },
    { at: H3 + 0.1, dur: 0.6, strokes: [5, 6, 7], from: { x: c3.contact.x + 4, y: c3.contact.y - 4 }, color: partColor('石') },
  ],
  glyph: [
    // 字框一開始就在右上（舉高的槌子在左邊）
    { at: 0, dur: 0.01, do: 'park', to: FRAME },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME },
    // 問他：國字稍微偏右、縮一點，左前方讓給花生
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...c1.fx,
    ...c2.fx,
    // 停一拍：敲敲、聽聽
    { at: 4.65, kind: 'pop', actor: 'raccoon', emoji: '❓', dx: -8, dy: 2, dur: 0.6, scale: 1.3 },
    ...c3.fx,
    { at: H3 + 0.95, kind: 'dizzy', actor: 'raccoon', dur: 0.8 },
    // 回馬槍：靠上去喘氣，喀……啪！
    // 語詞：拍拍岩石，岩石上閃一下
    { at: WORD + 0.05, kind: 'burst', x: RX, y: 40, emoji: '✨', n: 6, dur: 0.45, scale: 1.2 },
    { at: LEAN + 0.1, kind: 'sweat', actor: 'raccoon' },
    { at: CRACK, kind: 'burst', x: RX, y: 40, emoji: '🪨', n: 3, dur: 0.35, scale: 0.8 },
    { at: OPEN, kind: 'burst', x: RX, y: 42, emoji: '🪨', n: 6, dur: 0.45, scale: 1.1 },
    { at: OPEN + 0.15, kind: 'burst', x: RX, y: 40, emoji: '✨', n: 8, dur: 0.5, scale: 1.3 },
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：舉高的槌子、字框一直看得到
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...c1.camera,
    ...c2.camera,
    ...c3.camera,
    { at: OPEN, dur: 0.45, do: 'punch', amount: 0.12, to: { x: RX, y: 50 } },
    { at: OPEN, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  lights: [
    ...c1.lights,
    ...c2.lights,
    ...c3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '岩' },
    ...c1.cues,
    ...c2.cues,
    { at: 4.25, sfx: 'tap' },
    { at: 4.45, sfx: 'tap' },
    ...c3.cues,
    { at: H3 + 0.85, sfx: 'bonk' },
    { at: HOME - 0.3, sfx: 'slide' },
    { at: HOME + 0.1, say: '岩' },
    { at: WORD + 0.05, say: '岩石' },
    { at: CRACK, sfx: 'crack' },
    { at: OPEN, sfx: 'crack' },
    { at: OPEN + 0.05, sfx: 'poof' },
    { at: OPEN + 0.15, sfx: 'blip' },
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '岩' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
