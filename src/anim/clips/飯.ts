import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 飯（v2）：一大碗冒熱氣的白飯擺在中間。豬探長舀起一匙飯「啊——」要餵小恐龍，小恐龍把嘴巴閉得緊緊的、頭一撇：不吃！
// 豬探長只好把湯匙變成交通工具，同一個動作一次比一次用力演：舀一匙 → 湯匙「咻～」沿一條花俏的路線飛過去 → 到嘴邊那一下，
// 小恐龍嘴巴一閉、搖頭（❌），湯匙「咚」撞在他臉頰上，一坨飯黏在臉上，豬探長垮下來：
// 飛機 ✈️ 繞一圈（飠的上半從黏住的飯飛出來）→ 火車 🚂 沿地面開過去（飠的下半）→ 先停一拍：豬探長擦汗、深呼吸、整個人跳起來，
// 倒數「嗶嗶嗶」，火箭 🚀 繞畫面一大圈（反）——還是不吃，臉上黏了三坨飯。
// 回馬槍（第四次）：豬探長放棄了，同樣舀一匙、同樣「咻～」——這次飛進自己嘴裡，「嗯～好好吃！」；
// 小恐龍眼睛一亮、口水流下來，嘴巴「啊——」張得超大，搶過湯匙呼嚕呼嚕大口吃（語詞「吃飯」），吃完舉手「再一碗！」。
// 最後畫面暗下來只剩「飯」，豬探長問「這是什麼字？」，等他回答，再指著字說「飯！」，大家退場只留字。
// 刻意不跟「肉」（咬一口肚子變大）、「餃」（燙到跳）、「喝」（吸光肚子鼓）、「蟲」（張嘴要吃蟲冒出來）撞：這支只演「大人餵飯、小孩不張嘴」。
// 飯、飯、吃飯、這是什麼字？、飯

/** 豬探長（左邊，圖朝左，flip 朝右看小恐龍） */
const PS = 38
const PX = 38
const PY = 77 - 0.42 * PS
/** 小恐龍（右邊，圖朝左，剛好面向豬探長） */
const RS = 44
const RX = 126
const RY = 77 - 0.42 * RS
/** 那碗飯：這個字講的東西，擺在兩人正中間 */
const BS = 32
const BX = 80
const BY = 77 - 0.42 * BS

/** 湯匙（🥄 flip 以後匙面在右上、柄在左下） */
const SS = 27
/** 匙面（飯放的地方）相對湯匙中心 */
const BOWL_OF = { x: 0.23 * SS, y: -0.25 * SS }
/** 湯匙上那一坨飯（白飯的圖只畫上面一截：飯堆＋熱氣）相對湯匙中心 */
const SCOOP_S = 21
const SCOOP_OF = { x: BOWL_OF.x, y: BOWL_OF.y + 0.5 }
/** 用「匙面在哪裡」來寫位置，換成湯匙中心／那一坨飯的中心 */
const spoonAt = (p: Vec): Vec => ({ x: p.x - BOWL_OF.x, y: p.y - BOWL_OF.y })
const scoopAt = (p: Vec): Vec => ({ x: p.x - BOWL_OF.x + SCOOP_OF.x, y: p.y - BOWL_OF.y + SCOOP_OF.y })

/** 匙面插進碗裡的飯 */
const DIP: Vec = { x: 74, y: 59 }
/** 舀起來、舉在碗上方（熱氣、白飯看得清楚） */
const READY: Vec = { x: 68, y: 42 }
/** 第 3 次以後豬探長垮坐在地上、把碗抱到腿邊（國字放大到正中央時讓出中間）：碗、匙面插進飯、舉起來 */
const LAP = { x: 44, k: 0.75 }
const DIP2: Vec = { x: 47, y: 63 }
const READY2: Vec = { x: 47, y: 46 }
/** 三次撞到臉的地方（臉頰、額頭旁、下巴），飯就黏在那裡 */
const HITS: Vec[] = [{ x: 117, y: 54 }, { x: 121.5, y: 60.5 }, { x: 130.5, y: 51.5 }]
/** 回馬槍：豬探長自己的嘴（eat 姿勢、flip） */
const PIG_MOUTH: Vec = { x: 45.5, y: 56 }

