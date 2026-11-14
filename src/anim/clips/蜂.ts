import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 蜂（v2）：豬探長拿放大鏡「調查」掛在樹枝上的大蜂窩——每次放大鏡一戳，蜜蜂就生氣地（尾針翹起來）嗡地飛出來、繞到他背後，
// 對準屁股「咻——啾」！他嚇得跳起來，一次比一次高，螫他的蜜蜂也一次比一次多：一隻（虫從蜜蜂身上彈出來）、三隻排一排（夆的上半 夂）、
// 先停一拍（他回頭看後面：沒有！放心地再戳）一整群排成箭頭，把他螫上天（夆的下半 丰），掉下來剛好坐進水桶。
// 回馬槍：屁股泡在水桶裡，蜜蜂螫不到了！他坐著水桶跳過去再戳，整群「叮」地撞在水桶上彈開——他得意地站起來扭屁股，屁股一離開水桶，「啾」！螫得最高，連水桶都踢飛。
// 最後畫面暗下來只剩「蜂」，豬探長從天上掉到前面、轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「蜂！」，然後退場只留字。
// 蜂、蜂、蜜蜂、這是什麼字？、蜂
const P = 66.9 // 豬探長（size 24）站在地上的 y
/** 大蜂窩（prop:hive，樹枝在圖的最上面）：畫面上最大的東西，掛在右邊（左緣約 x 111，國字 home 時不擋字） */
const HIVE = 44
const HX = 131, HY = 38
/** 蜂窩的洞口（圖上 0.45、0.615 的地方）：蜜蜂從這裡進出 */
const HOLE = { x: HX - 0.05 * HIVE, y: HY - 0.58 * HIVE + 0.615 * HIVE }
/** 豬探長每次都站在同一個地方，放大鏡湊到蜂窩底下 */
const LOOK = 108
/** 水桶（prop:bucket）：一開始放在左邊 */
const BUCKET = 18
const BX = 34
const BY = 77 - 0.42 * BUCKET
/** 坐在水桶裡：腳和屁股都泡在水桶裡（水桶畫在他前面） */
const PB = P - 8
/** 在水桶裡站起來：屁股露出桶緣 */
const PUP = PB - 7
/** 帶頭的蜜蜂（size 16）與其他蜜蜂（size 12）；尾針尖在蜜蜂（沒翻、面向左）右下方 0.34 × size */
const LEAD = 16
const BEE = 12
const TIP = 0.34 * LEAD
/** 帶頭那隻螫到他屁股時的位置：他面向右邊，屁股在他左邊 */
const butt = (y: number) => ({ x: LOOK - 7 - TIP, y: y + 2 - TIP })
/** 蜜蜂的隊形（跟著帶頭那隻）：一隻 → 三隻排一排 → 一整群排成箭頭（箭頭尖對著他的屁股） */
const SWARM = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']
const OFF: Record<string, [number, number]> = {
  b1: [0, 0], b2: [-8, -5], b3: [-8, 4], b4: [-16, -7], b5: [-16, 3], b6: [-24, -9], b7: [-24, 1],
}
/** 對準以後停多久（預備：屁股翹著、抖一抖） */
const AIM = 0.2
/** 被螫到以後傻眼停多久 */
const HOLD = 0.45

const at2 = (p: { x: number; y: number }, id: string) => ({ x: p.x + OFF[id][0], y: p.y + OFF[id][1] })

