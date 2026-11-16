import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 愛（v2）：浣熊花生的愛太多了。他一看到豬探長，就張開雙手，胸口「噗通、噗通」冒出一顆紅色愛心，一跳就大一圈，
// 「咻」地送過去——「啪！」打中豬探長。每次都一樣，只是愛心一次比一次大、豬探長一次比一次招架不住：
// 小愛心貼在臉上，他臉紅得手足無措（爫、冖）→ 大愛心「碰」地把他撞得往後滑、跌坐頭暈（心從愛心上飛出來）→
// 先停一拍：豬探長爬回來，伸手比「等一下！」、冒汗——花生的胸口「噗通、噗通、噗通」跳了三下，愛心長得比他還大——
// 「轟！」超大愛心整顆壓在豬探長身上，只剩兩隻腳在外面亂踢（夂）。
// 語詞那一刻：超大愛心「啵」地從豬探長身上彈起來、落在畫面中間，花生跑過去一把抱住：「愛心」。
// 回馬槍（第四次，反過來）：豬探長站起來，也張開雙手——他的胸口也「噗通、噗通」冒出一顆愛心，而且比剛剛那顆還大，
// 「咻——轟！」整顆壓在花生身上，花生被壓得扁扁的，還笑咪咪。
// 最後畫面暗下來只剩「愛」，花生問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「愛！」，然後退場只留字。
// 刻意不跟「妹」（撒嬌星星眼、一串小愛心打中哥哥）、「媽」「姑」「親」（抱抱、親親）、「棕」（熊抱）、「樂」（😄 傳染）、「甜」（甜到飄愛心）撞：
// 這支是「一顆愛心從胸口長出來、送過去打中人」，同一顆愛心一次比一次大、打得一次比一次重。
// 愛、愛、愛心、這是什麼字？、愛

/** 花生（左邊，flip 朝右；每次都站在同一個地方） */
const RS = 34
const RY = 77 - 0.42 * RS
const RX = 40
/** 豬探長（右邊，圖本來就朝左，面向花生；每次都站在同一個地方） */
const PS = 34
const PY = 77 - 0.42 * PS
const PX = 120
/** 愛心底子的大小（共用一個角色的那顆寫最大的那次） */
const H1S = 46, H2S = 22, H3S = 36
/** 愛心送出去的四次，實際大小一次比一次大 */
const SIZE = [13, 22, 36, 46]
/** 愛心飛多久 */
const FLY = 0.42
/** 心跳一下多久 */
const BEAT = 0.27

/** 讓愛心的「腳底」（圖的底邊）落在 feet：actor 的 y 是腳底往上 0.42 × 底子大小 */
const at = (x: number, feet: number, base: number): Vec => ({ x, y: feet - 0.42 * base })

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 同一個笑點「噗通、噗通——咻——啪！」：送愛心的人（who）張開雙手吸一口氣，胸口 chest 冒出一顆小愛心（heart），
 * 每「噗通」一下大一圈、往上浮到頭頂 top（腳底），跳完 beats 下就「咻」地飛到 hit（腳底），打中的那一刻是 at。
 * 愛心最後的大小是 size；base 是那顆愛心 actor 的底子大小。
 * 打中那一刻：一圈 💕＋💥（一次比一次大），鏡頭推近＋震，同一個「啵」聲（一次多疊一個音）。
 * k 是第幾次（0～3）；send 是送出去那一下的姿勢（豬探長的 throw 臉太兇，回送時用 happy）。被打中的人怎麼反應由呼叫的人寫。
 */
