// 一次補一批語詞（2026-11-05 夜間 3-7）。表在 docs/overnight/2026-11-05/words-extra.json。
//
// 用 Studio 存字卡時同一套驗證（server/character-metadata.mjs 的 parseWords）：詞要含那個字、二到四個字、
// 後面只接一個圖示、最多四個。只補不刪：已經有的詞不動，已經四個的字跳過，同一個字底下圖示重複的也跳過。
// 讀音（多音字）驗證不到，是人寫表的時候要對的。
//
//   node scripts/words-extra.mjs            寫進 data/characters.json
//   node scripts/words-extra.mjs --dry-run  只列出會改什麼
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatWords, parseWords } from '../server/character-metadata.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dry = process.argv.includes('--dry-run')
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/overnight/2026-11-05/words-extra.json'), 'utf8')).words
const file = path.join(ROOT, 'data/characters.json')
const raw = fs.readFileSync(file, 'utf8')
const data = JSON.parse(raw)
const list = data.characters || data

let added = 0
const skipped = []
for (const [char, extra] of Object.entries(table)) {
  const entry = list.find((c) => c.char === char)
  if (!entry) { skipped.push(`${char}：字庫裡沒有`); continue }
  const words = entry.words || []
  const [word] = parseWords(extra, char)
  if (words.length >= 4) { skipped.push(`${char}：已經四個`); continue }
  if (words.some((w) => w.text === word.text)) { skipped.push(`${char}：已經有「${word.text}」`); continue }
  if (word.emoji && words.some((w) => w.emoji === word.emoji)) { skipped.push(`${char}：圖示 ${word.emoji} 重複`); continue }
  // 整串再過一次 parseWords，跟 Studio 存檔一模一樣
  entry.words = parseWords(formatWords([...words, word]), char)
  added++
  console.log(`${char}　${formatWords(entry.words)}`)
}
if (skipped.length) console.log(`\n跳過：\n${skipped.join('\n')}`)
console.log(`\n補了 ${added} 個詞${dry ? '（dry-run，沒有寫檔）' : ''}`)
if (!dry && added) fs.writeFileSync(file, JSON.stringify(data, null, 2) + (raw.endsWith('\n') ? '\n' : ''))
