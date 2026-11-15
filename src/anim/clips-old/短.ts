import type { Clip } from '../clip'
import { ride } from '../helpers'

// 短：布忍者想躲在一排由高到矮的藍色板子後面，先蹲到最矮那塊後面——整顆頭露在外面；改躲最高那塊，
// 煙霧彈引線太短「噗」提早爆開，他嚇得跳起來屁股撞倒第一塊，整排像骨牌越倒越快追著他跑，倒下的板子翻成「短」，
// 最後那塊小板子像跳板把他彈過國字。唸「短短」時他得意地拔出寶劍——只有手指那麼短；最後還想躲在這把小刀後面。短、短、短短
const BAR = (id: string, size: number, x: number) => ({ id, emoji: '🟦', x, y: 77 - 0.42 * size, size })
const clip: Clip = {
  char: '短',
  meta: { theme: '忍者躲貓貓', cast: '布忍者＋一排由高到矮的板子＋煙霧彈', gags: ['躲在太矮的板子後面', '引線太短提早爆', '骨牌追著跑', '跳板彈飛', '寶劍好短'] },
  duration: 10,
  bg: { top: '#FFF9DB', bottom: '#FFF3BF', floor: '#D3F9D8', scenery: 'forest' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 84, y: 71.5, size: 13, hidden: true, flip: true },
    { id: 'bomb', emoji: '💣', x: 84, y: 73.5, size: 5, hidden: true },
    BAR('b1', 16, 22),
    BAR('b2', 14, 36),
    BAR('b3', 12, 49),
    BAR('b4', 10, 61),
    BAR('b5', 8, 71),
    BAR('b6', 6, 98),
    { id: 'blade', emoji: '🗡️', x: 133, y: 66, size: 4.5, hidden: true },
  ],
  moves: [
    ...ride([
      { at: 0, actor: 'ninja', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.8 },
      { at: 0, actor: 'ninja', do: 'bounce', times: 4, amount: 1.5, dur: 0.8 },
      // 蹲到最矮那塊後面（整顆頭露出來）
      { at: 1.0, actor: 'ninja', do: 'squash', amount: 0.15, dur: 0.3 },
      // 改躲最高那塊
      { at: 1.85, actor: 'ninja', do: 'flip' },
      { at: 1.9, actor: 'ninja', do: 'moveTo', to: { x: 22, y: 71.5 }, dur: 0.45, ease: 'out' },
      { at: 2.35, actor: 'ninja', do: 'moveTo', to: { x: 29, y: 71.5 }, dur: 0.2 },
    ], 'bomb', 2, 13),
    { at: 0.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 2.35, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    // 噗！引線太短，提早爆開
    { at: 2.7, actor: 'bomb', do: 'vanish', dur: 0.1 },
    { at: 2.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 2.7, actor: 'ninja', do: 'hop', amount: 10, dur: 0.35 },
    // 屁股撞倒第一塊，骨牌越倒越快，追著他跑
    { at: 2.95, actor: 'b1', do: 'rotateTo', amount: 78, dur: 0.3, ease: 'in' },
    { at: 3.15, actor: 'b2', do: 'rotateTo', amount: 78, dur: 0.25, ease: 'in' },
    { at: 3.32, actor: 'b3', do: 'rotateTo', amount: 78, dur: 0.22, ease: 'in' },
    { at: 3.46, actor: 'b4', do: 'rotateTo', amount: 78, dur: 0.2, ease: 'in' },
    { at: 3.57, actor: 'b5', do: 'rotateTo', amount: 78, dur: 0.18, ease: 'in' },
    { at: 3.05, actor: 'ninja', do: 'flip' },
    { at: 3.05, actor: 'ninja', do: 'moveTo', to: { x: 98, y: 65.5 }, dur: 0.65, ease: 'in' },
    { at: 3.62, actor: 'b1', do: 'vanish', dur: 0.15 },
    { at: 3.62, actor: 'b2', do: 'vanish', dur: 0.15 },
    { at: 3.62, actor: 'b3', do: 'vanish', dur: 0.15 },
    { at: 3.95, actor: 'b4', do: 'vanish', dur: 0.15 },
    { at: 3.95, actor: 'b5', do: 'vanish', dur: 0.15 },
    // 站在最後一塊小板子上；它一翻——像跳板把他彈過去
    { at: 3.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 4.2, actor: 'ninja', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 4.5, actor: 'b6', do: 'rotateTo', amount: -70, dur: 0.12 },
    { at: 4.52, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 4.52, actor: 'ninja', do: 'moveTo', to: { x: 140, y: 71.5 }, arc: 52, dur: 0.7, ease: 'linear' },
    { at: 4.52, actor: 'ninja', do: 'spin', times: 1, dur: 0.7 },
    { at: 4.8, actor: 'b6', do: 'vanish', dur: 0.2 },
    { at: 5.22, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 5.22, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 5.3, actor: 'ninja', do: 'flip' },
    { at: 5.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    // 「短短」：拔出寶劍——只有手指那麼短
    { at: 6.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 6.65, actor: 'blade', do: 'pop', dur: 0.3 },
    { at: 7.0, actor: 'blade', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 7.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    // 回馬槍：又想躲——躲在這把小刀後面
    { at: 8.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.2, actor: 'blade', do: 'moveTo', to: { x: 138, y: 63 }, dur: 0.25 },
    { at: 8.25, actor: 'ninja', do: 'squash', amount: 0.15, dur: 0.3 },
    { at: 9.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 9.0, actor: 'ninja', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 左邊倒下的板子 → 矢；右邊的 → 豆
    { at: 3.55, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'b2', color: '#3B5BDB' },
    { at: 3.9, dur: 0.8, strokes: [5, 6, 7, 8, 9, 10, 11], from: 'b5', color: '#3B5BDB' },
  ],
  glyph: [{ at: 4.75, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'bomb', emoji: '✨', dy: -1, dur: 2.4 },
    { at: 1.2, kind: 'pop', actor: 'ninja', emoji: '😎', dur: 0.5 },
    { at: 1.75, kind: 'pop', actor: 'ninja', emoji: '😑', dur: 0.4 },
    { at: 2.7, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dy: 10, dur: 0.6 },
    { at: 3.1, kind: 'sweat', actor: 'ninja' },
    { at: 5.3, kind: 'dizzy', actor: 'ninja', dur: 0.7 },
    { at: 5.95, kind: 'pop', actor: 'ninja', emoji: '👍', dx: -6, dur: 0.6 },
    { at: 6.2, kind: 'bubble', actor: 'ninja', emoji: '⚔️', dur: 0.5 },
    { at: 7.3, kind: 'puff', actor: 'ninja', dur: 0.5 },
    { at: 7.1, kind: 'pop', actor: 'ninja', emoji: '😳', dur: 0.5 },
    { at: 8.5, kind: 'pop', actor: 'ninja', emoji: '😎', dur: 0.5 },
    { at: 9.0, kind: 'burst', actor: 'ninja', emoji: '💨', n: 5, dy: 6, dur: 0.6 },
  ],
  camera: [
    // 躲在矮板子後面推近看露出來的頭，骨牌倒的時候跟拍他逃
    { at: 1.0, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 86, y: 62 } },
    { at: 3.05, dur: 0.3, do: 'follow', actor: 'ninja', amount: 1.25 },
    { at: 3.75, dur: 0.3, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.2, say: '短' },
    { at: 2.7, sfx: 'poof' },
    { at: 2.95, sfx: 'bonk' },
    { at: 3.2, sfx: 'tap' },
    { at: 3.38, sfx: 'tap' },
    { at: 3.52, sfx: 'tap' },
    { at: 3.63, sfx: 'tap' },
    { at: 4.5, sfx: 'boing' },
    { at: 4.78, say: '短' },
    { at: 5.22, sfx: 'plop' },
    { at: 6.68, say: '短短' },
    { at: 7.3, sfx: 'poof' },
    { at: 9.0, sfx: 'poof' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
