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

test('小結也說得出他在孩子端追的那條線：星星與夥伴', async () => {
  const { summarize } = await import('../src/studio/summary.ts')
  const { STARS_PER } = await import('../src/play/partners.ts')
  const at = '2026-10-22T02:00:00Z'
  const empty = summarize({ watched: {} }, [])
  assert.equal(empty.stars, 0)
  assert.equal(empty.partners, 1, '一開始就有楊捷睿一位')
  assert.equal(empty.toNextPartner, STARS_PER)

  // 看過三個字、其中一個還描過：四顆星
  const progress = {
    watched: Object.fromEntries([...'火水山'].map((c) => [c, { count: 1, last: at }])),
    town: { 火: { traces: 1, first: at, last: at, strokes: [[1, 2]] } },
  }
  const s = summarize(progress, [])
  assert.equal(s.stars, 4)
  assert.equal(s.toNextPartner, STARS_PER - 4)
})

test('小結挑得出「只差一顆就集滿」的字，還說得出缺的是哪一顆', async () => {
  const { summarize } = await import('../src/studio/summary.ts')
  const { setParts } = await import('../src/play/parts.ts')
  setParts({})   // 沒有拆字表：魔法鍋那顆誰都拿不到，所以做得到的只有看過、自己寫、自己認出來、拼好一個詞
  const at = '2026-10-22T02:00:00Z'
  const entry = (char, words) => ({ char, zhuyin: '', meaning: '', emoji: '', words, concept: {}, status: 'live', priority: 0, media: [], feedback: [] })
  const lib = [entry('火', [{ text: '火山', emoji: '🌋' }]), entry('水', [{ text: '喝水', emoji: '🥤' }])]
  const progress = {
    // 火：看過、描過、自己認出來 → 四顆裡的三顆，只差「拼好一個詞」
    watched: { 火: { count: 2, last: at }, 水: { count: 1, last: at } },
    town: { 火: { traces: 1, first: at, last: at, strokes: [[1, 2]] } },
    recall: { 火: { box: 1, due: '2026-10-30', last: at, right: 1, wrong: 0 } },
  }
  const s = summarize(progress, lib, new Date(at))
  assert.deepEqual(s.nearly.map((n) => n.char), ['火'], '水 只有一顆，不算快集滿')
  assert.equal(s.nearly[0].deed, '拼好一個詞')
  assert.equal(s.nearly[0].where, 'puzzle', '家長看得到要去哪個遊戲')
  assert.deepEqual(s.full, [], '還沒有字集滿')

  // 把最後一顆補上：變成集滿，就不該再出現在「只差一顆」
  const done = { ...progress, puzzles: { 火山: { char: '火', first: at, last: at, count: 1, right: 1 } } }
  const after = summarize(done, lib, new Date(at))
  assert.deepEqual(after.full, ['火'])
  assert.deepEqual(after.nearly.map((n) => n.char), [], '集滿了就不是「只差一顆」')
})
