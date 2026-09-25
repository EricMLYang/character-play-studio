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
const { brew, recipes } = await import('../src/play/brew.ts')
const { setParts } = await import('../src/play/parts.ts')
const { SCENES } = await import('../shared/domain.mjs')

// 口 躲在 日、吃、器 裡；器 = 口＋犬；明 = 日＋月
const PARTS = {
  日: [{ char: '口', strokes: [0, 1, 3] }],
  吃: [{ char: '口', strokes: [0, 1, 2] }],
  器: [{ char: '口', strokes: [0, 1, 2] }, { char: '犬', strokes: [6, 7, 8, 9] }],
  明: [{ char: '日', strokes: [0, 1, 2, 3] }, { char: '月', strokes: [4, 5, 6, 7] }],
}
const SCENE = { 火: 'fire', 水: 'rain', 鳥: 'fly', 木: 'grow', 口: 'bounce', 日: 'glow', 月: 'glow' }
const sceneOf = (char) => SCENE[char] || 'sparkle'
const known = (chars) => new Set(chars)
setParts(PARTS)

test('one character in the pot becomes a word it hides in, preferring ones not yet discovered', () => {
  const library = known('口日吃器犬')
  const first = brew(['口'], library, {}, sceneOf, () => 0)
  assert.equal(first.kind, 'make')
  assert.deepEqual(first.from, ['口'])
  assert.deepEqual(first.strokes, PARTS[first.char][0].strokes)

  const fresh = brew(['口'], library, { 日: 'x', 器: 'x' }, sceneOf, () => 0.99)
  assert.equal(fresh.char, '吃', 'the only undiscovered word wins regardless of the dice')

  const all = { 日: 'x', 吃: 'x', 器: 'x' }
  assert.equal(brew(['口'], library, all, sceneOf, () => 0).kind, 'make', 'everything found still makes something')
})

test('words hidden from the child are never produced, and a lonely character says so', () => {
  assert.equal(brew(['口'], known('口日'), {}, sceneOf, () => 0.99).char, '日')
  assert.deepEqual(brew(['口'], known('口'), {}, sceneOf), { kind: 'alone', char: '口' })
  assert.deepEqual(brew(['水'], known('水'), {}, sceneOf), { kind: 'alone', char: '水' })
})

test('two characters that exactly compose a word make it, in either order, with both parts marked', () => {
  const library = known('口犬器日月明')
  for (const pair of [['口', '犬'], ['犬', '口']]) {
    const result = brew(pair, library, {}, sceneOf)
    assert.equal(result.kind, 'make')
    assert.equal(result.char, '器')
    assert.deepEqual(result.strokes, [0, 1, 2, 6, 7, 8, 9])
  }
  assert.equal(brew(['月', '日'], library, {}, sceneOf).char, '明')
  assert.notEqual(brew(['口', '犬'], known('口犬'), {}, sceneOf).kind, 'make', 'unopened words cannot be made')
})

test('a character dropped with a word that contains it is found inside, in either order', () => {
  for (const pair of [['口', '日'], ['日', '口']]) {
    const result = brew(pair, known('口日'), {}, sceneOf)
    assert.deepEqual(result, { kind: 'inside', char: '日', part: '口', strokes: [0, 1, 3] })
  }
})

test('unrelated characters react by scene, the same way in either order', () => {
  const a = brew(['火', '水'], known('火水'), {}, sceneOf)
  const b = brew(['水', '火'], known('火水'), {}, sceneOf)
  assert.equal(a.kind, 'react')
  assert.deepEqual(a, b)
})

test('every pair of named scenes has its own reaction; only sparkle falls back to a surprise', () => {
  const named = SCENES.filter((s) => s !== 'sparkle')
  const surprises = new Set(Array.from({ length: 20 }, (_, i) =>
    brew(['甲', '乙'], known('甲乙'), {}, () => 'sparkle', () => i / 20).line))
  assert.ok(surprises.size > 1, 'sparkle pairs vary with the dice')

  for (const x of named) {
    for (const y of named) {
      const lines = new Set([0, 0.5, 0.99].map((dice) =>
        brew(['甲', '乙'], known('甲乙'), {}, (c) => (c === '甲' ? x : y), () => dice).line))
      assert.equal(lines.size, 1, `${x}+${y} should have a fixed reaction`)
      assert.ok(![...lines].some((line) => surprises.has(line)), `${x}+${y} fell back to a random surprise`)
    }
  }
})

test('the recipe book lists opened words that contain at least one opened character', () => {
  const book = recipes(known('口日器明'))
  assert.deepEqual(book.map((r) => r.char).sort(), ['器', '日', '明'].sort())
  assert.deepEqual(book.find((r) => r.char === '器').from, ['口'], 'only parts the child can see')
  assert.deepEqual(book.find((r) => r.char === '明').from, ['日'])
})
