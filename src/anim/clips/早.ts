import type { Clip } from '../clip'

// 早：露營的早上，小貓在營火上煎蛋。第一次翻蛋小小一下，很帥；第二次翻太高差點接不到；第三次用力過猛，整個平底鍋飛上天，
// 在天上碎成「日」，營火的木柴跳出來變成「十」。小貓正難過，鍋子從天上掉回來，荷包蛋剛剛好——早餐！這時公雞才睡醒開始叫。早、早、早餐
const clip: Clip = {
  char: '早',
  meta: { theme: '露營煎蛋', cast: '小貓＋平底鍋＋營火＋貪睡公雞', gags: ['翻蛋越翻越高（漸強）', '鍋子飛上天變成太陽', '掉回來剛剛好', '公雞最晚起床'] },
  duration: 10,
  bg: { top: '#FFD9A8', bottom: '#FFF1D6', floor: '#7C9A55', scenery: 'forest' },
  actors: [
    { id: 'fire', emoji: '🔥', x: 34, y: 72.8, size: 10 },
    { id: 'pan', emoji: '🍳', x: 34, y: 65, size: 12.5, hidden: true, float: true },
    { id: 'cat', emoji: '🐱', x: 18, y: 70.2, size: 16.2, hidden: true },
    { id: 'rooster', emoji: '🐓', x: 140, y: 70.2, size: 16.2 },
  ],
  moves: [
    { at: 0, actor: 'cat', do: 'pop' },
    { at: 0.2, actor: 'pan', do: 'pop' },
    // 第一翻：小小一下
    { at: 1, actor: 'cat', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 1.1, actor: 'pan', do: 'hop', amount: 7, dur: 0.5 },
    { at: 1.1, actor: 'pan', do: 'spin', dur: 0.5 },
    { at: 1.63, actor: 'cat', do: 'bounce', amount: 2, times: 1, dur: 0.3 },
    // 第二翻：太高，差點接不到
    { at: 2.28, actor: 'cat', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 2.44, actor: 'pan', do: 'hop', amount: 22, dur: 0.85 },
    { at: 2.44, actor: 'pan', do: 'spin', times: 3, dur: 0.85 },
    { at: 3.25, actor: 'cat', do: 'moveTo', to: { x: 22, y: 70.2 }, dur: 0.15 },
    { at: 3.36, actor: 'pan', do: 'shake', amount: 2, dur: 0.4 },
    { at: 3.57, actor: 'cat', do: 'moveTo', to: { x: 18, y: 70.2 }, dur: 0.2 },
    // 第三翻：用力過猛，整個鍋子飛上天
    { at: 3.9, actor: 'cat', do: 'squash', amount: -0.45, dur: 0.3 },
    { at: 4.22, actor: 'pan', do: 'moveTo', to: { x: 80, y: 26 }, dur: 0.5 },
    { at: 4.22, actor: 'pan', do: 'spin', times: 4, dur: 0.5 },
    { at: 4.22, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.76, actor: 'pan', do: 'flash', dur: 0.5 },
    { at: 4.76, actor: 'pan', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 5.3, actor: 'pan', do: 'vanish', dur: 0.2 },
    { at: 5.6, actor: 'pan', do: 'moveTo', to: { x: 34, y: 65 }, dur: 0.01 },
    // 木柴跳起來
    { at: 5.8, actor: 'fire', do: 'hop', amount: 6, dur: 0.35 },
    // 小貓難過
    { at: 6.3, actor: 'cat', do: 'squash', amount: 0.2, dur: 0.5 },
    // 鍋子從天上掉回來，剛剛好
    { at: 6.9, actor: 'pan', do: 'drop', dur: 0.7 },
    { at: 7.55, actor: 'cat', do: 'hop', amount: 9, dur: 0.45 },
    // 公雞現在才睡醒開始叫
    { at: 8.31, actor: 'rooster', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 8.58, actor: 'rooster', do: 'hop', amount: 6, dur: 0.4 },
    { at: 8.58, actor: 'rooster', do: 'shake', amount: 1, dur: 0.6 },
    { at: 9.11, actor: 'cat', do: 'tilt', amount: -12, dur: 0.5 },
  ],
  builds: [
    // 天上碎掉的煎蛋 → 日；營火的木柴 → 十
    { at: 5.3, dur: 0.7, strokes: [0, 1, 2, 3], from: { x: 80, y: 26 }, color: '#F2A900' },
    { at: 5.8, dur: 0.5, strokes: [4, 5], from: 'fire', color: '#8B4A1F' },
  ],
  glyph: [{ at: 6.3, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'rooster', dur: 7.8 },
    { at: 0.5, kind: 'bubble', actor: 'cat', emoji: '🍳', dur: 0.6 },
    { at: 1.63, kind: 'pop', actor: 'cat', emoji: '😎', dur: 0.5 },
    { at: 3.3, kind: 'sweat', actor: 'cat' },
    { at: 4.33, kind: 'pop', actor: 'cat', emoji: '😱', dur: 0.7 },
    { at: 4.87, kind: 'burst', x: 80, y: 26, emoji: '✨', n: 8, dur: 0.6 },
    { at: 5.3, kind: 'burst', x: 80, y: 26, dur: 0.4 },
    { at: 5.8, kind: 'burst', actor: 'fire', emoji: '✨', n: 5, dur: 0.4 },
    { at: 6.3, kind: 'bubble', actor: 'cat', emoji: '😢', dur: 0.6 },
    { at: 7.5, kind: 'burst', actor: 'pan', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.69, kind: 'pop', actor: 'cat', emoji: '😋', dur: 0.6 },
    { at: 8.58, kind: 'zzz', actor: 'rooster', emoji: '🎵', dur: 1.2 },
    { at: 9.11, kind: 'bubble', actor: 'cat', emoji: '😑', dur: 0.9 },
  ],
  camera: [
    { at: 4.65, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 80, y: 30 } },
    { at: 7.5, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.1, sfx: 'whoosh' },
    { at: 1.63, sfx: 'plop' },
    { at: 1.69, say: '早' },
    { at: 2.44, sfx: 'whoosh' },
    { at: 3.36, sfx: 'clink' },
    { at: 4.22, sfx: 'whoosh' },
    { at: 5.3, sfx: 'crack' },
    { at: 6.35, say: '早' },
    { at: 7.5, sfx: 'clink' },
    { at: 7.6, say: '早餐' },
    { at: 8.58, sfx: 'boing' },
    { at: 9.64, sfx: 'cheer' },
  ],
}

export default clip
