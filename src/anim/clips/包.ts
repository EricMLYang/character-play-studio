import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 包（v2）：楊捷睿快要上小學了，在收書包，什麼都想帶——每次拿起一樣東西、看看書包的開口量一量，放上去用力一塞，
// 「啵！」居然塞進去了，書包鼓大一圈、彈兩下，他好得意，再塞一個更大的：一本書（勹的一撇）→ 一整顆大西瓜（勹的橫折鉤）→
// 先停一拍：沒東西了⋯⋯小恐龍剛好走過來打招呼，他眼睛一亮，把整隻小恐龍頭下腳上舉起來往裡塞，尾巴還露在外面亂甩——
// 「啵」，連尾巴都進去了（巳：被包在裡面、蜷成一團的東西），書包大得像一顆球。
// 回馬槍（第四次）：他滿意地拉上拉鍊，轉身蹲下要把書包背起來——「嘿咻！」背不動，「啵」地整個人被書包往後拉倒，
// 躺在圓滾滾的書包上四腳朝天，像一隻翻過來的烏龜。
// 最後畫面暗下來只剩「包」，他從書包上滑下來問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「包！」，然後退場只留字。
// 包、包、書包、這是什麼字？、包

// ---- 場景 ----
/** 字框一開始就在左上角（背後是素色的天空）、楊捷睿的頭頂上：書包在正中間越鼓越大，不會擋到；國字放大到中間時書包往右推，路線不交叉 */
const FRAME = { x: 19, y: 19 }
const FRAME_K = 0.46
/** 書包（prop:backpack）：全片在畫面正中間。原始 size 32，每塞一次用 scaleTo＋stretchTo 鼓大一圈（以底部為準），一次比一次圓 */
const BX = 74
const BAG = 32
const BY = 77 - 0.42 * BAG
/** 塞了 k 次以後書包的寬、高（舞台單位）：最後是畫面上最大的東西 */
const SHAPES = [[32, 32], [40, 35], [48, 40], [67, 55]] as const
const W = (k: number) => SHAPES[k][0]
const H = (k: number) => SHAPES[k][1]
/** 塞了 k 次以後累積的倍率（scaleTo）與寬扁（stretchTo） */
const SC = (k: number) => Math.sqrt(W(k) * H(k)) / BAG
const ST = (k: number) => Math.sqrt(W(k) / H(k))
/** 書包的開口（最上面）在哪個高度 */
const top = (k: number) => 77 - 0.9 * H(k)
/** 楊捷睿：圖朝左，整支 flip 朝右，站在書包左邊面向書包。書包越鼓越大，他每次被頂退一點 */
const YS = 38
const YY = 77 - 0.42 * YS
const yx = (k: number) => BX - W(k) / 2 - 12
/** 他把東西舉在頭上：東西的底在這個高度 */
const HANDS = 42
/** 被塞的東西（同一個 item 角色反覆用）：原始 size，換東西時 scaleTo 到那樣東西的大小（以底部為準） */
const IS = 20
/** 東西的底要在 bottom 這個高度時，角色的 y */
const iy = (bottom: number, base = IS) => bottom - 0.42 * base
/** 小恐龍：比楊捷睿、比書包都高的一大隻 */
const RS = 46
const RY = 77 - 0.42 * RS
/** 塞進去以後得意停多久 */
const HOLD = 0.5

/**
 * 「啵」：他看看書包的開口量一量（書包緊張地抖一下）→ 把東西放上開口（下半截卡在裡面）→ 換成推的姿勢用力往下一塞，
 * 東西一邊抖一邊往下擠 → 「啵！」整個進去了：💥＋鏡頭推近＋震＋同一個音效，書包鼓大一圈、彈兩下，把他頂退一步，他得意地停 HOLD 秒。
 * at 是「啵」那一刻、k 是第幾次（越後面越大）、id 是被塞的角色、size 是它塞之前的大小、base 是那個角色的原始 size、
 * squeeze 是塞的時候縮成幾成（一邊縮一邊擠進去）、sink 是放上開口／用力塞的時候各有幾成卡在書包裡。
 */
