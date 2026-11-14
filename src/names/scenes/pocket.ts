// 演的是字面意思：寶（寶石、寶藏）＋可（可以）＋夢（做夢）——海底的烏龜睡著夢到寶石，夢泡泡被螃蟹戳破，寶石真的掉下來（沒有紅白球、抓怪、對戰、進化）。
import { scene } from '../../story/scene'
import type { Move } from '../../anim/clip'

// 海底：烏龜游下來，打個哈欠趴在沙上睡著。頭上冒出一顆夢泡泡，裡面有一顆亮晶晶的寶石。
// 螃蟹橫著走過來，眼睛發亮，伸鉗子去夾——泡泡飄走了（落空）。他蹲低、用力一跳，「啵！」泡泡破了……什麼都沒有（停一拍）。
// 然後嘩啦啦！寶石從上面掉下來，一顆敲到螃蟹頭，一頂皇冠剛好掉在烏龜頭上。烏龜醒來挺胸變大：「寶可夢」。螃蟹抱著寶石笑。
const T = 67.8 // 烏龜（size 22）趴在沙上的 y
const C = 71.5 // 螃蟹（size 13）
const GEM = { dx: 4.5, dy: -12 } // 寶石在泡泡的大球裡
const CROWN = { dx: -10, dy: -3 } // 皇冠戴在烏龜頭上（烏龜朝左）

/** 夢泡泡的動作，寶石照抄一份 */
const dream = (moves: Move[]): Move[] => moves.flatMap((m) => [
  m,
  { ...m, actor: 'gem', to: m.to && { x: m.to.x + GEM.dx, y: m.to.y + GEM.dy } },
])

