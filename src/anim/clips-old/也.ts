import type { Clip } from '../clip'

// 也：發條鯊魚先咬錯咬到恐龍的尾巴（拉得像麵條「啵嘶」彈回去），才把三根泡棉長條越疊越高，自己踮在尾巴上搖搖晃晃；
// 恐龍手太短放不上最後的小方塊，只好用肚子一撞——塔嘩啦倒下落成「也」，鯊魚被泡棉埋得只剩眼睛；恐龍也往後一倒滾進來被埋，兩雙眼睛一起眨。也、也、也是
const BARS = ['f1', 'f2', 'f3', 'cube']

const clip: Clip = {
  char: '也',
  meta: { theme: '泡棉疊疊樂', cast: '發條鯊魚＋橡膠恐龍＋泡棉長條', gags: ['咬錯咬到尾巴', '越疊越高越晃', '手太短用肚子撞', '被埋只剩眼睛', '兩個都被埋一起眨眼'] },
  duration: 10,
  bg: { top: '#FFF7D1', bottom: '#FFEFB0', floor: '#E9D58A', scenery: 'hills' },
  actors: [
    { id: 'f1', emoji: '🟥', x: 112, y: 71, size: 8 },
    { id: 'f2', emoji: '🟥', x: 120, y: 71, size: 8 },
    { id: 'f3', emoji: '🟥', x: 116, y: 64, size: 8 },
    { id: 'dino', emoji: 'hero:dino/idle', x: 138, y: 70.7, size: 15 },
    { id: 'cube', emoji: '🟧', x: 126, y: 72, size: 5 },
    { id: 'shark', emoji: 'hero:shark/idle', x: 40, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'pile1', emoji: '🧽', x: 24, y: 71, size: 14, hidden: true },
    { id: 'eyes1', emoji: '👀', x: 24, y: 64, size: 6, hidden: true },
    { id: 'pile2', emoji: '🧽', x: 38, y: 71, size: 14, hidden: true },
    { id: 'eyes2', emoji: '👀', x: 38, y: 64, size: 6, hidden: true },
  ],
  moves: [
    // 發條鯊魚滴答滴答走進來，盯上那堆泡棉
    { at: 0, actor: 'shark', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.6, ease: 'out' },
    // 撲過去——咬錯，咬到恐龍尾巴
    { at: 0.9, actor: 'shark', do: 'moveTo', to: { x: 124, y: 71.1 }, dur: 0.3, anticipate: 3, ease: 'in' },
    { at: 1.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.2, actor: 'dino', do: 'squash', amount: -0.45, dur: 0.35 },
    { at: 1.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 1.55, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 1.55, actor: 'shark', do: 'shake', amount: 1, dur: 0.3 },
    { at: 1.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    // 叼起第一根，插在正中間
    { at: 1.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.95, actor: 'shark', do: 'moveTo', to: { x: 66, y: 71.1 }, dur: 0.35 },
    { at: 1.95, actor: 'f1', do: 'moveTo', to: { x: 80, y: 70 }, arc: 6, dur: 0.35 },
    { at: 2.3, actor: 'f1', do: 'squash', amount: 0.3, dur: 0.2 },
    // 越疊越快
    { at: 2.5, actor: 'shark', do: 'moveTo', to: { x: 108, y: 71.1 }, dur: 0.25 },
    { at: 2.8, actor: 'shark', do: 'moveTo', to: { x: 66, y: 71.1 }, dur: 0.25 },
    { at: 2.8, actor: 'f2', do: 'moveTo', to: { x: 80, y: 62 }, arc: 8, dur: 0.25 },
    { at: 3.1, actor: 'shark', do: 'moveTo', to: { x: 106, y: 71.1 }, dur: 0.25 },
    // 第三根要踮在自己尾巴上才放得上去
    { at: 3.4, actor: 'shark', do: 'moveTo', to: { x: 68, y: 64 }, arc: 6, dur: 0.3 },
    { at: 3.4, actor: 'f3', do: 'moveTo', to: { x: 80, y: 54 }, arc: 10, dur: 0.3 },
    { at: 3.7, actor: 'shark', do: 'squash', amount: -0.25, dur: 0.6 },
    { at: 3.75, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    ...['f1', 'f2', 'f3'].map((id, i) => ({ at: 3.7, actor: id, do: 'shake' as const, amount: 1 + i, dur: 1.4 })),
    { at: 3.7, actor: 'shark', do: 'shake', amount: 1.5, dur: 1.4 },
    // 恐龍抱著小方塊踩過來，手太短搆不到
    { at: 3.8, actor: 'dino', do: 'moveTo', to: { x: 100, y: 70.7 }, dur: 0.5 },
    { at: 3.8, actor: 'cube', do: 'moveTo', to: { x: 98, y: 60 }, dur: 0.5 },
    { at: 4.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 4.45, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 4.45, actor: 'cube', do: 'hop', amount: 3, dur: 0.3 },
    { at: 4.8, actor: 'dino', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 4.8, actor: 'cube', do: 'hop', amount: 4, dur: 0.3 },
    // 退後——用肚子一撞！方塊彈上塔頂
    { at: 5.15, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 5.15, actor: 'dino', do: 'moveTo', to: { x: 92, y: 70.7 }, dur: 0.22, anticipate: 5, ease: 'in' },
    { at: 5.15, actor: 'cube', do: 'moveTo', to: { x: 80, y: 47 }, arc: 12, dur: 0.35, ease: 'out' },
    { at: 5.37, actor: 'dino', do: 'moveTo', to: { x: 118, y: 70.7 }, dur: 0.35, ease: 'out' },
    { at: 5.37, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    // 定格半秒……然後全倒
    { at: 5.95, actor: 'f1', do: 'rotateTo', amount: 30, dur: 0.15 },
    { at: 5.95, actor: 'f2', do: 'rotateTo', amount: 50, dur: 0.15 },
    { at: 5.95, actor: 'f3', do: 'rotateTo', amount: 70, dur: 0.15 },
    { at: 5.95, actor: 'cube', do: 'rotateTo', amount: 90, dur: 0.15 },
    ...BARS.map((id) => ({ at: 6.05, actor: id, do: 'vanish' as const, dur: 0.15 })),
    // 鯊魚被泡棉沖到左下角埋起來，只剩眼睛
    { at: 6.05, actor: 'shark', do: 'moveTo', to: { x: 24, y: 71.1 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 6.45, actor: 'pile1', do: 'pop', dur: 0.3 },
    { at: 6.5, actor: 'shark', do: 'vanish', dur: 0.1 },
    { at: 6.6, actor: 'eyes1', do: 'pop', dur: 0.3 },
    { at: 6.9, actor: 'dino', do: 'tilt', amount: 12, dur: 0.5 },
    // 恐龍還在晃，往後一倒，滾進泡棉堆
    { at: 7.35, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 7.35, actor: 'dino', do: 'moveTo', to: { x: 38, y: 76 }, dur: 0.45 },
    { at: 7.35, actor: 'dino', do: 'spin', times: -2, dur: 0.45 },
    { at: 7.8, actor: 'pile2', do: 'pop', dur: 0.3 },
    { at: 7.85, actor: 'dino', do: 'vanish', dur: 0.1 },
    { at: 7.95, actor: 'eyes2', do: 'pop', dur: 0.3 },
    // 兩雙眼睛互看、一起眨
    { at: 8.35, actor: 'eyes1', do: 'squash', amount: 0.6, dur: 0.2 },
    { at: 8.35, actor: 'eyes2', do: 'squash', amount: 0.6, dur: 0.2 },
    { at: 8.65, actor: 'eyes1', do: 'squash', amount: 0.6, dur: 0.2 },
    { at: 8.65, actor: 'eyes2', do: 'squash', amount: 0.6, dur: 0.2 },
    // 回馬槍：鯊魚尾巴從泡棉堆冒出來搖一搖，整隻彈出來轉圈
    { at: 8.9, actor: 'pile1', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 9.2, actor: 'eyes1', do: 'vanish', dur: 0.1 },
    { at: 9.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 9.2, actor: 'shark', do: 'moveTo', to: { x: 22, y: 62 }, dur: 0.01 },
    { at: 9.2, actor: 'shark', do: 'pop', dur: 0.3 },
    { at: 9.45, actor: 'shark', do: 'spin', times: 1, dur: 0.5 },
  ],
  builds: [
    // 倒下來的三根泡棉：最上面那根 → 橫折鉤，中間那根 → 豎，最長那根 → 豎彎鉤
    { at: 6.0, dur: 0.3, strokes: [0], from: 'f3', color: '#F0654F' },
    { at: 6.15, dur: 0.3, strokes: [1], from: 'f2', color: '#F0654F' },
    { at: 6.3, dur: 0.35, strokes: [2], from: 'f1', color: '#E8590C' },
  ],
  glyph: [{ at: 6.7, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'shark', emoji: '😋', dur: 0.5 },
    { at: 1.25, kind: 'pop', actor: 'dino', emoji: '😖', dur: 0.5 },
    { at: 1.6, kind: 'pop', actor: 'shark', emoji: '❓', dur: 0.4 },
    { at: 3.75, kind: 'sweat', actor: 'shark', dur: 0.6 },
    { at: 4.5, kind: 'sweat', actor: 'dino', dur: 0.6 },
    { at: 5.37, kind: 'burst', actor: 'f1', dur: 0.35 },
    { at: 5.55, kind: 'pop', actor: 'dino', emoji: '😳', dur: 0.4 },
    { at: 6.45, kind: 'puff', actor: 'pile1', dur: 0.5 },
    { at: 7.8, kind: 'puff', actor: 'pile2', dur: 0.5 },
    { at: 9.45, kind: 'dizzy', actor: 'shark', dur: 0.5 },
  ],
  camera: [
    // 定格那半秒推近塔頂，倒下之前退回全景
    { at: 5.4, dur: 0.35, do: 'zoom', amount: 1.3, to: { x: 80, y: 52 } },
    { at: 5.8, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0, sfx: 'tap' },
    { at: 1.2, sfx: 'boing' },
    { at: 2.3, sfx: 'plop' },
    { at: 2.35, say: '也' },
    { at: 2.8, sfx: 'plop' },
    { at: 3.4, sfx: 'plop' },
    { at: 5.3, sfx: 'bonk' },
    { at: 6.0, sfx: 'rumble' },
    { at: 6.75, say: '也' },
    { at: 7.45, say: '也是' },
    { at: 7.8, sfx: 'poof' },
    { at: 9.2, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
