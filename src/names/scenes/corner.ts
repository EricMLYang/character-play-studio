// 演的是字面意思：角落（房間的牆角）＋小夥伴（一群好朋友）——打雷的晚上，一群小夥伴都想擠進同一個角落，最後大象一擠，大家全彈飛，落在大象身上一起窩在角落（沒有白熊、企鵝、炸豬排、貓那一組造型）。
import { scene } from '../../story/scene'

// 打雷的晚上，房間裡：小熊抱著自己縮進牆角。轟隆！小兔子尖叫衝進來擠進角落，小熊被擠到兔子頭上；
// 再一聲雷，松鼠也衝進來硬擠，三個疊成一團發抖。烏龜慢慢、慢慢走過來，大家吸氣讓位……
// 停一拍……烏龜轉頭走到對面的空角落，自己躺下（大家傻眼）。最後大象嚇得衝過來往角落一擠——砰！
// 三個小夥伴全被彈上天，轉圈掉下來，剛好落在大象背上疊成一座小山。又打雷了，這次大家抱在一起不怕了：「角落小夥伴」。
const B = 12 // 小熊
const R = 12 // 小兔子
const Q = 12 // 松鼠
const E = 28 // 大象
const g = (s: number) => 77 - 0.42 * s
const CX = 30 // 角落

