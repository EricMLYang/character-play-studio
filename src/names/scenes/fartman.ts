// 演的是字面意思：屁屁＋超人——一個披披風的超人（自家主角）飛不起來，只好用力「噗」放屁當推進器，最後屁大到變成一朵雲把他托上天（沒有番薯、校長等原作情節）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：超人想飛上樹拿青蛙的氣球，飛不起來，只好蹲下用力「噗」——屁一次比一次大，把他噴得一次比一次高。
// 同一個蹲下憋氣、同一團黃色的屁、同一聲「噗」，三次只有結果變大：一小團、跳一下就掉回來 → 一大團、噴到樹梢差一點點就摸到、摔下來頭昏
// → 先停一拍（他蹲最低、抖最兇，青蛙先跳開躲好），第三次噗出一大朵屁雲——他卻一動也不動、傻眼。
// 反轉：那朵屁雲慢慢浮起來，把他整個托上天，他站在自己的屁雲上拿到氣球：「屁屁超人」。
const S = 36 // 超人的 size
const G = 77 - 0.42 * S // 超人站在地上的 y
const HX = 70 // 超人每次都站在這裡噗
const BUTT = { x: HX - 7, y: G + 7 } // 屁屁（他面向右邊，屁屁在左後方）
const TREE = { x: 108, size: 64 }
const BALLOON = { x: 98, y: 27 } // 卡在樹梢的氣球
const FROG = { x: 34, y: 71.4 } // 青蛙（size 22）
/** 青蛙站哪：開場，被第一次、第二次、第三次的屁吹到哪（第三次前他先跳到 x 17 躲好） */
const FROG_AT = [34, 29, 23, 9]
/** 屁的顏色：白雲圖染成黃色 */
const FART = 'brightness(0.86) sepia(1) saturate(3.2) hue-rotate(4deg)'
const RIDE = { x: 82, y: 33 } // 坐屁雲上去以後站的地方
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/**
 * 噗（每一次都一樣）：蹲低憋氣、全身抖 → 「噗」屁屁噴出一團黃色的屁，他被往上噴、青蛙被吹歪。
 * k 是第幾次（0、1、2），越後面蹲越久、抖越兇、屁越大、噴越高、音效多疊一個。p 是噗的那一刻。
 */
