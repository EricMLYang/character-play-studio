import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 姑（v2）：姑姑太愛楊捷睿了，一看到他眼睛就一亮、張開雙手衝過來——「啾！」在他臉上親一個大大的紅唇印。
// 他怎麼躲都躲不掉，臉上的唇印一次多一個：
// 第 1 次他站著揮手、完全沒防備（女從姑姑身上飛出來）→ 第 2 次他跳進大紙箱，箱子抖抖抖，姑姑一把把箱子掀飛（十從彈出來的他身上飛出來）→
// 先停一拍：他躲進灌木叢只露出頭髮、屏住呼吸，姑姑左看右看走過去……又倒退回來，把灌木叢撥開（口從親下去的嘴巴飛出來）。
// 回馬槍（第四次）：姑姑捧出生日蛋糕，他好感動，這次換他衝過去跳起來在姑姑臉上「啾」一下——姑姑臉上一個唇印，她嚇一跳又呵呵笑。
// 最後畫面暗下來只剩「姑」，滿臉唇印的楊捷睿問「這是什麼字？」，手放耳邊等他回答，再指著字說「姑！」，然後退場只留字。
// 姑、姑、姑姑、這是什麼字？、姑

/** 楊捷睿：站在左邊、面向右邊的姑姑（flip），前三次都站在同一個地方 */
const S = 39
const P = 77 - 0.42 * S
const YX = 56
/** 姑姑（道具圖 prop:aunt*，朝左）：畫面右邊、最大 */
const AS = 52
const AY = 77 - 0.42 * AS
const AX = 128
/** 親他那一格姑姑站的地方：嘟起來的嘴（aunt-kiss 圖的 u 0.35、v 0.37）碰到他的臉（靠她那一邊） */
const KX = YX + 0.15 * S + 0.15 * AS
const LIPS = { x: KX - 0.15 * AS, y: AY - 0.13 * AS }
/**
 * 唇印：小小的（約他臉寬的 1/3），右頰、左頰、額頭（頭髮下緣）各一個，各自歪一點，三個都印上去眼睛和嘴巴還是完整看得到。
 * OFF 是畫出來的中心相對他腳底的位置（以 S 為單位，照 surprised 的臉量的；他朝右，所以 +x 是靠姑姑那邊）。
 * MK 會被引擎自動放大三成（size 18 以下），畫出來的長邊約 5.9。
 */
const MK = 4.5
const MK_DRAWN = MK * 1.3
const OFF = {
  m1: { x: 0.21, y: -0.475, r: -16 },
  m2: { x: -0.11, y: -0.48, r: 12 },
  hide: { x: 0.04, y: -0.68, r: -6 },
} as const
type Mark = keyof typeof OFF
/** 紙箱、灌木叢（跟第三個唇印是同一個角色：用完縮成唇印貼到他臉上） */
const BOX = 34
const BY = 77 - 0.42 * BOX
/** 第三個唇印是 size 34 的角色縮小的（以它自己的腳底縮），縮多少、中心離 y 多遠跟另外兩個不一樣 */
const HIDE_K = MK_DRAWN / BOX
const CORR: Record<Mark, number> = { m1: 0.125 * MK_DRAWN, m2: 0.125 * MK_DRAWN, hide: 0.42 * BOX - 0.295 * MK_DRAWN }
/** 他站在 (x, y)、放大 s 倍時，唇印角色要擺的位置（唇印照他的腳底一起放大） */
const markAt = (m: Mark, x: number, y: number, s = 1) => ({ x: x + OFF[m].x * S * s, y: y + 0.42 * S + OFF[m].y * S * s - CORR[m] * s })

