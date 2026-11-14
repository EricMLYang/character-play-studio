/**
 * 動畫短片：一份劇本（Clip）＋ 一個「給時間 t 算出畫面」的純函式。
 * 不靠 CSS 動畫或計時器，畫面完全由 t 決定，所以可以拖曳、定格、截圖驗證，
 * 劇本之後也能交給 AI 寫（就是一份 JSON），不必再生影片。
 *
 * 舞台座標：160 × 90（16:9），地板大約在 y = 74。國字置中，高 63（約七成畫面）；劇本可以用 glyph 的 park 讓它縮小讓到上方、home 再回來。
 */

import { PROP_BOX } from './props'
export { PROP_BOX }

export type Vec = { x: number; y: number }

export type Scenery = 'hills' | 'city' | 'ocean' | 'space' | 'snow' | 'desert' | 'room' | 'night' | 'forest' | 'track' | 'sea'

export type Actor = {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  /** 一開始看不到，要等 enter／pop／drop 才出場 */
  hidden?: boolean
  /** 左右翻面（emoji 預設大多朝左） */
  flip?: boolean
  /** 飄在空中的東西（雲、閃電）：地上不畫影子 */
  float?: boolean
  /** 畫在關燈的黑幕上面（黑暗中發亮的眼睛） */
  top?: boolean
  /** CSS filter，例如把熊染黑：brightness(.45) */
  tint?: string
  /**
   * 旋轉的支點。沒寫是腳底（站著的角色翻倒、側躺）；'center' 是自己的中心：
   * 會滾的東西（雪球、球、輪子、陀螺）rotateTo／spin／tilt 都原地轉，不會繞著底部甩、也不會轉進地板。
   */
  pivot?: 'center'
}

/** 會留下結果的動作（位置、大小、角度、出場、退場、換造型）。 */
type Lasting = 'enter' | 'pop' | 'drop' | 'vanish' | 'moveTo' | 'scaleTo' | 'stretchTo' | 'rotateTo' | 'swap' | 'flip' | 'tint'
/** 做完就回原狀的動作。 */
type Passing = 'hop' | 'bounce' | 'squash' | 'shake' | 'spin' | 'tilt' | 'flash'

/**
 * 緩動：inOut（預設，慢起慢停）、out（衝出去然後煞車）、in（慢慢加速）、linear（等速，機械）、
 * back（衝過頭再彈回來：跟隨動作）、bounce（落地彈幾下）、elastic（像橡皮筋晃到停）。
 */
export type Ease = 'inOut' | 'in' | 'out' | 'linear' | 'back' | 'bounce' | 'elastic'

export type Move = {
  at: number
  dur?: number
  actor: string
  do: Lasting | Passing
  /** moveTo／enter／scaleTo／stretchTo／rotateTo 的緩動方式 */
  ease?: Ease
  /** moveTo／enter：出發前先往反方向縮這麼遠再衝出去（預備動作），單位是舞台距離，3～6 就很明顯 */
  anticipate?: number
  /** moveTo 的終點 */
  to?: Vec
  /** enter 的起點（預設從左邊外面進來） */
  from?: Vec
  /** moveTo／enter 中途往上拋多高 */
  arc?: number
  /** hop／bounce 的高度、shake 的幅度、tilt／rotateTo 的角度、scaleTo 的倍率、squash 的力道（負的是拉長）、
   *  stretchTo 的寬度倍率（高度同時變成 1／amount：2 是壓成寬扁的一堆、0.5 是拉成細高；以腳底為準、會累乘、留下結果） */
  amount?: number
  /** bounce／spin 的次數 */
  times?: number
  /** swap 換成的 emoji */
  emoji?: string
  /** tint 換成的 CSS filter（空字串＝拿掉） */
  filter?: string
  /** rotateTo／spin／tilt 這一次的支點，蓋過角色的 pivot：'center' 原地空中轉一圈、'feet' 從腳底翻倒 */
  pivot?: 'center' | 'feet'
}

/** 一組筆畫組合出來：從某個角色（或某個點）飛過去，或從上面掉下來。 */
export type Build = {
  at: number
  dur: number
  strokes: number[]
  from: string | Vec
  style?: 'fly' | 'drop'
  color: string
}

export type Cue =
  | { at: number; say: string }
  | { at: number; sfx: 'crack' | 'boing' | 'clink' | 'gulp' | 'rumble' | 'bubble' | 'poof' | 'plop' | 'cheer' | 'tap'
      | 'bonk' | 'whoosh' | 'slide' | 'deflate' | 'splash' | 'hic' | 'blip' | 'laser' | 'achoo' }

/**
 * 國字的效果。wobble／pulse／shake 做完就回原狀。
 * 會留下結果的「讓位」：park 在 dur 內把國字縮到 amount 倍（預設 0.55）、移到 to（國字中心，預設畫面上方正中 {80, 21}），
 * 把畫面中央讓給角色演語詞與回馬槍；home 在 dur 內回到正中央原本的大小（結尾 pulse 前一定要回來）。
 * 國字拼好後至少停 0.8 秒才能 park（anim:check 會擋），讓小孩先看清楚整個字。
 *
 * ask（問他，v2 片型）：dur 這段時間畫面暗下來（約五成），國字回到正中央原本的大小、畫在黑幕上面亮著、輕輕晃；
 * 結束後回到原本的位置（要結尾留在正中央，就在 ask 裡面寫 home）。標了 top 的角色、keep 列的角色也畫在黑幕上面
 * （明星轉向觀眾問「這是什麼字？」；用 keep 不用 top，是因為 top 的角色整支都沒有自動質感）。
 * 明星要站到前面、變大時，to（國字中心）／amount（倍率）可以讓國字在 ask 時稍微偏一邊、縮一點，空出位置給明星。
 */
export type GlyphFx =
  | { at: number; dur: number; do: 'wobble' | 'pulse' | 'shake' }
  | { at: number; dur: number; do: 'park'; to?: Vec; amount?: number; ease?: Ease }
  | { at: number; dur: number; do: 'home'; ease?: Ease }
  | { at: number; dur: number; do: 'ask'; keep?: string[]; to?: Vec; amount?: number }

/**
 * 漫畫效果：跟著角色的頭（或指定的點）走。
 * burst 爆開一圈、dizzy 頭上轉星星、bubble 想法泡泡、sweat 冒汗、puff 腳邊揚塵、
 * zzz 睡著、pop 頭上冒一個符號（❗❓💡❤️）、rain 往下灑、zap 從 actor 劈一道閃電到 target、fountain 從頭頂噴泉、
 * stink 綠色臭味線往上飄（錨點在角色中心）、line 從 actor 拉一條線到 target 或 to（蜘蛛絲、雷射光）、
 * beam 從 actor 往下打一道牽引光束到地板（飛碟）。
 * blow 從 actor 的頭（加 dx／dy，例如嘴巴）往 target（或 to）吹一串 💨：哈欠、吹氣、噴嚏把人吹走。
 * swoosh 以 actor 的頭（加 dx／dy，例如尾巴根）為中心、半徑 n（預設 12），一段弧往 target（或 to）那一側掃過去：
 * 尾巴拍人、揮棒、甩鞭。color／width 是顏色與粗細（預設白色細線，像風切）；寫成跟角色同色、粗一點，看起來就是那條尾巴。
 * windup（秒）：先往反方向翹起來停這麼久（預備動作），再甩過去。同一個笑點每次用同一個 swoosh，「又來了」才看得出來。
 */
export type Fx = {
  at: number
  dur?: number
  kind: 'burst' | 'dizzy' | 'bubble' | 'sweat' | 'puff' | 'zzz' | 'pop' | 'rain' | 'zap' | 'fountain' | 'stink' | 'line' | 'beam' | 'blow' | 'swoosh'
  actor?: string
  /** zap／line 打到誰 */
  target?: string
  /** line 打到哪一點（沒有 target 時） */
  to?: Vec
  /** line 的顏色與粗細 */
  color?: string
  width?: number
  /** 錨點再偏移一點（例如雲在畫面頂端，符號要放旁邊才不會被切掉） */
  dx?: number
  dy?: number
  x?: number
  y?: number
  emoji?: string
  n?: number
  /** 整個效果放大幾倍（以錨點為中心）：想法泡泡要看清楚裡面畫什麼時用，例如 1.8。沒寫是 1 */
  scale?: number
  /** swoosh 掃過幾度（預設 110：從頭頂掃到對方那一側）；200 以上就是從另一邊繞過頭頂掃過來 */
  sweep?: number
  /** swoosh 甩之前先往反方向翹起來停幾秒（預備動作，0.15～0.2 在 0.25 秒一格的總覽上就看得到）；dur 要把它算進去 */
  windup?: number
  /** swoosh 上下顛倒：從下面（後下方）往前甩，像踢腿、下勾拳。中心用 dx／dy 對到屁股 */
  low?: boolean
}

/**
 * 鏡頭。做完就回原狀：punch 往某一點推近再退回（笑點用）、shake 震一下（撞到、打雷）。
 * 會留下結果（維持到下一個 zoom／follow）：zoom 在 dur 內推到 amount 倍並停住，中心是 to 或 actor（amount 1 就是回到全景）；
 * follow 跟拍：鏡頭一直對著那個角色走（amount 是倍率，預設 1.5）。鏡頭永遠不會推出畫好的背景外面。
 */
export type Camera =
  | { at: number; dur: number; do: 'punch' | 'shake'; amount?: number; to?: Vec }
  | { at: number; dur: number; do: 'zoom'; amount?: number; to?: Vec; actor?: string }
  | { at: number; dur: number; do: 'follow'; actor: string; amount?: number }

/** 燈光：level 0 正常、1 全黑、負數是白色閃光（-1 整片白，相機閃光燈），在 dur 內漸變過去。 */
export type Light = { at: number; dur: number; level: number }

export type Clip = {
  /**
   * 片型。沒寫是 v1（國字在後半段才在正中央拼起來）。2 是 v2「字是主角」（docs/clip-v2-plan.md）：
   * 國字從第一格就以「空的字框」（淡淡的輪廓）停在畫面上方（等同 park），筆畫飛上去填進字框；
   * 第一聲唸字時字框亮一下；填滿後劇本用 home 放大到正中央，之後照舊可 park／home；可以用 glyph 的 ask 問他。
   */
  format?: 2
  /** 這支演的國字。故事屋的場景（src/story/scenes/）沒有國字：char 是空字串、builds 是空陣列，引擎就整支當成「國字還沒開始拼」 */
  char: string
  /**
   * 這支用了什麼卡司、主題、笑點套路。寫成一行，scripts/anim-candidates.mjs 會列出來，
   * 新劇本要避開最近用過的組合，不要每支都長一樣。
   */
  meta?: { theme: string; cast: string; gags: string[] }
  duration: number
  /** scenery：背景場景，沒寫就是 hills（小丘＋雲） */
  bg: { top: string; bottom: string; floor: string; scenery?: Scenery }
  actors: Actor[]
  moves: Move[]
  builds: Build[]
  cues: Cue[]
  glyph?: GlyphFx[]
  fx?: Fx[]
  camera?: Camera[]
  lights?: Light[]
}

