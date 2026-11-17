import { scene } from '../scene'
import type { Clip, Vec } from '../../anim/clip'
import type { Scenes } from './index'

// 好大的屁：小恐龍吃了一大盤豆，肚子咕嚕叫、憋著屁。屁噴到花，花枯掉沉下去；噴到蜜蜂，蜜蜂暈頭轉向掉下來用走的離開；
// 噴到大象，大象像火箭一樣飛上天變成一顆星星。大家都怕他、跑光光，他大哭。小車沒電停在旁邊：用手推不動、用頭撞到眼冒金星，
// 轉身用屁股對著車尾放一個超級大屁，小車咻一聲衝出去。最後小車繞一圈回來，大家都回來歡呼，他開心到又噗一個小屁。
// 主角 rex（size 24 站在地上 y = 66.9），圖朝左，屁股（尾巴那一側）在他的右邊：屁一律往右噴，被噴的東西都放在他右邊。
// 屁是白煙道具 `prop:smoke` 染成黃綠色的雲，加 fx `blow` 那一串 💨。
// 三段 blast 誰先誰後都可能：開頭結尾都是 wait（x 62、夾腿憋著 hold、沒翻面、原本的大小、沒有染色）。
// 小車（car size 21）第五頁以後車頭朝右（flip）停在 x 104；小恐龍站在車的左後方 x 80、翻面看著車（push 三段從這一格接）。
const G = 66.9
const X = 62
const BG = { top: '#8ED0F5', bottom: '#EAF8DC', floor: '#93CC62', scenery: 'hills' as const }
/** 憋著屁等的樣子（blast 三段的開頭與結尾） */
const wait = { id: 'rex', emoji: 'hero:rex/hold', x: X, y: G, size: 24 }
/** 站在 x 時屁股的位置（沒翻面、尾巴在右邊） */
const butt = (x: number): Vec => ({ x: x + 7, y: 70 })
/** 小車停下來的地方（車頭朝右） */
// 小車圖的車身只佔畫布下面四成，size 21 站在 size 24 的小恐龍旁邊像玩具車，所以放大到 34（車身寬約 31）
const CAR_X = 108
const CAR_Y = 62.7
const car = { id: 'car', emoji: 'hero:car/broken', x: CAR_X, y: CAR_Y, size: 34, flip: true }
/** 小恐龍站在車的左後方、翻面看著車（車尾在 x 93 左右） */
const REX_CAR = 76
const atCar = { id: 'rex', emoji: 'hero:rex/ponder', x: REX_CAR, y: G, size: 24, flip: true }

/** 屁的顏色：白煙染成黃綠 */
const GAS = 'sepia(1) saturate(4) hue-rotate(24deg) brightness(.98)'
/** 一團屁雲（先藏在屁股那裡）。陣列裡放在最前面，畫在被噴的東西後面，才看得到它的反應 */
const gas = (id: string, at: Vec, size = 9) => ({ id, emoji: 'prop:smoke', ...at, size, hidden: true, float: true, pivot: 'center' as const, tint: GAS })
const gasIds = (n: number, p = 'g') => Array.from({ length: n }, (_, i) => `${p}${i}`)
/**
 * 一陣屁：ids 那幾團雲從 from 一團接一團噴向 to（越後面的越遠、上下錯開），邊飛邊變大，life 秒後散掉。
 */
function fart(at: number, ids: string[], from: Vec, to: Vec, grow = 1.9, dur = 0.45, life = 0.9): Clip['moves'] {
  return ids.flatMap((id, i) => {
    const t = +(at + i * 0.07).toFixed(2)
    const k = ids.length > 1 ? i / (ids.length - 1) : 1
    const end = { x: from.x + (to.x - from.x) * (0.45 + 0.55 * k), y: to.y + [0, -5, 4, -2, 6, -7][i % 6] }
    return [
      { at: t, actor: id, do: 'pop' as const, dur: 0.12 },
      { at: t, actor: id, do: 'moveTo' as const, to: end, dur, ease: 'out' as const },
      { at: t, actor: id, do: 'scaleTo' as const, amount: grow, dur, ease: 'out' as const },
      { at: +(t + life).toFixed(2), actor: id, do: 'vanish' as const, dur: 0.4 },
    ]
  })
}

