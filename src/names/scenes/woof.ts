// 演的是字面意思：汪汪（狗叫聲）＋隊（一隊、排隊）——三隻狗排成一隊，輪流站到最前面對著樹「汪！」，要把卡在樹上的球叫下來，個子越小叫聲反而越大（狗身上什麼都不戴：沒有徽章、制服、帽子、背包、車子、瞭望塔、口號）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：三隻狗從大到小輪流對著同一棵樹「汪！」，個子越小，叫聲反而越大。
// 一隊排好，站在最前面的那隻做同一個動作（往前一步、吸氣鼓起來、汪、一圈一圈的橘色聲波打出去）、同一聲「汪」，
// 叫完走到隊伍最後面、大家往前遞補一格，換下一隻。三次只有聲波和結果越來越大：
// 大狗叫——樹上只飄下一片葉子；中狗叫——掉下幾片、球晃一下還是卡著；
// 第三次前停一拍：最小的白色小小狗站到最前面，吸氣吸好久好久，身體越鼓越大，後面兩個隊友嚇得發抖——
// 反轉：那一聲「汪！！！」超大的聲波往四面八方打出去，整個樹冠連葉子被吹飛，後面兩個隊友被震得趴扁，
// 球掉下來滾到小小狗腳邊，他叼起球；隊友爬起來站到他兩邊看著他：「汪汪隊」。
// 不演把動物嚇跑（被叫的是東西）、不行軍不撲、不吹房子、沒有人被甩上天。

// ── 站位 ──
const gy = (size: number) => 77 - 0.42 * size // 站在地上的 y
/** 引擎自動放大（castScale）：18 以下放大三成，34 以上不動 */
const cast = (size: number) => size * (1 + 0.3 * Math.min(1, Math.max(0, (34 - size) / 16)))
const S = { big: 38, mid: 26, tiny: 14 } as const // 畫面上約 38／30／18
type Id = keyof typeof S
const Y = { big: gy(S.big), mid: gy(S.mid), tiny: gy(S.tiny) }
const FRONT = 104 // 隊伍最前面（每次都在這裡叫）
const STEP = 5 // 叫之前往前一步
/** 每一輪的隊伍（都朝右看著樹）：最前面的叫完走到最後面，其他往前遞補 */
const Q = [
  { big: FRONT, mid: 66, tiny: 40 },
  { mid: FRONT, tiny: 74, big: 44 },
  { tiny: FRONT, big: 72, mid: 46 },
] as const
const RING = '#FF8C1A' // 聲波的顏色（藍天、綠草上都看得清楚）
/** 狗朝右站在 x、畫面大小 rs（含放大倍率）時嘴巴的位置（量過：🐕 鼻子在圖的左緣、頭的高度約在 0.39） */
const mouth = (x: number, rs: number) => ({ x: x + 0.38 * rs, y: 77 - 0.42 * rs - 0.11 * rs })
// 毛色分開：大狗原色金黃、中狗染成巧克力色、小小狗染成白色（只染毛色，不戴任何東西）
const TINT = {
  mid: 'sepia(0.4) saturate(1.5) hue-rotate(-12deg) brightness(0.62) contrast(1.25)',
  tiny: 'grayscale(1) brightness(1.2) contrast(1.05)',
}

// 樹（prop:tree size 64）：樹冠是上面 0.62、樹幹是下面；上下兩截疊在一起就是整棵。
const TREE = { x: 148, size: 64 }
const TY = gy(TREE.size)
const CUT = 0.62
const BALL = { x: 141, y: 40, size: 10 } // 卡在樹冠裡的球
const BG = gy(BALL.size) // 球掉到地上

/** 聲波：以嘴巴為中心、一圈一圈往外的「)」弧（swoosh 不動的上下兩半拼成），一圈比一圈晚一點出來 */
function rings(at: number, c: { x: number; y: number }, radii: number[], width: number, dur: number, both = false): Fx[] {
  const fx: Fx[] = []
  radii.forEach((r, i) => {
    const t = at + i * 0.06
    const w = width * (1 - 0.25 * (i / Math.max(1, radii.length - 1)))
    for (const side of both ? [1, -1] : [1]) {
      const to = { x: c.x + side * 200, y: c.y }
      for (const low of [false, true]) {
        fx.push({ at: t, dur, kind: 'swoosh', x: c.x, y: c.y, to, n: r, sweep: -25, low, width: w, color: RING })
      }
    }
  })
  return fx
}

