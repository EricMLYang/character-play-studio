import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import { taiwanDay, completeWatch, addFeedback, publishMedia, publishedMedia, addTrace, discover, validStrokes } from '../shared/domain.mjs'
import { browseCharacters } from '../shared/selection.mjs'

const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-tests-'))
process.env.CPS_STORAGE_ROOT = storage
const { buildPrompt, productionDay, recordSubmission, loadCharacters, saveCharacters, loadProgress, currentPrompt, loadTemplate, contextHash } = await import('../server/core.mjs')
const { generatePrompt, creativeBrief } = await import('../server/prompt-generation.mjs')
const { apiPlugin } = await import('../server/api.mjs')
const { dailyTargets, dailyBatch, startDailyBatch, cancelDailyBatch, whenDailyBatchIdle } = await import('../server/daily-prompts.mjs')
const seed = JSON.parse(fs.readFileSync(new URL('../data/characters.json', import.meta.url), 'utf8'))
const fixture = () => ({ version: 1, characters: structuredClone(seed.characters).map((c) => ({ ...c, status: 'seed', media: [], feedback: [], needsRedo: false, promptVersions: [], activePromptId: undefined })) })
let server, base
before(async () => {
  saveCharacters(fixture())
  server = await createServer({ root: storage, configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [apiPlugin()], server: { host: '127.0.0.1', port: 0, open: false } })
  await server.listen()
  base = `http://127.0.0.1:${server.httpServer.address().port}/api`
})
after(async () => { await server?.close(); fs.rmSync(storage, { recursive: true, force: true }) })
const request = async (route, body, method = 'POST') => {
  const response = await fetch(base + route, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  return { status: response.status, body: await response.json() }
}

test('AI and backup prompts share character-then-word narration, without repeated chanting', () => {
  const entry = fixture().characters.find(c => c.char === '木')
  const template = loadTemplate()
  const audio = template.audio.replaceAll('{char}', entry.char)
  for (const text of [creativeBrief(entry, []), buildPrompt(entry).promptEn]) {
    assert.ok(text.includes(audio))
    assert.match(text, /木、木、木頭/)
    assert.match(text, /人、人、機器人/)
    assert.match(text, /character "木" twice/)
    assert.match(text, /same reading and meaning/)
    assert.match(text, /exact chosen spoken line/)
    assert.match(text, /audio only/)
    assert.doesNotMatch(text, /3-4 times|Repeat the pronunciation|\{char\}/)
  }
})

test('changed narration marks prior AI prompts stale without rewriting saved output', () => {
  const entry = fixture().characters.find(c => c.char === '木')
  const oldTemplate = { ...loadTemplate(), version: 2, audio: 'Repeat the pronunciation 3-4 times.' }
  entry.promptVersions = [{ id: 'old-narration', promptEn: oldTemplate.audio, contextHash: contextHash(entry, oldTemplate) }]
  entry.activePromptId = 'old-narration'
  assert.equal(currentPrompt(entry).stale, true)
  assert.equal(currentPrompt(entry).promptEn, oldTemplate.audio)
})

test('creative examples use the loved media snapshot, never an unrelated newer version', () => {
  const entry = fixture().characters[0]
  const other = { char: '月', feedback: [{ tags: ['love'], mediaFile: 'loved.mp4', at: '2026-09-05' }],
    media: [{ file: 'other.mp4', prompt: { formatted: 'UNRELATED_PROMPT' } }, { file: 'loved.mp4', prompt: { formatted: 'LOVED_PROMPT' } }],
    promptVersions: [{ generatedAt: '2026-09-06', formatted: 'NEWER_PROMPT' }] }
  const brief = creativeBrief(entry, [other])
  assert.match(brief, /LOVED_PROMPT/)
  assert.doesNotMatch(brief, /UNRELATED_PROMPT|NEWER_PROMPT/)
})

test('Taiwan morning and midnight map to the correct local day', () => {
  assert.equal(taiwanDay('2026-09-04T23:30:00.000Z'), '2026-09-05')
  assert.equal(taiwanDay('2026-09-05T15:59:59Z'), '2026-09-05')
  assert.equal(taiwanDay('2026-09-05T16:00:00Z'), '2026-09-06')
  assert.equal(taiwanDay('bad date'), '')
})

test('rewatches increment count once per completion; delayed events never move last backwards', () => {
  let progress = completeWatch({ watched: {} }, '山', '2026-09-05T08:00:00Z')
  progress = completeWatch(progress, '山', '2026-09-04T23:30:00Z')
  assert.equal(progress.watched['山'].count, 2)
  assert.equal(progress.watched['山'].last, '2026-09-05T08:00:00Z')
})

test('negative feedback changes prompts; positive feedback preserves redo and fast uses one coherent timeline', () => {
  const entry = fixture().characters[0]
  const original = buildPrompt(entry)
  for (const tag of ['unclear', 'noisy', 'confusing', 'fast']) addFeedback(entry, [tag])
  addFeedback(entry, ['love'])
  const revised = buildPrompt(entry)
  assert.equal(entry.needsRedo, true)
  assert.notEqual(original.hash, revised.hash)
  assert.deepEqual(revised.appliedFeedback, ['unclear', 'noisy', 'confusing', 'fast'])
  assert.match(revised.formatted, /BEAT 3 \(4-8s\)/)
  assert.doesNotMatch(revised.formatted, /5-8s|glossy chunky/)
  assert.equal(buildPrompt(entry).formatted, revised.formatted)
})

test('daily queue stays fixed, image-only characters remain eligible, and quota resets next Taiwan day', () => {
  const db = fixture()
  db.characters[0].media = [{ kind: 'image', file: 'sun.png', review: 'published' }]
  const first = productionDay(db, '2026-09-05')
  assert.deepEqual(first.queue, ['日', '月', '山'])
  const entry = db.characters[0]
  for (let i = 0; i < 3; i++) recordSubmission(db, { char: entry.char, hash: buildPrompt(entry).hash, id: `attempt-${i}` }, '2026-09-05')
  // Network retry must not consume a fourth credit.
  recordSubmission(db, { char: entry.char, hash: buildPrompt(entry).hash, id: 'attempt-0' }, '2026-09-05')
  assert.equal(first.attempts.length, 3)
  assert.throws(() => recordSubmission(db, { char: entry.char, hash: buildPrompt(entry).hash, id: 'attempt-4' }, '2026-09-05'), /3 支/)
  db.characters[0].media.push({ kind: 'video', file: 'sun.mp4', review: 'published' })
  assert.deepEqual(productionDay(db, '2026-09-05').queue, first.queue)
  assert.equal(productionDay(db, '2026-09-06').attempts.length, 0)
  assert.ok(!productionDay(db, '2026-09-06').queue.includes('日'))
})

test('submission keeps an immutable prompt snapshot and rejects a stale preview', () => {
  const db = fixture(), entry = db.characters[0]
  const original = buildPrompt(entry)
  const attempt = recordSubmission(db, { char: entry.char, hash: original.hash, id: 'snapshot-1' })
  addFeedback(entry, ['fast'])
  entry.concept.object = 'a revised object'
  assert.equal(attempt.prompt.formatted, original.formatted)
  assert.notEqual(attempt.concept.object, entry.concept.object)
  assert.throws(() => recordSubmission(db, { char: entry.char, hash: original.hash, id: 'snapshot-2' }), /更新/)
})

test('feedback on a rejected draft puts the character back into tomorrow’s suggestions', () => {
  const db = fixture(), entry = db.characters[0]
  entry.media.push({ file: 'draft.mp4', kind: 'video', review: 'draft', feedbackCount: 0 })
  assert.ok(!productionDay(db, '2026-09-05').queue.includes(entry.char))
  addFeedback(entry, ['confusing'])
  assert.equal(productionDay(db, '2026-09-06').queue[0], entry.char)
})

test('draft media are invisible; publishing selects one version and old versions cannot clear newer feedback', () => {
  const entry = fixture().characters[0]
  entry.media = [{ kind: 'video', file: 'old.mp4' }, { kind: 'video', file: 'new.mp4', review: 'draft', feedbackCount: 1 }]
  addFeedback(entry, ['unclear'])
  assert.deepEqual(publishedMedia(entry).map((m) => m.file), ['old.mp4'])
  assert.throws(() => publishMedia(entry, 'new.mp4', 'original', 0.7, {}), /確認/)
  const checks = { shape: true, pronunciation: true, volume: true }
  publishMedia(entry, 'new.mp4', 'narration', 0.5, checks)
  assert.deepEqual(publishedMedia(entry).map((m) => m.file), ['new.mp4'])
  assert.equal(entry.needsRedo, false)
  addFeedback(entry, ['fast'])
  publishMedia(entry, 'old.mp4', 'original', 0.7, checks)
  assert.equal(entry.needsRedo, true)
})

test('API workflow: record → import draft → review → feedback → revised prompt; image does not clear redo or spend credit', async () => {
  const library = await request('/library', undefined, 'GET')
  const prompt = await request('/prompt?char=日', undefined, 'GET')
  assert.equal(library.body.production.attempts.length, 0)
  const submission = await request('/submission', { char: '日', id: 'api-attempt-1', hash: prompt.body.hash })
  assert.equal(submission.status, 200)
  const uploaded = await fetch(base + '/import?char=日&ext=mp4&attemptId=api-attempt-1', { method: 'POST', body: 'test video bytes' })
  assert.equal(uploaded.status, 200)
  const draft = await uploaded.json()
  assert.equal(draft.entry.media[0].review, 'draft')
  assert.equal(draft.entry.media[0].prompt.hash, prompt.body.hash)
  assert.equal(publishedMedia(draft.entry).length, 0)
  const checks = { shape: true, pronunciation: true, volume: true }
  assert.equal((await request('/media-review', { char: '日', file: draft.file, action: 'publish', audioMode: 'narration', volume: 0.65, checks })).status, 200)
  await request('/feedback', { char: '日', tags: ['fast'], mediaFile: draft.file })
  await request('/feedback', { char: '日', tags: ['love'], mediaFile: draft.file })
  await fetch(base + '/import?char=日&ext=png', { method: 'POST', body: 'test image bytes' })
  const fresh = await request('/library', undefined, 'GET')
  assert.equal(fresh.body.production.attempts.length, 1)
  assert.equal(fresh.body.pendingAttempts.length, 0)
  assert.equal(fresh.body.characters[0].needsRedo, true)
  assert.deepEqual(fresh.body.queue, library.body.queue)
  const revised = await request('/prompt?char=日', undefined, 'GET')
  assert.notEqual(revised.body.hash, prompt.body.hash)
  assert.equal(loadCharacters().production.days[taiwanDay()].attempts[0].prompt.hash, prompt.body.hash)
  assert.equal((await fetch(base + '/import?char=日&ext=exe', { method: 'POST', body: 'bad' })).status, 400)
})

test('watch retries are idempotent and completions persist', async () => {
  const event = { char: '山', id: 'watch-event-1', at: '2026-09-04T23:30:00Z' }
  const first = await request('/watch', event)
  const retry = await request('/watch', event)
  assert.equal(first.status, 200)
  assert.equal(retry.body.watched['山'].count, 1)
  assert.equal(taiwanDay(retry.body.watched['山'].last), '2026-09-05')
  assert.equal(loadProgress().watched['山'].count, 1)
  assert.equal((await request('/watch', { ...event, id: 'watch-event-2', at: '2026-09-06T01:00:00Z' })).body.watched['山'].count, 2)
})

test('prompt versions live in one file per character, migrate from inline data and never leak to a new card', async () => {
  const dir = path.join(storage, 'data', 'prompts')
  // 後面的測試接著用現在的字庫狀態，做完要原封不動放回去
  const before = loadCharacters()
  const db = fixture()
  // 舊格式：版本還寫在 characters.json 裡
  db.characters[0].promptVersions = [{ id: 'legacy-1', promptEn: 'LEGACY' }]
  fs.writeFileSync(path.join(storage, 'data', 'characters.json'), JSON.stringify(db))
  const loaded = loadCharacters()
  assert.equal(loaded.characters[0].promptVersions[0].promptEn, 'LEGACY')
  saveCharacters(loaded)
  const char = db.characters[0].char
  const raw = JSON.parse(fs.readFileSync(path.join(storage, 'data', 'characters.json'), 'utf8'))
  assert.ok(raw.characters.every((c) => !('promptVersions' in c)), 'library file carries no prompt text')
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, `${char}.json`), 'utf8')), [{ id: 'legacy-1', promptEn: 'LEGACY' }])
  assert.equal(loadCharacters().characters[0].promptVersions[0].id, 'legacy-1')
  // /library 只給下拉選單要的摘要，不帶全文
  const listed = (await request('/library', undefined, 'GET')).body.characters[0].promptVersions
  assert.deepEqual(listed, [{ id: 'legacy-1' }])
  // 字被移走後，同名新字不能撿到舊版本
  saveCharacters({ ...loaded, characters: loaded.characters.slice(1) })
  assert.equal(fs.existsSync(path.join(dir, `${char}.json`)), false)
  saveCharacters(before)
})

