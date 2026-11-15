import type { Clip } from '../clip'

// 包：浣熊花生把包子一顆顆疊成搖搖晃晃的高塔，積木小隊還爬上去加高；他踮腳放好最後一顆小包子，得意地放手敬禮——塔轟然倒下，
// 包子和積木摔成「包」，花生被埋在包子堆裡只剩眼睛，一顆熱騰騰的包子冒著煙掉在他頭上；最後他敬禮，積木小隊也跟著敬禮，搖一搖翻倒。包、包、包子
const BUNS = [{ y: 72, at: 0.95 }, { y: 66, at: 1.5 }, { y: 60, at: 1.85 }, { y: 54, at: 2.15 }]

const clip: Clip = {
  char: '包',
  meta: { theme: '包子疊疊樂', cast: '浣熊花生＋積木小隊＋包子', gags: ['越疊越晃', '積木小隊爬上去加高', '放手敬禮塔倒了', '被包子埋只剩眼睛'] },
  duration: 10,
  bg: { top: '#FFF7EE', bottom: '#FDEBDD', floor: '#EFD6BE', scenery: 'room' },
  actors: [
    ...BUNS.map((b, i) => ({ id: `n${i}`, emoji: '🥟', x: 80, y: b.y, size: 8, hidden: true })),
    { id: 'tiny', emoji: '🥟', x: 80, y: 35.5, size: 5, hidden: true },
    { id: 'brick', emoji: 'hero:brick/march', x: 98, y: 71.5, size: 13, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 64, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'hat', emoji: '🥟', x: 27, y: 70, size: 6, hidden: true },
    { id: 'p1', emoji: '🥟', x: 18, y: 73, size: 9, hidden: true },
    { id: 'p2', emoji: '🥟', x: 27, y: 74, size: 10, hidden: true },
    { id: 'p3', emoji: '🥟', x: 36, y: 73, size: 9, hidden: true },
  ],
  moves: [
    // 抱著一大盤包子跑進來，放下第一顆
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.6, ease: 'out' },
    ...BUNS.flatMap((b, i) => [
      { at: b.at, actor: `n${i}`, do: 'pop' as const, dur: 0.2 },
      { at: b.at + 0.15, actor: `n${i}`, do: 'squash' as const, amount: 0.3, dur: 0.2 },
      { at: b.at - 0.1, actor: 'raccoon', do: 'squash' as const, amount: -0.12 - i * 0.05, dur: 0.3 },
    ]),
    // 塔越疊越晃
    ...BUNS.map((_, i) => ({ at: 2.3, actor: `n${i}`, do: 'shake' as const, amount: 0.4 + i * 0.5, dur: 1.6 })),
    // 積木小隊從右邊排隊走進來，爬上塔頂
    { at: 2.3, actor: 'brick', do: 'enter', from: { x: 175, y: 71.5 }, dur: 0.6, ease: 'out' },
    { at: 2.3, actor: 'brick', do: 'bounce', amount: 1.5, times: 4, dur: 0.6 },
    { at: 3.0, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 3.0, actor: 'brick', do: 'moveTo', to: { x: 80, y: 44 }, arc: 10, dur: 0.4 },
    { at: 3.4, actor: 'brick', do: 'shake', amount: 2, dur: 0.6 },
    // 踮腳放上最後一顆小包子——定格
    { at: 3.4, actor: 'raccoon', do: 'squash', amount: -0.3, dur: 0.4 },
    { at: 3.55, actor: 'tiny', do: 'pop', dur: 0.2 },
    { at: 3.75, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 得意地放手敬禮——塔倒了
    { at: 4.15, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    ...BUNS.map((_, i) => ({ at: 4.3, actor: `n${i}`, do: 'rotateTo' as const, amount: -20 - i * 15, dur: 0.15 })),
    ...BUNS.map((_, i) => ({ at: 4.4, actor: `n${i}`, do: 'vanish' as const, dur: 0.15 })),
    { at: 4.3, actor: 'tiny', do: 'vanish', dur: 0.15 },
    { at: 4.35, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.35, actor: 'brick', do: 'moveTo', to: { x: 146, y: 71.5 }, arc: 16, dur: 0.6, ease: 'out' },
    { at: 4.35, actor: 'brick', do: 'spin', times: 2, dur: 0.6 },
    // 花生被沖到左下角，被包子埋起來
    { at: 4.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.4, actor: 'raccoon', do: 'moveTo', to: { x: 27, y: 71.1 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 4.9, actor: 'p1', do: 'drop', dur: 0.4 },
    { at: 5.0, actor: 'p3', do: 'drop', dur: 0.4 },
    { at: 5.1, actor: 'p2', do: 'drop', dur: 0.4 },
    // 一顆熱騰騰的包子冒出來，掉在他頭上
    { at: 6.0, actor: 'hat', do: 'pop', dur: 0.2 },
    { at: 6.0, actor: 'hat', do: 'moveTo', to: { x: 26, y: 61.5 }, arc: 12, dur: 0.45, ease: 'bounce' },
    { at: 6.5, actor: 'raccoon', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 6.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 7.0, actor: 'hat', do: 'bounce', amount: 1, times: 2, dur: 0.5 },
    { at: 7.6, actor: 'brick', do: 'swap', emoji: 'hero:brick/idle' },
    // 回馬槍：花生從包子堆裡敬禮，積木小隊也敬禮——搖一搖，翻倒
    { at: 8.2, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 8.2, actor: 'hat', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 8.6, actor: 'brick', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 8.7, actor: 'brick', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 9.0, actor: 'brick', do: 'tilt', amount: -15, dur: 0.3 },
    { at: 9.3, actor: 'brick', do: 'rotateTo', amount: 90, dur: 0.3, ease: 'bounce' },
    { at: 9.3, actor: 'brick', do: 'moveTo', to: { x: 146, y: 75 }, dur: 0.3 },
  ],
  builds: [
    // 積木和上面的包子摔成外面的勹，下面的包子擠成裡面的巳
    { at: 4.4, dur: 0.45, strokes: [0, 1], from: 'n3', color: '#C2255C' },
    { at: 4.85, dur: 0.55, strokes: [2, 3, 4], from: 'n1', color: '#D6336C' },
  ],
  glyph: [{ at: 5.45, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'raccoon', emoji: '👉', dur: 0.4 },
    { at: 2.0, kind: 'sweat', actor: 'raccoon', dur: 0.6 },
    { at: 3.45, kind: 'pop', actor: 'brick', emoji: '😰', dur: 0.5 },
    { at: 4.3, kind: 'burst', x: 80, y: 52, emoji: '☁️', n: 6, dur: 0.6 },
    { at: 4.2, kind: 'pop', actor: 'raccoon', emoji: '🫡', dur: 0.3 },
    { at: 5.1, kind: 'puff', actor: 'p2', dur: 0.5 },
    { at: 5.0, kind: 'dizzy', actor: 'brick', dur: 1.5 },
    { at: 6.45, dur: 1.2, kind: 'zzz', actor: 'hat', emoji: '♨️' },
    { at: 9.3, kind: 'pop', actor: 'raccoon', emoji: '😆', dur: 0.5 },
  ],
  camera: [
    // 定格那一拍推近塔頂，倒下前回全景
    { at: 3.6, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 80, y: 46 } },
    { at: 4.15, dur: 0.2, do: 'zoom', amount: 1 },
    { at: 4.4, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 1.1, sfx: 'plop' },
    { at: 1.15, say: '包' },
    { at: 1.65, sfx: 'plop' },
    { at: 2.0, sfx: 'plop' },
    { at: 2.3, sfx: 'plop' },
    { at: 2.3, sfx: 'tap' },
    { at: 3.55, sfx: 'blip' },
    { at: 4.4, sfx: 'rumble' },
    { at: 5.5, say: '包' },
    { at: 6.0, say: '包子' },
    { at: 6.45, sfx: 'plop' },
    { at: 9.3, sfx: 'tap' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
