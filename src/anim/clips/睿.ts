import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 睿（v2）：大猩猩想把大禮物撞開——每次搥胸、衝過去用肚子撞，禮物都「啵ㄧㄛ」一下把他彈回去，一次比一次遠：
// 彈回原地（睿的上半部從禮物彈出來）、滾到畫面邊（再一塊）、先停一拍再被彈上天（傻眼睜大的眼睛變成「目」）。
// 回馬槍：他第四次衝過來時，楊捷睿只是輕輕一拉緞帶，包裝紙「碰」地散開（睿智）——大猩猩撲了個空，一頭栽進盒子裡，只剩兩隻腳在外面踢。
// 最後畫面暗下來只剩「睿」，楊捷睿轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「睿！」，然後退場只留字。
// 睿、睿、睿智、這是什麼字？、睿
const P = 66.9 // 楊捷睿（size 24）站在地上的 y
const G = 65.2 // 大猩猩（size 28）
const BOX = 62.7 // 大禮物（size 34）
/** 大禮物在右邊（國字拼好回到正中央時，禮物不擋字） */
const BX = 130
/** 大猩猩每次出發的地方 */
const HOME = 70
/** 前三次都衝到同一個地方：撞上禮物的左邊 */
const HIT = 103
/** 楊捷睿看戲的地方 */
const YX = 22
/** 撞到以後傻眼停多久，才被彈走 */
const HOLD = 0.45
/** 搥胸（預備）到撞上的時間 */
const WIND = 0.6

/**
 * 「啵ㄧㄛ」：大猩猩搥胸（預備）→ 往後縮、衝過去 → 撞上禮物那一刻 💥＋禮物被壓扁再彈開＋鏡頭推近＋震＋同一個音效，
 * 他被壓扁、頂著 😳 傻眼停 HOLD 秒，才被彈走。k 是第幾次（越後面越大）。
 * 第 4 次（hit: false）禮物已經被拉開了：一樣的搥胸、一樣衝過來，這次沒有東西彈他。
 */
function charge(at: number, k: number, hit = true) {
  const moves: Move[] = [
    { at: at - WIND, actor: 'ape', do: 'shake', amount: 1 + 0.3 * k, dur: 0.25 },
    { at: at - WIND, actor: 'ape', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: at - 0.25, actor: 'ape', do: 'moveTo', to: { x: HIT, y: G }, dur: 0.25, anticipate: 5, ease: 'in' },
  ]
  const fx: Fx[] = [
    { at: at - WIND, kind: 'pop', actor: 'ape', emoji: '💪', dx: -10, dy: -4, dur: 0.4, scale: 1.7 + 0.2 * k },
  ]
  const camera: Camera[] = []
  const cues: Cue[] = [{ at: at - WIND, sfx: 'rumble' }, { at: at - 0.25, sfx: 'whoosh' }]
  if (hit) {
    moves.push(
      { at, actor: 'gift', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.35 },
      { at, actor: 'ape', do: 'squash', amount: 0.25 + 0.1 * k, dur: HOLD },
    )
    fx.push(
      // 💥 每次都在撞上的同一個位置，一次比一次大；😳 是他傻眼的臉
      { at, kind: 'burst', x: HIT + 12, y: G - 8, n: 1, dur: 0.4, scale: 1.6 + 0.4 * k },
      // 😳 停在撞上的地方（不跟著他飛走，才不會飛到字框上）
      { at: at + 0.05, kind: 'pop', x: HIT + 2, y: G - 2, emoji: '😳', dur: HOLD, scale: 1.8 + 0.2 * k },
    )
    camera.push(
      { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x: HIT - 10, y: G - 8 } },
      { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
    )
    // 同一個音效，一次比一次多疊一個
    cues.push({ at, sfx: 'boing' })
    if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
    if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  }
  return { moves, fx, camera, cues }
}

const H1 = 1.7, H2 = 3.5, H3 = 6.1, H4 = 10.0
const c1 = charge(H1, 0)
const c2 = charge(H2, 1)
const c3 = charge(H3, 2)
const c4 = charge(H4, 3, false)
/** 第 4 次：他先掉回左邊、搥胸準備；楊捷睿站在禮物左邊，比「等一下」，輕輕拉蝴蝶結，禮物打開 */
const HOME4 = 64
const BY = 100
/** 他放大多少（語詞那一刻他和打開的禮物最大、最中間） */
const BIG = 1.4
const OPEN = 9.25
/** 一頭栽進盒子：倒過來、腳在盒子上面 */
const STUCK = { x: BX - 2, y: 46 }

