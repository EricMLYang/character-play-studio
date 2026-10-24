import { test, beforeEach } from 'node:test'
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

// iPad 單機版的裝置：localStorage 與打包進去的 library.json 由每個測試決定
let store = new Map()
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
}
let snapshot
globalThis.fetch = async (url) => {
  assert.equal(url, '/library.json', '單機版只讀打包進去的字庫，不連任何伺服器')
  return { ok: true, json: async () => structuredClone(snapshot) }
}

const { recordEvent, KEEP_EVENT_DAYS } = await import('../shared/play-events.mjs')
const { checkExport, mergeExport } = await import('../shared/progress-export.mjs')
const { buildSnapshot, externalUrls } = await import('../server/app-bundle.mjs')
const standalone = await import('../src/lib/standalone.ts')
const { ApiError } = await import('../src/lib/apiError.ts')

const ROOT = path.resolve(import.meta.dirname, '..')
const at = '2026-10-24T02:00:00Z'
const known = (c) => '山木日火'.includes(c)
const entry = (char, extra = {}) => ({ char, zhuyin: '', meaning: '', priority: 1, media: [], ...extra })

beforeEach(() => {
  store = new Map()
  snapshot = { characters: [entry('山'), entry('木')], parts: {}, progress: { version: 2, watched: { 山: { count: 3, last: at } } }, builtAt: at }
})

test('recordEvent: the same rule the Mac server uses — counts once, refuses reused ids and unknown chars', () => {
  const first = recordEvent({ watched: {} }, 'watch', { char: '山', id: 'evt-00000001', at }, known, '2026-10-24')
  assert.equal(first.added, true)
  assert.equal(first.progress.watched.山.count, 1)
  assert.deepEqual(first.progress.completedEvents['evt-00000001'], { char: '山', day: '2026-10-24' })
  const again = recordEvent(first.progress, 'watch', { char: '山', id: 'evt-00000001', at }, known, '2026-10-24')
  assert.equal(again.added, false)
  assert.equal(again.progress, first.progress, '重送的同一筆原樣回傳')
  assert.equal(recordEvent(first.progress, 'watch', { char: '木', id: 'evt-00000001', at }, known).error, '紀錄編號已使用')
  assert.ok(recordEvent({ watched: {} }, 'watch', { char: '水', id: 'evt-00000002', at }, known).error, '不在字庫的字不收')
  assert.equal(KEEP_EVENT_DAYS, 60)
})

test('first launch seeds progress from the bundled snapshot; later versions never overwrite what the device has', async () => {
  const lib = await standalone.localLibrary()
  assert.equal(lib.progress.watched.山.count, 3)
  assert.deepEqual(lib.cliProviders, [], '單機版沒有 Studio 的資料')
  await standalone.localRecord('watch', { char: '木', id: 'evt-00000010', at })
  // 下一版打包時帶了另一份紀錄：裝置上的照舊
  snapshot.progress = { version: 2, watched: {} }
  const later = await standalone.localLibrary()
  assert.equal(later.progress.watched.山.count, 3)
  assert.equal(later.progress.watched.木.count, 1)
})

test('localRecord keeps an event log with increasing seq; duplicates are not logged; bad events throw 422', async () => {
  await standalone.localLibrary()
  await standalone.localRecord('watch', { char: '山', id: 'evt-00000020', at })
  await standalone.localRecord('recall', { char: '木', id: 'evt-00000021', at, ok: true })
  await standalone.localRecord('watch', { char: '山', id: 'evt-00000020', at })
  const data = await standalone.exportProgress()
  assert.deepEqual(data.events.map((e) => [e.seq, e.kind, e.id]), [[1, 'watch', 'evt-00000020'], [2, 'recall', 'evt-00000021']])
  assert.equal(data.progress.watched.山.count, 4)
  await assert.rejects(standalone.localRecord('watch', { char: '水', id: 'evt-00000022', at }),
    (error) => error instanceof ApiError && error.status === 422, '422 讓佇列丟掉這筆，不會卡住後面的')
  assert.equal(checkExport(data), '')
})

