import type { Clip } from '../clip'
import { ride } from '../helpers'

// 推：消防小隊開著消防車想推小推車，調皮的水管一甩，噴在自己背上，把消防車沖得倒退滑走。甩乾再衝，這次只輕輕碰一下——
// 小推車滾去撞倒第一塊梯子板，一塊接一塊骨牌倒成「推」；最後一塊像翹翹板把消防車彈上天，掉到右下角。消防車再輕輕推一下推車，水管揮手掰掰——又噴了自己一臉。推、推、推車
const clip: Clip = {
  char: '推',
  meta: { theme: '消防車推推車', cast: '消防小隊＋消防車＋小推車＋梯子板', gags: ['水管噴自己倒退滑走', '梯子板骨牌倒成字', '翹翹板把消防車彈上天', '水管又噴自己'] },
  duration: 10,
  bg: { top: '#FFF1D6', bottom: '#FFF9EE', floor: '#E8D3B0', scenery: 'city' },
  actors: [
    { id: 'p1', emoji: '🪜', x: 58, y: 66, size: 14 },
    { id: 'p2', emoji: '🪜', x: 70, y: 66, size: 14 },
    { id: 'p3', emoji: '🪜', x: 82, y: 66, size: 14 },
    { id: 'p4', emoji: '🪜', x: 94, y: 66, size: 14 },
    { id: 'seesaw', emoji: '🪜', x: 106, y: 72, size: 10, hidden: true },
    { id: 'cart', emoji: '🛒', x: 44, y: 73, size: 10, flip: true },
    { id: 'engine', emoji: '🚒', x: 22, y: 68, size: 20, hidden: true, flip: true },
    { id: 'crew', emoji: 'hero:firefighter/idle', x: 22, y: 57, size: 11, hidden: true },
  ],
  moves: [
    ...ride([
      { at: 0, actor: 'engine', do: 'enter', from: { x: -20, y: 68 }, dur: 0.6, ease: 'out' },
      // 往後仰蓄力，衝！
      { at: 0.9, actor: 'engine', do: 'squash', amount: -0.25, dur: 0.3 },
      // 水管噴自己背後，沖得倒退滑走
      { at: 1.5, actor: 'engine', do: 'moveTo', to: { x: 12, y: 68 }, dur: 0.6, ease: 'out' },
      { at: 2.15, actor: 'engine', do: 'shake', amount: 1.5, dur: 0.5 },
      // 再衝一次——只輕輕碰一下推車
      { at: 2.9, actor: 'engine', do: 'moveTo', to: { x: 30, y: 68 }, dur: 0.4, anticipate: 3, ease: 'back' },
    ], 'crew', -11, 20),
    { at: 1.15, actor: 'engine', do: 'moveTo', to: { x: 27, y: 68 }, dur: 0.2, ease: 'out' },
    { at: 1.15, actor: 'crew', do: 'moveTo', to: { x: 27, y: 57 }, dur: 0.2, ease: 'out' },
    { at: 1.5, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 1.5, actor: 'crew', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 2.6, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 3.3, actor: 'cart', do: 'moveTo', to: { x: 50, y: 73 }, dur: 0.3, ease: 'out' },
    // 骨牌：一塊接一塊倒下去
    { at: 3.55, actor: 'p1', do: 'rotateTo', amount: 80, dur: 0.25, ease: 'in' },
    { at: 3.75, actor: 'p1', do: 'vanish', dur: 0.15 },
    { at: 3.85, actor: 'p2', do: 'rotateTo', amount: 80, dur: 0.22, ease: 'in' },
    { at: 4.05, actor: 'p2', do: 'vanish', dur: 0.15 },
    { at: 4.1, actor: 'p3', do: 'rotateTo', amount: 80, dur: 0.2, ease: 'in' },
    { at: 4.3, actor: 'p3', do: 'vanish', dur: 0.15 },
    { at: 4.35, actor: 'p4', do: 'rotateTo', amount: 80, dur: 0.18, ease: 'in' },
    { at: 4.55, actor: 'p4', do: 'vanish', dur: 0.15 },
    // 最後一塊變翹翹板，把消防車彈上天，翻過字的上面掉到右下角
    { at: 4.0, actor: 'seesaw', do: 'pop', dur: 0.2 },
    { at: 4.0, actor: 'seesaw', do: 'moveTo', to: { x: 34, y: 72 }, dur: 0.2 },
    { at: 4.75, actor: 'seesaw', do: 'tilt', amount: -30, dur: 0.3 },
    { at: 4.75, actor: 'engine', do: 'moveTo', to: { x: 138, y: 68 }, dur: 0.7, arc: 52, ease: 'linear' },
    { at: 4.75, actor: 'crew', do: 'moveTo', to: { x: 138, y: 57 }, dur: 0.7, arc: 52, ease: 'linear' },
    { at: 5.3, actor: 'seesaw', do: 'vanish', dur: 0.2 },
    { at: 5.45, actor: 'engine', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 5.45, actor: 'crew', do: 'hop', amount: -4, dur: 0.3 },
    { at: 5.45, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    // 推車自己滾到消防車前面（字的下面）
    { at: 5.4, actor: 'cart', do: 'moveTo', to: { x: 118, y: 73 }, dur: 1.0, ease: 'out' },
    { at: 6.6, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/happy' },
    // 輕輕推一下推車，推車開心地滾走
    { at: 7.1, actor: 'engine', do: 'moveTo', to: { x: 132, y: 68 }, dur: 0.25, ease: 'back' },
    { at: 7.1, actor: 'crew', do: 'moveTo', to: { x: 132, y: 57 }, dur: 0.25, ease: 'back' },
    { at: 7.3, actor: 'cart', do: 'moveTo', to: { x: 22, y: 73 }, dur: 1.4, ease: 'out' },
    { at: 7.3, actor: 'cart', do: 'flip' },
    { at: 7.3, actor: 'cart', do: 'bounce', amount: 0.8, times: 4, dur: 1.4 },
    // 回馬槍：水管揮手掰掰——又噴到自己
    { at: 8.4, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 8.7, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.7, actor: 'engine', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 9.3, actor: 'crew', do: 'swap', emoji: 'hero:firefighter/happy' },
  ],
  builds: [
    // 梯子板一塊一塊倒下：短的三塊變「扌」，高的一塊接一塊疊成「隹」
    { at: 3.6, dur: 0.35, strokes: [0, 1, 2], from: 'p1', color: '#862E9C' },
    { at: 3.9, dur: 0.3, strokes: [3, 4], from: 'p2', color: '#9C36B5' },
    { at: 4.15, dur: 0.3, strokes: [5, 6, 7], from: 'p3', color: '#9C36B5' },
    { at: 4.4, dur: 0.4, strokes: [8, 9, 10], from: 'p4', color: '#9C36B5' },
  ],
  glyph: [{ at: 5.0, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'crew', emoji: '👉', dur: 0.5 },
    { at: 0.9, kind: 'puff', actor: 'engine', dur: 0.4 },
    { at: 1.45, kind: 'line', actor: 'crew', to: { x: 6, y: 66 }, color: '#74C0FC', width: 2.5, dur: 0.6 },
    { at: 1.5, kind: 'rain', actor: 'engine', emoji: '💧', dur: 0.7 },
    { at: 2.2, kind: 'pop', actor: 'crew', emoji: '💢', dur: 0.5 },
    { at: 3.3, kind: 'pop', actor: 'cart', emoji: '👆', dur: 0.3 },
    { at: 4.75, kind: 'rain', actor: 'engine', emoji: '💧', dur: 0.8 },
    { at: 5.9, kind: 'dizzy', actor: 'crew', dur: 0.8 },
    { at: 6.6, kind: 'pop', actor: 'crew', emoji: '👍', dur: 0.6 },
    { at: 8.5, kind: 'pop', actor: 'crew', emoji: '👋', dx: -6, dur: 0.4 },
    { at: 8.7, kind: 'fountain', actor: 'crew', emoji: '💧', dur: 0.6 },
    { at: 9.0, kind: 'sweat', actor: 'crew' },
  ],
  camera: [
    { at: 1.5, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 20, y: 60 } },
    { at: 3.55, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 76, y: 58 } },
    { at: 4.7, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.45, dur: 0.25, do: 'shake', amount: 0.6 },
  ],
  cues: [
    { at: 0.6, sfx: 'rumble' },
    { at: 1.2, say: '推' },
    { at: 1.5, sfx: 'splash' },
    { at: 1.6, sfx: 'slide' },
    { at: 3.3, sfx: 'tap' },
    { at: 3.75, sfx: 'clink' },
    { at: 4.05, sfx: 'clink' },
    { at: 4.3, sfx: 'clink' },
    { at: 4.75, sfx: 'boing' },
    { at: 5.0, say: '推' },
    { at: 5.45, sfx: 'bonk' },
    { at: 7.3, say: '推車' },
    { at: 8.7, sfx: 'splash' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
