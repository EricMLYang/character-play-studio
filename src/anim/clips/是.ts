import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 是（v2）：猜影子。右邊立著一面亮亮的白布幕，後面的東西映成一個黑影。熱心的浣熊花生每次很有把握地一指（我知道那是什麼！）——
// 布幕「唰」地升上去：是！就是牠！一個大大的綠色圈圈「叮咚」亮起來（猜對了），那隻動物開心地衝出來撲到他身上，一次比一次大：
// 小貓（撲進他懷裡，他一屁股坐倒）→ 長頸鹿（一頭把他頂扁、滑出去）→
// 先停一拍：影子大到塞滿整面布幕，他吞口水、托著下巴看了又看，才慢慢一指——大象（整隻壓在他身上）。
// 每次猜對的綠色圈圈都「叮」地變成一塊字飛上去：日 → 正的上半 → 正的下半（是＝日＋正，正就是「對的」）。
// 語詞那一刻大象跑回中間，他跳起來指著牠，綠色圈圈再圈一次：「就是」。
// 回馬槍（第四次）：布幕又放下來，這次的影子比布幕還大、張牙舞爪像怪獸，地都在震；他嚇得抱頭蹲下，閉著眼發抖地一指——
// 布幕升上去：是！真的是那個影子——一隻小小的忍者老鼠拿著手電筒（圈圈也小小的）。小老鼠開心地跳到他頭上，他嚇得「哇」地跳到半天高、摔扁。
// 最後畫面暗下來只剩「是」，花生轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「是！」，然後退場只留字。
// 是、是、是、是、就是、是、這是什麼字？、是

/** 花生（明星，size 34） */
const S = 34
const P = 77 - 0.42 * S
/** 花生每次站的地方（布幕的左邊，面向右） */
const X = 46
/** 空字框與讓位後的國字：左上角的天空（花生頭上） */
const FRAME = { x: 33, y: 23 }
const FRAME_K = 0.5

/** 布幕（白色大方塊，染成被燈照亮的米黃色） */
const SCR = 72
const SX = 118
const SY = 77 - 0.42 * SCR
/** 布幕升上去以後停在畫面外 */
const SCR_UP = -60
const CLOTH = 'sepia(.45) saturate(1.8) hue-rotate(-8deg) brightness(1.08)'

/** 布幕後面的東西：同一個角色，每次換一種、換大小（size 20 為準，用 scaleTo 換大小；以腳底為準，所以 y 不用動） */
const BASE = 20
const TY = 77 - 0.42 * BASE
/** 影子：整隻黑掉、有一點透明，像映在布上 */
const SHADOW = 'brightness(0) opacity(.8)'
/** 每次的東西與大小：小貓 → 長頸鹿 → 大象 → 怪獸影子（其實是小老鼠擺忍者架式） → 真的小老鼠 */
const WHO = ['🐈', '🦒', 'prop:elephant', 'hero:mouse/stance'] as const
const SIZE = [20, 48, 58, 66]
const MOUSE = 20

/** 綠色大圈圈（⭕ 染成綠色）：size 10 為準，用 scaleTo 換大小 */
const RING = 10
const GREEN = 'hue-rotate(128deg) saturate(1.5) brightness(.92)'
/** 每次圈圈多大（直徑），跟著東西變大 */
const RING_D = [24, 44, 54, 28]
/** 讓直徑 d 的圈圈中心落在 c：actor 以「腳底」為支點縮放，放大後中心在 y + 0.42 × (RING − d) */
const ringAt = (c: { x: number; y: number }, d: number) => ({ x: c.x, y: c.y - 0.42 * RING + 0.42 * d })
/** 東西的中心（站在地上、size 為 s） */
const mid = (s: number, x = SX) => ({ x, y: 77 - 0.42 * s })

/** 每次撲過來之後他倒在哪裡：坐倒 → 被頂扁滑出去 → 被壓扁 */
const HIT_POSE = ['fall', 'flat', 'flat'] as const
const HIT_X = [X - 3, X - 12, X - 26]
/** 東西撲到他身上停在哪裡 */
const LAND = [
  { x: X + 2, y: P - 2 },
  { x: X + 30, y: 77 - 0.42 * SIZE[1] },
  { x: X + 32, y: 77 - 0.42 * SIZE[2] },
]

