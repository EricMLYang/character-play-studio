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

const { napOf, sleepersIn } = await import('../src/play/naps.ts')
const { recall } = await import('../shared/domain.mjs')

const progress = {
  watched: {},
  town: { 火: {}, 水: {}, 山: {}, 木: {} },
  recall: {
    火: { box: 1, due: '2026-11-04', last: '2026-11-03T10:00:00Z' },
    水: { box: 2, due: '2026-11-06', last: '2026-11-04T10:00:00Z' },
    山: { box: 3, due: '2026-11-12', last: '2026-11-04T10:00:00Z' },
  },
}

test('今天（或更早）該考的睡著、明天要考的想睡、其他醒著，沒考過的也醒著', () => {
  assert.equal(napOf(progress, '火', '2026-11-05'), 'asleep')
  assert.equal(napOf(progress, '火', '2026-11-04'), 'asleep')
  assert.equal(napOf(progress, '水', '2026-11-05'), 'sleepy')
  assert.equal(napOf(progress, '山', '2026-11-05'), 'awake')
  assert.equal(napOf(progress, '木', '2026-11-05'), 'awake')
  assert.equal(napOf(progress, '水', '2026-11-30'), 'asleep')
})

test('跨月也算得對（10/31 的明天是 11/1）', () => {
  const p = { watched: {}, recall: { 日: { box: 1, due: '2026-11-01', last: '2026-10-30T00:00:00Z' } } }
  assert.equal(napOf(p, '日', '2026-10-31'), 'sleepy')
})

test('叫醒他（認對一次）排程往後推，他就醒著了', () => {
  const woke = recall(progress, '火', true, '2026-11-05T03:00:00Z')
  assert.equal(napOf(woke, '火', '2026-11-05'), 'awake')
  const missed = recall(progress, '火', false, '2026-11-05T03:00:00Z')
  assert.equal(napOf(missed, '火', '2026-11-05'), 'asleep', '認錯了今天還要再考')
})

test('小鎮裡睡著的只算住在小鎮的字', () => {
  const p = { ...progress, recall: { ...progress.recall, 雲: { box: 0, due: '2026-11-01', last: '2026-10-31T00:00:00Z' } } }
  assert.deepEqual(sleepersIn(p, '2026-11-05'), ['火'])
})
