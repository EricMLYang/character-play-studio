import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 爬（v2）：浣熊花生看到高高的大樹頂下面掛著一顆黃黃圓圓的東西，流著口水搓搓手，抱住樹幹手腳並用「嘿咻、嘿咻」往上爬
// （一步一頓、身體左右晃、爪子抓的地方噴木屑）——爬到一半手一滑，眼睛瞪大停一格，「咻——」整個人貼著樹幹滑下來，
// 樹幹上留下兩道長長的爪痕，「咚！」屁股著地。一次比一次爬得高、滑得久：爬到 1/3（爪的上半）→ 爬到 2/3（爪的下半）→
// 先停一拍：爬到樹頂下面一點點，伸長手、指尖快碰到了……又滑下來，摔得彈到旁邊（巴）。每次手一滑，筆畫就從抓樹的爪子飛進字框。
// 語詞那一刻他抱著樹幹停在半高、回頭看鏡頭：「爬樹」。回馬槍（第四次）：他終於爬到頂，得意地一抓——是蜂窩，
// 蜜蜂鑽出來跟他大眼瞪小眼，他手一鬆，用最快的速度「咻」地滑下來，摔得最重。
// 最後畫面暗下來只剩「爬」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「爬！」，然後退場只留字。
// 爬、爬、爬樹、這是什麼字？、爬

/** 花生：圖朝左，整支面向右邊的樹（flip） */
const S = 34
const P = 77 - 0.42 * S
/** 高高的樹（中間偏右）：prop:tall-tree（又直又長的樹幹，最上面一小團樹冠），從地面一路到畫面頂。
 * 原圖很瘦（樹幹只有 size 的 0.051），stretchTo TREE_W 加粗一點、size 放大補回高度：樹幹粗 7.7、樹冠在 y −1～15。
 * 樹幹細，國字回到正中央時不擋字，所以不用再擠到畫面右邊 */
const TX = 124
const TREE_W = 1.3
const TREE_S = 116
const TREE_Y = 77 - 0.42 * TREE_S
/** 樹冠下緣（原圖樹冠在 v 0.041～0.23，以 v 0.92 為支點、高度 ÷ TREE_W） */
const CROWN_LOW = 77 + ((0.23 - 0.92) * TREE_S) / TREE_W
/** 每次都從樹幹左邊同一個地方爬 */
const RX = TX - 14
/** 每一步往上爬多少、多久 */
const STEP = 3.6
const ST = 0.13
/** 爬了 i 步時他的中心高度 */
const yAt = (i: number) => P - STEP * i
/** 抓著樹幹的右手（flip 之後在右邊）相對他中心的位置 */
const HAND = { dx: 9.5, dy: -15 }
const handAt = (i: number): Vec => ({ x: RX + HAND.dx, y: yAt(i) + HAND.dy })
/** 手一滑停多久（眼睛瞪大那一格） */
const SLIP = 0.26
/** 爪痕：淺木色，畫在樹幹上 */
const MARK = '#FFEBC8'
type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 同一個笑點：抬頭看樹頂、流口水搓手（lead）→ 抱住樹幹一步一步往上爬（jump／lift 交替、身體左右晃、爪子噴木屑、同一個「嘿咻」tap）→
 * （pause：在最高的地方伸長手、發抖，指尖快碰到了）→（word：停在半高回頭看鏡頭）→（hold：給回馬槍抓蜂窩用）→
 * 手一滑（surprised 停一格）→ 整個人貼著樹幹滑下來，右手拖出兩道爪痕 →「咚」屁股著地（推近＋震、💥，一次多疊一個音）。
 * k 是第幾次；n 是爬幾步。回傳手一滑的時間 slip、著地的時間 land、語詞的時間 word。
 */