/**
 * 主軸笑點的那一下（站在隊伍最前面）：往前一步 → 吸氣鼓起來 → 「汪！」頭往前一甩、聲波打出去。
 * k 是第幾次（0 大狗、1 中狗、2 小小狗）；b 是叫出來那一刻；inhale 是吸氣吸多久（第三次特別久）；puff 是鼓到多大。
 */
function bark(id: Id, b: number, k: number, inhale: number, puff: number) {
  const x = FRONT + STEP
  const m = mouth(x, cast(S[id]) * puff)
  const moves: Move[] = [
    { at: b - inhale - 0.25, dur: 0.22, actor: id, do: 'moveTo', to: { x, y: Y[id] }, ease: 'out' },
    { at: b - inhale, dur: inhale, actor: id, do: 'scaleTo', amount: puff, ease: 'out' },
    { at: b, dur: 0.12, actor: id, do: 'scaleTo', amount: 1 / puff, ease: 'out' },
    { at: b, dur: 0.3, actor: id, do: 'squash', amount: -0.12 - 0.06 * k },
    { at: b, dur: 0.3, actor: id, do: 'tilt', amount: -8 - 4 * k },
  ]
  const radii = [[5, 9, 13], [5, 10, 15, 20, 25], [6, 13, 21, 31, 43, 57, 74, 94]][k]
  const fx: Fx[] = rings(b, m, radii, [2.0, 2.6, 4.4][k], [0.4, 0.5, 0.7][k], k >= 2)
  const camera: Camera[] = [
    { at: b, dur: 0.4, do: 'punch', amount: 0.05 + 0.04 * k, to: m },
    { at: b, dur: 0.25 + 0.15 * k, do: 'shake', amount: 0.4 + 0.8 * k },
  ]
  // 同一聲「汪」（blip），一次比一次多疊一個聲音
  const cues: Cue[] = [{ at: b, sfx: 'blip' }]
  if (k >= 1) cues.push({ at: b + 0.04, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: b + 0.06, sfx: 'rumble' }, { at: b + 0.12, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/** 換下一隻：最前面那隻走到隊伍最後面（從大家後面繞過去），其他往前遞補一格 */
function shuffle(at: number, r: 1 | 2): Move[] {
  const q = Q[r]
  return (Object.keys(q) as Id[]).map((id) => ({ at, dur: 0.55, actor: id, do: 'moveTo' as const, to: { x: q[id], y: Y[id] }, ease: 'inOut' as const }))
}

/** 一片葉子從樹冠邊上飄下來：照著幾個點左右擺著落下（每段一樣長） */
function leaf(id: string, at: number, path: { x: number; y: number }[], dur: number): Move[] {
  const seg = dur / path.length
  const moves: Move[] = [{ at, actor: id, do: 'pop', dur: 0.1 }]
  path.forEach((to, i) => {
    moves.push({ at: at + i * seg, dur: seg, actor: id, do: 'moveTo', to, ease: 'inOut' })
    moves.push({ at: at + i * seg, dur: seg, actor: id, do: 'rotateTo', amount: i % 2 ? 50 : -50 })
  })
  return moves
}
const LG = gy(10) // 葉子落在地上的 y
// 大狗的鼻子（站在最前面往前一步時）：第一片葉子剛好落在這裡
const NOSE = mouth(FRONT + STEP, S.big)

// ── 時間表 ──
const KICK = 0.1 // 球從左邊飛進來
const STUCK = 0.8 // 卡進樹冠
const B1 = 1.9
const SH1 = 3.05 // 大狗走到最後面、中狗遞補
const B2 = 4.15
const SH2 = 5.3 // 中狗走到最後面、小小狗站到最前面
const INHALE = 1.4 // 小小狗吸氣吸好久
const B3 = SH2 + 0.6 + 0.25 + INHALE
const d1 = bark('big', B1, 0, 0.3, 1.1)
const d2 = bark('mid', B2, 1, 0.3, 1.12)
const d3 = bark('tiny', B3, 2, INHALE, 1.5)
const DROP = B3 + 0.5 // 樹冠飛走，球在半空停一下才掉
const LAND = DROP + 0.35
const ROLL = LAND + 0.25
const FEET = { x: FRONT + STEP + 9, y: BG } // 滾到小小狗腳邊
const PICK = ROLL + 0.55 // 叼起來
const UP = PICK + 0.2 // 隊友爬起來
const POSE = UP + 0.75 // 亮相
// 亮相的站位：小小狗在中間（叼著球），大狗在左、中狗跳過他到右邊
const P = { big: 44, tiny: 80, mid: 116 }
/** 叼著的球：嘴巴前面、低一點 */
const held = (x: number, k = 1) => {
  const rs = cast(S.tiny) * k, m = mouth(x, rs)
  return { x: m.x + 0.1 * rs, y: m.y + 0.16 * rs }
}

export default scene({
  duration: POSE + 1.6,
  bg: { top: '#7FCBEB', bottom: '#E6F6EE', floor: '#86C76A', scenery: 'hills' },
  actors: [
    // 雨後放晴的河堤草地：彩虹、小花
    { id: 'rainbow', emoji: '🌈', x: 30, y: 16, size: 20, float: true },
    { id: 'flower1', emoji: '🌼', x: 16, y: gy(9), size: 9 },
    { id: 'flower2', emoji: '🌼', x: 88, y: gy(7), size: 7 },
    { id: 'trunk', emoji: 'prop:tree', x: TREE.x, y: TY, size: TREE.size, half: 'bottom', cut: CUT },
    { id: 'crown', emoji: 'prop:tree', x: TREE.x, y: TY, size: TREE.size, half: 'top', cut: CUT, pivot: 'center' },
    { id: 'l1', emoji: '🍃', x: 119, y: 42, size: 10, hidden: true, pivot: 'center' },
    { id: 'l2', emoji: '🍃', x: 120, y: 38, size: 10, hidden: true, pivot: 'center' },
    { id: 'l3', emoji: '🍃', x: 121, y: 48, size: 10, hidden: true, pivot: 'center' },
    { id: 'l4', emoji: '🍃', x: 130, y: 30, size: 10, hidden: true, pivot: 'center' },
    { id: 'ball', emoji: '⚽', x: -10, y: 30, size: BALL.size, pivot: 'center' },
    // 走到隊伍後面的那隻要從大家背後繞過去：大的畫在最底下
    { id: 'big', emoji: '🐕', x: Q[0].big, y: Y.big, size: S.big, flip: true },
    { id: 'mid', emoji: '🐕', x: Q[0].mid, y: Y.mid, size: S.mid, flip: true, tint: TINT.mid },
    { id: 'tiny', emoji: '🐕', x: Q[0].tiny, y: Y.tiny, size: S.tiny, flip: true, tint: TINT.tiny },
  ],
  moves: [
    // 開場：球從左邊飛過來，一隊狗追著跑進來排好，球「噗」卡進樹冠
    { at: KICK, dur: STUCK - KICK, actor: 'ball', do: 'moveTo', to: { x: BALL.x, y: BALL.y }, arc: 14, ease: 'out' },
    { at: KICK, dur: STUCK - KICK, actor: 'ball', do: 'rotateTo', amount: 540 },
    { at: 0, dur: 0.8, actor: 'big', do: 'enter', from: { x: Q[0].big - 90, y: Y.big }, ease: 'linear' },
    { at: 0, dur: 0.75, actor: 'mid', do: 'enter', from: { x: Q[0].mid - 80, y: Y.mid }, ease: 'linear' },
    { at: 0, dur: 0.7, actor: 'tiny', do: 'enter', from: { x: Q[0].tiny - 60, y: Y.tiny }, ease: 'linear' },
    { at: STUCK, dur: 0.4, actor: 'crown', do: 'shake', amount: 0.8 },
    // 抬頭看：球卡住了，三隻一起跳一下
    { at: 1.0, dur: 0.3, actor: 'big', do: 'hop', amount: 2.5 },
    { at: 1.05, dur: 0.3, actor: 'mid', do: 'hop', amount: 2.5 },
    { at: 1.1, dur: 0.3, actor: 'tiny', do: 'hop', amount: 2.5 },

    // 第一次：大狗汪——只飄下一片葉子
    ...d1.moves,
    { at: B1 + 0.05, dur: 0.35, actor: 'crown', do: 'shake', amount: 0.3 },
    ...leaf('l1', B1 + 0.15, [{ x: 110, y: 46 }, { x: 118, y: 50 }, { x: NOSE.x, y: NOSE.y - 2 }], 0.9),
    // 葉子停在鼻子上，大狗歪頭看；換人時葉子滑下來
    { at: SH1, dur: 0.3, actor: 'l1', do: 'moveTo', to: { x: NOSE.x - 2, y: LG }, ease: 'in' },
    { at: B1 + 0.6, dur: 0.4, actor: 'big', do: 'tilt', amount: 10 },
    ...shuffle(SH1, 1),

    // 第二次：中狗汪——掉下幾片、球晃一下還是卡著
    ...d2.moves,
    { at: B2 + 0.05, dur: 0.5, actor: 'crown', do: 'shake', amount: 0.8 },
    { at: B2 + 0.05, dur: 0.5, actor: 'ball', do: 'shake', amount: 0.8 },
    ...leaf('l2', B2 + 0.12, [{ x: 108, y: 44 }, { x: 114, y: 54 }, { x: 104, y: LG }], 1.0),
    ...leaf('l3', B2 + 0.2, [{ x: 112, y: 52 }, { x: 120, y: 60 }, { x: 116, y: LG }], 0.9),
    ...leaf('l4', B2 + 0.28, [{ x: 116, y: 30 }, { x: 108, y: 40 }, { x: 96, y: LG }], 1.0),
    { at: B2 + 0.6, dur: 0.4, actor: 'mid', do: 'tilt', amount: 10 },
    ...shuffle(SH2, 2),

    // 第三次前停一拍：小小狗往前一步，吸氣吸好久，身體越鼓越大；後面兩個隊友嚇得往後縮、發抖
    ...d3.moves,
    { at: B3 - 1.1, dur: 1.0, actor: 'tiny', do: 'shake', amount: 0.5 },
    { at: B3 - 0.9, dur: 0.3, actor: 'big', do: 'moveTo', to: { x: Q[2].big - 8, y: Y.big }, ease: 'out' },
    { at: B3 - 0.9, dur: 0.3, actor: 'mid', do: 'moveTo', to: { x: Q[2].mid - 6, y: Y.mid }, ease: 'out' },
    { at: B3 - 0.6, dur: 0.55, actor: 'big', do: 'shake', amount: 0.4 },
    { at: B3 - 0.6, dur: 0.55, actor: 'mid', do: 'shake', amount: 0.4 },

    // 汪！！！整個樹冠被吹飛、隊友被震得趴扁
    { at: B3 + 0.04, dur: 0.8, actor: 'crown', do: 'moveTo', to: { x: 215, y: 8 }, ease: 'out' },
    { at: B3 + 0.04, dur: 0.8, actor: 'crown', do: 'rotateTo', amount: 60, ease: 'out' },
    { at: B3 + 0.06, dur: 0.1, actor: 'big', do: 'stretchTo', amount: 1.55, ease: 'out' },
    { at: B3 + 0.1, dur: 0.1, actor: 'mid', do: 'stretchTo', amount: 1.55, ease: 'out' },
    // 球沒地方卡了：在半空停一下、掉下來、彈一下、滾到小小狗腳邊
    { at: DROP, dur: LAND - DROP, actor: 'ball', do: 'moveTo', to: { x: BALL.x - 3, y: BG }, ease: 'in' },
    { at: LAND, dur: 0.25, actor: 'ball', do: 'hop', amount: 5 },
    { at: ROLL, dur: 0.5, actor: 'ball', do: 'moveTo', to: FEET, ease: 'out' },
    { at: ROLL, dur: 0.5, actor: 'ball', do: 'rotateTo', amount: -400, ease: 'out' },
    // 小小狗叼起球
    { at: PICK, dur: 0.2, actor: 'tiny', do: 'squash', amount: 0.2 },
    { at: PICK + 0.1, dur: 0.2, actor: 'ball', do: 'moveTo', to: held(FRONT + STEP), ease: 'out' },
    { at: PICK + 0.1, dur: 0.01, actor: 'ball', do: 'scaleTo', amount: 0.55 },
    // 隊友爬起來；中狗跳過小小狗到右邊，小小狗叼著球走到中間
    { at: UP, dur: 0.15, actor: 'big', do: 'stretchTo', amount: 1 / 1.55, ease: 'back' },
    { at: UP + 0.05, dur: 0.15, actor: 'mid', do: 'stretchTo', amount: 1 / 1.55, ease: 'back' },
    { at: UP + 0.15, dur: 0.45, actor: 'big', do: 'moveTo', to: { x: P.big, y: Y.big }, ease: 'out' },
    { at: UP + 0.2, dur: 0.55, actor: 'mid', do: 'moveTo', to: { x: P.mid, y: Y.mid }, arc: 18, ease: 'out' },
    { at: UP + 0.75, actor: 'mid', do: 'flip' },
    { at: UP + 0.15, dur: 0.45, actor: 'tiny', do: 'moveTo', to: { x: P.tiny, y: Y.tiny }, ease: 'inOut' },
    { at: UP + 0.15, dur: 0.45, actor: 'ball', do: 'moveTo', to: held(P.tiny), ease: 'inOut' },
    // 亮相：隊友跳一下，小小狗挺胸變大
    { at: POSE, dur: 0.3, actor: 'big', do: 'hop', amount: 3 },
    { at: POSE, dur: 0.3, actor: 'mid', do: 'hop', amount: 3 },
    { at: POSE, dur: 0.3, actor: 'tiny', do: 'scaleTo', amount: 1.6, ease: 'back' },
    { at: POSE, dur: 0.3, actor: 'ball', do: 'moveTo', to: held(P.tiny, 1.6), ease: 'back' },
    { at: POSE, dur: 0.3, actor: 'ball', do: 'scaleTo', amount: 1.6, ease: 'back' },
  ],
  fx: [
    ...d1.fx,
    ...d2.fx,
    { at: B2 + 0.1, kind: 'burst', x: 132, y: 34, emoji: '🍃', n: 5, dur: 0.6, scale: 1.2 },
    { at: B2 + 0.6, kind: 'sweat', actor: 'mid' },
    // 吸氣：一串 💨 從前面被吸進嘴巴
    { at: B3 - 1.3, dur: 0.6, kind: 'blow', x: 140, y: 52, to: held(FRONT + STEP, 1.2), n: 4 },
    { at: B3 - 0.7, dur: 0.6, kind: 'blow', x: 142, y: 48, to: held(FRONT + STEP, 1.4), n: 5, scale: 1.2 },
    ...d3.fx,
    // 那一聲：葉子整片噴開、💥
    { at: B3 + 0.05, kind: 'burst', x: 140, y: 34, emoji: '🍃', n: 12, dur: 0.8, scale: 2.2 },
    { at: B3 + 0.05, kind: 'burst', x: 134, y: 38, n: 1, dur: 0.45, scale: 1.8 },
    { at: B3 + 0.2, kind: 'dizzy', actor: 'big', dur: 1.3 },
    { at: B3 + 0.25, kind: 'dizzy', actor: 'mid', dur: 1.3 },
    { at: LAND, kind: 'puff', actor: 'ball', dur: 0.4 },
    { at: POSE, kind: 'burst', actor: 'tiny', emoji: '✨', n: 8, dy: -12, dur: 0.9, scale: 1.3 },
    { at: POSE + 0.3, kind: 'burst', actor: 'tiny', emoji: '🎉', n: 7, dy: -14, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 開場就定好構圖：一隊狗、樹和卡住的球都在畫面裡；前兩次叫都是同一個鏡位
    { at: -0.3, dur: 0, do: 'zoom', amount: 1.15, to: { x: 92, y: 60 } },
    { at: 1.3, dur: 0.4, do: 'zoom', amount: 1.28, to: { x: 104, y: 58 } },
    ...d1.camera,
    ...d2.camera,
    // 停一拍：推近吸氣的小小狗
    { at: B3 - 1.45, dur: 0.8, do: 'zoom', amount: 2.0, to: { x: 116, y: 66 } },
    // 汪！拉回全景看聲波和樹冠飛走
    { at: B3, dur: 0.15, do: 'zoom', amount: 1.0 },
    ...d3.camera,
    { at: LAND, dur: 0.5, do: 'zoom', amount: 1.2, to: { x: 80, y: 66 } },
    // 亮相
    { at: POSE - 0.3, dur: 0.5, do: 'zoom', amount: 1.6, to: { x: 80, y: 64 } },
  ],
  lights: [
    { at: B3 - 1.4, dur: 1.3, level: 0.15 },
    { at: B3, dur: 0.05, level: -0.25 },
    { at: B3 + 0.05, dur: 0.35, level: 0 },
    { at: POSE, dur: 0.05, level: -0.2 },
    { at: POSE + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: KICK, sfx: 'whoosh' },
    { at: STUCK, sfx: 'plop' },
    ...d1.cues,
    { at: B1 + 0.3, sfx: 'slide' },
    { at: SH1, sfx: 'tap' },
    ...d2.cues,
    { at: SH2, sfx: 'tap' },
    { at: B3 - 1.3, sfx: 'bubble' },
    ...d3.cues,
    { at: LAND, sfx: 'bonk' },
    { at: PICK, sfx: 'tap' },
    { at: POSE + 0.1, say: '汪汪隊' },
    { at: POSE + 0.4, sfx: 'cheer' },
  ],
})
