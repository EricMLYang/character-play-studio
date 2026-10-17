import type { Clip } from '../clip'

// 怕：豬探長低著頭跟著餅乾屑找線索，右邊飄來一團白白的東西——是鬼！嚇得躲到放大鏡後面發抖。原來是披風英雄，披風太長蓋住了頭。
// 英雄拿玩偶當劍，兩個比劃：豬探長大力一揮沒打到、自己轉兩圈；英雄一揮也沒打到、往反方向轉。轉著轉著頭碰頭「咚」——
// 放大鏡把手變成直的、兩塊餅乾變成兩點，玩偶壓成「白」，披風尖尖蓋在最上面。豬探長站起來挺胸：不怕！英雄飛過來握手，披風又蓋住頭。怕、怕、不怕
const clip: Clip = {
  char: '怕',
  meta: { theme: '以為是鬼', cast: '豬探長＋披風英雄＋玩偶＋餅乾屑', gags: ['披風蓋頭像鬼', '揮空自己轉圈', '轉到頭碰頭', '挺胸說不怕'] },
  duration: 10,
  bg: { top: '#FFE8D2', bottom: '#FFF5EA', floor: '#D9C2A6', scenery: 'forest' },
  actors: [
    { id: 'crumb1', emoji: '🍪', x: 40, y: 73, size: 4 },
    { id: 'crumb2', emoji: '🍪', x: 52, y: 73, size: 4 },
    { id: 'teddy', emoji: '🧸', x: 116, y: 66, size: 8, hidden: true },
    { id: 'hero', emoji: 'hero:cape/idle', x: 122, y: 71, size: 14, hidden: true },
    { id: 'ghost', emoji: '👻', x: 122, y: 66, size: 15, hidden: true, float: true },
    { id: 'pig', emoji: 'hero:pig/think', x: 30, y: 71, size: 14, flip: true, hidden: true },
  ],
  moves: [
    // 低頭跟著餅乾屑走
    { at: 0, actor: 'pig', do: 'enter', from: { x: -12, y: 71 }, dur: 0.7 },
    { at: 0.1, actor: 'pig', do: 'tilt', amount: 12, dur: 0.6 },
    { at: 0.6, actor: 'crumb1', do: 'vanish', dur: 0.2 },
    { at: 0.7, actor: 'pig', do: 'moveTo', to: { x: 46, y: 71 }, dur: 0.5 },
    { at: 1.1, actor: 'crumb2', do: 'vanish', dur: 0.2 },
    // 鬼飄過來
    { at: 0.4, actor: 'ghost', do: 'enter', from: { x: 175, y: 60 }, dur: 0.8, ease: 'out' },
    { at: 1.2, actor: 'ghost', do: 'tilt', amount: 10, dur: 0.5 },
    // 嚇到躲到放大鏡後面
    { at: 1.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 1.2, actor: 'pig', do: 'hop', amount: 7, dur: 0.3 },
    { at: 1.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 1.5, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.3 },
    { at: 1.5, actor: 'pig', do: 'shake', amount: 0.8, dur: 0.6 },
    // 掀開披風：是英雄
    { at: 2.0, actor: 'ghost', do: 'vanish', dur: 0.2 },
    { at: 2.0, actor: 'hero', do: 'pop', dur: 0.3 },
    { at: 2.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 2.2, actor: 'teddy', do: 'pop', dur: 0.3 },
    { at: 2.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 豬探長大力一揮——沒打到，自己轉兩圈
    { at: 2.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 2.6, actor: 'pig', do: 'rotateTo', amount: -25, dur: 0.3 },
    { at: 2.9, actor: 'pig', do: 'rotateTo', amount: 25, dur: 0.1 },
    { at: 2.95, actor: 'hero', do: 'hop', amount: 8, dur: 0.35 },
    { at: 2.95, actor: 'teddy', do: 'hop', amount: 8, dur: 0.35 },
    { at: 3.0, actor: 'pig', do: 'spin', times: 2, dur: 0.5 },
    // 英雄也一揮——也沒打到，往反方向轉
    { at: 3.5, actor: 'teddy', do: 'rotateTo', amount: 40, dur: 0.25 },
    { at: 3.75, actor: 'teddy', do: 'rotateTo', amount: -40, dur: 0.1 },
    { at: 3.8, actor: 'hero', do: 'spin', times: 2, dur: 0.5 },
    { at: 3.8, actor: 'teddy', do: 'moveTo', to: { x: 96, y: 66 }, dur: 0.5 },
    // 轉著轉著往中間靠，頭碰頭
    { at: 3.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 3.5, actor: 'pig', do: 'moveTo', to: { x: 73, y: 71 }, dur: 0.7 },
    { at: 3.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.8, actor: 'hero', do: 'moveTo', to: { x: 87, y: 71 }, dur: 0.4 },
    { at: 4.2, actor: 'pig', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.2, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.25 },
    // 一屁股坐到兩邊
    { at: 4.45, actor: 'pig', do: 'moveTo', to: { x: 30, y: 71 }, arc: 6, dur: 0.45, ease: 'out' },
    { at: 4.45, actor: 'hero', do: 'moveTo', to: { x: 130, y: 71 }, arc: 6, dur: 0.45, ease: 'out' },
    { at: 4.6, actor: 'teddy', do: 'vanish', dur: 0.2 },
    { at: 4.9, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.9, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.25 },
    // 披風又蓋住英雄的頭
    { at: 5.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 5.6, actor: 'hero', do: 'shake', amount: 1, dur: 0.5 },
    // 豬探長跳起來挺胸：不怕！
    { at: 6.4, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.25 },
    { at: 6.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 6.6, actor: 'pig', do: 'hop', amount: 7, dur: 0.4 },
    { at: 7.0, actor: 'pig', do: 'squash', amount: 0.2, dur: 0.25 },
    // 英雄飛過來握手
    { at: 7.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 7.8, actor: 'hero', do: 'moveTo', to: { x: 44, y: 71 }, arc: 66, dur: 0.5 },
    { at: 8.3, actor: 'hero', do: 'flip' },
    { at: 8.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 8.3, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 8.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 8.5, actor: 'pig', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 8.5, actor: 'hero', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 回馬槍：披風又蓋住頭——豬探長嚇一跳，又以為是鬼
    { at: 9.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 9.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 9.2, actor: 'pig', do: 'hop', amount: 6, dur: 0.3 },
    { at: 9.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
  ],
  builds: [
    // 放大鏡把手 → 直的；兩塊餅乾 → 兩點；玩偶壓扁 → 白；披風尖 → 最上面那一撇
    { at: 4.25, dur: 0.3, strokes: [2], from: 'pig', color: '#1E3A8A' },
    { at: 4.5, dur: 0.35, strokes: [0, 1], from: 'pig', color: '#C2410C' },
    { at: 4.65, dur: 0.6, strokes: [4, 5, 6, 7], from: 'teddy', color: '#1E3A8A' },
    { at: 5.2, dur: 0.3, strokes: [3], from: 'hero', color: '#F2B705' },
  ],
  glyph: [{ at: 5.5, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.3, kind: 'pop', actor: 'pig', emoji: '🍪', dur: 0.5 },
    { at: 1.2, kind: 'pop', actor: 'pig', emoji: '😱', dur: 0.6 },
    { at: 1.5, kind: 'sweat', actor: 'pig', dur: 0.6 },
    { at: 2.0, kind: 'puff', actor: 'hero', dur: 0.4 },
    { at: 2.3, kind: 'pop', actor: 'pig', emoji: '😑', dur: 0.5 },
    { at: 3.0, kind: 'puff', actor: 'pig', dur: 0.5 },
    { at: 3.8, kind: 'puff', actor: 'hero', dur: 0.5 },
    { at: 4.2, kind: 'burst', actor: 'pig', emoji: '⭐', n: 6, dx: 7, dur: 0.6 },
    { at: 4.95, kind: 'dizzy', actor: 'pig', dur: 1.0 },
    { at: 4.95, kind: 'dizzy', actor: 'hero', dur: 1.0 },
    { at: 5.6, kind: 'pop', actor: 'hero', emoji: '🙈', dx: -10, dur: 0.7 },
    { at: 6.6, kind: 'pop', actor: 'pig', emoji: '💪', dur: 0.8 },
    { at: 8.4, kind: 'pop', actor: 'pig', emoji: '🤝', dx: 1, dur: 0.6 },
    { at: 9.0, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 0.6 },
    { at: 9.25, kind: 'pop', actor: 'pig', emoji: '❗', dx: -10, dur: 0.5 },
  ],
  camera: [
    { at: 1.2, dur: 0.6, do: 'punch', amount: 0.2, to: { x: 50, y: 62 } },
    { at: 4.2, dur: 0.5, do: 'punch', amount: 0.2, to: { x: 80, y: 62 } },
  ],
  cues: [
    { at: 1.25, say: '怕' },
    { at: 2.0, sfx: 'poof' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 3.75, sfx: 'whoosh' },
    { at: 4.2, sfx: 'boing' },
    { at: 4.9, sfx: 'plop' },
    { at: 5.55, say: '怕' },
    { at: 6.6, say: '不怕' },
    { at: 7.8, sfx: 'whoosh' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
