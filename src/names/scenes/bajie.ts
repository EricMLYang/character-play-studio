// 演的是本尊：《西遊記》的豬八戒——貪吃、愛偷懶，民間「豬八戒吃西瓜」的老故事：吃完把西瓜皮亂丟，自己踩到滑倒。造型照 prop:bajie 那一套（豬頭人身、大招風耳、黑色小僧帽、深藍僧袍露出圓肚子、黃腰帶），不照任何改編作品。
import type { Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：豬八戒吃一片西瓜、把皮往後一丟，才走一步就踩到自己丟的皮滑倒，一次摔得比一次慘。
// 同一個「埋頭啃 → 皮往肩膀後面一丟 → 挺著肚子往前走 → 踩到皮『咻』滑出去」、同一聲咻，三次只有摔得越來越慘：
// 滑一小段、仰天倒（氣得把皮踢開）→ 滑更遠、轉半圈、坐地頭暈（再踢開一片，兩片疊在一起）→
// 第三片：停一拍，他這次學乖了，看著地上的皮、搖搖頭、大大一步跨過去，得意地繼續走——一腳踩在剛剛踢開的那兩片上，
// 整個人飛起來仰天倒，坐在西瓜皮上像坐雪橇一路倒著滑回去，撞翻整堆西瓜。
// 反轉：西瓜皮從天上一片片掉下來，一片剛好扣在他頭上當帽子，另一片西瓜掉進他手裡——他馬上忘了痛，埋頭啃：「豬八戒」。
const S = 40 // 豬八戒的 size（prop 圖留白多，鏡頭再推近補）
const G = 77 - 0.42 * S // 豬八戒站在地上的 y
const E = 112 // 吃西瓜的地方（西瓜堆左邊，面向右）
const R = 20 // 西瓜皮的 size（用一大片西瓜只畫最下面那截綠皮）
const RG = 77 - 0.42 * R // 西瓜皮落在地上的 y
const CUT = 0.74 // 一片西瓜從這裡往下是白綠色的皮
const RINDS = ['r1', 'r2', 'r3']
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡（引擎還會再夾在背景裡） */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })
const at = (x: number): Vec => ({ x, y: RG }) // 地上的西瓜皮
// 西瓜皮在黃土路上要清楚：白描邊＋一點亮
const RIND_TINT = 'saturate(1.25) brightness(1.05) drop-shadow(0 0 1px #FFFFFF) drop-shadow(0 0 2px #FFFFFF)'

/**
 * 主軸笑點的前半：埋頭啃一片西瓜（汁亂噴）→ 皮往肩膀後面一丟，落在他身後（左邊）的路上。
 * k 是第幾次，t 是開始啃的時間，to 是皮落地的 x。回傳 land＝皮落地的時間。
 */
