import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 叔（v2）：叔叔最愛變把戲。叔叔把雙手藏到背後、身體往前傾、壞壞地偷笑，楊捷睿好奇地湊過去看——
// 「噹啷！」叔叔雙手往前一攤，一大團彩色紙花「砰」地炸出來，把他嚇得往後彈，一次比一次大：
// 嚇一跳原地跳起來（尗的上半從紙花裡飛出來）→ 被炸得翻一圈滾到畫面邊（尗的下半）→
// 先停一拍：叔叔又把手藏到背後，他蹲下來抱著頭發抖、再偷偷抬頭看——「噹啷！」最大的一團把他炸上天、一屁股跌坐在畫面邊（又＝手，從叔叔攤開的手上飛出來）。
// 「手藏背後→湊過去→噹啷！一攤，紙花炸出來」四次都一樣。
// 語詞那一刻：叔叔站在畫面正中間比 YA，他跑回來喊「叔叔！」。
// 回馬槍（第四次）：這次換他把手藏到背後、摀嘴偷笑走過去，叔叔好奇地彎下腰湊過來看——「噹啷！」他雙手一攤，
// 最大最大的一團紙花炸到叔叔臉上，換叔叔嚇得往後跌坐、眼鏡都歪了；他笑翻，叔叔爬起來也笑了，走掉。
// 最後畫面暗下來只剩「叔」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「叔！」，然後退場只留字。
// 刻意不跟「公」（講故事睡著）、「婆」（捏臉頰）、「孫」（飛撲）、「爸」（拋接）、「書」（書裡的東西跳出來）、「臉」（轉身變鬼臉）、
// 「怕」「弟」（被小東西嚇到跳高）撞：這支只演「叔叔手藏背後、噹啷一攤開變出一團紙花」。
// 叔、叔、叔叔、這是什麼字？、叔

/** 楊捷睿：每次都站在同一個地方、面向右邊的叔叔（flip） */
const S = 38
const P = 77 - 0.42 * S
const YX = 46
/** 湊過去看的地方 */
const NEAR = 54
/** 叔叔（道具圖 prop:uncle*，朝左）：畫面上最大 */
const US = 56
const UY = 77 - 0.42 * US
const UX = 103
/** 「登登！」攤開的雙手（uncle-tada 的指尖約在 u 0.2、v 0.48） */
const HANDS = { dx: -0.3 * US, dy: -0.02 * US }
const POP: Vec = { x: UX + HANDS.dx, y: UY + HANDS.dy }
/** 字框：上方偏左（hills 的天空，背後素色；叔叔的頭在右邊、楊捷睿往左邊飛） */
const FRAME = { x: 62, y: 19 }
const FRAME_K = 0.47
const NOOF: Partial<Move> = { arc: 0.01 }

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [] }

/**
 * 「手藏背後→噹啷！一攤開」：叔叔在 hide 秒把雙手藏到背後偷笑，T 那一刻換 uncle-tada、雙手往前一攤，紙花從手上炸出來。
 * k 是第幾次（0、1、2）：紙花一次比一次大、音效一次多疊一個、鏡頭一次比一次震。他被嚇的反應由呼叫的人寫。
 */
