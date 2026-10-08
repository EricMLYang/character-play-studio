import type { Clip } from '../clip'

// 菜：挑食小恐龍只想吃肉，花椰菜跳過來牠就轉頭；紅蘿蔔學飛機「咻——」飛過來，牠一蹲就閃掉。兩根青菜想到妙招：搔癢！
// 恐龍笑到嘴巴張大，青菜趁機跳進去——結果超好吃，恐龍充滿力量變成「菜」。牠大喊還要青菜，這次換青菜嚇得逃走。菜、菜、青菜
const clip: Clip = {
  char: '菜',
  meta: { theme: '挑食晚餐', cast: '小恐龍＋花椰菜＋紅蘿蔔＋青江菜', gags: ['轉頭不吃', '飛機餵食一蹲閃過', '搔癢趁機跳進嘴', '反轉：換青菜逃走'] },
  duration: 10,
  bg: { top: '#FFF0F3', bottom: '#FFD9E1', floor: '#C98B5E', scenery: 'room' },
  actors: [
    { id: 'plate', emoji: '🍽️', x: 46, y: 74, size: 8, float: true, hidden: true },
    { id: 'bok', emoji: '🥬', x: 130, y: 72.8, size: 10, hidden: true },
    { id: 'dino', emoji: '🦖', x: 28, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'broc', emoji: '🥦', x: 46, y: 69, size: 8, hidden: true },
    { id: 'carrot', emoji: '🥕', x: 150, y: 40, size: 8, float: true, hidden: true },
  ],
  moves: [
    { at: 0, actor: 'dino', do: 'pop' },
    { at: 0.2, actor: 'plate', do: 'pop' },
    { at: 0.3, actor: 'broc', do: 'pop' },
    // 花椰菜跳過來，恐龍轉頭
    { at: 1.0, actor: 'broc', do: 'moveTo', to: { x: 40, y: 71.5 }, dur: 0.3, arc: 5 },
    { at: 1.3, actor: 'dino', do: 'flip' },
    { at: 1.3, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.25 },
    // 紅蘿蔔飛機：一蹲閃過
    { at: 1.9, actor: 'carrot', do: 'enter', from: { x: 175, y: 30 }, dur: 0.4 },
    { at: 2.3, actor: 'carrot', do: 'moveTo', to: { x: -15, y: 62 }, dur: 0.7 },
    { at: 2.3, actor: 'carrot', do: 'rotateTo', amount: -30, dur: 0.3 },
    { at: 2.55, actor: 'dino', do: 'squash', amount: 0.55, dur: 0.4 },
    // 紅蘿蔔繞回來，跟花椰菜想辦法
    { at: 3.1, actor: 'carrot', do: 'rotateTo', amount: 30, dur: 0.2 },
    { at: 3.1, actor: 'carrot', do: 'moveTo', to: { x: 50, y: 72 }, dur: 0.5, arc: 16 },
    // 搔癢！
    { at: 3.8, actor: 'broc', do: 'moveTo', to: { x: 36, y: 70 }, dur: 0.2 },
    { at: 3.8, actor: 'carrot', do: 'moveTo', to: { x: 42, y: 70 }, dur: 0.2 },
    { at: 4.0, actor: 'broc', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.0, actor: 'carrot', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.0, actor: 'dino', do: 'bounce', amount: 2, times: 4, dur: 0.5 },
    // 嘴巴一張，青菜跳進去
    { at: 4.45, actor: 'broc', do: 'moveTo', to: { x: 27, y: 66 }, dur: 0.15, arc: 6 },
    { at: 4.55, actor: 'broc', do: 'vanish', dur: 0.1 },
    { at: 4.6, actor: 'carrot', do: 'moveTo', to: { x: 27, y: 66 }, dur: 0.15, arc: 6 },
    { at: 4.7, actor: 'carrot', do: 'vanish', dur: 0.1 },
    { at: 4.75, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.25 },
    // 好吃！充滿力量
    { at: 5.0, actor: 'dino', do: 'scaleTo', amount: 1.3, dur: 0.3 },
    { at: 5.0, actor: 'dino', do: 'flash', dur: 0.6 },
    // 還要青菜！
    { at: 6.7, actor: 'dino', do: 'flip' },
    { at: 6.7, actor: 'dino', do: 'bounce', amount: 3, times: 2, dur: 0.5 },
    { at: 7.2, actor: 'bok', do: 'pop' },
    { at: 7.7, actor: 'dino', do: 'hop', amount: 5, dur: 0.35 },
    // 換青菜嚇跑
    { at: 8.1, actor: 'bok', do: 'shake', amount: 1.5, dur: 0.3 },
    { at: 8.45, actor: 'bok', do: 'moveTo', to: { x: 186, y: 72.8 }, dur: 0.4 },
    { at: 9.0, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.3 },
  ],
  builds: [
    // 吃下去的花椰菜 → 艹；紅蘿蔔 → 爫；盤子 → 木
    { at: 4.9, dur: 0.5, strokes: [0, 1, 2], from: 'dino', color: '#3FA34D' },
    { at: 5.2, dur: 0.6, strokes: [3, 4, 5, 6], from: 'dino', color: '#F28C28' },
    { at: 5.6, dur: 0.6, strokes: [7, 8, 9, 10], from: 'plate', color: '#8E5B3A' },
  ],
  glyph: [{ at: 6.2, dur: 0.4, do: 'wobble' }, { at: 9.5, dur: 0.5, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'bubble', actor: 'dino', emoji: '🍖', dur: 0.6 },
    { at: 1.35, kind: 'pop', actor: 'dino', emoji: '😤', dur: 0.5 },
    { at: 2.25, kind: 'zzz', actor: 'carrot', emoji: '✈️', dur: 0.6 },
    { at: 2.95, kind: 'bubble', actor: 'dino', emoji: '😏', dur: 0.5 },
    { at: 3.5, kind: 'pop', actor: 'broc', emoji: '💡', dur: 0.4 },
    { at: 4.1, kind: 'pop', actor: 'dino', emoji: '😂', dur: 0.4 },
    { at: 4.9, kind: 'pop', actor: 'dino', emoji: '🤩', dur: 0.6 },
    { at: 5.0, kind: 'burst', actor: 'dino', emoji: '✨', n: 6, dur: 0.5 },
    { at: 6.7, kind: 'bubble', actor: 'dino', emoji: '🥬', dur: 0.6 },
    { at: 7.7, kind: 'pop', actor: 'dino', emoji: '🤤', dur: 0.5 },
    { at: 8.1, kind: 'pop', actor: 'bok', emoji: '❗', dur: 0.4 },
    { at: 8.2, kind: 'sweat', actor: 'bok' },
    { at: 8.45, kind: 'puff', actor: 'bok' },
    { at: 9.0, kind: 'bubble', actor: 'dino', emoji: '😭', dur: 0.8 },
  ],
  camera: [
    { at: 4.45, dur: 0.6, do: 'punch', amount: 0.25, to: { x: 30, y: 64 } },
  ],
  cues: [
    { at: 1.3, sfx: 'tap' },
    { at: 1.45, say: '菜' },
    { at: 2.3, sfx: 'whoosh' },
    { at: 2.55, sfx: 'slide' },
    { at: 4.0, sfx: 'blip' },
    { at: 4.55, sfx: 'gulp' },
    { at: 4.7, sfx: 'gulp' },
    { at: 5.0, sfx: 'boing' },
    { at: 6.3, say: '菜' },
    { at: 7.3, say: '青菜' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
