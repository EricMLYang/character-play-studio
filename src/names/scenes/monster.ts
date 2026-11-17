// 演的是字面意思：大＋怪獸——一隻好大好大的怪獸跳上小雞的彈簧床，他太大太重了，一跳就把小雞彈飛，最後把彈簧床踩扁。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：大怪獸想跟小雞一起跳彈簧床，可是他太大了——他一落下來，小雞就被彈飛。
// 同一個跳（蹲下蓄力、跳起來、「咚」落在床中間）、同一聲「彈」做三次，只有越跳越高、小雞越飛越高：
// 第一次小雞彈到他頭頂那麼高，落回來還開心地要再來；第二次小雞翻著跟斗飛出畫面又掉回來；
// 停一拍：大怪獸蹲得好低好低，小雞抓緊床邊發抖。第三次他跳出畫面——「砰！」彈簧床被他整個踩扁，他一屁股坐在地上，小雞飛不見了。
// 反轉：小雞從天上掉下來，剛好掉在他圓滾滾的大肚子上——「彈」！原來大怪獸的肚子才是最好的彈簧床。
// 他站起來變得更大，小雞落在他頭上：「大怪獸」。
const S = 38 // 大怪獸的 size
const TX = 80 // 彈簧床
const TS = 42
const TY = 77 - 0.42 * TS
const MAT = TY + 2.1 // 彈簧床的床面（站在上面的腳底高度）
const MX = TX + 7 // 大怪獸每次都落在床中間偏右
const MY = MAT + 3 - 0.42 * S // 大怪獸站在床面上的 y
const GY = 77 - 0.42 * S // 大怪獸坐在地上的 y
const CS = 20 // 小雞
const CX = TX - 15 // 小雞坐在床的左邊
const CY = MAT + 3 - 0.42 * CS
const BELLY = { x: MX - 1, y: GY + 2 } // 大怪獸坐著時的肚子
/** 每次跳多高、小雞彈多高、小雞在天上多久 */
const JUMP = [8, 14]
const FLY = [20, 62]
const FLYDUR = [0.75, 1.1]
/** 落下來以後傻眼停多久 */
const HOLD = 0.5

