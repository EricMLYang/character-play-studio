// 演的是字面意思：小小＋兵——螞蟻那麼小的一隊小兵，戴著頭盔齊步走，合力把東西扛回家（沒有黃色膠囊身體、護目鏡、吊帶褲、香蕉）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：桌上掉下什麼，一整隊戴頭盔的螞蟻小兵就齊步走過來、「一、二」一起扛走——掉下來的一次比一次大。
// 同一個地方掉、同一隊兵、同一個「一、二」扛起來，只有東西越來越大：一點點餅乾屑（太輕，一扛就彈起來）→ 一整塊餅乾（扛得腿都彎了、流汗）。
// 第三次大家排好隊、抬頭等……桌上的蛋糕晃了一下，沒掉下來（停一拍）。反轉：小兵們齊步走到桌子底下，「一、二」——連桌子帶蛋糕整個扛起來，
// 扛到正中間一起跳一下：「小小兵」。
const ANT = 14 // 螞蟻小兵的 size（畫出來會自動放大三成）
const AY = 77 - 0.42 * ANT // 螞蟻站在地上的 y
const RS = ANT * 1.3 // 畫出來的大小（算頭盔跟著壓扁沉多少）
const HX = 6.3 // 頭盔在頭上：往臉的那一側偏多少
const HY = -4.6 // 頭盔比螞蟻的 y 高多少
const SQUAD = [-26, -13, 0, 13, 26] // 一隊五個，相對隊伍中心的位置
const FOOD_X = 60 // 東西都掉在這裡
const CRUMB = 7 // 一開始是一點點餅乾屑（size 7），之後同一塊放大成整塊餅乾（size 20）
const COOKIE = 20
const EDGE_X = 97 // 桌面邊緣（東西從這裡掉下來）
/** 餅乾（放大是以中心為準）底部在 feet 時的 y */
const fy = (size: number, feet = 77) => feet - 0.42 * size
const TABLE_X = 110
const TABLE = 36
const TY = 77 - 0.42 * TABLE
const CAKE = 20
const CAKE_X = 113
const CY = 47.6 // 蛋糕放在桌面上
const LIFT = 13 // 扛起來：東西底部抬到螞蟻背上
const OUT = -34 // 走出畫面（隊伍中心）
/** 扛起來以後傻眼／用力停多久 */
const HOLD = 0.45

const ants = SQUAD.map((_, i) => `a${i}`)
const helms = SQUAD.map((_, i) => `h${i}`)

/** 隊伍整隊移動（齊步走：大家同一拍踩一步），扛著的東西 loads 跟著走、跟著顛。face 是朝向（1 朝右、-1 朝左） */
function march(at: number, dur: number, to: number, face: 1 | -1, loads: { id: string; dx: number; y: number }[] = []) {
  const steps = Math.max(2, Math.round(dur * 6))
  const sd = dur / steps
  const moves: Move[] = []
  SQUAD.forEach((dx, i) => {
    moves.push({ at, dur, actor: ants[i], do: 'moveTo', to: { x: to + dx, y: AY }, ease: 'linear' })
    moves.push({ at, dur, actor: helms[i], do: 'moveTo', to: { x: to + dx + face * HX, y: AY + HY }, ease: 'linear' })
  })
  for (const l of loads) moves.push({ at, dur, actor: l.id, do: 'moveTo', to: { x: to + l.dx, y: l.y }, ease: 'linear' })
  const bob = [...ants, ...helms, ...loads.map((l) => l.id)]
  for (let s = 0; s < steps; s++) for (const id of bob) moves.push({ at: at + s * sd, dur: sd, actor: id, do: 'hop', amount: 1.3 })
  const cues: Cue[] = []
  for (let s = 0; s < steps; s += 2) cues.push({ at: at + s * sd, sfx: 'tap' })
  return { moves, cues }
}

/** 全隊向後轉（頭盔換到另一邊） */
function turn(at: number, x: number, face: 1 | -1): Move[] {
  return SQUAD.flatMap((dx, i): Move[] => [
    { at, actor: ants[i], do: 'flip' },
    { at, actor: helms[i], do: 'flip' },
    { at, dur: 0.08, actor: helms[i], do: 'moveTo', to: { x: x + dx + face * HX, y: AY + HY } },
  ])
}

