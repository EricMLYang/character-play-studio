import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 呆（v2）：大熊貓坐在畫面正中間，眼睛瞪得圓圓的在發呆。楊捷睿想叫醒牠，用盡辦法、一次比一次吵：
// 深吸一口氣——大喊「喂——」（口從熊貓張開的嘴巴飛出來）→ 吹喇叭（木的橫豎從牠僵住的身體飛出來）→
// 先停一拍：他擦汗、想一想、退得遠遠的，搬出大鼓「咚！」再加一圈鞭炮（木的撇捺）。
// 每一次聲波都打在熊貓身上，然後全場安靜一拍：一根羽毛慢慢飄過熊貓的鼻子「叮」——熊貓眨都不眨，他垮下來。
// 回馬槍（第四次）：他累垮了，坐到熊貓旁邊喘氣，盯著前面……自己也張著嘴發呆了（發呆），羽毛飄過兩個鼻子，兩個都不動；
// 這時熊貓終於轉過頭來，換牠對著他揮手。
// 最後畫面暗下來只剩「呆」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再指著字說「呆！」，然後退場只留字。
// 呆、呆、發呆、這是什麼字？、呆

/** 楊捷睿：站在熊貓左邊、面向熊貓 */
const S = 42
const P = 77 - 0.42 * S
/** 前兩次站的地方 */
const YX = 42
/** 第三次退到這裡搬大鼓 */
const BACK = 20
/** 大熊貓：畫面中間、最大，整支動都不動（top：沒有自動的小動作與唸字點頭） */
const PS = 46
const PX = 94
const PY = 77 - 0.42 * PS
/** 熊貓的嘴巴、鼻子（照圖量的） */
const MOUTH = { x: PX - 0.023 * PS, y: PY - 0.033 * PS }
const NOSE = { x: PX - 0.02 * PS, y: PY - 0.09 * PS }
/** 字框（國字讓位的位置）在右上：熊貓的頭頂與往上飛的筆畫都不擋 */
const FRAME = { x: 132, y: 22 }
/** 聲波的顏色：在淺色背景上看得清楚的橘紅 */
const WAVE = '#F2542D'

/** 他的嘴巴（flip 朝右） */
const mouthOf = (x: number) => ({ x: x + 0.12 * S, y: P - 0.05 * S })
/** 喇叭（🎺 吹嘴在左下、喇叭口在右上）湊在嘴上時，圖的中心與喇叭口 */
const HORN = 18
const hornAt = (x: number) => ({ x: mouthOf(x).x + 0.36 * HORN, y: mouthOf(x).y - 0.28 * HORN })
const bellOf = (x: number) => ({ x: hornAt(x).x + 0.32 * HORN, y: hornAt(x).y - 0.22 * HORN })
/** 大鼓 */
const DRUM = 18
const DX = BACK + 21
const DY = 77 - 0.42 * DRUM

/**
 * 一圈一圈往右擴散的聲波「)))」：每一圈是上下兩段弧（swoosh 一段正、一段 low）拼成，
 * 從 src 往外一圈接一圈冒出來，最外圈剛好打在熊貓身上（左半邊身體，不蓋臉）。
 */
function waves(at: number, src: { x: number; y: number }, n: number, reach: number, width: number): Fx[] {
  const fx: Fx[] = []
  for (let i = 0; i < n; i++) {
    const r = 6 + ((reach - 6) * i) / Math.max(1, n - 1)
    const t = at + 0.06 * i
    // sweep -25：弧不轉、固定在正右方上下各 55°
    for (const low of [false, true]) {
      fx.push({ at: t, kind: 'swoosh', x: src.x, y: src.y, n: r, sweep: -25, dur: 0.4 - 0.03 * i, color: WAVE, width, low })
    }
  }
  return fx
}

/** 羽毛放大幾倍 */
const FEATHER = 2.4

/**
 * 安靜一拍：全場不動、鏡頭不動，一根羽毛慢慢飄過熊貓（和他）的鼻子，飄到鼻子前那一刻一聲「叮」。四次一模一樣。
 */
function hush(at: number, from = { x: NOSE.x - 22, y: NOSE.y - 6 }, to = { x: NOSE.x + 20, y: NOSE.y + 2 }) {
  // scale 會把整段路徑以起點放大，終點要先縮回去
  const end = { x: from.x + (to.x - from.x) / FEATHER, y: from.y + (to.y - from.y) / FEATHER }
  const fx: Fx[] = [{ at, kind: 'blow', x: from.x, y: from.y, to: end, n: 1, emoji: 'prop:feather', dur: 1.0, scale: FEATHER }]
  const cues: Cue[] = [{ at: at + 0.3, sfx: 'blip' }]
  return { fx, cues }
}

/** 三次吵的那一下用的姿勢：大喊、吹喇叭、敲大鼓 */
const HIT = ['yawn', 'blow', 'throw'] as const
/** 吵多久（聲波、鞭炮）才安靜下來；安靜多久（全場靜止）才垮下來 */
const LOUD = 0.5
const STILL = 0.65

