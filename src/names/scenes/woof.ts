// 演的是字面意思：汪汪（狗叫聲）＋隊（排成一隊）——四隻狗排成一隊汪汪叫要把貓搶走的骨頭拿回來，最小的那隻叫最大聲，把自己的隊友都震倒（沒有徽章、車子、塔台、口號）。
import { scene } from '../../story/scene'

// 運動場上：四隻狗從大排到小，踏著步走進來。貓坐在箱子上，抱走了他們的骨頭。
// 大狗「汪！」——貓打哈欠；中狗「汪！」——貓舔舔手；小狗「汪！」——貓轉過身不理（越叫越落空）。
// 最小的那隻跳過大家的頭跑到最前面，吸一口好大的氣……「汪！！！」貓被震飛、骨頭飛上天，後面的隊友像骨牌一樣一隻一隻倒下。
// 骨頭掉下來剛好落在小小狗頭上。大家爬起來，小小狗站在大狗背上頂著骨頭：「汪汪隊」。
const Y = (size: number) => 77 - 0.42 * size
const BIG = { x: 86, size: 20 }
const MID = { x: 66, size: 16 }
const SMALL = { x: 48, size: 13 }
const TINY = { x: 32, size: 9 }
const BOX = { x: 134, y: 70.3 } // 箱子 size 16
const ON_BOX = 59 // 貓坐在箱子上
const FRONT = 106 // 小小狗跳到最前面
const BALL_UP = -8 // 球頂在小小狗頭上
const ON_BACK = { x: BIG.x, y: 57.5 } // 站在大狗背上

