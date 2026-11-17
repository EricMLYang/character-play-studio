import { scene } from '../scene'
import type { Fx, Move } from '../../anim/clip'
import type { Scenes } from './index'

// 外星人來了：夜晚天上一個小光點晃來晃去飛近，是飛碟。外星人坐光束下來找人玩，找不到，回飛碟打開光束等著。
// 他選誰就吸誰：牛吃著草被吸上去亂蹬、爸爸打哈欠被吸上去嚇壞（鞋子掉了也被吸走）、小豬自己跑進來咯咯笑著飛上去。
// 三個都吸進去以後飛碟太重：抖、冒煙、歪一邊，碰！掉到地上，把大家吐出來，牛載著小豬走掉、爸爸逃走。
// 外星人爬出來，送我一個禮物（星星／蛋裡的小外星人／天上來的石），最後坐飛碟飛走，變成天上的一顆星星。
// 主角 alien（size 24 站在地上 y = 66.9）；飛碟 `hero:alien/saucer`（外星人坐在裡面那張，size 44 才裝得下他），
// 他不在裡面時只畫下面那片盤子。左邊房子 x 18、右邊大樹 x 144 每一頁都在。
// 鏡頭：飛碟在上、被吸的人在地上，自動取景會切掉其中一個，所以整本自己定鏡頭——飛碟在天上時用 WIDE（幾乎全景），
// 掉到地上以後用 GROUND（框住地上的飛碟與外星人）。
// grab 三段誰先誰後都可能：開頭結尾都是 WAIT（飛碟在上方正中 UFO、整張圖、光束照著中間地面）。
// heavy 之後飛碟停在地上 LAND（只剩盤子）、外星人站在 x 104：gift 三段開頭結尾、bye 的開頭都是這樣。
const G = 66.9
const BG = { top: '#121842', bottom: '#3B4486', floor: '#5E7F62', scenery: 'night' as const }
const house = { id: 'house', emoji: '🏠', x: 18, y: 66.1, size: 26 }
const tree = { id: 'tree', emoji: '🌳', x: 144, y: 64.4, size: 30 }
/** 飛碟停在上方等著的位置 */
const UFO = { x: 80, y: 23 }
/** 被吸進飛碟的那一點 */
const IN = { x: 80, y: 33 }
/** 飛碟頭上的效果寫固定位置（掛在飛碟身上，引擎會以為頂到畫面上緣，整段角色就不放大了，跟別段對不上） */
const ABOVE = { x: 80, y: 17 }
/** 掉到地上以後（size 44 站在地上） */
const LAND = { x: 64, y: 58.5 }
/** 從地上的飛碟裡冒出來／跳進去的那一點 */
const HATCH = { x: 64, y: 50 }
/** 飛碟裡沒有人：只畫下面的盤子 */
const EMPTY = { half: 'bottom' as const, cut: 0.62 }
const ufo = { id: 'ufo', emoji: 'hero:alien/saucer', ...UFO, size: 44, float: true, pivot: 'center' as const }
const landed = { ...ufo, ...LAND, ...EMPTY }
/** 掉到地上以後外星人站的位置 */
const AX = 104
const alienBy = { id: 'alien', emoji: 'hero:alien/idle', x: AX, y: G, size: 24 }
/** 牛（size 26）、爸爸（size 32）站在地上 */
const CG = 66.1
const DG = 63.6
/** 定住的鏡頭（at −1：一開場就已經在那裡，跟上一段結尾一樣） */
const WIDE = { x: 80, y: 44, amount: 1.05 }
const GROUND = { x: 86, y: 60, amount: 1.5 }
const cam = (c: typeof WIDE, at = -1, dur = 0.01) => ({ at, dur, do: 'zoom' as const, amount: c.amount, to: { x: c.x, y: c.y } })

/**
 * 牽引光束從 from 照到 to。fx 會在開頭 12%、結尾 20% 淡入淡出，一道長的會慢慢亮起來，
 * 所以用一串短的接力（一閃一閃本來就是光束的樣子），開關都很乾脆；結尾那道留到劇本最後一格還亮著。
 */
function beam(from: number, to: number, n = 22): Fx[] {
  const out: Fx[] = []
  for (let at = from; at < to - 0.3; at += 0.45) out.push({ at: +at.toFixed(2), kind: 'beam', actor: 'ufo', n, dur: 0.6 })
  out.push({ at: +(to - 0.3).toFixed(2), kind: 'beam', actor: 'ufo', n, dur: 1.2 })
  return out
}
/** 一直開到最後（等著的樣子） */
const beamAll = (d: number) => beam(0, d + 0.4).filter((f) => f.at <= d)

