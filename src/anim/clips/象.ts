import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 象（v2）：大太陽底下好熱，楊捷睿熱得吐舌頭搧風，請大象幫他沖個涼——「來一點點就好」。
// 大象把長鼻子伸進水桶「咕嚕咕嚕」吸水（身體一鼓一鼓），鼻子一舉「噗——！」，一道粗粗的水柱射到他身上。
// 同一個動作四次，只有被沖的結果越來越大：頭髮濕了、愣在原地（長鼻子飛出⺈）→ 被沖得往後滑一大段（大耳朵飛出中間那一塊）→
// 先停一拍：他舉手「夠了夠了」、撐起一片大荷葉當傘，大象這次吸特別久、整隻鼓得圓圓的⋯⋯噗！荷葉被沖飛，他整個人被沖出畫面（四條腿飛出豕），
// 再濕答答地走回來。大象每次都坐下來哈哈大笑。
// 語詞那一刻大象走到中間、甩一下長鼻子，他站在旁邊指著牠：「大象」。
// 回馬槍（第四次）：他學聰明了——大象吸飽水、鼻子正要舉起來那一刻，他衝過去一把捏住鼻子。大象整隻鼓成一顆球⋯⋯
// 「噗——！」水從兩隻大耳朵噴出來，嘩啦啦淋回自己身上，變成落湯象，換他哈哈大笑。
// 最後畫面暗下來只剩「象」，他問「這是什麼字？」，手放耳邊等他回答，再指著字說「象！」，然後退場只留字。
// 刻意不跟「鼻」（小恐龍鼻子聞到好吃的）、「喝」（吸管一口氣喝光、肚子鼓起來）、「粉」（哈啾噴粉）撞：這支只演「吸水→噴水→被沖到」。
// 象、象、大象、這是什麼字？、象

/** 楊捷睿：站在左邊、朝右（圖朝左，要 flip） */
const SY = 36
const PY = 77 - 0.42 * SY
const X = 40
/** 大象：這個字講的就是牠，畫面上最大。站在右邊、朝左（不用 flip） */
const SE = 62
const EY = 77 - 0.42 * SE
const EX = 112
/** 四張大象同一個比例，但各自置中：噴水那張的身體往左偏，swap 時 x 往右補 0.086 × size 腳才對齊；吸水那張補 0.02 */
const SPRAY_DX = 0.086 * SE
const SUCK_DX = 0.02 * SE
/** 字框一開始就在左上（太陽在右上、大象在右邊，水柱在中間偏下）：背後是素色的天空 */
const FRAME = { x: 21, y: 19 }
const FRAME_K = 0.42

/** 大象圖（0～1、朝左）上的一點：圖畫在 x、y（中心）、放大 s 倍時的位置 */
const ept = (x: number, u: number, v: number, s = 1, y = EY): Vec => ({ x: x + (u - 0.5) * SE * s, y: y + (v - 0.5) * SE * s })

/** 水柱：深藍外圈＋淺藍水芯兩條粗線，從噴水那張圖上水花最遠的那一端（u 0.16、v 0.27）射出去 */
const JET_FROM = { dx: (0.16 - 0.5) * SE, dy: (0.27 - 0.5) * SE }
const WATER = '#1E7FD8'
const WATER_CORE = '#BDEBFF'
function jet(at: number, dur: number, target: string, scale = 1, from: { dx: number; dy: number } = JET_FROM, to?: Vec): Fx[] {
  const end = to ? { to } : { target }
  return [
    { at, dur, kind: 'line', actor: 'ele', ...from, ...end, color: WATER, width: 4.6 * scale },
    { at, dur, kind: 'line', actor: 'ele', ...from, ...end, color: WATER_CORE, width: 1.8 * scale },
  ]
}

