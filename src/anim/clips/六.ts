import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 六（v2）：一板一眼的小機器人要幫六隻小雞拍一張排得整整齊齊的照片。每次他把六隻一隻一隻數好（一隻亮一下）、舉起相機——
// 「喀嚓！」閃光一亮，小雞就嚇得散掉，一次比一次亂：歪七扭八跳開一點 → 飛得滿畫面都是 → 冒汗想一想還是拍，六隻一起跳到他身上把他壓扁、疊成一座小山。
// 每次掉出一組筆畫：上面一點（跳最高的那隻小雞）、一橫（相機）、下面的八（從被壓扁的他身上，往左右分開）。
// 語詞「六個」：六隻小雞排回一排，一隻一隻亮過去。回馬槍：他累得坐下、相機掉在地上，六隻小雞自己排得整整齊齊，
// 最旁邊那隻叼起相機對著他——「喀嚓！」這次換他被閃得跳好高、落地當機，六隻小雞整整齊齊、一隻接一隻跳出畫面（相機一起帶走）。
// 六、六、六個、這是什麼字？、六
const BS = 38
const BY = 77 - 0.42 * BS // 小機器人站在地上的 y
/** 小機器人站的地方（左邊，面向右邊的小雞） */
const BX = 28
/** 相機拿在手上（reach 伸手那一隻） */
const HAND = { x: BX + 13, y: BY + 2 }
const CAM = 12
const CAM_FLOOR = 77 - 0.42 * CAM
/** 小雞：六隻一樣大、排一排、不重疊，一眼數得出六隻 */
const KS = 14
const KY = 77 - 0.42 * KS
const CHICKS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']
const slot = (i: number) => 62 + 15 * i

/** 一隻一隻數過去：亮一下、跳一下、嗶 */
function count(at: number, gap: number) {
  const moves: Move[] = []
  const cues: Cue[] = []
  CHICKS.forEach((c, i) => {
    moves.push(
      { at: at + gap * i, actor: c, do: 'hop', amount: 2.5, dur: 0.18 },
      { at: at + gap * i, actor: c, do: 'flash', dur: 0.25 },
    )
    cues.push({ at: at + gap * i, sfx: 'blip' })
  })
  return { moves, cues }
}

/** 散掉的樣子 */
const MESSY_DX = [-5, 3, -3, 6, -6, 4]
const MESSY_ROT = [-25, 20, 0, -20, 25, -15]
const WIDE_X = [50, 152, 88, 68, 134, 110]
const WIDE_ROT = [90, -180, 180, -90, 180, -90]
/** 疊在被壓扁的他身上：下三、中二、上一 */
const PILE = [
  { x: BX - 12, y: 66 }, { x: BX, y: 66 }, { x: BX + 12, y: 66 },
  { x: BX - 6, y: 56 }, { x: BX + 6, y: 56 },
  { x: BX, y: 46 },
]

/**
 * 「喀嚓！」：小雞排好 → 一隻一隻數 → 舉相機、抖一抖（三、二、一）→ 閃光一亮。
 * 前三次（k 0～2）：小雞嚇得散掉，一次比一次亂；他傻眼，一次比一次慘。
 * at 是閃光那一刻。回傳每一次的動作、效果、音效、鏡頭、閃光。
 */
