// 演的是字面意思：麵包＋小偷——小忍者踮腳到麵包店的櫃台偷麵包（不是披著麵包的老鼠，整支沒有老鼠）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：小忍者每偷一個麵包，看店的阿公就睜開眼睛——他立刻舉葉子定住裝沒事，可是偷的麵包一次比一次大，葉子越來越遮不住。
// 同一段踮腳、同一下睜眼、同一聲定住，三次只有結果變大：一小條吐司（阿公看一眼又睡了）→ 一根長法國麵包（阿公探身瞇眼看很久）→
// 先停一拍（打呼停了、阿公動了一下，他手已經伸向最大那條吐司，僵住）……阿公一睜眼：反轉——這次他沒有定住，
// 「砰」一團煙，人和麵包全部不見，只剩那片葉子慢慢飄下來。阿公嚇得從搖椅上彈起來，小忍者從天花板跳下來，三個麵包疊在頭頂上：「麵包小偷」。
const S = 34 // 小忍者的 size
const G = 77 - 0.42 * S // 小忍者站在地上的 y
const START = 40 // 每次從這裡踮腳出發
const REACH = 62 // 每次都走到櫃台前這裡伸手
const P = 46 // 阿公（坐在搖椅上）的 size
const PY = 77 - 0.42 * P
const PX = 122
const TABLE = { x: 90, y: 77 - 0.42 * 36 }
/** 櫃台桌面上麵包底部的高度 */
const TOP = 55
/** 偷到的麵包在他手上的位置（相對忍者的 x、y；他朝右） */
const HELD: Record<string, { dx: number; dy: number }> = {
  toast: { dx: 6, dy: 3 },
  long: { dx: 4, dy: -2 },
  big: { dx: 7, dy: -9 },
}
/** 麵包原本放在櫃台的哪裡 */
const HOME = {
  toast: { x: 79, y: TOP - 4 },
  long: { x: 89, y: TOP - 6 },
  big: { x: 99, y: TOP - 8 },
}
/** 阿公睜眼以後盯著看多久 */
const HOLD = [0.6, 1.0]
/** 踮腳走過去多久 */
const TIP = 0.55

/** 忍者走到 x，手上的麵包跟著走 */
function carry(at: number, x: number, dur: number, held: string[], ease: Move['ease'] = 'linear'): Move[] {
  return [
    { at, actor: 'ninja', do: 'moveTo', to: { x, y: G }, dur, ease },
    ...held.map((id): Move => ({ at, actor: id, do: 'moveTo', to: { x: x + HELD[id].dx, y: G + HELD[id].dy }, dur, ease })),
  ]
}

/** 踮腳：每一步小小一跳（手上的麵包一起跳） */
function tiptoe(at: number, dur: number, ids: string[]): Move[] {
  const steps = 3
  const out: Move[] = []
  for (let i = 0; i < steps; i++) {
    for (const id of ids) out.push({ at: at + (i * dur) / steps, actor: id, do: 'hop', amount: 1.6, dur: dur / steps })
  }
  return out
}

