import type { Clip } from '../clip'

// 不：熊貓媽媽要小熊貓吃花椰菜。湯匙飛過來——小熊貓搖頭：不吃！湯匙變成飛機「嗡——」飛過來——還是搖頭不吃！
// 媽媽把花椰菜藏進冰淇淋裡，小熊貓一口吃下去……吃出來了，「噗」地噴出來，花椰菜碎片變成「不」。媽媽自己吃一口——媽媽也噴出來。不、不、不吃
const clip: Clip = {
  char: '不',
  meta: { theme: '不吃青菜', cast: '熊貓媽媽＋小熊貓＋花椰菜', gags: ['怎麼餵都不吃', '湯匙變飛機', '藏起來也被吃出來', '連媽媽也不吃'] },
  duration: 10,
  bg: { top: '#E7F6E7', bottom: '#F8FCF4', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'mom', emoji: '🐼', x: 128, y: 67, size: 24, hidden: true },
    { id: 'baby', emoji: '🐼', x: 30, y: 70.3, size: 16, hidden: true },
    { id: 'broc', emoji: '🥦', x: 112, y: 58, size: 10, hidden: true, float: true },
    { id: 'plane', emoji: '✈️', x: 112, y: 40, size: 11, hidden: true, float: true },
    { id: 'ice', emoji: '🍦', x: 112, y: 58, size: 12, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'mom', do: 'pop' },
    { at: 0.15, actor: 'baby', do: 'pop' },
    // 湯匙飛過來——搖頭不要
    { at: 0.8, actor: 'broc', do: 'pop' },
    { at: 1.1, actor: 'broc', do: 'moveTo', to: { x: 40, y: 62 }, dur: 0.6, arc: 10 },
    { at: 1.7, actor: 'baby', do: 'shake', amount: 2, dur: 0.6 },
    { at: 2.3, actor: 'broc', do: 'moveTo', to: { x: 112, y: 58 }, dur: 0.4 },
    { at: 2.7, actor: 'broc', do: 'vanish', dur: 0.15 },
    // 變成飛機嗡嗡飛過來——還是不要
    { at: 3.0, actor: 'plane', do: 'pop' },
    { at: 3.2, actor: 'plane', do: 'moveTo', to: { x: 40, y: 58 }, dur: 0.9, arc: 14 },
    { at: 4.1, actor: 'baby', do: 'shake', amount: 2.5, dur: 0.6 },
    { at: 4.1, actor: 'baby', do: 'flip' },
    { at: 4.7, actor: 'plane', do: 'moveTo', to: { x: 180, y: 20 }, dur: 0.5 },
    // 藏進冰淇淋——吃下去……噗！
    { at: 5.0, actor: 'baby', do: 'flip' },
    { at: 5.2, actor: 'ice', do: 'pop' },
    { at: 5.4, actor: 'ice', do: 'moveTo', to: { x: 38, y: 62 }, dur: 0.5, arc: 8 },
    { at: 5.9, actor: 'ice', do: 'vanish', dur: 0.1 },
    { at: 6.0, actor: 'baby', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 6.4, actor: 'baby', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 6.6, actor: 'baby', do: 'shake', amount: 1.5, dur: 0.4 },
    // 媽媽自己吃一口——也噴出來
    { at: 8.6, actor: 'mom', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 9.0, actor: 'mom', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 9.2, actor: 'mom', do: 'shake', amount: 1.5, dur: 0.4 },
  ],
  builds: [
    // 噴出來的花椰菜碎片
    { at: 6.45, dur: 0.6, strokes: [0, 1, 2, 3], from: 'baby', color: '#3E9B4F' },
  ],
  glyph: [{ at: 7.1, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'mom', emoji: '🥦', dur: 0.6 },
    { at: 1.75, kind: 'pop', actor: 'baby', emoji: '🙅', dur: 0.7 },
    { at: 4.15, kind: 'pop', actor: 'baby', emoji: '🙅', dur: 0.7 },
    { at: 4.2, kind: 'sweat', actor: 'mom' },
    { at: 5.0, kind: 'pop', actor: 'mom', emoji: '💡', dur: 0.5 },
    { at: 6.0, kind: 'pop', actor: 'baby', emoji: '😋', dur: 0.4 },
    { at: 6.45, kind: 'burst', actor: 'baby', emoji: '🥦', n: 6, dur: 0.6 },
    { at: 9.05, kind: 'burst', actor: 'mom', emoji: '🥦', n: 6, dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'baby', emoji: '😆', dur: 0.7 },
  ],
  camera: [
    { at: 6.0, dur: 0.9, do: 'punch', amount: 0.25, to: { x: 34, y: 62 } },
  ],
  cues: [
    { at: 1.75, say: '不' },
    { at: 3.2, sfx: 'whoosh' },
    { at: 4.1, sfx: 'deflate' },
    { at: 5.4, sfx: 'whoosh' },
    { at: 6.0, sfx: 'gulp' },
    { at: 6.45, sfx: 'achoo' },
    { at: 7.15, say: '不' },
    { at: 8.05, say: '不吃' },
    { at: 9.05, sfx: 'achoo' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