export type ActorState = {
  id: string; emoji: string; size: number; flip: boolean; float: boolean; top: boolean; tint?: string
  x: number; y: number; s: number; sx: number; sy: number; r: number; o: number
  /** r 裡面以自己中心為支點轉的那一部分（Actor／Move 的 pivot: 'center'）；其餘 r − rc 以腳底為支點 */
  rc: number
  /** 身體往左右歪（度，正的是頭往右）：以腳底為支點的斜切，像果凍一樣上半身晚一點跟上；引擎自動加的 */
  lean: number
  visible: boolean; glow: number
}

// ---------- 緩動 ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, e: number) => a + (b - a) * e
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)
export const backOut = (p: number) => { const c = 1.9; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2 }
export const bounceOut = (p: number) => {
  const n = 7.5625, d = 2.75
  if (p < 1 / d) return n * p * p
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375
  return n * (p -= 2.625 / d) * p + 0.984375
}

const elasticOut = (p: number) => (p === 0 || p === 1 ? p : 2 ** (-10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1)
const EASES: Record<Ease, (p: number) => number> = {
  inOut: easeInOut, in: (p) => p * p * p, out: (p) => 1 - (1 - p) ** 3, linear: (p) => p, back: backOut, bounce: bounceOut, elastic: elasticOut,
}
export const easeBy = (e?: Ease) => EASES[e ?? 'inOut']

const DEFAULT_DUR: Record<Move['do'], number> = {
  enter: 0.6, pop: 0.35, drop: 0.6, vanish: 0.25, moveTo: 0.5, scaleTo: 0.4, stretchTo: 0.4, rotateTo: 0.25, swap: 0,
  flip: 0, tint: 0,
  hop: 0.4, bounce: 0.8, squash: 0.25, shake: 0.5, spin: 0.5, tilt: 0.35, flash: 0.6,
}
export const durOf = (m: Move) => m.dur ?? DEFAULT_DUR[m.do]

/**
 * 時間 t 時每個角色長什麼樣。動作依開始時間套用，後面的動作接著前面的結果。
 * 劇本寫的動作之外，引擎會再自動加上卡通的質感（角色放大一點、走路的步伐、換姿勢的彈一下、
 * 急停往前傾、落地壓扁、站著等的小動作、唸字那一拍點頭），規則在下面「自動質感」。
 */
export function actorsAt(clip: Clip, t: number): ActorState[] {
  const life = lifeOf(clip)
  return clip.actors.map((a) => {
    const st = baseActor(clip, a, t)
    applyLife(st, life.get(a.id)!, t)
    return st
  })
}

/** 只有劇本寫的動作（加上角色放大），沒有自動質感。自動質感本身、鏡頭自動取景用這個算。 */
export function baseActorsAt(clip: Clip, t: number): ActorState[] {
  return clip.actors.map((a) => baseActor(clip, a, t))
}

/** 劇本的動作依開始時間排好；同一份劇本只排一次。 */
const sortedCache = new WeakMap<Clip, { n: number; moves: Move[] }>()
function sortedMoves(clip: Clip): Move[] {
  const hit = sortedCache.get(clip)
  if (hit && hit.n === clip.moves.length) return hit.moves
  const moves = [...clip.moves].sort((a, b) => a.at - b.at)
  sortedCache.set(clip, { n: clip.moves.length, moves })
  return moves
}

function baseActor(clip: Clip, a: Actor, t: number): ActorState {
  const st = rawActor(clip, a, t)
  castUp(st, castFactor(clip))
  return st
}

/** 劇本寫的動作算出來的樣子（還沒放大）。 */
function rawActor(clip: Clip, a: Actor, t: number): ActorState {
  const st: ActorState = {
    id: a.id, emoji: a.emoji, size: a.size, flip: !!a.flip, float: !!a.float, top: !!a.top, tint: a.tint,
    x: a.x, y: a.y, s: 1, sx: 1, sy: 1, r: 0, rc: 0, lean: 0, o: 1, visible: !a.hidden, glow: 0,
  }
  // stretchTo 留下的寬扁（寬 ×w、高 ÷w），最後才乘進 sx／sy；沒寫 stretchTo 的劇本一格都不變
  let w = 1
  for (const m of sortedMoves(clip)) {
    if (t < m.at) break
    if (m.actor !== a.id) continue
    const d = durOf(m)
    const p = d > 0 ? clamp((t - m.at) / d) : 1
    const live = t <= m.at + d
    // 預備動作：前 22% 往反方向縮，之後才真的出發
    const ant = (m.do === 'moveTo' || m.do === 'enter') && m.anticipate ? m.anticipate : 0
    const pm = ant ? clamp((p - 0.22) / 0.78) : p
    const e = easeBy(m.ease)(pm)
    const arcUp = (m.arc ?? 0) * Math.sin(Math.PI * pm)
    const pull = ant ? ant * Math.sin(Math.PI * clamp(p / 0.22)) : 0
    // 消失過的角色重新出場：大小與透明度從頭算，不然會被 vanish 留下的 0 卡住
    if ((m.do === 'enter' || m.do === 'pop' || m.do === 'drop') && !st.visible) { st.s = 1; st.o = 1; w = 1 }
    // 旋轉：r 是總角度，以中心為支點的那部分另外記在 rc，播放器分兩段轉
    const centered = (m.pivot ?? (a.pivot === 'center' ? 'center' : 'feet')) === 'center'
    const turn = (deg: number) => { st.r += deg; if (centered) st.rc += deg }
    switch (m.do) {
      case 'enter': {
        const from = m.from ?? { x: -15, y: st.y }
        st.visible = true
        const dir = unit(from, { x: st.x, y: st.y })
        st.x = lerp(from.x, st.x, e) - dir.x * pull; st.y = lerp(from.y, st.y, e) - arcUp - dir.y * pull
        break
      }
      case 'pop': st.visible = true; st.s *= backOut(p); break
      case 'drop': st.visible = true; st.y = lerp(-20, st.y, bounceOut(p)); break
      case 'vanish':
        st.s *= 1 - e; st.o *= 1 - e
        if (p >= 1) st.visible = false
        break
      case 'moveTo':
        if (m.to) {
          const dir = unit({ x: st.x, y: st.y }, m.to)
          st.x = lerp(st.x, m.to.x, e) - dir.x * pull; st.y = lerp(st.y, m.to.y, e) - arcUp - dir.y * pull
        }
        break
      case 'scaleTo': st.s *= lerp(1, m.amount ?? 1, e); break
      case 'stretchTo': w *= lerp(1, m.amount ?? 1, e); break
      case 'rotateTo': turn(lerp(0, m.amount ?? 0, e)); break
      case 'swap': if (m.emoji) st.emoji = m.emoji; break
      case 'tint': st.tint = m.filter || undefined; break
      case 'flip': st.flip = !st.flip; break
      default: {
        if (!live) break
        const amt = m.amount
        if (m.do === 'hop') st.y -= (amt ?? 8) * Math.sin(Math.PI * p)
        if (m.do === 'bounce') st.y -= (amt ?? 5) * Math.abs(Math.sin(Math.PI * (m.times ?? 2) * p)) * (1 - p * 0.5)
        if (m.do === 'squash') { const k = Math.sin(Math.PI * p) * (amt ?? 0.35); st.sx *= 1 + k; st.sy *= 1 - k * 0.86 }
        if (m.do === 'shake') st.x += (amt ?? 1.5) * Math.sin(p * Math.PI * 12) * (1 - p)
        if (m.do === 'spin') turn(360 * (m.times ?? 1) * e)
        if (m.do === 'tilt') turn((amt ?? 15) * Math.sin(Math.PI * p))
        if (m.do === 'flash') st.glow = Math.max(st.glow, Math.abs(Math.sin(Math.PI * 3 * p)))
      }
    }
  }
  if (w !== 1) { st.sx *= w; st.sy /= w }
  return st
}

/** a → b 的單位向量（兩點重疊時是 0 向量）。 */
function unit(a: Vec, b: Vec): Vec {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  return len ? { x: (b.x - a.x) / len, y: (b.y - a.y) / len } : { x: 0, y: 0 }
}

// ---------- 自動質感（劇本不用寫，189 支一起受惠）----------
// 全部是「劇本＋t → 畫面」的純函式：要用到的時間表（哪一段在走路、哪一刻落地、什麼時候閒著）
// 同一份劇本只整理一次（lifeOf），之後每一格只是查表加幾個 sin，不會讓每格的運算量變多。

/** 站在地上的腳底高度（skill 裡的 y ≈ 77 − 0.42 × size） */
const GROUND = 77

/**
 * 角色整體放大：小角色在 160 寬的舞台上只有 1/12，戲都看不清楚。小的（18 以下）放大三成，越大放得越少，34 以上不動，
 * 腳底高度跟著同一個倍率往上算，頭上頂的東西、坐在車上的人才不會陷進去或飄起來。
 */
export const castScale = (size: number, u = 1) => 1 + 0.3 * u * clamp((34 - size) / 16)

function castUp(st: ActorState, u: number) {
  const k = castScale(st.size, u)
  if (k === 1) return
  if (st.float) { st.size *= k; return }
  const h = GROUND - (st.y + 0.42 * st.size)
  // 地上的以腳底為準往上長；離地越高越改成以中心放大（天上的東西不再往上推，免得被推出畫面）
  const fall = 1 - clamp((h - 25) / 20)
  const feet = GROUND - h * (1 + (k - 1) * fall)
  const y = st.y
  st.size *= k
  st.y = lerp(y, feet - 0.42 * st.size, fall)
}

/** 國字的中間（anim:check 用同一個範圍檢查「國字完成後有沒有被擋住」）；給 t 就照國字當下的位置與大小算（讓位後變小、在上方） */
export const glyphCore = (clip?: Clip, t = 0) => {
  const g = clip ? glyphPlaceAt(clip, t) : { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 }
  const at = (v: number, mid: number, c: number) => c + (v - mid) * g.k
  return {
    x0: at(GLYPH.x + 6, GLYPH_MID.x, g.x), x1: at(GLYPH.x + GLYPH.size - 6, GLYPH_MID.x, g.x),
    y0: at(GLYPH.y + 6, GLYPH_MID.y, g.y), y1: at(GLYPH.y + GLYPH.size - 8, GLYPH_MID.y, g.y),
  }
}
/** 頭上的效果最高冒到頭頂上面多少（照 fxAt 的畫法估；不在頭上、不是 emoji 的效果不用管） */
const headroom = (f: Fx) => f.kind === 'burst' ? ((f.n ?? 0) > 1 ? 14.5 : 6.6) : ({ pop: 12, bubble: 16.5, dizzy: 7, sweat: 7, zzz: 17, fountain: 12 } as Partial<Record<Fx['kind'], number>>)[f.kind]

const castCache = new WeakMap<Clip, { n: number; u: number }>()
/**
 * 這支劇本的角色能放大多少（0～1，1 就是 castScale 的全額）。整支用同一個比例，疊在一起的東西才不會錯開。
 * 放大以後，國字完成後會多擋到字、或頭上的效果會被畫面頂端切掉，就一階一階退回去，退到跟原本一樣為止。
 */
export function castFactor(clip: Clip): number {
  const sig = clip.moves.length * 1000 + clip.actors.length + (clip.glyph?.length ?? 0) * 1e6
  const hit = castCache.get(clip)
  if (hit && hit.n === sig) return hit.u
  const done = glyphDoneAt(clip) + 0.2
  const samples: { t: number; post: boolean; raw: ActorState[]; core: ReturnType<typeof glyphCore> }[] = []
  // 跟 anim:check 取一樣的時間點：開頭起每 0.1 秒（看效果），國字完成後起每 0.1 秒（看擋字）
  const sample = (t: number, post: boolean) => samples.push({ t, post, raw: clip.actors.map((a) => rawActor(clip, a, t)), core: glyphCore(clip, t) })
  for (let t = 0; t <= clip.duration; t += 0.1) sample(t, false)
  for (let t = done; t <= clip.duration; t += 0.1) sample(t, true)
  const blocks = (a: ActorState, core: ReturnType<typeof glyphCore>) => {
    const b = bodyBox(a, 0.4)
    return a.visible && a.o >= 0.3 && b.x1 > core.x0 && b.x0 < core.x1 && b.y1 > core.y0 && b.y0 < core.y1
  }
  const headTop = (a: ActorState, room: number) => headY(a) - room
  // 跟 anim:check 同一條規則：同一個角色在國字完成後擋到字，頭尾超過 0.25 秒才算
  const blockedLong = (u: number) => {
    const span = new Map<string, [number, number]>()
    for (const { t, post, raw, core } of samples) {
      if (!post) continue
      for (const r of raw) {
        const s = { ...r }
        castUp(s, u)
        if (!blocks(s, core)) continue
        const sp = span.get(s.id)
        if (sp) sp[1] = t; else span.set(s.id, [t, t])
      }
    }
    return new Set([...span].filter(([, [a, b]]) => b - a >= 0.25).map(([id]) => id))
  }
  const blocked0 = blockedLong(0)
  const ok = (u: number) => {
    for (const id of blockedLong(u)) if (!blocked0.has(id)) return false
    for (const { t, post, raw } of samples) {
      if (post) continue
      for (const r of raw) {
        if (!r.visible) continue
        const s = { ...r }
        castUp(s, u)
        for (const f of clip.fx ?? []) {
          const room = headroom(f)
          if (room === undefined || f.actor !== r.id || t < f.at || t > f.at + (f.dur ?? FX_DUR[f.kind])) continue
          const y = headTop(s, room) + (f.dy ?? 0)
          if (y < -1 && y < headTop(r, room) + (f.dy ?? 0) - 0.01) return false
        }
      }
    }
    return true
  }
  let u = 0
  for (const cand of [1, 0.75, 0.5, 0.25]) if (ok(cand)) { u = cand; break }
  castCache.set(clip, { n: sig, u })
  return u
}

type Kind = 'creature' | 'vehicle' | 'prop'

/**
 * 自製道具圖：劇本寫 emoji: 'prop:<名字>'，圖在 public/props/<名字>.png（npm run prop:cut 從道具表切出來，512×512、長邊撐滿、底部對齊）。
 * size 的意義跟 emoji 一樣（道具的長邊），站在地上的 y 跟主角一樣算。自動質感照「道具」那一邊（跟 🎁⭐🌳 一樣：不踩步伐、不點頭、不做小動作），
 * 只有交通工具（PROP_VEHICLES）照「車」那一邊（移動時身體歪、急停點一下頭，跟 🚈 一樣）；
 * 動物（PROP_ANIMALS）照「角色」那一邊（走過去踩步伐、閒著做小動作、唸字時點頭，跟 🐻🐼🐸🦀🐢🐒 一樣），
 * 其中趴著睡、跳在半空、伸螯夾東西、縮進殼裡、吊在樹枝上的那幾張（PROP_NO_STEPS）跟 🐌 一樣不踩步伐。
 */
export const PROP_PREFIX = 'prop:'
const PROP_VEHICLES = new Set(['metro'])
const PROP_ANIMALS = new Set(['bear', 'bear-sleep', 'bear-roar', 'panda', 'frog', 'frog-jump',
  'crab', 'crab-pinch', 'crab-walk', 'turtle', 'turtle-shell', 'monkey', 'monkey-hang'])
const PROP_NO_STEPS = new Set(['bear-sleep', 'frog-jump', 'crab-pinch', 'turtle-shell', 'monkey-hang'])
const propName = (emoji: string) => (emoji.startsWith(PROP_PREFIX) ? emoji.slice(PROP_PREFIX.length) : '')

/**
 * 角色畫出來的範圍（舞台座標），擋字、頭頂、自動取景用。
 * 一般 emoji 與主角照舊當成正方形：中心 (x, y)、半邊 half × size × s（各處用的 half 照以前的數字）；
 * prop: 照 src/anim/props.ts 量好的內容範圍（往內縮一成，跟 emoji 的估法一樣寬鬆），寬扁的捷運、細高的樹才不會被當成大正方形。
 */
export function bodyBox(a: { emoji: string; x: number; y: number; size: number; s: number; sy?: number; flip?: boolean }, half: number) {
  const b = PROP_BOX[propName(a.emoji)]
  if (!b) { const h = a.size * a.s * half; return { x0: a.x - h, x1: a.x + h, y0: a.y - h, y1: a.y + h } }
  // 跟播放器同一個畫法：以腳底（y + 0.42 size）為準縮放，畫布 (u, v) ∈ [0, 1]
  const sz = a.size * a.s, sy = sz * (a.sy ?? 1), feet = a.y + a.size * 0.42
  const pad = (b[2] - b[0]) * 0.05, padY = (b[3] - b[1]) * 0.05
  const u0 = b[0] + pad - 0.5, u1 = b[2] - pad - 0.5
  const [l, r] = a.flip ? [-u1, -u0] : [u0, u1]
  return { x0: a.x + l * sz, x1: a.x + r * sz, y0: feet + (b[1] + padY - 0.92) * sy, y1: feet + (b[3] - padY - 0.92) * sy }
}
/** 頭頂（頭上的效果冒出來的地方）：一般照舊 y − 0.45 size；prop: 是內容的最上緣 */
export function headY(a: { emoji: string; y: number; size: number; s: number; sy: number }) {
  const b = PROP_BOX[propName(a.emoji)]
  return b ? a.y + a.size * 0.42 + (b[1] - 0.92) * a.size * a.s * a.sy : a.y - a.size * 0.45 * a.s * a.sy
}

/** 有輪子、有引擎的東西：不會踩步伐，煞車時只微微點頭 */
function isVehicle(emoji: string) {
  if (emoji.startsWith('hero:car/')) return true
  if (emoji.startsWith(PROP_PREFIX)) return PROP_VEHICLES.has(propName(emoji))
  const c = emoji.codePointAt(0) ?? 0
  return (c >= 0x1f680 && c <= 0x1f6a4) || c === 0x1f6b2 || (c >= 0x1f6e0 && c <= 0x1f6fc) || c === 0x1f3ce || c === 0x1f3cd
    || c === 0x2708 || c === 0x26f5 || c === 0x1f9bc || c === 0x1f9bd
}

/** 在地上爬、游、滑的動物：會有跟隨動作與小動作，但不踩步伐 */
const NO_STEPS = new Set([...'🐌🐍🐛🪱🐟🐠🐡🐬🐳🐋🐙🦑🦈🦭🦪🐚🦐🦞🪼'].map((c) => c.codePointAt(0)!))

/** 會走路、會等、會點頭的「角色」：主角、動物、人、臉、機器人、外星人 */
function kindOf(emoji: string): Kind {
  if (isVehicle(emoji)) return 'vehicle'
  if (emoji.startsWith('hero:')) return 'creature'
  if (emoji.startsWith(PROP_PREFIX)) return PROP_ANIMALS.has(propName(emoji)) ? 'creature' : 'prop'
  const c = emoji.codePointAt(0) ?? 0
  const inR = (a: number, b: number) => c >= a && c <= b
  if (inR(0x1f400, 0x1f43d) || c === 0x1f43f || inR(0x1f980, 0x1f9ae) || inR(0x1fab0, 0x1fabd) || inR(0x1face, 0x1facf)
    || inR(0x1f466, 0x1f487) || inR(0x1f600, 0x1f64f) || inR(0x1f910, 0x1f92f) || inR(0x1f970, 0x1f97a) || c === 0x1f977
    || inR(0x1f9b8, 0x1f9b9) || inR(0x1f9cd, 0x1f9df) || c === 0x1f916 || c === 0x1f575 || c === 0x1f57a || inR(0x1f3c3, 0x1f3c4)
    || c === 0x1f6b6 || c === 0x1f577 || c === 0x1f54a || c === 0x2603 || c === 0x26c4) return 'creature'
  return 'prop'
}
const canStep = (emoji: string) => kindOf(emoji) === 'creature' && !emoji.startsWith('hero:shark/') && !emoji.endsWith('/drive')
  && !NO_STEPS.has(emoji.codePointAt(0) ?? 0) && !PROP_NO_STEPS.has(propName(emoji))

/** 一段在地上走過去：步數 n 跟距離走，最後一步剛好踩在終點 */
type Step = { at: number; d: number; ease?: Ease; ant: boolean; n: number; amp: number }
/** 一段水平移動：中途身體順著方向歪，停下來往前甩再晃回來 */
type Glide = { at: number; d: number; ease?: Ease; ant: boolean; dir: number; dist: number; lean: number; stop: number }
/** 一下子的自動小動作：kind 決定怎麼動，k 是力道或方向 */
type Beat = { at: number; d: number; kind: 'land' | 'pop' | 'nod' | 'shift' | 'bob' | 'tilt'; k: number }
type Life = { steps: Step[]; glides: Glide[]; beats: Beat[] }

const lifeCache = new WeakMap<Clip, { n: number; life: Map<string, Life> }>()

/** 整理一份劇本的自動質感時間表（每支劇本只算一次）。 */
export function lifeOf(clip: Clip): Map<string, Life> {
  const sig = clip.moves.length * 1000 + clip.actors.length
  const hit = lifeCache.get(clip)
  if (hit && hit.n === sig) return hit.life
  const life = new Map<string, Life>()
  const moves = sortedMoves(clip)
  const at = (a: Actor, t: number) => baseActor(clip, a, t)
  const positional = (m: Move) => m.do === 'moveTo' || m.do === 'enter'
  for (const a of clip.actors) {
    const L: Life = { steps: [], glides: [], beats: [] }
    life.set(a.id, L)
    if (a.top) continue
    const mine = moves.filter((m) => m.actor === a.id)
    const live = (m: Move, t0: number, t1: number) => m.at < t1 && m.at + durOf(m) > t0
    const scripted = (kinds: Move['do'][], t0: number, t1: number) => mine.some((m) => kinds.includes(m.do) && m.at >= t0 && m.at <= t1)
    const busy: [number, number][] = []
    for (const m of mine) busy.push([m.at - 0.2, m.at + durOf(m) + 0.35])

    for (const m of mine) {
      const d = durOf(m)
      const s0 = at(a, m.at), s1 = at(a, m.at + d)
      const kind = kindOf(s0.emoji)
      // 換姿勢：新的樣子一出來先擠一下再彈開（劇本同一刻自己寫了 squash 就不重複）
      if (m.do === 'swap' && m.emoji && m.emoji !== at(a, m.at - 0.001).emoji && !scripted(['squash'], m.at - 0.05, m.at + 0.05)) {
        L.beats.push({ at: m.at, d: 0.26, kind: 'pop', k: 1 })
      }
      if (positional(m) && d > 0) {
        const dx = s1.x - s0.x, dy = s1.y - s0.y
        const dist = Math.abs(dx)
        const feet = (s: ActorState) => s.y + 0.42 * s.size
        const grounded = !s0.float && feet(s0) >= FLOOR - 4 && feet(s1) >= FLOOR - 4
        // 跟別人同一刻、同樣長、去同一個地方：是被載著走（坐車、被抱著），不另外踩步
        const carried = moves.some((o) => o !== m && o.actor !== a.id && positional(o) && Math.abs(o.at - m.at) < 0.01 && durOf(o) === d
          && Math.abs((o.to?.x ?? o.from?.x ?? 1e9) - (m.to?.x ?? m.from?.x ?? -1e9)) < 2)
        const jumpy = (m.arc ?? 0) >= 1 || mine.some((o) => o !== m && ['hop', 'bounce', 'spin', 'drop'].includes(o.do) && live(o, m.at, m.at + d))
        const wobbly = m.ease === 'bounce' || m.ease === 'elastic'
        const speed = dist / d
        // 步伐
        if (canStep(s0.emoji) && grounded && !carried && !jumpy && !wobbly && dist >= 6 && Math.abs(dy) <= 3 && Math.abs(s0.r - s0.rc) < 30) {
          const n = Math.min(Math.round(dist / (s0.size * 0.5)), Math.floor(d * 6.5))
          if (n >= 2) L.steps.push({ at: m.at, d, ease: m.ease, ant: !!m.anticipate, n, amp: s0.size * 0.055 * (speed > 140 ? 0.6 : 1) })
        }
        // 身體歪、急停往前甩
        if (kind !== 'prop' && !carried && !wobbly && dist >= 6 && speed >= 18 && Math.abs(dx) > Math.abs(dy) * 0.8) {
          const k = kind === 'vehicle' ? 0.55 : 1
          const next = mine.find((o) => o !== m && positional(o) && o.at > m.at && o.at < m.at + d + 0.2)
          const STOP: Partial<Record<Ease, number>> = { linear: 1, in: 1, out: 0.55, inOut: 0.45 }
          const stop = next || (m.arc ?? 0) >= 3 ? 0 : (STOP[m.ease ?? 'inOut'] ?? 0) * clamp(speed / 90) * 10 * k
          L.glides.push({ at: m.at, d, ease: m.ease, ant: !!m.anticipate, dir: Math.sign(dx), dist, lean: 7 * k, stop })
          if (stop) busy.push([m.at + d, m.at + d + 0.7])
        }
        // 從空中落到地上
        const fallH = (m.arc ?? 0) >= 3 ? m.arc! : s1.y - s0.y
        if (!s0.float && fallH >= 6 && feet(s1) >= FLOOR - 4) addLand(L, m.at + d, fallH)
      }
      if (m.do === 'hop' && (m.amount ?? 8) >= 4 && !s0.float) addLand(L, m.at + d, m.amount ?? 8)
      if (m.do === 'drop' && !s0.float) addLand(L, m.at + d * 0.364, 20)
    }

    function addLand(L: Life, tl: number, h: number) {
      // 劇本在落地那一刻自己寫了壓扁，或馬上又彈起來：不重複
      if (scripted(['squash'], tl - 0.12, tl + 0.15) || mine.some((o) => o.do === 'squash' && live(o, tl, tl + 0.01))) return
      if (scripted(['hop', 'bounce', 'drop'], tl - 0.05, tl + 0.1)) return
      L.beats.push({ at: tl, d: 0.24, kind: 'land', k: 0.12 + 0.12 * clamp(h / 16) })
      busy.push([tl, tl + 0.4])
    }

    // 站著等的小動作：閒下來超過一秒，每隔一陣子換一下重心、點一下、歪一下頭。
    // 節奏和第一下的時間由 id 決定，每個角色不一樣，不會全部一起抖
    if (kindOf(a.emoji) === 'creature' || mine.some((m) => m.emoji && kindOf(m.emoji) === 'creature')) {
      const h = hashOf(a.id)
      busy.sort((p, q) => p[0] - q[0])
      let free = 0
      const gaps: [number, number][] = []
      for (const [b0, b1] of busy) { if (b0 > free) gaps.push([free, b0]); free = Math.max(free, b1) }
      if (free < clip.duration) gaps.push([free, clip.duration])
      let k = 0
      for (const [g0, g1] of gaps) {
        if (g1 - g0 < 1) continue
        const period = 1.45 + (h % 7) * 0.1
        for (let t0 = g0 + 0.35 + (h % 5) * 0.12; t0 + 0.6 <= g1 - 0.05; t0 += period, k++) {
          const kind = (['shift', 'bob', 'tilt'] as const)[(h + k) % 3]
          L.beats.push({ at: t0, d: kind === 'bob' ? 0.4 : 0.6, kind, k: k % 2 ? -1 : 1 })
        }
      }
    }
  }

  // 唸字那一拍：最近在演的角色點一下頭（劇本同一刻已經讓他跳、壓扁就不加）
  for (const c of clip.cues) {
    if (!('say' in c)) continue
    let best: { a: Actor; score: number } | null = null
    for (const a of clip.actors) {
      if (a.top) continue
      const s = baseActor(clip, a, c.at)
      if (!s.visible || s.o < 0.5 || kindOf(s.emoji) !== 'creature') continue
      const last = moves.filter((m) => m.actor === a.id && m.at <= c.at + 0.15 && m.at >= c.at - 2.5).at(-1)
      if (!last) continue
      const score = last.at + (s.emoji.startsWith('hero:') ? 0.3 : 0)
      if (!best || score > best.score) best = { a, score }
    }
    if (!best) continue
    const L = life.get(best.a.id)!
    const busyNow = moves.some((m) => m.actor === best!.a.id && ['hop', 'bounce', 'squash', 'spin', 'drop', 'pop'].includes(m.do)
      && m.at < c.at + 0.3 && m.at + durOf(m) > c.at - 0.05)
    if (busyNow) continue
    // 小動作跟點頭撞在一起就讓給點頭
    L.beats = L.beats.filter((b) => !(['shift', 'bob', 'tilt'].includes(b.kind) && b.at < c.at + 0.4 && b.at + b.d > c.at - 0.1))
    L.beats.push({ at: c.at, d: 0.34, kind: 'nod', k: 1 })
  }
  lifeCache.set(clip, { n: sig, life })
  return life
}

/** 把自動質感加到一個角色身上（每一格只查自己的表）。 */
function applyLife(st: ActorState, L: Life, t: number) {
  if (!st.visible) return
  const size = st.size
  for (const s of L.steps) {
    if (t <= s.at || t >= s.at + s.d) continue
    const p = (t - s.at) / s.d
    const pm = s.ant ? clamp((p - 0.22) / 0.78) : p
    const ph = s.n * easeBy(s.ease)(pm)
    const w = Math.sin(Math.PI * ph)
    st.y -= s.amp * Math.abs(w)
    // 左右腳輪流：身體往這邊歪一點、再往那邊歪一點；踩到地那一下微微壓扁
    st.r += 4 * w
    const contact = (1 - Math.abs(w)) ** 3
    st.sy *= 1 - 0.05 * contact; st.sx *= 1 + 0.035 * contact
  }
  for (const g of L.glides) {
    if (t < g.at) continue
    const end = g.at + g.d
    if (t < end) {
      const p = (t - g.at) / g.d
      const span = g.ant ? 0.78 : 1
      const pm = g.ant ? clamp((p - 0.22) / 0.78) : p
      const f = easeBy(g.ease), h = 0.02
      const slope = (f(Math.min(1, pm + h)) - f(Math.max(0, pm - h))) / (Math.min(1, pm + h) - Math.max(0, pm - h))
      const v = (g.dist * slope) / (g.d * span)
      st.lean += g.dir * g.lean * clamp(v / 110)
    } else if (g.stop && t < end + 0.7) {
      // 急停：上半身繼續往前甩，晃一下回來
      const tau = t - end
      st.lean += g.dir * g.stop * (Math.exp(-6 * tau) * Math.sin(9 * tau)) / 0.4
    }
  }
  for (const b of L.beats) {
    if (t < b.at || t > b.at + b.d) continue
    const q = (t - b.at) / b.d
    const bell = Math.sin(Math.PI * q)
    switch (b.kind) {
      case 'land': { const k = b.k * bell; st.sx *= 1 + k; st.sy *= 1 - k * 0.86; break }
      case 'pop': {
        // 新姿勢一出來先擠扁，彈過頭一點再停：幾格就好
        const w = Math.exp(-3 * q) * Math.cos(2.5 * Math.PI * q)
        st.sy *= 1 - 0.14 * w; st.sx *= 1 + 0.1 * w
        break
      }
      case 'nod': st.y -= size * 0.09 * bell; st.sy *= 1 + 0.05 * Math.sin(2 * Math.PI * q) * (1 - q); st.lean += 3 * bell * (st.flip ? 1 : -1); break
      case 'shift': st.lean += 3.2 * b.k * bell; break
      case 'bob': st.y -= size * 0.05 * bell; st.sy *= 1 - 0.035 * Math.sin(2 * Math.PI * q); break
      case 'tilt': st.r += 3.5 * b.k * bell; break
    }
  }
}

/** 自動落地的揚塵（fxAt 用）：劇本在附近自己放了 puff 就不加 */
function autoDust(clip: Clip, t: number, actors: Map<string, ActorState>, out: FxItem[]) {
  for (const [id, L] of lifeOf(clip)) {
    for (const b of L.beats) {
      if (b.kind !== 'land' || b.k < 0.17 || t < b.at || t > b.at + 0.4) continue
      if ((clip.fx ?? []).some((f) => f.kind === 'puff' && f.actor === id && Math.abs(f.at - b.at) < 0.3)) continue
      const a = actors.get(id)
      if (!a || !a.visible) continue
      const p = (t - b.at) / 0.4
      const feet = { x: a.x, y: a.y + a.size * 0.42 }
      if (feet.x < 14 || feet.x > 146) continue
      for (const side of [-1, 1]) {
        out.push({ key: `land-${id}-${b.at}-${side}`, emoji: '💨', x: feet.x + side * (3 + 7 * p), y: feet.y - 1.5 - 1.5 * p, size: 3.5 + 2 * p, o: 0.85 * (1 - p), s: 1, r: 0 })
      }
    }
  }
}

function hashOf(id: string) {
  let h = 7
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 100003
  return h
}

// ---------- 國字 ----------
export const GLYPH = { size: 63, x: 80 - 63 / 2, y: 45 - 63 / 2 }
const K = GLYPH.size / 1024

/** hanzi-writer 座標（y 朝上、-124～900）換成舞台座標。 */
export const toStage = (px: number, py: number): Vec => ({ x: GLYPH.x + px * K, y: GLYPH.y + (900 - py) * K })
export const GLYPH_TRANSFORM = `translate(${GLYPH.x} ${GLYPH.y + 900 * K}) scale(${K} ${-K})`

export type StrokeState = { index: number; color: string; o: number; dx: number; dy: number; s: number; r: number; cx: number; cy: number }

/** 每一筆在 t 時的位置；還沒輪到的筆畫不在清單裡。centers 是每一筆中心點（舞台座標）。 */
export function strokesAt(clip: Clip, t: number, centers: Vec[]): StrokeState[] {
  const out: StrokeState[] = []
  // 筆畫畫在國字那層（跟著國字的位置與大小）。v2 的國字在拼的時候是讓位的樣子，
  // 起點（舞台座標）要換成國字那層的座標，筆畫才會從角色身上飛出來、落進字框當下的位置
  const g = isV2(clip) ? glyphPlaceAt(clip, t) : null
  const local = (p: Vec): Vec => (g ? { x: GLYPH_MID.x + (p.x - g.x) / g.k, y: GLYPH_MID.y + (p.y - g.y) / g.k } : p)
  for (const b of clip.builds) {
    const timing = buildTiming(b)
    const src = local(typeof b.from === 'string'
      ? (() => { const a = actorsAt(clip, b.at).find((x) => x.id === b.from); return a ? { x: a.x, y: a.y } : { x: 80, y: 45 } })()
      : b.from)
    b.strokes.forEach((index, i) => {
      const start = b.at + timing.stagger * i
      if (t < start) return
      const p = clamp((t - start) / timing.each)
      const c = centers[index] ?? { x: 80, y: 45 }
      if (b.style === 'drop') {
        const e = bounceOut(p)
        out.push({ index, color: b.color, o: clamp(p * 4), dx: 0, dy: -70 * (1 - e), s: 1, r: 0, cx: c.x, cy: c.y })
      } else {
        const e = backOut(p)
        out.push({
          index, color: b.color, o: clamp(p * 3),
          dx: (src.x - c.x) * (1 - e), dy: (src.y - c.y) * (1 - e) - 14 * Math.sin(Math.PI * clamp(p)),
          s: lerp(0.15, 1, e), r: lerp(-140, 0, e), cx: c.x, cy: c.y,
        })
      }
    })
  }
  return out
}

export function buildTiming(b: Build) {
  const n = b.strokes.length
  const each = Math.min(0.45, b.dur * 0.6)
  const stagger = n > 1 ? (b.dur - each) / (n - 1) : 0
  return { each, stagger }
}

/** 每一筆落定的時間，播放器用來放「喀」的音效。 */
export function landings(clip: Clip): { at: number; i: number; n: number; stroke: number }[] {
  const total = clip.builds.reduce((s, b) => s + b.strokes.length, 0)
  let k = 0
  return clip.builds.flatMap((b) => {
    const { each, stagger } = buildTiming(b)
    return b.strokes.map((stroke, i) => ({ at: b.at + stagger * i + each * 0.8, i: k++, n: total, stroke }))
  })
}

/** 國字全部拼好的時間。 */
/** 沒有國字的劇本（故事屋的場景）：整支都算「還沒拼好」 */
export const hasGlyph = (clip: Clip) => clip.builds.length > 0
export const glyphDoneAt = (clip: Clip) => (hasGlyph(clip) ? Math.max(...clip.builds.map((b) => b.at + b.dur)) : Infinity)

/** 國字正中央（GLYPH 的中心）；讓位前後的位置都以這一點為準 */
export const GLYPH_MID: Vec = { x: GLYPH.x + GLYPH.size / 2, y: GLYPH.y + GLYPH.size / 2 }
/** park 沒寫 to／amount 時：縮到 0.55 倍、移到畫面上方正中（上緣離畫面頂約 4） */
export const PARK = { x: 80, y: 21.5, k: 0.55 }

type GlyphMove = Extract<GlyphFx, { do: 'park' | 'home' }>
const isGlyphMove = (g: GlyphFx): g is GlyphMove => g.do === 'park' || g.do === 'home'

/**
 * v2 的空字框：還沒拼上去的筆畫在 t 的淡淡輪廓（o 是這一筆輪廓的透明度：筆畫快落定時淡掉），
 * glow 是字框亮一下的力道（拼好之前唸到這個字的那一刻）。v1 是 null。n 是這個字的筆畫數。
 */
export function emptyFrameAt(clip: Clip, t: number, n: number) {
  if (!isV2(clip)) return null
  const land = new Map(landings(clip).map((k) => [k.stroke, k.at]))
  const strokes: { index: number; o: number }[] = []
  for (let i = 0; i < n; i++) {
    const at = land.get(i) ?? Infinity
    const o = clamp((at - t) / 0.2)
    if (o > 0) strokes.push({ index: i, o })
  }
  const done = glyphDoneAt(clip)
  let glow = 0
  for (const c of clip.cues) {
    if (!('say' in c) || c.say !== clip.char || c.at >= done || t < c.at || t > c.at + 0.7) continue
    glow = Math.max(glow, Math.sin((Math.PI * (t - c.at)) / 0.7))
  }
  return { strokes, glow }
}

/**
 * 國字在 t 的位置與大小（讓位的結果）：x、y 是國字中心，k 是倍率。沒寫 park 的劇本永遠是正中央、1 倍。
 * 每一個 park／home 從「上一個在它開始時的位置」漸變到自己的目標，跟 zoom 一樣只由 t 決定。
 */
export function glyphPlaceAt(clip: Clip, t: number) {
  const rest = glyphRestAt(clip, t)
  // 問他（ask）的那段時間：國字回到正中央原本的大小，結束後回到原本的位置
  const w = askAt(clip, t)
  if (!w) return rest
  const a = askFxAt(clip, t)
  const to = { x: a?.to?.x ?? GLYPH_MID.x, y: a?.to?.y ?? GLYPH_MID.y, k: a?.amount ?? 1 }
  return { x: lerp(rest.x, to.x, w), y: lerp(rest.y, to.y, w), k: lerp(rest.k, to.k, w) }
}

/** v2 片型（format: 2）：字從第一格就在 */
export const isV2 = (clip: Clip) => clip.format === 2

/** ask 進出各用多久漸變（暗下來、國字放大到正中央） */
const ASK_RAMP = 0.35

/** 問他（ask）在 t 的力道：0 沒有，1 完全暗下來、國字在正中央 */
export function askAt(clip: Clip, t: number) {
  let w = 0
  for (const g of clip.glyph ?? []) {
    if (g.do !== 'ask' || t < g.at || t > g.at + g.dur) continue
    const r = Math.min(ASK_RAMP, g.dur / 3)
    w = Math.max(w, easeInOut(clamp((t - g.at) / r)) * easeInOut(clamp((g.at + g.dur - t) / r)))
  }
  return w
}

/** t 正在進行的 ask（播放器用它的 keep 決定哪些角色畫在黑幕上面） */
export const askFxAt = (clip: Clip, t: number) =>
  (clip.glyph ?? []).find((g): g is Extract<GlyphFx, { do: 'ask' }> => g.do === 'ask' && t >= g.at && t <= g.at + g.dur)

/** 讓位（park／home）的結果，不含 ask。v2 的國字一開始就在讓位的位置（畫面上方） */
function glyphRestAt(clip: Clip, t: number) {
  let x = GLYPH_MID.x, y = GLYPH_MID.y, k = 1
  if (isV2(clip)) { x = PARK.x; y = PARK.y; k = PARK.k }
  const ops = (clip.glyph ?? []).filter(isGlyphMove).sort((a, b) => a.at - b.at)
  for (const g of ops) {
    if (t < g.at) break
    const p = easeBy(g.ease)(g.dur > 0 ? clamp((t - g.at) / g.dur) : 1)
    const to = g.do === 'park'
      ? { x: g.to?.x ?? PARK.x, y: g.to?.y ?? PARK.y, k: g.amount ?? PARK.k }
      : { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 }
    x = lerp(x, to.x, p); y = lerp(y, to.y, p); k = lerp(k, to.k, p)
  }
  return { x, y, k }
}

/** 國字整個字在 t 佔的範圍（舞台座標）：自動取景與 anim:check 用 */
export function glyphBoxAt(clip: Clip, t: number) {
  const g = glyphPlaceAt(clip, t)
  const h = (GLYPH.size / 2) * g.k
  return { x0: g.x - h, x1: g.x + h, y0: g.y - h, y1: g.y + h, k: g.k }
}

/**
 * 國字在 t 的樣子：x、y 是中心、k 是讓位的倍率（會留下結果），dx／s／r 是 wobble／pulse／shake（做完回原狀）。
 * 播放器畫成 translate(x + dx, y) rotate(r) scale(s × k)，以國字中心為支點。
 */
export function glyphAt(clip: Clip, t: number) {
  let dx = 0, s = 1, r = 0
  const { x, y, k } = glyphPlaceAt(clip, t)
  for (const fx of clip.glyph ?? []) {
    if (isGlyphMove(fx)) continue
    if (t < fx.at || t > fx.at + fx.dur) continue
    const p = (t - fx.at) / fx.dur
    const k = Math.sin(Math.PI * p)
    if (fx.do === 'pulse') s *= 1 + 0.06 * k
    if (fx.do === 'wobble') r += 4 * Math.sin(p * Math.PI * 4) * (1 - p)
    if (fx.do === 'shake') dx += 1.2 * Math.sin(p * Math.PI * 14) * (1 - p)
    // 問他：在黑幕上輕輕左右晃，像在說「你看我」
    if (fx.do === 'ask') r += 2.5 * Math.sin((t - fx.at) * Math.PI * 1.6) * askAt(clip, t)
  }
  return { dx, s, r, x, y, k }
}

// ---------- 漫畫效果 ----------
export const FLOOR = 74

export type FxItem = { key: string; emoji?: string; bubble?: boolean; bolt?: Vec[]; wave?: boolean; swoosh?: { pts: Vec[]; color: string; width: number };
  line?: { from: Vec; to: Vec; color: string; width: number }; beam?: Vec[]; x: number; y: number; size: number; o: number; s: number; r: number }

const FX_DUR: Record<Fx['kind'], number> = { burst: 0.6, dizzy: 1.2, bubble: 1, sweat: 0.7, puff: 0.5, zzz: 1.6, pop: 0.8, rain: 0.8, zap: 0.35, fountain: 1, stink: 1.6, line: 0.5, beam: 1, blow: 0.6, swoosh: 0.35 }

export function fxAt(clip: Clip, t: number): FxItem[] {
  const out: FxItem[] = []
  const actors = new Map(actorsAt(clip, t).map((a) => [a.id, a]))
  ;(clip.fx ?? []).forEach((f, fi) => {
    const d = f.dur ?? FX_DUR[f.kind]
    if (t < f.at || t > f.at + d) return
    const p = (t - f.at) / d
    const a = f.actor ? actors.get(f.actor) : undefined
    // 錨點：角色頭頂；腳底給 puff 用
    const head = a ? { x: a.x + (f.dx ?? 0), y: headY(a) + (f.dy ?? 0) } : { x: f.x ?? 80, y: f.y ?? 45 }
    const feet = a ? { x: a.x, y: a.y + a.size * 0.42 } : head
    const fade = clamp(Math.min(p / 0.12, (1 - p) / 0.2))
    const n = f.n ?? 0
    const key = (i: number) => `${fi}-${i}`
    const first = out.length
    switch (f.kind) {
      case 'burst': {
        if ((n || 1) === 1) {
          out.push({ key: key(0), emoji: f.emoji ?? '💥', x: head.x + (f.actor ? 0 : 0), y: head.y, size: 11, o: clamp((1 - p) / 0.4), s: backOut(clamp(p / 0.35)), r: -10 + 20 * p })
          break
        }
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + 0.4
          const dist = 3 + 15 * (1 - (1 - p) ** 2)
          out.push({ key: key(i), emoji: f.emoji ?? '✨', x: head.x + Math.cos(ang) * dist, y: head.y + Math.sin(ang) * dist * 0.8 + 6 * p * p,
            size: 5, o: 1 - p * p, s: 1 - 0.3 * p, r: 0 })
        }
        break
      }
      case 'dizzy':
        for (let i = 0; i < 3; i++) {
          const ang = (t - f.at) * Math.PI * 3 + (i * Math.PI * 2) / 3
          out.push({ key: key(i), emoji: f.emoji ?? '💫', x: head.x + Math.cos(ang) * 7, y: head.y - 2 + Math.sin(ang) * 2,
            size: 5.5, o: fade, s: 0.85 + 0.25 * Math.sin(ang), r: 0 })
        }
        break
      case 'bubble': {
        const pin = clamp(p * d / 0.25), pout = clamp((1 - p) * d / 0.15)
        out.push({ key: key(0), bubble: true, emoji: f.emoji ?? '❓', x: head.x + 9, y: head.y - 9, size: 6, o: 1, s: backOut(pin) * pout, r: 0 })
        break
      }
      case 'sweat':
        for (let i = 0; i < 2; i++) {
          const q = clamp(p * 1.6 - i * 0.5)
          if (q <= 0) continue
          out.push({ key: key(i), emoji: '💦', x: head.x + 5 + 5 * q, y: head.y - 1 - 4 * Math.sin(Math.PI * q) + 3 * q, size: 4, o: 1 - q, s: 1, r: 20 * q })
        }
        break
      case 'puff':
        for (const side of [-1, 1]) {
          out.push({ key: key(side), emoji: '💨', x: feet.x + side * (4 + 9 * p), y: feet.y - 2 - 2 * p, size: 5 + 3 * p, o: 1 - p, s: 1, r: 0 })
        }
        break
      case 'zzz':
        for (let i = 0; i < 3; i++) {
          const q = ((t - f.at) / 1.2 + i / 3) % 1
          out.push({ key: key(i), emoji: f.emoji ?? '💤', x: head.x + 4 + 6 * q, y: head.y - 2 - 12 * q, size: 3.5 + 3 * q, o: Math.sin(Math.PI * q) * fade, s: 1, r: 0 })
        }
        break
      case 'pop':
        out.push({ key: key(0), emoji: f.emoji ?? '❗', x: head.x + 6, y: head.y - 6 - 2 * Math.sin(Math.PI * p * 2), size: 7, o: fade, s: backOut(clamp(p * d / 0.2)), r: 0 })
        break
      case 'zap': {
        const b = f.target ? actors.get(f.target) : undefined
        if (!a || !b) break
        // 從雲底劈到頭頂，鋸齒每一幀換一點，看起來在閃
        const from = { x: a.x, y: a.y + a.size * 0.25 }, to = { x: b.x, y: b.y - b.size * 0.2 }
        const seed = Math.floor(t * 20)
        const pts: Vec[] = [from]
        for (let i = 1; i < 7; i++) {
          const k = i / 7
          const jitter = 4 + Math.abs((Math.sin(seed * 12.9 + i * 78.2) * 43758.5) % 1) * 6
          // 往垂直於閃電方向的那邊抖，不管閃電斜向哪裡都是鋸齒
          const len = Math.hypot(to.x - from.x, to.y - from.y) || 1
          const nx = -(to.y - from.y) / len, ny = (to.x - from.x) / len
          const side = i % 2 ? jitter : -jitter
          pts.push({ x: lerp(from.x, to.x, k) + nx * side, y: lerp(from.y, to.y, k) + ny * side })
        }
        pts.push(to)
        out.push({ key: key(0), bolt: pts, x: 0, y: 0, size: 0, o: seed % 2 ? 1 : 0.65, s: 1, r: 0 })
        break
      }
      case 'stink': {
        const c = a ? { x: a.x + (f.dx ?? 0), y: a.y + (f.dy ?? 0) } : head
        for (let i = 0; i < 3; i++) {
          const q = ((t - f.at) / 1.1 + i / 3) % 1
          out.push({ key: key(i), wave: true, x: c.x - 4 + i * 4, y: c.y - 3 - 14 * q, size: 1, o: Math.sin(Math.PI * q) * fade, s: 0.7 + 0.5 * q, r: 0 })
        }
        break
      }
      case 'line': {
        if (!a) break
        const b = f.target ? actors.get(f.target) : undefined
        const end = b ? { x: b.x, y: b.y } : f.to
        if (!end) break
        const from = { x: a.x + (f.dx ?? 0), y: a.y + (f.dy ?? 0) }
        // 射出去要一點時間：前 15% 線從起點長出來
        const grow = clamp(p * d / 0.12)
        const to = { x: lerp(from.x, end.x, grow), y: lerp(from.y, end.y, grow) }
        out.push({ key: key(0), line: { from, to, color: f.color ?? '#fff', width: f.width ?? 0.7 }, x: 0, y: 0, size: 0, o: clamp((1 - p) * d / 0.12), s: 1, r: 0 })
        break
      }
      case 'beam': {
        if (!a) break
        const top = a.y + a.size * 0.25, half = (f.n ?? 14) / 2
        const flicker = 0.75 + 0.25 * Math.sin(t * 40)
        out.push({ key: key(0), beam: [{ x: a.x - 2.5, y: top }, { x: a.x + 2.5, y: top }, { x: a.x + half, y: FLOOR }, { x: a.x - half, y: FLOOR }],
          x: 0, y: 0, size: 0, o: fade * flicker, s: 1, r: 0 })
        break
      }
      case 'fountain': {
        // 往上噴、散開、被重力拉回來
        const m = n || 8
        const tau = p * d
        for (let i = 0; i < m; i++) {
          const ang = (-0.5 + i / (m - 1)) * 1.2
          const v = 34 + (i % 3) * 6
          const x = head.x + Math.sin(ang) * v * tau
          const y = head.y - Math.cos(ang) * v * tau + 55 * tau * tau
          out.push({ key: key(i), emoji: f.emoji ?? '💧', x, y, size: 4.5, o: clamp((1 - p) / 0.3), s: 1, r: ang * 40 })
        }
        break
      }
      case 'rain':
        for (let i = 0; i < (n || 6); i++) {
          const q = clamp(p * 1.5 - (i / (n || 6)) * 0.5)
          if (q <= 0 || q >= 1) continue
          out.push({ key: key(i), emoji: f.emoji ?? '💧', x: head.x - 10 + (i * 37 % 20), y: head.y + 4 + 30 * q * q, size: 4, o: 1 - q * 0.5, s: 1, r: 0 })
        }
        break
      case 'blow': {
        // 一串 💨 從嘴巴飛向對方，一個接一個、越飛越大
        const b = f.target ? actors.get(f.target) : undefined
        const end = b ? { x: b.x, y: b.y - b.size * 0.15 } : f.to
        if (!end) break
        const m = n || 4
        for (let i = 0; i < m; i++) {
          const q = clamp(p * 1.6 - (i / m) * 0.6)
          if (q <= 0 || q >= 1) continue
          const wob = Math.sin(q * Math.PI * 2 + i) * 2
          out.push({ key: key(i), emoji: f.emoji ?? '💨', x: lerp(head.x, end.x, q), y: lerp(head.y, end.y, q) + wob, size: 5 + 4 * q, o: Math.min(1, Math.sin(Math.PI * q) * 1.4), s: 1, r: 0 })
        }
        break
      }
      case 'swoosh': {
        // 一段固定長度的弧（像一條尾巴）：預備時往反方向翹起來停住、微微抖，然後在剩下時間的前一半甩到對方那一側，停一下淡掉
        const b = f.target ? actors.get(f.target) : undefined
        const end = b ? { x: b.x, y: b.y } : f.to
        const dir = end && end.x < head.x ? -1 : 1
        const r = (n || 12) * (f.scale ?? 1)
        const deg = Math.PI / 180
        const to = dir > 0 ? 0 : Math.PI
        const from = to - dir * (f.sweep ?? 110) * deg
        const len = 55 * deg
        const wind = Math.min(f.windup ?? 0, d * 0.8)
        const tt = t - f.at
        // 翹起來的位置：起點再往後 25°
        const cock = from - dir * 25 * deg
        let a: number
        if (tt < wind) a = lerp(from, cock, easeBy('out')(clamp(tt / Math.min(0.08, wind)))) + Math.sin(tt * 60) * 2 * deg
        else a = lerp(cock, to, 1 - (1 - clamp((tt - wind) / ((d - wind) * 0.5))) ** 3)
        const pts: Vec[] = []
        for (let i = 0; i <= 12; i++) {
          const ai = a - dir * len * (1 - i / 12)
          pts.push({ x: head.x + Math.cos(ai) * r, y: head.y + (f.low ? -1 : 1) * Math.sin(ai) * r })
        }
        const fade = clamp((d - tt) / Math.max(0.05, (d - wind) * 0.35))
        out.push({ key: key(0), swoosh: { pts, color: f.color ?? '#fff', width: f.width ?? 2.6 }, x: 0, y: 0, size: 0, o: Math.min(fade, clamp(tt / 0.04)), s: 1, r: 0 })
        break
      }
    }
    // 放大整個效果（以錨點為中心）；線條類的效果（閃電、線、光束、弧線）自己處理或不放大
    if (f.scale !== undefined) {
      for (let i = first; i < out.length; i++) {
        const it = out[i]
        if (it.swoosh || it.bolt || it.line || it.beam) continue
        it.x = head.x + (it.x - head.x) * f.scale; it.y = head.y + (it.y - head.y) * f.scale; it.s *= f.scale
      }
    }
  })
  autoDust(clip, t, actors, out)
  return out
}

