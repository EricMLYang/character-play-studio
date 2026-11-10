import type { Clip } from '../clip'

// 今：玩具戰士想把小太陽舉到最高，花生一根根遞泡棉長條，戰士踮腳疊出一座越來越歪的高塔，把太陽放到最頂端；
// 花生在不對的時間敬禮，頭上的橡果滾到塔頂——定格一秒，整座塔嘩啦倒下，長條剛好疊成「今」，戰士被埋得只剩眼睛。
// 小太陽彈簧一樣跳到天上；戰士爬出來比讚——結果那顆橡果又掉下來敲在他頭上。今、今、今天
const clip: Clip = {
  char: '今',
  meta: { theme: '戰士疊高塔', cast: '玩具戰士＋浣熊花生＋小太陽＋橡果', gags: ['越疊越歪', '敬禮敬錯時間', '定格後整座倒', '回馬槍橡果砸頭'] },
  duration: 10,
  bg: { top: '#FFF5E0', bottom: '#FFFBF1', floor: '#E4D3B0', scenery: 'room' },
  actors: [
    { id: 'b1', emoji: '🪵', x: 80, y: 71, size: 10, hidden: true },
    { id: 'b2', emoji: '🪵', x: 81, y: 63.5, size: 10, hidden: true },
    { id: 'shield', emoji: '🛡️', x: 82.5, y: 56, size: 8, hidden: true },
    { id: 'b3', emoji: '🪵', x: 84.5, y: 49, size: 10, hidden: true },
    { id: 'sun', emoji: '🌞', x: 98, y: 71, size: 9 },
    { id: 'acorn', emoji: '🌰', x: 46, y: 57, size: 5, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 46, y: 71.1, size: 14, hidden: true, flip: true },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 64, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'pile', emoji: '🪵', x: 32, y: 72, size: 14, hidden: true },
    { id: 'eyes', emoji: '👀', x: 32, y: 66, size: 6, hidden: true },
  ],
  moves: [
    // 戰士大搖大擺進場，指著地上的小太陽：要舉到最高！
    { at: 0, actor: 'warrior', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.7 },
    { at: 0, actor: 'warrior', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    { at: 0.4, actor: 'raccoon', do: 'enter', from: { x: -15, y: 71.1 }, dur: 0.8 },
    { at: 0.4, actor: 'raccoon', do: 'shake', amount: 0.8, dur: 0.8 },
    { at: 0.8, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/swing' },
    { at: 1.0, actor: 'warrior', do: 'squash', amount: -0.25, dur: 0.3 },
    // 抓起第一根，砰地立起來
    { at: 1.4, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/idle' },
    { at: 1.4, actor: 'b1', do: 'pop', dur: 0.25 },
    { at: 1.4, actor: 'warrior', do: 'hop', amount: 2, dur: 0.25 },
    // 越疊越高、越來越歪；戰士踮腳
    { at: 1.9, actor: 'b2', do: 'drop', dur: 0.35 },
    { at: 1.9, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.25 },
    { at: 2.3, actor: 'shield', do: 'drop', dur: 0.35 },
    { at: 2.3, actor: 'warrior', do: 'hop', amount: 3, dur: 0.3 },
    { at: 2.7, actor: 'b3', do: 'drop', dur: 0.35 },
    { at: 2.7, actor: 'raccoon', do: 'hop', amount: 2, dur: 0.25 },
    { at: 2.75, actor: 'b2', do: 'shake', amount: 0.5, dur: 0.5 },
    { at: 2.75, actor: 'shield', do: 'shake', amount: 0.8, dur: 0.5 },
    { at: 2.75, actor: 'b3', do: 'shake', amount: 1.2, dur: 0.5 },
    { at: 3.0, actor: 'warrior', do: 'hop', amount: 6, dur: 0.4 },
    { at: 3.0, actor: 'sun', do: 'moveTo', to: { x: 87, y: 41 }, arc: 10, dur: 0.4 },
    // 花生敬禮敬錯時間，橡果滾到塔頂
    { at: 3.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 3.4, actor: 'acorn', do: 'pop', dur: 0.15 },
    { at: 3.45, actor: 'acorn', do: 'moveTo', to: { x: 92, y: 36 }, arc: 12, dur: 0.45 },
    { at: 3.9, actor: 'acorn', do: 'shake', amount: 0.6, dur: 0.6 },
    // 定格……
    { at: 3.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 3.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 嘩啦！整座塔倒下來，戰士被埋住
    { at: 4.5, actor: 'b3', do: 'moveTo', to: { x: 50, y: 70 }, dur: 0.35, ease: 'in' },
    { at: 4.5, actor: 'b3', do: 'rotateTo', amount: -90, dur: 0.35 },
    { at: 4.5, actor: 'shield', do: 'moveTo', to: { x: 58, y: 72 }, dur: 0.3, ease: 'in' },
    { at: 4.5, actor: 'shield', do: 'rotateTo', amount: -70, dur: 0.3 },
    { at: 4.5, actor: 'b2', do: 'rotateTo', amount: -60, dur: 0.3 },
    { at: 4.5, actor: 'sun', do: 'moveTo', to: { x: 130, y: -12 }, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'acorn', do: 'moveTo', to: { x: 175, y: 20 }, dur: 0.4, ease: 'out' },
    { at: 4.5, actor: 'raccoon', do: 'moveTo', to: { x: 14, y: 71.1 }, dur: 0.35, ease: 'out' },
    { at: 4.55, actor: 'warrior', do: 'moveTo', to: { x: 32, y: 70.7 }, dur: 0.3 },
    { at: 4.85, actor: 'warrior', do: 'vanish', dur: 0.05 },
    { at: 4.85, actor: 'pile', do: 'pop', dur: 0.2 },
    { at: 4.9, actor: 'b1', do: 'vanish', dur: 0.2 },
    { at: 4.9, actor: 'b2', do: 'vanish', dur: 0.2 },
    { at: 4.9, actor: 'b3', do: 'vanish', dur: 0.2 },
    { at: 4.9, actor: 'shield', do: 'vanish', dur: 0.2 },
    { at: 5.1, actor: 'eyes', do: 'pop', dur: 0.25 },
    { at: 5.6, actor: 'eyes', do: 'squash', amount: 0.6, dur: 0.15 },
    // 今天：小太陽像彈簧一樣跳上天
    { at: 6.8, actor: 'sun', do: 'moveTo', to: { x: 132, y: 70 }, dur: 0.01 },
    { at: 6.85, actor: 'sun', do: 'moveTo', to: { x: 132, y: 22 }, dur: 0.5, ease: 'elastic' },
    { at: 6.85, actor: 'sun', do: 'scaleTo', amount: 1.5, dur: 0.5, ease: 'elastic' },
    { at: 7.4, actor: 'sun', do: 'bounce', amount: 2, times: 3, dur: 1.2 },
    // 戰士爬出來，暈暈地轉一圈比讚；花生這次敬禮敬對了
    { at: 7.5, actor: 'pile', do: 'vanish', dur: 0.2 },
    { at: 7.5, actor: 'eyes', do: 'vanish', dur: 0.1 },
    { at: 7.5, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 7.5, actor: 'warrior', do: 'pop', dur: 0.3 },
    { at: 7.7, actor: 'warrior', do: 'spin', times: 1, dur: 0.6 },
    { at: 8.3, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 8.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 回馬槍：那顆橡果又掉下來，敲在戰士頭上
    { at: 8.7, actor: 'acorn', do: 'moveTo', to: { x: 32, y: 59 }, dur: 0.01 },
    { at: 8.72, actor: 'acorn', do: 'drop', dur: 0.4 },
    { at: 8.95, actor: 'warrior', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 9.0, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 9.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
  ],
  builds: [
    // 兩根靠在一起的長條 → 屋頂；一根短的 → 中間那點；彎掉的泡棉劍 → 下面那一筆
    { at: 4.75, dur: 0.4, strokes: [0, 1], from: 'b3', color: '#1C4FD8' },
    { at: 5.1, dur: 0.25, strokes: [2], from: 'b2', color: '#1C4FD8' },
    { at: 5.3, dur: 0.3, strokes: [3], from: 'pile', color: '#1C4FD8' },
  ],
  glyph: [{ at: 5.65, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.8, kind: 'bubble', actor: 'warrior', emoji: '🌞', dur: 0.6, dx: 6 },
    { at: 2.4, kind: 'sweat', actor: 'warrior' },
    { at: 3.4, kind: 'pop', actor: 'raccoon', emoji: '🫡', dur: 0.4 },
    { at: 3.95, kind: 'pop', actor: 'warrior', emoji: '❗', dur: 0.5 },
    { at: 4.0, kind: 'sweat', actor: 'raccoon' },
    { at: 4.85, kind: 'puff', actor: 'pile', dur: 0.6 },
    { at: 4.85, kind: 'burst', actor: 'pile', emoji: '💨', n: 4, dur: 0.5 },
    { at: 6.9, kind: 'burst', actor: 'sun', emoji: '✨', n: 5, dur: 0.6 },
    { at: 8.3, kind: 'pop', actor: 'warrior', emoji: '👍', dur: 0.5 },
    { at: 9.0, kind: 'dizzy', actor: 'warrior', dur: 0.8 },
  ],
  camera: [
    // 定格那一秒慢慢推近塔頂，倒下時退回全景並震一下
    { at: 3.9, dur: 0.6, do: 'zoom', amount: 1.4, to: { x: 88, y: 44 } },
    { at: 4.5, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 4.85, dur: 0.3, do: 'shake', amount: 1.2 },
  ],
  cues: [
    { at: 1.4, say: '今' },
    { at: 1.9, sfx: 'tap' },
    { at: 2.3, sfx: 'clink' },
    { at: 2.7, sfx: 'tap' },
    { at: 3.45, sfx: 'tap' },
    { at: 4.5, sfx: 'rumble' },
    { at: 4.85, sfx: 'bonk' },
    { at: 5.7, say: '今' },
    { at: 6.85, sfx: 'boing' },
    { at: 6.95, say: '今天' },
    { at: 8.95, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
