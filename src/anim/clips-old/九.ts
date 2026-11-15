import type { Clip, Move } from '../clip'

// 九：玩具海盜拿金幣給鸚鵡看，鸚鵡一口叼走飛掉。海盜拖著紅繩繞圈追，被自己的木腳絆倒翻跟斗，再繞更大圈；
// 最後飛撲趴地，紅繩一拉緊變成長長的彎鉤，望遠鏡彈出來斜斜一躺——「九」。鸚鵡偏偏停在他眼睛上，九塊積木排隊報數；結尾鸚鵡又把金幣叼走。九、九、九個
const PARROT_Y = 3 // 金幣叼在鸚鵡嘴下
const carry = (ms: Move[]): Move[] => ms.flatMap((m) => [m, { ...m, actor: 'coin', to: m.to && { x: m.to.x - 3, y: m.to.y + PARROT_Y } }])
const BRICKS = [116, 120, 124, 128, 132, 136, 140, 144, 148]

const clip: Clip = {
  char: '九',
  meta: { theme: '海盜追鸚鵡', cast: '玩具海盜＋鸚鵡＋金幣＋紅繩＋九塊積木', gags: ['繞圈追越繞越大', '被自己木腳絆倒翻跟斗', '飛撲趴地拉直繩子', '鸚鵡停在眼睛上', '回馬槍又叼走金幣'] },
  duration: 10,
  bg: { top: '#FFF3DC', bottom: '#F6E3BE', floor: '#E2C893', scenery: 'sea' },
  actors: [
    ...BRICKS.map((x, i) => ({ id: `b${i}`, emoji: '🧱', x, y: 75, size: 5, hidden: true })),
    { id: 'spy', emoji: '🔭', x: 44, y: 70, size: 7, hidden: true },
    { id: 'pirate', emoji: 'hero:pirate/treasure', x: 24, y: 71.1, size: 14, flip: true },
    { id: 'parrot', emoji: '🦜', x: 44, y: 48, size: 9, float: true },
    { id: 'coin', emoji: '🪙', x: 31, y: 60, size: 5, float: true },
  ],
  moves: [
    // 金幣給鸚鵡看——被叼走
    { at: 0.2, actor: 'pirate', do: 'hop', amount: 3, dur: 0.35 },
    { at: 0.85, actor: 'parrot', do: 'moveTo', to: { x: 34, y: 57 }, dur: 0.2, ease: 'in' },
    ...carry([{ at: 1.05, actor: 'parrot', do: 'moveTo', to: { x: 120, y: 38 }, dur: 0.35, ease: 'out' }]),
    { at: 1.1, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    // 追！
    { at: 1.6, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 1.6, actor: 'pirate', do: 'moveTo', to: { x: 104, y: 71.1 }, dur: 0.55, anticipate: 3, ease: 'in' },
    ...carry([{ at: 1.9, actor: 'parrot', do: 'moveTo', to: { x: 46, y: 30 }, dur: 0.3 }]),
    { at: 2.2, actor: 'pirate', do: 'flip' },
    { at: 2.25, actor: 'pirate', do: 'moveTo', to: { x: 50, y: 71.1 }, dur: 0.4 },
    ...carry([{ at: 2.5, actor: 'parrot', do: 'moveTo', to: { x: 116, y: 34 }, dur: 0.3 }]),
    // 被自己的木腳絆倒，翻個跟斗
    { at: 2.65, actor: 'pirate', do: 'moveTo', to: { x: 36, y: 71.1 }, arc: 8, dur: 0.45 },
    { at: 2.65, actor: 'pirate', do: 'spin', times: -1, dur: 0.45 },
    { at: 2.65, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 3.15, actor: 'pirate', do: 'squash', amount: 0.3, dur: 0.25 },
    // 爬起來繞更大圈
    { at: 3.4, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 3.4, actor: 'pirate', do: 'flip' },
    { at: 3.45, actor: 'pirate', do: 'moveTo', to: { x: 140, y: 71.1 }, dur: 0.45, ease: 'in' },
    ...carry([{ at: 3.5, actor: 'parrot', do: 'moveTo', to: { x: 80, y: 26 }, dur: 0.35 }]),
    { at: 3.9, actor: 'pirate', do: 'flip' },
    { at: 3.95, actor: 'pirate', do: 'moveTo', to: { x: 20, y: 71.1 }, dur: 0.45, ease: 'in' },
    { at: 3.9, actor: 'parrot', do: 'bounce', amount: 2, times: 3, dur: 1.2 },
    { at: 3.9, actor: 'coin', do: 'bounce', amount: 2, times: 3, dur: 1.2 },
    // 蹲低、手指蠕動——飛撲
    { at: 4.4, actor: 'pirate', do: 'flip' },
    { at: 4.45, actor: 'pirate', do: 'squash', amount: 0.35, dur: 0.5 },
    { at: 4.45, actor: 'pirate', do: 'shake', amount: 0.6, dur: 0.5 },
    { at: 4.95, actor: 'pirate', do: 'moveTo', to: { x: 44, y: 71.1 }, arc: 14, dur: 0.35, ease: 'out' },
    { at: 5.25, actor: 'pirate', do: 'rotateTo', amount: 80, dur: 0.1 },
    { at: 5.3, actor: 'pirate', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 5.3, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    // 望遠鏡從腰帶彈出來，翻一圈
    { at: 5.35, actor: 'spy', do: 'pop', dur: 0.2 },
    { at: 5.35, actor: 'spy', do: 'moveTo', to: { x: 56, y: 44 }, dur: 0.3, ease: 'out' },
    { at: 5.35, actor: 'spy', do: 'spin', dur: 0.3 },
    { at: 5.65, actor: 'spy', do: 'vanish', dur: 0.15 },
    // 鸚鵡停在最糟的地方：眼睛上；金幣掉到鼻子
    ...carry([{ at: 6.0, actor: 'parrot', do: 'moveTo', to: { x: 50, y: 65 }, dur: 0.4, ease: 'bounce' }]),
    { at: 6.4, actor: 'coin', do: 'moveTo', to: { x: 52, y: 71 }, dur: 0.25, ease: 'bounce' },
    // 坐起來，鸚鵡還黏在眼睛上
    { at: 6.75, actor: 'pirate', do: 'rotateTo', amount: -80, dur: 0.3 },
    { at: 6.75, actor: 'parrot', do: 'moveTo', to: { x: 44, y: 62 }, dur: 0.3 },
    { at: 6.75, actor: 'coin', do: 'moveTo', to: { x: 41, y: 68 }, dur: 0.3 },
    { at: 7.05, actor: 'pirate', do: 'shake', amount: 1, dur: 0.4 },
    // 九塊積木排隊進場報數
    ...BRICKS.map((_, i) => ({ at: 7.1 + i * 0.03, actor: `b${i}`, do: 'enter' as const, from: { x: 172 + i * 4, y: 75 }, dur: 0.4, ease: 'out' as const })),
    ...BRICKS.map((_, i) => ({ at: 7.55 + i * 0.09, actor: `b${i}`, do: 'hop' as const, amount: 3, dur: 0.22 })),
    // 把鸚鵡從眼睛上抱開，開心——鸚鵡又叼走金幣！
    { at: 8.35, actor: 'parrot', do: 'moveTo', to: { x: 48, y: 50 }, dur: 0.25, ease: 'out' },
    { at: 8.35, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 8.7, actor: 'parrot', do: 'moveTo', to: { x: 43, y: 65 }, dur: 0.15, ease: 'in' },
    ...carry([{ at: 8.9, actor: 'parrot', do: 'moveTo', to: { x: 14, y: 26 }, dur: 0.35, ease: 'out' }]),
    { at: 8.95, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 9.3, actor: 'pirate', do: 'hop', amount: 4, dur: 0.3 },
    { at: 9.5, actor: 'b8', do: 'rotateTo', amount: 90, dur: 0.25, ease: 'bounce' },
  ],
  builds: [
    // 繩子一拉緊 → 長長的彎鉤；望遠鏡斜斜一躺 → 撇
    { at: 5.3, dur: 0.4, strokes: [1], from: 'pirate', color: '#E03131' },
    { at: 5.65, dur: 0.35, strokes: [0], from: 'spy', color: '#C2255C' },
  ],
  glyph: [{ at: 6.05, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'pop', actor: 'pirate', emoji: '😎', dur: 0.5 },
    { at: 0.5, kind: 'pop', actor: 'parrot', emoji: '👀', dur: 0.4 },
    { at: 1.15, kind: 'pop', actor: 'pirate', emoji: '❗', dur: 0.5 },
    // 紅繩從腰帶拖在身後
    { at: 1.6, dur: 3.6, kind: 'line', actor: 'pirate', dy: 2, to: { x: 10, y: 73 }, color: '#E03131', width: 1.4 },
    { at: 1.6, kind: 'puff', actor: 'pirate', dur: 0.4 },
    { at: 3.15, kind: 'dizzy', actor: 'pirate', dur: 0.4 },
    { at: 3.95, kind: 'pop', actor: 'parrot', emoji: '😏', dx: -10, dur: 0.6 },
    { at: 4.5, kind: 'sweat', actor: 'pirate', dur: 0.5 },
    { at: 5.3, kind: 'burst', actor: 'pirate', dur: 0.4 },
    { at: 5.3, kind: 'puff', actor: 'pirate', dur: 0.5 },
    { at: 7.1, kind: 'pop', actor: 'pirate', emoji: '❓', dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'pirate', emoji: '💢', dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'parrot', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    // 繞圈追的時候跟拍，蹲低時推近，飛撲前回全景
    { at: 1.6, dur: 0.3, do: 'follow', actor: 'pirate', amount: 1.25 },
    { at: 4.0, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.45, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 24, y: 64 } },
    { at: 5.3, dur: 0.35, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 1.05, sfx: 'whoosh' },
    { at: 1.6, say: '九' },
    { at: 2.25, sfx: 'slide' },
    { at: 2.65, sfx: 'bonk' },
    { at: 3.45, sfx: 'whoosh' },
    { at: 4.95, sfx: 'whoosh' },
    { at: 5.3, sfx: 'plop' },
    { at: 6.1, say: '九' },
    { at: 6.4, sfx: 'clink' },
    { at: 7.6, say: '九個' },
    { at: 8.9, sfx: 'whoosh' },
    { at: 9.5, sfx: 'tap' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