/** 每一次吸多久（第三次吸特別久、鼓得圓圓的；第四次吸飽了才被捏住） */
const SUCK = [0.55, 0.6, 0.85, 0.6]
/** 被噴到以後傻眼停多久 */
const HOLD = 0.45

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 同一個笑點：大象把鼻子伸進水桶「咕嚕咕嚕」吸水（elephant-suck，身體一鼓一鼓、同一個咕嚕聲）→
 * 「噗——！」換成鼻子舉高的那張（elephant-spray）：鏡頭推一下＋震、淡淡的白光、同一個「噗」（一次多疊一個音），
 * 一道粗粗的藍色水柱射到他身上、水花四濺。at 是噗的那一刻，k 是第幾次（0～2；第四次另外寫，因為鼻子被捏住了）。
 * x 是大象站的地方。被噴到以後的反應（傻眼、滑走、飛走）由呼叫的人寫。
 */
function spray(at: number, k: number, x = EX): Gag {
  const suck = SUCK[k]
  const s0 = at - suck
  const moves: Move[] = [
    { at: s0, actor: 'ele', do: 'swap', emoji: 'prop:elephant-suck' },
    { at: s0, dur: 0.01, actor: 'ele', do: 'moveTo', to: { x: x + SUCK_DX, y: EY } },
  ]
  const cues: Cue[] = []
  // 咕嚕、咕嚕：身體一鼓一鼓（往上拉長一點再彈回來）
  for (let t = s0 + 0.08; t < at - 0.12; t += 0.24) {
    moves.push({ at: t, dur: 0.2, actor: 'ele', do: 'squash', amount: -0.07 - 0.02 * k })
    cues.push({ at: t, sfx: 'gulp' })
  }
  // 第三次：吸特別久，整隻鼓得圓圓的，噗的那一刻消下去
  if (k === 2) {
    moves.push(
      { at: s0 + 0.1, dur: suck - 0.15, actor: 'ele', do: 'stretchTo', amount: 1.22, ease: 'in' },
      { at: at, dur: 0.18, actor: 'ele', do: 'stretchTo', amount: 1 / 1.22, ease: 'out' },
    )
  }
  moves.push(
    { at, actor: 'ele', do: 'swap', emoji: 'prop:elephant-spray' },
    { at, dur: 0.01, actor: 'ele', do: 'moveTo', to: { x: x + SPRAY_DX, y: EY } },
  )
  const fx: Fx[] = []
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.06 + 0.02 * k, to: { x: (X + x) / 2, y: 52 } },
    { at, dur: 0.3, do: 'shake', amount: 0.7 + 0.35 * k },
  ]
  // 淡淡的白光：不要把他刷白
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.07 },
    { at: at + 0.04, dur: 0.2, level: 0 },
  ]
  cues.push({ at, sfx: 'splash' })
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, lights }
}

/** 大象坐下來哈哈大笑，再站起來 */
const laugh = (at: number, until: number, x = EX): Move[] => [
  { at, actor: 'ele', do: 'swap', emoji: 'prop:elephant-laugh' },
  { at, dur: 0.01, actor: 'ele', do: 'moveTo', to: { x, y: EY } },
  { at: at + 0.05, dur: 0.22, actor: 'ele', do: 'hop', amount: 1.5 },
  { at: at + 0.3, dur: 0.22, actor: 'ele', do: 'hop', amount: 1.5 },
  { at: until, actor: 'ele', do: 'swap', emoji: 'prop:elephant' },
]

