import type { Clip } from '../clip'

// 肩（v8）：玩具機器人拍拍自己的護肩，跟酷炫車子約好「撞肩膀」對決。機器人馬達太強，衝過頭在右邊轉圈；車子往後拉「喀喀喀」彈出去，也衝過頭在左邊打轉。
// 兩個轉回中間想撞肩膀，卻「咚」地撞到頭——機器人的護肩飛上去變成「戶」，車頂的枕頭滑下來變成「月」。兩個坐在角落肩並肩握手，扭肩膀扭太大力又撞一下頭。肩、肩、肩並肩
const clip: Clip = {
  char: '肩',
  meta: { theme: '機器人和車子撞肩膀', cast: '玩具機器人＋酷炫車子', gags: ['衝過頭轉圈', '往後拉彈出去', '撞肩變撞頭', '扭肩膀又撞頭'] },
  duration: 10,
  bg: { top: '#FFF4DC', bottom: '#FFFBF0', floor: '#D9C2A0', scenery: 'track' },
  actors: [
    { id: 'robot', emoji: 'hero:robot/idle', x: 30, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'car', emoji: 'hero:car/idle', x: 130, y: 68.6, size: 20, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'robot', do: 'pop', dur: 0.3 },
    { at: 0.1, actor: 'car', do: 'enter', from: { x: 180, y: 68.6 }, dur: 0.5, ease: 'back' },
    // 拍拍護肩：拍、拍
    { at: 0.5, actor: 'robot', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 1.0, actor: 'robot', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 1.3, actor: 'robot', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 1.3, actor: 'car', do: 'shake', amount: 0.6, dur: 0.4 },
    // 機器人蓄力衝刺——車子跳起來，機器人從底下衝過頭
    { at: 1.7, actor: 'robot', do: 'squash', amount: -0.3, dur: 0.35 },
    { at: 2.05, actor: 'robot', do: 'moveTo', to: { x: 148, y: 70.7 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 2.2, actor: 'car', do: 'hop', amount: 16, dur: 0.4 },
    { at: 2.2, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 2.5, actor: 'robot', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.1, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 車子往後拉喀喀喀，彈出去也衝過頭
    { at: 2.8, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 2.8, actor: 'car', do: 'moveTo', to: { x: 138, y: 68.6 }, dur: 0.4, ease: 'linear' },
    { at: 3.25, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
    { at: 3.25, actor: 'car', do: 'moveTo', to: { x: 14, y: 68.6 }, dur: 0.45, ease: 'in' },
    { at: 3.7, actor: 'car', do: 'spin', times: 2, dur: 0.5 },
    { at: 4.15, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    // 轉回中間，面對面
    { at: 4.2, actor: 'car', do: 'flip' },
    { at: 4.2, actor: 'robot', do: 'flip' },
    { at: 4.25, actor: 'car', do: 'moveTo', to: { x: 69, y: 68.6 }, dur: 0.4 },
    { at: 4.25, actor: 'robot', do: 'moveTo', to: { x: 91, y: 70.7 }, dur: 0.4 },
    { at: 4.65, actor: 'car', do: 'swap', emoji: 'hero:car/idle' },
    { at: 4.65, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    // 定格一拍，同時歪身撞——撞到頭
    { at: 4.9, actor: 'car', do: 'tilt', amount: 10, dur: 0.2 },
    { at: 4.9, actor: 'robot', do: 'tilt', amount: -10, dur: 0.2 },
    { at: 5.05, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.05, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.25 },
    // 兩個一起被彈到左下角
    { at: 5.15, actor: 'car', do: 'swap', emoji: 'hero:car/dizzy' },
    { at: 5.15, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 5.15, actor: 'car', do: 'moveTo', to: { x: 13, y: 68.6 }, dur: 0.6, arc: 14, ease: 'out' },
    { at: 5.15, actor: 'robot', do: 'moveTo', to: { x: 42, y: 70.7 }, dur: 0.6, arc: 18, ease: 'out' },
    { at: 5.15, actor: 'robot', do: 'spin', times: 1, dur: 0.6 },
    { at: 5.75, actor: 'car', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 5.75, actor: 'robot', do: 'squash', amount: 0.25, dur: 0.25 },
    // 慢慢挪近，肩並肩
    { at: 6.6, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
    { at: 6.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 6.6, actor: 'car', do: 'moveTo', to: { x: 20, y: 68.6 }, dur: 0.6 },
    { at: 6.6, actor: 'robot', do: 'moveTo', to: { x: 37, y: 70.7 }, dur: 0.6 },
    { at: 7.3, actor: 'robot', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 7.3, actor: 'car', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
    // 一起扭肩膀：左、右、左——最後一下太大力又撞頭
    { at: 7.9, actor: 'car', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 7.9, actor: 'robot', do: 'tilt', amount: -8, dur: 0.3 },
    { at: 8.25, actor: 'car', do: 'tilt', amount: 8, dur: 0.3 },
    { at: 8.25, actor: 'robot', do: 'tilt', amount: 8, dur: 0.3 },
    { at: 8.6, actor: 'car', do: 'tilt', amount: 14, dur: 0.3 },
    { at: 8.6, actor: 'robot', do: 'tilt', amount: -14, dur: 0.3 },
    { at: 8.75, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 8.75, actor: 'car', do: 'swap', emoji: 'hero:car/surprised' },
    { at: 9.3, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    { at: 9.3, actor: 'car', do: 'swap', emoji: 'hero:car/happy' },
  ],
  builds: [
    // 機器人的護肩翻上去 → 戶；車頂的枕頭滑下來 → 月
    { at: 5.2, dur: 0.6, strokes: [0, 1, 2, 3], from: 'robot', color: '#1C4FA0' },
    { at: 5.6, dur: 0.6, strokes: [4, 5, 6, 7], from: 'car', color: '#2B6FD6' },
  ],
  glyph: [{ at: 6.25, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.3, kind: 'pop', actor: 'robot', emoji: '💪', dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'car', emoji: '❗', dur: 0.4 },
    { at: 2.05, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 2.6, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 3.1, kind: 'dizzy', actor: 'robot', dur: 0.9 },
    { at: 3.7, kind: 'puff', actor: 'car', dur: 0.5 },
    { at: 4.15, kind: 'sweat', actor: 'car' },
    { at: 5.05, kind: 'burst', x: 80, y: 60, n: 1, dur: 0.4 },
    { at: 5.75, kind: 'dizzy', actor: 'robot', dur: 0.8 },
    { at: 5.75, kind: 'dizzy', actor: 'car', dur: 0.8 },
    { at: 7.35, kind: 'pop', actor: 'robot', emoji: '🤝', dur: 0.6 },
    { at: 8.75, kind: 'pop', actor: 'robot', emoji: '⭐', dur: 0.5 },
  ],
  camera: [
    { at: 3.25, dur: 0.2, do: 'follow', actor: 'car', amount: 1.3 },
    { at: 3.75, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.9, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 80, y: 60 } },
  ],
  cues: [
    { at: 0.5, sfx: 'tap' },
    { at: 1.0, sfx: 'tap' },
    { at: 1.05, say: '肩' },
    { at: 2.05, sfx: 'whoosh' },
    { at: 2.5, sfx: 'slide' },
    { at: 2.85, sfx: 'clink' },
    { at: 3.0, sfx: 'clink' },
    { at: 3.15, sfx: 'clink' },
    { at: 3.25, sfx: 'whoosh' },
    { at: 3.7, sfx: 'slide' },
    { at: 5.05, sfx: 'bonk' },
    { at: 6.3, say: '肩' },
    { at: 7.3, say: '肩並肩' },
    { at: 8.75, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
