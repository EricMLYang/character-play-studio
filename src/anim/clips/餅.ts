import type { Camera, Clip, Cue, Ease, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 餅（v2）：狗狗警長當廚師煎餅。平底鍋裡一張金黃的蔥油餅滋滋響、冒煙，他蹲低、鍋子往下一沉，「嘿！」手一甩把餅拋起來翻面——
// 餅轉著圈飛上去，他舉著鍋子、眼睛跟著往上看……餅飛太高，沒掉回鍋子裡，「啪」地落在別的地方，他傻眼。
// 同一個動作，一次比一次高、落點一次比一次離譜：飛過頭頂，蓋在他自己臉上（飠從餅上飛出來）→
// 飛到樹頂那麼高，掛在旁邊的樹上晃，滑下來他伸鍋子接回去（并的上半）→ 先停一拍：他擦汗、退後、助跑、整個人跳起來甩——
// 餅「咻」地飛出畫面頂，變成一顆小星星（并的下半）。他舉著鍋子等、等……沒掉下來，怕它砸下來，退到旁邊抱著自己發抖。
// 語詞那一刻他放棄了，重新煎一張新的，躺在鍋裡冒煙：「煎餅」。回馬槍（第四次）：他閉眼得意、乖乖輕輕顛一下——
// 這時飛走的那一張「咻——啪！」從天上掉下來，穩穩疊在新的那張上面，變成雙層，他嚇得跳起來，再開心地舉手。
// 最後畫面暗下來只剩「餅」，警長問「這是什麼字？」，手放耳邊等他回答，再指著字說「餅！」，然後退場只留字。
// 刻意不跟「飯」（餵飯不張嘴）、「丟」（丟出去狗撿回來）、「接」（接住越疊越高）、「頭」（東西砸頭腫包）撞：這支只演「甩鍋→餅飛上去→沒掉回鍋裡」。
// 餅、餅、煎餅、這是什麼字？、餅

/** 警長（面向右邊的鍋子） */
const S = 44
const PY = 77 - 0.42 * S
const XS = 34
/**
 * 平底鍋：🍳 的圖上有荷包蛋，整張壓成深灰剪影（tint），翻面、轉 30 度讓握把朝左伸到他手上。
 * 角色的 (x, y) 是旋轉的支點；轉完以後鍋面的圓心在支點的右上方（CIRC）。
 */
const PS = 48
const PAN = { x: 70, y: 61 }
const CIRC = { x: PAN.x + 0.173 * PS, y: PAN.y - 0.12 * PS }
/** 餅躺在鍋裡的位置（餅的圖底部對齊，內容的中心比角色的 y 高一點） */
const CK = { x: CIRC.x, y: CIRC.y + 1.6 }
const CS = 30
/** 第 1 次落點：他自己的臉 */
const FACE = { x: XS + 1, y: PY - 8 }
/** 第 2 次落點：右邊那棵樹的樹冠左邊；他往右跨 DX 伸鍋子接 */
const TX = 140
const TS = 62
const DX = 38
const HANG = { x: CK.x + DX, y: 31 }
/** 字框在左上（餅在畫面中間往上飛，右邊是樹和太陽） */
const FRAME = { x: 20, y: 17 }
const FRAME_K = 0.4

const moves: Move[] = []
const fx: Fx[] = []
const camera: Camera[] = []
const cues: Cue[] = []

/** 鍋子（和鍋裡的餅 riders）一起移到「原位＋(dx, dy)」 */
function pan(at: number, dur: number, dx: number, dy: number, ease: Ease = 'out', riders: string[] = []) {
  moves.push({ at, dur, actor: 'pan', do: 'moveTo', to: { x: PAN.x + dx, y: PAN.y + dy }, ease })
  for (const id of riders) moves.push({ at, dur, actor: id, do: 'moveTo', to: { x: CK.x + dx, y: CK.y + dy }, ease })
}

/** 滋滋：鍋裡的餅抖、冒煙（每次同一個聲音） */
function sizzle(at: number, id: string, dur = 0.3) {
  moves.push({ at, dur, actor: id, do: 'shake', amount: 0.6 })
  fx.push({ at, dur: dur + 0.3, kind: 'zzz', actor: id, emoji: 'prop:smoke', dx: -8, dy: 6, scale: 1.3 })
  cues.push({ at, sfx: 'bubble' })
}

/**
 * 甩鍋（四次都一樣）：滋滋 → 蹲低、鍋子往下沉（停 wind 秒）→「嘿！」鍋子往上一甩（鏡頭 punch＋震、💥、同一個音效）
 * → 他舉著鍋子、抬頭看。餅怎麼飛由外面接著寫。回傳甩出去的那一刻。
 */
function flip(at: number, k: number, id: string, wind = 0.3) {
  sizzle(at, id)
  const W = at + 0.3
  moves.push({ at: W, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' })
  pan(W, 0.1, 0, 6, 'out', [id])
  const GO = W + wind
  moves.push(
    { at: GO, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
    { at: GO + 0.22, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
  )
  pan(GO, 0.07, 0, -14, 'out')
  pan(GO + 0.22, 0.15, 0, -9, 'inOut')
  fx.push({ at: GO, dur: 0.35, kind: 'burst', x: CK.x, y: CK.y + 2, n: 1, emoji: '💥', scale: 1.2 + 0.25 * k })
  cues.push({ at: GO, sfx: 'whoosh' }, { at: GO + 0.02, sfx: 'boing' })
  camera.push(
    { at: GO, dur: 0.3, do: 'punch', amount: 0.1 + 0.03 * k, to: { x: CK.x, y: 48 } },
    { at: GO, dur: 0.2, do: 'shake', amount: 0.6 + 0.3 * k },
  )
  return GO
}

/** 「啪」：餅落在不該落的地方（每次同一個聲音、同一個 💥，一次比一次大），他傻眼 */
function splat(at: number, k: number, x: number, y: number) {
  moves.push({ at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' })
  fx.push({ at, dur: 0.4, kind: 'burst', x, y, n: 1, emoji: '💥', scale: 1.3 + 0.3 * k })
  cues.push({ at, sfx: 'plop' }, { at: at + 0.02, sfx: 'bonk' })
  camera.push({ at, dur: 0.25, do: 'shake', amount: 0.7 + 0.3 * k })
}

// ---- 第一次：飛過頭頂，蓋在他自己臉上 ----
const G1 = 0.8
const GO1 = flip(G1, 0, 'cake')
const L1 = GO1 + 0.6
moves.push(
  { at: GO1, dur: 0.6, actor: 'cake', do: 'moveTo', to: FACE, arc: 25, ease: 'linear' },
  { at: GO1, dur: 0.6, actor: 'cake', do: 'rotateTo', amount: -720, ease: 'linear' },
  // 眼睛跟著餅往下看
  { at: GO1 + 0.42, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
  { at: L1, dur: 0.2, actor: 'sheriff', do: 'squash', amount: 0.14 },
)
pan(GO1 + 0.42, 0.12, 0, 0, 'inOut')
splat(L1, 0, FACE.x, FACE.y - 2)
// 傻眼停住……餅從臉上滑下來，他抓起來放回鍋子
const R1 = L1 + 0.45
moves.push(
  { at: R1, dur: 0.12, actor: 'cake', do: 'moveTo', to: { x: FACE.x + 2, y: FACE.y + 7 }, ease: 'in' },
  { at: R1 + 0.12, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
  { at: R1 + 0.12, dur: 0.2, actor: 'cake', do: 'moveTo', to: CK, arc: 8 },
)
cues.push({ at: R1, sfx: 'slide' }, { at: R1 + 0.32, sfx: 'tap' })

// ---- 第二次：飛到樹頂那麼高，掛在旁邊的樹上晃 ----
const G2 = R1 + 0.36
const GO2 = flip(G2, 1, 'cake')
const L2 = GO2 + 0.75
moves.push(
  { at: GO2, dur: 0.75, actor: 'cake', do: 'moveTo', to: HANG, arc: 37, ease: 'linear' },
  { at: GO2, dur: 0.75, actor: 'cake', do: 'rotateTo', amount: -1080, ease: 'linear' },
  { at: L2, dur: 0.4, actor: 'tree', do: 'shake', amount: 1.2 },
  { at: L2 + 0.02, dur: 0.45, actor: 'cake', do: 'tilt', amount: 22 },
  { at: L2 + 0.02, dur: 0.45, actor: 'cake', do: 'shake', amount: 1.6 },
)
pan(L2, 0.12, 0, 0, 'inOut')
splat(L2, 1, HANG.x, HANG.y)
fx.push({ at: L2, dur: 0.5, kind: 'burst', x: HANG.x, y: HANG.y, n: 6, emoji: '🍃', scale: 1.3 })
// 傻眼停住……餅從樹上滑下來，他跨一大步伸鍋子接住，再退回原位
const C2 = L2 + 0.48
moves.push(
  { at: C2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
  { at: C2, dur: 0.18, actor: 'sheriff', do: 'moveTo', to: { x: XS + DX, y: PY }, ease: 'out' },
  { at: C2 + 0.08, dur: 0.2, actor: 'cake', do: 'moveTo', to: { x: CK.x + DX, y: CK.y }, ease: 'in' },
  { at: C2 + 0.28, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
  { at: C2 + 0.34, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: XS, y: PY } },
)
pan(C2, 0.18, DX, 0, 'out')
pan(C2 + 0.34, 0.2, 0, 0, 'inOut', ['cake'])
cues.push({ at: C2 + 0.08, sfx: 'slide' }, { at: C2 + 0.28, sfx: 'tap' })

// ---- 第三次：先停一拍（擦汗、退後、助跑），整個人跳起來甩——飛出畫面頂 ----
const G3 = C2 + 0.56
const BACK = 12
moves.push(
  { at: G3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/hot' },
  // 退後
  { at: G3 + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
  { at: G3 + 0.3, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: XS - BACK, y: PY } },
  // 助跑
  { at: G3 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
  { at: G3 + 0.6, dur: 0.13, actor: 'sheriff', do: 'moveTo', to: { x: XS, y: PY }, ease: 'in' },
)
pan(G3 + 0.3, 0.2, -BACK, 0, 'inOut', ['cake'])
pan(G3 + 0.6, 0.13, 0, 0, 'in', ['cake'])
cues.push({ at: G3, sfx: 'gulp' })
const GO3 = flip(G3 + 0.44, 2, 'cake', 0.28)
const EX = GO3 + 0.2
const TOP = { x: CK.x + 2, y: 5 }
moves.push(
  { at: GO3, dur: 0.45, actor: 'sheriff', do: 'hop', amount: 9 },
  { at: GO3, dur: 0.3, actor: 'cake', do: 'moveTo', to: { x: TOP.x, y: -45 }, ease: 'linear' },
  { at: GO3, dur: 0.3, actor: 'cake', do: 'rotateTo', amount: -1080, ease: 'linear' },
)
// 飛到變成一顆小星星
fx.push({ at: EX + 0.08, dur: 0.5, kind: 'burst', x: TOP.x, y: TOP.y + 6, n: 1, emoji: '✨', scale: 1.4 })
cues.push({ at: EX + 0.08, sfx: 'clink' })
// 他舉著鍋子等、左右接……沒掉下來
const B3 = EX + 0.45
pan(GO3 + 0.45, 0.12, -4, -9, 'inOut')
pan(GO3 + 0.6, 0.12, 4, -9, 'inOut')

// ---- 拼好：國字放大到中間。他怕餅砸下來，鍋子垂下來、退到左邊抱著自己發抖 ----
const HOME = B3 + 0.2
const PARK = HOME + 1.05
/** 躲的時候鍋子垂在身前（臉要露出來：他抱著自己發抖、一直往上看） */
const HIDE = { x: 15, dx: 36 - CIRC.x, dy: 65 - CIRC.y }
moves.push(
  { at: B3 + 0.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/scared' },
  { at: B3 + 0.1, dur: 0.15, actor: 'sheriff', do: 'moveTo', to: { x: HIDE.x, y: PY } },
  { at: B3 + 0.4, dur: 0.6, actor: 'sheriff', do: 'shake', amount: 0.8 },
  // 國字讓位以後：沒事？他把鍋子放下來，走回原位
  { at: PARK + 0.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
  { at: PARK + 0.25, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: XS, y: PY } },
)
pan(B3 + 0.1, 0.15, HIDE.dx, HIDE.dy, 'inOut')
pan(PARK + 0.25, 0.2, 0, 0, 'inOut')

// ---- 語詞那一刻：放棄了，重新煎一張新的，躺在鍋裡冒煙——煎餅！ ----
const WORD = PARK + 0.5
moves.push(
  { at: WORD, dur: 0.22, actor: 'cake2', do: 'pop' },
  { at: WORD + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
)
fx.push(
  { at: WORD, dur: 0.6, kind: 'burst', x: CK.x, y: CK.y - 4, n: 8, emoji: '✨', scale: 1.6 },
  { at: WORD + 0.1, dur: 0.7, kind: 'zzz', actor: 'cake2', emoji: 'prop:smoke', dx: -8, dy: 6, scale: 1.3 },
)
cues.push({ at: WORD - 0.02, sfx: 'plop' })

// ---- 回馬槍（第四次）：他閉眼得意、乖乖輕輕顛一下——飛走的那張「咻——啪！」掉回來疊在上面 ----
const G4 = WORD + 0.66
sizzle(G4, 'cake2', 0.22)
moves.push(
  { at: G4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
  { at: G4 + 0.24, dur: 0.32, actor: 'cake2', do: 'hop', amount: 9 },
  { at: G4 + 0.24, dur: 0.32, actor: 'cake2', do: 'rotateTo', amount: -360, ease: 'linear' },
)
pan(G4 + 0.24, 0.07, 0, -4, 'out')
pan(G4 + 0.36, 0.15, 0, 0, 'inOut')
cues.push({ at: G4 + 0.24, sfx: 'blip' }, { at: G4 + 0.56, sfx: 'tap' })
// 咻——
const FALL = G4 + 0.68
const L4 = FALL + 0.28
const STACK = { x: CK.x + 1, y: CK.y - 5 }
moves.push(
  { at: FALL, dur: 0.28, actor: 'cake', do: 'moveTo', to: STACK, ease: 'in' },
  { at: FALL, dur: 0.28, actor: 'cake', do: 'rotateTo', amount: 540, ease: 'linear' },
  // 啪！鍋子被砸得一沉再彈回來
  { at: L4, dur: 0.08, actor: 'cake', do: 'moveTo', to: { x: STACK.x, y: STACK.y + 6 }, ease: 'out' },
  { at: L4 + 0.1, dur: 0.35, actor: 'cake', do: 'moveTo', to: STACK, ease: 'elastic' },
  { at: L4, dur: 0.35, actor: 'sheriff', do: 'hop', amount: 7 },
  { at: L4 + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
  { at: L4 + 0.5, dur: 0.25, actor: 'sheriff', do: 'hop', amount: 4 },
)
pan(L4, 0.08, 0, 6, 'out', ['cake2'])
pan(L4 + 0.1, 0.35, 0, 0, 'elastic', ['cake2'])
splat(L4, 3, STACK.x, STACK.y - 2)
cues.push({ at: FALL, sfx: 'whoosh' })
camera.push({ at: L4, dur: 0.4, do: 'punch', amount: 0.18, to: { x: CK.x, y: 50 } })

// ---- 問他 ----
const ASK = L4 + 0.7
/** 問句唸完（0.97 秒）再安靜 1.5 秒以上才回答 */
const ANSWER = ASK + 0.05 + 0.974 + 1.53
const AS = 1.2
moves.push(
  // 鍋子、餅、樹收起來，只留他
  { at: ASK, dur: 0.2, actor: 'pan', do: 'vanish' },
  { at: ASK, dur: 0.2, actor: 'cake', do: 'vanish' },
  { at: ASK, dur: 0.2, actor: 'cake2', do: 'vanish' },
  { at: ASK + 0.1, dur: 0.25, actor: 'tree', do: 'vanish' },
  { at: ASK + 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
  { at: ASK + 0.4, dur: 0.25, actor: 'sheriff', do: 'moveTo', to: { x: 28, y: PY }, ease: 'out' },
  { at: ASK + 0.4, dur: 0.25, actor: 'sheriff', do: 'scaleTo', amount: AS },
  { at: ASK + 1.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
  { at: ASK + 1.6, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
  { at: ASK + 2.1, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
  { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
  { at: ANSWER, dur: 0.25, actor: 'sheriff', do: 'hop', amount: 7 },
  { at: ANSWER + 0.25, actor: 'sheriff', do: 'flip' },
  { at: ANSWER + 0.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
  { at: ANSWER + 0.25, dur: 0.18, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: PY }, ease: 'in' },
)
const END = Math.ceil((ANSWER + 0.45 + 1) * 10) / 10

const clip: Clip = {
  format: 2,
  char: '餅',
  meta: { theme: '警長煎餅翻面，餅飛太高沒掉回鍋裡', cast: '狗狗警長＋平底鍋＋蔥油餅兩張＋樹', gags: ['狗狗警長拿平底鍋煎餅，餅滋滋冒煙，他蹲低、鍋子一沉，「嘿！」一甩把餅拋起來翻面，餅轉著圈飛上去、他舉著鍋子抬頭看，結果飛太高沒掉回鍋裡，「啪」地落在別的地方，他傻眼；一次比一次高（飛過頭頂蓋在自己臉上→飛到樹頂掛在樹上晃→停一拍：擦汗、退後、助跑、整個人跳起來甩，餅飛出畫面變成小星星，他舉著鍋子等不到，嚇得拿鍋子擋著躲起來）；回馬槍是他放棄了、重新煎一張新的乖乖輕輕顛一下，閉眼得意時，飛走的那張咻——啪地從天上掉下來，穩穩疊在新的上面變雙層'] },
  duration: END,
  // 戶外野炊：淡藍的天、草地色的地；金黃的餅在藍天上看得清楚。太陽在右上（被樹擋著），字框在左上
  bg: { top: '#CFE8FF', bottom: '#F3FAFF', floor: '#BFD9A0', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: TX, y: 77 - 0.42 * TS, size: TS },
    { id: 'sheriff', emoji: 'hero:sheriff/reach', x: XS, y: PY, size: S, flip: true },
    { id: 'pan', emoji: '🍳', x: PAN.x, y: PAN.y, size: PS, float: true, flip: true, pivot: 'center', tint: 'contrast(0) brightness(.32)' },
    { id: 'cake2', emoji: 'prop:pancake', x: CK.x, y: CK.y, size: 36, float: true, pivot: 'center', hidden: true },
    { id: 'cake', emoji: 'prop:pancake', x: CK.x, y: CK.y, size: CS, float: true, pivot: 'center' },
  ],
  moves: [
    // 握把轉到他手上
    { at: 0, dur: 0, actor: 'pan', do: 'rotateTo', amount: 30 },
    // 開場：餅在鍋裡滋滋響，他回頭指著字框——餅！
    { at: 0.3, actor: 'sheriff', do: 'flip' },
    { at: 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: G1 - 0.02, actor: 'sheriff', do: 'flip' },
    { at: G1 - 0.02, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    ...moves,
  ],
  builds: [
    // 每次「啪」地落在不該落的地方，就從那張餅上飛出一組筆畫
    { at: L1 + 0.05, dur: 0.5, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'cake', color: partColor('飠') },
    { at: L2 + 0.05, dur: 0.45, strokes: [8, 9, 10], from: 'cake', color: partColor('并') },
    { at: EX, dur: 0.45, strokes: [11, 12, 13], from: TOP, color: partColor('并') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.3, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.25 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 92, y: 42 }, amount: 0.78 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.3, do: 'pulse' },
    { at: END - 0.7, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.05, dur: 0.7, kind: 'zzz', actor: 'cake', emoji: 'prop:smoke', dx: -8, dy: 6, scale: 1.3 },
    ...fx,
    { at: ANSWER, dur: 0.25, kind: 'burst', x: 92, y: 40, emoji: '🌟', n: 10 },
  ],
  camera: [
    // 鏡頭鎖全景（餅上下飛得很高，自動取景往前預看會切到人或字），只有甩鍋、啪的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'bubble' },
    { at: 0.4, say: '餅' },
    ...cues,
    { at: HOME + 0.1, say: '餅' },
    { at: WORD, say: '煎餅' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '餅' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
