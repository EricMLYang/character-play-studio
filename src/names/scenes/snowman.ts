// 演的是字面意思：雪（雪做的）＋寶（寶寶）——一個雪做的小寶寶怕太陽，太陽一照就融化一截；最後下大雪，他反而長得比誰都大（沒有三根頭髮、樹枝手、大門牙，不想過夏天）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小騎士想幫雪寶寶擋太陽，一舉起亮晶晶的盾牌，陽光就反射到雪寶寶身上——「滋」，他融掉一截。
// 同一個舉盾、同一道反光、同一聲「滋」，三次只有結果變大：滴幾滴水 → 矮一大截、地上一攤水 → 先停一拍（騎士看看盾牌、
// 雪寶寶拚命搖頭），還是舉了——融成一小坨扁扁的。回馬槍是第四次：騎士照樣舉盾，這次把盾牌往天上斜，反光打到頭上的雲，
// 雲抖一抖下起大雪，雪寶寶越長越大，比一開始還大：「雪寶」。
// 場景：天剛亮的雪地（靛藍到粉紅的天空），太陽每照一次就更高一點、天更亮一點；下雪時天又暗回冷冷的藍。
const S = 35 // 雪寶寶的 size
const SN = 77 - 0.42 * S // 雪寶寶站在地上的 y
const SX = 104 // 雪寶寶站的地方（每次都在這裡被照）
const K = 24 // 小騎士的 size
const KY = 77 - 0.42 * K
const KX = 62
const SHIELD = { dx: 6, dy: 3 } // 盾牌在騎士身上的位置（相對中心）
const PUD = 14 // 地上那攤水（💧 壓扁）
const PY = 77 - 0.42 * PUD + 3
const SUN = { x: 140, y: 52 }
const CLOUD = { x: 70, y: 27 }
const SUNLIGHT = '#FFE27A'
/** 被照到以後傻眼停多久 */
const HOLD = 0.55
/** 太陽每次升到哪、天亮到哪 */
const RISE = [
  { y: 44, s: 1, light: 0.3 },
  { y: 36, s: 1.15, light: 0.16 },
  { y: 34, s: 1.1, light: 0 },
]
/** 每次融掉多少（倍率會累乘）：0.82 → 0.66 → 0.46，而且越來越扁 */
const MELT = [
  { s: 0.82, w: 1 },
  { s: 0.8, w: 1.12 },
  { s: 0.7, w: 1.25 },
]
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 騎士舉盾（每一次都一模一樣：蹲一下蓄力、跳起來把盾牌亮出來、盾牌一閃）。r 是盾牌亮出來那一刻 */
function raise(r: number) {
  const moves: Move[] = [
    { at: r - 0.25, actor: 'knight', do: 'squash', amount: -0.18, dur: 0.15 },
    { at: r - 0.1, actor: 'knight', do: 'swap', emoji: 'hero:warrior/shield' },
    { at: r - 0.1, actor: 'knight', do: 'hop', amount: 3, dur: 0.25 },
  ]
  const fx: Fx[] = [{ at: r, kind: 'burst', actor: 'knight', emoji: '✨', n: 3, dx: SHIELD.dx, dy: 10, dur: 0.45, scale: 1.3 }]
  const cues: Cue[] = [{ at: r, sfx: 'clink' }]
  return { moves, fx, cues }
}

/**
 * 主軸笑點：太陽升高一點、天亮一點 → 雪寶寶冒汗 → 騎士舉盾 → 陽光打在盾牌上反射到雪寶寶 →「滋」融掉一截、傻眼。
 * k 是第幾次（0、1、2），越後面光越粗、水滴越多、地上那攤水越大。h 是反光打到雪寶寶那一刻；回傳 end＝傻眼停完的時間。
 */