/** 大家一起壓下去（頭盔跟著沉）。amount 正＝壓扁、負＝拉長 */
function squat(at: number, dur: number, amount: number): Move[] {
  return SQUAD.flatMap((_, i): Move[] => [
    { at, dur, actor: ants[i], do: 'squash', amount },
    { at, dur, actor: helms[i], do: 'hop', amount: -RS * 0.7 * amount },
  ])
}

/**
 * 主軸笑點：「一」大家蹲下去、「二」一起扛起來——東西抬到背上，越大的東西壓得越扁、震得越大、音效疊越多。
 * k 是第幾次（0 餅乾屑、1 餅乾、2 桌子＋蛋糕），at 是「二」扛起來那一刻，loads 是被扛起來的東西（原本的 y）。
 */
function heave(at: number, k: number, x: number, loads: { id: string; y: number; lift?: number }[]) {
  const up = [0.18, 0.32, 0.45][k]
  const moves: Move[] = [
    // 一：蹲下蓄力
    ...squat(at - 0.35, 0.3, 0.18),
    // 二：一起往上頂
    ...squat(at, 0.2, -0.15),
    ...SQUAD.map((_, i): Move => ({ at, dur: 0.2, actor: ants[i], do: 'hop', amount: 2 })),
    ...SQUAD.map((_, i): Move => ({ at, dur: 0.2, actor: helms[i], do: 'hop', amount: 2 })),
  ]
  for (const l of loads) {
    if (k === 0) {
      // 太輕了：一頂就彈得老高，再落回背上
      moves.push({ at, dur: 0.25, actor: l.id, do: 'moveTo', to: { x, y: l.y - LIFT - 14 }, ease: 'out' })
      moves.push({ at: at + 0.25, dur: 0.2, actor: l.id, do: 'moveTo', to: { x, y: l.y - LIFT }, ease: 'in' })
    } else {
      moves.push({ at, dur: up, actor: l.id, do: 'moveTo', to: { x: x + (l.id === 'cake' ? CAKE_X - TABLE_X : 0), y: l.y - (l.lift ?? LIFT) }, ease: 'back' })
    }
  }
  // 東西壓到背上：越重壓越扁、晃越久
  const land = k === 0 ? at + 0.45 : at + up
  const press = 0.06 + 0.13 * k
  moves.push(...squat(land, HOLD, press))
  for (const l of loads) moves.push({ at: land, dur: HOLD, actor: l.id, do: 'hop', amount: -RS * 0.7 * press })
  if (k >= 1) SQUAD.forEach((_, i) => moves.push({ at: land + 0.05, dur: HOLD - 0.1, actor: ants[i], do: 'shake', amount: 0.25 * k }))
  const fx: Fx[] = [
    { at: land, kind: 'puff', x, y: 76, n: 4 + 4 * k, dur: 0.5 },
  ]
  if (k >= 1) fx.push({ at: land + 0.05, kind: 'sweat', actor: 'a1', dur: 0.6 }, { at: land + 0.05, kind: 'sweat', actor: 'a3', dur: 0.6 })
  const camera: Camera[] = [{ at: land, dur: 0.4, do: 'punch', amount: 0.05 + 0.035 * k, to: { x, y: 58 } }]
  if (k >= 1) camera.push({ at: land, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.5 + 0.6 * k })
  // 同一聲「嘿咻」（boing），越重疊越多
  const cues: Cue[] = [{ at: at - 0.35, sfx: 'blip' }, { at, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: land, sfx: 'rumble' })
  if (k >= 2) cues.push({ at: land + 0.1, sfx: 'bonk' })
  return { moves, fx, camera, cues, end: land + HOLD }
}

/** 桌上掉下一樣東西到 FOOD_X */
function fall(at: number, k: number) {
  const size = k ? COOKIE : CRUMB
  const id = k ? 'cookie' : 'crumb'
  const moves: Move[] = [
    { at: at - 0.2, actor: 'cake', do: 'shake', amount: 0.4 + 0.3 * k, dur: 0.2 },
    { at, actor: id, do: 'moveTo', to: { x: FOOD_X, y: fy(size, k ? 75 : 77) }, arc: 6, dur: 0.4, ease: 'in' },
  ]
  if (k === 1) moves.push({ at: at + 0.4, actor: id, do: 'squash', amount: 0.2, dur: 0.25 })
  const fx: Fx[] = [{ at: at + 0.4, kind: 'puff', x: FOOD_X, y: 76, n: 3 + 3 * k, dur: 0.4 }]
  const cues: Cue[] = [{ at: at + 0.4, sfx: 'plop' }]
  return { moves, fx, cues }
}

