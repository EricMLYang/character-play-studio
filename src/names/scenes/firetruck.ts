// 演的是字面意思：消（滅掉）＋防（防火）＋車——一台救火的車子嗚嗚開來，消防員拿水管噴水要把火滅掉。
import { scene } from '../../story/scene'

// 大白天的街上：一小撮火在木頭上燒。消防車嗚嗚嗚衝進來，煞車太猛往前一點頭，消防員從車頂跳下來拿起水管——
// 第一下只滴出兩滴水。消防車用力一抖加大水壓：第二下水柱太強，把消防員往後噴上天、轉圈掉在車頂上。火還在燒……
// 停一拍……一隻小鳥飛過來「呼」一口，火就熄了（消防員傻眼）。消防車不服氣，從車頂噴出一大道噴泉，
// 水花滿天、彩虹出來：「消防車」。小鳥在水花裡洗澡，消防員濕答答地敬禮。
const T = 63.6 // 消防車（size 32）站在地上的 y
const F = 67.8 // 消防員（size 22）
const TRUCK = 112
const ROOF = { x: TRUCK + 2, y: 46 } // 消防員站在車頂
const FIRE = { x: 44, y: 66 }

export default scene({
  duration: 9.6,
  bg: { top: '#6EC3FF', bottom: '#D9F1FF', floor: '#A7B1BC', scenery: 'city' },
  actors: [
    { id: 'house', emoji: '🏠', x: 20, y: 65.2, size: 28 },
    { id: 'light', emoji: '🚦', x: 150, y: 67.8, size: 20 },
    { id: 'log', emoji: '🪵', x: FIRE.x, y: 72.4, size: 11 },
    { id: 'fire', emoji: '🔥', x: FIRE.x, y: FIRE.y, size: 12, float: true },
    { id: 'rainbow', emoji: '🌈', x: 84, y: 38, size: 38, float: true, hidden: true },
    { id: 'truck', emoji: '🚒', x: 205, y: T, size: 32 },
    { id: 'ff', emoji: 'hero:firefighter/idle', x: TRUCK + 2, y: 48, size: 20, hidden: true },
    { id: 'bird', emoji: '🐦', x: 175, y: 8, size: 10, float: true },
  ],
  moves: [
    // 消防車嗚嗚衝進來，煞車太猛（衝過頭彈回來）
    { at: 0.05, actor: 'truck', do: 'moveTo', to: { x: TRUCK, y: T }, dur: 0.75, ease: 'back' },
    { at: 0.8, actor: 'truck', do: 'squash', amount: 0.18, dur: 0.3 },
    { at: 0.1, actor: 'truck', do: 'flash', dur: 0.7 },
    // 消防員從車頂冒出來、跳下車，拿起水管
    { at: 1.0, actor: 'ff', do: 'pop', dur: 0.25 },
    { at: 1.3, actor: 'ff', do: 'moveTo', to: { x: 82, y: F }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 1.9, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    // 第一下：只滴出兩滴水
    { at: 2.2, actor: 'ff', do: 'squash', amount: -0.15, dur: 0.3 },
    // 消防車用力一抖：加大水壓
    { at: 2.9, actor: 'truck', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 2.9, actor: 'truck', do: 'squash', amount: 0.15, dur: 0.5 },
    // 第二下：水柱太強，把消防員往後噴上天，轉圈掉在車頂
    { at: 3.45, actor: 'ff', do: 'moveTo', to: { x: 128, y: 14 }, arc: 4, dur: 0.55, ease: 'out' },
    { at: 3.45, actor: 'ff', do: 'spin', times: -2, dur: 0.95, pivot: 'center' },
    { at: 4.0, actor: 'ff', do: 'moveTo', to: ROOF, dur: 0.4, ease: 'bounce' },
    { at: 4.05, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 4.4, actor: 'truck', do: 'squash', amount: 0.15, dur: 0.3 },
    // 火還在燒……小鳥飛過來，「呼」一口，火熄了
    { at: 4.7, actor: 'fire', do: 'squash', amount: -0.2, dur: 0.6 },
    { at: 4.9, actor: 'bird', do: 'moveTo', to: { x: FIRE.x + 12, y: 71 }, arc: 8, dur: 0.7, ease: 'out' },
    { at: 5.75, actor: 'bird', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 5.85, actor: 'fire', do: 'shake', amount: 0.8, dur: 0.2 },
    { at: 6.0, actor: 'fire', do: 'vanish', dur: 0.25 },
    { at: 6.05, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    // 消防車不服氣：從車頂噴出大噴泉，彩虹出來
    { at: 6.85, actor: 'truck', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 7.05, actor: 'truck', do: 'hop', amount: 4, dur: 0.4 },
    { at: 7.05, actor: 'ff', do: 'hop', amount: 4, dur: 0.4 },
    { at: 7.05, actor: 'truck', do: 'scaleTo', amount: 1.2, dur: 0.35, ease: 'back' },
    { at: 7.05, actor: 'ff', do: 'moveTo', to: { x: ROOF.x + 1, y: ROOF.y - 5 }, dur: 0.35, ease: 'back' },
    { at: 7.1, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 7.3, actor: 'rainbow', do: 'pop', dur: 0.5 },
    { at: 7.6, actor: 'bird', do: 'hop', amount: 5, dur: 0.35 },
    { at: 8.2, actor: 'bird', do: 'hop', amount: 5, dur: 0.35 },
    { at: 8.3, actor: 'truck', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.8, kind: 'puff', actor: 'truck', n: 8, dur: 0.5 },
    { at: 0.85, kind: 'pop', actor: 'truck', emoji: '❗', dx: -10, dur: 0.4 },
    { at: 1.95, kind: 'pop', actor: 'ff', emoji: '💪', dx: 8, dur: 0.5 },
    { at: 2.25, kind: 'fountain', actor: 'ff', emoji: '💧', n: 3, dx: -10, dy: 10, dur: 0.6 },
    { at: 2.5, kind: 'pop', actor: 'ff', emoji: '😅', dx: 8, dur: 0.5 },
    { at: 2.95, kind: 'puff', actor: 'truck', dur: 0.5 },
    { at: 3.4, kind: 'line', actor: 'ff', to: { x: 20, y: 50 }, color: '#7CC8FF', width: 4, dur: 0.6 },
    { at: 3.45, kind: 'burst', actor: 'ff', emoji: '💦', n: 10, dur: 0.8 },
    { at: 4.35, kind: 'dizzy', actor: 'ff', dur: 1.2 },
    { at: 4.45, kind: 'rain', actor: 'ff', emoji: '💧', dur: 0.6 },
    { at: 4.75, kind: 'pop', actor: 'fire', emoji: '😝', dy: 2, dur: 0.6 },
    { at: 5.8, kind: 'pop', actor: 'bird', emoji: '💨', dx: -7, dy: 6, dur: 0.4 },
    { at: 6.0, kind: 'puff', actor: 'fire', n: 6, dur: 0.6 },
    { at: 6.6, kind: 'pop', actor: 'ff', emoji: '😑', dx: -8, dur: 0.5 },
    { at: 6.3, kind: 'pop', actor: 'bird', emoji: '🎵', dur: 0.5 },
    { at: 6.9, kind: 'fountain', actor: 'truck', emoji: '💦', n: 16, dur: 1.6 },
    { at: 7.3, kind: 'burst', actor: 'truck', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'ff', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 0.75, dur: 0.3, do: 'shake', amount: 1 },
    { at: 3.45, dur: 0.4, do: 'shake', amount: 1.6 },
    // 小鳥吹火：推近火和小鳥（定點靠左，車頂上的消防員還留在畫面右邊看）
    { at: 5.2, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: 48, y: 68 } },
    { at: 6.35, dur: 0.4, do: 'zoom', amount: 1, to: { x: 80, y: 45 } },
    { at: 7.0, dur: 0.5, do: 'zoom', amount: 1.35, to: { x: TRUCK, y: 62 } },
  ],
  lights: [
    { at: 3.4, dur: 0.05, level: -0.2 },
    { at: 3.45, dur: 0.3, level: 0 },
    { at: 7.05, dur: 0.05, level: -0.3 },
    { at: 7.1, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.05, sfx: 'whoosh' },
    { at: 0.75, sfx: 'slide' },
    { at: 1.3, sfx: 'boing' },
    { at: 2.25, sfx: 'plop' },
    { at: 2.9, sfx: 'rumble' },
    { at: 3.45, sfx: 'splash' },
    { at: 4.0, sfx: 'bonk' },
    { at: 5.8, sfx: 'poof' },
    { at: 6.9, sfx: 'splash' },
    { at: 7.25, say: '消防車' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
