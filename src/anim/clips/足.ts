import type { Clip } from '../clip'
import { ride } from '../helpers'

// 足：消防員只想把小足球輕輕推一下，卻把水管轉到最大——反衝力把整台消防車推得衝過頭、「咚」地撞上球門，他自己被甩飛到球旁邊；
// 震飛的紅梯子散成橫桿拼成「足」，他改用小靴子輕輕一踢，球乖乖滾進球門。最後他開心噴水慶祝，又被反衝力推進球門裡。足、足、足球
const clip: Clip = {
  char: '足',
  meta: { theme: '消防車踢足球', cast: '消防員＋消防車＋足球＋梯子', gags: ['力氣太大衝過頭撞球門', '被甩飛', '輕輕一踢就進', '噴水反衝自己進球門'] },
  duration: 10,
  bg: { top: '#FFF6E6', bottom: '#FFEFD6', floor: '#E9D3B0', scenery: 'room' },
  actors: [
    { id: 'goal', emoji: '🥅', x: 147, y: 69, size: 17 },
    { id: 'ball', emoji: '⚽', x: 124, y: 74, size: 7 },
    { id: 'engine', emoji: '🚒', x: 24, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'ff', emoji: 'hero:firefighter/idle', x: 24, y: 59.6, size: 12, hidden: true, flip: true },
    { id: 'ladder', emoji: '🪜', x: 128, y: 52, size: 10, hidden: true, float: true },
  ],
  moves: [
    ...ride([
      { at: 0, actor: 'engine', do: 'enter', from: { x: -25, y: 68.6 }, dur: 0.6, ease: 'out' },
      // 轉幫浦三下，一下比一下用力
      { at: 0.9, actor: 'engine', do: 'shake', amount: 0.6, dur: 0.25 },
      { at: 1.25, actor: 'engine', do: 'shake', amount: 1.1, dur: 0.3 },
      { at: 1.6, actor: 'engine', do: 'shake', amount: 1.8, dur: 0.3 },
      { at: 1.85, actor: 'engine', do: 'squash', amount: -0.25, dur: 0.2 },
      // 水管開到最大——反衝力一路衝過頭
      { at: 2.0, actor: 'engine', do: 'moveTo', to: { x: 128, y: 68.6 }, dur: 0.45, anticipate: 4, ease: 'in' },
    ], 'ff', -9, 20),
    { at: 0.9, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 2.15, actor: 'ball', do: 'shake', amount: 0.8, dur: 0.4 },
    // 咚！撞上球門
    { at: 2.45, actor: 'engine', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 2.45, actor: 'goal', do: 'shake', amount: 1.5, dur: 0.5 },
    // 消防員被甩飛，掉在足球旁邊
    { at: 2.45, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 2.45, actor: 'ff', do: 'moveTo', to: { x: 126, y: 30 }, dur: 0.35, ease: 'out' },
    { at: 2.45, actor: 'ff', do: 'spin', times: 2, dur: 0.75 },
    { at: 2.8, actor: 'ff', do: 'moveTo', to: { x: 114, y: 72 }, dur: 0.5, ease: 'bounce' },
    { at: 3.0, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/dizzy' },
    // 車子冒煙滑回左下角
    { at: 2.75, actor: 'engine', do: 'moveTo', to: { x: 22, y: 68.6 }, dur: 0.8, ease: 'out' },
    { at: 3.6, actor: 'engine', do: 'tilt', amount: -8, dur: 0.4 },
    // 梯子震飛到空中，散成橫桿
    { at: 2.5, actor: 'ladder', do: 'pop', dur: 0.2 },
    { at: 2.6, actor: 'ladder', do: 'moveTo', to: { x: 80, y: 8 }, dur: 0.75, ease: 'out', arc: 6 },
    { at: 2.6, actor: 'ladder', do: 'spin', times: 2, dur: 0.75 },
    { at: 4.95, actor: 'ladder', do: 'vanish', dur: 0.25 },
    // 輕輕一踢，球滾進球門
    { at: 4.6, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/idle' },
    { at: 5.7, actor: 'ff', do: 'hop', amount: 2, dur: 0.25 },
    { at: 5.95, actor: 'ff', do: 'squash', amount: -0.2, dur: 0.2 },
    { at: 6.1, actor: 'ball', do: 'moveTo', to: { x: 146, y: 74 }, dur: 0.7, ease: 'out' },
    { at: 6.1, actor: 'ball', do: 'spin', times: 2, dur: 0.7 },
    { at: 6.8, actor: 'goal', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 6.6, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    { at: 6.6, actor: 'ff', do: 'hop', amount: 5, dur: 0.35 },
    // 回馬槍：轉身噴水慶祝，反衝力把自己推進球門
    { at: 7.3, actor: 'ff', do: 'flip' },
    { at: 7.4, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/hose' },
    { at: 7.6, actor: 'ff', do: 'moveTo', to: { x: 141, y: 72 }, dur: 0.4, ease: 'out' },
    { at: 8.0, actor: 'goal', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 8.0, actor: 'ff', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.1, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/surprised' },
    { at: 8.8, actor: 'ff', do: 'swap', emoji: 'hero:firefighter/happy' },
    // 車子扭一扭擦輪胎
    { at: 8.4, actor: 'engine', do: 'shake', amount: 1, dur: 0.5 },
    { at: 8.4, actor: 'engine', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 梯子橫桿掉下來：上面的口，再來下面四筆
    { at: 3.4, dur: 0.8, strokes: [0, 1, 2], from: 'ladder', color: '#E03131' },
    { at: 4.2, dur: 0.9, strokes: [3, 4, 5, 6], from: 'ladder', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.1, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.4, kind: 'bubble', actor: 'ff', emoji: '⚽', dur: 0.8 },
    { at: 1.6, kind: 'pop', actor: 'engine', emoji: '😳', dur: 0.5 },
    { at: 2.0, kind: 'burst', actor: 'engine', emoji: '💦', n: 6, dx: -12, dur: 0.5 },
    { at: 2.45, kind: 'burst', actor: 'engine', emoji: '💥', n: 1, dx: 9, dur: 0.5 },
    { at: 2.8, kind: 'puff', actor: 'engine', dur: 0.5 },
    { at: 3.2, kind: 'puff', actor: 'engine', dur: 0.5 },
    { at: 3.1, kind: 'dizzy', actor: 'ff', dur: 1.4 },
    { at: 5.6, kind: 'pop', actor: 'ff', emoji: '💡', dur: 0.4 },
    { at: 7.0, kind: 'pop', actor: 'engine', emoji: '😆', dur: 0.5 },
    { at: 7.5, kind: 'burst', actor: 'ff', emoji: '💦', n: 5, dx: -8, dur: 0.5 },
    { at: 8.3, kind: 'sweat', actor: 'ff' },
    { at: 8.5, kind: 'puff', actor: 'engine', dur: 0.5 },
  ],
  camera: [
    { at: 0.9, dur: 0.9, do: 'zoom', amount: 1.3, actor: 'engine' },
    { at: 2.0, dur: 0.3, do: 'follow', actor: 'engine', amount: 1.3 },
    { at: 2.45, dur: 0.35, do: 'shake', amount: 1.2 },
    { at: 2.5, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.9, sfx: 'tap' },
    { at: 1.25, sfx: 'tap' },
    { at: 1.6, sfx: 'tap' },
    { at: 2.0, sfx: 'splash' },
    { at: 2.05, sfx: 'whoosh' },
    { at: 2.45, sfx: 'bonk' },
    { at: 2.55, say: '足' },
    { at: 2.8, sfx: 'slide' },
    { at: 3.05, sfx: 'boing' },
    { at: 5.15, say: '足' },
    { at: 6.1, say: '足球' },
    { at: 6.85, sfx: 'boing' },
    { at: 7.5, sfx: 'splash' },
    { at: 8.0, sfx: 'boing' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
