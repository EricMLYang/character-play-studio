import type { Clip } from '../clip'

// 蛙（重做）：玩具戰士飛撲抓青蛙，青蛙跳山羊從他頭上跳過去，他一肚子撲進荷葉；飛碟用光束把青蛙吸起來，青蛙伸長舌頭把飛碟整台拉下來，
// 飛碟像輪子滾過去把戰士撞上天，撞出來的、甩出來的變成「蛙」。青蛙跳到中間鼓起大臉頰呱（青蛙）。回馬槍：飛碟再來，青蛙用舌頭把它甩兩圈，丟過去砸扁戰士。蛙、蛙、青蛙
const G = 68.6 // 戰士（size 20）站在地上的 y
const F = 68.6 // 青蛙（size 20）站在地上的 y

// 回馬槍：舌頭黏住飛碟繞著青蛙甩兩圈（橢圓，中心 80,58），從左邊開始往上繞
const swing = Array.from({ length: 16 }, (_, i) => {
  const ang = Math.PI + ((i + 1) * Math.PI) / 4 // 180° 起，每格 45°
  return { at: 8.05 + i * 0.05, dur: 0.05, actor: 'alien', do: 'moveTo' as const, to: { x: 80 + 32 * Math.cos(ang), y: 58 + 14 * Math.sin(ang) }, ease: 'linear' as const }
})

