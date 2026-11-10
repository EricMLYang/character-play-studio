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

const E = await import('../src/anim/clip.ts')
const { actorsAt, baseActorsAt, cameraAt, castScale, castFactor, lifeOf, fxAt, viewAt } = E

/** 最小的一支劇本：國字在 5 秒才開始拼，前面讓角色演 */
function clipOf(extra = {}) {
  return {
    char: '測', duration: 10,
    bg: { top: '#fff', bottom: '#fff', floor: '#ccc' },
    actors: [{ id: 'pig', emoji: 'hero:pig/idle', x: 20, y: 71, size: 14 }],
    moves: [],
    builds: [{ at: 5, dur: 1, strokes: [0], from: { x: 80, y: 45 }, color: '#f00' }],
    cues: [],
    ...extra,
  }
}
const one = (clip, t, id = 'pig') => actorsAt(clip, t).find((a) => a.id === id)
const base = (clip, t, id = 'pig') => baseActorsAt(clip, t).find((a) => a.id === id)
const feet = (a) => a.y + 0.42 * a.size

test('畫面只由 t 決定：同一個 t 算兩次一模一樣', () => {
  const clip = clipOf({ moves: [{ at: 1, dur: 1, actor: 'pig', do: 'moveTo', to: { x: 60, y: 71 } }, { at: 2.5, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' }] })
  for (const t of [0, 0.7, 1.33, 2.51, 4.2, 7.7]) {
    assert.deepEqual(actorsAt(clip, t), actorsAt(clip, t))
    assert.deepEqual(cameraAt(clip, t), cameraAt(clip, t))
    assert.deepEqual(fxAt(clip, t), fxAt(clip, t))
  }
})

test('角色放大：小的放大三成、大的不動，站著的腳底不離地', () => {
  assert.equal(castScale(14), 1.3)
  assert.equal(castScale(40), 1)
  assert.ok(castScale(26) > 1 && castScale(26) < 1.3)
  const clip = clipOf()
  const a = base(clip, 0)
  assert.equal(castFactor(clip), 1)
  assert.ok(Math.abs(a.size - 14 * 1.3) < 1e-9)
  assert.ok(Math.abs(feet(a) - (71 + 0.42 * 14)) < 0.05, '腳底高度不變')
})

test('角色放大後會擋到國字，就退回原本的大小', () => {
  // 國字完成後站在國字邊緣：原本剛好沒擋到，放大就會擋到
  const clip = clipOf({ actors: [{ id: 'pig', emoji: 'hero:pig/idle', x: 48.9, y: 71, size: 14 }] })
  assert.equal(castFactor(clip), 0)
  assert.equal(base(clip, 7).size, 14)
})

test('走路：在地上走有上下顛＋左右擺，走到終點剛好停在原本的位置', () => {
  const clip = clipOf({ moves: [{ at: 1, dur: 1.2, actor: 'pig', do: 'moveTo', to: { x: 70, y: 71 }, ease: 'linear' }] })
  let bob = 0, sway = 0
  for (let t = 1.02; t < 2.2; t += 0.02) {
    bob = Math.max(bob, base(clip, t).y - one(clip, t).y)
    sway = Math.max(sway, Math.abs(one(clip, t).r))
  }
  assert.ok(bob > 0.5, `要看得出顛（${bob}）`)
  assert.ok(sway > 2, `要看得出擺（${sway}）`)
  const end = one(clip, 2.2), b = base(clip, 2.2)
  assert.ok(Math.abs(end.x - b.x) < 1e-9 && Math.abs(end.y - b.y) < 1e-9, '停下來在劇本寫的位置')
})

test('車子不踩步伐；坐在車上的人也不踩', () => {
  const car = [{ at: 1, dur: 1.2, actor: 'car', do: 'moveTo', to: { x: 120, y: 70 }, ease: 'linear' }]
  const clip = clipOf({
    actors: [{ id: 'boy', emoji: 'hero:yang/idle', x: 20, y: 66, size: 13 }, { id: 'car', emoji: '🚗', x: 20, y: 70, size: 19 }],
    moves: [...car, ...car.map((m) => ({ ...m, actor: 'boy', to: { x: 120, y: 66 } }))],
  })
  for (const id of ['car', 'boy']) {
    for (let t = 1.05; t < 2.2; t += 0.05) assert.ok(Math.abs(one(clip, t, id).y - base(clip, t, id).y) < 1e-9, `${id} 在 ${t} 秒不應該顛`)
  }
})

test('已經在跳的不再疊步伐', () => {
  const clip = clipOf({ moves: [{ at: 1, dur: 1, actor: 'pig', do: 'moveTo', to: { x: 70, y: 71 }, arc: 6 }] })
  assert.equal(lifeOf(clip).get('pig').steps.length, 0)
})

test('換姿勢：新姿勢一出來先擠一下，幾格後回原狀', () => {
  const clip = clipOf({ moves: [{ at: 2, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' }] })
  assert.ok(one(clip, 2.02).sy < 0.92)
  assert.equal(one(clip, 2.4).sy, 1)
  // 劇本同一刻自己寫了 squash 就不重複
  const own = clipOf({ moves: [{ at: 2, actor: 'pig', do: 'swap', emoji: 'hero:pig/happy' }, { at: 2, actor: 'pig', do: 'squash', amount: 0.3 }] })
  assert.ok(!lifeOf(own).get('pig').beats.some((b) => b.kind === 'pop'))
})

test('從空中落地自動壓扁，劇本已經寫了壓扁就不重複', () => {
  const jump = { at: 1, dur: 0.6, actor: 'pig', do: 'moveTo', to: { x: 50, y: 71 }, arc: 12 }
  const clip = clipOf({ moves: [jump] })
  const land = lifeOf(clip).get('pig').beats.find((b) => b.kind === 'land')
  assert.ok(land && Math.abs(land.at - 1.6) < 1e-9)
  assert.ok(one(clip, 1.7).sy < 0.95)
  const own = clipOf({ moves: [jump, { at: 1.6, actor: 'pig', do: 'squash', amount: 0.3 }] })
  assert.ok(!lifeOf(own).get('pig').beats.some((b) => b.kind === 'land'))
})

test('急停：直線衝刺停下來，上半身往前甩再晃回來', () => {
  const clip = clipOf({ moves: [{ at: 1, dur: 0.5, actor: 'pig', do: 'moveTo', to: { x: 70, y: 71 }, ease: 'linear' }] })
  assert.ok(one(clip, 1.65).lean > 3, '往右跑，停下來頭往右甩')
  assert.ok(Math.abs(one(clip, 2.4).lean) < 0.1)
})

test('站著等的小動作：兩個角色的節奏錯開', () => {
  const clip = clipOf({ actors: [{ id: 'pig', emoji: 'hero:pig/idle', x: 20, y: 71, size: 14 }, { id: 'cat', emoji: '🐱', x: 140, y: 71, size: 14 }] })
  const at = (id) => lifeOf(clip).get(id).beats.filter((b) => ['shift', 'bob', 'tilt'].includes(b.kind)).map((b) => b.at)
  assert.ok(at('pig').length >= 3 && at('cat').length >= 3)
  assert.notDeepEqual(at('pig').slice(0, 3), at('cat').slice(0, 3))
  // 道具不會自己動
  const prop = clipOf({ actors: [{ id: 'box', emoji: '📦', x: 20, y: 71, size: 14 }] })
  assert.equal(lifeOf(prop).get('box').beats.length, 0)
})

test('唸字那一拍，最近在演的角色點一下頭', () => {
  const clip = clipOf({ moves: [{ at: 1, actor: 'pig', do: 'tilt' }], cues: [{ at: 1.5, say: '測' }] })
  assert.ok(lifeOf(clip).get('pig').beats.some((b) => b.kind === 'nod' && b.at === 1.5))
  assert.ok(one(clip, 1.67).y < base(clip, 1.67).y)
})

test('自動取景：國字拼之前推近正在演的角色，開始拼之前回到全景', () => {
  const clip = clipOf({ moves: [{ at: 1, dur: 2, actor: 'pig', do: 'moveTo', to: { x: 40, y: 71 } }] })
  assert.ok(cameraAt(clip, 2).z > 1.3, '推近')
  assert.ok(cameraAt(clip, 5).z < 1.04, '拼字時回到全景')
  // 角色還在畫面裡
  const v = viewAt(clip, 2), a = one(clip, 2)
  assert.ok(a.x > v.x0 && a.x < v.x1 && feet(a) <= v.y1 + 0.01)
})

test('自動取景：劇本自己運鏡的時段照劇本', () => {
  const clip = clipOf({
    moves: [{ at: 0.5, dur: 3, actor: 'pig', do: 'moveTo', to: { x: 40, y: 71 } }],
    camera: [{ at: 2, dur: 0.5, do: 'zoom', amount: 1.3, to: { x: 80, y: 60 } }, { at: 3.5, dur: 0.3, do: 'zoom', amount: 1 }],
  })
  const c = cameraAt(clip, 3)
  assert.ok(Math.abs(c.z - 1.3 * (1 + 0.035 * 0.18)) < 0.02, `劇本的 1.3 倍（${c.z}）`)
  // 交接不跳：劇本開始的前一刻和那一刻差不多
  assert.ok(Math.abs(cameraAt(clip, 1.99).z - cameraAt(clip, 2.01).z) < 0.05)
})

test('國字拼好以後，鏡頭推近時國字整個還在畫面裡', () => {
  const clip = clipOf({ moves: [{ at: 7, dur: 1, actor: 'pig', do: 'hop' }, { at: 7.2, dur: 0.8, actor: 'pig', do: 'shake' }] })
  for (let t = 6; t < 10; t += 0.1) {
    const v = viewAt(clip, t)
    assert.ok(v.x0 <= E.GLYPH.x + 0.01 && v.x1 >= E.GLYPH.x + E.GLYPH.size - 0.01 && v.y0 <= E.GLYPH.y + 0.01 && v.y1 >= E.GLYPH.y + E.GLYPH.size - 0.01, `${t.toFixed(1)} 秒`)
  }
})