// ── 時間表 ──
const F1 = 0.25 // 餅乾屑掉下來
const IN1 = 0.4, H1 = 1.6
const T1 = 2.1, OUT1 = 2.15
const RESET = 2.9 // 換成一整塊餅乾（在畫面外）
const F2 = 3.0
const IN2 = 3.0, H2 = 4.15
const T2 = 5.0, OUT2 = 5.05
const IN3 = 5.8 // 第三次：排好隊等
const WAIT = 6.85 // 抬頭等……蛋糕晃一下，沒掉
const GO = 7.95 // 齊步走進桌子底下
const H3 = 8.8
const T3 = 9.75, CARRY = 9.77
const POSE = 10.5
const POSE_X = 80

const f1 = fall(F1, 0)
const f2 = fall(F2, 1)
const m1 = march(IN1, 0.8, FOOD_X, 1)
const h1 = heave(H1, 0, FOOD_X, [{ id: 'crumb', y: fy(CRUMB) }])
const o1 = march(OUT1, 0.7, OUT, -1, [{ id: 'crumb', dx: 0, y: fy(CRUMB) - LIFT }])
const m2 = march(IN2, 0.8, FOOD_X, 1)
const h2 = heave(H2, 1, FOOD_X, [{ id: 'cookie', y: fy(COOKIE, 75), lift: LIFT - 2 }])
const o2 = march(OUT2, 0.7, OUT, -1, [{ id: 'cookie', dx: 0, y: fy(COOKIE) - LIFT }])
const m3 = march(IN3, 0.8, FOOD_X, 1)
const go = march(GO, 0.45, TABLE_X, 1)
const h3 = heave(H3, 2, TABLE_X, [{ id: 'table', y: TY }, { id: 'cake', y: CY }])
const carry = march(CARRY, 0.65, POSE_X, -1, [{ id: 'table', dx: 0, y: TY - LIFT }, { id: 'cake', dx: CAKE_X - TABLE_X, y: CY - LIFT }])

