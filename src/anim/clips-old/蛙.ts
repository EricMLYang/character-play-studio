import type { Clip } from '../clip'

// 蛙：小外星人的飛碟光束想吸走橡膠青蛙，先吸錯成荷花，再對準青蛙的頭；玩具戰士揮劍揮到自己轉一圈，抓住青蛙的腳。
// 兩邊拔河，青蛙被拉成長長一條——「啵」彈開！飛碟撞到角落、戰士一屁股坐地上、盾牌翻過來；彈飛的綠色橡膠條變成「蛙」，
// 小青蛙跳到翻過來的盾牌上呱呱叫。回馬槍：頭昏的飛碟光束打嗝，這次把戰士整個吸了起來又掉下去。蛙、蛙、青蛙
const clip: Clip = {
  char: '蛙',
  meta: { theme: '橡膠青蛙拔河', cast: '小外星人＋玩具戰士＋橡膠青蛙＋盾牌', gags: ['光束吸錯東西', '拔河拉成長條啵一聲彈開', '光束打嗝吸走戰士'] },
  duration: 10,
  bg: { top: '#FFF4D6', bottom: '#FFFBEF', floor: '#D8E8C0', scenery: 'hills' },
  actors: [
    { id: 'pad', emoji: '🪷', x: 80, y: 73, size: 9 },
    { id: 'frog', emoji: '🐸', x: 80, y: 67, size: 13 },
    { id: 'shield', emoji: '🛡️', x: 118, y: 72.5, size: 10, hidden: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 104, y: 71, size: 14, hidden: true },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 44, y: 30, size: 15, hidden: true, float: true, flip: true },
  ],
  moves: [
    { at: 0.0, actor: 'frog', do: 'bounce', amount: 1, times: 2, dur: 0.6 },
    // 飛碟飛進來，光束先吸錯成荷花
    { at: 0.1, actor: 'alien', do: 'enter', from: { x: -18, y: 12 }, dur: 0.5, ease: 'out' },
    { at: 0.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 0.65, actor: 'pad', do: 'moveTo', to: { x: 80, y: 52 }, dur: 0.35 },
    { at: 1.0, actor: 'pad', do: 'moveTo', to: { x: 80, y: 73 }, dur: 0.3, ease: 'bounce' },
    { at: 1.0, actor: 'alien', do: 'shake', amount: 1, dur: 0.3 },
    // 再瞄一次——抓到青蛙的頭
    { at: 1.4, actor: 'frog', do: 'squash', amount: -0.3, dur: 0.4 },
    // 戰士衝進來揮劍，揮到自己轉一圈，抓住青蛙的腳
    { at: 1.4, actor: 'warrior', do: 'enter', from: { x: 175, y: 71 }, dur: 0.4, ease: 'out' },
    { at: 1.8, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 1.9, actor: 'warrior', do: 'flip' },
    { at: 2.05, actor: 'warrior', do: 'flip' },
    { at: 2.2, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/idle' },
    { at: 2.2, actor: 'warrior', do: 'moveTo', to: { x: 92, y: 71 }, dur: 0.2 },
    // 拔河！飛碟往左上拉，戰士往右後仰，青蛙被拉長
    { at: 2.5, actor: 'alien', do: 'moveTo', to: { x: 28, y: 22 }, dur: 1.3 },
    { at: 2.5, actor: 'warrior', do: 'moveTo', to: { x: 108, y: 71 }, dur: 1.3 },
    { at: 2.5, actor: 'warrior', do: 'tilt', amount: 14, dur: 1.5 },
    { at: 2.5, actor: 'alien', do: 'tilt', amount: -16, dur: 1.5 },
    { at: 2.2, actor: 'frog', do: 'squash', amount: 1.4, dur: 1.8 },
    { at: 3.4, actor: 'warrior', do: 'shake', amount: 1, dur: 0.6 },
    { at: 3.4, actor: 'alien', do: 'shake', amount: 1, dur: 0.6 },
    { at: 3.4, actor: 'frog', do: 'shake', amount: 0.8, dur: 0.6 },
    // 啵！彈開
    { at: 4.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 4.0, actor: 'alien', do: 'moveTo', to: { x: 12, y: 10 }, dur: 0.3, ease: 'out' },
    { at: 4.3, actor: 'alien', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 4.35, actor: 'alien', do: 'spin', times: 1, dur: 0.6 },
    { at: 4.0, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 4.0, actor: 'warrior', do: 'moveTo', to: { x: 134, y: 71 }, arc: 8, dur: 0.4, ease: 'out' },
    { at: 4.4, actor: 'warrior', do: 'squash', amount: 0.35, dur: 0.25 },
    { at: 4.2, actor: 'shield', do: 'enter', from: { x: 132, y: 64 }, arc: 8, dur: 0.5, ease: 'bounce' },
    // 青蛙縮回小小一顆，蹦兩下跳到盾牌上
    { at: 4.0, actor: 'frog', do: 'scaleTo', amount: 0.75, dur: 0.2 },
    { at: 4.0, actor: 'pad', do: 'vanish', dur: 0.2 },
    { at: 4.2, actor: 'frog', do: 'moveTo', to: { x: 98, y: 68 }, arc: 14, dur: 0.45 },
    { at: 4.7, actor: 'frog', do: 'moveTo', to: { x: 118, y: 63 }, arc: 14, dur: 0.45, ease: 'out' },
    { at: 5.15, actor: 'frog', do: 'squash', amount: 0.3, dur: 0.2 },
    // 鼓起臉頰呱一聲
    { at: 6.5, actor: 'frog', do: 'scaleTo', amount: 1.35, dur: 0.2, ease: 'back' },
    { at: 6.5, actor: 'frog', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 7.0, actor: 'frog', do: 'scaleTo', amount: 0.741, dur: 0.25 },
    { at: 6.8, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    // 回馬槍：頭昏的飛碟飄過去，光束打嗝把戰士吸起來——又掉下去
    { at: 7.5, actor: 'alien', do: 'swap', emoji: 'hero:alien/saucer' },
    { at: 7.5, actor: 'alien', do: 'moveTo', to: { x: 140, y: 12 }, arc: -4, dur: 0.6 },
    { at: 8.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/beam' },
    { at: 8.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 8.3, actor: 'warrior', do: 'moveTo', to: { x: 138, y: 40 }, dur: 0.4, ease: 'out' },
    { at: 8.8, actor: 'warrior', do: 'moveTo', to: { x: 138, y: 71 }, dur: 0.4, ease: 'bounce' },
    { at: 8.8, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 9.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 9.3, actor: 'frog', do: 'hop', amount: 4, dur: 0.35 },
  ],
  builds: [
    // 彈飛的橡膠條：虫 → 圭
    { at: 4.1, dur: 0.75, strokes: [0, 1, 2, 3, 4, 5], from: { x: 64, y: 50 }, color: '#2B8A3E' },
    { at: 4.7, dur: 0.85, strokes: [6, 7, 8, 9, 10, 11], from: { x: 100, y: 52 }, color: '#2B8A3E' },
  ],
  glyph: [{ at: 5.55, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.6, kind: 'beam', actor: 'alien', n: 9, dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'alien', emoji: '😒', dur: 0.4, dx: 6 },
    { at: 1.3, kind: 'beam', actor: 'alien', n: 8, dur: 2.7 },
    { at: 1.9, kind: 'burst', actor: 'warrior', emoji: '💨', n: 4, dur: 0.4 },
    { at: 2.5, kind: 'line', actor: 'alien', target: 'warrior', color: '#51CF66', width: 3, dur: 1.5 },
    { at: 2.8, kind: 'sweat', actor: 'warrior' },
    { at: 3.6, kind: 'pop', actor: 'frog', emoji: '😵', dur: 0.4 },
    { at: 4.0, kind: 'burst', x: 80, y: 56, emoji: '💥', dur: 0.4 },
    { at: 4.4, kind: 'dizzy', actor: 'warrior', dur: 1.4 },
    { at: 4.6, kind: 'dizzy', actor: 'alien', dur: 1.4, dy: 6 },
    { at: 6.5, kind: 'pop', actor: 'frog', emoji: '🎵', dur: 0.6 },
    { at: 8.2, kind: 'beam', actor: 'alien', n: 8, dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'alien', emoji: '😳', dur: 0.4, dx: -12, dy: 14 },
    { at: 9.3, kind: 'pop', actor: 'warrior', emoji: '👏', dur: 0.6 },
  ],
  camera: [
    { at: 3.4, dur: 0.6, do: 'zoom', amount: 1.2, to: { x: 76, y: 50 } },
    { at: 4.0, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.0, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  cues: [
    { at: 0.1, sfx: 'whoosh' },
    { at: 0.6, sfx: 'laser' },
    { at: 1.4, say: '蛙' },
    { at: 1.9, sfx: 'whoosh' },
    { at: 2.5, sfx: 'slide' },
    { at: 4.0, sfx: 'boing' },
    { at: 4.4, sfx: 'bonk' },
    { at: 5.6, say: '蛙' },
    { at: 6.5, say: '青蛙' },
    { at: 8.2, sfx: 'hic' },
    { at: 8.8, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