test('prompt selection and daily batch routes answer through the route table', async () => {
  assert.equal((await request('/prompt/select', { char: '山', id: 'no-such-version' })).status, 404)
  const today = await request('/prompt/today', undefined, 'GET')
  assert.equal(today.status, 200)
  assert.ok(Array.isArray(today.body.queue))
  assert.equal((await request('/prompt/today/cancel', {})).status, 200)
})

test('scene lives on the card: saved on add and edit, cleared when unset, validated', async () => {
  assert.equal((await request('/character', { char: '霞', scene: 'glow' })).status, 200)
  assert.equal(loadCharacters().characters.find((c) => c.char === '霞').scene, 'glow')
  assert.equal((await request('/character/update', { char: '霞', scene: 'rain' })).status, 200)
  assert.equal(loadCharacters().characters.find((c) => c.char === '霞').scene, 'rain')
  assert.equal((await request('/character/update', { char: '霞', scene: '' })).status, 200)
  assert.equal('scene' in loadCharacters().characters.find((c) => c.char === '霞'), false)
  assert.match((await request('/character/update', { char: '霞', scene: 'volcano' })).body.error, /場景/)
  assert.equal((await request('/character/delete', { char: '霞' })).status, 200)
})

test('tracing moves a character into town with the newest handwriting and grows it', () => {
  const older = [[100, 700, 900, 700]], newer = [[120, 690, 880, 710]]
  let p = addTrace({ watched: {} }, '火', older, '2026-09-20T10:00:00Z')
  p = addTrace(p, '火', newer, '2026-09-21T10:00:00Z')
  // 離線補送的舊事件：次數要算，但不能蓋掉比較新的筆跡
  p = addTrace(p, '火', [[0, 0, 1, 1]], '2026-09-19T10:00:00Z')
  assert.deepEqual(p.town['火'], { traces: 3, first: '2026-09-19T10:00:00Z', last: '2026-09-21T10:00:00Z', strokes: newer })
  assert.equal(validStrokes(newer), true)
  for (const bad of [[], [[1, 2, 3]], [[1.5, 2]], [['1', '2']], [[0, 99999]], 'x']) assert.equal(validStrokes(bad), false)
})