test('the Mac merges only events it has not seen from that device, so importing twice counts once', async () => {
  snapshot.characters.push(entry('日'))
  await standalone.localLibrary()
  await standalone.localRecord('watch', { char: '山', id: 'evt-00000030', at })
  await standalone.localRecord('watch', { char: '日', id: 'evt-00000031', at })
  const data = await standalone.exportProgress()
  const mac = { watched: {} }
  const macKnows = (c) => c === '山'
  const first = mergeExport(mac, data, 0, macKnows, '2026-10-24')
  assert.deepEqual([first.added, first.skipped, first.lastSeq], [1, 1, 2], '日 不在 Mac 的字庫：略過，但 seq 照樣往前')
  const second = mergeExport(first.progress, data, first.lastSeq, macKnows, '2026-10-24')
  assert.equal(second.added, 0)
  assert.equal(second.progress.watched.山.count, 1)
})

test('restoring an export replaces the device record and continues the same device id and seq', async () => {
  await standalone.localLibrary()
  await standalone.localRecord('watch', { char: '山', id: 'evt-00000040', at })
  const backup = await standalone.exportProgress()
  // 換了簽名帳號：全新的 App，裝置編號不同
  store = new Map()
  await standalone.localLibrary()
  const info = await standalone.describeImport(backup)
  assert.equal(info.sameDevice, false)
  await standalone.restoreProgress(backup)
  await standalone.localRecord('watch', { char: '木', id: 'evt-00000041', at })
  const after = await standalone.exportProgress()
  assert.equal(after.deviceId, backup.deviceId)
  assert.deepEqual(after.events.map((e) => e.seq), [1, 2])
  assert.equal((await standalone.describeImport({ type: 'something-else' })).error, '這不是字字樂園匯出的紀錄檔')
})

test('the app snapshot only carries what the child can see', () => {
  const { snapshot: snap, mediaFiles } = buildSnapshot({
    characters: [
      entry('山', { promptVersions: [{ id: 'p' }], feedback: [{ tags: ['love'] }], needsRedo: true, concept: { hook: '山好高' },
        media: [{ file: 'a.mp4', kind: 'video', review: 'published' }, { file: 'b.mp4', kind: 'video', review: 'draft' }, { file: 'c.png', kind: 'image' }] }),
      entry('木', { hidden: true, media: [{ file: 'd.mp4', kind: 'video', review: 'published' }] }),
    ],
    parts: {}, progress: { watched: {} },
  })
  assert.deepEqual(snap.characters.map((c) => c.char), ['山'])
  assert.deepEqual(mediaFiles, ['a.mp4', 'c.png'], '舊的沒有 review 欄位的素材當作已上架')
  assert.equal(snap.characters[0].promptVersions, undefined)
  assert.equal(snap.characters[0].feedback, undefined)
  assert.equal(snap.characters[0].concept.hook, '山好高', '孩子端會唸 concept.hook')
})

test('external URL check lets known library strings through and catches real ones', () => {
  assert.deepEqual(externalUrls('a="http://www.w3.org/2000/svg";b="https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/"'), [])
  assert.deepEqual(externalUrls('fetch("https://example.com/track?x=1")'), ['https://example.com/track?x=1'])
})

// 之後還會加很多功能：孩子端一律透過 getLibrary／recordPlay 跟「伺服器」講話，單機版才接得住
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)])
const childFiles = [...walk(path.join(ROOT, 'src/play')), ...walk(path.join(ROOT, 'src/anim')), ...walk(path.join(ROOT, 'src/lib'))]
  .filter((f) => /\.tsx?$/.test(f) && !f.endsWith('AnimLab.tsx') && !f.endsWith(path.join('lib', 'api.ts')))

test('child-side code never calls the Mac API directly', () => {
  for (const file of childFiles) {
    const code = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(code, /['"`]\/api\//, `${path.relative(ROOT, file)} 直接呼叫 /api/：孩子端要走 lib/api.ts 的 getLibrary／recordPlay，iPad 單機版才有對應`)
  }
})

test('child-side code only uses the two standalone-backed API calls', () => {
  const allowed = new Set(['getLibrary', 'recordPlay', 'ApiError', 'type', 'AssetReport'])
  for (const file of childFiles) {
    const code = fs.readFileSync(file, 'utf8')
    for (const [, names] of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"][./]*lib\/api['"]/g)) {
      for (const name of names.split(',').map((n) => n.trim().split(/\s+/).pop()).filter(Boolean)) {
        assert.ok(allowed.has(name), `${path.relative(ROOT, file)} 用了 ${name}：單機版沒有這個（要的話先在 lib/standalone.ts 補上）`)
      }
    }
  }
})
