import type { Clip } from '../clip'

// 親：披風英雄想親一下躲在高櫃頂上的布忍者，搆不到，就把紅積木一塊塊疊高；披風一直蓋住頭，他摸黑亂放，塔越疊越歪。
// 最後放上一顆小愛心——忍者的煙霧彈偏偏這時噗一聲，整座塔嘩啦倒成「親」，英雄被埋得只剩眼睛。忍者跳下來，英雄探出頭「啾」！親、親、親一下
const clip: Clip = {
  char: '親',
  meta: { theme: '英雄疊塔親忍者', cast: '披風英雄＋布忍者＋高櫃＋紅積木', gags: ['披風蓋頭摸黑疊塔', '放一顆愛心整座倒', '被埋到只剩眼睛'] },
  duration: 10,
  bg: { top: '#FFE3E3', bottom: '#FFF5F5', floor: '#E8C9A8', scenery: 'room' },
  actors: [
    { id: 'shelf', emoji: '🗄️', x: 146, y: 64.4, size: 30 },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 146, y: 43.5, size: 12 },
    { id: 'k1', emoji: '🟥', x: 80, y: 71.5, size: 7, hidden: true },
    { id: 'k2', emoji: '🟥', x: 80, y: 65, size: 7, hidden: true },
    { id: 'k3', emoji: '🟥', x: 81, y: 58.5, size: 7, hidden: true },
    { id: 'k4', emoji: '🟥', x: 79, y: 52, size: 7, hidden: true },
    { id: 'heart', emoji: '❤️', x: 79, y: 46, size: 5.5, hidden: true },
    { id: 'hero', emoji: 'hero:cape/idle', x: 28, y: 71.1, size: 14, flip: true },
    { id: 'r1', emoji: '🟥', x: 22, y: 73.5, size: 7, hidden: true },
    { id: 'r2', emoji: '🟥', x: 29, y: 74, size: 7, hidden: true },
    { id: 'r3', emoji: '🟥', x: 35, y: 73.5, size: 7, hidden: true },
  ],
  moves: [
    // 嘟嘴、指著櫃子上的忍者
    { at: 0.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 0.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 0.85, actor: 'ninja', do: 'hop', amount: 2, dur: 0.3 },
    { at: 1.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    // 疊塔：第一塊
    { at: 1.4, actor: 'hero', do: 'moveTo', to: { x: 66, y: 71.1 }, dur: 0.35 },
    { at: 1.75, actor: 'k1', do: 'pop' },
    { at: 1.75, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 2.05, actor: 'k2', do: 'pop' },
    { at: 2.05, actor: 'hero', do: 'hop', amount: 3, dur: 0.25 },
    // 披風蓋住頭，摸黑亂放
    { at: 2.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 2.45, actor: 'hero', do: 'hop', amount: 6, dur: 0.3 },
    { at: 2.6, actor: 'k3', do: 'pop' },
    { at: 2.85, actor: 'hero', do: 'hop', amount: 10, dur: 0.35 },
    { at: 3.0, actor: 'k4', do: 'pop' },
    // 塔左搖右晃
    { at: 3.1, actor: 'k3', do: 'moveTo', to: { x: 83, y: 58.5 }, dur: 0.3 },
    { at: 3.1, actor: 'k4', do: 'moveTo', to: { x: 84, y: 52 }, dur: 0.3 },
    { at: 3.4, actor: 'k3', do: 'moveTo', to: { x: 78, y: 58.5 }, dur: 0.35 },
    { at: 3.4, actor: 'k4', do: 'moveTo', to: { x: 75, y: 52 }, dur: 0.35 },
    { at: 3.2, actor: 'ninja', do: 'shake', amount: 1, dur: 0.5 },
    // 最後一顆小愛心
    { at: 3.8, actor: 'hero', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 3.95, actor: 'hero', do: 'hop', amount: 16, dur: 0.5 },
    { at: 4.15, actor: 'heart', do: 'pop' },
    // 定格……忍者煙霧彈噗一聲
    { at: 4.85, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.25 },
    // 塔倒了
    { at: 5.05, actor: 'k4', do: 'rotateTo', amount: -40, dur: 0.25 },
    { at: 5.05, actor: 'k3', do: 'rotateTo', amount: -30, dur: 0.25 },
    { at: 5.05, actor: 'heart', do: 'moveTo', to: { x: 60, y: 30 }, dur: 0.3, ease: 'out' },
    { at: 5.15, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 5.15, actor: 'hero', do: 'moveTo', to: { x: 29, y: 71.1 }, dur: 0.4, ease: 'out' },
    { at: 5.2, actor: 'k4', do: 'vanish', dur: 0.2 },
    { at: 5.45, actor: 'k3', do: 'vanish', dur: 0.2 },
    { at: 5.7, actor: 'k2', do: 'vanish', dur: 0.2 },
    { at: 5.9, actor: 'k1', do: 'vanish', dur: 0.2 },
    { at: 5.35, actor: 'heart', do: 'vanish', dur: 0.2 },
    // 英雄被埋得只剩眼睛
    { at: 5.55, actor: 'r1', do: 'drop', dur: 0.4 },
    { at: 5.65, actor: 'r2', do: 'drop', dur: 0.4 },
    { at: 5.75, actor: 'r3', do: 'drop', dur: 0.4 },
    { at: 5.55, actor: 'hero', do: 'moveTo', to: { x: 29, y: 75 }, dur: 0.3 },
    // 忍者跳下來
    { at: 6.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 6.7, actor: 'ninja', do: 'moveTo', to: { x: 44, y: 72 }, dur: 0.6, arc: 30 },
    { at: 6.7, actor: 'ninja', do: 'spin', times: 1, dur: 0.6 },
    { at: 7.3, actor: 'ninja', do: 'squash', amount: 0.3, dur: 0.25 },
    // 探出頭，啾！
    { at: 7.4, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 7.4, actor: 'hero', do: 'moveTo', to: { x: 31, y: 71.1 }, dur: 0.25, ease: 'back' },
    { at: 7.7, actor: 'hero', do: 'tilt', amount: 18, dur: 0.35 },
    { at: 7.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 7.9, actor: 'ninja', do: 'tint', filter: 'saturate(1.4) hue-rotate(-12deg)' },
    { at: 8.1, actor: 'ninja', do: 'moveTo', to: { x: 47, y: 72 }, dur: 0.25 },
    { at: 8.1, actor: 'ninja', do: 'tilt', amount: 25, dur: 0.4 },
    // 爬出來擺帥——披風又蓋住頭
    { at: 8.3, actor: 'r1', do: 'moveTo', to: { x: 14, y: 73.5 }, dur: 0.3, ease: 'out' },
    { at: 8.3, actor: 'r3', do: 'vanish', dur: 0.3 },
    { at: 8.4, actor: 'hero', do: 'hop', amount: 4, dur: 0.3 },
    { at: 8.7, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 9.1, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 9.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
  ],
  builds: [
    // 倒下的積木：立、木疊在左邊，見落在右邊
    { at: 5.15, dur: 0.6, strokes: [0, 1, 2, 3, 4], from: 'k4', color: '#C92A2A' },
    { at: 5.55, dur: 0.5, strokes: [5, 6, 7, 8], from: 'k2', color: '#C92A2A' },
    { at: 5.9, dur: 0.8, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'k3', color: '#E03131' },
  ],
  glyph: [{ at: 6.75, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'hero', emoji: '💋', dur: 0.5 },
    { at: 0.8, kind: 'pop', actor: 'ninja', emoji: '❗', dur: 0.5 },
    { at: 1.1, kind: 'pop', actor: 'hero', emoji: '💡', dur: 0.4 },
    { at: 2.35, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.5 },
    { at: 3.3, kind: 'pop', actor: 'ninja', emoji: '😅', dur: 0.6 },
    { at: 4.85, kind: 'puff', actor: 'ninja', dur: 0.5 },
    { at: 5.05, kind: 'puff', actor: 'k1', dur: 0.6 },
    { at: 5.9, kind: 'puff', actor: 'hero', dur: 0.5 },
    { at: 6.1, kind: 'pop', actor: 'hero', emoji: '👀', dy: 6, dur: 1.0 },
    { at: 7.8, kind: 'burst', actor: 'hero', emoji: '💕', n: 5, dx: 6 },
    { at: 8.0, kind: 'zzz', actor: 'ninja', emoji: '❤️', dur: 1.2 },
    { at: 9.1, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.6 },
  ],
  camera: [
    { at: 4.2, dur: 0.6, do: 'zoom', amount: 1.25, to: { x: 80, y: 50 } },
    { at: 5.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 5.15, dur: 0.35, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.8, sfx: 'tap' },
    { at: 1.75, say: '親' },
    { at: 2.05, sfx: 'tap' },
    { at: 2.6, sfx: 'tap' },
    { at: 3.0, sfx: 'tap' },
    { at: 4.15, sfx: 'blip' },
    { at: 4.85, sfx: 'poof' },
    { at: 5.1, sfx: 'rumble' },
    { at: 6.75, say: '親' },
    { at: 7.3, sfx: 'plop' },
    { at: 7.75, say: '親一下' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
