// 演的是字面意思：恐（害怕）＋龍——最兇的恐龍吼跑了老虎、吼飛了獅子，結果被一隻小小雞「啾」一聲嚇得躲回蛋殼裡。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：恐龍一吼，從草叢跳出來的對手就被嚇跑——一個比一個大、被吼得一個比一個遠；最後跳出來的是一隻小小雞，
// 牠「啾」一聲，換大恐龍嚇得跳回蛋殼裡發抖（恐龍的「恐」就是害怕）。
// 開場：蛋搖兩下、喀！蓋子飛上天，小恐龍跳出來。
// 同一個草叢、同一個站位、同一聲大吼（💨 吹過去），只有結果越來越大：老虎嚇得掉頭逃走 → 獅子被吼得翻滾飛出畫面 →
// 先停一拍（草叢抖得最兇、天色暗下來，恐龍蹲低蓄力），跳出來的是一隻小雞。恐龍照樣使出最大的一吼——小雞只歪了一下。
// 反轉：小雞「啾！」——大恐龍嚇得一跳跳回蛋殼裡，飛上天的蛋殼蓋子剛好掉回頭上：「恐龍」。
const S = 36 // 恐龍
const G = 77 - 0.42 * S
const DX = 92 // 恐龍站的地方（每次都在這裡吼）
const EX = 118 // 蛋
const ES = 30
const EY = 77 - 0.42 * ES
const IN_EGG = G - 4 // 坐進蛋殼裡（腳被下半個蛋殼擋住）
const CAP_Y = IN_EGG - 17.5 // 蛋殼蓋子戴在頭上
const BUSH = 24 // 草叢（對手都從這裡跳出來）
const BS = 30
const FX0 = 52 // 對手站的地方
const TS = 26 // 老虎
const LS = 32 // 獅子
const CS = 14 // 小雞
const gy = (s: number) => 77 - 0.42 * s
/** 吼完撐住吼的姿勢多久 */
const HOLD = 0.5

/** 草叢抖一抖，對手從草叢裡跳出來站好。at 是跳出來那一刻、k 第幾次（抖得越來越兇） */
function emerge(at: number, k: number, id: string, size: number) {
  const shake = 0.5 + 0.3 * k
  const moves: Move[] = [
    { at: at - shake, actor: 'bush', do: 'shake', amount: 0.8 + 0.6 * k, dur: shake },
    { at, actor: 'bush', do: 'squash', amount: 0.2, dur: 0.25 },
    { at, actor: id, do: 'pop', dur: 0.15 },
    { at, actor: id, do: 'moveTo', to: { x: FX0, y: gy(size) }, arc: 10, dur: 0.4, ease: 'out' },
  ]
  const fx: Fx[] = [{ at, kind: 'burst', actor: 'bush', emoji: '🍃', n: 5 + 2 * k, dur: 0.6, scale: 1.2 }]
  const cues: Cue[] = [{ at: at - shake, sfx: 'slide' }, { at, sfx: 'boing' }]
  return { moves, fx, cues }
}

/**
 * 主軸笑點：恐龍蹲低（預備）→ 仰頭大吼、一串 💨 吹向對手 → 撐住。k 是第幾次，越後面吼得越大、鏡頭震得越兇、音效多疊一個。
 * at 是吼出來那一刻。
 */