/** 字框：左上方、兩朵雲中間（湯匙的路線在中間、上面、右上），背後是素色的天空 */
const FRAME = { x: 34, y: 19 }
const FRAME_K = 0.4

/** 湯匙：銀白色＋深色描邊（原本的 3D 湯匙是淡紫色，在橘色天空上看不到） */
const SILVER = 'grayscale(1) brightness(1.3) drop-shadow(0 0 0.6px #2E3440) drop-shadow(0 0 0.6px #2E3440)'
/** 交通工具一律一樣大（跟小恐龍的頭差不多），墊在湯匙柄後面 */
const RIDE_K = 3
const RIDE_AT: Vec = { x: -6, y: 8 }

/** 白飯的顏色（黏在臉上的那一坨） */
const RICE = '#FFFDF3'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 湯匙和上面那一坨飯一起移動（匙面到 p） */
function carry(at: number, dur: number, p: Vec, ease: Move['ease'] = 'inOut'): Move[] {
  return [
    { at, dur, actor: 'spoon', do: 'moveTo', to: spoonAt(p), ease },
    { at, dur, actor: 'scoop', do: 'moveTo', to: scoopAt(p), ease },
  ]
}

/** 沿一串點飛過去（每一段等長時間），最後一段加速撞上去 */
function fly(at: number, dur: number, pts: Vec[]): Move[] {
  const seg = dur / pts.length
  return pts.flatMap((p, i) => carry(at + i * seg, seg, p, i === pts.length - 1 ? 'in' : 'linear'))
}

/** 舀一匙：湯匙插進碗裡、一坨白飯冒上來、舉到碗上方。at 是插進去那一刻，回傳舉好的時間 */
function scoop(at: number, dip = DIP, ready = READY): { moves: Move[]; cues: Cue[]; ready: number } {
  return {
    moves: [
      ...carry(at - 0.15, 0.15, dip, 'in'),
      { at, dur: 0.01, actor: 'scoop', do: 'moveTo', to: scoopAt(dip) },
      { at, dur: 0.15, actor: 'scoop', do: 'pop' },
      { at, dur: 0.15, actor: 'bowl', do: 'squash', amount: 0.08 },
      ...carry(at + 0.08, 0.17, ready, 'out'),
    ],
    cues: [{ at, sfx: 'plop' }],
    ready: at + 0.25,
  }
}

/** 交通工具：一個大 emoji 載著湯匙（畫在湯匙柄上，匙面和飯露在上面），整段飛行都在 */
function ride(at: number, dur: number, emoji: string, scale: number, back: Vec): Fx {
  // pop 畫在「錨點＋(6, −6)×scale」，錨點是湯匙頭頂（y − 0.45 × size）
  return { at, dur, kind: 'pop', actor: 'spoon', emoji, scale, dx: back.x - 6 * scale, dy: back.y + 0.45 * SS + 6 * scale }
}

/**
 * 同一個笑點「餵一口」：（舀一匙）→ 湯匙「咻～」沿 path 飛過去（後面跟著交通工具）→ 到嘴邊那一刻小恐龍嘴巴一閉、搖頭（❌），
 * 湯匙「咚」撞在他臉上、一坨飯黏住＋💥＋鏡頭推近＋震＋同一個音效，豬探長傻眼停 HOLD 秒再垮下來。
 * T 是撞到的那一刻，k 是第幾次（0～2，越後面越用力），fly 是飛多久。
 */
