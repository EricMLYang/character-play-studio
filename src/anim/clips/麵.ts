import { baseActorsAt } from '../clip'
import type { ActorState, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 麵（v2）：吸不完的麵條。左邊一大碗拉麵，豬探長從碗裡叼起一根麵，嘟起嘴「咻——」地吸，可是麵條怎麼吸都吸不完，
// 吸到最後，麵條的尾巴「啵」地從碗裡跳出來、「啪」地甩回來打他，麵條一次比一次長、打得一次比一次慘：
// 吸一小口，尾巴甩到臉上、黏成一團（麥的上半）→ 吸好久，他一路往後退到畫面另一邊，麵條拉得橫過整個畫面，尾巴飛過來把他打趴（麥的下半夂）→
// 先停一拍：他拿放大鏡看看這根麵、冒汗——再吸！退到底還吸不完，他原地轉圈把麵捲到身上，尾巴甩過來把他捆成一顆粽子（面）。
// 字拼好放大時，他被捆在右邊、碗在左邊。語詞：他轉圈把麵條鬆開，長長的一根麵條橫在畫面中間：「麵條」，他一口吸光，閉眼得意。
// 回馬槍（第四次）：他回去再叼一根，站穩用力一吸——這次尾巴沒跳出來，整個碗被「咻」地拉過來，「啪」地倒扣在他頭上，麵條從碗口垂下來掛在他臉上。
// 他把碗往後一丟，畫面暗下來只剩「麵」，他問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「麵！」，然後退場只留字。
// 刻意不跟「飯」（餵飯不張嘴）、「餃」（燙到噴火）、「粥」（燙到彈起來）、「喝」（吸光肚子鼓）、「辣」（辣到）、「拉」（拉繩子拉出東西）、
// 「長」（拉蛇尾巴拉出好長一條）撞，也不演喝湯、不演燙：這支只演「嘟嘴吸麵條 → 吸不完 → 尾巴啪地甩回來」。
// 麵、麵、麵條、這是什麼字？、麵

type V = Vec

/** 豬探長（size 34，圖朝左：碗在他左邊，不用 flip） */
const PS = 34
const PY = 77 - 0.42 * PS
/** 每一次都從同一個地方開始吸（碗的右邊） */
const STAND = 55
/** 第 2、3 次一路往後退到這裡（右邊；國字回中央放大時他被捆在這裡，讓開字） */
const FAR = 139
/** 一大碗拉麵（prop:noodles，筷子和夾起來的麵在圖的右上）：畫面上最大的東西，靠左站，國字放大時剛好讓開 */
const BS = 40
const BX = 21
const BY = 77 - 0.42 * BS
/** 麵條從碗裡的這一點出來（夾起來那一撮麵的上緣；以碗的中心為準） */
const SRC_OFF: V = { x: 1.2, y: -8.5 }
/** 豬探長嘟起來的嘴（blow 姿勢，以他的中心為準）、臉的中心 */
const MOUTH: V = { x: -2.9, y: -1.1 }
const FACE: V = { x: 0, y: -5.8 }
/** 麵條：Q 彈的黃色 */
const NOODLE = '#FFC928'
const NW = 2.4

/** 四次「啪」的時間 */
const H1 = 1.55
const H2 = 3.6
const H3 = 6.47
const H4 = 10.25
/** 尾巴從碗裡跳出來、甩到他身上要多久 */
const WHIP = 0.22
/** 國字拼好、放大、讓位 */
const DONE = H3 + 0.55
const HOME = DONE + 0.05
const PARK = HOME + 0.93
/** 語詞那一刻 */
const WORD = PARK + 0.5
/** 問他 */
const ASK = 11.05
const ASK_SAY = 11.12
const ANSWER = 13.62

// ---------- 麵條的形狀 ----------
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y })
const mix = (a: V, b: V, k: number): V => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (p: number) => { const q = clamp01(p); return q * q * (3 - 2 * q) }

