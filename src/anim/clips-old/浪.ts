import type { Clip, Move } from '../clip'
import { ride } from '../helpers'

// 浪：花生抱著三個搖搖晃晃的水桶，看到積木小隊就敬禮，差點全部打翻；他助跑、肚子貼地像保齡球一樣滑過濕地板，
// 三個水桶飛出去濺成三點水，他撞倒排成一列的積木小隊，積木翻滾疊成「良」。花生跳起來敬禮，滑過的水痕捲成一道小海浪，他站上去衝浪。浪、浪、海浪
const lead = 'raccoon'
const KX = [104, 112, 120, 128, 136, 144]
const carry = (moves: Move[]): Move[] => [
  ...ride(moves, 'pail1', -12, 14),
  ...ride(moves, 'pail2', -19, 14).filter((m) => m.actor !== lead),
  ...ride(moves, 'pail3', -26, 14).filter((m) => m.actor !== lead),
]
const pailFly = (id: string, at: number, x: number, y: number): Move[] => [
  { at, actor: id, do: 'moveTo', to: { x, y }, dur: 0.4, ease: 'out' },
  { at, actor: id, do: 'spin', dur: 0.4 },
  { at: at + 0.45, actor: id, do: 'vanish', dur: 0.15 },
]

const clip: Clip = {
  char: '浪',
  meta: { theme: '濕地板保齡球', cast: '浣熊花生＋積木小隊＋三個水桶', gags: ['敬禮差點打翻', '肚子貼地滑過去', '撞倒一整排積木'] },
  duration: 10,
  bg: { top: '#FFF1D6', bottom: '#FFF9EC', floor: '#9FE0E6', scenery: 'sea' },
  actors: [
    ...KX.map((x, i) => ({ id: `k${i}`, emoji: 'hero:brick/idle', x, y: 72, size: 11 })),
    { id: 'wave', emoji: '🌊', x: 140, y: 71, size: 15, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 30, y: 71, size: 14, hidden: true, flip: true },
    { id: 'pail1', emoji: '🪣', x: 30, y: 59, size: 8, hidden: true },
    { id: 'pail2', emoji: '🪣', x: 30, y: 52, size: 8, hidden: true },
    { id: 'pail3', emoji: '🪣', x: 30, y: 45, size: 8, hidden: true },
  ],
  moves: [
    ...carry([
      { at: 0, actor: lead, do: 'enter', from: { x: -15, y: 71 }, dur: 0.8, ease: 'out' },
      // 退到最左邊，助跑
      { at: 1.25, actor: lead, do: 'moveTo', to: { x: 14, y: 71 }, dur: 0.4 },
      { at: 1.7, actor: lead, do: 'squash', amount: -0.25, dur: 0.3 },
      { at: 2, actor: lead, do: 'moveTo', to: { x: 36, y: 71 }, dur: 0.3, ease: 'in' },
    ]),
    // 看到積木小隊，敬禮——水桶差點全倒
    { at: 0.95, actor: lead, do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 1.05, actor: 'pail3', do: 'tilt', amount: 35, dur: 0.6 },
    { at: 1.05, actor: 'pail2', do: 'tilt', amount: 20, dur: 0.6 },
    { at: 1.3, actor: lead, do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 1.3, actor: lead, do: 'shake', amount: 1.2, dur: 0.4 },
    ...KX.map((_, i): Move => ({ at: 1.2 + i * 0.05, actor: `k${i}`, do: 'shake', amount: 0.6, dur: 0.5 })),
    // 肚子貼地！水桶飛出去
    { at: 2.3, actor: lead, do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 2.3, actor: lead, do: 'rotateTo', amount: 90, dur: 0.15 },
    { at: 2.3, actor: lead, do: 'moveTo', to: { x: 42, y: 69 }, dur: 0.15 },
    ...pailFly('pail1', 2.35, 58, 22),
    ...pailFly('pail2', 2.4, 54, 40),
    ...pailFly('pail3', 2.45, 60, 56),
    // 像保齡球一樣滑過去，慢下來……停住
    { at: 2.5, actor: lead, do: 'moveTo', to: { x: 88, y: 69 }, dur: 0.75, ease: 'out' },
    // 積木小隊擠成一團發抖
    ...KX.map((x, i): Move => ({ at: 3.6, actor: `k${i}`, do: 'moveTo', to: { x: x - (i - 2.5) * 1.5, y: 72 }, dur: 0.25 })),
    // 碰！一整排撞翻
    { at: 3.95, actor: lead, do: 'moveTo', to: { x: 104, y: 69 }, dur: 0.15, ease: 'in' },
    ...KX.map((_, i): Move[] => [
      { at: 4.1 + i * 0.04, actor: `k${i}`, do: 'swap', emoji: 'hero:brick/dizzy' },
      { at: 4.1 + i * 0.04, actor: `k${i}`, do: 'moveTo', to: { x: 70 + i * 8, y: 8 + (i % 2) * 8 }, dur: 0.45, ease: 'out' },
      { at: 4.1 + i * 0.04, actor: `k${i}`, do: 'spin', times: 2, dur: 0.45 },
      { at: 4.6 + i * 0.04, actor: `k${i}`, do: 'vanish', dur: 0.12 },
    ]).flat(),
    // 花生暈暈地轉過去，滾到右下角
    { at: 4.1, actor: lead, do: 'rotateTo', amount: -90, dur: 0.2 },
    { at: 4.1, actor: lead, do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.1, actor: lead, do: 'moveTo', to: { x: 136, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 4.1, actor: lead, do: 'spin', dur: 0.5 },
    // 跳起來敬禮，海浪捲出來，他站上去衝浪
    { at: 5.9, actor: lead, do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 5.9, actor: lead, do: 'hop', amount: 6, dur: 0.35 },
    { at: 6.4, actor: 'wave', do: 'enter', from: { x: 175, y: 71 }, dur: 0.5, ease: 'out' },
    { at: 6.75, actor: lead, do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.75, actor: lead, do: 'moveTo', to: { x: 140, y: 60 }, dur: 0.35, arc: 6 },
    { at: 7.1, actor: lead, do: 'shake', amount: 1, dur: 0.6 },
    { at: 7.1, actor: 'wave', do: 'bounce', amount: 1.5, times: 3, dur: 0.9 },
    // 回馬槍：在浪上又敬了一個禮——不對的時機，一屁股掉進水裡
    { at: 8.2, actor: lead, do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.7, actor: 'wave', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.75, actor: lead, do: 'moveTo', to: { x: 126, y: 71 }, dur: 0.4, arc: 8 },
    { at: 9.15, actor: lead, do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 9.15, actor: lead, do: 'squash', amount: 0.3, dur: 0.3 },
  ],
  builds: [
    // 三個水桶濺下來，一顆一顆變成三點水
    { at: 2.7, dur: 0.4, strokes: [0], from: 'pail1', color: '#1864AB' },
    { at: 2.8, dur: 0.4, strokes: [1], from: 'pail2', color: '#1864AB' },
    { at: 2.9, dur: 0.4, strokes: [2], from: 'pail3', color: '#1864AB' },
    // 翻滾的積木疊成「良」，最上面那一點最後落下
    { at: 4.6, dur: 0.85, strokes: [4, 5, 6, 7, 8, 9], from: 'k2', color: '#0B4F8A' },
    { at: 5.45, dur: 0.3, strokes: [3], from: 'k5', color: '#0B4F8A' },
  ],
  glyph: [{ at: 5.8, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.0, kind: 'pop', actor: lead, emoji: '🫡', dy: -14, dur: 0.5 },
    { at: 1.35, kind: 'sweat', actor: lead, dy: -14 },
    { at: 1.4, kind: 'pop', actor: 'k3', emoji: '😆', dur: 0.6 },
    { at: 1.7, kind: 'puff', actor: lead },
    { at: 2.3, kind: 'burst', actor: lead, emoji: '💦', n: 6, dur: 0.5 },
    // 滑過去留下一道水痕
    { at: 2.5, dur: 1.2, kind: 'line', actor: lead, dy: 4, to: { x: 40, y: 74 }, color: '#4DABF7', width: 1.6 },
    { at: 3.6, kind: 'sweat', actor: 'k1' },
    { at: 3.6, kind: 'sweat', actor: 'k4' },
    { at: 4.05, kind: 'burst', x: 104, y: 62, emoji: '💥', dur: 0.4 },
    { at: 4.7, kind: 'dizzy', actor: lead, dur: 1.2 },
    { at: 6.0, kind: 'pop', actor: lead, emoji: '🫡', dur: 0.5 },
    { at: 6.9, kind: 'burst', actor: 'wave', emoji: '🫧', n: 5, dur: 0.6 },
    { at: 8.25, kind: 'pop', actor: lead, emoji: '🫡', dur: 0.5 },
    { at: 9.1, kind: 'burst', actor: lead, emoji: '💦', n: 6, dur: 0.5 },
  ],
  camera: [
    // 肚子貼地滑過去跟拍，撞之前回全景
    { at: 2.35, dur: 0.3, do: 'follow', actor: lead, amount: 1.3 },
    { at: 3.55, dur: 0.35, do: 'zoom', amount: 1 },
    { at: 4.05, dur: 0.35, do: 'shake', amount: 1.6 },
  ],
  cues: [
    { at: 1.0, sfx: 'tap' },
    { at: 2, sfx: 'whoosh' },
    { at: 2.3, say: '浪' },
    { at: 2.75, sfx: 'splash' },
    { at: 2.65, sfx: 'slide' },
    { at: 4.05, sfx: 'bonk' },
    { at: 4.6, sfx: 'clink' },
    { at: 5.8, say: '浪' },
    { at: 6.5, say: '海浪' },
    { at: 6.45, sfx: 'splash' },
    { at: 9.1, sfx: 'splash' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
