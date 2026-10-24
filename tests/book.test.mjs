import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { registerHooks } from 'node:module'

// 前端模組用不帶副檔名的相對路徑（給 Vite 用），Node 找不到時補上 .ts 再試
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const { PATTERNS, patternChars, sentenceText, bookLines, BOOK_FIXED } = await import('../shared/books.mjs')
const { readBook, charStars, starIndex } = await import('../shared/domain.mjs')
const { recordEvent } = await import('../shared/play-events.mjs')
const { pickBook, usablePatterns, segmentsOf, askable, SENTENCES } = await import('../src/play/books.ts')

const ROOT = path.resolve(import.meta.dirname, '..')
const at = '2026-10-20T03:00:00Z'
const first = () => 0
const entry = (char, i, words = []) => ({ char, zhuyin: '', meaning: '', emoji: '', priority: i, media: [], words })
const lib = [
  entry('火', 0, [{ text: '火車', emoji: '🚂' }, { text: '火山', emoji: '🌋' }]),
  entry('水', 1, [{ text: '喝水', emoji: '🥤' }]),
  entry('山', 2, [{ text: '火山', emoji: '🌋' }]),
  entry('木', 3, [{ text: '木頭', emoji: '🪵' }]),
  entry('日', 4, [{ text: '生日', emoji: '🎂' }]),
  ...[...'你他有要愛好大小玩可'].map((c, i) => entry(c, 10 + i)),
]
const watched = (chars) => Object.fromEntries([...chars].map((c) => [c, { count: 1, last: at }]))

test('every pattern only uses characters that are in the real library', () => {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8'))
  const visible = new Set(db.characters.filter((c) => !c.hidden).map((c) => c.char))
  for (const p of PATTERNS) for (const c of patternChars(p)) assert.ok(visible.has(c), `句型 ${p.id} 用了字庫裡沒有的「${c}」`)
  assert.equal(sentenceText(PATTERNS[0], '火車'), '火車好大！')
  const lines = new Set(bookLines())
  for (const line of Object.values(BOOK_FIXED)) assert.ok(lines.has(line))
  assert.ok(lines.has('好大') && lines.has('你有'), '固定段落都先做音檔')
})

test('patterns whose fixed characters are missing from the child library are not used', () => {
  assert.equal(usablePatterns(lib).length, PATTERNS.length)
  const small = lib.filter((c) => !'你他'.includes(c.char))
  assert.deepEqual(usablePatterns(small).map((p) => p.id), ['big', 'small', 'cute', 'fun'], '你有、他要、你愛 都少了字')
})

test('a book puts today\'s characters first, one sentence each, no repeated pattern, then a page to write his own', () => {
  const progress = { watched: watched('火水山木日') }
  const pages = pickBook(lib, progress, ['山', '日'], first, '2026-10-22')
  const reads = pages.filter((p) => p.kind === 'read')
  assert.equal(reads.length, SENTENCES)
  assert.deepEqual(reads.slice(0, 2).map((p) => p.char), ['山', '日'], '今天的字先進書')
  assert.equal(new Set(reads.map((p) => p.pattern.id)).size, reads.length, '句型不重複')
  for (const p of reads) {
    assert.ok(p.text.includes(p.word.text) && p.word.char === p.char)
    assert.ok(askable(p), `${p.text} 裡「${p.char}」只能出現一次才能問`)
  }
  assert.equal(pages.at(-1).kind, 'mine')
  assert.ok(pages.at(-1).shelf.length >= 2)
  assert.deepEqual(pickBook(lib, progress, ['山', '日'], first, '2026-10-22').map((p) => p.kind === 'read' ? p.text : 'mine'),
    pages.map((p) => p.kind === 'read' ? p.text : 'mine'), '同一天重開是同一本')
  assert.notEqual(pickBook(lib, progress, ['山', '日'], first, '2026-10-23')[0].pattern.id, pages[0].pattern.id, '換一天換句型')
})

test('segments: fixed part, the word (slot), fixed part; punctuation shows but is not spoken', () => {
  const segs = segmentsOf({ id: 'have', before: '你有', after: '。' }, '火車')
  assert.deepEqual(segs, [{ text: '你有', say: '你有' }, { text: '火車', say: '火車', slot: true }, { text: '。', say: undefined }])
})

test('only characters with picture words and that he has watched can be in a book', () => {
  assert.deepEqual(pickBook(lib, { watched: {} }, [], first), [], '一個字都沒看過：沒有書')
  const pages = pickBook(lib, { watched: watched('火') }, [], first)
  assert.equal(pages.filter((p) => p.kind === 'read').length, 1)
  assert.equal(pages.length, 1, '貨架湊不到兩個詞就沒有最後一頁')
})

test('reading a sentence counts toward the "read it in a word" star, and the event is validated', () => {
  let p = readBook({ watched: {} }, '火車好大！', '火', true, at)
  assert.equal(charStars(p, '火').puzzle, true)
  assert.equal(starIndex(p).get('火'), 1)
  p = readBook(p, '火車好大！', '火', false, '2026-10-21T03:00:00Z')
  assert.deepEqual(p.books['火車好大！'], { char: '火', first: at, last: '2026-10-21T03:00:00Z', count: 2, right: 1 })
  const known = (c) => '火車好大'.includes(c)
  assert.ok(recordEvent({ watched: {} }, 'book', { char: '火', text: '火車好大！', ok: true, id: 'evt-00000201', at }, known, '2026-10-20').added)
  assert.ok(recordEvent({ watched: {} }, 'book', { char: '水', text: '火車好大！', ok: true, id: 'evt-00000202', at }, known).error, '指的字要在句子裡')
  const mine = recordEvent({ watched: {} }, 'book', { char: '火', text: '你有火車。', ok: true, mine: true, id: 'evt-00000203', at }, known, '2026-10-20')
  assert.equal(mine.progress.books['你有火車。'].mine, true)
})
