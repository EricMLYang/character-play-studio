import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 可（v2）：兔子女孩很有禮貌，想跳水坑之前都先舉手、歪頭問（頭上冒 ❓）「可以嗎？」——豬探長想都不想，閉眼大方地比一個大大的 👌「可！」，
// 她就開心地蹲低、跳進水坑「嘩！」濺了豬探長一身。每次都是同一個「舉手問→👌 可以→跳進去→嘩」，只有她跳得一次比一次高、水花一次比一次大：
// 小跳一下，水濺到他的腳（口從他張大的嘴巴裡飛出來）→ 高高一跳，水濺滿半身（攤平的水花變成一橫）→
// 先停一拍：她又舉手問，他看看自己一身濕、托著下巴猶豫、冒汗……還是比 👌——她跳到天上、縮成一顆球「屁股炸彈」，整片浪把他沖倒（衝上天的水柱變成豎鉤）。
// 回馬槍（第四次）：她又舉手問，他學乖了，先「啵」地撐開傘才比 👌 說「可以」。她只輕輕踩一下——沒濺起來。他鬆一口氣、得意地收傘往後一丟……
// 她偷笑、蹲低——說好「可以」了嘛：跳得比畫面還高，最大的一片浪把他整個沖出畫面，水坑的水全濺光了。
// 最後畫面暗下來只剩「可」，她跳到前面問「這是什麼字？」，手放耳邊等他回答，再跳起來指著它說「可！」，然後退場只留字。
// 可、可、可、可、可以、這是什麼字？、可
const SB = 36
const BY = 77 - 0.42 * SB // 兔子（size 36）站在地上的 y
const SP = 34
const PY = 77 - 0.42 * SP // 豬探長（size 34）
/** 她每次問的地方（面向右邊）、水坑的中心、他每次站的地方（面向左邊、看著水坑） */
const BX = 34
const PX = 80
const GX = 124
/** 水坑：地板上的一攤水（深藍底、淺藍水面、白亮邊疊成扁橢圓），一次比一次大：小水坑 → 大水坑 → 大水池 */
const PW = [9, 15, 22]
const PDY = 75
/** 👌 每次都在同一個地方：他頭的左邊（臉前面），像他比出來的。pop 畫在錨點右上 6×scale，所以錨點往左下退 */
const OKS = 3.4
const OK = { x: 104 - 6 * OKS, y: 50 + 6 * OKS }
/** 第 1、2 次潑過去的水柱（深藍粗線，在淺色天空上看得清楚） */
const JET = '#2F7FD8'
/** 被浪沖倒以後坐在那裡 */
const WASH = 135

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 舉手歪頭問「可以嗎？」 */
function ask(A: number) {
  g.moves.push(
    { at: A, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/know' },
    { at: A, actor: 'bunny', do: 'tilt', amount: 9, dur: 0.4 },
  )
  g.fx.push({ at: A + 0.05, kind: 'pop', actor: 'bunny', emoji: '❓', dx: 8, dy: 1, dur: 0.6, scale: 1.7 })
  g.cues.push({ at: A + 0.05, sfx: 'blip' })
}

/** 他大方地閉眼比 👌（每次同一個地方、同一個大小、同一個聲音） */
function ok(O: number, say?: string) {
  g.moves.push(
    { at: O, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: O, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.22 },
  )
  g.fx.push({ at: O, kind: 'pop', x: OK.x, y: OK.y, emoji: '👌', dur: 0.85, scale: OKS })
  g.cues.push({ at: O, sfx: 'tap' })
  if (say) g.cues.push({ at: O + 0.02, say })
}

/**
 * 「嘩！」落進水坑那一下：k 是第幾次（越後面越大）。水往上噴（💧 噴泉）、往他那邊潑過去（一串 💧，第三次起加 🌊），
 * 鏡頭推向他＋震，同一個 splash 音效一次比一次多疊一個音。to 是水潑到他身上的哪裡（腳→半身→整個人）。
 */
function splash(L: number, k: number, to: { x: number; y: number }) {
  g.fx.push(
    { at: L, kind: 'fountain', x: PX, y: PDY - 3, emoji: '💧', n: 8 + 4 * k, dur: 0.55 + 0.08 * k, scale: 1.5 + 0.2 * k },
    { at: L + 0.02, kind: 'blow', x: PX + 6, y: PDY - 6, to, emoji: '💧', n: 5 + 2 * k, dur: 0.4 },
    { at: L + 0.25, kind: 'burst', x: to.x - 5 * k, y: to.y + 2 * k, emoji: '💦', n: 6, dur: 0.5, scale: Math.min(1.5 + 0.3 * k, 1.8) },
  )
  // 一道道深藍的水柱從水坑潑到他身上（第 1 次低低地潑到腳、第 2 次潑滿半身）
  const m = 3 + Math.min(k, 2)
  for (let i = 0; i < m; i++) {
    const sy = (i - (m - 1) / 2) * (3 + 2 * Math.min(k, 2))
    g.fx.push({ at: L + 0.02 + 0.03 * i, kind: 'line', actor: 'pd', dx: PX + 4, dy: PDY - 2 - i, to: { x: to.x - 2, y: to.y + sy },
      color: JET, width: 1.3 + 0.5 * k, dur: 0.45 })
  }
  if (k >= 2) g.fx.push({ at: L + 0.02, kind: 'blow', x: PX + 4, y: PDY - 8, to: { x: GX - 8, y: to.y + 4 }, emoji: '🌊', n: 3, dur: 0.45, scale: 1.5 + 0.4 * (k - 2) })
  g.camera.push(
    { at: L, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: (PX + GX) / 2, y: 56 } },
    { at: L, dur: 0.3 + 0.05 * k, do: 'shake', amount: 0.7 + 0.5 * k },
  )
  g.cues.push({ at: L, sfx: 'splash' })
  if (k >= 1) g.cues.push({ at: L + 0.05, sfx: 'plop' })
  if (k >= 2) g.cues.push({ at: L + 0.1, sfx: 'whoosh' })
  if (k >= 3) g.cues.push({ at: L + 0.14, sfx: 'rumble' })
}