test('the magic pot records the first discovery only', () => {
  let p = discover({ watched: {} }, '日', '2026-09-21T10:00:00Z')
  p = discover(p, '日', '2026-09-22T10:00:00Z')
  assert.equal(p.lab['日'], '2026-09-21T10:00:00Z')
  assert.equal(discover(p, '日', '2026-09-20T10:00:00Z').lab['日'], '2026-09-20T10:00:00Z')
})

test('trace and discover events persist, retry idempotently and reject bad input', async () => {
  const trace = { char: '木', id: 'trace-event-1', at: '2026-09-21T10:00:00Z', strokes: [[100, 500, 900, 500], [512, 850, 512, -50]] }
  assert.equal((await request('/trace', trace)).status, 200)
  const retry = await request('/trace', trace)
  assert.equal(retry.body.town['木'].traces, 1)
  assert.deepEqual(loadProgress().town['木'].strokes, trace.strokes)
  assert.equal((await request('/trace', { ...trace, id: 'trace-event-2', strokes: [[1.5, 2]] })).status, 400)
  assert.equal((await request('/trace', { ...trace, id: 'trace-event-3', char: '不存在' })).status, 400)
  // 同一個事件編號不能拿去記別的字
  assert.equal((await request('/discover', { char: '日', id: 'trace-event-1', at: trace.at })).status, 400)
  const found = await request('/discover', { char: '日', id: 'discover-event-1', at: trace.at })
  assert.equal(found.body.lab['日'], trace.at)
  assert.equal(loadProgress().watched['山'].count, 2, 'watch history is untouched')
})

