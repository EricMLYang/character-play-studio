// 演的是字面意思：消（滅掉）＋防（防火）＋車——一台救火的大車子，消防員拿接在車上的水管噴水要把火滅掉。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：消防員小狗拿著接在大消防車上的水管要滅垃圾桶的小火，可是車子一打水，水管就亂甩、把他甩轉身，水都噴到旁邊的企鵝身上。
// 同一個打水（車子抖、轟隆）、同一個甩轉身、同一聲嘩啦，三次只有結果越來越大：企鵝腳邊濺一點 → 整道水把企鵝沖到車子旁邊 →
// 停一拍（企鵝躲到車子後面、小狗咬牙抓緊）→ 水管整條翹起來把他甩上天，水往上噴、整道淋回他自己頭上，摔成落湯狗。
// 反轉：落湯狗像狗狗一樣用力甩身體，水珠「噗嘶」把火甩熄了。跳到大消防車前面亮相：「消防車」。
const S = 34 // 消防員小狗的 size
const D = 77 - 0.42 * S // 小狗站在地上的 y
const DOG = 62 // 三次都站在這裡
const PG = 77 - 0.42 * 22 // 企鵝（size 22）
const PEN = 92
const TS = 52 // 消防車
const TRUCK = 134
const TY = 77 - 0.42 * TS
const BIN = 28 // 垃圾桶
const BY = 77 - 0.42 * 17
const KINK = { x: 82, y: 73 } // 水管平常躺在地上的彎
const HOSE = '#F1E4C3' // 帆布水管
const WATER = '#6EC6FF'
/** 水噴完傻眼停多久 */
const HOLD = 0.45

/** 水管接到小狗身上的地方（相對小狗中心）：朝左時從背後（右邊）接過來，才不會橫過身體；朝右（flip）時接在前面的手上 */
const BACK = { dx: 8, dy: 6 }
const FRONT = { dx: 5, dy: 4 }
const NOZZLE = { dx: -12, dy: -4 } // 噴嘴（hose 姿勢、朝左）

/** 水管：消防車 → 地上的彎（看不見的 kink）→ 小狗手上。from～to 這段時間，手在 dx／dy */
function hose(from: number, to: number, dx: number, dy: number): Fx[] {
  return [
    { at: from, dur: to - from, kind: 'tube', actor: 'truck', dx: -20, dy: 14, target: 'kink', color: HOSE, width: 2.4, n: 2.6 },
    { at: from, dur: to - from, kind: 'tube', actor: 'dog', dx, dy, target: 'kink', color: HOSE, width: 2.4, n: 2.6 },
  ]
}

/**
 * 打水：消防車抖一下轟隆（預備）→ 小狗拿穩水管瞄準火 → 嘩啦！水管一甩，把他甩轉身（朝右），水噴到企鵝那邊。
 * k 是第幾次（0、1），越後面車子抖越大、水柱越粗越遠、企鵝越慘。p 是水出來那一刻；回傳 end＝傻眼停完的時間。
 */
