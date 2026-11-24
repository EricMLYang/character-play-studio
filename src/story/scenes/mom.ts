import { scene } from '../scene'
import type { Actor, Clip, Fx, Move } from '../../anim/clip'
import type { Scenes } from './index'

// 媽媽好累：傍晚，爸爸和楊捷睿在房間裡踢球；門一開，媽媽拖著包包、彎著腰走進來，包包一丟、嘆一口大氣，
// 球趁他們轉頭看媽媽時打到楊捷睿的頭飛走；媽媽站著站著就打起瞌睡，差點倒下去又驚醒。
// 楊捷睿想到辦法（頭上亮一顆燈泡），跑去拉爸爸咬耳朵，兩個一起點頭，偷笑著準備送東西。
// 給媽媽什麼：花——他從背後變出一朵大鬱金香，媽媽聞一下笑開跳起來，摸摸他的頭，把花插進包包；
// 蛇——他得意地送上一個禮物盒，盒子一開跳出一條蛇吐舌頭，媽媽嚇得「咻」一聲飛過他頭頂、落在爸爸頭上，
// 爸爸被壓扁、扛著她東倒西歪，蛇被媽媽的尖叫嚇跑，媽媽爬下來；
// 冰——爸爸偷偷拿冰塊從媽媽頭上丟進衣領，停一拍，媽媽整個變藍、跳到天花板，落地縮成一團發抖，冰塊從腳邊滑走，
// 媽媽回頭瞪爸爸，爸爸轉過身假裝吹口哨走回去。
// 媽媽想吃飯：肚子咕嚕叫，爸爸拍胸脯衝出去，推著一張擺好大碗飯的桌子回來，楊捷睿開心地從媽媽頭上跳過去，媽媽坐到桌子後面。
// 爸爸給什麼飯（三個都要選、順序他決定）：辣——辣椒掉進碗裡，媽媽吃一口臉紅冒火，把整碗塞進爸爸嘴裡，
// 爸爸嘴裡噴出一大把火、跳來跳去，衝出去沖水，濕答答冒著煙回來；苦——青菜掉進碗裡，三支湯匙飛到三個人嘴裡，
// 停一拍，三張臉一起慢慢變綠、整齊地抖兩下，爸爸把青菜丟出窗外；甜——蛋糕掉進碗裡，媽媽吃一口好開心，
// 楊捷睿衝過來把整碗抱走狂吃，肚子越吃越大坐在地上，爸爸媽媽傻眼對看，他打一個大嗝縮回來，把空碗丟回桌上。
// 最後媽媽從桌子後面走出來張開手，爸爸和楊捷睿從兩邊撲上來抱住她，愛心一直冒，媽媽閉上眼睛笑著，在大家懷裡睡著了。
//
// 媽媽 three（size 34，跟爸爸差不多大，34 以上引擎不再放大）、爸爸 eric（size 36）、楊捷睿 yang（size 22，引擎放大成 27）；圖都朝左。
// 共用的站位：左邊牆上有門，門右邊的地上是媽媽的包包（花頁以後包包裡插著那朵花），牆上的窗戶裡有月亮。
// W1（等他選「給媽媽什麼」）：媽媽 x 54 面向右彎腰喘（tired），楊捷睿 x 90 偷笑（giggle），爸爸 x 120 得意（smug）。
// W2（花的結尾、eat 的開頭）：三個都 happy，楊捷睿站在媽媽旁邊 x 76。
// W3（等他選「什麼飯」）：桌子在 x 84，碗在桌上右邊；媽媽 x 74 在桌子後面（像坐著）流口水等（drool），
// 楊捷睿 x 44 摸肚子（hungry），爸爸 x 116 得意（smug）。
// 每一段開頭與結尾都是全景（START／holdWide），換頁時鏡頭不跳；中間交給自動取景。
type Cue = Clip['cues'][number]
type Cam = NonNullable<Clip['camera']>[number]
const BG = { top: '#F4B48C', bottom: '#FCE2C6', floor: '#B98B63', scenery: 'room' as const }

const MOM_S = 34
const MG = 77 - 0.42 * MOM_S
const DAD_S = 36
const DG = 77 - 0.42 * DAD_S
const YANG_S = 22
const YG = 77 - 0.42 * YANG_S

const MOM_X = 54
const YANG_X = 90
const DAD_X = 120

const r2 = (n: number) => +n.toFixed(2)
const holdWide = (at: number, dur = 0.5): Cam => ({ at, dur, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } })
const release = (at: number, dur = 0.6): Cam => ({ at, dur, do: 'zoom', amount: 1 })
const START = holdWide(-0.3, 0.01)

/** 房間：左邊的門、背景窗戶裡的月亮（傍晚） */
const door: Actor = { id: 'door', emoji: '🚪', x: 14, y: 77 - 0.42 * 30, size: 30 }
const moon: Actor = { id: 'moon', emoji: '🌙', x: 27, y: 18, size: 8, float: true }
const room = [moon, door]
/** 媽媽的包包（丟在門邊）與花頁以後插在包包裡的鬱金香 */
const BAG_S = 10
const BAG = { x: 34, y: 77 - 0.42 * BAG_S }
const bag: Actor = { id: 'bag', emoji: '🎒', ...BAG, size: BAG_S }
const TULIP_S = 13
const TULIP_IN_BAG = { x: 35, y: 65.5 }
const TULIP_BAG_S = 7
const tulipInBag: Actor = { id: 'tulip', emoji: '🌷', ...TULIP_IN_BAG, size: TULIP_BAG_S, float: true }

const mom = (pose: string, x = MOM_X, more: Partial<Actor> = {}): Actor => ({ id: 'mom', emoji: `hero:three/${pose}`, x, y: MG, size: MOM_S, flip: true, ...more })
const dad = (pose: string, x = DAD_X, more: Partial<Actor> = {}): Actor => ({ id: 'dad', emoji: `hero:eric/${pose}`, x, y: DG, size: DAD_S, ...more })
const yang = (pose: string, x = YANG_X, more: Partial<Actor> = {}): Actor => ({ id: 'yang', emoji: `hero:yang/${pose}`, x, y: YG, size: YANG_S, ...more })

/** W1：媽媽累垮，兩個準備送東西 */
const w1 = () => [mom('tired'), yang('giggle'), dad('smug')]

/** 吃飯的桌子（壓成寬扁的矮桌）、碗在桌上右邊、碗上面放配料的位置 */
const TABLE_X = 84
const TABLE_S = 22
const TABLE_W = 1.6
const table: Actor = { id: 'table', emoji: 'prop:table', x: TABLE_X, y: 77 - 0.42 * TABLE_S, size: TABLE_S }
const flatTable: Move = { at: 0, dur: 0, actor: 'table', do: 'stretchTo', amount: TABLE_W }
/** 桌子要等 pop 出場以後才壓（出場會回原樣） */
const flatTableAt = (at: number): Move => ({ ...flatTable, at })
const BOWL_S = 11
const BOWL = { x: 93, y: 67 - 0.42 * BOWL_S }
const bowl: Actor = { id: 'bowl', emoji: 'prop:rice', ...BOWL, size: BOWL_S, float: true }
const TOP = { x: BOWL.x, y: BOWL.y - 4 }
const W3_MOM = 74
const W3_YANG = 44
const W3_DAD = 116
/** W3：桌子、碗、三個人。桌子畫在媽媽前面（擋住下半身，像坐在桌子後面） */
const w3 = (front: Actor[] = []) => [
  ...room, bag, tulipInBag,
  mom('drool', W3_MOM), dad('smug', W3_DAD),
  table, bowl, yang('hungry', W3_YANG, { flip: true }), ...front,
]

/** 甜：他抱著碗狂吃時碗在胸前；每兩口肚子撐大一次 */
const EAT_BOWL = { x: 40, y: 64 }
/** 他轉身護住碗以後，碗在他的另一邊 */
const EAT_BOWL_L = { x: 28, y: 64 }
const FAT = 1.1
const GROW = 1.12

/** 冰到變藍、綠臉（苦） */
const BLUE = 'sepia(1) saturate(3) hue-rotate(170deg)'
const GREEN = ['sepia(.35) saturate(1.6) hue-rotate(45deg)', 'sepia(.7) saturate(2.4) hue-rotate(55deg)', 'sepia(1) saturate(3) hue-rotate(60deg)']

/** 一起做同一件事（三個人一起抖、一起點頭） */
const all = (ids: string[], m: Omit<Move, 'actor'>): Move[] => ids.map((actor) => ({ ...m, actor }) as Move)

