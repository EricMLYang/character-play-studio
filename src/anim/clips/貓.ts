import type { Clip } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 貓（v2 樣板）：大貓在正中間睡覺，豬探長很有自信要查出「這是什麼動物」——猜狗、猜老虎、猜豬，三次湊過去都被貓整回來
// （尾巴一甩、哈欠把他吹得滾回去、拉尾巴被一腳踢上天），每一次掉出一塊部件填進上方的字框：豸、艹、田。回馬槍：大貓一屁股坐扁豬探長。
// 最後畫面暗下來只剩「貓」，豬探長走到前面、轉向觀眾問「這是什麼字？」，側耳等他回答，再跳起來指著它說「貓！」，然後退場只留字。
// 貓、貓、貓咪、這是什麼字？、貓
const P = 66.9 // 豬探長（size 24）站在地上的 y
const C = 62.7 // 大貓（size 34）
const S = 71.5 // 小苗（size 13）

const clip: Clip = {
  format: 2,
  char: '貓',
  meta: { theme: '豬探長查大貓', cast: '豬探長＋大貓＋小苗', gags: ['豬探長三次猜錯湊過去，被貓一次比一次整得更慘', '大貓一屁股坐扁豬探長'] },
  duration: 14.8,
  bg: { top: '#FFE3C2', bottom: '#FFF7EC', floor: '#B5D88A', scenery: 'hills' },
  actors: [
    { id: 'sprout', emoji: '🌱', x: 20, y: S, size: 13 },
    { id: 'cat', emoji: '🐈', x: 88, y: C, size: 34 },
    { id: 'pig', emoji: 'hero:pig/idle', x: 40, y: P, size: 24, hidden: true },
  ],
  moves: [
    // 豬探長登場，抬頭看上面的字框
    { at: 0, actor: 'pig', do: 'enter', from: { x: -20, y: P }, dur: 0.6, ease: 'out' },
    { at: 0.75, actor: 'pig', do: 'tilt', amount: -12, dur: 0.5 },
    // 第一次：「是狗！」湊過去拿放大鏡看——尾巴一甩
    { at: 1.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 1.75, actor: 'pig', do: 'moveTo', to: { x: 58, y: P }, dur: 0.4 },
    { at: 2.15, actor: 'pig', do: 'tilt', amount: 12, dur: 0.25 },
    { at: 2.4, actor: 'cat', do: 'tilt', amount: -16, dur: 0.22 },
    { at: 2.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 2.4, actor: 'pig', do: 'moveTo', to: { x: 40, y: P }, arc: 5, dur: 0.35, ease: 'out' },
    // 第二次：「是老虎！」大步湊更近——貓張大嘴打一個超大的哈欠，把他吹得往後滾，撞進小苗裡
    { at: 3.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    { at: 3.15, actor: 'pig', do: 'moveTo', to: { x: 60, y: P }, dur: 0.35, ease: 'in' },
    { at: 3.55, actor: 'cat', do: 'squash', amount: -0.25, dur: 0.35 },
    { at: 3.85, actor: 'cat', do: 'squash', amount: 0.15, dur: 0.5 },
    { at: 3.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 3.9, actor: 'pig', do: 'moveTo', to: { x: 30, y: P }, dur: 0.5, ease: 'out' },
    { at: 3.9, actor: 'pig', do: 'spin', times: -1, dur: 0.5, pivot: 'center' },
    { at: 4.4, actor: 'sprout', do: 'shake', amount: 1.4, dur: 0.4 },
    { at: 4.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    // 第三次：「是豬！跟我一樣！」繞到後面拉尾巴——貓一跳，後腳把他踢上天，整個栽進小苗的田裡
    { at: 4.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 5.55, actor: 'pig', do: 'moveTo', to: { x: 118, y: P }, dur: 0.55 },
    { at: 6.1, actor: 'pig', do: 'tilt', amount: -14, dur: 0.2 },
    { at: 6.25, actor: 'cat', do: 'moveTo', to: { x: 136, y: C }, arc: 16, dur: 0.5, ease: 'out' },
    { at: 6.3, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 6.3, actor: 'pig', do: 'moveTo', to: { x: 28, y: P }, arc: 12, dur: 0.55, ease: 'linear' },
    { at: 6.3, actor: 'pig', do: 'spin', times: 2, dur: 0.55, pivot: 'center' },
    { at: 6.85, actor: 'pig', do: 'squash', amount: 0.5, dur: 0.35 },
    { at: 6.85, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 6.85, actor: 'sprout', do: 'squash', amount: 0.4, dur: 0.3 },
    // 字框填滿（國字 home 到正中央）；語詞那一刻：國字讓回上方，大貓回到正中間、變好大
    { at: 7.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 8.45, actor: 'cat', do: 'moveTo', to: { x: 86, y: C }, arc: 10, dur: 0.35, ease: 'out' },
    { at: 8.8, actor: 'cat', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    // 回馬槍：豬探長得意地走過去想摸——大貓一屁股坐下來，把他坐扁
    { at: 9.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 9.0, actor: 'pig', do: 'moveTo', to: { x: 54, y: P }, dur: 0.3 },
    { at: 9.3, actor: 'cat', do: 'moveTo', to: { x: 58, y: C }, arc: 12, dur: 0.35, ease: 'in' },
    { at: 9.65, actor: 'pig', do: 'squash', amount: 0.65, dur: 0.5 },
    { at: 9.65, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    // 問他：大貓趁暗走掉；豬探長鑽出來、走到左前方變大，轉向觀眾
    { at: 10.0, actor: 'cat', do: 'flip' },
    { at: 10.0, actor: 'cat', do: 'moveTo', to: { x: 200, y: C }, dur: 0.9, ease: 'in' },
    { at: 10.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    { at: 10.05, actor: 'pig', do: 'moveTo', to: { x: 34, y: P + 4 }, arc: 6, dur: 0.4, ease: 'out' },
    { at: 10.05, actor: 'pig', do: 'scaleTo', amount: 1.55, dur: 0.4, ease: 'back' },
    // 安靜等他回答：身體往字那邊傾、側耳聽，點兩下頭
    { at: 11.15, actor: 'pig', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 11.65, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.15, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 12.6, actor: 'pig', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 12.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 12.6, actor: 'pig', do: 'flip' },
    { at: 12.6, actor: 'pig', do: 'hop', amount: 8, dur: 0.35 },
    // 退場：豬探長抱起小苗跑出去，畫面只留下字
    { at: 13.2, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.25, actor: 'pig', do: 'moveTo', to: { x: -40, y: P + 4 }, dur: 0.5, ease: 'in' },
    { at: 13.3, actor: 'sprout', do: 'moveTo', to: { x: -40, y: S }, dur: 0.45, ease: 'in' },
  ],
  builds: [
    // 尾巴一甩：豸從貓身上跳出來
    { at: 2.45, dur: 0.7, strokes: [0, 1, 2, 3, 4, 5, 6], from: 'cat', color: partColor('豸') },
    // 被吹進小苗裡：小草（艹）飛起來
    { at: 4.4, dur: 0.5, strokes: [7, 8, 9, 10], from: 'sprout', color: partColor('艹') },
    // 栽進田裡：田（土塊）翻起來
    { at: 6.85, dur: 0.55, strokes: [11, 12, 13, 14, 15], from: 'sprout', color: partColor('田') },
  ],
  glyph: [
    { at: 7.45, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.25, dur: 0.45, do: 'park' },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 9.95, dur: 3.0, do: 'ask', keep: ['pig'], to: { x: 96, y: 43 }, amount: 0.82 },
    { at: 10.0, dur: 0.4, do: 'home' },
    { at: 12.6, dur: 0.35, do: 'pulse' },
    { at: 13.9, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.05, kind: 'zzz', actor: 'cat', dx: 10, dy: 8, dur: 1.9 },
    { at: 0.8, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5, scale: 1.3 },
    // 三次猜錯：想法泡泡放大，一眼看得出畫的是什麼動物
    { at: 1.25, kind: 'bubble', actor: 'pig', emoji: '🐶', dx: -12, dur: 0.5, scale: 1.8 },
    { at: 2.4, kind: 'burst', actor: 'pig', n: 1, dur: 0.3 },
    { at: 2.75, kind: 'sweat', actor: 'pig' },
    { at: 2.95, kind: 'bubble', actor: 'pig', emoji: '🐯', dx: -12, dur: 0.5, scale: 1.8 },
    { at: 3.55, kind: 'pop', actor: 'cat', emoji: '🥱', dx: -22, dy: 10, dur: 0.6, scale: 1.3 },
    { at: 3.75, kind: 'blow', actor: 'cat', target: 'pig', dx: -16, dy: 12, n: 6, dur: 0.6, scale: 1.7 },
    { at: 4.45, kind: 'dizzy', actor: 'pig', dur: 0.6 },
    { at: 4.95, kind: 'bubble', actor: 'pig', emoji: '🐷', dx: -8, dur: 0.55, scale: 1.8 },
    { at: 6.25, kind: 'pop', actor: 'cat', emoji: '💢', dx: 8, dur: 0.4 },
    { at: 6.85, kind: 'burst', actor: 'sprout', n: 1, dur: 0.3 },
    { at: 8.8, kind: 'burst', actor: 'cat', emoji: '💕', n: 5, dur: 0.6 },
    { at: 9.65, kind: 'burst', actor: 'cat', n: 1, dx: -4, dy: 22, dur: 0.3 },
    { at: 11.2, kind: 'pop', actor: 'pig', emoji: '👂', dx: 6, dy: 6, dur: 1.3, scale: 1.3 },
    { at: 12.6, kind: 'burst', x: 96, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    { at: 3.9, dur: 0.3, do: 'shake', amount: 1 },
    { at: 6.85, dur: 0.4, do: 'shake', amount: 1.8 },
    { at: 9.65, dur: 0.3, do: 'shake', amount: 1.4 },
  ],
  lights: [
    { at: 7.45, dur: 0.05, level: -0.35 },
    { at: 7.5, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 1.0, say: '貓' },
    { at: 2.4, sfx: 'boing' },
    { at: 3.85, sfx: 'whoosh' },
    { at: 4.4, sfx: 'poof' },
    { at: 6.25, sfx: 'boing' },
    { at: 6.85, sfx: 'bonk' },
    { at: 7.55, say: '貓' },
    { at: 8.8, say: '貓咪' },
    { at: 9.65, sfx: 'plop' },
    { at: 10.1, say: FIXED_LINES.clipAsk },
    { at: 12.6, say: '貓' },
    { at: 12.65, sfx: 'cheer' },
  ],
}

export default clip