function stuff(at: number, k: number, id: string, size: number, base = IS, squeeze = 0.72, sink = [0.42, 0.62]) {
  const s = size * squeeze
  const place = at - 0.52, push = at - 0.3
  const win = ['happy', 'smug', 'happy'][k]
  const moves: Move[] = [
    // 預備：量一量——他往書包那邊探頭，書包抖一下
    { at: place - 0.33, dur: 0.3, actor: 'yang', do: 'tilt', amount: 7 },
    { at: place - 0.33, dur: 0.28, actor: 'bag', do: 'shake', amount: 0.6 + 0.3 * k },
    // 放上開口：下半截卡在書包裡，上半截露在外面
    { at: place, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: place, dur: 0.2, actor: id, do: 'moveTo', to: { x: BX - 1, y: iy(top(k) + sink[0] * s, base) }, arc: 3, ease: 'in' },
    { at: place, dur: 0.2, actor: id, do: 'scaleTo', amount: squeeze },
    { at: place + 0.2, dur: 0.16, actor: 'bag', do: 'squash', amount: 0.12 },
    // 用力一塞：他整個人壓上去，東西一邊抖一邊往下擠
    { at: push, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: push, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: yx(k) + 5, y: YY }, anticipate: 3, ease: 'in' },
    { at: push, dur: 0.3, actor: id, do: 'shake', amount: 1 + 0.6 * k },
    { at: push, dur: 0.3, actor: id, do: 'moveTo', to: { x: BX - 1, y: iy(top(k) + sink[1] * s, base) }, ease: 'in' },
    { at: push, dur: 0.3, actor: 'bag', do: 'shake', amount: 0.5 + 0.3 * k },
    // 啵！整個進去了
    { at, dur: 0.07, actor: id, do: 'moveTo', to: { x: BX, y: iy(top(k) + 1.15 * s, base) } },
    { at, dur: 0.08, actor: id, do: 'vanish' },
    // 書包鼓大一圈、彈兩下
    { at, dur: 0.28, actor: 'bag', do: 'scaleTo', amount: SC(k + 1) / SC(k), ease: 'back' },
    { at, dur: 0.28, actor: 'bag', do: 'stretchTo', amount: ST(k + 1) / ST(k), ease: 'back' },
    { at: at + 0.26, dur: 0.36, actor: 'bag', do: 'bounce', amount: 2.5 + k, times: 2 },
    // 他被鼓起來的書包頂退一步，愣一下——居然塞進去了！得意
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at, dur: 0.16, actor: 'yang', do: 'moveTo', to: { x: yx(k + 1), y: YY }, ease: 'out' },
    { at: at + 0.18, actor: 'yang', do: 'swap', emoji: `hero:yang/${win}` },
    { at: at + 0.18, dur: 0.26, actor: 'yang', do: 'hop', amount: 2.5 + k },
  ]
  const fx: Fx[] = [
    // 💥 每次都在書包的開口，一次比一次大；鼓起來那一下噴一圈小星星
    { at, kind: 'burst', x: BX, y: top(k) + 3, n: 1, dur: 0.4, scale: 1.5 + 0.45 * k },
    { at: at + 0.05, kind: 'burst', x: BX, y: 77 - 0.5 * H(k + 1), emoji: '✨', n: 5 + 2 * k, dur: 0.45, scale: 1 + 0.2 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.06 + 0.035 * k, to: { x: BX - 6, y: 50 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues }
}

/**
 * 拿起下一樣東西：他轉身往畫面左邊外面一伸手，東西被他拖進來，再轉回來雙手舉到頭上。p 是開始的時刻、k 是第幾次。
 */
function pick(p: number, k: number, emoji: string, size: number): Move[] {
  return [
    { at: p, actor: 'yang', do: 'flip' },
    { at: p, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: p, dur: 0.01, actor: 'item', do: 'moveTo', to: { x: -30, y: iy(74) } },
    { at: p, actor: 'item', do: 'swap', emoji },
    { at: p + 0.01, dur: 0.02, actor: 'item', do: 'pop' },
    { at: p + 0.03, dur: 0.01, actor: 'item', do: 'scaleTo', amount: size / IS },
    { at: p + 0.05, dur: 0.22, actor: 'item', do: 'moveTo', to: { x: yx(k) - 14 - 0.3 * size, y: iy(72) }, ease: 'out' },
    { at: p + 0.3, actor: 'yang', do: 'flip' },
    { at: p + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: p + 0.3, dur: 0.2, actor: 'item', do: 'moveTo', to: { x: yx(k) + 10, y: iy(HANDS) }, arc: 4, ease: 'out' },
  ]
}

// ---- 時間表 ----
/** 東西：一本書（正常）→ 一整顆大西瓜 → 整隻小恐龍 */
const BOOK = 21, MELON = 33
const P1 = 0.72, T1 = P1 + 1.33
const P2 = T1 + HOLD, T2 = P2 + 1.33
/** 第三次前停一拍：沒東西了⋯⋯小恐龍走過來 */
const G3 = T2 + HOLD
const T3 = G3 + 2.15
const s1 = stuff(T1, 0, 'item', BOOK)
const s2 = stuff(T2, 1, 'item', MELON)
const s3 = stuff(T3, 2, 'rex', RS, RS, 0.9, [0.4, 0.55])
/** 小恐龍打招呼站的地方（書包右邊）、他跑過去把小恐龍舉起來的地方 */
const RX = 124
const GRAB = 102
/** 小恐龍被頭下腳上舉著時的 y（比東西低一點，不然頭頂出畫面） */
const RUP = iy(HANDS + 6, RS)
/** 字框填滿、國字到正中央：他先把圓滾滾的書包推到右邊，自己退到左邊 */
const SHOVE = T3 + HOLD
const HOME = SHOVE + 0.35
const PARK = HOME + 0.85
const BSIDE = 146, YSIDE = 22
/** 語詞那一刻：書包回到正中間，他站旁邊拍拍它 */
const WORD = PARK + 0.4
/** 回馬槍：拉上拉鍊、轉身蹲下背起來——啵，被往後拉倒 */
const ZIP = WORD + 0.5
const HEAVE = ZIP + 0.55
const FLOP = HEAVE + 0.45
/** 他背對書包蹲下的地方、被拉倒以後躺在書包上的地方 */
const BACKX = BX - W(3) / 2 - 3
const LIE = { x: BX - 20, y: 36 }
const ASK = FLOP + 0.8
const ASK_S = 1.4
const AX = 30
const ANSWER = ASK + 2.55
const END = ANSWER + 1.4

const clip: Clip = {
  format: 2,
  char: '包',
  meta: { theme: '楊捷睿收書包', cast: '楊捷睿＋書包＋小恐龍＋書、西瓜', gags: ['楊捷睿收書包什麼都想帶，每次量一量、對準開口用力一塞，「啵」居然塞進去了，書包鼓大一圈，一次塞得比一次離譜（一本書→一整顆大西瓜→頭下腳上的整隻小恐龍，尾巴還露在外面甩）；回馬槍是他拉上拉鍊轉身要把圓得像球的書包背起來，背不動，啵地整個人被書包往後拉倒、四腳朝天像翻過來的烏龜'] },
  duration: END,
  bg: { top: '#FFE6BE', bottom: '#FFF7E6', floor: '#B9DB92', scenery: 'hills' },
  actors: [
    // 小恐龍、被塞的東西畫在書包後面：放上開口時下半截被書包擋住，看起來就是卡在裡面
    { id: 'rex', emoji: 'hero:rex/walk', x: RX, y: RY, size: RS, hidden: true, pivot: 'center' },
    { id: 'item', emoji: '📕', x: -30, y: iy(74), size: IS, hidden: true, pivot: 'center' },
    { id: 'bag', emoji: 'prop:backpack', x: BX, y: BY, size: BAG },
    // 圖朝左，翻過來朝右：面向右邊的書包
    { id: 'yang', emoji: 'hero:yang/walk', x: yx(0), y: YY, size: YS, hidden: true, flip: true },
  ],
  moves: [
    // 楊捷睿跑進來：要上小學了，收書包！
    { at: 0, actor: 'yang', do: 'enter', from: { x: -30, y: YY }, dur: 0.35, ease: 'out' },
    { at: 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 0.35, dur: 0.3, actor: 'yang', do: 'hop', amount: 3 },
    { at: 0.4, dur: 0.25, actor: 'bag', do: 'hop', amount: 2 },
    // 第 1 次：一本書
    ...pick(P1, 0, '📕', BOOK),
    ...s1.moves,
    // 第 2 次：一整顆大西瓜
    ...pick(P2, 1, 'prop:watermelon', MELON),
    ...s2.moves,
    // 第 3 次前停一拍：他托著下巴左看右看，還能帶什麼？小恐龍剛好走過來揮手
    { at: G3, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: G3 + 0.03, actor: 'yang', do: 'flip' },
    { at: G3 + 0.25, actor: 'yang', do: 'flip' },
    { at: G3 - 0.2, actor: 'rex', do: 'enter', from: { x: 190, y: RY }, dur: 0.45, ease: 'out' },
    { at: G3 + 0.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/wave' },
    // 他眼睛一亮：就帶你！衝過去把整隻小恐龍頭下腳上舉起來
    { at: G3 + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: G3 + 0.35, dur: 0.2, actor: 'yang', do: 'hop', amount: 4 },
    { at: G3 + 0.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: G3 + 0.55, dur: 0.22, actor: 'yang', do: 'moveTo', to: { x: GRAB, y: YY }, ease: 'in' },
    { at: G3 + 0.77, actor: 'yang', do: 'swap', emoji: 'hero:yang/lift' },
    { at: G3 + 0.77, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: G3 + 0.77, dur: 0.23, actor: 'rex', do: 'moveTo', to: { x: GRAB + 1, y: RUP }, ease: 'out' },
    { at: G3 + 0.77, dur: 0.23, actor: 'rex', do: 'rotateTo', amount: -180 },
    // 扛回書包旁邊
    { at: G3 + 1.0, actor: 'yang', do: 'flip' },
    { at: G3 + 1.0, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: yx(2), y: YY } },
    { at: G3 + 1.0, dur: 0.3, actor: 'rex', do: 'moveTo', to: { x: yx(2) + 21, y: RUP } },
    { at: G3 + 1.3, actor: 'yang', do: 'flip' },
    { at: G3 + 1.3, dur: 0.3, actor: 'rex', do: 'shake', amount: 1.2 },
    ...s3.moves,
    // 尾巴還露在外面亂甩
    { at: T3 - 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/scared' },
    // 書包圓得像一顆球：他得意地一推，推到右邊（國字要到正中央），自己退到左邊
    { at: SHOVE, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: SHOVE, dur: 0.12, actor: 'yang', do: 'moveTo', to: { x: yx(3) + 4, y: YY }, ease: 'in' },
    { at: SHOVE + 0.08, dur: 0.3, actor: 'bag', do: 'moveTo', to: { x: BSIDE, y: BY }, ease: 'out' },
    { at: SHOVE + 0.14, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    { at: SHOVE + 0.14, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: YSIDE, y: YY }, arc: 3, ease: 'out' },
    { at: HOME + 0.3, dur: 0.4, actor: 'bag', do: 'shake', amount: 1 },
    // 國字讓位：他把書包拉回正中間
    { at: PARK - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    { at: PARK + 0.1, dur: 0.3, actor: 'bag', do: 'moveTo', to: { x: BX, y: BY }, ease: 'out' },
    { at: PARK + 0.1, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: yx(3) - 1, y: YY } },
    // 語詞那一刻：鼓鼓的書包在畫面中間最大，他站旁邊拍拍它
    { at: WORD - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: WORD, dur: 0.2, actor: 'bag', do: 'squash', amount: 0.1 },
    { at: WORD + 0.25, dur: 0.2, actor: 'bag', do: 'squash', amount: 0.1 },
    { at: WORD + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    // 回馬槍（第四次）：拉上拉鍊，轉身背對書包、蹲下
    { at: ZIP, actor: 'yang', do: 'swap', emoji: 'hero:yang/reach' },
    { at: ZIP, dur: 0.25, actor: 'bag', do: 'shake', amount: 0.8 },
    { at: ZIP, dur: 0.22, actor: 'yang', do: 'hop', amount: 3 },
    { at: ZIP + 0.28, actor: 'yang', do: 'flip' },
    { at: ZIP + 0.28, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ZIP + 0.28, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: BACKX, y: YY } },
    { at: HEAVE - 0.1, dur: 0.2, actor: 'yang', do: 'squash', amount: 0.3 },
    // 嘿咻——背不動
    { at: HEAVE, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: HEAVE + 0.05, dur: 0.4, actor: 'yang', do: 'shake', amount: 1.2 },
    { at: HEAVE + 0.05, dur: 0.4, actor: 'bag', do: 'shake', amount: 0.5 },
    // 啵！整個人被書包往後拉倒，躺在圓滾滾的書包上四腳朝天
    { at: FLOP, actor: 'yang', do: 'swap', emoji: 'hero:yang/slip' },
    { at: FLOP, dur: 0.18, actor: 'yang', do: 'moveTo', to: LIE, arc: 5, ease: 'out' },
    { at: FLOP, dur: 0.18, actor: 'yang', do: 'rotateTo', amount: 50, pivot: 'center' },
    { at: FLOP + 0.16, dur: 0.36, actor: 'bag', do: 'bounce', amount: 3, times: 2 },
    { at: FLOP + 0.16, dur: 0.36, actor: 'yang', do: 'bounce', amount: 3, times: 2 },
    { at: FLOP + 0.3, dur: 0.45, actor: 'yang', do: 'shake', amount: 1.6 },
    // 問他：他從書包上滑下來，走到左前方、變大，轉向觀眾；書包被他一蹬滑出右邊
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.12, actor: 'yang', do: 'rotateTo', amount: -50, pivot: 'center' },
    { at: ASK, actor: 'yang', do: 'flip' },
    { at: ASK, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: AX, y: YY + 2 }, arc: 4, ease: 'out' },
    { at: ASK + 0.05, dur: 0.4, actor: 'bag', do: 'moveTo', to: { x: 215, y: BY }, ease: 'in' },
    { at: ASK + 0.35, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: ASK + 1.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: ASK + 1.65, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: ASK + 2.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.2, dur: 0.22, actor: 'yang', do: 'moveTo', to: { x: -45, y: YY + 2 }, ease: 'in' },
  ],
  builds: [
    // 每「啵」一次，就有一組筆畫從鼓起來的書包飛進字框：勹的一撇、勹的橫折鉤、被包在裡面的巳
    { at: T1 + 0.08, dur: 0.4, strokes: [0], from: 'bag', color: partColor('勹') },
    { at: T2 + 0.08, dur: 0.4, strokes: [1], from: 'bag', color: partColor('勹') },
    { at: T3 + 0.08, dur: 0.5, strokes: [2, 3, 4], from: 'bag', color: partColor('巳') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 104, y: 43 }, amount: 0.8 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: END - 0.75, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s1.fx,
    ...s2.fx,
    ...s3.fx,
    // 語詞那一刻
    { at: WORD, kind: 'burst', x: BX, y: 77 - 0.5 * H(3), emoji: '✨', n: 8, dur: 0.45, scale: 1.3 },
    // 回馬槍：背不動冒汗；啵！
    { at: HEAVE + 0.1, kind: 'sweat', actor: 'yang' },
    { at: FLOP, kind: 'burst', x: BX + 8, y: top(3) + 2, n: 1, dur: 0.4, scale: 2.4 },
    { at: FLOP + 0.3, kind: 'dizzy', actor: 'yang', dur: 0.4 },
    { at: ANSWER, kind: 'burst', x: 104, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 整支鎖全景：書包、楊捷睿、字框都要一直整個在畫面裡
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    // 國字拼好以後自動取景會往角色靠、把左上角的字擠到畫面邊：每次 punch 完再鎖回全景
    { at: T3 + 0.46, dur: 0.1, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    { at: FLOP, dur: 0.45, do: 'punch', amount: 0.14, to: { x: BX - 12, y: 46 } },
    { at: FLOP, dur: 0.3, do: 'shake', amount: 2.2 },
    { at: FLOP + 0.46, dur: 0.1, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.35, say: '包' },
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    { at: SHOVE + 0.08, sfx: 'slide' },
    { at: HOME + 0.1, say: '包' },
    { at: WORD, say: '書包' },
    { at: ZIP, sfx: 'slide' },
    { at: FLOP, sfx: 'plop' },
    { at: FLOP + 0.04, sfx: 'boing' },
    { at: FLOP + 0.08, sfx: 'rumble' },
    { at: FLOP + 0.12, sfx: 'bonk' },
    { at: ASK + 0.05, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '包' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
