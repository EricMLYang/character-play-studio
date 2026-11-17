// 演的是字面意思：米＋老鼠——小老鼠偷咬一大袋米，每咬一口破洞就噴出更多米，最後整袋爆開把他埋住，他卻把整座米山吃光，變成圓滾滾的老鼠（老鼠是自家的紅頭巾小老鼠，沒有黑色圓耳朵、紅褲子、白手套）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小老鼠偷咬米袋——每咬一口，破洞就「噗」地噴出更多米。
// 同一個撲上去咬、同一個破洞、同一聲「嘶」，三次只有結果越來越大：噴出一小撮（他開心吃掉）→ 噴他滿頭、一大堆把他推倒（他又吃掉，肚子圓了一點）
// → 先停一拍（他盯著米袋流口水、蓄力），用力一大口，整袋「砰」地爆開，米山從天上倒下來把他埋掉。
// 回馬槍是同一堆米的第四次：米山靜悄悄……「咕嚕、咕嚕、咕嚕」一口一口變小，原來他把整座米山吃光了，坐在那裡變成圓滾滾的「米老鼠」。
const S = 34 // 小老鼠的 size
const M = 77 - 0.42 * S // 小老鼠站在地上的 y
const STAND = 66 // 每次咬之前站的地方
const BITE = 75 // 撲上去咬的地方（嘴巴剛好在袋子破洞）
const BAG = { x: 106, size: 42 }
const BY = 77 - 0.42 * BAG.size
const HOLE = { x: 90, y: 64 } // 袋子左下角的破洞
const PILE = 12 // 米堆的 size（雪球圖染成米白、壓扁）
const RICE = 'grayscale(0.85) sepia(0.25) brightness(1.06)'
/** 米粒：小顆的米白雪球圖（⚪ 的 3D 圖偏紫，看起來像泡泡） */
const GRAIN = 'prop:snowball'

