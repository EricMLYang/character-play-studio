import type { Build, Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 年（v2）：過年了，紫色的大年獸「吼！」地跑來搗蛋。豬探長每次點一根鞭炮——引信「滋滋滋」，他蹲下抱頭——「劈哩啪啦！」
// 年獸嚇得跳起來逃走，鞭炮一次比一次大、炸得一次比一次響，年獸逃得一次比一次狼狽：跳一下逃走 → 跳好高、滾著逃走 →
// 先停一拍：牠躡手躡腳偷偷溜回來，看見引信在燒，僵住冒汗⋯⋯最大的一聲，整隻被炸上天。每次炸開，紅紙屑就飛上去拼成「年」的一部分。
// 語詞那一刻：豬探長抱出一根超大的鞭炮擺在正中間，得意地跳：「過年」。
// 回馬槍（第四次）：年獸又偷溜回來，他點了超大鞭炮、蹲下抱頭——「噗」只冒一小縷煙，沒響。他拿放大鏡湊過去看⋯⋯
// 「碰！」最大的一聲在他臉上炸開，他被炸得一臉黑、飛出畫面，年獸這次一點都不怕，笑得跳起來。
// 最後畫面暗下來只剩「年」，豬探長從天上掉回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「年！」，然後退場只留字。
// 刻意不跟「獅」（吸氣大吼把人吹走）、「弟」（一吼把熊嚇跑）、「叔」（🎉 紙花嚇人）、「喜」（禮物盒）撞：這支只演「點鞭炮→劈哩啪啦→年獸嚇跑」。
// 年、年、過年、這是什麼字？、年

/** 豬探長（圖朝左，flip 以後看著右邊的鞭炮和年獸）：每次都站在同一個地方 */
const PS = 34
const PY = 77 - 0.42 * PS
const PX = 28
/** 鞭炮每次都擺在他右手邊同一個地方 */
const FX = 56
/** 鞭炮共用一個角色：底子 size 寫最大的（語詞那一刻的超大鞭炮），前三次用 scaleTo 縮（寫在 pop 之後） */
const FB = 44
const FY = 77 - 0.42 * FB
/** 前三次一次比一次大 */
const FS = [24, 30, 36]
/** 語詞那一刻、回馬槍的超大鞭炮：擺在畫面正中間 */
const GX = 84
/** 年獸（prop:lion 染成紫色，跟「獅」那支的獅子不一樣）：這個字的對手，畫面上最大 */
const LS = 46
const LY = 77 - 0.42 * LS
const LX = 122
/** 吼的那張身體往右偏，swap 時 x 往左補一點腳才對齊（同「獅」） */
const ROAR_DX = -0.076 * LS
/** 年獸的顏色：紫色的妖怪 */
const BEAST = 'hue-rotate(235deg) saturate(1.25)'
/** 炸得一臉黑 */
const SOOT = 'brightness(.42) saturate(.6)'
/** 傻眼停多久 */
const HOLD = 0.42
/** 引信燒多久（第三次停一拍：燒特別久） */
const FUSE = [0.35, 0.35, 0.85]

/** 站在地上、size 為 s 的東西的中心 */
const cyOf = (s: number) => 77 - 0.42 * s
/** 鞭炮的引信頭（🧨 圖的右上角） */
const fuseAt = (x: number, s: number): Vec => ({ x: x + 0.23 * s, y: cyOf(s) - 0.35 * s })

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[]; builds: Build[] }

/**
 * 同一個笑點：豬探長把鞭炮丟到右手邊 → 伸手點引信（滋滋滋的火花）→ 蹲下抱頭 →
 * 「劈哩啪啦！」💥 一圈炸開＋鏡頭推一下＋震＋淡淡的閃光＋同一串爆竹聲（一次多兩響）→ 年獸嚇得縮成一團跳起來、傻眼停住，
 * 紅紙屑（一組筆畫）飛上去填進字框 → 豬探長站起來得意地跳。年獸怎麼逃由呼叫的人寫。
 * at 是炸開那一刻，k 是第幾次（0～2）。
 */
