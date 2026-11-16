import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 樂（v2）：快樂會傳染。愛現的忍者小老鼠樂得停不下來，抱著肚子「哈哈哈」——笑聲變成一串 😄 飄出去，碰到誰，誰就「噗」地跟著笑出來。
// 每次都一樣：他往後一仰吸一口氣、身體一抖，一串 😄 從嘴巴飄到對方臉上，對方臉上炸開一顆大大的 😄、一圈小 😄，只是對方一次比一次難逗、笑得一次比一次大：
// 板著臉叉腰的狗狗警長——笑到抱肚子、跳著退場（白）→ 大吼的小恐龍——笑到往後倒、滾出畫面（兩個幺）→
// 先停一拍：「轟、轟」走來一頭超大的大象，鼻子高高舉起要噴他，他嚇到冒汗、摀嘴硬忍⋯⋯還是噗地笑出來——
// 最大的一串 😄 飄過去，大象僵住、抖一抖，「轟！」笑到一屁股坐下，撞到後面的樹，樹抖下樹枝（木）；大象笑到滾出畫面，國字回中央以後再滾回來。
// 語詞那一刻：他跳到中間，身邊一圈 😄：快樂！
// 回馬槍（第四次）：他終於笑完了，擦擦汗、閉眼得意——還在笑的大象把最大的一串 😄 傳回來，他「噗」地又笑出來，笑到倒地滾出畫面。
// 最後畫面暗下來只剩「樂」，小老鼠走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「樂！」，然後退場只留字。
// 刻意不跟「臉」（花生做鬼臉逗板著臉的警長，警長一直忍住）、「肚」（羽毛搔肚子笑倒）、「很」（一團臭氣飄過去、聞到的倒下）撞：
// 這支是「笑聲本身」一串 😄 飄過去，碰到就笑出來，一次就成功，難逗的程度一次比一次高。之後的「喜」「愛」才演禮物、愛心、抱抱，這支不碰。
// 樂、樂、快樂、這是什麼字？、樂

/** 小老鼠（左邊，flip 朝右；前三次都站在同一個地方笑） */
const MS = 34
const MY = 77 - 0.42 * MS
const MX = 40
/** 他的嘴巴（laugh 姿勢翻過來朝右）：笑聲從這裡飄出去 */
const MOUTH = { x: MX + 6, y: MY - 6 }
/** 被傳染的三個：都站在右邊同一個地方，一個比一個大 */
const SS = 36, SY = 77 - 0.42 * SS, SX = 114
const RS = 44, RY = 77 - 0.42 * RS, RX = 116
const ES = 54, EY = 77 - 0.42 * ES, EX = 118
/** 大象笑到坐下去以後退到的地方（國字回中央那一秒要在國字右邊） */
const EX2 = 132
/** 樹（木從這裡掉下來）：在右邊大象的後面，大象一屁股坐下去撞到它；整棵都在畫面裡 */
const TS = 40, TX = 142, TY = 77 - 0.42 * TS
/** 字框：比預設偏左一點，右邊讓給大象 */
const FRAME = { x: 72, y: 21.5 }
/** 笑聲飄多久 */
const FLY = 0.7

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點「哈哈哈——噗！」：笑的人（who）往後一仰吸一口氣（預備）、身體一抖，一串 😄 從嘴巴 from 飄到對方臉上 face（FLY 秒），
 * 碰到的那一刻（at）：對方臉旁炸開一顆大大的 😄（一次比一次大）、一圈小 😄，鏡頭推近那裡＋震，同一個「啵」聲（一次多疊一個音）。
 * k 是第幾次（0～3）。對方怎麼笑、笑成怎樣由呼叫的人寫。
 */
