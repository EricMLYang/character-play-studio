import type { Clip } from '../clip'

// 羊（重做）：布忍者拿片葉子躲在紙箱後面，腳都露出來；積木隊長疊成撞門槌衝過去，半路自己垮掉。再疊更高、拉遠全速衝——忍者「噗」一聲替身術跳上紙箱，
// 換一隻山羊站出來一頭頂回去，積木飛上天落成三橫一豎、羊角甩出兩點變成「羊」。國字讓到上方，忍者到中間變成大石頭，山羊跳上石頭擺姿勢（山羊）；回馬槍：山羊在石頭上猛跳，石頭變回壓扁的忍者，被一頭頂進紙箱只剩腳在外面。羊、羊、山羊
const C = 68.6 // 積木隊長（size 20）站在地上的 y
const N = 68.6 // 布忍者（size 20）
const GY = 67.8 // 山羊（size 22）
const BY = 72 // 積木（size 12）
const S = 10.5 // 積木一塊的高度
const R = 55 // 山羊站在石頭上的 y

const clip: Clip = {
  char: '羊',
  meta: { theme: '積木撞門槌抓忍者', cast: '積木隊長＋積木小隊＋布忍者＋山羊＋紙箱', gags: ['疊高半路自己垮', '替身術換成山羊一頭頂回去', '羊角甩出兩點', '忍者變石頭被山羊當山爬', '在石頭上猛跳壓扁忍者頂進紙箱露腳'] },
  duration: 10,
  bg: { top: '#FFF4DC', bottom: '#FDEBC8', floor: '#BFE8D4', scenery: 'room' },
  actors: [
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 141, y: N, size: 20 },
    { id: 'box', emoji: '📦', x: 132, y: 70.3, size: 16 },
    { id: 'goat', emoji: '🐐', x: 122, y: GY, size: 22, hidden: true },
    { id: 'b1', emoji: '🧱', x: -14, y: BY, size: 12 },
    { id: 'b2', emoji: '🧱', x: -14, y: BY, size: 12 },
    { id: 'b3', emoji: '🧱', x: -14, y: BY, size: 12 },
    { id: 'cap', emoji: 'hero:brick/march', x: -16, y: C, size: 20, flip: true },
  ],
  moves: [
    // 積木小隊進場，一塊一塊跳上去疊成塔，隊長在後面
    { at: 0, actor: 'b1', do: 'moveTo', to: { x: 44, y: BY }, dur: 0.55, ease: 'out' },
    { at: 0.15, actor: 'b2', do: 'moveTo', to: { x: 44, y: BY - S }, arc: 10, dur: 0.55, ease: 'out' },
    { at: 0.3, actor: 'b3', do: 'moveTo', to: { x: 44, y: BY - 2 * S }, arc: 12, dur: 0.55, ease: 'out' },
    { at: 0.1, actor: 'cap', do: 'moveTo', to: { x: 22, y: C }, dur: 0.7, ease: 'out' },
    // 隊長看到紙箱後面露出來的腳：就是那裡！
    { at: 0.95, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 0.95, actor: 'cap', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.05, actor: 'ninja', do: 'shake', amount: 0.6, dur: 0.4 },
    // 第一次衝：推著塔衝過去，上面兩塊半路垮掉
    { at: 1.3, actor: 'cap', do: 'swap', emoji: 'hero:brick/march' },
    { at: 1.35, actor: 'cap', do: 'moveTo', to: { x: 58, y: C }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 1.35, actor: 'b1', do: 'moveTo', to: { x: 80, y: BY }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 1.35, actor: 'b2', do: 'moveTo', to: { x: 80, y: BY - S }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 1.35, actor: 'b3', do: 'moveTo', to: { x: 80, y: BY - 2 * S }, dur: 0.45, anticipate: 3, ease: 'in' },
    { at: 1.8, actor: 'b3', do: 'moveTo', to: { x: 104, y: BY }, arc: 6, dur: 0.4, ease: 'bounce' },
    { at: 1.8, actor: 'b3', do: 'rotateTo', amount: 90, dur: 0.4 },
    { at: 1.85, actor: 'b2', do: 'moveTo', to: { x: 93, y: BY }, arc: 4, dur: 0.35, ease: 'bounce' },
    { at: 1.85, actor: 'b2', do: 'rotateTo', amount: 70, dur: 0.35 },
    { at: 1.85, actor: 'b1', do: 'tilt', amount: 18, dur: 0.3 },
    { at: 1.85, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 1.85, actor: 'cap', do: 'squash', amount: 0.3, dur: 0.3 },
    // 忍者在葉子後面偷笑
    { at: 2.25, actor: 'ninja', do: 'hop', amount: 2, dur: 0.2 },
    { at: 2.45, actor: 'ninja', do: 'hop', amount: 2, dur: 0.2 },
    // 再疊一次，這次隊長自己也站上去，變成四層高
    { at: 2.65, actor: 'b1', do: 'moveTo', to: { x: 36, y: BY }, arc: 5, dur: 0.35 },
    { at: 2.65, actor: 'b2', do: 'rotateTo', amount: -70, dur: 0.3 },
    { at: 2.7, actor: 'b2', do: 'moveTo', to: { x: 36, y: BY - S }, arc: 12, dur: 0.4 },
    { at: 2.65, actor: 'b3', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 2.75, actor: 'b3', do: 'moveTo', to: { x: 36, y: BY - 2 * S }, arc: 14, dur: 0.4 },
    { at: 2.75, actor: 'cap', do: 'swap', emoji: 'hero:brick/march' },
    { at: 2.85, actor: 'cap', do: 'moveTo', to: { x: 36, y: BY - 2 * S - 15 }, arc: 12, dur: 0.4, ease: 'back' },
    // 往後拉到最遠，抖著蓄力
    { at: 3.35, actor: 'b1', do: 'moveTo', to: { x: 16, y: BY }, dur: 0.3, ease: 'out' },
    { at: 3.35, actor: 'b2', do: 'moveTo', to: { x: 15, y: BY - S }, dur: 0.3, ease: 'out' },
    { at: 3.35, actor: 'b3', do: 'moveTo', to: { x: 14, y: BY - 2 * S }, dur: 0.3, ease: 'out' },
    { at: 3.35, actor: 'cap', do: 'moveTo', to: { x: 13, y: BY - 2 * S - 15 }, dur: 0.3, ease: 'out' },
    { at: 3.65, actor: 'b1', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: 3.65, actor: 'b2', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: 3.65, actor: 'b3', do: 'shake', amount: 0.6, dur: 0.25 },
    { at: 3.65, actor: 'cap', do: 'shake', amount: 0.6, dur: 0.25 },
    // 全速衝！
    { at: 3.9, actor: 'b1', do: 'moveTo', to: { x: 100, y: BY }, dur: 0.3, ease: 'in' },
    { at: 3.9, actor: 'b2', do: 'moveTo', to: { x: 101, y: BY - S }, dur: 0.3, ease: 'in' },
    { at: 3.9, actor: 'b3', do: 'moveTo', to: { x: 102, y: BY - 2 * S }, dur: 0.3, ease: 'in' },
    { at: 3.9, actor: 'cap', do: 'moveTo', to: { x: 103, y: BY - 2 * S - 15 }, dur: 0.3, ease: 'in' },
    // 忍者：噗！替身術——自己跳上紙箱，換一隻山羊站出來
    { at: 3.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 3.97, actor: 'ninja', do: 'moveTo', to: { x: 132, y: 54 }, arc: 8, dur: 0.3, ease: 'out' },
    { at: 3.97, actor: 'goat', do: 'pop', dur: 0.15 },
    { at: 4.05, actor: 'goat', do: 'squash', amount: -0.25, dur: 0.12 },
    { at: 4.14, actor: 'goat', do: 'moveTo', to: { x: 116, y: GY }, dur: 0.07, ease: 'out' },
    // 砰！山羊一頭頂回去，積木飛上天，隊長被彈回左邊
    { at: 4.2, actor: 'b1', do: 'moveTo', to: { x: 64, y: 8 }, dur: 0.45, ease: 'out' },
    { at: 4.2, actor: 'b1', do: 'spin', times: 2, dur: 0.45 },
    { at: 4.2, actor: 'b2', do: 'moveTo', to: { x: 98, y: 5 }, dur: 0.5, ease: 'out' },
    { at: 4.2, actor: 'b2', do: 'spin', times: -2, dur: 0.5 },
    { at: 4.2, actor: 'b3', do: 'moveTo', to: { x: 80, y: 2 }, dur: 0.55, ease: 'out' },
    { at: 4.2, actor: 'b3', do: 'spin', times: 3, dur: 0.55 },
    { at: 4.2, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.2, actor: 'cap', do: 'moveTo', to: { x: 17, y: C }, arc: 22, dur: 0.7, ease: 'out' },
    { at: 4.2, actor: 'cap', do: 'spin', times: -2, dur: 0.7 },
    { at: 4.21, actor: 'goat', do: 'moveTo', to: { x: 122, y: GY }, dur: 0.3, ease: 'out' },
    { at: 4.27, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    // 積木變成筆畫
    { at: 4.68, actor: 'b1', do: 'vanish', dur: 0.12 },
    { at: 4.9, actor: 'b2', do: 'vanish', dur: 0.12 },
    { at: 5.1, actor: 'b3', do: 'vanish', dur: 0.12 },
    // 山羊甩頭，羊角甩出兩點
    { at: 5.4, actor: 'goat', do: 'shake', amount: 1.4, dur: 0.35 },
    { at: 5.85, actor: 'goat', do: 'hop', amount: 5, dur: 0.35 },
    // 忍者坐在紙箱上笑隊長，隊長爬起來
    { at: 5.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 6.1, actor: 'cap', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 6.1, actor: 'cap', do: 'shake', amount: 0.8, dur: 0.3 },
    // 國字讓位：忍者跳到中間，噗——變成一顆大石頭躲起來
    { at: 6.95, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 6.95, actor: 'ninja', do: 'moveTo', to: { x: 80, y: N }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 7.4, actor: 'ninja', do: 'swap', emoji: '🪨' },
    // 山羊看到一座「山」，蹲下、一躍跳上去
    { at: 7.55, actor: 'goat', do: 'squash', amount: 0.25, dur: 0.15 },
    { at: 7.65, actor: 'goat', do: 'moveTo', to: { x: 80, y: R }, arc: 16, dur: 0.4, ease: 'out' },
    { at: 8.05, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 8.05, actor: 'cap', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 8.05, actor: 'cap', do: 'hop', amount: 4, dur: 0.3 },
    // 回馬槍：山羊在石頭上猛跳——石頭變回壓扁的忍者
    { at: 8.3, actor: 'goat', do: 'hop', amount: 12, dur: 0.35 },
    { at: 8.65, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 8.65, actor: 'ninja', do: 'squash', amount: 0.6, dur: 0.4 },
    { at: 8.65, actor: 'goat', do: 'flip' },
    { at: 8.65, actor: 'goat', do: 'moveTo', to: { x: 60, y: GY }, arc: 8, dur: 0.25, ease: 'out' },
    { at: 8.65, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    // 一頭頂進紙箱，只剩腳在外面
    { at: 8.9, actor: 'goat', do: 'squash', amount: -0.25, dur: 0.1 },
    { at: 8.98, actor: 'goat', do: 'moveTo', to: { x: 68, y: GY }, dur: 0.06, ease: 'out' },
    { at: 9.0, actor: 'ninja', do: 'moveTo', to: { x: 132, y: 50 }, arc: 22, dur: 0.4, ease: 'in' },
    { at: 9.0, actor: 'ninja', do: 'rotateTo', amount: 180, dur: 0.4 },
    { at: 9.05, actor: 'goat', do: 'moveTo', to: { x: 43, y: GY }, dur: 0.3, ease: 'out' },
    { at: 9.4, actor: 'box', do: 'squash', amount: 0.3, dur: 0.3 },
    { at: 9.55, actor: 'ninja', do: 'shake', amount: 1, dur: 0.4 },
    { at: 9.55, actor: 'cap', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 9.55, actor: 'goat', do: 'bounce', amount: 2, times: 2, dur: 0.4 },
  ],
  builds: [
    // 三塊積木從天上落成三橫一豎，羊角甩出上面兩點
    { at: 4.68, dur: 0.4, strokes: [2, 3], from: 'b1', style: 'drop', color: '#F76707' },
    { at: 4.9, dur: 0.35, strokes: [4], from: 'b2', style: 'drop', color: '#F76707' },
    { at: 5.1, dur: 0.35, strokes: [5], from: 'b3', style: 'drop', color: '#E8590C' },
    { at: 5.45, dur: 0.4, strokes: [0, 1], from: 'goat', color: '#8D5524' },
  ],
  glyph: [
    { at: 5.9, dur: 0.4, do: 'wobble' },
    { at: 6.7, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.95, kind: 'pop', actor: 'cap', emoji: '❗', dur: 0.6 },
    { at: 1.0, kind: 'pop', actor: 'ninja', emoji: '👣', dx: -4, dy: 22, dur: 0.7 },
    { at: 1.85, kind: 'puff', actor: 'b2', dur: 0.45 },
    { at: 2.2, kind: 'bubble', actor: 'cap', emoji: '😑', dur: 0.45 },
    { at: 2.25, kind: 'pop', actor: 'ninja', emoji: '😆', dur: 0.45 },
    { at: 3.55, kind: 'pop', actor: 'ninja', emoji: '❗', dur: 0.35 },
    { at: 3.95, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.45 },
    { at: 4.2, kind: 'burst', x: 108, y: 56, n: 1, dur: 0.4 },
    { at: 4.95, kind: 'dizzy', actor: 'cap', dur: 1.1 },
    { at: 5.85, kind: 'burst', actor: 'goat', emoji: '✨', n: 5, dur: 0.5 },
    { at: 6.3, kind: 'pop', actor: 'ninja', emoji: '😆', dur: 0.4 },
    { at: 7.4, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.45 },
    { at: 7.45, kind: 'pop', actor: 'goat', emoji: '❗', dx: 6, dur: 0.4 },
    { at: 8.05, kind: 'burst', x: 80, y: 62, emoji: '✨', n: 6, dur: 0.5 },
    { at: 8.1, kind: 'sweat', actor: 'ninja' },
    { at: 8.1, kind: 'pop', actor: 'cap', emoji: '👏', dur: 0.45 },
    { at: 8.65, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.4 },
    { at: 8.7, kind: 'dizzy', actor: 'ninja', dur: 0.5 },
    { at: 8.98, kind: 'burst', x: 76, y: 60, n: 1, dur: 0.3 },
    { at: 9.4, kind: 'puff', actor: 'box', dur: 0.4 },
  ],
  camera: [
    { at: 4.2, dur: 0.4, do: 'shake', amount: 2 },
  ],
  lights: [
    { at: 4.2, dur: 0.04, level: -0.4 },
    { at: 4.24, dur: 0.2, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.4, sfx: 'clink' },
    { at: 0.6, sfx: 'clink' },
    { at: 1.0, say: '羊' },
    { at: 1.35, sfx: 'whoosh' },
    { at: 1.85, sfx: 'crack' },
    { at: 2.8, sfx: 'clink' },
    { at: 3.9, sfx: 'whoosh' },
    { at: 3.95, sfx: 'poof' },
    { at: 4.2, sfx: 'bonk' },
    { at: 5.45, sfx: 'boing' },
    { at: 5.9, say: '羊' },
    { at: 7.4, sfx: 'poof' },
    { at: 8.05, say: '山羊' },
    { at: 8.65, sfx: 'poof' },
    { at: 8.98, sfx: 'bonk' },
    { at: 9.4, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
