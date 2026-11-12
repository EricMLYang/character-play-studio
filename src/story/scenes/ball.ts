import { scene } from '../scene'
import type { Scenes } from './index'

// 球在樹上：楊捷睿一腳把球踢上天，掉下來卡在右邊大樹上，他跳三下都搆不到，只好等著。
// 叫象來：大象伸長脖子把球頂下來，剛好放在他頭上；叫龜來：龜爬了半天才到，他等到睡著、蜘蛛垂到頭上，
// 推一把龜反而咻一聲倒退衝出去；叫猴來：猴子盪上樹搶走球，逗他、砸他頭，最後又把球彈回樹上溜走。
// 抱完大象，大象一甩鼻子把球打上天變成月亮，或噴他一身水。
// 主角 yang（size 24 站在地上 y = 66.9）；大樹一直在右邊 x 114。等著選的樣子：他站在 x 78、think、球卡在樹上。
const G = 66.9
const BG = { top: '#8FCBF2', bottom: '#E4F4FF', floor: '#A8D978', scenery: 'hills' as const }
const tree = { id: 'tree', emoji: '🌳', x: 114, y: 52.6, size: 58 }
/** 球：在地上的高度、卡在樹上的位置、頂在他頭上的高度 */
const BALL_Y = 72.8
const STUCK = { x: 104, y: 38 }
const ON_HEAD = 56.5
const ball = (x: number, y: number, hidden = false) => ({ id: 'ball', emoji: '⚽', x, y, size: 10, pivot: 'center' as const, hidden })
/** 大象：從右邊走進來以後站在樹下 */
const ELE = { x: 122, y: 56.8 }
const elephant = (hidden = false) => ({ id: 'ele', emoji: '🐘', x: ELE.x, y: ELE.y, size: 48, hidden })
/** 抱完大象以後他站的地方（球還頂在頭上） */
const HUG_X = 92

