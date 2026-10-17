import type { Clip } from '../clip'

// 狼（v8）：玩具戰士坐在湯匙投石器上，拿劍指著對面的大野狼布偶；浣熊花生抱著一疊紅色泡棉條在旁邊幫忙。倒數到一半，花生敬禮手肘撞到把手，
// 戰士提早被射出去，轉著圈飛過狼的頭頂，「砰」撞上柱子再栽進水桶；花生那疊泡棉條被震落，排成「狼」。大野狼站起來比嚎叫，花生又敬禮——又撞到把手。狼、狼、大野狼
const clip: Clip = {
  char: '狼',
  meta: { theme: '投石器提早發射', cast: '玩具戰士＋浣熊花生＋大野狼布偶＋湯匙投石器', gags: ['敬禮撞到把手', '轉著圈飛過頭', '撞柱子栽進水桶', '又敬禮又撞到'] },
  duration: 10,
  bg: { top: '#DDF3E6', bottom: '#F2FBF5', floor: '#A9C79A', scenery: 'forest' },
  actors: [
    { id: 'post', emoji: '🚧', x: 152, y: 68, size: 18 },
    { id: 'wolf', emoji: '🐺', x: 124, y: 70.3, size: 16 },
    { id: 'spoon', emoji: '🥄', x: 22, y: 72, size: 12 },
    { id: 'warrior', emoji: 'hero:warrior/swing', x: 22, y: 64, size: 13, flip: true },
    { id: 'bucket', emoji: '🪣', x: 138, y: 71.5, size: 11 },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 40, y: 71.1, size: 14, hidden: true },
  ],
  moves: [
    // 花生抱著一疊東西搖搖晃晃走過來
    { at: 0.1, actor: 'raccoon', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.9 },
    { at: 0.1, actor: 'raccoon', do: 'shake', amount: 0.5, dur: 0.9 },
    { at: 0.9, actor: 'warrior', do: 'tilt', amount: 12, dur: 0.4 },
    // 倒數：膝蓋一彈一彈
    { at: 1.6, actor: 'warrior', do: 'bounce', amount: 1.5, times: 3, dur: 0.9 },
    // 花生敬禮——手肘撞到把手
    { at: 2.3, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 2.35, actor: 'spoon', do: 'tilt', amount: -40, dur: 0.35 },
    { at: 2.4, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    // 提早發射，轉著圈飛過狼的頭頂
    { at: 2.45, actor: 'warrior', do: 'moveTo', to: { x: 146, y: 56 }, dur: 0.95, arc: 40, ease: 'linear' },
    { at: 2.45, actor: 'warrior', do: 'spin', times: 3, dur: 0.95 },
    { at: 2.8, actor: 'wolf', do: 'tilt', amount: -15, dur: 0.6 },
    // 砰！撞上柱子
    { at: 3.4, actor: 'warrior', do: 'squash', amount: -0.4, dur: 0.25 },
    { at: 3.4, actor: 'post', do: 'shake', amount: 1, dur: 0.4 },
    { at: 3.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 3.4, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    // 彈回來栽進水桶
    { at: 3.65, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 3.65, actor: 'warrior', do: 'moveTo', to: { x: 138, y: 74 }, dur: 0.4, arc: 8, ease: 'in' },
    { at: 4.05, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.2, actor: 'warrior', do: 'shake', amount: 0.6, dur: 1.4 },
    { at: 4.2, actor: 'bucket', do: 'shake', amount: 0.4, dur: 1.4 },
    { at: 4.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 大野狼站起來比嚎叫
    { at: 6.2, actor: 'wolf', do: 'hop', amount: 5, dur: 0.35 },
    { at: 6.6, actor: 'wolf', do: 'tilt', amount: 18, dur: 0.9 },
    { at: 6.6, actor: 'wolf', do: 'squash', amount: -0.15, dur: 0.9 },
    // 戰士從水桶爬出來，舉劍勝利
    { at: 7.4, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 7.4, actor: 'warrior', do: 'moveTo', to: { x: 140, y: 64 }, dur: 0.4, arc: 6 },
    { at: 7.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 7.9, actor: 'warrior', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    // 回馬槍：花生又敬禮，手肘又撞到把手
    { at: 8.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.55, actor: 'spoon', do: 'tilt', amount: -40, dur: 0.35 },
    { at: 8.55, actor: 'spoon', do: 'hop', amount: 10, dur: 0.5 },
    { at: 8.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 8.6, actor: 'raccoon', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
  ],
  builds: [
    // 花生那疊紅色泡棉條震落：先是犭，再來良
    { at: 3.9, dur: 0.5, strokes: [0, 1, 2], from: 'raccoon', color: '#C92A2A' },
    { at: 4.35, dur: 0.95, strokes: [3, 4, 5, 6, 7, 8, 9], from: 'raccoon', color: '#E03131' },
  ],
  glyph: [{ at: 5.35, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'pop', actor: 'warrior', emoji: '👉', dur: 0.4 },
    { at: 1.1, kind: 'pop', actor: 'wolf', emoji: '😊', dur: 0.4 },
    { at: 1.6, kind: 'pop', actor: 'warrior', emoji: '3️⃣', dur: 0.3 },
    { at: 1.95, kind: 'pop', actor: 'warrior', emoji: '2️⃣', dur: 0.3 },
    { at: 2.35, kind: 'pop', actor: 'raccoon', emoji: '❗', dur: 0.3 },
    { at: 2.45, kind: 'puff', actor: 'spoon', dur: 0.4 },
    { at: 2.9, kind: 'pop', actor: 'wolf', emoji: '👀', dur: 0.5 },
    { at: 3.4, kind: 'burst', actor: 'warrior', n: 1, dur: 0.35, dx: -4 },
    { at: 4.05, kind: 'puff', actor: 'bucket', dur: 0.4 },
    { at: 4.3, kind: 'dizzy', actor: 'bucket', dur: 1.5 },
    { at: 4.5, kind: 'sweat', actor: 'raccoon' },
    { at: 6.6, kind: 'pop', actor: 'wolf', emoji: '🌕', dur: 0.8 },
    { at: 8.0, kind: 'pop', actor: 'warrior', emoji: '⭐', dur: 0.5 },
    { at: 8.6, kind: 'pop', actor: 'raccoon', emoji: '😅', dur: 0.6 },
  ],
  camera: [
    { at: 2.45, dur: 0.25, do: 'follow', actor: 'warrior', amount: 1.3 },
    { at: 3.4, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 3.45, dur: 0.45, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.4, sfx: 'tap' },
    { at: 1.05, say: '狼' },
    { at: 1.6, sfx: 'blip' },
    { at: 1.95, sfx: 'blip' },
    { at: 2.4, sfx: 'boing' },
    { at: 2.5, sfx: 'whoosh' },
    { at: 3.4, sfx: 'bonk' },
    { at: 4.05, sfx: 'clink' },
    { at: 5.35, say: '狼' },
    { at: 6.5, say: '大野狼' },
    { at: 8.55, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
