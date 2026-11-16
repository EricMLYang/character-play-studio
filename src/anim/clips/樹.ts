import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 樹（v2）：樹上住了好多住戶。兔子女孩每次站在同一個地方、敲敲大樹的樹幹「叩、叩、叩」——
// 樹冠就「啵」地探出一個住戶、瞪她一眼，一次比一次大，樹被擠得一次比一次歪，她一次比一次嚇得慘：
// 鸚鵡（她嚇得往後一跳；樹幹飛出木）→ 松鼠（嚇得一屁股跌坐；被敲響的樹冠震出壴）→
// 先停一拍：她爬起來看看歪掉的樹、托著下巴想、冒汗，慢慢伸手再敲……貓頭鷹！（嚇得整個人往後摔扁；她敲樹的那隻手飛出寸）。
// 住戶各佔樹冠一個位置：鸚鵡在左上、松鼠在右邊、貓頭鷹在樹頂。字拼好放大時，大樹（連住戶）縮到字的右邊讓位。
// 語詞：國字讓回左上，樹回到中間站直、抖一抖樹冠，她指著它：「大樹」。
// 回馬槍（第四次）：她也想住進去！蹲低、「蹦」地跳進樹冠——樹太擠了，整棵被她壓得往左彎下去，停一拍，
// 「啪！」像彈弓一樣彈回來，把大家（鸚鵡、松鼠、貓頭鷹、她自己）全部彈上天。
// 最後畫面暗下來只剩「樹」，她從天上掉回來，問「這是什麼字？」，手放耳邊等他回答，再指著字說「樹！」，然後退場只留字。
// 刻意不跟「林」（撞樹）、「森」（澆水長大頂飛）、「果」（蘋果長大壓人）、「楊」（楊桃砸頭）、「昨」（芽長成樹）、「風」（抱樹被吹成旗子）、
// 「猴」「燕」「熊」「高」「矮」撞：這支只演「敲樹幹 → 樹冠裡探出住戶」，也不拿樹根、樹枝當主軸（之後有「根」「枝」）。
// 樹、樹、大樹、這是什麼字？、樹

/** 兔子女孩（size 34）：每次站在同一個地方、面向右邊的樹（圖朝左，要 flip） */
const SB = 34
const PB = 77 - 0.42 * SB
const X0 = 76
/** 大樹（prop:tree）：畫面中間偏右、比她大得多；字框搬到左上，不站在字框後面 */
const TX = 104
const TS = 62
const TY = 77 - 0.42 * TS
/** 字框一開始就在左上（素色的天空） */
const FRAME = { x: 26, y: 20 }
const FRAME_K = 0.45

/**
 * 樹的圖上一點（u、v 是 0～1，v 往下）：樹往右歪 deg 度、縮成 s 倍、站在 x 時在舞台上的位置。
 * 樹加了 float（側歪時不會被引擎抬離地面），旋轉的支點就是腳底 (x, TY + 0.42 × TS)。
 */
function treePt(u: number, v: number, deg = 0, s = 1, x = TX): Vec {
  const base = TY + 0.42 * TS
  const lx = (u - 0.5) * TS * s
  const ly = (v - 0.5 - 0.42) * TS * s
  const r = (deg * Math.PI) / 180
  return { x: x + lx * Math.cos(r) - ly * Math.sin(r), y: base + lx * Math.sin(r) + ly * Math.cos(r) }
}

