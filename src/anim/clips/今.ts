import type { Clip } from '../clip'

// 今：太陽出來了，樹懶睜開一隻眼睛：「今天要做好多事！」牠慢慢、慢慢伸懶腰……太陽已經爬到頭頂；
// 牠慢慢、慢慢爬下樹……太陽快下山了！樹懶終於站到地上，月亮跑出來、星星飛成「今」。樹懶打個哈欠，又爬回樹上睡覺。今、今、今天
const clip: Clip = {
  char: '今',
  meta: { theme: '慢吞吞的一天', cast: '樹懶＋太陽＋月亮', gags: ['慢到一整天過去了', '時間快轉', '什麼都沒做又去睡'] },
  duration: 10,
  bg: { top: '#CFEAFF', bottom: '#F2FAEC', floor: '#9BCB5B', scenery: 'forest' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 64, y: 50, size: 16, hidden: true, float: true },
    { id: 'moon', emoji: '🌙', x: 140, y: 18, top: true, size: 14, hidden: true, float: true },
    { id: 'tree', emoji: '🌳', x: 30, y: 52, size: 48, hidden: true },
    { id: 'sloth', emoji: '🦥', x: 30, y: 38, size: 18, hidden: true, float: true },
  ],
  lights: [
    { at: 5.3, dur: 0.6, level: 0.5 },
    { at: 6.1, dur: 0.5, level: 0 },
  ],
  moves: [
    { at: 0, actor: 'tree', do: 'pop' },
    { at: 0.1, actor: 'sloth', do: 'pop' },
    { at: 0.3, actor: 'sun', do: 'enter', from: { x: 64, y: 90 }, dur: 0.8 },
    // 睜開一隻眼睛
    { at: 1.1, actor: 'sloth', do: 'tilt', amount: 10, dur: 0.6 },
    // 慢慢伸懶腰……太陽爬到頭頂
    { at: 2.2, actor: 'sloth', do: 'squash', amount: -0.2, dur: 1.6 },
    { at: 2.2, actor: 'sun', do: 'moveTo', to: { x: 80, y: 10 }, dur: 1.6, arc: 8 },
    // 慢慢爬下樹……太陽快下山
    { at: 4.0, actor: 'sloth', do: 'moveTo', to: { x: 30, y: 66 }, dur: 1.6 },
    { at: 4.0, actor: 'sun', do: 'moveTo', to: { x: 150, y: 56 }, dur: 1.6, arc: 6 },
    { at: 5.6, actor: 'sun', do: 'vanish', dur: 0.5 },
    // 終於站到地上——月亮出來了
    { at: 5.7, actor: 'sloth', do: 'squash', amount: 0.15, dur: 0.4 },
    { at: 6.0, actor: 'moon', do: 'pop', dur: 0.4 },
    // 打個哈欠，又爬回樹上
    { at: 8.4, actor: 'sloth', do: 'moveTo', to: { x: 30, y: 38 }, dur: 1.2 },
  ],
  builds: [
    // 天黑跑出來的星星
    { at: 6.1, dur: 0.6, strokes: [0, 1], from: 'moon', color: '#FFE38A' },
    { at: 6.5, dur: 0.5, strokes: [2, 3], from: 'moon', color: '#B9A6FF' },
  ],
  glyph: [{ at: 7.05, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.2, kind: 'bubble', actor: 'sloth', emoji: '📝', dur: 0.9 },
    { at: 2.4, kind: 'zzz', actor: 'sloth', emoji: '💤', dur: 1.2 },
    { at: 4.6, kind: 'sweat', actor: 'sloth', dur: 0.8 },
    { at: 5.8, kind: 'pop', actor: 'sloth', emoji: '😮', dur: 0.8 },
    { at: 6.1, kind: 'burst', actor: 'moon', emoji: '⭐', n: 6, dur: 0.6 },
    { at: 8.0, kind: 'pop', actor: 'sloth', emoji: '🥱', dur: 0.6 },
    { at: 9.3, kind: 'zzz', actor: 'sloth', dur: 0.7 },
  ],
  camera: [
    { at: 1.1, dur: 0.9, do: 'punch', amount: 0.2, to: { x: 32, y: 40 } },
  ],
  cues: [
    { at: 0.4, sfx: 'blip' },
    { at: 1.3, say: '今' },
    { at: 2.2, sfx: 'slide' },
    { at: 4.0, sfx: 'slide' },
    { at: 5.7, sfx: 'plop' },
    { at: 6.0, sfx: 'blip' },
    { at: 7.1, say: '今' },
    { at: 8.0, say: '今天' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
