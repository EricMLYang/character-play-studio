/**
 * 夥伴：集星星開寶箱換來的角色（public/hero/<id>/）。
 *
 * 星星本來只會一直累積，沒有「拿到東西」的那一刻。每 STARS_PER 顆星星就開一個寶箱，
 * 裡面跳出一位新夥伴——而且他**真的會出現在跳石頭過河裡**陪他過河（crossing.ts 用這張表），
 * 不是只放在圖鑑裡好看的。十八位收齊就是一套完整的收藏。
 *
 * 誰解鎖了完全由「總共幾顆星星」算出來，沒有新的進度欄位：換一台裝置、重開都一樣。
 * 第一位是楊捷睿自己，一開始就在。
 */
export type Partner = {
  /** public/hero/<id>/*.png */
  id: string
  name: string
  /** 過河時在對岸等他的東西 */
  goal: string
  want: string
}

/** 每幾顆星星開一個寶箱 */
export const STARS_PER = 20

export const PARTNERS: Partner[] = [
  { id: 'yang', name: '楊捷睿', goal: '🏎️', want: '賽車' },
  { id: 'mouse', name: '小老鼠', goal: '🧀', want: '起司' },
  { id: 'monster', name: '大怪獸', goal: '🍰', want: '蛋糕' },
  { id: 'robot', name: '機器人', goal: '🔋', want: '電池' },
  { id: 'pirate', name: '海盜', goal: '💰', want: '寶藏' },
  { id: 'dino', name: '恐龍', goal: '🍖', want: '大骨頭' },
  { id: 'raccoon', name: '浣熊', goal: '🍉', want: '西瓜' },
  { id: 'pig', name: '小豬', goal: '🍎', want: '蘋果' },
  { id: 'astronaut', name: '太空人', goal: '🚀', want: '火箭' },
  { id: 'cape', name: '披風英雄', goal: '⭐', want: '星星' },
  { id: 'ninja', name: '忍者', goal: '🍙', want: '飯糰' },
  { id: 'sheriff', name: '警長', goal: '🏆', want: '獎盃' },
  { id: 'shark', name: '鯊魚', goal: '🐟', want: '小魚' },
  { id: 'warrior', name: '勇士', goal: '🛡️', want: '盾牌' },
  { id: 'firefighter', name: '消防員', goal: '🚒', want: '消防車' },
  { id: 'alien', name: '外星人', goal: '🛸', want: '飛碟' },
  { id: 'car', name: '小汽車', goal: '⛽', want: '加油' },
  { id: 'brick', name: '積木人', goal: '🧱', want: '積木' },
]

/**
 * 河上的天色。照夥伴輪，同一位每次都是同一種天色（「機器人的河是晚上的」），
 * 換一位夥伴整條河就換一個樣子——同一個玩法玩第三次還有新鮮感，靠的是這個。
 */
const SKIES = ['day', 'sunset', 'snow', 'night'] as const
export type Sky = typeof SKIES[number]
export const skyFor = (partner: Partner): Sky =>
  SKIES[Math.max(PARTNERS.findIndex((p) => p.id === partner.id), 0) % SKIES.length]

/** 幾顆星星的時候第 n 位（從 0 算）會來。第 0 位不用星星。 */
export const starsFor = (n: number) => n * STARS_PER

/** 這些星星換到幾位夥伴（至少一位，最多全部）。 */
export const partnerCount = (stars: number) =>
  Math.max(1, Math.min(PARTNERS.length, Math.floor(stars / STARS_PER) + 1))

/** 已經來的夥伴，照來的順序。 */
export const partnersAt = (stars: number) => PARTNERS.slice(0, partnerCount(stars))

/** 下一位是誰、還差幾顆星星；都收齊了回 null。 */
export function nextPartner(stars: number) {
  const n = partnerCount(stars)
  if (n >= PARTNERS.length) return null
  return { partner: PARTNERS[n], need: starsFor(n) - stars, at: starsFor(n) }
}