function bang(at: number, k: number, strokes: number[]): Gag {
  const s = FS[k]
  const fuse = FUSE[k]
  const light = at - fuse
  const toss = light - 0.25
  const cy = cyOf(s)
  const f = fuseAt(FX, s)
  const moves: Move[] = [
    // 丟鞭炮：從手上拋到右手邊
    { at: toss - 0.02, actor: 'pig', do: 'swap', emoji: 'hero:pig/throw' },
    { at: toss - 0.01, actor: 'fc', do: 'moveTo', to: { x: PX + 8, y: FY - 16 }, dur: 0.01 },
    { at: toss, actor: 'fc', do: 'pop', dur: 0.12 },
    { at: toss + 0.001, actor: 'fc', do: 'scaleTo', amount: s / FB, dur: 0.01 },
    { at: toss + 0.03, actor: 'fc', do: 'moveTo', to: { x: FX, y: FY }, arc: 8, dur: 0.22, ease: 'out' },
    // 點引信
    { at: light, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: light, actor: 'pig', do: 'tilt', amount: 8, dur: 0.2 },
    // 蹲下抱頭
    { at: light + 0.18, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: light + 0.18, actor: 'pig', do: 'shake', amount: 0.5, dur: at - light - 0.18 },
    // 劈哩啪啦：鞭炮炸掉
    { at, actor: 'fc', do: 'vanish', dur: 0.12 },
    // 年獸嚇得縮成一團跳起來、傻眼停住
    { at: at + 0.03, actor: 'beast', do: 'swap', emoji: 'prop:lion-scared' },
    { at: at + 0.03, actor: 'beast', do: 'hop', amount: 6 + 5 * k, dur: 0.34 },
    { at: at + 0.35, actor: 'beast', do: 'shake', amount: 0.8 + 0.3 * k, dur: HOLD - 0.3 },
    // 豬探長站起來，得意地跳
    { at: at + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: at + 0.4, actor: 'pig', do: 'hop', amount: 3 + k, dur: 0.28 },
  ]
  const fx: Fx[] = [
    // 引信滋滋滋：火花
    { at: light + 0.05, kind: 'burst', x: f.x, y: f.y, emoji: '✨', n: 3, dur: fuse - 0.05, scale: 0.8 + 0.1 * k },
    // 劈哩啪啦：中間一個大 💥，旁邊一圈小 💥，一次比一次大
    { at, kind: 'burst', x: FX, y: cy, n: 1, dur: 0.4, scale: 2.0 + 0.5 * k },
    { at: at + 0.06, kind: 'burst', x: FX, y: cy - 2, emoji: '💥', n: 4 + 2 * k, dur: 0.45, scale: 0.9 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.07 + 0.04 * k, to: { x: (FX + LX) / 2, y: 52 } },
    { at, dur: 0.35 + 0.1 * k, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 閃光要節制：淡淡的，不把畫面刷白
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.06 - 0.02 * k },
    { at: at + 0.04, dur: 0.2, level: 0 },
  ]
  // 同一串爆竹聲，一次多兩響
  const cues: Cue[] = [{ at: light, sfx: 'blip' }]
  for (let i = 0; i < 3 + 2 * k; i++) cues.push({ at: at + 0.075 * i, sfx: 'crack' })
  const builds: Build[] = [{ at: at + 0.05, dur: 0.5, strokes, from: { x: FX, y: cy }, color: partColor('年') }]
  return { moves, fx, camera, cues, lights, builds }
}

/** 年獸「吼！」：張大嘴、往前一衝、震一下 */
function roar(at: number, dur = 0.3): { moves: Move[]; cues: Cue[]; camera: Camera[] } {
  return {
    moves: [
      { at, actor: 'beast', do: 'swap', emoji: 'prop:lion-roar' },
      { at, actor: 'beast', do: 'moveTo', to: { x: LX + ROAR_DX, y: LY }, dur: 0.01 },
      { at, actor: 'beast', do: 'scaleTo', amount: 1.08, dur: 0.12, ease: 'out' },
      { at: at + 0.1, actor: 'beast', do: 'shake', amount: 0.6, dur: dur - 0.1 },
      { at: at + dur, actor: 'beast', do: 'swap', emoji: 'prop:lion' },
      { at: at + dur, actor: 'beast', do: 'moveTo', to: { x: LX, y: LY }, dur: 0.01 },
      { at: at + dur, actor: 'beast', do: 'scaleTo', amount: 1 / 1.08, dur: 0.12 },
    ],
    cues: [{ at, sfx: 'rumble' }],
    camera: [{ at, dur: 0.25, do: 'shake', amount: 0.6 }],
  }
}

