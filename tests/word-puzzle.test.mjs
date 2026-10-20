import { test } from 'node:test'
import assert from 'node:assert/strict'
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

const { solvePuzzle, validPuzzle } = await import('../shared/domain.mjs')
const { acceptEvent, applyEvent } = await import('../shared/play-events.mjs')
const { setParts } = await import('../src/play/parts.ts')
const { pickPuzzles, pickDecoys, wordsFor, collection } = await import('../src/play/puzzles.ts')

const at = '2026-10-20T02:00:00Z'
const seq = (values) => { let i = 0; return () => values[i++ % values.length] }
const entry = (char, words) => ({ char, words: words.map(([text, emoji]) => ({ text, emoji })) })

test('a solved word goes into the book with when, how often and how often on the first try', () => {
  let p = solvePuzzle({ watched: {} }, '生日', '日', true, at)
  assert.deepEqual(p.puzzles['生日'], { char: '日', first: at, last: at, count: 1, right: 1 })
  p = solvePuzzle(p, '生日', '日', false, '2026-10-21T02:00:00Z')
  assert.deepEqual(p.puzzles['生日'], { char: '日', first: at, last: '2026-10-21T02:00:00Z', count: 2, right: 1 })
  // 離線補送的舊紀錄：次數照算，第一次與最後一次的時間不會被弄亂
  p = solvePuzzle(p, '生日', '日', true, '2026-10-19T02:00:00Z')
  assert.equal(p.puzzles['生日'].first, '2026-10-19T02:00:00Z')
  assert.equal(p.puzzles['生日'].last, '2026-10-21T02:00:00Z')
  assert.equal(p.puzzles['生日'].count, 3)
})

test('the server takes a puzzle only when the filled-in character is in the library and in the word', () => {
  const known = (c) => c === '日'
  const base = { id: 'abcdefgh-1', at, char: '日', word: '生日', ok: true }
  assert.equal(acceptEvent('puzzle', base, known, Date.parse(at)), true, '生 does not have to be in the library')
  assert.equal(acceptEvent('puzzle', { ...base, word: '月亮' }, known, Date.parse(at)), false, 'the character must be in the word')
  assert.equal(acceptEvent('puzzle', { ...base, ok: 'yes' }, known, Date.parse(at)), false)
  assert.equal(acceptEvent('puzzle', { ...base, word: '生日快樂呀' }, known, Date.parse(at)), false)
  assert.equal(acceptEvent('puzzle', { ...base, char: '月', word: '月亮' }, known, Date.parse(at)), false, 'unknown character')
  assert.equal(validPuzzle({ char: '日', word: '日', ok: true }), false, 'one character is not a word')
  assert.deepEqual(applyEvent({ watched: {} }, { kind: 'puzzle', ...base }).puzzles['生日'].right, 1)
})

test('only words with a picture, of 2–4 characters, holding the character once can be a puzzle', () => {
  const words = wordsFor(entry('跳', [['跳跳', '🐸'], ['跳高', '🏃'], ['跳繩', ''], ['跳舞好開心呀', '💃']]))
  assert.deepEqual(words.map((w) => w.text), ['跳高'])
})

test('a round uses characters he has watched, one word per character, unsolved words first', () => {
  const library = [
    entry('日', [['生日', '🎂'], ['日出', '🌅']]),
    entry('月', [['月亮', '🌙'], ['月餅', '🥮']]),
    entry('火', [['火山', '🌋']]),
    entry('水', [['喝水', '🥤']]),
    entry('山', [['爬山', '🧗']]),
  ]
  const progress = {
    watched: { 日: { count: 9, last: at }, 月: { count: 3, last: at }, 火: { count: 1, last: at } },
    puzzles: { 生日: { char: '日', first: at, last: at, count: 1, right: 1 } },
  }
  setParts({})
  const round = pickPuzzles(library, progress, seq([0.3, 0.7, 0.1, 0.9, 0.5]))
  assert.equal(round.length, 3, 'only the three watched characters')
  assert.deepEqual(round.map((r) => r.char).sort(), ['日', '月', '火'])
  assert.equal(round.find((r) => r.char === '日').word, '日出', 'the unsolved word comes before the solved one')
  for (const r of round) {
    assert.equal([...r.word][r.slot], r.char)
    assert.ok(r.options.includes(r.char))
    assert.equal(new Set(r.options).size, r.options.length)
    assert.ok(r.options.every((o) => o === r.char || ![...r.word].includes(o)), 'no card is already in the word')
  }
})

test('when every word is solved, the one solved longest ago comes back', () => {
  const library = [entry('日', [['生日', '🎂'], ['日出', '🌅']])]
  const progress = {
    watched: { 日: { count: 2, last: at } },
    puzzles: {
      生日: { char: '日', first: at, last: '2026-10-19T00:00:00Z', count: 1, right: 1 },
      日出: { char: '日', first: at, last: '2026-10-10T00:00:00Z', count: 1, right: 1 },
    },
  }
  assert.equal(pickPuzzles(library, progress, seq([0.5]))[0].word, '日出')
})

test('the other cards never look like the answer and are not in the word', () => {
  setParts({ 日: [{ char: '口', strokes: [0, 1, 3] }], 目: [{ char: '口', strokes: [0, 1, 4] }] })
  const decoys = pickDecoys('日', '生日', ['目', '生', '口', '火', '水'], ['目', '生', '口', '火', '水', '山'], 2, seq([0.2, 0.8]))
  assert.equal(decoys.length, 2)
  for (const d of decoys) assert.ok(['火', '水'].includes(d))
  // 看過的字不夠，從整個字庫補
  assert.deepEqual(pickDecoys('日', '生日', ['火'], ['火', '山'], 2, seq([0.5])).sort(), ['山', '火'])
  setParts({})
})

test('the book lists solved words, newest first', () => {
  const progress = { watched: {}, puzzles: {
    生日: { char: '日', first: '2026-10-18T00:00:00Z', last: at, count: 2, right: 1 },
    月亮: { char: '月', first: '2026-10-19T00:00:00Z', last: at, count: 1, right: 1 },
  } }
  assert.deepEqual(collection(progress).map((c) => c.word), ['月亮', '生日'])
})

test('among new words of a character, the ones whose other characters he knows come first', () => {
  const library = [entry('火', [['擁火', '🔥'], ['火山', '🌋']])]
  const progress = { watched: { 火: { count: 2, last: at }, 山: { count: 1, last: at } } }
  for (const r of [0.1, 0.5, 0.9]) assert.equal(pickPuzzles(library, progress, seq([r]))[0].word, '火山')
})

test('the book groups words by character and shows the ones still to find', async () => {
  const { shelves } = await import('../src/play/puzzles.ts')
  const library = [entry('日', [['生日', '🎂'], ['日出', '🌅'], ['日記', '📔']]), entry('月', [['月亮', '🌙']])]
  const progress = { watched: {}, puzzles: {
    生日: { char: '日', first: '2026-10-18T00:00:00Z', last: at, count: 1, right: 1 },
    月亮: { char: '月', first: '2026-10-19T00:00:00Z', last: at, count: 1, right: 1 },
  } }
  assert.deepEqual(shelves(library, progress), [
    { char: '月', solved: ['月亮'], rest: [] },
    { char: '日', solved: ['生日'], rest: ['日出', '日記'] },
  ])
})
