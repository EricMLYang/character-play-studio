// 演的是字面意思：超人（披風超人）＋力（力氣）＋霸王（最有力氣的戴王冠）——超人想舉起大石頭當霸王，舉不動；一隻小螞蟻把石頭連超人一起舉起來（沒有銀紅色巨人、胸口的燈、十字光線、怪獸、城市）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 中午的沙漠：超人咻地飛下來、落地擺姿勢秀肌肉。旁邊的小石台上放著一頂王冠——誰舉得起大石頭，誰就是霸王。
// 他蹲低、抱住大石頭，用力到整張臉漲紅、汗一直噴……停一拍……石頭動都沒動，他一屁股坐在地上。
// 一隻小螞蟻走過來，拍拍石頭，嘿咻——整顆舉起來！超人嚇呆。螞蟻舉著石頭走過來，往超人底下一鏟，把他也頂上天，
// 王冠從石台彈過來剛好戴在他頭上：「超人力霸王」。底下的小螞蟻一滴汗。
const H = 18 // 超人
const G = 77 - 0.42 * H
const R = 17 // 大石頭
const RG = 77 - 0.42 * R
const A = 8 // 螞蟻
const AG = 77 - 0.42 * A
const LIFT = 4 // 螞蟻把石頭舉離地面多高
const ON = -13 // 超人站在石頭頂上（比石頭的 y 高多少）
const HX = 56 // 超人站的地方
const RX = 84 // 石頭
const CROWN = { x: 136, y: 58 } // 王冠在石台上

/** 石頭的動作，超人坐在上面時照抄一份 */
const carry = (moves: Move[]): Move[] => moves.flatMap((m) => [m, { ...m, actor: 'hero', to: m.to && { x: m.to.x, y: m.to.y + ON } }])

