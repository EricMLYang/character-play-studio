import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerHooks } from 'node:module'
import { STAR_DEEDS, MAX_STARS, charStars, starIndex, totalStars, tracedOnly, residentLevel } from '../shared/domain.mjs'
import { completeWatch, addTrace, recall, solvePuzzle, discover, findFamily } from '../shared/domain.mjs'

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

// 2026-10-25 之後：描完只算一半，要憑記憶寫（blind）才有寫字那顆星
const at = '2026-10-26T10:00:00Z'
const before = '2026-10-21T10:00:00Z'
const strokes = [[100, 200, 300, 400]]

test('每顆星都有自己的地方，缺的時候講得出要去哪', () => {
  assert.equal(MAX_STARS, 5)
  assert.deepEqual(STAR_DEEDS.map((d) => d.id), ['watch', 'write', 'recall', 'puzzle', 'family'])
  for (const deed of STAR_DEEDS) {
    assert.equal(typeof deed.icon, 'string', deed.id)
    assert.equal(typeof deed.label, 'string', deed.id)
    assert.ok(deed.todo('火').includes('火'), `${deed.id} 的提示要講是哪個字`)
    assert.ok(deed.where === null || typeof deed.where === 'string', deed.id)
  }
})

test('五顆星分別來自五個地方，一個字全部做過就滿星', () => {
  let progress = { watched: {} }
  assert.deepEqual(charStars(progress, '火'), { watch: false, write: false, recall: false, puzzle: false, family: false })

  progress = completeWatch(progress, '火', at)
  assert.equal(charStars(progress, '火').watch, true)
  progress = addTrace(progress, '火', strokes, at)
  assert.equal(charStars(progress, '火').write, false, '照著描只算一半')
  assert.equal(tracedOnly(progress, '火'), true)
  assert.equal(starIndex(progress).get('火'), 1, '半顆不算進總數')
  progress = addTrace(progress, '火', strokes, at, true)
  assert.equal(charStars(progress, '火').write, true, '遮起來憑記憶寫出來才拿到')
  assert.equal(tracedOnly(progress, '火'), false)
  progress = recall(progress, '火', true, at)
  assert.equal(charStars(progress, '火').recall, true)
  progress = solvePuzzle(progress, '火車', '火', true, at)
  assert.equal(charStars(progress, '火').puzzle, true)
  progress = findFamily(progress, 'fire', '火', at)
  assert.equal(charStars(progress, '火').family, true)

  assert.equal(starIndex(progress).get('火'), MAX_STARS)
  assert.equal(totalStars(progress), MAX_STARS)
})

test('2026-10-25 之前描完的字照舊有寫字那顆星，他拿到的不會變少', () => {
  const old = addTrace({ watched: {} }, '火', strokes, before)
  assert.equal(charStars(old, '火').write, true)
  assert.equal(tracedOnly(old, '火'), false)
  assert.equal(starIndex(old).get('火'), 1)
})

test('魔法鍋刪掉之前變出來過的字，直接算成「找到牠的家」', () => {
  const p = discover({ watched: {} }, '日', before)
  assert.equal(charStars(p, '日').family, true)
  assert.equal(starIndex(p).get('日'), 1)
  const both = findFamily(p, 'sun', '日', at)
  assert.equal(starIndex(both).get('日'), 1, '魔法鍋跟部首家族都做過還是同一顆')
})

test('小鎮居民靠憑記憶寫長大：搬進來是 1 級，第 5 級戴皇冠', () => {
  let p = addTrace({ watched: {} }, '火', strokes, at)
  assert.equal(residentLevel(p.town['火']), 1)
  for (let i = 0; i < 3; i++) p = addTrace(p, '火', strokes, at)
  assert.equal(residentLevel(p.town['火']), 1, '照著描再多次也不長大')
  for (let i = 0; i < 6; i++) p = addTrace(p, '火', strokes, at, true)
  assert.equal(p.town['火'].blind, 6)
  assert.equal(residentLevel(p.town['火']), 5, '最高 5 級')
  assert.equal(residentLevel(undefined), 1)
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

test('那一家在孩子端湊不到兩個字的，就不算「找到牠的家」那一顆星', () => {
  const lib = [entry('河', [{ text: '河馬', emoji: '🦛' }]), entry('海', []), entry('火', [{ text: '火車', emoji: '🚂' }]), entry('可', [])]
  const known = new Set(lib.map((c) => c.char))
  assert.ok(deedsFor(lib[0], known).some((d) => d.id === 'family'), '河、海 兩個都在：三點水的家開門')
  assert.ok(!deedsFor(lib[2], known).some((d) => d.id === 'family'), '火字旁只有火自己（燈、灰不在這次的字庫），家還沒開')
  assert.ok(!deedsFor(lib[3], known).some((d) => d.id === 'family'), '可 不住任何一家（意思跟口連不上，radicals.mjs 不收）')
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

test('每一顆星說的「去哪裡拿」都真的有那個遊戲', () => {
  // games.tsx 是 JSX，Node 的測試 runner 匯入不了，所以讀原始碼把 id 抓出來比對。
  // 這條擋的是「遊戲改了 id，但星星那排的『去 →』還指著舊的」——按下去會掉到一個空畫面。
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const src = fs.readFileSync(path.join(root, 'src/play/games.tsx'), 'utf8')
  const ids = [...src.matchAll(/^\s*id: '([a-z]+)',/gm)].map((m) => m[1])
  assert.ok(ids.length >= 5, `games.tsx 抓不到遊戲 id：${ids.join(',')}`)
  for (const deed of STAR_DEEDS) {
    if (deed.where) assert.ok(ids.includes(deed.where), `「${deed.label}」要去「${deed.where}」，但 games.tsx 裡沒有這個遊戲`)
  }
})

test('整個字庫的上限表一次算好', () => {
  // 早、晚 住日字旁的家（兩個家人都在就開門；日 本身是這一家的門牌，不算家人）；火 那一家只有自己；口 沒有詞、家也沒開
  const lib = [entry('早', [{ text: '早上', emoji: '🌅' }]), entry('晚', []), entry('口', []), entry('火', [{ text: '火車', emoji: '🚂' }])]
  const caps = starCaps(lib)
  assert.equal(caps.get('早'), 5, '看過、寫、認、讀到、找到家')
  assert.equal(caps.get('晚'), 4, '沒有詞')
  assert.equal(caps.get('火'), 4, '家還沒開')
  assert.equal(caps.get('口'), 3, '家沒開、也沒有詞')
  assert.equal(caps.size, lib.length)
})