/** 撲上去咬米袋（每一次都一樣）：往上一縮蓄力 → 撲到破洞張嘴咬 → 袋子一震、破洞噴米。k 越大噴越多、震越大、音效多疊一個。p 是咬下去那一刻 */
function bite(p: number, k: number) {
  const moves: Move[] = [
    { at: p - 0.32, actor: 'rat', do: 'squash', amount: -0.18 - 0.06 * k, dur: 0.2 },
    { at: p - 0.12, actor: 'rat', do: 'swap', emoji: 'hero:mouse/eat' },
    { at: p - 0.12, actor: 'rat', do: 'moveTo', to: { x: BITE, y: M }, dur: 0.12, ease: 'in' },
    { at: p, actor: 'bag', do: 'squash', amount: 0.06 + 0.05 * k, dur: 0.25 },
    { at: p, actor: 'bag', do: 'shake', amount: 0.8 + 0.7 * k, dur: 0.35 },
  ]
  const fx: Fx[] = [
    // 破洞噴米：一次比一次多、比一次高
    { at: p + 0.05, kind: 'fountain', x: HOLE.x, y: HOLE.y, emoji: GRAIN, n: 5 + 6 * k, dur: 0.7 + 0.2 * k, scale: 1 + 0.3 * k },
    { at: p + 0.02, kind: 'burst', x: HOLE.x, y: HOLE.y - 2, emoji: GRAIN, n: 4 + 4 * k, dur: 0.5, scale: 1 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: p, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: HOLE.x - 6, y: 56 } },
    { at: p, dur: 0.25 + 0.1 * k, do: 'shake', amount: 0.4 + 0.5 * k },
  ]
  // 同一個音效（咬破「嘶」＋米灑出來），一次比一次多疊一個
  const cues: Cue[] = [{ at: p, sfx: 'crack' }, { at: p + 0.05, sfx: 'slide' }]
  if (k >= 1) cues.push({ at: p + 0.1, sfx: 'plop' })
  if (k >= 2) cues.push({ at: p + 0.15, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 吃一口米堆：低頭張嘴、米堆變小、「咕嚕」 */
function gulp(at: number, shrink: number): Move[] {
  return [
    { at, actor: 'rat', do: 'squash', amount: 0.12, dur: 0.2 },
    { at, actor: 'pile', do: 'scaleTo', amount: shrink, dur: 0.2, ease: 'out' },
    { at, actor: 'pile', do: 'squash', amount: 0.15, dur: 0.2 },
  ]
}

const P1 = 1.9, P2 = 3.75, P3 = 6.7
const b1 = bite(P1, 0)
const b2 = bite(P2, 1)
const b3 = bite(P3, 2)
const LAND = P3 + 0.5 // 米山砸下來
const EAT = LAND + 1.0 // 米山開始一口一口變小
const DONE = EAT + 1.15 // 吃光了
const POSE = DONE + 0.35 // 亮相

export default scene({
  duration: POSE + 1.5,
  bg: { top: '#FFC98A', bottom: '#FFF0D2', floor: '#B98B55', scenery: 'hills' },
  actors: [
    { id: 'wheat1', emoji: '🌾', x: 22, y: 77 - 0.42 * 24, size: 24 },
    { id: 'wheat2', emoji: '🌾', x: 142, y: 77 - 0.42 * 26, size: 26 },
    { id: 'bag', emoji: 'prop:flour', x: BAG.x, y: BY, size: BAG.size },
    { id: 'rat', emoji: 'hero:mouse/sneak', x: STAND, y: M, size: S, flip: true, hidden: true },
    // 米堆畫在小老鼠前面：最後那座米山要蓋住他
    { id: 'pile', emoji: 'prop:snowball', x: 88, y: 77 - 0.42 * PILE, size: PILE, hidden: true, tint: RICE },
  ],
  moves: [
    // 開場：踮腳溜進來，回頭看看有沒有人……看到米袋，流口水
    { at: 0, actor: 'rat', do: 'enter', from: { x: 18, y: M }, dur: 0.85, ease: 'out' },
    { at: 0.9, actor: 'rat', do: 'swap', emoji: 'hero:mouse/back' },
    { at: 0.9, actor: 'rat', do: 'flip' },
    { at: 1.25, actor: 'rat', do: 'flip' },
    { at: 1.25, actor: 'rat', do: 'swap', emoji: 'hero:mouse/drool' },

    // 第一次：一小撮米，他開心地吃掉
    ...b1.moves,
    { at: P1 + 0.12, actor: 'pile', do: 'pop', dur: 0.2 },
    { at: P1 + 0.12, actor: 'pile', do: 'stretchTo', amount: 1.5, dur: 0.2 },
    { at: P1 + 0.35, actor: 'rat', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: P1 + 0.35, actor: 'rat', do: 'hop', amount: 4, dur: 0.3 },
    { at: P1 + 0.8, actor: 'rat', do: 'swap', emoji: 'hero:mouse/eat' },
    ...gulp(P1 + 0.9, 0.6),
    { at: P1 + 1.15, actor: 'pile', do: 'vanish', dur: 0.15 },
    { at: P1 + 1.3, actor: 'rat', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: P1 + 1.3, actor: 'rat', do: 'moveTo', to: { x: STAND, y: M }, dur: 0.3, ease: 'out' },

    // 第二次：噴他滿頭，一大堆米把他推倒；他坐起來又吃掉，肚子圓了一點
    { at: P2 - 0.6, actor: 'rat', do: 'swap', emoji: 'hero:mouse/drool' },
    ...b2.moves,
    { at: P2 + 0.1, actor: 'rat', do: 'swap', emoji: 'hero:mouse/fall' },
    { at: P2 + 0.1, actor: 'rat', do: 'moveTo', to: { x: STAND - 6, y: M }, dur: 0.25, ease: 'out' },
    { at: P2 + 0.1, actor: 'pile', do: 'moveTo', to: { x: 84, y: 77 - 0.42 * PILE }, dur: 0.01 },
    { at: P2 + 0.15, actor: 'pile', do: 'pop', dur: 0.25 },
    { at: P2 + 0.15, actor: 'pile', do: 'scaleTo', amount: 1.7, dur: 0.25, ease: 'back' },
    { at: P2 + 0.15, actor: 'pile', do: 'stretchTo', amount: 1.5, dur: 0.25 },
    { at: P2 + 0.85, actor: 'rat', do: 'swap', emoji: 'hero:mouse/eat' },
    { at: P2 + 0.85, actor: 'rat', do: 'moveTo', to: { x: STAND + 2, y: M }, dur: 0.15 },
    ...gulp(P2 + 1.0, 0.7),
    ...gulp(P2 + 1.3, 0.5),
    { at: P2 + 1.5, actor: 'pile', do: 'vanish', dur: 0.15 },
    { at: P2 + 1.35, actor: 'rat', do: 'stretchTo', amount: 1.1, dur: 0.25, ease: 'back' },
    { at: P2 + 1.65, actor: 'rat', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: P2 + 1.65, actor: 'rat', do: 'hop', amount: 3, dur: 0.3 },

    // 停一拍：他盯著米袋流口水、搓手；米袋自己抖了一下
    { at: 5.6, actor: 'rat', do: 'swap', emoji: 'hero:mouse/drool' },
    { at: 5.6, actor: 'rat', do: 'moveTo', to: { x: STAND, y: M }, dur: 0.2 },
    { at: 5.85, actor: 'bag', do: 'tilt', amount: 4, dur: 0.4 },
    { at: 6.05, actor: 'rat', do: 'swap', emoji: 'hero:mouse/stance' },

    // 第三次：用力一大口——整袋砰地爆開，米山從天上倒下來把他埋掉
    ...b3.moves,
    { at: P3 + 0.02, actor: 'bag', do: 'scaleTo', amount: 1.12, dur: 0.1, ease: 'out' },
    { at: P3 + 0.12, actor: 'bag', do: 'stretchTo', amount: 1.5, dur: 0.3, ease: 'bounce' },
    { at: P3 + 0.12, actor: 'bag', do: 'scaleTo', amount: 0.62, dur: 0.3, ease: 'bounce' },
    { at: P3 + 0.12, actor: 'bag', do: 'moveTo', to: { x: BAG.x + 8, y: BY }, dur: 0.3 },
    { at: P3 + 0.12, actor: 'rat', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: P3 + 0.12, actor: 'rat', do: 'moveTo', to: { x: STAND + 2, y: M }, dur: 0.15, ease: 'out' },
    { at: P3, actor: 'pile', do: 'moveTo', to: { x: STAND + 4, y: 77 - 0.42 * PILE }, dur: 0.01 },
    { at: P3 + 0.15, actor: 'pile', do: 'drop', dur: 0.35 },
    { at: P3 + 0.15, actor: 'pile', do: 'scaleTo', amount: 2.9, dur: 0.01 },
    { at: P3 + 0.15, actor: 'pile', do: 'stretchTo', amount: 1.45, dur: 0.01 },
    { at: LAND, actor: 'rat', do: 'swap', emoji: 'hero:mouse/flat' },
    { at: LAND, actor: 'pile', do: 'squash', amount: 0.2, dur: 0.3 },

    // 回馬槍：米山靜悄悄……咕嚕、咕嚕、咕嚕，一口一口變小——他把整座吃光了
    { at: EAT - 0.35, actor: 'pile', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: EAT - 0.1, actor: 'rat', do: 'swap', emoji: 'hero:mouse/full' },
    { at: EAT - 0.1, actor: 'rat', do: 'stretchTo', amount: 1 / 1.1, dur: 0.01 },
    ...gulp(EAT, 0.8),
    ...gulp(EAT + 0.35, 0.75),
    ...gulp(EAT + 0.7, 0.6),
    { at: EAT, actor: 'rat', do: 'scaleTo', amount: 1.06, dur: 0.2, ease: 'back' },
    { at: EAT + 0.35, actor: 'rat', do: 'scaleTo', amount: 1.06, dur: 0.2, ease: 'back' },
    { at: EAT + 0.7, actor: 'rat', do: 'scaleTo', amount: 1.06, dur: 0.2, ease: 'back' },
    { at: EAT + 0.95, actor: 'pile', do: 'vanish', dur: 0.2 },
    // 打一個飽嗝，亮相
    { at: DONE, actor: 'rat', do: 'hop', amount: 3, dur: 0.25 },
    { at: POSE, actor: 'rat', do: 'scaleTo', amount: 1.1, dur: 0.3, ease: 'back' },
    { at: POSE + 0.5, actor: 'rat', do: 'tilt', amount: 6, dur: 0.5 },
  ],
  fx: [
    ...b1.fx,
    ...b2.fx,
    // 米粒灑他滿頭
    { at: P2 + 0.15, kind: 'rain', actor: 'rat', emoji: GRAIN, n: 8, dur: 0.7, scale: 1.3 },
    { at: P2 + 0.35, kind: 'puff', actor: 'rat', n: 5, dur: 0.4 },
    // 停一拍：口水
    { at: 5.7, kind: 'sweat', actor: 'rat', dx: 4, dur: 0.7 },
    ...b3.fx,
    // 整袋爆開
    { at: P3 + 0.1, kind: 'burst', x: BAG.x, y: BY - 8, n: 1, dur: 0.45, scale: 2.2 },
    { at: P3 + 0.12, kind: 'fountain', x: BAG.x - 6, y: BY - 10, emoji: GRAIN, n: 9, dur: 1.0, scale: 1.4 },
    { at: LAND, kind: 'puff', actor: 'pile', n: 10, dur: 0.6 },
    { at: LAND, kind: 'burst', actor: 'pile', emoji: GRAIN, n: 10, dur: 0.6, scale: 1.4 },
    // 吃米山：每一口噴幾粒
    { at: EAT, kind: 'burst', actor: 'pile', emoji: GRAIN, n: 5, dur: 0.35, scale: 1.2 },
    { at: EAT + 0.35, kind: 'burst', actor: 'pile', emoji: GRAIN, n: 5, dur: 0.35, scale: 1.2 },
    { at: EAT + 0.7, kind: 'burst', actor: 'pile', emoji: GRAIN, n: 5, dur: 0.35, scale: 1.2 },
    // 飽嗝噴出一粒米
    { at: DONE, kind: 'pop', actor: 'rat', emoji: GRAIN, dur: 0.5, scale: 1.4 },
    { at: POSE, kind: 'burst', actor: 'rat', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.3, kind: 'burst', actor: 'rat', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：小老鼠和米袋都在畫面裡、夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: { x: 84, y: 52 } },
    ...b1.camera,
    ...b2.camera,
    // 停一拍時慢慢推近
    { at: 5.6, dur: 0.9, do: 'zoom', amount: 1.45, to: { x: 82, y: 52 } },
    ...b3.camera,
    { at: LAND, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: LAND + 0.3, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 80, y: 52 } },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.55, to: { x: 74, y: 52 } },
  ],
  lights: [
    // 整袋爆開：一閃
    { at: P3 + 0.1, dur: 0.05, level: -0.4 },
    { at: P3 + 0.15, dur: 0.4, level: 0 },
    // 亮相：一閃
    { at: POSE, dur: 0.05, level: -0.3 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'tap' },
    { at: 0.9, sfx: 'blip' },
    ...b1.cues,
    { at: P1 + 0.9, sfx: 'gulp' },
    ...b2.cues,
    { at: P2 + 1.0, sfx: 'gulp' },
    { at: P2 + 1.3, sfx: 'gulp' },
    { at: 5.85, sfx: 'blip' },
    ...b3.cues,
    { at: LAND, sfx: 'bonk' },
    { at: EAT, sfx: 'gulp' },
    { at: EAT + 0.35, sfx: 'gulp' },
    { at: EAT + 0.7, sfx: 'gulp' },
    { at: DONE, sfx: 'hic' },
    { at: POSE + 0.1, say: '米老鼠' },
    { at: POSE + 0.3, sfx: 'cheer' },
  ],
})