/** 蜜蜂從洞口嗡地鑽出來（生氣、尾針翹起），繞過他頭上飛到背後對準 */
function emerge(t: number, ids: string[], aim: { x: number; y: number }): Move[] {
  return ids.flatMap((id, i): Move[] => [
    { at: t - 0.02, actor: id, do: 'moveTo', to: HOLE, dur: 0.01 },
    { at: t, actor: id, do: 'swap', emoji: 'prop:bee-sting' },
    { at: t + 0.02 * i, actor: id, do: 'pop', dur: 0.15 },
    { at: t + 0.08 + 0.02 * i, actor: id, do: 'moveTo', to: at2(aim, id), arc: 5, dur: 0.36 - 0.02 * i, ease: 'inOut' },
  ])
}
/** 對準（停一下、抖一抖）→「咻」地往前一刺，尾針剛好碰到 hit */
function charge(at: number, ids: string[], hit: { x: number; y: number }): Move[] {
  return ids.flatMap((id): Move[] => [
    { at: at - 0.12 - AIM, actor: id, do: 'shake', amount: 0.6, dur: AIM },
    { at: at - 0.12, actor: id, do: 'moveTo', to: at2(hit, id), dur: 0.12, anticipate: 2, ease: 'in' },
  ])
}
/** 螫完：咧嘴笑（換回平常的蜜蜂），飛回洞口鑽進去 */
function retreat(t: number, ids: string[]): Move[] {
  return ids.flatMap((id, i): Move[] => [
    { at: t, actor: id, do: 'swap', emoji: 'prop:bee' },
    { at: t + 0.15 + 0.03 * i, actor: id, do: 'moveTo', to: HOLE, arc: 6, dur: 0.4, ease: 'inOut' },
    { at: t + 0.55 + 0.03 * i, actor: id, do: 'vanish', dur: 0.1 },
  ])
}

/**
 * 「咻——啾」：蜜蜂從洞口飛出來繞到他背後、對準屁股停一下（預備）→ 咻地一刺 → 那一刻 💥＋鏡頭推近＋震＋同一個音效，
 * 他嚇得跳起來（jump）。k 是第幾次（越後面越大）：跳的高度、💥、震動、蜜蜂數都一次比一次大。
 * y 是他那時候站的高度（坐在水桶裡站起來時比較高）。
 */
