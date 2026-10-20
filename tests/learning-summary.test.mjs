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

const { summarize } = await import('../src/studio/summary.ts')

// 2026-10-20 晚上 9 點台灣時間
const now = new Date('2026-10-20T13:00:00Z')
const characters = [{ char: '火', words: [{ text: '火山', emoji: '🌋' }, { text: '小心火', emoji: '⚠️' }] }, { char: '心', words: [{ text: '小心', emoji: '⚠️' }] }]

test('the parent summary counts what the child did, in Taiwan days', () => {
  const s = summarize({
    watched: {
      火: { count: 3, last: '2026-10-20T01:00:00Z' },      // 台灣 10/20 早上
      水: { count: 1, last: '2026-10-19T17:00:00Z' },      // 台灣 10/20 凌晨 1 點，也是今天
      山: { count: 2, last: '2026-10-19T10:00:00Z' },      // 台灣 10/19
    },
    recall: {
      火: { box: 2, due: '2026-10-22', last: '', right: 3, wrong: 1 },
      水: { box: 0, due: '2026-10-20', last: '', right: 0, wrong: 3 },
      山: { box: 1, due: '2026-10-19', last: '', right: 1, wrong: 0 },
    },
    puzzles: {
      火山: { char: '火', first: '2026-10-20T02:00:00Z', last: '2026-10-20T02:00:00Z', count: 2, right: 1, lastOk: false },
      小心: { char: '心', first: '2026-10-18T02:00:00Z', last: '2026-10-18T02:00:00Z', count: 2, right: 2, lastOk: true },
    },
    town: { 火: { traces: 1, first: '', last: '', strokes: [] } },
  }, characters, now)
  assert.equal(s.watched, 3)
  assert.equal(s.watchedToday, 2)
  assert.equal(s.known, 2)
  assert.equal(s.dueToday, 2, 'due today or overdue')
  assert.deepEqual(s.tricky.map((t) => t.char), ['水', '火'], 'most misses first')
  assert.equal(s.words, 2)
  assert.equal(s.wordsToday, 1)
  assert.equal(s.firstTry, 0.75)
  assert.deepEqual(s.practice, [{ word: '火山', char: '火' }])
  assert.deepEqual(s.talk, [{ word: '火山', emoji: '🌋' }], 'abstract words are not conversation starters')
  assert.equal(s.traced, 1)
})

test('an empty progress gives zeros and no first-try rate', () => {
  const s = summarize({ watched: {} }, characters, now)
  assert.deepEqual([s.watched, s.known, s.words, s.traced, s.firstTry], [0, 0, 0, 0, null])
})
