import type { Clip } from '../clip'

// 島：漂流到超小荒島，跳一下整座島就往下沉。揮旗子，大船船長在睡覺開走了；丟瓶中信，瓶子又漂回腳邊。
// 氣到生一把超大的火，火花和小島變成「島」——直升機看到大字來救人，結果他連整座小島一起吊走。島、島、小島
const clip: Clip = {
  char: '島',
  meta: { theme: '荒島漂流', cast: '漂流大叔＋大船＋直升機', gags: ['島小到一跳就沉', '求救全失敗', '瓶中信漂回來', '連島一起帶走'] },
  duration: 10,
  bg: { top: '#BFE9FF', bottom: '#93D6F2', floor: '#3FA6D6', scenery: 'sea' },
  actors: [
    { id: 'island', emoji: '🏝️', x: 24, y: 66.9, size: 24, hidden: true },
    { id: 'man', emoji: '🧔', x: 20, y: 66, size: 12.5, hidden: true },
    { id: 'flag', emoji: '🏳️', x: 29, y: 59, size: 8.8, hidden: true, float: true },
    { id: 'bottle', emoji: '🍾', x: 26, y: 62, size: 7.5, hidden: true, float: true },
    { id: 'fire', emoji: '🔥', x: 31, y: 70, size: 8.8, hidden: true },
    { id: 'ship', emoji: '🚢', x: 122, y: 67.5, size: 22.5, hidden: true },
    { id: 'heli', emoji: '🚁', x: 24, y: 16, size: 17.5, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'island', do: 'pop', dur: 0.4 },
    { at: 0.3, actor: 'man', do: 'pop' },
    // 跳一下，整座島往下沉
    { at: 1.31, actor: 'man', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 1.52, actor: 'man', do: 'hop', dur: 0.4, amount: 7 },
    { at: 1.95, actor: 'island', do: 'hop', dur: 0.5, amount: -3 },
    { at: 1.95, actor: 'man', do: 'hop', dur: 0.5, amount: -3 },
    // 大船經過：揮旗子，船長在睡覺
    { at: 2.17, actor: 'ship', do: 'enter', from: { x: 185, y: 67.5 }, dur: 0.8 },
    { at: 2.27, actor: 'flag', do: 'pop' },
    { at: 2.38, actor: 'flag', do: 'shake', dur: 0.8, amount: 1.5 },
    { at: 2.38, actor: 'man', do: 'bounce', dur: 0.8, times: 3, amount: 2.5 },
    { at: 3.13, actor: 'ship', do: 'flip' },
    { at: 3.13, actor: 'ship', do: 'moveTo', to: { x: 190, y: 67.5 }, dur: 0.7 },
    { at: 3.45, actor: 'flag', do: 'vanish' },
    // 瓶中信：丟出去，又漂回來
    { at: 3.56, actor: 'bottle', do: 'pop', dur: 0.2 },
    { at: 3.61, actor: 'man', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 3.78, actor: 'bottle', do: 'moveTo', to: { x: 112, y: 73 }, dur: 0.5, arc: 22 },
    { at: 3.78, actor: 'bottle', do: 'spin', dur: 0.5, times: 2 },
    { at: 4.42, actor: 'bottle', do: 'bounce', dur: 0.4, times: 2, amount: 1 },
    { at: 4.53, actor: 'bottle', do: 'moveTo', to: { x: 36, y: 73 }, dur: 0.45 },
    // 生一把超大的火
    { at: 5.17, actor: 'fire', do: 'pop' },
    { at: 5.28, actor: 'fire', do: 'scaleTo', amount: 2.4, dur: 0.35 },
    { at: 5.28, actor: 'man', do: 'hop', dur: 0.35, amount: 6 },
    { at: 5.7, actor: 'fire', do: 'shake', dur: 0.8, amount: 0.8 },
    { at: 6.6, actor: 'fire', do: 'vanish', dur: 0.4 },
    { at: 6.7, actor: 'bottle', do: 'vanish' },
    // 直升機看到大字
    { at: 7.2, actor: 'heli', do: 'enter', from: { x: -20, y: 6 }, dur: 0.6 },
    { at: 7.8, actor: 'heli', do: 'bounce', dur: 0.6, times: 2, amount: 1.5 },
    { at: 7.8, actor: 'island', do: 'bounce', dur: 0.5, times: 1, amount: 2 },
    { at: 7.8, actor: 'man', do: 'bounce', dur: 0.5, times: 1, amount: 2 },
    // 抓住繩子……整座島也跟著被吊起來
    { at: 8.6, actor: 'man', do: 'moveTo', to: { x: 24, y: 33 }, dur: 0.6 },
    { at: 8.73, actor: 'island', do: 'moveTo', to: { x: 24, y: 49 }, dur: 0.7 },
    { at: 9.39, actor: 'island', do: 'tilt', amount: 8, dur: 0.6 },
    { at: 9.39, actor: 'man', do: 'tilt', amount: 8, dur: 0.6 },
  ],
  builds: [
    // 火花飛上去 → 鳥；小島的沙 → 山
    { at: 5.6, dur: 0.9, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'fire', color: '#E8562A' },
    { at: 6.3, dur: 0.5, strokes: [7, 8, 9], from: 'island', color: '#1E7F55' },
  ],
  glyph: [{ at: 6.8, dur: 0.4, do: 'wobble' }, { at: 9.56, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'man', emoji: '🚢', dur: 0.8 },
    { at: 1.95, kind: 'burst', actor: 'island', emoji: '💦', n: 6, dur: 0.5, dy: 16 },
    { at: 2.06, kind: 'sweat', actor: 'man' },
    { at: 2.6, kind: 'zzz', actor: 'ship', dur: 0.8 },
    { at: 3.35, kind: 'pop', actor: 'man', emoji: '😩', dur: 0.5 },
    { at: 4.31, kind: 'burst', actor: 'bottle', emoji: '💦', n: 5, dur: 0.4 },
    { at: 5.06, kind: 'pop', actor: 'man', emoji: '😑', dur: 0.5 },
    { at: 5.65, kind: 'burst', actor: 'fire', emoji: '✨', n: 6, dur: 0.6, dy: -4 },
    { at: 7.3, kind: 'pop', actor: 'man', emoji: '❗', dur: 0.5 },
    { at: 8.43, kind: 'line', actor: 'heli', target: 'man', dy: 5, color: '#7A5230', width: 0.6, dur: 1.8 },
    { at: 8.69, kind: 'burst', x: 24, y: 72, emoji: '💦', n: 6, dur: 0.6 },
    { at: 9.12, kind: 'pop', actor: 'man', emoji: '😁', dur: 0.8, dx: 4 },
  ],
  camera: [
    { at: 1.95, dur: 0.5, do: 'shake', amount: 1 },
    { at: 7.8, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 26, y: 60 } },
  ],
  cues: [
    { at: 1.95, sfx: 'splash' },
    { at: 2, say: '島' },
    { at: 2.7, sfx: 'rumble' },
    { at: 3.78, sfx: 'whoosh' },
    { at: 4.31, sfx: 'plop' },
    { at: 5.01, sfx: 'tap' },
    { at: 5.28, sfx: 'whoosh' },
    { at: 6.9, say: '島' },
    { at: 7.2, sfx: 'rumble' },
    { at: 7.9, say: '小島' },
    { at: 8.69, sfx: 'splash' },
    { at: 9.65, sfx: 'cheer' },
  ],
}

export default clip
