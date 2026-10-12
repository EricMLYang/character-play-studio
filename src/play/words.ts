import type { CharEntry } from '../types'

/**
 * 有影片的字不要散著放：排成孩子唸得出來、會覺得好笑的詞，一張張字卡連起來就是一個詞。
 * 湊不成詞的字用主題收在一起（有 label 的那幾組）。
 * 新做好動畫的字會先落到最後的「新影片」，記得回來把它排進某個詞。
 */
/** pin：排在最前面，連他在字火車自己接的詞都排在它後面 */
export const WORDS: { chars: string; label?: string; pin?: boolean }[] = [
  // 他的名字放最前面
  { chars: '楊捷睿', label: '⭐ 我的名字', pin: true },
  // 好玩的、動物
  { chars: '機器貓' }, { chars: '超人' }, { chars: '快跑' }, { chars: '飛走' }, { chars: '龍蝦' }, { chars: '火車' }, { chars: '河馬' }, { chars: '小鳥' }, { chars: '金魚' }, { chars: '牛肉' },
  { chars: '大象' }, { chars: '豬鼻' }, { chars: '猴王' }, { chars: '天鵝' }, { chars: '龜慢兔急' }, { chars: '鴨嘴' }, { chars: '虎牙' }, { chars: '熊抱' }, { chars: '灰狼' }, { chars: '黑豹' },
  { chars: '鹿喝茶' }, { chars: '羊怕冷' }, { chars: '樹蛙' }, { chars: '沙蟹' }, { chars: '家燕' }, { chars: '蜂蝶' }, { chars: '蟲叫' }, { chars: '蛇洞' },
  // 相反、身體
  { chars: '酸甜苦辣' }, { chars: '高矮胖瘦' }, { chars: '推拉' }, { chars: '穿脫' }, { chars: '丟接' }, { chars: '頭肩膝足' }, { chars: '手指' }, { chars: '心跳' }, { chars: '忍笑' }, { chars: '洗臉' }, { chars: '短腿' }, { chars: '摸肚' },
  // 天氣、外面
  { chars: '早上' }, { chars: '下雨' }, { chars: '打雷' }, { chars: '閃電' }, { chars: '陽傘' }, { chars: '雪花' }, { chars: '星光' }, { chars: '風雲' }, { chars: '海浪' }, { chars: '冰島' }, { chars: '山川' }, { chars: '岩石' },
  { chars: '森林' }, { chars: '枝葉' }, { chars: '草根' }, { chars: '爬牆' }, { chars: '玩土' }, { chars: '球拍' },
  // 好吃的
  { chars: '米飯' }, { chars: '吃瓜' }, { chars: '紅豆' }, { chars: '水餃' }, { chars: '月餅' }, { chars: '蛋糕' }, { chars: '糖果' }, { chars: '湯麵' }, { chars: '菜包' }, { chars: '木耳' },
  // 家裡
  { chars: '書桌' }, { chars: '紙筆' }, { chars: '畫板' }, { chars: '門窗' }, { chars: '竹椅' }, { chars: '秒鐘' }, { chars: '夜燈' }, { chars: '刀劍' },
  // 新開放的字
  { chars: '爸媽' }, { chars: '姐妹' }, { chars: '公婆' }, { chars: '你好' }, { chars: '可愛' }, { chars: '喜樂' }, { chars: '新舊' },
  { chars: '太空' }, { chars: '不要' }, { chars: '來去' }, { chars: '都是' }, { chars: '很乖' }, { chars: '也會' },
  { chars: '一三四五六七八九十千', label: '🔢 數一數' }, { chars: '橙粉棕', label: '🎨 顏色' },
  { chars: '哥弟叔姑孫', label: '👪 一家人' }, { chars: '今昨午晚年時分', label: '🕐 時間' },
  { chars: '他給在有呆背甲長老露粥相親', label: '🌟 新來的字' },
  // 湊不成詞的，用主題收
  { chars: '口日目田中', label: '🔲 有方框的字' }, { chars: '眼腦髮腳', label: '🙋 我的身體' },
  { chars: '獅哭醜累', label: '🦁 獅子怎麼了？' }, { chars: '湖虹', label: '🌈 湖上有彩虹' },
  { chars: '弓力戰犬', label: '🏹 小勇士' },
]

/** mine：孩子在字火車自己組的詞，key 就是那個詞 */
export type WordGroup = { key: string; label?: string; items: CharEntry[]; mine?: boolean; pin?: boolean }

/**
 * 把有影片的字照 WORDS 分組。詞少了任何一個字（字被藏起來、動畫拿掉）就不成詞，
 * 剩下的字跟沒排進詞的字一起放到「新影片」；主題組缺字照樣成組。
 */
export function groupMovies(movies: CharEntry[]): WordGroup[] {
  const byChar = new Map(movies.map((c) => [c.char, c]))
  const placed = new Set<string>()
  const groups: WordGroup[] = []
  for (const w of WORDS) {
    const items = [...w.chars].map((ch) => byChar.get(ch)).filter((c): c is CharEntry => Boolean(c))
    if (!items.length || (!w.label && items.length < [...w.chars].length)) continue
    items.forEach((c) => placed.add(c.char))
    groups.push({ key: w.chars, label: w.label, items, ...(w.pin ? { pin: true } : {}) })
  }
  const rest = movies.filter((c) => !placed.has(c.char))
  if (rest.length) groups.push({ key: 'new', label: '🆕 新影片', items: rest })
  return groups
}

/** 每個字在首頁的顏色：跟著它所在的詞（第幾組）。字火車的車廂、他自己接的詞都用這個，同一個字到哪裡都同色。 */
export function hueMap(groups: WordGroup[]) {
  const hues = new Map<string, number>()
  groups.filter((g) => !g.mine).forEach((g, i) => g.items.forEach((c) => { if (!hues.has(c.char)) hues.set(c.char, i % 8) }))
  return hues
}
