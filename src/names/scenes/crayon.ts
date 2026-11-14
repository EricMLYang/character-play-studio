// 演的是字面意思：蠟筆＋小＋新——一支全新、亮晶晶的小筆在街上的磚牆畫畫，畫出來的東西活過來；畫了一隻恐龍，恐龍追著它跑（沒有人物、沒有粗眉毛小孩）。
import { scene } from '../../story/scene'

// 街角：一支全新的小筆咻地飛進來，亮一下。它在磚牆上亂畫一通，畫出一顆太陽——太陽一亮，活過來了！
// 再畫一隻大恐龍……畫好了，敲一敲：沒反應（停一拍），小筆失望地轉身——恐龍活了！吼一聲跳出牆追它。
// 小筆被逼到角落，拚命再畫一塊蛋糕，恐龍一口吞掉、開心得冒愛心。小筆飛到中間轉一圈亮相：「蠟筆小新」。
const SKETCH = 'grayscale(1) brightness(1.9) contrast(0.65)' // 還是牆上的粉筆畫
const R = 66.9 // 恐龍（size 24）站在地上的 y
const SUN = { x: 66, y: 38 }
const REX = { x: 98, y: 58 } // 恐龍畫在牆上的位置

export default scene({
  duration: 9.4,
  bg: { top: '#9ED8FF', bottom: '#E8F6FF', floor: '#B9B4AE', scenery: 'city' },
  actors: [
    { id: 'tree', emoji: '🌳', x: 146, y: 64.4, size: 30 },
    { id: 'wall', emoji: '🧱', x: 82, y: 52.6, size: 58, tint: 'saturate(0.25) brightness(1.3)' },
    { id: 'sun', emoji: '☀️', x: SUN.x, y: SUN.y, size: 14, hidden: true, float: true, pivot: 'center', tint: SKETCH },
    { id: 'rex', emoji: '🦖', x: REX.x, y: REX.y, size: 24, hidden: true, float: true, tint: SKETCH },
    { id: 'cake', emoji: '🍰', x: 36, y: 71.2, size: 14, hidden: true, tint: SKETCH },
    { id: 'pen', emoji: '✏️', x: 40, y: 46, size: 14, float: true, pivot: 'center' },
  ],
  moves: [
    // 全新的小筆咻地飛進來，轉一圈亮一下
    { at: 0.05, actor: 'pen', do: 'enter', from: { x: -14, y: 30 }, dur: 0.6, anticipate: 4, ease: 'back' },
    { at: 0.7, actor: 'pen', do: 'spin', times: 1, dur: 0.4 },
    // 畫太陽：在牆上亂畫一通
    { at: 1.1, actor: 'pen', do: 'moveTo', to: { x: 60, y: 42 }, dur: 0.15 },
    { at: 1.25, actor: 'pen', do: 'moveTo', to: { x: 74, y: 34 }, dur: 0.12 },
    { at: 1.37, actor: 'pen', do: 'moveTo', to: { x: 62, y: 32 }, dur: 0.12 },
    { at: 1.49, actor: 'pen', do: 'moveTo', to: { x: 76, y: 44 }, dur: 0.12 },
    { at: 1.61, actor: 'pen', do: 'moveTo', to: { x: 56, y: 46 }, dur: 0.15 },
    { at: 1.7, actor: 'sun', do: 'pop', dur: 0.2 },
    // 太陽活過來
    { at: 2.0, actor: 'sun', do: 'tint', filter: '' },
    { at: 2.0, actor: 'sun', do: 'spin', times: 1, dur: 0.5 },
    { at: 2.0, actor: 'sun', do: 'scaleTo', amount: 1.2, dur: 0.3, ease: 'back' },
    { at: 2.15, actor: 'pen', do: 'hop', amount: 4, dur: 0.3 },
    // 太陽飛出牆，掛到天上
    { at: 2.4, actor: 'sun', do: 'moveTo', to: { x: 36, y: 16 }, arc: 6, dur: 0.6, ease: 'out' },
    // 畫一隻大恐龍
    { at: 2.55, actor: 'pen', do: 'moveTo', to: { x: 90, y: 40 }, dur: 0.15 },
    { at: 2.7, actor: 'pen', do: 'moveTo', to: { x: 106, y: 46 }, dur: 0.12 },
    { at: 2.82, actor: 'pen', do: 'moveTo', to: { x: 92, y: 54 }, dur: 0.12 },
    { at: 2.94, actor: 'pen', do: 'moveTo', to: { x: 108, y: 58 }, dur: 0.12 },
    { at: 3.06, actor: 'pen', do: 'moveTo', to: { x: 94, y: 36 }, dur: 0.12 },
    { at: 3.18, actor: 'pen', do: 'moveTo', to: { x: 80, y: 44 }, dur: 0.2 },
    { at: 3.2, actor: 'rex', do: 'pop', dur: 0.25 },
    // 敲一敲……沒反應
    { at: 3.6, actor: 'pen', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 3.85, actor: 'pen', do: 'tilt', amount: -25, dur: 0.2 },
    { at: 4.5, actor: 'pen', do: 'moveTo', to: { x: 68, y: 48 }, dur: 0.35 },
    { at: 4.5, actor: 'pen', do: 'tilt', amount: 15, dur: 0.35 },
    // 活了！吼——跳出牆
    { at: 4.9, actor: 'rex', do: 'tint', filter: '' },
    { at: 4.9, actor: 'rex', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 4.95, actor: 'pen', do: 'hop', amount: 6, dur: 0.3 },
    { at: 4.95, actor: 'sun', do: 'shake', amount: 1, dur: 0.3 },
    { at: 5.2, actor: 'rex', do: 'moveTo', to: { x: 100, y: R }, dur: 0.3, ease: 'bounce' },
    // 追！小筆往左逃，恐龍追上去
    { at: 5.3, actor: 'pen', do: 'moveTo', to: { x: 16, y: 54 }, dur: 0.5, anticipate: 3, ease: 'in' },
    { at: 5.5, actor: 'rex', do: 'flip' },
    { at: 5.55, actor: 'rex', do: 'moveTo', to: { x: 62, y: R }, dur: 0.6, ease: 'in' },
    // 被逼到角落，拚命再畫一塊蛋糕
    { at: 6.0, actor: 'pen', do: 'moveTo', to: { x: 30, y: 62 }, dur: 0.1 },
    { at: 6.1, actor: 'pen', do: 'moveTo', to: { x: 42, y: 66 }, dur: 0.1 },
    { at: 6.2, actor: 'pen', do: 'moveTo', to: { x: 30, y: 70 }, dur: 0.1 },
    { at: 6.3, actor: 'pen', do: 'moveTo', to: { x: 22, y: 56 }, dur: 0.15 },
    { at: 6.3, actor: 'cake', do: 'pop', dur: 0.2 },
    { at: 6.5, actor: 'cake', do: 'tint', filter: '' },
    { at: 6.5, actor: 'cake', do: 'hop', amount: 3, dur: 0.25 },
    { at: 6.2, actor: 'rex', do: 'shake', amount: 0.6, dur: 0.3 },
    // 恐龍一口吞掉蛋糕，開心
    { at: 6.65, actor: 'rex', do: 'moveTo', to: { x: 46, y: R }, dur: 0.25, ease: 'out' },
    { at: 6.9, actor: 'cake', do: 'vanish', dur: 0.1 },
    { at: 6.9, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 7.2, actor: 'rex', do: 'flip' },
    { at: 7.4, actor: 'rex', do: 'tilt', amount: -10, dur: 0.6 },
    // 亮相：小筆飛到中間，變大轉一圈
    { at: 7.2, actor: 'pen', do: 'moveTo', to: { x: 86, y: 56 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 7.2, actor: 'pen', do: 'scaleTo', amount: 2.2, dur: 0.4, ease: 'back' },
    { at: 7.2, actor: 'pen', do: 'spin', times: 1, dur: 0.4 },
    { at: 7.9, actor: 'sun', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.1, actor: 'pen', do: 'hop', amount: 3, dur: 0.35 },
  ],
  fx: [
    { at: 0.7, kind: 'burst', actor: 'pen', emoji: '✨', n: 6, dur: 0.6 },
    { at: 1.2, kind: 'puff', actor: 'pen', n: 4, dur: 0.4 },
    { at: 2.0, kind: 'burst', actor: 'sun', emoji: '✨', n: 8, dur: 0.7 },
    { at: 2.6, kind: 'puff', actor: 'pen', n: 4, dur: 0.4 },
    { at: 3.9, kind: 'bubble', actor: 'pen', emoji: '❓', dur: 0.6 },
    { at: 4.55, kind: 'pop', actor: 'pen', emoji: '😑', dx: -6, dur: 0.5 },
    { at: 4.9, kind: 'pop', actor: 'rex', emoji: '💢', dx: 6, dur: 0.6 },
    { at: 5.0, kind: 'pop', actor: 'pen', emoji: '😱', dx: -6, dur: 0.5 },
    { at: 5.85, kind: 'sweat', actor: 'pen' },
    { at: 6.0, kind: 'puff', actor: 'pen', n: 6, dur: 0.5 },
    { at: 6.5, kind: 'burst', actor: 'cake', emoji: '✨', n: 5, dur: 0.5 },
    { at: 7.0, kind: 'pop', actor: 'rex', emoji: '💕', dx: 4, dur: 0.8 },
    { at: 7.6, kind: 'burst', actor: 'pen', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 7.7, kind: 'burst', actor: 'pen', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 4.9, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 4.9, dur: 0.3, do: 'punch', amount: 0.15, to: { x: 98, y: 50 } },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 80, y: 46 } },
  ],
  lights: [
    { at: 2.0, dur: 0.1, level: -0.3 },
    { at: 2.1, dur: 0.4, level: 0 },
    { at: 4.6, dur: 0.25, level: 0.3 },
    { at: 4.9, dur: 0.3, level: 0 },
    { at: 7.6, dur: 0.05, level: -0.35 },
    { at: 7.65, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.7, sfx: 'blip' },
    { at: 1.1, sfx: 'tap' },
    { at: 2.0, sfx: 'boing' },
    { at: 2.55, sfx: 'tap' },
    { at: 3.6, sfx: 'tap' },
    { at: 3.85, sfx: 'tap' },
    { at: 4.9, sfx: 'rumble' },
    { at: 5.3, sfx: 'whoosh' },
    { at: 6.0, sfx: 'tap' },
    { at: 6.9, sfx: 'gulp' },
    { at: 7.6, say: '蠟筆小新' },
    { at: 7.7, sfx: 'cheer' },
  ],
})