function climb(at: number, k: number, o: {
  n: number; lead?: number; pause?: number; word?: number; wordHold?: number; hold?: number; slide: number; land: string
}): Gag & { top: number; slip: number; land: number; word: number } {
  const lead = o.lead ?? 0.22
  const moves: Move[] = [{ at, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/drool' }]
  const fx: Fx[] = []
  const cues: Cue[] = []
  let t = at + lead
  let word = 0
  for (let i = 0; i < o.n; i++) {
    if (o.word != null && i === o.word) {
      // 停在半高、抱著樹幹回頭看鏡頭
      word = t
      moves.push({ at: t, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/back' })
      t += o.wordHold ?? 0.6
    }
    // 嘿咻：手一抓、身體往上一頓，左右晃
    moves.push(
      { at: t, actor: 'rac', do: 'swap', emoji: `hero:raccoon/${i % 2 ? 'lift' : 'jump'}` },
      { at: t, dur: 0.07, actor: 'rac', do: 'moveTo', to: { x: RX, y: yAt(i + 1) }, ease: 'back' },
      { at: t, dur: ST * 0.9, actor: 'rac', do: 'tilt', amount: i % 2 ? 6 : -6 },
    )
    const h = handAt(i + 1)
    fx.push({ at: t + 0.03, dur: 0.3, kind: 'burst', x: h.x + (i % 2 ? 2 : -1), y: h.y + 2, n: 3, emoji: '🟫', scale: 0.6 })
    cues.push({ at: t, sfx: 'tap' })
    t += ST
  }
  const top = t
  if (o.pause) {
    // 停一拍：伸長手、身體再撐高一點點，抖——指尖快碰到了
    moves.push(
      { at: top, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/lift' },
      { at: top, dur: o.pause * 0.7, actor: 'rac', do: 'moveTo', to: { x: RX, y: yAt(o.n) - 1.4 }, ease: 'out' },
      { at: top + o.pause * 0.3, dur: o.pause * 0.7, actor: 'rac', do: 'shake', amount: 0.5 },
    )
    fx.push({ at: top + 0.1, kind: 'sweat', actor: 'rac', dx: -7, dy: 6 })
    t += o.pause
  }
  t += o.hold ?? 0
  const slip = t
  const topY = yAt(o.n) - (o.pause ? 1.4 : 0)
  // 手一滑：眼睛瞪大、往下一沉，停一格
  moves.push(
    { at: slip, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: slip, dur: 0.05, actor: 'rac', do: 'moveTo', to: { x: RX, y: topY + 1.2 } },
  )
  cues.push({ at: slip, sfx: 'blip' })
  // 咻——貼著樹幹滑下來（雙手還舉著抓樹，爪子在樹幹上拖）
  const sl = slip + SLIP
  const land = sl + o.slide
  moves.push(
    { at: sl, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/lift' },
    { at: sl, dur: o.slide, actor: 'rac', do: 'moveTo', to: { x: RX, y: P }, ease: 'in' },
    { at: sl, dur: o.slide, actor: 'rac', do: 'shake', amount: 0.5 },
    { at: land, actor: 'rac', do: 'swap', emoji: `hero:raccoon/${o.land}` },
  )
  cues.push({ at: sl, sfx: 'slide' })
  // 兩道爪痕：滑下來時從手上拉出來，著地後留在樹幹上（每一次往右挪一點，越積越多）
  const markTop = topY + 1.2 + HAND.dy
  const markLow = P + HAND.dy
  for (const j of [0, 1]) {
    const x = TX - 3 + 0.9 * k + 2.6 * j
    fx.push(
      { at: sl, dur: o.slide + 0.12, kind: 'line', actor: 'rac', dx: x - RX, dy: HAND.dy, to: { x, y: markTop }, color: MARK, width: 1.15 },
      { at: land - 0.05, dur: 1, kind: 'line', actor: 'tree', dx: x - TX, dy: markLow - TREE_Y, to: { x, y: markTop }, color: MARK, width: 1.15 },
    )
  }
  // 咚！💥 在屁股旁邊（不蓋臉）
  fx.push({ at: land, dur: 0.5, kind: 'burst', x: RX - 13, y: 70, n: 1, emoji: '💥', scale: 1 + 0.3 * k })
  const camera: Camera[] = [
    { at: land, dur: 0.35, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: RX, y: 60 } },
    { at: land, dur: 0.4, do: 'shake', amount: 0.9 + 0.4 * k },
  ]
  // 白光很淡，不把他刷白
  const lights: Light[] = [{ at: land, dur: 0.04, level: -0.1 - 0.03 * k }, { at: land + 0.04, dur: 0.2, level: 0 }]
  cues.push({ at: land, sfx: 'bonk' })
  if (k >= 1) cues.push({ at: land + 0.04, sfx: 'rumble' })
  if (k >= 2) cues.push({ at: land + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues, lights, top, slip, land, word }
}

// ---- 場景 ----
/** 字框一開始就在左上：他在右邊爬上爬下，筆畫往左上飛，不經過字框 */
const FRAME = { x: 30, y: 21 }
const FRAME_K = 0.5
/** 樹冠下面的蜂窩（掛在樹冠左半邊下面、樹幹左邊；前三次從下面看只是一顆黃黃圓圓的東西，上半截藏在葉子後面） */
const HIVE = { x: TX - 10, y: CROWN_LOW - 1.4, s: 14 }
/** 第 3 次摔得彈到左邊（讓國字回到中間） */
const SIDE = 28

// ---- 時間表 ----
const g1 = climb(0.5, 0, { n: 3, slide: 0.18, land: 'fall' })
const g2 = climb(g1.land + 0.45, 1, { n: 5, slide: 0.26, land: 'dizzy' })
/** 第三次前停一拍：抬頭看比較久 */
const g3 = climb(g2.land + 0.5, 2, { n: 7, lead: 0.4, pause: 0.5, slide: 0.34, land: 'dizzy' })
const L3 = g3.land
const HOME = L3 + 0.5
const PARK = HOME + 0.8
/** 回馬槍：走回樹下再爬，半路停下來回頭（語詞），一路爬到頂抓蜂窩 */
const G4 = PARK + 0.5
const GRAB = 0.55
const g4 = climb(G4, 3, { n: 8, lead: 0.15, word: 4, wordHold: 0.45, hold: GRAB, slide: 0.15, land: 'fall' })
const WORD = g4.word
const T4 = g4.top
const L4 = g4.land
const ASK = L4 + 0.4
const AX = 126
const ASK_S = 1.35
const ANSWER = ASK + 2.55
const END = ANSWER + 1.3

const clip: Clip = {
  format: 2,
  char: '爬',
  meta: { theme: '浣熊花生手腳並用爬大樹，每次快到了就手一滑整個人滑下來', cast: '浣熊花生＋高高的大樹＋蜂窩＋蜜蜂', gags: ['花生看到高高的樹頂有一顆黃黃圓圓的東西，流口水搓搓手，抱住樹幹手腳並用「嘿咻嘿咻」往上爬（每一步身體一頓、左右晃、爪子噴木屑），爬到一半手一滑、眼睛瞪大，整個人貼著樹幹「咻——」滑下來、留下兩道長長的爪痕，「咚」屁股著地，一次比一次爬得高、滑得久（1/3→2/3→停一拍：爬到頂下面一點點、指尖快碰到了，滑下來摔得彈開）；回馬槍是他終於爬到頂得意地一抓，原來是蜂窩，蜜蜂鑽出來跟他大眼瞪小眼，他手一鬆用最快的速度滑下來'] },
  duration: END,
  // 晴朗的天空藍：灰色的花生、咖啡色的樹幹、黃色的蜂窩都跳得出來
  bg: { top: '#CFEBFF', bottom: '#F4FBFF', floor: '#BFE0A0', scenery: 'hills' },
  actors: [
    // 蜂窩畫在樹後面：上半截藏在葉子裡，從下面看只是一顆黃黃圓圓的東西
    { id: 'hive', emoji: 'prop:hive', x: HIVE.x, y: HIVE.y, size: HIVE.s, float: true },
    { id: 'tree', emoji: 'prop:tall-tree', x: TX, y: TREE_Y, size: TREE_S },
    { id: 'rac', emoji: 'hero:raccoon/walk', x: RX, y: P, size: S, hidden: true, flip: true },
    { id: 'bee', emoji: 'prop:bee', x: HIVE.x + 1, y: HIVE.y + 3, size: 10, hidden: true, float: true },
  ],
  moves: [
    // 開場：他從左邊走進來，走到樹下
    { at: 0, dur: 0, actor: 'tree', do: 'stretchTo', amount: TREE_W },
    { at: 0.02, dur: 0.45, actor: 'rac', do: 'enter', from: { x: -25, y: P }, ease: 'out' },
    // 第 1 次：爬到 1/3
    ...g1.moves,
    { at: g1.land + 0.45, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 2 次：爬到 2/3
    ...g2.moves,
    { at: g2.land + 0.5, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 第 3 次：爬到頂下面一點點，伸長手……滑下來，摔得彈到左邊（讓國字回到中間）
    ...g3.moves,
    { at: L3 + 0.12, dur: 0.4, actor: 'rac', do: 'moveTo', to: { x: SIDE, y: P }, arc: 9, ease: 'out' },
    { at: L3 + 0.12, dur: 0.4, actor: 'rac', do: 'spin', times: -1, pivot: 'center' },
    // 國字讓位以後，他爬起來走回樹下
    { at: PARK + 0.2, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: PARK + 0.2, dur: 0.4, actor: 'rac', do: 'moveTo', to: { x: RX, y: P } },
    // 第 4 次：半路回頭（語詞），爬到頂——得意地一抓，把蜂窩從葉子裡拉出來
    ...g4.moves,
    { at: T4, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: T4, dur: 0.12, actor: 'hive', do: 'moveTo', to: { x: HIVE.x, y: HIVE.y + 4 }, ease: 'back' },
    // 蜜蜂從洞裡鑽出來，生氣地瞪著他；他傻眼
    { at: T4 + 0.2, dur: 0.25, actor: 'bee', do: 'pop' },
    { at: T4 + 0.2, dur: 0.2, actor: 'bee', do: 'moveTo', to: { x: HIVE.x - 2, y: HIVE.y + 9 } },
    { at: T4 + 0.32, actor: 'bee', do: 'swap', emoji: 'prop:bee-sting' },
    { at: T4 + 0.32, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 他滑下來，蜜蜂追下來在他頭上繞
    { at: L4 - 0.05, dur: 0.3, actor: 'bee', do: 'moveTo', to: { x: RX + 4, y: P - 18 }, ease: 'in' },
    { at: L4 + 0.25, dur: 0.2, actor: 'bee', do: 'hop', amount: 3 },
    // 問他：樹、蜂窩、蜜蜂收掉，他站起來跳到右前方、放大，轉過來面向左邊的國字
    { at: ASK, dur: 0.25, actor: 'bee', do: 'moveTo', to: { x: 175, y: 10 }, ease: 'in' },
    { at: ASK + 0.25, dur: 0.01, actor: 'bee', do: 'vanish' },
    { at: ASK, dur: 0.25, actor: 'hive', do: 'vanish' },
    { at: ASK, dur: 0.25, actor: 'tree', do: 'vanish' },
    { at: ASK, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: ASK, actor: 'rac', do: 'flip' },
    { at: ASK, dur: 0.4, actor: 'rac', do: 'moveTo', to: { x: AX, y: P - 1 }, arc: 5, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'rac', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: ASK + 1.6, dur: 0.3, actor: 'rac', do: 'hop', amount: 1.5 },
    { at: ASK + 2.1, dur: 0.3, actor: 'rac', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: ANSWER, dur: 0.3, actor: 'rac', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.12, actor: 'rac', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: ANSWER + 0.12, actor: 'rac', do: 'flip' },
    { at: ANSWER + 0.12, dur: 0.15, actor: 'rac', do: 'moveTo', to: { x: 205, y: P - 1 }, ease: 'in' },
  ],
  builds: [
    // 每次手一滑，一組筆畫從抓著樹幹的爪子飛進字框：爪的上半、爪的下半、巴
    { at: g1.slip + 0.02, dur: 0.5, strokes: [0, 1], from: handAt(3), color: partColor('爪') },
    { at: g2.slip + 0.02, dur: 0.5, strokes: [2, 3], from: handAt(5), color: partColor('爪') },
    { at: g3.slip + 0.02, dur: 0.5, strokes: [4, 5, 6, 7], from: handAt(7), color: partColor('巴') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.25 - ASK, do: 'ask', keep: ['rac'], to: { x: 62, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.8, dur: 0.5, do: 'pulse' },
  ],
  fx: ([
    ...g1.fx,
    ...g2.fx,
    ...g3.fx,
    { at: L3 + 0.55, dur: 0.9, kind: 'dizzy', actor: 'rac' },
    ...g4.fx,
    { at: T4 + 0.02, kind: 'burst', x: HIVE.x, y: HIVE.y + 8, emoji: '✨', n: 5, dur: 0.35 },
    { at: L4 + 0.1, dur: ASK - L4 - 0.1, kind: 'dizzy', actor: 'rac' },
  // 樹幹上的爪痕留到問他之前
  ] as Fx[]).map((f): Fx => (f.kind === 'line' && f.actor === 'tree' ? { ...f, dur: ASK - f.at } : f)),
  camera: [
    // 鏡頭固定在全景（他會一路爬到畫面頂），只有著地那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g1.camera, ...g2.camera, ...g3.camera, ...g4.camera,
  ],
  lights: [
    ...g1.lights, ...g2.lights, ...g3.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...g4.lights,
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.55, say: '爬' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.1, say: '爬' },
    { at: WORD, say: '爬樹' },
    ...g4.cues,
    { at: T4, sfx: 'clink' },
    { at: T4 + 0.2, sfx: 'whoosh' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '爬' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
