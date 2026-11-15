import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 臉（v2）：狗狗警長叉著腰、一本正經地板著臉，花生想逗他笑——每次轉過身背對一下，「登！」轉回來變得好大、換一張更誇張的鬼臉：
// 皺成一團（月從臉上彈出來）→ 眼睛發亮流口水（亼＋一）→ 先想一想、憋一個最大的：臉漲紅吐舌頭噴眼淚（兩個口兩個人從張開的嘴巴彈出來）。
// 警長每次都一樣：臉抖一下、鼓起臉頰差點笑出來、硬忍住，又板回去；一次比一次忍得辛苦（冒汗、臉漲紅、整個人皺成一團發抖冒蒸氣），還是沒笑。
// 回馬槍：花生放棄了，垂頭喪氣轉身要走，自己踩到香蕉滑一跤、臉朝下摔個大的——警長「噗」地終於爆笑，笑臉放大在畫面中間，笑到在地上打滾。
// 最後畫面暗下來只剩「臉」，花生爬起來走到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「臉！」，然後退場只留字。
// 臉、臉、笑臉、這是什麼字？、臉
const RS = 28
const RY = 77 - 0.42 * RS // 花生站在地上的 y
const SS = 31
const SY = 77 - 0.42 * SS // 警長
/** 花生每次做鬼臉都站在同一個地方：畫面正中間、字框正下方；做鬼臉那一下往前站一步 */
const GX = 80
const FWD = 3
/** 警長一直站在右邊、朝左看著花生 */
const SX = 128
/** 香蕉（一開始就在左邊地上） */
const BAN = { x: 10, size: 9 }
/** 國字放大時花生讓到左邊 */
const LX = 22

/**
 * 「登！換一張鬼臉」：花生轉過身背對（back）、抖一下憋著 → 「登！」轉回來的同一格換鬼臉＋放大＋往前一步＋鏡頭推近＋震＋同一個音效；
 * 警長每次都一樣：臉抖一下、鼓起臉頰（blow）差點笑出來、硬忍住，又叉腰板回去（angry），一次比一次忍得久、抖得兇。
 * k 是第幾次（越後面越大），pose 是那一張鬼臉，prep 是背對著憋多久。
 */
