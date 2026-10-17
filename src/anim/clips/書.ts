import type { Clip, Move } from '../clip'
import { ride } from '../helpers'

// 書：花生頂著一座搖搖晃晃的書塔，踮腳偷拿布忍者睡覺時壓著的金色書，每一步都吱吱叫；手指差一點點碰到時布忍者睜眼，
// 兩個鼻子對鼻子大叫、煙霧彈自己爆開、額頭撞在一起，書塔飛上天，一本本掉下來疊成「書」。布忍者躲進書包卻露出整顆頭，花生還對書包敬禮。書、書、書包
const lead = 'raccoon'
const carry = (moves: Move[]): Move[] => [
  ...ride(moves, 'books', -13, 14),
  ...ride(moves, 'brush', -21, 14).filter((m) => m.actor !== lead),
]

const clip: Clip = {
  char: '書',
  meta: { theme: '偷拿金色書', cast: '浣熊花生＋布忍者＋書塔＋書包', gags: ['踮腳每步都吱吱叫', '鼻子對鼻子大叫撞頭', '躲書包露出整顆頭'] },
  duration: 10,
  bg: { top: '#FFF3C4', bottom: '#FFF9E3', floor: '#F2D58A', scenery: 'room' },
  actors: [
    { id: 'gold', emoji: '📒', x: 132, y: 72, size: 9 },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 132, y: 64, size: 13 },
    { id: 'bag', emoji: '🎒', x: 142, y: 69, size: 13, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 26, y: 71, size: 14, hidden: true, flip: true },
    { id: 'books', emoji: '📚', x: 26, y: 58, size: 10, hidden: true },
    { id: 'brush', emoji: '🖌️', x: 26, y: 50, size: 8, hidden: true },
  ],
  moves: [
    ...carry([
      // 頂著書塔搖搖晃晃走進來
      { at: 0, actor: lead, do: 'enter', from: { x: -15, y: 71 }, dur: 0.9, ease: 'out' },
      { at: 0.95, actor: lead, do: 'squash', amount: 0.15, dur: 0.25 },
      // 踮腳三步：每一步都定住
      { at: 1.8, actor: lead, do: 'moveTo', to: { x: 52, y: 71 }, dur: 0.4, arc: 5 },
      { at: 2.5, actor: lead, do: 'moveTo', to: { x: 78, y: 71 }, dur: 0.4, arc: 5 },
      { at: 3.2, actor: lead, do: 'moveTo', to: { x: 104, y: 71 }, dur: 0.4, arc: 5 },
      { at: 3.75, actor: lead, do: 'moveTo', to: { x: 113, y: 71 }, dur: 0.35 },
    ]),
    // 書塔搖來搖去，指著金色書時差點倒，用尾巴撐住
    { at: 0.4, actor: 'books', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 0.4, actor: 'brush', do: 'tilt', amount: 18, dur: 0.5 },
    { at: 1.15, actor: 'books', do: 'tilt', amount: 28, dur: 0.6 },
    { at: 1.15, actor: 'brush', do: 'tilt', amount: 36, dur: 0.6 },
    { at: 2.0, actor: 'books', do: 'tilt', amount: -10, dur: 0.4 },
    { at: 2.7, actor: 'books', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 3.4, actor: 'books', do: 'tilt', amount: -12, dur: 0.4 },
    // 每吱一聲，布忍者抖一下但沒醒
    { at: 2.2, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 2.9, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.6, actor: 'ninja', do: 'shake', amount: 1, dur: 0.3 },
    // 睜眼！鼻子對鼻子
    { at: 4.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 4.15, actor: lead, do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 4.15, actor: 'ninja', do: 'hop', amount: 4, dur: 0.25 },
    // 煙霧彈自己爆開，額頭撞在一起
    { at: 4.55, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 4.7, actor: 'ninja', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 4.7, actor: lead, do: 'squash', amount: 0.35, dur: 0.3 },
    // 書塔飛上天
    { at: 4.75, actor: 'books', do: 'moveTo', to: { x: 96, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 4.75, actor: 'books', do: 'spin', dur: 0.4 },
    { at: 4.75, actor: 'brush', do: 'moveTo', to: { x: 86, y: -20 }, dur: 0.4, ease: 'out' },
    { at: 4.75, actor: 'gold', do: 'moveTo', to: { x: 36, y: 72 }, dur: 0.8, arc: 30 },
    { at: 4.75, actor: 'gold', do: 'spin', times: 2, dur: 0.8 },
    { at: 5.2, actor: 'books', do: 'vanish', dur: 0.05 },
    { at: 5.2, actor: 'brush', do: 'vanish', dur: 0.05 },
    // 兩個被彈開到兩邊
    { at: 4.95, actor: lead, do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.95, actor: lead, do: 'moveTo', to: { x: 20, y: 71 }, dur: 0.6, arc: 12, ease: 'out' },
    { at: 4.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.95, actor: 'ninja', do: 'moveTo', to: { x: 128, y: 71 }, dur: 0.4, arc: 6, ease: 'out' },
    // 書包出現，布忍者鑽進去——整顆頭露在外面
    { at: 6.6, actor: 'bag', do: 'pop' },
    { at: 6.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 6.9, actor: 'ninja', do: 'moveTo', to: { x: 142, y: 62 }, dur: 0.4, arc: 10 },
    { at: 7.3, actor: 'bag', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    // 花生晃到左下角，在不對的時機敬禮，失去平衡坐下來
    { at: 7.5, actor: lead, do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 7.5, actor: lead, do: 'moveTo', to: { x: 24, y: 71 }, dur: 0.4 },
    { at: 8.1, actor: lead, do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.1, actor: lead, do: 'hop', amount: 3, dur: 0.25 },
    { at: 8.7, actor: lead, do: 'tilt', amount: -20, dur: 0.35 },
    { at: 9.0, actor: lead, do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 9.0, actor: lead, do: 'squash', amount: 0.3, dur: 0.3 },
    // 書包裡的布忍者以為沒人看見，偷偷抖一下
    { at: 9.2, actor: 'bag', do: 'shake', amount: 0.8, dur: 0.4 },
  ],
  builds: [
    // 平平的書掉下來變成一橫一橫，毛筆插在中間變成直的，底下的書扣成「曰」
    { at: 5.25, dur: 0.75, strokes: [0, 1, 2, 3, 5], from: { x: 96, y: -10 }, style: 'drop', color: '#1D3F8F' },
    { at: 5.95, dur: 0.3, strokes: [4], from: { x: 86, y: -10 }, style: 'drop', color: '#1D3F8F' },
    { at: 6.15, dur: 0.55, strokes: [6, 7, 8, 9], from: { x: 96, y: -10 }, style: 'drop', color: '#2B59C3' },
  ],
  glyph: [{ at: 6.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, dur: 4.0, kind: 'zzz', actor: 'ninja' },
    { at: 1.1, kind: 'pop', actor: lead, emoji: '✨', dy: -16, dur: 0.6 },
    { at: 1.3, kind: 'bubble', actor: lead, emoji: '📒', dy: -16, dur: 1.0 },
    { at: 1.4, kind: 'sweat', actor: lead, dy: -6 },
    { at: 3.9, kind: 'sweat', actor: lead, dy: -6 },
    { at: 4.2, kind: 'pop', actor: 'ninja', emoji: '❗', dur: 0.5 },
    { at: 4.35, kind: 'pop', actor: lead, emoji: '😱', dy: -14, dur: 0.5 },
    { at: 4.6, kind: 'burst', actor: 'ninja', emoji: '☁️', n: 7, dur: 0.7 },
    { at: 4.7, kind: 'burst', x: 122, y: 62, dur: 0.5 },
    { at: 5.4, kind: 'dizzy', actor: lead, dur: 2.0 },
    { at: 5.4, kind: 'dizzy', actor: 'ninja', dur: 1.4 },
    { at: 7.4, kind: 'puff', actor: 'bag' },
    { at: 8.15, kind: 'pop', actor: lead, emoji: '🫡', dur: 0.6 },
    { at: 9.0, kind: 'puff', actor: lead },
  ],
  camera: [
    // 鼻子對鼻子那一下推近
    { at: 4.1, dur: 0.6, do: 'punch', amount: 0.3, to: { x: 122, y: 62 } },
    { at: 4.7, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.15, say: '書' },
    { at: 2.1, sfx: 'blip' },
    { at: 2.8, sfx: 'blip' },
    { at: 3.5, sfx: 'blip' },
    { at: 4.2, sfx: 'boing' },
    { at: 4.6, sfx: 'poof' },
    { at: 4.72, sfx: 'bonk' },
    { at: 4.8, sfx: 'whoosh' },
    { at: 6.75, say: '書' },
    { at: 7.35, say: '書包' },
    { at: 7.4, sfx: 'plop' },
    { at: 8.1, sfx: 'tap' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