/**
 * 「吵！」：深吸一口氣（鼓臉、拉長，看得到）→ 那一格換大動作＋鏡頭推近＋震＋同一個音效＋聲波打到熊貓身上 →
 * 安靜一拍（hush）→ 他垮下來傻眼。k 是第幾次（越後面越吵），x 是他站的地方，src 是聲音從哪裡出來。
 */
function noise(at: number, k: number, x: number, src: { x: number; y: number }) {
  const moves: Move[] = [
    { at: at - 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/blow' },
    { at: at - 0.4, actor: 'yang', do: 'squash', amount: -0.12 - 0.04 * k, dur: 0.35 },
    { at, actor: 'yang', do: 'swap', emoji: `hero:yang/${HIT[k]}` },
    { at, actor: 'yang', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.3 },
    // 安靜一拍後垮下來
    { at: at + LOUD + STILL, actor: 'yang', do: 'swap', emoji: k >= 2 ? 'hero:yang/fall' : 'hero:yang/surprised' },
    { at: at + LOUD + STILL, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.3 },
  ]
  const reach = PX - 0.36 * PS + 2 - src.x
  const fx: Fx[] = [
    ...waves(at, src, 4 + k, reach, 3 + 0.8 * k),
    ...hush(at + LOUD).fx,
    { at: at + LOUD + STILL, kind: 'sweat', actor: 'yang' },
  ]
  const camera: Camera[] = [
    { at, dur: 0.3, do: 'punch', amount: 0.05, to: { x: 62, y: 55 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.6 * k },
  ]
  // 同一個「轟」，一次比一次多疊一個音
  const cues: Cue[] = [{ at, sfx: 'rumble' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' }, { at: at + 0.12, sfx: 'crack' })
  cues.push(...hush(at + LOUD).cues)
  return { moves, fx, camera, cues }
}

const H1 = 1.7, H2 = 3.65, H3 = 6.45
const HOME = 8.0
const PARK = 8.8
const WORD = 9.55
/** 回馬槍：安靜一拍、熊貓轉頭 */
const H4 = 9.6, TURN = 10.2
const ASK = 10.7
const ANSWER = 13.45
/** 第四次他坐在熊貓旁邊的地方 */
const SIT = 62

const n1 = noise(H1, 0, YX, mouthOf(YX))
const n2 = noise(H2, 1, YX, bellOf(YX))
const n3 = noise(H3, 2, BACK, { x: DX + 2, y: DY - 6 })
const h4 = hush(H4, { x: SIT - 8, y: P - 0.12 * S }, { x: NOSE.x + 18, y: NOSE.y })
/** 國字放大到中間時，熊貓讓到右邊、縮小 */
const SIDE_X = 146, SIDE = 0.55

const clip: Clip = {
  format: 2,
  char: '呆',
  meta: { theme: '楊捷睿想叫醒發呆的熊貓', cast: '楊捷睿＋大熊貓＋喇叭／大鼓', gags: ['熊貓張著嘴在發呆，楊捷睿一次比一次吵想叫醒牠（大喊喂、吹喇叭、停一拍後退遠搬大鼓加鞭炮），每次聲波打在熊貓身上後全場安靜一拍、羽毛飄過鼻子，熊貓眨都不眨、他垮下來；回馬槍是他累得坐在旁邊喘氣，自己也張嘴發呆了，熊貓這才轉頭對他揮手'] },
  duration: 15,
  // 淡淡的青草綠天空、竹林：黑白的熊貓、紅衣服的他都跳得出來
  bg: { top: '#E6F4D7', bottom: '#F7FBEF', floor: '#B9D98A', scenery: 'forest' },
  actors: [
    { id: 'panda', emoji: 'prop:panda-daze', x: PX, y: PY, size: PS, top: true },
    { id: 'drum', emoji: '🥁', x: DX, y: DY, size: DRUM, hidden: true, pivot: 'center' },
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: P, size: S, hidden: true, flip: true },
    { id: 'horn', emoji: '🎺', x: hornAt(YX).x, y: hornAt(YX).y, size: HORN, hidden: true, float: true },
  ],
  moves: [
    // 他從左邊走進來，看到發呆的熊貓：指著——呆！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -20, y: P }, dur: 0.55, ease: 'out' },
    { at: 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    // 第 1 次：深吸一口氣——「喂——」
    ...n1.moves,
    // 第 2 次：拿出喇叭湊到嘴上——叭！
    { at: H2 - 0.6, actor: 'horn', do: 'pop', dur: 0.2 },
    ...n2.moves,
    // 垮下來，喇叭從手上掉到地上、彈一下滾出去
    { at: H2 + 1.15, actor: 'horn', do: 'moveTo', to: { x: YX + 10, y: 72 }, dur: 0.2, ease: 'in' },
    { at: H2 + 1.35, actor: 'horn', do: 'moveTo', to: { x: -15, y: 72 }, dur: 0.35, ease: 'in' },
    { at: H2 + 1.7, actor: 'horn', do: 'vanish', dur: 0.05 },
    // 第 3 次前停一拍：擦擦汗、想一想……退得遠遠的，搬出大鼓
    { at: 5.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hot' },
    { at: 5.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: 5.4, actor: 'yang', do: 'tilt', amount: 6, dur: 0.3 },
    { at: 5.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: 5.65, actor: 'yang', do: 'moveTo', to: { x: BACK, y: P }, dur: 0.3 },
    { at: 5.8, actor: 'drum', do: 'pop', dur: 0.2 },
    ...n3.moves,
    // 跌坐那一下，大鼓被震得跳起來、滾出畫面左邊
    { at: H3 + 1.2, actor: 'drum', do: 'hop', amount: 5, dur: 0.3 },
    { at: H3 + 1.35, actor: 'drum', do: 'moveTo', to: { x: -20, y: DY }, dur: 0.45, ease: 'in' },
    { at: H3 + 1.35, actor: 'drum', do: 'rotateTo', amount: -400, dur: 0.45, ease: 'in' },
    { at: H3 + 1.8, actor: 'drum', do: 'vanish', dur: 0.05 },
    // 國字放大到中間：熊貓讓到右邊、縮小（姿勢一點都不變）
    { at: HOME - 0.3, actor: 'panda', do: 'moveTo', to: { x: SIDE_X, y: PY }, dur: 0.4 },
    { at: HOME - 0.3, actor: 'panda', do: 'scaleTo', amount: SIDE, dur: 0.4 },
    { at: PARK + 0.15, actor: 'panda', do: 'moveTo', to: { x: PX, y: PY }, dur: 0.35 },
    { at: PARK + 0.15, actor: 'panda', do: 'scaleTo', amount: 1 / SIDE, dur: 0.35 },
    // 回馬槍：他累垮了，走到熊貓旁邊喘氣……
    { at: PARK + 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.1, actor: 'yang', do: 'moveTo', to: { x: SIT, y: P }, dur: 0.4 },
    { at: PARK + 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/tired' },
    // ……盯著前面，自己也張著嘴發呆了（發呆）
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 熊貓終於轉過頭來看他，對著他揮手；他還是不動
    { at: TURN, actor: 'panda', do: 'swap', emoji: 'prop:panda-wave' },
    { at: TURN, actor: 'panda', do: 'hop', amount: 2, dur: 0.25 },
    { at: TURN + 0.15, actor: 'panda', do: 'tilt', amount: -6, dur: 0.2 },
    { at: TURN + 0.35, actor: 'panda', do: 'tilt', amount: -6, dur: 0.2 },
    // 問他：熊貓收掉，他跳到左前方
    { at: ASK, actor: 'panda', do: 'vanish', dur: 0.3 },
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 3 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: ASK, actor: 'yang', do: 'scaleTo', amount: 1.1, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 11.9, actor: 'yang', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.5, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.22, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.25, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 3 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 吵的那一下，筆畫從熊貓身上震出來、飛進右上的字框（在安靜那一拍之前就落定）：
    // 口從張開的嘴巴、木的橫豎從僵住的身體、木的撇捺從坐著的腿
    { at: H1 + 0.02, dur: 0.32, strokes: [0, 1, 2], from: MOUTH, color: partColor('口') },
    { at: H2 + 0.02, dur: 0.32, strokes: [3, 4], from: { x: PX, y: PY + 4 }, color: partColor('木') },
    { at: H3 + 0.02, dur: 0.32, strokes: [5, 6], from: { x: PX, y: PY + 14 }, color: partColor('木') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME },
    // 問他：國字稍微偏右、縮一點，左前方讓給他
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...n1.fx,
    ...n2.fx,
    // 停一拍：擦汗
    { at: 5.15, kind: 'sweat', actor: 'yang' },
    ...n3.fx,
    // 鞭炮在熊貓腳邊炸開一圈（不蓋臉）
    { at: H3 + 0.02, kind: 'burst', x: PX, y: 72, emoji: '🧨', n: 8, dur: 0.46, scale: 2.2 },
    { at: H3 + 0.05, kind: 'burst', x: PX - 19, y: 68, n: 1, dur: 0.45, scale: 2.2 },
    { at: H3 + 0.08, kind: 'burst', x: PX + 19, y: 68, n: 1, dur: 0.42, scale: 2.2 },
    // 回馬槍：喘氣，然後兩個一起發呆，羽毛飄過兩個鼻子
    { at: PARK + 0.55, kind: 'sweat', actor: 'yang' },
    ...h4.fx,
    // 熊貓對他揮手
    { at: ANSWER, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 鏡頭固定在全景：安靜那一拍才真的什麼都不動
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...n1.camera,
    ...n2.camera,
    ...n3.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '呆' },
    ...n1.cues,
    ...n2.cues,
    { at: H2 + 1.35, sfx: 'tap' },
    { at: 5.8, sfx: 'plop' },
    ...n3.cues,
    { at: H3 + 1.2, sfx: 'bonk' },
    { at: HOME - 0.3, sfx: 'slide' },
    { at: HOME + 0.1, say: '呆' },
    { at: WORD, say: '發呆' },
    ...h4.cues,
    { at: TURN, sfx: 'boing' },
    { at: 10.95, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '呆' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
