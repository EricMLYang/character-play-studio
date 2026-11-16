import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 鵝（v2）：大白鵝很兇，誰經過牠面前就追誰。小機器人每次走到大鵝面前，大鵝就伸長脖子、張開大翅膀「嘎！」一叫，
// 他傻眼一拍、轉身就逃，大鵝搖搖擺擺追上去、啄他屁股——一次比一次追得遠：追兩步啄一下（我從他身上彈出來）、
// 追著他繞了世界一圈（從左邊跑出去、從右邊跑回來）再啄（鳥的頭身從鵝身上抖出來）、
// 先停一拍：他拿出盾牌躲在後面偷看，大鵝歪頭看一看……「嘎！」一啄，盾牌飛走、他被啄上天（鳥底下的一勾和四點）。
// 語詞那一刻大鵝走到畫面中間抬頭挺胸：「大鵝」。
// 回馬槍（第四次）：大鵝又伸長脖子要叫——這次小機器人一板一眼學牠，先張開雙手「嘎！！」叫得更大聲，大鵝嚇一跳，張開翅膀飛走了，換他追鵝。
// 最後畫面暗下來只剩「鵝」，小機器人轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「鵝！」，然後退場只留字。
// 鵝、鵝、大鵝、這是什麼字？、鵝

/** 小機器人（明星，size 34）站在地上的 y */
const BS = 34
const P = 77 - 0.42 * BS
/** 大白鵝（prop:goose 三張同一個比例）：畫面上最大的東西 */
const GS = 56
const G = 77 - 0.42 * GS
/** 大鵝平常站的地方（右邊，字框右下方，不壓字框） */
const GX = 118
/** 小機器人每次走到的地方（大鵝面前） */
const NEAR = 76
/** 「嘎！」時大鵝往前一衝的距離 */
const LUNGE = 6
/** 追上他時大鵝的 x 比他多多少：張翅那張的嘴尖在 x − 0.39 × size，剛好碰到他的背 */
const NIPDX = 30
/** 張翅那張（prop:goose-chase）的嘴巴：照鵝的 x、y 算 */
const BEAK = { dx: -0.39 * GS, dy: -0.05 * GS }
/** 「嘎」的聲波顏色：鵝嘴巴的深橘，淺色天空上看得清楚 */
const WAVE = '#D9480F'

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/** 「嘎」的聲波：從嘴巴 o 往 dir 方向一圈一圈打出去（n 圈），每圈是三截粗線組成的 ( 形短弧 */
function honkWaves(at: number, who: string, base: Vec, o: Vec, n: number, width: number, dir: number, step = 5): Fx[] {
  const out: Fx[] = []
  const d = dir * Math.PI / 180
  for (let i = 0; i < n; i++) {
    const r = 4 + step * i
    const half = 40 * Math.PI / 180
    const pts = [0, 1, 2, 3].map((j) => {
      const a = d - half + (2 * half * j) / 3
      return { x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r }
    })
    for (let j = 0; j < 3; j++) {
      out.push({ at: at + 0.05 * i, dur: 0.35, kind: 'line', actor: who, dx: pts[j].x - base.x, dy: pts[j].y - base.y,
        to: pts[j + 1], color: WAVE, width })
    }
  }
  return out
}

/**
 * 「嘎！」：大鵝先把脖子往上一伸、身體一縮（預備，頭上冒 💢）→ 換張開翅膀、伸長脖子那張往前一衝，嘴前打出一圈一圈聲波，
 * 鏡頭推一下＋震、淡淡的白光、同一個叫聲（hic，一次多疊一聲）；小機器人傻眼停 0.4 秒（看得見臉）。
 * at 是叫的那一刻，k 是第幾次，gx 是大鵝當時站的地方。之後他怎麼逃、鵝怎麼追由劇本寫。
 */
