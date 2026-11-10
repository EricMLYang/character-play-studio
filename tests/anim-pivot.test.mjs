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

const { actorsAt, baseActorsAt, lifeOf } = await import('../src/anim/clip.ts')

function clipOf(actor, moves) {
  return {
    char: '測', duration: 10,
    bg: { top: '#fff', bottom: '#fff', floor: '#ccc' },
    actors: [{ id: 'ball', emoji: '⚽', x: 20, y: 71, size: 14, ...actor }],
    moves,
    builds: [{ at: 5, dur: 1, strokes: [0], from: { x: 80, y: 45 }, color: '#f00' }],
    cues: [],
  }
}
const ball = (clip, t) => actorsAt(clip, t).find((a) => a.id === 'ball')

test('沒寫 pivot：旋轉照舊全部以腳底為支點（rc 一直是 0）', () => {
  const clip = clipOf({}, [{ at: 0, dur: 1, actor: 'ball', do: 'rotateTo', amount: 90 }, { at: 1, dur: 1, actor: 'ball', do: 'spin' }])
  for (const t of [0.5, 1, 1.5, 3]) assert.equal(ball(clip, t).rc, 0)
  assert.equal(ball(clip, 1).r, 90)
})

test('角色 pivot: center：rotateTo／spin／tilt 都算進以中心轉的那一部分', () => {
  const clip = clipOf({ pivot: 'center' }, [
    { at: 0, dur: 1, actor: 'ball', do: 'rotateTo', amount: 720 },
    { at: 2, dur: 1, actor: 'ball', do: 'spin', times: 2 },
    { at: 4, dur: 1, actor: 'ball', do: 'tilt', amount: 20 },
  ])
  for (const t of [0.5, 1, 2.5, 4.5]) {
    const b = ball(clip, t)
    assert.ok(Math.abs(b.r - b.rc) < 1e-9, `t=${t} 應該全部以中心轉`)
  }
  assert.equal(ball(clip, 1.5).rc, 720)
})

test('Move 的 pivot 只管那一次，也能蓋過角色的 pivot', () => {
  const hero = clipOf({ emoji: 'hero:pig/idle' }, [
    { at: 0, dur: 1, actor: 'ball', do: 'spin', pivot: 'center' },
    { at: 0, dur: 1, actor: 'ball', do: 'rotateTo', amount: 30 },
  ])
  const h = ball(hero, 0.5)
  assert.ok(h.rc > 0 && h.r - h.rc > 0, '空中轉圈以中心、另一次翻倒以腳底')
  const roll = clipOf({ pivot: 'center' }, [{ at: 0, dur: 1, actor: 'ball', do: 'rotateTo', amount: 90, pivot: 'feet' }])
  assert.equal(ball(roll, 2).rc, 0)
  assert.equal(ball(roll, 2).r, 90)
})

test('以中心轉不影響位置：x／y 跟沒轉的時候一樣（影子、落地、擋字都照原本算）', () => {
  const moves = [{ at: 0, dur: 2, actor: 'ball', do: 'moveTo', to: { x: 120, y: 71 }, ease: 'linear' }]
  const still = clipOf({ pivot: 'center' }, moves)
  const rolling = clipOf({ pivot: 'center' }, [...moves, { at: 0, dur: 2, actor: 'ball', do: 'rotateTo', amount: 720, ease: 'linear' }])
  for (const t of [0.3, 1, 1.7]) {
    const a = baseActorsAt(still, t)[0], b = baseActorsAt(rolling, t)[0]
    assert.equal(b.x, a.x); assert.equal(b.y, a.y); assert.equal(b.size, a.size)
  }
})

test('原地以中心轉過一圈的角色，之後走路還是有步伐', () => {
  const clip = clipOf({ emoji: 'hero:pig/idle', x: 20 }, [
    { at: 0, dur: 0.5, actor: 'ball', do: 'rotateTo', amount: 360, pivot: 'center' },
    { at: 1, dur: 2, actor: 'ball', do: 'moveTo', to: { x: 100, y: 71 } },
  ])
  assert.ok(lifeOf(clip).get('ball').steps.length > 0)
})
