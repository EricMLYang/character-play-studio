import type { Clip, Move } from '../clip'
import { ride } from '../helpers'

// 喝（重做）：小外星人坐飛碟來到農場想喝一大杯牛奶，光束一吸——杯子咻地飛上來「咚」砸在飛碟底，牛奶潑他一臉；光束開到最大，吸上來的卻是隔壁的乳牛，牛一頭撞翻飛碟。
// 乳牛從天上砸下來「碰」震出「喝」，牛奶杯剛好飛進他手裡；他在中間咕嚕咕嚕喝牛奶。回馬槍：乳牛跳進飛碟，反過來用光束把他倒吊吸上去。喝、喝、喝牛奶
const G = 68.6 // 外星人、乳牛（size 20）站在地上的 y
const M = 71.5 // 牛奶杯（size 13）放在地上的 y

// 牛奶杯拿在外星人手上：跟著他走
const carry = (moves: Move[]): Move[] => moves.flatMap((m): Move[] => [m, { ...m, actor: 'milk', to: m.to && { x: m.to.x + 9, y: m.to.y - 5 } }])

const clip: Clip = {
  char: '喝',
  meta: { theme: '外星人吸牛奶吸到乳牛', cast: '小外星人＋飛碟＋一大杯牛奶＋乳牛', gags: ['光束吸杯子砸飛碟潑一臉', '光束開最大吸錯成乳牛撞翻飛碟', '乳牛砸下來震出字杯子飛進手裡', '乳牛開飛碟把外星人倒吊吸走'] },
  duration: 10,
  bg: { top: '#CDEBFF', bottom: '#EEF8FF', floor: '#BFE3A0', scenery: 'hills' },
  actors: [
    { id: 'cow', emoji: '🐄', x: 138, y: G, size: 20, pivot: 'center' },
    { id: 'saucer', emoji: '🛸', x: 118, y: 31, size: 16, hidden: true, float: true, pivot: 'center' },
    { id: 'alien', emoji: 'hero:alien/saucer', x: 40, y: 28, size: 20, hidden: true, flip: true, pivot: 'center' },
    { id: 'milk', emoji: '🥛', x: 98, y: M, size: 13, pivot: 'center' },
  ],
  moves: [
    // 坐飛碟飄進來，看到那杯牛奶
    { at: 0, actor: 'alien', do: 'enter', from: { x: 4, y: 20 }, dur: 0.7, ease: 'out' },
    { at: 0.95, actor: 'alien', do: 'moveTo', to: { x: 98, y: 24 }, dur: 0.45, ease: 'inOut' },
    // 光束一吸：杯子慢慢浮起來，然後咻地砸在飛碟底
    { at: 1.55, actor: 'milk', do: 'moveTo', to: { x: 98, y: 56 }, dur: 0.45, ease: 'out' },
    { at: 1.55, actor: 'milk', do: 'shake', amount: 0.8, dur: 0.45 },
    { at: 2.0, actor: 'milk', do: 'moveTo', to: { x: 98, y: 41 }, dur: 0.1, ease: 'in' },
    { at: 2.1, actor: 'alien', do: 'hop', amount: 4, dur: 0.25 },
    { at: 2.1, actor: 'alien', do: 'tilt', amount: 14, dur: 0.35 },
    { at: 2.15, actor: 'milk', do: 'moveTo', to: { x: 98, y: M }, dur: 0.35, ease: 'in' },
    { at: 2.15, actor: 'milk', do: 'spin', times: 1, dur: 0.35 },
    // 不服氣：光束開到最大
    { at: 2.85, actor: 'alien', do: 'moveTo', to: { x: 120, y: 24 }, dur: 0.35 },
    { at: 3.2, actor: 'alien', do: 'squash', amount: -0.25, dur: 0.3 },
    { at: 3.4, actor: 'alien', do: 'shake', amount: 1.4, dur: 0.6 },
    // 吸上來的是乳牛！
    { at: 3.55, actor: 'cow', do: 'moveTo', to: { x: 124, y: 50 }, dur: 0.35, ease: 'out' },
    { at: 3.55, actor: 'cow', do: 'shake', amount: 1.5, dur: 0.35 },
    { at: 3.9, actor: 'cow', do: 'moveTo', to: { x: 121, y: 38 }, dur: 0.12, ease: 'in' },
    // 牛一頭撞翻飛碟：外星人摔出來，飛碟翻過去飛到左上角
    { at: 4.02, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    { at: 4.02, actor: 'alien', do: 'moveTo', to: { x: 24, y: G }, arc: 18, dur: 0.55, ease: 'inOut' },
    { at: 4.02, actor: 'alien', do: 'spin', times: -1, dur: 0.55 },
    { at: 4.02, actor: 'saucer', do: 'pop', dur: 0.08 },
    { at: 4.02, actor: 'saucer', do: 'moveTo', to: { x: 22, y: 12 }, arc: 10, dur: 0.6, ease: 'out' },
    { at: 4.02, actor: 'saucer', do: 'rotateTo', amount: 180, dur: 0.6, ease: 'out' },
    // 牛彈上天，再從正中間砸下來
    { at: 4.04, actor: 'cow', do: 'moveTo', to: { x: 82, y: 16 }, dur: 0.38, ease: 'out' },
    { at: 4.04, actor: 'cow', do: 'rotateTo', amount: 360, dur: 0.6 },
    { at: 4.42, actor: 'cow', do: 'moveTo', to: { x: 82, y: G }, dur: 0.28, ease: 'in' },
    { at: 4.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/dizzy' },
    { at: 4.7, actor: 'cow', do: 'squash', amount: 0.5, dur: 0.35 },
    // 震得牛奶杯彈起來，剛好飛進外星人手裡
    { at: 4.72, actor: 'milk', do: 'moveTo', to: { x: 34, y: 63 }, arc: 24, dur: 0.6, ease: 'inOut' },
    { at: 4.72, actor: 'milk', do: 'spin', times: -2, dur: 0.6 },
    // 牛頭昏眼花滾到右邊
    { at: 5.0, actor: 'cow', do: 'moveTo', to: { x: 140, y: G }, dur: 0.5, ease: 'out' },
    { at: 5.0, actor: 'cow', do: 'rotateTo', amount: -360, dur: 0.5, ease: 'out' },
    { at: 5.32, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 5.32, actor: 'alien', do: 'squash', amount: 0.25, dur: 0.25 },
    { at: 6.0, actor: 'alien', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.0, actor: 'milk', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.3, actor: 'cow', do: 'shake', amount: 1, dur: 0.35 },
    // 國字讓位：走到中間，乳牛也湊過來
    ...carry([{ at: 6.8, actor: 'alien', do: 'moveTo', to: { x: 90, y: G }, dur: 0.45 }]),
    { at: 6.8, actor: 'cow', do: 'moveTo', to: { x: 120, y: G }, dur: 0.5 },
    // 喝牛奶！仰頭咕嚕咕嚕
    { at: 7.25, actor: 'milk', do: 'moveTo', to: { x: 97, y: 62 }, dur: 0.15, ease: 'out' },
    { at: 7.25, actor: 'milk', do: 'rotateTo', amount: -110, dur: 0.15, ease: 'out' },
    { at: 7.25, actor: 'milk', do: 'scaleTo', amount: 1.3, dur: 0.15, ease: 'back' },
    { at: 7.25, actor: 'alien', do: 'rotateTo', amount: -18, dur: 0.15 },
    { at: 7.45, actor: 'alien', do: 'squash', amount: 0.15, dur: 0.2 },
    { at: 7.7, actor: 'alien', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 7.95, actor: 'alien', do: 'squash', amount: 0.25, dur: 0.2 },
    { at: 7.45, actor: 'cow', do: 'bounce', amount: 2, times: 2, dur: 0.5 },
    // 回馬槍：飛碟翻正、降到乳牛旁邊，乳牛一跳坐進去
    { at: 7.55, actor: 'saucer', do: 'rotateTo', amount: -180, dur: 0.3 },
    { at: 7.55, actor: 'saucer', do: 'moveTo', to: { x: 30, y: 46 }, dur: 0.3, ease: 'inOut' },
    { at: 7.85, actor: 'saucer', do: 'moveTo', to: { x: 130, y: 56 }, dur: 0.4, ease: 'inOut' },
    { at: 8.2, actor: 'cow', do: 'moveTo', to: { x: 130, y: 48 }, arc: 8, dur: 0.25 },
    ...ride([
      { at: 8.45, actor: 'saucer', do: 'moveTo', to: { x: 130, y: 40 }, dur: 0.25, ease: 'out' },
    ], 'cow', -8, 16),
    // 光束一開：外星人被吸過去、倒吊上來，還在喝
    { at: 8.72, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
    ...carry([{ at: 8.75, actor: 'alien', do: 'moveTo', to: { x: 130, y: 60 }, dur: 0.3, ease: 'in' }]),
    { at: 8.75, actor: 'alien', do: 'rotateTo', amount: 198, dur: 0.4 },
    { at: 9.3, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
    { at: 9.2, actor: 'milk', do: 'moveTo', to: { x: 131, y: M }, dur: 0.2, ease: 'in' },
    { at: 9.2, actor: 'milk', do: 'rotateTo', amount: 110, dur: 0.2 },
    { at: 9.3, actor: 'alien', do: 'moveTo', to: { x: 130, y: 56 }, dur: 0.6, ease: 'out' },
    { at: 9.5, actor: 'alien', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 9.5, actor: 'saucer', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
    { at: 9.5, actor: 'cow', do: 'bounce', amount: 1.5, times: 2, dur: 0.5 },
  ],
  builds: [
    // 牛奶杯飛起來甩出口；乳牛砸地震出右邊
    { at: 4.75, dur: 0.4, strokes: [0, 1, 2], from: 'milk', color: '#2F6FDE' },
    { at: 4.95, dur: 0.45, strokes: [3, 4, 5, 6], from: { x: 82, y: 62 }, color: '#7A4A21' },
    { at: 5.3, dur: 0.55, strokes: [7, 8, 9, 10, 11], from: { x: 82, y: 66 }, color: '#7A4A21' },
  ],
  glyph: [
    { at: 5.9, dur: 0.4, do: 'wobble' },
    { at: 6.7, dur: 0.45, do: 'park' },
    { at: 9.0, dur: 0.4, do: 'home' },
    { at: 9.5, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.6, kind: 'bubble', actor: 'alien', emoji: '🥛', dur: 0.8, dx: 8 },
    { at: 1.45, kind: 'beam', actor: 'alien', n: 14, dur: 0.6 },
    { at: 2.1, kind: 'burst', x: 98, y: 40, n: 1, dur: 0.3 },
    { at: 2.12, kind: 'rain', actor: 'alien', dy: -4, n: 7, dur: 0.6 },
    { at: 2.45, kind: 'pop', actor: 'alien', emoji: '😑', dx: 8, dur: 0.5 },
    { at: 2.5, kind: 'sweat', actor: 'alien' },
    { at: 3.05, kind: 'pop', actor: 'alien', emoji: '😤', dx: -8, dur: 0.4 },
    { at: 3.45, kind: 'beam', actor: 'alien', n: 34, dur: 0.55 },
    { at: 3.6, kind: 'pop', actor: 'cow', emoji: '❗', dx: -8, dur: 0.4 },
    { at: 4.02, kind: 'burst', x: 121, y: 32, n: 1, dur: 0.35 },
    { at: 4.7, kind: 'burst', x: 82, y: 64, emoji: '💥', n: 6, dur: 0.5 },
    { at: 4.7, kind: 'puff', actor: 'cow', dur: 0.45 },
    { at: 4.65, kind: 'dizzy', actor: 'alien', dur: 0.7 },
    { at: 5.5, kind: 'dizzy', actor: 'cow', dur: 0.9 },
    { at: 5.35, kind: 'pop', actor: 'alien', emoji: '😋', dx: -6, dur: 0.6 },
    { at: 7.3, kind: 'zzz', actor: 'alien', emoji: '🫧', dx: -8, dy: 4, dur: 0.8 },
    { at: 7.5, kind: 'pop', actor: 'cow', emoji: '💕', dx: 8, dy: 4, dur: 0.6 },
    { at: 8.2, kind: 'pop', actor: 'cow', emoji: '😏', dx: 10, dy: 4, dur: 0.4 },
    { at: 8.68, kind: 'beam', actor: 'saucer', n: 26, dur: 1.32 },
    { at: 8.75, kind: 'pop', actor: 'alien', emoji: '😲', dx: -14, dy: 10, dur: 0.45 },
    { at: 9.55, kind: 'pop', actor: 'cow', emoji: '😆', dx: -12, dy: 2, dur: 0.45 },
  ],
  camera: [
    { at: 4.02, dur: 0.3, do: 'shake', amount: 1.2 },
    { at: 4.7, dur: 0.4, do: 'shake', amount: 2 },
    { at: 7.3, dur: 0.6, do: 'punch', amount: 0.12, to: { x: 94, y: 58 } },
  ],
  lights: [
    // 乳牛砸地：白光一閃
    { at: 4.7, dur: 0.04, level: -0.45 },
    { at: 4.74, dur: 0.3, level: 0 },
  ],
  cues: [
    { at: 0, sfx: 'whoosh' },
    { at: 1.4, say: '喝' },
    { at: 1.45, sfx: 'laser' },
    { at: 2.1, sfx: 'bonk' },
    { at: 2.15, sfx: 'splash' },
    { at: 3.45, sfx: 'laser' },
    { at: 3.6, sfx: 'boing' },
    { at: 4.02, sfx: 'bonk' },
    { at: 4.42, sfx: 'whoosh' },
    { at: 4.7, sfx: 'rumble' },
    { at: 5.35, sfx: 'clink' },
    { at: 5.9, say: '喝' },
    { at: 7.25, say: '喝牛奶' },
    { at: 7.7, sfx: 'gulp' },
    { at: 7.95, sfx: 'gulp' },
    { at: 8.68, sfx: 'laser' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
