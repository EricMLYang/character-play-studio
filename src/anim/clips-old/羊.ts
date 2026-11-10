import type { Clip } from '../clip'

// 羊（積木小隊撞門槌）：積木隊長看到布忍者躲在太矮的紙牆後面——腳都露出來了。積木疊成撞門槌衝過去，半路自己垮掉；
// 再疊更高、往後拉兩倍再衝，「砰」撞扁紙牆，積木飛起來落成「羊」。牆後蹦出一隻山羊；忍者又想躲，這次連紙牆都沒了。羊、羊、山羊
const clip: Clip = {
  char: '羊',
  meta: { theme: '積木小隊撞門槌', cast: '積木小隊＋布忍者＋山羊', gags: ['疊高半路自己垮', '拉弓再衝撞扁紙牆', '躲貓貓露腳回馬槍'] },
  duration: 10,
  bg: { top: '#FFF6E3', bottom: '#FDEFD2', floor: '#BFE8D4', scenery: 'room' },
  actors: [
    { id: 'goat', emoji: '🐐', x: 151, y: 72, size: 12, hidden: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 141, y: 71.5, size: 13 },
    { id: 'wall', emoji: '📦', x: 136, y: 72.5, size: 11 },
    { id: 'b1', emoji: '🧱', x: 30, y: 73.2, size: 9, hidden: true },
    { id: 'b2', emoji: '🧱', x: 22, y: 73.2, size: 9, hidden: true },
    { id: 'b3', emoji: '🧱', x: 14, y: 73.2, size: 9, hidden: true },
    { id: 'cap', emoji: 'hero:brick/march', x: 42, y: 71.5, size: 13, hidden: true, flip: true },
  ],
  moves: [
    // 積木小隊踏步進場
    { at: 0, actor: 'cap', do: 'enter', from: { x: -12, y: 71.5 }, dur: 0.8 },
    { at: 0, actor: 'cap', do: 'bounce', dur: 0.8, times: 4, amount: 1.2 },
    { at: 0.1, actor: 'b1', do: 'enter', from: { x: -14, y: 73.2 }, dur: 0.75 },
    { at: 0.2, actor: 'b2', do: 'enter', from: { x: -14, y: 73.2 }, dur: 0.7 },
    { at: 0.3, actor: 'b3', do: 'enter', from: { x: -14, y: 73.2 }, dur: 0.65 },
    // 隊長看到露出來的腳：就是那裡！
    { at: 0.9, actor: 'cap', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.9, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    // 喀喀喀疊成撞門槌
    { at: 1.1, actor: 'b2', do: 'moveTo', to: { x: 30, y: 65 }, arc: 6, dur: 0.3, ease: 'back' },
    { at: 1.3, actor: 'b3', do: 'moveTo', to: { x: 30, y: 57 }, arc: 8, dur: 0.3, ease: 'back' },
    { at: 1.4, actor: 'cap', do: 'swap', emoji: 'hero:brick/stack' },
    // 第一次衝：半路自己垮掉
    { at: 1.8, actor: 'b1', do: 'moveTo', to: { x: 72, y: 73.2 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 1.8, actor: 'b2', do: 'moveTo', to: { x: 72, y: 65 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 1.8, actor: 'b3', do: 'moveTo', to: { x: 72, y: 57 }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 2.25, actor: 'b3', do: 'moveTo', to: { x: 94, y: 73.2 }, arc: 4, dur: 0.4, ease: 'bounce' },
    { at: 2.25, actor: 'b3', do: 'rotateTo', amount: 90, dur: 0.4 },
    { at: 2.3, actor: 'b2', do: 'moveTo', to: { x: 84, y: 73.2 }, arc: 3, dur: 0.35, ease: 'bounce' },
    { at: 2.3, actor: 'b2', do: 'rotateTo', amount: 70, dur: 0.35 },
    { at: 2.3, actor: 'b1', do: 'tilt', amount: 20, dur: 0.3 },
    { at: 2.4, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    // 忍者的煙霧彈自己爆了，他只好更用力站著不動
    { at: 2.45, actor: 'ninja', do: 'shake', amount: 0.8, dur: 0.4 },
    // 爬起來、更快再疊一次，隊長站上最上面
    { at: 3.0, actor: 'b1', do: 'moveTo', to: { x: 30, y: 73.2 }, arc: 6, dur: 0.4 },
    { at: 3.0, actor: 'b2', do: 'rotateTo', amount: -70, dur: 0.3 },
    { at: 3.05, actor: 'b2', do: 'moveTo', to: { x: 30, y: 65 }, arc: 10, dur: 0.4 },
    { at: 3.0, actor: 'b3', do: 'rotateTo', amount: -90, dur: 0.3 },
    { at: 3.1, actor: 'b3', do: 'moveTo', to: { x: 30, y: 57 }, arc: 12, dur: 0.4 },
    { at: 3.1, actor: 'cap', do: 'swap', emoji: 'hero:brick/march' },
    { at: 3.2, actor: 'cap', do: 'moveTo', to: { x: 30, y: 47 }, arc: 10, dur: 0.4, ease: 'back' },
    // 往後拉兩倍遠
    { at: 3.65, actor: 'b1', do: 'moveTo', to: { x: 20, y: 73.2 }, dur: 0.3, ease: 'out' },
    { at: 3.65, actor: 'b2', do: 'moveTo', to: { x: 19, y: 65 }, dur: 0.3, ease: 'out' },
    { at: 3.65, actor: 'b3', do: 'moveTo', to: { x: 18, y: 57 }, dur: 0.3, ease: 'out' },
    { at: 3.65, actor: 'cap', do: 'moveTo', to: { x: 17, y: 47 }, dur: 0.3, ease: 'out' },
    { at: 3.65, actor: 'b1', do: 'squash', amount: -0.2, dur: 0.3 },
    // 全速衝！
    { at: 3.95, actor: 'b1', do: 'moveTo', to: { x: 126, y: 73.2 }, dur: 0.3, ease: 'in' },
    { at: 3.95, actor: 'b2', do: 'moveTo', to: { x: 126, y: 65 }, dur: 0.3, ease: 'in' },
    { at: 3.95, actor: 'b3', do: 'moveTo', to: { x: 126, y: 57 }, dur: 0.3, ease: 'in' },
    { at: 3.95, actor: 'cap', do: 'moveTo', to: { x: 126, y: 47 }, dur: 0.3, ease: 'in' },
    // 砰！紙牆壓扁、塔像手風琴擠扁，積木飛出去
    { at: 4.25, actor: 'wall', do: 'rotateTo', amount: 90, dur: 0.2, ease: 'out' },
    { at: 4.25, actor: 'wall', do: 'moveTo', to: { x: 140, y: 74 }, dur: 0.2 },
    { at: 4.25, actor: 'b1', do: 'squash', amount: 0.5, dur: 0.25 },
    { at: 4.25, actor: 'b2', do: 'squash', amount: 0.5, dur: 0.25 },
    { at: 4.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.3, actor: 'ninja', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.35, actor: 'b3', do: 'vanish', dur: 0.15 },
    { at: 4.55, actor: 'b2', do: 'vanish', dur: 0.15 },
    { at: 5.05, actor: 'b1', do: 'vanish', dur: 0.15 },
    // 隊長從牆上彈開，滾到右下角
    { at: 4.3, actor: 'cap', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 4.3, actor: 'cap', do: 'moveTo', to: { x: 120, y: 71.5 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 4.3, actor: 'cap', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.9, actor: 'cap', do: 'squash', amount: 0.3, dur: 0.3 },
    // 牆後面蹦出一隻山羊，輕輕頂一下忍者
    { at: 6.25, actor: 'goat', do: 'pop', dur: 0.35 },
    { at: 6.3, actor: 'goat', do: 'hop', amount: 6, dur: 0.4 },
    { at: 6.9, actor: 'goat', do: 'moveTo', to: { x: 147, y: 72 }, dur: 0.2 },
    { at: 7.1, actor: 'goat', do: 'moveTo', to: { x: 151, y: 72 }, dur: 0.3 },
    { at: 7.0, actor: 'ninja', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.1, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 7.0, actor: 'cap', do: 'swap', emoji: 'hero:brick/happy' },
    { at: 7.0, actor: 'cap', do: 'tilt', amount: 12, dur: 0.6 },
    // 回馬槍：忍者又想躲——可是紙牆已經扁了，整個人露在外面
    { at: 8.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.0, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 8.2, actor: 'goat', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 8.9, actor: 'cap', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 8.9, actor: 'cap', do: 'hop', amount: 5, dur: 0.35 },
    { at: 9.4, actor: 'goat', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
  ],
  builds: [
    // 兩塊短積木斜斜落下 → 上面兩點；三條長條 → 三橫；高高的柱子 → 中間一豎
    { at: 4.35, dur: 0.45, strokes: [0, 1], from: 'b3', color: '#F76707' },
    { at: 4.55, dur: 0.6, strokes: [2, 3, 4], from: 'b2', color: '#F76707' },
    { at: 5.05, dur: 0.45, strokes: [5], from: 'b1', color: '#E8590C' },
  ],
  glyph: [{ at: 5.55, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'pop', actor: 'cap', emoji: '❗', dur: 0.6 },
    { at: 1.0, kind: 'pop', actor: 'ninja', emoji: '👣', dx: -10, dy: 12, dur: 0.6 },
    { at: 2.3, kind: 'puff', actor: 'b2', dur: 0.5 },
    { at: 2.45, kind: 'burst', actor: 'ninja', emoji: '💨', dur: 0.6 },
    { at: 2.6, kind: 'sweat', actor: 'ninja' },
    { at: 2.65, kind: 'bubble', actor: 'cap', emoji: '😑', dur: 0.4 },
    { at: 4.25, kind: 'burst', actor: 'wall', emoji: '💥', dur: 0.5 },
    { at: 4.35, kind: 'dizzy', actor: 'ninja', dur: 1.4 },
    { at: 4.95, kind: 'dizzy', actor: 'cap', dur: 1.8 },
    { at: 6.3, kind: 'pop', actor: 'goat', emoji: '❗', dur: 0.5 },
    { at: 8.4, kind: 'bubble', actor: 'goat', emoji: '🙈', dx: -18, dur: 0.7 },
    { at: 8.9, kind: 'pop', actor: 'cap', emoji: '👀', dur: 0.6 },
  ],
  camera: [
    // 全速衝的那一下跟拍撞門槌，撞完退回全景
    { at: 3.95, dur: 0.15, do: 'follow', actor: 'b2', amount: 1.3 },
    { at: 4.35, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.25, dur: 0.4, do: 'shake', amount: 2 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.1, say: '羊' },
    { at: 1.15, sfx: 'clink' },
    { at: 1.35, sfx: 'clink' },
    { at: 1.8, sfx: 'whoosh' },
    { at: 2.3, sfx: 'crack' },
    { at: 2.45, sfx: 'poof' },
    { at: 3.1, sfx: 'clink' },
    { at: 3.95, sfx: 'whoosh' },
    { at: 4.25, sfx: 'bonk' },
    { at: 5.55, say: '羊' },
    { at: 6.3, say: '山羊' },
    { at: 6.3, sfx: 'boing' },
    { at: 8.9, sfx: 'blip' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
