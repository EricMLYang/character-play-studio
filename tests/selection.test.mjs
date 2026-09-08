import { test } from 'node:test'
import assert from 'node:assert/strict'
import { browseCharacters, hasPublishedVideo } from '../shared/selection.mjs'

const entries = () => [...'日月山水火土木人口手'].map((char, priority) => ({ char, priority, media: [] }))
const video = (review = 'published') => ({ kind: 'video', review })

test('drafts, paused videos and published images never count as published videos', () => {
  const chars = entries()
  chars[0].media = [video('draft')]; chars[1].media = [video('paused')]
  chars[2].media = [{ kind: 'image', review: 'published' }]
  assert.equal(hasPublishedVideo(chars[0]), false)
  assert.equal(hasPublishedVideo(chars[1]), false)
  assert.equal(hasPublishedVideo(chars[2]), false)
  assert.equal(hasPublishedVideo({ media: [{ kind: 'video' }] }), true)
})

test('browsing includes every character, keeps video first, and does not mutate the library', () => {
  const chars = entries(), original = [...chars]
  chars[9].media = [video()]
  const sorted = browseCharacters(chars)
  assert.equal(sorted[0].char, '手')
  assert.equal(new Set(sorted.map(c => c.char)).size, chars.length)
  assert.deepEqual(chars, original)
})
