// 演的是字面意思：卡（卡住）＋車——一台載滿玩具的貨車開到限高的欄杆下面，卡住了。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 玩具房：小老鼠坐在一大疊貨上，貨車嘟嘟開過來，前面是一道矮矮的欄杆。貨車一衝——咚！上面的箱子、小熊、老鼠全被欄杆刮下來，
// 貨車自己也卡在欄杆下面。用力開：輪子空轉冒煙；再用力：還是卡著。停一拍……老鼠想到了：把輪胎的氣放掉！
// 貨車「咻——」矮了一截，從欄杆下面滑過去，到了另一邊輪胎再「啵」地鼓起來。老鼠把箱子、小熊丟過欄杆，自己也跳過去，
// 一層一層疊回車頂：「卡車」。
const T = 66.9 // 貨車（size 24）站在地上的 y
const LOW = T + 3.5 // 輪胎放氣以後
const START = 56
const STUCK = 81 // 卡住的地方（車斗頂到欄杆）
const PAST = 137 // 過了欄杆
// 車頂上的一疊（比貨車的 y 高多少；貨車朝右，車斗在左邊）。車斗頂在 y 56、欄杆下緣 54.5（用紅點量過）
const BOX = { dx: -3, dy: -9.5 }
const BEAR = { dx: -3, dy: -19.5 }
const RAT = { dx: -3, dy: -37 }
const G = 72 // 地上：箱子、小熊（size 11）、老鼠（size 12）

/** 貨車的動作，車頂上的東西照抄一份 */
const load = (moves: Move[], ids: [string, { dx: number; dy: number }][]): Move[] => moves.flatMap((m) => {
  if (m.do !== 'moveTo' && m.do !== 'enter') return [m]
  return [m, ...ids.map(([actor, o]) => {
    const shift = (v?: Move['to']) => v && { x: v.x + o.dx, y: v.y + o.dy }
    return { ...m, actor, to: shift(m.to), from: shift(m.from) }
  })]
})
const ALL: [string, { dx: number; dy: number }][] = [['box', BOX], ['bear', BEAR], ['rat', RAT]]

