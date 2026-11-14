import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 怕（v2）：一本正經的狗狗警長站崗，敬禮、得意地說「我才不怕」——每次一隻小蜘蛛從上面垂下來停在他鼻子前，他就嚇得臉發白、「哇」地跳起來，一次比一次高：
// 跳一下就落地發抖（忄從怦怦跳的心彈出來）、跳到半空轉一圈摔坐（白的上半從嚇白的臉彈出來）、先停一拍偷看上面，再嚇到直接衝出畫面（白的下半）。
// 回馬槍：真的大恐龍「咚咚」走來對他吼，他敬禮、一點都不怕——結果小蜘蛛垂到恐龍鼻子前，他嚇得跳進恐龍懷裡發抖。
// 最後畫面暗下來只剩「怕」，警長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「怕！」，然後退場只留字。
// 怕、怕、害怕、這是什麼字？、怕
const P = 66.9 // 警長（size 24）站在地上的 y
/** 警長站崗的地方（前三次都站這裡，面向右邊） */
const HOME = 40
/** 小蜘蛛垂下來的地方：警長鼻子前面（字框左邊，絲不會穿過字框） */
const SX = 57
const SY = 50
/** 傻眼（臉發白、定住）多久才「哇」地跳起來 */
const HOLD = 0.4
/** 嚇白了：灰灰白白的 */
const PALE = 'grayscale(.8) brightness(1.25)'
/** 語詞那一刻警長在畫面中間、變大 */
const MID = 66
const BIG = 1.35
/** 大恐龍（size 46）站的地方 */
const DX = 128
const D = 57.7
/** 第四次：小蜘蛛垂到恐龍鼻子前 */
const S4X = 104, S4Y = 42
/** 跳進恐龍懷裡 */
const ARMS = { x: 118, y: 55 }

/**
 * 「哇！」：小蜘蛛從上面「咻」地垂下來、在他鼻子前彈一下（預備）→ 他傻眼定住、臉嚇白＋💥＋❗＋白光＋鏡頭推近＋震＋同一個音效，
 * 停 HOLD 秒（看得見臉）→ 換跳起來的姿勢「哇」地跳。k 是第幾次（越後面越大），(sx, sy) 是蜘蛛停的地方。
 * 跳多高、怎麼落地每次不同，寫在劇本裡；這裡只管那一下長得一樣。
 */
function scare(at: number, k: number, sx: number, sy: number) {
  const moves: Move[] = [
    // 蜘蛛垂下來（從畫面外），停在他面前彈一下
    { at: at - 0.62, actor: 'spider', do: 'moveTo', to: { x: sx, y: -12 }, dur: 0.01 },
    { at: at - 0.6, actor: 'spider', do: 'pop', dur: 0.05 },
    { at: at - 0.6, actor: 'spider', do: 'moveTo', to: { x: sx, y: sy }, dur: 0.35, ease: 'bounce' },
    { at: at - 0.12, actor: 'spider', do: 'hop', amount: 1.5, dur: 0.2 },
    // 傻眼、臉嚇白
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'tint', filter: PALE },
    { at, actor: 'sheriff', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: at + 0.12, actor: 'sheriff', do: 'shake', amount: 0.8 + 0.2 * k, dur: HOLD - 0.12 },
    // 哇！跳起來
    { at: at + HOLD, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    // 蜘蛛也被他的叫聲嚇回上面去
    { at: at + HOLD + 0.2, actor: 'spider', do: 'moveTo', to: { x: sx, y: -14 }, dur: 0.3, ease: 'in' },
  ]
  const fx: Fx[] = [
    // 蜘蛛絲（跟著蜘蛛，一直連到畫面外）
    { at: at - 0.6, kind: 'line', actor: 'spider', to: { x: sx, y: -12 }, color: '#4A4A4A', width: 0.45, dur: HOLD + 1.1 },
    // 傻眼那一下：💥（一次比一次大）＋ ❗
    { at, kind: 'burst', actor: 'sheriff', n: 1, dx: k >= 3 ? -16 : 16 + 2 * k, dy: 4, dur: 0.4, scale: 1.6 + 0.45 * k },
    { at: at + 0.05, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: k >= 3 ? 10 : -10, dur: HOLD + 0.2, scale: 1.6 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: k >= 3 ? 100 : HOME + 8, y: P - 12 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效（蜘蛛垂下來「咻」、嚇到「啵嘤」），一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.6, sfx: 'slide' }, { at, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'blip' })
  return { moves, fx, camera, cues }
}

const S1 = 1.75, S2 = 3.55, S3 = 5.9, S4 = 9.75
const a1 = scare(S1, 0, SX, SY)
const a2 = scare(S2, 1, SX, SY)
const a3 = scare(S3, 2, SX, SY)
const a4 = scare(S4, 3, S4X, S4Y)
/** 跳起來的時刻 */
const J1 = S1 + HOLD, J2 = S2 + HOLD, J3 = S3 + HOLD, J4 = S4 + HOLD

