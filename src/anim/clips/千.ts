import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 千（v2）：兔子女孩想把錢袋裡的錢倒出來。每次她把錢袋對著前面用力一搖「嘩啦」——金幣就「噗」地噴出來，
// 而且一次比上一次多十倍，後座力把她撞得一次比一次慘：一枚（她被頂退一步、傻眼）→ 十枚疊成一座小塔（被撞得一屁股跌坐）→
// 冒汗想一想、搖最用力：一百枚嘩啦一堆（她被撞上天轉圈、摔下來趴扁）。旁邊大大的數字每次多一個 0：1 → 10 → 100。
// 第一枚金幣變成一撇、十枚的塔頂飛出一橫、一百枚的堆裡飛出一豎。
// 回馬槍：她學乖了，先用力跺腳站穩再搖——這次真的沒被撞退，閉眼得意；可是金幣停不下來、數不完，
// 越堆越高變成一座金幣山，把她整個人頂到山上去。數字再多一個 0：1000，「一千」。
// 千、千、一千、這是什麼字？、千
const S = 36
const X = 34
const P = 77 - 0.42 * S

type V = { x: number; y: number }

/** 錢袋（先用 💰 頂著，之後換存錢筒的自製道具圖）：拿在手上時袋口轉向右邊 */
const BAG = 16
const BAG_FLOOR = 77 - 0.42 * BAG
/** push 姿勢兩手在前面（圖朝左、她 flip 朝右） */
const hold = (x: number, y = P): V => ({ x: x + 19, y: y + 1 })
/** 袋口：金幣從這裡噴出來 */
const MOUTH: V = { x: X + 27, y: P + 1 }

/** 金幣：飛出來的是 🪙，落在地上的是躺平的金色橢圓（線條畫的，掛在看不見的錨上） */
const GOLD = '#F5B800'
const COIN = 9
const COIN1: V = { x: 90, y: 77 - 0.42 * COIN }
/** 一枚躺平的金幣 */
const coinAt = (x: number, y: number, from: number, to: number): Fx =>
  ({ at: from, dur: to - from, kind: 'tube', actor: 'rb', dx: x - 1.5, dy: y, to: { x: x + 1.5, y }, color: GOLD, width: 3, n: 99 })

/** 十枚疊成一座塔 */
const TOWER = 106
const towerY = (i: number) => 72.6 - i * 2.2
/** 一堆（一百枚）與一座山（一千枚）：拋物線的小山，coins 是每一枚的位置與「山長到多大才蓋到它」 */
function mound(cx: number, w: number, h: number, dx = 3.6, dy = 2.3) {
  const out: { x: number; y: number; s: number }[] = []
  for (let r = 0; r * dy < h - 0.8; r++) {
    const hh = r * dy
    const hw = w * Math.sqrt(1 - hh / h)
    const off = (r % 2) * (dx / 2)
    for (let x = cx - hw + off; x <= cx + hw; x += dx) {
      const u = (x - cx) / w
      const q = hh / h
      out.push({ x, y: 72.6 - hh, s: (q + Math.sqrt(q * q + 4 * u * u)) / 2 })
    }
  }
  return out
}
const PILE = mound(102, 17, 13)
const MX = 92
const MW = 74
const MH = 30
const MOUNT = mound(MX, MW, MH)
/** 山在 x 的高度（地面往上） */
const mountH = (x: number) => MH * Math.max(0, 1 - ((x - MX) / MW) ** 2)

