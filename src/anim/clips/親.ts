import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 親（v2）：童話說「親青蛙一下，青蛙就會變成王子」。兔子女孩雙手握在胸前、滿眼期待（頭上冒一個 👑 的想像泡泡），
// 閉上眼睛嘟起嘴湊過去，「啾！」親在青蛙的臉頰上（冒出一顆愛心）——退回來張開雙手等著看王子，「啵！」一團白煙蓋住青蛙……
// 煙一散：還是青蛙，「呱呱」，只是變大了一號，她傻眼。一次比一次大：
// 第 1 次小青蛙（她彎腰親）→ 第 2 次變得跟她一樣大（她踮腳跳起來親）→
// 先停一拍：她看看這麼大的青蛙，捏著鼻子、深呼吸，還是跳得高高的親下去——青蛙變得比她大兩倍。
// 每「啾」一下，親到的那一點就飛出一組筆畫：立（第 1 次）、木（第 2 次）、見（第 3 次）。
// 語詞那一刻她和大青蛙站在中間，青蛙低下頭、她踮腳輕輕親一下「親一下」。
// 回馬槍（第四次）：她又滿眼期待地準備好，這次大青蛙先低下頭「啾」地親她一下——「啵！」白煙蓋住的是她，煙散開，她頭上多了一頂皇冠。
// 最後畫面暗下來只剩「親」，戴著皇冠的兔子問「這是什麼字？」，手放耳邊等他回答，再指著字說「親！」，然後退場只留字。
// 刻意不跟「姑」（姑姑衝過來親、臉上留唇印）撞：這支沒有唇印、沒有追著親，笑點是「親了還是青蛙，只是更大」。
// 親、親、親一下、這是什麼字？、親

/** 兔子女孩：圖朝左，面向右邊的青蛙要 flip */
const SB = 38
const PB = 77 - 0.42 * SB
/** 每一次都從同一個地方出發（等著看王子也站回這裡） */
const BX = 50
/** 青蛙（prop:frog，朝左面向她）：同一隻，用 scaleTo 一次變大一號；actor 的 size 是第一次的大小 */
const F0 = 34
const FY = 77 - 0.42 * F0
/** 青蛙一次比一次大：小青蛙 → 跟她一樣高 → 比她高一截 → 比她大兩倍（高一倍半多） */
const FS = [34, 52, 68, 84]
/** 親到的那一點（她的嘴碰到青蛙的臉頰）每次都在同一條直線 x 上：畫面中間偏左 */
const CX = 80

/** 圖（0～1、朝左）上的一點，在角色站在 x、腳底 77、朝右（flip）或朝左、以腳底轉 deg 度、放大 s 倍時的位置 */
function at(x: number, S: number, u: number, v: number, flip: boolean, deg = 0, s = 1): Vec {
  const dx = (flip ? 0.5 - u : u - 0.5) * S * s, dy = ((v - 0.5) * S - 0.42 * S) * s
  const r = (deg * Math.PI) / 180
  return { x: x + dx * Math.cos(r) - dy * Math.sin(r), y: 77 + dx * Math.sin(r) + dy * Math.cos(r) }
}
/** 她嘟起來的嘴（blow 圖最左邊那一點）、她的臉頰（idle 圖臉的右緣，朝右） */
const LIPS = [0.17, 0.48] as const
const CHEEK = [0.3, 0.4] as const
/** 青蛙的臉頰（frog 圖最左邊那一點，嘴巴旁邊） */
const FCHEEK = [0.17, 0.47] as const
/** 青蛙大小是 f、臉頰要在 x = cx 時，青蛙站在哪 */
const frogX = (f: number, cx = CX) => cx - (at(0, F0, FCHEEK[0], FCHEEK[1], false, 0, f / F0).x)
/** 青蛙大小 f、站在 fx、往她那邊低頭 deg 度時的臉頰 */
const frogCheek = (fx: number, f: number, deg = 0) => at(fx, F0, FCHEEK[0], FCHEEK[1], false, -deg, f / F0)
/** 她嘴巴要碰到 p：她該站在哪（x）、要離地多高（lift），身體往前傾 deg 度 */
function lipsTo(p: Vec, deg: number) {
  const l = at(0, SB, LIPS[0], LIPS[1], true, deg)
  // 嘴唇跟臉頰疊進去一點點，看起來是真的碰到
  return { x: p.x - l.x + 0.6, lift: Math.max(0, l.y - p.y) }
}
/** 青蛙畫出來的中心（白煙要蓋住的地方） */
const frogMid = (fx: number, f: number): Vec => ({ x: fx, y: 77 - 0.4 * f })

