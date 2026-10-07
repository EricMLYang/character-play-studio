import type { Clip } from '../clip'

// 鼻：大象湊過去聞花，一隻蜜蜂從花裡飛出來鑽進牠鼻子。「哈……」——沒打出來；「哈……哈……」——哈啾！
// 蜜蜂像火箭一樣被噴飛，花也被吹走變成「鼻」，大象自己往後退。鼻涕垂下來，牠又吸回去。蜜蜂氣沖沖飛回來又鑽進去……鼻、鼻、鼻涕
const clip: Clip = {
  char: '鼻',
  meta: { theme: '動物（大象）', cast: '大象＋蜜蜂＋花', gags: ['假警報', '超大噴嚏', '鼻涕吸回去', '又來了'] },
  duration: 10,
  bg: { top: '#F6FFE8', bottom: '#E0F3C6', floor: '#B4DB8A', scenery: 'forest' },
  actors: [
    { id: 'flower', emoji: '🌻', x: 52, y: 73.2, size: 9, hidden: true },
    { id: 'ele', emoji: '🐘', x: 30, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'bee', emoji: '🐝', x: 52, y: 64, size: 5, hidden: true, float: true },
    { id: 'drip', emoji: '💧', x: 30, y: 72, size: 4, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'flower', do: 'pop' },
    { at: 0, actor: 'ele', do: 'enter', dur: 0.7 },
    { at: 0, actor: 'ele', do: 'bounce', dur: 0.7, times: 2, amount: 1.5 },
    // 湊過去聞
    { at: 1.3, actor: 'ele', do: 'tilt', amount: 12, dur: 0.6 },
    // 蜜蜂飛出來，鑽進鼻子
    { at: 2.0, actor: 'bee', do: 'pop' },
    { at: 2.2, actor: 'bee', do: 'moveTo', to: { x: 41, y: 70 }, dur: 0.3, arc: 4 },
    { at: 2.5, actor: 'bee', do: 'vanish', dur: 0.08 },
    // 哈……（沒打出來）
    { at: 2.9, actor: 'ele', do: 'squash', amount: -0.3, dur: 0.6 },
    // 哈……哈……哈啾！
    { at: 3.9, actor: 'ele', do: 'squash', amount: -0.38, dur: 0.6 },
    { at: 4.5, actor: 'ele', do: 'squash', amount: 0.45, dur: 0.3 },
    { at: 4.5, actor: 'ele', do: 'moveTo', to: { x: 20, y: 68.6 }, dur: 0.3 },
    { at: 4.5, actor: 'bee', do: 'pop', dur: 0.05 },
    { at: 4.5, actor: 'bee', do: 'moveTo', to: { x: 180, y: 34 }, dur: 0.4 },
    { at: 4.5, actor: 'bee', do: 'spin', dur: 0.4, times: 3 },
    { at: 4.5, actor: 'flower', do: 'moveTo', to: { x: 80, y: 40 }, dur: 0.25 },
    { at: 4.5, actor: 'flower', do: 'spin', dur: 0.25 },
    { at: 4.75, actor: 'flower', do: 'vanish', dur: 0.1 },
    // 鼻涕垂下來……吸回去
    { at: 6.3, actor: 'drip', do: 'pop' },
    { at: 6.4, actor: 'drip', do: 'bounce', dur: 0.6, times: 2, amount: -1.5 },
    { at: 7.1, actor: 'ele', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 7.1, actor: 'drip', do: 'moveTo', to: { x: 25, y: 69 }, dur: 0.2 },
    { at: 7.3, actor: 'drip', do: 'vanish', dur: 0.05 },
    // 蜜蜂氣沖沖飛回來，又鑽進去
    { at: 8.0, actor: 'bee', do: 'moveTo', to: { x: 58, y: 52 }, dur: 0.01 },
    { at: 8.0, actor: 'bee', do: 'enter', from: { x: 175, y: 30 }, dur: 0.6 },
    { at: 8.7, actor: 'bee', do: 'moveTo', to: { x: 31, y: 70 }, dur: 0.25 },
    { at: 8.95, actor: 'bee', do: 'vanish', dur: 0.05 },
    { at: 9.0, actor: 'ele', do: 'squash', amount: -0.3, dur: 0.6 },
    { at: 9.6, actor: 'bee', do: 'pop', dur: 0.05 },
    { at: 9.6, actor: 'bee', do: 'moveTo', to: { x: 44, y: 46 }, dur: 0.35 },
  ],
  builds: [
    // 吹飛的花 → 自；噴飛的蜜蜂軌跡 → 田；大象往後退 → 下面的丌
    { at: 4.75, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: { x: 80, y: 40 }, color: '#E89A1E' },
    { at: 5.0, dur: 0.6, strokes: [6, 7, 8, 9, 10], from: { x: 130, y: 40 }, color: '#7C55C9' },
    { at: 5.3, dur: 0.5, strokes: [11, 12, 13], from: 'ele', color: '#7C55C9' },
  ],
  glyph: [{ at: 5.9, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'ele', emoji: '🌻', dur: 0.6 },
    { at: 2.5, kind: 'pop', actor: 'ele', emoji: '❗', dur: 0.4 },
    { at: 3.5, kind: 'bubble', actor: 'ele', emoji: '😮', dur: 0.4 },
    { at: 4.5, kind: 'burst', actor: 'ele', emoji: '💦', n: 8, dur: 0.6, dx: 10, dy: 14 },
    { at: 7.4, kind: 'bubble', actor: 'ele', emoji: '😋', dur: 0.6 },
    { at: 8.0, kind: 'pop', actor: 'bee', emoji: '💢', dur: 0.6 },
    { at: 9.65, kind: 'bubble', actor: 'ele', emoji: '😅', dur: 0.35 },
  ],
  camera: [
    { at: 4.5, dur: 0.45, do: 'shake', amount: 2.2 },
    { at: 9.0, dur: 1.0, do: 'punch', amount: 0.2, to: { x: 30, y: 62 } },
  ],
  cues: [
    { at: 1.5, say: '鼻' },
    { at: 2.2, sfx: 'whoosh' },
    { at: 2.9, sfx: 'slide' },
    { at: 3.5, sfx: 'deflate' },
    { at: 4.0, sfx: 'achoo' },
    { at: 4.55, sfx: 'whoosh' },
    { at: 5.9, say: '鼻' },
    { at: 6.85, say: '鼻涕' },
    { at: 7.1, sfx: 'slide' },
    { at: 8.95, sfx: 'slide' },
    { at: 9.6, sfx: 'blip' },
  ],
}

export default clip