/** 三個住戶：一次比一次大，各佔樹冠一個位置（鸚鵡左上、松鼠右邊、貓頭鷹樹頂）。y 是牠的中心 */
const RES = [
  { id: 'bird', emoji: '🦜', size: 12, u: 0.2, v: 0.17 },
  { id: 'squirrel', emoji: '🐿️', size: 15, u: 0.81, v: 0.27 },
  { id: 'owl', emoji: '🦉', size: 19, u: 0.53, v: 0.07 },
] as const
/** 每來一個住戶，樹就再往右歪一點（累計的角度） */
const LEAN = [5, 11, 18]
/** 住戶藏在樹冠正中間，探出來時從這裡「啵」到自己的位置 */
const HIDE = treePt(0.5, 0.35)
/** 樹幹被敲的地方、她敲樹那隻手 */
const KNOCK = { x: X0 + 13, y: 58 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 同一個笑點：她伸手（reach）、身體往樹那邊點三下「叩、叩、叩」（樹幹每下冒一個小 💥、樹抖一下）→
 * 「啵」！樹冠炸出一圈葉子，第 k 個住戶從樹冠裡探出來、瞪她（💢），樹被擠得往右歪一截（已經住著的跟著移）→
 * 她傻眼停 0.4 秒以上 → 反應一次比一次慘（往後一跳 → 跌坐 → 往後摔扁）。
 * at 是「啵」那一刻，k 是第幾次（0、1、2）。
 */
function knock(at: number, k: number): Gag {
  const res = RES[k]
  const lean0 = k === 0 ? 0 : LEAN[k - 1]
  const lean1 = LEAN[k]
  const taps = [at - 0.45, at - 0.3, at - 0.15]
  const moves: Move[] = [
    { at: at - 0.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/reach' },
    ...taps.map((t): Move => ({ at: t, dur: 0.12, actor: 'bunny', do: 'tilt', amount: 6 })),
    ...taps.map((t): Move => ({ at: t, dur: 0.12, actor: 'tree', do: 'shake', amount: 0.35 + 0.15 * k })),
    // 啵！住戶探出來
    { at, dur: 0.01, actor: res.id, do: 'moveTo', to: HIDE },
    { at: at + 0.01, dur: 0.25, actor: res.id, do: 'pop' },
    { at: at + 0.01, dur: 0.25, actor: res.id, do: 'moveTo', to: treePt(res.u, res.v, lean1), ease: 'back' },
    // 樹被擠得往右歪一截、樹冠鼓一下
    { at, dur: 0.3, actor: 'tree', do: 'rotateTo', amount: lean1 - lean0, ease: 'back' },
    { at, dur: 0.3, actor: 'tree', do: 'squash', amount: -0.06 - 0.03 * k },
    // 已經住著的跟著樹一起歪
    ...RES.slice(0, k).map((r): Move => ({ at, dur: 0.3, actor: r.id, do: 'moveTo', to: treePt(r.u, r.v, lean1), ease: 'back' })),
    // 住戶瞪她：往她那邊探一下
    { at: at + 0.3, dur: 0.3, actor: res.id, do: 'shake', amount: 0.6 + 0.3 * k },
    // 她傻眼
    { at: at + 0.02, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
  ]
  if (k === 0) {
    // 往後一跳
    moves.push(
      { at: at + 0.05, dur: 0.35, actor: 'bunny', do: 'moveTo', to: { x: X0 - 6, y: PB }, arc: 5, ease: 'out' },
    )
  } else if (k === 1) {
    // 傻眼停一下，一屁股跌坐
    moves.push(
      { at: at + 0.05, dur: 0.3, actor: 'bunny', do: 'hop', amount: 4 },
      { at: at + 0.48, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' },
      { at: at + 0.48, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: X0 - 8, y: PB }, ease: 'out' },
    )
  } else {
    // 傻眼停一下，整個人往後飛、摔扁
    moves.push(
      { at: at + 0.05, dur: 0.3, actor: 'bunny', do: 'hop', amount: 5 },
      { at: at + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/slip' },
      { at: at + 0.45, dur: 0.35, actor: 'bunny', do: 'moveTo', to: { x: 58, y: PB }, arc: 10, ease: 'out' },
      { at: at + 0.8, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    )
  }
  const crown = treePt(0.5, 0.3, lean1)
  const fx: Fx[] = [
    ...taps.map((t): Fx => ({ at: t, kind: 'burst', x: KNOCK.x, y: KNOCK.y, n: 1, dur: 0.14, scale: 0.55 })),
    { at, kind: 'burst', x: crown.x, y: crown.y, emoji: '🍃', n: 6 + 2 * k, dur: 0.45, scale: 1 + 0.2 * k },
    { at: at + 0.3, kind: 'pop', actor: res.id, emoji: '💢', dx: -7, dy: 5, dur: 0.5, scale: 1 + 0.25 * k },
  ]
  if (k === 2) fx.push({ at: at + 0.82, kind: 'dizzy', actor: 'bunny', dy: 6, dur: 0.6 })
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.06 + 0.02 * k, to: { x: (crown.x + X0) / 2, y: 46 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.4 * k },
  ]
  const lights: Light[] = [{ at, dur: 0.04, level: -0.15 - 0.05 * k }, { at: at + 0.04, dur: 0.2, level: 0 }]
  // 同一個音效（叩叩叩、啵），一次比一次多疊一個
  const cues: Cue[] = [...taps.map((t): Cue => ({ at: t, sfx: 'tap' })), { at, sfx: 'blip' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'poof' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'boing' }, { at: at + 0.8, sfx: 'bonk' })
  return { moves, fx, camera, cues, lights }
}

const P1 = 2.1, P2 = 4.1, P3 = 6.5
const k1 = knock(P1, 0)
const k2 = knock(P2, 1)
const k3 = knock(P3, 2)
const all = [k1, k2, k3]
/** 國字拼好、放大到正中央；大樹（連住戶）縮到字的右邊 */
const HOME = 7.6
const SIDE = { x: 141, k: 0.55 }
/** 讓位、語詞 */
const PARK = 8.45
const WORD = 8.8
/** 回馬槍：她也想住進去 */
const SMUG = 9.25
const GO4 = 9.75
const LAND4 = 10.05
const BEND = -28
const FLING = 10.45
/** 她跳進樹冠的位置（樹冠左邊中間） */
const IN = { u: 0.47, v: 0.5 }
const ASK = 11.2
const ANSWER = 13.72
/** 問他：國字到左邊，她從天上掉回右前方 */
const AX = 126
const ASK_S = 1.35

/** 彈上天：每個人從彎下去的樹上往右上飛出畫面（看得到一段） */
const FLY_TO: Record<string, Vec> = {
  bird: { x: 150, y: -25 },
  squirrel: { x: 190, y: 2 },
  owl: { x: 168, y: -42 },
  bunny: { x: AX + 4, y: -48 },
}

const clip: Clip = {
  format: 2,
  char: '樹',
  meta: { theme: '兔子女孩敲大樹，樹上住了好多住戶', cast: '兔子女孩＋大樹＋樹上的住戶（鸚鵡、松鼠、貓頭鷹）', gags: ['兔子女孩每次敲敲大樹的樹幹「叩叩叩」，樹冠就「啵」地探出一個住戶瞪她，一次比一次大、樹被擠得一次比一次歪，她一次比一次嚇得慘（鸚鵡嚇得往後跳、松鼠嚇得跌坐、先停一拍再敲：貓頭鷹嚇得往後摔扁）；回馬槍是她自己也想住進去，蹦地跳進樹冠，太擠了，樹被壓得彎下去再「啪」地彈回來，把大家全部彈上天'] },
  duration: 15,
  bg: { top: '#CFEBFF', bottom: '#F4FAEC', floor: '#A8CF7C', scenery: 'hills' },
  actors: [
    // 樹加 float：歪的時候支點留在腳底（不被抬起來）
    { id: 'tree', emoji: 'prop:tree', x: TX, y: TY, size: TS, float: true },
    ...RES.map((r) => ({ id: r.id, emoji: r.emoji, x: HIDE.x, y: HIDE.y, size: r.size, hidden: true, float: true })),
    { id: 'bunny', emoji: 'hero:bunny/dash', x: X0, y: PB, size: SB, hidden: true, flip: true },
  ],
  moves: [
    // 兔子女孩「咻」地衝進來，轉頭看左上的字框：樹！
    { at: 0, dur: 0.45, actor: 'bunny', do: 'enter', from: { x: -25, y: PB }, ease: 'out' },
    { at: 0.5, actor: 'bunny', do: 'flip' },
    { at: 0.5, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/know' },
    { at: 1.15, actor: 'bunny', do: 'flip' },
    { at: 1.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 第 1 次：叩叩叩——鸚鵡
    ...k1.moves,
    { at: P1 + 0.75, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: P1 + 0.95, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: X0, y: PB } },
    // 第 2 次：叩叩叩——松鼠
    ...k2.moves,
    // 第 3 次前停一拍：爬起來，看看歪掉的樹、托著下巴想、冒汗……慢慢伸手
    { at: P2 + 1.15, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ponder' },
    { at: P2 + 1.15, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: X0, y: PB } },
    { at: P2 + 1.6, dur: 0.4, actor: 'tree', do: 'tilt', amount: 2 },
    ...k3.moves,
    // 拼好前：她爬起來退到左邊
    { at: HOME - 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: HOME - 0.2, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: 22, y: PB } },
    // 國字放大：大樹站直、縮到字的右邊，住戶跟著
    { at: HOME - 0.05, dur: 0.4, actor: 'tree', do: 'rotateTo', amount: -LEAN[2], ease: 'out' },
    { at: HOME - 0.05, dur: 0.4, actor: 'tree', do: 'moveTo', to: { x: SIDE.x, y: TY }, ease: 'out' },
    { at: HOME - 0.05, dur: 0.4, actor: 'tree', do: 'scaleTo', amount: SIDE.k, ease: 'out' },
    ...RES.flatMap((r): Move[] => [
      { at: HOME - 0.05, dur: 0.4, actor: r.id, do: 'moveTo', to: treePt(r.u, r.v, 0, SIDE.k, SIDE.x), ease: 'out' },
      { at: HOME - 0.05, dur: 0.4, actor: r.id, do: 'scaleTo', amount: SIDE.k, ease: 'out' },
    ]),
    { at: HOME + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    // 語詞：國字讓回左上，樹回到中間，抖一抖樹冠：大樹！她指著它
    { at: PARK, dur: 0.4, actor: 'tree', do: 'moveTo', to: { x: TX, y: TY }, ease: 'out' },
    { at: PARK, dur: 0.4, actor: 'tree', do: 'scaleTo', amount: 1 / SIDE.k, ease: 'out' },
    ...RES.flatMap((r): Move[] => [
      { at: PARK, dur: 0.4, actor: r.id, do: 'moveTo', to: treePt(r.u, r.v), ease: 'out' },
      { at: PARK, dur: 0.4, actor: r.id, do: 'scaleTo', amount: 1 / SIDE.k, ease: 'out' },
    ]),
    { at: PARK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: PARK, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: X0 - 8, y: PB } },
    { at: WORD, dur: 0.35, actor: 'tree', do: 'squash', amount: -0.08 },
    { at: WORD, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: WORD, dur: 0.3, actor: 'bunny', do: 'hop', amount: 3 },
    // 回馬槍（第 4 次）：她也想住進去！閉眼得意 → 蹲低 → 蹦！跳進樹冠
    { at: SMUG, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    { at: GO4 - 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: GO4 - 0.2, dur: 0.2, actor: 'bunny', do: 'shake', amount: 0.8 },
    { at: GO4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: GO4, dur: LAND4 - GO4, actor: 'bunny', do: 'moveTo', to: treePt(IN.u, IN.v), arc: 12, ease: 'out' },
    { at: LAND4, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    // 太擠了：整棵樹被壓得往左彎下去，大家跟著
    { at: LAND4, dur: 0.25, actor: 'tree', do: 'rotateTo', amount: BEND, ease: 'out' },
    { at: LAND4, dur: 0.25, actor: 'bunny', do: 'moveTo', to: treePt(IN.u, IN.v, BEND), ease: 'out' },
    ...RES.map((r): Move => ({ at: LAND4, dur: 0.25, actor: r.id, do: 'moveTo', to: treePt(r.u, r.v, BEND), ease: 'out' })),
    { at: LAND4 + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: LAND4 + 0.2, dur: 0.2, actor: 'tree', do: 'shake', amount: 0.6 },
    // 啪！彈回來，把大家全部彈上天
    { at: FLING, dur: 0.12, actor: 'tree', do: 'rotateTo', amount: 60, ease: 'in' },
    { at: FLING + 0.12, dur: 0.7, actor: 'tree', do: 'rotateTo', amount: -(60 + BEND), ease: 'elastic' },
    ...RES.flatMap((r): Move[] => [
      { at: FLING + 0.08, dur: 0.7, actor: r.id, do: 'moveTo', to: FLY_TO[r.id], ease: 'linear' },
      { at: FLING + 0.08, dur: 0.7, actor: r.id, do: 'spin', times: 2 },
    ]),
    { at: FLING + 0.08, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: FLING + 0.08, dur: 0.4, actor: 'bunny', do: 'moveTo', to: FLY_TO.bunny, ease: 'linear' },
    // 樹站好、縮不見（問他之前只剩她）
    { at: ASK - 0.35, dur: 0.3, actor: 'tree', do: 'scaleTo', amount: 0.02, ease: 'in' },
    { at: ASK - 0.05, dur: 0.05, actor: 'tree', do: 'vanish' },
    // 她從天上掉回右前方、放大，轉向國字
    { at: ASK - 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: ASK - 0.25, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: ASK - 0.25, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: AX, y: PB - 1 }, ease: 'in' },
    { at: ASK + 0.05, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.45, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.75, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: 13.25, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.25, actor: 'bunny', do: 'hop', amount: 6 },
    // 退場（往右蹦出去），畫面只留下字
    { at: ANSWER + 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: ANSWER + 0.1, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.1, dur: 0.16, actor: 'bunny', do: 'moveTo', to: { x: 210, y: PB - 1 }, ease: 'in' },
  ],
  builds: [
    // 每敲一次就掉出一組：鸚鵡那次樹幹掉出木、松鼠那次被敲響的樹冠震出壴（鼓）、貓頭鷹那次她敲樹的手飛出寸（一隻手）
    { at: P1 + 0.4, dur: 0.5, strokes: [0, 1, 2, 3], from: treePt(0.5, 0.75, LEAN[0]), color: partColor('木') },
    { at: P2 + 0.45, dur: 0.6, strokes: [4, 5, 6, 7, 8, 9, 10, 11, 12], from: treePt(0.5, 0.35, LEAN[1]), color: partColor('壴') },
    { at: P3 + 0.45, dur: 0.45, strokes: [13, 14, 15], from: 'bunny', color: partColor('寸') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.3 - ASK, do: 'ask', keep: ['bunny'], to: { x: 58, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    // 第 3 次前停一拍：冒汗
    { at: P2 + 1.3, kind: 'sweat', actor: 'bunny', dx: -5 },
    // 語詞：樹冠亮晶晶
    { at: WORD, kind: 'burst', ...treePt(0.5, 0.3), emoji: '✨', n: 9, dur: 0.55, scale: 1.3 },
    // 回馬槍：跳進去、壓彎、啪！
    { at: GO4, kind: 'puff', actor: 'bunny', dur: 0.4 },
    { at: LAND4, kind: 'burst', ...treePt(0.4, 0.35, BEND), emoji: '🍃', n: 9, dur: 0.5, scale: 1.3 },
    { at: FLING + 0.1, kind: 'burst', ...treePt(0.5, 0.3, 20), emoji: '🍃', n: 12, dur: 0.6, scale: 1.6 },
    { at: FLING + 0.1, kind: 'burst', x: TX - 12, y: 52, n: 1, dur: 0.4, scale: 1.6 },
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.28 },
  ],
  camera: [
    // 鏡頭鎖全景（樹頂、彈上天都要在畫面裡），只有探出來那一下推一點、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: LAND4, dur: 0.3, do: 'shake', amount: 1 },
    { at: FLING + 0.1, dur: 0.4, do: 'shake', amount: 2.2 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'whoosh' },
    { at: 0.6, say: '樹' },
    ...all.flatMap((g) => g.cues),
    { at: P2 + 1.3, sfx: 'gulp' },
    { at: HOME + 0.1, say: '樹' },
    { at: WORD, say: '大樹' },
    { at: GO4, sfx: 'boing' },
    { at: LAND4, sfx: 'plop' },
    { at: LAND4 + 0.05, sfx: 'crack' },
    { at: FLING + 0.1, sfx: 'boing' },
    { at: FLING + 0.12, sfx: 'whoosh' },
    { at: FLING + 0.14, sfx: 'bonk' },
    { at: ASK - 0.05, sfx: 'plop' },
    { at: ASK + 0.02, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '樹' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
