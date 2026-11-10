import type { Clip } from '../clip'

// 在（重做）：披風英雄和布忍者玩捉迷藏，英雄數完三二一到處找，忍者一直黏在他背後跟著轉；英雄衝去找箱子後面，一頭撞散藍色積木，積木落下拼成「在」。
// 國字讓到上方，英雄站在中間嘆氣，忍者拍拍他肩膀——一轉身就是臉對臉「在這裡」！回馬槍：忍者丟煙霧彈想再躲一次，煙散了卻站在英雄頭上。在、在、在這裡
const H = 67.1 // 披風英雄（size 22）站在地上的 y
const N = 67.1 // 布忍者（size 22）站在地上的 y

const clip: Clip = {
  char: '在',
  meta: { theme: '捉迷藏', cast: '披風英雄＋布忍者＋藍色積木', gags: ['忍者黏在背後跟著轉', '衝去找撞散積木', '一轉身臉對臉', '煙霧彈躲到頭上'] },
  duration: 10,
  bg: { top: '#D0EBFF', bottom: '#E7F5FF', floor: '#A5D8FF', scenery: 'hills' },
  actors: [
    { id: 'blk1', emoji: '🟦', x: 146, y: 72, size: 10 },
    { id: 'blk2', emoji: '🟦', x: 146, y: 63.5, size: 10 },
    { id: 'blk3', emoji: '🟦', x: 146, y: 55, size: 10 },
    { id: 'ninja', emoji: 'hero:ninja/idle', x: 78, y: N, size: 22, flip: false },
    { id: 'hero', emoji: 'hero:cape/idle', x: 40, y: H, size: 22, hidden: true },
  ],
  moves: [
    // 英雄跑進來，背對忍者數三二一
    { at: 0, actor: 'hero', do: 'enter', from: { x: -20, y: H }, dur: 0.5, ease: 'out' },
    { at: 0.55, actor: 'hero', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 0.6, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 0.6, actor: 'ninja', do: 'hop', amount: 3, dur: 0.25 },
    // 忍者踮腳溜到英雄背後
    { at: 0.9, actor: 'ninja', do: 'moveTo', to: { x: 54, y: N }, dur: 0.7, ease: 'linear' },
    { at: 0.9, actor: 'ninja', do: 'bounce', amount: 1.2, times: 3, dur: 0.7 },
    // 數完！轉身找人，忍者一溜煙閃到他背後
    { at: 1.75, actor: 'hero', do: 'flip' },
    { at: 1.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
    { at: 1.75, actor: 'hero', do: 'hop', amount: 3, dur: 0.25 },
    { at: 1.75, actor: 'ninja', do: 'moveTo', to: { x: 26, y: N }, arc: 8, dur: 0.25, ease: 'out' },
    { at: 2.2, actor: 'hero', do: 'tilt', amount: 10, dur: 0.3 },
    // 回頭看——忍者又閃到另一邊
    { at: 2.55, actor: 'hero', do: 'flip' },
    { at: 2.55, actor: 'ninja', do: 'moveTo', to: { x: 54, y: N }, arc: 8, dur: 0.25, ease: 'out' },
    { at: 2.95, actor: 'hero', do: 'flip' },
    { at: 2.95, actor: 'ninja', do: 'moveTo', to: { x: 26, y: N }, arc: 8, dur: 0.25, ease: 'out' },
    // 一定在箱子後面！衝！忍者也跟著衝
    { at: 3.35, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 3.35, actor: 'hero', do: 'moveTo', to: { x: 130, y: H }, dur: 0.45, anticipate: 4, ease: 'in' },
    { at: 3.4, actor: 'ninja', do: 'moveTo', to: { x: 116, y: N }, dur: 0.5, ease: 'in' },
    // 咚！撞散積木
    { at: 3.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 3.8, actor: 'hero', do: 'squash', amount: 0.45, dur: 0.35 },
    { at: 3.8, actor: 'blk1', do: 'moveTo', to: { x: 118, y: 26 }, dur: 0.4, ease: 'out' },
    { at: 3.8, actor: 'blk1', do: 'spin', times: 2, dur: 0.6 },
    { at: 3.8, actor: 'blk2', do: 'moveTo', to: { x: 140, y: 16 }, dur: 0.45, ease: 'out' },
    { at: 3.8, actor: 'blk2', do: 'spin', times: -2, dur: 0.6 },
    { at: 3.8, actor: 'blk3', do: 'moveTo', to: { x: 156, y: 30 }, dur: 0.4, ease: 'out' },
    { at: 3.8, actor: 'blk3', do: 'spin', times: 2, dur: 0.6 },
    { at: 4.3, actor: 'blk3', do: 'vanish', dur: 0.25 },
    { at: 4.75, actor: 'blk2', do: 'vanish', dur: 0.25 },
    { at: 5.1, actor: 'blk1', do: 'vanish', dur: 0.25 },
    // 忍者在背後也跟著暈（學他）
    { at: 4.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/dizzy' },
    { at: 4.0, actor: 'ninja', do: 'tilt', amount: -12, dur: 0.4 },
    { at: 4.5, actor: 'ninja', do: 'tilt', amount: 12, dur: 0.4 },
    { at: 5.0, actor: 'hero', do: 'shake', amount: 1, dur: 0.4 },
    { at: 5.2, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 5.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    // 國字讓位：英雄垂頭走到中間，忍者踮腳跟在背後
    { at: 6.5, actor: 'hero', do: 'flip' },
    { at: 6.55, actor: 'hero', do: 'moveTo', to: { x: 74, y: H }, dur: 0.6, ease: 'inOut' },
    // 忍者一跳越過他頭頂，又踮腳黏到他背後
    { at: 6.5, actor: 'ninja', do: 'moveTo', to: { x: 142, y: N }, arc: 16, dur: 0.35, ease: 'out' },
    { at: 6.9, actor: 'ninja', do: 'moveTo', to: { x: 94, y: N }, dur: 0.45, ease: 'linear' },
    { at: 6.9, actor: 'ninja', do: 'bounce', amount: 1.2, times: 3, dur: 0.45 },
    { at: 7.2, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.3 },
    // 拍拍肩膀
    { at: 7.4, actor: 'ninja', do: 'tilt', amount: -14, dur: 0.25 },
    // 一轉身：臉對臉！在這裡！
    { at: 7.6, actor: 'hero', do: 'flip' },
    { at: 7.7, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 7.7, actor: 'ninja', do: 'hop', amount: 4, dur: 0.3 },
    { at: 7.7, actor: 'ninja', do: 'scaleTo', amount: 1.2, dur: 0.25, ease: 'back' },
    { at: 7.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 7.75, actor: 'hero', do: 'hop', amount: 7, dur: 0.4 },
    // 回馬槍：忍者丟煙霧彈想再躲一次……
    { at: 8.3, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 8.4, actor: 'ninja', do: 'scaleTo', amount: 0.84, dur: 0.15 },
    { at: 8.45, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 8.45, actor: 'ninja', do: 'moveTo', to: { x: 75, y: 47 }, arc: 10, dur: 0.3, ease: 'out' },
    { at: 8.75, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 8.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 8.85, actor: 'hero', do: 'flip' },
    { at: 9.05, actor: 'hero', do: 'flip' },
    // 被發現了，跳下來兩邊站好
    { at: 9.15, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    { at: 9.15, actor: 'ninja', do: 'moveTo', to: { x: 124, y: N }, arc: 12, dur: 0.4, ease: 'out' },
    { at: 9.15, actor: 'hero', do: 'moveTo', to: { x: 36, y: H }, dur: 0.4, ease: 'out' },
    { at: 9.5, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
  ],
  builds: [
    // 撞飛的積木落下：橫、撇、豎；再疊成右下的「土」
    { at: 4.3, dur: 0.65, strokes: [0, 1, 2], from: 'blk3', color: '#1C7ED6' },
    { at: 4.75, dur: 0.55, strokes: [3, 4], from: 'blk2', color: '#1971C2' },
    { at: 5.1, dur: 0.5, strokes: [5], from: 'blk1', style: 'drop', color: '#1864AB' },
  ],
  glyph: [
    { at: 5.7, dur: 0.4, do: 'wobble' },
    { at: 6.45, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.55, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'pop', actor: 'hero', emoji: '🙈', dur: 1.1 },
    { at: 0.7, kind: 'pop', actor: 'hero', emoji: '3️⃣', dx: -10, dy: -6, dur: 0.35 },
    { at: 1.05, kind: 'pop', actor: 'hero', emoji: '2️⃣', dx: -10, dy: -6, dur: 0.35 },
    { at: 1.4, kind: 'pop', actor: 'hero', emoji: '1️⃣', dx: -10, dy: -6, dur: 0.35 },
    { at: 0.95, kind: 'pop', actor: 'ninja', emoji: '🤫', dur: 0.6 },
    { at: 1.8, kind: 'pop', actor: 'hero', emoji: '🔍', dx: 8, dur: 0.5 },
    { at: 2.6, kind: 'pop', actor: 'hero', emoji: '❓', dur: 0.35 },
    { at: 3.0, kind: 'pop', actor: 'hero', emoji: '❓', dur: 0.35 },
    { at: 3.35, kind: 'puff', actor: 'hero', dur: 0.4 },
    { at: 3.8, kind: 'burst', actor: 'hero', dx: 6 },
    { at: 3.9, kind: 'dizzy', actor: 'hero', dur: 1.2 },
    { at: 4.1, kind: 'dizzy', actor: 'ninja', dur: 0.9 },
    { at: 7.0, kind: 'pop', actor: 'hero', emoji: '😮‍💨', dx: -6, dur: 0.5 },
    { at: 7.4, kind: 'pop', actor: 'ninja', emoji: '👋', dx: -8, dur: 0.4 },
    { at: 7.7, kind: 'pop', actor: 'ninja', emoji: '📍', dur: 0.8 },
    { at: 7.8, kind: 'pop', actor: 'hero', emoji: '❗', dx: -6, dur: 0.5 },
    { at: 8.35, kind: 'puff', actor: 'ninja', n: 10, dur: 0.7 },
    { at: 8.35, kind: 'burst', actor: 'ninja', emoji: '💨', n: 6, dur: 0.6 },
    { at: 8.9, kind: 'pop', actor: 'hero', emoji: '❓', dx: -8, dur: 0.4 },
    { at: 9.55, kind: 'pop', actor: 'ninja', emoji: '😆', dur: 0.45 },
  ],
  camera: [
    { at: 3.8, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 7.7, dur: 0.5, do: 'punch', amount: 0.12, to: { x: 84, y: 60 } },
  ],
  cues: [
    { at: 0.6, sfx: 'tap' },
    { at: 1.75, say: '在' },
    { at: 1.75, sfx: 'whoosh' },
    { at: 2.55, sfx: 'whoosh' },
    { at: 2.95, sfx: 'whoosh' },
    { at: 3.35, sfx: 'whoosh' },
    { at: 3.8, sfx: 'bonk' },
    { at: 5.7, say: '在' },
    { at: 7.7, say: '在這裡' },
    { at: 8.35, sfx: 'poof' },
    { at: 9.15, sfx: 'boing' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
