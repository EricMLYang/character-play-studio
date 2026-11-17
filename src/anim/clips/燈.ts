import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 燈（v2）：燈一亮，蟲就飛過來。晚上，小骷髏站在一盞大立燈旁邊，伸手「喀」地把燈打開——燈一亮，
// 左上角就「咻」地飛來一隻蟲，一頭撞上燈罩「叮」（燈被撞熄），反彈回來「咚」地正好撞在他臉上。蟲一次比一次大、他被撞得一次比一次慘：
// 小蝴蝶（往後退一步、傻眼，火從燈上噴出來）→ 蜜蜂（撞得一屁股坐在地上，癶）→
// 先停一拍：他手伸到燈旁邊又縮回來、抬頭看左上角、冒汗，才閉著眼打開——大獨角仙（撞得轉一圈飛到畫面另一頭摔坐，豆）。
// 語詞是第四次打開的那一刻：燈「叮」地亮起來，他指著燈說「電燈」。
// 回馬槍（第四次）：他學乖了，一開燈就抱頭蹲下——這次飛來一隻超大的蝴蝶，沒有撞他，直接抓住整盞燈抬起來要帶走！
// 他得意了一下才發現，跳起來抱住燈桿，跟著燈一起被帶走、飛出畫面。
// 最後畫面暗下來只剩「燈」，小骷髏從天上掉回來，問「這是什麼字？」，手放耳邊等他回答，再指著字說「燈！」，然後退場只留字。
// 刻意不跟「夜」（手電筒照出影子）、「晚」（燈一暗偷偷起來玩）、「紅」（號誌燈）撞：這支只演「燈一亮→蟲飛來撞他」，
// 畫面不關燈變黑（背景一直是看得清楚的深藍＋淺色地板），只有燈自己亮／熄。
// 燈、燈、電燈、這是什麼字？、燈

/** 小骷髏（hero:jerry；圖朝左，正好面向左邊的燈，不用翻） */
const JS = 34
const JY = 77 - 0.42 * JS
/** 每次都站在同一個地方：燈的右邊 */
const JX = 64
const STAND: Vec = { x: JX, y: JY }
/** 立燈（props-21 `lamp`）：放在左邊；國字回中央那一秒燈罩右緣不碰到字（字左緣約 x 49） */
const LS = 56
const LAMP: Vec = { x: 28, y: 77 - 0.42 * LS }
/** 燈罩下緣（光束從這裡往下照）、燈泡（光芒的中心），相對燈的中心 */
const BULB: Vec = { x: 0, y: -10 }
/** 熄著的燈：壓暗、去色，但還認得出是黃燈罩 */
const OFF = 'brightness(.62) saturate(.45)'
/** 光芒：從燈泡往外一圈短短的金色線（往下由光束負責） */
const GOLD = '#FFE066'
const RAY_DEG = [-170, -140, -110, -90, -70, -40, -10, 15]
/** 飛來的蟲：同一個角色換圖；size 寫最大的（回馬槍的大蝴蝶），其他用 scaleTo 縮 */
const BUGS = ['prop:butterfly', 'prop:bee', 'prop:beetle'] as const
const BS = 28
const BUG_SIZE = [12, 17, 25]
/** 蟲從左上角飛進來 */
const BUG_IN: Vec = { x: -14, y: 6 }
/** 撞上燈罩的地方（燈罩右上） */
const BUMP: Vec = { x: LAMP.x + 9, y: 33 }
/** 他的臉 */
const FACE: Vec = { x: JX - 5, y: 52 }
/** 被撞到傻眼停多久 */
const HOLD = 0.45

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; end: number }

/** 燈的光：一圈光芒（跟著燈走）＋往下照的光束（掛在燈罩下緣的錨點上） */
function glow(at: number, until: number, k = 0, beam = true): Fx[] {
  const out: Fx[] = RAY_DEG.map((deg): Fx => {
    const r = (deg * Math.PI) / 180
    const r0 = 15, r1 = 21 + 2 * k
    return {
      at, dur: until - at, kind: 'line', actor: 'lamp',
      dx: BULB.x + Math.cos(r) * r0, dy: BULB.y + Math.sin(r) * r0,
      to: { x: LAMP.x + BULB.x + Math.cos(r) * r1, y: LAMP.y + BULB.y + Math.sin(r) * r1 },
      color: GOLD, width: 1.3,
    }
  })
  if (beam) out.push({ at, dur: until - at, kind: 'beam', actor: 'beam', n: 34 })
  out.push({ at, kind: 'burst', actor: 'lamp', emoji: '✨', n: 5, dur: 0.4, dy: -14, scale: 1.2 })
  return out
}

