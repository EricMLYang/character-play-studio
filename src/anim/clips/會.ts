import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 會（v2）：愛現的浣熊花生，看到一樣會動的東西滾過來，就一手握拳舉高、一手拍胸脯：「會！」（我會騎！）——
// 跳上去，才往前滾一下就歪歪扭扭、左搖右晃，車子「咻」地從腳底下衝出去，他「哇」地往後飛、摔個四腳朝天。
// 每次都是同一個「拍胸脯→會！→跳上去→歪歪扭扭→車子衝走、他往後摔」，只有東西一次比一次難、摔得一次比一次慘：
// 滑板，一屁股跌坐（人從他身上震出來）→ 滑板車，往後飛、躺平四腳朝天（中間那一塊）→
// 先停一拍：一台好大的腳踏車滾過來，他看著它傻眼、吞口水、冒汗發抖⋯⋯還是拍胸脯「會！」——飛上天轉一圈、趴扁（日）。
// 回馬槍（第四次）：腳踏車又滾回來，他又拍胸脯跳上去，晃兩下——咦？穩了！穩穩地騎著走，這次真的「學會」了。
// 他得意地放開雙手⋯⋯又開始歪歪扭扭，車子衝走，他飛得最高、摔得最慘，四腳朝天頭暈。
// 最後畫面暗下來只剩「會」，他跳到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「會！」，然後退場只留字。
// 會、會、會、會、學會、這是什麼字？、會
const SZ = 36
const P = 77 - 0.42 * SZ // 花生（size 36）站在地上的 y
/** 他每次站的地方（面向左邊，看著車子）；車子每次停的地方；車子從左邊畫面外滾進來、衝出去也是往左 */
const RX = 128
const VX = 86
const OUT = -40

