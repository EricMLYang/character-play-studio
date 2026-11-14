import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 貓（v2 樣板）：大貓在睡覺，豬探長想摸牠——每次手一伸過去，貓尾巴「啪」一下把他拍飛。同一個笑點四次，只有結果越來越大：
// 轉一圈（豸從貓身上跳出來）、滾進草叢（艹）、先停一拍再被拍上天、掉進稻田（田）；貓咪醒了蹭他，他得意地摸到了——尾巴從另一邊繞過來「啪」。
// 最後畫面暗下來只剩「貓」，豬探長從天上掉到前面、轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著它說「貓！」，然後退場只留字。
// 貓、貓、貓咪、這是什麼字？、貓
const P = 66.9 // 豬探長（size 24）站在地上的 y
const C = 62.7 // 大貓（size 34）
const B = 71.1 // 草叢、稻田（size 14）
/** 前三次都站在同一個地方伸手：大貓尾巴那一側（貓在右邊、尾巴朝左） */
const REACH = 104
/** 第四次：大貓走到正中間蹭他以後，他站的地方 */
const REACH4 = 62
/** 尾巴的顏色（跟 3D 的橘貓同色） */
const TAIL = '#F08A2C'
/** 打中以後傻眼停多久，才開始飛 */
const HOLD = 0.45
/** 尾巴先翹起來停多久（預備） */
const WIND = 0.2

/**
 * 尾巴「啪」：尾巴往反方向翹起來停一下（預備）→ 一條橘色的尾巴甩過去 → 打中那一刻 💥＋鏡頭推近＋震＋同一個音效，
 * 豬探長傻眼停 HOLD 秒（看得見臉）才飛出去。k 是第幾次（越後面越大），sweep 是尾巴甩多大圈，x 是他站的地方。
 */
function swat(at: number, k: number, sweep = 110, x = REACH) {
  const moves: Move[] = [
    { at: at - WIND - 0.15, actor: 'cat', do: 'shake', amount: 1 + 0.25 * k, dur: 0.2 },
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 打中那一下被拍扁；第 4 次扁得最久（在原地被打扁、傻眼，才飛出去）
    { at, actor: 'pig', do: 'squash', amount: 0.25 + 0.1 * k, dur: k >= 3 ? HOLD : 0.25 },
  ]
  const fx: Fx[] = [
    { at: at - WIND - 0.135, kind: 'swoosh', actor: 'cat', target: 'pig', dx: -14, dy: 10, n: 15, sweep, windup: WIND, dur: WIND + 0.27,
      scale: 1 + 0.12 * k, color: TAIL, width: 4.2 },
    // 💥 每次都在他頭上同一個位置（不跟著他飛走，才不會被畫面切掉），一次比一次大
    { at, kind: 'burst', x, y: P - 13, n: 1, dur: 0.4, scale: 1.5 + 0.35 * k },
  ]
  const camera: Camera[] = [
    // 推近到打中的位置；國字拼好以後（第 4 次）往上對一點，國字才不會被推出畫面
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.06 * k, to: { x, y: k >= 3 ? 40 : P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'whoosh' })
  return { moves, fx, camera, cues }
}

const H1 = 1.55, H2 = 3.4, H3 = 5.95, H4 = 9.9
const s1 = swat(H1, 0)
const s2 = swat(H2, 1)
const s3 = swat(H3, 2)
// 回馬槍：尾巴從另一邊（貓背上方）繞過來甩
const s4 = swat(H4, 3, 150, REACH4)