/** 畫好的背景範圍（AnimPlayer 的天空矩形）：鏡頭推近時視野不能超出這裡，不然會露白。 */
const PAINTED = { x0: -20, y0: -20, x1: 180, y1: 110 }
const HOME = { z: 1, cx: 80, cy: 46 }

type CamState = { z: number; cx: number; cy: number }
type CamLasting = Extract<Camera, { do: 'zoom' | 'follow' }>

export function cameraAt(clip: Clip, t: number, actors: ActorState[] = actorsAt(clip, t)) {
  const ops = [...(clip.camera ?? [])]
  let { z, cx, cy } = scriptedCam(clip, lastingOps(clip), t, actors)
  // 整支片鏡頭一直很慢地往前推一點點，畫面不會像一張靜止的圖
  z *= 1 + 0.035 * easeInOut(clamp(t / clip.duration))
  let dx = 0, dy = 0
  for (const c of ops) {
    if (c.do !== 'punch' && c.do !== 'shake') continue
    if (t < c.at || t > c.at + c.dur) continue
    const p = (t - c.at) / c.dur
    if (c.do === 'punch') {
      // 快速推近、停住、慢慢退回
      const k = p < 0.15 ? backOut(p / 0.15) : p > 0.7 ? 1 - easeInOut((p - 0.7) / 0.3) : 1
      z *= 1 + (c.amount ?? 0.25) * k
      if (c.to) { cx = lerp(cx, c.to.x, k); cy = lerp(cy, c.to.y, k) }
    } else {
      const k = (c.amount ?? 1.5) * (1 - p)
      dx += Math.sin(p * 61) * k
      dy += Math.cos(p * 47) * k * 0.7
    }
  }
  // 視野不能跑出畫好的背景；往下最多到舞台底（跟拍地上的角色時不要看到一大片地板）
  z = Math.max(z, 1)
  const hw = 80 / z, hh = 45 / z
  cx = clamp(cx, PAINTED.x0 + hw, PAINTED.x1 - hw)
  cy = clamp(cy, PAINTED.y0 + hh, 90 - hh)
  // 劇本的鏡頭是「以 (cx, cy) 為定點推近」。自動取景是「把畫面中心對到某一點」，疊在劇本鏡頭底下：
  // 先自動取景、再套劇本的鏡頭，換算成同一個定點加一段平移 (px, py)
  const a = autoCamAt(clip, t)
  const cam = a.z === 1 && a.cx === STAGE_MID.x && a.cy === STAGE_MID.y
    ? { z, cx, cy, dx, dy, px: 0, py: 0 }
    : { z: z * a.z, cx: a.cx, cy: a.cy, dx, dy, px: z * (STAGE_MID.x - cx) + cx - a.cx, py: z * (STAGE_MID.y - cy) + cy - a.cy }
  return isV2(clip) ? keepGlyphInView(clip, t, cam) : cam
}

