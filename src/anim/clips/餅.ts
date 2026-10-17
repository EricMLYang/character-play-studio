import type { Clip } from '../clip'

// 餅：圓桶身的玩具海盜用望遠鏡看到積木塔頂端的大餅乾，鑽進大砲叫鸚鵡拉繩——鸚鵡翻白眼不理他，最後一屁股坐到發射鈕上。
// 「碰」！海盜飛過頭、擦過餅乾、撞散積木小隊，彈到牆上倒栽蔥掉進水桶；積木和餅乾碎片落成「餅」，鸚鵡叼來一捲蛋餅蓋在他靴子上。
// 回馬槍：海盜探出頭啃蛋餅，鸚鵡又一屁股坐到他頭上——他「噗」一聲又被按回水桶裡。餅、餅、蛋餅
const clip: Clip = {
  char: '餅',
  meta: { theme: '海盜大砲搶餅乾', cast: '玩具海盜＋鸚鵡＋積木小隊＋大餅乾', gags: ['鸚鵡一屁股坐發射鈕', '飛過頭倒栽進水桶', '鸚鵡又坐下把他按回去'] },
  duration: 10,
  bg: { top: '#FFEFB0', bottom: '#FFF9E0', floor: '#E3C48E', scenery: 'room' },
  actors: [
    { id: 'brick', emoji: 'hero:brick/stack', x: 132, y: 70.5, size: 15 },
    { id: 'b1', emoji: '🧱', x: 132, y: 59, size: 9 },
    { id: 'b2', emoji: '🧱', x: 132, y: 51, size: 9 },
    { id: 'cookie', emoji: '🍪', x: 132, y: 43, size: 10 },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 12, y: 70.5, size: 15 },
    { id: 'cannon', emoji: '🛢️', x: 28, y: 70, size: 14 },
    { id: 'button', emoji: '🔴', x: 44, y: 73, size: 5 },
    { id: 'parrot', emoji: '🦜', x: 16, y: 58, size: 8, float: true, flip: true },
    { id: 'bucket', emoji: '🪣', x: 152, y: 72, size: 12 },
    { id: 'roll', emoji: '🌯', x: 80, y: 10, size: 8, hidden: true, float: true },
  ],
  moves: [
    // 用望遠鏡看到餅乾，口水直流
    { at: 0.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/telescope' },
    { at: 1.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 1.0, actor: 'pirate', do: 'hop', amount: 3, dur: 0.3 },
    // 一頭鑽進大砲
    { at: 1.4, actor: 'pirate', do: 'moveTo', to: { x: 28, y: 62 }, arc: 10, dur: 0.4 },
    { at: 1.4, actor: 'parrot', do: 'moveTo', to: { x: 14, y: 52 }, arc: 4, dur: 0.4 },
    { at: 1.8, actor: 'cannon', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 1.9, actor: 'pirate', do: 'shake', amount: 1, dur: 0.5 },
    // 鸚鵡翻白眼不理他——最後一屁股坐上發射鈕
    { at: 2.5, actor: 'parrot', do: 'moveTo', to: { x: 44, y: 66 }, arc: 10, dur: 0.4 },
    { at: 2.9, actor: 'button', do: 'squash', amount: 0.5, dur: 0.2 },
    { at: 2.9, actor: 'parrot', do: 'squash', amount: 0.3, dur: 0.2 },
    // 碰！飛過頭，擦過餅乾
    { at: 3.0, actor: 'cannon', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 3.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 3.0, actor: 'pirate', do: 'moveTo', to: { x: 128, y: 28 }, arc: 22, dur: 0.6, ease: 'out' },
    { at: 3.0, actor: 'pirate', do: 'spin', times: 1, dur: 0.6 },
    // 撞散積木小隊
    { at: 3.6, actor: 'pirate', do: 'moveTo', to: { x: 134, y: 52 }, dur: 0.15, ease: 'in' },
    { at: 3.75, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 3.75, actor: 'brick', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 3.75, actor: 'b1', do: 'moveTo', to: { x: 64, y: 24 }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 3.75, actor: 'b2', do: 'moveTo', to: { x: 72, y: 44 }, arc: 14, dur: 0.55, ease: 'out' },
    { at: 3.75, actor: 'cookie', do: 'moveTo', to: { x: 100, y: 20 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 3.75, actor: 'b1', do: 'spin', times: 2, dur: 0.5 },
    { at: 3.75, actor: 'b2', do: 'spin', times: 2, dur: 0.55 },
    { at: 3.75, actor: 'cookie', do: 'spin', times: 2, dur: 0.6 },
    // 彈到牆上，倒栽蔥掉進水桶
    { at: 3.75, actor: 'pirate', do: 'moveTo', to: { x: 154, y: 36 }, dur: 0.2, ease: 'out' },
    { at: 3.95, actor: 'pirate', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 3.95, actor: 'pirate', do: 'moveTo', to: { x: 152, y: 53 }, arc: 6, dur: 0.35, ease: 'in' },
    { at: 4.3, actor: 'bucket', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.35, actor: 'pirate', do: 'shake', amount: 1, dur: 1.2 },
    { at: 4.3, actor: 'b1', do: 'vanish', dur: 0.15 },
    { at: 4.7, actor: 'b2', do: 'vanish', dur: 0.15 },
    { at: 5.1, actor: 'cookie', do: 'vanish', dur: 0.15 },
    { at: 3.4, actor: 'parrot', do: 'moveTo', to: { x: 44, y: 62 }, dur: 0.3 },
    // 鸚鵡叼著一捲蛋餅飛過來，蓋在他靴子上
    { at: 6.0, actor: 'parrot', do: 'moveTo', to: { x: 140, y: 26 }, arc: 36, dur: 0.9 },
    { at: 6.4, actor: 'roll', do: 'pop', dur: 0.2 },
    { at: 6.4, actor: 'roll', do: 'moveTo', to: { x: 152, y: 46 }, arc: 6, dur: 0.6, ease: 'in' },
    { at: 7.0, actor: 'pirate', do: 'squash', amount: 0.2, dur: 0.2 },
    // 回馬槍：探出頭啃蛋餅——鸚鵡一屁股坐到他頭上，又被按回水桶
    { at: 7.6, actor: 'pirate', do: 'rotateTo', amount: -180, dur: 0.35 },
    { at: 7.6, actor: 'pirate', do: 'moveTo', to: { x: 150, y: 64 }, dur: 0.35 },
    { at: 7.6, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 7.6, actor: 'roll', do: 'moveTo', to: { x: 143, y: 62 }, dur: 0.35 },
    { at: 8.0, actor: 'pirate', do: 'bounce', amount: 1, times: 3, dur: 0.6 },
    { at: 8.0, actor: 'roll', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 8.0, actor: 'brick', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 8.4, actor: 'parrot', do: 'moveTo', to: { x: 150, y: 52 }, dur: 0.3, ease: 'in' },
    { at: 8.7, actor: 'pirate', do: 'moveTo', to: { x: 150, y: 70 }, dur: 0.2, ease: 'in' },
    { at: 8.7, actor: 'parrot', do: 'moveTo', to: { x: 150, y: 59 }, dur: 0.2, ease: 'in' },
    { at: 8.7, actor: 'roll', do: 'vanish', dur: 0.2 },
    { at: 8.9, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 9.3, actor: 'parrot', do: 'tilt', amount: 15, dur: 0.4 },
  ],
  builds: [
    // 積木疊成食，餅乾碎片排成并
    { at: 4.3, dur: 0.45, strokes: [0, 1, 2], from: 'b1', color: '#7B4A2A' },
    { at: 4.7, dur: 0.55, strokes: [3, 4, 5, 6, 7], from: 'b2', color: '#7B4A2A' },
    { at: 5.1, dur: 0.75, strokes: [8, 9, 10, 11, 12, 13], from: 'cookie', color: '#C77D2E' },
  ],
  glyph: [{ at: 5.85, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'bubble', actor: 'pirate', emoji: '🍪', dur: 0.8, dx: 7 },
    { at: 1.05, kind: 'pop', actor: 'pirate', emoji: '😋', dur: 0.4 },
    { at: 1.9, kind: 'pop', actor: 'pirate', emoji: '👉', dur: 0.5, dx: 6 },
    { at: 2.0, kind: 'bubble', actor: 'parrot', emoji: '😑', dur: 0.5 },
    { at: 3.0, kind: 'burst', actor: 'cannon', emoji: '💨', n: 5, dur: 0.6 },
    { at: 3.75, kind: 'burst', x: 134, y: 52, dur: 0.45 },
    { at: 4.3, kind: 'burst', actor: 'bucket', emoji: '💫', n: 4, dur: 0.4, dx: -12, dy: 6 },
    { at: 7.0, kind: 'pop', actor: 'parrot', emoji: '😏', dur: 0.6, dx: -6, dy: 4 },
    { at: 8.1, kind: 'pop', actor: 'pirate', emoji: '😋', dur: 0.4, dx: -6 },
    { at: 8.7, kind: 'burst', x: 138, y: 64, emoji: '💦', n: 4, dur: 0.4 },
  ],
  camera: [
    { at: 3.0, dur: 0.3, do: 'follow', actor: 'pirate', amount: 1.3 },
    { at: 3.75, dur: 0.3, do: 'shake', amount: 1.4 },
    { at: 3.8, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.0, say: '餅' },
    { at: 1.8, sfx: 'plop' },
    { at: 2.9, sfx: 'tap' },
    { at: 3.0, sfx: 'poof' },
    { at: 3.05, sfx: 'whoosh' },
    { at: 3.75, sfx: 'crack' },
    { at: 4.3, sfx: 'bonk' },
    { at: 5.9, say: '餅' },
    { at: 7.0, say: '蛋餅' },
    { at: 8.7, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
