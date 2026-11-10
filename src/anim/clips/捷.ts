import type { Clip, Move } from '../clip'
import { ride } from '../helpers'

// 捷（重做）：楊捷睿開賽車跟獵豹比賽。旗子一揮，獵豹咻地跑掉，他的輪子卻原地空轉冒煙——獵豹已經繞一圈從後面跑回來笑他。
// 他氣到狂催油門，一衝快到留下閃電尾巴（扌），整台撞進輪胎堆，輪胎飛上天掉成右邊，「捷」站好了。
// 國字讓到上方，捷運滑進站（捷運），他跳上捷運；獵豹不服氣先跑，捷運一下就繞地球一圈從另一邊回來，獵豹最後才喘著跑回來。捷、捷、捷運
const C = 67.3 // 賽車（size 23）在地上的 y
const B = C - 0.5 // 楊捷睿坐在車上的 y
const K = 67.8 // 獵豹（size 22）
const T = 61 // 捷運（size 38）
const W = -8 // 楊捷睿趴在捷運車頂上

// 捷運的動作抄一份給車頂上的楊捷睿（只從他上車之後）
const onTrain = (ms: Move[]): Move[] => ms.flatMap((m) => [
  m,
  { ...m, actor: 'boy', to: m.to && { x: m.to.x + 2, y: m.to.y + W }, from: m.from && { x: m.from.x + 2, y: m.from.y + W } },
])

