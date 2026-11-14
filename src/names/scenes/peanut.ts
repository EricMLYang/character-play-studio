// 演的是字面意思：花＋生——浣熊花生把一顆花生種進土裡，一夜過去、澆一桶水，土裡「生」出一朵超大的花，花又生出好多花生。
import { scene } from '../../story/scene'

// 清晨的山坡：浣熊抱著一顆花生走來，挖個洞種下去、拍一拍，坐著等。天黑了，他睡著了；
// 松鼠躡手躡腳來偷挖……一根小芽「啵」地彈到他鼻子上，松鼠嚇跑。天亮了，浣熊醒來衝過去——芽好小（停一拍，翻白眼）。
// 他提一桶水嘩一聲倒下去，地面轟隆隆，小芽變成一朵超大向日葵，把他頂上天！花裡噴出好多花生，
// 一顆砸在他頭上、松鼠在下面接得好開心。浣熊站在花上敬禮：「花生」。
const R = 15 // 浣熊花生
const G = 77 - 0.42 * R
const HAND = { dx: 6, dy: -2 }
const SPOT = 76 // 種花生的地方
const S = 11 // 松鼠
const SG = 77 - 0.42 * S
const TOP = { x: SPOT, y: 31 } // 站在向日葵上

export default scene({
  duration: 9.0,
  bg: { top: '#FFB8A8', bottom: '#FFE9C9', floor: '#8CC56A', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 140, y: 18, size: 14, float: true },
    { id: 'tree', emoji: '🌳', x: 16, y: 77 - 0.42 * 28, size: 28 },
    { id: 'rock', emoji: '🪨', x: 132, y: 77 - 0.42 * 10, size: 10 },
    { id: 'sprout', emoji: '🌱', x: SPOT, y: 77 - 0.42 * 12, size: 12, hidden: true },
    { id: 'nut', emoji: '🥜', x: 40 + HAND.dx, y: G + HAND.dy, size: 7, pivot: 'center' },
    { id: 'coon', emoji: 'hero:raccoon/idle', x: 40, y: G, size: R },
    { id: 'squirrel', emoji: '🐿️', x: 180, y: SG, size: S },
    { id: 'bucket', emoji: '🪣', x: 71, y: G - 9, size: 8, hidden: true, pivot: 'center' },
  ],
  moves: [
    // ① 抱著花生走來
    { at: 0, actor: 'coon', do: 'enter', from: { x: -16, y: G }, dur: 0.8, ease: 'out' },
    { at: 0, actor: 'nut', do: 'enter', from: { x: -16 + HAND.dx, y: G + HAND.dy }, dur: 0.8, ease: 'out' },
    { at: 0.85, actor: 'coon', do: 'moveTo', to: { x: 62, y: G }, dur: 0.45 },
    { at: 0.85, actor: 'nut', do: 'moveTo', to: { x: SPOT, y: 74 }, arc: 6, dur: 0.45 },
    // 挖洞、種下去、拍一拍
    { at: 1.35, actor: 'coon', do: 'tilt', amount: 18, dur: 0.6 },
    { at: 1.45, actor: 'nut', do: 'moveTo', to: { x: SPOT, y: 79 }, dur: 0.3, ease: 'in' },
    { at: 1.7, actor: 'nut', do: 'vanish', dur: 0.1 },
    { at: 1.9, actor: 'coon', do: 'squash', amount: 0.15, dur: 0.2 },
    // ② 坐著等，天黑睡著
    { at: 2.2, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 2.5, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 2.5, actor: 'coon', do: 'tilt', amount: -10, dur: 1.2 },
    // 松鼠躡手躡腳來偷挖
    { at: 2.4, actor: 'squirrel', do: 'moveTo', to: { x: 88, y: SG }, dur: 0.8, ease: 'out' },
    { at: 2.4, actor: 'squirrel', do: 'bounce', amount: 1.5, times: 4, dur: 0.8 },
    { at: 3.25, actor: 'squirrel', do: 'shake', amount: 0.8, dur: 0.4 },
    // 啵！小芽彈到鼻子上，松鼠嚇跑
    { at: 3.7, actor: 'sprout', do: 'pop', dur: 0.25 },
    { at: 3.72, actor: 'squirrel', do: 'hop', amount: 7, dur: 0.35 },
    { at: 4.05, actor: 'squirrel', do: 'flip' },
    { at: 4.1, actor: 'squirrel', do: 'moveTo', to: { x: 134, y: SG - 9 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'squirrel', do: 'flip' },
    // 天亮，浣熊醒來衝過去——好小
    { at: 4.3, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 4.5, actor: 'coon', do: 'moveTo', to: { x: 66, y: G }, dur: 0.2, ease: 'in' },
    { at: 4.75, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 4.8, actor: 'coon', do: 'tilt', amount: 12, dur: 0.6 },
    // ③ 一桶水嘩！
    { at: 5.3, actor: 'bucket', do: 'pop', dur: 0.2 },
    { at: 5.45, actor: 'bucket', do: 'rotateTo', amount: 100, dur: 0.2 },
    { at: 5.5, actor: 'sprout', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 5.9, actor: 'bucket', do: 'vanish', dur: 0.15 },
    // 轟隆隆，長成超大向日葵，把浣熊頂上去
    { at: 5.95, actor: 'sprout', do: 'swap', emoji: '🌿' },
    { at: 5.95, actor: 'sprout', do: 'scaleTo', amount: 1.5, dur: 0.2, ease: 'back' },
    { at: 6.2, actor: 'sprout', do: 'swap', emoji: '🌻' },
    { at: 6.2, actor: 'sprout', do: 'scaleTo', amount: 2.1, dur: 0.35, ease: 'back' },
    { at: 6.2, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 6.2, actor: 'coon', do: 'moveTo', to: TOP, arc: 4, dur: 0.35, ease: 'out' },
    // ④ 花生噴出來，一顆砸在頭上；松鼠接得好開心
    { at: 6.75, actor: 'coon', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 6.7, actor: 'squirrel', do: 'moveTo', to: { x: 102, y: SG }, arc: 6, dur: 0.4, ease: 'out' },
    { at: 7.2, actor: 'squirrel', do: 'bounce', amount: 2, times: 3, dur: 0.8 },
    // ⑤ 站在花上敬禮
    { at: 7.0, actor: 'coon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.0, actor: 'coon', do: 'scaleTo', amount: 1.3, dur: 0.3, ease: 'back' },
    { at: 7.05, actor: 'sprout', do: 'tilt', amount: 6, dur: 0.8 },
    { at: 8.1, actor: 'coon', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'coon', emoji: '😊', dx: 9, dur: 0.5 },
    { at: 1.4, kind: 'puff', actor: 'nut', n: 6, dur: 0.5 },
    { at: 1.7, kind: 'puff', actor: 'nut', n: 6, dur: 0.5 },
    { at: 2.7, kind: 'zzz', actor: 'coon', dur: 1.6 },
    { at: 2.55, kind: 'pop', actor: 'squirrel', emoji: '🤭', dur: 0.6 },
    { at: 3.25, kind: 'puff', actor: 'squirrel', n: 5, dur: 0.4 },
    { at: 3.72, kind: 'pop', actor: 'squirrel', emoji: '❗', dur: 0.5 },
    { at: 3.75, kind: 'sweat', actor: 'squirrel' },
    { at: 4.3, kind: 'pop', actor: 'coon', emoji: '❗', dur: 0.4 },
    { at: 4.85, kind: 'pop', actor: 'coon', emoji: '😑', dx: -9, dur: 0.7 },
    { at: 5.5, kind: 'fountain', actor: 'bucket', emoji: '💧', n: 10, dur: 0.6 },
    { at: 5.95, kind: 'puff', actor: 'sprout', n: 10, dur: 0.6 },
    { at: 6.25, kind: 'burst', actor: 'sprout', emoji: '🍃', n: 8, dur: 0.6 },
    { at: 6.5, kind: 'fountain', actor: 'sprout', emoji: '🥜', n: 14, dur: 1.2 },
    { at: 6.75, kind: 'burst', actor: 'coon', n: 1, dur: 0.4 },
    { at: 7.0, kind: 'burst', actor: 'coon', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.3, kind: 'pop', actor: 'squirrel', emoji: '😋', dur: 0.8 },
    { at: 7.9, kind: 'burst', actor: 'coon', emoji: '🎉', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 3.7, dur: 0.35, do: 'punch', amount: 0.15, to: { x: 82, y: 66 } },
    { at: 6.0, dur: 0.5, do: 'shake', amount: 1.4 },
    { at: 6.9, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 84, y: 42 } },
  ],
  lights: [
    { at: 2.4, dur: 0.6, level: 0.55 },
    { at: 4.1, dur: 0.4, level: 0 },
    { at: 7.0, dur: 0.05, level: -0.35 },
    { at: 7.05, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.4, sfx: 'tap' },
    { at: 1.75, sfx: 'plop' },
    { at: 3.25, sfx: 'tap' },
    { at: 3.7, sfx: 'boing' },
    { at: 4.1, sfx: 'whoosh' },
    { at: 5.5, sfx: 'splash' },
    { at: 6.0, sfx: 'rumble' },
    { at: 6.5, sfx: 'poof' },
    { at: 6.75, sfx: 'bonk' },
    { at: 7.25, say: '花生' },
    { at: 7.9, sfx: 'cheer' },
  ],
})
