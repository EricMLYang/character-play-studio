import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
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

const ROOT = path.resolve(import.meta.dirname, '..')
const { STORIES, BLANK, STORY_FIXED, storyById, isChoice, beatOf, filled, askLead, advances, beatsOf, stickersOf, choiceChars, storyChars, storiesNeeding, storyLines, validStory } = await import('../shared/stories.mjs')
const { readStory, validBook, charStars } = await import('../shared/domain.mjs')
const { recordEvent } = await import('../shared/play-events.mjs')
const { FIXED_LINES } = await import('../shared/voice-lines.mjs')
const { shelfOf, nextBook, yourTurn, storyToday, opensWith, litIndex, missing } = await import('../src/play/stories.ts')
const { todayPath } = await import('../src/play/today.ts')
const { POSES } = await import('../src/play/poses.ts')
const { lineOf } = await import('../src/story/scene.ts')
const { sceneProblems, loadStoryScenes } = await import('../scripts/story-check.mjs')

const characters = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8')).characters
const library = characters.filter((c) => !c.hidden)
const known = new Set(library.map((c) => c.char))
const at = '2026-11-12T02:00:00Z'
const today = '2026-11-12'
const watched = (chars, when = at) => Object.fromEntries([...chars].map((c) => [c, { count: 1, last: when }]))

test('故事裡每一個字都在孩子端的字庫裡：他點任何一個字都有字卡、有音檔', () => {
  for (const story of STORIES) {
    const missing = storyChars(story).filter((c) => !known.has(c))
    assert.deepEqual(missing, [], `「${story.title}」用了字庫沒有的字：${missing.join('')}`)
  }
})

test('故事避開多音字（句子是 say 唸的，唸錯會教錯）', () => {
  const risky = new Set([...'長樂重行還得地背空相分種乾'])
  for (const story of STORIES) {
    const hit = storyChars(story).filter((c) => risky.has(c))
    assert.deepEqual(hit, [], `「${story.title}」有多音字：${hit.join('')}`)
  }
})

test('選的頁：一個空格、至少兩個選項、選得到往下走的那一個，填好的整句記得進小書紀錄', () => {
  const ids = new Set()
  for (const story of STORIES) {
    assert.ok(!ids.has(story.id), `故事 id 重複：${story.id}`)
    ids.add(story.id)
    assert.ok(POSES[story.hero]?.includes('happy'), `${story.id} 的主角 ${story.hero} 要有 happy 姿勢（封面用）`)
    assert.ok(!isChoice(story.pages[0]), `${story.id} 第一頁要是讀的頁（選的頁沒有自己的戲）`)
    const pageIds = new Set()
    for (const page of story.pages) {
      assert.ok(!pageIds.has(page.id), `${story.id} 的頁 id 重複：${page.id}`)
      pageIds.add(page.id)
      if (!isChoice(page)) { assert.ok(page.text.length >= 3, `${story.id}/${page.id}`); continue }
      assert.equal([...page.ask].filter((c) => c === BLANK).length, 1, `${story.id}/${page.id} 要剛好一個空格`)
      assert.ok(page.options.length >= 2 && page.options.length <= 3, `${story.id}/${page.id} 兩到三個選項`)
      assert.equal(new Set(page.options.map((o) => o.char)).size, page.options.length, `${story.id}/${page.id} 選項的字不能重複`)
      assert.ok(page.all || page.options.some((o) => o.ok), `${story.id}/${page.id} 至少一個選項要能往下走`)
      for (const o of page.options) {
        assert.equal([...o.char].length, 1)
        assert.ok(o.emoji && o.text, `${story.id}/${page.id}/${o.char}`)
        assert.ok(validBook({ text: filled(page, o), char: o.char, ok: true }), `「${filled(page, o)}」要能記成小書紀錄`)
        assert.equal(advances(page, o), Boolean(page.all || o.ok))
      }
    }
    assert.equal(stickersOf(story).length, story.pages.filter(isChoice).reduce((n, p) => n + p.options.length, 0))
  }
  assert.equal(filled(STORIES[0].pages[1], STORIES[0].pages[1].options[0]), '給他火！')
  assert.equal(askLead(STORIES[0].pages[1]), '給他')
  assert.deepEqual(storiesNeeding('燈').map((s) => s.id), ['dark'])
})

