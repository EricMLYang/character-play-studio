// 演的是字面意思：哆啦＝鈴鐺「哆啦哆啦」響，夢＝主角睡著做了一個夢（沒有貓、藍色機器人、口袋、竹蜻蜓、任意門、銅鑼燒，鈴鐺不掛在脖子上）。
import type { Camera, Cue, Fx, Light, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：浣熊一站著睡著就夢到大西瓜，正張嘴要咬，鵝一啄鈴鐺「哆啦哆啦」，夢就啵地破掉、他嚇醒。
// 同一個動作（打瞌睡 → 夢冒出來 → 西瓜飄到嘴邊、張大嘴 → 鵝啄鈴鐺 → 夢破掉、驚醒）、同一聲「哆啦哆啦＋啵」，
// 只有夢裡的西瓜一次比一次大、嚇醒得一次比一次慘：西瓜 20 → 28 → 38；跳一下 → 跳好高摔得跌坐。
// 第三次前停一拍：夢最大、西瓜最大，鵝縮起脖子蓄力要啄——反轉：他閉著眼睛轉身把鈴鐺一把抓下來抱在懷裡，
// 鵝啄了個空；他「啊嗚」一口咬到西瓜。醒來笑嘻嘻地自己搖鈴鐺，這次夢破成一片彩帶：「哆啦Ａ夢」。
// 主角用浣熊花生（有打瞌睡、打哈欠、張嘴、驚醒、跌坐的姿勢）；不用大怪獸（剛當過兩支主角）、不用貓。
const S = 36 // 浣熊的 size
const G = 77 - 0.42 * S
const KX = 90 // 浣熊站的地方（朝右，背後是鈴鐺）
const BX = 64 // 鈴鐺吊在這裡
const BS = 19
const BY = 54
const GS = 24 // 鵝
const GY = 77 - 0.42 * GS
const GX = 44
/** 鵝跳起來啄鈴鐺的位置 */
const PECK = { x: BX - 12, y: GY - 16 }
/** 夢（💭）：每一次一朵，越來越大，底部都差不多在同一個高度 */
const CX = 124
const CS = [40, 48, 54]
const CB = 58 // 雲的底
const cloudY = (k: number) => CB - 0.42 * CS[k]
/** 夢裡的西瓜：20 → 28 → 38 */
const MS = [20, 28, 38]
const melonIn = (k: number) => ({ x: CX + 2, y: cloudY(k) - 0.08 * CS[k] + 0.08 * MS[k] - 1 })
/** 西瓜飄到嘴邊（左緣剛好碰到他的嘴） */
const MOUTH_Y = 52
const melonAtMouth = (k: number) => ({ x: KX + 7 + 0.45 * MS[k], y: MOUTH_Y + 0.08 * MS[k] })
/** 暗下來做夢的亮度 */
const DIM = 0.32
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 打瞌睡：站著頭一歪睡著、💤、房間暗下來 */
function doze(at: number, k: number) {
  const moves: Move[] = [
    { at, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/doze' },
    { at: at + 0.05, actor: 'kid', do: 'squash', amount: 0.08, dur: 0.4 },
  ]
  const fx: Fx[] = [{ at: at + 0.1, kind: 'zzz', actor: 'kid', emoji: '💤', dx: -6, dur: 1.2, scale: 1.4 }]
  const lights: Light[] = [{ at: at + 0.1, dur: 0.4, level: DIM }]
  const cues: Cue[] = [{ at: at + 0.1, sfx: 'deflate' }]
  return { moves, fx, lights, cues, k }
}

/** 夢冒出來（雲＋西瓜都亮著，畫在暗幕上面） */
function dreamUp(at: number, k: number) {
  const moves: Move[] = [
    { at, actor: `c${k}`, do: 'pop', dur: 0.35 },
    { at: at + 0.3, actor: `m${k}`, do: 'pop', dur: 0.3 },
  ]
  const fx: Fx[] = [{ at: at + 0.35, kind: 'burst', actor: `m${k}`, emoji: '✨', n: 4 + k, dur: 0.5, scale: 1 + 0.2 * k }]
  const cues: Cue[] = [{ at, sfx: 'bubble' }]
  return { moves, fx, cues }
}

/** 西瓜從夢裡飄到嘴邊，他閉著眼張大嘴（hit＝西瓜到嘴邊那一刻） */
function bite(from: number, hit: number, k: number): Move[] {
  return [
    { at: from, actor: `m${k}`, do: 'moveTo', to: melonAtMouth(k), dur: hit - from, ease: 'inOut' },
    { at: hit - 0.35, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/yawn' },
  ]
}

/** 鵝啄鈴鐺：縮一下 → 撲過去啄 → 回原位。D＝啄到那一刻；hits＝有沒有啄到 */
function peck(D: number, hits = true): Move[] {
  const moves: Move[] = [
    { at: D - 0.4, actor: 'goose', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: D - 0.2, actor: 'goose', do: 'swap', emoji: 'prop:goose-peck' },
    { at: D - 0.2, actor: 'goose', do: 'moveTo', to: PECK, arc: 3, dur: 0.2, ease: 'in' },
  ]
  if (hits) {
    moves.push(
      { at: D + 0.2, actor: 'goose', do: 'moveTo', to: { x: GX, y: GY }, dur: 0.25, ease: 'out' },
      // 回去拍翅膀大笑
      { at: D + 0.45, actor: 'goose', do: 'swap', emoji: 'prop:goose-chase' },
      { at: D + 0.5, actor: 'goose', do: 'shake', amount: 0.5, dur: 0.4 },
      { at: D + 1.0, actor: 'goose', do: 'swap', emoji: 'prop:goose' },
    )
  }
  return moves
}

/** 鈴鐺「哆啦哆啦」：搖、🎶、叮叮兩聲 */
function ring(D: number, k: number) {
  const moves: Move[] = [
    { at: D, actor: 'bell', do: 'tilt', amount: 22, dur: 0.6 },
    { at: D, actor: 'bell', do: 'shake', amount: 1.5, dur: 0.6 },
  ]
  const fx: Fx[] = [{ at: D, kind: 'burst', actor: 'bell', emoji: '🎶', n: 4 + k, dur: 0.7, scale: 1.3 + 0.15 * k }]
  const cues: Cue[] = [{ at: D, sfx: 'clink' }, { at: D + 0.18, sfx: 'clink' }]
  return { moves, fx, cues }
}

/**
 * 主軸：鵝啄鈴鐺「哆啦哆啦」→ 夢啵地破掉 → 他嚇醒（前兩次一模一樣，只有西瓜更大、嚇得更慘）。
 * D＝鵝啄到鈴鐺那一刻。回傳 end＝傻眼停完的時間。
 */
function wake(D: number, k: number) {
  const P = D + 0.2 // 夢破掉
  const r = ring(D, k)
  const air = [0.35, 0.5][k]
  const moves: Move[] = [
    ...peck(D),
    ...r.moves,
    { at: P, actor: `m${k}`, do: 'vanish', dur: 0.12 },
    { at: P, actor: `c${k}`, do: 'vanish', dur: 0.15 },
    { at: P, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: P, actor: 'kid', do: 'hop', amount: [4, 11][k], dur: air },
  ]
  let end = P + air + 0.5
  if (k >= 1) {
    // 第二次：跳好高，落下來一屁股跌坐
    moves.push({ at: P + air, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/fall' })
    end = P + air + 0.6
  } else {
    moves.push({ at: P + 0.1, actor: 'kid', do: 'shake', amount: 0.6, dur: 0.45 })
  }
  const fx: Fx[] = [
    ...r.fx,
    // 啵！夢破掉：一團雲霧，一次比一次大
    { at: P, kind: 'burst', x: CX, y: cloudY(k) - 4, emoji: 'prop:smoke', n: 1, dur: 0.5, scale: 2.2 + 0.6 * k },
    { at: P + 0.02, kind: 'burst', x: CX, y: cloudY(k) - 4, emoji: '💨', n: 6 + 2 * k, dur: 0.55, scale: 1.2 + 0.2 * k },
    { at: P + 0.1, kind: 'sweat', actor: 'kid', dur: 0.6 },
  ]
  if (k >= 1) fx.push({ at: P + air, kind: 'burst', x: KX + 10, y: 70, n: 1, dur: 0.4, scale: 1.6 }, { at: P + air, kind: 'puff', actor: 'kid', n: 8, dur: 0.5 })
  const camera: Camera[] = [
    { at: P, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: KX, y: 54 } },
    { at: P, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.7 + 0.6 * k },
  ]
  const lights: Light[] = [{ at: P, dur: 0.12, level: 0 }]
  const cues: Cue[] = [...r.cues, { at: P, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: P + air, sfx: 'bonk' })
  return { moves, fx, camera, lights, cues, end }
}

// 第一次
const Z1 = 0.75
const z1 = doze(Z1, 0)
const d1 = dreamUp(Z1 + 0.3, 0)
const D1 = 2.35
const w1 = wake(D1, 0)
// 第二次
const Z2 = w1.end + 0.15
const z2 = doze(Z2, 1)
const d2 = dreamUp(Z2 + 0.3, 1)
const D2 = Z2 + 1.6
const w2 = wake(D2, 1)
// 第三次：夢最大、西瓜最大；停一拍（鵝縮脖子蓄力、西瓜慢慢飄過來）
const Z3 = w2.end + 0.15
const z3 = doze(Z3, 2)
const d3 = dreamUp(Z3 + 0.3, 2)
const WIND = Z3 + 0.95 // 鵝開始蓄力
const GRAB = WIND + 0.7 // 他閉著眼睛轉身抓鈴鐺
const MISS = GRAB + 0.35 // 鵝啄空
const CHOMP = MISS + 0.45 // 啊嗚一口
const RING = CHOMP + 0.6 // 醒來自己搖鈴鐺
const HUG_AT = { x: KX - 9, y: 60 }
const HOLD_AT = { x: KX - 1, y: 67 } // 抱在胸前（轉回朝右以後）
const UP_AT = { x: KX - 19, y: 49 } // 舉高高
const BITTEN = { x: KX + 7 + 0.45 * 32, y: MOUTH_Y + 2 }

export default scene({
  duration: Math.round((RING + 1.75) * 100) / 100,
  bg: { top: '#A9D8EE', bottom: '#E4F4FA', floor: '#C79A6B', scenery: 'room' },
  actors: [
    { id: 'books', emoji: '📚', x: 146, y: 77 - 0.42 * 14 - 20, size: 14 },
    { id: 'table', emoji: 'prop:table', x: 146, y: 77 - 0.42 * 24, size: 24 },
    { id: 'chair', emoji: '🪑', x: 12, y: 77 - 0.42 * 22, size: 22 },
    { id: 'goose', emoji: 'prop:goose', x: GX, y: GY, size: GS, flip: true },
    { id: 'kid', emoji: 'hero:raccoon/idle', x: KX, y: G, size: S, flip: true },
    // 鈴鐺畫在他前面：抓下來抱在懷裡時看得到
    { id: 'bell', emoji: 'prop:bell', x: BX, y: BY, size: BS, float: true, pivot: 'center' },
    // 夢：三朵（一次一朵、越來越大），亮著畫在暗幕上面
    ...[0, 1, 2].map((k) => ({ id: `c${k}`, emoji: '💭', x: CX, y: cloudY(k), size: CS[k], float: true, top: true, hidden: true })),
    ...[0, 1, 2].map((k) => ({ id: `m${k}`, emoji: 'prop:watermelon', x: melonIn(k).x, y: melonIn(k).y, size: MS[k], float: true, top: true, hidden: true })),
  ],
  moves: [
    // 開場：伸懶腰打一個大哈欠
    { at: 0.1, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/yawn' },
    { at: 0.15, actor: 'kid', do: 'squash', amount: -0.1, dur: 0.5 },
    { at: 0.2, actor: 'goose', do: 'hop', amount: 2, dur: 0.25 },
    // 第一次：小西瓜
    ...z1.moves,
    ...d1.moves,
    ...bite(D1 - 0.75, D1 - 0.05, 0),
    ...w1.moves,
    { at: w1.end, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第二次：中西瓜
    ...z2.moves,
    ...d2.moves,
    ...bite(D2 - 0.75, D2 - 0.05, 1),
    ...w2.moves,
    { at: w2.end, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第三次：大西瓜，慢慢飄過來
    ...z3.moves,
    ...d3.moves,
    { at: WIND, actor: 'm2', do: 'moveTo', to: melonAtMouth(2), dur: CHOMP - 0.05 - WIND, ease: 'inOut' },
    // 停一拍：鵝縮起脖子、往後仰，蓄力要啄
    { at: WIND, actor: 'goose', do: 'squash', amount: 0.25, dur: GRAB - WIND },
    { at: WIND + 0.1, actor: 'goose', do: 'tilt', amount: -10, dur: GRAB - WIND },
    { at: WIND, actor: 'goose', do: 'moveTo', to: { x: GX - 5, y: GY }, dur: 0.5, ease: 'out' },
    { at: WIND + 0.2, actor: 'goose', do: 'shake', amount: 0.4, dur: 0.4 },
    // 反轉：他閉著眼睛轉身，一把把鈴鐺抓下來抱著
    { at: GRAB, actor: 'kid', do: 'flip' },
    { at: GRAB, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: GRAB + 0.05, actor: 'bell', do: 'moveTo', to: HUG_AT, dur: 0.18, ease: 'out' },
    { at: GRAB + 0.3, actor: 'kid', do: 'flip' },
    { at: GRAB + 0.3, actor: 'bell', do: 'moveTo', to: HOLD_AT, dur: 0.12 },
    // 鵝啄了個空，撲過頭、愣住
    { at: MISS - 0.2, actor: 'goose', do: 'swap', emoji: 'prop:goose-peck' },
    { at: MISS - 0.2, actor: 'goose', do: 'moveTo', to: { x: BX - 5, y: GY }, dur: 0.2, ease: 'in' },
    { at: MISS, actor: 'goose', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: MISS + 0.35, actor: 'goose', do: 'swap', emoji: 'prop:goose' },
    { at: MISS + 0.35, actor: 'goose', do: 'hop', amount: 3, dur: 0.25 },
    // 張大嘴——啊嗚！
    { at: CHOMP - 0.35, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/yawn' },
    { at: CHOMP, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/eat' },
    { at: CHOMP, actor: 'm2', do: 'swap', emoji: 'prop:watermelon-half' },
    { at: CHOMP, actor: 'm2', do: 'scaleTo', amount: 32 / 38, dur: 0.15 },
    { at: CHOMP, actor: 'm2', do: 'moveTo', to: BITTEN, dur: 0.15 },
    { at: CHOMP, actor: 'kid', do: 'squash', amount: 0.15, dur: 0.25 },
    // 醒來，笑嘻嘻地自己搖鈴鐺：夢破成彩帶
    { at: RING, actor: 'kid', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: RING, actor: 'kid', do: 'hop', amount: 4, dur: 0.35 },
    { at: RING, actor: 'bell', do: 'moveTo', to: UP_AT, dur: 0.2, ease: 'out' },
    { at: RING + 0.2, actor: 'bell', do: 'tilt', amount: 24, dur: 0.9 },
    { at: RING + 0.2, actor: 'bell', do: 'shake', amount: 1.5, dur: 0.9 },
    { at: RING + 0.15, actor: 'm2', do: 'vanish', dur: 0.15 },
    { at: RING + 0.15, actor: 'c2', do: 'vanish', dur: 0.2 },
    { at: RING + 0.3, actor: 'goose', do: 'swap', emoji: 'prop:goose-chase' },
    { at: RING + 0.3, actor: 'goose', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    // 吊鈴鐺的繩子（被抓下來之前）
    { at: 0, dur: GRAB + 0.05, kind: 'line', actor: 'bell', dy: -BS * 0.4, to: { x: BX, y: -2 }, color: '#7A5C3E', width: 0.6 },
    ...z1.fx, ...d1.fx, ...w1.fx,
    ...z2.fx, ...d2.fx, ...w2.fx,
    ...z3.fx, ...d3.fx,
    { at: WIND + 0.1, kind: 'sweat', actor: 'goose', dur: 0.6 },
    { at: MISS, kind: 'puff', actor: 'goose', n: 6, dur: 0.4 },
    { at: MISS + 0.1, kind: 'dizzy', actor: 'goose', dur: 0.8 },
    // 啊嗚！
    { at: CHOMP, kind: 'burst', x: BITTEN.x + 3, y: MOUTH_Y - 9, n: 1, dur: 0.35, scale: 1.6 },
    { at: CHOMP + 0.03, kind: 'burst', x: BITTEN.x + 2, y: MOUTH_Y - 6, emoji: '💦', n: 7, dur: 0.6, scale: 1.3 },
    // 亮相：夢破成彩帶
    { at: RING + 0.15, kind: 'burst', x: CX, y: cloudY(2) - 6, emoji: '🎉', n: 8, dur: 0.9, scale: 1.5 },
    { at: RING + 0.2, kind: 'burst', actor: 'bell', emoji: '🎶', n: 6, dur: 1.0, scale: 1.5 },
    { at: RING + 0.25, kind: 'burst', actor: 'kid', emoji: '✨', n: 10, dur: 0.9, scale: 1.4, dy: -12 },
  ],
  camera: [
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.35, to: look(88, 46, 1.35) },
    ...w1.camera,
    ...w2.camera,
    // 第三次夢最大：退一點才裝得下（鵝、鈴鐺、他、夢都在畫面裡），停一拍時往鵝那邊靠一點
    { at: Z3 + 0.2, dur: 0.4, do: 'zoom', amount: 1.2, to: look(88, 44, 1.2) },
    { at: WIND, dur: 0.6, do: 'zoom', amount: 1.25, to: look(88, 45, 1.25) },
    { at: CHOMP, dur: 0.35, do: 'punch', amount: 0.1, to: { x: KX + 8, y: 52 } },
    { at: CHOMP, dur: 0.35, do: 'shake', amount: 1.2 },
    // 亮相
    { at: RING, dur: 0.5, do: 'zoom', amount: 1.55, to: look(KX - 8, 50, 1.55) },
  ],
  lights: [
    ...z1.lights, ...w1.lights,
    ...z2.lights, ...w2.lights,
    ...z3.lights,
    { at: CHOMP, dur: 0.05, level: -0.25 },
    { at: CHOMP + 0.05, dur: 0.3, level: DIM },
    { at: RING, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'deflate' },
    ...z1.cues, ...d1.cues, ...w1.cues,
    ...z2.cues, ...d2.cues, ...w2.cues,
    ...z3.cues, ...d3.cues,
    { at: WIND + 0.1, sfx: 'blip' },
    { at: GRAB, sfx: 'whoosh' },
    { at: MISS, sfx: 'tap' },
    { at: CHOMP, sfx: 'gulp' },
    { at: CHOMP + 0.05, sfx: 'crack' },
    { at: RING + 0.2, sfx: 'clink' },
    { at: RING + 0.38, sfx: 'clink' },
    { at: RING + 0.35, say: '哆啦Ａ夢' },
    { at: RING + 0.6, sfx: 'cheer' },
  ],
})
