import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { STAR_DEEDS, MAX_STARS, charStars, starIndex, totalStars } from '../shared/domain.mjs'
import { completeWatch, addTrace, recall, solvePuzzle, discover } from '../shared/domain.mjs'

// 前端模組用不帶副檔名的相對路徑（給 Vite 用），Node 找不到時補上 .ts 再試
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})
const { setParts } = await import('../src/play/parts.ts')
const { deedsFor, maxStars, starCaps } = await import('../src/play/stars.ts')

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

// ---------- 哪幾顆星「做得到」（src/play/stars.ts） ----------

const entry = (char, words) => ({ char, zhuyin: '', meaning: '', emoji: '', words, concept: {}, status: 'live', priority: 0, media: [], feedback: [] })
// 日 裡面有 口（口 在字庫裡）；跑 裡面有 足（足 不在這次的字庫裡）
setParts({ 日: [{ char: '口', strokes: [0, 1, 2] }], 跑: [{ char: '足', strokes: [0, 1, 2, 3, 4, 5, 6] }] })

test('魔法鍋變不出來的字，就不算它那一顆星', () => {
  const lib = [entry('日', [{ text: '生日', emoji: '🎂' }]), entry('口', []), entry('火', [{ text: '火車', emoji: '🚂' }])]
  const known = new Set(lib.map((c) => c.char))
  assert.ok(deedsFor(lib[0], known).some((d) => d.id === 'brew'), '日 裡面有字庫裡的「口」，變得出來')
  assert.ok(!deedsFor(lib[2], known).some((d) => d.id === 'brew'), '火 拆不出字庫裡的字，永遠變不出來')
  // 足 不在字庫裡：跑 也變不出來
  assert.ok(!deedsFor(entry('跑', []), known).some((d) => d.id === 'brew'), '部件本身不在字庫裡就不算')
})

test('沒有畫得出來的詞，就不算拼圖那一顆星', () => {
  const known = new Set(['火', '日'])
  assert.ok(deedsFor(entry('日', [{ text: '生日', emoji: '🎂' }]), known).some((d) => d.id === 'puzzle'))
  assert.ok(!deedsFor(entry('日', []), known).some((d) => d.id === 'puzzle'), '沒有語詞')
  assert.ok(!deedsFor(entry('日', [{ text: '日' }]), known).some((d) => d.id === 'puzzle'), '語詞沒有圖示')
  assert.ok(!deedsFor(entry('日', [{ text: '你的', emoji: '👉' }]), known).some((d) => d.id === 'puzzle'), 'SKIP_WORDS 裡的詞不出題')
})

test('看過、自己寫、自己認出來這三顆每個字都拿得到', () => {
  const plain = entry('火', [])
  const ids = deedsFor(plain, new Set(['火'])).map((d) => d.id)
  assert.deepEqual(ids, ['watch', 'write', 'recall'])
  assert.equal(maxStars(plain, new Set(['火'])), 3)
})

test('整個字庫的上限表一次算好', () => {
  const lib = [entry('日', [{ text: '生日', emoji: '🎂' }]), entry('口', []), entry('火', [{ text: '火車', emoji: '🚂' }])]
  const caps = starCaps(lib)
  assert.equal(caps.get('日'), 5, '看過、寫、認、拼、變')
  assert.equal(caps.get('火'), 4, '變不出來')
  assert.equal(caps.get('口'), 3, '變不出來、也沒有詞')
  assert.equal(caps.size, lib.length)
})
