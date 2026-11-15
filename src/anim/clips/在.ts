import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 在（v2）：躲貓貓。忍者小老鼠「咻」地一陣煙不見了，豬探長拿放大鏡很有自信地湊近一個地方仔細看——
// 小老鼠每次都從他意想不到的地方「咻」地冒出來、舉手「在這裡！」，把他嚇得跳起來，一次比一次高：
// 從他背後冒出來（扌：舉起來的那隻手）→ 從他頭上的帽子裡冒出來（丨：直直站起來）→ 先停一拍（他學乖了，猛然回頭看背後——沒人）
// 從他放大鏡前面的地上冒出來，土噴上去（土：人就在這塊地上），他嚇得飛上天、摔扁。
// 語詞：小老鼠在畫面正中間冒出來，豬探長終於指到他「在這裡」。
// 回馬槍：換豬探長躲，他得意地躲進水桶只露帽子——小老鼠從同一個水桶裡、他背後冒出來，他連水一起噴上天。
// 最後畫面暗下來只剩「在」，豬探長轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「在！」，然後退場只留字。
// 在、在、在這裡、這是什麼字？、在
const fy = (size: number) => 77 - 0.42 * size
const PIG_SIZE = 30
const MOU_SIZE = 28
const P = fy(PIG_SIZE) // 豬探長站在地上的 y
const M = fy(MOU_SIZE) // 小老鼠
const BUCKET = { x: 22, size: 28 }
const TREE = { x: 152, size: 46 }
/** 豬探長找水桶（左邊）、找大樹（右邊）時站的地方 */
const AT_BUCKET = 42
const AT_TREE = 117
/** 語詞那一刻：豬探長在左、小老鼠在正中間 */
const PIG_WORD = 52
/** 第 3 次被嚇飛以後摔在哪裡 */
const LAND = 34
const MOU_WORD = 86
/** 冒出來以後，豬探長傻眼停多久 */
const HOLD = 0.5

/**
 * 「在這裡！」：小老鼠先在別處一陣煙不見（咻），下一次直接在 (x, y) 冒出來、舉手（know），頭上一根 📍 插下來；
 * 豬探長同一刻傻眼跳起來，鏡頭推近冒出來的地方＋震＋同一個音效（一次比一次多疊一個）。
 * k 是第幾次（跳得越高、📍 越大），ride 是小老鼠站在豬探長頭上、跟著他一起跳。
 */