/** 三樣會動的東西：越來越難、越來越大。圖都是車頭朝左。lift 是他站上去要抬高多少、dx 是他站在車子的哪裡 */
type Ride = { id: string; size: number; y: number; lift: number; dx: number; pose: string }
const BOARD: Ride = { id: 'board', size: 28, y: 70.5, lift: 4.5, dx: 0, pose: 'surprised' }
const SCOOT: Ride = { id: 'scooter', size: 38, y: 77 - 0.42 * 38, lift: 5, dx: 8, pose: 'push' }
const BIKE: Ride = { id: 'bike', size: 48, y: 77 - 0.42 * 48, lift: 11, dx: 5, pose: 'push' }
const at = (r: Ride, x: number) => ({ x, y: r.y })
const rider = (r: Ride, x: number) => ({ x: x + r.dx, y: P - r.lift })

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 拍胸脯「會！」：一手握拳舉高、一手拍胸口（know），踮腳彈一下。每次同一個姿勢、同一個聲音 */
function brag(S: number, say: boolean) {
  g.moves.push(
    { at: S, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/know' },
    { at: S, actor: 'coon', do: 'hop', amount: 2.5, dur: 0.22 },
    { at: S + 0.12, actor: 'coon', do: 'squash', amount: 0.12, dur: 0.15 },
  )
  g.cues.push({ at: S, sfx: 'tap' }, { at: S + 0.14, sfx: 'tap' })
  if (say) g.cues.push({ at: S + 0.02, say: '會' })
}

/** 歪歪扭扭：左右晃 n 下，一下比一下大（他以腳底為支點晃、車子跟著晃一點） */
function wobble(W: number, id: string, n: number, amp: number, step = 0.17) {
  for (let i = 0; i < n; i++) {
    const a = amp * (0.6 + (0.4 * i) / Math.max(1, n - 1)) * (i % 2 ? -1 : 1)
    g.moves.push(
      { at: W + i * step, actor: 'coon', do: 'tilt', amount: a, dur: step },
      { at: W + i * step, actor: id, do: 'tilt', amount: a * 0.35, dur: step },
    )
  }
}

/** 跳上去：往左一跳落在車子上 */
function hopOn(H: number, r: Ride, x: number) {
  g.moves.push(
    { at: H, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/jump' },
    { at: H, actor: 'coon', do: 'moveTo', to: rider(r, x), arc: 7, dur: 0.22, ease: 'linear' },
    { at: H + 0.22, actor: 'coon', do: 'swap', emoji: `hero:raccoon/${r.pose}` },
    { at: H + 0.22, actor: r.id, do: 'squash', amount: 0.15, dur: 0.15 },
  )
  g.cues.push({ at: H + 0.22, sfx: 'boing' })
}

/**
 * 車子「咻」地從腳底下往左衝出去、他「哇」地往後飛、摔下來那一下：k 是第幾次（越後面越慘）。
 * from 是他飛出去的地方、land 是落地的 x。回傳落地的時間。
 */
function crash(C: number, k: number, r: Ride, from: number, land: number): number {
  const fly = 0.3 + 0.08 * k
  const L = C + fly
  g.moves.push(
    { at: C, actor: r.id, do: 'moveTo', to: at(r, OUT), dur: 0.32, ease: 'in' },
    { at: C, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/slip' },
    { at: C, actor: 'coon', do: 'moveTo', to: { x: land, y: P }, arc: [8, 16, 30, 30][k], dur: fly, ease: 'linear' },
  )
  if (k >= 2) g.moves.push({ at: C, actor: 'coon', do: 'spin', times: k === 3 ? 2 : 1, dur: fly, pivot: 'center' })
  g.cues.push({ at: C, sfx: 'whoosh' })
  g.camera.push({ at: C, dur: 0.3, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: from, y: 55 } })
  // 落地：一屁股跌坐 → 躺平四腳朝天 → 趴扁 → 躺平四腳朝天＋頭暈
  const pose = ['fall', 'slip', 'flat', 'slip'][k]
  g.moves.push({ at: L, actor: 'coon', do: 'swap', emoji: `hero:raccoon/${pose}` })
  if (pose === 'slip') g.moves.push({ at: L, actor: 'coon', do: 'rotateTo', amount: 55, dur: 0.08 })
  // 💥 在他撞到地的那一點（屁股、背），不蓋住臉
  const bang = [{ x: 10, y: 70 }, { x: -12, y: 70 }, { x: 8, y: 66 }, { x: -12, y: 70 }][k]
  g.fx.push({ at: L, kind: 'burst', x: land + bang.x, y: bang.y, emoji: '💥', n: 1, dur: 0.45, scale: 2 + 0.5 * k })
  g.camera.push({ at: L, dur: 0.35, do: 'shake', amount: 0.7 + 0.5 * k })
  g.cues.push({ at: L, sfx: 'bonk' })
  if (k >= 1) g.cues.push({ at: L + 0.03, sfx: 'rumble' })
  return L
}

/** 爬起來、走回原來站的地方 */
function getUp(U: number, rotated: boolean) {
  g.moves.push({ at: U, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' })
  if (rotated) g.moves.push({ at: U, actor: 'coon', do: 'rotateTo', amount: -55, dur: 0.12 })
  g.moves.push({ at: U + 0.05, actor: 'coon', do: 'moveTo', to: { x: RX, y: P }, dur: 0.3 })
}

/**
 * 同一個笑點：車子停好（R）→ 拍胸脯「會！」→ 跳上去 → 往前滾一下就歪歪扭扭 → 車子衝走、他往後摔，飛出一塊字。
 * pause 是第三次多停的那一拍。回傳落地的時間。
 */
function brave(R: number, k: number, r: Ride, pause: number, land: number, strokes: number[], color: string): number {
  if (pause) {
    // 停一拍：看著好大的腳踏車傻眼、吞口水、冒汗發抖
    g.moves.push(
      { at: R + 0.05, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
      { at: R + 0.3, actor: 'coon', do: 'shake', amount: 0.7, dur: pause - 0.2 },
    )
    g.fx.push({ at: R + 0.2, kind: 'sweat', actor: 'coon', dx: 6 })
    g.cues.push({ at: R + 0.3, sfx: 'gulp' })
  }
  const S = R + 0.3 + pause
  brag(S, true)
  const H = S + 0.3
  hopOn(H, r, VX)
  const ON = H + 0.22
  // 往前（往左）滾一小段，越滾越歪
  const W = ON + 0.08
  const go = 14
  g.moves.push(
    { at: W, actor: r.id, do: 'moveTo', to: at(r, VX - go), dur: 0.45, ease: 'linear' },
    { at: W, actor: 'coon', do: 'moveTo', to: rider(r, VX - go), dur: 0.45, ease: 'linear' },
    { at: W + 0.15, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  )
  wobble(W, r.id, 3, 10 + 4 * k, 0.15)
  g.fx.push({ at: W + 0.15, kind: 'sweat', actor: 'coon', dx: 6 })
  g.cues.push({ at: W, sfx: 'slide' })
  const C = W + 0.42
  const L = crash(C, k, r, VX - go + r.dx, land)
  g.builds.push({ at: L + 0.03, dur: 0.5, strokes, from: 'coon', color })
  return L
}

const L1 = brave(0.1, 0, BOARD, 0, 114, [0, 1], partColor('人'))
getUp(L1 + 0.35, false)
// 下一樣從左邊滾進來
const R2 = L1 + 0.36
const L2 = brave(R2, 1, SCOOT, 0, 120, [2, 3, 4, 5, 6, 7, 8], partColor('會中'))
getUp(L2 + 0.35, true)
const R3 = L2 + 0.36
const L3 = brave(R3, 2, BIKE, 0.55, RX + 2, [9, 10, 11, 12], partColor('日'))
const HOME = L3 + 0.55
const PARK = HOME + 0.82

/** 回馬槍（第四次）：腳踏車又滾回來，他又拍胸脯跳上去，晃兩下——穩了！學會了。得意放開雙手，又歪歪扭扭、摔得最慘 */
const UP4 = HOME + 0.25
const R4 = PARK
const S4 = R4 + 0.35
const H4 = S4 + 0.28
const ON4 = H4 + 0.22
const STEADY = ON4 + 0.3
const RIDE = 0.8
const END = VX - 22 // 騎到哪裡
const LEARN = STEADY + 0.05
const NOHANDS = STEADY + RIDE - 0.3
const W4 = STEADY + RIDE
const C4 = W4 + 0.33
const LAND4 = 104
const L4 = C4 + 0.3 + 0.08 * 3
const ASK = L4 + 0.45

{
  // 爬起來（字回中央的時候他在右邊，不擋字）
  g.moves.push(
    { at: UP4, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: UP4, actor: 'coon', do: 'moveTo', to: { x: RX, y: P }, dur: 0.2 },
  )
  brag(S4, false)
  g.cues.push({ at: S4 + 0.02, sfx: 'blip' })
  hopOn(H4, BIKE, VX)
  // 晃兩下……穩了
  wobble(ON4 + 0.02, 'bike', 2, 8, 0.15)
  g.moves.push(
    { at: ON4 + 0.05, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: STEADY, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/push' },
    { at: STEADY, actor: 'bike', do: 'moveTo', to: at(BIKE, END), dur: RIDE + 0.33, ease: 'linear' },
    { at: STEADY, actor: 'coon', do: 'moveTo', to: rider(BIKE, END), dur: RIDE + 0.33, ease: 'linear' },
    // 騎得穩穩的，輕輕上下顛
    { at: STEADY, actor: 'bike', do: 'bounce', amount: 0.8, times: 4, dur: RIDE },
    { at: STEADY, actor: 'coon', do: 'bounce', amount: 0.8, times: 4, dur: RIDE },
    // 得意地放開雙手
    { at: NOHANDS, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: NOHANDS, actor: 'coon', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: W4 + 0.05, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  )
  g.fx.push(
    { at: STEADY + 0.05, kind: 'burst', actor: 'coon', emoji: '✨', n: 6, dur: 0.6, scale: 1.4 },
  )
  g.cues.push({ at: STEADY + 0.05, sfx: 'blip' }, { at: NOHANDS, sfx: 'tap' }, { at: W4, sfx: 'slide' })
  wobble(W4, 'bike', 3, 20, 0.13)
}
crash(C4, 3, BIKE, END + BIKE.dx, LAND4)

const clip: Clip = {
  format: 2,
  char: '會',
  meta: { theme: '愛現的花生說「我會！」', cast: '浣熊花生＋滑板、滑板車、腳踏車', gags: ['愛現的花生每次拍胸脯「會！」跳上一樣會動的東西，往前一滾就歪歪扭扭，車子咻地從腳底衝走、他往後摔，一次比一次難、摔得越慘（滑板，跌坐→滑板車，躺平四腳朝天→停一拍，看著好大的腳踏車吞口水冒汗還是拍胸脯，飛上天轉一圈趴扁）；回馬槍是他終於騎穩了「學會」，得意地放開雙手，又歪歪扭扭摔得最慘'] },
  duration: ASK + 3.85,
  // 晴天草地：太陽在右上，字框放左上（背後只有天空）；他站右邊，車子從左邊滾進來、往左衝走，他往右後方摔
  bg: { top: '#DCEFFF', bottom: '#F5FAFF', floor: '#C9E3A5', scenery: 'hills' },
  actors: [
    { id: 'board', emoji: '🛹', ...at(BOARD, VX), size: BOARD.size, pivot: 'center' },
    { id: 'scooter', emoji: '🛴', ...at(SCOOT, OUT), size: SCOOT.size },
    { id: 'bike', emoji: '🚲', ...at(BIKE, OUT), size: BIKE.size },
    { id: 'coon', emoji: 'hero:raccoon/idle', x: RX, y: P, size: SZ, hidden: true },
  ],
  moves: [
    // 滑板的圖是斜的：轉平、壓扁一點，看起來像側面
    { at: 0, actor: 'board', do: 'rotateTo', amount: 38, dur: 0 },
    { at: 0, actor: 'board', do: 'stretchTo', amount: 1.3, dur: 0 },
    { at: 0, actor: 'coon', do: 'pop', dur: 0.3 },
    ...g.moves,
    // 滑板車、腳踏車從左邊滾進來
    { at: R2 - 0.1, actor: 'scooter', do: 'moveTo', to: at(SCOOT, VX), dur: 0.42, ease: 'out' },
    { at: R3 - 0.1, actor: 'bike', do: 'moveTo', to: at(BIKE, VX), dur: 0.5, ease: 'out' },
    { at: R4 + 0.15, actor: 'bike', do: 'moveTo', to: at(BIKE, VX), dur: 0.35, ease: 'out' },
    // 問他：他爬起來變大站到左前方，面向國字
    { at: ASK, actor: 'coon', do: 'rotateTo', amount: -55, dur: 0.05 },
    { at: ASK, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK, actor: 'coon', do: 'flip' },
    { at: ASK, actor: 'coon', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: ASK - 0.05, actor: 'coon', do: 'moveTo', to: { x: 34, y: P + 2 }, dur: 0.2 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: ASK + 1.05, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: ASK + 1.05, actor: 'coon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: ASK + 1.55, actor: 'coon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK + 2.0, actor: 'coon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ASK + 2.52, actor: 'coon', do: 'rotateTo', amount: -10, dur: 0.1 },
    { at: ASK + 2.52, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ASK + 2.52, actor: 'coon', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: ASK + 2.68, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ASK + 2.68, actor: 'coon', do: 'flip' },
    { at: ASK + 2.68, actor: 'coon', do: 'moveTo', to: { x: -45, y: P + 2 }, dur: 0.15, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    // 字框一開始就在左上角（背後只有天空）
    { at: 0, dur: 0, do: 'park', to: { x: 27, y: 24 }, amount: 0.52 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: { x: 27, y: 24 }, amount: 0.52 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: ASK, dur: 2.85, do: 'ask', keep: ['coon'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.12, dur: 0.4, do: 'home' },
    { at: ASK + 2.52, dur: 0.3, do: 'pulse' },
    { at: ASK + 3.0, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    { at: L2 + 0.1, kind: 'dizzy', actor: 'coon', dur: 0.3 },
    { at: L3 + 0.1, kind: 'dizzy', actor: 'coon', dur: 0.5 },
    { at: L4 + 0.08, kind: 'dizzy', actor: 'coon', dur: ASK - L4 - 0.12 },
    { at: ASK + 2.52, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 整段保持幾乎全景（擋掉自動取景往前預看、把飛出去的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 46 } },
    ...g.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.18 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...g.cues,
    { at: R2 - 0.1, sfx: 'slide' },
    { at: R3 - 0.1, sfx: 'rumble' },
    { at: HOME + 0.15, say: '會' },
    { at: R4 + 0.15, sfx: 'slide' },
    { at: LEARN, say: '學會' },
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: ASK + 2.54, say: '會' },
    { at: ASK + 2.56, sfx: 'cheer' },
  ],
}

export default clip
