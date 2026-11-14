import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 羊（v2）：一本正經的狗狗警長要大山羊排好隊——每次他「嗶」地吹哨子，山羊就用後腳站起來、刨兩下，再低頭衝過來，「咚」地用額頭和角把他頂住、停一拍再頂飛，一次比一次遠：
// 往後摔坐（兩支羊角一左一右飛上去變成上面兩點）、轉兩圈摔扁在畫面邊（羊的臉頂出兩橫）、先停一拍：他舉著哨子不敢吹、山羊刨地刨個不停……嗶——被頂上天（羊的身體頂出長橫和一豎）。
// 字拼好時山羊在國字旁邊停一拍：左角對左邊的點、右角對右邊的點各亮一下，長得一樣。
// 回馬槍：他學乖了，伸手比「等一下」，山羊真的乖乖站好、點點頭——他得意得吹哨子慶祝，嗶——被頂得最遠。
// 最後畫面暗下來只剩「羊」，警長從天上掉到前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「羊！」，然後退場只留字。
// 羊、羊、山羊、這是什麼字？、羊
const P = 66.9 // 警長（size 24）站在地上的 y
/** 大山羊（prop:goat 只佔畫布寬 0.77、高 0.83，size 44 看起來跟 size 36 的 🐐 一樣大，是畫面上最大的） */
const GS = 44
const G = 77 - 0.42 * GS // 大山羊站在地上的 y
/** 大山羊平常站的地方：字框正下方（左右兩支角在字框兩點的正下面） */
const GX = 83
/** 警長每次站的地方（面向右邊的山羊） */
const SX = 44
/** 頂到的地方：警長胸口（他的右邊） */
const TOUCH = { x: SX + 9, y: P - 3 }
/** 三張山羊屁股對齊的位移（assets/prop-sheets/README.md）：低頭的往左 0.07 × size、站起來的往右 0.074 × size */
const BUTT_DX = -0.07 * GS
const REAR_DX = 0.074 * GS
/** prop:goat-butt 的額頭（頂到人的地方）在畫出來的 x − 0.32 × size */
const BROW = 0.32 * GS
/** prop:goat 的兩支角（照 goat 的 x、y 算），兩點從這裡飛出去 */
const HORN_L = { dx: -6.5, dy: -13.8 }
const HORN_R = { dx: 0.3, dy: -13 }
/** 語詞那一刻山羊變大一點 */
const BIG = 1.1
/** 頂住以後停多久（警長傻眼、看得見臉），才頂飛 */
const HOLD = 0.4
/** 吹哨子到頂到的時間：吹哨 → 站起來刨地 → 低頭往後一縮、衝 → 咚 */
const PRE = 0.85

/**
 * 「嗶—咚」：警長吹哨子（🎵＋嗶）→ 山羊用後腳站起來（goat-rear）、刨兩下揚塵（預備）→ 換低頭（goat-butt）往後一縮、衝過去 →
 * 額頭頂在他胸口那一刻 💥＋白光＋鏡頭推近＋震＋同一個音效，頂住停 HOLD 秒（他傻眼、看得見臉）→ 山羊再一推把他頂飛、站回 goat 退回原位。
 * at 是頂到的那一刻，k 是第幾次（越後面越大），sc 是山羊當下的倍率，home 是牠退回去的地方（null：不退，劇本自己寫）。
 * 飛多遠、怎麼落地每次不同，寫在劇本裡；這裡只管那一下長得一樣。
 */
