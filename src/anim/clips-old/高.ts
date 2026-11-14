import type { Clip } from '../clip'
import { pressStack } from '../helpers'

// 高（重做）：矮矮的機器人跟高高的花生比誰高。踮腳拉長——還是矮一截，花生乾脆站上紙箱；機器人開噴射飛到他頭上「我最高」，
// 噴射熄火，整隻掉下來砸在花生和紙箱上，紙箱「碰」地炸成「高」，頭上彈掉的螺絲變成最上面一點。國字讓到上方，機器人氣得用力跺地，
// 地面卻冒出一座高山把花生頂上山頂（高山）；回馬槍：他跳得更高再跺一次，高山把花生彈上天，一屁股坐在他頭上把他壓扁。高、高、高山
const R = 68.6 // 機器人（size 20）站在地上的 y
const C = 67.3 // 花生（size 23）站在地上的 y
const BOX = 52.6 // 花生站在紙箱上
const PEAK = 33 // 花生站在高山頂上
const ON = 50 // 花生坐在機器人頭上

const clip: Clip = {
  char: '高',
  meta: { theme: '比誰高', cast: '機器人＋浣熊花生＋紙箱＋從地上冒出來的高山', gags: ['踮腳拉長還是矮一截', '飛到頭上最高結果熄火掉下來', '跺地冒出高山卻頂高對方', '再跺一次對方被彈上天坐扁自己'] },
  duration: 10,
  bg: { top: '#CFE8FF', bottom: '#F1F8FF', floor: '#F4F7FB', scenery: 'snow' },
  actors: [
    { id: 'mountain', emoji: '🏔️', x: 110, y: 59.4, size: 42, hidden: true },
    { id: 'box', emoji: '📦', x: 112, y: 70.3, size: 16 },
    { id: 'raccoon', emoji: 'hero:raccoon/idle', x: 92, y: C, size: 23, hidden: true },
    { id: 'robot', emoji: 'hero:robot/idle', x: 64, y: R, size: 20, hidden: true, flip: true },
  ],
  moves: [
    // 兩個從兩邊走過來，面對面比高：花生高一個頭
    { at: 0, actor: 'robot', do: 'enter', from: { x: -14, y: R }, dur: 0.55, ease: 'out' },
    { at: 0, actor: 'raccoon', do: 'enter', from: { x: 174, y: C }, dur: 0.55, ease: 'out' },
    { at: 0.65, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 0.7, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 0.7, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.3 },
    // 第一次：機器人踮腳拉長，抖到冒汗——還是矮一截
    { at: 1.25, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 1.35, actor: 'robot', do: 'squash', amount: -0.35, dur: 0.65 },
    { at: 1.35, actor: 'robot', do: 'shake', amount: 0.8, dur: 0.6 },
    { at: 1.9, actor: 'raccoon', do: 'tilt', amount: -10, dur: 0.3 },
    // 花生乾脆跳上紙箱
    { at: 2.15, actor: 'raccoon', do: 'flip' },
    { at: 2.25, actor: 'raccoon', do: 'moveTo', to: { x: 112, y: BOX }, arc: 8, dur: 0.35, ease: 'out' },
    { at: 2.6, actor: 'box', do: 'squash', amount: 0.12, dur: 0.25 },
    { at: 2.65, actor: 'raccoon', do: 'flip' },
    { at: 2.7, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 第二次：機器人蓄力，開噴射飛到花生頭上——我最高！
    { at: 2.85, actor: 'robot', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 3.15, actor: 'robot', do: 'swap', emoji: 'hero:robot/fly' },
    { at: 3.15, actor: 'robot', do: 'moveTo', to: { x: 108, y: 22 }, dur: 0.4, ease: 'out' },
    { at: 3.6, actor: 'robot', do: 'bounce', amount: 1.5, times: 2, dur: 0.4 },
    { at: 3.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    // 噴射熄火，停在半空一拍
    { at: 3.95, actor: 'robot', do: 'swap', emoji: 'hero:robot/broken' },
    { at: 3.95, actor: 'robot', do: 'shake', amount: 1.2, dur: 0.3 },
    // 掉下來砸在花生和紙箱上
    { at: 4.25, actor: 'robot', do: 'moveTo', to: { x: 112, y: 36 }, dur: 0.18, ease: 'in' },
    // 壓扁花生和紙箱，停一下——
    { at: 4.43, actor: 'raccoon', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 4.43, actor: 'box', do: 'squash', amount: 0.25, dur: 0.2 },
    ...pressStack(4.43, 0.2, 0.3, 23, ['robot']),
    { at: 4.6, actor: 'box', do: 'vanish', dur: 0.08 },
    { at: 4.6, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/dizzy' },
    { at: 4.6, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    // 炸開：一個往左飛、一個往右飛
    { at: 4.6, actor: 'robot', do: 'moveTo', to: { x: 30, y: R }, arc: 16, dur: 0.55, ease: 'out' },
    { at: 4.6, actor: 'robot', do: 'spin', times: -1, dur: 0.55 },
    { at: 4.6, actor: 'raccoon', do: 'moveTo', to: { x: 134, y: C }, arc: 10, dur: 0.5, ease: 'out' },
    // 機器人甩甩頭，頭上的螺絲彈掉
    { at: 5.15, actor: 'robot', do: 'shake', amount: 1.4, dur: 0.3 },
    { at: 5.85, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 5.6, actor: 'raccoon', do: 'shake', amount: 1.2, dur: 0.35 },
    { at: 5.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/idle' },
    // 國字讓位：兩個走回中間，花生又在那邊得意
    { at: 6.35, actor: 'robot', do: 'moveTo', to: { x: 60, y: R }, dur: 0.45 },
    { at: 6.35, actor: 'raccoon', do: 'moveTo', to: { x: 110, y: C }, dur: 0.45 },
    { at: 6.85, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
    { at: 6.85, actor: 'raccoon', do: 'hop', amount: 3, dur: 0.25 },
    // 機器人氣得跳起來跺地
    { at: 6.95, actor: 'robot', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 7.15, actor: 'robot', do: 'hop', amount: 9, dur: 0.3 },
    // 咚！地面冒出一座高山，把花生頂上山頂
    { at: 7.45, actor: 'mountain', do: 'pop', dur: 0.4 },
    { at: 7.45, actor: 'raccoon', do: 'moveTo', to: { x: 110, y: PEAK }, dur: 0.4, ease: 'back' },
    { at: 7.5, actor: 'robot', do: 'swap', emoji: 'hero:robot/surprised' },
    { at: 7.9, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/salute' },
    // 回馬槍：退到左邊，跳得更高再跺一次
    { at: 7.95, actor: 'robot', do: 'swap', emoji: 'hero:robot/idle' },
    { at: 7.95, actor: 'robot', do: 'moveTo', to: { x: 36, y: R }, dur: 0.3 },
    { at: 8.25, actor: 'robot', do: 'squash', amount: 0.35, dur: 0.2 },
    { at: 8.4, actor: 'robot', do: 'hop', amount: 16, dur: 0.4 },
    // 高山一彈，把花生彈上天，縮回地底
    { at: 8.8, actor: 'mountain', do: 'squash', amount: -0.25, dur: 0.2 },
    { at: 8.8, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/surprised' },
    { at: 8.8, actor: 'raccoon', do: 'moveTo', to: { x: 36, y: ON }, arc: 6, dur: 0.45, ease: 'linear' },
    { at: 8.8, actor: 'raccoon', do: 'spin', times: 1, dur: 0.45 },
    { at: 8.9, actor: 'mountain', do: 'scaleTo', amount: 0.02, dur: 0.3, ease: 'in' },
    // 一屁股坐在機器人頭上，把他壓扁
    { at: 9.25, actor: 'robot', do: 'swap', emoji: 'hero:robot/dizzy' },
    { at: 9.25, actor: 'robot', do: 'squash', amount: 0.5, dur: 0.55 },
    ...pressStack(9.25, 0.55, 0.5, 20, ['raccoon']),
    { at: 9.35, actor: 'raccoon', do: 'swap', emoji: 'hero:raccoon/happy' },
  ],
  builds: [
    // 紙箱炸開的碎片 → 高的九筆
    { at: 4.6, dur: 0.7, strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9], from: 'box', color: '#C2410C' },
    // 機器人頭上彈掉的螺絲 → 最上面那一點
    { at: 5.2, dur: 0.35, strokes: [0], from: 'robot', color: '#1C7ED6' },
  ],
  glyph: [
    { at: 5.6, dur: 0.4, do: 'wobble' },
    { at: 6.4, dur: 0.45, do: 'park' },
    { at: 9.2, dur: 0.4, do: 'home' },
    { at: 9.6, dur: 0.4, do: 'pulse' },
  ],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'raccoon', emoji: '😏', dur: 0.5 },
    { at: 0.75, kind: 'pop', actor: 'robot', emoji: '❗', dur: 0.45 },
    { at: 1.4, kind: 'sweat', actor: 'robot' },
    { at: 1.9, kind: 'pop', actor: 'raccoon', emoji: '😆', dur: 0.45 },
    { at: 2.6, kind: 'burst', actor: 'raccoon', emoji: '✨', n: 5, dur: 0.4 },
    { at: 2.85, kind: 'pop', actor: 'robot', emoji: '💢', dur: 0.35 },
    { at: 3.15, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 3.6, kind: 'pop', actor: 'robot', emoji: '😎', dx: 10, dur: 0.4 },
    { at: 3.95, kind: 'puff', actor: 'robot', dy: 6, dur: 0.4 },
    { at: 4.0, kind: 'sweat', actor: 'robot' },
    { at: 4.6, kind: 'burst', actor: 'box', n: 1, dur: 0.4 },
    { at: 5.15, kind: 'pop', actor: 'robot', emoji: '🔩', dur: 0.2 },
    { at: 5.15, kind: 'dizzy', actor: 'robot', dur: 0.7 },
    { at: 5.1, kind: 'dizzy', actor: 'raccoon', dur: 0.7 },
    { at: 6.9, kind: 'pop', actor: 'raccoon', emoji: '😏', dx: 8, dur: 0.4 },
    { at: 6.95, kind: 'pop', actor: 'robot', emoji: '😤', dx: -6, dur: 0.35 },
    { at: 7.45, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 7.5, kind: 'pop', actor: 'robot', emoji: '😱', dx: -8, dur: 0.4 },
    { at: 7.9, kind: 'burst', actor: 'raccoon', emoji: '⭐', n: 6, dx: 6, dur: 0.5 },
    { at: 8.2, kind: 'pop', actor: 'robot', emoji: '💢', dur: 0.3 },
    { at: 8.8, kind: 'puff', actor: 'robot', dur: 0.4 },
    { at: 8.95, kind: 'puff', actor: 'mountain', dy: 30, dur: 0.4 },
    { at: 9.25, kind: 'burst', actor: 'robot', n: 1, dx: 8, dur: 0.3 },
    { at: 9.45, kind: 'pop', actor: 'raccoon', emoji: '😆', dx: 6, dur: 0.45 },
  ],
  camera: [
    { at: 4.6, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 4.6, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 110, y: 48 } },
    { at: 7.45, dur: 0.4, do: 'shake', amount: 1.4 },
    { at: 8.8, dur: 0.4, do: 'shake', amount: 2.2 },
  ],
  lights: [
    // 紙箱炸開：白光一閃
    { at: 4.6, dur: 0.04, level: -0.7 },
    { at: 4.64, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.7, sfx: 'boing' },
    { at: 0.8, say: '高' },
    { at: 2.25, sfx: 'boing' },
    { at: 3.15, sfx: 'whoosh' },
    { at: 3.95, sfx: 'deflate' },
    { at: 4.43, sfx: 'bonk' },
    { at: 4.6, sfx: 'poof' },
    { at: 5.15, sfx: 'clink' },
    { at: 5.6, say: '高' },
    { at: 7.45, sfx: 'rumble' },
    { at: 7.5, say: '高山' },
    { at: 8.4, sfx: 'whoosh' },
    { at: 8.8, sfx: 'boing' },
    { at: 9.25, sfx: 'bonk' },
    { at: 9.6, sfx: 'cheer' },
  ],
}

export default clip
