import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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
const { FIXED_LINES } = await import('../shared/voice-lines.mjs')
const { setParts } = await import('../src/play/parts.ts')
setParts({})

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
  assert.deepEqual(pickNudge(library, base, noStars, noCaps, today).go, { kind: 'game', id: 'lab' }, '魔法鍋是 0 次，先推它')

  const afterLab = { ...base, lab: { 日: earlier } }
  assert.deepEqual(pickNudge(library, afterLab, noStars, noCaps, today).go, { kind: 'game', id: 'train' })

  const afterTrain = { ...afterLab, words: { 火車: earlier } }
  assert.deepEqual(pickNudge(library, afterTrain, noStars, noCaps, today).go, { kind: 'game', id: 'puzzle' })
})

test('字太少的時候不推遊戲：去了也玩不起來', () => {
  const progress = { watched: watched('火水', todayAt) }
  assert.equal(pickNudge(library, progress, noStars, noCaps, today).go, null)
})

test('有一堆字到期該複習：帶他去認字的遊戲', () => {
  const recall = Object.fromEntries([...'火水山木'].map((c) => [c, { box: 1, due: '2026-10-21', last: earlier, right: 1, wrong: 0 }]))
  const progress = { watched: watched('火水山木', todayAt), ...played, recall }
  const n = pickNudge(library, progress, noStars, noCaps, today)
  assert.equal(n.go.kind, 'game')
  assert.ok(['feed', 'river'].includes(n.go.id), '餵大怪獸或過河都在考同一件事')
  assert.match(n.text, /4/, '講有幾個字，不講「複習」')
})

test('差一顆星就滿的字：缺的那顆在哪個遊戲，就直接帶他去那裡考那個字', () => {
  // 這個字庫的字沒有語詞、也沒有拆字表，所以「看過、自己寫、自己認出來」三顆做得到
  const progress = { watched: watched('火水山木', todayAt), ...played, town: { 火: { traces: 1, first: earlier, last: earlier, strokes: [] } } }
  const stars = new Map([['火', 2]])
  const caps = new Map([['火', 3]])
  const n = pickNudge(library, progress, stars, caps, today)
  // 看過 ✓、自己寫 ✓，缺的是「自己認出來」→ 餵大怪獸，而且第一道菜就是「火」
  assert.deepEqual(n.go, { kind: 'game', id: 'feed', want: '火' })
  assert.match(n.text, /火/)
  assert.deepEqual(n.say, [FIXED_LINES.nudgeNearly, '火', FIXED_LINES.nudgeDoRecall])

  // 缺的那顆沒有專屬的地方（自己寫是在字卡上）：還是開字卡
  const notWritten = { watched: watched('火水山木', todayAt), ...played, recall: { 火: { box: 1, due: '2026-10-30', last: earlier, right: 1, wrong: 0 } } }
  const w = pickNudge(library, notWritten, stars, caps, today)
  assert.deepEqual(w.go, { kind: 'char', char: '火' })
  assert.deepEqual(w.say, [FIXED_LINES.nudgeNearly, '火', FIXED_LINES.nudgeDoWrite])

  const full = pickNudge(library, progress, new Map([['火', 3]]), caps, today)
  assert.notDeepEqual(full.go, { kind: 'game', id: 'feed', want: '火' }, '已經滿星的字不要再推')
})

test('沒有特別該做的事：講他收集到幾顆星星', () => {
  const progress = { watched: watched('火水山木', todayAt), ...played }
  const n = pickNudge(library, progress, new Map([['火', 2], ['水', 3]]), new Map([['火', 5], ['水', 5]]), today)
  assert.match(n.text, /5 顆星星/)
  assert.ok(n.go)
})

test('每一句都唸得出來：拆成做好的固定句子，加上那個字本身', () => {
  const fixed = new Set(Object.values(FIXED_LINES))
  const chars = new Set(library.map((c) => c.char))
  const cases = [
    { watched: {} },
    { watched: watched('火水山木', earlier), ...played },
    { watched: watched('火水山木', todayAt) },
    { watched: watched('火水山木', todayAt), ...played },
    { watched: watched('火水山木', todayAt), ...played, town: { 火: { traces: 1, first: earlier, last: earlier, strokes: [] } } },
    { watched: watched('火水山木', todayAt), ...played,
      recall: Object.fromEntries([...'火水山木'].map((c) => [c, { box: 1, due: '2026-10-21', last: earlier, right: 1, wrong: 0 }])) },
  ]
  for (const progress of cases) {
    for (const stars of [noStars, new Map([['火', 2]]), new Map([['火', 19]])]) {
      const n = pickNudge(library, progress, stars, new Map([['火', 3]]), today)
      assert.ok(n.say.length > 0, JSON.stringify(n))
      for (const line of n.say) {
        assert.ok(fixed.has(line) || chars.has(line),
          `「${line}」既不是固定句子也不是字，做不出音檔會退回瀏覽器朗讀：${JSON.stringify(n)}`)
      }
    }
  }
})

test('角色要帶他去的地方真的存在，角色圖也要有', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const ids = [...fs.readFileSync(path.join(root, 'src/play/games.tsx'), 'utf8').matchAll(/^\s*id: '([a-z]+)',/gm)].map((m) => m[1])
  assert.ok(ids.length >= 7, ids.join(','))
  const cases = [
    { watched: {} },
    { watched: watched('火水山木', earlier), ...played },
    { watched: watched('火水山木', todayAt) },
    { watched: watched('火水山木', todayAt), lab: { 日: earlier } },
    { watched: watched('火水山木', todayAt), ...played },
    { watched: watched('火水山木', todayAt), ...played, town: { 火: { traces: 1, first: earlier, last: earlier, strokes: [] } } },
    { watched: watched('火水山木', todayAt), ...played,
      recall: Object.fromEntries([...'火水山木'].map((c) => [c, { box: 1, due: '2026-10-21', last: earlier, right: 1, wrong: 0 }])) },
  ]
  for (const progress of cases) {
    for (const stars of [noStars, new Map([['火', 2]]), new Map([['火', 19]])]) {
      const n = pickNudge(library, progress, stars, new Map([['火', 3]]), today)
      if (n.go?.kind === 'game') assert.ok(ids.includes(n.go.id), `要帶他去「${n.go.id}」，但 games.tsx 裡沒有這個遊戲`)
      if (n.go?.kind === 'char') assert.ok(library.some((c) => c.char === n.go.char), `要開「${n.go.char}」，但字庫裡沒有`)
      assert.ok(fs.existsSync(path.join(root, 'public/hero', n.hero, `${n.pose}.png`)), `public/hero/${n.hero}/${n.pose}.png 不在`)
    }
  }
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
