import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
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

const { RADICALS, familyOf, radicalLines, radicalGlyphs } = await import('../shared/radicals.mjs')
const { recordEvent } = await import('../shared/play-events.mjs')
const { familiesIn, familyFor, foundIn, storyMembers, pickFinds, nameFamilies, FIND_ROUNDS } = await import('../src/play/families.ts')

const ROOT = path.resolve(import.meta.dirname, '..')
const strokeData = (char) => {
  const file = path.join(ROOT, 'node_modules/hanzi-writer-data', `${char}.json`)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
}
const at = '2026-10-20T03:00:00Z'
const entry = (char) => ({ char, zhuyin: '', meaning: '', priority: 1, emoji: '', media: [] })
// 固定的「亂數」：每次都挑第一個
const first = () => 0

test('every radical family is complete: forms, name, and one spoken line per member', () => {
  const ids = new Set()
  for (const r of RADICALS) {
    assert.ok(!ids.has(r.id), `重複的 id：${r.id}`)
    ids.add(r.id)
    assert.ok(r.forms.length >= 1 && r.forms.length <= 2, r.id)
    for (const key of ['name', 'emoji', 'intro', 'change', 'common']) assert.ok(r[key], `${r.id} 少了 ${key}`)
    assert.ok(Object.keys(r.members).length >= 2, `${r.id} 至少要兩個家人`)
    for (const [char, why] of Object.entries(r.members)) assert.ok(why.length >= 3, `${r.id}／${char} 少了原因`)
  }
})

test('a character lives in only one family', () => {
  const seen = new Map()
  for (const r of RADICALS) for (const char of Object.keys(r.members)) {
    assert.ok(!seen.has(char), `${char} 同時在 ${seen.get(char)} 和 ${r.id}`)
    seen.set(char, r.id)
  }
  assert.equal(familyOf('河').id, 'water')
  assert.equal(familyOf('可'), undefined, '意思連不上的同部首字不收')
})

test('every radical shape can be written stroke by stroke, and every member knows which strokes are its radical', () => {
  for (const glyph of radicalGlyphs()) assert.ok(strokeData(glyph), `${glyph} 沒有筆順資料，門牌畫不出來`)
  for (const r of RADICALS) for (const char of Object.keys(r.members)) {
    const data = strokeData(char)
    assert.ok(data, `${char} 沒有筆順資料`)
    assert.ok(data.radStrokes?.length, `${char} 的筆順資料沒有標部首，故事裡亮不起來`)
  }
})

test('every family line is pre-rendered (he cannot read yet)', () => {
  const lines = new Set(radicalLines())
  for (const r of RADICALS) {
    for (const line of [r.intro, r.change, r.common, ...Object.values(r.members)]) assert.ok(lines.has(line), line)
  }
})

test('the radical event only accepts a real member of that family', () => {
  const known = (c) => '河海手打'.includes(c)
  const ok = recordEvent({ watched: {} }, 'radical', { char: '河', family: 'water', ok: true, id: 'evt-00000101', at }, known, '2026-10-20')
  assert.equal(ok.progress.radicals.water.河, at)
  assert.ok(recordEvent({ watched: {} }, 'radical', { char: '打', family: 'water', ok: true, id: 'evt-00000102', at }, known).error, '打不住三點水')
  assert.ok(recordEvent({ watched: {} }, 'radical', { char: '河', family: 'nope', ok: true, id: 'evt-00000103', at }, known).error)
  const again = recordEvent(ok.progress, 'radical', { char: '河', family: 'water', ok: false, id: 'evt-00000104', at: '2026-10-21T03:00:00Z' }, known, '2026-10-21')
  assert.equal(again.progress.radicals.water.河, at, '第一次找到的時間留著')
})

test('families only appear when at least two members are in the child library', () => {
  const families = familiesIn(['河', '海', '打'].map(entry))
  assert.deepEqual(families.map((f) => f.id), ['water'])
  assert.deepEqual(families[0].list.map((c) => c.char), ['河', '海'])
  assert.equal(familyFor('打', families), undefined, '提手旁只有一個字，先不出現')
  assert.equal(foundIn(families[0], { watched: {}, radicals: { water: { 海: at } } }), 1)
})

test('the story introduces the character he came from first, then ones he has watched', () => {
  const [water] = familiesIn(['河', '海', '湖'].map(entry))
  assert.deepEqual(storyMembers(water, { watched: { 湖: { count: 1, last: at } } }).map((c) => c.char), ['湖', '河', '海'])
  assert.deepEqual(storyMembers(water, { watched: { 湖: { count: 1, last: at } } }, '海').map((c) => c.char), ['海', '湖', '河'], '從字卡點進來的字先出場')
})

test('find rounds: one family member per round with two characters from other families, unfound members first', () => {
  const families = familiesIn(['河', '海', '湖', '洗', '湯', '浪', '打', '拍', '吃', '喝'].map(entry))
  const water = families.find((f) => f.id === 'water')
  const rounds = pickFinds(water, families, { watched: {}, radicals: { water: { 河: at } } }, first)
  assert.equal(rounds.length, FIND_ROUNDS)
  assert.notEqual(rounds[0].char, '河', '找過的家人放後面')
  for (const r of rounds) {
    assert.equal(r.options.length, 3)
    assert.deepEqual(r.options.filter((c) => familyOf(c)?.id === 'water'), [r.char], '三張裡只有一張是這一家的')
  }
})

test('his name lives in three families', () => {
  const families = familiesIn(['楊', '林', '捷', '打', '睿', '眼'].map(entry))
  assert.deepEqual(nameFamilies('楊捷睿', families).map((h) => h.family.id), ['tree', 'hand', 'eye'])
  assert.deepEqual(nameFamilies('楊捷睿', familiesIn(['楊', '林'].map(entry))), [], '有字找不到家就整條不顯示')
})
