import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 晚（v2）：好晚了，小骷髏還不睡。月亮每次點點頭（晚安）、燈一暗，他就從床上偷偷爬起來玩，一次比一次吵——
// 月亮被吵醒，「叮」地睜大眼睛一瞪、燈一下子全亮，月亮還脹大一圈；他傻眼停住，嚇得往後一撲、飛回床上裝睡（筆畫從月光裡飛出來）：
// 踮腳偷溜、摀嘴偷笑（日）→ 跳舞、音符亂飛（⺈＋中間那一塊）→ 先停一拍：躺在床上睜一隻眼偷看月亮、月亮在打呼……
// 偷偷溜到右邊那面大鑼前，舉手「鏘——！」（儿），被瞪得跳好高、轉兩圈撲回床上。
// 語詞那一刻他跳到中間，乖乖對月亮鞠躬：「晚安」。月亮點點頭、燈暗了。
// 回馬槍（第四次）：燈一暗他又衝去敲鑼，一連兩下、把鑼敲飛出畫面；月亮瞪得最大——他照樣撲回床上，
// 可是月亮被吵了四次，累壞了，搶先「咻」地鑽進他的床、蓋好被子打呼；他一頭撞在月亮上彈起來，月亮連床一起飄回天上，他一屁股跌坐在地上。
// 最後畫面暗下來只剩「晚」，小骷髏站起來問「這是什麼字？」，手放耳邊等他回答，再指著字說「晚！」，然後退場只留字。
// 刻意不跟「早」（公雞叫起床）、「今」（太陽把他從床上轟起來）、「公」（阿公講故事睡著、💤 砸人）撞：這支只演「燈暗偷玩→月亮一瞪→撲回床上裝睡」。
// 晚、晚、晚安、這是什麼字？、晚

/** 小骷髏（hero:jerry，第九位明星；圖朝左，flip 朝右看月亮和鑼） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 床：左邊（國字回中央時不擋字），翻過來讓床頭在右邊、他躺下時頭靠床頭 */
const BS = 40
const BED: Vec = { x: 26, y: 77 - 0.42 * BS }
/** 躺在床上（腳底在床墊上） */
const LIE: Vec = { x: 27, y: BED.y - 1.7 - 0.42 * JS }
/** 下床落地的地方 */
const OUT: Vec = { x: 52, y: JY }
/** 每次都溜到同一個地方玩：右邊、大鑼前面 */
const PX = 108
const PLAY: Vec = { x: PX, y: JY }
/** 語詞那一刻他站的地方：畫面正中間 */
const MID: Vec = { x: 80, y: JY }
/** 大鑼：右邊地上，開場就在（小孩看得到，猜得到他早晚要敲） */
const GS = 26
const GONG: Vec = { x: 136, y: 77 - 0.42 * GS }
/** 月亮：右上角；每瞪一次脹大一圈，不會再縮回去 */
const MOON: Vec = { x: 134, y: 27 }
const MOON_SIZE = [26, 30, 34, 38, 42]
/** 燈暗下來的程度（他一身黑，不能太暗） */
const DIM = 0.2
/** 被瞪到傻眼停多久 */
const HOLD = 0.42
/** 撲回床上飛多久 */
const DIVE = [0.36, 0.4, 0.46, 0.3]

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[]; land: number }

/**
 * 月亮一瞪：月亮先抖一下（被吵醒，預備）→「叮」睜大眼睛一瞪、脹大一圈、白光一閃燈全亮、旁邊冒 💢（一次比一次大）＋鏡頭推近＋震；
 * 小孩傻眼停 HOLD 秒（看得見臉），再嚇得回頭往後一撲、飛回床上換成睡覺的樣子裝睡、冒汗。
 * k 是第幾次（0～3），越後面越大：跳得越高、轉越多圈、💢 越大、白光越亮、音效多疊一個。
 * 第 4 次（k = 3）不飛回床上（回馬槍自己寫），land 是他撲到床上的時間。
 */