function shine(h: number, k: number) {
  const rise = RISE[k]
  const melt = MELT[k]
  const r = raise(h - 0.15)
  const moves: Move[] = [
    // 太陽升高一點
    ...(k === 0 ? [{ at: h - 1.0, actor: 'sun', do: 'pop', dur: 0.25 } as Move] : []),
    { at: h - 1.0, actor: 'sun', do: 'moveTo', to: { x: SUN.x - 3 * k, y: rise.y }, dur: 0.5, ease: 'out' },
    ...(rise.s !== 1 ? [{ at: h - 1.0, actor: 'sun', do: 'scaleTo', amount: rise.s, dur: 0.5, ease: 'out' } as Move] : []),
    // 雪寶寶緊張得發抖
    { at: h - 0.55, actor: 'snow', do: 'shake', amount: 0.4 + 0.2 * k, dur: 0.35 },
    ...r.moves,
    // 滋——融掉一截、變扁，傻眼抖著
    { at: h, actor: 'snow', do: 'scaleTo', amount: melt.s, dur: 0.35, ease: 'in' },
    ...(melt.w !== 1 ? [{ at: h, actor: 'snow', do: 'stretchTo', amount: melt.w, dur: 0.35, ease: 'in' } as Move] : []),
    { at: h + 0.05, actor: 'snow', do: 'shake', amount: 0.6 + 0.4 * k, dur: HOLD - 0.1 },
    { at: h + 0.1, actor: 'knight', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: h + HOLD + 0.05, actor: 'knight', do: 'swap', emoji: 'hero:warrior/idle' },
  ]
  // 地上那攤水：第一次冒出來，之後一次比一次大
  if (k === 0) {
    // 先 pop 再壓扁（pop 會把 stretchTo 歸零）
    moves.push({ at: h + 0.12, actor: 'pud', do: 'pop', dur: 0.25 })
    moves.push({ at: h + 0.13, actor: 'pud', do: 'stretchTo', amount: 2.6, dur: 0.25, ease: 'out' })
  } else {
    moves.push({ at: h + 0.15, actor: 'pud', do: 'scaleTo', amount: 1.2, dur: 0.35, ease: 'out' })
    moves.push({ at: h + 0.15, actor: 'pud', do: 'stretchTo', amount: 1.15, dur: 0.35, ease: 'out' })
  }
  const fx: Fx[] = [
    ...r.fx,
    { at: h - 0.55, kind: 'sweat', actor: 'snow', dur: 0.6 },
    // 陽光：太陽 → 盾牌 → 雪寶寶，一次比一次粗
    { at: h - 0.15, kind: 'line', actor: 'sun', to: { x: KX + SHIELD.dx, y: KY + SHIELD.dy }, color: SUNLIGHT, width: 1.2 + 0.6 * k, dur: 0.5 + 0.15 * k },
    { at: h - 0.03, kind: 'line', actor: 'knight', dx: SHIELD.dx, dy: SHIELD.dy, to: { x: SX - 3, y: SN - 2 }, color: SUNLIGHT, width: 1.6 + 0.8 * k, dur: 0.45 + 0.15 * k },
    // 融化：滴水、冒白煙
    { at: h + 0.05, kind: 'rain', actor: 'snow', emoji: '💧', n: 3 + 3 * k, dur: 0.6 + 0.15 * k, scale: 1.2 + 0.15 * k },
    { at: h + 0.1, kind: 'puff', actor: 'snow', n: 5 + 3 * k, dur: 0.6 },
    { at: h + 0.25, kind: 'burst', x: SX, y: 74, emoji: '💦', n: 2 + 2 * k, dur: 0.5, scale: 1.1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at: h, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: SX, y: SN } },
    { at: h, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.5 + 0.4 * k },
  ]
  // 同一個「滋」（洩氣聲），一次比一次多疊一個
  const cues: Cue[] = [{ at: h - 1.0, sfx: 'blip' }, ...r.cues, { at: h, sfx: 'deflate' }]
  if (k >= 1) cues.push({ at: h + 0.15, sfx: 'splash' })
  if (k >= 2) cues.push({ at: h + 0.3, sfx: 'plop' })
  return { moves, fx, camera, cues, end: h + HOLD }
}

const H1 = 1.6, H2 = 3.5, H3 = 6.1
const s1 = shine(H1, 0)
const s2 = shine(H2, 1)
const s3 = shine(H3, 2)
// 回馬槍：同一個舉盾，這次盾牌往天上斜，反光打到雲
const R4 = 7.55
const r4 = raise(R4)
const HIT = R4 + 0.12 // 反光打到雲
const SNOW = HIT + 0.35 // 開始下大雪
const GROW = SNOW + 0.3
const LAND = GROW + 0.7 // 長到最大、亮相
/** 長回來的總倍率：從 0.46 長到 1.12 倍大 */
const SHRUNK = MELT.reduce((a, m) => a * m.s, 1)
const WIDE = MELT.reduce((a, m) => a * m.w, 1)

