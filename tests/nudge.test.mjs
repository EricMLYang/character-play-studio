import { test } from 'node:test'
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

const { pickNudge } = await import('../src/play/nudge.ts')

const entry = (char) => ({ char, zhuyin: '', meaning: '', emoji: '', concept: {}, status: 'live', priority: 0, media: [], feedback: [] })
const library = [...'火水山木日月人口'].map(entry)
const today = '2026-10-22'
const earlier = '2026-10-20T02:00:00Z'
const todayAt = '2026-10-22T02:00:00Z'
const watched = (chars, at) => Object.fromEntries([...chars].map((c) => [c, { count: 2, last: at }]))
/** 已經玩過每一個地方，這樣測試才測得到後面那幾條規則 */
const played = { lab: { 日: earlier }, words: { 火車: earlier }, puzzles: { 火車: { char: '火', first: earlier, last: earlier, count: 1, right: 1 } } }
const noStars = new Map()
const noCaps = new Map()

test('一個字都沒看過：先去點一張字卡', () => {
  const n = pickNudge(library, { watched: {} }, noStars, noCaps, today)
  assert.equal(n.go, null)
  assert.match(n.text, /字卡/)
})

test('今天還沒看字：先看一個字，不先推遊戲', () => {
  const progress = { watched: watched('火水山木', earlier), ...played }
  const n = pickNudge(library, progress, noStars, noCaps, today)
  assert.equal(n.go, null, '遊戲只考他看過的字，所以看字永遠排前面')
  assert.match(n.text, /今天/)
})

test('沒去過的地方會被推出來，去過就換下一個', () => {
  const base = { watched: watched('火水山木', todayAt) }
  assert.equal(pickNudge(library, base, noStars, noCaps, today).go, 'lab', '魔法鍋是 0 次，先推它')

  const afterLab = { ...base, lab: { 日: earlier } }
  assert.equal(pickNudge(library, afterLab, noStars, noCaps, today).go, 'train')

  const afterTrain = { ...afterLab, words: { 火車: earlier } }
  assert.equal(pickNudge(library, afterTrain, noStars, noCaps, today).go, 'puzzle')
})

test('字太少的時候不推遊戲：去了也玩不起來', () => {
  const progress = { watched: watched('火水', todayAt) }
  assert.equal(pickNudge(library, progress, noStars, noCaps, today).go, null)
})

test('有一堆字到期該複習：帶他去認字的遊戲', () => {
  const recall = Object.fromEntries([...'火水山木'].map((c) => [c, { box: 1, due: '2026-10-21', last: earlier, right: 1, wrong: 0 }]))
  const progress = { watched: watched('火水山木', todayAt), ...played, recall }
  const n = pickNudge(library, progress, noStars, noCaps, today)
  assert.ok(['feed', 'river'].includes(n.go), '餵大怪獸或過河都在考同一件事')
  assert.match(n.text, /4/, '講有幾個字，不講「複習」')
})

test('差一顆星就滿的字：講那個字，按下去直接開它', () => {
  const progress = { watched: watched('火水山木', todayAt), ...played }
  const stars = new Map([['火', 4]])
  const caps = new Map([['火', 5]])
  const n = pickNudge(library, progress, stars, caps, today)
  assert.equal(n.go, 'char:火')
  assert.match(n.text, /火/)

  const full = pickNudge(library, progress, new Map([['火', 5]]), caps, today)
  assert.notEqual(full.go, 'char:火', '已經滿星的字不要再推')
})

test('沒有特別該做的事：講他收集到幾顆星星', () => {
  const progress = { watched: watched('火水山木', todayAt), ...played }
  const n = pickNudge(library, progress, new Map([['火', 2], ['水', 3]]), new Map([['火', 5], ['水', 5]]), today)
  assert.match(n.text, /5 顆星星/)
  assert.ok(n.go)
})

test('每一句都有角色、有按鈕的字', () => {
  const cases = [
    { watched: {} },
    { watched: watched('火水山木', earlier), ...played },
    { watched: watched('火水山木', todayAt) },
    { watched: watched('火水山木', todayAt), ...played },
  ]
  for (const progress of cases) {
    const n = pickNudge(library, progress, noStars, noCaps, today)
    assert.ok(n.hero && n.pose, '要有角色圖')
    assert.ok(n.text.length > 4 && n.cta.length > 2, JSON.stringify(n))
  }
})

test('快開到下一個寶箱：講還差幾顆，這是他最近的一個獎勵', async () => {
  const { STARS_PER } = await import('../src/play/partners.ts')
  const progress = { watched: watched('火水山木', todayAt), ...played }
  // 距離下一個寶箱剩兩顆
  const stars = new Map([['火', STARS_PER - 2]])
  const n = pickNudge(library, progress, stars, new Map([['火', 99]]), today)
  assert.match(n.text, /2 顆星星/)
  assert.ok(n.go)
})
