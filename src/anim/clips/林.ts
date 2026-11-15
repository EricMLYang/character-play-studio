import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 林（v2）：畫面中間並排站著兩棵一樣大的樹（跟「林」一樣：左一棵、右一棵）。狗狗警長追一隻大蝴蝶，眼睛只盯著蝴蝶、不看路——
// 每次蝴蝶在最後一刻往上一飄，他就「咚！」一頭撞上樹，貼在樹幹上滑下來、頭暈，一次比一次慘：
// 從左邊跑來撞左邊那棵（左邊的木從樹上飛出來）、繞過去從右邊跑回來撞右邊那棵（右邊的木）、
// 先停一拍：他看看兩棵樹、托著下巴想——這次從兩棵樹中間鑽過去！結果被兩棵樹一起夾扁、擠出去飛上天。
// 字拼好放大時兩棵樹站到字的左右兩邊，樹和木一對一對各亮一下。語詞：兩棵樹回到中間（樹林）。
// 回馬槍：他不追了、靠著樹坐下來休息，蝴蝶自己飛來停在他鼻子上——他一高興跳起來，「咚！」頭頂撞上樹枝。
// 最後畫面暗下來只剩「林」，警長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「林！」，然後退場只留字。
// 林、林、樹林、這是什麼字？、林

/** 兩棵樹（prop:tree）：一樣大、並排站在畫面中間，樹冠頂（feet − 0.877 × size ≈ 36.7）在字框下面 */
const TS = 46
const TY = 77 - 0.42 * TS
const TL = 64, TR = 96
/** 樹冠的半寬：他撞在樹冠外側的邊上，身體大半在樹外面、襯在淺色背景上 */
const CROWN = 0.43 * TS
/** 狗狗警長（size 37）站在地上的 y；畫在兩棵樹前面 */
const S = 37
const P = 77 - 0.42 * S
/** 大蝴蝶（prop:butterfly） */
const BF = 18
/** 蝴蝶在他前上方這麼高（每次都一樣） */
const BY = 41
const AHEAD = 16
/** 撞上那一刻停多久（貼在樹幹上、傻眼），才滑下來 */
const HOLD = 0.45

/** 蝴蝶輕輕搧翅膀：翅膀一收一張，順便上下飄 */
function flutter(from: number, to: number): Move[] {
  const ms: Move[] = []
  for (let at = from; at < to - 0.05; at += 0.32) {
    ms.push({ at, actor: 'bfly', do: 'squash', amount: -0.28, dur: 0.22 })
    ms.push({ at, actor: 'bfly', do: 'hop', amount: 1.4, dur: 0.32 })
  }
  return ms
}

/**
 * 「追—咚」：他抬頭舉手（jump）追著前上方的蝴蝶跑，眼睛只看蝴蝶 → 最後一刻蝴蝶往上一飄、越過樹冠 →
 * 他一頭撞上樹：💥＋樹晃＋葉子和星星掉下來＋鏡頭推近＋震＋同一個「咚」。
 * at 是撞上的那一刻，run 是跑多久，to 是他跑到的地方，dir 是往哪邊跑（1 往右），up 是蝴蝶最後飄到的地方。
 */
function chase(at: number, run: number, to: number, dir: 1 | -1, up: { x: number; y: number }) {
  const moves: Move[] = [
    { at: at - run, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/jump' },
    { at: at - run, dur: run, actor: 'sheriff', do: 'moveTo', to: { x: to, y: P }, ease: 'linear' },
    // 蝴蝶一直在他前上方，最後一刻往上一飄
    { at: at - run, dur: run - 0.15, actor: 'bfly', do: 'moveTo', to: { x: to + dir * AHEAD, y: BY }, ease: 'in' },
    { at: at - 0.15, dur: 0.3, actor: 'bfly', do: 'moveTo', to: up, ease: 'out' },
  ]
  return moves
}

/** 「咚」那一下：每次長得一樣，只有大小變大。hit 是撞到的位置（💥 的中心），trees 是被撞的樹，k 是第幾次 */
function bonk(at: number, k: number, hit: { x: number; y: number }, trees: ('treeL' | 'treeR')[]) {
  const moves: Move[] = trees.map((id): Move => ({ at, dur: 0.45, actor: id, do: 'shake', amount: 1.4 + 0.6 * k }))
  const fx: Fx[] = [
    // 💥 在撞擊點旁邊（他頭頂斜上方），不蓋住他
    { at, kind: 'burst', x: hit.x, y: hit.y, n: 1, dur: 0.4, scale: 1.0 + 0.25 * k },
    { at: at + 0.04, kind: 'burst', x: hit.x, y: hit.y, emoji: '⭐', n: 4 + k, dur: 0.45 },
    // 樹上的葉子被撞下來，一次比一次多；從樹冠中間掉，不蓋他的臉
    ...trees.map((id): Fx => ({ at: at + 0.05, kind: 'burst', x: id === 'treeL' ? TL : TR, y: TY - 8, emoji: '🍃', n: 4 + 3 * k, dur: 0.55, scale: 1.0 + 0.1 * k })),
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.08 + 0.04 * k, to: { x: hit.x, y: hit.y } },
    { at, dur: 0.3, do: 'shake', amount: 1 + 0.5 * k },
  ]
  // 白光很淡，不把他刷白
  const lights: Light[] = [{ at, dur: 0.04, level: -0.15 - 0.04 * k }, { at: at + 0.04, dur: 0.2, level: 0 }]
  // 同一個「咚」，一次比一次多疊一個音
  const cues: Cue[] = [{ at, sfx: 'bonk' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'boing' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'crack' })
  return { moves, fx, camera, lights, cues }
}

