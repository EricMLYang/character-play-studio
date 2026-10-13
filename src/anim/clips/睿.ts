import type { Clip } from '../clip'
import { ride } from '../helpers'

// 睿（楊捷睿賽車手 第三集：決賽、當上隊長）：終點的獎盃前面擋著一顆大石頭。獵豹硬撞撞到頭昏，楊捷睿開車用力推也推不動。
// 他想一想——💡叫貓頭鷹教練放一塊滑板當跳台，連人帶車「咻」地飛過去！獵豹學他卻沒踩跳台，「碰」把石頭撞碎，碎片變成「睿」的上半部，
// 教練的大眼睛變成下面的「目」。獎盃落到楊捷睿手上，教練替他戴上博士帽；獵豹和教練向他敬禮——楊捷睿當上車隊隊長。睿、睿、睿智
const clip: Clip = {
  char: '睿',
  meta: { theme: '楊捷睿賽車手③決賽當隊長', cast: '楊捷睿＋賽車＋獵豹＋貓頭鷹教練＋大石頭＋獎盃', gags: ['硬撞撞到昏', '想一想用跳台飛過去', '模仿沒學到重點把石頭撞碎'] },
  duration: 10,
  bg: { top: '#FF9A6B', bottom: '#FFE0B8', floor: '#D9A066', scenery: 'desert' },
  actors: [
    { id: 'trophy', emoji: '🏆', x: 146, y: 32, size: 14, hidden: true, float: true },
    { id: 'rock', emoji: '🪨', x: 86, y: 65, size: 28, hidden: true },
    { id: 'ramp', emoji: '🛹', x: 62, y: 72, size: 14, hidden: true },
    { id: 'owl', emoji: '🦉', x: 10, y: 72, size: 12, hidden: true },
    { id: 'cheetah', emoji: '🐆', x: 44, y: 66, size: 20, hidden: true, flip: true },
    { id: 'car', emoji: '🏎️', x: 24, y: 70, size: 19, hidden: true, flip: true },
    { id: 'boy', emoji: '👦', x: 24, y: 67, size: 11, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'rock', do: 'pop' },
    { at: 0, actor: 'trophy', do: 'pop' },
    { at: 0.1, actor: 'owl', do: 'pop' },
    { at: 0.35, actor: 'cheetah', do: 'enter', from: { x: -20, y: 66 }, dur: 0.45 },
    { at: 1.0, actor: 'owl', do: 'hop', amount: 4, dur: 0.3 },
    // 獵豹硬撞石頭——撞到頭昏
    { at: 1.6, actor: 'cheetah', do: 'moveTo', to: { x: 66, y: 66 }, dur: 0.25 },
    { at: 1.85, actor: 'rock', do: 'shake', amount: 1, dur: 0.3 },
    { at: 1.9, actor: 'cheetah', do: 'moveTo', to: { x: 44, y: 66 }, dur: 0.35 },
    // 教練照他說的放滑板當跳台
    { at: 4.0, actor: 'owl', do: 'hop', amount: 5, dur: 0.3 },
    { at: 4.1, actor: 'ramp', do: 'pop' },
    { at: 4.2, actor: 'ramp', do: 'rotateTo', amount: 25, dur: 0.2 },
    { at: 5.2, actor: 'ramp', do: 'vanish', dur: 0.2 },
    ...ride([
      { at: 0.2, actor: 'car', do: 'enter', from: { x: -20, y: 70 }, dur: 0.4 },
      // 用力推——推不動
      { at: 2.6, actor: 'car', do: 'shake', amount: 1, dur: 0.3 },
      { at: 2.9, actor: 'car', do: 'moveTo', to: { x: 64, y: 70 }, dur: 0.3 },
      { at: 3.2, actor: 'car', do: 'shake', amount: 1.5, dur: 0.5 },
      { at: 3.7, actor: 'car', do: 'moveTo', to: { x: 26, y: 70 }, dur: 0.4 },
      // 衝上跳台，飛過石頭！
      { at: 4.4, actor: 'car', do: 'squash', amount: -0.3, dur: 0.25 },
      { at: 4.65, actor: 'car', do: 'moveTo', to: { x: 140, y: 70 }, arc: 34, dur: 0.7 },
      { at: 5.35, actor: 'car', do: 'squash', amount: 0.3, dur: 0.25 },
    ], 'boy', -3, 19),
    // 獵豹學他，卻沒踩跳台——直接撞碎石頭
    { at: 5.4, actor: 'cheetah', do: 'moveTo', to: { x: 70, y: 66 }, dur: 0.25 },
    { at: 5.65, actor: 'rock', do: 'vanish', dur: 0.15 },
    { at: 5.75, actor: 'cheetah', do: 'moveTo', to: { x: 36, y: 66 }, dur: 0.4 },
    // 睿智：獎盃落到他手上
    { at: 7.4, actor: 'trophy', do: 'moveTo', to: { x: 140, y: 53 }, dur: 0.4 },
    { at: 7.8, actor: 'boy', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.7, actor: 'owl', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    // 大家向隊長敬禮，一起跳
    { at: 8.5, actor: 'cheetah', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.6, actor: 'owl', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.15, actor: 'car', do: 'hop', amount: 4, dur: 0.35 },
    { at: 9.15, actor: 'boy', do: 'hop', amount: 4, dur: 0.35 },
    { at: 9.15, actor: 'trophy', do: 'hop', amount: 4, dur: 0.35 },
  ],
  builds: [
    // 撞碎的石頭 → 上半部；教練的大眼睛 → 目
    { at: 5.7, dur: 0.8, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8], from: { x: 86, y: 58 }, color: '#7048E8' },
    { at: 6.1, dur: 0.5, strokes: [9, 10, 11, 12, 13], from: 'owl', color: '#F59F00' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'trophy', emoji: '✨', dur: 0.6 },
    { at: 1.0, kind: 'bubble', actor: 'boy', emoji: '🏆', dur: 0.8 },
    { at: 1.85, kind: 'burst', x: 74, y: 56, emoji: '💥', n: 1, dur: 0.35 },
    { at: 2.2, kind: 'dizzy', actor: 'cheetah', dur: 0.9 },
    { at: 3.2, kind: 'sweat', actor: 'boy' },
    { at: 3.4, kind: 'puff', actor: 'car', dur: 0.4 },
    { at: 3.4, kind: 'bubble', actor: 'boy', emoji: '🤔', dur: 0.5 },
    { at: 3.95, kind: 'pop', actor: 'boy', emoji: '💡', dur: 0.5 },
    { at: 4.65, kind: 'burst', actor: 'car', emoji: '⭐', n: 5, dur: 0.6 },
    { at: 5.35, kind: 'puff', actor: 'car', dur: 0.4 },
    { at: 5.6, kind: 'burst', x: 86, y: 58, emoji: '💥', n: 1, dur: 0.35 },
    { at: 5.9, kind: 'dizzy', actor: 'cheetah', dur: 0.9 },
    { at: 7.7, kind: 'pop', actor: 'owl', emoji: '🎓', dur: 0.8 },
    { at: 8.5, kind: 'pop', actor: 'cheetah', emoji: '🫡', dur: 0.9 },
    { at: 8.6, kind: 'pop', actor: 'owl', emoji: '🫡', dur: 0.8 },
    { at: 8.7, kind: 'burst', actor: 'boy', emoji: '⭐', n: 5, dur: 0.6 },
    { at: 9.0, kind: 'burst', x: 18, y: 18, emoji: '🎉', n: 5, dur: 0.8 },
    { at: 9.2, kind: 'burst', x: 142, y: 18, emoji: '🎉', n: 5, dur: 0.8 },
  ],
  camera: [
    { at: 4.65, dur: 0.7, do: 'punch', amount: 0.12, to: { x: 90, y: 50 } },
    { at: 5.6, dur: 0.3, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.2, sfx: 'whoosh' },
    { at: 1.1, say: '睿' },
    { at: 1.85, sfx: 'bonk' },
    { at: 3.2, sfx: 'rumble' },
    { at: 3.95, sfx: 'blip' },
    { at: 4.65, sfx: 'whoosh' },
    { at: 5.35, sfx: 'boing' },
    { at: 5.6, sfx: 'crack' },
    { at: 6.7, say: '睿' },
    { at: 7.75, say: '睿智' },
    { at: 9.0, sfx: 'cheer' },
  ],
}

export default clip