/** v2：鏡頭四周要留給國字的邊 */
const GLYPH_MARGIN = 2
/** v2：鏡頭為了國字收回來時，原本視野左右至少要保住多少比例（以中心算） */
const KEEP_VIEW = 0.9
/** v2：震動（shake）可以讓國字的邊出畫面多少（舞台單位） */
const SHAKE_SLACK = 1

/**
 * v2 的字從頭到尾都在畫面上，所以鏡頭在任何時刻都要把國字當下的整個外框（加一點邊）留在畫面裡。
 * 自動取景本來就框著國字；切到字的是疊在上面的劇本鏡頭（punch、zoom、follow）與整支慢慢推近的那一點：
 * 它們以自己的定點推近，不知道國字在哪。這裡在最後把整個視野收回來——
 * 視野放寬到「原本的視野」和「國字的外框」都框得住（推近要看的東西一樣看得到，只是推得少一點、中心往國字那邊偏；
 * 左右兩邊可以切掉一成，下面只切地板線以下那條空地），
 * 震動另外限制在國字的外框外 SHAKE_SLACK 以內。v1 不經過這裡，畫面一格都不變。
 */
function keepGlyphInView(clip: Clip, t: number, cam: { z: number; cx: number; cy: number; dx: number; dy: number; px: number; py: number }) {
  const g = glyphBoxAt(clip, t)
  // 留邊，但不超出舞台（全景一定框得住）
  const b = { x0: Math.max(0, g.x0 - GLYPH_MARGIN), x1: Math.min(160, g.x1 + GLYPH_MARGIN), y0: Math.max(0, g.y0 - GLYPH_MARGIN), y1: Math.min(90, g.y1 + GLYPH_MARGIN) }
  let { z, cx, cy, px, py, dx, dy } = cam
  // 不含震動的視野：中心 (mx, my)，半寬 80 / z、半高 45 / z
  let mx = cx + (STAGE_MID.x - cx - px) / z, my = cy + (STAGE_MID.y - cy - py) / z
  let hw = 80 / z, hh = 45 / z
  if (mx - hw > b.x0 || mx + hw < b.x1 || my - hh > b.y0 || my + hh < b.y1) {
    // 原本的視野（推近要看的東西）與國字外框的聯集，再撐成 16:9；最多到全景。
    // 左右兩邊可以切掉一點；下面只切腳底下那條空地板（站在地上的角色一定整個留著），推近的力道才不會整個不見
    const kw = hw * KEEP_VIEW
    const u = { x0: Math.min(mx - kw, b.x0), x1: Math.max(mx + kw, b.x1), y0: Math.min(my - hh, b.y0), y1: Math.max(Math.min(my + hh, FLOOR + 4), b.y1) }
    // 只會推得比原本少，不會比劇本寫的更近
    hw = Math.min(80, Math.max(hw, (u.x1 - u.x0) / 2, ((u.y1 - u.y0) / 2) * (16 / 9)))
    hh = hw * (9 / 16)
    // 多出來的空間：中心盡量留在原本的地方，但不能跑出畫好的背景，往下最多到舞台底
    mx = clamp(clamp(mx, u.x1 - hw, u.x0 + hw), PAINTED.x0 + hw, PAINTED.x1 - hw)
    my = clamp(clamp(my, u.y1 - hh, u.y0 + hh), PAINTED.y0 + hh, 90 - hh)
    z = 80 / hw
    // 換成「以視野中心為定點推近、不再平移」的寫法（播放器只看 z 與視野中心，畫出來一樣）
    cx = mx; cy = my; px = STAGE_MID.x - mx; py = STAGE_MID.y - my
  }
  // 震動把視野平移 (dx, dy) / z：國字的外框最多出畫面 SHAKE_SLACK
  const sx = (GLYPH_MARGIN + SHAKE_SLACK) * z
  dx = clamp(dx, (mx - hw - b.x0) * z - sx, (mx + hw - b.x1) * z + sx)
  dy = clamp(dy, (my - hh - b.y0) * z - sx, (my + hh - b.y1) * z + sx)
  return { z, cx, cy, dx, dy, px, py }
}

