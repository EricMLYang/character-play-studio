import type { Clip } from '../clip'

// 猴：海盜抱著錢袋睡午覺，猴子偷偷摸過去，鸚鵡一叫就變成椰子樹；第二次鸚鵡又叫，猴子竟然假扮成鸚鵡（還抱著錢袋）。
// 被識破落跑，錢袋破掉金幣飛成「猴」。鸚鵡學話大叫「猴子！」，最後鸚鵡自己飛去站在猴子頭上跟著跑了。猴、猴、猴子
const clip: Clip = {
  char: '猴',
  meta: { theme: '海盜寶藏', cast: '猴子＋海盜＋鸚鵡', gags: ['偷偷摸摸', '假扮成鸚鵡', '鸚鵡學話', '連鸚鵡都跟著跑'] },
  duration: 10,
  bg: { top: '#C8F0FF', bottom: '#FFF1C9', floor: '#EBC983', scenery: 'desert' },
  actors: [
    { id: 'flag', emoji: '🏴‍☠️', x: 150, y: 46, size: 12, hidden: true, float: true },
    { id: 'pirate', emoji: '🧔', x: 140, y: 69.4, size: 18, hidden: true },
    { id: 'bag', emoji: '💰', x: 124, y: 73.2, size: 9, hidden: true },
    { id: 'monkey', emoji: '🐒', x: 30, y: 72, size: 12, hidden: true, flip: true },
    { id: 'parrot', emoji: '🦜', x: 143, y: 56, size: 8, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flag', do: 'pop' },
    { at: 0, actor: 'pirate', do: 'pop' },
    { at: 0.1, actor: 'bag', do: 'pop' },
    { at: 0.2, actor: 'parrot', do: 'pop' },
    { at: 0.2, actor: 'monkey', do: 'enter', from: { x: -15, y: 72 }, dur: 0.8 },
    // 躡手躡腳摸過去
    { at: 1.5, actor: 'monkey', do: 'moveTo', to: { x: 72, y: 72 }, dur: 0.6, arc: 3 },
    { at: 2.1, actor: 'monkey', do: 'moveTo', to: { x: 108, y: 72 }, dur: 0.4, arc: 3 },
    // 鸚鵡大叫，海盜醒來——猴子變成椰子樹
    { at: 2.5, actor: 'parrot', do: 'bounce', dur: 0.4, times: 2, amount: 3 },
    { at: 2.7, actor: 'monkey', do: 'swap', emoji: '🌴' },
    { at: 2.7, actor: 'monkey', do: 'scaleTo', amount: 1.5, dur: 0.15 },
    { at: 2.9, actor: 'pirate', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 3.6, actor: 'monkey', do: 'swap', emoji: '🐒' },
    { at: 3.6, actor: 'monkey', do: 'scaleTo', amount: 0.667, dur: 0.15 },
    // 再抓錢袋，鸚鵡又叫——猴子假扮成鸚鵡
    { at: 3.9, actor: 'bag', do: 'moveTo', to: { x: 114, y: 66 }, dur: 0.2 },
    { at: 4.1, actor: 'parrot', do: 'bounce', dur: 0.4, times: 2, amount: 3 },
    { at: 4.25, actor: 'monkey', do: 'swap', emoji: '🦜' },
    { at: 4.4, actor: 'pirate', do: 'tilt', amount: 12, dur: 0.5 },
    // 被識破，落跑
    { at: 5.0, actor: 'pirate', do: 'hop', amount: 6, dur: 0.3 },
    { at: 5.0, actor: 'pirate', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 5.05, actor: 'monkey', do: 'swap', emoji: '🐒' },
    { at: 5.1, actor: 'monkey', do: 'flip' },
    { at: 5.1, actor: 'monkey', do: 'moveTo', to: { x: 26, y: 72 }, dur: 0.5, arc: 10 },
    { at: 5.1, actor: 'bag', do: 'moveTo', to: { x: 40, y: 50 }, dur: 0.4, arc: 10 },
    { at: 5.5, actor: 'bag', do: 'vanish', dur: 0.2 },
    { at: 5.7, actor: 'monkey', do: 'flip' },
    // 鸚鵡學話
    { at: 7.4, actor: 'parrot', do: 'bounce', dur: 0.5, times: 2, amount: 3 },
    // 鸚鵡也跟猴子跑了
    { at: 8.3, actor: 'parrot', do: 'moveTo', to: { x: 27, y: 61 }, dur: 0.7, arc: 50 },
    { at: 9.0, actor: 'monkey', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 9.3, actor: 'monkey', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 9.3, actor: 'parrot', do: 'bounce', dur: 0.6, times: 2, amount: 2 },
    { at: 9.1, actor: 'pirate', do: 'shake', amount: 1, dur: 0.6 },
  ],
  builds: [
    // 錢袋破掉，金幣飛出來
    { at: 5.5, dur: 0.5, strokes: [0, 1, 2], from: 'bag', color: '#E0A100' },
    { at: 5.8, dur: 0.9, strokes: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: { x: 40, y: 50 }, color: '#D9572B' },
  ],
  glyph: [{ at: 6.7, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0, kind: 'zzz', actor: 'pirate', dur: 2.5 },
    { at: 1.0, kind: 'bubble', actor: 'monkey', emoji: '💰', dur: 0.6 },
    { at: 2.5, kind: 'pop', actor: 'parrot', emoji: '❗', dur: 0.4 },
    { at: 2.65, kind: 'burst', actor: 'monkey', emoji: '💨', n: 6, dur: 0.4 },
    { at: 3.0, kind: 'bubble', actor: 'pirate', emoji: '❓', dur: 0.5, dx: -16 },
    { at: 3.0, kind: 'sweat', actor: 'monkey', dx: -8 },
    { at: 4.1, kind: 'pop', actor: 'parrot', emoji: '❗', dur: 0.4 },
    { at: 4.2, kind: 'burst', actor: 'monkey', emoji: '💨', n: 6, dur: 0.4 },
    { at: 4.5, kind: 'bubble', actor: 'pirate', emoji: '🦜', dur: 0.45, dx: -16 },
    { at: 5.0, kind: 'pop', actor: 'pirate', emoji: '💢', dur: 0.5, dx: -10 },
    { at: 5.5, kind: 'burst', actor: 'bag', emoji: '🪙', n: 7, dur: 0.6 },
    { at: 7.4, kind: 'bubble', actor: 'parrot', emoji: '🐒', dur: 0.8, dx: -14 },
    { at: 8.9, kind: 'bubble', actor: 'pirate', emoji: '😭', dur: 0.8, dx: -16 },
    { at: 9.2, kind: 'pop', actor: 'monkey', emoji: '😆', dur: 0.7, dx: 4 },
  ],
  camera: [
    { at: 4.3, dur: 0.7, do: 'punch', amount: 0.25, to: { x: 120, y: 60 } },
  ],
  cues: [
    { at: 1.5, say: '猴' },
    { at: 2.5, sfx: 'blip' },
    { at: 2.7, sfx: 'poof' },
    { at: 3.6, sfx: 'poof' },
    { at: 4.1, sfx: 'blip' },
    { at: 4.25, sfx: 'poof' },
    { at: 5.05, sfx: 'whoosh' },
    { at: 5.5, sfx: 'crack' },
    { at: 6.7, say: '猴' },
    { at: 7.4, sfx: 'blip' },
    { at: 7.7, say: '猴子' },
    { at: 8.3, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
