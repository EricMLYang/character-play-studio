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

const { recall, RECALL_DAYS } = await import('../shared/domain.mjs')
const { acceptEvent, applyEvent } = await import('../shared/play-events.mjs')
const { setParts } = await import('../src/play/parts.ts')
const { pickDishes, pickDecoy, looksAlike, knownCount, requeue, recap, fillBelly, BURST } = await import('../src/play/dishes.ts')

// 2026-10-17 10:00 台灣時間
const at = '2026-10-17T02:00:00Z'
const seq = (values) => { let i = 0; return () => values[i++ % values.length] }

test('a right answer waits longer before coming back; a wrong one comes back today', () => {
  let p = recall({ watched: {} }, '火', true, at)
  assert.deepEqual(p.recall['火'], { box: 1, due: '2026-10-18', last: at, right: 1, wrong: 0 })
  p = recall(p, '火', true, '2026-10-18T02:00:00Z')
  assert.equal(p.recall['火'].box, 2)
  assert.equal(p.recall['火'].due, '2026-10-20')
  p = recall(p, '火', false, '2026-10-20T02:00:00Z')
  assert.equal(p.recall['火'].box, 1, 'a miss drops one level, not back to zero')
  assert.equal(p.recall['火'].due, '2026-10-20', 'and asks again today')
  assert.equal(recall({ watched: {} }, '水', false, at).recall['水'].box, 0, 'never below zero')
  let top = { watched: {} }
  for (let i = 0; i < 10; i++) top = recall(top, '山', true, `2026-10-${String(10 + i).padStart(2, '0')}T02:00:00Z`)
  assert.equal(top.recall['山'].box, RECALL_DAYS.length - 1, 'the level stops at the top')
})

test('an older answer arriving late is counted but does not change the schedule', () => {
  const p = recall({ watched: {} }, '火', true, at)
  const late = recall(p, '火', false, '2026-10-16T02:00:00Z')
  assert.equal(late.recall['火'].box, 1)
  assert.equal(late.recall['火'].due, '2026-10-18')
  assert.equal(late.recall['火'].wrong, 1)
})

test('recall events go through the shared event table', () => {
  const known = (c) => c === '火'
  assert.equal(acceptEvent('recall', { char: '火', id: 'recall-0001', at, ok: true }, known, Date.parse(at)), true)
  assert.equal(acceptEvent('recall', { char: '火', id: 'recall-0001', at, ok: 'yes' }, known, Date.parse(at)), false)
  assert.equal(applyEvent({ watched: {} }, { kind: 'recall', char: '火', id: 'recall-0001', at, ok: true }).recall['火'].box, 1)
})

test('a round starts with what he knows best and mixes in at most two due reviews up front', () => {
  const progress = {
    watched: { 山: { count: 9 }, 水: { count: 1 }, 火: { count: 5 }, 木: { count: 2 }, 日: { count: 3 }, 月: { count: 1 }, 人: { count: 4 } },
    recall: {
      水: { box: 0, due: '2026-10-17', right: 0, wrong: 1 },
      月: { box: 1, due: '2026-10-16', right: 1, wrong: 0 },
      人: { box: 2, due: '2026-10-15', right: 2, wrong: 0 },
      木: { box: 3, due: '2026-10-30', right: 3, wrong: 0 },
    },
  }
  const pool = Object.keys(progress.watched)
  const dishes = pickDishes(pool, progress, '2026-10-17', seq([0.1, 0.7, 0.3, 0.9]))
  assert.equal(dishes.length, 5)
  assert.equal(new Set(dishes).size, 5, 'no repeats in one round')
  assert.equal(dishes[0], '山', 'warm up with the most-watched character')
  for (const c of ['水', '月', '山', '火', '日']) assert.ok(dishes.includes(c), c)
  assert.ok(!dishes.includes('木'), 'not due and the round is already full')
  assert.deepEqual(pickDishes(['山'], progress, '2026-10-17'), ['山'])
  assert.deepEqual(pickDishes([], progress, '2026-10-17'), [])

  // 字卡上點「自己認出來 → 去」：他要的是那個字的星星，第一道菜就出那個字
  const wanted = pickDishes(pool, progress, '2026-10-17', seq([0.1, 0.7, 0.3, 0.9]), 5, '木')
  assert.equal(wanted[0], '木', 'the character he came for goes first')
  assert.equal(wanted.length, 5)
  assert.equal(new Set(wanted).size, 5, 'still no repeats')
  // 本來就排得到的字指名也不會變成兩次
  const twice = pickDishes(pool, progress, '2026-10-17', seq([0.1, 0.7, 0.3, 0.9]), 5, '山')
  assert.equal(twice[0], '山')
  assert.equal(new Set(twice).size, twice.length)
  // 沒看過的字大怪獸不吃：照原本的順序，不要硬塞
  assert.deepEqual(pickDishes(pool, progress, '2026-10-17', seq([0.1, 0.7, 0.3, 0.9]), 5, '龍'),
    pickDishes(pool, progress, '2026-10-17', seq([0.1, 0.7, 0.3, 0.9]), 5))
})

