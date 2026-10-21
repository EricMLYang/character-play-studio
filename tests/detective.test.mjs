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

const { setParts } = await import('../src/play/parts.ts')
const { pickRounds, howFast, rounds, ROUNDS, WARMUP } = await import('../src/play/guessing.ts')

const entry = (char) => ({ char, zhuyin: '', meaning: '', emoji: '', concept: {}, status: 'live', priority: 0, media: [], feedback: [] })
const library = [...'火水山木日月人口大小中天上下手'].map(entry)
const all = { watched: Object.fromEntries([...'火水山木日月人口大小中天上下手'].map((c) => [c, { count: 2, last: '2026-10-21T02:00:00Z' }])) }
const today = '2026-10-22'
const seq = (values) => { let i = 0; return () => values[i++ % values.length] }

setParts({ 日: [{ char: '口', strokes: [0, 1, 2] }], 目: [{ char: '口', strokes: [0, 1, 2] }] })

test('一輪五個字，每一題的卡片裡一定有答案，前兩題只放兩張', () => {
  const list = pickRounds(library, all, seq([0.1, 0.5, 0.9, 0.3]), today)
  assert.equal(list.length, ROUNDS)
  for (const [i, r] of list.entries()) {
    assert.ok(r.options.includes(r.char), `第 ${i + 1} 題沒有答案`)
    assert.equal(new Set(r.options).size, r.options.length, `第 ${i + 1} 題有重複的卡`)
    assert.equal(r.options.length, i < WARMUP ? 2 : 3)
  }
  assert.equal(new Set(list.map((r) => r.char)).size, list.length, '一輪不會考同一個字兩次')
})

test('干擾的字不會挑長得像的：要靠形狀認，不是被騙', () => {
  const alike = [...'日目口'].map(entry)
  const list = pickRounds(alike, { watched: { 日: { count: 5, last: '2026-10-21T02:00:00Z' } } }, seq([0.3]), today)
  for (const r of list) for (const c of r.options) {
    if (c !== r.char) assert.ok(!'口目'.includes(c) || r.char !== '日', `「${r.char}」不該配上長得像的「${c}」`)
  }
})

test('只考他看過的字', () => {
  const progress = { watched: { 火: { count: 3, last: '2026-10-21T02:00:00Z' }, 山: { count: 1, last: '2026-10-21T02:00:00Z' } } }
  const list = pickRounds(library, progress, seq([0.5]), today)
  assert.deepEqual([...new Set(list.map((r) => r.char))].sort(), ['山', '火'])
})

test('越早猜到講得越誇張，而且一定說出看了幾筆', () => {
  assert.equal(howFast(1, 10).id, 'flash')
  assert.equal(howFast(2, 10).id, 'flash')
  assert.match(howFast(2, 10).text, /2 筆/)
  assert.equal(howFast(4, 12).id, 'sharp')
  assert.match(howFast(4, 12).text, /4 筆/)
  assert.equal(howFast(9, 12).id, 'ok')
  // 筆畫少的字：門檻不會低到連第三筆都算慢
  assert.equal(howFast(3, 4).id, 'sharp')
  assert.equal(howFast(4, 4).id, 'ok')
})

test('結算分成自己猜到的、跟等到畫完才知道的', () => {
  const r = rounds([{ char: '火', ok: true }, { char: '水', ok: false }, { char: '山', ok: true }])
  assert.deepEqual(r.good, ['火', '山'])
  assert.deepEqual(r.again, ['水'])
})
