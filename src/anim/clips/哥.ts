import type { Clip } from '../clip'

// 哥：浣熊助手花生抱著一疊比他還高的積木，最底下一塊小積木長腳逃跑了！他敬禮敬錯時間、繞圈追過頭、被自己的尾巴絆倒翻跟斗，
// 積木一塊塊掉成一堆；最後一個飛撲壓住小積木，「碰」一聲整堆彈起來疊成「哥」。花生像哥哥一樣把小積木扛上頭拍拍它，
// 回馬槍：小積木敬禮，花生慢半拍回敬——一敬禮就把頭上的小積木撥下去了。哥、哥、哥哥
const clip: Clip = {
  char: '哥',
  meta: { theme: '花生追逃跑積木', cast: '浣熊花生＋長腳小積木＋一疊積木', gags: ['敬禮敬錯時間', '繞圈追過頭被尾巴絆倒', '飛撲壓住小積木'] },
  duration: 10,
  bg: { top: '#FFF3D6', bottom: '#FFFBF0', floor: '#E6CFA6', scenery: 'hills' },
  actors: [
    { id: 'k1', emoji: '🧱', x: 74, y: 72.5, size: 8, hidden: true },
    { id: 'k2', emoji: '🧱', x: 86, y: 72.5, size: 8, hidden: true },
    { id: 'k3', emoji: '🧱', x: 80, y: 66, size: 8, hidden: true },
    { id: 'tiny', emoji: '🧱', x: 38, y: 74, size: 6, hidden: true },
    { id: 'pea', emoji: 'hero:raccoon/carry', x: 34, y: 70.5, size: 15, hidden: true, flip: true },
  ],
  moves: [
    // 抱著搖搖晃晃的積木塔走進來
    { at: 0.0, actor: 'pea', do: 'enter', from: { x: -18, y: 70.5 }, dur: 0.7, ease: 'out' },
    { at: 0.0, actor: 'pea', do: 'bounce', amount: 1.5, times: 4, dur: 0.7 },
    // 最底下的小積木長腳溜走
    { at: 0.9, actor: 'tiny', do: 'pop', dur: 0.2 },
    { at: 1.0, actor: 'tiny', do: 'moveTo', to: { x: 92, y: 74 }, dur: 0.5, ease: 'out' },
    { at: 1.0, actor: 'tiny', do: 'bounce', amount: 1.5, times: 4, dur: 0.5 },
    // 敬禮敬錯時間，積木塔一歪
    { at: 1.1, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 1.1, actor: 'pea', do: 'tilt', amount: -14, dur: 0.4 },
    { at: 1.4, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 第一圈：追過頭
    { at: 1.6, actor: 'tiny', do: 'moveTo', to: { x: 128, y: 74 }, dur: 0.5 },
    { at: 1.75, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 1.75, actor: 'pea', do: 'moveTo', to: { x: 140, y: 70.5 }, dur: 0.55, anticipate: 3, ease: 'in' },
    { at: 2.3, actor: 'pea', do: 'moveTo', to: { x: 132, y: 70.5 }, dur: 0.3, ease: 'back' },
    // 第二圈：小積木往回跑，花生轉身追——被自己的尾巴絆倒，翻跟斗，積木一塊塊飛出去
    { at: 2.2, actor: 'tiny', do: 'moveTo', to: { x: 66, y: 74 }, dur: 0.5 },
    { at: 2.65, actor: 'pea', do: 'flip' },
    { at: 2.7, actor: 'pea', do: 'moveTo', to: { x: 112, y: 70.5 }, dur: 0.3, ease: 'in' },
    { at: 3.0, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 3.0, actor: 'pea', do: 'moveTo', to: { x: 100, y: 70.5 }, arc: 12, dur: 0.5, ease: 'out' },
    { at: 3.0, actor: 'pea', do: 'spin', times: 1, dur: 0.5 },
    { at: 3.05, actor: 'k1', do: 'enter', from: { x: 108, y: 56 }, arc: 10, dur: 0.45, ease: 'bounce' },
    { at: 3.15, actor: 'k2', do: 'enter', from: { x: 106, y: 56 }, arc: 12, dur: 0.45, ease: 'bounce' },
    { at: 3.25, actor: 'k3', do: 'enter', from: { x: 102, y: 54 }, arc: 14, dur: 0.45, ease: 'bounce' },
    { at: 3.1, actor: 'tiny', do: 'moveTo', to: { x: 80, y: 61 }, dur: 0.4, arc: 6 },
    // 爬起來甩甩頭；小積木在積木堆上跺腳揮手
    { at: 3.6, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 3.6, actor: 'pea', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 3.7, actor: 'tiny', do: 'bounce', amount: 1.2, times: 3, dur: 0.6 },
    // 倒退幾步拉開距離，蓄力……飛撲！
    { at: 3.95, actor: 'pea', do: 'moveTo', to: { x: 126, y: 70.5 }, dur: 0.3 },
    { at: 4.25, actor: 'pea', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 4.25, actor: 'pea', do: 'shake', amount: 1, dur: 0.3 },
    { at: 4.55, actor: 'pea', do: 'moveTo', to: { x: 82, y: 70.5 }, arc: 18, dur: 0.4, ease: 'in' },
    { at: 4.95, actor: 'pea', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 4.95, actor: 'tiny', do: 'vanish', dur: 0.1 },
    { at: 5.0, actor: 'k1', do: 'vanish', dur: 0.2 },
    { at: 5.35, actor: 'k2', do: 'vanish', dur: 0.2 },
    { at: 5.0, actor: 'k3', do: 'vanish', dur: 0.2 },
    // 被反彈到左邊，頭昏昏地抱著小積木
    { at: 5.1, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 5.1, actor: 'pea', do: 'moveTo', to: { x: 34, y: 70.5 }, arc: 12, dur: 0.6, ease: 'out' },
    { at: 5.6, actor: 'tiny', do: 'moveTo', to: { x: 39, y: 69 }, dur: 0.01 },
    { at: 5.65, actor: 'tiny', do: 'pop', dur: 0.2 },
    // 像哥哥一樣把小積木扛上頭，拍拍它
    { at: 6.4, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.5, actor: 'tiny', do: 'moveTo', to: { x: 34, y: 61 }, arc: 5, dur: 0.35 },
    { at: 6.9, actor: 'tiny', do: 'bounce', amount: 1, times: 3, dur: 0.6 },
    // 回馬槍：小積木敬禮，花生慢半拍回敬——把小積木撥下去
    { at: 7.8, actor: 'tiny', do: 'hop', amount: 2, dur: 0.25 },
    { at: 8.4, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.45, actor: 'tiny', do: 'moveTo', to: { x: 44, y: 74 }, arc: 6, dur: 0.4, ease: 'bounce' },
    { at: 8.45, actor: 'tiny', do: 'spin', times: 1, dur: 0.4 },
    { at: 8.9, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 9.2, actor: 'tiny', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    { at: 9.3, actor: 'pea', do: 'swap', emoji: 'hero:raccoon/happy' },
  ],
  builds: [
    // 飛撲把整堆積木彈起來：上面的「可」→ 下面的「可」
    { at: 5.0, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'k3', color: '#3B4CCA' },
    { at: 5.35, dur: 0.7, strokes: [5, 6, 7, 8, 9], from: 'k2', color: '#3B4CCA' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.95, kind: 'pop', actor: 'tiny', emoji: '👣', dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'pea', emoji: '❗', dur: 0.5, dx: 6 },
    { at: 2.3, kind: 'puff', actor: 'pea', dur: 0.5 },
    { at: 2.4, kind: 'sweat', actor: 'pea' },
    { at: 3.0, kind: 'burst', actor: 'pea', emoji: '⭐', n: 5, dur: 0.5 },
    { at: 3.9, kind: 'pop', actor: 'tiny', emoji: '👋', dur: 0.6 },
    { at: 4.95, kind: 'burst', x: 82, y: 66, dur: 0.4 },
    { at: 5.0, kind: 'puff', actor: 'pea', dur: 0.5 },
    { at: 5.7, kind: 'dizzy', actor: 'pea', dur: 0.8 },
    { at: 6.9, kind: 'pop', actor: 'pea', emoji: '💕', dur: 0.8, dx: 7 },
    { at: 7.8, kind: 'pop', actor: 'tiny', emoji: '🫡', dur: 0.6, dx: 5 },
    { at: 8.9, kind: 'sweat', actor: 'pea' },
    { at: 9.2, kind: 'pop', actor: 'tiny', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 4.2, dur: 0.35, do: 'zoom', amount: 1.25, to: { x: 120, y: 60 } },
    { at: 4.55, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.95, dur: 0.35, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.0, sfx: 'blip' },
    { at: 1.5, say: '哥' },
    { at: 2.3, sfx: 'slide' },
    { at: 3.0, sfx: 'bonk' },
    { at: 3.3, sfx: 'clink' },
    { at: 4.55, sfx: 'whoosh' },
    { at: 4.95, sfx: 'bonk' },
    { at: 6.1, say: '哥' },
    { at: 6.9, say: '哥哥' },
    { at: 8.45, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
