import type { Clip } from '../clip'

// 夜（v8）：玩具海盜想抓高高掛著的月亮金幣，鑽進小砲管比讚；鸚鵡偏偏一腳踩歪砲管，把他轟向地板。
// 他在地板、牆壁、天花板、積木小隊頭頂連環彈跳，每撞一下就喀啦敲進兩筆，「夜」完成；積木塔倒成小凳子，金幣掉進他懷裡，小夜市攤子冒出來。最後鸚鵡停在他鼻尖上，看到鬥雞眼。夜、夜、夜市
const clip: Clip = {
  char: '夜',
  meta: { theme: '海盜砲彈連環彈跳', cast: '玩具海盜＋鸚鵡＋積木小隊＋月亮金幣', gags: ['鸚鵡踩歪砲管', '連環彈跳敲筆畫', '積木塔倒成凳子', '鸚鵡停在鼻尖'] },
  duration: 10,
  bg: { top: '#16204A', bottom: '#2E3F7A', floor: '#4B4E6D', scenery: 'night' },
  actors: [
    { id: 'coin', emoji: '🪙', x: 96, y: 8, size: 7, hidden: true, float: true },
    { id: 'cannon', emoji: '🛢️', x: 24, y: 71, size: 10, hidden: true },
    { id: 'brick', emoji: 'hero:brick/march', x: 142, y: 70.7, size: 15, hidden: true },
    { id: 'cart', emoji: '🍢', x: 150, y: 72, size: 9, hidden: true },
    { id: 'lantern', emoji: '🏮', x: 150, y: 52, size: 8, hidden: true, float: true },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 22, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'parrot', emoji: '🦜', x: 22, y: 60, size: 7, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'coin', do: 'drop', dur: 0.5 },
    { at: 0, actor: 'pirate', do: 'pop', dur: 0.3 },
    { at: 0.1, actor: 'parrot', do: 'pop', dur: 0.3 },
    { at: 0.4, actor: 'pirate', do: 'shake', amount: 0.6, dur: 0.5 },
    // 鸚鵡打個呵欠飛去停在金幣的繩子上
    { at: 0.6, actor: 'parrot', do: 'moveTo', to: { x: 103, y: 6 }, dur: 0.6, arc: 6 },
    { at: 0.3, actor: 'brick', do: 'enter', from: { x: 180, y: 70.7 }, dur: 0.6 },
    { at: 0.9, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 0.9, actor: 'brick', do: 'squash', amount: -0.2, dur: 0.3 },
    // 鑽進砲管、比讚
    { at: 0.8, actor: 'cannon', do: 'pop', dur: 0.3 },
    { at: 1.0, actor: 'pirate', do: 'moveTo', to: { x: 24, y: 63 }, dur: 0.3, arc: 6 },
    { at: 1.3, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    // 鸚鵡一腳踩歪砲管
    { at: 1.3, actor: 'parrot', do: 'moveTo', to: { x: 31, y: 63 }, dur: 0.3, ease: 'in' },
    { at: 1.6, actor: 'cannon', do: 'rotateTo', amount: 35, dur: 0.15 },
    { at: 1.65, actor: 'parrot', do: 'moveTo', to: { x: 103, y: 6 }, dur: 0.6, arc: 8 },
    // 碰！轟向地板
    { at: 1.75, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 1.75, actor: 'pirate', do: 'moveTo', to: { x: 74, y: 71.1 }, dur: 0.25, ease: 'in' },
    { at: 2.0, actor: 'pirate', do: 'squash', amount: 0.5, dur: 0.2 },
    // 彈到左牆
    { at: 2.2, actor: 'pirate', do: 'moveTo', to: { x: 9, y: 40 }, dur: 0.35, ease: 'out' },
    { at: 2.2, actor: 'pirate', do: 'spin', times: 1, dur: 0.35 },
    { at: 2.55, actor: 'pirate', do: 'squash', amount: 0.4, dur: 0.2 },
    // 彈到天花板
    { at: 2.75, actor: 'pirate', do: 'moveTo', to: { x: 60, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 2.75, actor: 'pirate', do: 'spin', times: 1, dur: 0.35 },
    { at: 3.1, actor: 'pirate', do: 'squash', amount: -0.4, dur: 0.2 },
    // 彈到積木塔頭頂
    { at: 3.3, actor: 'pirate', do: 'moveTo', to: { x: 142, y: 52 }, dur: 0.45, ease: 'in' },
    { at: 3.3, actor: 'pirate', do: 'spin', times: 1, dur: 0.45 },
    { at: 3.75, actor: 'pirate', do: 'squash', amount: 0.4, dur: 0.2 },
    { at: 3.75, actor: 'brick', do: 'squash', amount: 0.3, dur: 0.25 },
    // 積木塔晃一晃倒成小凳子；海盜一屁股坐上去
    { at: 4.0, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.0, actor: 'brick', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 4.4, actor: 'brick', do: 'scaleTo', amount: 0.7, dur: 0.3, ease: 'bounce' },
    { at: 4.4, actor: 'brick', do: 'moveTo', to: { x: 134, y: 72.5 }, dur: 0.3 },
    { at: 3.95, actor: 'pirate', do: 'moveTo', to: { x: 134, y: 61 }, dur: 0.75, arc: 12, ease: 'inOut' },
    { at: 4.7, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 4.7, actor: 'pirate', do: 'squash', amount: 0.25, dur: 0.25 },
    // 金幣掉進懷裡
    { at: 5.2, actor: 'coin', do: 'moveTo', to: { x: 132, y: 62 }, dur: 0.45, ease: 'in' },
    { at: 5.65, actor: 'coin', do: 'vanish', dur: 0.1 },
    { at: 5.65, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/treasure' },
    { at: 5.2, actor: 'parrot', do: 'moveTo', to: { x: 103, y: 4 }, dur: 0.3 },
    // 夜市攤子冒出來
    { at: 6.4, actor: 'cart', do: 'pop', dur: 0.35 },
    { at: 6.5, actor: 'lantern', do: 'pop', dur: 0.35 },
    { at: 7.0, actor: 'lantern', do: 'tilt', amount: 12, dur: 0.8 },
    { at: 7.8, actor: 'lantern', do: 'tilt', amount: -12, dur: 0.8 },
    { at: 7.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    // 回馬槍：鸚鵡終於下來了——停在海盜鼻尖上
    { at: 7.9, actor: 'parrot', do: 'moveTo', to: { x: 130, y: 54 }, dur: 0.7, arc: 4 },
    { at: 8.6, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 8.6, actor: 'pirate', do: 'shake', amount: 0.5, dur: 0.4 },
    { at: 8.6, actor: 'parrot', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
  ],
  builds: [
    // 每撞一下敲進兩筆：地板 → 點和橫；牆 → 亻；天花板 → 撇和橫折；積木頭頂 → 點和長捺
    { at: 2.0, dur: 0.35, strokes: [0, 1], from: 'pirate', color: '#FFD43B' },
    { at: 2.55, dur: 0.35, strokes: [2, 3], from: 'pirate', color: '#FFC107' },
    { at: 3.1, dur: 0.35, strokes: [4, 5], from: 'pirate', color: '#FFD43B' },
    { at: 3.75, dur: 0.4, strokes: [6, 7], from: 'pirate', color: '#FFC107' },
  ],
  glyph: [{ at: 4.2, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, dur: 5.2, kind: 'line', actor: 'coin', to: { x: 96, y: 0 }, color: '#E9ECEF', width: 0.4 },
    { at: 0.3, kind: 'bubble', actor: 'pirate', emoji: '🪙', dur: 0.7 },
    { at: 0.2, kind: 'pop', actor: 'parrot', emoji: '🥱', dur: 0.4, dx: 5 },
    { at: 1.3, kind: 'pop', actor: 'pirate', emoji: '👍', dur: 0.4 },
    { at: 1.75, kind: 'burst', actor: 'cannon', n: 1, dur: 0.3 },
    { at: 1.8, kind: 'puff', actor: 'cannon', dur: 0.5 },
    { at: 2.0, kind: 'burst', actor: 'pirate', emoji: '✨', n: 5, dur: 0.3 },
    { at: 2.55, kind: 'burst', actor: 'pirate', emoji: '✨', n: 5, dur: 0.3, dx: 10 },
    { at: 3.1, kind: 'burst', actor: 'pirate', emoji: '✨', n: 5, dur: 0.3, dy: 14 },
    { at: 3.75, kind: 'burst', actor: 'pirate', n: 1, dur: 0.3 },
    { at: 4.7, kind: 'dizzy', actor: 'pirate', dur: 1.0 },
    { at: 6.6, dur: 1.5, kind: 'zzz', actor: 'cart', emoji: '♨️', dx: -6 },
    { at: 8.6, kind: 'pop', actor: 'pirate', emoji: '😵', dur: 0.6, dx: -7 },
  ],
  camera: [
    { at: 2.0, dur: 0.2, do: 'shake', amount: 0.8 },
    { at: 2.55, dur: 0.2, do: 'shake', amount: 0.8 },
    { at: 3.1, dur: 0.2, do: 'shake', amount: 0.8 },
    { at: 3.75, dur: 0.4, do: 'punch', amount: 0.15, to: { x: 140, y: 56 } },
  ],
  cues: [
    { at: 0.6, sfx: 'blip' },
    { at: 1.6, sfx: 'tap' },
    { at: 1.75, sfx: 'poof' },
    { at: 2.0, sfx: 'boing' },
    { at: 2.0, say: '夜' },
    { at: 2.55, sfx: 'bonk' },
    { at: 3.1, sfx: 'boing' },
    { at: 3.75, sfx: 'bonk' },
    { at: 4.25, say: '夜' },
    { at: 4.7, sfx: 'plop' },
    { at: 5.65, sfx: 'clink' },
    { at: 6.45, say: '夜市' },
    { at: 8.6, sfx: 'tap' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