test('failed generation retains spent credit and releases the pending work for a retry', async () => {
  const prompt = await request('/prompt?char=月', undefined, 'GET')
  await request('/submission', { char: '月', id: 'failed-attempt-1', hash: prompt.body.hash })
  assert.equal((await request('/submission-failed', { id: 'failed-attempt-1' })).status, 200)
  const library = (await request('/library', undefined, 'GET')).body
  assert.ok(!library.pendingAttempts.some((a) => a.id === 'failed-attempt-1'))
  assert.equal(library.production.attempts.length, 2)
  assert.ok(library.production.attempts.find((a) => a.id === 'failed-attempt-1').failedAt)
  const db = loadCharacters()
  assert.ok(productionDay(db, '2099-01-01').queue.includes('月'))
})

const fakeGenerated = (id) => ({ id, char: '山', provider: 'codex', requestedModel: null, actualModel: null,
  generatedAt: new Date().toISOString(), meaning: 'mountain', zhuyin: 'ㄕㄢ', emoji: '⛰️',
  conceptZh: `積木搭山 ${id}`, object: 'wooden blocks', morph: 'three pillars form 山',
  creativeAngle: '用積木建造字形', promptEn: `An 8-second creative clip of 山, version ${id}.` })

test('AI versions survive reload and submission preserves exactly the selected AI output', async () => {
  saveCharacters(fixture())
  const first = await generatePrompt({ char: '山', provider: 'codex', direction: '工程車積木' }, async (input) => {
    assert.match(input.brief, /工程車積木/)
    return fakeGenerated('ai-version-1')
  })
  const second = await generatePrompt({ char: '山', provider: 'codex' }, async (input) => {
    assert.ok(input.brief.includes(first.promptEn))
    return fakeGenerated('ai-version-2')
  })
  const db = loadCharacters(), entry = db.characters.find((c) => c.char === '山')
  assert.equal(entry.promptVersions.length, 2)
  assert.equal(currentPrompt(entry).hash, second.hash)
  const attempt = recordSubmission(db, { char: '山', id: 'selected-ai-1', hash: second.hash })
  assert.equal(attempt.prompt.promptEn, second.promptEn)
  assert.equal(attempt.concept.object, 'wooden blocks')
  addFeedback(entry, ['fast'])
  assert.equal(currentPrompt(entry).stale, true)
  assert.throws(() => recordSubmission(db, { char: '山', id: 'selected-ai-2', hash: second.hash }), /重新生成/)
})

