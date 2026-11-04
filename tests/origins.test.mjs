import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const { ORIGINS, hasOrigin, strokeTiming } = await import('../src/play/origins.ts')
const lib = JSON.parse(fs.readFileSync(new URL('../data/characters.json', import.meta.url), 'utf8'))
const chars = new Set((lib.characters || lib).map((c) => c.char))

test('字源圖只畫字庫裡有的字，每一筆都是畫在 0–100 裡的 SVG 路徑', () => {
  assert.ok(Object.keys(ORIGINS).length >= 20)
  for (const [char, lines] of Object.entries(ORIGINS)) {
    assert.ok(chars.has(char), `${char} 不在字庫裡`)
    assert.ok(lines.length >= 1)
    for (const d of lines) {
      assert.match(d, /^M[\d. ]+/, `${char} 的 ${d} 不是從 M 開始`)
      for (const n of d.match(/-?\d+(\.\d+)?/g)) assert.ok(Number(n) >= -1 && Number(n) <= 101, `${char} 的座標 ${n} 超出 0–100`)
    }
  }
  assert.equal(hasOrigin('火'), true)
  assert.equal(hasOrigin('楊'), false)
})

test('一筆一筆畫：照順序、大約一秒半畫完', () => {
  for (const n of [1, 2, 6, 9]) {
    const t = strokeTiming(n)
    assert.equal(t.length, n)
    for (let i = 1; i < n; i++) assert.ok(t[i].delay > t[i - 1].delay)
    const end = t.at(-1).delay + t.at(-1).dur
    assert.ok(end >= 300 && end <= 2000, `${n} 筆要畫 ${end}ms`)
  }
})
