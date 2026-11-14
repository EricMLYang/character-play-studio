import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 足（v2）：豬探長要把超大足球踢進球門——每次他大腳一踢，球「啵~」地一彈，反而把他彈回去，一次比一次遠：
// 一屁股跌坐（口從他張大的嘴巴喊出來）、滾到畫面邊（足的下半，從他的腳蹦出來）、先停一拍再踢，彈上天（足的最後兩筆）。
// 回馬槍：他助跑一腳，球真的進了球門！他得意——球網一彈，球原路射回來，把他壓扁。
// 最後畫面暗下來只剩「足」，豬探長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「足！」，然後退場只留字。
// 足、足、足球、這是什麼字？、足
const P = 66.9 // 豬探長（size 24）站在地上的 y
/** 大足球（size 34）滾在地上的 y */
const BS = 34
const BY = 77 - 0.42 * BS
/** 大足球平常待的地方（畫面中間偏右） */
const BX = 104
/** 前三次都站在同一個地方踢：球的左邊 */
const KICK = 74
/** 第四次：球滾到正中間、變大以後，他站的地方 */
const BX4 = 88
const BIG = 1.12
const KICK4 = 62
/** 球門在右邊 */
const GX = 142
/** 他每次出發的地方 */
const HOME = 46
/** 被彈到以後傻眼停多久，才飛出去 */
const HOLD = 0.45
/** 腳往後抬多久（預備） */
const WIND = 0.3
/** 鞋子的顏色（腳甩過去的弧線） */
const SHOE = '#5A3A22'

/**
 * 「踢—啵」：他往後一縮、腳往後抬（預備）→ 大腳一甩（咖啡色的弧線）踢中球那一刻，腳尖冒 💥、球被踢扁、鏡頭推近＋震、同一個音效，
 * 球「啵」地彈回原狀把他彈開，他傻眼停 HOLD 秒（看得見臉）才飛出去。k 是第幾次（越後面越大），x 是他站的地方。
 * 第 4 次（bounce: false）球真的被踢飛了，他沒有被彈。
 */
function kick(at: number, k: number, x = KICK, bounce = true) {
  const foot = { x: x + 11, y: 71 }
  const moves: Move[] = [
    // 預備：身體往後縮、往後仰，腳抬起來
    { at: at - WIND, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: at - WIND, actor: 'pig', do: 'squash', amount: -0.2, dur: WIND },
    { at: at - WIND, actor: 'pig', do: 'rotateTo', amount: -14, dur: WIND * 0.6 },
    // 踢！身體往前一甩
    { at: at - 0.06, actor: 'pig', do: 'rotateTo', amount: 22, dur: 0.08, ease: 'in' },
    { at: at + 0.12, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.15 },
    // 球被踢扁
    { at, actor: 'ball', do: 'squash', amount: 0.22 + 0.06 * k, dur: 0.22 },
  ]
  if (bounce) moves.push(
    // 啵！球彈回原狀，把他彈開：傻眼
    { at: at + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: at + 0.1, actor: 'pig', do: 'squash', amount: 0.2 + 0.08 * k, dur: 0.25 },
    { at: at + 0.1, actor: 'ball', do: 'bounce', amount: 1.5 + 0.5 * k, times: 1, dur: 0.3 },
  )
  const fx: Fx[] = [
    // 腳甩過去的弧（從屁股往前下方甩到腳尖）
    { at: at - 0.2, kind: 'swoosh', actor: 'pig', to: { x: x + 30, y: 74 }, dx: 3, dy: 13, n: 9, sweep: 110, windup: 0.08, dur: 0.32,
      scale: 1 + 0.1 * k, color: SHOE, width: 4.5, low: true },
    // 💥 每次都在腳尖踢中的同一個位置，一次比一次大
    { at, kind: 'burst', x: foot.x + 3, y: foot.y - 3, n: 1, dur: 0.35, scale: 1.4 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: foot.x, y: k >= 3 ? 40 : P - 6 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效（踢＋啵），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'tap' }]
  if (bounce) cues.push({ at: at + 0.08, sfx: 'boing' })
  if (k >= 1) cues.push({ at: at + 0.12, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.16, sfx: 'whoosh' })
  return { moves, fx, camera, cues, foot }
}

const H1 = 1.55, H2 = 3.45, H3 = 5.95, H4 = 9.35
const s1 = kick(H1, 0)
const s2 = kick(H2, 1)
const s3 = kick(H3, 2)
const s4 = kick(H4, 3, KICK4, false)
/** 傻眼完，飛出去的時刻 */
const R1 = H1 + 0.1 + HOLD, R2 = H2 + 0.1 + HOLD, R3 = H3 + 0.1 + HOLD
/** 第四次：球進網、網子一彈，球射回來壓扁他 */
const NET = H4 + 0.25
const SQ = NET + 0.5