const scenes: Scenes = {
  // 媽媽回家了。媽媽好累。——爸爸和楊捷睿在踢球；門響兩聲，媽媽彎著腰拖著包包走進來，包包一丟、嘆一口大氣；
  // 兩個人轉頭看她，球「咚」打到楊捷睿的頭飛走。媽媽站著打瞌睡、越晃越大，差點倒下去又驚醒，回到彎腰喘
  home: scene({
    duration: 6.4,
    bg: BG,
    actors: [
      ...room,
      { ...bag, x: BAG.x - 30 - 16, hidden: true },
      mom('tired', 14, { hidden: true }),
      yang('happy'),
      dad('happy'),
      { id: 'ball', emoji: '⚽', x: 98, y: 56, size: 7, float: true, pivot: 'center' },
    ],
    moves: [
      // 踢球：一來一回
      { at: 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
      { at: 0.15, actor: 'ball', do: 'moveTo', to: { x: 116, y: 44 }, arc: 10, dur: 0.35 },
      { at: 0.5, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
      { at: 0.5, actor: 'ball', do: 'moveTo', to: { x: 96, y: 56 }, arc: 10, dur: 0.35 },
      { at: 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 0.85, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 0.85, actor: 'ball', do: 'moveTo', to: { x: 116, y: 44 }, arc: 10, dur: 0.35 },
      { at: 1.2, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
      { at: 1.2, actor: 'ball', do: 'moveTo', to: { x: 96, y: 56 }, arc: 10, dur: 0.35 },
      { at: 1.55, actor: 'yang', do: 'hop', amount: 3, dur: 0.25 },
      { at: 1.55, actor: 'ball', do: 'moveTo', to: { x: 116, y: 44 }, arc: 10, dur: 0.35 },
      { at: 1.9, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
      { at: 1.9, actor: 'ball', do: 'moveTo', to: { x: 95, y: 52 }, arc: 10, dur: 0.35 },
      // 門響兩聲，媽媽拖著包包、彎著腰慢慢走進來
      { at: 0.25, actor: 'door', do: 'shake', amount: 0.8, dur: 0.2 },
      { at: 0.5, actor: 'door', do: 'shake', amount: 0.8, dur: 0.2 },
      { at: 0.75, actor: 'mom', do: 'pop', dur: 0.15 },
      { at: 0.75, actor: 'bag', do: 'pop', dur: 0.15 },
      { at: 0.8, actor: 'mom', do: 'moveTo', to: { x: MOM_X, y: MG }, dur: 1.4, ease: 'linear' },
      { at: 0.8, actor: 'bag', do: 'moveTo', to: { x: BAG.x + 4, y: BAG.y }, dur: 1.4, ease: 'linear' },
      // 包包一丟、肩膀垮下來、嘆一口大氣
      { at: 2.25, actor: 'bag', do: 'moveTo', to: BAG, dur: 0.2, ease: 'out' },
      { at: 2.25, actor: 'bag', do: 'tilt', amount: -15, dur: 0.3 },
      { at: 2.3, actor: 'mom', do: 'squash', amount: -0.12, dur: 0.35 },
      { at: 2.65, actor: 'mom', do: 'squash', amount: 0.22, dur: 0.5 },
      // 兩個人轉頭看她，球打到楊捷睿的頭飛走
      { at: 2.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 2.25, actor: 'ball', do: 'moveTo', to: { x: 175, y: 18 }, arc: 12, dur: 0.6, ease: 'out' },
      { at: 2.25, actor: 'ball', do: 'spin', times: 3, dur: 0.6 },
      { at: 2.25, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.25 },
      { at: 2.85, actor: 'ball', do: 'vanish', dur: 0.05 },
      { at: 2.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      // 站著打瞌睡：越晃越大，差點倒下去
      { at: 3.15, actor: 'mom', do: 'swap', emoji: 'hero:three/doze' },
      { at: 3.3, actor: 'mom', do: 'tilt', amount: 7, dur: 0.6 },
      { at: 3.9, actor: 'mom', do: 'tilt', amount: -10, dur: 0.6 },
      { at: 4.45, actor: 'mom', do: 'rotateTo', amount: 22, dur: 0.45, ease: 'in' },
      // 他踮腳靠過去，在她眼前揮手
      { at: 3.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
      { at: 3.25, actor: 'yang', do: 'moveTo', to: { x: 74, y: YG }, dur: 0.5 },
      { at: 3.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
      { at: 3.85, actor: 'yang', do: 'shake', amount: 1.4, dur: 0.5 },
      { at: 3.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/ponder' },
      { at: 3.6, actor: 'dad', do: 'tilt', amount: -8, dur: 0.6 },
      // 她往前倒：兩個一起衝過來伸手接住
      { at: 4.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
      { at: 4.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/dash' },
      { at: 4.3, actor: 'dad', do: 'moveTo', to: { x: 95, y: DG }, dur: 0.4, ease: 'in' },
      { at: 4.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/lift' },
      { at: 4.75, actor: 'dad', do: 'squash', amount: 0.1, dur: 0.2 },
      { at: 4.75, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.2 },
      // 驚醒：兩個趕快退開、裝沒事
      { at: 5.0, actor: 'mom', do: 'rotateTo', amount: -22, dur: 0.15, ease: 'back' },
      { at: 5.0, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 5.0, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
      { at: 5.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/wait' },
      { at: 5.1, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.35, ease: 'out' },
      { at: 5.1, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.4, ease: 'out' },
      { at: 5.55, actor: 'mom', do: 'swap', emoji: 'hero:three/tired' },
      { at: 5.6, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.45 },
      { at: 5.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/blow' },
      { at: 5.6, actor: 'yang', do: 'tilt', amount: -8, dur: 0.5 },
      { at: 6.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 6.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
    ],
    fx: [
      { at: 0.25, kind: 'burst', actor: 'door', emoji: '💥', n: 1, dx: 6, dy: 10, scale: 0.5, dur: 0.2 },
      { at: 0.5, kind: 'burst', actor: 'door', emoji: '💥', n: 1, dx: 6, dy: 10, scale: 0.5, dur: 0.2 },
      { at: 1.5, kind: 'sweat', actor: 'mom' },
      { at: 2.25, kind: 'puff', actor: 'bag', dur: 0.4 },
      { at: 2.65, kind: 'blow', actor: 'mom', dx: 8, dy: 10, to: { x: 76, y: 50 }, n: 4, scale: 1.4, dur: 0.7 },
      { at: 2.7, kind: 'pop', actor: 'mom', emoji: '😮‍💨', dx: -4, dur: 0.9 },
      { at: 2.25, kind: 'burst', actor: 'yang', n: 1, dy: 2, scale: 0.6, dur: 0.3 },
      { at: 2.45, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      { at: 2.45, kind: 'pop', actor: 'dad', emoji: '❗', dur: 0.5 },
      { at: 3.3, kind: 'zzz', actor: 'mom', emoji: '💤', dx: -6, dur: 1.6 },
      { at: 5.0, kind: 'pop', actor: 'mom', emoji: '❗', dur: 0.5 },
      { at: 5.15, kind: 'sweat', actor: 'yang' },
      { at: 5.6, kind: 'blow', actor: 'dad', dx: -6, dy: 8, to: { x: 104, y: 30 }, emoji: '🎵', n: 2, dur: 0.6 },
    ],
    camera: [START, release(0.3), holdWide(5.6, 0.6)],
    cues: [
      { at: 0.25, sfx: 'tap' },
      { at: 0.5, sfx: 'tap' },
      { at: 0.85, say: '媽媽回家了。媽媽好累。' },
      { at: 2.25, sfx: 'plop' },
      { at: 2.3, sfx: 'boing' },
      { at: 4.4, sfx: 'whoosh' },
      { at: 5.0, sfx: 'boing' },
    ],
  }),

  // 楊捷睿想要媽媽笑。——他看著媽媽，想著媽媽笑的樣子；燈泡一亮，跑去拉爸爸咬耳朵，兩個一起點頭偷笑，回到 W1
  want: scene({
    duration: 5.8,
    bg: BG,
    actors: [...room, bag, mom('tired'), yang('surprised'), dad('surprised')],
    moves: [
      { at: 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
      { at: 0.5, actor: 'yang', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 0.7, actor: 'mom', do: 'swap', emoji: 'hero:three/yawn' },
      { at: 0.7, actor: 'mom', do: 'squash', amount: -0.12, dur: 0.6 },
      { at: 1.4, actor: 'mom', do: 'swap', emoji: 'hero:three/tired' },
      // 想到了！
      { at: 1.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
      { at: 1.6, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      // 跑去拉爸爸，咬耳朵
      { at: 2.1, actor: 'yang', do: 'flip' },
      { at: 2.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
      { at: 2.1, actor: 'yang', do: 'moveTo', to: { x: 100, y: YG }, dur: 0.4 },
      { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
      { at: 2.55, actor: 'dad', do: 'swap', emoji: 'hero:eric/listen' },
      { at: 2.6, actor: 'dad', do: 'moveTo', to: { x: 116, y: DG }, dur: 0.25 },
      { at: 2.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 2.95, actor: 'yang', do: 'hop', amount: 2, dur: 0.2 },
      { at: 3.25, actor: 'yang', do: 'hop', amount: 2, dur: 0.2 },
      { at: 3.0, actor: 'dad', do: 'shake', amount: 0.4, dur: 0.5 },
      // 兩個一起點頭
      { at: 3.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/giggle' },
      ...all(['dad', 'yang'], { at: 3.7, do: 'squash', amount: 0.15, dur: 0.22 }),
      ...all(['dad', 'yang'], { at: 3.95, do: 'squash', amount: 0.15, dur: 0.22 }),
      // 回到 W1
      { at: 4.3, actor: 'yang', do: 'flip' },
      { at: 4.3, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.4 },
      { at: 4.3, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.4 },
      { at: 4.75, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 4.8, actor: 'yang', do: 'shake', amount: 0.7, dur: 0.5 },
      { at: 5.3, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.3 },
      // 媽媽一直在喘
      { at: 2.6, actor: 'mom', do: 'squash', amount: 0.08, dur: 0.4 },
      { at: 3.6, actor: 'mom', do: 'tilt', amount: 6, dur: 0.7 },
      { at: 4.8, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.5 },
    ],
    fx: [
      { at: 0.4, kind: 'bubble', actor: 'yang', emoji: '😊', scale: 1.2, dur: 1.2 },
      { at: 0.9, kind: 'blow', actor: 'mom', dx: 8, dy: 6, to: { x: 76, y: 44 }, n: 3, dur: 0.6 },
      { at: 1.6, kind: 'pop', actor: 'yang', emoji: '💡', scale: 1.2, dur: 0.6 },
      { at: 2.9, kind: 'pop', actor: 'yang', emoji: '🤫', dx: -6, dur: 0.8 },
      { at: 3.7, kind: 'burst', x: 110, y: 36, emoji: '✨', n: 6, dur: 0.6 },
      { at: 4.6, kind: 'sweat', actor: 'mom' },
    ],
    camera: [START, release(0.3), holdWide(5.1, 0.6)],
    cues: [
      { at: 0.4, say: '楊捷睿想要媽媽笑。' },
      { at: 1.6, sfx: 'blip' },
      { at: 3.7, sfx: 'tap' },
      { at: 3.95, sfx: 'tap' },
    ],
  }),

  // 媽媽聞到花，笑了！——他從背後變出一朵大鬱金香走過去，媽媽聞兩下，眼睛一亮跳起來、冒愛心，摸摸他的頭，
  // 把花插進包包。結尾 W2：三個都開心
  'give:花': scene({
    duration: 5.8,
    bg: BG,
    actors: [
      ...room, bag,
      mom('tired'),
      { id: 'tulip', emoji: '🌷', x: 96, y: 58, size: TULIP_S, hidden: true, float: true },
      yang('giggle'),
      dad('smug'),
    ],
    moves: [
      // 噹噹！從背後變出來
      { at: 0.1, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 0.2, actor: 'tulip', do: 'pop', dur: 0.2 },
      { at: 0.25, actor: 'tulip', do: 'moveTo', to: { x: 80, y: 54 }, arc: 6, dur: 0.3, ease: 'out' },
      { at: 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 0.55, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 0.55, actor: 'mom', do: 'hop', amount: 3, dur: 0.25 },
      // 走過去送到鼻子前
      { at: 0.9, actor: 'yang', do: 'moveTo', to: { x: 76, y: YG }, dur: 0.45 },
      { at: 0.9, actor: 'tulip', do: 'moveTo', to: { x: 69, y: 57 }, dur: 0.45 },
      { at: 1.4, actor: 'mom', do: 'squash', amount: -0.08, dur: 0.2 },
      { at: 1.7, actor: 'mom', do: 'squash', amount: -0.1, dur: 0.2 },
      // 眼睛一亮，笑開跳起來（花在她舉起來的手上）
      { at: 2.0, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 2.0, actor: 'mom', do: 'hop', amount: 6, dur: 0.4 },
      { at: 2.0, actor: 'tulip', do: 'moveTo', to: { x: 68, y: 48 }, dur: 0.25, ease: 'out' },
      { at: 2.0, actor: 'tulip', do: 'hop', amount: 6, dur: 0.4 },
      { at: 2.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 2.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
      { at: 2.15, actor: 'dad', do: 'hop', amount: 3, dur: 0.3 },
      { at: 2.5, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.5, actor: 'tulip', do: 'hop', amount: 4, dur: 0.3 },
      // 把花插進包包
      { at: 2.85, actor: 'mom', do: 'flip' },
      { at: 2.85, actor: 'mom', do: 'swap', emoji: 'hero:three/reach' },
      { at: 2.9, actor: 'tulip', do: 'moveTo', to: TULIP_IN_BAG, arc: 4, dur: 0.4 },
      { at: 2.9, actor: 'tulip', do: 'scaleTo', amount: TULIP_BAG_S / TULIP_S, dur: 0.4 },
      // 摸摸頭
      { at: 3.4, actor: 'mom', do: 'flip' },
      { at: 3.45, actor: 'mom', do: 'moveTo', to: { x: 60, y: MG }, dur: 0.25 },
      { at: 3.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 3.65, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 3.9, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 4.15, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.2 },
      { at: 4.4, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 4.4, actor: 'mom', do: 'moveTo', to: { x: MOM_X, y: MG }, dur: 0.3 },
      { at: 4.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      { at: 4.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 4.8, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.05, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      { at: 5.3, actor: 'dad', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      { at: 0.2, kind: 'burst', actor: 'tulip', emoji: '✨', n: 7, dy: 4, dur: 0.6 },
      { at: 1.25, kind: 'blow', actor: 'tulip', target: 'mom', emoji: '〰️', n: 3, dur: 0.6 },
      { at: 2.0, kind: 'burst', actor: 'mom', emoji: '✨', n: 8, dur: 0.7 },
      { at: 2.3, kind: 'burst', actor: 'mom', emoji: '💗', n: 8, dy: -10, dur: 1.0 },
      { at: 3.3, kind: 'burst', actor: 'tulip', emoji: '✨', n: 5, dur: 0.5 },
      { at: 3.65, kind: 'pop', actor: 'yang', emoji: '😊', dx: 6, dur: 0.8 },
      { at: 4.8, kind: 'burst', actor: 'mom', emoji: '💕', n: 6, dy: -4, dur: 0.8 },
    ],
    camera: [START, release(0.3), holdWide(5.1, 0.6)],
    cues: [
      { at: 0.2, sfx: 'poof' },
      { at: 2.0, say: '媽媽聞到花，笑了！' },
      { at: 2.3, sfx: 'cheer' },
      { at: 3.65, sfx: 'tap' },
      { at: 3.9, sfx: 'tap' },
      { at: 4.15, sfx: 'tap' },
    ],
  }),

  // 有蛇！媽媽跳到爸爸的頭上！——他得意地送上一個禮物盒，盒子一開蛇跳出來吐舌頭；媽媽嚇得抱住自己，蹲一下「咻」地
  // 飛過他頭頂，落在爸爸頭上；爸爸被壓扁、扛著她東倒西歪，蛇溜到腳邊，媽媽尖叫，蛇反被嚇跑；他把空盒丟掉，
  // 媽媽跳下來，回到 W1
  'give:蛇': scene({
    duration: 7.4,
    bg: BG,
    actors: [
      ...room, bag,
      { id: 'box', emoji: 'prop:gift', x: 96, y: 62, size: 12, hidden: true, float: true },
      { id: 'snake', emoji: '🐍', x: 66, y: 66, size: 15, hidden: true },
      dad('smug'),
      yang('giggle'),
      mom('tired'),
    ],
    moves: [
      // 送上禮物盒
      { at: 0.1, actor: 'box', do: 'pop', dur: 0.2 },
      { at: 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
      { at: 0.15, actor: 'yang', do: 'moveTo', to: { x: 80, y: YG }, dur: 0.35 },
      { at: 0.15, actor: 'box', do: 'moveTo', to: { x: 66, y: 77 - 0.42 * 12 }, arc: 4, dur: 0.35 },
      { at: 0.5, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      // 蓋子一開，蛇跳出來
      { at: 0.8, actor: 'box', do: 'swap', emoji: 'prop:gift-open' },
      { at: 0.8, actor: 'snake', do: 'pop', dur: 0.1 },
      { at: 0.8, actor: 'snake', do: 'moveTo', to: { x: 66, y: 58 }, dur: 0.2, ease: 'out' },
      { at: 1.0, actor: 'snake', do: 'shake', amount: 1, dur: 0.5 },
      { at: 0.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
      // 嚇到
      { at: 0.9, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
      { at: 0.9, actor: 'mom', do: 'shake', amount: 2, dur: 0.45 },
      { at: 1.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      // 蹲一下……咻！飛過他頭頂，落在爸爸頭上
      { at: 1.35, actor: 'mom', do: 'squash', amount: 0.25, dur: 0.15 },
      { at: 1.5, actor: 'mom', do: 'swap', emoji: 'hero:three/jump' },
      { at: 1.5, actor: 'mom', do: 'moveTo', to: { x: DAD_X, y: 39 }, arc: 30, dur: 0.75, ease: 'linear' },
      { at: 1.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
      { at: 2.2, actor: 'dad', do: 'stretchTo', amount: 1.3, dur: 0.12 },
      { at: 2.25, actor: 'mom', do: 'swap', emoji: 'hero:three/scared' },
      { at: 2.25, actor: 'mom', do: 'shake', amount: 1.5, dur: 0.6 },
      // 扛著她東倒西歪
      { at: 2.7, actor: 'dad', do: 'moveTo', to: { x: 112, y: DG }, dur: 0.3 },
      { at: 2.7, actor: 'mom', do: 'moveTo', to: { x: 112, y: 39 }, dur: 0.3 },
      { at: 3.0, actor: 'dad', do: 'moveTo', to: { x: 126, y: DG }, dur: 0.35 },
      { at: 3.0, actor: 'mom', do: 'moveTo', to: { x: 126, y: 39 }, dur: 0.35 },
      { at: 3.35, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.3 },
      { at: 3.35, actor: 'mom', do: 'moveTo', to: { x: DAD_X, y: 39 }, dur: 0.3 },
      // 蛇溜下來吐舌頭，媽媽尖叫，蛇嚇跑
      { at: 1.6, actor: 'snake', do: 'moveTo', to: { x: 64, y: 77 - 0.42 * 15 }, arc: 6, dur: 0.35 },
      { at: 2.1, actor: 'snake', do: 'flip' },
      { at: 2.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 2.4, actor: 'snake', do: 'moveTo', to: { x: 100, y: 77 - 0.42 * 15 }, dur: 0.8 },
      { at: 2.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 2.55, actor: 'yang', do: 'hop', amount: 12, dur: 0.45 },
      { at: 3.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 3.3, actor: 'snake', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 3.75, actor: 'mom', do: 'squash', amount: -0.2, dur: 0.3 },
      { at: 3.75, actor: 'mom', do: 'shake', amount: 2.2, dur: 0.5 },
      { at: 3.85, actor: 'snake', do: 'hop', amount: 8, dur: 0.35 },
      { at: 4.2, actor: 'snake', do: 'flip' },
      { at: 4.25, actor: 'snake', do: 'moveTo', to: { x: -20, y: 77 - 0.42 * 15 }, dur: 0.7, ease: 'in' },
      { at: 4.95, actor: 'snake', do: 'vanish', dur: 0.05 },
      { at: 4.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      // 空盒丟掉
      { at: 4.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
      { at: 4.65, actor: 'box', do: 'moveTo', to: { x: -16, y: 14 }, arc: 14, dur: 0.6, ease: 'out' },
      { at: 4.65, actor: 'box', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
      { at: 5.25, actor: 'box', do: 'vanish', dur: 0.05 },
      // 媽媽跳下來，爸爸彈回來
      { at: 4.6, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 4.75, actor: 'mom', do: 'moveTo', to: { x: MOM_X, y: MG }, arc: 12, dur: 0.6 },
      { at: 4.75, actor: 'dad', do: 'stretchTo', amount: 1 / 1.3, dur: 0.5, ease: 'elastic' },
      { at: 4.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/dizzy' },
      { at: 5.0, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.4 },
      { at: 5.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 5.4, actor: 'mom', do: 'swap', emoji: 'hero:three/tired' },
      { at: 5.45, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.4 },
      { at: 5.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 5.9, actor: 'dad', do: 'squash', amount: -0.1, dur: 0.3 },
      { at: 5.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 6.3, actor: 'yang', do: 'shake', amount: 0.7, dur: 0.5 },
      { at: 6.6, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.4 },
      { at: 6.9, actor: 'dad', do: 'hop', amount: 2, dur: 0.25 },
    ],
    fx: [
      { at: 0.8, kind: 'burst', actor: 'box', emoji: '✨', n: 6, dy: 4, dur: 0.5 },
      { at: 0.9, kind: 'pop', actor: 'mom', emoji: '❗', dur: 0.5 },
      { at: 1.0, kind: 'sweat', actor: 'mom' },
      { at: 1.5, kind: 'puff', x: MOM_X, y: 72, dur: 0.4 },
      { at: 2.2, kind: 'burst', x: DAD_X, y: 50, n: 1, scale: 0.8, dur: 0.3 },
      { at: 2.3, kind: 'pop', actor: 'mom', emoji: '😱', dx: -14, dy: 10, dur: 1.2 },
      { at: 2.4, kind: 'sweat', actor: 'dad', dx: 10, dy: 14 },
      { at: 3.75, kind: 'burst', actor: 'mom', emoji: '💢', n: 5, dur: 0.5 },
      { at: 3.85, kind: 'pop', actor: 'snake', emoji: '❗', dur: 0.4 },
      { at: 4.25, kind: 'puff', actor: 'snake', dur: 0.4 },
      { at: 4.9, kind: 'dizzy', actor: 'dad', dur: 0.9 },
    ],
    camera: [START, release(0.3, 0.3), holdWide(1.3, 0.4), { at: 2.2, dur: 0.3, do: 'shake', amount: 1.4 }, { at: 5.35, dur: 0.25, do: 'shake', amount: 0.8 }],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 0.8, sfx: 'boing' },
      { at: 0.9, say: '有蛇！媽媽跳到爸爸的頭上！' },
      { at: 1.5, sfx: 'whoosh' },
      { at: 2.2, sfx: 'bonk' },
      { at: 3.75, sfx: 'rumble' },
      { at: 4.25, sfx: 'whoosh' },
      { at: 5.35, sfx: 'plop' },
    ],
  }),

  // 好冰！媽媽跳起來了！——爸爸偷笑拿出一塊冰，踮腳過去，從媽媽頭上丟進衣領；停一拍，媽媽變藍、跳到天花板，
  // 落地縮成一團發抖，冰塊從腳邊滑出去；她回頭瞪爸爸，爸爸轉身假裝吹口哨走回去。回到 W1
  'give:冰': scene({
    duration: 7.2,
    bg: BG,
    actors: [
      ...room, bag,
      mom('tired'),
      dad('smug'),
      yang('giggle'),
      { id: 'ice', emoji: 'prop:ice', x: 112, y: 63, size: 8, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.1, actor: 'ice', do: 'pop', dur: 0.25 },
      { at: 0.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/giggle' },
      { at: 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
      // 踮腳過去
      { at: 0.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/sneak' },
      { at: 0.65, actor: 'dad', do: 'moveTo', to: { x: 80, y: DG }, dur: 0.7 },
      { at: 0.65, actor: 'ice', do: 'moveTo', to: { x: 72, y: 63 }, dur: 0.7 },
      { at: 1.35, actor: 'yang', do: 'moveTo', to: { x: 103, y: YG }, dur: 0.3 },
      { at: 1.4, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
      { at: 1.4, actor: 'ice', do: 'moveTo', to: { x: 70, y: 52 }, dur: 0.1 },
      { at: 1.5, actor: 'ice', do: 'moveTo', to: { x: 48, y: 49 }, arc: 12, dur: 0.35 },
      { at: 1.85, actor: 'ice', do: 'scaleTo', amount: 0.3, dur: 0.1 },
      { at: 1.95, actor: 'ice', do: 'vanish', dur: 0.05 },
      { at: 1.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/giggle' },
      { at: 1.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      // 停一拍……變藍
      { at: 2.05, actor: 'mom', do: 'squash', amount: -0.08, dur: 0.2 },
      { at: 2.25, actor: 'mom', do: 'tint', filter: 'sepia(.5) saturate(1.8) hue-rotate(170deg)' },
      { at: 2.25, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 2.25, actor: 'mom', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: 2.4, actor: 'mom', do: 'tint', filter: BLUE },
      // 蹲一下……跳到天花板
      { at: 2.55, actor: 'mom', do: 'squash', amount: 0.3, dur: 0.15 },
      { at: 2.7, actor: 'mom', do: 'swap', emoji: 'hero:three/jump' },
      { at: 2.7, actor: 'mom', do: 'moveTo', to: { x: MOM_X, y: 24 }, dur: 0.4, ease: 'out' },
      { at: 2.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 2.75, actor: 'dad', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 3.1, actor: 'mom', do: 'shake', amount: 1.6, dur: 0.35 },
      { at: 3.45, actor: 'mom', do: 'moveTo', to: { x: MOM_X, y: MG }, dur: 0.35, ease: 'in' },
      // 落地發抖，冰塊從腳邊滑走
      { at: 3.8, actor: 'mom', do: 'swap', emoji: 'hero:three/cold' },
      { at: 3.85, actor: 'mom', do: 'shake', amount: 2.4, dur: 0.8 },
      { at: 3.8, actor: 'ice', do: 'pop', dur: 0.1 },
      { at: 3.8, actor: 'ice', do: 'moveTo', to: { x: 46, y: 72 }, dur: 0.01 },
      { at: 3.9, actor: 'ice', do: 'moveTo', to: { x: -16, y: 72 }, dur: 0.8, ease: 'in' },
      { at: 3.9, actor: 'ice', do: 'rotateTo', amount: -540, dur: 0.8 },
      { at: 4.7, actor: 'ice', do: 'vanish', dur: 0.05 },
      // 回頭瞪爸爸
      { at: 4.7, actor: 'mom', do: 'swap', emoji: 'hero:three/angry' },
      { at: 4.7, actor: 'mom', do: 'tint', filter: 'sepia(.4) saturate(1.5) hue-rotate(170deg)' },
      { at: 4.75, actor: 'mom', do: 'moveTo', to: { x: 60, y: MG }, dur: 0.2, ease: 'out' },
      { at: 5.0, actor: 'mom', do: 'tint', filter: '' },
      { at: 4.75, actor: 'dad', do: 'swap', emoji: 'hero:eric/scared' },
      // 爸爸轉身吹口哨，走回去
      { at: 5.1, actor: 'dad', do: 'flip' },
      { at: 5.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/blow' },
      { at: 5.2, actor: 'dad', do: 'moveTo', to: { x: DAD_X, y: DG }, dur: 0.8 },
      { at: 5.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
      { at: 6.0, actor: 'yang', do: 'moveTo', to: { x: YANG_X, y: YG }, dur: 0.35 },
      { at: 6.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
      { at: 5.6, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.3 },
      { at: 6.05, actor: 'dad', do: 'flip' },
      { at: 6.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 6.0, actor: 'mom', do: 'swap', emoji: 'hero:three/tired' },
      { at: 6.0, actor: 'mom', do: 'moveTo', to: { x: MOM_X, y: MG }, dur: 0.3 },
      { at: 6.5, actor: 'yang', do: 'shake', amount: 0.7, dur: 0.5 },
      { at: 6.6, actor: 'mom', do: 'squash', amount: 0.12, dur: 0.4 },
      { at: 6.8, actor: 'dad', do: 'hop', amount: 2, dur: 0.25 },
    ],
    fx: [
      { at: 0.1, kind: 'burst', actor: 'ice', emoji: '❄️', n: 6, dy: -2, dur: 0.6 },
      { at: 0.2, kind: 'pop', actor: 'dad', emoji: '😆', dx: 8, dur: 0.6 },
      { at: 1.8, kind: 'burst', x: 48, y: 48, emoji: '❄️', n: 5, scale: 0.8, dur: 0.5 },
      { at: 2.25, kind: 'pop', actor: 'mom', emoji: '❗', dur: 0.4 },
      { at: 2.7, kind: 'puff', x: MOM_X, y: 72, dur: 0.4 },
      { at: 2.7, kind: 'burst', actor: 'mom', emoji: '❄️', n: 8, dur: 0.6 },
      { at: 3.1, kind: 'pop', actor: 'mom', emoji: '🥶', dx: -14, dy: 8, dur: 0.7 },
      { at: 3.85, kind: 'burst', actor: 'mom', emoji: '❄️', n: 7, dy: 4, dur: 0.6 },
      { at: 4.75, kind: 'pop', actor: 'mom', emoji: '💢', dx: 6, dur: 0.7 },
      { at: 4.8, kind: 'sweat', actor: 'dad', dx: 4 },
      { at: 5.15, kind: 'blow', actor: 'dad', dx: 8, dy: 8, to: { x: 150, y: 30 }, emoji: '🎵', n: 3, dur: 0.8 },
      { at: 5.6, kind: 'blow', actor: 'dad', dx: 8, dy: 8, to: { x: 158, y: 28 }, emoji: '🎶', n: 3, dur: 0.7 },
    ],
    camera: [START, release(0.3), holdWide(2.4, 0.3), { at: 3.8, dur: 0.3, do: 'shake', amount: 1.2 }, release(4.4, 0.4), holdWide(6.3, 0.5)],
    cues: [
      { at: 0.1, sfx: 'poof' },
      { at: 1.45, sfx: 'slide' },
      { at: 2.15, say: '好冰！媽媽跳起來了！' },
      { at: 2.7, sfx: 'whoosh' },
      { at: 3.8, sfx: 'bonk' },
      { at: 3.9, sfx: 'slide' },
    ],
  }),

  // 媽媽想吃飯了。——肚子咕嚕叫兩聲，爸爸舉手、拍胸脯衝出去；楊捷睿開心地從媽媽頭上跳過去，媽媽走到中間，
  // 爸爸推著一張擺好大碗飯的桌子回來。結尾 W3
  eat: scene({
    duration: 6.0,
    bg: BG,
    actors: [
      ...room, bag, tulipInBag,
      mom('happy'),
      dad('happy'),
      { ...table, x: 200, hidden: true },
      { ...bowl, x: 200 + (BOWL.x - TABLE_X), hidden: true },
      yang('happy', 76),
    ],
    moves: [
      // 肚子咕嚕叫
      { at: 0.3, actor: 'mom', do: 'swap', emoji: 'hero:three/hungry' },
      { at: 0.3, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 0.3, actor: 'mom', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 1.0, actor: 'mom', do: 'squash', amount: 0.22, dur: 0.35 },
      { at: 1.0, actor: 'mom', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      // 爸爸：交給我！拍胸脯，衝出去
      { at: 1.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/know' },
      { at: 1.0, actor: 'dad', do: 'hop', amount: 4, dur: 0.3 },
      { at: 1.5, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 1.55, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.15 },
      { at: 1.75, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.15 },
      { at: 2.0, actor: 'dad', do: 'flip' },
      { at: 2.0, actor: 'dad', do: 'swap', emoji: 'hero:eric/dash' },
      { at: 2.05, actor: 'dad', do: 'moveTo', to: { x: 185, y: DG }, dur: 0.4, ease: 'in', anticipate: 3 },
      // 楊捷睿從媽媽頭上跳過去
      { at: 1.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
      { at: 1.9, actor: 'yang', do: 'flip' },
      { at: 1.95, actor: 'yang', do: 'moveTo', to: { x: W3_YANG, y: YG }, arc: 40, dur: 0.7 },
      { at: 2.65, actor: 'yang', do: 'flip' },
      { at: 2.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      // 媽媽走到中間
      { at: 2.7, actor: 'mom', do: 'moveTo', to: { x: W3_MOM, y: MG }, dur: 0.6 },
      // 推桌子回來
      { at: 2.6, actor: 'dad', do: 'flip' },
      { at: 2.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/push' },
      { at: 2.6, actor: 'dad', do: 'moveTo', to: { x: 230, y: DG }, dur: 0.01 },
      { at: 2.7, actor: 'dad', do: 'moveTo', to: { x: W3_DAD, y: DG }, dur: 0.9, ease: 'out' },
      { at: 2.6, actor: 'table', do: 'pop', dur: 0.01 },
      flatTableAt(2.62),
      { at: 2.6, actor: 'bowl', do: 'pop', dur: 0.01 },
      { at: 2.7, actor: 'table', do: 'moveTo', to: { x: TABLE_X, y: table.y }, dur: 0.9, ease: 'out' },
      { at: 2.7, actor: 'bowl', do: 'moveTo', to: BOWL, dur: 0.9, ease: 'out' },
      { at: 3.6, actor: 'bowl', do: 'hop', amount: 2, dur: 0.25 },
      // 看到飯
      { at: 3.75, actor: 'mom', do: 'swap', emoji: 'hero:three/drool' },
      { at: 3.75, actor: 'mom', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 4.05, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.15 },
      { at: 4.25, actor: 'dad', do: 'squash', amount: 0.12, dur: 0.15 },
      { at: 3.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/hungry' },
      { at: 4.6, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 5.0, actor: 'mom', do: 'hop', amount: 2, dur: 0.3 },
      { at: 5.4, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.3 },
    ],
    fx: [
      { at: 0.3, kind: 'burst', actor: 'mom', emoji: '〰️', n: 4, dy: 18, scale: 0.7, dur: 0.4 },
      { at: 1.0, kind: 'burst', actor: 'mom', emoji: '〰️', n: 6, dy: 18, dur: 0.5 },
      { at: 1.2, kind: 'bubble', actor: 'mom', emoji: '🍚', scale: 1.2, dur: 1.2 },
      { at: 1.05, kind: 'pop', actor: 'dad', emoji: '💪', dx: -10, dur: 0.9 },
      { at: 2.05, kind: 'puff', actor: 'dad', dur: 0.4 },
      { at: 2.65, kind: 'burst', actor: 'yang', emoji: '🎉', n: 5, dy: -4, dur: 0.6 },
      { at: 3.6, kind: 'puff', actor: 'dad', dur: 0.4 },
      { at: 3.65, kind: 'burst', actor: 'bowl', emoji: '✨', n: 6, dur: 0.6 },
      { at: 4.0, kind: 'pop', actor: 'dad', emoji: '😤', dx: 8, dur: 0.8 },
    ],
    camera: [START, release(0.3), holdWide(1.9, 0.4), release(4.0, 0.5), holdWide(5.3, 0.5)],
    cues: [
      { at: 0.3, sfx: 'rumble' },
      { at: 1.0, sfx: 'rumble' },
      { at: 0.75, say: '媽媽想吃飯了。' },
      { at: 2.05, sfx: 'whoosh' },
      { at: 2.7, sfx: 'slide' },
      { at: 3.6, sfx: 'clink' },
    ],
  }),

  // 好辣！爸爸的嘴裡有火！——辣椒掉進碗裡，媽媽吃一口，停一拍，臉紅冒火；她把整碗塞進爸爸嘴裡，爸爸臉也紅了，
  // 轉身噴出一大把火、跳來跳去，衝出畫面沖水，濕答答冒著煙走回來。開頭結尾都是 W3
  'dish:辣': scene({
    duration: 7.4,
    bg: BG,
    actors: [
      ...w3(),
      { id: 'chili', emoji: '🌶️', ...TOP, size: 9, hidden: true, float: true },
      { id: 'flame', emoji: '🔥', x: 131, y: 53, size: 12, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { ...flatTable },
      { at: 0.15, actor: 'chili', do: 'drop', dur: 0.4 },
      { at: 0.55, actor: 'bowl', do: 'hop', amount: 1.5, dur: 0.2 },
      { at: 0.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
      // 吃一口
      { at: 0.9, actor: 'mom', do: 'moveTo', to: { x: 80, y: MG }, dur: 0.25 },
      { at: 0.9, actor: 'mom', do: 'tilt', amount: 10, dur: 0.4 },
      { at: 1.1, actor: 'chili', do: 'vanish', dur: 0.1 },
      { at: 1.1, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 1.25, actor: 'mom', do: 'moveTo', to: { x: W3_MOM, y: MG }, dur: 0.2 },
      // 停一拍……臉紅冒火
      { at: 1.5, actor: 'mom', do: 'swap', emoji: 'hero:three/spicy' },
      { at: 1.5, actor: 'mom', do: 'hop', amount: 5, dur: 0.3 },
      { at: 1.55, actor: 'mom', do: 'shake', amount: 1.6, dur: 0.45 },
      { at: 1.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      // 整碗塞進爸爸嘴裡
      { at: 2.05, actor: 'mom', do: 'moveTo', to: { x: 82, y: MG }, dur: 0.2, ease: 'out' },
      { at: 2.05, actor: 'bowl', do: 'moveTo', to: { x: 106, y: 53 }, arc: 5, dur: 0.25, ease: 'in' },
      { at: 2.15, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 2.3, actor: 'bowl', do: 'rotateTo', amount: 70, dur: 0.15 },
      { at: 2.3, actor: 'dad', do: 'squash', amount: 0.2, dur: 0.2 },
      { at: 2.5, actor: 'dad', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 2.7, actor: 'bowl', do: 'rotateTo', amount: -70, dur: 0.2 },
      { at: 2.7, actor: 'bowl', do: 'moveTo', to: BOWL, arc: 4, dur: 0.3 },
      { at: 2.75, actor: 'mom', do: 'moveTo', to: { x: W3_MOM, y: MG }, dur: 0.3 },
      { at: 2.75, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      // 爸爸噴火
      { at: 2.7, actor: 'dad', do: 'swap', emoji: 'hero:eric/spicy' },
      { at: 2.7, actor: 'dad', do: 'shake', amount: 1.5, dur: 0.3 },
      { at: 3.0, actor: 'dad', do: 'flip' },
      { at: 3.0, actor: 'flame', do: 'rotateTo', amount: 90, dur: 0 },
      { at: 3.05, actor: 'flame', do: 'pop', dur: 0.15 },
      { at: 3.1, actor: 'flame', do: 'scaleTo', amount: 1.4, dur: 0.3, ease: 'back' },
      // 跳來跳去
      ...[[3.5, 104], [3.85, 124], [4.2, 108], [4.55, 122]].flatMap(([t, x]): Move[] => [
        { at: t, actor: 'dad', do: 'moveTo', to: { x, y: DG }, arc: 8, dur: 0.33 },
        { at: t, actor: 'flame', do: 'moveTo', to: { x: x + 15, y: 53 }, arc: 8, dur: 0.33 },
      ]),
      { at: 3.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
      { at: 3.5, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 4.2, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.6, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      // 衝出去沖水
      { at: 4.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/dash' },
      { at: 4.9, actor: 'dad', do: 'moveTo', to: { x: 190, y: DG }, dur: 0.35, ease: 'in' },
      { at: 4.9, actor: 'flame', do: 'moveTo', to: { x: 202, y: 52 }, dur: 0.35, ease: 'in' },
      { at: 5.25, actor: 'flame', do: 'vanish', dur: 0.05 },
      // 濕答答冒著煙走回來
      { at: 5.6, actor: 'dad', do: 'flip' },
      { at: 5.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/tired' },
      { at: 5.6, actor: 'dad', do: 'moveTo', to: { x: W3_DAD, y: DG }, dur: 0.6, ease: 'out' },
      { at: 6.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 6.3, actor: 'dad', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 6.1, actor: 'mom', do: 'swap', emoji: 'hero:three/drool' },
      { at: 6.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hungry' },
      { at: 6.7, actor: 'mom', do: 'hop', amount: 2, dur: 0.3 },
      { at: 6.9, actor: 'yang', do: 'hop', amount: 2, dur: 0.3 },
    ],
    fx: [
      { at: 0.55, kind: 'burst', actor: 'bowl', emoji: '🔥', n: 4, dy: 4, scale: 0.6, dur: 0.5 },
      { at: 1.5, kind: 'burst', actor: 'mom', emoji: '🔥', n: 6, dy: -6, dur: 0.6 },
      { at: 1.6, kind: 'puff', actor: 'mom', dy: 2, dur: 0.5 },
      { at: 2.3, kind: 'burst', x: 104, y: 50, emoji: '🍚', n: 5, scale: 0.6, dur: 0.4 },
      { at: 3.05, kind: 'blow', actor: 'dad', dx: 8, dy: 10, to: { x: 165, y: 44 }, emoji: '🔥', n: 4, scale: 1.4, dur: 0.6 },
      { at: 3.7, kind: 'blow', actor: 'dad', dx: 8, dy: 10, to: { x: 165, y: 30 }, emoji: '🔥', n: 4, scale: 1.4, dur: 0.6 },
      { at: 4.35, kind: 'blow', actor: 'dad', dx: 8, dy: 10, to: { x: 165, y: 44 }, emoji: '🔥', n: 4, scale: 1.4, dur: 0.5 },
      { at: 5.3, kind: 'burst', x: 154, y: 40, emoji: '💦', n: 10, scale: 1.6, dur: 0.6 },
      { at: 5.65, kind: 'puff', actor: 'dad', dy: -2, scale: 1.4, dur: 0.6 },
      { at: 5.8, kind: 'burst', actor: 'dad', emoji: '💧', n: 6, dy: -4, dur: 0.7 },
      { at: 6.3, kind: 'puff', actor: 'dad', dy: -2, dur: 0.5 },
      { at: 6.3, kind: 'sweat', actor: 'dad', dx: 4 },
    ],
    camera: [START, release(0.3), holdWide(2.9, 0.4), { at: 3.05, dur: 0.3, do: 'shake', amount: 1.2 }, holdWide(6.6, 0.01)],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 0.55, sfx: 'plop' },
      { at: 1.1, sfx: 'gulp' },
      { at: 1.5, say: '好辣！爸爸的嘴裡有火！' },
      { at: 2.3, sfx: 'gulp' },
      { at: 3.05, sfx: 'whoosh' },
      { at: 3.7, sfx: 'whoosh' },
      { at: 5.3, sfx: 'splash' },
    ],
  }),

  // 好苦！大家的臉都綠了！——青菜掉進碗裡，三支湯匙從碗裡飛到三個人嘴裡，一起吞下去；停一拍，三張臉一起慢慢變綠、
  // 整齊地抖兩下；兩個人瞪爸爸，爸爸把青菜丟出畫面，臉慢慢退回原色。開頭結尾都是 W3
  'dish:苦': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      ...w3(),
      { id: 'veg', emoji: '🥬', ...TOP, size: 9, hidden: true, float: true, pivot: 'center' },
      ...(['s1', 's2', 's3'] as const).map((id): Actor => ({ id, emoji: '🥄', x: BOWL.x, y: BOWL.y - 2, size: 9, hidden: true, float: true })),
    ],
    moves: (() => {
      const who = ['mom', 'yang', 'dad']
      const moves: Move[] = [
        { ...flatTable },
        { at: 0.15, actor: 'veg', do: 'drop', dur: 0.4 },
        { at: 0.55, actor: 'bowl', do: 'hop', amount: 1.5, dur: 0.2 },
        // 楊捷睿、爸爸靠過來
        { at: 0.6, actor: 'yang', do: 'moveTo', to: { x: 52, y: YG }, dur: 0.3 },
        { at: 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
        // 三支湯匙飛到三個人嘴裡
        ...(['s1', 's2', 's3'] as const).flatMap((s, i): Move[] => {
          const to = [{ x: 80, y: 55 }, { x: 58, y: 60 }, { x: 108, y: 54 }][i]
          return [
            { at: 0.9, actor: s, do: 'pop', dur: 0.1 },
            { at: 0.95, actor: s, do: 'moveTo', to, arc: 6, dur: 0.3 },
            { at: 1.25, actor: s, do: 'scaleTo', amount: 0.4, dur: 0.12 },
            { at: 1.35, actor: s, do: 'vanish', dur: 0.05 },
          ]
        }),
        { at: 1.25, actor: 'veg', do: 'scaleTo', amount: 0.75, dur: 0.1 },
        ...all(who, { at: 1.25, do: 'squash', amount: 0.15, dur: 0.2 }),
        // 停一拍……一起變綠
        { at: 1.6, actor: 'mom', do: 'swap', emoji: 'hero:three/sour' },
        { at: 1.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/sour' },
        { at: 1.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/sour' },
        ...GREEN.flatMap((filter, i) => all(who, { at: r2(1.7 + i * 0.3), do: 'tint', filter })),
        // 整齊地抖兩下
        ...all(who, { at: 2.6, do: 'shake', amount: 1.6, dur: 0.35 }),
        ...all(who, { at: 2.6, do: 'squash', amount: 0.12, dur: 0.35 }),
        ...all(who, { at: 3.15, do: 'shake', amount: 2, dur: 0.4 }),
        ...all(who, { at: 3.15, do: 'squash', amount: 0.15, dur: 0.4 }),
        // 瞪爸爸；爸爸把青菜丟出去
        { at: 3.7, actor: 'mom', do: 'swap', emoji: 'hero:three/angry' },
        { at: 3.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/angry' },
        { at: 3.75, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
        { at: 4.1, actor: 'dad', do: 'flip' },
        { at: 4.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/throw' },
        { at: 4.15, actor: 'veg', do: 'moveTo', to: { x: 176, y: 8 }, arc: 14, dur: 0.6, ease: 'out' },
        { at: 4.15, actor: 'veg', do: 'spin', times: 2, dur: 0.6 },
        { at: 4.75, actor: 'veg', do: 'vanish', dur: 0.05 },
        // 臉慢慢退回原色，回到 W3
        ...all(who, { at: 4.4, do: 'tint', filter: GREEN[1] }),
        ...all(who, { at: 4.7, do: 'tint', filter: GREEN[0] }),
        ...all(who, { at: 5.0, do: 'tint', filter: '' }),
        { at: 4.8, actor: 'dad', do: 'flip' },
        { at: 4.8, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
        { at: 4.8, actor: 'yang', do: 'moveTo', to: { x: W3_YANG, y: YG }, dur: 0.3 },
        { at: 5.1, actor: 'mom', do: 'swap', emoji: 'hero:three/drool' },
        { at: 5.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hungry' },
        { at: 5.5, actor: 'mom', do: 'hop', amount: 2, dur: 0.3 },
        { at: 5.8, actor: 'yang', do: 'hop', amount: 2, dur: 0.3 },
        { at: 6.1, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.3 },
      ]
      return moves
    })(),
    fx: [
      { at: 0.55, kind: 'burst', actor: 'veg', emoji: '✨', n: 5, dur: 0.5 },
      { at: 2.6, kind: 'burst', actor: 'mom', emoji: '💦', n: 5, dur: 0.5 },
      { at: 3.15, kind: 'burst', actor: 'mom', emoji: '💦', n: 6, scale: 1.2, dur: 0.5 },
      { at: 3.75, kind: 'pop', actor: 'mom', emoji: '💢', dx: 8, dur: 0.6 },
      { at: 3.8, kind: 'sweat', actor: 'dad', dx: 4 },
    ],
    camera: [START, release(0.3), holdWide(1.4, 0.4), release(3.5, 0.4), holdWide(5.6, 0.5)],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 0.55, sfx: 'plop' },
      { at: 1.25, sfx: 'gulp' },
      { at: 1.7, say: '好苦！大家的臉都綠了！' },
      { at: 2.6, sfx: 'deflate' },
      { at: 4.15, sfx: 'whoosh' },
    ],
  }),

  // 好甜！楊捷睿吃了好多！——蛋糕掉進碗裡，媽媽吃一口好開心；楊捷睿衝過來把整碗抱走，坐在旁邊狂吃，肚子越吃越大；
  // 爸爸媽媽看看他、再傻眼對看；他打一個大嗝縮回來，把空碗丟回桌上。開頭結尾都是 W3
  'dish:甜': scene({
    duration: 7.0,
    bg: BG,
    // 碗、蛋糕畫在他前面（他抱著碗吃）
    actors: [
      ...w3().filter((a) => a.id !== 'bowl'),
      bowl,
      { id: 'cake', emoji: '🍰', ...TOP, size: 9, hidden: true, float: true },
    ],
    moves: [
      { ...flatTable },
      { at: 0.15, actor: 'cake', do: 'drop', dur: 0.4 },
      { at: 0.55, actor: 'bowl', do: 'hop', amount: 1.5, dur: 0.2 },
      { at: 0.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/reach' },
      // 媽媽吃一口
      { at: 0.85, actor: 'mom', do: 'moveTo', to: { x: 80, y: MG }, dur: 0.25 },
      { at: 0.85, actor: 'mom', do: 'tilt', amount: 10, dur: 0.4 },
      { at: 1.05, actor: 'mom', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 1.05, actor: 'cake', do: 'scaleTo', amount: 0.8, dur: 0.1 },
      { at: 1.2, actor: 'mom', do: 'moveTo', to: { x: W3_MOM, y: MG }, dur: 0.2 },
      { at: 1.3, actor: 'mom', do: 'swap', emoji: 'hero:three/happy' },
      { at: 1.3, actor: 'mom', do: 'hop', amount: 4, dur: 0.3 },
      { at: 1.35, actor: 'dad', do: 'swap', emoji: 'hero:eric/happy' },
      // 楊捷睿衝過來，整碗抱走
      { at: 1.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
      { at: 1.5, actor: 'yang', do: 'moveTo', to: { x: 94, y: YG }, dur: 0.35, ease: 'in' },
      { at: 1.9, actor: 'yang', do: 'flip' },
      { at: 1.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
      { at: 1.95, actor: 'yang', do: 'moveTo', to: { x: 34, y: YG }, dur: 0.5, ease: 'inOut' },
      { at: 1.95, actor: 'bowl', do: 'moveTo', to: EAT_BOWL, dur: 0.5, ease: 'inOut' },
      { at: 1.95, actor: 'cake', do: 'moveTo', to: { x: EAT_BOWL.x, y: EAT_BOWL.y - 4 }, dur: 0.5, ease: 'inOut' },
      { at: 2.45, actor: 'yang', do: 'flip' },
      // 狂吃：一口一口，肚子越來越大
      ...[2.6, 2.85, 3.1, 3.35, 3.6].flatMap((t, i): Move[] => [
        { at: t, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.18 },
        { at: t, actor: 'bowl', do: 'shake', amount: 0.6, dur: 0.18 },
        ...(i < 3 ? [{ at: t, actor: 'cake', do: 'scaleTo', amount: 0.75, dur: 0.08 } as Move] : []),
        ...(i % 2 === 0 ? [
          { at: t, actor: 'yang', do: 'stretchTo', amount: FAT, dur: 0.15 } as Move,
          { at: t, actor: 'yang', do: 'scaleTo', amount: GROW, dur: 0.15 } as Move,
        ] : []),
      ]),
      { at: 3.35, actor: 'cake', do: 'vanish', dur: 0.1 },
      // 吃撐了坐下來
      { at: 3.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/full' },
      { at: 3.9, actor: 'bowl', do: 'moveTo', to: { x: 22, y: 77 - 0.42 * BOWL_S }, dur: 0.25 },
      // 爸爸媽媽：看他，再傻眼對看
      { at: 2.0, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      { at: 2.0, actor: 'mom', do: 'flip' },
      { at: 2.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      { at: 2.1, actor: 'mom', do: 'hop', amount: 3, dur: 0.25 },
      // 媽媽伸手想拿回碗，他轉身護住
      { at: 2.3, actor: 'mom', do: 'swap', emoji: 'hero:three/reach' },
      { at: 2.3, actor: 'mom', do: 'moveTo', to: { x: 62, y: MG }, dur: 0.3 },
      { at: 2.55, actor: 'yang', do: 'flip' },
      { at: 2.55, actor: 'bowl', do: 'moveTo', to: { x: EAT_BOWL_L.x, y: EAT_BOWL_L.y }, dur: 0.15 },
      { at: 2.55, actor: 'cake', do: 'moveTo', to: { x: EAT_BOWL_L.x, y: EAT_BOWL_L.y - 4 }, dur: 0.15 },
      { at: 2.75, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
      // 爸爸探頭看；兩個對看搖頭
      { at: 2.3, actor: 'dad', do: 'swap', emoji: 'hero:eric/listen' },
      { at: 2.3, actor: 'dad', do: 'moveTo', to: { x: 104, y: DG }, dur: 0.3 },
      { at: 2.9, actor: 'mom', do: 'flip' },
      { at: 2.9, actor: 'dad', do: 'swap', emoji: 'hero:eric/surprised' },
      ...all(['mom', 'dad'], { at: 2.95, do: 'tilt', amount: -8, dur: 0.2 }),
      ...all(['mom', 'dad'], { at: 3.15, do: 'tilt', amount: 8, dur: 0.2 }),
      // 他越吃越大：兩個一起往後縮一步、再一步
      { at: 3.1, actor: 'mom', do: 'moveTo', to: { x: 68, y: MG }, dur: 0.25, ease: 'out' },
      { at: 3.1, actor: 'dad', do: 'moveTo', to: { x: 110, y: DG }, dur: 0.25, ease: 'out' },
      { at: 3.6, actor: 'mom', do: 'moveTo', to: { x: W3_MOM, y: MG }, dur: 0.25, ease: 'out' },
      { at: 3.6, actor: 'dad', do: 'moveTo', to: { x: W3_DAD, y: DG }, dur: 0.25, ease: 'out' },
      ...all(['mom', 'dad'], { at: 3.6, do: 'squash', amount: 0.12, dur: 0.25 }),
      { at: 4.1, actor: 'mom', do: 'flip' },
      { at: 4.15, actor: 'mom', do: 'hop', amount: 3, dur: 0.25 },
      { at: 4.3, actor: 'dad', do: 'hop', amount: 3, dur: 0.25 },
      { at: 4.55, actor: 'mom', do: 'flip' },
      { at: 4.6, actor: 'dad', do: 'shake', amount: 0.8, dur: 0.3 },
      // 轉回來對著媽媽打嗝
      { at: 4.55, actor: 'yang', do: 'flip' },
      // 一個大嗝，縮回來
      { at: 4.6, actor: 'yang', do: 'squash', amount: -0.15, dur: 0.3 },
      { at: 4.9, actor: 'yang', do: 'stretchTo', amount: 1 / FAT ** 3, dur: 0.4, ease: 'elastic' },
      { at: 4.9, actor: 'yang', do: 'scaleTo', amount: 1 / GROW ** 3, dur: 0.4, ease: 'elastic' },
      { at: 4.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 4.9, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      { at: 4.95, actor: 'mom', do: 'swap', emoji: 'hero:three/laugh' },
      { at: 4.95, actor: 'dad', do: 'swap', emoji: 'hero:eric/laugh' },
      // 空碗丟回桌上
      { at: 5.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/throw' },
      { at: 5.45, actor: 'bowl', do: 'moveTo', to: BOWL, arc: 18, dur: 0.6 },
      { at: 5.45, actor: 'bowl', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
      { at: 5.5, actor: 'yang', do: 'moveTo', to: { x: W3_YANG, y: YG }, dur: 0.4 },
      { at: 6.05, actor: 'bowl', do: 'hop', amount: 1.5, dur: 0.2 },
      { at: 6.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/hungry' },
      { at: 6.05, actor: 'mom', do: 'swap', emoji: 'hero:three/drool' },
      { at: 6.05, actor: 'dad', do: 'swap', emoji: 'hero:eric/smug' },
      { at: 6.5, actor: 'mom', do: 'hop', amount: 2, dur: 0.3 },
      { at: 6.7, actor: 'dad', do: 'squash', amount: 0.08, dur: 0.25 },
    ],
    fx: [
      { at: 0.55, kind: 'burst', actor: 'cake', emoji: '✨', n: 6, dur: 0.6 },
      { at: 1.3, kind: 'burst', actor: 'mom', emoji: '💗', n: 6, dy: -4, dur: 0.8 },
      ...[2.6, 2.85, 3.1, 3.35, 3.6].map((t): Fx => ({ at: t, kind: 'burst', x: t < 2.6 ? EAT_BOWL.x : EAT_BOWL_L.x, y: EAT_BOWL.y - 4, emoji: '🍚', n: 4, scale: 0.6, dur: 0.3 })),
      { at: 2.15, kind: 'pop', actor: 'mom', emoji: '❗', dur: 0.5 },
      { at: 3.7, kind: 'pop', actor: 'mom', emoji: '😳', dx: 10, scale: 1.4, dur: 0.9 },
      { at: 3.7, kind: 'pop', actor: 'dad', emoji: '😳', dx: -4, scale: 1.4, dur: 0.9 },
      { at: 4.0, kind: 'burst', actor: 'yang', emoji: '⭐', n: 5, dur: 0.6 },
      { at: 4.9, kind: 'blow', actor: 'yang', dx: 6, dy: 8, to: { x: 70, y: 40 }, n: 4, scale: 1.6, dur: 0.6 },
    ],
    camera: [START, release(0.3), holdWide(1.4, 0.4), release(4.2, 0.4), holdWide(5.3, 0.5)],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 0.55, sfx: 'plop' },
      { at: 1.05, sfx: 'gulp' },
      { at: 1.3, say: '好甜！楊捷睿吃了好多！' },
      { at: 2.6, sfx: 'gulp' },
      { at: 3.1, sfx: 'gulp' },
      { at: 3.6, sfx: 'gulp' },
      { at: 4.9, sfx: 'hic' },
      { at: 5.0, sfx: 'deflate' },
      { at: 6.05, sfx: 'clink' },
    ],
  }),

  // 大家一起抱抱媽媽。——爸爸把桌子連碗往後拖出畫面，媽媽站在空地上張開手；楊捷睿先衝過來抱住她的腰，
  // 爸爸從右邊衝回來抱住她的肩膀，擠兩下、愛心爆出來。媽媽閉眼笑，睡著了，頭慢慢靠到爸爸肩上；
  // 楊捷睿抬頭看她偷笑「噓」，爸爸輕輕拍她的背，三個人一起慢慢左右搖，💤 一顆一顆冒
  hug: scene({
    duration: 7.4,
    bg: BG,
    actors: [
      ...room, bag, tulipInBag,
      dad('smug', W3_DAD),
      mom('drool', W3_MOM),
      table, bowl,
      yang('hungry', W3_YANG, { flip: true }),
      { id: 'pat', emoji: '🫳', x: 73, y: 46, size: 8, hidden: true, float: true },
    ],
    moves: (() => {
      const H_MOM = W3_MOM, H_YANG = 63, H_DAD = 93
      const sway: Move[] = [[4.0, -5, 0.9], [4.9, 5, 0.9], [5.8, -5, 0.9], [6.7, 4, 0.7]]
        .flatMap(([at, amount, dur]) => all(['mom', 'yang', 'dad', 'pat'], { at, do: 'tilt', amount, dur }))
      const moves: Move[] = [
        { ...flatTable },
        // 爸爸把桌子連碗往後拖出畫面
        { at: 0.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/pull' },
        { at: 0.2, actor: 'dad', do: 'moveTo', to: { x: 230, y: DG }, dur: 0.9, ease: 'in' },
        { at: 0.2, actor: 'table', do: 'moveTo', to: { x: 230 - (W3_DAD - TABLE_X), y: table.y }, dur: 0.9, ease: 'in' },
        { at: 0.2, actor: 'bowl', do: 'moveTo', to: { x: 230 - (W3_DAD - BOWL.x), y: BOWL.y }, dur: 0.9, ease: 'in' },
        { at: 1.15, actor: 'table', do: 'vanish', dur: 0.01 },
        { at: 1.15, actor: 'bowl', do: 'vanish', dur: 0.01 },
        // 媽媽站在空地上張開手
        { at: 0.3, actor: 'mom', do: 'swap', emoji: 'hero:three/surprised' },
        { at: 0.85, actor: 'mom', do: 'swap', emoji: 'hero:three/hug' },
        { at: 0.85, actor: 'mom', do: 'hop', amount: 3, dur: 0.25 },
        // 楊捷睿衝過來抱腰
        { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
        { at: 0.55, actor: 'yang', do: 'moveTo', to: { x: H_YANG, y: YG }, dur: 0.45, ease: 'in', anticipate: 4 },
        { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
        { at: 1.0, actor: 'mom', do: 'squash', amount: 0.1, dur: 0.2 },
        // 爸爸從右邊衝回來抱肩膀
        { at: 1.1, actor: 'dad', do: 'swap', emoji: 'hero:eric/dash' },
        { at: 1.15, actor: 'dad', do: 'moveTo', to: { x: H_DAD, y: DG }, dur: 0.45, ease: 'in' },
        { at: 1.6, actor: 'dad', do: 'swap', emoji: 'hero:eric/hug' },
        // 擠兩下
        ...all(['mom', 'yang', 'dad'], { at: 1.65, do: 'squash', amount: 0.15, dur: 0.25 }),
        ...all(['mom', 'yang', 'dad'], { at: 2.15, do: 'squash', amount: 0.2, dur: 0.3 }),
        { at: 2.15, actor: 'yang', do: 'moveTo', to: { x: H_YANG + 1.5, y: YG }, dur: 0.3 },
        { at: 2.15, actor: 'dad', do: 'moveTo', to: { x: H_DAD - 1.5, y: DG }, dur: 0.3 },
        // 閉眼笑……睡著了，頭慢慢靠到爸爸肩上
        { at: 2.6, actor: 'mom', do: 'swap', emoji: 'hero:three/smug' },
        { at: 2.7, actor: 'mom', do: 'squash', amount: 0.08, dur: 0.4 },
        { at: 3.2, actor: 'mom', do: 'swap', emoji: 'hero:three/doze' },
        { at: 3.25, actor: 'mom', do: 'rotateTo', amount: 8, dur: 1.2 },
        // 楊捷睿抬頭看她，偷笑「噓」
        { at: 3.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
        { at: 3.35, actor: 'yang', do: 'tilt', amount: -8, dur: 0.6 },
        // 爸爸輕輕拍她的背
        { at: 3.6, actor: 'pat', do: 'pop', dur: 0.2 },
        ...[3.9, 4.35, 4.8, 5.25, 5.7].flatMap((at): Move[] => [
          { at, actor: 'pat', do: 'hop', amount: -2, dur: 0.25 },
          { at, actor: 'mom', do: 'squash', amount: 0.03, dur: 0.25 },
        ]),
        { at: 6.1, actor: 'pat', do: 'vanish', dur: 0.2 },
        // 三個人一起慢慢左右搖
        ...sway,
      ]
      return moves
    })(),
    fx: [
      { at: 1.65, kind: 'burst', x: 76, y: 32, emoji: '💗', n: 8, dur: 1.0 },
      { at: 2.15, kind: 'burst', x: 76, y: 30, emoji: '💕', n: 10, scale: 1.3, dur: 1.1 },
      { at: 2.7, kind: 'pop', actor: 'mom', emoji: '🥰', dx: -12, dur: 0.6 },
      { at: 3.5, kind: 'pop', actor: 'yang', emoji: '🤫', dx: -9, dur: 1.2 },
      ...[3.4, 4.3, 5.2, 6.1].map((at): Fx => ({ at, kind: 'zzz', actor: 'mom', emoji: '💤', dx: -10, dur: 1.2 })),
      { at: 5.0, kind: 'burst', x: 104, y: 30, emoji: '💗', n: 5, dur: 1.0 },
      { at: 6.5, kind: 'burst', x: 104, y: 30, emoji: '💕', n: 5, dur: 0.9 },
    ],
    camera: [START, release(0.3), { at: 2.0, dur: 0.8, do: 'zoom', amount: 1.35, to: { x: 77, y: 50 } }],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 1.0, say: '大家一起抱抱媽媽。' },
      { at: 1.65, sfx: 'boing' },
      { at: 2.15, sfx: 'cheer' },
      ...[3.9, 4.35, 4.8, 5.25, 5.7].map((at): Cue => ({ at, sfx: 'tap' })),
    ],
  }),
}

export default scenes