export default scene({
  duration: 9.2,
  bg: { top: '#1C6FA8', bottom: '#7FD3E8', floor: '#E8D29A', scenery: 'ocean' },
  actors: [
    { id: 'weed', emoji: '🌿', x: 18, y: 66, size: 24 },
    { id: 'shell', emoji: '🐚', x: 140, y: 72, size: 12 },
    { id: 'fish', emoji: '🐠', x: 130, y: 24, size: 10, float: true },
    { id: 'turtle', emoji: '🐢', x: 60, y: T, size: 22 },
    { id: 'crown', emoji: '👑', x: 60 + CROWN.dx, y: -20, size: 9, pivot: 'center' },
    { id: 'coin1', emoji: '🪙', x: 34, y: -40, size: 7, pivot: 'center' },
    { id: 'coin2', emoji: '💎', x: 98, y: -45, size: 8, pivot: 'center' },
    { id: 'bubble', emoji: '🫧', x: 64, y: 54, size: 24, float: true, hidden: true },
    { id: 'gem', emoji: '💎', x: 64 + GEM.dx, y: 54 + GEM.dy, size: 8, float: true, hidden: true },
    { id: 'crab', emoji: '🦀', x: 185, y: C, size: 13 },
    { id: 'drop', emoji: '💎', x: 82, y: -40, size: 8, pivot: 'center' },
  ],
  moves: [
    // 烏龜游下來，趴在沙上打哈欠
    { at: 0, actor: 'turtle', do: 'enter', from: { x: -20, y: 30 }, dur: 1.1, ease: 'out' },
    { at: 0, actor: 'turtle', do: 'tilt', amount: -15, dur: 1.1 },
    { at: 1.3, actor: 'turtle', do: 'squash', amount: -0.15, dur: 0.4 },
    { at: 1.7, actor: 'turtle', do: 'squash', amount: 0.15, dur: 0.4 },
    // 夢泡泡冒出來
    ...dream([
      { at: 1.8, actor: 'bubble', do: 'pop', dur: 0.4 },
      { at: 1.8, actor: 'bubble', do: 'moveTo', to: { x: 70, y: 40 }, dur: 0.9, ease: 'out' },
    ]),
    { at: 2.0, actor: 'gem', do: 'spin', times: 1, dur: 0.6 },
    // 螃蟹橫著走過來，看到寶石
    { at: 2.3, actor: 'crab', do: 'moveTo', to: { x: 112, y: C }, dur: 0.8, ease: 'out' },
    { at: 3.3, actor: 'crab', do: 'moveTo', to: { x: 86, y: C }, dur: 0.45 },
    // 伸鉗子夾——泡泡飄走了
    { at: 3.85, actor: 'crab', do: 'hop', amount: 7, dur: 0.4 },
    ...dream([{ at: 3.85, actor: 'bubble', do: 'moveTo', to: { x: 56, y: 30 }, dur: 0.5, ease: 'out' }]),
    { at: 4.3, actor: 'crab', do: 'tilt', amount: 10, dur: 0.4 },
    // 蹲低、用力一跳，啵！
    { at: 4.7, actor: 'crab', do: 'moveTo', to: { x: 62, y: C }, dur: 0.35 },
    { at: 5.05, actor: 'crab', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 5.3, actor: 'crab', do: 'moveTo', to: { x: 60, y: 34 }, dur: 0.25, ease: 'out' },
    { at: 5.55, actor: 'bubble', do: 'vanish', dur: 0.1 },
    { at: 5.55, actor: 'gem', do: 'vanish', dur: 0.1 },
    { at: 5.6, actor: 'crab', do: 'moveTo', to: { x: 84, y: C }, arc: 4, dur: 0.4, ease: 'in' },
    // ……什麼都沒有，螃蟹左看右看
    { at: 6.0, actor: 'crab', do: 'tilt', amount: -14, dur: 0.25 },
    { at: 6.25, actor: 'crab', do: 'tilt', amount: 14, dur: 0.25 },
    // 嘩啦啦：寶石敲到螃蟹，皇冠掉在烏龜頭上
    { at: 6.5, actor: 'drop', do: 'moveTo', to: { x: 84, y: 62 }, dur: 0.3, ease: 'in' },
    { at: 6.8, actor: 'drop', do: 'moveTo', to: { x: 100, y: 72 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 6.8, actor: 'drop', do: 'spin', times: 2, dur: 0.4 },
    { at: 6.8, actor: 'crab', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 6.55, actor: 'coin1', do: 'moveTo', to: { x: 34, y: 73 }, dur: 0.45, ease: 'bounce' },
    { at: 6.65, actor: 'coin2', do: 'moveTo', to: { x: 120, y: 73 }, dur: 0.45, ease: 'bounce' },
    { at: 6.75, actor: 'crown', do: 'moveTo', to: { x: 60 + CROWN.dx, y: T + CROWN.dy }, dur: 0.45, ease: 'bounce' },
    // 烏龜醒來，挺胸變大
    { at: 7.3, actor: 'turtle', do: 'scaleTo', amount: 1.5, dur: 0.35, ease: 'back' },
    { at: 7.3, actor: 'crown', do: 'scaleTo', amount: 1.5, dur: 0.35, ease: 'back' },
    { at: 7.3, actor: 'crown', do: 'moveTo', to: { x: 60 + CROWN.dx * 1.5, y: T + CROWN.dy * 1.5 }, dur: 0.35, ease: 'back' },
    { at: 7.9, actor: 'crab', do: 'moveTo', to: { x: 98, y: C }, dur: 0.35 },
    { at: 8.3, actor: 'crab', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.3, actor: 'drop', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 1.1, kind: 'puff', actor: 'turtle', dur: 0.4 },
    { at: 1.6, kind: 'zzz', actor: 'turtle', dx: -8, dur: 5.0 },
    { at: 2.4, kind: 'burst', actor: 'gem', emoji: '✨', n: 5, dur: 0.6 },
    { at: 3.1, kind: 'bubble', actor: 'crab', emoji: '💎', dur: 0.7 },
    { at: 4.35, kind: 'pop', actor: 'crab', emoji: '😑', dx: 8, dur: 0.5 },
    { at: 5.55, kind: 'burst', actor: 'bubble', emoji: '🫧', n: 8, dur: 0.6 },
    { at: 6.0, kind: 'pop', actor: 'crab', emoji: '❓', dx: 8, dur: 0.5 },
    { at: 6.8, kind: 'dizzy', actor: 'crab', dur: 0.9 },
    { at: 6.5, kind: 'rain', actor: 'fish', emoji: '💎', n: 8, dur: 0.9 },
    { at: 7.2, kind: 'burst', actor: 'crown', emoji: '✨', n: 8, dur: 0.8 },
    { at: 7.3, kind: 'pop', actor: 'turtle', emoji: '❗', dx: -12, dur: 0.4 },
    { at: 7.6, kind: 'burst', actor: 'turtle', emoji: '🎉', n: 9, dur: 1.0 },
    { at: 8.3, kind: 'pop', actor: 'crab', emoji: '💕', dx: 6, dur: 0.6 },
  ],
  camera: [
    { at: 5.0, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 64, y: 45 } },
    { at: 5.55, dur: 0.3, do: 'shake', amount: 1 },
    { at: 5.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 6.8, dur: 0.35, do: 'shake', amount: 1.5 },
    { at: 7.4, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 74, y: 58 } },
  ],
  lights: [
    { at: 1.6, dur: 0.6, level: 0.25 },
    { at: 5.5, dur: 0.05, level: -0.35 },
    { at: 5.55, dur: 0.4, level: 0.25 },
    { at: 7.2, dur: 0.5, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 1.3, sfx: 'gulp' },
    { at: 1.8, sfx: 'bubble' },
    { at: 3.1, sfx: 'blip' },
    { at: 3.85, sfx: 'boing' },
    { at: 5.3, sfx: 'boing' },
    { at: 5.55, sfx: 'poof' },
    { at: 6.5, sfx: 'clink' },
    { at: 6.8, sfx: 'bonk' },
    { at: 7.1, sfx: 'clink' },
    { at: 7.45, say: '寶可夢' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