test('AI errors and concurrent feedback edits keep the previous version intact', async () => {
  const before = loadCharacters().characters.find((c) => c.char === '山').activePromptId
  await assert.rejects(generatePrompt({ char: '山', provider: 'codex' }, async () => { throw new Error('login failed') }), /login failed/)
  await assert.rejects(generatePrompt({ char: '山', provider: 'codex' }, async () => {
    const db = loadCharacters(); addFeedback(db.characters.find((c) => c.char === '山'), ['unclear']); saveCharacters(db)
    return fakeGenerated('stale-version')
  }), /生成期間/)
  assert.equal(loadCharacters().characters.find((c) => c.char === '山').activePromptId, before)
})

test('new character needs no hand-written English concept; AI fills missing metadata only', async () => {
  const db = fixture(), entry = db.characters.find((c) => c.char === '山')
  entry.meaning = ''; entry.zhuyin = ''; entry.concept = { object: '', morph: '', hook: '' }
  saveCharacters(db)
  await generatePrompt({ char: '山', provider: 'codex' }, async () => fakeGenerated('new-character-1'))
  const saved = loadCharacters().characters.find((c) => c.char === '山')
  assert.equal(saved.zhuyin, 'ㄕㄢ')
  assert.equal(saved.meaning, 'mountain')
  assert.equal(currentPrompt(saved).stale, false)
  assert.match(creativeBrief(saved, [], '木工風格'), /木工風格/)
})

test('cross-origin websites cannot start a paid CLI generation', async () => {
  const response = await fetch(base + '/prompt/generate', { method: 'POST', headers: { Origin: 'https://unrelated.example' },
    body: JSON.stringify({ char: '日', provider: 'codex' }) })
  assert.equal(response.status, 403)
})

test('a new character is hidden from the child library until the parent opens it, and duplicates explain themselves', async () => {
  const inLibrary = () => browseCharacters(loadCharacters().characters).some((c) => c.char === '雲')
  assert.equal((await request('/character', { char: '雲' })).status, 200)
  const duplicate = await request('/character', { char: '雲' })
  assert.equal(duplicate.status, 409)
  assert.match(duplicate.body.error, /雲/)
  assert.doesNotMatch(duplicate.body.error, /exists/)

  assert.equal(loadCharacters().characters.find((c) => c.char === '雲').hidden, true)
  assert.equal(inLibrary(), false)

  assert.equal((await request('/character/visibility', { char: '雲' })).status, 400)
  assert.equal((await request('/character/visibility', { char: '霧', hidden: false })).status, 404)

  assert.equal((await request('/character/visibility', { char: '雲', hidden: false })).status, 200)
  assert.equal(loadCharacters().characters.find((c) => c.char === '雲').hidden, undefined)
  assert.equal(inLibrary(), true)

  assert.equal((await request('/character/visibility', { char: '雲', hidden: true })).status, 200)
  assert.equal(inLibrary(), false)
})

const dailyBatchResults = () => dailyBatch().job.results
const fakeFor = (char, id) => ({ id, char, provider: 'codex', requestedModel: null, actualModel: null,
  generatedAt: new Date().toISOString(), meaning: 'x', zhuyin: 'ㄨ', emoji: '✨',
  conceptZh: `${char} 的積木概念`, object: 'blocks', morph: `blocks form ${char}`,
  creativeAngle: '積木', promptEn: `An 8-second creative clip of ${char}, ${id}.` })

