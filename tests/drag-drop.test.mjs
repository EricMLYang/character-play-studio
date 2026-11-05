import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const { DRAG_START, isDragStart, insideTarget, tiltFor } = await import('../src/play/dragDrop.ts')

test('手抖不算拖：移動不到 10px 是點一下', () => {
  assert.equal(isDragStart(3, 4), false)
  assert.equal(isDragStart(DRAG_START, 0), false)
  assert.equal(isDragStart(8, 8), true)
  assert.equal(isDragStart(-20, 0), true)
})

test('放的時候差一點點也收：目標四邊各放寬 36px', () => {
  const box = { left: 100, top: 100, right: 200, bottom: 200 }
  assert.equal(insideTarget(150, 150, box), true)
  assert.equal(insideTarget(70, 150, box), true)
  assert.equal(insideTarget(60, 150, box), false)
  assert.equal(insideTarget(150, 240, box), false)
  assert.equal(insideTarget(150, 150, null), false)
  assert.equal(insideTarget(90, 150, box, 0), false)
})

test('拿著走的時候往移動方向斜，最多 12 度', () => {
  assert.equal(tiltFor(0), 0)
  assert.equal(tiltFor(10), 6)
  assert.equal(tiltFor(100), 12)
  assert.equal(tiltFor(-100), -12)
})
