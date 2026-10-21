import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { alikePairs, loadMedians } from '../scripts/alike.mjs'

// 前端模組用不帶副檔名的相對路徑（給 Vite 用），Node 找不到時補上 .ts 再試
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})
const { ALIKE } = await import('../src/play/alike.ts')

test('src/play/alike.ts 沒有過期（字庫加字之後要跑 npm run alike）', () => {
  const pairs = alikePairs(loadMedians())
  const missing = pairs.filter((p) => !ALIKE.has(p))
  const extra = [...ALIKE].filter((p) => !pairs.includes(p))
  assert.deepEqual(missing, [], `這幾對算得出來但表裡沒有，跑一次 npm run alike：${missing.slice(0, 10).join(' ')}`)
  assert.deepEqual(extra, [], `這幾對在表裡但算不出來（字被刪了？），跑一次 npm run alike：${extra.slice(0, 10).join(' ')}`)
})

test('表裡每一對都是兩個字、而且照字碼排好（looksAlike 靠這個查）', () => {
  for (const pair of ALIKE) {
    const chars = [...pair]
    assert.equal(chars.length, 2, pair)
    assert.ok(chars[0] < chars[1], `${pair} 沒有照字碼排序，查不到`)
  }
})
