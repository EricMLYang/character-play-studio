import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 羊（v2）：一本正經的狗狗警長要大山羊排好隊——每次他「嗶」地吹哨子，山羊就前腳一抬往後仰、後腳刨地、低頭衝過來，「咚」地用角把他頂飛，一次比一次遠：
// 往後摔坐（兩支羊角變成上面兩點）、轉兩圈摔扁在畫面邊（羊的臉頂出兩橫）、先停一拍：他舉著哨子不敢吹、山羊刨地刨個不停……嗶——被頂上天（羊的身體頂出長橫和一豎）。
// 字拼好時山羊在國字旁邊停一拍：角對著兩點，長得一樣。
// 回馬槍：他學乖了，伸手比「等一下」，山羊真的乖乖站好——他得意得吹哨子慶祝，嗶——被頂得最遠。
// 最後畫面暗下來只剩「羊」，警長從天上掉到前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「羊！」，然後退場只留字。
// 羊、羊、山羊、這是什麼字？、羊
const P = 66.9 // 警長（size 24）站在地上的 y
const GS = 36 // 大山羊的 size（畫面上最大）
const G = 77 - 0.42 * GS // 大山羊站在地上的 y
/** 大山羊平常站的地方：字框正下方（角在字框兩點的正下面） */
const GX = 84
/** 警長每次站的地方（面向右邊的山羊） */
const SX = 44
/** 山羊頂到他的時候站的地方（鼻子碰到警長） */
const HIT = 71
/** 語詞那一刻山羊變大一點 */
const BIG = 1.12
/** 預備：前腳抬起、整隻往後仰（山羊頂人前會先立起來） */
const REAR = 16
/** 衝過去時低頭（頭朝左下），用角頂 */
const DIP = -10
/** 頂到以後傻眼停多久，才飛出去 */
const HOLD = 0.4
/** 吹哨子到頂到的時間：吹哨 → 低頭刨地 → 往後縮、衝 → 咚 */
const PRE = 0.85

/**
 * 「嗶—咚」：警長吹哨子（🎵＋嗶）→ 山羊往後仰、後腳刨地揚塵（預備）→ 往後一縮、低頭衝過去 → 用角頂到那一刻 💥＋白光＋鏡頭推近＋震＋同一個音效，
 * 警長傻眼停 HOLD 秒（看得見臉）才飛出去；山羊抬頭退回原位。at 是頂到的那一刻，k 是第幾次（越後面越大），
 * hit 是山羊頂到時站的地方，home 是牠退回去的地方（null：不退，劇本自己寫）。飛多遠、怎麼落地每次不同，寫在劇本裡；這裡只管那一下長得一樣。
 */
