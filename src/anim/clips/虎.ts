import type { Camera, Clip, Cue, Fx, Light, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 虎（v2）：狐假虎威。愛現的忍者小老鼠站在森林小路中間擺忍者架式，對著走過來的動物「吱！」一聲——
// 他不知道大老虎就站在他背後。老虎跟著張大嘴「吼——！」，對面的動物嚇得跳起來、拔腿就跑；小老鼠閉眼得意：大家都怕我！
// 同一個笑點三次，來的動物一次比一次大、嚇得一次比一次誇張：小青蛙（虍的上半從老虎嘴裡吼出來）→ 大公雞（虍的下半）→
// 先停一拍：大熊走過來，小老鼠吞一口口水、還是「吱」——老虎蹲低蓄力、吼最大聲，大熊嚇得跳好高、逃走（儿從牠蹬地的腳飛出來）。
// 語詞那一刻老虎走回小老鼠背後：「老虎」。回馬槍（第四次）：小老鼠「吱！」——這次前面沒有人，他歪頭轉身一看……
// 老虎對著他的臉吼，這次被嚇跑的是他自己，跳好高、逃得比誰都快。
// 最後畫面暗下來只剩「虎」，小老鼠跑回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「虎！」，然後退場只留字。
// 刻意不跟「獅」（吼聲的風把人吹走、回馬槍是老鼠嚇獅子）撞：這支沒有風，動物是被「看到老虎」嚇跑的，小老鼠一直以為是自己。
// 虎、虎、老虎、這是什麼字？、虎

/** 小老鼠：站在中間、朝左（圖本來就朝左）背對老虎 */
const MS = 34
const MY = 77 - 0.42 * MS
const MX = 60
/** 老虎：這個字講的就是牠，畫面上最大。站在小老鼠背後（右邊）、朝左 */
const TS = 56
const TY = 77 - 0.42 * TS
const TX = 110
/** 三張老虎同一個比例；吼的那張左邊多畫了聲波線，身體往右偏，swap 時 x 往左補一點腳才對齊 */
const ROAR_DX = -0.045 * TS
/** 對面的動物：同一個角色換圖（青蛙 → 公雞 → 大熊），底子 size 寫最大的大熊，小的用 scaleTo 縮 */
const VS = 36
const VY = 77 - 0.42 * VS
const VX = 24
/** 青蛙、公雞的倍率（大熊是 1） */
const FROG = 0.5
const COCK = 0.78
/** 字框一開始就在上方偏左（老虎在右邊、頭比較高）：背後是素色的天空 */
const FRAME = { x: 64, y: 19 }
const FRAME_K = 0.46
/** 動物嚇到傻眼停多久才逃 */
const HOLD = 0.45

/** 老虎圖（0～1、朝左）上的一點：圖畫在 x（中心）、放大 s 倍時的位置 */
const tpt = (x: number, u: number, v: number, s = 1): Vec => ({ x: x + (u - 0.5) * TS * s, y: TY + (v - 0.5) * TS * s })
/** 吼的那張張大的嘴（圖上聲波線的左邊一點點） */
const MOUTH = { u: 0.12, v: 0.55 }

/** 聲波的顏色：深橘紅（老虎的顏色），淺綠的森林上看得清楚 */
const WAVE = '#C2410C'

/**
 * 聲波：從 o 往左一圈一圈打出去（每一圈晚一點出現），n 圈。每一圈是一段 ( 形的弧（三截線），上下不超過 h。
 * base 是發聲的角色那時候站的位置（line 的起點照角色位置算）。
 */
function waves(at: number, who: string, base: Vec, o: Vec, n: number, width: number, step: number, h: number, r0 = 5): Fx[] {
  const out: Fx[] = []
  for (let i = 0; i < n; i++) {
    const r = r0 + step * i
    const half = Math.min(40 * Math.PI / 180, Math.asin(Math.min(1, h / r)))
    const pts = [0, 1, 2, 3].map((j) => {
      const a = Math.PI - half + (2 * half * j) / 3
      return { x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r }
    })
    for (let j = 0; j < 3; j++) {
      out.push({ at: at + 0.06 * i, dur: 0.32, kind: 'line', actor: who, dx: pts[j].x - base.x, dy: pts[j].y - base.y,
        to: pts[j + 1], color: WAVE, width })
    }
  }
  return out
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; lights: Light[] }

/**
 * 同一個笑點：小老鼠擺架式「吱！」（一小圈聲波）→ 背後的老虎蹲低蓄力 → 「吼——！」換成張大嘴那張往前一挺：
 * 鏡頭推一下＋震、同一個吼聲（一次多疊一個音）、一圈一圈的聲波從老虎嘴裡越過小老鼠頭上打到對面 → 吼完換回站好那張（得意的臉）。
 * at 是老虎吼的那一刻，k 是第幾次（0～3，越後面越大聲：聲波圈數、粗細、推近、震動都加大），x 是老虎站的地方，
 * mx 是小老鼠站的地方，squeak 為 false 時小老鼠不吱（第四次他已經轉過身來）。
 */
function roar(at: number, k: number, x = TX, mx = MX, squeak = true): Gag {
  const crouch = k === 2 ? 0.6 : 0.3
  const rx = x + ROAR_DX
  const loud = Math.min(0.6, 0.45 + 0.08 * k)
  const moves: Move[] = [
    // 蓄力：蹲低、身體往後縮（第三次蹲特別久）
    { at: at - crouch, dur: crouch * 0.85, actor: 'tiger', do: 'squash', amount: 0.12 + 0.03 * k },
    { at: at - crouch, dur: crouch * 0.85, actor: 'tiger', do: 'rotateTo', amount: 5, ease: 'out' },
    // 吼！往前一挺、整隻變大一下
    { at, actor: 'tiger', do: 'swap', emoji: 'prop:tiger-roar' },
    { at, dur: 0.01, actor: 'tiger', do: 'moveTo', to: { x: rx, y: TY } },
    { at, dur: 0.1, actor: 'tiger', do: 'rotateTo', amount: -5, ease: 'out' },
    { at, dur: loud * 0.5, actor: 'tiger', do: 'scaleTo', amount: 1.06 + 0.03 * k, ease: 'out' },
    { at: at + loud * 0.5, dur: loud * 0.5, actor: 'tiger', do: 'scaleTo', amount: 1 / (1.06 + 0.03 * k), ease: 'inOut' },
    { at: at + 0.08, dur: loud - 0.1, actor: 'tiger', do: 'shake', amount: 0.4 + 0.15 * k },
    // 吼完：換回站好那張（本來就是得意的臉）
    { at: at + loud, actor: 'tiger', do: 'swap', emoji: 'prop:tiger' },
    { at: at + loud, dur: 0.01, actor: 'tiger', do: 'moveTo', to: { x, y: TY } },
  ]
  const fx: Fx[] = []
  const cues: Cue[] = []
  if (squeak) {
    // 小老鼠的「吱！」：一小圈細細的聲波（跟老虎的比起來小得可憐）
    moves.push(
      { at: at - crouch - 0.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
      { at: at - crouch - 0.1, actor: 'mouse', do: 'hop', amount: 2, dur: 0.18 },
    )
    const mb = { x: mx, y: MY }
    fx.push(...waves(at - crouch - 0.1, 'mouse', mb, { x: mx - 9, y: MY - 6 }, 1, 1.1, 3, 4, 4))
    cues.push({ at: at - crouch - 0.1, sfx: 'blip' })
  }
  const base = { x: rx, y: TY }
  const o = tpt(rx, MOUTH.u, MOUTH.v)
  // 聲波只在老虎嘴前一圈一圈變多（細細的、不糊成一團蓋到小老鼠）：第 1 次 2 圈、第 4 次 5 圈，越來越粗
  fx.push(...waves(at, 'tiger', base, o, 2 + k, 0.9 + 0.25 * k, 4, 5 + k, 3))
  const camera: Camera[] = [
    { at, dur: 0.35, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: 70, y: 52 } },
    { at, dur: loud, do: 'shake', amount: 0.7 + 0.45 * k },
  ]
  // 淡淡的白光：不要把主角刷白
  const lights: Light[] = [
    { at, dur: 0.04, level: -0.06 },
    { at: at + 0.04, dur: 0.2, level: 0 },
  ]
  cues.push({ at, sfx: 'rumble' })
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: at + 0.12, sfx: 'bonk' })
  return { moves, fx, camera, cues, lights }
}

