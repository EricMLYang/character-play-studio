import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 急（v2）：浣熊花生尿急，夾著腿、手按肚子憋著（hold）——每次衝向廁所，一頭撞上鎖著的門（門上冒出紅色「使用中」牌），「砰」地被彈回來，一次比一次遠：
// 彈回原地（刍的上半 ⺈ 甩出來）、滾到畫面邊（刍的下半 彐）、先停一拍（憋到原地亂跳、抖得最厲害）再衝，被彈上天（心）。
// 回馬槍：廁所門終於打開了（看得到裡面的馬桶）！他衝太快，直接衝過頭撞上裡面的牆，又「砰」地被彈出來，門在他面前關上。
// 最後畫面暗下來只剩「急」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「急！」，門一開他衝進廁所，畫面只留字。
// 急、急、緊急、這是什麼字？、急
const P = 66.9 // 花生（size 24）站在地上的 y
/** 廁所門（prop:wc-door／wc-open）的大小：比花生高一倍多，一眼看得出是廁所 */
const DOOR = 58
const D = 77 - 0.42 * DOOR
/** 廁所門在右邊（左緣約 x 113，國字 home 時不擋字） */
const DX = 132
/** 打開的門（wc-open）門板往左凸出去，圖往右偏：同一個 size，x 往左移 0.074 × size 門框才對得齊（assets/prop-sheets/README.md） */
const OX = DX - 0.074 * DOOR
/**
 * 門上冒出「使用中」牌（prop:busy）：中心對在門板正中、門牌與門把之間（x DX、y 58）。
 * fx pop 畫在錨點的 (+6, −6)，scale 又以錨點放大，所以錨點要照 scale 往回扣。
 */
function busy(at: number, dur: number, scale: number): Fx {
  return { at, kind: 'pop', x: DX - 6 * scale, y: 58 + 6 * scale, emoji: 'prop:busy', dur, scale }
}
/** 花生每次出發的地方 */
const HOME = 36
/** 前三次都衝到同一個地方：一頭撞上門 */
const REACH = 104
/** 撞上以後傻眼停多久，才被彈走 */
const HOLD = 0.45
/** 語詞那一刻他放大多少 */
const BIG = 1.3

/**
 * 「砰」：衝過去（dash，先往後縮）→ 一頭撞上鎖著的門 → 那一刻 💥＋門上冒「使用中」牌＋門震＋鏡頭推近＋震＋同一個音效，
 * 花生傻眼停 HOLD 秒（看得見臉）才被彈走。k 是第幾次（越後面越大）。
 */