/** 大數字：一格一格的線條數字，每次在右邊多一個 0 */
const NUM_X = 104
const NUM_Y = 27
const DW = 7
const DH = 12
const NUM_C = '#E03131'
function digit(i: number, d: 0 | 1, from: number, to: number): Fx[] {
  const x0 = NUM_X + i * 10.5
  const seg = (a: V, b: V): Fx => ({ at: from, dur: to - from, kind: 'tube', actor: 'rb', dx: a.x, dy: a.y, to: b, color: NUM_C, width: 2.6, n: 99 })
  if (d === 1) {
    const mx = x0 + DW * 0.6
    return [seg({ x: mx, y: NUM_Y }, { x: mx, y: NUM_Y + DH }), seg({ x: mx, y: NUM_Y }, { x: mx - 2.8, y: NUM_Y + 2.8 })]
  }
  const L = x0, R = x0 + DW, T = NUM_Y, B = NUM_Y + DH
  return [seg({ x: L, y: T }, { x: R, y: T }), seg({ x: R, y: T }, { x: R, y: B }), seg({ x: R, y: B }, { x: L, y: B }), seg({ x: L, y: B }, { x: L, y: T })]
}
/** 第 i 位數字亮出來的那一刻（✨＋嗶） */
const digitPop = (i: number, at: number): Fx => ({ at, kind: 'burst', x: NUM_X + i * 10.5 + DW / 2, y: NUM_Y + DH / 2, emoji: '✨', n: 6, dur: 0.4, scale: 0.9 })

/**
 * 「嘩啦——噗！」：她把錢袋撿起來、袋口對著前面（預備）→ 用力搖，叮叮噹噹 → 金幣「噗」地噴出去，
 * 後座力撞到她：鏡頭推近＋震＋同一個「咚」＋💥（一次比一次大）。k 是第幾次；回傳噴出來的那一刻 b。
 * k 3（回馬槍）只做到噴出來，後面由外面接。
 */
