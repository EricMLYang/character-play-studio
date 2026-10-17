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

const { recall, RECALL_DAYS } = await import('../shared/domain.mjs')
const { acceptEvent, applyEvent } = await import('../shared/play-events.mjs')
const { setParts } = await import('../src/play/parts.ts')
const { pickDishes, pickDecoy, looksAlike, knownCount } = await import('../src/play/dishes.ts')

// 2026-10-17 10:00 台灣時間
const at = '2026-10-17T02:00:00Z'
const seq = (values) => { let i = 0; return () => values[i++ % values.length] }

test('a right answer waits longer before coming back; a wrong one comes back today', () => {
  let p = recall({ watched: {} }, '火', true, at)
  assert.deepEqual(p.recall['火'], { box: 1, due: '2026-10-18', last: at, right: 1, wrong: 0 })
  p = recall(p, '火', true, '2026-10-18T02:00:00Z')
  assert.equal(p.recall['火'].box, 2)
  assert.equal(p.recall['火'].due, '2026-10-20')
  p = recall(p, '火', false, '2026-10-20T02:00:00Z')
  assert.equal(p.recall['火'].box, 1, 'a miss drops one level, not back to zero')
  assert.equal(p.recall['火'].due, '2026-10-20', 'and asks again today')
  assert.equal(recall({ watched: {} }, '水', false, at).recall['水'].box, 0, 'never below zero')
  let top = { watched: {} }
  for (let i = 0; i < 10; i++) top = recall(top, '山', true, `2026-10-${String(10 + i).padStart(2, '0')}T02:00:00Z`)
  assert.equal(top.recall['山'].box, RECALL_DAYS.length - 1, 'the level stops at the top')
})

test('an older answer arriving late is counted but does not change the schedule', () => {
  const p = recall({ watched: {} }, '火', true, at)
  const late = recall(p, '火', false, '2026-10-16T02:00:00Z')
  assert.equal(late.recall['火'].box, 1)
  assert.equal(late.recall['火'].due, '2026-10-18')
  assert.equal(late.recall['火'].wrong, 1)
})

test('recall events go through the shared event table', () => {
  const known = (c) => c === '火'
  assert.equal(acceptEvent('recall', { char: '火', id: 'recall-0001', at, ok: true }, known, Date.parse(at)), true)
  assert.equal(acceptEvent('recall', { char: '火', id: 'recall-0001', at, ok: 'yes' }, known, Date.parse(at)), false)
  assert.equal(applyEvent({ watched: {} }, { kind: 'recall', char: '火', id: 'recall-0001', at, ok: true }).recall['火'].box, 1)
})

test('a round starts with what he knows best and mixes in at most two due reviews up front', () => {
  const progress = {
    watched: { 山: { count: 9 }, 水: { count: 1 }, 火: { count: 5 }, 木: { count: 2 }, 日: { count: 3 }, 月: { count: 1 }, 人: { count: 4 } },
    recall: {
      水: { box: 0, due: '2026-10-17', right: 0, wrong: 1 },
      月: { box: 1, due: '2026-10-16', right: 1, wrong: 0 },
      人: { box: 2, due: '2026-10-15', right: 2, wrong: 0 },
      木: { box: 3, due: '2026-10-30', right: 3, wrong: 0 },
    },
  }
  const pool = Object.keys(progress.watched)
  const dishes = pickDishes(pool, progress, '2026-10-17', seq([0.1, 0.7, 0.3, 0.9]))
  assert.equal(dishes.length, 5)
  assert.equal(new Set(dishes).size, 5, 'no repeats in one round')
  assert.equal(dishes[0], '山', 'warm up with the most-watched character')
  for (const c of ['水', '月', '山', '火', '日']) assert.ok(dishes.includes(c), c)
  assert.ok(!dishes.includes('木'), 'not due and the round is already full')
  assert.deepEqual(pickDishes(['山'], progress, '2026-10-17'), ['山'])
  assert.deepEqual(pickDishes([], progress, '2026-10-17'), [])
})

test('the other card never looks like the one he is looking for', () => {
  setParts({ 日: [{ char: '口', strokes: [0, 1, 3] }], 目: [{ char: '口', strokes: [0, 1, 4] }], 器: [{ char: '口', strokes: [0, 1, 2] }, { char: '犬', strokes: [6, 7, 8, 9] }] })
  assert.equal(looksAlike('日', '口'), true, 'one hides in the other')
  assert.equal(looksAlike('日', '目'), true, 'they share a part')
  assert.equal(looksAlike('日', '火'), false)
  for (let i = 0; i < 20; i++) {
    const decoy = pickDecoy('日', ['口', '目', '器', '火', '水'], [], Math.random)
    assert.ok(['火', '水'].includes(decoy), decoy)
  }
  assert.equal(pickDecoy('日', ['口'], ['口', '山'], () => 0), '山', 'falls back to any character when every known one looks alike')
  setParts({})
})

test('he "knows" a character once it has climbed at least one level', () => {
  assert.equal(knownCount({ watched: {}, recall: { 火: { box: 1 }, 水: { box: 0 }, 山: { box: 3 } } }), 2)
  assert.equal(knownCount({ watched: {} }), 0)
})
