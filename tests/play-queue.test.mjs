import { test, beforeEach } from 'node:test'
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

// 孩子端的瀏覽器：localStorage 可以被換成會丟例外的版本，fetch 由每個測試決定伺服器怎麼回
let store = new Map()
let storageBroken = false
globalThis.localStorage = {
  getItem: (key) => { if (storageBroken) throw new Error('blocked'); return store.get(key) ?? null },
  setItem: (key, value) => { if (storageBroken) throw new Error('blocked'); store.set(key, value) },
}
let server
const sent = []
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body)
  sent.push({ route: url, ...body })
  const [status, reply] = await server(url, body)
  return { ok: status < 400, status, json: async () => reply }
}
const accept = async () => [200, { watched: {} }]
const offline = async () => { throw new TypeError('Failed to fetch') }

const { queueEvent, pendingEvents, flushEvents } = await import('../src/lib/playQueue.ts')
const watch = (char, id) => ({ char, id, at: '2026-09-26T01:00:00Z' })
const warn = console.warn

beforeEach(() => {
  store = new Map()
  storageBroken = false
  sent.length = 0
  server = accept
  console.warn = warn
})

test('queued events are sent in order and removed once the server has them', async () => {
  queueEvent(watch('山', 'event-1'))
  queueEvent({ kind: 'trace', char: '木', id: 'event-2', at: '2026-09-26T01:01:00Z', strokes: [[0, 0, 10, 10]] })
  queueEvent(watch('山', 'event-1'))
  assert.equal(pendingEvents().length, 2, 'the same event is queued once')
  await flushEvents()
  assert.deepEqual(sent.map((s) => [s.route, s.id]), [['/api/watch', 'event-1'], ['/api/trace', 'event-2']])
  assert.equal(sent[1].kind, undefined, 'kind picks the route and is not sent as data')
  assert.deepEqual(pendingEvents(), [])
})

test('offline: nothing is lost, and the next flush sends everything', async () => {
  queueEvent(watch('山', 'event-1'))
  queueEvent(watch('水', 'event-2'))
  server = offline
  await assert.rejects(flushEvents())
  assert.equal(pendingEvents().length, 2)
  server = accept
  await flushEvents()
  assert.deepEqual(pendingEvents(), [])
})

test('an event the server will never accept is dropped instead of blocking every later record', async () => {
  console.warn = () => {}
  queueEvent(watch('羊', 'deleted-1'))   // 孩子離線時看了羊，家長同步前把羊刪了
  queueEvent(watch('山', 'event-2'))
  server = async (_, body) => (body.char === '羊' ? [422, { error: '觀看紀錄不正確' }] : accept())
  await flushEvents()
  assert.deepEqual(sent.map((s) => s.id), ['deleted-1', 'event-2'])
  assert.deepEqual(pendingEvents(), [])
})

test('other server errors keep the event for a retry', async () => {
  queueEvent(watch('山', 'event-1'))
  server = async () => [400, { error: '寫檔失敗' }]
  await assert.rejects(flushEvents())
  server = async () => [500, { error: 'boom' }]
  await assert.rejects(flushEvents())
  assert.equal(pendingEvents().length, 1)
})

test('blocked browser storage keeps the queue in memory and still delivers it', async () => {
  storageBroken = true
  queueEvent(watch('山', 'event-1'))
  assert.equal(pendingEvents().length, 1)
  await flushEvents()
  assert.equal(sent.length, 1)
  assert.deepEqual(pendingEvents(), [])
})
