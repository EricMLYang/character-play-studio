import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 鐘（v2）：敲鐘被鐘聲震。畫面中間偏右吊著一口金黃色的大銅鐘，鐘錘上綁著一條繩子拖到地上。
// 小骷髏每次撿起繩子、身體往後倒用力一拉——「噹！」鐘一抖，一圈一圈黃色的聲波往外擴散，撞到他身上，
// 他就被震得全身抖個不停，一次比一次大聲、他被震得一次比一次慘：
// 輕輕一拉，聲波小小的，他抖一抖、傻眼冒汗（金，從銅鐘上飛出來）→ 用力一拉，聲波大一圈，他抖到一屁股坐在地上（立）→
// 先停一拍：他伸手去拿繩子又縮回來、抱著自己發抖、冒汗，最後閉著眼睛使出全力一拉——
// 聲波最大、最多圈，他被震得像跳跳豆一樣一路彈到畫面左邊、趴扁（里），鐘自己也被震得往上跳出畫面。
// 國字回中央唸「鐘」。國字讓到左上角，鐘從天上掉回來、晃一晃。
// 回馬槍（第四次）＝語詞那一刻：他想到辦法（💡）——躲到鐘裡面，聲音就震不到了！他踮腳溜到鐘底下，
// 頭和身體都藏進鐘裡、只露出兩隻腳，腳開心地踏一踏，然後在裡面拉鐘錘——「噹！」最大的一聲：「鐘聲」。
// 整口鐘連著他的兩隻腳一起狂抖、蹦蹦跳，聲波比前面都大；鐘被震得飛上天，露出被震到眼睛轉圈圈、坐在地上的他。
// 最後畫面暗下來只剩「鐘」，小骷髏問「這是什麼字？」，手放耳邊等他回答，再指著字說「鐘！」，然後退場只留字。
// 刻意不跟「時」（鬧鐘鈴鈴響把豬探長嚇醒）、「秒」（碼錶）、「晚」（敲大鑼被月亮瞪）撞，也不演「東西飛過來打臉」：
// 這支的因果是「他自己拉繩子→鐘響→聲波把他震到抖」，每次都是同一個拉繩子的動作，只有聲音越來越大。
// 鐘、鐘、鐘聲、這是什麼字？、鐘

/** 小骷髏（hero:jerry；圖朝左，站在鐘的左邊要面向右邊的鐘，所以 flip） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 每次都站在同一個地方：鐘的左邊、左上角字框的下面 */
const JX = 46
const STAND: Vec = { x: JX, y: JY }
/** 銅鐘（props-21 `bell`）：吊在畫面中間偏右，畫面上最大的東西（右上角的太陽在鐘後面，字框放左上角的素色天空） */
const BS = 48
const BELL: Vec = { x: 100, y: 40 }
/** 吊鐘的鏈子：從鐘頂的掛環拉到畫面外面 */
const HANG_DY = -22
const HOOK: Vec = { x: BELL.x, y: -6 }
/** 鐘錘（鐘口下面那顆圓球），相對鐘的中心 */
const CLAP_DY = 16.5
const CLAP: Vec = { x: BELL.x, y: BELL.y + CLAP_DY }
/** 聲波的中心：鐘口（聲波壓得扁扁的，不掃到左上角的字框） */
const RING: Vec = { x: BELL.x, y: BELL.y + 13 }
/** 繩子沒人拿的時候，另一頭躺在他腳邊的地上 */
const ROPE_END: Vec = { x: 66, y: 73.5 }
/** 拉繩子時他的手（pull 姿勢翻過來的雙手，相對他的中心） */
const HAND = { dx: 9, dy: 3 }
/** 繩子、鏈子的顏色 */
const ROPE = '#C8894A'
const CHAIN = '#8C6A3A'
/** 聲波：黃色、有深色描邊（tube），在亮的天空上也看得清楚 */
const WAVE = '#FFD43B'
/** 鐘被震飛出畫面的高度 */
const SKY = -48

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 聲波最高、最低到圓心上下多遠（扁扁的，不掃到左上角的字框） */
const WAVE_H = 12
/** 一段「(」「)」形的聲波（拆成幾截 tube）：離圓心 RING 水平 r 遠、side 是 1（右）或 -1（左），上下兩端往回彎 */
function arc(at: number, dur: number, r: number, side: 1 | -1, width: number): Fx[] {
  const out: Fx[] = []
  const N = 4
  const h = Math.min(WAVE_H, 4 + r * 0.35)
  const bow = Math.min(5, r * 0.18)
  const pt = (u: number): Vec => ({ x: RING.x + side * (r - bow * u * u), y: RING.y + u * h })
  for (let i = 0; i < N; i++) {
    const p = pt(-1 + (2 * i) / N)
    const q = pt(-1 + (2 * (i + 1)) / N)
    out.push({ at, dur, kind: 'tube', actor: 'mid', dx: p.x - RING.x, dy: p.y - RING.y, to: q, color: WAVE, width, n: 99 })
  }
  return out
}

