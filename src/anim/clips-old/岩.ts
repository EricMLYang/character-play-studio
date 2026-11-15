import type { Clip } from '../clip'

// 岩：浣熊花生頂著一疊小石頭走進來，看到綁繩子的大岩石，敬禮一敬，頭上的石頭全倒了。積木小隊從右邊踏步進來搶另一頭繩子，
// 兩邊拔河拔到腳滑臉紅——繩子「啪」地彈開，兩邊跌坐，大岩石震成碎塊，「山」在上「石」在下拼成「岩」。花生撿起一顆小石頭舉高敬禮；
// 積木小隊爬起來又疊成塔，結果又整隊歪倒。岩、岩、岩石
const clip: Clip = {
  char: '岩',
  meta: { theme: '沙地拔河搶大岩石', cast: '浣熊花生＋積木小隊＋大岩石', gags: ['敬禮敬到頭上石頭全倒', '拔河繩子彈開兩邊跌坐', '積木小隊爬起來又倒'] },
  duration: 10,
  bg: { top: '#FFF4DC', bottom: '#FDEBC8', floor: '#E2C08D', scenery: 'desert' },
  actors: [
    { id: 'p1', emoji: '🪨', x: 34, y: 56, size: 6, hidden: true },
    { id: 'p2', emoji: '🪨', x: 34, y: 56, size: 5, hidden: true },
    { id: 'p3', emoji: '🪨', x: 34, y: 56, size: 5, hidden: true },
    { id: 'rock', emoji: '🪨', x: 80, y: 67, size: 24 },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 34, y: 71, size: 14, hidden: true, flip: true },
    { id: 'brick2', emoji: '🧱', x: 140, y: 72, size: 8, hidden: true },
    { id: 'bricks', emoji: 'hero:brick/march', x: 128, y: 71, size: 14, hidden: true },
    { id: 'small', emoji: '🪨', x: 16, y: 58, size: 6, hidden: true },
  ],
  moves: [
    // 花生頂著一疊石頭搖搖晃晃走進來
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.6, actor: 'raccoon', do: 'tilt', amount: 8, dur: 0.3 },
    // 敬禮——頭上的石頭全倒到後面
    { at: 0.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 0.8, actor: 'p1', do: 'pop', dur: 0.1 },
    { at: 0.8, actor: 'p2', do: 'pop', dur: 0.1 },
    { at: 0.8, actor: 'p3', do: 'pop', dur: 0.1 },
    { at: 0.85, actor: 'p1', do: 'moveTo', to: { x: 12, y: 72 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 0.9, actor: 'p2', do: 'moveTo', to: { x: 20, y: 72 }, arc: 10, dur: 0.45, ease: 'out' },
    { at: 0.95, actor: 'p3', do: 'moveTo', to: { x: 6, y: 72 }, arc: 6, dur: 0.45, ease: 'out' },
    { at: 1.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 積木小隊踏步進來，疊成一座塔
    { at: 0.3, actor: 'bricks', do: 'enter', from: { x: 175, y: 71 }, dur: 0.8, ease: 'out' },
    { at: 0.45, actor: 'brick2', do: 'enter', from: { x: 185, y: 72 }, dur: 0.8, ease: 'out' },
    { at: 1.2, actor: 'bricks', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 1.2, actor: 'bricks', do: 'squash', amount: 0.25, dur: 0.25 },
    // 拔河：兩邊越拉越往後倒，腳在沙上打滑
    { at: 1.7, actor: 'raccoon', do: 'rotateTo', amount: -18, dur: 0.5 },
    { at: 1.7, actor: 'bricks', do: 'rotateTo', amount: 20, dur: 0.5 },
    { at: 2.0, actor: 'raccoon', do: 'moveTo', to: { x: 40, y: 71 }, dur: 0.4 },
    { at: 2.4, actor: 'raccoon', do: 'moveTo', to: { x: 31, y: 71 }, dur: 0.4 },
    { at: 2.0, actor: 'bricks', do: 'moveTo', to: { x: 133, y: 71 }, dur: 0.4 },
    { at: 2.4, actor: 'bricks', do: 'moveTo', to: { x: 124, y: 71 }, dur: 0.4 },
    { at: 1.9, actor: 'rock', do: 'shake', amount: 1, dur: 1.6 },
    { at: 2.9, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 2.9, actor: 'bricks', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 2.9, actor: 'raccoon', do: 'tint', filter: 'saturate(1.6) hue-rotate(-10deg)' },
    // 啪！繩子彈開，兩邊往後飛、跌坐
    { at: 3.6, actor: 'raccoon', do: 'moveTo', to: { x: 14, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'raccoon', do: 'rotateTo', amount: 18, dur: 0.3 },
    { at: 3.6, actor: 'raccoon', do: 'tint', filter: '' },
    { at: 3.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.0, actor: 'raccoon', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.6, actor: 'bricks', do: 'moveTo', to: { x: 140, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'brick2', do: 'moveTo', to: { x: 152, y: 72 }, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'bricks', do: 'rotateTo', amount: -20, dur: 0.3 },
    { at: 3.75, actor: 'bricks', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.0, actor: 'bricks', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 3.75, actor: 'brick2', do: 'rotateTo', amount: 90, dur: 0.3 },
    // 大岩石一抖，碎成一塊一塊
    { at: 3.65, actor: 'rock', do: 'shake', amount: 2.5, dur: 0.35 },
    { at: 4.0, actor: 'rock', do: 'vanish', dur: 0.15 },
    // 花生坐起來，撿起一顆小石頭舉高——敬禮
    { at: 5.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 5.9, actor: 'raccoon', do: 'moveTo', to: { x: 16, y: 71 }, dur: 0.2 },
    { at: 6.05, actor: 'small', do: 'pop', dur: 0.3 },
    { at: 6.05, actor: 'p1', do: 'vanish', dur: 0.2 },
    { at: 6.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 6.8, actor: 'small', do: 'moveTo', to: { x: 16, y: 61 }, dur: 0.2, ease: 'bounce' },
    { at: 7.1, actor: 'small', do: 'tilt', amount: 18, dur: 0.6 },
    // 回馬槍：積木小隊爬起來重新疊成塔……又整隊歪倒
    { at: 7.8, actor: 'bricks', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 7.8, actor: 'bricks', do: 'hop', amount: 5, dur: 0.35 },
    { at: 8.3, actor: 'bricks', do: 'tilt', amount: -10, dur: 0.4 },
    { at: 8.7, actor: 'bricks', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 9.1, actor: 'bricks', do: 'rotateTo', amount: 85, dur: 0.35, ease: 'in' },
    { at: 9.45, actor: 'bricks', do: 'swap', emoji: 'hero:brick/dizzy' },
  ],
  builds: [
    // 三座尖尖的山峰往上彈 → 山；大平板、斜斜的一片、方方的空心塊 → 石
    { at: 4.0, dur: 0.45, strokes: [0, 1, 2], from: 'rock', color: '#5C6B7A' },
    { at: 4.35, dur: 0.75, strokes: [3, 4, 5, 6, 7], from: 'rock', color: '#46525E' },
  ],
  glyph: [{ at: 5.15, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'raccoon', emoji: '😳', dur: 0.5 },
    // 繩子：兩邊各拉一頭
    { at: 1.2, dur: 2.4, kind: 'line', actor: 'raccoon', target: 'rock', color: '#B07A3E', width: 1.2, dy: -3 },
    { at: 1.4, dur: 2.2, kind: 'line', actor: 'bricks', target: 'rock', color: '#B07A3E', width: 1.2, dy: -3 },
    { at: 2.0, kind: 'puff', actor: 'raccoon', dur: 0.5 },
    { at: 2.0, kind: 'puff', actor: 'bricks', dur: 0.5 },
    { at: 2.5, kind: 'sweat', actor: 'raccoon' },
    { at: 2.6, kind: 'pop', actor: 'bricks', emoji: '😣', dur: 0.6 },
    { at: 3.6, kind: 'burst', actor: 'rock', n: 1, dur: 0.4 },
    { at: 3.9, kind: 'puff', actor: 'raccoon', dur: 0.5 },
    { at: 3.9, kind: 'puff', actor: 'bricks', dur: 0.5 },
    { at: 4.0, kind: 'burst', actor: 'rock', emoji: '🪨', n: 6, dur: 0.5 },
    { at: 4.1, kind: 'dizzy', actor: 'raccoon', dur: 1.4 },
    { at: 4.1, kind: 'dizzy', actor: 'bricks', dur: 1.4 },
    { at: 6.85, kind: 'pop', actor: 'raccoon', emoji: '✨', dx: 4, dy: -4, dur: 0.6 },
    { at: 9.5, kind: 'dizzy', actor: 'bricks', dur: 0.5, dx: 6 },
  ],
  camera: [
    // 拔河拉到最緊：慢慢推近大岩石，啪一聲震一下、退回全景
    { at: 2.0, dur: 1.5, do: 'zoom', amount: 1.25, to: { x: 80, y: 58 } },
    { at: 3.6, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.62, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.85, sfx: 'clink' },
    { at: 1.3, say: '岩' },
    { at: 2.0, sfx: 'slide' },
    { at: 2.8, sfx: 'rumble' },
    { at: 3.6, sfx: 'boing' },
    { at: 4.0, sfx: 'crack' },
    { at: 4.1, sfx: 'bonk' },
    { at: 5.2, say: '岩' },
    { at: 6.05, sfx: 'tap' },
    { at: 6.85, say: '岩石' },
    { at: 9.1, sfx: 'slide' },
    { at: 9.45, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
