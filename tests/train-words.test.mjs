import { test } from 'node:test'
import assert from 'node:assert/strict'

const { realWords, nextChars } = await import('../src/play/words.ts')

const entries = [
  { char: '火', words: [{ text: '火車', emoji: '🚂' }, { text: '火山', emoji: '🌋' }, { text: '煙火', emoji: '🎆' }] },
  { char: '機', words: [{ text: '機器人', emoji: '🤖' }, { text: '飛機', emoji: '✈️' }] },
  { char: '車', words: [{ text: '火車', emoji: '🚂' }] },
]

test('real words are word-list words whose every character is on the train shelf', () => {
  const real = realWords(entries, new Set(['火', '車', '山', '機', '器', '人']))
  assert.deepEqual([...real.keys()].sort(), ['機器人', '火山', '火車'].sort())
  assert.equal(real.get('火車'), '🚂')
})

test('after the first cars, the characters that continue a real word light up', () => {
  const real = realWords(entries, new Set(['火', '車', '山', '機', '器', '人']))
  assert.deepEqual([...nextChars('火', real)].sort(), ['山', '車'].sort())
  assert.deepEqual([...nextChars('機', real)], ['器'])
  assert.deepEqual([...nextChars('機器', real)], ['人'])
  assert.deepEqual([...nextChars('火車', real)], [], 'a finished word has nothing after it')
  assert.deepEqual([...nextChars('', real)], [], 'nothing lights up before the first car')
})