/** 他（和臉上已經有的唇印）一起移動：唇印跟著他走，不會飄。s 是他那時候放大的倍數 */
function walk(at: number, dur: number, x: number, y: number, marks: Mark[], extra: Partial<Move> = {}, s = 1): Move[] {
  return [
    { at, dur, actor: 'yang', do: 'moveTo', to: { x, y }, ...extra },
    ...marks.map((m): Move => ({ at, dur, actor: m, do: 'moveTo', to: markAt(m, x, y, s), ...extra })),
  ]
}
/** 他（和唇印）一起跳一下／抖一下 */
function jolt(at: number, kind: 'hop' | 'shake', amount: number, dur: number, marks: Mark[]): Move[] {
  return [{ at, dur, actor: 'yang', do: kind, amount }, ...marks.map((m): Move => ({ at, dur, actor: m, do: kind, amount }))]
}
/** 唇印藏起來（他躲進去）／再冒出來（他被找到） */
const hideMarks = (at: number, marks: Mark[]): Move[] => marks.map((m) => ({ at, dur: 0.08, actor: m, do: 'vanish' }))
const showMarks = (at: number, marks: Mark[]): Move[] => marks.map((m) => ({ at, dur: 0.15, actor: m, do: 'pop' }))

/** 啾的愛心顏色在淺色背景上要夠鮮 */
const HEART = '💖'

/**
 * 「啾！」：姑姑眼睛一亮（💖）→ 換張開雙手跑過來的姿勢 → 衝到他面前 → 那一格彎腰嘟嘴親下去：
 * 鏡頭推近＋震、同一個「啾」音效（一次多疊一個音）、愛心在兩個人頭頂上方炸開（不蓋臉）、他臉上多一個唇印、他傻眼停住；
 * 然後姑姑遮著嘴呵呵笑。k 是第幾次（越後面越大），mark 是這次多出來的唇印，has 是他臉上已經有的。
 */
