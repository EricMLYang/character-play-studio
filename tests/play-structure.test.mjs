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

const { PLAY_EVENTS, acceptEvent, applyEvent, eventKind } = await import('../shared/play-events.mjs')
const { LINES, linesForEntry } = await import('../shared/voice-lines.mjs')
const { migrateProgress, pruneCompleted, KEEP_EVENT_DAYS, PROGRESS_VERSION } = await import('../server/progress.mjs')
const { parseRoute, formatRoute } = await import('../src/play/route.ts')
const { flow, initialFlow } = await import('../src/play/viewerFlow.ts')

const at = '2026-10-01T10:00:00Z'
const known = (c) => '山木日火'.includes(c)

test('every play event kind has an error message and an apply rule', () => {
  for (const [kind, rule] of Object.entries(PLAY_EVENTS)) {
    assert.equal(typeof rule.error, 'string', kind)
    assert.equal(typeof rule.apply, 'function', kind)
  }
  assert.equal(eventKind({ char: '山' }), 'watch', 'events queued before kinds existed are watches')
})

test('the server-side check uses one set of rules for every kind', () => {
  const now = Date.parse(at)
  assert.equal(acceptEvent('watch', { char: '山', id: 'event-0001', at }, known, now), true)
  assert.equal(acceptEvent('watch', { char: '海', id: 'event-0001', at }, known, now), false, 'unknown character')
  assert.equal(acceptEvent('watch', { char: '山', id: 'bad id!', at }, known, now), false, 'bad id')
  assert.equal(acceptEvent('watch', { char: '山', id: 'event-0001', at: '2026-10-01T10:05:00Z' }, known, now), false, 'from the future')
  assert.equal(acceptEvent('watch', { char: '山', id: 'event-0001', at: 'yesterday' }, known, now), false, 'unreadable time')
  assert.equal(acceptEvent('word', { char: '山木', id: 'event-0001', at }, known, now), true)
  assert.equal(acceptEvent('word', { char: '山海', id: 'event-0001', at }, known, now), false, 'every character of a word is checked')
  assert.equal(acceptEvent('trace', { char: '山', id: 'event-0001', at, strokes: [[1.5, 2]] }, known, now), false)
  assert.equal(acceptEvent('dance', { char: '山', id: 'event-0001', at }, known, now), false, 'unknown kind')
})

test('applying an event the app does not know leaves progress untouched', () => {
  const progress = { watched: {} }
  assert.equal(applyEvent(progress, { kind: 'dance', char: '山', id: 'x', at }), progress)
  assert.equal(applyEvent(progress, { char: '山', id: 'x', at }).watched['山'].count, 1)
})

test('old progress files are upgraded: leftovers dropped, event ids get a day so they can expire', () => {
  const old = { watched: { 山: { count: 1, last: at } }, days: { '2026-09-04': ['日'] }, stickers: ['日'], completedEvents: { 'event-1': '山' } }
  const next = migrateProgress(old, '2026-10-17')
  assert.equal(next.version, PROGRESS_VERSION)
  assert.ok(!('days' in next) && !('stickers' in next))
  assert.deepEqual(next.completedEvents, { 'event-1': { char: '山', day: '2026-10-17' } })
  assert.deepEqual(next.watched, old.watched)
  assert.equal(migrateProgress(next), next, 'already upgraded files are left alone')
})

test('event ids older than the retention window are pruned', () => {
  const completed = { recent: { char: '山', day: '2026-10-10' }, edge: { char: '山', day: '2026-08-18' }, stale: { char: '山', day: '2026-08-01' } }
  assert.equal(KEEP_EVENT_DAYS, 60)
  assert.deepEqual(Object.keys(pruneCompleted(completed, '2026-10-17')), ['recent', 'edge'])
})

test('spoken lines come from one place for the town and for the voice files', () => {
  const entry = { char: '火', words: [{ text: '火車' }], concept: { hook: '小火苗跳舞。' } }
  assert.deepEqual(linesForEntry(entry), ['火', LINES.townHello('火'), LINES.feedAsk('火'), LINES.feedNotThis('火'), '火車', LINES.townWord('火', '火車'), LINES.puzzleAsk('火', '火車'), LINES.puzzleAll('火'), '小火苗跳舞。'])
})

test('routes round-trip through the address bar', () => {
  for (const route of [{ screen: 'home' }, { screen: 'lab' }, { screen: 'lab', char: '口' }, { screen: 'home', ride: '山木' }, { screen: 'town', char: '日' }]) {
    assert.deepEqual(parseRoute(formatRoute(route)), route)
  }
  assert.equal(formatRoute({ screen: 'home' }), '#/')
  assert.deepEqual(parseRoute(''), { screen: 'home' }, 'no hash is the home page')
})

test('the viewer flow keeps the writing panel when the demo finishes, and replay starts clean', () => {
  let s = flow(initialFlow, { type: 'phase', phase: 'write' })
  s = flow(s, { type: 'finish' })
  assert.equal(s.phase, 'write', 'finishing the stroke demo must not close the writing panel')
  assert.equal(flow(initialFlow, { type: 'finish' }).phase, 'finished')
  s = flow(s, { type: 'traced', before: 2 })
  assert.equal(s.moved, 2)
  s = flow(s, { type: 'trace' })
  assert.equal(s.trace, true, 'trace with no value toggles')
  const again = flow(s, { type: 'replay' })
  assert.deepEqual(again, { ...initialFlow, round: 1 })
})
