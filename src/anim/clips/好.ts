import type { Clip } from '../clip'

// 好：浣熊花生頂著一大疊泡棉棒，跟積木小隊來一場友誼枕頭大戰。花生用力一揮——揮空，自己轉兩圈；積木塔也揮空、原地轉。
// 兩個頭昏昏走到中間「咚」地撞頭坐倒，泡棉棒飛到左邊彎成「女」，積木塔倒到右邊排成「子」，拼出「好」。兩個握手、開心跳——
// 最後花生又遲到地敬個禮，頭上最後一根棒子倒下來敲到自己。好、好、好玩
const clip: Clip = {
  char: '好',
  meta: { theme: '雪地泡棉棒大戰', cast: '浣熊花生＋積木小隊＋泡棉棒', gags: ['用力揮空自己轉圈', '兩個撞頭坐倒', '遲到的敬禮被棒子敲頭'] },
  duration: 10,
  bg: { top: '#FFF6C9', bottom: '#FFFBEA', floor: '#F4F1FA', scenery: 'snow' },
  actors: [
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 40, y: 71, size: 14, hidden: true, flip: true },
    { id: 'bricks', emoji: 'hero:brick/march', x: 120, y: 71, size: 14, hidden: true },
    { id: 'shake', emoji: '🤝', x: 80, y: 84, size: 8, hidden: true },
    { id: 'noodle', emoji: '🥢', x: 34, y: 40, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'bricks', do: 'enter', from: { x: 175, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.75, actor: 'bricks', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 0.75, actor: 'bricks', do: 'squash', amount: 0.25, dur: 0.25 },
    // 花生敬禮——整疊棒子歪一邊，趕快扶住
    { at: 0.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 1.0, actor: 'raccoon', do: 'tilt', amount: -22, dur: 0.45 },
    { at: 1.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 1.4, actor: 'raccoon', do: 'shake', amount: 1, dur: 0.4 },
    // 花生大大地往後拉——揮！揮空，轉兩圈
    { at: 1.9, actor: 'raccoon', do: 'tilt', amount: -30, dur: 0.5 },
    { at: 2.35, actor: 'raccoon', do: 'moveTo', to: { x: 62, y: 71 }, dur: 0.3, anticipate: 4, ease: 'in' },
    { at: 2.55, actor: 'raccoon', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.2, actor: 'raccoon', do: 'shake', amount: 1.2, dur: 0.4 },
    // 積木塔也大大地拉——揮空，原地轉
    { at: 2.9, actor: 'bricks', do: 'tilt', amount: 30, dur: 0.45 },
    { at: 3.3, actor: 'bricks', do: 'moveTo', to: { x: 100, y: 71 }, dur: 0.25, anticipate: 4, ease: 'in' },
    { at: 3.5, actor: 'bricks', do: 'spin', times: 2, dur: 0.6 },
    // 頭昏昏走到中間——咚！撞頭
    { at: 4.1, actor: 'raccoon', do: 'moveTo', to: { x: 73, y: 71 }, dur: 0.3, ease: 'in' },
    { at: 4.1, actor: 'bricks', do: 'moveTo', to: { x: 87, y: 71 }, dur: 0.3, ease: 'in' },
    { at: 4.4, actor: 'raccoon', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.4, actor: 'bricks', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.5, actor: 'bricks', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.5, actor: 'raccoon', do: 'moveTo', to: { x: 36, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 4.5, actor: 'bricks', do: 'moveTo', to: { x: 124, y: 71 }, dur: 0.5, ease: 'out' },
    // 握手，一起跳
    { at: 6.5, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.5, actor: 'bricks', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 6.55, actor: 'shake', do: 'pop', dur: 0.35 },
    { at: 6.7, actor: 'raccoon', do: 'bounce', amount: 5, times: 2, dur: 0.8 },
    { at: 6.75, actor: 'bricks', do: 'bounce', amount: 5, times: 2, dur: 0.8 },
    { at: 7.0, actor: 'shake', do: 'shake', amount: 1, dur: 0.6 },
    { at: 7.8, actor: 'shake', do: 'vanish', dur: 0.3 },
    { at: 7.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    { at: 7.8, actor: 'bricks', do: 'swap', emoji: 'hero:brick/idle' },
    // 回馬槍：遲到的敬禮，最後一根棒子倒下來敲到頭
    { at: 8.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.6, actor: 'noodle', do: 'pop', dur: 0.2 },
    { at: 8.7, actor: 'noodle', do: 'moveTo', to: { x: 39, y: 60 }, dur: 0.35, ease: 'in' },
    { at: 8.7, actor: 'noodle', do: 'rotateTo', amount: 120, dur: 0.35 },
    { at: 9.05, actor: 'raccoon', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 9.05, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 9.1, actor: 'noodle', do: 'moveTo', to: { x: 28, y: 72 }, dur: 0.35, arc: 4, ease: 'out' },
    { at: 9.1, actor: 'bricks', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 撞頭甩出去的泡棉棒 → 女；倒下來的積木塔 → 子
    { at: 4.5, dur: 0.6, strokes: [0, 1, 2], from: 'raccoon', color: '#E03131' },
    { at: 4.75, dur: 0.6, strokes: [3, 4, 5], from: 'bricks', color: '#C2255C' },
  ],
  glyph: [{ at: 5.4, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'bricks', emoji: '😤', dur: 0.5 },
    { at: 1.3, kind: 'sweat', actor: 'raccoon' },
    { at: 1.55, kind: 'pop', actor: 'raccoon', emoji: '😠', dur: 0.4 },
    { at: 2.6, kind: 'puff', actor: 'raccoon', dur: 0.5 },
    { at: 3.2, kind: 'dizzy', actor: 'raccoon', dur: 0.8 },
    { at: 3.0, kind: 'pop', actor: 'raccoon', emoji: '😆', dur: 0.4 },
    { at: 3.5, kind: 'puff', actor: 'bricks', dur: 0.5 },
    { at: 4.42, kind: 'burst', x: 80, y: 60, n: 1, dur: 0.45 },
    { at: 4.42, kind: 'burst', x: 80, y: 60, emoji: '⭐', n: 6, dur: 0.6 },
    { at: 5.0, kind: 'dizzy', actor: 'raccoon', dur: 1.2 },
    { at: 5.0, kind: 'dizzy', actor: 'bricks', dur: 1.2 },
    { at: 6.6, kind: 'pop', actor: 'bricks', emoji: '💕', dur: 0.6 },
    { at: 9.1, kind: 'dizzy', actor: 'raccoon', dur: 0.8 },
    { at: 9.2, kind: 'pop', actor: 'bricks', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 2.35, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 60, y: 60 } },
    { at: 4.4, dur: 0.45, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.95, sfx: 'boing' },
    { at: 1.6, say: '好' },
    { at: 2.4, sfx: 'whoosh' },
    { at: 3.35, sfx: 'whoosh' },
    { at: 4.4, sfx: 'bonk' },
    { at: 5.45, say: '好' },
    { at: 6.55, say: '好玩' },
    { at: 6.75, sfx: 'boing' },
    { at: 9.05, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
