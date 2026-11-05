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

const { RADICAL_FX, fxFor, particle } = await import('../src/play/radicalFx.ts')
const { RADICALS } = await import('../shared/radicals.mjs')
const { emojiCode } = await import('../src/play/stageScenes.ts')
const css = fs.readFileSync(new URL('../src/play/styles/radicalfx.css', import.meta.url), 'utf8')
const have = new Set(fs.readdirSync(new URL('../public/emoji3d/', import.meta.url)).map((f) => f.replace(/\.png$/, '')))

test('每一個部首的家都會演自己的意思', () => {
  for (const r of RADICALS) assert.ok(fxFor(r.id), `${r.name}（${r.id}）沒有特效`)
  assert.equal(fxFor('word-火'), null)
  assert.equal(fxFor('sound-包'), null)
})

test('特效表沒有多出不存在的家，粒子都有 3D 圖，動作都有寫 CSS', () => {
  const ids = new Set(RADICALS.map((r) => r.id))
  for (const [id, fx] of Object.entries(RADICAL_FX)) {
    assert.ok(ids.has(id), `${id} 不是 shared/radicals.mjs 裡的家`)
    assert.ok(have.has(emojiCode(fx.emoji)), `${id} 的 ${fx.emoji} 沒有 3D 圖`)
    assert.ok(css.includes(`.mfx-${fx.motion} `), `${fx.motion} 沒有 CSS`)
    if (fx.glyph !== 'none') assert.ok(css.includes(`.mfx-glyph-${fx.glyph} `), `${fx.glyph} 沒有 CSS`)
    assert.ok(fx.count >= 1 && fx.count <= 6)
  }
})

test('粒子平均散開、一顆接一顆出來', () => {
  assert.deepEqual(particle(0, 1), { x: 50, delay: 0 })
  assert.equal(particle(0, 5).x, 10)
  assert.equal(particle(4, 5).x, 90)
  const delays = [0, 1, 2, 3].map((i) => particle(i, 4).delay)
  assert.deepEqual(delays, [...delays].sort((a, b) => a - b))
  assert.ok(delays[3] < 1.6)
})