const clip: Clip = {
  format: 2,
  char: '足',
  meta: { theme: '豬探長踢超大足球', cast: '豬探長＋大足球＋球門', gags: ['豬探長每次大腳一踢足球，球啵地一彈反而把他彈回去，一次比一次遠（跌坐、滾到畫面邊、彈上天）；回馬槍是他助跑一腳真的踢進球門，正得意，球網一彈球射回來把他壓扁'] },
  duration: 15,
  bg: { top: '#CDEBFF', bottom: '#F2FAFF', floor: '#8CCB6E', scenery: 'track' },
  actors: [
    { id: 'goal', emoji: '🥅', x: GX, y: 77 - 0.42 * 26, size: 26 },
    // 新的豬探長圖朝左，翻過來朝右：面向右邊的球（問他時也面向右邊的字）
    { id: 'pig', emoji: 'hero:pig/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    // 大足球畫在他前面：第四次壓在他身上
    { id: 'ball', emoji: '⚽', x: BX, y: BY, size: BS, pivot: 'center' },
  ],
  moves: [
    // 豬探長登場：看我一腳踢進去！
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 第 1 次：走到球旁邊——踢！啵，傻眼，一屁股跌坐
    { at: 0.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 0.85, actor: 'pig', do: 'moveTo', to: { x: KICK, y: P }, dur: 0.4 },
    ...s1.moves,
    { at: R1, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.05 },
    { at: R1, actor: 'pig', do: 'moveTo', to: { x: HOME + 4, y: P }, arc: 10, dur: 0.3, ease: 'out' },
    { at: R1 + 0.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
    // 第 2 次：爬起來再走過去——踢！啵，彈得更遠，滾到畫面邊
    { at: 2.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/angry' },
    { at: 2.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 2.8, actor: 'pig', do: 'moveTo', to: { x: KICK, y: P }, dur: 0.35 },
    ...s2.moves,
    { at: R2, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.05 },
    { at: R2, actor: 'pig', do: 'moveTo', to: { x: 16, y: P }, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'pig', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: R2 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 第 3 次：走回同一個地方——先停一拍：托下巴看球、球晃一下……踢！
    { at: 4.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 4.75, actor: 'pig', do: 'moveTo', to: { x: KICK, y: P }, dur: 0.5 },
    { at: 5.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: 5.3, actor: 'ball', do: 'rotateTo', amount: -10, dur: 0.2 },
    { at: 5.5, actor: 'ball', do: 'rotateTo', amount: 10, dur: 0.15 },
    ...s3.moves,
    // 啵！彈上天（往左上飛出畫面），過一會兒才掉回來
    { at: R3, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.05 },
    { at: R3, actor: 'pig', do: 'moveTo', to: { x: 20, y: -45 }, dur: 0.35, ease: 'out' },
    { at: R3, actor: 'pig', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    { at: 6.95, actor: 'pig', do: 'moveTo', to: { x: 30, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'pig', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 球骨碌碌滾到右邊（讓出正中央給拼好的國字）
    { at: 6.75, actor: 'ball', do: 'moveTo', to: { x: 122, y: BY }, dur: 0.45, ease: 'out' },
    { at: 6.75, actor: 'ball', do: 'rotateTo', amount: 80, dur: 0.45, ease: 'out' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，球滾到正中間、變大
    { at: 8.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.35, actor: 'ball', do: 'moveTo', to: { x: BX4, y: BY }, dur: 0.4 },
    { at: 8.35, actor: 'ball', do: 'rotateTo', amount: -150, dur: 0.4 },
    { at: 8.35, actor: 'ball', do: 'scaleTo', amount: BIG, dur: 0.35, ease: 'back' },
    { at: 8.75, actor: 'ball', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.4, actor: 'pig', do: 'moveTo', to: { x: 46, y: P }, dur: 0.3 },
    { at: 8.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/doubt' },
    // 回馬槍（第 4 次）：助跑一腳——球真的飛進球門！
    { at: 9.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: 9.0, actor: 'pig', do: 'moveTo', to: { x: KICK4, y: P }, dur: 0.25, anticipate: 4, ease: 'in' },
    ...s4.moves,
    { at: H4 + 0.02, actor: 'ball', do: 'moveTo', to: { x: GX - 2, y: BY + 2 }, arc: 10, dur: 0.23, ease: 'out' },
    { at: H4 + 0.02, actor: 'ball', do: 'scaleTo', amount: 0.62 / BIG, dur: 0.23 },
    { at: H4 + 0.02, actor: 'ball', do: 'spin', times: 2, dur: 0.23 },
    { at: H4 + 0.2, actor: 'pig', do: 'rotateTo', amount: 0, dur: 0.05 },
    { at: H4 + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 球網一彈……球原路射回來，壓扁他
    { at: NET, actor: 'goal', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: NET + 0.1, actor: 'goal', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: NET + 0.25, actor: 'ball', do: 'moveTo', to: { x: KICK4, y: P - 4 }, arc: 14, dur: 0.25, ease: 'in' },
    { at: NET + 0.25, actor: 'ball', do: 'scaleTo', amount: 1.3, dur: 0.25 },
    { at: NET + 0.25, actor: 'ball', do: 'spin', times: -2, dur: 0.25 },
    { at: NET + 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: SQ, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: SQ, actor: 'pig', do: 'squash', amount: 0.45, dur: 0.4 },
    { at: SQ, actor: 'ball', do: 'squash', amount: 0.25, dur: 0.25 },
    // 球從他身上彈走，滾出右邊
    { at: SQ + 0.3, actor: 'ball', do: 'moveTo', to: { x: 210, y: BY }, arc: 16, dur: 0.4, ease: 'in' },
    { at: SQ + 0.3, actor: 'ball', do: 'spin', times: 2, dur: 0.4 },
    { at: SQ + 0.3, actor: 'goal', do: 'moveTo', to: { x: 210, y: 77 - 0.42 * 26 }, dur: 0.01 },
    // 問他：豬探長撐起來、走到左前方、變大，轉向觀眾
    { at: 10.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.75, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.3, ease: 'back' },
    { at: 10.75, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 11.95, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.45, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.72, actor: 'pig', do: 'flip' },
    { at: 13.75, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：被彈到大叫「啊！」，口從他張大的嘴巴飛出來
    { at: H1 + 0.15, dur: 0.6, strokes: [0, 1, 2], from: 'pig', color: partColor('口') },
    // 第 2、3 次：足的下半從踢球的那隻腳蹦出來
    { at: H2 + 0.05, dur: 0.6, strokes: [3, 4], from: s2.foot, color: partColor('足') },
    { at: H3 + 0.05, dur: 0.6, strokes: [5, 6], from: s3.foot, color: partColor('足') },
  ],
  glyph: [
    { at: 7.45, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.3, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 10.6, dur: 3.35, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.65, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：看我的！
    { at: 0.5, kind: 'pop', actor: 'pig', emoji: '😤', dx: -14, dur: 0.4, scale: 1.4 },
    ...s1.fx,
    { at: R1 + 0.3, kind: 'sweat', actor: 'pig' },
    ...s2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'pig', dur: 0.45 },
    // 第 3 次前停一拍：他看一眼球
    { at: 5.25, kind: 'pop', actor: 'pig', emoji: '👀', dx: -12, dur: 0.5, scale: 1.5 },
    ...s3.fx,
    { at: H3, kind: 'burst', x: s3.foot.x + 3, y: s3.foot.y - 3, emoji: '⭐', n: 6, dur: 0.35 },
    { at: 7.3, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    ...s4.fx,
    // 進了！
    { at: H4 + 0.25, kind: 'burst', x: GX - 4, y: 60, emoji: '⭐', n: 6, dur: 0.4 },
    { at: SQ, kind: 'burst', x: KICK4 - 10, y: P - 12, n: 1, dur: 0.35, scale: 2.6 },
    { at: SQ, kind: 'burst', x: KICK4 - 10, y: P - 12, emoji: '⭐', n: 8, dur: 0.45 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    ...s4.camera,
    { at: SQ, dur: 0.45, do: 'punch', amount: 0.14, to: { x: KICK4, y: 40 } },
    { at: SQ, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    { at: 7.45, dur: 0.05, level: -0.35 },
    { at: 7.5, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '足' },
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    { at: 7.3, sfx: 'plop' },
    { at: 7.55, say: '足' },
    { at: 8.75, say: '足球' },
    ...s4.cues,
    { at: H4 + 0.25, sfx: 'cheer' },
    { at: NET, sfx: 'boing' },
    { at: SQ, sfx: 'bonk' },
    { at: SQ + 0.04, sfx: 'boing' },
    { at: SQ + 0.08, sfx: 'whoosh' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '足' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