function honk(at: number, k: number, gx = GX): Gag {
  const lx = gx - LUNGE
  const beak = { x: lx + BEAK.dx, y: G + BEAK.dy }
  const moves: Move[] = [
    // 預備：脖子往上一伸、身體一縮
    { at: at - 0.3, dur: 0.28, actor: 'goose', do: 'squash', amount: -0.15 },
    // 嘎！張開翅膀往前一衝
    { at, actor: 'goose', do: 'swap', emoji: 'prop:goose-chase' },
    { at, dur: 0.08, actor: 'goose', do: 'moveTo', to: { x: lx, y: G }, ease: 'out' },
    { at: at + 0.08, dur: 0.3, actor: 'goose', do: 'shake', amount: 0.6 + 0.2 * k },
    // 他傻眼、往後一縮，停住
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at, dur: 0.25, actor: 'bot', do: 'squash', amount: 0.25 },
    { at: at + 0.12, dur: 0.28, actor: 'bot', do: 'shake', amount: 0.6 + 0.2 * k },
  ]
  const fx: Fx[] = [
    { at: at - 0.3, kind: 'pop', actor: 'goose', emoji: '💢', dx: -2, dy: 1, dur: 0.4, scale: 1.4 + 0.1 * k },
    ...honkWaves(at, 'goose', { x: lx, y: G }, beak, 2 + k, 1.3 + 0.2 * k, 232, 4),
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: (NEAR + lx) / 2 + (gx - GX), y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.3 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'hic' }, { at: at + 0.1, sfx: 'hic' }]
  if (k >= 1) cues.push({ at: at + 0.2, sfx: 'hic' })
  if (k >= 2) cues.push({ at: at + 0.3, sfx: 'hic' })
  const lights: Light[] = [{ at, dur: 0.04, level: -0.15 - 0.05 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]
  return { moves, fx, camera, cues, lights }
}

/**
 * 啄！大鵝（張翅那張）的嘴尖戳在他背後那一刻：鵝往前一點頭、💥＋⭐ 一次比一次大、鏡頭震、同一個音效（tap＋bonk）。
 * at 是啄到的那一刻，bx 是他當時的 x（他面向左逃，背在右邊）。被啄以後飛多遠由劇本寫。
 */