/** 從 a 到 b 的一根彎彎曲曲的麵條：amp 是彎的幅度、cyc 是幾個彎、ph 讓彎往 b（嘴巴）那邊跑（吸的感覺）、sag 是往下垂多少 */
function wavy(a: V, b: V, amp: number, cyc: number, ph = 0, sag = 0): V[] {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  const n = Math.max(2, Math.round(len / 3))
  const nx = len ? -(b.y - a.y) / len : 0, ny = len ? (b.x - a.x) / len : 0
  const pts: V[] = []
  for (let i = 0; i <= n; i++) {
    const s = i / n
    const env = Math.min(1, s / 0.15, (1 - s) / 0.15)
    const w = amp * env * Math.sin(2 * Math.PI * cyc * s - ph)
    pts.push({ x: a.x + (b.x - a.x) * s + nx * w, y: a.y + (b.y - a.y) * s + ny * w + sag * 4 * s * (1 - s) })
  }
  return pts
}
/** 尾巴從 a 飛到 b 的弧線上（p 0～1），弧頂比兩端高 lift */
const arcPt = (a: V, b: V, p: number, lift: number): V => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p - lift * 4 * p * (1 - p) })
/** 捆在身上的麵：從腳往上一圈一圈（看得到的是前面那一段，左右來回），loops 可以是小數（捲到一半） */
function coils(c: V, loops: number, half = 10.5, bottom = 73, top = 60): V[] {
  const pts: V[] = []
  const steps = Math.max(1, Math.ceil(loops * 2))
  for (let i = 0; i <= steps; i++) {
    const u = Math.min(i, loops * 2)
    const y = bottom - (bottom - top) * (u / 6)
    const side = i % 2 === 0 ? -1 : 1
    pts.push({ x: c.x + side * half * (0.85 + 0.15 * Math.sin(i)), y })
    if (u >= loops * 2) break
  }
  return pts
}

type Shape = { pts: V[]; mouth?: boolean }
const mouthOf = (p: ActorState): V => add(p, MOUTH)
const faceOf = (p: ActorState): V => add(p, FACE)
const srcOf = (b: ActorState): V => {
  // 碗以中心為支點轉：出口跟著轉
  const r = (b.r * Math.PI) / 180
  return { x: b.x + SRC_OFF.x * Math.cos(r) - SRC_OFF.y * Math.sin(r), y: b.y + SRC_OFF.x * Math.sin(r) + SRC_OFF.y * Math.cos(r) }
}

/** 一次「叼起來 → 吸 → 尾巴跳出來甩過去」：G 叼起、S 開始吸、W 尾巴開始飛、H 打中（H 以後由各自的 after 接手） */
type Beat = { G: number; S: number; H: number; amp: number; lift: number; land: (p: ActorState) => V; after: (t: number, p: ActorState, b: ActorState) => Shape[] | null; until: number; spin?: [number, number] }

const beats: Beat[] = []

/** 第 1 次：麵條黏在臉上（一團彎彎的） */
const faceMess = (p: ActorState, k = 1): V[] => {
  const f = faceOf(p)
  return wavy({ x: f.x - 7.5 * k, y: f.y + 2 }, { x: f.x + 7.5 * k, y: f.y - 1.5 }, 2.6 * k, 2.5)
}

function shapesAt(t: number, p: ActorState, b: ActorState): Shape[] {
  for (const bt of beats) {
    if (t < bt.G || t >= bt.until) continue
    const M = mouthOf(p)
    const S0 = srcOf(b)
    // 叼起來：從碗裡長到嘴巴
    if (t < bt.S) {
      const g = smooth((t - bt.G) / 0.15)
      return [{ pts: wavy(S0, mix(S0, M, g), bt.amp * 0.6, 1.2), mouth: g >= 1 }]
    }
    const W = bt.H - WHIP
    // 吸：彎彎往嘴巴跑；第 3 次後半段原地轉圈，麵捲到身上
    if (t < W) {
      const len = Math.hypot(M.x - S0.x, M.y - S0.y)
      const ph = (t - bt.S) * 26
      if (bt.spin && t >= bt.spin[0]) {
        const k = clamp01((t - bt.spin[0]) / (bt.spin[1] - bt.spin[0]))
        const c = { x: p.x, y: 0 }
        const cl = coils(c, 0.3 + 2.4 * k)
        return [{ pts: [...wavy(S0, cl[cl.length - 1], bt.amp, len / 13, ph)] }, { pts: cl }]
      }
      return [{ pts: wavy(S0, M, bt.amp, Math.max(1.3, len / 13), ph), mouth: true }]
    }
    // 尾巴「啵」地跳出來，沿弧線甩到他身上
    if (t < bt.H) {
      const k = smooth((t - W) / WHIP)
      const L = bt.land(p)
      const T = arcPt(S0, L, k, bt.lift)
      if (bt.spin) {
        const cl = coils({ x: p.x, y: 0 }, 2.7)
        return [{ pts: wavy(T, cl[cl.length - 1], 2.5, 2.5) }, { pts: cl }]
      }
      return [{ pts: wavy(T, M, 2.5 + bt.amp * 0.5, 2.5, 0, -3 * (1 - k)), mouth: true }]
    }
    return bt.after(t, p, b) ?? []
  }
  return []
}

