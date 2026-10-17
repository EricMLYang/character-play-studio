import type { Clip } from '../clip'

// 舊：玩具海盜只想用一根手指把舊箱子的蓋子關上，可是鸚鵡偏偏站在蓋子邊，趕走了又跳回同一個地方。海盜眉毛一沉，轉手臂蓄力全力衝鋒——
// 衝過頭飛出畫面，靴子冒煙滑回來；衝過去的風把箱子裡的舊書全掀出來，落成「舊」。最後一根手指輕輕一點，「咔」關上了；撿起一本舊書吹灰，打了個大噴嚏。鸚鵡又跳回蓋子上——蓋子又彈開。舊、舊、舊書
const clip: Clip = {
  char: '舊',
  meta: { theme: '關不上的舊箱子', cast: '玩具海盜＋鸚鵡＋舊箱子＋舊書', gags: ['鸚鵡趕不走', '全力衝鋒衝過頭', '吹灰打噴嚏', '鸚鵡跳回來蓋子又開'] },
  duration: 10,
  bg: { top: '#FCEBCB', bottom: '#FFF7E8', floor: '#C8A27A', scenery: 'room' },
  actors: [
    { id: 'chest', emoji: '📦', x: 130, y: 70, size: 16 },
    { id: 'parrot', emoji: '🦜', x: 132, y: 58, size: 9 },
    { id: 'book', emoji: '📕', x: 147, y: 63, size: 7, hidden: true, float: true },
    { id: 'pirate', emoji: 'hero:pirate/idle', x: 34, y: 71, size: 14, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'pirate', do: 'enter', from: { x: -15, y: 71 }, dur: 0.7, ease: 'out' },
    { at: 0, actor: 'pirate', do: 'bounce', amount: 1.5, times: 3, dur: 0.7 },
    // 揮手趕鸚鵡——牠跳起來又落回同一個地方
    { at: 0.9, actor: 'pirate', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.0, actor: 'parrot', do: 'hop', amount: 7, dur: 0.45 },
    { at: 1.3, actor: 'chest', do: 'shake', amount: 0.8, dur: 0.4 },
    // 眉毛一沉，轉手臂蓄力
    { at: 1.9, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 2.0, actor: 'pirate', do: 'tilt', amount: -10, dur: 0.3 },
    { at: 2.3, actor: 'pirate', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 2.6, actor: 'pirate', do: 'squash', amount: -0.35, dur: 0.3 },
    // 衝！鸚鵡淡定飛起來，海盜衝過頭飛出畫面
    { at: 2.75, actor: 'parrot', do: 'moveTo', to: { x: 132, y: 38 }, dur: 0.3, ease: 'out' },
    { at: 2.9, actor: 'pirate', do: 'moveTo', to: { x: 190, y: 71 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 3.3, actor: 'chest', do: 'squash', amount: -0.3, dur: 0.3 },
    // 靴子冒煙滑回來
    { at: 3.75, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 3.75, actor: 'pirate', do: 'flip' },
    { at: 3.75, actor: 'pirate', do: 'moveTo', to: { x: 148, y: 71 }, dur: 0.55, ease: 'back' },
    { at: 4.3, actor: 'pirate', do: 'squash', amount: 0.3, dur: 0.3 },
    // 踮腳走過去，一根手指輕輕一點——咔，關上了
    { at: 5.3, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 5.3, actor: 'pirate', do: 'moveTo', to: { x: 143, y: 71 }, dur: 0.4 },
    { at: 5.3, actor: 'pirate', do: 'bounce', amount: 1.5, times: 2, dur: 0.4 },
    { at: 5.8, actor: 'chest', do: 'squash', amount: 0.2, dur: 0.2 },
    // 鸚鵡馬上降落在他帽子上
    { at: 6.0, actor: 'parrot', do: 'moveTo', to: { x: 143, y: 61 }, dur: 0.35, arc: 5 },
    { at: 6.35, actor: 'pirate', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 6.35, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    // 撿起一本舊書吹灰——哈啾！
    { at: 6.8, actor: 'book', do: 'pop', dur: 0.25 },
    { at: 6.8, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/treasure' },
    { at: 7.6, actor: 'pirate', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 7.8, actor: 'pirate', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 7.8, actor: 'parrot', do: 'hop', amount: 8, dur: 0.4 },
    { at: 7.8, actor: 'book', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：鸚鵡跳回蓋子上——蓋子又彈開
    { at: 8.3, actor: 'parrot', do: 'moveTo', to: { x: 130, y: 58 }, dur: 0.35, arc: 6 },
    { at: 8.65, actor: 'chest', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 8.7, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 9.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 9.2, actor: 'pirate', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 舊書從箱子裡飛出來：草字頭、中間的鳥、下面的臼
    { at: 3.4, dur: 0.45, strokes: [0, 1, 2, 3], from: 'chest', color: '#1D3A6E' },
    { at: 3.85, dur: 0.8, strokes: [4, 5, 6, 7, 8, 9, 10, 11], from: 'chest', color: '#1D3A6E' },
    { at: 4.65, dur: 0.55, strokes: [12, 13, 14, 15, 16, 17], from: 'chest', color: '#364FC7' },
  ],
  glyph: [{ at: 5.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'pirate', emoji: '☝️', dur: 0.5 },
    { at: 1.3, kind: 'puff', actor: 'chest', dur: 0.5 },
    { at: 1.5, kind: 'pop', actor: 'parrot', emoji: '😛', dur: 0.4 },
    { at: 1.9, kind: 'pop', actor: 'pirate', emoji: '😠', dur: 0.5 },
    { at: 2.6, kind: 'puff', actor: 'pirate', dur: 0.4 },
    { at: 3.3, kind: 'burst', actor: 'chest', emoji: '📚', n: 5, dur: 0.6 },
    { at: 4.15, kind: 'puff', actor: 'pirate', dur: 0.6 },
    { at: 4.0, kind: 'stink', actor: 'pirate', dur: 0.8 },
    { at: 4.4, kind: 'dizzy', actor: 'pirate', dur: 0.8 },
    { at: 5.8, kind: 'pop', actor: 'chest', emoji: '✅', dur: 0.4 },
    { at: 6.4, kind: 'pop', actor: 'pirate', emoji: '❓', dx: -6, dur: 0.4 },
    { at: 7.1, kind: 'puff', actor: 'book', dx: -7, dur: 0.5 },
    { at: 7.8, kind: 'burst', actor: 'pirate', emoji: '💨', n: 4, dur: 0.5 },
    { at: 8.65, kind: 'pop', actor: 'chest', emoji: '❗', dur: 0.4 },
    { at: 8.8, kind: 'sweat', actor: 'pirate' },
  ],
  camera: [
    { at: 2.6, dur: 0.3, do: 'zoom', amount: 1.25, to: { x: 40, y: 60 } },
    { at: 2.95, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.8, dur: 0.4, do: 'punch', amount: 0.08, to: { x: 140, y: 60 } },
  ],
  cues: [
    { at: 1.3, say: '舊' },
    { at: 1.35, sfx: 'tap' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.3, sfx: 'poof' },
    { at: 3.75, sfx: 'slide' },
    { at: 5.4, say: '舊' },
    { at: 5.8, sfx: 'clink' },
    { at: 6.85, say: '舊書' },
    { at: 7.8, sfx: 'achoo' },
    { at: 8.65, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