function love(atT: number, k: number, who: string, heart: string, base: number, size: number, chest: Vec, top: Vec, hit: Vec, beats: number, arc = 6, send = 'throw'): Gag {
  const T0 = atT - FLY - 0.08 - beats * BEAT - 0.25
  const goal = size / base
  const s0 = goal * 0.35
  const r = Math.pow(1 / 0.35, 1 / beats)
  const moves: Move[] = [
    // 張開雙手、吸一口氣
    { at: T0 - 0.2, actor: who, do: 'swap', emoji: `hero:${who}/hug` },
    { at: T0 - 0.05, actor: who, do: 'squash', amount: -0.1, dur: 0.25 },
    // 胸口冒出一顆小愛心（pop 會把大小歸 1，縮小要寫在 pop 後面）
    { at: T0, actor: heart, do: 'moveTo', to: at(chest.x, chest.y, base), dur: 0.01 },
    { at: T0, actor: heart, do: 'pop', dur: 0.22 },
    { at: T0, actor: heart, do: 'scaleTo', amount: s0, dur: 0.01 },
    // 一邊噗通噗通變大、一邊浮到頭頂
    { at: T0 + 0.25, actor: heart, do: 'moveTo', to: at(top.x, top.y, base), dur: beats * BEAT, ease: 'out' },
  ]
  const cues: Cue[] = [{ at: T0, sfx: 'plop' }]
  for (let i = 0; i < beats; i++) {
    const b = T0 + 0.25 + i * BEAT
    moves.push({ at: b, actor: heart, do: 'scaleTo', amount: r, dur: 0.14, ease: 'back' })
    moves.push({ at: b, actor: who, do: 'squash', amount: 0.07, dur: 0.16 })
    cues.push({ at: b, sfx: 'tap' })
  }
  // 「咻」地送出去
  const go = T0 + 0.25 + beats * BEAT + 0.08
  moves.push({ at: go, actor: who, do: 'swap', emoji: `hero:${who}/${send}` })
  moves.push({ at: go, actor: heart, do: 'moveTo', to: at(hit.x, hit.y, base), dur: FLY, arc, ease: 'in' })
  cues.push({ at: go, sfx: 'whoosh' })
  // 打中：愛心本身壓扁一下
  moves.push({ at: atT, actor: heart, do: 'squash', amount: 0.25, dur: 0.25 })
  const mid = { x: hit.x, y: hit.y - size * 0.5 }
  const fx: Fx[] = [
    { at: atT, kind: 'burst', x: mid.x, y: mid.y, n: 6 + k, emoji: '💕', dur: 0.7, scale: 1 + 0.25 * k },
    { at: atT, kind: 'burst', x: mid.x + (hit.x > 80 ? -1 : 1) * (size * 0.45), y: mid.y - 2, n: 1, emoji: '💥', dur: 0.45, scale: 1.1 + 0.35 * k },
  ]
  const camera: Camera[] = [
    // 推近時往打中的那一邊偏：大愛心落在畫面邊上，不能被切掉
    { at: atT, dur: 0.45, do: 'punch', amount: 0.05 + 0.03 * Math.min(k, 2), to: { x: hit.x > 80 ? 98 : 62, y: 48 } },
    { at: atT, dur: 0.35, do: 'shake', amount: 0.7 + 0.45 * k },
  ]
  cues.push({ at: atT, sfx: 'boing' })
  if (k >= 1) cues.push({ at: atT + 0.04, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: atT + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/** 花生的胸口與頭頂（愛心長出來、浮上去的地方） */
const R_CHEST = { x: RX + 3, y: RY + 4 }
const R_TOP = { x: RX + 4, y: 47 }
/** 豬探長的臉、胸口 */
const P_FACE = { x: PX - 4, y: 57 }
const P_CHEST = { x: PX - 3, y: 67 }

const H1 = 1.9, H2 = 3.6, H3 = 6.4, H4 = 10.24
const g1 = love(H1, 0, 'raccoon', 'h1', H1S, SIZE[0], R_CHEST, R_TOP, P_FACE, 2, 4)
const g2 = love(H2, 1, 'raccoon', 'h2', H2S, SIZE[1], R_CHEST, R_TOP, P_CHEST, 2, 4)
// 第 3 次的超大愛心落在豬探長稍後面、把他往後推一點：國字回中央那一秒，愛心和他都要在國字右邊
const PX3 = PX + 8
const g3 = love(H3, 2, 'raccoon', 'h3', H3S, SIZE[2], R_CHEST, R_TOP, { x: PX3 + 2, y: 77 }, 3, 2)
/** 第四次反過來：豬探長送、花生被壓 */
const P_CHEST4 = { x: PX3 - 2, y: PY + 4 }
const P_TOP4 = { x: PX3 + 4, y: 47 }
const g4 = love(H4, 3, 'pig', 'h1', H1S, SIZE[3], P_CHEST4, P_TOP4, { x: RX - 2, y: 77 }, 2, 4, 'happy')

const WORD = 8.4
/** 語詞那一刻：愛心落在畫面中間，花生在它左邊抱住 */
const WX = 92, WRX = 66

const clip: Clip = {
  format: 2,
  char: '愛',
  meta: { theme: '愛太多了', cast: '浣熊花生＋豬探長＋紅色愛心', gags: ['花生的愛太多了，每次張開雙手、胸口噗通噗通冒出一顆愛心送給豬探長，愛心一次比一次大、打得一次比一次重：小愛心貼在臉上害他臉紅、大愛心把他撞得跌坐、超大愛心把他整個壓住只剩腳在踢；回馬槍是豬探長也噗通噗通回送一顆更大的，把花生壓扁，花生還笑咪咪'] },
  duration: 15,
  bg: { top: '#FFE1EA', bottom: '#FFF5F8', floor: '#CDE7A6', scenery: 'hills' },
  actors: [
    { id: 'pig', emoji: 'hero:pig/idle', x: PX, y: PY, size: PS },
    { id: 'raccoon', emoji: 'hero:raccoon/walk', x: RX, y: RY, size: RS, flip: true },
    // 愛心畫在兩個人前面
    { id: 'h3', emoji: '❤️', x: RX, y: 60, size: H3S, hidden: true, float: true },
    { id: 'h2', emoji: '❤️', x: RX, y: 60, size: H2S, hidden: true, float: true },
    { id: 'h1', emoji: '❤️', x: RX, y: 60, size: H1S, hidden: true, float: true },
  ],
  moves: [
    // 登場：走進來，抬頭看字框
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -25, y: RY }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },

    // 第 1 次：小愛心「啪」貼在豬探長臉上——他嚇一跳、臉紅得摀嘴扭來扭去
    ...g1.moves,
    { at: H1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: H1, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.45 },
    { at: H1 + 0.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: H1 + 0.55, actor: 'h1', do: 'vanish', dur: 0.15 },
    { at: H1 + 0.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/giggle' },
    { at: H1 + 0.6, actor: 'pig', do: 'tilt', amount: 8, dur: 0.5 },

    // 第 2 次：大愛心「碰」地把他撞得往後滑、跌坐、頭暈
    { at: H2 - 1.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    ...g2.moves,
    { at: H2, actor: 'pig', do: 'swap', emoji: 'hero:pig/fall' },
    { at: H2, actor: 'pig', do: 'moveTo', to: { x: PX + 14, y: PY }, dur: 0.3, ease: 'out' },
    { at: H2 + 0.05, actor: 'h2', do: 'moveTo', to: at(PX - 6, 52, H2S), arc: 5, dur: 0.3, ease: 'out' },
    { at: H2 + 0.35, actor: 'h2', do: 'vanish', dur: 0.15 },
    { at: H2 + 0.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 爬起來走回原位
    { at: 4.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/walk' },
    { at: 4.45, actor: 'pig', do: 'moveTo', to: { x: PX, y: PY }, dur: 0.3 },

    // 第 3 次前停一拍：豬探長伸手「等一下！」、冒汗——花生的心跳了三下
    { at: 4.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/wait' },
    { at: 4.85, actor: 'pig', do: 'shake', amount: 0.5, dur: 0.4 },
    ...g3.moves,
    // 超大愛心「轟」地壓在他身上，只剩腳在外面亂踢
    { at: H3, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: H3, actor: 'pig', do: 'moveTo', to: { x: PX3, y: PY }, dur: 0.12, ease: 'out' },
    { at: H3 + 0.1, actor: 'pig', do: 'shake', amount: 0.9, dur: 0.9 },
    { at: H3 + 0.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 國字回中央那一秒：花生讓到左邊
    { at: 7.05, actor: 'raccoon', do: 'moveTo', to: { x: 26, y: RY }, dur: 0.25 },

    // 語詞那一刻：超大愛心「啵」地從他身上彈起來、落在畫面中間，花生跑過去抱住
    { at: 8.0, actor: 'h3', do: 'moveTo', to: at(WX, 77, H3S), arc: 14, dur: 0.38, ease: 'out' },
    { at: 8.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dash' },
    { at: 8.0, actor: 'raccoon', do: 'moveTo', to: { x: WRX, y: RY }, dur: 0.35, ease: 'out' },
    { at: 8.38, actor: 'h3', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 8.38, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    { at: 8.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: WORD + 0.05, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.3 },
    // 抱太緊，愛心「啵」地破成一圈小愛心
    { at: 8.75, actor: 'h3', do: 'squash', amount: 0.3, dur: 0.15 },
    { at: 8.85, actor: 'h3', do: 'vanish', dur: 0.12 },
    // 走回原位，轉頭看豬探長
    { at: 9.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/walk' },
    { at: 9.0, actor: 'raccoon', do: 'moveTo', to: { x: RX - 2, y: RY }, dur: 0.3 },
    { at: 9.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 回馬槍（第 4 次）：豬探長也張開雙手，噗通噗通——回送一顆更大的
    { at: 8.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    ...g4.moves,
    { at: 9.65, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/hug' },
    // 轟！花生被壓得扁扁的——還笑咪咪
    { at: H4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: H4, actor: 'raccoon', do: 'stretchTo', amount: 1.7, dur: 0.12, ease: 'out' },
    { at: H4 + 0.12, actor: 'h1', do: 'moveTo', to: at(RX - 2, 77 - RS / 1.7 + 4, H1S), dur: 0.12 },
    { at: 10.52, actor: 'h1', do: 'vanish', dur: 0.12 },
    { at: 10.58, actor: 'raccoon', do: 'stretchTo', amount: 1 / 1.7, dur: 0.2, ease: 'back' },
    { at: H4 + 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 10.45, actor: 'pig', do: 'flip' },
    { at: 10.45, actor: 'pig', do: 'moveTo', to: { x: 200, y: PY }, dur: 0.3, ease: 'in' },

    // 問他：走到前面、變大
    { at: 10.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 10.85, actor: 'raccoon', do: 'scaleTo', amount: 1.3, dur: 0.2 },
    { at: 10.85, actor: 'raccoon', do: 'moveTo', to: { x: 34, y: RY + 4 }, dur: 0.3, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: 11.95, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/listen' },
    { at: 11.95, actor: 'raccoon', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.95, actor: 'raccoon', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.45, actor: 'raccoon', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.45, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/point' },
    { at: 13.45, actor: 'raccoon', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: 13.7, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 13.72, actor: 'raccoon', do: 'moveTo', to: { x: -45, y: RY + 4 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 1 次：爫、冖從貼上臉的小愛心上飛出來
    { at: H1 + 0.1, dur: 0.45, strokes: [0, 1, 2, 3], from: 'h1', color: partColor('爫') },
    { at: H1 + 0.2, dur: 0.4, strokes: [4, 5], from: 'h1', color: partColor('冖') },
    // 第 2 次：心從撞上去的大愛心上飛出來
    { at: H2 + 0.08, dur: 0.5, strokes: [6, 7, 8, 9], from: 'h2', color: partColor('心') },
    // 第 3 次：夂從被壓住、在外面亂踢的腳上彈出來
    { at: H3 + 0.15, dur: 0.5, strokes: [10, 11, 12], from: 'pig', color: partColor('夂') },
  ],
  glyph: [
    { at: 7.2, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.95, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的花生
    { at: 10.8, dur: 3.1, do: 'ask', keep: ['raccoon'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: 10.85, dur: 0.4, do: 'home' },
    { at: 13.45, dur: 0.35, do: 'pulse' },
    { at: 14.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    // 小愛心「啵」地掉下來，變成一圈小愛心
    { at: H1 + 0.55, kind: 'burst', x: P_FACE.x, y: P_FACE.y - 7, n: 5, emoji: '💕', dur: 0.5 },
    ...g2.fx,
    { at: H2 + 0.35, kind: 'burst', x: PX - 6, y: 44, n: 6, emoji: '💕', dur: 0.5 },
    { at: H2 + 0.3, kind: 'dizzy', actor: 'pig', dur: 0.5 },
    // 第 3 次前停一拍：冒汗
    { at: 4.95, kind: 'sweat', actor: 'pig', scale: 1.3 },
    ...g3.fx,
    { at: H3, kind: 'puff', x: PX3 + 2, y: 74, dur: 0.5 },
    // 愛心：抱住那一下
    { at: WORD, kind: 'burst', x: WX, y: 59, n: 8, emoji: '💕', dur: 0.7, scale: 1.4 },
    { at: 8.85, kind: 'burst', x: WX, y: 59, n: 9, emoji: '💕', dur: 0.5, scale: 1.3 },
    ...g4.fx,
    { at: 10.52, kind: 'burst', x: RX - 2, y: 52, n: 10, emoji: '💕', dur: 0.3, scale: 1.4 },
    { at: 13.45, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 幾乎全景、稍微偏中間：自動取景會推近其中一個人，把另一個切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: H3 + 0.05, dur: 0.4, do: 'shake', amount: 1.6 },
    ...g4.camera,
    { at: H4 + 0.05, dur: 0.4, do: 'shake', amount: 1.8 },
  ],
  lights: [
    { at: 7.2, dur: 0.05, level: -0.2 },
    { at: 7.25, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '愛' },
    ...g1.cues,
    { at: H1 + 0.55, sfx: 'poof' },
    ...g2.cues,
    { at: 4.85, sfx: 'blip' },
    ...g3.cues,
    { at: 7.3, say: '愛' },
    { at: 8.0, sfx: 'boing' },
    { at: WORD, say: '愛心' },
    { at: 8.85, sfx: 'poof' },
    ...g4.cues,
    { at: 10.52, sfx: 'poof' },
    { at: 10.9, say: FIXED_LINES.clipAsk },
    { at: 13.45, say: '愛' },
    { at: 13.5, sfx: 'cheer' },
  ],
}

export default clip
