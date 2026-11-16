import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 夜（v2）：夜裡黑黑的，影子好大。小骷髏把地上的手電筒「喀」地打開，照到左邊——光圈裡「轟」地冒出一個超大的黑影，
// 嚇得他跳起來；黑影的主人從暗暗的地方走出來，原來小小一隻（黑影跟著縮回牠身上）。影子一次比一次大、他嚇得一次比一次慘，
// 出來的東西卻一次比一次小：兔子（長耳朵像兩根角；他嚇得發抖，亠）→ 松鼠（大尾巴像巨人；他嚇得往後逃，亻）→
// 先停一拍：他手伸過去又縮回來、冒汗，才閉著眼按下去——螞蟻（六隻腳像大蜘蛛怪；他跳到半天高轉一圈摔坐，夕＋長捺）。
// 語詞那一刻他跳到中間，手指著天上一閃一閃的星星：「夜晚」。
// 回馬槍（第四次）：他學乖了，再打開——光圈裡空空的！他哈哈笑、得意地閉著眼大步走進光裡，
// 光圈裡的黑影越長越大、戴著一頂大帽子，他一睜眼「轟」——最大的一個！他跳起來，黑影也一模一樣跳起來——
// 原來是他自己的影子。他抓起手電筒逃出畫面。
// 最後畫面暗下來只剩「夜」，小骷髏走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「夜！」，然後退場只留字。
// 刻意不跟「是」（布幕猜影子、猜對了動物撲上來）、「怕」（小蜘蛛垂下來）、「弟」（躲到姐姐背後）、「晚」（不睡覺吵月亮）撞：
// 這支只演「手電筒一照→影子好大→主人好小」，不猜、不躲、不睡覺、月亮只是背景。
// 夜、夜、夜晚、這是什麼字？、夜

/** 小骷髏（hero:jerry；圖朝左，正好面向左邊的光圈，不用翻） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 每次都站在同一個地方：手電筒右邊 */
const JX = 140
const STAND: Vec = { x: JX, y: JY }
/** 手電筒（🔦 圖是往左上照）：放在地上、往左照；國字回中央那一秒不疊到字（左緣約 x 116） */
const TS = 12
const TORCH: Vec = { x: 123, y: 77 - 0.42 * TS }
/** 光圈（⚪ 染成暖黃色）：左邊，底貼著地板；右上角不碰到字框 */
const SPS = 62
const SPOT: Vec = { x: 35, y: 66 - 0.42 * SPS }
const LIGHT = 'sepia(.55) saturate(2.4) brightness(1.13) opacity(.88)'
/** 影子：同一張圖整個染黑、有一點透明，腳底在光圈底部；size 寫最大的那個（他自己的影子），其他用 scaleTo 縮 */
const SH = 60
const SHADOW_FOOT = 64
const SHADOW: Vec = { x: 35, y: SHADOW_FOOT - 0.42 * SH }
const DARK = 'brightness(0) opacity(.86)'
/** 影子的主人：一次比一次小（size 寫最大的兔子，其他用 scaleTo 縮）；影子卻一次比一次大 */
const WHO = ['🐇', '🐿️', '🐜'] as const
const CS = 14
const CRIT: Vec = { x: -12, y: 77 - 0.42 * CS }
const CRIT_K = [1, 0.84, 0.7]
const SHADOW_K = [0.56, 0.72, 0.84]
/** 主人走出來停在哪裡：光圈右邊、畫面中間偏左 */
const OUT_X = 62
/** 被嚇到傻眼停多久 */
const HOLD = 0.42

/** 手電筒燈頭（相對手電筒中心）與光線照到的地方 */
const TIP: Vec = { x: -6, y: -4 }
const BEAM: Vec[] = [{ x: 58, y: 34 }, { x: 58, y: 60 }]
const LIGHT_LINE = '#FFF3A8'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; end: number }

