import { test } from 'node:test'
import assert from 'node:assert/strict'
import { browseCharacters, hasPublishedVideo, pickToday } from '../shared/selection.mjs'

const now = new Date('2026-09-06T01:00:00Z')
const progress = () => ({ watched: {}, days: {}, stickers: [] })
const entries = () => [...'日月山水火土木人口手'].map((char, priority) => ({ char, priority, media: [] }))
const video = (review = 'published') => ({ kind: 'video', review })

test('automatic picks prioritize published videos even when watched today', () => {
  const chars = entries(), p = progress()
  chars[8].media = [video()]; chars[9].media = [video()]
  p.watched['口'] = { count: 5, last: now.toISOString() }
  p.watched['手'] = { count: 2, last: now.toISOString() }
  assert.deepEqual(pickToday(chars, p, now).slice(0, 2).map(c => c.char), ['口', '手'])
  assert.equal(pickToday(chars, p, now).length, 6)
})

test('drafts, paused videos and published images never count as published videos', () => {
  const chars = entries()
  chars[0].media = [video('draft')]; chars[1].media = [video('paused')]
  chars[2].media = [{ kind: 'image', review: 'published' }]
  chars[9].media = [video()]
  assert.equal(hasPublishedVideo(chars[0]), false)
  assert.equal(hasPublishedVideo(chars[1]), false)
  assert.equal(hasPublishedVideo(chars[2]), false)
  assert.equal(pickToday(chars, progress(), now)[0].char, '手')
  assert.equal(hasPublishedVideo({ media: [{ kind: 'video' }] }), true)
})

test('newly published videos displace old saved card-only recommendations', () => {
  const chars = entries(), p = progress()
  p.days['2026-09-06'] = [...'日月山水火土']
  chars[9].media = [video()]
  const selected = pickToday(chars, p, now)
  assert.deepEqual(selected.map(c => c.char), [...'手日月山水火'])
  p.watched['日'] = { count: 1, last: now.toISOString() }
  assert.deepEqual(pickToday(chars, p, now), selected)
})

test('free browsing includes every character, keeps video first, and does not mutate the library', () => {
  const chars = entries(), original = [...chars]
  chars[9].media = [video()]
  const sorted = browseCharacters(chars)
  assert.equal(sorted[0].char, '手')
  assert.equal(new Set(sorted.map(c => c.char)).size, chars.length)
  assert.deepEqual(chars, original)
})

test('all-watched and small libraries remain selectable; removed saved characters are ignored', () => {
  const chars = entries().slice(0, 2), p = progress()
  p.days['2026-09-06'] = ['不存在', '日', '日']
  for (const c of chars) p.watched[c.char] = { count: 3, last: now.toISOString() }
  assert.deepEqual(pickToday(chars, p, now).map(c => c.char), ['日', '月'])
  assert.deepEqual(pickToday([], p, now), [])
})