/**
 * 對面的動物被嚇到：❗（一次比一次大）、跳起來傻眼停 HOLD 秒，再轉身往左邊拔腿就跑（跳得一次比一次高）。
 * at 是老虎吼的那一刻，k 是第幾次，jump 是跳多高、arc 是逃走時的弧。
 */
function flee(at: number, k: number, jump: number, arc: number): Gag {
  const go = at + HOLD
  const moves: Move[] = [
    { at, dur: HOLD, actor: 'pal', do: 'hop', amount: jump },
    { at, dur: HOLD, actor: 'pal', do: 'shake', amount: 0.8 + 0.3 * k },
    { at: go, actor: 'pal', do: 'flip' },
    { at: go, dur: 0.5 + 0.05 * k, actor: 'pal', do: 'moveTo', to: { x: -45, y: VY }, arc, ease: 'linear', anticipate: 3 },
  ]
  const fx: Fx[] = [
    { at: at + 0.02, kind: 'pop', actor: 'pal', emoji: '❗', dx: 2, dur: HOLD + 0.1, scale: 1.8 + 0.35 * k },
    { at: at + 0.1, kind: 'sweat', actor: 'pal', dx: 4 },
  ]
  return { moves, fx, camera: [], cues: [{ at: go, sfx: 'whoosh' }], lights: [] }
}

