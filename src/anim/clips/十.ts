import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 十（v2）：打保齡球。十支球瓶排成 4-3-2-1 的三角形（開場一支一支冒出來，數到十）。一本正經的狗狗警長很認真地滾球——
// 每次球滾到面前，十支球瓶就「嘿」地一起跳起來，球從底下滾過去、「咚」地撞上後面的牆彈回來，把警長撞倒，一次比一次慘：
// 撞到腳、整個人趴扁 → 被撞得直直飛上去、一屁股跌坐 → 冒汗想一想、用力滾，球瓶跳最高，他被撞上天轉圈、摔下來頭暈。
// 第一次趴扁時平平地彈出一橫、第二次直直飛上去帶出一豎，第三次整個字亮起來。語詞「十個」：十支球瓶一支一支亮一下。
// 回馬槍：他這次學乖了，球一彈回來他就跳起來躲過、得意——結果十支球瓶這次跳太高，一支一支從天上掉下來砸在他身上，把他埋住。
// 十、十、十個、這是什麼字？、十
const S = 36
const X = 28
const P = 77 - 0.42 * S

type V = { x: number; y: number }

/** 球（先用 🔵 頂著，之後換自製道具圖）：在地上滾的深度線 */
const BS = 10
const BY = 80 - 0.42 * BS
/** 每次滾之前球停在他腳前；彈回來撞到他的地方 */
const BALL_REST = X + 18
const BALL_HIT = X + 8
/** 後面的牆（球撞到彈回來） */
const WALL = 148
const BALL_WALL = WALL - 2.4 - BS * 0.45

/**
 * 球瓶：程式畫的（白色、深色描邊、脖子一圈紋），掛在各自看不見的錨上。
 * 錨在瓶底往上 BW/2 的地方（肚子那段的圓頭剛好貼地）。
 */
const NW = 3.6 // 脖子＋頭的粗細
const NL = 12 // 脖子＋頭的長度
const BW = 6.2 // 肚子的粗細
const BL = 4.6 // 肚子的長度
const PIN_H = BW / 2 + NL + NW / 2
/** 十支球瓶：4-3-2-1 的三角形（後排在上、最前面一支在下），左右錯開，互相不擋 */
const CX = 112
const ROWS: { c: number; xs: number[] }[] = [
  { c: 72, xs: [-22.5, -7.5, 7.5, 22.5] },
  { c: 77.5, xs: [-15, 0, 15] },
  { c: 83, xs: [-7.5, 7.5] },
  { c: 88.5, xs: [0] },
]
/** 0～9 照繪製順序（後排先畫，前面的蓋在上面） */
const PINS: V[] = ROWS.flatMap((r) => r.xs.map((dx) => ({ x: CX + dx, y: r.c - BW / 2 })))
/** 數的順序：最前面那支先，往後一排一排數（1 → 2 → 3 → 4） */
const COUNT = [9, 7, 8, 4, 5, 6, 0, 1, 2, 3]
const pin = (i: number) => `p${i}`

/** 一支球瓶：直立（deg 0）或倒下（deg 往右轉的角度），以錨（瓶底）為支點 */
function pinFx(i: number, from: number, to: number, deg = 0): Fx[] {
  const r = (deg * Math.PI) / 180
  const up = (l: number) => ({ dx: Math.sin(r) * l, dy: -Math.cos(r) * l })
  return [
    { at: from, dur: to - from, kind: 'tube', actor: pin(i), ...up(NL), target: pin(i), color: '#FFFFFF', width: NW, n: NL - 4 },
    { at: from, dur: to - from, kind: 'tube', actor: pin(i), ...up(BL), target: pin(i), color: '#FFFFFF', width: BW, n: 99 },
  ]
}

/** 每一次球瓶跳多高（第四次跳出畫面） */
const JUMP = [20, 25, 30]
/** 從放手到球彈回來撞到他 */
const TRIP = 0.9

/**
 * 「咚」：他彎腰把球擺好、瞄準（預備）→ 用力一推，球咕嚕咕嚕滾過去 → 十支球瓶「嘿」地一起跳起來，球從底下滾過去 →
 * 「咚」撞上後面的牆彈回來（他傻眼）→ 球瓶落地的同一刻，球撞到他：鏡頭推近＋震＋同一個「咚」＋💥。k 是第幾次。
 * k 3（回馬槍）：球瓶跳出畫面不回來；他跳起來躲過彈回來的球，後面由外面接。
 */
