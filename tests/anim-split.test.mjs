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

const { actorsAt, bodyBox, cutY, fxAt, splitAt, strokesAt } = await import('../src/anim/clip.ts')

function clipOf(actors, moves, glyph = []) {
  return {
    char: '測', duration: 10,
    bg: { top: '#fff', bottom: '#fff', floor: '#ccc' },
    actors, moves, glyph,
    builds: [{ at: 0, dur: 0.5, strokes: [0, 1], from: { x: 80, y: 45 }, color: '#f00' }],
    cues: [],
  }
}

test('half：沒寫就沒有，寫了照 Actor，swap 可以換成另一半或整張', () => {
  const clip = clipOf([
    { id: 'a', emoji: 'prop:cake', x: 80, y: 64, size: 30 },
    { id: 'l', emoji: 'prop:cake', x: 80, y: 64, size: 30, half: 'left' },
  ], [
    { at: 1, actor: 'l', do: 'swap', emoji: 'prop:watermelon-half', half: 'whole' },
    { at: 2, actor: 'l', do: 'swap', emoji: 'prop:cake', half: 'right' },
    { at: 3, actor: 'l', do: 'swap', emoji: 'prop:rock' },
  ])
  const get = (t, id) => actorsAt(clip, t).find((a) => a.id === id)
  assert.equal(get(0.5, 'a').half, undefined)
  assert.equal(get(0.5, 'l').half, 'left')
  assert.equal(get(1.5, 'l').half, undefined)
  assert.equal(get(2.5, 'l').half, 'right')
  // swap 沒寫 half：照舊
  assert.equal(get(3.5, 'l').half, 'right')
})

test('half 的擋字範圍只算那半邊（翻面時左右對調）', () => {
  const a = { emoji: 'prop:rock', x: 80, y: 56, size: 50, s: 1 }
  const whole = bodyBox(a, 0.4)
  const left = bodyBox({ ...a, half: 'left' }, 0.4)
  const right = bodyBox({ ...a, half: 'right' }, 0.4)
  assert.equal(left.x0, whole.x0); assert.equal(left.x1, 80)
  assert.equal(right.x0, 80); assert.equal(right.x1, whole.x1)
  assert.equal(bodyBox({ ...a, half: 'left', flip: true }, 0.4).x0, 80)
  assert.deepEqual({ ...left, x1: whole.x1 }, whole)
})

test('half top／bottom：橫著切在 cut 的高度，擋字範圍只算那一截；swap 可以切換', () => {
  const clip = clipOf([
    { id: 'b', emoji: 'hero:bot/idle', x: 80, y: 62, size: 36, half: 'top', cut: 0.77 },
    { id: 'f', emoji: 'hero:bot/idle', x: 80, y: 62, size: 36, half: 'bottom', cut: 0.8 },
  ], [
    { at: 1, actor: 'b', do: 'swap', emoji: 'hero:bot/fall', half: 'whole' },
  ])
  const get = (t, id) => actorsAt(clip, t).find((a) => a.id === id)
  assert.equal(get(0.5, 'b').half, 'top'); assert.equal(get(0.5, 'b').cut, 0.77)
  assert.equal(get(1.5, 'b').half, undefined)
  assert.equal(get(0.5, 'f').half, 'bottom')
  const a = { emoji: 'hero:bot/idle', x: 80, y: 62, size: 36, s: 1 }
  const whole = bodyBox(a, 0.45)
  // 切口：腳底（y + 0.42 size）往上 (0.92 − cut) × size
  const y = 62 + 0.42 * 36 - (0.92 - 0.77) * 36
  assert.ok(Math.abs(cutY({ ...a, cut: 0.77 }) - y) < 1e-9)
  const top = bodyBox({ ...a, half: 'top', cut: 0.77 }, 0.45)
  const bottom = bodyBox({ ...a, half: 'bottom', cut: 0.77 }, 0.45)
  assert.equal(top.y0, whole.y0); assert.ok(Math.abs(top.y1 - y) < 1e-9)
  assert.ok(Math.abs(bottom.y0 - y) < 1e-9); assert.equal(bottom.y1, whole.y1)
  assert.equal(top.x0, whole.x0); assert.equal(top.x1, whole.x1)
})

test('tube：從角色接到定點，一直在、跟著角色動；環節從定點那端數起', () => {
  const clip = {
    ...clipOf([{ id: 'b', emoji: 'hero:bot/idle', x: 80, y: 40, size: 36 }], [
      { at: 1, dur: 1, actor: 'b', do: 'moveTo', to: { x: 80, y: 20 }, ease: 'linear' },
    ]),
    fx: [{ at: 0.5, dur: 2, kind: 'tube', actor: 'b', dy: 10, to: { x: 80, y: 72 }, n: 4 }],
  }
  assert.equal(fxAt(clip, 0.4).length, 0)
  const a = fxAt(clip, 0.6)[0]
  assert.deepEqual(a.tube.from, { x: 80, y: 50 }); assert.deepEqual(a.tube.to, { x: 80, y: 72 })
  assert.equal(a.o, 1)
  assert.deepEqual(a.tube.rings.map((r) => r.y), [68, 64, 60, 56, 52])
  const b = fxAt(clip, 2)[0]
  assert.equal(b.tube.from.y, 30)
  assert.equal(b.tube.rings.length, 10)
  assert.equal(fxAt(clip, 2.6).length, 0)
})

test('glyph split：彈開、停住、合回去；沒寫 split 的劇本筆畫一格都不變', () => {
  const centers = [{ x: 60, y: 40 }, { x: 100, y: 40 }]
  const plain = clipOf([], [])
  const split = clipOf([], [], [{ at: 2, dur: 1, do: 'split', parts: [{ strokes: [0], to: { x: -10, y: 0 }, r: -12 }] }])
  for (const t of [1, 1.99, 3.01, 4]) assert.deepEqual(strokesAt(split, t, centers), strokesAt(plain, t, centers))
  assert.equal(splitAt(plain, 2.5).size, 0)
  const mid = strokesAt(split, 2.5, centers)
  assert.equal(mid[0].dx, -10); assert.equal(mid[0].r, -12)
  // 沒列的筆畫不動
  assert.deepEqual(mid[1], strokesAt(plain, 2.5, centers)[1])
  // 最後 30% 合回去
  assert.ok(Math.abs(strokesAt(split, 2.98, centers)[0].dx) < 2)
})

test('swap 可以帶 cut：同一個道具一口一口被吃短，沒寫 cut 就照舊', () => {
  const clip = clipOf([
    { id: 'v', emoji: 'prop:bokchoy', x: 80, y: 62, size: 36 },
  ], [
    { at: 1, actor: 'v', do: 'swap', half: 'bottom', cut: 0.3 },
    { at: 2, actor: 'v', do: 'swap', cut: 0.6 },
    { at: 3, actor: 'v', do: 'swap', emoji: 'prop:bokchoy' },
    { at: 4, actor: 'v', do: 'swap', half: 'whole' },
  ])
  const get = (t) => actorsAt(clip, t).find((a) => a.id === 'v')
  assert.equal(get(0.5).cut, undefined)
  assert.equal(get(1.5).half, 'bottom'); assert.equal(get(1.5).cut, 0.3)
  assert.equal(get(2.5).cut, 0.6)
  assert.equal(get(3.5).cut, 0.6)
  assert.equal(get(4.5).half, undefined)
})
