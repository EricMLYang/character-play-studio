import type { Clip } from '../clip'

// 猴：海盜抱著錢袋睡午覺，猴子躡手躡腳摸過去，鸚鵡一叫，猴子「噗」變成椰子樹；海盜看一看，又睡了。
// 猴子抓起錢袋，鸚鵡又叫——猴子竟然變成鸚鵡（還抱著錢袋）！被識破落跑，錢袋破掉，金幣飛成「猴」。鸚鵡大叫「猴子！」。猴、猴、猴子
const clip: Clip = {
  char: '猴',
  meta: { theme: '海盜寶藏', cast: '猴子＋海盜＋鸚鵡', gags: ['偷偷摸摸', '變裝露餡', '鸚鵡告狀'] },
  duration: 10,
  bg: { top: '#BFEAFF', bottom: '#FFF1C9', floor: '#EBC983', scenery: 'desert' },
  actors: [
    { id: 'flag', emoji: '🏴‍☠️', x: 152, y: 40, size: 14, hidden: true, float: true },
    { id: 'pirate', emoji: '🧔', x: 142, y: 67.5, size: 22, hidden: true },
    { id: 'bag', emoji: '💰', x: 124, y: 72, size: 11, hidden: true },
    { id: 'monkey', emoji: '🐒', x: 30, y: 70.5, size: 16, hidden: true, flip: true },
    { id: 'parrot', emoji: '🦜', x: 146, y: 50, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flag', do: 'pop' },
    { at: 0, actor: 'pirate', do: 'pop' },
    { at: 0.1, actor: 'bag', do: 'pop' },
    { at: 0.2, actor: 'parrot', do: 'pop' },
    { at: 0.2, actor: 'monkey', do: 'enter', from: { x: -15, y: 70.5 }, dur: 0.8 },
    { at: 1.2, actor: 'monkey', do: 'hop', amount: 3, dur: 0.3 },
    // 躡手躡腳，一步、一步
    { at: 1.7, actor: 'monkey', do: 'moveTo', to: { x: 68, y: 70.5 }, dur: 0.6, arc: 3 },
    { at: 2.4, actor: 'monkey', do: 'moveTo', to: { x: 104, y: 70.5 }, dur: 0.6, arc: 3 },
    // 鸚鵡大叫——猴子變成椰子樹；海盜看一看，又睡了
    { at: 3.1, actor: 'parrot', do: 'bounce', dur: 0.4, times: 2, amount: 3 },
    { at: 3.25, actor: 'monkey', do: 'swap', emoji: '🌴' },
    { at: 3.25, actor: 'monkey', do: 'scaleTo', amount: 1.5, dur: 0.15 },
    { at: 3.4, actor: 'pirate', do: 'tilt', amount: 12, dur: 0.8 },
    { at: 4.5, actor: 'monkey', do: 'swap', emoji: '🐒' },
    { at: 4.5, actor: 'monkey', do: 'scaleTo', amount: 0.667, dur: 0.15 },
    // 抓起錢袋——鸚鵡又叫，猴子變成鸚鵡
    { at: 4.8, actor: 'bag', do: 'moveTo', to: { x: 110, y: 64 }, dur: 0.25 },
    { at: 5.2, actor: 'parrot', do: 'bounce', dur: 0.4, times: 2, amount: 3 },
    { at: 5.35, actor: 'monkey', do: 'swap', emoji: '🦜' },
    { at: 5.5, actor: 'pirate', do: 'tilt', amount: 12, dur: 0.6 },
    // 被識破，落跑；錢袋破掉
    { at: 6.4, actor: 'pirate', do: 'hop', amount: 6, dur: 0.35 },
    { at: 6.4, actor: 'pirate', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 6.45, actor: 'monkey', do: 'swap', emoji: '🐒' },
    { at: 6.5, actor: 'monkey', do: 'flip' },
    { at: 6.5, actor: 'monkey', do: 'moveTo', to: { x: 26, y: 70.5 }, dur: 0.55, arc: 10 },
    { at: 6.5, actor: 'bag', do: 'moveTo', to: { x: 40, y: 48 }, dur: 0.4, arc: 10 },
    { at: 6.9, actor: 'bag', do: 'vanish', dur: 0.2 },
    { at: 7.2, actor: 'monkey', do: 'flip' },
    // 鸚鵡告狀
    { at: 8.3, actor: 'parrot', do: 'bounce', dur: 0.6, times: 2, amount: 3 },
    { at: 9.0, actor: 'pirate', do: 'shake', amount: 1, dur: 0.6 },
    { at: 9.2, actor: 'monkey', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
  ],
  builds: [
    // 錢袋破掉，金幣飛出來
    { at: 6.9, dur: 0.5, strokes: [0, 1, 2], from: 'bag', color: '#E0A100' },
    { at: 7.15, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: { x: 40, y: 48 }, color: '#D9572B' },
  ],
  glyph: [{ at: 8.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'pirate', dur: 3.2, dx: -6 },
    { at: 1.0, kind: 'bubble', actor: 'monkey', emoji: '💰', dur: 0.8 },
    { at: 3.1, kind: 'pop', actor: 'parrot', emoji: '❗', dur: 0.5 },
    { at: 3.2, kind: 'burst', actor: 'monkey', emoji: '💨', n: 6, dur: 0.4 },
    { at: 3.5, kind: 'bubble', actor: 'pirate', emoji: '❓', dur: 0.8, dx: -18 },
    { at: 3.6, kind: 'sweat', actor: 'monkey', dx: -8 },
    { at: 4.3, kind: 'zzz', actor: 'pirate', dur: 0.9, dx: -6 },
    { at: 5.2, kind: 'pop', actor: 'parrot', emoji: '❗', dur: 0.5 },
    { at: 5.3, kind: 'burst', actor: 'monkey', emoji: '💨', n: 6, dur: 0.4 },
    { at: 5.6, kind: 'bubble', actor: 'pirate', emoji: '🦜', dur: 0.7, dx: -18 },
    { at: 6.4, kind: 'pop', actor: 'pirate', emoji: '💢', dur: 0.6, dx: -10 },
    { at: 6.9, kind: 'burst', actor: 'bag', emoji: '🪙', n: 7, dur: 0.6 },
    { at: 8.3, kind: 'bubble', actor: 'parrot', emoji: '🐒', dur: 1.0, dx: -14 },
    { at: 9.2, kind: 'pop', actor: 'monkey', emoji: '😆', dur: 0.7, dx: 4 },
  ],
  camera: [
    { at: 5.35, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 120, y: 58 } },
  ],
  cues: [
    { at: 1.25, say: '猴' },
    { at: 3.1, sfx: 'blip' },
    { at: 3.25, sfx: 'poof' },
    { at: 4.5, sfx: 'poof' },
    { at: 5.2, sfx: 'blip' },
    { at: 5.35, sfx: 'poof' },
    { at: 6.45, sfx: 'whoosh' },
    { at: 6.9, sfx: 'crack' },
    { at: 8.1, say: '猴' },
    { at: 8.4, sfx: 'blip' },
    { at: 9.0, say: '猴子' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
