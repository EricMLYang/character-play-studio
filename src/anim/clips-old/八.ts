import type { Clip } from '../clip'

// 八：發條鯊魚盯著保齡球道尾端的八個球瓶，鑰匙轉緊衝出去——半路先一口咬錯了保齡球，含著球側躺原地打轉；
// 退回去轉得更緊，肚皮滑壘衝過去撞倒全部球瓶，左邊三個、右邊五個倒成「八」的兩撇，幫忙扶瓶子的橡膠恐龍被撞得四腳朝天。
// 唸「八個」時八個瓶子沿著筆畫一個一個閃；最後保齡球自己滾回來，鯊魚又一口咬住它。八、八、八個
const PINS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
// 倒下時落在兩撇上的位置（左三右五）
const SPOT = [{ x: 68, y: 42 }, { x: 62, y: 50 }, { x: 57, y: 58 }, { x: 78, y: 30 }, { x: 84, y: 37 }, { x: 91, y: 44 }, { x: 98, y: 51 }, { x: 105, y: 58 }]
const clip: Clip = {
  char: '八',
  meta: { theme: '保齡球道', cast: '發條鯊魚＋橡膠恐龍＋八個球瓶＋保齡球', gags: ['咬錯球原地打轉', '肚皮滑壘全倒', '恐龍四腳朝天', '又咬住球'] },
  duration: 10,
  bg: { top: '#D3F9D8', bottom: '#EBFBEE', floor: '#FFE8A3', scenery: 'room' },
  actors: [
    ...PINS.map((id, i) => ({ id, emoji: '🎳', x: 102 + i * 4.6, y: 74.5, size: 6 })),
    { id: 'dino', emoji: 'hero:dino/idle', x: 148, y: 71, size: 14, hidden: true },
    { id: 'ball', emoji: '🎱', x: 64, y: 73.6, size: 8, hidden: true },
    { id: 'shark', emoji: 'hero:shark/idle', x: 20, y: 71.1, size: 14, hidden: true, flip: true },
  ],
  moves: [
    { at: 0, actor: 'shark', do: 'pop', dur: 0.35 },
    { at: 0.1, actor: 'dino', do: 'enter', from: { x: 175, y: 71 }, dur: 0.5 },
    // 恐龍手太短，用屁股把最後一個瓶子頂正
    { at: 0.7, actor: 'dino', do: 'tilt', amount: 15, dur: 0.3 },
    { at: 0.75, actor: 'p8', do: 'tilt', amount: -12, dur: 0.3 },
    { at: 0.4, actor: 'ball', do: 'pop' },
    // 鑰匙喀喀喀轉緊
    { at: 0.5, actor: 'shark', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 0.6, actor: 'shark', do: 'squash', amount: -0.2, dur: 0.5 },
    // 衝！半路一口咬錯了球
    { at: 1.2, actor: 'shark', do: 'moveTo', to: { x: 58, y: 71.1 }, dur: 0.4, anticipate: 3, ease: 'in' },
    { at: 1.45, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.65, actor: 'ball', do: 'moveTo', to: { x: 62, y: 69 }, dur: 0.1 },
    { at: 1.75, actor: 'ball', do: 'vanish', dur: 0.1 },
    { at: 1.85, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 1.9, actor: 'shark', do: 'spin', times: 3, dur: 0.9 },
    { at: 2.0, actor: 'dino', do: 'bounce', times: 3, amount: 2, dur: 0.7 },
    // 吐出球，球滾出畫面
    { at: 2.85, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 2.9, actor: 'ball', do: 'pop', dur: 0.2 },
    { at: 3.0, actor: 'ball', do: 'moveTo', to: { x: -15, y: 73.6 }, dur: 0.8, ease: 'out' },
    { at: 3.0, actor: 'ball', do: 'spin', times: -3, dur: 0.8 },
    // 退回去，鑰匙轉得更緊——滑壘！
    { at: 3.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/idle' },
    { at: 3.3, actor: 'shark', do: 'moveTo', to: { x: 16, y: 71.1 }, dur: 0.35, ease: 'out' },
    { at: 3.7, actor: 'shark', do: 'shake', amount: 0.9, dur: 0.5 },
    { at: 3.75, actor: 'shark', do: 'squash', amount: -0.3, dur: 0.45 },
    { at: 4.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 4.2, actor: 'shark', do: 'moveTo', to: { x: 100, y: 72 }, dur: 0.45, anticipate: 4, ease: 'in' },
    // 全倒：左三右五飛出去，恐龍翻成四腳朝天
    { at: 4.65, actor: 'shark', do: 'squash', amount: 0.35, dur: 0.2 },
    ...PINS.map((actor, i) => ({ at: 4.65 + i * 0.03, actor, do: 'moveTo' as const, to: SPOT[i], arc: 10, dur: 0.3 })),
    ...PINS.map((actor, i) => ({ at: 4.65 + i * 0.03, actor, do: 'spin' as const, times: i < 3 ? -2 : 2, dur: 0.3 })),
    ...PINS.slice(0, 3).map((actor) => ({ at: 5.0, actor, do: 'vanish' as const, dur: 0.15 })),
    ...PINS.slice(3).map((actor) => ({ at: 5.15, actor, do: 'vanish' as const, dur: 0.15 })),
    { at: 4.72, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 4.72, actor: 'dino', do: 'rotateTo', amount: 180, dur: 0.35, ease: 'back' },
    { at: 4.72, actor: 'dino', do: 'moveTo', to: { x: 146, y: 54 }, dur: 0.35 },
    // 鯊魚彈回左下角
    { at: 4.85, actor: 'shark', do: 'moveTo', to: { x: 28, y: 71.1 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 4.85, actor: 'shark', do: 'spin', times: -1, dur: 0.6 },
    { at: 5.45, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 5.45, actor: 'shark', do: 'squash', amount: 0.25, dur: 0.25 },
    // 「八個」：瓶子一個一個閃；鯊魚得意，恐龍躺著晃
    { at: 6.6, actor: 'shark', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.6, actor: 'dino', do: 'tilt', amount: 10, dur: 0.4 },
    { at: 8.0, actor: 'dino', do: 'tilt', amount: -10, dur: 0.4 },
    { at: 7.7, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 7.7, actor: 'shark', do: 'spin', times: 1, dur: 0.8 },
    { at: 8.5, actor: 'shark', do: 'swap', emoji: 'hero:shark/idle' },
    // 回馬槍：保齡球自己滾回來——又一口咬住
    { at: 8.45, actor: 'ball', do: 'moveTo', to: { x: 23, y: 73.6 }, dur: 0.5, ease: 'out' },
    { at: 8.45, actor: 'ball', do: 'spin', times: 2, dur: 0.5 },
    { at: 8.95, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 9.05, actor: 'ball', do: 'vanish', dur: 0.1 },
    { at: 9.15, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 9.15, actor: 'shark', do: 'squash', amount: 0.2, dur: 0.25 },
  ],
  builds: [
    // 左邊三個瓶子 → 左撇；右邊五個 → 右捺
    { at: 5.0, dur: 0.45, strokes: [0], from: 'p2', color: '#F76707' },
    { at: 5.15, dur: 0.55, strokes: [1], from: 'p6', color: '#F76707' },
  ],
  glyph: [{ at: 5.6, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.2, kind: 'bubble', actor: 'shark', emoji: '🎳', dur: 0.9 },
    { at: 1.3, kind: 'puff', actor: 'shark', dur: 0.4 },
    { at: 2.0, kind: 'pop', actor: 'dino', emoji: '😆', dur: 0.7 },
    { at: 2.3, kind: 'dizzy', actor: 'shark', dur: 0.9 },
    { at: 4.0, kind: 'sweat', actor: 'shark' },
    { at: 4.65, kind: 'burst', actor: 'shark', dur: 0.4 },
    { at: 4.95, kind: 'pop', actor: 'dino', emoji: '❗', dy: 4, dur: 0.5 },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ at: 6.55 + i * 0.12, kind: 'pop' as const, x: [68, 62, 57, 78, 84, 91, 98, 105][i], y: [42, 50, 58, 30, 37, 44, 51, 58][i] - 4, emoji: '✨', dur: 0.45 })),
    { at: 7.7, kind: 'pop', actor: 'dino', emoji: '👏', dy: 6, dur: 0.6 },
    { at: 9.2, kind: 'pop', actor: 'shark', emoji: '😋', dur: 0.6 },
  ],
  camera: [
    // 滑壘跟拍，撞上前退回全景
    { at: 4.2, dur: 0.3, do: 'follow', actor: 'shark', amount: 1.3 },
    { at: 4.55, dur: 0.15, do: 'zoom', amount: 1 },
    { at: 4.65, dur: 0.4, do: 'shake', amount: 1.3 },
  ],
  cues: [
    { at: 0.5, sfx: 'tap' },
    { at: 0.75, sfx: 'tap' },
    { at: 1.0, sfx: 'tap' },
    { at: 1.2, say: '八' },
    { at: 1.25, sfx: 'whoosh' },
    { at: 1.7, sfx: 'gulp' },
    { at: 1.95, sfx: 'slide' },
    { at: 2.9, sfx: 'plop' },
    { at: 3.75, sfx: 'tap' },
    { at: 4.2, sfx: 'slide' },
    { at: 4.65, sfx: 'crack' },
    { at: 5.72, say: '八' },
    { at: 6.6, say: '八個' },
    { at: 9.05, sfx: 'gulp' },
    { at: 9.45, sfx: 'cheer' },
  ],
}

export default clip