test('one click fills only the missing prompts of today’s three, and one failure does not stop the rest', async () => {
  saveCharacters(fixture())
  const first = dailyTargets()
  assert.deepEqual(first.queue, first.pending)
  assert.deepEqual(first.pending, ['日', '月', '山'])

  // 先手動產生「日」，批次就不該再花一次生成
  await generatePrompt({ char: '日', provider: 'codex' }, async () => fakeFor('日', 'manual-1'))
  assert.deepEqual(dailyTargets().ready, ['日'])
  assert.deepEqual(dailyTargets().pending, ['月', '山'])

  const asked = []
  startDailyBatch({ provider: 'codex' }, async ({ char }) => {
    asked.push(char)
    if (char === '月') throw new Error('login failed')
    return fakeFor(char, 'batch-1')
  })
  await whenDailyBatchIdle()

  assert.deepEqual(asked, ['月', '山'])
  const state = dailyTargets()
  assert.deepEqual(state.ready, ['日', '山'])
  assert.deepEqual(state.pending, ['月'])

  const done = dailyBatchResults()
  assert.deepEqual(done.map((r) => [r.char, r.ok]), [['月', false], ['山', true]])
  assert.match(done[0].error, /login failed/)
  assert.equal(loadCharacters().characters.find((c) => c.char === '山').status, 'prompted')

  // 沒有缺的字就不該再啟動
  await generatePrompt({ char: '月', provider: 'codex' }, async () => fakeFor('月', 'manual-2'))
  assert.throws(() => startDailyBatch({ provider: 'codex' }, async () => fakeFor('月', 'never')), /都已經有最新/)
})

test('a running daily batch can be stopped, and the prompts already produced are kept', async () => {
  saveCharacters(fixture())
  let started = 0, secondStarted
  const reachedSecond = new Promise((resolve) => { secondStarted = resolve })
  startDailyBatch({ provider: 'codex' }, async ({ char, signal }) => {
    started++
    if (started === 1) return fakeFor(char, 'kept-1')
    secondStarted()
    // 停在第二個字，直到批次被取消
    return new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('已取消生成')), { once: true }))
  })
  await reachedSecond
  cancelDailyBatch()
  await whenDailyBatchIdle()

  assert.equal(started, 2)
  assert.equal(dailyBatch().job.cancelled, true)
  assert.deepEqual(dailyTargets().ready, ['日'])
  assert.deepEqual(dailyTargets().pending, ['月', '山'])
  assert.deepEqual(dailyBatchResults().map((r) => [r.char, r.ok]), [['日', true]])
})

test('metadata can be corrected after creation without replacing media or saved prompts', async () => {
  saveCharacters(fixture())
  const entry = loadCharacters().characters.find((c) => c.char === '山')
  await generatePrompt({ char: '山', provider: 'codex' }, async () => fakeGenerated('before-edit'))
  const before = loadCharacters().characters.find((c) => c.char === '山')
  const result = await request('/character/update', { char: '山', zhuyin: 'ㄕㄢ', emoji: '🏔️', meaning: 'mountain peak', ...entry.concept })
  assert.equal(result.status, 200)
  const saved = loadCharacters().characters.find((c) => c.char === '山')
  assert.equal(saved.emoji, '🏔️')
  assert.equal(currentPrompt(saved).stale, true)
  assert.deepEqual(saved.promptVersions, before.promptVersions)
  assert.deepEqual(saved.media, before.media)
  assert.equal((await request('/character/update', { char: '山', zhuyin: 'not bopomofo' })).status, 400)

  // 語詞：存成「詞＋圖示」、去重，而且一定要含這個字，否則孩子看不出關聯
  const words = () => loadCharacters().characters.find((c) => c.char === '山').words
  assert.equal((await request('/character/update', { char: '山', zhuyin: 'ㄕㄢ', words: '爬山🧗、火山🌋、爬山🧗' })).status, 200)
  assert.deepEqual(words(), [{ text: '爬山', emoji: '🧗' }, { text: '火山', emoji: '🌋' }])
  assert.equal((await request('/character/update', { char: '山', zhuyin: 'ㄕㄢ', words: '爬山、火山🌋' })).status, 200)
  assert.deepEqual(words(), [{ text: '爬山' }, { text: '火山', emoji: '🌋' }])
  assert.match((await request('/character/update', { char: '山', words: '跑步' })).body.error, /沒有「山」/)
  assert.match((await request('/character/update', { char: '山', words: '山' })).body.error, /二到四個國字/)
  assert.match((await request('/character/update', { char: '山', words: '爬山高山頂峰' })).body.error, /二到四個國字/)
  assert.match((await request('/character/update', { char: '山', words: '爬山climb' })).body.error, /只接一個圖示/)
  assert.match((await request('/character/update', { char: '山', words: '爬山、火山、高山、山頂、山路' })).body.error, /最多四個/)
  assert.equal((await request('/character/update', { char: '山', zhuyin: 'ㄕㄢ', words: '' })).status, 200)
  assert.deepEqual(words(), [])
  assert.equal((await request('/character', { char: '雲', emoji: {} })).status, 400)
  assert.equal((await request('/character/update', { char: '不存在' })).status, 400)
})

