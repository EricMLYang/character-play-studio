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

const { ACTS, stagingFor, actSegment } = await import('../src/play/bookActs.ts')
const { PATTERNS } = await import('../shared/books.mjs')
const { segmentsOf } = await import('../src/play/books.ts')
const css = fs.readFileSync(new URL('../src/play/styles/book.css', import.meta.url), 'utf8')

test('每一種句型都有演法，每種演法都有 CSS', () => {
  for (const p of PATTERNS) {
    assert.ok(ACTS[p.id], `句型 ${p.id} 沒有演法`)
    assert.ok(css.includes(`.act-${ACTS[p.id].act}.on`), `${ACTS[p.id].act} 沒有 CSS`)
  }
  assert.equal(stagingFor('nope').act, 'fun')
})

test('唸到那一段才演：「火車好大！」演在「好大」、「你有火車。」演在「火車」', () => {
  for (const p of PATTERNS) {
    const s = stagingFor(p.id)
    const segs = segmentsOf(p, '火車')
    const at = actSegment(p, s)
    assert.ok(at < segs.length, p.id)
    if (s.trigger === 'after' && p.after.replace(/[。！？，]/g, '')) assert.equal(segs[at].text, p.after)
    else assert.equal(segs[at].text, '火車')
    assert.ok(segs[at].say, `${p.id} 的第 ${at} 段不唸，演不起來`)
  }
})
