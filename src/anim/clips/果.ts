import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 果（v2）：字框正下方一棵大樹，樹上掛著一顆蘋果。楊捷睿每次踮腳伸手要摘，手快碰到的時候，蘋果就「啵」地自己長大一圈，
// 重到樹枝彎下來、整顆壓在他頭上，一次比一次大：被敲得跌坐（樹幹飛出木的橫豎）、被壓扁趴在地上（樹幹飛出木的撇捺）、
// 先停一拍：他盯著蘋果、慢慢伸手……蘋果長成大西瓜那麼大，把他整個壓扁（上面的田從這顆果子飛出來）——樹在下、果子在上，跟字一樣。
// 字拼好放大時，樹縮到字的右邊、大蘋果掛在樹冠上：果子對田、樹幹對木，各亮一下——長得一樣。
// 語詞：國字讓回上方，整棵樹「啵」地結滿蘋果，那顆大蘋果掉進他手裡（蘋果）。回馬槍：這次終於摘到了，他得意地張嘴一咬——
// 蘋果又「啵」地長得比樹還大，把他壓得最扁。最後畫面暗下來只剩「果」，他跳到前面問「這是什麼字？」，手放耳邊等，再指著字說「果！」，退場只留字。
// 果、果、蘋果、這是什麼字？、果

/** 楊捷睿（size 26）站在地上的 y；每次都站在同一個地方、面向右邊的樹 */
const S = 26
const B = 77 - 0.42 * S
const X0 = 50
/** 他頭頂、跌坐時頭頂、趴扁時背上的高度（蘋果壓下來的地方） */
const TOP = { stand: 50, sit: 57, flat: 67 }
/** 大樹（prop:tree，結果之後 swap 成 prop:apple-tree）：字框正下方，畫面上最大、最中間 */
const TX = 80, TS = 48
const TY = 77 - 0.42 * TS
/** 樹幹中間（木從這裡飛出來） */
const TRUNK = { x: TX, y: 68 }
/** 蘋果（🍎）：掛在樹冠左下角，蒂頭接在 STEM；越大越重、掛得越低 */
const AS = 7
const STEM = { x: 64, y: 41 }
/** 蘋果畫出來的半徑（s 是相對於一開始的倍率；小東西引擎會先放大約三成） */
const r = (s: number) => 0.5 * AS * 1.3 * s
const hang = (s: number) => ({ x: STEM.x, y: STEM.y + r(s) })
/** 每次「啵」長大幾倍：1.4 → 1.4 → 1.6，第四次 1.8（比樹還大） */
const GROW = [1.4, 1.4, 1.6]
const SC = [1, 1.4, 1.96, 3.136]
/** 傻眼停多久（看得見臉） */
const HOLD = 0.42

/**
 * 「啵—咚」：他換成雙手往上伸、踮腳（預備）→ 手快碰到時蘋果抖一下 → 「啵」長大一圈（✨）→ 樹枝彎下來、整棵樹往他那邊歪，
 * 蘋果掉在他頭上「咚」：💥＋白光＋鏡頭推近震一下，他傻眼停住 → 蘋果把他往下壓（跌坐／趴扁／壓得更扁）→ 樹枝彈回去，蘋果掛回樹上。
 * at 是「啵」那一刻，k 是第幾次（0、1、2），越後面越大。
 */