test('delete and restore preserve media, progress and quota history, and prevent accidental duplicate recreation', async () => {
  const db = fixture()
  const entry = db.characters.find((c) => c.char === '山')
  entry.media = [{ file: 'keep.mp4', kind: 'video', review: 'published' }]
  const day = productionDay(db)
  db.production.days[day.date].queue = ['山']
  db.production.days[day.date].attempts = [{ id: 'keep-attempt', char: '山', at: new Date().toISOString() }]
  saveCharacters(db)
  const progressBefore = loadProgress()
  assert.equal((await request('/character/delete', { char: '山' })).status, 200)
  let library = (await request('/library', undefined, 'GET')).body
  assert.equal(library.characters.some((c) => c.char === '山'), false)
  assert.ok(library.deletedCharacters.some((c) => c.char === '山'))
  assert.equal(library.queue.includes('山'), false)
  assert.equal(library.pendingAttempts.some((a) => a.char === '山'), false)
  assert.equal(library.production.attempts.length, 1)
  assert.deepEqual(loadProgress(), progressBefore)
  assert.equal((await request('/character', { char: '山' })).status, 409)
  assert.equal((await request('/character/update', { char: '山' })).status, 404)
  assert.equal((await request('/character/restore', { char: '山' })).status, 200)
  library = (await request('/library', undefined, 'GET')).body
  const restored = library.characters.find((c) => c.char === '山')
  assert.deepEqual(restored.media, entry.media)
  assert.equal(restored.hidden, true)
  assert.equal(library.deletedCharacters.some((c) => c.char === '山'), false)
  assert.equal(library.pendingAttempts.some((a) => a.char === '山'), true)
})

test('AI metadata suggestions are validated previews and never save over a parent entry', async () => {
  const { suggestCharacterMetadata } = await import('../server/character-metadata.mjs')
  const before = loadCharacters()
  const suggested = { char: '忍', zhuyin: 'ㄖㄣˇ', meaning: 'endure', emoji: '🧘', words: '忍者🥷、忍住🤐', scene: 'zap' }
  assert.deepEqual(await suggestCharacterMetadata({ char: '忍', provider: 'codex' }, async (input) => {
    assert.equal(input.metadataOnly, true)
    assert.match(input.brief, /Taiwanese/)
    return suggested
  }), suggested)
  // 語詞是選填的：AI 沒給也不該讓整次補齊失敗，家長自己打就好
  assert.deepEqual(await suggestCharacterMetadata({ char: '忍', provider: 'codex' },
    async () => ({ ...suggested, words: undefined })), { ...suggested, words: '' })
  // 場景猜錯或給閃亮：留空讓家長選，不讓整次補齊失敗
  for (const scene of ['volcano', undefined, 'sparkle']) {
    assert.equal((await suggestCharacterMetadata({ char: '忍', provider: 'codex' }, async () => ({ ...suggested, scene }))).scene, '')
  }
  await assert.rejects(suggestCharacterMetadata({ char: '忍', provider: 'codex' }, async () => ({ ...suggested, char: '日' })), /不符/)
  await assert.rejects(suggestCharacterMetadata({ char: '忍', provider: 'codex' }, async () => ({ ...suggested, zhuyin: 'ren3' })), /注音/)
  await assert.rejects(suggestCharacterMetadata({ char: '忍', provider: 'codex' }, async () => ({ ...suggested, words: '忍者🥷、跑步🏃' })), /跑步.*沒有/)
  await assert.rejects(suggestCharacterMetadata({ char: '忍', provider: 'codex' }, async () => { throw new Error('AI unavailable') }), /unavailable/)
  const controller = new AbortController()
  await assert.rejects(suggestCharacterMetadata({ char: '忍', provider: 'codex', signal: controller.signal }, async () => {
    controller.abort(); return suggested
  }), /取消/)
  assert.deepEqual(loadCharacters(), before)
  for (const route of ['/character/suggest', '/character/update', '/character/delete', '/character/restore']) {
    const response = await fetch(base + route, { method: 'POST', headers: { Origin: 'https://unrelated.example' }, body: JSON.stringify({ char: '忍' }) })
    assert.equal(response.status, 403)
  }
})

