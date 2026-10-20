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
  assert.deepEqual(p.puzzles['生日'], { char: '日', first: at, last: at, count: 1, right: 1, lastOk: true })
  p = solvePuzzle(p, '生日', '日', false, '2026-10-21T02:00:00Z')
  assert.deepEqual(p.puzzles['生日'], { char: '日', first: at, last: '2026-10-21T02:00:00Z', count: 2, right: 1, lastOk: false })
  // 離線補送的舊紀錄：次數照算，第一次與最後一次的時間不會被弄亂
  p = solvePuzzle(p, '生日', '日', true, '2026-10-19T02:00:00Z')
  assert.equal(p.puzzles['生日'].first, '2026-10-19T02:00:00Z')
  assert.equal(p.puzzles['生日'].last, '2026-10-21T02:00:00Z')
  assert.equal(p.puzzles['生日'].count, 3)
  assert.equal(p.puzzles['生日'].lastOk, false, 'an older right answer does not hide the newer miss')
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

test('picture puzzles only use words he can read, never come first, and show different pictures', async () => {
  const { pickPictureDecoys } = await import('../src/play/puzzles.ts')
  const chars = ['火', '山', '水', '口', '大', '小']
  const library = [
    entry('火', [['火山', '🌋']]), entry('山', [['山口', '⛰️']]), entry('水', [['口水', '🤤']]),
    entry('大', [['大口', '😮']]), entry('小', [['小山', '🗻']]), entry('口', [['人口', '👥']]),
  ]
  const watched = Object.fromEntries(chars.map((c) => [c, { count: 1, last: at }]))
  for (let k = 0; k < 20; k++) {
    const round = pickPuzzles(library, { watched }, Math.random)
    assert.equal(round[0].kind, 'char', 'the first one warms up')
    assert.ok(round.filter((r) => r.kind === 'picture').length <= 2)
    for (const r of round.filter((r) => r.kind === 'picture')) {
      assert.ok([...r.word].every((c) => watched[c]), `${r.word} is readable`)
      assert.ok(r.options.includes(r.word))
      const emojis = r.options.map((o) => library.flatMap((c) => c.words).find((w) => w.text === o).emoji)
      assert.equal(new Set(emojis).size, r.options.length, 'all pictures differ')
    }
    // 人口 has 人, which he has not watched: never a picture puzzle
    assert.ok(!round.some((r) => r.kind === 'picture' && r.word === '人口'))
  }
  // 跟答案沒有共同字的詞先當干擾
  const all = [{ text: '日出', emoji: '🌅' }, { text: '月亮', emoji: '🌙' }, { text: '火山', emoji: '🌋' }, { text: '同圖', emoji: '🎂' }]
  assert.deepEqual(pickPictureDecoys('生日', '🎂', all, 2, seq([0.5])).sort(), ['月亮', '火山'])
})

test('grammar words and words too hard for a small child never become puzzles; abstract ones are never picture questions', async () => {
  const { SKIP_WORDS, NO_PICTURE } = await import('../src/play/puzzles.ts')
  assert.ok(SKIP_WORDS.has('你的') && NO_PICTURE.has('中間'))
  assert.deepEqual(wordsFor(entry('你', [['你的', '👉'], ['你好', '👋']])).map((w) => w.text), ['你好'])
  const library = [entry('中', [['中間', '↔️']]), entry('火', [['火山', '🌋']]), entry('山', [['火山', '🌋'], ['山洞', '🕳️']])]
  const watched = { 中: { count: 9, last: at }, 間: { count: 1, last: at }, 火: { count: 1, last: at }, 山: { count: 1, last: at }, 洞: { count: 1, last: at } }
  for (let k = 0; k < 20; k++) {
    for (const r of pickPuzzles(library, { watched }, Math.random)) if (r.word === '中間') assert.equal(r.kind, 'char')
  }
})