// ---- 時間表 ----
/** 第一次：頭髮濕了、愣在原地 */
const H1 = 1.95
const g1 = spray(H1, 0)
/** 第二次：被沖得往後滑一大段 */
const H2 = 3.75
const g2 = spray(H2, 1)
const SLIDE = 18
/** 停一拍：「夠了夠了」、撐起荷葉；大象吸特別久 */
const BEAT = H2 + 1.25
const LEAF = BEAT + 0.38
const H3 = LEAF + 0.3 + SUCK[2]
const g3 = spray(H3, 2)
/** 水柱先打在荷葉上，荷葉被沖飛；他頂著水柱抖、傻眼，再被沖出畫面 */
const LEAF_OFF = H3 + 0.22
const BLAST = LEAF_OFF + 0.42
/** 拼好後國字放大到中間；他濕答答走回來 */
const HOME = BLAST + 0.3
const BACK = HOME + 0.1
const PARK = HOME + 0.8
/** 語詞那一刻：大象走到中間，甩一下長鼻子 */
const WORD = PARK + 0.35
const WX = 92
const WS = 1.08
/** 回馬槍：大象吸飽水、鼻子正要舉起來，他衝過去一把捏住 */
const S4 = WORD + 0.45
const GRAB = S4 + SUCK[3]
const H4 = GRAB + 0.42
const ASK = 11.0
const ANSWER = 13.55
const AX = 36
const ASK_S = 1.3

/** 荷葉：他舉高的雙手握著葉柄下半截（lift 圖的手在 v 0.12），往右（大象那邊）斜 */
const LS = 30
const LY = PY + (0.12 - 0.5) * SY + 6 - 0.46 * LS
/** 第四次：大象站在中間時，垂下來的鼻尖（elephant 圖 u 0.2、v 0.86） */
const tip = ept(WX, 0.2, 0.86, WS, 77 - 0.42 * SE * WS)
const EY4 = 77 - 0.42 * SE * WS
/** 兩隻大耳朵（elephant 圖 u 0.22／0.78、v 0.33），鼓起來以後再大一點 */
const EAR_L = { dx: (0.2 - 0.5) * SE * WS * 1.15, dy: (0.33 - 0.5) * SE * WS * 1.1 }
const EAR_R = { dx: (0.8 - 0.5) * SE * WS * 1.15, dy: (0.33 - 0.5) * SE * WS * 1.1 }

const all = [g1, g2, g3]

