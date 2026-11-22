// 演的是字面意思：海綿＋寶寶——一塊小小的海綿寶寶，喝水喝太飽變超大（海綿沒有臉、沒有手腳、沒穿衣服，不在海底，沒有鳳梨屋、水母、海星、章魚、漢堡店）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小老鼠餵小海綿寶寶喝水，海綿咕嚕一吸就「噗」地脹大一圈，喝的一次比一次多。
// 同一個動作（把水端到海綿前面 → 水滴一串被吸進去、容器變空 → 噗地脹大 → 他嚇一跳、手上的空容器飛出去）、
// 同一串「咕嚕—咕嚕—噗」，做三次：一杯水 → 一桶水 → 停一拍：沒有更大的了，他回頭找，海綿自己蹭到後院小水池邊，
// 他伸手「等一下！」——整池水被吸光，海綿比他還大，鴨子坐在乾乾的池底傻眼。
// 反轉：他像拍寶寶打嗝一樣拍拍大海綿的背——「嗝」——水嘩地全吐回池子裡，海綿縮回小小一塊，鴨子又浮起來；
// 小海綿跳進他懷裡，他抱著亮相：「海綿寶寶」。
// 主角用小老鼠（端東西、嚇一跳、跌坐、伸手擋、抱抱的姿勢都有）。

// ── 站位 ──
const H = 38 // 小老鼠的 size
const HY = 77 - 0.42 * H
const HX = 40 // 餵水時站的地方
const hand = (x: number) => ({ x: x + 12.7, y: HY - 0.6 }) // reach（朝右）時手的位置（量過）
const SS = 14 // 海綿一開始的 size（會自動放大一點）
const SY = 77 - 0.42 * SS
const SX = 72 // 海綿坐的地方
const EDGE = 80 // 第三次自己蹭到的池邊
// 後院小水池：咖啡色的池底＋壓扁的藍色水面（從側面看），兩邊兩顆石頭
const PX = 100
const WS = 19 // 水面（🔵 拉成 2 倍寬）：底在 y 77
const WY = 77 - 0.42 * WS
const BS = 22 // 池底（🟤 拉成 1.9 倍寬）：底在 y 78
const BY = 78 - 0.42 * BS
const DS = 14 // 鴨子
const DX = 109
const DUCK_Y = 63.6 // 浮在水上（下半截泡在水裡）
const DRY_Y = 68.2 // 坐在乾掉的池底
// 杯子、水桶
const CUP = { s: 14, x: hand(HX).x + 5.5, y: HY - 6 }
const BKT = { s: 18, x: hand(HX).x + 7, y: HY - 3 }
const BKT0 = { x: 22, y: 77 - 0.42 * 18 } // 水桶一開始放在後面地上
/** 每一次脹大的倍率（累乘）：14 → 約 18 → 25 → 35 → 53 */
const GROW = [1.4, 1.4, 1.5]
const TOTAL = GROW[0] * GROW[1] * GROW[2]
/** 嚇一跳以後傻眼停多久 */
const HOLD = 0.55
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/**
 * 主軸：水端到海綿前面 → 海綿往上一伸（吸氣），水滴一串被吸進去（咕嚕、咕嚕）→ 噗！脹大一圈（擠扁再彈開）→ 他嚇一跳。
 * P＝開始吸的那一刻，k＝第幾次（0 杯子、1 水桶、2 水池），src＝水從哪裡來。回傳 pop＝脹大那一刻、end＝傻眼停完。
 */
