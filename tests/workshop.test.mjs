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

const { splitOf, boxOf, pickBuilds, restChar, canBuild } = await import('../src/play/building.ts')
const { familiesIn } = await import('../src/play/families.ts')
const stroke = (c) => { try { return JSON.parse(fs.readFileSync(new URL(`../public/strokes/${c}.json`, import.meta.url), 'utf8')) } catch { return null } }
const lib = JSON.parse(fs.readFileSync(new URL('../data/characters.json', import.meta.url), 'utf8'))
const library = (lib.characters || lib).filter((c) => c.status !== 'deleted')
const families = familiesIn(library)
const splitsFor = (fams) => {
  const m = new Map()
  for (const f of fams.filter((x) => x.kind === 'radical')) {
    const form = stroke(f.forms[f.forms.length - 1])
    if (!form) continue
    for (const c of f.list) { const s = splitOf(stroke(c.char), form.strokes.length); if (s) m.set(c.char, s) }
  }
  return m
}
const splits = splitsFor(families)

test('河 切成 三點水（左邊三筆）＋ 可', () => {
  const s = splitOf(stroke('河'), 3)
  assert.deepEqual(s.rad, [0, 1, 2])
  assert.deepEqual(s.rest, [3, 4, 5, 6, 7])
  assert.equal(s.layout, 'left')
  assert.equal(restChar([{ char: '可', strokes: [3, 4, 5, 6, 7] }], s), '可')
  assert.equal(restChar([{ char: '口', strokes: [3, 4, 5] }], s), undefined)
})

test('部首在哪一邊：草 在上面、睿 的目在下面、相 的目在右邊', () => {
  assert.equal(splitOf(stroke('草'), 3)?.layout ?? splitOf(stroke('草'), 4)?.layout, 'top')
  assert.equal(splitOf(stroke('睿'), 5).layout, 'bottom')
  assert.equal(splitOf(stroke('相'), 5).layout, 'right')
})

test('切不乾淨的不出題：部首筆數對不上、沒有部首資料、整個字都是部首', () => {
  assert.equal(splitOf(stroke('愛'), 3), null)
  assert.equal(splitOf({ strokes: ['a'], medians: [[[0, 0]]] }, 1), null)
  assert.equal(splitOf({ strokes: ['a', 'b'], medians: [[[0, 0]], [[1, 1]]], radStrokes: [0, 1] }, 2), null)
  assert.equal(splitOf(null, 3), null)
})

test('外框用中線算', () => {
  assert.deepEqual(boxOf({ strokes: ['', ''], medians: [[[10, 20], [30, 5]], [[50, 60]]] }, [0, 1]), [10, 5, 50, 60])
})

test('出題：同一家的字、干擾積木來自別家且部首在同一邊、每題至少一塊干擾', () => {
  const water = families.find((f) => f.id === 'water')
  const progress = { watched: { 河: { count: 1 } } }
  const builds = pickBuilds(water, families, progress, splits, () => 0.3)
  assert.ok(builds.length >= 1 && builds.length <= 3)
  assert.equal(builds[0].char, '河', '看過的字先出')
  for (const b of builds) {
    assert.ok(water.list.some((c) => c.char === b.char))
    assert.ok(b.decoys.length >= 1 && b.decoys.length <= 2)
    for (const d of b.decoys) {
      assert.notEqual(d.family, 'water')
      assert.equal(splits.get(d.char).layout, b.split.layout)
    }
    assert.equal(new Set(b.decoys.map((d) => d.family)).size, b.decoys.length)
  }
  assert.equal(new Set(builds.map((b) => b.char)).size, builds.length)
})

test('聲音家、詞家族不蓋字；大部分部首家都蓋得起來', () => {
  const sound = families.find((f) => f.kind !== 'radical')
  if (sound) assert.deepEqual(pickBuilds(sound, families, { watched: {} }, splits), [])
  const radical = families.filter((f) => f.kind === 'radical')
  const ok = radical.filter((f) => canBuild(f, families, { watched: {} }, splits))
  assert.ok(ok.length >= radical.length - 3, `只有 ${ok.map((f) => f.id)} 蓋得起來`)
})
