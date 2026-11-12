import { scene } from '../scene'
import type { Scenes } from './index'

// 小龍愛吃：小龍走進樹林，張大嘴等吃的。西瓜一口吞、辣椒吃下去噴火燒焦大樹、毛毛蟲在嘴裡跳把他帶著亂彈；
// 吃完肚子鼓起來、打嗝、仰天倒下；夜裡睡著了，肚子裡的蟲還在唱歌。
// 主角 dino（size 24 站在地上 y = 66.9），臉朝左，嘴巴在左上；吃的東西都從左邊來。
// 三段 eat 誰先誰後都可能：開頭結尾都是 WAIT（x 90、張大嘴 roar、原本的大小、沒有染色）。
const G = 66.9
const X = 90
const BG = { top: '#9FD6EE', bottom: '#E4F5DD', floor: '#86C266', scenery: 'forest' as const }
/** 左邊那棵大樹：每一頁都在（辣椒的火會把它燒焦） */
const tree = { id: 'tree', emoji: '🌳', x: 30, y: 64.4, size: 30 }
/** 等著吃的樣子 */
const wait = { id: 'dino', emoji: 'hero:dino/roar', x: X, y: G, size: 24 }
/** 嘴巴大概在這裡（張嘴 roar、站在 X） */
const MOUTH = { x: 80, y: 50 }
/** 吃飽以後走到樹旁邊、往後一倒（肚子朝天）的位置；最後一頁躺著，肚子與嘴巴大概在這裡 */
const LIE = 62
const BELLY = { x: 71, y: 58 }
const MOUTH_UP = { x: 80, y: 54 }
/** 躺著時頭上（效果的錨點跟著頭，但不會跟著身體轉，所以最後一頁的效果都寫固定位置） */
const HEAD_UP = { x: 94, y: 48 }
/** 倒下以後（full 的結尾到 night 整段）鏡頭定在這裡：躺著的身體比引擎估的範圍寬，自動取景會切到他 */
const BED_CAM = { at: -1, dur: 0.01, do: 'zoom' as const, amount: 1.3, to: { x: 80, y: 52 } }