const lastingOps = (clip: Clip) => (clip.camera ?? []).filter((c): c is CamLasting => c.do === 'zoom' || c.do === 'follow').sort((a, b) => a.at - b.at)

/** 劇本自己寫的 zoom／follow 在 t 的鏡頭（沒寫就是全景）。 */
function scriptedCam(clip: Clip, lasting: CamLasting[], t: number, actors?: ActorState[]): CamState {
  const where = (id: string | undefined, at: number, fallback: Vec): Vec => {
    if (!id) return fallback
    const a = (at === t && actors ? actors : actorsAt(clip, at)).find((x) => x.id === id)
    return a ? { x: a.x, y: a.y } : fallback
  }
  // 留下結果的鏡頭：每一個從「上一個在它開始時的狀態」漸變到自己的目標；follow 的目標跟著角色跑
  const stateAt = (i: number, at: number): CamState => {
    if (i < 0) return HOME
    const c = lasting[i]
    if (at < c.at) return stateAt(i - 1, at)
    const from = stateAt(i - 1, c.at)
    const p = easeInOut(clamp(c.dur > 0 ? (at - c.at) / c.dur : 1))
    const z = c.do === 'follow' ? (c.amount ?? 1.5) : (c.amount ?? 1.4)
    const center = c.do === 'follow' ? where(c.actor, at, { x: from.cx, y: from.cy })
      : c.to ?? where(c.actor, at, { x: HOME.cx, y: HOME.cy })
    return { z: lerp(from.z, z, p), cx: lerp(from.cx, center.x, p), cy: lerp(from.cy, center.y, p) }
  }
  return stateAt(lasting.length - 1, t)
}

