// 演的是字面意思：麵包＋超人——熊在營火上煎麵包，一個披披風的超人（自家主角）每次都撲過去把飛出鍋子的麵包接住、救回來（沒有圓臉紅鼻子紅臉頰、不把臉掰給人吃、沒有細菌人）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：麵包一冒煙、熊就用力甩鍋翻面，麵包飛出去，超人每次都要撲過去接住救回來——一次飛得比一次高。
// 同一個甩鍋、同一聲「啵嘿」、同一縷煙，三次只有結果變大：第一次站著伸手就接到 → 第二次飛過頭頂、他跳起來才接到、落地腳軟 →
// 停一拍（煙更大、熊蓄力、超人擺好架式）第三次直接飛出畫面，超人追上天……摔回來兩手空空、頭昏眼花。
// 反轉：麵包最後自己慢慢掉下來，剛好落在他舉起的兩手上——金黃亮晶晶，「麵包超人」！
const S = 34 // 超人的 size
const G = 77 - 0.42 * S // 超人站在地上的 y
const HX = 54 // 超人站的地方（每次都在這裡接）
const HAND = G - 18 // 舉高兩手接住的麵包在哪
const PX = 100 // 鍋子＋營火
const PAN = { x: PX, y: 57 }
const BREAD = { x: PX - 2, y: 52.5 } // 麵包在鍋子裡
const BEAR = { x: 123, y: 77 - 0.42 * 28 }

/** 麵包冒煙→熊甩鍋，麵包飛起來（每一次都一模一樣）。p 是甩下去那一刻 */
function toss(p: number, big = false) {
  const moves: Move[] = [
    { at: p - 0.5, actor: 'bread', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: p - 0.22, actor: 'bear', do: 'squash', amount: big ? 0.25 : 0.15, dur: 0.22 },
    { at: p - 0.22, actor: 'pan', do: 'tilt', amount: 12, dur: 0.22 },
    { at: p, actor: 'bear', do: 'hop', amount: big ? 6 : 3, dur: 0.3 },
    { at: p, actor: 'pan', do: 'hop', amount: big ? 5 : 3, dur: 0.25 },
    { at: p, actor: 'pan', do: 'tilt', amount: -22, dur: 0.3 },
  ]
  const fx: Fx[] = [{ at: p - 0.55, kind: 'burst', actor: 'bread', emoji: 'prop:smoke', n: 1, dy: 2, dur: 0.6, scale: big ? 1.7 : 1 }]
  const cues: Cue[] = [{ at: p - 0.5, sfx: 'crack' }, { at: p, sfx: 'boing' }]
  return { moves, fx, cues }
}