const clip: Clip = {
  format: 2,
  char: '怕',
  meta: { theme: '警長站崗被小蜘蛛嚇', cast: '狗狗警長＋小蜘蛛＋大恐龍', gags: ['一本正經說不怕的警長，每次小蜘蛛垂到鼻子前就嚇得臉發白跳起來，一次比一次高；回馬槍是真的大恐龍來吼他，他一點都不怕，結果小蜘蛛垂到恐龍鼻子前，他嚇得跳進恐龍懷裡'] },
  duration: 15,
  bg: { top: '#CFE6FF', bottom: '#F2F8FF', floor: '#C9DDB0', scenery: 'forest' },
  actors: [
    // 大恐龍（第四次才走進來），畫在警長後面：跳進懷裡時警長在前面
    { id: 'dino', emoji: 'hero:dino/idle', x: 190, y: D, size: 46, hidden: true },
    // 姿勢圖朝左，翻過來面向右邊（垂下來的蜘蛛、問他時的字）
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: HOME, y: P, size: 24, hidden: true, flip: true },
    { id: 'spider', emoji: '🕷️', x: SX, y: -12, size: 10, hidden: true, float: true },
  ],
  moves: [
    // 警長吹著哨子登場：指著上面的字框，敬禮，得意——我才不怕！
    { at: 0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    // 第 1 次：蜘蛛垂下來——傻眼、哇！跳一下，落地抱著自己發抖
    ...a1.moves,
    { at: J1, actor: 'sheriff', do: 'hop', amount: 12, dur: 0.55 },
    { at: J1 + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/scared' },
    { at: J1 + 0.6, actor: 'sheriff', do: 'shake', amount: 1, dur: 0.45 },
    // 回神：整理一下，又一本正經地敬禮
    { at: 3.0, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 3.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    // 第 2 次：又垂下來——哇！跳到半空轉一圈，一屁股摔坐
    ...a2.moves,
    { at: J2, actor: 'sheriff', do: 'hop', amount: 26, dur: 0.8 },
    { at: J2 + 0.1, actor: 'sheriff', do: 'spin', times: -1, dur: 0.6, pivot: 'center' },
    { at: J2 + 0.8, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/fall' },
    // 第 3 次：爬起來，先停一拍——蹲低偷看上面、冒汗……
    { at: 5.0, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 5.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/peek' },
    { at: 5.25, actor: 'sheriff', do: 'tilt', amount: -8, dur: 0.4 },
    ...a3.moves,
    // ……哇！直接衝出畫面
    { at: J3, actor: 'sheriff', do: 'squash', amount: -0.2, dur: 0.12 },
    { at: J3, actor: 'sheriff', do: 'moveTo', to: { x: HOME, y: -55 }, dur: 0.35, ease: 'in' },
    // 字框填滿（國字 home 到正中央）；他從天上掉回左邊，摔扁
    { at: 6.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 6.95, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: -50 }, dur: 0.01 },
    { at: 7.0, actor: 'sheriff', do: 'moveTo', to: { x: 30, y: P }, dur: 0.3, ease: 'in' },
    { at: 7.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 語詞那一刻：國字讓到左上方，他走到中間、變大，抱著自己發抖（害怕）
    { at: 7.95, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 7.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/scared' },
    { at: 7.95, actor: 'sheriff', do: 'moveTo', to: { x: MID, y: P }, dur: 0.35 },
    { at: 7.95, actor: 'sheriff', do: 'scaleTo', amount: BIG, dur: 0.35, ease: 'back' },
    { at: 8.4, actor: 'sheriff', do: 'shake', amount: 1.3, dur: 0.5 },
    // 回馬槍（第 4 次）：大恐龍咚咚走來、吼他——他敬禮，一點都不怕
    { at: 8.85, actor: 'dino', do: 'pop', dur: 0.05 },
    { at: 8.85, actor: 'dino', do: 'moveTo', to: { x: DX, y: D }, dur: 0.4, ease: 'out' },
    { at: 9.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
    { at: 9.25, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    { at: 9.25, actor: 'dino', do: 'squash', amount: -0.08, dur: 0.3 },
    { at: 9.35, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    ...a4.moves,
    // ……小蜘蛛垂到恐龍鼻子前——哇！跳進恐龍懷裡發抖
    { at: J4, actor: 'sheriff', do: 'moveTo', to: ARMS, arc: 8, dur: 0.3, ease: 'out' },
    { at: J4 + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/scared' },
    { at: J4 + 0.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: J4 + 0.3, actor: 'dino', do: 'squash', amount: 0.1, dur: 0.2 },
    { at: J4 + 0.35, actor: 'sheriff', do: 'shake', amount: 1.4, dur: 0.4 },
    // 問他：警長跳下來到左前方、變大，轉向觀眾；恐龍摸摸頭走掉
    { at: 10.85, actor: 'sheriff', do: 'tint', filter: '' },
    { at: 10.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 10.85, actor: 'sheriff', do: 'scaleTo', amount: 1.55 / BIG, dur: 0.3, ease: 'back' },
    { at: 10.85, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 4 }, arc: 6, dur: 0.35 },
    { at: 11.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    { at: 11.2, actor: 'dino', do: 'flip' },
    { at: 11.2, actor: 'dino', do: 'moveTo', to: { x: 200, y: D }, dur: 0.9, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.0, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.5, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 13.5, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.25 },
    // 退場（跑走），畫面只留下字
    { at: 13.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: 13.75, actor: 'sheriff', do: 'flip' },
    { at: 13.78, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：心怦怦跳，忄從他身上彈出來
    { at: J1 + 0.05, dur: 0.55, strokes: [0, 1, 2], from: 'sheriff', color: partColor('忄') },
    // 第 2、3 次：臉嚇白了，白從他身上彈出來（上半、下半）
    { at: J2 + 0.05, dur: 0.55, strokes: [3, 4, 5], from: 'sheriff', color: partColor('白') },
    { at: J3 + 0.05, dur: 0.55, strokes: [6, 7], from: 'sheriff', color: partColor('白') },
  ],
  glyph: [
    { at: 6.95, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到左上方，右邊留給大恐龍
    { at: 7.85, dur: 0.45, do: 'park', to: { x: 62, y: 20 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: 10.8, dur: 3.1, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.85, dur: 0.4, do: 'home' },
    { at: 13.5, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...a1.fx,
    { at: J1 + 0.6, kind: 'sweat', actor: 'sheriff' },
    ...a2.fx,
    { at: J2 + 0.8, kind: 'dizzy', actor: 'sheriff', dur: 0.45 },
    // 第 3 次前停一拍：偷看上面、冒汗
    { at: 5.3, kind: 'sweat', actor: 'sheriff' },
    { at: 5.3, kind: 'pop', actor: 'sheriff', emoji: '👀', dx: -13, dy: 2, dur: 0.55, scale: 1.8 },
    ...a3.fx,
    { at: 7.3, kind: 'dizzy', actor: 'sheriff', dur: 0.5 },
    // 害怕：發抖、冒汗
    { at: 8.35, kind: 'sweat', actor: 'sheriff', scale: 1.5 },
    // 恐龍吼
    { at: 9.25, kind: 'blow', actor: 'dino', dx: -14, dy: 10, to: { x: MID + 6, y: P - 14 }, n: 5, dur: 0.4, scale: 1.4 },
    ...a4.fx,
    { at: J4 + 0.3, kind: 'burst', actor: 'sheriff', emoji: '💦', n: 6, dur: 0.45, scale: 1.4 },
    { at: 13.5, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 前三次鏡頭固定稍微推近、對著警長和垂下來的蜘蛛（自動取景會追著頭頂的蜘蛛往上推，把警長切掉）
    { at: 1.1, dur: 0.4, do: 'zoom', amount: 1.12, to: { x: 56, y: 52 } },
    { at: 6.45, dur: 0.4, do: 'zoom', amount: 1 },
    ...a1.camera,
    ...a2.camera,
    { at: J2 + 0.8, dur: 0.25, do: 'shake', amount: 1.2 },
    ...a3.camera,
    { at: 7.3, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 9.1, dur: 0.3, do: 'shake', amount: 1.2 },
    ...a4.camera,
    { at: J4 + 0.3, dur: 0.35, do: 'shake', amount: 2.2 },
  ],
  lights: [
    // 每次嚇到白光一閃
    ...[S1, S2, S3, S4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 6.95, dur: 0.05, level: -0.35 },
    { at: 7.0, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'blip' },
    { at: 0.6, say: '怕' },
    ...a1.cues,
    { at: J1, sfx: 'whoosh' },
    ...a2.cues,
    { at: J2, sfx: 'whoosh' },
    { at: J2 + 0.8, sfx: 'plop' },
    ...a3.cues,
    { at: J3, sfx: 'whoosh' },
    { at: 7.3, sfx: 'plop' },
    { at: 7.45, say: '怕' },
    { at: 8.45, say: '害怕' },
    { at: 9.0, sfx: 'rumble' },
    ...a4.cues,
    { at: J4, sfx: 'whoosh' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: 13.5, say: '怕' },
    { at: 13.55, sfx: 'cheer' },
  ],
}

export default clip
