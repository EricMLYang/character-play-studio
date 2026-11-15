import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 也（v2）：天上「咻——啪！」掉下一個奶油蛋糕，砸在豬探長頭上；小機器人指著他哈哈大笑——停半拍——「咻——啪！」他也被砸了，而且他的比較大。
// 兩個人頭上頂著一樣的蛋糕、一樣的表情並排傻眼：他被砸，我「也」被砸。每次都是同一個「豬探長先中→機器人笑→機器人也中」，只是蛋糕一次比一次大、砸得一次比一次慘：
// 小蛋糕，兩個站著傻眼（橫折鉤）→ 大蛋糕，兩個一屁股跌坐（豎）→ 先停一拍：機器人笑到一半自己抬頭，看到天上露出一個超大蛋糕在晃、冒汗——啪！兩個都被壓扁（豎彎鉤）。
// 回馬槍（第四次）：這次他學乖了，一聽到「咻——」就衝到旁邊躲開，只有豬探長被砸，他沒中、笑得最開心；
// 豬探長頭一甩，蛋糕裂成兩半，一半「咻——啪」飛到他頭上——兩個人又頂著一樣的半個蛋糕並排跌坐（唸「也是」）。
// 最後畫面暗下來只剩「也」，小機器人站到前面、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「也！」，然後退場只留字。
// 也、也、也是、這是什麼字？、也
const SB = 38 // 小機器人
const SP = 30 // 豬探長
const GROUND = 77 // 腳底（y ＝ GROUND − 0.42 × size）
const PB = GROUND - 0.42 * SB
const PP = GROUND - 0.42 * SP
/** 前三次兩個人站的地方：機器人在左（翻過來朝右）、豬探長在右（朝左），面對面；字框在上方正中，蛋糕從兩邊掉下來 */
const XB = 36
const XP = 126
/** 回馬槍：機器人躲到中間 */
const XB4 = 80

type Pose = 'stand' | 'fall' | 'flat'
/** 頭頂（蛋糕底部要落的地方）：照姿勢圖量的（圖的比例 u, v；腳底在 v＝0.92），機器人是翻過來的 */
const HEAD: Record<'bot' | 'pig', Record<Pose, { u: number; v: number }>> = {
  bot: { stand: { u: 0.45, v: 0.15 }, fall: { u: 0.6, v: 0.29 }, flat: { u: 0.42, v: 0.57 } },
  pig: { stand: { u: 0.47, v: 0.1 }, fall: { u: 0.52, v: 0.12 }, flat: { u: 0.37, v: 0.57 } },
}
function headTop(who: 'bot' | 'pig', pose: Pose, x: number) {
  const S = who === 'bot' ? SB : SP
  const h = HEAD[who][pose]
  const dx = (h.u - 0.5) * S
  return { x: who === 'bot' ? x - dx : x + dx, y: GROUND + (h.v - 0.92) * S }
}
/** 蛋糕角色原本的 size（之後用 scaleTo 換大小；縮放以腳底為準，所以位置要用原本的 size 算） */
const BASE = { cakeP: 12, cakeB: 15 }
/**
 * 蛋糕（看起來 size sc）壓在頭頂上時角色要擺在哪（底部陷進頭裡一點點，像黏住）。
 * 腳底＝y＋0.42×原本的 size；圖的底（v 0.961）在腳底下面 0.041×sc。
 */
function cakeOn(who: 'bot' | 'pig', pose: Pose, x: number, sc: number, cake: 'cakeP' | 'cakeB' = who === 'bot' ? 'cakeB' : 'cakeP') {
  const h = headTop(who, pose, x)
  const feet = h.y + 0.14 * sc - 0.041 * sc
  return { x: h.x, y: feet - 0.42 * BASE[cake] }
}
/** 蛋糕的底部在 bottom 時角色的 y */
const cakeY = (bottom: number, sc: number, cake: 'cakeP' | 'cakeB') => bottom - 0.041 * sc - 0.42 * BASE[cake]