/** 踮腳到櫃台前（每一次都一樣） */
function sneak(t: number, held: string[]): Move[] {
  return [
    { at: t, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    ...carry(t, REACH, TIP, held),
    ...tiptoe(t, TIP, ['ninja', ...held]),
  ]
}

/** 拿起麵包放到手上 */
function grab(at: number, item: string): Move[] {
  return [
    { at, actor: item, do: 'moveTo', to: { x: REACH + HELD[item].dx, y: G + HELD[item].dy }, arc: 3, dur: 0.2, ease: 'out' },
    { at, actor: 'ninja', do: 'tilt', amount: -8, dur: 0.2 },
  ]
}

/** 阿公睜眼（每一次都一樣：打呼停、眼睛睜開、搖椅一晃） */
function wake(at: number): Move[] {
  return [
    { at, actor: 'gramp', do: 'swap', emoji: 'prop:grandpa' },
    { at, actor: 'gramp', do: 'hop', amount: 2, dur: 0.2 },
  ]
}

/**
 * 主軸笑點：踮腳到櫃台 → 拿起一個麵包 → 阿公睜眼 → 舉葉子定住。
 * k 是第幾次（0、1），item 是這次拿的麵包，held 是之前已經拿在手上的。t 是出發的時間；回傳 end＝退回原位的時間。
 */
function steal(t: number, k: number, item: string, held: string[]) {
  const g = t + TIP + 0.1
  const look = g + 0.3
  const back = look + HOLD[k]
  const all = [...held, item]
  const moves: Move[] = [
    ...sneak(t, held),
    ...grab(g, item),
    ...wake(look),
    // 他立刻舉葉子定住
    { at: look + 0.05, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: look + 0.25, actor: 'ninja', do: 'shake', amount: 0.4 + 0.3 * k, dur: HOLD[k] - 0.3 },
  ]
  // 第一次看一眼；第二次探身往前瞇眼看很久
  if (k >= 1) moves.push({ at: look + 0.25, actor: 'gramp', do: 'tilt', amount: -10, dur: HOLD[k] - 0.3 })
  else moves.push({ at: look + 0.25, actor: 'gramp', do: 'tilt', amount: -4, dur: 0.3 })
  // 阿公又睡了，他鬆一口氣、抱著麵包退回原位
  moves.push(
    { at: back, actor: 'gramp', do: 'swap', emoji: 'prop:grandpa-sleep' },
    { at: back + 0.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    ...carry(back + 0.25, START, 0.4, all, 'inOut'),
  )
  const fx: Fx[] = [
    { at: look + 0.25, kind: 'sweat', actor: 'ninja', dur: HOLD[k] - 0.1 },
    { at: look + 0.05, kind: 'burst', actor: 'ninja', emoji: '💦', n: 3 + 2 * k, dur: 0.45, scale: 1.3 + 0.2 * k },
  ]
  const camera: Camera[] = [{ at: look + 0.05, dur: 0.5 + 0.2 * k, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: 84, y: G - 6 } }]
  if (k >= 1) camera.push({ at: look + 0.05, dur: 0.3, do: 'shake', amount: 0.6 })
  // 同一個音效（拿起來「沙」、睜眼「嗶」、定住「叮」），第二次多疊一聲
  const cues: Cue[] = [{ at: g, sfx: 'slide' }, { at: look, sfx: 'blip' }, { at: look + 0.05, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: look + 0.3, sfx: 'blip' })
  return { moves, fx, cues, camera, look, back, end: back + 0.65 }
}

const T1 = 0.85
const s1 = steal(T1, 0, 'toast', [])
const T2 = s1.end + 0.1
const s2 = steal(T2, 1, 'long', ['toast'])
// 第三次：同樣踮腳過去，先停一拍
const T3 = s2.end + 0.1
const PAUSE = T3 + TIP + 0.05
const GRAB3 = PAUSE + 0.7
const LOOK3 = GRAB3 + 0.3
const POOF = LOOK3 + 0.05
const JOLT = POOF + 0.7
const LAND = JOLT + 0.55
const HELD3 = ['toast', 'long']
/** 亮相：麵包疊在頭頂上（happy 姿勢雙手舉高） */
const SHOW = 62
const UP = { toast: { x: SHOW + 1, y: G - 14 }, long: { x: SHOW, y: G - 19 }, big: { x: SHOW, y: G - 25 } }

export default scene({
  duration: LAND + 1.8,
  bg: { top: '#F2B872', bottom: '#FBE2B8', floor: '#9C6236', scenery: 'room' },
  actors: [
    { id: 'lamp', emoji: 'prop:lamp', x: 150, y: 77 - 0.42 * 30, size: 30 },
    { id: 'gramp', emoji: 'prop:grandpa-sleep', x: PX, y: PY, size: P },
    { id: 'table', emoji: 'prop:table', x: TABLE.x, y: TABLE.y, size: 36 },
    // 忍者畫在麵包後面：拿在手上的麵包擋在他身體前面
    { id: 'ninja', emoji: 'hero:ninja/idle', x: START, y: G, size: S, flip: true, hidden: true },
    { id: 'big', emoji: '🍞', x: HOME.big.x, y: HOME.big.y, size: 18, float: true },
    { id: 'long', emoji: '🥖', x: HOME.long.x, y: HOME.long.y, size: 14, float: true },
    { id: 'toast', emoji: '🍞', x: HOME.toast.x, y: HOME.toast.y, size: 8, float: true },
    { id: 'leaf', emoji: '🍃', x: REACH, y: G - 6, size: 9, hidden: true, float: true },
  ],
  moves: [
    // 開場：小忍者從左邊踮腳溜進來，阿公在搖椅上睡覺
    { at: 0.05, actor: 'ninja', do: 'enter', from: { x: -20, y: G }, dur: 0.6, ease: 'out' },
    { at: 0.3, actor: 'gramp', do: 'tilt', amount: 3, dur: 0.8 },
    // 第 1 次：一小條吐司
    ...s1.moves,
    // 第 2 次：長長的法國麵包
    ...s2.moves,
    // 第 3 次：同樣踮腳過去……
    ...sneak(T3, HELD3),
    // 停一拍：打呼停了，阿公在椅子上動了一下；他手已經伸向最大那條吐司，僵住
    { at: PAUSE, actor: 'gramp', do: 'tilt', amount: -5, dur: 0.6 },
    { at: PAUSE + 0.1, actor: 'gramp', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: PAUSE, actor: 'ninja', do: 'tilt', amount: -10, dur: 0.6 },
    { at: PAUSE + 0.15, actor: 'big', do: 'shake', amount: 0.5, dur: 0.4 },
    // 拿起最大那條，阿公睜眼——
    ...grab(GRAB3, 'big'),
    ...wake(LOOK3),
    // 反轉：這次沒有定住——砰！一團煙，人和麵包全部不見，只剩葉子
    { at: POOF, actor: 'ninja', do: 'vanish', dur: 0.12 },
    { at: POOF, actor: 'toast', do: 'vanish', dur: 0.12 },
    { at: POOF, actor: 'long', do: 'vanish', dur: 0.12 },
    { at: POOF, actor: 'big', do: 'vanish', dur: 0.12 },
    { at: POOF + 0.05, actor: 'leaf', do: 'pop', dur: 0.15 },
    { at: POOF + 0.2, actor: 'leaf', do: 'moveTo', to: { x: REACH + 12, y: 72 }, dur: 1.3, ease: 'out' },
    { at: POOF + 0.2, actor: 'leaf', do: 'tilt', amount: 30, dur: 0.6 },
    { at: POOF + 0.8, actor: 'leaf', do: 'tilt', amount: -30, dur: 0.6 },
    // 阿公看著空空的地方……嚇得從搖椅上彈起來（書飛出去）
    { at: POOF + 0.25, actor: 'gramp', do: 'tilt', amount: -8, dur: 0.4 },
    { at: JOLT, actor: 'gramp', do: 'swap', emoji: 'prop:grandpa-wake' },
    { at: JOLT, actor: 'gramp', do: 'moveTo', to: { x: PX - 0.028 * P, y: PY }, dur: 0.01 },
    { at: JOLT, actor: 'gramp', do: 'hop', amount: 4, dur: 0.3 },
    { at: JOLT + 0.3, actor: 'gramp', do: 'shake', amount: 0.8, dur: 0.6 },
    // 亮相：小忍者從天花板跳下來，三個麵包疊在頭頂上
    { at: LAND - 0.35, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: LAND - 0.35, actor: 'ninja', do: 'moveTo', to: { x: SHOW, y: G }, dur: 0.01 },
    { at: LAND - 0.35, actor: 'ninja', do: 'drop', dur: 0.35 },
    ...(['toast', 'long', 'big'] as const).flatMap((id): Move[] => [
      { at: LAND - 0.35, actor: id, do: 'moveTo', to: UP[id], dur: 0.01 },
      { at: LAND - 0.35, actor: id, do: 'drop', dur: 0.35 },
    ]),
    { at: LAND - 0.35, actor: 'leaf', do: 'vanish', dur: 0.2 },
    { at: LAND + 0.1, actor: 'ninja', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: LAND + 0.5, actor: 'big', do: 'tilt', amount: 8, dur: 0.4 },
  ],
  fx: [
    // 打呼：每次睜眼就停，睡回去再響
    { at: 0.2, kind: 'zzz', actor: 'gramp', dur: s1.look - 0.2 },
    { at: s1.back + 0.1, kind: 'zzz', actor: 'gramp', dur: s2.look - s1.back - 0.1 },
    { at: s2.back + 0.1, kind: 'zzz', actor: 'gramp', dur: PAUSE - s2.back - 0.1 },
    ...s1.fx,
    ...s2.fx,
    { at: PAUSE + 0.1, kind: 'sweat', actor: 'ninja', dur: 0.6 },
    { at: POOF - 0.02, kind: 'burst', x: REACH + 2, y: G - 4, emoji: 'prop:smoke', n: 1, dur: 0.8, scale: 3 },
    { at: POOF, kind: 'puff', x: REACH, y: G, n: 10, dur: 0.6 },
    { at: LAND, kind: 'burst', actor: 'ninja', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: LAND + 0.35, kind: 'burst', actor: 'big', emoji: '🎉', n: 7, dur: 0.9, scale: 1.3 },
  ],
  camera: [
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.4, to: { x: 84, y: 50 } },
    ...s1.camera,
    ...s2.camera,
    // 停一拍：慢慢推近
    { at: PAUSE, dur: 0.6, do: 'zoom', amount: 1.55, to: { x: 84, y: 50 } },
    { at: POOF, dur: 0.4, do: 'shake', amount: 1.4 },
    { at: POOF + 0.3, dur: 0.4, do: 'zoom', amount: 1.4, to: { x: 84, y: 50 } },
    { at: JOLT, dur: 0.3, do: 'shake', amount: 0.8 },
    // 亮相
    { at: LAND, dur: 0.3, do: 'shake', amount: 1.0 },
    { at: LAND, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: SHOW + 18, y: 46 } },
  ],
  lights: [
    { at: POOF, dur: 0.05, level: -0.4 },
    { at: POOF + 0.05, dur: 0.4, level: 0 },
    { at: LAND, dur: 0.05, level: -0.3 },
    { at: LAND + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    ...s1.cues,
    ...s2.cues,
    { at: PAUSE + 0.1, sfx: 'hic' },
    { at: GRAB3, sfx: 'slide' },
    { at: LOOK3, sfx: 'blip' },
    { at: POOF, sfx: 'poof' },
    { at: JOLT, sfx: 'boing' },
    { at: LAND, sfx: 'bonk' },
    { at: LAND + 0.2, say: '麵包小偷' },
    { at: LAND + 0.5, sfx: 'cheer' },
  ],
})