export default scene({
  duration: 12,
  bg: { top: '#8FD3F4', bottom: '#E6F7FF', floor: '#86C95A', scenery: 'hills' },
  actors: [
    { id: 'flower', emoji: '🌼', x: 30, y: 77 - 0.42 * 13, size: 13 },
    { id: 'mush', emoji: '🍄', x: 142, y: 77 - 0.42 * 12, size: 12 },
    { id: 'table', emoji: 'prop:table', x: TABLE_X, y: TY, size: TABLE },
    { id: 'cake', emoji: 'prop:cake', x: CAKE_X, y: CY, size: CAKE },
    // 餅乾屑和整塊餅乾：前一個被扛走以後，下一個才放到桌邊
    { id: 'crumb', emoji: '🍪', x: EDGE_X, y: fy(CRUMB, 60.5), size: CRUMB },
    { id: 'cookie', emoji: '🍪', x: EDGE_X, y: fy(COOKIE, 58.5), size: COOKIE, hidden: true },
    ...SQUAD.flatMap((dx, i) => [
      { id: ants[i], emoji: '🐜', x: OUT + dx, y: AY, size: ANT, flip: true },
      { id: helms[i], emoji: '🪖', x: OUT + dx + HX, y: AY + HY, size: 6 },
    ]),
  ],
  moves: [
    // ① 餅乾屑：太輕，一扛就彈起來，大家神氣地扛走
    ...f1.moves,
    ...m1.moves,
    ...h1.moves,
    ...turn(T1, FOOD_X, -1),
    ...o1.moves,
    // ② 換成一整塊餅乾，回到桌邊
    { at: RESET, actor: 'cookie', do: 'pop', dur: 0.2 },
    ...f2.moves,
    ...turn(IN2 - 0.05, OUT, 1),
    ...m2.moves,
    ...h2.moves,
    ...turn(T2, FOOD_X, -1),
    ...o2.moves,
    // ③ 排好隊等，抬頭看桌上——蛋糕晃了一下……沒掉下來
    ...turn(IN3 - 0.05, OUT, 1),
    ...m3.moves,
    { at: WAIT, actor: 'cake', do: 'shake', amount: 0.9, dur: 0.35 },
    // 大家伸長身子準備接……什麼都沒掉
    ...squat(WAIT + 0.05, 0.6, -0.12),
    // 排頭的小兵回頭跟大家點一下：「走！」
    { at: WAIT + 0.55, actor: 'a4', do: 'flip' },
    { at: WAIT + 0.55, actor: 'h4', do: 'flip' },
    { at: WAIT + 0.55, dur: 0.06, actor: 'h4', do: 'moveTo', to: { x: FOOD_X + SQUAD[4] - HX, y: AY + HY } },
    ...[0.62, 0.84].flatMap((d): Move[] => [
      { at: WAIT + d, actor: 'a4', do: 'hop', amount: 2.5, dur: 0.2 },
      { at: WAIT + d, actor: 'h4', do: 'hop', amount: 2.5, dur: 0.2 },
    ]),
    { at: WAIT + 1.05, actor: 'a4', do: 'flip' },
    { at: WAIT + 1.05, actor: 'h4', do: 'flip' },
    { at: WAIT + 1.05, dur: 0.06, actor: 'h4', do: 'moveTo', to: { x: FOOD_X + SQUAD[4] + HX, y: AY + HY } },
    // 齊步走到桌子底下
    ...go.moves,
    // 一、二——連桌子帶蛋糕扛起來
    ...h3.moves,
    ...turn(T3, TABLE_X, -1),
    ...carry.moves,
    // 亮相：全隊一起跳一下
    ...[...ants, ...helms, 'table', 'cake'].map((id): Move => ({ at: POSE, actor: id, do: 'hop', amount: 3, dur: 0.35 })),
  ],
  fx: [
    ...f1.fx,
    ...h1.fx,
    ...f2.fx,
    ...h2.fx,
    ...h3.fx,
    { at: POSE, kind: 'burst', x: POSE_X, y: 40, emoji: '🎉', n: 9, dur: 1.0, scale: 1.4 },
    { at: POSE + 0.1, kind: 'burst', x: POSE_X, y: 50, emoji: '✨', n: 8, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    // 鏡頭貼著地面：小兵小、東西大，但都看得清楚
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.4, to: { x: 80, y: 57 } },
    ...h1.camera,
    ...h2.camera,
    // 停一拍：慢慢往桌上的蛋糕推
    { at: WAIT - 0.3, dur: 0.4, do: 'zoom', amount: 1.7, to: { x: CAKE_X - 6, y: 50 } },
    { at: WAIT + 0.45, dur: 0.3, do: 'zoom', amount: 1.4, to: { x: 88, y: 57 } },
    { at: GO, dur: 0.4, do: 'zoom', amount: 1.4, to: { x: 95, y: 57 } },
    ...h3.camera,
    { at: CARRY, dur: 0.7, do: 'zoom', amount: 1.4, to: { x: POSE_X, y: 54 } },
    { at: POSE, dur: 0.3, do: 'shake', amount: 0.8 },
  ],
  lights: [
    { at: H3 + 0.45, dur: 0.05, level: -0.35 },
    { at: H3 + 0.5, dur: 0.35, level: 0 },
    { at: POSE, dur: 0.05, level: -0.3 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    ...f1.cues,
    ...m1.cues,
    ...h1.cues,
    ...o1.cues,
    ...f2.cues,
    ...m2.cues,
    ...h2.cues,
    ...o2.cues,
    ...m3.cues,
    { at: WAIT, sfx: 'clink' },
    { at: WAIT + 0.62, sfx: 'blip' },
    { at: WAIT + 0.84, sfx: 'blip' },
    ...go.cues,
    ...h3.cues,
    ...carry.cues,
    { at: POSE, sfx: 'boing' },
    { at: POSE + 0.1, say: '小小兵' },
    { at: POSE + 0.4, sfx: 'cheer' },
  ],
})