// 三次炸開的時間
const H1 = 1.95, H2 = 4.25, H3 = 6.75
const b1 = bang(H1, 0, [0, 1])
const b2 = bang(H2, 1, [2, 3])
const b3 = bang(H3, 2, [4, 5])
const r1 = roar(1.15)
const r2 = roar(3.42)
/** 國字回中央、讓位、語詞 */
const HOME = 7.45
const PARK = 8.2
const WORD = 8.62
/** 回馬槍：點超大鞭炮 → 啞炮冒煙 → 湊過去看 → 碰 */
const LIGHT4 = 9.3
const DUD = 9.72
const BOOM = 10.18
/** 問他 */
const ASK = 10.92
const ASK_SAY = 11.0
const ANSWER = 13.5
const ASK_X = 34
const ASK_S = 1.4

const clip: Clip = {
  format: 2,
  char: '年',
  meta: { theme: '過年放鞭炮趕年獸', cast: '豬探長＋年獸（染紫的獅子）＋鞭炮', gags: ['過年了，年獸吼著跑來，豬探長每次點一根鞭炮、蹲下抱頭，劈哩啪啦一炸年獸就嚇得跳起來逃走，鞭炮一次比一次大、年獸逃得一次比一次狼狽（跳一下逃走→跳好高滾著逃走→停一拍牠偷溜回來看見引信在燒、僵住冒汗，整隻被炸上天）；回馬槍是第四次超大鞭炮只噗一縷煙沒響，他拿放大鏡湊過去看，碰地在他臉上炸開、一臉黑飛出畫面，年獸笑得跳起來'] },
  duration: 14.9,
  bg: { top: '#FFE3D6', bottom: '#FFF6EE', floor: '#E8C9A2', scenery: 'hills' },
  actors: [
    { id: 'beast', emoji: 'prop:lion', x: 190, y: LY, size: LS, tint: BEAST },
    { id: 'fc', emoji: '🧨', x: FX, y: FY, size: FB, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: PX, y: PY, size: PS, hidden: true, flip: true },
  ],
  moves: [
    // 豬探長登場，抬頭指著字框
    { at: 0, actor: 'pig', do: 'enter', from: { x: -25, y: PY }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    // 年獸從右邊跑進來：吼！
    { at: 0.8, actor: 'beast', do: 'moveTo', to: { x: LX, y: LY }, dur: 0.35, ease: 'out' },
    ...r1.moves,
    { at: 1.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/scared' },
    { at: 1.15, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.2 },
    // 第 1 次：劈哩啪啦——年獸跳一下，轉身逃走
    ...b1.moves,
    { at: H1 + HOLD + 0.03, actor: 'beast', do: 'flip' },
    { at: H1 + HOLD + 0.03, actor: 'beast', do: 'moveTo', to: { x: 200, y: LY }, dur: 0.45, ease: 'in' },
    { at: H1 + 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 2 次：年獸從右邊探頭，又走回來吼
    { at: 2.95, actor: 'beast', do: 'flip' },
    { at: 2.95, actor: 'beast', do: 'swap', emoji: 'prop:lion' },
    { at: 2.95, actor: 'beast', do: 'moveTo', to: { x: 152, y: LY }, dur: 0.2, ease: 'out' },
    { at: 3.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.2, actor: 'beast', do: 'moveTo', to: { x: LX, y: LY }, dur: 0.22 },
    ...r2.moves,
    { at: 3.42, actor: 'pig', do: 'shake', amount: 0.6, dur: 0.2 },
    ...b2.moves,
    // 跳好高，滾著逃走
    { at: H2 + HOLD + 0.03, actor: 'beast', do: 'moveTo', to: { x: 205, y: LY }, dur: 0.45, ease: 'in' },
    { at: H2 + HOLD + 0.03, actor: 'beast', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    { at: H2 + 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 3 次：先停一拍——年獸躡手躡腳偷溜回來（踮腳一步一步），豬探長看見了
    { at: 5.12, actor: 'beast', do: 'swap', emoji: 'prop:lion' },
    { at: 5.15, actor: 'beast', do: 'moveTo', to: { x: LX, y: LY }, dur: 0.6, ease: 'linear' },
    ...[5.15, 5.3, 5.45, 5.6].map((at): Move => ({ at, actor: 'beast', do: 'hop', amount: 1.6, dur: 0.15 })),
    { at: 5.42, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    ...b3.moves,
    // 年獸看見引信在燒，僵住發抖
    { at: 6.2, actor: 'beast', do: 'shake', amount: 0.5, dur: 0.5 },
    // 整隻被炸上天
    { at: H3 + HOLD + 0.03, actor: 'beast', do: 'moveTo', to: { x: 178, y: -40 }, dur: 0.45, ease: 'out' },
    { at: H3 + HOLD + 0.03, actor: 'beast', do: 'spin', times: 3, dur: 0.45, pivot: 'center' },
    { at: H3 + 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 語詞那一刻：抱出超大鞭炮擺在正中間，得意地跳
    { at: PARK + 0.1, actor: 'fc', do: 'moveTo', to: { x: GX, y: FY }, dur: 0.01 },
    { at: WORD - 0.04, actor: 'fc', do: 'pop', dur: 0.3 },
    { at: WORD + 0.05, actor: 'fc', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: WORD, actor: 'pig', do: 'moveTo', to: { x: 50, y: PY }, dur: 0.3 },
    { at: WORD, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: WORD + 0.3, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：年獸又偷溜回來；他點了超大鞭炮、蹲下抱頭
    { at: 8.85, actor: 'beast', do: 'moveTo', to: { x: 205, y: LY }, dur: 0.01 },
    { at: 8.9, actor: 'beast', do: 'moveTo', to: { x: 128, y: LY }, dur: 0.45, ease: 'linear' },
    ...[8.9, 9.05, 9.2].map((at): Move => ({ at, actor: 'beast', do: 'hop', amount: 1.6, dur: 0.15 })),
    { at: 9.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: LIGHT4, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    { at: LIGHT4 + 0.18, actor: 'pig', do: 'swap', emoji: 'hero:pig/duck' },
    { at: LIGHT4 + 0.18, actor: 'pig', do: 'shake', amount: 0.5, dur: DUD - LIGHT4 - 0.18 },
    { at: LIGHT4 + 0.2, actor: 'beast', do: 'swap', emoji: 'prop:lion-scared' },
    // 噗⋯⋯沒響
    { at: DUD, actor: 'fc', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: DUD + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: DUD + 0.12, actor: 'beast', do: 'swap', emoji: 'prop:lion' },
    // 拿放大鏡湊過去看
    { at: DUD + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: DUD + 0.2, actor: 'pig', do: 'moveTo', to: { x: 64, y: PY }, dur: 0.22 },
    { at: DUD + 0.2, actor: 'pig', do: 'tilt', amount: 10, dur: 0.24 },
    // 碰！在他臉上炸開：一臉黑、傻眼停住，再飛出畫面
    { at: BOOM, actor: 'fc', do: 'vanish', dur: 0.12 },
    { at: BOOM, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: BOOM, actor: 'pig', do: 'tint', filter: SOOT },
    { at: BOOM, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: BOOM + 0.36, actor: 'pig', do: 'moveTo', to: { x: -28, y: -30 }, dur: 0.45, ease: 'linear' },
    { at: BOOM + 0.36, actor: 'pig', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    // 年獸一點都不怕，笑得跳起來，然後蹦蹦跳跳走掉
    { at: BOOM + 0.12, actor: 'beast', do: 'hop', amount: 5, dur: 0.18 },
    { at: BOOM + 0.32, actor: 'beast', do: 'hop', amount: 5, dur: 0.15 },
    { at: BOOM + 0.47, actor: 'beast', do: 'flip' },
    { at: BOOM + 0.47, actor: 'beast', do: 'moveTo', to: { x: 205, y: LY }, dur: 0.26, ease: 'in' },
    // 問他：豬探長從天上掉回來（臉擦乾淨了）、變大、轉向觀眾
    { at: ASK, actor: 'pig', do: 'tint', filter: '' },
    { at: ASK, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: ASK, actor: 'pig', do: 'moveTo', to: { x: ASK_X, y: -50 }, dur: 0.01 },
    { at: ASK, actor: 'pig', do: 'scaleTo', amount: ASK_S, dur: 0.01 },
    { at: ASK + 0.05, actor: 'pig', do: 'moveTo', to: { x: ASK_X, y: PY + 2 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體前傾聽，點兩下頭
    { at: 12.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.05, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: 12.6, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.12 },
    { at: ANSWER, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: ANSWER, actor: 'pig', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.12, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: ANSWER + 0.12, actor: 'pig', do: 'moveTo', to: { x: -45, y: PY + 2 }, dur: 0.25, ease: 'in' },
  ],
  builds: [...b1.builds, ...b2.builds, ...b3.builds],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['pig'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    { at: H1 + 0.35, kind: 'sweat', actor: 'beast', dx: -12, dy: 4, scale: 1.3 },
    ...b2.fx,
    { at: H2 + 0.35, kind: 'sweat', actor: 'beast', dx: -12, dy: 4, scale: 1.3 },
    // 第 3 次前停一拍：年獸看見引信在燒，冒汗
    { at: 6.15, kind: 'sweat', actor: 'beast', dx: -12, dy: 4, scale: 1.5 },
    ...b3.fx,
    // 語詞那一刻：超大鞭炮身邊亮晶晶
    { at: WORD, kind: 'burst', x: GX, y: cyOf(FB), emoji: '✨', n: 8, dur: 0.6, scale: 1.3 },
    // 回馬槍：引信燒，然後只噗一縷煙
    { at: LIGHT4 + 0.05, kind: 'burst', ...fuseAt(GX, FB), emoji: '✨', n: 3, dur: DUD - LIGHT4 - 0.05, scale: 1.1 },
    { at: DUD, kind: 'puff', x: fuseAt(GX, FB).x, y: fuseAt(GX, FB).y, dur: 0.5, scale: 1.8 },
    { at: DUD + 0.15, kind: 'pop', actor: 'pig', emoji: '❓', dx: 6, dur: 0.45, scale: 1.3 },
    // 碰！最大的一聲
    { at: BOOM, kind: 'burst', x: GX - 4, y: cyOf(FB) - 4, n: 1, dur: 0.45, scale: 3.0 },
    { at: BOOM + 0.06, kind: 'burst', x: GX - 4, y: cyOf(FB) - 4, emoji: '💥', n: 10, dur: 0.5, scale: 1.5 },
    { at: BOOM + 0.15, kind: 'pop', actor: 'beast', emoji: '😆', dx: -14, dur: 0.45, scale: 1.5 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...r1.camera,
    ...b1.camera,
    ...r2.camera,
    ...b2.camera,
    ...b3.camera,
    { at: BOOM, dur: 0.45, do: 'punch', amount: 0.15, to: { x: 70, y: 50 } },
    { at: BOOM, dur: 0.5, do: 'shake', amount: 2.2 },
  ],
  lights: [
    ...b1.lights,
    ...b2.lights,
    ...b3.lights,
    { at: HOME, dur: 0.05, level: -0.25 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    { at: BOOM, dur: 0.04, level: -0.12 },
    { at: BOOM + 0.04, dur: 0.2, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '年' },
    ...r1.cues,
    ...b1.cues,
    ...r2.cues,
    ...b2.cues,
    ...b3.cues,
    { at: HOME + 0.1, say: '年' },
    { at: WORD, say: '過年' },
    { at: LIGHT4, sfx: 'blip' },
    { at: DUD, sfx: 'poof' },
    { at: BOOM, sfx: 'crack' },
    { at: BOOM + 0.05, sfx: 'bonk' },
    { at: BOOM + 0.1, sfx: 'crack' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '年' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
