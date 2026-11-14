import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 辣（v2）：很有自信的豬探長抱著胸說「我才不怕辣」——每次從麻辣鍋裡撈一根辣椒「喀」地一口咬下，停半拍：「⋯⋯還好嘛」，
// 然後「轟」地整張臉（整個人）漲紅、耳朵冒煙、眼淚噴出來，衝去找水喝，辣椒一次比一次大、反應一次比一次誇張：
// 衝去喝一杯水（辛從辣椒咬下來）、杯子不夠換水桶，整個頭栽進去（束的上半）、先停一拍看著超大辣椒⋯⋯咬下去，像火箭一樣繞場噴出去、倒栽進水桶（束的下半）。
// 回馬槍：他學乖了，先把水桶拖到身邊才吃——辣到眼睛哭得睜不開，一頭栽進去的卻是旁邊的麻辣鍋，紅到發黑、直接噴上天。
// 最後畫面暗下來只剩「辣」，豬探長掉回前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「辣！」，然後退場只留字。
// 辣、辣、辣椒、這是什麼字？、辣
const PS = 30 // 豬探長的 size（比前幾支大一點）
const P = 77 - 0.42 * PS // 豬探長站在地上的 y
/** 麻辣鍋（prop:hotpot）：畫面上最大的東西，在中間偏右；辣椒每次從這裡撈出來 */
const PX = 100, POT = 40, PY = 77 - 0.42 * POT
/** 每次都站在同一個地方咬辣椒：鍋子左邊 */
const BITE = 60
/** 嘴巴的位置（豬探長朝右，站在 BITE） */
const MX = BITE + 8, MY = P - 14
/** 水（prop:water → 第 2 次起換成 prop:bucket）放在畫面左邊 */
const WX = 23
const CUP = 22, CY = 77 - 0.42 * CUP
const BUCKET_Y = 77 - 0.42 * 22
/** 辣椒 actor 的原始 size（最大的那根）；每次用 scaleTo 縮成那一次的大小 */
const CH = 30
/** 咬下去到辣起來的那半拍（「⋯⋯還好嘛」） */
const DELAY = 0.45
/** 辣起來以後臉紅、冒煙、噴淚停多久，才衝去找水 */
const HOLD = 0.42
/** 一次比一次紅（sepia 先變成橘褐，再轉成紅）；第 4 次紅到發黑 */
const RED = [
  'sepia(.35) saturate(2.4) hue-rotate(-22deg)',
  'sepia(.6) saturate(3.6) hue-rotate(-30deg)',
  'sepia(.85) saturate(5) hue-rotate(-36deg)',
  'sepia(1) saturate(7) hue-rotate(-40deg) brightness(.8)',
]

/** 辣椒拿在嘴前：尖端（圖的左下）對著嘴巴 */
const held = (s: number) => ({ x: MX + 0.42 * s, y: MY - 0.12 * s })

/**
 * 撈一根辣椒、「喀」地咬下去（at 是咬下去那一刻）：辣椒從鍋裡跳出來到嘴前 → 張大嘴 → 咬（辣椒的一塊飛上去變成筆畫）→ 閉眼得意「還好嘛」。
 * s 是這次辣椒的大小。
 */
