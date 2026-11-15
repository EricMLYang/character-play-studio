import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 來（v2）：楊捷睿對著遠方用力招手——「來！」遠遠的山坡上一個小小的點，「咻——」越跑越大衝過來，是最快的忍者小老鼠。
// 可是他太快煞不住，每次都直直撞上楊捷睿，一次比一次慘：擦身而過把他轉一圈（十從被轉的他身上彈出來）、
// 撞個滿懷兩個人一起滾到畫面邊（兩個小人從兩個人身上飛出來）、先停一拍——他張開雙手要接，被整個撞上天（大大的人字從他身上飛出來）。
// 回馬槍：他再招一次手「過來」，這次小老鼠剛剛好煞在他面前，兩個人得意——結果遠方又一個小點越跑越大：大象也聽到「來」了，把兩個人一起撞飛。
// 招手、遠方一個小點由小變大衝過來＝「來」，四次都一樣。
// 最後畫面暗下來只剩「來」，楊捷睿從天上掉到前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「來！」，然後退場只留字。
// 來、來、過來、這是什麼字？、來
const P = 66.9 // 楊捷睿、小老鼠（size 24）站在地上的 y
/** 楊捷睿每次站的地方（面向右邊的遠方招手） */
const YX = 50
/** 遠方：右邊山坡上的一點（腳底 y 55），小老鼠、大象都從這裡變大跑過來 */
const FX = 128
const FEET = 55
/** 遠方的時候縮成多小（跑到他面前長回原來大小） */
const FAR = 0.3
/** 從遠方跑到他面前要多久 */
const RUN = 0.55
/** 撞到以後傻眼停多久，才飛出去 */
const HOLD = 0.4
/** 大象 */
const ES = 46
const E = 77 - 0.42 * ES

/** 在遠方冒出來一個小點（❗＋一點塵土），準備起跑 */
function appear(id: string, at: number, size: number): { moves: Move[]; fx: Fx[] } {
  const y = FEET - 0.42 * size
  return {
    moves: [
      { at: at - 0.02, actor: id, do: 'moveTo', to: { x: FX, y }, dur: 0.01 },
      { at, actor: id, do: 'pop', dur: 0.3 },
      { at, actor: id, do: 'scaleTo', amount: FAR, dur: 0.01 },
      { at: at + 0.35, actor: id, do: 'squash', amount: -0.3, dur: 0.25 },
    ],
    fx: [
      { at: at + 0.05, kind: 'pop', x: FX, y: FEET - 9, emoji: '❗', dur: 0.4, scale: 1.2 },
      { at: at + 0.4, kind: 'puff', x: FX + 2, y: FEET - 1, dur: 0.35 },
    ],
  }
}

/** 從遠方「咻——」越跑越大，跑到 x（到的那一刻剛好長回原來大小）；ease 'in' 越跑越快、'out' 剛好煞住 */
const run = (id: string, at: number, x: number, y: number, ease: 'in' | 'out' = 'in'): Move[] => [
  { at, actor: id, do: 'moveTo', to: { x, y }, dur: RUN, ease },
  { at, actor: id, do: 'scaleTo', amount: 1 / FAR, dur: RUN, ease },
]

/**
 * 「碰」：衝過來的東西撞上楊捷睿——💥（在他頭的右前方，不蓋臉）＋鏡頭推近＋震＋同一個音效（咻—碰，一次比一次多疊一個）。
 * 他傻眼（surprised）停住。k 是第幾次（越後面越大）。
 */
