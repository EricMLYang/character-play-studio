import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 指（v2）：兔子女孩手指一指「那邊！」——指尖「叮」地一亮、一支紅色大箭頭從指尖射出去；
// 小機器人螢幕臉一亮「嗶！」，頭也不回地照著箭頭直直衝過去，「咚！」撞上去。一次比一次慘：
// 第 1 次指右邊的大樹（撞上樹、彈回來趴扁，樹被撞倒）→ 第 2 次指左邊的大石頭（衝得更遠更快，撞到當機冒煙、零件亂飛，石頭滾走）→
// 先停一拍：她手舉到一半又放下、托著下巴流汗，小心翼翼地慢慢往天上一指——機器人直直往天上衝出畫面，
// 吹著口哨掉下來，砸出一個坑。每撞一次，她指尖就飛出一組筆畫：扌（第 1 次）、匕（第 2 次）、日（第 3 次）。
// 語詞那一刻她站在中間豎起手指「手指」。回馬槍（第四次）：她累了，手指托著下巴想「那……」，指尖又「叮」一亮——
// 指著的是她自己！機器人「嗶！」從坑裡跳出來朝她衝過來，兩個撞成一團滾出去。
// 最後畫面暗下來只剩「指」，兔子問「這是什麼字？」，手放耳邊等他回答，再指著字說「指！」，然後退場只留字。
// 指、指、手指、這是什麼字？、指

/** 兔子女孩：指的人。圖朝左（flip 朝右） */
const SB = 38
const PB = 77 - 0.42 * SB
/** 小機器人：照著衝的人。圖朝左，平常面向她（她在他左邊） */
const SR = 36
const PR = 77 - 0.42 * SR
/** 每次都站在同一個地方：她在左、他在她右邊 */
const BX = 66, RX = 90

/** 兔子各個姿勢的指尖在原圖（朝左、0～1）裡的位置 */
const TIP = { point: [0.18, 0.4], ponder: [0.31, 0.37], reach: [0.14, 0.5] } as const
type TipPose = keyof typeof TIP
/** 她站在 x、擺這個姿勢、朝右（flip）或朝左、轉 deg 度（以腳底為支點）、放大 s 倍時，指尖在哪裡 */
function tipAt(pose: TipPose, x: number, flip: boolean, deg = 0, s = 1): Vec {
  const [u, v] = TIP[pose]
  const feet = { x, y: PB + 0.42 * SB }
  const dx = (flip ? 0.5 - u : u - 0.5) * SB * s, dy = ((v - 0.5) * SB - 0.42 * SB) * s
  const r = (deg * Math.PI) / 180
  return { x: feet.x + dx * Math.cos(r) - dy * Math.sin(r), y: feet.y + dx * Math.sin(r) + dy * Math.cos(r) }
}

