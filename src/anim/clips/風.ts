import type { Camera, Clip, Cue, Fx, Light, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 風（v2）：風是看不見的，所以每次風來都是同一個訊號——一大排粗粗的白色風線「呼——」從左邊橫掃過整個畫面，葉子跟著飛。
// 很有自信的豬探長站在同一個地方、面向風，手上拿著東西——「呼——」，東西就被吹走、他也被吹得往後退，一次比一次大：
// 看報紙，報紙被吹飛、他往後滑一步（几從報紙上飛出來）→ 撐起雨傘，傘「啪」地翻過去開花、整把被吹走，他被吹得斜斜的滑好遠（丿從傘上飛出來）→
// 先停一拍：他左看右看、跑去抱住右邊的高樹……「呼——」整個人被吹得橫著飄起來，像一面旗子（虫從被吹下樹的小瓢蟲身上飛出來），風一停「啪」掉下來。
// 語詞那一刻他得意地拿出一個大風箏（這次風是我的朋友）：「風箏」。
// 回馬槍（第四次）：風又「呼——」地來了，風箏漂亮地飛上去——拉著他整個人一起飛上天，連那棵高樹都被吹走。
// 最後畫面暗下來只剩「風」，他從天上掉回來、轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「風！」，然後退場只留字。
// 刻意不跟「獅」（吼出來的風把豬探長往後吹、抓樹連人帶樹飛走）、「捷」（捷運的風捲人）、「雲」「葉」撞：這支演「風把手上的東西吹走」。
// 風、風、風箏、這是什麼字？、風

/** 豬探長（size 36）站在地上的 y；前三次都站在同一個地方、面向左邊的風（姿勢圖本來就朝左） */
const PS = 36
const P = 77 - 0.42 * PS
const X = 50
/** 高樹：右邊一根細細高高的樹，第三次抱住它；也是風線、葉子的錨點（它整支不動，直到第四次被吹走） */
const TS = 64
const TX = 120
const TY = 77 - 0.42 * TS
/** 高樹的頭頂（blow 從頭頂算偏移） */
const THEAD = TY - 0.459 * TS
/** 第三次被吹成旗子時他身體的中心（雙手抓著樹幹、身體往右飄） */
const FLAG = { x: 134, y: 46 }

/** 風線：白色、外面一圈藍灰描邊，淺藍天空上看得清楚 */
const WIND = '#FFFFFF'
const EDGE = '#3F6E9A'

/**
 * 「呼——」一陣風：rows 排風線從畫面左邊外面往右掃過整個畫面。每一排是一串短線，一段接一段從左往右冒出來（每段先描邊再白線），
 * 整排看起來像一團風往右衝過去；還有幾串葉子跟著飛。全部掛在高樹上（它不動），座標換成相對高樹的偏移。
 * 風線都在 y 43 以下：字框在上方，不讓風線畫過字框。
 */
function windLines(at: number, rows: number, width: number): Fx[] {
  const ys = [58, 50, 66, 45, 54, 70, 62, 47]
  const out: Fx[] = []
  for (let r = 0; r < rows; r++) {
    const y = ys[r]
    const start = -34 - (r % 3) * 9
    const L = 20 + (r % 2) * 6
    for (let j = 0; j < 8; j++) {
      const x0 = start + j * 28
      const t = at + j * 0.055 + (r % 4) * 0.025
      const base = { at: t, dur: 0.26, kind: 'line' as const, actor: 'tree', dx: x0 - TX, dy: y - TY, to: { x: x0 + L, y: y + 0.6 } }
      out.push({ ...base, color: EDGE, width: width + 0.6 })
      out.push({ ...base, color: WIND, width })
    }
  }
  return out
}

/** 葉子跟著風飛：幾串 🍃🍂 從畫面左邊飛到右邊（scale 以起點放大，終點要先除回去，才不會飛出畫面被切掉） */
function leaves(at: number, n: number, scale: number): Fx[] {
  const ys = [52, 64, 46, 58]
  return ys.slice(0, n).map((y, i): Fx => ({
    at: at + 0.04 * i, dur: 0.6, kind: 'blow', actor: 'tree', emoji: i % 2 ? '🍂' : '🍃', n: 3,
    dx: 14 - TX, dy: y - 4 - THEAD, to: { x: 14 + 126 / scale, y: y - 4 + 8 / scale }, scale,
  }))
}

/**
 * 「呼——」：同一個訊號——風線從左掃到右＋葉子飛＋他頭前一團 💨＋鏡頭震＋同一個音效（一次比一次多疊一個）。
 * k 是第幾次（越後面風線越多、越粗），x、y 是 💨 冒出來的地方（他面前）。
 */
function gust(at: number, k: number, x: number, y: number) {
  const fx: Fx[] = [
    ...windLines(at - 0.18, 4 + k + (k >= 2 ? 1 : 0), 2.1 + 0.35 * k),
    ...leaves(at - 0.1, 2 + Math.min(k, 2), 1.3 + 0.2 * k),
    { at, kind: 'burst', x, y, emoji: '💨', n: 1, dur: 0.45, scale: 1.4 + 0.3 * k },
  ]
  const camera: Camera[] = [{ at, dur: 0.35 + 0.1 * k, do: 'shake', amount: 0.7 + 0.4 * k }]
  const cues: Cue[] = [{ at: at - 0.2, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: at + 0.05, sfx: 'slide' })
  if (k >= 2) cues.push({ at: at + 0.12, sfx: 'whoosh' })
  if (k >= 3) cues.push({ at: at + 0.2, sfx: 'boing' })
  return { fx, camera, cues }
}

const G1 = 1.7, G2 = 3.75, G3 = 6.0, G4 = 9.65
const g1 = gust(G1, 0, X - 12, P - 8)
const g2 = gust(G2, 1, X - 12, P - 12)
const g3 = gust(G3, 2, 108, 44)
const g4 = gust(G4, 3, 70, 44)

/** 第 4 次：他拿風箏站的地方（面向右邊的風箏）、風箏一開始在的地方 */
const X4 = 58
const KITE = { x: 92, y: 42 }

const clip: Clip = {
  format: 2,
  char: '風',
  meta: { theme: '豬探長頂著大風', cast: '豬探長＋高樹＋被吹走的東西（報紙、雨傘、風箏）', gags: ['每次一大排白色風線「呼——」從左邊掃過來，豬探長手上的東西就被吹走、他也被吹得往後退，一次比一次大（報紙飛走→雨傘翻過去開花→抱著樹整個人被吹成旗子）；回馬槍是他拿出風箏讓風吹，風箏把他整個人拉上天'] },
  duration: 15,
  bg: { top: '#86BFEA', bottom: '#D3EAF8', floor: '#A5CF86', scenery: 'hills' },
  actors: [
    { id: 'tree', emoji: 'prop:tall-tree', x: TX, y: TY, size: TS },
    // 被吹走的東西：報紙 → 雨傘 → 風箏，同一個角色換圖（底子 size 寫最大的風箏）
    { id: 'thing', emoji: '📰', x: X - 13, y: P - 2, size: 30, hidden: true, float: true, pivot: 'center' },
    { id: 'pig', emoji: 'hero:pig/idle', x: -25, y: P, size: PS },
  ],
  moves: [
    // 豬探長登場（從左邊走進來，到定點轉身面向風），抬頭看字框，打開報紙
    { at: 0, actor: 'pig', do: 'flip' },
    { at: 0, actor: 'pig', do: 'moveTo', to: { x: X, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'pig', do: 'flip' },
    { at: 0.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    // 報紙 size 22（放大縮小都寫在 pop 出場之後，不然出場會重設大小）
    { at: 1.0, actor: 'thing', do: 'pop', dur: 0.2 },
    { at: 1.0, actor: 'thing', do: 'scaleTo', amount: 22 / 30, dur: 0.01 },
    { at: 1.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/reach' },
    // 第 1 次：「呼——」報紙被吹飛（往右飛過畫面），他傻眼、往後滑一步
    { at: G1, actor: 'thing', do: 'moveTo', to: { x: 175, y: 46 }, dur: 0.7, arc: 8, ease: 'in' },
    { at: G1, actor: 'thing', do: 'rotateTo', amount: 540, dur: 0.7 },
    { at: G1, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: G1, actor: 'pig', do: 'moveTo', to: { x: X + 9, y: P }, dur: 0.3, ease: 'out' },
    { at: G1, actor: 'pig', do: 'tilt', amount: 10, dur: 0.4 },
    // 頂著風走回原位，拿出雨傘舉高
    { at: 2.55, actor: 'pig', do: 'swap', emoji: 'hero:pig/push' },
    { at: 2.55, actor: 'pig', do: 'moveTo', to: { x: X, y: P }, dur: 0.4 },
    { at: 2.95, actor: 'thing', do: 'rotateTo', amount: -540, dur: 0.01 },
    { at: 2.95, actor: 'thing', do: 'moveTo', to: { x: X - 6, y: P - 26 }, dur: 0.01 },
    { at: 2.96, actor: 'thing', do: 'swap', emoji: '☂️' },
    { at: 3.0, actor: 'thing', do: 'pop', dur: 0.2 },
    { at: 3.0, actor: 'thing', do: 'scaleTo', amount: 26 / 22, dur: 0.01 },
    { at: 3.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
    // 第 2 次：「呼——」傘翻過去開花、整把被吹走，他被吹得斜斜的、往後滑好遠
    { at: G2 - 0.05, actor: 'thing', do: 'rotateTo', amount: 160, dur: 0.15 },
    { at: G2 + 0.2, actor: 'thing', do: 'moveTo', to: { x: 178, y: 30 }, dur: 0.6, ease: 'in' },
    { at: G2 + 0.2, actor: 'thing', do: 'rotateTo', amount: 360, dur: 0.6 },
    { at: G2, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: G2, actor: 'pig', do: 'rotateTo', amount: 22, dur: 0.2 },
    { at: G2, actor: 'pig', do: 'moveTo', to: { x: X + 24, y: P }, dur: 0.5, ease: 'out' },
    { at: G2 + 0.6, actor: 'pig', do: 'rotateTo', amount: -22, dur: 0.25, ease: 'back' },
    // 先停一拍：他左看右看（風會再來）……看到右邊的高樹，跑過去抱住
    { at: 4.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/ponder' },
    { at: 5.05, actor: 'pig', do: 'flip' },
    { at: 5.05, actor: 'pig', do: 'swap', emoji: 'hero:pig/dash' },
    { at: 5.05, actor: 'pig', do: 'moveTo', to: { x: TX + 13, y: P }, dur: 0.4 },
    { at: 5.45, actor: 'pig', do: 'flip' },
    { at: 5.45, actor: 'pig', do: 'swap', emoji: 'hero:pig/pull' },
    // 第 3 次：「呼——」他整個人被吹得橫著飄起來，雙手還抓著樹幹，像一面旗子在風裡抖
    { at: G3, actor: 'pig', do: 'swap', emoji: 'hero:pig/lift' },
    { at: G3, actor: 'pig', do: 'rotateTo', amount: -84, dur: 0.18, pivot: 'center' },
    { at: G3, actor: 'pig', do: 'moveTo', to: FLAG, dur: 0.18, ease: 'out' },
    { at: G3 + 0.2, actor: 'pig', do: 'shake', amount: 1.6, dur: 0.75 },
    { at: G3, actor: 'tree', do: 'tilt', amount: 6, dur: 0.9 },
    // 風一停：「啪」掉下來趴在地上
    { at: G3 + 0.95, actor: 'pig', do: 'rotateTo', amount: 84, dur: 0.15, pivot: 'center' },
    { at: G3 + 0.95, actor: 'pig', do: 'swap', emoji: 'hero:pig/flat' },
    { at: G3 + 0.95, actor: 'pig', do: 'moveTo', to: { x: 140, y: P }, dur: 0.2, ease: 'in' },
    // 字框填滿（國字 home 到正中央）；他爬起來
    { at: 8.0, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 語詞那一刻：他得意地走到中間、拿出一個大風箏（這次讓風幫我！）
    { at: 8.3, actor: 'pig', do: 'moveTo', to: { x: X4, y: P }, dur: 0.4 },
    { at: 8.7, actor: 'pig', do: 'flip' },
    { at: 8.7, actor: 'pig', do: 'swap', emoji: 'hero:pig/smug' },
    { at: 8.66, actor: 'thing', do: 'rotateTo', amount: -160, dur: 0.01 },
    { at: 8.66, actor: 'thing', do: 'moveTo', to: KITE, dur: 0.01 },
    { at: 8.67, actor: 'thing', do: 'swap', emoji: '🪁' },
    { at: 8.7, actor: 'thing', do: 'pop', dur: 0.25 },
    { at: 8.7, actor: 'thing', do: 'scaleTo', amount: 30 / 26, dur: 0.01 },
    // 回馬槍（第 4 次）：「呼——」風箏漂亮地飛上去……拉著他整個人飛上天，連高樹都被吹走
    { at: G4 - 0.4, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: G4, actor: 'thing', do: 'moveTo', to: { x: 102, y: 13 }, dur: 0.35, ease: 'out' },
    { at: G4 + 0.35, actor: 'thing', do: 'tilt', amount: 12, dur: 0.3 },
    { at: G4 + 0.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: G4 + 0.15, actor: 'pig', do: 'moveTo', to: { x: X4 + 6, y: P }, dur: 0.15 },
    { at: G4 + 0.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/jump' },
    { at: G4 + 0.6, actor: 'thing', do: 'moveTo', to: { x: 200, y: -50 }, dur: 0.55, ease: 'in' },
    { at: G4 + 0.6, actor: 'pig', do: 'moveTo', to: { x: 172, y: -30 }, dur: 0.6, ease: 'in' },
    { at: G4 + 0.25, actor: 'tree', do: 'rotateTo', amount: 25, dur: 0.3, ease: 'out' },
    { at: G4 + 0.65, actor: 'tree', do: 'moveTo', to: { x: 210, y: 30 }, dur: 0.5, ease: 'in' },
    { at: G4 + 0.65, actor: 'tree', do: 'rotateTo', amount: 60, dur: 0.5 },
    // 問他：他從天上掉回來，變大、站在左前方，轉向觀眾（面向右邊的字）
    { at: 10.75, actor: 'pig', do: 'swap', emoji: 'hero:pig/surprised' },
    { at: 10.75, actor: 'pig', do: 'moveTo', to: { x: 34, y: -40 }, dur: 0.01 },
    { at: 10.78, actor: 'pig', do: 'moveTo', to: { x: 34, y: P + 4 }, dur: 0.3, ease: 'in' },
    { at: 11.1, actor: 'pig', do: 'swap', emoji: 'hero:pig/dizzy' },
    { at: 11.1, actor: 'pig', do: 'scaleTo', amount: 1.25, dur: 0.3, ease: 'back' },
    { at: 11.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/idle' },
    // 安靜等他回答：手放耳邊、往字那邊傾、點兩下頭
    { at: 12.15, actor: 'pig', do: 'swap', emoji: 'hero:pig/listen' },
    { at: 12.15, actor: 'pig', do: 'rotateTo', amount: 8, dur: 0.3 },
    { at: 12.65, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.15, actor: 'pig', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.6, actor: 'pig', do: 'rotateTo', amount: -8, dur: 0.12 },
    { at: 13.6, actor: 'pig', do: 'swap', emoji: 'hero:pig/point' },
    { at: 13.6, actor: 'pig', do: 'hop', amount: 5, dur: 0.2 },
    // 退場，畫面只留下字
    { at: 13.8, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' },
    { at: 13.8, actor: 'pig', do: 'flip' },
    { at: 13.8, actor: 'pig', do: 'moveTo', to: { x: -50, y: P + 4 }, dur: 0.2, ease: 'in' },
  ],
  builds: [
    // 第 1 次：几從被吹走的報紙上飛出來
    { at: G1 + 0.15, dur: 0.55, strokes: [0, 1], from: 'thing', color: partColor('几') },
    // 第 2 次：丿從翻過去的雨傘上飛出來
    { at: G2 + 0.15, dur: 0.5, strokes: [2], from: 'thing', color: partColor('丿') },
    // 第 3 次：虫從被風吹下樹的小瓢蟲身上飛出來
    { at: G3 + 0.15, dur: 0.6, strokes: [3, 4, 5, 6, 7, 8], from: { x: TX + 2, y: 26 }, color: partColor('虫') },
  ],
  glyph: [
    { at: 7.4, dur: 0.45, do: 'home', ease: 'back' },
    // 讓到左上方，中間和右邊給風箏和他
    { at: 8.3, dur: 0.45, do: 'park', to: { x: 36, y: 19 }, amount: 0.5 },
    // 問他：國字稍微偏右、縮一點，左前方讓給變大的豬探長
    { at: 11.1, dur: 2.88, do: 'ask', keep: ['pig'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 11.15, dur: 0.4, do: 'home' },
    { at: 13.6, dur: 0.35, do: 'pulse' },
    { at: 14.1, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.55, kind: 'pop', actor: 'pig', emoji: '❗', dx: -2, dur: 0.45, scale: 1.3 },
    ...g1.fx,
    { at: G1 + 0.4, kind: 'sweat', actor: 'pig' },
    ...g2.fx,
    { at: G2 + 0.45, kind: 'sweat', actor: 'pig' },
    // 第 3 次前停一拍：他往風來的那邊看一眼
    { at: 4.6, kind: 'pop', actor: 'pig', emoji: '👀', dx: -16, dy: 4, dur: 0.45, scale: 1.3 },
    ...g3.fx,
    // 樹上的小瓢蟲被吹下來、跟著風飛走（虫從牠身上飛出來）
    { at: G3 + 0.05, dur: 0.8, kind: 'blow', actor: 'tree', emoji: '🐞', n: 1, dx: 2, dy: 6, to: { x: TX + 2 + 24 / 1.4, y: THEAD + 6 + 4 / 1.4 }, scale: 1.4 },
    { at: G3 + 1.15, kind: 'dizzy', actor: 'pig', dur: 0.7 },
    { at: 8.7, kind: 'burst', actor: 'thing', emoji: '✨', n: 6, dur: 0.5 },
    // 風箏線：從他手上拉到風箏
    { at: 8.75, dur: G4 + 1.15 - 8.75, kind: 'line', actor: 'pig', dx: 8, dy: -6, target: 'thing', color: '#5B4636', width: 0.6 },
    ...g4.fx,
    { at: 13.6, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 風要掃過整個畫面：整支拉成全景（手寫 zoom 擋住自動取景推近，推近會把風線、飛走的東西、被吹成旗子的他切掉）
    { at: 0, dur: 0.2, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: G3 + 1.1, dur: 0.3, do: 'shake', amount: 1.4 },
    ...g4.camera,
  ],
  lights: [
    { at: 7.4, dur: 0.05, level: -0.35 },
    { at: 7.45, dur: 0.35, level: 0 },
  ] satisfies Light[],
  cues: [
    { at: 0.6, say: '風' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: G3 + 1.1, sfx: 'plop' },
    { at: 7.5, say: '風' },
    { at: 8.9, say: '風箏' },
    { at: 8.7, sfx: 'boing' },
    ...g4.cues,
    { at: 11.1, say: FIXED_LINES.clipAsk },
    { at: 13.6, say: '風' },
    { at: 13.65, sfx: 'cheer' },
  ],
}

export default clip
