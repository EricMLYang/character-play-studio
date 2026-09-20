// 算出「哪個字裡面藏著哪個他已經學過的字」，寫進 data/parts.json。
// 拆字資料來自 Make Me a Hanzi 的 dictionary.txt（需要網路，只有這支腳本要）。
// 加了新字之後跑一次：npm run parts
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt'
const OUT = path.join(ROOT, 'data/parts.json')
const CACHE = path.join(ROOT, 'node_modules/.cache/makemeahanzi-dictionary.txt')

/**
 * 拆得出來但不適合教的組合。這是教學判斷，不是資料錯誤，所以留在這裡讓人看得到、改得動。
 */
const SKIP = {
  '火→人': '丷 不是真的「人」，而且「火裡面有人」對孩子是錯的聯想',
  '車→日': '原始拆解帶「？」，拆不乾淨',
  '田→土': '⿵冂土 跟孩子看「田」的方式對不起來（他看到的是囗加十）',
}

const IDS = new Set('⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻')
const TERNARY = new Set('⿲⿳')

/** 把 ⿰足包 這種描述字序列拆成樹，葉子是單一個字。 */
function parseIds(source) {
  let i = 0
  const node = () => {
    const ch = source[i++]
    if (!IDS.has(ch)) return { char: ch }
    const kids = []
    for (let k = 0; k < (TERNARY.has(ch) ? 3 : 2); k++) kids.push(node())
    return { kids }
  }
  const tree = node()
  return i === source.length ? tree : null   // 有剩字表示拆解字串壞掉，整個不要
}

/** 走訪整棵樹，回傳每個葉子與它在樹裡的位置（matches 用同一組路徑編號）。 */
function leaves(tree, at = []) {
  if (!tree.kids) return [{ char: tree.char, path: at }]
  return tree.kids.flatMap((kid, index) => leaves(kid, [...at, index]))
}

async function dictionary() {
  if (fs.existsSync(CACHE)) return fs.readFileSync(CACHE, 'utf8')
  console.log('下載拆字資料…')
  const res = await fetch(SOURCE)
  if (!res.ok) throw new Error(`拆字資料下載失敗：HTTP ${res.status}`)
  const text = await res.text()
  fs.mkdirSync(path.dirname(CACHE), { recursive: true })
  fs.writeFileSync(CACHE, text)
  return text
}

const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8'))
const library = new Set(db.characters.map((c) => c.char))

const strokeCount = (char) => {
  const file = path.join(ROOT, 'public/strokes', `${char}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8')).strokes.length
}

const entries = new Map()
for (const line of (await dictionary()).split('\n')) {
  if (!line.trim()) continue
  const entry = JSON.parse(line)
  entries.set(entry.character, entry)
}

const parts = {}
const skipped = []
const mismatched = []
for (const char of library) {
  const entry = entries.get(char)
  if (!entry?.decomposition || !Array.isArray(entry.matches)) continue
  const tree = parseIds(entry.decomposition)
  if (!tree?.kids) continue

  const found = []
  for (const leaf of leaves(tree)) {
    if (leaf.char === char || !library.has(leaf.char)) continue
    if (found.some((f) => f.char === leaf.char)) continue        // 器有四個口，講一次就夠
    if (SKIP[`${char}→${leaf.char}`]) { skipped.push(`${char}→${leaf.char}`); continue }

    // matches[i] 是第 i 筆所屬葉子的路徑；路徑開頭吻合就是這個部件的筆畫
    const strokes = entry.matches.reduce((acc, at, index) => {
      if (Array.isArray(at) && leaf.path.every((step, depth) => at[depth] === step)) acc.push(index)
      return acc
    }, [])

    // 對帳：部件佔的筆數必須等於那個字本身的筆數，否則標出來的筆會是錯的
    const expected = strokeCount(leaf.char)
    if (!strokes.length || expected === null || strokes.length !== expected) {
      mismatched.push(`${char}→${leaf.char}(${strokes.length}≠${expected})`)
      continue
    }
    found.push({ char: leaf.char, strokes, role: entry.etymology?.semantic === leaf.char ? 'semantic'
      : entry.etymology?.phonetic === leaf.char ? 'phonetic' : undefined })
  }
  if (found.length) parts[char] = found
}

const ordered = Object.fromEntries(db.characters.map((c) => c.char).filter((c) => parts[c]).map((c) => [c, parts[c]]))
fs.writeFileSync(OUT, JSON.stringify(ordered, null, 2) + '\n')

const pairs = Object.values(ordered).reduce((n, list) => n + list.length, 0)
console.log(`部件連結：${Object.keys(ordered).length} 個字、${pairs} 組 → data/parts.json`)
if (skipped.length) console.log(`依教學判斷略過：${skipped.join(' ')}`)
if (mismatched.length) console.log(`筆數對不上而略過：${mismatched.join(' ')}`)
