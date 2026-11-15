import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { pressStack } from '../helpers'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 頭（v2）：豬探長站在畫面正中間，每次頭頂正上方先冒出一個東西晃一晃（小孩看得到、他沒發現），
// 然後「咚！」正中他的頭：頭一縮、眼冒金星，頭頂冒出一個紅色的包，一次比一次大——
// 橡果（豆從頭頂彈出來）→ 蘋果（包變大，頁的上半）→ 先停一拍：他抬頭左看右看、撐起一片小葉子擋——大西瓜穿過葉子砸下來（包最大，頁的兩腳）。
// 語詞：他舉起紅色安全帽戴上（頭盔），得意得不得了；回馬槍：大石頭掉下來「鏘」地彈開，他沒事——
// 他脫下頭盔擦汗，一顆小小的橡果「咚」，頭上腫出一個最大的包。
// 最後畫面暗下來只剩「頭」，豬探長問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「頭！」，然後退場只留字。
// 頭、頭、頭盔、這是什麼字？、頭

/** 豬探長：大、站在畫面正中間（頭是這支的主角） */
const S = 46
const P = 77 - 0.42 * S
const X = 86
/** 字框（國字讓位的位置）在左上：東西從他頭頂正上方掉下來，不經過字框 */
const FRAME = { x: 34, y: 21.5 }
/** 各個姿勢的帽頂在原圖（512）裡的位置：腫包、頭盔都要跟著頭走 */
const TOP = {
  idle: [280, 24], surprised: [279, 30], dizzy: [284, 67], smug: [305, 24], lift: [296, 46], hot: [302, 31], ponder: [276, 24], walk: [266, 25],
} as const
type Pose = keyof typeof TOP
/** 他站在 x、擺這個姿勢時，頭頂（帽頂）在哪裡 */
const head = (pose: Pose, x = X) => ({ x: x + ((TOP[pose][0] - 256) / 512) * S, y: P - S / 2 + (TOP[pose][1] / 512) * S })
/** 腫包埋進帽子裡多深（下半截藏在頭後面，看起來像從頭頂腫出來） */
const SINK = 3
/** 腫包（畫在他後面）的腳底放在頭頂往下 SINK 的地方；y 是 emoji 的中心 */
const bumpAt = (pose: Pose, size: number, x = X) => ({ x: head(pose, x).x, y: head(pose, x).y + SINK - 0.42 * size })
/** 腫包：第 1 次 size 6，第 2 次 ×1.7，第 3 次再 ×1.5 */
const B0 = 6
const BUMP = [B0, B0 * 1.7, B0 * 1.7 * 1.5]
/** 腫包露出頭頂的高度（東西砸下來碰到的地方） */
const bumpTop = (k: number) => (k === 0 ? 0 : 0.85 * BUMP[k - 1] - SINK)
/** 頭盔（prop:hardhat）：蓋住偵探帽 */
const HS = 21
const helmetAt = (pose: Pose, x = X) => ({ x: head(pose, x).x, y: head(pose, x).y + 8 - 0.461 * HS })
/** 打中以後傻眼停多久 */
const HOLD = 0.45
/** 東西在他頭頂正上方晃多久才掉下來（預備） */
const WAIT = 0.7
/** 掉下來要多久 */
const FALL = 0.17
/** 掉下來的東西（obj）原本的大小 */
const OBJ = 10

/**
 * 「咚」：東西在他頭頂正上方冒出來、晃一下（他沒發現）→ 掉下來正中頭頂 → 那一格鏡頭推近＋震＋同一個「咚」＋星星，
 * 他頭一縮、傻眼停 HOLD 秒、眼冒金星；東西彈開飛出畫面右邊。
 * obj 是掉下來的東西，size 是它的大小，k 是第幾次（越後面越大），pose 是被砸那一刻他的姿勢，top 是頭頂上多出來的高度（腫包、葉子）。
 */
