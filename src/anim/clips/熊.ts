import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 熊（v2）：大熊抱著蜂蜜罐在睡覺，楊捷睿想偷偷拿蜂蜜——每次手一碰到罐子，熊就在睡夢中翻個身，「咚」一聲整隻壓在他身上（還在打呼），
// 滾回去以後他被壓得扁扁的，一次比一次慘：壓扁彈起來（能的左半從熊身上震出來）、壓扁彈到畫面邊（能的右半）、
// 先停一拍（他看一眼、熊動了一下）再碰——熊跳得最高、壓得最重，地上噴出四顆火花（灬），他被彈出畫面。
// 回馬槍：熊醒了，站起來大吼——他抱頭蹲下，結果熊把蜂蜜送給他；他開心地抱住蜂蜜，熊打個哈欠倒頭又睡，咚，又把他壓扁（這次他抱著蜂蜜偷笑）。
// 最後畫面暗下來只剩「熊」，楊捷睿轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「熊！」，然後退場只留字。
// 熊、熊、熊貓、這是什麼字？、熊
const P = 66.9 // 楊捷睿（size 24）站在地上的 y
/** 大熊（prop:bear／bear-sleep／bear-roar，三張同一個比例，同 size 直接 swap）：畫面上最大的東西 */
const BEAR = 64
const BY = 77 - 0.42 * BEAR
/** 大熊睡覺的地方（畫面正中偏右，頭朝左） */
const BX = 98
/** 大熊翻身壓到他身上的地方：熊的左緣蓋過他，只露出他的腳 */
const ROLL = 68
/** 第 3 次壓得太用力，滾回去時一路滾到畫面右邊睡（國字拼好到正中央時不擋字，右邊也留給站起來吼的大熊） */
const FAR = 134
/** 蜂蜜罐（prop:honey）：放在熊的臉前面 */
const JAR = 14
const JX = 58
const JY = 77 - 0.42 * JAR
/** 熊貓（prop:panda）：語詞那一刻在畫面中間 */
const PANDA = 46
const PY = 77 - 0.42 * PANDA
/** 楊捷睿出發的地方、每次伸手碰罐子站的地方 */
const HOME = 22
const REACH = 42
/** 每一次壓在他身上多久（熊還在打呼） */
const ON = [0.3, 0.35, 0.4, 0.3]

/**
 * 「咚」：他伸手碰到蜂蜜罐 → 熊動一下（預備）→ 翻個身（滾一圈、跳起來）整隻壓在他身上 → 那一刻 💥＋鏡頭推近＋震＋同一個音效，
 * 熊壓在他身上繼續打呼 → 滾回原位，露出被壓扁的他（flat），起來傻眼停 0.4 秒。k 是第幾次（越後面越大）。
 * 回傳 up：他爬起來傻眼的時刻（之後各次各自被彈去不同的地方）。
 */
function flop(at: number, k: number, reach = true, home = BX) {
  const roll = 0.3 + 0.03 * k
  const back = at + ON[k]
  const backDur = home === BX ? 0.25 : 0.35
  const up = back + backDur + 0.2
  const moves: Move[] = [
    { at: at - 0.42, actor: 'bear', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.12 },
    { at: at - roll, actor: 'bear', do: 'moveTo', to: { x: ROLL, y: BY }, arc: 5 + 4 * k, dur: roll, ease: 'in' },
    // 翻身：整隻往他那邊歪著撲過去（不轉整圈，一直看得出是趴著的熊）
    { at: at - roll, actor: 'bear', do: 'tilt', amount: -22 - 4 * k, dur: roll },
    { at, actor: 'bear', do: 'squash', amount: 0.15 + 0.07 * k, dur: 0.3 },
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at, actor: 'yang', do: 'squash', amount: 0.3 + 0.1 * k, dur: up - at },
    // 滾回去：露出被壓扁的他
    { at: back, actor: 'bear', do: 'moveTo', to: { x: home, y: BY }, arc: home === BX ? 3 : 6, dur: backDur, ease: 'out' },
    { at: back, actor: 'bear', do: 'tilt', amount: 15, dur: backDur },
  ]
  // 前三次爬起來傻眼；第 4 次就扁扁地躺著（抱著蜂蜜偷笑）
  if (k < 3) moves.push(
    { at: up, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: up, actor: 'yang', do: 'hop', amount: 2 + k, dur: 0.25 },
  )
  if (reach) moves.unshift(
    { at: at - 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: at - 0.45, actor: 'yang', do: 'tilt', amount: 12, dur: 0.3 },
  )
  const fx: Fx[] = [
    // 💥 在熊壓下來的地方（他身上），一次比一次大；地上揚起灰塵
    { at, kind: 'burst', x: REACH + 6, y: 50, n: 1, dur: 0.4, scale: 1.6 + 0.4 * k },
    { at, kind: 'puff', x: REACH - 12, y: 72, dur: 0.4 },
    // 壓在他身上還在打呼
    { at: at + 0.08, kind: 'zzz', actor: 'bear', dx: -18, dy: 2, dur: ON[k] },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.02 * k, to: { x: REACH + 10, y: 56 } },
    { at, dur: 0.35, do: 'shake', amount: 1 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - roll, sfx: 'whoosh' }, { at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'rumble' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, cues, up }
}