/**
 * 「噹」的聲波：fronts 圈，一圈一圈從鐘口往左右兩邊擴散到 reach 那麼遠（往左的那邊撞到他）。
 * 每一圈是一格一格往外跳的弧，像卡通的聲波。
 */
function waves(at: number, fronts: number, reach: number, width: number): Fx[] {
  const out: Fx[] = []
  for (let f = 0; f < fronts; f++) {
    const start = at + f * 0.13
    for (let r = 24, j = 0; r <= reach; r += 7, j++) {
      const t = start + j * 0.035
      out.push(...arc(t, 0.05, r, 1, width), ...arc(t, 0.05, r, -1, width))
    }
  }
  return out
}

/** 鐘和綁在鐘錘上的繩頭、一起做同一個動作（抖、跳、轉） */
function bellDo(m: Omit<Move, 'actor'>): Move[] {
  return [{ ...m, actor: 'bell' } as Move, { ...m, actor: 'clap' } as Move]
}

/** 鐘往左（往他那邊）斜 deg 度：鐘繞自己的中心轉，鐘錘跟著往左下擺。rotateTo 是累加的，所以記著現在斜多少 */
let leaning = 0
function lean(at: number, deg: number, dur: number, ease: Move['ease'] = 'out'): Move[] {
  const r = (deg * Math.PI) / 180
  const turn = deg - leaning
  leaning = deg
  return [
    { at, actor: 'bell', do: 'rotateTo', amount: turn, dur, ease },
    { at, actor: 'clap', do: 'moveTo', to: { x: CLAP.x - Math.sin(r) * CLAP_DY, y: CLAP.y }, dur, ease },
  ]
}

/** 繩子：沒人拿時從鐘錘拖到地上；拉的時候從鐘錘拉到他手上 */
const ropeIdle = (at: number, until: number): Fx => ({ at, dur: until - at, kind: 'tube', actor: 'clap', to: ROPE_END, color: ROPE, width: 1.6, n: 99 })
const ropeHeld = (at: number, until: number): Fx => ({ at, dur: until - at, kind: 'tube', actor: 'jerry', dx: HAND.dx, dy: HAND.dy, target: 'clap', color: ROPE, width: 1.6, n: 99 })

/**
 * 同一個笑點：撿起繩子（hit − pre）→ 身體往後倒、鐘被拉得往他那邊斜 → 用力一拉，「噹！」（hit）：
 * 鐘彈回來狂抖、✨、聲波一圈一圈往外擴散 → 聲波撞到他（約 hit + 0.15），他就被震得全身抖。
 * k 是第幾次（0～2）：拉得一次比一次用力、鐘斜得越多、聲波越多圈越遠越粗、鐘抖得越久、他被震得越慘。
 */
