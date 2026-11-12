import { scene } from '../scene'
import type { Scenes } from './index'

// 小豬好冷：下雪天小豬一直發抖。給他火就烤火、給他雪就被埋成雪人；肚子餓給他餅就吃光、給他石頭就咬到牙齒飛出去。
// 最後小豬衝到鏡頭前面抱抱。主角 pig（size 24 站在地上 y = 66.9）；火堆在右邊 x 112，第二頁以後一直都在。
const G = 66.9
const BG = { top: '#A9CDEE', bottom: '#E6F2FB', floor: '#F4F8FC', scenery: 'snow' as const }
/** 第二頁以後：火堆已經生好了 */
const fire = [
  { id: 'log', emoji: '🪵', x: 112, y: 71.5, size: 12 },
  { id: 'fire', emoji: '🔥', x: 112, y: 62, size: 19 },
]

const scenes: Scenes = {
  // 下雪天，小豬好冷。——走進來，抖、抖得更厲害、打一個大噴嚏
  snow: scene({
    duration: 4.5,
    bg: BG,
    actors: [{ id: 'pig', emoji: 'hero:pig/idle', x: 78, y: G, size: 24, hidden: true }],
    moves: [
      { at: 0, actor: 'pig', do: 'enter', from: { x: -18, y: G }, dur: 0.9, ease: 'out' },
      { at: 1.0, actor: 'pig', do: 'shake', amount: 1.4, dur: 0.6 },
      { at: 1.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 1.75, actor: 'pig', do: 'shake', amount: 2.2, dur: 0.8 },
      // 噴嚏：先往後仰（拉長）再噴
      { at: 2.75, actor: 'pig', do: 'squash', amount: -0.3, dur: 0.35 },
      { at: 3.1, actor: 'pig', do: 'squash', amount: 0.45, dur: 0.3 },
      { at: 3.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
      // 甩甩頭，回到兩手捧著臉發抖的樣子：等他選的時候停在這裡
      { at: 3.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 3.75, actor: 'pig', do: 'shake', amount: 1.4, dur: 0.7 },
    ],
    fx: [
      { at: 0.3, kind: 'rain', x: 60, y: 6, emoji: '❄️', n: 7, dur: 1.6 },
      { at: 1.0, kind: 'pop', actor: 'pig', emoji: '🥶', dur: 1.5 },
      { at: 1.9, kind: 'rain', x: 100, y: 4, emoji: '❄️', n: 7, dur: 1.6 },
      { at: 3.1, kind: 'burst', actor: 'pig', emoji: '❄️', n: 8, dy: 8, dur: 0.7 },
      { at: 3.15, kind: 'puff', actor: 'pig', dur: 0.5 },
    ],
    camera: [{ at: 3.1, dur: 0.3, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 0.5, say: '下雪天，小豬好冷。' },
      { at: 3.1, sfx: 'achoo' },
    ],
  }),

  // 給他火！——火堆啵一聲冒出來，小豬嚇一跳、湊過去、暖得跳起來
  'warm:火': scene({
    duration: 4.4,
    bg: BG,
    actors: [
      { id: 'log', emoji: '🪵', x: 112, y: 71.5, size: 12, hidden: true },
      { id: 'fire', emoji: '🔥', x: 112, y: 62, size: 19, hidden: true },
      { id: 'pig', emoji: 'hero:pig/surprised', x: 78, y: G, size: 24 },
    ],
    moves: [
      { at: 0, actor: 'pig', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 0.35, actor: 'log', do: 'drop', dur: 0.45 },
      { at: 0.85, actor: 'fire', do: 'pop', dur: 0.4 },
      { at: 0.95, actor: 'pig', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.25, actor: 'fire', do: 'squash', amount: -0.3, dur: 0.5 },
      { at: 1.5, actor: 'pig', do: 'moveTo', to: { x: 93, y: G }, dur: 0.7 },
      { at: 2.25, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
      { at: 2.9, actor: 'pig', do: 'hop', amount: 6, dur: 0.4 },
      { at: 3.4, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
      { at: 2.9, actor: 'fire', do: 'squash', amount: -0.2, dur: 0.5 },
    ],
    fx: [
      { at: 0.85, kind: 'burst', actor: 'fire', emoji: '✨', n: 8, dy: 6, dur: 0.7 },
      { at: 0.95, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
      { at: 2.3, kind: 'pop', actor: 'pig', emoji: '😊', dur: 1.2 },
      { at: 2.9, kind: 'burst', actor: 'pig', emoji: '💗', n: 6, dur: 0.9 },
    ],
    cues: [
      { at: 0.35, sfx: 'plop' },
      { at: 0.85, sfx: 'poof' },
      { at: 2.0, say: '有火，不冷！' },
      { at: 3.4, sfx: 'cheer' },
    ],
  }),

  // 給他雪！——一顆大雪球砸下來，小豬整隻變成雪人，抖到雪全部炸開，又回到原本發抖的樣子
  'warm:雪': scene({
    duration: 5.4,
    bg: BG,
    actors: [
      { id: 'pig', emoji: 'hero:pig/surprised', x: 78, y: G, size: 24 },
      { id: 'ball', emoji: '⚪', x: 78, y: 60, size: 30, hidden: true, pivot: 'center' },
      { id: 'man', emoji: '⛄', x: 78, y: 64, size: 30, hidden: true },
    ],
    moves: [
      { at: 0, actor: 'pig', do: 'shake', amount: 1.2, dur: 0.4 },
      // 抬頭看：影子越來越大
      { at: 0.35, actor: 'pig', do: 'hop', amount: 2, dur: 0.2 },
      { at: 0.55, actor: 'ball', do: 'enter', from: { x: 78, y: -24 }, dur: 0.45, ease: 'in' },
      { at: 1.0, actor: 'ball', do: 'vanish', dur: 0.12 },
      { at: 1.0, actor: 'pig', do: 'vanish', dur: 0.1 },
      { at: 1.0, actor: 'man', do: 'pop', dur: 0.3 },
      { at: 1.0, actor: 'man', do: 'squash', amount: 0.4, dur: 0.35 },
      // 雪人自己在發抖
      { at: 1.6, actor: 'man', do: 'shake', amount: 1.0, dur: 0.7 },
      { at: 2.5, actor: 'man', do: 'shake', amount: 1.8, dur: 0.8 },
      { at: 3.4, actor: 'man', do: 'shake', amount: 2.8, dur: 0.6 },
      { at: 3.4, actor: 'man', do: 'squash', amount: -0.25, dur: 0.6 },
      // 炸開：小豬還在裡面
      { at: 4.0, actor: 'man', do: 'vanish', dur: 0.12 },
      { at: 4.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
      { at: 4.0, actor: 'pig', do: 'pop', dur: 0.3 },
      { at: 4.0, actor: 'pig', do: 'hop', amount: 6, dur: 0.4 },
      { at: 4.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 4.8, actor: 'pig', do: 'shake', amount: 1.4, dur: 0.6 },
    ],
    fx: [
      { at: 0.35, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5 },
      { at: 1.0, kind: 'burst', actor: 'man', emoji: '❄️', n: 10, dy: 10, dur: 0.8 },
      { at: 1.7, kind: 'pop', actor: 'man', emoji: '🥶', dx: 6, dur: 1.6 },
      { at: 2.6, kind: 'sweat', actor: 'man' },
      { at: 4.0, kind: 'burst', actor: 'pig', emoji: '❄️', n: 12, dy: 10, dur: 0.9 },
      { at: 4.1, kind: 'dizzy', actor: 'pig', dur: 1.2 },
    ],
    camera: [
      { at: 1.0, dur: 0.35, do: 'shake', amount: 2 },
      { at: 4.0, dur: 0.3, do: 'shake', amount: 1.4 },
    ],
    cues: [
      { at: 0.55, sfx: 'whoosh' },
      { at: 1.0, sfx: 'bonk' },
      { at: 1.9, say: '太冷！太冷！' },
      { at: 3.4, sfx: 'rumble' },
      { at: 4.0, sfx: 'poof' },
    ],
  }),

  // 小豬要吃飯。——烤火烤得正舒服，肚子咕嚕叫，想到一碗飯
  hungry: scene({
    duration: 3.9,
    bg: BG,
    actors: [...fire, { id: 'pig', emoji: 'hero:pig/happy', x: 93, y: G, size: 24 }],
    moves: [
      { at: 0.3, actor: 'pig', do: 'hop', amount: 3, dur: 0.3 },
      { at: 0.9, actor: 'pig', do: 'squash', amount: 0.22, dur: 0.3 },
      { at: 0.9, actor: 'pig', do: 'shake', amount: 0.9, dur: 0.5 },
      { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 1.9, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 1.9, actor: 'pig', do: 'shake', amount: 1.3, dur: 0.6 },
      { at: 2.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
      { at: 2.5, actor: 'pig', do: 'moveTo', to: { x: 78, y: G }, dur: 0.7 },
    ],
    fx: [
      { at: 1.0, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.6 },
      { at: 2.6, kind: 'bubble', actor: 'pig', emoji: '🍚', dur: 1.3 },
    ],
    cues: [
      { at: 0.9, sfx: 'rumble' },
      { at: 1.3, say: '小豬要吃飯。' },
      { at: 1.9, sfx: 'rumble' },
    ],
  }),

  // 給他餅！——一塊大餅乾掉下來，小豬兩口吃光，開心到跳起來
  'food:餅': scene({
    duration: 4.8,
    bg: BG,
    actors: [
      ...fire,
      { id: 'pig', emoji: 'hero:pig/think', x: 78, y: G, size: 24 },
      { id: 'cookie', emoji: '🍪', x: 58, y: 69, size: 16, hidden: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.3, actor: 'cookie', do: 'drop', dur: 0.6 },
      { at: 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 0.75, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
      // 撲過去咬第一口：餅乾變小
      { at: 1.3, actor: 'pig', do: 'moveTo', to: { x: 68, y: G }, dur: 0.3, anticipate: 3, ease: 'in' },
      { at: 1.6, actor: 'cookie', do: 'scaleTo', amount: 0.6, dur: 0.12 },
      { at: 1.6, actor: 'pig', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 2.1, actor: 'cookie', do: 'moveTo', to: { x: 66, y: 62 }, dur: 0.15 },
      { at: 2.25, actor: 'cookie', do: 'vanish', dur: 0.12 },
      { at: 2.25, actor: 'pig', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 2.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
      { at: 3.2, actor: 'pig', do: 'hop', amount: 7, dur: 0.45 },
      { at: 3.2, actor: 'pig', do: 'spin', times: 1, dur: 0.45, pivot: 'center' },
      { at: 3.8, actor: 'pig', do: 'hop', amount: 4, dur: 0.35 },
    ],
    fx: [
      { at: 0.75, kind: 'pop', actor: 'pig', emoji: '❗', dur: 0.5 },
      { at: 1.6, kind: 'burst', actor: 'cookie', emoji: '🟤', n: 5, dur: 0.5 },
      { at: 2.25, kind: 'burst', actor: 'pig', emoji: '🟤', n: 5, dx: -8, dy: 8, dur: 0.5 },
      { at: 2.7, kind: 'pop', actor: 'pig', emoji: '😋', dur: 1.4 },
      { at: 3.2, kind: 'burst', actor: 'pig', emoji: '⭐', n: 8, dur: 0.9 },
    ],
    cues: [
      { at: 0.75, sfx: 'plop' },
      { at: 1.6, sfx: 'gulp' },
      { at: 2.25, sfx: 'gulp' },
      { at: 2.6, say: '好吃！好吃！' },
    ],
  }),

  // 給他石！——石頭掉下來，小豬用力一咬：喀！牙齒飛出去，眼冒金星，把石頭踢走
  'food:石': scene({
    duration: 5.6,
    bg: BG,
    actors: [
      ...fire,
      { id: 'pig', emoji: 'hero:pig/think', x: 78, y: G, size: 24 },
      { id: 'rock', emoji: '🪨', x: 58, y: 69, size: 16, hidden: true, pivot: 'center' },
      { id: 'tooth', emoji: '🦷', x: 66, y: 58, size: 7, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.3, actor: 'rock', do: 'drop', dur: 0.5 },
      { at: 0.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 0.75, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
      // 張大嘴撲上去
      { at: 1.3, actor: 'pig', do: 'squash', amount: -0.25, dur: 0.3 },
      { at: 1.6, actor: 'pig', do: 'moveTo', to: { x: 68, y: G }, dur: 0.22, ease: 'in' },
      { at: 1.82, actor: 'pig', do: 'squash', amount: 0.4, dur: 0.3 },
      { at: 1.82, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
      { at: 1.82, actor: 'rock', do: 'shake', amount: 0.6, dur: 0.3 },
      // 牙齒飛出去
      { at: 1.85, actor: 'tooth', do: 'pop', dur: 0.1 },
      { at: 1.9, actor: 'tooth', do: 'moveTo', to: { x: 22, y: 30 }, arc: 22, dur: 0.9, ease: 'out' },
      { at: 1.9, actor: 'tooth', do: 'spin', times: 3, dur: 0.9 },
      { at: 2.8, actor: 'tooth', do: 'vanish', dur: 0.2 },
      // 彈回去，眼冒金星
      { at: 2.1, actor: 'pig', do: 'moveTo', to: { x: 82, y: G }, dur: 0.4, ease: 'out' },
      { at: 2.6, actor: 'pig', do: 'shake', amount: 1.6, dur: 0.8 },
      // 生氣把石頭踢走
      { at: 4.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
      { at: 4.2, actor: 'pig', do: 'moveTo', to: { x: 72, y: G }, dur: 0.2, anticipate: 3, ease: 'in' },
      { at: 4.4, actor: 'rock', do: 'moveTo', to: { x: -20, y: 30 }, arc: 14, dur: 0.6, ease: 'out' },
      { at: 4.4, actor: 'rock', do: 'spin', times: -2, dur: 0.6 },
      { at: 4.7, actor: 'pig', do: 'moveTo', to: { x: 78, y: G }, dur: 0.35 },
      { at: 5.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/think' },
    ],
    fx: [
      { at: 0.75, kind: 'pop', actor: 'pig', emoji: '❓', dur: 0.5 },
      { at: 1.82, kind: 'burst', actor: 'rock', n: 1, dy: 4, dur: 0.5 },
      { at: 2.2, kind: 'dizzy', actor: 'pig', dur: 1.8 },
      { at: 2.7, kind: 'pop', actor: 'pig', emoji: '😖', dx: -14, dur: 1.2 },
      { at: 4.4, kind: 'puff', actor: 'pig', dur: 0.4 },
    ],
    camera: [{ at: 1.82, dur: 0.35, do: 'shake', amount: 2 }],
    cues: [
      { at: 0.75, sfx: 'bonk' },
      { at: 1.82, sfx: 'crack' },
      { at: 2.7, say: '石不可吃！' },
      { at: 4.4, sfx: 'whoosh' },
    ],
  }),

  // 小豬笑笑。他抱抱你！——笑著跳兩下，然後整隻衝到鏡頭前面，愛心滿天
  hug: scene({
    duration: 4.8,
    bg: BG,
    actors: [...fire, { id: 'pig', emoji: 'hero:pig/happy', x: 68, y: G, size: 24 }],
    moves: [
      { at: 0.2, actor: 'pig', do: 'hop', amount: 5, dur: 0.35 },
      { at: 0.65, actor: 'pig', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.1, actor: 'pig', do: 'tilt', amount: 10, dur: 0.4 },
      // 往後蹲一下，衝到你面前
      { at: 1.9, actor: 'pig', do: 'squash', amount: 0.3, dur: 0.3 },
      // 腳底在畫面下緣外面，整張臉剛好在正中間（放大是從腳底往上長）
      { at: 2.2, actor: 'pig', do: 'moveTo', to: { x: 80, y: 76 }, dur: 0.5, ease: 'back' },
      { at: 2.2, actor: 'pig', do: 'scaleTo', amount: 2.3, dur: 0.5, ease: 'back' },
      { at: 2.9, actor: 'pig', do: 'tilt', amount: -8, dur: 0.5 },
      { at: 3.4, actor: 'pig', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 3.9, actor: 'pig', do: 'squash', amount: 0.12, dur: 0.4 },
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'pig', emoji: '😆', dur: 1.2 },
      { at: 2.6, kind: 'burst', x: 80, y: 40, emoji: '💗', n: 12, dur: 1.2 },
      { at: 3.3, kind: 'burst', x: 80, y: 36, emoji: '💖', n: 10, dur: 1.2 },
    ],
    // 小豬放大以後自動取景不框他（太大），會改去框火堆：劇本自己把鏡頭定在正中間
    camera: [
      { at: 1.9, dur: 0.3, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
      { at: 2.6, dur: 0.3, do: 'shake', amount: 1 },
    ],
    cues: [
      { at: 0.4, say: '小豬笑笑。他抱抱你！' },
      { at: 2.2, sfx: 'whoosh' },
      { at: 2.65, sfx: 'cheer' },
    ],
  }),
}

export default scenes
