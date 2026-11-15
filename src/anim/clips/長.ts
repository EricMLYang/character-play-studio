import type { Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 長（v2）：地上的洞口露出一截綠色的蛇尾巴，楊捷睿抓住用力一拉——「啵」地拉出好長一截，他往後飛出去跌坐，傻眼：還沒完！
// 一次比一次長：半個畫面（長的頭髮從拉出來的蛇身上飛出來）→ 整個畫面（中間最長的一橫）→ 先停一拍：他擦汗、看看到底還有多長，
// 再用力一拉，長長的蛇身噴出來把他整個人纏了三圈（下面的撇捺）。字拼好後長頸鹿走過來（長頸鹿），伸長脖子咬住他的衣領一起拉——
// 回馬槍：終於拉到底了，蹦出來的蛇頭小得可笑，楊捷睿和長頸鹿一起往後摔成一團。
// 最後畫面暗下來只剩「長」，楊捷睿轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「長！」，然後退場只留字。
// 長、長、長頸鹿、這是什麼字？、長
const YS = 26
const P = 77 - 0.42 * YS // 楊捷睿站在地上的 y
/** 洞口（蛇從這裡被拉出來） */
const HOLE: Vec = { x: 22, y: 72.5 }
/** 楊捷睿握拳的地方（pull 姿勢圖朝左，拳頭在左前方；照他的 x、y 算） */
const FIST = { dx: -0.18 * YS, dy: 0.08 * YS }
/** 蛇身的顏色與粗細（跟 3D 的 🐍 同一種綠） */
const SNAKE = '#3DAE6A'
const SNAKE_W = 4.6
/** 他站的地方：開場抓尾巴、第 1 次拉完、第 2 次拉完（整個畫面）、第 4 次跟長頸鹿一起拉 */
const X0 = 40
const X1 = 80
const X2 = 130
const X4 = 54
/** 長頸鹿（🦒 朝左，頭在左上）：語詞那一刻在畫面中間、最大 */
const GS = 40
const GX = 82
const GY = 77 - 0.42 * GS
/** 拉的那一下前，他咬牙用力多久（預備） */
const WIND = 0.7
/** 最後蹦出來的小蛇（3D 🐍 的尾巴在右下） */
const SNS = 12
const SNX = 42
const SNY = 77 - 0.42 * SNS
const TAIL = { dx: 0.36 * SNS, dy: 0.3 * SNS }

/** 蛇身中段（筆畫從拉出來的那一截飛出來） */
const mid = (x: number): Vec => ({ x: (HOLE.x + x) / 2, y: 70 })

/**
 * 「啵」：他雙手往後拉、咬牙抖（預備），洞口抖一下、鼓起來 →「啵」地拉出一大截，洞口 💥＋白光＋鏡頭推近＋震＋同一個音效，
 * 他抓著尾巴往後飛出去（toX；沒寫就是原地被纏住）。at 是「啵」的那一刻，k 是第幾次（越後面越大）。
 */
function pull(at: number, k: number, toX?: number) {
  const fly = 0.32 + 0.04 * k
  const moves: Move[] = [
    { at: at - WIND, actor: 'yang', do: 'swap', emoji: 'hero:yang/pull' },
    { at: at - WIND + 0.1, actor: 'yang', do: 'shake', amount: 0.4 + 0.2 * k, dur: WIND - 0.15 },
    { at: at - 0.45, actor: 'hole', do: 'shake', amount: 0.8 + 0.3 * k, dur: 0.3 },
    { at: at - 0.18, actor: 'hole', do: 'squash', amount: -0.3, dur: 0.18 },
    { at, actor: 'hole', do: 'squash', amount: 0.4, dur: 0.25 },
    { at, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
  ]
  if (toX !== undefined) {
    moves.push(
      { at, actor: 'yang', do: 'moveTo', to: { x: toX, y: P }, arc: 5 + 3 * k, dur: fly, ease: 'out' },
      // 一屁股跌坐，再坐起來傻眼看著那一長條：還沒完？
      { at: at + fly, actor: 'yang', do: 'swap', emoji: 'hero:yang/fall' },
      { at: at + fly + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    )
  }
  const fx: Fx[] = [
    { at, kind: 'burst', x: HOLE.x + 3, y: HOLE.y - 9, n: 1, dur: 0.4, scale: 1.4 + 0.35 * k },
    { at, kind: 'burst', x: HOLE.x + 3, y: HOLE.y - 9, emoji: '⭐', n: 4 + 2 * k, dur: 0.4 },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * k, to: { x: 80, y: 56 } },
    { at, dur: 0.3, do: 'shake', amount: 0.9 + 0.45 * k },
  ]
  // 同一個音效（啵＋咻），一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'boing' }, { at: at + 0.03, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'slide' })
  if (k >= 2) cues.push({ at: at + 0.1, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/** 一圈蛇身纏在他身上（cy 是這一圈的高度）：從他身上畫一圈橢圓 */
function coil(at: number, dur: number, cx: number, cy: number, rx: number, ry: number): Fx[] {
  const N = 16
  const pt = (i: number) => ({ x: cx + rx * Math.cos((i / N) * 2 * Math.PI), y: cy + ry * Math.sin((i / N) * 2 * Math.PI) })
  // 只畫前面那半圈（繞到他身體後面的那半圈看不到），中間留空看得到他的臉
  return Array.from({ length: N / 2 }, (_, i): Fx => {
    const a = pt(i), b = pt(i + 1)
    return { at, dur, kind: 'line', actor: 'yang', dx: a.x - cx, dy: a.y - P, to: b, color: SNAKE, width: 2.6 }
  })
}

const H1 = 1.5, H2 = 3.15, H3 = 5.8, H4 = 9.35
const s1 = pull(H1, 0, X1)
const s2 = pull(H2, 1, X2)
const s3 = pull(H3, 2)
const s4 = pull(H4, 3, 114)
const HOME = 6.75
const PARK = 7.65
/** 纏住到解開 */
const WRAP = H3 + 0.2
const UNWRAP = 7.4
/** 纏住的三圈高度（中間留空看得到他） */
const COIL_Y = [P - 5, P + 2, P + 8]
/** 語詞那一刻（長頸鹿走到中間） */
const WORD = 8.3
const ASK = 10.95
const ANSWER = 13.6

const clip: Clip = {
  format: 2,
  char: '長',
  meta: { theme: '拉不完的長蛇', cast: '楊捷睿＋長頸鹿＋小蛇＋洞', gags: ['楊捷睿抓住洞口的蛇尾巴用力一拉，每次「啵」地拉出更長一截、他往後飛出去跌坐，一次比一次長（半個畫面→整個畫面→噴出來把他纏三圈）；回馬槍是長頸鹿咬住他的衣領一起拉，終於拉到底，蹦出來的蛇頭小得可笑，兩個一起往後摔'] },
  duration: 15,
  bg: { top: '#FFEFC2', bottom: '#FFFAEA', floor: '#D8C47E', scenery: 'hills' },
  actors: [
    { id: 'hole', emoji: '🕳️', x: HOLE.x, y: HOLE.y, size: 16 },
    { id: 'snake', emoji: '🐍', x: HOLE.x, y: HOLE.y, size: SNS, hidden: true },
    { id: 'giraffe', emoji: '🦒', x: GX, y: GY, size: GS, hidden: true },
    { id: 'yang', emoji: 'hero:yang/walk', x: X0, y: P, size: YS, hidden: true },
  ],
  moves: [
    // 楊捷睿走進來，看到洞口露出一截尾巴：長的耶！
    { at: 0, actor: 'yang', do: 'enter', from: { x: 185, y: P }, dur: 0.45, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第 1 次：抓住尾巴，用力拉——啵！飛到畫面中間
    ...s1.moves,
    // 第 2 次：坐著就再拉——啵！飛到畫面另一頭，蛇身橫過整個畫面
    ...s2.moves,
    // 第 3 次前停一拍：他擦汗、看看到底還有多長
    { at: 4.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/tired' },
    { at: 4.8, actor: 'yang', do: 'swap', emoji: 'hero:yang/ponder' },
    { at: 4.85, actor: 'yang', do: 'tilt', amount: -8, dur: 0.3 },
    ...s3.moves,
    // ……啵！長長的蛇身噴出來，他被捲得原地轉兩圈、纏住
    { at: H3, actor: 'yang', do: 'spin', times: 2, dur: 0.35, pivot: 'center' },
    { at: H3, actor: 'yang', do: 'hop', amount: 5, dur: 0.35 },
    { at: WRAP + 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/scared' },
    // 國字放大時他纏著跳兩下
    { at: 6.9, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.2 },
    { at: 7.15, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.2 },
    // 掙脫，抓著尾巴走回來；長頸鹿走過來看
    { at: UNWRAP, actor: 'yang', do: 'spin', times: -1, dur: 0.25, pivot: 'center' },
    { at: UNWRAP + 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: UNWRAP + 0.25, actor: 'yang', do: 'moveTo', to: { x: X4, y: P }, dur: 0.5 },
    { at: 7.8, actor: 'giraffe', do: 'enter', from: { x: 200, y: GY }, dur: 0.45, ease: 'out' },
    // 語詞那一刻：長頸鹿把脖子伸得更長；他回頭看，好長！
    { at: WORD - 0.1, actor: 'yang', do: 'flip' },
    { at: WORD - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: WORD, actor: 'giraffe', do: 'scaleTo', amount: 1.12, dur: 0.25, ease: 'back' },
    { at: WORD, actor: 'giraffe', do: 'stretchTo', amount: 1 / 1.12, dur: 0.25, ease: 'back' },
    { at: WORD + 0.5, actor: 'giraffe', do: 'scaleTo', amount: 1 / 1.12, dur: 0.2 },
    { at: WORD + 0.5, actor: 'giraffe', do: 'stretchTo', amount: 1.12, dur: 0.2 },
    // 回馬槍（第 4 次）：長頸鹿低頭咬住他的衣領，兩個一起拉
    { at: H4 - WIND - 0.05, actor: 'yang', do: 'flip' },
    { at: H4 - WIND, actor: 'giraffe', do: 'rotateTo', amount: -28, dur: 0.25 },
    { at: H4 - WIND + 0.1, actor: 'giraffe', do: 'shake', amount: 0.6, dur: WIND - 0.15 },
    ...s4.moves,
    // 啵！拉到底了：蛇頭小小一隻蹦出來；兩個一起往後摔
    { at: H4, actor: 'snake', do: 'pop', dur: 0.2 },
    { at: H4, actor: 'snake', do: 'moveTo', to: { x: SNX, y: SNY }, arc: 12, dur: 0.4, ease: 'out' },
    { at: H4, actor: 'giraffe', do: 'rotateTo', amount: 58, dur: 0.35, ease: 'out' },
    { at: H4, actor: 'giraffe', do: 'moveTo', to: { x: 128, y: GY }, dur: 0.35, ease: 'out' },
    { at: H4 + 0.45, actor: 'giraffe', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: H4 + 0.4, actor: 'snake', do: 'hop', amount: 2, dur: 0.2 },
    // 小蛇溜回洞裡，長頸鹿爬起來走掉，洞口也收起來
    { at: 10.45, actor: 'snake', do: 'moveTo', to: HOLE, dur: 0.25, ease: 'in' },
    { at: 10.7, actor: 'snake', do: 'vanish', dur: 0.1 },
    { at: 10.4, actor: 'giraffe', do: 'rotateTo', amount: -30, dur: 0.2 },
    { at: H4 + 0.35, actor: 'giraffe', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 10.6, actor: 'giraffe', do: 'moveTo', to: { x: 210, y: GY }, dur: 0.35, ease: 'in' },
    { at: 10.75, actor: 'hole', do: 'vanish', dur: 0.2 },
    // 問他：楊捷睿跳到左前方、變大，轉向觀眾
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, actor: 'yang', do: 'flip' },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 32, y: -50 }, dur: 0.01 },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.45, dur: 0.01 },
    { at: ASK + 0.1, actor: 'yang', do: 'moveTo', to: { x: 32, y: P + 4 }, dur: 0.25, ease: 'in' },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.0, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.0, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.55, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.05, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: ANSWER, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: ANSWER, actor: 'yang', do: 'hop', amount: 8, dur: 0.2 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'flip' },
    { at: ANSWER + 0.2, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.15, ease: 'in' },
  ],
  builds: [
    // 每拉出一截，長的一部分就從拉出來的蛇身上飛出來：長頭髮（上面的橫與豎）→ 中間最長的一橫 → 身體和腳（撇、點、捺）
    { at: H1 + 0.25, dur: 0.5, strokes: [0, 1, 2, 3], from: mid(X1), color: partColor('長') },
    { at: H2 + 0.25, dur: 0.45, strokes: [4], from: mid(X2), color: partColor('長') },
    { at: H3 + 0.3, dur: 0.5, strokes: [5, 6, 7], from: mid(X2), color: partColor('長') },
  ],
  glyph: [
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: { x: 80, y: 19 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的楊捷睿
    { at: ASK, dur: ANSWER + 0.35 - ASK, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    // 開場：洞口露出一截尾巴
    { at: 0, dur: 1.0, kind: 'line', actor: 'hole', dx: 0, dy: -1, to: { x: 33, y: 63 }, color: SNAKE, width: SNAKE_W },
    { at: 0.5, kind: 'pop', actor: 'yang', emoji: '❗', dx: -4, dur: 0.5, scale: 1.4 },
    // 蛇身：從他握拳的地方拉到洞口，他飛多遠、蛇身就多長
    { at: 0.95, dur: WRAP + 0.05 - 0.95, kind: 'line', actor: 'yang', dx: FIST.dx, dy: FIST.dy, target: 'hole', color: SNAKE, width: SNAKE_W },
    // 纏住的時候蛇身從最下面那一圈拉回洞口（貼著地，國字放大時才不會穿過字）
    { at: WRAP - 0.05, dur: UNWRAP + 0.3 - WRAP + 0.05, kind: 'line', actor: 'yang', dx: -9, dy: COIL_Y[2] + 1.5 - P, target: 'hole', color: SNAKE, width: SNAKE_W },
    { at: UNWRAP + 0.2, dur: H4 + 0.05 - UNWRAP - 0.2, kind: 'line', actor: 'yang', dx: FIST.dx, dy: FIST.dy, target: 'hole', color: SNAKE, width: SNAKE_W },
    ...s1.fx,
    { at: H1 + 0.7, kind: 'sweat', actor: 'yang' },
    ...s2.fx,
    { at: H2 + 0.7, kind: 'sweat', actor: 'yang' },
    // 停一拍：看看到底還有多長
    { at: 4.85, kind: 'pop', actor: 'yang', emoji: '👀', dx: -7, dy: 2, dur: 0.6, scale: 1.6 },
    ...s3.fx,
    // 纏三圈
    ...COIL_Y.flatMap((cy, i) => coil(WRAP + 0.08 * i, UNWRAP + 0.1 - WRAP - 0.08 * i, X2, cy, 9.5, 2.6)),
    { at: WRAP + 0.35, kind: 'dizzy', actor: 'yang', dur: 0.8 },
    // 語詞那一刻
    { at: WORD + 0.05, kind: 'burst', actor: 'giraffe', emoji: '✨', n: 6, dx: -8, dy: 12, dur: 0.5 },
    ...s4.fx,
    // 拉到底：另一頭是一隻小小的蛇，跟他揮揮手
    { at: H4 - 0.02, dur: 0.45, kind: 'line', actor: 'yang', dx: FIST.dx, dy: FIST.dy, target: 'snake', color: SNAKE, width: SNAKE_W },
    // 落地以後接到小蛇的尾巴（不蓋住牠）；牠溜回洞裡時蛇身跟著收回去
    { at: H4 + 0.38, dur: 10.45 - H4 - 0.38, kind: 'line', actor: 'yang', dx: FIST.dx, dy: FIST.dy, to: { x: SNX + TAIL.dx, y: SNY + TAIL.dy }, color: SNAKE, width: SNAKE_W },
    { at: 10.4, dur: 0.3, kind: 'line', actor: 'snake', dx: TAIL.dx, dy: TAIL.dy, target: 'yang', color: SNAKE, width: SNAKE_W },
    { at: H4 + 0.5, kind: 'pop', actor: 'snake', emoji: '👋', dx: -2, dur: 0.6, scale: 2 },
    { at: H4 + 0.45, kind: 'pop', actor: 'yang', emoji: '❗', dx: -4, dur: 0.5, scale: 1.6 },
    { at: H4 + 0.45, kind: 'dizzy', actor: 'giraffe', dur: 0.6 },
    { at: ANSWER, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 拼字前固定全景：蛇身從洞口拉到他手上，自動取景追一頭會把另一頭切掉
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    { at: 6.4, dur: 0.3, do: 'zoom', amount: 1 },
    { at: PARK, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...s4.camera,
    { at: 10.6, dur: 0.3, do: 'zoom', amount: 1 },
  ],
  lights: [
    ...[H1, H2, H3, H4].flatMap((at, k) => [{ at, dur: 0.04, level: -0.25 - 0.08 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.55, say: '長' },
    ...s1.cues,
    ...s2.cues,
    ...s3.cues,
    { at: HOME + 0.1, say: '長' },
    { at: WORD, say: '長頸鹿' },
    ...s4.cues,
    { at: ASK + 0.15, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '長' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
