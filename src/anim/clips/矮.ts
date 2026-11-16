import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 矮（v2）：兔子女孩站在高高的兔子哥哥旁邊，只到他的肩膀。上面每垂下一根紅蘿蔔，她就拚命去搆——手總是差一截，
// 哥哥隨手一伸就拿到、「啊嗚」一口吃掉。一次比一次拚、一次比一次接近、摔得一次比一次慘：
// 踮腳伸手（差好大一截，傻眼；矢）→ 用力跳（差一點，跌坐；禾）→
// 先停一拍：她托著下巴看看哥哥、看看紅蘿蔔、冒汗⋯⋯退到後面助跑、飛撲一跳——手指只差一點點，「啪」地摔扁（女）。
// 語詞那一刻她站回哥哥旁邊，叉腰踮腳也只到他的肩膀：「矮小」。
// 回馬槍（第四次）：這次紅蘿蔔掛在一根橫著的大木頭底下，從右邊盪過來——木頭剛好在哥哥臉的高度，紅蘿蔔剛好在她嘴巴的高度。
// 哥哥照樣舉手要拿，「咚！」木頭撞上他的臉；木頭從她耳朵上面擦過去，她「啊嗚」一口咬到紅蘿蔔——矮矮的才吃得到，得意。
// 最後畫面暗下來只剩「矮」，她問「這是什麼字？」，手放耳邊等他回答，再指著字說「矮！」，然後退場只留字。
// 刻意不跟「高」（氣球越飄越高、墊箱子）、「長」「短」（拉長、削短）、「瘦」（被夾細）、「接」（越疊越高）撞：
// 這支只演「個子不夠高」——同框一直有個高個子對照，紅蘿蔔永遠掛在他隨手拿得到、她怎麼跳都差一截的地方。
// 矮、矮、矮小、這是什麼字？、矮

/** 兔子女孩（明星，hero:bunny；圖朝左，面向左邊的哥哥） */
const BS = 34
const BY = 77 - 0.42 * BS
/** 每次都站在同一個地方：紅蘿蔔斜下方（手舉起來在紅蘿蔔正下面，耳朵在右邊不會碰到） */
const BX = 87
const HERE: Vec = { x: BX, y: BY }
/** 兔子哥哥（prop:bro*，比她高快一倍；面向右邊的她） */
const RS = 64
const RY = 77 - 0.42 * RS
const RX = 64
/** 紅蘿蔔（🥕 轉成葉子朝上、尖端朝下），掛在哥哥舉手剛好拿到的高度 */
const CS = 13
const CX = 82
const CY = 20
/** 吊紅蘿蔔的繩子 */
const ROPE = '#7A5230'
/** 一次比一次搆得高（往上離地多少），還是差一截：差一大截 → 差一點 → 只差一點點 */
const RISE = [2, 11, 16]
/** 字框（左上角，背後是素色的天空；哥哥站在它右邊，不會站到字框後面） */
const PARK_AT: Vec = { x: 22, y: 17 }
const PARK_K = 0.45
/** 回馬槍：橫著的大木頭在哥哥臉的高度，紅蘿蔔吊在它底下、在她嘴巴的高度 */
const LOGY = 36
const LOG_CARROT = 19
/** 問他時她站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: BY + 4 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 紅蘿蔔從上面垂下來（at 開始垂，0.35 秒到定位）；繩子一路連到它頭上，直到 until */
function lower(at: number, until: number) {
  g.moves.push(
    { at: at - 0.05, dur: 0.01, actor: 'carrot', do: 'moveTo', to: { x: CX, y: -12 } },
    { at, dur: 0.05, actor: 'carrot', do: 'pop' },
    { at, dur: 0.35, actor: 'carrot', do: 'moveTo', to: { x: CX, y: CY }, ease: 'back' },
  )
  g.fx.push({ at, dur: until - at, kind: 'line', actor: 'carrot', dx: 0.5, dy: -5, to: { x: CX + 0.5, y: -10 }, color: ROPE, width: 1 })
  g.cues.push({ at, sfx: 'slide' })
}

