// 演的是字面意思：怪傑（怪怪的傢伙）——一個愛惡作劇的海盜在沙灘挖洞設陷阱、放甜甜圈當誘餌，結果自己掉進去（沒有戴面具披風的狐狸、沒有野豬雙胞胎）。
import { scene } from '../../story/scene'

// 中午的海邊：海盜扛著一把葉子走過來，往沙灘上的洞一蓋、上面擺一個甜甜圈，搓搓手，躲到大石頭後面拿望遠鏡偷看。
// 螃蟹橫著走過來，聞一聞……走到洞邊……停一拍……沒踩上去，用鉗子把甜甜圈夾走了。
// 海盜氣呼呼地衝出來要看陷阱——一腳踩在葉子上，咻！整個人掉進洞裡，葉子滿天飛。
// 洞裡安靜了一下……砰！他從洞裡跳出來，頭上頂著一片葉子，若無其事擺姿勢，好像是故意的：「怪傑佐羅力」。螃蟹邊吃甜甜圈邊翻白眼。
const P = 22 // 海盜
const G = 77 - 0.42 * P
const HOLE = { x: 92, y: 74.5 }
const RX = 44 // 大石頭
const C = 12 // 螃蟹
const CG = 77 - 0.42 * C
const LEAF = { x: 83, y: 52 } // 葉子掉在海盜頭上（用格子量過）

