import { scene } from '../scene'
import type { Fx, Move } from '../../anim/clip'
import type { Scenes } from './index'

// 小老鼠偷吃：右邊桌上有一個閃亮亮的大蛋糕，忍者小老鼠從左邊探頭、流口水，才發現中間地上睡著一隻大貓。
// 爬：踮腳從貓鼻子前面溜過去，貓抬一下頭，他整隻定住冒汗，最後跳上桌；跑：腳步聲太大，貓醒來一吼，他逃出畫面、
// 再偷偷探頭回來；跳：蓄力大跳想跳過貓，咚一聲落在貓頭上，兩個對看一拍，被甩回左邊轉圈頭暈。
// 他正要咬蛋糕，貓夢到蛋糕醒來，走到桌邊盯著。給甜的：丟一塊蛋糕給貓，貓吃了冒愛心；給酸的：檸檬一咬整隻炸毛彈上天；
// 給苦的：一杯苦茶喝下去臉慢慢變綠、轉圈四腳朝天再爬起來。最後他把蛋糕舉下桌，切兩半，跟貓一人一半吃光、摸著肚子。
// 主角 mouse（size 24 站在地上 y = 66.9），圖朝左：在左邊看右邊要 flip。
// 共用的站位：桌子 x 124（size 46，桌面在 y 40～55），蛋糕在桌面上 x 128；大貓（🐈 size 38）睡在 x 70，
// 睡著時壓扁、頭往下低（napNow，每一段開頭用 dur 0 補回來）。等他選「怎麼過去」：他站在 x 28 想辦法；
// 等他選「給貓吃什麼」：他在桌上 x 110（蛋糕左邊、面向貓），貓站起來在桌邊 x 88、面向右。
// 貓的表情（🙀😾😻🤢）不跟著貓的頭頂（那是尾巴尖），寫死在貓背上方的空位（catFace）。
const G = 66.9
const BG = { top: '#CFE8F2', bottom: '#ECF7FB', floor: '#9DB6CB', scenery: 'room' as const }

/** 桌子與蛋糕：不呼吸（float），蛋糕才穩穩貼在桌面上 */
const table = { id: 'table', emoji: 'prop:table', x: 124, y: 57.7, size: 46, float: true }
const CAKE = { x: 128, y: 40.9, size: 22 }
const cake = { id: 'cake', emoji: 'prop:cake', ...CAKE, float: true, pivot: 'center' as const }

/** 大貓：睡在老鼠與桌子中間；醒了站到桌邊 */
const CAT_S = 38
const CAT_Y = 77 - 0.42 * CAT_S
const CAT_X = 70
const CAT_TABLE = 88
/** 睡著：壓成寬扁（NAP 倍）、頭往下低 NAP_TILT 度 */
const NAP = 1.35
const NAP_TILT = 6
const sleepingCat = { id: 'cat', emoji: '🐈', x: CAT_X, y: CAT_Y, size: CAT_S }
const napNow: Move[] = [
  { at: 0, actor: 'cat', do: 'stretchTo', amount: NAP, dur: 0 },
  { at: 0, actor: 'cat', do: 'rotateTo', amount: -NAP_TILT, dur: 0 },
]
const wakeUp = (at: number, dur = 0.25): Move[] => [
  { at, actor: 'cat', do: 'stretchTo', amount: 1 / NAP, dur, ease: 'back' },
  { at, actor: 'cat', do: 'rotateTo', amount: NAP_TILT, dur },
]
const fallAsleep = (at: number, dur = 0.5): Move[] => [
  { at, actor: 'cat', do: 'stretchTo', amount: NAP, dur },
  { at, actor: 'cat', do: 'rotateTo', amount: -NAP_TILT, dur },
]
/** 醒著站在桌邊、面向右（等他選「給貓吃什麼」） */
const standingCat = { id: 'cat', emoji: '🐈', x: CAT_TABLE, y: CAT_Y, size: CAT_S, flip: true }
/** 站在桌邊時的嘴巴：丟過去的東西飛到這裡 */
const CAT_MOUTH = { x: 103, y: 55 }
/** 貓的表情冒在哪裡：睡覺的地方（臉朝左）、桌邊（臉朝右）、一起吃蛋糕時 */
const FACE_NAP = { x: 60, y: 50 }
const FACE_TABLE = { x: 80, y: 34 }
const FACE_SHARE = { x: 62, y: 52 }
const catFace = (at: number, emoji: string, where: { x: number; y: number }, dur = 1.2, scale = 1.5): Fx =>
  ({ at, kind: 'pop', x: where.x, y: where.y, emoji, scale, dur })

/** 他等著選「怎麼過去」的地方 */
const WAIT_X = 28
/** 桌面上：蛋糕左邊站的地方 */
const ON_TABLE = { x: 110, y: 38.4 }
/** 貓趴著時頭頂的位置（跳那一段落在這裡）、站起來以後頭頂的位置 */
const HEAD_NAP = { x: 56, y: 46.2 }
const HEAD_UP = { x: 59, y: 38.2 }
/** 一起吃蛋糕：貓往後跳到 x 56 讓位，蛋糕放在地上 x 79，他站在 x 100（桌子左邊） */
const SHARE_CAT_X = 56
const FLOOR_CAKE = { x: 79, y: 67 }
const SHARE_X = 100

