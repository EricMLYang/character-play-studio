import { scene } from '../scene'
import { castScale } from '../../anim/clip'
import type { Actor, Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import type { Scenes } from './index'

// 生日陀螺大戰：楊捷睿生日（爸爸送他的生日禮物，要比平常的書精緻、好笑）。
// 第一幕：他蹦蹦跳跳進房間，爸爸媽媽從兩邊冒出來拉拉炮；爸爸媽媽送他一個禮物盒，打開升起一顆發光的紅色陀螺；
// 他一拉，陀螺「咻」地滿屋子跑：繞著爸爸的腳把爸爸轉到頭暈坐地，從跳起來的媽媽腳下鑽過去，跳進對戰盤；
// 爸爸回神、從背後亮出藍色陀螺丟進對戰盤，兩顆對撞擦出火花。
// 他的陀螺有什麼：火——著火繞一圈蓄力，把藍陀螺撞得冒煙飛出畫面，爸爸下巴掉下來；
// 冰——結冰凍住，冷氣一路爬過去把藍陀螺和爸爸都凍成冰塊，媽媽和他對看，冰裂開、爸爸打一個大噴嚏；
// 水——像灑水器一圈一圈噴爸爸的臉，一次比一次大，爸爸嘴裡吐出小噴泉、眼鏡起霧，最後像小狗一樣甩乾。
// 爸爸的陀螺不見了：爸爸到處找（回頭、彎腰看對戰盤、看桌子），找不到哭成兩道噴泉；他笑到在地上打滾，媽媽走過去拍拍爸爸；
// 藍陀螺這時才從天上掉下來敲到爸爸的頭。
// 第二幕（媽媽的超大綠陀螺、跳／打／親、飛到蛋糕上）與第三幕（奶油、生日快樂）之後再寫。
//
// 媽媽 three（size 34）、爸爸 eric（size 36）、楊捷睿 yang（size 22，引擎放大成 27）；圖都朝左，在左邊要看右邊一律 flip。
// 陀螺 size 10（六張同一個比例，紅＝他的、藍＝爸爸的、綠＝媽媽的；-spin 是高速旋轉的那張，同 size 直接 swap）。
// 旋轉中的陀螺用 whirl()：一直左右翻面＋小幅歪來歪去，再描一圈深色的邊讓白色速度線看得出來（SPIN）。
// 共用的佈置（從第一頁就在）：左上、右上各一串氣球（會輕輕晃）；右邊一張桌子（壓寬 1.3 倍）上放著生日蛋糕（第三幕要用）；
// 地上中間是對戰盤（top-arena，壓扁成 1.5 倍寬的淺盤），盤裡陀螺站的高度 TOP_Y。
// 開場的站位 W0（birthday 的結尾、gift 的開頭、spin 的開頭）：媽媽 x 30（flip）、楊捷睿 x 56（flip）、爸爸 x 112。
// W1（dad 的結尾、等他選「陀螺有什麼」；冰、水演完回到這裡）：
//   對戰盤 x 82；紅陀螺在盤裡 x 73、藍陀螺 x 91，都在轉；楊捷睿 x 46 托下巴想辦法（ponder，flip），
//   爸爸 x 120 得意（smug），媽媽 x 22 握拳加油（know，flip）。
// 火的結尾＝win 的開頭：藍陀螺飛走了，紅陀螺回到盤子正中間 x 82 轉；楊捷睿 laugh、媽媽 happy、爸爸 surprised（站位同 W1）。
// gift 的結尾＝spin 的開頭：他把紅陀螺抱在胸前（hug），爸爸媽媽在 W0。spin 一拉他退到 x 50（SPIN_YANG），爸爸轉到頭暈坐地，
//   紅陀螺在盤子正中間 x 82 轉＝dad 的開頭。
// win 的結尾（第二幕 mom 的開頭）：爸爸 x 120 頭暈坐地（dizzy）、媽媽 x 104（y 往上 2）站在對戰盤後面嚇一跳
//   （surprised，flip；她畫在盤子後面 behindArena，腳被盤子擋住、不擋紅陀螺）、楊捷睿 x 46 laugh（flip）、
//   紅陀螺 x 82 在盤裡轉、藍陀螺 top-blue 躺在爸爸腿上 (113, 69)（轉 90 度）。
// 第二幕：媽媽推進來一顆 size 50 的綠色大陀螺（比爸爸還高；34 以上引擎不放大，鏡頭自己定在全景）。
// W2（mom 的結尾、等他選「叫陀螺＿」；打、親演完回到這裡）：大陀螺 x 102（尖端在盤子右邊緣）在轉，
//   紅陀螺在盤裡 x 70 對著它轉；楊捷睿 x 46 指著它（point，flip）、媽媽 x 132 得意（smug，不 flip，畫在盤子後面）、
//   爸爸 x 24 躲著偷看（peek，flip）。
// 跳的結尾＝sky 的開頭：紅陀螺在大陀螺頂上 (95, 29) 像電鑽一樣轉；他 laugh、媽媽 scared、爸爸 giggle。
// sky：大陀螺飛走時把對戰盤掀飛（之後就沒有盤子了），紅陀螺掉下來被他抱住；媽媽把桌子拉到 x 116、跟蛋糕一起放大 1.3 倍。
// W3（sky 的結尾、第三幕的起點）：桌子 x 116（size 18 × 1.3、壓寬 1.3）、蛋糕 (116, 54.4)（size 13 × 1.3），
//   大陀螺縮成 0.85 倍在蛋糕上 (116, 28.5) 轉；楊捷睿 x 34（scared，抱著紅陀螺 top-red 在胸前 y 71）、
//   爸爸 x 60（scared，flip）、媽媽 x 86（scared，flip）；鏡頭推到 W3_VIEW × 1.08。
// 每一段開頭與結尾都是全景（START／holdWide），換頁時鏡頭不跳；中間交給自動取景，要看陀螺時自己推近（closeUp）。

const BG = { top: '#B784C9', bottom: '#E3B9DE', floor: '#B98B63', scenery: 'room' as const }
const ground = (size: number) => 77 - 0.42 * size

const MOM_S = 34
const MG = ground(MOM_S)
const DAD_S = 36
const DG = ground(DAD_S)
const YANG_S = 22
const YG = ground(YANG_S)

/** 開場（W0）的站位 */
const MOM0 = 30
const YANG0 = 56
const DAD0 = 112
/** W1 的站位 */
const MOM1 = 22
const YANG1 = 46
const DAD1 = 120

const mom = (pose: string, x = MOM1, more: Partial<Actor> = {}): Actor => ({ id: 'mom', emoji: `hero:three/${pose}`, x, y: MG, size: MOM_S, flip: true, ...more })
const dad = (pose: string, x = DAD1, more: Partial<Actor> = {}): Actor => ({ id: 'dad', emoji: `hero:eric/${pose}`, x, y: DG, size: DAD_S, ...more })
const yang = (pose: string, x = YANG1, more: Partial<Actor> = {}): Actor => ({ id: 'yang', emoji: `hero:yang/${pose}`, x, y: YG, size: YANG_S, flip: true, ...more })

// ── 佈置 ──────────────────────────────────────────
/** 氣球：左上三顆、右上兩顆（染成不同顏色） */
const balloons: Actor[] = [
  { id: 'bl1', emoji: '🎈', x: 40, y: 22, size: 12, float: true },
  { id: 'bl2', emoji: '🎈', x: 49, y: 18, size: 12, float: true, tint: 'hue-rotate(200deg)' },
  { id: 'bl3', emoji: '🎈', x: 57, y: 23, size: 11, float: true, tint: 'hue-rotate(60deg) brightness(1.1)' },
  { id: 'bl4', emoji: '🎈', x: 104, y: 19, size: 12, float: true, tint: 'hue-rotate(270deg)' },
  { id: 'bl5', emoji: '🎈', x: 113, y: 23, size: 11, float: true, tint: 'hue-rotate(110deg)' },
]
const BALLOON_IDS = balloons.map((b) => b.id)
/** 氣球一直輕輕晃（每顆節奏不一樣） */
const sway = (dur: number): Move[] =>
  BALLOON_IDS.flatMap((id, i) => {
    const out: Move[] = []
    for (let t = 0.15 + i * 0.37, k = 0; t < dur - 0.3; t += 1.6 + (i % 2) * 0.25, k++) {
      out.push({ at: +t.toFixed(2), actor: id, do: 'tilt', amount: (k + i) % 2 ? 6 : -6, dur: 1.5 })
    }
    return out
  })

const TABLE_X = 146
const TABLE_S = 18
const TABLE_W = 1.3
const table: Actor = { id: 'table', emoji: 'prop:table', x: TABLE_X, y: ground(TABLE_S), size: TABLE_S }
const CAKE_S = 13
const CAKE_Y = 57
const cake: Actor = { id: 'cake', emoji: 'prop:birthday-cake', x: TABLE_X, y: CAKE_Y, size: CAKE_S, float: true }

const ARENA_X = 82
const ARENA_S = 30
const ARENA_W = 1.5
const arena: Actor = { id: 'arena', emoji: 'prop:top-arena', x: ARENA_X, y: ground(ARENA_S), size: ARENA_S }
/** 桌子、對戰盤一開場就壓扁（每段都要寫） */
const flatten: Move[] = [
  { at: 0, dur: 0, actor: 'table', do: 'stretchTo', amount: TABLE_W },
  { at: 0, dur: 0, actor: 'arena', do: 'stretchTo', amount: ARENA_W },
]
const room = [...balloons, table, cake, arena]
/** 有人要站在對戰盤後面（畫在盤子前面的東西之前） */
const behindArena = (who: Actor[]) => [...balloons, table, cake, ...who, arena]

// ── 陀螺 ──────────────────────────────────────────
const TOP_S = 10
/**
 * 陀螺一律 float（y 就是畫出來的中心）：引擎放大小東西時，地上的會「以腳底為準往上長」、離地的會被往上推，
 * 陀螺一下在手上、一下在盤裡、一下在地上，用 float 位置才算得準。TOP_Y 是盤裡站的高度、TOP_FLOOR 是地板上
 */
const TOP_Y = 64
const TOP_FLOOR = 71
const RED1 = 73
const BLUE1 = 91
/** 在轉的陀螺：描一圈深色的邊，白色速度線才看得出來 */
const SPIN = 'drop-shadow(0 0 0.8px rgba(50,30,80,.95))'
const red = (x = RED1, y = TOP_Y, more: Partial<Actor> = {}): Actor => ({ id: 'red', emoji: 'prop:top-red-spin', x, y, size: TOP_S, float: true, pivot: 'center', tint: SPIN, ...more })
const blue = (x = BLUE1, y = TOP_Y, more: Partial<Actor> = {}): Actor => ({ id: 'blue', emoji: 'prop:top-blue-spin', x, y, size: TOP_S, float: true, pivot: 'center', tint: SPIN, ...more })

/** 轉個不停：每 step 秒左右翻面一次（偶數次，結尾朝向不變）＋每 0.4 秒歪一下 */
function whirl(id: string, from: number, to: number, step = 0.1, lean = 7): Move[] {
  const n = Math.floor((to - from) / step / 2) * 2
  const flips = Array.from({ length: n }, (_, i): Move => ({ at: +(from + (i + 1) * step).toFixed(3), actor: id, do: 'flip' }))
  const tilts: Move[] = []
  for (let t = from, k = 0; t < to - 0.2; t += 0.4, k++) tilts.push({ at: +t.toFixed(3), actor: id, do: 'tilt', amount: k % 2 ? lean : -lean, dur: 0.4 })
  return [...flips, ...tilts]
}

/** 火、冰、水的染色 */
const FIRE = 'saturate(1.6) brightness(1.1) drop-shadow(0 0 1.5px #FF6A00)'
const ICE = 'sepia(1) saturate(3) hue-rotate(170deg) brightness(1.15)'
const BLUE_MAN = 'sepia(1) saturate(3) hue-rotate(170deg)'

// ── 鏡頭 ──────────────────────────────────────────
const MID = { x: 80, y: 45 }
/** zoom 的 to 是不動的定點：要讓畫面中心落在 c、推到 z 倍，定點要放這裡 */
const aim = (c: Vec, z: number): Vec => ({ x: (z * c.x - MID.x) / (z - 1), y: (z * c.y - MID.y) / (z - 1) })
const holdWide = (at: number, dur = 0.5): Camera => ({ at, dur, do: 'zoom', amount: 1.02, to: MID })
const release = (at: number, dur = 0.6): Camera => ({ at, dur, do: 'zoom', amount: 1 })
const closeUp = (at: number, dur: number, c: Vec, z = 1.6): Camera => ({ at, dur, do: 'zoom', amount: z, to: aim(c, z) })
const START = holdWide(-0.3, 0.01)
/** 推近看對戰盤（盤子在下面、兩邊的人臉也還在） */
const ARENA_VIEW = { x: 85, y: 60 }

// ── 第一幕的位置（照 anim:shot 的成品量的）─────────────────
/** 禮物盒：在爸爸手上、在他懷裡、打開時放在地上 */
const GIFT_S = 10
const GIFT_DAD = 80
const GIFT_MOM = 38
const GIFT_HAND = { x: GIFT_DAD - 10, y: 58 }
const GIFT_HUG = { x: YANG0 + 2, y: 70 }
const GIFT_FLOOR = { x: 66, y: 71 }
/** 他舉高高（jump，flip）時陀螺在手上面；抱在胸前（hug） */
const LIFT_TOP = (x: number): Vec => ({ x: x - 1, y: 45 })
const HUG_TOP = (x: number): Vec => ({ x: x + 1, y: 68 })
/** spin 拉繩子（pull，flip）時拳頭的位置 */
const PULL_FIST = { x: 60, y: 69 }
/** spin 一拉往後退到這裡（dad 的開頭） */
const SPIN_YANG = 50
/** 爸爸舉手（know，不 flip）亮出陀螺時手上的位置 */
const DAD_HAND = { x: DAD1 - 5, y: 51 }
/** 爸爸的臉（不 flip，水噴過去的地方） */
const DAD_FACE = { x: DAD1 - 4, y: 47 }
/** 推近看爸爸被噴（盤裡的紅陀螺也在畫面裡） */
const DAD_VIEW = { x: 98, y: 52 }
/** 火跟著紅陀螺、在它上面 */
const FLAME_DY = -5
const FLAME_S = 12
/** 冰塊：罩住盤裡的陀螺、罩住爸爸 */
const ICE_S = 13
/** 冰塊（float）的底跟陀螺（float）的底對齊：兩個都會被引擎放大 */
const ICE_Y = TOP_Y + 0.46 * TOP_S * castScale(TOP_S) - 0.46 * ICE_S * castScale(ICE_S)
const ICE_DAD_S = 42
const ICE_DAD_Y = DG + 0.46 * DAD_S - 0.46 * ICE_DAD_S
/** 冰：他走過去敲爸爸冰塊的地方 */
const KNOCK_X = 94
/** 水陀螺的藍光 */
const WATER = 'saturate(1.2) drop-shadow(0 0 1.5px #2F9BFF)'
/** 他躺在地上滾：側躺時往下移，才貼著地板 */
const ROLL_DY = 5
/** win 的結尾：爸爸坐地、媽媽在他旁邊、藍陀螺躺在他腳邊 */
const WIN_DAD = DAD1
const WIN_MOM = 104
/** 媽媽站在盤子後面：往後退一點（往上 2） */
const WIN_MOM_Y = MG - 2
/** 藍陀螺彈下來，躺在坐地的爸爸腿上 */
const WIN_BLUE = { x: WIN_DAD - 7, y: 69 }

// ── 第二幕 ──────────────────────────────────────
/** 媽媽的大陀螺：size 50（比爸爸還高，34 以上引擎不放大），尖端站在對戰盤的右邊緣 */
const BIG_S = 50
const BIG_X = 102
const BIG_Y = 47
const bigTop = (): Actor => ({ id: 'big', emoji: 'prop:top-green', x: BIG_X, y: BIG_Y, size: BIG_S, float: true, pivot: 'center' })
const bigSpin = (): Actor => ({ ...bigTop(), emoji: 'prop:top-green-spin', tint: SPIN })
/** W2 的站位 */
const RED2 = 70
const MOM2 = 132
const DAD2 = 24
/** 媽媽推大陀螺時站在它右邊多遠 */
const MOM_PUSH_DX = 28
/** mom：爸爸逃過去跟他抱在一起的地方 */
const HUG_DAD = 34
/** 跳：紅陀螺落在大陀螺頂面（金色軸旁邊）的位置；推近看的中心 */
const ON_BIG = { x: BIG_X - 7, y: 29 }
const JUMP_VIEW = { x: 96, y: 44 }
/** 打：撞到大陀螺圓錐左邊的地方；爸爸（peek，flip）額頭、腫包的位置 */
const HIT_X = 88
const DAD_FOREHEAD = { x: DAD2 + 5, y: 53 }
const BUMP = { x: DAD2 + 4, y: 50 }
/** 生氣（第三次撞）、害羞（親） */
const ANGRY = 'saturate(1.8) brightness(1.05) drop-shadow(0 0 1.5px #FF2A00)'
const SHY = 'saturate(1.2) brightness(1.1) drop-shadow(0 0 1.5px #FF7FB0)'
/** 綠色大陀螺臉紅：色相整個轉到紅色（不是疊一層咖啡色）；一下子變過去，中間色是土黃色、不好看 */
const BLUSH = `hue-rotate(-105deg) saturate(1.7) brightness(1.05) ${SPIN}`
/** 親：唇印在大陀螺身上的位置；推近看的中心 */
const KISS = { x: BIG_X - 4, y: 52 }
const KISS_VIEW = { x: 92, y: 50 }
/** W2：大陀螺在右邊轉、紅陀螺在盤裡左邊對著它轉；他指著大陀螺，媽媽得意，爸爸躲在左邊偷看。媽媽畫在盤子後面 */
const w2 = (): Actor[] => [
  ...behindArena([mom('smug', MOM2, { flip: false })]),
  bigSpin(),
  dad('peek', DAD2, { flip: true }),
  yang('point'),
  red(RED2),
]

// ── 第三幕的起點（sky 的結尾）────────────────────────
/** 桌子被媽媽拉到中間，蛋糕跟著；大陀螺縮成 0.85 倍落在蛋糕上 */
const CAKE_K = 1.3
const CAKE3 = { x: 116, y: 54.4 }
const BIG_CAKE_K = 0.85
const BIG_CAKE_Y = 28.5
/** W3 的鏡頭：推近一點，三張臉和蛋糕上的大陀螺（頂沒被切掉）都在畫面裡 */
const W3_VIEW = { x: 78, y: 47 }
const W3_Z = 1.08
/** W3 他抱在胸前的紅陀螺 */
const RED3_Y = 71

/** W3 的站位：三個人排在蛋糕左邊，嚇得縮著（scared）；他把紅陀螺抱在胸前 */
const YANG3 = 34
const DAD3 = 60
const MOM3 = 86
// ── 第三幕 ──────────────────────────────────────
/** W3 的佈置：桌子、蛋糕放大 1.3 倍，大陀螺縮成 0.85 倍在蛋糕上（跟 sky 結尾一樣用 scaleTo，大小才接得上） */
const w3Fix: Move[] = [
  { at: 0, dur: 0, actor: 'table', do: 'stretchTo', amount: TABLE_W },
  { at: 0, dur: 0, actor: 'table', do: 'scaleTo', amount: CAKE_K },
  { at: 0, dur: 0, actor: 'cake', do: 'scaleTo', amount: CAKE_K },
  { at: 0, dur: 0, actor: 'big', do: 'scaleTo', amount: BIG_CAKE_K },
]
const table3: Actor = { ...table, x: CAKE3.x }
const cake3: Actor = { ...cake, ...CAKE3 }
const big3 = (): Actor => ({ ...bigSpin(), x: CAKE3.x, y: BIG_CAKE_Y })
const red3 = (): Actor => ({ id: 'red', emoji: 'prop:top-red', x: YANG3 + 1, y: RED3_Y, size: TOP_S, float: true, pivot: 'center' })
/** W3：三個人排在蛋糕左邊嚇得縮著，大陀螺在蛋糕上轉 */
const w3 = (): Actor[] => [
  ...balloons, table3, cake3,
  mom('scared', MOM3),
  big3(),
  dad('scared', DAD3, { flip: true }),
  yang('scared', YANG3),
  red3(),
]
/** W3 每一段都要的：佈置、氣球晃、大陀螺轉 */
const w3Base = (dur: number): Move[] => [...w3Fix, ...sway(dur), ...whirl('big', 0, dur, 0.12, 4)]
const W3_START = closeUp(-0.3, 0.01, W3_VIEW, W3_Z)
const w3Back = (at: number, dur = 0.5): Camera => closeUp(at, dur, W3_VIEW, W3_Z)
/** 大陀螺甩出來的一坨奶油（float，從大陀螺身上飛出來） */
const GLOB_FROM = { x: CAKE3.x - 8, y: 38 }
const glob = (id: string, size = 10): Actor => ({ id, emoji: 'prop:cream-splat', ...GLOB_FROM, size, hidden: true, float: true, pivot: 'center' })
/** 甩一坨奶油：at 冒出來，dur 秒飛到 to */
const fling = (id: string, at: number, to: Vec, dur: number, arc = 10): Move[] => [
  { at, actor: id, do: 'pop', dur: 0.1 },
  { at, actor: 'big', do: 'tilt', amount: -8, dur: 0.3 },
  { at, actor: id, do: 'moveTo', to, arc, dur, ease: 'in' },
  { at, actor: id, do: 'spin', times: 1, dur },
]
/** W3 的臉（照成品量的）：爸爸的眼鏡、媽媽的臉、媽媽頭頂、他的嘴 */
const DAD_EYES = { x: DAD3 - 1, y: 58 }
const MOM_FACE = { x: MOM3 + 1, y: 62 }
const MOM_HEAD = { x: MOM3, y: 49 }
const YANG_FACE = { x: YANG3 - 3, y: 62 }
const YANG_MOUTH = { x: YANG3 - 2, y: 63 }
/** cream 之後：剩下的蛋糕（prop:cake）上插著一根蠟燭；大陀螺累倒在右邊地上 */
const CANDLE_S = 9
const CANDLE = { x: CAKE3.x, y: 41 }
const BIG_ASLEEP = { x: 142, y: 60 }
/** end：一家三口的站位與推近的鏡頭 */
const YANG_END = 76
const MOM_END = 63
const DAD_END = 90
/** 蠟燭吹熄：只畫下面那截（把火焰切掉）；吹的方向對準火焰 */
const CANDLE_CUT = 0.42
const CANDLE_FLAME_DX = 0
const END_VIEW = { x: 80, y: 56 }

/** W1 的人（陀螺另外放） */
const w1People = () => [mom('know'), dad('smug'), yang('ponder')]

const scenes: Scenes = {
  // 今天是楊捷睿的生日！——房間佈置好了（氣球、蛋糕、對戰盤），他蹦蹦跳跳進來；爸爸媽媽從兩邊衝出來拉拉炮，
  // 「碰！」彩帶滿天，他嚇得跳起來，再笑開、在空中轉一圈；三個人輪流跳。結尾 W0
  birthday: scene({
    duration: 5.6,
    bg: BG,
    actors: [
      ...room,
      mom('throw', MOM0, { hidden: true }),
      dad('throw', DAD0, { hidden: true }),
      yang('happy', YANG0, { hidden: true }),
      { id: 'pop1', emoji: '🎉', x: MOM0 + 9, y: 49, size: 12, hidden: true, float: true },
      { id: 'pop2', emoji: '🎉', x: DAD0 - 10, y: 47, size: 12, hidden: true, float: true, flip: true },
    ],
    moves: [
      ...flatten,
      ...sway(5.6),
      // 蹦蹦跳跳進來
      { at: 0, actor: 'yang', do: 'enter', from: { x: -16, y: YG }, dur: 1.0, ease: 'linear' },
      { at: 0, actor: 'yang', do: 'hop', amount: 5, dur: 0.33 },
      { at: 0.33, actor: 'yang', do: 'hop', amount: 5, dur: 0.33 },
      { at: 0.66, actor: 'yang', do: 'hop', amount: 5, dur: 0.34 },
      // 爸爸媽媽從兩邊衝出來，舉起拉炮
      { at: 0.85, actor: 'mom', do: 'enter', from: { x: -20, y: MG }, dur: 0.35, ease: 'out' },
      { at: 0.85, actor: 'dad', do: 'enter', from: { x: 182, y: DG }, dur: 0.35, ease: 'out' },
      { at: 1.1, actor: 'pop1', do: 'pop', dur: 0.15 },
      { at: 1.1, actor: 'pop2', do: 'pop', dur: 0.15 },
      { at: 1.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
      // 碰！他嚇得跳起來
      { at: 1.35, actor: 'pop1', do: 'squash', amount: -0.4, dur: 0.25 },
      { at: 1.35, actor: 'pop2', do: 'squash', amount: -0.4, dur: 0.25 },
      { at: 1.35, actor: 'mom', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 1.35, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 1.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 1.35, actor: 'yang', do: 'hop', amount: 10, dur: 0.4 },
      { at: 1.8, actor: 'yang', do: 'shake', amount: 1, dur: 0.3 },
      { at: 1.8, actor: 'pop1', do: 'vanish', dur: 0.2 },
      { at: 1.8, actor: 'pop2', do: 'vanish', dur: 0.2 },
      // 笑開
      { at: 1.8, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 1.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 1.9, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.0, actor: 'dad', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 2.2, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 2.5, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      // 開心到在空中轉一圈
      { at: 2.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 2.9, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.15 },
      { at: 3.05, actor: 'yang', do: 'hop', amount: 12, dur: 0.6 },
      { at: 3.05, actor: 'yang', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
      { at: 2.7, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      { at: 2.75, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
      { at: 2.9, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.25 },
      { at: 3.15, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.25 },
      // 三個人輪流跳
      { at: 3.95, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 3.95, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 4.0, actor: 'mom', do: 'hop', amount: 6, dur: 0.35 },
      { at: 4.25, actor: 'yang', do: 'hop', amount: 7, dur: 0.35 },
      { at: 4.5, actor: 'dad', do: 'hop', amount: 6, dur: 0.35 },
      { at: 4.85, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.1, actor: 'mom', do: 'tilt', amount: -6, dur: 0.4 },
      { at: 5.15, actor: 'dad', do: 'tilt', amount: 6, dur: 0.4 },
    ],
    fx: [
      { at: 1.35, kind: 'burst', actor: 'pop1', emoji: '🎊', n: 8, dx: 4, dy: -2, dur: 0.8, scale: 1.5 },
      { at: 1.35, kind: 'burst', actor: 'pop2', emoji: '🎊', n: 8, dx: -4, dy: -2, dur: 0.8, scale: 1.5 },
      { at: 1.4, kind: 'burst', x: 70, y: 30, emoji: '✨', n: 8, dur: 0.7 },
      { at: 1.5, kind: 'burst', x: 60, y: 26, emoji: '🎊', n: 10, dur: 1.2, scale: 1.6 },
      { at: 1.6, kind: 'burst', x: 100, y: 22, emoji: '🎉', n: 8, dur: 1.2, scale: 1.4 },
      { at: 1.4, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      { at: 2.2, kind: 'pop', actor: 'yang', emoji: '🥳', dur: 1.0, scale: 1.5 },
      { at: 3.15, kind: 'burst', actor: 'yang', emoji: '⭐', n: 8, dur: 0.8 },
      { at: 4.0, kind: 'burst', x: 80, y: 24, emoji: '🎊', n: 10, dur: 1.2, scale: 1.5 },
    ],
    camera: [START, release(0.3), { at: 1.35, dur: 0.3, do: 'shake', amount: 1 }, holdWide(4.9, 0.6)],
    cues: [
      { at: 1.35, sfx: 'poof' },
      { at: 1.5, say: '今天是楊捷睿的生日！' },
      { at: 1.6, sfx: 'cheer' },
      { at: 3.05, sfx: 'whoosh' },
    ],
  }),

  // 爸爸媽媽給他一個陀螺。——爸爸捧著禮物盒、媽媽伸手比「給你」，一起走過來交給他；他抱著搖一搖（咚咚），放在地上打開：
  // 燈暗下來，一顆紅色陀螺發著光升起來，他眼睛變成星星，抓過來跳著舉高高；爸爸撿起空盒子往後一丟。
  // 結尾：他把陀螺抱在胸前（hug），爸爸媽媽退回 W0
  gift: scene({
    duration: 6.2,
    bg: BG,
    actors: [
      ...room,
      mom('happy', MOM0),
      dad('happy', DAD0),
      yang('happy', YANG0),
      { id: 'box', emoji: 'prop:gift', x: GIFT_HAND.x + 26, y: GIFT_HAND.y, size: GIFT_S, hidden: true, float: true, pivot: 'center' },
      { id: 'red', emoji: 'prop:top-red', x: GIFT_FLOOR.x, y: 68, size: TOP_S, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      ...flatten,
      ...sway(6.2),
      // 爸爸捧著禮物、媽媽伸手，一起走過來
      { at: 0.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
      { at: 0.1, actor: 'box', do: 'pop', dur: 0.2 },
      { at: 0.1, actor: 'box', do: 'flash', dur: 0.6 },
      { at: 0.3, actor: 'dad', do: 'moveTo', to: { x: GIFT_DAD, y: DG }, dur: 0.55 },
      { at: 0.3, actor: 'box', do: 'moveTo', to: GIFT_HAND, dur: 0.55 },
      { at: 0.3, actor: 'mom', do: 'moveTo', to: { x: GIFT_MOM, y: MG }, dur: 0.45 },
      { at: 0.4, actor: 'mom', do: 'swap', emoji: 'hero:three/reach' },
      { at: 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
      { at: 0.35, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 0.7, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 交給他
      { at: 1.0, actor: 'box', do: 'moveTo', to: GIFT_HUG, dur: 0.3, ease: 'out' },
      { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
      { at: 1.1, actor: 'mom', do: 'swap', emoji: 'hero:three/giggle' },
      { at: 1.15, actor: 'dad', do: 'swap', emoji: 'hero:eric/giggle' },
      // 搖一搖
      { at: 1.4, actor: 'box', do: 'shake', amount: 1.6, dur: 0.3 },
      { at: 1.4, actor: 'yang', do: 'tilt', amount: 6, dur: 0.3 },
      { at: 1.75, actor: 'box', do: 'shake', amount: 2.2, dur: 0.3 },
      { at: 1.75, actor: 'yang', do: 'tilt', amount: -6, dur: 0.3 },
      // 放在地上打開
      { at: 2.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 2.1, actor: 'box', do: 'moveTo', to: GIFT_FLOOR, arc: 2, dur: 0.25 },
      { at: 2.4, actor: 'box', do: 'swap', emoji: 'prop:gift-open' },
      { at: 2.4, actor: 'box', do: 'squash', amount: 0.2, dur: 0.2 },
      { at: 2.45, actor: 'red', do: 'pop', dur: 0.2 },
      { at: 2.45, actor: 'red', do: 'moveTo', to: { x: GIFT_FLOOR.x, y: 40 }, dur: 0.7, ease: 'out' },
      { at: 2.45, actor: 'red', do: 'flash', dur: 1.4 },
      { at: 3.15, actor: 'red', do: 'hop', amount: 2, dur: 0.4 },
      { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 2.5, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 2.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
      { at: 2.55, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 2.55, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      // 抓過來，跳著舉高高
      { at: 3.45, actor: 'red', do: 'moveTo', to: LIFT_TOP(YANG0), dur: 0.3 },
      { at: 3.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 3.6, actor: 'yang', do: 'hop', amount: 7, dur: 0.4 },
      { at: 3.6, actor: 'red', do: 'hop', amount: 7, dur: 0.4 },
      { at: 4.1, actor: 'yang', do: 'hop', amount: 9, dur: 0.45 },
      { at: 4.1, actor: 'red', do: 'hop', amount: 9, dur: 0.45 },
      // 爸爸撿起空盒子往後一丟
      { at: 3.45, actor: 'dad', do: 'swap', emoji: 'hero:eric/throw' },
      { at: 3.45, actor: 'box', do: 'moveTo', to: { x: GIFT_DAD - 7, y: 46 }, arc: 4, dur: 0.2 },
      { at: 3.65, actor: 'box', do: 'moveTo', to: { x: 192, y: 8 }, arc: 8, dur: 0.6 },
      { at: 3.65, actor: 'box', do: 'spin', times: 2, dur: 0.6 },
      { at: 4.3, actor: 'box', do: 'vanish', dur: 0.05 },
      // 抱在胸前，爸爸媽媽退回去
      { at: 4.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
      { at: 4.65, actor: 'red', do: 'moveTo', to: HUG_TOP(YANG0), dur: 0.25 },
      { at: 4.95, actor: 'yang', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 4.95, actor: 'red', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 4.3, actor: 'mom', do: 'moveTo', to: { x: MOM0, y: MG }, dur: 0.5 },
      { at: 4.3, actor: 'dad', do: 'moveTo', to: { x: DAD0, y: DG }, dur: 0.5 },
      { at: 4.3, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      { at: 4.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
      { at: 4.9, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 4.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 5.0, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.3, actor: 'dad', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.55, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.3 },
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'box', emoji: '✨', n: 6, dy: 4, dur: 0.5 },
      { at: 0.4, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      { at: 1.45, kind: 'pop', actor: 'yang', emoji: '❓', dur: 0.7 },
      { at: 2.4, kind: 'burst', actor: 'box', emoji: '✨', n: 8, dy: 4, dur: 0.6 },
      { at: 2.75, kind: 'burst', actor: 'red', emoji: '🌟', n: 8, dy: 6, dur: 0.9 },
      { at: 3.0, kind: 'pop', actor: 'yang', emoji: '🤩', dx: -10, dur: 0.9, scale: 1.4 },
      { at: 3.65, kind: 'burst', actor: 'red', emoji: '✨', n: 6, dy: 4, dur: 0.6 },
      { at: 4.15, kind: 'burst', actor: 'red', emoji: '✨', n: 8, dy: 4, dur: 0.6 },
      { at: 5.0, kind: 'burst', actor: 'yang', emoji: '💗', n: 5, dy: 4, dur: 0.8, scale: 0.8 },
    ],
    lights: [
      { at: 2.35, dur: 0.3, level: 0.35 },
      { at: 3.35, dur: 0.4, level: 0 },
    ],
    camera: [START, release(0.3), holdWide(5.4, 0.6)],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 0.9, say: '爸爸媽媽給他一個陀螺。' },
      { at: 1.4, sfx: 'tap' },
      { at: 1.75, sfx: 'tap' },
      { at: 2.4, sfx: 'poof' },
      { at: 2.55, sfx: 'cheer' },
      { at: 3.65, sfx: 'whoosh' },
    ],
  }),

  // 他一拉，陀螺好快！——他把陀螺放在地上、擺出拉的姿勢一拉：「咻」！陀螺衝出去繞著爸爸的腳轉，
  // 爸爸跟著原地轉圈、越轉越快、頭暈坐地；陀螺再衝向媽媽，媽媽跳起來讓它從腳下鑽過去；最後一個大彎跳進對戰盤，穩穩地轉
  spin: scene({
    duration: 6.0,
    bg: BG,
    actors: [
      ...room,
      mom('happy', MOM0),
      dad('happy', DAD0),
      yang('hug', YANG0),
      { id: 'red', emoji: 'prop:top-red', ...HUG_TOP(YANG0), size: TOP_S, float: true, pivot: 'center' },
    ],
    moves: [
      ...flatten,
      ...sway(6.0),
      // 放在地上，擺好姿勢
      { at: 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 0.15, actor: 'red', do: 'moveTo', to: { x: 71, y: TOP_FLOOR }, arc: 3, dur: 0.4 },
      { at: 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
      { at: 0.6, actor: 'yang', do: 'moveTo', to: { x: 53, y: YG }, dur: 0.5, ease: 'in' },
      { at: 0.65, actor: 'red', do: 'shake', amount: 0.6, dur: 0.45 },
      // 一拉！
      { at: 1.1, actor: 'yang', do: 'moveTo', to: { x: SPIN_YANG, y: YG }, dur: 0.15, ease: 'out' },
      { at: 1.1, actor: 'yang', do: 'squash', amount: 0.25, dur: 0.2 },
      { at: 1.1, actor: 'red', do: 'swap', emoji: 'prop:top-red-spin' },
      { at: 1.1, actor: 'red', do: 'tint', filter: SPIN },
      ...whirl('red', 1.1, 6.0),
      // 衝到爸爸腳邊繞圈
      { at: 1.15, actor: 'red', do: 'moveTo', to: { x: 100, y: TOP_FLOOR }, dur: 0.3, ease: 'in' },
      ...[[124, TOP_FLOOR - 1], [100, TOP_FLOOR + 1], [124, TOP_FLOOR - 1], [100, TOP_FLOOR + 1], [124, TOP_FLOOR - 1], [104, TOP_FLOOR]].map(([x, y], i): Move => ({
        at: +(1.45 + i * 0.16).toFixed(2), actor: 'red', do: 'moveTo', to: { x, y }, dur: 0.16, ease: 'linear',
      })),
      { at: 1.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 1.3, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
      // 爸爸跟著原地轉，越轉越快
      ...[1.55, 1.75, 1.92, 2.07, 2.2, 2.32].map((at): Move => ({ at, actor: 'dad', do: 'flip' })),
      { at: 1.55, actor: 'dad', do: 'tilt', amount: -8, dur: 0.4 },
      { at: 1.95, actor: 'dad', do: 'tilt', amount: 10, dur: 0.4 },
      { at: 2.45, actor: 'dad', do: 'swap', emoji: 'hero:eric/dizzy' },
      // 衝向媽媽：媽媽跳起來，陀螺從腳下鑽過去
      { at: 2.45, actor: 'red', do: 'moveTo', to: { x: 36, y: TOP_FLOOR }, dur: 0.4, ease: 'linear' },
      { at: 2.3, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 2.55, actor: 'mom', do: 'swap', emoji: 'hero:three/jump' },
      { at: 2.55, actor: 'mom', do: 'hop', amount: 15, dur: 0.55 },
      { at: 2.85, actor: 'red', do: 'moveTo', to: { x: 12, y: TOP_FLOOR }, dur: 0.15, ease: 'linear' },
      // 撞到牆彈回來，貼著地板從他腳前衝過去，一跳跳進對戰盤
      { at: 3.0, actor: 'red', do: 'moveTo', to: { x: 62, y: TOP_FLOOR + 1 }, dur: 0.35, ease: 'linear' },
      { at: 3.35, actor: 'red', do: 'moveTo', to: { x: ARENA_X, y: TOP_Y }, arc: 9, dur: 0.4, ease: 'out' },
      { at: 3.75, actor: 'red', do: 'squash', amount: 0.3, dur: 0.2 },
      { at: 3.1, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 3.6, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      // 他看著陀螺跑
      { at: 1.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 2.6, actor: 'yang', do: 'flip' },
      { at: 3.3, actor: 'yang', do: 'flip' },
      { at: 3.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 3.85, actor: 'yang', do: 'hop', amount: 7, dur: 0.35 },
      { at: 4.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
      { at: 4.45, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 4.6, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 4.65, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 5.1, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.3, actor: 'dad', do: 'tilt', amount: 8, dur: 0.5 },
    ],
    fx: [
      // 繩子從陀螺拉到他的拳頭
      { at: 0.65, kind: 'line', actor: 'red', to: PULL_FIST, color: '#FFFFFF', width: 1.2, dur: 0.5 },
      { at: 1.1, kind: 'burst', x: 71, y: 70, emoji: '💨', n: 4, dur: 0.5 },
      { at: 1.4, kind: 'pop', actor: 'dad', emoji: '❗', dur: 0.4 },
      { at: 2.5, kind: 'dizzy', actor: 'dad', dur: 3.4 },
      { at: 2.6, kind: 'pop', actor: 'mom', emoji: '😱', dx: 12, dur: 0.6 },
      { at: 3.7, kind: 'burst', actor: 'red', emoji: '✨', n: 8, dur: 0.6 },
      { at: 4.45, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.9, scale: 1.3 },
    ],
    camera: [START, release(0.3), { at: 1.15, dur: 0.3, do: 'follow', actor: 'red', amount: 1.3 }, release(3.0, 0.5), closeUp(3.6, 0.4, ARENA_VIEW, 1.4), holdWide(5.0, 0.6)],
    cues: [
      { at: 1.1, sfx: 'whoosh' },
      { at: 1.15, say: '他一拉，陀螺好快！' },
      { at: 2.55, sfx: 'boing' },
      { at: 3.7, sfx: 'clink' },
    ],
  }),

  // 爸爸也有陀螺。他要和楊捷睿大戰！——爸爸搖搖頭回神、站起來，從背後亮出一顆藍色陀螺（秀肌肉），往對戰盤一丟；
  // 他退後一步、媽媽握拳加油；兩顆陀螺在盤子裡對撞兩次，一次比一次大，擦出火花。結尾 W1
  dad: scene({
    duration: 5.2,
    bg: BG,
    actors: [
      ...room,
      mom('happy', MOM0),
      dad('dizzy', DAD0),
      yang('happy', SPIN_YANG),
      red(ARENA_X),
      { ...blue(DAD_HAND.x, DAD_HAND.y), emoji: 'prop:top-blue', tint: undefined, hidden: true },
    ],
    moves: [
      ...flatten,
      ...sway(5.2),
      ...whirl('red', 0, 5.2),
      // 回神
      { at: 0.15, actor: 'dad', do: 'shake', amount: 1.4, dur: 0.4 },
      { at: 0.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 0.6, actor: 'dad', do: 'hop', amount: 4, dur: 0.3 },
      { at: 0.7, actor: 'dad', do: 'moveTo', to: { x: DAD1, y: DG }, dur: 0.3 },
      // 噹噹！從背後亮出藍陀螺、秀肌肉
      { at: 1.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/know' },
      { at: 1.05, actor: 'blue', do: 'pop', dur: 0.25 },
      { at: 1.05, actor: 'blue', do: 'flash', dur: 0.8 },
      { at: 1.45, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.18 },
      { at: 1.7, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.18 },
      { at: 1.45, actor: 'blue', do: 'hop', amount: 1, dur: 0.18 },
      { at: 1.7, actor: 'blue', do: 'hop', amount: 1, dur: 0.18 },
      // 丟進對戰盤
      { at: 2.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/throw' },
      { at: 2.0, actor: 'blue', do: 'moveTo', to: { x: DAD_HAND.x + 1, y: DAD_HAND.y - 4 }, dur: 0.15 },
      { at: 2.25, actor: 'blue', do: 'swap', emoji: 'prop:top-blue-spin' },
      { at: 2.25, actor: 'blue', do: 'tint', filter: SPIN },
      { at: 2.25, actor: 'blue', do: 'moveTo', to: { x: BLUE1, y: TOP_Y }, arc: 10, dur: 0.45, ease: 'in' },
      { at: 2.7, actor: 'blue', do: 'squash', amount: 0.3, dur: 0.2 },
      ...whirl('blue', 2.25, 5.2),
      { at: 2.3, actor: 'red', do: 'moveTo', to: { x: RED1, y: TOP_Y }, dur: 0.4 },
      { at: 2.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      // 他退後一步、媽媽加油
      { at: 1.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 1.1, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 1.7, actor: 'yang', do: 'moveTo', to: { x: YANG1, y: YG }, dur: 0.35 },
      { at: 1.7, actor: 'mom', do: 'moveTo', to: { x: MOM1, y: MG }, dur: 0.35 },
      { at: 2.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/stomp' },
      { at: 2.45, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 2.4, actor: 'mom', do: 'swap', emoji: 'hero:three/know' },
      { at: 2.45, actor: 'mom', do: 'hop', amount: 5, dur: 0.3 },
      // 第一次對撞
      { at: 3.2, actor: 'red', do: 'moveTo', to: { x: 79.5, y: TOP_Y }, dur: 0.25, ease: 'in' },
      { at: 3.2, actor: 'blue', do: 'moveTo', to: { x: 84.5, y: TOP_Y }, dur: 0.25, ease: 'in' },
      { at: 3.47, actor: 'red', do: 'moveTo', to: { x: 71, y: TOP_Y }, dur: 0.3, ease: 'out' },
      { at: 3.47, actor: 'blue', do: 'moveTo', to: { x: 93, y: TOP_Y }, dur: 0.3, ease: 'out' },
      // 第二次：退後蓄力，撞得更大力
      { at: 3.9, actor: 'red', do: 'moveTo', to: { x: 79.5, y: TOP_Y }, dur: 0.22, ease: 'in', anticipate: 3 },
      { at: 3.9, actor: 'blue', do: 'moveTo', to: { x: 84.5, y: TOP_Y }, dur: 0.22, ease: 'in', anticipate: 3 },
      { at: 4.14, actor: 'red', do: 'moveTo', to: { x: RED1, y: TOP_Y }, dur: 0.4, ease: 'back' },
      { at: 4.14, actor: 'blue', do: 'moveTo', to: { x: BLUE1, y: TOP_Y }, dur: 0.4, ease: 'back' },
      { at: 4.14, actor: 'red', do: 'hop', amount: 3, dur: 0.3 },
      { at: 4.14, actor: 'blue', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.5, actor: 'yang', do: 'hop', amount: 2, dur: 0.2 },
      { at: 4.2, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
      // 回到 W1：他想辦法，爸爸得意，媽媽加油
      { at: 4.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
      { at: 4.8, actor: 'yang', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 4.75, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.3 },
      { at: 4.85, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
    ],
    fx: [
      { at: 0.15, kind: 'dizzy', actor: 'dad', dur: 0.5 },
      { at: 1.05, kind: 'burst', actor: 'blue', emoji: '✨', n: 8, dur: 0.6 },
      { at: 1.15, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      { at: 1.4, kind: 'pop', actor: 'dad', emoji: '💪', dx: 10, dur: 0.9, scale: 1.3 },
      { at: 2.7, kind: 'puff', actor: 'blue', dur: 0.4 },
      { at: 2.5, kind: 'pop', actor: 'yang', emoji: '😤', dur: 0.8 },
      { at: 3.45, kind: 'burst', x: 82, y: 64, emoji: '⚡', n: 5, dur: 0.45, scale: 0.8 },
      { at: 4.12, kind: 'burst', x: 82, y: 63, emoji: '⚡', n: 8, dur: 0.6, scale: 1.3 },
      { at: 4.12, kind: 'burst', x: 82, y: 64, emoji: '✨', n: 6, dur: 0.6 },
      { at: 4.2, kind: 'pop', actor: 'dad', emoji: '😏', dx: -2, dur: 0.9 },
    ],
    camera: [START, release(0.3), closeUp(2.9, 0.4, { x: 88, y: 60 }, 1.5), { at: 3.45, dur: 0.25, do: 'shake', amount: 0.7 }, { at: 4.12, dur: 0.3, do: 'shake', amount: 1.4 }, holdWide(4.5, 0.5)],
    cues: [
      { at: 1.05, sfx: 'poof' },
      { at: 1.15, say: '爸爸也有陀螺。他要和楊捷睿大戰！' },
      { at: 2.25, sfx: 'whoosh' },
      { at: 2.7, sfx: 'clink' },
      { at: 3.45, sfx: 'clink' },
      { at: 4.12, sfx: 'crack' },
    ],
  }),

  // 火陀螺！爸爸的陀螺飛了！——紅陀螺「轟」地著火，在盤子裡繞一圈、往後縮蓄力，拖著火衝過去，
  // 把藍陀螺撞得冒著煙飛出畫面；爸爸下巴掉下來（臉拉長）、轉頭看它飛走；他跳起來歡呼，火慢慢熄掉。結尾接 win
  'power:火': (() => {
    // 火跟著紅陀螺走：同一組移動給火焰也寫一份（往上 FLAME_DY）
    const path: [number, Vec, number, Move['ease']?][] = [
      [0.6, { x: 66, y: 70 }, 0.3],
      [0.9, { x: 68, y: 64 }, 0.25],
      [1.15, { x: 63, y: 67 }, 0.2],
      [1.4, { x: 86, y: TOP_Y }, 0.22, 'in'],
      [1.65, { x: 80, y: TOP_Y }, 0.3, 'out'],
      [2.3, { x: ARENA_X, y: TOP_Y }, 0.3],
    ]
    const both = (id: string, dy: number) => path.map(([at, to, dur, ease]): Move => ({ at, actor: id, do: 'moveTo', to: { x: to.x, y: to.y + dy }, dur, ease }))
    return scene({
      duration: 5.2,
      bg: BG,
      // 火畫在陀螺後面：從陀螺的四周往上竄
      actors: [...room, ...w1People(), { id: 'flame', emoji: '🔥', x: RED1, y: TOP_Y + FLAME_DY, size: FLAME_S, hidden: true, float: true }, red(), blue()],
      moves: [
        ...flatten,
        ...sway(5.2),
        ...whirl('red', 0, 5.2),
        ...whirl('blue', 0, 1.6),
        // 轟！著火
        { at: 0.15, actor: 'red', do: 'tint', filter: FIRE },
        { at: 0.15, actor: 'flame', do: 'pop', dur: 0.25 },
        { at: 0.15, actor: 'red', do: 'hop', amount: 3, dur: 0.25 },
        { at: 0.4, actor: 'flame', do: 'squash', amount: -0.3, dur: 0.4 },
        ...both('red', 0),
        ...both('flame', FLAME_DY),
        { at: 1.15, actor: 'red', do: 'squash', amount: -0.3, dur: 0.25 },
        { at: 1.15, actor: 'flame', do: 'squash', amount: -0.5, dur: 0.25 },
        // 撞飛藍陀螺
        { at: 1.65, actor: 'blue', do: 'swap', emoji: 'prop:top-blue' },
        { at: 1.65, actor: 'blue', do: 'moveTo', to: { x: 176, y: 6 }, arc: 8, dur: 0.75, ease: 'out' },
        { at: 1.65, actor: 'blue', do: 'spin', times: 4, dur: 0.75 },
        { at: 2.4, actor: 'blue', do: 'vanish', dur: 0.05 },
        // 爸爸下巴掉下來、轉頭看它飛走
        { at: 1.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 1.75, actor: 'dad', do: 'stretchTo', amount: 0.72, dur: 0.2, ease: 'back' },
        { at: 2.2, actor: 'dad', do: 'flip' },
        { at: 2.9, actor: 'dad', do: 'stretchTo', amount: 1 / 0.72, dur: 0.4, ease: 'elastic' },
        // 抬頭指著它飛走的地方，肩膀垮下來，又轉回來傻眼
        { at: 3.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/point' },
        { at: 3.25, actor: 'dad', do: 'hop', amount: 3, dur: 0.3 },
        { at: 3.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/hungry' },
        { at: 3.85, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.4 },
        { at: 4.35, actor: 'dad', do: 'flip' },
        { at: 4.35, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 4.4, actor: 'dad', do: 'shake', amount: 0.8, dur: 0.4 },
        // 他與媽媽
        { at: 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
        { at: 0.35, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
        { at: 0.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
        { at: 0.4, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        { at: 1.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
        { at: 1.8, actor: 'yang', do: 'hop', amount: 9, dur: 0.45 },
        { at: 1.9, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
        { at: 1.95, actor: 'mom', do: 'hop', amount: 6, dur: 0.35 },
        { at: 2.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
        { at: 2.65, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
        { at: 3.0, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
        { at: 3.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
        { at: 3.55, actor: 'yang', do: 'hop', amount: 8, dur: 0.5 },
        { at: 3.55, actor: 'yang', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
        { at: 4.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
        { at: 4.25, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
        { at: 4.0, actor: 'mom', do: 'hop', amount: 5, dur: 0.3 },
        { at: 4.65, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
        { at: 4.8, actor: 'mom', do: 'hop', amount: 3, dur: 0.3 },
        // 火慢慢熄掉
        { at: 3.4, actor: 'flame', do: 'vanish', dur: 0.4 },
        { at: 3.6, actor: 'red', do: 'tint', filter: SPIN },
      ],
      fx: [
        { at: 0.15, kind: 'burst', actor: 'red', emoji: '🔥', n: 6, dy: 4, dur: 0.6, scale: 0.8 },
        { at: 1.45, kind: 'burst', x: 69, y: 66, emoji: '🔥', n: 1, dur: 0.45, scale: 0.6 },
        { at: 1.5, kind: 'burst', x: 74, y: 66, emoji: '🔥', n: 1, dur: 0.45, scale: 0.7 },
        { at: 1.56, kind: 'burst', x: 79, y: 66, emoji: '🔥', n: 1, dur: 0.45, scale: 0.8 },
        { at: 1.65, kind: 'burst', x: 89, y: 62, emoji: '💥', n: 1, dur: 0.45, scale: 1.4 },
        // 冒著煙飛走（煙留在飛過的路上）
        { at: 1.75, kind: 'burst', x: 104, y: 52, emoji: '💨', n: 1, dur: 0.5 },
        { at: 1.9, kind: 'burst', x: 124, y: 34, emoji: '💨', n: 1, dur: 0.5 },
        { at: 2.05, kind: 'burst', x: 144, y: 22, emoji: '💨', n: 1, dur: 0.5 },
        { at: 1.75, kind: 'pop', actor: 'dad', emoji: '😱', dx: -4, dur: 0.9, scale: 1.3 },
        { at: 2.4, kind: 'sweat', actor: 'dad' },
        { at: 2.0, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.9, scale: 1.3 },
        { at: 3.6, kind: 'burst', actor: 'yang', emoji: '⭐', n: 8, dur: 0.8 },
        { at: 3.4, kind: 'puff', actor: 'red', dur: 0.4 },
      ],
      lights: [{ at: 1.63, dur: 0.08, level: -0.35 }, { at: 1.71, dur: 0.25, level: 0 }],
      camera: [START, release(0.2, 0.2), closeUp(0.3, 0.35, ARENA_VIEW, 1.6), holdWide(1.65, 0.3), { at: 1.7, dur: 0.35, do: 'shake', amount: 2 }, release(2.6), holdWide(4.5, 0.5)],
      cues: [
        { at: 0.15, sfx: 'poof' },
        { at: 0.45, say: '火陀螺！爸爸的陀螺飛了！' },
        { at: 1.4, sfx: 'whoosh' },
        { at: 1.65, sfx: 'bonk' },
        { at: 2.6, sfx: 'cheer' },
      ],
    })
  })(),

  // 冰陀螺！陀螺和爸爸都變冰了！——紅陀螺結霜、整顆凍進冰塊裡停住，冷氣在地上一路爬過去，藍陀螺也凍住，
  // 再爬上爸爸的腳：爸爸變藍、縮起來，整個人被凍成一大塊冰在裡面發抖。媽媽和他轉頭對看、偷笑；
  // 冰「喀啦、喀啦」裂開，爸爸打一個大噴嚏，噴嚏把兩顆陀螺的冰也震碎，回到 W1
  'power:冰': scene({
    duration: 6.8,
    bg: BG,
    actors: [
      // 他畫在最前面：走過去敲冰塊時不會被冰塊蓋住
      ...room, mom('know'), dad('smug'), red(), blue(),
      { id: 'ice1', emoji: 'prop:ice', x: RED1, y: ICE_Y, size: ICE_S, hidden: true, float: true, tint: 'opacity(.72)' },
      { id: 'ice2', emoji: 'prop:ice', x: BLUE1, y: ICE_Y, size: ICE_S, hidden: true, float: true, tint: 'opacity(.72)' },
      { id: 'iceD', emoji: 'prop:ice', x: DAD1, y: ICE_DAD_Y, size: ICE_DAD_S, hidden: true, tint: 'opacity(.6)' },
      yang('ponder'),
    ],
    moves: [
      ...flatten,
      ...sway(6.8),
      ...whirl('red', 0, 0.4),
      ...whirl('blue', 0, 1.0),
      // 紅陀螺結冰停住
      { at: 0.15, actor: 'red', do: 'tint', filter: ICE },
      { at: 0.4, actor: 'red', do: 'swap', emoji: 'prop:top-red' },
      { at: 0.4, actor: 'ice1', do: 'pop', dur: 0.25 },
      // 藍陀螺也凍住
      { at: 1.0, actor: 'blue', do: 'swap', emoji: 'prop:top-blue' },
      { at: 1.0, actor: 'blue', do: 'tint', filter: ICE },
      { at: 1.0, actor: 'ice2', do: 'pop', dur: 0.25 },
      // 爬上爸爸的腳
      { at: 1.5, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 1.5, actor: 'dad', do: 'hop', amount: 2, dur: 0.2 },
      { at: 1.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/cold' },
      { at: 1.8, actor: 'dad', do: 'tint', filter: 'sepia(.5) saturate(1.8) hue-rotate(170deg)' },
      { at: 1.8, actor: 'dad', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: 2.1, actor: 'dad', do: 'tint', filter: BLUE_MAN },
      { at: 2.15, actor: 'iceD', do: 'pop', dur: 0.25 },
      { at: 2.15, actor: 'iceD', do: 'squash', amount: 0.2, dur: 0.3 },
      // 在冰裡發抖
      { at: 2.6, actor: 'dad', do: 'shake', amount: 0.7, dur: 0.5 },
      { at: 3.3, actor: 'dad', do: 'shake', amount: 0.9, dur: 0.5 },
      // 媽媽和他對看
      { at: 2.5, actor: 'yang', do: 'flip' },
      { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 2.5, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 2.55, actor: 'mom', do: 'hop', amount: 2, dur: 0.2 },
      // 他走過去「叩叩」敲冰塊，冰裡的爸爸眼睛跟著轉過來
      { at: 3.0, actor: 'yang', do: 'flip' },
      { at: 3.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
      { at: 3.0, actor: 'yang', do: 'moveTo', to: { x: KNOCK_X, y: YG }, dur: 0.4 },
      { at: 3.0, actor: 'mom', do: 'swap', emoji: 'hero:three/giggle' },
      { at: 3.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 3.45, actor: 'yang', do: 'squash', amount: -0.12, dur: 0.15 },
      { at: 3.5, actor: 'iceD', do: 'shake', amount: 0.5, dur: 0.15 },
      { at: 3.7, actor: 'yang', do: 'squash', amount: -0.12, dur: 0.15 },
      { at: 3.75, actor: 'iceD', do: 'shake', amount: 0.5, dur: 0.15 },
      { at: 3.5, actor: 'mom', do: 'shake', amount: 0.6, dur: 0.4 },
      // 跑回去偷笑
      { at: 3.95, actor: 'yang', do: 'flip' },
      { at: 3.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 3.95, actor: 'yang', do: 'moveTo', to: { x: YANG1, y: YG }, dur: 0.35 },
      { at: 4.35, actor: 'yang', do: 'flip' },
      // 喀啦、喀啦……碎！
      { at: 4.3, actor: 'iceD', do: 'shake', amount: 1, dur: 0.3 },
      { at: 4.65, actor: 'iceD', do: 'shake', amount: 2, dur: 0.3 },
      { at: 5.0, actor: 'iceD', do: 'vanish', dur: 0.1 },
      { at: 5.0, actor: 'dad', do: 'tint', filter: '' },
      { at: 5.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/sneeze' },
      { at: 5.0, actor: 'dad', do: 'squash', amount: -0.2, dur: 0.2 },
      { at: 5.2, actor: 'dad', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: 5.2, actor: 'dad', do: 'moveTo', to: { x: DAD1 + 3, y: DG }, dur: 0.15, ease: 'out' },
      { at: 5.3, actor: 'ice1', do: 'vanish', dur: 0.1 },
      { at: 5.3, actor: 'ice2', do: 'vanish', dur: 0.1 },
      { at: 5.3, actor: 'red', do: 'swap', emoji: 'prop:top-red-spin' },
      { at: 5.3, actor: 'blue', do: 'swap', emoji: 'prop:top-blue-spin' },
      { at: 5.3, actor: 'red', do: 'tint', filter: SPIN },
      { at: 5.3, actor: 'blue', do: 'tint', filter: SPIN },
      ...whirl('red', 5.3, 6.8),
      ...whirl('blue', 5.3, 6.8),
      // 回到 W1
      { at: 5.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 5.5, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      { at: 5.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 5.8, actor: 'dad', do: 'moveTo', to: { x: DAD1, y: DG }, dur: 0.3 },
      { at: 5.85, actor: 'dad', do: 'hop', amount: 3, dur: 0.3 },
      { at: 6.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
      { at: 6.2, actor: 'mom', do: 'swap', emoji: 'hero:three/know' },
      { at: 6.3, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 6.25, actor: 'yang', do: 'tilt', amount: 8, dur: 0.45 },
    ],
    fx: [
      { at: 0.15, kind: 'burst', actor: 'red', emoji: '❄️', n: 6, dy: 4, dur: 0.6, scale: 0.8 },
      { at: 0.6, kind: 'burst', x: 79, y: 70, emoji: '❄️', n: 3, dur: 0.5, scale: 0.6 },
      { at: 0.78, kind: 'burst', x: 85, y: 70, emoji: '❄️', n: 3, dur: 0.5, scale: 0.6 },
      { at: 1.0, kind: 'burst', actor: 'blue', emoji: '❄️', n: 6, dy: 4, dur: 0.6, scale: 0.8 },
      { at: 1.2, kind: 'burst', x: 100, y: 73, emoji: '❄️', n: 3, dur: 0.5, scale: 0.7 },
      { at: 1.35, kind: 'burst', x: 110, y: 74, emoji: '❄️', n: 3, dur: 0.5, scale: 0.7 },
      { at: 1.5, kind: 'burst', x: 118, y: 74, emoji: '❄️', n: 4, dur: 0.5, scale: 0.8 },
      { at: 2.15, kind: 'burst', actor: 'dad', emoji: '❄️', n: 10, dy: 10, dur: 0.8 },
      { at: 2.6, kind: 'pop', actor: 'dad', emoji: '🥶', dx: -12, dur: 1.4, scale: 1.2 },
      { at: 2.55, kind: 'pop', actor: 'yang', emoji: '❓', dur: 0.5 },
      { at: 2.65, kind: 'pop', actor: 'mom', emoji: '❓', dur: 0.5 },
      { at: 3.6, kind: 'pop', actor: 'dad', emoji: '👀', dx: -4, dy: 6, dur: 0.6, scale: 0.9 },
      { at: 4.3, kind: 'burst', actor: 'iceD', emoji: '💥', n: 1, dx: 4, dy: 8, dur: 0.25, scale: 0.5 },
      { at: 4.65, kind: 'burst', actor: 'iceD', emoji: '💥', n: 1, dx: -4, dy: 14, dur: 0.25, scale: 0.7 },
      { at: 5.0, kind: 'burst', actor: 'dad', emoji: '🧊', n: 8, dy: 10, dur: 0.7, scale: 1.2 },
      { at: 5.2, kind: 'blow', actor: 'dad', dx: -8, dy: 10, to: { x: 84, y: 62 }, n: 4, dur: 0.5, scale: 1.2 },
      { at: 5.3, kind: 'burst', actor: 'red', emoji: '❄️', n: 5, dur: 0.5, scale: 0.7 },
      { at: 5.3, kind: 'burst', actor: 'blue', emoji: '❄️', n: 5, dur: 0.5, scale: 0.7 },
    ],
    camera: [START, release(0.2, 0.2), closeUp(0.2, 0.3, ARENA_VIEW, 1.6), holdWide(1.2, 0.4), { at: 2.15, dur: 0.3, do: 'shake', amount: 1.2 }, release(2.6), { at: 5.0, dur: 0.3, do: 'shake', amount: 1.4 }, holdWide(6.1, 0.5)],
    cues: [
      { at: 0.15, sfx: 'crack' },
      { at: 1.0, sfx: 'crack' },
      { at: 1.05, say: '冰陀螺！陀螺和爸爸都變冰了！' },
      { at: 2.15, sfx: 'crack' },
      { at: 3.45, sfx: 'tap' },
      { at: 3.7, sfx: 'tap' },
      { at: 4.3, sfx: 'crack' },
      { at: 4.65, sfx: 'crack' },
      { at: 5.2, sfx: 'achoo' },
    ],
  }),

  // 水陀螺！爸爸的臉都是水！——紅陀螺噴出水花，像灑水器一樣每轉一圈就往爸爸臉上噴一次，一次比一次大；
  // 爸爸被噴得眼鏡起霧、嘴巴鼓起來吐出一道小噴泉；最後像小狗一樣甩乾，回到 W1
  'power:水': scene({
    duration: 6.6,
    bg: BG,
    actors: [...room, ...w1People(), red(), blue()],
    moves: [
      ...flatten,
      ...sway(6.6),
      ...whirl('red', 0, 6.6),
      ...whirl('blue', 0, 6.6),
      { at: 0.15, actor: 'red', do: 'tint', filter: WATER },
      { at: 0.15, actor: 'red', do: 'hop', amount: 3, dur: 0.25 },
      // 噴三次：每次先轉向爸爸蓄一下
      ...[0.75, 1.85, 2.95].flatMap((at, i): Move[] => [
        { at, actor: 'red', do: 'squash', amount: -0.2 - i * 0.1, dur: 0.25 },
        { at: at + 0.25, actor: 'red', do: 'hop', amount: 2 + i, dur: 0.25 },
      ]),
      // 爸爸：第一下愣住，第二下皺臉往後退，第三下滿嘴都是水
      { at: 1.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 1.3, actor: 'dad', do: 'hop', amount: 2, dur: 0.2 },
      { at: 2.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/sour' },
      { at: 2.4, actor: 'dad', do: 'moveTo', to: { x: DAD1 + 4, y: DG }, dur: 0.2, ease: 'out' },
      { at: 2.4, actor: 'dad', do: 'shake', amount: 1, dur: 0.35 },
      { at: 3.5, actor: 'dad', do: 'swap', emoji: 'hero:eric/blow' },
      { at: 3.5, actor: 'dad', do: 'squash', amount: -0.15, dur: 0.35 },
      // 像小狗一樣甩乾
      { at: 4.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/tired' },
      { at: 4.65, actor: 'dad', do: 'shake', amount: 3, dur: 0.8 },
      { at: 4.65, actor: 'dad', do: 'tilt', amount: 8, dur: 0.4 },
      { at: 5.05, actor: 'dad', do: 'tilt', amount: -8, dur: 0.4 },
      { at: 5.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 5.6, actor: 'dad', do: 'moveTo', to: { x: DAD1, y: DG }, dur: 0.3 },
      { at: 5.65, actor: 'dad', do: 'hop', amount: 3, dur: 0.3 },
      { at: 5.8, actor: 'red', do: 'tint', filter: SPIN },
      // 他與媽媽偷笑
      { at: 1.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 1.5, actor: 'mom', do: 'swap', emoji: 'hero:three/giggle' },
      { at: 1.6, actor: 'yang', do: 'shake', amount: 0.6, dur: 0.4 },
      { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 2.55, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 2.7, actor: 'mom', do: 'shake', amount: 0.6, dur: 0.4 },
      { at: 3.7, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      { at: 3.75, actor: 'mom', do: 'squash', amount: 0.12, dur: 0.25 },
      { at: 3.8, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
      { at: 4.4, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      // 回到 W1
      { at: 6.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
      { at: 6.0, actor: 'mom', do: 'swap', emoji: 'hero:three/know' },
      { at: 6.1, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 6.1, actor: 'yang', do: 'tilt', amount: 8, dur: 0.45 },
    ],
    fx: [
      { at: 0.15, kind: 'burst', actor: 'red', emoji: '💦', n: 6, dy: 4, dur: 0.6, scale: 0.8 },
      { at: 0.2, kind: 'fountain', actor: 'red', emoji: '💧', dur: 0.6 },
      { at: 1.0, kind: 'blow', actor: 'red', to: DAD_FACE, emoji: '💦', n: 3, dur: 0.35, scale: 0.8 },
      { at: 1.3, kind: 'burst', actor: 'dad', emoji: '💦', n: 4, dx: -4, dy: 8, dur: 0.4, scale: 0.6 },
      { at: 2.1, kind: 'blow', actor: 'red', to: DAD_FACE, emoji: '💦', n: 5, dur: 0.35, scale: 1.1 },
      { at: 2.4, kind: 'burst', actor: 'dad', emoji: '💦', n: 6, dx: -4, dy: 8, dur: 0.5, scale: 0.9 },
      { at: 3.2, kind: 'blow', actor: 'red', to: DAD_FACE, emoji: '💦', n: 7, dur: 0.4, scale: 1.5 },
      { at: 3.5, kind: 'burst', actor: 'dad', emoji: '💦', n: 8, dx: -4, dy: 8, dur: 0.5, scale: 1.2 },
      { at: 3.6, kind: 'burst', actor: 'dad', emoji: '🌫️', n: 1, dx: -3, dy: 7, dur: 1.0, scale: 0.45 },
      { at: 3.85, kind: 'fountain', actor: 'dad', emoji: '💦', dx: -6, dy: 12, dur: 0.8 },
      { at: 4.65, kind: 'burst', actor: 'dad', emoji: '💦', n: 10, dy: 18, dur: 0.7, scale: 1.0 },
      { at: 1.5, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.8 },
    ],
    camera: [START, release(0.3), closeUp(2.8, 0.4, DAD_VIEW, 1.3), release(4.6), holdWide(5.9, 0.5)],
    cues: [
      { at: 0.15, sfx: 'splash' },
      { at: 1.0, sfx: 'splash' },
      { at: 1.1, say: '水陀螺！爸爸的臉都是水！' },
      { at: 2.1, sfx: 'splash' },
      { at: 3.2, sfx: 'splash' },
      { at: 3.85, sfx: 'bubble' },
      { at: 4.65, sfx: 'splash' },
    ],
  }),

  // 爸爸的陀螺不見了。爸爸哭了！——爸爸回頭找、走到對戰盤前彎腰看（紅陀螺對他得意地跳一下），找不到，哭成兩道噴泉；
  // 他笑到躺在地上滾來滾去，媽媽走過去拍拍爸爸。爸爸抽抽噎噎抬頭——藍陀螺這時才從天上掉下來，「咚」敲在他頭上，
  // 他眼冒金星坐在地上，藍陀螺彈到他腳邊躺著。結尾接第二幕 mom
  win: scene({
    duration: 6.9,
    bg: BG,
    // 媽媽畫在對戰盤後面：她從盤子後面繞過去，腳不會踩進盤子、也不會擋到紅陀螺
    actors: [
      ...behindArena([mom('happy')]),
      dad('surprised'),
      yang('laugh'),
      red(ARENA_X),
      { id: 'blue', emoji: 'prop:top-blue', x: WIN_DAD, y: -14, size: TOP_S, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      ...flatten,
      ...sway(6.9),
      ...whirl('red', 0, 6.9),
      // 回頭找
      { at: 0.2, actor: 'dad', do: 'flip' },
      { at: 0.6, actor: 'dad', do: 'flip' },
      { at: 0.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/listen' },
      { at: 0.85, actor: 'dad', do: 'moveTo', to: { x: 104, y: DG }, dur: 0.4 },
      { at: 1.3, actor: 'dad', do: 'tilt', amount: -6, dur: 0.4 },
      // 紅陀螺對他得意地跳一下
      { at: 1.35, actor: 'red', do: 'hop', amount: 4, dur: 0.3 },
      { at: 1.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 1.7, actor: 'dad', do: 'moveTo', to: { x: WIN_DAD, y: DG }, dur: 0.35, ease: 'out' },
      // 哭成兩道噴泉
      { at: 2.15, actor: 'dad', do: 'swap', emoji: 'hero:eric/cry' },
      { at: 2.2, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 2.8, actor: 'dad', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 3.5, actor: 'dad', do: 'shake', amount: 1, dur: 0.4 },
      { at: 4.2, actor: 'dad', do: 'shake', amount: 0.8, dur: 0.4 },
      // 他笑到躺在地上滾
      { at: 0.4, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.25 },
      { at: 2.3, actor: 'yang', do: 'rotateTo', amount: 90, dur: 0.25, pivot: 'center' },
      { at: 2.3, actor: 'yang', do: 'moveTo', to: { x: YANG1, y: YG + ROLL_DY }, dur: 0.25 },
      { at: 2.75, actor: 'yang', do: 'moveTo', to: { x: YANG1 - 10, y: YG + ROLL_DY }, dur: 0.6 },
      { at: 2.75, actor: 'yang', do: 'rotateTo', amount: -360, dur: 0.6, pivot: 'center' },
      { at: 3.5, actor: 'yang', do: 'moveTo', to: { x: YANG1, y: YG + ROLL_DY }, dur: 0.6 },
      { at: 3.5, actor: 'yang', do: 'rotateTo', amount: 360, dur: 0.6, pivot: 'center' },
      { at: 4.25, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 5.0, actor: 'yang', do: 'rotateTo', amount: -90, dur: 0.3, pivot: 'center' },
      { at: 5.0, actor: 'yang', do: 'moveTo', to: { x: YANG1, y: YG }, dur: 0.3 },
      // 媽媽走過去拍拍爸爸
      { at: 2.4, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 2.7, actor: 'mom', do: 'swap', emoji: 'hero:three/walk' },
      { at: 2.7, actor: 'mom', do: 'moveTo', to: { x: WIN_MOM, y: WIN_MOM_Y }, dur: 1.1 },
      { at: 3.85, actor: 'mom', do: 'swap', emoji: 'hero:three/reach' },
      { at: 4.0, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.2 },
      { at: 4.3, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.2 },
      { at: 4.6, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.2 },
      // 爸爸抬頭……咚！
      { at: 4.95, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 5.1, actor: 'blue', do: 'pop', dur: 0.05 },
      { at: 5.1, actor: 'blue', do: 'moveTo', to: { x: WIN_DAD, y: 38 }, dur: 0.35, ease: 'in' },
      { at: 5.1, actor: 'blue', do: 'spin', times: 2, dur: 0.35 },
      { at: 5.45, actor: 'dad', do: 'swap', emoji: 'hero:eric/dizzy' },
      { at: 5.45, actor: 'dad', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: 5.45, actor: 'blue', do: 'moveTo', to: WIN_BLUE, arc: 8, dur: 0.5 },
      { at: 5.45, actor: 'blue', do: 'rotateTo', amount: 90, dur: 0.5 },
      { at: 5.5, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 5.5, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.6, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 6.2, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 6.3, actor: 'mom', do: 'tilt', amount: 6, dur: 0.4 },
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'dad', emoji: '❓', dur: 0.5 },
      { at: 1.3, kind: 'pop', actor: 'dad', emoji: '❓', dur: 0.5 },
      { at: 2.2, kind: 'fountain', actor: 'dad', emoji: '💧', dx: -7, dy: 8, dur: 2.6 },
      { at: 2.2, kind: 'fountain', actor: 'dad', emoji: '💧', dx: 7, dy: 8, dur: 2.6 },
      { at: 2.5, kind: 'pop', actor: 'yang', emoji: '😂', dur: 1.2, scale: 1.3 },
      { at: 4.0, kind: 'burst', actor: 'mom', emoji: '💗', n: 4, dx: 8, dur: 0.6, scale: 0.7 },
      { at: 5.45, kind: 'burst', actor: 'dad', emoji: '💥', n: 1, dy: 2, dur: 0.35, scale: 0.9 },
      { at: 5.6, kind: 'dizzy', actor: 'dad', dur: 1.6 },
    ],
    camera: [START, release(0.3), { at: 5.45, dur: 0.3, do: 'shake', amount: 1.4 }, holdWide(6.1, 0.5)],
    cues: [
      { at: 0.9, say: '爸爸的陀螺不見了。爸爸哭了！' },
      { at: 1.35, sfx: 'boing' },
      { at: 2.2, sfx: 'splash' },
      { at: 4.0, sfx: 'tap' },
      { at: 4.3, sfx: 'tap' },
      { at: 4.6, sfx: 'tap' },
      { at: 5.1, sfx: 'whoosh' },
      { at: 5.45, sfx: 'bonk' },
      { at: 5.95, sfx: 'clink' },
    ],
  }),

  // ── 第二幕 ──────────────────────────────────────

  // 媽媽也要玩。媽媽的陀螺好大！——爸爸醒過來，抱著他的藍陀螺親一下收進口袋；媽媽舉手「我也要玩！」、捲袖子，跑出畫面；
  // 「咚、咚、咚、咚」推進來一顆比爸爸還高的綠色大陀螺，每推一下地板震一下、揚起灰塵，大家跟著彈起來；
  // 爸爸嚇得衝過去跟他抱在一起發抖。大陀螺開始轉，風把氣球吹得亂晃，爸爸躲到後面偷看，他指著大陀螺準備迎戰。結尾 W2
  mom: (() => {
    // 媽媽從右邊推進來：大陀螺每一下往左挪一段，落地震一下
    const stops = [158, 138, 120, BIG_X]
    const pushes = stops.flatMap((x, i): Move[] => {
      const at = +(1.5 + i * 0.45).toFixed(2)
      return [
        { at, actor: 'big', do: 'moveTo', to: { x, y: BIG_Y }, dur: 0.28, ease: 'out' },
        { at, actor: 'big', do: 'tilt', amount: -7, dur: 0.4 },
        { at, actor: 'mom', do: 'moveTo', to: { x: x + MOM_PUSH_DX, y: MG }, dur: 0.28, ease: 'out' },
        ...(['yang', 'red'] as const).map((actor): Move => ({ at: at + 0.28, actor, do: 'hop', amount: 1.5 + i, dur: 0.2 })),
      ]
    })
    const thuds = stops.map((_, i) => +(1.78 + i * 0.45).toFixed(2))
    return scene({
      duration: 6.4,
      bg: BG,
      actors: [
        ...behindArena([mom('surprised', WIN_MOM, { y: WIN_MOM_Y })]),
        { ...bigTop(), x: 192, hidden: true },
        dad('dizzy', WIN_DAD),
        yang('laugh'),
        red(ARENA_X),
        { id: 'blue', emoji: 'prop:top-blue', ...WIN_BLUE, size: TOP_S, float: true, pivot: 'center' },
      ],
      moves: [
        ...flatten,
        ...sway(6.4),
        ...whirl('red', 0, 6.4),
        // 爸爸醒過來，抱著藍陀螺親一下，收進口袋
        { at: 0.1, actor: 'dad', do: 'shake', amount: 1.2, dur: 0.35 },
        { at: 0.45, actor: 'dad', do: 'swap', emoji: 'hero:eric/hug' },
        { at: 0.45, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
        { at: 0.45, actor: 'blue', do: 'rotateTo', amount: -90, dur: 0.2 },
        { at: 0.45, actor: 'blue', do: 'moveTo', to: { x: WIN_DAD - 3, y: 67 }, dur: 0.2 },
        { at: 0.75, actor: 'blue', do: 'shake', amount: 0.6, dur: 0.25 },
        { at: 1.1, actor: 'blue', do: 'vanish', dur: 0.15 },
        { at: 1.25, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
        // 媽媽：我也要玩！捲起袖子，跑出去
        { at: 0.3, actor: 'mom', do: 'swap', emoji: 'hero:three/know' },
        { at: 0.3, actor: 'mom', do: 'hop', amount: 5, dur: 0.3 },
        { at: 0.75, actor: 'mom', do: 'squash', amount: 0.12, dur: 0.15 },
        { at: 0.95, actor: 'mom', do: 'squash', amount: 0.12, dur: 0.15 },
        { at: 1.1, actor: 'mom', do: 'swap', emoji: 'hero:three/dash' },
        { at: 1.1, actor: 'mom', do: 'moveTo', to: { x: 186, y: MG }, dur: 0.35, ease: 'in', anticipate: 3 },
        { at: 1.45, actor: 'mom', do: 'flip' },
        { at: 1.45, actor: 'mom', do: 'swap', emoji: 'hero:three/push' },
        // 咚、咚、咚、咚：推進來
        { at: 1.45, actor: 'big', do: 'pop', dur: 0.01 },
        ...pushes,
        // 紅陀螺躲到盤子左邊
        { at: 1.0, actor: 'red', do: 'moveTo', to: { x: RED2, y: TOP_Y }, dur: 0.4 },
        // 他和爸爸嚇得抱在一起
        { at: 1.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
        { at: 1.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 2.25, actor: 'dad', do: 'flip' },
        { at: 2.25, actor: 'dad', do: 'swap', emoji: 'hero:eric/flee' },
        { at: 2.3, actor: 'dad', do: 'moveTo', to: { x: HUG_DAD, y: DG }, dur: 0.5, ease: 'in' },
        { at: 2.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/scared' },
        { at: 2.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
        { at: 2.85, actor: 'dad', do: 'shake', amount: 1, dur: 0.5 },
        { at: 2.85, actor: 'yang', do: 'shake', amount: 1, dur: 0.5 },
        { at: 3.45, actor: 'dad', do: 'shake', amount: 1.4, dur: 0.5 },
        { at: 3.45, actor: 'yang', do: 'shake', amount: 1.4, dur: 0.5 },
        // 媽媽得意地拍一拍，大陀螺開始轉
        { at: 3.3, actor: 'mom', do: 'swap', emoji: 'hero:three/smug' },
        { at: 3.35, actor: 'mom', do: 'moveTo', to: { x: MOM2, y: MG }, dur: 0.3 },
        { at: 3.7, actor: 'mom', do: 'hop', amount: 3, dur: 0.25 },
        { at: 3.8, actor: 'big', do: 'swap', emoji: 'prop:top-green-spin' },
        { at: 3.8, actor: 'big', do: 'tint', filter: SPIN },
        { at: 3.8, actor: 'big', do: 'squash', amount: -0.15, dur: 0.3 },
        ...whirl('big', 3.8, 6.4, 0.12, 4),
        // 風把氣球吹得亂晃，他們往後仰
        ...BALLOON_IDS.flatMap((actor, i): Move[] => [
          { at: +(3.9 + i * 0.05).toFixed(2), actor, do: 'tilt', amount: 28, dur: 0.6 },
          { at: +(4.5 + i * 0.05).toFixed(2), actor, do: 'tilt', amount: 22, dur: 0.6 },
          { at: +(5.1 + i * 0.05).toFixed(2), actor, do: 'tilt', amount: 14, dur: 0.6 },
        ]),
        { at: 4.0, actor: 'yang', do: 'tilt', amount: -8, dur: 0.6 },
        { at: 4.0, actor: 'dad', do: 'tilt', amount: -8, dur: 0.6 },
        { at: 4.0, actor: 'red', do: 'shake', amount: 0.8, dur: 0.6 },
        // 爸爸躲到後面偷看，他指著大陀螺
        { at: 4.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/peek' },
        { at: 4.7, actor: 'dad', do: 'moveTo', to: { x: DAD2, y: DG }, dur: 0.35 },
        { at: 4.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
        { at: 4.9, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
        { at: 5.3, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.3 },
        { at: 5.6, actor: 'dad', do: 'hop', amount: 1.5, dur: 0.25 },
        { at: 5.8, actor: 'yang', do: 'squash', amount: 0.1, dur: 0.3 },
      ],
      fx: [
        { at: 0.2, kind: 'dizzy', actor: 'dad', dur: 0.4 },
        { at: 0.6, kind: 'burst', actor: 'blue', emoji: '💗', n: 4, dur: 0.5, scale: 0.6 },
        { at: 1.1, kind: 'burst', actor: 'blue', emoji: '✨', n: 5, dur: 0.4, scale: 0.6 },
        { at: 0.75, kind: 'pop', actor: 'mom', emoji: '💪', dx: 10, dur: 0.6 },
        ...thuds.map((at, i): Fx => ({ at, kind: 'puff', x: stops[i] - 8, y: 72, dur: 0.45, scale: 1 + i * 0.25 })),
        { at: 2.0, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
        { at: 2.35, kind: 'pop', actor: 'dad', emoji: '😱', dx: 4, dur: 0.8 },
        { at: 2.9, kind: 'sweat', actor: 'dad' },
        { at: 3.8, kind: 'burst', actor: 'big', emoji: '✨', n: 8, dur: 0.6 },
        { at: 3.95, kind: 'blow', actor: 'big', dx: -16, dy: 18, to: { x: 30, y: 30 }, n: 4, dur: 0.7, scale: 1.5 },
        { at: 4.6, kind: 'blow', actor: 'big', dx: -16, dy: 18, to: { x: 26, y: 46 }, n: 4, dur: 0.7, scale: 1.3 },
        { at: 3.75, kind: 'pop', actor: 'mom', emoji: '😎', dx: 8, dur: 1.0 },
      ],
      camera: [START, ...thuds.map((at, i): Camera => ({ at, dur: 0.25, do: 'shake', amount: 0.6 + i * 0.35 }))],
      cues: [
        { at: 0.3, sfx: 'blip' },
        { at: 0.5, say: '媽媽也要玩。媽媽的陀螺好大！' },
        ...thuds.map((at): Cue => ({ at, sfx: 'bonk' })),
        { at: 3.8, sfx: 'whoosh' },
        { at: 4.6, sfx: 'whoosh' },
      ],
    })
  })(),

  // 跳到大陀螺的頭上了！大陀螺好怕！——紅陀螺蹲一下、高高跳起，落在大陀螺的頂上，像電鑽一樣在上面轉（火花亂噴）；
  // 大陀螺冒汗、越晃越厲害；他跳起來歡呼，媽媽嚇到，爸爸躲著偷笑。結尾接 sky
  'fight:跳': scene({
    duration: 5.6,
    bg: BG,
    actors: w2(),
    moves: [
      ...flatten,
      ...sway(5.6),
      ...whirl('red', 0, 5.6),
      ...whirl('big', 0, 5.6, 0.12, 4),
      // 蹲一下，跳！
      { at: 0.1, actor: 'red', do: 'squash', amount: 0.35, dur: 0.3 },
      { at: 0.4, actor: 'red', do: 'moveTo', to: ON_BIG, arc: 26, dur: 0.65 },
      { at: 1.05, actor: 'red', do: 'squash', amount: 0.35, dur: 0.2 },
      { at: 1.05, actor: 'big', do: 'squash', amount: 0.12, dur: 0.25 },
      // 電鑽：一直抖、火花亂噴；大陀螺越晃越厲害
      ...[1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4, 3.7, 4.0, 4.3, 4.6, 4.9, 5.2].map((at): Move => ({ at, actor: 'red', do: 'shake', amount: 0.8, dur: 0.25 })),
      { at: 1.6, actor: 'big', do: 'shake', amount: 0.6, dur: 0.5 },
      { at: 2.4, actor: 'big', do: 'shake', amount: 1.0, dur: 0.5 },
      { at: 3.2, actor: 'big', do: 'shake', amount: 1.6, dur: 0.5 },
      { at: 4.0, actor: 'big', do: 'shake', amount: 2.2, dur: 0.6 },
      { at: 4.7, actor: 'big', do: 'shake', amount: 2.6, dur: 0.7 },
      // 他歡呼，媽媽嚇到，爸爸偷笑
      { at: 1.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 1.15, actor: 'yang', do: 'hop', amount: 8, dur: 0.4 },
      { at: 2.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
      { at: 2.05, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 3.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 3.35, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 4.4, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 1.2, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 1.2, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.8, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
      { at: 2.85, actor: 'mom', do: 'shake', amount: 1, dur: 0.5 },
      { at: 4.2, actor: 'mom', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 1.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/giggle' },
      { at: 2.6, actor: 'dad', do: 'shake', amount: 0.6, dur: 0.4 },
      { at: 3.9, actor: 'dad', do: 'shake', amount: 0.6, dur: 0.4 },
    ],
    fx: [
      { at: 0.45, kind: 'puff', x: RED2, y: 70, dur: 0.4 },
      { at: 1.05, kind: 'burst', actor: 'red', emoji: '💥', n: 1, dy: 8, dur: 0.3, scale: 0.6 },
      ...[1.4, 1.9, 2.4, 2.9, 3.4, 3.9, 4.4, 4.9].map((at, i): Fx => ({ at, kind: 'burst', x: ON_BIG.x, y: ON_BIG.y + 6, emoji: i % 2 ? '⚡' : '✨', n: 5, dur: 0.45, scale: 0.7 + i * 0.04 })),
      { at: 2.3, kind: 'sweat', actor: 'big', dx: -14, dy: 14 },
      { at: 3.1, kind: 'burst', x: BIG_X - 18, y: 40, emoji: '💦', n: 3, dur: 0.6, scale: 0.8 },
      { at: 3.0, kind: 'burst', x: BIG_X + 2, y: 52, emoji: '😰', n: 1, dur: 1.5, scale: 1.6 },
      { at: 4.0, kind: 'burst', x: BIG_X + 18, y: 38, emoji: '💦', n: 4, dur: 0.6, scale: 1.0 },
      { at: 1.3, kind: 'pop', actor: 'yang', emoji: '😆', dur: 0.8 },
    ],
    camera: [START, closeUp(0.9, 0.5, JUMP_VIEW, 1.3), holdWide(4.5, 0.6)],
    cues: [
      { at: 0.4, sfx: 'boing' },
      { at: 1.05, sfx: 'clink' },
      { at: 1.2, say: '跳到大陀螺的頭上了！大陀螺好怕！' },
      { at: 1.4, sfx: 'rumble' },
      { at: 2.9, sfx: 'rumble' },
      { at: 4.4, sfx: 'rumble' },
    ],
  }),

  // 打不過！大陀螺太大了！——紅陀螺衝過去「咚」彈回來，大陀螺動都不動（還得意地哼一聲）；
  // 第二次退後蓄力撞更大力，被彈到他腳邊，他跳起來閃開；第三次著急發紅衝過去，被彈得滿屋子亂飛：
  // 撞牆、撞天花板、再「咚」撞到躲著的爸爸額頭（腫一個包），最後暈頭轉向地轉回原位；包消掉，回到 W2
  'fight:打': scene({
    duration: 6.4,
    bg: BG,
    actors: [...w2(), { id: 'bump', emoji: 'prop:bump', x: BUMP.x, y: BUMP.y, size: 7, hidden: true, float: true }],
    moves: [
      ...flatten,
      ...sway(6.4),
      ...whirl('red', 0, 6.4),
      ...whirl('big', 0, 6.4, 0.12, 4),
      // 第一次：咚，彈回來
      { at: 0.2, actor: 'red', do: 'moveTo', to: { x: HIT_X, y: TOP_Y }, dur: 0.25, ease: 'in' },
      { at: 0.45, actor: 'red', do: 'moveTo', to: { x: RED2, y: TOP_Y }, dur: 0.35, ease: 'out' },
      { at: 0.45, actor: 'big', do: 'shake', amount: 0.3, dur: 0.2 },
      // 第二次：退後蓄力，彈到他腳邊，他跳起來閃
      { at: 1.15, actor: 'red', do: 'moveTo', to: { x: HIT_X, y: TOP_Y }, dur: 0.22, ease: 'in', anticipate: 5 },
      { at: 1.37, actor: 'red', do: 'moveTo', to: { x: YANG1 + 2, y: TOP_FLOOR }, arc: 10, dur: 0.45, ease: 'out' },
      { at: 1.37, actor: 'big', do: 'shake', amount: 0.5, dur: 0.25 },
      { at: 1.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 1.6, actor: 'yang', do: 'hop', amount: 9, dur: 0.4 },
      { at: 1.85, actor: 'red', do: 'moveTo', to: { x: RED2, y: TOP_Y }, arc: 4, dur: 0.45 },
      { at: 2.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      // 第三次：氣到發紅，衝過去……被彈得滿屋子亂飛
      { at: 2.45, actor: 'red', do: 'tint', filter: ANGRY },
      { at: 2.45, actor: 'red', do: 'moveTo', to: { x: RED2 - 8, y: TOP_Y }, dur: 0.3, ease: 'out' },
      { at: 2.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/stomp' },
      { at: 2.5, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 2.8, actor: 'red', do: 'moveTo', to: { x: HIT_X, y: TOP_Y }, dur: 0.18, ease: 'in' },
      { at: 2.98, actor: 'big', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 2.98, actor: 'red', do: 'moveTo', to: { x: 128, y: 14 }, dur: 0.25, ease: 'linear' },
      { at: 3.23, actor: 'red', do: 'moveTo', to: { x: 60, y: 8 }, dur: 0.25, ease: 'linear' },
      { at: 3.48, actor: 'red', do: 'moveTo', to: { x: 6, y: 34 }, dur: 0.22, ease: 'linear' },
      { at: 3.7, actor: 'red', do: 'moveTo', to: DAD_FOREHEAD, dur: 0.2, ease: 'linear' },
      { at: 3.9, actor: 'red', do: 'moveTo', to: { x: RED2, y: TOP_Y }, arc: 10, dur: 0.6 },
      { at: 2.98, actor: 'red', do: 'spin', times: 3, dur: 0.92 },
      // 爸爸額頭腫一個包
      { at: 3.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/fall' },
      { at: 3.9, actor: 'bump', do: 'pop', dur: 0.25 },
      { at: 4.2, actor: 'bump', do: 'scaleTo', amount: 1.4, dur: 0.3, ease: 'back' },
      // 紅陀螺暈頭轉向地轉回原位
      { at: 4.5, actor: 'red', do: 'tint', filter: SPIN },
      { at: 4.6, actor: 'red', do: 'tilt', amount: 18, dur: 0.5 },
      { at: 5.1, actor: 'red', do: 'tilt', amount: -18, dur: 0.5 },
      // 他與媽媽
      { at: 3.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 4.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 4.05, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 0.55, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.25 },
      { at: 1.5, actor: 'mom', do: 'swap', emoji: 'hero:three/giggle' },
      { at: 3.1, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 4.0, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      // 包消掉，回到 W2
      { at: 5.4, actor: 'bump', do: 'vanish', dur: 0.35 },
      { at: 5.45, actor: 'dad', do: 'swap', emoji: 'hero:eric/peek' },
      { at: 5.5, actor: 'dad', do: 'shake', amount: 0.6, dur: 0.3 },
      { at: 5.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
      { at: 5.85, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 5.8, actor: 'mom', do: 'swap', emoji: 'hero:three/smug' },
      { at: 6.2, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.3 },
    ],
    fx: [
      { at: 0.45, kind: 'burst', x: HIT_X + 4, y: 60, emoji: '💥', n: 1, dur: 0.3, scale: 0.5 },
      { at: 0.6, kind: 'burst', x: BIG_X + 4, y: 36, emoji: '😏', n: 1, dur: 0.8, scale: 1.3 },
      { at: 1.37, kind: 'burst', x: HIT_X + 4, y: 60, emoji: '💥', n: 1, dur: 0.35, scale: 0.9 },
      { at: 2.45, kind: 'burst', actor: 'red', emoji: '💢', n: 1, dy: 2, dur: 0.5, scale: 0.8 },
      { at: 2.98, kind: 'burst', x: HIT_X + 4, y: 60, emoji: '💥', n: 1, dur: 0.4, scale: 1.4 },
      { at: 3.23, kind: 'burst', x: 128, y: 12, emoji: '💥', n: 1, dur: 0.25, scale: 0.6 },
      { at: 3.48, kind: 'burst', x: 60, y: 6, emoji: '💥', n: 1, dur: 0.25, scale: 0.6 },
      { at: 3.7, kind: 'burst', x: 5, y: 34, emoji: '💥', n: 1, dur: 0.25, scale: 0.6 },
      { at: 3.9, kind: 'burst', x: DAD_FOREHEAD.x, y: DAD_FOREHEAD.y, emoji: '💥', n: 1, dur: 0.35, scale: 1.0 },
      { at: 4.0, kind: 'dizzy', actor: 'dad', dur: 1.4 },
      { at: 4.5, kind: 'dizzy', actor: 'red', dur: 1.2 },
      { at: 4.1, kind: 'pop', actor: 'yang', emoji: '😂', dur: 1.0 },
    ],
    camera: [START, { at: 0.45, dur: 0.2, do: 'shake', amount: 0.5 }, { at: 1.37, dur: 0.25, do: 'shake', amount: 0.9 }, { at: 2.98, dur: 0.3, do: 'shake', amount: 1.5 }, { at: 3.9, dur: 0.3, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 0.45, sfx: 'boing' },
      { at: 1.37, sfx: 'boing' },
      { at: 1.6, say: '打不過！大陀螺太大了！' },
      { at: 2.98, sfx: 'bonk' },
      { at: 3.23, sfx: 'tap' },
      { at: 3.48, sfx: 'tap' },
      { at: 3.7, sfx: 'tap' },
      { at: 3.9, sfx: 'bonk' },
      { at: 5.4, sfx: 'deflate' },
    ],
  }),

  // 陀螺親大陀螺。大陀螺臉紅了！——紅陀螺害羞地扭過去，「啾」親一下（唇印），扭回來；停一拍——大陀螺整顆變紅、
  // 冒愛心、陶醉地歪來歪去，反過來追著要親回去；小陀螺嚇得繞著他的腳逃，大陀螺追到盤子邊被媽媽拉住，退紅，回到 W2
  'fight:親': scene({
    duration: 6.4,
    bg: BG,
    actors: [...w2(), { id: 'kiss', emoji: 'prop:kiss-mark', ...KISS, size: 9, hidden: true, float: true }],
    moves: [
      ...flatten,
      ...sway(6.4),
      ...whirl('red', 0, 6.4),
      ...whirl('big', 0, 6.4, 0.12, 4),
      // 害羞地扭過去
      { at: 0.1, actor: 'red', do: 'tint', filter: SHY },
      ...[0.3, 0.6, 0.9].map((at, i): Move => ({ at, actor: 'red', do: 'moveTo', to: { x: RED2 + (i + 1) * 5.5, y: TOP_Y - (i % 2 ? 1 : 0) }, dur: 0.3 })),
      { at: 0.3, actor: 'red', do: 'tilt', amount: 12, dur: 0.3 },
      { at: 0.6, actor: 'red', do: 'tilt', amount: -12, dur: 0.3 },
      { at: 0.9, actor: 'red', do: 'tilt', amount: 12, dur: 0.3 },
      // 啾！
      { at: 1.25, actor: 'red', do: 'moveTo', to: { x: HIT_X, y: TOP_Y - 2 }, dur: 0.15, ease: 'in' },
      { at: 1.4, actor: 'kiss', do: 'pop', dur: 0.25 },
      { at: 1.45, actor: 'red', do: 'moveTo', to: { x: RED2 + 6, y: TOP_Y }, dur: 0.4, ease: 'out' },
      { at: 1.5, actor: 'red', do: 'hop', amount: 4, dur: 0.35 },
      // 停一拍……整顆變紅
      { at: 2.35, actor: 'big', do: 'tint', filter: BLUSH },
      { at: 2.35, actor: 'big', do: 'squash', amount: -0.15, dur: 0.35 },
      { at: 2.8, actor: 'big', do: 'tilt', amount: 12, dur: 0.6 },
      { at: 3.4, actor: 'big', do: 'tilt', amount: -12, dur: 0.6 },
      // 反過來追著要親
      { at: 3.9, actor: 'big', do: 'moveTo', to: { x: BIG_X - 12, y: BIG_Y }, dur: 0.35, ease: 'back' },
      { at: 3.9, actor: 'kiss', do: 'moveTo', to: { x: KISS.x - 12, y: KISS.y }, dur: 0.35, ease: 'back' },
      { at: 3.9, actor: 'big', do: 'tilt', amount: -14, dur: 0.5 },
      { at: 3.95, actor: 'red', do: 'moveTo', to: { x: YANG1 + 9, y: TOP_FLOOR + 1 }, dur: 0.3, ease: 'in' },
      { at: 4.25, actor: 'red', do: 'moveTo', to: { x: YANG1 - 9, y: TOP_FLOOR + 1 }, dur: 0.25 },
      { at: 4.5, actor: 'red', do: 'moveTo', to: { x: YANG1 + 9, y: TOP_FLOOR + 1 }, dur: 0.25 },
      { at: 4.75, actor: 'red', do: 'moveTo', to: { x: YANG1 - 9, y: TOP_FLOOR + 1 }, dur: 0.25 },
      { at: 4.3, actor: 'big', do: 'moveTo', to: { x: BIG_X - 18, y: BIG_Y }, dur: 0.35, ease: 'back' },
      { at: 4.3, actor: 'kiss', do: 'moveTo', to: { x: KISS.x - 18, y: KISS.y }, dur: 0.35, ease: 'back' },
      { at: 4.3, actor: 'big', do: 'tilt', amount: -14, dur: 0.5 },
      // 被媽媽拉住、退紅，回去
      { at: 4.6, actor: 'mom', do: 'swap', emoji: 'hero:three/pull' },
      { at: 4.6, actor: 'mom', do: 'moveTo', to: { x: BIG_X - 18 + MOM_PUSH_DX, y: MG }, dur: 0.25 },
      { at: 5.0, actor: 'big', do: 'moveTo', to: { x: BIG_X, y: BIG_Y }, dur: 0.45, ease: 'out' },
      { at: 5.0, actor: 'kiss', do: 'vanish', dur: 0.3 },
      { at: 5.0, actor: 'mom', do: 'moveTo', to: { x: MOM2, y: MG }, dur: 0.45, ease: 'out' },
      { at: 5.15, actor: 'big', do: 'tint', filter: SPIN },
      { at: 5.0, actor: 'red', do: 'moveTo', to: { x: RED2, y: TOP_Y }, arc: 5, dur: 0.45 },
      { at: 5.0, actor: 'red', do: 'tint', filter: SPIN },
      // 他與爸爸媽媽
      { at: 1.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 1.5, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 1.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/giggle' },
      { at: 2.5, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      { at: 2.6, actor: 'yang', do: 'shake', amount: 0.6, dur: 0.4 },
      { at: 3.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 4.0, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
      { at: 4.45, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
      { at: 5.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
      { at: 5.55, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 5.5, actor: 'mom', do: 'swap', emoji: 'hero:three/smug' },
      { at: 5.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/peek' },
      { at: 6.1, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.3 },
      { at: 6.3, actor: 'red', do: 'hop', amount: 2, dur: 0.25 },
    ],
    fx: [
      { at: 0.15, kind: 'burst', actor: 'red', emoji: '💗', n: 3, dur: 0.6, scale: 0.6 },
      { at: 1.4, kind: 'burst', x: KISS.x, y: KISS.y, emoji: '💋', n: 1, dur: 0.6, scale: 1.0 },
      { at: 2.35, kind: 'burst', x: BIG_X, y: 34, emoji: '💗', n: 8, dur: 1.0, scale: 1.3 },
      { at: 2.6, kind: 'burst', x: BIG_X + 2, y: 50, emoji: '😍', n: 1, dur: 1.2, scale: 1.6 },
      { at: 3.2, kind: 'burst', x: BIG_X, y: 30, emoji: '💕', n: 6, dur: 0.9, scale: 1.1 },
      { at: 4.0, kind: 'pop', actor: 'yang', emoji: '😱', dx: -8, dur: 0.6 },
      { at: 5.1, kind: 'burst', x: BIG_X - 10, y: 40, emoji: '💨', n: 1, dur: 0.5, scale: 1.2 },
    ],
    camera: [START, closeUp(1.0, 0.4, KISS_VIEW, 1.3), holdWide(3.7, 0.4)],
    cues: [
      { at: 1.4, sfx: 'blip' },
      { at: 1.45, say: '陀螺親大陀螺。大陀螺臉紅了！' },
      { at: 2.35, sfx: 'boing' },
      { at: 3.9, sfx: 'whoosh' },
      { at: 4.3, sfx: 'whoosh' },
      { at: 5.0, sfx: 'deflate' },
    ],
  }),

  // 大陀螺飛上天，到蛋糕上了！——大陀螺被鑽得受不了，蹲一下「咻」地衝出畫面上方，把對戰盤也掀飛了；紅陀螺掉下來被他接住。
  // 媽媽趕快把放蛋糕的桌子拉到中間（想保護蛋糕），爸爸也跑出來；三個人抬頭看，安靜半拍……影子罩住蛋糕——
  // 「啪」！大陀螺落在蛋糕上繼續轉，奶油亂甩。結尾 W3
  sky: scene({
    duration: 6.0,
    bg: BG,
    actors: [
      ...balloons, table, cake,
      mom('scared', MOM2, { flip: false }),
      arena,
      { id: 'shadow', emoji: '⚫', x: CAKE3.x, y: CAKE3.y - 4, size: 9, hidden: true, float: true, tint: 'opacity(.35) blur(0.6px)' },
      bigSpin(),
      dad('giggle', DAD2, { flip: true }),
      yang('laugh'),
      red(ON_BIG.x, ON_BIG.y),
    ],
    moves: [
      ...flatten,
      ...sway(6.0),
      ...whirl('big', 0, 6.0, 0.12, 4),
      ...whirl('red', 0, 0.6),
      // 受不了了：抖、蹲一下，咻！
      { at: 0.05, actor: 'big', do: 'shake', amount: 2.6, dur: 0.4 },
      { at: 0.05, actor: 'red', do: 'shake', amount: 2.6, dur: 0.4 },
      { at: 0.4, actor: 'big', do: 'squash', amount: 0.25, dur: 0.15 },
      { at: 0.55, actor: 'big', do: 'moveTo', to: { x: BIG_X, y: -60 }, dur: 0.4, ease: 'in' },
      { at: 0.55, actor: 'big', do: 'scaleTo', amount: BIG_CAKE_K, dur: 0.4 },
      // 對戰盤被掀飛
      { at: 0.6, actor: 'arena', do: 'moveTo', to: { x: -40, y: 40 }, arc: 16, dur: 0.6, ease: 'out' },
      { at: 0.6, actor: 'arena', do: 'rotateTo', amount: -220, dur: 0.6 },
      { at: 1.2, actor: 'arena', do: 'vanish', dur: 0.05 },
      // 紅陀螺掉下來，他接住抱著
      { at: 0.6, actor: 'red', do: 'swap', emoji: 'prop:top-red' },
      { at: 0.6, actor: 'red', do: 'tint', filter: '' },
      { at: 0.6, actor: 'red', do: 'moveTo', to: { x: YANG3 + 1, y: RED3_Y }, arc: 12, dur: 0.6 },
      { at: 0.6, actor: 'red', do: 'spin', times: -2, dur: 0.6 },
      { at: 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.65, actor: 'yang', do: 'moveTo', to: { x: YANG3, y: YG }, dur: 0.5 },
      { at: 1.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
      { at: 1.2, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.2 },
      // 媽媽把桌子拉到中間，爸爸跑出來
      { at: 0.65, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 0.95, actor: 'mom', do: 'flip' },
      { at: 0.95, actor: 'mom', do: 'swap', emoji: 'hero:three/pull' },
      { at: 1.0, actor: 'mom', do: 'moveTo', to: { x: CAKE3.x - 22, y: MG }, dur: 0.9 },
      // 拉到前面來：桌子、蛋糕跟著變大（W3 的蛋糕要大到看得清楚）
      { at: 1.0, actor: 'table', do: 'moveTo', to: { x: CAKE3.x, y: table.y }, dur: 0.9 },
      { at: 1.0, actor: 'table', do: 'scaleTo', amount: CAKE_K, dur: 0.9 },
      { at: 1.0, actor: 'cake', do: 'moveTo', to: CAKE3, dur: 0.9 },
      { at: 1.0, actor: 'cake', do: 'scaleTo', amount: CAKE_K, dur: 0.9 },
      { at: 1.9, actor: 'cake', do: 'hop', amount: 1.5, dur: 0.2 },
      { at: 1.95, actor: 'mom', do: 'moveTo', to: { x: MOM3, y: MG }, dur: 0.3 },
      { at: 0.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 1.2, actor: 'dad', do: 'moveTo', to: { x: DAD3, y: DG }, dur: 0.6 },
      // 三個人抬頭看……安靜半拍
      { at: 2.0, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 2.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 2.0, actor: 'yang', do: 'tilt', amount: -6, dur: 0.6 },
      { at: 2.1, actor: 'dad', do: 'tilt', amount: -6, dur: 0.6 },
      { at: 2.2, actor: 'mom', do: 'tilt', amount: 6, dur: 0.6 },
      // 影子罩住蛋糕
      { at: 2.6, actor: 'shadow', do: 'pop', dur: 0.2 },
      { at: 2.6, actor: 'shadow', do: 'stretchTo', amount: 2.2, dur: 0.01 },
      { at: 2.65, actor: 'shadow', do: 'scaleTo', amount: 2.2, dur: 0.5, ease: 'in' },
      // 啪！
      { at: 2.9, actor: 'big', do: 'moveTo', to: { x: CAKE3.x, y: -40 }, dur: 0.01 },
      { at: 2.92, actor: 'big', do: 'moveTo', to: { x: CAKE3.x, y: BIG_CAKE_Y }, dur: 0.25, ease: 'in' },
      { at: 3.17, actor: 'shadow', do: 'vanish', dur: 0.05 },
      { at: 3.17, actor: 'cake', do: 'squash', amount: 0.35, dur: 0.3 },
      { at: 3.17, actor: 'table', do: 'squash', amount: 0.12, dur: 0.25 },
      { at: 3.17, actor: 'big', do: 'squash', amount: 0.2, dur: 0.25 },
      // 嚇得縮成一排
      { at: 3.2, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
      { at: 3.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/scared' },
      { at: 3.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
      { at: 3.2, actor: 'mom', do: 'hop', amount: 6, dur: 0.3 },
      { at: 3.25, actor: 'dad', do: 'hop', amount: 6, dur: 0.3 },
      { at: 3.3, actor: 'yang', do: 'hop', amount: 6, dur: 0.3 },
      { at: 3.3, actor: 'red', do: 'hop', amount: 6, dur: 0.3 },
      ...['mom', 'dad', 'yang', 'red'].flatMap((actor, i): Move[] => [
        { at: +(3.8 + i * 0.05).toFixed(2), actor, do: 'shake', amount: 0.9, dur: 0.5 },
        { at: +(4.7 + i * 0.05).toFixed(2), actor, do: 'shake', amount: 0.9, dur: 0.5 },
      ]),
      ...[3.6, 4.2, 4.8, 5.4].map((at, i): Move => ({ at, actor: 'big', do: 'tilt', amount: i % 2 ? 6 : -6, dur: 0.5 })),
    ],
    fx: [
      { at: 0.55, kind: 'puff', x: BIG_X, y: 72, dur: 0.5, scale: 1.6 },
      { at: 0.55, kind: 'burst', x: BIG_X, y: 60, emoji: '💨', n: 6, dur: 0.6, scale: 1.4 },
      { at: 0.9, kind: 'pop', actor: 'dad', emoji: '❗', dur: 0.5 },
      { at: 2.15, kind: 'pop', actor: 'yang', emoji: '❓', dur: 0.6 },
      { at: 2.3, kind: 'pop', actor: 'dad', emoji: '❓', dur: 0.6 },
      { at: 2.45, kind: 'pop', actor: 'mom', emoji: '❓', dur: 0.6 },
      { at: 3.17, kind: 'burst', x: CAKE3.x, y: CAKE3.y - 6, emoji: 'prop:cream-splat', n: 7, dur: 0.8, scale: 1.3 },
      ...[3.8, 4.4, 5.0, 5.6].map((at, i): Fx => ({ at, kind: 'burst', x: CAKE3.x + (i % 2 ? 4 : -4), y: CAKE3.y - 8, emoji: 'prop:cream-splat', n: 5, dur: 0.6, scale: 1.3 })),
      { at: 3.4, kind: 'pop', actor: 'mom', emoji: '😱', dx: -8, dur: 0.8 },
      { at: 3.6, kind: 'sweat', actor: 'dad' },
    ],
    camera: [START, { at: 0.55, dur: 0.3, do: 'shake', amount: 1.2 }, { at: 3.17, dur: 0.35, do: 'shake', amount: 1.8 }, closeUp(3.7, 0.6, W3_VIEW, W3_Z)],
    cues: [
      { at: 0.55, sfx: 'whoosh' },
      { at: 0.6, sfx: 'whoosh' },
      { at: 1.2, sfx: 'plop' },
      { at: 1.5, say: '大陀螺飛上天，到蛋糕上了！' },
      { at: 3.17, sfx: 'bonk' },
      { at: 3.2, sfx: 'splash' },
      { at: 4.4, sfx: 'splash' },
      { at: 5.6, sfx: 'splash' },
    ],
  }),

  // ── 第三幕 ──────────────────────────────────────

  // 爸爸看不見了！——大陀螺一甩，一坨奶油「啪」糊在爸爸的眼鏡上；他伸著手往前亂走，媽媽趕快蹲下，
  // 他從媽媽頭上摸過去，抱住桌子還以為是媽媽（拍拍、冒愛心）；一轉身又「咚」撞上走過來的真媽媽，兩個都眼冒金星；
  // 他把臉上的奶油舔掉（好吃！），回到 W3
  'splat:爸': (() => {
    // 奶油黏在爸爸臉上：爸爸走到哪、奶油跟到哪（flip 的時候臉在身體中線左邊一點）
    const walkBoth = (at: number, x: number, dur: number, ease?: Move['ease'], face = -1): Move[] => [
      { at, actor: 'dad', do: 'moveTo', to: { x, y: DG }, dur, ease },
      { at, actor: 'g', do: 'moveTo', to: { x: x + face, y: DAD_EYES.y }, dur, ease },
    ]
    return scene({
      duration: 6.1,
      bg: BG,
      actors: [...w3(), glob('g')],
      moves: [
        ...w3Base(6.1),
        ...fling('g', 0.25, DAD_EYES, 0.45, 12),
        // 啪！糊住眼鏡
        { at: 0.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 0.7, actor: 'dad', do: 'squash', amount: 0.2, dur: 0.25 },
        { at: 0.7, actor: 'g', do: 'squash', amount: 0.3, dur: 0.25 },
        { at: 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
        { at: 0.75, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        // 伸著手亂走
        { at: 1.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
        ...walkBoth(1.25, 76, 0.7, 'linear'),
        { at: 1.3, actor: 'dad', do: 'tilt', amount: 8, dur: 0.35 },
        { at: 1.65, actor: 'dad', do: 'tilt', amount: -8, dur: 0.35 },
        // 媽媽蹲下，他從她頭上摸過去
        { at: 1.55, actor: 'mom', do: 'swap', emoji: 'hero:three/duck' },
        ...walkBoth(1.95, 97, 0.45),
        // 抱住桌子：這是媽媽吧？
        { at: 2.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/hug' },
        { at: 2.5, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.2 },
        { at: 2.75, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.2 },
        { at: 3.0, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.2 },
        { at: 2.5, actor: 'table', do: 'shake', amount: 0.5, dur: 0.3 },
        { at: 2.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
        { at: 2.5, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
        // 媽媽踮腳溜到旁邊偷笑，讓人看清楚他抱的是桌子
        { at: 2.2, actor: 'mom', do: 'swap', emoji: 'hero:three/sneak' },
        { at: 2.2, actor: 'mom', do: 'moveTo', to: { x: 72, y: MG }, dur: 0.35 },
        { at: 2.6, actor: 'mom', do: 'swap', emoji: 'hero:three/giggle' },
        { at: 2.9, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.25 },
        // 轉身……咚！撞上真媽媽
        { at: 3.3, actor: 'dad', do: 'flip' },
        { at: 3.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
        ...walkBoth(3.35, 89, 0.2, 'in', 1),
        { at: 3.25, actor: 'mom', do: 'swap', emoji: 'hero:three/reach' },
        { at: 3.25, actor: 'mom', do: 'moveTo', to: { x: 80, y: MG }, dur: 0.3 },
        ...walkBoth(3.55, 95, 0.25, 'out', 1),
        { at: 3.55, actor: 'mom', do: 'moveTo', to: { x: 74, y: MG }, dur: 0.25, ease: 'out' },
        { at: 3.55, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        { at: 3.55, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 3.55, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
        { at: 3.55, actor: 'red', do: 'hop', amount: 4, dur: 0.3 },
        // 舔掉：好吃！
        { at: 4.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/drool' },
        { at: 4.3, actor: 'g', do: 'moveTo', to: { x: 96, y: 63 }, dur: 0.45 },
        { at: 4.3, actor: 'g', do: 'scaleTo', amount: 0.35, dur: 0.45 },
        { at: 4.75, actor: 'g', do: 'vanish', dur: 0.1 },
        { at: 4.8, actor: 'dad', do: 'hop', amount: 3, dur: 0.3 },
        { at: 4.4, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
        // 回到 W3
        { at: 5.1, actor: 'dad', do: 'flip' },
        { at: 5.1, actor: 'dad', do: 'moveTo', to: { x: DAD3, y: DG }, dur: 0.5 },
        { at: 5.1, actor: 'mom', do: 'moveTo', to: { x: MOM3, y: MG }, dur: 0.4 },
        { at: 5.55, actor: 'dad', do: 'swap', emoji: 'hero:eric/scared' },
        { at: 5.55, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
        { at: 5.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
        { at: 5.6, actor: 'big', do: 'shake', amount: 1, dur: 0.4 },
      ],
      fx: [
        { at: 0.7, kind: 'burst', x: DAD_EYES.x, y: DAD_EYES.y, emoji: 'prop:cream-splat', n: 5, dur: 0.5, scale: 0.7 },
        { at: 2.5, kind: 'burst', actor: 'dad', emoji: '💗', n: 5, dy: 4, dur: 0.8, scale: 0.8 },
        { at: 2.6, kind: 'pop', actor: 'yang', emoji: '😂', dur: 1.0 },
        { at: 3.55, kind: 'burst', x: 85, y: 50, emoji: '💥', n: 1, dur: 0.35, scale: 1.0 },
        { at: 3.65, kind: 'dizzy', actor: 'dad', dur: 0.8 },
        { at: 3.65, kind: 'dizzy', actor: 'mom', dur: 0.8 },
        { at: 4.85, kind: 'pop', actor: 'dad', emoji: '😋', dx: -6, dur: 0.8 },
      ],
      camera: [W3_START, closeUp(0.35, 0.4, { x: 76, y: 54 }, 1.55), { at: 3.55, dur: 0.3, do: 'shake', amount: 1.2 }, w3Back(5.1)],
      cues: [
        { at: 0.25, sfx: 'whoosh' },
        { at: 0.7, sfx: 'splash' },
        { at: 0.85, say: '爸爸看不見了！' },
        { at: 2.5, sfx: 'tap' },
        { at: 2.75, sfx: 'tap' },
        { at: 3.55, sfx: 'bonk' },
        { at: 4.5, sfx: 'gulp' },
      ],
    })
  })(),

  // 媽媽的頭上有蛋糕！好美！——一坨、再一坨奶油疊在媽媽頭上，最上面掉下一顆草莓，堆成一頂高高的奶油帽；
  // 她本來要生氣，看看大家，改成擺模特兒的姿勢轉一圈（閃亮亮），爸爸拍手；草莓滑下來她一口吃掉，甩甩頭把帽子甩掉，回到 W3
  'splat:媽': (() => {
    const HAT = ['h1', 'h2', 'berry']
    const withHat = (m: Omit<Move, 'actor'>): Move[] => ['mom', ...HAT].map((actor) => ({ ...m, actor }) as Move)
    return scene({
      duration: 6.0,
      bg: BG,
      actors: [...w3(), glob('h1', 10), glob('h2', 8), { id: 'berry', emoji: '🍓', x: MOM_HEAD.x + 1, y: 20, size: 6, hidden: true, float: true, pivot: 'center' }],
      moves: [
        ...w3Base(6.0),
        ...fling('h1', 0.2, MOM_HEAD, 0.45, 10),
        ...fling('h2', 0.55, { x: MOM_HEAD.x + 1, y: MOM_HEAD.y - 6 }, 0.4, 10),
        { at: 0.65, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.2 },
        { at: 0.95, actor: 'h1', do: 'squash', amount: 0.2, dur: 0.2 },
        { at: 0.65, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        // 草莓掉在最上面
        { at: 1.1, actor: 'berry', do: 'pop', dur: 0.05 },
        { at: 1.1, actor: 'berry', do: 'moveTo', to: { x: MOM_HEAD.x + 1, y: MOM_HEAD.y - 11 }, dur: 0.3, ease: 'bounce' },
        // 本來要生氣……
        { at: 1.4, actor: 'mom', do: 'swap', emoji: 'hero:three/angry' },
        ...withHat({ at: 1.45, do: 'hop', amount: 2, dur: 0.2 }),
        { at: 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
        { at: 0.75, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        // 改成擺模特兒姿勢轉一圈，閃亮亮
        { at: 2.0, actor: 'mom', do: 'swap', emoji: 'hero:three/smug' },
        ...withHat({ at: 2.05, do: 'hop', amount: 4, dur: 0.35 }),
        { at: 2.15, actor: 'mom', do: 'flip' },
        { at: 2.3, actor: 'mom', do: 'flip' },
        { at: 2.4, actor: 'mom', do: 'flash', dur: 0.9 },
        { at: 2.5, actor: 'mom', do: 'tilt', amount: 8, dur: 0.6 },
        // 爸爸拍手
        { at: 2.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
        ...[2.45, 2.7, 2.95, 3.2].map((at): Move => ({ at, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.18 })),
        { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
        { at: 2.55, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
        { at: 2.55, actor: 'red', do: 'hop', amount: 4, dur: 0.3 },
        // 草莓滑下來，一口吃掉
        { at: 3.6, actor: 'berry', do: 'moveTo', to: { x: MOM_FACE.x + 6, y: MOM_HEAD.y }, dur: 0.25, ease: 'in' },
        { at: 3.85, actor: 'berry', do: 'moveTo', to: { x: MOM_FACE.x + 3, y: MOM_FACE.y + 2 }, dur: 0.2, ease: 'in' },
        { at: 3.85, actor: 'mom', do: 'swap', emoji: 'hero:three/eat' },
        { at: 4.05, actor: 'berry', do: 'vanish', dur: 0.1 },
        { at: 4.1, actor: 'mom', do: 'squash', amount: 0.12, dur: 0.2 },
        // 甩甩頭，帽子甩掉
        { at: 4.5, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
        { at: 4.55, actor: 'mom', do: 'shake', amount: 2, dur: 0.4 },
        { at: 4.6, actor: 'h1', do: 'moveTo', to: { x: 130, y: 70 }, arc: 8, dur: 0.45, ease: 'out' },
        { at: 4.6, actor: 'h2', do: 'moveTo', to: { x: 74, y: 74 }, arc: 12, dur: 0.45, ease: 'out' },
        { at: 5.05, actor: 'h1', do: 'vanish', dur: 0.1 },
        { at: 5.05, actor: 'h2', do: 'vanish', dur: 0.1 },
        // 回到 W3
        { at: 5.3, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
        { at: 5.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/scared' },
        { at: 5.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
        { at: 5.35, actor: 'big', do: 'shake', amount: 1, dur: 0.4 },
      ],
      fx: [
        { at: 0.65, kind: 'burst', x: MOM_HEAD.x, y: MOM_HEAD.y, emoji: 'prop:cream-splat', n: 4, dur: 0.45, scale: 0.6 },
        { at: 1.45, kind: 'burst', actor: 'mom', emoji: '💢', n: 1, dx: 10, dy: 14, dur: 0.5, scale: 0.8 },
        { at: 2.4, kind: 'burst', actor: 'mom', emoji: '✨', n: 8, dy: 6, dur: 0.9, scale: 1.2 },
        { at: 2.45, kind: 'pop', actor: 'dad', emoji: '👏', dx: 8, dur: 1.0 },
        { at: 4.1, kind: 'pop', actor: 'mom', emoji: '😋', dx: 12, dy: 16, dur: 0.7 },
      ],
      camera: [W3_START, closeUp(0.3, 0.4, { x: 73, y: 50 }, 1.5), w3Back(4.9)],
      cues: [
        { at: 0.2, sfx: 'whoosh' },
        { at: 0.65, sfx: 'plop' },
        { at: 0.95, sfx: 'plop' },
        { at: 1.4, sfx: 'boing' },
        { at: 1.6, say: '媽媽的頭上有蛋糕！好美！' },
        { at: 2.4, sfx: 'cheer' },
        { at: 4.05, sfx: 'gulp' },
        { at: 4.6, sfx: 'whoosh' },
      ],
    })
  })(),

  // 他用嘴接到了！好好吃！——第一坨慢慢飛過來，他張大嘴「啊姆」接住；第二坨飛得更高更快，他跳起來接住；
  // 第三坨最快、貼著飛，他往前一撲也接住了（星星）！肚子圓起來坐下、打一個嗝，站起來比讚耍帥，爸爸媽媽拍手。回到 W3
  'splat:他': (() => {
    const both = (m: Omit<Move, 'actor'>): Move[] => ['yang', 'red'].map((actor) => ({ ...m, actor }) as Move)
    const gulp = (id: string, at: number): Move[] => [
      { at, actor: id, do: 'scaleTo', amount: 0.2, dur: 0.1 },
      { at: at + 0.08, actor: id, do: 'vanish', dur: 0.05 },
      { at, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.2 },
    ]
    return scene({
      duration: 5.9,
      bg: BG,
      actors: [...w3(), glob('c1'), glob('c2'), glob('c3')],
      moves: [
        ...w3Base(5.9),
        // 紅陀螺先抱低一點（肚子前面），嘴巴才空出來
        { at: 0.35, actor: 'red', do: 'moveTo', to: { x: YANG3 + 1, y: RED3_Y + 3 }, dur: 0.25 },
        // 第一坨：慢慢的，啊姆
        ...fling('c1', 0.2, YANG_MOUTH, 0.8, 16),
        { at: 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
        { at: 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
        ...gulp('c1', 1.0),
        // 第二坨：高高的、快一點，跳起來接
        ...fling('c2', 1.35, { x: YANG_MOUTH.x, y: YANG_MOUTH.y - 8 }, 0.45, 32),
        ...both({ at: 1.55, do: 'hop', amount: 8, dur: 0.45 }),
        ...gulp('c2', 1.8),
        // 第三坨：最快、貼著飛，往前一撲
        ...fling('c3', 2.2, { x: YANG_MOUTH.x + 9, y: YANG_MOUTH.y }, 0.28, 2),
        ...both({ at: 2.25, do: 'moveTo', to: { x: YANG3 + 9, y: YG }, dur: 0.2, ease: 'out' }),
        { at: 2.25, actor: 'red', do: 'moveTo', to: { x: YANG3 + 10, y: RED3_Y + 3 }, dur: 0.2, ease: 'out' },
        ...gulp('c3', 2.48),
        // 肚子圓起來，打一個嗝
        { at: 2.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/full' },
        { at: 2.75, actor: 'red', do: 'moveTo', to: { x: YANG3 + 10, y: RED3_Y + 3 }, dur: 0.15 },
        // 嗝——正好打在爸爸臉上
        { at: 3.35, actor: 'dad', do: 'swap', emoji: 'hero:eric/stinky' },
        { at: 3.15, actor: 'yang', do: 'squash', amount: -0.2, dur: 0.25 },
        // 站起來比讚耍帥，爸爸媽媽拍手
        { at: 3.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
        ...both({ at: 3.65, do: 'hop', amount: 4, dur: 0.3 }),
        { at: 3.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 3.0, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        { at: 3.65, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
        { at: 3.65, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
        ...[3.7, 3.95, 4.2].flatMap((at): Move[] => [
          { at, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.18 },
          { at: at + 0.05, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.18 },
        ]),
        { at: 1.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 1.8, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        // 回到 W3
        ...both({ at: 4.6, do: 'moveTo', to: { x: YANG3, y: YG }, dur: 0.35 }),
        { at: 4.6, actor: 'red', do: 'moveTo', to: { x: YANG3 + 1, y: RED3_Y }, dur: 0.35 },
        { at: 5.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
        { at: 5.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/scared' },
        { at: 5.0, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
        { at: 5.05, actor: 'big', do: 'shake', amount: 1, dur: 0.4 },
      ],
      fx: [
        { at: 1.0, kind: 'pop', actor: 'yang', emoji: '😋', dx: -6, dur: 0.6 },
        { at: 1.8, kind: 'burst', actor: 'yang', emoji: '✨', n: 6, dur: 0.5 },
        { at: 2.48, kind: 'burst', actor: 'yang', emoji: '⭐', n: 8, dur: 0.7, scale: 1.2 },
        { at: 3.2, kind: 'blow', actor: 'yang', dx: 4, dy: 12, to: { x: YANG3 + 26, y: 50 }, n: 2, dur: 0.5 },
        { at: 3.65, kind: 'pop', actor: 'yang', emoji: '👍', dx: -8, dur: 1.0, scale: 1.3 },
        { at: 3.7, kind: 'burst', actor: 'yang', emoji: '✨', n: 8, dur: 0.8 },
        { at: 3.75, kind: 'pop', actor: 'dad', emoji: '👏', dx: 8, dur: 0.9 },
        { at: 3.8, kind: 'pop', actor: 'mom', emoji: '👏', dx: 8, dur: 0.9 },
      ],
      camera: [W3_START, closeUp(0.3, 0.4, { x: 58, y: 54 }, 1.45), w3Back(4.6)],
      cues: [
        { at: 0.2, sfx: 'whoosh' },
        { at: 1.0, sfx: 'gulp' },
        { at: 1.1, say: '他用嘴接到了！好好吃！' },
        { at: 1.8, sfx: 'gulp' },
        { at: 2.48, sfx: 'gulp' },
        { at: 3.2, sfx: 'hic' },
        { at: 3.7, sfx: 'cheer' },
      ],
    })
  })(),

  // 大家的臉都是蛋糕！大家都笑了！——大陀螺最後猛轉一下，「轟」奶油大爆炸，三張臉同時被糊住，定住一拍；
  // 奶油滑下來，三個人一起笑到東倒西歪。大陀螺轉累了，搖搖晃晃倒在右邊地上打呼；蛋糕剩下一個，最後一根蠟燭「叮」插回去
  cream: (() => {
    const FACES: [string, string, Vec][] = [['g1', 'dad', DAD_EYES], ['g2', 'mom', MOM_FACE], ['g3', 'yang', YANG_FACE]]
    return scene({
      duration: 6.6,
      bg: BG,
      actors: [
        ...w3(), glob('g1'), glob('g2'), glob('g3'),
        { id: 'candle', emoji: '🕯️', x: CANDLE.x, y: -10, size: CANDLE_S, hidden: true, float: true },
      ],
      moves: [
        ...w3Fix,
        ...sway(6.6),
        ...whirl('big', 0, 4.0, 0.08, 6),
        // 最後猛轉一下……轟！
        { at: 0.1, actor: 'big', do: 'shake', amount: 1.6, dur: 0.45 },
        { at: 0.35, actor: 'big', do: 'squash', amount: -0.25, dur: 0.25 },
        ...FACES.flatMap(([g, who, to]): Move[] => [
          { at: 0.6, actor: g, do: 'pop', dur: 0.05 },
          { at: 0.6, actor: g, do: 'moveTo', to, arc: 6, dur: 0.3, ease: 'out' },
          { at: 0.9, actor: who, do: 'squash', amount: 0.2, dur: 0.25 },
          { at: 0.9, actor: g, do: 'squash', amount: 0.3, dur: 0.25 },
        ]),
        { at: 0.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 0.9, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        { at: 0.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
        // 定住一拍……奶油滑下來，一起爆笑
        ...FACES.flatMap(([g, , to]): Move[] => [
          { at: 1.95, actor: g, do: 'moveTo', to: { x: to.x, y: to.y + 12 }, dur: 0.4, ease: 'in' },
          { at: 1.95, actor: g, do: 'vanish', dur: 0.45 },
        ]),
        { at: 2.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
        { at: 2.0, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
        { at: 2.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
        { at: 2.1, actor: 'dad', do: 'tilt', amount: 12, dur: 0.6 },
        { at: 2.15, actor: 'mom', do: 'tilt', amount: -12, dur: 0.6 },
        { at: 2.2, actor: 'yang', do: 'tilt', amount: 14, dur: 0.5 },
        { at: 2.2, actor: 'red', do: 'tilt', amount: 14, dur: 0.5 },
        { at: 2.75, actor: 'dad', do: 'tilt', amount: -14, dur: 0.6 },
        { at: 2.8, actor: 'mom', do: 'tilt', amount: 14, dur: 0.6 },
        { at: 2.75, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
        { at: 2.75, actor: 'red', do: 'hop', amount: 5, dur: 0.35 },
        { at: 3.4, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.3 },
        { at: 3.4, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.3 },
        { at: 3.4, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.3 },
        // 大陀螺轉累了：停下來、搖搖晃晃、倒下來打呼
        { at: 4.0, actor: 'big', do: 'swap', emoji: 'prop:top-green' },
        { at: 4.0, actor: 'big', do: 'tint', filter: '' },
        { at: 4.0, actor: 'big', do: 'tilt', amount: 12, dur: 0.4 },
        { at: 4.4, actor: 'big', do: 'tilt', amount: -16, dur: 0.4 },
        { at: 4.8, actor: 'big', do: 'moveTo', to: BIG_ASLEEP, arc: 6, dur: 0.45, ease: 'in' },
        { at: 4.8, actor: 'big', do: 'rotateTo', amount: 80, dur: 0.45, ease: 'in' },
        { at: 5.25, actor: 'big', do: 'squash', amount: 0.15, dur: 0.25 },
        // 蛋糕剩下一個，最後一根蠟燭插回去
        { at: 4.85, actor: 'cake', do: 'swap', emoji: 'prop:cake' },
        { at: 4.85, actor: 'cake', do: 'squash', amount: 0.2, dur: 0.25 },
        { at: 5.4, actor: 'candle', do: 'pop', dur: 0.05 },
        { at: 5.4, actor: 'candle', do: 'moveTo', to: CANDLE, dur: 0.3, ease: 'bounce' },
        { at: 4.85, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 4.85, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        { at: 4.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
        { at: 5.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
        { at: 5.7, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
        { at: 5.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
        { at: 5.75, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
        { at: 5.75, actor: 'red', do: 'hop', amount: 3, dur: 0.3 },
        { at: 6.0, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.3 },
        { at: 6.1, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.3 },
      ],
      fx: [
        { at: 0.6, kind: 'burst', x: CAKE3.x, y: 42, emoji: 'prop:cream-splat', n: 10, dur: 0.8, scale: 2 },
        ...FACES.map(([, , to]): Fx => ({ at: 0.9, kind: 'burst', x: to.x, y: to.y, emoji: 'prop:cream-splat', n: 4, dur: 0.4, scale: 0.5 })),
        ...FACES.map(([, , to], i): Fx => ({ at: 1.35 + i * 0.12, kind: 'burst', x: to.x, y: to.y + 6, emoji: '💧', n: 1, dur: 0.45, scale: 0.5 })),
        { at: 2.2, kind: 'pop', actor: 'yang', emoji: '😂', dur: 1.0 },
        { at: 2.35, kind: 'pop', actor: 'dad', emoji: '😆', dx: 6, dur: 1.0 },
        { at: 2.5, kind: 'pop', actor: 'mom', emoji: '😂', dx: 6, dur: 1.0 },
        { at: 5.25, kind: 'puff', x: BIG_ASLEEP.x - 4, y: 72, dur: 0.5, scale: 1.4 },
        { at: 5.5, kind: 'zzz', actor: 'big', emoji: '💤', dx: -12, dy: 4, dur: 1.1 },
        { at: 5.55, kind: 'burst', actor: 'candle', emoji: '✨', n: 5, dur: 0.5, scale: 0.7 },
      ],
      lights: [{ at: 0.6, dur: 0.08, level: -0.3 }, { at: 0.68, dur: 0.3, level: 0 }],
      camera: [W3_START, closeUp(0.55, 0.35, { x: 60, y: 58 }, 1.5), { at: 0.9, dur: 0.3, do: 'shake', amount: 1.4 }, w3Back(3.8, 0.6), { at: 5.25, dur: 0.3, do: 'shake', amount: 1.2 }],
      cues: [
        { at: 0.6, sfx: 'splash' },
        { at: 0.9, sfx: 'plop' },
        { at: 1.05, say: '大家的臉都是蛋糕！大家都笑了！' },
        { at: 2.0, sfx: 'cheer' },
        { at: 4.8, sfx: 'whoosh' },
        { at: 5.25, sfx: 'bonk' },
        { at: 5.6, sfx: 'clink' },
      ],
    })
  })(),

  // 楊捷睿，生日快樂！爸爸媽媽愛你！——他走到中間，爸爸把插著蠟燭的蛋糕捧到他面前，爸爸媽媽唱歌；
  // 他吸一口氣「呼」吹熄蠟燭，大家歡呼；爸爸把蛋糕放下，爸爸媽媽從兩邊抱住他（他抱著紅陀螺），
  // 愛心一直冒、彩帶落下、氣球往上飄；一家三口靠在一起輕輕搖，停在置中的定格
  end: (() => {
    const both = (m: Omit<Move, 'actor'>, dx = 1): Move[] => [
      { ...m, actor: 'yang' } as Move,
      { ...m, actor: 'red', ...(m.to ? { to: { x: m.to.x + dx, y: RED3_Y } } : {}) } as Move,
    ]
    const cakeAt = (at: number, x: number, y: number, dur: number): Move[] => [
      { at, actor: 'cake', do: 'moveTo', to: { x, y }, dur },
      { at, actor: 'candle', do: 'moveTo', to: { x, y: y + (CANDLE.y - CAKE3.y) }, dur },
    ]
    const UP = ['bl6', 'bl7', 'bl8']
    return scene({
      duration: 7.6,
      bg: BG,
      actors: [
        ...balloons,
        { id: 'bl6', emoji: '🎈', x: 52, y: 100, size: 11, hidden: true, float: true, tint: 'hue-rotate(300deg)' },
        { id: 'bl7', emoji: '🎈', x: 104, y: 100, size: 12, hidden: true, float: true, tint: 'hue-rotate(160deg)' },
        { id: 'bl8', emoji: '🎈', x: 120, y: 100, size: 10, hidden: true, float: true, tint: 'hue-rotate(40deg) brightness(1.1)' },
        table3,
        { ...bigTop(), ...BIG_ASLEEP },
        mom('laugh', MOM3),
        dad('laugh', DAD3, { flip: true }),
        yang('laugh', YANG3),
        red3(),
        { ...cake3, emoji: 'prop:cake' },
        { id: 'candle', emoji: '🕯️', ...CANDLE, size: CANDLE_S, float: true },
      ],
      moves: [
        ...w3Fix,
        { at: 0, dur: 0, actor: 'big', do: 'rotateTo', amount: 80 },
        ...sway(7.6),
        { at: 0.3, actor: 'big', do: 'squash', amount: 0.06, dur: 0.6 },
        { at: 1.8, actor: 'big', do: 'squash', amount: 0.06, dur: 0.6 },
        // 他走到中間
        { at: 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
        ...both({ at: 0.2, do: 'moveTo', to: { x: YANG_END, y: YG }, dur: 0.7 }),
        ...both({ at: 0.2, do: 'hop', amount: 3, dur: 0.35 }),
        ...both({ at: 0.55, do: 'hop', amount: 3, dur: 0.35 }),
        // 媽媽到左邊，爸爸去拿蛋糕
        { at: 0.2, actor: 'mom', do: 'swap', emoji: 'hero:three/walk' },
        { at: 0.2, actor: 'mom', do: 'flip' },
        { at: 0.2, actor: 'mom', do: 'moveTo', to: { x: MOM_END, y: MG }, dur: 0.6 },
        { at: 0.85, actor: 'mom', do: 'flip' },
        { at: 0.85, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
        { at: 0.2, actor: 'dad', do: 'swap', emoji: 'hero:eric/walk' },
        { at: 0.2, actor: 'dad', do: 'moveTo', to: { x: 104, y: DG }, dur: 0.55 },
        { at: 0.8, actor: 'dad', do: 'flip' },
        { at: 0.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
        ...cakeAt(0.85, 96, 66, 0.3),
        { at: 1.0, actor: 'dad', do: 'moveTo', to: { x: DAD_END + 6, y: DG }, dur: 0.35 },
        ...cakeAt(1.0, 89, 68, 0.35),
        // 爸爸媽媽唱歌，他眼睛發亮
        { at: 1.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
        ...both({ at: 1.35, do: 'hop', amount: 3, dur: 0.3 }),
        { at: 1.4, actor: 'mom', do: 'tilt', amount: 6, dur: 0.5 },
        { at: 1.9, actor: 'mom', do: 'tilt', amount: -6, dur: 0.5 },
        // 吸一口氣……呼！
        { at: 2.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/blow' },
        { at: 2.2, actor: 'yang', do: 'squash', amount: -0.15, dur: 0.3 },
        { at: 2.5, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.3 },
        { at: 2.7, actor: 'candle', do: 'swap', half: 'bottom', cut: CANDLE_CUT },
        // 歡呼，蛋糕放下，從兩邊抱住他
        { at: 2.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
        ...both({ at: 2.85, do: 'hop', amount: 6, dur: 0.4 }),
        { at: 2.85, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
        { at: 2.85, actor: 'mom', do: 'hop', amount: 4, dur: 0.35 },
        ...cakeAt(2.95, 101, 72, 0.35),
        { at: 3.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/hug' },
        { at: 3.1, actor: 'dad', do: 'moveTo', to: { x: DAD_END, y: DG }, dur: 0.3 },
        { at: 3.1, actor: 'mom', do: 'swap', emoji: 'hero:three/hug' },
        { at: 3.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
        // 抱緊、輕輕搖
        ...['mom', 'dad', 'yang', 'red'].flatMap((actor): Move[] => [
          { at: 3.45, actor, do: 'squash', amount: 0.1, dur: 0.35 },
          { at: 4.2, actor, do: 'tilt', amount: 5, dur: 0.9 },
          { at: 5.1, actor, do: 'tilt', amount: -5, dur: 0.9 },
          { at: 6.0, actor, do: 'squash', amount: 0.08, dur: 0.4 },
        ]),
        // 氣球往上飄
        ...UP.flatMap((actor, i): Move[] => [
          { at: 3.5 + i * 0.35, actor, do: 'pop', dur: 0.05 },
          { at: 3.5 + i * 0.35, actor, do: 'moveTo', to: { x: [46, 108, 124][i], y: -20 }, dur: 3.4 },
          { at: 3.6 + i * 0.35, actor, do: 'tilt', amount: i % 2 ? 8 : -8, dur: 1.5 },
        ]),
        ...BALLOON_IDS.map((actor, i): Move => ({ at: 3.8 + i * 0.15, actor, do: 'moveTo', to: { x: [40, 49, 57, 104, 113][i], y: -20 }, dur: 3.2 })),
      ],
      fx: [
        { at: 1.35, kind: 'pop', actor: 'mom', emoji: '🎵', dx: 8, dur: 0.8 },
        { at: 1.75, kind: 'pop', actor: 'dad', emoji: '🎶', dx: -4, dur: 0.8 },
        { at: 1.45, kind: 'pop', actor: 'yang', emoji: '🤩', dx: -8, dur: 0.6 },
        { at: 2.5, kind: 'blow', actor: 'yang', dx: 5, dy: 11, to: { x: CANDLE_FLAME_DX + 89, y: 55 }, n: 3, dur: 0.35 },
        { at: 2.7, kind: 'burst', x: 89, y: 54, emoji: 'prop:smoke', n: 1, dur: 0.6, scale: 0.6 },
        { at: 2.75, kind: 'burst', x: 89, y: 55, emoji: '✨', n: 6, dur: 0.6 },
        { at: 2.9, kind: 'burst', x: 58, y: 30, emoji: '🎉', n: 8, dur: 1.0, scale: 1.4 },
        { at: 2.95, kind: 'burst', x: 98, y: 28, emoji: '🎊', n: 8, dur: 1.0, scale: 1.4 },
        { at: 3.3, kind: 'burst', x: 78, y: 30, emoji: '💗', n: 10, dur: 1.2, scale: 1.3 },
        { at: 4.0, kind: 'burst', x: 78, y: 30, emoji: '💖', n: 8, dur: 1.2, scale: 1.2 },
        { at: 4.7, kind: 'burst', x: 66, y: 36, emoji: '🎊', n: 8, dur: 1.1, scale: 1.3 },
        { at: 4.8, kind: 'burst', x: 78, y: 31, emoji: '💕', n: 8, dur: 1.2, scale: 1.2 },
        { at: 5.6, kind: 'burst', x: 78, y: 30, emoji: '💗', n: 10, dur: 1.3, scale: 1.3 },
        { at: 6.3, kind: 'burst', x: 78, y: 31, emoji: '💖', n: 8, dur: 1.3, scale: 1.1 },
      ],
      camera: [W3_START, closeUp(0.9, 0.9, { x: 80, y: 56 }, 1.45), closeUp(3.0, 0.9, END_VIEW, 1.75)],
      cues: [
        { at: 1.3, say: '楊捷睿，生日快樂！爸爸媽媽愛你！' },
        { at: 2.7, sfx: 'poof' },
        { at: 2.85, sfx: 'cheer' },
        { at: 4.8, sfx: 'cheer' },
      ],
    })
  })(),
}

export default scenes