// 第 1 次：吸一小口 → 尾巴甩到臉上黏成一團 → 過一會兒「咻」吸進去
const SLURP1 = H1 + 0.45
beats.push({
  G: 1.0, S: 1.1, H: H1, amp: 1.6, lift: 14, until: SLURP1 + 0.2,
  land: (p) => add(faceOf(p), { x: -7.5, y: 2 }),
  after: (t, p) => {
    const M = mouthOf(p)
    if (t < SLURP1) return [{ pts: [M, ...faceMess(p)] }]
    const k = smooth((t - SLURP1) / 0.2)
    return [{ pts: [M, ...faceMess(p).map((q) => mix(q, M, k))] }]
  },
})
// 第 2 次：一路往後退，麵條拉得橫過整個畫面 → 尾巴飛過來把他打趴、蓋在背上 → 起來時吸進去
const UP2 = H2 + 0.5
beats.push({
  G: 2.25, S: 2.35, H: H2, amp: 2.4, lift: 12, until: UP2 + 0.2,
  land: (p) => ({ x: p.x - 13, y: 66 }),
  after: (t, p) => {
    const drape = wavy({ x: FAR - 14, y: 67.5 }, { x: FAR + 14, y: 66.5 }, 3.2, 3.5)
    if (t < UP2) return [{ pts: drape }]
    const M = mouthOf(p)
    const k = smooth((t - UP2) / 0.2)
    return [{ pts: drape.map((q) => mix(q, M, k)) }]
  },
})
// 第 3 次：退到底還吸不完，原地轉圈把麵捲到身上 → 尾巴甩過來捆成一顆粽子；語詞那一刻轉圈鬆開，長長一根橫在畫面中間，一口吸光
const SPIN3: [number, number] = [5.8, H3 - WHIP]
const UNWIND = PARK + 0.05
/** 語詞那一刻他站的地方 */
const WORDX = 106
const WORD_SLURP = WORD + 0.4
/** 第 4 次：走回原位、叼起來 */
const WALK4 = WORD_SLURP + 0.3
const G4 = WALK4 + 0.35
beats.push({
  G: 5.15, S: 5.25, H: H3, amp: 2.4, lift: 12, spin: SPIN3, until: WORD_SLURP + 0.3,
  land: (p) => ({ x: p.x - 10, y: 58 }),
  after: (t, p) => {
    const c = { x: p.x, y: 0 }
    if (t < UNWIND) return [{ pts: coils(c, 3) }]
    const M = mouthOf(p)
    const far: V = { x: 34, y: 64 }
    if (t < UNWIND + 0.4) {
      // 轉圈鬆開：圈數變少，鬆開的那一截往左攤開
      const k = smooth((t - UNWIND) / 0.4)
      const cl = coils(c, 3 * (1 - k) + 0.01)
      const end = mix(cl[cl.length - 1], far, k)
      return [{ pts: [...cl, ...wavy(cl[cl.length - 1], end, 3 * k, 4 * k).slice(1)] }]
    }
    if (t < WORD_SLURP) return [{ pts: wavy(far, M, 3.2, 4, (t - UNWIND - 0.4) * 3), mouth: true }]
    const k = smooth((t - WORD_SLURP) / 0.3)
    return [{ pts: wavy(mix(far, M, k), M, 3.2 * (1 - k * 0.7), 4 * (1 - k) + 0.5, (t - WORD_SLURP) * 30), mouth: true }]
  },
})
// 第 4 次（回馬槍）：站穩用力一吸——整個碗被拉過來，倒扣在他頭上；麵從碗口垂下來
const THROW = H4 + 0.38
const BOWL_HEAD: V = { x: STAND, y: 54.5 }
/** 第 4 次的麵條：吸 → 碗飛過來（麵越來越短）→ 倒扣在頭上，三撮麵從碗口垂下來（跟著碗動） */
function shapes4(t: number, p: ActorState, b: ActorState): Shape[] {
  const M = mouthOf(p)
  const S0 = srcOf(b)
  if (t < H4 - 0.3) {
    if (t < G4 + 0.07) {
      const g = smooth((t - G4) / 0.07)
      return [{ pts: wavy(S0, mix(S0, M, g), 1.2, 1.2), mouth: g >= 1 }]
    }
    const len = Math.hypot(M.x - S0.x, M.y - S0.y)
    return [{ pts: wavy(S0, M, 1.4, Math.max(1.3, len / 13), (t - G4 - 0.07) * 34), mouth: true }]
  }
  if (t < H4) return [{ pts: wavy(S0, M, 1, 1.5), mouth: true }]
  // 倒扣：碗口在下面（碗轉了 180 度），三撮麵從碗口垂下來
  const r = (b.r * Math.PI) / 180
  const at = (dx: number, dy: number): V => ({ x: b.x + dx * Math.cos(r) - dy * Math.sin(r), y: b.y + dx * Math.sin(r) + dy * Math.cos(r) })
  const drop = clamp01((t - H4) / 0.25)
  return [-11, -1, 10].map((dx, i) => {
    const top = at(dx, -4.5)
    return { pts: wavy(top, { x: top.x + (i - 1) * 1.5, y: top.y + (9 + 3 * (i % 2)) * (0.3 + 0.7 * drop) }, 1.4, 1.5) }
  })
}