function butt(at: number, k: number, hit = HIT, home: number | null = GX) {
  const w = at - PRE
  const moves: Move[] = [
    // 吹哨子：一本正經地踮一下
    { at: w, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: w, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.2 },
    // 山羊往後仰、後腳刨地（抖兩下）
    { at: w + 0.25, actor: 'goat', do: 'rotateTo', amount: REAR, dur: 0.15 },
    { at: w + 0.3, actor: 'goat', do: 'shake', amount: 0.8 + 0.2 * k, dur: 0.25 },
    // 往後一縮助跑、衝過去（往後仰的頭甩下來）
    { at: at - 0.25, actor: 'goat', do: 'moveTo', to: { x: hit, y: G }, dur: 0.25, anticipate: 5, ease: 'in' },
    // 衝的時候低頭，角朝前
    { at: at - 0.25, actor: 'goat', do: 'rotateTo', amount: DIP - REAR, dur: 0.15 },
    // 咚！傻眼
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'squash', amount: 0.25 + 0.08 * k, dur: 0.25 },
    { at: at + 0.12, actor: 'sheriff', do: 'shake', amount: 0.8 + 0.2 * k, dur: HOLD - 0.12 },
    { at, actor: 'goat', do: 'squash', amount: 0.15, dur: 0.2 },
    // 山羊抬頭、退回原位
    { at: at + 0.2, actor: 'goat', do: 'rotateTo', amount: -DIP, dur: 0.2 },
  ]
  if (home !== null) moves.push({ at: at + 0.25, actor: 'goat', do: 'moveTo', to: { x: home, y: G }, dur: 0.35, ease: 'out' })
  const fx: Fx[] = [
    // 哨子聲（一次比一次大）
    { at: w, kind: 'pop', actor: 'sheriff', emoji: '🎵', dx: 9, dy: 3, dur: 0.45, scale: 1.3 + 0.15 * k },
    // 刨地揚塵
    { at: w + 0.3, kind: 'puff', actor: 'goat', dur: 0.4, scale: 1.6 },
    // 咚：💥 在角頂到的地方（警長臉的右邊，不蓋住臉），一次比一次大
    { at, kind: 'burst', x: hit - 11, y: P - 17, n: 1, dur: 0.4, scale: 1.5 + 0.35 * k },
    { at, kind: 'burst', x: hit - 11, y: P - 17, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: hit - 10, y: P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（哨子「嗶」、頂到「咚」），一次比一次多疊一個
  const cues: Cue[] = [{ at: w, sfx: 'blip' }, { at: w + 0.3, sfx: 'tap' }, { at: at - 0.25, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

const H1 = 1.5, H2 = 3.7, H3 = 6.3, H4 = 10.05
const b1 = butt(H1, 0)
const b2 = butt(H2, 1)
const b3 = butt(H3, 2)
// 回馬槍：語詞那一刻山羊在正中間、變大了，頂到的地方往右一點
const b4 = butt(H4, 3, HIT + 2, null)
/** 頂完飛出去的時刻 */
const F1 = H1 + HOLD, F2 = H2 + HOLD, F3 = H3 + HOLD, F4 = H4 + HOLD
/** 國字拼好、放大到正中央 */
const HOME = 7.35
/** 讓位 */
const PARK = 8.2

const clip: Clip = {
  format: 2,
  char: '羊',
  meta: { theme: '警長要山羊排好隊', cast: '狗狗警長＋大山羊', gags: ['一本正經的警長每次吹哨子要山羊排好，山羊就低頭、後腳刨地、助跑用角把他頂飛，一次比一次遠；回馬槍是他比等一下、山羊真的乖乖站好，他得意得吹哨子慶祝，被頂得最遠'] },
  duration: 15,
  bg: { top: '#D8F0FF', bottom: '#F4FBFF', floor: '#A9D67E', scenery: 'hills' },
  actors: [
    // 大山羊圖朝左（面向左邊的警長），站在字框正下方
    { id: 'goat', emoji: '🐐', x: GX, y: G, size: GS },
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
    // 山羊得意地甩頭：兩支羊角飛上去變成兩點
    { at: 2.15, actor: 'goat', do: 'tilt', amount: 8, dur: 0.3 },
    // 爬起來，一本正經地走回去
    { at: 2.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 2.5, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.3 },
    // 第 2 次：嗶——咚！轉兩圈飛到畫面邊、摔扁
    ...b2.moves,
    { at: F2, actor: 'sheriff', do: 'moveTo', to: { x: 12, y: P }, arc: 20, dur: 0.5, ease: 'out' },
    { at: F2, actor: 'sheriff', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    { at: F2 + 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    { at: 4.35, actor: 'goat', do: 'tilt', amount: 8, dur: 0.3 },
    { at: 4.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 4.85, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.35 },
    // 第 3 次前停一拍：他舉起哨子、不敢吹，偷看山羊；山羊已經低頭刨地刨個不停
    { at: 5.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' },
    { at: 5.2, actor: 'goat', do: 'shake', amount: 0.8, dur: 0.22 },
    { at: 5.35, actor: 'sheriff', do: 'tilt', amount: -6, dur: 0.3 },
    ...b3.moves,
    // ……嗶——咚！直接被頂上天
    { at: F3, actor: 'sheriff', do: 'squash', amount: -0.2, dur: 0.12 },
    { at: F3, actor: 'sheriff', do: 'moveTo', to: { x: SX - 4, y: -55 }, dur: 0.35, ease: 'out' },
    { at: F3, actor: 'sheriff', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    // 字拼好前山羊走到國字右邊；國字放大時牠在旁邊停一拍：角對著兩點，長得一樣
    { at: 6.95, actor: 'goat', do: 'moveTo', to: { x: 132, y: G }, dur: 0.4 },
    { at: 7.8, actor: 'goat', do: 'hop', amount: 4, dur: 0.3 },
    // 警長從天上掉回左邊，摔扁
    { at: 7.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 7.4, actor: 'sheriff', do: 'moveTo', to: { x: 20, y: -50 }, dur: 0.01 },
    { at: 7.45, actor: 'sheriff', do: 'moveTo', to: { x: 20, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 語詞那一刻：國字讓回上方，山羊走到正中間、變大，抬頭挺胸（山羊）；警長爬起來走回去
    { at: 8.25, actor: 'goat', do: 'moveTo', to: { x: GX, y: G }, dur: 0.4 },
    { at: 8.25, actor: 'goat', do: 'scaleTo', amount: BIG, dur: 0.4, ease: 'back' },
    { at: 8.7, actor: 'goat', do: 'hop', amount: 5, dur: 0.35 },
    { at: 8.25, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 8.25, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.3 },
    // 回馬槍（第 4 次）：他伸手比「等一下」，山羊真的乖乖站好——得意……吹哨子慶祝
    { at: 8.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wait' },
    { at: 8.8, actor: 'goat', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 8.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: 8.95, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.25 },
    ...b4.moves,
    // ……咚！被頂得最遠，飛出畫面
    { at: F4, actor: 'sheriff', do: 'moveTo', to: { x: -10, y: -55 }, dur: 0.35, ease: 'out' },
    { at: F4, actor: 'sheriff', do: 'spin', times: -3, dur: 0.35, pivot: 'center' },
    // 山羊心滿意足走出右邊
    { at: 10.3, actor: 'goat', do: 'flip' },
    { at: 10.3, actor: 'goat', do: 'moveTo', to: { x: 200, y: G }, dur: 0.3, ease: 'linear' },
    // 問他：警長從天上掉到左前方、變大，轉向觀眾
    { at: 10.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 10.6, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: 10.6, actor: 'sheriff', do: 'scaleTo', amount: 1.55, dur: 0.01 },
    { at: 10.65, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.9, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 11.9, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.45, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.95, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 13.45, actor: 'sheriff', do: 'hop', amount: 8, dur: 0.3 },
    // 退場（跑走），畫面只留下字
    { at: 13.72, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: 13.72, actor: 'sheriff', do: 'flip' },
    { at: 13.75, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：兩支羊角（一左一右）飛上去，變成上面兩點
    { at: 2.15, dur: 0.55, strokes: [0], from: { x: GX - 8, y: G - 12 }, color: partColor('羊') },
    { at: 2.15, dur: 0.55, strokes: [1], from: { x: GX, y: G - 13 }, color: partColor('羊') },
    // 第 2 次：羊的臉頂出兩橫
    { at: 4.35, dur: 0.5, strokes: [2, 3], from: { x: GX - 11, y: G - 6 }, color: partColor('羊') },
    // 第 3 次：羊的身體頂出長橫和一豎
    { at: F3, dur: 0.55, strokes: [4, 5], from: 'goat', color: partColor('羊') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: 10.5, dur: 3.45, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.55, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    // 羊角一閃，飛上去
    { at: 2.1, kind: 'burst', x: GX - 4, y: G - 14, emoji: '✨', n: 1, dur: 0.4, scale: 1.2 },
    { at: F1 + 0.45, kind: 'dizzy', actor: 'sheriff', dur: 0.45 },
    ...b2.fx,
    { at: F2 + 0.5, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    // 第 3 次前停一拍：偷看山羊、冒汗；山羊一直刨地
    { at: 5.25, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: 8, dy: 2, dur: 0.55, scale: 1.6 },
    { at: 5.3, kind: 'sweat', actor: 'sheriff' },
    { at: 5.2, kind: 'puff', actor: 'goat', dur: 0.35, scale: 1.6 },
    ...b3.fx,
    // 國字放大：山羊在旁邊，角對著兩點——一起閃一下
    { at: 7.85, kind: 'burst', x: 132 - 6, y: G - 14, emoji: '✨', n: 1, dur: 0.5, scale: 1.3 },
    { at: 7.85, kind: 'burst', x: 73, y: 18, emoji: '✨', n: 1, dur: 0.5, scale: 1.1 },
    { at: 7.85, kind: 'burst', x: 87, y: 17, emoji: '✨', n: 1, dur: 0.5, scale: 1.1 },
    { at: 7.8, kind: 'dizzy', actor: 'sheriff', dur: 0.4 },
    ...b4.fx,
    { at: 13.45, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
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
    { at: 2.15, sfx: 'clink' },
    { at: F1 + 0.4, sfx: 'plop' },
    ...b2.cues,
    { at: F2 + 0.5, sfx: 'plop' },
    ...b3.cues,
    { at: 7.75, sfx: 'plop' },
    { at: HOME + 0.1, say: '羊' },
    { at: 8.6, say: '山羊' },
    ...b4.cues,
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '羊' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
