import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 空（v2）：一板一眼的小機器人想飛上天空。他背上綁著一支小火箭，每次蹲低、「咻——」一點火就往上衝，火焰拖出一條長長的線，
// 飛到最高點火箭「噗」地熄火，他在半空傻眼，「咚」地掉下來，一次比一次高、摔得一次比一次慘：
// 才離地一點點就熄火、一屁股跌坐（宀從熄火的那團煙飛出來）→ 衝到天上那朵雲那麼高、頭都碰到雲了才熄火，摔扁（八）→
// 先停一拍：他托著下巴看雲、火箭抖個不停——這次「咻——」直接衝過雲、把雲撞得歪到一邊，飛出畫面頂端（工）……
// 國字回中央（他還在天上）；國字讓位後他才從最高的地方「咚」地掉回來，摔最扁、滿天星星。
// 語詞那一刻雲飄回畫面中間、變得又大又白，他爬起來指著上面：「天空」。
// 回馬槍（第四次）：最後一次點火，衝過雲、飛出畫面頂端——雲往下掉出畫面（他還在往上飛），天越來越黑，星星和月亮出來了：太空！
// 他從下面飄上來，火箭照樣「噗」地熄火……可是這次他沒有掉下去，在太空裡開心地飄著、轉圈圈。
// 最後畫面暗下來只剩「空」，他飄下來問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「空！」，然後退場只留字。
// 刻意不跟「高」（跳起來抓氣球）、「喜」（氣球把人帶上天）、「風」（風箏把人拉上天）、「爸」（被拋上天）、「腿」（腿伸長搆天上的星星）、
// 「冰」（被冰到彈起來）撞：這支是自己用火箭往天空衝，雲是固定的高度刻度。
// 空、空、天空、這是什麼字？、空

/** 小機器人（size 34）站在地上的 y */
const BS = 34
const BY = 77 - 0.42 * BS
/** 每次都在同一個地方點火（畫面中間偏右，飛上去的路線不經過左上角的字框） */
const X = 108
/** 火箭（size 15）綁在他背上：圖朝左，背在右邊 */
const RS = 15
const RDX = 11, RDY = 1
/** 雲（高度的刻度）：一開始在他正上方偏左 */
const CX = 98, CY = 13, CS = 30
/** 字框搬到左上角（飛的路線、雲都不經過） */
const FRAME = { x: 30, y: 21 }
const FRAME_K = 0.5
/** 在半空中傻眼停多久，才掉下去 */
const HOLD = 0.42

/** 火箭跟著他一起動（同一刻、同樣的 ease） */
function both(at: number, dur: number, x: number, y: number, ease?: Move['ease']): Move[] {
  return [
    { at, actor: 'bot', do: 'moveTo', to: { x, y }, dur, ease },
    { at, actor: 'rocket', do: 'moveTo', to: { x: x + RDX, y: y + RDY }, dur, ease },
  ]
}

/**
 * 「蹲—咻—噗—咚」：他蹲低（預備）→ 點火「咻——」往上衝，火焰從火箭屁股拉一條線到地上（看得出飛多高）→
 * 最高點火箭「噗」地冒一團煙熄火，他傻眼停 HOLD 秒 → 掉下來，落地 💥＋鏡頭推近＋震，火箭摔到旁邊。
 * k 是第幾次，at 是到最高點（熄火）那一刻，top 是飛到的 y，rise 是往上衝多久。
 * 第 3 次（k 2）不熄火、直接衝出畫面頂端，掉下來另外寫。
 */