/** 每一次的蛋糕大小：豬探長的、機器人的（機器人的永遠比較大），一次比一次大 */
const CP = [BASE.cakeP, 17, 25]
const CB = [BASE.cakeB, 22, 33]
const POSE: Pose[] = ['stand', 'fall', 'flat']
const HIT_POSE = (who: 'bot' | 'pig', k: number) => `hero:${who}/${k === 0 ? 'surprised' : k === 1 ? 'fall' : 'flat'}`
/** 「啪」之後蛋糕被壓寬多少 */
const SPLAT = 1.22

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/**
 * 「咻——啪！」：蛋糕從畫面頂上直直掉下來（同一個音效、同一個樣子），砸在 who 的頭上：
 * 壓寬一點、奶油噴一圈、💥 在蛋糕上面（不蓋到臉）、鏡頭推近＋震，被砸的人換姿勢（傻眼→跌坐→壓扁）。
 * fall 是從哪個高度開始掉（第三次機器人那一顆先在畫面頂上露出來晃）。
 */
function splat(H: number, who: 'bot' | 'pig', cake: 'cakeP' | 'cakeB', k: number, x: number, sc: number, g: Gag, pose: Pose = POSE[k], peeking = false) {
  const to = cakeOn(who, pose, x, sc, cake)
  const D = 0.24
  if (!peeking) g.moves.push(
    { at: H - D - 0.02, actor: cake, do: 'moveTo', to: { x: to.x, y: -30 }, dur: 0.01 },
    { at: H - D - 0.01, actor: cake, do: 'pop', dur: 0.01 },
  )
  g.moves.push(
    { at: H - D, actor: cake, do: 'moveTo', to, dur: D, ease: 'in' },
    { at: H, actor: cake, do: 'stretchTo', amount: SPLAT, dur: 0.08, ease: 'out' },
    { at: H, actor: who, do: 'swap', emoji: pose === 'stand' ? `hero:${who}/surprised` : pose === 'fall' ? `hero:${who}/fall` : `hero:${who}/flat` },
    { at: H, actor: who, do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.18 },
  )
  // 蛋糕畫出來的中間、頂端
  const bottom = to.y + 0.42 * BASE[cake] + 0.041 * sc
  const mid = { x: to.x, y: bottom - 0.4 * sc }
  const top = { x: to.x, y: bottom - 0.75 * sc }
  g.fx.push(
    { at: H, kind: 'burst', x: mid.x, y: mid.y, emoji: '☁️', n: 6 + 2 * k, dur: 0.45, scale: 0.7 + 0.25 * k + (who === 'bot' ? 0.15 : 0) },
    { at: H, kind: 'burst', x: top.x + (who === 'bot' ? -4 : 4), y: top.y - 0.35 * sc, n: 1, dur: 0.4, scale: 1.2 + 0.4 * k + (who === 'bot' ? 0.3 : 0) },
  )
  g.camera.push(
    { at: H, dur: 0.4, do: 'punch', amount: 0.06 + 0.04 * k + (who === 'bot' ? 0.03 : 0), to: { x: to.x, y: Math.max(to.y, 46) } },
    { at: H, dur: 0.3, do: 'shake', amount: 0.8 + 0.5 * k + (who === 'bot' ? 0.3 : 0) },
  )
  g.cues.push({ at: H - D, sfx: 'whoosh' }, { at: H, sfx: 'plop' }, { at: H + 0.02, sfx: 'bonk' })
  if (k >= 1) g.cues.push({ at: H + 0.05, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: H + 0.08, sfx: 'rumble' })
}

/** 小機器人指著豬探長哈哈大笑（一跳一跳）；dur 是笑多久 */
function laugh(at: number, dur: number, k: number, g: Gag) {
  g.moves.push({ at, actor: 'bot', do: 'swap', emoji: 'hero:bot/laugh' })
  for (let t = at + 0.02; t < at + dur - 0.1; t += 0.24) g.moves.push({ at: t, actor: 'bot', do: 'hop', amount: 1.6 + 0.6 * k, dur: 0.2 })
  if (k >= 1) g.moves.push({ at: at + 0.02, actor: 'bot', do: 'tilt', amount: 10, dur: dur - 0.05 })
}