/** 貓睡覺的 💤，從 from 到 to 每 1.6 秒一串 */
function zzz(from: number, to: number): Fx[] {
  const out: Fx[] = []
  for (let t = from; t < to - 0.4; t += 1.6) out.push({ at: t, kind: 'zzz', actor: 'cat', emoji: '💤', dx: -10, dy: 4, scale: 1.4, dur: Math.min(1.5, to - t) })
  return out
}

/** 踮腳偷溜：一步一小跳，從 x0 走到 x1 */
function tiptoe(at: number, x0: number, x1: number, steps: number, stepDur = 0.36): Move[] {
  const out: Move[] = []
  for (let i = 0; i < steps; i++) {
    const t = at + i * stepDur
    const x = x0 + ((x1 - x0) * (i + 1)) / steps
    out.push({ at: t, actor: 'mouse', do: 'moveTo', to: { x, y: G }, dur: stepDur * 0.9, ease: 'inOut' })
    out.push({ at: t, actor: 'mouse', do: 'hop', amount: 1.6, dur: stepDur * 0.9 })
  }
  return out
}

/** 咬一口：吃的人往前一壓，那半塊蛋糕變小（k 是剩下的比例，0 就吃光） */
function bite(at: number, who: 'cat' | 'mouse', piece: 'cake' | 'cakeR', k: number): Move[] {
  const out: Move[] = [{ at, actor: who, do: 'squash', amount: 0.18, dur: 0.25 }]
  if (who === 'mouse') out.push({ at, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' })
  if (who === 'cat') out.push({ at, actor: 'cat', do: 'moveTo', to: { x: SHARE_CAT_X + 3, y: CAT_Y }, dur: 0.12 }, { at: at + 0.15, actor: 'cat', do: 'moveTo', to: { x: SHARE_CAT_X, y: CAT_Y }, dur: 0.15 })
  out.push(k > 0
    ? { at: at + 0.08, actor: piece, do: 'scaleTo', amount: k, dur: 0.12 }
    : { at: at + 0.08, actor: piece, do: 'vanish', dur: 0.15 })
  return out
}

const scenes: Scenes = {
  // 桌上有一個大蛋糕。——鏡頭先貼著閃亮亮的蛋糕，退開來看到地上睡著一隻大貓，最後小老鼠從左邊探頭
  table: scene({
    duration: 4.8,
    bg: BG,
    actors: [table, cake, sleepingCat, { id: 'mouse', emoji: 'hero:mouse/peek', x: WAIT_X - 4, y: G, size: 24, flip: true, hidden: true }],
    moves: [
      ...napNow,
      { at: 0.5, actor: 'cake', do: 'hop', amount: 1.5, dur: 0.35 },
      { at: 1.5, actor: 'cake', do: 'squash', amount: -0.08, dur: 0.4 },
      { at: 2.4, actor: 'cake', do: 'hop', amount: 1.5, dur: 0.35 },
      { at: 3.2, actor: 'mouse', do: 'enter', from: { x: -14, y: G }, dur: 0.7, ease: 'out' },
      { at: 4.0, actor: 'mouse', do: 'hop', amount: 2, dur: 0.25 },
    ],
    fx: [
      { at: 0.4, kind: 'burst', actor: 'cake', emoji: '✨', n: 7, dy: 4, dur: 0.9 },
      { at: 1.5, kind: 'burst', actor: 'cake', emoji: '✨', n: 6, dy: 4, dur: 0.9 },
      { at: 2.4, kind: 'burst', actor: 'cake', emoji: '✨', n: 6, dy: 4, dur: 0.9 },
      ...zzz(2.6, 4.8),
      { at: 4.0, kind: 'pop', actor: 'mouse', emoji: '✨', dx: 3, dur: 0.8 },
    ],
    camera: [
      { at: 0, dur: 0.6, do: 'zoom', amount: 1.6, to: { x: 128, y: 40 } },
      // 退開成全景（1.05 擋住自動取景，最後一格桌子、貓、他都看得到）
      { at: 2.6, dur: 0.9, do: 'zoom', amount: 1.05, to: { x: 80, y: 46 } },
    ],
    cues: [
      { at: 0.4, sfx: 'blip' },
      { at: 0.6, say: '桌上有一個大蛋糕。' },
      { at: 3.3, sfx: 'slide' },
    ],
  }),

  // 小老鼠想偷吃。貓在睡。——流口水、衝出去，才看到中間睡著一隻大貓，嚇得跳起來、退回來想辦法（鏡頭拉開，蛋糕一直看得到）
  cat: scene({
    duration: 5.0,
    bg: BG,
    actors: [table, cake, sleepingCat, { id: 'mouse', emoji: 'hero:mouse/peek', x: WAIT_X - 4, y: G, size: 24, flip: true }],
    moves: [
      ...napNow,
      { at: 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/drool' },
      { at: 0.5, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
      { at: 0.9, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
      { at: 0.9, actor: 'cake', do: 'hop', amount: 1.5, dur: 0.3 },
      // 衝出去……急煞車
      { at: 1.35, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
      { at: 1.4, actor: 'mouse', do: 'moveTo', to: { x: 40, y: G }, dur: 0.35, ease: 'in', anticipate: 3 },
      { at: 1.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: 1.8, actor: 'mouse', do: 'hop', amount: 7, dur: 0.4 },
      // 貓翻一下身（還在睡）
      { at: 2.3, actor: 'cat', do: 'squash', amount: 0.08, dur: 0.6 },
      // 退回來、抖一抖，想辦法
      { at: 2.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
      { at: 2.45, actor: 'mouse', do: 'moveTo', to: { x: WAIT_X, y: G }, dur: 0.45, ease: 'out' },
      { at: 2.95, actor: 'mouse', do: 'shake', amount: 1, dur: 0.6 },
      { at: 3.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    ],
    fx: [
      { at: 0.3, kind: 'bubble', actor: 'mouse', emoji: '🍰', dur: 1.0 },
      { at: 0.9, kind: 'burst', actor: 'cake', emoji: '✨', n: 5, dy: 4, dur: 0.7 },
      { at: 1.8, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.6 },
      ...zzz(0.2, 5.0),
      { at: 2.9, kind: 'sweat', actor: 'mouse' },
      { at: 3.9, kind: 'pop', actor: 'mouse', emoji: '❓', dur: 1.0 },
    ],
    camera: [
      { at: 0, dur: 0.5, do: 'zoom', amount: 1.15, to: { x: 82, y: 50 } },
      { at: 1.8, dur: 0.3, do: 'shake', amount: 0.6 },
    ],
    cues: [
      { at: 0.4, say: '小老鼠想偷吃。貓在睡。' },
      { at: 1.4, sfx: 'whoosh' },
      { at: 1.8, sfx: 'boing' },
    ],
  }),

  // 慢慢爬，貓沒聽到。——踮腳從貓鼻子前面溜過去，貓抬一下頭，他整隻定住冒汗；貓又睡了，他溜到桌邊跳上去
  'cross:爬': scene({
    duration: 6.5,
    bg: BG,
    actors: [table, cake, sleepingCat, { id: 'mouse', emoji: 'hero:mouse/ponder', x: WAIT_X, y: G, size: 24, flip: true }],
    moves: [
      ...napNow,
      { at: 0.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/sneak' },
      ...tiptoe(0.35, WAIT_X, 40, 2),
      // 走到貓鼻子前面，貓抬一下頭：定住！
      { at: 1.2, actor: 'cat', do: 'squash', amount: -0.18, dur: 1.0 },
      { at: 1.25, actor: 'cat', do: 'shake', amount: 0.7, dur: 0.35 },
      { at: 1.3, actor: 'mouse', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 1.5, actor: 'mouse', do: 'shake', amount: 0.5, dur: 0.9 },
      // 貓沒醒，繼續溜
      ...tiptoe(2.5, 40, 96, 7),
      // 跳上桌
      { at: 5.15, actor: 'mouse', do: 'squash', amount: 0.25, dur: 0.2 },
      { at: 5.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
      { at: 5.3, actor: 'mouse', do: 'moveTo', to: ON_TABLE, arc: 10, dur: 0.45, ease: 'out' },
      { at: 5.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/smug' },
    ],
    fx: [
      ...zzz(0.2, 1.15),
      { at: 1.25, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.5 },
      { at: 1.45, kind: 'sweat', actor: 'mouse' },
      { at: 1.85, kind: 'sweat', actor: 'mouse', dx: 3 },
      ...zzz(2.3, 6.5),
      { at: 5.85, kind: 'burst', actor: 'cake', emoji: '✨', n: 6, dy: 4, dur: 0.8 },
    ],
    cues: [
      { at: 0.9, say: '慢慢爬，貓沒聽到。' },
      { at: 5.3, sfx: 'boing' },
    ],
  }),

  // 貓聽到了！快回去！——咚咚咚衝過去，貓醒來一吼，他逃出畫面；貓打個哈欠睡回去，他偷偷探頭回來
  'cross:跑': scene({
    duration: 5.6,
    bg: BG,
    actors: [table, cake, sleepingCat, { id: 'mouse', emoji: 'hero:mouse/ponder', x: WAIT_X, y: G, size: 24, flip: true }],
    moves: [
      ...napNow,
      { at: 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dash' },
      { at: 0.2, actor: 'mouse', do: 'moveTo', to: { x: 42, y: G }, dur: 0.5, ease: 'in', anticipate: 3 },
      // 貓醒了：站起來
      ...wakeUp(0.75, 0.2),
      { at: 0.75, actor: 'cat', do: 'hop', amount: 4, dur: 0.3 },
      { at: 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: 0.8, actor: 'mouse', do: 'hop', amount: 5, dur: 0.3 },
      // 一吼
      { at: 1.3, actor: 'cat', do: 'squash', amount: -0.15, dur: 0.25 },
      { at: 1.55, actor: 'cat', do: 'moveTo', to: { x: CAT_X - 5, y: CAT_Y }, dur: 0.15, ease: 'out' },
      { at: 1.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flee' },
      { at: 1.6, actor: 'mouse', do: 'moveTo', to: { x: -16, y: G }, dur: 0.5, ease: 'in' },
      // 貓打個大哈欠、退回原位睡回去
      { at: 2.3, actor: 'cat', do: 'moveTo', to: { x: CAT_X, y: CAT_Y }, dur: 0.4 },
      { at: 2.8, actor: 'cat', do: 'squash', amount: -0.15, dur: 0.7 },
      ...fallAsleep(3.4),
      // 他偷偷探頭回來
      { at: 3.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/peek' },
      { at: 3.6, actor: 'mouse', do: 'moveTo', to: { x: WAIT_X, y: G }, dur: 0.7, ease: 'out' },
      { at: 4.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
    ],
    fx: [
      { at: 0.3, kind: 'puff', actor: 'mouse', dur: 0.4 },
      { at: 0.5, kind: 'puff', actor: 'mouse', dur: 0.4 },
      catFace(0.8, '🙀', FACE_NAP, 0.6),
      { at: 0.85, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.5 },
      catFace(1.35, '😾', FACE_NAP, 0.9),
      { at: 1.5, kind: 'blow', actor: 'cat', dx: -16, dy: 10, target: 'mouse', scale: 1.5, dur: 0.6 },
      { at: 1.55, kind: 'burst', actor: 'mouse', emoji: '💦', n: 5, dur: 0.5 },
      { at: 2.85, kind: 'blow', actor: 'cat', dx: -16, dy: 10, to: { x: 30, y: 50 }, dur: 0.6 },
      ...zzz(3.8, 5.6),
      { at: 4.3, kind: 'sweat', actor: 'mouse' },
    ],
    camera: [{ at: 1.5, dur: 0.4, do: 'shake', amount: 1.6 }],
    cues: [
      { at: 0.25, sfx: 'tap' },
      { at: 0.38, sfx: 'tap' },
      { at: 0.51, sfx: 'tap' },
      { at: 0.64, sfx: 'tap' },
      { at: 0.75, say: '貓聽到了！快回去！' },
      { at: 1.5, sfx: 'rumble' },
      { at: 1.6, sfx: 'whoosh' },
    ],
  }),

  // 他跳到貓的頭上了！——蓄力大跳，不夠遠，咚一聲落在貓頭上；貓醒來，兩個對看一拍，貓一甩把他甩回左邊轉圈頭暈
  'cross:跳': scene({
    duration: 6.4,
    bg: BG,
    actors: [table, cake, sleepingCat, { id: 'mouse', emoji: 'hero:mouse/ponder', x: WAIT_X, y: G, size: 24, flip: true }],
    moves: [
      ...napNow,
      // 蓄力
      { at: 0.05, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/stance' },
      { at: 0.25, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.55 },
      { at: 0.3, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.45 },
      // 跳！不夠遠：咚
      { at: 0.8, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/jump' },
      { at: 0.8, actor: 'mouse', do: 'moveTo', to: HEAD_NAP, arc: 22, dur: 0.6, ease: 'linear' },
      { at: 0.8, actor: 'mouse', do: 'spin', times: 1, dur: 0.5, pivot: 'center' },
      { at: 1.4, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: 1.4, actor: 'mouse', do: 'squash', amount: 0.3, dur: 0.25 },
      { at: 1.4, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.3 },
      // 貓醒來站起來，他還站在頭上
      ...wakeUp(1.85),
      { at: 1.85, actor: 'mouse', do: 'moveTo', to: HEAD_UP, dur: 0.25, ease: 'back' },
      // 對看一拍：他低頭傻笑
      { at: 2.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
      // 一甩：轉圈飛回左邊
      { at: 3.4, actor: 'cat', do: 'shake', amount: 2.5, dur: 0.35 },
      { at: 3.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/flee' },
      { at: 3.5, actor: 'mouse', do: 'moveTo', to: { x: 20, y: G }, arc: 16, dur: 0.75, ease: 'out' },
      { at: 3.5, actor: 'mouse', do: 'spin', times: 3, dur: 0.75, pivot: 'center' },
      { at: 4.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/dizzy' },
      // 貓打哈欠睡回去
      { at: 4.3, actor: 'cat', do: 'squash', amount: -0.15, dur: 0.6 },
      ...fallAsleep(4.8),
      // 甩甩頭，走回來想辦法
      { at: 5.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/ponder' },
      { at: 5.25, actor: 'mouse', do: 'moveTo', to: { x: WAIT_X, y: G }, dur: 0.5 },
    ],
    fx: [
      ...zzz(0.2, 1.4),
      { at: 0.3, kind: 'puff', actor: 'mouse', dur: 0.4 },
      { at: 1.4, kind: 'burst', x: HEAD_NAP.x, y: HEAD_NAP.y - 2, n: 1, dur: 0.35 },
      catFace(1.9, '🙀', { x: 76, y: 44 }, 0.8, 1.3),
      { at: 2.0, kind: 'sweat', actor: 'mouse' },
      catFace(2.75, '😾', { x: 76, y: 44 }, 0.8, 1.3),
      { at: 3.45, kind: 'swoosh', actor: 'cat', target: 'mouse', dx: -8, dy: 2, n: 12, dur: 0.3 },
      { at: 4.3, kind: 'dizzy', actor: 'mouse', dur: 0.9 },
      { at: 4.35, kind: 'blow', actor: 'cat', dx: -16, dy: 10, to: { x: 36, y: 50 }, dur: 0.6 },
      ...zzz(5.2, 6.4),
    ],
    camera: [
      { at: 1.4, dur: 0.3, do: 'shake', amount: 1.2 },
      // 對看那一拍：框住貓頭和頭上的他
      { at: 1.9, dur: 0.4, do: 'zoom', amount: 1.5, to: { x: 64, y: 46 } },
      { at: 3.4, dur: 0.4, do: 'zoom', amount: 1 },
      { at: 4.25, dur: 0.3, do: 'shake', amount: 1 },
    ],
    cues: [
      { at: 0.8, sfx: 'boing' },
      { at: 1.4, sfx: 'bonk' },
      { at: 1.5, say: '他跳到貓的頭上了！' },
      { at: 3.45, sfx: 'whoosh' },
      { at: 4.25, sfx: 'plop' },
    ],
  }),

  // 貓起來了！貓也想吃！——他張嘴要咬蛋糕，貓夢到蛋糕、醒來，走到桌邊流口水盯著，他嚇得發抖
  wake: scene({
    duration: 5.0,
    bg: BG,
    actors: [table, cake, sleepingCat, { id: 'mouse', emoji: 'hero:mouse/smug', x: ON_TABLE.x, y: ON_TABLE.y, size: 24, flip: true }],
    moves: [
      ...napNow,
      { at: 0.2, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/eat' },
      { at: 0.3, actor: 'mouse', do: 'squash', amount: -0.15, dur: 0.4 },
      // 貓聞到了
      { at: 0.9, actor: 'cat', do: 'hop', amount: 1.5, dur: 0.3 },
      ...wakeUp(1.3),
      { at: 1.3, actor: 'cat', do: 'hop', amount: 4, dur: 0.35 },
      { at: 1.75, actor: 'cat', do: 'flip' },
      { at: 2.0, actor: 'cat', do: 'moveTo', to: { x: CAT_TABLE, y: CAT_Y }, dur: 0.8 },
      // 他發現了：轉過來、發抖
      { at: 1.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: 1.5, actor: 'mouse', do: 'hop', amount: 3, dur: 0.3 },
      { at: 2.3, actor: 'mouse', do: 'flip' },
      { at: 2.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
      { at: 2.9, actor: 'cat', do: 'hop', amount: 2.5, dur: 0.3 },
      { at: 3.0, actor: 'mouse', do: 'shake', amount: 0.9, dur: 1.0 },
      { at: 3.7, actor: 'cat', do: 'tilt', amount: 8, dur: 0.6 },
    ],
    fx: [
      ...zzz(0.2, 1.2),
      { at: 0.6, kind: 'bubble', actor: 'cat', emoji: '🍰', dx: -6, dur: 0.75 },
      catFace(1.35, '❗', FACE_NAP, 0.5, 1),
      { at: 1.5, kind: 'pop', actor: 'mouse', emoji: '❗', dur: 0.5 },
      catFace(2.85, '😼', FACE_TABLE, 2.0, 1.4),
      { at: 3.1, kind: 'sweat', actor: 'mouse' },
    ],
    cues: [
      { at: 1.3, sfx: 'boing' },
      { at: 1.4, say: '貓起來了！貓也想吃！' },
    ],
  }),

  // 甜甜的蛋糕！貓笑了。——蛋糕旁邊啵一聲多一塊小蛋糕，他丟給貓，貓一口接住、嚼兩下，冒出愛心眼
  'feed:甜': scene({
    duration: 4.4,
    bg: BG,
    actors: [
      table, cake, standingCat,
      { id: 'mouse', emoji: 'hero:mouse/scared', x: ON_TABLE.x, y: ON_TABLE.y, size: 24 },
      { id: 'slice', emoji: '🍰', x: 104, y: 30, size: 10, hidden: true, pivot: 'center' as const },
    ],
    moves: [
      { at: 0.2, actor: 'slice', do: 'pop', dur: 0.3 },
      { at: 0.25, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
      { at: 0.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/throw' },
      { at: 0.65, actor: 'slice', do: 'moveTo', to: CAT_MOUTH, arc: 8, dur: 0.45 },
      { at: 0.65, actor: 'slice', do: 'spin', times: -1, dur: 0.45 },
      { at: 1.1, actor: 'slice', do: 'vanish', dur: 0.1 },
      { at: 1.1, actor: 'cat', do: 'squash', amount: 0.2, dur: 0.25 },
      { at: 1.45, actor: 'cat', do: 'squash', amount: 0.15, dur: 0.25 },
      // 好甜：跳一下、左右搖
      { at: 1.9, actor: 'cat', do: 'hop', amount: 5, dur: 0.4 },
      { at: 2.4, actor: 'cat', do: 'tilt', amount: -8, dur: 0.5 },
      { at: 2.9, actor: 'cat', do: 'tilt', amount: 8, dur: 0.5 },
      { at: 2.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
      { at: 2.3, actor: 'mouse', do: 'hop', amount: 4, dur: 0.35 },
      { at: 2.8, actor: 'mouse', do: 'hop', amount: 4, dur: 0.35 },
    ],
    fx: [
      { at: 0.2, kind: 'burst', actor: 'slice', emoji: '✨', n: 6, dur: 0.6 },
      { at: 1.15, kind: 'burst', x: CAT_MOUTH.x, y: CAT_MOUTH.y, emoji: '🍓', n: 4, dur: 0.5 },
      catFace(1.9, '😻', FACE_TABLE, 2.2, 1.6),
      { at: 2.1, kind: 'burst', x: FACE_TABLE.x, y: FACE_TABLE.y + 6, emoji: '💗', n: 8, dur: 1.0 },
      { at: 3.0, kind: 'burst', x: FACE_TABLE.x, y: FACE_TABLE.y + 6, emoji: '💕', n: 6, dur: 1.0 },
    ],
    cues: [
      { at: 0.2, sfx: 'poof' },
      { at: 0.65, sfx: 'whoosh' },
      { at: 1.1, sfx: 'gulp' },
      { at: 1.45, sfx: 'gulp' },
      { at: 0.8, say: '甜甜的蛋糕！貓笑了。' },
      { at: 2.1, sfx: 'cheer' },
    ],
  }),

  // 好酸！貓的毛都起來了！——他丟一顆檸檬，貓一咬：整隻炸毛、變大、彈上半空；落地還在抖，毛慢慢消下去
  'feed:酸': scene({
    duration: 5.0,
    bg: BG,
    actors: [
      table, cake, standingCat,
      { id: 'mouse', emoji: 'hero:mouse/scared', x: ON_TABLE.x, y: ON_TABLE.y, size: 24 },
      { id: 'lemon', emoji: 'prop:lemon', x: 104, y: 30, size: 11, hidden: true, pivot: 'center' as const },
    ],
    moves: [
      { at: 0.2, actor: 'lemon', do: 'pop', dur: 0.3 },
      { at: 0.55, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/throw' },
      { at: 0.6, actor: 'lemon', do: 'moveTo', to: CAT_MOUTH, arc: 8, dur: 0.4 },
      { at: 0.6, actor: 'lemon', do: 'spin', times: -1, dur: 0.4 },
      // 喀！咬一口
      { at: 1.0, actor: 'cat', do: 'squash', amount: 0.15, dur: 0.2 },
      { at: 1.05, actor: 'lemon', do: 'swap', emoji: 'prop:lemon-bite' },
      // 炸毛：一瞬間變大、拉高、抖、彈上天
      { at: 1.3, actor: 'cat', do: 'scaleTo', amount: 1.3, dur: 0.12, ease: 'back' },
      { at: 1.3, actor: 'cat', do: 'shake', amount: 2.6, dur: 0.6 },
      { at: 1.3, actor: 'cat', do: 'hop', amount: 14, dur: 0.6 },
      { at: 1.3, actor: 'lemon', do: 'moveTo', to: { x: 66, y: 71 }, arc: 6, dur: 0.45, ease: 'in' },
      { at: 1.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      { at: 1.3, actor: 'mouse', do: 'hop', amount: 4, dur: 0.3 },
      { at: 1.95, actor: 'cat', do: 'squash', amount: -0.15, dur: 1.2 },
      { at: 1.95, actor: 'cat', do: 'shake', amount: 1.4, dur: 1.2 },
      { at: 2.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
      // 毛消下去，檸檬滾走
      { at: 3.3, actor: 'cat', do: 'scaleTo', amount: 1 / 1.3, dur: 0.5 },
      { at: 3.0, actor: 'lemon', do: 'moveTo', to: { x: -14, y: 71 }, dur: 0.8, ease: 'in' },
      { at: 3.0, actor: 'lemon', do: 'rotateTo', amount: -540, dur: 0.8, ease: 'in' },
      { at: 4.1, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    ],
    fx: [
      { at: 0.2, kind: 'burst', actor: 'lemon', emoji: '✨', n: 5, dur: 0.5 },
      { at: 1.05, kind: 'burst', x: CAT_MOUTH.x, y: CAT_MOUTH.y, emoji: '💦', n: 5, dur: 0.5 },
      { at: 1.3, kind: 'burst', x: CAT_TABLE, y: 44, emoji: '⚡', n: 10, scale: 1.5, dur: 0.8 },
      { at: 1.3, kind: 'burst', x: CAT_MOUTH.x, y: CAT_MOUTH.y - 4, n: 1, scale: 1.4, dur: 0.4 },
      { at: 2.0, kind: 'burst', x: CAT_TABLE, y: 48, emoji: '⚡', n: 8, scale: 1.2, dur: 0.8 },
      catFace(1.5, '🙀', FACE_TABLE, 1.8, 1.6),
      { at: 3.3, kind: 'sweat', actor: 'cat', dx: 10 },
    ],
    camera: [{ at: 1.3, dur: 0.4, do: 'shake', amount: 2 }],
    cues: [
      { at: 0.2, sfx: 'poof' },
      { at: 0.6, sfx: 'whoosh' },
      { at: 1.0, sfx: 'crack' },
      { at: 1.3, sfx: 'boing' },
      { at: 1.4, say: '好酸！貓的毛都起來了！' },
    ],
  }),

  // 好苦！貓的臉綠了！——他推一杯茶下去，貓咕嚕喝光，愣住……整隻一點一點變綠、慢慢垮下去，轉一圈四腳朝天，再搖搖晃晃爬起來
  'feed:苦': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      table, cake, standingCat,
      { id: 'mouse', emoji: 'hero:mouse/scared', x: ON_TABLE.x, y: ON_TABLE.y, size: 24 },
      { id: 'tea', emoji: '🍵', x: 104, y: 43, size: 12, hidden: true },
    ],
    moves: [
      { at: 0.2, actor: 'tea', do: 'pop', dur: 0.3 },
      { at: 0.5, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/push' },
      { at: 0.6, actor: 'tea', do: 'moveTo', to: { x: CAT_MOUTH.x + 1, y: CAT_MOUTH.y - 2 }, dur: 0.4, arc: 3 },
      { at: 1.0, actor: 'tea', do: 'tilt', amount: 40, dur: 0.6 },
      { at: 1.0, actor: 'cat', do: 'squash', amount: 0.12, dur: 0.25 },
      { at: 1.3, actor: 'cat', do: 'squash', amount: 0.12, dur: 0.25 },
      { at: 1.6, actor: 'tea', do: 'vanish', dur: 0.15 },
      { at: 1.0, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/idle' },
      // 愣住……慢慢變綠、慢慢垮下來
      { at: 1.9, actor: 'cat', do: 'tint', filter: 'hue-rotate(20deg)' },
      { at: 2.15, actor: 'cat', do: 'tint', filter: 'hue-rotate(40deg) saturate(1.1)' },
      { at: 2.4, actor: 'cat', do: 'tint', filter: 'hue-rotate(60deg) saturate(1.2)' },
      { at: 2.65, actor: 'cat', do: 'tint', filter: 'hue-rotate(80deg) saturate(1.3)' },
      { at: 2.9, actor: 'cat', do: 'tint', filter: 'hue-rotate(95deg) saturate(1.4)' },
      { at: 2.0, actor: 'cat', do: 'squash', amount: 0.25, dur: 1.2 },
      { at: 2.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/surprised' },
      // 轉一圈，四腳朝天
      { at: 3.5, actor: 'cat', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
      { at: 4.1, actor: 'cat', do: 'rotateTo', amount: 180, dur: 0.35, ease: 'in', pivot: 'center' },
      { at: 4.3, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/giggle' },
      { at: 4.6, actor: 'cat', do: 'shake', amount: 0.6, dur: 0.4 },
      // 搖搖晃晃爬起來，顏色退回去
      { at: 5.0, actor: 'cat', do: 'rotateTo', amount: -180, dur: 0.4, ease: 'back', pivot: 'center' },
      { at: 5.1, actor: 'cat', do: 'tint', filter: 'hue-rotate(50deg)' },
      { at: 5.3, actor: 'cat', do: 'tint', filter: '' },
      { at: 5.45, actor: 'cat', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 5.9, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/scared' },
    ],
    fx: [
      { at: 0.2, kind: 'burst', actor: 'tea', emoji: '✨', n: 5, dur: 0.5 },
      catFace(2.3, '🤢', FACE_TABLE, 1.4, 1.6),
      { at: 4.45, kind: 'dizzy', x: CAT_TABLE, y: 58, dur: 1.0 },
    ],
    camera: [{ at: 4.45, dur: 0.3, do: 'shake', amount: 1.2 }],
    cues: [
      { at: 0.2, sfx: 'poof' },
      { at: 0.6, sfx: 'slide' },
      { at: 1.0, sfx: 'gulp' },
      { at: 1.3, sfx: 'gulp' },
      { at: 2.0, say: '好苦！貓的臉綠了！' },
      { at: 4.45, sfx: 'bonk' },
    ],
  }),

  // 貓和小老鼠一起吃蛋糕。——他把大蛋糕舉過頭、跳下桌，放在他和貓中間，切成兩半，一人一口越吃越小，吃光了摸著圓肚子
  share: scene({
    duration: 6.6,
    bg: BG,
    actors: [
      table,
      cake,
      { id: 'cakeR', emoji: 'prop:cake-halves', ...FLOOR_CAKE, size: CAKE.size, half: 'right' as const, hidden: true },
      standingCat,
      { id: 'mouse', emoji: 'hero:mouse/happy', x: ON_TABLE.x, y: ON_TABLE.y, size: 24 },
    ],
    moves: [
      // 舉起來
      { at: 0.15, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/lift' },
      { at: 0.2, actor: 'cake', do: 'moveTo', to: { x: ON_TABLE.x, y: 14 }, dur: 0.35, ease: 'back' },
      { at: 0.6, actor: 'mouse', do: 'shake', amount: 0.6, dur: 0.3 },
      { at: 0.6, actor: 'cake', do: 'shake', amount: 0.6, dur: 0.3 },
      // 頂著蛋糕跳下桌
      { at: 0.95, actor: 'mouse', do: 'moveTo', to: { x: SHARE_X, y: G }, arc: 8, dur: 0.55 },
      { at: 0.95, actor: 'cake', do: 'moveTo', to: { x: SHARE_X, y: 42.5 }, arc: 8, dur: 0.55 },
      { at: 0.95, actor: 'cat', do: 'moveTo', to: { x: SHARE_CAT_X, y: CAT_Y }, arc: 6, dur: 0.5, ease: 'out' },
      // 放在中間
      { at: 1.6, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/throw' },
      { at: 1.6, actor: 'cake', do: 'moveTo', to: FLOOR_CAKE, arc: 5, dur: 0.35, ease: 'in' },
      { at: 1.95, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/happy' },
      // 切成兩半
      { at: 2.05, actor: 'cake', do: 'swap', emoji: 'prop:cake-halves', half: 'left' },
      { at: 2.05, actor: 'cakeR', do: 'enter', from: FLOOR_CAKE, dur: 0 },
      { at: 2.05, actor: 'cake', do: 'moveTo', to: { x: FLOOR_CAKE.x - 1.5, y: FLOOR_CAKE.y }, dur: 0.2 },
      { at: 2.05, actor: 'cakeR', do: 'moveTo', to: { x: FLOOR_CAKE.x + 1.5, y: FLOOR_CAKE.y }, dur: 0.2 },
      // 一人一口
      ...bite(2.55, 'cat', 'cake', 0.75),
      ...bite(2.9, 'mouse', 'cakeR', 0.75),
      ...bite(3.3, 'cat', 'cake', 0.6),
      ...bite(3.65, 'mouse', 'cakeR', 0.6),
      ...bite(4.05, 'cat', 'cake', 0),
      ...bite(4.4, 'mouse', 'cakeR', 0),
      // 吃飽了
      { at: 4.85, actor: 'mouse', do: 'swap', emoji: 'hero:mouse/full' },
      { at: 4.9, actor: 'cat', do: 'squash', amount: 0.12, dur: 0.5 },
      { at: 5.5, actor: 'cat', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 5.6, actor: 'mouse', do: 'squash', amount: 0.1, dur: 0.4 },
    ],
    fx: [
      { at: 0.6, kind: 'sweat', actor: 'mouse', dx: -6 },
      { at: 1.95, kind: 'puff', x: FLOOR_CAKE.x, y: 74, dur: 0.4 },
      { at: 2.05, kind: 'burst', x: FLOOR_CAKE.x, y: FLOOR_CAKE.y - 6, emoji: '✨', n: 6, dur: 0.6 },
      catFace(4.9, '😻', FACE_SHARE, 1.6, 1.4),
      { at: 4.95, kind: 'pop', actor: 'mouse', emoji: '😋', dx: 4, dur: 1.5 },
      { at: 5.2, kind: 'burst', x: FLOOR_CAKE.x, y: 52, emoji: '💗', n: 10, dur: 1.2 },
    ],
    cues: [
      { at: 0.2, sfx: 'boing' },
      { at: 1.5, sfx: 'plop' },
      { at: 1.95, sfx: 'plop' },
      { at: 2.05, sfx: 'clink' },
      { at: 2.1, say: '貓和小老鼠一起吃蛋糕。' },
      { at: 2.63, sfx: 'gulp' },
      { at: 2.98, sfx: 'gulp' },
      { at: 3.38, sfx: 'gulp' },
      { at: 3.73, sfx: 'gulp' },
      { at: 4.13, sfx: 'gulp' },
      { at: 4.48, sfx: 'gulp' },
      { at: 5.2, sfx: 'cheer' },
    ],
  }),
}

export default scenes