function smooch(at: number, k: number, mark: Mark, has: Mark[], run = true) {
  const moves: Move[] = [
    { at: at - 0.42, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-run' },
    ...(run ? [{ at: at - 0.3, dur: 0.3, actor: 'aunt', do: 'moveTo', to: { x: KX, y: AY }, ease: 'in', anticipate: 3 } as Move] : []),
    { at, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-kiss' },
    // 他傻眼：唇印「啵」地貼上臉，整個人被親得跳一下、抖一下，停住
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: at + 0.06, dur: 0.18, actor: mark, do: 'pop' },
    { at: at + 0.06, dur: 0.01, actor: mark, do: 'rotateTo', amount: OFF[mark].r },
    ...jolt(at + 0.08, 'hop', 2 + 2 * k, 0.3, [...has, mark]),
    ...jolt(at + 0.38, 'shake', 0.6 + 0.4 * k, 0.3, [...has, mark]),
    // 姑姑呵呵笑，退回原位
    { at: at + 0.4, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-laugh' },
  ]
  const fx: Fx[] = [
    { at: at - 0.55, kind: 'pop', actor: 'aunt', emoji: HEART, dx: -10, dy: 2, dur: 0.45, scale: 1.3 },
    { at, kind: 'burst', x: LIPS.x - 2, y: LIPS.y - 20, emoji: HEART, n: 1, dur: 0.5, scale: 1.3 + 0.35 * k },
    { at: at + 0.02, kind: 'burst', x: LIPS.x - 2, y: LIPS.y - 22, emoji: '💕', n: 4 + 2 * k, dur: 0.5, scale: 0.8 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.08, to: { x: LIPS.x, y: 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.35 * k },
  ]
  // 同一個「啾」（嘟——啵），一次比一次多疊一個音
  const cues: Cue[] = [{ at: at - 0.3, sfx: 'whoosh' }, { at, sfx: 'plop' }, { at: at + 0.05, sfx: 'blip' }]
  if (k >= 1) cues.push({ at: at + 0.1, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.15, sfx: 'blip' })
  if (!run) cues.shift()
  return { moves, fx, camera, cues }
}

const G1 = 1.6, G2 = 3.65, G3 = 6.75
const HOME = 7.45
const PARK = 8.3
const WORD = 8.9
/** 回馬槍：姑姑捧出蛋糕、他衝過去跳起來親她 */
const CAKE = 9.25, K4 = 9.95
const ASK = 10.9
/** 問他的時候他放大一點（唇印跟著一起） */
const ASK_S = 1.15
const ANSWER = 13.55
/** 國字放大到中間時兩個人讓到兩邊；語詞那一刻姑姑站中間、放大 */
const SIDE_Y = 22, SIDE_A = 140
const MID = 94
/** 字框在上方、往上縮一點：下面留給兩個大大的人（親的那一刻、語詞那一刻頭頂都碰不到） */
const FRAME = { x: 80, y: 16.5 }
const FRAME_K = 0.5

const s1 = smooch(G1, 0, 'm1', [])
const s2 = smooch(G2, 1, 'm2', ['m1'])
const s3 = smooch(G3, 2, 'hide', ['m1', 'm2'], false)
const ALL: Mark[] = ['m1', 'm2', 'hide']

const clip: Clip = {
  format: 2,
  char: '姑',
  meta: { theme: '姑姑太愛楊捷睿，一直衝過來親他', cast: '楊捷睿＋姑姑＋紙箱／灌木叢', gags: ['姑姑一看到楊捷睿眼睛就一亮、張開雙手衝過來「啾！」在他臉上親一個大紅唇印，他怎麼躲都躲不掉、唇印一次多一個（站著沒防備→躲進紙箱被一把掀開→停一拍躲進灌木叢，姑姑走過去又倒退回來）；回馬槍是姑姑捧出生日蛋糕，這次換他衝過去跳起來在姑姑臉上啾一下，姑姑嚇一跳又呵呵笑'] },
  duration: 15,
  // 粉嫩的室內（姑姑家）：天藍洋裝、紅衣服的他、紅唇印都跳得出來
  bg: { top: '#FFF1E0', bottom: '#FFF8EE', floor: '#E9CFA8', scenery: 'room' },
  actors: [
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: P, size: S, hidden: true, flip: true },
    { id: 'm1', emoji: 'prop:kiss-mark', ...markAt('m1', YX, P), size: MK, hidden: true, float: true },
    { id: 'm2', emoji: 'prop:kiss-mark', ...markAt('m2', YX, P), size: MK, hidden: true, float: true },
    // 紙箱 → 灌木叢 → 第三個唇印（同一個角色，道具數量才不會超過）
    { id: 'hide', emoji: 'prop:box', x: YX, y: BY, size: BOX, hidden: true, float: true },
    { id: 'aunt', emoji: 'prop:aunt', x: AX, y: AY, size: AS, hidden: true },
  ],
  moves: [
    // 開場：他從左邊走進來、姑姑從右邊走進來，他開心地揮手——姑！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -20, y: P }, dur: 0.5, ease: 'out' },
    { at: 0, actor: 'aunt', do: 'enter', from: { x: 185, y: AY }, dur: 0.6, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    // 第 1 次：他還在揮手、完全沒防備
    ...s1.moves,
    { at: G1 + 0.55, dur: 0.45, actor: 'aunt', do: 'moveTo', to: { x: AX, y: AY } },
    // 第 2 次：他嚇得跳進大紙箱，箱子抖抖抖
    { at: 2.55, dur: 0.2, actor: 'hide', do: 'pop' },
    { at: 2.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/jump' },
    ...walk(2.65, 0.3, YX, P, ['m1'], { arc: 9 }),
    { at: 2.88, dur: 0.08, actor: 'yang', do: 'vanish' },
    ...hideMarks(2.86, ['m1']),
    { at: 2.95, dur: 0.3, actor: 'hide', do: 'shake', amount: 1.2 },
    { at: 3.05, actor: 'aunt', do: 'swap', emoji: 'prop:aunt' },
    // 姑姑衝過去，一把把箱子掀飛；他彈出來
    { at: G2 - 0.22, dur: 0.35, actor: 'hide', do: 'moveTo', to: { x: -25, y: 10 }, ease: 'out' },
    { at: G2 - 0.22, dur: 0.35, actor: 'hide', do: 'rotateTo', amount: -160, ease: 'out' },
    { at: G2 + 0.1, dur: 0.05, actor: 'hide', do: 'vanish' },
    { at: G2 - 0.2, dur: 0.15, actor: 'yang', do: 'pop' },
    { at: G2 - 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...showMarks(G2 - 0.18, ['m1']),
    ...s2.moves,
    { at: G2 + 0.55, dur: 0.45, actor: 'aunt', do: 'moveTo', to: { x: AX, y: AY } },
    // 第 3 次前停一拍：他東張西望，躲進灌木叢只露出頭髮、屏住呼吸
    { at: 4.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
    { at: 4.5, dur: 0.01, actor: 'hide', do: 'rotateTo', amount: 160 },
    { at: 4.5, dur: 0.01, actor: 'hide', do: 'moveTo', to: { x: YX, y: BY } },
    { at: 4.51, actor: 'hide', do: 'swap', emoji: 'prop:bush' },
    { at: 4.55, dur: 0.2, actor: 'hide', do: 'pop' },
    { at: 4.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    ...hideMarks(4.68, ['m1', 'm2']),
    // 姑姑找人：走過灌木叢前面，一路左看右看……
    { at: 4.7, actor: 'aunt', do: 'swap', emoji: 'prop:aunt' },
    { at: 4.8, dur: 0.95, actor: 'aunt', do: 'moveTo', to: { x: 20, y: AY }, ease: 'linear' },
    { at: 5.0, dur: 0.3, actor: 'aunt', do: 'tilt', amount: 6 },
    { at: 5.4, dur: 0.3, actor: 'aunt', do: 'tilt', amount: -6 },
    { at: 5.25, dur: 0.4, actor: 'hide', do: 'shake', amount: 0.5 },
    // ……又倒退回來，停在灌木叢旁邊
    { at: 6.05, dur: 0.5, actor: 'aunt', do: 'moveTo', to: { x: KX + 4, y: AY }, ease: 'inOut' },
    // 找到了！灌木叢被撥開飛走，他嚇得站起來
    { at: G3 - 0.25, dur: 0.22, actor: 'hide', do: 'moveTo', to: { x: -25, y: 30 }, ease: 'out' },
    { at: G3 - 0.25, dur: 0.2, actor: 'hide', do: 'vanish' },
    { at: G3 - 0.22, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...showMarks(G3 - 0.2, ['m1', 'm2']),
    { at: G3 - 0.2, dur: 0.12, actor: 'aunt', do: 'moveTo', to: { x: KX, y: AY } },
    // 灌木叢變成第三個唇印
    { at: G3 - 0.02, actor: 'hide', do: 'swap', emoji: 'prop:kiss-mark' },
    { at: G3 - 0.02, dur: 0.01, actor: 'hide', do: 'moveTo', to: markAt('hide', YX, P) },
    ...s3.moves,
    { at: G3 + 0.061, dur: 0.01, actor: 'hide', do: 'scaleTo', amount: HIDE_K },
    // 國字放大到中間：兩個人讓到兩邊
    { at: G3 + 0.35, dur: 0.35, actor: 'aunt', do: 'moveTo', to: { x: SIDE_A, y: AY } },
    { at: HOME - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    ...walk(HOME - 0.1, 0.35, SIDE_Y, P, ALL),
    { at: HOME + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 語詞那一刻：姑姑走到正中間、放大，滿臉唇印的他站旁邊——姑姑
    { at: PARK + 0.1, actor: 'aunt', do: 'swap', emoji: 'prop:aunt' },
    { at: PARK + 0.1, dur: 0.45, actor: 'aunt', do: 'moveTo', to: { x: MID, y: AY } },
    ...walk(PARK + 0.1, 0.4, YX, P, ALL),
    { at: WORD - 0.05, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-laugh' },
    // 回馬槍：姑姑捧出生日蛋糕，他好感動……
    { at: CAKE, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-cake' },
    { at: CAKE + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    ...jolt(CAKE + 0.2, 'hop', 3, 0.3, ALL),
    // ……這次換他衝過去，跳起來在姑姑臉上「啾」一下
    { at: K4 - 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    ...walk(K4 - 0.4, 0.25, 67, P, ALL, { ease: 'in' }),
    { at: K4 - 0.12, actor: 'yang', do: 'swap', emoji: 'hero:yang/blow' },
    ...jolt(K4 - 0.12, 'hop', 14, 0.5, ALL),
    // 姑姑嚇一跳，然後呵呵大笑
    { at: K4 + 0.05, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-shock' },
    { at: K4 + 0.05, dur: 0.3, actor: 'aunt', do: 'hop', amount: 4 },
    { at: K4 + 0.45, actor: 'aunt', do: 'swap', emoji: 'prop:aunt-laugh' },
    { at: K4 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 問他：姑姑收掉，他跳到左前方、放大
    { at: ASK, dur: 0.3, actor: 'aunt', do: 'vanish' },
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...walk(ASK, 0.4, 32, P + 3, ALL, { arc: 8, ease: 'out' }, ASK_S),
    ...(['yang', ...ALL] as const).map((id): Move => ({ at: ASK, dur: 0.3, actor: id, do: 'scaleTo', amount: ASK_S, ease: 'back' })),
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    ...jolt(12.6, 'hop', 1.5, 0.3, ALL),
    ...jolt(13.1, 'hop', 1.5, 0.3, ALL),
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    ...jolt(ANSWER, 'hop', 7, 0.3, ALL),
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    ...walk(ANSWER + 0.25, 0.22, -45, P + 3, ALL, { ease: 'in' }, ASK_S),
  ],
  builds: [
    // 女從親人的姑姑身上飛出來；十從被掀出箱子、彈起來的他身上；口從親下去的嘴巴
    { at: G1 + 0.02, dur: 0.32, strokes: [0, 1, 2], from: { x: KX, y: AY - 4 }, color: partColor('女') },
    { at: G2 + 0.02, dur: 0.32, strokes: [3, 4], from: { x: YX, y: P - 6 }, color: partColor('十') },
    { at: G3 + 0.02, dur: 0.32, strokes: [5, 6, 7], from: LIPS, color: partColor('口') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang', ...ALL], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    // 第 2 次：箱子抖抖抖、汗
    { at: 3.0, kind: 'sweat', actor: 'hide' },
    ...s2.fx,
    // 停一拍：他屏住呼吸冒汗，姑姑找不到人
    { at: 4.85, kind: 'sweat', actor: 'hide', dur: 0.9 },
    { at: 5.75, kind: 'pop', actor: 'aunt', emoji: '❓', dur: 0.45, scale: 1.2 },
    { at: G3 - 0.25, kind: 'burst', x: YX, y: 58, emoji: '🍃', n: 6, dur: 0.45 },
    ...s3.fx,
    // 回馬槍：蛋糕亮晶晶、他好感動
    { at: CAKE, kind: 'burst', actor: 'aunt', dx: -8, dy: 22, emoji: '✨', n: 6, dur: 0.5 },
    { at: CAKE + 0.2, kind: 'pop', actor: 'yang', emoji: HEART, dur: 0.5, scale: 1.3 },
    // 啾！姑姑臉上一個唇印
    { at: K4 + 0.13, kind: 'pop', actor: 'aunt', emoji: 'prop:kiss-mark', dx: -14, dy: 19.5, dur: 0.8, scale: 0.85 },
    { at: K4 + 0.13, kind: 'burst', x: 112, y: 26, emoji: HEART, n: 1, dur: 0.5, scale: 1.8 },
    { at: K4 + 0.15, kind: 'burst', x: 112, y: 26, emoji: '💕', n: 10, dur: 0.5, scale: 1.0 },
  ],
  camera: [
    // 鏡頭固定在全景，只有啾那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: K4 + 0.13, dur: 0.35, do: 'punch', amount: 0.06, to: { x: 78, y: 50 } },
    { at: K4 + 0.13, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '姑' },
    ...s1.cues,
    { at: 2.55, sfx: 'plop' },
    { at: 2.95, sfx: 'tap' },
    { at: 3.15, sfx: 'tap' },
    { at: G2 - 0.22, sfx: 'poof' },
    ...s2.cues,
    { at: 4.55, sfx: 'poof' },
    { at: 6.05, sfx: 'slide' },
    { at: G3 - 0.25, sfx: 'whoosh' },
    ...s3.cues,
    { at: HOME + 0.1, say: '姑' },
    { at: WORD, say: '姑姑' },
    { at: CAKE, sfx: 'cheer' },
    { at: K4 - 0.4, sfx: 'whoosh' },
    { at: K4 + 0.13, sfx: 'plop' },
    { at: K4 + 0.18, sfx: 'blip' },
    { at: K4 + 0.23, sfx: 'boing' },
    { at: K4 + 0.28, sfx: 'blip' },
    { at: 11.03, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '姑' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