/** 爬起來、把頭上的蛋糕甩掉（往外飛出畫面）；看不見以後把蛋糕換成下一次的大小（k 是下一次） */
function shakeOff(at: number, k: number, g: Gag) {
  g.moves.push(
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at, actor: 'bot', do: 'shake', amount: 1.4, dur: 0.18 },
    { at, actor: 'pig', do: 'shake', amount: 1.4, dur: 0.18 },
    { at: at + 0.04, actor: 'cakeB', do: 'moveTo', to: { x: -30, y: 46 }, arc: 8, dur: 0.22, ease: 'in' },
    { at: at + 0.04, actor: 'cakeB', do: 'rotateTo', amount: -200, dur: 0.22 },
    { at: at + 0.04, actor: 'cakeP', do: 'moveTo', to: { x: 190, y: 46 }, arc: 8, dur: 0.22, ease: 'in' },
    { at: at + 0.04, actor: 'cakeP', do: 'rotateTo', amount: 200, dur: 0.22 },
    { at: at + 0.27, actor: 'cakeB', do: 'vanish', dur: 0.01 },
    { at: at + 0.27, actor: 'cakeP', do: 'vanish', dur: 0.01 },
    // 轉回來、壓回原本的寬度，下一次掉下來才是同一個樣子
    { at: at + 0.29, actor: 'cakeB', do: 'rotateTo', amount: 200, dur: 0.01 },
    { at: at + 0.29, actor: 'cakeP', do: 'rotateTo', amount: -200, dur: 0.01 },
    { at: at + 0.29, actor: 'cakeB', do: 'stretchTo', amount: 1 / SPLAT, dur: 0.01 },
    { at: at + 0.29, actor: 'cakeP', do: 'stretchTo', amount: 1 / SPLAT, dur: 0.01 },
    { at: at + 0.3, actor: 'cakeP', do: 'scaleTo', amount: CP[k] / CP[k - 1], dur: 0.01 },
    { at: at + 0.3, actor: 'cakeB', do: 'scaleTo', amount: CB[k] / CB[k - 1], dur: 0.01 },
  )
}

/**
 * 同一個笑點：豬探長被砸（H）→ 機器人指著他大笑 → 停半拍 → 機器人也被砸（B，比較大）→ 兩個並排傻眼停住。回傳 B。
 * 第三次（k＝2）機器人笑到一半停住、抬頭，超大蛋糕先在畫面頂上露出來晃（停一拍讓他猜）。
 */
function also(H: number, k: number, g: Gag): number {
  // 蛋糕每次換大小：先在畫面外把 size 換掉（scaleTo 是累乘，所以用 CP／CB 的比例）
  splat(H, 'pig', 'cakeP', k, XP, CP[k], g)
  if (k < 2) {
    laugh(H + 0.22, 0.5, k, g)
    const B = H + 0.95
    // 停半拍：他還在笑，豬探長頂著蛋糕轉頭看他
    splat(B, 'bot', 'cakeB', k, XB, CB[k], g)
    return B
  }
  laugh(H + 0.22, 0.3, k, g)
  // 笑到一半——咦？抬頭，畫面頂上露出一個超大蛋糕在晃，他冒汗
  const look = H + 0.55
  const peek = cakeOn('bot', 'flat', XB, CB[k])
  const peekY = cakeY(17, CB[k], 'cakeB')
  g.moves.push(
    { at: look, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: look, actor: 'bot', do: 'rotateTo', amount: -8, dur: 0.15 },
    { at: look - 0.05, actor: 'cakeB', do: 'moveTo', to: { x: peek.x, y: -30 }, dur: 0.01 },
    { at: look - 0.04, actor: 'cakeB', do: 'pop', dur: 0.01 },
    { at: look, actor: 'cakeB', do: 'moveTo', to: { x: peek.x, y: peekY }, dur: 0.2, ease: 'out' },
    { at: look + 0.2, actor: 'cakeB', do: 'shake', amount: 1.2, dur: 0.5 },
  )
  g.fx.push({ at: look + 0.1, kind: 'sweat', actor: 'bot', dx: 3 })
  g.cues.push({ at: look + 0.1, sfx: 'tap' }, { at: look + 0.35, sfx: 'tap' })
  const B = look + 0.85
  g.moves.push({ at: B - 0.25, actor: 'bot', do: 'rotateTo', amount: 8, dur: 0.1 })
  splat(B, 'bot', 'cakeB', k, XB, CB[k], g, 'flat', true)
  return B
}

