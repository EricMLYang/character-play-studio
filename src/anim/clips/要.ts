import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 要（v2）：貪心的忍者小老鼠把一顆糖果舉在頭上，好開心——旁邊「啵」地冒出一個更大的好東西，他眼睛一亮（流口水），
// 「要！」把手上的往背後一丟、撲過去把新的舉起來。每次都是同一個「眼睛一亮→要！→往後一丟→撲過去」，只有東西一次比一次大，
// 丟掉的東西在背後堆成一堆：糖果換大棒棒糖（丟出糖果）→ 棒棒糖換草莓蛋糕（丟出棒棒糖）→ 先停一拍：比他還大的乳酪冒出來，
// 他看看手上的蛋糕、托下巴想一想、再看乳酪，口水流下來——要！蛋糕丟出去，他「嘿咻」把大乳酪舉過頭、腿直發抖。
// 每一次丟到背後那一堆「咚」地落地，就飛出一塊字：覀的上面、覀的下面、女。
// 回馬槍（第四次）：他舉著大乳酪轉身，看到背後那一堆被他丟掉的好東西，眼睛又一亮——「我要！」照樣把手上的往後一丟——
// 乳酪太重了丟不出去，往上一晃，「咚」地掉下來把他壓扁，什麼都沒拿到。
// 最後畫面暗下來只剩「要」，他跳到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「要！」，然後退場只留字。
// 要、要、要、要、我要、這是什麼字？、要
const SZ = 36
const P = 77 - 0.42 * SZ // 小老鼠（size 36）站在地上的 y
/** 他每次站的地方（面向右邊）；新東西冒出來的地方；他撲過去抓的地方 */
const X = 80
const N = 120
const GX = N - 13
/** 舉在頭上：東西的底貼著他舉高的手 */
const over = (mx: number, s: number) => ({ x: mx, y: 56 - 0.42 * s })
/** 舉重（lift 姿勢）的手比較高 */
const overLift = (mx: number, s: number) => ({ x: mx, y: 50 - 0.42 * s })
const floor = (x: number, s: number) => ({ x, y: 77 - 0.42 * s })

type Item = { id: string; size: number }
const CANDY: Item = { id: 'candy', size: 11 }
const LOLLY: Item = { id: 'lolly', size: 17 }
const CAKE: Item = { id: 'cake', size: 24 }
const CHEESE: Item = { id: 'cheese', size: 40 }
/** 背後那一堆（左邊、字框下面）：糖果、棒棒糖並排，蛋糕疊在上面 */
const PILE: Record<string, { x: number; y: number }> = {
  candy: floor(18, CANDY.size),
  lolly: floor(34, LOLLY.size),
  cake: { x: 25, y: floor(25, CAKE.size).y - 5 },
}
const CN = 134 // 大乳酪冒出來的地方（比較大，往右一點）

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/**
 * 同一個笑點：新東西「啵」地冒出來（R）→ 他眼睛一亮流口水（R+0.3）→ 「要！」（T）手上的往後一丟、撲過去 → 丟掉的「咚」落在背後那一堆，飛出一塊字。
 * pause 是第三次多停的那一拍（看看手上的、想一想、再看新的）。回傳 T。
 */
function want(R: number, k: number, held: Item, next: Item, pause: number, strokes: number[], color: string): number {
  g.moves.push({ at: R, actor: next.id, do: 'pop', dur: 0.25 })
  g.fx.push({ at: R + 0.1, kind: 'burst', actor: next.id, emoji: '✨', n: 5, dur: 0.45, scale: 0.9 + 0.3 * k })
  g.cues.push({ at: R, sfx: k === 2 ? 'rumble' : 'boing' })
  if (k === 2) g.camera.push({ at: R + 0.05, dur: 0.3, do: 'shake', amount: 1 })
  // 眼睛一亮、流口水
  g.moves.push({ at: R + 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' })
  g.cues.push({ at: R + 0.3, sfx: 'blip' })
  if (k === 2) {
    // 停一拍：看看手上的蛋糕、托下巴想一想……再看乳酪，口水流更多
    g.moves.push(
      { at: R + 0.62, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
      { at: R + 0.62, actor: held.id, do: 'tilt', amount: 8, dur: 0.3 },
      { at: R + 0.98, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
      { at: R + 0.98, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.2 },
    )
    g.fx.push({ at: R + 0.68, kind: 'sweat', actor: 'mouse', dx: 5 })
    g.cues.push({ at: R + 0.98, sfx: 'blip' })
  }
  const T = R + 0.65 + pause
  // 要！手上的往後一丟（從頭上拋到背後那一堆），他伸手撲過去
  const pile = PILE[held.id]
  g.moves.push(
    { at: T, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: T, actor: held.id, do: 'moveTo', to: pile, arc: k === 2 ? 4 : 14, dur: 0.48, ease: 'linear' },
    { at: T, actor: held.id, do: 'spin', times: 1 + k, dur: 0.48, pivot: 'center' },
    { at: T + 0.14, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: T + 0.14, actor: 'mouse', do: 'moveTo', to: { x: k === 2 ? CN : GX, y: P }, dur: 0.2, ease: 'in' },
  )
  g.camera.push({ at: T, dur: 0.35, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: X, y: 52 } })
  g.cues.push({ at: T + 0.02, sfx: 'whoosh' })
  // 咚：落在背後那一堆，飛出一塊字
  const L = T + 0.48
  g.moves.push({ at: L, actor: held.id, do: 'squash', amount: 0.25, dur: 0.2 })
  g.fx.push({ at: L, kind: 'puff', actor: held.id, dur: 0.4 })
  g.camera.push({ at: L, dur: 0.25, do: 'shake', amount: 0.5 + 0.4 * k })
  g.cues.push({ at: L, sfx: k === 2 ? 'bonk' : 'plop' })
  g.builds.push({ at: L + 0.02, dur: 0.5, strokes, from: { x: pile.x, y: pile.y - 3 }, color })
  // 抓到新的、舉過頭
  if (k < 2) {
    g.moves.push(
      { at: T + 0.36, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
      { at: T + 0.36, actor: next.id, do: 'moveTo', to: over(GX, next.size), dur: 0.15, ease: 'back' },
      // 舉著新的走回原來的地方
      { at: T + 0.62, actor: 'mouse', do: 'moveTo', to: { x: X, y: P }, dur: 0.38 },
      { at: T + 0.62, actor: next.id, do: 'moveTo', to: over(X, next.size), dur: 0.38 },
      { at: T + 1.02, actor: 'mouse', do: 'hop', amount: 2, dur: 0.2 },
      { at: T + 1.02, actor: next.id, do: 'hop', amount: 2, dur: 0.2 },
    )
    g.cues.push({ at: T + 0.36, sfx: 'tap' })
  } else {
    // 大乳酪太重：「嘿咻」慢慢舉過頭，腿直發抖
    g.moves.push(
      { at: T + 0.36, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/lift' },
      { at: T + 0.4, actor: next.id, do: 'moveTo', to: overLift(CN, next.size), dur: 0.5, ease: 'out' },
      { at: T + 0.9, actor: 'mouse', do: 'shake', amount: 0.6, dur: 2.0 },
      { at: T + 0.9, actor: next.id, do: 'shake', amount: 0.6, dur: 2.0 },
    )
    g.cues.push({ at: T + 0.4, sfx: 'slide' })
  }
  return T
}

const R1 = 0.45
const T1 = want(R1, 0, CANDY, LOLLY, 0, [0, 1, 2], partColor('覀'))
const R2 = T1 + 1.1
const T2 = want(R2, 1, LOLLY, CAKE, 0, [3, 4, 5], partColor('覀'))
const R3 = T2 + 1.1
const T3 = want(R3, 2, CAKE, CHEESE, 0.75, [6, 7, 8], partColor('女'))
const DONE = T3 + 0.48 + 0.52
const HOME = DONE + 0.05
const PARK = HOME + 0.95

/** 回馬槍（第四次）：舉著大乳酪轉身走到中間，看到背後那一堆，眼睛一亮「我要！」，照樣往後一丟——太重了，掉下來把他壓扁 */
const X4 = 84
const W = PARK + 0.85
const T4 = W + 0.7
const DROP = T4 + 0.55
const FLAT = DROP + 0.15
const ASK = FLAT + 0.65
const SQ = { x: X4 + 7, y: 77 - 7 - 0.42 * CHEESE.size } // 壓在扁扁的他身上

const clip: Clip = {
  format: 2,
  char: '要',
  meta: { theme: '貪心的小老鼠什麼都要', cast: '忍者小老鼠＋糖果、棒棒糖、蛋糕、大乳酪', gags: ['忍者小老鼠舉著好吃的，旁邊「啵」冒出更大的，他眼睛一亮流口水——「要！」把手上的往背後一丟、撲過去舉起新的，一次比一次大（糖果→大棒棒糖→停一拍，看看手上的蛋糕再看比他還大的乳酪，嘿咻舉過頭腿發抖），丟掉的在背後堆成一堆；回馬槍是他舉著大乳酪轉身看到那一堆，又「我要！」照樣往後一丟，乳酪太重丟不出去，「咚」掉下來把他壓扁'] },
  duration: ASK + 3.9,
  // 淡黃天空、草地：太陽在右上，字框放左上（背後只有天空）；丟掉的東西堆在字框下面的地上
  bg: { top: '#E3F2FF', bottom: '#F7FBFF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'mouse', emoji: 'hero:mouse/happy', x: X, y: P, size: SZ, flip: true, hidden: true },
    { id: 'candy', emoji: '🍬', ...over(X, CANDY.size), size: CANDY.size, hidden: true, pivot: 'center' },
    { id: 'lolly', emoji: '🍭', ...floor(N, LOLLY.size), size: LOLLY.size, hidden: true, pivot: 'center' },
    { id: 'cake', emoji: 'prop:cake', ...floor(N, CAKE.size), size: CAKE.size, hidden: true, pivot: 'center' },
    { id: 'cheese', emoji: '🧀', ...floor(CN, CHEESE.size), size: CHEESE.size, hidden: true, flip: true, pivot: 'center' },
  ],
  moves: [
    // 小老鼠跳出來，把糖果舉在頭上，好開心
    { at: 0, actor: 'mouse', do: 'pop', dur: 0.3 },
    { at: 0, actor: 'candy', do: 'pop', dur: 0.3 },
    { at: 0.25, actor: 'mouse', do: 'hop', amount: 2, dur: 0.2 },
    { at: 0.25, actor: 'candy', do: 'hop', amount: 2, dur: 0.2 },
    ...g.moves,
    // 回馬槍：舉著大乳酪轉身，搖搖晃晃走到中間
    { at: PARK + 0.05, actor: 'mouse', do: 'flip' },
    { at: PARK + 0.1, actor: 'mouse', do: 'moveTo', to: { x: X4, y: P }, dur: 0.6 },
    { at: PARK + 0.1, actor: 'cheese', do: 'moveTo', to: overLift(X4, CHEESE.size), dur: 0.6 },
    { at: PARK + 0.75, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: PARK + 0.75, actor: 'cheese', do: 'shake', amount: 0.6, dur: 0.4 },
    // 看到背後那一堆：眼睛一亮，我要！
    { at: W, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
    { at: W, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: W, actor: 'cheese', do: 'hop', amount: 1.5, dur: 0.2 },
    // 照樣往後一丟——太重了，只往上一晃
    { at: T4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/reach' },
    { at: T4, actor: 'cheese', do: 'moveTo', to: { x: X4 + 8, y: 22 }, dur: 0.22, ease: 'out' },
    { at: T4, actor: 'cheese', do: 'rotateTo', amount: 25, dur: 0.22 },
    { at: T4 + 0.25, actor: 'cheese', do: 'shake', amount: 0.8, dur: 0.28 },
    { at: T4 + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    // 咚！掉下來把他壓扁
    { at: DROP, actor: 'cheese', do: 'moveTo', to: SQ, dur: 0.15, ease: 'in' },
    { at: DROP, actor: 'cheese', do: 'rotateTo', amount: -25, dur: 0.15 },
    { at: FLAT, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
    { at: FLAT, actor: 'cheese', do: 'squash', amount: 0.2, dur: 0.2 },
    // 問他：乳酪和那一堆收掉，他爬起來變大站到左前方，面向國字
    { at: ASK - 0.05, actor: 'cheese', do: 'vanish', dur: 0.05 },
    { at: ASK - 0.05, actor: 'candy', do: 'vanish', dur: 0.05 },
    { at: ASK - 0.05, actor: 'lolly', do: 'vanish', dur: 0.05 },
    { at: ASK - 0.05, actor: 'cake', do: 'vanish', dur: 0.05 },
    { at: ASK, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: ASK, actor: 'mouse', do: 'flip' },
    { at: ASK, actor: 'mouse', do: 'scaleTo', amount: 1.35, dur: 0.3, ease: 'back' },
    { at: ASK - 0.05, actor: 'mouse', do: 'moveTo', to: { x: 34, y: P + 2 }, dur: 0.2 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: ASK + 1.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: ASK + 1.05, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: ASK + 1.55, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK + 2.0, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ASK + 2.52, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.1 },
    { at: ASK + 2.52, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ASK + 2.52, actor: 'mouse', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: ASK + 2.68, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: ASK + 2.68, actor: 'mouse', do: 'flip' },
    { at: ASK + 2.68, actor: 'mouse', do: 'moveTo', to: { x: -45, y: P + 2 }, dur: 0.15, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    // 字框一開始就在左上角（背後只有天空；右邊留給冒出來的好東西）
    { at: 0, dur: 0, do: 'park', to: { x: 24, y: 20 }, amount: 0.46 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: { x: 24, y: 20 }, amount: 0.46 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: ASK, dur: 2.85, do: 'ask', keep: ['mouse'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.12, dur: 0.4, do: 'home' },
    { at: ASK + 2.52, dur: 0.3, do: 'pulse' },
    { at: ASK + 3.0, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 我要！眼睛又亮了
    { at: W, kind: 'burst', x: 60, y: 62, emoji: '✨', n: 6, dur: 0.5, scale: 1.4 },
    { at: T4 + 0.3, kind: 'sweat', actor: 'mouse', dx: -5 },
    { at: FLAT, kind: 'burst', x: X4 + 24, y: 50, emoji: '💥', n: 1, dur: 0.45, scale: 2.6 },
    { at: FLAT + 0.1, kind: 'dizzy', actor: 'mouse', dx: -8, dy: 4, dur: ASK - FLAT - 0.15 },
    { at: ASK + 2.52, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 整段保持幾乎全景（擋掉自動取景往前預看、把丟出去的東西切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 46 } },
    ...g.camera,
    { at: T4, dur: 0.3, do: 'punch', amount: 0.12, to: { x: X4, y: 52 } },
    { at: FLAT, dur: 0.45, do: 'punch', amount: 0.15, to: { x: X4, y: 60 } },
    { at: FLAT, dur: 0.4, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.18 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: T1, say: '要' },
    { at: T2, say: '要' },
    { at: T3, say: '要' },
    ...g.cues,
    { at: HOME + 0.15, say: '要' },
    { at: W, say: '我要' },
    { at: W, sfx: 'blip' },
    { at: T4 + 0.02, sfx: 'whoosh' },
    { at: T4 + 0.25, sfx: 'tap' },
    { at: FLAT, sfx: 'bonk' },
    { at: FLAT + 0.03, sfx: 'rumble' },
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: ASK + 2.54, say: '要' },
    { at: ASK + 2.56, sfx: 'cheer' },
  ],
}

export default clip