const clip: Clip = {
  format: 2,
  char: '貓',
  meta: { theme: '豬探長想摸大貓', cast: '豬探長＋大貓＋草叢＋稻田', gags: ['豬探長每次伸手摸貓都被尾巴啪一下拍飛，一次比一次飛得遠；回馬槍是貓咪醒來蹭他、他摸到了，尾巴卻從另一邊繞過來啪'] },
  duration: 15,
  bg: { top: '#FFE3C2', bottom: '#FFF7EC', floor: '#B5D88A', scenery: 'hills' },
  actors: [
    { id: 'bush', emoji: '🌿', x: 14, y: B, size: 14 },
    { id: 'field', emoji: '🌾', x: 32, y: B, size: 14 },
    { id: 'cat', emoji: '🐈', x: 124, y: C, size: 34, flip: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: 84, y: P, size: 24, hidden: true },
  ],
  moves: [
    // 豬探長登場：好可愛的貓，想摸！
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    // 第 1 次：伸手——啪，傻眼，轉一圈退回去
    { at: 0.8, actor: 'pig', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.4 },
    { at: 1.2, actor: 'pig', do: 'tilt', amount: 12, dur: 0.3 },
    ...s1.moves,
    { at: H1 + HOLD, actor: 'pig', do: 'moveTo', to: { x: 84, y: P }, arc: 6, dur: 0.3, ease: 'out' },
    { at: H1 + HOLD, actor: 'pig', do: 'spin', times: -1, dur: 0.3, pivot: 'center' },
    // 第 2 次：躡手躡腳再來——啪，傻眼，整個人滾到畫面邊、滾進草叢
    { at: 2.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 2.5, actor: 'pig', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.5, ease: 'inOut' },
    ...[2.52, 2.69, 2.86].map((at): Move => ({ at, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.16 })),
    { at: 3.0, actor: 'pig', do: 'tilt', amount: 12, dur: 0.3 },
    ...s2.moves,
    { at: H2 + HOLD, actor: 'pig', do: 'moveTo', to: { x: 18, y: P }, dur: 0.45, ease: 'out' },
    { at: H2 + HOLD, actor: 'pig', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: 4.3, actor: 'bush', do: 'shake', amount: 1.5, dur: 0.2 },
    { at: 4.45, actor: 'bush', do: 'vanish', dur: 0.2 },
    { at: 4.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 第 3 次：走回同一個地方，舉起手——先停一拍：看一眼尾巴、尾巴抖一下、翹起來……啪！傻眼，飛上天，過一會兒才掉進稻田
    { at: 4.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 4.7, actor: 'pig', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.5 },
    { at: 5.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 5.3, actor: 'pig', do: 'tilt', amount: -8, dur: 0.45 },
    { at: 5.3, actor: 'cat', do: 'shake', amount: 0.6, dur: 0.25 },
    ...s3.moves,
    { at: H3 + HOLD, actor: 'pig', do: 'moveTo', to: { x: REACH, y: -45 }, dur: 0.35, ease: 'out' },
    { at: H3 + HOLD, actor: 'pig', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    // 在天上（畫面外）飄到稻田正上方，過一會兒才掉下來
    { at: 6.85, actor: 'pig', do: 'moveTo', to: { x: 32, y: -45 }, dur: 0.01 },
    { at: 7.0, actor: 'pig', do: 'moveTo', to: { x: 32, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'pig', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 7.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 7.3, actor: 'field', do: 'squash', amount: 0.6, dur: 0.2 },
    { at: 7.45, actor: 'field', do: 'vanish', dur: 0.2 },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，大貓醒來、走過來蹭他
    { at: 8.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.65, actor: 'pig', do: 'moveTo', to: { x: REACH4, y: P }, dur: 0.4 },
    { at: 8.6, actor: 'cat', do: 'hop', amount: 4, dur: 0.25 },
    { at: 8.75, actor: 'cat', do: 'moveTo', to: { x: 84, y: C }, dur: 0.35 },
    { at: 8.75, actor: 'cat', do: 'scaleTo', amount: 1.1, dur: 0.3, ease: 'back' },
    { at: 9.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 9.1, actor: 'cat', do: 'tilt', amount: -10, dur: 0.35 },
    // 回馬槍（第 4 次）：得意地伸手，摸到了——尾巴從另一邊繞過來啪！先被打扁、傻眼，再飛上天
    { at: 9.4, actor: 'pig', do: 'tilt', amount: 12, dur: 0.3 },
    ...s4.moves,
    { at: H4 + HOLD, actor: 'pig', do: 'moveTo', to: { x: 22, y: -50 }, dur: 0.3, ease: 'out' },
    { at: H4 + HOLD, actor: 'pig', do: 'spin', times: -3, dur: 0.3, pivot: 'center' },
    // 大貓心滿意足走出右邊（在國字讓位到右邊之前就走掉，不經過國字後面）
    { at: 10.2, actor: 'cat', do: 'moveTo', to: { x: 200, y: C }, dur: 0.35, ease: 'linear' },
    // 問他：豬探長從天上掉到左前方、變大，轉向觀眾
    { at: 10.66, actor: 'pig', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: 10.66, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.01 },
    { at: 10.7, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    { at: 10.95, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 10.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 安靜等他回答：身體往字那邊傾、側耳聽，點兩下頭
    { at: 11.95, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.45, actor: 'pig', do: 'flip' },
    { at: 13.45, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.75, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：豸從貓身上跳出來
    { at: H1 + 0.05, dur: 0.65, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'cat', color: partColor('豸') },
    // 第 2 次：滾進草叢，小草（艹）飛起來
    { at: 4.3, dur: 0.45, strokes: [7, 8, 9, 10], from: 'bush', color: partColor('艹') },
    // 第 3 次：掉進稻田，田翻起來
    { at: 7.3, dur: 0.5, strokes: [11, 12, 13, 14, 15], from: 'field', color: partColor('田') },
  ],
  glyph: [
    { at: 7.85, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.6, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 10.5, dur: 3.45, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.55, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.05, kind: 'zzz', actor: 'cat', dx: 6, dy: 6, dur: 1.0 },
    // 開場：好想摸
    { at: 0.4, kind: 'pop', actor: 'pig', emoji: '💕', dx: -2, dur: 0.5, scale: 1.4 },
    ...s1.fx,
    { at: H1 + 0.25, kind: 'sweat', actor: 'pig' },
    ...s2.fx,
    { at: 4.3, kind: 'burst', actor: 'bush', emoji: '🍃', n: 6, dx: 8, dur: 0.5 },
    { at: 4.35, kind: 'dizzy', actor: 'pig', dur: 0.35 },
    // 第 3 次前停一拍：他看一眼尾巴
    { at: 5.3, kind: 'pop', actor: 'pig', emoji: '👀', dx: 0, dur: 0.5, scale: 1.3 },
    ...s3.fx,
    { at: H3, kind: 'burst', x: REACH, y: P - 13, emoji: '⭐', n: 6, dur: 0.4 },
    { at: 7.3, kind: 'burst', actor: 'field', n: 1, dur: 0.3 },
    { at: 9.0, kind: 'burst', actor: 'cat', emoji: '💕', n: 5, dur: 0.5 },
    { at: 9.45, kind: 'pop', actor: 'pig', emoji: '😊', dx: -14, dur: 0.25, scale: 1.2 },
    ...s4.fx,
    { at: H4, kind: 'burst', x: REACH4, y: P - 13, emoji: '⭐', n: 8, dur: 0.4 },
    { at: 12.0, kind: 'pop', actor: 'pig', emoji: '👂', dx: 6, dy: 6, dur: 1.3, scale: 1.3 },
    { at: 13.45, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.8 },
    ...s4.camera,
  ],
  lights: [
    { at: 7.85, dur: 0.05, level: -0.35 },
    { at: 7.9, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '貓' },
    ...s1.cues,
    ...s2.cues,
    { at: 4.3, sfx: 'poof' },
    ...s3.cues,
    { at: 7.3, sfx: 'plop' },
    { at: 7.95, say: '貓' },
    { at: 9.0, say: '貓咪' },
    ...s4.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '貓' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