function bite(at: number, s: number, from = at - 0.5): Move[] {
  const h = held(s)
  return [
    { at: from, actor: 'chili', do: 'moveTo', to: { x: PX - 4, y: PY - 14 }, dur: 0.01 },
    { at: from, actor: 'chili', do: 'pop', dur: 0.12 },
    { at: from + 0.001, actor: 'chili', do: 'scaleTo', amount: s / CH, dur: 0.01 },
    { at: from + 0.12, actor: 'chili', do: 'moveTo', to: h, arc: 8, dur: 0.24, ease: 'out' },
    { at: at - 0.16, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
    // 咬下去：辣椒一縮、塞進嘴裡
    { at, actor: 'chili', do: 'squash', amount: 0.3, dur: 0.12 },
    { at: at + 0.04, actor: 'chili', do: 'moveTo', to: { x: MX + 2, y: MY + 1 }, dur: 0.1, ease: 'in' },
    { at: at + 0.1, actor: 'chili', do: 'vanish', dur: 0.05 },
    { at, actor: 'pig', do: 'squash', amount: 0.14, dur: 0.18 },
    // 「⋯⋯還好嘛」：閉眼得意，點一下頭
    { at: at + 0.14, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: at + 0.2, actor: 'pig', do: 'tilt', amount: -6, dur: 0.3 },
  ]
}

/**
 * 「轟」——辣起來：換辣到的臉（臉紅、吐舌、搧風、噴淚）、整個人染紅（一次比一次紅）、兩邊耳朵冒煙、眼淚噴出來，
 * 預備是前一刻身體抖一下；那一刻鏡頭推近＋震＋白光＋同一個音效。k 是第幾次（越後面越大）。
 */
function burn(at: number, k: number) {
  const moves: Move[] = [
    // 預備：還在得意，身體先抖一下（觀眾知道要來了）
    { at: at - 0.16, actor: 'pig', do: 'shake', amount: 0.6 + 0.2 * k, dur: 0.16 },
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/spicy' },
    { at, actor: 'pig', do: 'tint', filter: RED[k] },
    { at, actor: 'pig', do: 'squash', amount: -0.2 - 0.04 * k, dur: 0.25 },
    { at: at + 0.12, actor: 'pig', do: 'shake', amount: 1.2 + 0.4 * k, dur: HOLD - 0.1 },
  ]
  const fx: Fx[] = [
    // 💥 在頭的後上方（不蓋住臉），一次比一次大
    { at, kind: 'burst', x: MX - 12, y: MY - 12, n: 1, dur: 0.3, scale: 1.3 + 0.3 * k },
    // 兩邊耳朵冒煙（一團一團往上飄），一次比一次大；眼淚 spicy 姿勢圖上自帶，不另外噴（會蓋住臉）
    { at: at + 0.02, kind: 'zzz', actor: 'pig', emoji: '☁️', dx: -14, dy: 6, dur: HOLD + 0.3, scale: Math.min(2.2 + 0.4 * k, 2.9) },
    { at: at + 0.02, kind: 'zzz', actor: 'pig', emoji: '☁️', dx: 2, dy: 6, dur: HOLD + 0.3, scale: Math.min(2.2 + 0.4 * k, 2.9) },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: MX, y: MY } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'hic' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 咬下去的時刻 */
const B1 = 1.25, B2 = 3.4, B3 = 6.05, B4 = 9.4
/** 辣起來的時刻（第 3 次的半拍拉長一點） */
const H1 = B1 + DELAY, H2 = B2 + DELAY, H3 = B3 + 0.6, H4 = B4 + DELAY
const b1 = burn(H1, 0)
const b2 = burn(H2, 1)
const b3 = burn(H3, 2)
const b4 = burn(H4, 3)
/** 衝去找水的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD
/** 第 3 次：繞場一圈後倒栽進水桶的時刻 */
const LAND3 = R3 + 0.55
/** 語詞那一刻：超大辣椒從鍋裡跳出來 */
const WORD = 8.95
/** 第 4 次：哭到睜不開眼、栽進麻辣鍋的時刻 */
const DIVE4 = H4 + 0.42

const clip: Clip = {
  format: 2,
  char: '辣',
  meta: { theme: '豬探長說他才不怕辣', cast: '豬探長＋麻辣鍋＋辣椒＋一杯水（水桶）', gags: ['很有自信的豬探長每次咬一口辣椒，停半拍「還好嘛」，然後臉轟地漲紅、耳朵冒煙、噴淚，衝去找水，辣椒一次比一次大、喝水一次比一次誇張（喝一杯水→整個頭栽進水桶→像火箭一樣繞場噴出去）；回馬槍是他先把水桶拖到身邊才吃，哭到睜不開眼，一頭栽進去的卻是麻辣鍋'] },
  duration: 15,
  bg: { top: '#FFE0C7', bottom: '#FFF5EA', floor: '#D9A47A', scenery: 'room' },
  actors: [
    // 豬探長畫在鍋子後面：第 4 次栽進鍋裡時頭被鍋子蓋住；姿勢圖朝左，翻過來面向右邊的鍋子
    { id: 'pig', emoji: 'hero:pig/walk', x: BITE, y: P, size: PS, hidden: true, flip: true },
    { id: 'pot', emoji: 'prop:hotpot', x: PX, y: PY, size: POT },
    // 一杯水 → 水桶（畫在豬探長前面：栽進去時頭被桶子蓋住）
    { id: 'cup', emoji: 'prop:water', x: WX, y: CY, size: CUP },
    { id: 'chili', emoji: 'prop:chili', x: PX - 4, y: PY - 14, size: CH, hidden: true, float: true },
  ],
  moves: [
    // 豬探長大搖大擺走進來，抱胸斜眼看著麻辣鍋：我才不怕辣
    { at: 0, actor: 'pig', do: 'enter', from: { x: -20, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: 0.55, actor: 'pot', do: 'shake', amount: 0.6, dur: 0.4 },
    // 第 1 次：一根小辣椒，喀——還好嘛……轟！衝去喝一杯水
    ...bite(B1, 14),
    ...b1.moves,
    { at: R1, actor: 'pig', do: 'flip' },
    { at: R1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: R1, actor: 'pig', do: 'moveTo', to: { x: WX + 16, y: P }, dur: 0.22, anticipate: 3, ease: 'in' },
    { at: R1 + 0.24, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
    { at: R1 + 0.26, actor: 'cup', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: R1 + 0.3, actor: 'pig', do: 'tint', filter: '' },
    { at: R1 + 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: R1 + 0.8, actor: 'pig', do: 'flip' },
    { at: R1 + 0.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: R1 + 0.8, actor: 'pig', do: 'moveTo', to: { x: BITE, y: P }, dur: 0.35 },
    { at: R1 + 1.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    // 第 2 次：大一點的辣椒——轟！更紅，一杯不夠，杯子換成水桶，整個頭栽進去
    ...bite(B2, 20),
    ...b2.moves,
    { at: H2 + 0.15, actor: 'cup', do: 'swap', emoji: 'prop:bucket' },
    { at: H2 + 0.15, actor: 'cup', do: 'moveTo', to: { x: WX, y: BUCKET_Y }, dur: 0.01 },
    { at: R2, actor: 'pig', do: 'flip' },
    { at: R2, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: R2, actor: 'pig', do: 'moveTo', to: { x: WX + 16, y: P }, dur: 0.2, anticipate: 3, ease: 'in' },
    // 倒栽蔥：頭進桶子、腳朝天亂踢
    { at: R2 + 0.2, actor: 'pig', do: 'moveTo', to: { x: WX + 1, y: 51 }, arc: 8, dur: 0.2, ease: 'in' },
    { at: R2 + 0.2, actor: 'pig', do: 'rotateTo', amount: 180, dur: 0.2, pivot: 'center' },
    { at: R2 + 0.4, actor: 'cup', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: R2 + 0.42, actor: 'pig', do: 'tint', filter: '' },
    { at: R2 + 0.45, actor: 'pig', do: 'shake', amount: 1.5, dur: 0.45 },
    { at: R2 + 0.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: R2 + 0.95, actor: 'pig', do: 'rotateTo', amount: -180, dur: 0.25, pivot: 'center' },
    { at: R2 + 0.95, actor: 'pig', do: 'moveTo', to: { x: WX + 16, y: P }, arc: 6, dur: 0.25, ease: 'out' },
    { at: R2 + 1.3, actor: 'pig', do: 'flip' },
    { at: R2 + 1.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: R2 + 1.3, actor: 'pig', do: 'moveTo', to: { x: BITE, y: P }, dur: 0.3 },
    // 第 3 次：先停一拍——鍋裡冒出一根超大辣椒，他拿放大鏡看一看、吞口水……抱胸：我才不怕！喀——
    { at: 5.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 5.4, actor: 'pot', do: 'shake', amount: 1, dur: 0.35 },
    ...bite(B3, CH, 5.45),
    { at: 5.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    ...b3.moves,
    // 轟！像火箭一樣噴出去：往右上、從國字下面繞過去、到左上，倒栽進水桶
    { at: R3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: R3, actor: 'pig', do: 'moveTo', to: { x: 130, y: 46 }, dur: 0.18, ease: 'in' },
    { at: R3 + 0.18, actor: 'pig', do: 'moveTo', to: { x: 44, y: 50 }, dur: 0.2, ease: 'linear' },
    { at: R3 + 0.38, actor: 'pig', do: 'moveTo', to: { x: WX + 1, y: 51 }, dur: 0.17, ease: 'in' },
    { at: R3, actor: 'pig', do: 'rotateTo', amount: 540, dur: 0.55, pivot: 'center', ease: 'linear' },
    // 噴出去的那一下把麻辣鍋也震飛出右邊（國字放大到正中央時鍋子不在畫面上），國字讓位時才滑回原地
    { at: R3 + 0.03, actor: 'pot', do: 'moveTo', to: { x: 190, y: PY - 10 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: R3 + 0.03, actor: 'pot', do: 'rotateTo', amount: 160, dur: 0.4, pivot: 'center' },
    { at: 8.5, actor: 'pot', do: 'rotateTo', amount: -160, dur: 0.01, pivot: 'center' },
    { at: 8.5, actor: 'pot', do: 'moveTo', to: { x: 190, y: PY }, dur: 0.01 },
    { at: 8.52, actor: 'pot', do: 'moveTo', to: { x: PX, y: PY }, dur: 0.35, ease: 'back' },
    { at: LAND3, actor: 'cup', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: LAND3 + 0.02, actor: 'pig', do: 'tint', filter: '' },
    { at: LAND3 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: LAND3 + 0.1, actor: 'pig', do: 'shake', amount: 1.5, dur: 0.5 },
    // 字框填滿（國字 home 到正中央，他腳朝天插在桶子裡）；國字讓位，他爬出來、把水桶拖到身邊：這次準備好了
    { at: 8.4, actor: 'pig', do: 'rotateTo', amount: -180, dur: 0.25, pivot: 'center' },
    { at: 8.4, actor: 'pig', do: 'moveTo', to: { x: WX + 16, y: P }, arc: 6, dur: 0.25, ease: 'out' },
    { at: 8.4, actor: 'pig', do: 'flip' },
    { at: 8.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/pull' },
    { at: 8.65, actor: 'pig', do: 'moveTo', to: { x: BITE, y: P }, dur: 0.35 },
    { at: 8.65, actor: 'cup', do: 'moveTo', to: { x: BITE - 19, y: BUCKET_Y }, dur: 0.35 },
    { at: 9.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 語詞那一刻：超大辣椒從鍋裡跳出來，停在鍋子上面
    { at: WORD, actor: 'chili', do: 'moveTo', to: { x: PX - 2, y: PY - 10 }, dur: 0.01 },
    { at: WORD, actor: 'chili', do: 'pop', dur: 0.2 },
    { at: WORD + 0.01, actor: 'chili', do: 'moveTo', to: { x: PX - 2, y: PY - 22 }, dur: 0.25, ease: 'back' },
    { at: WORD + 0.2, actor: 'pot', do: 'squash', amount: 0.12, dur: 0.2 },
    // 回馬槍（第 4 次）：喀——還好嘛……轟！哭到睜不開眼，一頭栽進去的是麻辣鍋
    { at: B4 - 0.28, actor: 'chili', do: 'moveTo', to: held(CH), arc: 6, dur: 0.18, ease: 'in' },
    { at: B4 - 0.16, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
    { at: B4, actor: 'chili', do: 'squash', amount: 0.3, dur: 0.12 },
    { at: B4 + 0.04, actor: 'chili', do: 'moveTo', to: { x: MX + 2, y: MY + 1 }, dur: 0.1, ease: 'in' },
    { at: B4 + 0.1, actor: 'chili', do: 'vanish', dur: 0.05 },
    { at: B4, actor: 'pig', do: 'squash', amount: 0.14, dur: 0.18 },
    { at: B4 + 0.14, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: B4 + 0.2, actor: 'pig', do: 'tilt', amount: -6, dur: 0.3 },
    ...b4.moves,
    { at: H4 + 0.28, actor: 'pig', do: 'swap', emoji: 'hero:pig/cry' },
    { at: DIVE4 - 0.15, actor: 'pig', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: DIVE4, actor: 'pig', do: 'moveTo', to: { x: PX - 2, y: PY - 8 }, arc: 10, dur: 0.2, ease: 'in' },
    { at: DIVE4, actor: 'pig', do: 'rotateTo', amount: 180, dur: 0.2, pivot: 'center' },
    { at: DIVE4 + 0.2, actor: 'pot', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: DIVE4 + 0.22, actor: 'pig', do: 'tint', filter: RED[3] + ' brightness(.75)' },
    { at: DIVE4 + 0.22, actor: 'pig', do: 'shake', amount: 2.2, dur: 0.3 },
    // 噴上天（往右上斜斜地飛出畫面，不從國字前面經過）
    { at: DIVE4 + 0.38, actor: 'pig', do: 'moveTo', to: { x: PX + 62, y: -50 }, dur: 0.2, ease: 'in' },
    { at: DIVE4 + 0.38, actor: 'pig', do: 'rotateTo', amount: 360, dur: 0.2, pivot: 'center' },
    { at: DIVE4 + 0.4, actor: 'pot', do: 'shake', amount: 2, dur: 0.3 },
    // 鍋子、水桶在問他之前退場
    { at: 10.7, actor: 'pot', do: 'vanish', dur: 0.2 },
    { at: 10.7, actor: 'cup', do: 'vanish', dur: 0.2 },
    // 問他：豬探長從天上掉到左前方、變大，轉向觀眾
    { at: 10.9, actor: 'pig', do: 'rotateTo', amount: -540, dur: 0.01, pivot: 'center' },
    { at: 10.9, actor: 'pig', do: 'tint', filter: '' },
    { at: 10.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.9, actor: 'pig', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: 10.92, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.22, ease: 'in' },
    { at: 11.15, actor: 'pig', do: 'scaleTo', amount: 1.45, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.05, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.45, actor: 'pig', do: 'hop', amount: 7, dur: 0.28 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.75, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 每次咬下去，辣椒被咬下來的那一口飛上去：辛（辣椒的紅）、束上半（一＋口）、束下半（丨丿㇏）
    { at: B1 + 0.02, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'chili', color: partColor('辛') },
    { at: B2 + 0.02, dur: 0.6, strokes: [7, 8, 9, 10], from: 'chili', color: partColor('束') },
    { at: B3 + 0.02, dur: 0.6, strokes: [11, 12, 13], from: 'chili', color: partColor('束') },
  ],
  glyph: [
    { at: LAND3 + 0.05, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.5, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 10.85, dur: 3.1, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.9, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 咬下去「喀」：辣椒那邊噴一點碎屑
    ...[B1, B2, B3, B4].map((at, k): Fx => ({ at, kind: 'burst', x: MX + 5, y: MY - 2, emoji: '✨', n: 4 + k, dur: 0.3, scale: 0.8 + 0.1 * k })),
    ...b1.fx,
    // 喝下一杯水：呼——
    { at: R1 + 0.3, kind: 'burst', x: WX + 4, y: CY - 10, emoji: '💦', n: 4, dur: 0.35 },
    ...b2.fx,
    // 頭栽進水桶：水花
    { at: R2 + 0.4, kind: 'burst', x: WX + 3, y: BUCKET_Y - 10, emoji: '💦', n: 7, dur: 0.45, scale: 1.1 },
    { at: R2 + 1.2, kind: 'dizzy', actor: 'pig', dur: 0.45 },
    ...b3.fx,
    // 火箭：一路噴煙
    { at: R3, kind: 'burst', x: BITE, y: P - 4, emoji: '☁️', n: 6, dur: 0.5, scale: 1.4 },
    { at: R3, kind: 'zzz', actor: 'pig', emoji: '☁️', dx: -8, dy: 10, dur: 0.55, scale: 1.6 },
    { at: LAND3, kind: 'burst', x: WX + 3, y: BUCKET_Y - 10, emoji: '💦', n: 9, dur: 0.5, scale: 1.2 },
    // 語詞那一刻：超大辣椒閃一下
    { at: WORD + 0.1, kind: 'burst', x: PX - 2, y: PY - 24, emoji: '✨', n: 7, dur: 0.5 },
    ...b4.fx,
    // 栽進麻辣鍋：紅湯噴出來、頭頂冒出一大團煙，噴上天
    { at: DIVE4 + 0.2, kind: 'burst', x: PX - 2, y: PY - 14, emoji: '🌶️', n: 8, dur: 0.5, scale: 1.3 },
    { at: DIVE4 + 0.22, kind: 'burst', x: PX - 2, y: PY - 20, n: 1, dur: 0.35, scale: 2.6 },
    { at: DIVE4 + 0.3, kind: 'burst', x: PX - 2, y: PY - 12, emoji: '☁️', n: 8, dur: 0.6, scale: 1.5 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 水在左邊、鍋在右邊：自動取景推近會切掉一邊，整支幾乎全景
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: LAND3, dur: 0.35, do: 'shake', amount: 1.6 },
    ...b4.camera,
    { at: DIVE4 + 0.22, dur: 0.4, do: 'shake', amount: 2.6 },
    { at: 10.7, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次辣起來白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: LAND3 + 0.05, dur: 0.05, level: -0.35 },
    { at: LAND3 + 0.1, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '辣' },
    // 咬下去「喀」
    ...[B1, B2, B3, B4].map((at): Cue => ({ at, sfx: 'crack' })),
    ...b1.cues,
    { at: R1, sfx: 'whoosh' },
    { at: R1 + 0.26, sfx: 'gulp' },
    ...b2.cues,
    { at: R2, sfx: 'whoosh' },
    { at: R2 + 0.4, sfx: 'splash' },
    ...b3.cues,
    { at: R3, sfx: 'whoosh' },
    { at: LAND3, sfx: 'splash' },
    { at: LAND3 + 0.15, say: '辣' },
    { at: WORD, sfx: 'boing' },
    { at: WORD + 0.05, say: '辣椒' },
    ...b4.cues,
    { at: DIVE4 + 0.2, sfx: 'splash' },
    { at: DIVE4 + 0.38, sfx: 'whoosh' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '辣' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
