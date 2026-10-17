import type { Clip } from '../clip'

// 午：正中午的大太陽下，積木小隊疊成高高的積木騎士，拿紅積木條跟調皮小老鼠比劍。騎士用力一揮——揮空轉一圈；小老鼠也揮——轉成陀螺。
// 兩個暈呼呼地靠近，頭「啵」地撞在一起，掉下來的紅積木條和倒下的高塔排成「午」；握手、打哈欠，一起躺下午睡——連太陽都睏到打瞌睡。午、午、午睡
const clip: Clip = {
  char: '午',
  meta: { theme: '中午比劍', cast: '積木小隊＋小老鼠＋太陽', gags: ['揮太大力轉一圈', '兩個都轉成陀螺', '頭撞頭', '太陽也睡著'] },
  duration: 10,
  bg: { top: '#A9DBFF', bottom: '#E6F5FF', floor: '#BFE3A6', scenery: 'hills' },
  actors: [
    { id: 'sun', emoji: '☀️', x: 80, y: 11, size: 12, float: true },
    { id: 'brick', emoji: 'hero:brick/march', x: 40, y: 70.7, size: 15, hidden: true, flip: true },
    { id: 'mouse', emoji: 'hero:mouse/idle', x: 112, y: 72, size: 12, hidden: true },
  ],
  moves: [
    // 積木小隊踏步進場，喀喀疊成高高的騎士；小老鼠從右邊滑進來
    { at: 0.1, actor: 'brick', do: 'enter', from: { x: -15, y: 70.7 }, dur: 0.6, ease: 'out' },
    { at: 0.1, actor: 'brick', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 0.8, actor: 'brick', do: 'swap', emoji: 'hero:brick/stack' },
    { at: 0.8, actor: 'brick', do: 'scaleTo', amount: 1.3, dur: 0.4, ease: 'elastic' },
    { at: 0.4, actor: 'mouse', do: 'enter', from: { x: 175, y: 72 }, dur: 0.5, ease: 'back' },
    { at: 0.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    // 騎士往前一傾，敲敲地板下戰帖
    { at: 1.3, actor: 'brick', do: 'tilt', amount: 15, dur: 0.35 },
    // 超大的預備動作……用力一揮——揮空，自己轉一圈
    { at: 1.8, actor: 'brick', do: 'tilt', amount: -25, dur: 0.5 },
    { at: 2.3, actor: 'brick', do: 'spin', dur: 0.5 },
    { at: 2.3, actor: 'mouse', do: 'hop', amount: 6, dur: 0.35 },
    // 小老鼠也揮，轉成陀螺
    { at: 2.9, actor: 'mouse', do: 'squash', amount: -0.3, dur: 0.3 },
    { at: 3.15, actor: 'mouse', do: 'spin', times: 3, dur: 0.6 },
    // 兩個都暈了，搖搖晃晃靠近
    { at: 3.7, actor: 'brick', do: 'swap', emoji: 'hero:brick/dizzy' },
    { at: 3.7, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
    { at: 3.75, actor: 'brick', do: 'moveTo', to: { x: 70, y: 70.7 }, dur: 0.55 },
    { at: 3.75, actor: 'mouse', do: 'moveTo', to: { x: 84, y: 72 }, dur: 0.55 },
    { at: 3.75, actor: 'brick', do: 'shake', amount: 1, dur: 0.55 },
    { at: 3.75, actor: 'mouse', do: 'shake', amount: 1, dur: 0.55 },
    // 定一下……啵！頭撞頭，一屁股坐下
    { at: 4.6, actor: 'brick', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.6, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 4.85, actor: 'mouse', do: 'moveTo', to: { x: 124, y: 72 }, dur: 0.5, ease: 'out' },
    { at: 4.85, actor: 'mouse', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 5.0, actor: 'brick', do: 'tilt', amount: 12, dur: 0.4 },
    // 高塔自己倒下去，立起來變成中間那一豎
    { at: 5.4, actor: 'brick', do: 'vanish', dur: 0.2 },
    // 積木小隊重新組好，從右邊踏步回來
    { at: 6.4, actor: 'brick', do: 'swap', emoji: 'hero:brick/march' },
    { at: 6.4, actor: 'brick', do: 'enter', from: { x: 175, y: 70.7 }, dur: 0.6, ease: 'out' },
    { at: 6.3, actor: 'brick', do: 'moveTo', to: { x: 142, y: 70.7 }, dur: 0.01 },
    { at: 6.3, actor: 'brick', do: 'flip' },
    { at: 6.4, actor: 'brick', do: 'bounce', amount: 2, times: 3, dur: 0.6 },
    { at: 6.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
    { at: 6.5, actor: 'mouse', do: 'flip' },
    // 握手，打個大哈欠，一起躺下午睡
    { at: 7.0, actor: 'brick', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.0, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
    { at: 7.3, actor: 'brick', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 7.3, actor: 'mouse', do: 'squash', amount: -0.2, dur: 0.4 },
    { at: 7.65, actor: 'brick', do: 'rotateTo', amount: -90, dur: 0.3, ease: 'bounce' },
    { at: 7.65, actor: 'mouse', do: 'rotateTo', amount: 90, dur: 0.3, ease: 'bounce' },
    { at: 7.65, actor: 'brick', do: 'swap', emoji: 'hero:brick/idle' },
    { at: 7.65, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
    // 回馬槍：連太陽都睏到打瞌睡，天色暗了一下
    { at: 8.5, actor: 'sun', do: 'tilt', amount: 20, dur: 0.8 },
    { at: 8.5, actor: 'sun', do: 'moveTo', to: { x: 80, y: 13 }, dur: 0.6 },
    { at: 9.2, actor: 'sun', do: 'moveTo', to: { x: 80, y: 11 }, dur: 0.3, ease: 'back' },
    { at: 9.2, actor: 'sun', do: 'hop', amount: 3, dur: 0.3 },
  ],
  builds: [
    // 撞頭震下三根紅積木條：斜的一撇、上面短橫、下面長橫；倒下的高塔 → 中間一豎
    { at: 4.7, dur: 0.35, strokes: [0], from: 'brick', color: '#E8483A' },
    { at: 4.95, dur: 0.35, strokes: [1], from: 'brick', color: '#E8483A' },
    { at: 5.15, dur: 0.4, strokes: [2], from: 'brick', color: '#D63A2C' },
    { at: 5.45, dur: 0.45, strokes: [3], from: { x: 80, y: 60 }, color: '#D63A2C' },
  ],
  glyph: [{ at: 5.95, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.85, kind: 'burst', actor: 'brick', emoji: '🧱', n: 4, dur: 0.4 },
    { at: 1.3, kind: 'pop', actor: 'brick', emoji: '⚔️', dur: 0.6 },
    { at: 1.4, kind: 'pop', actor: 'mouse', emoji: '😏', dur: 0.6 },
    { at: 2.5, kind: 'pop', actor: 'mouse', emoji: '😆', dur: 0.5 },
    { at: 3.7, kind: 'dizzy', actor: 'brick', dur: 0.9 },
    { at: 3.7, kind: 'dizzy', actor: 'mouse', dur: 0.9 },
    { at: 4.6, kind: 'burst', actor: 'mouse', dx: -6, dur: 0.4 },
    { at: 4.85, kind: 'puff', actor: 'mouse', dur: 0.4 },
    { at: 5.45, kind: 'puff', actor: 'brick', dur: 0.5 },
    { at: 7.0, kind: 'pop', actor: 'mouse', emoji: '🤝', dx: 9, dur: 0.6 },
    { at: 7.3, kind: 'pop', actor: 'brick', emoji: '🥱', dur: 0.4 },
    { at: 7.95, kind: 'zzz', actor: 'brick', dur: 1.6 },
    { at: 8.05, kind: 'zzz', actor: 'mouse', dur: 1.5 },
    { at: 8.6, kind: 'zzz', actor: 'sun', dx: 12, dy: 10, dur: 0.6 },
  ],
  lights: [
    { at: 8.6, dur: 0.4, level: 0.35 },
    { at: 9.15, dur: 0.25, level: 0 },
  ],
  camera: [
    { at: 2.3, dur: 0.5, do: 'punch', amount: 0.15, to: { x: 40, y: 60 } },
    { at: 4.6, dur: 0.4, do: 'punch', amount: 0.2, to: { x: 77, y: 60 } },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.6, sfx: 'slide' },
    { at: 0.85, sfx: 'clink' },
    { at: 1.35, say: '午' },
    { at: 1.4, sfx: 'tap' },
    { at: 2.3, sfx: 'whoosh' },
    { at: 3.15, sfx: 'whoosh' },
    { at: 4.6, sfx: 'boing' },
    { at: 4.9, sfx: 'plop' },
    { at: 5.45, sfx: 'bonk' },
    { at: 5.95, say: '午' },
    { at: 6.4, sfx: 'tap' },
    { at: 7.7, sfx: 'plop' },
    { at: 7.75, say: '午睡' },
    { at: 9.2, sfx: 'boing' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
