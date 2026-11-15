import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 早（v2）：天還暗，楊捷睿還想睡。大公雞每次先吸一大口氣（往後仰、脹大）——「喔喔喔——！」一叫，一圈一圈的聲波打過去，
// 太陽就咻地從地平線蹦上來、天一下子變亮，他被震得彈起來，一次比一次高：坐起來傻眼（日從太陽飛上去）→
// 整個人平平地彈到半空（一橫）→ 先停一拍：公雞吸氣吸好久、他偷偷睜一隻眼發抖……直直飛到畫面頂再摔下來（一豎）。
// 每次太陽一落、天又暗下來，他就倒回去再睡。字拼好後太陽高掛，他在中間伸懶腰、揮手：早安！
// 回馬槍（第 4 次）：這次換他比公雞早起——公雞在打瞌睡，他湊過去吸一大口氣大喊，換公雞被震飛、羽毛亂飛，太陽照樣蹦上來。
// 最後畫面暗下來只剩「早」，楊捷睿轉向觀眾問「這是什麼字？」，等他回答，再跳起來指著字說「早！」，然後退場只留字。
// 早、早、早安、這是什麼字？、早
const fy = (size: number) => 77 - 0.42 * size
/** 楊捷睿：睡在左邊，跟公雞差不多大；往上彈的那一條在字框左邊，不經過字框 */
const YS = 34
const P = fy(YS)
const YX = 53
/** 大公雞（prop:rooster 朝左、抬頭張嘴），站在右邊對著楊捷睿 */
const RS = 35
const RY = fy(RS)
const RX = 118
/** 公雞的嘴（照公雞的 x、y 算；圖朝左、頭往上仰） */
const BEAK = { dx: -14, dy: -11.5 }
/** 太陽每次都從同一個地方（左上角、他的左後方）蹦上來；落下去就到畫面外，上下的路線不經過任何角色 */
const SUN = { x: 22, y: 25 }
const SUN_DOWN = { x: 22, y: 125 }
const SUN_SIZE = 28
/** 天黑的程度（0 正常、1 全黑） */
const NIGHT = 0.45
/** 語詞那一刻他走到中間、放大 */
const MX = 70
const BIG = 1.1
/** 回馬槍：他湊到公雞旁邊喊 */
const SX = 84
/** 聲波的顏色 */
const WAVE = '#FF5A00'

/**
 * 聲波：從 o 往 dir（度，0 是右、180 是左）一圈一圈打出去，n 圈，一圈比一圈大、晚一點出現。
 * 每一圈是一段 ) 形的弧（三截粗線）。base 是喊的人那時候站的位置（line 的起點照角色位置算）。
 */
function waves(at: number, who: string, base: { x: number; y: number }, o: { x: number; y: number }, dir: number, n: number, k: number): Fx[] {
  const out: Fx[] = []
  const half = 32 * Math.PI / 180
  const d = dir * Math.PI / 180
  for (let i = 0; i < n; i++) {
    const r = 5 + 5.5 * i
    const pts = [0, 1, 2, 3].map((j) => {
      const a = d - half + (2 * half * j) / 3
      return { x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r }
    })
    for (let j = 0; j < 3; j++) {
      out.push({ at: at + 0.06 * i, dur: 0.42, kind: 'line', actor: who, dx: pts[j].x - base.x, dy: pts[j].y - base.y,
        to: pts[j + 1], color: WAVE, width: 1.5 + 0.2 * k })
    }
  }
  return out
}

/**
 * 「喔喔喔——！」：喊的人先吸一大口氣（往後仰、脹大，inhale 秒）→ at 那一刻叫出來：一圈一圈的聲波＋鏡頭推近＋震＋同一個叫聲，
 * 太陽同一刻從地平線咻地蹦上來、天一下子變亮。k 是第幾次（聲波越來越多圈、震得越來越大）。
 * 前三次是公雞叫（被震的是楊捷睿）；第 4 次反過來，楊捷睿喊、公雞被震。被震起來的反應寫在劇本裡（每次不一樣大）。
 */