function glare(at: number, k: number): Gag {
  const grow = MOON_SIZE[k + 1] / MOON_SIZE[k]
  const land = at + HOLD + DIVE[k]
  /** 瞪完的月亮大小、蓋上去那雙眼睛的倍率 */
  const S = MOON_SIZE[k + 1]
  const eyes = 0.051 * S
  const moves: Move[] = [
    // 被吵醒：月亮抖一下
    { at: at - 0.25, actor: 'moon', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.22 },
    // 瞪！脹大一圈（留下來，不縮回去）
    { at, actor: 'moon', do: 'scaleTo', amount: grow, dur: 0.16, ease: 'back' },
    { at, actor: 'moon', do: 'flash', dur: 0.35 },
    // 傻眼：跳一下、停住
    { at, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at, actor: 'jerry', do: 'hop', amount: 3 + 3 * k, dur: 0.3 },
  ]
  if (k < 3) {
    moves.push(
      // 嚇得回頭往後一撲（flee 本來就是往右跑回頭看左邊；他是 flip 的，所以往左逃、回頭看右邊的月亮）
      { at: at + HOLD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flee' },
      { at: at + HOLD, actor: 'jerry', do: 'moveTo', to: LIE, arc: 8 + 4 * k, dur: DIVE[k], ease: 'inOut' },
      // 飛回床上裝睡；床被撞得一沉
      { at: land, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/sleep' },
      { at: land, actor: 'bed', do: 'squash', amount: 0.15 + 0.1 * k, dur: 0.3 },
    )
    if (k >= 1) moves.push({ at: at + HOLD, actor: 'jerry', do: 'spin', times: k, dur: DIVE[k], pivot: 'center' })
  }
  const fx: Fx[] = [
    // 月亮睜大眼睛：一雙大眼睛蓋在閉著的眼睛上
    // （單一個 burst 停在原地不上下飄，大小 11 乘上 scale：寬度約半個月亮，正好蓋在月亮閉著的眼睛上）
    { at, kind: 'burst', n: 1, emoji: '👀', x: MOON.x, y: MOON.y - 0.12 * S, dur: k < 3 ? HOLD + 0.25 : 0.4, scale: eyes },
    // 💢 在月亮左下方，一次比一次大
    { at: at + 0.04, kind: 'pop', actor: 'moon', emoji: '💢', dx: -0.55 * MOON_SIZE[k + 1], dy: 0.6 * MOON_SIZE[k + 1], dur: k < 3 ? HOLD + 0.1 : 0.3, scale: 1.2 + 0.3 * k },
  ]
  if (k < 3) fx.push({ at: land + 0.1, kind: 'sweat', actor: 'jerry', dx: 6 })
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: k < 3 ? 0.07 + 0.03 * k : 0.08, to: { x: 122, y: 45 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  // 燈一下子全亮：白光一閃，一次比一次亮，之後就亮著（等他裝睡、月亮點頭才再暗）
  const lights: Light[] = [
    { at, dur: 0.05, level: -(0.25 + 0.06 * k) },
    { at: at + 0.05, dur: 0.25, level: 0 },
  ]
  // 同一個音效（叮＋咚），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'blip' }, { at: at + 0.03, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'crack' })
  if (k < 3) cues.push({ at: at + HOLD, sfx: 'whoosh' }, { at: land, sfx: 'plop' })
  return { moves, fx, camera, cues, lights, land }
}

/** 月亮點點頭（晚安）、打呼，燈暗下來 */
function goodnight(at: number): Gag {
  return {
    moves: [{ at, actor: 'moon', do: 'tilt', amount: 14, dur: 0.4 }],
    fx: [{ at: at + 0.2, kind: 'zzz', actor: 'moon', dx: -16, dy: 18, dur: 0.8 }],
    camera: [],
    cues: [{ at: at + 0.2, sfx: 'tap' }],
    lights: [{ at: at + 0.2, dur: 0.3, level: DIM }],
    land: at,
  }
}

/** 從床上爬起來、跳下床（燈暗著） */
function getUp(at: number, pose: string): Move[] {
  return [
    { at, actor: 'jerry', do: 'swap', emoji: `hero:jerry/${pose}` },
    { at, actor: 'jerry', do: 'moveTo', to: OUT, arc: 6, dur: 0.22 },
  ]
}

// 開場：在床上跳、指著字框——晚！月亮點頭，燈暗，他倒下去裝睡
const n0 = goodnight(0.8)
// 第 1 次：踮腳偷溜、摀嘴偷笑
const H1 = 1.8
const g1 = glare(H1, 0)
const n1 = goodnight(g1.land + 0.08)
// 第 2 次：跳舞
const H2 = 3.85
const g2 = glare(H2, 1)
const n2 = goodnight(g2.land + 0.08)
// 第 3 次：先停一拍偷看月亮，溜去敲鑼
const BANG3 = 6.0
const H3 = BANG3 + 0.15
const g3 = glare(H3, 2)
/** 字框填滿、國字到正中央 */
const HOME = g3.land + 0.05
const PARK = HOME + 1.25
/** 語詞那一刻：跳到中間鞠躬 */
const WORD = PARK + 0.4
const n3 = goodnight(WORD + 0.15)
// 回馬槍（第 4 次）：衝去敲鑼兩下（第二下把鑼敲飛）
const BANG4 = WORD + 0.58
const H4 = BANG4 + 0.3
const g4 = glare(H4, 3)
/** 撲回床上，月亮搶先鑽進去 */
const DIVE4 = H4 + HOLD
const CRASH = DIVE4 + DIVE[3]
/** 問他 */
const ASK = CRASH + 0.5
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（左前方，國字讓到右邊） */
const ASK_AT: Vec = { x: 34, y: JY + 4 }

const clip: Clip = {
  format: 2,
  char: '晚',
  meta: { theme: '小骷髏太晚了還不睡', cast: '小骷髏＋月亮＋床＋大鑼', gags: ['好晚了小骷髏還不睡：月亮每次點頭說晚安、燈一暗，他就偷偷爬起來玩，一次比一次吵（踮腳偷笑→跳舞→敲大鑼），月亮被吵醒睜大眼睛一瞪、燈全亮、脹大一圈，他傻眼再撲回床上裝睡；回馬槍是他又敲鑼把鑼敲飛，照樣撲回床上，卻是累壞的月亮搶先鑽進他的床打呼，他彈出來、月亮連床飄回天上'] },
  duration: 15,
  bg: { top: '#232A6E', bottom: '#8E86D6', floor: '#E2CFA6', scenery: 'night' },
  actors: [
    { id: 'gong', emoji: 'prop:gong', x: GONG.x, y: GONG.y, size: GS },
    { id: 'bed', emoji: '🛏️', x: BED.x, y: BED.y, size: BS, flip: true },
    // 開場站在床上（腳底在床墊上）
    { id: 'jerry', emoji: 'hero:jerry/happy', x: LIE.x, y: LIE.y, size: JS, flip: true },
    // 月亮畫在燈暗的黑幕上面：燈暗了它還是亮的
    { id: 'moon', emoji: '🌝', x: MOON.x, y: MOON.y, size: MOON_SIZE[0], float: true, top: true, pivot: 'center' },
  ],
  moves: [
    // 開場：好晚了還在床上跳——指著字框：晚！
    { at: 0.05, actor: 'jerry', do: 'hop', amount: 5, dur: 0.3 },
    { at: 0.4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    // 月亮點頭（晚安），燈暗，他倒下去裝睡
    ...n0.moves,
    { at: 0.95, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/sleep' },
    // 第 1 次：爬起來，踮腳偷溜到鑼前面，摀嘴偷笑
    ...getUp(1.1, 'sneak'),
    { at: 1.32, actor: 'jerry', do: 'moveTo', to: PLAY, dur: 0.28 },
    ...[1.33, 1.47].map((at): Move => ({ at, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.14 })),
    { at: 1.62, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/giggle' },
    ...g1.moves,
    ...n1.moves,
    // 第 2 次：爬起來，跳著跑過去，跳舞
    ...getUp(n1.land + 0.19, 'happy'),
    { at: n1.land + 0.41, actor: 'jerry', do: 'moveTo', to: PLAY, dur: 0.25 },
    { at: H2 - 0.51, actor: 'jerry', do: 'hop', amount: 5, dur: 0.24 },
    { at: H2 - 0.51, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: H2 - 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: H2 - 0.27, actor: 'jerry', do: 'hop', amount: 5, dur: 0.24 },
    ...g2.moves,
    ...n2.moves,
    // 第 3 次前停一拍：躺著偷看月亮（月亮在打呼）……溜過去，手舉高——鏘！
    { at: n2.land + 0.25, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/peek' },
    { at: n2.land + 0.25, actor: 'jerry', do: 'moveTo', to: { x: LIE.x + 4, y: LIE.y }, dur: 0.15 },
    ...getUp(BANG3 - 0.58, 'sneak'),
    { at: BANG3 - 0.36, actor: 'jerry', do: 'moveTo', to: PLAY, dur: 0.23 },
    { at: BANG3 - 0.13, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/throw' },
    { at: BANG3, actor: 'gong', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: BANG3, actor: 'gong', do: 'squash', amount: 0.15, dur: 0.2 },
    ...g3.moves,
    // 語詞：國字讓位，他跳到中間、乖乖對月亮鞠躬——晚安
    { at: PARK + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: PARK + 0.12, actor: 'jerry', do: 'moveTo', to: MID, arc: 3, dur: 0.26 },
    { at: WORD, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/bow' },
    ...n3.moves,
    // 回馬槍：燈一暗，偷笑、衝去敲鑼——鏘！鏘！第二下把鑼敲飛
    { at: WORD + 0.38, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dash' },
    { at: WORD + 0.38, actor: 'jerry', do: 'moveTo', to: PLAY, dur: 0.18 },
    { at: BANG4 - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/throw' },
    { at: BANG4, actor: 'gong', do: 'shake', amount: 1.8, dur: 0.15 },
    { at: BANG4 + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/laugh' },
    { at: BANG4 + 0.15, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/throw' },
    { at: BANG4 + 0.2, actor: 'gong', do: 'moveTo', to: { x: 185, y: 30 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: BANG4 + 0.2, actor: 'gong', do: 'spin', times: 1, dur: 0.45 },
    ...g4.moves,
    // 照樣撲回床上——累壞的月亮搶先咻地鑽進他的床
    { at: DIVE4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flee' },
    { at: DIVE4, actor: 'jerry', do: 'moveTo', to: { x: LIE.x + 6, y: LIE.y }, arc: 2, dur: DIVE[3] },
    // 月亮瞪完馬上咻地搶先鑽進床裡（比他快），打呼
    { at: H4 + 0.3, actor: 'moon', do: 'moveTo', to: { x: BED.x + 7, y: BED.y - 9 }, dur: 0.25, ease: 'in' },
    { at: H4 + 0.3, actor: 'moon', do: 'scaleTo', amount: 0.6, dur: 0.25 },
    { at: H4 + 0.55, actor: 'moon', do: 'rotateTo', amount: -25, dur: 0.15 },
    { at: CRASH - 0.05, actor: 'bed', do: 'squash', amount: 0.3, dur: 0.3 },
    // 一頭撞在月亮上彈起來
    { at: CRASH, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: CRASH, actor: 'jerry', do: 'moveTo', to: { x: 46, y: 30 }, dur: 0.22, ease: 'out' },
    { at: CRASH, actor: 'moon', do: 'squash', amount: 0.25, dur: 0.25 },
    // 月亮連床一起飄回天上
    { at: CRASH + 0.18, actor: 'bed', do: 'moveTo', to: { x: BED.x - 6, y: -40 }, dur: 0.3, ease: 'in' },
    { at: CRASH + 0.18, actor: 'moon', do: 'moveTo', to: { x: BED.x + 1, y: -49 }, dur: 0.3, ease: 'in' },
    // 他一屁股跌坐在地上（問他的位置）
    { at: CRASH + 0.22, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.25, ease: 'in' },
    { at: CRASH + 0.47, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    // 問他：站起來、變大
    { at: ASK + 0.25, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.25, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/listen' },
    { at: ASK_SAY + 1.0, actor: 'jerry', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'jerry', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: ANSWER, actor: 'jerry', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/happy' },
    { at: ANSWER + 0.3, actor: 'jerry', do: 'moveTo', to: { x: -45, y: ASK_AT.y }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 每次月亮一瞪，筆畫就從那道月光裡飛出來
    { at: H1 + 0.08, dur: 0.5, strokes: [0, 1, 2, 3], from: 'moon', color: partColor('日') },
    { at: H2 + 0.08, dur: 0.5, strokes: [4, 5], from: 'moon', color: partColor('⺈') },
    { at: H2 + 0.12, dur: 0.5, strokes: [6, 7, 8], from: 'moon', color: partColor('兔身') },
    { at: H3 + 0.08, dur: 0.45, strokes: [9, 10], from: 'moon', color: partColor('儿') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...n0.fx,
    { at: 1.0, kind: 'zzz', actor: 'jerry', dx: 8, dur: 0.1 },
    ...g1.fx,
    { at: 1.64, kind: 'pop', actor: 'jerry', emoji: '🎵', dx: 8, dur: 0.3 },
    ...n1.fx,
    // 跳舞：音符亂飛
    { at: H2 - 0.48, kind: 'burst', actor: 'jerry', emoji: '🎵', n: 4, dur: 0.45 },
    { at: H2 - 0.25, kind: 'burst', actor: 'jerry', emoji: '🎶', n: 5, dur: 0.4 },
    ...g2.fx,
    ...n2.fx,
    // 第 3 次前停一拍：睜一隻眼偷看月亮
    { at: n2.land + 0.3, kind: 'pop', actor: 'jerry', emoji: '👀', dx: 8, dy: 6, dur: 0.45, scale: 1.2 },
    // 鏘！
    { at: BANG3, kind: 'burst', actor: 'gong', n: 1, dur: 0.35, scale: 1.6 },
    { at: BANG3, kind: 'burst', actor: 'gong', emoji: '🎶', n: 6, dur: 0.45 },
    ...g3.fx,
    // 字框填滿
    { at: WORD + 0.1, kind: 'pop', actor: 'moon', emoji: '💕', dx: -12, dy: 16, dur: 0.5 },
    ...n3.fx,
    // 回馬槍：鏘！鏘！
    { at: BANG4, kind: 'burst', actor: 'gong', n: 1, dur: 0.3, scale: 1.8 },
    { at: BANG4 + 0.2, kind: 'burst', x: GONG.x - 4, y: GONG.y - 6, n: 1, dur: 0.35, scale: 2.4 },
    { at: BANG4 + 0.2, kind: 'burst', x: GONG.x - 4, y: GONG.y - 6, emoji: '🎶', n: 8, dur: 0.5 },
    ...g4.fx,
    { at: CRASH, kind: 'burst', x: BED.x + 4, y: BED.y - 20, n: 1, dur: 0.3, scale: 1.5 },
    { at: H4 + 0.55, kind: 'zzz', actor: 'moon', dx: 2, dy: 4, dur: 0.5, scale: 1.4 },
    { at: CRASH + 0.5, kind: 'dizzy', actor: 'jerry', dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    // 國字回中央那一秒起改成手寫全景（自動取景會推近切到月亮與鑼）
    { at: HOME, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g4.camera,
  ],
  lights: [
    ...n0.lights,
    ...g1.lights,
    ...n1.lights,
    ...g2.lights,
    ...n2.lights,
    ...g3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...n3.lights,
    ...g4.lights,
  ],
  cues: [
    { at: 0.45, say: '晚' },
    ...n0.cues,
    ...[1.33, 1.47].map((at): Cue => ({ at, sfx: 'tap' })),
    ...g1.cues,
    ...n1.cues,
    { at: H2 - 0.51, sfx: 'boing' },
    { at: H2 - 0.27, sfx: 'boing' },
    ...g2.cues,
    ...n2.cues,
    { at: BANG3, sfx: 'clink' },
    { at: BANG3 + 0.02, sfx: 'crack' },
    ...g3.cues,
    { at: HOME + 0.2, say: '晚' },
    { at: WORD, say: '晚安' },
    ...n3.cues,
    { at: BANG4, sfx: 'clink' },
    { at: BANG4 + 0.2, sfx: 'clink' },
    { at: BANG4 + 0.22, sfx: 'crack' },
    ...g4.cues,
    { at: CRASH, sfx: 'boing' },
    { at: CRASH + 0.47, sfx: 'plop' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '晚' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
