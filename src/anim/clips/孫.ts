import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 孫（v2）：阿公的寶貝孫子。阿公坐在搖椅上看書，楊捷睿舉手一喊（阿公！）、助跑、張開雙手飛撲進阿公懷裡——
// 搖椅被撞得往後一仰再彈回來，阿公笑咪咪地抱住他，愛心冒出來。同一個「喊→助跑→飛撲→搖椅一仰」，一次比一次猛：
// 小跑一撲，搖椅晃一下（子從撲上去的他身上飛出來）→ 從畫面邊衝刺一撲，搖椅往後翹得好高再彈回來（系的上半從抱住的地方飛出來）→
// 先停一拍：他退到畫面外，阿公趕快抓緊扶手、冒汗——「咻——」他從畫面外飛進來一撲，搖椅連人往後滑出去「砰」撞到牆（系下面的小）。
// 語詞那一刻：他坐在阿公腿上，阿公抱著他，愛心飄起來：「孫子」。
// 回馬槍（第四次）：他又舉手一喊、蹲低要衝——這次阿公搶先，笑咪咪地往後一搖，連人帶搖椅「咻」地滑過來把他撈進懷裡，搖椅仰得比哪一次都高。
// 阿公笑呵呵地站起來，拄著拐杖揮揮手、慢慢走出去（搖了這麼多次，要去休息了），他揮手說掰掰。
// 最後畫面暗下來只剩「孫」，楊捷睿問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「孫！」，然後退場只留字。
// 刻意不跟「公」（阿公講故事睡著、💤 砸人）、「爸」（拋高高）、「媽」（抱抱治百病）、「來」（小老鼠衝過來煞不住撞上他）、
// 「蝦」（飛撲撲空）、「姑」（姑姑衝過來親他）撞：這支每次都撲得到、阿公每次都接得住，越來越猛的是被撞得往後仰的搖椅。
// 孫、孫、孫子、這是什麼字？、孫

/** 楊捷睿：size 37，站在地上的 y */
const S = 37
const P = 77 - 0.42 * S
/** 阿公（道具圖 prop:grandpa*，坐在搖椅上、朝左）：畫面上最大 */
const GS = 56
const GF = 77 // 搖椅底（腳底）
const GY = GF - 0.42 * GS
const GX = 106
/** 驚醒那張（雙手舉起、書飛起來）的搖椅往右偏了 0.028 × size，要往左移才對得齊 */
const WAKE_DX = -0.028 * GS
/** 他坐在阿公腿上：腳底在搖椅底的左邊 LDX、上面 LUP */
const LDX = 19
const LUP = 8
/** 字框：上方正中偏左（室內場景左上是窗、右上是掛畫；讓開右邊阿公的頭） */
const FRAME = { x: 70, y: 19 }
const FRAME_K = 0.47
/** 他起跳的地方（每次都從這裡飛撲上去） */
const LEAP_X = GX - LDX - 24

/** 搖椅底的 x 是 gx、往後仰 deg 度時，坐在腿上的他要在哪裡（引擎以腳底為支點轉、側過去會往上抬） */
function lap(gx: number, deg: number): Vec {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r), s = Math.sin(r)
  const dx = -LDX, dy = -LUP
  const base = GF - Math.abs(s) * 0.42 * GS
  const fx = gx + dx * c - dy * s
  const fy = base + dx * s + dy * c
  return { x: fx, y: fy - 0.42 * S + Math.abs(s) * 0.42 * S }
}

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }
const g: Gag = { moves: [], fx: [], camera: [], cues: [] }

/** 「阿公！」：他舉手一喊（❗），四次都一樣 */
function call(T: number) {
  g.moves.push(
    { at: T, actor: 'yang', do: 'swap', emoji: 'hero:yang/know' },
    { at: T, dur: 0.25, actor: 'yang', do: 'hop', amount: 3 },
  )
  g.fx.push({ at: T, dur: 0.4, kind: 'pop', actor: 'yang', emoji: '❗', dx: 3, scale: 2.2 })
  g.cues.push({ at: T, sfx: 'tap' })
}

/**
 * 「撲進懷裡→搖椅一仰」：他飛撲上去落在阿公腿上（疊在阿公身上），搖椅往後仰 deg 度（可以連人滑出去 slide），
 * 停 hold 秒，再晃回來（阿公笑咪咪抱住他）。gx 是搖椅原本的位置。k 是第幾次（越後面越大）。
 */
