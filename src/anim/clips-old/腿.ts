import type { Clip } from '../clip'

// 腿：大怪獸炫耀牠的大腿，用力一踏地板震得發條鯊魚跳起來；衝過去——鯊魚一跳就閃開，怪獸滑過頭，轉身再衝更大力，又撲空。
// 鯊魚輕輕咬一口小腿，怪獸兩腿軟得像麵條，像大樹一樣倒下震出「腿」；想站起來又腿軟——鯊魚爬上肚子轉圈，再咬一口，怪獸一踢把牠彈上天。腿、腿、腿軟
const clip: Clip = {
  char: '腿',
  meta: { theme: '大怪獸炫耀大腿', cast: '大怪獸＋發條鯊魚', gags: ['用力過猛衝過頭', '大傢伙被小傢伙咬一口就倒', '腿軟站不起來'] },
  duration: 10,
  bg: { top: '#FFF6DE', bottom: '#F4FBEF', floor: '#BFE6C4', scenery: 'hills' },
  actors: [
    { id: 'monster', emoji: 'hero:monster/idle', x: 40, y: 68.6, size: 20, hidden: true, flip: true },
    { id: 'shark', emoji: 'hero:shark/idle', x: 130, y: 71.5, size: 13 },
  ],
  moves: [
    // 怪獸踏進來，抬起大腿用力一踩
    { at: 0.1, actor: 'monster', do: 'enter', from: { x: -20, y: 68.6 }, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'monster', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 0.8, actor: 'monster', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 1.1, actor: 'monster', do: 'squash', amount: 0.4, dur: 0.25 },
    { at: 1.1, actor: 'shark', do: 'hop', amount: 9, dur: 0.4 },
    { at: 1.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    // 秀肌肉，衝過去——鯊魚跳起來閃開，怪獸滑過頭
    { at: 1.6, actor: 'monster', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 1.6, actor: 'monster', do: 'shake', amount: 1, dur: 0.35 },
    { at: 2.0, actor: 'monster', do: 'moveTo', to: { x: 150, y: 68.6 }, dur: 0.6, anticipate: 4, ease: 'back' },
    { at: 2.1, actor: 'shark', do: 'hop', amount: 18, dur: 0.45 },
    { at: 2.0, actor: 'shark', do: 'swap', emoji: 'hero:shark/idle' },
    // 轉身再衝更大力，又撲空
    { at: 2.75, actor: 'monster', do: 'flip' },
    { at: 2.95, actor: 'monster', do: 'moveTo', to: { x: 50, y: 68.6 }, dur: 0.55, anticipate: 5, ease: 'back' },
    { at: 2.95, actor: 'shark', do: 'hop', amount: 20, dur: 0.5 },
    { at: 2.95, actor: 'shark', do: 'spin', dur: 0.5 },
    { at: 3.6, actor: 'monster', do: 'flip' },
    { at: 3.6, actor: 'monster', do: 'swap', emoji: 'hero:monster/idle' },
    // 鯊魚發條一轉，跑過去輕輕咬一口小腿
    { at: 3.7, actor: 'shark', do: 'moveTo', to: { x: 64, y: 71.5 }, dur: 0.4 },
    { at: 4.1, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 4.1, actor: 'shark', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 4.1, actor: 'monster', do: 'swap', emoji: 'hero:monster/surprised' },
    // 兩腿軟得像麵條……像大樹一樣往後倒
    { at: 4.25, actor: 'monster', do: 'shake', amount: 1.5, dur: 0.5 },
    { at: 4.25, actor: 'monster', do: 'squash', amount: 0.2, dur: 0.5 },
    { at: 4.7, actor: 'monster', do: 'moveTo', to: { x: 36, y: 68.6 }, dur: 0.4 },
    { at: 4.7, actor: 'monster', do: 'rotateTo', amount: -90, dur: 0.4, ease: 'in' },
    { at: 5.1, actor: 'monster', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 5.2, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 5.2, actor: 'shark', do: 'moveTo', to: { x: 122, y: 71.5 }, dur: 0.5, arc: 8, ease: 'out' },
    // 想站起來——腿又軟掉，咚
    { at: 6.8, actor: 'monster', do: 'rotateTo', amount: 90, dur: 0.35 },
    { at: 6.8, actor: 'monster', do: 'swap', emoji: 'hero:monster/oops' },
    { at: 7.1, actor: 'monster', do: 'shake', amount: 1.8, dur: 0.4 },
    { at: 7.1, actor: 'monster', do: 'squash', amount: 0.3, dur: 0.4 },
    { at: 7.45, actor: 'monster', do: 'rotateTo', amount: -90, dur: 0.3, ease: 'in' },
    { at: 7.75, actor: 'monster', do: 'swap', emoji: 'hero:monster/happy' },
    // 鯊魚爬上肚子轉圈圈
    { at: 7.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 7.9, actor: 'shark', do: 'moveTo', to: { x: 34, y: 53 }, dur: 0.45, arc: 10 },
    { at: 8.4, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 8.4, actor: 'shark', do: 'spin', times: 2, dur: 0.6 },
    // 回馬槍：又咬一口——怪獸腿一踢，把鯊魚彈上天
    { at: 9.0, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 9.1, actor: 'monster', do: 'shake', amount: 2, dur: 0.3 },
    { at: 9.15, actor: 'shark', do: 'hop', amount: 22, dur: 0.6 },
    { at: 9.15, actor: 'shark', do: 'spin', times: 2, dur: 0.6 },
    { at: 9.15, actor: 'shark', do: 'swap', emoji: 'hero:shark/surprised' },
    { at: 9.75, actor: 'shark', do: 'squash', amount: 0.25, dur: 0.2 },
  ],
  builds: [
    // 倒地一震，毛裡抖出藍色的碎片：月、艮、辶
    { at: 5.1, dur: 0.5, strokes: [0, 1, 2, 3], from: 'monster', color: '#2152C4' },
    { at: 5.35, dur: 0.7, strokes: [4, 5, 6, 7, 8, 9], from: 'monster', color: '#2F6FE0' },
    { at: 5.8, dur: 0.5, strokes: [10, 11, 12], from: 'monster', color: '#1B3F99' },
  ],
  glyph: [{ at: 6.35, dur: 0.4, do: 'wobble' }, { at: 9.35, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 1.1, kind: 'puff', actor: 'monster', dur: 0.5 },
    { at: 1.6, kind: 'pop', actor: 'monster', emoji: '💪', dur: 0.6 },
    { at: 2.65, kind: 'puff', actor: 'monster', dur: 0.4 },
    { at: 2.7, kind: 'pop', actor: 'shark', emoji: '😆', dur: 0.5 },
    { at: 3.5, kind: 'puff', actor: 'monster', dur: 0.4 },
    { at: 3.55, kind: 'sweat', actor: 'monster' },
    { at: 4.1, kind: 'burst', actor: 'shark', emoji: '💢', n: 1, dur: 0.4 },
    { at: 4.15, kind: 'pop', actor: 'monster', emoji: '😱', dur: 0.5 },
    { at: 5.1, kind: 'puff', actor: 'monster', dur: 0.6 },
    { at: 5.15, kind: 'dizzy', actor: 'monster', dur: 1.2 },
    { at: 7.1, kind: 'sweat', actor: 'monster' },
    { at: 7.75, kind: 'puff', actor: 'monster', dur: 0.4 },
    { at: 9.1, kind: 'pop', actor: 'monster', emoji: '😆', dur: 0.6 },
  ],
  camera: [
    { at: 1.1, dur: 0.35, do: 'shake' },
    { at: 2.0, dur: 0.3, do: 'follow', actor: 'monster', amount: 1.3 },
    { at: 3.6, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 5.1, dur: 0.45, do: 'shake' },
  ],
  cues: [
    { at: 1.1, sfx: 'bonk' },
    { at: 1.15, say: '腿' },
    { at: 2.0, sfx: 'whoosh' },
    { at: 2.5, sfx: 'slide' },
    { at: 2.95, sfx: 'whoosh' },
    { at: 3.4, sfx: 'slide' },
    { at: 4.1, sfx: 'clink' },
    { at: 4.3, sfx: 'boing' },
    { at: 5.1, sfx: 'bonk' },
    { at: 5.15, sfx: 'rumble' },
    { at: 6.35, say: '腿' },
    { at: 7.1, sfx: 'boing' },
    { at: 7.15, say: '腿軟' },
    { at: 7.75, sfx: 'plop' },
    { at: 9.1, sfx: 'clink' },
    { at: 9.15, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