test('deleting inactive videos and images removes files but preserves feedback, sources, quota and other versions', async () => {
  const db = fixture(), entry = db.characters.find((c) => c.char === '山')
  const mediaRoot = path.join(storage, 'media')
  fs.mkdirSync(mediaRoot, { recursive: true })
  entry.media = [
    { file: 'delete-old.mp4', kind: 'video', review: 'paused', prompt: { formatted: 'loved mountain scene' } },
    { file: 'delete-draft.png', kind: 'image', review: 'draft' },
    { file: 'keep-current.mp4', kind: 'video', review: 'published' },
  ]
  entry.feedback = [{ tags: ['love'], mediaFile: 'delete-old.mp4', at: new Date().toISOString() }]
  for (const media of entry.media) fs.writeFileSync(path.join(mediaRoot, media.file), 'test fixture')
  const day = productionDay(db)
  db.production.days[day.date].attempts = [{ id: 'deleted-media-attempt', char: '山', mediaFile: 'delete-old.mp4' }]
  saveCharacters(db)
  const beforeProgress = loadProgress()
  for (const file of ['delete-old.mp4', 'delete-draft.png']) {
    assert.equal((await request('/media-review', { char: '山', file, action: 'delete' })).status, 200)
    assert.equal(fs.existsSync(path.join(mediaRoot, file)), false)
  }
  const saved = loadCharacters(), after = saved.characters.find((c) => c.char === '山')
  assert.deepEqual(after.media.map((m) => m.file), ['keep-current.mp4'])
  assert.equal(after.status, 'live')
  assert.equal(fs.existsSync(path.join(mediaRoot, 'keep-current.mp4')), true)
  assert.equal(after.deletedMedia.length, 2)
  assert.deepEqual(after.feedback, entry.feedback)
  assert.deepEqual(saved.production, db.production)
  assert.deepEqual(loadProgress(), beforeProgress)
  assert.match(creativeBrief(saved.characters.find((c) => c.char === '日'), saved.characters), /loved mountain scene/)
  const library = (await request('/library', undefined, 'GET')).body
  assert.equal(library.pendingAttempts.some((a) => a.id === 'deleted-media-attempt'), false)
})

test('media deletion rejects published, unknown, shared and unsafe paths; missing inactive files can be cleaned up', async () => {
  const db = fixture(), entry = db.characters.find((c) => c.char === '山')
  entry.media = [{ file: 'legacy.mp4', kind: 'video' }, { file: 'missing.png', kind: 'image', review: 'paused' },
    { file: 'shared.png', kind: 'image', review: 'paused' }]
  db.characters.find((c) => c.char === '日').media = [{ file: 'shared.png', kind: 'image', review: 'draft' }]
  saveCharacters(db)
  for (const file of ['legacy.mp4', 'unknown.mp4', '../characters.json', '/tmp/file', 'shared.png']) {
    assert.equal((await request('/media-review', { char: '山', file, action: 'delete' })).status, 400)
    assert.deepEqual(loadCharacters(), JSON.parse(JSON.stringify(db)))
  }
  assert.equal((await request('/media-review', { char: '山', file: 'missing.png', action: 'delete' })).status, 200)
  assert.equal(loadCharacters().characters.find((c) => c.char === '山').media.some((m) => m.file === 'missing.png'), false)
  const response = await fetch(base + '/media-review', { method: 'POST', headers: { Origin: 'https://unrelated.example' },
    body: JSON.stringify({ char: '山', file: 'legacy.mp4', action: 'delete' }) })
  assert.equal(response.status, 403)
})

test('failed metadata persistence restores the staged file and leaves the library unchanged', async () => {
  const { deleteInactiveMedia } = await import('../server/media-deletion.mjs')
  const db = fixture(), entry = db.characters.find((c) => c.char === '山')
  entry.media = [{ file: 'rollback.mp4', kind: 'video', review: 'paused' }]
  const file = path.join(storage, 'media', 'rollback.mp4')
  fs.writeFileSync(file, 'keep these bytes')
  saveCharacters(db)
  assert.throws(() => deleteInactiveMedia({ char: '山', file: 'rollback.mp4' }, () => { throw new Error('disk write failed') }), /disk write failed/)
  assert.equal(fs.readFileSync(file, 'utf8'), 'keep these bytes')
  assert.deepEqual(loadCharacters(), JSON.parse(JSON.stringify(db)))
  assert.equal(fs.readdirSync(path.dirname(file)).some((f) => f.startsWith('.deleting-')), false)
})
