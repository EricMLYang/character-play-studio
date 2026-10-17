import type { Clip } from '../clip'

// 高：馬達太強的玩具機器人想爬上高高的積木塔頂。第一跳太用力直接飛出畫面、掉回來摔成餅（花生還在這時候敬禮）；
// 後仰蓄力全速衝鋒，咚！塔被撞散，積木嘩啦落成「高」，花生那疊最上面的小積木掉成最上面一點；小高山冒出來，機器人指著它——又興奮得飛出去摔成餅。高、高、高山
const clip: Clip = {
  char: '高',
  meta: { theme: '積木塔衝鋒', cast: '機器人＋浣熊花生＋積木塔＋小高山', gags: ['跳太用力飛出畫面摔成餅', '後仰蓄力衝鋒撞塔', '敬禮敬錯時機', '回馬槍又飛出去'] },
  duration: 10,
  bg: { top: '#FFF6D6', bottom: '#FFEFC2', floor: '#E8D3A8', scenery: 'room' },
  actors: [
    { id: 'mountain', emoji: '🏔️', x: 146, y: 68.5, size: 20, hidden: true },
    { id: 't1', emoji: '🧱', x: 80, y: 69, size: 10 },
    { id: 't2', emoji: '🧱', x: 80, y: 60, size: 10 },
    { id: 't3', emoji: '🧱', x: 80, y: 51, size: 10 },
    { id: 't4', emoji: '🧱', x: 80, y: 42, size: 10 },
    { id: 't5', emoji: '🧱', x: 80, y: 33, size: 10 },
    { id: 't6', emoji: '🧱', x: 80, y: 24, size: 10 },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 126, y: 71.1, size: 14 },
    { id: 'top', emoji: '🟥', x: 127, y: 58, size: 5, float: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 20, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    // 登場，看到塔頂，興奮地跳一下
    { at: 0, actor: 'robot', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.5, ease: 'out' },
    { at: 0.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 0.7, actor: 'robot', do: 'hop', amount: 5, dur: 0.35 },
    { at: 1.4, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    // 第一跳：馬達太強，直接飛出畫面
    { at: 1.6, actor: 'robot', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 1.85, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 1.85, actor: 'robot', do: 'moveTo', to: { x: 30, y: -30 }, dur: 0.35, ease: 'in' },
    { at: 2.25, actor: 'robot', do: 'moveTo', to: { x: 64, y: -30 }, dur: 0.1 },
    // 空了一拍，掉回塔腳摔成餅
    { at: 2.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 2.6, actor: 'robot', do: 'moveTo', to: { x: 64, y: 71.1 }, dur: 0.3, ease: 'in' },
    { at: 2.9, actor: 'robot', do: 'squash', amount: 0.7, dur: 0.6 },
    // 花生在最糟的時候敬禮，他那疊晃了一下
    { at: 3.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 3.0, actor: 'top', do: 'tilt', amount: 25, dur: 0.5 },
    { at: 3.0, actor: 'top', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 3.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/carry' },
    { at: 3.55, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 3.55, actor: 'robot', do: 'shake', amount: 1.5, dur: 0.35 },
    // 退到最左邊，後仰到快倒，蓄力
    { at: 3.9, actor: 'robot', do: 'moveTo', to: { x: 14, y: 71.1 }, dur: 0.45 },
    { at: 4.4, actor: 'robot', do: 'rotateTo', amount: -28, dur: 0.45, ease: 'out' },
    { at: 4.4, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 5.0, actor: 'robot', do: 'rotateTo', amount: 28, dur: 0.12 },
    { at: 5.0, actor: 'robot', do: 'moveTo', to: { x: 68, y: 71.1 }, dur: 0.32, anticipate: 4, ease: 'in' },
    // 咚！擠成手風琴
    { at: 5.32, actor: 'robot', do: 'squash', amount: 0.55, dur: 0.45 },
    { at: 5.35, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 塔被撞散
    { at: 5.35, actor: 't1', do: 'moveTo', to: { x: 96, y: 50 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 5.35, actor: 't2', do: 'moveTo', to: { x: 64, y: 30 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 5.35, actor: 't3', do: 'moveTo', to: { x: 100, y: 22 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 5.35, actor: 't4', do: 'moveTo', to: { x: 58, y: 12 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 5.35, actor: 't5', do: 'moveTo', to: { x: 90, y: 6 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 5.35, actor: 't6', do: 'moveTo', to: { x: 74, y: 2 }, arc: 10, dur: 0.4, ease: 'out' },
    ...['t1', 't2', 't3', 't4', 't5', 't6'].map((id) => ({ at: 5.6, actor: id, do: 'vanish' as const, dur: 0.2 })),
    // 頭昏走到左下角
    { at: 5.85, actor: 'robot', do: 'moveTo', to: { x: 30, y: 71.1 }, dur: 0.6 },
    { at: 5.85, actor: 'robot', do: 'tilt', amount: 12, dur: 0.6 },
    // 花生那疊一歪，最上面的小積木掉成那一點
    { at: 6.5, actor: 'raccoon', do: 'tilt', amount: -15, dur: 0.4 },
    { at: 6.55, actor: 'top', do: 'vanish', dur: 0.15 },
    // 打嗝彈回方方正正
    { at: 6.8, actor: 'robot', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.8, actor: 'robot', do: 'swap', emoji: 'hero:robot/happy' },
    // 小高山冒出來
    { at: 7.5, actor: 'mountain', do: 'pop', dur: 0.4 },
    { at: 7.55, actor: 'raccoon', do: 'flip' },
    { at: 7.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.6, actor: 'robot', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 回馬槍：太興奮，又飛出去摔成餅
    { at: 8.5, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.7, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 8.7, actor: 'robot', do: 'moveTo', to: { x: 30, y: -30 }, dur: 0.3, ease: 'in' },
    { at: 9.2, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 9.2, actor: 'robot', do: 'moveTo', to: { x: 30, y: 71.1 }, dur: 0.25, ease: 'in' },
    { at: 9.45, actor: 'robot', do: 'squash', amount: 0.7, dur: 0.5 },
  ],
  builds: [
    // 撞散的積木像下雨一樣落成「高」的下面九筆，深紅色
    { at: 5.55, dur: 1.0, strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9], from: 't3', style: 'drop', color: '#C92A2A' },
    // 花生那疊最上面的小積木 → 最上面那一點
    { at: 6.55, dur: 0.35, strokes: [0], from: 'top', color: '#C92A2A' },
  ],
  glyph: [{ at: 7.0, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.65, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.6 },
    { at: 0.9, kind: 'bubble', actor: 'robot', emoji: '⬆️', dur: 0.9 },
    { at: 1.6, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 2.9, kind: 'burst', actor: 'robot', dur: 0.4 },
    { at: 3.2, kind: 'pop', actor: 'raccoon', emoji: '😅', dur: 0.5 },
    { at: 3.6, kind: 'pop', actor: 'robot', emoji: '💢', dur: 0.4 },
    { at: 4.5, kind: 'sweat', actor: 'robot', dur: 0.5 },
    { at: 5.32, kind: 'burst', actor: 'robot', dur: 0.45 },
    { at: 5.35, kind: 'puff', actor: 'robot', dur: 0.5 },
    { at: 5.85, kind: 'dizzy', actor: 'robot', dur: 0.9 },
    { at: 7.6, kind: 'pop', actor: 'robot', emoji: '👉', dx: 6, dur: 0.8 },
    { at: 9.45, kind: 'burst', actor: 'robot', dur: 0.35 },
    { at: 9.5, kind: 'pop', actor: 'raccoon', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    // 後仰蓄力時慢慢推近，衝出去之前退回全景；撞上時震
    { at: 4.4, dur: 0.55, do: 'zoom', amount: 1.3, actor: 'robot' },
    { at: 5.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.32, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.7, sfx: 'boing' },
    { at: 1.0, say: '高' },
    { at: 1.85, sfx: 'whoosh' },
    { at: 2.9, sfx: 'bonk' },
    { at: 4.4, sfx: 'rumble' },
    { at: 5.0, sfx: 'whoosh' },
    { at: 5.32, sfx: 'bonk' },
    { at: 6.8, sfx: 'hic' },
    { at: 7.0, say: '高' },
    { at: 7.6, say: '高山' },
    { at: 8.7, sfx: 'whoosh' },
    { at: 9.45, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