test('每一段戲都有劇本，而且剛好唸那一句（規則在 scripts/story-check.mjs，npm run story:check 會多列出接不起來的地方）', async () => {
  const files = fs.readdirSync(path.join(ROOT, 'src/story/scenes')).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => f.slice(0, -3))
  assert.deepEqual(files.filter((f) => !storyById(f)), [], '有場景檔對不到故事')
  for (const story of STORIES) {
    const scenes = await loadStoryScenes(story.id)
    assert.ok(scenes, `「${story.title}」還沒有場景檔 src/story/scenes/${story.id}.ts`)
    const { errors } = await sceneProblems(story, scenes)
    assert.deepEqual(errors, [])
    for (const beat of beatsOf(story)) assert.equal(lineOf(scenes[beat]).say, scenes[beat].cues.find((c) => 'say' in c).say)
  }
})

test('要唸的句子都會先做成音檔', () => {
  const lines = new Set(storyLines())
  for (const text of Object.values(STORY_FIXED)) assert.ok(lines.has(text))
  for (const story of STORIES) {
    assert.ok(lines.has(story.title))
    for (const page of story.pages) {
      if (!isChoice(page)) { assert.ok(lines.has(page.text)); continue }
      for (const o of page.options) { assert.ok(lines.has(filled(page, o))); assert.ok(lines.has(o.text)) }
    }
  }
  assert.match(fs.readFileSync(path.join(ROOT, 'server/voice.mjs'), 'utf8'), /\.\.\.storyLines\(\)/)
  assert.ok(FIXED_LINES.pathStory)
})

test('故事紀錄：一種結果一張貼紙（只記第一次）、讀完一遍加一', () => {
  let p = readStory({ watched: {} }, 'cold', 'warm:雪', false, at)
  p = readStory(p, 'cold', 'warm:雪', false, '2026-11-12T03:00:00Z')
  p = readStory(p, 'cold', 'warm:火', false, '2026-11-12T03:01:00Z')
  assert.deepEqual(p.stories.cold.seen, { 'warm:雪': at, 'warm:火': '2026-11-12T03:01:00Z' })
  assert.equal(p.stories.cold.count, 0)
  p = readStory(p, 'cold', undefined, true, '2026-11-12T03:05:00Z')
  assert.equal(p.stories.cold.count, 1)
  assert.equal(p.stories.cold.first, at)
  assert.equal(p.stories.cold.last, '2026-11-12T03:05:00Z')
  assert.equal(Object.keys(p.stories.cold.seen).length, 2, '讀完不會弄丟貼紙')
})

test('伺服器只收真的有的故事與結果；故事的 id 不是字，不查字庫', () => {
  const now = Date.parse(at) + 1000
  const send = (event) => recordEvent({ watched: {} }, 'story', { id: 'story-event-1', at, ...event }, () => false, today, now)
  assert.equal(send({ char: 'cold', beat: 'warm:火' }).added, true)
  assert.equal(send({ char: 'cold', done: true }).added, true)
  assert.ok(send({ char: 'nope', done: true }).error)
  assert.ok(send({ char: 'cold', beat: 'warm:冰' }).error, '沒有這個選項')
  assert.ok(send({ char: 'cold', beat: 'snow' }).error, '讀的頁不是貼紙')
  assert.ok(send({ char: 'cold' }).error, '要嘛是一種結果，要嘛是讀完')
  assert.ok(send({ char: 'cold', done: false }).error)
  assert.equal(validStory({ char: 'cold', beat: 'food:石', done: true }), true)
})

test('選對字記成小書紀錄，那個字拿到「在詞裡讀到」那顆星', () => {
  const now = Date.parse(at) + 1000
  const r = recordEvent({ watched: {} }, 'book', { id: 'story-book-1', at, char: '火', text: '給他火！', ok: true }, (c) => known.has(c), today, now)
  assert.equal(r.added, true)
  assert.equal(charStars(r.progress, '火').puzzle, true)
})

test('書架：選項的字都看過才打開，還沒看過的列出來', () => {
  const none = shelfOf(library, { watched: {} })
  assert.equal(none.length, STORIES.length)
  assert.ok(none.every((b) => !b.open && b.need.length > 0))
  assert.equal(nextBook(none), undefined)

  const cold = storyById('cold')
  const some = shelfOf(library, { watched: watched(choiceChars(cold)) })
  const book = some.find((b) => b.story.id === 'cold')
  assert.equal(book.open, true)
  assert.deepEqual(book.need, [])
  assert.equal(missing(book), book.stickers.length)
  assert.equal(nextBook(some), book)

  // 家長把故事裡的字收起來：那本先不出現
  assert.ok(!shelfOf(library.filter((c) => c.char !== '豬'), { watched: {} }).some((b) => b.story.id === 'cold'))
})