test('the other card never looks like the one he is looking for', () => {
  setParts({ 日: [{ char: '口', strokes: [0, 1, 3] }], 目: [{ char: '口', strokes: [0, 1, 4] }], 器: [{ char: '口', strokes: [0, 1, 2] }, { char: '犬', strokes: [6, 7, 8, 9] }] })
  assert.equal(looksAlike('日', '口'), true, 'one hides in the other')
  assert.equal(looksAlike('日', '目'), true, 'they share a part')
  assert.equal(looksAlike('日', '火'), false)
  for (let i = 0; i < 20; i++) {
    const decoy = pickDecoy('日', ['口', '目', '器', '火', '水'], [], Math.random)
    assert.ok(['火', '水'].includes(decoy), decoy)
  }
  assert.equal(pickDecoy('日', ['口'], ['口', '山'], () => 0), '山', 'falls back to any character when every known one looks alike')
  setParts({})
})

test('he "knows" a character once it has climbed at least one level', () => {
  assert.equal(knownCount({ watched: {}, recall: { 火: { box: 1 }, 水: { box: 0 }, 山: { box: 3 } } }), 2)
  assert.equal(knownCount({ watched: {} }), 0)
})

test('a missed character comes back two dishes later, at most once more per round', () => {
  const q = ['山', '水', '火', '木', '日']
  assert.deepEqual(requeue(q, 0, '山'), ['山', '水', '火', '山', '木', '日'], 'two dishes in between')
  assert.deepEqual(requeue(q, 3, '木'), ['山', '水', '火', '木', '日', '木'], 'near the end it goes last')
  assert.equal(requeue(q, 4, '日'), q, 'right after the answer is just copying, so the last dish waits for the next round')
  const twice = requeue(q, 0, '山')
  assert.equal(requeue(twice, 3, '山'), twice, 'missing it again waits for the next round')
})

test('the recap only reads out what he found by himself', () => {
  const served = [{ char: '山', ok: true }, { char: '水', ok: false }, { char: '火', ok: false }, { char: '水', ok: true }, { char: '火', ok: false }]
  assert.deepEqual(recap(served), { good: ['山', '水'], again: ['火'] })
  assert.deepEqual(recap([]), { good: [], again: [] })
})

test('the belly fills only with characters he found himself, and bursts when full', () => {
  let belly = 0, booms = 0
  for (const ok of [true, true, false, true, true]) {
    const next = fillBelly(belly, ok)
    if (next.boom) booms++
    belly = next.belly
  }
  // 對、對、（提示）、對 → 第三個自己找到的字撐爆；後面再吃一個
  assert.equal(booms, 1)
  assert.equal(belly, 1)
  // 靠提示吃到的不變大，也不縮回去
  assert.deepEqual(fillBelly(2, false), { belly: 2, boom: false })
  assert.deepEqual(fillBelly(BURST - 1, true), { belly: 0, boom: true })
})