/** 頭頂的皇冠（回馬槍）：站在 x、放大 s 倍時的位置 */
const crownAt = (x: number, s = 1): Vec => ({ x: x + 1.2 * s, y: 77 - 0.78 * SB * s })
const CROWN = 12
/** 字框一開始就在左上：青蛙會變很大、她會跳得很高，都不經過字框 */
const FRAME = { x: 30, y: 20.5 }
const FRAME_K = 0.5

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera),
  cues: gs.flatMap((g) => g.cues), lights: gs.flatMap((g) => g.lights),
})

/** 預備（握手期待＋👑 泡泡）多久才嘟嘴湊過去；湊過去多久碰到；碰到多久「啵」 */
const WISH = 0.45, LEAN = 0.27, POOF = 0.5

/**
 * 同一個笑點：她雙手握在胸前、滿眼期待（drool＋👑 想像泡泡）→ 閉眼嘟嘴湊過去（blow）→「啾！」嘴碰到青蛙臉頰
 * （鏡頭推近、一顆愛心從碰到的那一點冒出來、同一個啾）→ 她退回原位張開雙手等王子（hug）→
 * 「啵！」一團白煙＋星星蓋住青蛙（鏡頭震、淡淡白光）→ 煙散開：還是青蛙，變大了一號，「呱呱」跳一下，她傻眼（surprised）。
 * k 是第幾次。from／to 是這次青蛙的大小（to 是煙散開後的大小），fx 是青蛙站的地方（沒寫就照 CX 算）。deg 是她往前彎腰幾度。
 * turn（回馬槍）：她一樣滿眼期待地準備好，這次是青蛙先低頭 turn.deg 度親她站在 turn.bx 的臉頰，「啵」的白煙蓋住她、煙散開她頭上多一頂皇冠。
 * 回傳碰到的那一刻 hit、碰到的那一點 kiss、「啵」的那一刻 poof。
 */
