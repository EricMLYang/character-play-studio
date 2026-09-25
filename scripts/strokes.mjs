// 手動重抽筆順（字庫在 Studio 裡增刪、開放時已經會自動做）：npm run strokes
import { loadCharacters } from '../server/core.mjs'
import { syncStrokes } from '../server/char-assets.mjs'

const chars = loadCharacters().characters.map((c) => c.char)
const { written, missing } = syncStrokes(chars)
console.log(`筆順資料：${chars.length - missing.length} 個字（這次新抽 ${written} 個）→ public/strokes/`)
if (missing.length) console.log(`沒有筆順資料的字（會退回 emoji 字卡動畫）：${missing.join(' ')}`)