export default scene({
  duration: 9.6,
  bg: { top: '#8ED8FF', bottom: '#E6F7FF', floor: '#F3DDA4', scenery: 'sea' },
  actors: [
    { id: 'palm', emoji: '🌴', x: 146, y: 77 - 0.42 * 32, size: 32 },
    { id: 'shell', emoji: '🐚', x: 124, y: 77 - 0.42 * 7, size: 7 },
    { id: 'hole', emoji: '🕳️', x: HOLE.x, y: HOLE.y, size: 20, float: true },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 74, y: G, size: P },
    { id: 'rock', emoji: '🪨', x: RX, y: 77 - 0.42 * 22, size: 22 },
    { id: 'l1', emoji: '🍃', x: HOLE.x - 6, y: 72.5, size: 9, hidden: true, float: true, pivot: 'center' },
    { id: 'l2', emoji: '🍃', x: HOLE.x + 1, y: 73, size: 10, hidden: true, float: true, pivot: 'center' },
    { id: 'l3', emoji: '🍃', x: HOLE.x + 7, y: 72.5, size: 9, hidden: true, float: true, pivot: 'center' },
    { id: 'donut', emoji: '🍩', x: HOLE.x, y: 70, size: 8, hidden: true, float: true },
    { id: 'crab', emoji: '🦀', x: 186, y: CG, size: C },
  ],
  moves: [
    // ① 走過來，蓋葉子、擺甜甜圈
    { at: 0, actor: 'pirate', do: 'enter', from: { x: -14, y: G }, dur: 0.85, ease: 'out' },
    { at: 0.95, actor: 'pirate', do: 'tilt', amount: 14, dur: 0.25 },
    { at: 1.0, actor: 'l1', do: 'pop', dur: 0.2 },
    { at: 1.15, actor: 'pirate', do: 'tilt', amount: 14, dur: 0.25 },
    { at: 1.2, actor: 'l2', do: 'pop', dur: 0.2 },
    { at: 1.35, actor: 'pirate', do: 'tilt', amount: 14, dur: 0.25 },
    { at: 1.4, actor: 'l3', do: 'pop', dur: 0.2 },
    { at: 1.65, actor: 'donut', do: 'drop', dur: 0.3 },
    { at: 2.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 2.0, actor: 'pirate', do: 'shake', amount: 0.6, dur: 0.3 },
    // 躲到大石頭後面，拿望遠鏡偷看
    { at: 2.35, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 2.35, actor: 'pirate', do: 'moveTo', to: { x: RX - 2, y: G }, dur: 0.45, ease: 'in' },
    { at: 2.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/telescope' },
    { at: 2.8, actor: 'pirate', do: 'flip' },
    // ② 螃蟹橫著走過來，聞一聞
    { at: 2.6, actor: 'crab', do: 'moveTo', to: { x: 110, y: CG }, dur: 1.0, ease: 'out' },
    { at: 3.7, actor: 'crab', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: 3.95, actor: 'crab', do: 'hop', amount: 1.5, dur: 0.2 },
    // 停一拍……沒踩上去，鉗子把甜甜圈夾走
    { at: 4.45, actor: 'donut', do: 'moveTo', to: { x: 108, y: CG - 8 }, arc: 4, dur: 0.3, ease: 'out' },
    { at: 4.45, actor: 'crab', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 4.85, actor: 'crab', do: 'moveTo', to: { x: 126, y: CG }, dur: 0.4 },
    { at: 4.85, actor: 'donut', do: 'moveTo', to: { x: 124, y: CG - 8 }, dur: 0.4 },
    // ③ 海盜氣呼呼衝出來——一腳踩空，掉進洞裡
    { at: 5.0, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 5.0, actor: 'pirate', do: 'flip' },
    { at: 5.1, actor: 'pirate', do: 'moveTo', to: { x: HOLE.x, y: G }, dur: 0.5, ease: 'in', anticipate: 3 },
    { at: 5.6, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 5.7, actor: 'pirate', do: 'moveTo', to: { x: HOLE.x, y: HOLE.y + 1 }, dur: 0.2, ease: 'in' },
    { at: 5.7, actor: 'pirate', do: 'scaleTo', amount: 0.05, dur: 0.2, ease: 'in' },
    { at: 5.6, actor: 'l1', do: 'moveTo', to: { x: 70, y: 30 }, dur: 0.5, ease: 'out' },
    { at: 5.6, actor: 'l1', do: 'spin', times: 2, dur: 0.6 },
    { at: 5.6, actor: 'l2', do: 'moveTo', to: { x: 94, y: 22 }, dur: 0.55, ease: 'out' },
    { at: 5.6, actor: 'l2', do: 'spin', times: -2, dur: 0.6 },
    { at: 5.6, actor: 'l3', do: 'moveTo', to: { x: 116, y: 32 }, dur: 0.5, ease: 'out' },
    { at: 5.6, actor: 'l3', do: 'spin', times: 2, dur: 0.6 },
    { at: 6.15, actor: 'l1', do: 'moveTo', to: { x: 64, y: 72 }, dur: 0.9, ease: 'inOut' },
    { at: 6.15, actor: 'l3', do: 'moveTo', to: { x: 122, y: 72 }, dur: 0.9, ease: 'inOut' },
    // 停一拍：螃蟹探頭看洞
    { at: 6.0, actor: 'crab', do: 'moveTo', to: { x: 108, y: CG }, dur: 0.35 },
    { at: 6.0, actor: 'donut', do: 'moveTo', to: { x: 106, y: CG - 8 }, dur: 0.35 },
    { at: 6.35, actor: 'crab', do: 'tilt', amount: -16, dur: 0.4 },
    // ④ 砰！跳出來，頭上頂著一片葉子，擺姿勢
    { at: 6.75, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 6.75, actor: 'pirate', do: 'scaleTo', amount: 28, dur: 0.3, ease: 'back' },
    { at: 6.75, actor: 'pirate', do: 'moveTo', to: { x: 80, y: G }, arc: 18, dur: 0.45, ease: 'out' },
    { at: 6.75, actor: 'pirate', do: 'spin', times: 1, dur: 0.45, pivot: 'center' },
    { at: 6.75, actor: 'l2', do: 'moveTo', to: LEAF, dur: 0.5, ease: 'bounce' },
    { at: 6.8, actor: 'crab', do: 'moveTo', to: { x: 112, y: CG }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 6.8, actor: 'donut', do: 'moveTo', to: { x: 110, y: CG - 8 }, arc: 6, dur: 0.3, ease: 'out' },
    { at: 7.25, actor: 'pirate', do: 'hop', amount: 2, dur: 0.25 },
    { at: 7.25, actor: 'l2', do: 'hop', amount: 2, dur: 0.25 },
    // ⑤ 螃蟹邊吃邊翻白眼
    { at: 8.1, actor: 'donut', do: 'scaleTo', amount: 0.7, dur: 0.2 },
    { at: 8.5, actor: 'donut', do: 'scaleTo', amount: 0.6, dur: 0.2 },
    { at: 8.3, actor: 'pirate', do: 'tilt', amount: -8, dur: 0.4 },
    { at: 8.3, actor: 'l2', do: 'tilt', amount: -8, dur: 0.4 },
  ],
  fx: [
    { at: 0.1, kind: 'puff', actor: 'pirate', dur: 0.5 },
    { at: 1.65, kind: 'burst', actor: 'donut', emoji: '✨', n: 5, dur: 0.6 },
    { at: 2.05, kind: 'pop', actor: 'pirate', emoji: '😆', dx: 9, dur: 0.6 },
    { at: 3.6, kind: 'pop', actor: 'crab', emoji: '👀', dur: 0.6 },
    { at: 4.2, kind: 'sweat', actor: 'pirate' },
    { at: 4.6, kind: 'pop', actor: 'pirate', emoji: '❓', dx: 6, dur: 0.6 },
    { at: 4.6, kind: 'pop', actor: 'crab', emoji: '😋', dur: 0.6 },
    { at: 5.05, kind: 'pop', actor: 'pirate', emoji: '💢', dx: 8, dur: 0.5 },
    { at: 5.15, kind: 'puff', actor: 'pirate', n: 8, dur: 0.5 },
    { at: 5.75, kind: 'puff', actor: 'hole', n: 16, dur: 0.8 },
    { at: 6.4, kind: 'pop', actor: 'crab', emoji: '❓', dur: 0.5 },
    { at: 6.75, kind: 'burst', actor: 'hole', n: 1, dur: 0.4 },
    { at: 7.2, kind: 'burst', actor: 'pirate', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.8, kind: 'pop', actor: 'crab', emoji: '🙄', dur: 0.8 },
    { at: 8.3, kind: 'burst', actor: 'pirate', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 3.4, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: 84, y: 56 } },
    { at: 4.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.7, dur: 0.4, do: 'shake', amount: 1.5 },
    { at: 6.75, dur: 0.35, do: 'punch', amount: 0.12, to: { x: 86, y: 55 } },
    { at: 7.1, dur: 0.6, do: 'zoom', amount: 1.5, to: { x: 94, y: 62 } },
  ],
  lights: [
    { at: 5.85, dur: 0.3, level: 0.3 },
    { at: 6.7, dur: 0.05, level: -0.35 },
    { at: 6.75, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.0, sfx: 'tap' },
    { at: 1.4, sfx: 'tap' },
    { at: 1.65, sfx: 'plop' },
    { at: 2.6, sfx: 'slide' },
    { at: 4.45, sfx: 'clink' },
    { at: 5.1, sfx: 'whoosh' },
    { at: 5.7, sfx: 'slide' },
    { at: 5.9, sfx: 'bonk' },
    { at: 6.75, sfx: 'boing' },
    { at: 7.3, say: '怪傑佐羅力' },
    { at: 8.3, sfx: 'cheer' },
  ],
})