function toot(p: number, k: number) {
  const cloud = `fart${k + 1}`
  const wind = 0.5 + 0.15 * k // 蹲著憋多久
  const moves: Move[] = [
    { at: p - wind, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: p - wind, actor: 'hero', do: 'squash', amount: 0.22 + 0.06 * k, dur: wind },
    { at: p - wind + 0.1, actor: 'hero', do: 'shake', amount: 0.5 + 0.35 * k, dur: wind - 0.1 },
    // 噗！屁從屁屁噴出來、往左後方散開
    { at: p, actor: cloud, do: 'pop', dur: 0.15 },
    { at: p, actor: cloud, do: 'scaleTo', amount: [1.6, 1.9, 2.2][k], dur: 0.45, ease: 'out' },
    // 青蛙被屁吹得往後滑、身體往後仰（一次比一次遠）
    { at: p + 0.05, actor: 'frog', do: 'moveTo', to: { x: FROG_AT[k + 1], y: FROG.y }, dur: 0.35, ease: 'out' },
    { at: p + 0.05, actor: 'frog', do: 'rotateTo', amount: -(12 + 6 * k), dur: 0.15, ease: 'out' },
    { at: p + 0.6, actor: 'frog', do: 'rotateTo', amount: 12 + 6 * k, dur: 0.3, ease: 'back' },
  ]
  if (k < 2) {
    moves.push(
      { at: p, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
      { at: p, actor: cloud, do: 'moveTo', to: { x: BUTT.x - 8 - 6 * k, y: BUTT.y - 3 }, dur: 0.6, ease: 'out' },
      { at: p + 0.55, actor: cloud, do: 'vanish', dur: 0.35 },
    )
  }
  const fx: Fx[] = [
    { at: p + 0.05, kind: 'stink', actor: cloud, dur: 1.1 },
    { at: p, kind: 'puff', actor: 'hero', n: 4 + 4 * k, dur: 0.5 },
  ]
  if (k >= 1) fx.push({ at: p - 0.3, kind: 'sweat', actor: 'hero', dur: 0.4 })
  const camera: Camera[] = [
    { at: p, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: BUTT },
    { at: p, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一個音效（噗＋洩氣），一次比一次多疊一個
  const cues: Cue[] = [{ at: p, sfx: 'poof' }, { at: p + 0.03, sfx: 'deflate' }]
  if (k >= 1) cues.push({ at: p + 0.06, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: p + 0.1, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

const P1 = 1.55, P2 = 3.45, P3 = 6.5
const t1 = toot(P1, 0)
const t2 = toot(P2, 1)
const t3 = toot(P3, 2)
const TOP2 = P2 + 0.3 // 第二次噴到最高
const LAND2 = TOP2 + 0.65 // 第二次摔回地上
const LIFT = P3 + 0.75 // 屁雲開始浮起來
const UP = LIFT + 1.0 // 到樹梢
const POSE = UP + 0.3 // 拿到氣球、亮相

export default scene({
  duration: 10.9, // 亮相後停 2.3 秒以上
  bg: { top: '#86CFF0', bottom: '#EAF8FF', floor: '#9CCB72', scenery: 'city' },
  actors: [
    { id: 'tree', emoji: 'prop:tall-tree', x: TREE.x, y: 77 - 0.42 * TREE.size, size: TREE.size },
    { id: 'frog', emoji: 'prop:frog', x: FROG.x, y: FROG.y, size: 22, flip: true },
    // 三團屁（同一張雲染黃色）：畫在超人後面
    { id: 'fart1', emoji: 'prop:smoke', x: BUTT.x - 3, y: BUTT.y, size: 10, hidden: true, float: true, tint: FART },
    { id: 'fart2', emoji: 'prop:smoke', x: BUTT.x - 3, y: BUTT.y, size: 13, hidden: true, float: true, tint: FART },
    { id: 'fart3', emoji: 'prop:smoke', x: BUTT.x - 3, y: BUTT.y, size: 18, hidden: true, float: true, tint: FART },
    // 氣球畫在屁雲前面：最後要看得到
    { id: 'balloon', emoji: '🎈', x: BALLOON.x, y: BALLOON.y, size: 13, float: true, pivot: 'center' },
    { id: 'hero', emoji: 'hero:cape/idle', x: HX, y: G, size: S, flip: true },
  ],
  moves: [
    // 開場：青蛙跳著指樹上的氣球，超人拍拍胸口「交給我」
    { at: 0.1, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: 0.1, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.5, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.85, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    { at: 0.2, actor: 'balloon', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 0.5, actor: 'hero', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.6, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },

    // 第一次：小小一團，跳一下就掉回來，傻眼
    ...t1.moves,
    { at: P1, actor: 'hero', do: 'moveTo', to: { x: HX, y: G - 7 }, dur: 0.2, ease: 'out' },
    { at: P1 + 0.22, actor: 'hero', do: 'moveTo', to: { x: HX, y: G }, dur: 0.2, ease: 'in' },
    { at: P1 + 0.42, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: P1 + 1.1, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },

    // 第二次：一大團，噴到樹梢、伸手差一點點……摔下來頭昏
    ...t2.moves,
    { at: P2, actor: 'hero', do: 'moveTo', to: { x: HX + 4, y: G - 24 }, dur: 0.3, ease: 'out' },
    { at: TOP2, actor: 'hero', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: TOP2, actor: 'balloon', do: 'tilt', amount: -14, dur: 0.4 },
    { at: TOP2 + 0.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: TOP2 + 0.35, actor: 'hero', do: 'moveTo', to: { x: HX, y: G }, dur: LAND2 - TOP2 - 0.35, ease: 'in' },
    { at: LAND2, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: LAND2, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.3 },

    // 停一拍：他爬起來、瞪著樹梢，青蛙先跳開躲好（他知道要來了）
    { at: 5.05, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 5.2, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: 5.2, actor: 'frog', do: 'moveTo', to: { x: 17, y: FROG.y }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 5.6, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    // 第三次：蹲最低、抖最兇——噗出一大朵屁雲，他卻一動也不動，傻眼
    ...t3.moves,
    { at: P3, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: P3, actor: 'fart3', do: 'moveTo', to: { x: HX - 2, y: G + 20 }, dur: 0.5, ease: 'out' },
    { at: P3 + 0.1, actor: 'frog', do: 'shake', amount: 1, dur: 0.5 },
    // 反轉：屁雲慢慢浮起來，把他托上天
    { at: LIFT - 0.15, actor: 'fart3', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: LIFT, actor: 'fart3', do: 'moveTo', to: { x: RIDE.x - 2, y: RIDE.y + 24 }, dur: UP - LIFT, ease: 'inOut' },
    { at: LIFT, actor: 'hero', do: 'moveTo', to: RIDE, dur: UP - LIFT, ease: 'inOut' },
    { at: LIFT + 0.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    // 到樹梢：氣球自己落到他手上
    { at: UP, actor: 'balloon', do: 'moveTo', to: { x: RIDE.x + 15, y: RIDE.y - 13 }, dur: 0.3, ease: 'back' },
    { at: UP, actor: 'tree', do: 'shake', amount: 0.6, dur: 0.3 },
    // 亮相：站在自己的屁雲上擺姿勢
    { at: POSE, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: POSE, actor: 'hero', do: 'scaleTo', amount: 1.1, dur: 0.35, ease: 'back' },
    { at: POSE + 0.5, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: POSE + 0.5, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
    { at: POSE + 0.9, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
    // 屁雲上下飄
    { at: POSE + 0.6, actor: 'fart3', do: 'hop', amount: 1.5, dur: 0.8 },
    { at: POSE + 0.6, actor: 'hero', do: 'hop', amount: 1.5, dur: 0.8 },
    { at: POSE + 0.6, actor: 'balloon', do: 'hop', amount: 1.5, dur: 0.8 },
  ],
  fx: [
    ...t1.fx,
    { at: P1 + 0.45, kind: 'sweat', actor: 'hero' },
    ...t2.fx,
    { at: LAND2, kind: 'burst', actor: 'hero', n: 1, dur: 0.4, scale: 1.4 },
    { at: LAND2 + 0.1, kind: 'dizzy', actor: 'hero', dur: 0.8 },
    ...t3.fx,
    { at: LIFT, kind: 'stink', actor: 'fart3', dur: 1.4 },
    { at: POSE, kind: 'burst', actor: 'hero', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.45, kind: 'burst', actor: 'hero', emoji: '🎉', n: 8, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：超人、青蛙、樹梢的氣球都在畫面裡，超人夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: look(76, 48, 1.3) },
    ...t1.camera,
    ...t2.camera,
    { at: LAND2, dur: 0.35, do: 'shake', amount: 1.2 },
    // 停一拍：慢慢推近蹲著憋氣的他
    { at: 5.3, dur: 0.8, do: 'zoom', amount: 1.55, to: look(HX - 2, 54, 1.55) },
    ...t3.camera,
    { at: P3 + 0.1, dur: 0.4, do: 'zoom', amount: 1.3, to: look(76, 50, 1.3) },
    // 浮上去：跟著往上
    { at: LIFT, dur: UP - LIFT, do: 'zoom', amount: 1.45, to: look(RIDE.x, 38, 1.45) },
  ],
  lights: [
    { at: P3, dur: 0.05, level: -0.3 },
    { at: P3 + 0.05, dur: 0.35, level: 0 },
    { at: POSE, dur: 0.05, level: -0.2 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'boing' },
    ...t1.cues,
    { at: P1 + 0.42, sfx: 'plop' },
    ...t2.cues,
    { at: LAND2, sfx: 'bonk' },
    { at: 5.2, sfx: 'boing' },
    ...t3.cues,
    { at: LIFT, sfx: 'bubble' },
    { at: UP, sfx: 'blip' },
    { at: POSE, sfx: 'clink' },
    { at: POSE + 0.3, say: '屁屁超人' },
    { at: POSE + 0.6, sfx: 'cheer' },
  ],
})
