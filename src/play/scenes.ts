/**
 * 每個字的背景小動畫。純 CSS，不需要生圖，讓 71 個字不再共用同一支動畫。
 * 沒列到的字（含之後新增的）會落到 sparkle，不會缺畫面。
 */
export type Scene = 'rain' | 'fire' | 'glow' | 'grow' | 'fly' | 'bounce' | 'zap' | 'sparkle'

const BY_CHAR: Record<string, Scene> = {
  雨: 'rain', 水: 'rain', 川: 'rain', 喝: 'rain',
  火: 'fire', 電: 'fire', 光: 'fire', 黑: 'fire',
  日: 'glow', 星: 'glow', 金: 'glow', 王: 'glow', 超: 'glow', 笑: 'glow', 心: 'glow', 月: 'glow', 天: 'glow',
  目: 'glow', 眼: 'glow', 畫: 'glow', 書: 'glow',
  木: 'grow', 花: 'grow', 土: 'grow', 竹: 'grow', 米: 'grow', 田: 'grow', 果: 'grow', 山: 'grow', 石: 'grow', 高: 'grow',
  大: 'grow', 吃: 'grow', 家: 'grow',
  鳥: 'fly', 飛: 'fly', 龍: 'fly', 快: 'fly', 上: 'fly', 小: 'fly',
  球: 'bounce', 跳: 'bounce', 跑: 'bounce', 走: 'bounce', 馬: 'bounce', 車: 'bounce', 犬: 'bounce',
  牛: 'bounce', 羊: 'bounce', 豬: 'bounce', 足: 'bounce', 腳: 'bounce', 魚: 'bounce', 下: 'bounce',
  人: 'bounce', 口: 'bounce', 耳: 'bounce', 頭: 'bounce', 玩: 'bounce',
  力: 'zap', 打: 'zap', 戰: 'zap', 劍: 'zap', 刀: 'zap', 弓: 'zap', 器: 'zap', 機: 'zap', 門: 'zap',
  手: 'zap', 中: 'zap', 忍: 'zap',
}

export const sceneFor = (char: string): Scene => BY_CHAR[char] || 'sparkle'

/** 每種場景要幾片，決定 CSS 裡的 nth-child 延遲用得到幾個。 */
export const SCENE_PIECES: Record<Scene, number> = {
  rain: 9, fire: 7, glow: 6, grow: 7, fly: 5, bounce: 5, zap: 7, sparkle: 8,
}