function sting(at: number, k: number, ids: string[], y = P, emergeToo = true) {
  const hit = butt(y)
  // 從後下方對準（站高的第 4 次不從上面來，整群才不會飛到國字前面）
  const aim = { x: hit.x - 10, y: hit.y + (y < P ? 3 : -4) }
  const moves: Move[] = [
    ...(emergeToo ? emerge(at - 0.12 - AIM - 0.46, ids, aim) : ids.map((id): Move => ({ at: at - 0.12 - AIM - 0.1, actor: id, do: 'moveTo', to: at2(aim, id), dur: 0.1 }))),
    ...charge(at, ids, hit),
    // 啾！嚇得跳起來
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    ...retreat(at + 0.15, ids),
  ]
  const fx: Fx[] = [
    // 💥 在他屁股上，一次比一次大
    { at, kind: 'burst', x: LOOK - 8, y: y + 1, n: 1, dur: 0.4, scale: 1.4 + 0.4 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: LOOK - 6, y: y - 6 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效（咻——啾），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.12, sfx: 'whoosh' }, { at, sfx: 'blip' }, { at: at + 0.03, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'tap' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 拿放大鏡湊近、往蜂窩戳一下：蜂窩一晃（同一個「叩」） */
function poke(t: number, k: number): { moves: Move[]; cues: Cue[] } {
  return {
    moves: [
      { at: t, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
      { at: t, actor: 'pig', do: 'tilt', amount: 9, dur: 0.25 },
      { at: t + 0.1, actor: 'hive', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.3 },
    ],
    cues: [{ at: t + 0.1, sfx: 'tap' }],
  }
}

/** 落地傻眼：停 HOLD 秒、冒汗 */
function land(t: number): Move[] {
  return [{ at: t, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' }]
}

// ---------- 時間 ----------
const H1 = 1.85, H2 = 3.6, H3 = 6.25, CLINK = 10.0, H4 = 10.55

// 開場：一隻蜜蜂在蜂窩旁邊嗡嗡飛，豬探長走進來，抬頭看字框（蜂！），拿出放大鏡走到蜂窩底下
const intro: Move[] = [
  { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
  { at: 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
  { at: 0, actor: 'b1', do: 'moveTo', to: { x: 104, y: 52 }, arc: 5, dur: 0.4 },
  { at: 0.4, actor: 'b1', do: 'moveTo', to: { x: 116, y: 62 }, arc: -4, dur: 0.3 },
  // 他走過來，蜜蜂鑽回蜂窩裡
  { at: 0.75, actor: 'b1', do: 'moveTo', to: HOLE, arc: 5, dur: 0.3 },
  { at: 1.05, actor: 'b1', do: 'vanish', dur: 0.1 },
  { at: 0.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
  { at: 0.8, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: P }, dur: 0.3 },
]
// 第 1 次：一隻
const p1 = poke(1.1, 0)
const s1 = sting(H1, 0, ['b1'])
const after1: Move[] = [
  { at: H1, actor: 'pig', do: 'hop', amount: 12, dur: 0.5 },
  ...land(H1 + 0.5),
]
// 第 2 次：拍拍灰、得意地再戳——三隻排一排
const p2 = poke(2.9, 1)
const s2 = sting(H2, 1, ['b1', 'b2', 'b3'])
const after2: Move[] = [
  { at: 2.62, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
  { at: H2, actor: 'pig', do: 'hop', amount: 24, dur: 0.6 },
  ...land(H2 + 0.6),
]
// 第 3 次前停一拍：他回頭看後面——什麼都沒有，放心地再戳……蜂窩抖得厲害，一整群排成箭頭
const p3 = poke(5.35, 2)
const s3 = sting(H3, 2, SWARM)
const pause3: Move[] = [
  { at: 4.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/back' },
  { at: 4.65, actor: 'pig', do: 'flip' },
  { at: 5.1, actor: 'pig', do: 'flip' },
  { at: 5.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
  { at: 5.2, actor: 'hive', do: 'shake', amount: 0.6, dur: 0.6 },
]
// 被螫上天（鏡頭不跟），過一會兒才掉下來——剛好一屁股坐進水桶
const after3: Move[] = [
  { at: H3, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: -45 }, dur: 0.35, ease: 'out' },
  { at: H3, actor: 'pig', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
  { at: 7.15, actor: 'pig', do: 'moveTo', to: { x: BX, y: -45 }, dur: 0.01 },
  { at: 7.2, actor: 'pig', do: 'moveTo', to: { x: BX, y: PB }, dur: 0.3, ease: 'in' },
  { at: 7.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
  { at: 7.5, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
]
// 語詞那一刻：國字讓回上方，帶頭的蜜蜂嗡地飛到畫面正中間、變大（蜜蜂）
const MID = { x: 80, y: 62 }
const BIG = 2
const word: Move[] = [
  { at: 7.83, actor: 'b1', do: 'moveTo', to: HOLE, dur: 0.01 },
  { at: 7.85, actor: 'b1', do: 'swap', emoji: 'prop:bee' },
  { at: 7.85, actor: 'b1', do: 'pop', dur: 0.15 },
  { at: 8.05, actor: 'b1', do: 'moveTo', to: MID, dur: 0.35, ease: 'out' },
  { at: 8.15, actor: 'b1', do: 'scaleTo', amount: BIG, dur: 0.3, ease: 'back' },
  { at: 8.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
  { at: 8.4, actor: 'b1', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
  // 蜜蜂飛回去；豬探長想到了：屁股泡在水桶裡就螫不到！
  { at: 8.65, actor: 'b1', do: 'scaleTo', amount: 1 / BIG, dur: 0.3 },
  { at: 8.65, actor: 'b1', do: 'moveTo', to: HOLE, arc: 6, dur: 0.35 },
  { at: 9.0, actor: 'b1', do: 'vanish', dur: 0.1 },
  { at: 8.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
  // 坐著水桶一跳一跳過去
  { at: 8.85, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: PB }, dur: 0.45, ease: 'linear' },
  { at: 8.85, actor: 'bucket', do: 'moveTo', to: { x: LOOK, y: BY }, dur: 0.45, ease: 'linear' },
  ...[8.85, 9.0, 9.15].flatMap((at): Move[] => [
    { at, actor: 'pig', do: 'hop', amount: 4, dur: 0.15 },
    { at, actor: 'bucket', do: 'hop', amount: 4, dur: 0.15 },
  ]),
]
// 回馬槍（第 4 次）：再戳——整群衝過來，「叮」地撞在水桶上彈開！
const p4 = poke(9.3, 2)
const clinkHit = { x: LOOK - 8.5 - TIP, y: BY - 2 - TIP }
const clinkAim = { x: clinkHit.x - 10, y: clinkHit.y - 4 }
const clink: Move[] = [
  ...emerge(CLINK - 0.12 - AIM - 0.46, SWARM, clinkAim),
  ...charge(CLINK, SWARM, clinkHit),
  // 彈開、頭暈轉一圈
  ...SWARM.flatMap((id, i): Move[] => [
    { at: CLINK, actor: id, do: 'moveTo', to: at2({ x: clinkHit.x - 12, y: clinkHit.y }, id), dur: 0.2, ease: 'out' },
    { at: CLINK + 0.01 * i, actor: id, do: 'spin', times: 1, dur: 0.25, pivot: 'center' },
  ]),
  { at: CLINK, actor: 'bucket', do: 'shake', amount: 1, dur: 0.2 },
  // 他得意地站起來扭屁股——屁股離開水桶了
  { at: CLINK + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/giggle' },
  { at: CLINK + 0.15, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: PUP }, dur: 0.12, ease: 'out' },
  { at: CLINK + 0.27, actor: 'pig', do: 'tilt', amount: -8, dur: 0.11 },
  { at: CLINK + 0.38, actor: 'pig', do: 'tilt', amount: 8, dur: 0.1 },
]
const s4 = sting(H4, 3, SWARM, PUP, false)
const after4: Move[] = [
  { at: H4, actor: 'pig', do: 'moveTo', to: { x: LOOK, y: -50 }, dur: 0.3, ease: 'out' },
  { at: H4, actor: 'pig', do: 'spin', times: 2, dur: 0.3, pivot: 'center' },
  // 水桶被他一蹬，翻著飛出畫面
  { at: H4 + 0.02, actor: 'bucket', do: 'moveTo', to: { x: 185, y: 40 }, arc: 14, dur: 0.45, ease: 'out' },
  { at: H4 + 0.02, actor: 'bucket', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
]
// 問他：豬探長從天上掉到左前方、變大，面向右邊的字
const ASK = 10.85
const askMoves: Move[] = [
  { at: 11.45, actor: 'hive', do: 'vanish', dur: 0.3 },
  { at: 10.95, actor: 'pig', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
  { at: 10.95, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.01 },
  { at: 11.0, actor: 'pig', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
  { at: 11.25, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.25 },
  { at: 11.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
  // 安靜等他回答：手放耳邊、身體前傾聽（listen），點兩下頭
  { at: 12.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
  { at: 12.1, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
  { at: 12.65, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
  { at: 13.1, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
  // 回答：跳起來指著字
  { at: 13.55, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
  { at: 13.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
  { at: 13.55, actor: 'pig', do: 'hop', amount: 8, dur: 0.3 },
  // 退場，畫面只留下字
  { at: 13.72, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  { at: 13.75, actor: 'pig', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.2, ease: 'in' },
]

/** 蜜蜂翅膀嗡嗡嗡：飛著的時候一直上下小抖 */
const buzz: Move[] = SWARM.flatMap((id) => {
  const ms: Move[] = []
  for (let at = 0; at < 11.3; at += 0.16) ms.push({ at: +at.toFixed(2), actor: id, do: 'hop', amount: 0.9, dur: 0.16 })
  return ms
})

const clip: Clip = {
  format: 2,
  char: '蜂',
  meta: { theme: '豬探長拿放大鏡調查大蜂窩', cast: '豬探長＋蜜蜂（一隻到一群）＋蜂窩＋水桶', gags: ['豬探長每次拿放大鏡戳蜂窩，生氣的蜜蜂就繞到他背後對準屁股咻——啾，他嚇得跳起來，一次比一次高、蜜蜂一次比一次多（一隻、三隻、一整群排成箭頭）；回馬槍是他坐進水桶，蜜蜂叮地撞在桶上彈開，他得意地站起來扭屁股，屁股一離開水桶就被螫得最高'] },
  duration: 15,
  bg: { top: '#FFF1C9', bottom: '#FFFBEF', floor: '#BFE09A', scenery: 'forest' },
  actors: [
    { id: 'hive', emoji: 'prop:hive', x: HX, y: HY, size: HIVE, float: true },
    // 姿勢圖朝左，翻過來面向右邊的蜂窩（屁股在左邊，蜜蜂從左邊螫）；問他時也面向右邊的字
    { id: 'pig', emoji: 'hero:pig/idle', x: 60, y: P, size: 24, hidden: true, flip: true },
    // 水桶畫在他前面：坐進去時腳和屁股泡在桶裡
    { id: 'bucket', emoji: 'prop:bucket', x: BX, y: BY, size: BUCKET },
    // 蜜蜂：面向左，尾針在右下；從他左邊（背後）倒退著螫他的屁股
    { id: 'b1', emoji: 'prop:bee', x: 118, y: 44, size: LEAD, float: true },
    ...SWARM.slice(1).map((id) => ({ id, emoji: 'prop:bee', x: HOLE.x, y: HOLE.y, size: BEE, float: true, hidden: true })),
  ],
  moves: [
    ...buzz,
    ...intro,
    ...p1.moves, ...s1.moves, ...after1,
    ...after2, ...p2.moves, ...s2.moves,
    ...pause3, ...p3.moves, ...s3.moves, ...after3,
    ...word,
    ...p4.moves, ...clink, ...s4.moves, ...after4,
    ...askMoves,
  ],
  builds: [
    // 第 1 次：從螫他的那隻蜜蜂身上彈出來——虫
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'b1', color: partColor('虫') },
    // 第 2 次：尖針「啾」那一下彈出來——夆的上半 夂
    { at: H2 + 0.05, dur: 0.6, strokes: [6, 7, 8], from: 'b1', color: partColor('夆') },
    // 第 3 次：整群一起螫——夆的下半 丰
    { at: H3 + 0.05, dur: 0.6, strokes: [9, 10, 11, 12], from: 'b1', color: partColor('夆') },
  ],
  glyph: [
    { at: 6.95, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.85, dur: 0.45, do: 'park' },
    { at: ASK, dur: 3.1, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.95, dur: 0.4, do: 'home' },
    { at: 13.55, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    { at: H1 + 0.55, kind: 'sweat', actor: 'pig' },
    ...s2.fx,
    { at: H2 + 0.65, kind: 'sweat', actor: 'pig' },
    // 第 3 次前停一拍：回頭看後面
    { at: 4.75, kind: 'pop', actor: 'pig', emoji: '❓', dx: -12, dur: 0.4, scale: 1.3 },
    ...s3.fx,
    { at: H3, kind: 'burst', x: LOOK - 8, y: P, emoji: '⭐', n: 6, dur: 0.4 },
    // 一屁股坐進水桶：水花
    { at: 7.5, kind: 'fountain', actor: 'bucket', dur: 0.5 },
    { at: 7.55, kind: 'dizzy', actor: 'pig', dur: 0.4 },
    { at: 8.35, kind: 'burst', actor: 'b1', emoji: '✨', n: 6, dur: 0.5 },
    // 叮！撞在水桶上
    { at: CLINK, kind: 'burst', x: clinkHit.x + 4, y: clinkHit.y + 4, emoji: '⭐', n: 5, dur: 0.35, scale: 1.2 },
    ...s4.fx,
    { at: H4, kind: 'burst', x: LOOK - 8, y: PUP, emoji: '⭐', n: 8, dur: 0.4 },
    { at: H4 + 0.02, kind: 'fountain', x: LOOK, y: BY - 6, dur: 0.45 },
    { at: 13.55, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 自動取景會推近到他、把右邊的蜂窩和左邊（背後）的蜜蜂切掉——劇本自己「推近」一點點（幾乎全景），整個蜂窩、蜜蜂、他飛上天都在畫面裡
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: CLINK, dur: 0.2, do: 'shake', amount: 0.6 },
    ...s4.camera,
    { at: ASK, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次被螫白光一閃，一次比一次亮
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.2 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 6.95, dur: 0.05, level: -0.35 },
    { at: 7.0, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '蜂' },
    ...p1.cues, ...s1.cues,
    ...p2.cues, ...s2.cues,
    ...p3.cues, ...s3.cues,
    { at: 7.05, say: '蜂' },
    { at: 7.5, sfx: 'splash' },
    { at: 8.3, say: '蜜蜂' },
    ...p4.cues,
    { at: CLINK, sfx: 'clink' },
    ...s4.cues,
    { at: 11.05, say: FIXED_LINES.clipAsk },
    { at: 13.55, say: '蜂' },
    { at: 13.6, sfx: 'cheer' },
  ],
}

export default clip
