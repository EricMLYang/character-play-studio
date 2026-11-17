// 演的是字面意思：機器＋人——一個會動的機器做的人，聽到音樂就轉圈跳舞，跳到頭頂冒煙。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：青蛙一按收音機，機器人就轉圈跳舞——每跳一次頭上的煙就冒得更大。
// 同一個按鈕、同一種轉圈、同一聲「噗」，三次只有結果變大：一小縷煙 → 一大團煙還噴出螺絲 → 先停一拍（他搖頭說不要、青蛙還是按），
// 轉到「砰！」整個被煙吞掉、當機。回馬槍是第四次：青蛙又按，當機的機器人又轉起來——這次煙從腳底噴出來，變成火箭飛上天，
// 落地擺姿勢：「機器人」。
const S = 36 // 機器人的 size
const R = 77 - 0.42 * S // 機器人站在地上的 y
const BOT = 102 // 機器人站的地方（每次都在這裡轉）
const F = 70.9 // 青蛙（size 24，圖只佔畫布 0.72）
const FROG = 38
const RADIO = 58
const RD = 69.4 // 收音機（size 18）
/** 轉完冒煙以後傻眼停多久 */
const HOLD = 0.5

/** 青蛙跳過去用前腳按收音機、跳回原位（每一次都一模一樣）。p 是按下去那一刻 */
function press(p: number) {
  const moves: Move[] = [
    { at: p - 0.3, actor: 'frog', do: 'squash', amount: -0.2, dur: 0.12 },
    { at: p - 0.2, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: p - 0.2, actor: 'frog', do: 'moveTo', to: { x: RADIO - 9, y: F - 3 }, arc: 5, dur: 0.2, ease: 'out' },
    { at: p, actor: 'radio', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: p + 0.15, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    { at: p + 0.15, actor: 'frog', do: 'moveTo', to: { x: FROG, y: F }, arc: 4, dur: 0.25, ease: 'out' },
    { at: p + 0.1, actor: 'radio', do: 'shake', amount: 0.8, dur: 0.5 },
  ]
  const fx: Fx[] = [{ at: p + 0.05, kind: 'zzz', actor: 'radio', emoji: '🎵', dx: 4, dur: 1.2, scale: 1.4 }]
  const cues: Cue[] = [{ at: p, sfx: 'tap' }]
  return { moves, fx, cues }
}

/** 轉圈跳舞（每一次都一樣：開心跳起來、原地轉圈）。at 開始轉、spins 圈數、dur 轉多久 */
function spin(at: number, spins: number, dur: number): Move[] {
  return [
    { at: at - 0.15, actor: 'bot', do: 'squash', amount: -0.15, dur: 0.15 },
    { at, actor: 'bot', do: 'swap', emoji: 'hero:robot/happy' },
    { at, actor: 'bot', do: 'hop', amount: 5, dur },
    { at, actor: 'bot', do: 'spin', times: spins, dur, pivot: 'center' },
  ]
}

/**
 * 主軸笑點：按收音機 → 轉圈跳舞 → 「噗」頭頂冒煙、傻眼。k 是第幾次（0、1、2），越後面轉越多圈、煙越大、震越大、音效越多疊一個。
 * p 是青蛙按下去那一刻；回傳 end＝傻眼停完的時間。
 */
function dance(p: number, k: number) {
  const pr = press(p)
  const at = p + 0.3
  const dur = 0.6 + 0.2 * k
  const hit = at + dur
  const moves: Move[] = [
    ...pr.moves,
    ...spin(at, 1 + k, dur),
    // 噗！傻眼（第三次直接當機）
    { at: hit, actor: 'bot', do: 'swap', emoji: k >= 2 ? 'hero:robot/broken' : 'hero:robot/surprised' },
    { at: hit, actor: 'bot', do: 'squash', amount: 0.15 + 0.1 * k, dur: 0.25 },
    { at: hit + 0.05, actor: 'bot', do: 'shake', amount: 0.5 + 0.4 * k, dur: HOLD - 0.1 },
  ]
  const fx: Fx[] = [
    ...pr.fx,
    // 煙一次比一次大：第一次一小縷、第二次蓋過頭、第三次整個人被吞掉
    { at: hit, kind: 'burst', actor: 'bot', emoji: 'prop:smoke', n: 1, dy: k >= 2 ? 16 : 2, dur: 0.5 + 0.35 * k, scale: [1.4, 2.3, 3.8][k] },
    { at: hit + 0.1, kind: 'puff', actor: 'bot', n: 6 + 4 * k, dur: 0.6 },
  ]
  if (k >= 1) fx.push({ at: hit + 0.05, kind: 'burst', actor: 'bot', emoji: k >= 2 ? '⚙️' : '🔩', n: 2 + 3 * k, dur: 0.6, scale: 1.2 + 0.2 * k })
  if (k >= 2) fx.push({ at: hit, kind: 'burst', actor: 'bot', emoji: '⚡', n: 6, dur: 0.5, scale: 1.5 })
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.08 + 0.06 * k, to: { x: BOT, y: R - 8 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一個音效（轉圈咻＋噗），一次比一次多疊一個
  const cues: Cue[] = [...pr.cues, { at, sfx: 'whoosh' }, { at: hit, sfx: 'poof' }]
  if (k >= 1) cues.push({ at: hit + 0.05, sfx: 'clink' })
  if (k >= 2) cues.push({ at: hit + 0.1, sfx: 'crack' }, { at: hit + 0.2, sfx: 'deflate' })
  return { moves, fx, camera, cues, end: hit + HOLD }
}

const P1 = 0.9, P2 = 2.7, P3 = 5.45, P4 = 8.0
const d1 = dance(P1, 0)
const d2 = dance(P2, 1)
const d3 = dance(P3, 2)
// 回馬槍：同一個按鈕、同一種轉圈，這次煙從腳底噴出來——飛上天
const p4 = press(P4)
const SPIN4 = P4 + 0.3
const UP = SPIN4 + 0.55
const LAND = UP + 0.75

export default scene({
  duration: 11.4,
  bg: { top: '#4A3A7E', bottom: '#8C6FC4', floor: '#C9925E', scenery: 'room' },
  actors: [
    { id: 'disco', emoji: '🪩', x: 76, y: 11, size: 12, float: true },
    { id: 'lamp', emoji: 'prop:lamp', x: 140, y: 63.1, size: 33 },
    { id: 'radio', emoji: '📻', x: RADIO, y: RD, size: 18 },
    { id: 'frog', emoji: 'prop:frog', x: FROG, y: F, size: 24, flip: true },
    { id: 'bot', emoji: 'hero:robot/idle', x: BOT, y: R, size: S, pivot: 'center' },
  ],
  moves: [
    // 開場：機器人站好、青蛙跳一下「要放音樂囉」
    { at: 0.1, actor: 'bot', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.3, actor: 'bot', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.25, actor: 'frog', do: 'hop', amount: 3, dur: 0.3 },
    // 第一次：一小縷煙，傻眼一下，甩甩頭沒事
    ...d1.moves,
    { at: d1.end, actor: 'bot', do: 'swap', emoji: 'hero:robot/idle' },
    // 第二次：一大團煙、噴出螺絲，晃兩下
    ...d2.moves,
    { at: d2.end, actor: 'bot', do: 'tilt', amount: 12, dur: 0.4 },
    { at: d2.end + 0.2, actor: 'bot', do: 'swap', emoji: 'hero:robot/idle' },
    // 第三次前停一拍：青蛙蓄力要按，機器人拚命搖頭「不要！」——青蛙還是按了
    { at: 4.55, actor: 'frog', do: 'tilt', amount: 18, dur: 0.6 },
    { at: 4.6, actor: 'frog', do: 'squash', amount: -0.2, dur: 0.5 },
    { at: 4.55, actor: 'bot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 4.6, actor: 'bot', do: 'tilt', amount: 14, dur: 0.25 },
    { at: 4.85, actor: 'bot', do: 'tilt', amount: -14, dur: 0.25 },
    // 第三次：砰！整個被煙吞掉，當機歪一邊
    ...d3.moves,
    { at: d3.end, actor: 'bot', do: 'rotateTo', amount: 14, dur: 0.3, ease: 'bounce' },
    // 回馬槍：青蛙又按——當機的機器人又轉起來
    ...p4.moves,
    { at: SPIN4 - 0.1, actor: 'bot', do: 'rotateTo', amount: -14, dur: 0.1 },
    ...spin(SPIN4, 2, 0.5).filter((m) => m.do !== 'swap' && m.do !== 'hop'),
    // 煙從腳底噴出來：變成火箭飛上天，繞一圈落回原地
    { at: UP, actor: 'bot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: UP, actor: 'bot', do: 'moveTo', to: { x: BOT - 12, y: 42 }, dur: 0.35, ease: 'in' },
    { at: UP + 0.35, actor: 'bot', do: 'moveTo', to: { x: BOT - 8, y: R }, arc: 12, dur: 0.4, ease: 'in' },
    { at: UP + 0.1, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: UP + 0.1, actor: 'frog', do: 'hop', amount: 4, dur: 0.4 },
    // 落地亮相：變大、擺姿勢
    { at: LAND, actor: 'bot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: LAND, actor: 'bot', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    { at: LAND + 0.1, actor: 'frog', do: 'swap', emoji: 'prop:frog-wink' },
    { at: LAND + 0.1, actor: 'frog', do: 'scaleTo', amount: 0.79, dur: 0.01 },
    { at: LAND + 0.1, actor: 'frog', do: 'moveTo', to: { x: FROG + 8, y: F }, arc: 4, dur: 0.3, ease: 'out' },
  ],
  fx: [
    ...d1.fx,
    { at: d1.end - 0.2, kind: 'sweat', actor: 'bot' },
    ...d2.fx,
    // 停一拍：他汗流浹背
    { at: 4.55, kind: 'sweat', actor: 'bot', dur: 0.8 },
    ...d3.fx,
    { at: d3.end, kind: 'puff', actor: 'bot', n: 6, dur: 1.0 },
    ...p4.fx,
    // 火箭：腳底噴火＋大團煙往下
    { at: UP - 0.05, kind: 'burst', x: BOT, y: 76, emoji: 'prop:smoke', n: 1, dur: 0.6, scale: 2.4 },
    { at: UP, kind: 'burst', x: BOT, y: 74, emoji: '🔥', n: 5, dur: 0.5, scale: 1.5 },
    { at: LAND, kind: 'burst', actor: 'bot', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: LAND + 0.4, kind: 'burst', actor: 'bot', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：收音機、青蛙、機器人都在畫面裡，機器人夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: { x: 80, y: 50 } },
    ...d1.camera,
    ...d2.camera,
    // 停一拍時慢慢推近機器人
    { at: 4.5, dur: 0.6, do: 'zoom', amount: 1.45, to: { x: 86, y: 50 } },
    ...d3.camera,
    { at: d3.end + 0.3, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 80, y: 50 } },
    // 亮相
    { at: LAND, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: LAND, dur: 0.5, do: 'zoom', amount: 1.5, to: { x: 84, y: 52 } },
  ],
  lights: [
    // 第三次「砰」：一閃
    { at: d3.end - HOLD, dur: 0.05, level: -0.4 },
    { at: d3.end - HOLD + 0.05, dur: 0.35, level: 0.25 },
    { at: d3.end, dur: 0.5, level: 0 },
    // 亮相：一閃
    { at: LAND, dur: 0.05, level: -0.3 },
    { at: LAND + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'boing' },
    ...d1.cues,
    ...d2.cues,
    { at: 4.6, sfx: 'blip' },
    { at: 4.85, sfx: 'blip' },
    ...d3.cues,
    ...p4.cues,
    { at: SPIN4, sfx: 'whoosh' },
    { at: UP, sfx: 'laser' },
    { at: LAND, sfx: 'bonk' },
    { at: LAND + 0.2, say: '機器人' },
    { at: LAND + 0.4, sfx: 'cheer' },
  ],
})