export default scene({
  duration: 9.4,
  bg: { top: '#7EC8F0', bottom: '#DDF3FF', floor: '#E8875A', scenery: 'track' },
  actors: [
    { id: 'flag', emoji: '🚩', x: 150, y: 64, size: 16 },
    { id: 'box', emoji: '📦', x: BOX.x, y: BOX.y, size: 16 },
    { id: 'cat', emoji: '🐈', x: BOX.x, y: ON_BOX, size: 13, pivot: 'center' },
    { id: 'ball', emoji: '🦴', x: BOX.x - 5, y: ON_BOX - 1, size: 7, pivot: 'center' },
    { id: 'big', emoji: '🐕', x: BIG.x, y: Y(BIG.size), size: BIG.size, flip: true },
    { id: 'mid', emoji: '🐕', x: MID.x, y: Y(MID.size), size: MID.size, flip: true },
    { id: 'small', emoji: '🐕', x: SMALL.x, y: Y(SMALL.size), size: SMALL.size, flip: true },
    { id: 'tiny', emoji: '🐕', x: TINY.x, y: Y(TINY.size), size: TINY.size, flip: true },
  ],
  moves: [
    // 踏著步排隊走進來
    { at: 0, actor: 'big', do: 'enter', from: { x: 20, y: Y(BIG.size) }, dur: 1.1, ease: 'out' },
    { at: 0.08, actor: 'mid', do: 'enter', from: { x: 0, y: Y(MID.size) }, dur: 1.1, ease: 'out' },
    { at: 0.16, actor: 'small', do: 'enter', from: { x: -18, y: Y(SMALL.size) }, dur: 1.1, ease: 'out' },
    { at: 0.24, actor: 'tiny', do: 'enter', from: { x: -32, y: Y(TINY.size) }, dur: 1.1, ease: 'out' },
    // 停！一起跳一下
    { at: 1.4, actor: 'big', do: 'hop', amount: 2, dur: 0.25 },
    { at: 1.4, actor: 'mid', do: 'hop', amount: 2, dur: 0.25 },
    { at: 1.4, actor: 'small', do: 'hop', amount: 2, dur: 0.25 },
    { at: 1.4, actor: 'tiny', do: 'hop', amount: 2, dur: 0.25 },
    // 大狗汪——貓打哈欠
    { at: 1.8, actor: 'big', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 2.0, actor: 'cat', do: 'tilt', amount: 12, dur: 0.4 },
    // 中狗汪——貓舔舔手
    { at: 2.5, actor: 'mid', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 2.7, actor: 'cat', do: 'hop', amount: 1, dur: 0.3 },
    // 小狗汪——貓轉過身
    { at: 3.15, actor: 'small', do: 'squash', amount: -0.2, dur: 0.3 },
    { at: 3.35, actor: 'cat', do: 'flip' },
    // 小小狗跳過大家的頭，跑到最前面
    { at: 3.9, actor: 'tiny', do: 'moveTo', to: { x: 58, y: Y(TINY.size) }, arc: 16, dur: 0.3, ease: 'linear' },
    { at: 4.2, actor: 'tiny', do: 'moveTo', to: { x: 76, y: Y(TINY.size) }, arc: 18, dur: 0.3, ease: 'linear' },
    { at: 4.5, actor: 'tiny', do: 'moveTo', to: { x: FRONT, y: Y(TINY.size) }, arc: 20, dur: 0.35, ease: 'out' },
    // 吸一口好大的氣……
    { at: 5.0, actor: 'tiny', do: 'squash', amount: -0.45, dur: 0.6 },
    { at: 5.0, actor: 'tiny', do: 'tint', filter: 'saturate(1.6) hue-rotate(-20deg)' },
    { at: 5.25, actor: 'tiny', do: 'shake', amount: 0.6, dur: 0.3 },
    // 「汪！！！」
    { at: 5.6, actor: 'tiny', do: 'tint', filter: '' },
    { at: 5.6, actor: 'tiny', do: 'hop', amount: 3, dur: 0.3 },
    { at: 5.65, actor: 'cat', do: 'moveTo', to: { x: 148, y: 22 }, arc: 6, dur: 0.4, ease: 'out' },
    { at: 5.65, actor: 'cat', do: 'spin', times: 2, dur: 0.8 },
    { at: 6.05, actor: 'cat', do: 'moveTo', to: { x: BOX.x, y: ON_BOX }, dur: 0.4, ease: 'bounce' },
    { at: 5.65, actor: 'ball', do: 'moveTo', to: { x: 118, y: 14 }, dur: 0.45, ease: 'out' },
    { at: 5.65, actor: 'ball', do: 'spin', times: 3, dur: 0.9 },
    // 隊友像骨牌一樣倒下
    { at: 5.75, actor: 'big', do: 'rotateTo', amount: 180, dur: 0.2, ease: 'in', pivot: 'center' },
    { at: 5.9, actor: 'mid', do: 'rotateTo', amount: 180, dur: 0.2, ease: 'in', pivot: 'center' },
    { at: 6.05, actor: 'small', do: 'rotateTo', amount: 180, dur: 0.2, ease: 'in', pivot: 'center' },
    // 球掉下來，落在小小狗頭上
    { at: 6.1, actor: 'ball', do: 'moveTo', to: { x: FRONT + 1, y: Y(TINY.size) + BALL_UP }, dur: 0.45, ease: 'bounce' },
    { at: 6.55, actor: 'tiny', do: 'squash', amount: 0.25, dur: 0.2 },
    // 大家爬起來
    { at: 6.8, actor: 'big', do: 'rotateTo', amount: -180, dur: 0.25, ease: 'back', pivot: 'center' },
    { at: 6.9, actor: 'mid', do: 'rotateTo', amount: -180, dur: 0.25, ease: 'back', pivot: 'center' },
    { at: 7.0, actor: 'small', do: 'rotateTo', amount: -180, dur: 0.25, ease: 'back', pivot: 'center' },
    // 小小狗頂著球跳上大狗的背
    { at: 7.1, actor: 'tiny', do: 'moveTo', to: ON_BACK, arc: 10, dur: 0.4, ease: 'out' },
    { at: 7.1, actor: 'ball', do: 'moveTo', to: { x: ON_BACK.x + 1, y: ON_BACK.y + BALL_UP }, arc: 10, dur: 0.4, ease: 'out' },
    { at: 7.55, actor: 'tiny', do: 'scaleTo', amount: 1.4, dur: 0.3, ease: 'back' },
    { at: 7.55, actor: 'ball', do: 'moveTo', to: { x: ON_BACK.x + 1.4, y: ON_BACK.y + BALL_UP * 1.4 }, dur: 0.3, ease: 'back' },
    { at: 7.55, actor: 'big', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 8.0, actor: 'mid', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.1, actor: 'small', do: 'hop', amount: 3, dur: 0.3 },
  ],
  fx: [
    { at: 1.4, kind: 'puff', actor: 'big', dur: 0.4 },
    { at: 1.95, kind: 'pop', actor: 'big', emoji: '💢', dx: 10, dur: 0.45 },
    { at: 2.1, kind: 'pop', actor: 'cat', emoji: '🥱', dx: 6, dur: 0.5 },
    { at: 2.65, kind: 'pop', actor: 'mid', emoji: '💢', dx: 9, dur: 0.45 },
    { at: 2.8, kind: 'pop', actor: 'cat', emoji: '😑', dx: 6, dur: 0.5 },
    { at: 3.3, kind: 'pop', actor: 'small', emoji: '💢', dx: 8, dur: 0.45 },
    { at: 3.5, kind: 'sweat', actor: 'small' },
    { at: 3.6, kind: 'pop', actor: 'tiny', emoji: '😤', dur: 0.4 },
    { at: 5.05, kind: 'puff', actor: 'tiny', n: 6, dur: 0.5 },
    { at: 5.6, kind: 'burst', actor: 'tiny', n: 1, dx: 14, dur: 0.5 },
    { at: 5.2, kind: 'sweat', actor: 'tiny' },
    { at: 5.65, kind: 'burst', actor: 'tiny', emoji: '💢', n: 6, dur: 0.6 },
    { at: 5.7, kind: 'pop', actor: 'cat', emoji: '😱', dx: 8, dur: 0.6 },
    { at: 5.9, kind: 'puff', actor: 'mid', n: 8, dur: 0.6 },
    { at: 6.3, kind: 'dizzy', actor: 'mid', dur: 0.6 },
    { at: 6.5, kind: 'dizzy', actor: 'cat', dur: 0.9 },
    { at: 6.6, kind: 'burst', actor: 'ball', emoji: '⭐', n: 5, dur: 0.6 },
    { at: 7.6, kind: 'burst', actor: 'tiny', emoji: '🎉', n: 10, dur: 1.0 },
    { at: 8.0, kind: 'burst', actor: 'big', emoji: '✨', n: 7, dur: 0.9 },
  ],
  camera: [
    { at: 4.95, dur: 0.6, do: 'zoom', amount: 1.9, to: { x: FRONT + 6, y: 62 } },
    { at: 5.6, dur: 0.5, do: 'shake', amount: 2 },
    { at: 5.65, dur: 0.3, do: 'zoom', amount: 1 },
    { at: 7.5, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 76, y: 56 } },
  ],
  lights: [
    { at: 5.0, dur: 0.5, level: 0.25 },
    { at: 5.6, dur: 0.05, level: -0.45 },
    { at: 5.65, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 0.5, sfx: 'tap' },
    { at: 1.4, sfx: 'blip' },
    { at: 1.95, sfx: 'blip' },
    { at: 2.65, sfx: 'blip' },
    { at: 3.3, sfx: 'blip' },
    { at: 3.9, sfx: 'boing' },
    { at: 5.0, sfx: 'bubble' },
    { at: 5.6, sfx: 'crack' },
    { at: 5.8, sfx: 'bonk' },
    { at: 6.55, sfx: 'plop' },
    { at: 7.7, say: '汪汪隊' },
    { at: 8.2, sfx: 'cheer' },
  ],
})