function laugh(at: number, k: number, who: string, from: Vec, face: Vec, side: number, cam: Vec = { x: face.x, y: Math.max(face.y, 46) }): Gag {
  const s = 1.3 + 0.4 * k
  const R = at - FLY
  const moves: Move[] = [
    // 往後一仰吸一口氣，再往前一抖笑出來
    { at: R - 0.3, actor: who, do: 'squash', amount: -0.12, dur: 0.3 },
    { at: R, actor: who, do: 'shake', amount: 0.9, dur: FLY },
  ]
  // blow 的 scale 以起點為中心放大，終點要先縮回去，飄到的地方才剛好是對方的臉
  const to = { x: from.x + (face.x - from.x) / s, y: from.y + (face.y - from.y) / s }
  const fx: Fx[] = [
    { at: R, kind: 'blow', x: from.x, y: from.y, to, emoji: '😄', n: 3 + k, dur: FLY + 0.15, scale: s },
    // 大大的 😄 炸在對方臉旁（朝笑聲來的那一側 side，不蓋住臉）、一圈小 😄
    { at, kind: 'burst', x: face.x + side * (10 + 2 * k), y: face.y - 2, n: 1, emoji: '😄', dur: 0.7, scale: 1.25 + 0.35 * k },
    { at, kind: 'burst', x: face.x, y: face.y + 4, n: 5 + k, emoji: '😄', dur: 0.7, scale: 1 + 0.15 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: k >= 2 ? 0.06 : 0.08 + 0.04 * k, to: cam },
    { at, dur: 0.3, do: 'shake', amount: 0.6 + 0.4 * k },
  ]
  const cues: Cue[] = [{ at: R, sfx: 'bubble' }, { at, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'poof' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'plop' })
  return { moves, fx, camera, cues }
}

const H1 = 1.75, H2 = 4.3, H3 = 7.05, H4 = 10.25
/** 第三次：大象被碰到以後硬撐多久才笑到坐下 */
const HOLD3 = 0.3
const g1 = laugh(H1, 0, 'mouse', MOUTH, { x: SX - 4, y: SY - 9 }, -1)
const g2 = laugh(H2, 1, 'mouse', MOUTH, { x: RX - 7, y: RY - 11 }, -1)
const g3 = laugh(H3, 2, 'mouse', MOUTH, { x: EX - 14, y: EY - 6 }, -1, { x: 84, y: 46 })
/** 第四次：他在中間偏左（國字下面）擦汗得意，大象從右邊把笑聲傳回來 */
const M4 = 58
// 鏡頭推近時往中間對一點，右邊坐著的大象才不會被切掉
const g4 = laugh(H4, 3, 'ele', { x: EX2 - 13, y: EY + 2 }, { x: M4 + 3, y: MY - 8 }, 1, { x: 84, y: 46 })

const WORD = 9.0

