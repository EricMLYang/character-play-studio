// 把字庫用到的字的筆順資料從 hanzi-writer-data 抽進 public/strokes/，讓孩子端離線也能看筆順。
// 加了新字之後跑一次：npm run strokes
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(ROOT, 'node_modules/hanzi-writer-data')
const OUT = path.join(ROOT, 'public/strokes')

if (!fs.existsSync(SOURCE)) {
  console.error('找不到 hanzi-writer-data，請先執行 npm install')
  process.exit(1)
}

const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8'))
const chars = [...new Set(db.characters.map((c) => c.char))]

fs.mkdirSync(OUT, { recursive: true })
// 抽掉的字要一起清掉，不然 public/ 會慢慢囤積用不到的筆順檔
const keep = new Set(chars.map((c) => `${c}.json`))
for (const name of fs.readdirSync(OUT)) {
  if (name.endsWith('.json') && !keep.has(name)) fs.rmSync(path.join(OUT, name))
}

const missing = []
let written = 0
for (const char of chars) {
  const from = path.join(SOURCE, `${char}.json`)
  if (!fs.existsSync(from)) { missing.push(char); continue }
  fs.copyFileSync(from, path.join(OUT, `${char}.json`))
  written++
}

// 重新散布這份資料要附授權，Arphic PL 要求保留原授權條款
fs.writeFileSync(path.join(OUT, 'LICENSE.txt'), [
  '這個資料夾的筆順資料來自 hanzi-writer-data（https://github.com/chanind/hanzi-writer-data），',
  '原始資料出自 Make Me a Hanzi（https://github.com/skishore/makemeahanzi），',
  '以 Arphic Public License 授權，衍生自文鼎公司的字型。以下為原始授權條款。',
  '', '---', '',
  fs.readFileSync(path.join(SOURCE, 'ARPHICPL.TXT'), 'utf8'),
].join('\n'))

const bytes = fs.readdirSync(OUT).reduce((sum, n) => sum + fs.statSync(path.join(OUT, n)).size, 0)
console.log(`筆順資料：${written} 個字，共 ${(bytes / 1024).toFixed(0)} KB → public/strokes/`)
if (missing.length) console.log(`沒有筆順資料的字（會退回 emoji 字卡動畫）：${missing.join(' ')}`)