/** 舞台正中間：自動取景「沒動」時的畫面中心 */
const STAGE_MID = { x: 80, y: 45 }

// ---------- 自動取景 ----------
// 角色在全景裡只有畫面的 1/12，國字拼好之前的戲常常擠在角落。劇本沒有自己運鏡的時候，
// 鏡頭自己推近到「正在演的角色」：取景範圍每 0.05 秒算一次、前後平滑（鏡頭會稍微先動，像攝影師預判），
// 推近最多 1.6 倍；國字開始拼之前平順地退回全景。國字拼好以後，有人在演時鏡頭往他那邊靠一點、推近一點點（最多 1.2 倍），
// 國字永遠整個留在畫面裡（照國字當下的位置與大小：讓位 park 後變小在上方，鏡頭可以更靠向在演的角色），
// 結尾 pulse 前回到全景。劇本自己寫了 zoom／follow 的時段尊重劇本。

const CAM_DT = 0.05
const CAM_MAX = 1.6
/** 國字拼好以後最多推近多少（國字要整個留在畫面裡，而且不能偏離中間太多） */
const POST_MAX = 1.2
/** 國字讓位（park）以後最多推近多少：國字變小在上方，角色在中間演，國字仍要整個在畫面裡 */
const PARKED_MAX = 1.5
const camCache = new WeakMap<Clip, { n: number; iz: Float32Array; cx: Float32Array; cy: Float32Array }>()

