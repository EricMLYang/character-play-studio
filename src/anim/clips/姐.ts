import type { Clip } from '../clip'
import { ride } from '../helpers'

// 姐：拉布拉多警長要按一顆小小的門鈴，卻像短跑選手一樣蹲下蓄力、全速衝刺——直接衝過門鈴，一頭撞進一疊珊瑚紅長條，長條飛上天落成「姐」，只剩底下那一橫還在空中轉。
// 他冒煙倒滑回門鈴前，輕輕一點「叮」，最後一橫才掉下來。高一個頭的姐姐狗走進來扶好他；他用力一吹哨子敬禮，差點跌倒，又被姐姐扶住。姐、姐、姐姐
const clip: Clip = {
  char: '姐',
  meta: { theme: '按門鈴', cast: '拉布拉多警長＋姐姐狗＋門鈴＋長條', gags: ['小事用全力衝過頭', '撞飛整疊', '倒滑回來輕輕一點', '敬禮差點跌倒'] },
  duration: 10,
  bg: { top: '#FFF0BF', bottom: '#FFF8E1', floor: '#D9C9A3', scenery: 'city' },
  actors: [
    { id: 'stack', emoji: '🧱', x: 84, y: 70, size: 14, tint: 'saturate(1.3) hue-rotate(-10deg)' },
    { id: 'base', emoji: '🟥', x: 80, y: 9, size: 7, hidden: true, float: true },
    { id: 'bell', emoji: '🛎️', x: 40, y: 74, size: 7 },
    { id: 'sis', emoji: 'hero:sheriff/idle', x: 14, y: 69.5, size: 17, hidden: true, flip: true },
    { id: 'bow', emoji: '🎀', x: 14, y: 56, size: 6, hidden: true, float: true },
    { id: 'dog', emoji: 'hero:sheriff/idle', x: 28, y: 71, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 警長走進來，發現門鈴，一臉嚴肅地點頭
    { at: 0, actor: 'dog', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 0.7, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 0.95, actor: 'dog', do: 'tilt', amount: 12, dur: 0.3 },
    // 退到最左邊，像短跑選手一樣蹲下蓄力
    { at: 1.2, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 1.2, actor: 'dog', do: 'moveTo', to: { x: 12, y: 71 }, dur: 0.35 },
    { at: 1.6, actor: 'dog', do: 'squash', amount: -0.3, dur: 0.5 },
    { at: 1.6, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.5 },
    // 全速衝刺——衝過門鈴，一頭撞進長條堆
    { at: 2.15, actor: 'dog', do: 'moveTo', to: { x: 76, y: 71 }, dur: 0.35, anticipate: 4, ease: 'in' },
    { at: 2.5, actor: 'dog', do: 'squash', amount: 0.5, dur: 0.3 },
    { at: 2.5, actor: 'stack', do: 'moveTo', to: { x: 84, y: 24 }, dur: 0.45, ease: 'out' },
    { at: 2.5, actor: 'stack', do: 'spin', times: 1, dur: 0.5 },
    { at: 2.6, actor: 'base', do: 'pop', dur: 0.3 },
    { at: 2.6, actor: 'base', do: 'spin', times: 8, dur: 2.9, ease: 'linear' },
    { at: 3.3, actor: 'stack', do: 'vanish', dur: 0.3 },
    // 冒煙倒滑回門鈴前
    { at: 2.85, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 2.85, actor: 'dog', do: 'moveTo', to: { x: 30, y: 71 }, dur: 1.0, ease: 'out' },
    // 輕輕一點門鈴：叮
    { at: 4.9, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 5.15, actor: 'dog', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 5.3, actor: 'bell', do: 'squash', amount: 0.35, dur: 0.2 },
    { at: 5.5, actor: 'base', do: 'vanish', dur: 0.15 },
    // 姐姐走進來，摸摸他的頭
    ...ride([
      { at: 6.1, actor: 'sis', do: 'enter', from: { x: -18, y: 69.5 }, dur: 0.6, ease: 'out' },
      { at: 7.1, actor: 'sis', do: 'moveTo', to: { x: 18, y: 69.5 }, dur: 0.3 },
      { at: 8.75, actor: 'sis', do: 'moveTo', to: { x: 20, y: 69.5 }, dur: 0.2 },
    ], 'bow', -13.5, 17),
    { at: 6.7, actor: 'sis', do: 'tilt', amount: -8, dur: 0.4 },
    { at: 7.35, actor: 'dog', do: 'squash', amount: 0.2, dur: 0.25 },
    { at: 7.4, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 7.4, actor: 'sis', do: 'swap', emoji: 'hero:sheriff/happy' },
    // 回馬槍：又用全力——哨子吹太大聲，差點跌倒，姐姐一把扶住
    { at: 8.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 8.15, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 8.45, actor: 'dog', do: 'tilt', amount: 28, dur: 0.6 },
    { at: 8.5, actor: 'bell', do: 'hop', amount: 3, dur: 0.3 },
    { at: 9.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 9.2, actor: 'dog', do: 'bounce', amount: 2, times: 1, dur: 0.4 },
  ],
  builds: [
    // 撞飛的長條落下來：女、且（底下那一橫還在空中轉）
    { at: 3.3, dur: 0.6, strokes: [0, 1, 2], from: 'stack', color: '#FF6B6B' },
    { at: 3.6, dur: 0.8, strokes: [3, 4, 5, 6], from: 'stack', color: '#F76707' },
    // 輕輕一點門鈴，最後一橫才掉進來
    { at: 5.5, dur: 0.4, strokes: [7], from: 'base', color: '#F76707' },
  ],
  glyph: [{ at: 4.4, dur: 0.4, do: 'shake' }, { at: 5.9, dur: 0.4, do: 'wobble' }, { at: 8.5, dur: 0.4, do: 'shake' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.75, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.5 },
    { at: 1.65, kind: 'puff', actor: 'dog', dur: 0.5 },
    { at: 1.8, kind: 'pop', actor: 'dog', emoji: '😤', dur: 0.4 },
    { at: 2.5, kind: 'burst', actor: 'dog', n: 1, dx: 6, dur: 0.5 },
    { at: 3.0, kind: 'puff', actor: 'dog', dur: 0.5 },
    { at: 3.4, kind: 'puff', actor: 'dog', dur: 0.5 },
    { at: 3.9, kind: 'dizzy', actor: 'dog', dur: 1.0 },
    { at: 5.3, kind: 'pop', actor: 'bell', emoji: '🎵', dur: 0.6 },
    { at: 6.75, kind: 'pop', actor: 'sis', emoji: '😑', dur: 0.5 },
    { at: 7.4, kind: 'pop', actor: 'dog', emoji: '💕', dur: 0.6 },
    { at: 8.2, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.7 },
    { at: 8.6, kind: 'sweat', actor: 'dog' },
    { at: 9.0, kind: 'pop', actor: 'sis', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    { at: 1.6, dur: 0.5, do: 'zoom', amount: 1.3, actor: 'dog' },
    { at: 2.15, dur: 0.3, do: 'follow', actor: 'dog', amount: 1.3 },
    { at: 2.5, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 2.7, dur: 0.5, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.65, say: '姐' },
    { at: 2.15, sfx: 'whoosh' },
    { at: 2.5, sfx: 'bonk' },
    { at: 2.9, sfx: 'slide' },
    { at: 4.4, say: '姐' },
    { at: 5.3, sfx: 'clink' },
    { at: 6.3, say: '姐姐' },
    { at: 8.2, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
