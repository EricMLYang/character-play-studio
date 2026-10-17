import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 太：玩具戰士想偷浣熊花生頭上那顆大橘球，高抬腿踮腳偷溜，每一步都吱吱叫、差點吵醒花生；抱到球卻太大抱不動，
// 往後一倒用劍尖戳到花生的鼻子——兩個面對面大叫，花生敬禮敬太用力，三根泡棉棒和球飛上天，一根一根砸成「太」。
// 唸「太陽」時戰士舉起畫著笑臉太陽的盾牌；最後花生又睡著，一顆新的球剛好掉回他頭上。太、太、太陽
const STACK = ['bar1', 'bar2', 'bar3', 'ball']
const BAR = { emoji: '🪵', size: 7, tint: 'saturate(2.6) hue-rotate(-12deg) brightness(1.15)' }
const clip: Clip = {
  char: '太',
  meta: { theme: '偷球大作戰', cast: '玩具戰士＋浣熊花生＋泡棉棒＋大橘球', gags: ['高抬腿偷溜吱吱叫', '球太大抱不動', '面對面大叫', '敬禮太用力發射', '球又掉回頭上'] },
  duration: 10,
  bg: { top: '#FFF4D6', bottom: '#FFF9EC', floor: '#F6D9A8', scenery: 'desert' },
  actors: [
    { id: 'stool', emoji: '🪑', x: 132, y: 72, size: 12 },
    { id: 'pea', emoji: 'hero:raccoon/idle', x: 132, y: 60, size: 13 },
    { id: 'bar1', ...BAR, x: 132, y: 52 },
    { id: 'bar2', ...BAR, x: 132, y: 47.5 },
    { id: 'bar3', ...BAR, x: 132, y: 43 },
    { id: 'ball', emoji: '🟠', x: 132, y: 37.5, size: 8 },
    { id: 'sun', emoji: '🌞', x: 28, y: 52, size: 12, hidden: true, float: true },
    { id: 'ball2', emoji: '🟠', x: 132, y: 49, size: 8, hidden: true },
    { id: 'hero', emoji: 'hero:warrior/idle', x: 24, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'hero', do: 'pop', dur: 0.35 },
    // 看到球，用劍指著它，搓搓手，抬起一隻腳
    { at: 0.5, actor: 'hero', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 0.9, actor: 'hero', do: 'swap', emoji: 'hero:warrior/idle' },
    { at: 0.9, actor: 'hero', do: 'shake', amount: 0.6, dur: 0.4 },
    // 偷溜：高抬腿，一步一吱
    { at: 1.4, actor: 'hero', do: 'moveTo', to: { x: 42, y: 71.1 }, arc: 7, dur: 0.4 },
    { at: 1.6, actor: 'pea', do: 'tilt', amount: 6, dur: 0.2 },
    { at: 1.9, actor: 'hero', do: 'moveTo', to: { x: 60, y: 71.1 }, arc: 7, dur: 0.4 },
    { at: 2.1, actor: 'pea', do: 'tilt', amount: -8, dur: 0.25 },
    ...STACK.map((actor, i) => ({ at: 2.1, actor, do: 'shake' as const, amount: 0.6 + i * 0.4, dur: 0.5 })),
    // 單腳定格
    { at: 2.35, actor: 'hero', do: 'moveTo', to: { x: 66, y: 66 }, dur: 0.15 },
    { at: 2.9, actor: 'hero', do: 'moveTo', to: { x: 84, y: 71.1 }, arc: 5, dur: 0.45 },
    { at: 3.35, actor: 'hero', do: 'moveTo', to: { x: 110, y: 71.1 }, arc: 5, dur: 0.4 },
    // 伸手抱球——球太大了
    { at: 3.75, actor: 'hero', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 3.8, actor: 'ball', do: 'moveTo', to: { x: 112, y: 62 }, dur: 0.25 },
    { at: 3.95, actor: 'ball', do: 'scaleTo', amount: 1.7, dur: 0.2 },
    { at: 4.05, actor: 'hero', do: 'moveTo', to: { x: 118, y: 71.1 }, dur: 0.15, ease: 'out' },
    { at: 4.05, actor: 'ball', do: 'moveTo', to: { x: 120, y: 62 }, dur: 0.15, ease: 'out' },
    // 劍尖戳到鼻子！面對面大叫
    { at: 4.2, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 4.2, actor: 'pea', do: 'hop', amount: 3, dur: 0.2 },
    { at: 4.25, actor: 'hero', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 4.3, actor: 'hero', do: 'squash', amount: -0.2, dur: 0.25 },
    { at: 4.3, actor: 'pea', do: 'squash', amount: -0.2, dur: 0.25 },
    // 花生敬禮敬太用力，整疊發射上天
    { at: 4.6, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 4.62, actor: 'bar1', do: 'moveTo', to: { x: 110, y: -15 }, dur: 0.3, ease: 'in' },
    { at: 4.64, actor: 'bar2', do: 'moveTo', to: { x: 100, y: -15 }, dur: 0.3, ease: 'in' },
    { at: 4.66, actor: 'bar3', do: 'moveTo', to: { x: 90, y: -15 }, dur: 0.3, ease: 'in' },
    { at: 4.62, actor: 'ball', do: 'moveTo', to: { x: 96, y: -20 }, dur: 0.35, ease: 'in' },
    // 戰士慌張亂揮，轉成陀螺轉到左下角
    { at: 4.6, actor: 'hero', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 4.65, actor: 'hero', do: 'moveTo', to: { x: 26, y: 71.1 }, dur: 0.8, ease: 'out' },
    { at: 4.65, actor: 'hero', do: 'spin', times: 4, dur: 0.8 },
    { at: 5.5, actor: 'hero', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 5.3, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 「太陽」：舉起畫著太陽的盾牌
    { at: 6.4, actor: 'hero', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.4, actor: 'hero', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 6.45, actor: 'sun', do: 'pop', dur: 0.4 },
    { at: 6.9, actor: 'sun', do: 'flash', dur: 0.8 },
    // 花生慢半拍才敬禮
    { at: 7.4, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.6, actor: 'pea', do: 'shake', amount: 1, dur: 0.5 },
    // 回馬槍：花生又睡著，一顆新的球掉下來剛好又頂在頭上
    { at: 8.1, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 8.5, actor: 'ball2', do: 'drop', dur: 0.55 },
    ...pressStack(9.0, 0.25, 0.15, 13, ['ball2']),
    { at: 9.0, actor: 'pea', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 8.7, actor: 'sun', do: 'vanish', dur: 0.2 },
    { at: 8.7, actor: 'hero', do: 'swap', emoji: 'hero:warrior/surprised' },
  ],
  builds: [
    // 泡棉棒一根一根砸下來，球是那一點
    { at: 4.95, dur: 0.35, strokes: [0], from: 'bar1', style: 'drop', color: '#F03E3E' },
    { at: 5.25, dur: 0.35, strokes: [1], from: 'bar2', style: 'drop', color: '#F03E3E' },
    { at: 5.55, dur: 0.35, strokes: [2], from: 'bar3', style: 'drop', color: '#F03E3E' },
    { at: 5.9, dur: 0.4, strokes: [3], from: 'ball', style: 'drop', color: '#FD7E14' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'pea', dx: 7, dur: 3.9 },
    { at: 0.5, kind: 'bubble', actor: 'hero', emoji: '🟠', dur: 0.9 },
    { at: 2.35, kind: 'pop', actor: 'pea', emoji: '❓', dx: -6, dur: 0.4 },
    { at: 2.4, kind: 'sweat', actor: 'hero' },
    { at: 4.15, kind: 'burst', actor: 'pea', emoji: '💥', dy: 8, dx: -5, dur: 0.3 },
    { at: 4.3, kind: 'pop', actor: 'hero', emoji: '😱', dur: 0.4 },
    { at: 4.3, kind: 'pop', actor: 'pea', emoji: '😱', dur: 0.4 },
    { at: 5.5, kind: 'dizzy', actor: 'hero', dur: 0.9 },
    { at: 8.1, kind: 'zzz', actor: 'pea', dx: 7, dur: 1.8 },
    { at: 9.1, kind: 'pop', actor: 'hero', emoji: '😑', dur: 0.6 },
  ],
  camera: [
    // 單腳定格那一下推近，大叫時再推近一次
    { at: 2.35, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 80, y: 60 } },
    { at: 4.2, dur: 0.4, do: 'punch', amount: 0.15, to: { x: 124, y: 58 } },
  ],
  cues: [
    { at: 1.45, say: '太' },
    { at: 1.8, sfx: 'tap' },
    { at: 2.3, sfx: 'tap' },
    { at: 3.3, sfx: 'tap' },
    { at: 3.7, sfx: 'tap' },
    { at: 4.15, sfx: 'bonk' },
    { at: 4.3, sfx: 'boing' },
    { at: 4.62, sfx: 'whoosh' },
    { at: 5.2, sfx: 'bonk' },
    { at: 6.3, sfx: 'plop' },
    { at: 6.25, say: '太' },
    { at: 6.95, say: '太陽' },
    { at: 9.0, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