function bonk(at: number, k: number, emoji: string, size: number, pose: Pose, top: number, sink: string[]) {
  const h = head(pose)
  const hit = h.y - top
  const above = { x: h.x, y: 2 + 0.5 * size }
  const obj = 'obj'
  const moves: Move[] = [
    // 預備：在頭頂正上方冒出來、晃一下（掉下來的東西都是同一個角色，換圖、換大小）
    ...appear(at - FALL - WAIT, emoji, size, above),
    { at: at - FALL - WAIT + 0.3, actor: obj, do: 'shake', amount: 1.2 + 0.2 * k, dur: 0.3 },
    // 掉下來
    { at: at - FALL, actor: obj, do: 'moveTo', to: { x: h.x, y: hit - 0.42 * size }, dur: FALL, ease: 'in' },
    // 咚！彈開、轉著飛出畫面右邊
    { at, actor: obj, do: 'squash', amount: 0.3, dur: 0.15 },
    { at: at + 0.08, actor: obj, do: 'moveTo', to: { x: 185, y: 40 }, arc: 16, dur: 0.55, ease: 'out' },
    { at: at + 0.08, actor: obj, do: 'spin', times: 2, dur: 0.55, pivot: 'center' },
    { at: at + 0.65, actor: obj, do: 'vanish', dur: 0.05 },
    // 他頭一縮、傻眼
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at, actor: 'pig', do: 'squash', amount: 0.14 + 0.06 * k, dur: 0.35 },
    ...pressStack(at, 0.35, 0.14 + 0.06 * k, S, sink),
  ]
  const fx: Fx[] = [
    // 💥 在頭頂斜上方（不蓋臉），星星從頭頂噴出來，一次比一次多
    { at, kind: 'burst', x: h.x + 9, y: hit - 3, n: 1, dur: 0.4, scale: 1.1 + 0.3 * k },
    { at: at + 0.03, kind: 'burst', x: h.x, y: hit - 2, emoji: '⭐', n: 4 + 2 * k, dur: 0.45, scale: 1 + 0.1 * k },
    { at: at + 0.15, kind: 'dizzy', actor: 'pig', dy: -top, dur: HOLD + 0.3 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: h.x, y: hit + 4 } },
    { at, dur: 0.3, do: 'shake', amount: 1 + 0.5 * k },
  ]
  // 白光很淡，不把他刷白
  const lights: Light[] = [{ at, dur: 0.04, level: -0.12 - 0.04 * k }, { at: at + 0.04, dur: 0.2, level: 0 }]
  // 同一個「咚」，一次比一次多疊一個音；預備時有一聲「咻」
  const cues: Cue[] = [{ at: at - FALL - 0.05, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, lights, cues }
}

/** 掉下來的東西（同一個角色 obj）在 to 冒出來：換圖、換成 size 大小 */
function appear(at: number, emoji: string, size: number, to: { x: number; y: number }, obj = 'obj'): Move[] {
  return [
    { at, actor: obj, do: 'swap', emoji },
    { at, actor: obj, do: 'moveTo', to, dur: 0.01 },
    { at, actor: obj, do: 'pop', dur: 0.25 },
    { at, actor: obj, do: 'scaleTo', amount: size / OBJ, dur: 0.01 },
  ]
}

/** 豬探長換姿勢：腫包跟著頭走（姿勢不一樣，帽頂高低不一樣） */
function pose(at: number, p: Pose, bump: string | null, size = 0, x = X): Move[] {
  const ms: Move[] = [{ at, actor: 'pig', do: 'swap', emoji: `hero:pig/${p}` }]
  if (bump) ms.push({ at, actor: bump, do: 'moveTo', to: bumpAt(p, size, x), dur: 0.01 })
  return ms
}

const H1 = 1.55, H2 = 3.1, H3 = 5.75, H4 = 10.15
const HOME = 6.8
const PARK = 7.6
const WORD = 8.25
const CLANG = 9.15
const ASK = 10.65
const ANSWER = 13.45
/** 第 3 次以後他頭暈、倒退到右邊，讓國字放大 */
const SIDE = 136

const b1 = bonk(H1, 0, '🌰', 9, 'idle', bumpTop(0), [])
const b2 = bonk(H2, 1, '🍎', 13, 'idle', bumpTop(1), ['bump'])
// 第 3 次：他撐著葉子（lift），西瓜穿過葉子
const b3 = bonk(H3, 2, 'prop:watermelon', 26, 'lift', bumpTop(2) + 3, ['bump'])
// 回馬槍最後一下：脫下頭盔擦汗（hot），小小的橡果
const b4 = bonk(H4, 3, '🌰', 6, 'hot', 0, ['bump'])