function roar(at: number, k: number, target: string) {
  const moves: Move[] = [
    { at: at - 0.35, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: at - 0.35, actor: 'dino', do: 'squash', amount: 0.08 + 0.03 * k, dur: 0.35 },
    { at, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at, actor: 'dino', do: 'squash', amount: -0.12 - 0.04 * k, dur: 0.35 },
    { at: at + 0.15, actor: 'dino', do: 'shake', amount: 0.4 + 0.3 * k, dur: HOLD - 0.15 },
  ]
  const fx: Fx[] = [
    { at, kind: 'blow', actor: 'dino', target, dx: -12, dy: 6, dur: 0.6, scale: 2.4 + 0.6 * k },
    { at: at + 0.15, kind: 'burst', actor: target, emoji: '💥', n: 1, dx: k >= 2 ? 12 : 0, dur: 0.4, scale: 1.2 + 0.3 * k },
    { at: at + 0.05, kind: 'puff', actor: 'dino', n: 4 + 3 * k, dur: 0.5 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.04 * k, to: { x: DX - 10, y: 52 } },
    { at, dur: 0.35 + 0.1 * k, do: 'shake', amount: 0.8 + 0.6 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'rumble' }, { at: at + 0.05, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.1, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

// 開場：蛋搖兩下，喀！
const CRACK = 0.9
// 第一次：老虎
const E1 = 1.85
const R1 = E1 + 0.85
// 第二次：獅子
const E2 = R1 + 1.35
const R2 = E2 + 0.9
// 停一拍：草叢抖得最兇……跳出來一隻小雞
const E3 = R2 + 1.8
const R3 = E3 + 0.9
// 反轉：小雞「啾」，恐龍跳回蛋殼
const PEEP = R3 + 0.95
const JUMP = PEEP + 0.5
const LAND = JUMP + 0.5
const CAP = LAND + 0.35 // 蛋殼蓋子掉回頭上
const SAY = CAP + 0.15

const e1 = emerge(E1, 0, 'tiger', TS)
const r1 = roar(R1, 0, 'tiger')
const e2 = emerge(E2, 1, 'lion', LS)
const r2 = roar(R2, 1, 'lion')
const e3 = emerge(E3, 2, 'chick', CS)
const r3 = roar(R3, 2, 'chick')

export default scene({
  duration: Math.round((SAY + 1.6) * 100) / 100,
  bg: { top: '#7FD3C4', bottom: '#E4F7D8', floor: '#8CC25A', scenery: 'forest' },
  actors: [
    { id: 'volcano', emoji: '🌋', x: 146, y: 77 - 0.42 * 22, size: 22 },
    { id: 'palm', emoji: '🌴', x: 8, y: 77 - 0.42 * 40, size: 40 },
    { id: 'tiger', emoji: 'prop:tiger', x: BUSH, y: gy(TS), size: TS, flip: true, hidden: true },
    { id: 'lion', emoji: 'prop:lion', x: BUSH, y: gy(LS), size: LS, flip: true, hidden: true, pivot: 'center' },
    { id: 'chick', emoji: '🐤', x: BUSH, y: gy(CS), size: CS, flip: true, hidden: true },
    { id: 'bush', emoji: 'prop:bush', x: BUSH, y: gy(BS), size: BS },
    { id: 'dino', emoji: 'hero:dino/happy', x: EX, y: IN_EGG, size: S, hidden: true },
    { id: 'eggB', emoji: 'prop:egg', x: EX, y: EY, size: ES, half: 'bottom', cut: 0.58 },
    { id: 'eggT', emoji: 'prop:egg', x: EX, y: EY, size: ES, half: 'top', cut: 0.58, pivot: 'center' },
  ],
  moves: [
    // 開場：蛋搖兩下（越搖越大力），喀！蓋子飛上天，小恐龍跳出來
    { at: 0.15, actor: 'eggT', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 0.15, actor: 'eggB', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 0.5, actor: 'eggT', do: 'shake', amount: 1.6, dur: 0.3 },
    { at: 0.5, actor: 'eggB', do: 'shake', amount: 1.6, dur: 0.3 },
    { at: CRACK, actor: 'eggT', do: 'moveTo', to: { x: EX + 6, y: -40 }, dur: 0.5, ease: 'out' },
    { at: CRACK, actor: 'eggT', do: 'rotateTo', amount: 180, dur: 0.5 },
    { at: CRACK, actor: 'dino', do: 'pop', dur: 0.2 },
    { at: CRACK + 0.1, actor: 'dino', do: 'moveTo', to: { x: DX, y: G }, arc: 10, dur: 0.45, ease: 'out' },
    { at: CRACK + 0.55, actor: 'dino', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: CRACK + 0.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },

    // 第一次：老虎跳出來、小小吼一聲；恐龍一吼，老虎嚇得掉頭逃走
    ...e1.moves,
    { at: E1 + 0.45, actor: 'tiger', do: 'swap', emoji: 'prop:tiger-roar' },
    { at: E1 + 0.45, actor: 'tiger', do: 'hop', amount: 2, dur: 0.25 },
    ...r1.moves,
    { at: R1 + 0.12, actor: 'tiger', do: 'swap', emoji: 'prop:tiger-scared' },
    { at: R1 + 0.12, actor: 'tiger', do: 'flip' },
    { at: R1 + 0.12, actor: 'tiger', do: 'hop', amount: 4, dur: 0.3 },
    { at: R1 + 0.45, actor: 'tiger', do: 'moveTo', to: { x: -30, y: gy(TS) }, dur: 0.75, ease: 'in' },
    { at: R1 + HOLD, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: R1 + HOLD + 0.1, actor: 'dino', do: 'hop', amount: 2, dur: 0.3 },

    // 第二次：獅子跳出來、大吼一聲；恐龍吼得更大，獅子被吼得翻滾飛出畫面
    ...e2.moves,
    { at: E2 + 0.45, actor: 'lion', do: 'swap', emoji: 'prop:lion-roar' },
    { at: E2 + 0.45, actor: 'lion', do: 'hop', amount: 2, dur: 0.25 },
    ...r2.moves,
    { at: R2 + 0.12, actor: 'lion', do: 'swap', emoji: 'prop:lion-scared' },
    { at: R2 + 0.2, actor: 'lion', do: 'moveTo', to: { x: -10, y: -14 }, arc: 14, dur: 1.0, ease: 'linear' },
    { at: R2 + 0.2, actor: 'lion', do: 'spin', times: 3, dur: 1.0 },
    { at: R2 + HOLD, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: R2 + HOLD + 0.1, actor: 'dino', do: 'hop', amount: 4, dur: 0.35 },

    // 停一拍：草叢抖得最久最兇，恐龍蹲低等著……跳出來的是一隻小雞
    ...e3.moves,
    { at: E3 - 1.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: E3 - 1.1, actor: 'dino', do: 'squash', amount: 0.12, dur: 0.6 },
    { at: E3 + 0.45, actor: 'chick', do: 'hop', amount: 2, dur: 0.2 },
    // 恐龍照樣使出最大的一吼——小雞只被吹得歪一下
    ...r3.moves,
    { at: R3, actor: 'dino', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: R3 + 0.15, actor: 'chick', do: 'tilt', amount: 18, dur: 0.6 },
    { at: R3 + HOLD + 0.1, actor: 'dino', do: 'scaleTo', amount: 1 / 1.12, dur: 0.25 },
    { at: R3 + HOLD + 0.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    // 反轉：小雞「啾！」——恐龍嚇得一跳，跳回蛋殼裡發抖
    { at: PEEP - 0.12, actor: 'chick', do: 'squash', amount: 0.25, dur: 0.12 },
    { at: PEEP, actor: 'chick', do: 'hop', amount: 4, dur: 0.3 },
    { at: PEEP, actor: 'chick', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: PEEP + 0.05, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: PEEP + 0.05, actor: 'dino', do: 'hop', amount: 3, dur: 0.2 },
    { at: PEEP + 0.25, actor: 'dino', do: 'shake', amount: 1.4, dur: JUMP - PEEP - 0.25 },
    { at: JUMP, actor: 'dino', do: 'moveTo', to: { x: EX, y: IN_EGG }, arc: 22, dur: 0.5, ease: 'inOut' },
    { at: LAND, actor: 'eggB', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: LAND, actor: 'dino', do: 'squash', amount: 0.08, dur: 0.2 },
    { at: LAND + 0.1, actor: 'dino', do: 'shake', amount: 1.2, dur: SAY + 1.5 - LAND },
    // 飛上天的蛋殼蓋子掉回頭上
    { at: CAP - 0.35, actor: 'eggT', do: 'moveTo', to: { x: EX, y: CAP_Y }, dur: 0.35, ease: 'in' },
    { at: CAP - 0.35, actor: 'eggT', do: 'rotateTo', amount: 180, dur: 0.35 },
    { at: CAP + 0.1, actor: 'eggT', do: 'shake', amount: 1.2, dur: SAY + 1.4 - CAP },
    // 小雞往前跳一步，挺胸
    { at: SAY + 0.3, actor: 'chick', do: 'moveTo', to: { x: EX - 30, y: gy(CS) }, arc: 4, dur: 0.5, ease: 'out' },
    { at: SAY + 0.8, actor: 'chick', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    // 開場
    { at: CRACK, kind: 'burst', actor: 'eggB', emoji: '💥', n: 1, dur: 0.4, scale: 1.6 },
    { at: CRACK + 0.05, kind: 'puff', actor: 'eggB', n: 6, dur: 0.5 },
    ...e1.fx,
    ...r1.fx,
    { at: R1 + 0.2, kind: 'sweat', actor: 'tiger' },
    ...e2.fx,
    ...r2.fx,
    { at: R2 + 0.25, kind: 'burst', actor: 'lion', emoji: '💫', n: 4, dur: 0.6, scale: 1.3 },
    ...e3.fx,
    ...r3.fx,
    // 小雞「啾」
    { at: PEEP, kind: 'burst', actor: 'chick', emoji: '❗', n: 1, dy: -2, dur: 0.5, scale: 1.6 },
    { at: PEEP + 0.1, kind: 'sweat', actor: 'dino', dur: 0.8 },
    { at: LAND, kind: 'puff', actor: 'eggB', n: 8, dur: 0.5 },
    { at: CAP, kind: 'burst', actor: 'eggT', emoji: '💦', n: 4, dur: 0.6, scale: 1.4 },
    { at: SAY, kind: 'sweat', actor: 'dino', dur: 1.2 },
    { at: SAY + 0.9, kind: 'sweat', actor: 'dino', dur: 0.7 },
    { at: SAY + 0.1, kind: 'burst', actor: 'dino', emoji: '✨', n: 8, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    // 定住構圖：草叢、對手、恐龍、蛋都在畫面裡，恐龍夠大
    { at: -1, dur: 0.01, do: 'zoom', amount: 1.3, to: { x: 80, y: 50 } },
    ...r1.camera,
    ...r2.camera,
    // 停一拍：慢慢推近草叢與恐龍
    { at: E3 - 1.2, dur: 1.0, do: 'zoom', amount: 1.4, to: { x: 70, y: 52 } },
    ...r3.camera,
    { at: JUMP, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 88, y: 50 } },
    // 亮相：推近蛋殼裡發抖的恐龍
    { at: LAND, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: CAP, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: EX - 12, y: 50 } },
  ],
  lights: [
    // 停一拍：天色暗下來（要來一隻更大的了？）
    { at: E3 - 1.2, dur: 0.8, level: 0.3 },
    { at: E3, dur: 0.3, level: 0 },
    // 亮相
    { at: CAP, dur: 0.05, level: -0.25 },
    { at: CAP + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.15, sfx: 'tap' },
    { at: 0.5, sfx: 'tap' },
    { at: CRACK, sfx: 'crack' },
    { at: CRACK + 0.55, sfx: 'plop' },
    ...e1.cues,
    ...r1.cues,
    { at: R1 + 0.45, sfx: 'whoosh' },
    ...e2.cues,
    ...r2.cues,
    { at: R2 + 0.2, sfx: 'whoosh' },
    { at: E3 - 1.2, sfx: 'rumble' },
    ...e3.cues,
    ...r3.cues,
    { at: PEEP, sfx: 'blip' },
    { at: JUMP, sfx: 'boing' },
    { at: LAND, sfx: 'plop' },
    { at: CAP, sfx: 'clink' },
    { at: SAY, say: '恐龍' },
  ],
})
