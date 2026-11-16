import type { Build, Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 陽（v2）：浣熊花生出來曬太陽。大太陽「叮」地一照，一圈金色的光芒轉起來、暖暖的陽光灑下來，他舒服地閉眼——
// 一朵雲就從右邊飄過來把太陽遮住，畫面一下子暗下來，他冷得縮成一團發抖（雲後面還露出一點太陽的光邊）。
// 他想辦法把雲趕走，雲一次比一次大、趕得一次比一次費力：吹一口氣吹走小白雲（阝）→ 拿扇子猛搧趕走鼓著臉的大灰雲（日）→
// 先停一拍：一整片烏雲飄過來，他托著下巴發抖……搬來梯子爬上去，用力把烏雲推走（一＋勿）。
// 每次雲一走，太陽就「叮」地再照下來，而且一次比一次亮、光芒一次比一次長；筆畫從重新亮起來的太陽裡飛進字框。
// 語詞那一刻太陽在畫面中間、光芒伸到最長，他指著它：「太陽」。
// 回馬槍（第四次）：最大的一片烏雲又來了，他累得垮下來、不想趕了——這次太陽自己在雲後面一鼓，光芒「啪」地穿過雲、把雲彈飛出畫面，
// 還把陽光鋪在他身上當被子，他在金光裡舒服地睡著。
// 最後畫面暗下來只剩「陽」，花生站起來問「這是什麼字？」，手放耳邊等他回答，再指著字說「陽！」，然後退場只留字。
// 刻意不跟「午」（太陽爬到頭頂「噹」、點心被曬融）、「早」（公雞叫太陽蹦上來）、「雲」（雲只下雨在他身上）撞：
// 這支只演「太陽照下來＝亮、暖；被雲遮住＝暗、冷」，沒有十二點、沒有食物、沒有融化、沒有下雨。
// 陽、陽、太陽、這是什麼字？、陽

/** 浣熊花生（圖朝左；一開始翻成朝右，看著右上的太陽） */
const RS = 36
const RY = 77 - 0.42 * RS
const RX = 72
/** 太陽（🌞 是會笑的角色）：每次都在同一個地方 */
const SS = 34
const SUN: Vec = { x: 112, y: 30 }
/** 太陽的半徑（3D 圖的圓盤佔 0.85） */
const SR = 0.85 * SS / 2
/** 國字回中央那一秒，太陽讓到右上角（國字右緣約 x 113） */
const SUN_ASIDE: Vec = { x: 140, y: 24 }
/** 雲（同一個角色換圖）：底子 size 寫最大的那一片，前幾次縮小 */
const CS = 56
const CLOUD = ['prop:cloud-happy', 'prop:cloud-puff', 'prop:cloud-dark', 'prop:cloud-dark']
/** 一次比一次大（第 4 次最大） */
const CLOUD_K = [0.55, 0.74, 0.93, 1.0]
/** 雲的上緣停在這裡：太陽的上緣（y 15.6）露出一小截，看得出雲後面有太陽 */
const CLOUD_TOP = 23
/** 雲遮住太陽時的位置（雲圖的內容上緣在腳底往上 0.61 × 畫出來的大小） */
const coverAt = (k: number): Vec => ({ x: SUN.x + 1, y: CLOUD_TOP + 0.61 * CS * CLOUD_K[k] - 0.42 * CS })
/** 雲從右邊畫面外飄進來、被趕走也飛回右邊 */
const OFF_X = 200
/** 光芒的顏色 */
const GOLD = '#FFB300'
const GOLD_EDGE = '#FFD54F'
/** 被雲遮住：冷冷的、藍藍的 */
const COLD = 'saturate(.7) hue-rotate(-12deg) brightness(.95) sepia(.25) hue-rotate(170deg)'
/** 陽光照著：暖暖的、金金的，一次比一次暖 */
const warm = (k: number) => `sepia(${0.12 + 0.07 * k}) saturate(${1.15 + 0.1 * k}) brightness(${1.03 + 0.02 * k})`
/** 梯子（細高）：靠在雲的左邊，他站上去推 */
const LS = 40
const LADDER: Vec = { x: 77, y: 77 - 0.42 * LS }
const ON_LADDER: Vec = { x: 75, y: 51 - 0.42 * RS }
/** 扇子拿在手上（朝右） */
const FAN: Vec = { x: RX + 13, y: 48 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }
const empty = (): Gag => ({ moves: [], fx: [], camera: [], cues: [], lights: [] })

/**
 * 一圈會轉的光芒：用一段一段的線畫（錨在太陽身上，終點是舞台座標），每 STEP 秒換一組、角度往前轉一點，看起來就在轉。
 * n 條、從半徑 r0 伸到 r1；only 是只畫往上的那幾條（被雲遮住時露出來的光邊）。c 是太陽當下的中心、k 是太陽的倍率。
 */
const STEP = 0.08
const LIFE = 0.24
function rays(t0: number, t1: number, o: { n: number; r0: number; r1: number; w: number; color?: string; only?: [number, number]; c?: Vec; spin?: number }): Fx[] {
  const c = o.c ?? SUN
  const out: Fx[] = []
  for (let t = t0; t < t1 - 0.05; t += STEP) {
    const dur = Math.min(LIFE, t1 - t)
    for (let i = 0; i < o.n; i++) {
      const deg = (i * 360) / o.n + (o.spin ?? 45) * t
      const a = (((deg % 360) + 360) % 360) - 360 // -360～0：畫面上 y 往下，負角度是往上
      if (o.only && !(a > -o.only[1] && a < -o.only[0])) continue
      const rad = (a * Math.PI) / 180
      const cs = Math.cos(rad), sn = Math.sin(rad)
      // 往上的光芒伸到畫面頂端就停（不出界）
      const r1 = sn < 0 ? Math.min(o.r1, (c.y - 2) / -sn) : o.r1
      out.push({ at: t, dur, kind: 'line', actor: 'sun', dx: cs * o.r0, dy: sn * o.r0, to: { x: c.x + cs * r1, y: c.y + sn * r1 }, color: o.color ?? GOLD, width: o.w })
    }
  }
  return out
}

/**
 * 「叮」：太陽照下來。太陽一壓一亮、一圈光芒轉起來、陽光灑下來，花生閉眼舒服、變得暖暖的。
 * k 是第幾次（0～4，一次比一次亮、光芒越長越多），until 是光芒轉到什麼時候（下一片雲遮住）。
 */
function shine(at: number, k: number, until: number): Gag {
  const moves: Move[] = [
    { at, actor: 'sun', do: 'squash', amount: 0.2, dur: 0.25 },
    { at, actor: 'sun', do: 'flash', dur: 0.4 },
    { at: at + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
    { at: at + 0.05, actor: 'raccoon', do: 'tint', filter: warm(k) },
    { at: at + 0.05, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.25 },
  ]
  const fx: Fx[] = [
    // 光芒一次比一次多、一次比一次長
    ...rays(at, until, { n: 10 + Math.min(k, 3), r0: SR + 2.5, r1: SR + 8 + 2.2 * k, w: 1.5 + 0.25 * k }),
    // 陽光灑下來
    { at, dur: until - at, kind: 'beam', actor: 'sun', n: 70 + 12 * k },
    // 暖暖的，身邊冒金光
    { at: at + 0.1, kind: 'burst', actor: 'raccoon', emoji: '✨', n: 5 + k, dur: 0.5, dy: 4 },
  ]
  const lights: Light[] = [
    { at, dur: 0.08, level: -0.07 - 0.03 * Math.min(k, 3) },
    { at: at + 0.08, dur: 0.3, level: 0 },
  ]
  return { moves, fx, camera: [], cues: [{ at, sfx: 'clink' }], lights }
}

/**
 * 雲飄過來遮住太陽（at 是遮住那一刻）：畫面一暗、花生縮成一團發抖變藍；雲後面只露出太陽上緣的光邊。
 * k 是第幾片（0～3），prev 是上一片的倍率（在畫面外先換好大小），until 是光邊亮到什麼時候（雲被趕走）。
 */
function cover(at: number, k: number, prev: number, until: number): Gag {
  const p = coverAt(k)
  const moves: Move[] = [
    // 先在畫面外 pop 出來，再換圖、縮到這一片的大小（放大縮小要寫在 pop 之後，藏起來的時候寫的不算）
    { at: at - 0.56, actor: 'cloud', do: 'pop', dur: 0.01 },
    { at: at - 0.55, actor: 'cloud', do: 'swap', emoji: CLOUD[k] },
    { at: at - 0.55, actor: 'cloud', do: 'moveTo', to: { x: OFF_X, y: p.y }, dur: 0.01 },
    { at: at - 0.54, actor: 'cloud', do: 'scaleTo', amount: CLOUD_K[k] / prev, dur: 0.01 },
    { at: at - 0.5, actor: 'cloud', do: 'moveTo', to: p, dur: 0.5, ease: 'out' },
    // 遮住了：一暗，冷得縮成一團發抖
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/cold' },
    { at, actor: 'raccoon', do: 'tint', filter: COLD },
    { at, actor: 'raccoon', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.4 },
    { at, actor: 'cloud', do: 'squash', amount: 0.12, dur: 0.2 },
  ]
  const fx: Fx[] = [
    // 雲後面露出來的光邊（只剩往上的幾條，短短的）
    ...rays(at - 0.3, until, { n: 12, r0: SR + 1.5, r1: SR + 5, w: 1.3, color: GOLD_EDGE, only: [55, 125] }),
    { at: at + 0.05, kind: 'burst', actor: 'raccoon', emoji: '❄️', n: 4 + k, dur: 0.45, dy: 6 },
  ]
  const lights: Light[] = [{ at: at - 0.1, dur: 0.15, level: 0.3 + 0.1 * Math.min(k, 2) }]
  const camera: Camera[] = [
    { at, dur: 0.3, do: 'punch', amount: 0.03 + 0.015 * k, to: { x: RX + 10, y: 50 } },
    { at, dur: 0.25, do: 'shake', amount: 0.5 + 0.3 * k },
  ]
  return { moves, fx, camera, cues: [{ at: at - 0.5, sfx: 'slide' }, { at, sfx: 'deflate' }], lights }
}

/** 雲被趕走：往右上飛出畫面（at 是飛出去那一刻），一次比一次用力 */
function away(at: number, k: number): Gag {
  const p = coverAt(k)
  return {
    moves: [
      { at, actor: 'cloud', do: 'moveTo', to: { x: OFF_X + 10, y: p.y - 10 }, dur: 0.32, ease: 'in' },
      { at, actor: 'cloud', do: 'rotateTo', amount: 25 + 10 * k, dur: 0.32 },
      // 飛到畫面外就停在那裡（不 vanish：下一片雲很快就要 pop 出來，消失排在出現之後會整片看不見）
      { at: at + 0.33, actor: 'cloud', do: 'rotateTo', amount: -(25 + 10 * k), dur: 0.01 },
    ],
    fx: [{ at, kind: 'burst', x: p.x + 0.3 * CS * CLOUD_K[k], y: CLOUD_TOP + 8, emoji: '💨', n: 1, dur: 0.4, scale: 1.4 + 0.3 * k }],
    camera: [], lights: [],
    cues: [{ at, sfx: 'whoosh' }, { at: at + 0.12, sfx: 'poof' }],
  }
}

const merge = (...gs: Gag[]): Gag => gs.reduce((a, g) => ({
  moves: [...a.moves, ...g.moves], fx: [...a.fx, ...g.fx], camera: [...a.camera, ...g.camera], cues: [...a.cues, ...g.cues], lights: [...a.lights, ...g.lights],
}), empty())

// ---- 時間表 ----
/** 每一輪：照下來 S → 雲遮住 C（S + 0.75） → 趕雲 R → 雲飛走 E → 下一次照下來 E + 0.1 */
const S0 = 0.95
const C0 = S0 + 0.7
const R0 = C0 + 0.4
const E0 = R0 + 0.38
const S1 = E0 + 0.1
const C1 = S1 + 0.7
const R1 = C1 + 0.4
const E1 = R1 + 0.6
const S2 = E1 + 0.1
const C2 = S2 + 0.7
/** 第 3 次前停一拍：烏雲最大，他托著下巴發抖 */
const PONDER = C2 + 0.45
const R2 = PONDER + 0.45
const E2 = R2 + 0.7
const S3 = E2 + 0.1
/** 字框填滿、國字到正中央：太陽讓到右上角、花生讓到左邊 */
const HOME = S3 + 0.65
const PARK = HOME + 0.85
/** 語詞：太陽回到中間、光芒伸到最長——太陽 */
const WORD = PARK + 0.3
const WORD_K = 1.15
/** 回馬槍（第 4 次）：最大的烏雲遮住 → 太陽自己把雲彈飛 */
const C3 = WORD + 1.0
const BURST = C3 + 0.45
const SLEEP = BURST + 0.3
/** 問他 */
const ASK = SLEEP + 0.6
/** 被子掀開、他起來走到右前方（在 ask 暗下來之前走完，才不會從國字前面經過） */
const UP = ASK - 0.25
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
const ASK_AT: Vec = { x: 126, y: RY + 4 }
/** 國字回中央那一秒他讓到右邊、太陽底下（國字右緣約 x 113；讓到左邊的話，國字讓位到左上時會掃過他） */
const ASIDE: Vec = { x: 136, y: RY }
/** 字框：左上角（太陽在右上，背後是素色的天空） */
const FRAME: Vec = { x: 37, y: 22 }
const FRAME_K = 0.5

const g0 = merge(shine(S0, 0, C0 - 0.3), cover(C0, 0, 1, E0), away(E0, 0))
const g1 = merge(shine(S1, 1, C1 - 0.3), cover(C1, 1, CLOUD_K[0], E1), away(E1, 1))
const g2 = merge(shine(S2, 2, C2 - 0.3), cover(C2, 2, CLOUD_K[1], E2), away(E2, 2))
const g3 = shine(S3, 3, HOME - 0.1)
const g4 = merge(cover(C3, 3, CLOUD_K[2], BURST), shine(BURST, 4, ASK - 0.38))

/** 趕雲的三種方法（一次比一次費力） */
const blowAway: Gag = {
  moves: [
    { at: R0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/blow' },
    { at: R0, actor: 'raccoon', do: 'tint', filter: '' },
    { at: R0, actor: 'raccoon', do: 'squash', amount: -0.1, dur: 0.2 },
    { at: R0 + 0.2, actor: 'cloud', do: 'squash', amount: 0.15, dur: 0.18 },
  ],
  fx: [
    { at: R0 + 0.05, dur: 0.35, kind: 'blow', actor: 'raccoon', to: { x: SUN.x - 6, y: 32 }, dx: 6, dy: 8, n: 5, scale: 1.4 },
    { at: R0 + 0.08, dur: 0.3, kind: 'line', actor: 'raccoon', dx: 8, dy: -8, to: { x: SUN.x - 8, y: 30 }, color: '#FFFFFF', width: 1.2 },
    { at: R0 + 0.12, dur: 0.28, kind: 'line', actor: 'raccoon', dx: 8, dy: -5, to: { x: SUN.x - 8, y: 35 }, color: '#FFFFFF', width: 1.2 },
  ],
  camera: [], lights: [], cues: [{ at: R0 + 0.05, sfx: 'whoosh' }],
}
const fanAway: Gag = {
  moves: [
    { at: R1 - 0.01, actor: 'fan', do: 'moveTo', to: FAN, dur: 0.01 },
    { at: R1, actor: 'fan', do: 'pop', dur: 0.15 },
    { at: R1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/push' },
    { at: R1, actor: 'raccoon', do: 'tint', filter: '' },
    { at: R1 + 0.1, actor: 'fan', do: 'tilt', amount: 35, times: 3, dur: 0.5 },
    { at: R1 + 0.1, actor: 'raccoon', do: 'shake', amount: 1, dur: 0.5 },
    { at: R1 + 0.25, actor: 'cloud', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: E1 + 0.3, actor: 'fan', do: 'vanish', dur: 0.2 },
  ],
  fx: [
    { at: R1 + 0.1, dur: 0.5, kind: 'blow', actor: 'fan', to: { x: SUN.x - 6, y: 32 }, dx: 2, dy: 6, n: 8, scale: 1.8 },
    ...[0, 1, 2].map((i): Fx => ({ at: R1 + 0.12 + 0.12 * i, dur: 0.3, kind: 'line', actor: 'fan', dx: 6, dy: -3 + 4 * i, to: { x: SUN.x - 10, y: 26 + 6 * i }, color: '#FFFFFF', width: 1.6 })),
  ],
  camera: [{ at: E1, dur: 0.3, do: 'shake', amount: 1 }],
  lights: [], cues: [{ at: R1 + 0.1, sfx: 'whoosh' }, { at: R1 + 0.35, sfx: 'whoosh' }],
}
const ladderAway: Gag = {
  moves: [
    // 停一拍：托著下巴、看著烏雲發抖
    { at: PONDER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: PONDER, actor: 'raccoon', do: 'tilt', amount: 8, dur: 0.4 },
    // 梯子從天上掉下來靠在雲旁邊，他跳上去用力推
    { at: R2 - 0.15, actor: 'ladder', do: 'drop', dur: 0.25 },
    { at: R2 + 0.12, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/jump' },
    { at: R2 + 0.12, actor: 'raccoon', do: 'moveTo', to: ON_LADDER, arc: 8, dur: 0.3 },
    { at: R2 + 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/push' },
    { at: R2 + 0.45, actor: 'raccoon', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: R2 + 0.5, actor: 'cloud', do: 'squash', amount: 0.2, dur: 0.2 },
    // 雲飛走後跳回地上，梯子收走
    { at: E2 + 0.15, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: RY }, arc: 6, dur: 0.3 },
    { at: E2 + 0.2, actor: 'ladder', do: 'vanish', dur: 0.2 },
  ],
  fx: [
    { at: R2 + 0.5, kind: 'burst', x: 92, y: 40, emoji: '💥', n: 1, dur: 0.4, scale: 1.4 },
    { at: PONDER + 0.1, kind: 'sweat', actor: 'raccoon', dx: -8 },
  ],
  camera: [{ at: R2 + 0.5, dur: 0.35, do: 'shake', amount: 1.6 }],
  lights: [], cues: [{ at: R2 + 0.08, sfx: 'bonk' }, { at: R2 + 0.5, sfx: 'boing' }],
}

const builds: Build[] = [
  // 小白雲吹走、太陽再照下來：阝
  { at: S1 + 0.1, dur: 0.5, strokes: [0, 1], from: 'sun', color: partColor('阝') },
  // 大灰雲搧走：日
  { at: S2 + 0.1, dur: 0.5, strokes: [2, 3, 4, 5], from: 'sun', color: partColor('昜') },
  // 烏雲推走：一＋勿
  { at: S3 + 0.1, dur: 0.5, strokes: [6, 7, 8, 9, 10], from: 'sun', color: partColor('昜') },
]

const WORD_C: Vec = SUN
const clip: Clip = {
  format: 2,
  char: '陽',
  meta: { theme: '曬太陽被雲遮住', cast: '浣熊花生＋大太陽＋雲（小白雲、大灰雲、烏雲）＋扇子、梯子', gags: ['浣熊花生曬太陽，太陽「叮」地一照、光芒轉起來、暖暖的金光灑下來，他舒服地閉眼，一朵雲就飄過來把太陽遮住，畫面一暗、他冷得縮成一團發抖；他把雲趕走、太陽又照下來一次比一次亮，雲卻一次比一次大（吹一口氣吹走小白雲→拿扇子猛搧大灰雲→停一拍托下巴發抖，搬梯子爬上去推走一整片烏雲）；回馬槍是最大的烏雲又來了、他累得不想趕，這次太陽自己一鼓，光芒「啪」地穿過雲把它彈飛，還把陽光鋪在他身上當被子'] },
  duration: 15,
  bg: { top: '#8FD0FA', bottom: '#F4FBFF', floor: '#9ED67E', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '🌞', x: SUN.x, y: SUN.y, size: SS, float: true },
    { id: 'ladder', emoji: 'prop:ladder', x: LADDER.x, y: LADDER.y, size: LS, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: RX, y: RY, size: RS, flip: true },
    { id: 'fan', emoji: '🪭', x: FAN.x, y: FAN.y, size: 16, hidden: true, float: true },
    { id: 'cloud', emoji: CLOUD[0], x: OFF_X, y: coverAt(0).y, size: CS, float: true, hidden: true },
  ],
  moves: [
    // 開場：從左邊走進來，回頭指著左上的字框「陽！」，再轉回去對著太陽
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -20, y: RY }, dur: 0.5, ease: 'out' },
    { at: 0.52, actor: 'raccoon', do: 'flip' },
    { at: 0.52, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 0.88, actor: 'raccoon', do: 'flip' },
    { at: 0.88, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    ...g0.moves,
    ...blowAway.moves,
    ...g1.moves,
    ...fanAway.moves,
    ...g2.moves,
    ...ladderAway.moves,
    ...g3.moves,
    // 國字回中央：太陽讓到右上角、花生讓到左邊
    { at: HOME - 0.1, actor: 'sun', do: 'moveTo', to: SUN_ASIDE, dur: 0.35 },
    { at: HOME - 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: HOME - 0.1, actor: 'raccoon', do: 'moveTo', to: ASIDE, dur: 0.35 },
    { at: HOME + 0.27, actor: 'raccoon', do: 'flip' },
    { at: HOME + 0.27, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 國字讓位：太陽回到中間、花生走回來
    { at: PARK, actor: 'sun', do: 'moveTo', to: SUN, dur: 0.3 },
    { at: PARK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: PARK, actor: 'raccoon', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.3 },
    { at: WORD, actor: 'raccoon', do: 'flip' },
    // 語詞：太陽放大、光芒伸到最長，他指著它——太陽
    { at: WORD, actor: 'sun', do: 'scaleTo', amount: WORD_K, dur: 0.25, ease: 'back' },
    { at: WORD, actor: 'sun', do: 'flash', dur: 0.4 },
    { at: WORD, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: WORD, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.3 },
    { at: C3 - 0.45, actor: 'sun', do: 'scaleTo', amount: 1 / WORD_K, dur: 0.25 },
    { at: C3 - 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/smug' },
    // 回馬槍：最大的烏雲又來了，他累得垮下來
    ...g4.moves,
    { at: C3 + 0.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/tired' },
    // 太陽自己在雲後面一鼓——光芒「啪」地穿過雲，把雲彈飛
    { at: C3 + 0.2, actor: 'sun', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: BURST - 0.15, actor: 'sun', do: 'squash', amount: -0.2, dur: 0.15 },
    { at: BURST, actor: 'cloud', do: 'moveTo', to: { x: OFF_X + 20, y: coverAt(3).y - 30 }, dur: 0.35, ease: 'out' },
    { at: BURST, actor: 'cloud', do: 'rotateTo', amount: 400, dur: 0.35 },
    { at: BURST + 0.36, actor: 'cloud', do: 'vanish', dur: 0.01 },
    // 陽光被子：他躺下來，金光蓋在身上
    { at: SLEEP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/sleep' },
    // 問他：太陽先「咻」地回天上去，他站起來、變大
    { at: ASK - 0.35, actor: 'sun', do: 'moveTo', to: { x: 185, y: -25 }, dur: 0.3, ease: 'in' },
    { at: UP, actor: 'raccoon', do: 'tint', filter: '' },
    { at: UP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: UP, actor: 'raccoon', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: UP + 0.31, actor: 'raccoon', do: 'flip' },
    { at: UP + 0.31, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK + 0.1, actor: 'raccoon', do: 'scaleTo', amount: 1.25, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: ASK_SAY + 1.0, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.27, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'raccoon', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.22, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框放在左上角
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的他
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 64, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g0.fx,
    ...blowAway.fx,
    ...g1.fx,
    ...fanAway.fx,
    ...g2.fx,
    ...ladderAway.fx,
    ...g3.fx,
    // 語詞：光芒伸到最長、轉得最快
    ...rays(WORD, C3 - 0.45, { n: 14, r0: SR * WORD_K + 2.5, r1: SR * WORD_K + 16, w: 2.4, c: WORD_C, spin: 70 }),
    { at: WORD, dur: C3 - 0.45 - WORD, kind: 'beam', actor: 'sun', n: 110 },
    // 回馬槍：太陽一鼓，光芒穿過雲「啪」地伸到最長
    ...g4.fx,
    ...rays(BURST, BURST + 0.35, { n: 16, r0: SR + 2, r1: SR + 26, w: 3.2, spin: 90 }),
    { at: BURST, kind: 'burst', x: SUN.x + 26, y: 22, emoji: '💥', n: 1, dur: 0.45, scale: 2.2 },
    // 陽光被子：一條厚厚的金光蓋在他身上
    { at: SLEEP + 0.05, dur: UP - SLEEP - 0.05, kind: 'line', actor: 'raccoon', dx: -13, dy: 10, to: { x: RX + 14, y: RY + 6 }, color: '#FFC83A', width: 6 },
    { at: SLEEP + 0.1, dur: UP - SLEEP - 0.1, kind: 'zzz', actor: 'raccoon', dx: 6, dy: 8 },
    { at: ANSWER, kind: 'burst', x: 64, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把右上的太陽、雲切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g0.camera,
    ...g1.camera,
    ...fanAway.camera,
    ...g2.camera,
    ...ladderAway.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.06, to: { x: 100, y: 45 } },
    ...g4.camera,
    { at: BURST, dur: 0.45, do: 'punch', amount: 0.08, to: { x: 100, y: 40 } },
    { at: BURST, dur: 0.4, do: 'shake', amount: 2.2 },
  ],
  lights: [
    ...g0.lights,
    ...g1.lights,
    ...g2.lights,
    ...g3.lights,
    { at: HOME, dur: 0.05, level: -0.2 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...g4.lights,
  ].sort((a, b) => a.at - b.at),
  cues: [
    { at: 0.55, say: '陽' },
    ...g0.cues,
    ...blowAway.cues,
    ...g1.cues,
    ...fanAway.cues,
    ...g2.cues,
    ...ladderAway.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '陽' },
    { at: WORD, say: '太陽' },
    { at: WORD, sfx: 'clink' },
    ...g4.cues,
    { at: BURST, sfx: 'boing' },
    { at: BURST + 0.05, sfx: 'whoosh' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '陽' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