test('every finale shows up once before any repeats, and never twice in a row', async () => {
  const { pickFinale, FINALE_IDS, FINALES } = await import('../src/play/finales.ts')
  const { FIXED_LINES } = await import('../shared/voice-lines.mjs')
  let bag = [], last = null
  const seen = []
  for (let i = 0; i < FINALE_IDS.length * 5; i++) {
    const r = pickFinale(bag, last, Math.random)
    assert.notEqual(r.id, last)
    seen.push(r.id); bag = r.bag; last = r.id
  }
  for (let round = 0; round < 5; round++) {
    assert.deepEqual([...new Set(seen.slice(round * 4, round * 4 + 4))].sort(), [...FINALE_IDS].sort())
  }
  // 台詞都要預先做音檔
  const fixed = new Set(Object.values(FIXED_LINES))
  for (const id of FINALE_IDS) for (const line of [FINALES[id].swell, FINALES[id].climax, FINALES[id].back]) assert.ok(fixed.has(line), line)
})

test('長得像的字也包含共用偏旁的（蜂／蝶、河／湯）：拆字表看不到，靠筆順比對那張表', async () => {
  const { ALIKE } = await import('../src/play/alike.ts')
  // 這張表是 npm run alike 從筆順資料算出來的，這裡確認它真的被 looksAlike 用到
  assert.ok(ALIKE.size > 50, '表裡應該有一批字')
  assert.equal(looksAlike('蜂', '蝶'), true, '左邊都是虫，但「虫」不在字庫，拆字表看不到')
  assert.equal(looksAlike('蝶', '蜂'), true, '順序反過來一樣')
  assert.equal(looksAlike('河', '湯'), true)
  assert.equal(looksAlike('火', '水'), false, '長得不像的字不受影響')

  // 挑干擾的字時真的會避開
  const decoy = pickDecoy('蜂', ['蝶', '火'], ['蝶', '火'], () => 0)
  assert.equal(decoy, '火')
})

test('認字的程度跟著他走：常找錯就只放兩張，認得順就早一點放三張', async () => {
  const { recallLevel } = await import('../src/play/dishes.ts')
  const { warmupFor, DISHES } = await import('../src/play/dishes.ts')
  const mk = (right, wrong) => ({ watched: {}, recall: { 火: { box: 1, due: '2026-10-22', last: at, right, wrong } } })
  assert.equal(recallLevel({ watched: {} }), 'normal', '沒紀錄先當 normal')
  assert.equal(recallLevel(mk(3, 2)), 'normal', '考不到八次先當 normal，不讓前幾次的運氣決定難度')
  assert.equal(recallLevel(mk(2, 8)), 'easy')
  assert.equal(recallLevel(mk(9, 1)), 'hard')
  assert.equal(recallLevel(mk(6, 6)), 'normal')

  assert.equal(warmupFor('easy'), DISHES, '整輪都只放兩張')
  assert.equal(warmupFor('normal'), 2)
  assert.equal(warmupFor('hard'), 1, '第二道就三張')
})

test('盤子上幾張卡跟著他走，而且一定有答案、不重複；第三道是神秘料理', async () => {
  const { plateFor, mysteryIndex, MYSTERY_AT } = await import('../src/play/dishes.ts')
  setParts({})
  const known = [...'火水山木日月人口']
  for (let i = 0; i < 5; i++) {
    const easy = plateFor('火', i, known, known, 'easy', seq([0.3, 0.6, 0.9]))
    assert.equal(easy.length, 2, '常找錯：整輪兩張')
    assert.ok(easy.includes('火'))
    const hard = plateFor('火', i, known, known, 'hard', seq([0.3, 0.6, 0.9]))
    assert.equal(hard.length, i < 1 ? 2 : 3, '認得順：第二道起三張')
    assert.equal(new Set(hard).size, hard.length, '不重複')
  }
  assert.equal(plateFor('火', 4, ['火', '水'], ['火', '水'], 'hard').length, 2, '挑不到第二張就少放一張')
  assert.equal(mysteryIndex(5), MYSTERY_AT)
  assert.equal(mysteryIndex(2), -1, '不到三道就沒有神秘料理')
})
