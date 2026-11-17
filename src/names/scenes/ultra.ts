// 演的是字面意思：超人（超厲害、超有力氣的小恐龍）＋力（比力氣）＋霸王（最有力氣的戴王冠）——他跟大熊、青蛙、小螞蟻拔河，對手越小他輸得越慘（沒有銀紅色巨人、胸口的燈、十字光線、變身道具、怪獸、城市）。
import type { Camera, Cue, Fx, Move, Vec } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：大力士小恐龍比拔河想贏王冠，對手一個比一個小，他卻一次比一次輸得慘。
// 同一條繩子、同一個站位、對手同一下「嘿！」往後一扯、同一聲「咻」，三次只有結果變大：
// 大熊一扯，他往前滑一步、一屁股坐下 → 青蛙一扯，他整個被拖過去、臉貼地趴扁 →
// 先停一拍（鏡頭推近：對手是一隻小螞蟻！他捧腹大笑），螞蟻一扯——他整隻飛上天。
// 反轉：飛上去頭頂撞到掛在半空的王冠，掉下來剛好被小螞蟻舉在頭上、王冠也剛好掉在他頭上：「超人力霸王」。底下的螞蟻滿頭汗。
const S = 34 // 小恐龍
const G = 77 - 0.42 * S
const RX = 108 // 他每次都站在這裡拉
const FX = 50 // 對手每次都站在這裡
const BEAR = 38, BY = 77 - 0.42 * BEAR // 熊站姿只佔畫布 0.86
const FROG = 28, FY = 77 - 0.42 * FROG // 青蛙只佔畫布 0.72
const ANT = 14, AY = 77 - 0.42 * ANT
const CROWN = { x: 82, y: 19 } // 王冠用一條線吊在半空，是拔河的獎品
/** 繩子從他的手（pull 姿勢的雙手在左邊）拉出去 */
const HAND = { dx: -13, dy: 1 }
const ROPE = '#B9773A'
/** 被扯完傻眼停多久 */
const HOLD = 0.55
/** 第三次被舉在螞蟻頭上的位置 */
const ON_ANT = { x: 64, y: 48.5 }

/**
 * 主軸：拔河。對手先縮一下（預備），「嘿！」往後一扯，他就被扯過去。k 是第幾次，越後面輸越慘。
 * t0 繩子出現、他開始咬牙拉；p 是對手扯的那一刻；end 是繩子在對手手上的那一點。前兩次在這裡演完，第三次只演到飛出去。
 */