/** 哥哥隨手一伸就拿到、「啊嗚」一口吃掉（at 是伸手那一刻）。回傳吃下去那一刻 */
function grab(at: number): number {
  const gulp = at + 0.42
  g.moves.push(
    { at, actor: 'bro', do: 'swap', emoji: 'prop:bro-lift' },
    { at, dur: 0.22, actor: 'bro', do: 'hop', amount: 1 },
    // 一伸手就抓到（紅蘿蔔進到他舉高的右手）
    { at: at + 0.04, dur: 0.12, actor: 'carrot', do: 'moveTo', to: { x: RX + 17, y: 26 } },
    { at: at + 0.28, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    { at: at + 0.28, dur: 0.14, actor: 'carrot', do: 'moveTo', to: { x: RX + 5, y: 41 } },
    { at: gulp, dur: 0.12, actor: 'carrot', do: 'vanish' },
    { at: gulp, dur: 0.2, actor: 'bro', do: 'squash', amount: 0.1 },
    { at: gulp + 0.18, actor: 'bro', do: 'swap', emoji: 'prop:bro-oops' },
  )
  g.cues.push({ at: gulp, sfx: 'gulp' })
  return gulp
}

/**
 * 同一個笑點「嘿！——差一截——咚。哥哥啊嗚」：她拚命往上搆（k=0 踮腳、1 跳、2 助跑飛撲），
 * 在最高點停住 0.3 秒（手和紅蘿蔔之間那一截空隙看得清楚）＋鏡頭推一下，掉下來（站住 → 跌坐 → 摔扁）＋同一個音效（一次多疊一個音）。
 * s 是開始往上那一刻（k=2 是飛撲出去那一刻）。回傳落地那一刻。
 */
function reach(s: number, k: number): number {
  const top = s + 0.22
  const hold = k === 2 ? 0.38 : 0.3
  const fall = top + hold
  const land = fall + (k === 0 ? 0.12 : 0.17)
  const pose = ['hero:bunny/lift', 'hero:bunny/jump', 'hero:bunny/leap'][k]
  g.moves.push(
    ...(k < 2 ? [{ at: s - 0.12, dur: 0.14, actor: 'bunny', do: 'squash', amount: 0.18 } as Move] : []),
    { at: s, actor: 'bunny', do: 'swap', emoji: pose },
    { at: s, dur: 0.22, actor: 'bunny', do: 'moveTo', to: { x: BX, y: BY - RISE[k] }, ease: 'out' },
    // 最高點：伸長、手指抖——就是差一截
    { at: top, dur: hold, actor: 'bunny', do: 'shake', amount: 0.35 },
    { at: fall, dur: land - fall, actor: 'bunny', do: 'moveTo', to: HERE, ease: 'in' },
  )
  if (k === 0) {
    // 踮腳：整個人拉長一點
    g.moves.push(
      { at: s, dur: 0.2, actor: 'bunny', do: 'stretchTo', amount: 0.9 },
      { at: fall, dur: 0.12, actor: 'bunny', do: 'stretchTo', amount: 1 / 0.9 },
      { at: land, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    )
  } else if (k === 1) {
    g.moves.push({ at: land, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' })
  } else {
    g.moves.push({ at: land, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' })
  }
  g.camera.push(
    { at: top - 0.05, dur: hold + 0.1, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: CX + 4, y: 42 } },
    { at: land, dur: 0.3, do: 'shake', amount: 0.6 + 0.5 * k },
  )
  g.cues.push({ at: s, sfx: 'boing' }, { at: land, sfx: 'bonk' })
  if (k >= 1) g.cues.push({ at: land + 0.04, sfx: 'crack' })
  if (k >= 2) g.cues.push({ at: land + 0.08, sfx: 'clink' })
  return land
}

// 第 1 次：踮腳
const A1 = 1.05
const S1 = A1 + 0.3
const L1 = reach(S1, 0)
const G1 = L1 + 0.15
// 第 2 次：用力跳
// 前一根吃下去、消失以後，下一根才垂下來
const A2 = G1 + 0.56
const S2 = A2 + 0.3
const L2 = reach(S2, 1)
const G2 = L2 + 0.15
// 第 3 次前停一拍：托著下巴看看哥哥、看看紅蘿蔔，退到後面助跑
const A3 = G2 + 0.56
const PONDER = A3 + 0.25
const BACK = PONDER + 0.45
const RUN_FROM = 118
const READY = BACK + 0.3
const DASH = READY + 0.2
const S3 = DASH + 0.24
const L3 = reach(S3, 2)
const G3 = L3 + 0.15
/** 字框填滿、國字到正中央（她哭著跑到左邊、哥哥讓到右邊） */
const ASIDE = G3 + 0.5
const HOME = ASIDE + 0.25
const PARK = HOME + 0.8
/** 國字讓位到一半才走回來（不從正中央的國字前面經過） */
const RETURN = PARK + 0.1
/** 語詞那一刻 */
const WORD = RETURN + 0.45
// 回馬槍（第 4 次）：大木頭吊著紅蘿蔔從右邊盪過來
const R4 = WORD + 0.35
/** 紅蘿蔔盪到她嘴巴前 */
const CHOMP = R4 + 0.75
/** 木頭撞上哥哥的臉 */
const BONK = CHOMP + 0.1
const BRO_OUT = BONK + 0.45
/** 問他 */
const ASK = BRO_OUT + 0.3
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.48

// 紅蘿蔔垂下來（繩子連到哥哥拿走那一刻）、哥哥拿走吃掉
lower(A1, G1 + 0.14)
lower(A2, G2 + 0.14)
lower(A3, G3 + 0.14)
const GULP1 = grab(G1)
const GULP2 = grab(G2)
const GULP3 = grab(G3)

g.builds.push(
  // 第 1 次踮腳落地：矢
  { at: L1 + 0.05, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'bunny', color: partColor('矢') },
  // 第 2 次跌坐：禾
  { at: L2 + 0.05, dur: 0.5, strokes: [5, 6, 7, 8, 9], from: 'bunny', color: partColor('禾') },
  // 第 3 次摔扁：女
  { at: L3 + 0.05, dur: 0.45, strokes: [10, 11, 12], from: 'bunny', color: partColor('女') },
)

/** 回馬槍：木頭（和頭上看不見的吊點）、紅蘿蔔一起從右邊盪過來 */
const LOG_FROM = 192
const LOG_AT_CHOMP = BX + 4
const LOG_HIT = RX + 13

const clip: Clip = {
  format: 2,
  char: '矮',
  meta: { theme: '搆不到的紅蘿蔔', cast: '兔子女孩＋兔子哥哥＋紅蘿蔔＋大木頭', gags: ['上面每垂下一根紅蘿蔔，兔子女孩就拚命去搆——手總是差一截（踮腳差一大截傻眼→用力跳差一點跌坐→先停一拍、助跑飛撲只差一點點摔扁），高高的哥哥隨手一伸就拿到、啊嗚吃掉；回馬槍是紅蘿蔔吊在一根大木頭底下盪過來，木頭在哥哥臉的高度「咚」撞上他，紅蘿蔔剛好在她嘴巴的高度，矮矮的她一口吃到'] },
  duration: 15,
  bg: { top: '#BFE6FF', bottom: '#F2FBE6', floor: '#9ED17A', scenery: 'hills' },
  actors: [
    { id: 'anchor', emoji: '⭐', x: LOG_FROM, y: -8, size: 4, hidden: true },
    { id: 'bro', emoji: 'prop:bro', x: RX, y: RY, size: RS, flip: true },
    { id: 'log', emoji: '🪵', x: LOG_FROM, y: LOGY, size: 17, hidden: true, pivot: 'center' },
    { id: 'carrot', emoji: '🥕', x: CX, y: -12, size: CS, hidden: true, pivot: 'center' },
    { id: 'bunny', emoji: 'hero:bunny/walk', x: BX, y: BY, size: BS, hidden: true },
  ],
  moves: [
    // 紅蘿蔔轉成葉子朝上、尖端朝下；木頭橫著放
    { at: -0.02, dur: 0.01, actor: 'carrot', do: 'rotateTo', amount: -45 },
    { at: -0.02, dur: 0.01, actor: 'log', do: 'rotateTo', amount: 90 },
    // 開場：她從右邊走到哥哥旁邊，抬頭看——只到他的肩膀
    { at: 0, dur: 0.65, actor: 'bunny', do: 'enter', from: { x: 178, y: BY } },
    { at: 0.68, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: 0.7, dur: 0.4, actor: 'bunny', do: 'tilt', amount: 8 },
    ...g.moves,
    // 第 1 次之後：傻眼
    { at: G1 + 0.25, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    { at: A2 + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/drool' },
    // 第 2 次之後：跌坐、看著哥哥吃掉，生氣
    { at: GULP2 + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/angry' },
    { at: GULP2 + 0.05, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2.5 },
    // 第 3 次前停一拍：托著下巴，看看紅蘿蔔、看看哥哥
    { at: PONDER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ponder' },
    { at: PONDER + 0.25, dur: 0.25, actor: 'bunny', do: 'tilt', amount: -8 },
    // 退到後面、蹲低、助跑
    { at: BACK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: BACK, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: BACK, dur: 0.28, actor: 'bunny', do: 'moveTo', to: { x: RUN_FROM, y: BY } },
    { at: READY, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: READY, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: DASH, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: DASH, dur: 0.24, actor: 'bunny', do: 'moveTo', to: HERE, ease: 'in' },
    // 第 3 次之後：趴在地上大哭，哭著跑到右邊（國字要到正中央）
    { at: GULP3 - 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/cry' },
    { at: ASIDE, dur: 0.32, actor: 'bunny', do: 'moveTo', to: { x: 20, y: BY }, ease: 'out' },
    { at: ASIDE, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    { at: ASIDE, dur: 0.34, actor: 'bro', do: 'moveTo', to: { x: 134, y: RY } },
    // 國字讓位，兩個人走回原位：語詞「矮小」——她叉腰踮腳，也只到哥哥的肩膀
    { at: RETURN, dur: 0.01, actor: 'bro', do: 'flip' },
    { at: RETURN, dur: 0.35, actor: 'bro', do: 'moveTo', to: { x: RX, y: RY } },
    { at: RETURN + 0.36, dur: 0.01, actor: 'bro', do: 'flip' },
    { at: RETURN, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: RETURN, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: RETURN, dur: 0.35, actor: 'bunny', do: 'moveTo', to: HERE },
    { at: RETURN + 0.36, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: WORD, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/angry' },
    { at: WORD, dur: 0.2, actor: 'bunny', do: 'stretchTo', amount: 0.9 },
    { at: WORD + 0.35, dur: 0.15, actor: 'bunny', do: 'stretchTo', amount: 1 / 0.9 },
    { at: WORD + 0.1, actor: 'bro', do: 'swap', emoji: 'prop:bro-oops' },
    // 回馬槍：大木頭吊著紅蘿蔔從右邊盪過來；她轉過去、口水
    { at: R4 - 0.05, dur: 0.01, actor: 'carrot', do: 'moveTo', to: { x: LOG_FROM, y: LOGY + LOG_CARROT } },
    { at: R4, dur: 0.05, actor: 'carrot', do: 'pop' },
    { at: R4, dur: 0.05, actor: 'log', do: 'pop' },
    { at: R4, dur: CHOMP - R4, actor: 'anchor', do: 'moveTo', to: { x: LOG_AT_CHOMP, y: -8 }, ease: 'linear' },
    { at: R4, dur: CHOMP - R4, actor: 'log', do: 'moveTo', to: { x: LOG_AT_CHOMP, y: LOGY }, ease: 'linear' },
    { at: R4, dur: CHOMP - R4, actor: 'carrot', do: 'moveTo', to: { x: LOG_AT_CHOMP, y: LOGY + LOG_CARROT }, ease: 'linear' },
    { at: R4 + 0.2, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: R4 + 0.2, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/drool' },
    { at: R4 + 0.25, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    // 哥哥照樣舉手要拿
    { at: CHOMP - 0.25, actor: 'bro', do: 'swap', emoji: 'prop:bro-lift' },
    // 啊嗚！她一口咬到紅蘿蔔
    { at: CHOMP - 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/eat' },
    { at: CHOMP, dur: 0.1, actor: 'carrot', do: 'moveTo', to: { x: BX + 6, y: BY - 4 } },
    { at: CHOMP + 0.18, dur: 0.12, actor: 'carrot', do: 'vanish' },
    // 木頭繼續往左，咚！撞上哥哥的臉
    { at: CHOMP, dur: BONK - CHOMP, actor: 'anchor', do: 'moveTo', to: { x: LOG_HIT, y: -8 }, ease: 'linear' },
    { at: CHOMP, dur: BONK - CHOMP, actor: 'log', do: 'moveTo', to: { x: LOG_HIT, y: LOGY }, ease: 'linear' },
    { at: BONK, actor: 'bro', do: 'swap', emoji: 'prop:bro-shock' },
    { at: BONK, dur: 0.4, actor: 'bro', do: 'tilt', amount: -16 },
    { at: BONK, dur: 0.35, actor: 'bro', do: 'squash', amount: 0.12 },
    // 木頭彈回去、被拉上天
    { at: BONK, dur: 0.22, actor: 'log', do: 'moveTo', to: { x: LOG_HIT + 14, y: LOGY }, ease: 'out' },
    { at: BONK, dur: 0.22, actor: 'anchor', do: 'moveTo', to: { x: LOG_HIT + 14, y: -8 }, ease: 'out' },
    { at: BONK + 0.28, dur: 0.35, actor: 'log', do: 'moveTo', to: { x: LOG_HIT + 24, y: -30 }, ease: 'in' },
    { at: BONK + 0.28, dur: 0.35, actor: 'anchor', do: 'moveTo', to: { x: LOG_HIT + 24, y: -70 }, ease: 'in' },
    // 她轉過來看，得意
    { at: BONK + 0.12, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: BONK + 0.12, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    { at: BONK + 0.2, dur: 0.3, actor: 'bunny', do: 'hop', amount: 3 },
    // 哥哥揉著頭、暈暈地從她後面走掉（往右，不經過左上的字框）
    { at: BONK + 0.4, actor: 'bro', do: 'swap', emoji: 'prop:bro-oops' },
    { at: BRO_OUT, dur: 0.4, actor: 'bro', do: 'moveTo', to: { x: 210, y: RY }, ease: 'in' },
    // 問他：從右邊走到前面、轉向國字、變大
    { at: ASK, dur: 0.01, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/walk' },
    { at: ASK, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: ASK + 0.46, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: ASK, dur: 0.45, actor: 'bunny', do: 'moveTo', to: ASK_AT },
    { at: ASK + 0.04, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: 1.3 },
    { at: ASK + 0.5, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: ASK_SAY + 1.0, dur: 0.3, actor: 'bunny', do: 'rotateTo', amount: -10 },
    { at: ASK_SAY + 1.55, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: ASK_SAY + 2.05, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'bunny', do: 'rotateTo', amount: 10 },
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 8 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.24, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ANSWER + 0.24, dur: 0.01, actor: 'bunny', do: 'flip' },
    { at: ANSWER + 0.25, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: 205, y: ASK_AT.y }, ease: 'in' },
  ],
  builds: g.builds,
  glyph: [
    // 空字框一開始就讓到左上
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT, amount: PARK_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT, amount: PARK_K },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的她
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['bunny'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    { at: G1 + 0.3, kind: 'sweat', actor: 'bunny', dx: 4 },
    { at: PONDER + 0.1, kind: 'sweat', actor: 'bunny', dx: 5 },
    // 回馬槍：繩子（吊點→木頭、木頭→紅蘿蔔）
    { at: R4, dur: BONK + 0.63 - R4, kind: 'line', actor: 'log', target: 'anchor', color: ROPE, width: 1 },
    { at: R4, dur: CHOMP - R4, kind: 'line', actor: 'carrot', dx: 0.5, dy: -5, target: 'log', color: ROPE, width: 1 },
    { at: CHOMP + 0.05, kind: 'burst', x: BX + 6, y: BY - 6, emoji: '✨', n: 6, dur: 0.45, scale: 1.2 },
    // 咚！最大的一次
    { at: BONK, kind: 'burst', x: RX + 6, y: LOGY - 2, n: 1, dur: 0.45, scale: 1.9 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把高高的哥哥切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: 74, y: 50 } },
    { at: BONK, dur: 0.45, do: 'punch', amount: 0.08, to: { x: RX + 10, y: 45 } },
    { at: BONK, dur: 0.4, do: 'shake', amount: 2.4 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.72, say: '矮' },
    ...g.cues,
    { at: HOME + 0.2, say: '矮' },
    { at: WORD, say: '矮小' },
    { at: R4, sfx: 'whoosh' },
    { at: CHOMP, sfx: 'gulp' },
    { at: BONK, sfx: 'bonk' },
    { at: BONK + 0.04, sfx: 'crack' },
    { at: BONK + 0.08, sfx: 'clink' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '矮' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
