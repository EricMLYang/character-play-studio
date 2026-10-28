import { test } from 'node:test'
import assert from 'node:assert/strict'

const { STROKE_THEMES, themeFor, nextTheme, along, zigzag, lengthOf, pathOf } = await import('../src/play/strokeThemes.ts')

test('寫字特效有五到十種，每一種都有圖、名字、會冒出來的東西', () => {
  assert.ok(STROKE_THEMES.length >= 5 && STROKE_THEMES.length <= 10, `${STROKE_THEMES.length} 種`)
  assert.equal(new Set(STROKE_THEMES.map((t) => t.id)).size, STROKE_THEMES.length, 'id 不重複')
  assert.equal(new Set(STROKE_THEMES.map((t) => t.icon)).size, STROKE_THEMES.length, '特效鈕上的圖不重複，他才分得出來')
  for (const t of STROKE_THEMES) {
    assert.ok(t.icon && t.name && t.bits.length && t.count > 0, t.id)
  }
  assert.ok(STROKE_THEMES.some((t) => t.id === 'blade'), '他指名要的忍者刀')
})

test('一次寫字換一種，他自己選過就一直用他選的；特效鈕繞一圈回到原本那種', () => {
  const ids = STROKE_THEMES.map((_, i) => themeFor(i).id)
  assert.deepEqual(ids, STROKE_THEMES.map((t) => t.id))
  assert.equal(themeFor(STROKE_THEMES.length).id, STROKE_THEMES[0].id)
  assert.equal(themeFor(3, 'rocket').id, 'rocket')
  let t = STROKE_THEMES[0]
  for (let i = 0; i < STROKE_THEMES.length; i++) t = nextTheme(t.id)
  assert.equal(t.id, STROKE_THEMES[0].id)
})

test('沿著他畫的線平均放點：頭尾都放到、方向跟著線走', () => {
  const line = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]
  assert.equal(lengthOf(line), 200)
  const spots = along(line, 5)
  assert.equal(spots.length, 5)
  assert.deepEqual([spots[0].x, spots[0].y], [0, 0])
  assert.deepEqual([spots[4].x, spots[4].y], [100, 100])
  assert.deepEqual([spots[2].x, spots[2].y], [100, 0], '正中間在轉角')
  assert.equal(Math.round(spots[1].angle), 0, '第一段往右')
  assert.equal(Math.round(spots[3].angle), 90, '第二段往下')
  // 點一下（只有一個點、或長度是 0）也不能壞
  assert.equal(along([{ x: 5, y: 5 }], 3).length, 3)
  assert.equal(along([{ x: 5, y: 5 }, { x: 5, y: 5 }], 3).every((p) => p.x === 5 && p.y === 5), true)
  assert.deepEqual(along([], 3), [])
})

test('閃電是之字形：頭尾不動，中間左右甩', () => {
  const bolt = zigzag([{ x: 0, y: 0 }, { x: 140, y: 0 }], 10, 7)
  assert.equal(bolt.length, 8)
  assert.deepEqual(bolt[0], { x: 0, y: 0 })
  assert.deepEqual(bolt[7], { x: 140, y: 0 })
  assert.ok(bolt.slice(1, -1).every((p) => Math.abs(Math.abs(p.y) - 10) < 1e-9), '每一段都甩出去')
  assert.ok(bolt[1].y * bolt[2].y < 0, '左右交錯')
  assert.equal(pathOf([{ x: 1, y: 2 }, { x: 3.14159, y: 4 }]), 'M1 2 L3.1 4')
})
