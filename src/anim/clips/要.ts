import type { Clip } from '../clip'

// 要：積木小隊想要架子上的大餅乾，疊成高塔伸手去拿，小老鼠溜下來戳一下，整座塔慢慢倒下去「碰」——縮成一顆方塊球滿場亂彈，
// 地板、牆壁、天花板、小老鼠的頭，每撞一下就敲出一筆，拼成「要」。積木拍拍胸口伸手說「我要」，小老鼠把餅乾推下來，結果自己也跟著掉下架子。要、要、我要
const clip: Clip = {
  char: '要',
  meta: { theme: '想要大餅乾', cast: '積木小隊＋小老鼠＋大餅乾', gags: ['疊高塔被一戳就倒', '方塊球滿場彈跳敲出筆畫', '推餅乾自己也掉下來'] },
  duration: 10,
  bg: { top: '#FFF3BF', bottom: '#FFFBE6', floor: '#E9C46A', scenery: 'room' },
  actors: [
    { id: 'shelf', emoji: '🪵', x: 142, y: 31, size: 16, float: true },
    { id: 'cookie', emoji: '🍪', x: 140, y: 22, size: 11, float: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 152, y: 20, size: 10, hidden: true, float: true },
    { id: 'squad', emoji: 'hero:brick/march', x: 36, y: 71, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 整隊踏步進場，喀一聲停下，一起抬頭看餅乾
    { at: 0, actor: 'squad', do: 'enter', from: { x: -15, y: 71 }, dur: 0.9, ease: 'linear' },
    { at: 0, actor: 'squad', do: 'bounce', amount: 2, times: 4, dur: 0.9 },
    { at: 0.95, actor: 'squad', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 1.1, actor: 'squad', do: 'tilt', amount: -10, dur: 0.5 },
    { at: 1.2, actor: 'mouse', do: 'pop', dur: 0.3 },
    { at: 1.5, actor: 'cookie', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 1.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 衝到架子下面，疊成高塔伸手
    { at: 1.7, actor: 'squad', do: 'moveTo', to: { x: 132, y: 71 }, dur: 0.5, anticipate: 3, ease: 'in' },
    { at: 2.2, actor: 'squad', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 2.2, actor: 'squad', do: 'scaleTo', amount: 1.7, dur: 0.3, ease: 'back' },
    { at: 2.6, actor: 'squad', do: 'tilt', amount: -8, dur: 0.5 },
    { at: 3.1, actor: 'squad', do: 'tilt', amount: 8, dur: 0.5 },
    // 小老鼠咻地溜下來戳一下，再咻地回去
    { at: 3.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 3.25, actor: 'mouse', do: 'moveTo', to: { x: 150, y: 72 }, dur: 0.2, ease: 'in' },
    { at: 3.55, actor: 'squad', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 3.6, actor: 'mouse', do: 'moveTo', to: { x: 152, y: 20 }, dur: 0.2, ease: 'out' },
    { at: 3.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 停半拍——慢慢倒下去，碰！
    { at: 3.8, actor: 'squad', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.1, actor: 'squad', do: 'rotateTo', amount: -85, dur: 0.45, ease: 'in' },
    // 縮成一顆方塊球，滿場亂彈
    { at: 4.6, actor: 'squad', do: 'rotateTo', amount: 85, dur: 0.1 },
    { at: 4.6, actor: 'squad', do: 'scaleTo', amount: 0.42, dur: 0.1 },
    { at: 4.6, actor: 'squad', do: 'moveTo', to: { x: 110, y: 72 }, dur: 0.1 },
    { at: 4.7, actor: 'squad', do: 'moveTo', to: { x: 8, y: 44 }, dur: 0.35, ease: 'linear' },
    { at: 5.05, actor: 'squad', do: 'moveTo', to: { x: 64, y: 6 }, dur: 0.3, ease: 'linear' },
    { at: 5.35, actor: 'squad', do: 'moveTo', to: { x: 151, y: 13 }, dur: 0.3, ease: 'linear' },
    { at: 5.65, actor: 'squad', do: 'moveTo', to: { x: 34, y: 72 }, dur: 0.5, arc: 10, ease: 'out' },
    { at: 4.7, actor: 'squad', do: 'spin', times: 4, dur: 1.45 },
    { at: 5.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 5.65, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.2 },
    // 恢復成積木小隊，拍胸口伸手：我要
    { at: 6.2, actor: 'squad', do: 'scaleTo', amount: 1.4, dur: 0.25, ease: 'back' },
    { at: 6.2, actor: 'squad', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 6.25, actor: 'squad', do: 'moveTo', to: { x: 34, y: 71 }, dur: 0.1 },
    { at: 7.3, actor: 'squad', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.55, actor: 'squad', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 7.55, actor: 'squad', do: 'hop', amount: 3, dur: 0.3 },
    // 小老鼠被逗笑，把餅乾推下去給他們
    { at: 7.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 7.9, actor: 'cookie', do: 'moveTo', to: { x: 34, y: 58 }, dur: 0.7, arc: 22 },
    { at: 7.9, actor: 'cookie', do: 'spin', times: 2, dur: 0.7 },
    { at: 8.6, actor: 'squad', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.85, actor: 'squad', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    { at: 8.85, actor: 'cookie', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 回馬槍：小老鼠推太大力，自己也掉下架子
    { at: 8.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 8.4, actor: 'mouse', do: 'moveTo', to: { x: 146, y: 73 }, dur: 0.45, ease: 'bounce' },
    { at: 8.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
  ],
  builds: [
    // 每撞一下敲出一筆：地板、牆壁、天花板、小老鼠的頭、地板
    { at: 4.6, dur: 0.15, strokes: [0], from: { x: 110, y: 72 }, color: '#E8590C' },
    { at: 5.05, dur: 0.25, strokes: [1, 2], from: { x: 8, y: 44 }, color: '#E8590C' },
    { at: 5.35, dur: 0.25, strokes: [3, 4, 5], from: { x: 64, y: 6 }, color: '#E8590C' },
    { at: 5.65, dur: 0.2, strokes: [6], from: { x: 151, y: 13 }, color: '#D9480F' },
    { at: 6.1, dur: 0.25, strokes: [7, 8], from: { x: 34, y: 72 }, color: '#D9480F' },
  ],
  glyph: [{ at: 6.45, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'bubble', actor: 'squad', emoji: '🍪', dur: 0.7 },
    { at: 1.6, kind: 'pop', actor: 'mouse', emoji: '😛', dx: -6, dur: 0.5 },
    { at: 2.3, kind: 'pop', actor: 'squad', emoji: '🙌', dy: -8, dur: 0.5 },
    { at: 3.4, kind: 'pop', actor: 'mouse', emoji: '👉', dx: -5, dur: 0.3 },
    { at: 3.8, kind: 'sweat', actor: 'squad' },
    { at: 4.55, kind: 'burst', x: 104, y: 70, n: 1, dur: 0.35 },
    { at: 4.6, kind: 'puff', actor: 'squad', dur: 0.4 },
    { at: 5.7, kind: 'dizzy', actor: 'mouse', dx: -6, dy: 5, dur: 1.2 },
    { at: 7.3, kind: 'pop', actor: 'squad', emoji: '🙋', dy: -2, dur: 0.6 },
    { at: 8.6, kind: 'burst', actor: 'squad', emoji: '✨', n: 5, dur: 0.6 },
    { at: 8.9, kind: 'dizzy', actor: 'mouse', dur: 1.0 },
  ],
  camera: [
    { at: 2.2, dur: 0.8, do: 'zoom', amount: 1.35, to: { x: 132, y: 45 } },
    { at: 4.1, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.55, dur: 0.3, do: 'shake', amount: 0.8 },
  ],
  cues: [
    { at: 0.95, sfx: 'tap' },
    { at: 2.4, say: '要' },
    { at: 3.4, sfx: 'tap' },
    { at: 4.55, sfx: 'bonk' },
    { at: 5.05, sfx: 'clink' },
    { at: 5.35, sfx: 'clink' },
    { at: 5.65, sfx: 'boing' },
    { at: 6.1, sfx: 'clink' },
    { at: 6.5, say: '要' },
    { at: 7.3, say: '我要' },
    { at: 8.6, sfx: 'plop' },
    { at: 8.85, sfx: 'bonk' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
