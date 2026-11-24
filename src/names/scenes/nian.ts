// 演的是本尊：過年的年獸——除夕夜跑來嚇人的怪獸，最怕紅色和鞭炮的聲音；搞笑版，兇得很好笑、其實很膽小，不演吃人。造型照 prop:nian 那一套（藍綠色長毛、黃鬃毛、頭上一支金角），不照任何改編作品。
import type { Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：年獸想嚇人，可是他一吼，就冒出紅色或很吵的東西反過來把他自己嚇到，一次比一次慘。
// 同一個吸氣、同一聲吼（一圈一圈的黃色聲波）、同一聲「噗」冒出紅色的東西、同一個「愣住一下 → 嚇得彈起來往後退」，
// 三次只有東西越來越大、他嚇得越來越慘：小孩舉起一個小紅包（彈一下、退一步）→ 門口的紅燈籠「啪」地亮起來
// （跳更高、落地縮成一團摀耳朵、退更遠）→ 停一拍（他走回來、深吸一口氣整隻鼓起來）——吼到最大，小孩把一串鞭炮丟到他腳邊，
// 劈哩啪啦，他跳到最高、摀著耳朵發抖，哭著逃跑，來回亂竄「咚」撞上大鼓，坐地頭暈。
// 反轉：小孩沒有趕他，端來一盤餃子，他抱著吃得好幸福；小孩把紅圍巾丟到他脖子上——他看到紅色，僵住……
// 然後開心地站起來跳舞：「年獸」。
const S = 48 // 年獸的 size（prop 圖留白多，要比小孩大很多，鏡頭再推近補）
const G = 77 - 0.42 * S // 年獸站在地上的 y
const TX = 108 // 年獸一開始站的地方
const K = 24 // 小孩的 size
const KG = 77 - 0.42 * K
const KX = 54 // 小孩站在門口
const DRUM = { x: 148, size: 17 }
const LAN = { x: 43, y: 43 } // 掛在屋簷下的紅燈籠
const FC = { x: 108, y: 72 } // 鞭炮落在他腳邊
const SIT = 122 // 撞到鼓、坐下來頭暈的地方
const KX2 = 96 // 小孩端餃子走過去站的地方
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡（引擎還會再夾在背景裡） */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })
/** 吼的那張圖，嘴巴在（u 0.36、v 0.66）：朝左站在 x 時嘴巴的位置 */
const mouth = (x: number): Vec => ({ x: x - 0.14 * S, y: G + 0.16 * S })
const RING = '#FFD23A' // 聲波（紫色夜空上看得清楚）
// 紅色的東西在夜色裡要亮：金色描邊＋光暈
const GLOW = 'saturate(1.2) drop-shadow(0 0 1px #FFF6C8) drop-shadow(0 0 3px #FFC83A)'
const LAN_OFF = 'brightness(.7) saturate(.6)'
const LAN_ON = 'brightness(1.25) saturate(1.3) drop-shadow(0 0 2px #FFE08A) drop-shadow(0 0 6px #FF3B2E) drop-shadow(0 0 10px #FF5A2E)'

/** 聲波：以嘴巴為中心、一圈一圈往左的「(」弧，一圈比一圈晚一點出來 */
function rings(at: number, c: Vec, radii: number[], width: number, dur: number): Fx[] {
  const fx: Fx[] = []
  radii.forEach((r, i) => {
    const t = at + i * 0.06
    const w = width * (1 - 0.3 * (i / Math.max(1, radii.length - 1)))
    for (const low of [false, true]) {
      fx.push({ at: t, dur, kind: 'swoosh', x: c.x, y: c.y, to: { x: c.x - 200, y: c.y }, n: r, sweep: -25, low, width: w, color: RING })
    }
  })
  return fx
}

/**
 * 主軸笑點的前半：吸氣（拉長）→ 吼（壓扁一下、抖、聲波打出去）→ 吼完愣住（還張著嘴）。
 * k 是第幾次（0、1、2），x 是他站的地方，p 是吼的那一刻，hold 是嘴張著多久。
 */
