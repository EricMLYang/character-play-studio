import type { Clip } from '../clip'

// 紅：披風英雄插腰指著一排紅色線軸和紅色橫樑，想帥氣飛過去撞倒——一跳，太長的披風蓋住頭，看不見路，絆倒用肚子滑過去，
// 「砰」地把整排撞飛：線軸堆成「糸」、橫樑疊成「工」，拼出「紅」。躲在最後面的布忍者被彈飛倒栽蔥，煙霧彈遲到才爆——
// 噴出來的不是煙，是一個紅包。最後英雄得意扭一扭，披風又蓋住頭。紅、紅、紅包
const clip: Clip = {
  char: '紅',
  meta: { theme: '英雄肚子滑壘打保齡球', cast: '披風英雄＋布忍者＋紅線軸紅橫樑', gags: ['披風蓋住頭看不見路', '絆倒肚子滑壘撞飛一排', '煙霧彈遲到噴出紅包'] },
  duration: 10,
  bg: { top: '#FFF1C2', bottom: '#FFF9E6', floor: '#F3E6CF', scenery: 'room' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 140, y: 72, size: 12 },
    { id: 'sp1', emoji: '🧵', x: 100, y: 70, size: 9 },
    { id: 'sp2', emoji: '🧵', x: 109, y: 70, size: 9 },
    { id: 'bm1', emoji: '🪵', x: 118, y: 70, size: 9, tint: 'sepia(1) saturate(6) hue-rotate(-35deg)' },
    { id: 'bm2', emoji: '🪵', x: 127, y: 70, size: 9, tint: 'sepia(1) saturate(6) hue-rotate(-35deg)' },
    { id: 'envelope', emoji: '🧧', x: 140, y: 60, size: 8, hidden: true },
    { id: 'hero', emoji: 'hero:cape/pose', x: 22, y: 71, size: 14, flip: true },
  ],
  moves: [
    { at: 0.2, actor: 'hero', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 0.9, actor: 'sp1', do: 'flash', dur: 0.5 },
    { at: 0.95, actor: 'sp2', do: 'flash', dur: 0.5 },
    { at: 1.0, actor: 'bm1', do: 'flash', dur: 0.5 },
    { at: 1.05, actor: 'bm2', do: 'flash', dur: 0.5 },
    { at: 1.2, actor: 'ninja', do: 'hop', amount: 2, dur: 0.3 },
    // 一跳——披風蓋住頭，看不見，歪歪扭扭亂跑
    { at: 1.7, actor: 'hero', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.9, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 1.9, actor: 'hero', do: 'moveTo', to: { x: 30, y: 60 }, dur: 0.3, ease: 'out' },
    { at: 2.2, actor: 'hero', do: 'moveTo', to: { x: 38, y: 71 }, dur: 0.3, ease: 'in' },
    { at: 2.5, actor: 'hero', do: 'tilt', amount: -15, dur: 0.25 },
    { at: 2.5, actor: 'hero', do: 'moveTo', to: { x: 44, y: 71 }, dur: 0.25 },
    { at: 2.75, actor: 'hero', do: 'tilt', amount: 15, dur: 0.25 },
    // 絆到披風——撲倒，用肚子滑過去
    { at: 3.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 3.0, actor: 'hero', do: 'moveTo', to: { x: 96, y: 71 }, dur: 0.55, ease: 'in' },
    // 砰！整排撞飛
    { at: 3.55, actor: 'hero', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 3.6, actor: 'sp1', do: 'moveTo', to: { x: 70, y: 22 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'sp2', do: 'moveTo', to: { x: 66, y: 50 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 3.62, actor: 'bm1', do: 'moveTo', to: { x: 92, y: 20 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 3.62, actor: 'bm2', do: 'moveTo', to: { x: 96, y: 56 }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'sp1', do: 'spin', times: 2, dur: 0.4 },
    { at: 3.6, actor: 'sp2', do: 'spin', times: 2, dur: 0.4 },
    { at: 3.62, actor: 'bm1', do: 'spin', times: 2, dur: 0.4 },
    { at: 3.62, actor: 'bm2', do: 'spin', times: 2, dur: 0.4 },
    { at: 4.0, actor: 'sp1', do: 'vanish', dur: 0.15 },
    { at: 4.3, actor: 'sp2', do: 'vanish', dur: 0.15 },
    { at: 4.5, actor: 'bm1', do: 'vanish', dur: 0.15 },
    { at: 4.7, actor: 'bm2', do: 'vanish', dur: 0.15 },
    // 忍者被彈飛，倒栽蔥落在右下角
    { at: 3.65, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 3.65, actor: 'ninja', do: 'moveTo', to: { x: 146, y: 55 }, arc: 14, dur: 0.5, ease: 'out' },
    { at: 3.65, actor: 'ninja', do: 'rotateTo', amount: 180, dur: 0.5 },
    { at: 4.15, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.2 },
    // 英雄滑回左邊，跳起來擺帥氣姿勢，披風終於掛好
    { at: 3.8, actor: 'hero', do: 'moveTo', to: { x: 26, y: 71 }, dur: 0.6, ease: 'out' },
    { at: 4.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 4.5, actor: 'hero', do: 'hop', amount: 6, dur: 0.35 },
    // 忍者翻正，煙霧彈遲到才爆——噴出一個紅包
    { at: 5.6, actor: 'ninja', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 5.6, actor: 'ninja', do: 'moveTo', to: { x: 142, y: 72 }, dur: 0.3 },
    { at: 5.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 6.4, actor: 'ninja', do: 'tint', filter: 'sepia(1) saturate(5) hue-rotate(-40deg)' },
    { at: 6.45, actor: 'envelope', do: 'pop', dur: 0.4 },
    { at: 6.45, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 7.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.1, actor: 'envelope', do: 'moveTo', to: { x: 142, y: 54 }, dur: 0.3 },
    { at: 7.1, actor: 'envelope', do: 'bounce', amount: 3, times: 2, dur: 0.6 },
    // 回馬槍：英雄得意扭一扭——披風又蓋住頭
    { at: 8.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 8.0, actor: 'hero', do: 'tilt', amount: 12, dur: 0.3 },
    { at: 8.3, actor: 'hero', do: 'tilt', amount: -12, dur: 0.3 },
    { at: 8.7, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 8.75, actor: 'hero', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 8.9, actor: 'ninja', do: 'hop', amount: 4, dur: 0.3 },
  ],
  builds: [
    // 撞飛的線軸 → 糸；撞飛的橫樑 → 工
    { at: 4.0, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5], from: 'sp1', color: '#E03131' },
    { at: 4.5, dur: 0.5, strokes: [6, 7, 8], from: 'bm1', color: '#F03E3E' },
  ],
  glyph: [{ at: 5.05, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'pop', actor: 'hero', emoji: '❗', dur: 0.5 },
    { at: 1.25, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.5 },
    { at: 1.95, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.9 },
    { at: 2.5, kind: 'sweat', actor: 'hero' },
    { at: 3.05, kind: 'puff', actor: 'hero', dur: 0.5 },
    { at: 3.55, kind: 'burst', actor: 'hero', n: 1, dur: 0.4, dx: 6 },
    { at: 4.5, kind: 'pop', actor: 'hero', emoji: '😎', dur: 0.5 },
    { at: 6.4, kind: 'burst', actor: 'ninja', emoji: '🔴', n: 7, dur: 0.6 },
    { at: 6.4, kind: 'puff', actor: 'ninja', dur: 0.6 },
    { at: 7.2, kind: 'pop', actor: 'ninja', emoji: '👍', dur: 0.6, dx: -12 },
    { at: 8.7, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.9 },
  ],
  camera: [
    // 滑壘跟拍，撞上去那一刻震一下、退回全景
    { at: 3.0, dur: 0.3, do: 'follow', actor: 'hero', amount: 1.3 },
    { at: 3.55, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 3.55, dur: 0.4, do: 'shake', amount: 1.5 },
  ],
  cues: [
    { at: 0.9, say: '紅' },
    { at: 1.9, sfx: 'boing' },
    { at: 3.0, sfx: 'slide' },
    { at: 3.55, sfx: 'bonk' },
    { at: 4.15, sfx: 'plop' },
    { at: 5.1, say: '紅' },
    { at: 6.4, sfx: 'poof' },
    { at: 6.5, say: '紅包' },
    { at: 8.7, sfx: 'whoosh' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