const scenes: Scenes = {
  // 小龍有大口。他愛吃！——從右邊走進來，聞到味道，張大嘴吼一聲，口水直流、肚子咕嚕叫
  mouth: scene({
    duration: 5.6,
    bg: BG,
    actors: [tree, { ...wait, emoji: 'hero:dino/idle', hidden: true }],
    moves: [
      { at: 0, actor: 'dino', do: 'enter', from: { x: 178, y: G }, dur: 1.0, ease: 'out' },
      { at: 1.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
      { at: 1.15, actor: 'dino', do: 'hop', amount: 3, dur: 0.3 },
      // 吼之前先往後仰蓄力
      { at: 1.5, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.35 },
      { at: 1.85, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
      { at: 1.85, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 1.85, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.5 },
      { at: 1.9, actor: 'tree', do: 'tilt', amount: -10, dur: 0.6 },
      // 肚子咕嚕叫：低頭看肚子
      { at: 3.4, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 3.4, actor: 'dino', do: 'shake', amount: 1.0, dur: 0.5 },
      { at: 3.4, actor: 'dino', do: 'tilt', amount: -8, dur: 0.6 },
      { at: 4.3, actor: 'dino', do: 'hop', amount: 4, dur: 0.35 },
    ],
    fx: [
      { at: 1.15, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.5 },
      { at: 1.85, kind: 'burst', x: MOUTH.x - 8, y: MOUTH.y - 2, n: 1, dur: 0.5 },
      { at: 1.9, kind: 'burst', x: MOUTH.x - 4, y: MOUTH.y, emoji: '💢', n: 5, dur: 0.7 },
      { at: 2.6, kind: 'rain', x: MOUTH.x - 2, y: MOUTH.y + 4, emoji: '💧', n: 3, dur: 1.4 },
      { at: 3.4, kind: 'pop', actor: 'dino', emoji: '🤤', dx: -14, dur: 1.0 },
      { at: 4.3, kind: 'bubble', actor: 'dino', emoji: '🍗', dur: 1.3 },
    ],
    camera: [{ at: 1.85, dur: 0.4, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 1.85, sfx: 'rumble' },
      { at: 2.0, say: '小龍的嘴好大。他愛吃！' },
      { at: 3.4, sfx: 'rumble' },
    ],
  }),

  // 好甜！好甜！——大西瓜滾進來，小龍一口吞下，整隻亮晶晶冒愛心，開心轉圈
  'eat:瓜': scene({
    duration: 4.9,
    bg: BG,
    actors: [
      tree,
      wait,
      { id: 'melon', emoji: '🍉', x: 66, y: 66, size: 16, hidden: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.1, actor: 'melon', do: 'enter', from: { x: -10, y: 66 }, arc: 14, dur: 0.7, ease: 'out' },
      { at: 0.1, actor: 'melon', do: 'spin', times: 1, dur: 0.7 },
      { at: 0.9, actor: 'dino', do: 'hop', amount: 4, dur: 0.3 },
      // 張更大，西瓜跳進嘴裡
      { at: 1.25, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.3 },
      { at: 1.4, actor: 'melon', do: 'moveTo', to: MOUTH, arc: 10, dur: 0.3, ease: 'in' },
      { at: 1.7, actor: 'melon', do: 'vanish', dur: 0.08 },
      { at: 1.7, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.4 },
      { at: 1.7, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 2.1, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
      { at: 2.1, actor: 'dino', do: 'flash', dur: 1.2 },
      // 開心到左右扭
      { at: 2.9, actor: 'dino', do: 'hop', amount: 6, dur: 0.4 },
      { at: 2.9, actor: 'dino', do: 'tilt', amount: -14, dur: 0.4 },
      { at: 3.35, actor: 'dino', do: 'hop', amount: 6, dur: 0.4 },
      { at: 3.35, actor: 'dino', do: 'tilt', amount: 14, dur: 0.4 },
      { at: 4.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    ],
    fx: [
      { at: 0.9, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.5 },
      { at: 1.7, kind: 'burst', x: MOUTH.x, y: MOUTH.y, emoji: '💦', n: 6, dur: 0.6 },
      { at: 2.1, kind: 'burst', actor: 'dino', emoji: '✨', n: 8, dy: 10, dur: 1.0 },
      { at: 2.2, kind: 'pop', actor: 'dino', emoji: '😋', dx: 12, dur: 1.4 },
      { at: 2.9, kind: 'burst', actor: 'dino', emoji: '💖', n: 8, dur: 1.0 },
    ],
    cues: [
      { at: 0.1, sfx: 'slide' },
      { at: 1.7, sfx: 'gulp' },
      { at: 2.1, say: '好甜的瓜！' },
      { at: 3.0, sfx: 'cheer' },
    ],
  }),

  // 好辣！嘴裡有火了！——辣椒掉下來吃掉，停一拍……整隻變紅冒汗，噴出一大道火把大樹燒焦，喘氣、變回綠色
  'eat:辣': scene({
    duration: 6.1,
    bg: BG,
    actors: [
      tree,
      wait,
      { id: 'chili', emoji: '🌶️', x: 70, y: 69, size: 13, hidden: true, pivot: 'center' },
      { id: 'f1', emoji: '🔥', x: MOUTH.x - 4, y: MOUTH.y, size: 12, hidden: true, float: true, pivot: 'center' },
      { id: 'f2', emoji: '🔥', x: MOUTH.x - 4, y: MOUTH.y, size: 12, hidden: true, float: true, pivot: 'center' },
      { id: 'f3', emoji: '🔥', x: MOUTH.x - 4, y: MOUTH.y, size: 12, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.15, actor: 'chili', do: 'drop', dur: 0.5 },
      { at: 0.75, actor: 'dino', do: 'hop', amount: 3, dur: 0.25 },
      { at: 1.1, actor: 'chili', do: 'moveTo', to: MOUTH, arc: 8, dur: 0.25, ease: 'in' },
      { at: 1.1, actor: 'chili', do: 'spin', times: 1, dur: 0.25 },
      { at: 1.35, actor: 'chili', do: 'vanish', dur: 0.08 },
      { at: 1.35, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 1.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
      // 停一拍……然後：辣！
      { at: 2.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
      { at: 2.2, actor: 'dino', do: 'tint', filter: 'hue-rotate(-110deg) saturate(1.8)' },
      { at: 2.2, actor: 'dino', do: 'shake', amount: 2, dur: 0.5 },
      { at: 2.25, actor: 'dino', do: 'hop', amount: 8, dur: 0.4 },
      // 噴火：往後仰蓄力，吼出去
      { at: 2.7, actor: 'dino', do: 'squash', amount: -0.3, dur: 0.25 },
      { at: 2.95, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
      { at: 2.95, actor: 'dino', do: 'moveTo', to: { x: X + 6, y: G }, dur: 0.3, ease: 'out' },
      ...(['f1', 'f2', 'f3'] as const).flatMap((id, i) => [
        { at: 2.95 + i * 0.1, actor: id, do: 'pop' as const, dur: 0.1 },
        { at: 2.95 + i * 0.1, actor: id, do: 'moveTo' as const, to: { x: 36, y: 50 - i * 4 }, dur: 0.35, ease: 'in' as const },
        { at: 2.95 + i * 0.1, actor: id, do: 'scaleTo' as const, amount: 2, dur: 0.35 },
        { at: 3.3 + i * 0.1, actor: id, do: 'vanish' as const, dur: 0.15 },
      ]),
      { at: 3.3, actor: 'tree', do: 'tint', filter: 'grayscale(1) brightness(.3)' },
      { at: 3.3, actor: 'tree', do: 'shake', amount: 1.5, dur: 0.6 },
      // 喘氣
      { at: 3.8, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
      { at: 3.9, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 4.25, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 4.6, actor: 'dino', do: 'tint', filter: '' },
      { at: 4.6, actor: 'dino', do: 'moveTo', to: { x: X, y: G }, dur: 0.5 },
      // 大樹抖一抖，葉子又長回來
      { at: 4.7, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.4 },
      { at: 5.1, actor: 'tree', do: 'tint', filter: '' },
      { at: 5.1, actor: 'tree', do: 'squash', amount: -0.2, dur: 0.35 },
      { at: 5.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    ],
    fx: [
      { at: 0.75, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.5 },
      { at: 1.7, kind: 'pop', actor: 'dino', emoji: '😋', dx: 12, dur: 0.6 },
      { at: 2.2, kind: 'fountain', actor: 'dino', emoji: '💦', dur: 1.2 },
      { at: 2.2, kind: 'sweat', actor: 'dino' },
      { at: 2.95, kind: 'line', actor: 'dino', to: { x: 36, y: 48 }, color: '#FF7A1A', width: 3, dur: 0.6 },
      { at: 3.3, kind: 'burst', actor: 'tree', n: 1, dur: 0.4 },
      { at: 3.35, kind: 'rain', x: 30, y: 40, emoji: '🍂', n: 6, dur: 1.2 },
      { at: 3.9, kind: 'pop', actor: 'dino', emoji: '🥵', dx: -14, dur: 1.0 },
      { at: 5.1, kind: 'burst', actor: 'tree', emoji: '🍃', n: 8, dur: 0.7 },
    ],
    camera: [{ at: 3.3, dur: 0.4, do: 'shake', amount: 1.6 }],
    cues: [
      { at: 0.15, sfx: 'plop' },
      { at: 1.35, sfx: 'gulp' },
      { at: 2.2, say: '好辣！嘴裡有火了！' },
      { at: 2.95, sfx: 'whoosh' },
      { at: 3.3, sfx: 'poof' },
      { at: 5.1, sfx: 'boing' },
    ],
  }),

  // 蟲在他的嘴裡跳！——毛毛蟲一跳一跳衝進嘴裡，小龍被帶著上彈、左彈、右彈、空翻，蟲從嘴裡探頭揮手，被咕嚕吞下去……肚子又跳了一下
  'eat:蟲': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      tree,
      wait,
      { id: 'bug', emoji: '🐛', x: 44, y: 70, size: 11, hidden: true, flip: true },
    ],
    moves: [
      { at: 0.1, actor: 'bug', do: 'enter', from: { x: -8, y: 70 }, arc: 8, dur: 0.45, ease: 'linear' },
      { at: 0.6, actor: 'bug', do: 'moveTo', to: { x: 62, y: 70 }, arc: 8, dur: 0.4, ease: 'linear' },
      { at: 0.8, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
      { at: 1.05, actor: 'bug', do: 'moveTo', to: MOUTH, arc: 14, dur: 0.4, ease: 'in' },
      { at: 1.45, actor: 'bug', do: 'vanish', dur: 0.06 },
      { at: 1.45, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
      // 蟲在嘴裡跳：被帶著一彈一彈，越彈越大
      { at: 1.55, actor: 'dino', do: 'hop', amount: 7, dur: 0.3 },
      { at: 1.55, actor: 'dino', do: 'shake', amount: 1, dur: 0.3 },
      { at: 1.9, actor: 'dino', do: 'moveTo', to: { x: 72, y: G }, arc: 10, dur: 0.35 },
      { at: 1.9, actor: 'dino', do: 'tilt', amount: -18, dur: 0.35 },
      { at: 2.3, actor: 'dino', do: 'moveTo', to: { x: 106, y: G }, arc: 12, dur: 0.4 },
      { at: 2.3, actor: 'dino', do: 'tilt', amount: 18, dur: 0.4 },
      { at: 2.9, actor: 'dino', do: 'hop', amount: 14, dur: 0.55 },
      { at: 2.9, actor: 'dino', do: 'spin', times: 1, dur: 0.55, pivot: 'center' },
      // 蟲從嘴裡探頭出來揮手……又掉回去
      { at: 3.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
      // （蟲不是 float：引擎放大時會把離地的東西往上推一點，所以寫低一點）
      { at: 3.5, actor: 'bug', do: 'moveTo', to: { x: 95, y: 58 }, dur: 0.01 },
      { at: 3.55, actor: 'bug', do: 'pop', dur: 0.15 },
      { at: 3.55, actor: 'bug', do: 'moveTo', to: { x: 95, y: 52 }, dur: 0.3, ease: 'out' },
      { at: 3.95, actor: 'bug', do: 'moveTo', to: { x: 95, y: 58 }, dur: 0.2, ease: 'in' },
      { at: 3.95, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
      { at: 4.15, actor: 'bug', do: 'vanish', dur: 0.06 },
      { at: 4.15, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.35 },
      { at: 4.15, actor: 'dino', do: 'shake', amount: 0.8, dur: 0.35 },
      { at: 4.55, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
      // 吞下去了……肚子又跳一下
      { at: 5.0, actor: 'dino', do: 'hop', amount: 4, dur: 0.25 },
      { at: 5.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
      { at: 5.4, actor: 'dino', do: 'moveTo', to: { x: X, y: G }, dur: 0.6 },
      { at: 6.0, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
    ],
    fx: [
      { at: 0.8, kind: 'pop', actor: 'dino', emoji: '❓', dur: 0.5 },
      { at: 1.55, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.4 },
      { at: 1.95, kind: 'sweat', actor: 'dino' },
      { at: 3.6, kind: 'pop', actor: 'bug', emoji: '👋', dx: -8, dy: 4, dur: 0.45 },
      { at: 4.15, kind: 'burst', actor: 'dino', emoji: '💫', n: 6, dur: 0.6 },
      { at: 4.6, kind: 'pop', actor: 'dino', emoji: '😋', dx: -14, dur: 0.4 },
      { at: 5.0, kind: 'pop', actor: 'dino', emoji: '❓', dur: 0.8 },
    ],
    camera: [{ at: 3.45, dur: 0.3, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 1.45, sfx: 'gulp' },
      { at: 1.55, sfx: 'boing' },
      { at: 1.7, say: '蟲在他的嘴裡跳！' },
      { at: 1.9, sfx: 'boing' },
      { at: 2.3, sfx: 'boing' },
      { at: 2.9, sfx: 'boing' },
      { at: 4.15, sfx: 'gulp' },
      { at: 5.0, sfx: 'boing' },
    ],
  }),

  // 小龍肚大大。他好累。——肚子一鼓一鼓脹起來，打一個大嗝把樹葉吹掉，眼皮好重，搖搖晃晃往後一倒、肚子朝天
  full: scene({
    duration: 6.0,
    bg: BG,
    actors: [tree, wait],
    moves: [
      { at: 0.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
      { at: 0.5, actor: 'dino', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
      { at: 0.5, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 0.95, actor: 'dino', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
      { at: 0.95, actor: 'dino', do: 'squash', amount: 0.15, dur: 0.3 },
      // 打嗝
      { at: 2.1, actor: 'dino', do: 'squash', amount: -0.2, dur: 0.3 },
      { at: 2.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/roar' },
      { at: 2.4, actor: 'dino', do: 'squash', amount: 0.2, dur: 0.3 },
      { at: 2.45, actor: 'tree', do: 'tilt', amount: -10, dur: 0.6 },
      // 好累：搖搖晃晃走到樹下，往後一倒
      { at: 3.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
      { at: 3.4, actor: 'dino', do: 'moveTo', to: { x: LIE, y: G }, dur: 0.9 },
      { at: 3.4, actor: 'dino', do: 'tilt', amount: 8, dur: 0.9 },
      { at: 4.45, actor: 'dino', do: 'rotateTo', amount: 90, dur: 0.45, ease: 'in' },
    ],
    fx: [
      { at: 0.5, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.4 },
      { at: 2.4, kind: 'stink', x: 72, y: 50, dur: 1.2 },
      { at: 2.45, kind: 'burst', x: 70, y: 50, n: 1, dur: 0.4 },
      { at: 2.55, kind: 'rain', x: 30, y: 40, emoji: '🍃', n: 6, dur: 1.2 },
      { at: 3.3, kind: 'sweat', actor: 'dino' },
      { at: 3.3, kind: 'pop', actor: 'dino', emoji: '🥱', dx: -14, dur: 1.0 },
      { at: 4.95, kind: 'puff', actor: 'dino', dur: 0.5 },
    ],
    camera: [
      { ...BED_CAM, at: 4.2, dur: 0.6 },
      { at: 4.9, dur: 0.35, do: 'shake', amount: 1.4 },
    ],
    cues: [
      { at: 0.5, sfx: 'boing' },
      { at: 0.95, sfx: 'boing' },
      { at: 1.0, say: '小龍的肚子大大的。他累了。' },
      { at: 2.4, sfx: 'hic' },
      { at: 4.9, sfx: 'bonk' },
    ],
  }),

  // 夜晚，蟲在他的肚子裡叫。——天黑了，小龍肚子朝天呼呼大睡；肚子一鼓一鼓發亮、冒出音符，整隻被頂得彈起來，
  // 吵醒了瞪著肚子……毛毛蟲從他嘴裡探出頭揮手唱歌，又縮回去。小龍無奈，繼續睡
  night: scene({
    duration: 7.6,
    bg: BG,
    actors: [
      tree,
      { ...wait, x: LIE, emoji: 'hero:dino/dizzy' },
      { id: 'moon', emoji: '🌙', x: 122, y: 25, size: 12, hidden: true, float: true, top: true },
      ...(['🎵', '🎶', '🎵'] as const).map((emoji, i) => ({ id: `n${i}`, emoji, ...BELLY, size: 9, hidden: true, float: true, top: true })),
      { id: 'bug', emoji: '🐛', ...MOUTH_UP, size: 10, hidden: true, top: true, flip: true },
    ],
    moves: [
      // 接上一頁：倒下來的樣子（同一刻轉好，看起來就是一直躺著）
      { at: 0, actor: 'dino', do: 'scaleTo', amount: 1.3225, dur: 0 },
      { at: 0, actor: 'dino', do: 'rotateTo', amount: 90, dur: 0 },
      { at: 0.4, actor: 'moon', do: 'pop', dur: 0.4 },
      // 肚子裡的蟲在唱：一下、兩下、三下，越來越大聲
      ...[2.2, 2.8, 3.4].flatMap((at, i) => [
        { at, actor: 'dino', do: 'flash' as const, dur: 0.6 },
        { at, actor: 'dino', do: 'hop' as const, amount: 2 + i * 2, dur: 0.3 },
        { at, actor: `n${i}`, do: 'pop' as const, dur: 0.2 },
        { at, actor: `n${i}`, do: 'moveTo' as const, to: { x: BELLY.x - 6 + i * 6, y: BELLY.y - 20 }, dur: 0.9, ease: 'out' as const },
        { at: at + 0.9, actor: `n${i}`, do: 'vanish' as const, dur: 0.2 },
      ]),
      // 吵醒了
      { at: 4.2, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
      { at: 4.2, actor: 'dino', do: 'shake', amount: 1.2, dur: 0.4 },
      // 蟲從嘴裡探頭出來揮手
      { at: 5.0, actor: 'bug', do: 'pop', dur: 0.25 },
      { at: 5.0, actor: 'bug', do: 'moveTo', to: { x: MOUTH_UP.x, y: MOUTH_UP.y - 8 }, dur: 0.3, ease: 'out' },
      { at: 5.4, actor: 'bug', do: 'tilt', amount: 15, dur: 0.6 },
      { at: 6.1, actor: 'bug', do: 'moveTo', to: MOUTH_UP, dur: 0.25, ease: 'in' },
      { at: 6.35, actor: 'bug', do: 'vanish', dur: 0.06 },
      { at: 6.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    ],
    fx: [
      { at: 0.6, kind: 'zzz', ...HEAD_UP, dur: 1.6 },
      { at: 4.3, kind: 'pop', ...HEAD_UP, emoji: '😑', dur: 2.2 },
      { at: 5.3, kind: 'pop', actor: 'bug', emoji: '👋', dx: -8, dur: 0.7 },
      { at: 6.7, kind: 'zzz', ...HEAD_UP, dur: 0.9 },
    ],
    // 接上一頁結尾的鏡頭，整段定住（自動取景會去框頭上的蟲、把小龍切掉）
    camera: [BED_CAM, { at: 4.2, dur: 0.3, do: 'shake', amount: 0.8 }],
    lights: [{ at: 0, dur: 0.8, level: 0.5 }],
    cues: [
      { at: 1.0, say: '夜晚，蟲在他的肚子裡叫。' },
      { at: 2.2, sfx: 'blip' },
      { at: 2.8, sfx: 'blip' },
      { at: 3.4, sfx: 'blip' },
      { at: 4.2, sfx: 'boing' },
      { at: 5.0, sfx: 'plop' },
    ],
  }),
}

export default scenes
