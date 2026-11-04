import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const { dayCard, DAY_MAX } = await import('../src/play/todayRecap.ts')

// 台灣 11/05 = UTC 11/04 16:00 之後
const today = '2026-11-05'
const at = '2026-11-05T02:00:00Z'
const old = '2026-11-01T02:00:00Z'

test('今天碰過的字才上卡，做越多件事的排越前面，自己寫過的帶筆跡', () => {
  const progress = {
    watched: { 火: { count: 3, last: at }, 水: { count: 1, last: at }, 山: { count: 2, last: old } },
    town: { 火: { traces: 1, first: at, last: at, strokes: [[1, 2, 3, 4]] } },
    recall: { 水: { box: 1, due: '2026-11-06', last: at, right: 1, wrong: 0 }, 山: { box: 0, due: today, last: at, right: 0, wrong: 1 } },
    books: { '火車好大！': { char: '火', last: at, ok: true } },
    radicals: { fire: { 火: at }, 'word-火': { 火車: at } },
  }
  const card = dayCard(progress, today)
  assert.deepEqual(card.map((c) => c.char), ['火', '水'], '山 今天認錯了（還要再考），不算')
  assert.deepEqual(card[0].deeds.sort(), ['family', 'read', 'watch', 'write'])
  assert.deepEqual(card[0].strokes, [[1, 2, 3, 4]])
  assert.deepEqual(card[1].deeds.sort(), ['recall', 'watch'])
  assert.equal(card[1].strokes, undefined)
})

test('最多六個；什麼都沒做的那天是空的', () => {
  const watched = Object.fromEntries([...'一二三四五六七八'].map((c) => [c, { count: 1, last: at }]))
  assert.equal(dayCard({ watched }, today).length, DAY_MAX)
  assert.deepEqual(dayCard({ watched: {} }, today), [])
})

test('難的事排前面：今天自己認出來的字排在只看過的字前面', () => {
  const progress = {
    watched: { 一: { count: 1, last: at }, 二: { count: 1, last: at } },
    recall: { 火: { box: 1, due: '2026-11-06', last: at, right: 1, wrong: 0 } },
  }
  assert.equal(dayCard(progress, today)[0].char, '火')
})