export default scene({
  duration: 9.6,
  bg: { top: '#3B3566', bottom: '#6F65A3', floor: '#8A6A55', scenery: 'room' },
  actors: [
    { id: 'clock', emoji: '🌙', x: 126, y: 16, size: 8, float: true },
    { id: 'sofa', emoji: '🛋️', x: 104, y: g(20), size: 20 },
    { id: 'turtle', emoji: '🐢', x: 182, y: g(11), size: 11 },
    { id: 'eleph', emoji: '🐘', x: 196, y: g(E), size: E },
    { id: 'bear', emoji: '🧸', x: 60, y: g(B), size: B },
    { id: 'rabbit', emoji: '🐇', x: 190, y: g(R), size: R },
    { id: 'squirrel', emoji: '🐿', x: 200, y: g(Q), size: Q, flip: true },
  ],
  moves: [
    // ① 小熊縮進牆角
    { at: 0, actor: 'bear', do: 'moveTo', to: { x: CX, y: g(B) }, dur: 0.8, ease: 'out' },
    { at: 0.85, actor: 'bear', do: 'squash', amount: 0.15, dur: 0.3 },
    // 轟隆！小兔子衝進來擠進角落，小熊被擠到兔子頭上
    { at: 1.15, actor: 'rabbit', do: 'moveTo', to: { x: CX + 2, y: g(R) }, dur: 0.5, ease: 'in' },
    { at: 1.6, actor: 'bear', do: 'moveTo', to: { x: CX + 1, y: g(B) - 11 }, arc: 3, dur: 0.25, ease: 'out' },
    { at: 1.6, actor: 'rabbit', do: 'squash', amount: 0.2, dur: 0.25 },
    // 再一聲雷，松鼠也衝進來硬擠
    { at: 2.15, actor: 'squirrel', do: 'moveTo', to: { x: CX + 12, y: g(Q) }, dur: 0.5, ease: 'in' },
    { at: 2.65, actor: 'rabbit', do: 'moveTo', to: { x: CX - 1, y: g(R) }, dur: 0.15, ease: 'out' },
    { at: 2.65, actor: 'bear', do: 'moveTo', to: { x: CX + 6, y: g(B) - 12 }, dur: 0.15, ease: 'out' },
    { at: 2.65, actor: 'squirrel', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 2.9, actor: 'rabbit', do: 'shake', amount: 0.5, dur: 0.6 },
    { at: 2.9, actor: 'squirrel', do: 'shake', amount: 0.5, dur: 0.6 },
    { at: 2.9, actor: 'bear', do: 'shake', amount: 0.5, dur: 0.6 },
    // ② 烏龜慢慢走過來，大家吸氣讓位……
    { at: 2.8, actor: 'turtle', do: 'moveTo', to: { x: 54, y: g(11) }, dur: 1.4, ease: 'linear' },
    { at: 4.0, actor: 'squirrel', do: 'squash', amount: -0.15, dur: 0.5 },
    { at: 4.0, actor: 'rabbit', do: 'squash', amount: -0.15, dur: 0.5 },
    // 停一拍……轉頭走去對面的空角落
    { at: 4.6, actor: 'turtle', do: 'flip' },
    { at: 4.7, actor: 'turtle', do: 'moveTo', to: { x: 146, y: g(11) }, dur: 0.9, ease: 'inOut' },
    { at: 5.6, actor: 'turtle', do: 'squash', amount: 0.2, dur: 0.3 },
    // ③ 大象嚇得衝過來往角落一擠
    { at: 5.5, actor: 'eleph', do: 'moveTo', to: { x: CX + 10, y: g(E) }, dur: 0.6, ease: 'in', anticipate: 4 },
    // 砰！三個全彈上天
    { at: 6.05, actor: 'rabbit', do: 'moveTo', to: { x: 46, y: 14 }, dur: 0.35, ease: 'out' },
    { at: 6.05, actor: 'squirrel', do: 'moveTo', to: { x: 62, y: 20 }, dur: 0.35, ease: 'out' },
    { at: 6.05, actor: 'bear', do: 'moveTo', to: { x: 30, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 6.05, actor: 'rabbit', do: 'spin', times: 2, dur: 0.7, pivot: 'center' },
    { at: 6.05, actor: 'squirrel', do: 'spin', times: -2, dur: 0.7, pivot: 'center' },
    { at: 6.05, actor: 'bear', do: 'spin', times: 2, dur: 0.7, pivot: 'center' },
    { at: 6.05, actor: 'eleph', do: 'squash', amount: 0.25, dur: 0.3 },
    // ④ 掉下來疊在大象背上
    { at: 6.45, actor: 'rabbit', do: 'moveTo', to: { x: CX + 2, y: 56 }, dur: 0.35, ease: 'bounce' },
    { at: 6.5, actor: 'squirrel', do: 'moveTo', to: { x: CX + 19, y: 57 }, dur: 0.35, ease: 'bounce' },
    { at: 6.6, actor: 'bear', do: 'moveTo', to: { x: CX + 10, y: 45 }, dur: 0.4, ease: 'bounce' },
    // 又打雷了——這次抱在一起不怕
    { at: 7.2, actor: 'eleph', do: 'hop', amount: 2, dur: 0.3 },
    { at: 7.2, actor: 'rabbit', do: 'hop', amount: 2, dur: 0.3 },
    { at: 7.2, actor: 'squirrel', do: 'hop', amount: 2, dur: 0.3 },
    { at: 7.2, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.25, actor: 'bear', do: 'scaleTo', amount: 1.25, dur: 0.3, ease: 'back' },
    { at: 8.2, actor: 'rabbit', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 8.2, actor: 'squirrel', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 8.6, actor: 'turtle', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'bear', emoji: '😅', dur: 0.5 },
    { at: 1.15, kind: 'pop', actor: 'rabbit', emoji: '😱', dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'rabbit', n: 8, dur: 0.4 },
    { at: 2.15, kind: 'pop', actor: 'squirrel', emoji: '😱', dur: 0.5 },
    { at: 2.65, kind: 'puff', actor: 'squirrel', n: 8, dur: 0.4 },
    { at: 3.0, kind: 'sweat', actor: 'bear' },
    { at: 4.6, kind: 'pop', actor: 'turtle', emoji: '❓', dur: 0.4 },
    { at: 5.2, kind: 'pop', actor: 'rabbit', emoji: '😑', dur: 0.6 },
    { at: 5.7, kind: 'zzz', actor: 'turtle', emoji: '💤', dur: 3.5 },
    { at: 5.5, kind: 'pop', actor: 'eleph', emoji: '😱', dx: -6, dur: 0.5 },
    { at: 5.7, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.4 },
    { at: 6.05, kind: 'burst', actor: 'eleph', n: 1, dy: -6, dur: 0.4 },
    { at: 6.05, kind: 'puff', actor: 'eleph', n: 16, dur: 0.7 },
    { at: 7.2, kind: 'burst', actor: 'bear', emoji: '✨', n: 10, dur: 0.9 },
    { at: 8.0, kind: 'burst', actor: 'bear', emoji: '💕', n: 7, dur: 1.0 },
  ],
  camera: [
    { at: 1.1, dur: 0.3, do: 'shake', amount: 1 },
    { at: 2.1, dur: 0.3, do: 'shake', amount: 1 },
    { at: 6.05, dur: 0.4, do: 'shake', amount: 1.6 },
    { at: 6.6, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 39, y: 57 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.3 },
    { at: 1.1, dur: 0.05, level: -0.4 },
    { at: 1.15, dur: 0.3, level: 0.3 },
    { at: 2.1, dur: 0.05, level: -0.4 },
    { at: 2.15, dur: 0.3, level: 0.3 },
    { at: 5.45, dur: 0.05, level: -0.4 },
    { at: 5.5, dur: 0.3, level: 0.3 },
    { at: 7.15, dur: 0.05, level: -0.35 },
    { at: 7.2, dur: 0.4, level: 0.1 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.1, sfx: 'crack' },
    { at: 1.6, sfx: 'bonk' },
    { at: 2.1, sfx: 'crack' },
    { at: 2.65, sfx: 'bonk' },
    { at: 4.0, sfx: 'gulp' },
    { at: 4.7, sfx: 'slide' },
    { at: 5.45, sfx: 'rumble' },
    { at: 6.05, sfx: 'boing' },
    { at: 6.5, sfx: 'plop' },
    { at: 7.15, sfx: 'crack' },
    { at: 7.3, say: '角落小夥伴' },
    { at: 8.1, sfx: 'cheer' },
  ],
})
