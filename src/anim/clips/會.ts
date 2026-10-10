import type { Clip } from '../clip'

// 會：小企鵝看海鷗飛好羨慕。拍拍翅膀跳——撲通摔倒；爬上冰山再跳——直直掉進海裡！
// 結果牠在水裡「咻咻咻」游得超快，像在水裡飛一樣，水花和泡泡變成「會」。小企鵝學會了！海鷗想學——一頭栽進水裡。會、會、學會
const clip: Clip = {
  char: '會',
  meta: { theme: '學飛', cast: '小企鵝＋海鷗', gags: ['飛不起來', '掉進水裡反而會游', '別人學不來'] },
  duration: 10,
  bg: { top: '#D6EEFF', bottom: '#EEF8FF', floor: '#3FA6D6', scenery: 'sea' },
  actors: [
    { id: 'ice', emoji: '🧊', x: 30, y: 62, size: 26, hidden: true },
    { id: 'peng', emoji: '🐧', x: 30, y: 46, size: 15, hidden: true },
    { id: 'gull', emoji: '🕊️', x: 120, y: 26, size: 14, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'ice', do: 'pop' },
    { at: 0.1, actor: 'peng', do: 'pop' },
    { at: 0.3, actor: 'gull', do: 'enter', from: { x: 180, y: 16 }, dur: 0.8 },
    { at: 1.1, actor: 'gull', do: 'bounce', amount: 3, times: 3, dur: 1.2 },
    // 拍拍翅膀跳——摔倒
    { at: 1.6, actor: 'peng', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 2.1, actor: 'peng', do: 'hop', amount: 6, dur: 0.4 },
    { at: 2.5, actor: 'peng', do: 'squash', amount: 0.3, dur: 0.3 },
    // 再用力跳——直直掉進海裡
    { at: 3.3, actor: 'peng', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 3.6, actor: 'peng', do: 'moveTo', to: { x: 60, y: 80 }, dur: 0.6, arc: 18 },
    { at: 3.6, actor: 'peng', do: 'shake', amount: 2, dur: 0.6 },
    { at: 4.2, actor: 'peng', do: 'vanish', dur: 0.1 },
    // 在水裡咻咻咻游得超快
    { at: 4.8, actor: 'peng', do: 'moveTo', to: { x: 80, y: 82 }, dur: 0.01 },
    { at: 4.82, actor: 'peng', do: 'pop', dur: 0.2 },
    { at: 4.82, actor: 'peng', do: 'rotateTo', amount: 70, dur: 0.01 },
    { at: 5.0, actor: 'peng', do: 'moveTo', to: { x: 150, y: 82 }, dur: 0.4 },
    { at: 5.4, actor: 'peng', do: 'flip' },
    { at: 5.45, actor: 'peng', do: 'moveTo', to: { x: 20, y: 82 }, dur: 0.5 },
    { at: 5.95, actor: 'peng', do: 'flip' },
    { at: 6.0, actor: 'peng', do: 'moveTo', to: { x: 30, y: 46 }, dur: 0.5, arc: 18 },
    { at: 6.0, actor: 'peng', do: 'rotateTo', amount: -70, dur: 0.3 },
    // 海鷗想學——一頭栽進水裡
    { at: 8.0, actor: 'gull', do: 'moveTo', to: { x: 132, y: 82 }, dur: 0.6 },
    { at: 8.0, actor: 'gull', do: 'rotateTo', amount: -90, dur: 0.4 },
    { at: 8.7, actor: 'gull', do: 'shake', amount: 1.5, dur: 0.6 },
    { at: 8.8, actor: 'peng', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
  ],
  builds: [
    // 水花 → 上面的人；泡泡 → 中間；游過的路線 → 下面的日
    { at: 5.0, dur: 0.6, strokes: [0, 1, 2], from: 'peng', color: '#3D8BEF' },
    { at: 5.45, dur: 0.8, strokes: [3, 4, 5, 6, 7, 8], from: 'peng', color: '#7A5CC9' },
    { at: 6.0, dur: 0.6, strokes: [9, 10, 11, 12], from: 'peng', color: '#3D8BEF' },
  ],
  glyph: [{ at: 6.65, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'bubble', actor: 'peng', emoji: '🕊️', dur: 0.6 },
    { at: 2.5, kind: 'dizzy', actor: 'peng', dur: 0.7 },
    { at: 3.4, kind: 'pop', actor: 'peng', emoji: '😤', dur: 0.3 },
    { at: 4.2, kind: 'fountain', x: 60, y: 74, n: 8, dur: 0.7 },
    { at: 5.0, kind: 'burst', actor: 'peng', emoji: '🫧', n: 6, dur: 0.4 },
    { at: 6.5, kind: 'pop', actor: 'peng', emoji: '😎', dur: 0.8 },
    { at: 8.6, kind: 'fountain', x: 132, y: 74, n: 8, dur: 0.7 },
    { at: 8.9, kind: 'pop', actor: 'peng', emoji: '😆', dur: 0.8 },
  ],
  camera: [
    { at: 3.6, dur: 0.8, do: 'punch', amount: 0.15, to: { x: 50, y: 66 } },
  ],
  cues: [
    { at: 1.6, say: '會' },
    { at: 2.1, sfx: 'boing' },
    { at: 2.5, sfx: 'plop' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 4.2, sfx: 'splash' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 5.45, sfx: 'whoosh' },
    { at: 6.7, say: '會' },
    { at: 7.7, say: '學會' },
    { at: 8.6, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