function roll(r: number, k: number) {
  const h = r + TRIP
  const jump = k < 3 ? JUMP[k] : 110
  const moves: Move[] = [
    // 預備：彎腰把球擺好、瞄準
    { at: r - 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at: r - 0.25, actor: 'sheriff', do: 'squash', amount: 0.12, dur: 0.25 },
    // 一推：球咕嚕咕嚕滾到牆
    { at: r, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/push' },
    { at: r, actor: 'ball', do: 'moveTo', to: { x: BALL_WALL, y: BY }, dur: 0.5, ease: 'in' },
    { at: r, actor: 'ball', do: 'rotateTo', amount: 360 * 3, dur: 0.5, ease: 'in' },
    // 十支球瓶一起跳起來
    ...PINS.map((p, i): Move => ({ at: r + 0.1, actor: pin(i), do: 'moveTo', to: { x: p.x, y: p.y - jump }, dur: k < 3 ? 0.15 : 0.4, ease: k < 3 ? 'out' : 'in' })),
    // 球撞牆彈回來
    { at: r + 0.5, actor: 'ball', do: 'squash', amount: 0.25, dur: 0.15 },
    { at: r + 0.5, actor: 'ball', do: 'moveTo', to: { x: BALL_HIT, y: BY }, dur: TRIP - 0.5, ease: 'linear' },
    { at: r + 0.5, actor: 'ball', do: 'rotateTo', amount: -360 * 3, dur: TRIP - 0.5 },
  ]
  if (k < 3) moves.push(
    // 他傻眼（球瓶跳起來那一刻到球撞到他）
    { at: r + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: r + 0.15, actor: 'sheriff', do: 'hop', amount: 1.5 + k, dur: 0.2 },
    // 球瓶落回原位，剛好跟球撞到他同一刻
    ...PINS.map((p, i): Move => ({ at: h - 0.15, actor: pin(i), do: 'moveTo', to: p, dur: 0.15, ease: 'in' })),
  )
  const fx: Fx[] = [
    { at: r + 0.5, kind: 'burst', x: WALL - 3, y: BY, n: 1, dur: 0.3, scale: 0.8 },
    { at: r + 0.12, kind: 'burst', x: CX, y: 72 - Math.min(jump, 30), emoji: '💨', n: 5, dur: 0.35, scale: 0.9 },
  ]
  const cues: Cue[] = [{ at: r, sfx: 'slide' }, { at: r + 0.1, sfx: 'whoosh' }, { at: r + 0.5, sfx: 'boing' }]
  const camera: Camera[] = []
  if (k === 3) return { h, moves, fx, cues, camera }
  // 撞到他：💥＋推近＋震
  moves.push(
    { at: h, actor: 'ball', do: 'moveTo', to: { x: BALL_REST, y: BY }, dur: 0.35, ease: 'out' },
    { at: h, actor: 'ball', do: 'rotateTo', amount: 360, dur: 0.35, ease: 'out' },
  )
  fx.push({ at: h, kind: 'burst', x: X + 6, y: 70 - 6 * k, n: 1, dur: 0.4, scale: 1.1 + 0.3 * k })
  cues.push({ at: h, sfx: 'bonk' })
  camera.push(
    { at: h, dur: 0.4, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: X + 10, y: 62 } },
    { at: h, dur: 0.3, do: 'shake', amount: 1 + 0.5 * k },
  )
  if (k === 0) {
    // 撞到腳：整個人往前趴扁
    moves.push(
      { at: h, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
      { at: h + 0.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    )
  } else if (k === 1) {
    // 被撞得直直飛上去，一屁股跌坐
    moves.push(
      { at: h, actor: 'sheriff', do: 'moveTo', to: { x: X, y: P - 26 }, dur: 0.3, ease: 'out' },
      { at: h + 0.4, actor: 'sheriff', do: 'moveTo', to: { x: X, y: P }, dur: 0.25, ease: 'in' },
      { at: h + 0.65, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },
    )
    cues.push({ at: h + 0.65, sfx: 'bonk' })
  } else {
    // 被撞上天轉圈，摔下來頭暈
    moves.push(
      { at: h, actor: 'sheriff', do: 'moveTo', to: { x: X, y: P - 36 }, dur: 0.35, ease: 'out' },
      { at: h, actor: 'sheriff', do: 'spin', pivot: 'center', times: 2, dur: 0.75 },
      { at: h + 0.45, actor: 'sheriff', do: 'moveTo', to: { x: X, y: P }, dur: 0.3, ease: 'in' },
      { at: h + 0.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    )
    fx.push({ at: h + 0.8, kind: 'dizzy', actor: 'sheriff', dur: 0.9 })
    cues.push({ at: h + 0.75, sfx: 'bonk' })
  }
  return { h, moves, fx, cues, camera }
}

const R1 = 1.15
const R2 = 2.95
const PAUSE = 4.55
const R3 = 5.2
const r1 = roll(R1, 0)
const r2 = roll(R2, 1)
const r3 = roll(R3, 2)
const FULL = r3.h + 0.85
const PARK = FULL + 0.85
const WORD = PARK + 0.15
/** 回馬槍 */
const R4 = 8.75
const r4 = roll(R4, 3)
/** 他跳起來躲過彈回來的球 */
const DODGE = r4.h - 0.25
/** 十支球瓶一支一支從天上掉下來砸他 */
const RAIN = r4.h + 0.3
const RAIN_GAP = 0.065
const LAND = (j: number) => RAIN + 0.12 + j * RAIN_GAP
/** 掉下來疊成一堆：落點與倒下的角度（照 COUNT 的順序） */
const PILE: { x: number; c: number; deg: number }[] = [
  { x: 28, c: 72, deg: -70 }, { x: 34, c: 74, deg: 80 }, { x: 22, c: 75, deg: -95 }, { x: 40, c: 76, deg: 100 },
  { x: 30, c: 68, deg: 20 }, { x: 18, c: 77, deg: -110 }, { x: 44, c: 71, deg: 60 }, { x: 25, c: 66, deg: -35 },
  { x: 36, c: 65, deg: 45 }, { x: 30, c: 62, deg: -5 },
]
const POPOUT = 10.8
const ASK = 11.0
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '十',
  meta: { theme: '保齡球：十支球瓶', cast: '狗狗警長＋保齡球＋十支球瓶', gags: ['狗狗警長很認真地打保齡球：每次球一滾過去，十支球瓶就一起跳起來讓球從底下過去，球撞牆彈回來把他撞倒，一次比一次慘（趴扁→直直飛上去跌坐→撞上天轉圈摔下來頭暈）；回馬槍是他學乖了、跳起來躲過彈回來的球、得意，結果十支球瓶這次跳太高，一支一支從天上掉下來把他埋住'] },
  duration: 15,
  bg: { top: '#FFF4E0', bottom: '#FFFAF0', floor: '#E8C28A', scenery: 'room' },
  actors: [
    // 看不見的錨：牆的線掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    // 十支球瓶各自的錨（看不見，球瓶是掛在上面的線條）
    ...PINS.map((p, i) => ({ id: pin(i), emoji: '⭐', x: p.x, y: p.y, size: 40, hidden: true })),
    { id: 'ball', emoji: '🔵', x: BALL_REST, y: BY, size: BS, hidden: true, pivot: 'center' as const },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: X, y: P, size: S, flip: true, hidden: true },
  ],
  moves: [
    // 開場：他走進來，敬禮，指著字框「十！」
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 0.5, actor: 'ball', do: 'pop', dur: 0.2 },
    // 第 1 次
    ...r1.moves,
    // 第 2 次
    ...r2.moves,
    // 第 3 次前停一拍：托下巴、冒汗，球瓶一起晃一晃裝沒事
    { at: PAUSE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    ...PINS.map((_, i): Move => ({ at: PAUSE + 0.15, actor: pin(i), do: 'hop', amount: 1.2, dur: 0.25 })),
    ...r3.moves,
    // 讓位：他爬起來，指著十支球瓶——十個！
    { at: PARK + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: WORD + 0.8, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 回馬槍：一樣滾，球瓶跳出畫面；他跳起來躲過彈回來的球
    ...r4.moves,
    { at: R4 + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: DODGE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: DODGE, actor: 'sheriff', do: 'moveTo', to: { x: X, y: P - 20 }, dur: 0.22, ease: 'out' },
    { at: DODGE + 0.4, actor: 'sheriff', do: 'moveTo', to: { x: X, y: P }, dur: 0.2, ease: 'in' },
    { at: DODGE + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    // 球從他腳下滾過去、滾出畫面
    { at: r4.h, actor: 'ball', do: 'moveTo', to: { x: -20, y: BY }, dur: 0.35, ease: 'linear' },
    { at: r4.h, actor: 'ball', do: 'rotateTo', amount: -720, dur: 0.35 },
    { at: r4.h + 0.4, actor: 'ball', do: 'vanish', dur: 0.05 },
    // 十支球瓶一支一支從天上掉下來砸在他身上
    ...COUNT.flatMap((i, j): Move[] => [
      { at: LAND(j) - 0.2, actor: pin(i), do: 'moveTo', to: { x: PILE[j].x, y: -25 }, dur: 0.01 },
      { at: LAND(j) - 0.18, actor: pin(i), do: 'moveTo', to: { x: PILE[j].x, y: PILE[j].c - BW / 2 }, dur: 0.18, ease: 'in' },
    ]),
    { at: LAND(0), actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: LAND(0), actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: LAND(2), actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 他從球瓶堆裡彈出來，球瓶噴飛出畫面
    { at: POPOUT, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: POPOUT, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.3 },
    ...COUNT.map((i, j): Move => ({ at: POPOUT, actor: pin(i), do: 'moveTo', to: { x: PILE[j].x + (j % 2 ? 1 : -1) * 90, y: -30 }, dur: 0.18, ease: 'in' })),
    // 問他：他在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: P + 2 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.05, dur: 0.3 },
    { at: 12.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.2, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：往左跑出去
    { at: ANSWER + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: ANSWER + 0.1, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'sheriff', do: 'moveTo', to: { x: -35, y: P + 2 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：趴扁的他身上平平地彈出一橫；第 2 次：直直飛上去帶出一豎
    { at: r1.h + 0.3, dur: 0.6, strokes: [0], from: 'sheriff', color: partColor('十') },
    { at: r2.h + 0.1, dur: 0.55, strokes: [1], from: 'sheriff', color: partColor('十') },
  ],
  glyph: [
    // 第 3 次：摔下來那一刻，整個字亮起來
    { at: r3.h + 0.75, dur: 0.4, do: 'pulse' },
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.95, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 後面的牆
    { at: 0, dur: ASK, kind: 'tube', actor: 'rb', dx: WALL, dy: 58, to: { x: WALL, y: 92 }, color: '#B5703A', width: 4.8, n: 6 },
    // 十支球瓶：開場一支一支冒出來；回馬槍掉下來落地那一刻倒成一堆
    ...COUNT.flatMap((i, j) => [...pinFx(i, 0.15 + 0.07 * j, LAND(j)), ...pinFx(i, LAND(j), POPOUT + 0.19, PILE[j].deg)]),
    ...COUNT.map((i, j): Fx => ({ at: 0.15 + 0.07 * j, kind: 'burst', x: PINS[i].x, y: PINS[i].y - 6, emoji: '✨', n: 4, dur: 0.3, scale: 0.6 })),
    ...r1.fx,
    ...r2.fx,
    // 第 3 次前停一拍
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'sheriff', dur: 0.6 },
    ...r3.fx,
    // 十個：一支一支亮一下
    ...COUNT.map((i, j): Fx => ({ at: WORD + 0.07 * j, kind: 'burst', x: PINS[i].x, y: PINS[i].y - 7, emoji: '✨', n: 6, dur: 0.4, scale: 1 })),
    // 回馬槍
    ...r4.fx,
    ...COUNT.map((_, j): Fx => ({ at: LAND(j), kind: 'burst', x: PILE[j].x, y: PILE[j].c - 4, n: 1, dur: 0.2, scale: 0.6 })),
    { at: LAND(9) + 0.05, kind: 'dizzy', actor: 'sheriff', dur: 0.5, dy: 6 },
    { at: POPOUT, kind: 'burst', x: X, y: 66, emoji: '💨', n: 8, dur: 0.35, scale: 1.2 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 十支球瓶一直留在畫面裡：國字拼好前不讓自動取景推近到只剩他
    { at: 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    ...r1.camera,
    ...r2.camera,
    ...r3.camera,
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.03, to: { x: 80, y: 50 } },
    { at: LAND(4), dur: 0.45, do: 'punch', amount: 0.2, to: { x: X + 4, y: 64 } },
    { at: LAND(4), dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: FULL, dur: 0.05, level: -0.25 },
    { at: FULL + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    // 十支球瓶一支一支冒出來
    ...COUNT.map((_, j): Cue => ({ at: 0.15 + 0.07 * j, sfx: 'blip' })),
    { at: 0.85, say: '十' },
    ...r1.cues,
    ...r2.cues,
    { at: PAUSE + 0.2, sfx: 'gulp' },
    ...r3.cues,
    { at: FULL + 0.05, say: '十' },
    { at: WORD, say: '十個' },
    ...COUNT.map((_, j): Cue => ({ at: WORD + 0.07 * j, sfx: 'blip' })),
    ...r4.cues,
    { at: DODGE, sfx: 'whoosh' },
    ...COUNT.map((_, j): Cue => ({ at: LAND(j), sfx: j % 3 === 0 ? 'bonk' : 'tap' })),
    { at: POPOUT, sfx: 'poof' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '十' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
