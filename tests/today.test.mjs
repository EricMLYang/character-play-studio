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

const { todayPath, currentStop, pathDone, NEW_PER_DAY } = await import('../src/play/today.ts')

const today = '2026-10-22'
// 台灣時間 2026-10-22 早上，存成 UTC
const now = '2026-10-22T01:00:00Z'
const before = '2026-10-19T01:00:00Z'
const entry = (char, i, words = []) => ({ char, zhuyin: '', meaning: '', emoji: '', priority: i, media: [], words })
// 河、海、湖、洗 住三點水；火、山、口、木 各自那一家只有自己；早、晚 住日字旁
const library = ['河', '海', '湖', '洗', '火', '山', '口', '木', '早', '晚'].map((c, i) => entry(c, i, c === '火' ? [{ text: '火車', emoji: '🚂' }] : []))
const watched = (chars, at, count = 1) => Object.fromEntries([...chars].map((c) => [c, { count, last: at }]))
const ids = (stops) => stops.map((s) => s.id)

test('字還太少的時候只有新朋友跟回家：其他玩法都要先有看過的字', () => {
  const stops = todayPath(library, { watched: watched('火山', before) }, today)
  assert.deepEqual(ids(stops), ['new', 'home'])
  assert.equal(stops[0].need, NEW_PER_DAY)
  assert.equal(currentStop(stops).id, 'new')
  assert.equal(pathDone(stops), false)
})

test('看過四個字之後五站都在，順序固定', () => {
  const stops = todayPath(library, { watched: watched('火山口木', before) }, today)
  assert.deepEqual(ids(stops), ['recall', 'new', 'family', 'read', 'home'])
  for (const s of stops) {
    assert.ok(s.say && s.hint && s.cta && s.hero, s.id)
    assert.ok(s.need >= 1, s.id)
  }
})

test('新朋友優先挑能讓某一家湊起來的字：看過河，就先推海、湖', () => {
  const stops = todayPath(library, { watched: watched('河火山口', before) }, today)
  const fresh = stops.find((s) => s.id === 'new')
  assert.deepEqual(fresh.chars, ['海', '湖'], '河的家人排在前面，不是照字庫順序')
  assert.deepEqual(fresh.go, { kind: 'char', char: '海' })
  assert.equal(fresh.done, 0)
})

test('今天第一次看的字算新朋友做到了，同一天重算不會換掉', () => {
  const progress = { watched: { ...watched('河火山口', before), 海: { count: 1, last: now } } }
  const stops = todayPath(library, progress, today)
  const fresh = stops.find((s) => s.id === 'new')
  assert.deepEqual(fresh.chars, ['海', '湖'])
  assert.equal(fresh.done, 1)
  assert.deepEqual(fresh.go, { kind: 'char', char: '湖' }, '按鈕直接帶去還沒看的那個')
  // 看第二次還是今天的新字；看了很多次就不是了
  const again = todayPath(library, { watched: { ...progress.watched, 海: { count: 2, last: now } } }, today)
  assert.equal(again.find((s) => s.id === 'new').done, 1)
})

test('想起來：到期的字列出來，今天自己認出來幾個就算幾個', () => {
  const progress = {
    watched: watched('河海火山口', before),
    recall: {
      河: { box: 1, due: '2026-10-22', last: before, right: 1, wrong: 0 },
      海: { box: 1, due: '2026-10-20', last: before, right: 1, wrong: 0 },
      火: { box: 2, due: '2026-10-30', last: now, right: 2, wrong: 0 },
    },
  }
  const recall = todayPath(library, progress, today).find((s) => s.id === 'recall')
  assert.deepEqual(recall.chars, ['河', '海'], '到期的才列，火 還沒到')
  assert.equal(recall.done, 1, '火 是今天認對的')
  assert.equal(recall.need, 3)
  assert.deepEqual(recall.go, { kind: 'game', id: 'feed' })
})

test('牠的家：先挑今天的字住的那一家，今天找到一個家人就算', () => {
  const progress = { watched: watched('河海火山', before), recall: { 河: { box: 1, due: '2026-10-22', last: before, right: 1, wrong: 0 } } }
  const family = todayPath(library, progress, today).find((s) => s.id === 'family')
  assert.deepEqual(family.chars, ['河'], '河 到期、住三點水')
  assert.match(family.label, /三點水/)
  assert.deepEqual(family.go, { kind: 'game', id: 'roots', want: '河' })
  assert.equal(family.done, 0)
  const found = { ...progress, radicals: { water: { 湖: now } } }
  assert.equal(todayPath(library, found, today).find((s) => s.id === 'family').done, 1, '哪一家都算')
})

test('讀一讀：翻開小書，一句算一句，一天三句', () => {
  const progress = { watched: watched('河海山口', before), books: { '河馬好大！': { char: '河', first: now, last: now, count: 1, right: 1 } } }
  const read = todayPath(library, progress, today).find((s) => s.id === 'read')
  assert.deepEqual(read.go, { kind: 'game', id: 'book' })
  assert.equal(read.need, 3)
  assert.equal(read.done, 1)
})

test('回家那一站要前面都做完才算，全部做完整條路就走完了', () => {
  const progress = {
    watched: { ...watched('河海火山口木', before), 早: { count: 1, last: now }, 晚: { count: 1, last: now } },
    recall: { 河: { box: 1, due: '2026-10-30', last: now, right: 1, wrong: 0 }, 海: { box: 1, due: '2026-10-30', last: now, right: 1, wrong: 0 },
      火: { box: 1, due: '2026-10-30', last: now, right: 1, wrong: 0 } },
    radicals: { water: { 河: now } },
    books: { '火車好大！': { char: '火', first: now, last: now, count: 1, right: 1 }, '你有火山。': { char: '火', first: now, last: now, count: 1, right: 1 },
      '河馬好可愛！': { char: '河', first: now, last: now, count: 1, right: 1 } },
  }
  const stops = todayPath(library, progress, today)
  assert.ok(stops.slice(0, -1).every((s) => s.done >= s.need), '前四站都做完')
  assert.equal(stops.at(-1).done, 1)
  assert.equal(pathDone(stops), true)
  assert.equal(currentStop(stops), null)
  // 少做一件，回家就還沒到
  const notYet = todayPath(library, { ...progress, radicals: {} }, today)
  assert.equal(notYet.at(-1).done, 0)
  assert.equal(currentStop(notYet).id, 'family')
})