test('推薦：沒讀過的先，再來是貼紙沒收齊的，最後是最久沒讀的；讀過一遍換他先讀', () => {
  const all = watched(STORIES.flatMap(choiceChars).join(''))
  const fullSeen = (story) => Object.fromEntries(stickersOf(story).map((s) => [s.beat, at]))
  const log = (story, last, seen = fullSeen(story)) => ({ first: at, last, count: 1, seen })
  const [a, b, ...rest] = STORIES
  const others = Object.fromEntries(rest.map((s) => [s.id, log(s, '2026-11-11T00:00:00Z')]))
  let shelf = shelfOf(library, { watched: all, stories: { [a.id]: log(a, at), ...others } })
  assert.equal(nextBook(shelf).story.id, b.id, '還沒讀過的先')
  shelf = shelfOf(library, { watched: all, stories: { [a.id]: log(a, at, {}), [b.id]: log(b, at), ...others } })
  assert.equal(nextBook(shelf).story.id, a.id, '貼紙沒收齊的')
  shelf = shelfOf(library, { watched: all, stories: { [a.id]: log(a, '2026-11-10T00:00:00Z'), [b.id]: log(b, at), ...others } })
  assert.equal(nextBook(shelf).story.id, a.id, '都收齊了挑最久沒讀的')
  assert.equal(yourTurn({ count: 0 }), false)
  assert.equal(yourTurn({ count: 1 }), true)
})

test('今天的路「讀一讀」：有打得開的故事就去故事屋，讀完一本這一站就走完', () => {
  const seen = watched(STORIES.flatMap(choiceChars).join(''), '2026-11-01T02:00:00Z')
  const read = (progress) => todayPath(library, progress, today).find((s) => s.id === 'read')
  let stop = read({ watched: seen })
  assert.deepEqual(stop.go, { kind: 'game', id: 'story' })
  assert.equal(stop.say, FIXED_LINES.pathStory)
  assert.equal(stop.done, 0)
  stop = read({ watched: seen, stories: { cold: { first: at, last: at, count: 1, seen: {} } } })
  assert.equal(stop.done, stop.need)
  assert.equal(storyToday({ watched: {}, stories: { cold: { first: at, last: at, count: 1, seen: {} } } }, '2026-11-13'), false, '昨天讀的不算今天')
  assert.equal(storyToday({ watched: {}, stories: { cold: { first: at, last: at, count: 0, seen: { 'warm:火': at } } } }, today), false, '沒讀完不算')

  // 一本都打不開（選項的字還沒看過）：退回指讀小書
  const few = watched('日月山水口', '2026-11-01T02:00:00Z')
  assert.deepEqual(read({ watched: few }).go, { kind: 'game', id: 'book' })
})

test('只差一個字就能打開一本故事：那個字是今天優先的新字', () => {
  const dark = storyById('dark')
  const need = choiceChars(dark)
  const seen = watched(need.slice(1).join('') + '日月山水', '2026-11-01T02:00:00Z')
  const shelf = shelfOf(library, { watched: seen })
  assert.deepEqual(opensWith(need[0], shelf).map((b) => b.story.id), ['dark'])
  const stop = todayPath(library, { watched: seen }, today).find((s) => s.id === 'new')
  assert.ok(stop.chars.includes(need[0]), `新朋友應該有「${need[0]}」：${stop.chars.join('')}`)
})

test('字跟著聲音亮：標點不亮、停在前一個字，唸完就不亮', () => {
  const text = '有火，不冷！'
  assert.equal(litIndex(text, -0.1, 1.3), -1)
  assert.equal(litIndex(text, 0, 1.3), 0)
  const order = []
  for (let t = 0; t < 1.3; t += 0.01) { const i = litIndex(text, t, 1.3); if (order.at(-1) !== i) order.push(i) }
  assert.deepEqual(order, [0, 1, 3, 4], '依序亮 有、火、不、冷，逗號與驚嘆號不亮')
  assert.equal(litIndex(text, 1.3, 1.3), -1)
})