const clip: Clip = {
  format: 2,
  char: '樂',
  meta: { theme: '快樂會傳染', cast: '小老鼠＋狗狗警長＋小恐龍＋大象＋樹', gags: ['小老鼠樂得停不下來，每次「哈哈哈」一串 😄 飄出去，碰到誰誰就噗地笑出來，一次比一次難逗、笑得一次比一次大：板著臉的警長笑到抱肚子、大吼的小恐龍笑到滾出畫面、要噴他的大象笑到一屁股坐下；回馬槍是他終於笑完了，大象把笑聲傳回來，他又笑到滾出畫面'] },
  duration: 15,
  bg: { top: '#FFE9A8', bottom: '#FFF8E1', floor: '#BFE08C', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: TX, y: TY, size: TS },
    { id: 'sheriff', emoji: 'hero:sheriff/angry', x: SX, y: SY, size: SS },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RY, size: RS, hidden: true },
    { id: 'ele', emoji: 'prop:elephant', x: EX, y: EY, size: ES, hidden: true },
    { id: 'mouse', emoji: 'hero:mouse/laugh', x: MX, y: MY, size: MS, flip: true, hidden: true },
  ],
  moves: [
    // 登場：笑著跑進來，停不下來
    { at: 0, actor: 'mouse', do: 'enter', from: { x: -25, y: MY }, dur: 0.5, ease: 'out' },
    { at: 0.55, actor: 'mouse', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 0.6, actor: 'sheriff', do: 'tilt', amount: 6, dur: 0.4 },
    // 第 1 次：板著臉的警長——噗！笑到抱肚子，跳著退場
    ...g1.moves,
    { at: H1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/laugh' },
    { at: H1, actor: 'sheriff', do: 'shake', amount: 1, dur: 0.6 },
    { at: H1 + 0.65, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.25 },
    { at: H1 + 0.85, actor: 'sheriff', do: 'moveTo', to: { x: 200, y: SY }, dur: 0.5, ease: 'in' },
    // 第 2 次：小恐龍「轟」地走進來、對他大吼
    { at: 2.75, actor: 'rex', do: 'enter', from: { x: 200, y: RY }, dur: 0.35, ease: 'out' },
    { at: 3.1, actor: 'rex', do: 'swap', emoji: 'hero:rex/roar' },
    { at: 3.1, actor: 'rex', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.12, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 3.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    ...g2.moves,
    // 噗！笑到往後倒、滾出畫面右邊
    { at: H2, actor: 'rex', do: 'swap', emoji: 'hero:rex/laugh' },
    { at: H2, actor: 'rex', do: 'shake', amount: 1.1, dur: 0.45 },
    { at: H2 + 0.4, actor: 'rex', do: 'rotateTo', amount: 80, dur: 0.2, ease: 'out' },
    { at: H2 + 0.6, actor: 'rex', do: 'moveTo', to: { x: 210, y: RY + 6 }, dur: 0.45, ease: 'in' },
    { at: H2 + 0.6, actor: 'rex', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    // 第 3 次前停一拍：轟、轟，一頭超大的大象走進來，鼻子高高舉起要噴他
    { at: 5.3, actor: 'ele', do: 'enter', from: { x: 210, y: EY }, dur: 0.5, ease: 'out' },
    { at: 5.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 5.55, actor: 'mouse', do: 'tilt', amount: 8, dur: 0.35 },
    { at: 5.85, actor: 'ele', do: 'swap', emoji: 'prop:elephant-spray' },
    { at: 5.85, actor: 'ele', do: 'shake', amount: 0.6, dur: 0.3 },
    // 他摀嘴硬忍、肩膀抖⋯⋯忍不住
    { at: 6.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
    { at: 6.0, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.3 },
    { at: 6.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    ...g3.moves,
    // 大象僵住、抖一抖，「轟！」笑到一屁股坐下，往後退一點；地一震，大家都彈一下
    { at: H3, actor: 'ele', do: 'shake', amount: 0.9, dur: HOLD3 },
    { at: H3 + HOLD3, actor: 'ele', do: 'swap', emoji: 'prop:elephant-laugh' },
    { at: H3 + HOLD3, actor: 'ele', do: 'moveTo', to: { x: EX2, y: EY }, dur: 0.3, ease: 'out' },
    { at: H3 + HOLD3 + 0.3, actor: 'ele', do: 'shake', amount: 0.8, dur: 0.25 },
    { at: 9.3, actor: 'ele', do: 'shake', amount: 0.8, dur: 0.9 },
    { at: H3 + HOLD3, actor: 'mouse', do: 'moveTo', to: { x: 28, y: MY }, arc: 5, dur: 0.35, ease: 'out' },
    { at: H3 + HOLD3, actor: 'tree', do: 'shake', amount: 1.6, dur: 0.45 },
    // 笑到往右滾出畫面（國字回中央放大那一秒右邊要空出來），國字讓位以後再滾回來
    { at: 7.6, actor: 'ele', do: 'moveTo', to: { x: 215, y: EY }, dur: 0.32, ease: 'in' },
    { at: 7.6, actor: 'ele', do: 'spin', times: 1, dur: 0.32, pivot: 'center' },
    { at: 8.95, actor: 'ele', do: 'moveTo', to: { x: EX2, y: EY }, dur: 0.35, ease: 'out' },
    { at: 8.95, actor: 'ele', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    // 國字回到正中央：他在左邊、大象在右邊，一起笑
    { at: 7.9, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.6 },
    // 語詞那一刻：跳到中間，身邊一圈 😄：快樂！
    { at: WORD - 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: WORD - 0.15, actor: 'mouse', do: 'moveTo', to: { x: 66, y: MY }, arc: 8, dur: 0.4, ease: 'out' },
    // 回馬槍（第 4 次）：終於笑完了——擦擦汗喘口氣、閉眼得意
    { at: 9.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/tired' },
    { at: 9.55, actor: 'mouse', do: 'moveTo', to: { x: M4, y: MY }, dur: 0.25 },
    { at: 9.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    ...g4.moves,
    // 噗！又笑出來，笑到往後倒、滾出畫面左邊
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/laugh' },
    { at: H4, actor: 'mouse', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: H4 + 0.35, actor: 'mouse', do: 'rotateTo', amount: -80, dur: 0.2, ease: 'out' },
    { at: H4 + 0.55, actor: 'mouse', do: 'moveTo', to: { x: -40, y: MY + 6 }, dur: 0.45, ease: 'in' },
    { at: H4 + 0.55, actor: 'mouse', do: 'spin', times: -2, dur: 0.45, pivot: 'center' },
    // 大象笑著站起來、走出右邊
    { at: 10.55, actor: 'ele', do: 'swap', emoji: 'prop:elephant' },
    { at: 10.55, actor: 'ele', do: 'flip' },
    { at: 10.6, actor: 'ele', do: 'moveTo', to: { x: 220, y: EY }, dur: 0.35, ease: 'in' },
    // 畫面暗下來時樹也收掉（結尾只留國字）
    { at: 11.2, actor: 'tree', do: 'vanish', dur: 0.3 },
    // 問他：從左邊走回來、變大
    { at: 11.0, actor: 'mouse', do: 'rotateTo', amount: 80, dur: 0.01 },
    { at: 11.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 11.0, actor: 'mouse', do: 'scaleTo', amount: 1.3, dur: 0.01 },
    { at: 11.0, actor: 'mouse', do: 'moveTo', to: { x: 34, y: MY + 4 }, dur: 0.35, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 12.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 12.0, actor: 'mouse', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'mouse', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: 13.5, actor: 'mouse', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 13.78, actor: 'mouse', do: 'moveTo', to: { x: -45, y: MY + 4 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 1 次：白從笑開的警長身上彈出來
    { at: H1 + 0.1, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'sheriff', color: partColor('白') },
    // 第 2 次：兩個幺從笑到倒下的小恐龍身上甩出來
    { at: H2 + 0.4, dur: 0.55, strokes: [5, 6, 7, 8, 9, 10], from: 'rex', color: partColor('幺') },
    // 第 3 次：大象一屁股坐下，地一震，樹抖下樹枝（木）
    { at: H3 + HOLD3 + 0.1, dur: 0.5, strokes: [11, 12, 13, 14], from: 'tree', color: partColor('木') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: 0.55 },
    { at: 7.95, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.75, dur: 0.45, do: 'park', to: FRAME, amount: 0.55 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的小老鼠
    { at: 10.9, dur: 3.05, do: 'ask', keep: ['mouse'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.95, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    // 第 3 次前停一拍：嚇到冒汗
    { at: 5.65, kind: 'sweat', actor: 'mouse', scale: 1.3 },
    ...g3.fx,
    { at: H3 + HOLD3, kind: 'puff', actor: 'ele', dur: 0.5 },
    { at: H3 + HOLD3 + 0.05, kind: 'burst', actor: 'tree', emoji: '🍃', n: 6, dx: -4, dy: 6, dur: 0.5 },
    // 快樂！身邊一圈 😄
    { at: WORD, kind: 'burst', x: 66, y: MY - 2, n: 8, emoji: '😄', dur: 0.75, scale: 1.7 },
    { at: WORD + 0.05, kind: 'burst', x: 66, y: MY - 2, n: 8, emoji: '✨', dur: 0.6, scale: 1.2 },
    { at: WORD + 0.1, kind: 'burst', x: 86, y: MY - 4, n: 1, emoji: '😄', dur: 0.8, scale: 2 },
    // 擦汗喘口氣
    { at: 9.6, kind: 'sweat', actor: 'mouse' },
    ...g4.fx,
    { at: 13.5, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    // 大象進場以後鏡頭幾乎全景、稍微偏右：自動取景會推近左邊的小老鼠，把大象切掉
    { at: 5.0, dur: 0.4, do: 'zoom', amount: 1.03, to: { x: 84, y: 46 } },
    { at: 5.35, dur: 0.25, do: 'shake', amount: 0.8 },
    { at: 5.6, dur: 0.25, do: 'shake', amount: 0.8 },
    ...g3.camera,
    { at: H3 + HOLD3, dur: 0.45, do: 'shake', amount: 2.2 },
    ...g4.camera,
  ],
  lights: [
    { at: 7.95, dur: 0.05, level: -0.2 },
    { at: 8.0, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '樂' },
    ...g1.cues,
    { at: 2.75, sfx: 'rumble' },
    { at: 3.1, sfx: 'rumble' },
    ...g2.cues,
    { at: 5.35, sfx: 'rumble' },
    { at: 5.6, sfx: 'rumble' },
    ...g3.cues,
    { at: H3 + HOLD3, sfx: 'bonk' },
    { at: H3 + HOLD3 + 0.03, sfx: 'rumble' },
    { at: 8.05, say: '樂' },
    { at: WORD, say: '快樂' },
    ...g4.cues,
    { at: 11.0, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '樂' },
    { at: 13.55, sfx: 'cheer' },
  ],
}

export default clip