function rock(HIT: number, k: number, gx: number, deg: number, slide: number, hold: number, settle = 0.55, stay = true, rest = slide) {
  const UPT = 0.18
  const BACK = HIT + UPT + hold
  const to = gx + slide
  g.moves.push(
    { at: HIT, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-wake' },
    { at: HIT, dur: UPT, actor: 'grandpa', do: 'moveTo', to: { x: to + WAKE_DX, y: GY }, ease: 'out' },
    { at: HIT, dur: UPT, actor: 'grandpa', do: 'rotateTo', amount: deg, ease: 'out' },
    { at: HIT, dur: UPT, actor: 'yang', do: 'moveTo', to: lap(to, deg), ease: 'out' },
    { at: HIT, dur: UPT, actor: 'yang', do: 'rotateTo', amount: deg, ease: 'out' },
    // 晃回來：阿公換回笑咪咪拿著書，搖椅前後晃到停
    { at: BACK, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa' },
    { at: BACK, dur: settle, actor: 'grandpa', do: 'moveTo', to: { x: gx + rest, y: GY }, ease: 'elastic' },
    { at: BACK, dur: settle, actor: 'grandpa', do: 'rotateTo', amount: -deg, ease: 'elastic' },
  )
  // 他跟著搖椅晃回來（stay 為 false：他被彈下來，另外寫）
  if (stay) g.moves.push(
    { at: BACK, dur: settle, actor: 'yang', do: 'moveTo', to: lap(to, 0), ease: 'elastic' },
    { at: BACK, dur: settle, actor: 'yang', do: 'rotateTo', amount: -deg, ease: 'elastic' },
    { at: BACK, actor: 'yang', do: 'swap', emoji: 'hero:yang/laugh' },
  )
  // 晃回來、阿公抱住他：愛心從兩個人頭上冒出來，一次比一次多、比一次大（不蓋臉、不飛過字框）
  g.fx.push({ at: BACK, dur: 0.55, kind: 'burst', x: gx + rest - 8, y: 22, emoji: '💕', n: 4 + k, scale: 1.2 + 0.15 * k })
  g.camera.push(
    // 第 3 次搖椅滑到右邊牆上：推近少一點、往左偏，阿公的臉才不會被切掉（重量靠震動和 💥）
    { at: HIT, dur: 0.4, do: 'punch', amount: slide ? 0.05 : 0.06 + 0.03 * k, to: { x: slide ? 96 : gx - 6, y: 48 } },
    { at: HIT, dur: 0.3, do: 'shake', amount: 0.6 + 0.45 * k },
  )
  // 同一個「啵嘰」，一次比一次多疊一個音
  g.cues.push({ at: HIT, sfx: 'boing' })
  if (k >= 1) g.cues.push({ at: HIT + 0.06, sfx: 'slide' })
  return BACK + settle
}

/** 助跑、張開雙手飛撲：從 from 跑到起跳點，再一個拋物線落在阿公腿上。回傳撲進懷裡的那一刻 */
function leap(R: number, run: number, fly: number, gx = GX) {
  const L = R + run
  g.moves.push(
    { at: R, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: R, dur: run, actor: 'yang', do: 'moveTo', to: { x: LEAP_X, y: P }, ease: 'in', anticipate: 3 },
    { at: L, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: L, dur: fly, actor: 'yang', do: 'moveTo', to: lap(gx, 0), arc: 7, ease: 'linear' },
  )
  g.cues.push({ at: R, sfx: 'whoosh' })
  return L + fly
}

// 開場
const X1 = 44
// 第 1 次：小跑一撲，搖椅晃一下
const C1 = 0.68
const HIT1 = leap(C1 + 0.27, 0.22, 0.2)
const END1 = rock(HIT1, 0, GX, 10, 0, 0.08, 0.4)
// 第 2 次：從畫面邊衝刺一撲，搖椅往後翹得好高
const OFF1 = END1 - 0.05
const X2 = 13
const C2 = OFF1 + 0.45
const HIT2 = leap(C2 + 0.27, 0.3, 0.2)
const END2 = rock(HIT2, 1, GX, 26, 0, 0.12, 0.45)
// 第 3 次前停一拍：他退到畫面邊喊、再退到畫面外，阿公抓緊扶手冒汗
const OFF2 = END2 - 0.05
const C3 = OFF2 + 0.4
const AWAY = C3 + 0.3
const GRIP = AWAY + 0.05
const R3 = AWAY + 0.56
const HIT3 = leap(R3, 0.24, 0.17)
const SLIDE = 10
/** 晃回來時搖椅停在右邊（國字放大，兩個人讓到兩邊） */
const REST = 22
const WALL = HIT3 + 0.18
const END3 = rock(HIT3, 2, GX, 36, SLIDE, 0.3, 0.55, false, REST)
/** 第 3 次彈回來時，他被彈下來落到左邊（國字放大，兩個人讓到兩邊） */
const FLING = WALL + 0.3
const HOME = FLING + 0.42
const PARK = HOME + 0.86
// 語詞那一刻：他坐在阿公腿上
const WORD = PARK + 0.5
// 回馬槍：他又喊、要衝——阿公搶先連人帶搖椅滑過來把他撈進懷裡
const OFF4 = WORD + 0.6
const GX4 = 104
/** 回馬槍：阿公先連人帶搖椅往後退到牆邊（預備），再咻地衝回來 */
const BACKX = 128
const X4 = GX4 - LDX
const C4 = OFF4 + 0.33
const WIND = C4 + 0.1
const ZOOM = WIND + 0.32
const HIT4 = ZOOM + 0.22
const END4 = rock(HIT4, 3, GX4, 42, 0, 0.12, 0.45)
// 阿公站起來揮手、慢慢走出去
const UP = END4 + 0.02
const WALK = UP + 0.12
const ASK = 11.05
const Q = 11.1
const ANSWER = 13.6
/** 問他的時候他放大一點 */
const ASK_S = 1.15
const ASK_X = 32

call(C1)
call(C2)
call(C3)
call(C4)

const clip: Clip = {
  format: 2,
  char: '孫',
  meta: { theme: '阿公的寶貝孫子', cast: '楊捷睿＋阿公（搖椅）', gags: ['楊捷睿每次舉手一喊「阿公！」、助跑、張開雙手飛撲進坐在搖椅上的阿公懷裡，搖椅被撞得往後一仰再彈回來，阿公笑咪咪抱住他、愛心冒出來，一次比一次猛（小跑一撲晃一下→從畫面邊衝刺一撲翹得好高→停一拍，他退到畫面外、阿公抓緊扶手，咻地一撲，搖椅連人滑出去撞到牆）；回馬槍是第四次他喊完要衝，這次阿公搶先連人帶搖椅咻地滑過來把他撈進懷裡，搖椅仰得最高'] },
  duration: 15,
  // 暖黃色牆壁的客廳：木頭搖椅、米色背心的阿公、紅外套的他都跳得出來
  bg: { top: '#F6ECD6', bottom: '#FBF5E8', floor: '#D9BC8C', scenery: 'room' },
  actors: [
    { id: 'grandpa', emoji: 'prop:grandpa', x: GX, y: GY, size: GS },
    { id: 'yang', emoji: 'hero:yang/walk', x: X1, y: P, size: S, hidden: true, flip: true },
  ],
  moves: [
    // 開場：他從左邊走進來，看到阿公好開心
    { at: 0, actor: 'yang', do: 'enter', from: { x: -25, y: P }, dur: 0.42, ease: 'out' },
    { at: 0.42, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    ...g.moves.filter((m) => m.at < OFF1),
    // 從腿上跳下來，倒退跳到畫面邊
    { at: OFF1, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OFF1, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: X2, y: P }, arc: 6 },
    ...g.moves.filter((m) => m.at >= OFF1 && m.at < OFF2),
    // 跳下來倒退到畫面邊，喊一聲，再退到畫面外
    { at: OFF2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OFF2, dur: 0.38, actor: 'yang', do: 'moveTo', to: { x: X2 - 2, y: P }, arc: 6 },
    ...g.moves.filter((m) => m.at >= OFF2 && m.at < AWAY),
    { at: AWAY, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: AWAY, dur: 0.25, actor: 'yang', do: 'moveTo', to: { x: -30, y: P }, ease: 'in' },
    // 停一拍：阿公抓緊扶手、發抖
    { at: GRIP, dur: 0.55, actor: 'grandpa', do: 'shake', amount: 0.5 },
    ...g.moves.filter((m) => m.at >= AWAY && m.at < FLING),
    // 第 3 次彈回來：他被彈下來，落在左邊（國字放大，兩個人讓到兩邊）；搖椅停在右邊
    { at: FLING, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: FLING, dur: 0.45, actor: 'yang', do: 'moveTo', to: { x: 20, y: P }, arc: 4 },
    { at: FLING, dur: 0.35, actor: 'yang', do: 'rotateTo', amount: -36 },
    ...g.moves.filter((m) => m.at >= FLING && m.at < PARK),
    // 讓位：阿公把搖椅搖回中間，他跑過去爬上阿公的腿
    { at: PARK, dur: 0.45, actor: 'grandpa', do: 'moveTo', to: { x: GX, y: GY } },
    { at: PARK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: PARK + 0.05, dur: 0.3, actor: 'yang', do: 'moveTo', to: { x: LEAP_X + 6, y: P } },
    { at: PARK + 0.35, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: PARK + 0.35, dur: 0.2, actor: 'yang', do: 'moveTo', to: lap(GX, 0), arc: 4 },
    // 語詞：坐在阿公腿上，阿公輕輕搖
    { at: WORD, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: WORD + 0.1, dur: 0.35, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回馬槍：跳下來退到左邊
    { at: OFF4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: OFF4, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: X4, y: P }, arc: 6 },
    ...g.moves.filter((m) => m.at >= OFF4 && m.at < UP),
    // 他蹲低要衝——阿公笑咪咪地往後一搖（預備），「咻」連人帶搖椅滑過來
    { at: WIND, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: WIND, dur: 0.3, actor: 'yang', do: 'squash', amount: 0.15 },
    { at: WIND, dur: 0.3, actor: 'grandpa', do: 'rotateTo', amount: 10, ease: 'out' },
    { at: WIND, dur: 0.3, actor: 'grandpa', do: 'moveTo', to: { x: BACKX, y: GY }, ease: 'out' },
    { at: ZOOM, dur: 0.22, actor: 'grandpa', do: 'rotateTo', amount: -10, ease: 'in' },
    { at: ZOOM, dur: 0.22, actor: 'grandpa', do: 'moveTo', to: { x: GX4, y: GY }, ease: 'in' },
    { at: ZOOM + 0.08, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 撈進懷裡（他被撈上腿）
    { at: HIT4 - 0.08, dur: 0.08, actor: 'yang', do: 'moveTo', to: lap(GX4, 0) },
    // 阿公笑呵呵地站起來、拄著拐杖揮手，轉身慢慢走出去；他跳下來到左邊揮手說掰掰
    { at: UP, actor: 'grandpa', do: 'swap', emoji: 'prop:grandpa-stand' },
    { at: UP, actor: 'yang', do: 'swap', emoji: 'hero:yang/wave' },
    { at: UP, dur: 0.35, actor: 'yang', do: 'moveTo', to: { x: ASK_X + 22, y: P }, arc: 8 },
    { at: WALK, dur: 0.01, actor: 'grandpa', do: 'flip' },
    { at: WALK + 0.02, dur: ASK - WALK - 0.04, actor: 'grandpa', do: 'moveTo', to: { x: 188, y: GY } },
    // 問他：他跳到右前方、放大
    { at: ASK, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK, dur: 0.4, actor: 'yang', do: 'moveTo', to: { x: ASK_X, y: P + 3 }, arc: 8, ease: 'out' },
    { at: ASK, dur: 0.3, actor: 'yang', do: 'scaleTo', amount: ASK_S, ease: 'back' },
    // 安靜等他回答：手放耳邊、點兩下頭
    { at: 12.15, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.65, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    { at: 13.15, dur: 0.3, actor: 'yang', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, dur: 0.3, actor: 'yang', do: 'hop', amount: 7 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: ANSWER + 0.2, dur: 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 3 }, ease: 'in' },
  ],
  builds: [
    // 子從撲上去的他身上飛出來；系從抱住的地方飛出來（上半、下面的小）
    { at: HIT1, dur: 0.32, strokes: [0, 1, 2], from: 'yang', color: partColor('子') },
    { at: HIT2 + 0.05, dur: 0.35, strokes: [3, 4, 5, 6], from: lap(GX, 26), color: partColor('系') },
    { at: WALL, dur: 0.35, strokes: [7, 8, 9], from: lap(GX + SLIDE, 36), color: partColor('系') },
  ],
  glyph: [
    { at: 0, dur: 0, do: 'park', to: FRAME, amount: FRAME_K },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: FRAME, amount: FRAME_K },
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g.fx,
    // 停一拍：阿公抓緊扶手冒汗
    { at: GRIP, dur: 0.6, kind: 'sweat', actor: 'grandpa', dx: 14, dy: 4 },
    // 第 3 次撞到牆：💥 在阿公頭的右邊（不蓋臉）
    { at: WALL, dur: 0.45, kind: 'burst', x: 146, y: 64, n: 1, scale: 2 },
    // 語詞：愛心飄起來
    { at: WORD, dur: 0.7, kind: 'burst', x: lap(GX, 0).x + 8, y: 40, emoji: '💕', n: 5, scale: 1.3 },
    // 回馬槍：搖椅滑過來的地上冒煙
    { at: ZOOM + 0.1, dur: 0.4, kind: 'puff', x: GX4 + 22, y: 72, scale: 1.4 },
    // 阿公站起來那一下冒一團煙（搖椅收起來）
    { at: UP, dur: 0.3, kind: 'puff', actor: 'grandpa', dy: 18, scale: 1.4 },
  ],
  camera: [
    // 鏡頭固定在全景（不讓自動取景往前預看切到人），只有撲進懷裡那一下推近
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 45 } },
    ...g.camera,
    { at: WALL, dur: 0.35, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.3 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.45, say: '孫' },
    ...g.cues,
    { at: GRIP, sfx: 'blip' },
    { at: R3 - 0.15, sfx: 'whoosh' },
    { at: WALL, sfx: 'bonk' },
    { at: HOME + 0.1, say: '孫' },
    { at: PARK, sfx: 'slide' },
    { at: WORD, say: '孫子' },
    { at: ZOOM, sfx: 'slide' },
    { at: UP, sfx: 'poof' },
    { at: Q, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '孫' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