function peck(at: number, k: number, bx: number): Gag {
  const moves: Move[] = [
    { at, dur: 0.2, actor: 'goose', do: 'tilt', amount: -10 },
    { at, dur: 0.2, actor: 'goose', do: 'squash', amount: 0.12 },
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', x: bx + 9, y: P - 4, n: 1, dur: 0.4, scale: 1.3 + 0.3 * k },
    { at, kind: 'burst', x: bx + 9, y: P - 4, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [{ at, dur: 0.3, do: 'shake', amount: 0.9 + 0.4 * k }]
  const cues: Cue[] = [{ at, sfx: 'tap' }, { at: at + 0.03, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'boing' })
  const lights: Light[] = [{ at, dur: 0.04, level: -0.2 - 0.06 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]
  return { moves, fx, camera, cues, lights }
}

// 第 1 次：嘎 → 逃兩步 → 啄
const A1 = 1.45, N1 = 2.17
// 第 2 次：嘎 → 從左邊逃出去、繞世界一圈從右邊跑回來 → 啄
const A2 = 3.65, N2 = 4.95
// 第 3 次：停一拍（盾牌）→ 嘎 → 一啄，盾牌飛走、他上天
const A3 = 6.65, N3 = 7.0
/** 國字拼好、放大到正中央 */
const HOME = 7.75
/** 讓位 */
const PARK = 8.6
/** 國字放大時大鵝讓到右邊 */
const SIDE = 142
/** 語詞那一刻大鵝站的地方（畫面中間偏右，頭在讓位的國字右下方） */
const GW = 100
const WORD = 9.05
/** 回馬槍：大鵝預備要叫，他先「嘎！！」 */
const A4 = 9.95
/** 問他 */
const ASK = 11.0
const ANSWER = 13.6

const h1 = honk(A1, 0)
const p1 = peck(N1, 0, 36)
const h2 = honk(A2, 1)
const p2 = peck(N2, 1, 66)
const h3 = honk(A3, 2)

/** 回馬槍：小機器人學大鵝張開雙手「嘎！！」，聲波往右打向大鵝 */
const BOT4 = GW - 42
const twistWaves = honkWaves(A4, 'bot', { x: BOT4, y: P }, { x: BOT4 + 10, y: P - 6 }, 4, 1.8, -20, 6)

const clip: Clip = {
  format: 2,
  char: '鵝',
  meta: { theme: '大白鵝追人', cast: '小機器人＋大白鵝＋盾牌', gags: ['小機器人每次走到大白鵝面前，大鵝就伸長脖子、張開翅膀「嘎！」一叫，追上去啄他屁股，一次比一次追得遠（追兩步→追著他繞世界一圈→停一拍他拿盾牌躲，盾牌被啄飛、他被啄上天）；回馬槍是大鵝又要叫，他一板一眼學牠先張開雙手「嘎！！」，大鵝嚇一跳飛走，換他追鵝'] },
  duration: 15,
  // 草地＋藍天：天空藍得夠深，白鵝在上面看得出來；鵝都站在地平線附近，不在白雲前面
  bg: { top: '#7FC4EA', bottom: '#B4DDE6', floor: '#78BE5E', scenery: 'hills' },
  actors: [
    // 大白鵝圖朝左（面向左邊的他），畫在他後面：追上他時翅膀不會蓋住他
    { id: 'goose', emoji: 'prop:goose', x: GX, y: G, size: GS },
    // 姿勢圖朝左，翻過來面向右邊的大鵝
    { id: 'bot', emoji: 'hero:bot/walk', x: 40, y: P, size: BS, hidden: true, flip: true },
    // 第三次拿出來擋的盾牌（拿在他胸前）
    { id: 'shield', emoji: '🛡️', x: 31, y: P + 2, size: 17, hidden: true, float: true },
  ],
  moves: [
    // 開場：他走進來，指著大鵝：鵝！大鵝得意地抬頭
    { at: 0, actor: 'bot', do: 'enter', from: { x: -22, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 0.6, dur: 0.35, actor: 'goose', do: 'tilt', amount: 6 },
    // 走到大鵝面前（想經過）
    { at: 0.85, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: 0.85, dur: 0.35, actor: 'bot', do: 'moveTo', to: { x: NEAR, y: P } },

    // ── 第 1 次：嘎！→ 逃兩步，被追上啄一口，彈起來跌坐
    ...h1.moves,
    { at: A1 + 0.4, actor: 'bot', do: 'flip' },
    { at: A1 + 0.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: A1 + 0.42, dur: 0.3, actor: 'bot', do: 'moveTo', to: { x: 36, y: P }, ease: 'in' },
    { at: A1 + 0.42, dur: 0.3, actor: 'goose', do: 'moveTo', to: { x: 36 + NIPDX, y: G }, ease: 'in' },
    ...p1.moves,
    { at: N1 + 0.02, dur: 0.4, actor: 'bot', do: 'moveTo', to: { x: 20, y: P }, arc: 12, ease: 'out' },
    { at: N1 + 0.42, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall' },
    // 大鵝收起翅膀、搖搖擺擺走回去
    { at: N1 + 0.25, actor: 'goose', do: 'swap', emoji: 'prop:goose' },
    { at: N1 + 0.25, actor: 'goose', do: 'flip' },
    { at: N1 + 0.27, dur: 0.45, actor: 'goose', do: 'moveTo', to: { x: GX, y: G } },
    { at: N1 + 0.72, actor: 'goose', do: 'flip' },
    { at: N1 + 0.78, dur: 0.3, actor: 'goose', do: 'tilt', amount: 6 },
    // 爬起來，又走過去
    { at: 2.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: 2.95, actor: 'bot', do: 'flip' },
    { at: 2.97, dur: 0.38, actor: 'bot', do: 'moveTo', to: { x: NEAR, y: P } },

    // ── 第 2 次：嘎！→ 從左邊逃出去，大鵝追出去；繞了世界一圈從右邊跑回來，大鵝還在後面追，啄！轉兩圈摔扁
    ...h2.moves,
    { at: A2 + 0.4, actor: 'bot', do: 'flip' },
    { at: A2 + 0.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: A2 + 0.42, dur: 0.3, actor: 'bot', do: 'moveTo', to: { x: -25, y: P }, ease: 'in' },
    { at: A2 + 0.45, dur: 0.38, actor: 'goose', do: 'moveTo', to: { x: -45, y: G }, ease: 'in' },
    { at: 4.5, dur: 0.01, actor: 'bot', do: 'moveTo', to: { x: 190, y: P } },
    { at: 4.52, dur: 0.4, actor: 'bot', do: 'moveTo', to: { x: 66, y: P }, ease: 'linear' },
    { at: 4.5, dur: 0.01, actor: 'goose', do: 'moveTo', to: { x: 225, y: G } },
    { at: 4.55, dur: 0.4, actor: 'goose', do: 'moveTo', to: { x: 66 + NIPDX, y: G }, ease: 'linear' },
    ...p2.moves,
    { at: N2 + 0.02, dur: 0.45, actor: 'bot', do: 'moveTo', to: { x: 20, y: P }, arc: 18, ease: 'out' },
    { at: N2 + 0.02, dur: 0.45, actor: 'bot', do: 'spin', times: -2, pivot: 'center' },
    { at: N2 + 0.47, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
    { at: N2 + 0.2, actor: 'goose', do: 'swap', emoji: 'prop:goose' },
    { at: N2 + 0.2, actor: 'goose', do: 'flip' },
    { at: N2 + 0.22, dur: 0.35, actor: 'goose', do: 'moveTo', to: { x: GX, y: G } },
    { at: N2 + 0.57, actor: 'goose', do: 'flip' },

    // ── 第 3 次前停一拍：他拿出盾牌，躲在後面走過去、蹲低偷看；大鵝歪頭看一看……
    { at: 5.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: 5.6, actor: 'bot', do: 'flip' },
    { at: 5.65, actor: 'shield', do: 'pop', dur: 0.25 },
    { at: 5.8, dur: 0.35, actor: 'bot', do: 'moveTo', to: { x: NEAR, y: P } },
    { at: 5.8, dur: 0.35, actor: 'shield', do: 'moveTo', to: { x: NEAR + 11, y: P + 2 } },
    { at: 6.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/peek' },
    { at: 6.15, dur: 0.3, actor: 'goose', do: 'rotateTo', amount: -8 },
    { at: 6.4, dur: 0.1, actor: 'goose', do: 'rotateTo', amount: 8 },
    ...h3.moves,
    // 他躲在盾牌後面傻眼，盾牌跟著抖
    { at: A3 + 0.12, dur: 0.23, actor: 'shield', do: 'shake', amount: 1 },
    // 啄！盾牌被啄飛（往右上翻著飛走），他被啄上天
    { at: N3, dur: 0.15, actor: 'goose', do: 'moveTo', to: { x: GX - LUNGE - 4, y: G }, ease: 'out' },
    { at: N3, dur: 0.8, actor: 'shield', do: 'moveTo', to: { x: 156, y: -22 }, ease: 'linear' },
    { at: N3, dur: 0.8, actor: 'shield', do: 'spin', times: 4, pivot: 'center' },
    { at: N3, dur: 0.12, actor: 'bot', do: 'squash', amount: -0.25 },
    { at: N3 + 0.05, dur: 0.45, actor: 'bot', do: 'moveTo', to: { x: 12, y: -60 }, ease: 'out' },
    { at: N3 + 0.05, dur: 0.45, actor: 'bot', do: 'spin', times: -2, pivot: 'center' },
    { at: N3 + 0.8, actor: 'shield', do: 'vanish', dur: 0.01 },
    // 大鵝收起翅膀，讓到右邊（國字要放大）
    { at: 7.25, actor: 'goose', do: 'swap', emoji: 'prop:goose' },
    { at: 7.25, actor: 'goose', do: 'flip' },
    { at: 7.27, dur: 0.4, actor: 'goose', do: 'moveTo', to: { x: SIDE, y: G } },
    { at: 7.67, actor: 'goose', do: 'flip' },
    // 他從天上掉回左邊，摔扁
    { at: 7.55, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: 7.55, dur: 0.01, actor: 'bot', do: 'moveTo', to: { x: 20, y: -50 } },
    { at: 7.6, dur: 0.3, actor: 'bot', do: 'moveTo', to: { x: 20, y: P }, ease: 'in' },
    { at: 7.9, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },

    // ── 語詞那一刻：國字讓回上方，大鵝走到畫面中間抬頭挺胸（大鵝）；他爬起來走過去、指著牠
    { at: PARK + 0.05, dur: 0.4, actor: 'goose', do: 'moveTo', to: { x: GW, y: G } },
    { at: PARK - 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: PARK - 0.1, actor: 'bot', do: 'flip' },
    { at: PARK, dur: 0.35, actor: 'bot', do: 'moveTo', to: { x: BOT4, y: P } },
    { at: WORD - 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: WORD, dur: 0.3, actor: 'goose', do: 'squash', amount: -0.12 },
    { at: WORD + 0.3, dur: 0.35, actor: 'goose', do: 'tilt', amount: 6 },

    // ── 回馬槍（第 4 次）：大鵝又伸長脖子要叫——他先張開雙手「嘎！！」，大鵝嚇一跳，張開翅膀飛走，換他追
    { at: A4 - 0.3, dur: 0.28, actor: 'goose', do: 'squash', amount: -0.15 },
    { at: A4 - 0.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/hug' },
    { at: A4 - 0.15, dur: 0.15, actor: 'bot', do: 'squash', amount: -0.2 },
    { at: A4, dur: 0.3, actor: 'bot', do: 'hop', amount: 4 },
    { at: A4 + 0.08, dur: 0.35, actor: 'goose', do: 'hop', amount: 7 },
    { at: A4 + 0.08, dur: 0.4, actor: 'goose', do: 'tilt', amount: 14 },
    { at: A4 + 0.08, dur: 0.4, actor: 'goose', do: 'shake', amount: 1.2 },
    { at: A4 + 0.5, actor: 'goose', do: 'flip' },
    { at: A4 + 0.5, actor: 'goose', do: 'swap', emoji: 'prop:goose-chase' },
    { at: A4 + 0.52, dur: 0.45, actor: 'goose', do: 'moveTo', to: { x: 215, y: 10 }, ease: 'in' },
    { at: A4 + 0.5, dur: 0.4, actor: 'bot', do: 'moveTo', to: { x: 84, y: P } },
    { at: A4 + 0.9, actor: 'bot', do: 'swap', emoji: 'hero:bot/smug' },

    // 問他：他走到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: ASK + 0.05, actor: 'bot', do: 'flip' },
    { at: ASK + 0.05, dur: 0.01, actor: 'bot', do: 'moveTo', to: { x: 32, y: -50 } },
    { at: ASK + 0.05, dur: 0.01, actor: 'bot', do: 'scaleTo', amount: 1.3 },
    { at: ASK + 0.1, dur: 0.25, actor: 'bot', do: 'moveTo', to: { x: 32, y: P + 3 }, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: 12.0, dur: 0.3, actor: 'bot', do: 'rotateTo', amount: 10 },
    { at: 12.55, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
    { at: 13.05, dur: 0.3, actor: 'bot', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'bot', do: 'rotateTo', amount: -10 },
    { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ANSWER, dur: 0.2, actor: 'bot', do: 'hop', amount: 8 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ANSWER + 0.2, dur: 0.15, actor: 'bot', do: 'moveTo', to: { x: -45, y: P + 3 }, ease: 'in' },
  ],
  builds: [
    // 第 1 次：被啄一口跳起來，「我」從他身上彈出來
    { at: N1 + 0.05, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'bot', color: partColor('我') },
    // 第 2 次：大鵝啄完一甩頭，鳥的頭身從鵝身上抖出來
    { at: N2 + 0.05, dur: 0.55, strokes: [7, 8, 9, 10, 11, 12], from: 'goose', color: partColor('鳥') },
    // 第 3 次：啄飛盾牌那一下，鳥底下的一勾和四點抖出來
    { at: N3 + 0.05, dur: 0.55, strokes: [13, 14, 15, 16, 17], from: 'goose', color: partColor('鳥') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的他
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bot'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...h1.fx,
    ...p1.fx,
    { at: N1 + 0.45, kind: 'sweat', actor: 'bot', dx: -5 },
    ...h2.fx,
    ...p2.fx,
    { at: N2 + 0.5, kind: 'dizzy', actor: 'bot', dur: 0.5 },
    // 停一拍：躲在盾牌後面冒汗；大鵝歪頭
    { at: 6.2, kind: 'sweat', actor: 'bot', dx: -5 },
    { at: 6.15, kind: 'pop', actor: 'goose', emoji: '❓', dx: -4, dur: 0.45, scale: 1.3 },
    ...h3.fx,
    // 啄穿盾牌：鏘！
    { at: N3, kind: 'burst', x: NEAR + 12, y: P - 2, n: 1, dur: 0.45, scale: 2.2 },
    { at: N3, kind: 'burst', x: NEAR + 12, y: P - 2, emoji: '⭐', n: 9, dur: 0.45 },
    { at: 7.9, kind: 'dizzy', actor: 'bot', dur: 0.5 },
    // 語詞：大鵝身邊亮一圈
    { at: WORD, kind: 'burst', x: GW, y: 52, emoji: '✨', n: 8, dur: 0.6, scale: 1.3 },
    // 回馬槍：他「嘎！！」——聲波比大鵝的還多還粗；大鵝嚇一跳冒汗、冒 ❗
    { at: A4 - 0.3, kind: 'pop', actor: 'goose', emoji: '💢', dx: -2, dy: 1, dur: 0.3, scale: 1.4 },
    ...twistWaves,
    { at: A4 + 0.1, kind: 'pop', actor: 'goose', emoji: '❗', dx: 9, dy: 4, dur: 0.5, scale: 1.8 },
    { at: A4 + 0.15, kind: 'sweat', actor: 'goose', dx: -8, scale: 1.3 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：他會逃出畫面、飛上天，自動取景追著他會把大鵝切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...h1.camera,
    ...p1.camera,
    ...h2.camera,
    ...p2.camera,
    ...h3.camera,
    { at: N3, dur: 0.35, do: 'shake', amount: 2 },
    // 國字放大、讓位、語詞都鎖全景：自動取景推近會把讓到右邊的大鵝切掉
    { at: 7.6, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    { at: 7.9, dur: 0.25, do: 'shake', amount: 1 },
    { at: A4, dur: 0.4, do: 'punch', amount: 0.12, to: { x: BOT4 + 14, y: P - 8 } },
    { at: A4, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...h1.lights,
    ...p1.lights,
    ...h2.lights,
    ...p2.lights,
    ...h3.lights,
    { at: N3, dur: 0.04, level: -0.32 },
    { at: N3 + 0.04, dur: 0.25, level: 0 },
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '鵝' },
    ...h1.cues,
    { at: A1 + 0.42, sfx: 'whoosh' },
    ...p1.cues,
    { at: N1 + 0.42, sfx: 'plop' },
    ...h2.cues,
    { at: A2 + 0.42, sfx: 'whoosh' },
    { at: 4.52, sfx: 'whoosh' },
    ...p2.cues,
    { at: N2 + 0.47, sfx: 'plop' },
    { at: 5.65, sfx: 'blip' },
    ...h3.cues,
    { at: N3, sfx: 'clink' },
    { at: N3 + 0.02, sfx: 'bonk' },
    { at: N3 + 0.05, sfx: 'boing' },
    { at: 7.9, sfx: 'plop' },
    { at: HOME + 0.1, say: '鵝' },
    { at: WORD, say: '大鵝' },
    // 他學大鵝叫：同一個叫聲，疊最多聲
    { at: A4, sfx: 'hic' }, { at: A4 + 0.08, sfx: 'hic' }, { at: A4 + 0.16, sfx: 'hic' }, { at: A4 + 0.24, sfx: 'hic' }, { at: A4 + 0.32, sfx: 'hic' },
    { at: A4 + 0.52, sfx: 'whoosh' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '鵝' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