const H1 = 1.6, H2 = 3.9, H3 = 6.6, H4 = 10.2
const f1 = flop(H1, 0)
const f2 = flop(H2, 1)
const f3 = flop(H3, 2, true, FAR)
// 回馬槍：熊自己倒頭睡下去（他手上抱著蜂蜜，沒有伸手）
const f4 = flop(H4, 3, false, FAR)
/** 爬起來傻眼 0.4 秒以後被彈走的時刻 */
const R1 = f1.up + 0.4, R2 = f2.up + 0.4, R3 = f3.up + 0.4
/** 回馬槍：熊醒來站起來吼、把蜂蜜送給他、倒頭又睡 */
const PICK = 8.85, ROAR = 9.1, GIVE = 9.5, NAP = 9.75
/** 問他 */
const ASK = 10.95

const clip: Clip = {
  format: 2,
  char: '熊',
  meta: { theme: '偷拿大熊的蜂蜜', cast: '楊捷睿＋大熊＋熊貓＋蜂蜜罐', gags: ['楊捷睿每次伸手碰大熊的蜂蜜罐，睡著的熊就翻個身咚地壓在他身上，一次比一次壓得重、彈得遠；回馬槍是熊醒來大吼，原來是把蜂蜜送給他，他抱著蜂蜜正開心，熊倒頭又睡、又把他壓扁'] },
  duration: 15,
  bg: { top: '#E3F1D6', bottom: '#F7FBEF', floor: '#C3DB9E', scenery: 'forest' },
  actors: [
    // 蜂蜜罐、他都畫在熊的下面：熊翻身壓上來時蓋住他（只露出腳）
    { id: 'jar', emoji: 'prop:honey', x: JX, y: JY, size: JAR },
    // 姿勢圖朝左，翻過來面向右邊的熊（問他時也面向右邊的字）
    { id: 'yang', emoji: 'hero:yang/sneak', x: HOME, y: P, size: 24, hidden: true, flip: true },
    { id: 'bear', emoji: 'prop:bear-sleep', x: BX, y: BY, size: BEAR },
    { id: 'panda', emoji: 'prop:panda', x: 84, y: PY, size: PANDA, hidden: true },
  ],
  moves: [
    // 楊捷睿踮腳溜進來，看到蜂蜜流口水
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/drool' },
    // 第 1 次：踮腳過去伸手——咚！被壓扁，彈起來轉一圈退回原地
    { at: 0.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: 0.8, actor: 'yang', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.35 },
    ...f1.moves,
    { at: R1, actor: 'yang', do: 'moveTo', to: { x: HOME, y: P }, arc: 6, dur: 0.3, ease: 'out' },
    { at: R1, actor: 'yang', do: 'spin', times: -1, dur: 0.3, pivot: 'center' },
    // 第 2 次：再踮腳過去——咚！壓得更扁，彈到畫面邊、頭暈
    { at: 3.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: 3.05, actor: 'yang', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.4 },
    ...[3.07, 3.23, 3.39].map((at): Move => ({ at, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.15 })),
    ...f2.moves,
    { at: R2, actor: 'yang', do: 'moveTo', to: { x: 12, y: P }, arc: 14, dur: 0.45, ease: 'out' },
    { at: R2, actor: 'yang', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    { at: R2 + 0.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 第 3 次：走回同一個地方伸手——先停一拍：他看一眼熊、熊動了一下……咚！跳得最高、壓得最重，他被彈出畫面
    { at: 5.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: 5.6, actor: 'yang', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.4 },
    { at: 6.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 6.0, actor: 'yang', do: 'tilt', amount: -8, dur: 0.4 },
    { at: 6.1, actor: 'bear', do: 'shake', amount: 0.6, dur: 0.15 },
    ...f3.moves,
    // 壓得太重，蜂蜜罐被震飛，掉在他旁邊（國字拼好到正中央時不擋字）
    { at: H3, actor: 'jar', do: 'moveTo', to: { x: REACH + 7, y: JY }, arc: 16, dur: 0.5, ease: 'out' },
    { at: H3, actor: 'jar', do: 'spin', times: -1, dur: 0.5, pivot: 'center' },
    { at: R3, actor: 'yang', do: 'moveTo', to: { x: -30, y: 20 }, dur: 0.45, ease: 'out' },
    { at: R3, actor: 'yang', do: 'spin', times: -3, dur: 0.45, pivot: 'center' },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓到左上，熊貓冒出來坐在正中間，他走回來看
    { at: 8.1, actor: 'panda', do: 'pop' },
    { at: 8.32, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 8.32, actor: 'yang', do: 'moveTo', to: { x: -20, y: P }, dur: 0.01 },
    { at: 8.34, actor: 'yang', do: 'moveTo', to: { x: 34, y: P }, dur: 0.25, ease: 'out' },
    { at: 8.5, actor: 'panda', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 8.62, actor: 'yang', do: 'hop', amount: 3, dur: 0.2 },
    { at: 8.85, actor: 'panda', do: 'vanish', dur: 0.15 },
    // 回馬槍（第 4 次）：熊睡在遠遠的右邊，他抱起蜂蜜——熊醒了，站起來大吼！他抱頭蹲下……熊笑著把蜂蜜讓給他
    { at: 8.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: 8.8, actor: 'yang', do: 'moveTo', to: { x: REACH, y: P }, dur: 0.2 },
    { at: PICK, actor: 'jar', do: 'moveTo', to: { x: REACH + 6, y: 58 }, dur: 0.2, ease: 'out' },
    { at: PICK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: ROAR, actor: 'bear', do: 'swap', emoji: 'prop:bear-roar' },
    { at: ROAR, actor: 'bear', do: 'hop', amount: 3, dur: 0.25 },
    { at: ROAR + 0.05, actor: 'jar', do: 'moveTo', to: { x: REACH + 9, y: JY }, dur: 0.12, ease: 'in' },
    { at: ROAR + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: ROAR + 0.05, actor: 'yang', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: GIVE, actor: 'bear', do: 'swap', emoji: 'prop:bear' },
    { at: GIVE, actor: 'bear', do: 'tilt', amount: -10, dur: 0.25 },
    { at: GIVE + 0.05, actor: 'jar', do: 'moveTo', to: { x: REACH + 6, y: 58 }, arc: 4, dur: 0.15, ease: 'out' },
    { at: GIVE + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    // 熊打個哈欠倒頭又睡——從遠遠的右邊一路撲過來，咚！又壓在他身上
    { at: NAP, actor: 'bear', do: 'swap', emoji: 'prop:bear-sleep' },
    { at: H4 - 0.2, actor: 'jar', do: 'moveTo', to: { x: REACH + 8, y: JY }, dur: 0.2, ease: 'in' },
    ...f4.moves,
    // 問他：他爬起來、走到左前方、變大，轉向觀眾
    { at: ASK, actor: 'jar', do: 'vanish', dur: 0.15 },
    // 大熊睡著滾出右邊（問他的時候畫面上只剩他和字）
    { at: ASK, actor: 'bear', do: 'moveTo', to: { x: 200, y: BY }, dur: 0.4, ease: 'in' },
    { at: ASK, actor: 'bear', do: 'tilt', amount: 15, dur: 0.4 },
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 11.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 11.95, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.5, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.0, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.55, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.55, actor: 'yang', do: 'hop', amount: 6, dur: 0.25 },
    // 退場：大熊抱著蜂蜜滾走，他揮手跑掉，畫面只留下字
    { at: 13.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.82, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：熊翻身壓下來，從牠身上震出來——能（左半 厶月、右半 匕匕）
    { at: H1 + 0.05, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'bear', color: partColor('能') },
    { at: H2 + 0.05, dur: 0.6, strokes: [6, 7, 8, 9], from: 'bear', color: partColor('能') },
    // 第 3 次：壓得最重，地上噴出四顆火花——灬（火）
    { at: H3 + 0.05, dur: 0.6, strokes: [10, 11, 12, 13], from: { x: REACH, y: 72 }, color: partColor('灬') },
  ],
  glyph: [
    { at: 7.3, dur: 0.45, do: 'home', ease: 'back' },
    // 國字讓到左上：右邊留給站起來的大熊
    { at: 8.1, dur: 0.45, do: 'park', to: { x: 34, y: 21.5 } },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: ASK, dur: 3.05, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: 13.55, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.05, kind: 'zzz', actor: 'bear', dx: -18, dy: 2, dur: 1.2 },
    // 開場：想吃蜂蜜
    { at: 0.5, kind: 'bubble', actor: 'yang', emoji: 'prop:honey', dur: 0.8 },
    ...f1.fx,
    { at: f1.up, kind: 'sweat', actor: 'yang' },
    { at: 2.5, kind: 'zzz', actor: 'bear', dx: -18, dy: 2, dur: 1.0 },
    ...f2.fx,
    { at: R2 + 0.45, kind: 'dizzy', actor: 'yang', dur: 0.4 },
    { at: 4.85, kind: 'zzz', actor: 'bear', dx: -18, dy: 2, dur: 1.0 },
    // 第 3 次前停一拍：他看一眼熊
    { at: 6.05, kind: 'pop', actor: 'yang', emoji: '👀', dur: 0.5, scale: 1.3 },
    ...f3.fx,
    { at: H3, kind: 'burst', x: REACH, y: 60, emoji: '⭐', n: 6, dur: 0.4 },
    // 熊貓
    { at: 8.1, kind: 'burst', x: 84, y: 48, emoji: '✨', n: 6, dur: 0.4 },
    // 熊醒了大吼
    { at: ROAR, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.4, scale: 1.4 },
    { at: GIVE, kind: 'burst', actor: 'bear', emoji: '💕', n: 5, dur: 0.4 },
    ...f4.fx,
    { at: H4, kind: 'burst', x: REACH, y: 60, emoji: '⭐', n: 8, dur: 0.4 },
    { at: H4 + ON[3] + 0.2, kind: 'pop', actor: 'yang', emoji: '😋', dx: -10, dur: 0.5, scale: 1.8 },
    { at: 13.55, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 自動取景會推近到他、切掉右邊的大熊：劇本自己「推近」一點點（幾乎是全景），自動取景就讓出來，整隻熊都在
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...f1.camera,
    ...f2.camera,
    ...f3.camera,
    { at: ROAR, dur: 0.4, do: 'shake', amount: 1.4 },
    ...f4.camera,
    { at: ASK - 0.2, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    // 每次熊壓下來白光一閃
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 7.3, dur: 0.05, level: -0.35 },
    { at: 7.35, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.6, say: '熊' },
    ...f1.cues,
    ...f2.cues,
    ...f3.cues,
    { at: 7.45, say: '熊' },
    { at: 8.2, say: '熊貓' },
    { at: ROAR, sfx: 'rumble' },
    { at: PICK, sfx: 'clink' },
    { at: GIVE, sfx: 'tap' },
    ...f4.cues,
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: 13.55, say: '熊' },
    { at: 13.6, sfx: 'cheer' },
  ],
}

export default clip
