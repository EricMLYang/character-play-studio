import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import { taiwanDay, completeWatch, addFeedback, publishMedia, publishedMedia } from '../shared/domain.mjs'

const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-tests-'))
process.env.CPS_STORAGE_ROOT = storage
const { buildPrompt, productionDay, recordSubmission, loadCharacters, saveCharacters, loadProgress, currentPrompt, loadTemplate, contextHash } = await import('../server/core.mjs')
const { generatePrompt, creativeBrief } = await import('../server/prompt-generation.mjs')
const { apiPlugin } = await import('../server/api.mjs')
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