function grimace(at: number, k: number, pose: string, prep = 0.55, retX = GX) {
  const S = 1.55 + 0.2 * k
  /** 警長憋笑憋多久才板回去 */
  const hold = 0.5 + 0.22 * k
  const sheriffBack = at + 0.3 + hold
  const moves: Move[] = [
    // 轉過身背對、抖一下：憋著
    { at: at - prep, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/back' },
    { at: at - prep + 0.2, actor: 'raccoon', do: 'shake', amount: 0.4 + 0.2 * k, dur: prep - 0.25 },
    // 登！轉回來：換鬼臉、放大、往前一步
    { at, actor: 'raccoon', do: 'swap', emoji: `hero:raccoon/${pose}` },
    { at, actor: 'raccoon', do: 'scaleTo', amount: S, dur: 0.14, ease: 'back' },
    { at, actor: 'raccoon', do: 'moveTo', to: { x: GX, y: RY + FWD }, dur: 0.14 },
    { at: at + 0.18, actor: 'raccoon', do: 'shake', amount: 0.5 + 0.3 * k, dur: 0.5 + 0.2 * k },
    // 警長：臉抖一下、鼓起臉頰差點笑出來
    { at: at + 0.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/blow' },
    { at: at + 0.3, actor: 'sheriff', do: 'shake', amount: 0.5 + 0.45 * k, dur: hold },
  ]
  if (k >= 1) moves.push({ at: at + 0.3, actor: 'sheriff', do: 'tint', filter: `saturate(${1.3 + 0.3 * k}) hue-rotate(-${8 * k}deg)` })
  if (k >= 2) moves.push({ at: at + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/sour' })
  moves.push(
    // 硬忍住，又板回去
    { at: sheriffBack, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
    { at: sheriffBack, actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.22 },
    { at: sheriffBack, actor: 'sheriff', do: 'tint', filter: '' },
    // 花生：咦？還是沒笑——縮回原來的大小、退回原位
    { at: sheriffBack + 0.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: sheriffBack + 0.15, actor: 'raccoon', do: 'scaleTo', amount: 1 / S, dur: 0.25 },
    { at: sheriffBack + 0.15, actor: 'raccoon', do: 'moveTo', to: { x: retX, y: RY }, dur: retX === GX ? 0.25 : 0.4 },
  )
  const fx: Fx[] = [
    // 登！臉旁邊一圈亮光，一次比一次大
    { at, kind: 'burst', x: GX, y: RY - 12, emoji: '✨', n: 6 + 2 * k, dur: 0.4, scale: 1.2 + 0.25 * k },
  ]
  if (k >= 1) fx.push({ at: at + 0.45, kind: 'sweat', actor: 'sheriff' })
  if (k >= 2) fx.push({ at: at + 0.65, kind: 'zzz', actor: 'sheriff', emoji: '♨️', dur: hold - 0.3, scale: 1.4 })
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.12 + 0.05 * k, to: { x: GX, y: RY - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.4 * k },
  ]
  // 同一個「登」，一次比一次多疊一個音；警長每次「嗝」地憋住
  const cues: Cue[] = [{ at, sfx: 'boing' }, { at: at + 0.3, sfx: 'hic' }, { at: sheriffBack, sfx: 'tap' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'blip' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues, end: sheriffBack + 0.4 }
}

const F1 = 1.9, F2 = 3.7, F3 = 6.1
const g1 = grimace(F1, 0, 'sour')
const g2 = grimace(F2, 1, 'drool')
// 第 3 次之後國字要放大：花生縮回來的同時直接退到左邊
const g3 = grimace(F3, 2, 'spicy', 0.65, LX)
const HOME = 7.95
const PARK = 8.8
/** 回馬槍：踩到香蕉、摔下來臉朝下 */
const SLIP = 9.3
const LAND = 9.7
/** 警長「噗」地笑出來（語詞那一刻） */
const WORD = 10.05
const ASK = 10.95
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '臉',
  meta: { theme: '做鬼臉逗警長笑', cast: '浣熊花生＋狗狗警長＋香蕉', gags: ['警長板著臉，花生每次轉身背對一下、「登！」轉回來變大換一張更誇張的鬼臉（皺成一團→流口水→臉漲紅吐舌頭噴眼淚），警長每次臉抖、鼓起臉頰差點笑出來又硬忍住板回去，一次比一次辛苦；回馬槍是花生放棄要走，自己踩到香蕉臉朝下摔個大的，警長終於爆笑'] },
  duration: 15,
  bg: { top: '#FFE6EC', bottom: '#FFF6F2', floor: '#E2C7A4', scenery: 'room' },
  actors: [
    { id: 'banana', emoji: '🍌', x: BAN.x, y: 77 - 0.42 * BAN.size, size: BAN.size },
    { id: 'sheriff', emoji: 'hero:sheriff/angry', x: SX, y: SY, size: SS },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: GX, y: RY, size: RS, hidden: true, flip: true },
  ],
  moves: [
    // 花生走進來，指著字框：臉！
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -25, y: RY }, dur: 0.6, ease: 'out' },
    { at: 0.65, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    // 看一眼板著臉的警長，摀嘴偷笑：有辦法了
    { at: 1.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/giggle' },
    { at: 1.0, actor: 'sheriff', do: 'squash', amount: 0.12, dur: 0.2 },
    // 第 1 次：皺成一團
    ...g1.moves,
    // 第 2 次：再來！
    { at: 3.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/stomp' },
    { at: 3.0, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.18 },
    ...g2.moves,
    // 第 3 次前停一拍：托著下巴想一想……憋一個最大的
    { at: 4.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/ponder' },
    { at: 5.0, actor: 'raccoon', do: 'tilt', amount: -8, dur: 0.4 },
    // 警長也預備：抖一下、繃緊
    { at: 5.6, actor: 'sheriff', do: 'squash', amount: -0.12, dur: 0.3 },
    ...g3.moves,
    // 字框填滿：花生讓到左邊（站在香蕉旁邊），警長還是板著臉
    { at: 7.75, actor: 'raccoon', do: 'flip' },
    { at: 7.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 回馬槍：花生放棄了，垂頭喪氣
    { at: PARK, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hungry' },
    { at: PARK + 0.05, actor: 'raccoon', do: 'squash', amount: 0.15, dur: 0.35 },
    // 轉身要走……踩到香蕉！
    { at: 9.1, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: 9.1, actor: 'raccoon', do: 'moveTo', to: { x: BAN.x + 2, y: RY }, dur: 0.2, ease: 'in' },
    { at: SLIP, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/slip' },
    { at: SLIP, actor: 'banana', do: 'moveTo', to: { x: -15, y: 77 - 0.42 * BAN.size }, dur: 0.3, ease: 'out' },
    { at: SLIP, actor: 'banana', do: 'spin', times: 2, dur: 0.3 },
    // 腳往前飛起、整個人往後翻，飛到畫面中間臉朝下摔個大的
    { at: SLIP, actor: 'raccoon', do: 'moveTo', to: { x: 58, y: RY }, arc: 18, dur: LAND - SLIP, ease: 'linear' },
    { at: SLIP, actor: 'raccoon', do: 'spin', times: -1, dur: LAND - SLIP, pivot: 'center' },
    { at: LAND, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/flat' },
    { at: LAND, actor: 'raccoon', do: 'squash', amount: 0.45, dur: 0.35 },
    // 警長：噗——終於忍不住，爆笑；笑臉放大在畫面中間
    { at: LAND + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/blow' },
    { at: LAND + 0.15, actor: 'sheriff', do: 'shake', amount: 1.5, dur: 0.22 },
    { at: WORD - 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/laugh' },
    { at: WORD - 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 100, y: SY + FWD }, dur: 0.2, ease: 'out' },
    { at: WORD - 0.05, actor: 'sheriff', do: 'scaleTo', amount: 1.45, dur: 0.2, ease: 'back' },
    { at: WORD + 0.2, actor: 'sheriff', do: 'bounce', amount: 2, times: 3, dur: 0.55 },
    // 笑到在地上打滾，滾出右邊
    { at: WORD + 0.6, actor: 'sheriff', do: 'rotateTo', amount: 90, dur: 0.15, pivot: 'center' },
    { at: WORD + 0.7, actor: 'sheriff', do: 'moveTo', to: { x: 200, y: SY + FWD }, dur: 0.35, ease: 'in' },
    { at: WORD + 0.7, actor: 'sheriff', do: 'rotateTo', amount: 360, dur: 0.35, pivot: 'center' },
    // 問他：花生爬起來走到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK + 0.05, actor: 'raccoon', do: 'flip' },
    { at: ASK + 0.05, actor: 'raccoon', do: 'moveTo', to: { x: 32, y: RY + 4 }, arc: 6, dur: 0.3 },
    { at: ASK + 0.05, actor: 'raccoon', do: 'scaleTo', amount: 1.5, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 12.3, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.75, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, actor: 'raccoon', do: 'hop', amount: 8, dur: 0.25 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: ANSWER + 0.2, actor: 'raccoon', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: RY + 4 }, dur: 0.18, ease: 'in' },
  ],
  builds: [
    // 第 1 次：月（肉月＝身體的一部分）從皺成一團的臉上彈出來
    { at: F1 + 0.12, dur: 0.5, strokes: [0, 1, 2, 3], from: 'raccoon', color: partColor('⺼') },
    // 第 2 次：僉的上半（亼＋一）
    { at: F2 + 0.12, dur: 0.45, strokes: [4, 5, 6], from: 'raccoon', color: partColor('僉') },
    // 第 3 次：僉的下半（兩個口、兩個人）從張得最大的嘴巴彈出來
    { at: F3 + 0.12, dur: 0.55, strokes: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16], from: 'raccoon', color: partColor('僉') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    // 第 3 次前停一拍：想到了
    { at: 5.25, kind: 'pop', actor: 'raccoon', emoji: '💡', dx: -6, dur: 0.45, scale: 1.4 },
    { at: 5.6, kind: 'sweat', actor: 'sheriff' },
    ...g3.fx,
    // 臉朝下摔個大的
    { at: LAND, kind: 'burst', x: 70, y: RY + 2, n: 1, dur: 0.4, scale: 1.6 },
    { at: LAND, kind: 'burst', x: 58, y: RY - 2, emoji: '⭐', n: 7, dur: 0.45 },
    // 笑臉：警長笑出來那一刻，旁邊一圈亮光
    { at: WORD, kind: 'burst', x: 100, y: SY - 6, emoji: '✨', n: 8, dur: 0.5, scale: 1.4 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.35 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: LAND, dur: 0.4, do: 'shake', amount: 2.2 },
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 100, y: SY - 8 } },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.75, say: '臉' },
    ...g1.cues,
    ...g2.cues,
    { at: 5.25, sfx: 'blip' },
    ...g3.cues,
    { at: HOME + 0.1, say: '臉' },
    { at: PARK + 0.05, sfx: 'deflate' },
    { at: SLIP, sfx: 'slide' },
    { at: LAND, sfx: 'bonk' },
    { at: LAND + 0.04, sfx: 'plop' },
    { at: LAND + 0.15, sfx: 'poof' },
    { at: WORD, say: '笑臉' },
    { at: WORD + 0.7, sfx: 'whoosh' },
    { at: ASK + 0.15, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '臉' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
