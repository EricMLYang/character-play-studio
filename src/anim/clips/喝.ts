import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 喝（v2）：大太陽底下，浣熊花生熱得吐舌頭、好渴——每次把吸管插進去「咕嚕咕嚕」一吸，水就一口氣被喝光，他的肚子「啵」地鼓大一圈，
// 可是還是好渴，換更大的：一杯水（張開喝水的嘴巴變成「口」）→ 一整桶水（曷的上半）→ 先停一拍，看著一整缸洗澡水和裡面的小鴨子⋯⋯
// 吸！連鴨子都被吸過來黏在嘴巴上（曷的下半）。他圓得像一顆球，一路滾到旁邊。
// 回馬槍：他圓滾滾的還是渴，最後一杯水「喝水」——吸一口，肚子裝不下了：「嗝！」水全部從吸管噴回去，他像洩了氣的氣球滿天亂飛，掉下來又變回瘦瘦的、還是好渴。
// 最後畫面暗下來只剩「喝」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「喝！」，然後退場只留字。
// 喝、喝、喝水、這是什麼字？、喝
const RS = 30 // 花生的 size（不擋字的前提下大一點）
const P = 77 - 0.42 * RS // 花生站在地上的 y
/** 每次都站在同一個地方喝（左邊，翻過來朝右） */
const RX = 50
/** 喝的東西每次都放在同一個地方（右邊） */
const DX = 104
/** 喝的東西（同一個角色）原始 size 是一杯水；水桶、浴缸用 scaleTo 放大（以底部為準） */
const CUP = 20
const DY = 77 - 0.42 * CUP
type Drink = { emoji: string; size: number; /** 吸管插進去的地方（從底部往上幾成） */ dip: number }
const DRINKS: Drink[] = [
  { emoji: 'prop:water', size: CUP, dip: 0.55 },
  { emoji: 'prop:bucket', size: 30, dip: 0.72 },
  { emoji: '🛁', size: 48, dip: 0.55 },
]
/** 肚子一次比一次圓：每喝一次整個人大一點（scaleTo）、再撐寬一點（stretchTo），都會累乘；寬 1.21 倍、高只多 4% */
const GROW = 1.12, WID = 1.08
/** 喝了 k 次以後的寬、高倍率 */
const SX = (k: number) => (GROW * WID) ** k
const SY = (k: number) => (GROW / WID) ** k
/** 嘴巴（吸管口）的位置：花生朝右；肚子撐寬、長大時（以腳底為準）嘴巴跟著往前、往上 */
const SZ = RS * 1.06 // 引擎放大後的實際 size（估）
const mouth = (k: number, x = RX) => ({ x: x + 0.2 * SZ * SX(k), y: P + 0.42 * SZ - 0.62 * SZ * SY(k) })
/** 吸管插進去的那一點 */
const dip = (d: Drink) => ({ x: DX - 2, y: DY + 0.42 * CUP - d.dip * d.size })
/** 被喝光以後傻眼停多久 */
const HOLD = 0.45
const DUCK = 13

/**
 * 「咕嚕咕嚕」：吸管插進去（一條紅色吸管從嘴巴拉到水裡）→ 鼓起臉頰一吸，水珠一顆一顆沿著吸管飛進嘴裡、杯子一邊抖一邊縮 →
 * 喝光了：東西「啵」地不見，他的肚子「咚」地鼓大一圈（鏡頭推近肚子＋震＋💥＋同一個音效）→ 傻眼看肚子，停 HOLD 秒 → 吐舌頭搧風：還是好渴。
 * k 是第幾次（越後面吸越久、水珠越多、💥 越大）。
 */