// ---------- 四次「啪」：同一個音效、同一個 💥，一次比一次大 ----------
function hit(at: number, k: number, x: number, y: number) {
  const fx: Fx[] = [{ at, kind: 'burst', x, y, n: 1, dur: 0.4, scale: 1.4 + 0.5 * k }]
  const camera: Camera[] = [
    // 第 2、3 次碗在最左、他在最右：推近會切掉其中一個，只震不推
    ...(k === 1 || k === 2 ? [] : [{ at, dur: 0.4, do: 'punch' as const, amount: k ? 0.05 : 0.08, to: { x: k ? 80 : x, y: 50 } }]),
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { fx, camera, cues }
}
/** 嘟嘴吸：同一個姿勢、同一個「咻——」 */
function slurp(at: number, dur: number): { moves: Move[]; cues: Cue[] } {
  return {
    moves: [
      { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/blow' },
      { at: at + 0.1, actor: 'pig', do: 'shake', amount: 0.4, dur: dur - 0.1 },
    ],
    cues: [{ at: at + 0.05, sfx: 'whoosh' }, ...(dur > 0.8 ? [{ at: at + 0.6, sfx: 'slide' as const }] : [])],
  }
}
/** 尾巴「啵」地從碗裡跳出來 */
const popOut = (H: number): Cue => ({ at: H - WHIP, sfx: 'blip' })

// 💥 在臉的左上角（打中的那一側），不蓋住傻眼的臉
const h1 = hit(H1, 0, STAND - 11, PY - 15)
const h2 = hit(H2, 1, FAR, 64)
const h3 = hit(H3, 2, FAR - 15, PY - 15)
const h4 = hit(H4, 3, STAND - 17, 44)
const s1 = slurp(1.0, H1 - WHIP - 1.0)
const s2 = slurp(2.25, H2 - WHIP - 2.25)
const s3 = slurp(5.15, H3 - WHIP - 5.15)
const s4 = slurp(G4, H4 - 0.3 - G4)

const clip: Clip = {
  format: 2,
  char: '麵',
  meta: { theme: '吸不完的麵條', cast: '豬探長＋一大碗拉麵', gags: ['豬探長每次叼起一根麵嘟嘴「咻——」地吸，麵條都吸不完，最後尾巴「啵」地從碗裡跳出來「啪」地甩回來打他，一次比一次長、一次比一次慘：黏在臉上、拉過整個畫面把他打趴、轉圈捲到身上把他捆成粽子；回馬槍是他站穩用力一吸，這次尾巴沒出來，整個碗被拉過來倒扣在他頭上'] },
  duration: 15,
  bg: { top: '#FFE8CC', bottom: '#FFF8EE', floor: '#D9B68A', scenery: 'room' },
  actors: [
    // 看不見的錨點（0,0）：麵條的每一段 tube 掛在這上面，dx／dy 就是舞台座標
    { id: 'rb', emoji: '⭐', x: 0, y: 0, size: 2, hidden: true, float: true },
    { id: 'bowl', emoji: 'prop:noodles', x: BX, y: BY, size: BS, pivot: 'center' },
    { id: 'pig', emoji: 'hero:pig/walk', x: STAND, y: PY, size: PS, hidden: true },
  ],
  moves: [
    // 開場：走進來，看到一大碗拉麵，流口水
    { at: 0, dur: 0.5, actor: 'pig', do: 'enter', from: { x: 185, y: PY }, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
    // 第 1 次：叼起來、嘟嘴吸一小口——尾巴甩到臉上
    ...s1.moves,
    { at: H1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: H1, actor: 'pig', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: H1, actor: 'pig', do: 'tilt', amount: 10, dur: 0.35 },
    { at: SLURP1, actor: 'pig', do: 'swap', emoji: 'hero:pig/blow' },
    { at: SLURP1 + 0.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 2 次：叼起來、吸著吸著一路往後退到右邊——尾巴飛過整個畫面把他打趴
    ...s2.moves,
    { at: 2.4, dur: 0.95, actor: 'pig', do: 'moveTo', to: { x: FAR, y: PY }, ease: 'inOut' },
    { at: H2, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: H2, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: UP2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: UP2 + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: UP2 + 0.25, dur: 0.4, actor: 'pig', do: 'moveTo', to: { x: STAND, y: PY }, ease: 'inOut' },
    // 第 3 次前停一拍：拿放大鏡仔細看這根麵、冒汗
    { at: UP2 + 0.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    ...s3.moves,
    { at: 5.3, dur: 0.5, actor: 'pig', do: 'moveTo', to: { x: FAR, y: PY }, ease: 'inOut' },
    // 退到底還吸不完：原地轉圈，把麵捲到身上
    { at: SPIN3[0], dur: SPIN3[1] - SPIN3[0], actor: 'pig', do: 'spin', times: 3, pivot: 'center' },
    { at: H3, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: H3, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: H3 + 0.35, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.5 },
    // 語詞：轉圈鬆開，長長一根麵條橫在中間——「麵條」——一口吸光，閉眼得意
    { at: UNWIND, dur: 0.4, actor: 'pig', do: 'spin', times: -2, pivot: 'center' },
    // 一邊轉一邊往中間滾過來：語詞那一刻他和麵條都在畫面中間
    { at: UNWIND, dur: 0.4, actor: 'pig', do: 'moveTo', to: { x: WORDX, y: PY }, ease: 'out', arc: 2 },
    { at: UNWIND + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/drool' },
    { at: WORD_SLURP, actor: 'pig', do: 'swap', emoji: 'hero:pig/blow' },
    { at: WORD_SLURP + 0.35, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 第 4 次（回馬槍）：走回同一個地方，站穩、用力一吸
    { at: WALK4, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: WALK4, dur: G4 - WALK4 - 0.02, actor: 'pig', do: 'moveTo', to: { x: STAND, y: PY }, ease: 'inOut' },
    ...s4.moves,
    { at: G4 + 0.15, actor: 'pig', do: 'squash', amount: -0.12, dur: 0.15 },
    // 碗被「咻」地拉過來，翻過來倒扣在他頭上
    { at: H4 - 0.3, dur: 0.3, actor: 'bowl', do: 'moveTo', to: BOWL_HEAD, arc: 12, ease: 'in' },
    { at: H4 - 0.3, dur: 0.3, actor: 'bowl', do: 'rotateTo', amount: 180, ease: 'in' },
    { at: H4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: H4, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: H4, actor: 'bowl', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: H4 + 0.3, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.25 },
    // 把碗往後一丟（往左飛出畫面）
    { at: THROW, actor: 'pig', do: 'swap', emoji: 'hero:pig/throw' },
    { at: THROW + 0.05, dur: 0.38, actor: 'bowl', do: 'moveTo', to: { x: -30, y: 46 }, ease: 'linear' },
    { at: THROW + 0.05, dur: 0.38, actor: 'bowl', do: 'spin', times: -1 },
    // 問他：走到左前方、變大，轉向觀眾
    { at: ASK - 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK, dur: 0.35, actor: 'pig', do: 'moveTo', to: { x: 36, y: PY + 4 }, ease: 'inOut' },
    { at: ASK, dur: 0.35, actor: 'pig', do: 'scaleTo', amount: 1.4, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體前傾聽（listen），點兩下頭
    { at: 12.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.15, actor: 'pig', do: 'flip' },
    { at: 12.15, dur: 0.3, actor: 'pig', do: 'rotateTo', amount: 8 },
    { at: 12.7, dur: 0.25, actor: 'pig', do: 'hop', amount: 1.5 },
    { at: 13.2, dur: 0.25, actor: 'pig', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'pig', do: 'rotateTo', amount: -8 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, dur: 0.3, actor: 'pig', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: 13.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.72, dur: 0.23, actor: 'pig', do: 'moveTo', to: { x: -45, y: PY + 4 }, ease: 'in' },
  ],
  builds: [
    // 第 1 次：甩到臉上的麵條彈出麥的上半
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: { x: STAND, y: PY + FACE.y }, color: partColor('麥') },
    // 第 2 次：蓋在他背上的麵條彈出麥的下半（夂）
    { at: H2 + 0.05, dur: 0.45, strokes: [8, 9, 10], from: { x: FAR, y: 64 }, color: partColor('麥') },
    // 第 3 次：被捆住的臉上彈出面
    { at: H3 + 0.05, dur: 0.5, strokes: [11, 12, 13, 14, 15, 16, 17, 18, 19], from: { x: FAR, y: PY + FACE.y }, color: partColor('面') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 13.9 - ASK, do: 'ask', keep: ['pig'], to: { x: 100, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：好香
    { at: 0.55, kind: 'pop', actor: 'pig', emoji: '😋', dx: -10, dur: 0.6, scale: 1.3 },
    ...h1.fx,
    { at: H1 + 0.2, kind: 'sweat', actor: 'pig' },
    ...h2.fx,
    { at: H2 + 0.15, kind: 'dizzy', actor: 'pig', dur: 0.45 },
    // 第 3 次前停一拍：看著這根麵，冒汗
    { at: UP2 + 0.75, kind: 'sweat', actor: 'pig', dx: 4 },
    ...h3.fx,
    { at: H3 + 0.3, kind: 'sweat', actor: 'pig', dx: -6 },
    ...h4.fx,
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 整支自己管鏡頭（幾乎全景）：碗在左、他會退到右邊，自動取景推近會切掉其中一個
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...h1.camera,
    ...h2.camera,
    ...h3.camera,
    { at: PARK, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...h4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '麵' },
    ...s1.cues, popOut(H1), ...h1.cues,
    { at: SLURP1, sfx: 'gulp' },
    ...s2.cues, popOut(H2), ...h2.cues,
    { at: UP2, sfx: 'gulp' },
    ...s3.cues, popOut(H3), ...h3.cues,
    { at: HOME + 0.1, say: '麵' },
    { at: WORD, say: '麵條' },
    { at: WORD_SLURP + 0.05, sfx: 'whoosh' },
    { at: WORD_SLURP + 0.3, sfx: 'gulp' },
    ...s4.cues, { at: H4 - 0.3, sfx: 'whoosh' }, ...h4.cues,
    { at: THROW + 0.05, sfx: 'whoosh' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '麵' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

// ---------- 麵條：照時間切片（每 1/30 秒；沒在動的時候合成一片），每一段是一根 tube ----------
{
  const END = THROW + 0.4
  const pigI = clip.actors.findIndex((a) => a.id === 'pig')
  const bowlI = clip.actors.findIndex((a) => a.id === 'bowl')
  const key = (sh: Shape[]) => sh.map((s) => s.pts.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(' ') + (s.mouth ? 'm' : '')).join('|')
  const slices: { at: number; dur: number; sh: Shape[] }[] = []
  let last = ''
  for (let t = 0; t < END - 1e-6; t += 1 / 30) {
    const st = baseActorsAt(clip, t)
    const p = st[pigI], b = st[bowlI]
    const sh = t >= G4 ? shapes4(t, p, b) : shapesAt(t, p, b)
    const k = key(sh)
    if (k === last && slices.length) slices[slices.length - 1].dur += 1 / 30
    else slices.push({ at: t, dur: 1 / 30, sh })
    last = k
  }
  for (const s of slices) {
    for (const shape of s.sh) {
      const pts = shape.pts
      // 接嘴巴的最後一段掛在豬探長身上（跟著他走路的上下顛，麵條才不會離開嘴巴）
      const n = shape.mouth ? pts.length - 2 : pts.length - 1
      for (let j = 0; j < n; j++) {
        clip.fx!.push({ at: s.at, dur: s.dur, kind: 'tube', actor: 'rb', dx: pts[j].x, dy: pts[j].y, to: pts[j + 1], color: NOODLE, width: NW, n: 99 })
      }
      if (shape.mouth && pts.length >= 2) {
        clip.fx!.push({ at: s.at, dur: s.dur, kind: 'tube', actor: 'pig', dx: MOUTH.x, dy: MOUTH.y, to: pts[pts.length - 2], color: NOODLE, width: NW, n: 99 })
      }
    }
  }
}

export default clip