export default scene({
  duration: 9.6,
  bg: { top: '#FFE7A3', bottom: '#FFF6D8', floor: '#D7A26C', scenery: 'room' },
  actors: [
    { id: 'plant', emoji: '🪴', x: 14, y: 67.8, size: 22 },
    // 欄杆架在兩塊積木上（腳在 x 91、117）
    { id: 'gate', emoji: '🚧', x: 104, y: 47.5, size: 44 },
    { id: 'brick1', emoji: '🧱', x: 91, y: 73.6, size: 8 },
    { id: 'brick2', emoji: '🧱', x: 117, y: 73.6, size: 8 },
    { id: 'ball', emoji: '⚽', x: 30, y: 72.4, size: 9 },
    { id: 'truck', emoji: '🚚', x: START, y: T, size: 24, flip: true },
    { id: 'box', emoji: '📦', x: START + BOX.dx, y: T + BOX.dy, size: 11, pivot: 'center' },
    { id: 'bear', emoji: '🧸', x: START + BEAR.dx, y: T + BEAR.dy, size: 11, pivot: 'center' },
    { id: 'rat', emoji: 'hero:mouse/happy', x: START + RAT.dx, y: T + RAT.dy, size: 12 },
  ],
  moves: [
    // 嘟嘟開進來，停在欄杆前
    ...load([{ at: 0.05, actor: 'truck', do: 'enter', from: { x: -30, y: T }, dur: 1.0, ease: 'out' }], ALL),
    { at: 1.05, actor: 'bear', do: 'tilt', amount: 12, dur: 0.4 },
    // 一衝——咚！
    { at: 1.55, actor: 'truck', do: 'squash', amount: -0.1, dur: 0.25 },
    ...load([{ at: 1.75, actor: 'truck', do: 'moveTo', to: { x: STUCK, y: T }, dur: 0.3, ease: 'in' }], ALL),
    // 上面的一疊被欄杆刮下來，掉到後面
    { at: 2.05, actor: 'box', do: 'moveTo', to: { x: 50, y: G }, arc: 8, dur: 0.5, ease: 'out' },
    { at: 2.05, actor: 'box', do: 'spin', times: -1, dur: 0.5 },
    { at: 2.05, actor: 'bear', do: 'moveTo', to: { x: 38, y: G }, arc: 12, dur: 0.6, ease: 'out' },
    { at: 2.05, actor: 'bear', do: 'spin', times: -2, dur: 0.6 },
    { at: 2.05, actor: 'rat', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 2.05, actor: 'rat', do: 'moveTo', to: { x: 60, y: G }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 2.05, actor: 'rat', do: 'spin', times: -1, dur: 0.6, pivot: 'center' },
    { at: 2.7, actor: 'rat', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 2.05, actor: 'gate', do: 'shake', amount: 0.8, dur: 0.4 },
    // 貨車也卡住了：用力開，輪子空轉；再用力，還是卡著
    { at: 2.7, actor: 'truck', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 3.3, actor: 'truck', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 3.3, actor: 'truck', do: 'shake', amount: 1.4, dur: 0.6 },
    // 停一拍……老鼠想到了：放氣
    { at: 4.0, actor: 'rat', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 4.3, actor: 'rat', do: 'moveTo', to: { x: STUCK - 16, y: G }, dur: 0.35 },
    { at: 4.75, actor: 'rat', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 4.8, actor: 'truck', do: 'moveTo', to: { x: STUCK, y: LOW }, dur: 0.45, ease: 'out' },
    // 咻——從欄杆下面滑過去
    { at: 5.35, actor: 'truck', do: 'moveTo', to: { x: PAST, y: LOW }, dur: 0.55, ease: 'in' },
    // 到了另一邊，輪胎啵地鼓回來
    { at: 6.0, actor: 'truck', do: 'moveTo', to: { x: PAST, y: T }, dur: 0.25, ease: 'back' },
    { at: 6.0, actor: 'truck', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.0, actor: 'rat', do: 'swap', emoji: 'hero:mouse/happy' },
    // 老鼠把箱子、小熊丟過欄杆，自己也跳過去，一層一層疊回車頂
    { at: 6.25, actor: 'box', do: 'moveTo', to: { x: PAST + BOX.dx, y: T + BOX.dy }, arc: 22, dur: 0.5, ease: 'out' },
    { at: 6.25, actor: 'box', do: 'spin', times: 1, dur: 0.5 },
    { at: 6.6, actor: 'bear', do: 'moveTo', to: { x: PAST + BEAR.dx, y: T + BEAR.dy }, arc: 20, dur: 0.5, ease: 'out' },
    { at: 6.6, actor: 'bear', do: 'spin', times: 1, dur: 0.5 },
    { at: 6.95, actor: 'rat', do: 'moveTo', to: { x: PAST + RAT.dx, y: T + RAT.dy }, arc: 18, dur: 0.55, ease: 'out' },
    { at: 6.95, actor: 'rat', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
    // 亮相
    { at: 7.55, actor: 'truck', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 7.55, actor: 'box', do: 'hop', amount: 2, dur: 0.3 },
    { at: 7.55, actor: 'bear', do: 'hop', amount: 3, dur: 0.35 },
    { at: 7.55, actor: 'rat', do: 'hop', amount: 5, dur: 0.4 },
    { at: 8.4, actor: 'bear', do: 'tilt', amount: -10, dur: 0.5 },
  ],
  fx: [
    { at: 0.3, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 1.1, kind: 'pop', actor: 'rat', emoji: '👉', dx: 8, dur: 0.5 },
    { at: 2.05, kind: 'burst', x: 86, y: 52, n: 1, dur: 0.4 },
    { at: 2.1, kind: 'burst', x: 86, y: 48, emoji: '⭐', n: 5, dur: 0.6 },
    { at: 2.75, kind: 'dizzy', actor: 'rat', dur: 1.2 },
    { at: 2.7, kind: 'puff', actor: 'truck', n: 6, dur: 0.6 },
    { at: 3.3, kind: 'puff', actor: 'truck', n: 10, dur: 0.7 },
    { at: 3.45, kind: 'sweat', actor: 'truck' },
    { at: 4.0, kind: 'pop', actor: 'rat', emoji: '🤔', dx: -6, dur: 0.4 },
    { at: 4.35, kind: 'pop', actor: 'rat', emoji: '💡', dur: 0.4 },
    { at: 4.85, kind: 'burst', actor: 'truck', emoji: '💨', n: 4, dy: 18, dur: 0.6 },
    { at: 5.4, kind: 'puff', actor: 'truck', n: 6, dur: 0.5 },
    { at: 6.0, kind: 'puff', actor: 'truck', dur: 0.4 },
    { at: 6.05, kind: 'pop', actor: 'truck', emoji: '😤', dx: 10, dur: 0.5 },
    { at: 7.55, kind: 'burst', actor: 'rat', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'truck', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 2.05, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 2.05, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 86, y: 55 } },
    { at: 7.4, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 160, y: 62 } },
  ],
  lights: [
    { at: 2.05, dur: 0.05, level: -0.2 },
    { at: 2.1, dur: 0.3, level: 0 },
    { at: 7.55, dur: 0.05, level: -0.2 },
    { at: 7.6, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 1.55, sfx: 'rumble' },
    { at: 2.05, sfx: 'bonk' },
    { at: 2.55, sfx: 'plop' },
    { at: 2.7, sfx: 'rumble' },
    { at: 3.3, sfx: 'slide' },
    { at: 4.8, sfx: 'deflate' },
    { at: 5.35, sfx: 'whoosh' },
    { at: 6.0, sfx: 'boing' },
    { at: 6.75, sfx: 'plop' },
    { at: 7.5, sfx: 'boing' },
    { at: 7.65, say: '卡車' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
