import type { Clip } from '../clip'
import { ride } from '../helpers'

// 可（v8）：消防小隊開著消防車、大怪獸舉著方形泡棉圈，面對面友善對決。水管不聽話往後噴，噴得消防車自己滿臉水還轉一圈；
// 怪獸大力揮圈揮空也轉一圈。兩個頭昏昏撞在一起「咚」——水管飛起來變成上橫和右邊的豎鉤，方圈落在左下變成「口」。大家比讚說可以，結果水管又噴自己一次。可、可、可以
const clip: Clip = {
  char: '可',
  meta: { theme: '消防車對決大怪獸', cast: '消防小隊＋消防車＋大怪獸＋方形泡棉圈', gags: ['水管往後噴自己', '揮空轉圈', '撞頭坐倒', '比讚又被噴'] },
  duration: 10,
  bg: { top: '#CDE8FF', bottom: '#EEF7FF', floor: '#B8C4CE', scenery: 'city' },
  actors: [
    { id: 'monster', emoji: 'hero:monster/idle', x: 126, y: 70.3, size: 16, hidden: true },
    { id: 'ring', emoji: '🟥', x: 117, y: 63, size: 8, hidden: true },
    { id: 'engine', emoji: '🚒', x: 34, y: 67.8, size: 22, hidden: true, flip: true },
    { id: 'ff', emoji: 'hero:firefighter/idle', x: 34, y: 57.8, size: 12, hidden: true, flip: true },
  ],
  moves: [
    { at: 0.1, actor: 'monster', do: 'enter', from: { x: 180, y: 70.3 }, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'ring', do: 'enter', from: { x: 171, y: 63 }, dur: 0.6, ease: 'out' },
    // 舉起道具，大大的預備動作
    { at: 0.9, actor: 'monster', do: 'squash', amount: -0.25, dur: 0.5 },
    { at: 0.9, actor: 'ring', do: 'moveTo', to: { x: 126, y: 54 }, dur: 0.4, ease: 'back' },
    // 怪獸大力揮圈——揮空，自己轉一圈
    { at: 2.05, actor: 'monster', do: 'spin', times: 1, dur: 0.6 },
    { at: 2.05, actor: 'ring', do: 'moveTo', to: { x: 104, y: 62 }, dur: 0.3, arc: 6 },
    { at: 2.35, actor: 'ring', do: 'moveTo', to: { x: 126, y: 54 }, dur: 0.3, arc: 6 },
    { at: 2.7, actor: 'monster', do: 'swap', emoji: 'hero:monster/oops' },
    // 頭昏昏走到中間
    { at: 3.2, actor: 'monster', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 3.2, actor: 'monster', do: 'moveTo', to: { x: 93, y: 70.3 }, dur: 0.55 },
    { at: 3.2, actor: 'ring', do: 'moveTo', to: { x: 93, y: 54 }, dur: 0.55 },
    // 咚！彈開坐倒
    { at: 3.8, actor: 'monster', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 3.85, actor: 'monster', do: 'moveTo', to: { x: 132, y: 70.3 }, dur: 0.5, arc: 6, ease: 'out' },
    { at: 3.9, actor: 'ring', do: 'moveTo', to: { x: 70, y: 40 }, dur: 0.35, arc: 10 },
    { at: 3.9, actor: 'ring', do: 'spin', times: 2, dur: 0.35 },
    { at: 4.3, actor: 'ring', do: 'vanish', dur: 0.1 },
    { at: 4.35, actor: 'monster', do: 'squash', amount: 0.3, dur: 0.3 },
    // 可以！
    { at: 6.1, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 6.3, actor: 'monster', do: 'hop', amount: 4, dur: 0.35 },
    { at: 6.7, actor: 'monster', do: 'tilt', amount: -12, dur: 0.4 },
    // 回馬槍：怪獸笑到彎腰
    { at: 8.4, actor: 'monster', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 8.4, actor: 'monster', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
    { at: 9.3, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    ...ride([
      { at: 0.1, actor: 'engine', do: 'enter', from: { x: -25, y: 67.8 }, dur: 0.6, ease: 'out' },
      // 水管往後噴，被後座力轉一圈
      { at: 1.95, actor: 'engine', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 2.15, actor: 'engine', do: 'spin', times: 1, dur: 0.6 },
      // 頭昏昏開到中間
      { at: 3.2, actor: 'engine', do: 'moveTo', to: { x: 63, y: 67.8 }, dur: 0.55 },
      { at: 3.8, actor: 'engine', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 3.85, actor: 'engine', do: 'moveTo', to: { x: 26, y: 67.8 }, dur: 0.5, arc: 6, ease: 'out' },
      { at: 4.35, actor: 'engine', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: 9.0, actor: 'engine', do: 'shake', amount: 0.6, dur: 0.5 },
    ], 'ff', -10, 22),
    { at: 0.9, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 2.0, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 3.2, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    { at: 6.1, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.3, actor: 'ff', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.9, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 8.3, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 9.3, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
  ],
  builds: [
    // 水管飛起來僵直：上橫＋右邊的豎鉤；方圈落在左下：口
    { at: 4.2, dur: 0.6, strokes: [0, 4], from: 'ff', color: '#E03131' },
    { at: 4.6, dur: 0.6, strokes: [1, 2, 3], from: { x: 70, y: 40 }, color: '#C92A2A' },
  ],
  glyph: [{ at: 5.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.95, kind: 'fountain', actor: 'ff', emoji: '💧', dur: 0.7 },
    { at: 2.3, kind: 'sweat', actor: 'ff' },
    { at: 2.7, kind: 'pop', actor: 'monster', emoji: '😅', dur: 0.5 },
    { at: 3.8, kind: 'burst', x: 78, y: 58, n: 1, dur: 0.4 },
    { at: 4.35, kind: 'dizzy', actor: 'monster', dur: 1.2 },
    { at: 4.35, kind: 'dizzy', actor: 'ff', dur: 1.2 },
    { at: 6.4, kind: 'pop', actor: 'ff', emoji: '👍', dur: 0.8 },
    { at: 6.4, kind: 'pop', actor: 'monster', emoji: '👍', dur: 0.8 },
    { at: 8.0, kind: 'fountain', actor: 'ff', emoji: '💧', dur: 0.7 },
    { at: 8.5, kind: 'pop', actor: 'monster', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 3.8, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 78, y: 58 } },
    { at: 3.8, dur: 0.3, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.9, sfx: 'whoosh' },
    { at: 1.3, say: '可' },
    { at: 1.95, sfx: 'splash' },
    { at: 2.1, sfx: 'whoosh' },
    { at: 3.8, sfx: 'bonk' },
    { at: 4.35, sfx: 'plop' },
    { at: 5.3, say: '可' },
    { at: 6.4, say: '可以' },
    { at: 8.0, sfx: 'splash' },
    { at: 9.0, sfx: 'blip' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
