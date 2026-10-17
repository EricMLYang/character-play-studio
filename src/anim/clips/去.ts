import type { Clip } from '../clip'
import { ride } from '../helpers'

// 去：橡膠恐龍想抓腳邊那個藍色小鉤子，小短手怎麼伸都搆不到；鉤子吐舌頭溜走，恐龍背著三根長條滿場追、絆倒自己的大腳，
// 最後飛撲肚子著地「啪」——背上的長條震成「土」，鉤子從肚子底下擠出來變成「厶」。恐龍暈暈地「回去」自己的小窩，結果小窩也溜了。去、去、回去
const clip: Clip = {
  char: '去',
  meta: { theme: '恐龍追逃跑的筆畫', cast: '橡膠恐龍＋藍色小鉤子＋小窩', gags: ['小短手搆不到', '滿場追絆倒', '飛撲肚子著地', '小窩也溜走回馬槍'] },
  duration: 10,
  bg: { top: '#D3F5E4', bottom: '#F0FBF5', floor: '#E8D3A6', scenery: 'desert' },
  actors: [
    { id: 'nest', emoji: '🪹', x: 18, y: 74, size: 9 },
    { id: 'hook', emoji: '🪝', x: 32, y: 73.5, size: 7 },
    { id: 'dino', emoji: 'hero:dino/idle', x: 18, y: 71, size: 14, flip: true },
    { id: 'bars', emoji: '🟦', x: 15, y: 61, size: 5 },
  ],
  moves: [
    // 小短手伸、彎腰差點跌倒
    { at: 0.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 0.85, actor: 'hook', do: 'bounce', amount: 1.5, times: 2, dur: 0.4 },
    // 鉤子吐舌頭，咻地溜走
    { at: 1.25, actor: 'hook', do: 'hop', amount: 4, dur: 0.2 },
    { at: 1.45, actor: 'hook', do: 'moveTo', to: { x: 142, y: 73.5 }, dur: 0.45, ease: 'in' },
    { at: 1.95, actor: 'hook', do: 'moveTo', to: { x: 52, y: 73.5 }, arc: 10, dur: 0.55 },
    { at: 2.6, actor: 'hook', do: 'moveTo', to: { x: 132, y: 73.5 }, arc: 6, dur: 0.5 },
    { at: 3.25, actor: 'hook', do: 'moveTo', to: { x: 80, y: 73.5 }, dur: 0.35, ease: 'out' },
    { at: 3.7, actor: 'hook', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 1.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 2.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 2.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/idle' },
    { at: 3.75, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    ...ride([
      { at: 0.4, actor: 'dino', do: 'tilt', amount: 14, dur: 0.6 },
      { at: 1.6, actor: 'dino', do: 'moveTo', to: { x: 126, y: 71 }, dur: 0.55, anticipate: 3, ease: 'in' },
      // 單腳急轉彎
      { at: 2.15, actor: 'dino', do: 'flip' },
      { at: 2.15, actor: 'dino', do: 'moveTo', to: { x: 70, y: 71 }, dur: 0.35, ease: 'in' },
      // 絆到自己的大腳，翻一圈
      { at: 2.5, actor: 'dino', do: 'moveTo', to: { x: 52, y: 71 }, arc: 10, dur: 0.4, ease: 'out' },
      { at: 2.95, actor: 'dino', do: 'flip' },
      { at: 2.95, actor: 'dino', do: 'moveTo', to: { x: 116, y: 71 }, dur: 0.45, ease: 'back' },
      // 鉤子停在正中間，恐龍蹲低、甩尾巴、停格
      { at: 3.45, actor: 'dino', do: 'flip' },
      { at: 3.6, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.4 },
      { at: 3.75, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.3 },
      // 飛撲！
      { at: 4.05, actor: 'dino', do: 'moveTo', to: { x: 82, y: 71 }, arc: 16, dur: 0.35, ease: 'in' },
    ], 'bars', -10, 14),
    { at: 2.5, actor: 'dino', do: 'spin', times: 1, dur: 0.4 },
    { at: 4.4, actor: 'dino', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 4.45, actor: 'bars', do: 'hop', amount: 10, dur: 0.25 },
    { at: 4.5, actor: 'bars', do: 'vanish', dur: 0.15 },
    { at: 4.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    // 翻滾到左下角
    { at: 4.55, actor: 'dino', do: 'moveTo', to: { x: 36, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 4.55, actor: 'dino', do: 'spin', times: 1, dur: 0.4 },
    { at: 4.85, actor: 'hook', do: 'vanish', dur: 0.15 },
    // 站起來晃一晃，搖搖擺擺回去小窩
    { at: 6.4, actor: 'dino', do: 'tilt', amount: 10, dur: 0.3 },
    { at: 6.7, actor: 'dino', do: 'moveTo', to: { x: 19, y: 71 }, dur: 0.7 },
    { at: 6.7, actor: 'dino', do: 'bounce', amount: 1.5, times: 3, dur: 0.7 },
    { at: 7.4, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 7.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    // 回馬槍：小窩也吐舌頭溜走了
    { at: 8.3, actor: 'nest', do: 'hop', amount: 3, dur: 0.2 },
    { at: 8.5, actor: 'nest', do: 'moveTo', to: { x: -15, y: 74 }, dur: 0.35, ease: 'in' },
    { at: 8.55, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 8.6, actor: 'dino', do: 'hop', amount: -2, dur: 0.3 },
    { at: 9.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
  ],
  builds: [
    // 背上的三根長條震飛 → 土；鉤子從肚子底下擠出來 → 厶
    { at: 4.5, dur: 0.5, strokes: [0, 1, 2], from: 'bars', color: '#1C4ED8' },
    { at: 4.9, dur: 0.4, strokes: [3, 4], from: 'hook', color: '#3B5BDB' },
  ],
  glyph: [{ at: 5.35, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'sweat', actor: 'dino' },
    { at: 1.25, kind: 'pop', actor: 'hook', emoji: '😛', dur: 0.5 },
    { at: 1.6, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 2.15, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 2.6, kind: 'burst', actor: 'dino', emoji: '⭐', n: 5, dur: 0.5 },
    { at: 3.5, kind: 'pop', actor: 'dino', emoji: '😠', dur: 0.4 },
    { at: 4.4, kind: 'burst', actor: 'dino', n: 1, dur: 0.4 },
    { at: 4.4, kind: 'puff', actor: 'dino', dur: 0.5 },
    { at: 5.0, kind: 'dizzy', actor: 'dino', dur: 1.3 },
    { at: 7.5, kind: 'pop', actor: 'dino', emoji: '👋', dur: 0.5 },
    { at: 8.4, kind: 'pop', actor: 'nest', emoji: '😛', dur: 0.4 },
    { at: 8.7, kind: 'sweat', actor: 'dino' },
  ],
  camera: [
    { at: 1.6, dur: 0.3, do: 'follow', actor: 'dino', amount: 1.3 },
    { at: 3.4, dur: 0.4, do: 'zoom', amount: 1.3, to: { x: 96, y: 62 } },
    { at: 4.4, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 4.45, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 1.3, say: '去' },
    { at: 1.45, sfx: 'whoosh' },
    { at: 2.15, sfx: 'slide' },
    { at: 2.5, sfx: 'bonk' },
    { at: 4.05, sfx: 'whoosh' },
    { at: 4.4, sfx: 'splash' },
    { at: 5.35, say: '去' },
    { at: 6.75, say: '回去' },
    { at: 7.4, sfx: 'plop' },
    { at: 8.5, sfx: 'whoosh' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
