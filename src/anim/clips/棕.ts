import type { Clip } from '../clip'

// 棕：大棕熊在河邊抓魚。魚跳起來，熊一掌撲過去——魚從牠頭上翻過去；再撲——魚從牠腳下溜走。
// 熊張大嘴巴等著，魚自己跳進嘴裡！熊得意地一咬，水花變成「棕」。結果魚又「噗」地從牠鼻子噴出來，跳回河裡。棕、棕、棕熊
const clip: Clip = {
  char: '棕',
  meta: { theme: '河邊抓魚', cast: '棕熊＋跳跳魚', gags: ['怎麼撲都撲空', '自己跳進嘴裡', '又噴出來'] },
  duration: 10,
  bg: { top: '#D6EEFF', bottom: '#EEF8EE', floor: '#3FA6D6', scenery: 'sea' },
  actors: [
    { id: 'bear', emoji: '🐻', x: 40, y: 67, size: 24, hidden: true },
    { id: 'fish', emoji: '🐟', x: 96, y: 76, size: 11, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'bear', do: 'enter', from: { x: -16, y: 67 }, dur: 0.8 },
    // 魚跳起來——熊撲過去，魚從頭上翻過去
    { at: 1.4, actor: 'fish', do: 'pop', dur: 0.2 },
    { at: 1.6, actor: 'fish', do: 'moveTo', to: { x: 60, y: 54 }, dur: 0.6, arc: 20 },
    { at: 1.9, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 2.15, actor: 'bear', do: 'moveTo', to: { x: 58, y: 67 }, dur: 0.25 },
    { at: 2.2, actor: 'fish', do: 'moveTo', to: { x: 24, y: 76 }, dur: 0.6, arc: 26 },
    { at: 2.2, actor: 'fish', do: 'spin', dur: 0.6 },
    { at: 2.4, actor: 'bear', do: 'squash', amount: 0.3, dur: 0.3 },
    // 再撲——魚從腳下溜走
    { at: 3.3, actor: 'bear', do: 'flip' },
    { at: 3.4, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 3.65, actor: 'bear', do: 'moveTo', to: { x: 30, y: 67 }, dur: 0.3, arc: 10 },
    { at: 3.65, actor: 'fish', do: 'moveTo', to: { x: 100, y: 78 }, dur: 0.5 },
    { at: 3.95, actor: 'bear', do: 'squash', amount: 0.35, dur: 0.3 },
    // 熊張大嘴巴等著——魚自己跳進嘴裡
    { at: 4.6, actor: 'bear', do: 'flip' },
    { at: 4.8, actor: 'bear', do: 'squash', amount: -0.3, dur: 0.8 },
    { at: 5.0, actor: 'fish', do: 'moveTo', to: { x: 40, y: 64 }, dur: 0.6, arc: 24 },
    { at: 5.6, actor: 'fish', do: 'vanish', dur: 0.1 },
    { at: 5.65, actor: 'bear', do: 'squash', amount: 0.25, dur: 0.3 },
    // 得意一咬
    { at: 6.1, actor: 'bear', do: 'hop', amount: 5, dur: 0.4 },
    // 魚從鼻子噴出來，跳回河裡
    { at: 8.4, actor: 'bear', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 8.7, actor: 'fish', do: 'moveTo', to: { x: 42, y: 62 }, dur: 0.01 },
    { at: 8.72, actor: 'fish', do: 'pop', dur: 0.1 },
    { at: 8.75, actor: 'fish', do: 'moveTo', to: { x: 120, y: 80 }, dur: 0.7, arc: 22 },
    { at: 8.75, actor: 'fish', do: 'spin', times: 2, dur: 0.7 },
  ],
  builds: [
    // 熊咬下去濺起的水花：木、宗
    { at: 6.15, dur: 0.6, strokes: [0, 1, 2, 3], from: 'bear', color: '#8A5A3B' },
    { at: 6.5, dur: 0.8, strokes: [4, 5, 6, 7, 8, 9, 10, 11], from: 'bear', color: '#3D8BEF' },
  ],
  glyph: [{ at: 7.35, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'bear', emoji: '🐟', dur: 0.8 },
    { at: 1.5, kind: 'burst', x: 96, y: 76, emoji: '💦', n: 5, dur: 0.5 },
    { at: 2.5, kind: 'pop', actor: 'bear', emoji: '😠', dur: 0.6 },
    { at: 4.0, kind: 'dizzy', actor: 'bear', dur: 0.8 },
    { at: 5.6, kind: 'pop', actor: 'bear', emoji: '😋', dur: 0.8 },
    { at: 6.15, kind: 'burst', actor: 'bear', emoji: '💦', n: 7, dur: 0.6 },
    { at: 8.7, kind: 'burst', actor: 'bear', emoji: '💦', n: 5, dur: 0.5 },
    { at: 8.9, kind: 'pop', actor: 'bear', emoji: '😳', dur: 0.8 },
  ],
  camera: [
    { at: 5.0, dur: 1.0, do: 'punch', amount: 0.25, to: { x: 42, y: 58 } },
  ],
  cues: [
    { at: 1.0, say: '棕' },
    { at: 1.5, sfx: 'splash' },
    { at: 2.15, sfx: 'whoosh' },
    { at: 2.4, sfx: 'plop' },
    { at: 3.65, sfx: 'whoosh' },
    { at: 3.95, sfx: 'bonk' },
    { at: 5.6, sfx: 'gulp' },
    { at: 6.15, sfx: 'splash' },
    { at: 7.4, say: '棕' },
    { at: 8.3, say: '棕熊' },
    { at: 8.75, sfx: 'achoo' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