function found(at: number, k: number, x: number, y: number, ride = false, rise = 0) {
  const jump = [5, 8, 15, 20][k]
  const dur = [0.35, 0.4, 0.55, 0.6][k]
  const moves: Move[] = [
    { at: at - 0.06, actor: 'mouse', do: 'moveTo', to: { x, y: y + rise }, dur: 0.01 },
    // 從地底下、水桶裡冒出來：先藏低一點，咻地升上來
    ...(rise ? [{ at, actor: 'mouse', do: 'moveTo', to: { x, y }, dur: 0.15, ease: 'out' } as Move] : []),
    { at: at - 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/know' },
    { at, actor: 'mouse', do: 'pop', dur: 0.12 },
    { at, actor: 'mouse', do: 'hop', amount: ride ? jump : 3, dur: ride ? dur : 0.25 },
    // 豬探長嚇得跳起來
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 第 4 次他在水桶裡：整個人從水桶彈出來（劇本另外寫），不用 hop
    ...(k < 3 ? [{ at, actor: 'pig', do: 'hop', amount: jump, dur } as Move] : []),
  ]
  const fx: Fx[] = [
    { at, kind: 'pop', actor: 'mouse', emoji: '📍', dx: ride ? 13 : k === 2 ? -7 : 3, dy: ride ? 14 : 1, dur: HOLD + 0.1, scale: 1.8 + 0.3 * k },
    { at, kind: 'burst', actor: 'mouse', dy: 6, emoji: '⭐', n: 5 + 2 * k, dur: 0.4 },
    { at: at + 0.02, kind: 'pop', actor: 'pig', emoji: '❗', dx: k === 1 ? -9 : 0, dur: 0.45, scale: 1.2 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x, y: 50 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  const cues: Cue[] = [{ at: at - 0.08, sfx: 'whoosh' }, { at, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/** 忍者一陣煙不見：咻 */
function poof(at: number): { moves: Move[]; fx: Fx[]; cues: Cue[] } {
  return {
    moves: [{ at, actor: 'mouse', do: 'vanish', dur: 0.1 }],
    fx: [{ at, kind: 'puff', actor: 'mouse', dur: 0.4, scale: 1.4 }],
    cues: [{ at, sfx: 'poof' }],
  }
}

const H1 = 1.5, H2 = 3.3, H3 = 5.6, H4 = 9.6
/** 小老鼠站在豬探長頭上（帽子裡冒出來） */
const ON_HEAD = M - 0.86 * PIG_SIZE
const f1 = found(H1, 0, AT_BUCKET + 19, M)
const f2 = found(H2, 1, AT_TREE - 1, ON_HEAD, true)
const f3 = found(H3, 2, AT_TREE + 16, M, false, 14)
// 回馬槍：從水桶裡、豬探長背後冒出來（下半身被水桶蓋住）
const f4 = found(H4, 3, BUCKET.x + 9, M - 9, false, 12)
const p0 = poof(0.85)
const p1 = poof(H1 + 0.75)
const p2 = poof(H2 + 0.7)
const p3 = poof(7.75)
const p4 = poof(8.7)
const p5 = poof(10.3)
/** 字框填滿、國字到正中央（第二聲「在」） */
const HOME = 6.4
const PARK = 7.4
const WORD = 8.0

const clip: Clip = {
  format: 2,
  char: '在',
  meta: { theme: '忍者小老鼠跟豬探長躲貓貓', cast: '豬探長＋小老鼠＋水桶＋大樹', gags: ['躲貓貓：豬探長拿放大鏡很有自信地湊近一個地方找，小老鼠每次都從他意想不到的地方咻地冒出來舉手「在這裡！」把他嚇得跳起來（背後→帽子上→放大鏡前面的地上），一次比一次高；回馬槍換豬探長躲進水桶，小老鼠從同一個水桶裡、他背後冒出來'] },
  duration: 15,
  bg: { top: '#DFF3E4', bottom: '#F4FBF5', floor: '#B9D98C', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: TREE.x, y: fy(TREE.size), size: TREE.size },
    // 新的豬探長圖朝左，翻過來朝右：面向正中間的小老鼠
    { id: 'pig', emoji: 'hero:pig/think', x: AT_BUCKET + 4, y: P, size: PIG_SIZE, hidden: true, flip: true },
    { id: 'mouse', emoji: 'hero:mouse/stance', x: 84, y: M, size: MOU_SIZE },
    // 水桶畫在兩個人後面＝蓋在他們身上（躲進去的人只露上半身）
    { id: 'bucket', emoji: 'prop:bucket', x: BUCKET.x, y: fy(BUCKET.size), size: BUCKET.size },
  ],
  moves: [
    // 開場：小老鼠擺忍者架式，豬探長拿放大鏡走進來——小老鼠偷笑，咻！一陣煙不見了
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    ...p0.moves,
    // 第 1 次：豬探長轉過去湊近水桶看……小老鼠從他背後冒出來
    { at: 0.95, actor: 'pig', do: 'flip' },
    { at: 0.95, actor: 'pig', do: 'moveTo', to: { x: AT_BUCKET, y: P }, dur: 0.2 },
    { at: 1.1, actor: 'pig', do: 'tilt', amount: -10, dur: 0.35 },
    ...f1.moves,
    { at: H1 + 0.1, actor: 'pig', do: 'flip' },
    { at: H1 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    ...p1.moves,
    // 第 2 次：走去大樹那邊找……小老鼠從他的帽子裡冒出來
    { at: 2.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.3, actor: 'pig', do: 'moveTo', to: { x: AT_TREE, y: P }, dur: 0.55 },
    { at: 2.9, actor: 'pig', do: 'tilt', amount: 10, dur: 0.35 },
    ...f2.moves,
    { at: H2 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    ...p2.moves,
    // 第 3 次前停一拍：他學乖了——拿放大鏡看樹，猛然回頭看背後：沒人
    { at: 4.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 4.2, actor: 'pig', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 4.6, actor: 'pig', do: 'flip' },
    { at: 4.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    { at: 4.6, actor: 'pig', do: 'hop', amount: 2.5, dur: 0.2 },
    { at: 5.1, actor: 'pig', do: 'flip' },
    { at: 5.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 5.2, actor: 'pig', do: 'tilt', amount: 12, dur: 0.3 },
    // 小老鼠從放大鏡前面的地上冒出來，土噴上去；豬探長飛上天、轉一圈、摔扁
    ...f3.moves,
    { at: H3, actor: 'pig', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
    // 嚇得往後飛過整個畫面，摔在水桶旁邊（國字到正中央時不擋字）
    { at: H3, actor: 'pig', do: 'moveTo', to: { x: LAND, y: P }, dur: 0.55, ease: 'out' },
    { at: H3 + 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: H3 + 0.55, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.35 },
    // 國字到正中央：小老鼠在樹下蹲一下、又冒起來指著字（第二聲「在」）
    { at: HOME - 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/peek' },
    { at: HOME + 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: HOME + 0.15, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
    // 語詞那一刻：豬探長爬起來走到左邊；小老鼠咻地在正中間冒出來，豬探長終於指到他——在這裡！
    { at: PARK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: PARK, actor: 'pig', do: 'flip' },
    { at: PARK + 0.05, actor: 'pig', do: 'moveTo', to: { x: PIG_WORD, y: P }, dur: 0.45 },
    ...p3.moves,
    { at: WORD - 0.12, actor: 'pig', do: 'flip' },
    { at: WORD - 0.06, actor: 'mouse', do: 'moveTo', to: { x: MOU_WORD, y: M }, dur: 0.01 },
    { at: WORD - 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/wave' },
    { at: WORD, actor: 'mouse', do: 'pop', dur: 0.12 },
    { at: WORD, actor: 'mouse', do: 'scaleTo', amount: 1.3, dur: 0.2, ease: 'back' },
    { at: WORD, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: WORD, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍（第 4 次）：換我躲！豬探長得意地跳進水桶只露帽子……小老鼠從同一個水桶裡、他背後冒出來
    { at: 8.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    ...p4.moves,
    { at: 8.85, actor: 'pig', do: 'flip' },
    { at: 8.85, actor: 'pig', do: 'moveTo', to: { x: BUCKET.x - 2, y: P - 6 }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 9.2, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.3 },
    ...f4.moves,
    // 連人帶水從水桶裡彈上天，摔在水桶旁邊
    { at: H4, actor: 'pig', do: 'moveTo', to: { x: 30, y: P - 28 }, dur: 0.3, ease: 'out' },
    { at: H4, actor: 'pig', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    { at: H4 + 0.3, actor: 'pig', do: 'moveTo', to: { x: 52, y: P }, dur: 0.3, ease: 'in' },
    { at: H4 + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: H4 + 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    ...p5.moves,
    // 忍者的煙把水桶、大樹一起帶走（問他的時候畫面只留豬探長）
    { at: 10.3, actor: 'bucket', do: 'vanish', dur: 0.15 },
    { at: 10.3, actor: 'tree', do: 'vanish', dur: 0.15 },
    // 問他：豬探長走到左前方、變大，轉向觀眾
    { at: 10.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.45, actor: 'pig', do: 'flip' },
    { at: 10.45, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.35 },
    { at: 10.5, actor: 'pig', do: 'scaleTo', amount: 1.25, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 11.95, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字——在！
    { at: 13.45, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.45, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.72, actor: 'pig', do: 'flip' },
    { at: 13.75, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 舉起來的那隻手（𠂇）→ 直直站起來（丨）→ 從地上噴起來的土（土：人就在這塊地上）
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1], from: 'mouse', color: partColor('𠂇') },
    { at: H2 + 0.05, dur: 0.5, strokes: [2], from: 'mouse', color: partColor('丨') },
    { at: H3 + 0.05, dur: 0.55, strokes: [3, 4, 5], from: { x: AT_TREE + 16, y: 72 }, color: partColor('土') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 10.4, dur: 3.5, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.45, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...p0.fx,
    // 小老鼠呢？
    { at: 1.0, kind: 'bubble', actor: 'pig', emoji: '🐭', dur: 0.45, scale: 1.5, dx: 4 },
    ...f1.fx,
    ...p1.fx,
    { at: H1 + 0.6, kind: 'sweat', actor: 'pig' },
    ...f2.fx,
    ...p2.fx,
    { at: H2 + 0.6, kind: 'sweat', actor: 'pig' },
    // 第 3 次前停一拍：回頭看——沒人
    { at: 4.65, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.45, scale: 1.3 },
    ...f3.fx,
    // 土從地上噴起來
    { at: H3, kind: 'puff', actor: 'mouse', dx: -5, dur: 0.5, scale: 1.6 },
    { at: H3 + 0.55, kind: 'dizzy', actor: 'pig', dur: 0.5 },
    { at: HOME + 0.15, kind: 'pop', actor: 'mouse', emoji: '📍', dx: -4, dur: 0.6, scale: 1.6 },
    ...p3.fx,
    { at: WORD, kind: 'pop', actor: 'mouse', emoji: '📍', dx: 4, dur: 0.7, scale: 2.2 },
    { at: WORD, kind: 'burst', actor: 'mouse', dy: 6, emoji: '⭐', n: 8, dur: 0.45 },
    ...p4.fx,
    ...f4.fx,
    // 水桶裡的水噴上天
    { at: H4, kind: 'fountain', actor: 'bucket', dur: 0.6, scale: 1.4 },
    ...p5.fx,
    { at: 10.3, kind: 'puff', actor: 'bucket', dur: 0.4, scale: 1.4 },
    { at: 10.3, kind: 'puff', x: 138, y: 52, dur: 0.4, scale: 1.3 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 每一次都要看得到兩邊（找的人、冒出來的地方），自己固定全景
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...f1.camera,
    ...f2.camera,
    ...f3.camera,
    { at: 6.25, dur: 0.15, do: 'zoom', amount: 1 },
    ...f4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...p0.cues,
    { at: H1, say: '在' },
    ...f1.cues,
    ...p1.cues,
    ...f2.cues,
    ...p2.cues,
    { at: 4.6, sfx: 'whoosh' },
    ...f3.cues,
    { at: H3 + 0.55, sfx: 'plop' },
    { at: HOME + 0.15, say: '在' },
    ...p3.cues,
    { at: WORD, say: '在這裡' },
    ...p4.cues,
    { at: 9.2, sfx: 'splash' },
    ...f4.cues,
    { at: H4 + 0.1, sfx: 'splash' },
    ...p5.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '在' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