function tada(hide: number, T: number, k: number) {
  g.moves.push(
    // 手藏到背後、身體前傾、壞壞地偷笑（肩膀抖）
    { at: hide, actor: 'uncle', do: 'swap', emoji: 'prop:uncle-hide' },
    { at: hide + 0.2, dur: 0.35, actor: 'uncle', do: 'shake', amount: 0.35 },
    // 噹啷！
    { at: T, actor: 'uncle', do: 'swap', emoji: 'prop:uncle-tada' },
    { at: T, dur: 0.3, actor: 'uncle', do: 'hop', amount: 2 + 1.5 * k },
    // 收手站好比 YA
    { at: T + 0.62, actor: 'uncle', do: 'swap', emoji: 'prop:uncle' },
  )
  g.fx.push(
    // 一大團彩色紙花從攤開的手上炸出來（一次比一次大）
    { at: T, dur: 0.6 + 0.1 * k, kind: 'burst', x: POP.x, y: POP.y, emoji: '🎉', n: 1, scale: 1.8 + 0.6 * k },
    { at: T + 0.02, dur: 0.7 + 0.1 * k, kind: 'burst', x: POP.x - 2, y: POP.y - 2, emoji: '🎊', n: 6 + 3 * k, scale: 1.0 + 0.45 * k },
  )
  g.cues.push({ at: T, sfx: 'clink' }, { at: T + 0.02, sfx: 'poof' })
  if (k >= 1) g.cues.push({ at: T + 0.08, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: T + 0.14, sfx: 'cheer' })
  g.camera.push(
    { at: T, dur: 0.4, do: 'punch', amount: 0.06 + 0.04 * k, to: { x: POP.x - 6 - 10 * k, y: 52 } },
    { at: T, dur: 0.3, do: 'shake', amount: 0.6 + 0.5 * k },
  )
}

/** 他好奇地湊過去看（伸手） */
function lean(at: number) {
  g.moves.push(
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: NEAR, y: P }, ...NOOF },
  )
}

// 第 1 次：嚇一跳、原地跳起來退回去
const HIDE1 = 0.85
const T1 = 1.45
tada(HIDE1, T1, 0)
lean(T1 - 0.4)
// 第 2 次：被炸得翻一圈滾到畫面邊
const HIDE2 = 2.45
const T2 = 3.05
tada(HIDE2, T2, 1)
lean(T2 - 0.4)
const FLY2 = 0.45
const BACK2 = T2 + FLY2 + 0.6
// 第 3 次前停一拍：叔叔又把手藏起來，他蹲下抱頭發抖，再偷偷抬頭看
const HIDE3 = BACK2 + 0.35
const DUCK = HIDE3 + 0.15
const PEEK = DUCK + 0.75
const T3 = PEEK + 0.45
tada(HIDE3, T3, 2)
const FLY3 = 0.55
/** 國字放大到中間：兩個人讓到兩邊 */
const ASIDE_U = 135
const HOME = T3 + FLY3 + 0.35
const PARK = HOME + 0.85
// 語詞那一刻：叔叔走到正中間，他跑回來喊「叔叔！」
const UC = 100
const WORD = PARK + 0.42
// 回馬槍：換他把手藏背後偷笑走過去，叔叔彎腰湊過來——噹啷！
const SNEAK = WORD + 0.6
const NEAR4 = 60
const CURIOUS = SNEAK + 0.25
const T4 = SNEAK + 0.85
/** 他攤開的雙手（hug，翻向右邊） */
const POP4: Vec = { x: NEAR4 + 0.24 * S + 9, y: P - 0.1 * S }
const UP4 = T4 + 0.9
const OUT = UP4 + 0.35
const ASK = 11.1
const Q = 11.12
const ANSWER = 13.6
/** 問他的時候他放大一點 */
const ASK_S = 1.12