/** 伸手「喀」地開燈：at 是燈亮那一刻 */
function click(at: number): { moves: Move[]; cues: Cue[] } {
  return {
    moves: [
      { at: at - 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
      { at: at - 0.3, actor: 'jerry', do: 'moveTo', to: { x: JX - 3, y: JY }, dur: 0.18 },
      { at: at - 0.06, actor: 'lamp', do: 'squash', amount: 0.08, dur: 0.14 },
      { at, actor: 'lamp', do: 'tint', filter: '' },
    ],
    cues: [{ at: at - 0.06, sfx: 'tap' }, { at, sfx: 'blip' }],
  }
}

/**
 * 同一個笑點：燈一亮（at）→ 左上角飛來一隻蟲（看得到一段）→ 「叮」撞上燈罩（燈被撞熄、晃一下）→
 * 反彈回來「咚」撞在他臉上＋💥＋鏡頭推近＋震 → 他傻眼（停 HOLD 秒）→ 蟲暈暈地飛回左上角。
 * k 是第幾次（0～2）：蟲一次比一次大、他被撞得一次比一次慘、💥 一次比一次大、音效多疊一個。
 */
function zap(at: number, k: number): Gag & { bump: number; hit: number } {
  const fly = [0.42, 0.38, 0.34][k]
  const bump = at + 0.08 + fly
  const hit = bump + 0.12
  const c = click(at)
  const moves: Move[] = [
    ...c.moves,
    // 蟲：藏著的時候換圖、縮到這次的大小、搬到左上角
    { at: at - 0.25, actor: 'bug', do: 'swap', emoji: BUGS[k] },
    { at: at - 0.25, actor: 'bug', do: 'moveTo', to: BUG_IN, dur: 0.01 },
    { at: at + 0.06, actor: 'bug', do: 'pop', dur: 0.06 },
    { at: at + 0.08, actor: 'bug', do: 'moveTo', to: BUMP, dur: fly, ease: 'in' },
    // 「叮」撞上燈罩：燈晃一下、熄掉
    { at: bump, actor: 'lamp', do: 'tilt', amount: -6 - 3 * k, dur: 0.3 },
    { at: bump, actor: 'lamp', do: 'tint', filter: OFF },
    { at: bump, actor: 'bug', do: 'moveTo', to: FACE, dur: 0.12, ease: 'linear' },
    // 反彈：暈暈地飛回左上角
    { at: hit, actor: 'bug', do: 'moveTo', to: { x: FACE.x - 14, y: 34 }, dur: 0.22, ease: 'out' },
    { at: hit + 0.05, actor: 'bug', do: 'spin', times: 1, dur: 0.3, pivot: 'center' },
    { at: hit + 0.3, actor: 'bug', do: 'moveTo', to: BUG_IN, dur: 0.32, ease: 'in' },
    { at: hit + 0.62, actor: 'bug', do: 'vanish', dur: 0.01 },
    // 傻眼
    { at: hit, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
  ]
  let end = hit + HOLD + 0.35
  if (k === 0) moves.push(
    // 往後退一步、身體往後仰
    { at: hit, actor: 'jerry', do: 'moveTo', to: { x: JX + 5, y: JY }, dur: 0.16, ease: 'out' },
    { at: hit, actor: 'jerry', do: 'tilt', amount: 10, dur: 0.4 },
    { at: hit + HOLD + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: hit + HOLD + 0.1, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.2 },
  )
  if (k === 1) {
    // 撞得往後一屁股坐在地上
    moves.push(
      { at: hit, actor: 'jerry', do: 'moveTo', to: { x: JX + 10, y: JY }, dur: 0.2, ease: 'out' },
      { at: hit + 0.18, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
      { at: hit + 0.18, actor: 'jerry', do: 'squash', amount: 0.25, dur: 0.2 },
      { at: hit + HOLD + 0.35, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
      { at: hit + HOLD + 0.35, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.25 },
    )
    end = hit + HOLD + 0.6
  }
  if (k === 2) {
    // 撞得轉一圈飛到畫面另一頭、摔坐（國字回中央時他已經在右邊）
    moves.push(
      { at: hit, actor: 'jerry', do: 'moveTo', to: { x: 138, y: JY }, arc: 10, dur: 0.55, ease: 'linear' },
      { at: hit + 0.02, actor: 'jerry', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
      { at: hit + 0.55, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/fall' },
    )
    end = hit + 0.55
  }
  const fx: Fx[] = [
    ...glow(at, bump, 0),
    // 撞上燈罩：火花
    { at: bump, kind: 'burst', x: BUMP.x, y: BUMP.y, emoji: '✨', n: 5, dur: 0.35, scale: 1 + 0.2 * k },
    // 撞在臉上：💥 一次比一次大
    { at: hit, kind: 'burst', x: FACE.x - 2, y: FACE.y - 2, emoji: '💥', n: 1, dur: 0.4, scale: 1.3 + 0.5 * k },
    { at: hit + 0.1, kind: 'sweat', actor: 'jerry', dx: 8, scale: 1.2 + 0.3 * k },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: FACE.x - 6, y: 50 } },
    { at: hit, dur: 0.3, do: 'shake', amount: 1 + 0.6 * k },
  ]
  // 同一組音效（喀、嗶、叮、咚），一次比一次多疊一個
  const cues: Cue[] = [...c.cues, { at: bump, sfx: 'clink' }, { at: hit, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'crack' }, { at: hit + 0.55, sfx: 'plop' })
  return { moves, fx, camera, cues, end, bump, hit }
}

// 第 1 次：小蝴蝶
const A1 = 1.35
const g1 = zap(A1, 0)
// 第 2 次：蜜蜂
const A2 = g1.end + 0.15
const g2 = zap(A2, 1)
// 第 3 次前停一拍：手伸過去又縮回來、抬頭看左上角、冒汗，才閉著眼打開
const PAUSE = g2.end + 0.05
const A3 = PAUSE + 0.75
const g3 = zap(A3, 2)
/** 字框填滿、國字到正中央 */
const HOME = g3.hit + 0.62
const PARK = HOME + 0.85
// 回馬槍（第 4 次）＝語詞那一刻：爬起來走回燈旁邊，「喀」——燈亮了：「電燈」
const A4 = PARK + 0.75
const c4 = click(A4)
const DUCK = A4 + 0.14
/** 超大蝴蝶從左上角飛來，停在燈罩上面 */
const MOTH_AT = A4 + 0.2
const MOTH_FLY = 0.42
const MOTH: Vec = { x: LAMP.x + 1, y: 23 }
/** 他以為躲過了，站起來得意 */
const SMUG4 = MOTH_AT + MOTH_FLY + 0.05
/** 蝴蝶抓著整盞燈抬起來 */
const LIFT = SMUG4 + 0.35
const RISE = 5
/** 他跳起來抱住燈桿 */
const GRAB = LIFT + 0.32
/** 一起被帶走（往左上方飛出去；抬得不高，燈罩和蝴蝶不被畫面頂端切掉） */
const AWAY = GRAB + 0.25
const OUT: Vec = { x: -85, y: -45 }
/** 問他 */
const ASK = AWAY + 0.38
const ASK_SAY = ASK + 0.45
const ANSWER = ASK_SAY + 2.48
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 124, y: JY + 4 }

const clip: Clip = {
  format: 2,
  char: '燈',
  meta: { theme: '晚上開燈引來飛蟲', cast: '小骷髏＋大立燈＋飛來的蟲（蝴蝶、蜜蜂、獨角仙、大蝴蝶）', gags: ['燈一亮，蟲就飛過來：小骷髏每次伸手「喀」地把大立燈打開，左上角就飛來一隻蟲，「叮」撞上燈罩、反彈回來「咚」地撞在他臉上，蟲一次比一次大、他被撞得一次比一次慘（小蝴蝶，退一步傻眼→蜜蜂，撞得跌坐→停一拍、大獨角仙，撞得轉一圈飛到畫面另一頭）；回馬槍是他一開燈就抱頭蹲下躲過了，結果飛來一隻超大蝴蝶直接把整盞燈抬走，他跳起來抱住燈桿，跟著一起被帶走'] },
  duration: Math.round((ANSWER + 1.75) * 100) / 100,
  // 深藍的夜空、淡紫的下半天空、淺色地板：一身黑的小骷髏一直看得清楚
  bg: { top: '#28307A', bottom: '#9088D8', floor: '#E6D3A8', scenery: 'night' },
  actors: [
    // 看不見的錨點：燈罩下緣，光束從這裡往下照
    { id: 'beam', emoji: '⚫', x: LAMP.x, y: LAMP.y - 7, size: 1, hidden: true, float: true },
    { id: 'lamp', emoji: 'prop:lamp', x: LAMP.x, y: LAMP.y, size: LS, tint: OFF },
    { id: 'jerry', emoji: 'hero:jerry/walk', x: JX, y: JY, size: JS },
    { id: 'bug', emoji: BUGS[0], x: BUG_IN.x, y: BUG_IN.y, size: BS, hidden: true, float: true, flip: true, pivot: 'center' },
  ],
  moves: [
    // 蟲先縮到第一隻的大小
    { at: 0, actor: 'bug', do: 'scaleTo', amount: BUG_SIZE[0] / BS, dur: 0.01 },
    // 開場：走進來，抬頭指著字框——燈！
    { at: 0, actor: 'jerry', do: 'enter', from: { x: 180, y: JY }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/know' },
    { at: 1.0, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    ...g1.moves,
    { at: A2 - 0.4, actor: 'bug', do: 'scaleTo', amount: BUG_SIZE[1] / BUG_SIZE[0], dur: 0.01 },
    ...g2.moves,
    // 第 3 次前停一拍：手伸過去、縮回來發抖、抬頭看左上角……閉著眼打開
    { at: PAUSE, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/reach' },
    { at: PAUSE + 0.28, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/scared' },
    { at: PAUSE + 0.28, actor: 'jerry', do: 'shake', amount: 0.8, dur: 0.35 },
    { at: A3 - 0.4, actor: 'bug', do: 'scaleTo', amount: BUG_SIZE[2] / BUG_SIZE[1], dur: 0.01 },
    ...g3.moves,
    // 國字讓位以後，爬起來走回燈旁邊
    { at: PARK + 0.2, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/walk' },
    { at: PARK + 0.25, actor: 'jerry', do: 'moveTo', to: STAND, dur: 0.3 },
    // 回馬槍：開燈——「電燈」，馬上抱頭蹲下
    ...c4.moves,
    { at: A4 + 0.02, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/point' },
    { at: DUCK + 0.08, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/duck' },
    // 超大蝴蝶：藏著的時候換圖、放大，從左上角飛到燈罩上面
    { at: A4 - 0.3, actor: 'bug', do: 'swap', emoji: 'prop:butterfly' },
    { at: A4 - 0.3, actor: 'bug', do: 'scaleTo', amount: BS / BUG_SIZE[2], dur: 0.01 },
    { at: A4 - 0.3, actor: 'bug', do: 'moveTo', to: { x: -22, y: -6 }, dur: 0.01 },
    { at: MOTH_AT, actor: 'bug', do: 'pop', dur: 0.06 },
    { at: MOTH_AT, actor: 'bug', do: 'moveTo', to: MOTH, dur: MOTH_FLY, ease: 'out' },
    // 沒撞到！站起來閉眼得意
    { at: SMUG4, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/smug' },
    // 蝴蝶抓著整盞燈抬起來
    { at: LIFT, actor: 'bug', do: 'moveTo', to: { x: MOTH.x, y: MOTH.y - RISE }, dur: 0.42, ease: 'inOut' },
    { at: LIFT, actor: 'lamp', do: 'moveTo', to: { x: LAMP.x, y: LAMP.y - RISE }, dur: 0.42, ease: 'inOut' },
    { at: LIFT + 0.1, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    // 跳起來抱住燈桿
    { at: GRAB - 0.08, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/jump' },
    { at: GRAB - 0.08, actor: 'jerry', do: 'moveTo', to: { x: LAMP.x + 2, y: JY - 5 }, arc: 4, dur: 0.24, ease: 'out' },
    // 一起被帶走
    { at: AWAY, actor: 'bug', do: 'moveTo', to: { x: MOTH.x + OUT.x, y: MOTH.y - RISE + OUT.y }, dur: 0.45, ease: 'in' },
    { at: AWAY, actor: 'lamp', do: 'moveTo', to: { x: LAMP.x + OUT.x, y: LAMP.y - RISE + OUT.y }, dur: 0.45, ease: 'in' },
    { at: AWAY, actor: 'jerry', do: 'moveTo', to: { x: LAMP.x + 2 + OUT.x, y: JY - 5 + OUT.y }, dur: 0.45, ease: 'in' },
    { at: AWAY + 0.46, actor: 'bug', do: 'vanish', dur: 0.01 },
    { at: AWAY + 0.46, actor: 'lamp', do: 'vanish', dur: 0.01 },
    // 問他：從天上掉回來，站好、變大
    { at: ASK - 0.05, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/surprised' },
    { at: ASK - 0.05, actor: 'jerry', do: 'moveTo', to: { x: ASK_AT.x, y: -30 }, dur: 0.01 },
    { at: ASK, actor: 'jerry', do: 'moveTo', to: ASK_AT, dur: 0.3, ease: 'in' },
    { at: ASK + 0.3, actor: 'jerry', do: 'swap', emoji: 'hero:jerry/idle' },
    { at: ASK + 0.35, actor: 'jerry', do: 'scaleTo', amount: 1.3, dur: 0.3 },
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
    // 小蝴蝶撞上燈罩：火花從燈上噴出來（火）
    { at: g1.bump, dur: 0.45, strokes: [0, 1, 2, 3], from: 'lamp', color: partColor('火') },
    // 蜜蜂撞得他一屁股坐下、兩腳翹起來（癶）
    { at: g2.hit + 0.18, dur: 0.45, strokes: [4, 5, 6, 7, 8], from: 'jerry', color: partColor('癶') },
    // 獨角仙「咚」地撞在頭上（豆）
    { at: g3.hit + 0.05, dur: 0.45, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'jerry', color: partColor('豆') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的小骷髏
    { at: ASK, dur: ANSWER + 0.5 - ASK, do: 'ask', keep: ['jerry'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: ANSWER + 1.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: PAUSE + 0.32, kind: 'sweat', actor: 'jerry', dx: 8, scale: 1.4 },
    { at: PAUSE + 0.32, kind: 'pop', actor: 'jerry', emoji: '❓', dx: -8, dy: -2, dur: 0.4 },
    ...g3.fx,
    { at: g3.hit + 0.6, kind: 'dizzy', actor: 'jerry', dur: 0.6 },
    // 回馬槍＝語詞：燈亮得最大
    ...glow(A4, LIFT, 2, false),
    { at: A4, dur: LIFT - A4, kind: 'beam', actor: 'beam', n: 34 },
    { at: A4 + 0.05, kind: 'burst', actor: 'lamp', emoji: '🌟', n: 6, dur: 0.5, dy: -2, scale: 1.2 },
    // 得意
    { at: SMUG4 + 0.05, kind: 'pop', actor: 'jerry', emoji: '🎵', dx: 8, dur: 0.35 },
    // 被抬起來：傻眼
    { at: LIFT + 0.12, kind: 'pop', actor: 'jerry', emoji: '❗', dx: 8, dur: 0.3, scale: 1.4 },
    { at: ANSWER, kind: 'burst', x: 60, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    // 國字回中央以後手寫幾乎全景，蓋掉自動取景（燈在最左邊，推近會切掉燈）
    { at: HOME - 0.3, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    { at: LIFT, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '燈' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '燈' },
    ...c4.cues,
    { at: A4 + 0.05, say: '電燈' },
    { at: MOTH_AT, sfx: 'whoosh' },
    { at: LIFT, sfx: 'boing' },
    { at: GRAB, sfx: 'tap' },
    { at: AWAY, sfx: 'whoosh' },
    { at: ASK + 0.3, sfx: 'bonk' },
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '燈' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