const clip: Clip = {
  char: '捷',
  meta: { theme: '賽車場跟獵豹比快', cast: '楊捷睿＋賽車＋獵豹＋輪胎堆＋捷運', gags: ['輪子原地空轉', '獵豹繞一圈從後面回來', '快到撞進輪胎堆', '捷運繞地球一圈獵豹最後到'] },
  duration: 10,
  bg: { top: '#9FD4FF', bottom: '#EEF7FF', floor: '#A7B0BA', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🏁', x: 84, y: 30, size: 12, hidden: true, float: true },
    { id: 'train', emoji: '🚈', x: 74, y: T, size: 38, hidden: true, flip: true },
    { id: 'tire1', emoji: '🛞', x: 145, y: 71, size: 11 },
    { id: 'tire2', emoji: '🛞', x: 145, y: 62, size: 11 },
    { id: 'car', emoji: '🏎️', x: 40, y: C, size: 23, hidden: true, flip: true },
    { id: 'boy', emoji: 'hero:yang/drive', x: 40, y: B, size: 14, hidden: true },
    { id: 'cheetah', emoji: '🐆', x: 76, y: K, size: 22, hidden: true, flip: true },
  ],
  moves: [
    // 獵豹從右邊走到起跑線，一臉得意
    { at: 0, actor: 'cheetah', do: 'enter', from: { x: 185, y: K }, dur: 0.55, ease: 'out' },
    { at: 0.6, actor: 'cheetah', do: 'tilt', amount: -12, dur: 0.35 },
    // 旗子掉下來，一揮——開始！
    { at: 0.85, actor: 'flag', do: 'drop', dur: 0.35 },
    { at: 1.2, actor: 'flag', do: 'tilt', amount: 30, dur: 0.25 },
    { at: 1.2, actor: 'cheetah', do: 'squash', amount: -0.25, dur: 0.15 },
    { at: 1.35, actor: 'cheetah', do: 'moveTo', to: { x: 190, y: K }, dur: 0.35, anticipate: 3, ease: 'in' },
    // 獵豹的風把旗子吹走
    { at: 1.5, actor: 'flag', do: 'moveTo', to: { x: 185, y: 4 }, dur: 0.4, ease: 'in' },
    { at: 1.5, actor: 'flag', do: 'spin', times: 2, dur: 0.4 },
    // 獵豹已經繞一圈，從後面跑回來，停在他前面回頭笑
    { at: 2.15, actor: 'cheetah', do: 'vanish', dur: 0.01 },
    { at: 2.18, actor: 'cheetah', do: 'moveTo', to: { x: 76, y: K }, dur: 0.01 },
    { at: 2.25, actor: 'cheetah', do: 'enter', from: { x: -30, y: K }, dur: 0.4, ease: 'back' },
    { at: 2.7, actor: 'cheetah', do: 'flip' },
    { at: 2.8, actor: 'cheetah', do: 'bounce', amount: 2.5, times: 3, dur: 0.6 },
    // 第二次：從車子前面跳開，躲到左邊
    { at: 3.8, actor: 'cheetah', do: 'hop', amount: 3, dur: 0.2 },
    { at: 4.15, actor: 'cheetah', do: 'moveTo', to: { x: 22, y: K }, arc: 26, dur: 0.55, ease: 'out' },
    { at: 4.15, actor: 'cheetah', do: 'spin', times: -1, dur: 0.55 },
    { at: 4.75, actor: 'cheetah', do: 'flip' },
    { at: 5.9, actor: 'cheetah', do: 'hop', amount: 4, dur: 0.3 },
    // 撞飛的輪胎
    { at: 4.5, actor: 'tire1', do: 'moveTo', to: { x: 108, y: 12 }, dur: 0.35, ease: 'out' },
    { at: 4.5, actor: 'tire1', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.5, actor: 'tire2', do: 'moveTo', to: { x: 138, y: 8 }, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'tire2', do: 'spin', times: -2, dur: 0.45 },
    { at: 4.85, actor: 'tire1', do: 'vanish', dur: 0.2 },
    { at: 5.3, actor: 'tire2', do: 'vanish', dur: 0.2 },
    ...ride([
      { at: 0, actor: 'car', do: 'enter', from: { x: -25, y: C }, dur: 0.5, ease: 'out' },
      // 催油門
      { at: 0.65, actor: 'car', do: 'shake', amount: 0.8, dur: 0.4 },
      // 開始！輪子卻原地空轉
      { at: 1.35, actor: 'car', do: 'shake', amount: 1.6, dur: 0.8 },
      { at: 1.35, actor: 'car', do: 'squash', amount: -0.12, dur: 0.3 },
      // 氣到狂催油門：往後壓、抖
      { at: 3.15, actor: 'car', do: 'squash', amount: -0.3, dur: 0.55 },
      { at: 3.2, actor: 'car', do: 'shake', amount: 1.4, dur: 0.95 },
      // 咻——快到停不下來，撞進輪胎堆
      { at: 4.15, actor: 'car', do: 'moveTo', to: { x: 128, y: C }, dur: 0.35, anticipate: 6, ease: 'in' },
      { at: 4.5, actor: 'car', do: 'squash', amount: 0.45, dur: 0.4 },
      { at: 4.5, actor: 'car', do: 'shake', amount: 1.5, dur: 0.5 },
      { at: 5.9, actor: 'car', do: 'hop', amount: 4, dur: 0.3 },
    ], 'boy', B - C, 23),
    { at: 1.9, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 3.1, actor: 'boy', do: 'swap', emoji: 'hero:yang/drive' },
    { at: 4.5, actor: 'boy', do: 'swap', emoji: 'hero:yang/dizzy' },
    { at: 5.9, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    // 國字讓位：捷運滑進站
    { at: 6.95, actor: 'train', do: 'enter', from: { x: -50, y: T }, dur: 0.5, ease: 'back' },
    { at: 7.45, actor: 'train', do: 'squash', amount: 0.1, dur: 0.25 },
    { at: 7.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    // 跳上捷運車頂
    { at: 7.75, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 7.75, actor: 'boy', do: 'moveTo', to: { x: 76, y: T + W }, arc: 4, dur: 0.4, ease: 'out' },
    // 獵豹不服氣，先跑
    { at: 8.0, actor: 'cheetah', do: 'squash', amount: -0.3, dur: 0.2 },
    { at: 8.15, actor: 'cheetah', do: 'moveTo', to: { x: 195, y: K }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 8.3, actor: 'boy', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: 9.0, actor: 'boy', do: 'swap', emoji: 'hero:yang/happy' },
    // 捷運咻地開走，一下就繞一圈從左邊回來
    ...onTrain([
      { at: 8.3, actor: 'train', do: 'moveTo', to: { x: 200, y: T }, dur: 0.25, anticipate: 3, ease: 'in' },
      { at: 8.56, actor: 'train', do: 'vanish', dur: 0.01 },
      { at: 8.58, actor: 'train', do: 'moveTo', to: { x: 34, y: T }, dur: 0.01 },
      { at: 8.6, actor: 'train', do: 'enter', from: { x: -50, y: T }, dur: 0.4, ease: 'back' },
    ]),
    // 空車被捷運的風吹得打轉
    { at: 8.4, actor: 'car', do: 'spin', times: 1, dur: 0.5 },
    { at: 8.4, actor: 'car', do: 'moveTo', to: { x: 146, y: C }, dur: 0.5, ease: 'out' },
    // 獵豹最後才喘著跑回來
    { at: 9.0, actor: 'cheetah', do: 'vanish', dur: 0.01 },
    { at: 9.03, actor: 'cheetah', do: 'moveTo', to: { x: 122, y: K }, dur: 0.01 },
    { at: 9.03, actor: 'cheetah', do: 'flip' },
    { at: 9.1, actor: 'cheetah', do: 'enter', from: { x: 195, y: K }, dur: 0.5, ease: 'out' },
    { at: 9.6, actor: 'cheetah', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 9.5, actor: 'boy', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 衝過去留下的閃電尾巴 → 扌；飛上天的輪胎掉下來 → 右邊
    { at: 4.2, dur: 0.45, strokes: [0, 1, 2], from: 'car', color: '#F03E3E' },
    { at: 4.85, dur: 0.45, strokes: [3, 4, 5, 6], from: 'tire1', style: 'drop', color: '#F59F00' },
    { at: 5.3, dur: 0.5, strokes: [7, 8, 9, 10], from: 'tire2', style: 'drop', color: '#FAB005' },
  ],
  glyph: [
    { at: 5.85, dur: 0.4, do: 'wobble' },
    { at: 6.7, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'cheetah', emoji: '😏', dur: 0.45 },
    { at: 0.65, kind: 'puff', actor: 'car', dx: -12, dy: 12, dur: 0.4 },
    { at: 0.7, kind: 'pop', actor: 'boy', emoji: '😤', dur: 0.4 },
    { at: 1.35, kind: 'puff', actor: 'car', dx: -10, dy: 12, dur: 0.85 },
    { at: 1.6, kind: 'puff', actor: 'car', dx: -14, dy: 10, dur: 0.6 },
    { at: 1.5, kind: 'burst', actor: 'car', emoji: '💨', n: 4, dx: -12, dy: 10, dur: 0.7 },
    { at: 1.95, kind: 'pop', actor: 'boy', emoji: '❓', dur: 0.4 },
    { at: 2.0, kind: 'sweat', actor: 'boy' },
    { at: 2.75, kind: 'pop', actor: 'cheetah', emoji: '😆', dur: 0.55 },
    { at: 3.1, kind: 'pop', actor: 'boy', emoji: '💢', dur: 0.4 },
    { at: 3.2, kind: 'puff', actor: 'car', dx: -12, dy: 12, dur: 0.9 },
    { at: 3.6, kind: 'burst', actor: 'car', emoji: '⚡', n: 6, dur: 0.55 },
    { at: 3.75, kind: 'pop', actor: 'cheetah', emoji: '😨', dur: 0.4 },
    { at: 4.5, kind: 'burst', actor: 'car', n: 1, dx: 10, dy: 6, dur: 0.45 },
    { at: 4.85, kind: 'dizzy', actor: 'boy', dur: 1.0 },
    { at: 5.0, kind: 'pop', actor: 'cheetah', emoji: '😲', dur: 0.45 },
    { at: 7.45, kind: 'burst', actor: 'train', emoji: '✨', n: 8, dur: 0.6 },
    { at: 7.4, kind: 'pop', actor: 'boy', emoji: '😍', dx: -8, dur: 0.4 },
    { at: 8.0, kind: 'pop', actor: 'cheetah', emoji: '😤', dur: 0.35 },
    { at: 8.4, kind: 'dizzy', actor: 'car', dur: 0.6 },
    { at: 9.05, kind: 'pop', actor: 'boy', emoji: '✌️', dx: -8, dur: 0.5 },
    { at: 9.6, kind: 'sweat', actor: 'cheetah' },
    { at: 9.65, kind: 'pop', actor: 'cheetah', emoji: '😵', dur: 0.4 },
  ],
  camera: [
    { at: 4.5, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  lights: [
    // 撞上輪胎堆：白光一閃
    { at: 4.5, dur: 0.04, level: -0.6 },
    { at: 4.54, dur: 0.25, level: 0 },
  ],
  cues: [
    { at: 0.65, sfx: 'rumble' },
    { at: 1.2, say: '捷' },
    { at: 1.35, sfx: 'whoosh' },
    { at: 1.4, sfx: 'slide' },
    { at: 2.25, sfx: 'whoosh' },
    { at: 3.15, sfx: 'rumble' },
    { at: 4.15, sfx: 'whoosh' },
    { at: 4.5, sfx: 'bonk' },
    { at: 5.85, say: '捷' },
    { at: 6.95, sfx: 'whoosh' },
    { at: 7.45, say: '捷運' },
    { at: 7.75, sfx: 'boing' },
    { at: 8.3, sfx: 'whoosh' },
    { at: 8.6, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