function snap(at: number, k: number, from: number[]) {
  const moves: Move[] = []
  const fx: Fx[] = []
  const cues: Cue[] = []
  const camera: Camera[] = []
  const lights: Light[] = []
  // 排好：從上一次散掉的地方跳回自己的位置、轉正
  if (k > 0) {
    moves.push({ at: at - 1.35, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' })
    CHICKS.forEach((c, i) => {
      moves.push(
        { at: at - 1.3 + 0.04 * i, actor: c, do: 'moveTo', to: { x: slot(i), y: KY }, arc: 6, dur: 0.35, ease: 'out' },
        { at: at - 1.3 + 0.04 * i, actor: c, do: 'rotateTo', amount: -from[i], dur: 0.35 },
      )
    })
    cues.push({ at: at - 1.3, sfx: 'tap' })
  }
  // 數：一、二、三、四、五、六
  const c = count(at - 0.85, 0.07)
  moves.push(...c.moves)
  cues.push(...c.cues)
  // 舉相機、抖一抖
  moves.push(
    { at: at - 0.35, actor: 'bot', do: 'swap', emoji: 'hero:bot/reach' },
    { at: at - 0.35, actor: 'cam', do: 'moveTo', to: HAND, dur: 0.15 },
    { at: at - 0.2, actor: 'cam', do: 'shake', amount: 0.6, dur: 0.18 },
  )
  // 喀嚓！
  // 閃光淡而短（不把主角刷白），主要靠相機前面一顆亮亮的閃光星＋punch
  lights.push({ at, dur: 0.03, level: -0.28 }, { at: at + 0.03, dur: 0.07, level: 0 })
  moves.push({ at, actor: 'cam', do: 'flash', dur: 0.3 })
  fx.push(
    { at, kind: 'pop', actor: 'cam', emoji: '🌟', dx: 7, dy: 7, dur: 0.35, scale: 2 },
    { at, kind: 'burst', actor: 'cam', emoji: '✨', dx: 2, dy: 6, n: 6, dur: 0.35, scale: 1 + 0.2 * k },
  )
  camera.push({ at, dur: 0.3, do: 'punch', amount: 0.08, to: { x: HAND.x + 10, y: 60 } })
  cues.push({ at: at - 0.03, sfx: 'tap' }, { at, sfx: 'clink' })
  const r = at + 0.08
  const shock = at + 0.12
  if (k === 0) {
    // 小雞嚇得跳開一點，歪七扭八
    CHICKS.forEach((ch, i) => {
      moves.push(
        { at: r, actor: ch, do: 'moveTo', to: { x: slot(i) + MESSY_DX[i], y: KY }, arc: i === 2 ? 12 : 6, dur: 0.3, ease: 'out' },
        { at: r, actor: ch, do: 'rotateTo', amount: MESSY_ROT[i], dur: 0.3 },
      )
    })
    moves.push(
      { at: shock, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
      { at: shock, actor: 'bot', do: 'hop', amount: 4, dur: 0.3 },
      { at: shock, actor: 'cam', do: 'hop', amount: 4, dur: 0.3 },
    )
    fx.push({ at: shock, kind: 'pop', actor: 'bot', emoji: '❗', dx: 4, dur: 0.5, scale: 1.3 })
    camera.push(
      { at: r, dur: 0.4, do: 'punch', amount: 0.1, to: { x: 100, y: 62 } },
      { at: r, dur: 0.3, do: 'shake', amount: 0.6 },
    )
    cues.push({ at: r, sfx: 'boing' })
  } else if (k === 1) {
    // 小雞飛得滿畫面都是；他嚇得往後跳、跌坐
    CHICKS.forEach((ch, i) => {
      moves.push(
        { at: r + 0.03 * i, actor: ch, do: 'moveTo', to: { x: WIDE_X[i], y: KY }, arc: 24 + 4 * (i % 3), dur: 0.55, ease: 'out' },
        { at: r + 0.03 * i, actor: ch, do: 'rotateTo', amount: WIDE_ROT[i], dur: 0.55 },
      )
    })
    moves.push(
      { at: shock, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
      { at: shock + 0.1, actor: 'bot', do: 'moveTo', to: { x: BX - 8, y: BY }, arc: 8, dur: 0.32, ease: 'out' },
      { at: shock + 0.1, actor: 'cam', do: 'moveTo', to: { x: BX + 6, y: CAM_FLOOR }, arc: 10, dur: 0.4, ease: 'out' },
      { at: shock + 0.42, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall' },
    )
    fx.push({ at: shock, kind: 'pop', actor: 'bot', emoji: '❗', dx: 4, dur: 0.5, scale: 1.5 })
    camera.push(
      { at: r, dur: 0.45, do: 'punch', amount: 0.15, to: { x: 96, y: 60 } },
      { at: r, dur: 0.3, do: 'shake', amount: 1.1 },
    )
    cues.push({ at: r, sfx: 'boing' }, { at: r + 0.1, sfx: 'whoosh' }, { at: shock + 0.42, sfx: 'bonk' })
  } else {
    // 六隻一起跳到他身上，把他壓扁、疊成一座小山
    CHICKS.forEach((ch, i) => {
      moves.push({ at: r + 0.04 * i, actor: ch, do: 'moveTo', to: PILE[i], arc: 14 + 2 * i, dur: 0.4, ease: 'in' })
    })
    moves.push(
      { at: shock, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
      { at: r + 0.42, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
      { at: r + 0.42, actor: 'cam', do: 'moveTo', to: { x: BX - 17, y: CAM_FLOOR }, arc: 12, dur: 0.4, ease: 'out' },
      { at: r + 0.42, actor: 'cam', do: 'spin', pivot: 'center', times: -1, dur: 0.4 },
    )
    fx.push(
      { at: shock, kind: 'pop', actor: 'bot', emoji: '❗', dx: 4, dur: 0.35, scale: 1.7 },
      { at: r + 0.45, kind: 'burst', x: BX, y: 64, n: 1, dur: 0.4, scale: 2.2 },
      { at: r + 0.8, kind: 'dizzy', actor: 'k6', dur: 0.6 },
    )
    camera.push(
      { at: r + 0.42, dur: 0.45, do: 'punch', amount: 0.2, to: { x: BX + 12, y: 58 } },
      { at: r + 0.42, dur: 0.35, do: 'shake', amount: 1.8 },
    )
    cues.push({ at: r, sfx: 'boing' }, { at: r + 0.1, sfx: 'whoosh' }, { at: r + 0.42, sfx: 'bonk' }, { at: r + 0.48, sfx: 'crack' })
  }
  return { moves, fx, cues, camera, lights, shock }
}

const H1 = 2.0, H2 = 3.95, H3 = 6.3
const s1 = snap(H1, 0, [])
const s2 = snap(H2, 1, MESSY_ROT)
const s3 = snap(H3, 2, WIDE_ROT)
const FULL = H3 + 1.15 // 國字填滿
const PARK = FULL + 0.9
const WORD = PARK + 0.2
const H4 = WORD + 1.45 // 回馬槍的「喀嚓」
const ASK = 11.1
const ANSWER = 13.7
const wordCount = count(WORD + 0.05, 0.1)

const clip: Clip = {
  format: 2,
  char: '六',
  meta: { theme: '拍不成的六隻小雞', cast: '小機器人＋六隻小雞＋相機', gags: ['一板一眼的小機器人要幫六隻小雞拍整整齊齊的照片，每次數好六隻、相機「喀嚓」一閃，小雞就嚇得散掉，一次比一次亂（歪七扭八跳開→飛得滿畫面→六隻一起跳到他身上把他壓扁）；回馬槍是他累得坐下，六隻小雞自己排好、叼起相機對他「喀嚓」，換他被閃得跳好高、當機'] },
  duration: 15,
  bg: { top: '#FFF3D6', bottom: '#FFFAEE', floor: '#B9E3A8', scenery: 'hills' },
  actors: [
    { id: 'bot', emoji: 'hero:bot/dash', x: BX, y: BY, size: BS, flip: true, hidden: true },
    ...CHICKS.map((id, i) => ({ id, emoji: '🐥', x: slot(i), y: KY, size: KS, pivot: 'center' as const })),
    { id: 'cam', emoji: '📷', x: HAND.x, y: HAND.y + 4, size: CAM, float: true, hidden: true },
  ],
  moves: [
    // 開場：小機器人拿著相機衝進來，指著字框「六！」
    { at: 0, actor: 'bot', do: 'enter', from: { x: -20, y: BY }, dur: 0.4, ease: 'out' },
    { at: 0, actor: 'cam', do: 'enter', from: { x: -7, y: HAND.y + 4 }, dur: 0.4, ease: 'out' },
    { at: 0.45, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 0.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 第 1 次
    ...s1.moves,
    { at: s1.shock + 0.55, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 第 2 次
    ...s2.moves,
    // 爬起來、撿相機
    { at: s2.shock + 0.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/walk' },
    { at: s2.shock + 0.95, actor: 'bot', do: 'moveTo', to: { x: BX, y: BY }, dur: 0.3 },
    { at: s2.shock + 0.95, actor: 'cam', do: 'moveTo', to: { x: HAND.x, y: HAND.y + 4 }, dur: 0.3 },
    // 第 3 次前停一拍：托下巴盯著小雞、冒汗……小雞抖一抖
    { at: H3 - 1.6, actor: 'bot', do: 'swap', emoji: 'hero:bot/ponder' },
    ...CHICKS.map((ch): Move => ({ at: H3 - 0.55, actor: ch, do: 'shake', amount: 0.8, dur: 0.25 })),
    ...s3.moves,
    // 字拼好、讓位：小雞跳下來排回一排，他爬起來撿相機——六個！
    ...CHICKS.map((ch, i): Move => ({ at: PARK + 0.1 + 0.04 * i, actor: ch, do: 'moveTo', to: { x: slot(i), y: KY }, arc: 8, dur: 0.35, ease: 'out' })),
    { at: PARK + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: PARK + 0.1, actor: 'cam', do: 'moveTo', to: { x: HAND.x, y: HAND.y + 4 }, arc: 6, dur: 0.3 },
    { at: WORD, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    ...wordCount.moves,
    // 回馬槍：他累得坐下，相機掉在地上
    { at: H4 - 0.95, actor: 'bot', do: 'swap', emoji: 'hero:bot/tired' },
    { at: H4 - 0.85, actor: 'bot', do: 'swap', emoji: 'hero:bot/fall' },
    { at: H4 - 0.85, actor: 'cam', do: 'moveTo', to: { x: BX + 18, y: CAM_FLOOR }, dur: 0.25, ease: 'in' },
    // 最旁邊那隻小雞跳過去，叼起相機對著他
    { at: H4 - 0.6, actor: 'k1', do: 'moveTo', to: { x: BX + 22, y: KY }, arc: 6, dur: 0.3 },
    { at: H4 - 0.3, actor: 'cam', do: 'moveTo', to: { x: BX + 21, y: KY - 9 }, arc: 3, dur: 0.15 },
    { at: H4 - 0.2, actor: 'cam', do: 'shake', amount: 0.6, dur: 0.18 },
    { at: H4, actor: 'cam', do: 'flash', dur: 0.3 },
    // 喀嚓！換他被閃得跳好高
    { at: H4 + 0.08, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: H4 + 0.08, actor: 'bot', do: 'hop', amount: 20, dur: 0.5 },
    { at: H4 + 0.58, actor: 'bot', do: 'swap', emoji: 'hero:bot/glitch' },
    // 小雞整整齊齊：叼相機那隻跳回自己的位置
    { at: H4 + 0.3, actor: 'k1', do: 'moveTo', to: { x: slot(0), y: KY }, arc: 5, dur: 0.3 },
    { at: H4 + 0.3, actor: 'cam', do: 'moveTo', to: { x: slot(0) - 3, y: KY - 6 }, arc: 5, dur: 0.3 },
    // 拍完了：六隻一隻接一隻跳出畫面（叼相機那隻最後），問字時畫面上只剩他和國字
    ...CHICKS.map((ch, i): Move => ({ at: H4 + 0.55 + 0.05 * (5 - i), actor: ch, do: 'moveTo', to: { x: 180 + 6 * i, y: KY }, arc: 5, dur: 0.28, ease: 'in' })),
    { at: H4 + 0.8, actor: 'cam', do: 'moveTo', to: { x: 177, y: KY - 6 }, arc: 5, dur: 0.28, ease: 'in' },
    // 問他：他在左前方、變大，面向右邊的國字
    { at: ASK + 0.05, actor: 'bot', do: 'moveTo', to: { x: 30, y: BY + 2 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'bot', do: 'scaleTo', amount: 1.1, dur: 0.3 },
    { at: ASK + 0.1, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: 12.25, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: 12.25, actor: 'bot', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.8, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.25, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bot', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ANSWER, actor: 'bot', do: 'hop', amount: 7, dur: 0.25 },
    // 退場：他往左衝出去
    { at: ANSWER + 0.08, actor: 'bot', do: 'swap', emoji: 'hero:bot/dash' },
    { at: ANSWER + 0.08, actor: 'bot', do: 'flip' },
    { at: ANSWER + 0.1, actor: 'bot', do: 'moveTo', to: { x: -30, y: BY + 2 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 上面一點：跳最高的那隻小雞；一橫：相機；下面的八：從被壓扁的他身上往左右分開
    { at: s1.shock + 0.15, dur: 0.6, strokes: [0], from: 'k3', color: partColor('亠') },
    { at: s2.shock + 0.1, dur: 0.6, strokes: [1], from: 'cam', color: partColor('亠') },
    { at: s3.shock + 0.45, dur: 0.6, strokes: [2, 3], from: 'bot', color: partColor('八') },
  ],
  glyph: [
    { at: s1.shock + 0.05, dur: 0.4, do: 'wobble' },
    { at: s2.shock + 0.05, dur: 0.4, do: 'wobble' },
    { at: FULL + 0.05, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    { at: ASK, dur: 2.9, do: 'ask', keep: ['bot'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    ...s2.fx,
    // 第 3 次前停一拍
    { at: H3 - 1.5, kind: 'sweat', actor: 'bot', dur: 0.6 },
    ...s3.fx,
    // 回馬槍
    { at: H4 - 0.85, kind: 'sweat', actor: 'bot', dur: 0.5 },
    { at: H4 - 0.3, kind: 'pop', actor: 'bot', emoji: '❓', dx: 4, dur: 0.35, scale: 1.3 },
    { at: H4, kind: 'pop', actor: 'cam', emoji: '🌟', dx: -7, dy: 7, dur: 0.35, scale: 2.2 },
    { at: H4, kind: 'burst', actor: 'cam', emoji: '✨', dx: -2, dy: 6, n: 8, dur: 0.4, scale: 1.6 },
    { at: H4 + 0.08, kind: 'pop', actor: 'bot', emoji: '❗', dx: 4, dur: 0.5, scale: 1.8 },
    { at: H4 + 0.58, kind: 'burst', x: BX, y: 70, n: 1, dur: 0.4, scale: 2.2 },
    { at: ANSWER, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: H4 + 0.05, dur: 0.45, do: 'punch', amount: 0.2, to: { x: BX + 10, y: 55 } },
    { at: H4 + 0.58, dur: 0.3, do: 'shake', amount: 1.6 },
  ],
  lights: [
    ...s1.lights,
    ...s2.lights,
    ...s3.lights,
    { at: FULL + 0.05, dur: 0.05, level: -0.35 },
    { at: FULL + 0.1, dur: 0.35, level: 0 },
    { at: H4, dur: 0.03, level: -0.3 },
    { at: H4 + 0.03, dur: 0.07, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '六' },
    ...s1.cues,
    ...s2.cues,
    { at: H3 - 1.5, sfx: 'gulp' },
    ...s3.cues,
    { at: FULL + 0.1, say: '六' },
    { at: WORD, say: '六個' },
    ...wordCount.cues,
    { at: H4 - 0.85, sfx: 'bonk' },
    { at: H4 - 0.6, sfx: 'tap' },
    { at: H4 - 0.03, sfx: 'tap' },
    { at: H4, sfx: 'clink' },
    { at: H4 + 0.08, sfx: 'boing' },
    { at: H4 + 0.58, sfx: 'bonk' },
    { at: H4 + 0.55, sfx: 'whoosh' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '六' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
