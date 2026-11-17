// 演的是字面意思：蘋果＋假面＋超人——披披風的超人（自家主角）拿一顆大蘋果擋在臉前當面具，看不到路，一直撞到蘋果樹（頭不是蘋果做的、沒有食物臉的角色）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：超人拿大蘋果擋在臉前當面具、大步往前走，看不到路，「咚！」一頭撞上蘋果樹。
// 同一段大步走、同一棵樹、同一聲「咚」，三次只有結果越來越大：
// 第一次彈回一小步、樹上掉一顆蘋果砸在頭上 → 第二次走更快，被彈飛轉一圈跌坐頭昏、樹上掉下三顆蘋果
// → 停一拍（他爬起來退回起點、蹲低蓄力；猴子從樹上盪下來，掛在他要撞的地方）。
// 第三次衝最快——反轉：快撞到的前一刻，猴子一把搶走他的蘋果面具咬一口，他終於看得到了，在樹前面急煞車、跟猴子臉對臉傻眼。
// 他從地上撿起剛掉下來的蘋果，又擋回臉前擺姿勢：「蘋果假面超人」。
const S = 36 // 超人的 size
const G = 77 - 0.42 * S // 超人站在地上的 y
const START = 48 // 每次都從這裡出發
const HIT = 104 // 撞到樹的那一刻站在這
const STOP = 94 // 第三次急煞車停在這
const TREE = { x: 124, size: 84 }
const MONKEY = { x: 140, y: 44, size: 30 } // 一開始掛在樹的右邊
const SWING = { x: 112, y: 46 } // 停一拍時盪下來掛在他要撞的地方
const M = 13 // 蘋果面具的 size
const AY = 77 - 0.42 * 9 // 地上蘋果（size 9）的 y
/** 蘋果面具相對超人中心的位置（他朝右，蘋果擋在臉前）：每個姿勢的臉不在同一個地方 */
const FACE = {
  idle: { dx: 8, dy: -3.5 },
  pose: { dx: 6.5, dy: -2.5 },
  surprised: { dx: 8.5, dy: -5 },
  dizzy: { dx: 8.5, dy: -1.5 },
} as const
type Pose = keyof typeof FACE
const at = (x: number, y: number, p: Pose) => ({ x: x + FACE[p].dx, y: y + FACE[p].dy })
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })

/** 超人移動，面具照抄一份（同一刻、同一條路，終點換成臉的位置） */
function go(t: number, x: number, y: number, pose: Pose, rest: Partial<Move> & { dur: number }): Move[] {
  return [
    { ...rest, at: t, actor: 'hero', do: 'moveTo', to: { x, y } },
    { ...rest, at: t, actor: 'mask', do: 'moveTo', to: at(x, y, pose) },
  ]
}
/** 換姿勢，面具跟著挪到新的臉上 */
function pose(t: number, x: number, y: number, p: Pose): Move[] {
  return [
    { at: t, actor: 'hero', do: 'swap', emoji: `hero:cape/${p}` },
    { at: t, actor: 'mask', do: 'moveTo', to: at(x, y, p), dur: 0.08 },
  ]
}

/**
 * 主軸笑點：蘋果擋臉、大步走 → 「咚」撞上樹 → 彈回來、樹上掉蘋果。k 是第幾次（0、1），越後面走越快、撞越大、彈越遠、掉越多。
 * t 是出發那一刻；回傳 hit＝撞到的時間、end＝傻眼停完的時間。
 */