const clip: Clip = {
  format: 2,
  char: '睿',
  meta: { theme: '大猩猩撞不開大禮物', cast: '楊捷睿＋大猩猩＋大禮物', gags: ['大猩猩每次衝過去用肚子撞大禮物，都被禮物啵ㄧㄛ地彈回去、一次比一次遠；回馬槍是他第四次衝過來時，楊捷睿輕輕一拉緞帶把禮物打開，大猩猩撲空一頭栽進盒子裡'] },
  duration: 15,
  bg: { top: '#FFE3EC', bottom: '#FFF6E8', floor: '#E9C38F', scenery: 'room' },
  actors: [
    // 大猩猩畫在禮物後面：第四次才能一頭栽「進」盒子裡
    { id: 'ape', emoji: '🦍', x: HOME, y: G, size: 28, pivot: 'center', flip: true },
    { id: 'gift', emoji: '🎁', x: BX, y: BOX, size: 34 },
    // 被拉開的蝴蝶結（打開那一刻從盒子上彈飛）
    { id: 'bow', emoji: '🎀', x: BX, y: 44, size: 14, hidden: true, float: true },
    // 姿勢圖朝左，翻過來面向右邊的大猩猩和禮物（問他時也面向右邊的字）
    { id: 'yang', emoji: 'hero:yang/idle', x: YX, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 楊捷睿登場，抬頭看字框
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 第 1 次：搥胸、衝過去撞——啵ㄧㄛ，傻眼，彈回原地轉一圈
    ...c1.moves,
    { at: H1 + HOLD, actor: 'ape', do: 'moveTo', to: { x: HOME, y: G }, arc: 6, dur: 0.35, ease: 'out' },
    { at: H1 + HOLD, actor: 'ape', do: 'spin', times: -1, dur: 0.35 },
    { at: H1 + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第 2 次：再撞——啵ㄧㄛ，傻眼，滾到畫面邊
    { at: 2.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...c2.moves,
    { at: H2 + HOLD, actor: 'ape', do: 'moveTo', to: { x: 42, y: G }, dur: 0.45, ease: 'out' },
    { at: H2 + HOLD, actor: 'ape', do: 'spin', times: -3, dur: 0.45 },
    // 第 3 次：走回同一個地方——先停一拍：瞪著禮物、禮物抖一下……衝！啵ㄧㄛ！傻眼，被彈上天，過一會兒才掉回來
    { at: 4.75, actor: 'ape', do: 'moveTo', to: { x: HOME, y: G }, dur: 0.4 },
    { at: 5.2, actor: 'ape', do: 'tilt', amount: 8, dur: 0.4 },
    { at: 5.25, actor: 'gift', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: 5.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/think' },
    ...c3.moves,
    { at: H3 + HOLD, actor: 'ape', do: 'moveTo', to: { x: -30, y: -20 }, dur: 0.35, ease: 'out' },
    { at: H3 + HOLD, actor: 'ape', do: 'spin', times: -2, dur: 0.35 },
    { at: 6.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 7.3, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
    // 國字讓到左上方：楊捷睿走到禮物左邊、變大；大猩猩從天上掉回左邊
    { at: 8.1, actor: 'yang', do: 'moveTo', to: { x: BY, y: P }, dur: 0.45 },
    { at: 8.5, actor: 'yang', do: 'scaleTo', amount: BIG, dur: 0.3, ease: 'back' },
    { at: 8.5, actor: 'ape', do: 'moveTo', to: { x: HOME4, y: -45 }, dur: 0.01 },
    { at: 8.55, actor: 'ape', do: 'moveTo', to: { x: HOME4, y: G }, dur: 0.3, ease: 'in' },
    // 他轉向左邊的大猩猩比「等一下」
    { at: 8.85, actor: 'yang', do: 'flip' },
    { at: 8.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
    { at: 8.85, actor: 'yang', do: 'tilt', amount: -6, dur: 0.3 },
    // 輕輕拉蝴蝶結——啵！打開了，氣球冒出來（睿智）
    { at: 9.1, actor: 'yang', do: 'flip' },
    { at: 9.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 9.1, actor: 'yang', do: 'tilt', amount: -8, dur: 0.3 },
    { at: OPEN, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OPEN, actor: 'gift', do: 'swap', emoji: '📦' },
    { at: OPEN, actor: 'gift', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: OPEN, actor: 'bow', do: 'pop' },
    { at: OPEN, actor: 'bow', do: 'moveTo', to: { x: 150, y: -20 }, dur: 0.5, ease: 'out' },
    { at: OPEN, actor: 'bow', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    ...c4.moves,
    // 回馬槍（第 4 次）：大猩猩照樣衝過來——楊捷睿從他頭上跳過去；禮物已經開了，他撲空，一頭栽進盒子
    { at: H4 - 0.28, actor: 'yang', do: 'moveTo', to: { x: 76, y: P }, arc: 22, dur: 0.42, ease: 'inOut' },
    { at: H4, actor: 'ape', do: 'moveTo', to: STUCK, arc: 12, dur: 0.3, ease: 'linear' },
    { at: H4, actor: 'ape', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: H4 + 0.3, actor: 'gift', do: 'squash', amount: 0.3, dur: 0.3 },
    // 腳在外面踢；楊捷睿得意地跳一下
    { at: H4 + 0.35, actor: 'ape', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: H4 + 0.35, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
    // 盒子連同大猩猩滑出畫面（在問他之前退場）
    { at: 10.7, actor: 'gift', do: 'moveTo', to: { x: 200, y: BOX }, dur: 0.35, ease: 'in' },
    { at: 10.7, actor: 'ape', do: 'moveTo', to: { x: 200 + STUCK.x - BX, y: STUCK.y }, dur: 0.35, ease: 'in' },
    // 問他：他變大、走到左前方，轉向觀眾
    { at: 11.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 11.15, actor: 'yang', do: 'scaleTo', amount: 1.5 / BIG, dur: 0.3, ease: 'back' },
    { at: 11.15, actor: 'yang', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.15, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.65, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.15, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.6, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.6, actor: 'yang', do: 'hop', amount: 6, dur: 0.2 },
    // 退場，畫面只留下字
    { at: 13.78, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.78, actor: 'yang', do: 'flip' },
    { at: 13.78, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：禮物被撞得彈一下，包裝上的一塊彈出來
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2, 3, 4], from: 'gift', color: partColor('睿頭') },
    { at: H2 + 0.05, dur: 0.55, strokes: [5, 6, 7, 8], from: 'gift', color: partColor('睿頭') },
    // 第 3 次：傻眼睜大的眼睛變成「目」
    { at: H3 + 0.1, dur: 0.6, strokes: [9, 10, 11, 12, 13], from: 'ape', color: partColor('目') },
  ],
  glyph: [
    { at: 7.2, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到左上方，右邊給禮物、盒子
    { at: 8.05, dur: 0.45, do: 'park', to: { x: 40, y: 19.5 } },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: 11.1, dur: 2.88, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 11.15, dur: 0.4, do: 'home' },
    { at: 13.6, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.45, kind: 'pop', actor: 'yang', emoji: '❗', dx: -2, dur: 0.5, scale: 1.4 },
    ...c1.fx,
    ...c2.fx,
    { at: 4.2, kind: 'dizzy', actor: 'ape', dur: 0.5 },
    // 第 3 次前停一拍：他瞪著禮物
    { at: 5.2, kind: 'pop', actor: 'ape', emoji: '😤', dx: -10, dy: -4, dur: 0.5, scale: 1.8 },
    ...c3.fx,
    { at: 8.85, kind: 'dizzy', actor: 'ape', dur: 0.45 },
    // 「等一下」
    // 手邊短短一段緞帶：輕輕一拉
    { at: 9.05, dur: OPEN - 9.05 + 0.03, kind: 'line', actor: 'gift', to: { x: BY + 9, y: 54 }, color: '#F5B700', width: 2.6, dy: 2 },
    // 啵！打開了：氣球、✨ 一圈冒出來
    { at: OPEN, kind: 'burst', actor: 'gift', emoji: '🎈', n: 7, dur: 0.7, scale: 1.7 },
    { at: OPEN + 0.05, kind: 'burst', actor: 'gift', emoji: '✨', n: 8, dur: 0.6, scale: 1.4 },
    ...c4.fx,
    { at: H4 + 0.3, kind: 'burst', x: STUCK.x, y: 44, n: 1, dur: 0.4, scale: 2.8 },
    { at: H4 + 0.35, kind: 'pop', x: STUCK.x - 24, y: 44, emoji: '😳', dur: 0.65, scale: 2.2 },
    { at: H4 + 0.35, kind: 'burst', actor: 'yang', emoji: '⭐', n: 6, dur: 0.5 },
    { at: 13.6, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...c1.camera,
    ...c2.camera,
    ...c3.camera,
    { at: 8.85, dur: 0.3, do: 'shake', amount: 1.5 },
    { at: H4 + 0.3, dur: 0.45, do: 'punch', amount: 0.25, to: { x: STUCK.x, y: 50 } },
    { at: H4 + 0.3, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: 7.2, dur: 0.05, level: -0.35 },
    { at: 7.25, dur: 0.35, level: 0 },
    { at: OPEN, dur: 0.04, level: -0.3 },
    { at: OPEN + 0.04, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '睿' },
    ...c1.cues,
    ...c2.cues,
    ...c3.cues,
    { at: 8.85, sfx: 'plop' },
    { at: 7.3, say: '睿' },
    ...c4.cues,
    { at: OPEN, sfx: 'poof' },
    { at: OPEN + 0.02, sfx: 'blip' },
    { at: OPEN + 0.05, say: '睿智' },
    { at: H4 + 0.3, sfx: 'boing' },
    { at: H4 + 0.34, sfx: 'bonk' },
    { at: H4 + 0.38, sfx: 'crack' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: 13.6, say: '睿' },
    { at: 13.65, sfx: 'cheer' },
  ],
}

export default clip
