import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 摸（v2）：兔子女孩看到一個神秘大紙箱，忍不住伸手進去摸——每次手一伸進去摸到東西，她就「哇！」地彈開，
// 摸到的東西接著從箱子裡冒出來給觀眾看。同一個「伸手→摸→哇！」做三次，東西一次比一次大、她彈得一次比一次遠：
// 軟軟的小雞（她往後一跳，扌從她的手上飛出來）→ 黏黏的章魚（她嚇得跳開跌坐，莫的上半）→ 先停一拍：她盯著箱子發抖、手抖著慢慢伸進去⋯⋯
// 刺刺的刺蝟（她整隻彈飛到畫面另一頭、摔下來趴扁，莫的下半）。
// 回馬槍（第四次）：她得意地再伸手進去，什麼都沒摸到——箱子裡伸出一隻超大的手，反過來摸她的頭：「摸頭！」摸一下、兩下、第三下把她摸扁在地上，
// 大手縮回去，紙箱自己跳著溜走。最後畫面暗下來只剩「摸」，她轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「摸！」，然後退場只留字。
// 刻意不跟「貓」（伸手摸貓被尾巴拍飛）撞：這支沒有人打她，笑點是「看不見裡面、摸到什麼都嚇一跳」；也不演推東西（那是「推」）。
// 摸、摸、摸頭、這是什麼字？、摸

/** 兔子女孩（size 40，flip 朝右）每次都站在同一個地方伸手 */
const S = 40
const BY = 77 - 0.42 * S
const REACH = 68
/** 大紙箱（size 42）：放在畫面中間偏右，冒出來的東西背後是素色的牆（掛畫、書架在更右邊）；她的手剛好搭在箱子前板上緣 */
const BX = 90
const BS = 42
const BOXY = 77 - 0.42 * BS
/** 她伸手（reach）時手掌的位置；固定的 🖐️ 就長在這裡 */
const HAND = { x: REACH + 12, y: 50 }
/** 手伸進箱子裡（被前板擋住） */
const IN = { x: HAND.x + 4, y: HAND.y + 15 }
/** 東西藏在箱子裡的 x（被箱子擋住） */
const TX = BX - 4
const HIDE = 72
/** 摸到以後她傻眼停多久，才彈開 */
const HOLD = 0.4
/** 從伸手到摸到要多久：第三次手抖著慢慢伸、最久 */
const LEAD = [0.75, 0.75, 1.0, 0.6]

/**
 * 「摸」：她換成伸手（reach），手上長出一隻大大的 🖐️、手指動一動（摸摸摸）→ 伸進箱子裡 → 摸到了！
 * 那一刻 ❗＋💥＋鏡頭推近＋震＋同一個音效（一次多疊一個），她傻眼停 HOLD 秒。k 是第幾次（越後面越大）。
 * 第四次（twist）摸到的是空的：沒有 ❗ 和 💥，只冒一個 ❓。
 */
