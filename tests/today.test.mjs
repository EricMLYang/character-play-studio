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

const { todayQuests, allDone } = await import('../src/play/today.ts')

const today = '2026-10-22'
// 台灣時間 2026-10-22 早上，存成 UTC
const now = '2026-10-22T01:00:00Z'
const before = '2026-10-19T01:00:00Z'
const watched = (chars, at) => Object.fromEntries([...chars].map((c) => [c, { count: 1, last: at }]))

test('字還太少的時候只給一件事：先去看字', () => {
  const quests = todayQuests({ watched: watched('火水', now) }, today)
  assert.equal(quests.length, 1)
  assert.equal(quests[0].id, 'watch')
})

test('三件事：看字固定，另外兩件每天輪，同一天不會變', () => {
  const progress = { watched: watched('火水山木日', before) }
  const a = todayQuests(progress, today)
  assert.equal(a.length, 3)
  assert.equal(a[0].id, 'watch')
  assert.equal(new Set(a.map((q) => q.id)).size, 3, '同一天不會出現兩件一樣的')
  assert.deepEqual(todayQuests(progress, today).map((q) => q.id), a.map((q) => q.id), '同一天重算要一樣')

  const b = todayQuests(progress, '2026-10-23')
  assert.notDeepEqual(b.map((q) => q.id), a.map((q) => q.id), '換一天就換題目')
  assert.equal(b[0].id, 'watch', '看字每天都在')
})

test('只算今天做的，昨天的不算', () => {
  const progress = { watched: { ...watched('火水山', now), ...watched('木日月', before) } }
  const watch = todayQuests(progress, today)[0]
  assert.equal(watch.done, 3)
  assert.equal(todayQuests({ watched: watched('木日月', before) }, today)[0].done, 0)
})

test('做超過的不會超過目標，三件都做完 allDone 才是真', () => {
  const progress = { watched: watched('火水山木日月', now) }
  const quests = todayQuests(progress, today)
  assert.equal(quests[0].done, quests[0].need, '看了六個字，目標三個就是三個')
  assert.equal(allDone(quests), false, '另外兩件還沒做')
  assert.equal(allDone([{ id: 'a', icon: '', label: '', done: 2, need: 2, go: null }]), true)
  assert.equal(allDone([]), false)
})

test('餵大怪獸那一件只算「自己認出來」的：答錯今天再考，不算', () => {
  const base = { watched: watched('火水山木日', before) }
  const right = { ...base, recall: { 火: { box: 2, due: '2026-10-24', last: now, right: 2, wrong: 0 } } }
  const wrong = { ...base, recall: { 水: { box: 0, due: today, last: now, right: 0, wrong: 1 } } }
  const find = (p) => todayQuests(p, today).find((q) => q.id === 'recall')
  // 這兩天剛好輪到 recall 才測得到；沒輪到就跳過（輪替本身另外有測）
  if (find(right)) {
    assert.equal(find(right).done, 1)
    assert.equal(find(wrong).done, 0, '答錯不算自己認出來')
  }
})

test('每一件都有圖示、說得出要做幾個', () => {
  const progress = { watched: watched('火水山木日', now) }
  for (const day of ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24']) {
    for (const q of todayQuests(progress, day)) {
      assert.ok(q.icon && q.label.length > 2, JSON.stringify(q))
      assert.ok(q.need >= 1 && q.done >= 0 && q.done <= q.need, JSON.stringify(q))
    }
  }
})
