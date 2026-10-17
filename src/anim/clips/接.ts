import type { Clip } from '../clip'

// 接：拉布拉多警長輕輕拋來一顆小球，調皮小老鼠卻蹲成短跑起跑姿勢、使出全力衝刺——直接衝過頭，一頭撞進右邊的藍色積木棒堆，
// 棒子炸上天，掉下來排成「扌」「立」「女」，拼出「接」。警長衝進來維持秩序，結果自己衝出畫面。慢吞吞的小球終於掉下來，
// 小老鼠只伸出一隻手就接住；警長從右邊探頭回來，一臉莫名其妙。接、接、接住
const clip: Clip = {
  char: '接',
  meta: { theme: '跑道上接小球', cast: '調皮小老鼠＋拉布拉多警長＋藍色積木棒', gags: ['小球很慢卻全力衝刺衝過頭', '一頭撞進積木堆', '警長也衝出畫面'] },
  duration: 10,
  bg: { top: '#FFF3B8', bottom: '#FFFBE3', floor: '#E9A27A', scenery: 'track' },
  actors: [
    { id: 'r1', emoji: '🟦', x: 140, y: 71, size: 8 },
    { id: 'r2', emoji: '🟦', x: 140, y: 64, size: 8 },
    { id: 'r3', emoji: '🟦', x: 140, y: 57, size: 8 },
    { id: 'sheriff', emoji: 'hero:sheriff/idle', x: 16, y: 71, size: 15, flip: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 38, y: 72, size: 12, flip: true },
    { id: 'ball', emoji: '🟠', x: 22, y: 62, size: 6, float: true },
  ],
  moves: [
    // 警長低手輕輕一拋——好慢好慢的弧線
    { at: 0.4, actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 0.6, actor: 'ball', do: 'moveTo', to: { x: 66, y: 10 }, arc: 6, dur: 2.2, ease: 'out' },
    { at: 2.8, actor: 'ball', do: 'moveTo', to: { x: 44, y: 8 }, dur: 3.0, ease: 'inOut' },
    // 小老鼠死盯著球，扳手指，蹲成起跑姿勢
    { at: 0.9, actor: 'mouse', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 1.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
    { at: 1.4, actor: 'mouse', do: 'squash', amount: 0.35, dur: 0.6 },
    { at: 1.5, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.5 },
    // 咻——衝過頭，一頭撞進積木棒
    { at: 2.0, actor: 'mouse', do: 'moveTo', to: { x: 132, y: 72 }, dur: 0.35, anticipate: 4, ease: 'in' },
    { at: 2.35, actor: 'mouse', do: 'squash', amount: -0.35, dur: 0.25 },
    { at: 2.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 2.5, actor: 'mouse', do: 'shake', amount: 1, dur: 0.6 },
    { at: 2.38, actor: 'r1', do: 'moveTo', to: { x: 66, y: 18 }, arc: 20, dur: 0.7, ease: 'out' },
    { at: 2.38, actor: 'r2', do: 'moveTo', to: { x: 96, y: 14 }, arc: 20, dur: 0.7, ease: 'out' },
    { at: 2.38, actor: 'r3', do: 'moveTo', to: { x: 120, y: 20 }, arc: 20, dur: 0.7, ease: 'out' },
    { at: 2.38, actor: 'r1', do: 'spin', times: 2, dur: 0.8 },
    { at: 2.38, actor: 'r2', do: 'spin', times: 3, dur: 0.8 },
    { at: 2.38, actor: 'r3', do: 'spin', times: 2, dur: 0.8 },
    // 拔出來，腳冒煙往後滑回左下角
    { at: 3.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
    { at: 3.25, actor: 'mouse', do: 'moveTo', to: { x: 32, y: 72 }, dur: 0.9, ease: 'out' },
    { at: 3.45, actor: 'r1', do: 'vanish', dur: 0.2 },
    { at: 3.85, actor: 'r2', do: 'vanish', dur: 0.2 },
    { at: 4.45, actor: 'r3', do: 'vanish', dur: 0.2 },
    { at: 4.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 警長吹哨衝進來維持秩序——自己衝出畫面
    { at: 5.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/whistle' },
    { at: 5.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/run' },
    { at: 5.45, actor: 'sheriff', do: 'moveTo', to: { x: 190, y: 71 }, dur: 0.5, anticipate: 3, ease: 'in' },
    // 慢吞吞的球終於掉下來，伸手就接住
    { at: 6.0, actor: 'ball', do: 'moveTo', to: { x: 36, y: 63 }, dur: 0.8, ease: 'in' },
    { at: 6.75, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 6.8, actor: 'mouse', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 6.8, actor: 'ball', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 7.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 用一根手指轉球，耳朵得意地動一動
    { at: 7.5, actor: 'ball', do: 'moveTo', to: { x: 36, y: 60 }, dur: 0.2 },
    { at: 7.7, actor: 'ball', do: 'spin', times: 4, dur: 1.2 },
    { at: 7.7, actor: 'mouse', do: 'tilt', amount: 8, dur: 0.3 },
    { at: 8.0, actor: 'mouse', do: 'tilt', amount: -8, dur: 0.3 },
    // 回馬槍：警長從右邊探頭回來，聳聳肩
    { at: 8.3, actor: 'sheriff', do: 'flip' },
    { at: 8.3, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: 8.3, actor: 'sheriff', do: 'moveTo', to: { x: 152, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 8.9, actor: 'sheriff', do: 'hop', amount: 2, dur: 0.3 },
  ],
  builds: [
    // 炸上天的藍色棒子掉下來：掛勾的柱子＋橫桿 → 扌；一點、一橫、兩撇 → 立；交叉的兩腿＋一橫 → 女
    { at: 3.45, dur: 0.45, strokes: [0, 1, 2], from: 'r1', color: '#1C4FD8' },
    { at: 3.85, dur: 0.6, strokes: [3, 4, 5, 6, 7], from: 'r2', color: '#3B5BDB' },
    { at: 4.45, dur: 0.5, strokes: [8, 9, 10], from: 'r3', color: '#1C4FD8' },
  ],
  glyph: [{ at: 5.0, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.5 },
    { at: 1.5, kind: 'sweat', actor: 'mouse' },
    { at: 2.0, kind: 'puff', actor: 'mouse', dur: 0.5 },
    { at: 2.35, kind: 'burst', actor: 'mouse', n: 1, dur: 0.4, dx: 5 },
    { at: 2.6, kind: 'dizzy', actor: 'mouse', dur: 0.6 },
    { at: 3.3, kind: 'puff', actor: 'mouse', dur: 0.8 },
    { at: 3.4, kind: 'stink', actor: 'mouse', dur: 0.8, emoji: '💨' },
    { at: 5.05, kind: 'pop', actor: 'sheriff', emoji: '📣', dur: 0.4 },
    { at: 6.85, kind: 'pop', actor: 'mouse', emoji: '✨', dur: 0.6 },
    { at: 8.0, kind: 'zzz', actor: 'mouse', emoji: '🎵', dur: 1.0 },
    { at: 8.8, kind: 'pop', actor: 'sheriff', emoji: '❓', dur: 0.8, dx: -8 },
  ],
  camera: [
    // 衝刺跟拍，撞上去震一下，滑回來前退回全景
    { at: 2.0, dur: 0.2, do: 'follow', actor: 'mouse', amount: 1.35 },
    { at: 2.35, dur: 0.4, do: 'shake', amount: 1.5 },
    { at: 3.0, dur: 0.4, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.6, sfx: 'whoosh' },
    { at: 1.1, say: '接' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 2.35, sfx: 'bonk' },
    { at: 3.25, sfx: 'slide' },
    { at: 5.05, say: '接' },
    { at: 5.45, sfx: 'whoosh' },
    { at: 6.8, say: '接住' },
    { at: 6.82, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
