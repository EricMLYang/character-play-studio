import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 午（v2）：中午到了！大太陽每次從右邊爬上來、爬到楊捷睿頭頂正上方——「噹！」十二點（🕛），影子縮到腳底下最短。
// 他肚子「咕嚕」一叫，拿出點心張大嘴要吃——太陽一曬「滋——」，點心在他手上融成一灘、掉到地上冒煙蒸發，他傻眼。
// 太陽一次比一次大、點心一次比一次大：冰淇淋（丿）→ 一大塊起司（一）→ 先停一拍：他托著下巴、擦汗，還是拿出一整個大蛋糕，
// 融得最慘、濺得到處都是，他一屁股跌坐（十）。每融一次，筆畫就從融掉的那一灘飛進字框。
// 語詞那一刻他把便當高高舉在正中間：「午餐」。
// 回馬槍（第四次）：他學乖了，太陽還沒爬上來就一口把便當吞光、閉眼得意——「噹！」最大的太陽一曬，這次融掉的是他自己，攤成一片。
// 最後畫面暗下來只剩「午」，他站起來問「這是什麼字？」，手放耳邊等他回答，再指著字說「午！」，然後退場只留字。
// 刻意不跟「早」（公雞叫、太陽蹦上來把人震醒）、「今」（太陽從地底彈出來轟人）、「冰」「冷」（冰塊）撞：
// 這支只演「太陽爬到頭頂正上方＝中午，一曬就融掉」。
// 午、午、午餐、這是什麼字？、午

/** 楊捷睿（圖朝左：面向左邊手上的點心） */
const YS = 36
const YY = 77 - 0.42 * YS
/** 每次都站在同一個地方，太陽就停在他頭頂正上方 */
const STAND: Vec = { x: 100, y: YY }
/** 太陽（🌞）：底子 size 寫最大的那次，前幾次縮小 */
const SS = 42
/** 正中午：太陽停在他頭頂正上方（每次都同一個位置） */
const ZEN: Vec = { x: STAND.x, y: 25 }
/** 太陽從右邊畫面外爬上來、下山也回到這裡 */
const RISE: Vec = { x: 182, y: 60 }
/** 太陽一次比一次大（第 4 次最大） */
const SUN_K = [0.76, 0.85, 0.93, 1.0]
/** 點心（同一個角色換圖）：底子 size 寫最大的蛋糕 */
const FS = 30
/** 點心拿在手上（底部在手的高度） */
const HAND: Vec = { x: 84, y: 62 - 0.42 * FS }
/** 融掉以後攤在地上的那一灘 */
const PUDDLE: Vec = { x: 82, y: 76.5 - 0.42 * FS }
/** 三次的點心與大小（越來越大） */
const FOOD = ['🍦', '🧀', 'prop:cake']
const FOOD_K = [0.7, 0.85, 1.0]
/** 影子在地上的高度（從腳底拉出去的一條） */
const SHADOW_Y = 75.2
/** 影子：太陽在右邊低低的時候拖得很長（往左），爬到頭頂正上方就縮到腳底下 */
const SHADOW_LONG = 50

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 太陽從右邊畫面外爬到頭頂正上方（at 是「噹」那一刻），影子跟著縮短；
 * 「噹！」太陽一壓一彈、旁邊冒一個 🕛、同一個音效。prev 是上一次的大小（太陽在畫面外先換好大小）。
 */
function noon(at: number, k: number, prev: number): Gag {
  const up = 0.6
  const moves: Move[] = [
    { at: at - up - 0.05, actor: 'sun', do: 'moveTo', to: RISE, dur: 0.01 },
    { at: at - up - 0.05, actor: 'sun', do: 'scaleTo', amount: SUN_K[k] / prev, dur: 0.01 },
    { at: at - up, actor: 'sun', do: 'moveTo', to: ZEN, arc: 12, dur: up, ease: 'out' },
    { at: at - up - 0.05, actor: 'shade', do: 'moveTo', to: { x: STAND.x - SHADOW_LONG, y: SHADOW_Y }, dur: 0.01 },
    { at: at - up, actor: 'shade', do: 'moveTo', to: { x: STAND.x - 1, y: SHADOW_Y }, dur: up, ease: 'linear' },
    // 噹！
    { at, actor: 'sun', do: 'squash', amount: 0.22, dur: 0.25 },
    { at, actor: 'sun', do: 'flash', dur: 0.35 },
  ]
  const fx: Fx[] = [
    // 影子從腳底拉出去，太陽越高越短
    { at: at - up, dur: up + 0.05, kind: 'line', actor: 'yang', dy: SHADOW_Y - YY, target: 'shade', color: '#6E5434', width: 3.2 },
    // 十二點的鐘冒在太陽右邊
    { at, dur: 0.75, kind: 'pop', actor: 'sun', emoji: '🕛', dx: 0.5 * SS * SUN_K[k] + 7, dy: 22, scale: 2.2 },
  ]
  const cues: Cue[] = [{ at: at - up, sfx: 'whoosh' }, { at, sfx: 'clink' }]
  return { moves, fx, camera: [], cues }
}

