import type { Clip } from '../clip'

// 叫：農場早晨，小公雞要叫大家起床。第一聲太小聲，沒人理；第二聲牛只翻個身；第三聲牠把自己脹得超大，叫到太陽嚇得跳上天、
// 牛跳起來，叫聲變成「叫」——豬還在睡。鬧鐘掉下來響，豬終於醒了……打個哈欠，壓著鬧鐘繼續睡，公雞昏倒。叫、叫、叫醒
const clip: Clip = {
  char: '叫',
  meta: { theme: '農場早晨', cast: '公雞＋豬＋牛＋太陽', gags: ['越叫越大聲', '太陽嚇得跳上天', '豬怎樣都叫不醒', '壓著鬧鐘繼續睡'] },
  duration: 10,
  bg: { top: '#FFD7B5', bottom: '#FFF1D2', floor: '#A6CF73', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 14, y: 64, size: 14, hidden: true, float: true },
    { id: 'rooster', emoji: '🐓', x: 36, y: 70.7, size: 15, hidden: true },
    { id: 'alarm', emoji: '⏰', x: 110, y: 73.6, size: 8, hidden: true },
    { id: 'pig', emoji: '🐖', x: 124, y: 70.3, size: 16 },
    { id: 'cow', emoji: '🐄', x: 146, y: 70.3, size: 16 },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'enter', from: { x: 14, y: 80 }, dur: 1.0 },
    { at: 0, actor: 'rooster', do: 'enter', from: { x: -12, y: 70.7 }, dur: 0.6 },
    // 第一聲：好小聲
    { at: 1.0, actor: 'rooster', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 1.3, actor: 'rooster', do: 'squash', amount: 0.15, dur: 0.2 },
    // 第二聲：牛翻個身
    { at: 2.4, actor: 'rooster', do: 'squash', amount: -0.4, dur: 0.35 },
    { at: 2.75, actor: 'rooster', do: 'hop', amount: 4, dur: 0.25 },
    { at: 2.9, actor: 'cow', do: 'tilt', amount: 25, dur: 0.5 },
    // 第三聲：脹到超大
    { at: 3.6, actor: 'rooster', do: 'scaleTo', amount: 1.6, dur: 0.5 },
    { at: 3.6, actor: 'rooster', do: 'flash', dur: 0.6 },
    { at: 4.1, actor: 'rooster', do: 'squash', amount: -0.4, dur: 0.4 },
    { at: 4.5, actor: 'sun', do: 'moveTo', to: { x: 16, y: 14 }, dur: 0.5 },
    { at: 4.5, actor: 'sun', do: 'spin', dur: 0.5 },
    { at: 4.55, actor: 'cow', do: 'hop', amount: 10, dur: 0.4 },
    { at: 4.8, actor: 'rooster', do: 'scaleTo', amount: 0.625, dur: 0.3 },
    // 鬧鐘掉下來、響
    { at: 6.4, actor: 'alarm', do: 'drop', dur: 0.6 },
    { at: 7.0, actor: 'alarm', do: 'shake', amount: 1.5, dur: 0.9 },
    { at: 7.0, actor: 'alarm', do: 'flash', dur: 0.9 },
    { at: 7.35, actor: 'pig', do: 'hop', amount: 14, dur: 0.5 },
    // 打哈欠，壓著鬧鐘繼續睡
    { at: 8.5, actor: 'pig', do: 'moveTo', to: { x: 113, y: 70.3 }, dur: 0.3 },
    { at: 8.75, actor: 'alarm', do: 'scaleTo', amount: 0.5, dur: 0.2 },
    { at: 8.75, actor: 'pig', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 9.0, actor: 'rooster', do: 'rotateTo', amount: 90, dur: 0.3 },
    { at: 9.1, actor: 'cow', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
  ],
  builds: [
    // 超大叫聲從嘴巴噴出來
    { at: 4.6, dur: 0.6, strokes: [0, 1, 2], from: 'rooster', color: '#E2443A' },
    { at: 5.1, dur: 0.5, strokes: [3, 4], from: 'rooster', color: '#F2A516' },
  ],
  glyph: [{ at: 5.6, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'zzz', actor: 'pig', dur: 7.1 },
    { at: 0.4, kind: 'zzz', actor: 'cow', dur: 2.4 },
    { at: 1.3, kind: 'pop', actor: 'rooster', emoji: '🎵', dur: 0.5 },
    { at: 1.9, kind: 'bubble', actor: 'rooster', emoji: '😑', dur: 0.5 },
    { at: 2.75, kind: 'burst', actor: 'rooster', emoji: '🎶', n: 5, dur: 0.5 },
    { at: 3.1, kind: 'zzz', actor: 'cow', dur: 1.4 },
    { at: 3.3, kind: 'sweat', actor: 'rooster' },
    { at: 4.5, kind: 'burst', actor: 'rooster', emoji: '📢', dur: 0.6 },
    { at: 4.5, kind: 'burst', actor: 'rooster', emoji: '❗', n: 8, dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'cow', emoji: '❗', dur: 0.5 },
    { at: 5.9, kind: 'bubble', actor: 'rooster', emoji: '😤', dur: 0.6 },
    { at: 7.35, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
    { at: 8.0, kind: 'bubble', actor: 'pig', emoji: '🥱', dur: 0.5 },
    { at: 8.9, kind: 'zzz', actor: 'pig', dur: 1.1 },
    { at: 9.3, kind: 'dizzy', actor: 'rooster', dur: 0.7 },
    { at: 9.1, kind: 'pop', actor: 'cow', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 4.1, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 36, y: 60 } },
    { at: 4.5, dur: 0.6, do: 'shake', amount: 2.5 },
    { at: 6.0, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 124, y: 64 } },
  ],
  cues: [
    { at: 1.3, say: '叫' },
    { at: 2.75, sfx: 'blip' },
    { at: 4.5, sfx: 'rumble' },
    { at: 4.8, sfx: 'deflate' },
    { at: 5.65, say: '叫' },
    { at: 6.95, sfx: 'tap' },
    { at: 7.0, sfx: 'blip' },
    { at: 7.15, sfx: 'blip' },
    { at: 7.3, sfx: 'blip' },
    { at: 7.4, say: '叫醒' },
    { at: 8.75, sfx: 'plop' },
    { at: 9.1, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
