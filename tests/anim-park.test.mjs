import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import fs from 'node:fs'

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
const { glyphAt, glyphPlaceAt, glyphBoxAt, glyphCore, viewAt, cameraAt, castFactor, PARK, GLYPH, GLYPH_MID } = E

/** 國字 3 秒拼好，之後讓位再回來 */
function clipOf(glyph = [], extra = {}) {
  return {
    char: '測', duration: 10,
    bg: { top: '#fff', bottom: '#fff', floor: '#ccc' },
    actors: [{ id: 'pig', emoji: 'hero:pig/idle', x: 20, y: 68, size: 22 }],
    moves: [],
    builds: [{ at: 2, dur: 1, strokes: [0], from: { x: 80, y: 45 }, color: '#f00' }],
    cues: [],
    glyph,
    ...extra,
  }
}
const PARKED = [{ at: 4, dur: 0.5, do: 'park' }, { at: 8, dur: 0.5, do: 'home' }, { at: 9, dur: 0.5, do: 'pulse' }]

test('沒寫 park 的劇本：國字永遠在正中央、1 倍（舊劇本不受影響）', () => {
  const clip = clipOf([{ at: 9, dur: 0.6, do: 'pulse' }])
  for (const t of [0, 3, 5, 9.3]) {
    const g = glyphAt(clip, t)
    assert.equal(g.x, GLYPH_MID.x); assert.equal(g.y, GLYPH_MID.y); assert.equal(g.k, 1)
  }
  assert.deepEqual(glyphCore(clip, 5), glyphCore())
  assert.deepEqual(glyphCore(), { x0: GLYPH.x + 6, x1: GLYPH.x + GLYPH.size - 6, y0: GLYPH.y + 6, y1: GLYPH.y + GLYPH.size - 8 })
})

test('park 縮小移到上方並停住，home 回到正中央；只由 t 決定', () => {
  const clip = clipOf(PARKED)
  assert.deepEqual(glyphPlaceAt(clip, 3.9), { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 })
  const mid = glyphPlaceAt(clip, 4.25)
  assert.ok(mid.k < 1 && mid.k > PARK.k && mid.y < GLYPH_MID.y && mid.y > PARK.y)
  for (const t of [4.5, 6, 7.99]) assert.deepEqual(glyphPlaceAt(clip, t), { x: PARK.x, y: PARK.y, k: PARK.k })
  assert.deepEqual(glyphPlaceAt(clip, 8.6), { x: GLYPH_MID.x, y: GLYPH_MID.y, k: 1 })
  assert.deepEqual(glyphAt(clip, 6.3), glyphAt(clip, 6.3))
  // pulse 疊在讓位上面：回原位後照常
  assert.ok(glyphAt(clip, 9.25).s > 1 && glyphAt(clip, 9.25).k === 1)
})

test('park 可以指定位置與倍率；國字範圍與擋字範圍跟著算', () => {
  const clip = clipOf([{ at: 4, dur: 0.5, do: 'park', to: { x: 30, y: 22 }, amount: 0.5 }])
  const b = glyphBoxAt(clip, 6)
  assert.deepEqual(b, { x0: 30 - 15.75, x1: 30 + 15.75, y0: 22 - 15.75, y1: 22 + 15.75, k: 0.5 })
  const c = glyphCore(clip, 6)
  assert.ok(c.x0 > b.x0 && c.x1 < b.x1 && c.y1 < b.y1)
  assert.ok(Math.abs((c.x1 - c.x0) - (GLYPH.size - 12) * 0.5) < 1e-9)
})

test('讓位以後自動取景可以更靠向在演的角色，但國字整個留在畫面裡', () => {
  // 國字讓到上方以後，角色在右邊演
  const moves = [{ at: 4.6, dur: 0.6, actor: 'pig', do: 'moveTo', to: { x: 128, y: 68 } }, { at: 5.5, dur: 1.5, actor: 'pig', do: 'bounce', amount: 2, times: 4 }]
  const parked = clipOf(PARKED, { moves })
  const home = clipOf([{ at: 9, dur: 0.5, do: 'pulse' }], { moves })
  const midX = (clip, t) => { const v = viewAt(clip, t); return (v.x0 + v.x1) / 2 }
  let further = false
  for (let t = 3.2; t <= 10; t += 0.1) {
    const v = viewAt(parked, t), g = glyphBoxAt(parked, t)
    assert.ok(v.x0 <= g.x0 + 0.01 && v.x1 >= g.x1 - 0.01 && v.y0 <= g.y0 + 0.01 && v.y1 >= g.y1 - 0.01, `${t.toFixed(1)} 秒國字被切掉`)
    assert.ok(midX(home, t) <= 80 + 12.5, `${t.toFixed(1)} 秒沒讓位時鏡頭偏離中間太多`)
    if (t > 5.5 && t < 7 && midX(parked, t) > midX(home, t) + 2) further = true
  }
  assert.ok(further, '讓位後鏡頭應該比沒讓位時更靠向右邊在演的角色')
  assert.ok(cameraAt(parked, 9.8).z < 1.05, '結尾回到全景')
})

test('擋字照國字當下的位置算：讓位後站在中間不算擋住', () => {
  const blocks = (clip, t) => {
    const c = glyphCore(clip, t), a = E.actorsAt(clip, t)[0], half = a.size * a.s * 0.4
    return a.x + half > c.x0 && a.x - half < c.x1 && a.y + half > c.y0 && a.y - half < c.y1
  }
  const moves = [{ at: 4.6, dur: 0.5, actor: 'pig', do: 'moveTo', to: { x: 80, y: 68 } }]
  assert.equal(blocks(clipOf(PARKED, { moves }), 6), false)
  assert.equal(blocks(clipOf([], { moves }), 6), true)
  // 讓位後站中間不會讓角色放大退回
  assert.equal(castFactor(clipOf(PARKED, { moves: [...moves, { at: 7.6, dur: 0.4, actor: 'pig', do: 'moveTo', to: { x: 20, y: 68 } }] })), 1)
})

test('舊版劇本 clips-old 只給試播頁：正式劇本清單、孩子端、iPad 版都不會載入', () => {
  const index = fs.readFileSync(new URL('../src/anim/clips/index.ts', import.meta.url), 'utf8')
  assert.match(index, /import\.meta\.glob<[^>]+>\(\['\.\/\*\.ts', '!\.\/index\.ts'\]\)/)
  const users = ['src/play', 'src/lib', 'src/studio'].flatMap((d) => walk(new URL(`../${d}/`, import.meta.url)))
  for (const f of users) assert.ok(!fs.readFileSync(f, 'utf8').includes('clips-old'), `${f} 不該用到 clips-old`)
  // 每一支舊版都要有對應的正式劇本（重做過才留舊版）
  const old = fs.readdirSync(new URL('../src/anim/clips-old/', import.meta.url))
  for (const f of old) assert.ok(fs.existsSync(new URL(`../src/anim/clips/${f}`, import.meta.url)), `clips-old/${f} 沒有對應的正式劇本`)
})

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(new URL(`${d.name}/`, dir)) : /\.(ts|tsx)$/.test(d.name) ? [new URL(d.name, dir)] : [])
}