function sip(at: number, k: number) {
  const d = DRINKS[k]
  const suck = 0.5 + 0.12 * k
  const gone = at + suck
  const m = mouth(k)
  const moves: Move[] = [
    // 預備：眼睛發亮流口水
    { at: at - 0.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/drool' },
    { at: at - 0.35, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.2 },
    // 吸！鼓起臉頰
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/blow' },
    { at, actor: 'raccoon', do: 'shake', amount: 0.4 + 0.2 * k, dur: suck },
    { at, actor: 'drink', do: 'shake', amount: 0.6 + 0.4 * k, dur: suck },
    { at, actor: 'drink', do: 'scaleTo', amount: 0.55, dur: suck, ease: 'in' },
    // 喝光了：東西不見，肚子鼓大一圈
    { at: gone, actor: 'drink', do: 'vanish', dur: 0.08 },
    { at: gone, actor: 'raccoon', do: 'stretchTo', amount: WID, dur: 0.25, ease: 'back' },
    { at: gone, actor: 'raccoon', do: 'scaleTo', amount: GROW, dur: 0.25, ease: 'back' },
    { at: gone + 0.02, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 還是好渴
    { at: gone + HOLD, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hot' },
  ]
  const belly = { x: RX + 1, y: P + 2 }
  const fx: Fx[] = [
    // 吸管：從嘴巴拉到水裡（同一根紅吸管）
    { at: at - 0.05, kind: 'line', actor: 'raccoon', dx: m.x - RX, dy: m.y - P, to: dip(d), color: '#E53935', width: 1.4, dur: suck + 0.1 },
    // 水珠沿著吸管飛進嘴裡（吹氣反過來：從杯子吹向嘴巴）
    { at, kind: 'blow', x: dip(d).x, y: dip(d).y, to: m, emoji: '💧', n: 5 + 2 * k, dur: suck },
    // 肚子「咚」：💥 在肚子前面，一次比一次大
    { at: gone, kind: 'burst', x: belly.x + 10, y: belly.y - 4, n: 1, dur: 0.4, scale: 1.6 + 0.4 * k },
    { at: gone, kind: 'burst', x: DX - 2, y: DY - 4, emoji: '💦', n: 5 + 2 * k, dur: 0.4 },
    { at: gone + HOLD + 0.05, kind: 'sweat', actor: 'raccoon' },
  ]
  const camera: Camera[] = [
    { at: gone, dur: 0.45, do: 'punch', amount: 0.06 + 0.04 * k, to: belly },
    { at: gone, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效（咕嚕咕嚕＋啵），一次比一次多疊一個
  const cues: Cue[] = [{ at: at + 0.05, sfx: 'gulp' }, { at: at + 0.3, sfx: 'gulp' }, { at: gone, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: gone + 0.04, sfx: 'bubble' })
  if (k >= 2) cues.push({ at: gone + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, gone }
}

/**
 * 下一個喝的東西從天上掉下來（同一個 drink 角色：先搬到天上、換圖、放大到這一次的大小，再掉到同一個地方）
 */
function serve(at: number, k: number): Move[] {
  const d = DRINKS[k]
  return [
    { at, actor: 'drink', do: 'moveTo', to: { x: DX, y: -40 }, dur: 0.01 },
    { at, actor: 'drink', do: 'swap', emoji: d.emoji },
    { at, actor: 'drink', do: 'pop', dur: 0.02 },
    { at: at + 0.02, actor: 'drink', do: 'scaleTo', amount: d.size / CUP, dur: 0.01 },
    { at: at + 0.03, actor: 'drink', do: 'moveTo', to: { x: DX, y: DY }, dur: 0.3, ease: 'in' },
  ]
}

/** 喝的時刻 */
const S1 = 1.5, S2 = 3.65, S3 = 6.0
const s1 = sip(S1, 0)
const s2 = sip(S2, 1)
const s3 = sip(S3, 2)
/** 第 3 次喝光後，圓滾滾的他被肚子彈得滾到左邊 */
const ROLL = s3.gone + HOLD
const SIDE = 24
/** 字框填滿、國字到正中央 */
const HOME = ROLL + 0.5
const PARK = HOME + 1.0
/** 語詞那一刻：最後一杯水，他吸一口 */
const S4 = 9.25
/** 回馬槍：嗝！ */
const BURP = S4 + 0.5
const MID = 70

const clip: Clip = {
  format: 2,
  char: '喝',
  meta: { theme: '浣熊花生好熱好渴', cast: '浣熊花生＋一杯水（水桶、浴缸）＋小鴨子', gags: ['好渴的花生每次用吸管咕嚕咕嚕一吸，水就整個被喝光、他的肚子鼓大一圈，可是還是渴，換更大的（一杯水→一整桶→整缸洗澡水連小鴨子都吸過來黏在嘴上）；回馬槍是他圓滾滾的再喝最後一杯，肚子裝不下打了一個超大的嗝，水全部噴回去，他像洩氣的氣球滿天亂飛，掉下來又瘦回去、還是渴'] },
  duration: 15,
  bg: { top: '#FFD98A', bottom: '#FFF3D6', floor: '#E9C27D', scenery: 'desert' },
  actors: [
    // 喝的東西（一杯水 → 水桶 → 浴缸 → 一杯水）
    { id: 'drink', emoji: 'prop:water', x: DX, y: DY, size: CUP },
    // 小鴨子：坐在浴缸的水上
    { id: 'duck', emoji: '🦆', x: DX - 4, y: DY - 26, size: DUCK, hidden: true, pivot: 'center' },
    // 花生的圖朝左，翻過來朝右：面向右邊的水
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: RX, y: P, size: RS, hidden: true, flip: true },
  ],
  moves: [
    // 花生熱得走進來，吐舌頭搧風：好渴
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -20, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hot' },
    { at: 0.6, actor: 'drink', do: 'hop', amount: 2, dur: 0.25 },
    // 第 1 次：一杯水
    ...s1.moves,
    // 第 2 次：一整桶
    ...serve(S2 - 0.75, 1),
    ...s2.moves,
    // 第 3 次前停一拍：一整缸洗澡水掉下來，小鴨子坐在上面；他托著下巴看一看……鴨子發抖
    ...serve(5.0, 2),
    { at: 5.0, actor: 'duck', do: 'moveTo', to: { x: DX - 4, y: -66 }, dur: 0.01 },
    { at: 5.0, actor: 'duck', do: 'pop', dur: 0.02 },
    { at: 5.03, actor: 'duck', do: 'moveTo', to: { x: DX - 4, y: DY - 26 }, dur: 0.3, ease: 'in' },
    { at: 5.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: 5.4, actor: 'duck', do: 'shake', amount: 0.8, dur: 0.5 },
    ...s3.moves,
    // 連鴨子都被吸過來，啵地黏在嘴巴上
    { at: S3 + 0.25, actor: 'duck', do: 'moveTo', to: { x: mouth(2).x + 4, y: mouth(2).y }, dur: 0.3, ease: 'in' },
    { at: S3 + 0.25, actor: 'duck', do: 'spin', times: 1, dur: 0.3 },
    // 圓得像一顆球：被肚子彈得滾到左邊（國字要到正中央）
    { at: ROLL, actor: 'raccoon', do: 'moveTo', to: { x: SIDE, y: P }, dur: 0.4, ease: 'out' },
    { at: ROLL, actor: 'raccoon', do: 'rotateTo', amount: -360, dur: 0.4, pivot: 'center' },
    { at: ROLL, actor: 'duck', do: 'moveTo', to: { x: mouth(3, SIDE).x + 4, y: mouth(3, SIDE).y }, dur: 0.4, ease: 'out' },
    { at: ROLL, actor: 'duck', do: 'rotateTo', amount: -360, dur: 0.4 },
    { at: ROLL, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/full' },
    { at: HOME + 0.3, actor: 'duck', do: 'shake', amount: 1, dur: 0.6 },
    // 國字讓位：鴨子啵地拔下來、氣呼呼地走到右邊；他還是渴，滾回中間
    { at: PARK, actor: 'duck', do: 'moveTo', to: { x: 128, y: 77 - 0.42 * DUCK }, arc: 10, dur: 0.4, ease: 'out' },
    { at: PARK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hot' },
    { at: PARK + 0.1, actor: 'raccoon', do: 'moveTo', to: { x: MID, y: P }, dur: 0.4 },
    { at: PARK + 0.1, actor: 'raccoon', do: 'rotateTo', amount: 360, dur: 0.4, pivot: 'center' },
    // 語詞那一刻：最後一杯水掉在他面前，咕嚕——
    ...serve(S4 - 0.4, 0).map((m): Move => (m.to && m.to.x === DX ? { ...m, to: { x: MID + 26, y: m.to.y } } : m)),
    { at: S4 - 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/drool' },
    { at: S4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/blow' },
    { at: S4, actor: 'raccoon', do: 'shake', amount: 1, dur: 0.5 },
    // 回馬槍：肚子裝不下——嗝！水全部從吸管噴回去，他像洩氣的氣球滿天亂飛
    { at: BURP - 0.1, actor: 'raccoon', do: 'stretchTo', amount: 1.12, dur: 0.1 },
    { at: BURP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: BURP, actor: 'drink', do: 'moveTo', to: { x: 190, y: 20 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: BURP, actor: 'drink', do: 'spin', times: 2, dur: 0.4 },
    { at: BURP + 0.1, actor: 'raccoon', do: 'moveTo', to: { x: 128, y: 44 }, dur: 0.22, ease: 'linear' },
    { at: BURP + 0.32, actor: 'raccoon', do: 'moveTo', to: { x: 40, y: 48 }, dur: 0.25, ease: 'linear' },
    { at: BURP + 0.57, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: P }, dur: 0.2, ease: 'in' },
    { at: BURP + 0.1, actor: 'raccoon', do: 'rotateTo', amount: 720, dur: 0.67, pivot: 'center', ease: 'linear' },
    { at: BURP + 0.1, actor: 'raccoon', do: 'stretchTo', amount: 1 / (WID ** 3 * 1.12), dur: 0.67 },
    { at: BURP + 0.1, actor: 'raccoon', do: 'scaleTo', amount: 1 / GROW ** 3, dur: 0.67 },
    { at: BURP + 0.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 鴨子笑著走掉
    { at: BURP + 0.5, actor: 'duck', do: 'hop', amount: 4, dur: 0.3 },
    { at: 10.55, actor: 'duck', do: 'moveTo', to: { x: 190, y: 77 - 0.42 * DUCK }, dur: 0.28, ease: 'in' },
    // 問他：花生爬起來（瘦回來了，還是渴），變大、轉向觀眾
    { at: 10.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hot' },
    { at: 10.9, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25 },
    { at: 11.0, actor: 'raccoon', do: 'scaleTo', amount: 1.4, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 12.05, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.28 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.75, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：張開喝水的嘴巴（口）
    { at: s1.gone + 0.02, dur: 0.6, strokes: [0, 1, 2], from: 'raccoon', color: partColor('口') },
    // 第 2 次：被喝光的水桶裡飛出曷的上半（日）；第 3 次：浴缸裡飛出曷的下半
    { at: s2.gone + 0.02, dur: 0.6, strokes: [3, 4, 5, 6], from: { x: DX, y: DY - 6 }, color: partColor('曷') },
    { at: s3.gone + 0.02, dur: 0.65, strokes: [7, 8, 9, 10, 11], from: { x: DX, y: DY - 10 }, color: partColor('曷') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: 10.85, dur: 3.1, do: 'ask', keep: ['raccoon'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.9, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.5, kind: 'sweat', actor: 'raccoon' },
    ...s1.fx,
    ...s2.fx,
    // 第 3 次前停一拍：鴨子嚇得冒汗
    { at: 5.45, kind: 'sweat', actor: 'duck' },
    { at: 5.4, kind: 'pop', actor: 'raccoon', emoji: '👀', dx: 4, dur: 0.5, scale: 1.2 },
    ...s3.fx,
    { at: ROLL + 0.45, kind: 'dizzy', actor: 'raccoon', dur: 0.8 },
    // 最後一杯：吸管、水珠
    { at: S4 - 0.05, kind: 'line', actor: 'raccoon', dx: mouth(3).x - RX, dy: mouth(3).y - P, to: { x: MID + 24, y: DY + 0.42 * CUP - 0.55 * CUP }, color: '#E53935', width: 1.4, dur: 0.55 },
    { at: S4, kind: 'blow', x: MID + 24, y: DY + 0.42 * CUP - 0.55 * CUP, to: mouth(3, MID), emoji: '💧', n: 4, dur: 0.5 },
    // 嗝！水從嘴巴噴回去、一大團
    { at: BURP, kind: 'burst', x: MID + 12, y: P - 14, n: 1, dur: 0.45, scale: 2.8 },
    { at: BURP, kind: 'fountain', actor: 'raccoon', emoji: '💧', n: 12, dur: 1.0, scale: 1.4 },
    { at: BURP, kind: 'burst', x: MID + 6, y: P - 6, emoji: '💦', n: 10, dur: 0.6, scale: 1.3 },
    { at: BURP + 0.1, kind: 'zzz', actor: 'raccoon', emoji: '💨', dx: -6, dy: 8, dur: 0.6, scale: 1.4 },
    { at: BURP + 0.9, kind: 'dizzy', actor: 'raccoon', dur: 0.7 },
    { at: BURP + 0.4, kind: 'pop', actor: 'duck', emoji: '😆', dx: -6, dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    // 第 3 次：浴缸很大、鴨子要被吸過來，固定全景
    { at: 5.0, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s3.camera,
    { at: HOME - 0.3, dur: 0.3, do: 'zoom', amount: 1 },
    { at: BURP, dur: 0.45, do: 'punch', amount: 0.2, to: { x: MID + 6, y: P - 8 } },
    { at: BURP, dur: 0.4, do: 'shake', amount: 2.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: BURP, dur: 0.04, level: -0.4 },
    { at: BURP + 0.04, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.75, say: '喝' },
    ...s1.cues,
    { at: S2 - 0.45, sfx: 'plop' },
    ...s2.cues,
    { at: 5.3, sfx: 'splash' },
    ...s3.cues,
    { at: S3 + 0.55, sfx: 'tap' },
    { at: ROLL, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '喝' },
    { at: PARK, sfx: 'poof' },
    { at: S4 - 0.05, say: '喝水' },
    { at: BURP, sfx: 'hic' },
    { at: BURP + 0.04, sfx: 'splash' },
    { at: BURP + 0.1, sfx: 'deflate' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '喝' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
