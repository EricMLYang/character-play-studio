// 每個字在孩子端用到的衍生資料：筆順（public/strokes/）與字的家族（data/parts.json）。
// 字庫一有增刪或開放給孩子，路由就會呼叫 refreshCharacterAssets()，不必再手動跑腳本。
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, DATA, STROKES, loadCharacters } from './core.mjs'

const STROKE_SOURCE = path.join(ROOT, 'node_modules/hanzi-writer-data')
const DICTIONARY_URL = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt'
const DICTIONARY_CACHE = path.join(ROOT, 'node_modules/.cache/makemeahanzi-dictionary.txt')
const PARTS = () => path.join(DATA, 'parts.json')

/**
 * 拆得出來但不適合教的組合。這是教學判斷，不是資料錯誤，所以留在這裡讓人看得到、改得動。
 */
export const SKIP = {
  '火→人': '丷 不是真的「人」，而且「火裡面有人」對孩子是錯的聯想',
  '車→日': '原始拆解帶「？」，拆不乾淨',
  '田→土': '⿵冂土 跟孩子看「田」的方式對不起來（他看到的是囗加十）',
}

// ---------- 筆順 ----------

/** 把字庫用到的字的筆順從 hanzi-writer-data 抽出來，孩子端離線也能看。 */
export function syncStrokes(chars) {
  if (!fs.existsSync(STROKE_SOURCE)) throw new Error('找不到 hanzi-writer-data，請先執行 npm install')
  fs.mkdirSync(STROKES, { recursive: true })
  // 移除的字要一起清掉，不然會慢慢囤積用不到的筆順檔
  const keep = new Set(chars.map((c) => `${c}.json`))
  for (const name of fs.readdirSync(STROKES)) {
    if (name.endsWith('.json') && !keep.has(name)) fs.rmSync(path.join(STROKES, name))
  }
  const missing = []
  let written = 0
  for (const char of chars) {
    const from = path.join(STROKE_SOURCE, `${char}.json`)
    if (!fs.existsSync(from)) { missing.push(char); continue }
    const to = path.join(STROKES, `${char}.json`)
    // 來源不會變，已經抽過的就不必再複製
    if (!fs.existsSync(to)) { fs.copyFileSync(from, to); written++ }
  }
  // 重新散布這份資料要附授權，Arphic PL 要求保留原授權條款
  const license = path.join(STROKES, 'LICENSE.txt')
  if (!fs.existsSync(license)) {
    fs.writeFileSync(license, [
      '這個資料夾的筆順資料來自 hanzi-writer-data（https://github.com/chanind/hanzi-writer-data），',
      '原始資料出自 Make Me a Hanzi（https://github.com/skishore/makemeahanzi），',
      '以 Arphic Public License 授權，衍生自文鼎公司的字型。以下為原始授權條款。',
      '', '---', '',
      fs.readFileSync(path.join(STROKE_SOURCE, 'ARPHICPL.TXT'), 'utf8'),
    ].join('\n'))
  }
  return { written, missing }
}

const strokeCount = (char) => {
  const file = path.join(STROKES, `${char}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8')).strokes.length
}

// ---------- 字的家族 ----------

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

/** Make Me a Hanzi 的拆字資料。第一次要連網下載，之後讀快取。 */
async function downloadDictionary() {
  if (fs.existsSync(DICTIONARY_CACHE)) return fs.readFileSync(DICTIONARY_CACHE, 'utf8')
  const res = await fetch(DICTIONARY_URL, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`拆字資料下載失敗：HTTP ${res.status}`)
  const text = await res.text()
  fs.mkdirSync(path.dirname(DICTIONARY_CACHE), { recursive: true })
  fs.writeFileSync(DICTIONARY_CACHE, text)
  return text
}

let loadDictionary = downloadDictionary
let dictionary = null
/** 測試用：換成不連網的小字典。 */
export function setDictionaryLoader(loader) {
  loadDictionary = loader
  dictionary = null
}

async function entries() {
  if (!dictionary) {
    const map = new Map()
    for (const line of (await loadDictionary()).split('\n')) {
      if (!line.trim()) continue
      const entry = JSON.parse(line)
      map.set(entry.character, entry)
    }
    dictionary = map
  }
  return dictionary
}

/** 算出「哪個字裡面藏著哪個他也在學的字」，以及那個部件佔掉哪幾筆，寫進 data/parts.json。 */
export async function syncParts(chars) {
  const library = new Set(chars)
  const all = await entries()
  const parts = {}
  const skipped = []
  const mismatched = []
  for (const char of chars) {
    const entry = all.get(char)
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
  fs.mkdirSync(DATA, { recursive: true })
  fs.writeFileSync(PARTS(), JSON.stringify(parts, null, 2) + '\n')
  return { parts, skipped, mismatched }
}

export function loadParts() {
  try { return JSON.parse(fs.readFileSync(PARTS(), 'utf8')) } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }
}

// ---------- 字庫一變動就更新 ----------

let queue = Promise.resolve()

/**
 * 依「現在的」字庫重抽筆順、重算字的家族。一次只跑一個，而且每次都重讀字庫，
 * 連續按兩次開放也不會讓比較舊的結果最後才寫進去。
 * 拆字資料要連網：沒網路時筆順照樣更新，字的家族留到下一次再算，不讓家長的操作失敗。
 */
export function refreshCharacterAssets() {
  const run = async () => {
    const chars = loadCharacters().characters.map((c) => c.char)
    const { missing } = syncStrokes(chars)
    try {
      await syncParts(chars)
      return { missingStrokes: missing }
    } catch (error) {
      return { missingStrokes: missing, partsError: `字的家族這次沒有更新：${error.message}` }
    }
  }
  const result = queue.then(run)
  queue = result.catch(() => {})
  return result
}