function roar(p: number, k: number, x: number, hold: number) {
  const moves: Move[] = [
    { at: p - 0.3, actor: 'nian', do: 'squash', amount: -0.1 - 0.05 * k, dur: 0.3 },
    { at: p, actor: 'nian', do: 'swap', emoji: 'prop:nian-roar' },
    { at: p, actor: 'nian', do: 'squash', amount: 0.12 + 0.05 * k, dur: 0.22 },
    { at: p + 0.05, actor: 'nian', do: 'shake', amount: 0.5 + 0.4 * k, dur: Math.min(hold - 0.1, 0.5 + 0.15 * k) },
  ]
  const radii = [[6, 11, 16], [6, 12, 18, 24], [7, 14, 21, 28, 35]][k]
  const fx: Fx[] = rings(p + 0.02, mouth(x), radii, 2 + 0.6 * k, 0.45 + 0.1 * k)
  const camera: Camera[] = [
    { at: p, dur: 0.35, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: x - 4, y: G } },
    { at: p + 0.02, dur: 0.35 + 0.1 * k, do: 'shake', amount: 0.4 + 0.35 * k },
  ]
  const cues: Cue[] = [{ at: p, sfx: 'rumble' }]
  return { moves, fx, camera, cues }
}

/**
 * 主軸笑點的後半：嚇一大跳（四腳離地）往後彈，落地。k 越大跳越高、退越遠；k ≥ 1 落地縮成一團摀耳朵發抖。
 * 回傳 end＝站回來的時間。
 */
function scare(s: number, k: number, to: number) {
  const fly = 0.42 + 0.04 * k
  const land = s + fly
  const ears = k >= 1 ? 0.4 + 0.1 * k : 0
  const moves: Move[] = [
    { at: s, actor: 'nian', do: 'swap', emoji: 'prop:nian-shock' },
    { at: s, actor: 'nian', do: 'moveTo', to: { x: to, y: G }, arc: [8, 14, 20][k], dur: fly, ease: 'out' },
    { at: s + 0.05, actor: 'nian', do: 'shake', amount: 0.8, dur: fly - 0.1 },
    { at: land, actor: 'nian', do: 'swap', emoji: k >= 1 ? 'prop:nian-ears' : 'prop:nian' },
    { at: land, actor: 'nian', do: 'squash', amount: 0.15 + 0.05 * k, dur: 0.25 },
  ]
  if (k >= 1) {
    moves.push({ at: land + 0.12, actor: 'nian', do: 'shake', amount: 0.7 + 0.2 * k, dur: ears - 0.12 })
    if (k === 1) moves.push({ at: land + ears, actor: 'nian', do: 'swap', emoji: 'prop:nian' })
  }
  const fx: Fx[] = [
    { at: s + 0.05, kind: 'sweat', actor: 'nian', dur: 0.6 },
    { at: land, kind: 'puff', actor: 'nian', n: 4 + 2 * k, dur: 0.45 },
  ]
  const camera: Camera[] = [{ at: land, dur: 0.25, do: 'shake', amount: 0.4 + 0.3 * k }]
  const cues: Cue[] = [{ at: s, sfx: 'boing' }, { at: land, sfx: 'bonk' }]
  return { moves, fx, camera, cues, land, end: land + ears }
}

// 時間表
const SNEAK = 0 // 踮腳偷偷摸摸靠近
const PROUD = 0.95 // 挺起來得意
// 第一次：小紅包
const P1 = 1.2
const r1 = roar(P1, 0, TX, 0.85)
const SHOW1 = P1 + 0.3
const s1 = scare(P1 + 0.8, 0, TX + 7)
// 第二次：甩甩頭、再吼，紅燈籠亮起來
const SHAKE2 = s1.land + 0.05
const P2 = SHAKE2 + 0.55
const X2 = TX + 7
const r2 = roar(P2, 1, X2, 0.85)
const SHOW2 = P2 + 0.3
const s2 = scare(P2 + 0.8, 1, TX + 14)
// 停一拍：走回來、深吸一口氣整隻鼓起來
const BACK = s2.end
const X3 = TX + 2
const INHALE = BACK + 0.3
const P3 = INHALE + 0.55
const r3 = roar(P3, 2, X3, 0.7)
const THROW = P3 + 0.15 // 小孩丟鞭炮
const FCLAND = THROW + 0.35
const BANG = FCLAND + 0.38 // 劈哩啪啦
const s3 = scare(BANG, 2, X3 + 1)
const FLEE = s3.land + 0.48 // 哭著逃跑
const TURN = FLEE + 0.32
const CRASH = TURN + 0.36 // 咚！撞上大鼓
const DIZZY = CRASH + 0.3
// 反轉：餃子、紅圍巾
const WALK = DIZZY + 0.05
const SERVE = WALK + 0.5
const EAT = SERVE + 0.25
const SCARF = EAT + 0.45 // 小孩丟圍巾
const FREEZE = SCARF + 0.28 // 圍巾落在脖子上：僵住
const DANCE = FREEZE + 0.5 // 開心地跳起舞
const SAY = DANCE + 0.25