const clip: Clip = {
  format: 2,
  char: '頭',
  meta: { theme: '天上掉東西砸豬探長的頭', cast: '豬探長＋掉下來的東西（橡果、蘋果、大西瓜、大石頭）＋頭盔', gags: ['豬探長站在中間，頭頂正上方每次先冒出一個東西晃一晃，「咚」地正中他的頭，頭一縮眼冒金星、頭頂腫一個包，一次比一次大（橡果、蘋果、撐葉子擋還是被大西瓜砸）；回馬槍是他戴上頭盔，大石頭鏘地彈開他好得意，一脫下頭盔擦汗，一顆小小的橡果咚地砸出最大的包'] },
  duration: 15,
  bg: { top: '#D8F0FF', bottom: '#FFF8E8', floor: '#BFDC94', scenery: 'hills' },
  actors: [
    // 腫包畫在他後面：下半截藏在帽子後面，看起來是從頭頂腫出來的
    { id: 'bump', emoji: '🔴', ...bumpAt('surprised', B0), size: B0, hidden: true, float: true },
    { id: 'pig', emoji: 'hero:pig/walk', x: X, y: P, size: S, hidden: true },
    // 第 3 次前撐的小葉子；回馬槍時換成大石頭
    { id: 'obj2', emoji: '🍃', x: X, y: 30, size: OBJ, hidden: true, float: true },
    { id: 'helmet', emoji: 'prop:hardhat', ...helmetAt('lift'), size: HS, hidden: true, float: true },
    { id: 'obj', emoji: '🌰', x: X, y: 0, size: OBJ, hidden: true, float: true },
  ],
  moves: [
    // 豬探長從右邊走進來，站到正中間，抬頭看字框：頭！
    { at: 0, actor: 'pig', do: 'enter', from: { x: 185, y: P }, dur: 0.5, ease: 'out' },
    ...pose(0.5, 'idle', null),
    // 第 1 次：頭頂上冒出一顆橡果——咚！腫一個小包
    ...b1.moves,
    { at: H1 + 0.03, actor: 'bump', do: 'pop', dur: 0.25 },
    { at: H1 + 0.03, actor: 'bump', do: 'moveTo', to: bumpAt('surprised', B0), dur: 0.01 },
    ...pose(H1 + HOLD + 0.05, 'idle', 'bump', B0),
    { at: H1 + HOLD + 0.1, actor: 'pig', do: 'tilt', amount: -6, dur: 0.3 },
    // 第 2 次：蘋果——咚！包變大，坐下來頭暈
    ...b2.moves,
    { at: H2 + 0.03, actor: 'bump', do: 'scaleTo', amount: 1.7, dur: 0.25, ease: 'back' },
    ...pose(H2 + HOLD, 'dizzy', 'bump', BUMP[1]),
    ...pose(H2 + 0.95, 'idle', 'bump', BUMP[1]),
    // 第 3 次前停一拍：他抬頭左看右看……撐起一片小葉子擋在頭上（得意）
    ...pose(4.15, 'ponder', 'bump', BUMP[1]),
    { at: 4.3, actor: 'pig', do: 'tilt', amount: -9, dur: 0.3 },
    { at: 4.65, actor: 'pig', do: 'tilt', amount: 9, dur: 0.3 },
    ...pose(5.0, 'lift', 'bump', BUMP[1]),
    ...appear(5.0, '🍃', 14, { x: head('lift').x, y: head('lift').y - bumpTop(2) - 2 }, 'obj2'),
    // 大西瓜穿過葉子：葉子被打飛
    ...b3.moves,
    { at: H3, actor: 'obj2', do: 'moveTo', to: { x: 30, y: 60 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: H3, actor: 'obj2', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
    { at: H3 + 0.6, actor: 'obj2', do: 'vanish', dur: 0.15 },
    { at: H3 + 0.03, actor: 'bump', do: 'scaleTo', amount: 1.5, dur: 0.25, ease: 'back' },
    { at: H3, actor: 'bump', do: 'moveTo', to: bumpAt('surprised', BUMP[1]), dur: 0.01 },
    // 頭暈、搖搖晃晃倒退到右邊坐下（讓國字放大）
    ...pose(H3 + HOLD, 'walk', 'bump', BUMP[2]),
    { at: H3 + HOLD, actor: 'pig', do: 'moveTo', to: { x: SIDE, y: P }, dur: 0.5, ease: 'inOut' },
    { at: H3 + HOLD, actor: 'bump', do: 'moveTo', to: bumpAt('walk', BUMP[2], SIDE), dur: 0.5, ease: 'inOut' },
    { at: H3 + HOLD, actor: 'pig', do: 'tilt', amount: 8, dur: 0.5 },
    ...pose(H3 + HOLD + 0.5, 'dizzy', 'bump', BUMP[2], SIDE),
    // 語詞那一刻：國字讓回左上，他走回中間，舉起紅色安全帽——戴上！腫包被壓下去
    ...pose(PARK, 'walk', 'bump', BUMP[2], SIDE),
    { at: PARK, actor: 'pig', do: 'moveTo', to: { x: X, y: P }, dur: 0.35 },
    { at: PARK, actor: 'bump', do: 'moveTo', to: bumpAt('walk', BUMP[2]), dur: 0.35 },
    ...pose(PARK + 0.4, 'lift', 'bump', BUMP[2]),
    { at: PARK + 0.4, actor: 'helmet', do: 'moveTo', to: { x: head('lift').x, y: head('lift').y - bumpTop(3) - 0.3 * HS }, dur: 0.01 },
    { at: PARK + 0.4, actor: 'helmet', do: 'pop', dur: 0.25 },
    { at: WORD - 0.12, actor: 'helmet', do: 'moveTo', to: helmetAt('smug'), dur: 0.12, ease: 'in' },
    { at: WORD - 0.05, actor: 'bump', do: 'scaleTo', amount: 0.05, dur: 0.07 },
    { at: WORD + 0.02, actor: 'bump', do: 'vanish', dur: 0.01 },
    ...pose(WORD, 'smug', null),
    // 得意地拍拍頭盔（頭盔跟著頭一起點）
    ...[WORD + 0.45, WORD + 0.75].flatMap((at): Move[] => [
      { at, actor: 'pig', do: 'squash', amount: 0.08, dur: 0.2 },
      ...pressStack(at, 0.2, 0.08, S, ['helmet']),
    ]),
    // 回馬槍（第 4 次）：大石頭在頭頂上晃——鏘！彈開，他一點事都沒有，超得意
    ...appear(CLANG - FALL - WAIT, 'prop:rock', 26, { x: head('smug').x, y: 15 }, 'obj2'),
    { at: CLANG - FALL - WAIT + 0.3, actor: 'obj2', do: 'shake', amount: 1.8, dur: 0.3 },
    { at: CLANG - FALL, actor: 'obj2', do: 'moveTo', to: { x: head('smug').x, y: helmetAt('smug').y - 0.23 * HS - 0.3 * 26 }, dur: FALL, ease: 'in' },
    { at: CLANG, actor: 'obj2', do: 'moveTo', to: { x: 185, y: -10 }, arc: 12, dur: 0.5, ease: 'out' },
    { at: CLANG, actor: 'obj2', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: CLANG + 0.55, actor: 'obj2', do: 'vanish', dur: 0.05 },
    { at: CLANG, actor: 'pig', do: 'squash', amount: 0.06, dur: 0.2 },
    ...pressStack(CLANG, 0.2, 0.06, S, ['helmet']),
    { at: CLANG + 0.25, actor: 'pig', do: 'hop', amount: 2, dur: 0.25 },
    { at: CLANG + 0.25, actor: 'helmet', do: 'hop', amount: 2, dur: 0.25 },
    // 他脫下頭盔放到地上，擦汗——頭頂上冒出一顆小小的橡果
    ...pose(9.6, 'lift', null),
    { at: 9.6, actor: 'helmet', do: 'moveTo', to: { x: head('lift').x, y: head('lift').y - 6 }, dur: 0.12 },
    { at: 9.75, actor: 'helmet', do: 'moveTo', to: { x: 58, y: 77 - 0.461 * HS }, arc: 6, dur: 0.3, ease: 'out' },
    ...pose(9.8, 'hot', null),
    ...b4.moves,
    // 咚！小小的橡果，腫出最大的包
    { at: H4 + 0.03, actor: 'bump', do: 'moveTo', to: bumpAt('surprised', B0), dur: 0.01 },
    { at: H4 + 0.03, actor: 'bump', do: 'pop', dur: 0.12 },
    { at: H4 + 0.1, actor: 'bump', do: 'scaleTo', amount: 3.2, dur: 0.35, ease: 'elastic' },
    // 問他：腫包、頭盔收掉，豬探長跳到左前方，轉向觀眾
    { at: ASK, actor: 'bump', do: 'moveTo', to: bumpAt('idle', B0 * 3.2, 34), arc: 8, dur: 0.4, ease: 'out' },
    { at: ASK + 0.1, actor: 'bump', do: 'vanish', dur: 0.3 },
    { at: ASK, actor: 'helmet', do: 'vanish', dur: 0.2 },
    ...pose(ASK, 'idle', null),
    { at: ASK, actor: 'pig', do: 'flip' },
    { at: ASK, actor: 'pig', do: 'moveTo', to: { x: 34, y: P + 3 }, arc: 8, dur: 0.4, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.05, actor: 'pig', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.6, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.1, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ANSWER + 0.25, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 每次砸中，一組筆畫從他頭頂彈出來、飛進左上的字框
    { at: H1 + 0.1, dur: 0.75, strokes: [0, 1, 2, 3, 4, 5, 6], from: head('surprised'), color: partColor('豆') },
    { at: H2 + 0.1, dur: 0.85, strokes: [7, 8, 9, 10, 11, 12, 13], from: { x: head('surprised').x, y: head('surprised').y - bumpTop(1) }, color: partColor('頁') },
    { at: H3 + 0.1, dur: 0.4, strokes: [14, 15], from: { x: head('surprised').x, y: head('surprised').y - bumpTop(2) }, color: partColor('頁') },
  ],
  glyph: [
    // 字框一開始就在左上（東西從他頭頂正上方掉下來，不經過字框）
    { at: 0, dur: 0.01, do: 'park', to: FRAME },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME },
    // 問他：國字稍微偏右、縮一點，左前方讓給豬探長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['pig'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    ...b2.fx,
    // 停一拍：他抬頭看天
    { at: 4.2, kind: 'pop', actor: 'pig', emoji: '❓', dx: -12, dy: 4, dur: 0.6, scale: 1.3 },
    ...b3.fx,
    { at: H3 + 0.05, kind: 'burst', x: head('lift').x, y: head('lift').y - 8, emoji: '🍃', n: 6, dur: 0.5 },
    // 頭盔：戴上那一刻閃一下
    { at: WORD, kind: 'burst', ...helmetAt('smug'), emoji: '✨', n: 6, dur: 0.5, scale: 1.2 },
    // 鏘！石頭彈開，火花
    { at: CLANG, kind: 'burst', x: head('smug').x + 8, y: helmetAt('smug').y - 6, emoji: '✨', n: 8, dur: 0.45, scale: 1.3 },
    { at: CLANG + 0.3, kind: 'pop', actor: 'pig', emoji: '😎', dx: -18, dy: 8, dur: 0.5, scale: 1.3 },
    // 擦汗
    { at: 9.85, kind: 'sweat', actor: 'pig' },
    ...b4.fx,
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：頭頂上的東西要一直看得到
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: CLANG, dur: 0.3, do: 'shake', amount: 1.2 },
    ...b4.camera,
  ],
  lights: [
    ...b1.lights,
    ...b2.lights,
    ...b3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...b4.lights,
  ],
  cues: [
    { at: 0.6, say: '頭' },
    ...b1.cues,
    ...b2.cues,
    { at: 5.0, sfx: 'blip' },
    ...b3.cues,
    { at: HOME + 0.1, say: '頭' },
    { at: WORD, sfx: 'clink' },
    { at: WORD + 0.05, say: '頭盔' },
    { at: CLANG - FALL - 0.05, sfx: 'whoosh' },
    { at: CLANG, sfx: 'clink' },
    { at: CLANG + 0.04, sfx: 'boing' },
    ...b4.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '頭' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
