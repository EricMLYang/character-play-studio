import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 慢（v2）：忍者小老鼠跟大蝸牛賽跑，他「咻」一下就到終點了，蝸牛還在中間慢慢爬。他愛現——每次「咻」地跑回起點再衝回來，
// 在牆前面「嘰——」地煞住，回頭一看：蝸牛只往前一點點。同一個笑點四次，只有他等得越來越誇張：跺腳（忄從他心裡蹦出來）、
// 打大哈欠（哈欠吹到蝸牛殼，曼的上半掉下來）、先停一拍再衝，回來直接倒地睡著（砰一聲，曼的又掉下來）。
// 回馬槍：他醒來看到蝸牛快到終點了，再「咻」一次——這次太快煞不住，一頭撞上牆被彈回來，蝸牛慢慢爬過終點線。
// 地上有起跑線，蝸牛身後拖一條亮亮的黏液：每次他回頭，痕跡就亮一下、冒一個 🤏——才這麼一點點。
// 最後他扛起終於到終點的蝸牛咻地跑掉，再一個人跑回來；畫面暗下來只剩「慢」，他轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「慢！」，然後咻地退場只留字。
// 慢、慢、慢吞吞、這是什麼字？、慢
const P = 65.2 // 小老鼠（size 28）站在地上的 y
const SN = 62.7 // 大蝸牛（size 34）
/** 小老鼠每次煞住的地方：終點旗跟牆中間（朝左看著蝸牛），身後留一段空地 */
const SPOT = 116
/** 終點旗 */
const FX = 86
/** 牆（右邊） */
const WX = 150
/** 撞上牆那一刻他的位置 */
const CRASH = 126
/** 起跑線（地上的白線）；蝸牛的尾巴從這裡出發，身後拖一條亮亮的黏液，就是牠爬了多遠的尺 */
const START = 35
/** 黏液痕跡貼在地上的 y、從蝸牛中心往後到尾巴多遠 */
const TRAIL_Y = 74.6, TAIL = 19
/** 煞住以後傻眼停多久 */
const HOLD = 0.45
/** 跑回起點、再衝回來：去 0.18 秒、回 0.25 秒 */
const OUT = 0.18, BACK = 0.25
/** 蝸牛：一整支都用同一個超慢的速度往右爬 */
const SNAIL0 = 54, SNAIL_V = 1.8, SNAIL_END = 10.65
/** 某一刻蝸牛尾巴在哪（黏液痕跡的前端） */
const tailAt = (t: number) => SNAIL0 + SNAIL_V * Math.min(t, SNAIL_END) - TAIL

/**
 * 「咻——嘰！」：往後蹲（anticipate）→ 咻地衝出左邊（回起點）→ 轉身咻地衝回來 → 在牆前面煞住（揚塵＋鏡頭震＋同一個音效），
 * 回頭看蝸牛、傻眼停 HOLD 秒。k 是第幾次（越後面越大）；brake = false 是回馬槍：煞不住，直接撞牆。
 */
function lap(at: number, k: number, brake = true) {
  const go = at - BACK - OUT
  const moves: Move[] = [
    { at: go - 0.12, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: go, actor: 'mouse', do: 'moveTo', to: { x: -30, y: P }, dur: OUT, anticipate: 5, ease: 'in' },
    { at: at - BACK, actor: 'mouse', do: 'flip' },
    { at: at - BACK, actor: 'mouse', do: 'moveTo', to: { x: brake ? SPOT : CRASH, y: P }, dur: BACK, ease: brake ? 'out' : 'in' },
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at, actor: 'mouse', do: 'squash', amount: 0.25 + 0.08 * k, dur: brake ? 0.25 : HOLD },
  ]
  // 煞住就轉回去看蝸牛；撞牆的那次臉還貼著牆
  if (brake) moves.push({ at, actor: 'mouse', do: 'flip' })
  const fx: Fx[] = brake
    ? [
        // 煞車揚起的一團塵土（在他腳後面），一次比一次大
        { at, kind: 'burst', x: SPOT - 4, y: 70, emoji: '💨', n: 4, dur: 0.4, scale: 1.3 + 0.2 * k },
        { at: at + 0.02, kind: 'puff', actor: 'mouse', dur: 0.4 },
        // 他回頭看的那一刻：黏液痕跡亮黃一下，旁邊冒一個 🤏「才這麼一點點」——短得可笑
        { at: at + 0.05, kind: 'line', actor: 'snail', dx: -TAIL, dy: TRAIL_Y - SN, to: { x: START, y: TRAIL_Y }, color: '#FFC300', width: 3.6, dur: HOLD + 0.2 },
        { at: at + 0.05, kind: 'pop', x: Math.min(START, tailAt(at)) - 14, y: 70, emoji: '🤏', dur: HOLD + 0.2, scale: 1.7 },
      ]
    : [{ at, kind: 'burst', x: CRASH + 6, y: P - 22, n: 1, dur: 0.45, scale: 2.4 }]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: 80, y: 60 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  ]
  const cues: Cue[] = [
    { at: go, sfx: 'whoosh' },
    { at: at - BACK, sfx: 'whoosh' },
    { at, sfx: brake ? 'slide' : 'bonk' },
  ]
  // 同一個音效，一次比一次多疊一個
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'tap' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' })
  return { moves, fx, camera, cues }
}