test('a concrete word comes before an abstract one of the same character, even when he knows more of the abstract one', () => {
  const library = [entry('苦', [['吃苦', '🥲'], ['苦瓜', '🥒']])]
  const progress = { watched: { 苦: { count: 1, last: at }, 吃: { count: 5, last: at } } }
  for (const r of [0.1, 0.5, 0.9]) assert.equal(pickPuzzles(library, progress, seq([r]))[0].word, '苦瓜')
})

test('other games say a concrete word of the character, not always the first one', async () => {
  const { exampleWord } = await import('../src/play/puzzles.ts')
  const e = entry('心', [['小心', '⚠️'], ['開心', '😄'], ['點心', '🍪']])
  assert.equal(exampleWord(e, seq([0])).text, '開心')
  assert.equal(exampleWord(e, seq([0.99])).text, '點心')
  // 沒有能用的詞就退回第一個
  assert.equal(exampleWord(entry('你', [['你的', '👉']]), seq([0.5])).text, '你的')
})

test('a word he needed help with comes back next round, but never as the warm-up and at most two of them', () => {
  const chars = ['日', '月', '火', '水', '山', '木', '土']
  const library = chars.map((c) => entry(c, [[c + '甲', '🎈'], [c + '乙', '🎁']]))
  const watched = Object.fromEntries(chars.map((c, i) => [c, { count: 10 - i, last: at }]))
  const missed = (c) => ({ char: c, first: at, last: at, count: 1, right: 0, lastOk: false })
  const progress = { watched, puzzles: { 月甲: missed('月'), 火甲: missed('火'), 水甲: missed('水') } }
  for (let k = 0; k < 20; k++) {
    const round = pickPuzzles(library, progress, Math.random)
    const reviews = round.filter((r) => progress.puzzles[r.word])
    assert.equal(reviews.length, 2, 'two of the three missed words come back')
    assert.ok(!progress.puzzles[round[0].word], 'the warm-up is not a review')
    assert.equal(round.length, 5)
    assert.equal(new Set(round.map((r) => r.char)).size, 5)
  }
})

test('the puzzle gets easier when he needs lots of help and trickier when he almost never does', async () => {
  const { puzzleLevel } = await import('../src/play/puzzles.ts')
  const rec = (count, right) => ({ watched: {}, puzzles: { 甲乙: { char: '甲', first: at, last: at, count, right } } })
  assert.equal(puzzleLevel(rec(3, 0)), 'normal', 'too few tries to judge')
  assert.equal(puzzleLevel(rec(10, 4)), 'easy')
  assert.equal(puzzleLevel(rec(10, 6)), 'normal')
  assert.equal(puzzleLevel(rec(10, 8)), 'hard')

  setParts({ 日: [{ char: '口', strokes: [0, 1, 3] }], 目: [{ char: '口', strokes: [0, 1, 4] }] })
  const library = [entry('日', [['生日', '🎂']]), entry('目', [['目光', '👀']]), entry('火', [['火山', '🌋']]), entry('水', [['喝水', '🥤']])]
  const watched = { 日: { count: 9, last: at }, 目: { count: 1, last: at }, 火: { count: 1, last: at }, 水: { count: 1, last: at } }
  const easy = pickPuzzles(library, { ...rec(10, 2), watched })
  assert.ok(easy.every((r) => r.options.length === 2), 'two cards when it is hard for him')
  for (let k = 0; k < 10; k++) {
    const hard = pickPuzzles(library, { ...rec(10, 9), watched }, Math.random, 5, 0)
    const sun = hard.find((r) => r.char === '日')
    assert.ok(sun.options.includes('目'), 'a look-alike card when he is doing great')
    assert.equal(sun.options.length, 3)
  }
  setParts({})
  // 看詞找圖難一點：先挑有共同字的詞
  const { pickPictureDecoys } = await import('../src/play/puzzles.ts')
  const all = [{ text: '月亮', emoji: '🌙' }, { text: '火車', emoji: '🚂' }, { text: '金魚', emoji: '🐠' }]
  for (let k = 0; k < 10; k++) assert.equal(pickPictureDecoys('火山', '🌋', all, 2, Math.random, true)[0], '火車')
})