function crow(at: number, k: number, inhale = 0.5) {
  const rooster = k < 3
  const moves: Move[] = []
  if (rooster) {
    // 吸氣：往後仰、脹大（第 3 次吸得特別久、特別大）；叫的那一下往前一甩、縮回來
    const big = k === 2 ? 1.25 : 1.12
    moves.push(
      { at: at - inhale, actor: 'rooster', do: 'scaleTo', amount: big, dur: inhale, ease: 'out' },
      { at: at - inhale, actor: 'rooster', do: 'rotateTo', amount: k === 2 ? 18 : 12, dur: inhale, ease: 'out' },
      { at, actor: 'rooster', do: 'rotateTo', amount: k === 2 ? -18 : -12, dur: 0.1, ease: 'out' },
      { at, actor: 'rooster', do: 'scaleTo', amount: 1 / big, dur: 0.35, ease: 'elastic' },
      { at, actor: 'rooster', do: 'shake', amount: 1 + 0.3 * k, dur: 0.4 },
    )
  } else {
    // 他吸一大口氣（鼓臉）→ 大喊
    moves.push(
      { at: at - inhale, actor: 'yang', do: 'swap', emoji: 'hero:yang/blow' },
      { at: at - inhale, actor: 'yang', do: 'scaleTo', amount: 1.1, dur: inhale, ease: 'out' },
      { at: at - inhale, actor: 'yang', do: 'rotateTo', amount: -10, dur: inhale, ease: 'out' },
      { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/yawn' },
      { at, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.1, ease: 'out' },
      { at, actor: 'yang', do: 'scaleTo', amount: 1 / 1.1, dur: 0.35, ease: 'elastic' },
      { at, actor: 'yang', do: 'shake', amount: 1.2, dur: 0.4 },
    )
  }
  // 太陽咻地蹦上來（每次同一個位置、同一個大小）
  moves.push(
    { at, actor: 'sun', do: 'moveTo', to: SUN, dur: 0.16, ease: 'back' },
    { at: at + 0.16, actor: 'sun', do: 'squash', amount: 0.25, dur: 0.3 },
  )
  const from = rooster
    ? { base: { x: RX, y: RY }, o: { x: RX + BEAK.dx, y: RY + BEAK.dy }, dir: 184 }
    : { base: { x: SX, y: P }, o: { x: SX + 7, y: P - 15 }, dir: -4 }
  const fx: Fx[] = [
    ...waves(at, rooster ? 'rooster' : 'yang', from.base, from.o, from.dir, 4 + Math.min(k, 2), k),
    // 太陽四周噴出一圈光芒，一次比一次多
    { at: at + 0.1, kind: 'burst', actor: 'sun', emoji: '✨', n: 8 + 2 * k, dy: 14, dur: 0.5 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: rooster ? 45 : 96, y: 50 } },
    { at, dur: 0.35, do: 'shake', amount: 1 + 0.45 * k },
  ]
  // 天一下子亮了：從夜晚直接跳到白天（淡淡一閃，不把人刷白）
  const lights: Light[] = [
    { at, dur: 0.06, level: -0.12 },
    { at: at + 0.06, dur: 0.25, level: 0 },
  ]
  // 同一個叫聲（滑音笛往上＝喔喔喔——），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'slide' }, { at: at + 0.12, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.16, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.2, sfx: 'bonk' })
  return { moves, fx, camera, lights, cues, hit: at + 0.1 }
}

/** 太陽落下去、天又暗了 */
function sunset(at: number): { moves: Move[]; lights: Light[] } {
  return {
    moves: [{ at, actor: 'sun', do: 'moveTo', to: SUN_DOWN, dur: 0.4, ease: 'in' }],
    lights: [{ at, dur: 0.4, level: NIGHT }],
  }
}

/** 倒回去睡（頭上冒 zzz） */
function sleep(at: number): { moves: Move[]; fx: Fx[] } {
  return {
    moves: [{ at, actor: 'yang', do: 'swap', emoji: 'hero:yang/sleep' }],
    fx: [{ at: at + 0.15, kind: 'zzz', actor: 'yang', dx: 4, dur: 0.7 }],
  }
}

const C1 = 1.8, C2 = 3.5, C3 = 6.25, C4 = 10.1
const c1 = crow(C1, 0)
const n1 = sunset(2.55)
const z1 = sleep(2.7)
const c2 = crow(C2, 1)
const n2 = sunset(4.75)
const z2 = sleep(4.9)
// 第 3 次前停一拍：公雞吸氣吸好久
const c3 = crow(C3, 2, 1.0)
const HOME = 7.7
const PARK = 8.55
/** 語詞那一刻 */
const WORD = 9.0
const n4 = sunset(9.45)
const c4 = crow(C4, 3, 0.4)
const ASK = 10.85
const ANSWER = 13.4