/** 伸手按手電筒「喀」：at 是光圈亮起來那一刻 */
function click(at: number): { moves: Move[]; cues: Cue[] } {
  return {
    moves: [
      { at: at - 0.28, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
      { at: at - 0.28, actor: 'jerry', do: 'moveTo', to: { x: JX - 4, y: JY }, dur: 0.18 },
      { at: at - 0.05, actor: 'torch', do: 'hop', amount: 1.2, dur: 0.12 },
      { at, actor: 'spot', do: 'pop', dur: 0.15 },
    ],
    cues: [{ at: at - 0.05, sfx: 'tap' }, { at, sfx: 'blip' }],
  }
}

/**
 * 同一個笑點：手電筒一照（at＝光圈亮）→ 光圈裡「轟」地冒出一個超大的黑影（從小長大、晃一下）＋鏡頭推近光圈＋震 →
 * 他傻眼跳起來（停 HOLD 秒看得見臉）→ 黑影的主人從左邊暗處走出來，黑影跟著縮回牠身上、消失 →
 * 原來小小一隻：牠跳一下打招呼，他斜眼看、冒汗；筆畫從牠身上飛上去；燈「喀」地關掉，牠跳回暗處。
 * k 是第幾次（0～2）：影子越來越大、他嚇得越來越慘、主人越來越小、音效多疊一個。
 */
function shine(at: number, k: number): Gag {
  const rise = at + 0.1
  const scare = at + 0.3
  const out = scare + HOLD
  const meet = out + 0.34
  // 第 3 次之後國字馬上要回中央：燈關得快一點、螞蟻跑得快一點，國字回來前整個退場
  const off = meet + (k < 2 ? 0.35 : 0.26)
  const back = k < 2 ? 0.3 : 0.2
  const c = click(at)
  const moves: Move[] = [
    ...c.moves,
    // 影子換成這次的主人（藏著的時候換），從一半大「轟」地長到這次的大小，晃一下
    { at: at - 0.3, actor: 'shadow', do: 'swap', emoji: WHO[k] },
    { at: rise, actor: 'shadow', do: 'pop', dur: 0.1 },
    { at: rise, actor: 'shadow', do: 'scaleTo', amount: SHADOW_K[k] * 0.5, dur: 0.01 },
    { at: rise + 0.02, actor: 'shadow', do: 'scaleTo', amount: 2, dur: 0.26, ease: 'back' },
    { at: rise + 0.28, actor: 'shadow', do: 'shake', amount: 1 + 0.5 * k, dur: 0.35 },
    // 傻眼跳起來
    { at: scare, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: scare, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.1 },
    { at: scare, actor: 'jerry', do: 'hop', amount: [4, 8, 18][k], dur: [0.3, 0.36, 0.5][k] },
    // 主人從左邊暗處走出來（同一個角色換圖；size 是兔子的，用 scaleTo 縮）
    { at: out - 0.02, actor: 'critter', do: 'swap', emoji: WHO[k] },
    { at: out, actor: 'critter', do: 'enter', from: CRIT, dur: 0.36, ease: 'out' },
    { at: out, actor: 'critter', do: 'scaleTo', amount: CRIT_K[k], dur: 0.01 },
    // 黑影跟著牠縮回去：一邊縮小一邊往牠那邊移、消失
    { at: out, actor: 'shadow', do: 'scaleTo', amount: 0.25, dur: 0.34, ease: 'in' },
    { at: out, actor: 'shadow', do: 'moveTo', to: { x: SHADOW.x + 18, y: SHADOW.y }, dur: 0.34, ease: 'in' },
    { at: out + 0.3, actor: 'shadow', do: 'vanish', dur: 0.06 },
    { at: out + 0.4, actor: 'shadow', do: 'moveTo', to: SHADOW, dur: 0.01 },
    // 原來小小一隻：跳一下打招呼
    { at: meet, actor: 'critter', do: 'hop', amount: 3, dur: 0.25 },
    // 燈關掉，牠跳回暗處
    { at: off, actor: 'spot', do: 'vanish', dur: 0.12 },
    { at: off + 0.05, actor: 'critter', do: 'flip' },
    { at: off + 0.08, actor: 'critter', do: 'moveTo', to: CRIT, dur: back, ease: 'in' },
    { at: off + 0.08 + back, actor: 'critter', do: 'vanish', dur: 0.01 },
    { at: off + 0.1 + back, actor: 'critter', do: 'flip' },
    // 藏著的時候回到原位，下一次 enter 才走得到 OUT_X
    { at: off + 0.11 + back, actor: 'critter', do: 'moveTo', to: { x: OUT_X, y: CRIT.y }, dur: 0.01 },
  ]
  // 嚇完的反應：發抖 → 往後逃一段 → 摔坐
  if (k === 0) moves.push(
    { at: scare + HOLD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/scared' },
    { at: scare + HOLD, actor: 'jerry', do: 'shake', amount: 1, dur: 0.4 },
  )
  if (k === 1) moves.push(
    { at: scare + HOLD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flee' },
    { at: scare + HOLD, actor: 'jerry', do: 'moveTo', to: { x: JX + 9, y: JY }, dur: 0.22, ease: 'out' },
  )
  if (k === 2) moves.push(
    { at: scare + 0.05, actor: 'jerry', do: 'spin', times: 1, dur: 0.4, pivot: 'center' },
    { at: scare + 0.5, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
  )
  // 回過神來：斜眼看那隻小東西
  moves.push({ at: meet + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/doubt' })
  if (k === 1) moves.push({ at: meet + 0.05, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.2 })
  const fx: Fx[] = [
    // 手電筒的光：兩條淡黃的線從燈頭照到光圈右邊（上面那條壓低，不碰字框）
    ...BEAM.map((to): Fx => ({ at, dur: off - at + 0.1, kind: 'line', actor: 'torch', dx: TIP.x, dy: TIP.y, to, color: LIGHT_LINE, width: 0.5 })),
    // 傻眼：頭上冒汗，一次比一次大
    { at: scare + 0.05, kind: 'sweat', actor: 'jerry', dx: -6, scale: 1.2 + 0.3 * k },
    // 小東西打招呼
    { at: meet, kind: 'pop', actor: 'critter', emoji: '💕', dx: 3, dur: 0.4 },
    // 回過神來冒一滴汗
    { at: meet + 0.1, kind: 'sweat', actor: 'jerry', dx: -6 },
  ]
  const camera: Camera[] = [
    { at: rise + 0.05, dur: 0.45, do: 'punch', amount: 0.05 + 0.02 * k, to: { x: 50, y: 48 } },
    { at: rise + 0.05, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效（轟＋咚），一次比一次多疊一個
  const cues: Cue[] = [...c.cues, { at: rise, sfx: 'rumble' }, { at: scare, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: scare + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: scare + 0.08, sfx: 'crack' }, { at: scare + 0.5, sfx: 'plop' })
  cues.push({ at: out, sfx: 'tap' }, { at: meet, sfx: 'blip' }, { at: off, sfx: 'tap' })
  return { moves, fx, camera, cues, end: off + 0.35 }
}

// 第 1 次：兔子
const A1 = 1.2
const g1 = shine(A1, 0)
// 第 2 次：松鼠
const A2 = g1.end + 0.3
const g2 = shine(A2, 1)
// 第 3 次前停一拍：手伸過去又縮回來、冒汗，才閉著眼按下去
const PAUSE = g2.end
const A3 = PAUSE + 0.65
const g3 = shine(A3, 2)
/** 每一次筆畫飛上去的時間（主人走出來、打招呼那一刻） */
const meetOf = (a: number) => a + 0.3 + HOLD + 0.34
/** 字框填滿、國字到正中央 */
const HOME = meetOf(A3) + 0.6
const PARK = HOME + 0.85
/** 語詞那一刻：跳到中間指著星星 */
const MID: Vec = { x: 80, y: JY }
const WORD = PARK + 0.32
// 回馬槍（第 4 次）：走回手電筒旁邊再按一次——空的！得意地走進光裡，自己的影子越長越大
const A4 = WORD + 0.68
const WALK4 = A4 + 0.35
const IN4: Vec = { x: 102, y: JY }
const SCARE4 = WALK4 + 0.5
const FLEE4 = SCARE4 + HOLD + 0.05
/** 問他 */
const ASK = FLEE4 + 0.35
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }
const c4 = click(A4)

const clip: Clip = {
  format: 2,
  char: '夜',
  meta: { theme: '小骷髏晚上拿手電筒照影子', cast: '小骷髏＋手電筒＋光圈裡的黑影＋影子的主人（兔子、松鼠、螞蟻）', gags: ['夜裡黑黑的，影子好大：小骷髏每次打開手電筒照左邊，光圈裡就「轟」地冒出一個超大的黑影，他嚇得跳起來，結果走出來的主人小小一隻，影子一次比一次大、他嚇得一次比一次慘、主人卻一次比一次小（兔子→松鼠→停一拍、螞蟻）；回馬槍是光圈空空的，他得意地走進光裡，冒出一個戴大帽子的最大黑影，他跳、黑影也跳——原來是他自己的影子'] },
  duration: 15,
  bg: { top: '#232A6E', bottom: '#8E86D6', floor: '#E2CFA6', scenery: 'night' },
  actors: [
    // 光圈、影子畫在最後面（照在牆上）
    { id: 'spot', emoji: '⚪', x: SPOT.x, y: SPOT.y, size: SPS, float: true, hidden: true, tint: LIGHT },
    { id: 'shadow', emoji: WHO[0], x: SHADOW.x, y: SHADOW.y, size: SH, float: true, hidden: true, flip: true, tint: DARK },
    { id: 'critter', emoji: WHO[0], x: OUT_X, y: CRIT.y, size: CS, hidden: true, flip: true },
    { id: 'jerry', emoji: 'hero:jerry/sneak', x: JX, y: JY, size: JS },
    { id: 'torch', emoji: '🔦', x: TORCH.x, y: TORCH.y, size: TS, pivot: 'center' },
  ],
  moves: [
    // 手電筒往左照（圖是往左上，轉一點變成往左、微微朝上）
    { at: 0, actor: 'torch', do: 'rotateTo', amount: -22, dur: 0.01 },
    // 開場：晚上踮著腳走進來，指著字框——夜！
    { at: 0, actor: 'jerry', do: 'enter', from: { x: 180, y: JY }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    ...g1.moves,
    { at: g1.end - 0.15, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    ...g2.moves,
    // 第 3 次前停一拍：手伸過去、縮回來發抖、冒汗……閉著眼按下去
    { at: PAUSE, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: PAUSE + 0.25, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/scared' },
    { at: PAUSE + 0.25, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.3 },
    ...g3.moves,
    // 摔坐完站起來，回到手電筒右邊（國字回中央時讓到右邊）
    { at: HOME - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 語詞：跳到中間，指著天上的星星——夜晚
    { at: PARK + 0.05, actor: 'jerry', do: 'moveTo', to: MID, arc: 4, dur: 0.3 },
    { at: WORD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: WORD, actor: 'jerry', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：走回手電筒旁邊，再按一次
    { at: WORD + 0.55, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: WORD + 0.55, actor: 'jerry', do: 'flip' },
    { at: WORD + 0.55, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.25 },
    { at: A4 - 0.32, actor: 'jerry', do: 'flip' },
    ...c4.moves,
    // 空的！哈哈笑，得意地閉著眼大步走進光裡
    { at: A4 + 0.15, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/laugh' },
    { at: WALK4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: WALK4, actor: 'jerry', do: 'moveTo', to: IN4, dur: 0.5 },
    // 他走進光裡，影子（他自己，戴著大帽子）在光圈裡越長越大
    { at: WALK4 - 0.1, actor: 'shadow', do: 'swap', emoji: 'hero:jerry/smug' },
    { at: WALK4 - 0.1, actor: 'shadow', do: 'flip' },
    { at: WALK4 + 0.05, actor: 'shadow', do: 'pop', dur: 0.1 },
    { at: WALK4 + 0.05, actor: 'shadow', do: 'scaleTo', amount: 0.35, dur: 0.01 },
    { at: WALK4 + 0.07, actor: 'shadow', do: 'scaleTo', amount: 0.8 / 0.35, dur: 0.45, ease: 'in' },
    // 一睜眼：最大的黑影！他跳起來，黑影也一模一樣跳起來
    { at: SCARE4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: SCARE4, actor: 'shadow', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: SCARE4, actor: 'jerry', do: 'hop', amount: 5, dur: 0.4 },
    { at: SCARE4, actor: 'shadow', do: 'hop', amount: 5, dur: 0.4 },
    // 抓起手電筒逃出畫面（flee 圖本來就是往右跑、回頭看左邊）
    { at: FLEE4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flee' },
    { at: FLEE4, actor: 'shadow', do: 'swap', emoji: 'hero:jerry/flee' },
    { at: FLEE4, actor: 'jerry', do: 'moveTo', to: { x: 200, y: JY }, dur: 0.4, ease: 'in' },
    { at: FLEE4 + 0.12, actor: 'torch', do: 'moveTo', to: { x: 200, y: TORCH.y - 14 }, dur: 0.28, ease: 'in' },
    { at: FLEE4 + 0.12, actor: 'shadow', do: 'vanish', dur: 0.15 },
    { at: FLEE4 + 0.12, actor: 'spot', do: 'vanish', dur: 0.15 },
    // 問他：走回來、變大
    { at: ASK + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.1, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.35, ease: 'out' },
    { at: ASK + 0.3, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.27, actor: 'jerry', do: 'flip' },
    { at: ANSWER + 0.3, actor: 'jerry', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 每次主人走出來打招呼，筆畫就從牠身上飛上去
    { at: meetOf(A1), dur: 0.45, strokes: [0, 1], from: 'critter', color: partColor('亠') },
    { at: meetOf(A2), dur: 0.45, strokes: [2, 3], from: 'critter', color: partColor('亻') },
    { at: meetOf(A3), dur: 0.45, strokes: [4, 5, 6, 7], from: 'critter', color: partColor('夕') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.3, kind: 'sweat', actor: 'jerry', dx: -6, scale: 1.4 },
    ...g3.fx,
    { at: meetOf(A3) + 0.1, kind: 'dizzy', actor: 'jerry', dur: 0.5 },
    // 語詞：天上的星星一閃一閃
    { at: WORD, kind: 'burst', x: 52, y: 40, emoji: '⭐', n: 7, dur: 0.6, scale: 1.6 },
    { at: WORD + 0.1, kind: 'burst', x: 110, y: 40, emoji: '✨', n: 7, dur: 0.55, scale: 1.6 },
    // 回馬槍：最大的汗
    { at: SCARE4 + 0.05, kind: 'sweat', actor: 'jerry', dx: 9, dy: 8, scale: 2 },
    ...BEAM.map((to): Fx => ({ at: A4, dur: FLEE4 + 0.12 - A4, kind: 'line', actor: 'torch', dx: TIP.x, dy: TIP.y, to, color: LIGHT_LINE, width: 0.5 })),
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（光圈在左、他在右，推近會切掉一邊）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: SCARE4, dur: 0.45, do: 'punch', amount: 0.1, to: { x: 55, y: 48 } },
    { at: SCARE4, dur: 0.4, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '夜' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '夜' },
    { at: WORD, say: '夜晚' },
    ...c4.cues,
    { at: SCARE4, sfx: 'rumble' },
    { at: SCARE4, sfx: 'bonk' },
    { at: SCARE4 + 0.04, sfx: 'boing' },
    { at: SCARE4 + 0.08, sfx: 'crack' },
    { at: FLEE4, sfx: 'whoosh' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '夜' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