function pump(p: number, k: number) {
  const moves: Move[] = [
    // 預備：車子轟隆抖、水管鼓起來
    { at: p - 0.6, actor: 'truck', do: 'shake', amount: 0.7 + 0.4 * k, dur: 0.45 },
    { at: p - 0.6, actor: 'truck', do: 'squash', amount: 0.08 + 0.04 * k, dur: 0.4 },
    { at: p - 0.45, actor: 'kink', do: 'moveTo', to: { x: KINK.x, y: KINK.y - 3 }, dur: 0.3, ease: 'out' },
    { at: p - 0.4, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: p - 0.3, actor: 'dog', do: 'squash', amount: 0.1, dur: 0.25 },
    // 嘩啦！水管甩起來，把他甩轉身
    { at: p, actor: 'kink', do: 'moveTo', to: { x: KINK.x + 4, y: KINK.y - 14 - 12 * k }, dur: 0.2, ease: 'out' },
    { at: p + 0.25, actor: 'kink', do: 'moveTo', to: KINK, dur: 0.35, ease: 'bounce' },
    { at: p, actor: 'dog', do: 'flip' },
    { at: p, actor: 'dog', do: 'hop', amount: 2 + 2 * k, dur: 0.25 },
    { at: p + 0.4, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: p + 0.4 + HOLD, actor: 'dog', do: 'flip' },
    { at: p + 0.4 + HOLD, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/idle' },
  ]
  // 企鵝：第一次腳邊被濺到、跳一下；第二次整隻被沖到車子旁邊，轉半圈傻眼
  if (k === 0) {
    moves.push(
      { at: p + 0.12, actor: 'pen', do: 'hop', amount: 4, dur: 0.3 },
      { at: p + 0.45, actor: 'pen', do: 'shake', amount: 0.8, dur: 0.3 },
    )
  } else {
    moves.push(
      { at: p + 0.1, actor: 'pen', do: 'moveTo', to: { x: PEN + 7, y: PG }, dur: 0.35, ease: 'out' },
      { at: p + 0.1, actor: 'pen', do: 'rotateTo', amount: 25, dur: 0.3, ease: 'out' },
      { at: p + 0.6, actor: 'pen', do: 'rotateTo', amount: -25, dur: 0.3, ease: 'bounce' },
      { at: p + 0.6, actor: 'pen', do: 'shake', amount: 1.2, dur: 0.4 },
    )
  }
  const hit = k === 0 ? { x: PEN - 4, y: 72 } : { x: PEN + 4, y: PG - 2 }
  const fx: Fx[] = [
    { at: p - 0.55, kind: 'puff', actor: 'truck', n: 6, dur: 0.5 },
    ...hose(p - 0.4, p, BACK.dx, BACK.dy),
    ...hose(p, p + 0.4 + HOLD, FRONT.dx, FRONT.dy),
    // 水柱：從噴嘴（轉身後在右邊）噴到企鵝
    { at: p, kind: 'line', actor: 'dog', dx: -NOZZLE.dx, dy: NOZZLE.dy, to: hit, color: WATER, width: 2.4 + 1.6 * k, dur: 0.35 + 0.2 * k },
    { at: p + 0.08, kind: 'burst', x: hit.x, y: hit.y - 4, emoji: '💦', n: 1, dur: 0.5, scale: 1.2 + 0.6 * k },
    { at: p + 0.1, kind: 'burst', actor: 'pen', emoji: '💧', n: 5 + 4 * k, dur: 0.6, scale: 1.1 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: p + 0.05, dur: 0.4, do: 'punch', amount: 0.06 + 0.06 * k, to: { x: (DOG + PEN) / 2, y: 55 } },
    { at: p + 0.05, dur: 0.3, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一個音效：轟隆＋嘩啦，第二次多疊一個
  const cues: Cue[] = [{ at: p - 0.6, sfx: 'rumble' }, { at: p, sfx: 'splash' }]
  if (k >= 1) cues.push({ at: p + 0.1, sfx: 'whoosh' })
  return { moves, fx, camera, cues, end: p + 0.4 + HOLD }
}

const P1 = 1.7, P2 = 3.6, P3 = 6.2
const s1 = pump(P1, 0)
const s2 = pump(P2, 1)
// 第三次：一樣的打水，這次水管整條翹起來，把他甩上天；水往上噴、整道淋回自己頭上
const UP = P3 + 0.35 // 淋下來那一刻
const LAND = P3 + 0.85 // 摔回地上
const SHAKE = 8.0 // 落湯狗甩身體
const OUT = SHAKE + 0.35 // 火熄
const POSE = OUT + 0.8 // 亮相
const END = 11.3

export default scene({
  duration: END,
  bg: { top: '#7FCBFF', bottom: '#E3F4FF', floor: '#B4BCC6', scenery: 'city' },
  actors: [
    { id: 'kink', emoji: '💧', x: KINK.x, y: KINK.y, size: 4, hidden: true, float: true },
    { id: 'bin', emoji: '🗑️', x: BIN, y: BY, size: 17 },
    { id: 'fire', emoji: '🔥', x: BIN, y: BY - 11, size: 13, float: true },
    { id: 'pen', emoji: '🐧', x: PEN, y: PG, size: 22 },
    { id: 'truck', emoji: '🚒', x: TRUCK, y: TY, size: TS },
    { id: 'dog', emoji: 'hero:firefighter/idle', x: DOG, y: D, size: S },
  ],
  moves: [
    // 開場：小狗拿好水管、往火那邊點頭；火一跳一跳
    { at: 0.1, actor: 'dog', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.3, actor: 'dog', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.2, actor: 'fire', do: 'squash', amount: -0.2, dur: 0.5 },
    { at: 0.8, actor: 'fire', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 0.5, actor: 'pen', do: 'tilt', amount: 8, dur: 0.4 },
    ...s1.moves,
    { at: 2.9, actor: 'fire', do: 'squash', amount: -0.2, dur: 0.4 },
    ...s2.moves,
    // 停一拍：企鵝溜到消防車後面躲好；小狗回頭看、咬牙抓緊水管
    { at: 4.9, actor: 'pen', do: 'moveTo', to: { x: TRUCK - 6, y: PG }, dur: 0.6, ease: 'inOut' },
    { at: 5.6, actor: 'pen', do: 'moveTo', to: { x: TRUCK - 22, y: PG }, dur: 0.25, ease: 'out' },
    { at: 4.95, actor: 'dog', do: 'flip' },
    { at: 5.5, actor: 'dog', do: 'flip' },
    { at: 5.55, actor: 'dog', do: 'squash', amount: 0.12, dur: 0.4 },
    { at: 5.2, actor: 'fire', do: 'squash', amount: -0.25, dur: 0.4 },
    // 第三次：車子抖最大、水管鼓最高
    { at: P3 - 0.6, actor: 'truck', do: 'shake', amount: 1.6, dur: 0.5 },
    { at: P3 - 0.6, actor: 'truck', do: 'squash', amount: 0.16, dur: 0.45 },
    { at: P3 - 0.45, actor: 'kink', do: 'moveTo', to: { x: KINK.x, y: KINK.y - 4 }, dur: 0.3, ease: 'out' },
    { at: P3 - 0.4, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/hose' },
    // 嘩啦！水管整條翹起來，把他甩上天、甩轉身
    { at: P3, actor: 'kink', do: 'moveTo', to: { x: 76, y: 14 }, dur: 0.3, ease: 'out' },
    { at: P3, actor: 'dog', do: 'flip' },
    { at: P3, actor: 'dog', do: 'moveTo', to: { x: DOG - 2, y: D - 20 }, dur: 0.3, ease: 'out' },
    { at: P3, actor: 'dog', do: 'rotateTo', amount: -25, dur: 0.3, ease: 'out' },
    // 淋回自己頭上：傻眼
    { at: UP, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: UP, actor: 'dog', do: 'rotateTo', amount: 25, dur: 0.2 },
    { at: UP + 0.1, actor: 'dog', do: 'moveTo', to: { x: DOG - 6, y: D }, dur: 0.4, ease: 'in' },
    { at: UP + 0.1, actor: 'kink', do: 'moveTo', to: KINK, dur: 0.5, ease: 'bounce' },
    { at: LAND - 0.05, actor: 'dog', do: 'flip' },
    { at: LAND, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: LAND, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: LAND + 0.2, actor: 'pen', do: 'hop', amount: 3, dur: 0.3 },
    // 反轉：落湯狗站起來，用力甩身體——水珠把火甩熄
    { at: SHAKE - 0.35, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: SHAKE - 0.2, actor: 'dog', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: SHAKE, actor: 'dog', do: 'shake', amount: 2.4, dur: 0.5 },
    { at: SHAKE + 0.1, actor: 'fire', do: 'shake', amount: 1, dur: 0.25 },
    { at: OUT, actor: 'fire', do: 'vanish', dur: 0.25 },
    { at: OUT, actor: 'bin', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: OUT + 0.05, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 亮相：跳到大消防車前面，車子閃燈跳一下，企鵝探出頭
    { at: POSE, actor: 'dog', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: POSE, actor: 'dog', do: 'moveTo', to: { x: 80, y: D }, arc: 8, dur: 0.4, ease: 'out' },
    { at: POSE, actor: 'kink', do: 'moveTo', to: { x: 100, y: KINK.y }, dur: 0.4, ease: 'out' },
    { at: POSE + 0.35, actor: 'dog', do: 'scaleTo', amount: 1.1, dur: 0.3, ease: 'back' },
    { at: POSE + 0.1, actor: 'truck', do: 'flash', dur: 1.2 },
    { at: POSE + 0.4, actor: 'truck', do: 'hop', amount: 2, dur: 0.3 },
    { at: POSE + 0.2, actor: 'pen', do: 'moveTo', to: { x: TRUCK - 32, y: PG }, dur: 0.3, ease: 'out' },
    { at: POSE + 0.6, actor: 'pen', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    ...hose(0, P1 - 0.4, BACK.dx, BACK.dy),
    ...s1.fx,
    ...hose(s1.end, P2 - 0.4, BACK.dx, BACK.dy),
    ...s2.fx,
    { at: s2.end - 0.2, kind: 'sweat', actor: 'pen', dur: 0.8 },
    // 停一拍：手上的水管跟著他回頭
    ...hose(s2.end, 4.95, BACK.dx, BACK.dy),
    ...hose(4.95, 5.5, FRONT.dx, FRONT.dy),
    ...hose(5.5, P3, BACK.dx, BACK.dy),
    { at: 5.5, kind: 'sweat', actor: 'dog', dur: 0.8 },
    { at: P3 - 0.55, kind: 'puff', actor: 'truck', n: 8, dur: 0.5 },
    // 第三次：水往上噴，再整道淋回他頭上
    ...hose(P3, LAND - 0.05, FRONT.dx, FRONT.dy),
    ...hose(LAND - 0.05, END, BACK.dx, BACK.dy),
    { at: P3, kind: 'line', actor: 'dog', dx: -NOZZLE.dx, dy: NOZZLE.dy, to: { x: DOG + 4, y: -4 }, color: WATER, width: 4.5, dur: 0.4 },
    { at: UP - 0.05, kind: 'line', actor: 'dog', dx: 0, dy: -42, to: { x: DOG - 3, y: D - 32 }, color: WATER, width: 8, dur: 0.55 },
    { at: UP, kind: 'rain', actor: 'dog', emoji: '💦', dy: -34, n: 10, dur: 0.6, scale: 1.4 },
    { at: UP + 0.1, kind: 'burst', actor: 'dog', emoji: '💦', n: 1, dy: -8, dur: 0.5, scale: 1.7 },
    { at: LAND, kind: 'burst', actor: 'dog', emoji: '💧', n: 10, dur: 0.6, scale: 1.4 },
    { at: LAND + 0.2, kind: 'rain', actor: 'dog', emoji: '💧', dy: 2, n: 6, dur: 0.9 },
    { at: LAND + 0.3, kind: 'dizzy', actor: 'dog', dur: 0.9 },
    // 甩身體：水珠飛一圈，淋到火
    { at: SHAKE, kind: 'burst', actor: 'dog', emoji: '💦', n: 12, dur: 0.6, scale: 1.8 },
    { at: SHAKE + 0.1, kind: 'rain', actor: 'fire', emoji: '💧', dy: -18, n: 6, dur: 0.4 },
    { at: OUT, kind: 'burst', actor: 'fire', emoji: 'prop:smoke', n: 1, dy: 4, dur: 0.8, scale: 1.4 },
    { at: OUT + 0.1, kind: 'puff', actor: 'bin', n: 6, dur: 0.6 },
    { at: POSE + 0.4, kind: 'burst', actor: 'dog', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.8, kind: 'burst', actor: 'dog', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：火、小狗、企鵝、消防車的車頭都在畫面裡，小狗夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.22, to: { x: 76, y: 50 } },
    ...s1.camera,
    ...s2.camera,
    // 停一拍：慢慢推近小狗
    { at: 5.0, dur: 0.8, do: 'zoom', amount: 1.4, to: { x: 66, y: 48 } },
    { at: P3 - 0.05, dur: 0.3, do: 'zoom', amount: 1.22, to: { x: 70, y: 46 } },
    { at: UP, dur: 0.45, do: 'punch', amount: 0.12, to: { x: DOG, y: 45 } },
    { at: UP, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: LAND, dur: 0.3, do: 'shake', amount: 1.2 },
    // 甩水滅火：火跟小狗一起推近
    { at: SHAKE - 0.4, dur: 0.4, do: 'zoom', amount: 1.45, to: { x: 46, y: 54 } },
    { at: OUT, dur: 0.3, do: 'shake', amount: 0.8 },
    // 亮相：小狗站在大消防車前面
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 100, y: 50 } },
  ],
  lights: [
    { at: UP, dur: 0.05, level: -0.3 },
    { at: UP + 0.05, dur: 0.35, level: 0 },
    { at: POSE + 0.35, dur: 0.05, level: -0.3 },
    { at: POSE + 0.4, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'boing' },
    ...s1.cues,
    ...s2.cues,
    { at: 5.55, sfx: 'blip' },
    { at: P3 - 0.6, sfx: 'rumble' },
    { at: P3, sfx: 'splash' },
    { at: P3 + 0.1, sfx: 'whoosh' },
    { at: UP, sfx: 'splash' },
    { at: UP + 0.05, sfx: 'plop' },
    { at: LAND, sfx: 'bonk' },
    { at: SHAKE, sfx: 'whoosh' },
    { at: OUT, sfx: 'poof' },
    { at: POSE, sfx: 'boing' },
    { at: POSE + 0.4, say: '消防車' },
    { at: POSE + 0.7, sfx: 'cheer' },
  ],
})
