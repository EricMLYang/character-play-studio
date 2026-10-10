import type { Clip } from '../clip'

// 在：小貓明明就坐在房間正中間，小狗卻到處找：「你在哪裡？」翻開沙發墊——不在；打開衣櫃——掉出一堆衣服，也不在；看看床底下——還是不在！
// 小狗累得坐下來……屁股底下「喵！」——小貓一直在牠屁股下面。小貓跳起來，枕頭和衣服飛成「在」。在、在、在家
const clip: Clip = {
  char: '在',
  meta: { theme: '找東西', cast: '小狗＋小貓', gags: ['到處找不到', '其實就在你屁股下'] },
  duration: 10,
  bg: { top: '#FFF0E0', bottom: '#FFF9F2', floor: '#C9A88A', scenery: 'room' },
  actors: [
    { id: 'couch', emoji: '🛋️', x: 36, y: 66, size: 26, hidden: true },
    { id: 'bed', emoji: '🛏️', x: 132, y: 66, size: 28, hidden: true },
    { id: 'cat', emoji: '🐱', x: 84, y: 72.5, size: 12, hidden: true },
    { id: 'dog', emoji: '🐶', x: 64, y: 69.5, size: 18, hidden: true },
    { id: 'shirt', emoji: '👕', x: 36, y: 56, size: 10, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'couch', do: 'pop' },
    { at: 0.1, actor: 'bed', do: 'pop' },
    { at: 0.2, actor: 'dog', do: 'enter', from: { x: -14, y: 69.5 }, dur: 0.6 },
    { at: 0.3, actor: 'cat', do: 'pop', dur: 0.3 },
    // 你在哪裡？——翻沙發，不在
    { at: 1.3, actor: 'dog', do: 'moveTo', to: { x: 52, y: 69.5 }, dur: 0.4 },
    { at: 1.7, actor: 'couch', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 1.8, actor: 'shirt', do: 'pop', dur: 0.2 },
    { at: 2.0, actor: 'shirt', do: 'moveTo', to: { x: 20, y: 30 }, dur: 0.5, arc: 10 },
    { at: 2.5, actor: 'shirt', do: 'vanish', dur: 0.2 },
    // 看看床底下——還是不在
    { at: 3.0, actor: 'dog', do: 'moveTo', to: { x: 116, y: 69.5 }, dur: 0.6 },
    { at: 3.7, actor: 'dog', do: 'squash', amount: 0.3, dur: 0.6 },
    { at: 3.8, actor: 'bed', do: 'shake', amount: 1.2, dur: 0.5 },
    // 累得坐下來……就坐在小貓上面
    { at: 4.8, actor: 'dog', do: 'moveTo', to: { x: 84, y: 69.5 }, dur: 0.5 },
    { at: 5.4, actor: 'dog', do: 'squash', amount: 0.25, dur: 0.4 },
    // 喵！——小貓跳起來
    { at: 6.0, actor: 'dog', do: 'hop', amount: 18, dur: 0.6 },
    { at: 6.0, actor: 'dog', do: 'spin', dur: 0.6 },
    { at: 6.0, actor: 'cat', do: 'moveTo', to: { x: 62, y: 72.5 }, dur: 0.3, arc: 10 },
    { at: 6.6, actor: 'dog', do: 'moveTo', to: { x: 116, y: 69.5 }, dur: 0.3 },
    { at: 6.6, actor: 'cat', do: 'moveTo', to: { x: 24, y: 58 }, dur: 0.4, arc: 10 },
    { at: 8.8, actor: 'cat', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 衣服 → 上面；枕頭 → 土
    { at: 6.1, dur: 0.6, strokes: [0, 1, 2], from: 'couch', color: '#3D7DD8' },
    { at: 6.5, dur: 0.6, strokes: [3, 4, 5], from: 'bed', color: '#E86A33' },
  ],
  glyph: [{ at: 7.15, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'dog', emoji: '🐱', dur: 0.8 },
    { at: 2.3, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.6 },
    { at: 4.3, kind: 'pop', actor: 'dog', emoji: '❓', dur: 0.6 },
    { at: 5.4, kind: 'sweat', actor: 'dog' },
    { at: 5.8, kind: 'pop', actor: 'cat', emoji: '💢', dur: 0.5, dx: -6 },
    { at: 6.0, kind: 'pop', actor: 'dog', emoji: '😱', dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'cat', emoji: '😼', dur: 0.8 },
    { at: 9.0, kind: 'pop', actor: 'dog', emoji: '😅', dur: 0.8 },
  ],
  camera: [
    { at: 5.3, dur: 1.0, do: 'punch', amount: 0.3, to: { x: 84, y: 66 } },
  ],
  cues: [
    { at: 0.9, say: '在' },
    { at: 1.7, sfx: 'slide' },
    { at: 3.7, sfx: 'slide' },
    { at: 5.4, sfx: 'plop' },
    { at: 5.8, sfx: 'blip' },
    { at: 6.0, sfx: 'boing' },
    { at: 7.2, say: '在' },
    { at: 8.2, say: '在家' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
