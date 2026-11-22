// 演的是字面意思：名（太有名）＋偵探——太有名的偵探，一舉起放大鏡要辦案，粉絲就衝過來拍照，害他沒辦法辦案（沒有大眼鏡、紅領結、藍西裝、小孩，沒有手錶、麻醉針、變聲器、滑板、足球，也不指著鏡頭）。
import type { Camera, Cue, Fx, Light, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：名偵探一舉起放大鏡要找線索，粉絲就衝過來「喀嚓」拍照，他忍不住擺 pose，小偷就趁機從他背後溜過去。
// 同一個動作（彎腰舉放大鏡 → 小雞粉絲衝過來 → 舉相機、白光一閃、喀嚓 → 他立刻舉著放大鏡擺 pose → 小刺蝟踮腳從他背後溜過去），
// 做三次：粉絲 1 隻 → 3 隻 → 一大群；小偷背的東西 王冠 → 錢袋 → 比他還大的鑽石。
// 第三次前停一拍：他抱胸斜眼盯著粉絲來的那邊，樹叢後面冒出一顆大鑽石。
// 反轉：這次小偷等不及先溜出來，一大群一起按快門，超大的閃光把站在他背後的小偷照得清清楚楚——小偷嚇得定住，
// 鑽石滑下來砸在地上、他頭昏；偵探轉身一看，拿放大鏡湊過去，再舉著放大鏡擺 pose：「名偵探柯南」。
// 主角用豬探長（自家的偵探：格子獵帽、風衣，舉放大鏡、擺 pose、嚇一跳的姿勢都有）。

// ── 站位 ──
const H = 36 // 豬探長
const HY = 77 - 0.42 * H
const HX = 64 // 辦案時站的地方
/** 放大鏡（🔍 size GS）拿在手上的位置：揮手的那隻手（量過），flip＝面向右 */
const GS = 13
const glassAt = (x: number, faceRight: boolean) => ({ x: x + (faceRight ? 14 : -14), y: HY - 11.5 })
const walkGlass = (x: number) => ({ x: x + 15, y: HY - 2.5 })
// 小雞粉絲
const FS = 12
const FY = 77 - 0.42 * FS
const FANS = ['🐥', '🐤', '🐥', '🐤', '🐥', '🐤', '🐥', '🐤', '🐥']
const OFF = 178 // 粉絲從右邊畫面外衝進來
/** 每一次站到哪裡（前排 x、後排 x 往後退一點） */
const SPOTS: { x: number; y: number }[][] = [
  [{ x: 88, y: FY }],
  [{ x: 84, y: FY }, { x: 96, y: FY }, { x: 108, y: FY }],
  [
    { x: 80, y: FY }, { x: 91, y: FY }, { x: 102, y: FY }, { x: 113, y: FY }, { x: 124, y: FY },
    { x: 86, y: FY - 3 }, { x: 97, y: FY - 3 }, { x: 108, y: FY - 3 }, { x: 119, y: FY - 3 },
  ],
]
// 小偷：刺蝟（站得比大家後面一點），從左邊樹叢溜到右邊樹叢
const TS = 22
const TY = 77 - 0.42 * TS - 2
const LX = 24 // 左邊樹叢
const RX = 136 // 右邊樹叢
const LOOT = [
  { id: 'crown', emoji: '👑', s: 12 },
  { id: 'bag', emoji: '💰', s: 16 },
  { id: 'gem', emoji: '💎', s: 26 },
]
const lootY = (s: number) => TY - 9 - 0.38 * s
const CAUGHT = 38 // 第三次被照到時站的地方
const FLAT = 1.3 // 被鑽石壓扁（變寬變矮）
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 小偷踮腳走：刺蝟和背上的東西一起移動，一小步一小步地顛 */
function sneak(at: number, x0: number, x1: number, dur: number, loot: string, ls: number): Move[] {
  const moves: Move[] = [
    { at, actor: 'thief', do: 'moveTo', to: { x: x1, y: TY }, dur, ease: 'linear' },
    { at, actor: loot, do: 'moveTo', to: { x: x1 + 2, y: lootY(ls) }, dur, ease: 'linear' },
  ]
  const steps = Math.max(2, Math.round(Math.abs(x1 - x0) / 14))
  for (let i = 0; i < steps; i++) {
    const t = at + (i * dur) / steps
    moves.push(
      { at: t, actor: 'thief', do: 'hop', amount: 2, dur: dur / steps },
      { at: t, actor: loot, do: 'hop', amount: 2, dur: dur / steps },
    )
  }
  return moves
}

/**
 * 主軸：彎腰舉放大鏡 → 粉絲衝過來圍住 → 舉相機、白光一閃、喀嚓 → 他舉放大鏡擺 pose。
 * P＝舉放大鏡那一刻，k＝第幾次。回傳 flash＝閃光那一刻、end＝粉絲散開。
 */
function fame(P: number, k: number) {
  const spots = SPOTS[k]
  const rush = P + 0.25
  const flash = P + 0.85 + 0.1 * k
  const fans = spots.map((_, i) => `f${i}`)
  const moves: Move[] = [
    // 彎腰舉放大鏡（姿勢自己拿著放大鏡，手上那支先收起來）
    { at: P, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: P, actor: 'glass', do: 'vanish', dur: 0.05 },
    { at: P + 0.05, actor: 'pig', do: 'hop', amount: -1.5, dur: 0.3 },
    // 擺 pose：舉著放大鏡、揮手
    { at: flash, actor: 'pig', do: 'swap', emoji: 'hero:pig/wave' },
    { at: flash, actor: 'glass', do: 'moveTo', to: glassAt(HX, true), dur: 0 },
    { at: flash, actor: 'glass', do: 'pop', dur: 0.2 },
    { at: flash + 0.05, actor: 'pig', do: 'hop', amount: 3 + k, dur: 0.3 },
    { at: flash + 0.05, actor: 'glass', do: 'hop', amount: 3 + k, dur: 0.3 },
  ]
  spots.forEach((s, i) => {
    const id = fans[i]
    const d = (i % 5) * 0.05 + (i >= 5 ? 0.08 : 0)
    moves.push(
      { at: rush + d, actor: id, do: 'moveTo', to: s, arc: 5, dur: 0.4, ease: 'out' },
      // 舉相機：跳起來
      { at: flash - 0.2 + (i % 3) * 0.03, actor: id, do: 'hop', amount: 4, dur: 0.35 },
    )
  })
  const fx: Fx[] = [
    { at: rush + 0.25, kind: 'puff', actor: fans[0], n: 4 + 3 * k, dur: 0.5 },
    // 喀嚓：白光＋每隻小雞頭上一台相機
    ...spots.map((_, i): Fx => ({ at: flash - 0.12, kind: 'pop', actor: fans[i], emoji: '📷', dur: 0.55, scale: 1.2 })),
    { at: flash, kind: 'burst', actor: 'pig', emoji: '✨', n: 6 + 3 * k, dy: -12, dur: 0.6, scale: 1.2 + 0.1 * k },
  ]
  const camera: Camera[] = [
    { at: flash, dur: 0.35, do: 'punch', amount: 0.05 + 0.01 * k, to: { x: HX, y: 52 } },
    { at: flash, dur: 0.25, do: 'shake', amount: 0.4 + 0.3 * k },
  ]
  const lights: Light[] = [
    { at: flash, dur: 0.04, level: [-0.12, -0.18, -0.25][k] },
    { at: flash + 0.04, dur: 0.3, level: 0 },
  ]
  // 同一串音效，一次比一次多一聲
  const cues: Cue[] = [{ at: P, sfx: 'tap' }, { at: rush, sfx: 'whoosh' }, { at: flash, sfx: 'blip' }]
  if (k >= 1) cues.push({ at: rush + 0.1, sfx: 'cheer' }, { at: flash + 0.1, sfx: 'blip' })
  if (k >= 2) cues.push({ at: rush, sfx: 'rumble' }, { at: flash + 0.2, sfx: 'blip' })
  return { moves, fx, camera, lights, cues, flash, end: flash + 1.45, fans }
}

/** 粉絲拍完照開心地跑走（下一次再從右邊衝進來） */
const leave = (at: number, fans: string[]): Move[] => fans.flatMap((id, i): Move[] => [
  { at: at + i * 0.05, actor: id, do: 'flip' },
  { at: at + i * 0.05, actor: id, do: 'moveTo', to: { x: OFF, y: FY }, dur: 0.45, ease: 'in' },
  { at: at + 0.6, actor: id, do: 'flip' },
])

// ── 時間表 ──
const P1 = 0.7
const b1 = fame(P1, 0)
const P2 = b1.end + 0.25
const b2 = fame(P2, 1)
const DOUBT = b2.end + 0.2 // 停一拍：他抱胸斜眼盯著粉絲來的那邊
const PEEK = DOUBT + 0.25 // 樹叢後面冒出一顆大鑽石
const P3 = DOUBT + 0.8
const b3 = fame(P3, 2)
const F3 = b3.flash
const SLIP = F3 + 0.55 // 鑽石滑下來
const THUD = SLIP + 0.3
const TURN = F3 + 0.8 // 他轉身
const LOOK = TURN + 0.5 // 拿放大鏡湊過去
const POSE = LOOK + 0.6 // 亮相
const END = POSE + 1.9 // 名字要唸 1.2 秒，唸完再停一下
const PX = HX // 亮相時站的地方（不往前擠，小偷的臉要露出來）

export default scene({
  duration: Math.round(END * 10) / 10,
  bg: { top: '#7FCBF2', bottom: '#E8F6FF', floor: '#E3CFA9', scenery: 'city' },
  actors: [
    // 噴水池（背景）：寬扁的水池＋一直噴的水
    { id: 'pool', emoji: '🔵', x: 104, y: 77 - 0.42 * 12 - 3, size: 12, float: true },
    { id: 'crown', emoji: LOOT[0].emoji, x: LX + 2, y: lootY(LOOT[0].s), size: LOOT[0].s, float: true, hidden: true },
    { id: 'bag', emoji: LOOT[1].emoji, x: LX + 2, y: lootY(LOOT[1].s), size: LOOT[1].s, float: true, hidden: true },
    { id: 'clue', emoji: '👣', x: 86, y: 74.5, size: 8, float: true },
    { id: 'gem', emoji: LOOT[2].emoji, x: LX + 2, y: lootY(LOOT[2].s) + 14, size: LOOT[2].s, float: true, hidden: true, pivot: 'center' },
    { id: 'thief', emoji: '🦔', x: LX, y: TY, size: TS, flip: true },
    { id: 'pig', emoji: 'hero:pig/walk', x: HX, y: HY, size: H, flip: true },
    { id: 'glass', emoji: '🔍', x: walkGlass(HX).x, y: walkGlass(HX).y, size: GS, float: true, flip: true },
    ...FANS.map((e, i) => ({ id: `f${i}`, emoji: e, x: OFF, y: i >= 5 ? FY - 3 : FY, size: FS })),
    { id: 'bushL', emoji: 'prop:bush', x: LX - 2, y: 77 - 0.42 * 26, size: 26 },
    { id: 'bushR', emoji: 'prop:bush', x: RX + 2, y: 77 - 0.42 * 26, size: 26, flip: true },
  ],
  moves: [
    { at: 0, dur: 0, actor: 'pool', do: 'stretchTo', amount: 2.6 },
    // 開場：神氣地走進廣場
    { at: 0, actor: 'pig', do: 'enter', from: { x: HX - 24, y: HY }, dur: 0.6, ease: 'out' },
    { at: 0, actor: 'glass', do: 'enter', from: { x: walkGlass(HX - 24).x, y: walkGlass(HX - 24).y }, dur: 0.6, ease: 'out' },
    // 第一次：1 隻粉絲，小偷背著王冠溜過去
    ...b1.moves,
    { at: b1.flash, actor: 'crown', do: 'pop', dur: 0.15 },
    ...sneak(b1.flash + 0.1, LX, RX, 1.3, 'crown', LOOT[0].s),
    ...leave(b1.end, b1.fans),
    { at: b1.end, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: b1.end, actor: 'glass', do: 'vanish', dur: 0.1 },
    { at: b1.end, actor: 'crown', do: 'vanish', dur: 0.15 },
    { at: b1.end + 0.2, actor: 'thief', do: 'moveTo', to: { x: LX, y: TY }, dur: 0 },
    // 第二次：3 隻粉絲，錢袋
    ...b2.moves,
    { at: b2.flash, actor: 'bag', do: 'pop', dur: 0.15 },
    ...sneak(b2.flash + 0.1, LX, RX, 1.3, 'bag', LOOT[1].s),
    ...leave(b2.end, b2.fans),
    { at: b2.end, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: b2.end, actor: 'glass', do: 'vanish', dur: 0.1 },
    { at: b2.end, actor: 'bag', do: 'vanish', dur: 0.15 },
    { at: b2.end + 0.2, actor: 'thief', do: 'moveTo', to: { x: LX, y: TY }, dur: 0 },
    // 停一拍：他抱胸斜眼盯著右邊——樹叢後面冒出一顆大鑽石
    { at: DOUBT, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: PEEK, actor: 'gem', do: 'pop', dur: 0.3 },
    { at: PEEK, actor: 'gem', do: 'moveTo', to: { x: LX + 2, y: lootY(LOOT[2].s) }, dur: 0.35, ease: 'back' },
    // 第三次：一大群；小偷等不及，先溜出來
    ...b3.moves,
    ...sneak(P3 + 0.15, LX, CAUGHT, F3 - P3 - 0.2, 'gem', LOOT[2].s),
    // 反轉：超大的閃光把他照得清清楚楚——嚇得定住
    { at: F3 + 0.05, actor: 'thief', do: 'shake', amount: 0.7, dur: 0.5 },
    { at: F3 + 0.05, actor: 'gem', do: 'shake', amount: 0.7, dur: 0.5 },
    // 腿一軟，背上的大鑽石「咚」地壓下來，把他壓扁（臉還露在外面）
    { at: SLIP, actor: 'gem', do: 'hop', amount: 4, dur: 0.3 },
    { at: THUD, actor: 'thief', do: 'stretchTo', amount: FLAT, dur: 0.15, ease: 'out' },
    { at: THUD, actor: 'gem', do: 'moveTo', to: { x: CAUGHT + 2, y: lootY(LOOT[2].s) + 4.5 }, dur: 0.15, ease: 'in' },
    { at: THUD, actor: 'gem', do: 'rotateTo', amount: -12, dur: 0.2 },
    { at: THUD + 0.15, actor: 'gem', do: 'squash', amount: 0.12, dur: 0.25 },
    // 偵探轉身一看
    { at: TURN, actor: 'pig', do: 'flip' },
    { at: TURN, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: TURN, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
    { at: TURN, actor: 'glass', do: 'vanish', dur: 0.05 },
    { at: TURN, actor: 'glass', do: 'flip' },
    // 拿放大鏡湊過去看
    { at: LOOK, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: LOOK, actor: 'pig', do: 'hop', amount: -1.5, dur: 0.4 },
    // 亮相：舉著放大鏡擺 pose
    { at: POSE, actor: 'pig', do: 'swap', emoji: 'hero:pig/wave' },
    { at: POSE, actor: 'glass', do: 'moveTo', to: glassAt(PX, false), dur: 0 },
    { at: POSE, actor: 'glass', do: 'pop', dur: 0.25 },
    { at: POSE + 0.05, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
    { at: POSE + 0.05, actor: 'glass', do: 'hop', amount: 4, dur: 0.35 },
    ...b3.fans.map((id, i): Move => ({ at: POSE + 0.1 + (i % 4) * 0.06, actor: id, do: 'hop', amount: 4, dur: 0.35 })),
  ],
  fx: [
    // 噴水池一直噴
    ...Array.from({ length: 14 }, (_, i): Fx => ({ at: i * 0.8, kind: 'fountain', x: 104, y: 64, emoji: '💧', n: 7, dur: 1.1 })),
    ...b1.fx,
    ...b2.fx,
    ...b3.fx,
    // 反轉：小偷被照到
    // 閃光從相機打到他身上，照得清清楚楚
    ...['f0', 'f5', 'f1'].map((id): Fx => ({ at: F3, kind: 'line', actor: id, target: 'thief', color: '#FFF8C8', width: 2.2, dur: 0.35 })),
    { at: F3 + 0.02, kind: 'burst', actor: 'thief', emoji: '✨', n: 8, dy: 2, dur: 0.6, scale: 1.3 },
    { at: F3 + 0.1, kind: 'sweat', actor: 'thief', dur: 0.7 },
    { at: F3 + 0.45, kind: 'pop', actor: 'f0', emoji: '📷', dur: 0.5, scale: 1.2 },
    { at: F3 + 0.5, kind: 'pop', actor: 'f5', emoji: '📷', dur: 0.5, scale: 1.2 },
    { at: THUD, kind: 'burst', actor: 'gem', emoji: '💥', n: 1, dur: 0.4, scale: 1.3 },
    { at: THUD + 0.05, kind: 'puff', actor: 'thief', n: 8, dur: 0.5 },
    { at: THUD + 0.2, kind: 'dizzy', actor: 'thief', dur: END - THUD },
    { at: LOOK + 0.25, kind: 'burst', actor: 'thief', emoji: '✨', n: 6, dy: -4, dur: 0.5 },
    // 亮相
    { at: POSE, kind: 'burst', actor: 'pig', emoji: '✨', n: 10, dy: -12, dur: 1.0, scale: 1.4 },
    { at: POSE + 0.3, kind: 'burst', actor: 'pig', emoji: '🎉', n: 7, dy: -14, dur: 0.9, scale: 1.3 },
    ...[0, 2, 4, 6].map((i): Fx => ({ at: POSE + 0.15, kind: 'pop', actor: `f${i}`, emoji: '📷', dur: 0.5, scale: 1.2 })),
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.3, to: look(80, 50, 1.3) },
    ...b1.camera,
    ...b2.camera,
    // 停一拍：看樹叢後面的大鑽石
    { at: DOUBT, dur: 0.5, do: 'zoom', amount: 1.35, to: look(66, 50, 1.35) },
    // 一大群：拉開一點
    { at: P3 + 0.2, dur: 0.5, do: 'zoom', amount: 1.2, to: look(80, 48, 1.2) },
    ...b3.camera,
    { at: THUD, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: TURN, dur: 0.35, do: 'punch', amount: 0.06, to: { x: HX, y: 52 } },
    // 亮相：推近偵探和小偷
    { at: LOOK, dur: 0.6, do: 'zoom', amount: 1.55, to: look(58, 54, 1.55) },
  ],
  lights: [
    ...b1.lights,
    ...b2.lights,
    ...b3.lights,
    { at: F3 + 0.5, dur: 0.04, level: -0.12 },
    { at: F3 + 0.54, dur: 0.25, level: 0 },
    { at: POSE + 0.15, dur: 0.04, level: -0.15 },
    { at: POSE + 0.19, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    ...b1.cues,
    { at: b1.flash + 0.4, sfx: 'slide' },
    ...b2.cues,
    { at: b2.flash + 0.4, sfx: 'slide' },
    { at: PEEK, sfx: 'clink' },
    ...b3.cues,
    { at: F3 + 0.15, sfx: 'boing' },
    { at: F3 + 0.5, sfx: 'blip' },
    { at: THUD, sfx: 'bonk' },
    { at: TURN, sfx: 'whoosh' },
    { at: LOOK + 0.25, sfx: 'clink' },
    { at: POSE + 0.05, sfx: 'cheer' },
    { at: POSE + 0.1, say: '名偵探柯南' },
  ],
})