function shake(s: number, k: number) {
  const b = s + 0.5
  const moves: Move[] = [
    // 預備：撿起錢袋、袋口轉向前面
    { at: s - 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/push' },
    { at: s - 0.45, actor: 'bag', do: 'moveTo', to: hold(X), dur: 0.25, ease: 'out' },
    { at: s - 0.45, actor: 'bag', do: 'rotateTo', amount: 90, dur: 0.25 },
    // 用力搖
    { at: s, actor: 'bag', do: 'shake', amount: 1.5 + 0.5 * k, dur: 0.45 },
    { at: s, actor: 'bunny', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.45 },
    // 噗！袋子往後一頂
    { at: b, actor: 'bag', do: 'squash', amount: -0.25, dur: 0.2 },
  ]
  const fx: Fx[] = [{ at: b, kind: 'burst', x: MOUTH.x + 2, y: MOUTH.y, emoji: '💨', n: 5, dur: 0.3, scale: 0.6 + 0.2 * k }]
  const cues: Cue[] = [{ at: s, sfx: 'clink' }, { at: s + 0.15, sfx: 'clink' }, { at: s + 0.3, sfx: 'clink' }, { at: b, sfx: 'poof' }]
  const camera: Camera[] = []
  if (k === 3) return { b, moves, fx, cues, camera }
  // 後座力撞到她
  fx.push({ at: b + 0.02, kind: 'burst', x: X + 8, y: P - 8, n: 1, dur: 0.4, scale: 0.9 + 0.35 * k })
  cues.push({ at: b + 0.02, sfx: 'bonk' })
  camera.push(
    { at: b, dur: 0.4, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: X + 4, y: 60 } },
    { at: b, dur: 0.3, do: 'shake', amount: 1 + 0.6 * k },
  )
  moves.push({ at: b, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' })
  if (k === 0) {
    // 被頂退一步，傻眼；錢袋掉在腳前
    moves.push(
      { at: b, actor: 'bunny', do: 'moveTo', to: { x: X - 5, y: P }, dur: 0.18, ease: 'out' },
      { at: b + 0.05, actor: 'bag', do: 'moveTo', to: { x: X + 12, y: BAG_FLOOR }, dur: 0.3, arc: 4, ease: 'in' },
      { at: b + 0.05, actor: 'bag', do: 'rotateTo', amount: -90, dur: 0.3 },
      { at: b + 0.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
      { at: b + 0.55, actor: 'bunny', do: 'moveTo', to: { x: X, y: P }, dur: 0.2 },
    )
  } else if (k === 1) {
    // 被撞得往後滑、一屁股跌坐
    moves.push(
      { at: b, actor: 'bunny', do: 'moveTo', to: { x: X - 12, y: P }, dur: 0.25, ease: 'out' },
      { at: b + 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' },
      { at: b + 0.05, actor: 'bag', do: 'moveTo', to: { x: X + 10, y: BAG_FLOOR }, dur: 0.4, arc: 10, ease: 'in' },
      { at: b + 0.05, actor: 'bag', do: 'rotateTo', amount: -90, dur: 0.4 },
      { at: b + 0.8, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
      { at: b + 0.8, actor: 'bunny', do: 'moveTo', to: { x: X, y: P }, dur: 0.3 },
    )
    cues.push({ at: b + 0.25, sfx: 'plop' })
  } else {
    // 被撞上天轉圈，摔下來趴扁
    moves.push(
      { at: b, actor: 'bunny', do: 'moveTo', to: { x: X - 3, y: P - 24 }, dur: 0.35, ease: 'out' },
      { at: b, actor: 'bunny', do: 'spin', pivot: 'center', times: 2, dur: 0.7 },
      { at: b + 0.45, actor: 'bunny', do: 'moveTo', to: { x: X - 3, y: P }, dur: 0.3, ease: 'in' },
      { at: b + 0.75, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
      { at: b + 0.05, actor: 'bag', do: 'moveTo', to: { x: X + 10, y: BAG_FLOOR }, dur: 0.6, arc: 22, ease: 'in' },
      { at: b + 0.05, actor: 'bag', do: 'rotateTo', amount: -450, dur: 0.6 },
    )
    fx.push({ at: b + 0.8, kind: 'dizzy', actor: 'bunny', dur: 1.0, dy: 8 })
    cues.push({ at: b + 0.75, sfx: 'bonk' })
  }
  return { b, moves, fx, cues, camera }
}

const S1 = 1.2
const S2 = 2.85
const PAUSE = 4.5
const S3 = 5.45
const k1 = shake(S1, 0)
const k2 = shake(S2, 1)
const k3 = shake(S3, 2)
/** 金幣落地 */
const L1 = k1.b + 0.45
const L2 = k2.b + 0.5
const L3 = k3.b + 0.5
const FULL = L3 + 0.9
const PARK = FULL + 0.85
/** 回馬槍 */
const STOMP = 8.0
const S4 = 8.8
const k4 = shake(S4, 3)
const B4 = k4.b
/** 金幣山長大的那段 */
const G0 = B4 + 0.15
const GD = 1.0
const LIFT = B4 + 0.6
const TOP: V = { x: 50, y: 72.6 - mountH(50) + 1 - 0.42 * S }
const WORD = G0 + GD - 0.1
const POPOUT = 10.95
const ASK = 11.1
const ANSWER = 13.65

/** 一千枚：噴個不停 */
const STREAM = Array.from({ length: 11 }, (_, i) => B4 + i * 0.11)

const clip: Clip = {
  format: 2,
  char: '千',
  meta: { theme: '搖錢袋：金幣多十倍', cast: '兔子女孩＋錢袋＋金幣', gags: ['兔子女孩用力搖錢袋，每搖一次噴出來的金幣就多十倍（1 → 10 → 100，旁邊的大數字每次多一個 0），後座力把她撞得一次比一次慘（退一步傻眼 → 跌坐 → 撞上天摔趴）；回馬槍是她先跺腳站穩，這次真的沒被撞退、閉眼得意，可是金幣數不完、越堆越高，變成一座 1000 枚的金幣山把她頂到山上'] },
  duration: 15,
  bg: { top: '#E7F1FF', bottom: '#F6FAFF', floor: '#D9C7A3', scenery: 'hills' },
  actors: [
    // 看不見的錨：地上的金幣與大數字都掛在它身上（dx／dy 直接是舞台座標）
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 40, hidden: true },
    { id: 'coin', emoji: '🪙', x: MOUTH.x, y: MOUTH.y, size: COIN, hidden: true, pivot: 'center' },
    { id: 'bunny', emoji: 'hero:bunny/dash', x: X, y: P, size: S, flip: true, hidden: true },
    { id: 'bag', emoji: '💰', x: X + 12, y: BAG_FLOOR, size: BAG, pivot: 'center', float: true },
  ],
  moves: [
    // 開場：她咻地衝進來，指著字框「千！」
    { at: 0, actor: 'bunny', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    // 第 1 次：一枚
    ...k1.moves,
    { at: k1.b, actor: 'coin', do: 'pop', dur: 0.1 },
    { at: k1.b, actor: 'coin', do: 'moveTo', to: COIN1, dur: 0.45, arc: 12, ease: 'in' },
    { at: k1.b, actor: 'coin', do: 'rotateTo', amount: 720, dur: 0.45 },
    { at: L1, actor: 'coin', do: 'hop', amount: 2, dur: 0.2 },
    // 第 2 次：十枚
    ...k2.moves,
    // 第 3 次前停一拍：托下巴看著錢袋、冒汗；錢袋自己叮噹一下（裡面還有）
    { at: PAUSE, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ponder' },
    { at: PAUSE + 0.2, actor: 'bag', do: 'hop', amount: 1.5, dur: 0.25 },
    ...k3.moves,
    { at: L3, actor: 'coin', do: 'vanish', dur: 0.05 },
    // 讓位：她爬起來走回去
    { at: FULL + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: FULL + 0.4, actor: 'bunny', do: 'moveTo', to: { x: X, y: P }, dur: 0.35 },
    // 回馬槍：先用力跺腳站穩
    { at: STOMP, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/stomp' },
    { at: STOMP + 0.05, actor: 'bunny', do: 'hop', amount: 2, dur: 0.2 },
    ...k4.moves,
    // 噴出來了——她站得穩穩的，閉眼得意
    { at: B4 + 0.12, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    // 金幣停不下來，山長到她腳下，把她頂上去
    { at: LIFT - 0.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: LIFT, actor: 'bunny', do: 'moveTo', to: TOP, dur: 0.4, ease: 'out' },
    { at: LIFT - 0.15, actor: 'bag', do: 'moveTo', to: { x: 38, y: 72.6 - mountH(38) - 5 }, dur: 0.35, arc: 6, ease: 'in' },
    { at: LIFT - 0.15, actor: 'bag', do: 'rotateTo', amount: -90, dur: 0.35 },
    // 一千！她在山上指著 1000
    { at: WORD, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: WORD, actor: 'bunny', do: 'hop', amount: 3, dur: 0.3 },
    // 金幣山「噗」地散掉，她落回地上
    { at: POPOUT, actor: 'bag', do: 'vanish', dur: 0.1 },
    { at: POPOUT, actor: 'bunny', do: 'moveTo', to: { x: 30, y: P + 2 }, dur: 0.3, ease: 'in' },
    // 問他：她在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK + 0.05, actor: 'bunny', do: 'scaleTo', amount: 1.05, dur: 0.3 },
    { at: 12.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.2, actor: 'bunny', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.75, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, actor: 'bunny', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：咻地往左衝出去
    { at: ANSWER + 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: ANSWER + 0.1, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.12, actor: 'bunny', do: 'moveTo', to: { x: -35, y: P + 2 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 一枚金幣變成一撇；十枚的塔頂飛出一橫；一百枚的堆裡飛出一豎
    { at: L1 + 0.15, dur: 0.55, strokes: [0], from: 'coin', color: partColor('丿') },
    { at: L2 + 0.3, dur: 0.55, strokes: [1], from: { x: TOWER, y: towerY(9) }, color: partColor('十') },
    { at: L3 + 0.2, dur: 0.55, strokes: [2], from: { x: 102, y: 62 }, color: partColor('十') },
  ],
  glyph: [
    { at: FULL - 0.1, dur: 0.4, do: 'pulse' },
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.85, do: 'ask', keep: ['bunny'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 第 1 次：一枚（落地後一直躺在那裡，到一百枚把它蓋掉）
    ...k1.fx,
    { at: L1, kind: 'burst', x: COIN1.x, y: COIN1.y - 2, emoji: '✨', n: 5, dur: 0.35, scale: 0.7 },
    ...digit(0, 1, L1 + 0.1, FULL), ...digit(0, 1, PARK + 0.3, POPOUT),
    digitPop(0, L1 + 0.1),
    // 第 2 次：十枚飛出去，疊成一座塔
    ...k2.fx,
    { at: k2.b, kind: 'blow', x: MOUTH.x, y: MOUTH.y, to: { x: TOWER, y: 58 }, emoji: '🪙', n: 10, dur: 0.55 },
    ...Array.from({ length: 10 }, (_, i) => coinAt(TOWER, towerY(i), L2 - 0.15 + i * 0.03, L3 + 0.1)),
    ...digit(1, 0, L2 + 0.15, FULL), ...digit(1, 0, PARK + 0.3, POPOUT),
    digitPop(1, L2 + 0.15),
    // 第 3 次前停一拍
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'bunny', dur: 0.6 },
    // 第 3 次：一百枚嘩啦一堆
    ...k3.fx,
    ...[0, 1, 2, 3].map((i): Fx => ({ at: k3.b + i * 0.07, kind: 'blow', x: MOUTH.x, y: MOUTH.y - 2 + i * 1.3, to: { x: 96 + 4 * i, y: 60 + i }, emoji: '🪙', n: 12, dur: 0.55 })),
    ...PILE.map((c) => coinAt(c.x, c.y, L3 - 0.1 + 0.3 * c.s, G0)),
    { at: L3, kind: 'burst', x: 102, y: 64, emoji: '🪙', n: 10, dur: 0.45, scale: 1.1 },
    ...digit(2, 0, L3 + 0.2, FULL), ...digit(2, 0, PARK + 0.3, POPOUT),
    digitPop(2, L3 + 0.2),
    // 回馬槍：一千枚噴個不停，堆成一座山
    { at: STOMP + 0.1, kind: 'puff', actor: 'bunny', dur: 0.4 },
    ...k4.fx,
    ...STREAM.map((at, i): Fx => ({ at, kind: 'blow', x: MOUTH.x, y: MOUTH.y - 2 + (i % 3) * 1.5, to: { x: 80 + (i % 4) * 9, y: 50 + (i % 3) * 4 }, emoji: '🪙', n: 14, dur: 0.55 })),
    ...MOUNT.map((c) => coinAt(c.x, c.y, G0 + GD * c.s, POPOUT)),
    ...[0, 1, 2].map((i): Fx => ({ at: G0 + 0.3 + i * 0.35, kind: 'burst', x: MX + (i - 1) * 25, y: 60 - 6 * i, emoji: '🪙', n: 8, dur: 0.45, scale: 1 })),
    // 一千：多一個 0
    ...digit(3, 0, WORD, POPOUT),
    digitPop(3, WORD),
    ...[0, 1, 2, 3].map((i): Fx => ({ at: WORD + 0.08 * i, kind: 'burst', x: NUM_X + i * 10.5 + DW / 2, y: NUM_Y + DH / 2, emoji: '✨', n: 6, dur: 0.45, scale: 1 })),
    // 金幣山散掉
    { at: POPOUT, kind: 'burst', x: MX, y: 60, emoji: '🪙', n: 12, dur: 0.3, scale: 1.6 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 地上的金幣與數字一直留在畫面裡：國字拼好前不讓自動取景推近到只剩她
    { at: 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    ...k1.camera,
    ...k2.camera,
    ...k3.camera,
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 50 } },
    { at: LIFT + 0.4, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  lights: [
    { at: FULL, dur: 0.05, level: -0.25 },
    { at: FULL + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 0.6, say: '千' },
    ...k1.cues,
    { at: L1, sfx: 'clink' },
    ...k2.cues,
    ...Array.from({ length: 10 }, (_, i): Cue => ({ at: L2 - 0.15 + i * 0.03, sfx: 'tap' })).filter((_, i) => i % 3 === 0),
    { at: PAUSE + 0.2, sfx: 'clink' },
    ...k3.cues,
    { at: L3, sfx: 'clink' },
    { at: L3 + 0.1, sfx: 'tap' },
    { at: FULL + 0.05, say: '千' },
    { at: STOMP + 0.05, sfx: 'tap' },
    ...k4.cues,
    ...STREAM.filter((_, i) => i % 2 === 0).map((at): Cue => ({ at: at + 0.3, sfx: 'clink' })),
    { at: LIFT, sfx: 'rumble' },
    { at: WORD, say: '一千' },
    { at: WORD + 0.05, sfx: 'blip' },
    { at: POPOUT, sfx: 'poof' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '千' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