/**
 * 「是！」：他很有把握地一指（猜）→ 布幕抖一下（預備）→ 「唰」地升上去，影子變回真的那隻 →
 * 綠色大圈圈「叮咚」亮起來＋鏡頭推近＋唸「是」→ 牠開心地衝過來撲到他身上，同一個「碰」，一次比一次大。
 * k 是第幾次，s 是布幕升上去那一刻。回傳撲到身上那一刻 l。
 */
function guess(s: number, k: number) {
  const c = mid(SIZE[k])
  const g = s + 0.15
  const l = s + 0.95
  const moves: Move[] = [
    // 很有把握地一指：就是那個！
    { at: s - 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: s - 0.45, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    // 布幕抖一下，「唰」地升上去
    { at: s - 0.2, actor: 'screen', do: 'shake', amount: 0.6, dur: 0.2 },
    { at: s, actor: 'screen', do: 'moveTo', to: { x: SX, y: SCR_UP }, dur: 0.2, ease: 'in' },
    { at: s + 0.08, actor: 'thing', do: 'tint', filter: '' },
    { at: s + 0.08, actor: 'thing', do: 'hop', amount: 2, dur: 0.2 },
    // 綠色大圈圈「叮咚」：是！猜對了
    // 圈圈每次重新出場大小從 1 算起：先 pop 再 scaleTo 到這次的直徑
    { at: g - 0.01, actor: 'ring', do: 'moveTo', to: ringAt(c, RING_D[k]), dur: 0.01 },
    { at: g, actor: 'ring', do: 'pop', dur: 0.18 },
    { at: g, actor: 'ring', do: 'scaleTo', amount: RING_D[k] / RING, dur: 0.01 },
    { at: g, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: g, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    { at: s + 0.6, actor: 'ring', do: 'vanish', dur: 0.12 },
    // 牠衝過來了！他傻眼
    { at: s + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: s + 0.5, actor: 'thing', do: 'squash', amount: -0.15, dur: 0.15 },
    { at: s + 0.65, actor: 'thing', do: 'moveTo', to: LAND[k], dur: 0.3, arc: [8, 5, 3][k], ease: 'in' },
    // 碰！
    { at: l, actor: 'raccoon', do: 'swap', emoji: `hero:raccoon/${HIT_POSE[k]}` },
    { at: l, actor: 'raccoon', do: 'moveTo', to: { x: HIT_X[k], y: P }, dur: 0.2 + 0.05 * k, ease: 'out' },
    { at: l, actor: 'raccoon', do: 'squash', amount: 0.2 + 0.1 * k, dur: 0.3 },
  ]
  const fx: Fx[] = [
    // 牠好開心
    { at: l, kind: 'burst', x: LAND[k].x, y: Math.max(20, LAND[k].y - 0.62 * SIZE[k] - 2), emoji: '💕', n: 5 + k, dur: 0.5, scale: 1 + 0.15 * k },
  ]
  if (k >= 1) fx.push({ at: l, kind: 'burst', x: HIT_X[k] - 4, y: P + 2, n: 1, dur: 0.35, scale: 0.9 + 0.4 * k })
  const camera: Camera[] = [
    { at: g, dur: 0.4, do: 'punch', amount: 0.06, to: c },
    { at: l, dur: 0.35, do: 'shake', amount: 0.6 + 0.6 * k },
  ]
  // 同一個「唰——叮咚——碰」，碰一次比一次多疊一個音
  const cues: Cue[] = [
    { at: s, sfx: 'whoosh' },
    { at: g, sfx: 'clink' },
    { at: g + 0.14, sfx: 'blip' },
    { at: g + 0.02, say: '是' },
    { at: l, sfx: 'plop' },
  ]
  if (k >= 1) cues.push({ at: l + 0.03, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: l + 0.06, sfx: 'rumble' })
  return { l, moves, fx, camera, cues }
}

/**
 * 下一個影子：布幕放下來，後面的東西換成第 k 個、變成影子。
 * from 是上一個的大小（scaleTo 會累乘）。
 */
function nextShadow(at: number, k: number, from: number) {
  const moves: Move[] = [
    { at, actor: 'screen', do: 'moveTo', to: { x: SX, y: SY }, dur: 0.22, ease: 'bounce' },
    { at: at + 0.15, actor: 'thing', do: 'moveTo', to: { x: SX, y: TY }, dur: 0.01 },
    { at: at + 0.15, actor: 'thing', do: 'tint', filter: SHADOW },
    { at: at + 0.15, actor: 'thing', do: 'swap', emoji: WHO[k] },
    { at: at + 0.15, actor: 'thing', do: 'scaleTo', amount: SIZE[k] / from, dur: 0.01 },
    { at: at + 0.18, actor: 'thing', do: 'pop', dur: 0.2 },
  ]
  return moves
}

const S1 = 1.1
const g1 = guess(S1, 0)
const N2 = g1.l + 0.45
const S2 = N2 + 0.85
const g2 = guess(S2, 1)
const N3 = g2.l + 0.45
/** 第三次前停一拍：影子塞滿整面布幕，他吞口水、托下巴 */
const PAUSE = N3 + 0.35
const S3 = PAUSE + 0.85
const g3 = guess(S3, 2)
const HOME = g3.l + 0.4
const PARK = HOME + 0.8
/** 語詞「就是」：大象跑回中間，他跳起來指著牠 */
const WORD = PARK + 0.6
const ELE = { x: 104, y: 77 - 0.42 * SIZE[2] }
/** 回馬槍：布幕放下來、怪獸影子 */
const N4 = WORD + 0.35
const S4 = N4 + 0.95
const RX4 = mid(MOUSE)
/** 小老鼠跳到他頭上、他跳到半天高 */
const J4 = S4 + 0.6
/** 回馬槍時他站的地方（往右一點，跳起來才不會擦到左上角的國字） */
const X4 = 60
const FLY = { x: 88, y: 18 }
const LAND4 = { x: 80, y: P }
const ASK = 11.3
const ANSWER = 13.85

const clip: Clip = {
  format: 2,
  char: '是',
  meta: { theme: '猜影子：布幕後面是什麼？', cast: '浣熊花生＋布幕後面的動物（小貓、長頸鹿、大象、小老鼠）＋綠色大圈圈', gags: ['布幕上映著一個黑影，花生每次很有把握地一指，布幕一升上去「是！」就是牠，綠色大圈圈叮咚亮起來，那隻動物開心地衝出來撲到他身上，一次比一次大（小貓撲進懷裡坐倒 → 長頸鹿把他頂扁 → 停一拍、大象整隻壓上來）；回馬槍是影子比布幕還大像怪獸，他嚇得抱頭發抖一指，結果「是」一隻拿手電筒的小老鼠，小老鼠一跳上他的頭，他嚇得跳到半天高摔扁'] },
  duration: 15,
  bg: { top: '#E6F0FF', bottom: '#FFF8EC', floor: '#D9B98C', scenery: 'hills' },
  actors: [
    { id: 'screen', emoji: '⬜', x: SX, y: SY, size: SCR, float: true, tint: CLOTH },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: X, y: P, size: S, flip: true, hidden: true },
    { id: 'thing', emoji: WHO[0], x: SX, y: TY, size: BASE, tint: SHADOW },
    { id: 'ring', emoji: '⭕', x: SX, y: TY, size: RING, hidden: true, float: true, tint: GREEN },
  ],
  moves: [
    // 開場：花生走進來，看到布幕上的影子（小貓的影子在動）
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -20, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 0.2, actor: 'thing', do: 'hop', amount: 2, dur: 0.25 },
    { at: 0.5, actor: 'thing', do: 'tilt', amount: 6, dur: 0.3 },
    // 第 1 次：小貓
    ...g1.moves,
    { at: g1.l + 0.35, actor: 'thing', do: 'moveTo', to: { x: 175, y: TY }, dur: 0.3, arc: 4, ease: 'in' },
    { at: g1.l + 0.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: g1.l + 0.45, actor: 'raccoon', do: 'moveTo', to: { x: X, y: P }, dur: 0.25 },
    ...nextShadow(N2, 1, SIZE[0]),
    { at: N2 + 0.55, actor: 'thing', do: 'tilt', amount: -5, dur: 0.3 },
    // 第 2 次：長頸鹿
    ...g2.moves,
    { at: g2.l + 0.35, actor: 'thing', do: 'moveTo', to: { x: 185, y: TY }, dur: 0.3, ease: 'in' },
    { at: g2.l + 0.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: N3 + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: N3 + 0.2, actor: 'raccoon', do: 'moveTo', to: { x: X, y: P }, dur: 0.25 },
    ...nextShadow(N3, 2, SIZE[1]),
    // 第 3 次前停一拍：影子塞滿整面布幕、晃一晃；他吞口水、托著下巴看
    { at: PAUSE, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: PAUSE + 0.1, actor: 'thing', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: PAUSE + 0.5, actor: 'raccoon', do: 'tilt', amount: 6, dur: 0.3 },
    // 第 3 次：大象
    ...g3.moves,
    // 大象從他身上跳下來、跑出畫面；他扁扁地躺著，字拼好
    { at: g3.l + 0.1, actor: 'thing', do: 'moveTo', to: { x: 200, y: TY }, dur: 0.3, arc: 6, ease: 'in' },
    { at: HOME + 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 語詞那一刻：大象跑回中間，他跳起來指著牠——「就是」！
    { at: PARK + 0.38, actor: 'thing', do: 'moveTo', to: ELE, dur: 0.25, ease: 'out' },
    { at: PARK + 0.4, actor: 'raccoon', do: 'moveTo', to: { x: 62, y: P }, dur: 0.2 },
    { at: PARK + 0.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: WORD - 0.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: WORD - 0.1, actor: 'raccoon', do: 'hop', amount: 5, dur: 0.3 },
    { at: WORD - 0.02, actor: 'ring', do: 'moveTo', to: ringAt(mid(SIZE[2], ELE.x), RING_D[2]), dur: 0.01 },
    { at: WORD, actor: 'ring', do: 'pop', dur: 0.18 },
    { at: WORD, actor: 'ring', do: 'scaleTo', amount: RING_D[2] / RING, dur: 0.01 },
    { at: WORD + 0.05, actor: 'thing', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: N4 - 0.05, actor: 'ring', do: 'vanish', dur: 0.15 },
    { at: N4 - 0.15, actor: 'thing', do: 'moveTo', to: { x: 200, y: TY }, dur: 0.3, ease: 'in' },
    { at: N4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: N4, actor: 'raccoon', do: 'moveTo', to: { x: X4, y: P }, dur: 0.3 },
    // 回馬槍：布幕放下來——影子比布幕還大，張牙舞爪，地都在震
    ...nextShadow(N4, 3, SIZE[2]),
    { at: N4 + 0.5, actor: 'thing', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: N4 + 0.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/scared' },
    { at: N4 + 0.3, actor: 'raccoon', do: 'shake', amount: 1, dur: 0.2 },
    { at: N4 + 0.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/duck' },
    { at: N4 + 0.5, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.25 },
    // 閉著眼、發抖地一指
    { at: S4 - 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: S4 - 0.2, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: S4 - 0.2, actor: 'screen', do: 'shake', amount: 0.6, dur: 0.2 },
    { at: S4, actor: 'screen', do: 'moveTo', to: { x: SX, y: SCR_UP }, dur: 0.2, ease: 'in' },
    // 是！真的是那個影子——小小的忍者老鼠拿著手電筒
    { at: S4 + 0.05, actor: 'thing', do: 'tint', filter: '' },
    { at: S4 + 0.05, actor: 'thing', do: 'swap', emoji: 'hero:mouse/wave' },
    { at: S4 + 0.05, actor: 'thing', do: 'scaleTo', amount: MOUSE / SIZE[3], dur: 0.15, ease: 'out' },
    { at: S4 + 0.14, actor: 'ring', do: 'moveTo', to: ringAt(RX4, RING_D[3]), dur: 0.01 },
    { at: S4 + 0.15, actor: 'ring', do: 'pop', dur: 0.18 },
    { at: S4 + 0.15, actor: 'ring', do: 'scaleTo', amount: RING_D[3] / RING, dur: 0.01 },
    { at: S4 + 0.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: J4 - 0.25, actor: 'ring', do: 'vanish', dur: 0.12 },
    // 小老鼠開心地跳到他頭上——哇！他跳到半天高
    { at: J4 - 0.2, actor: 'thing', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: J4 - 0.2, actor: 'thing', do: 'moveTo', to: { x: X4 + 4, y: P - 8 }, dur: 0.25, arc: 4, ease: 'in' },
    { at: J4, actor: 'raccoon', do: 'moveTo', to: FLY, dur: 0.3, ease: 'out' },
    { at: J4, actor: 'raccoon', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
    { at: J4, actor: 'thing', do: 'moveTo', to: { x: X - 6, y: 77 - 0.42 * BASE }, dur: 0.25, ease: 'in' },
    { at: J4 + 0.3, actor: 'raccoon', do: 'moveTo', to: LAND4, dur: 0.25, ease: 'in' },
    { at: J4 + 0.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    { at: J4 + 0.3, actor: 'thing', do: 'swap', emoji: 'hero:mouse/laugh' },
    // 小老鼠笑著跑掉
    { at: ASK - 0.25, actor: 'thing', do: 'moveTo', to: { x: -30, y: 77 - 0.42 * BASE }, dur: 0.25, ease: 'in' },
    { at: ASK, actor: 'thing', do: 'vanish', dur: 0.05 },
    // 問他：花生跳起來、走到左前方、變大，面向右邊的國字
    // 扁扁地滑回左邊（國字還在左上角，他從字下面滑過去），問他時就站在左前方
    { at: J4 + 0.6, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'out' },
    { at: ASK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK, actor: 'raccoon', do: 'scaleTo', amount: 1.15, dur: 0.3 },
    { at: 12.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 12.4, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.9, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.35, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 7, dur: 0.25 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.03, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.03, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.1, ease: 'in' },
  ],
  builds: [
    // 每次猜對的綠色圈圈「叮」地變成一塊字：日 → 正的上半 → 正的下半
    { at: S1 + 0.47, dur: 0.5, strokes: [0, 1, 2, 3], from: 'ring', color: partColor('日') },
    { at: S2 + 0.47, dur: 0.45, strokes: [4, 5, 6], from: 'ring', color: partColor('正') },
    { at: S3 + 0.47, dur: 0.4, strokes: [7, 8], from: 'ring', color: partColor('正') },
  ],
  glyph: [
    // 空字框在左上角的天空（花生頭上），右邊整個給布幕
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: HOME + 0.45, dur: 0.4, do: 'pulse' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K, ease: 'in' },
    { at: ASK, dur: 2.65, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.05, kind: 'sweat', actor: 'raccoon' },
    { at: PAUSE + 0.45, kind: 'pop', actor: 'raccoon', emoji: '❓', dx: 4, dur: 0.5, scale: 1.3 },
    ...g3.fx,
    // 語詞：大象一圈星星
    { at: WORD, kind: 'burst', x: ELE.x, y: 40, emoji: '🌟', n: 8, dur: 0.5, scale: 1.3 },
    // 回馬槍：怪獸影子一出來地就在震
    { at: N4 + 0.3, kind: 'pop', actor: 'raccoon', emoji: '❗', dx: 2, dur: 0.4, scale: 1.6 },
    { at: N4 + 0.7, kind: 'sweat', actor: 'raccoon' },
    // 小老鼠拿著手電筒
    { at: S4 + 0.1, kind: 'pop', actor: 'thing', emoji: '🔦', dx: -16, dy: 12, dur: J4 - S4 - 0.25, scale: 1.2 },
    { at: J4, kind: 'pop', x: X + 4, y: P - 24, emoji: '❗', dur: 0.35, scale: 1.8 },
    { at: J4 + 0.55, kind: 'burst', x: LAND4.x + 16, y: P + 6, n: 1, dur: 0.25, scale: 2.2 },
    { at: J4 + 0.6, kind: 'dizzy', actor: 'raccoon', dur: 0.45 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.12 },
  ],
  camera: [
    // 花生和布幕都要一直在畫面裡：國字拼好前不讓自動取景推近到只剩一個
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 48 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: PARK + 0.1, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 48 } },
    { at: N4 + 0.5, dur: 0.5, do: 'shake', amount: 1 },
    { at: S4 + 0.15, dur: 0.45, do: 'punch', amount: 0.12, to: RX4 },
    { at: J4 + 0.55, dur: 0.45, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.25 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'tap' },
    ...g1.cues,
    ...g2.cues,
    { at: PAUSE + 0.1, sfx: 'gulp' },
    ...g3.cues,
    { at: HOME + 0.05, say: '是' },
    { at: WORD, say: '就是' },
    { at: WORD + 0.02, sfx: 'clink' },
    { at: WORD + 0.16, sfx: 'blip' },
    { at: N4 + 0.5, sfx: 'rumble' },
    { at: S4, sfx: 'whoosh' },
    { at: S4 + 0.15, sfx: 'clink' },
    { at: S4 + 0.29, sfx: 'blip' },
    { at: S4 + 0.17, say: '是' },
    { at: J4, sfx: 'boing' },
    { at: J4 + 0.55, sfx: 'bonk' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '是' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