const clip: Clip = {
  format: 2,
  char: '象',
  meta: { theme: '大象用長鼻子幫楊捷睿沖涼', cast: '楊捷睿＋大象＋荷葉', gags: ['天氣好熱，楊捷睿請大象幫他沖涼，大象把長鼻子伸進水桶咕嚕咕嚕吸水，鼻子一舉「噗」地噴出一道粗水柱把他沖到，一次比一次慘（頭髮濕了愣住→被沖得往後滑一大段→停一拍撐起荷葉當傘，大象吸特別久、鼓得圓圓的，荷葉被沖飛、他整個人被沖出畫面），大象每次都坐著大笑；回馬槍是他學聰明了，在大象吸飽要噴的那一刻捏住鼻子，大象鼓成一顆球，水從兩隻耳朵噴出來淋回自己身上，變成落湯象，換他哈哈大笑'] },
  duration: 15,
  // 大太陽、淡黃的天空、綠草地：一看就很熱；藍色水柱在淺色天空上看得清楚
  bg: { top: '#FFE7A8', bottom: '#FFF8E0', floor: '#A8D884', scenery: 'hills' },
  actors: [
    { id: 'ele', emoji: 'prop:elephant', x: EX, y: EY, size: SE },
    { id: 'leaf', emoji: 'prop:lotus-leaf', x: X, y: LY, size: LS, hidden: true },
    { id: 'yang', emoji: 'hero:yang/walk', x: X, y: PY, size: SY, hidden: true, flip: true },
  ],
  moves: [
    // 開場：他走進來，轉身指著字框——象！再轉回來，熱得吐舌頭搧風
    { at: 0, dur: 0.45, actor: 'yang', do: 'enter', from: { x: -22, y: PY }, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'flip' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 0.95, actor: 'yang', do: 'flip' },
    { at: 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/hot' },
    // 第一次：伸手「來一點點」→ 咕嚕咕嚕 → 噗！頭髮濕了，愣住
    { at: H1 - SUCK[0] - 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    ...g1.moves,
    { at: H1, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H1, dur: 0.25, actor: 'yang', do: 'squash', amount: 0.15 },
    ...laugh(H1 + 0.4, H1 + 1.0),
    { at: H1 + 0.95, dur: 0.3, actor: 'yang', do: 'shake', amount: 0.8 },
    { at: H1 + 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/hot' },
    // 第二次：同樣伸手 → 咕嚕咕嚕 → 噗！被沖得往後滑一大段，傻眼
    { at: H2 - SUCK[1] - 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    ...g2.moves,
    { at: H2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: H2, dur: 0.5, actor: 'yang', do: 'moveTo', to: { x: SLIDE, y: PY }, ease: 'out' },
    { at: H2, dur: 0.5, actor: 'yang', do: 'rotateTo', amount: -10, ease: 'out' },
    { at: H2 + 0.5 + HOLD - 0.1, dur: 0.15, actor: 'yang', do: 'rotateTo', amount: 10 },
    ...laugh(H2 + 0.55, H2 + 1.15),
    { at: H2 + 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: H2 + 1.0, dur: 0.32, actor: 'yang', do: 'moveTo', to: { x: X, y: PY } },
    // 停一拍：舉手「夠了夠了」、搖頭；撐起一片大荷葉擋在前面；大象這次吸特別久、鼓得圓圓的
    { at: BEAT, actor: 'yang', do: 'swap', emoji: 'hero:yang/wait' },
    { at: BEAT + 0.05, dur: 0.3, actor: 'yang', do: 'shake', amount: 0.8 },
    { at: LEAF, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: LEAF, dur: 0.01, actor: 'leaf', do: 'rotateTo', amount: 28 },
    { at: LEAF + 0.01, dur: 0.2, actor: 'leaf', do: 'pop' },
    ...g3.moves,
    // 噗！水柱打在荷葉上，荷葉被沖飛
    { at: H3, dur: 0.25, actor: 'leaf', do: 'shake', amount: 1 },
    { at: LEAF_OFF, dur: 0.35, actor: 'leaf', do: 'moveTo', to: { x: -35, y: PY }, ease: 'out' },
    { at: LEAF_OFF, dur: 0.35, actor: 'leaf', do: 'rotateTo', amount: -118, ease: 'out' },
    // 他頂著水柱抖、傻眼……整個人被沖出畫面
    { at: LEAF_OFF, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: LEAF_OFF, dur: BLAST - LEAF_OFF, actor: 'yang', do: 'shake', amount: 0.9 },
    { at: LEAF_OFF, dur: 0.2, actor: 'yang', do: 'rotateTo', amount: -8 },
    { at: BLAST, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: -30, y: PY }, ease: 'in' },
    { at: BLAST, dur: 0.25, actor: 'yang', do: 'spin', times: -1, pivot: 'center' },
    { at: BLAST + 0.25, dur: 0.01, actor: 'yang', do: 'rotateTo', amount: 8 },
    // 大象笑完退到右邊，讓出中間給國字
    ...laugh(BLAST + 0.27, PARK - 0.05, EX),
    { at: BLAST + 0.27, dur: 0.3, actor: 'ele', do: 'moveTo', to: { x: 138, y: EY } },
    // 他濕答答地走回來（累得喘氣）
    { at: BACK, actor: 'yang', do: 'swap', emoji: 'hero:yang/tired' },
    { at: BACK, dur: 0.55, actor: 'yang', do: 'moveTo', to: { x: 24, y: PY }, ease: 'out' },
    // 語詞那一刻：國字讓位，大象走到中間、變大，甩一下長鼻子；他站在旁邊指著牠：大象！
    { at: PARK, dur: 0.35, actor: 'ele', do: 'moveTo', to: { x: WX, y: EY4 } },
    { at: PARK, dur: 0.35, actor: 'ele', do: 'scaleTo', amount: WS },
    { at: PARK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    { at: WORD, dur: 0.25, actor: 'ele', do: 'tilt', amount: -8 },
    { at: WORD + 0.25, dur: 0.25, actor: 'ele', do: 'tilt', amount: 6 },
    // 回馬槍（第四次）：大象又去吸水——他閉眼得意，等著
    { at: S4 - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: S4, actor: 'ele', do: 'swap', emoji: 'prop:elephant-suck' },
    { at: S4, dur: 0.01, actor: 'ele', do: 'moveTo', to: { x: WX + SUCK_DX * WS, y: EY4 } },
    ...[0, 1, 2].map((i): Move => ({ at: S4 + 0.08 + 0.22 * i, dur: 0.2, actor: 'ele', do: 'squash', amount: -0.1 })),
    // 吸飽了、鼻子正要舉起來——他衝過去一把捏住鼻子！
    { at: GRAB - 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: GRAB - 0.2, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: tip.x - 9, y: PY }, ease: 'in' },
    { at: GRAB, actor: 'ele', do: 'swap', emoji: 'prop:elephant' },
    { at: GRAB, dur: 0.01, actor: 'ele', do: 'moveTo', to: { x: WX, y: EY4 } },
    { at: GRAB, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    // 大象整隻鼓成一顆球，抖啊抖
    { at: GRAB + 0.03, dur: 0.38, actor: 'ele', do: 'stretchTo', amount: 1.15, ease: 'in' },
    { at: GRAB + 0.03, dur: 0.38, actor: 'ele', do: 'scaleTo', amount: 1.1, ease: 'in' },
    { at: GRAB + 0.12, dur: 0.3, actor: 'ele', do: 'shake', amount: 0.9 },
    { at: GRAB + 0.12, dur: 0.3, actor: 'yang', do: 'shake', amount: 0.6 },
    // 噗——！水從兩隻耳朵噴出來，淋回自己身上；消下去，變成落湯象
    { at: H4, dur: 0.2, actor: 'ele', do: 'stretchTo', amount: 1 / 1.15, ease: 'out' },
    { at: H4, dur: 0.2, actor: 'ele', do: 'scaleTo', amount: 1 / 1.1, ease: 'out' },
    { at: H4 + 0.2, dur: 0.4, actor: 'ele', do: 'shake', amount: 0.5 },
    { at: H4 + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: H4 + 0.15, dur: 0.01, actor: 'yang', do: 'moveTo', to: { x: tip.x - 14, y: PY } },
    { at: H4 + 0.2, dur: 0.22, actor: 'yang', do: 'hop', amount: 2 },
    { at: H4 + 0.5, dur: 0.22, actor: 'yang', do: 'hop', amount: 2 },
    // 落湯象垂著頭走出右邊
    { at: ASK - 0.2, actor: 'ele', do: 'flip' },
    { at: ASK - 0.2, dur: 0.4, actor: 'ele', do: 'moveTo', to: { x: 205, y: EY4 }, ease: 'in' },
    // 笑完蹦回左邊；問他：放大，轉向觀眾
    { at: ASK - 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ASK - 0.15, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: AX, y: PY - 1 }, arc: 8, ease: 'out' },
    { at: ASK + 0.3, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    { at: ASK + 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.6, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場（往左跑出去），畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.2, dur: 0.22, actor: 'yang', do: 'moveTo', to: { x: -45, y: PY - 1 }, ease: 'in' },
  ],
  builds: [
    // 每噴一次，大象身上對應的地方就飛出一組筆畫：舉高的長鼻子飛出⺈、大耳朵飛出中間那一塊（頭）、四條腿飛出豕
    { at: H1 + 0.05, dur: 0.45, strokes: [0, 1], from: ept(EX + SPRAY_DX, 0.43, 0.27), color: partColor('⺈') },
    { at: H2 + 0.05, dur: 0.45, strokes: [2, 3, 4], from: ept(EX + SPRAY_DX, 0.75, 0.4), color: partColor('象頭') },
    { at: H3 + 0.05, dur: 0.5, strokes: [5, 6, 7, 8, 9, 10], from: ept(EX + SPRAY_DX, 0.6, 0.85), color: partColor('豕') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 好熱：冒汗
    { at: 1.0, kind: 'sweat', actor: 'yang', dx: -4 },
    // 第一次：水柱打到他，水花四濺，頭髮滴水
    ...jet(H1, 0.38, 'yang'),
    { at: H1 + 0.05, dur: 0.45, kind: 'burst', actor: 'yang', emoji: '💦', n: 6, dy: 16, scale: 1.2 },
    { at: H1 + 0.35, dur: 0.8, kind: 'rain', actor: 'yang', n: 5 },
    // 第二次：水柱一路追著他沖
    ...jet(H2, 0.55, 'yang', 1.15),
    { at: H2 + 0.05, dur: 0.35, kind: 'burst', actor: 'yang', emoji: '💦', n: 7, dy: 16, dx: 4, scale: 1.2 },
    { at: H2 + 0.55, dur: 0.8, kind: 'rain', actor: 'yang', n: 6 },
    // 停一拍：「夠了夠了」
    { at: BEAT + 0.05, kind: 'sweat', actor: 'yang', dx: -4 },
    // 第三次：先打在荷葉上，再打在他身上
    ...jet(H3, 0.3, 'leaf', 1.3),
    { at: H3 + 0.05, dur: 0.3, kind: 'burst', actor: 'leaf', emoji: '💦', n: 6, dy: 16, dx: 8, scale: 1 },
    ...jet(LEAF_OFF, BLAST + 0.25 - LEAF_OFF, 'yang', 1.3),
    { at: LEAF_OFF + 0.05, dur: BLAST - LEAF_OFF, kind: 'burst', actor: 'yang', emoji: '💦', n: 7, dy: 20, dx: 6, scale: 1.1 },
    { at: BACK + 0.45, dur: 0.7, kind: 'rain', actor: 'yang', n: 6 },
    // 語詞那一刻：大象身邊亮晶晶
    { at: WORD, dur: 0.6, kind: 'burst', x: WX, y: 46, n: 8, emoji: '✨', scale: 1.3 },
    // 回馬槍：噗！水從兩隻耳朵噴出來，嘩啦啦淋回自己身上
    ...jet(H4, 0.4, '', 1.15, EAR_L, { x: WX - 40, y: 16 }),
    ...jet(H4, 0.4, '', 1.15, EAR_R, { x: WX + 40, y: 16 }),
    { at: H4 + 0.05, dur: 0.5, kind: 'burst', x: WX, y: 24, emoji: '💦', n: 8, scale: 1.6 },
    { at: H4 + 0.2, dur: 0.45, kind: 'rain', actor: 'ele', n: 8, scale: 1.8 },
    { at: H4 + 0.45, kind: 'sweat', actor: 'ele', dx: -12, dy: 6, scale: 1.4 },
  ],
  camera: [
    // 鏡頭鎖全景（水柱從右邊射到左邊，兩個人都要在畫面裡），只有噗的那一下推近、震
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
    { at: H4, dur: 0.35, do: 'punch', amount: 0.12, to: { x: WX, y: 40 } },
    { at: H4, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: H4, dur: 0.04, level: -0.08 },
    { at: H4 + 0.04, dur: 0.2, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '象' },
    ...all.flatMap((g) => g.cues),
    { at: BLAST, sfx: 'whoosh' },
    { at: HOME + 0.1, say: '象' },
    { at: WORD, say: '大象' },
    ...[0, 1, 2].map((i): Cue => ({ at: S4 + 0.08 + 0.22 * i, sfx: 'gulp' })),
    { at: GRAB, sfx: 'tap' },
    { at: GRAB + 0.1, sfx: 'deflate' },
    { at: H4, sfx: 'splash' },
    { at: H4 + 0.04, sfx: 'whoosh' },
    { at: H4 + 0.08, sfx: 'rumble' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '象' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
