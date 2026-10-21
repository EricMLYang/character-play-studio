import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STAR_DEEDS, MAX_STARS, charStars, starIndex, totalStars } from '../shared/domain.mjs'
import { completeWatch, addTrace, recall, solvePuzzle, discover } from '../shared/domain.mjs'

const at = '2026-10-21T10:00:00Z'
const strokes = [[100, 200, 300, 400]]

test('每顆星都有自己的地方，缺的時候講得出要去哪', () => {
  assert.equal(MAX_STARS, 5)
  assert.deepEqual(STAR_DEEDS.map((d) => d.id), ['watch', 'write', 'recall', 'puzzle', 'brew'])
  for (const deed of STAR_DEEDS) {
    assert.equal(typeof deed.icon, 'string', deed.id)
    assert.equal(typeof deed.label, 'string', deed.id)
    assert.ok(deed.todo('火').includes('火'), `${deed.id} 的提示要講是哪個字`)
    assert.ok(deed.where === null || typeof deed.where === 'string', deed.id)
  }
})

test('五顆星分別來自五個地方，一個字全部做過就滿星', () => {
  let progress = { watched: {} }
  assert.deepEqual(charStars(progress, '火'), { watch: false, write: false, recall: false, puzzle: false, brew: false })

  progress = completeWatch(progress, '火', at)
  assert.equal(charStars(progress, '火').watch, true)
  progress = addTrace(progress, '火', strokes, at)
  assert.equal(charStars(progress, '火').write, true)
  progress = recall(progress, '火', true, at)
  assert.equal(charStars(progress, '火').recall, true)
  progress = solvePuzzle(progress, '火車', '火', true, at)
  assert.equal(charStars(progress, '火').puzzle, true)
  progress = discover(progress, '火', at)
  assert.equal(charStars(progress, '火').brew, true)

  assert.equal(starIndex(progress).get('火'), MAX_STARS)
  assert.equal(totalStars(progress), MAX_STARS)
})

test('餵大怪獸要自己認出來才有星星，靠提示吃到的不算', () => {
  const wrong = recall({ watched: {} }, '水', false, at)
  assert.equal(charStars(wrong, '水').recall, false, '答錯只是降級，不給星星')
  const right = recall(wrong, '水', true, at)
  assert.equal(charStars(right, '水').recall, true, '之後自己找到就拿到')
})

test('拼圖的星星記在他補上的那個字，詞裡其他的字不算', () => {
  const progress = solvePuzzle({ watched: {} }, '生日', '日', true, at)
  assert.equal(charStars(progress, '日').puzzle, true)
  assert.equal(charStars(progress, '生').puzzle, false, '「生」只是寫在那裡，不是他認出來的')
})

test('同一件事做很多次還是一顆星，不同的字分開算', () => {
  let progress = { watched: {} }
  for (let i = 0; i < 4; i++) progress = completeWatch(progress, '火', at)
  progress = solvePuzzle(progress, '火車', '火', true, at)
  progress = solvePuzzle(progress, '火山', '火', true, at)
  assert.equal(starIndex(progress).get('火'), 2, '看四次、拼兩個詞，還是兩顆星')

  progress = completeWatch(progress, '車', at)
  assert.equal(starIndex(progress).get('車'), 1)
  assert.equal(totalStars(progress), 3)
})

test('沒有任何紀錄的字不會出現在星星表裡', () => {
  const progress = completeWatch({ watched: {} }, '火', at)
  const index = starIndex(progress)
  assert.equal(index.has('水'), false)
  assert.equal(index.get('水'), undefined)
  assert.equal(totalStars({ watched: {} }), 0)
  assert.equal(totalStars({}), 0, '空的進度檔也要算得出來')
})
