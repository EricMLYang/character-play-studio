// 手動重算字的家族（字庫在 Studio 裡增刪、開放時已經會自動做）：npm run parts
// 拆字資料第一次需要網路，之後讀 node_modules/.cache 的快取。
import { loadCharacters } from '../server/core.mjs'
import { syncStrokes, syncParts } from '../server/char-assets.mjs'

const chars = loadCharacters().characters.map((c) => c.char)
syncStrokes(chars)   // 對帳要用筆順的筆數
const { parts, skipped, mismatched } = await syncParts(chars)
const pairs = Object.values(parts).reduce((n, list) => n + list.length, 0)
console.log(`部件連結：${Object.keys(parts).length} 個字、${pairs} 組 → data/parts.json`)
if (skipped.length) console.log(`依教學判斷略過：${skipped.join(' ')}`)
if (mismatched.length) console.log(`筆數對不上而略過：${mismatched.join(' ')}`)