function touch(at: number, k: number, twist = false) {
  const L = LEAD[k]
  const moves: Move[] = [
    { at: at - L, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/reach' },
    { at: at - L, actor: 'hand', do: 'moveTo', to: HAND, dur: 0.01 },
    { at: at - L + 0.01, actor: 'hand', do: 'pop', dur: 0.15 },
    // 手指動一動：摸摸摸（第三次抖最久）
    { at: at - L + 0.18, actor: 'hand', do: 'shake', amount: 0.7 + 0.2 * k, dur: L - 0.5 },
    // 身體往箱子那邊傾，手伸進去
    { at: at - 0.32, actor: 'bunny', do: 'tilt', amount: 9, dur: 0.5 },
    { at: at - 0.3, actor: 'hand', do: 'moveTo', to: IN, dur: 0.2, ease: 'in' },
    { at: at - 0.12, actor: 'box', do: 'shake', amount: 0.5, dur: 0.12 },
    // 摸到了：手抽出來、她傻眼
    { at, actor: 'hand', do: 'moveTo', to: { x: HAND.x - 2, y: HAND.y - 4 }, dur: 0.08, ease: 'out' },
    { at, actor: 'bunny', do: 'swap', emoji: twist ? 'hero:bunny/ponder' : 'hero:bunny/surprised' },
    { at: at + HOLD - 0.05, actor: 'hand', do: 'vanish', dur: 0.08 },
  ]
  if (!twist) {
    moves.push({ at, actor: 'bunny', do: 'squash', amount: -0.15 - 0.05 * k, dur: 0.25 })
    moves.push({ at, actor: 'box', do: 'hop', amount: 2 + 1.2 * k, dur: 0.22 })
  }
  const fx: Fx[] = twist
    ? [{ at: at + 0.02, kind: 'pop', actor: 'bunny', emoji: '❓', dx: -9, dur: 0.33, scale: 1.4 }]
    : [
        { at, kind: 'pop', actor: 'bunny', emoji: '❗', dx: -3, dur: 0.55, scale: 1.4 + 0.3 * k },
        // 💥 在箱子口（摸到的地方），一次比一次大
        { at, kind: 'burst', x: IN.x + 2, y: BOXY - 14, n: 1, dur: 0.35, scale: 1.2 + 0.35 * k },
      ]
  const camera: Camera[] = twist
    ? []
    : [
        // 推近到她和箱子中間，兩個都整個留在畫面裡
        { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.04 * k, to: { x: REACH - 4, y: 56 } },
        { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
      ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at: at - 0.3, sfx: 'tap' }]
  if (!twist) {
    cues.push({ at, sfx: 'boing' })
    if (k >= 1) cues.push({ at: at + 0.04, sfx: 'hic' })
    if (k >= 2) cues.push({ at: at + 0.08, sfx: 'whoosh' })
  }
  return { moves, fx, camera, cues }
}

/** 三隻摸到的東西（同一個角色換圖），畫出來的大小（長邊）一次比一次大：21 → 30 → 44（3D 刺蝟四周留白多、又寬扁，要寫大才比章魚大） */
const CHICK = 16
const SHOWN = [CHICK * 1.3, 30, 44]
/** 冒出來那一刻的中心 y：底部卡在箱口（刺蝟寬扁，高度只有寬的六成） */
const UPY = [39, 34, 34]
const upY = (k: number) => UPY[k]
/** 空字框與讓位的位置：左上偏中、縮小一點，右邊的箱口上方留給冒出來的東西（背後是素色的牆，不壓到左邊的窗戶） */
const FRAME = { x: 53, y: 15 }
const FRAME_K = 0.45

/** 摸到的東西從箱子裡「登！」冒出來、抖一抖，再縮回去（k 是第幾隻，emoji 換成牠） */
function reveal(at: number, k: number, emoji: string, back: number | null): Move[] {
  const ms: Move[] = []
  if (k > 0) {
    ms.push({ at, actor: 'thing', do: 'swap', emoji })
  }
  ms.push(
    { at, actor: 'thing', do: 'moveTo', to: { x: TX, y: HIDE }, dur: 0.01 },
    { at: at + 0.01, actor: 'thing', do: 'pop', dur: 0.03 },
    // 消失後重新出場會回到原本的大小（小雞），所以出場以後再放大成這一隻的大小
    { at: at + 0.015, actor: 'thing', do: 'scaleTo', amount: SHOWN[k] / SHOWN[0], dur: 0.01 },
    { at: at + 0.02, actor: 'thing', do: 'moveTo', to: { x: TX, y: upY(k) }, dur: 0.2, ease: 'back' },
    { at: at + 0.3, actor: 'thing', do: 'shake', amount: 0.6 + 0.3 * k, dur: 0.35 },
  )
  if (back != null) ms.push(
    { at: back, actor: 'thing', do: 'moveTo', to: { x: TX, y: HIDE }, dur: 0.15, ease: 'in' },
    { at: back + 0.15, actor: 'thing', do: 'vanish', dur: 0.02 },
  )
  return ms
}

const T1 = 1.7, T2 = 3.4, T3 = 5.9, T4 = 9.35
const t1 = touch(T1, 0)
const t2 = touch(T2, 1)
const t3 = touch(T3, 2)
const t4 = touch(T4, 3, true)

/** 第三次被彈飛摔下來的地方（國字回中央放大時不擋字） */
const FAR = 34
/** 超大手（手掌朝下）蓋在她頭頂上的位置：手掌底剛好碰到頭頂，臉露出來 */
const PAT = { x: REACH + 1, y: 38 }
/** 被摸扁時她被擠到的地方；大手壓在她背上（臉在右邊，露出來） */
const SQ = REACH - 14
const FLATX = SQ - 6
const PRESS = { x: FLATX - 12, y: 62 }
/** 國字回中央放大那一秒，箱子跳到畫面外讓開 */
const OUT = 205
const P1 = 9.75, P2 = 10.0, P3 = 10.25

/** 問他的時候她站的地方（左前方，國字偏右） */
const AX = 36

const clip: Clip = {
  format: 2,
  char: '摸',
  meta: { theme: '兔子女孩摸神秘箱', cast: '兔子女孩＋神秘紙箱＋小雞＋章魚＋刺蝟', gags: ['兔子女孩每次伸手進神秘箱摸，一摸到東西就「哇！」地彈開，東西才冒出來給大家看，一次比一次大、她彈得一次比一次遠（軟軟的小雞，往後一跳→黏黏的章魚，跳開跌坐→停一拍手抖著伸進去，刺刺的刺蝟，整隻彈飛摔扁）；回馬槍是她得意地再伸手、什麼都沒摸到，箱子裡伸出一隻超大的手反過來摸她的頭，摸到第三下把她摸扁'] },
  duration: 15,
  bg: { top: '#FFF1D6', bottom: '#FFF8EA', floor: '#C99A66', scenery: 'room' },
  actors: [
    { id: 'bunny', emoji: 'hero:bunny/idle', x: REACH, y: BY, size: S, flip: true, hidden: true },
    // 她手上的 🖐️（畫在箱子後面：伸進去就被前板擋住）
    { id: 'hand', emoji: '🖐️', x: HAND.x, y: HAND.y, size: 18, float: true, hidden: true },
    // 藏在箱子裡、摸到的東西（小雞→章魚→刺蝟，同一個角色換圖）
    { id: 'thing', emoji: '🐥', x: TX, y: HIDE, size: CHICK, float: true, hidden: true },
    { id: 'box', emoji: 'prop:box', x: BX, y: BOXY, size: BS },
    // 回馬槍的超大手（手掌朝下，畫在最前面：從箱口冒出來，蓋在她頭上）
    { id: 'big', emoji: '🫳', x: TX, y: 40, size: 28, float: true, hidden: true },
  ],
  moves: [
    // 開場：她蹦蹦跳跳進來，看到大紙箱（❓），抬頭看字框，好想摸
    { at: 0, actor: 'bunny', do: 'enter', from: { x: -25, y: BY }, dur: 0.5, ease: 'out' },
    { at: 0.55, actor: 'bunny', do: 'tilt', amount: -8, dur: 0.4 },
    { at: 0.6, actor: 'box', do: 'shake', amount: 0.6, dur: 0.25 },
    // 第 1 次：伸手進去摸——軟軟的！她往後一跳；小雞冒出來
    ...t1.moves,
    { at: T1 + HOLD, actor: 'bunny', do: 'moveTo', to: { x: REACH - 12, y: BY }, arc: 4, dur: 0.3, ease: 'out' },
    ...reveal(T1 + 0.25, 0, '🐥', 2.75),
    { at: 2.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: 2.65, actor: 'bunny', do: 'moveTo', to: { x: REACH, y: BY }, dur: 0.3 },
    // 第 2 次：黏黏的！她嚇得跳開、跌坐；章魚冒出來
    ...t2.moves,
    { at: T2 + HOLD, actor: 'bunny', do: 'moveTo', to: { x: REACH - 30, y: BY }, arc: 10, dur: 0.35, ease: 'out' },
    { at: T2 + HOLD + 0.35, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/fall' },
    ...reveal(T2 + 0.25, 1, '🐙', 4.6),
    { at: 4.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: 4.65, actor: 'bunny', do: 'moveTo', to: { x: REACH, y: BY }, dur: 0.35 },
    // 第 3 次前停一拍：她盯著箱子發抖，箱子自己抖一下
    { at: 5.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/scared' },
    { at: 5.0, actor: 'bunny', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: 5.05, actor: 'box', do: 'shake', amount: 0.9, dur: 0.3 },
    // 第 3 次：手抖著慢慢伸進去——刺刺的！整隻彈飛到畫面另一頭（看得到一段），摔下來趴扁；刺蝟冒出來
    ...t3.moves,
    { at: T3 + HOLD, actor: 'bunny', do: 'moveTo', to: { x: FAR - 4, y: 40 }, dur: 0.3, ease: 'out' },
    { at: T3 + HOLD, actor: 'bunny', do: 'spin', times: -1, dur: 0.3, pivot: 'center' },
    { at: T3 + HOLD + 0.35, actor: 'bunny', do: 'moveTo', to: { x: FAR, y: BY }, dur: 0.22, ease: 'in' },
    { at: T3 + HOLD + 0.57, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    { at: T3 + HOLD + 0.57, actor: 'bunny', do: 'squash', amount: 0.4, dur: 0.3 },
    ...reveal(T3 + 0.2, 2, '🦔', null),
    // 字框填滿、國字要回中央放大：箱子載著刺蝟跳到右邊畫面外讓開（國字放大的四周什麼都沒有），讓位以後再跳回來
    { at: 6.95, actor: 'box', do: 'moveTo', to: { x: OUT, y: BOXY }, dur: 0.3, ease: 'in' },
    { at: 6.95, actor: 'thing', do: 'moveTo', to: { x: OUT - 4, y: upY(2) }, dur: 0.3, ease: 'in' },
    ...[6.95, 7.1].flatMap((at): Move[] => [
      { at, actor: 'box', do: 'hop', amount: 4, dur: 0.15 },
      { at, actor: 'thing', do: 'hop', amount: 4, dur: 0.15 },
    ]),
    { at: 7.3, actor: 'thing', do: 'vanish', dur: 0.02 },
    { at: 8.3, actor: 'box', do: 'moveTo', to: { x: BX, y: BOXY }, dur: 0.35, ease: 'out' },
    ...[8.3, 8.45].map((at): Move => ({ at, actor: 'box', do: 'hop', amount: 4, dur: 0.15 })),
    // 她趴著還在傻眼
    { at: 7.9, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    // 回馬槍（第四次）：她得意地衝回同一個地方，再伸手進去——空的？
    { at: 8.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/dash' },
    { at: 8.3, actor: 'bunny', do: 'moveTo', to: { x: REACH, y: BY }, dur: 0.4 },
    { at: 8.7, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/smug' },
    ...t4.moves,
    // 箱口冒出一隻手掌朝下的超大手，蓋在她頭頂上：上下摸一下、兩下，第三下把她摸扁（大手壓在她背上，臉露出來）
    { at: 9.45, actor: 'big', do: 'pop', dur: 0.08 },
    { at: 9.45, actor: 'big', do: 'moveTo', to: { x: TX, y: 28 }, dur: 0.13, ease: 'out' },
    { at: 9.58, actor: 'big', do: 'moveTo', to: PAT, dur: 0.14, ease: 'inOut' },
    { at: 9.55, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/surprised' },
    ...[P1, P2].flatMap((at, i): Move[] => [
      { at, actor: 'big', do: 'hop', amount: -3 - 1.5 * i, dur: 0.2 },
      { at: at + 0.06, actor: 'bunny', do: 'squash', amount: 0.25 + 0.15 * i, dur: 0.2 },
    ]),
    { at: P3 - 0.1, actor: 'big', do: 'moveTo', to: { x: PAT.x, y: PAT.y - 5 }, dur: 0.1, ease: 'out' },
    // 第三下：用力一壓，她被摸扁、擠到左邊一點（頭才不會鑽到箱子後面）
    { at: P3, actor: 'big', do: 'moveTo', to: PRESS, dur: 0.08, ease: 'in' },
    { at: P3 + 0.08, actor: 'bunny', do: 'moveTo', to: { x: FLATX, y: BY }, dur: 0.06 },
    { at: P3 + 0.08, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/flat' },
    { at: P3 + 0.08, actor: 'bunny', do: 'squash', amount: 0.5, dur: 0.4 },
    // 大手縮回箱口，紙箱自己跳著溜出右邊
    { at: 10.5, actor: 'big', do: 'moveTo', to: { x: TX, y: 40 }, dur: 0.12, ease: 'in' },
    { at: 10.6, actor: 'big', do: 'vanish', dur: 0.04 },
    { at: 10.62, actor: 'box', do: 'moveTo', to: { x: OUT, y: BOXY }, dur: 0.33, ease: 'in' },
    ...[10.62, 10.75, 10.88].map((at): Move => ({ at, actor: 'box', do: 'hop', amount: 4, dur: 0.12 })),
    // 問他：她爬起來、變大，走到左前方轉向觀眾
    { at: 10.95, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: 10.95, actor: 'bunny', do: 'moveTo', to: { x: AX, y: BY + 3 }, dur: 0.3 },
    { at: 10.95, actor: 'bunny', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾，點兩下頭
    { at: 12.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: 12.1, actor: 'bunny', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.6, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'bunny', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.6, actor: 'bunny', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: 13.6, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: 13.6, actor: 'bunny', do: 'hop', amount: 8, dur: 0.25 },
    // 退場，畫面只留下字
    { at: 13.8, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: 13.8, actor: 'bunny', do: 'flip' },
    { at: 13.8, actor: 'bunny', do: 'moveTo', to: { x: -45, y: BY + 3 }, dur: 0.18, ease: 'in' },
  ],
  builds: [
    // 第 1 次：扌從她摸到東西的那隻手上飛出來
    { at: T1 + 0.05, dur: 0.5, strokes: [0, 1, 2], from: 'hand', color: partColor('扌') },
    // 第 2 次：莫的上半（艹）從黏黏的章魚身上彈出來
    { at: T2 + 0.6, dur: 0.45, strokes: [3, 4, 5], from: 'thing', color: partColor('莫') },
    // 第 3 次：莫的下半（日、大）從刺刺的刺蝟身上彈出來
    { at: T3 + 0.6, dur: 0.5, strokes: [6, 7, 8, 9, 10, 11, 12], from: 'thing', color: partColor('莫') },
  ],
  glyph: [
    { at: 0, dur: 0.01, do: 'park', to: FRAME, amount: FRAME_K },
    { at: 7.1, dur: 0.45, do: 'home', ease: 'back' },
    // 讓位回左上偏中（跟空字框同一個地方）：回馬槍的超大手在她頭上（右下），不擋字
    { at: 7.95, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    // 問他：國字稍微偏右、縮一點，左前方讓給她
    { at: 10.9, dur: 3.05, do: 'ask', keep: ['bunny'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 10.95, dur: 0.4, do: 'home' },
    { at: 13.6, dur: 0.35, do: 'pulse' },
    { at: 14.2, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：神秘箱
    { at: 0.6, kind: 'pop', actor: 'box', emoji: '❓', dx: -4, dy: 6, dur: 0.8, scale: 2.2 },
    ...t1.fx,
    { at: T1 + 0.45, kind: 'sweat', actor: 'bunny' },
    ...t2.fx,
    { at: T2 + 0.8, kind: 'dizzy', actor: 'bunny', dur: 0.4 },
    // 第 3 次前停一拍：她發抖冒汗
    { at: 5.05, kind: 'sweat', actor: 'bunny', dur: 0.6 },
    ...t3.fx,
    { at: T3 + HOLD + 0.57, kind: 'burst', x: FAR, y: 66, emoji: '⭐', n: 6, dur: 0.4 },
    ...t4.fx,
    // 第三下摸扁：💥 最大
    { at: P3 + 0.08, kind: 'burst', x: PRESS.x, y: PRESS.y - 16, n: 1, dur: 0.4, scale: 2.4 },
    { at: P3 + 0.08, kind: 'burst', x: PRESS.x, y: PRESS.y, emoji: '⭐', n: 8, dur: 0.45 },
    { at: 13.6, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 國字拼好之前鏡頭固定在稍微推近（不讓自動取景推近、把紙箱切掉）
    { at: 0.5, dur: 0.5, do: 'zoom', amount: 1.04, to: { x: 72, y: 45 } },
    // 國字回中央放大、讓位這段鏡頭停在全景（不往左邊趴著的她靠過去、把紙箱切掉）
    { at: 6.95, dur: 0.15, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...t1.camera,
    ...t2.camera,
    ...t3.camera,
    // 語詞那一刻：推近她和超大手
    { at: 9.45, dur: 0.3, do: 'zoom', amount: 1.15, to: { x: REACH - 4, y: 50 } },
    { at: P1, dur: 0.22, do: 'shake', amount: 0.6 },
    { at: P2, dur: 0.22, do: 'shake', amount: 1.0 },
    { at: P3 + 0.08, dur: 0.4, do: 'shake', amount: 2.2 },
    { at: 10.55, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  lights: [
    { at: 7.1, dur: 0.05, level: -0.3 },
    { at: 7.15, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.7, say: '摸' },
    ...t1.cues,
    ...t2.cues,
    { at: 5.05, sfx: 'rumble' },
    { at: 5.4, sfx: 'gulp' },
    ...t3.cues,
    { at: T3 + HOLD + 0.57, sfx: 'bonk' },
    { at: 7.2, say: '摸' },
    ...t4.cues,
    { at: P1, sfx: 'tap' },
    { at: P1 + 0.05, say: '摸頭' },
    { at: P2, sfx: 'tap' },
    { at: P3 + 0.08, sfx: 'bonk' },
    { at: P3 + 0.12, sfx: 'boing' },
    { at: 11.05, say: FIXED_LINES.clipAsk },
    { at: 13.6, say: '摸' },
    { at: 13.65, sfx: 'cheer' },
  ],
}

export default clip
