import type { Clip } from '../clip'

// 豆：小外星人開飛碟要抓木箱上的豆子，牽引光束卻吸到箱蓋；豆子溜走，飛碟追著滿場繞，光束吸到椅子、還把自己吸上去吊著。
// 最後飛碟肚皮著地「碰」：木箱變口、箱蓋變上面一橫、兩顆豆子變兩點、滑痕變底下一橫，成了「豆」。光束終於吸對東西——一杯豆漿，豆子還跳進去游泳。豆、豆、豆漿
const clip: Clip = {
  char: '豆',
  meta: { theme: '太空飛碟抓豆子', cast: '小外星人＋飛碟＋逃跑的豆子＋木箱', gags: ['光束一直吸錯', '把自己吸起來', '肚皮著地', '豆子跳進豆漿回馬槍'] },
  duration: 10,
  bg: { top: '#1F2550', bottom: '#3A3F7A', floor: '#6B5B95', scenery: 'space' },
  actors: [
    { id: 'stool', emoji: '🪑', x: 60, y: 73, size: 9 },
    { id: 'crate', emoji: '📦', x: 120, y: 72.8, size: 10 },
    { id: 'lid', emoji: '🟫', x: 120, y: 66.5, size: 5 },
    { id: 'bean', emoji: '🫘', x: 120, y: 62.5, size: 5 },
    { id: 'bean2', emoji: '🫘', x: 120, y: 70, size: 5, hidden: true },
    { id: 'milk', emoji: '🥛', x: -12, y: 70, size: 8, float: true },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 112, y: 40, size: 14, float: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'alien', do: 'enter', from: { x: -20, y: 30 }, dur: 0.7, ease: 'out' },
    // 光束吸錯：箱蓋飛起來
    { at: 0.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 1.0, actor: 'lid', do: 'moveTo', to: { x: 116, y: 52 }, dur: 0.35, ease: 'out' },
    // 豆子跳下來溜走
    { at: 1.2, actor: 'bean', do: 'hop', amount: 4, dur: 0.25 },
    { at: 1.45, actor: 'bean', do: 'moveTo', to: { x: 58, y: 75 }, arc: 5, dur: 0.4, ease: 'in' },
    { at: 1.5, actor: 'lid', do: 'moveTo', to: { x: 120, y: 66.5 }, dur: 0.3, ease: 'bounce' },
    { at: 1.5, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    // 追！豆子之字形亂竄，飛碟越繞越大圈
    { at: 1.6, actor: 'alien', do: 'moveTo', to: { x: 62, y: 42 }, dur: 0.35, ease: 'in' },
    { at: 1.6, actor: 'alien', do: 'tilt', amount: -15, dur: 0.35 },
    { at: 1.9, actor: 'bean', do: 'moveTo', to: { x: 30, y: 75 }, arc: 4, dur: 0.3 },
    { at: 2.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 2.05, actor: 'stool', do: 'moveTo', to: { x: 60, y: 56 }, dur: 0.3, ease: 'out' },
    { at: 2.4, actor: 'stool', do: 'moveTo', to: { x: 60, y: 73 }, dur: 0.3, ease: 'bounce' },
    { at: 2.3, actor: 'bean', do: 'moveTo', to: { x: 92, y: 75 }, arc: 6, dur: 0.35 },
    // 光束把自己吸上去，吊在半空一拍
    { at: 2.75, actor: 'alien', do: 'moveTo', to: { x: 62, y: 22 }, dur: 0.3, ease: 'out' },
    { at: 2.75, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 3.4, actor: 'alien', do: 'moveTo', to: { x: 62, y: 42 }, dur: 0.3, ease: 'bounce' },
    { at: 3.7, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.3 },
    // 退到最右邊，催油門，飛撲
    { at: 4.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    { at: 4.0, actor: 'alien', do: 'moveTo', to: { x: 146, y: 38 }, dur: 0.4, ease: 'out' },
    { at: 4.0, actor: 'bean', do: 'moveTo', to: { x: 78, y: 75 }, dur: 0.3 },
    { at: 4.45, actor: 'alien', do: 'shake', amount: 1, dur: 0.3 },
    { at: 4.8, actor: 'alien', do: 'moveTo', to: { x: 82, y: 69 }, dur: 0.3, anticipate: 4, ease: 'in' },
    { at: 4.95, actor: 'bean', do: 'moveTo', to: { x: 96, y: 75 }, arc: 8, dur: 0.2 },
    // 碰！肚皮著地，一路滑到左邊
    { at: 5.1, actor: 'alien', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 5.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 5.15, actor: 'alien', do: 'moveTo', to: { x: 34, y: 69 }, dur: 0.45, ease: 'out' },
    { at: 5.15, actor: 'bean2', do: 'pop', dur: 0.15 },
    { at: 5.2, actor: 'crate', do: 'vanish', dur: 0.15 },
    { at: 5.55, actor: 'lid', do: 'vanish', dur: 0.15 },
    { at: 5.85, actor: 'bean2', do: 'vanish', dur: 0.15 },
    // 豆子得意地跳到他頭上
    { at: 5.7, actor: 'bean', do: 'moveTo', to: { x: 34, y: 60 }, arc: 14, dur: 0.45 },
    // 光束終於吸對：一杯豆漿飄進來
    { at: 6.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 6.6, actor: 'alien', do: 'moveTo', to: { x: 30, y: 46 }, dur: 0.35 },
    { at: 6.6, actor: 'bean', do: 'moveTo', to: { x: 30, y: 37 }, dur: 0.35 },
    { at: 6.8, actor: 'milk', do: 'moveTo', to: { x: 30, y: 62 }, dur: 0.6, ease: 'out' },
    { at: 7.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.7, actor: 'milk', do: 'tilt', amount: -12, dur: 0.5 },
    // 回馬槍：豆子從頭上跳進杯子裡游泳
    { at: 8.3, actor: 'bean', do: 'moveTo', to: { x: 30, y: 57 }, arc: 8, dur: 0.35, ease: 'in' },
    { at: 8.65, actor: 'milk', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
    { at: 8.9, actor: 'bean', do: 'bounce', amount: 1.5, times: 2, dur: 0.6 },
  ],
  builds: [
    // 木箱變口、箱蓋變上面一橫、兩顆豆子變兩點、滑痕變底下一橫
    { at: 5.2, dur: 0.35, strokes: [1, 2, 3], from: 'crate', color: '#8B5A2B' },
    { at: 5.55, dur: 0.25, strokes: [0], from: 'lid', color: '#8B5A2B' },
    { at: 5.8, dur: 0.25, strokes: [4, 5], from: 'bean2', color: '#A0522D' },
    { at: 6.05, dur: 0.3, strokes: [6], from: 'alien', color: '#8B5A2B' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.85, kind: 'pop', actor: 'alien', emoji: '👉', dur: 0.4 },
    { at: 0.95, kind: 'beam', actor: 'alien', n: 10, dur: 0.55 },
    { at: 1.25, kind: 'pop', actor: 'bean', emoji: '😜', dur: 0.4 },
    { at: 2.0, kind: 'beam', actor: 'alien', n: 10, dur: 0.45 },
    { at: 2.7, kind: 'beam', actor: 'alien', n: 8, dur: 0.7 },
    { at: 2.9, kind: 'pop', actor: 'alien', emoji: '😳', dur: 0.5 },
    { at: 3.7, kind: 'pop', actor: 'alien', emoji: '💢', dur: 0.4 },
    { at: 4.45, kind: 'puff', actor: 'alien', dur: 0.3 },
    { at: 5.1, kind: 'burst', actor: 'alien', n: 1, dur: 0.4 },
    { at: 5.15, kind: 'puff', actor: 'alien', dur: 0.5 },
    { at: 5.6, kind: 'dizzy', actor: 'alien', dur: 0.9 },
    { at: 6.75, kind: 'beam', actor: 'alien', n: 12, dur: 0.9 },
    { at: 7.7, kind: 'pop', actor: 'alien', emoji: '😋', dur: 0.5, dx: 6 },
    { at: 8.65, kind: 'burst', actor: 'milk', emoji: '💦', n: 4, dur: 0.4 },
    { at: 9.0, kind: 'pop', actor: 'bean', emoji: '😁', dur: 0.5, dx: 6 },
  ],
  camera: [
    { at: 1.6, dur: 0.3, do: 'follow', actor: 'alien', amount: 1.25 },
    { at: 3.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.1, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 0.95, sfx: 'laser' },
    { at: 1.3, say: '豆' },
    { at: 2.0, sfx: 'laser' },
    { at: 2.7, sfx: 'laser' },
    { at: 3.4, sfx: 'plop' },
    { at: 4.8, sfx: 'whoosh' },
    { at: 5.1, sfx: 'bonk' },
    { at: 5.15, sfx: 'slide' },
    { at: 6.4, say: '豆' },
    { at: 7.4, say: '豆漿' },
    { at: 7.7, sfx: 'gulp' },
    { at: 8.65, sfx: 'splash' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
