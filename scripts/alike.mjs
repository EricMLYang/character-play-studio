// 算出「哪兩個字長得像」，寫成 src/play/alike.ts（產生出來的檔，不要手改）。
//
// 為什麼要算：挑干擾的字時本來只看 data/parts.json，但那裡只記得到「部件本身也在字庫裡」的關係。
// 「虫」不在字庫，所以蜂和蝶在它眼裡毫無關係——結果餵大怪獸會拿蝶當蜂的干擾字，
// 小偵探更慘，整個遊戲就是看字形，左邊畫完一模一樣還要他猜。
//
// 怎麼算：筆順資料裡每一筆都有中線（medians，0–1024 的座標）。共用同一個偏旁的字，
// 前幾筆的中線幾乎重疊，平均距離會掉到 60 以下（火跟水是 409，日跟目是 74）。
// 前 6、5、4、3 筆各比一次，只要有一組夠近就算像。
//
// 跑：npm run alike（字庫加字之後跑一次就好；新字沒算到只會少擋一對，不會壞掉）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/** 平均距離低於這個就算長得像。0–1024 的座標，60 以下大概就是同一個偏旁 */
const NEAR = 55
/** 前幾筆要比（多的先比，比不到再退一步） */
const HEADS = [6, 5, 4, 3]
/** 一筆的中線縮成幾個點來比 */
const POINTS = 5

const sample = (median) =>
  Array.from({ length: POINTS }, (_, i) => median[Math.round((i * (median.length - 1)) / (POINTS - 1))])

function strokeDistance(a, b) {
  const pa = sample(a), pb = sample(b)
  return pa.reduce((sum, p, i) => sum + Math.hypot(p[0] - pb[i][0], p[1] - pb[i][1]), 0) / POINTS
}

/** 前 k 筆的平均距離；筆畫不夠多就不比 */
function headDistance(a, b, k) {
  if (a.length < k + 1 || b.length < k + 1) return Infinity
  let sum = 0
  for (let i = 0; i < k; i++) sum += strokeDistance(a[i], b[i])
  return sum / k
}

export function alikePairs(medians) {
  const chars = [...medians.keys()].sort()
  const pairs = []
  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      const a = medians.get(chars[i]), b = medians.get(chars[j])
      if (HEADS.some((k) => headDistance(a, b, k) < NEAR)) pairs.push(chars[i] + chars[j])
    }
  }
  return pairs.sort()
}

export function loadMedians() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8'))
  const medians = new Map()
  // 連孩子端還看不到的字也算：開放給孩子的時候就不用重跑
  for (const entry of db.characters) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/strokes', `${entry.char}.json`), 'utf8'))
      if (data.medians?.length) medians.set(entry.char, data.medians)
    } catch { /* 沒有筆順資料的字就沒得比 */ }
  }
  return medians
}

/** 把算出來的對數寫成 src/play/alike.ts。只有直接跑這支才會寫檔（測試會 import 上面那兩個函式）。 */
function write() {
  const medians = loadMedians()
  const pairs = alikePairs(medians)
  const lines = []
  for (let i = 0; i < pairs.length; i += 12) lines.push('  ' + pairs.slice(i, i + 12).map((p) => `'${p}'`).join(', '))
  const file = `// 由 scripts/alike.mjs 產生，不要手改。字庫加字之後跑 npm run alike（tests/alike.test.mjs 會檢查有沒有過期）。
/**
 * 長得像的字：前幾筆的筆順中線幾乎重疊，也就是共用同一個偏旁（蜂／蝶、河／湯、跑／跳）。
 * data/parts.json 只記得到「部件本身也在字庫裡」的關係，像「虫」「氵」這種不在字庫的偏旁它看不到，
 * 這張表就是補那個洞。挑干擾的字時避開（dishes.ts 的 looksAlike）。
 * key 是兩個字照字碼排序接起來。
 */
export const ALIKE = new Set([
${lines.join(',\n')},
])
`
  fs.writeFileSync(path.join(ROOT, 'src/play/alike.ts'), file)
  console.log(`${medians.size} 個字有筆順資料，算出 ${pairs.length} 對長得像的字 → src/play/alike.ts`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) write()