const clip: Clip = {
  format: 2,
  char: '叔',
  meta: { theme: '叔叔變把戲', cast: '楊捷睿＋叔叔', gags: ['叔叔最愛變把戲：雙手藏到背後偷笑，楊捷睿一湊過去看，「噹啷！」雙手一攤，一大團彩色紙花炸出來把他嚇飛，一次比一次大（原地嚇跳→翻一圈滾到畫面邊→停一拍，他抱頭蹲著再偷看，被最大的一團炸上天跌坐）；回馬槍是第四次換他把手藏背後走過去，叔叔彎腰湊過來看，「噹啷！」紙花炸到叔叔臉上，換叔叔嚇得往後跌坐、眼鏡歪掉'] },
  duration: 15,
  // 叔叔來家門口玩：淡藍的天、嫩綠的草地，橘色帽 T 的叔叔、紅外套的他、彩色紙花都跳得出來
  bg: { top: '#E4F2FF', bottom: '#F6FBFF', floor: '#B8DC92', scenery: 'hills' },
  actors: [
    { id: 'yang', emoji: 'hero:yang/walk', x: YX, y: P, size: S, hidden: true, flip: true },
    { id: 'uncle', emoji: 'prop:uncle', x: UX, y: UY, size: US },
  ],
  moves: [
    // 開場：他從左邊走進來，看到叔叔，開心揮手
    { at: 0, actor: 'yang', do: 'enter', from: { x: -22, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    ...g.moves.filter((m) => m.at < T1 + 0.1),
    // 第 1 次：嚇一跳、原地跳起來退回去，傻眼停住
    { at: T1, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: T1, dur: 0.35, actor: 'yang', do: 'hop', amount: 6 },
    { at: T1, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, ease: 'out', ...NOOF },
    { at: T1 + 0.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    ...g.moves.filter((m) => m.at >= T1 + 0.1 && m.at < T2 + 0.1),
    // 第 2 次：被炸得翻一圈、滾到畫面左邊，頭暈
    { at: T2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: T2, dur: FLY2, actor: 'yang', do: 'moveTo', to: { x: 20, y: P }, arc: 6, ease: 'out' },
    { at: T2, dur: FLY2, actor: 'yang', do: 'spin', amount: -360, pivot: 'center' },
    { at: T2 + FLY2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 走回來
    { at: BACK2, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: BACK2, dur: 0.32, actor: 'yang', do: 'moveTo', to: { x: YX, y: P } },
    ...g.moves.filter((m) => m.at >= T2 + 0.1 && m.at < T3 + 0.1),
    // 停一拍：叔叔又把手藏起來——他蹲下抱頭發抖
    { at: DUCK, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: DUCK + 0.05, dur: PEEK - DUCK - 0.05, actor: 'yang', do: 'shake', amount: 0.6 },
    // 偷偷抬頭看、往前挪一點；叔叔彎腰湊過來
    { at: PEEK, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    { at: PEEK, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: NEAR - 3, y: P }, ...NOOF },
    { at: PEEK + 0.1, dur: 0.4, actor: 'uncle', do: 'tilt', amount: -6 },
    // 第 3 次：被最大的一團炸上天，轉兩圈，一屁股跌坐在畫面邊
    { at: T3, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: T3, dur: FLY3, actor: 'yang', do: 'moveTo', to: { x: 21, y: P }, arc: 12, ease: 'out' },
    { at: T3, dur: FLY3, actor: 'yang', do: 'spin', amount: -720, pivot: 'center' },
    { at: T3 + FLY3, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    { at: T3 + FLY3, dur: 0.3, actor: 'yang', do: 'shake', amount: 0.8 },
    // 叔叔收手，走到右邊讓國字放大
    ...g.moves.filter((m) => m.at >= T3 + 0.1),
    { at: T3 + 0.66, dur: 0.38, actor: 'uncle', do: 'moveTo', to: { x: ASIDE_U, y: UY } },
    // 讓位：叔叔走到正中間，他爬起來跑回來
    { at: PARK, dur: 0.42, actor: 'uncle', do: 'moveTo', to: { x: UC, y: UY } },
    { at: PARK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.05, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: 50, y: P } },
    // 語詞：「叔叔！」叔叔比 YA
    { at: WORD, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: WORD, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    { at: WORD + 0.05, dur: 0.3, actor: 'uncle', do: 'hop', amount: 2.5 },
    // 回馬槍：換他摀嘴偷笑（手藏起來），踮腳走過去
    { at: SNEAK, actor: 'yang', do: 'swap', emoji: 'hero:yang/giggle' },
    { at: SNEAK + 0.12, dur: 0.12, actor: 'yang', do: 'shake', amount: 0.3 },
    { at: SNEAK + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: SNEAK + 0.3, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: NEAR4, y: P }, ...NOOF },
    // 叔叔好奇地彎腰湊過來看
    { at: CURIOUS, dur: T4 - CURIOUS, actor: 'uncle', do: 'tilt', amount: -8 },
    // 噹啷！他雙手一攤
    { at: T4, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: T4, dur: 0.3, actor: 'yang', do: 'hop', amount: 4 },
    // 換叔叔嚇得往後跌坐、眼鏡歪掉
    { at: T4 + 0.04, actor: 'uncle', do: 'swap', emoji: 'prop:uncle-fall' },
    { at: T4 + 0.04, dur: 0.3, actor: 'uncle', do: 'moveTo', to: { x: UC + 12, y: UY }, ease: 'out', ...NOOF },
    { at: T4 + 0.34, dur: 0.4, actor: 'uncle', do: 'shake', amount: 0.9 },
    // 他笑翻；叔叔爬起來也笑了
    { at: T4 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
    { at: UP4, actor: 'uncle', do: 'swap', emoji: 'prop:uncle' },
    { at: UP4, dur: 0.3, actor: 'uncle', do: 'hop', amount: 3 },
    { at: UP4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    // 叔叔揮揮手走掉
    { at: OUT, dur: 0.01, actor: 'uncle', do: 'flip' },
    { at: OUT + 0.02, dur: ASK - OUT - 0.08, actor: 'uncle', do: 'moveTo', to: { x: 195, y: UY }, ease: 'in' },
    // 問他：他跳到左前方、放大
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.15, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 2 }, arc: 6, ease: 'out' },
    { at: ASK + 0.15, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.65, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.2, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 2 }, ease: 'in' },
  ],
  builds: [
    // 尗的上半、尗的下半從炸出來的紙花裡飛出來；又（一隻手）從叔叔攤開的手上飛出來
    { at: T1 + 0.08, dur: 0.35, strokes: [0, 1, 2], from: POP, color: partColor('尗') },
    { at: T2 + 0.08, dur: 0.35, strokes: [3, 4, 5], from: POP, color: partColor('尗') },
    { at: T3 + 0.08, dur: 0.4, strokes: [6, 7], from: POP, color: partColor('又') },
  ] satisfies Build[],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 他好奇（第一次湊過去之前）
    { at: HIDE1 + 0.1, dur: 0.45, kind: 'pop', actor: 'yang', emoji: '❓', dx: 2, scale: 1.2 },
    { at: T2 + FLY2, dur: 0.6, kind: 'dizzy', actor: 'yang' },
    // 停一拍：他冒汗
    { at: DUCK + 0.05, dur: 0.7, kind: 'sweat', actor: 'yang', dx: 8 },
    { at: T3 + FLY3, dur: 0.6, kind: 'dizzy', actor: 'yang' },
    // 回馬槍：叔叔好奇（❓），紙花炸到叔叔臉上
    { at: CURIOUS, dur: 0.5, kind: 'pop', actor: 'uncle', emoji: '❓', dx: -14, scale: 1.3 },
    { at: T4, dur: 0.8, kind: 'burst', x: POP4.x, y: POP4.y, emoji: '🎉', n: 1, scale: 2.6 },
    { at: T4 + 0.02, dur: 0.9, kind: 'burst', x: POP4.x + 4, y: POP4.y - 2, emoji: '🎊', n: 12, scale: 1.75 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看切到人），只有噹啷那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: T4, dur: 0.45, do: 'punch', amount: 0.16, to: { x: POP4.x + 10, y: 50 } },
    { at: T4, dur: 0.4, do: 'shake', amount: 1.9 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '叔' },
    ...g.cues,
    { at: DUCK, sfx: 'blip' },
    { at: HOME + 0.1, say: '叔' },
    { at: WORD, say: '叔叔' },
    { at: T4, sfx: 'clink' },
    { at: T4 + 0.02, sfx: 'poof' },
    { at: T4 + 0.08, sfx: 'boing' },
    { at: T4 + 0.14, sfx: 'bonk' },
    { at: T4 + 0.4, sfx: 'cheer' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '叔' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
