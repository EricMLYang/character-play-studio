import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 草：玩具戰士想拔一束長草插在頭盔上當羽毛，結果草像橡皮筋一樣拉長；浣熊花生抱著兩個綠箱子跑來，對著空氣敬禮，再抓住另一頭。
// 拔河拔到發抖——啪！兩個一屁股跌坐，斷掉的草叢變「艹」、綠箱子疊成「日」、泡棉劍插下去變「十」。頭盔上冒出一根小草——越長越大，把戰士壓得一沉。草、草、小草
const clip: Clip = {
  char: '草',
  meta: { theme: '戰士拔草拔河', cast: '玩具戰士＋浣熊花生＋長草＋綠箱子', gags: ['草拉成橡皮筋', '拔河啪一聲雙雙跌坐', '對空氣敬禮自己倒下', '頭盔長草越長越大'] },
  duration: 10,
  bg: { top: '#FFF7E4', bottom: '#F2F7FF', floor: '#D8E6F5', scenery: 'track' },
  actors: [
    { id: 'grass', emoji: '🌿', x: 80, y: 71.1, size: 14 },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 58, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'sprout', emoji: '🌱', x: 24, y: 59.5, size: 6, hidden: true },
    { id: 'raccoon', emoji: 'hero:raccoon/carry', x: 104, y: 71.1, size: 14, hidden: true },
  ],
  moves: [
    // 戰士踏步進場，盯著長草，拍拍光禿禿的頭盔
    { at: 0.2, actor: 'warrior', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.7, ease: 'out' },
    { at: 0.2, actor: 'warrior', do: 'bounce', amount: 2, times: 3, dur: 0.7 },
    { at: 1.0, actor: 'warrior', do: 'hop', amount: 2, dur: 0.2 },
    // 用力一拔——草像橡皮筋拉長
    { at: 1.2, actor: 'warrior', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 1.2, actor: 'warrior', do: 'moveTo', to: { x: 55, y: 70.7 }, dur: 0.2 },
    { at: 1.2, actor: 'grass', do: 'squash', amount: -0.4, dur: 0.35 },
    // 花生抱著箱子跑來，對著空氣敬禮，再抓住另一頭
    { at: 1.4, actor: 'raccoon', do: 'enter', from: { x: 175, y: 71.1 }, dur: 0.6, ease: 'out' },
    { at: 2.0, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 2.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/carry' },
    // 拔河：越拉越遠、越躺越後面
    { at: 2.5, actor: 'grass', do: 'vanish', dur: 0.2 },
    { at: 2.5, actor: 'warrior', do: 'moveTo', to: { x: 34, y: 70.7 }, dur: 1.1 },
    { at: 2.5, actor: 'warrior', do: 'rotateTo', amount: -12, dur: 0.5, ease: 'out' },
    { at: 2.5, actor: 'raccoon', do: 'moveTo', to: { x: 128, y: 71.1 }, dur: 1.1 },
    { at: 2.5, actor: 'raccoon', do: 'rotateTo', amount: 12, dur: 0.5, ease: 'out' },
    { at: 3.6, actor: 'warrior', do: 'shake', amount: 0.7, dur: 0.6 },
    { at: 3.6, actor: 'raccoon', do: 'shake', amount: 0.7, dur: 0.6 },
    // 啪！兩個往後飛，一屁股跌坐
    { at: 4.25, actor: 'warrior', do: 'moveTo', to: { x: 24, y: 70.7 }, dur: 0.3, ease: 'out' },
    { at: 4.25, actor: 'warrior', do: 'rotateTo', amount: 12, dur: 0.3 },
    { at: 4.25, actor: 'raccoon', do: 'moveTo', to: { x: 138, y: 71.1 }, dur: 0.3, ease: 'out' },
    { at: 4.25, actor: 'raccoon', do: 'rotateTo', amount: -12, dur: 0.3 },
    { at: 4.55, actor: 'warrior', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.55, actor: 'raccoon', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.55, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 4.55, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 頭盔上冒出一根小草
    { at: 6.1, actor: 'sprout', do: 'pop' },
    { at: 6.15, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 6.3, actor: 'sprout', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 6.7, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
    { at: 6.9, actor: 'warrior', do: 'hop', amount: 3, dur: 0.3 },
    { at: 6.9, actor: 'sprout', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.2, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/shield' },
    // 花生對著「草」敬禮，然後直直倒下
    { at: 7.4, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    { at: 7.9, actor: 'raccoon', do: 'rotateTo', amount: 90, dur: 0.35, ease: 'in' },
    { at: 8.25, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    // 回馬槍：小草越長越大，把戰士壓得一沉
    { at: 8.6, actor: 'sprout', do: 'scaleTo', amount: 2.2, dur: 0.5, ease: 'elastic' },
    { at: 8.65, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 8.7, actor: 'warrior', do: 'squash', amount: 0.25, dur: 0.4 },
    ...pressStack(8.7, 0.4, 0.25, 15, ['sprout']),
    { at: 9.2, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/happy' },
  ],
  builds: [
    // 斷掉的草叢 → 艹；花生的兩個綠箱子 → 日；泡棉劍插下去 → 十
    { at: 4.3, dur: 0.5, strokes: [0, 1, 2], from: { x: 80, y: 58 }, color: '#2FA84F' },
    { at: 4.55, dur: 0.6, strokes: [3, 4, 5, 6], from: 'raccoon', color: '#2FA84F' },
    { at: 4.95, dur: 0.5, strokes: [7, 8], from: 'warrior', color: '#23913F' },
  ],
  glyph: [{ at: 5.5, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'warrior', emoji: '💡', dur: 0.5 },
    { at: 1.5, kind: 'pop', actor: 'warrior', emoji: '❓', dur: 0.5 },
    { at: 2.05, kind: 'pop', actor: 'raccoon', emoji: '❓', dx: -6, dur: 0.4 },
    { at: 2.45, kind: 'line', actor: 'warrior', target: 'raccoon', color: '#3FAE4A', width: 1.4, dur: 1.8 },
    { at: 2.7, kind: 'puff', actor: 'warrior', dur: 0.4 },
    { at: 2.7, kind: 'puff', actor: 'raccoon', dur: 0.4 },
    { at: 2.9, kind: 'pop', actor: 'warrior', emoji: '😤', dur: 0.6 },
    { at: 3.3, kind: 'puff', actor: 'warrior', dur: 0.4 },
    { at: 3.3, kind: 'puff', actor: 'raccoon', dur: 0.4 },
    { at: 3.7, kind: 'sweat', actor: 'raccoon' },
    { at: 4.25, kind: 'burst', x: 80, y: 58, dur: 0.4 },
    { at: 4.55, kind: 'puff', actor: 'warrior', dur: 0.4 },
    { at: 4.55, kind: 'puff', actor: 'raccoon', dur: 0.4 },
    { at: 4.6, kind: 'dizzy', actor: 'warrior', dur: 1.0 },
    { at: 8.3, kind: 'puff', actor: 'raccoon', dur: 0.4 },
    { at: 8.75, kind: 'pop', actor: 'warrior', emoji: '😵', dx: 8, dur: 0.5 },
  ],
  camera: [
    { at: 3.4, dur: 0.5, do: 'zoom', amount: 1.25, to: { x: 80, y: 58 } },
    { at: 4.25, dur: 0.25, do: 'zoom', amount: 1 },
    { at: 4.55, dur: 0.3, do: 'shake' },
  ],
  cues: [
    { at: 0.2, sfx: 'tap' },
    { at: 1.25, say: '草' },
    { at: 1.3, sfx: 'boing' },
    { at: 1.5, sfx: 'tap' },
    { at: 2.5, sfx: 'slide' },
    { at: 3.6, sfx: 'rumble' },
    { at: 4.25, sfx: 'crack' },
    { at: 4.55, sfx: 'plop' },
    { at: 5.5, say: '草' },
    { at: 6.1, sfx: 'poof' },
    { at: 6.15, say: '小草' },
    { at: 8.25, sfx: 'plop' },
    { at: 8.6, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
