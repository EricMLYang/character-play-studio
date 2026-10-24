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

const { PARTNERS, STARS_PER, partnerCount, partnersAt, nextPartner, starsFor, trailStops, waiterFor, serveNextWith, forgetServeRequest, serveLine, skyFor } = await import('../src/play/partners.ts')

test('夥伴照星星一位一位來，第一位不用星星', () => {
  assert.equal(partnerCount(0), 1, '一開始就有一位（楊捷睿自己）')
  assert.equal(partnersAt(0)[0].id, 'yang')
  assert.equal(partnerCount(STARS_PER - 1), 1)
  assert.equal(partnerCount(STARS_PER), 2)
  assert.equal(partnerCount(STARS_PER * 999), PARTNERS.length, '收齊就不再多了')
  assert.equal(partnersAt(STARS_PER * 3).length, 4)
})

test('指定誰來端菜：畫面上說「牠會來幫你端菜」，就要真的是牠', () => {
  const crew = partnersAt(STARS_PER * 5)   // 六位
  assert.equal(waiterFor(0, crew).id, crew[0].id)
  assert.equal(waiterFor(7, crew).id, crew[7 % crew.length].id)
  serveNextWith(crew[4].id)
  for (const rounds of [0, 1, 2, 99]) assert.equal(waiterFor(rounds, crew).id, crew[4].id)
  forgetServeRequest()
  assert.equal(waiterFor(0, crew).id, crew[0].id)
  // 指定了一個還沒收集到的夥伴：當作沒指定
  serveNextWith('brick')
  assert.equal(waiterFor(1, crew).id, crew[1].id)
  forgetServeRequest()
})

test('每一位夥伴端菜那句都先做好音檔了，天色照夥伴輪', async () => {
  const { PARTNER_SERVES } = await import('../shared/voice-lines.mjs')
  assert.deepEqual(PARTNERS.map(serveLine), PARTNER_SERVES)
  assert.equal(skyFor(PARTNERS[0]), 'day')
  assert.notEqual(skyFor(PARTNERS[1]), skyFor(PARTNERS[0]))
  assert.equal(skyFor(PARTNERS[4]), skyFor(PARTNERS[0]), '四種輪')
})

test('每一位夥伴都有名字，而且不重複', () => {
  assert.equal(new Set(PARTNERS.map((p) => p.id)).size, PARTNERS.length)
  for (const one of PARTNERS) assert.ok(one.id && one.name, JSON.stringify(one))
})

test('下一位還差幾顆星星；收齊了就沒有下一位', () => {
  assert.deepEqual(nextPartner(0), { partner: PARTNERS[1], need: STARS_PER, at: STARS_PER })
  assert.equal(nextPartner(STARS_PER - 3).need, 3)
  assert.equal(nextPartner(starsFor(PARTNERS.length - 1)), null)
})

test('「我的東西」那條路：每一站一位夥伴，走到哪就金到哪', () => {
  const stops = trailStops(STARS_PER * 3 + 5)
  assert.equal(stops.length, PARTNERS.length)
  assert.equal(stops[0].got, true)
  assert.equal(stops[3].got, true)
  assert.equal(stops[4].got, false)
  assert.equal(stops.filter((s) => s.got).length, partnerCount(STARS_PER * 3 + 5))
})

test('每一位夥伴都有畫面會用到的那幾張圖', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  for (const one of PARTNERS) {
    for (const pose of ['idle', 'happy', 'surprised', 'dizzy']) {
      assert.ok(fs.existsSync(path.join(root, 'public/hero', one.id, `${pose}.png`)), `public/hero/${one.id}/${pose}.png 不在`)
    }
  }
})
