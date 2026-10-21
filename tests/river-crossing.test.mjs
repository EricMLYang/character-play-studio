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

const { setParts } = await import('../src/play/parts.ts')
const { pickCrossing, crosserFor, crossNextWith, forgetCrossRequest, trip, STEPS, WARMUP } = await import('../src/play/crossing.ts')
const { PARTNERS, partnersAt, partnerCount, nextPartner, starsFor, trailStops, STARS_PER } = await import('../src/play/partners.ts')

const entry = (char) => ({ char, zhuyin: '', meaning: '', emoji: '', concept: {}, status: 'live', priority: 0, media: [], feedback: [] })
const library = [...'火水山木日月人口大小中天上下手'].map(entry)
const watchedAll = { watched: Object.fromEntries([...'火水山木日月人口大小中天上下手'].map((c) => [c, { count: 2, last: '2026-10-20T02:00:00Z' }])) }
const today = '2026-10-21'
const seq = (values) => { let i = 0; return () => values[i++ % values.length] }

// 日裡面有口、目裡面有口：長得像的字不可以當干擾
setParts({ 日: [{ char: '口', strokes: [0, 1, 2] }], 目: [{ char: '口', strokes: [0, 1, 2] }] })

test('一趟過河五步，每一步的石頭裡一定有答案，而且不重複', () => {
  const steps = pickCrossing(library, watchedAll, seq([0.1, 0.5, 0.9, 0.3, 0.7]), today)
  assert.equal(steps.length, STEPS)
  for (const [i, step] of steps.entries()) {
    assert.ok(step.stones.includes(step.char), `第 ${i + 1} 步要跳的字不在石頭上`)
    assert.equal(new Set(step.stones).size, step.stones.length, `第 ${i + 1} 步有重複的石頭`)
    assert.equal(step.stones.length, i < WARMUP ? 2 : 3, `第 ${i + 1} 步的石頭數量不對`)
  }
  assert.equal(new Set(steps.map((s) => s.char)).size, steps.length, '一趟裡不會考同一個字兩次')
})

test('干擾的石頭不會挑長得像的字，踩錯是因為沒認出來，不是被騙', () => {
  const alike = [...'日目口'].map(entry)
  const progress = { watched: { 日: { count: 5, last: '2026-10-20T02:00:00Z' } } }
  const steps = pickCrossing(alike, progress, seq([0.2, 0.6]), today)
  for (const step of steps) {
    for (const stone of step.stones) {
      if (stone === step.char) continue
      assert.notEqual(stone, '口', `「${step.char}」不可以拿長得像的「口」當干擾`)
      assert.notEqual(stone, '目', `「${step.char}」不可以拿長得像的「目」當干擾`)
    }
  }
})

test('只考他看過的字', () => {
  const progress = { watched: { 火: { count: 3, last: '2026-10-20T02:00:00Z' }, 水: { count: 1, last: '2026-10-20T02:00:00Z' } } }
  const steps = pickCrossing(library, progress, seq([0.4]), today)
  assert.deepEqual([...new Set(steps.map((s) => s.char))].sort(), ['水', '火'], '沒看過的字不會出現在要跳的字裡')
})

test('該複習的字先上，第一步是最有把握的字', () => {
  const progress = {
    watched: Object.fromEntries([...'火水山木日'].map((c) => [c, { count: 1, last: '2026-10-20T02:00:00Z' }])),
    recall: {
      火: { box: 3, due: '2026-10-30', last: '2026-10-20T02:00:00Z', right: 3, wrong: 0 },
      水: { box: 1, due: '2026-10-19', last: '2026-10-18T02:00:00Z', right: 1, wrong: 1 },
    },
  }
  const steps = pickCrossing([...'火水山木日'].map(entry), progress, seq([0.5]), today)
  assert.equal(steps[0].char, '火', '第一步要放他最有把握的字，一開始就跳對才好玩')
  assert.ok(steps.some((s) => s.char === '水'), '今天到期要複習的字要排進來')
})

test('字不夠的時候步數跟著少，不會硬湊重複的字', () => {
  const progress = { watched: { 火: { count: 1, last: '2026-10-20T02:00:00Z' } } }
  const steps = pickCrossing(library, progress, seq([0.5]), today)
  assert.equal(steps.length, 1)
  assert.equal(steps[0].char, '火')
  assert.ok(steps[0].stones.length >= 2, '干擾的字可以從還沒看過的字裡借')
})

test('主角在他收集到的夥伴裡輪著來', () => {
  const crew = partnersAt(0)
  assert.equal(crosserFor(0, crew).id, crew[0].id)
  assert.equal(crosserFor(crew.length, crew).id, crew[0].id, '輪完一圈從頭再來')
  const more = partnersAt(STARS_PER * 3)
  assert.equal(crosserFor(1, more).id, more[1].id, '開到新夥伴之後，他真的會出現在河邊')
})