function butt(at: number, k: number, opt: { sc?: number; home?: number | null } = {}) {
  const { sc = 1, home = GX } = opt
  const w = at - PRE
  const from = home ?? GX
  /** 低頭那張畫在這裡，額頭剛好頂在 TOUCH */
  const hit = TOUCH.x + BROW * sc
  const moves: Move[] = [
    // 吹哨子：一本正經地踮一下
    { at: w, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: w, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.2 },
    // 山羊用後腳站起來、刨兩下
    { at: w + 0.2, actor: 'goat', do: 'swap', emoji: 'prop:goat-rear' },
    { at: w + 0.2, actor: 'goat', do: 'moveTo', to: { x: from + REAR_DX * sc, y: G }, dur: 0.01 },
    { at: w + 0.3, actor: 'goat', do: 'shake', amount: 0.8 + 0.2 * k, dur: 0.25 },
    // 落下來低頭，往後一縮、衝過去
    { at: at - 0.28, actor: 'goat', do: 'swap', emoji: 'prop:goat-butt' },
    { at: at - 0.28, actor: 'goat', do: 'moveTo', to: { x: from + BUTT_DX * sc, y: G }, dur: 0.01 },
    { at: at - 0.26, actor: 'goat', do: 'moveTo', to: { x: hit, y: G }, dur: 0.26, anticipate: 5, ease: 'in' },
    // 咚！頂住他，傻眼
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.25 },
    { at: at + 0.12, actor: 'sheriff', do: 'shake', amount: 0.8 + 0.2 * k, dur: HOLD - 0.12 },
    { at, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.2 },
    // 停一拍，再一推把他頂飛
    { at: at + HOLD - 0.05, actor: 'goat', do: 'moveTo', to: { x: hit - 4, y: G }, dur: 0.12, ease: 'out' },
  ]
  if (home !== null) moves.push(
    // 站回來、退回原位
    { at: at + HOLD + 0.12, actor: 'goat', do: 'swap', emoji: 'prop:goat' },
    { at: at + HOLD + 0.12, actor: 'goat', do: 'moveTo', to: { x: hit - 4 - BUTT_DX * sc, y: G }, dur: 0.01 },
    { at: at + HOLD + 0.14, actor: 'goat', do: 'moveTo', to: { x: home, y: G }, dur: 0.35, ease: 'out' },
  )
  const fx: Fx[] = [
    // 哨子聲（一次比一次大）
    { at: w, kind: 'pop', actor: 'sheriff', emoji: '🎵', dx: 9, dy: 3, dur: 0.45, scale: 1.3 + 0.15 * k },
    // 刨地揚塵
    { at: w + 0.3, kind: 'puff', actor: 'goat', dur: 0.4, scale: 1.6 },
    // 咚：💥 在頂到的地方上面（不蓋住他的臉），一次比一次大
    { at, kind: 'burst', x: TOUCH.x + 3, y: P - 17, n: 1, dur: 0.4, scale: 1.5 + 0.35 * k },
    { at, kind: 'burst', x: TOUCH.x + 3, y: P - 17, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: TOUCH.x, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（哨子「嗶」、頂到「咚」），一次比一次多疊一個
  const cues: Cue[] = [{ at: w, sfx: 'blip' }, { at: w + 0.3, sfx: 'tap' }, { at: at - 0.26, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

const H1 = 1.5, H2 = 3.7, H3 = 6.3, H4 = 10.15
const b1 = butt(H1, 0)
const b2 = butt(H2, 1)
const b3 = butt(H3, 2)
// 回馬槍：語詞那一刻山羊在正中間、變大了；頂完不退回去，直接走掉
const b4 = butt(H4, 3, { sc: BIG, home: null })
/** 頂飛的時刻 */
const F1 = H1 + HOLD, F2 = H2 + HOLD, F3 = H3 + HOLD, F4 = H4 + HOLD
/** 山羊站回原位的時刻（角、臉在字框正下方） */
const BACK1 = H1 + HOLD + 0.5, BACK2 = H2 + HOLD + 0.5
/** 國字拼好、放大到正中央 */
const HOME = 7.35
/** 讓位 */
const PARK = 8.2
/** 國字放大時山羊站在右邊 */
const SIDE = 138
/** 國字在正中央時上面兩點的位置 */
const DOT_L = { x: 72.8, y: 20.9 }
const DOT_R = { x: 86.9, y: 19.5 }
/** 問他 */
const ASK = 10.75
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '羊',
  meta: { theme: '警長要山羊排好隊', cast: '狗狗警長＋大山羊', gags: ['一本正經的警長每次吹哨子要山羊排好，山羊就站起來、刨地、低頭衝過來用角把他頂飛，一次比一次遠；回馬槍是他比等一下、山羊真的乖乖站好，他得意得吹哨子慶祝，被頂得最遠'] },
  duration: 15,
  bg: { top: '#D8F0FF', bottom: '#F4FBFF', floor: '#A9D67E', scenery: 'hills' },
  actors: [
    // 大山羊圖朝左（面向左邊的警長），站在字框正下方
    { id: 'goat', emoji: 'prop:goat', x: GX, y: G, size: GS },
    // 姿勢圖朝左，翻過來面向右邊的山羊
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: P, size: 24, hidden: true, flip: true },
  ],
  moves: [
    // 警長登場，指著上面的字框：羊！
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.35, ease: 'out' },
    { at: 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    // 第 1 次：嗶——咚！往後摔坐
    ...b1.moves,
    { at: F1, actor: 'sheriff', do: 'moveTo', to: { x: 20, y: P }, arc: 10, dur: 0.4, ease: 'out' },
    { at: F1, actor: 'sheriff', do: 'spin', times: -1, dur: 0.4, pivot: 'center' },
    { at: F1 + 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },
    // 山羊站回原位得意地甩頭：兩支羊角飛上去變成兩點
    { at: BACK1, actor: 'goat', do: 'tilt', amount: 6, dur: 0.3 },
    // 爬起來，一本正經地走回去
    { at: 2.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 2.5, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.3 },
    // 第 2 次：嗶——咚！轉兩圈飛到畫面邊、摔扁
    ...b2.moves,
    { at: F2, actor: 'sheriff', do: 'moveTo', to: { x: 12, y: P }, arc: 20, dur: 0.5, ease: 'out' },
    { at: F2, actor: 'sheriff', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    { at: F2 + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    { at: BACK2, actor: 'goat', do: 'tilt', amount: 6, dur: 0.3 },
    { at: 4.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 4.85, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.35 },
    // 第 3 次前停一拍：他舉起哨子、不敢吹，偷看山羊；山羊已經刨地刨個不停
    { at: 5.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' },
    { at: 5.2, actor: 'goat', do: 'shake', amount: 0.8, dur: 0.22 },
    { at: 5.35, actor: 'sheriff', do: 'tilt', amount: -6, dur: 0.3 },
    ...b3.moves,
    // ……嗶——咚！直接被頂上天
    { at: F3, actor: 'sheriff', do: 'squash', amount: -0.2, dur: 0.12 },
    { at: F3, actor: 'sheriff', do: 'moveTo', to: { x: SX - 4, y: -55 }, dur: 0.35, ease: 'out' },
    { at: F3, actor: 'sheriff', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 字拼好前山羊走到國字右邊（b3 退回原位以後）；國字放大時牠在旁邊停一拍：左角對左點、右角對右點，長得一樣
    { at: 7.2, actor: 'goat', do: 'moveTo', to: { x: SIDE, y: G }, dur: 0.4 },
    { at: 7.8, actor: 'goat', do: 'hop', amount: 3, dur: 0.3 },
    // 警長從天上掉回左邊，摔扁
    { at: 7.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 7.4, actor: 'sheriff', do: 'moveTo', to: { x: 20, y: -50 }, dur: 0.01 },
    { at: 7.45, actor: 'sheriff', do: 'moveTo', to: { x: 20, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 語詞那一刻：國字讓回上方，山羊走到正中間、變大（山羊）；警長爬起來走回去，伸手比「等一下」
    { at: 8.3, actor: 'goat', do: 'moveTo', to: { x: GX, y: G }, dur: 0.4 },
    { at: 8.3, actor: 'goat', do: 'scaleTo', amount: BIG, dur: 0.4, ease: 'back' },
    { at: 8.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 8.15, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.3 },
    { at: 8.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wait' },
    // 山羊真的乖乖站好：點兩下頭
    { at: 8.65, actor: 'goat', do: 'hop', amount: 2, dur: 0.22 },
    { at: 8.65, actor: 'goat', do: 'tilt', amount: 5, dur: 0.22 },
    { at: 8.9, actor: 'goat', do: 'hop', amount: 2, dur: 0.22 },
    { at: 8.9, actor: 'goat', do: 'tilt', amount: 5, dur: 0.22 },
    // 回馬槍（第 4 次）：得意……吹哨子慶祝
    { at: 8.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: 8.8, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.25 },
    ...b4.moves,
    // ……咚！被頂得最遠，飛出畫面
    { at: F4, actor: 'sheriff', do: 'moveTo', to: { x: -10, y: -55 }, dur: 0.35, ease: 'out' },
    { at: F4, actor: 'sheriff', do: 'spin', times: -3, dur: 0.35, pivot: 'center' },
    // 山羊心滿意足站起來，走出右邊
    { at: F4 + 0.05, actor: 'goat', do: 'swap', emoji: 'prop:goat' },
    { at: F4 + 0.05, actor: 'goat', do: 'flip' },
    { at: F4 + 0.05, actor: 'goat', do: 'moveTo', to: { x: 200, y: G }, dur: 0.2, ease: 'linear' },
    // 問他：警長從天上掉到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: ASK + 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.55, dur: 0.01 },
    { at: ASK + 0.1, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.0, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 8, dur: 0.2 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 第 1 次：山羊站回原位，兩支羊角一左一右飛上去，變成上面兩點
    { at: BACK1, dur: 0.55, strokes: [0], from: { x: GX + HORN_L.dx, y: G + HORN_L.dy }, color: partColor('羊') },
    { at: BACK1, dur: 0.55, strokes: [1], from: { x: GX + HORN_R.dx, y: G + HORN_R.dy }, color: partColor('羊') },
    // 第 2 次：羊的臉頂出兩橫
    { at: BACK2, dur: 0.5, strokes: [2, 3], from: { x: GX - 8, y: G - 2 }, color: partColor('羊') },
    // 第 3 次：羊的身體頂出長橫和一豎
    { at: F3, dur: 0.55, strokes: [4, 5], from: 'goat', color: partColor('羊') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    // 兩支羊角各閃一下，飛上去
    { at: BACK1 - 0.05, kind: 'burst', x: GX + HORN_L.dx, y: G + HORN_L.dy, emoji: '✨', n: 1, dur: 0.4, scale: 1.1 },
    { at: BACK1 - 0.05, kind: 'burst', x: GX + HORN_R.dx, y: G + HORN_R.dy, emoji: '✨', n: 1, dur: 0.4, scale: 1.1 },
    { at: F1 + 0.45, kind: 'dizzy', actor: 'sheriff', dur: 0.45 },
    ...b2.fx,
    { at: F2 + 0.5, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    // 第 3 次前停一拍：偷看山羊、冒汗；山羊一直刨地
    { at: 5.25, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: 8, dy: 2, dur: 0.55, scale: 1.6 },
    { at: 5.3, kind: 'sweat', actor: 'sheriff' },
    { at: 5.2, kind: 'puff', actor: 'goat', dur: 0.35, scale: 1.6 },
    ...b3.fx,
    // 國字放大：山羊在旁邊，左角和左點、右角和右點一起閃一下——長得一樣
    { at: 7.85, kind: 'burst', x: SIDE + HORN_L.dx, y: G + HORN_L.dy, emoji: '✨', n: 1, dur: 0.45, scale: 1.2 },
    { at: 7.85, kind: 'burst', ...DOT_L, emoji: '✨', n: 1, dur: 0.45, scale: 1.2 },
    { at: 8.05, kind: 'burst', x: SIDE + HORN_R.dx, y: G + HORN_R.dy, emoji: '✨', n: 1, dur: 0.45, scale: 1.2 },
    { at: 8.05, kind: 'burst', ...DOT_R, emoji: '✨', n: 1, dur: 0.45, scale: 1.2 },
    { at: 7.8, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    ...b4.fx,
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：警長每次都被頂到畫面邊、頂上天，自動取景會追著他把山羊切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    { at: F2 + 0.5, dur: 0.25, do: 'shake', amount: 1.2 },
    ...b3.camera,
    { at: 7.15, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.75, dur: 0.3, do: 'shake', amount: 1.2 },
    ...b4.camera,
  ],
  lights: [
    // 每次頂到白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '羊' },
    ...b1.cues,
    { at: BACK1, sfx: 'clink' },
    { at: F1 + 0.4, sfx: 'plop' },
    ...b2.cues,
    { at: F2 + 0.5, sfx: 'plop' },
    ...b3.cues,
    { at: 7.75, sfx: 'plop' },
    { at: HOME + 0.1, say: '羊' },
    { at: 8.6, say: '山羊' },
    ...b4.cues,
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '羊' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