/** 落在床中間「咚」那一下（三次一模一樣，只有力道越來越大）。L 是落下那一刻 */
function land(L: number, k: number) {
  const moves: Move[] = [
    { at: L, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: L, actor: 'tramp', do: 'squash', amount: 0.18 + 0.08 * k, dur: 0.3 },
    { at: L, actor: 'mon', do: 'hop', amount: -2 - k, dur: 0.3 },
    { at: L + 0.05, actor: 'mon', do: 'shake', amount: 0.4 + 0.3 * k, dur: HOLD - 0.1 },
  ]
  const fx: Fx[] = [
    { at: L, kind: 'burst', x: MX, y: MAT, emoji: '💥', n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
    { at: L + 0.05, kind: 'puff', x: TX, y: 74, n: 6 + 3 * k, dur: 0.6 },
  ]
  const camera: Camera[] = [
    { at: L, dur: 0.4, do: 'punch', amount: 0.06 + 0.05 * k, to: { x: MX - 6, y: 48 } },
    { at: L, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.8 + 0.6 * k },
  ]
  // 同一聲「彈」，一次比一次多疊一個
  const cues: Cue[] = [{ at: L, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: L + 0.05, sfx: 'whoosh' })
  if (k >= 2) cues.push({ at: L, sfx: 'crack' }, { at: L + 0.1, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 小雞被彈上去、落回床上（第一、二次）。L 是大怪獸落下那一刻；回傳小雞落回來的時間 */
function launch(L: number, k: number) {
  const up = L + 0.03
  const moves: Move[] = [
    { at: up, actor: 'chick', do: 'hop', amount: FLY[k], dur: FLYDUR[k] },
    { at: up, actor: 'chick', do: 'spin', times: k, dur: FLYDUR[k], pivot: 'center' },
  ]
  const fx: Fx[] = [{ at: up, kind: 'burst', actor: 'chick', emoji: '💫', n: 3 + 2 * k, dur: 0.5 }]
  return { moves, fx, back: up + FLYDUR[k] }
}

/** 在床上蹲下、跳起來（第二、三次）。回傳落下的時間 */
function jump(at: number, height: number, dur: number) {
  const moves: Move[] = [
    { at, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at, actor: 'mon', do: 'squash', amount: 0.22, dur: 0.3 },
    { at, actor: 'tramp', do: 'squash', amount: 0.12, dur: 0.3 },
    { at: at + 0.28, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: at + 0.28, actor: 'mon', do: 'hop', amount: height, dur },
  ]
  return { moves, end: at + 0.28 + dur }
}

// 第一次：從地上跳上床
const J1 = 1.15
const L1 = J1 + 0.45
const l1 = land(L1, 0)
const c1 = launch(L1, 0)
// 第二次
const j2 = jump(c1.back + 0.5, JUMP[0] + 6, 0.55)
const L2 = j2.end
const l2 = land(L2, 1)
const c2 = launch(L2, 1)
// 停一拍：蹲得好低
const WAIT = c2.back + 0.25
// 第三次：跳出畫面
const J3 = WAIT + 0.8
const L3 = J3 + 0.28 + 0.87
const l3 = land(L3, 2)
// 反轉：小雞從天上掉到肚子上
const DROP = L3 + 0.9
const B1 = DROP + 0.4 // 第一次落在肚子上
const B2 = B1 + 0.75 // 第二次
const TOP = B2 + 0.55 // 站起來、小雞落在頭上
const HEAD = { x: MX - 1, y: GY - 0.5 * S * 1.15 - 0.5 }

export default scene({
  duration: TOP + 1.6,
  bg: { top: '#6CCBFF', bottom: '#DDF6FF', floor: '#8FD46A', scenery: 'hills' },
  actors: [
    { id: 'bush', emoji: 'prop:bush', x: 16, y: 77 - 0.42 * 22, size: 22 },
    { id: 'tree', emoji: 'prop:tree', x: 144, y: 77 - 0.42 * 44, size: 44 },
    { id: 'tramp', emoji: 'prop:trampoline', x: TX, y: TY, size: TS },
    { id: 'mon', emoji: 'hero:monster/idle', x: 150, y: GY, size: S },
    { id: 'chick', emoji: '🐥', x: CX, y: CY, size: CS, pivot: 'center' },
  ],
  moves: [
    // 開場：小雞自己在彈簧床上小小地彈；大怪獸走過來，好想玩
    { at: 0.1, actor: 'chick', do: 'hop', amount: 5, dur: 0.35 },
    { at: 0.5, actor: 'chick', do: 'hop', amount: 5, dur: 0.35 },
    { at: 0.1, actor: 'mon', do: 'moveTo', to: { x: 118, y: GY }, dur: 0.75, ease: 'out' },
    // 第一次：蹲下、從地上跳上床——咚！小雞彈到他頭頂那麼高
    { at: J1 - 0.3, actor: 'mon', do: 'squash', amount: 0.22, dur: 0.3 },
    { at: J1, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: J1, actor: 'mon', do: 'moveTo', to: { x: MX, y: MY }, arc: JUMP[0], dur: L1 - J1, ease: 'inOut' },
    ...l1.moves,
    ...c1.moves,
    // 小雞落回來，開心地再彈兩下：「再來！」
    { at: c1.back + 0.05, actor: 'chick', do: 'hop', amount: 4, dur: 0.25 },
    { at: c1.back + 0.05, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    // 第二次：跳更高——小雞翻著跟斗飛出畫面又掉回來
    ...j2.moves,
    ...l2.moves,
    ...c2.moves,
    // 停一拍：大怪獸蹲得好低好低，小雞抓緊床邊發抖
    { at: WAIT, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    { at: WAIT, actor: 'mon', do: 'squash', amount: 0.3, dur: 1.05 },
    { at: WAIT, actor: 'tramp', do: 'squash', amount: 0.15, dur: 1.05 },
    { at: WAIT + 0.1, actor: 'chick', do: 'shake', amount: 0.5, dur: 0.9 },
    // 第三次：跳出畫面……
    { at: J3 + 0.28, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: J3 + 0.28, actor: 'mon', do: 'moveTo', to: { x: MX, y: -30 }, dur: 0.45, ease: 'out' },
    { at: J3 + 0.8, actor: 'mon', do: 'moveTo', to: { x: MX, y: MY }, dur: 0.35, ease: 'in' },
    // 他不見了：小雞抬頭看天上
    { at: J3 + 0.5, actor: 'chick', do: 'tilt', amount: -15, dur: 0.6 },
    // 砰！彈簧床整個被踩扁，他一屁股坐在地上；小雞飛不見了
    ...l3.moves.filter((m) => m.do !== 'swap' && m.do !== 'hop'),
    { at: L3, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: L3, actor: 'mon', do: 'moveTo', to: { x: MX, y: GY }, dur: 0.15, ease: 'out' },
    { at: L3, actor: 'tramp', do: 'stretchTo', amount: 1.8, dur: 0.15, ease: 'out' },
    { at: L3 + 0.03, actor: 'chick', do: 'moveTo', to: { x: CX + 4, y: -40 }, dur: 0.45, ease: 'out' },
    { at: L3 + 0.03, actor: 'chick', do: 'spin', times: 2, dur: 0.45, pivot: 'center' },
    // 反轉：大怪獸抬頭——小雞從天上掉下來，落在他的大肚子上：彈！
    { at: DROP - 0.3, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: DROP - 0.1, actor: 'chick', do: 'moveTo', to: { x: BELLY.x, y: -30 }, dur: 0.05 },
    { at: DROP, actor: 'chick', do: 'moveTo', to: BELLY, dur: B1 - DROP, ease: 'in' },
    { at: B1, actor: 'mon', do: 'swap', emoji: 'hero:monster/sleep' },
    { at: B1, actor: 'mon', do: 'squash', amount: 0.3, dur: 0.35 },
    { at: B1 + 0.02, actor: 'chick', do: 'hop', amount: 22, dur: B2 - B1 - 0.02 },
    { at: B2, actor: 'mon', do: 'squash', amount: 0.2, dur: 0.3 },
    // 他笑著站起來變得更大，小雞彈到他頭上
    { at: B2, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: B2, actor: 'mon', do: 'scaleTo', amount: 1.15, dur: 0.35, ease: 'back' },
    { at: B2 + 0.02, actor: 'chick', do: 'moveTo', to: HEAD, arc: 10, dur: TOP - B2, ease: 'out' },
    { at: B2 + 0.02, actor: 'chick', do: 'spin', times: 1, dur: TOP - B2, pivot: 'center' },
    { at: TOP + 0.3, actor: 'mon', do: 'hop', amount: 2, dur: 0.3 },
    { at: TOP + 0.3, actor: 'chick', do: 'hop', amount: 4, dur: 0.35 },
  ],
  fx: [
    ...l1.fx,
    ...c1.fx,
    ...l2.fx,
    ...c2.fx,
    { at: WAIT + 0.3, kind: 'sweat', actor: 'chick' },
    ...l3.fx,
    { at: L3, kind: 'burst', x: TX, y: 66, emoji: '🔩', n: 6, dur: 0.7, scale: 1.3 },
    { at: L3 + 0.2, kind: 'dizzy', actor: 'mon', dur: 0.6 },
    { at: B1, kind: 'burst', x: BELLY.x, y: BELLY.y + 2, emoji: '💫', n: 5, dur: 0.6, scale: 1.4 },
    { at: B1, kind: 'puff', x: BELLY.x, y: 74, n: 6, dur: 0.5 },
    { at: TOP, kind: 'burst', actor: 'mon', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: TOP + 0.3, kind: 'burst', actor: 'chick', emoji: '🎉', n: 6, dur: 0.9, scale: 1.2 },
  ],
  camera: [
    // 定住構圖：彈簧床、小雞、大怪獸都在畫面中間，夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.2, to: { x: 86, y: 50 } },
    ...l1.camera,
    ...l2.camera,
    // 停一拍時慢慢推近
    { at: WAIT, dur: 0.8, do: 'zoom', amount: 1.4, to: { x: 84, y: 50 } },
    { at: J3 + 0.3, dur: 0.4, do: 'zoom', amount: 1.15, to: { x: 84, y: 45 } },
    ...l3.camera,
    // 亮相
    { at: B2, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: MX - 2, y: 50 } },
  ],
  lights: [
    { at: L3, dur: 0.05, level: -0.4 },
    { at: L3 + 0.05, dur: 0.4, level: 0 },
    { at: TOP, dur: 0.05, level: -0.3 },
    { at: TOP + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.5, sfx: 'tap' },
    { at: J1, sfx: 'whoosh' },
    ...l1.cues,
    { at: c1.back + 0.05, sfx: 'tap' },
    ...l2.cues,
    { at: WAIT, sfx: 'slide' },
    { at: J3 + 0.28, sfx: 'whoosh' },
    ...l3.cues,
    { at: B1, sfx: 'boing' },
    { at: B2, sfx: 'boing' },
    { at: TOP, say: '大怪獸' },
    { at: TOP + 0.3, sfx: 'cheer' },
  ],
})
