// 由 scripts/prop-cut.mjs 產生，不要手改。每張道具圖（public/props/<名字>.png，512×512）的內容範圍：
// [左, 上, 右, 下]，是畫布的幾分之幾。引擎靠它算寬扁、細高的道具實際佔多大（擋字、頭頂、影子、自動取景）。
export const PROP_BOX: Record<string, readonly [number, number, number, number]> = {
  'aircon': [0.041, 0.279, 0.959, 0.959],
  'gift-open': [0.039, 0.242, 0.959, 0.961],
  'gift': [0.061, 0.041, 0.938, 0.961],
  'ice': [0.041, 0.049, 0.959, 0.961],
  'metro-door': [0.039, 0.217, 0.959, 0.959],
  'metro': [0.041, 0.695, 0.959, 0.959],
  'starfruit-slice': [0.039, 0.098, 0.959, 0.959],
  'starfruit-tree': [0.041, 0.066, 0.957, 0.959],
  'starfruit': [0.133, 0.043, 0.863, 0.961],
}
