import type { Clip } from '../clip'

// 龜（重做）：海盜在沙灘上撿到一顆綠綠圓圓的「大寶石」，抱不起來；退後助跑一腳踢下去——寶石滾出去像保齡球撞飛積木小隊，積木變成「龜」，他自己抱著腳跳。
// 國字讓到上方，他甩繩子把寶石拉回中間要撬開——裡面探出一隻生氣的大烏龜（烏龜）。回馬槍：烏龜原地轉成陀螺、縮回殼裡，一滾把他撞上天，倒栽蔥四腳朝天像翻不過來的烏龜。龜、龜、烏龜
const P = 67.8 // 海盜（size 22）站在地上的 y
const S = 70.3 // 龜殼（size 16）
const SHELL = 'hue-rotate(50deg) saturate(1.8) brightness(0.95)' // 把哈密瓜染成綠寶石；烏龜探出頭時拿掉
const K = 71.5 // 積木（size 13）

const clip: Clip = {
  char: '龜',
  meta: { theme: '沙灘撿到綠寶石', cast: '玩具海盜（肩上鸚鵡）＋積木小隊＋烏龜', gags: ['寶石重到抱不起來', '一腳踢成保齡球撞飛積木自己腳痛', '寶石裡探出生氣的烏龜', '烏龜轉成陀螺撞飛他四腳朝天'] },
  duration: 10,
  bg: { top: '#CFEFFF', bottom: '#EFF9FF', floor: '#EBDDB0', scenery: 'sea' },
  actors: [
    { id: 'b1', emoji: 'hero:brick/idle', x: 104, y: K, size: 13 },
    { id: 'b2', emoji: 'hero:brick/idle', x: 116, y: K, size: 13 },
    { id: 'b3', emoji: 'hero:brick/idle', x: 128, y: K, size: 13 },
    { id: 'shell', emoji: '🍈', x: 64, y: S, size: 16, pivot: 'center', tint: SHELL },
    { id: 'pirate', emoji: 'hero:pirate/telescope', x: 28, y: P, size: 22, hidden: true, flip: true },
  ],
  moves: [
    // 海盜拿著望遠鏡走進來，頭上停著鸚鵡
    { at: 0, actor: 'pirate', do: 'enter', from: { x: -20, y: P }, dur: 0.55, ease: 'out' },
    // 看到綠寶石！
    { at: 0.7, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 0.7, actor: 'pirate', do: 'hop', amount: 4, dur: 0.3 },
    { at: 1.05, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 1.45, actor: 'pirate', do: 'moveTo', to: { x: 45, y: P }, dur: 0.35, ease: 'out' },
    // 第一次：抱起來——重到抬不動
    { at: 1.85, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 1.85, actor: 'pirate', do: 'squash', amount: -0.3, dur: 0.7 },
    { at: 1.95, actor: 'pirate', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 1.95, actor: 'shell', do: 'shake', amount: 0.5, dur: 0.6 },
    { at: 2.05, actor: 'shell', do: 'hop', amount: 3, dur: 0.45 },
    { at: 1.95, actor: 'pirate', do: 'tilt', amount: 8, dur: 0.6 },
    { at: 2.55, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 2.55, actor: 'pirate', do: 'squash', amount: 0.35, dur: 0.35 },
    // 第二次：退後、蓄力、一腳踢下去
    { at: 2.95, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    { at: 3.0, actor: 'pirate', do: 'moveTo', to: { x: 24, y: P }, dur: 0.35 },
    { at: 3.4, actor: 'pirate', do: 'squash', amount: -0.35, dur: 0.3 },
    { at: 3.72, actor: 'pirate', do: 'moveTo', to: { x: 46, y: P }, dur: 0.18, anticipate: 4, ease: 'in' },
    { at: 3.9, actor: 'pirate', do: 'tilt', amount: -22, dur: 0.35 },
    // 寶石滾出去，像保齡球撞飛積木小隊
    { at: 3.9, actor: 'shell', do: 'moveTo', to: { x: 118, y: S }, dur: 0.36, ease: 'linear' },
    { at: 3.9, actor: 'shell', do: 'rotateTo', amount: 1000, dur: 0.36, ease: 'linear' },
    { at: 4.26, actor: 'shell', do: 'moveTo', to: { x: 134, y: S }, dur: 0.45, ease: 'out' },
    { at: 4.26, actor: 'shell', do: 'rotateTo', amount: 280, dur: 0.45, ease: 'out' },
    { at: 4.05, actor: 'b1', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.05, actor: 'b1', do: 'moveTo', to: { x: 78, y: 16 }, arc: 8, dur: 0.5, ease: 'out' },
    { at: 4.05, actor: 'b1', do: 'spin', times: 2, dur: 0.5 },
    { at: 4.12, actor: 'b2', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.12, actor: 'b2', do: 'moveTo', to: { x: 52, y: 32 }, arc: 8, dur: 0.55, ease: 'out' },
    { at: 4.12, actor: 'b2', do: 'spin', times: -2, dur: 0.55 },
    { at: 4.2, actor: 'b3', do: 'swap', emoji: 'hero:brick/surprised' },
    { at: 4.2, actor: 'b3', do: 'moveTo', to: { x: 106, y: 26 }, arc: 8, dur: 0.55, ease: 'out' },
    { at: 4.2, actor: 'b3', do: 'spin', times: 2, dur: 0.55 },
    { at: 4.55, actor: 'b1', do: 'vanish', dur: 0.15 },
    { at: 4.9, actor: 'b2', do: 'vanish', dur: 0.15 },
    { at: 5.25, actor: 'b3', do: 'vanish', dur: 0.15 },
    // 踢到石頭一樣硬：抱著腳單腳跳
    { at: 4.2, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 4.25, actor: 'pirate', do: 'moveTo', to: { x: 26, y: P }, dur: 0.9, ease: 'linear' },
    { at: 4.25, actor: 'pirate', do: 'bounce', amount: 4, times: 3, dur: 0.9 },
    { at: 4.25, actor: 'pirate', do: 'tilt', amount: 10, dur: 0.9 },
    { at: 5.3, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/idle' },
    // 國字拼好：哇！
    { at: 5.9, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 5.9, actor: 'pirate', do: 'hop', amount: 3, dur: 0.3 },
    // 寶石裡面好像有東西在動
    { at: 6.35, actor: 'shell', do: 'tilt', amount: 12, dur: 0.35 },
    // 國字讓位：甩繩子把寶石拉回中間
    { at: 6.7, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/happy' },
    { at: 7.0, actor: 'pirate', do: 'moveTo', to: { x: 22, y: P }, dur: 0.5, ease: 'out' },
    { at: 7.0, actor: 'pirate', do: 'tilt', amount: -14, dur: 0.5 },
    { at: 7.0, actor: 'shell', do: 'moveTo', to: { x: 88, y: S }, dur: 0.5, ease: 'out' },
    { at: 7.0, actor: 'shell', do: 'rotateTo', amount: -560, dur: 0.5, ease: 'out' },
    // 走過去要撬開——裡面探出一隻生氣的大烏龜
    { at: 7.5, actor: 'pirate', do: 'moveTo', to: { x: 64, y: P }, dur: 0.3, ease: 'out' },
    { at: 7.8, actor: 'pirate', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: 7.8, actor: 'shell', do: 'shake', amount: 1, dur: 0.15 },
    { at: 7.95, actor: 'shell', do: 'swap', emoji: '🐢' },
    { at: 7.95, actor: 'shell', do: 'tint', filter: '' },
    { at: 7.95, actor: 'shell', do: 'scaleTo', amount: 1.6, dur: 0.25, ease: 'back' },
    { at: 7.95, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 7.95, actor: 'pirate', do: 'moveTo', to: { x: 52, y: P }, dur: 0.25, ease: 'out' },
    { at: 7.95, actor: 'pirate', do: 'hop', amount: 6, dur: 0.3 },
    { at: 8.3, actor: 'shell', do: 'hop', amount: 3, dur: 0.25 },
    // 回馬槍：烏龜原地轉成陀螺、縮回殼裡——一滾把他撞上天
    { at: 8.5, actor: 'shell', do: 'spin', times: 3, dur: 0.4 },
    { at: 8.85, actor: 'shell', do: 'swap', emoji: '🍈' },
    { at: 8.85, actor: 'shell', do: 'tint', filter: SHELL },
    { at: 8.85, actor: 'shell', do: 'scaleTo', amount: 1 / 1.6, dur: 0.1 },
    { at: 8.95, actor: 'shell', do: 'moveTo', to: { x: 70, y: S }, dur: 0.12, ease: 'in' },
    { at: 8.95, actor: 'shell', do: 'rotateTo', amount: -300, dur: 0.12, ease: 'in' },
    { at: 9.07, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/dizzy' },
    { at: 9.07, actor: 'pirate', do: 'moveTo', to: { x: 24, y: 64 }, arc: 30, dur: 0.45, ease: 'linear' },
    { at: 9.07, actor: 'pirate', do: 'rotateTo', amount: -540, dur: 0.45, pivot: 'center', ease: 'linear' },
    { at: 9.07, actor: 'shell', do: 'moveTo', to: { x: 130, y: S }, dur: 0.5, ease: 'out' },
    { at: 9.07, actor: 'shell', do: 'rotateTo', amount: 1020, dur: 0.5, ease: 'out' },
    // 四腳朝天，像翻不過來的烏龜一樣亂踢
    { at: 9.55, actor: 'pirate', do: 'shake', amount: 1.2, dur: 0.45 },
    { at: 9.6, actor: 'shell', do: 'swap', emoji: '🐢' },
    { at: 9.6, actor: 'shell', do: 'tint', filter: '' },
    { at: 9.6, actor: 'shell', do: 'scaleTo', amount: 1.6, dur: 0.25, ease: 'back' },
  ],
  builds: [
    // 撞飛的積木落下來：上面 → 龜頭；左邊 → 左邊一排；右邊 → 龜殼
    { at: 4.55, dur: 0.55, strokes: [0, 1, 2, 3, 4, 5], from: 'b1', color: '#2B8A3E' },
    { at: 4.9, dur: 0.55, strokes: [8, 9, 10, 11, 12, 13], from: 'b2', color: '#37B24D' },
    { at: 5.25, dur: 0.6, strokes: [6, 7, 14, 15, 16, 17], from: 'b3', color: '#2B8A3E' },
  ],
  glyph: [
    { at: 5.9, dur: 0.4, do: 'wobble' },
    { at: 6.7, dur: 0.45, do: 'park' },
    { at: 9.05, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.7, kind: 'pop', actor: 'pirate', emoji: '❗', dur: 0.4 },
    { at: 1.05, kind: 'bubble', actor: 'pirate', emoji: '💎', dur: 0.7 },
    { at: 2.0, kind: 'sweat', actor: 'pirate' },
    { at: 2.6, kind: 'pop', actor: 'pirate', emoji: '😩', dur: 0.4 },
    { at: 3.72, kind: 'puff', actor: 'pirate', dur: 0.3 },
    { at: 3.9, kind: 'burst', x: 56, y: 66, n: 1, dur: 0.3 },
    { at: 4.05, kind: 'burst', x: 96, y: 64, n: 1, dur: 0.35 },
    { at: 4.3, kind: 'pop', actor: 'pirate', emoji: '😣', dur: 0.6 },
    { at: 5.3, kind: 'sweat', actor: 'pirate' },
    { at: 6.35, kind: 'pop', actor: 'shell', emoji: '❓', dur: 0.4 },
    // 繩子：海盜把寶石拉回來
    { at: 6.85, dur: 0.65, kind: 'line', actor: 'pirate', target: 'shell', color: '#8B5A2B', width: 1.2 },
    { at: 7.95, kind: 'burst', actor: 'shell', emoji: '✨', n: 6, dur: 0.5 },
    { at: 7.95, kind: 'pop', actor: 'pirate', emoji: '😱', dx: -6, dur: 0.45 },
    { at: 8.3, kind: 'pop', actor: 'shell', emoji: '😠', dx: 14, dy: 2, dur: 0.4 },
    { at: 8.5, kind: 'puff', actor: 'shell', dur: 0.45 },
    { at: 9.07, kind: 'burst', x: 60, y: 62, n: 1, dur: 0.3 },
    { at: 9.55, kind: 'dizzy', actor: 'pirate', dur: 0.45 },
    { at: 9.7, kind: 'pop', actor: 'shell', emoji: '😆', dur: 0.3 },
  ],
  camera: [
    { at: 4.05, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 7.95, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 86, y: 60 } },
    { at: 9.07, dur: 0.3, do: 'shake', amount: 1.3 },
  ],
  lights: [
    // 積木撞飛：白光一閃
    { at: 4.05, dur: 0.04, level: -0.45 },
    { at: 4.09, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0.7, sfx: 'blip' },
    { at: 1.95, say: '龜' },
    { at: 2.55, sfx: 'plop' },
    { at: 3.72, sfx: 'whoosh' },
    { at: 3.9, sfx: 'bonk' },
    { at: 4.05, sfx: 'crack' },
    { at: 4.3, sfx: 'boing' },
    { at: 5.9, say: '龜' },
    { at: 7.0, sfx: 'slide' },
    { at: 7.95, say: '烏龜' },
    { at: 8.5, sfx: 'whoosh' },
    { at: 9.07, sfx: 'bonk' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip

