import type { Clip } from '../clip'
import { ride } from '../helpers'

// 獅：布忍者躲在一片小葉子後面，整個人都露在外面還很得意。大消防車耍威風衝過來，忍者丟煙霧彈——滾一滾、沒反應。
// 車子壓到眼前，忍者往旁邊一跳、小指頭一戳，消防車像大樹一樣倒下翻肚，車頂的梯子被震下來排成「獅」。遲到的煙霧彈這時才「噗」地炸開，圍在忍者頭上像一圈鬃毛，變成小獅子大吼一聲；最後葉子飄下來，他又躲回葉子後面。獅、獅、獅子
const clip: Clip = {
  char: '獅',
  meta: { theme: '忍者對消防車', cast: '布忍者＋大消防車＋煙霧彈＋小葉子', gags: ['躲在葉子後面全露出來', '小指頭一戳大車倒下', '遲到的煙霧變成獅子鬃毛', '又躲回葉子後面'] },
  duration: 10,
  bg: { top: '#CDEFE0', bottom: '#F0FBF5', floor: '#F2E6CC', scenery: 'forest' },
  actors: [
    { id: 'engine', emoji: '🚒', x: 28, y: 68, size: 22, hidden: true, flip: true },
    { id: 'ladder', emoji: '🪜', x: 28, y: 55, size: 9, hidden: true },
    { id: 'ninja', emoji: 'hero:ninja/hide', x: 80, y: 72, size: 12 },
    { id: 'leaf', emoji: '🍃', x: 77, y: 71, size: 7 },
    { id: 'bomb', emoji: '💣', x: 80, y: 66, size: 6, hidden: true },
  ],
  moves: [
    ...ride([
      { at: 0, actor: 'engine', do: 'enter', from: { x: -25, y: 68 }, dur: 0.6, ease: 'out' },
      // 輪胎彈一彈耍威風
      { at: 1.6, actor: 'engine', do: 'squash', amount: -0.3, dur: 0.35 },
      // 衝過去，壓到忍者眼前
      { at: 2.7, actor: 'engine', do: 'moveTo', to: { x: 62, y: 68 }, dur: 0.5, anticipate: 4, ease: 'in' },
    ], 'ladder', -13, 22),
    { at: 0.6, actor: 'engine', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 0.6, actor: 'ladder', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    { at: 1.0, actor: 'ninja', do: 'shake', amount: 0.6, dur: 0.4 },
    // 丟煙霧彈：彈一下、滾一滾、沒反應
    { at: 2.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 2.0, actor: 'bomb', do: 'pop', dur: 0.1 },
    { at: 2.05, actor: 'bomb', do: 'moveTo', to: { x: 118, y: 73 }, dur: 0.6, arc: 8, ease: 'out' },
    { at: 2.65, actor: 'bomb', do: 'bounce', amount: 1, times: 2, dur: 0.4 },
    { at: 2.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    // 車子衝過來，葉子被風吹走；停半拍
    { at: 3.0, actor: 'leaf', do: 'moveTo', to: { x: 170, y: 20 }, dur: 0.6, arc: 10, ease: 'out' },
    { at: 3.0, actor: 'leaf', do: 'spin', times: 2, dur: 0.6 },
    // 往旁邊跳一小步，小指頭一戳
    { at: 3.6, actor: 'ninja', do: 'moveTo', to: { x: 90, y: 72 }, dur: 0.2, arc: 4 },
    { at: 3.85, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/idle' },
    { at: 3.9, actor: 'engine', do: 'shake', amount: 0.6, dur: 0.2 },
    // 像大樹一樣倒下，翻肚躺在右下角
    { at: 4.1, actor: 'engine', do: 'rotateTo', amount: 180, dur: 0.55, ease: 'in' },
    { at: 4.1, actor: 'engine', do: 'moveTo', to: { x: 132, y: 50 }, dur: 0.55, arc: 8, ease: 'in' },
    { at: 4.1, actor: 'ladder', do: 'moveTo', to: { x: 80, y: 30 }, dur: 0.4, arc: 10 },
    { at: 4.1, actor: 'ladder', do: 'spin', times: 1, dur: 0.4 },
    { at: 4.5, actor: 'ladder', do: 'vanish', dur: 0.15 },
    { at: 4.65, actor: 'engine', do: 'shake', amount: 1, dur: 0.6 },
    // 忍者跳到翻倒的車肚子上擺勝利姿勢
    { at: 4.7, actor: 'ninja', do: 'moveTo', to: { x: 132, y: 53 }, dur: 0.45, arc: 14 },
    { at: 5.15, actor: 'ninja', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 5.9, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/happy' },
    // 遲到的煙霧彈終於噗！圍成一圈鬃毛，大吼一聲
    { at: 6.8, actor: 'bomb', do: 'vanish', dur: 0.15 },
    { at: 7.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/surprised' },
    { at: 7.4, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/throw' },
    { at: 7.4, actor: 'ninja', do: 'hop', amount: 4, dur: 0.35 },
    { at: 7.9, actor: 'engine', do: 'shake', amount: 0.8, dur: 0.4 },
    { at: 7.9, actor: 'ninja', do: 'tilt', amount: 10, dur: 0.4 },
    // 回馬槍：葉子飄回來，他又躲到葉子後面（還是全露出來）
    { at: 8.3, actor: 'leaf', do: 'moveTo', to: { x: 128, y: 53 }, dur: 0.7, ease: 'out' },
    { at: 8.3, actor: 'leaf', do: 'tilt', amount: 20, dur: 0.7 },
    { at: 9.0, actor: 'ninja', do: 'swap', emoji: 'hero:ninja/hide' },
    { at: 9.0, actor: 'ninja', do: 'squash', amount: 0.2, dur: 0.2 },
  ],
  builds: [
    // 震下來的梯子：犭在左邊，師在右邊
    { at: 4.55, dur: 0.4, strokes: [0, 1, 2], from: 'ladder', color: '#E8590C' },
    { at: 4.95, dur: 0.5, strokes: [3, 4, 5, 6, 7, 8], from: 'ladder', color: '#D9480F' },
    { at: 5.45, dur: 0.4, strokes: [9, 10, 11, 12], from: 'ladder', color: '#D9480F' },
  ],
  glyph: [{ at: 6.0, dur: 0.4, do: 'wobble' }, { at: 9.3, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'ninja', emoji: '😎', dy: 1, dur: 0.5 },
    { at: 0.9, kind: 'fountain', actor: 'engine', emoji: '💧', dx: 4, dur: 0.5 },
    { at: 1.4, kind: 'pop', actor: 'engine', emoji: '😑', dur: 0.4 },
    { at: 1.0, kind: 'pop', actor: 'ninja', emoji: '👀', dy: 1, dur: 0.4 },
    { at: 1.6, kind: 'puff', actor: 'engine', dur: 0.4 },
    { at: 2.7, kind: 'puff', actor: 'bomb', dur: 0.3 },
    { at: 2.9, kind: 'pop', actor: 'ninja', emoji: '🤷', dur: 0.5 },
    { at: 3.4, kind: 'sweat', actor: 'ninja' },
    { at: 3.85, kind: 'pop', actor: 'ninja', emoji: '☝️', dx: -5, dur: 0.35 },
    { at: 4.65, kind: 'burst', x: 128, y: 70, n: 1, dur: 0.4 },
    { at: 4.65, kind: 'puff', x: 132, y: 72, dur: 0.5 },
    { at: 6.85, kind: 'puff', actor: 'bomb', dur: 0.4 },
    { at: 7.0, kind: 'burst', actor: 'ninja', emoji: '☁️', n: 8, dy: 4, dur: 1.4 },
    { at: 7.45, kind: 'pop', actor: 'ninja', emoji: '🦁', dx: -8, dur: 0.8 },
    { at: 8.4, kind: 'rain', actor: 'engine', emoji: '💧', dur: 0.5 },
  ],
  camera: [
    { at: 3.2, dur: 0.6, do: 'punch', amount: 0.15, to: { x: 76, y: 60 } },
    { at: 4.65, dur: 0.35, do: 'shake', amount: 1 },
  ],
  cues: [
    { at: 0.6, sfx: 'boing' },
    { at: 1.0, say: '獅' },
    { at: 1.6, sfx: 'rumble' },
    { at: 2.05, sfx: 'plop' },
    { at: 2.7, sfx: 'whoosh' },
    { at: 3.85, sfx: 'tap' },
    { at: 4.65, sfx: 'bonk' },
    { at: 4.95, sfx: 'clink' },
    { at: 6.0, say: '獅' },
    { at: 6.85, sfx: 'poof' },
    { at: 7.45, say: '獅子' },
    { at: 9.0, sfx: 'slide' },
    { at: 9.4, sfx: 'cheer' },
  ],
}

export default clip