function fly(at: number, k: number, top: number, rise: number) {
  const go = at - rise
  const fall = k === 0 ? 0.16 : 0.28
  const land = at + HOLD + fall
  const moves: Move[] = [
    // 預備：蹲低、火箭抖一下
    { at: go - 0.26, actor: 'bot', do: 'squash', amount: 0.2 + 0.05 * k, dur: 0.24 },
    { at: go - 0.26, actor: 'rocket', do: 'shake', amount: 0.8 + 0.4 * k, dur: 0.24 },
    // 咻——！雙手往上伸
    { at: go, actor: 'bot', do: 'swap', emoji: 'hero:bot/jump' },
    ...both(go, rise, X, top, k >= 2 ? 'in' : 'out'),
  ]
  const fx: Fx[] = [
    // 點火：地上冒一團火，火焰拖一條線到地上
    { at: go, kind: 'burst', x: X + RDX, y: 70, emoji: '🔥', n: 1, dur: 0.35, scale: 1.1 + 0.25 * k },
    { at: go, kind: 'line', actor: 'rocket', dy: 6, to: { x: X + RDX, y: 75 }, color: '#FF8A1E', width: 2.2 + 0.6 * k, dur: rise + 0.12 },
  ]
  const cues: Cue[] = [{ at: go, sfx: 'whoosh' }]
  const camera: Camera[] = []
  if (k < 2) {
    moves.push(
      // 噗——熄火，傻眼停在半空
      { at, actor: 'rocket', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: at + 0.06, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
      // 掉下來
      ...both(at + HOLD, fall, X, BY, 'in'),
      { at: land, actor: 'bot', do: 'swap', emoji: k === 0 ? 'hero:bot/fall' : 'hero:bot/flat' },
      { at: land, actor: 'bot', do: 'squash', amount: 0.3 + 0.12 * k, dur: 0.3 + 0.1 * k },
      // 火箭摔到他旁邊的地上，橫躺著
      { at: land, actor: 'rocket', do: 'moveTo', to: { x: X + 22, y: 72 }, arc: 4, dur: 0.2, ease: 'out' },
      { at: land, actor: 'rocket', do: 'rotateTo', amount: 80, dur: 0.2 },
    )
    fx.push(
      { at, kind: 'burst', x: X + RDX, y: top + 8, emoji: 'prop:smoke', n: 1, dur: 0.5, scale: 0.75 + 0.2 * k },
      { at: land, kind: 'burst', x: X - 6, y: BY - 12, n: 1, dur: 0.4, scale: 1.5 + 0.5 * k },
    )
    if (k >= 1) fx.push({ at: land, kind: 'burst', x: X, y: BY - 2, emoji: '⭐', n: 6, dur: 0.45 })
    cues.push({ at, sfx: 'deflate' }, { at: land, sfx: 'bonk' })
    if (k >= 1) cues.push({ at: land + 0.04, sfx: 'boing' })
    camera.push(
      { at: land, dur: 0.4, do: 'punch', amount: 0.08 + 0.05 * k, to: { x: X, y: BY - 6 } },
      { at: land, dur: 0.3, do: 'shake', amount: 1 + 0.6 * k },
    )
  }
  return { moves, fx, cues, camera, land }
}

/** 他爬起來、火箭跳回背上 */
function getUp(at: number): Move[] {
  return [
    { at, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at, actor: 'rocket', do: 'rotateTo', amount: -80, dur: 0.2 },
    { at, actor: 'rocket', do: 'moveTo', to: { x: X + RDX, y: BY + RDY }, arc: 5, dur: 0.22, ease: 'out' },
  ]
}

const f1 = fly(1.35, 0, BY - 7, 0.22)
const f2 = fly(3.15, 1, 39, 0.42)
// 第 3 次：5.2 點火，5.75 衝出畫面頂端
const G3 = 5.75
const f3 = fly(G3, 2, -48, 0.55)
/** 第 3 次衝過雲的那一刻（ease in：大約在 0.6 的時間） */
const THRU = 5.5
const HOME = 6.1
const PARK = 7.0
/** 從最高的地方掉回來 */
const DROP = 7.45
const SPLAT = DROP + 0.32
/** 語詞 */
const WORD = 8.45
/** 回馬槍：點火、衝出畫面頂端 */
const GO4 = 9.15
const OUT4 = GO4 + 0.35
/** 太空 */
const SPACE = OUT4 + 0.3
const FLOAT = { x: 84, y: 44 }
const PUFF4 = SPACE + 0.6
/** 問他 */
const ASK = 11.0
const ASKSAY = 11.1
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '空',
  meta: { theme: '小機器人用火箭飛上天空', cast: '小機器人＋背上的火箭＋一朵雲', gags: ['小機器人每次蹲低點火、背上的火箭咻地把他往天空衝，到最高點火箭噗地熄火、他咚地掉下來，一次比一次高（離地一點點→碰到雲→衝過雲飛出畫面），摔得一次比一次慘；回馬槍是最後一次衝出畫面，雲往下掉、天變黑、星星月亮出來——飛到太空了，火箭照樣熄火，這次他卻沒有掉下來，在太空裡開心地飄'] },
  duration: 15,
  bg: { top: '#7EC8FF', bottom: '#D8F0FF', floor: '#A8D77C', scenery: 'hills' },
  actors: [
    // 雲：天空的刻度（每次飛多高就看雲）
    { id: 'cloud', emoji: 'prop:cloud-happy', x: CX, y: CY, size: CS, float: true },
    { id: 'rocket', emoji: '🚀', x: X + RDX + 60, y: BY + RDY, size: RS, float: true, pivot: 'center' },
    { id: 'bot', emoji: 'hero:bot/idle', x: X + 60, y: BY, size: BS },
    // 太空裡畫在黑幕上面的他和火箭（只在回馬槍出現）
    { id: 'rocketS', emoji: '🚀', x: FLOAT.x + RDX, y: 130, size: RS, float: true, pivot: 'center', top: true, hidden: true },
    { id: 'botS', emoji: 'hero:bot/happy', x: FLOAT.x, y: 130, size: BS, float: true, pivot: 'center', top: true, hidden: true },
  ],
  moves: [
    // 火箭轉成頭朝上，背在他背上
    { at: 0, actor: 'rocket', do: 'rotateTo', amount: -45, dur: 0.01 },
    { at: 0, actor: 'rocketS', do: 'rotateTo', amount: -45, dur: 0.01 },
    { at: 0, actor: 'cloud', do: 'bounce', amount: 1, times: 2, dur: 1.0 },
    // 登場：從右邊走進來，指著上面的天空
    ...both(0, 0.45, X, BY, 'out'),
    { at: 0.5, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 0.85, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    // 第 1 次：才離地一點點
    ...f1.moves,
    ...getUp(f1.land + 0.45),
    // 第 2 次：衝到雲那麼高，頭碰到雲
    ...f2.moves,
    { at: 3.12, actor: 'cloud', do: 'squash', amount: 0.15, dur: 0.25 },
    ...getUp(f2.land + 0.45),
    // 先停一拍：托下巴看雲、火箭抖個不停……
    { at: 4.3, actor: 'bot', do: 'swap', emoji: 'hero:bot/ponder' },
    { at: 4.35, actor: 'rocket', do: 'shake', amount: 1, dur: 0.5 },
    { at: 4.75, actor: 'bot', do: 'swap', emoji: 'hero:bot/know' },
    { at: 4.75, actor: 'bot', do: 'hop', amount: 2, dur: 0.2 },
    // 第 3 次：直接衝過雲，把雲撞歪到右上角，飛出畫面頂端
    ...f3.moves,
    { at: THRU, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-puff' },
    { at: THRU, actor: 'cloud', do: 'moveTo', to: { x: 137, y: 11 }, dur: 0.35, ease: 'out' },
    { at: THRU, actor: 'cloud', do: 'rotateTo', amount: 14, dur: 0.35 },
    // 國字回中央又讓位以後，他從最高的地方掉回來：摔最扁
    { at: DROP - 0.05, actor: 'bot', do: 'swap', emoji: 'hero:bot/surprised' },
    ...both(DROP, 0.32, X, BY, 'in'),
    { at: SPLAT, actor: 'bot', do: 'swap', emoji: 'hero:bot/flat' },
    { at: SPLAT, actor: 'bot', do: 'squash', amount: 0.55, dur: 0.45 },
    { at: SPLAT, actor: 'rocket', do: 'moveTo', to: { x: X + 24, y: 72 }, arc: 6, dur: 0.25, ease: 'out' },
    { at: SPLAT, actor: 'rocket', do: 'rotateTo', amount: 80, dur: 0.25 },
    // 語詞那一刻：雲飄回畫面中間、又大又白，他爬起來指著天空
    { at: 7.9, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-happy' },
    { at: 7.9, actor: 'cloud', do: 'rotateTo', amount: -14, dur: 0.4 },
    { at: 7.9, actor: 'cloud', do: 'moveTo', to: { x: 80, y: 18 }, dur: 0.45, ease: 'out' },
    { at: 7.9, actor: 'cloud', do: 'scaleTo', amount: 1.35, dur: 0.45, ease: 'back' },
    ...getUp(8.2),
    { at: 8.4, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: 8.4, actor: 'bot', do: 'hop', amount: 3, dur: 0.3 },
    { at: WORD, actor: 'cloud', do: 'bounce', amount: 1.5, times: 2, dur: 0.6 },
    // 回馬槍（第 4 次）：最大的一次點火
    { at: GO4 - 0.3, actor: 'bot', do: 'squash', amount: 0.3, dur: 0.28 },
    { at: GO4 - 0.3, actor: 'rocket', do: 'shake', amount: 2, dur: 0.28 },
    { at: GO4, actor: 'bot', do: 'swap', emoji: 'hero:bot/jump' },
    ...both(GO4, 0.35, X, -50, 'in'),
    // 雲往下掉出畫面（他還在往上飛），天越來越黑
    { at: OUT4, actor: 'cloud', do: 'moveTo', to: { x: 80, y: 135 }, dur: 0.4, ease: 'in' },
    { at: OUT4 + 0.45, actor: 'cloud', do: 'vanish', dur: 0.01 },
    // 太空：他從下面飄上來，開心地轉圈
    { at: SPACE, actor: 'botS', do: 'pop', dur: 0.01 },
    { at: SPACE, actor: 'rocketS', do: 'pop', dur: 0.01 },
    { at: SPACE, actor: 'botS', do: 'moveTo', to: FLOAT, dur: 0.45, ease: 'out' },
    { at: SPACE, actor: 'rocketS', do: 'moveTo', to: { x: FLOAT.x + RDX, y: FLOAT.y + RDY }, dur: 0.45, ease: 'out' },
    { at: SPACE + 0.45, actor: 'botS', do: 'rotateTo', amount: -20, dur: 0.3 },
    { at: SPACE + 0.45, actor: 'rocketS', do: 'moveTo', to: { x: FLOAT.x + RDX - 1, y: FLOAT.y + RDY - 4 }, dur: 0.3 },
    // 火箭照樣「噗」地熄火……飄走了，可是他沒有掉下去
    { at: PUFF4, actor: 'rocketS', do: 'shake', amount: 1.2, dur: 0.25 },
    { at: PUFF4 + 0.15, actor: 'rocketS', do: 'moveTo', to: { x: 180, y: 10 }, dur: 0.4, ease: 'in' },
    { at: PUFF4 + 0.15, actor: 'rocketS', do: 'rotateTo', amount: 200, dur: 0.4 },
    { at: PUFF4 + 0.1, actor: 'botS', do: 'swap', emoji: 'hero:bot/surprised' },
    { at: PUFF4 + 0.45, actor: 'botS', do: 'swap', emoji: 'hero:bot/happy' },
    { at: PUFF4 + 0.45, actor: 'botS', do: 'rotateTo', amount: 20, dur: 0.3 },
    { at: PUFF4 + 0.45, actor: 'botS', do: 'hop', amount: 3, dur: 0.4 },
    // 問他：天亮回來、換回一般的他（keep），飄到左前方、變大，轉向觀眾
    { at: ASK, actor: 'bot', do: 'swap', emoji: 'hero:bot/idle' },
    { at: ASK, actor: 'bot', do: 'moveTo', to: FLOAT, dur: 0.01 },
    { at: ASK, actor: 'rocket', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.01, actor: 'botS', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.02, actor: 'bot', do: 'moveTo', to: { x: 34, y: BY + 4 }, dur: 0.4, ease: 'out' },
    { at: ASK, actor: 'bot', do: 'scaleTo', amount: 1.4, dur: 0.35, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.15, actor: 'bot', do: 'swap', emoji: 'hero:bot/listen' },
    { at: 12.15, actor: 'bot', do: 'flip' },
    { at: 12.15, actor: 'bot', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.7, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.2, actor: 'bot', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bot', do: 'rotateTo', amount: -8, dur: 0.1 },
    { at: ANSWER, actor: 'bot', do: 'swap', emoji: 'hero:bot/point' },
    { at: ANSWER, actor: 'bot', do: 'hop', amount: 7, dur: 0.25 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.18, actor: 'bot', do: 'swap', emoji: 'hero:bot/happy' },
    { at: ANSWER + 0.18, actor: 'bot', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'bot', do: 'moveTo', to: { x: -45, y: BY + 4 }, dur: 0.18, ease: 'in' },
  ],
  builds: [
    // 每次熄火「噗」的那團煙裡飛出一組：宀 → 八 → 工（第 3 次是衝過雲那一下，從火箭上飛出來）
    { at: f1.land - 0.5, dur: 0.6, strokes: [0, 1, 2], from: 'rocket', color: partColor('宀') },
    { at: 3.2, dur: 0.6, strokes: [3, 4], from: 'rocket', color: partColor('八') },
    { at: THRU - 0.02, dur: 0.55, strokes: [5, 6, 7], from: 'rocket', color: partColor('工') },
  ],
  glyph: [
    // 空字框一開始就在左上角
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.4, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的他
    { at: ASK, dur: 2.95, do: 'ask', keep: ['bot'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    ...f1.fx,
    { at: f1.land + 0.1, kind: 'sweat', actor: 'bot' },
    ...f2.fx,
    { at: f2.land + 0.1, kind: 'dizzy', actor: 'bot', dur: 0.35 },
    ...f3.fx,
    // 衝過雲那一下
    { at: THRU, kind: 'burst', x: CX + 4, y: CY + 12, emoji: 'prop:smoke', n: 1, dur: 0.45, scale: 1.1 },
    // 從最高的地方摔下來
    { at: SPLAT, kind: 'burst', x: X - 8, y: BY - 14, n: 1, dur: 0.45, scale: 2.6 },
    { at: SPLAT, kind: 'burst', x: X, y: BY - 4, emoji: '⭐', n: 10, dur: 0.5 },
    { at: SPLAT + 0.2, kind: 'dizzy', actor: 'bot', dur: 0.55 },
    // 回馬槍：最大的火
    { at: GO4, kind: 'burst', x: X + RDX, y: 69, emoji: '🔥', n: 1, dur: 0.4, scale: 2 },
    { at: GO4, kind: 'line', actor: 'rocket', dy: 6, to: { x: X + RDX, y: 75 }, color: '#FF8A1E', width: 4.4, dur: 0.5 },
    // 太空：星星和月亮
    { at: SPACE - 0.1, kind: 'pop', x: 106, y: 44, emoji: '🌙', dur: 1.25, scale: 3.2 },
    { at: SPACE - 0.05, kind: 'pop', x: 52, y: 56, emoji: '⭐', dur: 1.2, scale: 1.2 },
    { at: SPACE, kind: 'pop', x: 140, y: 58, emoji: '⭐', dur: 1.15, scale: 1.2 },
    { at: SPACE + 0.05, kind: 'pop', x: 62, y: 14, emoji: '✨', dur: 1.1, scale: 1.2 },
    { at: SPACE + 0.1, kind: 'pop', x: 108, y: 70, emoji: '✨', dur: 1.05, scale: 1.2 },
    { at: SPACE + 0.15, kind: 'pop', x: 18, y: 66, emoji: '⭐', dur: 1.0, scale: 1.2 },
    { at: PUFF4, kind: 'burst', x: FLOAT.x + RDX, y: FLOAT.y + 6, emoji: 'prop:smoke', n: 1, dur: 0.45, scale: 0.9 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會把飛上去的他、雲切掉）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...f1.camera,
    ...f2.camera,
    { at: SPLAT, dur: 0.45, do: 'punch', amount: 0.14, to: { x: X, y: BY - 6 } },
    { at: SPLAT, dur: 0.4, do: 'shake', amount: 2.4 },
    { at: GO4, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    // 國字回中央的白光
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.3, level: 0 },
    // 飛到太空：天越來越黑
    { at: OUT4, dur: 0.4, level: 0.8 },
    { at: ASK, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '空' },
    ...f1.cues,
    ...f2.cues,
    ...f3.cues,
    { at: THRU, sfx: 'poof' },
    { at: HOME + 0.1, say: '空' },
    { at: DROP, sfx: 'whoosh' },
    { at: SPLAT, sfx: 'bonk' },
    { at: SPLAT + 0.04, sfx: 'boing' },
    { at: SPLAT + 0.08, sfx: 'rumble' },
    { at: WORD, say: '天空' },
    { at: GO4, sfx: 'whoosh' },
    { at: GO4 + 0.05, sfx: 'laser' },
    { at: SPACE + 0.1, sfx: 'blip' },
    { at: PUFF4, sfx: 'deflate' },
    { at: ASKSAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '空' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