const scenes: Scenes = {
  // 小恐龍吃了好多豆。——走進來看到一大盤豆、口水直流，撲上去三大口吃光，把盤子甩掉，坐下來摸著圓肚子
  beans: scene({
    duration: 5.4,
    bg: BG,
    actors: [
      { id: 'plate', emoji: '🍽️', x: 40, y: 72.5, size: 15, hidden: true, pivot: 'center' },
      { id: 'beans', emoji: '🫘', x: 40, y: 67, size: 16, hidden: true, pivot: 'center' },
      { ...wait, emoji: 'hero:rex/idle', hidden: true },
    ],
    moves: [
      { at: 0, actor: 'rex', do: 'enter', from: { x: 178, y: G }, dur: 1.0, ease: 'out' },
      { at: 0.25, actor: 'plate', do: 'drop', dur: 0.4 },
      { at: 0.55, actor: 'beans', do: 'drop', dur: 0.45 },
      { at: 1.05, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
      { at: 1.1, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
      // 撲上去：一口、兩口、三口
      { at: 1.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/eat' },
      { at: 1.6, actor: 'rex', do: 'moveTo', to: { x: 55, y: G }, dur: 0.25, anticipate: 3, ease: 'in' },
      ...[1.9, 2.35, 2.8].flatMap((at, i) => [
        { at, actor: 'rex', do: 'squash' as const, amount: 0.25, dur: 0.25 },
        { at, actor: 'beans', do: 'squash' as const, amount: 0.3, dur: 0.2 },
        i < 2
          ? { at, actor: 'beans', do: 'scaleTo' as const, amount: 0.7, dur: 0.1 }
          : { at, actor: 'beans', do: 'vanish' as const, dur: 0.1 },
      ]),
      // 盤子舔乾淨了，甩到後面去
      { at: 3.15, actor: 'plate', do: 'moveTo', to: { x: -20, y: 22 }, arc: 14, dur: 0.6, ease: 'out' },
      { at: 3.15, actor: 'plate', do: 'spin', times: -2, dur: 0.6 },
      { at: 3.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
      { at: 3.2, actor: 'rex', do: 'moveTo', to: { x: X, y: G }, dur: 0.45 },
      // 坐下來，肚子圓滾滾
      { at: 3.9, actor: 'rex', do: 'swap', emoji: 'hero:rex/full' },
      { at: 4.3, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.3 },
      { at: 4.7, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.3 },
    ],
    fx: [
      { at: 1.05, kind: 'pop', actor: 'rex', emoji: '❗', dur: 0.5 },
      ...[1.9, 2.35, 2.8].map((at) => ({ at, kind: 'burst' as const, actor: 'beans', emoji: '🫘', n: 5, dur: 0.5 })),
      { at: 4.0, kind: 'pop', actor: 'rex', emoji: '😋', dx: -14, dur: 1.2 },
    ],
    cues: [
      { at: 0.25, sfx: 'plop' },
      { at: 0.55, sfx: 'plop' },
      { at: 1.2, say: '小恐龍吃了好多豆。' },
      { at: 1.9, sfx: 'gulp' },
      { at: 2.35, sfx: 'gulp' },
      { at: 2.8, sfx: 'gulp' },
      { at: 3.15, sfx: 'whoosh' },
      { at: 4.3, sfx: 'boing' },
    ],
  }),

  // 他的肚子叫了。屁要來了！——肚子咕嚕咕嚕，嚇得站起來；漏出一小團「噗」，趕快夾緊，憋到發抖（三段 blast 都從這一格開始）
  belly: scene({
    duration: 5.8,
    bg: BG,
    actors: [{ ...wait, emoji: 'hero:rex/full' }, gas('p0', butt(X), 5)],
    moves: [
      { at: 0.3, actor: 'rex', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 0.3, actor: 'rex', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 0.9, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
      { at: 0.95, actor: 'rex', do: 'hop', amount: 4, dur: 0.3 },
      { at: 1.5, actor: 'rex', do: 'shake', amount: 1.2, dur: 0.5 },
      { at: 2.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/hold' },
      { at: 2.3, actor: 'rex', do: 'shake', amount: 1.2, dur: 0.6 },
      // 漏出一小團！趕快夾緊
      ...fart(3.1, ['p0'], butt(X), { x: X + 16, y: 64 }, 1.6, 0.4, 0.6),
      { at: 3.1, actor: 'rex', do: 'hop', amount: 5, dur: 0.3 },
      { at: 3.5, actor: 'rex', do: 'squash', amount: 0.2, dur: 0.3 },
      { at: 3.8, actor: 'rex', do: 'shake', amount: 2, dur: 0.8 },
      { at: 4.9, actor: 'rex', do: 'shake', amount: 1.4, dur: 0.6 },
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'rex', emoji: '❓', dur: 0.5 },
      { at: 0.95, kind: 'pop', actor: 'rex', emoji: '❗', dur: 0.6 },
      { at: 3.15, kind: 'pop', actor: 'rex', emoji: '😣', dx: -14, dur: 1.4 },
      { at: 4.3, kind: 'sweat', actor: 'rex' },
      { at: 4.9, kind: 'pop', actor: 'rex', emoji: '❗', dur: 0.6 },
    ],
    cues: [
      { at: 0.3, sfx: 'rumble' },
      { at: 0.9, sfx: 'rumble' },
      { at: 1.0, say: '他的肚子叫了。屁要來了！' },
      { at: 3.1, sfx: 'plop' },
      { at: 3.8, sfx: 'rumble' },
    ],
  }),

  // 花聞到屁，不笑了！——一朵笑咪咪的向日葵冒出來，屁噴過去，花瓣掉光、垂頭變枯，沉到地底下
  'blast:花': scene({
    duration: 6.0,
    bg: BG,
    actors: [
      ...gasIds(4).map((id) => gas(id, butt(X))),
      wait,
      { id: 'flower', emoji: '🌻', x: 106, y: 68.6, size: 20, hidden: true },
    ],
    moves: [
      { at: 0.1, actor: 'flower', do: 'pop', dur: 0.35 },
      { at: 0.5, actor: 'flower', do: 'tilt', amount: 10, dur: 0.45 },
      { at: 0.95, actor: 'flower', do: 'tilt', amount: -10, dur: 0.45 },
      // 憋不住了：抖、拉長蓄力、噴！
      { at: 0.5, actor: 'rex', do: 'shake', amount: 1.6, dur: 0.6 },
      { at: 1.1, actor: 'rex', do: 'squash', amount: -0.25, dur: 0.3 },
      { at: 1.4, actor: 'rex', do: 'squash', amount: 0.35, dur: 0.3 },
      { at: 1.4, actor: 'rex', do: 'moveTo', to: { x: X - 7, y: G }, dur: 0.25, ease: 'out' },
      ...fart(1.4, gasIds(4), butt(X), { x: 96, y: 62 }),
      { at: 1.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
      // 屁到了：花垂頭、變枯
      { at: 1.85, actor: 'flower', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 1.9, actor: 'flower', do: 'tint', filter: 'sepia(1) saturate(.7) brightness(.72)' },
      { at: 2.0, actor: 'flower', do: 'rotateTo', amount: 35, dur: 0.6, ease: 'back' },
      // 他回頭看……糟糕
      { at: 2.7, actor: 'rex', do: 'swap', emoji: 'hero:rex/back' },
      // 枯掉的花沉到地底下
      { at: 3.6, actor: 'flower', do: 'moveTo', to: { x: 106, y: 92 }, dur: 0.6, ease: 'in' },
      { at: 4.2, actor: 'flower', do: 'vanish', dur: 0.1 },
      // 肚子又咕嚕了：趕快夾緊，回到憋著的樣子
      { at: 4.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/hold' },
      { at: 4.4, actor: 'rex', do: 'moveTo', to: { x: X, y: G }, dur: 0.5 },
      { at: 5.0, actor: 'rex', do: 'hop', amount: 3, dur: 0.25 },
      { at: 5.3, actor: 'rex', do: 'shake', amount: 1.4, dur: 0.6 },
    ],
    fx: [
      { at: 0.4, kind: 'pop', actor: 'flower', emoji: '😊', dur: 1.3 },
      { at: 5.0, kind: 'pop', actor: 'rex', emoji: '😣', dx: -14, dur: 0.9 },
      { at: 1.4, kind: 'blow', x: butt(X).x, y: butt(X).y, to: { x: 104, y: 60 }, n: 5, dur: 0.6 },
      { at: 1.95, kind: 'pop', actor: 'flower', emoji: '😖', dur: 1.6 },
      { at: 2.1, kind: 'rain', actor: 'flower', emoji: '🍂', n: 6, dur: 1.3 },
      { at: 2.8, kind: 'sweat', actor: 'rex' },
      { at: 3.6, kind: 'puff', actor: 'flower', dur: 0.5 },
    ],
    camera: [{ at: 1.4, dur: 0.3, do: 'shake', amount: 0.8 }],
    cues: [
      { at: 0.1, sfx: 'boing' },
      { at: 1.4, sfx: 'deflate' },
      { at: 1.45, sfx: 'poof' },
      { at: 2.0, say: '花聞到屁，不笑了！' },
      { at: 3.6, sfx: 'slide' },
    ],
  }),

  // 蜂飛不起來了！——蜜蜂嗡嗡飛來繞著他轉，屁噴上去，蜜蜂在空中轉圈圈、直直掉下來趴在地上，暈完用走的離開
  'blast:蜂': scene({
    duration: 6.4,
    bg: BG,
    actors: [
      ...gasIds(4).map((id) => gas(id, butt(X))),
      wait,
      { id: 'bee', emoji: 'prop:bee', x: 104, y: 44, size: 12, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.1, actor: 'bee', do: 'enter', from: { x: 170, y: 22 }, dur: 0.55, ease: 'out' },
      // 繞著他的頭飛一圈，停在屁股後面
      { at: 0.7, actor: 'bee', do: 'moveTo', to: { x: 66, y: 34 }, dur: 0.45 },
      { at: 1.15, actor: 'bee', do: 'flip' },
      { at: 1.15, actor: 'bee', do: 'moveTo', to: { x: 98, y: 56 }, dur: 0.45 },
      { at: 1.6, actor: 'bee', do: 'flip' },
      { at: 0.9, actor: 'rex', do: 'shake', amount: 1.6, dur: 0.6 },
      { at: 1.5, actor: 'rex', do: 'squash', amount: -0.25, dur: 0.3 },
      { at: 1.8, actor: 'rex', do: 'squash', amount: 0.35, dur: 0.3 },
      { at: 1.8, actor: 'rex', do: 'moveTo', to: { x: X - 7, y: G }, dur: 0.25, ease: 'out' },
      ...fart(1.8, gasIds(4), butt(X), { x: 94, y: 58 }),
      { at: 2.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
      // 屁到了：空中定住、轉圈圈
      { at: 2.1, actor: 'bee', do: 'shake', amount: 1, dur: 0.3 },
      { at: 2.1, actor: 'bee', do: 'tint', filter: 'hue-rotate(50deg) saturate(1.3)' },
      { at: 2.4, actor: 'bee', do: 'spin', times: 2, dur: 0.6 },
      // 直直掉下來，啪！
      { at: 3.0, actor: 'bee', do: 'moveTo', to: { x: 100, y: 72 }, dur: 0.3, ease: 'in' },
      { at: 3.0, actor: 'bee', do: 'rotateTo', amount: 180, dur: 0.3 },
      { at: 3.3, actor: 'bee', do: 'squash', amount: 0.4, dur: 0.3 },
      { at: 3.0, actor: 'rex', do: 'swap', emoji: 'hero:rex/back' },
      // 爬起來，搖搖晃晃走掉
      { at: 4.4, actor: 'bee', do: 'rotateTo', amount: -180, dur: 0.3 },
      { at: 4.4, actor: 'bee', do: 'tint', filter: '' },
      { at: 4.75, actor: 'bee', do: 'flip' },
      { at: 4.8, actor: 'bee', do: 'moveTo', to: { x: 178, y: 72 }, dur: 1.4, ease: 'linear' },
      ...[4.8, 5.15, 5.5, 5.85].map((at, i) => ({ at, actor: 'bee', do: 'tilt' as const, amount: i % 2 ? -18 : 18, dur: 0.35 })),
      { at: 4.9, actor: 'rex', do: 'swap', emoji: 'hero:rex/hold' },
      { at: 4.9, actor: 'rex', do: 'moveTo', to: { x: X, y: G }, dur: 0.5 },
      { at: 5.6, actor: 'rex', do: 'shake', amount: 1.2, dur: 0.6 },
    ],
    fx: [
      { at: 0.3, kind: 'zzz', actor: 'bee', emoji: '🎵', dur: 1.4 },
      { at: 1.8, kind: 'blow', x: butt(X).x, y: butt(X).y, to: { x: 98, y: 52 }, n: 5, dur: 0.6 },
      { at: 2.15, kind: 'pop', actor: 'bee', emoji: '😵', dur: 0.8 },
      { at: 3.3, kind: 'burst', actor: 'bee', n: 1, dur: 0.4 },
      { at: 3.45, kind: 'dizzy', actor: 'bee', emoji: '⭐', dur: 1.6 },
      { at: 3.2, kind: 'sweat', actor: 'rex' },
    ],
    camera: [
      { at: 1.8, dur: 0.3, do: 'shake', amount: 0.8 },
      { at: 3.3, dur: 0.3, do: 'shake', amount: 0.8 },
    ],
    cues: [
      { at: 1.8, sfx: 'deflate' },
      { at: 1.85, sfx: 'poof' },
      { at: 2.2, say: '蜂飛不起來了！' },
      { at: 2.4, sfx: 'whoosh' },
      { at: 3.3, sfx: 'bonk' },
    ],
  }),

  // 屁太大了！象飛上天了！——大象走到他背後，他憋到整隻漲大發紅，超級大屁把大象像火箭一樣噴上天，變成一顆星星「叮」
  'blast:象': scene({
    duration: 6.9,
    bg: BG,
    actors: [
      ...gasIds(6).map((id) => gas(id, butt(X), 10)),
      wait,
      { id: 'ele', emoji: 'prop:elephant', x: 112, y: 60.2, size: 40, hidden: true, pivot: 'center' },
      // 星星不要放在太陽旁邊（太陽在右上），看不清楚
      { id: 'star', emoji: '⭐', x: 100, y: 12, size: 8, hidden: true, float: true, pivot: 'center' },
    ],
    moves: [
      { at: 0.05, actor: 'ele', do: 'enter', from: { x: 200, y: 60.2 }, dur: 1.0, ease: 'out' },
      // 越憋越大、越抖越兇
      { at: 1.0, actor: 'rex', do: 'shake', amount: 1.6, dur: 0.6 },
      { at: 1.2, actor: 'rex', do: 'scaleTo', amount: 1.2, dur: 0.7, ease: 'back' },
      { at: 1.5, actor: 'rex', do: 'tint', filter: 'hue-rotate(-100deg) saturate(1.6)' },
      { at: 1.6, actor: 'rex', do: 'shake', amount: 2.6, dur: 0.5 },
      { at: 2.0, actor: 'rex', do: 'squash', amount: -0.3, dur: 0.35 },
      // 噗——！
      { at: 2.35, actor: 'rex', do: 'squash', amount: 0.4, dur: 0.3 },
      { at: 2.35, actor: 'rex', do: 'scaleTo', amount: 1 / 1.2, dur: 0.3 },
      { at: 2.35, actor: 'rex', do: 'tint', filter: '' },
      { at: 2.35, actor: 'rex', do: 'moveTo', to: { x: X - 14, y: G }, dur: 0.4, ease: 'out' },
      { at: 2.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
      ...fart(2.35, gasIds(6), butt(X + 2), { x: 108, y: 60 }, 3.2, 0.4, 1.0),
      // 大象像火箭一樣飛上天：先被頂得一縮，再直直衝上去
      { at: 2.65, actor: 'ele', do: 'squash', amount: 0.3, dur: 0.2 },
      { at: 2.8, actor: 'ele', do: 'moveTo', to: { x: 100, y: -40 }, dur: 0.6, ease: 'in' },
      { at: 2.8, actor: 'ele', do: 'spin', times: 1, dur: 0.6 },
      { at: 3.45, actor: 'star', do: 'pop', dur: 0.3 },
      { at: 3.5, actor: 'star', do: 'spin', times: 1, dur: 0.5 },
      { at: 4.2, actor: 'star', do: 'flash', dur: 0.6 },
      { at: 5.3, actor: 'star', do: 'vanish', dur: 0.4 },
      // 他抬頭看傻了，然後笑翻
      { at: 3.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/back' },
      { at: 4.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/laugh' },
      { at: 4.3, actor: 'rex', do: 'tilt', amount: -10, dur: 0.4 },
      { at: 4.7, actor: 'rex', do: 'tilt', amount: 10, dur: 0.4 },
      { at: 5.1, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
      { at: 5.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/hold' },
      { at: 5.6, actor: 'rex', do: 'moveTo', to: { x: X, y: G }, dur: 0.5 },
      { at: 6.2, actor: 'rex', do: 'shake', amount: 1.2, dur: 0.6 },
    ],
    fx: [
      { at: 1.1, kind: 'pop', actor: 'ele', emoji: '❓', dur: 0.7 },
      { at: 1.6, kind: 'sweat', actor: 'rex' },
      { at: 2.35, kind: 'blow', x: butt(X + 2).x, y: butt(X + 2).y, to: { x: 112, y: 56 }, n: 6, dur: 0.6 },
      { at: 2.35, kind: 'puff', actor: 'rex', dur: 0.5 },
      { at: 2.65, kind: 'pop', actor: 'ele', emoji: '😱', dur: 0.4 },
      ...[2.95, 3.1, 3.25].map((at, i) => ({ at, kind: 'burst' as const, x: 110 - i * 4, y: 66 - i * 18, emoji: '💨', n: 1, dur: 0.5 })),
      { at: 3.5, kind: 'burst', x: 100, y: 14, emoji: '✨', n: 6, dur: 0.8 },
    ],
    camera: [
      { at: 2.35, dur: 0.6, do: 'shake', amount: 2.4 },
      // 大象飛上天、星星在最上面：定住全景（自動取景會框著他，把天上的星星切掉）
      { at: 2.7, dur: 0.4, do: 'zoom', amount: 1, to: { x: 80, y: 45 } },
    ],
    cues: [
      { at: 1.0, sfx: 'rumble' },
      { at: 2.35, sfx: 'deflate' },
      { at: 2.4, sfx: 'poof' },
      { at: 2.6, say: '屁太大了！象飛上天了！' },
      { at: 2.8, sfx: 'whoosh' },
      { at: 3.45, sfx: 'clink' },
    ],
  }),

  // 大家都怕他的屁。他哭了。——放完屁一身輕鬆，朋友們跑來找他玩；他一走過去，大家捏著鼻子跑光，他一個人大哭（眼淚噴泉）
  alone: scene({
    duration: 7.0,
    bg: BG,
    actors: [
      wait,
      { id: 'flower', emoji: '🌻', x: 110, y: 68.6, size: 20, hidden: true },
      { id: 'frog', emoji: 'prop:frog', x: 132, y: 69.4, size: 18, hidden: true },
      { id: 'sq', emoji: '🐿️', x: 89, y: 71.5, size: 13, hidden: true },
      { id: 'bee', emoji: 'prop:bee', x: 116, y: 42, size: 12, hidden: true, float: true },
    ],
    moves: [
      { at: 0.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
      { at: 0.25, actor: 'rex', do: 'hop', amount: 5, dur: 0.35 },
      // 朋友們來了
      { at: 0.4, actor: 'flower', do: 'pop', dur: 0.35 },
      { at: 0.4, actor: 'sq', do: 'enter', from: { x: 176, y: 71.5 }, dur: 0.8, ease: 'out' },
      { at: 0.5, actor: 'frog', do: 'enter', from: { x: 182, y: 69.4 }, dur: 0.8, ease: 'out' },
      { at: 0.6, actor: 'bee', do: 'enter', from: { x: 172, y: 18 }, dur: 0.7, ease: 'out' },
      { at: 1.2, actor: 'rex', do: 'flip' },
      { at: 1.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/wave' },
      { at: 1.6, actor: 'rex', do: 'moveTo', to: { x: 70, y: G }, dur: 0.5 },
      // 好臭！大家捏著鼻子跑光
      ...(['sq', 'flower', 'bee', 'frog'] as const).map((id, i) => ({ at: 2.0 + i * 0.08, actor: id, do: 'shake' as const, amount: 1, dur: 0.3 })),
      { at: 2.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
      { at: 2.5, actor: 'sq', do: 'flip' },
      { at: 2.5, actor: 'sq', do: 'moveTo', to: { x: 182, y: 71.5 }, dur: 0.7, ease: 'in' },
      { at: 2.6, actor: 'bee', do: 'flip' },
      { at: 2.6, actor: 'bee', do: 'moveTo', to: { x: 178, y: 14 }, dur: 0.7, ease: 'in' },
      { at: 2.65, actor: 'frog', do: 'flip' },
      { at: 2.65, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
      { at: 2.7, actor: 'frog', do: 'moveTo', to: { x: 188, y: 69.4 }, arc: 16, dur: 0.8, ease: 'in' },
      // 花把根拔出來，一跳一跳逃走
      { at: 2.7, actor: 'flower', do: 'hop', amount: 6, dur: 0.3 },
      { at: 3.0, actor: 'flower', do: 'moveTo', to: { x: 180, y: 68.6 }, arc: 8, dur: 0.9, ease: 'in' },
      { at: 2.9, actor: 'rex', do: 'swap', emoji: 'hero:rex/reach' },
      // 一個人，大哭
      { at: 3.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/cry' },
      ...[3.9, 4.6, 5.3, 6.0, 6.6].map((at) => ({ at, actor: 'rex', do: 'squash' as const, amount: 0.15, dur: 0.3 })),
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'rex', emoji: '😌', dx: -14, dur: 0.9 },
      { at: 0.3, kind: 'stink', actor: 'rex', dx: 8, dy: 2, dur: 3.2 },
      { at: 1.3, kind: 'pop', actor: 'rex', emoji: '💗', dur: 0.7 },
      { at: 2.0, kind: 'pop', actor: 'sq', emoji: '🤢', dur: 0.7 },
      { at: 2.08, kind: 'pop', actor: 'flower', emoji: '🤢', dur: 0.7 },
      { at: 2.16, kind: 'pop', actor: 'bee', emoji: '🤢', dur: 0.6 },
      { at: 2.24, kind: 'pop', actor: 'frog', emoji: '🤢', dur: 0.6 },
      { at: 2.35, kind: 'sweat', actor: 'rex' },
      { at: 3.7, kind: 'fountain', actor: 'rex', emoji: '💧', dur: 1.4 },
      { at: 5.2, kind: 'fountain', actor: 'rex', emoji: '💧', dur: 1.4 },
    ],
    cues: [
      { at: 0.4, sfx: 'boing' },
      { at: 1.4, say: '大家都怕他的屁。他哭了。' },
      { at: 2.5, sfx: 'whoosh' },
      { at: 2.7, sfx: 'boing' },
    ],
  }),

  // 小車沒電了，不會走。——小車噗噗噗開進來，從他腳底下鑽過去（他嚇得跳起來），在前面熄火冒煙，電池變灰；他不哭了，歪頭看
  stuck: scene({
    duration: 6.0,
    bg: BG,
    actors: [
      { ...car, emoji: 'hero:car/idle', hidden: true },
      { ...wait, emoji: 'hero:rex/cry', x: 70, flip: true },
      { id: 'batt', emoji: '🔋', x: CAR_X, y: 42, size: 10, hidden: true, float: true },
    ],
    moves: [
      { at: 0.2, actor: 'car', do: 'enter', from: { x: -30, y: CAR_Y }, dur: 1.7, ease: 'out' },
      ...[0.5, 0.9, 1.3].map((at) => ({ at, actor: 'car', do: 'hop' as const, amount: 1.5, dur: 0.2 })),
      { at: 0.3, actor: 'rex', do: 'squash', amount: 0.15, dur: 0.3 },
      { at: 0.65, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
      { at: 0.7, actor: 'rex', do: 'hop', amount: 18, dur: 0.75 },
      // 熄火
      { at: 2.0, actor: 'car', do: 'shake', amount: 1, dur: 0.4 },
      { at: 2.0, actor: 'car', do: 'swap', emoji: 'hero:car/broken' },
      { at: 2.15, actor: 'batt', do: 'pop', dur: 0.3 },
      { at: 2.7, actor: 'batt', do: 'tint', filter: 'grayscale(1) brightness(.8)' },
      { at: 2.7, actor: 'batt', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 4.6, actor: 'batt', do: 'vanish', dur: 0.3 },
      // 不哭了，走過去歪頭看
      { at: 2.4, actor: 'rex', do: 'moveTo', to: { x: REX_CAR, y: G }, dur: 0.5 },
      { at: 3.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
      { at: 3.3, actor: 'rex', do: 'tilt', amount: 10, dur: 0.6 },
    ],
    fx: [
      ...[0.5, 0.9, 1.3].map((at) => ({ at, kind: 'puff' as const, actor: 'car', dur: 0.45 })),
      { at: 0.7, kind: 'pop', actor: 'rex', emoji: '❗', dur: 0.5 },
      { at: 2.0, kind: 'burst', actor: 'car', emoji: '💨', n: 1, dx: -12, dy: 6, dur: 0.6 },
      { at: 2.75, kind: 'pop', actor: 'car', emoji: '😵', dx: 6, dy: 4, dur: 1.4 },
      { at: 3.3, kind: 'pop', actor: 'rex', emoji: '❓', dur: 1.0 },
    ],
    cues: [
      { at: 0.5, sfx: 'poof' },
      { at: 0.9, sfx: 'poof' },
      { at: 1.3, sfx: 'poof' },
      { at: 2.0, sfx: 'deflate' },
      { at: 2.2, say: '小車沒電了，不會走。' },
    ],
  }),

  // 用手推，車不走。——雙手用力推，臉漲紅、腳一直打滑揚塵，車一動也不動（還一臉無聊），他累到喘氣
  'push:手': scene({
    duration: 5.2,
    bg: BG,
    actors: [car, atCar],
    moves: [
      { at: 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/push' },
      { at: 0.15, actor: 'rex', do: 'moveTo', to: { x: 84, y: G }, dur: 0.25 },
      { at: 0.5, actor: 'rex', do: 'tint', filter: 'hue-rotate(-60deg) saturate(1.5)' },
      { at: 0.5, actor: 'rex', do: 'shake', amount: 1.2, dur: 1.8 },
      ...[0.7, 1.05, 1.4, 1.75, 2.1].map((at) => ({ at, actor: 'rex', do: 'hop' as const, amount: 1.5, dur: 0.18 })),
      { at: 2.4, actor: 'rex', do: 'tint', filter: '' },
      { at: 2.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/tired' },
      { at: 2.4, actor: 'rex', do: 'moveTo', to: { x: 72, y: G }, dur: 0.35, ease: 'out' },
      ...[2.9, 3.35, 3.8].map((at) => ({ at, actor: 'rex', do: 'squash' as const, amount: 0.12, dur: 0.35 })),
      { at: 4.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
      { at: 4.3, actor: 'rex', do: 'moveTo', to: { x: REX_CAR, y: G }, dur: 0.3 },
    ],
    fx: [
      ...[0.7, 1.05, 1.4, 1.75, 2.1].map((at) => ({ at, kind: 'puff' as const, actor: 'rex', dur: 0.45 })),
      { at: 0.6, kind: 'pop', actor: 'rex', emoji: '💢', dx: -14, dur: 1.4 },
      { at: 1.6, kind: 'pop', actor: 'car', emoji: '😑', dx: 6, dy: 4, dur: 1.6 },
      { at: 2.5, kind: 'sweat', actor: 'rex' },
      { at: 2.6, kind: 'pop', actor: 'rex', emoji: '😮‍💨', dx: -14, dur: 1.4 },
    ],
    cues: [
      { at: 0.6, say: '用手推，車不走。' },
      { at: 0.7, sfx: 'slide' },
      { at: 1.4, sfx: 'slide' },
      { at: 2.1, sfx: 'slide' },
    ],
  }),

  // 用頭推！頭上有星星！——退後、跺腳、低頭衝過去「咚」撞上車尾，車只晃一下；他彈回來，轉圈圈坐倒，頭上一圈星星
  'push:頭': scene({
    duration: 5.8,
    bg: BG,
    actors: [car, atCar],
    moves: [
      { at: 0.15, actor: 'rex', do: 'moveTo', to: { x: 56, y: G }, dur: 0.6 },
      { at: 0.8, actor: 'rex', do: 'swap', emoji: 'hero:rex/stomp' },
      { at: 0.85, actor: 'rex', do: 'hop', amount: 3, dur: 0.2 },
      { at: 1.1, actor: 'rex', do: 'hop', amount: 3, dur: 0.2 },
      { at: 1.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
      { at: 1.4, actor: 'rex', do: 'moveTo', to: { x: 84, y: G }, dur: 0.35, anticipate: 4, ease: 'in' },
      // 咚！
      { at: 1.75, actor: 'car', do: 'shake', amount: 1, dur: 0.35 },
      { at: 1.75, actor: 'car', do: 'tilt', amount: 6, dur: 0.4 },
      { at: 1.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/dizzy' },
      { at: 1.75, actor: 'rex', do: 'moveTo', to: { x: 66, y: G }, arc: 8, dur: 0.45, ease: 'out' },
      { at: 2.25, actor: 'rex', do: 'spin', times: 1, dur: 0.6, pivot: 'center' },
      { at: 2.9, actor: 'rex', do: 'squash', amount: 0.25, dur: 0.3 },
      // 爬起來，甩甩頭
      { at: 4.5, actor: 'rex', do: 'swap', emoji: 'hero:rex/ponder' },
      { at: 4.55, actor: 'rex', do: 'shake', amount: 0.8, dur: 0.3 },
      { at: 4.8, actor: 'rex', do: 'moveTo', to: { x: REX_CAR, y: G }, dur: 0.5 },
    ],
    fx: [
      ...[0.85, 1.1].map((at) => ({ at, kind: 'puff' as const, actor: 'rex', dur: 0.4 })),
      { at: 0.9, kind: 'pop', actor: 'rex', emoji: '😤', dx: -14, dur: 0.6 },
      { at: 1.75, kind: 'burst', x: 92, y: 56, n: 1, dur: 0.45 },
      { at: 2.0, kind: 'dizzy', actor: 'rex', emoji: '⭐', dur: 2.5 },
      { at: 2.3, kind: 'pop', actor: 'car', emoji: '😆', dx: 6, dy: 4, dur: 1.4 },
    ],
    camera: [{ at: 1.75, dur: 0.35, do: 'shake', amount: 1.6 }],
    cues: [
      { at: 0.85, sfx: 'tap' },
      { at: 1.1, sfx: 'tap' },
      { at: 1.2, say: '用頭推！頭上有星星！' },
      { at: 1.75, sfx: 'bonk' },
      { at: 2.3, sfx: 'boing' },
    ],
  }),

  // 好大的屁！小車跑好快！——想到了！轉身用屁股對著車尾，憋氣、超級大屁，小車像火箭一樣衝出去，他被反作用力彈翻一圈，歡呼
  'push:屁': scene({
    duration: 6.4,
    bg: BG,
    actors: [...gasIds(6).map((id) => gas(id, butt(84), 10)), car, atCar],
    moves: [
      { at: 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/know' },
      { at: 0.15, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
      // 轉身，屁股對著車尾
      { at: 0.65, actor: 'rex', do: 'flip' },
      { at: 0.65, actor: 'rex', do: 'swap', emoji: 'hero:rex/hold' },
      { at: 0.7, actor: 'rex', do: 'moveTo', to: { x: 84, y: G }, dur: 0.25 },
      { at: 1.0, actor: 'rex', do: 'shake', amount: 1.8, dur: 0.6 },
      { at: 1.35, actor: 'rex', do: 'squash', amount: -0.3, dur: 0.35 },
      // 噗——！
      { at: 1.7, actor: 'rex', do: 'squash', amount: 0.4, dur: 0.3 },
      ...fart(1.7, gasIds(6), butt(84), { x: 104, y: 58 }, 2.8, 0.4, 1.0),
      { at: 1.75, actor: 'car', do: 'swap', emoji: 'hero:car/fast' },
      { at: 1.8, actor: 'car', do: 'moveTo', to: { x: 230, y: CAR_Y }, dur: 0.5, anticipate: 2, ease: 'in' },
      // 他被反作用力往左彈、翻一圈
      { at: 1.75, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
      { at: 1.75, actor: 'rex', do: 'moveTo', to: { x: 46, y: G }, arc: 14, dur: 0.7, ease: 'out' },
      { at: 1.75, actor: 'rex', do: 'spin', times: -1, dur: 0.7, pivot: 'center' },
      { at: 2.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
      { at: 3.4, actor: 'rex', do: 'hop', amount: 7, dur: 0.4 },
      { at: 4.2, actor: 'rex', do: 'hop', amount: 6, dur: 0.4 },
      { at: 5.0, actor: 'rex', do: 'hop', amount: 4, dur: 0.35 },
    ],
    fx: [
      { at: 0.2, kind: 'pop', actor: 'rex', emoji: '💡', dur: 0.6 },
      { at: 1.0, kind: 'sweat', actor: 'rex' },
      { at: 1.7, kind: 'blow', x: butt(84).x, y: butt(84).y, to: { x: 110, y: 60 }, n: 6, dur: 0.6 },
      ...[1.95, 2.1, 2.25].map((at, i) => ({ at, kind: 'burst' as const, x: 112 + i * 22, y: 64, emoji: '💨', n: 1, dur: 0.5 })),
      { at: 3.4, kind: 'burst', actor: 'rex', emoji: '🎉', n: 8, dur: 1.0 },
      { at: 4.2, kind: 'burst', actor: 'rex', emoji: '⭐', n: 8, dur: 1.0 },
    ],
    camera: [{ at: 1.7, dur: 0.5, do: 'shake', amount: 2.2 }],
    cues: [
      { at: 1.0, sfx: 'rumble' },
      { at: 1.7, sfx: 'deflate' },
      { at: 1.75, sfx: 'poof' },
      { at: 1.85, sfx: 'whoosh' },
      { at: 2.0, say: '好大的屁！小車跑好快！' },
      { at: 3.4, sfx: 'cheer' },
    ],
  }),

  // 大家都愛他的屁了！——小車繞地球一圈從左邊開回來按喇叭，花、蜂、大象、青蛙、松鼠都回來歡呼；他得意到又噗一個小屁，
  // 大家一起彈起來，然後笑成一團
  love: scene({
    duration: 7.2,
    bg: BG,
    actors: [
      ...gasIds(2).map((id) => gas(id, butt(X), 7)),
      { ...car, emoji: 'hero:car/happy', x: 24, hidden: true },
      { id: 'ele', emoji: 'prop:elephant', x: 136, y: 62.7, size: 34, hidden: true },
      { id: 'flower', emoji: '🌻', x: 114, y: 68.6, size: 20, hidden: true },
      { id: 'frog', emoji: 'prop:frog', x: 98, y: 69.4, size: 18, hidden: true },
      { id: 'sq', emoji: '🐿️', x: 82, y: 71.5, size: 13, hidden: true },
      { ...wait, emoji: 'hero:rex/happy', x: 46 },
      { id: 'bee', emoji: 'prop:bee', x: 100, y: 38, size: 12, hidden: true, float: true },
    ],
    moves: [
      { at: 0.2, actor: 'rex', do: 'moveTo', to: { x: X, y: G }, dur: 0.6 },
      { at: 0.4, actor: 'car', do: 'enter', from: { x: -30, y: CAR_Y }, dur: 0.9, ease: 'back' },
      { at: 1.4, actor: 'car', do: 'hop', amount: 2.5, dur: 0.2 },
      { at: 1.65, actor: 'car', do: 'hop', amount: 2.5, dur: 0.2 },
      { at: 0.3, actor: 'ele', do: 'enter', from: { x: 205, y: 62.7 }, dur: 1.2, ease: 'out' },
      { at: 0.6, actor: 'flower', do: 'pop', dur: 0.35 },
      { at: 0.5, actor: 'sq', do: 'enter', from: { x: 180, y: 71.5 }, dur: 0.9, ease: 'out' },
      { at: 0.7, actor: 'frog', do: 'enter', from: { x: 178, y: 69.4 }, dur: 1.0, ease: 'out' },
      { at: 0.8, actor: 'bee', do: 'enter', from: { x: 168, y: 14 }, dur: 0.8, ease: 'out' },
      // 大家歡呼
      ...(['frog', 'flower', 'sq', 'ele'] as const).map((id, i) => ({ at: 2.0 + i * 0.1, actor: id, do: 'hop' as const, amount: 5, dur: 0.35 })),
      { at: 2.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/smug' },
      { at: 3.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
      { at: 3.45, actor: 'rex', do: 'hop', amount: 5, dur: 0.35 },
      // 又噗一個小屁！大家一起彈起來
      { at: 4.2, actor: 'rex', do: 'squash', amount: -0.2, dur: 0.25 },
      { at: 4.45, actor: 'rex', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 4.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
      ...fart(4.45, gasIds(2), butt(X), { x: X + 20, y: 64 }, 1.8, 0.4, 0.8),
      ...(['frog', 'flower', 'sq', 'ele', 'car'] as const).map((id) => ({ at: 4.6, actor: id, do: 'hop' as const, amount: 7, dur: 0.35 })),
      { at: 4.6, actor: 'bee', do: 'hop', amount: 5, dur: 0.35 },
      // 笑成一團
      { at: 5.2, actor: 'rex', do: 'swap', emoji: 'hero:rex/laugh' },
      { at: 5.2, actor: 'ele', do: 'swap', emoji: 'prop:elephant-laugh' },
      { at: 5.3, actor: 'frog', do: 'tilt', amount: 12, dur: 0.5 },
      { at: 5.3, actor: 'flower', do: 'tilt', amount: -12, dur: 0.5 },
      { at: 5.8, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
      { at: 6.2, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      { at: 1.4, kind: 'pop', actor: 'car', emoji: '📯', dx: 6, dy: 4, dur: 0.6 },
      { at: 1.9, kind: 'burst', x: 100, y: 36, emoji: '🎉', n: 8, dur: 1.0 },
      { at: 2.2, kind: 'burst', actor: 'rex', emoji: '💖', n: 8, dur: 1.0 },
      { at: 2.5, kind: 'pop', actor: 'rex', emoji: '😎', dx: -14, dur: 0.8 },
      { at: 4.6, kind: 'pop', actor: 'frog', emoji: '❗', dur: 0.5 },
      { at: 4.6, kind: 'pop', actor: 'sq', emoji: '❗', dur: 0.5 },
      { at: 5.3, kind: 'pop', actor: 'frog', emoji: '🤣', dur: 1.4 },
      { at: 5.4, kind: 'pop', actor: 'flower', emoji: '😆', dur: 1.3 },
      { at: 5.5, kind: 'pop', actor: 'car', emoji: '😆', dx: 6, dy: 4, dur: 1.2 },
      { at: 5.8, kind: 'burst', x: 96, y: 34, emoji: '💖', n: 10, dur: 1.2 },
    ],
    cues: [
      { at: 0.4, sfx: 'whoosh' },
      { at: 1.4, sfx: 'blip' },
      { at: 1.65, sfx: 'blip' },
      { at: 1.9, say: '大家都愛他的屁了！' },
      { at: 2.0, sfx: 'cheer' },
      { at: 4.45, sfx: 'plop' },
      { at: 4.6, sfx: 'boing' },
      { at: 5.6, sfx: 'cheer' },
    ],
  }),
}

export default scenes