function tug(t0: number, p: number, k: number, foe: string, end: Vec) {
  const moves: Move[] = [
    { at: t0, actor: 'rex', do: 'swap', emoji: 'hero:rex/pull' },
    { at: t0 + 0.1, actor: 'rex', do: 'shake', amount: 0.35, dur: p - t0 - 0.1 },
    // 對手的預備：縮一下，然後往後一扯
    { at: p - 0.3, actor: foe, do: 'squash', amount: -0.22, dur: 0.28 },
    { at: p, actor: foe, do: 'moveTo', to: { x: FX - 5, y: foe === 'bear' ? BY : foe === 'frog' ? FY : AY }, dur: 0.12, ease: 'out' },
    { at: p + 0.12, actor: foe, do: 'moveTo', to: { x: FX, y: foe === 'bear' ? BY : foe === 'frog' ? FY : AY }, dur: 0.3 },
    { at: p, actor: foe, do: 'tilt', amount: -14, dur: 0.4 },
    { at: p, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
  ]
  const fx: Fx[] = [
    { at: t0, dur: p + 0.08 - t0, kind: 'tube', actor: 'rex', dx: HAND.dx, dy: HAND.dy, to: end, color: ROPE, width: 1.7, n: 1.5 },
  ]
  const cues: Cue[] = [{ at: t0, sfx: 'tap' }, { at: p, sfx: 'whoosh' }]
  const camera: Camera[] = []
  let land = p
  if (k === 0) {
    // 大熊：往前滑一步，一屁股坐下
    land = p + 0.3
    moves.push(
      { at: p, actor: 'rex', do: 'moveTo', to: { x: RX - 16, y: G }, dur: 0.3, ease: 'in' },
      { at: land, actor: 'rex', do: 'swap', emoji: 'hero:rex/fall' },
    )
  } else if (k === 1) {
    // 青蛙：整個被拖過去，臉貼地趴扁在青蛙前面
    land = p + 0.42
    moves.push(
      { at: p, actor: 'rex', do: 'moveTo', to: { x: FX + 25, y: G }, arc: 7, dur: 0.42, ease: 'in' },
      { at: p, actor: 'rex', do: 'rotateTo', amount: -25, dur: 0.3 },
      { at: land, actor: 'rex', do: 'rotateTo', amount: 25, dur: 0.05 },
      { at: land, actor: 'rex', do: 'swap', emoji: 'hero:rex/flat' },
    )
  }
  if (k < 2) {
    fx.push(
      { at: land, kind: 'burst', actor: 'rex', n: 1, dy: 6, dur: 0.4, scale: 1.4 + 0.5 * k },
      { at: land, kind: 'puff', actor: 'rex', n: 8 + 6 * k, dur: 0.6 },
    )
    if (k >= 1) fx.push({ at: land + 0.05, kind: 'burst', actor: 'rex', emoji: '⭐', n: 5, dur: 0.6, scale: 1.3 })
    cues.push({ at: land, sfx: 'bonk' })
    if (k >= 1) cues.push({ at: land + 0.05, sfx: 'crack' })
    camera.push(
      { at: land, dur: 0.4, do: 'punch', amount: 0.06 + 0.06 * k },
      { at: land, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.6 + 0.6 * k },
    )
  }
  return { moves, fx, cues, camera, end: land + HOLD }
}

// 第一次：大熊
const P0 = 1.65
const t1 = tug(1.1, P0, 0, 'bear', { x: FX + 7, y: BY + 2 })
// 第二次：青蛙
const P1 = 4.2
const t2 = tug(3.65, P1, 1, 'frog', { x: FX + 7, y: FY + 3 })
// 第三次：先停一拍看清楚對手，再拉
const LOOK = 6.15
const P2 = 8.0
const t3 = tug(7.4, P2, 2, 'ant', { x: FX + 4, y: AY })
// 反轉：飛上去撞到王冠、掉下來被螞蟻舉著
const UP = P2 + 0.38 // 頭撞到王冠
const DOWN = UP + 0.4 // 落在螞蟻頭上
const POSE = DOWN + 0.2

export default scene({
  duration: 11.6,
  bg: { top: '#CFEAFF', bottom: '#F3FAFF', floor: '#E59A6C', scenery: 'track' },
  actors: [
    { id: 'crown', emoji: '👑', x: CROWN.x, y: CROWN.y, size: 11, float: true, pivot: 'center' },
    { id: 'bear', emoji: 'prop:bear', x: FX, y: BY, size: BEAR, flip: true },
    { id: 'frog', emoji: 'prop:frog', x: -25, y: FY, size: FROG, flip: true, hidden: true },
    { id: 'ant', emoji: '🐜', x: -12, y: AY, size: ANT, flip: true, hidden: true },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: G, size: S, pivot: 'center' },
  ],
  moves: [
    // 開場：他仰頭大吼秀力氣，半空吊著的王冠閃一下——贏的人戴
    { at: 0.15, actor: 'rex', do: 'squash', amount: -0.15, dur: 0.2 },
    { at: 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/roar' },
    { at: 0.3, actor: 'rex', do: 'hop', amount: 3, dur: 0.3 },
    { at: 0.75, actor: 'crown', do: 'tilt', amount: 12, dur: 0.5 },
    { at: 0.6, actor: 'bear', do: 'hop', amount: 2, dur: 0.3 },
    // 第一次：大熊
    ...t1.moves,
    // 起來走回原位；大熊揮揮手走掉，青蛙跳進來
    { at: t1.end, actor: 'rex', do: 'swap', emoji: 'hero:rex/angry' },
    { at: t1.end + 0.05, actor: 'rex', do: 'moveTo', to: { x: RX, y: G }, dur: 0.45 },
    { at: t1.end, actor: 'bear', do: 'flip' },
    { at: t1.end + 0.05, actor: 'bear', do: 'moveTo', to: { x: -30, y: BY }, dur: 0.7, ease: 'in' },
    { at: t1.end + 0.55, actor: 'frog', do: 'enter', from: { x: -25, y: FY }, dur: 0.01 },
    { at: t1.end + 0.56, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: t1.end + 0.56, actor: 'frog', do: 'moveTo', to: { x: FX, y: FY }, arc: 8, dur: 0.45, ease: 'out' },
    { at: t1.end + 1.06, actor: 'frog', do: 'swap', emoji: 'prop:frog' },
    // 第二次：青蛙
    ...t2.moves,
    { at: P1 + 0.5, actor: 'frog', do: 'swap', emoji: 'prop:frog-wink' },
    // 爬起來衝回原位；青蛙跳走，螞蟻慢慢走進來
    { at: t2.end, actor: 'rex', do: 'swap', emoji: 'hero:rex/dash' },
    { at: t2.end, actor: 'rex', do: 'flip' },
    { at: t2.end + 0.05, actor: 'rex', do: 'moveTo', to: { x: RX, y: G }, dur: 0.5, ease: 'out' },
    { at: t2.end + 0.55, actor: 'rex', do: 'flip' },
    { at: t2.end + 0.55, actor: 'rex', do: 'swap', emoji: 'hero:rex/idle' },
    { at: t2.end, actor: 'frog', do: 'flip' },
    { at: t2.end, actor: 'frog', do: 'swap', emoji: 'prop:frog-jump' },
    { at: t2.end + 0.05, actor: 'frog', do: 'moveTo', to: { x: -30, y: FY }, arc: 8, dur: 0.5, ease: 'in' },
    { at: t2.end + 0.3, actor: 'ant', do: 'enter', from: { x: -12, y: AY }, dur: 0.01 },
    { at: t2.end + 0.31, actor: 'ant', do: 'moveTo', to: { x: FX, y: AY }, dur: 0.75, ease: 'out' },
    // 停一拍：鏡頭推近——是一隻小螞蟻。牠跳一下打招呼；他捧腹大笑
    { at: LOOK + 0.45, actor: 'ant', do: 'hop', amount: 2.5, dur: 0.25 },
    { at: LOOK + 0.85, actor: 'rex', do: 'swap', emoji: 'hero:rex/laugh' },
    { at: LOOK + 0.85, actor: 'rex', do: 'bounce', amount: 1.5, times: 3, dur: 0.6 },
    // 第三次：小螞蟻
    ...t3.moves,
    { at: P2 - 0.6, actor: 'ant', do: 'shake', amount: 0.4, dur: 0.3 },
    // 一扯——他整隻飛上天、在半空轉一圈，頭頂撞到王冠
    { at: P2, actor: 'rex', do: 'moveTo', to: { x: 80, y: 33 }, dur: UP - P2, ease: 'out' },
    { at: P2, actor: 'rex', do: 'spin', times: 1, dur: UP - P2 + 0.3 },
    { at: UP, actor: 'crown', do: 'moveTo', to: { x: ON_ANT.x + 1, y: ON_ANT.y - 18 }, arc: 3, dur: DOWN - UP + 0.08, ease: 'linear' },
    { at: UP, actor: 'crown', do: 'spin', times: 2, dur: DOWN - UP + 0.08 },
    // 掉下來——小螞蟻跑過去接住，舉在頭上
    { at: UP - 0.05, actor: 'ant', do: 'moveTo', to: { x: ON_ANT.x, y: AY }, dur: 0.35, ease: 'out' },
    { at: UP, actor: 'rex', do: 'moveTo', to: ON_ANT, dur: DOWN - UP, ease: 'in' },
    { at: DOWN, actor: 'ant', do: 'squash', amount: 0.35, dur: 0.35 },
    { at: DOWN, actor: 'rex', do: 'squash', amount: 0.15, dur: 0.25 },
    // 亮相：王冠戴好，他舉雙手——我是霸王！
    { at: POSE, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: POSE, actor: 'crown', do: 'hop', amount: 1.5, dur: 0.25 },
    ...[0, 0.6, 1.2].flatMap((d): Move[] => [{ at: POSE + 0.9 + d, actor: 'ant', do: 'shake', amount: 0.5, dur: 0.35 }]),
  ],
  fx: [
    { at: 0, dur: UP, kind: 'line', actor: 'crown', to: { x: CROWN.x, y: -2 }, color: '#7A5C3E', width: 0.5 },
    { at: 0.35, kind: 'puff', actor: 'rex', n: 8, dur: 0.6 },
    { at: 0.75, kind: 'burst', actor: 'crown', emoji: '✨', n: 6, dur: 0.7, scale: 1.2 },
    ...t1.fx,
    ...t2.fx,
    ...t3.fx,
    { at: P2 - 0.6, kind: 'sweat', actor: 'ant' },
    { at: UP, kind: 'burst', actor: 'crown', n: 1, dur: 0.35, scale: 1.3 },
    { at: DOWN, kind: 'puff', actor: 'ant', n: 10, dur: 0.6 },
    { at: POSE, kind: 'burst', actor: 'rex', emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.6, kind: 'burst', actor: 'rex', emoji: '🎉', n: 8, dy: -6, dur: 0.9, scale: 1.6 },
    { at: POSE + 1.0, kind: 'sweat', actor: 'ant', dur: 1.2 },
  ],
  camera: [
    // 定住構圖：對手、他、吊著的王冠都在畫面裡
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.25, to: { x: 80, y: 47 } },
    { at: 0.3, dur: 0.3, do: 'shake', amount: 0.5 },
    ...t1.camera,
    ...t2.camera,
    // 停一拍：推近看清楚對手——一隻小螞蟻
    { at: LOOK, dur: 0.4, do: 'zoom', amount: 2, to: { x: 20, y: 68 } },
    { at: LOOK + 0.6, dur: 0.3, do: 'zoom', amount: 1.25, to: { x: 80, y: 47 } },
    { at: P2, dur: 0.35, do: 'shake', amount: 1.2 },
    // 落在螞蟻頭上：震一下，推近亮相
    { at: DOWN, dur: 0.4, do: 'shake', amount: 1.4 },
    { at: DOWN, dur: 0.5, do: 'zoom', amount: 1.45, to: { x: 35, y: 59 } },
  ],
  lights: [
    { at: UP, dur: 0.05, level: -0.3 },
    { at: UP + 0.05, dur: 0.3, level: 0 },
    { at: POSE, dur: 0.05, level: -0.35 },
    { at: POSE + 0.05, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.3, sfx: 'rumble' },
    { at: 0.75, sfx: 'clink' },
    ...t1.cues,
    ...t2.cues,
    { at: LOOK + 0.45, sfx: 'blip' },
    ...t3.cues,
    { at: UP, sfx: 'clink' },
    { at: DOWN, sfx: 'bonk' },
    { at: DOWN + 0.05, sfx: 'boing' },
    { at: POSE + 0.15, say: '超人力霸王' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