function eatToss(t: number, k: number, slice: string, rind: string, to: number) {
  const n = 3 + Math.min(k, 1) // 啃幾口：一次比一次猛
  const gap = k === 0 ? 0.15 : 0.12
  const eatEnd = t + 0.08 + n * gap
  const fly = 0.3 + 0.04 * k
  const land = eatEnd + 0.05 + fly
  const moves: Move[] = [
    { at: t, actor: slice, do: 'vanish', dur: 0.08 },
    { at: t, actor: 'bj', do: 'swap', emoji: 'prop:bajie-melon' },
    ...Array.from({ length: n }, (_, i): Move => ({ at: t + 0.08 + gap * i, actor: 'bj', do: 'squash', amount: 0.07 + 0.03 * k, dur: gap - 0.02 })),
    { at: t + 0.1, actor: 'bj', do: 'shake', amount: 0.3 + 0.2 * k, dur: n * gap - 0.05 },
    // 啃完：滿足地挺起肚子，皮往肩膀後面一丟
    { at: eatEnd, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
    { at: eatEnd, actor: rind, do: 'pop', dur: 0.08 },
    { at: eatEnd + 0.05, actor: rind, do: 'moveTo', to: at(to), arc: 16 + 6 * k, dur: fly, ease: 'in' },
    { at: eatEnd + 0.05, actor: rind, do: 'rotateTo', amount: k === 1 ? -50 : -25, dur: fly / 2 },
    { at: eatEnd + 0.05 + fly / 2, actor: rind, do: 'rotateTo', amount: k === 1 ? 50 : 25, dur: fly / 2 },
    { at: land, actor: rind, do: 'squash', amount: 0.25, dur: 0.15 },
  ]
  const fx: Fx[] = [
    { at: t + 0.1, kind: 'burst', actor: 'bj', emoji: '💦', n: 3 + 2 * k, dx: 2, dy: 14, dur: 0.4 + 0.05 * n, scale: 0.55 + 0.1 * k },
    { at: land, kind: 'burst', x: to, y: 74, emoji: '✨', n: 3, dur: 0.35, scale: 0.45 },
  ]
  const cues: Cue[] = [
    ...Array.from({ length: n }, (_, i): Cue => ({ at: t + 0.08 + gap * i, sfx: 'gulp' })),
    { at: eatEnd + 0.05, sfx: 'whoosh' },
    { at: land, sfx: 'plop' },
  ]
  return { moves, fx, cues, land }
}

/**
 * 主軸笑點的後半：踩到皮「咻」地滑出去——嚇一跳整個人飛起來，跟著皮往左滑，落地倒在地上。
 * k 是第幾次（0、1），t 是腳踩上皮那一刻，from／to 是他滑的起點終點，rindTo 是皮滑到哪。回傳 land＝落地的時間。
 */
function slip(t: number, k: number, from: number, to: number, rind: string, rindTo: number) {
  const fly = 0.3 + 0.12 * k
  const land = t + fly
  const moves: Move[] = [
    { at: t, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
    { at: t, actor: 'bj', do: 'moveTo', to: { x: to, y: G }, dur: fly, ease: 'out' },
    { at: t, actor: 'bj', do: 'hop', amount: 6 + 5 * k, dur: fly },
    { at: t, actor: 'bj', do: 'tilt', amount: 12 + 6 * k, dur: fly },
    // 皮跟著腳滑出去
    { at: t, actor: rind, do: 'moveTo', to: at(rindTo), dur: fly + 0.05, ease: 'out' },
    { at: t, actor: rind, do: 'shake', amount: 0.6, dur: 0.2 },
    // 落地：第一次仰天倒、第二次坐地頭暈
    { at: land, actor: 'bj', do: 'swap', emoji: k === 0 ? 'prop:bajie-full' : 'prop:bajie-dizzy' },
    { at: land, actor: 'bj', do: 'squash', amount: 0.22 + 0.08 * k, dur: 0.25 },
  ]
  // 第二次：滑到一半轉半圈
  if (k === 1) moves.push({ at: t + fly * 0.45, actor: 'bj', do: 'flip' }, { at: land, actor: 'bj', do: 'flip' })
  const fx: Fx[] = [
    { at: t, kind: 'burst', x: from - 8, y: 73, emoji: '💥', n: 1, dur: 0.3, scale: 0.6 + 0.3 * k },
    { at: t + 0.05, kind: 'sweat', actor: 'bj', dur: 0.5 },
    { at: land, kind: 'puff', actor: 'bj', n: 5 + 3 * k, dur: 0.45 },
  ]
  if (k === 1) fx.push({ at: land + 0.05, kind: 'dizzy', actor: 'bj', dur: 0.6 })
  const camera: Camera[] = [
    { at: t, dur: 0.3, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: from - 6, y: 70 } },
    { at: land, dur: 0.3, do: 'shake', amount: 0.6 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at: t, sfx: 'slide' }, { at: land, sfx: 'bonk' }]
  return { moves, fx, camera, cues, land }
}

/** 氣呼呼站起來，一腳把皮踢開（皮貼著地滑到 to）。x 是他站的地方。 */
function kick(t: number, x: number, rind: string, to: number) {
  const moves: Move[] = [
    { at: t, actor: 'bj', do: 'swap', emoji: 'prop:bajie-angry' },
    { at: t + 0.05, actor: 'bj', do: 'shake', amount: 0.5, dur: 0.2 },
    { at: t + 0.18, actor: rind, do: 'moveTo', to: at(to), dur: 0.3, ease: 'out' },
    { at: t + 0.18, actor: rind, do: 'hop', amount: 2, dur: 0.25 },
  ]
  const fx: Fx[] = [{ at: t + 0.18, kind: 'puff', x: x - 12, y: 74, n: 3, dur: 0.3 }]
  const cues: Cue[] = [{ at: t + 0.18, sfx: 'tap' }]
  return { moves, fx, cues }
}

/** 走過去：一步一步，面向哪邊由呼叫的人先 flip */
const walk = (t: number, x: number, dur: number, ease: Move['ease'] = 'linear'): Move =>
  ({ at: t, actor: 'bj', do: 'moveTo', to: { x, y: G }, dur, ease })

// 時間表
const IN = 0 // 扛著釘耙走過來
const SEE = 0.4 // 看到西瓜：兩眼發亮流口水
const LOOK = 0.7 // 左看右看
// 第一次
const EAT1 = 1.0
const R1 = 88
const t1 = eatToss(EAT1, 0, 's1', 'r1', R1)
const W1 = t1.land + 0.05
const STEP1 = t1.land + 0.42 // 皮落地 0.4 秒後才踩到
const X1 = 96 // 踩到時站的地方（左腳在皮上）
const SL1 = 82
const p1 = slip(STEP1, 0, X1, SL1, 'r1', 70)
const K1 = 40
const k1 = kick(p1.land + 0.3, SL1, 'r1', K1)
// 第二次
const BACK2 = k1.moves[0].at + 0.4
const EAT2 = BACK2 + 0.28
const R2 = 90
const t2 = eatToss(EAT2, 1, 's2', 'r2', R2)
const STEP2 = t2.land + 0.4
const X2 = 98
const SL2 = 68
const p2 = slip(STEP2, 1, X2, SL2, 'r2', 56)
const K2 = 49
const k2 = kick(p2.land + 0.38, SL2, 'r2', K2)
// 第三次
const BACK3 = k2.moves[0].at + 0.38
const EAT3 = BACK3 + 0.35
const R3 = 84
const t3 = eatToss(EAT3, 2, 's3', 'r3', R3)
const STOP = t3.land + 0.12 // 走到皮前面停下來
const XS = 110
const OVER = STOP + 0.45 // 停一拍之後，大大一步跨過去
const XO = 72
const PROUD = OVER + 0.35
const STEP3 = PROUD + 0.28 // 一腳踩在那兩片上
const X3 = 56
const UP3 = STEP3 + 0.34 // 飛起來、仰天倒在皮上
const SLED = UP3 + 0.05 // 坐著西瓜皮一路倒著滑回去
const CRASH = SLED + 0.42 // 撞翻整堆西瓜
const XC = 116
// 反轉：皮從天上掉下來
const STAND = CRASH + 0.35
const HAT = STAND + 0.22 // 一片扣在頭上
const CATCH = HAT + 0.1 // 一片西瓜掉進手裡
const FULL = CATCH + 0.45 // 啃完：吃撐了往後一躺、拍肚子
const SAY = FULL + 0.1
const HEAD_FULL = { x: XC + 14, y: G - 8 - 0.46 * R } // 躺下來時頭頂在右上
const HEAD = { x: XC + 2, y: G - 0.34 * S - 0.46 * R - 1 } // 帽子（皮的 actor 位置）

/** 滑雪橇：皮在他屁股底下，x 是他的位置 */
const under = (x: number, i: number) => at(x - 4 + 6 * i)

export default scene({
  duration: SAY + 1.2,
  bg: { top: '#5CC3F2', bottom: '#CFF1FF', floor: '#E2BE7E', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 14, y: 77 - 0.42 * 62, size: 62 },
    // 西瓜堆：一整顆、半顆、三片切好的
    { id: 'whole', emoji: 'prop:watermelon', x: 146, y: 77 - 0.42 * 24, size: 24 },
    { id: 'half', emoji: 'prop:watermelon-half', x: 134, y: 77 - 0.42 * 17, size: 17 },
    { id: 's3', emoji: 'prop:watermelon-slice', x: 150, y: 77 - 0.42 * 13 - 9, size: 13, float: true },
    { id: 's2', emoji: 'prop:watermelon-slice', x: 140, y: 77 - 0.42 * 13 - 5, size: 13, float: true },
    { id: 's1', emoji: 'prop:watermelon-slice', x: 127, y: 77 - 0.42 * 13, size: 13 },
    { id: 's4', emoji: 'prop:watermelon-slice', x: 146, y: 40, size: 13, hidden: true, float: true },
    // 西瓜皮：只畫一片西瓜最下面那截
    ...RINDS.map((id) => ({ id, emoji: 'prop:watermelon-slice', x: E + 4, y: G - 8 - 0.34 * R, size: R, half: 'bottom' as const, cut: CUT, hidden: true, tint: RIND_TINT })),
    { id: 'bj', emoji: 'prop:bajie', x: 86, y: G, size: S, flip: true },
    // 最後扣在頭上的那片（畫在他前面）
    { id: 'hat', emoji: 'prop:watermelon-slice', x: XC, y: 10, size: R, half: 'bottom' as const, cut: CUT, hidden: true, float: true, tint: RIND_TINT },
  ],
  moves: [
    // 開場：扛著釘耙走過來，看到西瓜兩眼發亮流口水
    walk(IN, E, SEE - IN, 'out'),
    { at: SEE, actor: 'bj', do: 'swap', emoji: 'prop:bajie-drool' },
    { at: SEE + 0.05, actor: 'bj', do: 'hop', amount: 4, dur: 0.3 },
    // 左看右看：沒人
    { at: LOOK, actor: 'bj', do: 'flip' },
    { at: LOOK + 0.2, actor: 'bj', do: 'flip' },
    { at: LOOK + 0.22, actor: 'bj', do: 'squash', amount: -0.1, dur: 0.15 },
    // 第一次：啃、丟、得意地往前走——踩到，滑一下仰天倒；氣呼呼把皮踢開
    ...t1.moves,
    { at: W1, actor: 'bj', do: 'flip' },
    { at: W1 + 0.05, actor: 'bj', do: 'squash', amount: -0.08, dur: 0.2 },
    walk(W1 + 0.1, X1, STEP1 - W1 - 0.1),
    ...p1.moves,
    ...k1.moves,
    // 第二次：急著走回去拿第二片，啃得更猛，皮隨手一甩
    { at: BACK2, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
    { at: BACK2, actor: 'bj', do: 'flip' },
    walk(BACK2, E, EAT2 - BACK2 - 0.02),
    ...t2.moves,
    { at: t2.land, actor: 'bj', do: 'flip' },
    walk(t2.land + 0.05, X2, STEP2 - t2.land - 0.05),
    ...p2.moves,
    ...k2.moves,
    // 第三次：肚子更圓了
    { at: BACK3, actor: 'bj', do: 'swap', emoji: 'prop:bajie' },
    { at: BACK3, actor: 'bj', do: 'flip' },
    walk(BACK3, E, EAT3 - BACK3 - 0.02),
    ...t3.moves,
    { at: EAT3 + 0.2, actor: 'bj', do: 'stretchTo', amount: 1.1, dur: 0.4, ease: 'back' },
    { at: t3.land - 0.15, actor: 'bj', do: 'flip' },
    walk(t3.land - 0.1, XS, STOP - t3.land + 0.1, 'out'),
    // 停一拍：低頭看著皮，搖搖頭「我才不會上當」
    { at: STOP + 0.05, actor: 'bj', do: 'tilt', amount: -10, dur: 0.22 },
    { at: STOP + 0.27, actor: 'bj', do: 'tilt', amount: 10, dur: 0.22 },
    // 大大一步跨過去
    { at: OVER - 0.1, actor: 'bj', do: 'squash', amount: 0.12, dur: 0.1 },
    { at: OVER, actor: 'bj', do: 'moveTo', to: { x: XO, y: G }, arc: 12, dur: 0.32, ease: 'inOut' },
    { at: OVER + 0.32, actor: 'bj', do: 'squash', amount: -0.1, dur: 0.18 },
    // 得意地繼續走——
    walk(PROUD, X3, STEP3 - PROUD),
    // ——一腳踩在那兩片上：飛起來，仰天倒在皮上
    { at: STEP3, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
    { at: STEP3, actor: 'bj', do: 'moveTo', to: { x: X3 - 4, y: G }, dur: UP3 - STEP3, ease: 'out' },
    { at: STEP3, actor: 'bj', do: 'hop', amount: 16, dur: UP3 - STEP3 },
    { at: STEP3, actor: 'bj', do: 'tilt', amount: 18, dur: UP3 - STEP3 },
    { at: STEP3, actor: 'r1', do: 'moveTo', to: under(X3 - 4, 0), dur: UP3 - STEP3, ease: 'out' },
    { at: STEP3, actor: 'r2', do: 'moveTo', to: under(X3 - 4, 1), dur: UP3 - STEP3, ease: 'out' },
    { at: STEP3, actor: 'r1', do: 'hop', amount: 3, dur: 0.3 },
    { at: STEP3, actor: 'r2', do: 'hop', amount: 4, dur: 0.3 },
    { at: UP3, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
    { at: UP3, actor: 'bj', do: 'stretchTo', amount: 1 / 1.1, dur: 0.05 },
    // 坐著西瓜皮一路倒著滑回去（路上把第三片也鏟起來）
    { at: SLED, actor: 'bj', do: 'moveTo', to: { x: XC, y: G }, dur: CRASH - SLED, ease: 'in' },
    { at: SLED, actor: 'r1', do: 'moveTo', to: under(XC, 0), dur: CRASH - SLED, ease: 'in' },
    { at: SLED, actor: 'r2', do: 'moveTo', to: under(XC, 1), dur: CRASH - SLED, ease: 'in' },
    { at: SLED + (CRASH - SLED) * 0.72, actor: 'r3', do: 'moveTo', to: under(XC, 2), dur: (CRASH - SLED) * 0.28, ease: 'linear' },
    // 撞翻整堆西瓜：西瓜彈起來，皮和切好的西瓜飛上天
    { at: CRASH, actor: 'bj', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: CRASH, actor: 'whole', do: 'hop', amount: 10, dur: 0.45 },
    { at: CRASH, actor: 'half', do: 'hop', amount: 14, dur: 0.5 },
    { at: CRASH + 0.02, actor: 'whole', do: 'shake', amount: 1, dur: 0.4 },
    ...RINDS.map((id, i): Move => ({ at: CRASH + 0.02 * i, actor: id, do: 'moveTo', to: { x: XC - 30 + 28 * i, y: -10 }, dur: 0.3, ease: 'out' })),
    { at: CRASH + 0.02, actor: 's4', do: 'pop', dur: 0.1 },
    { at: CRASH + 0.02, actor: 's4', do: 'moveTo', to: { x: XC + 14, y: 6 }, dur: 0.3, ease: 'out' },
    // 皮一片片掉下來：兩片落在旁邊地上
    { at: CRASH + 0.4, actor: 'r1', do: 'moveTo', to: at(XC - 34), dur: 0.35, ease: 'in' },
    { at: CRASH + 0.5, actor: 'r3', do: 'moveTo', to: at(XC + 30), dur: 0.35, ease: 'in' },
    // 他爬起來、抬頭——
    { at: STAND, actor: 'bj', do: 'swap', emoji: 'prop:bajie-shock' },
    { at: STAND, actor: 'bj', do: 'hop', amount: 3, dur: 0.2 },
    // 一片扣在頭上當帽子
    { at: CRASH + 0.4, actor: 'r2', do: 'vanish', dur: 0.02 },
    { at: CRASH + 0.4, actor: 'hat', do: 'pop', dur: 0.05 },
    { at: CRASH + 0.4, actor: 'hat', do: 'moveTo', to: HEAD, dur: HAT - CRASH - 0.4, ease: 'in' },
    { at: HAT, actor: 'hat', do: 'rotateTo', amount: -12, dur: 0.1 },
    { at: HAT, actor: 'bj', do: 'squash', amount: 0.15, dur: 0.18 },
    { at: HAT, actor: 'hat', do: 'hop', amount: -1.5, dur: 0.18 },
    // 一片西瓜掉進手裡：馬上忘了痛，埋頭啃
    { at: CRASH + 0.5, actor: 's4', do: 'moveTo', to: { x: XC + 1, y: G + 2 }, dur: CATCH - CRASH - 0.5, ease: 'in' },
    { at: CATCH, actor: 's4', do: 'vanish', dur: 0.04 },
    { at: CATCH, actor: 'bj', do: 'swap', emoji: 'prop:bajie-melon' },
    ...[0, 1].map((i): Move => ({ at: CATCH + 0.12 + 0.15 * i, actor: 'bj', do: 'squash', amount: 0.08, dur: 0.13 })),
    ...[0, 1].map((i): Move => ({ at: CATCH + 0.12 + 0.15 * i, actor: 'hat', do: 'hop', amount: -0.8, dur: 0.13 })),
    // 一下就啃光：吃撐了往後一躺、拍肚子打飽嗝，帽子還頂在頭上
    { at: FULL, actor: 'bj', do: 'swap', emoji: 'prop:bajie-full' },
    { at: FULL, actor: 'hat', do: 'moveTo', to: HEAD_FULL, dur: 0.12, ease: 'out' },
    { at: FULL, actor: 'hat', do: 'rotateTo', amount: 34, dur: 0.12 },
    ...[0, 1, 2].map((i): Move => ({ at: FULL + 0.35 + 0.3 * i, actor: 'bj', do: 'squash', amount: 0.06, dur: 0.2 })),
    ...[0, 1, 2].map((i): Move => ({ at: FULL + 0.35 + 0.3 * i, actor: 'hat', do: 'hop', amount: -0.6, dur: 0.2 })),
  ],
  fx: [
    { at: SEE, kind: 'burst', actor: 's1', emoji: '✨', n: 5, dy: 4, dur: 0.6, scale: 0.8 },
    ...t1.fx,
    ...p1.fx,
    ...k1.fx,
    ...t2.fx,
    ...p2.fx,
    ...k2.fx,
    ...t3.fx,
    { at: OVER + 0.35, kind: 'burst', actor: 'bj', emoji: '✨', n: 4, dy: -2, dur: 0.4, scale: 0.6 },
    { at: STEP3, kind: 'burst', x: X3 - 8, y: 73, emoji: '💥', n: 1, dur: 0.35, scale: 1.3 },
    { at: STEP3 + 0.05, kind: 'sweat', actor: 'bj', dur: 0.5 },
    { at: CRASH, kind: 'burst', x: XC + 18, y: 62, emoji: '💥', n: 1, dur: 0.4, scale: 1.6 },
    { at: CRASH + 0.05, kind: 'puff', actor: 'bj', n: 8, dur: 0.5 },
    { at: CRASH + 0.05, kind: 'dizzy', actor: 'bj', dur: 0.45 },
    { at: FULL + 0.05, kind: 'burst', x: XC - 22, y: 36, emoji: '✨', n: 8, dur: 0.8, scale: 1.1 },
    { at: FULL + 0.3, kind: 'burst', x: XC - 8, y: 30, emoji: '🎉', n: 7, dur: 0.9, scale: 1.1 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.25, to: aim({ x: 94, y: 50 }, 1.25) },
    ...p1.camera,
    ...p2.camera,
    // 停一拍：推近他看著皮、搖頭
    { at: STOP, dur: 0.4, do: 'zoom', amount: 1.5, to: aim({ x: XS - 8, y: 54 }, 1.5) },
    // 跨過去、踩到、倒著滑回去：退到全景
    { at: OVER + 0.1, dur: 0.35, do: 'zoom', amount: 1.15, to: aim({ x: 86, y: 48 }, 1.15) },
    { at: STEP3, dur: 0.35, do: 'punch', amount: 0.1, to: { x: X3 - 6, y: 66 } },
    { at: STEP3, dur: 0.3, do: 'shake', amount: 1 },
    { at: CRASH, dur: 0.4, do: 'shake', amount: 1.4 },
    // 亮相
    { at: STAND, dur: 0.5, do: 'zoom', amount: 1.6, to: aim({ x: XC - 2, y: 50 }, 1.6) },
    { at: FULL, dur: 0.3, do: 'zoom', amount: 1.7, to: aim({ x: XC, y: 54 }, 1.7) },
  ],
  lights: [
    { at: CRASH, dur: 0.05, level: -0.25 },
    { at: CRASH + 0.05, dur: 0.3, level: 0 },
    { at: FULL, dur: 0.05, level: -0.3 },
    { at: FULL + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: SEE, sfx: 'blip' },
    { at: LOOK, sfx: 'tap' },
    ...t1.cues,
    ...p1.cues,
    ...k1.cues,
    ...t2.cues,
    ...p2.cues,
    ...k2.cues,
    ...t3.cues,
    { at: OVER, sfx: 'boing' },
    { at: STEP3, sfx: 'slide' },
    { at: UP3, sfx: 'bonk' },
    { at: SLED, sfx: 'whoosh' },
    { at: CRASH, sfx: 'bonk' },
    { at: CRASH + 0.03, sfx: 'rumble' },
    { at: HAT, sfx: 'plop' },
    { at: CATCH + 0.12, sfx: 'gulp' },
    { at: CATCH + 0.27, sfx: 'gulp' },
    { at: FULL, sfx: 'hic' },
    { at: SAY, say: '豬八戒' },
    { at: SAY + 0.45, sfx: 'cheer' },
  ],
})