function march(t: number, k: number) {
  const dur = 1.0 - 0.2 * k
  const hit = t + dur
  const back = k === 0 ? 88 : 62 // 彈回到哪
  const moves: Move[] = [
    ...pose(t - 0.2, START, G, 'idle'),
    { at: t - 0.2, actor: 'hero', do: 'squash', amount: -0.1, dur: 0.18 },
    ...go(t, HIT, G, 'idle', { dur, ease: k ? 'in' : 'linear' }),
    // 咚！面具壓扁在樹幹上，樹抖、猴子跟著晃
    { at: hit, actor: 'mask', do: 'squash', amount: 0.3 + 0.15 * k, dur: 0.2 },
    { at: hit, actor: 'tree', do: 'shake', amount: 0.6 + 0.6 * k, dur: 0.4 + 0.2 * k },
    { at: hit, actor: 'monkey', do: 'tilt', amount: 10 + 8 * k, dur: 0.5 + 0.2 * k },
  ]
  if (k === 0) {
    // 彈回一小步、傻眼站著；樹上掉一顆蘋果砸在頭上、彈到地上
    moves.push(
      ...pose(hit, HIT, G, 'surprised'),
      ...go(hit + 0.02, back, G, 'surprised', { dur: 0.3, ease: 'out', arc: 4 }),
      { at: hit + 0.25, actor: 'a1', do: 'drop', dur: 0.35 },
      { at: hit + 0.6, actor: 'hero', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: hit + 0.6, actor: 'a1', do: 'moveTo', to: { x: 74, y: AY }, arc: 8, dur: 0.4, ease: 'out' },
      { at: hit + 0.6, actor: 'a1', do: 'spin', times: -1, dur: 0.4 },
    )
  } else {
    // 彈飛轉一圈、跌坐頭昏；樹上掉下三顆蘋果
    moves.push(
      ...pose(hit, HIT, G, 'surprised'),
      ...go(hit + 0.02, back, G, 'surprised', { dur: 0.45, ease: 'out', arc: 14 }),
      { at: hit + 0.02, actor: 'hero', do: 'tilt', amount: -15, dur: 0.45 },
      { at: hit + 0.02, actor: 'mask', do: 'tilt', amount: -15, dur: 0.45 },
      ...pose(hit + 0.47, back, G, 'dizzy'),
      { at: hit + 0.15, actor: 'a2', do: 'drop', dur: 0.4 },
      { at: hit + 0.25, actor: 'a3', do: 'drop', dur: 0.4 },
      { at: hit + 0.35, actor: 'a4', do: 'drop', dur: 0.4 },
      { at: hit + 0.6, actor: 'monkey', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    )
  }
  const fx: Fx[] = [
    { at: hit, kind: 'burst', x: HIT + 15, y: G - 8, n: 1, dur: 0.45, scale: 1.4 + 0.5 * k },
    { at: hit + 0.05, kind: 'burst', x: HIT + 12, y: G - 6, emoji: '🍃', n: 4 + 4 * k, dur: 0.6, scale: 1.2 },
  ]
  if (k === 0) fx.push({ at: hit + 0.6, kind: 'burst', actor: 'hero', emoji: '⭐', n: 3, dur: 0.5, scale: 1.2 })
  else fx.push({ at: hit + 0.5, kind: 'dizzy', actor: 'hero', dur: 1.0 })
  const camera: Camera[] = [
    { at: hit, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: HIT + 10, y: G - 8 } },
    { at: hit, dur: 0.3 + 0.15 * k, do: 'shake', amount: 0.8 + 0.7 * k },
  ]
  // 同一聲「咚」，一次比一次多疊一個
  const cues: Cue[] = [{ at: t, sfx: 'whoosh' }, { at: hit, sfx: 'bonk' }]
  if (k === 0) cues.push({ at: hit + 0.6, sfx: 'tap' })
  else cues.push({ at: hit + 0.04, sfx: 'boing' }, { at: hit + 0.5, sfx: 'plop' }, { at: hit + 0.7, sfx: 'plop' })
  return { moves, fx, camera, cues, hit, end: k === 0 ? hit + 1.0 : hit + 1.3 }
}

const m1 = march(0.9, 0)
const m2 = march(m1.end + 0.6, 1)
const UPP = m2.end // 爬起來、退回起點、蹲低（停一拍）
const DASH = UPP + 1.15 // 第三次衝出去
const GRAB = DASH + 0.5 // 猴子搶走面具
const HALT = DASH + 0.6 // 急煞車停住
const PICK = HALT + 0.95 // 撿起地上的蘋果
const POSE = PICK + 0.35 // 又擋回臉前、擺姿勢
const SHOW = POSE + 0.35 // 亮相：蘋果從臉前拿開、高高舉起，露出笑臉
const RAISED = { x: STOP - 9, y: G - 6 } // 舉在臉旁邊（happy 姿勢、後面那隻手；前面是猴子）