const g: Gag = { moves: [], fx: [], camera: [], cues: [] }
const H1 = 0.85
const B1 = also(H1, 0, g)
shakeOff(B1 + 0.5, 1, g)
const H2 = B1 + 1.1
const B2 = also(H2, 1, g)
shakeOff(B2 + 0.5, 2, g)
const H3 = B2 + 1.1
const B3 = also(H3, 2, g)

const builds: Build[] = [
  // 每次都從「機器人也被砸」的那個蛋糕飛出一筆：橫折鉤 → 豎 → 豎彎鉤
  { at: B1 + 0.06, dur: 0.5, strokes: [0], from: 'cakeB', color: partColor('也') },
  { at: B2 + 0.06, dur: 0.5, strokes: [1], from: 'cakeB', color: partColor('也') },
  { at: B3 + 0.06, dur: 0.5, strokes: [2], from: 'cakeB', color: partColor('也') },
]
const DONE = B3 + 0.56
const OFF3 = B3 + 0.5
const HOME = DONE + 0.05
const PARK = HOME + 0.8

/** 回馬槍（第四次）：「咻——」他一聽就衝到中間躲開，只有豬探長被砸；他笑得最開心——豬探長頭用力一甩，蛋糕裂兩半，一半飛到他頭上 */
const T4 = PARK + 0.05
const DODGE = T4 + 0.12
const H4 = T4 + 0.75
const C4 = 34
const SHAKE4 = H4 + 0.85
const SPLIT = SHAKE4 + 0.22
const B4 = SPLIT + 0.3
const OUT = B4 + 0.8
const ASK = OUT + 0.32

const g4: Gag = { moves: [], fx: [], camera: [], cues: [] }
splat(H4, 'pig', 'cakeP', 1, XP, C4, g4, 'fall')
laugh(H4 + 0.15, 0.6, 2, g4)
const half = cakeOn('pig', 'fall', XP, C4, 'cakeP')
const halfB = cakeOn('pig', 'fall', XP, C4, 'cakeB')
const onBot = cakeOn('bot', 'fall', XB4, C4, 'cakeB')
/** 左半塊的中心在角色 x 左邊四分之一寬 */
const QW = 0.25 * C4 * SPLAT