const BANGS = [-9, 7, -2, 11, -12, 3, -6, 9, 0, -10, 5]

export default scene({
  duration: SAY + 1.15,
  bg: { top: '#2E2C78', bottom: '#8C6CC0', floor: '#5D6F8E', scenery: 'night' },
  actors: [
    { id: 'house', emoji: '🏠', x: 24, y: 77 - 0.42 * 42, size: 42, tint: 'brightness(.9)' },
    { id: 'lantern', emoji: '🏮', x: LAN.x, y: LAN.y, size: 12, float: true, tint: LAN_OFF },
    { id: 'drum', emoji: '🥁', x: DRUM.x, y: 77 - 0.42 * DRUM.size, size: DRUM.size },
    { id: 'kid', emoji: 'hero:yang/idle', x: KX, y: KG, size: K, flip: true },
    { id: 'fc', emoji: '🧨', x: KX + 14, y: KG - 10, size: 18, hidden: true, float: true, tint: GLOW },
    { id: 'nian', emoji: 'prop:nian-sneak', x: 158, y: G, size: S },
    { id: 'hb', emoji: '🧧', x: KX + 9, y: KG - 18, size: 14, hidden: true, float: true, tint: GLOW },
    { id: 'plate', emoji: 'prop:dumpling-plate', x: KX + 8, y: KG - 2, size: 14, hidden: true, float: true },
    { id: 'scarf', emoji: '🧣', x: KX2 + 9, y: KG + 1, size: 12, hidden: true, float: true, tint: GLOW },
  ],
  moves: [
    // 開場：踮腳偷偷摸摸靠近（一步一步小跳）
    { at: SNEAK, actor: 'nian', do: 'moveTo', to: { x: TX, y: G }, dur: 0.9, ease: 'out' },
    ...[0, 1, 2, 3].map((i): Move => ({ at: SNEAK + 0.05 + 0.22 * i, actor: 'nian', do: 'hop', amount: 2, dur: 0.2 })),
    { at: 0.25, actor: 'kid', do: 'tilt', amount: 6, dur: 0.4 },
    // 挺起來得意
    { at: PROUD, actor: 'nian', do: 'swap', emoji: 'prop:nian' },
    { at: PROUD, actor: 'nian', do: 'squash', amount: -0.1, dur: 0.35 },
    // 第一次：吼 → 小孩不慌不忙舉起小紅包 → 嚇一跳彈起來、退一步
    ...r1.moves,
    { at: SHOW1 - 0.05, actor: 'kid', do: 'swap', emoji: 'hero:yang/know' },
    { at: SHOW1, actor: 'hb', do: 'pop', dur: 0.25 },
    { at: SHOW1 + 0.25, actor: 'hb', do: 'shake', amount: 0.4, dur: 0.3 },
    ...s1.moves,
    { at: s1.land + 0.05, actor: 'kid', do: 'swap', emoji: 'hero:yang/smug' },
    { at: s1.land + 0.05, actor: 'hb', do: 'vanish', dur: 0.15 },
    // 第二次：甩甩頭、再吼更大聲 → 紅燈籠「啪」地亮起來 → 跳更高、縮成一團、退更遠
    { at: SHAKE2, actor: 'nian', do: 'tilt', amount: 10, dur: 0.18 },
    { at: SHAKE2 + 0.18, actor: 'nian', do: 'tilt', amount: -10, dur: 0.18 },
    ...r2.moves,
    { at: SHOW2, actor: 'lantern', do: 'tint', filter: LAN_ON },
    { at: SHOW2, actor: 'lantern', do: 'scaleTo', amount: 1.8, dur: 0.22, ease: 'back' },
    { at: SHOW2 + 0.25, actor: 'lantern', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: SHOW2 + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/giggle' },
    ...s2.moves,
    { at: s2.end, actor: 'lantern', do: 'scaleTo', amount: 1 / 1.3, dur: 0.3 },
    // 停一拍：氣呼呼走回來，深吸一口氣、整隻鼓起來
    { at: BACK, actor: 'nian', do: 'moveTo', to: { x: X3, y: G }, dur: 0.3 },
    { at: BACK, actor: 'nian', do: 'hop', amount: 2, dur: 0.15 },
    { at: BACK + 0.15, actor: 'nian', do: 'hop', amount: 2, dur: 0.15 },
    { at: INHALE, actor: 'nian', do: 'scaleTo', amount: 1.12, dur: 0.55 },
    { at: INHALE, actor: 'nian', do: 'squash', amount: -0.12, dur: 0.6 },
    { at: INHALE + 0.3, actor: 'nian', do: 'shake', amount: 0.3, dur: 0.3 },
    { at: INHALE + 0.05, actor: 'kid', do: 'swap', emoji: 'hero:yang/smug' },
    { at: THROW - 0.05, actor: 'fc', do: 'pop', dur: 0.1 },
    // 第三次：吼到最大 → 小孩把鞭炮丟到他腳邊 → 劈哩啪啦
    ...r3.moves,
    { at: P3, actor: 'nian', do: 'scaleTo', amount: 1 / 1.12, dur: 0.3 },
    { at: THROW, actor: 'kid', do: 'swap', emoji: 'hero:yang/throw' },
    { at: THROW, actor: 'fc', do: 'moveTo', to: FC, arc: 14, dur: FCLAND - THROW, ease: 'in' },
    { at: FCLAND, actor: 'fc', do: 'rotateTo', amount: 70, dur: 0.1 },
    { at: FCLAND + 0.1, actor: 'fc', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: FCLAND + 0.3, actor: 'kid', do: 'swap', emoji: 'hero:yang/giggle' },
    ...BANGS.map((_, i): Move => ({ at: BANG + 0.09 * i, actor: 'fc', do: 'hop', amount: 2 + (i % 3), dur: 0.08 })),
    { at: BANG + 0.09 * BANGS.length, actor: 'fc', do: 'vanish', dur: 0.15 },
    ...s3.moves,
    // 哭著逃跑：先往左衝、掉頭往右衝——咚！撞上大鼓，彈回來坐地頭暈
    { at: FLEE, actor: 'nian', do: 'swap', emoji: 'prop:nian-flee' },
    { at: FLEE, actor: 'nian', do: 'moveTo', to: { x: 86, y: G }, dur: TURN - FLEE, ease: 'in' },
    { at: TURN, actor: 'nian', do: 'flip' },
    { at: TURN, actor: 'nian', do: 'moveTo', to: { x: DRUM.x - 0.42 * S - 2, y: G }, dur: CRASH - TURN, ease: 'in' },
    { at: CRASH, actor: 'nian', do: 'swap', emoji: 'prop:nian-shock' },
    { at: CRASH, actor: 'nian', do: 'squash', amount: 0.2, dur: 0.15 },
    { at: CRASH, actor: 'drum', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: CRASH + 0.02, actor: 'drum', do: 'shake', amount: 1, dur: 0.35 },
    { at: CRASH + 0.08, actor: 'nian', do: 'moveTo', to: { x: SIT, y: G }, arc: 6, dur: DIZZY - CRASH - 0.08, ease: 'out' },
    { at: DIZZY, actor: 'nian', do: 'swap', emoji: 'prop:nian-dizzy' },
    { at: DIZZY, actor: 'nian', do: 'flip' },
    { at: DIZZY + 0.05, actor: 'nian', do: 'tilt', amount: 7, dur: 0.4 },
    { at: DIZZY + 0.45, actor: 'nian', do: 'tilt', amount: -7, dur: 0.4 },
    { at: FLEE + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/laugh' },
    // 反轉：小孩沒有趕他，端一盤餃子走過去
    { at: WALK, actor: 'kid', do: 'swap', emoji: 'hero:yang/walk' },
    { at: WALK, actor: 'kid', do: 'moveTo', to: { x: KX2, y: KG }, dur: SERVE - WALK },
    { at: WALK - 0.05, actor: 'plate', do: 'pop', dur: 0.2 },
    { at: WALK, actor: 'plate', do: 'moveTo', to: { x: KX2 + 8, y: KG - 2 }, dur: SERVE - WALK },
    { at: SERVE, actor: 'kid', do: 'swap', emoji: 'hero:yang/reach' },
    { at: SERVE, actor: 'plate', do: 'moveTo', to: { x: SIT - 4, y: G + 10 }, dur: EAT - SERVE, ease: 'out' },
    { at: SERVE + 0.05, actor: 'nian', do: 'hop', amount: 2, dur: 0.2 },
    // 抱著吃得好幸福
    { at: EAT, actor: 'plate', do: 'vanish', dur: 0.05 },
    { at: EAT, actor: 'nian', do: 'swap', emoji: 'prop:nian-eat' },
    { at: EAT + 0.2, actor: 'nian', do: 'squash', amount: 0.08, dur: 0.18 },
    { at: EAT + 0.42, actor: 'nian', do: 'squash', amount: 0.08, dur: 0.18 },
    { at: EAT + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/giggle' },
    // 紅圍巾丟到脖子上——他看到紅色，僵住
    { at: SCARF - 0.05, actor: 'kid', do: 'swap', emoji: 'hero:yang/reach' },
    { at: SCARF, actor: 'scarf', do: 'pop', dur: 0.1 },
    { at: SCARF + 0.05, actor: 'scarf', do: 'moveTo', to: { x: SIT - 5, y: G + 0.35 * S }, arc: 3, dur: FREEZE - SCARF - 0.05, ease: 'in' },
    { at: FREEZE, actor: 'nian', do: 'swap', emoji: 'prop:nian-shock' },
    { at: FREEZE, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    // ……然後開心地站起來跳舞
    { at: DANCE - 0.03, actor: 'scarf', do: 'vanish', dur: 0.03 },
    { at: DANCE, actor: 'nian', do: 'swap', emoji: 'prop:nian-dance' },
    { at: DANCE, actor: 'nian', do: 'hop', amount: 6, dur: 0.35 },
    ...[0, 1, 2].map((i): Move => ({ at: DANCE + 0.4 + 0.36 * i, actor: 'nian', do: 'tilt', amount: i % 2 ? -8 : 8, dur: 0.34 })),
    ...[0, 1].map((i): Move => ({ at: DANCE + 0.55 + 0.4 * i, actor: 'nian', do: 'hop', amount: 3, dur: 0.3 })),
    { at: DANCE + 0.1, actor: 'kid', do: 'swap', emoji: 'hero:yang/happy' },
    ...[0, 1, 2].map((i): Move => ({ at: DANCE + 0.2 + 0.36 * i, actor: 'kid', do: 'hop', amount: 3, dur: 0.3 })),
  ],
  fx: [
    ...r1.fx,
    { at: SHOW1 + 0.05, kind: 'burst', actor: 'hb', emoji: '✨', n: 5, dy: 5, dur: 0.5, scale: 0.7 },
    ...s1.fx,
    ...r2.fx,
    { at: SHOW2, kind: 'burst', actor: 'lantern', emoji: '✨', n: 6, dy: 6, dur: 0.6, scale: 1 },
    ...s2.fx,
    { at: INHALE + 0.4, kind: 'sweat', actor: 'nian', dur: 0.4 },
    ...r3.fx,
    { at: FCLAND + 0.05, kind: 'burst', x: FC.x + 5, y: FC.y - 6, emoji: '✨', n: 3, dur: 0.35, scale: 0.5 },
    // 劈哩啪啦：腳邊一下左一下右地炸
    ...BANGS.map((dx, i): Fx => ({ at: BANG + 0.09 * i, kind: 'burst', x: FC.x + dx, y: FC.y - 1 - (i % 3), emoji: '💥', n: 1, dur: 0.25, scale: 1 + 0.15 * (i % 3) })),
    { at: BANG + 0.3, kind: 'burst', x: FC.x, y: FC.y - 4, emoji: '✨', n: 6, dur: 0.5, scale: 0.8 },
    ...s3.fx,
    { at: FLEE, kind: 'sweat', actor: 'nian', dur: 0.7 },
    { at: CRASH, kind: 'burst', x: DRUM.x - 6, y: G, emoji: '💥', n: 1, dur: 0.35, scale: 1.2 },
    { at: DIZZY, kind: 'dizzy', actor: 'nian', dur: 0.6 },
    { at: EAT + 0.05, kind: 'burst', actor: 'nian', emoji: '💕', n: 4, dy: -4, dur: 0.6, scale: 0.8 },
    { at: DANCE, kind: 'burst', x: 86, y: 36, emoji: '✨', n: 8, dur: 0.8, scale: 1.2 },
    { at: DANCE + 0.3, kind: 'burst', x: 140, y: 36, emoji: '🎉', n: 7, dur: 0.9, scale: 1.1 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.25, to: aim({ x: 86, y: 50 }, 1.25) },
    ...r1.camera,
    { at: SHOW1, dur: 0.3, do: 'punch', amount: 0.05, to: { x: KX + 9, y: KG - 18 } },
    ...s1.camera,
    ...r2.camera,
    { at: SHOW2, dur: 0.35, do: 'punch', amount: 0.07, to: LAN },
    ...s2.camera,
    // 停一拍：慢慢推近他鼓起來的臉
    { at: INHALE, dur: 0.55, do: 'zoom', amount: 1.6, to: aim({ x: X3 - 4, y: 48 }, 1.6) },
    // 第三次：拉開看小孩丟鞭炮
    { at: P3 - 0.05, dur: 0.25, do: 'zoom', amount: 1.2, to: aim({ x: 88, y: 48 }, 1.2) },
    ...r3.camera,
    { at: BANG, dur: 0.9, do: 'shake', amount: 1.2 },
    // 逃跑：全景
    { at: FLEE - 0.1, dur: 0.3, do: 'zoom', amount: 1, to: MID },
    { at: CRASH, dur: 0.35, do: 'punch', amount: 0.1, to: { x: DRUM.x - 10, y: G } },
    { at: CRASH, dur: 0.35, do: 'shake', amount: 1.2 },
    // 反轉：推近餃子
    { at: WALK, dur: 0.5, do: 'zoom', amount: 1.35, to: aim({ x: 106, y: 52 }, 1.35) },
    // 僵住：推近他的臉
    { at: FREEZE, dur: 0.45, do: 'zoom', amount: 1.6, to: aim({ x: 112, y: 52 }, 1.6) },
    // 亮相
    { at: DANCE, dur: 0.4, do: 'zoom', amount: 1.5, to: aim({ x: 108, y: 50 }, 1.5) },
  ],
  lights: [
    { at: SHOW2, dur: 0.05, level: -0.2 },
    { at: SHOW2 + 0.05, dur: 0.3, level: 0 },
    ...[0, 3, 6, 9].flatMap((i) => [
      { at: BANG + 0.09 * i, dur: 0.03, level: -0.18 },
      { at: BANG + 0.09 * i + 0.03, dur: 0.12, level: 0 },
    ]),
    { at: CRASH, dur: 0.05, level: -0.2 },
    { at: CRASH + 0.05, dur: 0.3, level: 0 },
    { at: DANCE, dur: 0.05, level: -0.3 },
    { at: DANCE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'tap' },
    { at: 0.5, sfx: 'tap' },
    { at: PROUD, sfx: 'hic' },
    ...r1.cues,
    { at: SHOW1, sfx: 'plop' },
    ...s1.cues,
    { at: SHAKE2, sfx: 'whoosh' },
    ...r2.cues,
    { at: SHOW2, sfx: 'plop' },
    ...s2.cues,
    { at: INHALE, sfx: 'bubble' },
    ...r3.cues,
    { at: THROW, sfx: 'whoosh' },
    { at: FCLAND, sfx: 'plop' },
    ...[0, 2, 4, 6, 8, 10].map((i): Cue => ({ at: BANG + 0.09 * i, sfx: 'crack' })),
    ...s3.cues,
    { at: FLEE, sfx: 'whoosh' },
    { at: CRASH, sfx: 'bonk' },
    { at: CRASH + 0.05, sfx: 'rumble' },
    { at: EAT, sfx: 'gulp' },
    { at: EAT + 0.42, sfx: 'gulp' },
    { at: SCARF, sfx: 'whoosh' },
    { at: FREEZE, sfx: 'blip' },
    { at: DANCE, sfx: 'boing' },
    { at: SAY, say: '年獸' },
    { at: SAY + 0.4, sfx: 'cheer' },
  ],
})