/** 被吸進飛碟、飛碟吃飽晃一下再回原位（三段 grab 共用的結尾） */
function gulp(at: number, who: string): { moves: Move[]; fx: Fx[] } {
  return {
    moves: [
      { at, actor: who, do: 'moveTo' as const, to: IN, dur: 0.4, ease: 'in' as const },
      { at, actor: who, do: 'scaleTo' as const, amount: 0.25, dur: 0.4, ease: 'in' as const },
      { at: at + 0.4, actor: who, do: 'vanish' as const, dur: 0.08 },
      { at: at + 0.4, actor: 'ufo', do: 'scaleTo' as const, amount: 1.12, dur: 0.2, ease: 'out' as const },
      { at: at + 0.4, actor: 'ufo', do: 'shake' as const, amount: 1.4, dur: 0.5 },
      { at: at + 0.65, actor: 'ufo', do: 'scaleTo' as const, amount: 1 / 1.12, dur: 0.5, ease: 'elastic' as const },
      { at: at + 0.65, actor: 'ufo', do: 'tilt' as const, amount: 10, dur: 0.6 },
    ],
    fx: [{ at: at + 0.4, kind: 'burst', ...ABOVE, emoji: '💫', n: 6, dur: 0.7 }],
  }
}

const scenes: Scenes = {
  // 夜晚，天上有光。——安靜的夜，星星一閃一閃；天上一個小光點晃來晃去越飛越近，是飛碟！停在上方
  light: scene({
    duration: 4.8,
    bg: BG,
    actors: [house, tree, { ...ufo, x: 128, y: 12 }],
    moves: [
      { at: 0, actor: 'ufo', do: 'scaleTo', amount: 0.1, dur: 0 },
      { at: 0.1, actor: 'ufo', do: 'flash', dur: 0.8 },
      { at: 0.4, actor: 'ufo', do: 'moveTo', to: { x: 104, y: 14 }, dur: 0.8 },
      { at: 0.4, actor: 'ufo', do: 'scaleTo', amount: 2, dur: 0.8 },
      { at: 1.3, actor: 'ufo', do: 'flash', dur: 0.6 },
      { at: 1.3, actor: 'ufo', do: 'moveTo', to: { x: 52, y: 16 }, dur: 0.8 },
      { at: 1.3, actor: 'ufo', do: 'scaleTo', amount: 1.8, dur: 0.8 },
      { at: 2.2, actor: 'ufo', do: 'moveTo', to: { x: 104, y: 20 }, dur: 0.7 },
      { at: 2.2, actor: 'ufo', do: 'scaleTo', amount: 1.6, dur: 0.7 },
      { at: 3.0, actor: 'ufo', do: 'moveTo', to: UFO, dur: 0.7, ease: 'back' },
      { at: 3.0, actor: 'ufo', do: 'scaleTo', amount: 1 / (0.1 * 2 * 1.8 * 1.6), dur: 0.7, ease: 'back' },
      { at: 3.8, actor: 'ufo', do: 'tilt', amount: 8, dur: 0.6 },
    ],
    fx: [
      { at: 0.2, kind: 'pop', x: 40, y: 14, emoji: '✨', dur: 0.8 },
      { at: 0.9, kind: 'pop', x: 120, y: 32, emoji: '✨', dur: 0.8 },
      { at: 1.6, kind: 'pop', x: 30, y: 30, emoji: '✨', dur: 0.8 },
      { at: 0.4, kind: 'burst', x: 104, y: 12, emoji: '✨', n: 5, dur: 0.6 },
      { at: 3.7, kind: 'burst', ...ABOVE, emoji: '✨', n: 8, dur: 0.8 },
    ],
    // 開頭讓自動取景框著小光點；飛碟停下來時退到 WIDE（下一段從這裡開始）
    camera: [cam(WIDE, 2.9, 1.0)],
    cues: [
      { at: 0.4, sfx: 'blip' },
      { at: 0.6, say: '夜晚，天上有光。' },
      { at: 1.3, sfx: 'whoosh' },
      { at: 2.2, sfx: 'whoosh' },
      { at: 3.7, sfx: 'blip' },
    ],
  }),

  // 外星人來了！他想玩。——坐光束下來，蹦蹦跳，左看右看找不到人玩，又坐光束回飛碟，光束開著等
  come: scene({
    duration: 6.6,
    bg: BG,
    actors: [house, tree, ufo, { id: 'alien', emoji: 'hero:alien/happy', ...IN, size: 24, hidden: true }],
    moves: [
      { at: 0, actor: 'alien', do: 'scaleTo', amount: 0.6, dur: 0 },
      { at: 0.35, actor: 'ufo', do: 'swap', emoji: 'hero:alien/saucer', ...EMPTY },
      { at: 0.35, actor: 'alien', do: 'pop', dur: 0.2 },
      { at: 0.45, actor: 'alien', do: 'moveTo', to: { x: 80, y: G }, dur: 1.1, ease: 'out' },
      { at: 0.45, actor: 'alien', do: 'scaleTo', amount: 1 / 0.6, dur: 1.1, ease: 'out' },
      { at: 1.6, actor: 'alien', do: 'hop', amount: 6, dur: 0.35 },
      { at: 2.0, actor: 'alien', do: 'hop', amount: 6, dur: 0.35 },
      // 東張西望：先往左找、再往右找
      { at: 2.45, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
      { at: 2.45, actor: 'alien', do: 'moveTo', to: { x: 50, y: G }, dur: 0.6 },
      { at: 3.1, actor: 'alien', do: 'tilt', amount: -12, dur: 0.4 },
      { at: 3.45, actor: 'alien', do: 'moveTo', to: { x: 112, y: G }, dur: 0.8 },
      { at: 4.3, actor: 'alien', do: 'tilt', amount: 12, dur: 0.4 },
      // 沒有人……垂頭，走回光束底下，坐光束回去
      { at: 4.7, actor: 'alien', do: 'moveTo', to: { x: 80, y: G }, dur: 0.5 },
      { at: 4.7, actor: 'alien', do: 'tilt', amount: -8, dur: 0.5 },
      { at: 5.3, actor: 'alien', do: 'moveTo', to: IN, dur: 0.7, ease: 'in' },
      { at: 5.3, actor: 'alien', do: 'scaleTo', amount: 0.6, dur: 0.7, ease: 'in' },
      { at: 5.92, actor: 'alien', do: 'vanish', dur: 0.06 },
      { at: 6.0, actor: 'ufo', do: 'swap', emoji: 'hero:alien/saucer', half: 'whole' },
    ],
    fx: [
      ...beam(0.2, 1.6),
      { at: 1.6, kind: 'burst', actor: 'alien', emoji: '✨', n: 6, dur: 0.7 },
      { at: 3.1, kind: 'pop', actor: 'alien', emoji: '❓', dur: 0.5 },
      { at: 4.3, kind: 'pop', actor: 'alien', emoji: '❓', dur: 0.5 },
      { at: 4.75, kind: 'pop', actor: 'alien', emoji: '😢', dur: 0.6 },
      ...beam(5.15, 7.0).filter((f) => f.at <= 6.6),
    ],
    camera: [cam(WIDE)],
    cues: [
      { at: 0.2, sfx: 'laser' },
      { at: 1.5, say: '外星人來了！他想玩。' },
      { at: 5.15, sfx: 'laser' },
      { at: 6.0, sfx: 'plop' },
    ],
  }),

  // 牛飛上天了！牛在叫！——牛吃著草走進光束底下，被慢慢吸起來，四腳亂蹬、轉圈、哞哞叫，吸進飛碟，飛碟鼓一下
  'grab:牛': (() => {
    const g = gulp(3.7, 'cow')
    return scene({
      duration: 5.8,
      bg: BG,
      actors: [house, tree, ufo, { id: 'cow', emoji: '🐄', x: 84, y: CG, size: 26, hidden: true, pivot: 'center' }],
      moves: ([
        { at: 0.1, actor: 'cow', do: 'enter', from: { x: 178, y: CG }, dur: 0.9, ease: 'out' },
        // 低頭吃草
        { at: 1.05, actor: 'cow', do: 'tilt', amount: -10, dur: 0.3 },
        { at: 1.35, actor: 'cow', do: 'tilt', amount: -10, dur: 0.3 },
        // 被吸起來：四腳亂蹬、轉圈
        { at: 1.6, actor: 'cow', do: 'moveTo', to: { x: 80, y: 54 }, dur: 1.1, ease: 'out' },
        { at: 1.7, actor: 'cow', do: 'shake', amount: 1.8, dur: 0.9 },
        { at: 2.7, actor: 'cow', do: 'spin', times: 1, dur: 0.8 },
        { at: 2.7, actor: 'cow', do: 'moveTo', to: { x: 80, y: 48 }, dur: 0.9 },
        g.moves,
      ] as (Move | Move[])[]).flat(),
      fx: [
        ...beamAll(5.8),
        { at: 1.05, kind: 'burst', actor: 'cow', emoji: '🌿', n: 4, dx: -10, dy: 12, dur: 0.6 },
        { at: 1.65, kind: 'pop', actor: 'cow', emoji: '😱', dx: -10, dur: 0.9 },
        { at: 2.0, kind: 'sweat', actor: 'cow' },
        { at: 2.8, kind: 'burst', actor: 'cow', emoji: '💢', n: 4, dur: 0.6 },
        ...g.fx,
      ],
      camera: [cam(WIDE)],
      cues: [
        { at: 1.6, sfx: 'boing' },
        { at: 1.7, say: '牛飛上天了！牛在叫！' },
        { at: 2.7, sfx: 'boing' },
        { at: 3.7, sfx: 'whoosh' },
        { at: 4.1, sfx: 'gulp' },
      ],
    })
  })(),

  // 爸爸飛上天了！爸爸好怕！——爸爸打著哈欠走進來，被吸起來嚇壞了、手腳亂揮、鞋子掉下去；
  // 想伸手抓住鞋子抓不到，被吸進去……鞋子也跟著被吸上去
  'grab:爸': (() => {
    const g = gulp(3.6, 'dad')
    return scene({
      duration: 6.2,
      bg: BG,
      actors: [
        house, tree, ufo,
        { id: 'dad', emoji: 'prop:dad', x: 78, y: DG, size: 32, hidden: true, flip: true },
        { id: 'shoe', emoji: '👟', x: 84, y: 64, size: 9, hidden: true, pivot: 'center' },
      ],
      moves: ([
        { at: 0.05, actor: 'dad', do: 'enter', from: { x: -20, y: DG }, dur: 1.0, ease: 'out' },
        { at: 1.1, actor: 'dad', do: 'squash', amount: -0.12, dur: 0.4 },
        // 被吸起來：嚇壞了、手腳亂揮
        { at: 1.5, actor: 'dad', do: 'swap', emoji: 'prop:dad-shock' },
        { at: 1.55, actor: 'dad', do: 'moveTo', to: { x: 80, y: 54 }, dur: 1.0, ease: 'out' },
        { at: 1.6, actor: 'dad', do: 'shake', amount: 1.8, dur: 0.9 },
        // 鞋子掉下去
        { at: 2.0, actor: 'shoe', do: 'pop', dur: 0.1 },
        { at: 2.05, actor: 'shoe', do: 'moveTo', to: { x: 94, y: 71 }, dur: 0.45, ease: 'in' },
        { at: 2.05, actor: 'shoe', do: 'spin', times: 2, dur: 0.45 },
        // 伸手想抓鞋子：抓不到
        { at: 2.6, actor: 'dad', do: 'swap', emoji: 'prop:dad-catch' },
        { at: 2.6, actor: 'dad', do: 'tilt', amount: 18, dur: 0.6 },
        { at: 2.7, actor: 'dad', do: 'hop', amount: -3, dur: 0.4 },
        { at: 3.2, actor: 'dad', do: 'swap', emoji: 'prop:dad-shock' },
        { at: 3.2, actor: 'dad', do: 'shake', amount: 1.5, dur: 0.4 },
        g.moves,
        // 鞋子自己也被吸上去
        { at: 4.6, actor: 'shoe', do: 'moveTo', to: IN, dur: 0.6, ease: 'in' },
        { at: 4.6, actor: 'shoe', do: 'spin', times: 2, dur: 0.6 },
        { at: 5.2, actor: 'shoe', do: 'vanish', dur: 0.08 },
        { at: 5.2, actor: 'ufo', do: 'squash', amount: 0.2, dur: 0.3 },
      ] as (Move | Move[])[]).flat(),
      fx: [
        ...beamAll(6.2),
        { at: 0.4, kind: 'pop', actor: 'dad', emoji: '🥱', dx: 8, dur: 1.0 },
        { at: 1.55, kind: 'pop', actor: 'dad', emoji: '❗', dx: 8, dur: 0.5 },
        { at: 1.9, kind: 'sweat', actor: 'dad' },
        { at: 2.55, kind: 'pop', actor: 'shoe', emoji: '❗', dur: 0.5 },
        { at: 3.3, kind: 'sweat', actor: 'dad' },
        ...g.fx,
        { at: 5.25, kind: 'pop', x: 104, y: 18, emoji: '😅', dur: 0.8 },
      ],
      camera: [cam(WIDE)],
      cues: [
        { at: 1.5, sfx: 'boing' },
        { at: 1.7, say: '爸爸飛上天了！爸爸好怕！' },
        { at: 2.5, sfx: 'plop' },
        { at: 3.6, sfx: 'whoosh' },
        { at: 4.0, sfx: 'gulp' },
        { at: 5.2, sfx: 'plop' },
      ],
    })
  })(),

  // 小豬也上去了！他在笑！——小豬自己開心地跑進光束、張開手，被吸上去還在空中轉圈咯咯笑
  'grab:豬': (() => {
    const g = gulp(3.7, 'pig')
    return scene({
      duration: 5.8,
      bg: BG,
      actors: [house, tree, ufo, { id: 'pig', emoji: 'hero:pig/happy', x: 80, y: G, size: 24, hidden: true, flip: true }],
      moves: ([
        { at: 0.05, actor: 'pig', do: 'enter', from: { x: -18, y: G }, dur: 0.8, ease: 'out' },
        { at: 0.9, actor: 'pig', do: 'swap', emoji: 'hero:pig/hug' },
        { at: 1.0, actor: 'pig', do: 'hop', amount: 4, dur: 0.3 },
        // 飛起來了：開心轉圈
        { at: 1.4, actor: 'pig', do: 'moveTo', to: { x: 80, y: 54 }, dur: 1.0, ease: 'out' },
        { at: 1.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/laugh' },
        { at: 1.6, actor: 'pig', do: 'spin', times: 1, dur: 0.7, pivot: 'center' },
        { at: 2.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/giggle' },
        { at: 2.5, actor: 'pig', do: 'tilt', amount: -14, dur: 0.5 },
        { at: 3.0, actor: 'pig', do: 'tilt', amount: 14, dur: 0.5 },
        { at: 3.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
        g.moves,
      ] as (Move | Move[])[]).flat(),
      fx: [
        ...beamAll(5.8),
        { at: 0.9, kind: 'pop', actor: 'pig', emoji: '💖', dur: 0.6 },
        { at: 1.6, kind: 'burst', actor: 'pig', emoji: '🎶', n: 5, dur: 0.8 },
        { at: 2.5, kind: 'pop', actor: 'pig', emoji: '😆', dx: 16, dur: 1.0 },
        ...g.fx,
        { at: 4.2, kind: 'burst', ...ABOVE, emoji: '💖', n: 6, dur: 0.8 },
      ],
      camera: [cam(WIDE)],
      cues: [
        { at: 1.4, sfx: 'boing' },
        { at: 1.6, say: '小豬也上去了！他在笑！' },
        { at: 2.5, sfx: 'cheer' },
        { at: 3.7, sfx: 'whoosh' },
        { at: 4.1, sfx: 'gulp' },
      ],
    })
  })(),

  // 太多了！外星人飛不起來了！——光束關掉想飛走：抖、往下沉、冒煙、歪一邊，碰！掉到地上；
  // 把牛、爸爸、小豬一個一個吐出來（小豬落在牛背上），頭暈；牛載著小豬走掉、爸爸逃走。外星人爬出來，頭暈、不好意思
  heavy: scene({
    duration: 7.8,
    bg: BG,
    actors: [
      house, tree, ufo,
      { id: 'cow', emoji: '🐄', x: 40, y: CG, size: 26, hidden: true },
      { id: 'dad', emoji: 'prop:dad-shock', x: 118, y: DG, size: 32, hidden: true },
      { id: 'pig', emoji: 'hero:pig/dizzy', x: 40, y: 47, size: 24, hidden: true, float: true },
      { id: 'alien', emoji: 'hero:alien/dizzy', ...HATCH, size: 24, hidden: true },
    ],
    moves: [
      // 想飛走：往上一點……抖、往下沉、歪一邊
      { at: 0.4, actor: 'ufo', do: 'moveTo', to: { x: 80, y: 15 }, dur: 0.4, ease: 'out' },
      { at: 0.8, actor: 'ufo', do: 'shake', amount: 1.6, dur: 0.9 },
      { at: 1.0, actor: 'ufo', do: 'moveTo', to: { x: 76, y: 28 }, dur: 0.7 },
      { at: 1.0, actor: 'ufo', do: 'rotateTo', amount: 14, dur: 0.7 },
      { at: 1.8, actor: 'ufo', do: 'shake', amount: 2.2, dur: 0.5 },
      // 碰！掉下來
      { at: 2.3, actor: 'ufo', do: 'moveTo', to: LAND, dur: 0.4, ease: 'in' },
      { at: 2.3, actor: 'ufo', do: 'rotateTo', amount: -14, dur: 0.4, ease: 'in' },
      { at: 2.7, actor: 'ufo', do: 'squash', amount: 0.3, dur: 0.35 },
      // 一個一個吐出來
      ...([
        ['cow', 3.0, { x: 40, y: CG }, -1],
        ['dad', 3.45, { x: 118, y: DG }, 1],
        ['pig', 3.9, { x: 40, y: 47 }, -1],
      ] as const).flatMap(([id, at, to, dir]) => [
        { at, actor: 'ufo', do: 'squash' as const, amount: -0.25, dur: 0.25 },
        { at, actor: id, do: 'moveTo' as const, to: HATCH, dur: 0.01 },
        { at, actor: id, do: 'pop' as const, dur: 0.15 },
        { at: at + 0.02, actor: id, do: 'moveTo' as const, to, arc: 18, dur: 0.55, ease: 'out' as const },
        { at: at + 0.02, actor: id, do: 'spin' as const, times: dir, dur: 0.55, pivot: 'center' as const },
      ]),
      // 回過神來：牛載著小豬走掉、小豬揮手；爸爸往右逃
      { at: 4.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
      { at: 5.0, actor: 'dad', do: 'flip' },
      { at: 5.1, actor: 'dad', do: 'moveTo', to: { x: 196, y: DG }, dur: 0.9, ease: 'in' },
      { at: 5.3, actor: 'cow', do: 'moveTo', to: { x: -34, y: CG }, dur: 1.4, ease: 'in' },
      { at: 5.3, actor: 'pig', do: 'moveTo', to: { x: -34, y: 47 }, dur: 1.4, ease: 'in' },
      // 外星人爬出來：頭暈坐在地上，站起來不好意思
      { at: 5.9, actor: 'ufo', do: 'swap', emoji: 'hero:alien/saucer', ...EMPTY },
      { at: 5.9, actor: 'alien', do: 'pop', dur: 0.15 },
      { at: 5.95, actor: 'alien', do: 'moveTo', to: { x: AX, y: G }, arc: 10, dur: 0.5 },
      { at: 6.9, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
      { at: 7.0, actor: 'alien', do: 'tilt', amount: -10, dur: 0.6 },
    ],
    fx: [
      { at: 0, kind: 'beam', actor: 'ufo', n: 22, dur: 0.5 },
      { at: 0.8, kind: 'sweat', x: 96, y: 10 },
      { at: 1.0, kind: 'stink', x: 62, y: 22, dur: 1.4 },
      { at: 1.3, kind: 'burst', x: 76, y: 26, emoji: '💨', n: 4, dur: 0.6 },
      { at: 1.8, kind: 'pop', x: 102, y: 20, emoji: '😱', dur: 0.5 },
      { at: 2.7, kind: 'burst', x: 64, y: 44, n: 1, dur: 0.5 },
      { at: 2.75, kind: 'puff', actor: 'ufo', dur: 0.6 },
      { at: 3.6, kind: 'dizzy', actor: 'cow', dur: 1.4 },
      { at: 4.0, kind: 'dizzy', actor: 'dad', dur: 1.0 },
      { at: 4.5, kind: 'dizzy', actor: 'pig', dur: 0.6 },
      { at: 5.0, kind: 'pop', actor: 'pig', emoji: '👋', dx: 10, dur: 0.9 },
      { at: 5.1, kind: 'puff', actor: 'dad', dur: 0.4 },
      { at: 6.4, kind: 'dizzy', actor: 'alien', dur: 0.8 },
      { at: 7.0, kind: 'pop', actor: 'alien', emoji: '😅', dx: 12, dur: 0.8 },
    ],
    // 掉到地上、大家走掉以後推近到地上（gift、bye 都從 GROUND 開始）
    camera: [cam(WIDE), { at: 2.7, dur: 0.4, do: 'shake', amount: 1.8 }, cam(GROUND, 6.0, 1.0)],
    cues: [
      { at: 0.8, sfx: 'rumble' },
      { at: 1.2, say: '太多了！外星人飛不起來了！' },
      { at: 2.7, sfx: 'bonk' },
      { at: 3.0, sfx: 'boing' },
      { at: 3.45, sfx: 'boing' },
      { at: 3.9, sfx: 'boing' },
      { at: 5.1, sfx: 'whoosh' },
      { at: 5.9, sfx: 'plop' },
    ],
  }),

  // 好美的星星！——外星人往天上一招，一顆星星掉到他手上，亮晶晶；星星飛過來給我，放大、閃一下
  'gift:星': scene({
    duration: 4.8,
    bg: BG,
    actors: [
      house, tree, landed, alienBy,
      { id: 'star', emoji: '⭐', x: AX, y: 49, size: 10, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
      { at: 0.15, actor: 'star', do: 'enter', from: { x: AX - 10, y: 10 }, dur: 0.7, ease: 'out' },
      { at: 0.15, actor: 'star', do: 'spin', times: 2, dur: 0.7 },
      { at: 0.85, actor: 'alien', do: 'squash', amount: 0.15, dur: 0.25 },
      { at: 0.9, actor: 'star', do: 'flash', dur: 1.0 },
      { at: 1.8, actor: 'alien', do: 'hop', amount: 4, dur: 0.35 },
      { at: 1.8, actor: 'star', do: 'hop', amount: 4, dur: 0.35 },
      // 給我：星星飛到鏡頭正中間、放大、閃一下不見
      { at: 2.5, actor: 'star', do: 'moveTo', to: { x: GROUND.x, y: GROUND.y }, dur: 0.8, ease: 'in' },
      { at: 2.5, actor: 'star', do: 'scaleTo', amount: 4, dur: 0.8, ease: 'in' },
      { at: 2.5, actor: 'star', do: 'spin', times: 1, dur: 0.8 },
      { at: 3.4, actor: 'star', do: 'vanish', dur: 0.3 },
      { at: 3.6, actor: 'alien', do: 'hop', amount: 5, dur: 0.35 },
      { at: 4.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
    ],
    fx: [
      { at: 0.9, kind: 'burst', actor: 'star', emoji: '✨', n: 8, dur: 0.8 },
      { at: 3.3, kind: 'burst', x: GROUND.x, y: GROUND.y - 4, emoji: '✨', n: 12, dur: 1.0, scale: 1.5 },
      { at: 3.6, kind: 'pop', actor: 'alien', emoji: '💖', dur: 0.8 },
    ],
    camera: [cam(GROUND)],
    cues: [
      { at: 0.15, sfx: 'whoosh' },
      { at: 0.9, sfx: 'clink' },
      { at: 1.1, say: '好美的星星！' },
      { at: 3.3, sfx: 'cheer' },
    ],
  }),

  // 蛋裡有小外星人！——他從飛碟裡抱出一顆大蛋，蛋搖一搖、裂開，蹦出一隻迷你外星人揮手，又跳回飛碟裡
  'gift:蛋': scene({
    duration: 6.0,
    bg: BG,
    actors: [
      house, tree, landed, alienBy,
      { id: 'eggL', emoji: 'prop:egg', x: 86, y: 70.3, size: 16, hidden: true, half: 'left' },
      { id: 'eggR', emoji: 'prop:egg', x: 86, y: 70.3, size: 16, hidden: true, half: 'right' },
      { id: 'mini', emoji: 'hero:alien/happy', x: 86, y: 71.5, size: 12, hidden: true },
    ],
    moves: [
      // 從飛碟裡拿出來
      ...(['eggL', 'eggR'] as const).flatMap((id) => [
        { at: 0.15, actor: id, do: 'moveTo' as const, to: HATCH, dur: 0.01 },
        { at: 0.15, actor: id, do: 'pop' as const, dur: 0.15 },
        { at: 0.2, actor: id, do: 'moveTo' as const, to: { x: 86, y: 70.3 }, arc: 12, dur: 0.5 },
        { at: 1.0, actor: id, do: 'tilt' as const, amount: -12, dur: 0.3 },
        { at: 1.3, actor: id, do: 'tilt' as const, amount: 12, dur: 0.3 },
        { at: 1.6, actor: id, do: 'shake' as const, amount: 1.2, dur: 0.3 },
      ]),
      { at: 0.1, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
      { at: 1.0, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
      // 裂開
      { at: 1.9, actor: 'eggL', do: 'moveTo', to: { x: 79, y: 70.3 }, dur: 0.3, ease: 'out' },
      { at: 1.9, actor: 'eggL', do: 'rotateTo', amount: -30, dur: 0.3, ease: 'out' },
      { at: 1.9, actor: 'eggR', do: 'moveTo', to: { x: 93, y: 70.3 }, dur: 0.3, ease: 'out' },
      { at: 1.9, actor: 'eggR', do: 'rotateTo', amount: 30, dur: 0.3, ease: 'out' },
      { at: 1.95, actor: 'mini', do: 'pop', dur: 0.25 },
      { at: 2.0, actor: 'mini', do: 'hop', amount: 6, dur: 0.4 },
      { at: 2.4, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
      { at: 2.6, actor: 'mini', do: 'hop', amount: 4, dur: 0.3 },
      { at: 2.8, actor: 'alien', do: 'hop', amount: 5, dur: 0.35 },
      { at: 3.0, actor: 'mini', do: 'hop', amount: 4, dur: 0.3 },
      { at: 3.6, actor: 'eggL', do: 'vanish', dur: 0.2 },
      { at: 3.6, actor: 'eggR', do: 'vanish', dur: 0.2 },
      // 跳回飛碟裡
      { at: 4.0, actor: 'mini', do: 'moveTo', to: HATCH, arc: 14, dur: 0.6 },
      { at: 4.6, actor: 'mini', do: 'vanish', dur: 0.08 },
      { at: 4.6, actor: 'ufo', do: 'squash', amount: 0.2, dur: 0.3 },
      { at: 5.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
    ],
    fx: [
      { at: 1.0, kind: 'pop', actor: 'alien', emoji: '❓', dur: 0.6 },
      { at: 1.9, kind: 'burst', x: 86, y: 66, emoji: '✨', n: 8, dur: 0.8 },
      { at: 2.4, kind: 'pop', actor: 'mini', emoji: '👋', dx: -6, dur: 1.0 },
      { at: 2.8, kind: 'burst', actor: 'alien', emoji: '💖', n: 6, dur: 0.8 },
      { at: 3.6, kind: 'puff', x: 86, y: 72, dur: 0.4 },
      { at: 4.65, kind: 'pop', x: 64, y: 44, emoji: '👋', dur: 0.8 },
    ],
    camera: [cam(GROUND)],
    cues: [
      { at: 0.15, sfx: 'poof' },
      { at: 1.0, sfx: 'tap' },
      { at: 1.3, sfx: 'tap' },
      { at: 1.9, sfx: 'crack' },
      { at: 2.05, say: '蛋裡有小外星人！' },
      { at: 4.0, sfx: 'boing' },
      { at: 4.6, sfx: 'plop' },
    ],
  }),

  // 是天上來的石！——飛碟咚一聲掉出一顆大石頭，差點砸到他的腳（跳開）；石頭一閃一閃發光，他得意地推過來給我
  'gift:石': scene({
    duration: 5.6,
    bg: BG,
    actors: [
      house, tree, landed, alienBy,
      { id: 'rock', emoji: 'prop:rock', x: 92, y: 67.8, size: 22, hidden: true },
    ],
    moves: [
      { at: 0.1, actor: 'ufo', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: 0.35, actor: 'ufo', do: 'squash', amount: -0.25, dur: 0.25 },
      { at: 0.35, actor: 'rock', do: 'moveTo', to: HATCH, dur: 0.01 },
      { at: 0.35, actor: 'rock', do: 'pop', dur: 0.1 },
      { at: 0.4, actor: 'rock', do: 'moveTo', to: { x: 92, y: 67.8 }, arc: 14, dur: 0.45, ease: 'in' },
      // 差點砸到腳：跳開
      { at: 0.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/surprised' },
      { at: 0.65, actor: 'alien', do: 'moveTo', to: { x: 118, y: G }, arc: 8, dur: 0.35, ease: 'out' },
      // 一閃一閃發光
      { at: 1.3, actor: 'rock', do: 'flash', dur: 0.7 },
      { at: 2.1, actor: 'rock', do: 'flash', dur: 0.7 },
      { at: 2.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
      { at: 2.3, actor: 'alien', do: 'hop', amount: 4, dur: 0.3 },
      // 得意地推過來：繞到石頭後面一推，石頭往鏡頭滑出畫面下緣
      { at: 3.0, actor: 'alien', do: 'moveTo', to: { x: 106, y: G }, dur: 0.3, ease: 'in' },
      { at: 3.3, actor: 'rock', do: 'moveTo', to: { x: 86, y: 96 }, dur: 0.9, ease: 'in' },
      { at: 3.3, actor: 'rock', do: 'scaleTo', amount: 2, dur: 0.9, ease: 'in' },
      { at: 3.35, actor: 'alien', do: 'moveTo', to: { x: AX, y: G }, dur: 0.6 },
      { at: 4.2, actor: 'rock', do: 'vanish', dur: 0.1 },
      { at: 4.6, actor: 'alien', do: 'swap', emoji: 'hero:alien/idle' },
    ],
    fx: [
      { at: 0.85, kind: 'burst', actor: 'rock', n: 1, dur: 0.5 },
      { at: 0.7, kind: 'pop', actor: 'alien', emoji: '❗', dur: 0.5 },
      { at: 1.3, kind: 'burst', actor: 'rock', emoji: '✨', n: 8, dur: 0.8 },
      { at: 2.1, kind: 'burst', actor: 'rock', emoji: '✨', n: 8, dur: 0.8 },
      { at: 2.3, kind: 'pop', actor: 'alien', emoji: '😎', dx: -12, dur: 1.0 },
    ],
    camera: [cam(GROUND), { at: 0.85, dur: 0.35, do: 'shake', amount: 1.6 }],
    lights: [
      { at: 1.3, dur: 0.08, level: -0.25 },
      { at: 1.4, dur: 0.3, level: 0 },
      { at: 2.1, dur: 0.08, level: -0.25 },
      { at: 2.2, dur: 0.3, level: 0 },
    ],
    cues: [
      { at: 0.85, sfx: 'bonk' },
      { at: 1.3, sfx: 'blip' },
      { at: 1.5, say: '是天上來的石！' },
      { at: 2.1, sfx: 'blip' },
      { at: 3.3, sfx: 'slide' },
    ],
  }),

  // 再見，外星人！——他揮手，跳回飛碟，飛碟升空、搖一搖，咻地飛遠，變成天上的一顆星星
  bye: scene({
    duration: 6.4,
    bg: BG,
    actors: [
      house, tree, landed, alienBy,
      { id: 'star', emoji: '⭐', x: 40, y: 16, size: 6, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.2, actor: 'alien', do: 'swap', emoji: 'hero:alien/happy' },
      { at: 0.3, actor: 'alien', do: 'hop', amount: 4, dur: 0.35 },
      { at: 1.0, actor: 'alien', do: 'hop', amount: 4, dur: 0.35 },
      // 跳回飛碟
      { at: 1.9, actor: 'alien', do: 'moveTo', to: HATCH, arc: 12, dur: 0.5 },
      { at: 1.9, actor: 'alien', do: 'scaleTo', amount: 0.6, dur: 0.5 },
      { at: 2.4, actor: 'alien', do: 'vanish', dur: 0.08 },
      { at: 2.4, actor: 'ufo', do: 'swap', emoji: 'hero:alien/saucer', half: 'whole' },
      // 升空、左右搖一搖、咻地飛遠
      { at: 2.8, actor: 'ufo', do: 'moveTo', to: UFO, dur: 0.9, ease: 'out' },
      { at: 3.75, actor: 'ufo', do: 'tilt', amount: -14, dur: 0.35 },
      { at: 4.1, actor: 'ufo', do: 'tilt', amount: 14, dur: 0.35 },
      { at: 4.5, actor: 'ufo', do: 'moveTo', to: { x: 40, y: 15 }, dur: 0.8, ease: 'in' },
      { at: 4.5, actor: 'ufo', do: 'scaleTo', amount: 0.08, dur: 0.8, ease: 'in' },
      { at: 5.3, actor: 'ufo', do: 'vanish', dur: 0.1 },
      { at: 5.3, actor: 'star', do: 'pop', dur: 0.3 },
      { at: 5.4, actor: 'star', do: 'flash', dur: 1.0 },
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'alien', emoji: '👋', dx: -10, dur: 1.4 },
      { at: 2.8, kind: 'puff', actor: 'ufo', dur: 0.5 },
      { at: 5.3, kind: 'burst', x: 40, y: 18, emoji: '✨', n: 6, dur: 0.9 },
    ],
    camera: [cam(GROUND), cam(WIDE, 2.6, 0.9)],
    cues: [
      { at: 0.5, say: '再見，外星人！' },
      { at: 2.4, sfx: 'plop' },
      { at: 2.8, sfx: 'whoosh' },
      { at: 4.5, sfx: 'whoosh' },
      { at: 5.3, sfx: 'clink' },
    ],
  }),
}

export default scenes