function bump(at: number, k: number) {
  const moves: Move[] = [
    { at: at - 0.42, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: at - 0.42, actor: 'raccoon', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at, actor: 'raccoon', do: 'squash', amount: 0.22 + 0.08 * k, dur: 0.25 },
    { at, actor: 'door', do: 'shake', amount: 1.2 + 0.4 * k, dur: 0.35 },
  ]
  const fx: Fx[] = [
    // 💥 在他撞到門的地方（頭的右邊），不蓋住他的臉，一次比一次大
    { at, kind: 'burst', x: REACH + 11, y: P - 14, n: 1, dur: 0.4, scale: 1.5 + 0.35 * k },
    // 門鎖著：門上冒出紅色「使用中」牌，停到他被彈走，一次比一次大
    busy(at + 0.05, HOLD, 1.5 + 0.2 * k),
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: REACH + 8, y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

const H1 = 1.6, H2 = 3.35, H3 = 6.0
const b1 = bump(H1, 0)
const b2 = bump(H2, 1)
const b3 = bump(H3, 2)
/** 被彈走的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD
/** 回馬槍：門打開、他衝進去撞上裡面的牆（畫面外）、被彈出來、門關上 */
const OPEN = 9.05, H4 = 9.75, OUT = 9.95, SHUT = 10.22

/** 門打開：換成打開的那張（門框對齊要往左移一點），彈一下 */
function openDoor(at: number): Move[] {
  return [
    { at, actor: 'door', do: 'swap', emoji: 'prop:wc-open' },
    { at, actor: 'door', do: 'moveTo', to: { x: OX, y: D }, dur: 0.01 },
    { at, actor: 'door', do: 'hop', amount: 1.5, dur: 0.2 },
  ]
}
/** 門砰地關上：換回關著的那張，壓一下 */
function shutDoor(at: number): Move[] {
  return [
    { at, actor: 'door', do: 'swap', emoji: 'prop:wc-door' },
    { at, actor: 'door', do: 'moveTo', to: { x: DX, y: D }, dur: 0.01 },
    { at, actor: 'door', do: 'squash', amount: 0.15, dur: 0.2 },
  ]
}

const clip: Clip = {
  format: 2,
  char: '急',
  meta: { theme: '尿急搶廁所', cast: '浣熊花生＋廁所門', gags: ['花生尿急，每次夾著腿衝向廁所，一頭撞上鎖著的門砰地被彈回來，一次比一次遠、憋得一次比一次誇張；回馬槍是門終於開了，他衝太快撞上裡面的牆又砰地被彈出來，門在他面前關上'] },
  duration: 15,
  bg: { top: '#CFEAF2', bottom: '#F2FAFC', floor: '#BCD6DE', scenery: 'room' },
  actors: [
    { id: 'door', emoji: 'prop:wc-door', x: DX, y: D, size: DOOR },
    // 姿勢圖朝左，翻過來面向右邊的廁所（問他時也面向右邊的字）
    { id: 'raccoon', emoji: 'hero:raccoon/hold', x: HOME, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 花生衝進來，煞住、夾著腿憋尿，小小跳兩下：廁所在那裡！
    { at: 0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -25, y: P }, dur: 0.4, ease: 'out' },
    { at: 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hold' },
    { at: 0.5, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 0.7, actor: 'raccoon', do: 'hop', amount: 1.2, dur: 0.16 },
    { at: 0.88, actor: 'raccoon', do: 'hop', amount: 1.2, dur: 0.16 },
    // 第 1 次：衝過去——砰！彈回原地，又夾著腿憋，抖得更厲害
    ...b1.moves,
    { at: R1, actor: 'raccoon', do: 'moveTo', to: { x: HOME, y: P }, arc: 8, dur: 0.35, ease: 'out' },
    { at: R1, actor: 'raccoon', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    { at: R1 + 0.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hold' },
    { at: R1 + 0.4, actor: 'raccoon', do: 'shake', amount: 1.3, dur: 0.5 },
    { at: R1 + 0.5, actor: 'raccoon', do: 'hop', amount: 1.8, dur: 0.16 },
    { at: R1 + 0.68, actor: 'raccoon', do: 'hop', amount: 1.8, dur: 0.16 },
    // 第 2 次：再衝——砰！彈得更遠，滾到畫面邊
    ...b2.moves,
    { at: R2, actor: 'raccoon', do: 'moveTo', to: { x: 20, y: P }, arc: 16, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'raccoon', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: R2 + 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 憋不住了：夾著腿回到老地方，原地小跳
    { at: 4.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hold' },
    { at: 4.6, actor: 'raccoon', do: 'moveTo', to: { x: HOME, y: P }, dur: 0.35 },
    { at: 4.95, actor: 'raccoon', do: 'hop', amount: 2.5, dur: 0.18 },
    { at: 5.13, actor: 'raccoon', do: 'hop', amount: 2.5, dur: 0.18 },
    // 第 3 次前停一拍：憋到原地亂跳、抖得最厲害（看門一眼）……衝！
    { at: 5.3, actor: 'raccoon', do: 'shake', amount: 2.4, dur: 0.3 },
    { at: 5.3, actor: 'raccoon', do: 'hop', amount: 3.5, dur: 0.15 },
    { at: 5.45, actor: 'raccoon', do: 'hop', amount: 3.5, dur: 0.15 },
    ...b3.moves,
    // 砰！彈上天（往左上飛出畫面），過一會兒才掉回來
    { at: R3, actor: 'raccoon', do: 'moveTo', to: { x: 20, y: -50 }, dur: 0.4, ease: 'out' },
    { at: R3, actor: 'raccoon', do: 'spin', times: -2, dur: 0.4, pivot: 'center' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，他掉回中間、變大，夾著腿憋到發抖：緊急！
    { at: 8.0, actor: 'raccoon', do: 'moveTo', to: { x: 62, y: -50 }, dur: 0.01 },
    { at: 8.0, actor: 'raccoon', do: 'scaleTo', amount: BIG, dur: 0.01 },
    { at: 8.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hold' },
    { at: 8.05, actor: 'raccoon', do: 'moveTo', to: { x: 62, y: P }, dur: 0.3, ease: 'in' },
    { at: 8.4, actor: 'raccoon', do: 'shake', amount: 2, dur: 0.6 },
    // 回馬槍（第 4 次）：門打開了（看得到裡面的馬桶）！他開心得跳起來，衝——衝太快，撞上裡面的牆，砰！被彈出來，門在他面前關上
    ...openDoor(OPEN),
    { at: OPEN + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: OPEN + 0.05, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.25 },
    { at: H4 - 0.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: H4 - 0.4, actor: 'raccoon', do: 'moveTo', to: { x: 190, y: P }, dur: 0.4, anticipate: 5, ease: 'in' },
    { at: OUT, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: OUT, actor: 'raccoon', do: 'moveTo', to: { x: 58, y: P }, arc: 14, dur: 0.45, ease: 'out' },
    { at: OUT, actor: 'raccoon', do: 'spin', times: -2, dur: 0.45, pivot: 'center' },
    ...shutDoor(SHUT),
    { at: OUT + 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    // 問他：他爬起來、走到左前方、變大，轉向觀眾
    { at: 10.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 10.75, actor: 'raccoon', do: 'scaleTo', amount: 1.5 / BIG, dur: 0.3, ease: 'back' },
    { at: 10.75, actor: 'raccoon', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.9, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.45, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.95, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 6, dur: 0.25 },
    // 退場：門又打開，他衝進廁所，門關上、整扇門縮掉，畫面只留下字
    ...openDoor(13.55),
    { at: 13.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 13.6, actor: 'raccoon', do: 'moveTo', to: { x: OX + 2, y: P + 4 }, dur: 0.2, ease: 'in' },
    { at: 13.8, actor: 'raccoon', do: 'vanish', dur: 0.06 },
    ...shutDoor(13.82),
    { at: 13.84, actor: 'door', do: 'vanish', dur: 0.12 },
  ],
  builds: [
    // 第 1、2 次：一頭撞上門、被彈回來時甩出來——刍（急的上半）
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1], from: 'raccoon', color: partColor('刍') },
    { at: H2 + 0.05, dur: 0.55, strokes: [2, 3, 4], from: 'raccoon', color: partColor('刍') },
    // 第 3 次：急到心臟怦怦跳，撞上去那一下心從他胸口蹦出來——心
    { at: H3 + 0.05, dur: 0.6, strokes: [5, 6, 7, 8], from: 'raccoon', color: partColor('心') },
  ],
  glyph: [
    { at: 7.25, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.1, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: 10.7, dur: 3.3, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.75, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    ...b2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'raccoon', dur: 0.4 },
    ...b3.fx,
    // 緊急：警報燈在他旁邊亮起來
    { at: 8.4, kind: 'pop', x: 30, y: 46, emoji: '🚨', dur: 0.8, scale: 3.6 },
    // 門打開
    { at: OPEN, kind: 'burst', x: DX, y: 46, emoji: '✨', n: 6, dur: 0.4 },
    // 撞上裡面的牆（畫面外）：最大的 💥
    { at: H4, kind: 'burst', x: 141, y: P - 16, n: 1, dur: 0.45, scale: 2.6 },
    // 門砰地關上
    { at: SHUT, kind: 'burst', x: DX - 10, y: 62, n: 1, dur: 0.35, scale: 2 },
    busy(SHUT + 0.05, 0.5, 2.3),
    { at: 13.45, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 前兩次：自動取景會推近到他、把右邊的廁所門切掉一角——劇本自己「推近」一點點（幾乎是全景），自動取景就讓出來，整扇門都在
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    // 第 3 次：自動取景會預先往上看他飛上天、或推近切到門——這段一樣幾乎全景，地上的他和整扇廁所門都在，飛走後再交回
    { at: 5.6, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b3.camera,
    { at: 6.85, dur: 0.35, do: 'zoom', amount: 1 },
    // 回馬槍：國字拼好後自動取景會靠向他、切掉打開的門——這段也幾乎全景，打開的門（看得到馬桶）整個在畫面裡
    { at: 8.95, dur: 0.25, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    { at: H4, dur: 0.4, do: 'shake', amount: 2.4 },
    { at: SHUT, dur: 0.3, do: 'shake', amount: 1.6 },
    { at: 10.5, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次撞上門白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.25, dur: 0.05, level: -0.35 },
    { at: 7.3, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '急' },
    ...[H1, H2, H3].map((at): Cue => ({ at: at - 0.42, sfx: 'whoosh' })),
    ...b1.cues,
    ...b2.cues,
    ...b3.cues,
    ...[R1, R2, R3].map((at): Cue => ({ at, sfx: 'boing' })),
    { at: 7.35, say: '急' },
    { at: 8.35, sfx: 'plop' },
    { at: 8.45, say: '緊急' },
    { at: OPEN, sfx: 'whoosh' },
    { at: H4, sfx: 'bonk' },
    { at: H4 + 0.04, sfx: 'boing' },
    { at: H4 + 0.08, sfx: 'crack' },
    { at: H4 + 0.12, sfx: 'rumble' },
    { at: SHUT, sfx: 'bonk' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '急' },
    { at: 13.5, sfx: 'cheer' },
    { at: 13.65, sfx: 'whoosh' },
  ],
}

export default clip
