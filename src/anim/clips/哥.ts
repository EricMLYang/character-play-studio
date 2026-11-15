import type { Build, Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 哥（v2）：力氣最大的兔子哥哥。兔子女孩一踢球，球滾到中間，就有一隻動物走過來「噗」地坐在她的球上、不走了。
// 她揮手大喊「哥！」——哥哥「咻」地從右邊衝過來，叉腰（交給我），然後「嘿！」把那隻動物整隻舉過頭，球滾回她腳邊；
// 放下來，動物嚇得逃走，哥哥抓抓頭傻笑，又咻地跑走。同一個「踢球→被坐住→喊哥→咻→叉腰→舉起來」，舉起來的一次比一次大：
// 小貓（上面的可從被舉高的貓身上飛出來）→ 大乳牛（下面的口）→
// 先停一拍：走過來坐住球的是一頭大象，她舉手要喊、停住、冒汗……還是喊了「哥！」——哥哥抖著腳把整頭大象舉到畫面頂（下面的丁）。
// 語詞那一刻哥哥叉腰站在正中間，她跳起來指著他：「哥哥」。
// 回馬槍（第四次）：這次坐上球的是一隻小小的老鼠。同樣「哥！」、咻、叉腰，哥哥伸手要舉——老鼠「吱」一聲跳起來，
// 舉得起大象的哥哥嚇得跳好高，轉身就逃，老鼠騎著球追出去。她笑到彎腰。
// 最後畫面暗下來只剩「哥」，她問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「哥！」，然後退場只留字。
// 哥、哥、哥、哥、哥哥、哥、這是什麼字？、哥

/** 兔子女孩（妹妹，明星）：站在左邊、面向右邊（flip） */
const SB = 36
const BY = 77 - 0.42 * SB
const BX = 32
/** 兔子哥哥（道具圖 prop:bro*，朝左）：畫面上最大，舉東西時站在正中間 */
const RS = 54
const RY = 77 - 0.42 * RS
/** 球停的地方、動物坐的地方、哥哥舉東西的地方：每次都一樣 */
const MID = 86
/** 哥哥從右邊外面衝進來、跑出去的地方 */
const OFF = 196
/** 球（size 11）：在她腳邊、滾到中間 */
const BS = 11
const BALL_Y = 77 - 0.42 * BS
const FOOT = 47
/** 坐在球上的動物（同一個角色換 emoji＋scaleTo）：腳底不隨 scale 變，所以站地上、被舉高的 y 都一樣 */
const PS = 34
const PET_Y = 77 - 0.42 * PS
/** 被舉高：腳底踩在哥哥舉高的手掌上（bro-lift 的手掌在圖的 v 0.15） */
const LIFT_Y = PET_Y - 39
/** 老鼠站在球頂上 */
const ON_BALL_Y = PET_Y - 8
/** 字框在左上角：被舉高的動物在正中間、太陽在右上，左上角後面是素色的天空 */
const FRAME = { x: 25, y: 23 }
const FRAME_K = 0.47

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[]; builds: Build[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [], builds: [] }

/** 她把球往中間一踢，球咕嚕咕嚕滾到中間 */
function kick(K: number) {
  g.moves.push(
    { at: K, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/kick' },
    { at: K + 0.05, dur: 0.35, actor: 'ball', do: 'moveTo', to: { x: MID, y: BALL_Y }, ease: 'out' },
    { at: K + 0.05, dur: 0.35, actor: 'ball', do: 'rotateTo', amount: 300, ease: 'out' },
    { at: K + 0.35, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
  )
  g.cues.push({ at: K + 0.05, sfx: 'tap' })
}

/** 動物從右邊走進來，「噗」一屁股坐在球上（球被擋在牠肚子底下）。y 是坐好的高度 */
function sit(A: number, k: number, y = PET_Y) {
  g.moves.push(
    { at: A, dur: 0.42, actor: 'pet', do: 'moveTo', to: { x: MID, y }, ease: 'out', arc: y < PET_Y ? 8 : 0 },
    { at: A + 0.42, dur: 0.25, actor: 'pet', do: 'squash', amount: 0.15 + 0.05 * k },
  )
  g.cues.push({ at: A + 0.42, sfx: 'plop' })
}

/** 她揮手大喊「哥！」 */
function call(C: number) {
  g.moves.push(
    { at: C, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/wave' },
    { at: C, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2.5 },
  )
  g.cues.push({ at: C + 0.02, say: '哥' })
}

/** 「咻」：哥哥從右邊外面衝到正中間（每次一樣），叉腰（交給我）。回傳叉腰站好的那一刻 */
function dash(D: number, x = MID) {
  g.moves.push(
    { at: D, actor: 'bro', do: 'swap', emoji: 'prop:bro-run' },
    { at: D, dur: 0.24, actor: 'bro', do: 'moveTo', to: { x, y: RY }, ease: 'out' },
    { at: D + 0.26, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    { at: D + 0.28, dur: 0.25, actor: 'bro', do: 'hop', amount: 2 },
  )
  g.fx.push({ at: D + 0.2, kind: 'puff', actor: 'bro', dx: 8, dy: 22, dur: 0.4, scale: 1.3 })
  g.cues.push({ at: D, sfx: 'whoosh' })
  return D + 0.26
}

/**
 * 「嘿！」舉起來：蹲一下（預備）→ 換舉高的姿勢、動物整隻被舉到頭上 → 💥＋鏡頭推近＋震＋同一個音效（一次比一次多疊一個音），
 * 球從牠肚子底下滾回她腳邊。k 是第幾次（越後面越大）。
 */
function lift(L: number, k: number, up = 0) {
  g.moves.push(
    { at: L - 0.18, dur: 0.18, actor: 'bro', do: 'squash', amount: 0.14 + 0.03 * k },
    { at: L, actor: 'bro', do: 'swap', emoji: 'prop:bro-lift' },
    { at: L, dur: 0.12, actor: 'pet', do: 'moveTo', to: { x: MID, y: LIFT_Y - up }, ease: 'out' },
    { at: L + 0.12, dur: 0.2, actor: 'pet', do: 'shake', amount: 0.8 + 0.4 * k },
    { at: L + 0.05, dur: 0.42, actor: 'ball', do: 'moveTo', to: { x: FOOT, y: BALL_Y }, ease: 'out' },
    { at: L + 0.05, dur: 0.42, actor: 'ball', do: 'rotateTo', amount: -300, ease: 'out' },
    { at: L + 0.3, actor: 'bunny', do: 'swap', emoji: k >= 2 ? 'hero:bunny/surprised' : 'hero:bunny/happy' },
    { at: L + 0.3, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2 },
  )
  g.fx.push(
    // 💥 冒在哥哥右手旁邊，不蓋臉；一次比一次大
    { at: L, kind: 'burst', x: MID + 22, y: LIFT_Y + 6, n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
    { at: L + 0.02, kind: 'puff', actor: 'bro', dx: 0, dy: 23, dur: 0.45, scale: 1.2 + 0.4 * k },
    // 被舉起來的動物嚇一跳（❗ 冒在牠左邊，不被畫面頂切掉、不蓋臉）
    { at: L + 0.1, kind: 'pop', x: MID - 30 - 2 * k, y: 26, emoji: '❗', dur: 0.5, scale: 1.5 + 0.2 * k },
  )
  g.camera.push(
    { at: L, dur: 0.45, do: 'punch', amount: 0.08 + 0.03 * k, to: { x: MID, y: 40 } },
    { at: L, dur: 0.3 + 0.05 * k, do: 'shake', amount: 0.7 + 0.45 * k },
  )
  g.cues.push({ at: L, sfx: 'bonk' })
  if (k >= 1) g.cues.push({ at: L + 0.04, sfx: 'boing' })
  if (k >= 2) g.cues.push({ at: L + 0.08, sfx: 'rumble' })
}

/** 「咚」放下來，動物嚇得逃出右邊；哥哥抓頭傻笑（用力過頭了）。回傳逃走那一刻 */
function drop(P: number, k: number) {
  const F = P + 0.14
  g.moves.push(
    { at: P + 0.1, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    { at: P, dur: 0.14, actor: 'pet', do: 'moveTo', to: { x: MID, y: PET_Y }, ease: 'in' },
    { at: F, dur: 0.01, actor: 'pet', do: 'flip' },
    { at: F, dur: 0.38 + 0.04 * k, actor: 'pet', do: 'moveTo', to: { x: OFF + 20, y: PET_Y }, ease: 'in' },
    { at: F, actor: 'bro', do: 'swap', emoji: 'prop:bro-oops' },
  )
  g.fx.push(
    { at: F, kind: 'sweat', actor: 'pet', dx: -6, dur: 0.4 },
    { at: F + 0.05, kind: 'sweat', actor: 'bro', dx: -8, dur: 0.55 },
  )
  g.camera.push({ at: F, dur: 0.2, do: 'shake', amount: 0.4 + 0.3 * k })
  g.cues.push({ at: F, sfx: 'plop' })
  return F
}

/** 哥哥轉身咻地跑出右邊（跑出去以後轉回來，下一次才是面向左邊衝進來） */
function leave(X: number) {
  g.moves.push(
    { at: X, dur: 0.01, actor: 'bro', do: 'flip' },
    { at: X, actor: 'bro', do: 'swap', emoji: 'prop:bro-run' },
    { at: X + 0.02, dur: 0.3, actor: 'bro', do: 'moveTo', to: { x: OFF, y: RY }, ease: 'in' },
    { at: X + 0.4, dur: 0.01, actor: 'bro', do: 'flip' },
  )
  g.cues.push({ at: X + 0.02, sfx: 'whoosh' })
}

/** 換下一隻動物：在右邊外面轉回來、換圖、換大小（scaleTo 會累乘，傳這次對上次的倍率） */
function nextPet(N: number, emoji: string, ratio: number) {
  g.moves.push(
    { at: N, dur: 0.01, actor: 'pet', do: 'flip' },
    { at: N, actor: 'pet', do: 'swap', emoji },
    { at: N, dur: 0.01, actor: 'pet', do: 'scaleTo', amount: ratio },
  )
}

// 大小：小貓 22 → 乳牛 34 → 大象 44 → 老鼠 17（角色本身是 size 34）
const CAT = 22 / PS, COW = 34 / PS, ELE = 44 / PS, MOUSE = 17 / PS

// 第 1 次：小貓
const K1 = 0.2
kick(K1)
sit(K1 + 0.05, 0)
const C1 = K1 + 0.45
call(C1)
const H1 = dash(C1 + 0.12)
const L1 = H1 + 0.28
lift(L1, 0)
const F1 = drop(L1 + 0.4, 0)
leave(F1 + 0.3)
nextPet(F1 + 0.2, '🐄', COW / CAT)
// 第 2 次：大乳牛
const K2 = F1 + 0.25
kick(K2)
sit(K2 + 0.05, 1)
const C2 = K2 + 0.4
call(C2)
const H2 = dash(C2 + 0.12)
const L2 = H2 + 0.28
lift(L2, 1, 3)
const F2 = drop(L2 + 0.45, 1)
leave(F2 + 0.3)
nextPet(F2 + 0.2, 'prop:elephant', ELE / COW)
// 第 3 次前停一拍：坐上球的是一頭大象。她舉手要喊、停住、冒汗……還是喊了
const K3 = F2 + 0.25
kick(K3)
sit(K3 + 0.05, 2)
const HES = K3 + 0.45
const C3 = HES + 0.6
call(C3)
const H3 = dash(C3 + 0.12)
const L3 = H3 + 0.4
lift(L3, 2)
/** 第 3 次舉著大象撐久一點、腳發抖 */
const F3 = drop(L3 + 0.6, 2)
/** 國字放大到中間：兩個人讓到兩邊 */
const ASIDE = F3 + 0.1
const HOME = F3 + 0.3
const PARK = HOME + 0.85
const WORD = PARK + 0.5
// 回馬槍：哥哥退回右邊；她再踢球，這次坐上球的是一隻小老鼠
const X4 = WORD + 0.4
nextPet(X4, '🐁', MOUSE / ELE)
// 淺灰紫的 3D 老鼠縮小以後太淡，壓深一點才看得出是老鼠
g.moves.push({ at: X4, actor: 'pet', do: 'tint', filter: 'brightness(.72) saturate(1.5) contrast(1.15)' })
const K4 = X4 + 0.05
kick(K4)
sit(K4 + 0.05, 3, ON_BALL_Y)
const C4 = K4 + 0.45
call(C4)
const H4 = dash(C4 + 0.12, MID + 16)
/** 伸手要舉——老鼠「吱」地跳起來 */
const SQ = H4 + 0.35
const RUN = SQ + 0.5
const ASK = RUN + 0.65
const Q = ASK + 0.08
const ANSWER = Q + 2.5
/** 問他的時候她放大一點 */
const ASK_S = 1.15

const clip: Clip = {
  format: 2,
  char: '哥',
  meta: { theme: '力氣最大的哥哥', cast: '兔子女孩＋兔子哥哥＋坐在球上的動物', gags: ['兔子女孩的球每次被一隻動物坐住，她大喊「哥！」，哥哥就咻地衝過來、叉腰、把整隻動物舉過頭，一次比一次大（小貓→大乳牛→停一拍她猶豫冒汗還是喊了，整頭大象）；回馬槍是第四次坐上球的只是一隻小老鼠，哥哥伸手要舉，老鼠吱一聲跳起來，舉得起大象的哥哥嚇得跳好高、逃出畫面，老鼠騎著球追出去'] },
  duration: 15,
  // 晴天的草地：白兔、天藍外套在淡黃天空上都看得清楚
  bg: { top: '#FFF1CC', bottom: '#FFFBEE', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'ball', emoji: '⚽', x: FOOT, y: BALL_Y, size: BS, pivot: 'center' },
    { id: 'bro', emoji: 'prop:bro-run', x: OFF, y: RY, size: RS },
    { id: 'pet', emoji: '🐈', x: OFF + 20, y: PET_Y, size: PS },
    { id: 'bunny', emoji: 'hero:bunny/idle', x: BX, y: BY, size: SB, flip: true },
  ],
  moves: [
    { at: 0, dur: 0.01, actor: 'pet', do: 'scaleTo', amount: CAT },
    { at: 0.05, dur: 0.25, actor: 'bunny', do: 'hop', amount: 2 },
    ...g.moves.filter((m) => m.at < HES),
    // 停一拍：她舉手要喊、停住、托著下巴冒汗
    { at: HES, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/know' },
    { at: HES + 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/ponder' },
    { at: HES + 0.3, dur: 0.4, actor: 'bunny', do: 'tilt', amount: 8 },
    ...g.moves.filter((m) => m.at >= HES && m.at < L3 + 0.2),
    // 舉著大象：腳發抖
    { at: L3 + 0.2, dur: 0.5, actor: 'bro', do: 'shake', amount: 1.2 },
    ...g.moves.filter((m) => m.at >= L3 + 0.2 && m.at < WORD - 1),
    // 國字放大到中間：她讓到左邊，哥哥抓著頭退到右邊
    { at: ASIDE, dur: 0.3, actor: 'bunny', do: 'moveTo', to: { x: 18, y: BY } },
    { at: ASIDE, dur: 0.3, actor: 'ball', do: 'moveTo', to: { x: 33, y: BALL_Y } },
    { at: ASIDE, dur: 0.3, actor: 'ball', do: 'rotateTo', amount: -200 },
    { at: ASIDE, dur: 0.35, actor: 'bro', do: 'moveTo', to: { x: 140, y: RY } },
    // 語詞那一刻：哥哥走回正中間叉腰，她跑過來跳起來指著他——哥哥
    { at: PARK, actor: 'bro', do: 'swap', emoji: 'prop:bro' },
    { at: PARK, dur: 0.45, actor: 'bro', do: 'moveTo', to: { x: MID + 6, y: RY } },
    { at: PARK + 0.1, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: 54, y: BY } },
    { at: WORD - 0.05, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: WORD - 0.05, dur: 0.3, actor: 'bunny', do: 'hop', amount: 4 },
    { at: WORD, dur: 0.3, actor: 'bro', do: 'hop', amount: 2.5 },
    // 回馬槍：哥哥跳回右邊、她跳回原位，球滾回她腳邊
    { at: X4 - 0.3, dur: 0.3, actor: 'bro', do: 'moveTo', to: { x: 140, y: RY }, arc: 4 },
    { at: X4 - 0.3, dur: 0.25, actor: 'bunny', do: 'moveTo', to: { x: BX, y: BY }, arc: 4 },
    { at: X4 - 0.3, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: X4 - 0.3, dur: 0.25, actor: 'ball', do: 'moveTo', to: { x: FOOT, y: BALL_Y } },
    { at: X4 - 0.3, dur: 0.25, actor: 'ball', do: 'rotateTo', amount: 200 },
    ...g.moves.filter((m) => m.at >= WORD - 1),
    // 伸手要舉——老鼠「吱」地跳起來
    { at: SQ - 0.18, dur: 0.18, actor: 'bro', do: 'squash', amount: 0.14 },
    { at: SQ, actor: 'bro', do: 'swap', emoji: 'prop:bro-lift' },
    { at: SQ + 0.06, dur: 0.3, actor: 'pet', do: 'hop', amount: 6 },
    // 舉得起大象的哥哥嚇得跳好高
    { at: SQ + 0.12, actor: 'bro', do: 'swap', emoji: 'prop:bro-shock' },
    { at: SQ + 0.12, dur: 0.4, actor: 'bro', do: 'hop', amount: 12 },
    // 轉身就逃，老鼠騎著球追出去
    { at: RUN, dur: 0.01, actor: 'bro', do: 'flip' },
    { at: RUN, actor: 'bro', do: 'swap', emoji: 'prop:bro-run' },
    { at: RUN + 0.02, dur: 0.4, actor: 'bro', do: 'moveTo', to: { x: OFF + 10, y: RY }, ease: 'in' },
    { at: RUN + 0.1, dur: 0.01, actor: 'pet', do: 'flip' },
    { at: RUN + 0.15, dur: 0.5, actor: 'pet', do: 'moveTo', to: { x: OFF, y: ON_BALL_Y }, ease: 'in' },
    { at: RUN + 0.15, dur: 0.5, actor: 'ball', do: 'moveTo', to: { x: OFF, y: BALL_Y }, ease: 'in' },
    { at: RUN + 0.15, dur: 0.5, actor: 'ball', do: 'rotateTo', amount: 600, ease: 'in' },
    { at: RUN + 0.1, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/laugh' },
    // 問他：她跳到左前方、放大
    { at: ASK, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/idle' },
    { at: ASK, dur: 0.4, actor: 'bunny', do: 'moveTo', to: { x: 30, y: BY + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'bunny', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: Q + 1.0, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/listen' },
    { at: Q + 1.5, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    { at: Q + 2.0, dur: 0.3, actor: 'bunny', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/point' },
    { at: ANSWER, dur: 0.3, actor: 'bunny', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.22, actor: 'bunny', do: 'swap', emoji: 'hero:bunny/happy' },
    { at: ANSWER + 0.22, dur: 0.2, actor: 'bunny', do: 'moveTo', to: { x: -45, y: BY + 3 }, ease: 'in' },
  ],
  builds: [
    // 上面的可從被舉高的小貓身上、下面的口從乳牛身上、下面的丁從大象身上飛出來
    { at: L1 + 0.08, dur: 0.4, strokes: [0, 4], from: 'pet', color: partColor('丁') },
    { at: L1 + 0.08, dur: 0.4, strokes: [1, 2, 3], from: 'pet', color: partColor('口') },
    { at: L2 + 0.08, dur: 0.4, strokes: [6, 7, 8], from: 'pet', color: partColor('口') },
    { at: L3 + 0.08, dur: 0.4, strokes: [5, 9], from: 'pet', color: partColor('丁') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['bunny'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx.filter((f) => f.at < HES),
    // 停一拍：她看著大象冒汗
    { at: HES + 0.3, kind: 'sweat', actor: 'bunny', dx: 8, dur: 0.6 },
    ...g.fx.filter((f) => f.at >= HES && f.at < WORD),
    // 語詞那一刻：好厲害的哥哥
    { at: WORD, kind: 'burst', x: MID + 6, y: 30, emoji: '✨', n: 6, dur: 0.5, scale: 1.3 },
    ...g.fx.filter((f) => f.at >= WORD),
    // 老鼠「吱」！哥哥嚇一跳（❗ 在他頭的右上，不蓋臉）
    { at: SQ + 0.06, kind: 'pop', actor: 'pet', emoji: '❗', dx: -8, dy: 2, dur: 0.45, scale: 1.6 },
    { at: SQ + 0.12, kind: 'burst', x: MID + 40, y: 30, n: 1, dur: 0.4, scale: 2.4 },
    { at: RUN, kind: 'sweat', actor: 'bro', dx: 10, dur: 0.4 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看、切掉被舉高的動物），只有舉起來那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: SQ + 0.12, dur: 0.45, do: 'punch', amount: 0.12, to: { x: MID + 8, y: 40 } },
    { at: SQ + 0.12, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    ...g.cues.filter((c) => c.at < WORD),
    { at: HES + 0.3, sfx: 'blip' },
    { at: HOME + 0.1, say: '哥' },
    { at: WORD, say: '哥哥' },
    ...g.cues.filter((c) => c.at >= WORD),
    // 同一個音效＋多疊一個「吱」
    { at: SQ + 0.06, sfx: 'hic' },
    { at: SQ + 0.12, sfx: 'bonk' },
    { at: SQ + 0.16, sfx: 'boing' },
    { at: SQ + 0.2, sfx: 'rumble' },
    { at: RUN + 0.02, sfx: 'whoosh' },
    { at: RUN + 0.2, sfx: 'cheer' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '哥' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