/** 小老鼠閉眼得意：他以為大家怕的是他 */
function smug(at: number, k: number): Move[] {
  return [
    { at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    { at, dur: 0.3, actor: 'mouse', do: 'hop', amount: 2 + 1.5 * k },
    { at: at + 0.3, dur: 0.4, actor: 'mouse', do: 'tilt', amount: 6, times: 2 },
  ]
}

// ---- 時間表 ----
const H1 = 2.0
const H2 = 3.95
const H3 = 6.25
const H4 = 9.95
/** 第四次：小老鼠擺架式「吱」的那一刻 */
const S4 = 9.05
const g1 = roar(H1, 0)
const g2 = roar(H2, 1)
const g3 = roar(H3, 2)
// 第四次：小老鼠已經轉過身來面對老虎，不吱
const g4 = roar(H4, 3, TX, MX, false)
const f1 = flee(H1, 0, 5, 6)
const f2 = flee(H2, 1, 10, 10)
const f3 = flee(H3, 2, 16, 14)
/** 拼好後國字放大到中間（最後一組筆畫落定之後） */
const HOME = 7.35
const PARK = HOME + 0.85
/** 語詞那一刻：老虎走回小老鼠背後 */
const WORD = PARK + 0.6
const ASK = 10.95
const ANSWER = 13.55
const AX = 34
const ASK_S = 1.35

const all = [g1, g2, g3, g4, f1, f2, f3]

const clip: Clip = {
  format: 2,
  char: '虎',
  meta: { theme: '狐假虎威：小老鼠以為大家怕他', cast: '小老鼠＋老虎＋青蛙／公雞／大熊', gags: ['小老鼠擺忍者架式對走過來的動物「吱」一聲，不知道老虎就站在他背後跟著「吼——」，動物嚇得跳起來逃走、他閉眼得意，一次比一次大隻、嚇得一次比一次誇張（青蛙→公雞→停一拍大熊）；回馬槍是前面沒人了，他轉身一看，老虎對著他的臉吼，這次被嚇跑的是他自己'] },
  duration: 15,
  // 森林小路：淡綠的天空、草地；深橘紅的聲波在淺色天空上看得清楚
  bg: { top: '#DDF0D0', bottom: '#F6FBEF', floor: '#B9D88E', scenery: 'forest' },
  actors: [
    { id: 'tiger', emoji: 'prop:tiger', x: TX, y: TY, size: TS },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: MX, y: MY, size: MS, hidden: true },
    // 對面的動物：朝右（面向小老鼠）
    { id: 'pal', emoji: 'prop:frog', x: VX, y: VY, size: VS, hidden: true, flip: true },
  ],
  moves: [
    // 開場：小老鼠「咻」地從天上跳下來，站在老虎前面（背對著牠）
    { at: 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
    { at: 0.1, dur: 0.4, actor: 'mouse', do: 'drop' },
    { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: 0.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    // 第 1 次：小青蛙跳過來
    { at: 1.0, dur: 0.01, actor: 'pal', do: 'moveTo', to: { x: -25, y: VY } },
    { at: 1.0, actor: 'pal', do: 'pop', dur: 0.01 },
    { at: 1.01, dur: 0.01, actor: 'pal', do: 'scaleTo', amount: FROG },
    { at: 1.05, dur: 0.45, actor: 'pal', do: 'moveTo', to: { x: VX, y: VY }, ease: 'out' },
    ...[1.05, 1.22, 1.39].map((at): Move => ({ at, actor: 'pal', do: 'hop', amount: 3, dur: 0.16 })),
    ...g1.moves,
    ...f1.moves,
    { at: H1 + HOLD, actor: 'pal', do: 'swap', emoji: 'prop:frog-jump' },
    ...smug(H1 + 0.55, 0),
    // 第 2 次：大公雞走過來
    { at: 3.0, actor: 'pal', do: 'swap', emoji: 'prop:rooster' },
    { at: 3.0, dur: 0.01, actor: 'pal', do: 'scaleTo', amount: COCK / FROG },
    { at: 3.0, actor: 'pal', do: 'flip' },
    { at: 3.02, dur: 0.45, actor: 'pal', do: 'moveTo', to: { x: VX, y: VY }, ease: 'out' },
    { at: 3.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    ...g2.moves,
    ...f2.moves,
    ...smug(H2 + 0.55, 1),
    // 第 3 次：大熊走過來——先停一拍：小老鼠吞一口口水，老虎蹲特別久
    { at: 5.0, actor: 'pal', do: 'swap', emoji: 'prop:bear' },
    { at: 5.0, dur: 0.01, actor: 'pal', do: 'scaleTo', amount: 1 / COCK },
    { at: 5.0, actor: 'pal', do: 'flip' },
    { at: 5.02, dur: 0.5, actor: 'pal', do: 'moveTo', to: { x: VX, y: VY }, ease: 'out' },
    { at: 5.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 5.15, dur: 0.3, actor: 'mouse', do: 'shake', amount: 0.8 },
    ...g3.moves,
    ...f3.moves,
    ...smug(H3 + 0.55, 2),
    // 老虎得意地轉身走出右邊（國字要回中央放大）；小老鼠讓到左邊
    { at: H3 + 0.75, actor: 'tiger', do: 'flip' },
    { at: H3 + 0.75, dur: 0.5, actor: 'tiger', do: 'moveTo', to: { x: 200, y: TY }, ease: 'in' },
    { at: 7.05, dur: 0.35, actor: 'mouse', do: 'moveTo', to: { x: 24, y: MY } },
    { at: HOME + 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 語詞那一刻：小老鼠走回中間擺架式，老虎從右邊悄悄走回他背後
    { at: PARK + 0.25, dur: 0.4, actor: 'mouse', do: 'moveTo', to: { x: MX, y: MY } },
    { at: PARK + 0.2, actor: 'tiger', do: 'flip' },
    { at: PARK + 0.2, dur: 0.45, actor: 'tiger', do: 'moveTo', to: { x: TX, y: TY }, ease: 'out' },
    { at: WORD + 0.1, dur: 0.4, actor: 'tiger', do: 'tilt', amount: -6 },
    // 回馬槍：第四次「吱！」——前面沒有人。他歪頭，轉身一看……
    { at: S4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
    { at: S4 + 0.1, actor: 'mouse', do: 'hop', amount: 2.5, dur: 0.18 },
    { at: S4 + 0.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    { at: S4 + 0.4, dur: 0.3, actor: 'mouse', do: 'tilt', amount: 8 },
    { at: S4 + 0.65, actor: 'mouse', do: 'flip' },
    { at: S4 + 0.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    ...g4.moves,
    // 老虎對著他的臉吼：這次被嚇跑的是他自己，跳最高、逃得最快
    { at: H4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: H4, dur: HOLD, actor: 'mouse', do: 'hop', amount: 8 },
    { at: H4, dur: HOLD, actor: 'mouse', do: 'shake', amount: 1.5 },
    { at: H4 + HOLD, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flee' },
    { at: H4 + HOLD, dur: 0.4, actor: 'mouse', do: 'moveTo', to: { x: -45, y: MY }, ease: 'in', anticipate: 4 },
    // 老虎得意地走出右邊（問字前退場）
    { at: H4 + 0.62, actor: 'tiger', do: 'flip' },
    { at: H4 + 0.62, dur: 0.3, actor: 'tiger', do: 'moveTo', to: { x: 200, y: TY }, ease: 'in' },
    // 問他：小老鼠從左邊跑回來、變大，面向國字
    { at: ASK - 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    { at: ASK - 0.1, dur: 0.01, actor: 'mouse', do: 'scaleTo', amount: ASK_S },
    { at: ASK, dur: 0.4, actor: 'mouse', do: 'moveTo', to: { x: AX, y: MY + 4 }, ease: 'out' },
    // 安靜等他回答：手放耳邊、身體前傾聽（listen），點兩下頭
    { at: 12.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/listen' },
    { at: 12.25, dur: 0.3, actor: 'mouse', do: 'rotateTo', amount: 8 },
    { at: 12.8, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.3, actor: 'mouse', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'mouse', do: 'rotateTo', amount: -8 },
    { at: ANSWER, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/point' },
    { at: ANSWER, dur: 0.25, actor: 'mouse', do: 'hop', amount: 8 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: ANSWER + 0.25, dur: 0.2, actor: 'mouse', do: 'moveTo', to: { x: -45, y: MY + 4 }, ease: 'in' },
  ],
  builds: [
    // 第 1、2 次：虍從老虎張大的嘴裡吼出來（上半、下半）
    { at: H1 + 0.05, dur: 0.55, strokes: [0, 1, 2], from: 'tiger', color: partColor('虍') },
    { at: H2 + 0.05, dur: 0.55, strokes: [3, 4, 5], from: 'tiger', color: partColor('虍') },
    // 第 3 次：大熊往後一蹬拔腿就跑，儿從蹬地的腳上飛出來
    { at: H3 + HOLD + 0.05, dur: 0.55, strokes: [6, 7], from: 'pal', color: partColor('儿') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['mouse'], to: { x: 102, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...all.flatMap((g) => g.fx),
    { at: 0.5, kind: 'puff', actor: 'mouse' },
    // 第三次前停一拍：大熊好大，小老鼠吞口水
    { at: 5.2, kind: 'sweat', actor: 'mouse', dx: -6 },
    // 回馬槍：前面怎麼沒有人？
    // 第四次也一樣「吱！」一小圈
    ...waves(S4 + 0.1, 'mouse', { x: MX, y: MY }, { x: MX - 9, y: MY - 6 }, 1, 1.1, 3, 4, 4),
    // 符號放在小老鼠左上方（字框左下外面），不疊到國字
    { at: S4 + 0.4, kind: 'pop', x: 34, y: 48, emoji: '❓', dur: 0.45, scale: 1.4 },
    { at: H4 + 0.02, kind: 'pop', x: 32, y: 48, emoji: '❗', dur: HOLD + 0.1, scale: 2.2 },
    { at: ANSWER, kind: 'burst', x: 102, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 整支拉成全景（手寫 zoom 擋住自動取景推近，推近會把右邊老虎的尾巴、左邊逃走的動物切掉）
    { at: 0, dur: 0.2, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...all.flatMap((g) => g.camera),
  ],
  lights: [
    ...all.flatMap((g) => g.lights),
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.75, say: '虎' },
    ...all.flatMap((g) => g.cues),
    { at: HOME + 0.1, say: '虎' },
    { at: WORD, say: '老虎' },
    { at: S4 + 0.1, sfx: 'blip' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '虎' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
