import type { Clip, Move } from '../clip'
import { pressStack } from '../helpers'

// 果：拉布拉多警長吹哨要把滿地水果疊整齊，越疊越高、踮腳、果塔左右晃，最後小心放上一顆櫻桃——停一拍——整座垮下來。
// 水果擠成上面的「田」，木頭果架撐成「木」，警長被埋在水果堆裡；說「水果」時他頂著香蕉、梨子、葡萄冒出來，最後那顆櫻桃掉回他頭上。果、果、水果
const TOWER = ['t1', 't2', 't3', 't4']
const TY = [61, 53, 45, 37]
// 果塔晃：越上面晃越大
const sway = (at: number, dx: number, dur = 0.35, cherry = false): Move[] => [
  ...TOWER.map((actor, i) => ({ at, dur, actor, do: 'moveTo' as const, to: { x: 80 + dx * (i + 1), y: TY[i] } })),
  ...(cherry ? [{ at, dur, actor: 'cherry', do: 'moveTo' as const, to: { x: 80 + dx * 5.2, y: 30 } }] : []),
]
const HEAD = ['nana', 'pear', 'grape', 'cherry2']
const clip: Clip = {
  char: '果',
  meta: { theme: '警長整理水果攤', cast: '拉布拉多警長＋水果＋木頭果架', gags: ['疊疊樂越疊越晃', '停一拍全垮', '被埋只露眼睛', '頂著水果冒出來', '櫻桃又掉頭上'] },
  duration: 10,
  bg: { top: '#FFF3BF', bottom: '#FFF9DB', floor: '#C3FAE8', scenery: 'hills' },
  actors: [
    { id: 'stand', emoji: '🪵', x: 80, y: 71, size: 14 },
    { id: 'dog', emoji: 'hero:sheriff/idle', x: 62, y: 71, size: 14, hidden: true, flip: true },
    { id: 't1', emoji: '🍎', x: 98, y: 73.2, size: 9 },
    { id: 't2', emoji: '🍐', x: 109, y: 73.2, size: 9 },
    { id: 't3', emoji: '🍊', x: 120, y: 73.2, size: 9 },
    { id: 't4', emoji: '🍎', x: 131, y: 73.2, size: 9 },
    { id: 'cherry', emoji: '🍒', x: 142, y: 74.5, size: 6 },
    // 埋住警長的水果堆（畫在警長前面）
    { id: 'l1', emoji: '🍊', x: 130, y: 72.8, size: 10, hidden: true },
    { id: 'nana', emoji: '🍌', x: 122, y: 65, size: 8, hidden: true },
    { id: 'pear', emoji: '🍐', x: 122, y: 59.5, size: 6, hidden: true },
    { id: 'grape', emoji: '🍇', x: 131, y: 58, size: 7, hidden: true },
    { id: 'cherry2', emoji: '🍒', x: 131, y: 53, size: 5, hidden: true },
  ],
  moves: [
    // 警長小跑步進來，吹哨、指著亂糟糟的水果
    { at: 0, actor: 'dog', do: 'enter', from: { x: -15, y: 71 }, dur: 0.6, ease: 'back' },
    { at: 0, actor: 'dog', do: 'bounce', dur: 0.6, times: 3, amount: 2 },
    { at: 0.65, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 0.65, actor: 'dog', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 1.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 啪！第一顆蘋果放上果架
    { at: 1.15, actor: 't1', do: 'moveTo', to: { x: 80, y: 61 }, arc: 12, dur: 0.35 },
    { at: 1.5, actor: 't1', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 1.5, actor: 'dog', do: 'hop', amount: 3, dur: 0.25 },
    // 越疊越快、越疊越高
    { at: 1.85, actor: 't2', do: 'moveTo', to: { x: 80, y: 53 }, arc: 12, dur: 0.3 },
    { at: 2.25, actor: 't3', do: 'moveTo', to: { x: 80, y: 45 }, arc: 12, dur: 0.28 },
    { at: 2.3, actor: 'dog', do: 'moveTo', to: { x: 64, y: 69 }, dur: 0.2 },
    { at: 2.6, actor: 't4', do: 'moveTo', to: { x: 80, y: 37 }, arc: 12, dur: 0.26 },
    { at: 2.65, actor: 'dog', do: 'moveTo', to: { x: 65, y: 66 }, dur: 0.2 },
    { at: 2.65, actor: 'dog', do: 'squash', amount: -0.25, dur: 0.4 },
    ...sway(2.9, -0.8),
    { at: 3.0, actor: 'cherry', do: 'moveTo', to: { x: 66, y: 55 }, arc: 8, dur: 0.3 },
    ...sway(3.25, 1.4),
    { at: 3.25, actor: 'dog', do: 'shake', amount: 0.8, dur: 0.6 },
    // 兩根爪子小心放上櫻桃——停一拍
    { at: 3.45, actor: 'cherry', do: 'moveTo', to: { x: 81.5, y: 30 }, dur: 0.45 },
    { at: 3.95, actor: 'cherry', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 4.2, actor: 'cherry', do: 'tilt', amount: -18, dur: 0.25 },
    // 垮！
    ...sway(4.4, 3, 0.2, true),
    { at: 4.6, actor: 'cherry', do: 'moveTo', to: { x: -10, y: -12 }, arc: 10, dur: 0.6 },
    { at: 4.6, actor: 'cherry', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.6, actor: 't1', do: 'vanish', dur: 0.15 },
    { at: 4.6, actor: 't2', do: 'vanish', dur: 0.15 },
    { at: 4.6, actor: 't3', do: 'moveTo', to: { x: 122, y: 73.2 }, arc: 10, dur: 0.4 },
    { at: 4.65, actor: 't4', do: 'moveTo', to: { x: 138, y: 73.2 }, arc: 14, dur: 0.4 },
    { at: 4.45, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 4.5, actor: 'dog', do: 'moveTo', to: { x: 130, y: 75 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 4.8, actor: 'l1', do: 'pop', dur: 0.2 },
    { at: 4.95, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/dizzy' },
    { at: 4.95, actor: 'dog', do: 'flip' },
    { at: 4.85, actor: 'stand', do: 'vanish', dur: 0.2 },
    { at: 5.6, actor: 'dog', do: 'shake', amount: 0.6, dur: 0.4 },
    // 「水果」：頂著香蕉、梨子、葡萄冒出來
    { at: 6.45, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 6.45, actor: 'dog', do: 'moveTo', to: { x: 130, y: 71 }, dur: 0.3, ease: 'back' },
    { at: 6.5, actor: 'nana', do: 'pop' },
    { at: 6.55, actor: 'pear', do: 'pop' },
    { at: 6.6, actor: 'grape', do: 'pop' },
    { at: 6.5, actor: 't3', do: 'moveTo', to: { x: 116, y: 73.2 }, dur: 0.3 },
    { at: 6.5, actor: 'l1', do: 'moveTo', to: { x: 146, y: 72.8 }, dur: 0.3 },
    { at: 7.0, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/idle' },
    ...['dog', 'nana', 'pear', 'grape'].map((actor) => ({ at: 7.1, actor, do: 'shake' as const, amount: 1.4, dur: 0.6 })),
    // 端正警徽、輕輕吹一聲哨
    { at: 7.9, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/whistle' },
    // 回馬槍：剛剛飛走的櫻桃掉下來，剛好落在葡萄上
    { at: 8.6, actor: 'cherry2', do: 'drop', dur: 0.5 },
    ...pressStack(9.05, 0.25, 0.18, 14, HEAD),
    { at: 9.05, actor: 'dog', do: 'squash', amount: 0.18, dur: 0.25 },
    { at: 9.1, actor: 'dog', do: 'swap', emoji: 'hero:sheriff/surprised' },
  ],
  builds: [
    // 擠成一團的水果 → 田；木頭果架 → 木
    { at: 4.6, dur: 0.5, strokes: [0, 1, 2, 3], from: 't2', color: '#C92A2A' },
    { at: 4.85, dur: 0.75, strokes: [4, 5, 6, 7], from: 'stand', color: '#C92A2A' },
  ],
  glyph: [{ at: 5.65, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.65, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.6 },
    { at: 1.1, kind: 'pop', actor: 'dog', emoji: '❗', dur: 0.4 },
    { at: 2.7, kind: 'pop', actor: 'dog', emoji: '😛', dur: 0.6 },
    { at: 3.95, kind: 'sweat', actor: 'dog' },
    { at: 4.5, kind: 'burst', actor: 'stand', dy: -14, emoji: '🍎', n: 6, dur: 0.6 },
    { at: 5.0, kind: 'dizzy', actor: 'dog', dur: 1.2 },
    { at: 7.95, kind: 'zzz', actor: 'dog', emoji: '🎵', dur: 0.6 },
    { at: 9.15, kind: 'pop', actor: 'dog', emoji: '😅', dur: 0.6 },
  ],
  camera: [
    // 疊到最高時慢慢推近，垮下那一刻退回全景再震
    { at: 2.6, dur: 1.2, do: 'zoom', amount: 1.3, to: { x: 76, y: 46 } },
    { at: 4.35, dur: 0.25, do: 'zoom', amount: 1 },
    { at: 4.6, dur: 0.4, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 0.65, sfx: 'blip' },
    { at: 1.5, sfx: 'plop' },
    { at: 1.52, say: '果' },
    { at: 1.95, sfx: 'tap' },
    { at: 2.35, sfx: 'tap' },
    { at: 2.7, sfx: 'tap' },
    { at: 3.9, sfx: 'clink' },
    { at: 4.5, sfx: 'rumble' },
    { at: 5.65, say: '果' },
    { at: 6.5, say: '水果' },
    { at: 7.95, sfx: 'blip' },
    { at: 9.05, sfx: 'plop' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