const H1 = 2.0, H2 = 3.8, H3 = 6.15, H4 = 9.45
const l1 = lap(H1, 0)
const l2 = lap(H2, 1)
const l3 = lap(H3, 2)
const l4 = lap(H4, 3, false)
/** 傻眼完開始反應的時刻 */
const R1 = H1 + HOLD, R2 = H2 + HOLD, R3 = H3 + HOLD
/** 蝸牛的頭碰到終點線 */
const CROSS = 10.3
/** 問他：他扛走蝸牛、再一個人咻地跑回來的時刻 */
const GRAB = 10.6
/** 倒地睡著那一下 */
const SLEEP = R3 + 0.1

const clip: Clip = {
  format: 2,
  char: '慢',
  meta: { theme: '小老鼠跟蝸牛賽跑', cast: '忍者小老鼠＋大蝸牛＋終點旗＋牆（地上起跑線、蝸牛的黏液痕跡）', gags: ['小老鼠愛現，每次咻地跑回起點再衝回來、在牆前面煞住，回頭一看蝸牛只爬了一點點，他等得一次比一次誇張（跺腳、打哈欠、倒地睡著）；回馬槍是他醒來再咻一次，太快煞不住撞上牆，蝸牛慢慢爬過終點'] },
  duration: 15,
  bg: { top: '#DDF0FF', bottom: '#F4FAFF', floor: '#E9A27A', scenery: 'track' },
  actors: [
    { id: 'wall', emoji: '🧱', x: WX, y: 61, size: 38 },
    { id: 'flag', emoji: '🏁', x: FX, y: 66.5, size: 25 },
    // 蝸牛朝右爬（往終點；3D 圖的蝸牛本來就朝右）
    { id: 'snail', emoji: '🐌', x: SNAIL0, y: SN, size: 34 },
    // 衝進來時朝右，煞住以後轉回去朝左看蝸牛
    { id: 'mouse', emoji: 'hero:mouse/dash', x: SPOT, y: P, size: 28, hidden: true, flip: true },
  ],
  moves: [
    // 蝸牛從頭到尾都用同一個超慢的速度爬（一秒只爬 2 格），爬過終點才被他扛走
    { at: 0, actor: 'snail', do: 'moveTo', to: { x: SNAIL0 + SNAIL_V * SNAIL_END, y: SN }, dur: SNAIL_END, ease: 'linear' },
    // 小老鼠咻地衝進來，一下就到終點，在牆前面煞住：我第一！擺忍者架式
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -30, y: P }, dur: 0.3, ease: 'out' },
    { at: 0.3, actor: 'mouse', do: 'flip' },
    { at: 0.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: 0.3, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.25 },
    // 第 1 次：咻——嘰！回頭一看，蝸牛只爬了一點點……跺腳
    ...l1.moves,
    { at: R1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/angry' },
    { at: R1 + 0.05, actor: 'mouse', do: 'hop', amount: 3, dur: 0.18 },
    { at: R1 + 0.3, actor: 'mouse', do: 'hop', amount: 3, dur: 0.18 },
    { at: R1 + 0.55, actor: 'mouse', do: 'hop', amount: 3, dur: 0.18 },
    // 第 2 次：咻——嘰！又只爬一點點……打一個大哈欠
    ...l2.moves,
    { at: R2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/yawn' },
    { at: R2, actor: 'mouse', do: 'squash', amount: -0.15, dur: 0.5 },
    { at: R2 + 0.55, actor: 'snail', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: R2 + 0.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 第 3 次前停一拍：托著下巴盯著蝸牛……再咻一次
    { at: 5.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: 5.1, actor: 'mouse', do: 'tilt', amount: 8, dur: 0.45 },
    ...l3.moves,
    // 還是只爬一點點：他直接倒地睡著，砰！
    { at: SLEEP, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sleep' },
    { at: SLEEP, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: SLEEP, actor: 'snail', do: 'hop', amount: 2, dur: 0.2 },
    // 字框填滿（鏡頭推近到國字）；語詞那一刻：鏡頭退回全景，蝸牛在正中間慢吞吞地爬，探出頭來
    { at: 8.2, actor: 'snail', do: 'scaleTo', amount: 1.12, dur: 0.35, ease: 'back' },
    { at: 8.3, actor: 'snail', do: 'tilt', amount: -6, dur: 0.6 },
    // 回馬槍（第 4 次）：他醒來，蝸牛快到終點了！再咻一次——這次太快煞不住，撞上牆
    { at: 8.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 8.75, actor: 'mouse', do: 'hop', amount: 5, dur: 0.25 },
    ...l4.moves,
    { at: H4 + HOLD, actor: 'wall', do: 'shake', amount: 0.6, dur: 0.2 },
    // 被彈回來（臉還朝著牆），摔扁在終點旗後面
    { at: H4 + HOLD, actor: 'mouse', do: 'moveTo', to: { x: 110, y: P }, arc: 8, dur: 0.35, ease: 'out' },
    { at: H4 + HOLD, actor: 'mouse', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    { at: H4 + HOLD + 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flat' },
    // 蝸牛慢慢爬過終點線
    { at: CROSS, actor: 'flag', do: 'tilt', amount: -12, dur: 0.4 },
    // 問他：他爬起來咻地扛起蝸牛（終於到終點了）衝出右邊，再一個人從左邊咻地跑回左前方、變大，轉向觀眾（朝右看著字）
    { at: GRAB, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: GRAB, actor: 'mouse', do: 'flip' },
    { at: GRAB, actor: 'mouse', do: 'moveTo', to: { x: SNAIL0 + SNAIL_V * SNAIL_END + 4, y: P }, dur: 0.1, ease: 'in' },
    { at: GRAB + 0.1, actor: 'mouse', do: 'flip' },
    { at: GRAB + 0.1, actor: 'mouse', do: 'moveTo', to: { x: 200, y: P }, dur: 0.16, ease: 'in' },
    { at: GRAB + 0.1, actor: 'snail', do: 'moveTo', to: { x: 215, y: SN }, dur: 0.16, ease: 'in' },
    { at: GRAB + 0.27, actor: 'mouse', do: 'moveTo', to: { x: -40, y: P + 4 }, dur: 0.01 },
    { at: GRAB + 0.27, actor: 'mouse', do: 'scaleTo', amount: 1.4, dur: 0.01 },
    { at: GRAB + 0.28, actor: 'mouse', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.18, ease: 'out' },
    { at: GRAB + 0.46, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 11.95, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 13.5, actor: 'mouse', do: 'hop', amount: 6, dur: 0.22 },
    // 退場：他咻地跑掉，帶起的風把終點旗和牆也一起捲走，畫面只留下字
    { at: 13.72, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 13.72, actor: 'mouse', do: 'moveTo', to: { x: 200, y: P + 4 }, dur: 0.2, ease: 'in' },
    { at: 13.74, actor: 'flag', do: 'moveTo', to: { x: 210, y: 40 }, dur: 0.18, ease: 'in' },
    { at: 13.74, actor: 'flag', do: 'spin', times: 1, dur: 0.18, pivot: 'center' },
    { at: 13.78, actor: 'wall', do: 'moveTo', to: { x: 215, y: 50 }, dur: 0.18, ease: 'in' },
    { at: 13.78, actor: 'wall', do: 'spin', times: 1, dur: 0.18, pivot: 'center' },
  ],
  builds: [
    // 第 1 次：等得心裡好急，跺腳——忄從他心裡蹦出來
    { at: R1 + 0.1, dur: 0.55, strokes: [0, 1, 2], from: 'mouse', color: partColor('忄') },
    // 第 2 次：大哈欠吹到蝸牛殼，殼一抖，曼的上半（日、罒）掉下來
    { at: R2 + 0.55, dur: 0.6, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: 'snail', color: partColor('曼') },
    // 第 3 次：他砰地倒地睡著，地一震，曼的又從殼上震下來
    { at: SLEEP + 0.05, dur: 0.5, strokes: [12, 13], from: 'snail', color: partColor('曼') },
  ],
  glyph: [
    // 字框填滿：國字不 home（大蝸牛就在正中間，home 到正中央會被殼擋住下半），改成鏡頭推近到字框，字在畫面上一樣變大、在中間
    { at: 7.4, dur: 0.4, do: 'pulse' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.8, dur: 3.18, do: 'ask', keep: ['mouse'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.85, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 地上的白色起跑線（借終點旗當錨點，畫在 START）
    { at: 0, kind: 'line', actor: 'flag', dx: START - FX, dy: 73 - 66.5, to: { x: START - 3, y: 89 }, color: '#FFFFFF', width: 1.8, dur: GRAB + 0.1 },
    // 蝸牛身後亮亮的黏液痕跡：從起跑線拉到牠的尾巴，跟著牠慢慢變長（被扛走就沒了）
    { at: 0, kind: 'line', actor: 'snail', dx: -TAIL, dy: TRAIL_Y - SN, to: { x: START, y: TRAIL_Y }, color: '#7FD0FF', width: 2.8, dur: GRAB + 0.1 },
    ...l1.fx,
    { at: H1 + 0.1, kind: 'sweat', actor: 'mouse' },
    ...l2.fx,
    // 大哈欠：一串 💨 吹向蝸牛
    { at: R2 + 0.1, kind: 'blow', actor: 'mouse', target: 'snail', dx: -6, dy: -4, n: 4, dur: 0.55, scale: 1.3 },
    // 第 3 次前停一拍：盯著蝸牛看
    { at: 5.15, kind: 'pop', actor: 'mouse', emoji: '👀', dx: -4, dur: 0.5, scale: 1.3 },
    ...l3.fx,
    // 睡著：大大的 zzz（往左偏，不疊在國字上）
    { at: SLEEP + 0.2, kind: 'zzz', actor: 'mouse', dx: -8, dy: 2, dur: 2.4, scale: 1.5 },
    // 醒來：蝸牛快到終點了！
    { at: 8.75, kind: 'pop', actor: 'mouse', emoji: '❗', dx: -2, dur: 0.45, scale: 1.6 },
    ...l4.fx,
    { at: H4 + 0.05, kind: 'burst', x: CRASH + 2, y: P - 20, emoji: '⭐', n: 6, dur: 0.45 },
    { at: H4 + HOLD + 0.4, kind: 'dizzy', actor: 'mouse', dur: 0.4 },
    // 蝸牛爬過終點線：彩帶
    { at: CROSS, kind: 'burst', x: FX - 6, y: 52, emoji: '🎉', n: 7, dur: 0.55, scale: 1.8 },
    { at: 13.5, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 自動取景會跟著他衝出畫面、把蝸牛切掉——前三次鏡頭自己框住蝸牛到牆這一段（稍微推近，他的反應才看得清楚）
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.15, to: { x: 86, y: 50 } },
    ...l1.camera,
    ...l2.camera,
    ...l3.camera,
    { at: SLEEP, dur: 0.3, do: 'shake', amount: 1.6 },
    { at: 6.85, dur: 0.35, do: 'zoom', amount: 1 },
    // 字框填滿：推近到國字（代替 home），停到第二聲「慢」唸完再退回全景
    { at: 7.3, dur: 0.4, do: 'zoom', amount: 1.6, to: { x: 80, y: 22 } },
    { at: 8.15, dur: 0.4, do: 'zoom', amount: 1 },
    // 回馬槍：同樣框住整條跑道，撞牆時鏡頭不跟著他跑
    { at: 8.6, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 84, y: 46 } },
    ...l4.camera,
    { at: H4, dur: 0.4, do: 'shake', amount: 2.6 },
    { at: 10.45, dur: 0.3, do: 'zoom', amount: 1 },
  ],
  lights: [
    { at: H4, dur: 0.04, level: -0.45 },
    { at: H4 + 0.04, dur: 0.25, level: 0 },
    { at: 7.3, dur: 0.05, level: -0.35 },
    { at: 7.35, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 0.3, sfx: 'slide' },
    { at: 0.8, say: '慢' },
    ...l1.cues,
    ...[0.05, 0.3, 0.55].map((d): Cue => ({ at: R1 + d + 0.18, sfx: 'tap' })),
    ...l2.cues,
    { at: R2 + 0.55, sfx: 'poof' },
    ...l3.cues,
    { at: SLEEP, sfx: 'plop' },
    { at: 7.4, say: '慢' },
    { at: 8.4, say: '慢吞吞' },
    ...l4.cues,
    { at: H4 + 0.04, sfx: 'boing' },
    { at: H4 + 0.08, sfx: 'crack' },
    { at: H4 + 0.12, sfx: 'rumble' },
    { at: CROSS, sfx: 'clink' },
    { at: GRAB, sfx: 'whoosh' },
    { at: 11.05, say: FIXED_LINES.clipAsk },
    { at: 13.55, say: '慢' },
    { at: 13.58, sfx: 'cheer' },
    { at: 13.72, sfx: 'whoosh' },
  ],
}

export default clip