/** 蹲低預備，跳進水坑（低低的弧線）；回傳落水的時間 */
function hopIn(J: number, arc: number, dur: number): number {
  g.moves.push(
    { at: J, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: J, actor: 'bunny', do: 'squash', amount: 0.25, dur: 0.18 },
    { at: J + 0.18, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/jump' },
    { at: J + 0.18, actor: 'bunny', do: 'moveTo', to: { x: PX, y: BY }, arc, dur, ease: 'linear' },
  )
  return J + 0.18 + dur
}

/** 屁股炸彈：深蹲、跳到天上（leap）、縮成一顆球轉一圈掉進水坑；回傳落水的時間 */
function bomb(J: number, top: number, x0: number): number {
  const S = J + 0.25
  g.moves.push(
    { at: J, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ready' },
    { at: J, actor: 'bunny', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: S, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/leap' },
    { at: S, actor: 'bunny', do: 'moveTo', to: { x: x0 + 0.8 * (PX - x0), y: top }, dur: 0.33, ease: 'out' },
    { at: S + 0.38, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/jump' },
    { at: S + 0.38, actor: 'bunny', do: 'moveTo', to: { x: PX, y: BY }, dur: 0.24, ease: 'in' },
    { at: S + 0.36, actor: 'bunny', do: 'spin', times: 1, dur: 0.26, pivot: 'center' },
  )
  g.cues.push({ at: S, sfx: 'boing' })
  return S + 0.62
}

/** 落水以後：她開心，再跳回原來的地方 */
function back(L: number, at: number) {
  g.moves.push(
    { at: L + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at, actor: 'bunny', do: 'moveTo', to: { x: BX, y: BY }, arc: 5, dur: 0.32 },
    { at: at + 0.32, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  )
}

// 第 1 次：小跳一下，水濺到他的腳
const A1 = 0.25
ask(A1)
const O1 = A1 + 0.4
ok(O1, '可')
const L1 = hopIn(O1 + 0.3, 7, 0.32)
splash(L1, 0, { x: GX - 6, y: 70 })
back(L1, L1 + 0.45)

// 第 2 次：高高一跳，水濺滿半身
const A2 = L1 + 0.8
ask(A2)
const O2 = A2 + 0.4
ok(O2, '可')
const L2 = hopIn(O2 + 0.3, 18, 0.42)
splash(L2, 1, { x: GX - 4, y: 56 })
back(L2, L2 + 0.45)

// 第 3 次：她又舉手問——先停一拍：他看看自己一身濕、托下巴猶豫、冒汗……還是 👌。屁股炸彈，整片浪把他沖倒
const A3 = L2 + 0.8
ask(A3)
const O3 = A3 + 0.95
ok(O3, '可')
const L3 = bomb(O3 + 0.3, 17, BX)
splash(L3, 2, { x: GX, y: 48 })
back(L3, L3 + 0.28)
const DONE = L3 + 0.52
const HOME = DONE + 0.05
const PARK = HOME + 0.87

// 回馬槍（第四次）：撐好傘才比 👌 說「可以」；她只輕輕踩一下，他收傘往後一丟——她才真的跳
const A4 = PARK + 0.2
const U = A4 + 0.25
const O4 = U + 0.3
ask(A4)
ok(O4, '可以')
const T4 = O4 + 0.6 // 輕輕踩進水坑
const CLOSE = T4 + 0.15
const TOSS = CLOSE + 0.15
const J4 = TOSS + 0.05
const L4 = bomb(J4, 8, PX)
splash(L4, 3, { x: GX + 2, y: 44 })
const ASK = L4 + 0.5

/**
 * 一攤水：從中心往兩邊長開（每一層是中心往左、往右兩段線），深藍底＋淺藍水面＋白亮邊，疊成有厚度的扁橢圓。
 * k 是第幾攤（0 小水坑、1 大水坑、2 大水池）；最後那一跳把水全濺光（回馬槍落水時收掉）。
 */
function puddle(from: number, to: number, k: number): Fx[] {
  const w = PW[k], d = to - from
  const layer = (hw: number, y: number, color: string, width: number): Fx[] => [-1, 1].map((side): Fx => (
    { at: from, dur: d, kind: 'line', actor: 'pd', dx: PX, dy: y, to: { x: PX + side * hw, y }, color, width }))
  return [
    ...layer(w, PDY, '#2F7FD8', 3.2 + 0.6 * k),
    ...layer(w - 1.6, PDY - 0.7 - 0.2 * k, '#7CC2F2', 2.2 + 0.5 * k),
    { at: from, dur: d, kind: 'line', actor: 'pd', dx: PX - 0.55 * w, dy: PDY - 1.3 - 0.3 * k, to: { x: PX + 0.1 * w, y: PDY - 1.3 - 0.3 * k }, color: '#EAF7FF', width: 0.8 },
  ]
}

const clip: Clip = {
  format: 2,
  char: '可',
  meta: { theme: '有禮貌的兔子女孩問「可以嗎？」', cast: '兔子女孩＋豬探長＋水坑＋雨傘', gags: ['兔子女孩每次先舉手歪頭問「可以嗎？」，豬探長想都不想比 👌「可！」，她就跳進水坑「嘩」濺他一身，一次比一次跳得高、濺得大（濺到腳→濺滿半身→停一拍他猶豫冒汗還是 👌，屁股炸彈的浪把他沖倒）；回馬槍是他先撐好傘才說「可以」，她只輕輕踩一下，他鬆口氣收傘一丟——她才真的跳，最大的浪把他沖出畫面'] },
  duration: ASK + 3.9,
  // 淡藍天空、草地：太陽在右上，字框放左上（背後只有天空）
  bg: { top: '#DCEFFF', bottom: '#F5FAFF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    // 水坑的錨點（看不見），線條效果用舞台座標畫
    { id: 'pd', emoji: '⭐', x: 0, y: 0, size: 10, hidden: true },
    { id: 'pig', emoji: 'hero:pig/idle', x: GX, y: PY, size: SP, hidden: true },
    { id: 'umb', emoji: '☂️', x: GX - 3, y: PY - 20, size: 26, hidden: true, pivot: 'center' },
    { id: 'bunny', emoji: 'hero:bunny/idle', x: BX, y: BY, size: SB, flip: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'bunny', do: 'pop', dur: 0.25 },
    { at: 0, actor: 'pig', do: 'pop', dur: 0.25 },
    ...g.moves,
    // 第 1、2 次：被濺到，傻眼
    { at: L1 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: L1 + 0.05, actor: 'pig', do: 'hop', amount: 3, dur: 0.25 },
    { at: L1 + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: L2 + 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: L2 + 0.05, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: L2 + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 第 3 次前停一拍：看看自己一身濕，托下巴猶豫
    { at: A3 + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: A3 + 0.4, actor: 'pig', do: 'tilt', amount: -8, dur: 0.45 },
    { at: A3 + 0.42, actor: 'bunny', do: 'tilt', amount: 9, dur: 0.4 },
    // 她跳上天：他傻眼，浪來了把他沖倒、坐在右邊
    { at: O3 + 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: L3 + 0.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/slip' },
    { at: L3 + 0.1, actor: 'pig', do: 'moveTo', to: { x: WASH, y: PY }, dur: 0.3, ease: 'out' },
    { at: L3 + 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 國字回到正中央時，他爬起來走回原來的地方
    { at: HOME + 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: HOME + 0.55, actor: 'pig', do: 'moveTo', to: { x: GX, y: PY }, dur: 0.4 },
    // 回馬槍：他學乖了，「啵」撐開傘才比 👌
    { at: U, actor: 'umb', do: 'pop', dur: 0.2 },
    { at: U, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
    // 她只輕輕踮腳踩一下
    { at: O4 + 0.35, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/sneak' },
    { at: O4 + 0.35, actor: 'bunny', do: 'moveTo', to: { x: PX, y: BY }, dur: 0.35 },
    { at: T4, actor: 'bunny', do: 'hop', amount: -1, dur: 0.15 },
    // 沒濺起來：他鬆一口氣，收傘、往後一丟
    { at: CLOSE - 0.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: CLOSE, actor: 'umb', do: 'swap', emoji: '🌂' },
    { at: TOSS, actor: 'pig', do: 'swap', emoji: 'hero:pig/throw' },
    { at: TOSS, actor: 'umb', do: 'moveTo', to: { x: 190, y: 10 }, dur: 0.35, ease: 'out' },
    { at: TOSS, actor: 'umb', do: 'spin', times: 2, dur: 0.35 },
    { at: TOSS + 0.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 她偷笑一下、蹲低……跳上天：他傻眼——最大的一片浪把他沖出畫面
    { at: T4 + 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/giggle' },
    { at: J4 + 0.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: L4 + 0.08, actor: 'pig', do: 'swap', emoji: 'hero:pig/slip' },
    { at: L4 + 0.08, actor: 'pig', do: 'moveTo', to: { x: 200, y: PY - 6 }, dur: 0.35, ease: 'in' },
    { at: L4 + 0.08, actor: 'pig', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
    { at: L4 + 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    // 問他：她跳到右前方、變大，面向國字
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK - 0.3, actor: 'bunny', do: 'moveTo', to: { x: 124, y: BY + 2 }, arc: 4, dur: 0.25 },
    { at: ASK, actor: 'bunny', do: 'flip' },
    { at: ASK, actor: 'bunny', do: 'scaleTo', amount: 1.35, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: ASK + 1.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: ASK + 1.05, actor: 'bunny', do: 'rotateTo', amount: -10, dur: 0.3 },
    { at: ASK + 1.55, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK + 2.0, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ASK + 2.52, actor: 'bunny', do: 'rotateTo', amount: 10, dur: 0.1 },
    { at: ASK + 2.52, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ASK + 2.52, actor: 'bunny', do: 'hop', amount: 5, dur: 0.15 },
    // 退場，畫面只留下字
    { at: ASK + 2.68, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ASK + 2.68, actor: 'bunny', do: 'flip' },
    { at: ASK + 2.68, actor: 'bunny', do: 'moveTo', to: { x: 205, y: BY + 2 }, dur: 0.13, ease: 'in' },
  ],
  builds: [
    // 第 1 次：他嚇得張大嘴，口從嘴巴裡飛出來
    { at: L1 + 0.1, dur: 0.5, strokes: [1, 2, 3], from: 'pig', color: partColor('口') },
    // 第 2 次：攤平的水花變成一橫
    { at: L2 + 0.1, dur: 0.5, strokes: [0], from: { x: PX, y: PDY - 6 }, color: partColor('丁') },
    // 第 3 次：衝上天的水柱變成豎鉤
    { at: L3 + 0.05, dur: 0.45, strokes: [4], from: { x: PX, y: PDY - 20 }, color: partColor('丁') },
  ],
  glyph: [
    // 字框一開始就在左上角（背後只有天空；右邊留給豬探長和 👌）
    { at: 0, dur: 0, do: 'park', to: { x: 30, y: 25 }, amount: 0.48 },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    // 先往上、再往左（不從她頭上斜斜掃過去）
    { at: PARK, dur: 0.2, do: 'park', to: { x: 80, y: 25 }, amount: 0.48 },
    { at: PARK + 0.2, dur: 0.22, do: 'park', to: { x: 30, y: 25 }, amount: 0.48 },
    // 問他：國字稍微偏左、縮一點，右前方讓給變大的兔子（她從水坑往右跳，不跟國字交錯）
    { at: ASK, dur: 2.75, do: 'ask', keep: ['bunny'], to: { x: 60, y: 43 }, amount: 0.82 },
    { at: ASK + 0.12, dur: 0.4, do: 'home' },
    { at: ASK + 2.52, dur: 0.3, do: 'pulse' },
    { at: ASK + 3.0, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 水坑：從頭到尾都在，最後那一跳把水全濺光
    ...puddle(-0.2, A2 + 0.05, 0),
    ...puddle(A2 - 0.05, A3 + 0.05, 1),
    ...puddle(A3 - 0.05, L4 + 0.1, 2),
    ...g.fx,
    // 第 1、2 次：他身上滴水
    { at: L1 + 0.4, kind: 'rain', actor: 'pig', dy: 22, n: 4, dur: 0.6 },
    { at: L2 + 0.4, kind: 'rain', actor: 'pig', dy: 8, n: 6, dur: 0.8 },
    // 停一拍：猶豫、冒汗
    { at: A3 + 0.5, kind: 'sweat', actor: 'pig', dx: -12 },
    { at: L3 + 0.45, kind: 'dizzy', actor: 'pig', dur: 0.7 },
    // 回馬槍：踩一下，只有一小滴
    { at: T4, kind: 'burst', x: PX, y: PDY - 2, emoji: '💧', n: 3, dur: 0.35, scale: 0.6 },
    { at: CLOSE, kind: 'sweat', actor: 'pig', dx: -12 },
  ],
  camera: [
    // 整段保持幾乎全景（擋掉自動取景往前預看、把跳上天的她切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.03, to: { x: 80, y: 46 } },
    ...g.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.18 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...g.cues,
    { at: HOME + 0.15, say: '可' },
    // 水坑變大（她挑了更大的一攤）
    { at: A2 - 0.05, sfx: 'bubble' },
    { at: A3 - 0.05, sfx: 'bubble' },
    { at: U, sfx: 'poof' },
    { at: T4, sfx: 'tap' },
    { at: TOSS, sfx: 'whoosh' },
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: ASK + 2.54, say: '可' },
    { at: ASK + 2.56, sfx: 'cheer' },
  ],
}

export default clip