const HOLD = 0.45
function feed(T: number, k: number, F: number, path: Vec[], vehicle: { emoji: string; scale: number; back: Vec }, from: number, rest = READY): Gag {
  const hit = path[path.length - 1]
  const moves: Move[] = [
    // 起飛：豬探長伸手「啊——」
    { at: from, actor: 'pig', do: 'swap', emoji: k >= 2 ? 'hero:pig/jump' : 'hero:pig/reach' },
    ...fly(T - F, F, path),
    // 到嘴邊：嘴巴閉緊（鼓著臉叉腰）
    { at: T - 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/angry' },
    // 咚！搖頭、往後一撇
    { at: T, dur: 0.4, actor: 'rex', do: 'shake', amount: 1.2 + 0.4 * k },
    { at: T, dur: 0.4, actor: 'rex', do: 'tilt', amount: 4 + k },
    { at: T, dur: 0.05, actor: 'scoop', do: 'vanish' },
    // 湯匙被彈回來
    ...carry(T, 0.25, { x: hit.x - 10, y: hit.y - 6 }, 'out'),
    { at: T, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: T, dur: 0.25, actor: 'pig', do: 'squash', amount: 0.2 + 0.08 * k },
    // 垮下來，湯匙回到碗上方
    { at: T + HOLD, actor: 'pig', do: 'swap', emoji: k >= 2 ? 'hero:pig/fall' : 'hero:pig/tired' },
    ...carry(T + HOLD, 0.16, rest),
  ]
  const fx: Fx[] = [
    ride(from, T - from + 0.02, vehicle.emoji, vehicle.scale, vehicle.back),
    { at: T, kind: 'burst', x: hit.x - 2, y: hit.y - 2, n: 1, dur: 0.4, scale: 1 + 0.25 * k },
    { at: T + 0.02, dur: 0.6, kind: 'pop', actor: 'rex', emoji: '❌', dx: 2, dy: 0, scale: 1.4 + 0.3 * k },
    { at: T + 0.3, kind: 'sweat', actor: 'pig' },
    // 黏在臉上的那一坨飯（一直黏到問他為止）
    ...riceBlob(T, hit),
  ]
  const camera: Camera[] = [
    { at: T, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: hit.x - 8, y: 48 } },
    { at: T, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個「咻～」、同一個「咚」，一次比一次多疊一個
  const cues: Cue[] = [{ at: T - F, sfx: 'whoosh' }, { at: T, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: T + 0.04, sfx: 'plop' })
  if (k >= 2) cues.push({ at: T + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues, lights: [] }
}

/** 黏在臉上的一坨飯：幾粒擠在一起的白飯粒（跟著小恐龍；他整段站在原地），黏到他自己大口吃飯為止 */
function riceBlob(at: number, p: Vec): Fx[] {
  const grain = (ox: number, oy: number, w: number): Fx => ({
    at, dur: WORD + 0.1 - at, kind: 'tube', actor: 'rex', dx: p.x + ox - RX, dy: p.y + oy - RY,
    to: { x: p.x + ox + w * 0.35, y: p.y + oy + w * 0.15 }, color: RICE, width: w,
  })
  // 一坨＝四五粒擠在一起的飯粒
  const g = (ox: number, oy: number, w: number) => grain(ox * 1.25, oy * 1.25, w * 1.25)
  return [g(-1.4, 0, 1.9), g(0.4, -1.1, 1.9), g(0.6, 0.9, 1.9), g(-0.6, 2, 1.7), g(2.2, 0, 1.6), g(-2.6, -1.3, 1.5)]
}

/** 開場：舀一匙舉起來「啊——」，他就搖頭（0.5 秒帶過，接著馬上變飛機） */
const OPEN = 0.35
const REFUSE0 = 0.8
/** 第 1 次：飛機繞一圈 */
const T1 = 2.15, F1 = 0.9
/** 第 2 次：火車沿地面開過去 */
const T2 = 4.4, F2 = 1.1
/** 第 3 次：停一拍、倒數，火箭繞畫面一大圈 */
const T3 = 7.55, F3 = 1.15
const HOME = 8.05
const PARK = 8.87
/** 回馬槍：飛進自己嘴裡 */
const T4 = 9.6
const WORD = 10.3
/** 小恐龍抱著碗跑出去，問他的時候畫面上只有豬探長和國字 */
const LEAVE = 10.85
const ASK = 11.1
const ANSWER = ASK + 0.05 + 0.974 + 1.51

const sc0 = scoop(OPEN)
const g1 = feed(T1, 0, F1,
  [{ x: 80, y: 33 }, { x: 88, y: 21 }, { x: 101, y: 22 }, { x: 104, y: 35 }, { x: 92, y: 41 }, HITS[0]],
  { emoji: '✈️', scale: RIDE_K, back: RIDE_AT }, REFUSE0 + 0.25)
const sc2 = scoop(T1 + HOLD + 0.35)
const g2 = feed(T2, 1, F2,
  [{ x: 102, y: 26 }, { x: 142, y: 30 }, { x: 152, y: 56 }, { x: 126, y: 57 }, { x: 100, y: 57 }, HITS[1]],
  { emoji: '🚂', scale: RIDE_K, back: RIDE_AT }, sc2.ready + 0.05)
/** 停一拍：擦汗、深呼吸，然後舀一匙、跳起來、倒數 */
const BEAT = T2 + HOLD + 0.2
const sc3 = scoop(BEAT + 0.75)
const LAUNCH = T3 - F3
const g3 = feed(T3, 2, F3,
  [{ x: 78, y: 17 }, { x: 100, y: 8 }, { x: 134, y: 10 }, { x: 147, y: 27 }, { x: 122, y: 30 }, { x: 100, y: 36 }, HITS[2]],
  { emoji: '🚀', scale: RIDE_K, back: RIDE_AT }, sc3.ready + 0.05, DIP2)
const sc4 = scoop(PARK + 0.03, DIP2, READY2)
const all = [g1, g2, g3]

/** 回馬槍那一匙的路線：同樣「咻～」繞一小圈，飛進自己嘴裡 */
const F4 = 0.4
const path4: Vec[] = [{ x: 66, y: 50 }, { x: 72, y: 38 }, { x: 60, y: 36 }, PIG_MOUTH]

/** 語詞那一刻：小恐龍拿湯匙在碗跟嘴之間呼嚕呼嚕 */
const REX_MOUTH: Vec = { x: 113, y: 52 }
const HEAP: Vec = { x: 90, y: 57 }
const ASK_S = 1.25

const clip: Clip = {
  format: 2,
  char: '飯',
  meta: { theme: '大人餵飯、小孩不張嘴', cast: '豬探長＋小恐龍＋一大碗白飯＋湯匙', gags: ['豬探長舀一匙飯要餵小恐龍，湯匙「咻～」飛到嘴邊，小恐龍嘴巴一閉、搖頭，湯匙「咚」撞在臉上、一坨飯黏住，豬探長垮下來；一次比一次用力演（飛機繞一圈→火車沿地面開過去→停一拍擦汗深呼吸跳起來、倒數，火箭繞畫面一大圈），臉上黏了三坨飯；回馬槍是豬探長放棄了，同樣「咻～」一匙飛進自己嘴裡「嗯～好好吃」，小恐龍口水流下來、嘴巴張得超大，搶過湯匙呼嚕呼嚕吃光，還舉手要再一碗'] },
  duration: 15,
  // 杏桃色的天空：白飯、白湯匙、熱氣都看得清楚
  bg: { top: '#F2A46C', bottom: '#FCDDB8', floor: '#9FCB72', scenery: 'hills' },
  actors: [
    { id: 'pig', emoji: 'hero:pig/idle', x: PX, y: PY, size: PS, flip: true, hidden: true },
    { id: 'bowl', emoji: 'prop:rice', x: BX, y: BY, size: BS },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RY, size: RS },
    { id: 'spoon', emoji: '🥄', ...spoonAt(READY), size: SS, flip: true, float: true, hidden: true, tint: SILVER },
    { id: 'scoop', emoji: 'prop:rice', ...scoopAt(DIP), size: SCOOP_S, half: 'top', cut: 0.47, float: true, hidden: true },
  ],
  moves: [
    // 豬探長拿著湯匙走進來
    { at: 0, dur: 0.35, actor: 'pig', do: 'enter', from: { x: -25, y: PY }, ease: 'out' },
    { at: 0.15, dur: 0.2, actor: 'spoon', do: 'pop' },
    // 開場：舀一匙，舉起來（熱氣）——「飯」；「啊——」遞到嘴前
    ...sc0.moves,
    { at: 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: REFUSE0 - 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/angry' },
    { at: REFUSE0, dur: 0.4, actor: 'rex', do: 'shake', amount: 1.2 },
    { at: REFUSE0, dur: 0.4, actor: 'rex', do: 'tilt', amount: 4 },
    { at: REFUSE0 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 豬探長想到辦法：把湯匙變成飛機
    ...g1.moves,
    // 第 2 次：再舀一匙，火車
    ...sc2.moves,
    ...g2.moves,
    // 第 3 次前停一拍：擦汗、深呼吸（吸一大口氣拉長）、整個人跳起來
    { at: BEAT, actor: 'pig', do: 'swap', emoji: 'hero:pig/hot' },
    { at: BEAT + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: BEAT + 0.4, dur: 0.4, actor: 'pig', do: 'squash', amount: -0.14 },
    ...sc3.moves,
    { at: sc3.ready + 0.05, dur: 0.35, actor: 'pig', do: 'hop', amount: 6 },
    // 倒數：湯匙抖三下
    { at: sc3.ready + 0.1, dur: LAUNCH - sc3.ready - 0.1, actor: 'spoon', do: 'shake', amount: 0.8 },
    { at: sc3.ready + 0.1, dur: LAUNCH - sc3.ready - 0.1, actor: 'scoop', do: 'shake', amount: 0.8 },
    ...g3.moves,
    // 第 3 次也不吃：豬探長把整碗抱到腿邊、一屁股坐下（國字放大到正中央，中間讓出來）
    { at: T3 + HOLD, dur: 0.22, actor: 'bowl', do: 'moveTo', to: { x: LAP.x, y: BY }, ease: 'out' },
    { at: T3 + HOLD, dur: 0.22, actor: 'bowl', do: 'scaleTo', amount: LAP.k },
    // 字框填滿；豬探長坐在地上，垂頭喪氣
    // 回馬槍：他放棄了，自己舀一匙——同樣「咻～」，這次飛進自己嘴裡
    { at: PARK - 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    ...sc4.moves,
    { at: sc4.ready, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    ...fly(T4 - F4, F4, path4),
    { at: T4, actor: 'pig', do: 'swap', emoji: 'hero:pig/eat' },
    { at: T4, dur: 0.05, actor: 'scoop', do: 'vanish' },
    { at: T4, dur: 0.3, actor: 'pig', do: 'squash', amount: 0.12 },
    { at: T4 + 0.3, dur: 0.3, actor: 'pig', do: 'tilt', amount: -6, times: 2 },
    // 小恐龍眼睛一亮、口水流下來……嘴巴「啊——」張得超大
    { at: T4 + 0.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
    { at: T4 + 0.05, dur: 0.25, actor: 'rex', do: 'hop', amount: 2 },
    { at: WORD - 0.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/roar' },
    { at: WORD - 0.4, dur: 0.3, actor: 'rex', do: 'hop', amount: 3 },
    // 搶過湯匙，呼嚕呼嚕大口吃：吃飯！
    { at: WORD - 0.2, dur: 0.2, actor: 'spoon', do: 'moveTo', to: spoonAt(HEAP), ease: 'in' },
    { at: WORD - 0.2, dur: 0.01, actor: 'scoop', do: 'moveTo', to: scoopAt(HEAP) },
    { at: WORD - 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: WORD, dur: 0.1, actor: 'scoop', do: 'pop' },
    { at: WORD, actor: 'rex', do: 'swap', emoji: 'hero:rex/eat' },
    // 整碗搶過去：碗回到正中間、最大
    { at: WORD - 0.3, dur: 0.25, actor: 'bowl', do: 'moveTo', to: { x: BX, y: BY }, ease: 'out' },
    { at: WORD - 0.3, dur: 0.3, actor: 'bowl', do: 'scaleTo', amount: 1.15 / LAP.k, ease: 'back' },
    ...carry(WORD, 0.12, REX_MOUTH, 'in'),
    { at: WORD + 0.12, dur: 0.05, actor: 'scoop', do: 'vanish' },
    { at: WORD + 0.12, dur: 0.2, actor: 'rex', do: 'squash', amount: 0.1 },
    ...carry(WORD + 0.17, 0.1, HEAP, 'out'),
    { at: WORD + 0.27, dur: 0.1, actor: 'scoop', do: 'pop' },
    ...carry(WORD + 0.3, 0.12, REX_MOUTH, 'in'),
    { at: WORD + 0.42, dur: 0.05, actor: 'scoop', do: 'vanish' },
    { at: WORD + 0.42, dur: 0.2, actor: 'rex', do: 'squash', amount: 0.1 },
    // 吃光了，舉手：再一碗！然後抱著碗、拿著湯匙開心地跑出右邊
    { at: WORD + 0.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/know' },
    { at: WORD + 0.5, dur: 0.25, actor: 'rex', do: 'hop', amount: 3 },
    { at: LEAVE, actor: 'rex', do: 'flip' },
    { at: LEAVE, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: LEAVE, dur: 0.22, actor: 'rex', do: 'moveTo', to: { x: 215, y: RY }, ease: 'in' },
    { at: LEAVE - 0.03, dur: 0.22, actor: 'bowl', do: 'moveTo', to: { x: 200, y: BY }, ease: 'in' },
    { at: LEAVE - 0.03, dur: 0.22, actor: 'spoon', do: 'moveTo', to: { x: 205, y: 45 }, ease: 'in' },
    { at: LEAVE - 0.03, dur: 0.22, actor: 'scoop', do: 'moveTo', to: { x: 205, y: 40 }, ease: 'in' },
    // 問他：豬探長站到左前方、變大
    { at: ASK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK, dur: 0.3, actor: 'pig', do: 'moveTo', to: { x: 32, y: PY }, ease: 'out' },
    { at: ASK + 0.2, dur: 0.3, actor: 'pig', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 1.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'pig', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, dur: 0.3, actor: 'pig', do: 'hop', amount: 7 },
    // 退場：豬探長往左跑，畫面只留下字
    { at: ANSWER + 0.12, actor: 'pig', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: ANSWER + 0.12, dur: 0.2, actor: 'pig', do: 'moveTo', to: { x: -50, y: PY }, ease: 'in' },
  ],
  builds: [
    // 每一坨黏在臉上的飯，都有一組筆畫飛進字框
    { at: T1 + 0.08, dur: 0.5, strokes: [0, 1, 2], from: HITS[0], color: partColor('飠') },
    { at: T2 + 0.08, dur: 0.5, strokes: [3, 4, 5, 6, 7], from: HITS[1], color: partColor('飠') },
    { at: T3 + 0.06, dur: 0.4, strokes: [8, 9, 10, 11], from: HITS[2], color: partColor('反') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['pig'], to: { x: 102, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    // 開場：搖頭不吃
    { at: REFUSE0 + 0.02, dur: 0.6, kind: 'pop', actor: 'rex', emoji: '❌', dx: 2, dy: 0, scale: 1.4 },
    // 停一拍：擦汗
    { at: BEAT, kind: 'sweat', actor: 'pig' },
    { at: BEAT + 0.25, kind: 'sweat', actor: 'pig' },
    // 倒數：湯匙底下冒煙
    { at: sc3.ready + 0.1, dur: LAUNCH - sc3.ready, kind: 'puff', actor: 'spoon' },
    // 回馬槍：自己也跟著飛一小圈，嗯～好好吃
    ride(sc4.ready, T4 - sc4.ready + 0.02, '✈️', RIDE_K, RIDE_AT),
    { at: T4 + 0.05, dur: 0.6, kind: 'burst', actor: 'pig', emoji: '💕', n: 6, dx: 4 },
    { at: T4 + 0.08, dur: 0.6, kind: 'pop', actor: 'rex', emoji: '❗', dx: -4, scale: 1.6 },
    // 語詞那一刻：碗亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: BX, y: 52, emoji: '✨', n: 8, scale: 1.3 },
    { at: ANSWER, kind: 'burst', x: 102, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 鏡頭鎖全景（湯匙在畫面上半繞來繞去，路線整條都要在畫面裡），只有撞到的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...sc0.cues,
    { at: 0.62, say: '飯' },
    { at: REFUSE0, sfx: 'tap' },
    ...all.flatMap((g) => g.cues),
    ...sc2.cues,
    ...sc3.cues,
    // 倒數：嗶、嗶、嗶
    ...[0, 1, 2].map((i): Cue => ({ at: sc3.ready + 0.1 + i * ((LAUNCH - sc3.ready - 0.1) / 3), sfx: 'blip' })),
    { at: LAUNCH, sfx: 'rumble' },
    { at: HOME + 0.05, say: '飯' },
    ...sc4.cues,
    { at: T4 - F4, sfx: 'whoosh' },
    { at: T4, sfx: 'gulp' },
    { at: WORD + 0.12, sfx: 'gulp' },
    { at: WORD - 0.3, sfx: 'slide' },
    { at: WORD, say: '吃飯' },
    { at: WORD + 0.42, sfx: 'gulp' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '飯' },
    { at: LEAVE, sfx: 'whoosh' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
