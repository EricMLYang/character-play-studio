/**
 * 每個字的背景小動畫。純 CSS，不需要生圖。
 * 分類存在字卡的 scene 欄位（Studio 可以改、AI 補齊會建議），沒填的字落到 sparkle。
 */
import type { CharEntry, Scene } from '../types'

export type { Scene }

export const sceneFor = (entry?: Pick<CharEntry, 'scene'>): Scene => entry?.scene || 'sparkle'

/** 每種場景要幾片，決定 CSS 裡的 nth-child 延遲用得到幾個。 */
export const SCENE_PIECES: Record<Scene, number> = {
  rain: 9, fire: 7, glow: 6, grow: 7, fly: 5, bounce: 5, zap: 7, sparkle: 8,
}

/** Studio 下拉選單用：家長看得懂的名字，加上什麼樣的字適合。 */
export const SCENE_LABELS: Record<Scene, string> = {
  rain: '🌧️ 下雨（水、天氣、喝）',
  fire: '🔥 火焰（火、熱、電、黑）',
  glow: '☀️ 光暈（光、太陽、星星、看、開心）',
  grow: '🌱 發芽（植物、土、食物、大、地方）',
  fly: '🕊️ 飛過（鳥、飛、快、往上、小）',
  bounce: '🦘 彈跳（動物、人、身體、走跑跳、玩）',
  zap: '⚡ 爆點（力、打、武器、機器、手）',
  sparkle: '✨ 閃亮（其他）',
}