const clip: Clip = {
  char: '蛙',
  meta: { theme: '青蛙舌頭大反擊', cast: '小外星人（飛碟）＋玩具戰士＋青蛙＋荷葉', gags: ['飛撲被跳山羊撲進荷葉', '舌頭把飛碟拉下來', '飛碟滾成輪子撞飛戰士', '鼓起大臉頰呱', '舌頭甩飛碟兩圈砸扁戰士'] },
  duration: 10,
  bg: { top: '#D3F9D8', bottom: '#F4FCE3', floor: '#B2E0A0', scenery: 'forest' },
  actors: [
    { id: 'pad', emoji: '🪷', x: 40, y: 73, size: 10 },
    { id: 'warrior', emoji: 'hero:warrior/idle', x: 120, y: G, size: 20, hidden: true },
    { id: 'frog', emoji: '🐸', x: 40, y: F - 2, size: 20, pivot: 'center' },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 118, y: 20, size: 18, hidden: true, float: true, pivot: 'center' },
  ],
  moves: [
    // 青蛙在荷葉上，戰士走進來：抓青蛙！
    { at: 0, actor: 'warrior', do: 'enter', from: { x: 178, y: G }, dur: 0.7, ease: 'out' },
    { at: 0.15, actor: 'frog', do: 'bounce', amount: 1.5, times: 2, dur: 0.6 },
    { at: 0.9, actor: 'frog', do: 'hop', amount: 5, dur: 0.35 },
    { at: 1.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/shield' },
    { at: 1.25, actor: 'warrior', do: 'squash', amount: 0.3, dur: 0.35 },
    // 飛撲！青蛙跳山羊從他頭上跳過去，他一肚子撲進荷葉
    
    { at: 1.55, actor: 'frog', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 1.6, actor: 'warrior', do: 'moveTo', to: { x: 42, y: G }, arc: 5, dur: 0.5, anticipate: 4, ease: 'in' },
    { at: 1.75, actor: 'frog', do: 'moveTo', to: { x: 120, y: F }, arc: 28, dur: 0.6, ease: 'inOut' },
    { at: 2.0, actor: 'warrior', do: 'rotateTo', amount: -85, dur: 0.12 },
    { at: 2.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 2.1, actor: 'pad', do: 'squash', amount: 0.5, dur: 0.3 },
    // 爬起來
    { at: 3.2, actor: 'warrior', do: 'rotateTo', amount: 85, dur: 0.25, ease: 'back' },
    { at: 3.45, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/idle' },
    { at: 3.45, actor: 'warrior', do: 'shake', amount: 1, dur: 0.35 },
    // 飛碟飛來，光束把青蛙吸起來
    { at: 2.45, actor: 'alien', do: 'enter', from: { x: 182, y: 6 }, dur: 0.5, ease: 'out' },
    { at: 3.0, actor: 'frog', do: 'moveTo', to: { x: 118, y: 54 }, dur: 0.45, ease: 'out' },
    { at: 3.0, actor: 'frog', do: 'shake', amount: 1, dur: 0.45 },
    // 舌頭一黏，整台拉下來
    { at: 3.6, actor: 'frog', do: 'squash', amount: -0.3, dur: 0.15 },
    { at: 3.72, actor: 'alien', do: 'moveTo', to: { x: 100, y: 70 }, dur: 0.2, ease: 'in' },
    { at: 3.72, actor: 'alien', do: 'rotateTo', amount: -40, dur: 0.2 },
    { at: 3.75, actor: 'frog', do: 'moveTo', to: { x: 124, y: F }, dur: 0.25, ease: 'in' },
    // 飛碟像輪子往左滾，撞上剛爬起來的戰士
    { at: 4.0, actor: 'alien', do: 'moveTo', to: { x: 54, y: 70 }, dur: 0.6, ease: 'in' },
    { at: 4.0, actor: 'alien', do: 'rotateTo', amount: -320, dur: 0.6, ease: 'in' },
    { at: 4.1, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    // 碰！戰士被撞上天轉兩圈
    { at: 4.6, actor: 'warrior', do: 'moveTo', to: { x: 11, y: G }, arc: 34, dur: 0.75, ease: 'linear' },
    { at: 4.6, actor: 'warrior', do: 'spin', times: 2, dur: 0.75, pivot: 'center' },
    { at: 4.6, actor: 'alien', do: 'moveTo', to: { x: 34, y: 70 }, dur: 0.45, ease: 'out' },
    { at: 4.6, actor: 'alien', do: 'rotateTo', amount: -180, dur: 0.45, ease: 'out' },
    { at: 5.35, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 5.6, actor: 'frog', do: 'hop', amount: 5, dur: 0.3 },
    // 語詞：青蛙跳到中間，鼓起大臉頰「呱」
    { at: 6.5, actor: 'frog', do: 'moveTo', to: { x: 80, y: F }, arc: 12, dur: 0.45 },
    { at: 7.0, actor: 'frog', do: 'scaleTo', amount: 1.45, dur: 0.25, ease: 'back' },
    { at: 7.55, actor: 'frog', do: 'scaleTo', amount: 1 / 1.45, dur: 0.3 },
    { at: 6.7, actor: 'alien', do: 'rotateTo', amount: 140, dur: 0.35, ease: 'back' },
    { at: 6.75, actor: 'alien', do: 'hop', amount: 4, dur: 0.35 },
    { at: 6.9, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 6.9, actor: 'warrior', do: 'hop', amount: 3, dur: 0.25 },
    // 回馬槍：飛碟生氣衝過來，青蛙舌頭一黏，把它甩兩圈
    { at: 7.65, actor: 'alien', do: 'moveTo', to: { x: 36, y: 44 }, dur: 0.25, ease: 'out' },
    { at: 7.9, actor: 'alien', do: 'moveTo', to: { x: 48, y: 58 }, dur: 0.15, ease: 'in' },
    ...swing,
    { at: 8.05, actor: 'alien', do: 'spin', times: 3, dur: 0.8 },
    { at: 8.05, actor: 'frog', do: 'spin', times: 2, dur: 0.8 },
    // 放手！砸在戰士頭上
    { at: 8.85, actor: 'alien', do: 'moveTo', to: { x: 16, y: 52 }, dur: 0.15, ease: 'in' },
    { at: 8.85, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/surprised' },
    { at: 9.0, actor: 'warrior', do: 'squash', amount: 0.55, dur: 1.0 },
    { at: 9.0, actor: 'warrior', do: 'swap', emoji: 'hero:warrior/dizzy' },
    { at: 9.0, actor: 'alien', do: 'moveTo', to: { x: 16, y: 56 }, dur: 0.2, ease: 'bounce' },
    // 轉昏的青蛙退到右邊
    { at: 8.88, actor: 'frog', do: 'moveTo', to: { x: 126, y: F }, arc: 12, dur: 0.35 },
  ],
  builds: [
    // 撞出來的火花 → 虫；被甩上天的戰士 → 圭
    { at: 4.6, dur: 0.6, strokes: [0, 1, 2, 3, 4, 5], from: 'alien', color: '#2B8A3E' },
    { at: 4.85, dur: 0.7, strokes: [6, 7, 8, 9, 10, 11], from: 'warrior', color: '#66A80F' },
  ],
  glyph: [
    { at: 5.6, dur: 0.4, do: 'wobble' },
    { at: 6.4, dur: 0.45, do: 'park' },
    { at: 9.1, dur: 0.4, do: 'home' },
    { at: 9.55, dur: 0.45, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'warrior', emoji: '🐸', dur: 0.6 },
    { at: 1.3, kind: 'pop', actor: 'frog', emoji: '❗', dur: 0.35 },
    { at: 2.1, kind: 'burst', actor: 'pad', emoji: '💦', n: 5, dur: 0.45 },
    { at: 2.35, kind: 'pop', actor: 'frog', emoji: '😆', dur: 0.5 },
    { at: 2.3, kind: 'dizzy', actor: 'warrior', dur: 0.9 },
    { at: 2.95, kind: 'beam', actor: 'alien', n: 12, dur: 0.75 },
    { at: 3.05, kind: 'pop', actor: 'frog', emoji: '😠', dur: 0.45 },
    { at: 3.55, kind: 'line', actor: 'frog', target: 'alien', color: '#FF6B9A', width: 2.6, dy: 2, dur: 0.4 },
    { at: 3.92, kind: 'burst', x: 100, y: 64, n: 1, dur: 0.3 },
    { at: 4.1, kind: 'pop', actor: 'warrior', emoji: '😱', dur: 0.45 },
    { at: 4.6, kind: 'burst', x: 46, y: 60, n: 1, dur: 0.4 },
    { at: 4.9, kind: 'dizzy', actor: 'alien', dur: 1.5 },
    { at: 5.35, kind: 'dizzy', actor: 'warrior', dur: 1.3 },
    { at: 5.6, kind: 'pop', actor: 'frog', emoji: '😆', dur: 0.5 },
    { at: 7.1, kind: 'burst', actor: 'frog', emoji: '🎵', n: 6, dy: -4, dur: 0.6 },
    { at: 7.55, kind: 'pop', actor: 'alien', emoji: '😠', dur: 0.4 },
    { at: 7.95, dur: 0.92, kind: 'line', actor: 'frog', target: 'alien', color: '#FF6B9A', width: 2.6, dy: 2 },
    { at: 9.0, kind: 'burst', x: 18, y: 58, n: 1, dur: 0.35 },
    { at: 9.15, kind: 'dizzy', actor: 'warrior', dur: 0.8 },
    { at: 9.3, kind: 'dizzy', actor: 'frog', dur: 0.6 },
  ],
  camera: [
    { at: 3.92, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 4.6, dur: 0.35, do: 'shake', amount: 1.8 },
    { at: 9.0, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    { at: 4.6, dur: 0.04, level: -0.5 },
    { at: 4.64, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 0.9, say: '蛙' },
    { at: 1.6, sfx: 'whoosh' },
    { at: 2.1, sfx: 'splash' },
    { at: 2.95, sfx: 'laser' },
    { at: 3.55, sfx: 'boing' },
    { at: 3.92, sfx: 'bonk' },
    { at: 4.0, sfx: 'slide' },
    { at: 4.6, sfx: 'crack' },
    { at: 5.6, say: '蛙' },
    { at: 7.0, say: '青蛙' },
    { at: 8.05, sfx: 'whoosh' },
    { at: 8.45, sfx: 'whoosh' },
    { at: 9.0, sfx: 'bonk' },
    { at: 9.55, sfx: 'cheer' },
  ],
}

export default clip