function bonk(at: number, k: number) {
  const s0 = SC[k], s1 = SC[k + 1]
  const R = r(s1)
  const hit = at + 0.28
  const press = hit + HOLD
  const back = press + 0.3
  const lean = 4 + 3 * k
  const low = k === 0 ? TOP.sit : TOP.flat
  const moves: Move[] = [
    // 踮腳伸手
    { at: at - 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    { at: at - 0.7, dur: 0.95, actor: 'yang', do: 'hop', amount: 2.5 },
    // 手快碰到：蘋果抖一下
    { at: at - 0.3, dur: 0.3, actor: 'apple', do: 'shake', amount: 0.8 + 0.4 * k },
    // 啵！長大一圈
    { at, dur: 0.2, actor: 'apple', do: 'scaleTo', amount: GROW[k], ease: 'back' },
    { at, dur: 0.2, actor: 'apple', do: 'moveTo', to: hang(s1), ease: 'back' },
    // 太重了：樹枝彎下來，蘋果咚地掉在他頭上
    { at: at + 0.15, dur: 0.13, actor: 'tree', do: 'rotateTo', amount: -lean, ease: 'in' },
    { at: at + 0.15, dur: 0.13, actor: 'apple', do: 'moveTo', to: { x: X0 + 2, y: TOP.stand - R + 1.5 }, ease: 'in' },
    { at: hit, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: hit, dur: 0.25, actor: 'yang', do: 'squash', amount: 0.2 + 0.08 * k },
    { at: hit, dur: 0.3, actor: 'apple', do: 'squash', amount: 0.08 },
    // 傻眼停住，然後被壓下去
    { at: press, actor: 'yang', do: 'swap', emoji: k === 0 ? 'hero:yang/fall' : 'hero:yang/flat' },
    { at: press, dur: 0.12, actor: 'apple', do: 'moveTo', to: { x: X0 + 2, y: low - R + 1.5 }, ease: 'in' },
    { at: press + 0.12, dur: 0.25, actor: 'apple', do: 'squash', amount: 0.1 + 0.04 * k },
    // 樹枝彈回去，蘋果掛回樹上
    { at: back, dur: 0.6, actor: 'tree', do: 'rotateTo', amount: lean, ease: 'elastic' },
    { at: back, dur: 0.45, actor: 'apple', do: 'moveTo', to: hang(s1), ease: 'back' },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', x: hang(s0).x, y: hang(s0).y, emoji: '✨', n: 6, dur: 0.35, scale: 1 + 0.2 * k },
    // 樹枝：從蒂頭拉到樹冠
    { at: at + 0.12, kind: 'line', actor: 'apple', dy: -R * 0.85, to: STEM, color: '#6B4423', width: 1.1, dur: back + 0.45 - at - 0.12 },
    // 💥 每次都在他頭上同一個位置，一次比一次大
    { at: hit, kind: 'burst', x: X0 - 6, y: TOP.stand - 4, n: 1, dur: 0.4, scale: 1.4 + 0.45 * k },
    { at: press + 0.1, kind: 'dizzy', actor: 'yang', dy: k === 0 ? 0 : 6, dur: 0.6 },
    { at: back, kind: 'burst', x: TX - 6, y: 48, emoji: '🍃', n: 5 + 2 * k, dur: 0.45 },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: X0 + 4, y: TOP.stand + 4 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 1 + 0.5 * k },
    { at: press + 0.12, dur: 0.25, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  const lights: Light[] = [{ at: hit, dur: 0.04, level: -0.25 - 0.08 * k }, { at: hit + 0.04, dur: 0.25, level: 0 }]
  // 同一個音效（啵、咻、咚），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'blip' }, { at: at + 0.15, sfx: 'whoosh' }, { at: hit, sfx: 'bonk' }, { at: press + 0.12, sfx: 'plop' }, { at: back, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'poof' })
  if (k >= 2) cues.push({ at: press + 0.14, sfx: 'crack' })
  return { moves, fx, camera, lights, cues }
}

const P1 = 1.75, P2 = 3.8, P3 = 6.3
const b1 = bonk(P1, 0)
const b2 = bonk(P2, 1)
const b3 = bonk(P3, 2)
/** 每次樹枝彈回去的那一刻（筆畫從這裡飛出來） */
const back = (p: number) => p + 0.28 + HOLD + 0.3
/** 國字拼好、放大到正中央 */
const HOME = 8.0
/** 讓位、語詞 */
const PARK = 9.0
const WORD = 9.4
/** 回馬槍：終於摘到了，張嘴一咬——啵 */
const BITE = 10.15
const H4 = 10.3
const ASK = 11.0
const ANSWER = 13.7

/** 國字放大時樹縮到字的右邊（0.55 倍），大蘋果掛在樹冠正中間，果子在上、樹幹在下 */
const SIDE = { x: 137, k: 0.55 }
const SIDE_Y = 77 - 0.42 * TS * SIDE.k
const SIDE_APPLE = { x: SIDE.x, y: 77 - 0.66 * TS * SIDE.k }
const SIDE_TRUNK = { x: SIDE.x, y: 77 - 0.2 * TS * SIDE.k }
/** 國字在正中央時，田、木的中心（hanzi-writer 座標換算） */
const G = { tian: { x: 78, y: 29.5 }, mu: { x: 78.5, y: 56.5 } }
/** 語詞那一刻：他雙手把大蘋果舉在頭上 */
const XW = 42
const LIFT = { x: XW, y: TOP.stand - r(SC[3]) + 1 }
/** 讓位時大蘋果先掛回樹冠左邊（低一點，不擋上面的字） */
const CROWN = { x: TX - 13, y: 54 }
/** 回馬槍：蘋果放在他右邊地上 */
const GROUND_APPLE = { x: XW + 15, y: 77 - r(SC[3]) - 0.5 }
const BIGGEST = SC[3] * 1.55

const clip: Clip = {
  format: 2,
  char: '果',
  meta: { theme: '楊捷睿摘蘋果', cast: '楊捷睿＋大樹（結滿蘋果的樹）＋蘋果', gags: ['楊捷睿每次踮腳伸手要摘樹上的蘋果，手快碰到時蘋果就啵地自己長大一圈、重到樹枝彎下來壓在他頭上，一次比一次大（敲得跌坐、壓扁、大得像西瓜把他整個壓扁）；回馬槍是他終於摘到了、得意地張嘴一咬，蘋果又啵地長得比樹還大，把他壓得最扁'] },
  duration: 15,
  bg: { top: '#DDF1FF', bottom: '#F6FBEA', floor: '#A9CF7E', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: TX, y: TY, size: TS },
    // 姿勢圖朝左，翻過來面向右邊的樹
    { id: 'yang', emoji: 'hero:yang/walk', x: X0, y: B, size: S, hidden: true, flip: true },
    { id: 'apple', emoji: '🍎', x: hang(1).x, y: hang(1).y, size: AS, pivot: 'center' as const },
  ],
  moves: [
    // 楊捷睿走進來，抬頭指著字框：果！
    { at: 0, dur: 0.5, actor: 'yang', do: 'enter', from: { x: -20, y: B }, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: 0.75, dur: 0.4, actor: 'apple', do: 'tilt', amount: 12 },
    // 第 1 次：踮腳摘——啵、咚！被敲得跌坐
    ...b1.moves,
    { at: back(P1) + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/angry' },
    { at: back(P1) + 0.45, dur: 0.25, actor: 'yang', do: 'hop', amount: 2 },
    // 第 2 次：再踮腳摘——啵、咚！被壓扁
    ...b2.moves,
    // 第 3 次前停一拍：爬起來、盯著那顆越來越大的蘋果想一想，慢慢伸手……
    { at: back(P2) + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: back(P2) + 0.5, dur: 0.5, actor: 'apple', do: 'tilt', amount: -10 },
    ...b3.moves,
    // 拼好前：他從底下爬出來退到左邊
    { at: 7.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: 7.65, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: 26, y: B } },
    // 國字放大：樹縮到字的右邊、大蘋果跟著掛到樹冠正中間；果子和田、樹幹和木各亮一下
    { at: HOME - 0.05, dur: 0.4, actor: 'tree', do: 'moveTo', to: { x: SIDE.x, y: SIDE_Y }, arc: 6, ease: 'out' },
    { at: HOME - 0.05, dur: 0.4, actor: 'tree', do: 'scaleTo', amount: SIDE.k, ease: 'out' },
    { at: HOME - 0.05, dur: 0.4, actor: 'apple', do: 'moveTo', to: SIDE_APPLE, arc: 6, ease: 'out' },
    { at: HOME - 0.05, dur: 0.4, actor: 'apple', do: 'scaleTo', amount: 0.45, ease: 'out' },
    { at: HOME + 0.45, dur: 0.4, actor: 'apple', do: 'flash' },
    { at: HOME + 0.7, dur: 0.4, actor: 'tree', do: 'flash' },
    { at: HOME + 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 語詞：國字讓回上方，樹回到中間；啵——整棵樹結滿蘋果，大蘋果掉進他手裡（蘋果）
    { at: PARK, dur: 0.4, actor: 'tree', do: 'moveTo', to: { x: TX, y: TY }, arc: 6, ease: 'out' },
    { at: PARK, dur: 0.4, actor: 'tree', do: 'scaleTo', amount: 1 / SIDE.k, ease: 'out' },
    { at: PARK, dur: 0.4, actor: 'apple', do: 'moveTo', to: CROWN, arc: 6, ease: 'out' },
    { at: PARK, dur: 0.4, actor: 'apple', do: 'scaleTo', amount: 1 / 0.45, ease: 'out' },
    { at: PARK, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: XW, y: B } },
    { at: PARK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: WORD, actor: 'tree', do: 'swap', emoji: 'prop:apple-tree' },
    { at: WORD, dur: 0.3, actor: 'tree', do: 'squash', amount: -0.08 },
    { at: WORD + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: WORD + 0.05, dur: 0.18, actor: 'apple', do: 'moveTo', to: LIFT, ease: 'in' },
    { at: WORD + 0.23, dur: 0.25, actor: 'yang', do: 'squash', amount: 0.12 },
    // 回馬槍（第 4 次）：終於摘到了！放在地上、得意，張嘴一咬——
    { at: 9.82, dur: 0.2, actor: 'apple', do: 'moveTo', to: GROUND_APPLE, arc: 4 },
    { at: 9.82, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: 10.03, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: 10.03, dur: 0.12, actor: 'yang', do: 'moveTo', to: { x: XW + 3, y: B } },
    { at: BITE, dur: 0.15, actor: 'apple', do: 'shake', amount: 1.5 },
    // 啵！長得比樹還大，倒下來把他壓得最扁
    { at: H4, dur: 0.22, actor: 'apple', do: 'scaleTo', amount: 1.55, ease: 'out' },
    { at: H4, dur: 0.22, actor: 'apple', do: 'moveTo', to: { x: GROUND_APPLE.x + 4, y: 77 - r(BIGGEST) }, ease: 'out' },
    { at: H4, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H4 + 0.25, dur: 0.15, actor: 'apple', do: 'moveTo', to: { x: XW - 2, y: TOP.flat - r(BIGGEST) + 18 }, ease: 'in' },
    { at: H4 + 0.25, dur: 0.15, actor: 'apple', do: 'rotateTo', amount: -30, ease: 'in' },
    { at: H4 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: H4 + 0.4, dur: 0.3, actor: 'apple', do: 'squash', amount: 0.12 },
    { at: H4 + 0.4, dur: 0.4, actor: 'tree', do: 'shake', amount: 2 },
    // 問他：樹和蘋果縮不見；楊捷睿跳到左前方、變大，轉向觀眾
    { at: ASK, dur: 0.35, actor: 'apple', do: 'scaleTo', amount: 0.02, ease: 'in' },
    { at: ASK + 0.35, dur: 0.05, actor: 'apple', do: 'vanish' },
    { at: ASK, dur: 0.35, actor: 'tree', do: 'scaleTo', amount: 0.02, ease: 'in' },
    { at: ASK + 0.35, dur: 0.05, actor: 'tree', do: 'vanish' },
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: 32, y: B + 4 }, arc: 8 },
    { at: ASK + 0.05, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: 1.5 },
    { at: ASK + 0.35, actor: 'yang', do: 'flip' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.2, dur: 0.3, actor: 'yang', do: 'rotateTo', amount: 10 },
    { at: 12.7, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.2, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'yang', do: 'rotateTo', amount: -10 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.2, actor: 'yang', do: 'hop', amount: 8 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.15, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.15, dur: 0.13, actor: 'yang', do: 'moveTo', to: { x: -45, y: B + 4 }, ease: 'in' },
  ],
  builds: [
    // 樹先長出來：每次樹枝彈回去，樹幹就飛出木的一半（橫豎、撇捺）；最後那顆大蘋果飛出上面的田——樹上結了果子
    { at: back(P1) + 0.05, dur: 0.55, strokes: [4, 5], from: TRUNK, color: partColor('木') },
    { at: back(P2) + 0.05, dur: 0.55, strokes: [6, 7], from: TRUNK, color: partColor('木') },
    { at: back(P3) + 0.05, dur: 0.55, strokes: [0, 1, 2, 3], from: 'apple', color: partColor('田') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: ASK, dur: ANSWER + 0.28 - ASK, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：看到蘋果，流口水
    { at: 0.8, kind: 'pop', actor: 'apple', emoji: '❤️', dx: -6, dy: 2, dur: 0.5 },
    ...b1.fx,
    ...b2.fx,
    // 第 3 次前停一拍：盯著蘋果、冒汗
    { at: back(P2) + 0.4, kind: 'pop', actor: 'yang', emoji: '👀', dx: -3, dy: 3, dur: 0.6, scale: 1.5 },
    { at: back(P2) + 0.5, kind: 'sweat', actor: 'yang' },
    ...b3.fx,
    // 國字放大：果子對田、樹幹對木，各亮一下——長得一樣
    { at: HOME + 0.45, kind: 'burst', ...SIDE_APPLE, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    { at: HOME + 0.45, kind: 'burst', ...G.tian, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    { at: HOME + 0.7, kind: 'burst', ...SIDE_TRUNK, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    { at: HOME + 0.7, kind: 'burst', ...G.mu, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    // 蘋果：整棵樹結滿蘋果
    { at: WORD, kind: 'burst', x: TX, y: 52, emoji: '✨', n: 10, dur: 0.5, scale: 1.2 },
    // 回馬槍：咬一口、啵、咚
    { at: BITE, kind: 'pop', actor: 'yang', emoji: '😋', dx: -12, dy: 2, dur: 0.3 },
    { at: H4, kind: 'burst', x: GROUND_APPLE.x, y: GROUND_APPLE.y - 6, emoji: '✨', n: 8, dur: 0.4, scale: 1.4 },
    { at: H4 + 0.4, kind: 'burst', x: XW - 22, y: 58, n: 1, dur: 0.45, scale: 2.7 },
    { at: H4 + 0.4, kind: 'burst', x: XW, y: 70, emoji: '⭐', n: 8, dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.28 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：樹要整棵在畫面裡
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: 7.6, dur: 0.3, do: 'zoom', amount: 1 },
    { at: H4 + 0.4, dur: 0.45, do: 'punch', amount: 0.25, to: { x: XW, y: 60 } },
    { at: H4 + 0.4, dur: 0.4, do: 'shake', amount: 2.6 },
  ],
  lights: [
    ...b1.lights,
    ...b2.lights,
    ...b3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: H4 + 0.4, dur: 0.04, level: -0.5 },
    { at: H4 + 0.44, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '果' },
    ...b1.cues,
    ...b2.cues,
    ...b3.cues,
    { at: HOME + 0.1, say: '果' },
    { at: HOME + 0.45, sfx: 'blip' },
    { at: HOME + 0.7, sfx: 'blip' },
    { at: WORD, say: '蘋果' },
    { at: WORD + 0.05, sfx: 'poof' },
    { at: WORD + 0.3, sfx: 'plop' },
    { at: BITE, sfx: 'crack' },
    { at: H4, sfx: 'blip' },
    { at: H4 + 0.25, sfx: 'whoosh' },
    { at: H4 + 0.4, sfx: 'bonk' },
    { at: H4 + 0.44, sfx: 'poof' },
    { at: H4 + 0.48, sfx: 'crack' },
    { at: H4 + 0.52, sfx: 'boing' },
    { at: 11.2, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '果' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