function drink(P: number, k: number, src: string) {
  const suck = [0.6, 0.75, 1.0][k]
  const pop = P + suck
  const moves: Move[] = [
    // 吸氣：海綿往上伸長、抖
    { at: P, actor: 'sponge', do: 'squash', amount: -0.12 - 0.04 * k, dur: suck },
    { at: P + 0.1, actor: 'sponge', do: 'shake', amount: 0.3 + 0.2 * k, dur: suck - 0.1 },
    // 噗！脹大一圈（有彈性）
    { at: pop, actor: 'sponge', do: 'scaleTo', amount: GROW[k], dur: 0.35, ease: 'back' },
    { at: pop, actor: 'sponge', do: 'squash', amount: 0.25 + 0.05 * k, dur: 0.3 },
  ]
  const fx: Fx[] = [
    // 水被吸過去：一條水流＋一串水滴
    { at: P, kind: 'line', actor: src, target: 'sponge', color: '#5CC4F7', width: [1.2, 1.8, 3][k], dur: suck },
    { at: P, kind: 'blow', actor: src, target: 'sponge', emoji: '💧', n: [4, 6, 9][k], dur: suck, scale: 1 + 0.15 * k },
    { at: pop, kind: 'burst', actor: 'sponge', emoji: '🫧', n: 6 + 2 * k, dy: -4, dur: 0.6, scale: 1.1 + 0.15 * k },
  ]
  const camera: Camera[] = [
    // 推近的定點放在他身上：他不會被推出畫面
    { at: pop, dur: 0.4, do: 'punch', amount: [0.08, 0.08, 0.05][k], to: { x: HX + 4, y: 58 } },
    { at: pop, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.5 * k },
  ]
  // 同一串音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: P + 0.05, sfx: 'gulp' }, { at: P + suck * 0.55, sfx: 'gulp' }, { at: pop, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: pop + 0.05, sfx: 'boing' })
  if (k >= 2) cues.push({ at: P + suck * 0.8, sfx: 'gulp' }, { at: pop + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues, pop, end: pop + HOLD }
}

// ── 時間表 ──
const P1 = 0.9
const d1 = drink(P1, 0, 'cup')
const PICK = d1.end + 0.1 // 回頭拿水桶
const P2 = PICK + 0.95
const d2 = drink(P2, 1, 'bucket')
const LOOK = d2.end + 0.1 // 停一拍：沒有更大的了，他回頭找
const SCOOT = LOOK + 0.3 // 海綿自己蹭到池邊
const STOP = SCOOT + 0.8 // 他回頭看到：等一下！
const P3 = STOP + 0.4
const d3 = drink(P3, 2, 'pool')
const UP = d3.end + 0.1 // 爬起來走過去
const PAT = UP + 0.35 // 拍三下
const HIC = PAT + 0.7 // 嗝！
const BACK = HIC + 0.45 // 縮回小小一塊
const HUG = BACK + 0.4 // 跳進他懷裡
const END = HUG + 2.0
const PATX = 43 // 拍背時站的地方
const HUGX = 66 // 抱著亮相的地方

export default scene({
  duration: Math.round(END * 10) / 10,
  bg: { top: '#8FD3F4', bottom: '#E6F6DA', floor: '#8CCB6A', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 148, y: 77 - 0.42 * 30, size: 30 },
    { id: 'flower', emoji: '🌻', x: 10, y: 77 - 0.42 * 16, size: 16 },
    { id: 'bed', emoji: '🟤', x: PX, y: BY, size: BS, float: true },
    { id: 'duck', emoji: '🦆', x: DX, y: DUCK_Y, size: DS, float: true },
    { id: 'pool', emoji: '🔵', x: PX, y: WY, size: WS, float: true },
    { id: 'rockL', emoji: '🪨', x: PX - 21, y: 77 - 0.42 * 7, size: 7 },
    { id: 'rockR', emoji: '🪨', x: PX + 21, y: 77 - 0.42 * 8, size: 8 },
    { id: 'bucket', emoji: 'prop:bucket', x: BKT0.x, y: BKT0.y, size: BKT.s },
    { id: 'kid', emoji: 'hero:mouse/walk', x: HX - 8, y: HY, size: H, flip: true },
    { id: 'sponge', emoji: '🧽', x: SX, y: SY, size: SS },
    { id: 'cup', emoji: 'prop:water', x: CUP.x - 14, y: CUP.y + 2, size: CUP.s, float: true },
  ],
  moves: [
    // 水池從側面看：壓成寬扁的一片
    { at: 0, dur: 0, actor: 'bed', do: 'stretchTo', amount: 1.9 },
    { at: 0, dur: 0, actor: 'pool', do: 'stretchTo', amount: 2 },
    // 開場：他端著一杯水走過來，小海綿在草地上蹦一下等著
    { at: 0.05, actor: 'kid', do: 'moveTo', to: { x: HX, y: HY }, dur: 0.5, anticipate: 3, ease: 'out' },
    { at: 0.05, actor: 'cup', do: 'moveTo', to: { x: CUP.x - 6, y: CUP.y + 2 }, dur: 0.5, anticipate: 3, ease: 'out' },
    { at: 0.3, actor: 'sponge', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.6, actor: 'kid', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: 0.6, actor: 'cup', do: 'moveTo', to: { x: CUP.x, y: CUP.y }, dur: 0.25, ease: 'out' },
    // 第一次：一杯水
    ...d1.moves,
    { at: d1.pop - 0.05, actor: 'cup', do: 'tint', filter: 'saturate(0) brightness(1.15)' },
    { at: d1.pop, actor: 'kid', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: d1.pop, actor: 'kid', do: 'hop', amount: 3, dur: 0.3 },
    { at: d1.pop + 0.05, actor: 'cup', do: 'moveTo', to: { x: -8, y: 77 - 0.42 * CUP.s }, arc: 16, dur: 0.5, ease: 'in' },
    { at: d1.pop + 0.05, actor: 'cup', do: 'spin', times: -1, dur: 0.5, pivot: 'center' },
    // 回頭拿後面的水桶，舉過頭搬過來
    { at: PICK, actor: 'kid', do: 'flip' },
    { at: PICK, actor: 'kid', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: PICK, actor: 'kid', do: 'moveTo', to: { x: 30, y: HY }, dur: 0.3, ease: 'out' },
    { at: PICK + 0.3, actor: 'kid', do: 'swap', emoji: 'hero:mouse/lift' },
    { at: PICK + 0.3, actor: 'bucket', do: 'moveTo', to: { x: 30, y: HY - 19 }, arc: 3, dur: 0.25, ease: 'out' },
    { at: PICK + 0.5, actor: 'kid', do: 'flip' },
    { at: PICK + 0.5, actor: 'kid', do: 'moveTo', to: { x: HX, y: HY }, dur: 0.3, ease: 'inOut' },
    { at: PICK + 0.5, actor: 'bucket', do: 'moveTo', to: { x: HX, y: HY - 19 }, dur: 0.3, ease: 'inOut' },
    { at: P2 - 0.2, actor: 'kid', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: P2 - 0.2, actor: 'bucket', do: 'moveTo', to: { x: BKT.x, y: BKT.y }, dur: 0.2, ease: 'out' },
    // 第二次：一桶水
    ...d2.moves,
    { at: d2.pop - 0.05, actor: 'bucket', do: 'swap', emoji: '🪣' },
    { at: d2.pop, actor: 'kid', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: d2.pop, actor: 'kid', do: 'hop', amount: 4, dur: 0.35 },
    { at: d2.pop, actor: 'kid', do: 'moveTo', to: { x: HX - 3, y: HY }, dur: 0.35, ease: 'out' },
    { at: d2.pop + 0.05, actor: 'bucket', do: 'moveTo', to: { x: -10, y: 77 - 0.42 * BKT.s }, arc: 16, dur: 0.55, ease: 'in' },
    { at: d2.pop + 0.05, actor: 'bucket', do: 'spin', times: -1, dur: 0.55, pivot: 'center' },
    // 停一拍：沒有更大的了，他回頭找……海綿自己一蹭一蹭蹭到池邊
    { at: LOOK, actor: 'kid', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: LOOK, actor: 'kid', do: 'flip' },
    { at: SCOOT, actor: 'sponge', do: 'moveTo', to: { x: (SX + EDGE) / 2, y: SY }, arc: 3, dur: 0.3, ease: 'out' },
    { at: SCOOT + 0.4, actor: 'sponge', do: 'moveTo', to: { x: EDGE, y: SY }, arc: 3, dur: 0.3, ease: 'out' },
    { at: SCOOT + 0.3, actor: 'duck', do: 'tilt', amount: 12, dur: 0.5 },
    // 他回頭：等一下！
    { at: STOP, actor: 'kid', do: 'flip' },
    { at: STOP, actor: 'kid', do: 'swap', emoji: 'hero:mouse/wait' },
    { at: STOP, actor: 'kid', do: 'moveTo', to: { x: HX + 2, y: HY }, dur: 0.2, ease: 'out' },
    // 第三次：整池水
    ...d3.moves,
    { at: P3, actor: 'pool', do: 'stretchTo', amount: 2.5, dur: 1.0, ease: 'in' },
    { at: P3, actor: 'pool', do: 'scaleTo', amount: 0.36, dur: 1.0, ease: 'in' },
    { at: P3 + 0.4, actor: 'duck', do: 'moveTo', to: { x: DX, y: DRY_Y }, dur: 0.6, ease: 'in' },
    { at: d3.pop, actor: 'duck', do: 'hop', amount: 3, dur: 0.3 },
    { at: d3.pop + 0.3, actor: 'duck', do: 'shake', amount: 0.6, dur: 0.5 },
    { at: d3.pop, actor: 'kid', do: 'swap', emoji: 'hero:mouse/fall' },
        // 反轉：爬起來，像拍寶寶打嗝一樣拍拍大海綿的背
    { at: UP, actor: 'kid', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: UP, actor: 'kid', do: 'moveTo', to: { x: PATX, y: HY }, dur: 0.35, ease: 'out' },
    { at: PAT - 0.05, actor: 'kid', do: 'swap', emoji: 'hero:mouse/push' },
    ...[0, 0.25, 0.5].flatMap((d): Move[] => [
      { at: PAT + d, actor: 'kid', do: 'tilt', amount: -6, dur: 0.18 },
      { at: PAT + d + 0.05, actor: 'sponge', do: 'squash', amount: 0.05, dur: 0.15 },
    ]),
    // 嗝！水嘩地全吐回池子裡，海綿縮回小小一塊
    { at: HIC - 0.15, actor: 'sponge', do: 'squash', amount: -0.12, dur: 0.15 },
    { at: HIC, actor: 'sponge', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: HIC, actor: 'kid', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: HIC + 0.1, actor: 'sponge', do: 'scaleTo', amount: 1 / TOTAL, dur: 0.45, ease: 'elastic' },
    { at: HIC + 0.05, actor: 'pool', do: 'stretchTo', amount: 1 / 2.5, dur: 0.5, ease: 'out' },
    { at: HIC + 0.05, actor: 'pool', do: 'scaleTo', amount: 1 / 0.36, dur: 0.5, ease: 'back' },
    { at: HIC + 0.2, actor: 'duck', do: 'moveTo', to: { x: DX, y: DUCK_Y }, dur: 0.4, ease: 'back' },
    { at: BACK, actor: 'duck', do: 'hop', amount: 3, dur: 0.3 },
    // 小海綿跳進他懷裡，抱著亮相
    { at: BACK, actor: 'kid', do: 'swap', emoji: 'hero:mouse/walk' },
    { at: BACK, actor: 'kid', do: 'moveTo', to: { x: HUGX, y: HY }, dur: 0.4, ease: 'out' },
    { at: HUG - 0.05, actor: 'kid', do: 'swap', emoji: 'hero:mouse/hug' },
    { at: HUG - 0.1, actor: 'sponge', do: 'moveTo', to: { x: HUGX + 1, y: HY + 10 }, arc: 8, dur: 0.35, ease: 'out' },
    { at: HUG + 0.3, actor: 'kid', do: 'hop', amount: 3, dur: 0.35 },
    { at: HUG + 0.3, actor: 'sponge', do: 'hop', amount: 3, dur: 0.35 },
    { at: HUG + 0.5, actor: 'duck', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    ...d1.fx,
    ...d2.fx,
    { at: d2.end - 0.2, kind: 'sweat', actor: 'kid', dur: 0.6 },
    ...d3.fx,
    { at: P3 + 0.5, kind: 'sweat', actor: 'duck', dur: 0.6 },
    { at: d3.pop + 0.1, kind: 'puff', actor: 'kid', dur: 0.5 },
    { at: d3.pop + 0.2, kind: 'sweat', actor: 'duck', dur: 0.7 },
    // 嗝：水嘩地吐回池子
    { at: HIC, kind: 'line', actor: 'sponge', to: { x: PX + 4, y: 72 }, color: '#5CC4F7', width: 3.5, dur: 0.5 },
    { at: HIC, kind: 'blow', actor: 'sponge', dx: 10, dy: 8, to: { x: PX + 4, y: 70 }, emoji: '💦', n: 8, dur: 0.55, scale: 1.3 },
    { at: HIC + 0.35, kind: 'burst', x: PX, y: 66, emoji: '💦', n: 7, dur: 0.6, scale: 1.3 },
    { at: HIC + 0.4, kind: 'burst', x: PX, y: 66, emoji: '🫧', n: 6, dur: 0.7, scale: 1.2 },
    // 亮相
    { at: HUG + 0.25, kind: 'burst', actor: 'kid', emoji: '✨', n: 10, dy: -12, dur: 1.0, scale: 1.4 },
    { at: HUG + 0.5, kind: 'burst', actor: 'kid', emoji: '🎉', n: 7, dy: -14, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.35, to: look(72, 49, 1.35) },
    ...d1.camera,
    ...d2.camera,
    // 停一拍：拉開看到水池
    { at: LOOK + 0.1, dur: 0.6, do: 'zoom', amount: 1.35, to: look(76, 48, 1.35) },
    ...d3.camera,
    // 海綿比他還大：再拉開一點
    { at: d3.pop, dur: 0.4, do: 'zoom', amount: 1.3, to: look(76, 45, 1.3) },
    // 亮相：推近抱著小海綿的他
    { at: HUG, dur: 0.5, do: 'zoom', amount: 1.75, to: look(HUGX + 10, 52, 1.75) },
  ],
  lights: [
    { at: d3.pop, dur: 0.05, level: -0.25 },
    { at: d3.pop + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.3, sfx: 'boing' },
    ...d1.cues,
    { at: d1.pop + 0.5, sfx: 'clink' },
    { at: PICK + 0.3, sfx: 'whoosh' },
    ...d2.cues,
    { at: d2.pop + 0.55, sfx: 'bonk' },
    { at: SCOOT, sfx: 'plop' },
    { at: SCOOT + 0.4, sfx: 'plop' },
    { at: STOP, sfx: 'blip' },
    ...d3.cues,
    ...[0, 0.25, 0.5].map((d): Cue => ({ at: PAT + d, sfx: 'tap' })),
    { at: HIC, sfx: 'hic' },
    { at: HIC + 0.1, sfx: 'splash' },
    { at: BACK, sfx: 'bubble' },
    { at: HUG + 0.25, sfx: 'cheer' },
    { at: HUG + 0.35, say: '海綿寶寶' },
  ],
})