/**
 * 同一個笑點「滋——」：「噹」之後肚子咕嚕叫 → 拿出點心、張大嘴要吃 → 太陽一曬（光往下照），點心在手上融成一灘、
 * 掉到地上（鏡頭推一下＋震＋同一個音效，一次多疊一個音），他傻眼停住 → 那一灘冒煙蒸發、太陽下山。
 * at 是「噹」那一刻，k 是第幾次（0～2）。回傳融掉那一刻 melt 與太陽下山 down。
 */
function melt(at: number, k: number): Gag & { melt: number; down: number } {
  const show = at + 0.22
  const bite = at + 0.42
  const m = at + 0.56
  const land = m + 0.28
  const gone = land + 0.22
  const down = gone
  const moves: Move[] = [
    // 咕嚕：摸肚子
    { at: at + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hungry' },
    { at: at + 0.1, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.2 },
    // 拿出點心：先換圖、縮到這次的大小，再彈出來
    { at: show - 0.01, actor: 'food', do: 'swap', emoji: FOOD[k] },
    { at: show - 0.01, actor: 'food', do: 'moveTo', to: HAND, dur: 0.01 },
    { at: show, actor: 'food', do: 'pop', dur: 0.2 },
    { at: show, actor: 'food', do: 'scaleTo', amount: FOOD_K[k], dur: 0.01 },
    { at: show, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    // 張大嘴要吃：點心往嘴邊湊
    { at: bite, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: bite, actor: 'food', do: 'moveTo', to: { x: HAND.x + 3, y: HAND.y - 3 }, dur: 0.14 },
    // 滋——！太陽一壓、點心融成一灘掉下去
    { at: m - 0.1, actor: 'sun', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: m - 0.1, actor: 'sun', do: 'flash', dur: 0.4 },
    { at: m, actor: 'food', do: 'stretchTo', amount: 1.5 + 0.2 * k, dur: land - m, ease: 'in' },
    { at: m, actor: 'food', do: 'moveTo', to: { x: PUDDLE.x - 2 * k, y: PUDDLE.y }, dur: land - m, ease: 'in' },
    { at: m, actor: 'food', do: 'tint', filter: 'saturate(1.3) brightness(1.05)' },
    { at: m, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: m, actor: 'yang', do: 'squash', amount: -0.12 - 0.04 * k, dur: 0.16 },
    { at: land, actor: 'food', do: 'squash', amount: 0.3, dur: 0.18 },
    // 那一灘被曬得冒煙、蒸發掉
    { at: gone, actor: 'food', do: 'vanish', dur: 0.2 },
    { at: gone + 0.21, actor: 'food', do: 'tint', filter: '' },
    // 太陽下山（回到右邊畫面外）
    { at: down, actor: 'sun', do: 'moveTo', to: RISE, dur: 0.22, ease: 'in' },
  ]
  if (k === 2) moves.push(
    // 第 3 次濺得最慘：一屁股跌坐
    { at: land, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
  )
  const fx: Fx[] = [
    // 太陽往下照的一道光
    { at: m - 0.12, dur: 0.5, kind: 'beam', actor: 'sun', n: 30 + 8 * k },
    // 融掉滴下來
    { at: m + 0.04, dur: 0.35, kind: 'rain', actor: 'food', dy: -4, n: 4 + 2 * k },
    // 掉到地上濺起來，一次比一次大
    { at: land, dur: 0.6, kind: 'fountain', actor: 'food', dy: 6, n: 6 + 3 * k },
    // 冒煙蒸發
    { at: gone - 0.05, kind: 'burst', actor: 'food', dy: 2, emoji: '💨', n: 1, dur: 0.45, scale: 1.2 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at: m, dur: 0.35, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: 90, y: 50 } },
    { at: land, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k },
  ]
  // 同一個音效（滋＋啪），一次比一次多疊一個
  const cues: Cue[] = [
    { at: at + 0.1, sfx: 'rumble' },
    { at: m, sfx: 'deflate' },
    { at: land, sfx: 'splash' },
  ]
  if (k >= 1) cues.push({ at: land + 0.04, sfx: 'plop' })
  if (k >= 2) cues.push({ at: land + 0.08, sfx: 'bonk' })
  cues.push({ at: gone, sfx: 'poof' })
  return { moves, fx, camera, cues, melt: m, down }
}

// ---- 時間表 ----
/** 三次「噹」 */
const D1 = 1.6
const n1 = noon(D1, 0, 1)
const m1 = melt(D1, 0)
const D2 = D1 + 1.95
const n2 = noon(D2, 1, SUN_K[0])
const m2 = melt(D2, 1)
/** 第 3 次前停一拍：托著下巴看右邊（太陽要來的地方）、擦汗 */
const PONDER = m2.down + 0.02
const D3 = PONDER + 0.95
const n3 = noon(D3, 2, SUN_K[1])
const m3 = melt(D3, 2)
/** 太陽下山、他讓到右邊，字框填滿、國字到正中央 */
const SIDE = m3.melt + 0.4
const HOME = m3.down + 0.25
const PARK = HOME + 0.95
/** 語詞：走回原位，把便當高高舉起來——午餐 */
const WORD = PARK + 0.3
/** 回馬槍（第 4 次）：太陽爬上來之前一口吞光便當，閉眼得意 */
const GULP = WORD + 0.65
const D4 = GULP + 0.75
const n4 = noon(D4, 3, SUN_K[2])
const M4 = D4 + 0.3
/** 問他 */
const ASK = M4 + 0.75
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 126, y: YY + 4 }
/** 國字回中央那一秒他讓到右邊（國字右緣約 x 113） */
const ASIDE: Vec = { x: 140, y: YY }
/** 字框：左上角（太陽在右上方、背後是素色的天空） */
const FRAME: Vec = { x: 33, y: 22 }
const FRAME_K = 0.5

const builds: Build[] = [
  // 冰淇淋融掉：丿
  { at: m1.melt + 0.1, dur: 0.5, strokes: [0], from: 'food', color: partColor('丿') },
  // 起司融掉：上面那一短橫
  { at: m2.melt + 0.1, dur: 0.5, strokes: [1], from: 'food', color: partColor('一') },
  // 大蛋糕融掉：十（長橫＋中間一豎）
  { at: m3.melt + 0.1, dur: 0.5, strokes: [2, 3], from: 'food', color: partColor('十') },
]

const clip: Clip = {
  format: 2,
  char: '午',
  meta: { theme: '中午的大太陽一曬就融掉', cast: '楊捷睿＋大太陽＋點心（冰淇淋、起司、蛋糕、便當）', gags: ['大太陽每次爬到楊捷睿頭頂正上方「噹！」中午到了，他肚子咕嚕叫、拿出點心張大嘴要吃，太陽一曬「滋——」點心就在手上融成一灘掉到地上，太陽一次比一次大、點心一次比一次大（冰淇淋→一大塊起司→停一拍擦汗，還是拿出整個大蛋糕，融得濺滿地、他跌坐）；回馬槍是他學乖了，太陽還沒爬上來就一口吞光便當、閉眼得意，「噹！」最大的太陽一曬，這次融掉的是他自己，攤成一片'] },
  duration: 15,
  bg: { top: '#7CC8F8', bottom: '#FFF0C8', floor: '#EBC78A', scenery: 'desert' },
  actors: [
    // 影子的另一端（看不見的錨點）
    { id: 'shade', emoji: '⭐', x: STAND.x, y: SHADOW_Y, size: 4, hidden: true },
    { id: 'sun', emoji: '🌞', x: RISE.x, y: RISE.y, size: SS, float: true },
    { id: 'food', emoji: FOOD[0], x: HAND.x, y: HAND.y, size: FS, hidden: true },
    // 開場從右邊走進來
    { id: 'yang', emoji: 'hero:yang/walk', x: STAND.x, y: STAND.y, size: YS },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'scaleTo', amount: SUN_K[0], dur: 0.01 },
    { at: 0, actor: 'yang', do: 'enter', from: { x: 185, y: YY }, dur: 0.6 },
    // 看到字框：午！（指著左上）
    { at: 0.62, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 第 1 次
    ...n1.moves,
    ...m1.moves,
    // 第 2 次
    { at: D2 - 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...n2.moves,
    ...m2.moves,
    // 第 3 次前停一拍：托著下巴、看右邊（太陽要來的地方）擦汗
    { at: PONDER, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: PONDER + 0.1, actor: 'yang', do: 'tilt', amount: 8, dur: 0.4 },
    { at: PONDER + 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/hot' },
    ...n3.moves,
    ...m3.moves,
    // 國字回中央：他爬起來讓到右邊
    { at: SIDE, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: SIDE, actor: 'yang', do: 'flip' },
    { at: SIDE, actor: 'yang', do: 'moveTo', to: ASIDE, dur: 0.35 },
    { at: SIDE + 0.37, actor: 'yang', do: 'flip' },
    { at: SIDE + 0.37, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 國字讓位：走回原位
    { at: PARK, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK, actor: 'yang', do: 'moveTo', to: STAND, dur: 0.4 },
    // 語詞：把便當高高舉起來——午餐
    { at: WORD - 0.01, actor: 'food', do: 'swap', emoji: '🍱' },
    { at: WORD - 0.01, actor: 'food', do: 'moveTo', to: { x: STAND.x - 4, y: 44 - 0.42 * FS }, dur: 0.01 },
    { at: WORD, actor: 'food', do: 'pop', dur: 0.25 },
    { at: WORD, actor: 'food', do: 'scaleTo', amount: 0.95, dur: 0.01 },
    { at: WORD, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: WORD, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
    // 回馬槍：太陽還沒來，一口吞光便當
    { at: GULP, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: GULP, actor: 'food', do: 'moveTo', to: { x: STAND.x - 8, y: 50 - 0.42 * FS }, dur: 0.2 },
    { at: GULP + 0.12, actor: 'food', do: 'vanish', dur: 0.2 },
    { at: GULP + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: GULP + 0.35, actor: 'yang', do: 'hop', amount: 2, dur: 0.25 },
    ...n4.moves,
    // 噹！睜開眼——滋——！這次融掉的是他自己
    { at: D4 + 0.08, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: M4 - 0.1, actor: 'sun', do: 'squash', amount: -0.18, dur: 0.2 },
    { at: M4 - 0.1, actor: 'sun', do: 'flash', dur: 0.4 },
    { at: M4, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: M4, actor: 'yang', do: 'stretchTo', amount: 1.35, dur: 0.3, ease: 'out' },
    { at: M4 + 0.4, actor: 'sun', do: 'moveTo', to: RISE, dur: 0.28, ease: 'in' },
    // 問他：站起來（不扁了）、變大
    { at: ASK + 0.2, actor: 'yang', do: 'stretchTo', amount: 1 / 1.35, dur: 0.25 },
    { at: ASK + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.2, actor: 'yang', do: 'moveTo', to: ASK_AT, dur: 0.3 },
    { at: ASK + 0.2, actor: 'yang', do: 'scaleTo', amount: 1.25, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK_SAY + 1.0, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.27, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'yang', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框放在左上角
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的他
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['yang'], to: { x: 64, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...n1.fx,
    ...m1.fx,
    ...n2.fx,
    ...m2.fx,
    { at: PONDER + 0.1, kind: 'sweat', actor: 'yang', dx: -8 },
    ...n3.fx,
    ...m3.fx,
    // 語詞：便當亮晶晶
    { at: WORD, kind: 'burst', x: STAND.x - 4, y: 34, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
    ...n4.fx,
    // 回馬槍：最大的一道光，他融成一片
    { at: M4 - 0.12, dur: 0.6, kind: 'beam', actor: 'sun', n: 56 },
    { at: M4 + 0.05, dur: 0.6, kind: 'fountain', actor: 'yang', dy: 14, n: 12 },
    { at: M4 + 0.3, kind: 'sweat', actor: 'yang', dx: -10, dy: 12 },
    { at: ANSWER, kind: 'burst', x: 64, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把頭頂的太陽切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...m1.camera,
    ...m2.camera,
    ...m3.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: 95, y: 45 } },
    { at: M4, dur: 0.45, do: 'punch', amount: 0.08, to: { x: 95, y: 55 } },
    { at: M4, dur: 0.4, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '午' },
    ...n1.cues,
    ...m1.cues,
    ...n2.cues,
    ...m2.cues,
    ...n3.cues,
    ...m3.cues,
    { at: HOME + 0.2, say: '午' },
    { at: WORD, say: '午餐' },
    { at: GULP, sfx: 'gulp' },
    { at: GULP + 0.2, sfx: 'gulp' },
    ...n4.cues,
    { at: M4, sfx: 'deflate' },
    { at: M4 + 0.04, sfx: 'splash' },
    { at: M4 + 0.08, sfx: 'plop' },
    { at: M4 + 0.12, sfx: 'bonk' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '午' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
