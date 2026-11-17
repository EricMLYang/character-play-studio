// 演的是字面意思：卡（卡住）＋車——一台貨車載的東西一次比一次高，開過同一座矮橋，最後「卡」在橋下面。
import type { Cue, Move } from '../../anim/clip'
import { pressStack } from '../../anim/helpers'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：卡車每次多載一樣東西開過同一座矮橋——第一次輕鬆過、第二次西瓜擦著橋底擠過去、第三次小熊「咚」卡住。
// 每一趟都一樣：警長吹哨子揮手「過！」，卡車從左邊開進來穿過橋。只有車上那疊越來越高：箱子 → 箱子＋西瓜 → 箱子＋西瓜＋小熊。
// 第三次前停一拍：卡車停在橋前，警長伸手「等一下！」直冒汗……卡車還是衝了——咚！小熊被擠扁卡在橋邊。
// 反轉：警長跑到後面用力一推，卡車噗地衝出去——把整片橋面頂起來載走了，只剩兩根橋墩。卡車頂著橋亮相：「卡車」。
const S = 36 // 卡車的 size
const Y = 57.8 // 卡車站在地上的 y（輪子底在 74.5，車斗頂在 Y − 10.2，用紅點量過）
const DX = -8 // 車斗的中心比卡車的 x 偏左多少（卡車朝右，車斗在後面）
// 車斗上那一疊：比卡車的 y 高多少（量過：箱子 8.3 高、西瓜 10.9 高、小熊 13.7 高）
const BOX = -9.1
const MELON = -23.2
const BEAR = -36.2
/** 橋面被頂起來以後，坐在（被擠扁的）小熊頭上 */
const DECK_ON = -48.9
// 橋：兩根磚頭橋墩（x 68、100），上面一片磚頭橋面（x 62.9～105.1）。橋面底在 28.4＝西瓜頂（第二趟剛好擦到）
const BRIDGE = 84
const DECK_Y = 19.2
const DECK_CUT = 0.69 // 橋面只畫磚牆圖上面這一截：厚 13.7，頂在 14.7＝小熊頭頂（第三趟整隻撞在橋面側邊）
const COP = 16 // 警長平常站的地方（左邊路口）
const C = 66.9 // 警長（size 24）站在地上的 y
const OFF = -30 // 卡車從左邊外面進來
const OUT = 200 // 開出右邊
/** 卡車開過整個畫面要多久（等速） */
const RUN = 1.6
const STOP = 43 // 第三趟停在橋前（車尾剛好不碰到警長）
const STUCK = 64 // 小熊的右邊頂到橋面左邊緣
const END = 126 // 頂著橋開出去停在這裡（小熊整個離開右邊的橋墩）

type Item = [id: string, dy: number]
/** 卡車的動作，車斗上那一疊照抄一份（往左 DX、往上 dy）；卡車壓扁時那一疊跟著往下沉 */
function load(moves: Move[], items: Item[]): Move[] {
  return moves.flatMap((m): Move[] => {
    if (m.do === 'squash') return [m, ...pressStack(m.at, m.dur ?? 0.3, m.amount ?? 0.2, S, items.map(([id]) => id))]
    if (m.do === 'shake') return [m, ...items.map(([actor]) => ({ ...m, actor }))]
    if (m.do !== 'moveTo') return [m]
    return [m, ...items.map(([actor, dy]) => ({ ...m, actor, to: m.to && { x: m.to.x + DX, y: m.to.y + dy } }))]
  })
}