function crash(at: number, k: number, x = YX) {
  const moves: Move[] = [
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at, actor: 'yang', do: 'squash', amount: 0.2 + 0.08 * k, dur: 0.25 },
  ]
  const fx: Fx[] = [
    { at, kind: 'burst', x: x + 13, y: P - (k >= 3 ? 24 : 18), n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
    { at, kind: 'burst', x: x + 6, y: P - 10, emoji: '⭐', n: 4 + 2 * k, dur: 0.45 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.05 * k, to: { x, y: k >= 3 ? 42 : P - 10 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at: at - RUN + 0.05, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues }
}

/** 招手大喊：揮手（wave）＋手邊 👋＋點一下 */
const beckon = (at: number): { moves: Move[]; fx: Fx[] } => ({
  moves: [
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    { at, actor: 'yang', do: 'hop', amount: 2, dur: 0.25 },
  ],
  fx: [{ at: at + 0.05, kind: 'pop', actor: 'yang', emoji: '👋', dx: 9, dy: 2, dur: 0.6, scale: 1.4 }],
})

const H1 = 1.8, H2 = 3.7, H3 = 6.4, H4 = 10.3
const b1 = beckon(0.5), b2 = beckon(2.6), b3 = beckon(4.95), b4 = beckon(8.4)
const a1 = appear('mouse', 0.75, 24), a2 = appear('mouse', 2.75, 24), a3 = appear('mouse', 5.15, 24)
const a4 = appear('mouse', 7.95, 24), a5 = appear('ele', 9.2, ES)
const c1 = crash(H1, 0), c2 = crash(H2, 1), c3 = crash(H3, 2), c4 = crash(H4, 3)
const MY = FEET - 0.42 * 24 // 小老鼠在遠方的 y（腳底在 FEET）

const clip: Clip = {
  format: 2,
  char: '來',
  meta: { theme: '楊捷睿招手叫小老鼠過來', cast: '楊捷睿＋小老鼠＋大象', gags: ['楊捷睿招手喊「來！」，遠方一個小點越跑越大衝過來，最快的小老鼠煞不住每次撞上他，一次比一次慘（轉一圈→一起滾出去→被撞上天）；回馬槍是小老鼠剛好煞住，大象也從遠方越跑越大衝來把兩個人撞飛'] },
  duration: 15,
  bg: { top: '#D8EEFF', bottom: '#F4FAFF', floor: '#A8D67E', scenery: 'hills' },
  actors: [
    // 大象畫在最後面：衝過來時把前面的兩個人推走
    { id: 'ele', emoji: 'prop:elephant', x: FX, y: FEET - 0.42 * ES, size: ES, hidden: true, float: true },
    // 姿勢圖朝左，翻過來面向右邊的遠方
    { id: 'yang', emoji: 'hero:yang/idle', x: YX, y: P, size: 24, hidden: true, flip: true },
    // 小老鼠朝左跑向他；在遠方時離地，不畫影子
    { id: 'mouse', emoji: 'hero:mouse/dash', x: FX, y: MY, size: 24, hidden: true, float: true },
  ],
  moves: [
    // 楊捷睿登場，對著遠方招手：來！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    ...b1.moves,
    // 第 1 次：遠方小點咻地衝過來——擦身而過，他被帶得原地轉一圈，小老鼠衝出畫面
    ...a1.moves,
    ...run('mouse', H1 - RUN, YX + 2, P),
    ...c1.moves,
    { at: H1, actor: 'mouse', do: 'moveTo', to: { x: -30, y: P }, dur: 0.3, ease: 'linear' },
    { at: H1 + 0.32, actor: 'mouse', do: 'vanish', dur: 0.01 },
    { at: H1 + 0.05, actor: 'yang', do: 'spin', times: -1, dur: 0.45, pivot: 'center' },
    { at: H1 + 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 第 2 次：再招手——撞個滿懷，兩個人抱成一團滾到畫面邊
    ...b2.moves,
    ...a2.moves,
    ...run('mouse', H2 - RUN, YX + 4, P),
    ...c2.moves,
    { at: H2 + 0.15, actor: 'yang', do: 'moveTo', to: { x: 26, y: P }, dur: 0.5, ease: 'out' },
    { at: H2 + 0.15, actor: 'yang', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    { at: H2 + 0.15, actor: 'mouse', do: 'moveTo', to: { x: 34, y: P }, dur: 0.5, ease: 'out' },
    { at: H2 + 0.15, actor: 'mouse', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    { at: H2 + 0.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: H2 + 0.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    // 小老鼠爬起來咻地跑出去（又要從遠方再來）；他走回原位
    { at: 4.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    { at: 4.85, actor: 'mouse', do: 'moveTo', to: { x: -30, y: P }, dur: 0.2, ease: 'in' },
    { at: 5.07, actor: 'mouse', do: 'vanish', dur: 0.01 },
    { at: 4.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: 4.55, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, dur: 0.4 },
    // 第 3 次：招手——先停一拍：他看一眼遠方、張開雙手要接，小老鼠擺好架式……咻！被整個撞上天
    ...b3.moves,
    ...a3.moves,
    { at: 5.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: 5.6, actor: 'mouse', do: 'shake', amount: 0.5, dur: 0.3 },
    { at: 5.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: 5.5, actor: 'yang', do: 'tilt', amount: 6, dur: 0.4 },
    { at: H3 - RUN, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
    ...run('mouse', H3 - RUN, YX + 4, P),
    ...c3.moves,
    { at: H3, actor: 'mouse', do: 'moveTo', to: { x: -30, y: P }, dur: 0.3, ease: 'linear' },
    { at: H3 + 0.32, actor: 'mouse', do: 'vanish', dur: 0.01 },
    { at: H3 + HOLD, actor: 'yang', do: 'moveTo', to: { x: 6, y: -45 }, dur: 0.6, ease: 'in' },
    { at: H3 + HOLD, actor: 'yang', do: 'spin', times: -2, dur: 0.6, pivot: 'center' },
    // 字框填滿（國字 home 到正中央）。他在天上；國字讓回上方以後才掉回原位
    { at: 7.9, actor: 'yang', do: 'moveTo', to: { x: YX, y: -45 }, dur: 0.01 },
    { at: 7.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 7.95, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, dur: 0.25, ease: 'in' },
    { at: 8.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 語詞那一刻：再招一次手「過來」——小老鼠從遠方跑過來，這次剛剛好煞在他面前
    ...b4.moves,
    ...a4.moves,
    ...run('mouse', 8.5, YX + 16, P, 'out'),
    { at: 9.05, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 9.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    { at: 9.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    // 回馬槍（第 4 次）：遠方又一個小點越跑越大——大象也聽到「來」了！兩個人傻眼，一起被撞飛
    ...a5.moves,
    { at: 9.4, actor: 'mouse', do: 'flip' },
    { at: 9.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 9.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    ...run('ele', H4 - RUN, YX + 22, E),
    ...c4.moves,
    { at: H4, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: H4 + 0.25, actor: 'yang', do: 'moveTo', to: { x: -20, y: -40 }, dur: 0.35, ease: 'out' },
    { at: H4 + 0.25, actor: 'yang', do: 'spin', times: -2, dur: 0.35, pivot: 'center' },
    { at: H4 + 0.25, actor: 'mouse', do: 'moveTo', to: { x: -10, y: -45 }, dur: 0.35, ease: 'out' },
    { at: H4 + 0.25, actor: 'mouse', do: 'spin', times: 3, dur: 0.35, pivot: 'center' },
    { at: H4 + 0.62, actor: 'mouse', do: 'vanish', dur: 0.01 },
    { at: H4 + 0.25, actor: 'ele', do: 'moveTo', to: { x: -60, y: E }, dur: 0.4, ease: 'linear' },
    { at: H4 + 0.66, actor: 'ele', do: 'vanish', dur: 0.01 },
    // 問他：楊捷睿從天上掉到左前方、變大，轉向觀眾
    { at: 10.72, actor: 'yang', do: 'moveTo', to: { x: 34, y: -50 }, dur: 0.01 },
    { at: 10.72, actor: 'yang', do: 'scaleTo', amount: 1.5, dur: 0.01 },
    { at: 10.75, actor: 'yang', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.25, ease: 'in' },
    { at: 11.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 11.85, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.4, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.9, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.35, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.35, actor: 'yang', do: 'hop', amount: 6, dur: 0.2 },
    // 退場，畫面只留下字
    { at: 13.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.55, actor: 'yang', do: 'flip' },
    { at: 13.55, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 第 1 次：被轉一圈的他，十（一橫一豎）從身上彈出來
    { at: H1 + 0.1, dur: 0.55, strokes: [0, 5], from: 'yang', color: partColor('十') },
    // 第 2 次：兩個人滾成一團，兩個小人飛出來
    { at: H2 + 0.65, dur: 0.6, strokes: [1, 2, 3, 4], from: 'yang', color: partColor('人') },
    // 第 3 次：被撞上天的他，大大的人字（撇、捺）飛出來
    { at: H3 + 0.1, dur: 0.55, strokes: [6, 7], from: 'yang', color: partColor('人') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park' },
    { at: 7.2, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.0, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: 10.7, dur: 2.9, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 10.75, dur: 0.4, do: 'home' },
    { at: 13.35, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    ...a1.fx,
    ...c1.fx,
    { at: H1 + 0.55, kind: 'dizzy', actor: 'yang', dur: 0.5 },
    ...b2.fx,
    ...a2.fx,
    ...c2.fx,
    { at: H2 + 0.7, kind: 'dizzy', actor: 'yang', dur: 0.5 },
    ...b3.fx,
    ...a3.fx,
    // 第 3 次前停一拍：他看一眼遠方，冒汗
    { at: 5.5, kind: 'pop', actor: 'yang', emoji: '👀', dx: -2, dur: 0.5, scale: 1.3 },
    { at: 5.6, kind: 'sweat', actor: 'yang' },
    ...c3.fx,
    { at: 8.25, kind: 'dizzy', actor: 'yang', dur: 0.3 },
    ...b4.fx,
    ...a4.fx,
    { at: 9.15, kind: 'pop', actor: 'mouse', emoji: '✌️', dx: -8, dur: 0.4, scale: 1.2 },
    ...a5.fx,
    { at: 9.45, kind: 'pop', actor: 'yang', emoji: '❗', dx: -2, dur: 0.45, scale: 1.4 },
    ...c4.fx,
    { at: 13.35, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 整段保持幾乎全景：遠方的小點和他都要在畫面裡（也擋掉自動取景往前預看、把飛出去的他切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 48 } },
    ...c1.camera,
    ...c2.camera,
    ...c3.camera,
    ...c4.camera,
  ],
  lights: [
    { at: 7.2, dur: 0.05, level: -0.18 },
    { at: 7.25, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '來' },
    { at: 0.8, sfx: 'blip' },
    ...c1.cues,
    { at: 2.8, sfx: 'blip' },
    ...c2.cues,
    { at: H2 + 0.65, sfx: 'plop' },
    { at: 5.2, sfx: 'blip' },
    ...c3.cues,
    { at: 7.3, say: '來' },
    { at: 8.2, sfx: 'plop' },
    { at: 8.45, say: '過來' },
    { at: 9.05, sfx: 'slide' },
    { at: 9.25, sfx: 'rumble' },
    ...c4.cues,
    { at: 10.75, say: FIXED_LINES.clipAsk },
    { at: 13.35, say: '來' },
    { at: 13.4, sfx: 'cheer' },
  ],
}

export default clip
