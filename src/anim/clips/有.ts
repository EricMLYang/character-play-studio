import type { Clip } from '../clip'

// 有（重做）：發條鯊魚沒電睡著了，大怪獸轉一下鑰匙——只咬一口就垂頭不動；牠用力狂轉，鯊魚原地轉成陀螺、咻地衝出去撞翻一疊紅書，
// 書飛上天落成「有」。國字讓到上方，鯊魚跳到怪獸頭上轉圈圈跳舞，兩個笑成一團（有趣）；回馬槍：鯊魚轉太快，把怪獸也帶成陀螺，兩個各轉飛到一邊。有、有、有趣
const G = 66.9 // 大怪獸（size 24）站在地上的 y
const S = 69.4 // 鯊魚（size 18）站在地上的 y
const HEAD = 55 // 鯊魚站在怪獸頭上的 y

const clip: Clip = {
  char: '有',
  meta: { theme: '轉發條轉過頭', cast: '大怪獸＋發條鯊魚＋一疊紅書', gags: ['轉一下只咬一口就沒電', '狂轉發條變陀螺衝出去撞書', '在怪獸頭上轉圈跳舞', '轉太快把怪獸也轉成陀螺甩飛'] },
  duration: 10,
  bg: { top: '#FFE8CC', bottom: '#FFF8EC', floor: '#D9B98C', scenery: 'room' },
  actors: [
    { id: 'b3', emoji: '📕', x: 22, y: 71, size: 14 },
    { id: 'b2', emoji: '📕', x: 23.5, y: 61, size: 14 },
    { id: 'b1', emoji: '📕', x: 21, y: 51, size: 14 },
    { id: 'shark', emoji: 'hero:shark/idle', x: 70, y: S, size: 18 },
    { id: 'mon', emoji: 'hero:monster/idle', x: 114, y: G, size: 24, hidden: true },
  ],
  moves: [
    // 鯊魚睡著，垂著頭
    { at: 0, actor: 'shark', do: 'rotateTo', amount: -12, dur: 0.01 },
    // 大怪獸從右邊跑進來，看到鯊魚
    { at: 0, actor: 'mon', do: 'enter', from: { x: 180, y: G }, dur: 0.55, ease: 'out' },
    { at: 0.65, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 0.65, actor: 'mon', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.05, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    // 走到鯊魚背後，轉一下鑰匙
    { at: 1.3, actor: 'mon', do: 'moveTo', to: { x: 94, y: G }, dur: 0.4, ease: 'out' },
    { at: 1.75, actor: 'mon', do: 'swap', emoji: 'hero:monster/idle' },
    { at: 1.75, actor: 'mon', do: 'tilt', amount: 12, dur: 0.3 },
    { at: 1.8, actor: 'shark', do: 'shake', amount: 0.6, dur: 0.2 },
    // 只咬一口……又沒電，垂頭不動
    { at: 2.05, actor: 'shark', do: 'rotateTo', amount: 12, dur: 0.12 },
    { at: 2.05, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 2.05, actor: 'shark', do: 'hop', amount: 3, dur: 0.25 },
    { at: 2.35, actor: 'shark', do: 'swap', emoji: 'hero:shark/idle' },
    { at: 2.4, actor: 'shark', do: 'rotateTo', amount: -16, dur: 0.45, ease: 'in' },
    { at: 2.5, actor: 'mon', do: 'swap', emoji: 'hero:monster/oops' },
    // 用力狂轉發條
    { at: 3.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/roar' },
    { at: 3.0, actor: 'mon', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 3.2, actor: 'mon', do: 'shake', amount: 1.6, dur: 0.8 },
    { at: 3.2, actor: 'shark', do: 'shake', amount: 1.2, dur: 0.8 },
    { at: 3.3, actor: 'shark', do: 'rotateTo', amount: 16, dur: 0.2 },
    // 鯊魚原地轉成陀螺
    { at: 4.0, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 4.0, actor: 'shark', do: 'spin', times: 3, dur: 0.4 },
    { at: 4.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 4.05, actor: 'mon', do: 'moveTo', to: { x: 116, y: G }, dur: 0.3, ease: 'out' },
    // 咻！衝出去撞翻那疊書
    { at: 4.4, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 4.4, actor: 'shark', do: 'moveTo', to: { x: 32, y: S }, dur: 0.2, anticipate: 5, ease: 'in' },
    { at: 4.6, actor: 'b1', do: 'vanish', dur: 0.08 },
    { at: 4.6, actor: 'b2', do: 'vanish', dur: 0.08 },
    { at: 4.6, actor: 'b3', do: 'vanish', dur: 0.08 },
    // 自己被彈上天，倒栽蔥摔在書原本的地方
    { at: 4.6, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 4.6, actor: 'shark', do: 'moveTo', to: { x: 18, y: S }, arc: 16, dur: 0.5, ease: 'out' },
    { at: 4.6, actor: 'shark', do: 'spin', times: -1, dur: 0.5 },
    { at: 4.65, actor: 'mon', do: 'hop', amount: 3, dur: 0.25 },
    // 國字拼好：怪獸好開心
    { at: 5.7, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 5.75, actor: 'mon', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.1, actor: 'shark', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: 6.4, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    // 國字讓位：兩個走到中間
    { at: 6.5, actor: 'mon', do: 'moveTo', to: { x: 84, y: G }, dur: 0.55, ease: 'inOut' },
    { at: 6.5, actor: 'shark', do: 'moveTo', to: { x: 58, y: S }, dur: 0.5, ease: 'inOut' },
    // 鯊魚一跳跳上怪獸頭頂
    { at: 7.1, actor: 'shark', do: 'squash', amount: 0.25, dur: 0.15 },
    { at: 7.2, actor: 'shark', do: 'moveTo', to: { x: 84, y: HEAD }, arc: 4, dur: 0.35, ease: 'out' },
    { at: 7.55, actor: 'mon', do: 'squash', amount: 0.15, dur: 0.2 },
    // 有趣！在頭上轉圈圈跳舞，怪獸笑到一直跳
    { at: 7.6, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 7.6, actor: 'shark', do: 'spin', times: 2, dur: 0.8 },
    { at: 7.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 7.6, actor: 'mon', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
    { at: 7.6, actor: 'mon', do: 'shake', amount: 0.8, dur: 0.8 },
    { at: 7.6, actor: 'shark', do: 'bounce', amount: 3, times: 3, dur: 0.8 },
    // 回馬槍：轉太快，把怪獸也帶成陀螺
    { at: 8.4, actor: 'shark', do: 'spin', times: 4, dur: 0.6 },
    { at: 8.45, actor: 'mon', do: 'swap', emoji: 'hero:monster/surprised' },
    { at: 8.5, actor: 'mon', do: 'spin', times: 3, dur: 0.6 },
    { at: 8.5, actor: 'mon', do: 'hop', amount: 9, dur: 0.5 },
    { at: 8.5, actor: 'shark', do: 'hop', amount: 5, dur: 0.5 },
    // 甩飛到兩邊
    { at: 9.0, actor: 'shark', do: 'moveTo', to: { x: 132, y: S }, arc: 14, dur: 0.45, ease: 'out' },
    { at: 9.0, actor: 'shark', do: 'spin', times: 1, dur: 0.45 },
    { at: 9.0, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 9.0, actor: 'mon', do: 'moveTo', to: { x: 28, y: G }, dur: 0.45, ease: 'out' },
    { at: 9.0, actor: 'mon', do: 'swap', emoji: 'hero:monster/dizzy' },
    { at: 9.6, actor: 'mon', do: 'swap', emoji: 'hero:monster/happy' },
    { at: 9.6, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
  ],
  builds: [
    // 撞飛的三本書：最上面那本 → 橫和撇；中間 → 月的外框；最下面 → 裡面兩橫
    { at: 4.6, dur: 0.55, strokes: [0, 1], from: 'b1', color: '#E03131' },
    { at: 4.8, dur: 0.5, strokes: [2, 3], from: 'b2', color: '#C2255C' },
    { at: 5.0, dur: 0.45, strokes: [4, 5], from: 'b3', color: '#E8590C' },
  ],
  glyph: [
    { at: 5.6, dur: 0.4, do: 'wobble' },
    { at: 6.45, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.55, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    { at: 0, kind: 'zzz', actor: 'shark', dur: 1.4 },
    { at: 0.65, kind: 'pop', actor: 'mon', emoji: '❗', dur: 0.45 },
    { at: 1.05, kind: 'bubble', actor: 'mon', emoji: '🔑', dur: 0.6 },
    { at: 2.05, kind: 'pop', actor: 'shark', emoji: '❗', dur: 0.3 },
    { at: 2.55, kind: 'pop', actor: 'mon', emoji: '😑', dur: 0.5 },
    { at: 2.6, kind: 'sweat', actor: 'mon' },
    { at: 3.2, kind: 'zzz', actor: 'shark', emoji: '🔄', dur: 0.9 },
    { at: 3.2, kind: 'puff', actor: 'mon', dur: 0.6 },
    { at: 4.0, kind: 'pop', actor: 'mon', emoji: '😲', dur: 0.4 },
    { at: 4.6, kind: 'burst', x: 26, y: 62, n: 1, dur: 0.45 },
    { at: 4.6, kind: 'burst', x: 24, y: 60, emoji: '📕', n: 5, dur: 0.5 },
    { at: 5.1, kind: 'dizzy', actor: 'shark', dur: 1.2 },
    { at: 5.75, kind: 'burst', actor: 'mon', emoji: '✨', n: 5, dur: 0.5 },
    { at: 7.6, kind: 'burst', actor: 'mon', emoji: '⭐', n: 6, dx: -2, dy: 2, dur: 0.7 },
    { at: 7.7, kind: 'pop', actor: 'mon', emoji: '🤣', dx: -22, dy: 10, dur: 0.6 },
    { at: 7.9, kind: 'zzz', actor: 'shark', emoji: '🎵', dx: 20, dur: 0.9 },
    { at: 8.05, kind: 'pop', actor: 'shark', emoji: '😆', dx: 18, dy: 4, dur: 0.4 },
    { at: 8.5, kind: 'pop', actor: 'mon', emoji: '😵', dx: -22, dy: 10, dur: 0.45 },
    { at: 9.45, kind: 'dizzy', actor: 'mon', dur: 0.6 },
    { at: 9.45, kind: 'dizzy', actor: 'shark', dur: 0.6 },
  ],
  camera: [
    { at: 4.6, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 7.6, dur: 0.7, do: 'punch', amount: 0.12, to: { x: 84, y: 58 } },
  ],
  lights: [
    { at: 4.6, dur: 0.04, level: -0.45 },
    { at: 4.64, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.65, say: '有' },
    { at: 1.75, sfx: 'tap' },
    { at: 2.05, sfx: 'clink' },
    { at: 2.4, sfx: 'deflate' },
    { at: 3.2, sfx: 'rumble' },
    { at: 4.0, sfx: 'whoosh' },
    { at: 4.6, sfx: 'bonk' },
    { at: 5.65, say: '有' },
    { at: 7.2, sfx: 'boing' },
    { at: 7.6, say: '有趣' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 9.0, sfx: 'boing' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
