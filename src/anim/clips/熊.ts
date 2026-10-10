import type { Clip } from '../clip'

// 熊：刺蝟在營火旁打瞌睡，大熊躡手躡腳來偷蜂蜜，踩到樹枝「喀」！刺蝟拿手電筒轉頭找，大熊每次都閃到牠背後。
// 大熊慌張抓蜂蜜，罐子飛進營火——蜂蜜和火星噴出來變成「熊」。原來帳篷裡還有一隻小熊，早就抱著蜂蜜在偷吃。熊、熊、小熊
const clip: Clip = {
  char: '熊',
  meta: { theme: '露營偷蜂蜜', cast: '大熊＋刺蝟＋小熊', gags: ['其實一直在你後面', '踩到樹枝', '真正的小偷另有其人'] },
  duration: 10,
  bg: { top: '#FFD0A6', bottom: '#FFE2C2', floor: '#7E9E57', scenery: 'forest' },
  actors: [
    { id: 'tent', emoji: '⛺', x: 148, y: 66, size: 25, hidden: true },
    { id: 'cub', emoji: '🐻', x: 142, y: 71.5, size: 12, hidden: true },
    { id: 'jar2', emoji: '🍯', x: 149, y: 70, size: 7, hidden: true, float: true },
    { id: 'fire', emoji: '🔥', x: 100, y: 71, size: 13, hidden: true },
    { id: 'bear', emoji: '🐻', x: 30, y: 68.5, size: 20, hidden: true },
    { id: 'hog', emoji: '🦔', x: 124, y: 71, size: 14, hidden: true, flip: true },
    { id: 'honey', emoji: '🍯', x: 114, y: 72, size: 10, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'tent', do: 'pop' },
    { at: 0, actor: 'fire', do: 'pop' },
    { at: 0.1, actor: 'hog', do: 'pop' },
    { at: 0.15, actor: 'honey', do: 'pop' },
    { at: 0.2, actor: 'bear', do: 'enter', from: { x: -18, y: 68.5 }, dur: 0.9 },
    // 躡手躡腳
    { at: 1.6, actor: 'bear', do: 'moveTo', to: { x: 54, y: 68.5 }, dur: 0.5, arc: 3 },
    { at: 2.2, actor: 'bear', do: 'moveTo', to: { x: 78, y: 68.5 }, dur: 0.5, arc: 3 },
    { at: 2.75, actor: 'bear', do: 'squash', amount: 0.2, dur: 0.25 },
    // 刺蝟轉頭找——大熊閃到牠背後
    { at: 2.95, actor: 'bear', do: 'moveTo', to: { x: 138, y: 68.5 }, dur: 0.15 },
    { at: 3.05, actor: 'hog', do: 'flip' },
    { at: 4.0, actor: 'bear', do: 'moveTo', to: { x: 108, y: 68.5 }, dur: 0.12 },
    { at: 4.05, actor: 'hog', do: 'flip' },
    // 大熊慌了抓蜂蜜，罐子飛進營火
    { at: 4.8, actor: 'honey', do: 'moveTo', to: { x: 110, y: 60 }, dur: 0.15 },
    { at: 4.95, actor: 'bear', do: 'shake', amount: 1.2, dur: 0.3 },
    { at: 5.1, actor: 'hog', do: 'flip' },
    { at: 5.15, actor: 'honey', do: 'moveTo', to: { x: 100, y: 66 }, dur: 0.45, arc: 22 },
    { at: 5.15, actor: 'honey', do: 'spin', times: 2, dur: 0.45 },
    { at: 5.6, actor: 'honey', do: 'vanish', dur: 0.1 },
    { at: 5.6, actor: 'fire', do: 'scaleTo', amount: 2.0, dur: 0.15 },
    { at: 5.6, actor: 'fire', do: 'flash', dur: 0.5 },
    { at: 5.7, actor: 'bear', do: 'moveTo', to: { x: 26, y: 68.5 }, dur: 0.5, arc: 14 },
    { at: 5.7, actor: 'bear', do: 'spin', times: 1, dur: 0.5 },
    { at: 5.7, actor: 'hog', do: 'moveTo', to: { x: 128, y: 71 }, dur: 0.35, arc: 8 },
    { at: 6.4, actor: 'fire', do: 'vanish', dur: 0.4 },
    { at: 6.2, actor: 'bear', do: 'squash', amount: 0.35, dur: 0.3 },
    // 帳篷裡的小熊才是小偷
    { at: 7.4, actor: 'cub', do: 'enter', from: { x: 152, y: 71.5 }, dur: 0.4 },
    { at: 7.4, actor: 'jar2', do: 'enter', from: { x: 159, y: 70 }, dur: 0.4 },
    { at: 7.9, actor: 'cub', do: 'bounce', dur: 0.7, times: 2, amount: 2 },
    { at: 7.9, actor: 'jar2', do: 'bounce', dur: 0.7, times: 2, amount: 2 },
    { at: 8.2, actor: 'hog', do: 'flip' },
    { at: 8.9, actor: 'cub', do: 'hop', dur: 0.4, amount: 4 },
  ],
  builds: [
    // 蜂蜜噴出來 → 能；營火的火星 → 灬
    { at: 5.75, dur: 1.0, strokes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], from: 'fire', color: '#E3950F' },
    { at: 6.4, dur: 0.6, strokes: [10, 11, 12, 13], from: 'fire', color: '#E8461E' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.1, kind: 'zzz', actor: 'hog', dur: 2.7 },
    { at: 0.9, kind: 'bubble', actor: 'bear', emoji: '🍯', dur: 0.9 },
    { at: 2.75, kind: 'burst', actor: 'bear', emoji: '🪵', n: 4, dur: 0.4, dy: 16 },
    { at: 2.85, kind: 'pop', actor: 'hog', emoji: '❗', dur: 0.4 },
    { at: 3.15, kind: 'line', actor: 'hog', to: { x: 66, y: 62 }, color: '#FFF2A0', width: 3, dur: 0.7, dx: -4 },
    { at: 3.4, kind: 'bubble', actor: 'hog', emoji: '❓', dur: 0.6 },
    { at: 3.2, kind: 'sweat', actor: 'bear', dx: -6 },
    { at: 4.15, kind: 'line', actor: 'hog', to: { x: 158, y: 62 }, color: '#FFF2A0', width: 3, dur: 0.6, dx: 4 },
    { at: 4.3, kind: 'bubble', actor: 'hog', emoji: '❓', dur: 0.5, dx: -16 },
    { at: 4.8, kind: 'pop', actor: 'bear', emoji: '😱', dur: 0.5 },
    { at: 5.6, kind: 'burst', actor: 'fire', emoji: '✨', n: 8, dur: 0.6 },
    { at: 6.25, kind: 'dizzy', actor: 'bear', dur: 1.0 },
    { at: 7.9, kind: 'pop', actor: 'cub', emoji: '😋', dur: 0.8, dx: -4 },
    { at: 8.3, kind: 'pop', actor: 'bear', emoji: '❗', dur: 0.6 },
    { at: 8.6, kind: 'bubble', actor: 'hog', emoji: '😑', dur: 0.9 },
  ],
  camera: [
    { at: 2.85, dur: 0.8, do: 'punch', amount: 0.25, to: { x: 120, y: 64 } },
    { at: 5.65, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.4, say: '熊' },
    { at: 2.75, sfx: 'crack' },
    { at: 2.95, sfx: 'whoosh' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 5.15, sfx: 'whoosh' },
    { at: 5.6, sfx: 'poof' },
    { at: 6.2, sfx: 'bonk' },
    { at: 7.1, say: '熊' },
    { at: 7.4, sfx: 'slide' },
    { at: 8.05, say: '小熊' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