/** 警長吹哨子、揮手叫卡車過來（每一趟都一樣）。w 是吹哨子那一刻 */
function whistle(w: number) {
  const moves: Move[] = [
    { at: w, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: w, actor: 'cop', do: 'hop', amount: 3, dur: 0.25 },
    { at: w + 0.3, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/wave' },
  ]
  const cues: Cue[] = [{ at: w + 0.02, sfx: 'blip' }, { at: w + 0.16, sfx: 'blip' }]
  return { moves, cues }
}

/** 一趟：瞬間回到左邊外面，等速開過整座橋、開出右邊。t 是開始開的時間 */
function pass(t: number, items: Item[]) {
  return load([
    { at: t - 0.06, actor: 'truck', do: 'moveTo', to: { x: OFF, y: Y }, dur: 0.01 },
    { at: t, actor: 'truck', do: 'moveTo', to: { x: OUT, y: Y }, dur: RUN, ease: 'linear' },
  ], items)
}
/** 第 t 秒時卡車開到 x 的時刻 */
const when = (t: number, x: number) => t + ((x - OFF) / (OUT - OFF)) * RUN

const T1 = 0.45, T2 = 2.45, T3 = 4.3
const w1 = whistle(T1 - 0.4)
const w2 = whistle(T2 - 0.4)
const w3 = whistle(T3 - 0.4)
// 第二趟：西瓜的右邊碰到橋面左邊緣（卡車 x 65）到西瓜的左邊離開橋面右邊緣（卡車 x 119）
const RUB = when(T2, 64.9)
const RUB_END = when(T2, 119.1)
const ARRIVE = T3 + 0.75 // 第三趟停在橋前
const GO = ARRIVE + 0.85 // 停一拍以後還是衝了
const HIT = GO + 0.3 // 咚！
const HEAVE = HIT + 1.55 // 警長最後一推
const LAND = HEAVE + 0.55 // 頂著橋停下來亮相

const ALL3: Item[] = [['box', BOX], ['melon', MELON], ['bear', BEAR]]

export default scene({
  duration: LAND + 2.0,
  bg: { top: '#9FD8FF', bottom: '#EAF7FF', floor: '#9AA3AD', scenery: 'city' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 148, y: 64.4, size: 30 },
    { id: 'pillar1', emoji: 'prop:brick-wall', x: BRIDGE - 16, y: 60.2, size: 30 },
    { id: 'pillar2', emoji: 'prop:brick-wall', x: BRIDGE + 16, y: 60.2, size: 30 },
    { id: 'truck', emoji: '🚚', x: OFF, y: Y, size: S, flip: true },
    { id: 'box', emoji: 'prop:box', x: OFF + DX, y: Y + BOX, size: 11 },
    { id: 'melon', emoji: 'prop:watermelon', x: OFF - 20, y: Y + MELON, size: 11 },
    { id: 'bear', emoji: '🧸', x: OFF - 20, y: Y + BEAR, size: 11 },
    { id: 'deck', emoji: 'prop:brick-wall', x: BRIDGE, y: DECK_Y, size: 46, half: 'top', cut: DECK_CUT },
    { id: 'cop', emoji: 'hero:sheriff/idle', x: COP, y: C, size: 24, flip: true },
  ],
  moves: [
    // 橋墩：磚牆拉細拉高
    { at: 0, actor: 'pillar1', do: 'stretchTo', amount: 0.38, dur: 0 },
    { at: 0, actor: 'pillar2', do: 'stretchTo', amount: 0.38, dur: 0 },
    // 樹被風吹一下（開場整條街都有東西在動，鏡頭一開始就是全景）
    { at: 0.1, actor: 'tree', do: 'tilt', amount: 4, dur: 0.7 },

    // 第一趟：只載一個箱子，輕輕鬆鬆過去，警長開心跳一下
    ...w1.moves,
    ...pass(T1, [['box', BOX]]),
    { at: when(T1, 100), actor: 'cop', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: when(T1, 100), actor: 'cop', do: 'hop', amount: 4, dur: 0.35 },

    // 第二趟：多一顆西瓜，擦著橋底擠過去：西瓜被壓扁、抖，警長抱頭
    ...w2.moves,
    ...pass(T2, [['box', BOX], ['melon', MELON]]),
    { at: RUB, actor: 'melon', do: 'squash', amount: 0.3, dur: RUB_END - RUB },
    { at: RUB, actor: 'melon', do: 'shake', amount: 0.8, dur: RUB_END - RUB },
    { at: RUB, actor: 'deck', do: 'shake', amount: 0.4, dur: RUB_END - RUB },
    { at: RUB - 0.05, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/duck' },
    { at: RUB_END + 0.15, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/idle' },

    // 第三趟：多一隻小熊。開到橋前停住
    ...w3.moves,
    ...load([
      { at: T3 - 0.06, actor: 'truck', do: 'moveTo', to: { x: OFF, y: Y }, dur: 0.01 },
      { at: T3, actor: 'truck', do: 'moveTo', to: { x: STOP, y: Y }, dur: ARRIVE - T3, ease: 'out' },
    ], ALL3),
    // 停一拍：警長伸手「等一下！」，小熊晃一下
    { at: ARRIVE, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/wait' },
    { at: ARRIVE + 0.1, actor: 'bear', do: 'tilt', amount: -10, dur: 0.5 },
    // 卡車不管，蓄力——衝！
    ...load([{ at: GO - 0.3, actor: 'truck', do: 'squash', amount: -0.12, dur: 0.3 }], ALL3),
    ...load([{ at: GO, actor: 'truck', do: 'moveTo', to: { x: STUCK, y: Y }, dur: HIT - GO, ease: 'in' }], ALL3),
    // 咚！小熊被擠扁卡在橋邊，卡車煞住
    { at: HIT, actor: 'bear', do: 'stretchTo', amount: 1.3, dur: 0.12, ease: 'out' },
    ...load([{ at: HIT, actor: 'truck', do: 'squash', amount: 0.18, dur: 0.3 }], ALL3),
    { at: HIT, actor: 'deck', do: 'shake', amount: 1, dur: 0.35 },
    { at: HIT, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/surprised' },
    // 卡車用力開：抖、冒煙，還是卡著
    ...load([{ at: HIT + 0.55, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.5 }], ALL3),
    // 警長跑到後面推
    { at: HIT + 0.6, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: HIT + 0.6, actor: 'cop', do: 'moveTo', to: { x: STUCK - 25, y: C }, dur: 0.3, ease: 'out' },
    { at: HIT + 0.95, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/push' },
    { at: HIT + 1.05, actor: 'cop', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: HEAVE - 0.25, actor: 'cop', do: 'squash', amount: -0.15, dur: 0.25 },
    // 用力一推——噗！卡車衝出去，橋面被小熊頂起來一起載走
    ...load([{ at: HEAVE, actor: 'truck', do: 'moveTo', to: { x: END, y: Y }, dur: LAND - HEAVE, ease: 'out' }], [['box', BOX], ['melon', MELON], ['bear', BEAR]]),
    { at: HEAVE, actor: 'deck', do: 'moveTo', to: { x: END + DX, y: Y + DECK_ON }, arc: 2, dur: LAND - HEAVE, ease: 'out' },
    { at: HEAVE, actor: 'deck', do: 'tilt', amount: -5, dur: LAND - HEAVE },
    // 警長推空，往前撲倒
    { at: HEAVE + 0.05, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/flat' },
    { at: HEAVE + 0.05, actor: 'cop', do: 'moveTo', to: { x: STUCK - 12, y: C }, dur: 0.25, ease: 'out' },
    // 亮相：卡車頂著橋停下來，壓一下彈起來
    ...load([{ at: LAND, actor: 'truck', do: 'squash', amount: 0.15, dur: 0.3 }], [...ALL3, ['deck', DECK_ON]]),
    { at: LAND + 0.4, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: LAND + 1.0, actor: 'cop', do: 'swap', emoji: 'hero:sheriff/salute' },
    { at: LAND + 1.0, actor: 'cop', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    // 第二趟：擦著橋底，冒火花
    { at: RUB, kind: 'burst', x: 63, y: 28.5, emoji: '✨', n: 6, dur: 0.45, scale: 1.6 },
    { at: (RUB + RUB_END) / 2, kind: 'burst', x: 84, y: 28.5, emoji: '✨', n: 6, dur: 0.45, scale: 1.6 },
    { at: RUB_END - 0.05, kind: 'burst', x: 105, y: 28.5, emoji: '✨', n: 6, dur: 0.45, scale: 1.6 },
    { at: RUB_END + 0.2, kind: 'sweat', actor: 'cop' },
    // 第三趟：停一拍時警長冒汗
    { at: ARRIVE + 0.3, kind: 'sweat', actor: 'cop', dur: 0.8 },
    { at: GO - 0.25, kind: 'puff', actor: 'truck', dx: -18, n: 5, dur: 0.5 },
    // 咚！
    { at: HIT, kind: 'burst', x: 65, y: 12, n: 1, dur: 0.45, scale: 1.6 },
    { at: HIT + 0.05, kind: 'burst', x: 60, y: 20, emoji: '⭐', n: 6, dur: 0.6, scale: 1.4 },
    { at: HIT + 0.55, kind: 'puff', actor: 'truck', dx: -18, n: 10, dur: 0.6 },
    { at: HIT + 1.1, kind: 'sweat', actor: 'cop', dur: 0.6 },
    // 噗！衝出去
    { at: HEAVE, kind: 'puff', actor: 'truck', dx: -18, n: 10, dur: 0.6 },
    { at: HEAVE + 0.05, kind: 'burst', x: 64, y: 22, emoji: '💥', n: 4, dur: 0.5, scale: 1.4 },
    // 亮相
    { at: LAND, kind: 'burst', actor: 'truck', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: LAND + 0.45, kind: 'burst', actor: 'truck', emoji: '🎉', n: 7, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：橋、警長、整台卡車都在畫面裡
    { at: 0, dur: 0, do: 'zoom', amount: 1.05, to: { x: 80, y: 46 } },
    { at: RUB, dur: 0.35, do: 'shake', amount: 0.6 },
    // 停一拍：推近看小熊跟橋
    { at: ARRIVE - 0.2, dur: 0.5, do: 'zoom', amount: 1.12, to: { x: 56, y: 44 } },
    { at: HIT, dur: 0.45, do: 'punch', amount: 0.14, to: { x: 62, y: 30 } },
    { at: HIT, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: HIT + 0.5, dur: 0.5, do: 'zoom', amount: 1.1, to: { x: 70, y: 46 } },
    { at: HEAVE, dur: 0.3, do: 'shake', amount: 1.2 },
    // 退回全景：頂著橋的卡車整個在畫面裡
    { at: HEAVE - 0.15, dur: 0.35, do: 'zoom', amount: 1.08, to: { x: 100, y: 40 } },
  ],
  lights: [
    { at: HIT, dur: 0.05, level: -0.3 },
    { at: HIT + 0.05, dur: 0.3, level: 0 },
    { at: LAND, dur: 0.05, level: -0.3 },
    { at: LAND + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    ...w1.cues,
    { at: when(T1, 70), sfx: 'whoosh' },
    ...w2.cues,
    { at: when(T2, 50), sfx: 'whoosh' },
    { at: RUB, sfx: 'slide' },
    { at: RUB + 0.1, sfx: 'clink' },
    ...w3.cues,
    { at: GO - 0.3, sfx: 'rumble' },
    { at: GO, sfx: 'whoosh' },
    { at: HIT, sfx: 'bonk' },
    { at: HIT + 0.05, sfx: 'crack' },
    { at: HIT + 0.55, sfx: 'rumble' },
    { at: HEAVE, sfx: 'boing' },
    { at: HEAVE + 0.05, sfx: 'poof' },
    { at: LAND + 0.15, say: '卡車' },
    { at: LAND + 0.5, sfx: 'cheer' },
  ],
})