export default scene({
  duration: 9.6,
  bg: { top: '#FFB566', bottom: '#FFE9B8', floor: '#E8B96A', scenery: 'desert' },
  actors: [
    { id: 'cactus', emoji: '🌵', x: 14, y: 77 - 0.42 * 24, size: 24 },
    { id: 'stand', emoji: '🪨', x: 136, y: 77 - 0.42 * 14, size: 14 },
    { id: 'crown', emoji: '👑', x: CROWN.x, y: CROWN.y, size: 9, float: true, pivot: 'center' },
    { id: 'rock', emoji: '🪨', x: RX, y: RG, size: R },
    { id: 'hero', emoji: 'hero:cape/fly', x: HX, y: G, size: H },
    { id: 'ant', emoji: '🐜', x: 178, y: AG, size: A },
  ],
  moves: [
    // ① 咻地飛下來，落地擺姿勢
    { at: 0, actor: 'hero', do: 'enter', from: { x: -10, y: 20 }, dur: 0.7, ease: 'in' },
    { at: 0.7, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 0.72, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 1.1, actor: 'hero', do: 'hop', amount: 2, dur: 0.25 },
    // ② 看到王冠，走到大石頭旁邊蹲低
    { at: 1.4, actor: 'crown', do: 'hop', amount: 3, dur: 0.35 },
    { at: 1.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 1.8, actor: 'hero', do: 'moveTo', to: { x: 68, y: G }, dur: 0.4 },
    { at: 2.25, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.3 },
    // 用力！臉漲紅、全身發抖
    { at: 2.4, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 2.4, actor: 'hero', do: 'tint', filter: 'sepia(.6) saturate(3) hue-rotate(-35deg)' },
    { at: 2.4, actor: 'hero', do: 'shake', amount: 1.2, dur: 1.1 },
    { at: 2.5, actor: 'rock', do: 'shake', amount: 0.25, dur: 0.9 },
    // 停一拍……動都沒動，一屁股坐下
    { at: 3.6, actor: 'hero', do: 'tint', filter: '' },
    { at: 3.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.6, actor: 'hero', do: 'moveTo', to: { x: HX, y: G }, dur: 0.3, ease: 'out' },
    // ③ 小螞蟻走過來，拍拍石頭
    { at: 3.9, actor: 'ant', do: 'moveTo', to: { x: 104, y: AG }, dur: 0.9, ease: 'out' },
    { at: 4.85, actor: 'ant', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: 5.05, actor: 'ant', do: 'hop', amount: 1.5, dur: 0.2 },
    // 鑽到石頭底下，嘿咻——舉起來
    { at: 5.3, actor: 'ant', do: 'moveTo', to: { x: RX, y: AG }, dur: 0.25 },
    { at: 5.55, actor: 'ant', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 5.6, actor: 'rock', do: 'moveTo', to: { x: RX, y: RG - LIFT }, dur: 0.25, ease: 'back' },
    { at: 5.7, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 5.7, actor: 'hero', do: 'hop', amount: 4, dur: 0.3 },
    // 舉著石頭走過來，往超人底下一鏟，把他頂上去
    { at: 6.1, actor: 'ant', do: 'moveTo', to: { x: HX, y: AG }, dur: 0.45, ease: 'in' },
    { at: 6.1, actor: 'rock', do: 'moveTo', to: { x: HX, y: RG - LIFT }, dur: 0.45, ease: 'in' },
    { at: 6.45, actor: 'hero', do: 'moveTo', to: { x: HX, y: RG - LIFT + ON }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 6.45, actor: 'hero', do: 'spin', times: 1, dur: 0.35, pivot: 'center' },
    // ④ 王冠彈過來戴上，超人挺胸變大
    { at: 6.7, actor: 'crown', do: 'moveTo', to: { x: HX + 1, y: RG - LIFT + ON - 19 }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 6.7, actor: 'crown', do: 'spin', times: 2, dur: 0.5 },
    { at: 7.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 7.0, actor: 'hero', do: 'scaleTo', amount: 1.2, dur: 0.3, ease: 'back' },
    { at: 7.0, actor: 'crown', do: 'moveTo', to: { x: HX + 1, y: RG - LIFT + ON - 23 }, dur: 0.3, ease: 'back' },
    { at: 7.0, actor: 'crown', do: 'scaleTo', amount: 1.25, dur: 0.3, ease: 'back' },
    // ⑤ 螞蟻撐著，抖一抖
    ...carry([{ at: 8.2, actor: 'rock', do: 'hop', amount: 1.5, dur: 0.3 }]),
    { at: 8.2, actor: 'crown', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 8.6, actor: 'ant', do: 'shake', amount: 0.4, dur: 0.4 },
  ],
  fx: [
    { at: 0.7, kind: 'puff', actor: 'hero', n: 10, dur: 0.6 },
    { at: 1.0, kind: 'pop', actor: 'hero', emoji: '💪', dx: 10, dur: 0.6 },
    { at: 1.4, kind: 'burst', actor: 'crown', emoji: '✨', n: 5, dur: 0.6 },
    { at: 2.6, kind: 'sweat', actor: 'hero' },
    { at: 3.1, kind: 'sweat', actor: 'hero' },
    { at: 3.2, kind: 'pop', actor: 'rock', emoji: '❓', dur: 0.5 },
    { at: 3.75, kind: 'dizzy', actor: 'hero', dur: 0.8 },
    { at: 4.9, kind: 'pop', actor: 'ant', emoji: '👋', dur: 0.5 },
    { at: 5.6, kind: 'puff', actor: 'rock', n: 12, dur: 0.6 },
    { at: 5.75, kind: 'pop', actor: 'hero', emoji: '😱', dx: -9, dur: 0.6 },
    { at: 7.0, kind: 'burst', actor: 'hero', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.9, kind: 'burst', actor: 'hero', emoji: '🎉', n: 8, dur: 0.9 },
    { at: 8.5, kind: 'sweat', actor: 'ant' },
  ],
  camera: [
    { at: 2.3, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 76, y: 58 } },
    { at: 3.55, dur: 0.3, do: 'shake', amount: 0.6 },
    { at: 3.9, dur: 0.5, do: 'zoom', amount: 1 },
    { at: 5.6, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 7.0, dur: 0.4, do: 'punch', amount: 0.12, to: { x: HX, y: 42 } },
    { at: 7.3, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: HX + 4, y: 30 } },
  ],
  lights: [
    { at: 2.4, dur: 0.8, level: 0.15 },
    { at: 3.6, dur: 0.3, level: 0 },
    { at: 7.0, dur: 0.05, level: -0.4 },
    { at: 7.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.7, sfx: 'bonk' },
    { at: 1.4, sfx: 'clink' },
    { at: 2.4, sfx: 'rumble' },
    { at: 3.6, sfx: 'deflate' },
    { at: 4.85, sfx: 'tap' },
    { at: 5.6, sfx: 'boing' },
    { at: 6.45, sfx: 'whoosh' },
    { at: 6.95, sfx: 'clink' },
    { at: 7.2, say: '超人力霸王' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