test('結算分成自己跳對的、跟掉下去要再看看的', () => {
  const result = trip([{ char: '火', ok: true }, { char: '水', ok: false }, { char: '水', ok: true }, { char: '山', ok: false }])
  assert.deepEqual(result.good, ['火', '水'])
  assert.deepEqual(result.again, ['山'], '後來自己跳對的字不算要再看看')
})

test('夥伴照星星一位一位來，第一位不用星星', () => {
  assert.equal(partnerCount(0), 1, '一開始就有一位（楊捷睿自己）')
  assert.equal(partnersAt(0)[0].id, 'yang')
  assert.equal(partnerCount(STARS_PER - 1), 1)
  assert.equal(partnerCount(STARS_PER), 2)
  assert.equal(partnerCount(STARS_PER * 5), 6)
  assert.equal(partnerCount(STARS_PER * 999), PARTNERS.length, '收齊就不再多了')
  assert.equal(partnersAt(STARS_PER * 3).length, 4)
})

test('指定誰來過河：畫面上說「牠會在河邊等你」，就要真的是牠', () => {
  const crew = partnersAt(STARS_PER * 5)   // 六位
  // 平常照次數輪
  assert.equal(crosserFor(0, crew).id, crew[0].id)
  assert.equal(crosserFor(7, crew).id, crew[7 % crew.length].id)
  // 指定之後，不管輪到誰都是指定的那一位
  crossNextWith(crew[4].id)
  for (const trips of [0, 1, 2, 99]) assert.equal(crosserFor(trips, crew).id, crew[4].id)
  // 用完就清掉（River 掛載之後會清）
  forgetCrossRequest()
  assert.equal(crosserFor(0, crew).id, crew[0].id)
  // 指定了一個還沒收集到的夥伴：當作沒指定，不要讓河邊空掉
  crossNextWith('brick')
  assert.equal(crosserFor(1, crew).id, crew[1].id)
  forgetCrossRequest()
})

test('每一位夥伴的「想要什麼」都先做好音檔了', async () => {
  const { PARTNER_WANTS } = await import('../shared/voice-lines.mjs')
  // 畫面上組的是 `${name}想要${want}！`；對不上的話那句會退回瀏覽器朗讀，每台裝置聲音都不一樣
  assert.deepEqual(PARTNERS.map((p) => `${p.name}想要${p.want}！`), PARTNER_WANTS)
})

test('每一位夥伴都有名字、對岸的東西，而且不重複', () => {
  assert.equal(new Set(PARTNERS.map((p) => p.id)).size, PARTNERS.length)
  assert.equal(new Set(PARTNERS.map((p) => p.goal)).size, PARTNERS.length, '對岸的東西不重複，不然看起來像同一關')
  for (const one of PARTNERS) assert.ok(one.id && one.name && one.goal && one.want, JSON.stringify(one))
})

test('下一位還差幾顆星星；收齊了就沒有下一位', () => {
  assert.deepEqual(nextPartner(0), { partner: PARTNERS[1], need: STARS_PER, at: STARS_PER })
  assert.equal(nextPartner(STARS_PER - 3).need, 3)
  assert.equal(nextPartner(STARS_PER).need, STARS_PER, '剛開完一個，下一個是滿滿一段')
  assert.equal(nextPartner(starsFor(PARTNERS.length - 1)), null)
})

test('「我的東西」那條路：每一站一位夥伴，走到哪就金到哪', () => {
  const stops = trailStops(STARS_PER * 3 + 5)
  assert.equal(stops.length, PARTNERS.length, '整條路一次畫完，還沒到的站也要看得到')
  assert.deepEqual(stops.map((s) => s.at).slice(0, 4), [0, STARS_PER, STARS_PER * 2, STARS_PER * 3])
  assert.equal(stops[0].got, true, '出發點不用星星')
  assert.equal(stops[3].got, true, '剛好走過第三站')
  assert.equal(stops[4].got, false, '第四站還沒到')
  assert.equal(stops.filter((s) => s.got).length, partnerCount(STARS_PER * 3 + 5), '金色的段數就是收集到的夥伴數')
  // 「你在這裡」插在下一站下面，所以下一站一定找得到（收齊之後才沒有）
  assert.equal(stops.find((s) => s.at === nextPartner(STARS_PER * 3 + 5).at).got, false)
  assert.equal(trailStops(0).filter((s) => s.got).length, 1, '一顆星星都沒有也站在起點上')
  assert.equal(trailStops(STARS_PER * 999).every((s) => s.got), true, '收齊就整條路都是金的')
})

test('每一位夥伴都有畫面會用到的那幾張圖', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  // idle：小鎮那一排、我的東西、河邊站著；happy：寶箱跳出來、上岸；surprised／dizzy：踩錯時
  for (const one of PARTNERS) {
    for (const pose of ['idle', 'happy', 'surprised', 'dizzy']) {
      const file = path.join(root, 'public/hero', one.id, `${pose}.png`)
      assert.ok(fs.existsSync(file), `public/hero/${one.id}/${pose}.png 不在（夥伴加了圖沒加）`)
    }
  }
})