const clip: Clip = {
  format: 2,
  char: '也',
  meta: { theme: '天上掉蛋糕', cast: '小機器人＋豬探長＋兩個奶油蛋糕', gags: ['天上「咻——啪」掉下奶油蛋糕砸中豬探長，小機器人指著他大笑，停半拍「啪」他也被砸、而且比較大，兩個頂著一樣的蛋糕並排傻眼，一次比一次大（站著傻眼→一屁股跌坐→笑到一半抬頭看到超大蛋糕、冒汗，兩個都被壓扁）；回馬槍是他學乖了一聽到「咻」就躲開，只有豬探長中，他笑最開心，豬探長頭用力一甩，蛋糕裂兩半，一半飛到他頭上，兩個又頂著一樣的半個蛋糕並排跌坐'] },
  duration: 15,
  // 淡黃天空、草地：白奶油紅草莓的蛋糕跳得出來；字框在上方正中（背後只有天空），蛋糕從兩邊掉
  bg: { top: '#FFF1C9', bottom: '#FFFBEF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'bot', emoji: 'hero:bot/idle', x: XB, y: PB, size: SB, hidden: true, flip: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: XP, y: PP, size: SP },
    // 蛋糕畫在人上面（頂在頭上）
    { id: 'cakeP', emoji: 'prop:cake', x: XP, y: -30, size: CP[0], hidden: true, float: true },
    { id: 'cakeB', emoji: 'prop:cake', x: XB, y: -30, size: CB[0], hidden: true, float: true },
  ],
  moves: [
    // 小機器人跳出來，指著上面的字框（唸第一聲）
    { at: 0, actor: 'bot', do: 'pop', dur: 0.3 },
    { at: 0.25, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 0.25, actor: 'bot', do: 'hop', amount: 2, dur: 0.2 },
    { at: 0.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    ...g.moves,
    // 第三次以後：兩個爬起來把大蛋糕甩掉（國字要回到正中間了）
    { at: OFF3, actor: 'bot', do: 'swap', emoji: 'hero:bot/dizzy' },
    { at: OFF3, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: OFF3, actor: 'cakeB', do: 'moveTo', to: { x: -40, y: 50 }, arc: 6, dur: 0.3, ease: 'in' },
    { at: OFF3, actor: 'cakeB', do: 'rotateTo', amount: -200, dur: 0.3 },
    { at: OFF3, actor: 'cakeP', do: 'moveTo', to: { x: 200, y: 50 }, arc: 6, dur: 0.3, ease: 'in' },
    { at: OFF3, actor: 'cakeP', do: 'rotateTo', amount: 200, dur: 0.3 },
    { at: OFF3 + 0.32, actor: 'cakeB', do: 'vanish', dur: 0.01 },
    { at: OFF3 + 0.32, actor: 'cakeP', do: 'vanish', dur: 0.01 },
    { at: OFF3 + 0.34, actor: 'cakeB', do: 'rotateTo', amount: 200, dur: 0.01 },
    { at: OFF3 + 0.34, actor: 'cakeP', do: 'rotateTo', amount: -200, dur: 0.01 },
    { at: OFF3 + 0.34, actor: 'cakeB', do: 'stretchTo', amount: 1 / SPLAT, dur: 0.01 },
    { at: OFF3 + 0.34, actor: 'cakeP', do: 'stretchTo', amount: 1 / SPLAT, dur: 0.01 },
    { at: OFF3 + 0.34, actor: 'cakeP', do: 'scaleTo', amount: C4 / CP[2], dur: 0.01 },
    // 國字讓位以後站回來
    { at: PARK - 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: PARK - 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 回馬槍：「咻——」他一聽就抬頭，衝到中間躲開
    { at: T4, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: DODGE, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: DODGE, actor: 'bot', do: 'moveTo', to: { x: XB4, y: PB }, dur: 0.3, anticipate: 3, ease: 'in' },
    { at: DODGE + 0.32, actor: 'bot', do: 'swap', emoji: 'hero:bot/smug' },
    ...g4.moves,
    // 豬探長頭一甩——蛋糕裂兩半，一半「咻——啪」飛到機器人頭上
    { at: SHAKE4, actor: 'pig', do: 'tilt', amount: 14, dur: 0.22 },
    { at: SHAKE4, actor: 'pig', do: 'shake', amount: 2.2, dur: 0.22 },
    { at: SPLIT, actor: 'cakeP', do: 'swap', emoji: 'prop:cake-halves', half: 'right' },
    { at: SPLIT - 0.01, actor: 'cakeB', do: 'scaleTo', amount: C4 / CB[2], dur: 0.01 },
    { at: SPLIT - 0.01, actor: 'cakeB', do: 'stretchTo', amount: SPLAT, dur: 0.01 },
    { at: SPLIT, actor: 'cakeB', do: 'swap', emoji: 'prop:cake-halves', half: 'left' },
    { at: SPLIT, actor: 'cakeB', do: 'moveTo', to: halfB, dur: 0.01 },
    { at: SPLIT + 0.01, actor: 'cakeB', do: 'pop', dur: 0.01 },
    { at: SPLIT + 0.02, actor: 'cakeB', do: 'moveTo', to: { x: onBot.x + QW - 2, y: onBot.y - 4 }, arc: 10, dur: 0.28, ease: 'in' },
    { at: SPLIT + 0.02, actor: 'cakeB', do: 'rotateTo', amount: -360, dur: 0.28, pivot: 'center' },
    { at: B4, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall' },
    { at: B4, actor: 'bot', do: 'shake', amount: 1.4, dur: 0.2 },
    // 退場：豬探長頂著半個蛋糕跑走，機器人把頭上的甩掉
    { at: OUT, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: OUT, actor: 'pig', do: 'moveTo', to: { x: 190, y: PP }, dur: 0.3, ease: 'in' },
    { at: OUT, actor: 'cakeP', do: 'moveTo', to: { x: 190 + (half.x - XP), y: half.y }, dur: 0.3, ease: 'in' },
    { at: OUT, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: OUT, actor: 'bot', do: 'shake', amount: 1.4, dur: 0.18 },
    { at: OUT + 0.04, actor: 'cakeB', do: 'moveTo', to: { x: -40, y: 40 }, arc: 8, dur: 0.3, ease: 'in' },
    { at: OUT + 0.32, actor: 'pig', do: 'vanish', dur: 0.01 },
    { at: OUT + 0.32, actor: 'cakeP', do: 'vanish', dur: 0.01 },
    { at: OUT + 0.34, actor: 'cakeB', do: 'vanish', dur: 0.01 },
    // 問他：他站到左前方、變大，面向國字
    { at: ASK - 0.05, actor: 'bot', do: 'moveTo', to: { x: 34, y: PB + 2 }, dur: 0.25 },
    { at: ASK, actor: 'bot', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: ASK + 1.0, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: ASK + 1.0, actor: 'bot', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: ASK + 1.5, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK + 1.95, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ASK + 2.55, actor: 'bot', do: 'rotateTo', amount: -10, dur: 0.1 },
    { at: ASK + 2.55, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ASK + 2.55, actor: 'bot', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: ASK + 2.72, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: ASK + 2.72, actor: 'bot', do: 'flip' },
    { at: ASK + 2.72, actor: 'bot', do: 'moveTo', to: { x: -45, y: PB + 2 }, dur: 0.15, ease: 'in' },
  ],
  builds,
  glyph: [
    // 字框一開始就在上方正中（背後只有天空；兩邊留給掉下來的蛋糕）
    { at: 0, dur: 0, do: 'park', to: { x: 80, y: 21 }, amount: 0.5 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: { x: 80, y: 21 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的機器人
    { at: ASK, dur: 2.8, do: 'ask', keep: ['bot'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.12, dur: 0.4, do: 'home' },
    { at: ASK + 2.55, dur: 0.3, do: 'pulse' },
    { at: ASK + 3.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    ...g4.fx,
    // 回馬槍：「咻——」他一聽就嚇一跳
    { at: T4, kind: 'pop', actor: 'bot', emoji: '❗', dur: 0.45, dx: 4, scale: 1.6 },
    // 半個蛋糕砸到他
    { at: B4, kind: 'burst', x: onBot.x, y: onBot.y + 0.42 * BASE.cakeB - 0.35 * C4, emoji: '☁️', n: 8, dur: 0.45, scale: 1.1 },
    { at: B4, kind: 'burst', x: onBot.x + 22, y: onBot.y + 0.42 * BASE.cakeB - 0.2 * C4, n: 1, dur: 0.4, scale: 2.2 },
  ],
  camera: [
    // 整段保持幾乎全景（兩個人要並排比得到；也擋掉自動取景往前預看把人切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 46 } },
    ...g.camera,
    ...g4.camera,
    { at: B4, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 98, y: 50 } },
    { at: B4, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.18 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.3, say: '也' },
    ...g.cues,
    { at: HOME + 0.15, say: '也' },
    ...g4.cues,
    { at: SHAKE4, sfx: 'whoosh' },
    { at: SPLIT, sfx: 'crack' },
    { at: B4, sfx: 'plop' },
    { at: B4 + 0.02, sfx: 'bonk' },
    { at: B4 + 0.1, say: '也是' },
    { at: OUT, sfx: 'whoosh' },
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: ASK + 2.57, say: '也' },
    { at: ASK + 2.59, sfx: 'cheer' },
  ],
}

export default clip