function ding(hit: number, k: number, pre: number): Gag & { free: number } {
  const tilt = [5, 8, 13][k]
  const grab = hit - pre
  /** 放開繩子（被震到那一刻） */
  const free = hit + 0.12
  const moves: Move[] = [
    // 彎腰撿繩子、往後倒著拉
    { at: grab, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: grab + 0.15, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/pull' },
    { at: grab + 0.15, actor: 'jerry', do: 'moveTo', to: { x: JX - 2 - 1.5 * k, y: JY }, dur: hit - grab - 0.2, ease: 'out' },
    ...lean(grab + 0.15, tilt, hit - grab - 0.2),
    // 「噹！」鐘彈回來、狂抖
    ...lean(hit, 0, 0.12, 'in'),
    ...bellDo({ at: hit + 0.1, do: 'shake', amount: 1.4 + 1.2 * k, dur: 0.6 + 0.3 * k }),
    ...bellDo({ at: hit + 0.1, do: 'squash', amount: 0.06 + 0.03 * k, dur: 0.25 }),
    // 聲波撞到他：傻眼、全身抖
    { at: free, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: free + 0.02, actor: 'jerry', do: 'shake', amount: 1.6 + 1.3 * k, dur: 0.7 + 0.2 * k },
  ]
  const fx: Fx[] = [
    ropeHeld(grab + 0.15, free),
    ...waves(hit, 2 + k, [62, 70, 84][k], 1.3 + 0.35 * k),
    { at: hit, kind: 'burst', actor: 'bell', dy: 14, emoji: '✨', n: 6 + 2 * k, dur: 0.45, scale: 1.1 + 0.25 * k },
    { at: hit + 0.35, kind: 'sweat', actor: 'jerry', dx: -8, scale: 1.2 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.05 + 0.03 * k, to: { x: 74, y: 50 } },
    { at: hit, dur: 0.35 + 0.1 * k, do: 'shake', amount: 0.8 + 0.6 * k },
  ]
  // 同一組音效（拉、噹），一次比一次多疊一個
  const cues: Cue[] = [{ at: grab + 0.15, sfx: 'slide' }, { at: hit, sfx: 'clink' }]
  if (k >= 1) cues.push({ at: hit + 0.05, sfx: 'rumble' })
  if (k >= 2) cues.push({ at: hit + 0.1, sfx: 'clink' })
  return { moves, fx, camera, cues, free }
}

// 開場：走進來，指著鐘——「鐘！」
const POINT = 0.45
// 第 1 次：輕輕一拉
const H1 = 1.45
const g1 = ding(H1, 0, 0.5)
const E1 = H1 + 0.85
// 第 2 次：用力一拉
const H2 = E1 + 0.5
const g2 = ding(H2, 1, 0.5)
/** 被震到一屁股坐下 */
const SIT2 = H2 + 0.45
const E2 = H2 + 1.15
// 第 3 次前停一拍：伸手又縮回來、抱著自己發抖、冒汗，才閉著眼使出全力
const PAUSE = E2 + 0.05
const H3 = PAUSE + 0.7 + 0.6
const g3 = ding(H3, 2, 0.6)
/** 被震得一路彈到畫面左邊 */
const SKID = H3 + 0.3
const SKID_END = SKID + 0.7
const FAR: Vec = { x: 20, y: JY }
/** 鐘被震得往上跳出畫面 */
const LEAP = H3 + 0.35
/** 字框填滿、國字到正中央 */
const HOME = SKID + 0.75
const PARK = HOME + 0.85
// 回馬槍（第 4 次）＝語詞那一刻
/** 鐘從天上掉回來 */
const BACK = PARK + 0.05
/** 想到辦法 */
const IDEA = PARK + 0.4
/** 踮腳溜到鐘底下，藏進去 */
const SNEAK = IDEA + 0.4
const UNDER: Vec = { x: BELL.x, y: JY }
/** 只露出兩隻腳，開心地踏一踏 */
const TAP = SNEAK + 0.55
/** 在裡面拉鐘錘：「噹！」最大的一聲 */
const H4 = TAP + 0.5
/** 鐘被震飛上天，露出他 */
const UP4 = H4 + 0.8
/** 問他 */
const ASK = UP4 + 0.5
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }
/** 國字讓位的地方：左上角素色的天空（鐘吊在中間偏右） */
// 往右下挪、縮一點：離開畫面左上角（總覽縮圖的秒數標籤、推近時的畫面頂端都不會切到它），下緣離他的帽子還留 5 以上
const FRAME: Vec = { x: 46, y: 27 }
const FRAME_K = 0.42