/**
 * 撞上以後貼在樹冠外側的邊上（flat 轉 90°、頭朝上，身體大半在樹外面）傻眼停 HOLD 秒 → 慢慢滑下來 → 坐在樹旁頭暈。
 * x 是貼上去的位置，dir 是他剛剛往哪邊跑，sit 是滑下來以後坐的地方。
 */
function splat(at: number, x: number, dir: 1 | -1, sit: number): Move[] {
  return [
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 撞上那一格就已經貼在樹幹上（轉好、移好），不會先趴在地上一格
    { at: at - 0.02, dur: 0.02, actor: 'sheriff', do: 'rotateTo', amount: -90 * dir },
    { at: at - 0.02, dur: 0.02, actor: 'sheriff', do: 'moveTo', to: { x, y: 52 } },
    { at: at + HOLD, dur: 0.3, actor: 'sheriff', do: 'moveTo', to: { x, y: 77 - 0.5 * S }, ease: 'in' },
    { at: at + HOLD + 0.32, dur: 0.01, actor: 'sheriff', do: 'rotateTo', amount: 90 * dir },
    { at: at + HOLD + 0.32, dur: 0.01, actor: 'sheriff', do: 'moveTo', to: { x: sit, y: P } },
    { at: at + HOLD + 0.32, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dizzy' },
  ]
}

const H1 = 1.75, H2 = 4.15, H3 = 6.55, H4 = 10.15
/** 左邊那棵樹冠的左邊緣、右邊那棵的右邊緣 */
const EL = TL - CROWN, ER = TR + CROWN
// 第 1 次：從左邊跑來，撞左邊那棵（蝴蝶往左上飛開，離他遠一點）
const L1 = EL - 9
const r1 = chase(H1, 0.85, L1, 1, { x: 36, y: 22 })
const b1 = bonk(H1, 0, { x: EL + 8, y: 38 }, ['treeL'])
// 第 2 次：他從左邊出畫面繞過去，從右邊跑進來撞右邊那棵
const R2 = ER + 9
const r2 = chase(H2, 0.65, R2, -1, { x: 124, y: 22 })
const b2 = bonk(H2, 1, { x: ER - 8, y: 38 }, ['treeR'])
// 第 3 次：從兩棵樹中間鑽過去，被兩棵樹一起夾住；💥 在頭頂上方
const b3 = bonk(H3, 2, { x: 80, y: 34 }, ['treeL', 'treeR'])
/** 鑽進兩棵樹中間時縮小一點（往裡面走） */
const IN = 0.85
const SQ = 0.78
// 回馬槍：坐在右邊那棵樹冠的邊下面，跳起來頭頂撞上樹冠邊；💥 在頭頂左上
const SIT4 = ER + 4
const b4 = bonk(H4, 3, { x: SIT4 - 7, y: 35 }, ['treeR'])
/** 國字放大時兩棵樹站到字的左右兩邊（縮小） */
const SIDE = 0.68
const SIDE_X = { treeL: 25, treeR: 135 } as const
/** 國字在正中央時左邊的木、右邊的木的中心 */
const G = { treeL: { x: 63.7, y: 43.8 }, treeR: { x: 90.8, y: 43.8 } } as const
const HOME = 7.55
const PARK = 8.4
const WORD = 8.85
const ASK = 11.0
const ANSWER = 13.6

/** 兩棵樹一起移到某個位置、縮放 */
function trees(at: number, dur: number, x: (id: 'treeL' | 'treeR') => number, k: number, feet = 77): Move[] {
  return (['treeL', 'treeR'] as const).flatMap((id): Move[] => [
    { at, dur, actor: id, do: 'moveTo', to: { x: x(id), y: feet - 0.42 * TS }, arc: 6, ease: 'out' },
    { at, dur, actor: id, do: 'scaleTo', amount: k, ease: 'out' },
  ])
}

const clip: Clip = {
  format: 2,
  char: '林',
  meta: { theme: '警長追蝴蝶撞樹', cast: '狗狗警長＋兩棵樹＋大蝴蝶', gags: ['狗狗警長追蝴蝶，眼睛只盯著蝴蝶不看路，每次蝴蝶往上一飄他就咚地一頭撞上樹、貼在樹幹上滑下來，一次比一次慘（撞左邊那棵、撞右邊那棵、從兩棵中間鑽過去被夾扁擠上天）；回馬槍是他不追了靠著樹休息，蝴蝶自己停在他鼻子上，他一高興跳起來頭頂又咚地撞上樹枝'] },
  duration: 15,
  bg: { top: '#DDF3FF', bottom: '#F6FBEF', floor: '#B9D98C', scenery: 'hills' },
  actors: [
    { id: 'treeL', emoji: 'prop:tree', x: TL, y: TY, size: TS },
    { id: 'treeR', emoji: 'prop:tree', x: TR, y: TY, size: TS },
    // 姿勢圖朝左，翻過來面向右邊的蝴蝶與樹
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: 12, y: P, size: S, hidden: true, flip: true },
    { id: 'bfly', emoji: 'prop:butterfly', x: 12 + AHEAD, y: BY, size: BF, hidden: true, float: true },
  ],
  moves: [
    ...flutter(0, 11.2),
    // 警長登場，蝴蝶在他前上方飄；他抬頭看字框：林！
    { at: 0, dur: 0.45, actor: 'sheriff', do: 'enter', from: { x: -25, y: P }, ease: 'out' },
    { at: 0, dur: 0.5, actor: 'bfly', do: 'enter', from: { x: -12, y: BY - 6 }, ease: 'out' },
    { at: 0.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    // 第 1 次：追著蝴蝶往右跑——咚！貼在左邊那棵樹上
    ...r1,
    ...b1.moves,
    ...splat(H1, EL + 3, 1, L1 - 4),
    // 蝴蝶從樹上面飛到右邊、飛出畫面；他爬起來，轉身從左邊跑出畫面繞過去
    { at: 2.6, dur: 0.8, actor: 'bfly', do: 'moveTo', to: { x: 178, y: 34 }, ease: 'inOut' },
    { at: 2.95, actor: 'sheriff', do: 'flip' },
    { at: 2.95, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: 2.95, dur: 0.4, actor: 'sheriff', do: 'moveTo', to: { x: -30, y: P }, ease: 'in' },
    // 從右邊跑進來，蝴蝶在他前上方——咚！貼在右邊那棵樹上
    { at: H2 - 0.66, dur: 0.01, actor: 'sheriff', do: 'moveTo', to: { x: 190, y: P } },
    { at: H2 - 0.66, dur: 0.01, actor: 'bfly', do: 'moveTo', to: { x: 176, y: BY } },
    ...r2,
    ...b2.moves,
    ...splat(H2, ER - 3, -1, R2 + 4),
    // 第 3 次前停一拍：蝴蝶飄到兩棵樹中間；他站起來，看看兩棵樹、托下巴想……從中間鑽過去！
    { at: 5.0, dur: 0.6, actor: 'bfly', do: 'moveTo', to: { x: 80, y: 54 }, ease: 'inOut' },
    { at: 5.0, dur: 0.6, actor: 'bfly', do: 'scaleTo', amount: 0.8 },
    { at: 5.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: 5.55, dur: 0.25, actor: 'sheriff', do: 'tilt', amount: -8 },
    { at: 5.82, dur: 0.25, actor: 'sheriff', do: 'tilt', amount: 8 },
    { at: 6.1, dur: 0.25, actor: 'sheriff', do: 'moveTo', to: { x: 80, y: P }, ease: 'in' },
    { at: 6.1, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/back' },
    { at: 6.35, dur: 0.2, actor: 'sheriff', do: 'scaleTo', amount: IN },
    { at: H3 - 0.12, dur: 0.3, actor: 'bfly', do: 'moveTo', to: { x: 120, y: 36 }, ease: 'out' },
    ...b3.moves,
    // 咚！兩棵樹一起往中間一夾，他被夾成細細一條、傻眼
    { at: H3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: H3, dur: 0.12, actor: 'sheriff', do: 'stretchTo', amount: SQ },
    { at: H3, dur: 0.12, actor: 'treeL', do: 'rotateTo', amount: 9 },
    { at: H3, dur: 0.12, actor: 'treeR', do: 'rotateTo', amount: -9 },
    // 兩棵樹彈回去，他被擠出去、轉著飛上天
    { at: H3 + 0.5, dur: 0.4, actor: 'treeL', do: 'rotateTo', amount: -9, ease: 'elastic' },
    { at: H3 + 0.5, dur: 0.4, actor: 'treeR', do: 'rotateTo', amount: 9, ease: 'elastic' },
    { at: H3 + 0.5, dur: 0.1, actor: 'sheriff', do: 'stretchTo', amount: 1 / SQ },
    { at: H3 + 0.5, dur: 0.1, actor: 'sheriff', do: 'scaleTo', amount: 1 / IN },
    { at: H3 + 0.5, dur: 0.5, actor: 'sheriff', do: 'moveTo', to: { x: 12, y: -50 }, ease: 'out' },
    { at: H3 + 0.5, dur: 0.5, actor: 'sheriff', do: 'spin', times: -2, pivot: 'center' },
    // 飛出畫面以後在天上等（不留在字的上方）
    { at: H3 + 1.05, dur: 0.01, actor: 'sheriff', do: 'moveTo', to: { x: -40, y: -50 } },
    { at: H3 + 0.55, dur: 0.4, actor: 'bfly', do: 'moveTo', to: { x: 148, y: 28 }, ease: 'inOut' },
    { at: H3 + 0.55, dur: 0.4, actor: 'bfly', do: 'scaleTo', amount: 1 / 0.8 },
    // 字拼好、國字放大：兩棵樹站到字的左右兩邊，樹和木一對一對亮一下
    ...trees(7.15, 0.4, (id) => SIDE_X[id], SIDE),
    ...(['treeL', 'treeR'] as const).map((id, i): Move => ({ at: 7.95 + 0.25 * i, dur: 0.4, actor: id, do: 'flash' })),
    // 語詞那一刻：國字讓回上方，兩棵樹回到中間（樹林）；警長從天上掉到右邊樹旁
    ...trees(PARK, 0.4, (id) => (id === 'treeL' ? TL : TR), 1 / SIDE),
    ...(['treeL', 'treeR'] as const).map((id, i): Move => ({ at: WORD + 0.05 * i, dur: 0.3, actor: id, do: 'hop', amount: 3 })),
    { at: PARK, dur: 0.01, actor: 'sheriff', do: 'moveTo', to: { x: 132, y: -50 } },
    { at: PARK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: PARK + 0.05, dur: 0.28, actor: 'sheriff', do: 'moveTo', to: { x: 132, y: P }, ease: 'in' },
    { at: PARK + 0.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: PARK + 0.3, dur: 0.6, actor: 'bfly', do: 'moveTo', to: { x: 146, y: 36 }, ease: 'inOut' },
    // 回馬槍（第 4 次）：他不追了，走到右邊那棵樹下靠著坐下來休息
    { at: 9.2, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: 9.2, dur: 0.3, actor: 'sheriff', do: 'moveTo', to: { x: SIT4, y: P } },
    { at: 9.5, actor: 'sheriff', do: 'flip' },
    { at: 9.5, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/full' },
    // 蝴蝶自己飛過來，停在他鼻子上
    { at: 9.45, dur: 0.4, actor: 'bfly', do: 'moveTo', to: { x: SIT4 + 10, y: P - 3 }, ease: 'inOut' },
    { at: 9.45, dur: 0.4, actor: 'bfly', do: 'scaleTo', amount: 0.6 },
    // 他一高興跳起來——咚！頭頂撞上樹枝，卡一下，掉下來趴扁
    { at: 9.92, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 9.92, dur: 0.1, actor: 'sheriff', do: 'squash', amount: -0.2 },
    { at: 10.0, dur: 0.15, actor: 'sheriff', do: 'moveTo', to: { x: SIT4, y: P - 6 }, ease: 'out' },
    { at: 10.0, dur: 0.3, actor: 'bfly', do: 'moveTo', to: { x: 140, y: 22 }, ease: 'out' },
    { at: 10.0, dur: 0.3, actor: 'bfly', do: 'scaleTo', amount: 1 / 0.6 },
    ...b4.moves,
    { at: H4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: H4 + 0.4, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: SIT4, y: P }, ease: 'in' },
    { at: H4 + 0.6, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/flat' },
    // 問他：樹縮回土裡、蝴蝶飛走；警長跳到左前方、變大，轉向觀眾
    ...(['treeL', 'treeR'] as const).flatMap((id): Move[] => [
      { at: ASK, dur: 0.35, actor: id, do: 'scaleTo', amount: 0.02, ease: 'in' },
      { at: ASK + 0.35, dur: 0.05, actor: id, do: 'vanish' },
    ]),
    { at: ASK, dur: 0.4, actor: 'bfly', do: 'moveTo', to: { x: 180, y: 0 }, ease: 'in' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: ASK + 0.05, dur: 0.01, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: -50 } },
    { at: ASK + 0.1, dur: 0.25, actor: 'sheriff', do: 'moveTo', to: { x: 32, y: P + 3 }, ease: 'in' },
    { at: ASK + 0.05, dur: 0.01, actor: 'sheriff', do: 'scaleTo', amount: 1.2 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 12.05, dur: 0.3, actor: 'sheriff', do: 'rotateTo', amount: 10 },
    { at: 12.6, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
    { at: 13.1, dur: 0.3, actor: 'sheriff', do: 'hop', amount: 1.5 },
    // 回答：跳起來指著字
    { at: ANSWER, dur: 0.12, actor: 'sheriff', do: 'rotateTo', amount: -10 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, dur: 0.25, actor: 'sheriff', do: 'hop', amount: 6 },
    // 退場（跑走），畫面只留下字
    { at: ANSWER + 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: ANSWER + 0.15, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.17, dur: 0.2, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 3 }, ease: 'in' },
  ],
  builds: [
    // 撞左邊那棵樹：左邊的木從它的樹上飛出來；撞右邊那棵：右邊的木
    { at: H1 + 0.1, dur: 0.6, strokes: [0, 1, 2, 3], from: { x: TL, y: TY - 4 }, color: partColor('木') },
    { at: H2 + 0.1, dur: 0.6, strokes: [4, 5, 6, 7], from: { x: TR, y: TY - 4 }, color: partColor('木') },
  ],
  glyph: [
    // 第 3 次兩棵樹一起被撞：字裡的兩個木也跟著晃
    { at: H3, dur: 0.4, do: 'shake' },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的警長
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...b1.fx,
    { at: H1 + HOLD + 0.32, kind: 'dizzy', actor: 'sheriff', dur: 0.5 },
    ...b2.fx,
    { at: H2 + HOLD + 0.32, kind: 'dizzy', actor: 'sheriff', dur: 0.5 },
    ...b3.fx,
    // 國字放大：兩邊的樹和兩個木，一對一對各亮一下
    ...(['treeL', 'treeR'] as const).flatMap((id, i): Fx[] => [
      { at: 7.95 + 0.25 * i, kind: 'burst', x: SIDE_X[id], y: 77 - 0.59 * TS * SIDE, emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
      { at: 7.95 + 0.25 * i, kind: 'burst', ...G[id], emoji: '✨', n: 1, dur: 0.45, scale: 1.3 },
    ]),
    // 樹林：兩棵樹跳回來，葉子飛
    { at: WORD, kind: 'burst', x: 80, y: 50, emoji: '🍃', n: 8, dur: 0.5, scale: 1.2 },
    // 回馬槍：蝴蝶停在鼻子上，好開心
    { at: 9.9, kind: 'pop', actor: 'sheriff', emoji: '💕', dx: 6, dy: 2, dur: 0.4, scale: 1.3 },
    ...b4.fx,
    { at: H4 + 0.6, kind: 'dizzy', actor: 'sheriff', dur: 0.28 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 字拼好之前鏡頭固定在全景：兩棵樹要一直整個在畫面裡
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...b1.camera,
    ...b2.camera,
    ...b3.camera,
    { at: 7.1, dur: 0.3, do: 'zoom', amount: 1 },
    ...b4.camera,
  ],
  lights: [
    ...b1.lights,
    ...b2.lights,
    ...b3.lights,
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
    ...b4.lights,
  ],
  cues: [
    { at: 0.55, say: '林' },
    { at: H1 - 0.85, sfx: 'whoosh' },
    ...b1.cues,
    { at: H1 + HOLD, sfx: 'slide' },
    { at: H2 - 0.65, sfx: 'whoosh' },
    ...b2.cues,
    { at: H2 + HOLD, sfx: 'slide' },
    { at: 6.1, sfx: 'whoosh' },
    ...b3.cues,
    { at: H3 + 0.5, sfx: 'poof' },
    { at: HOME + 0.1, say: '林' },
    { at: PARK + 0.33, sfx: 'plop' },
    { at: WORD, say: '樹林' },
    { at: 9.9, sfx: 'blip' },
    ...b4.cues,
    { at: H4 + 0.6, sfx: 'plop' },
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '林' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
