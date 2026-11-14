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
const { glyphAt, glyphPlaceAt, askAt, askFxAt, emptyFrameAt, strokesAt, landings, cameraAt, isV2, PARK, GLYPH_MID } = E
const { PARTS, partColor, PART_COMBOS } = await import('../src/anim/parts.ts')
const { FIXED_LINES } = await import('../shared/voice-lines.mjs')

/** v2：三組筆畫 1～5 秒填進字框，6 秒 home，之後問他 */
function clipOf(extra = {}) {
  return {
    format: 2, char: '測', duration: 13,
    bg: { top: '#fff', bottom: '#fff', floor: '#ccc' },
    actors: [{ id: 'pig', emoji: 'hero:pig/idle', x: 30, y: 68, size: 18 }],
    moves: [],
    builds: [
      { at: 1, dur: 1, strokes: [0, 1], from: 'pig', color: '#f00' },
      { at: 4, dur: 1, strokes: [2], from: { x: 120, y: 70 }, color: '#0f0' },
    ],
    cues: [{ at: 0.8, say: '測' }, { at: 6.1, say: '測' }],
    glyph: [{ at: 6, dur: 0.4, do: 'home' }, { at: 9, dur: 3, do: 'ask', keep: ['pig'] }],
    ...extra,
  }
}

test('v2 的國字從第一格就在讓位的位置，home 才回到正中央；v1 照舊在正中央', () => {
  const clip = clipOf()
  assert.ok(isV2(clip))
  assert.deepEqual(glyphPlaceAt(clip, 0), { x: PARK.x, y: PARK.y, k: PARK.k })
  assert.deepEqual(glyphPlaceAt(clip, 5), { x: PARK.x, y: PARK.y, k: PARK.k })
  assert.deepEqual(glyphPlaceAt(clip, 7), { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 })
  const v1 = { ...clipOf(), format: undefined, glyph: [] }
  assert.deepEqual(glyphPlaceAt(v1, 0), { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 })
})

test('空字框：還沒落定的筆畫才有輪廓，落定時淡掉；第一聲唸字時亮一下；v1 沒有字框', () => {
  const clip = clipOf()
  const at0 = emptyFrameAt(clip, 0, 4)
  assert.deepEqual(at0.strokes.map((s) => s.index), [0, 1, 2, 3])
  assert.equal(at0.glow, 0)
  // 第 3 筆（index 3）沒有任何 build：一直是空的
  const late = emptyFrameAt(clip, 12, 4)
  assert.deepEqual(late.strokes.map((s) => s.index), [3])
  // 每一筆在落定那一刻剛好淡掉
  for (const k of landings(clip)) {
    assert.ok(emptyFrameAt(clip, k.at - 0.3, 4).strokes.some((s) => s.index === k.stroke && s.o === 1))
    assert.ok(!emptyFrameAt(clip, k.at, 4).strokes.some((s) => s.index === k.stroke))
  }
  assert.ok(emptyFrameAt(clip, 0.8 + 0.35, 4).glow > 0.9)
  // 拼好以後唸字不會再亮
  assert.equal(emptyFrameAt(clip, 6.1 + 0.35, 4).glow, 0)
  assert.equal(emptyFrameAt({ ...clip, format: undefined }, 0, 4), null)
})

test('v2 的筆畫落進字框當下的位置，起點照舊從角色身上飛出來', () => {
  const clip = clipOf()
  const centers = [{ x: 60, y: 30 }, { x: 70, y: 40 }, { x: 90, y: 50 }, { x: 100, y: 60 }]
  // 落定後：在國字那層的座標就是自己的中心（播放器再整層跟著國字的位置與大小畫）
  for (const s of strokesAt(clip, 5.5, centers)) { assert.ok(Math.abs(s.dx) < 1e-9 && Math.abs(s.dy) < 1e-9) }
  // 剛出發：換回舞台座標，就在角色身上
  const g = glyphPlaceAt(clip, 1)
  const s0 = strokesAt(clip, 1, centers).find((s) => s.index === 0)
  const stage = { x: g.x + (s0.cx + s0.dx - GLYPH_MID.x) * g.k, y: g.y + (s0.cy + s0.dy - GLYPH_MID.y) * g.k }
  const pig = E.actorsAt(clip, 1).find((a) => a.id === 'pig')
  assert.ok(Math.abs(stage.x - pig.x) < 0.01 && Math.abs(stage.y - pig.y) < 0.01, JSON.stringify({ stage, pig }))
})