/** 指示箭頭：紅色粗線＋箭頭，從指尖射到 to（line 掛在她身上，dx／dy 對到指尖） */
const ARROW = '#F0142F'
function arrow(at: number, dur: number, from: Vec, to: Vec, bx: number, width = 2.2): Fx[] {
  const anchor = { x: bx, y: PB }
  const ang = Math.atan2(to.y - from.y, to.x - from.x)
  const head = (side: number): Vec => ({ x: to.x - 6 * Math.cos(ang + side * 0.5), y: to.y - 6 * Math.sin(ang + side * 0.5) })
  const seg = (t0: number, a: Vec, b: Vec, w: number): Fx => ({ at: t0, dur: dur - (t0 - at), kind: 'line', actor: 'bunny', dx: a.x - anchor.x, dy: a.y - anchor.y, to: b, color: ARROW, width: w })
  // 箭頭兩撇等線長到尖端（line 前 0.12 秒從起點長出來）才出來
  return [seg(at, from, to, width), seg(at + 0.12, to, head(1), width), seg(at + 0.12, to, head(-1), width)]
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const merge = (...gs: Gag[]): Gag => ({
  moves: gs.flatMap((g) => g.moves), fx: gs.flatMap((g) => g.fx), camera: gs.flatMap((g) => g.camera), cues: gs.flatMap((g) => g.cues),
})

/** 舉手預備多久才指下去；指下去之後多久機器人「嗶」；嗶完多久衝出去 */
const RAISE = 0.3, BEEP = 0.25, GO = 0.4

/**
 * 同一個笑點：她舉手（reach 預備）→ 手指一指（指尖「叮」一亮＋🌟、紅色箭頭從指尖射出去）→
 * 機器人螢幕臉一亮「嗶！」（❗）→ 轉向箭頭那邊、直直衝過去（dash，越衝越快）→「咚！」撞上（鏡頭推近＋震、💥、⭐，同一個音效、一次多疊一個音）。
 * k 是第幾次；o 是這一次的方向：她朝哪邊、指尖、箭頭指到哪、機器人衝到哪、要不要先轉身。回傳撞到的時間 hit 與指尖位置 tip。
 */
function poke(at: number, k: number, o: {
  flip: boolean; pose?: TipPose; deg?: number; bx?: number; target: Vec; arrowTo?: Vec | null
  turn?: boolean; botTo: Vec; dur: number; botMoves?: (go: number) => Move[]; hitAt?: Vec; slow?: number
}): Gag & { hit: number; tip: Vec } {
  const bx = o.bx ?? BX
  const pose = o.pose ?? 'point'
  const raise = RAISE + (o.slow ?? 0)
  const t = at + raise
  const tip = tipAt(pose, bx, o.flip, o.deg ?? 0)
  const go = t + BEEP + GO - 0.25
  const hit = go + o.dur
  const moves: Move[] = [
    // 預備：舉手
    { at, actor: 'bunny', do: 'swap', emoji: pose === 'ponder' ? 'hero:bunny/tired' : 'hero:bunny/reach' },
    // 指！
    { at: t, actor: 'bunny', do: 'swap', emoji: `hero:bunny/${pose}` },
    // 嗶！螢幕臉一亮
    { at: t + BEEP, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: t + BEEP, dur: 0.25, actor: 'bot', do: 'flash' },
    // 轉身、衝！
    ...(o.turn ? [{ at: go - 0.06, actor: 'bot', do: 'flip' } as Move] : []),
    { at: go - 0.06, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    ...(o.botMoves ? o.botMoves(go) : [{ at: go, dur: o.dur, actor: 'bot', do: 'moveTo', to: o.botTo, ease: 'in', anticipate: 3 } as Move]),
    // 她傻眼（我不是那個意思啦！）
    { at: hit + 0.12, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: hit + 0.12, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2.5 },
  ]
  if (o.deg) {
    moves.push({ at: t - 0.12, dur: 0.12, actor: 'bunny', do: 'rotateTo', amount: o.deg })
    moves.push({ at: hit + 0.1, dur: 0.12, actor: 'bunny', do: 'rotateTo', amount: -o.deg })
  }
  const at2 = o.hitAt ?? { x: o.botTo.x, y: o.botTo.y - 6 }
  const fx: Fx[] = [
    // 指尖「叮」：大大的星光
    { at: t, dur: 0.45, kind: 'burst', x: tip.x, y: tip.y, n: 1, emoji: '🌟', scale: 1.2 },
    ...(o.arrowTo === null ? [] : arrow(t + 0.04, hit - t + 0.1, tip, o.arrowTo ?? o.target, bx)),
    // 嗶！
    { at: t + BEEP, dur: o.botMoves ? go - t - BEEP + 0.04 : 0.5, kind: 'pop', actor: 'bot', emoji: '❗', dy: -1 },
    // 咚！
    { at: hit, dur: 0.5, kind: 'burst', x: at2.x, y: at2.y, n: 1, emoji: '💥', scale: 1.3 + 0.35 * k },
    { at: hit + 0.02, dur: 0.6, kind: 'burst', x: at2.x, y: at2.y + 2, n: 4 + 2 * k, emoji: k >= 1 ? '🔩' : '⭐', scale: 0.9 + 0.12 * k },
  ]
  const camera: Camera[] = [
    { at: t, dur: 0.25, do: 'punch', amount: 0.04, to: tip },
    { at: hit, dur: 0.35, do: 'punch', amount: 0.08 + 0.03 * k, to: at2 },
    { at: hit, dur: 0.35, do: 'shake', amount: 0.8 + 0.35 * k },
  ]
  const cues: Cue[] = [
    { at: t, sfx: 'clink' },
    { at: t + BEEP, sfx: 'blip' },
    { at: go, sfx: 'whoosh' },
    { at: hit, sfx: 'bonk' },
  ]
  if (k >= 1) cues.push({ at: hit + 0.06, sfx: 'crack' })
  if (k >= 2) cues.push({ at: hit + 0.12, sfx: 'rumble' })
  return { moves, fx, camera, cues, hit, tip }
}

// ---- 場景 ----
/** 右邊的大樹、左邊的大石頭、天上掉下來砸出的坑 */
const TREE = { x: 150, s: 42 }
const ROCK = { x: 13, s: 32 }
const HOLE = { x: 122, s: 30 }
const ground = (s: number) => 77 - 0.42 * s
/** 機器人 dash 的圖：最前面（拳頭）在原圖 0.12 */
const FRONT = (0.5 - 0.12) * SR
/** 字框一開始就在左上：天上那一下往右上衝，不經過字框 */
const FRAME = { x: 32, y: 20.5 }
const FRAME_K = 0.5

// ---- 時間表 ----
const G1 = 0.7
// 第 1 次：指右邊的樹
const g1 = poke(G1, 0, { flip: true, target: { x: 126, y: 45 }, turn: true, botTo: { x: TREE.x - 0.43 * TREE.s - FRONT + 4, y: PR }, dur: 0.2, hitAt: { x: TREE.x - 0.43 * TREE.s, y: 52 } })
const H1 = g1.hit
const G2 = H1 + 1.2
// 第 2 次：指左邊的大石頭（衝得更遠、更快；從她背後咻地過去）
const ROCK_R = ROCK.x + 0.46 * ROCK.s
const g2 = poke(G2, 1, { flip: false, target: { x: ROCK_R + 3, y: 58 }, botTo: { x: ROCK_R + FRONT - 1, y: PR }, dur: 0.24, hitAt: { x: ROCK_R, y: 58 } })
const H2 = g2.hit
/** 停一拍：她舉手舉到一半又放下、托著下巴冒汗，再慢慢地往天上指 */
const PAUSE = H2 + 1.05
const G3 = PAUSE + 0.8
const UP_DEG = -12
/** 往右上直直衝出畫面的終點（方向跟箭頭一樣） */
const SKY = { x: RX + 46, y: -42 }
const FALL = 0.3
const g3 = poke(G3, 2, {
  flip: true, deg: UP_DEG, slow: 0.15, turn: true, botTo: SKY, dur: 0.42 + FALL,
  // 箭頭跟他衝的方向平行
  arrowTo: (() => { const p = tipAt('point', BX, true, UP_DEG); return { x: p.x + (SKY.x - RX) * 0.5, y: p.y + (SKY.y - PR) * 0.5 } })(),
  target: SKY,
  hitAt: { x: HOLE.x, y: 66 },
  botMoves: (go) => [
    { at: go, dur: 0.12, actor: 'bot', do: 'rotateTo', amount: -62, pivot: 'center' },
    { at: go, dur: 0.26, actor: 'bot', do: 'moveTo', to: SKY, ease: 'in', anticipate: 3 },
    // 畫面外：轉回來、換成手腳亂揮，移到坑的正上方，吹著口哨直直掉下來
    { at: go + 0.3, dur: 0.01, actor: 'bot', do: 'rotateTo', amount: 62, pivot: 'center' },
    { at: go + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/slip' },
    { at: go + 0.3, dur: 0.01, actor: 'bot', do: 'moveTo', to: { x: HOLE.x, y: -40 } },
    { at: go + 0.42, dur: FALL, actor: 'bot', do: 'moveTo', to: { x: HOLE.x, y: PR }, ease: 'in' },
  ],
})
const H3 = g3.hit
/** 國字拼好（最後一組筆畫落定）→ 放大到中間 → 停 0.8 秒以上才讓位 → 語詞 */
const HOME = H3 + 0.46
const PARK = H3 + 0.42 + 0.82
const WORD = PARK + 0.2
/** 語詞那一刻她站在中間、放大 */
const MX = 80
const WORD_S = 1.15
/** 回馬槍：她走回原位、累了托著下巴 */
const G4 = WORD + 0.55
const B4 = 70
const g4 = poke(G4, 3, {
  flip: true, pose: 'ponder', bx: B4, arrowTo: null, target: { x: B4, y: 50 }, turn: true,
  botTo: { x: B4 + 12 + FRONT - 2, y: PR }, dur: 0.17, hitAt: { x: B4 + 9, y: 52 },
})
const H4 = g4.hit
/** 撞成一團滾到左邊 */
const HEAP = 50
const ASK = 11.0
const AX = 128
const ASK_S = 1.35
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '指',
  meta: { theme: '兔子女孩手指一指，小機器人就照著直直衝過去', cast: '兔子女孩＋小機器人＋大樹／大石頭', gags: ['兔子女孩手指一指「那邊！」（指尖叮一亮、紅箭頭射出去），小機器人「嗶！」就照著箭頭直直衝過去撞上，一次比一次慘（右邊的樹，撞倒樹趴扁→左邊的大石頭，當機冒煙零件亂飛→停一拍：她慢慢往天上指，他直直衝出畫面再掉下來砸出一個坑）；回馬槍是她累了手指托著下巴，指尖又一亮——指著的是她自己，機器人朝她衝過來撞成一團'] },
  duration: 15,
  // 暖白天空、草地：紅箭頭、橘色機器人、白兔子都跳得出來
  bg: { top: '#FFF2D8', bottom: '#FFFBF0', floor: '#CFE6A6', scenery: 'hills' },
  actors: [
    { id: 'hole', emoji: '🕳️', x: HOLE.x, y: 72.5, size: HOLE.s, hidden: true, float: true },
    { id: 'tree', emoji: 'prop:tree', x: TREE.x, y: ground(TREE.s), size: TREE.s },
    { id: 'rock', emoji: 'prop:rock', x: ROCK.x, y: ground(ROCK.s), size: ROCK.s, pivot: 'center' },
    // 機器人畫在她後面：往左衝時從她背後咻地過去
    { id: 'bot', emoji: 'hero:bot/idle', x: RX, y: PR, size: SR },
    { id: 'bunny', emoji: 'hero:bunny/dash', x: BX, y: PB, size: SB, hidden: true, flip: true },
  ],
  moves: [
    // 開場：她咻地跑進來站好，抬頭看字框——指！
    { at: 0, actor: 'bunny', do: 'enter', from: { x: -30, y: PB }, dur: 0.4, ease: 'out' },
    { at: 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 第 1 次
    ...g1.moves,
    // 撞上樹：彈回來趴扁；樹晃一晃，往右倒出畫面
    { at: H1, dur: 0.24, actor: 'bot', do: 'moveTo', to: { x: 110, y: PR }, arc: 4, ease: 'out' },
    { at: H1 + 0.22, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
    { at: H1, dur: 0.3, actor: 'tree', do: 'shake', amount: 1.2 },
    { at: H1 + 0.35, dur: 0.4, actor: 'tree', do: 'rotateTo', amount: 85, ease: 'in' },
    { at: H1 + 0.75, dur: 0.25, actor: 'tree', do: 'moveTo', to: { x: 215, y: ground(TREE.s) }, ease: 'in' },
    { at: H1 + 1.0, dur: 0.05, actor: 'tree', do: 'vanish' },
    // 爬起來走回原位、轉回來面向她
    { at: H1 + 0.85, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: H1 + 0.85, actor: 'bot', do: 'flip' },
    { at: H1 + 0.85, dur: 0.38, actor: 'bot', do: 'moveTo', to: { x: RX, y: PR } },
    { at: H1 + 1.25, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: H1 + 0.75, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 這次轉身指左邊
    { at: G2 - 0.12, actor: 'bunny', do: 'flip' },
    // 第 2 次
    ...g2.moves,
    // 撞上石頭：彈回一點點、當機冒煙原地轉一圈；石頭晃一晃，滾出畫面
    { at: H2, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: ROCK_R + FRONT + 3, y: PR }, ease: 'out' },
    { at: H2 + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/glitch' },
    { at: H2 + 0.12, dur: 0.5, actor: 'bot', do: 'shake', amount: 1.4 },
    { at: H2 + 0.62, dur: 0.3, actor: 'bot', do: 'spin', times: 1, pivot: 'center' },
    { at: H2, dur: 0.3, actor: 'rock', do: 'shake', amount: 0.8 },
    { at: H2 + 0.45, dur: 0.6, actor: 'rock', do: 'moveTo', to: { x: -30, y: ground(ROCK.s) }, ease: 'in' },
    { at: H2 + 0.45, dur: 0.6, actor: 'rock', do: 'rotateTo', amount: -220, ease: 'in' },
    { at: H2 + 1.05, dur: 0.05, actor: 'rock', do: 'vanish' },
    { at: H2 + 0.8, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: H2 + 0.8, actor: 'bunny', do: 'flip' },
    // 走回原位（從她背後經過）、轉回來面向她，等她下命令
    { at: H2 + 0.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: H2 + 0.95, actor: 'bot', do: 'flip' },
    { at: H2 + 0.95, dur: 0.45, actor: 'bot', do: 'moveTo', to: { x: RX, y: PR } },
    { at: H2 + 1.4, actor: 'bot', do: 'flip' },
    { at: H2 + 1.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    // 停一拍：手舉到一半又放下，托著下巴想
    { at: PAUSE, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/reach' },
    { at: PAUSE + 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: PAUSE + 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ponder' },
    // 第 3 次（慢慢地往天上指）
    ...g3.moves,
    // 砸進坑裡趴扁
    { at: H3, dur: 0.3, actor: 'hole', do: 'pop' },
    { at: H3, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
    // 國字放大到中間：她跳到右邊；他在坑裡坐起來頭暈
    { at: HOME - 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: HOME - 0.05, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: 146, y: PB }, arc: 5, ease: 'out' },
    { at: HOME + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: HOME + 0.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    // 語詞那一刻：走到畫面中間、放大，豎起手指——手指！
    { at: PARK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: PARK, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: MX, y: PB } },
    { at: PARK, actor: 'bunny', do: 'flip' },
    { at: WORD - 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'bunny', do: 'hop', amount: 3 },
    { at: WORD - 0.05, dur: 0.25, actor: 'bunny', do: 'scaleTo', amount: WORD_S, ease: 'back' },
    // 回到原位、縮回來
    { at: G4 - 0.25, dur: 0.22, actor: 'bunny', do: 'scaleTo', amount: 1 / WORD_S },
    { at: G4 - 0.25, actor: 'bunny', do: 'flip' },
    { at: G4 - 0.25, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: B4, y: PB } },
    // 第 4 次：他從坑裡跳出來（站起來）
    { at: G4 + RAISE + BEEP, dur: 0.12, actor: 'bot', do: 'hop', amount: 3 },
    ...g4.moves,
    // 撞成一團：兩個一起轉著滾到左邊，她頭暈坐倒、他趴扁
    { at: H4, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: HEAP - 6, y: PB }, arc: 6, ease: 'out' },
    { at: H4, dur: 0.4, actor: 'bunny', do: 'spin', times: 1, pivot: 'center' },
    { at: H4, dur: 0.4, actor: 'bot', do: 'moveTo', to: { x: HEAP + 14, y: PR }, arc: 6, ease: 'out' },
    { at: H4, dur: 0.4, actor: 'bot', do: 'spin', times: 1, pivot: 'center' },
    { at: H4 + 0.4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dizzy' },
    { at: H4 + 0.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/glitch' },
    // 問他：坑收掉，他坐在旁邊頭暈；她站起來走到右前方、放大
    { at: ASK, dur: 0.25, actor: 'hole', do: 'vanish' },
    { at: ASK, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: ASK, dur: 0.35, actor: 'bot', do: 'moveTo', to: { x: 96, y: PR }, arc: 4, ease: 'out' },
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK, actor: 'bunny', do: 'flip' },
    { at: ASK, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: AX, y: PB - 1 }, arc: 6, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.65, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: ANSWER + 0.22, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: 205, y: PB - 1 }, ease: 'in' },
    { at: ANSWER + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ANSWER + 0.1, actor: 'bot', do: 'flip' },
    { at: ANSWER + 0.12, dur: 0.28, actor: 'bot', do: 'moveTo', to: { x: 200, y: PR }, ease: 'in' },
  ],
  builds: [
    // 每撞一下，她指尖就飛出一組筆畫：扌、匕、日
    { at: H1 + 0.02, dur: 0.4, strokes: [0, 1, 2], from: g1.tip, color: partColor('扌') },
    { at: H2 + 0.02, dur: 0.4, strokes: [3, 4], from: g2.tip, color: partColor('匕') },
    { at: H3 + 0.02, dur: 0.4, strokes: [5, 6, 7, 8], from: g3.tip, color: partColor('日') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bunny'], to: { x: 58, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    { at: H1 + 0.05, dur: 0.6, kind: 'burst', x: TREE.x - 12, y: 44, n: 6, emoji: '🍃' },
    ...g2.fx,
    { at: H2 + 0.15, dur: H2 + 0.9 - (H2 + 0.15), kind: 'stink', actor: 'bot', dy: -16, scale: 1.4 },
    // 停一拍：她冒汗，他歪頭等
    { at: PAUSE + 0.4, kind: 'sweat', actor: 'bunny', dx: 6 },
    ...g3.fx,
    { at: H3 + 0.3, dur: 1.4, kind: 'dizzy', actor: 'bot' },
    // 語詞那一刻：指尖閃一下
    { at: WORD + 0.05, dur: 0.5, kind: 'burst', ...tipAt('point', MX, false, 0, WORD_S), n: 1, emoji: '🌟', scale: 1.3 },
    ...g4.fx,
    { at: H4 + 0.4, dur: ASK - H4 - 0.4, kind: 'dizzy', actor: 'bunny' },
  ],
  camera: [
    // 鏡頭固定在全景（機器人會衝過整個畫面），只有指下去、撞上那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g1.camera, ...g2.camera, ...g3.camera, ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.3, say: '指' },
    ...g1.cues,
    { at: H1 + 0.6, sfx: 'rumble' },
    ...g2.cues,
    { at: H2 + 0.45, sfx: 'slide' },
    ...g3.cues,
    { at: G3 + RAISE + 0.15 + BEEP + GO - 0.25 + 0.32, sfx: 'slide' },
    { at: HOME + 0.1, say: '指' },
    { at: WORD, say: '手指' },
    ...g4.cues,
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '指' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
