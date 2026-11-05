/**
 * 舞台：每個畫面都在一個「地方」裡，不是平色背景上擺卡片。
 *
 * 市面上做得好的幼兒識字 App（Khan Kids、Endless Alphabet、Teach Your Monster to Read）
 * 第一眼的差別不在玩法，是「這裡是一個活著的地方」：有天空、遠山、近處的草地、會飄的雲、
 * 偶爾飛過去的蝴蝶，手指一動整片景會跟著微微移動（視差）。
 *
 * 這個檔只放資料與純函式（哪個畫面是哪個景、幾點是什麼天色），畫面在 Stage.tsx。
 * 道具一律用 public/emoji3d/ 已經有的 3D 圖，沒有新圖檔要畫（tests/stage.test.mjs 會檢查）。
 */

/** 天色。晚上刻意不是黑的：畫面上的深色字（上方列、標題）要讀得清楚，所以是紫粉色的黃昏帶月亮星星。 */
export type Sky = 'dawn' | 'day' | 'dusk' | 'night' | 'snow'

/** 幾點是什麼天色（裝置的當地時間；他在台灣玩）。 */
export function skyAt(hour: number): Sky {
  const h = ((hour % 24) + 24) % 24
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 16) return 'day'
  if (h >= 16 && h < 19) return 'dusk'
  return 'night'
}

/** 有月亮星星的天色 */
export const isNightSky = (sky: Sky) => sky === 'night'

export type Prop = {
  /** emoji（要有 3D 圖） */
  emoji: string
  /** 水平位置，畫面寬度的百分比（0–100） */
  x: number
  /** 大小，跟畫面高度走（vh），會再被 clamp 住 */
  size: number
  /** far 在遠山上（小、淡、動得少），near 在前面的草地上 */
  layer: 'far' | 'near'
  /** 會隨風輕輕擺（花、草、樹） */
  sway?: boolean
}

export type Scene = {
  id: SceneId
  /** 遠山、近地兩層的顏色 */
  hills: [string, string]
  props: Prop[]
  /** 偶爾從畫面飛過去的東西 */
  flyers: string[]
}

export type SceneId = 'home' | 'feed' | 'roots' | 'book' | 'puzzle' | 'town' | 'train' | 'meadow'

/**
 * 每個地方一個景。道具放在畫面左右兩側（x 小於 22 或大於 78），中間留給遊戲本身——
 * 景是陪襯，不能搶字的注意力（研究上幼兒看繪本時眼睛只有 5% 在字上，背景太熱鬧只會更少）。
 */
export const SCENES: Record<SceneId, Scene> = {
  home: {
    id: 'home', hills: ['#BFE3A8', '#8ED07A'], flyers: ['🦋', '🐦'],
    props: [
      { emoji: '🌳', x: 4, size: 22, layer: 'near', sway: true },
      { emoji: '🏠', x: 15, size: 12, layer: 'far' },
      { emoji: '🌷', x: 18, size: 7, layer: 'near', sway: true },
      { emoji: '🍄', x: 82, size: 7, layer: 'near' },
      { emoji: '🌲', x: 88, size: 14, layer: 'far', sway: true },
      { emoji: '🌻', x: 94, size: 12, layer: 'near', sway: true },
    ],
  },
  feed: {
    id: 'feed', hills: ['#FFD3B0', '#F6B98E'], flyers: ['🐝', '🦋'],
    props: [
      // 左邊站著怪獸跟端菜的夥伴（feed.css），道具全放右邊
      { emoji: '🍄', x: 88, size: 8, layer: 'near' },
      { emoji: '🌻', x: 95, size: 14, layer: 'near', sway: true },
      // 字卡在畫面右半邊，樹放最邊邊，不要卡在字卡底下
      { emoji: '🌳', x: 97, size: 13, layer: 'far', sway: true },
    ],
  },
  roots: {
    id: 'roots', hills: ['#C9E5F5', '#A6D58E'], flyers: ['🐦', '🎈'],
    props: [
      { emoji: '🏫', x: 6, size: 12, layer: 'far' },
      { emoji: '🌳', x: 15, size: 16, layer: 'near', sway: true },
      { emoji: '⛺', x: 86, size: 10, layer: 'far' },
      { emoji: '🌲', x: 94, size: 18, layer: 'near', sway: true },
    ],
  },
  book: {
    id: 'book', hills: ['#D9D2F7', '#B9E0A5'], flyers: ['🪁', '🦋'],
    props: [
      { emoji: '🌳', x: 4, size: 20, layer: 'near', sway: true },
      { emoji: '🏰', x: 90, size: 12, layer: 'far' },
      { emoji: '🌷', x: 94, size: 7, layer: 'near', sway: true },
    ],
  },
  puzzle: {
    id: 'puzzle', hills: ['#B5DDB9', '#7FC48A'], flyers: ['🦋', '🐝'],
    props: [
      { emoji: '🌲', x: 3, size: 20, layer: 'near', sway: true },
      { emoji: '🦔', x: 13, size: 7, layer: 'near' },
      { emoji: '🌲', x: 84, size: 13, layer: 'far', sway: true },
      { emoji: '🍄', x: 93, size: 8, layer: 'near' },
    ],
  },
  town: {
    id: 'town', hills: ['#C7E8B5', '#9FD88A'], flyers: ['🐦', '🦋'],
    props: [],
  },
  train: {
    id: 'train', hills: ['#BFE3F0', '#9ED29A'], flyers: ['🐦'],
    props: [
      { emoji: '⛰️', x: 10, size: 18, layer: 'far' },
      { emoji: '🌳', x: 92, size: 16, layer: 'near', sway: true },
    ],
  },
  meadow: {
    id: 'meadow', hills: ['#BFE3A8', '#8ED07A'], flyers: ['🦋'],
    props: [
      { emoji: '🌳', x: 4, size: 18, layer: 'near', sway: true },
      { emoji: '🌻', x: 94, size: 12, layer: 'near', sway: true },
    ],
  },
}

/** 哪個畫面是哪個景（games.tsx 的遊戲 id → 景）。沒列的用草地。 */
const BY_SCREEN: Record<string, SceneId> = {
  home: 'home', feed: 'feed', roots: 'roots', book: 'book', puzzle: 'puzzle', town: 'town', train: 'train',
}
export const sceneFor = (screen: string): Scene => SCENES[BY_SCREEN[screen] ?? 'meadow']

/**
 * 手指（或滑鼠）在畫面上的位置 → 視差位移（-1..1）。
 * 景的每一層乘上自己的深度，遠的動得少、近的動得多，看起來就有前後。
 */
export function parallax(x: number, y: number, width: number, height: number) {
  if (!(width > 0) || !(height > 0)) return { px: 0, py: 0 }
  const clamp = (n: number) => Math.max(-1, Math.min(1, n))
  return { px: clamp((x / width) * 2 - 1), py: clamp((y / height) * 2 - 1) }
}

/** 一個 emoji 對到 public/emoji3d/ 的檔名編碼（跟 ui.tsx 的 emojiArt 同一套） */
export const emojiCode = (emoji: string) =>
  [...emoji.replace(/️/g, '')].map((c) => c.codePointAt(0)!.toString(16)).join('-')