export default scene({
  duration: 10.8,
  bg: { top: '#2E3270', bottom: '#F4A6B8', floor: '#EEF1FA', scenery: 'snow' },
  actors: [
    { id: 'sun', emoji: '🌞', x: SUN.x, y: SUN.y, size: 20, float: true, hidden: true },
    { id: 'cloud', emoji: '☁️', x: CLOUD.x, y: CLOUD.y, size: 26, float: true },
    { id: 'pud', emoji: '💧', x: SX, y: PY, size: PUD, hidden: true, tint: 'saturate(0.7) brightness(1.15)' },
    { id: 'knight', emoji: 'hero:warrior/idle', x: KX, y: KY, size: K },
    { id: 'snow', emoji: '⛄', x: SX, y: SN, size: S },
  ],
  moves: [
    // 開場：雪寶寶開心蹦一下、騎士也跳一下打招呼
    { at: 0.1, actor: 'snow', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.3, actor: 'snow', do: 'hop', amount: 4, dur: 0.35 },
    { at: 0.45, actor: 'knight', do: 'hop', amount: 3, dur: 0.3 },
    ...s1.moves,
    ...s2.moves,
    // 第三次前停一拍：騎士歪頭看看自己的盾牌……雪寶寶拚命搖頭「不要！」
    { at: s2.end + 0.35, actor: 'knight', do: 'tilt', amount: -14, dur: 0.6 },
    { at: s2.end + 0.5, actor: 'snow', do: 'tilt', amount: 12, dur: 0.22 },
    { at: s2.end + 0.75, actor: 'snow', do: 'tilt', amount: -12, dur: 0.22 },
    { at: s2.end + 1.0, actor: 'snow', do: 'tilt', amount: 12, dur: 0.22 },
    ...s3.moves,
    // 融成一小坨，騎士看著他，不好意思
    { at: s3.end + 0.2, actor: 'knight', do: 'tilt', amount: 10, dur: 0.4 },
    // 回馬槍：騎士照樣舉盾，這次整個人往後仰、盾牌朝天
    ...r4.moves,
    { at: R4 - 0.1, actor: 'knight', do: 'rotateTo', amount: -18, dur: 0.15, ease: 'out' },
    { at: R4 + 0.1, actor: 'snow', do: 'squash', amount: 0.2, dur: 0.3 },
    // 雲被照到，抖一抖，飄到雪寶寶頭上
    { at: HIT, actor: 'cloud', do: 'shake', amount: 1, dur: 0.35 },
    { at: HIT + 0.1, actor: 'cloud', do: 'swap', emoji: '🌨️' },
    { at: HIT + 0.1, actor: 'cloud', do: 'moveTo', to: { x: SX - 4, y: 25 }, dur: 0.4, ease: 'out' },
    { at: HIT + 0.1, actor: 'cloud', do: 'scaleTo', amount: 1.2, dur: 0.4, ease: 'out' },
    // 太陽躲到雲後面、縮小溜走
    { at: SNOW, actor: 'sun', do: 'moveTo', to: { x: 166, y: 18 }, dur: 0.6, ease: 'in' },
    { at: SNOW, actor: 'sun', do: 'scaleTo', amount: 0.6, dur: 0.6, ease: 'in' },
    { at: SNOW, actor: 'knight', do: 'rotateTo', amount: 18, dur: 0.3, ease: 'out' },
    { at: SNOW + 0.05, actor: 'knight', do: 'swap', emoji: 'hero:warrior/surprised' },
    // 地上的水結回雪、雪寶寶越長越大（一口氣長回圓滾滾，還更大）
    { at: GROW, actor: 'pud', do: 'scaleTo', amount: 0.2, dur: 0.4, ease: 'in' },
    { at: GROW + 0.4, actor: 'pud', do: 'vanish', dur: 0.1 },
    { at: GROW, actor: 'snow', do: 'stretchTo', amount: 1 / WIDE, dur: 0.6, ease: 'back' },
    { at: GROW, actor: 'snow', do: 'scaleTo', amount: 1.12 / SHRUNK, dur: 0.7, ease: 'back' },
    { at: GROW, actor: 'snow', do: 'shake', amount: 0.5, dur: 0.6 },
    // 亮相
    { at: LAND, actor: 'snow', do: 'hop', amount: 3, dur: 0.35 },
    { at: LAND, actor: 'knight', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: LAND, actor: 'knight', do: 'hop', amount: 4, dur: 0.35 },
  ],
  fx: [
    ...s1.fx,
    ...s2.fx,
    { at: s2.end + 0.5, kind: 'sweat', actor: 'snow', dur: 0.8 },
    ...s3.fx,
    { at: s3.end, kind: 'puff', actor: 'snow', n: 6, dur: 0.9 },
    ...r4.fx,
    // 陽光：太陽 → 盾牌 → 往天上打到雲
    { at: R4, kind: 'line', actor: 'sun', to: { x: KX + SHIELD.dx, y: KY + SHIELD.dy - 2 }, color: SUNLIGHT, width: 2.4, dur: 0.6 },
    { at: R4 + 0.08, kind: 'line', actor: 'knight', dx: SHIELD.dx, dy: SHIELD.dy - 2, to: { x: CLOUD.x, y: CLOUD.y + 4 }, color: SUNLIGHT, width: 2.8, dur: 0.5 },
    { at: HIT, kind: 'burst', actor: 'cloud', emoji: '✨', n: 6, dy: 14, dur: 0.5, scale: 1.4 },
    // 大雪
    { at: SNOW, kind: 'rain', actor: 'cloud', emoji: '❄️', n: 12, dy: 8, dur: LAND - SNOW - 0.1, scale: 1.3 },
    { at: GROW + 0.1, kind: 'puff', actor: 'snow', n: 8, dur: 0.7 },
    { at: LAND, kind: 'burst', actor: 'snow', emoji: '✨', n: 8, dy: -10, dur: 0.8, scale: 2 },
    { at: LAND + 0.4, kind: 'burst', actor: 'knight', emoji: '🎉', n: 6, dy: -2, dur: 0.9, scale: 1.2 },
  ],
  camera: [
    // 定住構圖：太陽、騎士、雪寶寶都在畫面裡，雪寶寶夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: look(98, 51, 1.3) },
    ...s1.camera,
    ...s2.camera,
    // 停一拍時慢慢推近
    { at: s2.end + 0.3, dur: 0.8, do: 'zoom', amount: 1.4, to: look(95, 53, 1.4) },
    ...s3.camera,
    // 回馬槍：退一點，雲也要在畫面裡
    { at: s3.end + 0.3, dur: 0.5, do: 'zoom', amount: 1.25, to: look(92, 50, 1.25) },
    { at: HIT, dur: 0.3, do: 'shake', amount: 0.8 },
    // 亮相
    { at: GROW + 0.2, dur: 0.6, do: 'zoom', amount: 1.45, to: look(SX - 10, 50, 1.45) },
    { at: LAND, dur: 0.3, do: 'shake', amount: 1 },
  ],
  lights: [
    // 天剛亮：暗暗的靛藍，太陽每升一次就亮一階，反光打到那一刻閃一下
    { at: 0, dur: 0.01, level: 0.45 },
    { at: H1 - 1.0, dur: 0.5, level: RISE[0].light },
    { at: H1, dur: 0.05, level: 0.1 },
    { at: H1 + 0.05, dur: 0.3, level: RISE[0].light },
    { at: H2 - 1.0, dur: 0.5, level: RISE[1].light },
    { at: H2, dur: 0.05, level: -0.1 },
    { at: H2 + 0.05, dur: 0.3, level: RISE[1].light },
    { at: H3 - 1.0, dur: 0.5, level: RISE[2].light },
    { at: H3, dur: 0.05, level: -0.35 },
    { at: H3 + 0.05, dur: 0.4, level: RISE[2].light },
    // 下大雪：天又暗回冷冷的
    { at: SNOW, dur: 0.6, level: 0.25 },
    { at: LAND, dur: 0.05, level: -0.3 },
    { at: LAND + 0.05, dur: 0.4, level: 0.12 },
  ],
  cues: [
    { at: 0.3, sfx: 'boing' },
    ...s1.cues,
    ...s2.cues,
    { at: s2.end + 0.5, sfx: 'blip' },
    { at: s2.end + 0.75, sfx: 'blip' },
    ...s3.cues,
    ...r4.cues,
    { at: HIT, sfx: 'laser' },
    { at: SNOW, sfx: 'poof' },
    { at: GROW, sfx: 'rumble' },
    { at: LAND, sfx: 'bonk' },
    { at: LAND + 0.15, say: '雪寶' },
    { at: LAND + 0.45, sfx: 'cheer' },
  ],
})