const clip: Clip = {
  format: 2,
  char: '早',
  meta: { theme: '公雞一叫太陽就蹦上來', cast: '楊捷睿＋大公雞＋太陽', gags: ['天還暗，楊捷睿還想睡，公雞吸一大口氣「喔喔喔——」一叫，太陽就咻地蹦上來、天一下變亮，他被震得彈起來，一次比一次高（坐起來→彈到半空→飛到畫面頂再摔下來），太陽一落他又倒回去睡；回馬槍是他比公雞早起，湊到打瞌睡的公雞旁邊大喊，換公雞被震飛、羽毛亂飛，太陽照樣蹦上來'] },
  duration: 15,
  bg: { top: '#BFE3FF', bottom: '#FFF6E0', floor: '#B5D88A', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '🌞', x: SUN_DOWN.x, y: SUN_DOWN.y, size: SUN_SIZE, float: true },
    { id: 'rooster', emoji: 'prop:rooster', x: RX, y: RY, size: RS },
    // 圖朝左，翻過來面向右邊的公雞
    { id: 'yang', emoji: 'hero:yang/sleep', x: YX, y: P, size: YS, flip: true },
  ],
  moves: [
    // 開場：天還暗，他揉眼睛伸個懶腰看一眼字框……早？倒回去睡
    { at: 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/yawn' },
    { at: 1.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/sleep' },
    // 第 1 次：喔喔喔——！太陽蹦上來，他坐起來傻眼
    ...c1.moves,
    { at: c1.hit, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: c1.hit, actor: 'yang', do: 'squash', amount: -0.15, dur: 0.3 },
    ...n1.moves,
    ...z1.moves,
    // 第 2 次：整個人平平地彈到半空（還是躺著的樣子），停一下，摔下來
    ...c2.moves,
    { at: c2.hit, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: c2.hit, actor: 'yang', do: 'moveTo', to: { x: YX, y: 37 }, dur: 0.28, ease: 'out' },
    { at: c2.hit + 0.3, actor: 'yang', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: c2.hit + 0.73, actor: 'yang', do: 'moveTo', to: { x: YX, y: P }, dur: 0.22, ease: 'in' },
    { at: c2.hit + 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
    ...n2.moves,
    ...z2.moves,
    // 第 3 次前停一拍：公雞吸氣吸好久；他偷偷睜一隻眼、發抖
    { at: 5.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/peek' },
    { at: 5.5, actor: 'yang', do: 'shake', amount: 0.6, dur: 0.7 },
    ...c3.moves,
    // 直直飛到畫面頂外面，過一會兒才摔下來
    { at: c3.hit, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: c3.hit, actor: 'yang', do: 'moveTo', to: { x: YX - 7, y: 24 }, dur: 0.25, ease: 'out' },
    // 在畫面頂停住、手腳亂揮（傻眼的臉看得到），再直直摔下來
    { at: c3.hit + 0.28, actor: 'yang', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: c3.hit + 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/slip' },
    { at: c3.hit + 0.7, actor: 'yang', do: 'moveTo', to: { x: YX - 7, y: P }, dur: 0.28, ease: 'in' },
    { at: c3.hit + 0.98, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
    // 字拼好、放大到正中央時公雞往右讓開、他暈暈地往左挪開，讓位後再走回來
    { at: HOME - 0.3, actor: 'yang', do: 'moveTo', to: { x: 26, y: P }, arc: 3, dur: 0.3 },
    { at: HOME - 0.25, actor: 'rooster', do: 'moveTo', to: { x: 140, y: RY }, dur: 0.3 },
    { at: PARK + 0.1, actor: 'rooster', do: 'moveTo', to: { x: RX, y: RY }, dur: 0.35 },
    // 字拼好、放大時他坐在地上暈；語詞那一刻太陽高掛，他走到中間伸懶腰、揮手：早安！
    { at: PARK + 0.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.15, actor: 'yang', do: 'moveTo', to: { x: MX, y: P }, dur: 0.33, ease: 'out' },
    { at: PARK + 0.15, actor: 'yang', do: 'scaleTo', amount: BIG, dur: 0.4 },
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    { at: WORD + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/yawn' },
    // 回馬槍（第 4 次）：天又暗了，公雞打起瞌睡；這次他比公雞早起，踮腳湊過去
    ...n4.moves,
    { at: 9.5, actor: 'rooster', do: 'rotateTo', amount: -8, dur: 0.4 },
    { at: 9.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/sneak' },
    { at: 9.45, actor: 'yang', do: 'moveTo', to: { x: SX, y: P }, dur: 0.25 },
    ...c4.moves,
    // 公雞被震飛（羽毛亂飛），他開心地跳
    // 公雞先被震得跳起來、抖（看得到牠嚇一跳），再整隻轉著飛出畫面
    { at: C4 + 0.1, actor: 'rooster', do: 'rotateTo', amount: 14, dur: 0.1 },
    { at: C4 + 0.1, actor: 'rooster', do: 'hop', amount: 7, dur: 0.3 },
    { at: C4 + 0.1, actor: 'rooster', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: C4 + 0.4, actor: 'rooster', do: 'moveTo', to: { x: 190, y: -40 }, dur: 0.4, ease: 'in' },
    { at: C4 + 0.4, actor: 'rooster', do: 'spin', times: 2, dur: 0.4, pivot: 'center' },
    { at: C4 + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: C4 + 0.4, actor: 'yang', do: 'hop', amount: 5, dur: 0.3 },
    // 問他：太陽、公雞退場；他到左前方、變大，手放耳邊等
    { at: ASK + 0.05, actor: 'sun', do: 'vanish', dur: 0.15 },
    { at: ASK + 0.05, actor: 'rooster', do: 'vanish', dur: 0.05 },
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.3, ease: 'out' },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.15 / BIG, dur: 0.3 },
    { at: 12.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.0, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 8, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.27, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.3, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.22, ease: 'in' },
  ],
  builds: [
    // 第 1 次：日從蹦上來的太陽飛上去
    { at: C1 + 0.2, dur: 0.6, strokes: [0, 1, 2, 3], from: 'sun', color: partColor('日') },
    // 第 2 次：平平彈到半空的他 → 一橫；第 3 次：直直飛上去的他 → 一豎
    { at: c2.hit + 0.3, dur: 0.5, strokes: [4], from: 'yang', color: partColor('十') },
    { at: c3.hit + 0.12, dur: 0.45, strokes: [5], from: 'yang', color: partColor('十') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: ASK, dur: ANSWER + 0.25 - ASK, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.05, kind: 'zzz', actor: 'yang', dx: 4, dur: 0.3 },
    { at: 1.1, kind: 'zzz', actor: 'yang', dx: 4, dur: 0.5 },
    ...c1.fx,
    { at: c1.hit + 0.25, kind: 'sweat', actor: 'yang', scale: 1.3 },
    ...z1.fx,
    ...c2.fx,
    { at: c2.hit + 0.98, kind: 'dizzy', actor: 'yang', dur: 0.4 },
    ...z2.fx,
    // 停一拍：發抖冒冷汗
    { at: 5.6, kind: 'sweat', actor: 'yang', dur: 0.6, scale: 1.4 },
    ...c3.fx,
    { at: c3.hit + 1.0, kind: 'dizzy', actor: 'yang', dur: 0.6 },
    { at: WORD + 0.1, kind: 'burst', actor: 'sun', emoji: '✨', n: 8, dy: 14, dur: 0.5 },
    // 回馬槍：公雞打瞌睡；被震飛時羽毛亂飛
    { at: 9.55, kind: 'zzz', actor: 'rooster', dx: -8, dur: 0.6 },
    ...c4.fx,
    { at: C4 + 0.1, kind: 'pop', actor: 'rooster', emoji: '❗', dx: 6, dur: 0.45, scale: 1.5 },
    { at: C4 + 0.12, kind: 'burst', x: RX, y: RY - 8, emoji: '🪶', n: 10, dur: 0.6, scale: 1.4 },
    { at: C4 + 0.45, kind: 'burst', x: RX + 10, y: RY - 20, emoji: '🪶', n: 8, dur: 0.5, scale: 1.3 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.3 },
  ],
  camera: [
    // 拼字前固定全景：公雞、太陽、他隔很遠，自動取景追一個會切掉另一個；他飛到畫面頂也不會被切
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...c1.camera,
    ...c2.camera,
    ...c3.camera,
    { at: c3.hit + 0.98, dur: 0.3, do: 'shake', amount: 1.6 },
    { at: 7.4, dur: 0.2, do: 'zoom', amount: 1 },
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...c4.camera,
    { at: ASK - 0.2, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    { at: 0, dur: 0, level: NIGHT },
    ...c1.lights,
    ...n1.lights,
    ...c2.lights,
    ...n2.lights,
    ...c3.lights,
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...n4.lights,
    ...c4.lights,
  ],
  cues: [
    { at: 0.45, say: '早' },
    ...c1.cues,
    ...c2.cues,
    { at: c2.hit + 0.95, sfx: 'plop' },
    ...c3.cues,
    { at: c3.hit + 0.98, sfx: 'bonk' },
    { at: HOME + 0.1, say: '早' },
    { at: WORD, say: '早安' },
    ...c4.cues,
    { at: ASK + 0.03, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '早' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