const scenes: Scenes = {
  // 楊捷睿在打球。——帶著球跑進來，挑起來、頂在頭上彈兩下，滾回腳邊
  play: scene({
    duration: 4.6,
    bg: BG,
    actors: [tree, { id: 'yang', emoji: 'hero:yang/happy', x: 66, y: G, size: 24, hidden: true }, ball(78, BALL_Y, true)],
    moves: [
      { at: 0, actor: 'yang', do: 'enter', from: { x: -16, y: G }, dur: 1.0, ease: 'out' },
      { at: 0, actor: 'ball', do: 'enter', from: { x: -4, y: BALL_Y }, dur: 1.0, ease: 'out' },
      { at: 0, actor: 'ball', do: 'rotateTo', amount: 720, dur: 1.0, ease: 'out' },
      // 挑球
      { at: 1.15, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.25 },
      { at: 1.2, actor: 'ball', do: 'hop', amount: 16, dur: 0.5 },
      { at: 1.2, actor: 'ball', do: 'spin', times: 1, dur: 0.5 },
      { at: 1.75, actor: 'ball', do: 'moveTo', to: { x: 66, y: ON_HEAD }, arc: 10, dur: 0.45, ease: 'out' },
      { at: 2.15, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.2 },
      // 頂在頭上彈兩下
      { at: 2.3, actor: 'ball', do: 'bounce', amount: 7, times: 2, dur: 0.8 },
      { at: 2.3, actor: 'yang', do: 'hop', amount: 2, dur: 0.35 },
      { at: 2.7, actor: 'yang', do: 'hop', amount: 2, dur: 0.35 },
      // 滾下來回到腳邊
      { at: 3.25, actor: 'ball', do: 'moveTo', to: { x: 80, y: BALL_Y }, arc: 4, dur: 0.45, ease: 'in' },
      { at: 3.25, actor: 'ball', do: 'rotateTo', amount: 360, dur: 0.6 },
      { at: 3.8, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
    ],
    fx: [
      { at: 0.4, kind: 'puff', actor: 'yang', dur: 0.5 },
      { at: 2.3, kind: 'pop', actor: 'yang', emoji: '🎵', dx: 4, dur: 1.4 },
    ],
    cues: [
      { at: 0.6, say: '楊捷睿在打球。' },
      { at: 1.2, sfx: 'boing' },
      { at: 2.3, sfx: 'tap' },
      { at: 2.7, sfx: 'tap' },
    ],
  }),

  // 球飛上天！——退後蓄力，用力一踢：球咻一聲飛出畫面，他嚇一跳、追過去抬頭找
  fly: scene({
    duration: 3.8,
    bg: BG,
    actors: [tree, { id: 'yang', emoji: 'hero:yang/happy', x: 66, y: G, size: 24 }, ball(80, BALL_Y)],
    moves: [
      { at: 0.15, actor: 'yang', do: 'moveTo', to: { x: 60, y: G }, dur: 0.35 },
      { at: 0.35, actor: 'yang', do: 'squash', amount: -0.2, dur: 0.25 },
      { at: 0.55, actor: 'yang', do: 'moveTo', to: { x: 72, y: G }, dur: 0.2, ease: 'in' },
      { at: 0.75, actor: 'ball', do: 'moveTo', to: { x: 128, y: -22 }, dur: 0.6, ease: 'out' },
      { at: 0.75, actor: 'ball', do: 'spin', times: 4, dur: 0.6 },
      { at: 0.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.85, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      // 追過去，抬頭找
      { at: 1.6, actor: 'yang', do: 'moveTo', to: { x: 88, y: G }, dur: 0.6 },
      { at: 2.3, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 2.35, actor: 'yang', do: 'tilt', amount: -10, dur: 0.5 },
      { at: 2.95, actor: 'yang', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.0, actor: 'yang', do: 'tilt', amount: 10, dur: 0.5 },
    ],
    fx: [
      { at: 0.75, kind: 'burst', x: 82, y: 68, dur: 0.4 },
      { at: 0.85, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.6 },
      { at: 2.3, kind: 'pop', actor: 'yang', emoji: '❓', dur: 1.3 },
    ],
    camera: [{ at: 0.75, dur: 0.3, do: 'shake', amount: 1 }],
    cues: [
      { at: 0.75, sfx: 'whoosh' },
      { at: 0.9, say: '球飛上天了！' },
    ],
  }),

  // 球在樹上。他不高。——球從天上掉下來卡進樹裡，他跑到樹下跳三下，一次比一次用力，都搆不到
  tree: scene({
    duration: 6.2,
    bg: BG,
    actors: [tree, { id: 'yang', emoji: 'hero:yang/surprised', x: 88, y: G, size: 24 }, ball(128, -22)],
    moves: [
      { at: 0.2, actor: 'ball', do: 'moveTo', to: STUCK, dur: 0.5, ease: 'in' },
      { at: 0.2, actor: 'ball', do: 'spin', times: 2, dur: 0.5 },
      { at: 0.7, actor: 'tree', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 0.7, actor: 'ball', do: 'shake', amount: 0.8, dur: 0.5 },
      { at: 0.75, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 跑到樹下，跳三下
      { at: 1.3, actor: 'yang', do: 'moveTo', to: { x: 100, y: G }, dur: 0.5 },
      { at: 1.9, actor: 'yang', do: 'squash', amount: 0.2, dur: 0.2 },
      { at: 2.1, actor: 'yang', do: 'hop', amount: 3.5, dur: 0.45 },
      { at: 2.7, actor: 'yang', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: 2.95, actor: 'yang', do: 'hop', amount: 5, dur: 0.5 },
      { at: 3.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 3.6, actor: 'yang', do: 'squash', amount: 0.4, dur: 0.3 },
      { at: 3.9, actor: 'yang', do: 'hop', amount: 6.5, dur: 0.55 },
      // 喘一口氣，退回來想辦法
      { at: 4.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
      { at: 5.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/think' },
      { at: 5.25, actor: 'yang', do: 'moveTo', to: { x: 78, y: G }, dur: 0.55 },
    ],
    fx: [
      { at: 0.7, kind: 'burst', x: STUCK.x + 4, y: STUCK.y, emoji: '🍃', n: 7, dur: 0.8 },
      { at: 0.75, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      { at: 4.0, kind: 'pop', actor: 'yang', emoji: '💢', dur: 0.6 },
      { at: 4.6, kind: 'sweat', actor: 'yang' },
      { at: 5.5, kind: 'bubble', actor: 'yang', emoji: '⚽', dur: 0.7 },
    ],
    camera: [{ at: 0.7, dur: 0.3, do: 'shake', amount: 0.8 }],
    cues: [
      { at: 0.7, sfx: 'plop' },
      { at: 1.0, say: '球在樹上了。他太矮了！' },
      { at: 2.1, sfx: 'boing' },
      { at: 2.95, sfx: 'boing' },
      { at: 3.9, sfx: 'boing' },
    ],
  }),

  // 象好高！象給他球！——大象從右邊走進來，伸長脖子把球頂下來，在頭上彈兩下，一甩鼻子剛好放在他頭上
  'help:象': scene({
    duration: 6.2,
    bg: BG,
    actors: [tree, elephant(true), { id: 'yang', emoji: 'hero:yang/think', x: 78, y: G, size: 24 }, ball(STUCK.x, STUCK.y)],
    moves: [
      { at: 0.05, actor: 'ele', do: 'enter', from: { x: 185, y: ELE.y }, dur: 1.0, ease: 'out' },
      { at: 0.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.65, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 伸長脖子：拉長，球從樹上落到大象頭上
      { at: 1.2, actor: 'ele', do: 'squash', amount: -0.15, dur: 0.6 },
      { at: 1.2, actor: 'ele', do: 'hop', amount: 4, dur: 0.6 },
      { at: 1.45, actor: 'ball', do: 'moveTo', to: { x: 112, y: 28 }, arc: 6, dur: 0.4 },
      { at: 2.0, actor: 'ball', do: 'bounce', amount: 6, times: 2, dur: 0.8 },
      { at: 2.0, actor: 'ele', do: 'hop', amount: 2, dur: 0.3 },
      { at: 2.4, actor: 'ele', do: 'hop', amount: 2, dur: 0.3 },
      // 一甩：球飛過來，剛好停在他頭上
      { at: 2.95, actor: 'ele', do: 'tilt', amount: -14, dur: 0.5 },
      { at: 3.05, actor: 'ball', do: 'moveTo', to: { x: 78, y: ON_HEAD }, arc: 10, dur: 0.5, ease: 'out' },
      { at: 3.05, actor: 'ball', do: 'rotateTo', amount: -360, dur: 0.5 },
      { at: 3.55, actor: 'yang', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 3.6, actor: 'ball', do: 'squash', amount: 0.2, dur: 0.25 },
      { at: 3.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 4.4, actor: 'yang', do: 'hop', amount: 4, dur: 0.4 },
      { at: 4.4, actor: 'ball', do: 'hop', amount: 4, dur: 0.4 },
      { at: 4.95, actor: 'yang', do: 'hop', amount: 4, dur: 0.4 },
      { at: 4.95, actor: 'ball', do: 'hop', amount: 4, dur: 0.4 },
    ],
    fx: [
      { at: 0.65, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.6 },
      { at: 1.45, kind: 'burst', x: STUCK.x + 4, y: STUCK.y, emoji: '🍃', n: 6, dur: 0.7 },
      { at: 3.6, kind: 'burst', actor: 'ball', emoji: '✨', n: 6, dur: 0.7 },
      { at: 4.0, kind: 'pop', actor: 'ele', emoji: '😊', dx: -8, dur: 1.4 },
      { at: 4.4, kind: 'burst', actor: 'yang', emoji: '💗', n: 6, dy: 4, dur: 0.9 },
    ],
    cues: [
      { at: 0.1, sfx: 'rumble' },
      { at: 1.5, say: '象好高！象把球給他了！' },
      { at: 2.0, sfx: 'tap' },
      { at: 3.05, sfx: 'whoosh' },
      { at: 3.55, sfx: 'clink' },
      { at: 4.4, sfx: 'cheer' },
    ],
  }),

  // 龜好慢！太慢！——烏龜慢吞吞爬進來，他等到睡著、蜘蛛垂到頭上嚇醒；跑過去推一把，龜反而咻一聲倒退衝出畫面
  'help:龜': scene({
    duration: 7.8,
    bg: BG,
    actors: [
      tree,
      { id: 'turtle', emoji: '🐢', x: 26, y: 70.3, size: 16, flip: true, hidden: true },
      { id: 'yang', emoji: 'hero:yang/think', x: 78, y: G, size: 24 },
      ball(STUCK.x, STUCK.y),
      { id: 'spider', emoji: '🕷️', x: 78, y: 51, size: 8, float: true, hidden: true },
    ],
    moves: [
      { at: 0.05, actor: 'turtle', do: 'enter', from: { x: -12, y: 70.3 }, dur: 1.0, ease: 'linear' },
      { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 0.55, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      { at: 0.95, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
      // 慢……慢……
      { at: 1.1, actor: 'turtle', do: 'moveTo', to: { x: 36, y: 70.3 }, dur: 3.6, ease: 'linear' },
      { at: 1.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
      // 等到坐下來睡著
      { at: 2.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
      { at: 2.6, actor: 'spider', do: 'enter', from: { x: 78, y: -12 }, dur: 1.0, ease: 'out' },
      // 蜘蛛碰到頭：嚇醒跳起來
      { at: 3.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 3.8, actor: 'yang', do: 'hop', amount: 8, dur: 0.4 },
      { at: 3.8, actor: 'yang', do: 'shake', amount: 1.5, dur: 0.5 },
      { at: 3.85, actor: 'spider', do: 'moveTo', to: { x: 78, y: -15 }, dur: 0.4, ease: 'in' },
      // 跑過去推一把：龜咻一聲倒退衝出去
      { at: 4.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/think' },
      { at: 4.7, actor: 'yang', do: 'moveTo', to: { x: 52, y: G }, dur: 0.5, ease: 'in' },
      { at: 5.25, actor: 'yang', do: 'squash', amount: -0.2, dur: 0.25 },
      { at: 5.35, actor: 'turtle', do: 'moveTo', to: { x: -28, y: 70.3 }, dur: 0.35, ease: 'in' },
      { at: 5.35, actor: 'turtle', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
      { at: 5.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 5.45, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 呆了一下，回到樹下
      { at: 6.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/think' },
      { at: 6.4, actor: 'yang', do: 'moveTo', to: { x: 78, y: G }, dur: 0.7 },
    ],
    fx: [
      { at: 0.55, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.6 },
      { at: 1.7, kind: 'pop', actor: 'yang', emoji: '😑', dur: 0.8 },
      { at: 2.0, kind: 'sweat', actor: 'turtle' },
      { at: 2.5, kind: 'zzz', actor: 'yang', dur: 1.2 },
      { at: 2.6, kind: 'line', actor: 'spider', to: { x: 78, y: -14 }, dur: 1.65 },
      { at: 3.8, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.6 },
      { at: 5.35, kind: 'puff', actor: 'turtle', dur: 0.5 },
      { at: 5.5, kind: 'pop', actor: 'yang', emoji: '❓', dur: 0.8 },
    ],
    camera: [{ at: 3.8, dur: 0.3, do: 'shake', amount: 0.8 }],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 1.8, say: '龜好慢！太慢了！' },
      { at: 3.8, sfx: 'boing' },
      { at: 5.35, sfx: 'whoosh' },
    ],
  }),

  // 猴要玩球！他不給！——猴子盪上樹搶走球，在頭上玩、垂下來逗他，他撲空；最後球砸他頭彈回樹上，猴子溜走
  'help:猴': scene({
    duration: 7.8,
    bg: BG,
    actors: [
      tree,
      { id: 'monkey', emoji: '🐒', x: 116, y: 42, size: 18, float: true, hidden: true },
      { id: 'yang', emoji: 'hero:yang/think', x: 78, y: G, size: 24 },
      ball(STUCK.x, STUCK.y),
    ],
    moves: [
      { at: 0.05, actor: 'monkey', do: 'enter', from: { x: 175, y: 30 }, arc: 10, dur: 0.6, ease: 'out' },
      { at: 0.65, actor: 'monkey', do: 'squash', amount: 0.2, dur: 0.2 },
      { at: 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.75, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
      // 搶球，頂在自己頭上玩
      { at: 0.9, actor: 'ball', do: 'moveTo', to: { x: 116, y: 30 }, arc: 6, dur: 0.4, ease: 'out' },
      { at: 1.4, actor: 'ball', do: 'bounce', amount: 6, times: 3, dur: 1.0 },
      { at: 1.4, actor: 'monkey', do: 'bounce', amount: 2, times: 3, dur: 1.0 },
      { at: 1.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      // 他跳起來要，猴子轉過身去不給
      { at: 2.5, actor: 'yang', do: 'hop', amount: 6, dur: 0.4 },
      { at: 2.8, actor: 'monkey', do: 'flip' },
      { at: 2.8, actor: 'ball', do: 'moveTo', to: { x: 120, y: 33 }, dur: 0.2 },
      { at: 2.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      // 轉回來，把球垂下來逗他：他一撲，球又拉回去
      { at: 3.6, actor: 'monkey', do: 'flip' },
      { at: 3.7, actor: 'ball', do: 'moveTo', to: { x: 96, y: 46 }, dur: 0.5 },
      { at: 4.1, actor: 'yang', do: 'moveTo', to: { x: 90, y: G }, arc: 12, dur: 0.5, ease: 'out', anticipate: 3 },
      { at: 4.3, actor: 'ball', do: 'moveTo', to: { x: 116, y: 30 }, dur: 0.2, ease: 'out' },
      { at: 4.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
      { at: 4.7, actor: 'monkey', do: 'bounce', amount: 3, times: 3, dur: 0.9 },
      // 砸他頭，彈回樹上，猴子溜走
      { at: 5.4, actor: 'ball', do: 'moveTo', to: { x: 90, y: 60 }, arc: 4, dur: 0.3, ease: 'in' },
      { at: 5.7, actor: 'yang', do: 'squash', amount: 0.35, dur: 0.3 },
      { at: 5.72, actor: 'ball', do: 'moveTo', to: STUCK, arc: 12, dur: 0.5, ease: 'out' },
      { at: 5.72, actor: 'ball', do: 'spin', times: 2, dur: 0.5 },
      { at: 5.9, actor: 'monkey', do: 'moveTo', to: { x: 178, y: 26 }, arc: 8, dur: 0.6, ease: 'in' },
      { at: 6.55, actor: 'yang', do: 'swap', emoji: 'hero:yang/think' },
      { at: 6.65, actor: 'yang', do: 'moveTo', to: { x: 78, y: G }, dur: 0.55 },
    ],
    fx: [
      { at: 0.75, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.5 },
      { at: 1.5, kind: 'pop', actor: 'monkey', emoji: '🎵', dx: 4, dur: 0.9 },
      { at: 3.0, kind: 'pop', actor: 'yang', emoji: '💢', dur: 0.7 },
      { at: 4.6, kind: 'pop', actor: 'monkey', emoji: '😆', dx: 4, dur: 1.0 },
      { at: 4.7, kind: 'sweat', actor: 'yang' },
      { at: 5.7, kind: 'burst', actor: 'yang', n: 1, dur: 0.4 },
      { at: 5.8, kind: 'dizzy', actor: 'yang', dur: 0.8 },
      { at: 6.25, kind: 'burst', x: STUCK.x + 4, y: STUCK.y, emoji: '🍃', n: 6, dur: 0.6 },
    ],
    camera: [{ at: 5.7, dur: 0.3, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 0.2, sfx: 'whoosh' },
      { at: 1.4, say: '猴想玩他的球！不給他！' },
      { at: 4.3, sfx: 'whoosh' },
      { at: 5.7, sfx: 'bonk' },
      { at: 6.25, sfx: 'plop' },
    ],
  }),

  // 楊捷睿笑笑。他抱抱象。——頂著球跳兩下，走過去抱住大象，愛心冒出來
  thanks: scene({
    duration: 5.0,
    bg: BG,
    actors: [tree, elephant(), { id: 'yang', emoji: 'hero:yang/happy', x: 78, y: G, size: 24 }, ball(78, ON_HEAD)],
    moves: [
      { at: 0.2, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
      { at: 0.2, actor: 'ball', do: 'hop', amount: 4, dur: 0.35 },
      { at: 0.65, actor: 'yang', do: 'hop', amount: 4, dur: 0.35 },
      { at: 0.65, actor: 'ball', do: 'hop', amount: 4, dur: 0.35 },
      { at: 1.4, actor: 'yang', do: 'moveTo', to: { x: HUG_X, y: G }, dur: 0.7 },
      { at: 1.4, actor: 'ball', do: 'moveTo', to: { x: HUG_X, y: ON_HEAD }, dur: 0.7 },
      // 抱住：兩個一起往對方靠
      { at: 2.2, actor: 'yang', do: 'tilt', amount: 10, dur: 1.2 },
      { at: 2.2, actor: 'ele', do: 'tilt', amount: -8, dur: 1.2 },
      { at: 3.5, actor: 'ele', do: 'squash', amount: 0.12, dur: 0.4 },
      { at: 3.5, actor: 'yang', do: 'squash', amount: 0.12, dur: 0.4 },
      { at: 4.2, actor: 'yang', do: 'hop', amount: 3, dur: 0.35 },
      { at: 4.2, actor: 'ball', do: 'hop', amount: 3, dur: 0.35 },
      { at: 4.3, actor: 'ele', do: 'hop', amount: 2, dur: 0.35 },
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'yang', emoji: '😆', dx: -14, dur: 1.0 },
      { at: 2.3, kind: 'burst', x: 104, y: 46, emoji: '💗', n: 8, dur: 1.1 },
      { at: 3.4, kind: 'burst', x: 104, y: 42, emoji: '💖', n: 8, dur: 1.1 },
      { at: 2.5, kind: 'pop', actor: 'ele', emoji: '😊', dx: 2, dur: 1.6 },
    ],
    cues: [
      { at: 0.4, say: '楊捷睿笑了。他抱抱象。' },
      { at: 2.3, sfx: 'cheer' },
    ],
  }),

  // 象打球！球飛上天！——大象一甩鼻子，把他頭上的球打上天；天黑下來，球掛在天上變成月亮
  'again:球': scene({
    duration: 6.0,
    bg: BG,
    actors: [tree, elephant(), { id: 'yang', emoji: 'hero:yang/happy', x: HUG_X, y: G, size: 24 }, ball(HUG_X, ON_HEAD)],
    moves: [
      { at: 0.2, actor: 'ele', do: 'squash', amount: -0.2, dur: 0.3 },
      { at: 0.5, actor: 'ele', do: 'tilt', amount: -18, dur: 0.35 },
      { at: 0.5, actor: 'ele', do: 'hop', amount: 3, dur: 0.35 },
      { at: 0.6, actor: 'ball', do: 'moveTo', to: { x: 58, y: 24 }, dur: 0.7, ease: 'out' },
      { at: 0.6, actor: 'ball', do: 'spin', times: 4, dur: 0.7 },
      { at: 0.6, actor: 'ball', do: 'scaleTo', amount: 0.6, dur: 0.7, ease: 'out' },
      { at: 0.6, actor: 'yang', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 0.7, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.75, actor: 'yang', do: 'moveTo', to: { x: 84, y: G }, dur: 0.4, ease: 'out' },
      // 一起抬頭看：天黑了，球變成月亮
      { at: 1.6, actor: 'ball', do: 'shake', amount: 0.6, dur: 0.6 },
      { at: 2.4, actor: 'ball', do: 'swap', emoji: '🌙' },
      { at: 2.4, actor: 'ball', do: 'scaleTo', amount: 2.6, dur: 0.5, ease: 'back' },
      { at: 3.1, actor: 'ball', do: 'tilt', amount: 12, dur: 0.8 },
      { at: 3.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
      { at: 3.2, actor: 'yang', do: 'hop', amount: 6, dur: 0.4 },
      { at: 3.2, actor: 'ele', do: 'hop', amount: 3, dur: 0.4 },
      { at: 3.8, actor: 'yang', do: 'hop', amount: 6, dur: 0.4 },
      { at: 3.8, actor: 'ele', do: 'hop', amount: 3, dur: 0.4 },
      { at: 4.4, actor: 'yang', do: 'hop', amount: 6, dur: 0.4 },
    ],
    fx: [
      { at: 0.6, kind: 'burst', x: HUG_X, y: 46, dur: 0.4 },
      { at: 0.8, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.6 },
      { at: 2.4, kind: 'burst', x: 58, y: 24, emoji: '✨', n: 8, dur: 0.9 },
      { at: 2.8, kind: 'burst', x: 80, y: 18, emoji: '⭐', n: 6, dur: 1.4 },
      { at: 3.2, kind: 'burst', actor: 'yang', emoji: '⭐', n: 6, dur: 0.9 },
    ],
    lights: [{ at: 1.8, dur: 0.8, level: 0.5 }],
    // 月亮在左上角：鏡頭退開一點把天空也框進來
    camera: [
      { at: 0.6, dur: 0.3, do: 'shake', amount: 1 },
      { at: 1.0, dur: 0.6, do: 'zoom', amount: 1.05, to: { x: 80, y: 42 } },
    ],
    cues: [
      { at: 0.6, sfx: 'whoosh' },
      { at: 0.8, say: '象打球！球飛上天了！' },
      { at: 2.4, sfx: 'blip' },
      { at: 3.2, sfx: 'cheer' },
    ],
  }),

  // 象給他水！好冷！——大象鼻子噴出一道水柱，把他噴得往後退、球被沖掉，全身發抖打噴嚏，大象在旁邊笑
  'again:水': scene({
    duration: 6.0,
    bg: BG,
    actors: [tree, elephant(), { id: 'yang', emoji: 'hero:yang/happy', x: HUG_X, y: G, size: 24 }, ball(HUG_X, ON_HEAD)],
    moves: [
      { at: 0.2, actor: 'ele', do: 'squash', amount: -0.25, dur: 0.5 },
      { at: 0.75, actor: 'ele', do: 'tilt', amount: -10, dur: 1.4 },
      { at: 0.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 0.85, actor: 'yang', do: 'moveTo', to: { x: 74, y: G }, dur: 0.8, ease: 'out' },
      { at: 0.85, actor: 'ball', do: 'moveTo', to: { x: 50, y: BALL_Y }, arc: 12, dur: 0.7, ease: 'out' },
      { at: 0.85, actor: 'ball', do: 'rotateTo', amount: -540, dur: 0.9 },
      { at: 1.0, actor: 'yang', do: 'shake', amount: 1.2, dur: 1.0 },
      // 好冷：抖、抖得更厲害、打噴嚏
      { at: 2.3, actor: 'yang', do: 'shake', amount: 2.2, dur: 1.2 },
      { at: 3.6, actor: 'yang', do: 'squash', amount: -0.3, dur: 0.35 },
      { at: 3.95, actor: 'yang', do: 'squash', amount: 0.45, dur: 0.3 },
      { at: 3.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/dizzy' },
      { at: 4.0, actor: 'ele', do: 'hop', amount: 3, dur: 0.35 },
      { at: 4.4, actor: 'ele', do: 'hop', amount: 3, dur: 0.35 },
      { at: 4.6, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
      { at: 4.65, actor: 'yang', do: 'shake', amount: 1.2, dur: 0.5 },
      // 回馬槍：再噴一下
      { at: 5.0, actor: 'ele', do: 'tilt', amount: -8, dur: 0.6 },
      { at: 5.1, actor: 'yang', do: 'hop', amount: 6, dur: 0.4 },
    ],
    fx: [
      { at: 0.25, kind: 'pop', actor: 'ele', emoji: '💧', dx: -8, dur: 0.6 },
      { at: 0.8, kind: 'line', actor: 'ele', dx: -17, dy: 4, target: 'yang', color: '#5DB8F5', width: 3, dur: 1.4 },
      { at: 0.9, kind: 'burst', actor: 'yang', emoji: '💦', n: 8, dy: 10, dur: 0.8 },
      { at: 1.6, kind: 'burst', actor: 'yang', emoji: '💦', n: 8, dy: 10, dur: 0.8 },
      { at: 2.2, kind: 'rain', actor: 'yang', emoji: '💧', n: 6, dur: 1.6 },
      { at: 2.4, kind: 'pop', actor: 'yang', emoji: '🥶', dur: 1.4 },
      { at: 3.95, kind: 'burst', actor: 'yang', emoji: '💦', n: 8, dy: 8, dur: 0.7 },
      { at: 4.0, kind: 'pop', actor: 'ele', emoji: '😆', dx: -8, dur: 1.4 },
      { at: 5.0, kind: 'line', actor: 'ele', dx: -17, dy: 4, target: 'yang', color: '#5DB8F5', width: 3, dur: 0.5 },
      { at: 5.1, kind: 'burst', actor: 'yang', emoji: '💦', n: 8, dy: 10, dur: 0.7 },
    ],
    camera: [{ at: 3.95, dur: 0.3, do: 'shake', amount: 1 }],
    cues: [
      { at: 0.8, sfx: 'splash' },
      { at: 1.2, say: '象給他水！好冷的水！' },
      { at: 3.95, sfx: 'achoo' },
      { at: 5.0, sfx: 'splash' },
    ],
  }),
}

export default scenes
