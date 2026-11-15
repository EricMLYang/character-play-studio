import type { Clip } from '../clip'

// 在（重做）：披風英雄和布忍者玩捉迷藏，英雄數完三二一拿放大鏡往右找、往左找，忍者每次都跳到他背後另一邊；英雄衝去找積木塔後面，一頭撞散藍色積木，積木落下拼成「在」。
// 國字讓到上方，英雄走到中間嘆氣，忍者拍拍他肩膀——一轉身就是臉對臉「在這裡」！回馬槍：忍者丟煙霧彈，煙散了卻站在英雄頭上跟著他左看右看。在、在、在這裡
const H = 67.1 // 披風英雄（size 22）站在地上的 y
const N = 67.1 // 布忍者（size 22）站在地上的 y
const L = 60 // 放大鏡拿在手上的高度

const clip: Clip = {
  char: '在',
  meta: { theme: '捉迷藏', cast: '披風英雄＋布忍者＋放大鏡＋藍色積木', gags: ['拿放大鏡左找右找、忍者一直跳到背後另一邊', '衝去找撞散積木', '一轉身臉對臉', '煙霧彈躲到頭上跟著左看右看'] },
  duration: 10,
  bg: { top: '#D0EBFF', bottom: '#E7F5FF', floor: '#A5D8FF', scenery: 'hills' },
  actors: [
    { id: 'blk1', emoji: '🟦', x: 146, y: 72, size: 10 },
    { id: 'blk2', emoji: '🟦', x: 146, y: 63.5, size: 10 },
    { id: 'blk3', emoji: '🟦', x: 146, y: 55, size: 10 },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 112, y: N, size: 22 },
    { id: 'hero', emoji: 'hero:cape/idle', x: 72, y: H, size: 22, hidden: true, flip: true },
    { id: 'lens', emoji: '🔍', x: 88, y: L, size: 11, hidden: true, float: true, flip: true },
    { id: 'smoke', emoji: '☁️', x: 54, y: 50, size: 46, hidden: true, float: true },
  ],
  moves: [
    // 英雄跑進來，轉身背對忍者、遮眼數三二一
    { at: 0, actor: 'hero', do: 'enter', from: { x: -20, y: H }, dur: 0.5, ease: 'out' },
    { at: 0.6, actor: 'hero', do: 'flip' },
    { at: 0.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    // 忍者踮腳溜到英雄背後
    { at: 0.85, actor: 'ninja', do: 'moveTo', to: { x: 94, y: N }, dur: 0.75, ease: 'linear' },
    { at: 0.85, actor: 'ninja', do: 'bounce', amount: 1.2, times: 4, dur: 0.75 },
    // 數完！轉身拿放大鏡往右找——忍者一跳翻到他左邊
    { at: 1.75, actor: 'hero', do: 'flip' },
    { at: 1.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 1.75, actor: 'lens', do: 'pop' },
    { at: 1.75, actor: 'ninja', do: 'moveTo', to: { x: 50, y: N }, arc: 22, dur: 0.3, ease: 'out' },
    { at: 1.75, actor: 'ninja', do: 'spin', times: -1, dur: 0.3, pivot: 'center' },
    { at: 2.05, actor: 'hero', do: 'tilt', amount: 9, dur: 0.4 },
    { at: 2.05, actor: 'lens', do: 'moveTo', to: { x: 92, y: L - 1 }, dur: 0.2, ease: 'out' },
    // 往左找——忍者又翻到右邊
    { at: 2.45, actor: 'hero', do: 'flip' },
    { at: 2.45, actor: 'lens', do: 'flip' },
    { at: 2.45, actor: 'lens', do: 'moveTo', to: { x: 52, y: L - 1 }, dur: 0.2, ease: 'out' },
    { at: 2.45, actor: 'ninja', do: 'moveTo', to: { x: 94, y: N }, arc: 22, dur: 0.28, ease: 'out' },
    { at: 2.45, actor: 'ninja', do: 'spin', times: 1, dur: 0.28, pivot: 'center' },
    { at: 2.65, actor: 'hero', do: 'tilt', amount: -9, dur: 0.35 },
    // 再往右，更快——忍者再翻回左邊
    { at: 3.0, actor: 'hero', do: 'flip' },
    { at: 3.0, actor: 'lens', do: 'flip' },
    { at: 3.0, actor: 'lens', do: 'moveTo', to: { x: 92, y: L - 1 }, dur: 0.15, ease: 'out' },
    { at: 3.0, actor: 'ninja', do: 'moveTo', to: { x: 50, y: N }, arc: 22, dur: 0.22, ease: 'out' },
    { at: 3.0, actor: 'ninja', do: 'spin', times: -1, dur: 0.22, pivot: 'center' },
    { at: 3.2, actor: 'hero', do: 'tilt', amount: 9, dur: 0.3 },
    // 一定在積木塔後面！衝！忍者也踮腳跟著衝
    { at: 3.55, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 3.55, actor: 'hero', do: 'moveTo', to: { x: 134, y: H }, dur: 0.4, anticipate: 4, ease: 'in' },
    { at: 3.55, actor: 'lens', do: 'moveTo', to: { x: 144, y: L }, dur: 0.4, ease: 'in' },
    { at: 3.6, actor: 'ninja', do: 'moveTo', to: { x: 120, y: N }, dur: 0.45, ease: 'in' },
    // 咚！撞散積木，放大鏡也飛掉
    { at: 3.95, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.95, actor: 'hero', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 3.95, actor: 'lens', do: 'moveTo', to: { x: 148, y: 72 }, arc: 16, dur: 0.5, ease: 'linear' },
    { at: 3.95, actor: 'lens', do: 'spin', times: 2, dur: 0.5, pivot: 'center' },
    { at: 3.95, actor: 'blk1', do: 'moveTo', to: { x: 118, y: 26 }, dur: 0.4, ease: 'out' },
    { at: 3.95, actor: 'blk1', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.95, actor: 'blk2', do: 'moveTo', to: { x: 140, y: 16 }, dur: 0.45, ease: 'out' },
    { at: 3.95, actor: 'blk2', do: 'spin', times: -2, dur: 0.6 },
    { at: 3.95, actor: 'blk3', do: 'moveTo', to: { x: 154, y: 30 }, dur: 0.4, ease: 'out' },
    { at: 3.95, actor: 'blk3', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.35, actor: 'blk3', do: 'vanish', dur: 0.25 },
    { at: 4.8, actor: 'blk2', do: 'vanish', dur: 0.25 },
    { at: 5.15, actor: 'blk1', do: 'vanish', dur: 0.25 },
    // 忍者在背後也學他暈
    { at: 4.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.15, actor: 'ninja', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 4.6, actor: 'ninja', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 5.1, actor: 'hero', do: 'shake', amount: 1, dur: 0.4 },
    { at: 5.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 5.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    // 國字讓位：兩人放大一點；英雄垂頭走到中間，忍者踮腳黏在他背後
    { at: 6.5, actor: 'hero', do: 'scaleTo', amount: 1.25, dur: 0.5 },
    { at: 6.5, actor: 'ninja', do: 'scaleTo', amount: 1.25, dur: 0.5 },
    { at: 6.5, actor: 'hero', do: 'flip' },
    { at: 6.55, actor: 'hero', do: 'moveTo', to: { x: 66, y: H }, dur: 0.6, ease: 'inOut' },
    // 忍者先往後一跳讓他走過去，再踮腳黏上去
    { at: 6.5, actor: 'ninja', do: 'moveTo', to: { x: 142, y: N }, arc: 10, dur: 0.3, ease: 'out' },
    { at: 6.85, actor: 'ninja', do: 'moveTo', to: { x: 94, y: N }, dur: 0.45, ease: 'linear' },
    { at: 6.85, actor: 'ninja', do: 'bounce', amount: 1.2, times: 3, dur: 0.45 },
    { at: 7.05, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.3 },
    // 拍拍肩膀
    { at: 7.3, actor: 'ninja', do: 'moveTo', to: { x: 88, y: N }, dur: 0.15, ease: 'out' },
    { at: 7.3, actor: 'ninja', do: 'tilt', amount: -14, dur: 0.25 },
    // 一轉身：臉對臉！在這裡！
    { at: 7.55, actor: 'hero', do: 'flip' },
    { at: 7.65, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.65, actor: 'ninja', do: 'hop', amount: 5, dur: 0.35 },
    { at: 7.65, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 7.65, actor: 'hero', do: 'hop', amount: 8, dur: 0.5 },
    // 嚇得往後跳一步
    { at: 8.15, actor: 'hero', do: 'moveTo', to: { x: 46, y: H }, dur: 0.2, ease: 'out' },
    // 回馬槍：忍者丟煙霧彈想再躲一次……
    { at: 8.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 8.45, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.45, actor: 'ninja', do: 'moveTo', to: { x: 46, y: 45 }, arc: 4, dur: 0.3, ease: 'out' },
    // 煙霧彈炸開，一大團煙把兩個人都蓋住，慢慢散掉
    { at: 8.38, actor: 'smoke', do: 'pop' },
    { at: 8.38, actor: 'smoke', do: 'scaleTo', amount: 1.15, dur: 0.35, ease: 'out' },
    { at: 8.68, actor: 'smoke', do: 'vanish', dur: 0.3 },
    { at: 8.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    // 煙散了：英雄左看右看，頭上的忍者也跟著左看右看
    { at: 8.85, actor: 'hero', do: 'flip' },
    { at: 8.85, actor: 'ninja', do: 'flip' },
    { at: 9.05, actor: 'hero', do: 'flip' },
    { at: 9.05, actor: 'ninja', do: 'flip' },
    // 被發現了，忍者翻下來站左邊，英雄跳到右邊
    { at: 9.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 9.2, actor: 'ninja', do: 'moveTo', to: { x: 24, y: N }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 9.2, actor: 'ninja', do: 'spin', times: -1, dur: 0.35, pivot: 'center' },
    { at: 9.2, actor: 'hero', do: 'moveTo', to: { x: 134, y: H }, arc: 6, dur: 0.35, ease: 'out' },
    { at: 9.55, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 9.55, actor: 'hero', do: 'flip' },
    { at: 9.55, actor: 'ninja', do: 'flip' },
  ],
  builds: [
    // 撞飛的積木落下：橫、撇、豎；再疊成右下的「土」
    { at: 4.35, dur: 0.65, strokes: [0, 1, 2], from: 'blk3', color: '#1C7ED6' },
    { at: 4.8, dur: 0.55, strokes: [3, 4], from: 'blk2', color: '#1971C2' },
    { at: 5.15, dur: 0.5, strokes: [5], from: 'blk1', style: 'drop', color: '#1864AB' },
  ],
  glyph: [
    { at: 5.75, dur: 0.4, do: 'wobble' },
    { at: 6.5, dur: 0.45, do: 'park', to: { x: 80, y: 19 }, amount: 0.5 },
    { at: 9.2, dur: 0.4, do: 'home' },
    { at: 9.6, dur: 0.4, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 1.1 },
    { at: 0.7, kind: 'pop', actor: 'hero', emoji: '3️⃣', dx: -12, dy: -4, dur: 0.35 },
    { at: 1.05, kind: 'pop', actor: 'hero', emoji: '2️⃣', dx: -12, dy: -4, dur: 0.35 },
    { at: 1.4, kind: 'pop', actor: 'hero', emoji: '1️⃣', dx: -12, dy: -4, dur: 0.35 },
    { at: 0.9, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.6 },
    { at: 2.1, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.3 },
    { at: 2.75, kind: 'pop', actor: 'hero', emoji: '❓', dx: -6, dur: 0.3 },
    { at: 3.25, kind: 'sweat', actor: 'hero' },
    { at: 3.3, kind: 'pop', actor: 'hero', emoji: '💡', dur: 0.3 },
    { at: 3.55, kind: 'puff', actor: 'hero', dur: 0.4 },
    { at: 3.95, kind: 'burst', actor: 'hero', dx: 6 },
    { at: 4.05, kind: 'dizzy', actor: 'hero', dur: 1.2 },
    { at: 4.25, kind: 'dizzy', actor: 'ninja', dur: 0.9 },
    { at: 7.05, kind: 'pop', actor: 'hero', emoji: '😮‍💨', dx: -12, dy: 6, dur: 0.5 },
    { at: 7.3, kind: 'pop', actor: 'ninja', emoji: '👋', dx: -10, dy: 10, dur: 0.4 },
    { at: 7.65, kind: 'burst', actor: 'ninja', emoji: '✨', n: 8, dur: 0.6 },
    { at: 7.7, kind: 'pop', actor: 'hero', emoji: '😱', dx: -14, dy: 8, dur: 0.6 },
    { at: 8.35, kind: 'puff', actor: 'ninja', n: 12, dur: 0.7 },
    { at: 8.35, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'hero', emoji: '❓', dx: -14, dy: 10, dur: 0.35 },
    { at: 9.1, kind: 'pop', actor: 'hero', emoji: '❓', dx: 14, dy: 10, dur: 0.3 },
    { at: 9.6, kind: 'pop', actor: 'ninja', emoji: '😆', dur: 0.4 },
  ],
  camera: [
    { at: 3.95, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 7.65, dur: 0.55, do: 'punch', amount: 0.18, to: { x: 78, y: 50 } },
  ],
  lights: [
    // 積木撞散：白光一閃
    { at: 3.95, dur: 0.04, level: -0.45 },
    { at: 3.99, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.6, sfx: 'tap' },
    { at: 1.75, say: '在' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.45, sfx: 'whoosh' },
    { at: 3.0, sfx: 'whoosh' },
    { at: 3.55, sfx: 'whoosh' },
    { at: 3.95, sfx: 'bonk' },
    { at: 5.75, say: '在' },
    { at: 7.65, say: '在這裡' },
    { at: 8.35, sfx: 'poof' },
    { at: 9.2, sfx: 'boing' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