test('ask：暗下來、國字回到正中央原本大小、輕輕晃，結束後回到原本的位置', () => {
  const clip = clipOf({ glyph: [{ at: 9, dur: 3, do: 'ask', keep: ['pig'] }] })
  assert.equal(askAt(clip, 8.9), 0)
  assert.equal(askAt(clip, 10.5), 1)
  assert.ok(askAt(clip, 9.1) > 0 && askAt(clip, 9.1) < 1)
  assert.deepEqual(glyphPlaceAt(clip, 10.5), { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 })
  assert.deepEqual(glyphPlaceAt(clip, 12.5), { x: PARK.x, y: PARK.y, k: PARK.k })
  const rs = [9.6, 10, 10.4, 10.8].map((t) => glyphAt(clip, t).r)
  assert.ok(rs.some((r) => Math.abs(r) > 1) && rs.every((r) => Math.abs(r) <= 2.5))
  assert.equal(glyphAt(clip, 12.5).r, 0)
  assert.deepEqual(askFxAt(clip, 10)?.keep, ['pig'])
  assert.equal(askFxAt(clip, 12.5), undefined)
})

test('ask 的時候鏡頭是全景', () => {
  const clip = clipOf({ moves: [{ at: 9.5, dur: 1, actor: 'pig', do: 'moveTo', to: { x: 50, y: 68 } }] })
  const c = cameraAt(clip, 10)
  assert.ok(Math.abs(c.z - (1 + 0.035 * (1 - (-2 * (10 / 13) + 2) ** 2 / 2))) < 1e-6)
  assert.equal(c.px, 0); assert.equal(c.py, 0)
})

test('部件顏色表：常見部件都在、顏色不重複，「貓」的豸、苗查得到；問句是固定句', () => {
  for (const p of '木氵艹口日月火土扌亻女心言足豸田目雨山') assert.ok(PARTS[p], p)
  const colors = Object.values(PARTS).map((p) => p.color)
  assert.equal(new Set(colors).size, colors.length)
  for (const c of colors) assert.match(c, /^#[0-9A-F]{6}$/i)
  assert.deepEqual([...PART_COMBOS.苗], ['艹', '田'])
  assert.equal(partColor('苗'), PARTS.艹.color)
  assert.equal(partColor('犭'), PARTS.豸.color)
  assert.equal(FIXED_LINES.clipAsk, '這是什麼字？')
})

test('ask 可以讓國字偏一邊、縮一點（to／amount），結束後回原位', () => {
  const clip = clipOf({ glyph: [{ at: 9, dur: 3, do: 'ask', to: { x: 96, y: 43 }, amount: 0.82 }] })
  assert.deepEqual(glyphPlaceAt(clip, 10.5), { x: 96, y: 43, k: 0.82 })
  assert.deepEqual(glyphPlaceAt(clip, 12.5), { x: PARK.x, y: PARK.y, k: PARK.k })
})

test('fx 的 scale 以錨點放大；沒寫 scale 跟以前一模一樣', () => {
  const bubble = { at: 1, kind: 'bubble', actor: 'pig', emoji: '🐶', dur: 1 }
  const plain = E.fxAt(clipOf({ fx: [bubble] }), 1.5)[0]
  const big = E.fxAt(clipOf({ fx: [{ ...bubble, scale: 2 }] }), 1.5)[0]
  assert.equal(big.s, plain.s * 2)
  // 錨點（頭頂）到泡泡的距離也放大兩倍
  const head = E.actorsAt(clipOf(), 1.5)[0]
  assert.ok(Math.abs((big.x - head.x) - 2 * (plain.x - head.x)) < 1e-9)
})

test('blow：一串 💨 從 actor 往 target 飛過去', () => {
  const clip = clipOf({
    actors: [{ id: 'cat', emoji: '🐈', x: 100, y: 62, size: 30 }, { id: 'pig', emoji: 'hero:pig/idle', x: 40, y: 68, size: 18 }],
    fx: [{ at: 1, kind: 'blow', actor: 'cat', target: 'pig', dur: 0.6 }],
  })
  const early = E.fxAt(clip, 1.15), late = E.fxAt(clip, 1.45)
  assert.ok(early.length > 0 && early.every((f) => f.emoji === '💨' && f.o <= 1))
  // 越後面越靠近 pig（往左）
  assert.ok(Math.min(...late.map((f) => f.x)) < Math.min(...early.map((f) => f.x)))
  assert.equal(E.fxAt(clip, 1.7).length, 0)
})