const clip: Clip = {
  format: 2,
  char: '鐘',
  meta: { theme: '拉繩子敲大銅鐘，被鐘聲震到抖', cast: '小骷髏＋大銅鐘', gags: ['敲鐘被鐘聲震：小骷髏每次撿起綁在鐘錘上的繩子、往後倒用力一拉，「噹！」聲波一圈一圈擴散出來撞到他，他就被震得全身抖，一次比一次大聲、他被震得一次比一次慘（抖一抖傻眼→抖到跌坐→停一拍、使出全力，被震得一路彈到畫面左邊趴扁，鐘也跳出畫面）；回馬槍是他躲進鐘裡面、只露出兩隻腳，以為聲音震不到，在裡面一拉——最大的一聲，鐘連著他一起狂抖、飛上天'] },
  duration: Math.round((ANSWER + 1.75) * 100) / 100,
  // 晴朗的淺藍天空、淺色地板：一身黑的小骷髏和金黃色的鐘都看得清楚
  bg: { top: '#9FD3F5', bottom: '#EAF6FD', floor: '#E9D8B4', scenery: 'hills' },
  actors: [
    // 看不見的錨點：聲波的中心
    { id: 'mid', emoji: '⚫', x: RING.x, y: RING.y, size: 1, hidden: true, float: true },
    // 小骷髏畫在鐘前面（陣列前面）：回馬槍躲進鐘裡時，鐘蓋住他的上半身
    { id: 'jerry', emoji: 'hero:jerry/walk', x: JX, y: JY, size: JS, flip: true },
    { id: 'bell', emoji: 'prop:bell', x: BELL.x, y: BELL.y, size: BS, float: true, pivot: 'center' },
    // 看不見的錨點：鐘錘（繩子綁在這裡）
    { id: 'clap', emoji: '⚫', x: CLAP.x, y: CLAP.y, size: 1, hidden: true, float: true },
  ],
  moves: [
    // 開場：走進來，指著鐘——鐘！
    { at: 0, actor: 'jerry', do: 'enter', from: { x: -20, y: JY }, dur: 0.45, ease: 'out' },
    { at: POINT, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 第 1 次：抖一抖、傻眼，回神站好
    ...g1.moves,
    { at: E1 - 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: E1 - 0.2, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.2 },
    // 第 2 次：抖到一屁股坐在地上，再爬起來
    ...g2.moves,
    { at: SIT2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    { at: SIT2, actor: 'jerry', do: 'moveTo', to: { x: JX - 7, y: JY }, dur: 0.15, ease: 'out' },
    { at: SIT2 + 0.05, actor: 'jerry', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: E2 - 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: E2 - 0.3, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.25 },
    // 第 3 次前停一拍：伸手去拿繩子……縮回來、抱著自己發抖……閉眼咬牙
    { at: PAUSE, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: PAUSE + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/scared' },
    { at: PAUSE + 0.3, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.45 },
    ...g3.moves,
    // 被震得一路彈到畫面左邊，趴扁
    { at: SKID, actor: 'jerry', do: 'moveTo', to: FAR, dur: SKID_END - SKID, ease: 'linear' },
    { at: SKID, actor: 'jerry', do: 'bounce', times: 5, amount: 8, dur: SKID_END - SKID },
    { at: SKID_END, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/flat' },
    // 鐘被震得往上跳出畫面（鐘錘一起）
    { at: LEAP, actor: 'bell', do: 'moveTo', to: { x: BELL.x, y: SKY }, dur: 0.45, ease: 'in' },
    { at: LEAP, actor: 'clap', do: 'moveTo', to: { x: CLAP.x, y: SKY + CLAP_DY }, dur: 0.45, ease: 'in' },
    // 國字讓位以後：鐘從天上掉回來、晃一晃；他爬起來看著鐘
    { at: BACK, actor: 'bell', do: 'moveTo', to: BELL, dur: 0.35, ease: 'back' },
    { at: BACK, actor: 'clap', do: 'moveTo', to: CLAP, dur: 0.35, ease: 'back' },
    { at: BACK + 0.35, actor: 'bell', do: 'tilt', amount: 6, dur: 0.4 },
    { at: BACK + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 想到辦法：躲到鐘裡面！
    { at: IDEA, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/know' },
    { at: SNEAK, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/sneak' },
    { at: SNEAK, actor: 'jerry', do: 'moveTo', to: UNDER, dur: 0.55, ease: 'inOut' },
    { at: SNEAK + 0.55, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    // 只露出兩隻腳：開心地踏一踏
    { at: TAP, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.18 },
    { at: TAP + 0.22, actor: 'jerry', do: 'hop', amount: 1.5, dur: 0.18 },
    // 在裡面拉鐘錘：鐘被拉得歪一下——「噹！」
    ...lean(H4 - 0.2, -6, 0.17),  // 在裡面往反方向拉
    ...lean(H4, 0, 0.1, 'in'),
    ...bellDo({ at: H4 + 0.05, do: 'shake', amount: 5, dur: 0.8 }),
    { at: H4 + 0.05, actor: 'jerry', do: 'shake', amount: 5, dur: 0.8 },
    ...bellDo({ at: H4 + 0.05, do: 'bounce', times: 4, amount: 4, dur: 0.8 }),
    { at: H4 + 0.05, actor: 'jerry', do: 'bounce', times: 4, amount: 4, dur: 0.8 },
    { at: H4 + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 鐘被震得飛上天，露出被震到轉圈圈的他
    { at: UP4, actor: 'bell', do: 'moveTo', to: { x: BELL.x, y: SKY }, dur: 0.4, ease: 'in' },
    { at: UP4, actor: 'clap', do: 'moveTo', to: { x: CLAP.x, y: SKY + CLAP_DY }, dur: 0.4, ease: 'in' },
    { at: UP4 + 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/dizzy' },
    { at: UP4 + 0.05, actor: 'jerry', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: UP4 + 0.5, actor: 'bell', do: 'vanish', dur: 0.01 },
    // 問他：走到右前方、轉過來面向國字、變大
    { at: ASK, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK, actor: 'jerry', do: 'flip' },
    { at: ASK, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.35 },
    { at: ASK + 0.2, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
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
    // 輕輕一拉「噹」：金屬的銅鐘一抖，飛出金（金）
    { at: H1 + 0.12, dur: 0.45, strokes: [0, 1, 2, 3, 4, 5, 6, 7], from: 'bell', color: partColor('金') },
    // 抖到一屁股坐下那一下（立）
    { at: SIT2 + 0.05, dur: 0.45, strokes: [8, 9, 10, 11, 12], from: 'jerry', color: partColor('立') },
    // 一路彈過去、在地上咚咚咚（里）
    { at: SKID + 0.15, dur: 0.45, strokes: [13, 14, 15, 16, 17, 18, 19], from: 'jerry', color: partColor('里') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: ANSWER + 1.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 吊鐘的鏈子（鐘飛出畫面時鏈子也在畫面外）
    { at: 0, dur: UP4 + 0.5, kind: 'tube', actor: 'bell', dy: HANG_DY, to: HOOK, color: CHAIN, width: 1.4, n: 2.2 },
    // 繩子：沒人拿的時候拖在地上
    ropeIdle(0, H1 - 0.35),
    ...g1.fx,
    ropeIdle(g1.free, H2 - 0.35),
    ...g2.fx,
    ropeIdle(g2.free, H3 - 0.45),
    // 停一拍：冒汗、❓
    { at: PAUSE + 0.35, kind: 'sweat', actor: 'jerry', dx: -8, scale: 1.4 },
    { at: PAUSE + 0.35, kind: 'pop', actor: 'jerry', emoji: '❓', dx: 14, dy: 7, dur: 0.4 },
    ...g3.fx,
    ropeIdle(g3.free, LEAP),
    { at: SKID_END + 0.1, kind: 'dizzy', actor: 'jerry', dur: 0.6 },
    // 鐘掉回來以後繩子又拖在地上；他躲進去時繩子收在鐘裡
    ropeIdle(BACK + 0.35, SNEAK + 0.3),
    // 想到辦法
    { at: IDEA + 0.02, kind: 'pop', actor: 'jerry', emoji: '💡', dx: 14, dy: 7, dur: 0.4, scale: 1.4 },
    // 回馬槍＝語詞：最大的一聲
    ...waves(H4, 5, 96, 2.4),
    { at: H4, kind: 'burst', actor: 'bell', dy: 14, emoji: '✨', n: 9, dur: 0.5, scale: 1.6 },
    { at: UP4 + 0.15, kind: 'dizzy', actor: 'jerry', dur: 0.5 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    // 國字回中央以後手寫全景，蓋掉自動取景（鐘在右、字框在左上，推近會切掉）
    { at: HOME - 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    // 國字讓回左上角以後也一直留全景（自動取景會往下推近地上的他，把左上角的字框推到畫面頂端）
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    { at: H4, dur: 0.5, do: 'punch', amount: 0.08, to: { x: BELL.x - 10, y: 45 } },
    { at: H4, dur: 0.6, do: 'shake', amount: 2.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: POINT + 0.05, say: '鐘' },
    ...g1.cues,
    ...g2.cues,
    { at: SIT2, sfx: 'plop' },
    ...g3.cues,
    { at: SKID, sfx: 'boing' },
    { at: SKID_END, sfx: 'plop' },
    { at: HOME + 0.2, say: '鐘' },
    { at: BACK + 0.3, sfx: 'clink' },
    { at: IDEA, sfx: 'blip' },
    { at: TAP, sfx: 'tap' },
    { at: H4, sfx: 'clink' },
    { at: H4 + 0.05, sfx: 'rumble' },
    { at: H4 + 0.05, say: '鐘聲' },
    { at: UP4, sfx: 'whoosh' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '鐘' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
