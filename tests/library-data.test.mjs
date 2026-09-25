import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCharacterFields, formatWords } from '../server/character-metadata.mjs'
import { SKIP } from '../server/char-assets.mjs'

// 檢查 git 裡的真實字庫，不是測試用的假資料：手動改 JSON 或同步出錯時，在這裡先被抓到。
// 影片不進 git，所以這裡不碰 media/。
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJSON = (...at) => JSON.parse(fs.readFileSync(path.join(ROOT, ...at), 'utf8'))
const db = readJSON('data/characters.json')
const chars = db.characters.map((c) => c.char)
const library = new Set(chars)
const strokeCount = (char) => readJSON('public/strokes', `${char}.json`).strokes.length

test('every card is unique, valid as a parent would save it, and not also in the deleted list', () => {
  assert.equal(library.size, chars.length, 'duplicate characters')
  for (const entry of db.characters) {
    assert.doesNotThrow(() => validateCharacterFields({ char: entry.char, zhuyin: entry.zhuyin, meaning: entry.meaning,
      emoji: entry.emoji, scene: entry.scene, words: formatWords(entry.words) }), `「${entry.char}」`)
    const emojis = (entry.words || []).map((w) => w.emoji).filter(Boolean)
    assert.equal(new Set(emojis).size, emojis.length, `「${entry.char}」的語詞圖示重複`)
  }
  for (const gone of db.deletedCharacters || []) assert.ok(!library.has(gone.char), `「${gone.char}」同時在字庫和已刪除清單`)
})

test('prompt files belong to cards, and each active prompt points at a saved version', () => {
  const files = fs.readdirSync(path.join(ROOT, 'data/prompts')).filter((n) => n.endsWith('.json'))
  for (const name of files) assert.ok(library.has(name.slice(0, -5)), `data/prompts/${name} 沒有對應的字卡`)
  for (const entry of db.characters.filter((e) => e.activePromptId)) {
    const versions = readJSON('data/prompts', `${entry.char}.json`)
    assert.ok(versions.some((v) => v.id === entry.activePromptId), `「${entry.char}」的 activePromptId 找不到`)
  }
})

test('stroke files match the library exactly, so the child can trace every card offline', () => {
  const files = fs.readdirSync(path.join(ROOT, 'public/strokes')).filter((n) => n.endsWith('.json')).map((n) => n.slice(0, -5))
  assert.deepEqual(files.sort(), [...chars].sort())
})

test('the family table only links library characters, and each part lights up exactly its own strokes', () => {
  const parts = readJSON('data/parts.json')
  for (const [whole, list] of Object.entries(parts)) {
    assert.ok(library.has(whole), `parts.json 的「${whole}」不在字庫`)
    const total = strokeCount(whole)
    const used = new Set()
    for (const part of list) {
      const label = `${whole}→${part.char}`
      assert.ok(library.has(part.char) && part.char !== whole, `${label} 不是字庫裡的另一個字`)
      assert.ok(!SKIP[label], `${label} 已被列為不教的組合`)
      assert.equal(part.strokes.length, strokeCount(part.char), `${label} 的筆數跟「${part.char}」本身不同`)
      for (const index of part.strokes) {
        assert.ok(Number.isInteger(index) && index >= 0 && index < total, `${label} 的第 ${index} 筆超出範圍`)
        assert.ok(!used.has(index), `${label} 的第 ${index} 筆被兩個部件共用`)
        used.add(index)
      }
    }
  }
})