function autoCamAt(clip: Clip, t: number): CamState {
  const g = autoCamGrid(clip)
  // 故事屋的場景演完以後時間還在走（角色繼續呼吸、等他選）：鏡頭停在最後一格，不要跳回全景
  const i = (hasGlyph(clip) ? t : Math.min(t, clip.duration)) / CAM_DT
  const i0 = Math.floor(i)
  if (i0 < 0 || i0 + 1 >= g.iz.length) return { z: 1, cx: STAGE_MID.x, cy: STAGE_MID.y }
  const f = i - i0
  if (g.iz[i0] === 1 && g.iz[i0 + 1] === 1) return { z: 1, cx: STAGE_MID.x, cy: STAGE_MID.y }
  return { z: 1 / lerp(g.iz[i0], g.iz[i0 + 1], f), cx: lerp(g.cx[i0], g.cx[i0 + 1], f), cy: lerp(g.cy[i0], g.cy[i0 + 1], f) }
}

/** 一支劇本的自動取景表（每支只算一次）。 */
export function autoCamGrid(clip: Clip) {
  const sig = clip.moves.length * 1000 + (clip.camera?.length ?? 0) + (clip.glyph?.length ?? 0) * 1e6
  const hit = camCache.get(clip)
  if (hit && hit.n === sig) return hit
  const firstBuild = Math.min(...clip.builds.map((b) => b.at), clip.duration)
  const done = glyphDoneAt(clip)
  // v2：國字從第一格就在畫面上方，整支都要整個留在畫面裡（跟 v1 國字拼好以後一樣）；拼字時也不用退回全景
  const v2 = isV2(clip)
  // 結尾國字 pulse（或最後一秒）之前回到全景，國字最後一定是置中、完整、大大的
  // 沒有國字的場景（故事屋）開頭結尾都不退回全景：鏡頭一直框著在演的角色，下一段從同樣的站位接著演，換頁時鏡頭才不會一遠一近
  const glyphless = !hasGlyph(clip)
  const finale = glyphless ? Infinity : Math.min(clip.duration - 1, ...(clip.glyph ?? []).filter((g) => g.do === 'pulse' && g.at >= done).map((g) => g.at))
  const n = Math.ceil(clip.duration / CAM_DT) + 2
  // 存的是 1/倍率（視野寬度的比例）：平滑、漸變都在這個空間做，框住國字的鏡頭混出來還是框得住
  const iz = new Float32Array(n).fill(1), cx = new Float32Array(n).fill(STAGE_MID.x), cy = new Float32Array(n).fill(STAGE_MID.y)
  const lasting = lastingOps(clip)
  const moves = sortedMoves(clip)
  // 不能自動運鏡的時段。hard：前後都要平順地退回全景（拼字、結尾、國字拼好後的 punch／shake）；
  // scripted：劇本自己的 zoom／follow 在推，自動取景在劇本推的那段時間裡慢慢讓出來，劇本退回全景後再慢慢接回來
  const hard = new Uint8Array(n), scripted = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    const t = i * CAM_DT
    // 開場先給一眼全景（看清楚誰在哪裡），再推近
    if (!glyphless && (t < 0.2 || (!v2 && t >= firstBuild - 0.05 && t <= done + 0.3) || t >= finale)) hard[i] = 1
    // 問他（ask）：全景，國字在正中央
    if (v2 && (clip.glyph ?? []).some((g) => g.do === 'ask' && t >= g.at - 0.3 && t <= g.at + g.dur + 0.1)) hard[i] = 1
    if (t > done && (clip.camera ?? []).some((c) => (c.do === 'punch' || c.do === 'shake') && t >= c.at - 0.05 && t <= c.at + c.dur)) hard[i] = 1
    if (lasting.length && scriptedCam(clip, lasting, t).z > 1.005) scripted[i] = 1
  }
  const banned = hard
  // 每一格要框住的範圍（左、右、上、下）；沒有要框的就是 NaN
  const box = [0, 1, 2, 3].map(() => new Float32Array(n).fill(NaN))
  const postAt = (i: number) => v2 || i * CAM_DT > done
  for (let i = 0; i < n; i++) {
    if (banned[i]) continue
    const t = i * CAM_DT
    const post = postAt(i)
    const all = baseActorsAt(clip, t).filter((a) => a.visible && a.o > 0.3 && a.size * a.s <= 50 && a.x > -8 && a.x < 168 && a.y > -15 && a.y < 100)
    const busy = (id: string) => moves.some((m) => m.actor === id && m.at - 0.4 <= t && m.at + durOf(m) + 0.4 >= t)
      || (clip.fx ?? []).some((f) => (f.actor === id || f.target === id) && f.at - 0.2 <= t && f.at + (f.dur ?? FX_DUR[f.kind]) + 0.2 >= t)
    const act = all.filter((a) => busy(a.id))
    // 國字拼好以後：只有真的有人在演才動
    const pick = act.length || post ? act : all
    if (!pick.length) continue
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    const add = (a: ActorState) => {
      const r = a.size * a.s
      // prop: 照內容範圍（寬扁的捷運不要框進一大片天空）
      const b = a.emoji.startsWith(PROP_PREFIX) ? bodyBox({ ...a, sy: 1 }, 0.5) : null
      x0 = Math.min(x0, (b ? b.x0 : a.x - r * 0.5) - 4); x1 = Math.max(x1, (b ? b.x1 : a.x + r * 0.5) + 4)
      // 頭上要留位置給冒出來的符號、想法泡泡
      y0 = Math.min(y0, (b ? b.y0 : a.y - r * 0.45) - 12); y1 = Math.max(y1, (b ? b.y1 : a.y + r * 0.5) + 3)
    }
    pick.forEach(add)
    // 沒在演、但已經有一半進到畫面裡的（旁邊的道具、等著的人）整個框進來，不要切一半
    const zz = clamp(Math.min(160 / (x1 - x0), 90 / (y1 - y0)), 1, CAM_MAX), mx = (x0 + x1) / 2, my = (y0 + y1) / 2
    for (const a of all) if (!pick.includes(a) && Math.abs(a.x - mx) < 80 / zz && Math.abs(a.y - my) < 45 / zz) add(a)
    box[0][i] = x0; box[1][i] = x1; box[2][i] = y0; box[3][i] = y1
  }
  // 前後 0.3 秒內要框到的都框進來（鏡頭先讓出位置給要進場的人），再前後平滑（不會落後，也不會抖）
  const W = Math.round(0.3 / CAM_DT)
  const grown = box.map((arr, k) => {
    const out = new Float32Array(n).fill(NaN)
    for (let i = 0; i < n; i++) {
      if (banned[i]) continue
      let v = NaN
      for (let j = Math.max(0, i - W); j <= Math.min(n - 1, i + W); j++) {
        if (Number.isNaN(arr[j]) || postAt(j) !== postAt(i)) continue
        v = Number.isNaN(v) ? arr[j] : k % 2 ? Math.max(v, arr[j]) : Math.min(v, arr[j])
      }
      out[i] = v
    }
    return out
  })
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(grown[0][i])) continue
    let [x0, x1, y0, y1] = grown.map((g) => g[i])
    const post = postAt(i)
    // 國字拼好以後，國字整個要留在畫面裡（照國字當下的位置與大小：讓位後變小、在上方），而且在正中央時不能偏離中間太多
    const gb = post ? glyphBoxAt(clip, i * CAM_DT) : null
    if (gb) {
      x0 = Math.min(x0, gb.x0 - 4); x1 = Math.max(x1, gb.x1 + 4)
      y0 = Math.min(y0, gb.y0 - 4); y1 = Math.max(y1, gb.y1 + 4)
    }
    // 國字讓位以後（縮小到 0.9 倍以下）：鏡頭可以推近到在演的角色，跟拼字前一樣最多 PARKED_MAX
    const parked = !!gb && gb.k < 0.9
    const max = !post ? CAM_MAX : parked ? PARKED_MAX : POST_MAX
    let c = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
    // 讓位以後放寬到 ±22（鏡頭可以靠向在演的角色，但不要整個甩到一邊，國字在畫面裡滑來滑去）
    if (post) { const w = parked ? 22 : 12; c = { x: clamp(c.x, STAGE_MID.x - w, STAGE_MID.x + w), y: c.y } }
    // 中心被限制住時，視野要放寬到還是框得住
    const hw = Math.max(c.x - x0, x1 - c.x, 80 / max), hh = Math.max(c.y - y0, y1 - c.y)
    const z = clamp(Math.min(80 / hw, 45 / hh), 1, max)
    // 視野不能跑出畫好的背景，往下最多到舞台底。遠景有視差（推近時只放大四成），所以左右上方要多留一點
    const zp = 1 + (z - 1) * 0.4
    iz[i] = 1 / z; cx[i] = clamp(c.x, PAINTED.x0 + 80 / zp, PAINTED.x1 - 80 / zp); cy[i] = clamp(c.y, PAINTED.y0 + 45 / zp, 90 - 45 / z)
  }
  const smooth = (arr: Float32Array, tau: number) => {
    const k = 1 - Math.exp(-CAM_DT / tau)
    for (let i = 1; i < n; i++) arr[i] = arr[i - 1] + (arr[i] - arr[i - 1]) * k
    for (let i = n - 2; i >= 0; i--) arr[i] = arr[i + 1] + (arr[i] - arr[i + 1]) * k
  }
  smooth(iz, 0.3); smooth(cx, 0.3); smooth(cy, 0.3)
  // 平滑過的鏡頭追不上衝得很快的角色：這一刻要框的東西超出視野，就把視野放寬（放寬的部分也平順地來去）
  const need = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(box[0][i])) continue
    let [x0, x1, y0, y1] = box.map((b) => b[i])
    if (postAt(i)) {
      const gb = glyphBoxAt(clip, i * CAM_DT)
      x0 = Math.min(x0, gb.x0 - 4); x1 = Math.max(x1, gb.x1 + 4); y0 = Math.min(y0, gb.y0 - 4); y1 = Math.max(y1, gb.y1 + 4)
    }
    need[i] = Math.min(1, Math.max(cx[i] - x0, x1 - cx[i]) / 80, Math.max(cy[i] - y0, y1 - cy[i]) / 45)
  }
  const wide = new Float32Array(n)
  for (let i = 0; i < n; i++) for (let j = Math.max(0, i - 3); j <= Math.min(n - 1, i + 3); j++) wide[i] = Math.max(wide[i], need[j])
  smooth(wide, 0.1)
  for (let i = 0; i < n; i++) iz[i] = Math.min(1, Math.max(iz[i], wide[i]))
  const RAMP = 0.6
  const ahead = new Float32Array(n)
  for (let i = n - 1, d = 1e9; i >= 0; i--) { d = hard[i] ? 0 : d + CAM_DT; ahead[i] = d }
  // 劇本開始推的那一刻：自動取景在劇本那一段 zoom／follow 的時間裡慢慢退掉（兩個疊在一起，畫面不會跳）
  const handoff = (t: number) => lasting.find((c) => t >= c.at && t <= c.at + Math.max(c.dur, 0.25) && scriptedCam(clip, lasting, c.at - 0.001).z <= 1.005)
  for (let i = 0, since = 1e9, sinceScript = 1e9, held = 1; i < n; i++) {
    const t = i * CAM_DT
    since = hard[i] ? 0 : since + CAM_DT
    let ws: number
    if (scripted[i]) {
      const c = handoff(t)
      ws = c ? held * (1 - easeInOut(clamp((t - c.at) / Math.max(c.dur, 0.25)))) : 0
      sinceScript = 0
    } else {
      sinceScript += CAM_DT
      ws = held = easeInOut(clamp(sinceScript / RAMP))
    }
    const w = Math.min(ws, easeInOut(clamp(Math.min(since, ahead[i]) / RAMP)))
    iz[i] = 1 + (iz[i] - 1) * w; cx[i] = STAGE_MID.x + (cx[i] - STAGE_MID.x) * w; cy[i] = STAGE_MID.y + (cy[i] - STAGE_MID.y) * w
  }
  const out = { n: sig, iz, cx, cy }
  camCache.set(clip, out)
  return out
}

/** 時間 t 看得到的舞台範圍（給 anim:check 檢查國字有沒有被鏡頭切掉）：畫面四個角換回舞台座標。 */
export function viewAt(clip: Clip, t: number) {
  const { z, cx, cy, dx, dy, px, py } = cameraAt(clip, t)
  const back = (sx: number, sy: number) => ({ x: cx + (sx - cx - dx - px) / z, y: cy + (sy - cy - dy - py) / z })
  const a = back(0, 0), b = back(160, 90)
  return { x0: a.x, x1: b.x, y0: a.y, y1: b.y }
}

export function lightAt(clip: Clip, t: number) {
  let level = 0
  for (const l of [...(clip.lights ?? [])].sort((a, b) => a.at - b.at)) {
    if (t < l.at) break
    level = lerp(level, l.level, l.dur > 0 ? clamp((t - l.at) / l.dur) : 1)
  }
  return level
}