/** 接住以後丟回鍋子裡繼續煎（每一次一樣）。at 開始丟 */
function back(at: number): Move[] {
  return [
    { at: at - 0.12, actor: 'hero', do: 'squash', amount: 0.12, dur: 0.12 },
    { at, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },
    { at, actor: 'bread', do: 'moveTo', to: BREAD, arc: 12, dur: 0.45, ease: 'inOut' },
    { at, actor: 'bread', do: 'spin', times: 1, dur: 0.45 },
    { at: at + 0.45, actor: 'pan', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: at + 0.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
  ]
}

const P1 = 1.25, P2 = 3.3, P3 = 6.4
const t1 = toss(P1)
const t2 = toss(P2)
const t3 = toss(P3, true)
const C1 = P1 + 0.5 // 第一次接住
const C2 = P2 + 0.6 // 第二次接住（跳到最高點）
const UP = P3 + 0.25 // 第三次：超人飛上去追
const FALL = UP + 0.6 // 摔回來
const CRASH = FALL + 0.3
const DROP = CRASH + 0.75 // 麵包自己掉下來
const GOT = DROP + 0.55 // 剛好落在手上

export default scene({
  duration: 10.9,
  bg: { top: '#86CBF2', bottom: '#E6F6FF', floor: '#8CC860', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tree', x: 16, y: 77 - 0.42 * 44, size: 44 },
    { id: 'logs', emoji: '🪵', x: PX, y: 77 - 0.42 * 12, size: 12 },
    { id: 'fire', emoji: '🔥', x: PX, y: 66, size: 15, float: true },
    { id: 'bear', emoji: 'prop:bear', x: BEAR.x, y: BEAR.y, size: 28 },
    { id: 'pan', emoji: 'prop:pan', x: PAN.x, y: PAN.y, size: 24, flip: true, float: true, pivot: 'center' },
    { id: 'bread', emoji: '🍞', x: BREAD.x, y: BREAD.y, size: 13, pivot: 'center', float: true },
    { id: 'hero', emoji: 'hero:cape/idle', x: HX, y: G, size: S, flip: true },
  ],
  moves: [
    // 開場：超人站好、拍拍胸口（等著救麵包）
    { at: 0.15, actor: 'hero', do: 'squash', amount: -0.12, dur: 0.2 },
    { at: 0.35, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },
    // 第一次：小小一甩，麵包飛過來，他站著伸手就接到
    ...t1.moves,
    { at: P1, actor: 'bread', do: 'moveTo', to: { x: HX, y: HAND }, arc: 12, dur: C1 - P1, ease: 'linear' },
    { at: P1, actor: 'bread', do: 'spin', times: 1, dur: C1 - P1 },
    { at: P1 + 0.15, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: C1, actor: 'hero', do: 'squash', amount: 0.12, dur: 0.2 },
    { at: C1, actor: 'bread', do: 'squash', amount: 0.2, dur: 0.2 },
    ...back(C1 + 0.55),
    // 第二次：飛過頭頂，他用力一跳才接到，落地腳軟
    ...t2.moves,
    { at: P2, actor: 'bread', do: 'moveTo', to: { x: HX, y: HAND - 14 }, arc: 12, dur: C2 - P2, ease: 'linear' },
    { at: P2, actor: 'bread', do: 'spin', times: 2, dur: C2 - P2 },
    { at: P2 + 0.15, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: C2 - 0.4, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.12 },
    { at: C2 - 0.28, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: C2 - 0.28, actor: 'hero', do: 'moveTo', to: { x: HX, y: G - 14 }, dur: 0.28, ease: 'out' },
    { at: C2, actor: 'hero', do: 'moveTo', to: { x: HX, y: G }, dur: 0.3, ease: 'in' },
    { at: C2, actor: 'bread', do: 'moveTo', to: { x: HX, y: HAND }, dur: 0.3, ease: 'in' },
    { at: C2 + 0.3, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: C2 + 0.3, actor: 'bread', do: 'hop', amount: -4, dur: 0.3 },
    { at: C2 + 0.35, actor: 'hero', do: 'shake', amount: 0.8, dur: 0.4 },
    ...back(C2 + 0.85),
    // 停一拍：煙更大，熊往後蓄力，超人擺好架式
    { at: 5.35, actor: 'bear', do: 'tilt', amount: 10, dur: 0.9 },
    { at: 5.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 5.45, actor: 'hero', do: 'squash', amount: 0.15, dur: 0.8 },
    ...t3.moves,
    // 第三次：麵包直接飛出畫面——超人追上天
    { at: P3, actor: 'bread', do: 'moveTo', to: { x: HX + 14, y: -30 }, dur: 0.45, ease: 'linear' },
    { at: P3, actor: 'bread', do: 'spin', times: 3, dur: 0.45 },
    { at: P3 + 0.05, actor: 'bear', do: 'tilt', amount: -14, dur: 1.2 },
    { at: UP - 0.1, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: UP, actor: 'hero', do: 'moveTo', to: { x: HX + 6, y: -40 }, dur: 0.35, anticipate: 4, ease: 'in' },
    // 摔回來，兩手空空、頭昏眼花
    { at: FALL - 0.05, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: FALL, actor: 'hero', do: 'moveTo', to: { x: HX, y: G }, dur: CRASH - FALL, ease: 'in' },
    { at: CRASH, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.3 },
    // 反轉：麵包慢慢掉下來……他舉手，剛好接住
    { at: DROP, actor: 'bread', do: 'moveTo', to: { x: HX, y: HAND + 2 }, dur: GOT - DROP, ease: 'in' },
    { at: DROP, actor: 'bread', do: 'spin', times: 1, dur: GOT - DROP },
    { at: GOT - 0.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: GOT, actor: 'bread', do: 'tint', filter: 'brightness(1.12) saturate(1.3)' },
    { at: GOT, actor: 'bread', do: 'squash', amount: 0.25, dur: 0.2 },
    // 亮相：站起來、變大
    { at: GOT + 0.15, actor: 'hero', do: 'scaleTo', amount: 1.12, dur: 0.35, ease: 'back' },
    { at: GOT + 0.15, actor: 'bread', do: 'scaleTo', amount: 1.25, dur: 0.35, ease: 'back' },
    { at: GOT + 0.15, actor: 'bread', do: 'moveTo', to: { x: HX, y: HAND - 3 }, dur: 0.35, ease: 'back' },
    { at: GOT + 0.4, actor: 'bear', do: 'hop', amount: 4, dur: 0.35 },
    { at: GOT + 0.9, actor: 'bear', do: 'hop', amount: 4, dur: 0.35 },
  ],
  fx: [
    ...t1.fx,
    ...t2.fx,
    { at: C2 + 0.35, kind: 'sweat', actor: 'hero', dur: 0.6 },
    ...t3.fx,
    { at: P3, kind: 'puff', actor: 'pan', n: 6, dur: 0.6 },
    { at: CRASH, kind: 'burst', actor: 'hero', n: 1, dur: 0.4, scale: 1.4 },
    { at: CRASH + 0.1, kind: 'dizzy', actor: 'hero', dur: 0.7 },
    { at: GOT, kind: 'burst', actor: 'bread', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: GOT + 0.5, kind: 'burst', actor: 'hero', emoji: '🎉', n: 8, dur: 0.9, scale: 1.4 },
  ],
  camera: [
    // 定住構圖：超人、鍋子、熊都在畫面裡，超人夠大
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.4, to: { x: 86, y: 56 } },
    { at: C1, dur: 0.3, do: 'punch', amount: 0.05, to: { x: HX, y: HAND } },
    // 第二次飛得高：先退一點讓麵包留在畫面裡
    { at: P2 - 0.1, dur: 0.35, do: 'zoom', amount: 1.25, to: { x: 84, y: 56 } },
    { at: C2 + 0.6, dur: 0.4, do: 'zoom', amount: 1.4, to: { x: 86, y: 56 } },
    { at: C2 + 0.3, dur: 0.35, do: 'punch', amount: 0.08, to: { x: HX, y: G } },
    { at: C2 + 0.3, dur: 0.3, do: 'shake', amount: 0.8 },
    // 停一拍時推近
    { at: 5.3, dur: 0.8, do: 'zoom', amount: 1.55, to: { x: 84, y: 58 } },
    // 飛上天：退回全景
    { at: P3, dur: 0.3, do: 'zoom', amount: 1.15, to: { x: 80, y: 54 } },
    { at: CRASH, dur: 0.4, do: 'punch', amount: 0.12, to: { x: HX, y: G } },
    { at: CRASH, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: CRASH + 0.4, dur: 0.4, do: 'zoom', amount: 1.4, to: { x: 80, y: 58 } },
    // 亮相
    { at: GOT, dur: 0.4, do: 'punch', amount: 0.1, to: { x: HX, y: HAND } },
    { at: GOT + 0.15, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 74, y: 50 } },
  ],
  lights: [
    { at: GOT, dur: 0.05, level: -0.35 },
    { at: GOT + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.35, sfx: 'boing' },
    ...t1.cues,
    { at: C1, sfx: 'plop' },
    { at: C1 + 0.55, sfx: 'whoosh' },
    ...t2.cues,
    { at: C2, sfx: 'plop' },
    { at: C2 + 0.3, sfx: 'bonk' },
    { at: C2 + 0.85, sfx: 'whoosh' },
    { at: 5.35, sfx: 'rumble' },
    ...t3.cues,
    { at: P3 + 0.05, sfx: 'whoosh' },
    { at: UP, sfx: 'laser' },
    { at: CRASH, sfx: 'bonk' },
    { at: DROP + 0.1, sfx: 'blip' },
    { at: GOT, sfx: 'clink' },
    { at: GOT + 0.3, say: '麵包超人' },
    { at: GOT + 0.6, sfx: 'cheer' },
  ],
})
