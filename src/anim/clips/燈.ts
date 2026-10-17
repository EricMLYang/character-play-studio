import type { Clip } from '../clip'

// 燈：小外星人開著飛碟想用牽引光束搶走一盞巨大的玩具立燈，結果光束轉回來把自己吸得倒過來；他氣得往後仰、全速衝刺，一頭撞上燈柱。
// 震落的火花疊成左邊的「火」，燈架零件掉成右邊的「登」。壓扁的飛碟彈回圓形，外星人拉一下拉繩——整個「燈」字亮起來。燈、燈、電燈
const clip: Clip = {
  char: '燈',
  meta: { theme: '飛碟搶立燈', cast: '小外星人＋飛碟＋巨大立燈＋拉繩', gags: ['光束吸到自己倒過來', '全速衝刺撞燈柱', '拉繩一拉整個字亮起來'] },
  duration: 10,
  bg: { top: '#FFF3DA', bottom: '#FFF9EE', floor: '#E9D8B8', scenery: 'room' },
  actors: [
    { id: 'base', emoji: '⚫', x: 140, y: 73, size: 9 },
    { id: 'bulb', emoji: '💡', x: 140, y: 26, size: 13, float: true, tint: 'grayscale(1) brightness(.95)' },
    { id: 'cord', emoji: '🔘', x: 120, y: 54, size: 5, hidden: true, float: true },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 24, y: 40, size: 15, float: true, flip: true },
  ],
  moves: [
    // 飛碟浮在左邊，看到大燈興奮得發抖
    { at: 0, actor: 'alien', do: 'bounce', amount: 1.5, times: 2, dur: 1.0 },
    { at: 1.1, actor: 'alien', do: 'shake', amount: 1, dur: 0.4 },
    { at: 1.2, actor: 'bulb', do: 'flash', dur: 0.3 },
    // 按下按鈕——光束轉回來，把自己吸得倒過來
    { at: 1.75, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 1.9, actor: 'alien', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 1.9, actor: 'alien', do: 'moveTo', to: { x: 24, y: 27 }, dur: 0.3 },
    { at: 2.2, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.5 },
    // 光束熄掉，啪噠掉回地上
    { at: 2.75, actor: 'alien', do: 'rotateTo', amount: -180, dur: 0.25 },
    { at: 2.75, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    { at: 2.75, actor: 'alien', do: 'moveTo', to: { x: 24, y: 66 }, dur: 0.35, ease: 'bounce' },
    // 氣得往後仰蓄力
    { at: 3.3, actor: 'alien', do: 'tilt', amount: -28, dur: 0.5 },
    { at: 3.3, actor: 'alien', do: 'squash', amount: -0.25, dur: 0.5 },
    // 全速衝刺——碰！撞上燈柱
    { at: 3.8, actor: 'alien', do: 'moveTo', to: { x: 130, y: 52 }, dur: 0.32, anticipate: 5, ease: 'in' },
    { at: 4.12, actor: 'alien', do: 'squash', amount: 0.55, dur: 0.4 },
    { at: 4.12, actor: 'bulb', do: 'shake', amount: 2, dur: 0.5 },
    { at: 4.12, actor: 'base', do: 'shake', amount: 1, dur: 0.4 },
    { at: 4.5, actor: 'alien', do: 'moveTo', to: { x: 132, y: 66 }, dur: 0.35, ease: 'bounce' },
    { at: 4.95, actor: 'bulb', do: 'vanish', dur: 0.2 },
    { at: 5.55, actor: 'base', do: 'vanish', dur: 0.2 },
    // 扁扁的飛碟搖搖晃晃，啵一聲彈回圓形；外星人暈暈地走出來
    { at: 6.0, actor: 'alien', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 6.3, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 6.3, actor: 'alien', do: 'moveTo', to: { x: 132, y: 71 }, dur: 0.2 },
    // 拉繩垂下來，拉一下——喀
    { at: 6.6, actor: 'cord', do: 'drop', dur: 0.4 },
    { at: 7.05, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 7.05, actor: 'alien', do: 'hop', amount: 6, dur: 0.35 },
    { at: 7.2, actor: 'cord', do: 'hop', amount: -3, dur: 0.25 },
    // 回馬槍：坐回飛碟想再用一次光束——又把自己吸得倒過來
    { at: 8.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    { at: 8.2, actor: 'alien', do: 'moveTo', to: { x: 136, y: 52 }, dur: 0.4 },
    { at: 8.8, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 8.9, actor: 'alien', do: 'rotateTo', amount: 180, dur: 0.3 },
    { at: 8.9, actor: 'alien', do: 'moveTo', to: { x: 136, y: 39 }, dur: 0.3 },
    { at: 9.2, actor: 'alien', do: 'shake', amount: 1.2, dur: 0.6 },
  ],
  builds: [
    // 四顆火花往左邊掉，疊成「火」
    { at: 4.3, dur: 0.6, strokes: [0, 1, 2, 3], from: 'bulb', color: '#E8590C' },
    // 燈的兩隻彎手臂先掉成上面的癶，燈柱和圓底座落成下面的豆
    { at: 4.85, dur: 0.6, strokes: [4, 5, 6, 7, 8], from: 'bulb', color: '#F08C00' },
    { at: 5.35, dur: 0.7, strokes: [9, 10, 11, 12, 13, 14, 15], from: 'base', color: '#F08C00' },
  ],
  glyph: [{ at: 6.1, dur: 0.4, do: 'wobble' }, { at: 7.25, dur: 0.6, do: 'pulse' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    // 立燈的燈柱（撞上去之前）
    { at: 0, dur: 4.95, kind: 'line', actor: 'bulb', dy: 5, to: { x: 140, y: 72 }, color: '#868E96', width: 1.8 },
    { at: 0.5, kind: 'bubble', actor: 'alien', emoji: '💡', dur: 0.9 },
    { at: 1.6, kind: 'pop', actor: 'alien', emoji: '🔴', dur: 0.4 },
    { at: 1.75, dur: 0.9, kind: 'beam', actor: 'alien', n: 14 },
    { at: 2.25, kind: 'pop', actor: 'alien', emoji: '😵', dy: 12, dur: 0.5 },
    { at: 3.15, kind: 'pop', actor: 'alien', emoji: '😠', dur: 0.5 },
    { at: 3.4, kind: 'puff', actor: 'alien' },
    { at: 4.12, kind: 'burst', x: 136, y: 46, emoji: '💥', dur: 0.4 },
    { at: 4.2, kind: 'burst', actor: 'bulb', emoji: '✨', n: 6, dur: 0.6 },
    { at: 6.0, kind: 'puff', actor: 'alien' },
    { at: 6.35, kind: 'dizzy', actor: 'alien', dur: 0.7 },
    // 拉繩
    { at: 6.6, dur: 3.4, kind: 'line', actor: 'cord', to: { x: 120, y: -5 }, color: '#495057', width: 0.6 },
    { at: 7.2, kind: 'pop', actor: 'alien', emoji: '✨', dur: 0.7 },
    { at: 8.85, dur: 0.6, kind: 'beam', actor: 'alien', n: 12 },
    { at: 9.2, kind: 'pop', actor: 'alien', emoji: '😵', dy: 12, dur: 0.6 },
  ],
  camera: [
    // 衝刺跟拍，撞到之後回全景
    { at: 3.8, dur: 0.2, do: 'follow', actor: 'alien', amount: 1.3 },
    { at: 4.15, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.12, dur: 0.35, do: 'shake', amount: 1.8 },
  ],
  // 拉繩一拉，整個字亮起來（柔和的暖光，不閃爍）
  lights: [{ at: 7.2, dur: 0.2, level: -0.3 }, { at: 7.4, dur: 0.8, level: 0 }],
  cues: [
    { at: 1.2, say: '燈' },
    { at: 1.75, sfx: 'laser' },
    { at: 2.75, sfx: 'plop' },
    { at: 3.3, sfx: 'slide' },
    { at: 3.8, sfx: 'whoosh' },
    { at: 4.12, sfx: 'bonk' },
    { at: 6.0, sfx: 'poof' },
    { at: 6.1, say: '燈' },
    { at: 7.2, sfx: 'tap' },
    { at: 7.25, say: '電燈' },
    { at: 8.85, sfx: 'laser' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