function smooch(t0: number, k: number, o: { from: number; to: number; deg: number; fx?: number; turn?: { bx: number; deg: number } }) {
  const fx0 = o.fx ?? frogX(o.from), fx1 = o.turn ? fx0 : frogX(o.to)
  const kiss = o.turn ? frogCheek(fx0, o.from, o.turn.deg) : frogCheek(fx0, o.from)
  const spot = lipsTo(kiss, o.deg)
  const a = t0 + WISH
  const hit = a + LEAN
  const poof = hit + POOF
  const leap = spot.lift > 10
  const moves: Move[] = [
    // 預備：雙手握在胸前、眼睛發亮
    { at: t0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/drool' },
    { at: t0, dur: 0.25, actor: 'bunny', do: 'hop', amount: 1.5 },
  ]
  if (!o.turn) {
    moves.push(
      // 閉眼嘟嘴湊過去（高的就跳上去）
      { at: a, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/blow' },
      { at: a, dur: LEAN, actor: 'bunny', do: 'moveTo', to: { x: spot.x, y: PB - spot.lift }, ease: 'out', ...(leap ? {} : { anticipate: 2 }) },
      ...(o.deg ? [{ at: a + 0.05, dur: LEAN - 0.05, actor: 'bunny', do: 'rotateTo', amount: o.deg } as Move] : []),
      // 啾！青蛙臉頰被親得縮一下
      { at: hit, dur: 0.22, actor: 'frog', do: 'squash', amount: 0.12 },
      // 退回原位，張開雙手等王子
      { at: hit + 0.18, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/hug' },
      { at: hit + 0.18, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: BX, y: PB }, ease: leap ? 'in' : 'inOut' },
      ...(o.deg ? [{ at: hit + 0.18, dur: 0.15, actor: 'bunny', do: 'rotateTo', amount: -o.deg } as Move] : []),
      // 啵！煙裡面變大一號
      { at: poof + 0.12, dur: 0.16, actor: 'frog', do: 'scaleTo', amount: o.to / o.from, ease: 'out' },
      { at: poof + 0.12, dur: 0.16, actor: 'frog', do: 'moveTo', to: { x: fx1, y: FY }, ease: 'out' },
    )
  } else {
    moves.push(
      // 她還在期待，青蛙先低下頭湊過來——啾！
      { at: a, dur: LEAN, actor: 'frog', do: 'rotateTo', amount: -o.turn.deg, ease: 'in' },
      { at: hit, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
      { at: hit, dur: 0.2, actor: 'bunny', do: 'squash', amount: 0.12 },
      { at: hit + 0.18, dur: 0.25, actor: 'frog', do: 'rotateTo', amount: o.turn.deg, ease: 'out' },
      // 啵！煙裡面她頭上多一頂皇冠
      { at: poof + 0.14, dur: 0.12, actor: 'crown', do: 'pop' },
    )
  }
  // 煙散開：呱呱跳一下；她傻眼（回馬槍是她自己戴著皇冠傻眼，皇冠跟著跳）
  moves.push(
    { at: poof + 0.34, dur: 0.3, actor: 'frog', do: 'hop', amount: 2.5 + k },
    { at: poof + 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: poof + 0.3, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2 },
  )
  if (o.turn) moves.push({ at: poof + 0.3, dur: 0.25, actor: 'crown', do: 'hop', amount: 2 })
  // 白煙蓋住變的那一個：青蛙（變大後的大小也蓋得住）；回馬槍是她
  const mid = o.turn ? { x: o.turn.bx, y: 77 - 0.5 * SB } : frogMid(fx1, o.to)
  const cover = o.turn ? 1.05 * SB : 0.8 * o.to
  const fx: Fx[] = [
    // 想像泡泡：親下去會變王子（👑）
    { at: t0, dur: WISH + 0.1, kind: 'bubble', actor: 'bunny', emoji: '👑', scale: 1.5, dx: 2 },
    // 啾：愛心從碰到的那一點冒出來
    { at: hit, dur: 0.6, kind: 'burst', x: kiss.x + 1, y: kiss.y - 4, n: 1, emoji: '💖', scale: 0.75 + 0.15 * k },
    // 啵：一大團白煙＋一圈星星
    { at: poof, dur: 0.6, kind: 'burst', x: mid.x, y: mid.y, n: 1, emoji: '☁️', scale: cover / 11 },
    { at: poof + 0.02, dur: 0.6, kind: 'burst', x: mid.x, y: mid.y, n: 6 + 2 * k, emoji: '✨', scale: 1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.3, do: 'punch', amount: 0.07 + 0.03 * k, to: kiss },
    { at: poof, dur: 0.3, do: 'shake', amount: 0.6 + 0.3 * k },
  ]
  const lights: Light[] = [
    { at: poof, dur: 0.04, level: -0.12 },
    { at: poof + 0.04, dur: 0.25, level: 0 },
  ]
  // 同一個「啾」、同一個「啵」、同一聲「呱呱」，一次比一次多疊一個音
  const cues: Cue[] = [
    { at: hit, sfx: 'plop' }, { at: hit + 0.05, sfx: 'blip' },
    { at: poof, sfx: 'poof' },
    { at: poof + 0.34, sfx: 'hic' }, { at: poof + 0.48, sfx: 'hic' },
  ]
  if (k >= 1) cues.push({ at: poof + 0.05, sfx: 'boing' })
  if (k >= 2) cues.push({ at: poof + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights, hit, kiss, poof }
}

// ---- 時間表 ----
const G1 = 0.8
const g1 = smooch(G1, 0, { from: FS[0], to: FS[1], deg: 6 })
const G2 = g1.poof + 0.78
const g2 = smooch(G2, 1, { from: FS[1], to: FS[2], deg: 0 })
/** 停一拍：她抬頭看看這麼大的青蛙，捏著鼻子、深呼吸 */
const PAUSE = g2.poof + 0.68
const G3 = PAUSE + 0.6
const g3 = smooch(G3, 2, { from: FS[2], to: FS[3], deg: 0 })
/** 國字拼好（最後一組筆畫落定）→ 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const ASIDE = g3.poof + 0.63
const HOME = ASIDE + 0.1
const PARK = HOME + 0.8
/** 語詞那一刻：大青蛙低頭一點點，她踮腳輕輕親一下 */
const WORD = PARK + 0.35
const BIG = FS[3]
const WORD_DEG = 15
const FXW = CX + 2 - frogCheek(0, BIG, WORD_DEG).x
const wordKiss = frogCheek(FXW, BIG, WORD_DEG)
const wordSpot = lipsTo(wordKiss, 0)
/** 回馬槍：她站在青蛙前面；青蛙低頭幾度才碰得到她的臉頰（照臉頰的高度算） */
const herCheek = at(0, SB, CHEEK[0], CHEEK[1], true)
const TURN_DEG = (() => {
  let best = 20
  for (let d = 10; d <= 50; d += 0.5) if (Math.abs(frogCheek(0, BIG, d).y - herCheek.y) < Math.abs(frogCheek(0, BIG, best).y - herCheek.y)) best = d
  return best
})()
const B4 = frogCheek(FXW, BIG, TURN_DEG).x - herCheek.x + 0.6
const G4 = WORD + 0.5
const g4 = smooch(G4, 3, { from: BIG, to: BIG, deg: 0, fx: FXW, turn: { bx: B4, deg: TURN_DEG } })
const ASK = 11.05
const AX = 128
const ASK_S = 1.35
const ANSWER = 13.6
const all = merge(g1, g2, g3, g4)

const clip: Clip = {
  format: 2,
  char: '親',
  meta: { theme: '親青蛙一下會變王子嗎', cast: '兔子女孩＋青蛙', gags: ['兔子女孩聽說親青蛙一下會變成王子，雙手握在胸前滿眼期待（頭上冒 👑），閉眼嘟嘴「啾」地親下去，「啵！」一團白煙——煙散開還是青蛙，只是變大一號，她傻眼（小青蛙彎腰親→跟她一樣大，踮腳跳起來親→停一拍捏鼻子深呼吸，跳得高高的親，青蛙變得比她大兩倍）；回馬槍是她又準備好時，大青蛙先低頭「啾」親她一下，「啵！」白煙蓋住的是她，煙散開她頭上多了一頂皇冠'] },
  duration: 15,
  // 粉紅的傍晚天空、草地：綠青蛙、白兔子、白煙都跳得出來
  bg: { top: '#FFD9E4', bottom: '#FFF4F0', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'frog', emoji: 'prop:frog', x: frogX(FS[0]), y: FY, size: F0 },
    { id: 'bunny', emoji: 'hero:bunny/dash', x: BX, y: PB, size: SB, hidden: true, flip: true },
    { id: 'crown', emoji: '👑', ...crownAt(B4), size: CROWN, hidden: true, float: true },
  ],
  moves: [
    // 開場：她咻地跑進來站好，看到青蛙——親！
    { at: 0, actor: 'bunny', do: 'enter', from: { x: -30, y: PB }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    ...g1.moves,
    { at: g1.poof + 0.75, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    ...g2.moves,
    // 停一拍：看看這麼大的青蛙……捏著鼻子、深呼吸
    { at: PAUSE, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/stinky' },
    { at: PAUSE + 0.3, dur: 0.3, actor: 'bunny', do: 'squash', amount: -0.12 },
    ...g3.moves,
    // 國字放大到中間：她跳到左邊、青蛙跳到右邊
    { at: ASIDE, dur: 0.35, actor: 'bunny', do: 'moveTo', to: { x: 24, y: PB }, arc: 5, ease: 'out' },
    { at: ASIDE + 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASIDE, dur: 0.4, actor: 'frog', do: 'moveTo', to: { x: 140, y: FY }, arc: 6, ease: 'out' },
    // 語詞那一刻：兩個走回中間，青蛙低頭一點點，她踮腳輕輕親一下
    { at: PARK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: PARK, dur: 0.32, actor: 'bunny', do: 'moveTo', to: { x: wordSpot.x, y: PB } },
    { at: PARK, dur: 0.35, actor: 'frog', do: 'moveTo', to: { x: FXW, y: FY }, arc: 4, ease: 'out' },
    { at: WORD - 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/blow' },
    { at: WORD - 0.15, dur: 0.15, actor: 'bunny', do: 'moveTo', to: { x: wordSpot.x, y: PB - wordSpot.lift }, ease: 'out' },
    { at: WORD - 0.15, dur: 0.15, actor: 'frog', do: 'rotateTo', amount: -WORD_DEG },
    { at: WORD + 0.25, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: B4, y: PB }, ease: 'inOut' },
    { at: WORD + 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: WORD + 0.25, dur: 0.2, actor: 'frog', do: 'rotateTo', amount: WORD_DEG },
    ...g4.moves,
    // 問他：青蛙呱呱跳走；她轉身跑到右前方、放大（皇冠跟著）
    { at: ASK, dur: 0.45, actor: 'frog', do: 'moveTo', to: { x: 215, y: FY }, arc: 10, ease: 'in' },
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK, actor: 'bunny', do: 'moveTo', to: { x: AX, y: PB - 1 }, dur: 0.4, arc: 6, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.4, actor: 'bunny', do: 'flip' },
    { at: ASK, actor: 'crown', do: 'moveTo', to: { x: crownAt(AX, ASK_S).x, y: crownAt(AX, ASK_S).y - 1 }, dur: 0.4, arc: 6, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'crown', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.65, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 12.65, dur: 0.3, actor: 'crown', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'crown', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    { at: ANSWER, dur: 0.3, actor: 'crown', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.14, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: ANSWER + 0.15, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.17, actor: 'bunny', do: 'moveTo', to: { x: 205, y: PB - 1 }, ease: 'in' },
    { at: ANSWER + 0.15, dur: 0.17, actor: 'crown', do: 'moveTo', to: { x: 205, y: crownAt(AX, ASK_S).y - 1 }, ease: 'in' },
  ],
  builds: [
    // 每「啾」一下，親到的那一點就飛出一組筆畫：立、木、見
    { at: g1.hit + 0.02, dur: 0.4, strokes: [0, 1, 2, 3, 4], from: g1.kiss, color: partColor('立') },
    { at: g2.hit + 0.02, dur: 0.4, strokes: [5, 6, 7, 8], from: g2.kiss, color: partColor('木') },
    { at: g3.hit + 0.02, dur: 0.4, strokes: [9, 10, 11, 12, 13, 14, 15], from: g3.kiss, color: partColor('見') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bunny', 'crown'], to: { x: 58, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx, ...g2.fx,
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'bunny', dx: 6 },
    ...g3.fx,
    // 語詞那一刻：小小的愛心
    { at: WORD, dur: 0.6, kind: 'burst', x: wordKiss.x + 1, y: wordKiss.y - 4, n: 1, emoji: '💖', scale: 0.6 },
    ...g4.fx,
  ],
  camera: [
    // 鏡頭固定在全景（青蛙會變很大），只有啾、啵那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.camera,
  ],
  lights: [
    ...all.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.35, say: '親' },
    ...all.cues,
    { at: HOME + 0.1, say: '親' },
    { at: WORD - 0.05, say: '親一下' },
    { at: WORD, sfx: 'blip' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '親' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
