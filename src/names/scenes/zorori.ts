// 演的是字面意思：怪傑（怪怪的、愛惡作劇的傢伙）——楊捷睿在小路上擺香蕉、躲起來偷笑等老烏龜滑倒，結果每次滑倒的都是自己（沒有狐狸、面具、披風、羽毛帽、野豬、Z 字記號、城堡、公主）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：他擺好香蕉躲起來偷笑，慢吞吞的老烏龜每次都差一步就停下來打瞌睡，他急著衝出來看——自己踩到香蕉滑倒。
// 同一根香蕉、同一套（躲著偷笑 → 烏龜停住打瞌睡 → 他探頭傻眼 → 衝出來 → 「咻」踩到香蕉），三次只有摔得越來越慘：
// 一屁股坐地 → 轉一圈整個人趴扁。第三次前停一拍：烏龜又停了，他跳起來又要衝——硬生生憋住、全身發抖，學乖了不出去。
// 反轉：他沒出去，香蕉自己來找他——烏龜慢慢踩上香蕉（太慢了滑不倒），香蕉從牠腳底「噗」地擠出來，飛過去剛好落在他腳下，
// 他摔最慘，往後栽進樹叢；從樹叢裡跳出來，頭上頂著香蕉，笑自己：「怪傑佐羅力」。
// 主角用楊捷睿（有偷笑、躲著偷看、滑倒、跌坐、憋住的姿勢）；海盜剛在 spider 用過，不用。
const S = 36 // 楊捷睿的 size
const G = 77 - 0.42 * S
const HIDE = 124 // 躲在樹叢後面
const BUSH = 117
const NANA = 72 // 香蕉擺在這裡
const NS = 13
const NY = 77 - 0.42 * NS
const SLIP = 80 // 每次衝到這裡踩到香蕉
const TS = 26 // 老烏龜（頭朝右）
const TY = 77 - 0.42 * TS
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/**
 * 主軸：躲著偷笑 → 烏龜停住打瞌睡 → 探頭傻眼 → 衝出來 → 踩到香蕉滑倒（前兩次一模一樣，只有摔得越來越慘）。
 * D＝衝出來那一刻，k＝第幾次（0、1），stop＝烏龜停在哪、walk＝烏龜從什麼時候開始走。回傳 up＝爬起來的時間。
 */