export default scene({
  duration: SHOW + 2.4,
  bg: { top: '#FFC27A', bottom: '#FFF0C9', floor: '#8CC063', scenery: 'forest' },
  actors: [
    { id: 'basket', emoji: '🧺', x: 20, y: 77 - 0.42 * 14, size: 14 },
    { id: 'bush', emoji: 'prop:bush', x: 152, y: 77 - 0.42 * 16, size: 16 },
    { id: 'tree', emoji: 'prop:apple-tree', x: TREE.x, y: 77 - 0.42 * TREE.size, size: TREE.size },
    { id: 'monkey', emoji: 'prop:monkey-hang', x: MONKEY.x, y: MONKEY.y, size: MONKEY.size, float: true, flip: true },
    // 樹上掉下來的蘋果
    { id: 'a3', emoji: '🍎', x: HIT + 9, y: AY, size: 9, hidden: true },
    { id: 'a4', emoji: '🍎', x: 80, y: AY, size: 9, hidden: true },
    { id: 'hero', emoji: 'hero:cape/idle', x: START, y: G, size: S, flip: true, pivot: 'center' },
    { id: 'a1', emoji: '🍎', x: 88 + 4, y: G - 17, size: 9, hidden: true, pivot: 'center' },
    // 最後撿起來當新面具的那顆：畫在超人前面
    { id: 'a2', emoji: '🍎', x: HIT + 2, y: AY, size: 9, hidden: true },
    // 蘋果面具：一直擋在臉前
    { id: 'mask', emoji: '🍎', x: START + 7, y: G + 4, size: M, pivot: 'center', hidden: true },
  ],
  moves: [
    // 開場：蘋果「啪」貼到臉上，擺好姿勢
    { at: 0.15, actor: 'hero', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.1, actor: 'mask', do: 'pop', dur: 0.25 },
    { at: 0.4, actor: 'mask', do: 'moveTo', to: at(START, G, 'pose'), dur: 0.2, ease: 'back' },
    ...pose(0.6, START, G, 'pose').filter((m) => m.actor === 'hero'),
    { at: 0.4, actor: 'monkey', do: 'tilt', amount: -10, dur: 0.6 },

    // 第一次：彈回一小步、一顆蘋果砸頭
    ...m1.moves,
    // 甩甩頭、退回起點
    ...pose(m1.end, 88, G, 'idle'),
    ...go(m1.end + 0.05, START, G, 'idle', { dur: 0.45, ease: 'inOut' }),

    // 第二次：走更快、彈飛跌坐、掉三顆
    ...m2.moves,

    // 停一拍：爬起來、退回起點；猴子盪下來掛在他要撞的地方；他蹲低蓄力
    ...pose(UPP, 62, G, 'idle'),
    { at: UPP, actor: 'hero', do: 'hop', amount: 3, dur: 0.25 },
    { at: UPP, actor: 'mask', do: 'hop', amount: 3, dur: 0.25 },
    ...go(UPP + 0.25, START, G, 'idle', { dur: 0.35, ease: 'inOut' }),
    { at: UPP + 0.2, actor: 'monkey', do: 'moveTo', to: SWING, arc: -8, dur: 0.5, ease: 'inOut' },
    { at: UPP + 0.7, actor: 'monkey', do: 'tilt', amount: 12, dur: 0.4 },
    { at: UPP + 0.65, actor: 'hero', do: 'squash', amount: 0.22, dur: 0.5 },
    { at: UPP + 0.7, actor: 'hero', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: UPP + 0.7, actor: 'mask', do: 'shake', amount: 0.6, dur: 0.4 },

    // 第三次：衝最快——猴子一把搶走面具
    ...go(DASH, STOP, G, 'idle', { dur: HALT - DASH, ease: 'out', anticipate: 4 }),
    { at: GRAB - 0.08, actor: 'monkey', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: GRAB, actor: 'mask', do: 'moveTo', to: { x: SWING.x - 5, y: SWING.y - 1 }, arc: 3, dur: 0.18, ease: 'out' },
    // 他看得到了：樹跟猴子就在鼻子前面，急煞車、往後仰、傻眼
    ...pose(HALT, STOP, G, 'surprised').filter((m) => m.actor === 'hero'),
    { at: HALT, actor: 'hero', do: 'tilt', amount: -10, dur: 0.5 },
    { at: HALT + 0.05, actor: 'hero', do: 'shake', amount: 0.6, dur: 0.4 },
    // 猴子咬一口、再一口
    { at: HALT + 0.2, actor: 'monkey', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: HALT + 0.2, actor: 'mask', do: 'scaleTo', amount: 0.8, dur: 0.08 },
    { at: HALT + 0.5, actor: 'monkey', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: HALT + 0.5, actor: 'mask', do: 'scaleTo', amount: 0.75, dur: 0.08 },
    { at: HALT + 0.8, actor: 'mask', do: 'vanish', dur: 0.15 },

    // 撿起地上的蘋果，又擋回臉前
    { at: PICK - 0.15, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: PICK - 0.15, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: PICK, actor: 'a2', do: 'moveTo', to: at(STOP, G, 'pose'), arc: 4, dur: 0.3, ease: 'out' },
    { at: PICK, actor: 'a2', do: 'scaleTo', amount: M / 9, dur: 0.3, ease: 'out' },
    // 亮相
    { at: POSE, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    // 亮相：蘋果從臉前拿開、舉到手上，露出笑臉
    { at: SHOW, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: SHOW, actor: 'a2', do: 'moveTo', to: RAISED, dur: 0.25, ease: 'back' },
    { at: SHOW + 0.3, actor: 'monkey', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  fx: [
    { at: 0.6, kind: 'burst', actor: 'mask', emoji: '✨', n: 5, dur: 0.5 },
    ...m1.fx,
    ...m2.fx,
    { at: UPP + 0.75, kind: 'sweat', actor: 'hero', dur: 0.5 },
    { at: DASH, kind: 'puff', actor: 'hero', n: 6, dur: 0.5 },
    { at: HALT, kind: 'puff', actor: 'hero', n: 8, dur: 0.5 },
    { at: HALT + 0.1, kind: 'sweat', actor: 'hero', dur: 0.6 },
    { at: HALT + 0.2, kind: 'burst', actor: 'mask', emoji: '💦', n: 4, dur: 0.4 },
    { at: HALT + 0.5, kind: 'burst', actor: 'mask', emoji: '💦', n: 4, dur: 0.4 },
    { at: SHOW, kind: 'burst', actor: 'hero', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: SHOW + 0.4, kind: 'burst', actor: 'hero', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：起點、樹、猴子都在畫面裡，超人夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.3, to: look(88, 50, 1.3) },
    ...m1.camera,
    ...m2.camera,
    // 停一拍：慢慢推近他
    { at: UPP + 0.5, dur: 0.6, do: 'zoom', amount: 1.5, to: look(74, 50, 1.5) },
    { at: DASH, dur: 0.3, do: 'zoom', amount: 1.4, to: look(92, 50, 1.4) },
    { at: HALT, dur: 0.4, do: 'punch', amount: 0.1, to: { x: STOP + 8, y: G - 10 } },
    // 亮相
    { at: POSE, dur: 0.5, do: 'zoom', amount: 1.6, to: look(STOP + 4, 52, 1.6) },
  ],
  lights: [
    { at: SHOW, dur: 0.05, level: -0.4 },
    { at: SHOW + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'plop' },
    { at: 0.6, sfx: 'tap' },
    ...m1.cues,
    ...m2.cues,
    { at: UPP + 0.7, sfx: 'rumble' },
    { at: GRAB, sfx: 'whoosh' },
    { at: HALT - 0.15, sfx: 'slide' },
    { at: HALT + 0.2, sfx: 'gulp' },
    { at: HALT + 0.5, sfx: 'gulp' },
    { at: PICK, sfx: 'whoosh' },
    { at: POSE, sfx: 'tap' },
    { at: SHOW, sfx: 'cheer' },
    { at: SHOW + 0.15, say: '蘋果假面超人' },
  ],
})