function prank(D: number, k: number, walkFrom: number, stop: number, nap: number) {
  const H = D + 0.32 // 踩到香蕉
  const air = [0.4, 0.55][k]
  const L = H + air // 摔到地上
  const up = L + 0.45
  const moves: Move[] = [
    // 烏龜慢慢走過來，差一步就停下來打瞌睡
    { at: walkFrom, actor: 'turtle', do: 'moveTo', to: { x: stop, y: TY }, dur: D - 0.85 - walkFrom, ease: 'linear' },
    { at: D - 0.85, actor: 'turtle', do: 'squash', amount: 0.08, dur: 0.3 },
    { at: D - 0.75, actor: 'turtle', do: 'tilt', amount: 8, dur: 0.6 },
    // 躲在樹叢後偷笑（烏龜快到了）
    { at: D - 1.25, actor: 'kid', do: 'swap', emoji: 'hero:yang/giggle' },
    { at: D - 1.2, actor: 'kid', do: 'shake', amount: 0.5, dur: 0.45 },
    // 停了？探頭傻眼
    { at: D - 0.6, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    // 衝出來
    { at: D - 0.12, actor: 'kid', do: 'squash', amount: -0.15, dur: 0.12 },
    { at: D, actor: 'kid', do: 'swap', emoji: 'hero:yang/dash' },
    { at: D, actor: 'kid', do: 'moveTo', to: { x: SLIP, y: G }, dur: 0.32, ease: 'in', anticipate: 3 },
    // 咻！踩到香蕉，腳飛起來
    { at: H, actor: 'kid', do: 'swap', emoji: 'hero:yang/slip' },
    { at: H, actor: 'kid', do: 'hop', amount: [7, 13][k], dur: air },
    { at: H, actor: 'nana', do: 'hop', amount: [9, 16][k], dur: 0.5 + 0.1 * k },
    { at: H, actor: 'nana', do: 'spin', times: 1 + k, dur: 0.5 + 0.1 * k },
    { at: H + 0.15, actor: 'turtle', do: 'shake', amount: 0.4 + 0.3 * k, dur: 0.3 },
  ]
  if (k === 0) {
    moves.push(
      { at: H, actor: 'kid', do: 'moveTo', to: { x: SLIP + 4, y: G }, dur: air, ease: 'out' },
      { at: L, actor: 'kid', do: 'swap', emoji: 'hero:yang/fall' },
    )
  } else {
    moves.push(
      { at: H, actor: 'kid', do: 'moveTo', to: { x: SLIP + 6, y: G }, dur: air, ease: 'out' },
      { at: H, actor: 'kid', do: 'spin', times: 1, dur: air, pivot: 'center' },
      { at: L, actor: 'kid', do: 'swap', emoji: 'hero:yang/flat' },
    )
  }
  const fx: Fx[] = [
    { at: D - 0.7, kind: 'zzz', actor: 'turtle', emoji: '💤', dur: nap - (D - 0.7), scale: 1.5, dx: 4 },
    { at: D, kind: 'puff', actor: 'kid', n: 5, dur: 0.4 },
    // 摔到地上：💥 一次比一次大
    { at: L, kind: 'burst', x: SLIP + 17 + 2 * k, y: 69, n: 1, dur: 0.4, scale: 1.3 + 0.5 * k },
    { at: L, kind: 'puff', actor: 'kid', n: 6 + 6 * k, dur: 0.6 },
  ]
  if (k >= 1) fx.push({ at: L + 0.1, kind: 'dizzy', actor: 'kid', dur: 0.6 })
  const camera: Camera[] = [
    { at: L, dur: 0.4, do: 'punch', amount: 0.06 + 0.06 * k, to: { x: SLIP, y: 62 } },
    { at: L, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一聲「咻」滑倒＋「咚」落地，一次比一次多疊一個
  const cues: Cue[] = [{ at: D - 1.2, sfx: 'hic' }, { at: D, sfx: 'whoosh' }, { at: H, sfx: 'slide' }, { at: L, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: L + 0.04, sfx: 'boing' })
  return { moves, fx, camera, cues, L, up }
}

/** 爬起來走回樹叢後面躲好（每次一樣） */
function back(at: number): Move[] {
  return [
    { at, actor: 'kid', do: 'swap', emoji: 'hero:yang/walk' },
    { at, actor: 'kid', do: 'flip' },
    { at, actor: 'kid', do: 'moveTo', to: { x: HIDE, y: G }, dur: 0.45, ease: 'inOut' },
    { at: at + 0.45, actor: 'kid', do: 'flip' },
    { at: at + 0.45, actor: 'kid', do: 'swap', emoji: 'hero:yang/idle' },
  ]
}

const D1 = 2.7
const p1 = prank(D1, 0, 0.3, 46, D1 + 1.3)
const D2 = 5.55
// 第二次的瞌睡一路睡到第三次烏龜醒來（＝下面的 STEP）
const p2 = prank(D2, 1, p1.up + 0.2, 52, D2 + 0.32 + 0.55 + 0.45 + 0.45 + 0.23 + 0.25 + 0.1)
// 第三次：烏龜又停了（還停在原地打瞌睡），他跳起來又要衝——憋住
const B3 = p2.up + 0.45 // 回到樹叢後
const ITCH = B3 + 0.23 // 又要衝出去
const HOLD = ITCH + 0.25 // 憋住
const STEP = HOLD + 0.1 // 烏龜醒來、慢慢踩上香蕉
const SQ = STEP + 0.65 // 香蕉被擠出來
const LAND3 = SQ + 0.45 // 香蕉落在他腳下
const H3 = LAND3 + 0.03 // 他跳起來剛好踩到
const CRASH = H3 + 0.5 // 栽進樹叢
const POP = CRASH + 0.42 // 頂著香蕉跳出來
const POSE = POP + 0.38
const DROP = 103 // 香蕉落點（他腳下）
// 頂著香蕉亮相：他站在 POSE_X，香蕉在頭上
const POSE_X = 98
const HEAD = { x: POSE_X + 1, y: G - 15.5 }

export default scene({
  duration: POSE + 1.6,
  bg: { top: '#9FD8F7', bottom: '#F4FBE8', floor: '#D7B98A', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 12, y: 77 - 0.42 * 40, size: 40 },
    { id: 'tulip', emoji: '🌷', x: 34, y: 77 - 0.42 * 10, size: 10 },
    { id: 'sun', emoji: '🌻', x: 150, y: 77 - 0.42 * 16, size: 16 },
    { id: 'turtle', emoji: 'prop:turtle-old', x: 8, y: TY, size: TS, flip: true },
    // 香蕉畫在他後面：踩到飛起來時不會蓋住他的臉，最後頂在頭上也像是坐在頭髮上
    { id: 'nana', emoji: '🍌', x: NANA, y: NY, size: NS, pivot: 'center', hidden: true },
    { id: 'kid', emoji: 'hero:yang/reach', x: NANA + 12, y: G, size: S },
    { id: 'bush', emoji: 'prop:bush', x: BUSH, y: 77 - 0.42 * 22, size: 22 },
  ],
  moves: [
    // 開場：彎腰把香蕉擺在路中間，摀嘴偷笑，倒退著踮腳躲到樹叢後面
    { at: 0.15, actor: 'nana', do: 'drop', dur: 0.3 },
    { at: 0.55, actor: 'kid', do: 'swap', emoji: 'hero:yang/giggle' },
    { at: 0.6, actor: 'kid', do: 'shake', amount: 0.5, dur: 0.35 },
    { at: 0.9, actor: 'kid', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: 0.9, actor: 'kid', do: 'moveTo', to: { x: HIDE, y: G }, dur: 0.4, ease: 'inOut' },
    { at: 1.3, actor: 'kid', do: 'swap', emoji: 'hero:yang/idle' },
    // 第一次：一屁股坐地
    ...p1.moves,
    ...back(p1.up),
    // 烏龜醒來，再慢慢走一步
    // 第二次：轉一圈整個人趴扁
    ...p2.moves,
    ...back(p2.up),
    // 第三次前停一拍：烏龜又停了，他跳起來又要衝——硬生生憋住，全身發抖
    { at: ITCH, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: ITCH, actor: 'kid', do: 'hop', amount: 3, dur: 0.2 },
    { at: HOLD, actor: 'kid', do: 'swap', emoji: 'hero:yang/hold' },
    { at: HOLD + 0.05, actor: 'kid', do: 'shake', amount: 0.6, dur: SQ - HOLD },
    // 烏龜醒來，慢慢踩上香蕉（太慢了，滑不倒）
    { at: STEP, actor: 'turtle', do: 'moveTo', to: { x: 63, y: TY }, dur: SQ - STEP, ease: 'linear' },
    { at: SQ - 0.1, actor: 'nana', do: 'squash', amount: 0.4, dur: 0.15 },
    // 噗！香蕉從烏龜腳底擠出來，飛向樹叢
    { at: SQ, actor: 'nana', do: 'moveTo', to: { x: DROP, y: NY }, arc: 16, dur: LAND3 - SQ, ease: 'linear' },
    { at: SQ, actor: 'nana', do: 'spin', times: 2, dur: LAND3 - SQ },
    // 他嚇一跳跳出來想躲——剛好落在香蕉上
    { at: SQ + 0.05, actor: 'kid', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: SQ + 0.08, actor: 'kid', do: 'moveTo', to: { x: DROP + 2, y: G }, arc: 7, dur: LAND3 - SQ - 0.05, ease: 'linear' },
    // 最慘的一次：腳飛起來、往後翻、栽進樹叢
    { at: H3, actor: 'kid', do: 'swap', emoji: 'hero:yang/slip' },
    { at: H3, actor: 'kid', do: 'moveTo', to: { x: BUSH + 4, y: G + 9 }, arc: 14, dur: CRASH - H3, ease: 'linear' },
    { at: H3, actor: 'kid', do: 'spin', times: -1, dur: CRASH - H3, pivot: 'center' },
    { at: H3, actor: 'nana', do: 'moveTo', to: { x: 110, y: 26 }, dur: 0.45, ease: 'out' },
    { at: H3, actor: 'nana', do: 'spin', times: 3, dur: 0.9 },
    { at: CRASH, actor: 'bush', do: 'shake', amount: 1.4, dur: 0.45 },
    { at: CRASH, actor: 'bush', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: CRASH, actor: 'turtle', do: 'shake', amount: 0.8, dur: 0.3 },
    // 頂著香蕉從樹叢裡跳出來，笑自己
    { at: POP, actor: 'kid', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: POP, actor: 'kid', do: 'moveTo', to: { x: POSE_X, y: G }, arc: 10, dur: 0.4, ease: 'out' },
    { at: H3 + 0.45, actor: 'nana', do: 'moveTo', to: { x: HEAD.x, y: HEAD.y - 14 }, dur: POP - H3 - 0.45, ease: 'inOut' },
    { at: POP, actor: 'nana', do: 'moveTo', to: HEAD, dur: 0.42, ease: 'bounce' },
    { at: POSE + 0.55, actor: 'kid', do: 'swap', emoji: 'hero:yang/happy' },
    { at: POSE + 0.55, actor: 'kid', do: 'hop', amount: 3, dur: 0.3 },
    { at: POSE + 0.55, actor: 'nana', do: 'hop', amount: 3, dur: 0.3 },
    // 換成舉手的姿勢頭低一點，香蕉跟著貼回頭頂
    { at: POSE + 0.55, actor: 'nana', do: 'moveTo', to: { x: HEAD.x - 1, y: HEAD.y + 5 }, dur: 0.08 },
  ],
  fx: [
    { at: 0.6, kind: 'burst', actor: 'nana', emoji: '✨', n: 4, dur: 0.5 },
    ...p1.fx,
    ...p2.fx,
    // 停一拍：憋到滿頭大汗；烏龜繼續打瞌睡
    { at: HOLD, kind: 'sweat', actor: 'kid', dur: SQ - HOLD },
    { at: SQ - 0.05, kind: 'puff', actor: 'nana', n: 6, dur: 0.4 },
    { at: H3 + 0.02, kind: 'puff', actor: 'kid', n: 6, dur: 0.4 },
    // 栽進樹叢：葉子噴出來＋最大的 💥
    { at: CRASH, kind: 'burst', x: BUSH, y: 54, n: 1, dur: 0.45, scale: 2.4 },
    { at: CRASH + 0.02, kind: 'burst', x: BUSH, y: 56, emoji: '🍃', n: 9, dur: 0.8, scale: 1.4 },
    { at: POSE, kind: 'burst', actor: 'kid', emoji: '✨', n: 10, dur: 0.9, scale: 1.4, dy: -12 },
    { at: POSE + 0.45, kind: 'burst', actor: 'kid', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4, dy: -16 },
  ],
  camera: [
    // 定住構圖：烏龜、香蕉、樹叢都在畫面裡，他夠大
    // 從 -0.3 秒就定好（第 0 格起就是這個構圖，自動取景不會先插一個推近的鏡頭進來）
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.4, to: look(86, 50, 1.4) },
    ...p1.camera,
    ...p2.camera,
    // 停一拍：推近他憋住的樣子（烏龜和香蕉還在畫面裡）
    { at: ITCH, dur: 0.6, do: 'zoom', amount: 1.5, to: look(92, 52, 1.5) },
    { at: CRASH, dur: 0.45, do: 'punch', amount: 0.12, to: { x: BUSH - 4, y: 58 } },
    { at: CRASH, dur: 0.45, do: 'shake', amount: 1.6 },
    // 亮相
    { at: POP, dur: 0.5, do: 'zoom', amount: 1.55, to: look(POSE_X - 4, 50, 1.55) },
  ],
  lights: [
    { at: p2.L, dur: 0.05, level: -0.2 },
    { at: p2.L + 0.05, dur: 0.3, level: 0 },
    { at: CRASH, dur: 0.05, level: -0.25 },
    { at: CRASH + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.15, sfx: 'plop' },
    { at: 0.9, sfx: 'tap' },
    ...p1.cues,
    ...p2.cues,
    { at: ITCH, sfx: 'blip' },
    { at: HOLD, sfx: 'blip' },
    { at: SQ, sfx: 'plop' },
    { at: H3, sfx: 'whoosh' },
    { at: H3 + 0.02, sfx: 'slide' },
    { at: CRASH, sfx: 'bonk' },
    { at: CRASH + 0.04, sfx: 'boing' },
    { at: CRASH + 0.08, sfx: 'crack' },
    { at: POSE, say: '怪傑佐羅力' },
    { at: POSE + 0.45, sfx: 'cheer' },
  ],
})
